// Help walkthroughs for the CSC 310 Lecture 5 recursion-tree cards (FC.csc310Cards, sub
// 'Recursion trees'): the 3T(n/4) + cn^2 tight bound, geometric series, which level dominates,
// depth and leaf count of aT(n/b) + f(n), uneven splits, and two practice trees.
// Same format as decks/csc310-help.js. Every number, sum, depth, bound and tryIt answer was
// checked with python3 (fractions, mpmath) on 2026-10-16.
// ACADEMIC INTEGRITY: Assignment 2's recurrence and its split are never used here. The uneven
// cards teach on their own 1/4–3/4 split; every uneven tryIt uses 1/5–4/5.
(function (FC) {
  'use strict';
  const H = FC.help = FC.help || {};

  // ---------------------------------------------------------------- shared pictures

  // T(n) = T(n/4) + T(3n/4) + cn, nodes labelled by subproblem size.
  const UNEVEN_TREE = {
    sumsLabel: 'sizes add to',
    levels: [
      { nodes: ['$n$'], sum: '$n$' },
      { nodes: ['$\\tfrac{n}{4}$', '$\\tfrac{3n}{4}$'], sum: '$n$' },
      { nodes: ['$\\tfrac{n}{16}$', '$\\tfrac{3n}{16}$', '$\\tfrac{3n}{16}$', '$\\tfrac{9n}{16}$'], sum: '$n$' },
      { gap: true },
      { nodes: ['$1$', '$\\cdots$', '$\\cdots$', '$\\cdots$'], sum: '$n$' },
      { gap: true },
      { nodes: ['$\\cdots$', '$1$'], sum: '$< n$' },
    ],
  };

  // Size along the two edges of that tree for n = 256 (log scale: both are straight lines).
  const EDGE_PATHS = {
    x: [0, 21], y: [0.5, 400], logY: true, xLabel: 'depth i', yLabel: 'size',
    curves: [
      { label: 'left edge: $256/4^i$', f: i => 256 / 4 ** i, tone: 'a' },
      { label: 'right edge: $256\\,(3/4)^i$', f: i => 256 * 0.75 ** i, tone: 'b' },
    ],
    marks: [{ x: 4, label: '$4$' }, { x: Math.log(256) / Math.log(4 / 3), label: '$19.3$' }],
  };

  // Generic aT(n/b) + f(n) tree, nodes labelled by subproblem size.
  const GEN_NODES = [
    ['$n$'],
    ['$\\tfrac{n}{b}$', '$\\tfrac{n}{b}$', '$\\cdots$', '$\\tfrac{n}{b}$'],
    ['$\\tfrac{n}{b^2}$', '$\\tfrac{n}{b^2}$', '$\\cdots$', '$\\tfrac{n}{b^2}$', '$\\tfrac{n}{b^2}$'],
    null,
    ['$1$', '$1$', '$\\cdots$', '$1$', '$1$'],
  ];
  const genTree = (sumsLabel, sums, caption) => ({
    sumsLabel, caption,
    levels: GEN_NODES.map((nodes, r) => nodes ? { nodes, sum: sums[r] } : { gap: true }),
  });

  // Exact total for T(m) = T(m/4) + T(3m/4) + m, T(m) = 1 for m <= 1 (c = 1), memoised on
  // (number of 1/4 steps, number of 3/4 steps).
  const unevenT = n => {
    const memo = new Map();
    const go = (j, k) => {
      const key = j * 1024 + k;
      if (memo.has(key)) return memo.get(key);
      const m = n * 0.25 ** j * 0.75 ** k;
      const v = m <= 1 ? 1 : m + go(j + 1, k) + go(j, k + 1);
      memo.set(key, v);
      return v;
    };
    return go(0, 0);
  };

  // ---------------------------------------------------------------- 3T(n/4) + cn^2, geometric series

  H['c310-5-3T4-tight'] = {
    asks: 'The tree for $T(n) = 3T(n/4) + cn^2$ already gave a ceiling, $T(n) = O(n^2)$. Explain why the answer is the sharper $\\Theta(n^2)$: you need a matching floor.',
    idea: 'Every node costs something positive, so the whole tree costs at least as much as any single node. The root alone costs $cn^2$. A floor of $cn^2$ and a ceiling of about $\\tfrac{16}{13}cn^2$ trap $T(n)$ between two multiples of $n^2$.',
    tree: {
      sumsLabel: 'level total',
      levels: [
        { nodes: ['$cn^2$'], sum: '$cn^2$' },
        { nodes: ['$\\tfrac{cn^2}{16}$', '$\\tfrac{cn^2}{16}$', '$\\tfrac{cn^2}{16}$'], sum: '$\\tfrac{3}{16}cn^2$' },
        { nodes: ['$\\tfrac{cn^2}{256}$', '$\\tfrac{cn^2}{256}$', '$\\cdots$', '$\\tfrac{cn^2}{256}$'], sum: '$(\\tfrac{3}{16})^2 cn^2$' },
        { gap: true },
        { nodes: ['$T(1)$', '$T(1)$', '$\\cdots$', '$T(1)$'], sum: '$\\Theta(n^{\\log_4 3})$' },
      ],
      caption: 'Level 2 has $9$ nodes, each of size $n/16$. Every internal level below the root adds up to only $\\tfrac{3}{13}cn^2$, far less than the root’s $cn^2$.',
    },
    steps: [
      'Ceiling (previous card): $T(n) < \\tfrac{16}{13}cn^2 + \\Theta(n^{\\log_4 3})$. Since $\\log_4 3 \\approx 0.79 < 2$, the leaf term grows slower than $n^2$, so $T(n) = O(n^2)$.',
      'Floor: $T(n)$ is the sum of all node costs, and no node costs less than 0. Throw away every node except the root: $T(n) \\ge cn^2$.',
      'That is the $\\Omega$ definition with constant $c$ and $n_0 = 1$: $T(n) \\ge c \\cdot n^2$ for all $n \\ge 1$, so $T(n) = \\Omega(n^2)$.',
      { text: 'In units of $cn^2$, level $i$ costs $(3/16)^i$, and the running total creeps toward $16/13$:', table: { head: ['depth $i$', 'level cost', 'running total'], rows: [['$0$', '$1$', '$1$'], ['$1$', '$\\tfrac{3}{16} = 0.1875$', '$1.1875$'], ['$2$', '$\\tfrac{9}{256} \\approx 0.0352$', '$1.2227$'], ['$3$', '$\\tfrac{27}{4096} \\approx 0.0066$', '$1.2292$'], ['all', '', '$\\tfrac{16}{13} \\approx 1.2308$']] } },
      '$O(n^2)$ and $\\Omega(n^2)$ together give $\\Theta(n^2)$. The root is $\\frac{1}{16/13} = \\frac{13}{16} \\approx 81\\%$ of the ceiling, which is why the root decides the answer.',
    ],
    graph: {
      caption: 'Bars: each level’s cost in units of $cn^2$. Curve: the running total. It starts at 1 (the root, the floor) and never passes $16/13$ (the ceiling).',
      x: [-0.5, 6], y: [0, 1.4], xLabel: 'depth i', yLabel: 'cost / cn²',
      curves: [{ label: 'running total', f: i => (1 - (3 / 16) ** (i + 1)) / (13 / 16), tone: 'a' }, { label: 'ceiling $16/13$', f: () => 16 / 13, tone: 'c' }],
      bars: { label: 'level cost $(3/16)^i$', tone: 'b', values: [[0, 1], [1, 3 / 16], [2, 9 / 256], [3, 27 / 4096], [4, 81 / 65536], [5, 243 / 1048576]] },
    },
    answer: 'The root alone costs $cn^2$, so $T(n) \\ge cn^2$, i.e. $\\Omega(n^2)$. With the tree’s $O(n^2)$ ceiling, $T(n) = \\Theta(n^2)$.',
    mistake: 'Stopping at $O(n^2)$ and calling it tight. $O$ is only a ceiling; $\\Theta$ also needs a floor, and here the floor is one line: the root.',
    tryIt: { q: 'The tree for $T(n) = 2T(n/4) + cn^2$ has level costs $(1/8)^i cn^2$. Give a ceiling, a floor, and $\\Theta$.', a: 'Ceiling: $cn^2 \\cdot \\frac{1}{1 - 1/8} = \\tfrac{8}{7}cn^2$, plus $2^{\\log_4 n} = n^{1/2}$ leaves: $O(n^2)$. Floor: the root, $cn^2$: $\\Omega(n^2)$. So $\\Theta(n^2)$.' },
  };

  H['c310-5-geom-formulas'] = {
    asks: 'Give the shortcut formulas for $1 + r + r^2 + \\dots + r^k$ (stopping at $r^k$), and for the same sum continued forever when $|r| < 1$.',
    idea: 'Recursion-tree level costs are usually geometric: each level is the one above times the same ratio $r$. Multiply the sum by $r$ and every term slides one place right; subtract, and all the middle terms cancel, leaving only the two ends.',
    steps: [
      'Name the sum: $S = 1 + r + r^2 + \\dots + r^k$. Multiply both sides by $r$: $rS = r + r^2 + \\dots + r^k + r^{k+1}$.',
      'Subtract the first line from the second. Every term from $r$ to $r^k$ is in both and cancels: $rS - S = r^{k+1} - 1$.',
      'Factor the left side: $S(r - 1) = r^{k+1} - 1$. Divide by $r - 1$, allowed because $r \\ne 1$: $S = \\frac{r^{k+1} - 1}{r - 1}$.',
      { text: 'Check against adding by hand, with $k = 3$:', table: { head: ['$r$', 'by hand', 'formula'], rows: [['$\\tfrac12$', '$1 + \\tfrac12 + \\tfrac14 + \\tfrac18 = \\tfrac{15}{8}$', '$\\frac{1/16 - 1}{1/2 - 1} = \\frac{-15/16}{-1/2} = \\tfrac{15}{8}$'], ['$2$', '$1 + 2 + 4 + 8 = 15$', '$\\frac{16 - 1}{2 - 1} = 15$']] } },
      'Forever, with $|r| < 1$: as $k$ grows, $r^{k+1}$ shrinks to 0, so $S \\to \\frac{0 - 1}{r - 1} = \\frac{1}{1 - r}$. For $r = \\tfrac12$: $\\frac{1}{1 - 1/2} = 2$.',
      { text: 'What $r$ says about a recursion tree whose level costs have ratio $r$:', table: { head: ['ratio', 'sum of the $k + 1$ levels', 'which level dominates'], rows: [['$r < 1$', 'less than $\\frac{1}{1 - r} \\times$ first', 'the root'], ['$r = 1$', 'exactly $(k + 1) \\times$ one level', 'none: all equal'], ['$r > 1$', 'less than $\\frac{r}{r - 1} \\times$ last', 'the leaves']] } },
    ],
    graph: {
      caption: 'Running sums $1 + r + \\dots + r^k$. With $r = \\tfrac12$ the sum flattens out under 2 (the first term carries it); with $r = 1$ it grows by 1 each step; with $r = 2$ each new term is bigger than all earlier ones together, and the curve leaves the chart.',
      x: [0, 8], y: [0, 12], xLabel: 'k', yLabel: 'sum',
      curves: [
        { label: '$r = \\tfrac12$: $2 - (\\tfrac12)^k$', f: k => 2 - 0.5 ** k, tone: 'a' },
        { label: '$r = 1$: $k + 1$', f: k => k + 1, tone: 'b' },
        { label: '$r = 2$: $2^{k+1} - 1$', f: k => 2 ** (k + 1) - 1, tone: 'c' },
      ],
    },
    answer: 'Finite ($r \\ne 1$): $\\sum_{i=0}^{k} r^i = \\frac{r^{k+1} - 1}{r - 1}$. Infinite ($|r| < 1$): $\\sum_{i=0}^{\\infty} r^i = \\frac{1}{1 - r}$.',
    mistake: 'Writing $r^k$ instead of $r^{k+1}$: the sum has $k + 1$ terms, $r^0$ to $r^k$. Test with $k = 0$: the sum is $1$, and $\\frac{r^1 - 1}{r - 1} = 1$.',
    tryIt: { q: 'Evaluate $\\sum_{i=0}^{5} 3^i$ and $\\sum_{i=0}^{\\infty} (1/5)^i$.', a: '$\\frac{3^6 - 1}{3 - 1} = \\frac{728}{2} = 364$ (by hand: $1 + 3 + 9 + 27 + 81 + 243 = 364$). And $\\frac{1}{1 - 1/5} = \\frac{5}{4}$.' },
  };

  H['c310-5-dominant-level'] = {
    asks: 'Each level of a recursion tree costs the same fraction (less than 1) of the level above. Which part of the tree decides the $\\Theta$ of the total: the root, the leaves, or every level equally?',
    idea: 'Picture a ball whose every bounce is half as high as the one before: the first bounce is as tall as all the later bounces put together. Shrinking level costs behave the same way, so the top level is a fixed fraction of the whole tree.',
    tree: {
      sumsLabel: 'level total',
      levels: [
        { nodes: ['$cn$'], sum: '$cn$' },
        { nodes: ['$\\tfrac{cn}{4}$', '$\\tfrac{cn}{4}$'], sum: '$\\tfrac{cn}{2}$' },
        { nodes: ['$\\tfrac{cn}{16}$', '$\\tfrac{cn}{16}$', '$\\tfrac{cn}{16}$', '$\\tfrac{cn}{16}$'], sum: '$\\tfrac{cn}{4}$' },
        { gap: true },
        { nodes: ['$T(1)$', '$T(1)$', '$\\cdots$', '$T(1)$'], sum: '$\\Theta(\\sqrt{n})$' },
      ],
      caption: '$T(n) = 2T(n/4) + cn$: each level costs half the one above, so the root alone is half of the $2cn$ ceiling.',
    },
    steps: [
      'Example: $T(n) = 2T(n/4) + cn$. Depth $i$ has $2^i$ nodes, each costing $cn/4^i$, so the level costs $2^i \\cdot \\frac{cn}{4^i} = (\\tfrac{2}{4})^i cn = \\frac{cn}{2^i}$.',
      'Bound the finite sum by the infinite one: $cn(1 + \\tfrac12 + \\tfrac14 + \\dots) < cn \\cdot \\frac{1}{1 - 1/2} = 2cn$. The leaves add $2^{\\log_4 n} = n^{\\log_4 2} = n^{1/2}$, which grows slower than $n$.',
      'So $cn \\le T(n) < 2cn + \\Theta(\\sqrt{n})$. The root alone is half the ceiling, and $T(n) = \\Theta(n)$, the root’s cost.',
      { text: 'The ratio between neighbouring levels picks the winner:', table: { head: ['recurrence', 'level $i$', 'ratio', 'dominates', 'total'], rows: [['$2T(n/4) + cn$', '$cn/2^i$', '$\\tfrac12$', 'root', '$\\Theta(n)$'], ['$2T(n/2) + cn$', '$cn$', '$1$', 'all equal', '$\\Theta(n \\lg n)$'], ['$2T(n/2) + 1$', '$2^i$', '$2$', 'leaves', '$\\Theta(n)$']] } },
      'Rule: ratio $< 1$ gives $\\Theta$(root cost); ratio $= 1$ gives (cost of one level) $\\times$ (number of levels); ratio $> 1$ gives $\\Theta$(leaf level).',
    ],
    graph: {
      caption: 'Level cost as a multiple of the root’s cost. Shrinking (ratio $\\tfrac12$): the root is the biggest. Flat (ratio 1): all tie. Growing (ratio 2): the bottom is the biggest.',
      x: [0, 6], y: [0, 8], xLabel: 'depth i', yLabel: 'level / root',
      curves: [
        { label: 'ratio $\\tfrac12$', f: i => 0.5 ** i, tone: 'a' },
        { label: 'ratio $1$', f: () => 1, tone: 'b' },
        { label: 'ratio $2$', f: i => 2 ** i, tone: 'c' },
      ],
    },
    answer: 'The root (level 0). Shrinking level costs add up to at most $\\frac{1}{1 - r}$ times the root’s cost, a constant multiple, so the total is $\\Theta$(root cost).',
    mistake: 'Choosing the leaves because there are the most of them. Count cost, not nodes: in $2T(n/4) + cn$ all $\\sqrt{n}$ leaves together cost far less than the root’s $cn$.',
    tryIt: { q: 'Which level dominates $T(n) = 3T(n/4) + cn$, and what is its $\\Theta$?', a: 'Level $i$: $3^i \\cdot \\frac{cn}{4^i} = (\\tfrac34)^i cn$, shrinking, so the root dominates. Total $< \\frac{cn}{1 - 3/4} = 4cn$ plus $n^{\\log_4 3} \\approx n^{0.79}$ leaves: $\\Theta(n)$.' },
  };

  // ---------------------------------------------------------------- aT(n/b) + f(n): depth, leaves

  H['c310-5-general-depth'] = {
    asks: 'In the tree for $T(n) = aT(n/b) + f(n)$, every call cuts its problem into pieces $b$ times smaller. How many levels down do the pieces reach size 1?',
    idea: 'Each step down divides the size by $b$ once more. So the question is: how many times can you divide $n$ by $b$ before you reach 1? That count is exactly what $\\log_b n$ means.',
    tree: genTree('size of each node', ['$n$', '$n/b$', '$n/b^2$', null, '$1$'], 'Width comes from $a$ (children per node); depth comes only from $b$.'),
    steps: [
      { text: 'Write the size at each depth:', table: { head: ['depth', '$0$', '$1$', '$2$', '$3$', '$i$'], rows: [['size', '$n$', '$n/b$', '$n/b^2$', '$n/b^3$', '$n/b^i$']] } },
      'Leaves have size 1, so set $n/b^i = 1$. Multiply both sides by $b^i$: $n = b^i$.',
      '$b^i = n$ asks "which power of $b$ gives $n$?", and that power is the definition of $\\log_b n$. So $i = \\log_b n$.',
      'Check with $n = 64$, $b = 4$: $64 \\to 16 \\to 4 \\to 1$ is 3 steps, and $\\log_4 64 = 3$ because $4^3 = 64$. With $b = 2$: $64 \\to 32 \\to 16 \\to 8 \\to 4 \\to 2 \\to 1$ is 6 steps, and $\\lg 64 = 6$.',
      'The number of children $a$ never entered the calculation. $a$ sets how wide the tree is; $b$ sets how deep.',
    ],
    graph: {
      caption: 'Node size against depth for $n = 64$. Dividing by 4 each level hits 1 at depth 3; dividing by 2 takes until depth 6.',
      x: [0, 7], y: [0, 64], xLabel: 'depth i', yLabel: 'size',
      curves: [{ label: '$b = 2$: $64/2^i$', f: i => 64 / 2 ** i, tone: 'a' }, { label: '$b = 4$: $64/4^i$', f: i => 64 / 4 ** i, tone: 'b' }],
      marks: [{ x: 3, label: '$\\log_4 64$' }, { x: 6, label: '$\\lg 64$' }],
    },
    answer: 'Depth $\\log_b n$: the size at depth $i$ is $n/b^i$, and $n/b^i = 1 \\iff b^i = n \\iff i = \\log_b n$. Counting the root, that is $\\log_b n + 1$ levels.',
    mistake: 'Using $a$ as the base, $\\log_a n$. The depth comes from how fast the size shrinks, which is $b$; $a$ only multiplies the number of nodes.',
    tryIt: { q: 'For $T(n) = 7T(n/5) + n^2$, at what depth are the leaves? Evaluate it for $n = 625$.', a: 'Size at depth $i$ is $n/5^i$; $n/5^i = 1 \\iff i = \\log_5 n$. For $n = 625 = 5^4$: depth 4 ($625 \\to 125 \\to 25 \\to 5 \\to 1$).' },
  };

  H['c310-5-general-leaves'] = {
    asks: 'Count the leaves of the tree for $T(n) = aT(n/b) + f(n)$, and write the count as $n$ raised to some power.',
    idea: 'Every node has $a$ children, so each level has $a$ times as many nodes as the one above. At the leaf depth that gives $a^{\\text{depth}}$ leaves; one log identity then turns it into a power of $n$.',
    tree: genTree('nodes on level', ['$1$', '$a$', '$a^2$', null, '$a^{\\log_b n}$'], 'Each level multiplies the node count by $a$. The bottom row sits at depth $\\log_b n$.'),
    steps: [
      'Nodes per level: $1, a, a^2, \\dots$, so depth $i$ has $a^i$ nodes. The leaves are at depth $\\log_b n$ (previous card), so there are $a^{\\log_b n}$ of them.',
      'Write $a$ as a power of $b$. By the definition of log, $a = b^{\\log_b a}$.',
      'Substitute, then use $(x^p)^q = x^{pq}$ twice: $a^{\\log_b n} = (b^{\\log_b a})^{\\log_b n} = b^{\\log_b a \\cdot \\log_b n} = (b^{\\log_b n})^{\\log_b a}$.',
      'Since $b^{\\log_b n} = n$, the last expression is $n^{\\log_b a}$. So $a^{\\log_b n} = n^{\\log_b a}$.',
      { text: 'Check with numbers:', table: { head: ['$a, b$', '$n$', '$a^{\\log_b n}$', '$n^{\\log_b a}$'], rows: [['$3, 4$', '$256$', '$3^4 = 81$', '$256^{\\log_4 3} = 81$'], ['$2, 2$', '$64$', '$2^6 = 64$', '$64^1 = 64$'], ['$4, 2$', '$8$', '$4^3 = 64$', '$8^2 = 64$']] } },
    ],
    graph: {
      caption: 'Leaf count against $n$ (log scale). Merge sort ($a = b = 2$) has $n$ leaves; $3T(n/4)$ has fewer than $n$; $4T(n/2)$ has $n^2$.',
      x: [1, 64], y: [1, 5000], logY: true, xLabel: 'n', yLabel: 'leaves',
      curves: [
        { label: '$a = 3, b = 4$: $n^{\\log_4 3}$', f: n => n ** (Math.log(3) / Math.log(4)), tone: 'a' },
        { label: '$a = 2, b = 2$: $n$', f: n => n, tone: 'b' },
        { label: '$a = 4, b = 2$: $n^2$', f: n => n * n, tone: 'c' },
      ],
    },
    answer: '$a^{\\log_b n} = n^{\\log_b a}$ leaves. This $n^{\\log_b a}$ is exactly what the master theorem compares $f(n)$ against.',
    mistake: 'Swapping base and argument: $n^{\\log_a b}$. Merge sort ($a = b$) cannot catch it, so test $a = 4, b = 2$: $n^{\\log_2 4} = n^2$ is right, $n^{\\log_4 2} = \\sqrt{n}$ is wrong.',
    tryIt: { q: 'How many leaves does the tree for $T(n) = 32T(n/4) + n$ have? Check your formula at $n = 16$.', a: '$32^{\\log_4 n} = n^{\\log_4 32} = n^{5/2}$, since $4^{5/2} = 2^5 = 32$. At $n = 16$: depth $\\log_4 16 = 2$, so $32^2 = 1024$ leaves, and $16^{5/2} = 4^5 = 1024$.' },
  };

  // ---------------------------------------------------------------- uneven split T(n/4) + T(3n/4) + cn

  H['c310-5-uneven-shallow'] = {
    asks: 'In the tree for $T(n) = T(n/4) + T(3n/4) + cn$, branches end at different depths. How deep is the leaf closest to the root?',
    idea: 'Every node splits into a small piece ($\\tfrac14$) and a big piece ($\\tfrac34$). The fastest way down to size 1 is to take the small piece every time, so the shortest path runs down the left edge of the tree.',
    tree: { ...UNEVEN_TREE, caption: 'Left edge: $n, \\tfrac{n}{4}, \\tfrac{n}{16}, \\dots$ reaches $1$ first, at depth $\\log_4 n$. Right edge: $n, \\tfrac{3n}{4}, \\tfrac{9n}{16}, \\dots$ reaches $1$ last, at depth $\\log_{4/3} n$.' },
    steps: [
      'Label nodes by size: the root is $n$, and a node of size $m$ has children $\\tfrac{m}{4}$ and $\\tfrac{3m}{4}$.',
      'The path that takes $\\tfrac14$ every time has size $n/4^i$ at depth $i$. Every other node at depth $i$ is bigger, because it took a $\\tfrac34$ somewhere.',
      'Set the left-edge size to 1: $n/4^i = 1 \\Rightarrow 4^i = n \\Rightarrow i = \\log_4 n$.',
      { text: 'Check with $n = 256$ down the left edge ($\\log_4 256 = 4$ because $4^4 = 256$):', table: { head: ['depth', '$0$', '$1$', '$2$', '$3$', '$4$'], rows: [['size', '$256$', '$64$', '$16$', '$4$', '$1$']] } },
      'Above this depth no branch has ended yet, so every level is complete. That is why $\\log_4 n$ is the depth used for the lower bound.',
    ],
    graph: { ...EDGE_PATHS, caption: 'Size along each edge for $n = 256$ (log scale). The left edge hits 1 at depth $\\log_4 256 = 4$; the right edge only at depth $\\log_{4/3} 256 \\approx 19.3$.' },
    answer: '$\\log_4 n$. The leftmost path always takes $n/4$, so its size is $n/4^i$, which reaches 1 at $i = \\log_4 n$.',
    mistake: 'Answering $\\lg n$ because each node has 2 children. The number of children does not set the depth; the shrink factor along the path does, and the fastest shrink here is 4.',
    tryIt: { q: 'For $T(n) = T(n/5) + T(4n/5) + n$, how deep is the shallowest leaf? Evaluate it for $n = 625$.', a: 'Always take $n/5$: size $n/5^i = 1 \\Rightarrow i = \\log_5 n$. For $n = 625$: $625 \\to 125 \\to 25 \\to 5 \\to 1$, depth 4.' },
  };

  H['c310-5-uneven-deep'] = {
    asks: 'Same tree, $T(n) = T(n/4) + T(3n/4) + cn$. How deep is the leaf farthest from the root?',
    idea: 'The slowest way down is to keep the big piece every time, losing only a quarter of the size per step. That is the right edge of the tree, and it is the longest branch.',
    tree: { ...UNEVEN_TREE, caption: 'The right edge keeps $\\tfrac34$ each step: $n, \\tfrac{3n}{4}, \\tfrac{9n}{16}, \\dots$ It is the last branch to reach size $1$.' },
    steps: [
      'Taking $\\tfrac34$ every time gives size $(\\tfrac34)^i n$ at depth $i$. Every other node at depth $i$ is smaller, because it took a $\\tfrac14$ somewhere.',
      'Turn "times $\\tfrac34$" into "divided by $\\tfrac43$": $(\\tfrac34)^i n = \\frac{n}{(4/3)^i}$, because $\\tfrac34 = 1 / \\tfrac43$.',
      'Set it to 1: $\\frac{n}{(4/3)^i} = 1 \\Rightarrow (\\tfrac43)^i = n \\Rightarrow i = \\log_{4/3} n$.',
      { text: 'Check with $n = 256$ down the right edge; $\\log_{4/3} 256 \\approx 19.3$:', table: { head: ['depth', '$0$', '$1$', '$2$', '$3$', '$4$', '$\\cdots$', '$19$', '$20$'], rows: [['size', '$256$', '$192$', '$144$', '$108$', '$81$', '$\\cdots$', '$1.08$', '$0.81$']] } },
      'To compare with $\\lg n$, change base: $\\log_{4/3} n = \\frac{\\lg n}{\\lg(4/3)} \\approx 2.41 \\lg n$. Still a constant times $\\lg n$, only a bigger constant than the left edge’s $0.5$.',
    ],
    graph: { ...EDGE_PATHS, caption: 'Size along each edge for $n = 256$ (log scale). The right edge loses only a quarter per step, so it takes until depth $\\log_{4/3} 256 \\approx 19.3$ to reach 1; the left edge is done at 4.' },
    answer: '$\\log_{4/3} n$. The rightmost path keeps $\\tfrac34$ each step, so its size is $n/(4/3)^i$, which reaches 1 at $i = \\log_{4/3} n$.',
    mistake: 'Writing $\\log_{3/4} n$. The base must be bigger than 1 (it is how many times smaller the size gets per step), so flip the fraction to $\\tfrac43$.',
    tryIt: { q: 'For $T(n) = T(n/5) + T(4n/5) + n$, how deep is the deepest leaf? About how deep for $n = 625$?', a: 'Always take $\\tfrac45$: size $n/(5/4)^i = 1 \\Rightarrow i = \\log_{5/4} n$. For $n = 625$: $\\frac{\\ln 625}{\\ln 1.25} \\approx 28.9$, against only 4 on the shallowest path.' },
  };

  H['c310-5-uneven-levelsum'] = {
    asks: 'Explain why each level of the tree for $T(n) = T(n/4) + T(3n/4) + cn$ costs exactly $cn$ down to depth $\\log_4 n$, and what changes below that depth.',
    idea: 'Think of cutting a rope of length $n$: the two pieces still add up to $n$. Each level re-cuts every piece of the level above, so the total length stays $n$ until some pieces are too short to cut.',
    tree: { ...UNEVEN_TREE, caption: 'Every complete level’s sizes add to $n$, so it costs $c \\cdot n = cn$. Once the left edge ends (depth $\\log_4 n$), pieces start dropping out and the totals fall below $n$.' },
    steps: [
      'A node of size $m$ costs $cm$, and its children have sizes $\\tfrac{m}{4}$ and $\\tfrac{3m}{4}$, which add up to $\\tfrac{m}{4} + \\tfrac{3m}{4} = m$.',
      { text: 'Add each level’s sizes:', table: { head: ['depth', 'sizes', 'sum'], rows: [['$0$', '$n$', '$n$'], ['$1$', '$\\tfrac{n}{4}, \\tfrac{3n}{4}$', '$\\tfrac{4n}{4} = n$'], ['$2$', '$\\tfrac{n}{16}, \\tfrac{3n}{16}, \\tfrac{3n}{16}, \\tfrac{9n}{16}$', '$\\tfrac{16n}{16} = n$']] } },
      'Each level replaces every node by two pieces that add up to it, so a complete level’s sizes always add to $n$. Multiply by $c$: the level costs $cn$.',
      'The left edge reaches size 1 at depth $\\log_4 n$, the shallowest leaf. Down to that depth no branch has stopped, so every level is complete and costs exactly $cn$.',
      'Below $\\log_4 n$, finished branches have no children, so their share is missing. Those levels cost less than $cn$, less and less, until the last leaf at depth $\\log_{4/3} n$.',
    ],
    graph: {
      caption: 'Each level’s total size as a fraction of $n$, for $n = 256$. Full (1) through depth $\\log_4 256 = 4$, then shrinking, and empty after depth $\\log_{4/3} 256 \\approx 19.3$.',
      x: [-0.5, 21], y: [0, 1.15], xLabel: 'depth i', yLabel: 'level / n',
      curves: [{ label: 'complete level: $n$ (cost $cn$)', f: () => 1, tone: 'a' }],
      bars: { label: 'level total, $n = 256$', tone: 'b', values: [[0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 0.9961], [6, 0.9844], [7, 0.9624], [8, 0.9294], [9, 0.6785], [10, 0.6007], [11, 0.5256], [12, 0.4552], [13, 0.1584], [14, 0.1267], [15, 0.101], [16, 0.0802], [17, 0.01], [18, 0.0075], [19, 0.0056], [20, 0.0042]] },
      marks: [{ x: 4, label: '$\\log_4 n$' }, { x: Math.log(256) / Math.log(4 / 3), label: '$\\log_{4/3} n$' }],
    },
    answer: 'Children’s sizes add up to the parent’s ($\\tfrac{m}{4} + \\tfrac{3m}{4} = m$), so every complete level adds to $n$ and costs $cn$. Below depth $\\log_4 n$ branches start ending, so levels are partial and cost at most $cn$, dwindling to nothing by depth $\\log_{4/3} n$.',
    mistake: 'Claiming every level down to $\\log_{4/3} n$ costs exactly $cn$. Only the complete levels do; deeper ones cost at most $cn$, which is why counting them gives a ceiling, not the exact total.',
    tryIt: { q: 'For $T(n) = T(n/5) + T(4n/5) + n$, list the sizes on level 2 and add them. Down to which depth are all levels complete?', a: '$\\tfrac{n}{25}, \\tfrac{4n}{25}, \\tfrac{4n}{25}, \\tfrac{16n}{25}$, which add to $\\tfrac{25n}{25} = n$. Levels are complete down to the shallowest leaf, depth $\\log_5 n$.' },
  };

  H['c310-5-uneven-bounds'] = {
    asks: 'From the tree for $T(n) = T(n/4) + T(3n/4) + cn$, give a lower bound, an upper bound, and then the tight $\\Theta$ bound.',
    idea: 'Squeeze $T(n)$ between two level counts: for the floor, count only the complete levels (each exactly $cn$); for the ceiling, pretend every level down to the deepest leaf is complete. Both counts come out as a constant times $n \\lg n$.',
    tree: { ...UNEVEN_TREE, caption: 'Floor: the complete levels, depths $0$ to $\\log_4 n$, each $cn$. Ceiling: all depths $0$ to $\\log_{4/3} n$, each at most $cn$.' },
    steps: [
      'Floor: depths $0$ to $\\log_4 n$ are complete, so $\\log_4 n + 1$ levels cost $cn$ each, and the rest costs at least 0. So $T(n) \\ge cn(\\log_4 n + 1) \\ge cn \\log_4 n$.',
      'Change base: $\\log_4 n = \\frac{\\lg n}{\\lg 4} = \\frac{\\lg n}{2}$. So $T(n) \\ge \\frac{c}{2}\\, n \\lg n$, which is $\\Omega(n \\lg n)$.',
      'Ceiling: there are at most $\\log_{4/3} n + 1$ levels (depths $0$ to $\\log_{4/3} n$), each costing at most $cn$. So $T(n) \\le cn(\\log_{4/3} n + 1)$.',
      'Change base: $\\log_{4/3} n = \\frac{\\lg n}{\\lg(4/3)} \\approx 2.41 \\lg n$. So $T(n) \\le 2.41\\, cn \\lg n + cn$, which is $O(n \\lg n)$.',
      '$\\Omega(n \\lg n)$ and $O(n \\lg n)$ together give $\\Theta(n \\lg n)$. The two depths differ only in the constant in front of $\\lg n$ ($0.5$ against $2.41$), and $\\Theta$ ignores constants.',
    ],
    graph: {
      caption: 'Everything divided by $cn$, so the y-axis counts "levels’ worth" of cost. The true total (computed exactly, $c = 1$, each leaf costing 1) stays between $\\log_4 n + 1$ and $\\log_{4/3} n + 1$, and all three grow like $\\lg n$.',
      x: [4, 1000], y: [0, 26], xLabel: 'n', yLabel: 'cost / cn',
      curves: [
        { label: 'ceiling: $\\log_{4/3} n + 1$', f: n => Math.log(n) / Math.log(4 / 3) + 1, tone: 'c' },
        { label: 'true $T(n)/(cn)$', f: n => unevenT(n) / n, tone: 'a' },
        { label: 'floor: $\\log_4 n + 1$', f: n => Math.log(n) / Math.log(4) + 1, tone: 'b' },
      ],
    },
    answer: 'Lower: $T(n) \\ge cn \\log_4 n = \\Omega(n \\lg n)$ (complete levels only). Upper: $T(n) \\le cn(\\log_{4/3} n + 1) = O(n \\lg n)$ (every level counted as full). Tight: $\\Theta(n \\lg n)$.',
    mistake: 'Thinking different log bases give different answers. $\\log_4 n$, $\\lg n$ and $\\log_{4/3} n$ differ only by constant factors, so all are $\\Theta(\\lg n)$.',
    tryIt: { q: 'Bound $T(n) = T(n/5) + T(4n/5) + n$ the same way: floor, ceiling, $\\Theta$.', a: 'Floor: $\\log_5 n + 1$ complete levels of $n$ each, so $T(n) \\ge n \\log_5 n \\approx 0.43\\, n \\lg n$. Ceiling: $T(n) \\le n(\\log_{5/4} n + 1) \\approx 3.11\\, n \\lg n + n$. So $\\Theta(n \\lg n)$.' },
  };

  H['c310-5-uneven-decreasing'] = {
    asks: 'Solve $T(n) = T(n/2) + T(n/4) + cn$ with a recursion tree. The two pieces add up to less than the whole, so the levels are no longer equal.',
    idea: 'Each split loses a quarter of the size: $\\tfrac12 + \\tfrac14 = \\tfrac34$. So every level holds at most $\\tfrac34$ of the level above, level costs shrink geometrically, and the root dominates.',
    tree: {
      sumsLabel: 'sizes add to',
      levels: [
        { nodes: ['$n$'], sum: '$n$' },
        { nodes: ['$\\tfrac{n}{2}$', '$\\tfrac{n}{4}$'], sum: '$\\tfrac{3}{4}n$' },
        { nodes: ['$\\tfrac{n}{4}$', '$\\tfrac{n}{8}$', '$\\tfrac{n}{8}$', '$\\tfrac{n}{16}$'], sum: '$(\\tfrac{3}{4})^2 n$' },
        { gap: true },
        { nodes: ['$1$', '$\\cdots$', '$\\cdots$', '$1$'], sum: '$\\le (\\tfrac{3}{4})^i n$' },
      ],
      caption: 'Leaves range from depth $\\log_4 n$ (always $n/4$) to depth $\\lg n$ (always $n/2$). Every level holds at most $\\tfrac34$ of the one above.',
    },
    steps: [
      { text: 'Add the sizes level by level:', table: { head: ['depth', 'sizes', 'sum'], rows: [['$0$', '$n$', '$n$'], ['$1$', '$\\tfrac{n}{2}, \\tfrac{n}{4}$', '$\\tfrac{3}{4}n$'], ['$2$', '$\\tfrac{n}{4}, \\tfrac{n}{8}, \\tfrac{n}{8}, \\tfrac{n}{16}$', '$\\tfrac{9}{16}n = (\\tfrac34)^2 n$']] } },
      'Each node of size $m$ is replaced by pieces adding to $\\tfrac34 m$, so a complete level $i$ adds to $(\\tfrac34)^i n$. Once branches end, levels hold even less, so level $i$ costs at most $(\\tfrac34)^i cn$.',
      'Bound the finite sum by the infinite one: $T(n) \\le cn \\sum_{i=0}^{\\infty} (\\tfrac34)^i = cn \\cdot \\frac{1}{1 - 3/4} = 4cn$. So $T(n) = O(n)$.',
      'Floor: the root alone costs $cn$, so $T(n) \\ge cn$, which is $\\Omega(n)$. Together: $T(n) = \\Theta(n)$.',
      'Compare $T(n/4) + T(3n/4) + cn$: there the fractions add to exactly 1, every complete level costs $cn$, and the total is $\\Theta(n \\lg n)$. Fractions adding to less than 1 make the ratio less than 1, and the root wins.',
    ],
    graph: {
      caption: 'Bars: each level’s cost as a multiple of $cn$ for $n = 256$, shrinking by about $\\tfrac34$ per level. Curve: the running total of $(\\tfrac34)^i$, which never passes 4.',
      x: [-0.5, 10], y: [0, 4.3], xLabel: 'depth i', yLabel: 'cost / cn',
      curves: [{ label: 'running total of $(\\tfrac34)^i$', f: i => 4 * (1 - 0.75 ** (i + 1)), tone: 'a' }, { label: 'ceiling $4$', f: () => 4, tone: 'c' }],
      bars: { label: 'level cost, $n = 256$', tone: 'b', values: [[0, 1], [1, 0.75], [2, 0.5625], [3, 0.4219], [4, 0.3164], [5, 0.2344], [6, 0.1406], [7, 0.0469], [8, 0.0059]] },
    },
    answer: 'Level $i$ costs at most $(\\tfrac34)^i cn$, so $T(n) \\le \\frac{cn}{1 - 3/4} = 4cn = O(n)$; the root gives $T(n) \\ge cn = \\Omega(n)$. So $T(n) = \\Theta(n)$.',
    mistake: 'Copying $\\Theta(n \\lg n)$ from the $\\tfrac14$, $\\tfrac34$ tree because the picture looks alike. Add the fractions first: with $cn$ work, a sum of exactly 1 gives $n \\lg n$, a sum below 1 gives $\\Theta(n)$.',
    tryIt: { q: 'Solve $T(n) = T(n/5) + T(n/2) + cn$.', a: 'The fractions add to $\\tfrac15 + \\tfrac12 = \\tfrac{7}{10}$, so level $i$ costs at most $(\\tfrac{7}{10})^i cn$. Total $\\le \\frac{cn}{1 - 7/10} = \\tfrac{10}{3}cn$; the root gives $\\ge cn$. So $\\Theta(n)$.' },
  };

  // ---------------------------------------------------------------- practice trees

  H['c310-5-tree-4T2'] = {
    asks: 'Use a recursion tree for $T(n) = 4T(n/2) + cn$: find what level $i$ costs, how many leaves there are, and the $\\Theta$ bound.',
    idea: 'Each call makes 4 subproblems of half the size. The work per node halves, but the number of nodes quadruples, so every level costs twice the one above. Costs grow downward, and the bottom of the tree wins.',
    tree: {
      sumsLabel: 'level total',
      levels: [
        { nodes: ['$cn$'], sum: '$cn$' },
        { nodes: ['$\\tfrac{cn}{2}$', '$\\tfrac{cn}{2}$', '$\\tfrac{cn}{2}$', '$\\tfrac{cn}{2}$'], sum: '$2cn$' },
        { nodes: ['$\\tfrac{cn}{4}$', '$\\tfrac{cn}{4}$', '$\\cdots$', '$\\tfrac{cn}{4}$', '$\\tfrac{cn}{4}$'], sum: '$4cn$' },
        { gap: true },
        { nodes: ['$T(1)$', '$T(1)$', '$\\cdots$', '$T(1)$', '$T(1)$'], sum: '$\\Theta(n^2)$' },
      ],
      caption: 'Level 2 has $16$ nodes. The totals double each level, and the $n^2$ leaves at the bottom outweigh everything above them.',
    },
    steps: [
      'Depth $i$: $4^i$ nodes of size $n/2^i$, each costing $\\frac{cn}{2^i}$. Level cost: $4^i \\cdot \\frac{cn}{2^i} = (\\tfrac{4}{2})^i cn = 2^i cn$.',
      'Leaves: $n/2^i = 1$ at $i = \\lg n$. Count: $4^{\\lg n} = n^{\\lg 4} = n^2$ (identity $a^{\\log_b n} = n^{\\log_b a}$), costing $n^2 \\cdot T(1) = \\Theta(n^2)$.',
      'Internal levels, depths $0$ to $\\lg n - 1$, are geometric with $r = 2$: $cn \\sum_{i=0}^{\\lg n - 1} 2^i = cn \\cdot \\frac{2^{\\lg n} - 1}{2 - 1} = cn(n - 1)$.',
      'Total: $T(n) = cn^2 - cn + \\Theta(n^2) = \\Theta(n^2)$. The ratio $2 > 1$ means the leaves dominate.',
      { text: 'Level costs for $n = 64$, $c = 1$, $T(1) = 1$:', table: { head: ['depth', '$0$', '$1$', '$2$', '$3$', '$4$', '$5$', '$6$ (leaves)'], rows: [['cost', '$64$', '$128$', '$256$', '$512$', '$1024$', '$2048$', '$4096$']] } },
    ],
    graph: {
      caption: 'Level costs for $n = 64$. Each bar doubles the one before, so the six internal levels together ($64 \\cdot 63 = 4032$) are still less than the leaf level alone ($64^2 = 4096$).',
      x: [-0.5, 6.5], y: [0, 4300], xLabel: 'depth i', yLabel: 'level cost',
      bars: { label: 'level cost, $n = 64$', tone: 'b', values: [[0, 64], [1, 128], [2, 256], [3, 512], [4, 1024], [5, 2048], [6, 4096]] },
    },
    answer: 'Level $i$ costs $2^i cn$ (growing); there are $4^{\\lg n} = n^2$ leaves; the leaves dominate, so $T(n) = \\Theta(n^2)$.',
    mistake: 'Writing the level cost as $4^i cn$, forgetting that each node is smaller. Multiply the node count $4^i$ by the cost of ONE node, $cn/2^i$.',
    tryIt: { q: 'Use a tree for $T(n) = 8T(n/2) + cn^2$: level cost, number of leaves, $\\Theta$.', a: 'Level $i$: $8^i \\cdot c(n/2^i)^2 = 8^i \\cdot \\frac{cn^2}{4^i} = 2^i cn^2$, growing. Leaves: $8^{\\lg n} = n^{\\lg 8} = n^3$. The leaves dominate: $\\Theta(n^3)$.' },
  };

  H['c310-5-tree-2Tn2'] = {
    asks: 'Solve $T(n) = 2T(n/2) + cn^2$ with a recursion tree.',
    idea: 'Halving the size doubles the nodes, but because the work is squared, each half costs only a quarter: $(\\tfrac12)^2 = \\tfrac14$. Two quarters make a half, so each level costs half the one above and the root dominates.',
    tree: {
      sumsLabel: 'level total',
      levels: [
        { nodes: ['$cn^2$'], sum: '$cn^2$' },
        { nodes: ['$\\tfrac{cn^2}{4}$', '$\\tfrac{cn^2}{4}$'], sum: '$\\tfrac{cn^2}{2}$' },
        { nodes: ['$\\tfrac{cn^2}{16}$', '$\\tfrac{cn^2}{16}$', '$\\tfrac{cn^2}{16}$', '$\\tfrac{cn^2}{16}$'], sum: '$\\tfrac{cn^2}{4}$' },
        { gap: true },
        { nodes: ['$T(1)$', '$T(1)$', '$\\cdots$', '$T(1)$'], sum: '$\\Theta(n)$' },
      ],
      caption: 'Same shape as merge sort, but the totals halve each level instead of staying equal.',
    },
    steps: [
      'Depth $i$: $2^i$ nodes of size $n/2^i$, each costing $c(n/2^i)^2 = \\frac{cn^2}{4^i}$. Level cost: $2^i \\cdot \\frac{cn^2}{4^i} = \\frac{cn^2}{2^i}$.',
      'Leaves: $n/2^i = 1$ at depth $\\lg n$, so there are $2^{\\lg n} = n$ leaves, costing $\\Theta(n)$.',
      'Internal levels are geometric with $r = \\tfrac12$: $cn^2 \\sum_{i=0}^{\\lg n - 1} (\\tfrac12)^i < cn^2 \\cdot \\frac{1}{1 - 1/2} = 2cn^2$. (Exactly, it is $2cn^2 - 2cn$.)',
      'So $cn^2 \\le T(n) < 2cn^2 + \\Theta(n)$. The root gives $\\Omega(n^2)$, the sum gives $O(n^2)$, so $T(n) = \\Theta(n^2)$.',
      'Master theorem check: $n^{\\log_2 2} = n$, and $f(n) = cn^2$ grows faster, with $2c(n/2)^2 = \\tfrac12 cn^2$ for regularity. Case 3 gives $\\Theta(n^2)$, the same.',
    ],
    graph: {
      caption: 'Bars: level cost in units of $cn^2$, halving each level. Curve: the running total, which starts at 1 (the root) and never reaches 2.',
      x: [-0.5, 7], y: [0, 2.2], xLabel: 'depth i', yLabel: 'cost / cn²',
      curves: [{ label: 'running total', f: i => 2 - 0.5 ** i, tone: 'a' }, { label: 'ceiling $2$', f: () => 2, tone: 'c' }],
      bars: { label: 'level cost $(1/2)^i$', tone: 'b', values: [[0, 1], [1, 0.5], [2, 0.25], [3, 0.125], [4, 0.0625], [5, 0.03125], [6, 0.015625]] },
    },
    answer: 'Level $i$ costs $cn^2/2^i$, a shrinking geometric series, so $T(n) < 2cn^2 + \\Theta(n)$; the root alone is $cn^2$. So $T(n) = \\Theta(n^2)$.',
    mistake: 'Treating it like merge sort and answering $\\Theta(n^2 \\lg n)$. Levels tie only when the ratio is 1; here it is $\\tfrac12$, so there is no $\\lg n$ factor.',
    tryIt: { q: 'Solve $T(n) = 3T(n/2) + cn^2$ with a tree.', a: 'Level $i$: $3^i \\cdot \\frac{cn^2}{4^i} = (\\tfrac34)^i cn^2$, shrinking, so total $< 4cn^2$ plus $3^{\\lg n} = n^{\\lg 3} \\approx n^{1.58}$ leaves. The root $cn^2$ dominates: $\\Theta(n^2)$.' },
  };
})(globalThis.FC = globalThis.FC || {});
