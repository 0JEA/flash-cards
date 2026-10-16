// Scheduling, as pure functions over the event log. Rules and the papers behind
// them: docs/superpowers/specs/2026-10-16-csc370-study-app-design.md (L7-L12).
(function (FC) {
  'use strict';

  const DAY = 86400000;
  // Relearning gaps in days, indexed by step (Cepeda 2006/2008; expanding, err long).
  const INTERVALS = [1, 3, 7, 14, 30, 60, 120];
  const LEARN_CRITERION = 3;  // correct + sure answers on the first day (Rawson & Dunlosky 2011)
  const MASTERED_STEP = 3;    // three successful relearning days
  const EXAM_FRACTION = 0.3;  // gap <= 30% of days left (Cepeda 2008: 20-40% for short horizons)
  // An attempt only counts as a fresh review (and as delayed recall) if it comes at least
  // this long after the card's previous attempt. Stops a re-ask at 00:02 after a miss at
  // 23:58 from counting as "the next day's" review.
  const MIN_REVIEW_GAP = 6 * 3600000;

  // Local calendar day number, so "today" flips at the learner's midnight.
  function dayOf(t) {
    const offset = new Date(t).getTimezoneOffset() * 60000;
    return Math.floor((t - offset) / DAY);
  }

  function interval(step, day, examDay) {
    let gap = INTERVALS[Math.min(step, INTERVALS.length - 1)];
    if (examDay != null && examDay > day) {
      gap = Math.min(gap, Math.max(1, Math.round(EXAM_FRACTION * (examDay - day))));
    }
    return gap;
  }

  const success = ev => ev.ok === 1 && ev.s === 1;

  // Replay one card's review events (sorted by time) into its current state.
  function replay(evs, examDay) {
    const st = { phase: 'new', step: 0, due: null, firstDay: null, lastDay: null, byDay: new Map() };
    const gapBefore = new Map(evs.map((ev, k) => [ev, k ? ev.t - evs[k - 1].t : Infinity]));
    for (const ev of evs) {
      const day = dayOf(ev.t);
      if (!st.byDay.has(day)) st.byDay.set(day, []);
      st.byDay.get(day).push(ev);
    }
    for (const [day, list] of st.byDay) {
      if (st.firstDay === null) st.firstDay = day;
      st.lastDay = day;
      if (st.phase === 'new') st.phase = 'learning';
      if (st.phase === 'learning') {
        let wins = 0;
        for (const ev of list) {
          if (success(ev) && ++wins >= LEARN_CRITERION) {
            st.phase = 'review';
            st.step = 0;
            st.due = day + interval(0, day, examDay);
            break;
          }
        }
        continue; // learning cards are always due until they graduate
      }
      // Review: the day's first attempt decides the outcome (L9). Ignored when the card
      // was not due yet (a stale device asked it early) or when it is a quick re-ask
      // rather than a delayed review (see MIN_REVIEW_GAP).
      if (day < st.due) continue;
      const first = list.find(ev => gapBefore.get(ev) >= MIN_REVIEW_GAP);
      if (!first) continue;
      if (success(first)) st.step = Math.min(st.step + 1, INTERVALS.length - 1);
      else if (first.ok !== 1) st.step = 0;
      // correct but Guess: step unchanged
      st.due = day + interval(st.step, day, examDay);
    }
    st.mastered = st.phase === 'review' && st.step >= MASTERED_STEP;
    st.successesToday = today => (st.byDay.get(today) || []).filter(success).length;
    // A review missed (or guessed) today must be re-asked until answered correctly and sure,
    // even if the page reloads. True if today's last attempt was not a success.
    st.retryToday = today => {
      if (st.phase !== 'review') return false;
      const list = st.byDay.get(today);
      return !!list && !success(list[list.length - 1]);
    };
    st.isDue = today => st.phase === 'learning' || (st.phase === 'review' && (st.due <= today || st.retryToday(today)));
    return st;
  }

  // State for every card id in `cards`, from review events.
  function states(events, cards, opts = {}) {
    const per = new Map(cards.map(c => [c.id, []]));
    for (const ev of events) {
      if (ev.k === 'r' && per.has(ev.c)) per.get(ev.c).push(ev);
    }
    const out = {};
    for (const [id, evs] of per) {
      evs.sort((a, b) => a.t - b.t);
      out[id] = replay(evs, opts.examDay);
    }
    return out;
  }

  function shuffled(arr, rng = Math.random) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Today's queue: due cards (shuffled, L11), then new cards in deck order up to the
  // daily limit, counting new cards already started today.
  function buildQueue(sts, cards, today, opts = {}) {
    const newPerDay = opts.newPerDay ?? 10;
    const shuffle = opts.shuffle || shuffled;
    const due = cards.filter(c => sts[c.id].isDue(today)).map(c => c.id);
    const startedToday = cards.filter(c => sts[c.id].firstDay === today).length;
    const fresh = cards.filter(c => sts[c.id].phase === 'new')
      .slice(0, Math.max(0, newPerDay - startedToday)).map(c => c.id);
    return shuffle(due).concat(fresh);
  }

  // Delayed recall (L12): per card per day, the first attempt made at least
  // MIN_REVIEW_GAP after the card's previous attempt; over the `window` days ending today.
  function delayedRecall(events, today, window = 14) {
    const lastT = new Map();
    const counted = new Set();
    let right = 0, total = 0;
    const sorted = events.filter(e => e.k === 'r').sort((a, b) => a.t - b.t);
    for (const ev of sorted) {
      const day = dayOf(ev.t);
      const prev = lastT.get(ev.c);
      const key = ev.c + '@' + day;
      if (prev !== undefined && ev.t - prev >= MIN_REVIEW_GAP && !counted.has(key)) {
        counted.add(key);
        if (day > today - window && day <= today) { total++; if (ev.ok === 1) right++; }
      }
      lastT.set(ev.c, ev.t);
    }
    return { right, total };
  }

  // In-session re-asking (L7): a miss or guess returns 3-5 cards later; a learning card
  // that has not reached its 3 successes today returns 6-10 cards later.
  class Session {
    constructor(queue, rng = Math.random) {
      this.queue = queue.slice();
      this.rng = rng;
      this.done = 0;
    }
    next() { return this.queue[0]; }
    get remaining() { return this.queue.length; }
    reinsert(id, min, max) {
      const gap = min + Math.floor(this.rng() * (max - min + 1));
      this.queue.splice(Math.min(gap, this.queue.length), 0, id);
    }
    // outcome: { ok, sure, learningShort } where learningShort = still learning and
    // fewer than 3 successes today after this answer.
    record(id, outcome) {
      if (this.queue[0] === id) this.queue.shift();
      else { const k = this.queue.indexOf(id); if (k >= 0) this.queue.splice(k, 1); }
      if (!outcome.ok || !outcome.sure) this.reinsert(id, 3, 5);
      else if (outcome.learningShort) this.reinsert(id, 6, 10);
      else this.done++;
    }
  }

  FC.sched = { DAY, INTERVALS, LEARN_CRITERION, MASTERED_STEP, dayOf, interval, states, buildQueue, delayedRecall, shuffled, Session };
})(globalThis.FC = globalThis.FC || {});
