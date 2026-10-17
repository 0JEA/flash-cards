// "Help" walkthroughs for CSC 370 cards. Same idea as decks/csc310-help.js: what the
// question asks, the one idea, a worked walk-through, a picture where one helps, the answer,
// the usual mistake, and a similar question to try. Opening Help before answering counts
// the card as not known, so Help teaches without replacing recall.
//
// CSC 370 has math OFF: text is shown exactly as written ($ is just a character, as in C
// format strings or shell). Put code-ish words in `backticks` (drawn as inline code).
//
// Entry format (plain text):
//   FC.help['<card id>'] = {               // lecture blanks use 'blank:<blank id>'
//     asks:  'What the question wants, in plain words (1–3 sentences).',
//     idea:  'The one idea that unlocks it: a picture, story or reason before the list.',
//     steps: [ 'One step per string.',
//              { text: 'A step with code:', code: 'int x = 5;\nint *p = &x;' },
//              { text: 'A step with a table:', table: { head: ['line', 'x'], rows: [['1', '5']] } } ],
//     ptree: { tree: { label: '<expr>', kids: [ ... ] }, caption: 'What to notice.' },
//            // optional: a parse tree (or any tree) in js/tree.js format; an array of up to
//            // 3 to compare (e.g. the two trees of an ambiguous sentence)
//     answer:  'The answer, with the reason in one line.',
//     mistake: 'The mistake students usually make here, and how to avoid it.',
//     tryIt:   { q: 'A similar question (different example).', code: 'optional multi-line code\nshown under q',
//                a: 'Its answer with the key step.' },
//   };
//
// Ground every fact in her slides/tests (or Sebesta, the course text) and in the card's own
// answer. Never contradict the card; if the card looks wrong, report it instead of writing
// around it.
(function (FC) {
  'use strict';
  const H = FC.help = FC.help || {};
  const leaf = label => ({ label, kids: [] });
  const node = (label, ...kids) => ({ label, kids });

  H['l4-ambig-values'] = {
    asks: 'The grammar lets `3 – 10 / 5` be built two different ways. Each way groups the numbers differently, and so gives a different value. Name both values.',
    idea: 'A parse tree is the order of work: the deeper an operator sits, the sooner it is done. This grammar never says which operator goes deeper, so both trees are legal, and each gives its own answer. That is exactly what "ambiguous" costs a compiler.',
    steps: [
      'The only rule that makes operators is `<expr> → <expr> <op> <expr>`. The top of the tree must pick ONE of the two operators to be the last one done.',
      'Tree 1: the top operator is `–`. Its right <expr> holds `10 / 5`, which is deeper, so it is done first: 3 – (10 / 5) = 3 – 2 = 1.',
      'Tree 2: the top operator is `/`. Its left <expr> holds `3 – 10`, done first: (3 – 10) / 5 = –7 / 5 = –1.4.',
      { text: 'Both trees use only legal rules, so the grammar allows both:', table: { head: ['top operator', 'grouping', 'value'], rows: [['–', '3 – (10 / 5)', '1'], ['/', '(3 – 10) / 5', '–1.4']] } },
    ],
    ptree: [
      { tree: node('<expr>', node('<expr>', node('<const>', leaf('3'))), node('<op>', leaf('–')),
          node('<expr>', node('<expr>', node('<const>', leaf('10'))), node('<op>', leaf('/')), node('<expr>', node('<const>', leaf('5'))))),
        caption: 'Tree 1: / is deeper, so 10 / 5 is done first. Value 1.' },
      { tree: node('<expr>', node('<expr>', node('<expr>', node('<const>', leaf('3'))), node('<op>', leaf('–')), node('<expr>', node('<const>', leaf('10')))),
          node('<op>', leaf('/')), node('<expr>', node('<const>', leaf('5')))),
        caption: 'Tree 2: – is deeper, so 3 – 10 is done first. Value –1.4.' },
    ],
    answer: '1 and –1.4: 3 – (10 / 5) = 1, and (3 – 10) / 5 = –1.4.',
    mistake: 'Using the precedence you learned in math class (division first) and giving only 1. The question is about this grammar, and this grammar has no precedence at all.',
    tryIt: { q: 'Same grammar: what two values can `8 – 4 / 2` have?', a: '8 – (4 / 2) = 6 and (8 – 4) / 2 = 2.' },
  };
})(globalThis.FC = globalThis.FC || {});
