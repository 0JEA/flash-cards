// Answer checking for typed, cloze and order cards. Recall cards are self-graded.
(function (FC) {
  'use strict';

  // Collapse all whitespace (so multi-line output can be typed on one line), fold case,
  // straighten smart quotes, and drop one trailing period.
  function normalize(s, keepCase) {
    const t = String(s)
      .replace(/[‘’]/g, "'").replace(/[“”]/g, '"')
      .replace(/\s+/g, ' ').trim()
      .replace(/\.$/, '');
    return keepCase ? t : t.toLowerCase();
  }

  // Program output (cards whose answer was produced by running `verify`) must match
  // exactly apart from whitespace (L3); every other short answer ignores case.
  function typed(given, card) {
    const keepCase = !!card.verify;
    const g = normalize(given, keepCase);
    if (!g) return false;
    return [card.answer].concat(card.accept || []).some(a => normalize(a, keepCase) === g);
  }

  // Optimal string alignment distance: insert, delete, substitute, or swap two
  // adjacent letters, each costing 1 (a swap is the most common typo).
  function editDistance(a, b) {
    const d = Array.from({ length: a.length + 1 }, (_, i) => [i].concat(Array(b.length).fill(0)));
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
        if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
    return d[a.length][b.length];
  }

  // Blank answers are the learner's own wording: allow one typo per 8 characters,
  // exact match below 8 characters (short answers like "6" or "IBM" must be exact).
  function cloze(given, expected) {
    const g = normalize(given), e = normalize(expected);
    if (!g) return false;
    return editDistance(g, e) <= Math.floor(e.length / 8);
  }

  // Unordered answers (boundary values, prime paths, …). Items are separated by commas,
  // semicolons or new lines, unless the expected items themselves contain commas (paths like
  // "N0,N1,N2"): then items are separated by semicolons, new lines or bracket groups.
  function set(given, card) {
    const expected = card.answer.map(x => normalize(x).replace(/[\[\]\s]/g, ''));
    const itemsHaveCommas = expected.some(x => x.includes(','));
    let raw = String(given);
    let parts;
    if (itemsHaveCommas) {
      const groups = raw.match(/\[[^\]]*\]/g);
      parts = groups && groups.length > 1 ? groups : raw.split(/[;\n]+/);
    } else {
      parts = raw.split(/[,;\n]+/);
    }
    const got = parts.map(x => normalize(x).replace(/[\[\]\s]/g, '')).filter(Boolean);
    if (!got.length || got.length !== expected.length) return false;
    const a = got.slice().sort(), b = expected.slice().sort();
    return a.every((x, i) => x === b[i]);
  }

  function order(given, expected) {
    return given.length === expected.length && given.every((x, i) => x === expected[i]);
  }

  FC.grade = { normalize, typed, cloze, order, set, editDistance };
})(globalThis.FC = globalThis.FC || {});
