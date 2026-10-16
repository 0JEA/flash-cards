// UI controller: Home, Study, Fill blanks, Settings. All card text goes through
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
  let blankLecture = deck.lectures[0].n;

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

  // Deck cards plus one cloze card per filled blank. Within a lecture, cloze cards
  // (the lecture's own words) come before the deck's cards; new cards go in this order.
  function allCards() {
    const answers = log.blankAnswers(events);
    const rank = new Map(deck.lectures.map((l, i) => [l.n, i]));
    const cloze = deck.blanks.filter(b => answers[b.id]).map(b => ({
      id: 'blank:' + b.id, lecture: b.lecture, type: 'cloze', prompt: b.prompt,
      answer: answers[b.id], why: '', source: `Your notes · lecture ${b.lecture}, slide ${b.slide}`,
    }));
    return cloze.concat(deck.cards)
      .map((c, i) => [c, i])
      .sort((a, b) => rank.get(a[0].lecture) - rank.get(b[0].lecture) || a[1] - b[1])
      .map(x => x[0]);
  }

  // ── Navigation ─────────────────────────────────────────────────────────
  const screens = ['home', 'study', 'done', 'blanks', 'settings'];
  function show(name) {
    if (name !== 'study' && session) endSession(false);
    for (const s of screens) $('screen-' + s).hidden = s !== name;
    document.querySelectorAll('.navbtn').forEach(b => b.setAttribute('aria-current', b.dataset.nav === name ? 'page' : 'false'));
    if (name === 'home') renderHome();
    if (name === 'blanks') renderBlanks();
    if (name === 'settings') renderSettings();
    window.scrollTo(0, 0);
  }
  document.querySelectorAll('[data-nav]').forEach(b => b.addEventListener('click', () => show(b.dataset.nav)));

  // ── Home ───────────────────────────────────────────────────────────────
  function renderHome() {
    const cards = allCards();
    const t = today();
    const sts = sched.states(events, cards, { examDay: examDay() });
    const queue = sched.buildQueue(sts, cards, t, { newPerDay: settings.newPerDay, shuffle: x => x });
    const due = queue.filter(id => sts[id].phase !== 'new').length;
    const fresh = queue.length - due;
    $('dueCount').textContent = due;
    $('newCount').textContent = fresh;
    $('studyBtn').disabled = queue.length === 0;
    const left = cards.filter(c => sts[c.id].phase === 'new').length;
    $('studyNote').textContent = queue.length ? ''
      : left ? 'All done for today. New cards unlock tomorrow (or raise the daily limit in Settings).'
      : 'All done for today. Fill more lecture blanks to add cards.';

    const r = sched.delayedRecall(events, t, 14);
    $('recallPct').textContent = r.total ? Math.round(100 * r.right / r.total) + '%' : '—';
    $('recallNote').textContent = r.total
      ? `${r.right} of ${r.total} first attempts right on cards seen on an earlier day`
      : 'Fills in from tomorrow: it only counts cards you saw on an earlier day.';

    const answers = log.blankAnswers(events);
    const list = $('lectureList');
    list.replaceChildren();
    for (const lec of deck.lectures) {
      const lc = cards.filter(c => c.lecture === lec.n);
      const mastered = lc.filter(c => sts[c.id].mastered).length;
      const started = lc.filter(c => sts[c.id].phase !== 'new' && !sts[c.id].mastered).length;
      const lb = deck.blanks.filter(b => b.lecture === lec.n);
      const unfilled = lb.filter(b => !answers[b.id]).length;
      const total = lc.length + unfilled;
      const pct = n => total ? (100 * n / total) + '%' : '0%';
      list.append(h('div', { class: 'lec' },
        h('div', { class: 'lec-head' }, `${lec.n} · ${lec.title}`),
        h('div', { class: 'bar', role: 'img', 'aria-label': `${mastered} mastered, ${started} started, ${lc.length} cards, ${unfilled} blanks unfilled` },
          h('i', { class: 'm', style: `width:${pct(mastered)}` }),
          h('i', { class: 'l', style: `width:${pct(started)}` }),
          h('i', { style: `width:${pct(lc.length - mastered - started)}` }),
          h('i', { class: 's', style: `width:${pct(unfilled)}` })),
        h('div', { class: 'lec-sub' }, `${mastered}/${lc.length} mastered` + (lb.length ? ` · ${lb.length - unfilled}/${lb.length} blanks filled` : ''))));
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
    const queue = sched.buildQueue(sts, cards, today(), { newPerDay: settings.newPerDay });
    if (!queue.length) { renderHome(); return; } // a sync may have just finished today's work
    session = new sched.Session(queue);
    session.byId = new Map(cards.map(c => [c.id, c]));
    session.firstTry = new Map(); // card id -> right on first attempt this session
    current = null;
    for (const s of screens) $('screen-' + s).hidden = s !== 'study';
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
      : `${tomorrow} review${tomorrow === 1 ? '' : 's'} due tomorrow.`;
    for (const name of screens) $('screen-' + name).hidden = name !== 'done';
    window.scrollTo(0, 0);
  }

  const TYPE_LABEL = { recall: 'Explain', typed: 'Short answer', mc: 'Choose', order: 'Put in order', cloze: 'From your notes' };

  function fillQuestion(card) {
    const lec = deck.lectures.find(l => l.n === card.lecture);
    $('qlabel').textContent = `Lecture ${card.lecture} · ${card.type === 'typed' && card.code ? 'Trace' : TYPE_LABEL[card.type]}`;
    $('qlabel').title = lec ? lec.title : '';
    $('qprompt').textContent = card.prompt;
    $('qcode').hidden = !card.code;
    $('qcode').textContent = card.code || '';
  }

  // ── Pretext: predict the question card's height before swapping content ──
  const prepared = new Map();
  if (document.fonts) document.fonts.ready.then(() => { prepared.clear(); if (window.Pretext) Pretext.clearCache(); });

  function textHeight(text, styleEl, width, pre) {
    const s = getComputedStyle(styleEl);
    const font = `${s.fontWeight} ${s.fontSize} ${s.fontFamily}`;
    const key = font + (pre ? '\npre\n' : '\n') + text;
    if (!prepared.has(key)) prepared.set(key, Pretext.prepare(text, font, pre ? { whiteSpace: 'pre-wrap' } : undefined));
    return Pretext.layout(prepared.get(key), width, parseFloat(s.lineHeight)).height;
  }
  const px = v => parseFloat(v) || 0;

  function predictCardHeight(card) {
    if (!window.Pretext) return null;
    try {
      const q = $('qcard'), prompt = $('qprompt'), code = $('qcode'), ref = $('codeRef');
      const cs = getComputedStyle(ref);
      const codeChrome = px(cs.paddingTop) + px(cs.paddingBottom) + px(cs.borderTopWidth) + px(cs.borderBottomWidth);
      const codeMargin = px(getComputedStyle(code).marginTop);
      const codeNow = code.hidden ? 0 : code.getBoundingClientRect().height + codeMargin;
      const base = q.getBoundingClientRect().height - prompt.getBoundingClientRect().height - codeNow;
      let hgt = base + textHeight(card.prompt, prompt, prompt.getBoundingClientRect().width, true);
      if (card.code) {
        const w = ref.getBoundingClientRect().width - px(cs.paddingLeft) - px(cs.paddingRight) - px(cs.borderLeftWidth) - px(cs.borderRightWidth);
        hgt += codeMargin + codeChrome + textHeight(card.code, ref, w, true);
      }
      return hgt;
    } catch (e) {
      console.warn('Pretext measurement failed', e);
      return null;
    }
  }

  let animating = false;
  function showCard(id, first) {
    const card = session.byId.get(id);
    current = { card, pending: null };
    $('leftCount').textContent = `${session.remaining} left`;
    const area = $('answerArea');
    if (first || !window.gsap) {
      fillQuestion(card);
      area.replaceChildren(buildAnswer(card));
      focusFirst();
      return;
    }
    animating = true;
    const q = $('qcard'), inner = $('qinner');
    const target = predictCardHeight(card);
    gsap.killTweensOf([q, inner, area]);
    if (target) {
      gsap.set(q, { height: q.getBoundingClientRect().height });
      gsap.to(q, {
        height: target, duration: 0.4, ease: 'power2.inOut',
        // ~0.1% of lines sit on the wrap boundary, where canvas and DOM widths
        // disagree: settle into the real height rather than snapping.
        onComplete: () => gsap.to(q, { height: 'auto', duration: 0.12, onComplete: () => gsap.set(q, { clearProps: 'height' }) }),
      });
    }
    gsap.timeline()
      .to([inner, area], { xPercent: -8, opacity: 0, duration: 0.18, ease: 'power2.in' })
      .add(() => { fillQuestion(card); area.replaceChildren(buildAnswer(card)); })
      .set([inner, area], { xPercent: 8 })
      .to([inner, area], { xPercent: 0, opacity: 1, duration: 0.22, ease: 'power2.out', onComplete: () => { animating = false; focusFirst(); } });
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
        const b = h('button', { class: 'opt', 'aria-pressed': 'false', 'data-opt': o, onclick: () => pick(i) }, h('span', { class: 'kbd' }, `${i + 1}`), ' ', o);
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
        ans.replaceChildren(...(placed.length ? placed.map((t, i) => h('button', { class: 'tile', onclick: () => { placed.splice(i, 1); pool.push(t); draw(); } }, h('span', { class: 'num' }, `${i + 1}.`), t))
          : [h('div', { class: 'tiles-empty' }, 'Tap tiles below in order. Tap a placed tile to take it back.')]));
        src.replaceChildren(...pool.map((t, i) => h('button', { class: 'tile', onclick: () => { pool.splice(i, 1); placed.push(t); draw(); } }, t)));
        src.hidden = pool.length === 0;
        updateReady();
      }
      wrap.append(ans, src);
      read = () => ({ given: placed.slice(), ready: pool.length === 0 });
      wrap.draw = draw;
      queueMicrotask(draw);
    }

    const sureBtn = h('button', { class: 'btn primary', onclick: () => submit(true) }, 'Sure', h('span', { class: 'kbd' }, card.type === 'recall' ? 'Ctrl+⏎' : '⏎'));
    const guessBtn = h('button', { class: 'btn', onclick: () => submit(false) }, 'Guess', h('span', { class: 'kbd' }, card.type === 'recall' ? 'Ctrl+⇧⏎' : '⇧⏎'));
    const idkBtn = h('button', { class: 'btn', onclick: () => giveUp() }, 'I don’t know');
    wrap.append(h('div', { class: 'btn-row' }, idkBtn, guessBtn, sureBtn));
    function updateReady() { const r = read().ready; sureBtn.disabled = !r; guessBtn.disabled = !r; }
    wrap.addEventListener('input', updateReady);
    queueMicrotask(updateReady);
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
    // Lock the inputs, keep them visible above the feedback.
    area.querySelectorAll('input, textarea, button').forEach(el => { el.disabled = true; });
    area.querySelector('.btn-row')?.remove();
    if (card.type === 'mc') {
      area.querySelectorAll('.opt').forEach(b => {
        if (b.dataset.opt === card.answer) b.classList.add('correct');
        else if (b.dataset.opt === p.given) b.classList.add('wrong');
      });
    }

    const fb = h('div', { class: 'feedback', role: 'status', 'aria-live': 'polite' });
    const selfGrade = card.type === 'recall' && !p.gaveUp;
    const verdict = h('div', { class: 'verdict' });
    const alert = h('div', { class: 'alert' });
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

    const showGiven = p.given && card.type !== 'mc' && card.type !== 'order';
    if (showGiven) fb.append(h('div', { class: 'fb-block' }, h('div', { class: 'label' }, 'You wrote'), h('div', { class: 'val' + (card.code ? ' mono' : '') }, p.given)));
    const answerText = card.type === 'order' ? card.answer.map((t, i) => `${i + 1}. ${t}`).join('\n') : card.answer;
    if (card.type !== 'mc' || !p.ok) {
      fb.append(h('div', { class: 'fb-block' }, h('div', { class: 'label' }, card.type === 'cloze' ? 'Your notes say' : card.type === 'recall' ? 'Model answer' : 'Answer'),
        h('div', { class: 'val' + (card.code && card.type !== 'recall' ? ' mono' : '') }, answerText)));
    }
    if (card.type === 'recall') {
      fb.append(h('div', { class: 'fb-block' }, h('div', { class: 'label' }, 'Count it if you had'), h('ul', { class: 'points' }, card.points.map(pt => h('li', null, pt)))));
    }
    if (card.why) fb.append(h('p', { class: 'why' }, card.why));
    fb.append(h('p', { class: 'source' }, card.source));

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
        const ov = h('button', { class: 'linkbtn', onclick: () => { p.ok = true; p.override = true; ov.remove(); paintVerdict(); } },
          card.verify ? 'I was right (only formatting differs)' : 'I was right (only wording differs)');
        fb.append(ov);
      }
      row.append(h('button', { class: 'btn primary', id: 'contBtn', onclick: cont }, 'Continue', h('span', { class: 'kbd' }, '⏎')));
    }
    area.append(fb, row);
    const btn = row.querySelector('.btn.primary');
    if (btn && matchMedia('(hover: hover)').matches) btn.focus({ preventScroll: true });
    fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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

  // ── Fill blanks ────────────────────────────────────────────────────────
  function renderBlanks() {
    const answers = log.blankAnswers(events);
    const tabs = $('blankTabs');
    tabs.replaceChildren(...deck.lectures.filter(l => deck.blanks.some(b => b.lecture === l.n)).map(l => {
      const lb = deck.blanks.filter(b => b.lecture === l.n);
      const filled = lb.filter(b => answers[b.id]).length;
      return h('button', { class: 'btn', 'aria-pressed': String(l.n === blankLecture), onclick: () => { blankLecture = l.n; renderBlanks(); } },
        `Lecture ${l.n} `, h('span', { class: 'muted' }, `${filled}/${lb.length}`));
    }));
    const lb = deck.blanks.filter(b => b.lecture === blankLecture);
    const filled = lb.filter(b => answers[b.id]).length;
    $('blankCount').textContent = `${filled} of ${lb.length} filled for lecture ${blankLecture}.`;
    const list = $('blankList');
    list.replaceChildren(...lb.map(b => {
      const id = 'blank-' + b.id;
      const input = h('input', { type: 'text', id, value: answers[b.id] || '', autocomplete: 'off', spellcheck: 'false' });
      const row = h('div', { class: 'blank' + (answers[b.id] ? ' filled' : '') },
        h('label', { for: id }, h('span', { class: 'slide' }, `slide ${b.slide}`), b.prompt), input);
      const save = () => {
        const v = input.value.trim();
        if (v === (log.blankAnswers(events)[b.id] || '')) return;
        log.append(events, { k: 'b', b: b.id, v });
        row.classList.toggle('filled', !!v);
        const n = deck.blanks.filter(x => x.lecture === blankLecture && log.blankAnswers(events)[x.id]).length;
        $('blankCount').textContent = `${n} of ${lb.length} filled for lecture ${blankLecture}.`;
        pushSoon();
      };
      input.addEventListener('change', save);
      input.addEventListener('keydown', e => {
        if (e.key !== 'Enter') return;
        e.preventDefault(); save();
        const next = row.nextElementSibling?.querySelector('input');
        if (next) next.focus();
      });
      return row;
    }));
  }

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
  FC.app = { allCards, fillQuestion, predictCardHeight, get events() { return events; }, get session() { return session; } };
})(globalThis.FC = globalThis.FC || {});
