// Answer checking for typed, cloze and order cards. Recall cards are self-graded.
(function (FC) {
  'use strict';

  // Collapse all whitespace (so multi-line output can be typed on one line), fold case,
  // straighten smart quotes, and drop one trailing period.
  function normalize(s) {
    return String(s)
      .replace(/[‘’]/g, "'").replace(/[“”]/g, '"')
      .replace(/\s+/g, ' ').trim().toLowerCase()
      .replace(/\.$/, '');
  }

  function typed(given, card) {
    const g = normalize(given);
    if (!g) return false;
    return [card.answer].concat(card.accept || []).some(a => normalize(a) === g);
  }

  function levenshtein(a, b) {
    const prev = Array.from({ length: b.length + 1 }, (_, j) => j);
    for (let i = 1; i <= a.length; i++) {
      let diag = prev[0];
      prev[0] = i;
      for (let j = 1; j <= b.length; j++) {
        const tmp = prev[j];
        prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1));
        diag = tmp;
      }
    }
    return prev[b.length];
  }

  // Blank answers are the learner's own wording: allow one typo per 8 characters,
  // exact match below 8 characters (short answers like "6" or "IBM" must be exact).
  function cloze(given, expected) {
    const g = normalize(given), e = normalize(expected);
    if (!g) return false;
    return levenshtein(g, e) <= Math.floor(e.length / 8);
  }

  function order(given, expected) {
    return given.length === expected.length && given.every((x, i) => x === expected[i]);
  }

  FC.grade = { normalize, typed, cloze, order, levenshtein };
})(globalThis.FC = globalThis.FC || {});
