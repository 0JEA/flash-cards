// "Help" walkthroughs for CSC 310 cards: what the question asks, the one idea, a worked
// derivation step by step, a graph, the answer, the usual mistake, and a similar problem
// to try. Written for a student who finds the math hard: intuition first, every algebra
// step shown, no step skipped as "obvious".
//
// Opening Help before answering counts the card as not known (it comes back later),
// so Help teaches without replacing recall.
//
// Entry format (all text: inline $...$ LaTeX allowed; plain text otherwise):
//   FC.help['<card id>'] = {
//     asks:  'What the question wants, in plain words (1–3 sentences).',
//     idea:  'The one idea that unlocks it (a picture or story before a formula).',
//     steps: [ 'One step per string, each showing its algebra.',
//              { text: 'A step with a table:', table: { head: ['$i$', 'runs'], rows: [['1', '1'], ['2', '2']] } } ],
//     graph: {                       // optional but expected wherever a picture helps
//       caption: 'What to notice in the picture.',
//       x: [0, 12], y: [0, 600],     // axis ranges (y optional: auto); logY: true for log scale
//       xLabel: 'n', yLabel: 'steps',   // plain text
//       curves: [{ label: '$3n^2 + 5n$', f: n => 3 * n * n + 5 * n, tone: 'a' }],   // tone a|b|c|d
//       bars:   { label: 'runs of the inner loop', tone: 'b', values: [[1, 1], [2, 2]] },  // optional
//       marks:  [{ x: 5, label: '$n_0 = 5$' }],   // dashed vertical lines
//       from:   5,                   // optional: shade x >= from ("from here on it holds")
//     },
//     tree: {                        // optional: a recursion-tree diagram (shown above the graph)
//       sumsLabel: 'level total',    // header over the right-hand column (optional)
//       levels: [ { nodes: ['$cn$'], sum: '$cn$' },
//                 { nodes: ['$cn/4$', '$cn/4$', '$cn/4$'], sum: '$3cn/4$' },
//                 { gap: true },      // drawn as ⋮
//                 { nodes: ['$T(1)$', '$T(1)$', '$\\cdots$', '$T(1)$'], sum: '$\\Theta(n^{\\log_4 3})$' } ],
//       caption: 'What to notice.',  // ≤ 9 nodes per level; use '$\\cdots$' nodes for more
//     },
//     answer:  'The answer, with the reason in one line.',
//     mistake: 'The mistake students usually make here, and how to avoid it.',
//     tryIt:   { q: 'A similar small problem (different numbers).', a: 'Its answer with the key step.' },
//   };
(function (FC) {
  'use strict';
  const H = FC.help = FC.help || {};

  H['c310-3-prove-O'] = {
    asks: 'Show that $3n^2 + 5n$ grows no faster than $n^2$, using the official definition of big-O: find two numbers, $c$ and $n_0$, and show the inequality really holds.',
    idea: '$f(n) = O(g(n))$ means: stretch $g$ by some constant $c$, and from some point $n_0$ onward, $f$ stays under it forever. You are not saying $f \\le g$; you get to pick a big enough stretch $c$ and ignore small $n$.',
    steps: [
      'Write what you must show: find $c > 0$ and $n_0$ so that $3n^2 + 5n \\le c \\cdot n^2$ for every $n \\ge n_0$.',
      'The $3n^2$ part already looks like $n^2$. The problem is the $5n$. Try to make it look like $n^2$ too.',
      '$5n \\le n \\cdot n$ exactly when $5 \\le n$ (divide both sides by $n$, which is positive). So for $n \\ge 5$: $5n \\le n^2$.',
      'Replace $5n$ by the bigger $n^2$: for $n \\ge 5$, $3n^2 + 5n \\le 3n^2 + n^2 = 4n^2$.',
      { text: 'So $c = 4$ and $n_0 = 5$ work. Check a few values:', table: { head: ['$n$', '$3n^2 + 5n$', '$4n^2$', 'holds?'], rows: [['4', '68', '64', 'no'], ['5', '100', '100', 'yes (equal)'], ['6', '138', '144', 'yes'], ['10', '350', '400', 'yes']] } },
      'Write it up: "Take $c = 4$, $n_0 = 5$. For all $n \\ge 5$, $5n \\le n^2$, so $3n^2 + 5n \\le 4n^2 = c\\,n^2$. Hence $3n^2 + 5n = O(n^2)$."',
    ],
    graph: {
      caption: 'The red curve ($4n^2$) is below at $n = 4$, crosses at $n = 5$, and stays above forever after: that is what $c = 4, n_0 = 5$ claims.',
      x: [2, 8], y: [0, 260], xLabel: 'n', yLabel: 'value',
      curves: [{ label: '$f(n) = 3n^2 + 5n$', f: n => 3 * n * n + 5 * n, tone: 'a' }, { label: '$c\\,g(n) = 4n^2$', f: n => 4 * n * n, tone: 'b' }],
      marks: [{ x: 5, label: '$n_0 = 5$' }],
      from: 5,
    },
    answer: '$c = 4$, $n_0 = 5$: for $n \\ge 5$, $3n^2 + 5n \\le 4n^2$. (Other pairs work too, e.g. $c = 8$, $n_0 = 1$, since $5n \\le 5n^2$ when $n \\ge 1$.)',
    mistake: 'Only stating "the highest power is $n^2$". A proof from the definition must name $c$ and $n_0$ AND show the inequality holds for every $n \\ge n_0$.',
    tryIt: { q: 'Prove $2n^2 + 7n = O(n^2)$.', a: '$7n \\le n^2$ when $n \\ge 7$, so for $n \\ge 7$: $2n^2 + 7n \\le 3n^2$. Take $c = 3$, $n_0 = 7$.' },
  };
})(globalThis.FC = globalThis.FC || {});
