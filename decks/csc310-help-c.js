// Help walkthroughs for the CSC 310 Assignment 1 cards on little-o / little-omega and on
// comparing growth rates (FC.csc310Cards, sub 'Little-o, ω' and 'Comparing growth').
// Same format as decks/csc310-help.js. Every table value and limit was checked with python3
// (mpmath) on 2026-10-16. No pair of functions from the assignment's own questions is used
// in any walkthrough or tryIt.
(function (FC) {
  'use strict';
  const H = FC.help = FC.help || {};

  // Five-way decision table, shared by the "five yes/no boxes" cards.
  const FIVE = {
    head: ['$L$', '$O$', '$o$', '$\\Omega$', '$\\omega$', '$\\Theta$'],
    rows: [
      ['$0$', 'yes', 'yes', 'no', 'no', 'no'],
      ['positive constant', 'yes', 'no', 'yes', 'no', 'yes'],
      ['$\\infty$', 'no', 'no', 'yes', 'yes', 'no'],
    ],
  };

  // Smooth curve through the factorial values: Stirling's series for Γ(x + 1).
  const fact = x => Math.exp(x * Math.log(x) - x + 0.5 * Math.log(2 * Math.PI * x) + 1 / (12 * x) - 1 / (360 * x ** 3));

  H['c310-3-analogy-o'] = {
    asks: 'Little-o, $f(n) = o(g(n))$, behaves like one of the comparisons $<$, $\\le$, $=$, $>$ between two numbers $a$ and $b$. Which one?',
    idea: 'Think of $a$ as the growth rate of $f$ and $b$ as the growth rate of $g$. Little-o says $f$ grows strictly slower: in the long run $f$ becomes a vanishing fraction of $g$. Strictly slower is "$<$", not "$\\le$".',
    steps: [
      'The big letters allow a tie; the little letters forbid one. $O$ means "at most the rate of $g$", which is $a \\le b$.',
      'Little-o needs $\\lim_{n\\to\\infty} f(n)/g(n) = 0$ (Lecture 3, slide 20). A tie in growth rate leaves the ratio at a positive constant, not 0, so a tie is excluded.',
      { text: 'Two pairs. The second is a tie in growth rate (like $5 \\le 5$): $O$ holds, $o$ does not.', table: { head: ['$f$', '$g$', '$f/g$ as $n \\to \\infty$', '$O$?', '$o$?'], rows: [['$n$', '$n^2$', '$1/n \\to 0$', 'yes', 'yes'], ['$2n^2$', '$n^2$', '$2$', 'yes', 'no']] } },
      'So $o$ is "$\\le$ with the $=$ removed", which is $a < b$.',
    ],
    graph: {
      caption: 'Plotted: the ratio $f/g$ for each pair. For $n$ against $n^2$ it sinks toward 0 (strictly slower: $o$). For $2n^2$ against $n^2$ it stays at 2 (same rate: $O$ but not $o$).',
      x: [1, 30], y: [0, 2.5], xLabel: 'n', yLabel: 'f / g',
      curves: [{ label: '$n / n^2 = 1/n$', f: n => 1 / n, tone: 'a' }, { label: '$2n^2 / n^2 = 2$', f: n => 2, tone: 'b' }],
    },
    answer: '$a < b$. Little-o is a strict upper bound; the non-strict $a \\le b$ is big-O.',
    mistake: 'Choosing $a \\le b$ because "o is an upper bound". Both $O$ and $o$ are upper bounds; the little letter is the strict one.',
    tryIt: { q: 'Which comparison is $f(n) = \\omega(g(n))$ like?', a: '$a > b$: $f$ grows strictly faster ($f/g \\to \\infty$). The non-strict $a \\ge b$ is $\\Omega$.' },
  };

  H['c310-3-littleo-def'] = {
    asks: 'Write the formal definition of $f(n) \\in o(g(n))$, and the limit that says the same thing.',
    idea: 'Big-O lets you pick ONE stretch $c$. Little-o hands you every $c$, even $c = 0.001$, and $f$ must still end up below $c\\,g(n)$. That is only possible if $f$ becomes a vanishing fraction of $g$.',
    steps: [
      'Definition (Lecture 3, slide 20): $f(n) \\in o(g(n))$ iff for every constant $c > 0$ there is an $n_0 > 0$ with $0 \\le f(n) < c\\,g(n)$ for all $n \\ge n_0$.',
      'Read the order: "for every $c$" comes first, then "there is an $n_0$". So $n_0$ may depend on $c$; a smaller $c$ usually needs a bigger $n_0$.',
      { text: 'Example: $f(n) = n$, $g(n) = n^2$. Solve $n < c\\,n^2$: divide by $n > 0$ to get $1 < c\\,n$, then divide by $c$ to get $n > 1/c$. Every $c$ gets its own $n_0$:', table: { head: ['$c$', 'need $n >$', '$n_0$'], rows: [['$1$', '$1$', '$2$'], ['$0.1$', '$10$', '$11$'], ['$0.01$', '$100$', '$101$']] } },
      { text: 'Limit form: $\\lim_{n\\to\\infty} f(n)/g(n) = 0$. Here $n/n^2 = 1/n$:', table: { head: ['$n$', '$10$', '$100$', '$1000$'], rows: [['$n/n^2$', '$0.1$', '$0.01$', '$0.001$']] } },
      'Why the two forms match: $f(n) < c\\,g(n)$ is the same as $f(n)/g(n) < c$. "Below every $c$ from some point on" is exactly "the ratio goes to 0".',
    ],
    graph: {
      caption: 'Each stretch of $n^2$ eventually passes $f(n) = n$: $0.1\\,n^2$ from $n_0 = 11$, the smaller $0.05\\,n^2$ from $n_0 = 21$. Every $c$ works; a smaller $c$ just waits longer.',
      x: [0, 24], y: [0, 60], xLabel: 'n', yLabel: 'value',
      curves: [{ label: '$f(n) = n$', f: n => n, tone: 'a' }, { label: '$0.1\\,n^2$', f: n => 0.1 * n * n, tone: 'b' }, { label: '$0.05\\,n^2$', f: n => 0.05 * n * n, tone: 'c' }],
      marks: [{ x: 11, label: '$n_0 = 11$' }, { x: 21, label: '$n_0 = 21$' }],
    },
    answer: 'For every $c > 0$ there is an $n_0 > 0$ such that $0 \\le f(n) < c\\,g(n)$ for all $n \\ge n_0$. Equivalently $\\lim_{n\\to\\infty} f(n)/g(n) = 0$.',
    mistake: 'Writing "there exist $c$ and $n_0$", which is big-O. Little-o says for EVERY $c$, and its inequality is strict ($<$).',
    tryIt: { q: 'Showing $3n \\in o(n^2)$ from the definition: which $n_0$ works for $c = 0.01$?', a: '$3n < 0.01\\,n^2 \\iff 3 < 0.01\\,n \\iff n > 300$, so $n_0 = 301$. In general any $n_0 > 3/c$ works.' },
  };

  H['c310-3-littleomega-def'] = {
    asks: 'Write the formal definition of $f(n) \\in \\omega(g(n))$, and the limit that says the same thing.',
    idea: 'Little-omega is little-o turned around. However big a stretch $c$ you apply to $g$, $f$ eventually climbs above $c\\,g(n)$ and stays there: $f$ outgrows every multiple of $g$.',
    steps: [
      'Definition (Lecture 3, slide 22): $f(n) \\in \\omega(g(n))$ iff for every constant $c > 0$ there is an $n_0 > 0$ with $0 \\le c\\,g(n) < f(n)$ for all $n \\ge n_0$.',
      { text: 'Example: $f(n) = n^2$, $g(n) = n$. Solve $c\\,n < n^2$: divide by $n > 0$ to get $c < n$. Each $c$ gets its own $n_0$:', table: { head: ['$c$', 'need $n >$', '$n_0$'], rows: [['$10$', '$10$', '$11$'], ['$100$', '$100$', '$101$'], ['$10^6$', '$10^6$', '$10^6 + 1$']] } },
      { text: 'Limit form: $\\lim_{n\\to\\infty} f(n)/g(n) = \\infty$. Here $n^2/n = n$:', table: { head: ['$n$', '$10$', '$100$', '$1000$'], rows: [['$n^2/n$', '$10$', '$100$', '$1000$']] } },
      'Why the two forms match: $c\\,g(n) < f(n)$ is the same as $f(n)/g(n) > c$. "Above every $c$ from some point on" is exactly "the ratio goes to infinity".',
      'Mirror fact: $f \\in \\omega(g)$ exactly when $g \\in o(f)$. Here: $n^2 \\in \\omega(n)$ and $n \\in o(n^2)$.',
    ],
    graph: {
      caption: '$f(n) = n^2$ passes $10n$ after $n = 10$ and $20n$ after $n = 20$. A bigger stretch only delays the crossing.',
      x: [0, 25], y: [0, 650], xLabel: 'n', yLabel: 'value',
      curves: [{ label: '$f(n) = n^2$', f: n => n * n, tone: 'a' }, { label: '$10n$', f: n => 10 * n, tone: 'b' }, { label: '$20n$', f: n => 20 * n, tone: 'c' }],
      marks: [{ x: 11, label: '$n_0 = 11$' }, { x: 21, label: '$n_0 = 21$' }],
    },
    answer: 'For every $c > 0$ there is an $n_0 > 0$ such that $0 \\le c\\,g(n) < f(n)$ for all $n \\ge n_0$. Equivalently $\\lim_{n\\to\\infty} f(n)/g(n) = \\infty$.',
    mistake: 'Confusing it with $\\Omega$, which needs only ONE $c$ and allows $\\ge$. $2n \\in \\Omega(n)$, but $2n \\notin \\omega(n)$: with $c = 3$, $3n < 2n$ never holds.',
    tryIt: { q: 'Showing $n^2/4 \\in \\omega(n)$ from the definition: which $n_0$ works for $c = 10$?', a: '$10n < n^2/4 \\iff 10 < n/4 \\iff n > 40$, so $n_0 = 41$. In general any $n_0 > 4c$ works.' },
  };

  H['c310-3-O-vs-o'] = {
    asks: 'The definitions of big-O and little-o look almost the same. Which one difference matters?',
    idea: 'Big-O: you choose the stretch $c$. Little-o: an opponent chooses $c$, as small as they like, and you must still win. Surviving every $c$ forces $f$ to be negligible next to $g$.',
    steps: [
      '$O$ (slide 13): there EXISTS a $c > 0$ (and an $n_0$) with $0 \\le f(n) \\le c\\,g(n)$ for all $n \\ge n_0$.',
      '$o$ (slide 20): for EVERY $c > 0$ there is an $n_0$ with $0 \\le f(n) < c\\,g(n)$ for all $n \\ge n_0$.',
      'Test $f = 2n^2$, $g = n^2$ for $O$: pick $c = 3$. Then $2n^2 \\le 3n^2$ for all $n \\ge 1$, so $2n^2 \\in O(n^2)$.',
      'Test it for $o$: the opponent picks $c = 1$. We need $2n^2 < 1 \\cdot n^2$; dividing by $n^2$ gives $2 < 1$, never true. So $2n^2 \\notin o(n^2)$.',
      'Test $f = n$, $g = n^2$: $n < c\\,n^2 \\iff n > 1/c$, so every $c$ has an $n_0$. $n \\in o(n^2)$, and therefore also $O(n^2)$.',
    ],
    graph: {
      caption: '$f = 2n^2$ stays under $3n^2$, so $O$ holds. It stays above $1 \\cdot n^2$ forever, so $c = 1$ has no $n_0$ and $o$ fails.',
      x: [0, 10], y: [0, 300], xLabel: 'n', yLabel: 'value',
      curves: [{ label: '$f(n) = 2n^2$', f: n => 2 * n * n, tone: 'a' }, { label: '$3n^2$ ($c = 3$)', f: n => 3 * n * n, tone: 'b' }, { label: '$1 \\cdot n^2$ ($c = 1$)', f: n => n * n, tone: 'c' }],
    },
    answer: '$O$ needs the bound for SOME constant $c > 0$; $o$ needs it for EVERY constant $c > 0$ (with a strict $<$).',
    mistake: 'Choosing "$O$ uses $f \\le c\\,g$, $o$ uses $f \\ge c\\,g$". Both are upper bounds, so both put $f$ below $c\\,g$; only "some $c$" versus "every $c$" changes.',
    tryIt: { q: 'Is $5n \\in O(n)$? Is $5n \\in o(n)$?', a: '$O$: yes, $c = 6$ gives $5n \\le 6n$ for $n \\ge 1$. $o$: no, $c = 1$ needs $5n < n$, i.e. $5 < 1$, never true.' },
  };

  H['c310-3-limit-test'] = {
    asks: 'Compute $L = \\lim_{n\\to\\infty} f(n)/g(n)$. What does each possible value of $L$ tell you about $f$ compared with $g$?',
    idea: 'The ratio $f/g$ is a scoreboard with three possible endings. If it sinks to 0, $f$ becomes negligible next to $g$; if it settles at a positive number, they grow at the same rate. If it runs off to infinity, $f$ outgrows $g$.',
    steps: [
      'Form the ratio $f(n)/g(n)$, simplify it, and let $n \\to \\infty$.',
      '$L = 0$: $f \\in o(g)$ (slide 20). Little-o is the strict version of $O$, so also $f \\in O(g)$.',
      '$L = \\infty$: $f \\in \\omega(g)$ (slide 22), and so also $f \\in \\Omega(g)$.',
      '$0 < L < \\infty$: from some $n_0$ on, the ratio stays between $L/2$ and $2L$. Multiply by $g(n)$: $\\tfrac{L}{2}\\,g(n) \\le f(n) \\le 2L\\,g(n)$, the $\\Theta$ sandwich with $c_1 = L/2$, $c_2 = 2L$.',
      { text: 'Middle case example: $f = 5n + 2$, $g = n$. The ratio is $(5n + 2)/n = 5 + 2/n \\to 5$:', table: { head: ['$n$', '$10$', '$100$', '$1000$'], rows: [['$(5n+2)/n$', '$5.2$', '$5.02$', '$5.002$']] } },
      { text: 'All five answers come from the one value $L$:', table: FIVE },
    ],
    graph: {
      caption: 'Plotted: three ratios $f/g$ on a log scale. One sinks toward 0, one levels off at 5, one climbs forever: the three outcomes.',
      x: [1, 100], y: [0.005, 200], logY: true, xLabel: 'n', yLabel: 'f / g',
      curves: [{ label: '$n / n^2 \\to 0$', f: n => 1 / n, tone: 'a' }, { label: '$(5n+2)/n \\to 5$', f: n => 5 + 2 / n, tone: 'b' }, { label: '$n^2 / n \\to \\infty$', f: n => n, tone: 'c' }],
    },
    answer: '$L = 0$: $o$ (and $O$). $L = \\infty$: $\\omega$ (and $\\Omega$). $L$ a positive constant: $\\Theta$ (and $O$, $\\Omega$), but neither $o$ nor $\\omega$.',
    mistake: 'Stopping at "$L = 0$ means $o$" and answering no for $O$: $o$ implies $O$, and $\\omega$ implies $\\Omega$. If the ratio has no limit at all (it keeps oscillating), the test says nothing and you go back to the definitions.',
    tryIt: { q: 'Let $f = 3n^2 + n$ and $g = n^2$. Find $L$ and all five answers.', a: '$(3n^2 + n)/n^2 = 3 + 1/n \\to 3$, a positive constant: $O$, $\\Omega$, $\\Theta$ yes; $o$, $\\omega$ no.' },
  };

  H['c310-3-tf-x2-ox3'] = {
    asks: 'Decide whether $x^2$ grows strictly slower than $x^3$ (that is what $\\in o(\\cdot)$ means), and prove it with the limit of the ratio.',
    idea: '$x^3$ is $x^2$ times one more $x$. That extra factor keeps growing, so $x^2$ becomes a smaller and smaller fraction of $x^3$.',
    steps: [
      'Little-o test (slide 20): $x^2 \\in o(x^3)$ iff $\\lim_{x\\to\\infty} x^2/x^3 = 0$.',
      'Simplify the ratio by cancelling two factors of $x$: $\\dfrac{x^2}{x^3} = \\dfrac{x \\cdot x}{x \\cdot x \\cdot x} = \\dfrac{1}{x}$.',
      'As $x \\to \\infty$, $1/x \\to 0$: the bottom grows without bound while the top stays 1.',
      { text: 'Each time $x$ grows by a factor of 10, the ratio shrinks by a factor of 10:', table: { head: ['$x$', '$10$', '$100$', '$1000$'], rows: [['$x^2/x^3$', '$0.1$', '$0.01$', '$0.001$']] } },
      'The limit is 0, so $x^2 \\in o(x^3)$ (and so also $O(x^3)$).',
    ],
    graph: {
      caption: 'Log scale. The gap between $x^3$ and $x^2$ widens forever, and their ratio $1/x$ falls toward 0.',
      x: [1, 100], y: [0.005, 2e6], logY: true, xLabel: 'x', yLabel: 'value',
      curves: [{ label: '$x^2$', f: x => x * x, tone: 'a' }, { label: '$x^3$', f: x => x ** 3, tone: 'b' }, { label: 'ratio $x^2/x^3 = 1/x$', f: x => 1 / x, tone: 'c' }],
    },
    answer: 'True: $x^2/x^3 = 1/x \\to 0$.',
    mistake: 'Arguing "$x^2 < x^3$, so it is little-o". Being smaller is not enough ($x^3 < 2x^3$, yet the ratio is $1/2$, so $x^3 \\notin o(2x^3)$); the ratio must go to 0.',
    tryIt: { q: 'True or false: $x^3 + x \\in o(x^4)$.', a: 'True: $\\dfrac{x^3 + x}{x^4} = \\dfrac{1}{x} + \\dfrac{1}{x^3} \\to 0 + 0 = 0$.' },
  };

  H['c310-3-tf-lnx-ox'] = {
    asks: 'Decide whether $\\ln x$ grows strictly slower than $x$, and prove it with the limit of $\\ln x / x$.',
    idea: 'To raise $\\ln x$ by about 2.3 you must multiply $x$ by 10. When $x$ goes from 10 to 1000 it gains 990, but $\\ln x$ gains only about 4.6. The log falls hopelessly behind.',
    steps: [
      'Little-o test: $\\ln x \\in o(x)$ iff $\\lim_{x\\to\\infty} \\ln x / x = 0$.',
      'Nothing cancels, and top and bottom both go to infinity. Use L’Hôpital’s rule: both go to infinity, so compare their rates by differentiating top and bottom.',
      'The derivative of $\\ln x$ is $1/x$; the derivative of $x$ is $1$. New ratio: $\\dfrac{1/x}{1} = \\dfrac{1}{x} \\to 0$. So $\\ln x / x \\to 0$ as well.',
      { text: 'The numbers agree:', table: { head: ['$x$', '$10$', '$100$', '$1000$'], rows: [['$\\ln x$', '$2.303$', '$4.605$', '$6.908$'], ['$\\ln x / x$', '$0.2303$', '$0.04605$', '$0.006908$']] } },
      'The limit is 0, so $\\ln x \\in o(x)$.',
    ],
    graph: {
      caption: 'Log scale. $x$ climbs steadily while $\\ln x$ barely rises; their ratio sinks toward 0.',
      x: [2, 1000], y: [0.005, 2000], logY: true, xLabel: 'x', yLabel: 'value',
      curves: [{ label: '$\\ln x$', f: x => Math.log(x), tone: 'a' }, { label: '$x$', f: x => x, tone: 'b' }, { label: 'ratio $\\ln x / x$', f: x => Math.log(x) / x, tone: 'c' }],
    },
    answer: 'True: by L’Hôpital, $\\lim \\ln x / x = \\lim (1/x)/1 = 0$.',
    mistake: 'Differentiating the fraction with the quotient rule. L’Hôpital differentiates the top and the bottom separately.',
    tryIt: { q: 'True or false: $\\ln x \\in o(\\sqrt{x})$.', a: 'True. L’Hôpital: $\\dfrac{1/x}{1/(2\\sqrt{x})} = \\dfrac{2\\sqrt{x}}{x} = \\dfrac{2}{\\sqrt{x}} \\to 0$.' },
  };

  H['c310-3-tf-x2-oxfact'] = {
    asks: 'Decide whether $x^2$ grows strictly slower than $x! = 1 \\cdot 2 \\cdot 3 \\cdots x$, and justify it.',
    idea: 'From $x$ to $x + 1$, the factorial is multiplied by $x + 1$: by 11, then 12, then 13, a bigger factor every step. $x^2$ is multiplied only by $((x+1)/x)^2$, which is barely above 1 for large $x$. The factorial pulls away.',
    steps: [
      'Goal: $\\lim_{x\\to\\infty} x^2/x! = 0$. L’Hôpital does not help, because $x!$ is built by multiplying whole numbers, not given by a formula to differentiate. Squeeze the ratio instead.',
      'For $x \\ge 3$: $x! = x(x-1)(x-2) \\cdot (x-3)!$ and $(x-3)! \\ge 1$, so $x! \\ge x(x-1)(x-2)$.',
      'A bigger bottom gives a smaller fraction, and one $x$ cancels: $0 \\le \\dfrac{x^2}{x!} \\le \\dfrac{x^2}{x(x-1)(x-2)} = \\dfrac{x}{(x-1)(x-2)}$.',
      'Divide top and bottom of the right side by $x^2$: $\\dfrac{1/x}{(1 - 1/x)(1 - 2/x)} \\to \\dfrac{0}{1 \\cdot 1} = 0$.',
      '$x^2/x!$ is trapped between 0 and something that goes to 0, so it goes to 0 too.',
      { text: 'The numbers agree:', table: { head: ['$x$', '$2$', '$4$', '$8$', '$16$'], rows: [['$x!$', '$2$', '$24$', '$40320$', '$\\approx 2.09 \\times 10^{13}$'], ['$x^2/x!$', '$2$', '$0.667$', '$0.00159$', '$\\approx 1.2 \\times 10^{-11}$']] } },
    ],
    graph: {
      caption: 'Log scale; the $x!$ curve runs smoothly through the factorial values. $x!$ passes $x^2$ between $x = 3$ and $x = 4$, and the ratio $x^2/x!$ plunges toward 0.',
      x: [1, 12], y: [1e-7, 1e9], logY: true, xLabel: 'x', yLabel: 'value',
      curves: [{ label: '$x^2$', f: x => x * x, tone: 'a' }, { label: '$x!$', f: fact, tone: 'b' }, { label: 'ratio $x^2/x!$', f: x => x * x / fact(x), tone: 'c' }],
    },
    answer: 'True: for $x \\ge 3$, $0 \\le x^2/x! \\le x/((x-1)(x-2)) \\to 0$.',
    mistake: 'Trying L’Hôpital on $x!$. Bound $x!$ from below by a product of higher degree than the top, then squeeze.',
    tryIt: { q: 'Show $x^3 \\in o(x!)$.', a: 'For $x \\ge 4$, $x! \\ge x(x-1)(x-2)(x-3)$, so $0 \\le \\dfrac{x^3}{x!} \\le \\dfrac{x^2}{(x-1)(x-2)(x-3)} \\to 0$ (degree 2 over degree 3).' },
  };

  H['c310-3-tf-omega-n2half'] = {
    asks: 'Show that $n^2/2$ grows strictly faster than $n$ (so it is $\\in \\omega(n)$), but NOT strictly faster than $n^2$.',
    idea: 'Dividing by 2 is a constant squeeze; it never changes a growth rate. Against $n$, the extra factor $n$ wins. Against $n^2$, the ratio is stuck at $1/2$, and $\\omega$ needs a ratio that blows up.',
    steps: [
      '$\\omega$ test (slide 22): $f \\in \\omega(g)$ iff $\\lim_{n\\to\\infty} f(n)/g(n) = \\infty$.',
      'Against $n$: $\\dfrac{n^2/2}{n} = \\dfrac{n^2}{2n} = \\dfrac{n}{2} \\to \\infty$. So $n^2/2 \\in \\omega(n)$.',
      'Against $n^2$: $\\dfrac{n^2/2}{n^2} = \\dfrac{1}{2}$ for every $n$. The limit is $1/2$, finite, so $n^2/2 \\notin \\omega(n^2)$.',
      { text: 'The two ratios side by side:', table: { head: ['$n$', '$10$', '$100$', '$1000$'], rows: [['$(n^2/2)/n$', '$5$', '$50$', '$500$'], ['$(n^2/2)/n^2$', '$0.5$', '$0.5$', '$0.5$']] } },
      'Check with the definition: $\\omega(n^2)$ must work for EVERY $c$. Take $c = 1$: $1 \\cdot n^2 < n^2/2$ means $1 < 1/2$, never true.',
      'A positive finite limit means the same rate: $n^2/2 \\in \\Theta(n^2)$.',
    ],
    graph: {
      caption: 'Plotted: the two ratios. Against $n$, the ratio $n/2$ climbs without bound ($\\omega$). Against $n^2$, it is flat at $1/2$ (same rate, so not $\\omega$).',
      x: [1, 20], y: [0, 10], xLabel: 'n', yLabel: 'f / g',
      curves: [{ label: '$(n^2/2)/n = n/2$', f: n => n / 2, tone: 'a' }, { label: '$(n^2/2)/n^2 = 1/2$', f: n => 0.5, tone: 'b' }],
    },
    answer: '$(n^2/2)/n = n/2 \\to \\infty$, so $\\omega(n)$. $(n^2/2)/n^2 = 1/2$, finite, so not $\\omega(n^2)$; it is $\\Theta(n^2)$.',
    mistake: 'Thinking the $1/2$ makes $n^2/2$ "smaller than $n^2$" and so maybe $o(n^2)$. A constant ratio means the same rate: neither $o$ nor $\\omega$.',
    tryIt: { q: 'Is $n^3/10 \\in \\omega(n^2)$? Is it $\\in \\omega(n^3)$?', a: '$(n^3/10)/n^2 = n/10 \\to \\infty$: yes. $(n^3/10)/n^3 = 1/10$, finite: no (it is $\\Theta(n^3)$).' },
  };

  H['c310-3-cmp-n3-2n'] = {
    asks: 'Fill in five yes/no boxes: is $n^3$ big-O, little-o, big-Omega, little-omega, or Theta of $2^n$? One limit answers all five.',
    idea: '$2^n$ doubles every time $n$ goes up by 1. $n^3$ is multiplied by $((n+1)/n)^3$, which is less than 2 once $n$ is moderately big. Something that doubles every step eventually buries something that does not.',
    steps: [
      'Ratio: $r(n) = n^3/2^n$. We need $L = \\lim_{n\\to\\infty} r(n)$.',
      { text: 'Watch it at $n = 2, 4, 8, 16, 32$. It rises at first, then collapses:', table: { head: ['$n$', '$n^3$', '$2^n$', '$n^3/2^n$'], rows: [['2', '8', '4', '2'], ['4', '64', '16', '4'], ['8', '512', '256', '2'], ['16', '4096', '65536', '0.0625'], ['32', '32768', '$\\approx 4.3 \\times 10^9$', '$\\approx 7.6 \\times 10^{-6}$']] } },
      'Why it keeps falling: going from $n$ to $n + 1$ multiplies the ratio by $\\dfrac{(n+1)^3/2^{n+1}}{n^3/2^n} = \\dfrac{1}{2}\\left(\\dfrac{n+1}{n}\\right)^3$.',
      'For $n \\ge 10$: $\\left(\\tfrac{n+1}{n}\\right)^3 \\le 1.1^3 = 1.331$, so each step multiplies the ratio by at most $0.67$. Shrinking by that factor over and over drives it to 0: $L = 0$.',
      { text: 'One limit decides all five boxes. Here $L = 0$, the first row:', table: FIVE },
    ],
    graph: {
      caption: 'Log scale. $2^n$ (a straight line here) is above $n^3$ for good from $n = 10$. The ratio $n^3/2^n$ peaks near $n = 4$, then falls toward 0.',
      x: [1, 30], y: [1e-5, 2e9], logY: true, xLabel: 'n', yLabel: 'value',
      curves: [{ label: '$n^3$', f: n => n ** 3, tone: 'a' }, { label: '$2^n$', f: n => 2 ** n, tone: 'b' }, { label: 'ratio $n^3/2^n$', f: n => n ** 3 / 2 ** n, tone: 'c' }],
      marks: [{ x: 10, label: '$n = 10$' }],
    },
    answer: '$O$ yes, $o$ yes, $\\Omega$ no, $\\omega$ no, $\\Theta$ no, because $\\lim_{n\\to\\infty} n^3/2^n = 0$.',
    mistake: 'Trusting small $n$: at $n = 8$, $n^3 = 512$ is still bigger than $2^8 = 256$. Asymptotic questions are about the trend as $n \\to \\infty$.',
    tryIt: { q: 'Let $f = n^2 \\lg n$ and $g = n^3$. Give all five answers.', a: '$\\dfrac{n^2 \\lg n}{n^3} = \\dfrac{\\lg n}{n} \\to 0$, so $L = 0$: $O$ yes, $o$ yes; $\\Omega$, $\\omega$, $\\Theta$ no.' },
  };

  H['c310-3-cmp-log2-sqrt'] = {
    asks: 'Five yes/no boxes again: how does $(\\lg n)^2$, a log squared, compare with $\\sqrt{n} = n^{1/2}$?',
    idea: 'Rename $n = 2^m$, so $m = \\lg n$ counts doublings. Then $(\\lg n)^2 = m^2$ only squares the count, while $\\sqrt{n} = 2^{m/2}$ doubles every time $m$ goes up by 2. Squaring loses to repeated doubling.',
    steps: [
      'Ratio: $\\dfrac{(\\lg n)^2}{\\sqrt{n}}$. Substitute $n = 2^m$: $\\lg n = m$ and $\\sqrt{n} = (2^m)^{1/2} = 2^{m/2}$. As $n \\to \\infty$, $m \\to \\infty$ too.',
      'The ratio becomes $\\dfrac{m^2}{2^{m/2}}$. Each $+2$ in $m$ doubles the bottom, while the top is multiplied by $\\left(\\tfrac{m+2}{m}\\right)^2$, which is below 2 once $m \\ge 5$. So the ratio shrinks toward 0.',
      { text: 'The numbers agree, but only for large $n$; small $n$ is misleading here:', table: { head: ['$n$', '$(\\lg n)^2$', '$\\sqrt{n}$', 'ratio'], rows: [['$10$', '$11.0$', '$3.16$', '$3.49$'], ['$100$', '$44.1$', '$10$', '$4.41$'], ['$1000$', '$99.3$', '$31.6$', '$3.14$'], ['$10^6$', '$397$', '$1000$', '$0.397$'], ['$10^{12}$', '$1589$', '$10^6$', '$0.0016$']] } },
      'The ratio peaks near $n \\approx 55$ (about 4.5), then falls for good: $L = 0$.',
      { text: 'One limit decides all five boxes. Here $L = 0$, the first row:', table: FIVE },
    ],
    graph: {
      caption: 'Plotted against $m = \\lg n$ (so $m = 40$ means $n \\approx 10^{12}$), log scale. $\\sqrt{n} = 2^{m/2}$ passes $(\\lg n)^2 = m^2$ at $m = 16$ ($n = 65536$, where both equal 256), and the ratio falls toward 0.',
      x: [1, 60], y: [1e-6, 2e9], logY: true, xLabel: 'm = lg n', yLabel: 'value',
      curves: [{ label: '$(\\lg n)^2 = m^2$', f: m => m * m, tone: 'a' }, { label: '$\\sqrt{n} = 2^{m/2}$', f: m => 2 ** (m / 2), tone: 'b' }, { label: 'ratio $m^2 / 2^{m/2}$', f: m => m * m / 2 ** (m / 2), tone: 'c' }],
      marks: [{ x: 16, label: '$n = 2^{16}$' }],
    },
    answer: '$O$ yes, $o$ yes, $\\Omega$ no, $\\omega$ no, $\\Theta$ no: $(\\lg n)^2/\\sqrt{n} \\to 0$.',
    mistake: 'Concluding from $n = 10, 100, 1000$ that the ratio is roughly constant (it sits between 3 and 4.5 there). Push $n$ much further, or substitute $n = 2^m$, before answering.',
    tryIt: { q: 'Compare $f = (\\lg n)^3$ with $g = n$: give all five answers.', a: 'With $n = 2^m$ the ratio is $m^3/2^m \\to 0$, so $L = 0$: $O$ and $o$ yes; $\\Omega$, $\\omega$, $\\Theta$ no. (At $n = 10^9$ the ratio is about $2.7 \\times 10^{-5}$.)' },
  };

  H['c310-3-cmp-logbase'] = {
    asks: 'Five yes/no boxes for $\\log_2 n$ against $\\log_{10} n$. Do logs with different bases grow at different rates?',
    idea: '$\\log_2 n$ counts how many doublings reach $n$; $\\log_{10} n$ counts how many multiply-by-10 steps reach $n$. One multiply-by-10 is about 3.32 doublings ($2^{3.32} \\approx 10$), so one count is always 3.32 times the other. A fixed multiple is the same growth rate.',
    steps: [
      'Let $y = \\log_2 n$. By definition, $2^y = n$.',
      'Take $\\log_{10}$ of both sides: $\\log_{10}(2^y) = \\log_{10} n$, and the power comes down: $y \\log_{10} 2 = \\log_{10} n$.',
      'Divide by $\\log_{10} 2 \\approx 0.30103$: $\\log_2 n = \\dfrac{\\log_{10} n}{\\log_{10} 2} \\approx 3.32 \\log_{10} n$.',
      { text: 'The ratio is the same at every $n$:', table: { head: ['$n$', '$10$', '$100$', '$1000$'], rows: [['$\\log_2 n$', '$3.32$', '$6.64$', '$9.97$'], ['$\\log_{10} n$', '$1$', '$2$', '$3$'], ['ratio', '$3.32$', '$3.32$', '$3.32$']] } },
      'So $L = 1/\\log_{10} 2 \\approx 3.32$: positive and finite.',
      { text: 'One limit decides all five boxes. Here $L$ is a positive constant, the middle row:', table: FIVE },
    ],
    graph: {
      caption: 'Both logs rise slowly; their ratio is the flat line at 3.32 for every $n$.',
      x: [1, 100], y: [0, 7.5], xLabel: 'n', yLabel: 'value',
      curves: [{ label: '$\\log_2 n$', f: n => Math.log2(n), tone: 'a' }, { label: '$\\log_{10} n$', f: n => Math.log10(n), tone: 'b' }, { label: 'ratio $\\approx 3.32$', f: n => 1 / Math.log10(2), tone: 'c' }],
    },
    answer: '$O$, $\\Omega$, $\\Theta$ yes; $o$, $\\omega$ no. $\\log_2 n / \\log_{10} n = 1/\\log_{10} 2 \\approx 3.32$, a positive constant.',
    mistake: 'Thinking base 2 grows faster because $\\log_2 n$ is bigger. Bigger by a fixed factor is the same rate, which is why $\\Theta(\\log n)$ is written with no base.',
    tryIt: { q: 'Compare $\\ln n$ with $\\lg n = \\log_2 n$: give all five answers.', a: '$\\ln n = \\lg n \\cdot \\ln 2$, so $\\ln n / \\lg n = \\ln 2 \\approx 0.693$, a positive constant: $O$, $\\Omega$, $\\Theta$ yes; $o$, $\\omega$ no.' },
  };

  H['c310-3-cmp-n2n'] = {
    asks: 'Is $n \\cdot 2^n$ bounded above by some constant multiple of $2^n$? Answer true or false using the definition of big-O.',
    idea: '$n \\cdot 2^n$ is $2^n$ copied $n$ times. Big-O lets you copy $2^n$ a fixed number $c$ of times. Once $n$ passes $c$, the $n$ copies beat the $c$ copies, whatever $c$ you chose.',
    steps: [
      'Suppose it were true: there are $c > 0$ and $n_0$ with $n \\cdot 2^n \\le c \\cdot 2^n$ for all $n \\ge n_0$.',
      '$2^n > 0$, so divide both sides by it: $n \\le c$ for all $n \\ge n_0$.',
      'That fails for any whole number $n$ bigger than both $n_0$ and $c$. So no such $c$ and $n_0$ exist: the statement is false.',
      { text: 'Limit view: the ratio is $\\dfrac{n \\cdot 2^n}{2^n} = n$, which goes to $\\infty$:', table: { head: ['$n$', '$2$', '$4$', '$8$', '$16$'], rows: [['$n \\cdot 2^n / 2^n$', '$2$', '$4$', '$8$', '$16$']] } },
      '$L = \\infty$, so $n \\cdot 2^n \\in \\omega(2^n)$: strictly faster, so not $O$. Equivalently, $2^n \\in o(n \\cdot 2^n)$.',
    ],
    graph: {
      caption: 'Log scale. Try $c = 10$: $10 \\cdot 2^n$ is above $n \\cdot 2^n$ only while $n < 10$; from $n = 10$ on, $n \\cdot 2^n$ catches up and then stays above. Any $c$ fails the same way at $n = c$.',
      x: [1, 20], y: [1, 3e7], logY: true, xLabel: 'n', yLabel: 'value',
      curves: [{ label: '$n \\cdot 2^n$', f: n => n * 2 ** n, tone: 'a' }, { label: '$10 \\cdot 2^n$', f: n => 10 * 2 ** n, tone: 'b' }, { label: '$2^n$', f: n => 2 ** n, tone: 'c' }],
      marks: [{ x: 10, label: '$n = c = 10$' }],
    },
    answer: 'False. $n \\cdot 2^n \\le c \\cdot 2^n$ reduces to $n \\le c$, which no constant $c$ satisfies for all large $n$. (The ratio is $n \\to \\infty$, so it is $\\omega(2^n)$.)',
    mistake: 'Reasoning "the exponential dominates, so the factor $n$ does not matter". A factor that grows with $n$ always changes the rate; only constant factors can be dropped.',
    tryIt: { q: 'True or false: $(n + 5)\\,2^n = O(n\\,2^n)$.', a: 'True. Dividing by $n\\,2^n$, we need $(n + 5)/n \\le c$. For $n \\ge 1$, $(n + 5)/n = 1 + 5/n \\le 6$, so $c = 6$, $n_0 = 1$.' },
  };

  H['c310-3-cmp-2n-n5'] = {
    asks: 'Does adding $n^5$ to $2^n$ change its growth rate? Decide whether $2^n + n^5 = \\Theta(2^n)$, and justify.',
    idea: 'It is like dropping $10n + 20$ from $0.3n^2 + 10n + 20$ (slide 4): a term that becomes a vanishing fraction of the leading term does not change the rate. Here $n^5$ ends up a vanishing fraction of $2^n$, even though it is far bigger for small $n$.',
    steps: [
      'Ratio: $\\dfrac{2^n + n^5}{2^n} = \\dfrac{2^n}{2^n} + \\dfrac{n^5}{2^n} = 1 + \\dfrac{n^5}{2^n}$.',
      'Show $n^5/2^n \\to 0$: from $n$ to $n + 1$ it is multiplied by $\\tfrac12\\left(\\tfrac{n+1}{n}\\right)^5$. That factor is below 1 for $n \\ge 7$ and falls toward $\\tfrac12$, so the term shrinks to 0.',
      { text: 'The numbers agree once $n$ is large:', table: { head: ['$n$', '$n^5/2^n$', '$(2^n + n^5)/2^n$'], rows: [['$2$', '$8$', '$9$'], ['$4$', '$64$', '$65$'], ['$8$', '$128$', '$129$'], ['$16$', '$16$', '$17$'], ['$32$', '$0.0078$', '$1.0078$'], ['$64$', '$5.8 \\times 10^{-11}$', '$\\approx 1$']] } },
      'So $L = 1 + 0 = 1$, a positive constant, which means $\\Theta$.',
      'Explicit constants: $n^5 \\le 2^n$ for every $n \\ge 23$ ($22^5 = 5{,}153{,}632 > 2^{22} = 4{,}194{,}304$, but $23^5 = 6{,}436{,}343 < 2^{23} = 8{,}388{,}608$). So for $n \\ge 23$: $1 \\cdot 2^n \\le 2^n + n^5 \\le 2 \\cdot 2^n$, giving $c_1 = 1$, $c_2 = 2$, $n_0 = 23$.',
    ],
    graph: {
      caption: 'Log scale. From $n_0 = 23$ on, $2^n + n^5$ is sandwiched between $2^n$ and $2 \\cdot 2^n$. The ratio $(2^n + n^5)/2^n$ peaks at $n = 7$ (about 132) and then settles to 1.',
      x: [1, 40], y: [0.5, 3e12], logY: true, xLabel: 'n', yLabel: 'value',
      curves: [{ label: '$2^n + n^5$', f: n => 2 ** n + n ** 5, tone: 'a' }, { label: '$2 \\cdot 2^n$', f: n => 2 * 2 ** n, tone: 'b' }, { label: '$2^n$', f: n => 2 ** n, tone: 'c' }, { label: 'ratio $(2^n + n^5)/2^n$', f: n => 1 + n ** 5 / 2 ** n, tone: 'd' }],
      marks: [{ x: 23, label: '$n_0 = 23$' }],
      from: 23,
    },
    answer: 'True. $(2^n + n^5)/2^n = 1 + n^5/2^n \\to 1$, a positive constant; concretely $2^n \\le 2^n + n^5 \\le 2 \\cdot 2^n$ for $n \\ge 23$.',
    mistake: 'Checking small $n$ and concluding $n^5$ dominates (at $n = 16$ it is still 16 times $2^n$). The rate is decided by the limit, not by early values.',
    tryIt: { q: 'True or false: $n^2 + 100\\,n \\lg n = \\Theta(n^2)$.', a: 'True. The ratio is $1 + \\dfrac{100 \\lg n}{n} \\to 1 + 0 = 1$. (At $n = 1000$ it is still about 2.0; at $n = 10^6$, about 1.002.)' },
  };

  H['c310-3-cmp-nlogn-n15'] = {
    asks: 'Pick the relation between $n \\lg n$ and $n^{1.5} = n \\cdot \\sqrt{n}$: same rate, strictly slower, or strictly faster?',
    idea: 'Both have a factor $n$. Cancel it and the question becomes $\\lg n$ against $\\sqrt{n}$: a log against a positive power of $n$, and the power wins.',
    steps: [
      'Ratio: $\\dfrac{n \\lg n}{n^{1.5}} = \\dfrac{n \\lg n}{n \\cdot n^{0.5}} = \\dfrac{\\lg n}{\\sqrt{n}}$.',
      'Top and bottom both still go to infinity, so compare their rates by differentiating top and bottom (L’Hôpital). Since $\\lg n = \\ln n / \\ln 2$, its derivative is $\\dfrac{1}{n \\ln 2}$; the derivative of $\\sqrt{n}$ is $\\dfrac{1}{2\\sqrt{n}}$.',
      'New ratio: $\\dfrac{1/(n \\ln 2)}{1/(2\\sqrt{n})} = \\dfrac{2\\sqrt{n}}{n \\ln 2} = \\dfrac{2}{\\sqrt{n}\\,\\ln 2} \\to 0$.',
      { text: 'The numbers agree:', table: { head: ['$n$', '$10$', '$100$', '$1000$', '$10^6$'], rows: [['$\\lg n / \\sqrt{n}$', '$1.05$', '$0.664$', '$0.315$', '$0.0199$']] } },
      '$L = 0$, so $f = o(g)$ (and $O$). Not $\\Theta$ (that needs a positive constant), and not $\\Omega$ or $\\omega$ (those need $L > 0$).',
    ],
    graph: {
      caption: 'Log scale. $n^{1.5}$ pulls away from $n \\lg n$; their ratio $\\lg n / \\sqrt{n}$ tops out near $n = 7$ and then falls toward 0.',
      x: [2, 1000], y: [0.1, 1e5], logY: true, xLabel: 'n', yLabel: 'value',
      curves: [{ label: '$n \\lg n$', f: n => n * Math.log2(n), tone: 'a' }, { label: '$n^{1.5}$', f: n => n ** 1.5, tone: 'b' }, { label: 'ratio $\\lg n / \\sqrt{n}$', f: n => Math.log2(n) / Math.sqrt(n), tone: 'c' }],
    },
    answer: '$f = o(g)$: $\\dfrac{n \\lg n}{n^{1.5}} = \\dfrac{\\lg n}{\\sqrt{n}} \\to 0$.',
    mistake: 'Seeing "$n$ times something" in both and calling it $\\Theta$. After cancelling the shared $n$, compare what is left: $\\lg n$ loses to $\\sqrt{n}$.',
    tryIt: { q: 'Which relation holds between $n \\lg n$ and $n (\\lg n)^2$?', a: 'Cancel $n \\lg n$: the ratio is $\\dfrac{1}{\\lg n} \\to 0$, so $n \\lg n = o(n (\\lg n)^2)$.' },
  };
})(globalThis.FC = globalThis.FC || {});
