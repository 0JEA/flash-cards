// Scheduler rules from docs/superpowers/specs/2026-10-16-csc370-study-app-design.md (L7-L12).
process.env.TZ = 'America/Edmonton';
const test = require('node:test');
const assert = require('node:assert/strict');
require('../js/log.js');
require('../js/scheduler.js');
const S = globalThis.FC.sched;

const DAY = 86400000;
// Local noon on day n after 2026-01-05 (a fixed local date, so DST never matters here).
const base = new Date(2026, 0, 5, 12, 0, 0).getTime();
const at = (day, minute = 0) => base + day * DAY + minute * 60000;
let n = 0;
const rev = (card, day, ok, sure = 1, minute = n) => ({ i: 'e' + (n++), t: at(day, minute), k: 'r', c: card, ok, s: sure, d: 'x' });

const cards = [{ id: 'a', lecture: 1 }, { id: 'b', lecture: 1 }, { id: 'c', lecture: 2 }];
const today = d => S.dayOf(at(d));

test('a card never answered is new', () => {
  const st = S.states([], cards)['a'];
  assert.equal(st.phase, 'new');
});

test('learning: 3 sure successes on day 0 graduate the card, due next day', () => {
  const ev = [rev('a', 0, 1), rev('a', 0, 1), rev('a', 0, 1)];
  const st = S.states(ev, cards)['a'];
  assert.equal(st.phase, 'review');
  assert.equal(st.step, 0);
  assert.equal(st.due, today(1));
});

test('learning: guessed-correct answers do not count toward the 3', () => {
  const ev = [rev('a', 0, 1, 0), rev('a', 0, 1, 0), rev('a', 0, 1, 1), rev('a', 0, 1, 1)];
  const st = S.states(ev, cards)['a'];
  assert.equal(st.phase, 'learning');
  assert.equal(st.successesToday(today(0)), 2);
});

test('learning: the count restarts on a new day', () => {
  const ev = [rev('a', 0, 1), rev('a', 0, 1), rev('a', 1, 1)];
  const st = S.states(ev, cards)['a'];
  assert.equal(st.phase, 'learning');
  assert.equal(st.successesToday(today(1)), 1);
});

test('review: a sure success on each due day walks the 1, 3, 7 day ladder; step 3 = mastered', () => {
  const ev = [rev('a', 0, 1), rev('a', 0, 1), rev('a', 0, 1),  // graduate, due day 1
    rev('a', 1, 1),   // step 1, due 1+3 = day 4
    rev('a', 4, 1),   // step 2, due 4+7 = day 11
    rev('a', 11, 1)]; // step 3, due 11+14 = day 25
  const st = S.states(ev, cards)['a'];
  assert.equal(st.step, 3);
  assert.equal(st.due, today(25));
  assert.equal(st.mastered, true);
});

test('review: a miss resets to step 0 (due tomorrow); later same-day retries do not change it', () => {
  const ev = [rev('a', 0, 1), rev('a', 0, 1), rev('a', 0, 1), rev('a', 1, 1), // step 1, due day 4
    rev('a', 4, 0), rev('a', 4, 1), rev('a', 4, 1)];
  const st = S.states(ev, cards)['a'];
  assert.equal(st.step, 0);
  assert.equal(st.due, today(5));
  assert.equal(st.mastered, false);
});

test('review: correct but Guess keeps the step and repeats the same interval', () => {
  const ev = [rev('a', 0, 1), rev('a', 0, 1), rev('a', 0, 1), rev('a', 1, 1), // step 1, due day 4
    rev('a', 4, 1, 0)];
  const st = S.states(ev, cards)['a'];
  assert.equal(st.step, 1);
  assert.equal(st.due, today(7));
});

test('exam cap: interval is at most 30% of the days left (and at least 1)', () => {
  const ev = [rev('a', 0, 1), rev('a', 0, 1), rev('a', 0, 1), rev('a', 1, 1), rev('a', 4, 1)]; // step 2 on day 4 wants +7
  const st = S.states(ev, cards, { examDay: today(14) })['a']; // 10 days left -> cap 3
  assert.equal(st.due, today(7));
  const st2 = S.states(ev, cards, { examDay: today(5) })['a']; // 1 day left -> cap 1
  assert.equal(st2.due, today(5));
});

test('a review missed today stays in the queue until answered correctly and sure, even after reload', () => {
  const ev = [rev('a', 0, 1), rev('a', 0, 1), rev('a', 0, 1), rev('a', 1, 0)];
  const st = S.states(ev, cards)['a'];
  assert.equal(st.retryToday(today(1)), true);
  const q = S.buildQueue(S.states(ev, cards), cards, today(1), { newPerDay: 0 });
  assert.deepEqual(q, ['a']);
  const ev2 = ev.concat([rev('a', 1, 1)]);
  assert.equal(S.states(ev2, cards)['a'].retryToday(today(1)), false);
});

