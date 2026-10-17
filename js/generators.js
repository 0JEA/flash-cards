// Generated practice problems: a card that builds a NEW problem every time it is shown
// (different numbers, names, code shape), with a solver that computes the right answer.
// A procedural skill shown with the same program every time turns into a memorised fact
// (research/04 rules 10 and 21), so procedures are practised here instead.
//
// Contract for a generator (register with FC.gen.register):
//   {
//     id:      'gen-<course>-<skill>'   stable: the scheduler tracks the SKILL by this id
//     deck:    'softtest' | 'csc370'
//     lecture: lecture key in that deck ('13', '5.2', …)
//     cat, sub: topic group and subgroup (as on the class screen)
//     title:   short name of the skill, e.g. 'Edge coverage of a suite'
//     make(rng) -> card fields for ONE fresh problem:
//       { type: 'typed' | 'mc' | 'recall' | 'set' | 'order',
//         prompt, code?, answer, accept?, options?, points?, why, source }
//       - make must be pure given rng: same seed → same problem (tests rely on this)
//       - 'set' answers are arrays graded in any order (comma- or line-separated input)
//       - `why` should show the worked solution for THIS problem (the steps, not just the result)
//       - optional `graph` (format in decks/csc310-help.js) drawn from THIS problem's numbers;
//         shown compactly under the answer once the student has answered
//       - optional `rtree` (recursion-tree diagram, the `tree` format in decks/csc310-help.js)
//       - tree answers: type 'tree' (build it), 'swaps' (heap: heap, swaps [[i,j]], answer array),
//         'fill' (tree with blank:true nodes + answer labels, or heap + blanks [indices]),
//         'path' (tree or heap + answer [node ids in order]); a `tree`/`heap` on any other
//         type is drawn in the question. Formats: js/tree.js
//     assignment: ['a1']   optional: which assignments this skill practises (By assignment view)
//   }
// rng() returns a float in [0, 1). Helpers below cover the usual needs.
(function (FC) {
  'use strict';

  // mulberry32: small, fast, seedable.
  function rngFrom(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const int = (rng, lo, hi) => lo + Math.floor(rng() * (hi - lo + 1)); // inclusive
  const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];
  function shuffle(rng, arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  // Short identifier pools so names change between problems.
  const NAMES = {
    fn: ['check', 'grade', 'scale', 'clamp', 'route', 'score', 'limit', 'bucket', 'label', 'rank', 'probe', 'tally'],
    var: ['a', 'b', 'n', 'k', 'x', 'y', 'm', 'p', 'q', 'r', 't', 'v', 'w', 'z', 'count', 'total', 'left', 'right', 'step'],
  };

  const registry = new Map();
  function register(g) {
    for (const k of ['id', 'deck', 'lecture', 'cat', 'sub', 'title', 'make']) {
      if (!g[k]) throw new Error(`generator ${g.id || '?'} is missing ${k}`);
    }
    if (registry.has(g.id)) throw new Error(`duplicate generator id ${g.id}`);
    registry.set(g.id, g);
  }

  // A schedulable card that stands for the skill. The app calls instance(card) at show time.
  function asCard(g) {
    return { id: g.id, deck: g.deck, lecture: g.lecture, cat: g.cat, sub: g.sub, assignment: g.assignment, type: 'gen', generator: g.id,
      prompt: g.title, why: '', source: 'Generated practice (new problem each time)' };
  }
  function instance(id, seed = (Math.random() * 2 ** 32) >>> 0) {
    const g = registry.get(id);
    const card = Object.assign({ id: g.id, deck: g.deck, lecture: g.lecture, cat: g.cat, sub: g.sub, assignment: g.assignment, generated: true, seed }, g.make(rngFrom(seed)));
    if (!card.source) card.source = 'Generated practice (new problem each time)';
    return card;
  }
  const forDeck = deckId => [...registry.values()].filter(g => g.deck === deckId);

  FC.gen = { register, forDeck, asCard, instance, all: () => [...registry.values()], rngFrom, int, pick, shuffle, NAMES };
})(globalThis.FC = globalThis.FC || {});
