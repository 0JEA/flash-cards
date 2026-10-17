// Help walkthroughs for the CSC 310 Lecture 5 recursion-tree cards (FC.csc310Cards, sub
// 'Recursion trees'): what a node is, the FindMax and merge sort trees, and the
// $T(n) = 3T(n/4) + cn^2$ tree (depth, level cost, leaves, the log identity, the geometric sum).
// Same entry format as decks/csc310-help.js (see its header comment, incl. `tree`).
// Assignment 2's own recurrence is never used: every example and tryIt uses an even split.
// Every number, table row, level total and tryIt answer was checked with python3 on 2026-10-16.
(function (FC) {
  'use strict';
  const H = FC.help = FC.help || {};

  // Shared trees.
  const MS_TREE = {
    sumsLabel: 'level total',
    levels: [
      { nodes: ['$cn$'], sum: '$cn$' },
      { nodes: ['$\\tfrac{cn}{2}$', '$\\tfrac{cn}{2}$'], sum: '$2 \\cdot \\tfrac{cn}{2} = cn$' },
      { nodes: ['$\\tfrac{cn}{4}$', '$\\tfrac{cn}{4}$', '$\\tfrac{cn}{4}$', '$\\tfrac{cn}{4}$'], sum: '$4 \\cdot \\tfrac{cn}{4} = cn$' },
      { gap: true },
      { nodes: ['$c$', '$c$', '$\\cdots$', '$c$', '$c$'], sum: '$n \\cdot c = cn$' },
    ],
  };
  const T34_TREE = {
    sumsLabel: 'level total',
    levels: [
      { nodes: ['$cn^2$'], sum: '$cn^2$' },
      { nodes: ['$\\tfrac{cn^2}{16}$', '$\\tfrac{cn^2}{16}$', '$\\tfrac{cn^2}{16}$'], sum: '$\\tfrac{3}{16}\\,cn^2$' },
      { nodes: Array(9).fill('$\\tfrac{cn^2}{256}$'), sum: '$(\\tfrac{3}{16})^2 cn^2$' },
      { gap: true },
      { nodes: ['$T(1)$', '$T(1)$', '$\\cdots$', '$T(1)$', '$T(1)$'], sum: '$\\Theta(n^{\\log_4 3})$' },
    ],
  };

  H['c310-5-rt-def'] = {
    asks: 'Say what one node of a recursion tree stands for, and how the nodes are added up to get the total running time $T(n)$.',
    idea: 'Draw every recursive call as a box, with the calls it makes hanging below it. In each box write only the work that call does itself (splitting, combining), not its children’s work. $T(n)$ is all the boxes added up, and the easy way to add them is one row at a time.',
    steps: [
      'Example: $T(n) = 2T(n/2) + n^2$, $T(1) = 1$, $n = 16$. The root is the call on size 16; its own work is $16^2 = 256$. It makes two calls on size 8.',
      'Each size-8 call does $8^2 = 64$ itself and makes two calls on size 4, which do $4^2 = 16$ each. Keep going down to size 1, where each leaf is the base case $T(1) = 1$.',
      { text: 'Add across each row (level) first:', table: { head: ['depth $i$', 'nodes', 'size', 'cost per node', 'level total'], rows: [['0', '1', '16', '256', '256'], ['1', '2', '8', '64', '128'], ['2', '4', '4', '16', '64'], ['3', '8', '2', '4', '32'], ['4', '16', '1', '1 (leaf)', '16']] } },
      'Then add the level totals: $256 + 128 + 64 + 32 + 16 = 496$.',
      'Check with the recurrence itself: $T(2) = 2 \\cdot 1 + 4 = 6$, $T(4) = 2 \\cdot 6 + 16 = 28$, $T(8) = 2 \\cdot 28 + 64 = 120$, $T(16) = 2 \\cdot 120 + 256 = 496$. Same number.',
    ],
    tree: {
      sumsLabel: 'level total',
      levels: [
        { nodes: ['$256$'], sum: '$256$' },
        { nodes: ['$64$', '$64$'], sum: '$128$' },
        { nodes: ['$16$', '$16$', '$16$', '$16$'], sum: '$64$' },
        { gap: true },
        { nodes: ['$1$', '$1$', '$\\cdots$', '$1$', '$1$'], sum: '$16 \\cdot 1 = 16$' },
      ],
      caption: 'Each node is the work one call does by itself. The gap is depth 3 (eight nodes of 4, total 32). $T(16)$ is the right column added up: $496$.',
    },
    graph: {
      caption: 'The five level totals for $n = 16$. Here they halve going down; in other recurrences they stay equal or grow. Either way you add the column.',
      x: [-0.5, 4.5], y: [0, 280], xLabel: 'depth i', yLabel: 'level total',
      bars: { label: 'level total at depth $i$', tone: 'b', values: [[0, 256], [1, 128], [2, 64], [3, 32], [4, 16]] },
    },
    answer: 'Each node is the cost of one subproblem: the non-recursive work of that single call (a leaf is a base case $T(1)$). Add the nodes in each level to get the per-level costs, then add the per-level costs to get $T(n)$.',
    mistake: 'Writing $T(n/2)$ inside a node. A node holds only that call’s own work, $f$ of its size; the $T(\\cdot)$ parts become its children.',
    tryIt: { q: 'Draw the tree for $T(n) = 2T(n/2) + n$, $T(1) = 1$, at $n = 8$. Give the level totals and $T(8)$.', a: 'Nodes: $8$; $4, 4$; $2, 2, 2, 2$; eight leaves of 1. Level totals $8, 8, 8, 8$, so $T(8) = 32$. Check: $T(2) = 4$, $T(4) = 12$, $T(8) = 2 \\cdot 12 + 8 = 32$.' },
  };

  H['c310-5-rt-uses'] = {
    asks: 'Name the two jobs a recursion tree can do for you.',
    idea: 'A tree drawn quickly, with rough edges (pretend $n$ is a power of 2, round freely, add a few extra terms) gives you a believable answer: a guess. You then prove the guess with the substitution method. A tree summed exactly, with nothing rounded, is already a proof.',
    steps: [
      'Use 1, direct proof: add up the tree exactly. Merge sort with $n$ a power of 2 is like this: $\\lg n + 1$ levels of $cn$ each, total exactly $cn(\\lg n + 1)$.',
      'Use 2, a guess: when the exact sum is messy, allow "small amounts of sloppiness" (Lecture 5) and read off the growth rate. That rate is your guess.',
      'Example (Lecture 6): $T(n) = 2T(n/2) + n$. Level $i$ has $2^i$ nodes of size $n/2^i$, so its total is $2^i \\cdot n/2^i = n$. About $\\lg n$ levels of $n$: guess $T(n) = O(n \\lg n)$.',
      'Prove the guess by substitution: assume $T(n/2) \\le c\\tfrac{n}{2}\\lg\\tfrac{n}{2}$. Then $T(n) \\le 2c\\tfrac{n}{2}(\\lg n - \\lg 2) + n = cn\\lg n - cn + n$.',
      'For $c \\ge 1$, $-cn + n \\le 0$, so $T(n) \\le cn \\lg n$. The guess is now proved (Lecture 6, slide 3).',
    ],
    tree: {
      sumsLabel: 'level total',
      levels: [
        { nodes: ['$n$'], sum: '$n$' },
        { nodes: ['$\\tfrac{n}{2}$', '$\\tfrac{n}{2}$'], sum: '$n$' },
        { nodes: ['$\\tfrac{n}{4}$', '$\\tfrac{n}{4}$', '$\\tfrac{n}{4}$', '$\\tfrac{n}{4}$'], sum: '$n$' },
        { gap: true },
        { nodes: ['$T(1)$', '$T(1)$', '$\\cdots$', '$T(1)$', '$T(1)$'], sum: '$\\Theta(n)$' },
      ],
      caption: 'The quick tree for $T(n) = 2T(n/2) + n$: every level costs $n$ and there are about $\\lg n$ levels, so guess $n \\lg n$. Substitution then proves it.',
    },
    answer: 'Either as a direct proof of the solution (if the tree is summed carefully), or to produce a good guess that you then verify with the substitution method.',
    mistake: 'Treating a sloppy tree (infinite series, ignored floors) as a finished proof. It is a guess until substitution, or an exact sum, backs it up.',
    tryIt: { q: 'Use a quick tree to guess a bound for $T(n) = 2T(n/2) + n^2$, then check the guess by substitution.', a: 'Level $i$: $2^i (n/2^i)^2 = n^2/2^i$, ratio $\\tfrac12 < 1$, so the sum is under $n^2 \\cdot \\frac{1}{1 - 1/2} = 2n^2$: guess $O(n^2)$. Assume $T(n/2) \\le c(n/2)^2$: $T(n) \\le \\tfrac{c}{2}n^2 + n^2 \\le cn^2$ when $c \\ge 2$.' },
  };

  H['c310-5-findmax-tree'] = {
    asks: 'For FindMax, $T(n) = 2T(n/2) + 1$, describe its recursion tree: what level $i$ costs, how many levels there are, and what everything adds up to.',
    idea: 'Every call does one comparison, so every node costs 1. The tree doubles its width at each level, so the level totals double too: $1, 2, 4, \\dots$ The bottom row (the $n$ leaves) is as big as all the rows above it put together.',
    steps: [
      'Nodes at depth $i$: each node has 2 children, so the count doubles each level: $1, 2, 4, \\dots, 2^i$. Each costs 1, so level $i$ costs $2^i \\cdot 1 = 2^i$.',
      'Size at depth $i$ is $n/2^i$. The leaves are where the size is 1: $n/2^i = 1 \\Rightarrow n = 2^i \\Rightarrow i = \\lg n$ (take $\\lg$ of both sides). So the depths run $0, \\dots, k$ with $k = \\lg n$.',
      'Total $= \\sum_{i=0}^{k} 2^i$. Geometric series with ratio $r = 2$: $\\frac{r^{k+1} - 1}{r - 1} = \\frac{2^{k+1} - 1}{2 - 1} = 2^{k+1} - 1$.',
      'Substitute $k = \\lg n$: $2^{\\lg n + 1} - 1 = 2 \\cdot 2^{\\lg n} - 1 = 2n - 1$, because $2^{\\lg n} = n$.',
      { text: '$r = 2 > 1$, so the levels grow and the last one (the leaves) dominates. Check against the recurrence with $T(1) = 1$:', table: { head: ['$n$', '$T(n) = 2T(n/2) + 1$', '$2n - 1$'], rows: [['2', '3', '3'], ['4', '7', '7'], ['8', '15', '15'], ['16', '31', '31']] } },
    ],
    tree: {
      sumsLabel: 'level total',
      levels: [
        { nodes: ['$1$'], sum: '$1$' },
        { nodes: ['$1$', '$1$'], sum: '$2$' },
        { nodes: ['$1$', '$1$', '$1$', '$1$'], sum: '$4$' },
        { gap: true },
        { nodes: ['$1$', '$1$', '$\\cdots$', '$1$', '$1$'], sum: '$2^{\\lg n} = n$' },
      ],
      caption: 'Every node costs 1. Level $i$ holds $2^i$ nodes, so the right column doubles: $1, 2, 4, \\dots, n$.',
    },
    graph: {
      caption: 'Level totals for $n = 16$: $1, 2, 4, 8, 16$. The last bar (16) is bigger than all the others together ($15$), so the total $31$ is about twice the leaf count.',
      x: [-0.5, 4.5], y: [0, 18], xLabel: 'depth i', yLabel: 'level total',
      bars: { label: 'level total $2^i$ ($n = 16$)', tone: 'b', values: [[0, 1], [1, 2], [2, 4], [3, 8], [4, 16]] },
      curves: [{ label: '$2^i$', f: i => 2 ** i, tone: 'a' }],
    },
    answer: 'Level $i$: $2^i$ nodes $\\times$ 1 $= 2^i$. Depth $k = \\lg n$ ($n$ leaves), so $\\lg n + 1$ levels. Total $\\sum_{i=0}^{\\lg n} 2^i = 2^{\\lg n + 1} - 1 = 2n - 1 = \\Theta(n)$.',
    mistake: 'Stopping the sum at $\\lg n - 1$ and forgetting the leaf row. Here the leaves are the biggest level: dropping them gives $n - 1$ and hides where half the work is.',
    tryIt: { q: 'Same questions for $T(n) = 4T(n/2) + 1$, $T(1) = 1$.', a: 'Level $i$: $4^i$ nodes of cost 1, depth $\\lg n$. Total $\\sum_{i=0}^{\\lg n} 4^i = \\frac{4^{\\lg n + 1} - 1}{3} = \\frac{4n^2 - 1}{3}$, using $4^{\\lg n} = (2^{\\lg n})^2 = n^2$. So $\\Theta(n^2)$; at $n = 4$ that is $21$.' },
  };

  H['c310-5-findmax-sum'] = {
    asks: 'Find a short formula for $1 + 2 + 4 + \\dots + 2^k$ (no "$\\dots$" and no $\\sum$).',
    idea: 'Each power of 2 is one more than all the smaller ones together: $8 = (1 + 2 + 4) + 1$. So adding up to $2^k$ gives one less than the next power, $2^{k+1}$.',
    steps: [
      'Call the sum $S = 1 + 2 + 4 + \\dots + 2^k$. Doubling every term gives $2S = 2 + 4 + \\dots + 2^k + 2^{k+1}$.',
      'Subtract $S$ from $2S$. Every term from $2$ to $2^k$ appears in both and cancels, leaving $2S - S = 2^{k+1} - 1$, so $S = 2^{k+1} - 1$.',
      'Same result from the geometric formula $\\sum_{i=0}^{k} r^i = \\frac{r^{k+1} - 1}{r - 1}$ with $r = 2$: $\\frac{2^{k+1} - 1}{2 - 1} = 2^{k+1} - 1$.',
      { text: 'Check small $k$:', table: { head: ['$k$', '$1 + 2 + \\dots + 2^k$', '$2^{k+1} - 1$'], rows: [['0', '1', '1'], ['1', '3', '3'], ['2', '7', '7'], ['3', '15', '15'], ['4', '31', '31']] } },
      'In the FindMax tree $2^k = n$ (the leaf count), so the sum is $2 \\cdot 2^k - 1 = 2n - 1$.',
    ],
    graph: {
      caption: 'Bars: the running sum up to $2^k$. The curve $2^{k+1} - 1$ passes through the top of every bar.',
      x: [-0.5, 5.5], y: [0, 66], xLabel: 'k', yLabel: 'sum',
      bars: { label: '$\\sum_{i=0}^{k} 2^i$', tone: 'b', values: [[0, 1], [1, 3], [2, 7], [3, 15], [4, 31], [5, 63]] },
      curves: [{ label: '$2^{k+1} - 1$', f: k => 2 ** (k + 1) - 1, tone: 'a' }],
    },
    answer: '$2^{k+1} - 1$.',
    mistake: 'Writing $2^{k+1} - 2$. That is the sum starting at $i = 1$ (no $1$ term, the Lecture 4 version); starting at $i = 0$ gives $2^{k+1} - 1$.',
    tryIt: { q: 'Evaluate $\\sum_{i=0}^{k} 3^i$.', a: 'Formula with $r = 3$: $\\frac{3^{k+1} - 1}{3 - 1} = \\frac{3^{k+1} - 1}{2}$. Check $k = 2$: $1 + 3 + 9 = 13 = (27 - 1)/2$.' },
  };

  H['c310-5-ms-levels'] = {
    asks: 'Count the rows of merge sort’s recursion tree, $T(n) = 2T(n/2) + cn$, from the root row down to the leaf row inclusive.',
    idea: 'Each row halves the subproblem size. The question is how many halvings it takes to get from $n$ down to 1, and then you add one for the root row itself.',
    steps: [
      'Size at depth $i$: the root has size $n$, depth 1 has $n/2$, depth 2 has $n/4$, so depth $i$ has $n/2^i$.',
      'Leaves have size 1. Set $n/2^i = 1$, multiply both sides by $2^i$: $n = 2^i$. Take $\\lg$ of both sides: $i = \\lg n$.',
      'So the depths are $0, 1, 2, \\dots, \\lg n$. Counting from 0 to $\\lg n$ gives $\\lg n + 1$ numbers, so there are $\\lg n + 1$ levels.',
      { text: 'Check $n = 16$: five sizes, five levels, and $\\lg 16 + 1 = 4 + 1 = 5$.', table: { head: ['depth $i$', '0', '1', '2', '3', '4'], rows: [['size $16/2^i$', '16', '8', '4', '2', '1']] } },
    ],
    tree: { ...MS_TREE, caption: 'Depth $i$ holds subproblems of size $n/2^i$. The leaf row is depth $\\lg n$, so with the root row there are $\\lg n + 1$ rows.' },
    graph: {
      caption: 'Subproblem size by depth for $n = 16$. It reaches 1 at depth $\\lg 16 = 4$; depths 0 to 4 are five levels.',
      x: [-0.5, 4.5], y: [0, 17], xLabel: 'depth i', yLabel: 'subproblem size',
      bars: { label: 'size $16/2^i$', tone: 'b', values: [[0, 16], [1, 8], [2, 4], [3, 2], [4, 1]] },
      marks: [{ x: 4, label: '$i = \\lg 16 = 4$' }],
    },
    answer: '$\\lg n + 1$: the size $n/2^i$ hits 1 at depth $i = \\lg n$, and depths $0$ to $\\lg n$ are $\\lg n + 1$ levels.',
    mistake: 'Answering $\\lg n$. That is the height (the depth of the leaves); the number of levels also counts depth 0, the root.',
    tryIt: { q: 'How many levels does the tree of $T(n) = 2T(n/4) + n$ have? Check with $n = 64$.', a: 'Size $n/4^i = 1 \\Rightarrow n = 4^i \\Rightarrow i = \\log_4 n$, so $\\log_4 n + 1$ levels. For $n = 64$: sizes $64, 16, 4, 1$, which is $\\log_4 64 + 1 = 4$ levels.' },
  };

  H['c310-5-ms-leaves'] = {
    asks: 'How many leaves (base-case calls at the bottom row) does merge sort’s tree, $T(n) = 2T(n/2) + cn$, have?',
    idea: 'Merge sort keeps splitting until every piece is a single element. There are $n$ elements, so there are $n$ one-element pieces at the bottom.',
    steps: [
      'Count nodes by depth: each node has 2 children, so depth $i$ has $2^i$ nodes ($1, 2, 4, 8, \\dots$).',
      'The leaves are at depth $\\lg n$ (where the size $n/2^i$ reaches 1). So the leaf count is $2^{\\lg n}$.',
      '$\\lg n$ is by definition the power you raise 2 to in order to get $n$. So $2^{\\lg n} = n$.',
      { text: 'Check $n = 8$:', table: { head: ['depth $i$', '0', '1', '2', '3'], rows: [['nodes $2^i$', '1', '2', '4', '8'], ['size $8/2^i$', '8', '4', '2', '1']] } },
      'Each leaf is $T(1) = c$, so the leaf row costs $n \\cdot c = cn$, the same as every other row.',
    ],
    tree: { ...MS_TREE, caption: 'The bottom row has $2^{\\lg n} = n$ leaves, one per element, each costing $c$.' },
    graph: {
      caption: 'Nodes per depth for $n = 16$. The count doubles each row and the last row (depth $\\lg 16 = 4$) has $16 = n$ nodes.',
      x: [-0.5, 4.5], y: [0, 17], xLabel: 'depth i', yLabel: 'nodes',
      bars: { label: 'nodes $2^i$', tone: 'b', values: [[0, 1], [1, 2], [2, 4], [3, 8], [4, 16]] },
      marks: [{ x: 4, label: 'leaves: $2^4 = 16$' }],
    },
    answer: '$n$ leaves: $2^{\\lg n} = n$.',
    mistake: 'Answering $\\lg n$, which is the depth of the leaves, not how many there are.',
    tryIt: { q: 'How many leaves does the tree of $T(n) = 4T(n/2) + n$ have?', a: 'Depth $\\lg n$ again (size $n/2^i$), but 4 children per node: $4^{\\lg n} = (2^2)^{\\lg n} = (2^{\\lg n})^2 = n^2$ leaves. At $n = 8$: $4^3 = 64 = 8^2$.' },
  };

  H['c310-5-ms-levelcost'] = {
    asks: 'In merge sort’s tree, $T(n) = 2T(n/2) + cn$, what does a whole row (level $i$) cost, and why?',
    idea: 'Going down one row, the number of nodes doubles and each node’s piece halves. Doubling times halving cancels, so every row costs the same: one full pass over all $n$ elements.',
    steps: [
      'Nodes at depth $i$: $2^i$. Size of each: $n/2^i$.',
      'One node’s own work is $c$ times its size: $c \\cdot \\frac{n}{2^i}$.',
      'Row total $=$ (nodes) $\\times$ (cost per node) $= 2^i \\cdot \\frac{cn}{2^i} = cn$, because $2^i$ cancels.',
      { text: 'Row by row:', table: { head: ['depth $i$', 'nodes', 'cost per node', 'row total'], rows: [['0', '1', '$cn$', '$cn$'], ['1', '2', '$cn/2$', '$cn$'], ['2', '4', '$cn/4$', '$cn$'], ['3', '8', '$cn/8$', '$cn$']] } },
      'The leaf row fits too: $n$ leaves of $T(1) = c$ give $n \\cdot c = cn$.',
    ],
    tree: { ...MS_TREE, caption: 'More nodes, smaller pieces: the right column stays at $cn$ on every row, leaves included.' },
    graph: {
      caption: 'For $n = 16$, $c = 1$: node count $2^i$ climbs, cost per node $16/2^i$ falls, and their product stays at 16 on every row.',
      x: [0, 4], y: [0, 18], xLabel: 'depth i', yLabel: 'value',
      curves: [
        { label: 'nodes $2^i$', f: i => 2 ** i, tone: 'a' },
        { label: 'cost per node $16/2^i$', f: i => 16 / 2 ** i, tone: 'c' },
        { label: 'row total $2^i \\cdot 16/2^i = 16$', f: () => 16, tone: 'b' },
      ],
    },
    answer: '$cn$. Level $i$ has $2^i$ nodes, each a subproblem of size $n/2^i$ costing $c\\,n/2^i$; $2^i \\cdot c\\,n/2^i = cn$.',
    mistake: 'Answering $c\\,n/2^i$, which is one node’s cost. The level cost multiplies it by the $2^i$ nodes in that row.',
    tryIt: { q: 'What does row $i$ cost for $T(n) = 4T(n/2) + cn$?', a: '$4^i$ nodes of size $n/2^i$, each costing $cn/2^i$: $4^i \\cdot \\frac{cn}{2^i} = (\\tfrac{4}{2})^i cn = 2^i cn$. Rows double going down, so this time the leaves dominate.' },
  };

  H['c310-5-ms-total'] = {
    asks: 'Use the tree to get merge sort’s exact total cost, then its $\\Theta$ bound, and say in words why it comes out as $n \\lg n$.',
    idea: 'The tree is a stack of equal rows. Each row is one full pass over the $n$ elements ($cn$), and halving $n$ down to 1 takes $\\lg n$ steps. Rows times row cost is the whole cost.',
    steps: [
      'Rows: $\\lg n + 1$ (depths $0$ to $\\lg n$). Cost of each row: $cn$, leaves included.',
      'Total $= \\sum_{i=0}^{\\lg n} cn$. All terms are equal (a geometric series with $r = 1$), so it is (number of terms) $\\times$ (term) $= cn(\\lg n + 1) = cn \\lg n + cn$.',
      '$\\Theta$ sandwich for $n \\ge 2$: $cn \\lg n \\le cn \\lg n + cn$ (we added $cn \\ge 0$). Since $\\lg n \\ge 1$, $cn \\le cn \\lg n$, so $cn \\lg n + cn \\le 2cn \\lg n$.',
      'With $c_1 = c$, $c_2 = 2c$, $n_0 = 2$: $T(n) = \\Theta(n \\lg n)$.',
      { text: 'Check the exact formula with $c = 1$, $T(1) = 1$:', table: { head: ['$n$', '$T(n) = 2T(n/2) + n$', '$n(\\lg n + 1)$'], rows: [['2', '4', '$2 \\cdot 2 = 4$'], ['4', '12', '$4 \\cdot 3 = 12$'], ['8', '32', '$8 \\cdot 4 = 32$'], ['16', '80', '$16 \\cdot 5 = 80$']] } },
    ],
    tree: { ...MS_TREE, caption: '$\\lg n + 1$ rows, each costing $cn$: the right column adds to $cn(\\lg n + 1)$.' },
    graph: {
      caption: 'With $c = 1$: the exact cost $n(\\lg n + 1)$ stays between $n \\lg n$ and $2n \\lg n$ from $n = 2$ on. That band is the $\\Theta(n \\lg n)$ claim.',
      x: [2, 64], y: [0, 800], xLabel: 'n', yLabel: 'cost',
      curves: [
        { label: '$n \\lg n$', f: n => n * Math.log2(n), tone: 'c' },
        { label: '$T(n) = n(\\lg n + 1)$', f: n => n * (Math.log2(n) + 1), tone: 'a' },
        { label: '$2n \\lg n$', f: n => 2 * n * Math.log2(n), tone: 'b' },
      ],
    },
    answer: '$cn(\\lg n + 1) = cn \\lg n + cn = \\Theta(n \\lg n)$: $\\lg n$ levels of halving (plus the leaf row), and every level does linear merge work $cn$.',
    mistake: 'Counting $\\lg n$ rows instead of $\\lg n + 1$, which gives $cn \\lg n$. The $\\Theta$ is the same, but the exact cost also has the leaf row: $cn \\lg n + cn$.',
    tryIt: { q: 'Use a tree to find the exact cost of $T(n) = 4T(n/4) + cn$, $T(1) = c$, and its $\\Theta$.', a: 'Row $i$: $4^i \\cdot cn/4^i = cn$; leaves $4^{\\log_4 n} = n$ of cost $c$. Rows: $\\log_4 n + 1$. Total $cn(\\log_4 n + 1) = \\Theta(n \\lg n)$. At $n = 16$, $c = 1$: $16 \\cdot 3 = 48$.' },
  };

  H['c310-5-3T4-depth'] = {
    asks: 'For $T(n) = 3T(n/4) + cn^2$, $T(1) = 1$: what size is a subproblem at depth $i$, at what depth are the leaves, and how many levels does the tree have?',
    idea: 'Only the divisor 4 decides how fast pieces shrink; the 3 only decides how many pieces there are. Each step down divides the size by 4, so count how many divisions by 4 take $n$ to 1.',
    steps: [
      'Root: size $n$. Depth 1: $n/4$. Depth 2: $n/4/4 = n/16 = n/4^2$. So depth $i$ has size $n/4^i$.',
      'Leaves: set $n/4^i = 1$. Multiply by $4^i$: $4^i = n$. Take $\\log_4$ of both sides: $i = \\log_4 n$.',
      'The depths run $0, 1, \\dots, \\log_4 n$. Counting from 0 to $\\log_4 n$ gives $\\log_4 n + 1$ levels; the height is $\\log_4 n$.',
      { text: 'Check $n = 256$: $\\log_4 256 = 4$ (since $4^4 = 256$), so leaves at depth 4 and $5$ levels.', table: { head: ['depth $i$', '0', '1', '2', '3', '4'], rows: [['size $256/4^i$', '256', '64', '16', '4', '1']] } },
    ],
    tree: { ...T34_TREE, caption: 'Depth $i$ holds pieces of size $n/4^i$, each costing $c(n/4^i)^2$ (so $\\tfrac{cn^2}{16}$, then $\\tfrac{cn^2}{256}$). The leaf row is depth $\\log_4 n$.' },
    graph: {
      caption: 'Log scale. For $n = 256$ the size drops by a factor of 4 per row and reaches 1 at depth $\\log_4 256 = 4$.',
      x: [-0.5, 4.5], y: [0.5, 400], logY: true, xLabel: 'depth i', yLabel: 'subproblem size',
      bars: { label: 'size $256/4^i$', tone: 'b', values: [[0, 256], [1, 64], [2, 16], [3, 4], [4, 1]] },
      marks: [{ x: 4, label: '$i = \\log_4 256 = 4$' }],
    },
    answer: 'Size $n/4^i$ at depth $i$. It reaches 1 when $4^i = n$, i.e. $i = \\log_4 n$: height $\\log_4 n$, and $\\log_4 n + 1$ levels (depths $0$ to $\\log_4 n$).',
    mistake: 'Using 3 (the number of children) as the log base. The branching factor changes how many nodes a row has, never how fast the size shrinks.',
    tryIt: { q: 'For $T(n) = 7T(n/2) + n^2$: size at depth $i$, leaf depth, number of levels?', a: 'Size $n/2^i$; $n/2^i = 1 \\Rightarrow i = \\lg n$; so $\\lg n + 1$ levels. The 7 does not matter here, only the divisor 2.' },
  };

  H['c310-5-3T4-levelcost'] = {
    asks: 'For $T(n) = 3T(n/4) + cn^2$: how many nodes sit at depth $i$, what does each one cost, and what does that whole row cost (above the leaf row)?',
    idea: 'Going down a row, the node count triples, but each piece is a quarter the size and its cost is the size squared, so each node costs $1/16$ as much. Three times as many nodes at $1/16$ the price: each row costs $3/16$ of the row above.',
    steps: [
      'Nodes: each node has 3 children, so depth $i$ has $3^i$ nodes ($1, 3, 9, 27, \\dots$).',
      'Cost of one node: its size is $n/4^i$, and the work is $c \\cdot (\\text{size})^2 = c(n/4^i)^2$.',
      'Square the fraction: $(n/4^i)^2 = n^2/(4^i)^2 = n^2/4^{2i} = n^2/16^i$. So one node costs $cn^2/16^i$.',
      'Row total: $3^i \\cdot \\frac{cn^2}{16^i} = \\frac{3^i}{16^i}\\,cn^2 = (\\tfrac{3}{16})^i cn^2$.',
      { text: 'First rows:', table: { head: ['depth $i$', 'nodes $3^i$', 'cost per node', 'row total'], rows: [['0', '1', '$cn^2$', '$cn^2$'], ['1', '3', '$cn^2/16$', '$\\tfrac{3}{16}cn^2$'], ['2', '9', '$cn^2/256$', '$\\tfrac{9}{256}cn^2$'], ['3', '27', '$cn^2/4096$', '$\\tfrac{27}{4096}cn^2$']] } },
    ],
    tree: { ...T34_TREE, caption: 'Each row has 3 times the nodes at $1/16$ the cost per node, so the right column shrinks by $3/16$ per row.' },
    graph: {
      caption: 'Row totals in units of $cn^2$: $1, 0.1875, 0.035, 0.0066, \\dots$ The root row is most of the tree.',
      x: [-0.5, 4.5], y: [0, 1.05], xLabel: 'depth i', yLabel: 'row total (× cn²)',
      bars: { label: 'row total $(3/16)^i$', tone: 'b', values: [[0, 1], [1, 3 / 16], [2, 9 / 256], [3, 27 / 4096], [4, 81 / 65536]] },
    },
    answer: '$3^i$ nodes, each costing $c(n/4^i)^2 = cn^2/16^i$. Row total $3^i \\cdot c(n/4^i)^2 = (3/16)^i\\,cn^2$.',
    mistake: 'Forgetting to square the 4: writing $c(n/4^i)^2 = cn^2/4^i$, which gives $(3/4)^i$. Squaring $n/4^i$ squares both the top and the bottom.',
    tryIt: { q: 'Row $i$ cost for $T(n) = 2T(n/4) + cn^2$?', a: '$2^i$ nodes, each $c(n/4^i)^2 = cn^2/16^i$. Row total $\\frac{2^i}{16^i}cn^2 = (\\tfrac{1}{8})^i cn^2$.' },
  };

  H['c310-5-3T4-leaves'] = {
    asks: 'For $T(n) = 3T(n/4) + cn^2$, $T(1) = 1$: how many leaves are there, and what do they cost all together?',
    idea: 'The leaves are the bottom row. Tripling once per row for $\\log_4 n$ rows gives $3^{\\log_4 n}$ leaves. Rewritten as a power of $n$, that is about $n^{0.79}$: fewer than $n$, since the tree branches 3 ways but shrinks 4 ways.',
    steps: [
      'Depth $i$ has $3^i$ nodes, and the leaves are at depth $\\log_4 n$. So there are $3^{\\log_4 n}$ leaves.',
      'Rewrite 3 as a power of 4: $3 = 4^{\\log_4 3}$. Then $3^{\\log_4 n} = (4^{\\log_4 3})^{\\log_4 n} = 4^{\\log_4 3 \\cdot \\log_4 n}$.',
      'Swap the order of the two exponents: $4^{\\log_4 n \\cdot \\log_4 3} = (4^{\\log_4 n})^{\\log_4 3} = n^{\\log_4 3}$, because $4^{\\log_4 n} = n$.',
      { text: '$\\log_4 3 = \\ln 3 / \\ln 4 \\approx 0.7925$. Check with powers of 4:', table: { head: ['$n$', '4', '16', '64', '256'], rows: [['leaves $3^{\\log_4 n}$', '3', '9', '27', '81'], ['$n^{\\log_4 3}$', '3', '9', '27', '81']] } },
      'Each leaf is $T(1) = 1$, so the leaf row costs $n^{\\log_4 3} \\cdot 1 = \\Theta(n^{\\log_4 3})$. That is below the root’s $cn^2$, since $\\log_4 3 < 2$.',
    ],
    tree: { ...T34_TREE, caption: 'The bottom row: $3^{\\log_4 n} = n^{\\log_4 3}$ leaves, each $T(1) = 1$.' },
    graph: {
      caption: 'Leaf count $n^{\\log_4 3}$ against $n$: at $n = 256$ there are only 81 leaves. The bars are $3^{\\log_4 n}$ counted directly; they sit on the curve.',
      x: [1, 256], y: [0, 260], xLabel: 'n', yLabel: 'count',
      curves: [
        { label: '$n^{\\log_4 3} \\approx n^{0.79}$', f: n => n ** (Math.log(3) / Math.log(4)), tone: 'a' },
        { label: '$n$', f: n => n, tone: 'c' },
      ],
      bars: { label: '$3^{\\log_4 n}$ at $n = 4, 16, 64, 256$', tone: 'b', values: [[4, 3], [16, 9], [64, 27], [256, 81]] },
    },
    answer: '$3^{\\log_4 n} = n^{\\log_4 3} \\approx n^{0.79}$ leaves, each costing $T(1) = 1$: total $\\Theta(n^{\\log_4 3})$.',
    mistake: 'Saying "$n$ leaves" as in merge sort. That only happens when the branching equals the divisor ($a = b$); here $a = 3 < 4 = b$, so there are fewer.',
    tryIt: { q: 'How many leaves does $T(n) = 2T(n/4) + n^2$ have?', a: 'Leaves at depth $\\log_4 n$, so $2^{\\log_4 n} = n^{\\log_4 2} = n^{1/2} = \\sqrt{n}$ (since $4^{1/2} = 2$). At $n = 16$: $2^2 = 4 = \\sqrt{16}$.' },
  };

  H['c310-5-log-identity'] = {
    asks: 'Write $3^{\\log_4 n}$ as $n$ to some power, and give that power exactly.',
    idea: 'The base and the number inside the log can trade places: $a^{\\log_b n} = n^{\\log_b a}$. To see why, take a log of both sides; you get the same two logs multiplied, just in the other order.',
    steps: [
      'Claim: $3^{\\log_4 n} = n^{\\log_4 3}$.',
      'Take $\\log_4$ of the left side. The rule $\\log(x^y) = y \\log x$ brings the exponent down: $\\log_4(3^{\\log_4 n}) = \\log_4 n \\cdot \\log_4 3$.',
      'Take $\\log_4$ of the right side the same way: $\\log_4(n^{\\log_4 3}) = \\log_4 3 \\cdot \\log_4 n$.',
      'Both are the same product. Two positive numbers with the same $\\log_4$ are equal, so $3^{\\log_4 n} = n^{\\log_4 3}$.',
      { text: 'Numerically $\\log_4 3 = \\ln 3 / \\ln 4 \\approx 0.7925$. Check:', table: { head: ['$n$', '$\\log_4 n$', '$3^{\\log_4 n}$', '$n^{0.7925}$'], rows: [['16', '2', '9', '9.0'], ['64', '3', '27', '27.0'], ['256', '4', '81', '81.0']] } },
    ],
    graph: {
      caption: 'The curve is $n^{\\log_4 3}$; the bars are $3^{\\log_4 n}$ computed directly at $n = 4, 16, 64$. They land on the curve.',
      x: [1, 70], y: [0, 30], xLabel: 'n', yLabel: 'value',
      curves: [{ label: '$n^{\\log_4 3}$', f: n => n ** (Math.log(3) / Math.log(4)), tone: 'a' }],
      bars: { label: '$3^{\\log_4 n}$', tone: 'b', values: [[4, 3], [16, 9], [64, 27]] },
    },
    answer: '$\\log_4 3$ (about $0.7925$): $3^{\\log_4 n} = n^{\\log_4 3}$.',
    mistake: 'Answering $\\log_3 4$ (about 1.26), with base and argument flipped. The base of the log stays 4; only the 3 and the $n$ swap.',
    tryIt: { q: '$8^{\\lg n}$ equals $n$ to what power?', a: '$8^{\\log_2 n} = n^{\\log_2 8} = n^3$. Check $n = 4$: $8^2 = 64 = 4^3$.' },
  };

  H['c310-5-3T4-sum'] = {
    asks: 'The tree for $T(n) = 3T(n/4) + cn^2$ gives $T(n) = \\sum_{i=0}^{\\log_4 n - 1} (3/16)^i cn^2 + \\Theta(n^{\\log_4 3})$. Bound that sum by something simple, and give the resulting big-O.',
    idea: 'Row costs shrink by $3/16$ each time, so the first row is almost everything. Adding the rows forever would still give only a little more than the first row. Since an upper bound may overcount, add them forever and use the simple infinite-sum formula.',
    steps: [
      'Pull out the constant factor: $\\sum_{i=0}^{\\log_4 n - 1} (\\tfrac{3}{16})^i cn^2 = cn^2 \\sum_{i=0}^{\\log_4 n - 1} (\\tfrac{3}{16})^i$.',
      'Every term is positive, so stopping at $\\log_4 n - 1$ gives less than never stopping: $\\sum_{i=0}^{\\log_4 n - 1} (\\tfrac{3}{16})^i < \\sum_{i=0}^{\\infty} (\\tfrac{3}{16})^i$.',
      'Infinite geometric series: $\\sum_{i=0}^{\\infty} r^i = \\frac{1}{1 - r}$ when $r < 1$. Here $r = \\tfrac{3}{16} < 1$, so the sum is $\\frac{1}{1 - 3/16} = \\frac{1}{13/16} = \\frac{16}{13} \\approx 1.23$.',
      { text: 'The partial sums creep up to $16/13$ and never pass it:', table: { head: ['last $i$', '0', '1', '2', '3', '$\\infty$'], rows: [['sum', '1', '1.1875', '1.2227', '1.2292', '$16/13 \\approx 1.2308$']] } },
      'So $T(n) < \\tfrac{16}{13}cn^2 + \\Theta(n^{\\log_4 3})$. Since $\\log_4 3 \\approx 0.79 < 2$, the second term is $O(n^2)$ too, and $T(n) = O(n^2)$.',
    ],
    tree: { ...T34_TREE, caption: 'The right column is a decreasing geometric series with ratio $3/16$, plus the leaf row. The root’s $cn^2$ dominates.' },
    graph: {
      caption: 'Bars: the sum of the first rows (units of $cn^2$). They level off just under the line $16/13$, the bound for any number of rows.',
      x: [-0.5, 5.5], y: [0, 1.4], xLabel: 'last depth added', yLabel: 'sum (× cn²)',
      bars: { label: '$\\sum_{i=0}^{k} (3/16)^i$', tone: 'b', values: [[0, 1], [1, 1.1875], [2, 1.22265625], [3, 1.229248046875], [4, 1.2304840087890625], [5, 1.2307157516479492]] },
      curves: [{ label: '$16/13$', f: () => 16 / 13, tone: 'a' }],
    },
    answer: 'Bound the finite decreasing geometric series by the infinite one: $\\sum_{i=0}^{\\infty} (3/16)^i = \\frac{1}{1 - 3/16} = \\frac{16}{13}$. So $T(n) < \\frac{16}{13}cn^2 + \\Theta(n^{\\log_4 3}) = O(n^2)$.',
    mistake: 'Using $\\frac{1}{1 - r}$ when $r \\ge 1$. It only works because $3/16 < 1$; with $r \\ge 1$ the infinite sum has no finite value and you must use the finite formula.',
    tryIt: { q: 'For $T(n) = 2T(n/4) + cn^2$, $T(1) = 1$, the rows cost $(1/8)^i cn^2$. Bound $T(n)$.', a: '$r = \\tfrac18 < 1$, so the rows sum to less than $\\frac{1}{1 - 1/8} = \\frac{8}{7}$ times $cn^2$. Leaves: $2^{\\log_4 n} = \\sqrt{n}$. So $T(n) < \\tfrac{8}{7}cn^2 + \\Theta(\\sqrt{n}) = O(n^2)$.' },
  };
})(globalThis.FC = globalThis.FC || {});