test('queue: due cards, then new cards in deck order up to the daily limit (counting new cards started today)', () => {
  const ev = [rev('a', 0, 1)]; // 'a' started today, still learning
  const q = S.buildQueue(S.states(ev, cards), cards, today(0), { newPerDay: 2, shuffle: x => x });
  assert.deepEqual(q, ['a', 'b']); // 'a' due (learning); only 1 new slot left -> 'b'
  const qNext = S.buildQueue(S.states(ev, cards), cards, today(1), { newPerDay: 2, shuffle: x => x });
  assert.deepEqual(qNext, ['a', 'b', 'c']);
});

test('queue: cards not yet due are left out', () => {
  const ev = [rev('a', 0, 1), rev('a', 0, 1), rev('a', 0, 1)]; // due day 1
  const q = S.buildQueue(S.states(ev, cards), cards, today(0), { newPerDay: 0 });
  assert.deepEqual(q, []);
});

test('delayed recall counts only first attempts on cards last seen on an earlier day', () => {
  const ev = [rev('a', 0, 1), rev('a', 0, 1), rev('a', 0, 1), // same-day reps: excluded
    rev('a', 1, 1), rev('a', 1, 1),   // day 1 first attempt right (2nd excluded)
    rev('b', 0, 1), rev('b', 0, 1), rev('b', 0, 1),
    rev('b', 1, 0), rev('b', 1, 1)];  // day 1 first attempt wrong
  const r = S.delayedRecall(ev, today(1), 14);
  assert.deepEqual(r, { right: 1, total: 2 });
});

test('session: a miss or guess comes back 3-5 cards later; a learning success short of 3 comes back 6-10 later', () => {
  const sess = new S.Session(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l'], () => 0);
  assert.equal(sess.next(), 'a');
  sess.record('a', { ok: 0, sure: 1, learningShort: false });
  assert.equal(sess.queue.indexOf('a'), 3); // rng 0 -> minimum gap
  assert.equal(sess.next(), 'b');
  sess.record('b', { ok: 1, sure: 1, learningShort: true });
  assert.equal(sess.queue.indexOf('b'), 6);
  assert.equal(sess.next(), 'c');
  sess.record('c', { ok: 1, sure: 1, learningShort: false });
  assert.equal(sess.queue.includes('c'), false);
});

test('review: a miss from a high step resets all the way to step 0, not one step back', () => {
  const ev = [rev('a', 0, 1), rev('a', 0, 1), rev('a', 0, 1), rev('a', 1, 1), rev('a', 4, 1), // step 2, due day 11
    rev('a', 11, 0)];
  const st = S.states(ev, cards)['a'];
  assert.equal(st.step, 0);
  assert.equal(st.due, today(12));
});

test('mastered needs 3 successful relearning days: 2 is not enough', () => {
  const ev = [rev('a', 0, 1), rev('a', 0, 1), rev('a', 0, 1), rev('a', 1, 1), rev('a', 4, 1)]; // step 2
  assert.equal(S.states(ev, cards)['a'].mastered, false);
});

test('session: a correct Guess is re-asked like a miss (3-5 cards later)', () => {
  const sess = new S.Session(['a', 'b', 'c', 'd', 'e', 'f', 'g'], () => 0);
  sess.record('a', { ok: 1, sure: 0, learningShort: false });
  assert.equal(sess.queue.indexOf('a'), 3);
});

test('a review answered before its due day (a stale device) does not move the schedule', () => {
  const ev = [rev('a', 0, 1), rev('a', 0, 1), rev('a', 0, 1), rev('a', 1, 1), // step 1, due day 4
    rev('a', 2, 1)];                                                        // early: ignored
  const st = S.states(ev, cards)['a'];
  assert.equal(st.step, 1);
  assert.equal(st.due, today(4));
});

test('a re-ask just after midnight is not the next day\'s review (needs 6+ hours since the last attempt)', () => {
  // Day 3 at 23:58 miss (due day 3 after a graduation on day 2), re-asked 4 minutes later = day 4 00:02.
  const late = (d, h, m) => base + d * DAY + (h - 12) * 3600000 + m * 60000;
  const ev = [rev('a', 2, 1), rev('a', 2, 1), rev('a', 2, 1),
    { i: 'm1', t: late(3, 23, 58), k: 'r', c: 'a', ok: 0, s: 1, d: 'x' },
    { i: 'm2', t: late(4, 0, 2), k: 'r', c: 'a', ok: 1, s: 1, d: 'x' }];
  const st = S.states(ev, cards)['a'];
  assert.equal(st.step, 0);                         // the 00:02 retry did not promote it
  assert.deepEqual(S.delayedRecall(ev, today(4), 14), { right: 0, total: 1 });
});

test('queue: the whole session (new cards too) goes through the shuffle', () => {
  const q = S.buildQueue(S.states([], cards), cards, today(0), { newPerDay: 10, shuffle: x => x.slice().reverse() });
  assert.deepEqual(q, ['c', 'b', 'a']);
});
