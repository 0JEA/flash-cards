// Help walkthroughs for the CSC 310 master-theorem cards (FC.csc310Cards, sub 'Master theorem':
// Lecure 6 slides 7-12 and Master_Theorem.pdf "The Master Theorem Explained").
// Same format as decks/csc310-help.js. Every log value, epsilon, regularity constant, crossover
// point and tryIt answer was checked with python3 (mpmath) on 2026-10-16.
// Known error in Master_Theorem.pdf p. 3: it calls 2T(n/2) + n^2/log n a gap example, but
// Case 3 applies (the ratio n/log n beats n^0.5). The entries below say so where it matters.
// ACADEMIC INTEGRITY: Assignment 2's recurrence and its split are never used here, and no tryIt
// uses an uneven split.
(function (FC) {
  'use strict';
  const H = FC.help = FC.help || {};

  // ---------------------------------------------------------------- shared pieces

  const lg = Math.log2;
  const CASE_HEAD = ['$a$', '$b$', '$\\log_b a$', '$f(n)$', 'compare', 'case'];
  const caseStep = (text, rows) => ({ text, table: { head: CASE_HEAD, rows } });
  // levels: [nodes, sum] pairs, null = gap row
  const tree = (levels, caption) => ({
    sumsLabel: 'level total', caption,
    levels: levels.map(l => (l ? { nodes: l[0], sum: l[1] } : { gap: true })),
  });
  const LEAVES = ['$T(1)$', '$T(1)$', '$\\cdots$', '$T(1)$'];
  // f(n) against n^{log_b a} on a log scale
  const vs = (caption, x, curves, extra) => Object.assign({
    caption, x, logY: true, xLabel: 'n', yLabel: 'work (log scale)',
    curves: curves.map(([label, f], i) => ({ label, f, tone: 'abcd'[i] })),
  }, extra || {});

  // Generic aT(n/b) + f(n) tree, node labels = work done in that node.
  const GEN_TREE = caption => tree([
    [['$f(n)$'], '$f(n)$'],
    [['$f(\\tfrac{n}{b})$', '$f(\\tfrac{n}{b})$', '$\\cdots$', '$f(\\tfrac{n}{b})$'], '$a\\,f(\\tfrac{n}{b})$'],
    [['$f(\\tfrac{n}{b^2})$', '$f(\\tfrac{n}{b^2})$', '$\\cdots$', '$f(\\tfrac{n}{b^2})$'], '$a^2 f(\\tfrac{n}{b^2})$'],
    null,
    [LEAVES, '$n^{\\log_b a} \\cdot T(1)$'],
  ], caption);

  // ---------------------------------------------------------------- the form and its parts

  H['c310-6-master-form'] = {
    asks: 'The master method only works on recurrences of one exact shape. Name the shape, and the rule that each part ($a$, $b$, $f(n)$) must obey.',
    idea: 'Picture one call of a recursive function on size $n$: it makes $a$ recursive calls, every one on a piece of size $n/b$, and does $f(n)$ work of its own. If the recurrence is not literally that picture, none of the three cases may be used.',
    tree: GEN_TREE('Every node has $a$ children and every child is $b$ times smaller. That only makes sense if $a$ and $b$ are fixed numbers with $a \\ge 1$ and $b > 1$.'),
    steps: [
      'The shape: $T(n) = aT(n/b) + f(n)$. Every recursive call is on the same size $n/b$.',
      '$a \\ge 1$ is a constant: the number of recursive calls each call makes. It cannot depend on $n$, and $a < 1$ would mean less than one call.',
      '$b > 1$ is a constant: the number the size is divided by. With $b > 1$ the size shrinks at every level and reaches the base case after $\\log_b n$ levels; with $b \\le 1$ it never shrinks.',
      '$f(n)$ is asymptotically positive: $f(n) > 0$ for all large $n$. It is the work outside the recursive calls (dividing and combining), and work is never negative.',
      { text: 'Test the shape on some recurrences:', table: { head: ['recurrence', 'fits?', 'why'], rows: [
        ['$2T(n/2) + n$', 'yes', '$a = 2$, $b = 2$, $f(n) = n$'],
        ['$T(2n/3) + 1$', 'yes', '$2n/3 = n/(3/2)$, so $b = 3/2$'],
        ['$T(n-1) + n$', 'no', '$n - 1$ subtracts; it does not divide'],
        ['$T(n/4) + T(3n/4) + n$', 'no', 'two different sizes'],
        ['$\\tfrac12 T(n/2) + n$', 'no', '$a = \\tfrac12 < 1$'],
        ['$n\\,T(n/2) + 1$', 'no', '$a = n$ is not a constant'],
      ] } },
    ],
    answer: '$T(n) = aT(n/b) + f(n)$, where $a \\ge 1$ is a constant, $b > 1$ is a constant, and $f(n)$ is asymptotically positive (Lecture 6, slide 7).',
    mistake: 'Jumping to the three cases for something like $T(n-1) + n$ or $T(n/4) + T(3n/4) + n$. Check the shape first: one subproblem size $n/b$, constant $a \\ge 1$, constant $b > 1$.',
    tryIt: { q: 'Which fit the master form? (i) $3T(n/5) + n^2$, (ii) $T(n-2) + 1$, (iii) $2T(n/2) + T(n/4) + n$.', a: '(i) Yes: $a = 3$, $b = 5$, $f(n) = n^2$. (ii) No: the size goes down by subtracting 2. (iii) No: two different sizes, $n/2$ and $n/4$.' },
  };

  H['c310-master-parts'] = {
    asks: 'In $T(n) = aT(n/b) + f(n)$, say what $a$, $b$ and $f(n)$ each stand for in the algorithm.',
    idea: 'Read the recurrence as a description of ONE call: "I make $a$ recursive calls, each on input $b$ times smaller, and I do $f(n)$ work myself." In the recursion tree, $a$ is the number of children per node, $b$ is how much smaller each child is, and $f$ is the cost written inside a node.',
    tree: {
      sumsLabel: 'sizes',
      levels: [
        { nodes: ['$n$'], sum: '$1$ call' },
        { nodes: ['$\\tfrac{n}{2}$', '$\\tfrac{n}{2}$'], sum: '$2$ calls' },
        { nodes: ['$\\tfrac{n}{4}$', '$\\tfrac{n}{4}$', '$\\tfrac{n}{4}$', '$\\tfrac{n}{4}$'], sum: '$4$ calls' },
        { gap: true },
        { nodes: ['$1$', '$1$', '$\\cdots$', '$1$'], sum: '$n$ calls' },
      ],
      caption: 'Merge sort, nodes labelled by input size: every node has $a = 2$ children, each child is $b = 2$ times smaller, and each node does $f = \\Theta(\\text{its size})$ work in Merge.',
    },
    steps: [
      '$a$ = the number of recursive calls one call makes (children per node). Merge sort sorts the left half and the right half: $a = 2$.',
      '$b$ = the factor the input shrinks by: each call gets size $n/b$. Merge sort’s halves have size $n/2$: $b = 2$.',
      '$f(n)$ = the non-recursive work in one call: splitting the input and combining the answers. Merge sort’s Merge touches all $n$ elements: $f(n) = \\Theta(n)$.',
      { text: 'The same three questions on other algorithms:', table: { head: ['algorithm', '$a$ (calls)', '$b$ (shrink)', '$f(n)$ (own work)'], rows: [
        ['merge sort', '2', '2', '$\\Theta(n)$'],
        ['binary search', '1', '2', '$\\Theta(1)$'],
        ['Karatsuba', '3', '2', '$\\Theta(n)$'],
        ['Strassen', '7', '2', '$\\Theta(n^2)$'],
      ] } },
      'The rules: $a \\ge 1$ (at least one call) and $b > 1$ (the input really gets smaller). Both must be constants.',
    ],
    answer: '$a \\ge 1$: the number of recursive subproblems. $b > 1$: the factor by which the subproblem size decreases. $f(n)$: the non-recursive work done per call (dividing and combining).',
    mistake: 'Mixing up $a$ and $b$: $a$ counts calls, $b$ divides the size. Merge sort hides the difference ($a = b = 2$); binary search shows it ($a = 1$, $b = 2$).',
    tryIt: { q: 'An algorithm splits its input of size $n$ into 4 quarters, recurses on 3 of them, and spends $n^2$ time combining. Write its recurrence and name $a$, $b$, $f$.', a: '$T(n) = 3T(n/4) + n^2$: $a = 3$ (calls), $b = 4$ (each piece is $n/4$), $f(n) = n^2$.' },
  };

  H['c310-master-compare'] = {
    asks: 'The master theorem decides everything by comparing two functions. Which two, and what does each one measure?',
    idea: 'The recursion tree has a top, the root’s own work $f(n)$, and a bottom, the base-case leaves, of which there are exactly $n^{\\log_b a}$. The theorem asks which end of the tree is heavier.',
    tree: GEN_TREE('Top row: the root’s work $f(n)$. Bottom row: $n^{\\log_b a}$ leaves, each a constant. The master theorem weighs these two ends against each other.'),
    steps: [
      'Depth: the size goes $n, \\tfrac{n}{b}, \\tfrac{n}{b^2}, \\dots$ and reaches 1 when $b^k = n$, that is, at depth $k = \\log_b n$.',
      'Leaves: each level has $a$ times as many nodes as the one above, so the bottom has $a^{\\log_b n}$ nodes.',
      'Rewrite: $a^{\\log_b n} = n^{\\log_b a}$. Check by taking $\\log_b$ of both sides: the left gives $\\log_b n \\cdot \\log_b a$, the right gives $\\log_b a \\cdot \\log_b n$, the same.',
      { text: 'Count leaves by hand and compare with $n^{\\log_b a}$:', table: { head: ['recurrence', '$n$', 'depth $\\log_b n$', 'leaves $a^{\\text{depth}}$', '$n^{\\log_b a}$'], rows: [
        ['$2T(n/2) + \\cdots$', '16', '4', '$2^4 = 16$', '$16^1 = 16$'],
        ['$4T(n/2) + \\cdots$', '16', '4', '$4^4 = 256$', '$16^2 = 256$'],
        ['$9T(n/3) + \\cdots$', '27', '3', '$9^3 = 729$', '$27^2 = 729$'],
        ['$T(n/2) + \\cdots$', '16', '4', '$1^4 = 1$', '$16^0 = 1$'],
      ] } },
      'So the theorem compares $f(n)$, the non-recursive work at the top, with $n^{\\log_b a}$, the work of the recursive calls at the bottom. Polynomially bigger wins; a tie makes every level cost the same, and the number of levels ($\\log n$) multiplies in.',
    ],
    answer: '$f(n)$, the non-recursive work, against $n^{\\log_b a}$, the work done in the recursive calls (the number of leaves of the recursion tree).',
    mistake: 'Comparing $f(n)$ with $n$, or with $a$, instead of with $n^{\\log_b a}$. Work out the exponent $\\log_b a$ first, every time.',
    tryIt: { q: 'For $T(n) = 3T(n/9) + f(n)$, what is $n^{\\log_b a}$? How many leaves does the tree have when $n = 81$?', a: '$9^{1/2} = 3$, so $\\log_9 3 = \\tfrac12$ and $n^{\\log_b a} = \\sqrt{n}$. At $n = 81$: depth $\\log_9 81 = 2$, leaves $3^2 = 9 = \\sqrt{81}$.' },
  };

  // ---------------------------------------------------------------- the three cases

  H['c310-master-case1'] = {
    asks: 'State Case 1 of the master theorem exactly (condition and result), and say what it means.',
    idea: 'Case 1 is the bottom-heavy tree. If the top work $f(n)$ is smaller than the leaf count $n^{\\log_b a}$ by a whole power of $n$, the level costs grow as you go down, and the leaves set the answer.',
    tree: tree([
      [['$100n$'], '$100n$'],
      [['$50n$', '$50n$', '$\\cdots$', '$50n$'], '$400n$'],
      [['$25n$', '$25n$', '$\\cdots$', '$25n$'], '$1600n$'],
      null,
      [LEAVES, '$\\Theta(n^3)$'],
    ], 'Her example $8T(n/2) + 100n$: 8 children per node, so each level costs 4 times the one above. A growing geometric series is dominated by its last term, the $n^3$ leaves.'),
    steps: [
      'Statement (Lecture 6, slide 8): if $f(n) = O(n^{\\log_b a - \\epsilon})$ for some constant $\\epsilon > 0$, then $T(n) = \\Theta(n^{\\log_b a})$.',
      'Read the condition: $f$ is at most $n^{\\log_b a}$ divided by $n^\\epsilon$. Smaller by a POLYNOMIAL factor, not just smaller.',
      'Why the leaves win: level $i$ costs $a^i f(n/b^i)$, and when $f$ is polynomially smaller these costs grow geometrically toward the bottom. A growing geometric series is a constant times its last term, and the last level is the $n^{\\log_b a}$ leaves.',
      'Her example: $T(n) = 8T(n/2) + 100n$. $n^{\\log_2 8} = n^3$ and $100n = O(n^{3-2})$, so $\\epsilon = 2$ works and $T(n) = \\Theta(n^3)$.',
      'Interpretation (notes, page 4): the recursive part dominates.',
    ],
    answer: 'If $f(n) = O(n^{\\log_b a - \\epsilon})$ for some constant $\\epsilon > 0$, then $T(n) = \\Theta(n^{\\log_b a})$: the recursion (the leaves) dominates.',
    mistake: 'Dropping the $-\\epsilon$ and writing "$f = O(n^{\\log_b a})$". That also allows $f = n^{\\log_b a}$ itself, which is Case 2.',
    tryIt: { q: 'Does Case 1 apply to $T(n) = 16T(n/4) + n$? If so, solve it.', a: '$4^2 = 16$, so $n^{\\log_4 16} = n^2$. $n = O(n^{2-1})$ with $\\epsilon = 1$: yes, $T(n) = \\Theta(n^2)$.' },
  };

  H['c310-master-case2'] = {
    asks: 'State Case 2 of the master theorem exactly, and say what it means.',
    idea: 'Case 2 is the flat tree: the top and the bottom weigh the same, and so does every level in between. The total is one level’s cost times the number of levels, and that is where the extra $\\log n$ comes from.',
    tree: tree([
      [['$n$'], '$n$'],
      [['$\\tfrac{n}{2}$', '$\\tfrac{n}{2}$'], '$n$'],
      [['$\\tfrac{n}{4}$', '$\\tfrac{n}{4}$', '$\\tfrac{n}{4}$', '$\\tfrac{n}{4}$'], '$n$'],
      null,
      [LEAVES, '$n \\cdot T(1)$'],
    ], 'Her example $2T(n/2) + n$ (merge sort): every level costs $n$, and there are $\\lg n + 1$ levels. Total $\\approx n \\lg n$.'),
    steps: [
      'Statement (slide 8): if $f(n) = \\Theta(n^{\\log_b a})$, then $T(n) = \\Theta(n^{\\log_b a} \\lg n)$. The notes write $\\log n$; inside $\\Theta$ the base of the log does not matter.',
      'Read the condition: $f$ and $n^{\\log_b a}$ grow at the same rate, up to constant factors.',
      'Why every level ties: take $f(n) = n^{\\log_b a}$. Level $i$ costs $a^i (n/b^i)^{\\log_b a} = a^i \\cdot \\frac{n^{\\log_b a}}{a^i} = n^{\\log_b a}$, because $b^{\\log_b a} = a$.',
      'There are $\\log_b n + 1$ levels, each costing $n^{\\log_b a}$, so the total is $\\Theta(n^{\\log_b a} \\log n)$.',
      'Her example: $2T(n/2) + n$ has $n^{\\log_2 2} = n = \\Theta(f)$, so $T(n) = \\Theta(n \\log n)$. Interpretation (notes, page 4): balanced growth.',
    ],
    answer: 'If $f(n) = \\Theta(n^{\\log_b a})$, then $T(n) = \\Theta(n^{\\log_b a} \\log n)$: recursive and non-recursive work are balanced.',
    mistake: 'Answering $\\Theta(n^{\\log_b a})$ and losing the $\\log n$. The log counts the levels, and in Case 2 every level pays in full.',
    tryIt: { q: 'Solve $T(n) = 9T(n/3) + n^2$.', a: '$3^2 = 9$, so $n^{\\log_3 9} = n^2 = \\Theta(f)$. Case 2: $T(n) = \\Theta(n^2 \\log n)$.' },
  };

  H['c310-master-case3'] = {
    asks: 'State Case 3 of the master theorem exactly, including its extra condition, and say what it means.',
    idea: 'Case 3 is the top-heavy tree: the root’s own work outweighs everything below it. That needs two things: $f$ is polynomially bigger than the leaf count, and the level costs really do shrink as you go down (the regularity condition).',
    tree: tree([
      [['$n^3$'], '$n^3$'],
      [['$\\tfrac{n^3}{8}$', '$\\tfrac{n^3}{8}$'], '$\\tfrac{n^3}{4}$'],
      [['$\\tfrac{n^3}{64}$', '$\\tfrac{n^3}{64}$', '$\\tfrac{n^3}{64}$', '$\\tfrac{n^3}{64}$'], '$\\tfrac{n^3}{16}$'],
      null,
      [LEAVES, '$\\Theta(n)$'],
    ], 'Her example $2T(n/2) + n^3$: each level costs $\\tfrac14$ of the one above. All the internal levels together cost at most $\\tfrac43 n^3$, so the root’s $n^3$ decides the answer.'),
    steps: [
      'Statement (slide 8): if $f(n) = \\Omega(n^{\\log_b a + \\epsilon})$ for some constant $\\epsilon > 0$, AND $a f(n/b) \\le c f(n)$ for some constant $c < 1$ and all large $n$, then $T(n) = \\Theta(f(n))$.',
      'First condition: $f$ is bigger than $n^{\\log_b a}$ by at least a polynomial factor $n^\\epsilon$.',
      'Second condition (regularity): $a f(n/b)$ is the total cost of level 1, so level 1 costs at most a fixed fraction $c$ of the root. Repeating this, level $i$ costs at most $c^i f(n)$.',
      'Add the levels: $f(n)(1 + c + c^2 + \\cdots) = \\frac{f(n)}{1 - c}$, a constant times $f(n)$. The root alone already costs $f(n)$, so $T(n) = \\Theta(f(n))$.',
      'Her example: $2T(n/2) + n^3$. $n^{\\log_2 2} = n$; $n^3 = \\Omega(n^{1+2})$, so $\\epsilon = 2$; regularity $2(n/2)^3 = \\tfrac14 n^3$, so $c = \\tfrac14$; $T(n) = \\Theta(n^3)$.',
      'Interpretation: the non-recursive part dominates.',
    ],
    answer: 'If $f(n) = \\Omega(n^{\\log_b a + \\epsilon})$ for some constant $\\epsilon > 0$, and $a f(n/b) \\le c f(n)$ for some constant $c < 1$ and all large $n$, then $T(n) = \\Theta(f(n))$: the non-recursive work dominates.',
    mistake: 'Stating Case 3 without the regularity condition. It is part of the theorem; for a polynomial $f$ it always holds, but you still show it in one line.',
    tryIt: { q: 'Solve $T(n) = T(n/2) + n$, checking both Case 3 conditions.', a: '$n^{\\log_2 1} = n^0 = 1$. $n = \\Omega(n^{0+1})$, so $\\epsilon = 1$. Regularity: $1 \\cdot \\tfrac{n}{2} = \\tfrac12 n$, so $c = \\tfrac12$. $T(n) = \\Theta(n)$.' },
  };

  H['c310-master-regularity'] = {
    asks: 'Write the regularity condition from Case 3, and explain what it guarantees about the levels of the recursion tree.',
    idea: '$a f(n/b)$ is not a random expression: it is the total cost of level 1 of the tree ($a$ nodes, each doing $f(n/b)$). Regularity says level 1 costs at most a fixed fraction of the root, so the level costs shrink like a bouncing ball, and the first bounce (the root) carries the total.',
    steps: [
      'The condition: $a f(n/b) \\le c f(n)$ for some constant $c < 1$ and all sufficiently large $n$.',
      'Left side = level 1: $a$ children, each doing $f(n/b)$. Right side = $c$ times the root’s work.',
      'Every level-1 node is the root of its own smaller tree, so the same inequality applies one level down. Level 2 costs at most $c^2 f(n)$, and level $i$ at most $c^i f(n)$.',
      'Add the levels: $f(n)(1 + c + c^2 + \\cdots) \\le \\frac{f(n)}{1 - c}$. For $2T(n/2) + n^3$, $c = \\tfrac14$, so all the levels above the leaves cost at most $\\tfrac43 n^3$.',
      'So the root dominates and $T(n) = \\Theta(f(n))$. Without regularity the level costs need not shrink, and the root need not dominate.',
    ],
    graph: {
      caption: 'Bars: level costs of $2T(n/2) + n^3$ as a fraction of the root, $(\\tfrac14)^i$. Curve: the running total, which never passes $\\tfrac{1}{1 - 1/4} = \\tfrac43$.',
      x: [-0.5, 6], y: [0, 1.5], xLabel: 'level i', yLabel: 'cost / f(n)',
      curves: [{ label: 'running total', f: i => (1 - 0.25 ** (i + 1)) / 0.75, tone: 'a' }, { label: 'limit $\\tfrac43$', f: () => 4 / 3, tone: 'c' }],
      bars: { label: 'level cost $(1/4)^i$', tone: 'b', values: [[0, 1], [1, 1 / 4], [2, 1 / 16], [3, 1 / 64], [4, 1 / 256], [5, 1 / 1024]] },
    },
    answer: '$a f(n/b) \\le c f(n)$ for some constant $c < 1$ and all sufficiently large $n$. Level 1 costs at most a constant fraction of the root, so level costs shrink geometrically and the root dominates.',
    mistake: 'Writing $f(n/b) \\le c f(n)$ without the $a$. The condition is about the WHOLE of level 1, all $a$ nodes together.',
    tryIt: { q: 'Check the regularity condition for $T(n) = 3T(n/2) + n^2$.', a: '$3(n/2)^2 = \\tfrac34 n^2$, so $c = \\tfrac34 < 1$: it holds. (And since $\\log_2 3 \\approx 1.585 < 2$, Case 3 gives $\\Theta(n^2)$.)' },
  };

  H['c310-master-epsilon'] = {
    asks: 'What does $\\epsilon$ measure in the master theorem, and do you have to find a particular value for it?',
    idea: '$\\epsilon$ sits in an exponent, so it measures a gap that is a power of $n$: $n^{0.5}$, $n^1$, $n^2$. It is a yes/no test (does SOME positive power separate $f$ from $n^{\\log_b a}$?), not a number you have to get exactly right.',
    steps: [
      '$\\epsilon$ is a positive constant. Because it is an exponent, it measures a POLYNOMIAL gap, a factor of $n^\\epsilon$.',
      'Case 1, $f = O(n^{\\log_b a - \\epsilon})$: $f$ is slower by at least $n^\\epsilon$. Case 3, $f = \\Omega(n^{\\log_b a + \\epsilon})$: $f$ is faster by at least $n^\\epsilon$.',
      'You only show that some $\\epsilon > 0$ works. For $8T(n/2) + 100n$ ($f = n$ against $n^3$) every $\\epsilon$ with $0 < \\epsilon \\le 2$ works, and the notes take $\\epsilon = 2$.',
      'For a power $f = n^k$, the easy choice is the difference of exponents. $n^{1.5}$ against $n^2$: $\\epsilon = 0.5$.',
      'What $\\epsilon$ rules out: a gap that is only a log. $n \\lg n$ against $n$ differs by $\\lg n$, smaller than $n^\\epsilon$ for every $\\epsilon > 0$, so no $\\epsilon$ exists.',
    ],
    graph: vs('For $f(n) = n$ against $n^{\\log_b a} = n^3$: $f$ stays under $n^{3-\\epsilon}$ for $\\epsilon = 1$ and for $\\epsilon = 2$ (where the curves coincide). One working $\\epsilon$ is enough.', [1, 30], [
      ['$f(n) = n$ (same as $n^{3-2}$)', n => n],
      ['$n^{3-1} = n^2$', n => n * n],
      ['$n^{\\log_b a} = n^3$', n => n ** 3],
    ]),
    answer: 'A small positive constant measuring a polynomial gap ($n^\\epsilon$) between $f(n)$ and $n^{\\log_b a}$: slower in Case 1, faster in Case 3. No specific value is needed; some $\\epsilon > 0$ only has to exist.',
    mistake: 'Treating a log factor as if it were $n^\\epsilon$. $\\epsilon$ must be a positive constant, and $\\lg n$ grows slower than every $n^\\epsilon$.',
    tryIt: { q: 'For $T(n) = 4T(n/2) + n^{2.5}$, give a valid $\\epsilon$ and the answer.', a: '$n^{\\log_2 4} = n^2$. $n^{2.5} = \\Omega(n^{2+\\epsilon})$ with $\\epsilon = 0.5$ (any $0 < \\epsilon \\le 0.5$ works). Regularity: $4(n/2)^{2.5} = n^{2.5}/\\sqrt{2}$, $c \\approx 0.71$. Case 3: $\\Theta(n^{2.5})$.' },
  };

  H['c310-master-eps-classify'] = {
    asks: 'The leaf count is $n^{\\log_b a} = n^2$. For $f = n^{1.5}$, $n^2$ and $n^3$, say which case applies and give $\\epsilon$ where there is one.',
    idea: 'All three are powers of $n$, so only the exponents matter: compare each exponent with 2. Smaller means Case 1, equal means Case 2, bigger means Case 3, and $\\epsilon$ is the distance between the exponents.',
    steps: [
      '$f = n^{1.5}$: $1.5 < 2$, so $f$ is smaller by a factor $n^{0.5}$. $f = O(n^{2-\\epsilon})$ with $\\epsilon = 0.5$: Case 1.',
      '$f = n^2$: same exponent, $f = \\Theta(n^2)$: Case 2. There is no $\\epsilon$ in Case 2.',
      '$f = n^3$: $3 > 2$, bigger by $n^1$. $f = \\Omega(n^{2+\\epsilon})$ with $\\epsilon = 1$: Case 3, once regularity is checked.',
      'Regularity for $n^3$ always holds here: $n^{\\log_b a} = n^2$ means $a = b^2$, so $a(n/b)^3 = \\frac{b^2}{b^3} n^3 = \\frac{1}{b} n^3$, and $c = \\tfrac1b < 1$.',
      { text: 'Summary:', table: { head: ['$f(n)$', 'exponent vs 2', '$\\epsilon$', 'case', '$T(n)$'], rows: [
        ['$n^{1.5}$', 'smaller', '$0.5$', '1', '$\\Theta(n^2)$'],
        ['$n^2$', 'equal', 'none', '2', '$\\Theta(n^2 \\log n)$'],
        ['$n^3$', 'bigger', '$1$', '3', '$\\Theta(n^3)$'],
      ] } },
    ],
    graph: vs('Each $f$ divided by $n^2$. Falling line: Case 1. Flat line: Case 2. Rising line: Case 3. The slope on this log scale is the exponent difference, $-0.5$, $0$, $+1$.', [1, 100], [
      ['$n^{1.5}/n^2 = n^{-0.5}$', n => n ** -0.5],
      ['$n^2/n^2 = 1$', () => 1],
      ['$n^3/n^2 = n$', n => n],
    ], { yLabel: 'f / n² (log scale)' }),
    answer: '$n^{1.5}$: Case 1, $\\epsilon = 0.5$. $n^2$: Case 2 (no $\\epsilon$). $n^3$: Case 3, $\\epsilon = 1$ (if regularity holds).',
    mistake: 'Getting the sign backwards. Case 1 has $-\\epsilon$ ($f$ smaller), Case 3 has $+\\epsilon$ ($f$ bigger), and $\\epsilon$ itself is always positive.',
    tryIt: { q: 'Now $n^{\\log_b a} = n^3$. Classify $f = n^{2.2}$, $n^3$ and $n^4$.', a: '$n^{2.2}$: Case 1, $\\epsilon = 0.8$. $n^3$: Case 2. $n^4$: Case 3, $\\epsilon = 1$ (if regularity holds).' },
  };

  H['c310-master-summary'] = {
    asks: 'For each of the three cases, say in one phrase which part of the work dominates.',
    idea: 'In the recursion tree, the leaves are the recursion and the root is the non-recursive work. Case 1: the bottom is heaviest; Case 2: every level weighs the same; Case 3: the top is heaviest.',
    steps: [
      'Case 1, $f$ polynomially smaller than $n^{\\log_b a}$: recursion dominates. The leaves are heaviest, so $T(n) = \\Theta(n^{\\log_b a})$.',
      'Case 2, $f = \\Theta(n^{\\log_b a})$: balanced growth. Every level costs the same, so $T(n) = \\Theta(n^{\\log_b a} \\log n)$.',
      'Case 3, $f$ polynomially larger (and regular): non-recursive work dominates. The root is heaviest, so $T(n) = \\Theta(f(n))$.',
      { text: 'The summary table (notes, page 4), with the tree picture added:', table: { head: ['case', 'condition', 'result', 'tree', 'interpretation'], rows: [
        ['1', '$f = O(n^{\\log_b a - \\epsilon})$', '$\\Theta(n^{\\log_b a})$', 'leaves heaviest', 'recursion dominates'],
        ['2', '$f = \\Theta(n^{\\log_b a})$', '$\\Theta(n^{\\log_b a} \\log n)$', 'all levels equal', 'balanced growth'],
        ['3', '$f = \\Omega(n^{\\log_b a + \\epsilon})$', '$\\Theta(f(n))$', 'root heaviest', 'non-recursive dominates'],
      ] } },
      'One sentence to remember: the answer is whichever of $f(n)$ and $n^{\\log_b a}$ is polynomially bigger, and if they tie, multiply by $\\log n$.',
    ],
    graph: {
      caption: 'Level cost divided by the root’s cost, for her three examples. Rising ($8T(n/2) + 100n$): the leaves win. Flat ($2T(n/2) + n$): a tie. Falling ($2T(n/2) + n^3$): the root wins.',
      x: [0, 8], logY: true, xLabel: 'level i', yLabel: 'level cost / root (log scale)',
      curves: [
        { label: 'Case 1: $4^i$', f: i => 4 ** i, tone: 'a' },
        { label: 'Case 2: $1$', f: () => 1, tone: 'b' },
        { label: 'Case 3: $(1/4)^i$', f: i => 0.25 ** i, tone: 'c' },
      ],
    },
    answer: 'Case 1: recursion dominates. Case 2: balanced growth. Case 3: non-recursive work dominates.',
    mistake: 'Matching "recursion dominates" to Case 3 because $f$ is "bigger". The recursion is the leaves, $n^{\\log_b a}$ (Case 1); the non-recursive work is $f(n)$ at the root (Case 3).',
    tryIt: { q: 'For $T(n) = 2T(n/2) + \\sqrt{n}$, which part dominates, and what is $T(n)$?', a: '$n^{\\log_2 2} = n$, and $\\sqrt{n} = O(n^{1 - 0.5})$: Case 1. Recursion dominates: $T(n) = \\Theta(n)$.' },
  };

  // ---------------------------------------------------------------- Lecture 6 worked examples

  H['c310-6-master-2T-2'] = {
    asks: 'Use the master theorem on $T(n) = 2T(n/2) + 2$: give $a$, $b$, $n^{\\log_b a}$, the case, and the answer.',
    idea: 'Each call does only constant work, but the number of calls doubles at every level. By the bottom there are $n$ leaves, and they outweigh the constant at the top.',
    tree: tree([
      [['$2$'], '$2$'],
      [['$2$', '$2$'], '$4$'],
      [['$2$', '$2$', '$2$', '$2$'], '$8$'],
      null,
      [LEAVES, '$n \\cdot T(1)$'],
    ], 'Each level costs twice the one above: the bottom is the heaviest part. The $n$ leaves decide the answer.'),
    graph: vs('The flat line $f(n) = 2$ falls further and further below $n$, by a whole factor of $n^1$. That polynomial gap ($\\epsilon = 1$) is Case 1.', [1, 64], [
      ['$f(n) = 2$', () => 2],
      ['$n^{\\log_2 2} = n$', n => n],
    ]),
    steps: [
      'Read off the parts: $a = 2$, $b = 2$, $f(n) = 2$.',
      'Compute $n^{\\log_b a} = n^{\\log_2 2}$. Since $2^1 = 2$, $\\log_2 2 = 1$, so $n^{\\log_b a} = n$.',
      'Compare $f(n) = 2$ (a constant, like $n^0$) with $n^1$. $f$ is smaller by a factor of $n^1$, a polynomial factor, so try Case 1.',
      'Case 1 needs $f(n) = O(n^{\\log_b a - \\epsilon})$. Take $\\epsilon = 1$: $n^{1-1} = n^0 = 1$, and $2 \\le 2 \\cdot 1$, so $2 = O(n^0)$.',
      caseStep('Summary:', [['2', '2', '1', '$2$', '$2 = O(n^{1-1})$, $\\epsilon = 1$', '1']]),
      'Case 1 gives $T(n) = \\Theta(n^{\\log_b a}) = \\Theta(n)$. This matches the iteration method in Lecture 5, which gave exactly $4n - 2$ (with $T(1) = 2$).',
    ],
    answer: '$a = 2$, $b = 2$, $f(n) = 2$, $n^{\\log_2 2} = n$. $f = O(n^{1-\\epsilon})$ with $\\epsilon = 1$, so Case 1: $T(n) = \\Theta(n)$.',
    mistake: 'Calling a constant $f(n)$ Case 2. Case 2 needs $f = \\Theta(n^{\\log_b a})$, here $\\Theta(n)$; a constant $f$ matches only when $a = 1$, as in binary search.',
    tryIt: { q: 'Solve $T(n) = 3T(n/3) + 5$.', a: '$n^{\\log_3 3} = n^1 = n$. $5 = O(n^{1-\\epsilon})$ with $\\epsilon = 1$, so Case 1: $T(n) = \\Theta(n)$.' },
  };

  H['c310-6-master-2n3'] = {
    asks: 'Use the master theorem on $T(n) = T(2n/3) + 1$: give $a$, $b$, $n^{\\log_b a}$, the case, and the answer.',
    idea: 'One call per level, each doing 1 unit of work, while the size keeps shrinking to two thirds. The total is just the number of levels, and shrinking by a constant factor takes logarithmically many levels.',
    tree: tree([
      [['$1$'], '$1$'],
      [['$1$'], '$1$'],
      [['$1$'], '$1$'],
      null,
      [['$T(1)$'], '$\\Theta(1)$'],
    ], 'One node per level, each costing 1. The sizes are $n, \\tfrac{2n}{3}, \\tfrac{4n}{9}, \\dots$, which reach 1 after $\\log_{3/2} n$ levels, so the total is about $\\log_{3/2} n$.'),
    graph: {
      caption: 'The number of levels, $\\log_{3/2} n$, has the same shape as $\\lg n$; it is $\\lg n$ stretched by $1/\\lg 1.5 \\approx 1.71$. Constant factors vanish inside $\\Theta$.',
      x: [1, 1000], xLabel: 'n', yLabel: 'levels',
      curves: [
        { label: '$\\log_{3/2} n$', f: n => Math.log(n) / Math.log(1.5), tone: 'a' },
        { label: '$\\lg n$', f: n => lg(n), tone: 'b' },
      ],
    },
    steps: [
      'Match $T(2n/3)$ to $T(n/b)$: $2n/3 = n/(3/2)$, so $b = 3/2$. There is one recursive call, $a = 1$, and the extra work is $f(n) = 1$.',
      'Compute $n^{\\log_{3/2} 1}$. Any base to the power 0 is 1, so $\\log_{3/2} 1 = 0$ and $n^{\\log_b a} = n^0 = 1$.',
      'Compare $f(n) = 1$ with $n^{\\log_b a} = 1$: the same function. So $f = \\Theta(n^{\\log_b a})$: Case 2.',
      caseStep('Summary:', [['1', '$3/2$', '0', '$1$', '$1 = \\Theta(n^0)$', '2']]),
      'Case 2 gives $T(n) = \\Theta(n^{\\log_b a} \\lg n) = \\Theta(n^0 \\lg n) = \\Theta(\\lg n)$.',
      'Check with the tree: the levels number $\\log_{3/2} n = \\frac{\\lg n}{\\lg 1.5} \\approx 1.71 \\lg n$, each costing 1. Total $\\approx 1.71 \\lg n = \\Theta(\\lg n)$.',
    ],
    answer: '$a = 1$, $b = 3/2$, $f(n) = 1$. $n^{\\log_{3/2} 1} = n^0 = 1$, $f = \\Theta(1) = \\Theta(n^{\\log_b a})$, so Case 2: $T(n) = \\Theta(\\lg n)$.',
    mistake: 'Writing $b = 2/3$. $b$ is what $n$ is divided by, so $b = 3/2$; a $b$ below 1 would make the subproblems grow.',
    tryIt: { q: 'Solve $T(n) = T(3n/4) + 1$.', a: '$3n/4 = n/(4/3)$: $a = 1$, $b = 4/3$, $n^{\\log_{4/3} 1} = n^0 = 1 = \\Theta(f)$. Case 2: $T(n) = \\Theta(\\lg n)$.' },
  };

  H['c310-6-master-b-value'] = {
    asks: 'The master form is $aT(n/b) + f(n)$, and the recurrence contains $T(2n/3)$. What number is $b$?',
    idea: '$b$ is a divisor: the subproblem is the input size DIVIDED by $b$. So rewrite $2n/3$ as "$n$ divided by something" and read off the something.',
    steps: [
      'The template piece is $n/b$. Ask: $n$ divided by what equals $2n/3$?',
      'Dividing by a fraction means multiplying by its flip: $n \\div \\tfrac32 = n \\cdot \\tfrac23 = \\tfrac{2n}{3}$.',
      'So $b = \\tfrac32 = 1.5$, and $b > 1$, as the theorem requires.',
      { text: 'Check with numbers:', table: { head: ['$n$', '$2n/3$', '$n / 1.5$'], rows: [['12', '8', '8'], ['30', '20', '20'], ['81', '54', '54']] } },
      'Why not $\\tfrac23$: then $n/b = n \\div \\tfrac23 = \\tfrac{3n}{2}$, BIGGER than $n$. The recursion would never reach its base case, which is exactly why the theorem demands $b > 1$.',
    ],
    graph: {
      caption: 'Starting from $n = 81$. With $b = 3/2$ the size falls and reaches 1 after about $10.8$ levels. Reading $b$ as $2/3$ makes the size grow forever.',
      x: [0, 11], y: [0.5, 1e4], logY: true, xLabel: 'level i', yLabel: 'size (log scale)',
      curves: [
        { label: '$b = 3/2$: $81 / 1.5^i$', f: i => 81 / 1.5 ** i, tone: 'a' },
        { label: 'wrong $b = 2/3$: $81 \\cdot 1.5^i$', f: i => 81 * 1.5 ** i, tone: 'b' },
      ],
      marks: [{ x: Math.log(81) / Math.log(1.5), label: '$\\log_{1.5} 81 \\approx 10.8$' }],
    },
    answer: '$b = 3/2$, because $2n/3 = n/(3/2)$.',
    mistake: 'Answering $2/3$, the number $n$ is multiplied by. $b$ is the number $n$ is divided by, and it must be bigger than 1.',
    tryIt: { q: 'Write $T(n) = 2T(3n/5) + n$ in master form. What are $a$ and $b$?', a: '$3n/5 = n/(5/3)$, so $a = 2$ and $b = 5/3$.' },
  };

  H['c310-6-master-3T4nlgn'] = {
    asks: 'Use the master theorem on $T(n) = 3T(n/4) + n \\lg n$, including the regularity check.',
    idea: 'The leaf count is $n^{0.79}$, and $f = n \\lg n$ is more than $n^1$: bigger by at least $n^{0.2}$, a real polynomial gap. So the root should win (Case 3), but Case 3 also demands proof that the levels shrink.',
    tree: tree([
      [['$n \\lg n$'], '$n \\lg n$'],
      [['$\\tfrac{n}{4}\\lg\\tfrac{n}{4}$', '$\\tfrac{n}{4}\\lg\\tfrac{n}{4}$', '$\\tfrac{n}{4}\\lg\\tfrac{n}{4}$'], '$\\tfrac34 n \\lg\\tfrac{n}{4}$'],
      [['$\\tfrac{n}{16}\\lg\\tfrac{n}{16}$', '$\\tfrac{n}{16}\\lg\\tfrac{n}{16}$', '$\\cdots$', '$\\tfrac{n}{16}\\lg\\tfrac{n}{16}$'], '$\\tfrac{9}{16} n \\lg\\tfrac{n}{16}$'],
      null,
      [LEAVES, '$\\Theta(n^{0.79})$'],
    ], 'Each level costs at most $\\tfrac34$ of the level above (that is the regularity condition), so the root’s $n \\lg n$ dominates.'),
    graph: vs('$f(n) = n \\lg n$ stays above even the raised curve $n^{0.793 + 0.2}$, so it beats $n^{\\log_4 3}$ by a polynomial factor: $\\epsilon \\approx 0.2$.', [2, 1024], [
      ['$f(n) = n \\lg n$', n => n * lg(n)],
      ['$n^{\\log_4 3 + 0.2} \\approx n^{0.993}$', n => n ** (Math.log(3) / Math.log(4) + 0.2)],
      ['$n^{\\log_4 3} \\approx n^{0.793}$', n => n ** (Math.log(3) / Math.log(4))],
    ]),
    steps: [
      'Read off: $a = 3$, $b = 4$, $f(n) = n \\lg n$.',
      '$\\log_4 3$: solve $4^x = 3$, so $x = \\frac{\\ln 3}{\\ln 4} \\approx 0.7925$. (Sanity: $4^{0.5} = 2 < 3 < 4 = 4^1$.) So $n^{\\log_4 3} \\approx n^{0.793}$.',
      'Compare: $n \\lg n \\ge n = n^{0.793 + 0.207}$ for $n \\ge 2$. So $f = \\Omega(n^{\\log_4 3 + \\epsilon})$ with $\\epsilon \\approx 0.2$: the first Case 3 condition holds.',
      'Regularity: $a f(n/b) = 3 \\cdot \\tfrac{n}{4} \\lg\\tfrac{n}{4} = \\tfrac{3n}{4}(\\lg n - 2)$. Since $\\lg n - 2 < \\lg n$, this is at most $\\tfrac34 n \\lg n = \\tfrac34 f(n)$, so $c = \\tfrac34 < 1$.',
      caseStep('Summary:', [['3', '4', '$\\approx 0.793$', '$n \\lg n$', 'bigger by $\\ge n^{0.2}$; $c = \\tfrac34$', '3']]),
      'Case 3: $T(n) = \\Theta(f(n)) = \\Theta(n \\lg n)$.',
    ],
    answer: '$a = 3$, $b = 4$, $n^{\\log_4 3} \\approx n^{0.793}$. $f = n \\lg n = \\Omega(n^{0.793 + \\epsilon})$ with $\\epsilon \\approx 0.2$; regularity holds with $c = \\tfrac34$. Case 3: $T(n) = \\Theta(n \\lg n)$.',
    mistake: 'Stopping after the $\\epsilon$ check. Case 3 has two conditions, and slide 11 checks both; without regularity the answer is not justified.',
    tryIt: { q: 'Solve $T(n) = 2T(n/4) + n \\lg n$, with the regularity check.', a: '$\\log_4 2 = \\tfrac12$. $n \\lg n \\ge n = n^{0.5 + 0.5}$, so $\\epsilon = 0.5$. Regularity: $2 \\cdot \\tfrac{n}{4}\\lg\\tfrac{n}{4} = \\tfrac{n}{2}(\\lg n - 2) \\le \\tfrac12 n \\lg n$, $c = \\tfrac12$. Case 3: $\\Theta(n \\lg n)$.' },
  };

  H['c310-6-master-reg-c'] = {
    asks: 'For $T(n) = 3T(n/4) + n \\lg n$, find the constant $c$ in the regularity condition $a f(n/b) \\le c f(n)$ that the lecture uses.',
    idea: '$a f(n/b)$ is the cost of the whole first level of the tree. Work it out, then see what fraction of the root’s $n \\lg n$ it can be at most.',
    steps: [
      'Plug in $a = 3$, $b = 4$, $f(m) = m \\lg m$ with $m = n/4$: $f(n/4) = \\tfrac{n}{4} \\lg\\tfrac{n}{4}$, so $a f(n/b) = \\tfrac{3n}{4} \\lg\\tfrac{n}{4}$.',
      'Simplify the log: $\\lg\\tfrac{n}{4} = \\lg n - \\lg 4 = \\lg n - 2$, which is less than $\\lg n$.',
      'So $\\tfrac{3n}{4}\\lg\\tfrac{n}{4} \\le \\tfrac{3n}{4}\\lg n = \\tfrac34 (n \\lg n) = \\tfrac34 f(n)$. That is the condition with $c = \\tfrac34$.',
      { text: 'Check with numbers:', table: { head: ['$n$', '$3 f(n/4)$', '$\\tfrac34 f(n)$', 'holds?'], rows: [
        ['16', '$3 \\cdot 4 \\cdot 2 = 24$', '$\\tfrac34 \\cdot 64 = 48$', 'yes'],
        ['64', '$3 \\cdot 16 \\cdot 4 = 192$', '$\\tfrac34 \\cdot 384 = 288$', 'yes'],
        ['1024', '$3 \\cdot 256 \\cdot 8 = 6144$', '$\\tfrac34 \\cdot 10240 = 7680$', 'yes'],
      ] } },
      'Meaning: level 1 costs at most $\\tfrac34$ of the root, level 2 at most $(\\tfrac34)^2$, and so on, so all the levels together cost at most $\\frac{1}{1 - 3/4} = 4$ times the root.',
    ],
    graph: {
      caption: 'The ratio $3 f(n/4) / f(n) = \\tfrac34 \\cdot \\frac{\\lg n - 2}{\\lg n}$ creeps toward $\\tfrac34$ but never reaches it. So $c = \\tfrac34$ works for every $n$.',
      x: [2, 40], y: [0, 1], xLabel: 'lg n', yLabel: 'level 1 / root',
      curves: [
        { label: '$3 f(n/4) / f(n)$', f: k => 0.75 * (k - 2) / k, tone: 'a' },
        { label: '$c = \\tfrac34$', f: () => 0.75, tone: 'c' },
      ],
    },
    answer: '$c = \\tfrac34$: $3 \\cdot \\tfrac{n}{4} \\cdot \\lg\\tfrac{n}{4} \\le 3 \\cdot \\tfrac{n}{4} \\cdot \\lg n = \\tfrac34 n \\lg n$.',
    mistake: 'Replacing $n$ by $n/4$ in the $n$ but leaving $\\lg n$ unchanged, or forgetting to multiply by $a = 3$. Substitute $n/4$ everywhere $n$ appears in $f$, then multiply by $a$.',
    tryIt: { q: 'For $T(n) = 2T(n/4) + n^2$, find $c$ in $a f(n/b) \\le c f(n)$.', a: '$2 (n/4)^2 = \\frac{2n^2}{16} = \\tfrac18 n^2$, so $c = \\tfrac18$.' },
  };

  H['c310-6-master-gap-nlgn'] = {
    asks: 'For $T(n) = 2T(n/2) + n \\lg n$, $f$ is bigger than $n^{\\log_2 2} = n$. Explain why Case 3 still does not apply.',
    idea: 'Case 3 needs $f$ bigger by a POWER of $n$, some $n^\\epsilon$. Here the whole difference is a factor $\\lg n$, and a log loses to every power of $n$ in the long run, even $n^{0.1}$. So the recurrence falls between the cases.',
    tree: tree([
      [['$n \\lg n$'], '$n \\lg n$'],
      [['$\\tfrac{n}{2}\\lg\\tfrac{n}{2}$', '$\\tfrac{n}{2}\\lg\\tfrac{n}{2}$'], '$n(\\lg n - 1)$'],
      [['$\\tfrac{n}{4}\\lg\\tfrac{n}{4}$', '$\\tfrac{n}{4}\\lg\\tfrac{n}{4}$', '$\\tfrac{n}{4}\\lg\\tfrac{n}{4}$', '$\\tfrac{n}{4}\\lg\\tfrac{n}{4}$'], '$n(\\lg n - 2)$'],
      null,
      [LEAVES, '$\\Theta(n)$'],
    ], 'Level $i$ costs $n(\\lg n - i)$: each level is only $n$ less than the one above, not a fixed fraction of it. No level dominates; the sum is about $\\tfrac12 n \\lg^2 n$.'),
    graph: {
      caption: 'The x-axis is $\\lg n$, so $x = 60$ means $n = 2^{60}$. The ratio $f/n = \\lg n$ is a straight line; $n^{0.2}$ passes it near $n = 2^{22}$ and $n^{0.1}$ near $n = 2^{59}$, and both stay ahead. Every $n^\\epsilon$ does, so no $\\epsilon$ works.',
      x: [1, 100], y: [0.5, 2e6], logY: true, xLabel: 'lg n', yLabel: 'value (log scale)',
      curves: [
        { label: 'ratio $f/n = \\lg n$', f: k => k, tone: 'a' },
        { label: '$n^{0.1}$', f: k => 2 ** (0.1 * k), tone: 'b' },
        { label: '$n^{0.2}$', f: k => 2 ** (0.2 * k), tone: 'c' },
      ],
      marks: [{ x: 22.44, label: '$2^{22.4}$' }, { x: 58.77, label: '$2^{58.8}$' }],
    },
    steps: [
      'Read off: $a = 2$, $b = 2$, $f(n) = n \\lg n$, and $n^{\\log_2 2} = n$.',
      'Case 3 needs $f = \\Omega(n^{1+\\epsilon})$: the ratio $f(n)/n^{\\log_b a}$ must be at least $n^\\epsilon$ for some fixed $\\epsilon > 0$. Here the ratio is $\\frac{n \\lg n}{n} = \\lg n$.',
      '$\\lg n$ grows more slowly than $n^\\epsilon$ for EVERY $\\epsilon > 0$ (see the graph: even $n^{0.1}$ overtakes it for good). So no $\\epsilon$ exists and Case 3 fails.',
      'Case 2 fails because $n \\lg n$ is not $\\Theta(n)$, and Case 1 fails because $f$ is bigger, not smaller. The recurrence is in the gap between Case 2 and Case 3.',
      'Regularity fails too: $2 f(n/2) = n(\\lg n - 1)$, and $\\frac{n(\\lg n - 1)}{n \\lg n} = 1 - \\frac{1}{\\lg n}$ climbs toward 1, so no fixed $c < 1$ works. (Slide 12 lists this inequality as a step, but the $\\epsilon$ step is the one it uses to rule out Case 3.)',
      'With the tree instead: level $i$ costs $n(\\lg n - i)$, and the sum is $n(\\lg n + (\\lg n - 1) + \\dots + 1) = \\frac{n \\lg n (\\lg n + 1)}{2}$, so $T(n) = \\Theta(n \\lg^2 n)$.',
    ],
    answer: 'Case 3 needs $f/n^{\\log_b a} \\ge n^\\epsilon$ for some $\\epsilon > 0$, but here the ratio is $\\frac{n \\lg n}{n} = \\lg n$, which is asymptotically less than $n^\\epsilon$ for every $\\epsilon > 0$. It falls into the gap between Cases 2 and 3 (true answer $\\Theta(n \\lg^2 n)$).',
    mistake: '"$f$ is bigger than $n^{\\log_b a}$, so Case 3." Bigger is not enough; it must be bigger by a power of $n$, and a log factor is not one.',
    tryIt: { q: 'Can the master theorem solve $T(n) = 4T(n/2) + n^2 \\lg n$?', a: 'No. $n^{\\log_2 4} = n^2$ and the ratio $\\frac{n^2 \\lg n}{n^2} = \\lg n$ is not $\\Omega(n^\\epsilon)$: gap between Cases 2 and 3. (A tree gives level costs $n^2(\\lg n - i)$, so $\\Theta(n^2 \\lg^2 n)$.)' },
  };

  // ---------------------------------------------------------------- notes' worked examples

  H['c310-master-ex-8T'] = {
    asks: 'Solve $T(n) = 8T(n/2) + 100n$ with the master theorem.',
    idea: 'Eight calls on halves: the number of nodes multiplies by 8 per level while each node’s size only halves. The leaves pile up to $n^3$, far more than the top’s $100n$, whatever the 100 is.',
    tree: tree([
      [['$100n$'], '$100n$'],
      [['$50n$', '$50n$', '$\\cdots$', '$50n$'], '$8 \\cdot 50n = 400n$'],
      [['$25n$', '$25n$', '$\\cdots$', '$25n$'], '$64 \\cdot 25n = 1600n$'],
      null,
      [LEAVES, '$n^3 \\cdot T(1)$'],
    ], 'Each level costs 4 times the one above, so the bottom dominates: Case 1.'),
    graph: vs('$100n$ is bigger only while $n < 10$. After that, $n^3$ pulls away by the factor $n^2/100$, which keeps growing. $\\Theta$ only cares about large $n$.', [1, 100], [
      ['$f(n) = 100n$', n => 100 * n],
      ['$n^{\\log_2 8} = n^3$', n => n ** 3],
    ], { marks: [{ x: 10, label: '$n = 10$' }], from: 10 }),
    steps: [
      'Read off: $a = 8$, $b = 2$, $f(n) = 100n$.',
      '$\\log_2 8 = 3$, because $2^3 = 8$. So $n^{\\log_b a} = n^3$.',
      'Compare $100n$ with $n^3$. Constants do not change growth, so compare $n^1$ with $n^3$: $f$ is smaller by a factor $n^2$.',
      'Case 1 needs $100n = O(n^{3 - \\epsilon})$. Take $\\epsilon = 2$: $n^{3-2} = n$, and $100n \\le 100 \\cdot n$.',
      caseStep('Summary:', [['8', '2', '3', '$100n$', 'smaller by $n^2$, $\\epsilon = 2$', '1']]),
      'Case 1: $T(n) = \\Theta(n^{\\log_b a}) = \\Theta(n^3)$.',
    ],
    answer: '$\\Theta(n^3)$: $n^{\\log_2 8} = n^3$ and $100n = O(n^{3-2})$, so Case 1.',
    mistake: 'Letting the 100 make $f$ look large. Constants never decide the case; only the exponent of $n$ does.',
    tryIt: { q: 'Solve $T(n) = 8T(n/2) + 50n^2$.', a: '$n^{\\log_2 8} = n^3$; $50n^2 = O(n^{3-1})$, $\\epsilon = 1$. Case 1: $\\Theta(n^3)$.' },
  };

  H['c310-master-ex-2Tn'] = {
    asks: 'Solve $T(n) = 2T(n/2) + n$ (merge sort) with the master theorem.',
    idea: 'Two halves, and linear work to merge. At every level the pieces add back up to $n$, so every level costs the same $n$. Equal levels is Case 2, and the answer is one level times the number of levels.',
    tree: tree([
      [['$n$'], '$n$'],
      [['$\\tfrac{n}{2}$', '$\\tfrac{n}{2}$'], '$n$'],
      [['$\\tfrac{n}{4}$', '$\\tfrac{n}{4}$', '$\\tfrac{n}{4}$', '$\\tfrac{n}{4}$'], '$n$'],
      null,
      [LEAVES, '$n \\cdot T(1)$'],
    ], 'Every level costs $n$; there are $\\lg n$ levels of merging plus the leaf level.'),
    steps: [
      'Read off: $a = 2$, $b = 2$, $f(n) = n$.',
      '$\\log_2 2 = 1$, so $n^{\\log_b a} = n^1 = n$.',
      'Compare: $f(n) = n$ and $n^{\\log_b a} = n$ are the same, so $f = \\Theta(n^{\\log_b a})$: Case 2.',
      caseStep('Summary:', [['2', '2', '1', '$n$', 'equal', '2']]),
      'Case 2: $T(n) = \\Theta(n^{\\log_b a} \\log n) = \\Theta(n \\log n)$.',
      'Tree check: $\\lg n$ levels of merging at $n$ each, plus $n$ leaves. With $T(1) = 1$ that is exactly $n \\lg n + n$.',
    ],
    answer: '$\\Theta(n \\log n)$: $n^{\\log_2 2} = n = \\Theta(f)$, Case 2.',
    mistake: 'Answering $\\Theta(n)$ because "$f$ and $n^{\\log_b a}$ are both $n$". A tie is Case 2, which multiplies by $\\log n$.',
    tryIt: { q: 'Solve $T(n) = 3T(n/3) + n$.', a: '$n^{\\log_3 3} = n = \\Theta(f)$: Case 2, $T(n) = \\Theta(n \\log n)$.' },
  };

  H['c310-master-ex-2Tn3'] = {
    asks: 'Solve $T(n) = 2T(n/2) + n^3$ with the master theorem, showing $\\epsilon$ and the regularity check.',
    idea: 'Halving the size cuts the cube by 8 but there are only 2 children, so each level costs a quarter of the level above. The root’s $n^3$ is most of the whole tree.',
    tree: tree([
      [['$n^3$'], '$n^3$'],
      [['$\\tfrac{n^3}{8}$', '$\\tfrac{n^3}{8}$'], '$\\tfrac{n^3}{4}$'],
      [['$\\tfrac{n^3}{64}$', '$\\tfrac{n^3}{64}$', '$\\tfrac{n^3}{64}$', '$\\tfrac{n^3}{64}$'], '$\\tfrac{n^3}{16}$'],
      null,
      [LEAVES, '$\\Theta(n)$'],
    ], 'Level costs fall by a factor 4 each time; the root dominates: Case 3.'),
    graph: vs('$n^3$ rises far above $n^{\\log_2 2} = n$, even above $n^{1+2} = n^3$ itself: $\\epsilon = 2$.', [1, 50], [
      ['$f(n) = n^3$', n => n ** 3],
      ['$n^{\\log_2 2} = n$', n => n],
    ]),
    steps: [
      'Read off: $a = 2$, $b = 2$, $f(n) = n^3$; $n^{\\log_2 2} = n$.',
      'Compare: $n^3$ against $n^1$, bigger by $n^2$. So $f = \\Omega(n^{1+\\epsilon})$ with $\\epsilon = 2$.',
      'Regularity: $a f(n/b) = 2 (n/2)^3 = 2 \\cdot \\frac{n^3}{8} = \\frac{n^3}{4}$. That is $\\tfrac14 f(n)$, so $c = \\tfrac14 < 1$.',
      caseStep('Summary:', [['2', '2', '1', '$n^3$', 'bigger by $n^2$; $c = \\tfrac14$', '3']]),
      'Case 3: $T(n) = \\Theta(f(n)) = \\Theta(n^3)$.',
    ],
    answer: '$n^{\\log_2 2} = n$; $n^3 = \\Omega(n^{1+\\epsilon})$ with $\\epsilon = 2$; regularity $2(n/2)^3 = \\tfrac14 n^3$, $c = \\tfrac14$. Case 3: $\\Theta(n^3)$.',
    mistake: 'Forgetting the factor $a$ in the regularity check and writing $(n/2)^3 = \\tfrac18 n^3$. The condition is $a f(n/b)$: here $2 \\cdot \\tfrac18 = \\tfrac14$.',
    tryIt: { q: 'Solve $T(n) = 3T(n/3) + n^2$, showing $\\epsilon$ and regularity.', a: '$n^{\\log_3 3} = n$; $n^2 = \\Omega(n^{1+1})$, $\\epsilon = 1$. Regularity: $3(n/3)^2 = \\tfrac13 n^2$, $c = \\tfrac13$. Case 3: $\\Theta(n^2)$.' },
  };

  // ---------------------------------------------------------------- the gaps

  H['c310-master-gaps'] = {
    asks: 'Describe the two "gaps" where none of the three master-theorem cases applies.',
    idea: 'The cases only handle POLYNOMIAL differences: $f$ smaller by $n^\\epsilon$, equal, or bigger by $n^\\epsilon$. If $f$ differs from $n^{\\log_b a}$ by something smaller than every power of $n$, like a log, it falls between two cases.',
    steps: [
      'Measure everything with the ratio $f(n) / n^{\\log_b a}$. Case 1 needs it below some $n^{-\\epsilon}$, Case 2 needs it between two constants, Case 3 needs it above some $n^\\epsilon$.',
      'Gap between Cases 1 and 2: $f$ is smaller, but the ratio shrinks more slowly than every $n^{-\\epsilon}$. (The notes’ bullet says "slower by more than any polynomial factor"; it should say by LESS than every polynomial factor, such as a log.)',
      'Gap between Cases 2 and 3: $f$ is bigger, but the ratio grows more slowly than every $n^\\epsilon$. Standard example: $2T(n/2) + n \\lg n$, ratio $\\lg n$.',
      { text: 'Compute the ratio before deciding:', table: { head: ['recurrence', 'ratio $f/n^{\\log_b a}$', 'verdict', 'true answer'], rows: [
        ['$2T(n/2) + n/\\lg n$', '$1/\\lg n$', 'gap 1–2', '$\\Theta(n \\lg\\lg n)$'],
        ['$2T(n/2) + n \\lg n$', '$\\lg n$', 'gap 2–3', '$\\Theta(n \\lg^2 n)$'],
        ['$2T(n/2) + n^2/\\lg n$', '$n/\\lg n \\ge n^{0.5}$', 'Case 3', '$\\Theta(n^2/\\lg n)$'],
      ] } },
      'The last row is the notes’ "gap" example (page 3), but it is not a gap: $n/\\lg n \\ge n^{0.5}$ for $n \\ge 16$, so Case 3 applies. A log makes a gap only when it is the WHOLE difference.',
      'In a real gap, use another method: a recursion tree, substitution, or an extended master theorem.',
    ],
    graph: {
      caption: 'x-axis is $\\lg n$. A ratio of $\\lg n$ falls back under the line $n^{0.1}$ near $n = 2^{59}$, and a ratio of $1/\\lg n$ climbs back over $n^{-0.1}$ at the same point. Log ratios eventually lose to every such line, so neither Case 1 nor Case 3 holds.',
      x: [1, 100], y: [5e-4, 2e3], logY: true, xLabel: 'lg n', yLabel: 'ratio (log scale)',
      curves: [
        { label: '$\\lg n$ (gap 2–3)', f: k => k, tone: 'a' },
        { label: '$n^{0.1}$', f: k => 2 ** (0.1 * k), tone: 'b' },
        { label: '$1/\\lg n$ (gap 1–2)', f: k => 1 / k, tone: 'c' },
        { label: '$n^{-0.1}$', f: k => 2 ** (-0.1 * k), tone: 'd' },
      ],
      marks: [{ x: 58.77, label: '$2^{58.8}$' }],
    },
    answer: 'Between Cases 1 and 2: $f$ is smaller than $n^{\\log_b a}$ but not polynomially smaller (only by a log factor, say). Between Cases 2 and 3: $f$ is larger but not polynomially larger. Then use other techniques (substitution, an extended master theorem).',
    mistake: 'Calling every $f$ with a log in it a gap. Divide by $n^{\\log_b a}$ first: if a power of $n$ is left over (like $n/\\lg n$), that power supplies the $\\epsilon$.',
    tryIt: { q: 'Classify (i) $4T(n/2) + n^2/\\lg n$ and (ii) $4T(n/2) + n/\\lg n$.', a: '(i) Ratio $\\frac{n^2/\\lg n}{n^2} = \\frac{1}{\\lg n}$: gap between Cases 1 and 2. (ii) Ratio $\\frac{1}{n \\lg n} \\le n^{-1}$: Case 1 with $\\epsilon = 1$, so $\\Theta(n^2)$.' },
  };

  H['c310-master-notes-gap-check'] = {
    asks: 'Does the master theorem apply to $T(n) = 2T(n/2) + n^2/\\lg n$? Argue it, even though the notes call this a gap example.',
    idea: 'Divide $f$ by $n^{\\log_b a} = n$ and look at what is left: $n/\\lg n$. That is still almost a whole $n$; the log only takes a little off. A leftover power of $n$ means a polynomial gap, so Case 3 works.',
    tree: tree([
      [['$\\frac{n^2}{\\lg n}$'], '$\\frac{n^2}{\\lg n}$'],
      [['$\\frac{n^2}{4(\\lg n - 1)}$', '$\\frac{n^2}{4(\\lg n - 1)}$'], '$\\frac{n^2}{2(\\lg n - 1)}$'],
      [['$\\frac{n^2}{16(\\lg n - 2)}$', '$\\cdots$', '$\\frac{n^2}{16(\\lg n - 2)}$'], '$\\frac{n^2}{4(\\lg n - 2)}$'],
      null,
      [LEAVES, '$\\Theta(n)$'],
    ], 'Each level costs roughly half the one above (the log terms barely change), so the root dominates.'),
    graph: vs('The ratio $f/n = n/\\lg n$ meets $n^{0.5}$ at $n = 16$ (both equal 4) and stays above it from then on. That is $\\epsilon = 0.5$.', [2, 400], [
      ['ratio $n/\\lg n$', n => n / lg(n)],
      ['$n^{0.5}$', n => Math.sqrt(n)],
    ], { yLabel: 'ratio (log scale)', marks: [{ x: 16, label: '$n = 16$' }], from: 16 }),
    steps: [
      'Read off: $a = 2$, $b = 2$, $f(n) = n^2/\\lg n$, and $n^{\\log_2 2} = n$.',
      'Ratio: $\\frac{f(n)}{n} = \\frac{n^2/\\lg n}{n} = \\frac{n}{\\lg n}$. Unlike the gap examples, this is not just a log: it is $n$ divided by a log.',
      'Try $\\epsilon = 0.5$: $\\frac{n}{\\lg n} \\ge n^{0.5}$ is the same as $n^{0.5} \\ge \\lg n$, true for all $n \\ge 16$. So $f = \\Omega(n^{1 + 0.5})$.',
      'Regularity: $2 f(n/2) = 2 \\cdot \\frac{(n/2)^2}{\\lg(n/2)} = \\frac{n^2/2}{\\lg n - 1}$. Try $c = \\tfrac34$.',
      '$\\frac{n^2/2}{\\lg n - 1} \\le \\frac34 \\cdot \\frac{n^2}{\\lg n}$ simplifies to $2 \\lg n \\le 3(\\lg n - 1)$, that is $\\lg n \\ge 3$, true for $n \\ge 8$. Regularity holds.',
      'Case 3: $T(n) = \\Theta(n^2/\\lg n)$. The notes (page 3) say $n^2/\\log n$ is "not polynomially larger" than $n$; that is a mistake, worth raising with the instructor.',
    ],
    answer: 'Yes, Case 3. $f/n = n/\\lg n \\ge n^{0.5}$ for $n \\ge 16$, so $\\epsilon = 0.5$; regularity holds with $c = \\tfrac34$ for $n \\ge 8$. $T(n) = \\Theta(n^2/\\lg n)$.',
    mistake: 'Trusting that any log in $f$ means a gap. Divide by $n^{\\log_b a}$ first; here a whole factor of $n$ survives, and that alone supplies the $\\epsilon$.',
    tryIt: { q: 'Does the master theorem apply to $T(n) = 2T(n/2) + n^3/\\lg n$?', a: 'Yes. Ratio $\\frac{n^3/\\lg n}{n} = \\frac{n^2}{\\lg n} \\ge n$ for $n \\ge 2$, so $\\epsilon = 1$. Regularity: $2\\frac{(n/2)^3}{\\lg n - 1} = \\frac{n^3/4}{\\lg n - 1} \\le \\tfrac12 \\cdot \\frac{n^3}{\\lg n}$ when $\\lg n \\ge 2$. Case 3: $\\Theta(n^3/\\lg n)$.' },
  };

  H['c310-master-gap12'] = {
    asks: 'Can the master theorem solve $T(n) = 2T(n/2) + n/\\lg n$? Argue it.',
    idea: '$f = n/\\lg n$ is a little smaller than the leaf count $n$, but only by a log. Case 1 needs it smaller by a power of $n$, and Case 2 needs them equal, so it slips into the gap between them.',
    tree: tree([
      [['$\\frac{n}{\\lg n}$'], '$\\frac{n}{\\lg n}$'],
      [['$\\frac{n/2}{\\lg n - 1}$', '$\\frac{n/2}{\\lg n - 1}$'], '$\\frac{n}{\\lg n - 1}$'],
      [['$\\frac{n/4}{\\lg n - 2}$', '$\\cdots$', '$\\frac{n/4}{\\lg n - 2}$'], '$\\frac{n}{\\lg n - 2}$'],
      null,
      [LEAVES, '$\\Theta(n)$'],
    ], 'Level $i$ costs $\\frac{n}{\\lg n - i}$: the levels GROW slowly toward the bottom, but not geometrically. Adding them gives $n(\\tfrac{1}{\\lg n} + \\dots + \\tfrac11) \\approx n \\ln\\lg n$.'),
    graph: {
      caption: 'x-axis is $\\lg n$. Case 1 needs the ratio $f/n = 1/\\lg n$ to stay below some $n^{-\\epsilon}$. It crosses back above $n^{-0.1}$ near $n = 2^{59}$ (and above $n^{-0.2}$ near $2^{22}$), and every $n^{-\\epsilon}$ line suffers the same fate.',
      x: [1, 100], y: [5e-7, 2], logY: true, xLabel: 'lg n', yLabel: 'ratio (log scale)',
      curves: [
        { label: 'ratio $1/\\lg n$', f: k => 1 / k, tone: 'a' },
        { label: '$n^{-0.1}$', f: k => 2 ** (-0.1 * k), tone: 'b' },
        { label: '$n^{-0.2}$', f: k => 2 ** (-0.2 * k), tone: 'c' },
      ],
      marks: [{ x: 22.44, label: '$2^{22.4}$' }, { x: 58.77, label: '$2^{58.8}$' }],
    },
    steps: [
      'Read off: $a = 2$, $b = 2$, $f(n) = n/\\lg n$, and $n^{\\log_2 2} = n$.',
      'Ratio: $\\frac{f(n)}{n} = \\frac{1}{\\lg n}$. So $f$ is smaller than $n$, by a factor of $\\lg n$.',
      'Case 1 needs the ratio at most $n^{-\\epsilon}$, that is, $\\lg n \\ge n^\\epsilon$. But $\\lg n$ is eventually smaller than every $n^\\epsilon$, so Case 1 fails.',
      'Case 2 fails: $n/\\lg n$ is not $\\Theta(n)$, because the ratio $1/\\lg n$ goes to 0. Case 3 fails: $f$ is smaller, not bigger.',
      'No case applies: this is the gap between Cases 1 and 2. A recursion tree gives the true answer, $\\Theta(n \\lg\\lg n)$ (level sums $n/(\\lg n - i)$ add up to $n$ times a harmonic sum).',
    ],
    answer: 'No. $n^{\\log_2 2} = n$ and $f = n/\\lg n$ is smaller only by a factor $\\lg n$, not by $n^\\epsilon$ for any $\\epsilon > 0$. Cases 1, 2 and 3 all fail: it is in the gap between Cases 1 and 2.',
    mistake: 'Calling it Case 1 because $f$ is smaller. Case 1 needs smaller by a power of $n$; a log factor is not one.',
    tryIt: { q: 'Can the master theorem solve $T(n) = 4T(n/4) + n/\\lg n$?', a: 'No. $n^{\\log_4 4} = n$ and the ratio is $1/\\lg n$, smaller only by a log: gap between Cases 1 and 2.' },
  };

  // ---------------------------------------------------------------- practice recurrences

  H['c310-master-4T-n'] = {
    asks: 'Solve $T(n) = 4T(n/2) + n$ with the master theorem.',
    idea: 'Four calls on halves: the node count quadruples per level while sizes only halve, so each level doubles. The $n^2$ leaves outweigh the top’s $n$.',
    tree: tree([
      [['$n$'], '$n$'],
      [['$\\tfrac{n}{2}$', '$\\tfrac{n}{2}$', '$\\tfrac{n}{2}$', '$\\tfrac{n}{2}$'], '$2n$'],
      [['$\\tfrac{n}{4}$', '$\\tfrac{n}{4}$', '$\\cdots$', '$\\tfrac{n}{4}$'], '$4n$'],
      null,
      [LEAVES, '$n^2 \\cdot T(1)$'],
    ], 'Level costs double each time: bottom-heavy, Case 1.'),
    graph: vs('$f(n) = n$ falls further below $n^2$ by the factor $n$: a polynomial gap, $\\epsilon = 1$.', [1, 100], [
      ['$f(n) = n$', n => n],
      ['$n^{\\log_2 4} = n^2$', n => n * n],
    ]),
    steps: [
      'Read off: $a = 4$, $b = 2$, $f(n) = n$.',
      '$\\log_2 4 = 2$, because $2^2 = 4$. So $n^{\\log_b a} = n^2$.',
      'Compare $n$ with $n^2$: $f$ is smaller by $n^1$. So $n = O(n^{2-\\epsilon})$ with $\\epsilon = 1$.',
      caseStep('Summary:', [['4', '2', '2', '$n$', 'smaller by $n$, $\\epsilon = 1$', '1']]),
      'Case 1: $T(n) = \\Theta(n^2)$.',
    ],
    answer: '$\\Theta(n^2)$: $n^{\\log_2 4} = n^2$ and $n = O(n^{2-1})$, Case 1.',
    mistake: 'Using $a/b = 2$ in place of $\\log_b a$: it matches here by luck, but for $8T(n/2)$ it gives 4 instead of 3. $\\log_2 4$ asks "2 to what power gives 4?"',
    tryIt: { q: 'Solve $T(n) = 4T(n/2) + \\sqrt{n}$.', a: '$n^{\\log_2 4} = n^2$; $\\sqrt{n} = O(n^{2 - 1.5})$, $\\epsilon = 1.5$. Case 1: $\\Theta(n^2)$.' },
  };

  H['c310-master-4T-n2'] = {
    asks: 'Solve $T(n) = 4T(n/2) + n^2$ with the master theorem.',
    idea: 'Four children, each half the size: $(n/2)^2 = n^2/4$ each, times 4 is $n^2$ again. Every level costs exactly the same, which is Case 2.',
    tree: tree([
      [['$n^2$'], '$n^2$'],
      [['$\\tfrac{n^2}{4}$', '$\\tfrac{n^2}{4}$', '$\\tfrac{n^2}{4}$', '$\\tfrac{n^2}{4}$'], '$n^2$'],
      [['$\\tfrac{n^2}{16}$', '$\\tfrac{n^2}{16}$', '$\\cdots$', '$\\tfrac{n^2}{16}$'], '$16 \\cdot \\tfrac{n^2}{16} = n^2$'],
      null,
      [LEAVES, '$n^2 \\cdot T(1)$'],
    ], 'Every level costs $n^2$, and there are $\\lg n + 1$ levels.'),
    steps: [
      'Read off: $a = 4$, $b = 2$, $f(n) = n^2$.',
      '$\\log_2 4 = 2$, so $n^{\\log_b a} = n^2$.',
      'Compare: $f(n) = n^2 = \\Theta(n^2)$, a tie. Case 2.',
      caseStep('Summary:', [['4', '2', '2', '$n^2$', 'equal', '2']]),
      'Case 2: $T(n) = \\Theta(n^{\\log_b a} \\log n) = \\Theta(n^2 \\log n)$.',
    ],
    answer: '$\\Theta(n^2 \\log n)$: $n^{\\log_2 4} = n^2 = \\Theta(f)$, Case 2.',
    mistake: 'Answering $\\Theta(n^2)$. In a tie, all $\\lg n + 1$ levels cost $n^2$, so the log factor is real.',
    tryIt: { q: 'Solve $T(n) = 16T(n/4) + n^2$.', a: '$4^2 = 16$, so $n^{\\log_4 16} = n^2 = \\Theta(f)$. Case 2: $\\Theta(n^2 \\log n)$.' },
  };

  H['c310-master-4T-n3'] = {
    asks: 'Solve $T(n) = 4T(n/2) + n^3$ with the master theorem.',
    idea: 'Halving the size cuts a cube by 8, and there are only 4 children, so level 1 costs half the root. Shrinking levels mean the root wins: Case 3.',
    tree: tree([
      [['$n^3$'], '$n^3$'],
      [['$\\tfrac{n^3}{8}$', '$\\tfrac{n^3}{8}$', '$\\tfrac{n^3}{8}$', '$\\tfrac{n^3}{8}$'], '$\\tfrac{n^3}{2}$'],
      [['$\\tfrac{n^3}{64}$', '$\\tfrac{n^3}{64}$', '$\\cdots$', '$\\tfrac{n^3}{64}$'], '$\\tfrac{n^3}{4}$'],
      null,
      [LEAVES, '$\\Theta(n^2)$'],
    ], 'Each level costs half the one above, so everything above the leaves is at most $2n^3$.'),
    graph: vs('$n^3$ beats $n^2$ by the factor $n$: a polynomial gap, $\\epsilon = 1$.', [1, 100], [
      ['$f(n) = n^3$', n => n ** 3],
      ['$n^{\\log_2 4} = n^2$', n => n * n],
    ]),
    steps: [
      'Read off: $a = 4$, $b = 2$, $f(n) = n^3$; $n^{\\log_2 4} = n^2$.',
      'Compare: $n^3$ is bigger than $n^2$ by $n^1$, so $f = \\Omega(n^{2+\\epsilon})$ with $\\epsilon = 1$.',
      'Regularity: $4 (n/2)^3 = 4 \\cdot \\frac{n^3}{8} = \\frac{n^3}{2}$, so $c = \\tfrac12 < 1$.',
      caseStep('Summary:', [['4', '2', '2', '$n^3$', 'bigger by $n$; $c = \\tfrac12$', '3']]),
      'Case 3: $T(n) = \\Theta(n^3)$.',
    ],
    answer: '$\\Theta(n^3)$: $n^3 = \\Omega(n^{2+1})$, regularity $4(n/2)^3 = \\tfrac12 n^3$, Case 3.',
    mistake: 'Skipping regularity because "it’s obvious". It is one line here; write it.',
    tryIt: { q: 'Solve $T(n) = 9T(n/3) + n^3$.', a: '$n^{\\log_3 9} = n^2$; $n^3 = \\Omega(n^{2+1})$, $\\epsilon = 1$. Regularity: $9(n/3)^3 = \\tfrac13 n^3$, $c = \\tfrac13$. Case 3: $\\Theta(n^3)$.' },
  };

  H['c310-master-9T3'] = {
    asks: 'Solve $T(n) = 9T(n/3) + n$ with the master theorem.',
    idea: 'Nine children, each a third of the size: each level costs 3 times the one above. The $n^2$ leaves dominate the top’s $n$.',
    tree: tree([
      [['$n$'], '$n$'],
      [['$\\tfrac{n}{3}$', '$\\tfrac{n}{3}$', '$\\cdots$', '$\\tfrac{n}{3}$'], '$9 \\cdot \\tfrac{n}{3} = 3n$'],
      [['$\\tfrac{n}{9}$', '$\\tfrac{n}{9}$', '$\\cdots$', '$\\tfrac{n}{9}$'], '$81 \\cdot \\tfrac{n}{9} = 9n$'],
      null,
      [LEAVES, '$n^2 \\cdot T(1)$'],
    ], 'Level costs triple each time: bottom-heavy, Case 1.'),
    graph: vs('$f(n) = n$ against $n^2$: the gap grows like $n$, so $\\epsilon = 1$.', [1, 100], [
      ['$f(n) = n$', n => n],
      ['$n^{\\log_3 9} = n^2$', n => n * n],
    ]),
    steps: [
      'Read off: $a = 9$, $b = 3$, $f(n) = n$.',
      '$\\log_3 9 = 2$, because $3^2 = 9$. So $n^{\\log_b a} = n^2$.',
      'Compare: $n$ is smaller than $n^2$ by $n^1$, so $n = O(n^{2-\\epsilon})$ with $\\epsilon = 1$.',
      caseStep('Summary:', [['9', '3', '2', '$n$', 'smaller by $n$, $\\epsilon = 1$', '1']]),
      'Case 1: $T(n) = \\Theta(n^2)$.',
    ],
    answer: '$\\Theta(n^2)$: $n^{\\log_3 9} = n^2$, $n = O(n^{2-1})$, Case 1.',
    mistake: 'Computing $\\log_9 3 = \\tfrac12$ by swapping base and argument. The base is $b$ (what you divide by), the argument is $a$ (how many calls).',
    tryIt: { q: 'Solve $T(n) = 9T(n/3) + n \\lg n$.', a: '$n^{\\log_3 9} = n^2$. $n \\lg n \\le n^{1.5}$ for $n \\ge 16$, so $f = O(n^{2 - 0.5})$: Case 1, $\\Theta(n^2)$. The log does not matter because the gap is still a power of $n$.' },
  };

  H['c310-master-binsearch'] = {
    asks: 'Binary search has $T(n) = T(n/2) + \\Theta(1)$. Solve it with the master theorem: $a$, $b$, $n^{\\log_b a}$, the case, the answer.',
    idea: 'One call per level, constant work per call: the total is the number of times you can halve $n$ before reaching 1. That is $\\lg n$, and the master theorem gets there through Case 2.',
    tree: tree([
      [['$\\Theta(1)$'], '$\\Theta(1)$'],
      [['$\\Theta(1)$'], '$\\Theta(1)$'],
      [['$\\Theta(1)$'], '$\\Theta(1)$'],
      null,
      [['$T(1)$'], '$\\Theta(1)$'],
    ], 'One node per level with constant cost; sizes $n, \\tfrac{n}{2}, \\tfrac{n}{4}, \\dots$, so $\\lg n + 1$ levels.'),
    steps: [
      'Read off: $a = 1$ (one half is searched), $b = 2$, $f(n) = \\Theta(1)$.',
      '$\\log_2 1 = 0$, because $2^0 = 1$. So $n^{\\log_b a} = n^0 = 1$.',
      'Compare: $f = \\Theta(1) = \\Theta(n^0)$, a tie. Case 2.',
      caseStep('Summary:', [['1', '2', '0', '$\\Theta(1)$', 'equal', '2']]),
      'Case 2: $T(n) = \\Theta(n^0 \\log n) = \\Theta(\\log n)$. This matches the halving argument: $n/2^k = 1$ at $k = \\lg n$.',
    ],
    answer: '$a = 1$, $b = 2$, $n^{\\log_2 1} = n^0 = 1$. $f = \\Theta(1) = \\Theta(n^{\\log_b a})$, Case 2: $T(n) = \\Theta(\\log n)$.',
    mistake: 'Calling it Case 1 because "$f$ is a constant, which is small". The leaf count is also a constant here ($n^0 = 1$), so they tie.',
    tryIt: { q: 'Solve $T(n) = T(n/4) + 2$.', a: '$n^{\\log_4 1} = n^0 = 1$, and $f = 2 = \\Theta(1)$: Case 2, $T(n) = \\Theta(\\log n)$.' },
  };

  H['c310-master-3T2'] = {
    asks: 'Solve $T(n) = 3T(n/2) + n$ with the master theorem, giving the exponent to two decimals.',
    idea: 'Three calls on halves: each level costs $\\tfrac32$ times the one above, so the leaves win. Their number, $n^{\\log_2 3}$, is a power of $n$ between $n^1$ and $n^2$.',
    tree: tree([
      [['$n$'], '$n$'],
      [['$\\tfrac{n}{2}$', '$\\tfrac{n}{2}$', '$\\tfrac{n}{2}$'], '$\\tfrac32 n$'],
      [['$\\tfrac{n}{4}$', '$\\tfrac{n}{4}$', '$\\cdots$', '$\\tfrac{n}{4}$'], '$\\tfrac94 n$'],
      null,
      [LEAVES, '$n^{\\log_2 3} \\cdot T(1)$'],
    ], 'Level costs grow by $\\tfrac32$ each time: bottom-heavy, Case 1.'),
    graph: vs('$f(n) = n$ falls below $n^{1.585}$ by the factor $n^{0.585}$, a polynomial gap.', [1, 200], [
      ['$f(n) = n$', n => n],
      ['$n^{\\log_2 3} \\approx n^{1.585}$', n => n ** Math.log2(3)],
    ]),
    steps: [
      'Read off: $a = 3$, $b = 2$, $f(n) = n$.',
      '$\\log_2 3$: solve $2^x = 3$. Since $2^1 = 2 < 3 < 4 = 2^2$, $x$ is between 1 and 2; $x = \\frac{\\ln 3}{\\ln 2} \\approx 1.585$, so $\\approx 1.58$ to two decimals.',
      'Compare $n^1$ with $n^{1.585}$: $f$ is smaller by $n^{0.585}$. So $n = O(n^{1.585 - \\epsilon})$ with $\\epsilon \\approx 0.58$.',
      caseStep('Summary:', [['3', '2', '$\\approx 1.585$', '$n$', 'smaller by $n^{0.585}$', '1']]),
      'Case 1: $T(n) = \\Theta(n^{\\log_2 3}) \\approx \\Theta(n^{1.58})$. This is Karatsuba multiplication.',
    ],
    answer: '$n^{\\log_2 3} \\approx n^{1.58}$; $f = n = O(n^{1.58 - \\epsilon})$, $\\epsilon \\approx 0.58$. Case 1: $T(n) = \\Theta(n^{\\log_2 3}) \\approx \\Theta(n^{1.58})$.',
    mistake: 'Rounding $\\log_2 3$ to 1 or 2 and landing in the wrong case. Keep the exact form $n^{\\log_2 3}$ in the answer; the decimal is only a description.',
    tryIt: { q: 'Solve $T(n) = 5T(n/4) + n$, exponent to two decimals.', a: '$\\log_4 5 = \\frac{\\ln 5}{\\ln 4} \\approx 1.16 > 1$. $f = n$ is smaller by $n^{0.16}$: Case 1, $\\Theta(n^{\\log_4 5}) \\approx \\Theta(n^{1.16})$.' },
  };

  H['c310-master-7T2'] = {
    asks: 'Solve $T(n) = 7T(n/2) + n^2$ with the master theorem.',
    idea: 'Seven calls on halves: each child does $\\tfrac14$ of the parent’s $n^2$, but there are 7 of them, so each level costs $\\tfrac74$ times the one above. The leaves win, and there are $n^{\\log_2 7} \\approx n^{2.81}$ of them.',
    tree: tree([
      [['$n^2$'], '$n^2$'],
      [['$\\tfrac{n^2}{4}$', '$\\tfrac{n^2}{4}$', '$\\cdots$', '$\\tfrac{n^2}{4}$'], '$\\tfrac74 n^2$'],
      [['$\\tfrac{n^2}{16}$', '$\\tfrac{n^2}{16}$', '$\\cdots$', '$\\tfrac{n^2}{16}$'], '$\\tfrac{49}{16} n^2$'],
      null,
      [LEAVES, '$n^{\\log_2 7} \\cdot T(1)$'],
    ], 'Level costs grow by $\\tfrac74$ each time: bottom-heavy, Case 1.'),
    graph: vs('$n^2$ falls below $n^{2.807}$ by the factor $n^{0.807}$. Plain $n^3$ (8 calls instead of 7) is shown for scale.', [1, 100], [
      ['$f(n) = n^2$', n => n * n],
      ['$n^{\\log_2 7} \\approx n^{2.807}$', n => n ** Math.log2(7)],
      ['$n^3$', n => n ** 3],
    ]),
    steps: [
      'Read off: $a = 7$, $b = 2$, $f(n) = n^2$.',
      '$\\log_2 7$: $2^2 = 4 < 7 < 8 = 2^3$, so it is between 2 and 3; $\\frac{\\ln 7}{\\ln 2} \\approx 2.807$.',
      'Compare $n^2$ with $n^{2.807}$: $f$ is smaller by $n^{0.807}$. So $n^2 = O(n^{2.807 - \\epsilon})$ with $\\epsilon \\approx 0.8$.',
      caseStep('Summary:', [['7', '2', '$\\approx 2.807$', '$n^2$', 'smaller by $n^{0.807}$', '1']]),
      'Case 1: $T(n) = \\Theta(n^{\\log_2 7}) \\approx \\Theta(n^{2.81})$. This is Strassen’s matrix multiplication: 7 calls instead of 8 beats $n^3$.',
    ],
    answer: '$n^{\\log_2 7} \\approx n^{2.81}$; $f = n^2 = O(n^{2.81 - \\epsilon})$. Case 1: $T(n) = \\Theta(n^{\\log_2 7}) \\approx \\Theta(n^{2.81})$.',
    mistake: 'Seeing $f = n^2$ and answering $\\Theta(n^2)$. The answer follows whichever side is bigger, and here the leaves ($n^{2.81}$) are.',
    tryIt: { q: 'Solve $T(n) = 7T(n/3) + n^2$.', a: '$\\log_3 7 \\approx 1.77 < 2$, so $f = n^2$ is BIGGER: $\\epsilon \\approx 0.2$. Regularity: $7(n/3)^2 = \\tfrac79 n^2$, $c = \\tfrac79$. Case 3: $\\Theta(n^2)$.' },
  };

  H['c310-master-2T4-sqrt'] = {
    asks: 'Solve $T(n) = 2T(n/4) + \\sqrt{n}$ with the master theorem.',
    idea: 'Two children, each a quarter of the size: $\\sqrt{n/4} = \\tfrac12\\sqrt{n}$ each, times 2 is $\\sqrt{n}$ again. Every level costs the same: Case 2.',
    tree: tree([
      [['$\\sqrt{n}$'], '$\\sqrt{n}$'],
      [['$\\tfrac12\\sqrt{n}$', '$\\tfrac12\\sqrt{n}$'], '$\\sqrt{n}$'],
      [['$\\tfrac14\\sqrt{n}$', '$\\tfrac14\\sqrt{n}$', '$\\tfrac14\\sqrt{n}$', '$\\tfrac14\\sqrt{n}$'], '$\\sqrt{n}$'],
      null,
      [LEAVES, '$\\sqrt{n} \\cdot T(1)$'],
    ], 'Every level costs $\\sqrt{n}$, and there are $\\log_4 n + 1$ levels.'),
    steps: [
      'Read off: $a = 2$, $b = 4$, $f(n) = \\sqrt{n} = n^{1/2}$.',
      '$\\log_4 2$: $4^{1/2} = \\sqrt{4} = 2$, so $\\log_4 2 = \\tfrac12$ and $n^{\\log_b a} = n^{1/2} = \\sqrt{n}$.',
      'Compare: $f = \\sqrt{n} = \\Theta(n^{1/2})$, a tie. Case 2.',
      caseStep('Summary:', [['2', '4', '$\\tfrac12$', '$\\sqrt{n}$', 'equal', '2']]),
      'Case 2: $T(n) = \\Theta(\\sqrt{n} \\log n)$.',
    ],
    answer: '$\\Theta(\\sqrt{n} \\log n)$: $n^{\\log_4 2} = n^{1/2} = \\Theta(f)$, Case 2.',
    mistake: 'Computing $\\log_2 4 = 2$ (base and argument swapped) and calling it Case 1. The base is $b = 4$: "4 to what power gives 2?" Answer $\\tfrac12$.',
    tryIt: { q: 'Solve $T(n) = 3T(n/9) + \\sqrt{n}$.', a: '$9^{1/2} = 3$, so $n^{\\log_9 3} = \\sqrt{n} = \\Theta(f)$. Case 2: $\\Theta(\\sqrt{n} \\log n)$.' },
  };

  H['c310-master-2T-n2'] = {
    asks: 'Solve $T(n) = 2T(n/2) + n^2$ with the master theorem.',
    idea: 'Two children, each with a quarter of the parent’s $n^2$: level 1 costs half the root. Shrinking levels mean the root wins.',
    tree: tree([
      [['$n^2$'], '$n^2$'],
      [['$\\tfrac{n^2}{4}$', '$\\tfrac{n^2}{4}$'], '$\\tfrac{n^2}{2}$'],
      [['$\\tfrac{n^2}{16}$', '$\\tfrac{n^2}{16}$', '$\\tfrac{n^2}{16}$', '$\\tfrac{n^2}{16}$'], '$\\tfrac{n^2}{4}$'],
      null,
      [LEAVES, '$\\Theta(n)$'],
    ], 'Each level costs half the one above: top-heavy, Case 3.'),
    graph: vs('$n^2$ beats $n$ by the factor $n$: $\\epsilon = 1$.', [1, 100], [
      ['$f(n) = n^2$', n => n * n],
      ['$n^{\\log_2 2} = n$', n => n],
    ]),
    steps: [
      'Read off: $a = 2$, $b = 2$, $f(n) = n^2$; $n^{\\log_2 2} = n$.',
      'Compare: $n^2$ is bigger than $n$ by $n^1$, so $f = \\Omega(n^{1+\\epsilon})$ with $\\epsilon = 1$.',
      'Regularity: $2 (n/2)^2 = 2 \\cdot \\frac{n^2}{4} = \\frac{n^2}{2}$, so $c = \\tfrac12 < 1$.',
      caseStep('Summary:', [['2', '2', '1', '$n^2$', 'bigger by $n$; $c = \\tfrac12$', '3']]),
      'Case 3: $T(n) = \\Theta(n^2)$.',
    ],
    answer: '$\\Theta(n^2)$: $n^2 = \\Omega(n^{1+1})$, regularity $2(n/2)^2 = \\tfrac12 n^2$, Case 3.',
    mistake: 'Writing $\\Theta(n^2 \\log n)$ by habit from merge sort. The log only appears in a tie (Case 2).',
    tryIt: { q: 'Solve $T(n) = 2T(n/2) + n^{1.5}$.', a: '$n^{\\log_2 2} = n$; $n^{1.5} = \\Omega(n^{1 + 0.5})$, $\\epsilon = 0.5$. Regularity: $2(n/2)^{1.5} = n^{1.5}/\\sqrt{2}$, $c \\approx 0.71$. Case 3: $\\Theta(n^{1.5})$.' },
  };

  H['c310-master-8T-n3'] = {
    asks: 'Solve $T(n) = 8T(n/2) + n^3$ with the master theorem.',
    idea: 'Eight children, each with $\\tfrac18$ of the parent’s $n^3$: every level costs $n^3$. A tie, so Case 2 adds a $\\log n$.',
    tree: tree([
      [['$n^3$'], '$n^3$'],
      [['$\\tfrac{n^3}{8}$', '$\\tfrac{n^3}{8}$', '$\\cdots$', '$\\tfrac{n^3}{8}$'], '$8 \\cdot \\tfrac{n^3}{8} = n^3$'],
      [['$\\tfrac{n^3}{64}$', '$\\tfrac{n^3}{64}$', '$\\cdots$', '$\\tfrac{n^3}{64}$'], '$64 \\cdot \\tfrac{n^3}{64} = n^3$'],
      null,
      [LEAVES, '$n^3 \\cdot T(1)$'],
    ], 'Every level costs $n^3$; there are $\\lg n + 1$ levels.'),
    steps: [
      'Read off: $a = 8$, $b = 2$, $f(n) = n^3$.',
      '$\\log_2 8 = 3$, because $2^3 = 8$. So $n^{\\log_b a} = n^3$.',
      'Compare: $f = n^3 = \\Theta(n^3)$, a tie. Case 2.',
      caseStep('Summary:', [['8', '2', '3', '$n^3$', 'equal', '2']]),
      'Case 2: $T(n) = \\Theta(n^3 \\log n)$.',
    ],
    answer: '$\\Theta(n^3 \\log n)$: $n^{\\log_2 8} = n^3 = \\Theta(f)$, Case 2.',
    mistake: 'Answering $\\Theta(n^3)$ and dropping the log. When $f$ equals $n^{\\log_b a}$, every one of the $\\lg n + 1$ levels pays $n^3$.',
    tryIt: { q: 'Solve $T(n) = 27T(n/3) + n^3$.', a: '$3^3 = 27$, so $n^{\\log_3 27} = n^3 = \\Theta(f)$. Case 2: $\\Theta(n^3 \\log n)$.' },
  };

  H['c310-master-27T3'] = {
    asks: 'For $T(n) = 27T(n/3) + n^2$, what is $\\log_b a$?',
    idea: '$\\log_b a$ answers one question: "$b$ to what power gives $a$?" Here: 3 to what power gives 27?',
    steps: [
      'Identify: $a = 27$ (calls), $b = 3$ (size divisor). So you need $\\log_3 27$.',
      'Ask "3 to what power is 27?": $3^1 = 3$, $3^2 = 9$, $3^3 = 27$. So $\\log_3 27 = 3$.',
      'So $n^{\\log_b a} = n^3$: the tree has $n^3$ leaves.',
      caseStep('Going on to solve it:', [['27', '3', '3', '$n^2$', 'smaller by $n$, $\\epsilon = 1$', '1']]),
      'Case 1: $T(n) = \\Theta(n^3)$.',
    ],
    graph: vs('$f(n) = n^2$ against the $n^3$ leaves: the leaves win by a factor of $n$.', [1, 100], [
      ['$f(n) = n^2$', n => n * n],
      ['$n^{\\log_3 27} = n^3$', n => n ** 3],
    ]),
    answer: '$\\log_3 27 = 3$, since $3^3 = 27$. (Then $f = n^2$ is polynomially smaller, Case 1: $\\Theta(n^3)$.)',
    mistake: 'Computing $27/3 = 9$. $\\log_b a$ is an exponent, not a quotient.',
    tryIt: { q: 'For $T(n) = 16T(n/2) + n^3$, what is $\\log_b a$, and what is $T(n)$?', a: '$2^4 = 16$, so $\\log_2 16 = 4$. $n^3 = O(n^{4-1})$: Case 1, $\\Theta(n^4)$.' },
  };

  H['c310-master-5T2'] = {
    asks: 'Which is the solution of $T(n) = 5T(n/2) + n^2$: $\\Theta(n^2 \\log n)$, $\\Theta(n^2)$, $\\Theta(n^{2.5})$, or $\\Theta(n^{\\log_2 5})$?',
    idea: 'Everything hinges on $\\log_2 5$. Five is more than four, so $\\log_2 5$ is more than 2: the $n^{2.32}$ leaves beat $f = n^2$.',
    tree: tree([
      [['$n^2$'], '$n^2$'],
      [['$\\tfrac{n^2}{4}$', '$\\tfrac{n^2}{4}$', '$\\cdots$', '$\\tfrac{n^2}{4}$'], '$\\tfrac54 n^2$'],
      [['$\\tfrac{n^2}{16}$', '$\\tfrac{n^2}{16}$', '$\\cdots$', '$\\tfrac{n^2}{16}$'], '$\\tfrac{25}{16} n^2$'],
      null,
      [LEAVES, '$n^{\\log_2 5} \\cdot T(1)$'],
    ], 'Five children, each with $\\tfrac14$ of the parent’s cost: each level costs $\\tfrac54$ of the one above. Bottom-heavy, Case 1.'),
    graph: vs('The three wrong options and the right one. $n^{2.32}$ passes $n^2 \\lg n$ near $n = 2^{10.6} \\approx 1500$ and stays above it; $n^{2.5}$ grows too fast.', [2, 1e5], [
      ['$n^{\\log_2 5} \\approx n^{2.32}$', n => n ** Math.log2(5)],
      ['$n^2 \\lg n$', n => n * n * lg(n)],
      ['$n^2$', n => n * n],
      ['$n^{2.5}$', n => n ** 2.5],
    ]),
    steps: [
      'Read off: $a = 5$, $b = 2$, $f(n) = n^2$.',
      '$\\log_2 5$: $2^2 = 4 < 5 < 8 = 2^3$, so it is between 2 and 3; $\\frac{\\ln 5}{\\ln 2} \\approx 2.32$.',
      'Compare $n^2$ with $n^{2.32}$: $f$ is smaller by $n^{0.32}$. So $n^2 = O(n^{2.32 - \\epsilon})$ with $\\epsilon \\approx 0.3$: Case 1.',
      caseStep('Summary:', [['5', '2', '$\\approx 2.32$', '$n^2$', 'smaller by $n^{0.32}$', '1']]),
      'Case 1: $T(n) = \\Theta(n^{\\log_2 5}) \\approx \\Theta(n^{2.32})$. The distractors: $\\Theta(n^2 \\log n)$ needs $a = 4$ exactly; $\\Theta(n^2)$ would be Case 3; $\\Theta(n^{2.5})$ uses the wrong exponent.',
    ],
    answer: '$\\Theta(n^{\\log_2 5}) \\approx \\Theta(n^{2.32})$: $\\log_2 5 \\approx 2.32 > 2$, so $f = n^2$ is polynomially smaller, Case 1.',
    mistake: 'Seeing $n^2$ next to a 2 and reaching for Case 2. Case 2 needs $\\log_b a = 2$ exactly, which here means $a = 4$.',
    tryIt: { q: 'Solve $T(n) = 10T(n/3) + n^2$.', a: '$\\log_3 10 \\approx 2.10 > 2$ (since $3^2 = 9 < 10$). $f = n^2$ is smaller by $n^{0.10}$: Case 1, $\\Theta(n^{\\log_3 10}) \\approx \\Theta(n^{2.10})$.' },
  };

  H['c310-master-not-form'] = {
    asks: 'Can the master theorem solve $T(n) = T(n-1) + n$? If not, solve it another way.',
    idea: 'The master theorem only handles DIVIDING the size by a constant $b > 1$. Here the size drops by 1 each step, so the tree is a long chain of $n$ levels. Add the chain up with the iteration method.',
    tree: {
      sumsLabel: 'level total',
      levels: [
        { nodes: ['$n$'], sum: '$n$' },
        { nodes: ['$n - 1$'], sum: '$n - 1$' },
        { nodes: ['$n - 2$'], sum: '$n - 2$' },
        { gap: true },
        { nodes: ['$T(1)$'], sum: '$1$' },
      ],
      caption: 'A chain, not a branching tree: $n$ levels, and level $i$ costs $n - i$. The sum is $1 + 2 + \\dots + n$.',
    },
    graph: {
      caption: 'The exact total $n(n+1)/2$ hugs $n^2/2$: quadratic.',
      x: [1, 50], xLabel: 'n', yLabel: 'T(n)',
      curves: [
        { label: '$T(n) = \\frac{n(n+1)}{2}$', f: n => n * (n + 1) / 2, tone: 'a' },
        { label: '$\\frac{n^2}{2}$', f: n => n * n / 2, tone: 'b' },
      ],
    },
    steps: [
      'Check the form: master needs $aT(n/b)$ with $b > 1$. $T(n - 1)$ subtracts 1; it does not divide, so no $b$ exists and the theorem does not apply.',
      'Iterate (Lecture 5, Example 2): $T(n) = n + T(n-1) = n + (n-1) + T(n-2) = n + (n-1) + (n-2) + T(n-3)$.',
      'Keep going until the base case $T(1) = 1$: $T(n) = n + (n-1) + \\dots + 2 + 1$.',
      'Use the sum formula $1 + 2 + \\dots + n = \\frac{n(n+1)}{2}$. Check with $n = 4$: $4 + 3 + 2 + 1 = 10 = \\frac{4 \\cdot 5}{2}$.',
      '$\\frac{n(n+1)}{2} = \\frac{n^2}{2} + \\frac{n}{2} = \\Theta(n^2)$.',
    ],
    answer: 'No: the subproblem is $n - 1$, not $n/b$ with $b > 1$. Iterating gives $n + (n-1) + \\dots + 1 = n(n+1)/2 = \\Theta(n^2)$.',
    mistake: 'Forcing it into the template as "$a = 1$, $b = 1$". The theorem requires $b > 1$; with $b = 1$ there is no $\\log_b a$ at all.',
    tryIt: { q: 'Can the master theorem solve $T(n) = 2T(n-1) + 1$ with $T(1) = 1$? Solve it.', a: 'No (subtraction, no $b > 1$). Iterating: $T(n) = 2^{n-1} + 2^{n-2} + \\dots + 2 + 1 = 2^n - 1$, so $\\Theta(2^n)$. Check: $T(2) = 3$, $T(3) = 7$.' },
  };

  H['c310-master-regularity-which'] = {
    asks: 'Of $4T(n/2) + n$, $2T(n/2) + n$, $T(n/2) + 1$ and $2T(n/2) + n^3$, for which must you check the regularity condition?',
    idea: 'Regularity belongs to Case 3 only. So classify each recurrence first; only the one where $f$ is polynomially bigger than $n^{\\log_b a}$ needs the check.',
    steps: [
      'Regularity ($a f(n/b) \\le c f(n)$, $c < 1$) is the second half of Case 3. Cases 1 and 2 never use it.',
      { text: 'Classify each recurrence:', table: { head: CASE_HEAD, rows: [
        ['4', '2', '2', '$n$', 'smaller by $n$', '1'],
        ['2', '2', '1', '$n$', 'equal', '2'],
        ['1', '2', '0', '$1$', 'equal', '2'],
        ['2', '2', '1', '$n^3$', 'bigger by $n^2$', '3'],
      ] } },
      'Only $2T(n/2) + n^3$ is Case 3, so only it needs the check: $2(n/2)^3 = \\tfrac14 n^3$, $c = \\tfrac14 < 1$.',
      'Results: $\\Theta(n^2)$, $\\Theta(n \\log n)$, $\\Theta(\\log n)$, and $\\Theta(n^3)$.',
    ],
    graph: {
      caption: 'Level cost relative to the root for each one. Only the falling line ($2T(n/2) + n^3$) has the root dominating, and regularity is exactly the promise that the line falls.',
      x: [0, 6], logY: true, xLabel: 'level i', yLabel: 'level cost / root (log scale)',
      curves: [
        { label: '$4T(n/2) + n$: $2^i$', f: i => 2 ** i, tone: 'a' },
        { label: '$2T(n/2) + n$ and $T(n/2) + 1$: $1$', f: () => 1, tone: 'b' },
        { label: '$2T(n/2) + n^3$: $(1/4)^i$', f: i => 0.25 ** i, tone: 'c' },
      ],
    },
    answer: '$T(n) = 2T(n/2) + n^3$: it is the only Case 3 recurrence, and regularity is part of Case 3 only.',
    mistake: 'Checking regularity for every recurrence, or for none. Classify first; check it exactly when you are about to use Case 3.',
    tryIt: { q: 'Which of these needs a regularity check: $9T(n/3) + n^2$, $2T(n/4) + n$, $8T(n/2) + n^2$?', a: 'Only $2T(n/4) + n$: $n^{\\log_4 2} = \\sqrt{n}$ and $n$ is bigger by $n^{0.5}$ (Case 3; $2 \\cdot \\tfrac{n}{4} = \\tfrac12 n$, $c = \\tfrac12$). The others are Case 2 and Case 1.' },
  };
})(globalThis.FC = globalThis.FC || {});
