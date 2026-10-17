// "Help" walkthroughs for CSC 310 cards, part b: the Assignment 1 cards on Big-O, Omega, Theta
// and on proofs from the definitions (Lecture 3). Same entry format as decks/csc310-help.js
// (see its header comment). c310-3-prove-O lives in csc310-help.js, not here.
// The assignment's own questions are not used: every example and tryIt uses other functions.
// Every number, table row, constant pair and tryIt answer was checked with python3 / node on 2026-10-16.
(function (FC) {
  'use strict';
  const H = FC.help = FC.help || {};

  H['c310-3-analogy-all'] = {
    asks: "Match $\\Theta$ to a comparison between two plain numbers $a$ and $b$: $=$, $\\le$, $<$, $\\ge$ or $>$.",
    idea: 'Think of each function as having a speed of growth. The five symbols compare the speed of $f$ with the speed of $g$, the way $=, \\le, <, \\ge, >$ compare two numbers. Constant multipliers do not change the speed, so $3n^2$ and $n^2$ count as equal.',
    steps: [
      '$f = \\Theta(g)$: same speed, because $f$ is trapped between two stretched copies of $g$. Like $a = b$.',
      '$f = O(g)$: $f$ grows no faster than $g$ (same speed or slower). Like $a \\le b$.',
      '$f = o(g)$: $f$ grows strictly slower, so $f(n)/g(n) \\to 0$. Like $a < b$.',
      '$f = \\Omega(g)$ is the mirror of $O$: no slower than $g$, like $a \\ge b$. $f = \\omega(g)$ is the mirror of $o$: strictly faster, $f(n)/g(n) \\to \\infty$, like $a > b$.',
      { text: 'Rule of thumb: little letters ($o$, $\\omega$) are the strict versions of the big ones. With $g(n) = n^2$:', table: { head: ['$f(n)$', 'speed vs $n^2$', 'true statements'], rows: [['$\\tfrac12 n^2$', 'same', '$\\Theta$, $O$, $\\Omega$'], ['$8n$', 'slower', '$O$, $o$'], ['$\\tfrac{1}{10} n^3$', 'faster', '$\\Omega$, $\\omega$']] } },
      'Check the table against numbers: $a = b$ makes $=, \\le, \\ge$ true; $a < b$ makes $\\le, <$ true; $a > b$ makes $\\ge, >$ true. Same pattern.',
    ],
    graph: {
      caption: 'Against the blue $n^2$: $\\tfrac12 n^2$ runs alongside it (same speed, $\\Theta$), $8n$ falls behind for good after $n = 8$ ($o$), $\\tfrac{1}{10}n^3$ pulls ahead for good after $n = 10$ ($\\omega$).',
      x: [0, 16], y: [0, 420], xLabel: 'n', yLabel: 'value',
      curves: [
        { label: '$g(n) = n^2$', f: n => n * n, tone: 'a' },
        { label: '$\\tfrac12 n^2$ ($\\Theta$)', f: n => n * n / 2, tone: 'b' },
        { label: '$8n$ ($o$)', f: n => 8 * n, tone: 'c' },
        { label: '$\\tfrac{1}{10} n^3$ ($\\omega$)', f: n => n * n * n / 10, tone: 'd' },
      ],
      marks: [{ x: 8, label: '$n = 8$' }, { x: 10, label: '$n = 10$' }],
    },
    answer: "$\\Theta$ is like $a = b$ (and $O$ like $\\le$, $o$ like $<$, $\\Omega$ like $\\ge$, $\\omega$ like $>$).",
    mistake: 'Reading the analogy as "$f(n) \\le g(n)$ at every $n$". It compares growth speed, not values: $3n^2 = O(n^2)$ is true even though $3n^2 > n^2$ for every $n \\ge 1$.',
    tryIt: { q: 'Which of $\\Theta, O, o, \\Omega, \\omega$ are true for $f(n) = n$, $g(n) = n^3$?', a: '$n$ grows strictly slower than $n^3$ ($n/n^3 = 1/n^2 \\to 0$), like $a < b$. So $O$ and $o$ are true; $\\Theta$, $\\Omega$, $\\omega$ are false.' },
  };

  H['c310-3-analogy-Omega'] = {
    asks: 'Which number comparison ($>$, $\\ge$, $\\le$, $=$) behaves like $f(n) = \\Omega(g(n))$?',
    idea: '$\\Omega$ is a floor. From some point on, $f$ never drops below a scaled-down copy $c \\cdot g$. "Never below" is "at least", which is $\\ge$.',
    steps: [
      'Read the definition (slide 17): $f(n) \\ge c\\,g(n)$ for all $n \\ge n_0$, with $c > 0$. The sign in it is already $\\ge$.',
      '$\\ge$ allows equal speed: $2n = \\Omega(n)$ is true (take $c = 1$: $2n \\ge n$ for all $n \\ge 1$). So it cannot be the strict $>$; that one is $\\omega$.',
      '$\\le$ is the ceiling, which is $O$. $=$ needs a floor AND a ceiling, which is $\\Theta$.',
      'Example: $\\tfrac14 n^2 = \\Omega(n)$ with $c = 1$: $\\tfrac14 n^2 \\ge n \\iff \\tfrac14 n \\ge 1 \\iff n \\ge 4$ (divide by $n > 0$, then multiply by 4). So $n_0 = 4$.',
    ],
    graph: {
      caption: 'The floor $c\\,g(n) = n$ (red) is above $f$ until $n = 4$; from $n_0 = 4$ on, $f$ stays on or above it forever. "At least, from some point on" is $\\ge$.',
      x: [0, 12], y: [0, 40], xLabel: 'n', yLabel: 'value',
      curves: [{ label: '$f(n) = \\tfrac14 n^2$', f: n => n * n / 4, tone: 'a' }, { label: '$c\\,g(n) = n$', f: n => n, tone: 'b' }],
      marks: [{ x: 4, label: '$n_0 = 4$' }],
      from: 4,
    },
    answer: '$a \\ge b$. $\\Omega$ is a lower bound that may be tight (equal speed allowed); the strict version $a > b$ is $\\omega$.',
    mistake: 'Picking $a > b$ because "$\\Omega$ means bigger". $\\Omega$ includes the equal case: $n^2 = \\Omega(n^2)$ is true.',
    tryIt: { q: 'Which comparison is $f(n) = \\omega(g(n))$ like? Is $n^2 = \\omega(n^2)$ true?', a: '$\\omega$ is like $a > b$ (strictly faster). $n^2 = \\omega(n^2)$ is false: $n^2/n^2 = 1$, which does not go to $\\infty$. But $n^2 = \\Omega(n^2)$ is true ($c = 1$).' },
  };

  H['c310-3-theta-def'] = {
    asks: "State exactly what has to be true for $f(n) \\in \\Theta(g(n))$: which constants exist and which inequality they satisfy, from which point on.",
    idea: 'A sandwich. Squeeze $f$ between a shrunk copy $c_1 g$ (floor) and a stretched copy $c_2 g$ (ceiling). If, from some point on, $f$ never leaves that band, $f$ grows at the same speed as $g$.',
    steps: [
      'The slide 6 definition: $c_1 g(n) \\le f(n) \\le c_2 g(n)$ $\\forall n \\ge n_0$, with $c_1, c_2 > 0$. ($\\forall$ reads "for all".)',
      '"There exist $c_1, c_2, n_0$" means YOU choose them; you only need one choice that works. "$c_1, c_2 > 0$" means the floor and ceiling are real, positive multiples of $g$.',
      '"For all $n \\ge n_0$" means from $n_0$ on, forever. Small $n$ below $n_0$ are ignored.',
      'Example: $f(n) = 2n^2 + 3n$, $g(n) = n^2$. Floor: $2n^2 \\le 2n^2 + 3n$ for every $n \\ge 1$ (we added $3n \\ge 0$), so $c_1 = 2$.',
      'Ceiling: $3n \\le n^2 \\iff 3 \\le n$ (divide by $n$). So for $n \\ge 3$: $2n^2 + 3n \\le 2n^2 + n^2 = 3n^2$, and $c_2 = 3$, $n_0 = 3$.',
      { text: 'Check: both inequalities hold from $n = 3$ on.', table: { head: ['$n$', '$2n^2$', '$f(n)$', '$3n^2$', 'holds?'], rows: [['2', '8', '14', '12', 'no'], ['3', '18', '27', '27', 'yes (equal)'], ['5', '50', '65', '75', 'yes'], ['10', '200', '230', '300', 'yes']] } },
    ],
    graph: {
      caption: 'From $n_0 = 3$ on, $f$ (blue) stays inside the band between the floor $2n^2$ and the ceiling $3n^2$. Before 3 it pokes above the ceiling, which is allowed.',
      x: [0, 8], y: [0, 200], xLabel: 'n', yLabel: 'value',
      curves: [
        { label: '$c_1 g(n) = 2n^2$', f: n => 2 * n * n, tone: 'c' },
        { label: '$f(n) = 2n^2 + 3n$', f: n => 2 * n * n + 3 * n, tone: 'a' },
        { label: '$c_2 g(n) = 3n^2$', f: n => 3 * n * n, tone: 'b' },
      ],
      marks: [{ x: 3, label: '$n_0 = 3$' }],
      from: 3,
    },
    answer: "There exist constants $c_1 > 0$, $c_2 > 0$ and $n_0$ such that $c_1 g(n) \\le f(n) \\le c_2 g(n)$ for all $n \\ge n_0$.",
    mistake: 'Proving only one side. $\\Theta$ needs the floor AND the ceiling with one shared $n_0$; if the two sides start at different points, take the larger one.',
    tryIt: { q: 'Give $c_1, c_2, n_0$ showing $n^2 + 6n \\in \\Theta(n^2)$.', a: 'Floor: $n^2 \\le n^2 + 6n$ for $n \\ge 1$, so $c_1 = 1$. Ceiling: $6n \\le n^2$ when $n \\ge 6$, so $n^2 + 6n \\le 2n^2$. Take $c_1 = 1$, $c_2 = 2$, $n_0 = 6$.' },
  };

  H['c310-3-bigO-def'] = {
    asks: "State exactly what has to be true for $f(n) \\in O(g(n))$: which constants exist, the inequality, and from which point on.",
    idea: 'A ceiling. Stretch $g$ by a constant $c$; if from some point on $f$ stays under the stretched copy forever, $f$ grows no faster than $g$. Only the ceiling matters, not a floor.',
    steps: [
      'The slide 13 definition: $0 \\le f(n) \\le c\\,g(n)$ $\\forall n \\ge n_0$, with $c > 0$.',
      'In words (her slide): for at least one choice of $c > 0$, you can find an $n_0$ so that the inequality holds for all $n \\ge n_0$. You choose $c$ and $n_0$; one working pair is enough.',
      'The $0 \\le f(n)$ part says $f$ is not negative, which is always true of a running time. The real work is $f(n) \\le c\\,g(n)$.',
      'Example: $f(n) = 3n + 8$, $g(n) = n$. $8 \\le n$ exactly when $n \\ge 8$, so for $n \\ge 8$: $3n + 8 \\le 3n + n = 4n$, giving $c = 4$, $n_0 = 8$.',
      { text: 'Check:', table: { head: ['$n$', '$3n + 8$', '$4n$', 'holds?'], rows: [['7', '29', '28', 'no'], ['8', '32', '32', 'yes (equal)'], ['10', '38', '40', 'yes'], ['20', '68', '80', 'yes']] } },
    ],
    graph: {
      caption: '$f$ is above plain $g(n) = n$ everywhere, yet $f \\in O(n)$: only the stretched copy $4n$ has to end up on top, and it does from $n_0 = 8$ on.',
      x: [0, 16], y: [0, 70], xLabel: 'n', yLabel: 'value',
      curves: [
        { label: '$f(n) = 3n + 8$', f: n => 3 * n + 8, tone: 'a' },
        { label: '$c\\,g(n) = 4n$', f: n => 4 * n, tone: 'b' },
        { label: '$g(n) = n$', f: n => n, tone: 'c' },
      ],
      marks: [{ x: 8, label: '$n_0 = 8$' }],
      from: 8,
    },
    answer: "There exist constants $c > 0$ and $n_0$ such that $0 \\le f(n) \\le c\\,g(n)$ for all $n \\ge n_0$.",
    mistake: 'Thinking $f \\le g$ must hold with no constant. $3n + 8 > n$ for every $n$, but $3n + 8 \\in O(n)$ because you may stretch $g$ by $c$ and ignore $n < n_0$.',
    tryIt: { q: 'Find $c$ and $n_0$ showing $5n + 12 \\in O(n)$.', a: '$12 \\le n$ when $n \\ge 12$, so $5n + 12 \\le 6n$ for $n \\ge 12$: $c = 6$, $n_0 = 12$. (Also $c = 17$, $n_0 = 1$, since $12 \\le 12n$ for $n \\ge 1$.)' },
  };

  H['c310-3-omega-def'] = {
    asks: "State exactly what has to be true for $f(n) \\in \\Omega(g(n))$: which constants exist, the inequality, and from which point on.",
    idea: 'A floor. Shrink $g$ by a constant $c$; if from some point on $f$ stays on or above the shrunk copy forever, $f$ grows at least as fast as $g$.',
    steps: [
      'The definition: $0 \\le c\\,g(n) \\le f(n)$ for all $n \\ge n_0$, with $c > 0$. (Slide 17 writes it as $f \\ge c\\,g(n)$ $\\forall n \\ge n_0$ and $c > 0$; same thing.)',
      'As with $O$: you choose $c$ and $n_0$, one working pair is enough, and "for all $n \\ge n_0$" means from $n_0$ on, forever.',
      'Example: $f(n) = n^2 - 4n$, $g(n) = n^2$. $c = 1$ cannot work ($n^2 - 4n \\ge n^2$ would need $-4n \\ge 0$), so shrink: try $c = \\tfrac12$.',
      '$n^2 - 4n \\ge \\tfrac12 n^2 \\iff \\tfrac12 n^2 \\ge 4n$ (move terms) $\\iff \\tfrac12 n \\ge 4$ (divide by $n > 0$) $\\iff n \\ge 8$. So $c = \\tfrac12$, $n_0 = 8$.',
      { text: 'Check:', table: { head: ['$n$', '$n^2 - 4n$', '$\\tfrac12 n^2$', 'holds?'], rows: [['6', '12', '18', 'no'], ['8', '32', '32', 'yes (equal)'], ['10', '60', '50', 'yes'], ['20', '320', '200', 'yes']] } },
    ],
    graph: {
      caption: '$f$ (blue) is below $g = n^2$ everywhere, yet $f \\in \\Omega(n^2)$: it only has to stay above the shrunk floor $\\tfrac12 n^2$, which it does from $n_0 = 8$ on.',
      x: [0, 14], y: [-5, 200], xLabel: 'n', yLabel: 'value',
      curves: [
        { label: '$f(n) = n^2 - 4n$', f: n => n * n - 4 * n, tone: 'a' },
        { label: '$c\\,g(n) = \\tfrac12 n^2$', f: n => n * n / 2, tone: 'b' },
        { label: '$g(n) = n^2$', f: n => n * n, tone: 'c' },
      ],
      marks: [{ x: 8, label: '$n_0 = 8$' }],
      from: 8,
    },
    answer: "There exist constants $c > 0$ and $n_0$ such that $0 \\le c\\,g(n) \\le f(n)$ for all $n \\ge n_0$.",
    mistake: 'Copying the $O$ definition and keeping $\\le c\\,g(n)$ on the right. For $\\Omega$ the stretched $g$ goes UNDER $f$: $c\\,g(n) \\le f(n)$.',
    tryIt: { q: 'Find $c$ and $n_0$ showing $n^2 - 6n \\in \\Omega(n^2)$.', a: 'Try $c = \\tfrac12$: $n^2 - 6n \\ge \\tfrac12 n^2 \\iff \\tfrac12 n^2 \\ge 6n \\iff n \\ge 12$. So $c = \\tfrac12$, $n_0 = 12$.' },
  };

  H['c310-3-tf-poly'] = {
    asks: "Give a reason, working for any such polynomial, why every polynomial of degree $d$ (leading coefficient positive) is $\\Theta(n^d)$.",
    idea: 'Divide the polynomial by $n^d$. What is left is the leading coefficient $a_d$ plus leftovers like $a_0/n^d$ that shrink toward 0. Something that settles at $a_d > 0$ can be trapped between two positive constants: that is the $\\Theta$ sandwich.',
    steps: [
      'Write $p(n) = a_d n^d + a_{d-1} n^{d-1} + \\dots + a_0$ with $a_d > 0$. Goal: $c_1 n^d \\le p(n) \\le c_2 n^d$ for all $n \\ge n_0$.',
      'Ceiling: for $n \\ge 1$ and $i \\le d$, $n^i \\le n^d$, so each term $a_i n^i \\le |a_i| n^d$. Adding them: $p(n) \\le (|a_d| + \\dots + |a_0|)\\, n^d$, so $c_2 = |a_d| + \\dots + |a_0|$.',
      'Floor: divide by $n^d$: $p(n)/n^d = a_d + a_{d-1}/n + \\dots + a_0/n^d$. For $n \\ge 1$ each leftover is at least $-|a_i|/n$, so $p(n)/n^d \\ge a_d - S/n$, where $S = |a_{d-1}| + \\dots + |a_0|$.',
      '$a_d - S/n \\ge \\tfrac12 a_d \\iff S/n \\le \\tfrac12 a_d \\iff n \\ge 2S/a_d$. So $c_1 = \\tfrac12 a_d$ works once $n \\ge 2S/a_d$.',
      'Example: $p(n) = 2n^3 - 5n^2 + 4$. Here $a_d = 2$, $S = 5 + 4 = 9$: $c_1 = 1$, $c_2 = 2 + 5 + 4 = 11$, and the recipe gives $n_0 = 2 \\cdot 9/2 = 9$.',
      { text: 'Check the example. The recipe\'s $n_0 = 9$ is safe; the floor actually starts holding at $n = 5$.', table: { head: ['$n$', '$n^3$', '$p(n)$', '$11n^3$', 'holds?'], rows: [['4', '64', '52', '704', 'no'], ['5', '125', '129', '1375', 'yes'], ['10', '1000', '1504', '11000', 'yes']] } },
    ],
    graph: {
      caption: 'The blue curve is $p(n)/n^3$. It settles toward the leading coefficient 2, so from $n = 5$ on it stays between $c_1 = 1$ and $c_2 = 11$ (far above, off the top). Dividing the sandwich by $n^3$ gives exactly this picture.',
      x: [1, 20], y: [-0.5, 3], xLabel: 'n', yLabel: 'p(n) / n^3',
      curves: [
        { label: '$p(n)/n^3 = 2 - 5/n + 4/n^3$', f: n => 2 - 5 / n + 4 / (n * n * n), tone: 'a' },
        { label: '$a_d = 2$', f: () => 2, tone: 'c' },
        { label: '$c_1 = 1$', f: () => 1, tone: 'b' },
      ],
      marks: [{ x: 5, label: '$n_0 = 5$' }],
      from: 5,
    },
    answer: "The leading term dominates. With $S = |a_{d-1}| + \\dots + |a_0|$: $\\tfrac12 a_d\\, n^d \\le p(n) \\le (a_d + S)\\, n^d$ for all $n \\ge \\max(1, 2S/a_d)$, so $p(n) = \\Theta(n^d)$.",
    mistake: 'Answering "true, drop the lower terms" with no constants. A justification from the definition names $c_1$, $c_2$, $n_0$ and shows why both inequalities hold.',
    tryIt: { q: 'Use the recipe to give $c_1, c_2, n_0$ for $3n^2 - 4n + 1 = \\Theta(n^2)$.', a: '$a_d = 3$, $S = 4 + 1 = 5$. $c_1 = \\tfrac32$, $c_2 = 3 + 4 + 1 = 8$, $n_0 = 2 \\cdot 5/3 = 10/3$, rounded up to 4. Check $n = 4$: $24 \\le 33 \\le 128$.' },
  };

  H['c310-3-tf-4n5-theta1'] = {
    asks: "$\\Theta(1)$ is the set of functions that stay between two positive constants forever. Prove that $4n + 5$ is not in it.",
    idea: '$\\Theta(1)$ is a flat band: $c_1 \\le f(n) \\le c_2$. A function that keeps climbing must eventually break through any flat ceiling, no matter how high you put it.',
    steps: [
      'With $g(n) = 1$ the $\\Theta$ definition reads: $c_1 \\cdot 1 \\le 4n + 5 \\le c_2 \\cdot 1$ for all $n \\ge n_0$.',
      'The floor is fine ($4n + 5 \\ge 1$ for $n \\ge 0$). The problem is the ceiling: $4n + 5 \\le c_2$.',
      'Solve for $n$: $4n + 5 \\le c_2 \\iff 4n \\le c_2 - 5 \\iff n \\le (c_2 - 5)/4$. So the ceiling holds only up to $n = (c_2 - 5)/4$ and fails for every larger $n$.',
      'Example: $c_2 = 1000$ holds only up to $n = 995/4 = 248.75$. At $n = 249$: $4 \\cdot 249 + 5 = 1001 > 1000$.',
      'Whatever $c_2$ and $n_0$ someone picks, take $n$ larger than both $n_0$ and $(c_2 - 5)/4$; the ceiling fails there. So no constants work: false.',
    ],
    graph: {
      caption: 'Each flat line is a candidate ceiling $c_2$. The line $4n + 5$ breaks through $c_2 = 20$ at $n = 3.75$, $40$ at $8.75$, $60$ at $13.75$. Raising $c_2$ only delays the escape.',
      x: [0, 20], y: [0, 90], xLabel: 'n', yLabel: 'value',
      curves: [
        { label: '$f(n) = 4n + 5$', f: n => 4 * n + 5, tone: 'a' },
        { label: '$c_2 = 20$', f: () => 20, tone: 'b' },
        { label: '$c_2 = 40$', f: () => 40, tone: 'c' },
        { label: '$c_2 = 60$', f: () => 60, tone: 'd' },
      ],
      marks: [{ x: 3.75, label: '$3.75$' }, { x: 8.75, label: '$8.75$' }, { x: 13.75, label: '$13.75$' }],
    },
    answer: "$4n + 5 \\le c_2$ fails for every $n > (c_2 - 5)/4$, so no constant ceiling holds for all large $n$. In fact $4n + 5 = \\Theta(n)$.",
    mistake: 'Thinking "$+5$ is a constant, so it is $\\Theta(1)$". The term that decides is the one that grows: $4n$.',
    tryIt: { q: 'True or false: $7 + \\tfrac1n = \\Theta(1)$.', a: 'True. For $n \\ge 1$: $0 < \\tfrac1n \\le 1$, so $7 \\le 7 + \\tfrac1n \\le 8$. Take $c_1 = 7$, $c_2 = 8$, $n_0 = 1$.' },
  };

  H['c310-3-tf-4n5-On2'] = {
    asks: "Back up $4n + 5 = O(n^2)$ with an actual pair $c$, $n_0$.",
    idea: '$O$ is like $\\le$, and $\\le$ does not have to be close: $3 \\le 100$ is true. $4n + 5$ grows slower than $n^2$, so $n^2$ is a loose but valid ceiling.',
    steps: [
      'Goal: find $c > 0$ and $n_0$ with $4n + 5 \\le c\\,n^2$ for all $n \\ge n_0$.',
      'Raise each term to $n^2$. For $n \\ge 1$: $n \\le n^2$, so $4n \\le 4n^2$; and $1 \\le n^2$, so $5 \\le 5n^2$.',
      'Add the two: $4n + 5 \\le 4n^2 + 5n^2 = 9n^2$ for all $n \\ge 1$. So $c = 9$, $n_0 = 1$.',
      'A smaller $c$ also works if you wait longer. With $c = 1$: $4n + 5 \\le n^2 \\iff n^2 - 4n - 5 \\ge 0 \\iff (n - 5)(n + 1) \\ge 0 \\iff n \\ge 5$ (for $n \\ge 0$).',
      { text: 'Check both pairs:', table: { head: ['$n$', '$4n + 5$', '$9n^2$', '$n^2$'], rows: [['1', '9', '9', '1'], ['2', '13', '36', '4'], ['5', '25', '225', '25'], ['6', '29', '324', '36']] } },
    ],
    graph: {
      caption: 'Even the unstretched $n^2$ (red) catches $4n + 5$ at $n = 5$ and stays above. $9n^2$ (off the top early) is already above from $n = 1$. Either pair proves the claim.',
      x: [0, 9], y: [0, 90], xLabel: 'n', yLabel: 'value',
      curves: [
        { label: '$f(n) = 4n + 5$', f: n => 4 * n + 5, tone: 'a' },
        { label: '$n^2$ ($c = 1$)', f: n => n * n, tone: 'b' },
        { label: '$9n^2$ ($c = 9$)', f: n => 9 * n * n, tone: 'c' },
      ],
      marks: [{ x: 5, label: '$n_0 = 5$ for $c = 1$' }],
      from: 5,
    },
    answer: "$c = 9$, $n_0 = 1$: for $n \\ge 1$, $4n + 5 \\le 4n^2 + 5n^2 = 9n^2$. (Or $c = 1$, $n_0 = 5$.)",
    mistake: 'Answering false because "$4n + 5$ is $O(n)$, not $O(n^2)$". Both are true; $O(n)$ is just the tighter statement.',
    tryIt: { q: 'True or false, with constants: $6n + 2 = O(n^3)$.', a: 'True. For $n \\ge 1$: $6n \\le 6n^3$ and $2 \\le 2n^3$, so $6n + 2 \\le 8n^3$. Take $c = 8$, $n_0 = 1$.' },
  };

  H['c310-3-tf-theta-implies'] = {
    asks: "Explain, by pointing at the definitions, why $f = \\Theta(g)$ makes $f$ automatically $O(g)$ and $\\Omega(g)$.",
    idea: 'The $\\Theta$ sandwich is two inequalities glued together. The top half, by itself, is the $O$ definition. The bottom half, by itself, is the $\\Omega$ definition.',
    steps: [
      '$f(n) = \\Theta(g(n))$ gives $c_1, c_2 > 0$ and $n_0$ with $c_1 g(n) \\le f(n) \\le c_2 g(n)$ for all $n \\ge n_0$.',
      'Keep only the right half: $f(n) \\le c_2 g(n)$ for all $n \\ge n_0$. That is the $O$ definition with $c = c_2$ and the same $n_0$, so $f = O(g)$.',
      'Keep only the left half: $c_1 g(n) \\le f(n)$ for all $n \\ge n_0$. That is the $\\Omega$ definition with $c = c_1$ and the same $n_0$, so $f = \\Omega(g)$.',
      'Example: $n^2 + 4n = \\Theta(n^2)$ with $c_1 = 1$, $c_2 = 2$, $n_0 = 4$ ($4n \\le n^2$ when $n \\ge 4$). So it is $O(n^2)$ with $c = 2$, $n_0 = 4$ and $\\Omega(n^2)$ with $c = 1$, $n_0 = 4$.',
      'The converse holds too: if $f = O(g)$ (some $c_2$, $n_0\'$) and $f = \\Omega(g)$ (some $c_1$, $n_0\'\'$), take $n_0 = \\max(n_0\', n_0\'\')$ and both halves hold at once: $\\Theta$.',
    ],
    graph: {
      caption: 'One picture, two proofs. Above $f$ is the $O$ ceiling $2n^2$; below it is the $\\Omega$ floor $n^2$. From $n_0 = 4$ on, $f$ is under the ceiling and over the floor.',
      x: [0, 9], y: [0, 170], xLabel: 'n', yLabel: 'value',
      curves: [
        { label: '$\\Omega$ floor: $n^2$', f: n => n * n, tone: 'c' },
        { label: '$f(n) = n^2 + 4n$', f: n => n * n + 4 * n, tone: 'a' },
        { label: '$O$ ceiling: $2n^2$', f: n => 2 * n * n, tone: 'b' },
      ],
      marks: [{ x: 4, label: '$n_0 = 4$' }],
      from: 4,
    },
    answer: "The right half of the sandwich, $f(n) \\le c_2 g(n)$, is the $O$ definition; the left half, $c_1 g(n) \\le f(n)$, is the $\\Omega$ definition; both use the same $n_0$.",
    mistake: 'Running the implication backward: $O$ alone does NOT give $\\Theta$. You need both $O$ and $\\Omega$.',
    tryIt: { q: 'If $f(n) = O(g(n))$, does $f(n) = \\Theta(g(n))$ follow? Test with $f(n) = n$, $g(n) = n^2$.', a: 'No. $n = O(n^2)$ ($n \\le n^2$ for $n \\ge 1$), but $n \\ne \\Omega(n^2)$: $c\\,n^2 \\le n$ means $n \\le 1/c$, which fails for large $n$. No floor, so no $\\Theta$.' },
  };

  H['c310-3-which-notation'] = {
    asks: "The lecture pairs each notation with a job. Which one bounds the worst-case running time from above?",
    idea: 'For one input size $n$, different inputs take different times: the best case is the fastest, the worst case the slowest. Put a ceiling over the slowest and every input is under it. Put a floor under the fastest and every input is over it.',
    steps: [
      'Fix $n$. Every input of size $n$ has a running time between the best-case time and the worst-case time.',
      '$O$ is a ceiling: if the worst case is $\\le c\\,g(n)$, every input is $\\le c\\,g(n)$. So $O$ goes on the worst case (slide 13).',
      '$\\Omega$ is a floor: if the best case is $\\ge c\\,g(n)$, every input is $\\ge c\\,g(n)$. So $\\Omega$ goes under the best case (slide 17).',
      '$\\Theta$ is a ceiling and a floor of the same $g$: an asymptotically tight bound (slide 9).',
      'Insertion sort, counting comparisons: worst case $n(n-1)/2$, best case $n - 1$. So its running time is $O(n^2)$ and $\\Omega(n)$ (slide 18): every input lands between.',
    ],
    graph: {
      caption: 'Insertion sort comparisons. Every input of size $n$ lands between the best case and the worst case. The ceiling $n^2$ is above the worst case ($O$); the floor $\\tfrac12 n$ is below the best case for $n \\ge 2$ ($\\Omega$).',
      x: [1, 12], y: [0, 150], xLabel: 'n', yLabel: 'comparisons',
      curves: [
        { label: '$O$ ceiling: $n^2$', f: n => n * n, tone: 'b' },
        { label: 'worst: $n(n-1)/2$', f: n => n * (n - 1) / 2, tone: 'a' },
        { label: 'best: $n - 1$', f: n => n - 1, tone: 'd' },
        { label: '$\\Omega$ floor: $\\tfrac12 n$', f: n => n / 2, tone: 'c' },
      ],
    },
    answer: "$O$ bounds the worst case from above (and $\\Omega$ bounds the best case from below; $\\Theta$ is tight).",
    mistake: 'Thinking $O$ MEANS worst case: $O$, $\\Omega$, $\\Theta$ bound any function, and the pairing is only how they are used. Insertion sort\'s worst case is $\\Theta(n^2)$, so the worst case is also $\\Omega(n^2)$.',
    tryIt: { q: 'An algorithm does $3n$ steps on its best input and $n^3$ steps on its worst input of size $n$. What do $O$ and $\\Omega$ tell you about its running time?', a: 'Worst case $n^3 \\le 1 \\cdot n^3$, so the running time is $O(n^3)$. Best case $3n \\ge 1 \\cdot n$, so it is $\\Omega(n)$. Every input of size $n$ takes between those.' },
  };

  H['c310-3-prove-Omega'] = {
    asks: "Name $c$ and $n_0$ that show $7n - 3 = \\Omega(n)$, and why the inequality holds from $n_0$ on.",
    idea: 'You need a floor $c \\cdot n$ under $7n - 3$. The "$-3$" stops $c = 7$ from working, so pick $c$ a bit smaller. The gap $7n - c\\,n$ then grows with $n$ and soon swallows the 3.',
    steps: [
      'Write what you must show: find $c > 0$ and $n_0$ so that $0 \\le c\\,n \\le 7n - 3$ for every $n \\ge n_0$.',
      'Why not $c = 7$: $7n - 3 \\ge 7n$ would need $-3 \\ge 0$, never true.',
      'Try $c = 6$: $7n - 3 \\ge 6n \\iff 7n - 6n \\ge 3 \\iff n \\ge 3$. So for $n \\ge 3$ the floor holds, and $6n \\ge 0$ too.',
      { text: 'Check:', table: { head: ['$n$', '$7n - 3$', '$6n$', 'holds?'], rows: [['2', '11', '12', 'no'], ['3', '18', '18', 'yes (equal)'], ['4', '25', '24', 'yes'], ['10', '67', '60', 'yes']] } },
      'Write it up: "Take $c = 6$, $n_0 = 3$. For all $n \\ge 3$, $7n - 3 = 6n + (n - 3) \\ge 6n = c\\,n \\ge 0$. Hence $7n - 3 = \\Omega(n)$."',
    ],
    graph: {
      caption: 'The floor $6n$ (red) is above $7n - 3$ at $n = 2$, they meet at $n = 3$, and from then on $7n - 3$ stays above: that is what $c = 6$, $n_0 = 3$ claims.',
      x: [0, 8], y: [0, 55], xLabel: 'n', yLabel: 'value',
      curves: [{ label: '$f(n) = 7n - 3$', f: n => 7 * n - 3, tone: 'a' }, { label: '$c\\,g(n) = 6n$', f: n => 6 * n, tone: 'b' }],
      marks: [{ x: 3, label: '$n_0 = 3$' }],
      from: 3,
    },
    answer: "$c = 6$, $n_0 = 3$: $7n - 3 \\ge 6n \\iff n \\ge 3$. (Other pairs work too, e.g. $c = 1$, $n_0 = 1$.)",
    mistake: 'Choosing $c$ equal to the leading coefficient (7), which can never beat the $-3$. For $\\Omega$ with a minus sign, pick $c$ smaller than the leading coefficient.',
    tryIt: { q: 'Prove $5n - 8 = \\Omega(n)$.', a: 'Take $c = 4$: $5n - 8 \\ge 4n \\iff n \\ge 8$. So $c = 4$, $n_0 = 8$ (check $n = 8$: $32 \\ge 32$).' },
  };

  H['c310-3-prove-not-O'] = {
    asks: 'Prove that NO choice of $c$ and $n_0$ makes $n^2 \\le c\\,n$ hold from $n_0$ on. Showing that one particular $c$ fails is not enough.',
    idea: 'Every ceiling $c \\cdot n$ is a straight line; $n^2$ bends upward. Whatever slope $c$ you choose, $n^2$ crosses the line at $n = c$ and stays above. Since this happens for every $c$, no ceiling works.',
    steps: [
      'Suppose, to get a contradiction, that someone gives you $c > 0$ and $n_0$ with $n^2 \\le c\\,n$ for all $n \\ge n_0$.',
      'Divide both sides by $n$ (positive, so the $\\le$ stays): $n \\le c$ for all $n \\ge n_0$.',
      'That says $n$ never gets past the fixed number $c$. But take $n = \\max(n_0, \\lceil c \\rceil + 1)$: it is $\\ge n_0$ and $> c$, so $n \\le c$ is false there.',
      { text: 'The failure point for a few values of $c$ (at $n = c + 1$):', table: { head: ['$c$', '$n$', '$n^2$', '$c\\,n$'], rows: [['10', '11', '121', '110'], ['100', '101', '10201', '10100'], ['1000', '1001', '1002001', '1001000']] } },
      'The argument used a general $c$ and $n_0$, so it rules out all of them. No constants exist: $n^2 \\ne O(n)$.',
    ],
    graph: {
      caption: 'Three candidate ceilings $5n$, $10n$, $15n$. $n^2$ escapes each one at $n = c$ (5, 10, 15). A steeper line only moves the escape point right; it never stops it.',
      x: [0, 20], y: [0, 320], xLabel: 'n', yLabel: 'value',
      curves: [
        { label: '$f(n) = n^2$', f: n => n * n, tone: 'a' },
        { label: '$5n$', f: n => 5 * n, tone: 'b' },
        { label: '$10n$', f: n => 10 * n, tone: 'c' },
        { label: '$15n$', f: n => 15 * n, tone: 'd' },
      ],
      marks: [{ x: 5, label: '$c = 5$' }, { x: 10, label: '$c = 10$' }, { x: 15, label: '$c = 15$' }],
    },
    answer: 'Assume $n^2 \\le c\\,n$ for all $n \\ge n_0$. Dividing by $n$: $n \\le c$ for all $n \\ge n_0$, false at $n = \\max(n_0, \\lceil c \\rceil + 1)$. Contradiction, so $n^2$ is not $O(n)$.',
    mistake: 'Showing only that $c = 1$ (or any single $c$) fails. "Not $O$" means EVERY $c$ fails, so the proof must work for a general $c$.',
    tryIt: { q: 'Prove $n^3$ is not $O(n^2)$.', a: 'Assume $n^3 \\le c\\,n^2$ for all $n \\ge n_0$. Divide by $n^2$: $n \\le c$ for all $n \\ge n_0$, false at $n = \\max(n_0, \\lceil c \\rceil + 1)$. Contradiction.' },
  };

  H['c310-3-prove-theta'] = {
    asks: 'Find a floor constant $c_1$, a ceiling constant $c_2$ and a starting point $n_0$ so that $c_1 n^2 \\le \\tfrac12 n^2 - 3n \\le c_2 n^2$ for every $n \\ge n_0$, and show it.',
    idea: 'Divide everything by $n^2$. The middle becomes a single number, $\\tfrac12 - 3/n$, that creeps up toward $\\tfrac12$ as $n$ grows. Then you only need a number below it and a number above it.',
    steps: [
      'Divide all three parts by $n^2$ (positive, so the $\\le$ signs stay): $c_1 \\le \\tfrac12 - \\tfrac3n \\le c_2$.',
      { text: 'See how the middle behaves:', table: { head: ['$n$', '$\\tfrac12 - \\tfrac3n$'], rows: [['3', '$-\\tfrac12$'], ['6', '$0$'], ['7', '$\\tfrac{1}{14}$'], ['12', '$\\tfrac14$'], ['60', '$\\tfrac{9}{20}$']] } },
      'Ceiling: $\\tfrac3n > 0$, so $\\tfrac12 - \\tfrac3n < \\tfrac12$ for every $n \\ge 1$. Take $c_2 = \\tfrac12$.',
      'Floor: $c_1$ must be positive, but the middle is $\\le 0$ for $n \\le 6$. So start at $n_0 = 7$: there the middle is $\\tfrac12 - \\tfrac37 = \\tfrac{7}{14} - \\tfrac{6}{14} = \\tfrac{1}{14}$.',
      'The middle only grows as $n$ grows ($\\tfrac3n$ shrinks), so for all $n \\ge 7$ it is $\\ge \\tfrac{1}{14}$. Take $c_1 = \\tfrac{1}{14}$.',
      'Check in the original form at $n = 7$: $\\tfrac{1}{14} \\cdot 49 = 3.5$, $\\tfrac12 \\cdot 49 - 21 = 3.5$, $\\tfrac12 \\cdot 49 = 24.5$. So $3.5 \\le 3.5 \\le 24.5$ holds.',
    ],
    graph: {
      caption: 'The middle $\\tfrac12 - 3/n$ (blue) climbs toward $\\tfrac12$. It reaches the floor $c_1 = \\tfrac{1}{14}$ exactly at $n = 7$ and stays between floor and ceiling from then on.',
      x: [1, 30], y: [-0.6, 0.6], xLabel: 'n', yLabel: 'f(n) / n^2',
      curves: [
        { label: '$\\tfrac12 - 3/n$', f: n => 0.5 - 3 / n, tone: 'a' },
        { label: '$c_2 = \\tfrac12$', f: () => 0.5, tone: 'b' },
        { label: '$c_1 = \\tfrac{1}{14}$', f: () => 1 / 14, tone: 'c' },
      ],
      marks: [{ x: 7, label: '$n_0 = 7$' }],
      from: 7,
    },
    answer: '$c_1 = \\tfrac{1}{14}$, $c_2 = \\tfrac12$, $n_0 = 7$: for $n \\ge 7$, $\\tfrac{1}{14} \\le \\tfrac12 - \\tfrac3n \\le \\tfrac12$; multiply by $n^2$ to get the sandwich.',
    mistake: 'Taking $n_0 = 6$. There $\\tfrac12 n^2 - 3n = 0$, and no positive $c_1$ gives $c_1 \\cdot 36 \\le 0$.',
    tryIt: { q: 'Prove $\\tfrac13 n^2 - 2n = \\Theta(n^2)$.', a: 'Divide by $n^2$: $c_1 \\le \\tfrac13 - \\tfrac2n \\le c_2$. $c_2 = \\tfrac13$ for $n \\ge 1$. At $n = 12$ the middle is $\\tfrac13 - \\tfrac16 = \\tfrac16$, so $c_1 = \\tfrac16$, $n_0 = 12$ (or $c_1 = \\tfrac{1}{21}$, $n_0 = 7$).' },
  };
})(globalThis.FC = globalThis.FC || {});
