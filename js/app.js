// UI controller: Classes (launch), Class (topic toggles), Mix, Study, Settings.
// All card text goes through textContent (never innerHTML): the page holds a GitHub token.
(function (FC) {
  'use strict';

  const { log, sched, grade } = FC;
  const $ = id => document.getElementById(id);
  // Every class the app knows, in launch-list order. A deck file that failed to load is skipped.
  const DECKS = ['csc370', 'csc310', 'softtest', 'ethics'].map(id => FC.decks[id]).filter(Boolean);
  const deckById = new Map(DECKS.map(d => [d.id, d]));

  // ── State ──────────────────────────────────────────────────────────────
  let events = log.load();
  const SETTINGS_KEY = 'fc.settings', TOKEN_KEY = 'fc.token';
  const store = log._store();
  let settings = Object.assign({ newLimit: 'all', minutes: 20, exams: {}, off: {}, view: {}, focus: {}, mix: { total: 30, pct: {} } }, readJSON(SETTINGS_KEY));
  settings.view = settings.view || {}; settings.focus = settings.focus || {};
  // v2 (2026-10-16): sessions draw from every card (repeats go to the end of the session)
  // and are bounded by time instead; the old 20-new-cards default made the same 20 cycle.
  if (!settings.v || settings.v < 2) { settings.newLimit = 'all'; settings.v = 2; store.setItem(SETTINGS_KEY, JSON.stringify(settings)); }
  // Older settings (single class): carry the exam date over to CSC 370.
  if (settings.examDate && !settings.exams.csc370) settings.exams.csc370 = settings.examDate;
  delete settings.examDate; delete settings.newPerDay;
  let session = null;   // sched.Session plus bookkeeping
  let current = null;   // { card, pending } for the card on screen
  let openDeck = DECKS[0] ? DECKS[0].id : null;
  const expanded = new Map(); // class id -> set of topic groups showing their subgroups

  function readJSON(key) { try { return JSON.parse(store.getItem(key)) || {}; } catch (e) { return {}; } }
  function saveSettings() { store.setItem(SETTINGS_KEY, JSON.stringify(settings)); }
  const newLimit = () => (settings.newLimit === 'all' ? 1e9 : +settings.newLimit || 20);
  const minutesLimit = () => (settings.minutes === 'none' ? Infinity : +settings.minutes || 20);

  // DOM helper: h('div', { class: 'x', onclick }, 'text', child)
  // Card text with inline math: $...$ is rendered by KaTeX (vendor/katex), everything else
  // stays a plain text node. KaTeX builds its own escaped markup (trust: false), so card
  // text is never parsed as HTML. \$ is a literal dollar sign.
  // Only for classes whose deck sets `math: true` (elsewhere "$50 … $100" is money).
  let mathOn = false;
  function math(text) {
    const t = String(text);
    if (!mathOn) return [t];
    if (!window.katex || !/(^|[^\\])\$/.test(t)) return [t.replace(/\\\$/g, '$')];
    const out = [];
    let last = 0;
    for (const m of t.matchAll(/(?<!\\)\$(.+?)(?<!\\)\$/g)) {
      if (m.index > last) out.push(t.slice(last, m.index).replace(/\\\$/g, '$'));
      const span = document.createElement('span');
      katex.render(m[1], span, { throwOnError: false, trust: false, output: 'html' });
      out.push(span);
      last = m.index + m[0].length;
    }
    if (last < t.length) out.push(t.slice(last).replace(/\\\$/g, '$'));
    return out;
  }

  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else if (k === 'class') el.className = v;
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (const kid of kids.flat()) {
      if (kid == null || kid === false) continue;
      el.append(kid instanceof Node ? kid : document.createTextNode(String(kid)));
    }
    return el;
  }

  const today = () => sched.dayOf(Date.now());
  function examDay(deckId) {
    const date = settings.exams[deckId];
    if (!date) return null;
    const [y, m, d] = date.split('-').map(Number);
    return sched.dayOf(new Date(y, m - 1, d, 12).getTime());
  }

  // ── Cards ──────────────────────────────────────────────────────────────
  // CSC 370 lecture blanks become "fill the blank" cards. Answers come from
  // decks/csc370-blank-answers.js (each labelled with where it came from), questions from
  // decks/csc370-blank-questions.js; an answer the owner typed in an older version wins.
  const BASIS = {
    slides: 'from her own slides/tests',
    sebesta: 'from Sebesta, the course textbook (not her slide)',
    history: 'historical fact (not her slide)',
    inferred: 'best guess: check it against your class notes',
  };
  function blankCards(deck) {
    if (!deck.blanks || !deck.blanks.length) return [];
    const mine = log.blankAnswers(events);
    const supplied = FC.blankAnswers || {}, questions = FC.blankQuestions || {};
    const groups = FC.blankGroups || [], asks = FC.blankAsk || {};
    const grouped = new Set(groups.flatMap(g => g.ids));
    const byId = new Map(deck.blanks.map(b => [b.id, b]));
    const retiredIds = new Set(FC.blankRetired || []);
    const groupCards = groups.filter(g => byId.has(g.ids[0]) && !g.ids.every(id => retiredIds.has(id))).map(g => {
      const first = byId.get(g.ids[0]);
      return {
        id: 'blank:' + g.ids[0], lecture: first.lecture, blankRef: first, type: 'recall', blank: true, prompt: g.ask,
        answer: g.answer, points: g.points || [g.answer], basis: g.basis, why: g.note || '',
        source: `Lecture ${first.lecture}, slide ${first.slide} · ` + (BASIS[g.basis] || 'supplied'),
      };
    });
    const retired = new Set(FC.blankRetired || []);
    return groupCards.concat(deck.blanks.filter(b => !grouped.has(b.id) && !retired.has(b.id) && (mine[b.id] || supplied[b.id])).map(b => {
      const own = mine[b.id], sup = supplied[b.id] || {}, q = questions[b.id];
      const answer = own || (q && q.answer) || sup.answer;
      return {
        id: 'blank:' + b.id, lecture: b.lecture, blankRef: b, type: 'recall', blank: true,
        prompt: (q && q.ask) || asks[b.id] || b.prompt,
        answer, points: [answer], basis: own ? 'mine' : sup.basis,
        why: own ? '' : (sup.note || ''),
        source: `Lecture ${b.lecture}, slide ${b.slide} · ` + (own ? 'your own answer' : BASIS[sup.basis] || 'supplied'),
      };
    }));
  }

  // All of a class's cards, each tagged with its deck and topic (cat / sub), in lecture order.
  const cardCache = new Map();
  function cardsFor(deckId) {
    const deck = deckById.get(deckId);
    const key = deckId + ':' + events.length;
    if (cardCache.has(key)) return cardCache.get(key);
    const rank = new Map(deck.lectures.map((l, i) => [l.n, i]));
    const topic = FC.topics && FC.topics[deckId];
    const gens = FC.gen ? FC.gen.forDeck(deckId).map(FC.gen.asCard) : [];
    const cards = blankCards(deck).concat(deck.cards, gens)
      .map((c, i) => [c, i])
      .sort((a, b) => (rank.get(a[0].lecture) ?? 99) - (rank.get(b[0].lecture) ?? 99) || a[1] - b[1])
      .map(([c]) => Object.assign({}, c, { deck: deckId },
        c.generator ? { cat: c.cat, sub: c.sub } : topic ? topic(c) : { cat: c.cat || 'General', sub: c.sub || 'General' }));
    cardCache.set(key, cards);
    return cards;
  }

  // Topic toggles: settings.off[deckId] lists switched-off "cat" or "cat/sub" keys.
  const offSet = deckId => new Set(settings.off[deckId] || []);
  const isOn = (off, c) => !off.has(c.cat) && !off.has(c.cat + '/' + c.sub) && !off.has('L:' + c.lecture);
  // Exam mode: within 7 days of a class's exam date, History is left out (exam-format
  // practice first, research/04 rule 25) unless it was switched back on for the exam.
  const EXAM_WEEK = 7;
  function examMode(deckId) { const ed = examDay(deckId); return ed != null && ed >= today() && ed - today() <= EXAM_WEEK; }
  const activeCards = deckId => {
    const off = offSet(deckId);
    if (examMode(deckId) && !(settings.examHistory || {})[deckId]) for (const cat of ['History', 'History & stories']) off.add(cat);
    const focus = settings.focus[deckId];
    return cardsFor(deckId).filter(c => isOn(off, c) && (!focus || (c.assignment || []).includes(focus)));
  };

  // Card states, each class with its own exam date.
  function statesFor(cards) {
    const out = {};
    const byDeck = new Map();
    for (const c of cards) { if (!byDeck.has(c.deck)) byDeck.set(c.deck, []); byDeck.get(c.deck).push(c); }
    for (const [deckId, list] of byDeck) Object.assign(out, sched.states(events, list, { examDay: examDay(deckId) }));
    return out;
  }
  function queueFor(cards, sts, opts) { return sched.buildQueue(sts, cards, today(), Object.assign({ newPerDay: newLimit() }, opts)); }

  function counts(cards) {
    const sts = statesFor(cards);
    const q = queueFor(cards, sts, { shuffle: x => x });
    const review = q.filter(id => sts[id].phase !== 'new').length;
    return { review, learn: q.length - review, total: cards.length,
      mastered: cards.filter(c => sts[c.id].mastered).length,
      started: cards.filter(c => sts[c.id].phase !== 'new' && !sts[c.id].mastered).length, sts };
  }

  // ── Navigation ─────────────────────────────────────────────────────────
  const screens = ['classes', 'class', 'mix', 'study', 'done', 'settings'];
  function show(name) {
    document.body.classList.remove('studying');
    if (name !== 'study' && session) endSession(false);
    for (const s of screens) $('screen-' + s).hidden = s !== name;
    $('screen-help').hidden = true;
    document.querySelectorAll('.navbtn').forEach(b => b.setAttribute('aria-current', b.dataset.nav === name ? 'page' : 'false'));
    if (name === 'classes') renderClasses();
    if (name === 'class') renderClass();
    if (name === 'mix') renderMix();
    if (name === 'settings') renderSettings();
  }
  document.querySelectorAll('[data-nav]').forEach(b => b.addEventListener('click', () => show(b.dataset.nav)));

  function bar(mastered, started, total) {
    const pct = n => total ? (100 * n / total) + '%' : '0%';
    return h('div', { class: 'bar', role: 'img', 'aria-label': `${mastered} mastered, ${started} started, of ${total} cards` },
      h('i', { class: 'm', style: `width:${pct(mastered)}` }), h('i', { class: 'l', style: `width:${pct(started)}` }));
  }

  // ── Classes (launch screen) ────────────────────────────────────────────
  function renderClasses() {
    const list = $('classList');
    list.replaceChildren(...DECKS.map(d => {
      const k = counts(activeCards(d.id));
      return h('button', { class: 'class-row', onclick: () => { openDeck = d.id; show('class'); } },
        h('div', { class: 'class-title' }, d.title),
        h('div', { class: 'class-sub' }, `${k.review} to review · ${k.learn} to learn · ${k.total} cards`),
        bar(k.mastered, k.started, k.total));
    }));
    // Calibration (research/04 rule 17): of the answers marked Sure on cards seen on an
    // earlier day, how many were right? Overconfidence means stopping practice too early.
    const firstOfDay = new Map(), lastSeen = new Map(); let sureRight = 0, sureTotal = 0;
    for (const ev of events.filter(e => e.k === 'r').sort((a, b) => a.t - b.t)) {
      const day = sched.dayOf(ev.t), prev = lastSeen.get(ev.c), key = ev.c + '@' + day;
      if (prev != null && prev < day && !firstOfDay.has(key) && ev.s === 1) { sureTotal++; if (ev.ok === 1) sureRight++; }
      firstOfDay.set(key, true); lastSeen.set(ev.c, day);
    }
    $('honesty').textContent = sureTotal >= 5
      ? `When you said Sure on a card from an earlier day, you were right ${Math.round(100 * sureRight / sureTotal)}% of the time (${sureRight}/${sureTotal}).`
      : 'Your “Sure” accuracy shows here once you have reviewed cards on a second day.';
    const r = sched.delayedRecall(events, today(), 14);
    $('recallPct').textContent = r.total ? Math.round(100 * r.right / r.total) + '%' : '—';
    $('recallNote').textContent = r.total
      ? `You got ${r.right} of ${r.total} right when a card came back hours or days later`
      : 'Starts tomorrow: it counts how many cards you still remember when they come back.';
  }

  // ── Class screen: topic toggles, then Study ────────────────────────────
  function renderClass() {
    const d = deckById.get(openDeck);
    $('classTitle').textContent = d.title;
    const all = cardsFor(d.id), off = offSet(d.id);
    const k = counts(activeCards(d.id));
    $('dueCount').textContent = k.review;
    $('newCount').textContent = k.learn;
    $('studyBtn').disabled = k.review + k.learn === 0;
    $('studyNote').textContent = k.review + k.learn ? ''
      : k.total === 0 ? 'Every topic is switched off.' : 'Nothing left for today with these topics.';
    $('examDate').value = settings.exams[d.id] || '';
    $('newLimit').value = String(settings.newLimit);
    $('sessionMinutes').value = String(settings.minutes);
    const ed = examDay(d.id);
    $('examBanner').textContent = examMode(d.id)
      ? `Exam in ${ed - today()} day${ed - today() === 1 ? '' : 's'}: exam mode. Review gaps are capped to fit, and History is left out (switch it on to include it).`
      : ed != null && ed > today() ? `Exam in ${ed - today()} days: review gaps are capped so everything comes back before it.` : '';
    $('examBanner').hidden = !$('examBanner').textContent;

    // Group by topic, lecture, or assignment.
    const hasAssignments = (d.assignments || []).some(a => all.some(c => (c.assignment || []).includes(a.id)));
    let view = settings.view[d.id] || 'topic';
    if (view === 'assignment' && !hasAssignments) view = 'topic';
    document.querySelectorAll('#viewSwitch button').forEach(b => {
      b.setAttribute('aria-pressed', String(b.dataset.view === view));
      b.hidden = b.dataset.view === 'assignment' && !hasAssignments;
    });
    const tree = $('topicTree');
    if (view === 'lecture') {
      $('viewHint').textContent = 'Switch lectures on or off.';
      tree.replaceChildren(...d.lectures.filter(l => all.some(c => c.lecture === l.n)).map(l => {
        const n = all.filter(c => c.lecture === l.n).length, on = !off.has('L:' + l.n);
        return h('div', { class: 'topic' }, h('label', { class: 'topic-head' },
          h('input', { type: 'checkbox', checked: on, onchange: e => toggle(d.id, 'L:' + l.n, e.target.checked) }),
          h('span', null, l.title), h('span', { class: 'muted' }, ` ${n}`)));
      }));
      return;
    }
    if (view === 'assignment') {
      const focus = settings.focus[d.id] || '';
      $('viewHint').textContent = 'Pick an assignment to study only the concepts it needs. Your answers to the assignment itself are not on any card.';
      const rows = [{ id: '', title: 'All cards', n: all.length }].concat(d.assignments.map(a => ({ id: a.id, title: a.title, n: all.filter(c => (c.assignment || []).includes(a.id)).length })));
      tree.replaceChildren(...rows.filter(r => r.n).map(r => h('div', { class: 'topic' }, h('label', { class: 'topic-head' },
        h('input', { type: 'radio', name: 'focus', checked: focus === r.id, onchange: () => { settings.focus[d.id] = r.id || null; saveSettings(); renderClass(); } }),
        h('span', null, r.title), h('span', { class: 'muted' }, ` ${r.n}`)))));
      return;
    }
    $('viewHint').textContent = 'Switch topics on or off. Open a topic to pick its parts.';
    // Topics in the deck's preferred order, each with its subgroups as chips.
    const order = (FC.topics && FC.topics[d.id + 'Order']) || d.catOrder || [];
    const cats = [...new Set(order.concat(all.map(c => c.cat)))].filter(cat => all.some(c => c.cat === cat));
    // Few subgroups: show every chip. Many (Software Testing has ~90): groups start
    // collapsed so the screen still fits, and you open the one you want to fine-tune.
    const totalSubs = new Set(all.map(c => c.cat + '/' + c.sub)).size;
    if (!expanded.has(d.id)) expanded.set(d.id, new Set(totalSubs <= 30 ? cats : []));
    const open = expanded.get(d.id);
    tree.replaceChildren(...cats.map(cat => {
      const inCat = all.filter(c => c.cat === cat);
      const subOrder = (FC.topics && FC.topics[d.id + 'SubOrder']) || d.subOrder || [];
      const rankOf = sub => { const i = subOrder.indexOf(sub); return i < 0 ? 999 : i; };
      const subs = [...new Set(inCat.map(c => c.sub))].sort((a, b) => rankOf(a) - rankOf(b));
      const catOn = !off.has(cat);
      const isOpen = open.has(cat);
      const offSubs = subs.filter(sub => off.has(cat + '/' + sub)).length;
      return h('div', { class: 'topic' },
        h('div', { class: 'topic-row' },
          h('label', { class: 'topic-head' },
            h('input', { type: 'checkbox', checked: catOn, onchange: e => toggle(d.id, cat, e.target.checked) }),
            h('span', null, cat), h('span', { class: 'muted' }, ` ${inCat.length}`)),
          h('button', { class: 'linkbtn expand', 'aria-expanded': String(isOpen),
            onclick: () => { if (isOpen) open.delete(cat); else open.add(cat); renderClass(); } },
            `${subs.length} topics${offSubs ? ` (${offSubs} off)` : ''} ${isOpen ? '▾' : '▸'}`)),
        isOpen && h('div', { class: 'chips' }, subs.map(sub => {
          const on = catOn && !off.has(cat + '/' + sub);
          return h('button', { class: 'chip', 'aria-pressed': String(on), disabled: !catOn,
            onclick: () => toggle(d.id, cat + '/' + sub, !on) }, sub, h('span', { class: 'n' }, ` ${inCat.filter(c => c.sub === sub).length}`));
        })));
    }));
  }
  function toggle(deckId, key, on) {
    if (examMode(deckId) && /^History/.test(key)) { settings.examHistory = Object.assign({}, settings.examHistory, { [deckId]: on }); }
    const off = offSet(deckId);
    if (on) off.delete(key); else off.add(key);
    settings.off[deckId] = [...off];
    saveSettings();
    renderClass();
  }
  $('examDate').addEventListener('change', e => { settings.exams[openDeck] = e.target.value; saveSettings(); renderClass(); });
  document.querySelectorAll('#viewSwitch button').forEach(b => b.addEventListener('click', () => { settings.view[openDeck] = b.dataset.view; saveSettings(); renderClass(); }));
  $('newLimit').addEventListener('change', e => { settings.newLimit = e.target.value === 'all' ? 'all' : +e.target.value; saveSettings(); renderClass(); });
  $('sessionMinutes').addEventListener('change', e => { settings.minutes = e.target.value === 'none' ? 'none' : +e.target.value; saveSettings(); });
  $('studyBtn').addEventListener('click', () => withSync($('studyBtn'), () => startSession(activeCards(openDeck))));

  // ── Mix: cards from several classes, by percentage ─────────────────────
  function mixPct() {
    const pct = Object.assign({}, settings.mix.pct);
    for (const d of DECKS) if (pct[d.id] == null) pct[d.id] = Math.round(100 / DECKS.length);
    return pct;
  }
  function renderMix() {
    $('mixTotal').value = settings.mix.total;
    const pct = mixPct();
    const sum = DECKS.reduce((t, d) => t + (+pct[d.id] || 0), 0);
    $('mixRows').replaceChildren(...DECKS.map(d => {
      const k = counts(activeCards(d.id));
      return h('div', { class: 'mix-row' },
        h('label', { for: 'mix-' + d.id }, d.title, h('span', { class: 'muted' }, ` · ${k.review + k.learn} available`)),
        h('div', { class: 'mix-input' },
          h('input', { type: 'number', id: 'mix-' + d.id, min: '0', max: '100', step: '5', inputmode: 'numeric', value: String(pct[d.id]),
            onchange: e => { settings.mix.pct = Object.assign(mixPct(), { [d.id]: Math.max(0, Math.min(100, +e.target.value || 0)) }); saveSettings(); renderMix(); } }),
          h('span', null, '%')));
    }));
    $('mixSum').textContent = sum === 100 ? 'Adds up to 100%.' : `Adds up to ${sum}%: the split is scaled to 100%.`;
    $('mixStart').disabled = sum === 0 || settings.mix.total < 1;
  }
  $('mixTotal').addEventListener('change', e => { settings.mix.total = Math.max(1, Math.min(500, Math.round(+e.target.value || 0))); saveSettings(); renderMix(); });
  $('mixStart').addEventListener('click', () => withSync($('mixStart'), () => {
    // Each class's share of the total, from its own queue (due cards come first, then new),
    // after its topic toggles. Classes with fewer cards than their share give what they have.
    const pct = mixPct();
    const sum = DECKS.reduce((t, d) => t + (+pct[d.id] || 0), 0) || 1;
    const picked = [];
    for (const d of DECKS) {
      const want = Math.round(settings.mix.total * (+pct[d.id] || 0) / sum);
      if (!want) continue;
      const cards = activeCards(d.id), sts = statesFor(cards);
      const q = queueFor(cards, sts, { newPerDay: 1e9, shuffle: x => x });
      const due = q.filter(id => sts[id].phase !== 'new');
      const fresh = sched.shuffled(q.filter(id => sts[id].phase === 'new'));
      const take = sched.shuffled(due).concat(fresh).slice(0, want);
      const byId = new Map(cards.map(c => [c.id, c]));
      picked.push(...take.map(id => byId.get(id)));
    }
    startSession(picked, { queue: sched.shuffled(picked.map(c => c.id)) });
  }));

  // Pull first, so a card another device already reviewed today is not asked again.
  async function withSync(btn, go) {
    if (store.getItem(TOKEN_KEY)) {
      const label = btn.textContent;
      btn.disabled = true; btn.textContent = 'Syncing…';
      await Promise.race([syncNow(), new Promise(r => setTimeout(r, 5000))]); // offline: study anyway
      btn.textContent = label; btn.disabled = false;
    }
    go();
  }

  // ── Study ──────────────────────────────────────────────────────────────
  $('endBtn').addEventListener('click', () => endSession(true));
  // ── Help: a worked walkthrough for the current card (decks/*-help.js) ──
  // Opening it before answering counts the card as not known, so it comes back later and
  // still has to be recalled: Help teaches, it doesn't replace the retrieval.
  const helpMath = t => { const was = mathOn; mathOn = true; try { return math(t); } finally { mathOn = was; } };
  const SVG = 'http://www.w3.org/2000/svg';
  const s = (tag, attrs) => { const el = document.createElementNS(SVG, tag); for (const [k, v] of Object.entries(attrs || {})) el.setAttribute(k, v); return el; };

  function niceStep(span) {
    const raw = span / 5, p = 10 ** Math.floor(Math.log10(raw)), m = raw / p;
    return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p;
  }
  const fmt = v => Math.abs(v) >= 1e6 ? v.toExponential(0).replace('+', '') : String(+v.toPrecision(6));

  function plot(g, compact) {
    const W = 640, H = compact ? 260 : 344, L = compact ? 70 : 52, R = 14, T = 16, B = compact ? 56 : 48;
    const [x0, x1] = g.x;
    const xs = Array.from({ length: 241 }, (_, i) => x0 + (x1 - x0) * i / 240);
    const curves = (g.curves || []).map(c => ({ ...c, pts: xs.map(x => [x, c.f(x)]) }));
    const bars = g.bars ? g.bars.values : [];
    let [y0, y1] = g.y || [0, 0];
    if (!g.y) {
      const ys = curves.flatMap(c => c.pts.map(p => p[1])).concat(bars.map(b => b[1])).filter(Number.isFinite);
      y0 = g.logY ? Math.min(...ys.filter(v => v > 0)) : Math.min(0, ...ys);
      y1 = Math.max(...ys) * 1.05;
    }
    const ty = v => g.logY ? Math.log10(Math.max(v, 1e-300)) : v;
    const ly0 = ty(y0), ly1 = ty(y1);
    const sx = x => L + (x - x0) / (x1 - x0) * (W - L - R);
    const sy = y => T + (1 - (ty(y) - ly0) / (ly1 - ly0)) * (H - T - B);
    const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': g.caption || 'graph' });
    const clip = 'c' + Math.random().toString(36).slice(2);
    const defs = s('defs'); const cp = s('clipPath', { id: clip }); cp.append(s('rect', { x: L, y: T, width: W - L - R, height: H - T - B })); defs.append(cp); svg.append(defs);
    if (g.from != null) svg.append(s('rect', { class: 'shade', x: sx(g.from), y: T, width: Math.max(0, sx(x1) - sx(g.from)), height: H - T - B }));
    // grid + ticks
    const xstep = niceStep(x1 - x0);
    for (let v = Math.ceil(x0 / xstep) * xstep; v <= x1 + 1e-9; v += xstep) {
      svg.append(s('line', { class: 'grid', x1: sx(v), x2: sx(v), y1: T, y2: H - B }));
      const t = s('text', { x: sx(v), y: H - B + (compact ? 26 : 18), 'text-anchor': 'middle' }); t.textContent = fmt(v); svg.append(t);
    }
    const yticks = [];
    if (g.logY) for (let e = Math.ceil(ly0); e <= Math.floor(ly1); e++) yticks.push(10 ** e);
    else { const st = niceStep(y1 - y0); for (let v = Math.ceil(y0 / st) * st; v <= y1 + 1e-9; v += st) yticks.push(v); }
    const sup = e => String(e).replace(/-/g, '⁻').replace(/\d/g, d => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d]);
    for (const v of yticks) {
      svg.append(s('line', { class: 'grid', x1: L, x2: W - R, y1: sy(v), y2: sy(v) }));
      const e = Math.round(Math.log10(v));
      const t = s('text', { x: L - 6, y: sy(v) + (compact ? 7 : 4), 'text-anchor': 'end' });
      t.textContent = g.logY && Math.abs(e) >= 3 ? '10' + sup(e) : fmt(v); svg.append(t);
    }
    svg.append(s('line', { class: 'axis', x1: L, x2: W - R, y1: H - B, y2: H - B }), s('line', { class: 'axis', x1: L, x2: L, y1: T, y2: H - B }));
    if (g.xLabel) { const t = s('text', { x: W - R, y: H - 4, 'text-anchor': 'end' }); t.textContent = g.xLabel; svg.append(t); }
    if (g.yLabel) { const t = s('text', { x: L + 6, y: T + 2 }); t.textContent = g.yLabel; svg.append(t); }
    const plotArea = s('g', { 'clip-path': `url(#${clip})` });
    if (bars.length) {
      const gaps = bars.map(b => b[0]).sort((a, b) => a - b).map((v, i, a) => i ? v - a[i - 1] : Infinity);
      const bw = Math.max(2, (sx(x0 + Math.min(...gaps, x1 - x0)) - sx(x0)) * 0.7);
      for (const [bx, bh] of bars) plotArea.append(s('rect', { class: 'tone-' + (g.bars.tone || 'b'), x: sx(bx) - bw / 2, y: sy(bh), width: bw, height: Math.max(0, sy(g.logY ? y0 : Math.max(y0, 0)) - sy(bh)), rx: 2 }));
    }
    for (const c of curves) {
      let d = '', pen = false;
      for (const [x, y] of c.pts) {
        if (!Number.isFinite(y) || (g.logY && y <= 0)) { pen = false; continue; }
        d += (pen ? 'L' : 'M') + sx(x).toFixed(1) + ' ' + Math.max(-1e4, Math.min(1e4, sy(y))).toFixed(1); pen = true;
      }
      plotArea.append(s('path', { class: 'curve tone-' + (c.tone || 'a'), d }));
    }
    for (const m of g.marks || []) plotArea.append(s('line', { class: 'mark', x1: sx(m.x), x2: sx(m.x), y1: T, y2: H - B }));
    svg.append(plotArea);
    const marks = h('div', { class: 'graph-marks' }, (g.marks || []).map(m => h('div', { class: 'graph-mark', style: `left:${(sx(m.x) / W * 100).toFixed(2)}%` }, helpMath(m.label || ''))));
    const legend = h('div', { class: 'legend' }, curves.map(c => h('span', null, h('span', { class: 'sw tone-' + (c.tone || 'a') }), helpMath(c.label || ''))),
      g.bars ? h('span', null, h('span', { class: 'sw tone-' + (g.bars.tone || 'b') }), helpMath(g.bars.label || '')) : null);
    return h('figure', { class: 'graph' + (compact ? ' fb-graph' : '') }, svg, marks, legend, g.caption ? h('figcaption', { class: 'graph-cap' }, helpMath(g.caption)) : null);
  }

  // Recursion-tree diagram: each level is a row of node labels (TeX) with that level's total
  // on the right; a level with `gap: true` is drawn as a vertical ellipsis. Each node joins
  // the parent above it in proportion (child k of m under parent floor(k·p/m) of p).
  function drawTree(t) {
    const rowH = 54, levels = t.levels, H = levels.length * rowH;
    const hasSums = levels.some(l => l.sum);
    const left = hasSums ? 74 : 100; // % of width for the tree itself
    const pos = levels.map((l, r) => (l.gap ? [] : l.nodes).map((_, k, a) => ({ x: (k + 0.5) / a.length * left, y: r * rowH + rowH / 2 })));
    const svg = s('svg', { viewBox: `0 0 100 ${H}`, preserveAspectRatio: 'none', class: 'tree-edges' });
    for (let r = 1; r < levels.length; r++) {
      const up = pos[r - 1], down = pos[r];
      if (!up.length || !down.length) continue;
      down.forEach((c, k) => { const p = up[Math.min(up.length - 1, Math.floor(k * up.length / down.length))];
        svg.append(s('line', { x1: p.x, y1: p.y + 12, x2: c.x, y2: c.y - 12, 'vector-effect': 'non-scaling-stroke' })); });
    }
    const box = h('div', { class: 'tree-fig', style: `height:${H}px` }, svg);
    levels.forEach((l, r) => {
      if (l.gap) box.append(h('div', { class: 'tree-node tree-gap', style: `left:${left / 2}%;top:${r * rowH + rowH / 2}px` }, '⋮'));
      else l.nodes.forEach((lab, k) => box.append(h('div', { class: 'tree-node', style: `left:${pos[r][k].x}%;top:${pos[r][k].y}px` }, helpMath(lab))));
      if (l.sum) box.append(h('div', { class: 'tree-sum', style: `top:${r * rowH + rowH / 2}px` }, l.gap ? '⋮' : helpMath(l.sum)));
    });
    return h('figure', { class: 'graph tree-graph' }, t.sumsLabel && hasSums ? h('div', { class: 'tree-head' }, helpMath(t.sumsLabel)) : null, box,
      t.caption ? h('figcaption', { class: 'graph-cap' }, helpMath(t.caption)) : null);
  }

  function helpStep(st) {
    if (typeof st === 'string') return h('li', null, helpMath(st));
    const li = h('li', null, helpMath(st.text || ''));
    if (st.table) li.append(h('div', { class: 'help-table-wrap' }, h('table', { class: 'help-table' },
      h('thead', null, h('tr', null, st.table.head.map(c => h('th', null, helpMath(c))))),
      h('tbody', null, st.table.rows.map(r => h('tr', null, r.map(c => h('td', null, helpMath(c)))))))));
    return li;
  }

  function openHelp() {
    if (!current) return;
    const card = current.card, help = FC.help && FC.help[card.id];
    if (!help) return;
    if (!current.pending) giveUp();
    const sec = (title, ...kids) => h('section', { class: 'help-sec' }, h('h2', null, title), ...kids);
    const body = [h('p', { class: 'help-q' }, helpMath(card.prompt))];
    if (card.code) body.push(h('pre', { class: 'code' }, card.code));
    body.push(sec('What it’s asking', h('p', null, helpMath(help.asks))));
    if (help.idea) body.push(sec('The idea', h('p', null, helpMath(help.idea))));
    // Heaps: one drawn heap, or a short sequence of states (each with its caption).
    // In a sequence, nodes that changed since the previous state are highlighted (the swap).
    const heapFig = (arr, prev) => {
      const changed = i => prev && prev[i - 1] !== arr[i - 1] ? 'swapped' : '';
      return h('figure', { class: 'graph heap-fig' }, FC.tree.draw(FC.tree.heapTree(arr), { render: helpMath, maxHeight: 220, orient: 'v', classOf: n => changed(n.t.id) }), FC.tree.stripOf(arr, changed));
    };
    const steps = help.heapSteps || [];
    const pics = [help.tree ? drawTree(help.tree) : null,
      help.heap ? heapFig(help.heap) : null,
      ...steps.map((st, i) => h('div', { class: 'heap-step' }, h('p', null, helpMath(st.text || '')), heapFig(st.heap, i ? steps[i - 1].heap : null))),
      help.graph ? plot(help.graph) : null].filter(Boolean);
    if (pics.length) body.push(sec('Picture it', ...pics.flatMap((p, i) => i ? [h('div', { style: 'height:0.75rem' }), p] : [p])));
    if (help.steps) body.push(sec('Step by step', h('ol', { class: 'help-steps' }, help.steps.map(helpStep))));
    if (help.answer) body.push(sec('Answer', h('div', { class: 'help-answer' }, helpMath(help.answer))));
    if (help.mistake) body.push(sec('Watch out', h('div', { class: 'help-mistake' }, helpMath(help.mistake))));
    if (help.tryIt) {
      const a = h('p', { class: 'muted-p', hidden: true }, helpMath(help.tryIt.a));
      const btn = h('button', { class: 'btn', type: 'button', onclick: () => { a.hidden = false; btn.remove(); } }, 'Show answer');
      body.push(sec('Try one', h('p', null, helpMath(help.tryIt.q)), btn, a));
    }
    $('helpBody').replaceChildren(...body);
    $('screen-study').hidden = true;
    $('screen-help').hidden = false;
    document.body.classList.remove('studying');
    window.scrollTo(0, 0);
    $('helpBack').focus();
  }
  function closeHelp() {
    if ($('screen-help').hidden) return;
    $('screen-help').hidden = true;
    if (!session) { show(returnTo || 'class'); return; }
    $('screen-study').hidden = false;
    document.body.classList.add('studying');
    refit();
  }
  $('helpBtn').addEventListener('click', openHelp);
  $('helpBack').addEventListener('click', closeHelp);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('screen-help').hidden) { e.preventDefault(); closeHelp(); } });

  // Report a wrong or unclear card: logged, listed in Settings, fixed next session.
  // (Not a "suspend" button: dropping cards early hurts retention, Karpicke 2009.)
  $('reportBtn').addEventListener('click', () => {
    if (!current || $('reportBox')) return;
    const card = current.card;
    const note = h('input', { type: 'text', placeholder: 'What’s wrong? (optional)', 'aria-label': 'What is wrong with this card' });
    const box = h('div', { class: 'report-box', id: 'reportBox' }, note, h('button', { class: 'btn', onclick: () => {
      log.append(events, { k: 'f', c: card.id, v: note.value.trim().slice(0, 300), q: String(card.prompt).slice(0, 200) });
      box.replaceChildren(h('span', { class: 'muted' }, 'Reported.'));
      pushSoon();
    } }, 'Send'));
    $('screen-study').querySelector('.study-top').after(box);
    note.focus();
  });
  let returnTo = 'class';

  function startSession(cards, opts = {}) {
    const sts = statesFor(cards);
    const queue = opts.queue || queueFor(cards, sts);
    if (!queue.length) { show(opts.queue ? 'mix' : 'class'); return; }
    returnTo = opts.queue ? 'mix' : 'class';
    session = new sched.Session(queue);
    session.byId = new Map(cards.map(c => [c.id, c]));
    session.started = Date.now();
    session.limitMs = minutesLimit() * 60000;
    session.firstTry = new Map(); // card id -> right on first attempt this session
    current = null;
    for (const s of screens) $('screen-' + s).hidden = s !== 'study';
    document.body.classList.add('studying');
    document.querySelectorAll('.navbtn').forEach(b => b.setAttribute('aria-current', 'false'));
    showCard(session.next(), true);
  }

  function endSession(showSummary) {
    if (!session) return;
    const s = session;
    session = null;
    current = null;
    pushSoon();
    if (!showSummary) return;
    const first = [...s.firstTry.values()];
    $('doneCards').textContent = first.length;
    $('doneFirst').textContent = first.length ? Math.round(100 * first.filter(Boolean).length / first.length) + '%' : '—';
    const cards = [...s.byId.values()];
    const sts = statesFor(cards);
    const tomorrow = cards.filter(c => sts[c.id].phase === 'review' && sts[c.id].due === today() + 1).length;
    $('doneNext').textContent = s.remaining
      ? (s.timeUp ? `Time’s up (${Math.round(s.limitMs / 60000)} min). ` : '') + `${s.remaining} card${s.remaining === 1 ? '' : 's'} not reached; they stay due for next time.`
      : `${tomorrow} of these card${tomorrow === 1 ? '' : 's'} come back tomorrow.`;
    $('doneBack').textContent = returnTo === 'mix' ? 'Back to mix' : 'Back to class';
    document.body.classList.remove('studying');
    for (const name of screens) $('screen-' + name).hidden = name !== 'done';
  }
  $('doneBack').addEventListener('click', () => show(returnTo));

  const TYPE_LABEL = { recall: 'Explain', typed: 'Short answer', mc: 'Choose', order: 'Put in order', cloze: 'From your notes', set: 'List them' };

  // New-card progress toward today's 3 correct (and Sure) answers, shown on the card.
  function learnProgress(card) {
    const st = sched.states(events, [card], { examDay: examDay(card.deck) })[card.id];
    if (st.phase === 'new') return { learning: true, done: 0 };
    if (st.phase === 'learning') return { learning: true, done: st.successesToday(today()) };
    return { learning: false };
  }

  function fillQuestion(card) {
    const deck = deckById.get(card.deck) || DECKS[0];
    mathOn = !!deck.math;
    const lec = deck.lectures.find(l => l.n === card.lecture);
    const where = card.lecture === 'paper' ? 'Reading' : deck.lectures.length > 1 ? `Lecture ${card.lecture}` : '';
    const kind = card.generated ? 'Practice problem' : card.blank ? 'Fill the blank' : card.type === 'typed' && card.code ? 'Trace' : TYPE_LABEL[card.type];
    const prog = current && current.progress && current.progress.learning ? `new · ${current.progress.done}/${sched.LEARN_CRITERION}` : '';
    $('qlabel').textContent = [deck.short || deck.title, where, kind, prog].filter(Boolean).join(' · ');
    $('qlabel').title = lec ? lec.title : '';
    $('qprompt').replaceChildren(...math(card.prompt));
    $('qcode').hidden = !card.code;
    $('qcode').textContent = card.code || '';
    // A heap array or tree that the question is ABOUT (interactive types draw their own).
    const showTree = !['swaps', 'fill', 'path', 'tree'].includes(card.type) && (card.heap || card.tree);
    $('qtree').replaceChildren(...(showTree ? [FC.tree.draw(card.tree || FC.tree.heapTree(card.heap), { render: math, maxHeight: Math.round(innerHeight * 0.28), orient: card.heap ? 'v' : undefined }),
      card.heap && !card.tree ? FC.tree.stripOf(card.heap) : null].filter(Boolean) : []));
    $('qtree').hidden = !showTree;
  }

  // ── Pretext: fit the study screen to the window ──────────────────────
  // Study text is sized as a multiple of --fit-q (question) and --fit-a (answer and
  // feedback). Pretext lays out every text block at a candidate scale without touching
  // the DOM, so we binary-search the largest scale at which the whole screen fits and
  // render only that one. A single DOM read per fit gives the non-text "chrome"
  // (padding, inputs, buttons), which does not scale.
  const FIT_MIN = 0.66, FIT_MAX = 1.3;
  const prepared = new Map();
  const px = v => parseFloat(v) || 0;

  function pretextHeight(text, font, width, lineHeight, pre) {
    const key = font + (pre ? '\npre\n' : '\n') + text;
    let p = prepared.get(key);
    if (!p) { p = Pretext.prepare(text, font, pre ? { whiteSpace: 'pre-wrap' } : undefined); prepared.set(key, p); }
    return Pretext.layout(p, width, lineHeight).height;
  }

  // Every visible [data-fit] text block under root, measured at the current scale (1).
  function textBlocks(root) {
    return [...root.querySelectorAll('[data-fit]')].filter(el => el.offsetParent).map(el => {
      const cs = getComputedStyle(el), r = el.getBoundingClientRect();
      return {
        el, math: !!el.querySelector('.katex'),
        text: el.dataset.text ?? el.textContent, pre: el.dataset.fit === 'pre',
        weight: cs.fontWeight, size: px(cs.fontSize), family: cs.fontFamily, lh: px(cs.lineHeight),
        width: r.width - px(cs.paddingLeft) - px(cs.paddingRight) - px(cs.borderLeftWidth) - px(cs.borderRightWidth),
        dom: r.height - px(cs.paddingTop) - px(cs.paddingBottom) - px(cs.borderTopWidth) - px(cs.borderBottomWidth),
      };
    });
  }

  // Largest scale in [FIT_MIN, FIT_MAX] where chrome + all text fits `available`;
  // null if even FIT_MIN is too big.
  // Blocks with rendered math (KaTeX boxes aren't plain text runs) are measured by the DOM
  // at each candidate scale instead of by Pretext: `domHeight(sc)` (still in fit-measure).
  function searchScale(blocks, chrome, available, domHeight) {
    const total = sc => chrome + domHeight(sc) + blocks.reduce((sum, b) =>
      b.math ? sum : sum + pretextHeight(b.text, `${b.weight} ${b.size * sc}px ${b.family}`, b.width, b.lh * sc, b.pre), 0);
    if (total(FIT_MIN) > available) return null;
    if (total(FIT_MAX) <= available) return FIT_MAX;
    let lo = FIT_MIN, hi = FIT_MAX;
    for (let k = 0; k < 9; k++) { const mid = (lo + hi) / 2; if (total(mid) <= available) lo = mid; else hi = mid; }
    return lo;
  }

  const overflowing = () => {
    const q = $('qcard'), a = $('answerArea');
    return q.scrollHeight > q.clientHeight + 1 || a.scrollHeight > a.clientHeight + 1;
  };

  // Asking: question and answer controls share one scale.
  function fitAsk() {
    if (!window.Pretext || !current) return;
    const sec = $('screen-study'), area = $('answerArea');
    sec.classList.remove('fit-overflow');
    area.style.removeProperty('--fit-a');
    sec.style.setProperty('--fit-q', 1);
    sec.style.setProperty('--fit-a', 1);
    sec.classList.add('fit-measure'); // everything at natural height for one read
    const top = sec.getBoundingClientRect().top;
    const natural = Math.max(...[...sec.children].filter(el => el.offsetParent).map(el => el.getBoundingClientRect().bottom)) - top;
    const available = sec.clientHeight;
    const blocks = textBlocks(sec);
    const mathBlocks = blocks.filter(b => b.math);
    const domHeight = sc => {
      if (!mathBlocks.length) return 0;
      sec.style.setProperty('--fit-q', sc); sec.style.setProperty('--fit-a', sc);
      return mathBlocks.reduce((t, b) => { const cs = getComputedStyle(b.el);
        return t + b.el.getBoundingClientRect().height - px(cs.paddingTop) - px(cs.paddingBottom) - px(cs.borderTopWidth) - px(cs.borderBottomWidth); }, 0);
    };
    let sc = searchScale(blocks, natural - blocks.reduce((t, b) => t + b.dom, 0), available, domHeight);
    sec.classList.remove('fit-measure');
    if (sc === null) { sc = FIT_MIN; sec.classList.add('fit-overflow'); }
    const apply = v => { sec.style.setProperty('--fit-q', v); sec.style.setProperty('--fit-a', v); };
    apply(sc);
    // Pretext and the DOM agree to well under a pixel per block; this only catches
    // rounding at an exact boundary.
    for (let k = 0; k < 6 && sc > FIT_MIN && overflowing(); k++) apply(sc = Math.max(FIT_MIN, sc - 0.03));
    if (overflowing()) sec.classList.add('fit-overflow');
  }

  // Feedback: one scale for the whole screen (question + feedback together), chosen by the
  // same Pretext search as when asking.
  function fitFeedback() {
    if (!window.Pretext || !current) return;
    $('answerArea').style.removeProperty('--fit-a');
    fitAsk();
  }

  function refit() {
    if ($('screen-study').hidden || !current) return;
    if (current.pending) fitFeedback(); else fitAsk();
  }
  let refitFrame = 0;
  window.addEventListener('resize', () => { cancelAnimationFrame(refitFrame); refitFrame = requestAnimationFrame(refit); });
  if (document.fonts) document.fonts.ready.then(() => { prepared.clear(); if (window.Pretext) Pretext.clearCache(); refit(); });

  let animating = false;
  function showCard(id, first) {
    const base = session.byId.get(id);
    // A generated skill card becomes a fresh problem each time it is shown.
    const card = base.type === 'gen' && FC.gen ? Object.assign(FC.gen.instance(base.generator), { deck: base.deck, cat: base.cat, sub: base.sub }) : base;
    current = { card, pending: null, progress: learnProgress(base) };
    $('screen-study').classList.remove('answered');
    $('helpBtn').hidden = !(FC.help && FC.help[card.id]);
    if ($('reportBox')) $('reportBox').remove();
    const mins = Math.floor((Date.now() - session.started) / 60000);
    $('leftCount').textContent = `${session.remaining} left` + (isFinite(session.limitMs) ? ` · ${mins}/${Math.round(session.limitMs / 60000)} min` : '');
    const area = $('answerArea'), actions = $('actions'), inner = $('qinner');
    // Render, then fit while the content is still invisible, so the new card appears at its final size.
    const render = () => { fillQuestion(card); area.replaceChildren(buildAnswer(card)); $('qcard').scrollTop = 0; area.scrollTop = 0; fitAsk(); };
    if (first || !window.gsap) { render(); focusFirst(); return; }
    animating = true;
    gsap.killTweensOf([inner, area, actions]);
    gsap.timeline()
      .to([inner, area, actions], { xPercent: -8, opacity: 0, duration: 0.18, ease: 'power2.in' })
      .add(render)
      .set([inner, area, actions], { xPercent: 8 })
      .to([inner, area, actions], { xPercent: 0, opacity: 1, duration: 0.22, ease: 'power2.out', onComplete: () => { animating = false; focusFirst(); } });
  }

  function focusFirst() {
    // Don't pop the phone keyboard open uninvited; on desktop, focus the input.
    if (!matchMedia('(hover: hover)').matches) return;
    const el = $('answerArea').querySelector('input, textarea');
    if (el) el.focus();
  }

  // Answer controls for each card type. Every type ends in the same commit buttons:
  // "I don't know" / "Guess" / "Sure" (L1, L6).
  function buildAnswer(card) {
    const wrap = h('div', { class: 'answer-area-inner' });
    let read; // () => { given, ready }
    if (card.type === 'recall') {
      const ta = h('textarea', { id: 'ans', 'aria-label': 'Your answer', placeholder: 'Write your answer, even a rough one…', spellcheck: 'false' });
      wrap.append(ta);
      read = () => ({ given: ta.value, ready: ta.value.trim().length > 0 });
      ta.addEventListener('keydown', e => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); e.stopPropagation(); submit(!e.shiftKey); }
      });
    } else if (card.type === 'typed' || card.type === 'cloze' || card.type === 'set') {
      const input = h('input', { type: 'text', id: 'ans', class: card.verify ? 'mono' : null, 'aria-label': 'Your answer',
        autocomplete: 'off', autocapitalize: 'off', autocorrect: 'off', spellcheck: 'false',
        placeholder: card.type === 'set' ? 'Separate items with commas (any order)' : card.verify ? 'Exact output (spacing and line breaks don’t matter)' : 'Your answer' });
      wrap.append(input);
      read = () => ({ given: input.value, ready: input.value.trim().length > 0 });
      // stopPropagation: the same Enter must not reach the document handler, which would
      // see the new pending answer and skip straight past the feedback.
      input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); submit(!e.shiftKey); } });
    } else if (card.type === 'mc') {
      const opts = sched.shuffled([card.answer].concat(card.options));
      let chosen = null;
      const box = h('div', { role: 'group', 'aria-label': 'Options' });
      opts.forEach((o, i) => {
        const b = h('button', { class: 'opt', 'aria-pressed': 'false', 'data-opt': o, 'data-fit': '', 'data-text': o, onclick: () => pick(i) }, h('span', { class: 'kbd' }, `${i + 1}`), ' ', math(o));
        box.append(b);
      });
      function pick(i) {
        chosen = opts[i];
        box.querySelectorAll('.opt').forEach((b, j) => b.setAttribute('aria-pressed', String(i === j)));
        updateReady();
      }
      wrap.append(box);
      read = () => ({ given: chosen, ready: chosen != null });
      wrap.pick = pick;
      wrap.optCount = opts.length;
    } else if (card.type === 'order') {
      const pool = sched.shuffled(card.answer.slice());
      if (pool.every((t, i) => t === card.answer[i])) pool.reverse(); // never start already solved
      const placed = [];
      const ans = h('div', { class: 'tiles', 'aria-label': 'Your order' });
      const src = h('div', { class: 'tiles pool', 'aria-label': 'Tiles to place' });
      function draw() {
        ans.replaceChildren(...(placed.length ? placed.map((t, i) => h('button', { class: 'tile', 'data-fit': '', 'data-text': t, onclick: () => { placed.splice(i, 1); pool.push(t); draw(); } }, h('span', { class: 'num' }, `${i + 1}.`), math(t)))
          : [h('div', { class: 'tiles-empty' }, 'Tap tiles below in order. Tap a placed tile to take it back.')]));
        src.replaceChildren(...pool.map((t, i) => h('button', { class: 'tile', 'data-fit': '', 'data-text': t, onclick: () => { pool.splice(i, 1); placed.push(t); draw(); } }, math(t))));
        src.hidden = pool.length === 0;
        updateReady();
      }
      wrap.append(ans, src);
      read = () => ({ given: placed.slice(), ready: pool.length === 0 });
      wrap.draw = draw;
    } else if (card.type === 'tree') {
      // Build the tree: tap a node to select it, tap a symbol (or type one + Enter) to add a child.
      const b = FC.tree.builder({ start: card.start, palette: card.palette, render: math, onChange: () => { if (read) { updateReady(); refit(); } } });
      wrap.append(b.el);
      b.el.addEventListener('keydown', e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); e.stopPropagation(); submit(!e.shiftKey); } });
      read = () => { const t = b.value(); return { given: t, ready: !!(t.kids && t.kids.length) }; };
      wrap.refitTree = b.refit;
    } else if (card.type === 'swaps' || card.type === 'fill' || card.type === 'path') {
      // Heaps and other trees, answered on the tree itself (js/tree.js).
      const onChange = () => { if (read) { updateReady(); refit(); } };
      const w = card.type === 'swaps' ? FC.tree.swapper({ heap: card.heap, swaps: card.swaps, render: math, onChange })
        : card.type === 'fill' ? FC.tree.filler({ tree: fillTreeOf(card), render: math, onChange })
        : FC.tree.pather({ tree: card.tree || FC.tree.heapTree(card.heap), render: math, onChange });
      wrap.append(w.el);
      w.el.addEventListener('keydown', e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); e.stopPropagation(); submit(!e.shiftKey); } });
      read = () => ({ given: w.value(), ready: w.ready() });
    }

    const sureBtn = h('button', { class: 'btn primary', onclick: () => submit(true) }, 'Sure', h('span', { class: 'kbd' }, card.type === 'recall' || card.type === 'tree' || card.type === 'fill' ? 'Ctrl+⏎' : '⏎'));
    const guessBtn = h('button', { class: 'btn', onclick: () => submit(false) }, 'Guess', h('span', { class: 'kbd' }, card.type === 'recall' || card.type === 'tree' || card.type === 'fill' ? 'Ctrl+⇧⏎' : '⇧⏎'));
    const idkBtn = h('button', { class: 'btn', onclick: () => giveUp() }, 'I don’t know');
    $('actions').replaceChildren(h('div', { class: 'btn-row' }, idkBtn, guessBtn, sureBtn));
    function updateReady() { const r = read().ready; sureBtn.disabled = !r; guessBtn.disabled = !r; }
    wrap.addEventListener('input', updateReady);
    if (wrap.draw) wrap.draw(); else updateReady();
    wrap.read = read;
    current && (current.ui = wrap);
    return wrap;
  }

  const fillTreeOf = card => card.tree || FC.tree.heapTree(card.heap, card.heap.length, card.blanks);

  function isCorrect(card, given) {
    if (card.type === 'typed') return grade.typed(given, card);
    if (card.type === 'cloze') return grade.cloze(given, card.answer);
    if (card.type === 'mc') return given === card.answer;
    if (card.type === 'order') return grade.order(given, card.answer);
    if (card.type === 'set') return grade.set(given, card);
    if (card.type === 'tree') return FC.tree.equal(given, card.answer);
    if (card.type === 'swaps') return given.done && given.errors === 0;
    if (card.type === 'fill') return FC.tree.fillMistakes(fillTreeOf(card), given).size === 0;
    if (card.type === 'path') return given.length === card.answer.length && given.every((x, i) => String(x) === String(card.answer[i]));
    return null; // recall: self-graded
  }

  function submit(sure) {
    if (!current || current.pending || animating) return;
    const { given, ready } = current.ui.read();
    if (!ready) return;
    const card = current.card;
    current.pending = { ok: isCorrect(card, given), sure, given, override: false };
    showFeedback();
  }

  function giveUp() {
    if (!current || current.pending || animating) return;
    current.pending = { ok: false, sure: true, given: '', override: false, gaveUp: true };
    showFeedback();
  }

  function showFeedback() {
    const { card, pending: p } = current;
    const area = $('answerArea');
    $('screen-study').classList.add('answered');

    const fb = h('div', { class: 'feedback', role: 'status', 'aria-live': 'polite' });
    const selfGrade = card.type === 'recall' && !p.gaveUp;
    const verdict = h('div', { class: 'verdict', 'data-fit': '' });
    const alert = h('div', { class: 'alert', 'data-fit': '' });
    function paintVerdict() {
      fb.classList.toggle('good', p.ok === true);
      fb.classList.toggle('bad', p.ok === false);
      verdict.textContent = p.ok === null ? 'How did you do?' : p.ok ? (p.sure ? 'Correct' : 'Correct (guessed)') : p.gaveUp ? 'Answer' : 'Not quite';
      alert.hidden = true;
    }
    if (selfGrade) p.ok = null;
    paintVerdict();
    fb.append(verdict, alert);

    // Your answer, then the right one (the input is gone once feedback shows).
    const numbered = list => math(list.map((t, i) => `${i + 1}. ${t}`).join('\n'));
    const hasMath = [].concat(card.answer).some(t => /\$/.test(String(t)));
    const mono = card.verify || (card.type === 'order' && !hasMath) ? ' mono' : '';
    if (p.given && p.given.length) {
      const yours = card.type === 'order' ? 'Your order' : card.type === 'mc' ? 'You chose' : 'You wrote';
      fb.append(h('div', { class: 'fb-block' }, h('div', { class: 'label' }, yours),
        h('div', { class: 'val' + mono, 'data-fit': 'pre' }, Array.isArray(p.given) ? numbered(p.given) : card.type === 'mc' ? math(p.given) : p.given)));
    }
    // A recall answer that is just its checklist (e.g. a memory diagram) is shown once, as the checklist.
    const answerIsChecklist = selfGrade && card.points && card.points.join('\n') === String(card.answer);
    if (card.type === 'swaps' || card.type === 'fill' || card.type === 'path') {
      fb.classList.add('fb-fill');
      let tree, opts = { render: math, fill: true, orient: 'v' }, label = 'Answer', strip = null;
      if (card.type === 'swaps') {
        tree = FC.tree.heapTree(card.answer);
        label = p.gaveUp ? 'The heap after the swaps' : !p.given.done ? `You stopped after ${p.given.k} of ${card.swaps.length} swaps. The heap after all of them:`
          : p.given.errors ? `Finished, with ${p.given.errors} wrong tr${p.given.errors === 1 ? 'y' : 'ies'} on the way. The heap:` : 'The heap after the swaps';
        strip = FC.tree.stripOf(card.answer);
      } else if (card.type === 'fill') {
        tree = FC.tree.filledTree(fillTreeOf(card));
        if (!p.gaveUp && !p.ok) { opts.wrong = FC.tree.fillMistakes(fillTreeOf(card), p.given); label = 'Answer (red = yours differs)'; }
      } else {
        tree = card.tree || FC.tree.heapTree(card.heap);
        const ids = FC.tree.layout(tree).nodes.map(n => [n.path, n.t.id != null ? n.t.id : n.path]);
        const order = new Map(card.answer.map((id, i) => [String(id), i + 1]));
        opts.badge = n => { const id = String(ids.find(x => x[0] === n.path)[1]); return order.has(id) ? String(order.get(id)) : n.t.note; };
        opts.classOf = n => order.has(String(ids.find(x => x[0] === n.path)[1])) ? 'picked' : '';
        label = 'The right order (numbered)';
      }
      fb.append(h('div', { class: 'fb-block fb-tree' }, h('div', { class: 'label' }, label), FC.tree.draw(tree, opts), strip));
    } else if (card.type === 'tree') {
      // One tree: the right one, with red where yours has a different node or none.
      const m = !p.ok && p.given && p.given.kids && p.given.kids.length ? FC.tree.mistakesOn(p.given, card.answer) : null;
      const label = !m ? 'Answer' : `Answer (red = where yours differs${m.extra ? `; yours also has ${m.extra} extra node${m.extra > 1 ? 's' : ''}` : ''})`;
      fb.classList.add('fb-fill');
      fb.append(h('div', { class: 'fb-block fb-tree' }, p.gaveUp ? null : h('div', { class: 'label' }, label),
        FC.tree.draw(card.answer, { render: math, wrong: m ? m.marks : null, fill: true })));
    } else if (!(card.type === 'mc' && p.ok) && !answerIsChecklist) {
      fb.append(h('div', { class: 'fb-block' }, p.gaveUp ? null : h('div', { class: 'label' }, card.type === 'recall' && !card.blank ? 'Model answer' : 'Answer'),
        h('div', { class: 'val' + mono, 'data-fit': 'pre' }, card.type === 'order' ? numbered(card.answer) : mono ? card.answer : math(Array.isArray(card.answer) ? card.answer.join(', ') : card.answer))));
    }
    // Generated problems can carry a graph drawn from this instance's own numbers.
    if (card.graph) fb.append(h('div', { class: 'fb-block' }, plot(card.graph, true)));
    if (card.rtree) fb.append(h('div', { class: 'fb-block' }, drawTree(card.rtree)));
    if (card.blank && card.basis === 'inferred') {
      fb.append(h('div', { class: 'alert', 'data-fit': '' }, 'Best guess. Check your notes.'));
    }
    // Self-grading: tick each point your answer actually contained; the app decides.
    // Students credit themselves for wrong answers far less when judging idea by idea
    // (Lipko 2009; Dunlosky 2011; Grimaldi & Karpicke 2014; research/04 rule 15).
    const checks = [];
    if (selfGrade) {
      const pts = card.points && card.points.length ? card.points : [String(card.answer)];
      fb.append(h('div', { class: 'fb-block' }, h('div', { class: 'label' }, 'Tick what your answer said'),
        h('div', { class: 'checklist' }, pts.map((pt, i) => {
          const box = h('input', { type: 'checkbox', id: 'pt' + i });
          checks.push({ box, pt });
          return h('label', { class: 'check', for: 'pt' + i }, box, h('span', { 'data-fit': '' }, math(pt)));
        }))));
    }
    if (card.why) fb.append(h('p', { class: 'why', 'data-fit': '' }, math(card.why)));

    const row = h('div', { class: 'btn-row' });
    const cont = () => commit();
    if (selfGrade) {
      // Got it only if every point is ticked.
      const done = h('button', { class: 'btn primary', id: 'contBtn', onclick: () => {
        p.ok = checks.every(c => c.box.checked);
        cont();
      } }, 'Done', h('span', { class: 'kbd' }, '⏎'));
      row.append(h('button', { class: 'btn', onclick: () => { p.ok = false; cont(); } }, 'I missed it'), done);
    } else {
      if ((card.type === 'typed' || card.type === 'cloze') && p.ok === false && !p.gaveUp) {
        // Exact matching can reject a right answer worded differently; allow an honest override.
        const ov = h('button', { class: 'linkbtn', onclick: () => { p.ok = true; p.override = true; ov.remove(); paintVerdict(); fitFeedback(); } },
          card.verify ? 'I was right (only formatting differs)' : 'I was right (only wording differs)');
        fb.append(ov);
      }
      row.append(h('button', { class: 'btn primary', id: 'contBtn', onclick: cont }, 'Continue', h('span', { class: 'kbd' }, '⏎')));
    }
    area.replaceChildren(fb);
    area.scrollTop = 0;
    $('actions').replaceChildren(row);
    fitFeedback();
    const btn = row.querySelector('.btn.primary');
    if (btn && matchMedia('(hover: hover)').matches) btn.focus({ preventScroll: true });
  }

  function commit() {
    if (!current || !current.pending || current.pending.ok === null) return;
    const { card, pending: p } = current;
    const fields = { k: 'r', c: card.id, ok: p.ok ? 1 : 0, s: p.sure ? 1 : 0 };
    const given = Array.isArray(p.given) ? p.given.join(' | ') : p.given;
    if (given) fields.g = String(given).slice(0, 200);
    if (p.override) fields.o = 1;
    if (card.generated) fields.sd = card.seed; // which generated problem was shown
    log.append(events, fields);
    if (!session.firstTry.has(card.id)) session.firstTry.set(card.id, !!(p.ok && p.sure));
    const st = sched.states(events, [card], { examDay: examDay(card.deck) })[card.id];
    session.record(card.id, {
      ok: p.ok, sure: p.sure,
      learningShort: st.phase === 'learning' && st.successesToday(today()) < sched.LEARN_CRITERION,
    });
    current.pending = null;
    if (session.remaining === 0) { endSession(true); return; }
    if (Date.now() - session.started >= session.limitMs) { session.timeUp = true; endSession(true); return; }
    showCard(session.next(), false);
  }

  // Keyboard: answer shortcuts while answering; Enter / 1 / 2 on feedback.
  document.addEventListener('keydown', e => {
    if (e.defaultPrevented || $('screen-study').hidden || !current || animating) return;
    const typing = /^(INPUT|TEXTAREA)$/.test(document.activeElement?.tagName) && !document.activeElement.disabled;
    if (current.pending) {
      if (current.card.type === 'recall' && current.pending.ok === null && !current.pending.gaveUp) {
        if (e.key === 'Enter' && !e.repeat && document.activeElement?.tagName !== 'INPUT') { e.preventDefault(); $('contBtn')?.click(); }
        return;
      }
      if (e.key === 'Enter' && !e.repeat) { e.preventDefault(); commit(); }
      return;
    }
    if (typing) return;
    const ui = current.ui;
    if (current.card.type === 'mc' && /^[1-9]$/.test(e.key) && +e.key <= ui.optCount) ui.pick(+e.key - 1);
    if (e.key === 'Enter' && ['mc', 'order', 'swaps', 'path'].includes(current.card.type)) { e.preventDefault(); submit(!e.shiftKey); }
  });

  // ── Settings + sync ────────────────────────────────────────────────────
  function renderSettings() {
    $('token').value = store.getItem(TOKEN_KEY) || '';
    $('logSize').textContent = `${events.length} events stored on this device.`;
    const reports = events.filter(e => e.k === 'f');
    $('reportList').replaceChildren(...(reports.length ? reports.slice(-50).reverse().map(r =>
      h('li', null, h('b', null, r.c), ': ', r.v || '(no note)', h('div', { class: 'muted' }, r.q || ''))) : [h('li', { class: 'muted' }, 'None yet.')]));
  }
  $('saveToken').addEventListener('click', async () => {
    const tok = $('token').value.trim();
    if (!tok) { store.removeItem(TOKEN_KEY); setSync('', 'Token removed. Syncing is off on this device.'); return; }
    store.setItem(TOKEN_KEY, tok);
    FC.sync.resetCache(store);
    await syncNow();
  });
  $('syncNow').addEventListener('click', () => syncNow());
  $('exportBtn').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(events)], { type: 'application/json' });
    const a = h('a', { href: URL.createObjectURL(blob), download: `csc370-log-${new Date().toISOString().slice(0, 10)}.json` });
    document.body.append(a); a.click(); a.remove();
  });

  function setSync(state, message) {
    $('syncDot').className = 'sync-dot' + (state ? ' ' + state : '');
    $('syncDot').setAttribute('aria-label', 'Sync status: ' + (message || 'off'));
    $('syncDot').title = message || 'Sync off (add a token in Settings)';
    const st = $('syncStatus');
    st.textContent = message || '';
    st.className = 'status' + (state === 'ok' ? ' ok' : state === 'err' ? ' err' : '');
  }

  let syncing = null;
  async function syncNow() {
    const token = store.getItem(TOKEN_KEY);
    if (!token) { setSync('', ''); return; }
    if (syncing) return syncing;
    setSync('busy', 'Syncing…');
    syncing = (async () => {
      try {
        const merged = await FC.sync.create({ token, store }).sync(events);
        // Keep anything answered while the sync was in flight.
        const all = log.merge(merged, events);
        events.splice(0, events.length, ...all);
        log.save(events);
        setSync('ok', `Synced ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · ${events.length} events`);
        if (!$('screen-classes').hidden) renderClasses();
        if (!$('screen-settings').hidden) $('logSize').textContent = `${events.length} events stored on this device.`;
      } catch (e) {
        setSync('err', e.message || 'Sync failed. Your progress is safe on this device; try again later.');
      } finally {
        syncing = null;
      }
    })();
    return syncing;
  }
  let pushTimer = null;
  function pushSoon() { clearTimeout(pushTimer); pushTimer = setTimeout(syncNow, 1500); }
  // Push when leaving; pull when coming back (a tab left open overnight is stale).
  document.addEventListener('visibilitychange', () => syncNow());
  // Another tab of this browser saved events: take them in (log.save merges both ways).
  window.addEventListener('storage', e => {
    if (e.key !== 'fc.events') return;
    log.save(events);
    if (!$('screen-classes').hidden) renderClasses();
  });

  // ── Boot ───────────────────────────────────────────────────────────────
  show('classes');
  if (store.getItem(TOKEN_KEY)) syncNow(); else setSync('', '');

  // For tests (Playwright): measurement accuracy is checked against the real layout.
  FC.app = { cardsFor, activeCards, startSession, decks: DECKS, fillQuestion, fitAsk, fitFeedback, renderNow: id => showCard(id, true), get events() { return events; }, get session() { return session; } };
})(globalThis.FC = globalThis.FC || {});
