// UI controller: Home, Study, Settings. All card text goes through
// textContent (never innerHTML): the page holds a GitHub token.
(function (FC) {
  'use strict';

  const { log, sched, grade } = FC;
  const deck = FC.decks.csc370;
  const $ = id => document.getElementById(id);
  const DAY_MS = sched.DAY;

  // ── State ──────────────────────────────────────────────────────────────
  let events = log.load();
  const SETTINGS_KEY = 'fc.settings', TOKEN_KEY = 'fc.token';
  const store = log._store();
  let settings = Object.assign({ newPerDay: 10, examDate: '' }, readJSON(SETTINGS_KEY));
  let session = null;   // sched.Session plus bookkeeping
  let current = null;   // { card, pending } for the card on screen
  // ?nocode hides every card that shows code; ?all lifts the new-cards-per-day limit.
  const params = new URLSearchParams(location.search);
  const NO_CODE = params.has('nocode'), ALL_NEW = params.has('all');
  const newPerDay = () => (ALL_NEW ? 1e9 : settings.newPerDay);

  function readJSON(key) { try { return JSON.parse(store.getItem(key)) || {}; } catch (e) { return {}; } }
  function saveSettings() { store.setItem(SETTINGS_KEY, JSON.stringify(settings)); }

  // DOM helper: h('div', { class: 'x', onclick }, 'text', child)
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
  function examDay() {
    if (!settings.examDate) return null;
    const [y, m, d] = settings.examDate.split('-').map(Number);
    return sched.dayOf(new Date(y, m - 1, d, 12).getTime());
  }

  // Deck cards plus one "fill the blank" card per lecture blank. Blank answers come
  // from decks/csc370-blank-answers.js (each labelled with where it came from); an
  // answer the owner typed in an older version of the app wins over the supplied one.
  const BASIS = {
    slides: 'from her own slides/tests',
    sebesta: 'from Sebesta, the course textbook (not her slide)',
    history: 'historical fact (not her slide)',
    inferred: 'best guess: check it against your class notes',
  };
  function allCards() {
    const mine = log.blankAnswers(events);
    const supplied = FC.blankAnswers || {};
    const rank = new Map(deck.lectures.map((l, i) => [l.n, i]));
    const blanks = deck.blanks.filter(b => mine[b.id] || supplied[b.id]).map(b => {
      const own = mine[b.id], sup = supplied[b.id] || {};
      return {
        id: 'blank:' + b.id, lecture: b.lecture, type: 'recall', blank: true, prompt: b.prompt,
        answer: own || sup.answer, points: [own || sup.answer], basis: own ? 'mine' : sup.basis,
        why: own ? '' : (sup.note || ''),
        source: `Lecture ${b.lecture}, slide ${b.slide} · ` + (own ? 'your own answer' : BASIS[sup.basis] || 'supplied'),
      };
    });
    return blanks.concat(deck.cards)
      .filter(c => !(NO_CODE && c.code))
      .map((c, i) => [c, i])
      .sort((a, b) => rank.get(a[0].lecture) - rank.get(b[0].lecture) || a[1] - b[1])
      .map(x => x[0]);
  }

  // ── Navigation ─────────────────────────────────────────────────────────
  const screens = ['home', 'study', 'done', 'settings'];
  function show(name) {
    document.body.classList.remove('studying');
    if (name !== 'study' && session) endSession(false);
    for (const s of screens) $('screen-' + s).hidden = s !== name;
    document.querySelectorAll('.navbtn').forEach(b => b.setAttribute('aria-current', b.dataset.nav === name ? 'page' : 'false'));
    if (name === 'home') renderHome();
    if (name === 'settings') renderSettings();
    window.scrollTo(0, 0);
  }
  document.querySelectorAll('[data-nav]').forEach(b => b.addEventListener('click', () => show(b.dataset.nav)));

  // ── Home ───────────────────────────────────────────────────────────────
  function renderHome() {
    const cards = allCards();
    const t = today();
    const sts = sched.states(events, cards, { examDay: examDay() });
    const queue = sched.buildQueue(sts, cards, t, { newPerDay: newPerDay(), shuffle: x => x });
    const due = queue.filter(id => sts[id].phase !== 'new').length;
    const fresh = queue.length - due;
    $('dueCount').textContent = due;
    $('newCount').textContent = fresh;
    $('studyBtn').disabled = queue.length === 0;
    const left = cards.filter(c => sts[c.id].phase === 'new').length;
    $('studyNote').textContent = queue.length ? ''
      : left ? 'All done for today. More cards to learn unlock tomorrow (or raise the daily limit in Settings).'
      : 'All done for today: you have started every card.';

    const r = sched.delayedRecall(events, t, 14);
    $('recallPct').textContent = r.total ? Math.round(100 * r.right / r.total) + '%' : '—';
    $('recallNote').textContent = r.total
      ? `You got ${r.right} of ${r.total} right when a card came back hours or days later`
      : 'Starts tomorrow: it counts how many cards you still remember when they come back.';

    const list = $('lectureList');
    list.replaceChildren();
    for (const lec of deck.lectures) {
      const lc = cards.filter(c => c.lecture === lec.n);
      const mastered = lc.filter(c => sts[c.id].mastered).length;
      const started = lc.filter(c => sts[c.id].phase !== 'new' && !sts[c.id].mastered).length;
      const pct = n => lc.length ? (100 * n / lc.length) + '%' : '0%';
      list.append(h('div', { class: 'lec' },
        h('div', { class: 'lec-head' }, `${lec.n} · ${lec.title}`),
        h('div', { class: 'bar', role: 'img', 'aria-label': `${mastered} mastered, ${started} started, of ${lc.length} cards` },
          h('i', { class: 'm', style: `width:${pct(mastered)}` }),
          h('i', { class: 'l', style: `width:${pct(started)}` })),
        h('div', { class: 'lec-sub' }, `${lc.length} cards · ${started} started · ${mastered} mastered`)));
    }
    const ed = examDay();
    $('examLine').textContent = ed == null ? 'No exam date set (Settings). Reviews follow the normal 1 · 3 · 7 · 14 · 30-day ladder.'
      : ed >= t ? `Exam in ${ed - t} day${ed - t === 1 ? '' : 's'}: review gaps are capped to fit.` : 'Exam date has passed: normal review gaps.';
  }

  // ── Study ──────────────────────────────────────────────────────────────
  $('studyBtn').addEventListener('click', async () => {
    // Pull first, so a card another device already reviewed today is not asked again.
    const btn = $('studyBtn');
    if (store.getItem(TOKEN_KEY)) {
      btn.disabled = true; btn.textContent = 'Syncing…';
      await Promise.race([syncNow(), new Promise(r => setTimeout(r, 5000))]); // offline: study anyway
      btn.textContent = 'Study';
    }
    startSession();
  });
  $('endBtn').addEventListener('click', () => endSession(true));

  function startSession() {
    const cards = allCards();
    const sts = sched.states(events, cards, { examDay: examDay() });
    const queue = sched.buildQueue(sts, cards, today(), { newPerDay: newPerDay() });
    if (!queue.length) { renderHome(); return; } // a sync may have just finished today's work
    session = new sched.Session(queue);
    session.byId = new Map(cards.map(c => [c.id, c]));
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
    const cards = allCards();
    const sts = sched.states(events, cards, { examDay: examDay() });
    const tomorrow = cards.filter(c => sts[c.id].phase === 'review' && sts[c.id].due === today() + 1).length;
    $('doneNext').textContent = s.remaining
      ? `${s.remaining} card${s.remaining === 1 ? '' : 's'} left in today’s queue. They will still be due when you come back.`
      : `${tomorrow} card${tomorrow === 1 ? '' : 's'} to review tomorrow.`;
    document.body.classList.remove('studying');
    for (const name of screens) $('screen-' + name).hidden = name !== 'done';
    window.scrollTo(0, 0);
  }

  const TYPE_LABEL = { recall: 'Explain', typed: 'Short answer', mc: 'Choose', order: 'Put in order', cloze: 'From your notes' };

  function fillQuestion(card) {
    const lec = deck.lectures.find(l => l.n === card.lecture);
    $('qlabel').textContent = `Lecture ${card.lecture} · ${card.blank ? 'Fill the blank' : card.type === 'typed' && card.code ? 'Trace' : TYPE_LABEL[card.type]}`;
    $('qlabel').title = lec ? lec.title : '';
    $('qprompt').textContent = card.prompt;
    $('qcode').hidden = !card.code;
    $('qcode').textContent = card.code || '';
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
        text: el.dataset.text ?? el.textContent, pre: el.dataset.fit === 'pre',
        weight: cs.fontWeight, size: px(cs.fontSize), family: cs.fontFamily, lh: px(cs.lineHeight),
        width: r.width - px(cs.paddingLeft) - px(cs.paddingRight) - px(cs.borderLeftWidth) - px(cs.borderRightWidth),
        dom: r.height - px(cs.paddingTop) - px(cs.paddingBottom) - px(cs.borderTopWidth) - px(cs.borderBottomWidth),
      };
    });
  }

  // Largest scale in [FIT_MIN, FIT_MAX] where chrome + all text fits `available`;
  // null if even FIT_MIN is too big.
  function searchScale(blocks, chrome, available) {
    const total = sc => chrome + blocks.reduce((sum, b) =>
      sum + pretextHeight(b.text, `${b.weight} ${b.size * sc}px ${b.family}`, b.width, b.lh * sc, b.pre), 0);
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
    sec.classList.remove('fit-measure');
    let sc = searchScale(blocks, natural - blocks.reduce((t, b) => t + b.dom, 0), available);
    if (sc === null) { sc = FIT_MIN; sec.classList.add('fit-overflow'); }
    const apply = v => { sec.style.setProperty('--fit-q', v); sec.style.setProperty('--fit-a', v); };
    apply(sc);
    // Pretext and the DOM agree to well under a pixel per block; this only catches
    // rounding at an exact boundary.
    for (let k = 0; k < 6 && sc > FIT_MIN && overflowing(); k++) apply(sc = Math.max(FIT_MIN, sc - 0.03));
    if (overflowing()) sec.classList.add('fit-overflow');
  }

  // Feedback: the question keeps its size; the feedback gets the space below it.
  function fitFeedback() {
    if (!window.Pretext || !current) return;
    const area = $('answerArea'), fb = area.firstElementChild;
    if (!fb) return;
    area.style.setProperty('--fit-a', 1);
    const blocks = textBlocks(area);
    const chrome = fb.getBoundingClientRect().height - blocks.reduce((t, b) => t + b.dom, 0);
    let sc = searchScale(blocks, chrome, area.clientHeight);
    // Feedback too long for the space left under the question: shrink both together.
    if (sc === null) { area.style.removeProperty('--fit-a'); fitAsk(); return; }
    area.style.setProperty('--fit-a', sc);
    for (let k = 0; k < 6 && sc > FIT_MIN && area.scrollHeight > area.clientHeight + 1; k++) area.style.setProperty('--fit-a', sc = Math.max(FIT_MIN, sc - 0.03));
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
    const card = session.byId.get(id);
    current = { card, pending: null };
    $('leftCount').textContent = `${session.remaining} left`;
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
    } else if (card.type === 'typed' || card.type === 'cloze') {
      const input = h('input', { type: 'text', id: 'ans', class: card.verify ? 'mono' : null, 'aria-label': 'Your answer',
        autocomplete: 'off', autocapitalize: 'off', autocorrect: 'off', spellcheck: 'false',
        placeholder: card.verify ? 'Exact output (spacing and line breaks don’t matter)' : 'Your answer' });
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
        const b = h('button', { class: 'opt', 'aria-pressed': 'false', 'data-opt': o, 'data-fit': '', 'data-text': o, onclick: () => pick(i) }, h('span', { class: 'kbd' }, `${i + 1}`), ' ', o);
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
        ans.replaceChildren(...(placed.length ? placed.map((t, i) => h('button', { class: 'tile', 'data-fit': '', 'data-text': t, onclick: () => { placed.splice(i, 1); pool.push(t); draw(); } }, h('span', { class: 'num' }, `${i + 1}.`), t))
          : [h('div', { class: 'tiles-empty' }, 'Tap tiles below in order. Tap a placed tile to take it back.')]));
        src.replaceChildren(...pool.map((t, i) => h('button', { class: 'tile', 'data-fit': '', 'data-text': t, onclick: () => { pool.splice(i, 1); placed.push(t); draw(); } }, t)));
        src.hidden = pool.length === 0;
        updateReady();
      }
      wrap.append(ans, src);
      read = () => ({ given: placed.slice(), ready: pool.length === 0 });
      wrap.draw = draw;
    }

    const sureBtn = h('button', { class: 'btn primary', onclick: () => submit(true) }, 'Sure', h('span', { class: 'kbd' }, card.type === 'recall' ? 'Ctrl+⏎' : '⏎'));
    const guessBtn = h('button', { class: 'btn', onclick: () => submit(false) }, 'Guess', h('span', { class: 'kbd' }, card.type === 'recall' ? 'Ctrl+⇧⏎' : '⇧⏎'));
    const idkBtn = h('button', { class: 'btn', onclick: () => giveUp() }, 'I don’t know');
    $('actions').replaceChildren(h('div', { class: 'btn-row' }, idkBtn, guessBtn, sureBtn));
    function updateReady() { const r = read().ready; sureBtn.disabled = !r; guessBtn.disabled = !r; }
    wrap.addEventListener('input', updateReady);
    if (wrap.draw) wrap.draw(); else updateReady();
    wrap.read = read;
    current && (current.ui = wrap);
    return wrap;
  }

  function isCorrect(card, given) {
    if (card.type === 'typed') return grade.typed(given, card);
    if (card.type === 'cloze') return grade.cloze(given, card.answer);
    if (card.type === 'mc') return given === card.answer;
    if (card.type === 'order') return grade.order(given, card.answer);
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

    const fb = h('div', { class: 'feedback', role: 'status', 'aria-live': 'polite' });
    const selfGrade = card.type === 'recall' && !p.gaveUp;
    const verdict = h('div', { class: 'verdict', 'data-fit': '' });
    const alert = h('div', { class: 'alert', 'data-fit': '' });
    function paintVerdict() {
      fb.classList.toggle('good', p.ok === true);
      fb.classList.toggle('bad', p.ok === false);
      verdict.textContent = p.ok === null ? 'Compare with the model answer' : p.ok ? (p.sure ? 'Correct' : 'Correct, but you guessed') : p.gaveUp ? 'Here’s the answer' : 'Not quite';
      // Confident errors are the ones feedback fixes best (Butterfield & Metcalfe 2001).
      alert.textContent = p.ok === false && p.sure && !p.gaveUp ? 'You were sure. Read this one carefully: it’s the kind feedback fixes best.' : '';
      alert.hidden = !alert.textContent;
    }
    if (selfGrade) p.ok = null;
    paintVerdict();
    fb.append(verdict, alert);

    // Your answer, then the right one (the input is gone once feedback shows).
    const numbered = list => list.map((t, i) => `${i + 1}. ${t}`).join('\n');
    const mono = card.verify || card.type === 'order' ? ' mono' : '';
    if (p.given && p.given.length) {
      const yours = card.type === 'order' ? 'Your order' : card.type === 'mc' ? 'You chose' : 'You wrote';
      fb.append(h('div', { class: 'fb-block' }, h('div', { class: 'label' }, yours),
        h('div', { class: 'val' + mono, 'data-fit': 'pre' }, Array.isArray(p.given) ? numbered(p.given) : p.given)));
    }
    if (!(card.type === 'mc' && p.ok)) {
      fb.append(h('div', { class: 'fb-block' }, h('div', { class: 'label' }, card.blank ? 'Answer' : card.type === 'recall' ? 'Model answer' : 'Answer'),
        h('div', { class: 'val' + mono, 'data-fit': 'pre' }, card.type === 'order' ? numbered(card.answer) : card.answer)));
    }
    if (card.blank && card.basis === 'inferred') {
      fb.append(h('div', { class: 'alert', 'data-fit': '' }, 'This blank’s answer is a best guess. Check it against your class notes.'));
    }
    if (card.type === 'recall' && !card.blank) {
      fb.append(h('div', { class: 'fb-block' }, h('div', { class: 'label' }, 'Count it if you had'), h('ul', { class: 'points' }, card.points.map(pt => h('li', { 'data-fit': '' }, pt)))));
    }
    if (card.why) fb.append(h('p', { class: 'why', 'data-fit': '' }, card.why));
    fb.append(h('p', { class: 'source', 'data-fit': '' }, card.source));

    const row = h('div', { class: 'btn-row' });
    const cont = () => commit();
    if (selfGrade) {
      // Self-grade against the key points (L14). Nothing is recorded until one is chosen.
      row.append(
        h('button', { class: 'btn', onclick: () => { p.ok = false; cont(); } }, 'Missed it', h('span', { class: 'kbd' }, '1')),
        h('button', { class: 'btn primary', onclick: () => { p.ok = true; cont(); } }, 'Got it', h('span', { class: 'kbd' }, '2')));
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
    log.append(events, fields);
    if (!session.firstTry.has(card.id)) session.firstTry.set(card.id, !!(p.ok && p.sure));
    const st = sched.states(events, [card], { examDay: examDay() })[card.id];
    session.record(card.id, {
      ok: p.ok, sure: p.sure,
      learningShort: st.phase === 'learning' && st.successesToday(today()) < sched.LEARN_CRITERION,
    });
    current.pending = null;
    if (session.remaining === 0) { endSession(true); return; }
    showCard(session.next(), false);
  }

  // Keyboard: answer shortcuts while answering; Enter / 1 / 2 on feedback.
  document.addEventListener('keydown', e => {
    if (e.defaultPrevented || $('screen-study').hidden || !current || animating) return;
    const typing = /^(INPUT|TEXTAREA)$/.test(document.activeElement?.tagName) && !document.activeElement.disabled;
    if (current.pending) {
      if (current.card.type === 'recall' && current.pending.ok === null && !current.pending.gaveUp) {
        if (e.key === '1') { current.pending.ok = false; commit(); }
        if (e.key === '2') { current.pending.ok = true; commit(); }
        return;
      }
      if (e.key === 'Enter' && !e.repeat) { e.preventDefault(); commit(); }
      return;
    }
    if (typing) return;
    const ui = current.ui;
    if (current.card.type === 'mc' && /^[1-9]$/.test(e.key) && +e.key <= ui.optCount) ui.pick(+e.key - 1);
    if (e.key === 'Enter' && (current.card.type === 'mc' || current.card.type === 'order')) { e.preventDefault(); submit(!e.shiftKey); }
  });

  // ── Settings + sync ────────────────────────────────────────────────────
  function renderSettings() {
    $('examDate').value = settings.examDate || '';
    $('newPerDay').value = settings.newPerDay;
    $('token').value = store.getItem(TOKEN_KEY) || '';
    $('logSize').textContent = `${events.length} events stored on this device.`;
  }
  $('examDate').addEventListener('change', e => { settings.examDate = e.target.value; saveSettings(); });
  $('newPerDay').addEventListener('change', e => {
    const n = Math.max(0, Math.min(60, Math.round(+e.target.value || 0)));
    settings.newPerDay = n; e.target.value = n; saveSettings();
  });
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
        if (!$('screen-home').hidden) renderHome();
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
    if (!$('screen-home').hidden) renderHome();
  });

  // ── Boot ───────────────────────────────────────────────────────────────
  show('home');
  if (store.getItem(TOKEN_KEY)) syncNow(); else setSync('', '');

  // For tests (Playwright): measurement accuracy is checked against the real layout.
  FC.app = { allCards, fillQuestion, fitAsk, fitFeedback, renderNow: id => showCard(id, true), get events() { return events; }, get session() { return session; } };
})(globalThis.FC = globalThis.FC || {});
