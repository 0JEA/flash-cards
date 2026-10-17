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
  settings.view = settings.view || {};
  // Old single-assignment "focus" -> the assignment filter (that assignment on, the rest off).
  for (const [deckId, focus] of Object.entries(settings.focus || {})) {
    const deck = FC.decks[deckId];
    if (!focus || !deck) continue;
    const off = new Set(settings.off[deckId] || []);
    for (const a of deck.assignments || []) if (a.id !== focus) off.add('A:' + a.id);
    off.add('A:none');
    settings.off[deckId] = [...off];
  }
  delete settings.focus;
  // 2026-10-17: the topic filter is gone (one lecture list + an assignment dropdown); drop its
  // old keys so they can't hide cards invisibly.
  for (const id of Object.keys(settings.off || {})) settings.off[id] = (settings.off[id] || []).filter(k => /^[LA]:/.test(k));
  // v2 (2026-10-16): sessions draw from every card (repeats go to the end of the session)
  // and are bounded by time instead; the old 20-new-cards default made the same 20 cycle.
  if (!settings.v || settings.v < 2) { settings.newLimit = 'all'; settings.v = 2; store.setItem(SETTINGS_KEY, JSON.stringify(settings)); }
  // Older settings (single class): carry the exam date over to CSC 370.
  if (settings.examDate && !settings.exams.csc370) settings.exams.csc370 = settings.examDate;
  delete settings.examDate; delete settings.newPerDay;
  let session = null;   // sched.Session plus bookkeeping
  let current = null;   // { card, pending } for the card on screen
  let openDeck = DECKS[0] ? DECKS[0].id : null;

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
  // Card selection = three filters that combine (a card is studied only if all three let
  // it through). Each filter is a set of switched-off keys in settings.off[deck]:
  //   topic       'Cat' or 'Cat/Sub'
  //   lecture     'L:<lecture>'
  //   assignment  'A:<assignment id>', or 'A:none' for cards that belong to no assignment
  const DIMS = ['topic', 'lecture', 'assignment'];
  const dimOf = key => key.startsWith('L:') ? 'lecture' : key.startsWith('A:') ? 'assignment' : 'topic';
  const assignIds = (deck, c) => (c.assignment || []).filter(a => (deck.assignments || []).some(x => x.id === a));
  const passes = {
    topic: (off, c) => !off.has(c.cat) && !off.has(c.cat + '/' + c.sub),
    lecture: (off, c) => !off.has('L:' + c.lecture),
    assignment: (off, c, deck) => { const ids = assignIds(deck, c); return ids.length ? ids.some(a => !off.has('A:' + a)) : !off.has('A:none'); },
  };
  const isOn = (off, c, deck = deckById.get(c.deck) || {}, skip) => DIMS.every(dim => dim === skip || passes[dim](off, c, deck));
  // Exam mode: within 7 days of a class's exam date, History is left out (exam-format
  // practice first, research/04 rule 25) unless it was switched back on for the exam.
  const EXAM_WEEK = 7;
  function examMode(deckId) { const ed = examDay(deckId); return ed != null && ed >= today() && ed - today() <= EXAM_WEEK; }
  const activeCards = deckId => {
    const off = offSet(deckId);
    if (examMode(deckId) && !(settings.examHistory || {})[deckId]) for (const cat of ['History', 'History & stories']) off.add(cat);
    const deck = deckById.get(deckId);
    return cardsFor(deckId).filter(c => isOn(off, c, deck));
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
  // A navigation bar like iOS 13's: a back button on the left (to Classes), Settings on the right.
  const screens = ['classes', 'class', 'mix', 'study', 'done', 'settings'];
  function show(name) {
    document.body.classList.remove('studying');
    if (name !== 'study' && session) endSession(false);
    closeHelp(true);
    for (const s of screens) $('screen-' + s).hidden = s !== name;
    $('navBack').hidden = name === 'classes' || name === 'done';
    $('navSettings').hidden = name === 'settings';
    if (name === 'classes') renderClasses();
    if (name === 'class') { paintClass(openDeck); renderClass(); }
    if (name === 'mix') renderMix();
    if (name === 'settings') renderSettings();
    window.scrollTo(0, 0);
  }
  document.querySelectorAll('[data-nav]').forEach(b => b.addEventListener('click', () => show(b.dataset.nav)));

  // Each class has its own colour (its pass on the Classes screen, its dot and card stack while
  // studying). Every colour carries white text at 5:1 or better.
  const CLASS_COLOR = { csc370: '#4338ca', csc310: '#c2410c', softtest: '#0f766e', ethics: '#9d174d' };
  const colorOf = deckId => CLASS_COLOR[deckId] || '#3a3a3c';
  const paintClass = deckId => document.body.style.setProperty('--class', colorOf(deckId));
  const codeOf = d => (/(\d{3})/.exec(d.short || d.title) || [])[1] || (d.short || d.title);
  const nameOf = d => String(d.title).replace(/^[A-Z]+ ?\d+ ?· ?/, '');
  const fmtDay = day => new Date(day * 86400000 + 12 * 3600000).toLocaleDateString([], { month: 'short', day: 'numeric', timeZone: 'UTC' });
  // Days (of the last 14) with at least one answer in this class, oldest first.
  function daysStudied(ids) {
    const days = new Set(events.filter(e => e.k === 'r' && ids.has(e.c)).map(e => sched.dayOf(e.t)));
    return Array.from({ length: 14 }, (_, i) => days.has(today() - 13 + i));
  }

  // ── Classes (launch screen): Apple Wallet's pass stack, each class a boarding pass ──
  // The open pass shows the route (course → exam date), what is due, the share remembered
  // later, and one bar per recent day; the others wait below it as strips, tap one to open it.
  let openPass = 0;
  const PASS_H = 272, STRIP = 58;
  // Move the passes in place (so the stack animates): the open one on top, the rest as strips.
  function openPassAt(i) { if (i !== openPass) { openPass = i; layoutPasses(); } }
  function layoutPasses() {
    const els = [...$('classList').children];
    const order = [openPass, ...els.map((_, i) => i).filter(i => i !== openPass)];
    els.forEach((el, i) => {
      const pos = order.indexOf(i), open = pos === 0;
      el.classList.toggle('open', open);
      el.style.transform = `translateY(${open ? 0 : PASS_H + 12 + (pos - 1) * STRIP}px)`;
      el.style.zIndex = open ? 50 : pos;
      el.style.height = (open ? PASS_H : 64) + 'px';
      el.querySelector('.pass-head').setAttribute('aria-expanded', String(open));
      el.querySelector('.route').setAttribute('aria-hidden', String(!open));
      el.querySelectorAll('.pass-actions button').forEach(b => { if (open) b.removeAttribute('tabindex'); else b.tabIndex = -1; });
    });
  }
  function renderClasses() {
    const list = $('classList');
    const pct = r => r.total ? Math.round(100 * r.right / r.total) + '%' : 'Not yet';
    const passes = DECKS.map(d => {
      const k = counts(activeCards(d.id)), ids = new Set(cardsFor(d.id).map(c => c.id));
      const r = sched.delayedRecall(events.filter(e => ids.has(e.c)), today(), 14);
      const ed = examDay(d.id);
      return { d, color: colorOf(d.id), name: nameOf(d), code: codeOf(d), due: k.review, fresh: k.learn, recall: pct(r),
        exam: ed != null && ed >= today() ? fmtDay(ed) : null, days: daysStudied(ids),
        go: btn => { openDeck = d.id; withSync(btn, () => startSession(activeCards(d.id), { from: 'classes' })); },
        more: () => { openDeck = d.id; show('class'); }, moreLabel: 'Choose cards',
        setExam: () => { openDeck = d.id; show('class'); $('examDate').focus(); $('examDate').scrollIntoView({ block: 'center' }); } };
    });
    const all = DECKS.reduce((t, x) => t.concat(cardsFor(x.id)), []);
    const mixDue = passes.reduce((t, p) => t + p.due, 0), mixNew = passes.reduce((t, p) => t + p.fresh, 0);
    passes.push({ d: null, color: '#3a3a3c', name: 'All classes, mixed', code: 'Mix', due: mixDue, fresh: mixNew,
      recall: pct(sched.delayedRecall(events, today(), 14)), exam: null, days: daysStudied(new Set(all.map(c => c.id))),
      go: () => show('mix'), goLabel: 'Set up a mix' });
    if (openPass >= passes.length) openPass = 0;
    const order = [openPass, ...passes.map((_, i) => i).filter(i => i !== openPass)];
    list.style.height = (PASS_H + 12 + (passes.length - 1) * STRIP) + 'px';
    list.replaceChildren(...passes.map((p, i) => {
      const pos = order.indexOf(i), open = pos === 0;
      const goBtn = h('button', { class: 'go', type: 'button', tabindex: open ? null : '-1', onclick: e => { e.stopPropagation(); p.go(goBtn); } }, p.goLabel || 'Study');
      const el = h('div', { class: 'pass' + (open ? ' open' : ''), style: `--pc:${p.color}; transform:translateY(${open ? 0 : PASS_H + 12 + (pos - 1) * STRIP}px); z-index:${open ? 50 : pos}; height:${open ? PASS_H : 64}px`,
        onclick: () => openPassAt(i) },
        h('button', { class: 'pass-head', type: 'button', 'aria-expanded': String(open),
          onclick: e => { e.stopPropagation(); openPassAt(i); } },
          h('span', { class: 'pass-name' }, p.name), h('span', { class: 'pass-due' }, `${p.due} to review`)),
        h('div', { class: 'route', 'aria-hidden': String(!open) },
          h('div', { class: 'code3' }, h('small', null, p.d ? 'Course' : 'Every class'), p.code),
          h('div', { class: 'flight' }),
          p.d ? h('div', { class: 'code3 r' + (p.exam ? '' : ' unset') }, h('small', null, 'Exam'),
            p.exam || h('button', { class: 'set-exam', type: 'button', onclick: e => { e.stopPropagation(); p.setExam(); } }, 'Set date'))
            : h('div', { class: 'code3 r unset' }, h('small', null, 'You choose'), 'the share')),
        h('div', { class: 'pass-fields' },
          h('div', null, h('small', null, 'To review'), h('b', null, String(p.due))),
          h('div', null, h('small', null, 'New'), h('b', null, String(p.fresh))),
          h('div', null, h('small', null, 'Remembered later'), h('b', null, p.recall)),
          h('div', { class: 'days-f' }, h('small', null, 'Last 14 days'),
            h('div', { class: 'days', role: 'img', 'aria-label': `Studied on ${p.days.filter(Boolean).length} of the last 14 days` }, p.days.map(on => h('i', { class: on ? 'on' : null }))))),
        h('div', { class: 'pass-actions' },
          p.more ? h('button', { type: 'button', tabindex: open ? null : '-1', onclick: e => { e.stopPropagation(); p.more(); } }, p.moreLabel) : null, goBtn));
      return el;
    }));
    layoutPasses();
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
      : 'How often “Sure” was right shows here once you have reviewed cards on a second day.';
    const r = sched.delayedRecall(events, today(), 14);
    $('recallPct').textContent = r.total ? Math.round(100 * r.right / r.total) + '%' : '—';
    $('recallNote').textContent = r.total
      ? `${r.right} of ${r.total} right when a card came back hours or days later (last 14 days)`
      : 'Starts tomorrow: how many cards you still know when they come back.';
  }

  // ── Class screen: topic toggles, then Study ────────────────────────────
  // ── Class screen: one list of what to study, then the session options ─────────
  // Owner, 2026-10-17: simple and direct. The main choice (which lectures) is at the top as
  // one list in the page (no inner scroller, no tabs); an assignment is one dropdown; the
  // Study button stays in view at the bottom of the window.
  // settings.off[deck] keys: 'L:<lecture>' and 'A:<id>' / 'A:none' (old topic keys are dropped at load).
  function renderClass() {
    const d = deckById.get(openDeck);
    const off = offSet(d.id);
    const all = cardsFor(d.id);
    $('classTitle').textContent = d.title;
    const k = counts(activeCards(d.id));
    const n = k.review + k.learn;
    $('studyBtn').disabled = n === 0;
    $('studyBtn').textContent = n ? `Study ${n} card${n === 1 ? '' : 's'}` : 'Nothing to study';
    $('studyCounts').textContent = n ? `${k.review} to review · ${k.learn} new` : '';
    $('studyNote').textContent = n ? ''
      : k.total === 0 ? 'Nothing is ticked below. Tick a lecture (or Everything) to study it.' : 'Nothing left for today in this choice. Come back tomorrow, or tick more lectures.';
    $('examDate').value = settings.exams[d.id] || '';
    $('newLimit').value = String(settings.newLimit);
    $('sessionMinutes').value = String(settings.minutes);
    const ed = examDay(d.id);
    const histOut = examMode(d.id) && !(settings.examHistory || {})[d.id];
    $('examBanner').replaceChildren(...(examMode(d.id)
      ? [`Exam in ${ed - today()} day${ed - today() === 1 ? '' : 's'}: reviews are packed so everything comes back before it.`,
        histOut ? [' History cards are left out this week. ', h('button', { class: 'linkbtn', type: 'button', onclick: () => { settings.examHistory = Object.assign({}, settings.examHistory, { [d.id]: true }); saveSettings(); renderClass(); } }, 'Include them')] : '']
      : ed != null && ed > today() ? [`Exam in ${ed - today()} days: reviews are spaced so everything comes back before it.`] : []).flat());
    $('examBanner').hidden = !$('examBanner').textContent;
    renderPicker(d, all, off);
  }

  function renderPicker(d, all, off) {
    // Assignment: one dropdown (only for classes whose cards are tagged by assignment).
    const assigns = (d.assignments || []).filter(a => all.some(c => assignIds(d, c).includes(a.id)));
    const aOn = assigns.filter(a => !off.has('A:' + a.id));
    const assignVal = !assigns.length || (aOn.length === assigns.length && !off.has('A:none')) ? 'any' : aOn.length === 1 && off.has('A:none') ? aOn[0].id : 'mixed';
    $('assignRow').hidden = !assigns.length;
    if (assigns.length) {
      $('assignPick').replaceChildren(h('option', { value: 'any' }, 'Any (all cards)'),
        ...assigns.map(a => h('option', { value: a.id }, a.title)),
        assignVal === 'mixed' ? h('option', { value: 'mixed' }, 'Custom') : null);
      $('assignPick').value = assignVal;
    }
    // Lectures: one list. Each count is what that lecture adds under the assignment choice.
    const lectures = d.lectures.filter(l => all.some(c => c.lecture === l.n));
    const aPass = c => passes.assignment(off, c, d);
    const lecOn = l => !off.has('L:' + l.n);
    const onCount = lectures.filter(lecOn).length;
    const check = (checked, mixed, onchange) => { const b = h('input', { type: 'checkbox', checked, onchange: e => onchange(e.target.checked) }); b.indeterminate = mixed; return b; };
    const label = l => /^\d+(\.\d+)?$/.test(l.n) ? [h('span', { class: 'lec-n' }, `${l.n}`), l.title] : [h('span', { class: 'lec-n' }, '·'), l.title];
    $('topicTree').replaceChildren(
      h('label', { class: 'crow all' }, check(onCount === lectures.length, onCount > 0 && onCount < lectures.length, v => setAll(d.id, 'lecture', v)),
        h('span', { class: 'pick-title' }, 'Everything'), h('span', { class: 'pick-n' }, String(all.filter(aPass).length))),
      ...lectures.map(l => { const n = all.filter(c => c.lecture === l.n && aPass(c)).length;
        return h('label', { class: 'crow' + (lecOn(l) ? '' : ' is-off') + (n ? '' : ' is-empty') }, check(lecOn(l), false, v => toggle(d.id, 'L:' + l.n, v)),
          h('span', { class: 'pick-title' }, ...label(l)), h('span', { class: 'pick-n' }, String(n))); }));
  }
  const keysOf = (off, dim) => [...off].filter(k => dimOf(k) === dim);
  function groupsFor(d, all, dim) {
    if (dim === 'lecture') return d.lectures.filter(l => all.some(c => c.lecture === l.n)).map(l => ({ key: 'L:' + l.n }));
    return (d.assignments || []).map(a => ({ key: 'A:' + a.id })).concat([{ key: 'A:none' }]);
  }

  // Writes. Every change re-renders, so counts are always current.
  function saveOff(deckId, off) { settings.off[deckId] = [...off]; saveSettings(); renderClass(); }
  function toggle(deckId, key, on) { const off = offSet(deckId); if (on) off.delete(key); else off.add(key); saveOff(deckId, off); }
  function setAll(deckId, dim, on) {
    const d = deckById.get(deckId), all = cardsFor(deckId), off = offSet(deckId);
    for (const k of keysOf(off, dim)) off.delete(k);
    if (!on) for (const g of groupsFor(d, all, dim)) off.add(g.key);
    saveOff(deckId, off);
  }
  $('assignPick').addEventListener('change', e => {
    const d = deckById.get(openDeck), off = offSet(openDeck), v = e.target.value;
    if (v === 'mixed') return;
    for (const k of keysOf(off, 'assignment')) off.delete(k);
    if (v !== 'any') { for (const a of d.assignments || []) if (a.id !== v) off.add('A:' + a.id); off.add('A:none'); }
    saveOff(openDeck, off);
  });
  $('examDate').addEventListener('change', e => { settings.exams[openDeck] = e.target.value; saveSettings(); renderClass(); });
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
      return h('div', { class: 'grow' },
        h('label', { for: 'mix-' + d.id }, d.short || d.title, h('br'), h('span', { class: 'muted' }, `${k.review + k.learn} available`)),
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
  // Classes with math on render $...$ (KaTeX); the others show text as written ($ is code in
  // C, shell and Perl there), with `backticks` set as inline code.
  const deckMath = () => { const c = helpCard || (current && current.card); return !c || !!(deckById.get(c.deck) || {}).math; };
  const helpMath = t => {
    if (!deckMath()) return String(t).split(/`([^`]+)`/).map((part, i) => i % 2 ? h('code', { class: 'ic' }, part) : part);
    const was = mathOn; mathOn = true; try { return math(t); } finally { mathOn = was; }
  };
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
    // Log axes: at most about 6 labelled powers of ten, so labels never pile up.
    if (g.logY) { const lo = Math.ceil(ly0), hi = Math.floor(ly1), step = Math.max(1, Math.ceil((hi - lo + 1) / 6)); for (let e = hi; e >= lo; e -= step) yticks.push(10 ** e); }
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
    // Labels sit right of their line, or left of it near the right edge (never off the page).
    const marks = h('div', { class: 'graph-marks' }, (g.marks || []).map(m => h('div', { class: 'graph-mark' + (sx(m.x) / W > 0.62 ? ' left' : ''), style: `left:${(sx(m.x) / W * 100).toFixed(2)}%` }, helpMath(m.label || ''))));
    const legend = h('div', { class: 'legend' }, curves.map(c => h('span', null, h('span', { class: 'sw tone-' + (c.tone || 'a') }), helpMath(c.label || ''))),
      g.bars ? h('span', null, h('span', { class: 'sw tone-' + (g.bars.tone || 'b') }), helpMath(g.bars.label || '')) : null);
    return h('figure', { class: 'graph' + (compact ? ' fb-graph' : '') }, svg, marks, legend, g.caption ? h('figcaption', { class: 'graph-cap' }, helpMath(g.caption)) : null);
  }

  // Recursion-tree diagram: each level is a row of node labels (TeX) with that level's total
  // on the right; a level with `gap: true` is drawn as a vertical ellipsis. Each node joins
  // the parent above it in proportion (child k of m under parent floor(k·p/m) of p).
  function drawTree(t, o = {}) {
    const rowH = o.compact ? 38 : 54, levels = t.levels, H = levels.length * rowH;
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
    // Columns of numbers (or math) line up on the right; columns of words read from the left.
    const numeric = cell => /^[\s\d.,+\-–−×*\/()=%<>≤≥]*$/.test(String(cell).replace(/(?<!\\)\$.+?(?<!\\)\$/g, '0'));
    const right = st.table && st.table.head.map((_, k) => st.table.rows.every(r => numeric(r[k] == null ? '' : r[k])));
    const al = k => right[k] ? 'num' : null;
    if (st.table) li.append(h('div', { class: 'help-table-wrap' }, h('table', { class: 'help-table' },
      h('thead', null, h('tr', null, st.table.head.map((c, k) => h('th', { class: al(k) }, helpMath(c))))),
      h('tbody', null, st.table.rows.map(r => h('tr', null, r.map((c, k) => h('td', { class: al(k) }, helpMath(c)))))))));
    if (st.code) li.append(h('pre', { class: 'code help-code' }, st.code));
    return li;
  }

  // Opens over the screen it was called from: the study card (counts as not known if it was
  // still unanswered) or the session summary (a card you missed).
  let helpCard = null, helpHide = 0, helpFrom = null;
  function openHelp(arg) {
    const card = arg && arg.prompt ? arg : current && current.card;
    const help = card && FC.help && FC.help[card.id];
    if (!help) return;
    if (card === (current && current.card) && !current.pending) giveUp();
    helpCard = card;
    helpFrom = document.activeElement;
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
    // A parse tree (or any FC.tree-format tree), drawn like the tree answers.
    const ptree = p => h('figure', { class: 'graph heap-fig' }, FC.tree.draw(p.tree, { render: helpMath, maxHeight: 300 }),
      p.caption ? h('figcaption', { class: 'graph-cap' }, helpMath(p.caption)) : null);
    const pics = [help.tree ? drawTree(help.tree) : null,
      ...[].concat(help.ptree || []).map(ptree),
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
      body.push(sec('Try one', h('p', null, helpMath(help.tryIt.q)), help.tryIt.code ? h('pre', { class: 'code help-code' }, help.tryIt.code) : null, btn, a));
    }
    $('helpBody').replaceChildren(...body);
    clearTimeout(helpHide);
    const sheet = $('screen-help');
    sheet.hidden = false;
    $('helpMargin').scrollTop = 0;
    $('helpBack').textContent = $('screen-study').hidden ? 'Back' : 'Card';
    requestAnimationFrame(() => requestAnimationFrame(() => sheet.classList.add('in')));
    document.body.style.overflow = 'hidden';
    $('helpBack').focus({ preventScroll: true });
  }
  // `now`: hide at once (leaving the screen); otherwise slide the notes back out first.
  function closeHelp(now) {
    const sheet = $('screen-help');
    if (sheet.hidden) return;
    sheet.classList.remove('in');
    document.body.style.overflow = '';
    clearTimeout(helpHide);
    const done = () => { sheet.hidden = true; helpCard = null; };
    if (now === true || matchMedia('(prefers-reduced-motion: reduce)').matches) done(); else helpHide = setTimeout(done, 420);
    if (now !== true && helpFrom && helpFrom.isConnected) helpFrom.focus({ preventScroll: true });
  }
  $('helpBtn').addEventListener('click', () => openHelp());
  $('helpBack').addEventListener('click', () => closeHelp());
  $('helpBackdrop').addEventListener('click', () => closeHelp());
  // Keep Tab inside the notes while they are open.
  $('screen-help').addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;
    const f = [...$('helpMargin').querySelectorAll('button, a[href], input, [tabindex]:not([tabindex="-1"])')].filter(x => !x.hidden && x.offsetParent);
    if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  });
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
    if (!queue.length) { show(opts.queue ? 'mix' : opts.from || 'class'); return; }
    returnTo = opts.queue ? 'mix' : opts.from || 'class';
    lastStart = { cards, opts };
    session = new sched.Session(queue);
    session.byId = new Map(cards.map(c => [c.id, c]));
    session.started = Date.now();
    session.limitMs = minutesLimit() * 60000;
    session.firstTry = new Map(); // card id -> right on first attempt this session
    current = null;
    shownLeft = null;
    closeHelp(true);
    for (const s of screens) $('screen-' + s).hidden = s !== 'study';
    document.body.classList.add('studying');
    document.querySelectorAll('.navbtn').forEach(b => b.setAttribute('aria-current', 'false'));
    showCard(session.next(), true);
  }

  // Session done: only what helps next. When to come back (and how many), what was missed
  // (each with its Help, the best moment to read it), and a way to keep going.
  let lastStart = null;
  function endSession(showSummary) {
    if (!session) return;
    const s = session;
    session = null;
    current = null;
    pushSoon();
    if (!showSummary) return;
    const first = [...s.firstTry.entries()];
    const right = first.filter(([, ok]) => ok).length;
    const cards = [...s.byId.values()];
    const decks = [...new Set(cards.map(c => c.deck))];
    const pool = decks.flatMap(id => activeCards(id));
    const sts = statesFor(pool);
    const dueBy = day => pool.filter(c => sts[c.id].phase !== 'new' && sts[c.id].due != null && sts[c.id].due <= day).length;
    const tomorrow = dueBy(today() + 1);
    const later = pool.map(c => sts[c.id]).filter(st => st.phase !== 'new' && st.due != null && st.due > today()).map(st => st.due).sort((x, y) => x - y)[0];
    const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
    $('doneNext').textContent = s.remaining
      ? (s.timeUp ? 'Time’s up. ' : '') + `${plural(s.remaining, 'card')} still waiting for today.`
      : tomorrow ? `Come back tomorrow: ${plural(tomorrow, 'card')} will be due.`
      : later != null ? `Next review: ${fmtDay(later)} (${plural(dueBy(later), 'card')}).` : 'Nothing is due yet. New cards are waiting when you want them.';
    $('doneSub').textContent = first.length
      ? `${plural(first.length, 'card')} studied, ${right} right the first time.` + (right < first.length * 0.7 ? ' A lot of misses means the cards are at the right difficulty: hard recall now is what makes it stick.' : '')
      : '';
    // Missed: right on the first try = no; most recent first.
    const missed = first.filter(([, ok]) => !ok).map(([id]) => s.byId.get(id)).filter(Boolean);
    const lastMath = mathOn;
    $('missedList').replaceChildren(...missed.slice(0, 30).map(c => {
      mathOn = !!(deckById.get(c.deck) || {}).math;
      const row = h('div', { class: 'grow' }, h('span', { class: 'mq' }, math(c.prompt || c.title || c.id)),
        FC.help && FC.help[c.id] ? h('button', { class: 'linkbtn', type: 'button', onclick: () => openHelp(c) }, 'Help') : null);
      return row;
    }));
    mathOn = lastMath;
    for (const id of ['missedHead', 'missedList', 'missedFoot']) $(id).hidden = !missed.length;
    const more = lastStart && !lastStart.opts.queue ? queueFor(lastStart.cards, statesFor(lastStart.cards)).length : 0;
    $('doneMore').hidden = !more;
    $('doneMore').textContent = more ? `Keep going (${more})` : 'Keep going';
    document.body.classList.remove('studying');
    closeHelp(true);
    for (const name of screens) $('screen-' + name).hidden = name !== 'done';
    $('navBack').hidden = true;
    $('navSettings').hidden = false;
    window.scrollTo(0, 0);
  }
  $('doneBack').addEventListener('click', () => show(returnTo));
  $('doneMore').addEventListener('click', () => { if (lastStart) startSession(lastStart.opts.from === 'classes' ? activeCards(openDeck) : lastStart.cards, lastStart.opts); });

  // How a card is answered (owner + research, 2026-10-17): thinking the answer retains as well
  // as typing it (Smith, Roediger & Karpicke 2013), but multi-point answers are only graded
  // honestly when written out (Dunlosky 2011). So one-idea recall cards are Quick (think,
  // show the answer, mark it); recall with several points is Write (type, tick the points).
  // A card can force either with `mode: 'quick' | 'write'`.
  const isQuick = c => c.type === 'recall' && (c.mode === 'quick' || (c.mode !== 'write' && (!c.points || c.points.length <= 1)));
  const TYPE_LABEL = { recall: 'Write', typed: 'Short answer', mc: 'Choose', order: 'Put in order', cloze: 'From your notes', set: 'List them' };

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
    const lecInfo = deck.lectures.find(l => String(l.n) === String(card.lecture));
    const where = card.lecture === 'paper' ? 'Reading' : deck.lectures.length <= 1 ? ''
      : /^\d+(\.\d+)?$/.test(card.lecture) ? `Lecture ${card.lecture}` : lecInfo ? lecInfo.title : '';
    const kind = card.generated ? 'Practice' : isQuick(card) ? (card.graduated ? 'Recall' : 'Quick') : card.blank ? 'Fill the blank' : card.type === 'typed' && card.code ? 'Trace' : TYPE_LABEL[card.type];
    // Fields across the top of the ticket, boarding-pass style: label above, value below.
    const status = current && current.progress && current.progress.learning ? `New ${current.progress.done}/${sched.LEARN_CRITERION}` : current && current.progress ? 'Review' : '';
    const field = (label, value, full) => value ? h('span', { class: 'qfield', title: full || null }, h('small', null, label), h('span', null, value)) : null;
    $('qlabel').replaceChildren(...[field(/^Lecture /.test(where) ? 'Lecture' : 'From', where.replace(/^Lecture /, ''), where), field('Card', status), field('Kind', kind)].filter(Boolean));
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
    // Drawn trees size themselves on the next frame; size them now so the text is fitted
    // around their real height (otherwise the screen overflows a frame later).
    sec.querySelectorAll('.ftree').forEach(b => b.fit && b.fit());
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
    // The newcomer's hint under Guess/Sure only stays if the card still fits comfortably with it.
    const hint = sec.querySelector('.commit-hint:not([hidden])');
    if (hint && (sec.classList.contains('fit-overflow') || sc < 0.9)) { hint.hidden = true; fitAsk(); }
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
    let card = base.type === 'gen' && FC.gen ? Object.assign(FC.gen.instance(base.generator), { deck: base.deck, cat: base.cat, sub: base.sub }) : base;
    // Multiple choice graduates: once a card has been right on a later day, it is asked
    // without the options (recall beats recognition once you can usually succeed:
    // Smith & Karpicke 2014). Cards whose question needs the options say noRecall.
    if (card.type === 'mc' && !card.noRecall) {
      const st = sched.states(events, [base], { examDay: examDay(base.deck) })[base.id];
      if (st.phase === 'review' && st.step >= 1) card = Object.assign({}, card, { type: 'recall', mode: 'quick', points: [card.answer], graduated: true });
    }
    current = { card, pending: null, progress: learnProgress(base) };
    $('screen-study').classList.remove('answered');
    $('helpBtn').hidden = !(FC.help && FC.help[card.id]);
    if ($('reportBox')) $('reportBox').remove();
    paintClass(card.deck);
    $('studyTitle').textContent = (deckById.get(card.deck) || {}).short || '';
    // The cards still to come peek out above this one (at most two edges).
    $('stackEdges').replaceChildren(...Array.from({ length: Math.min(2, session.remaining - 1) }, () => h('i')));
    const area = $('answerArea'), actions = $('actions'), ticket = $('ticket');
    // Render, then fit while the content is still invisible, so the new card appears at its final size.
    const render = () => { fillQuestion(card); paintCounter(first); area.replaceChildren(buildAnswer(card)); $('qcard').scrollTop = 0; area.scrollTop = 0; fitAsk(); };
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (first || !window.gsap || still) { render(); focusFirst(); return; }
    // The answered card is put away (up and off, like a used pass) and the next one rises
    // from the stack underneath.
    animating = true;
    gsap.killTweensOf([ticket, actions]);
    gsap.timeline()
      .to([ticket, actions], { y: -28, scale: 0.97, opacity: 0, duration: 0.2, ease: 'power2.in' })
      .add(render)
      .set([ticket, actions], { y: 18, scale: 0.985 })
      .to([ticket, actions], { y: 0, scale: 1, opacity: 1, duration: 0.34, ease: 'expo.out', clearProps: 'transform', onComplete: () => { animating = false; focusFirst(); } });
  }

  // Cards left: a disposable camera's exposure counter. The number rolls to the next one.
  let shownLeft = null;
  function paintCounter(first) {
    const n = session.remaining, mins = Math.floor((Date.now() - session.started) / 60000);
    const time = isFinite(session.limitMs) ? h('span', { class: 'timeleft' }, `· ${mins} of ${Math.round(session.limitMs / 60000)} min`) : null;
    const rolls = !first && shownLeft != null && shownLeft !== n && !matchMedia('(prefers-reduced-motion: reduce)').matches;
    const roll = h('span', { class: 'roll' }, ...(rolls ? [h('span', null, String(shownLeft)), h('span', null, String(n))] : [h('span', null, String(n))]));
    $('leftCount').replaceChildren(h('span', { class: 'film', role: 'img', 'aria-label': `${n} card${n === 1 ? '' : 's'} left` }, roll), h('span', null, 'left'), time);
    if (rolls) requestAnimationFrame(() => requestAnimationFrame(() => roll.classList.add('rolling')));
    shownLeft = n;
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
    if (isQuick(card)) {
      wrap.append(h('p', { class: 'quick-cue' }, 'Say or think the answer, then show it.'));
      read = () => ({ given: '', ready: true });
    } else if (card.type === 'recall') {
      const ta = h('textarea', { id: 'ans', 'aria-label': 'Your answer', placeholder: 'Write your answer, even a rough one…', spellcheck: 'false' });
      wrap.append(ta);
      read = () => ({ given: ta.value, ready: ta.value.trim().length > 0 });
      ta.addEventListener('keydown', e => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); e.stopPropagation(); submit(!e.shiftKey); }
      });
    } else if (card.type === 'typed' || card.type === 'cloze' || card.type === 'set') {
      const input = h('input', { type: 'text', id: 'ans', class: card.verify ? 'mono' : null, 'aria-label': 'Your answer',
        autocomplete: 'off', autocapitalize: 'off', autocorrect: 'off', spellcheck: 'false',
        placeholder: card.type === 'set' ? 'Separate items with commas (any order)' : card.verify ? 'The exact output' : 'Your answer' });
      wrap.append(input);
      read = () => ({ given: input.value, ready: input.value.trim().length > 0 });
      // stopPropagation: the same Enter must not reach the document handler, which would
      // see the new pending answer and skip straight past the feedback.
      input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); submit(!e.shiftKey); } });
    } else if (card.type === 'mc') {
      const opts = sched.shuffled([card.answer].concat(card.options));
      let chosen = null;
      const box = h('div', { class: 'opts', role: 'group', 'aria-label': 'Options' });
      opts.forEach((o, i) => {
        const tick = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        tick.setAttribute('class', 'tick'); tick.setAttribute('viewBox', '0 0 22 18'); tick.setAttribute('aria-hidden', 'true');
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path'); path.setAttribute('d', 'M3 9.5 L8.5 15 L19 3');
        tick.append(path);
        const b = h('button', { class: 'opt', type: 'button', 'aria-pressed': 'false', 'data-opt': o, onclick: () => pick(i) },
          h('span', { class: 'ot', 'data-fit': '', 'data-text': o }, math(o)), h('span', { class: 'kbd' }, `${i + 1}`), tick);
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

    // UIAlertController's joined pair (Guess | Sure); "I don't know" stands apart, like Cancel.
    const multi = card.type === 'recall' || card.type === 'tree' || card.type === 'fill';
    const sureBtn = h('button', { class: 'btn primary', type: 'button', title: 'You know it', onclick: () => submit(true) }, 'Sure', h('span', { class: 'kbd' }, multi ? 'Ctrl ⏎' : '⏎'));
    const guessBtn = h('button', { class: 'btn', type: 'button', title: 'You’re not certain: it comes back sooner', onclick: () => submit(false) }, 'Guess', h('span', { class: 'kbd' }, multi ? 'Ctrl ⇧⏎' : '⇧⏎'));
    const idkBtn = h('button', { class: 'btn idk', type: 'button', onclick: () => giveUp() }, 'I don’t know');
    // First sessions only: what Guess and Sure mean (a guessed right answer isn't counted as learned).
    const newcomer = events.filter(e => e.k === 'r').length < 15;
    if (isQuick(card)) {
      const show = h('button', { class: 'btn primary big', type: 'button', id: 'showBtn', onclick: () => submit(true) }, 'Show answer', h('span', { class: 'kbd' }, 'Space'));
      $('actions').replaceChildren(show);
      wrap.read = read; current && (current.ui = wrap);
      return wrap;
    }
    $('actions').replaceChildren(h('div', { class: 'commit' }, idkBtn, h('div', { class: 'pair' }, guessBtn, sureBtn)),
      newcomer ? h('p', { class: 'commit-hint' }, 'Sure: you know it. Guess: you’re not certain (it comes back sooner).') : null);
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
    current.pending = { ok: isCorrect(card, given), sure, given, override: false, quick: isQuick(card) };
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
    const selfGrade = card.type === 'recall' && !p.gaveUp && !p.quick;
    const verdict = h('div', { class: 'verdict' });
    const alert = h('div', { class: 'alert', 'data-fit': '' });
    // A teacher's pen mark, drawn stroke by stroke: a tick for right, a cross for wrong. The
    // word beside it says the same, so the verdict never rests on colour alone.
    const pen = kind => {
      const svg = document.createElementNS(SVG, 'svg');
      svg.setAttribute('class', 'pen'); svg.setAttribute('viewBox', '0 0 34 26'); svg.setAttribute('aria-hidden', 'true');
      for (const d of kind === 'tick' ? ['M5 14 L13 21 L29 4'] : ['M8 5 L26 21', 'M26 5 L8 21']) svg.append(s('path', { d }));
      return svg;
    };
    function paintVerdict() {
      fb.classList.toggle('good', p.ok === true);
      fb.classList.toggle('bad', p.ok === false && !p.gaveUp);
      const word = p.ok === null ? (p.quick ? 'Did you have it?' : 'How did you do?') : p.ok ? (p.sure ? 'Right' : 'Right (a guess)') : p.gaveUp ? 'Here’s the answer' : 'Not quite';
      verdict.replaceChildren(...(p.ok === true ? [pen('tick')] : p.ok === false && !p.gaveUp ? [pen('cross')] : []), h('span', { 'data-fit': '' }, word));
      alert.hidden = true;
    }
    if (selfGrade || p.quick) p.ok = null;
    paintVerdict();
    fb.append(verdict, alert);

    // Your answer, then the right one (the input is gone once feedback shows).
    const numbered = list => math(list.map((t, i) => `${i + 1}. ${t}`).join('\n'));
    const hasMath = [].concat(card.answer).some(t => /\$/.test(String(t)));
    const mono = card.verify || (card.type === 'order' && !hasMath) ? ' mono' : '';
    if (!p.quick && p.given && p.given.length) {
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
      fb.append(h('div', { class: 'fb-block fb-tree' }, p.gaveUp && label === 'Answer' ? null : h('div', { class: 'label' }, label), FC.tree.draw(tree, opts), strip));
    } else if (card.type === 'tree') {
      // One tree: the right one, with red where yours has a different node or none.
      const m = !p.ok && p.given && p.given.kids && p.given.kids.length ? FC.tree.mistakesOn(p.given, card.answer) : null;
      const label = !m ? 'Answer' : `Answer (red = where yours differs${m.extra ? `; yours also has ${m.extra} extra node${m.extra > 1 ? 's' : ''}` : ''})`;
      fb.classList.add('fb-fill');
      fb.append(h('div', { class: 'fb-block fb-tree' }, p.gaveUp ? null : h('div', { class: 'label' }, label),
        FC.tree.draw(card.answer, { render: math, wrong: m ? m.marks : null, fill: true })));
    } else if (!(card.type === 'mc' && p.ok) && !answerIsChecklist) {
      fb.append(h('div', { class: 'fb-block' }, p.gaveUp ? null : h('div', { class: 'label' }, card.type === 'recall' && !card.blank && !p.quick ? 'Model answer' : 'Answer'),
        h('div', { class: 'val' + mono, 'data-fit': 'pre' }, card.type === 'order' ? numbered(card.answer) : mono ? card.answer : math(Array.isArray(card.answer) ? card.answer.join(', ') : card.answer))));
    }
    // Generated problems can carry a graph drawn from this instance's own numbers.
    if (card.graph) fb.append(h('div', { class: 'fb-block' }, plot(card.graph, true)));
    if (card.rtree) fb.append(h('div', { class: 'fb-block' }, drawTree(card.rtree, { compact: true })));
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
    if (p.quick) {
      // Quick: you thought of an answer; say honestly whether it matched.
      const missed = h('button', { class: 'btn', type: 'button', id: 'missBtn', onclick: () => { p.ok = false; cont(); } }, 'Missed it', h('span', { class: 'kbd' }, '1'));
      const got = h('button', { class: 'btn primary', type: 'button', id: 'contBtn', onclick: () => { p.ok = true; cont(); } }, 'Got it', h('span', { class: 'kbd' }, '2'));
      row.className = 'commit'; row.append(h('div', { class: 'pair', style: 'flex:1' }, missed, got));
    } else if (selfGrade) {
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
    if (e.defaultPrevented || $('screen-study').hidden || !$('screen-help').hidden || !current || animating) return;
    const typing = /^(INPUT|TEXTAREA)$/.test(document.activeElement?.tagName) && !document.activeElement.disabled;
    if (current.pending) {
      if (current.pending.quick && current.pending.ok === null) {
        if (e.key === '1') { e.preventDefault(); $('missBtn')?.click(); }
        if (e.key === '2') { e.preventDefault(); $('contBtn')?.click(); }
        return;
      }
      if (current.card.type === 'recall' && current.pending.ok === null && !current.pending.gaveUp) {
        if (e.key === 'Enter' && !e.repeat && document.activeElement?.tagName !== 'INPUT') { e.preventDefault(); $('contBtn')?.click(); }
        return;
      }
      if (e.key === 'Enter' && !e.repeat) { e.preventDefault(); commit(); }
      return;
    }
    if (typing) return;
    const ui = current.ui;
    if (isQuick(current.card) && (e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); submit(true); return; }
    if (current.card.type === 'mc' && /^[1-9]$/.test(e.key) && +e.key <= ui.optCount) ui.pick(+e.key - 1);
    if (e.key === 'Enter' && ['mc', 'order', 'swaps', 'path'].includes(current.card.type)) { e.preventDefault(); submit(!e.shiftKey); }
  });

  // ── Settings + sync ────────────────────────────────────────────────────
  function renderSettings() {
    $('token').value = store.getItem(TOKEN_KEY) || '';
    $('logSize').textContent = `${events.filter(e => e.k === 'r').length} answers saved on this device.`;
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

  // Sync status, in words beside the dot (a dot alone means nothing to a new user).
  function setSync(state, message) {
    $('syncDot').className = 'sync-dot' + (state ? ' ' + state : '');
    $('syncDot').setAttribute('aria-hidden', 'true');
    $('syncLabel').textContent = state === 'ok' ? 'Synced' : state === 'busy' ? 'Syncing…' : state === 'err' ? 'Sync failed' : 'Not synced';
    $('syncLabel').title = message || 'Progress is saved on this device. Add a sync key in Settings to share it with your other devices.';
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
        if (!$('screen-settings').hidden) renderSettings();
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
