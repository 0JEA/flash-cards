// "Help" walkthroughs for the CSC 310 BuildHeap-analysis cards and the comparison-sort
// lower-bound / decision-tree cards (decks/csc310-b.js).
// Same entry format as decks/csc310-help.js (see the header comment there), plus `heap` /
// `heapSteps` (1-based arrays, drawn as a tree with the array strip underneath).
// Sources: M. Qasem's BuildHeapAnalysis.pdf, Heap-HeapSort-Priority Queue.pdf (p. 16–18),
// Sorting Lower Bound.pdf, Sorting in Linear Time.pdf (Figure 8.1 = CLRS insertion sort on 3).
// Known slide slips, mentioned only where they bite: Linear Time p. 5 prints "L ≤ n!" (the
// proof needs L ≥ n!); Linear Time p. 7 writes O(n log n) for log(n!) where the lower bound
// needs Ω; Heap slides p. 18 state Σ h/2^(h+1) = 2 (that series is 1; Σ h/2^h = 2).
// The levels diagram joins child k of m to parent floor(k·p/m), so an uneven decision tree
// cannot be drawn whole: Figure 8.1 is drawn to depth 2 (exact) and the depth-3 leaves are
// named in the caption; single paths are drawn as one-node-per-level chains.
// No graded assignment content is used; tryIt problems use new data.
// Every count, swap sequence, heap state and logarithm below was computed with python3
// (mpmath for lg(n!)) on 2026-10-16.
(function (FC) {
  'use strict';
  const H = FC.help = FC.help || {};

  // lg(x!) for real x >= 0, via the Lanczos log-gamma (g = 7, 9 terms; error < 1e-12 here).
  const LANCZOS = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
    -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  const lnGamma = z => {
    z -= 1;
    let s = LANCZOS[0];
    for (let i = 1; i < 9; i++) s += LANCZOS[i] / (z + i);
    const t = z + 7.5;
    return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(s);
  };
  const lgFact = n => lnGamma(n + 1) / Math.LN2;
  const fact = n => Math.exp(lnGamma(n + 1));
  const lg = n => Math.log2(n);
  const floorLg = k => 31 - Math.clz32(k);

  // ---------------------------------------------------------------- Shared pictures

  // A 15-node heap whose node labels are the HEIGHTS of the nodes (not keys).
  const HEIGHTS15 = [3, 2, 2, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0];
  const HEIGHTS15_STEP = { text: 'A 15-node heap with every node labelled by its height $h$ (not a key). Eight 0s at the bottom, then 4 ones, 2 twos, 1 three.', heap: HEIGHTS15 };

  const TABLE15 = { head: ['height $h$', 'nodes $\\lceil 15/2^{h+1} \\rceil$', 'max swaps each', 'subtotal'],
    rows: [['0', '8', '0', '0'], ['1', '4', '1', '4'], ['2', '2', '2', '4'], ['3', '1', '3', '3'], ['total', '15', '', '11']] };

  // Most swaps BuildHeap can make on perfect heaps of 3, 7, 15, 31, 63 nodes (= sum of heights).
  const PERFECT_SWAPS = [[3, 1], [7, 4], [15, 11], [31, 26], [63, 57]];

  // Work at height h, in units of n: (n / 2^(h+1)) nodes × h each.
  const WORK_BARS = Array.from({ length: 11 }, (_, h) => [h, h / 2 ** (h + 1)]);
  const G_WORK = {
    caption: 'Bars: the work at each height, (nodes at height $h$) × $h$, in units of $n$. Heights 1 and 2 give $\\tfrac14$ each, then the bars shrink fast. Curve: the running total, which levels off at 1, i.e. at $n$.',
    x: [-0.5, 10.5], y: [0, 1.1], xLabel: 'height h', yLabel: 'work / n',
    curves: [{ label: 'running total $1 - (h+2)/2^{h+1}$', f: h => 1 - (h + 2) / 2 ** (h + 1), tone: 'a' }],
    bars: { label: 'work at height $h$: $h/2^{h+1}$', tone: 'b', values: WORK_BARS },
  };

  // Partial sums of Σ h/2^h: 2 − (k+2)/2^k.
  const G_PARTIAL = {
    caption: 'Bars: the sum $\\sum h/2^h$ stopped at $h$. They climb toward 2 and never pass it, so every finite version is at most 2.',
    x: [-0.5, 12.5], y: [0, 2.3], xLabel: 'stop at h', yLabel: 'partial sum',
    curves: [{ label: 'limit $= 2$', f: () => 2, tone: 'c' }],
    bars: { label: '$\\sum_{j=0}^{h} j/2^j$', tone: 'b', values: Array.from({ length: 13 }, (_, k) => [k, 2 - (k + 2) / 2 ** k]) },
  };

  const G_LG = {
    caption: 'All three grow like $n \\lg n$. The true $\\lg(n!)$ sits between the proof’s floor $\\tfrac n2(\\lg n - 1)$ and the ceiling $n \\lg n$.',
    x: [2, 64], xLabel: 'n', yLabel: 'comparisons',
    curves: [
      { label: '$n \\lg n$', f: n => n * lg(n), tone: 'b' },
      { label: '$\\lg(n!)$', f: lgFact, tone: 'a' },
      { label: '$\\tfrac n2(\\lg n - 1)$', f: n => n / 2 * (lg(n) - 1), tone: 'c' },
    ],
  };

  const G_SORTS = {
    caption: 'Log scale. Insertion sort’s worst case ($n^2/2$) pulls away; merge sort’s worst case hugs the floor $\\lg(n!)$ that no comparison sort can go below.',
    x: [2, 100], logY: true, xLabel: 'n', yLabel: 'worst-case comparisons',
    curves: [
      { label: 'insertion sort $n(n-1)/2$', f: n => n * (n - 1) / 2, tone: 'c' },
      { label: 'merge sort $\\approx n \\lg n - n + 1$', f: n => n * lg(n) - n + 1, tone: 'b' },
      { label: 'floor $\\lg(n!)$', f: lgFact, tone: 'a' },
    ],
  };

  // 2^h against the leaves needed for n elements.
  const leavesGraph = (n, hMax, caption) => ({
    caption, x: [0, hMax], logY: true, xLabel: 'height h', yLabel: 'leaves',
    curves: [{ label: 'leaves available, $2^h$', f: h => 2 ** h, tone: 'a' }, { label: `leaves needed, $${n}!$`, f: () => fact(n), tone: 'c' }],
    marks: [{ x: lgFact(n), label: `$\\lg ${n}! \\approx ${lgFact(n).toFixed(n >= 10 ? 2 : 3)}$` }],
    from: Math.ceil(lgFact(n)),
  });

  // Figure 8.1 to depth 2 (exact: child k of 4 hangs under parent floor(k/2)).
  const FIG81_TOP = {
    sumsLabel: 'comparisons made',
    levels: [
      { nodes: ['1:2'], sum: '0' },
      { nodes: ['2:3', '1:3'], sum: '1' },
      { nodes: ['⟨1,2,3⟩', '1:3', '⟨2,1,3⟩', '2:3'], sum: '2' },
    ],
    caption: 'Figure 8.1 (insertion sort, 3 elements), depths 0–2. Left = $\\le$, right = $>$. Depth 3, not drawn: ⟨1,3,2⟩ and ⟨3,1,2⟩ hang under the left 1:3; ⟨2,3,1⟩ and ⟨3,2,1⟩ hang under the right 2:3.',
  };

  const perfectTree = h => ({
    sumsLabel: 'nodes on this level',
    levels: Array.from({ length: h + 1 }, (_, d) => ({
      nodes: Array(2 ** d).fill(d === h ? '⟨·⟩' : 'i:j'),
      sum: d === h ? `$${2 ** d} = 2^{${h}}$ leaves` : `$${2 ** d}$`,
    })),
  });

  // ---------------------------------------------------------------- BuildHeap analysis

  H['c310-buildheap-result'] = {
    asks: 'Give one $\\Theta$ bound for the total running time of BuildHeap on $n$ elements, counting every Heapify call it makes.',
    idea: 'One Heapify can cost $\\lg n$, but only the root ever pays that much. Half the nodes are leaves and pay nothing, a quarter pay at most 1 swap, an eighth at most 2. Added up, the total stays below $n$.',
    steps: [
      'BuildHeap calls Heapify on $i = \\lfloor n/2 \\rfloor$ down to 1. A call on a node of height $h$ makes at most $h$ swaps, one per level the value sinks.',
      { text: 'Charge each node its height, $n = 15$:', table: TABLE15 },
      'In general about $n/2^{h+1}$ nodes have height $h$, so the work is about $n(\\tfrac14 + \\tfrac28 + \\tfrac3{16} + \\cdots)$. The bracket adds up to exactly 1, so the work is $O(n)$.',
      'Floor: the loop makes $\\lfloor n/2 \\rfloor$ Heapify calls on every input, and each call does at least one comparison. That is $\\Omega(n)$.',
      'Ceiling $O(n)$ and floor $\\Omega(n)$ together give $\\Theta(n)$.',
    ],
    graph: {
      caption: 'Bars: the most swaps BuildHeap can make on perfect heaps of 3, 7, 15, 31 and 63 nodes (1, 4, 11, 26, 57). They stay under the line $n$, while the naive estimate $\\tfrac n2 \\lg n$ pulls away.',
      x: [1, 70], xLabel: 'n', yLabel: 'swaps',
      curves: [{ label: '$n$', f: n => n, tone: 'a' }, { label: 'naive $\\tfrac n2 \\lg n$', f: n => n / 2 * lg(n), tone: 'c' }],
      bars: { label: 'most swaps (sum of heights)', tone: 'b', values: PERFECT_SWAPS },
    },
    answer: '$\\Theta(n)$. The per-node costs (heights) add up to less than $n$, and the $\\lfloor n/2 \\rfloor$ calls alone already take linear time.',
    mistake: 'Answering $\\Theta(n \\lg n)$ from "$n/2$ calls times $O(\\lg n)$ each". That product is a true ceiling but not tight, because most calls are on short subtrees.',
    tryIt: { q: 'A perfect heap has 127 nodes (height 6). Compare the naive bound, 63 calls × 6 swaps, with the most swaps BuildHeap can really make.', a: 'Naive: $63 \\cdot 6 = 378$. Real: $32 \\cdot 1 + 16 \\cdot 2 + 8 \\cdot 3 + 4 \\cdot 4 + 2 \\cdot 5 + 1 \\cdot 6 = 120$, under $n = 127$.' },
  };

  H['c310-buildheap-naive'] = {
    asks: 'Give the quick argument that BuildHeap is $O(n \\lg n)$, then say what it gets wrong, so that the bound is not tight.',
    idea: 'The quick argument charges every Heapify call the worst price, $\\lg n$ swaps. Only the root can sink that far; a node just above the leaves can sink at most once.',
    steps: [
      'BuildHeap makes $\\lfloor n/2 \\rfloor$ Heapify calls, one per internal node.',
      'One Heapify sinks a value at most from the root to a leaf, $\\lfloor \\lg n \\rfloor$ levels: $O(\\lg n)$.',
      'Multiply: $\\tfrac n2 \\cdot O(\\lg n) = O(n \\lg n)$. Every step is true, so this is a correct ceiling.',
      'The flaw: it charges every call $\\lg n$. A call at height $h$ costs only $O(h)$, and about half of the calls are at height 1.',
      { text: 'How much it overcharges, on perfect heaps:', table: { head: ['$n$', 'naive: calls × height', 'real worst case'], rows: [['15', '$7 \\cdot 3 = 21$', '11'], ['1023', '$511 \\cdot 9 = 4599$', '1013']] } },
    ],
    graph: {
      caption: 'The naive ceiling $\\tfrac n2 \\lg n$ bends upward. The real worst case (bars, perfect heaps up to 1023 nodes) stays under the straight line $n$.',
      x: [1, 1100], xLabel: 'n', yLabel: 'swaps',
      curves: [{ label: 'naive $\\tfrac n2 \\lg n$', f: n => n / 2 * lg(n), tone: 'c' }, { label: '$n$', f: n => n, tone: 'a' }],
      bars: { label: 'real worst case', tone: 'b', values: [[63, 57], [127, 120], [255, 247], [511, 502], [1023, 1013]] },
    },
    answer: '$\\tfrac n2$ calls $\\times\\ O(\\lg n)$ each $= O(n \\lg n)$. It is a correct upper bound but not tight: it assumes every node can sink $\\lg n$ levels, while most nodes are near the bottom and sink 0 or 1 levels.',
    mistake: 'Calling the argument wrong. Its conclusion $O(n \\lg n)$ is true; it is only loose, and the tight answer is $\\Theta(n)$.',
    tryIt: { q: 'A perfect heap has 63 nodes (height 5). Naive bound versus the real most swaps?', a: 'Naive: $31 \\cdot 5 = 155$. Real: $16 \\cdot 1 + 8 \\cdot 2 + 4 \\cdot 3 + 2 \\cdot 4 + 1 \\cdot 5 = 57$.' },
  };

  H['c310-buildheap-cost-h'] = {
    asks: 'A node has height $h$: the longest path from it down to a leaf has $h$ edges. How much work can MAX-HEAPIFY do when called on it?',
    idea: 'Heapify lets one value sink. Each swap moves it down one level, and from height $h$ there are only $h$ levels below it before it reaches a leaf.',
    steps: [
      'One call does a constant amount of work: compute Left and Right, at most 2 comparisons, maybe one swap. Then it either stops or recurses one level lower.',
      'Every recursive call is one level further down, and the recursion stops at the latest when it reaches a leaf (no children).',
      'From height $h$ there are at most $h$ levels to go down: at most $h$ swaps and $h + 1$ calls, each constant work. That is $O(h)$.',
      'In the drawing, index 2 has height 2: MAX-HEAPIFY(A, 2) can swap at most twice (index 2 → 4 → 8).',
      'Height is not depth. Depth counts edges up to the root: the root has depth 0 but height $\\lfloor \\lg n \\rfloor$, the largest cost.',
    ],
    heapSteps: [HEIGHTS15_STEP],
    answer: '$O(h)$: at most $h$ swaps, one per level, with constant work per level.',
    mistake: 'Answering $O(\\lg n)$ for every node. That is only the root’s height; lower nodes have smaller $h$ and cost less, which is the whole point of the BuildHeap analysis.',
    tryIt: { q: 'In a 31-node perfect heap (height 4), what is the height of index 3, and at most how many swaps can MAX-HEAPIFY(A, 3) make?', a: 'Index 3 has depth 1, so height $4 - 1 = 3$. At most 3 swaps (e.g. index 3 → 6 → 12 → 24).' },
  };

  H['c310-buildheap-nodes-h'] = {
    asks: 'In a heap with $n$ nodes, give a formula for the largest number of nodes that can have height $h$.',
    idea: 'Look at a perfect tree from the bottom up. The leaves are half of all the nodes; their parents are half of that; every step up halves the count again. So height $h$ gets $n$ halved $h + 1$ times.',
    steps: [
      'Height 0 means leaf. Node $i$ is a leaf when $2i > n$, so the leaves are indices $\\lfloor n/2 \\rfloor + 1$ to $n$: $\\lceil n/2 \\rceil = \\lceil n/2^{0+1} \\rceil$ of them.',
      'In a perfect tree each node has two children, so each level up has exactly half as many nodes. For $n = 15$: 8, 4, 2, 1.',
      'Halving $h + 1$ times from $n$ gives $n/2^{h+1}$, and the ceiling covers odd counts: at most $\\lceil n/2^{h+1} \\rceil$ nodes have height $h$.',
      { text: 'Check against real heaps (actual count vs formula):', table: { head: ['height $h$', '$n = 15$', '$\\lceil 15/2^{h+1} \\rceil$', '$n = 10$', '$\\lceil 10/2^{h+1} \\rceil$'], rows: [['0', '8', '8', '5', '5'], ['1', '4', '4', '3', '3'], ['2', '2', '2', '1', '2'], ['3', '1', '1', '1', '1']] } },
      'For $n = 10$, height 2 has 1 node but the formula allows 2. It is an upper bound ("at most"), which is all the proof needs.',
    ],
    heapSteps: [{ text: 'A 10-node heap with every node labelled by its height: five 0s, three 1s, one 2, one 3.', heap: [3, 2, 1, 1, 1, 0, 0, 0, 0, 0] }],
    answer: '$\\lceil n/2^{h+1} \\rceil$.',
    mistake: 'Writing $n/2^h$. At $h = 0$ that says all $n$ nodes are leaves, but only half are, so the exponent is $h + 1$.',
    tryIt: { q: 'A heap has $n = 100$ nodes. At most how many have height 2?', a: '$\\lceil 100/2^3 \\rceil = \\lceil 12.5 \\rceil = 13$. (A real 100-node heap has exactly 13.)' },
  };

  H['c310-buildheap-nodes-apply'] = {
    asks: 'In the 15-node perfect heap, count the nodes of height 1, the parents of the leaves.',
    idea: 'Plug $h = 1$ into $\\lceil n/2^{h+1} \\rceil$, then check on the tree: the 8 leaves pair up under 4 parents.',
    steps: [
      '$h + 1 = 2$, so divide by $2^2 = 4$: $15/4 = 3.75$.',
      'Round up: $\\lceil 3.75 \\rceil = 4$.',
      'Check on the tree: the leaves are indices 8–15. Their parents $\\lfloor i/2 \\rfloor$ are 4, 5, 6, 7: four nodes.',
      'Indices 4–7 sit one level above the leaves, so their height is 1. In the drawing they are the four 1s.',
    ],
    heapSteps: [HEIGHTS15_STEP],
    answer: '4 (indices 4, 5, 6, 7): $\\lceil 15/4 \\rceil = 4$.',
    mistake: 'Dividing by $2^h = 2$ instead of $2^{h+1} = 4$: $\\lceil 7.5 \\rceil = 8$ is the number of leaves, not of height-1 nodes.',
    tryIt: { q: 'A 31-node perfect heap: how many nodes have height 3?', a: '$\\lceil 31/2^4 \\rceil = \\lceil 1.94 \\rceil = 2$: indices 2 and 3.' },
  };

  H['c310-buildheap-sum'] = {
    asks: 'Write BuildHeap’s total work as a sum over heights, then simplify it to $O(n \\cdot \\text{(a sum)})$.',
    idea: 'Instead of charging every node the worst price, sort the nodes into groups by height. Each group has a known size and a known price per node, and the total is the sum of size × price.',
    steps: [
      'Price: a node at height $h$ costs at most $c\\,h$ (a constant $c$ per level it sinks).',
      'Group size: at most $\\lceil n/2^{h+1} \\rceil$ nodes have height $h$, for $h = 0, \\dots, \\lfloor \\lg n \\rfloor$. So $T(n) \\le \\sum_{h=0}^{\\lfloor \\lg n \\rfloor} \\lceil n/2^{h+1} \\rceil \\, c\\,h$.',
      'Remove the ceiling: $h \\le \\lg n$ gives $2^h \\le n$, so $n/2^{h+1} \\ge \\tfrac12$, and rounding up a number $\\ge \\tfrac12$ at most doubles it. Hence $\\lceil n/2^{h+1} \\rceil \\le n/2^h$.',
      'Substitute and pull out $c\\,n$, which does not change with $h$: $T(n) \\le c\\,n \\sum_{h=0}^{\\lfloor \\lg n \\rfloor} h/2^h = O\\left(n \\sum h/2^h\\right)$.',
      { text: 'For $n = 15$:', table: { head: ['$h$', '$\\lceil 15/2^{h+1} \\rceil$', 'nodes $\\times\\ h$', '$15 \\cdot h/2^h$'], rows: [['0', '8', '0', '0'], ['1', '4', '4', '7.5'], ['2', '2', '4', '7.5'], ['3', '1', '3', '5.625'], ['sum', '', '11', '20.625']] } },
      'The handout keeps $h/2^{h+1}$ and the Heap slides drop the $\\tfrac12$ into the $O$. Both lead to $O(n)$ once the series is shown to be a constant.',
    ],
    graph: G_WORK,
    answer: '$T(n) \\le \\sum_{h=0}^{\\lfloor \\lg n \\rfloor} \\lceil n/2^{h+1} \\rceil \\, O(h) = O\\left(n \\sum_{h=0}^{\\lfloor \\lg n \\rfloor} h/2^h\\right)$.',
    mistake: 'Writing $\\sum \\lceil n/2^{h+1} \\rceil \\cdot O(\\lg n)$. The price must depend on $h$; charging $\\lg n$ brings back the loose $O(n \\lg n)$.',
    tryIt: { q: 'For $n = 31$, evaluate $\\sum_h \\lceil 31/2^{h+1} \\rceil \\cdot h$ and the bound $31 \\sum_{h=0}^{4} h/2^h$.', a: 'Sum: $16 \\cdot 0 + 8 \\cdot 1 + 4 \\cdot 2 + 2 \\cdot 3 + 1 \\cdot 4 = 26$. Bound: $31(\\tfrac12 + \\tfrac24 + \\tfrac38 + \\tfrac4{16}) = 31 \\cdot 1.625 = 50.375$.' },
  };

  H['c310-buildheap-why-infinite'] = {
    asks: 'In the BuildHeap proof, the finite sum $\\sum_{h=0}^{\\lg n} h/2^h$ is replaced by the infinite one, and $n$ is pulled outside the sum. Justify both moves.',
    idea: 'Adding more nonnegative numbers can only make a total bigger, so the infinite sum is a safe ceiling for the finite one. And $n$ is the same in every term, so it factors out like any constant.',
    steps: [
      'Every term $h/2^h$ is $\\ge 0$. The infinite sum is the finite sum plus more nonnegative terms, so finite $\\le$ infinite.',
      'In an upper bound, replacing a quantity by a bigger one keeps the statement true: $T(n) \\le c\\,n \\sum_{h=0}^{\\lfloor \\lg n \\rfloor} h/2^h \\le c\\,n \\sum_{h=0}^{\\infty} h/2^h$.',
      'Why bother: the finite sum stops at $\\lfloor \\lg n \\rfloor$, so it still depends on $n$. The infinite sum is one fixed number, 2.',
      { text: 'Partial sums climb toward 2 and never pass it:', table: { head: ['stop at $h =$', '1', '2', '3', '5', '10'], rows: [['$\\sum h/2^h$', '0.5', '1', '1.375', '1.78125', '1.98828…']] } },
      'Pulling out $n$: $n a_0 + n a_1 + \\cdots = n(a_0 + a_1 + \\cdots)$, the distributive law. It works because $n$ does not depend on $h$; $h$ itself could not be pulled out.',
      'Result: $T(n) \\le c\\,n \\cdot 2 = 2c\\,n = O(n)$.',
    ],
    graph: G_PARTIAL,
    answer: 'All terms $h/2^h$ are nonnegative, so the finite sum is at most the infinite one, and an upper bound stays valid. $n$ does not depend on $h$, so it is a constant factor of every term.',
    mistake: 'Fearing that an infinite sum must be infinite. These terms shrink fast (from $h = 2$ on, each is at most $\\tfrac34$ of the one before), so the total is the finite number 2.',
    tryIt: { q: 'Why is $\\sum_{h=0}^{10} 1/2^h \\le 2$?', a: 'All terms are positive, so it is at most the infinite sum $1 + \\tfrac12 + \\tfrac14 + \\cdots = 2$. (Exactly, it is $2 - 1/2^{10} \\approx 1.999$.)' },
  };

  H['c310-buildheap-series'] = {
    asks: 'Find the exact value of the infinite sum $\\tfrac12 + \\tfrac24 + \\tfrac38 + \\tfrac4{16} + \\cdots$.',
    idea: 'Compare the sum with half of itself. Shifting by one place and subtracting cancels the growing numerators and leaves the plain halving sum $\\tfrac12 + \\tfrac14 + \\cdots$, which is 1.',
    steps: [
      'Call it $S = \\tfrac12 + \\tfrac24 + \\tfrac38 + \\tfrac4{16} + \\cdots$ (the $h = 0$ term is 0).',
      'Halve every term: $\\tfrac S2 = \\tfrac14 + \\tfrac28 + \\tfrac3{16} + \\cdots$.',
      'Subtract, matching equal denominators: $S - \\tfrac S2 = \\tfrac12 + \\tfrac{2-1}{4} + \\tfrac{3-2}{8} + \\tfrac{4-3}{16} + \\cdots = \\tfrac12 + \\tfrac14 + \\tfrac18 + \\cdots$.',
      'The right side is a unit cut in half, then half the rest, and so on: it equals 1. So $\\tfrac S2 = 1$ and $S = 2$.',
      { text: 'Check numerically:', table: { head: ['terms up to $h =$', '2', '4', '6', '8', '10'], rows: [['partial sum', '1', '1.625', '1.875', '1.9609…', '1.9883…']] } },
      'The Heap slides (p. 18) write $\\sum h/2^{h+1} = 2$. That series is half of this one, so it equals 1; it is $\\sum h/2^h$ that equals 2.',
    ],
    graph: {
      caption: 'Bars: the terms $h/2^h$ (up to $\\tfrac12$, then shrinking). Curve: the running total $2 - (h+2)/2^h$, levelling off at 2.',
      x: [0, 12], y: [0, 2.2], xLabel: 'h', yLabel: 'value',
      curves: [{ label: 'running total', f: h => 2 - (h + 2) / 2 ** h, tone: 'a' }],
      bars: { label: 'term $h/2^h$', tone: 'b', values: Array.from({ length: 13 }, (_, h) => [h, h / 2 ** h]) },
    },
    answer: '2. From $S - \\tfrac S2 = \\tfrac12 + \\tfrac14 + \\cdots = 1$ we get $S = 2$, so $T(n) \\le c\\,n \\cdot 2 = O(n)$.',
    mistake: 'Mixing up the look-alikes: $\\sum_{h \\ge 1} 1/2^h = 1$, $\\sum h/2^{h+1} = 1$, $\\sum h/2^h = 2$. Any one of them being a constant is enough for $O(n)$.',
    tryIt: { q: 'Find $\\sum_{h=0}^{\\infty} h/3^h = \\tfrac13 + \\tfrac29 + \\tfrac3{27} + \\cdots$.', a: '$S - \\tfrac S3 = \\tfrac13 + \\tfrac19 + \\tfrac1{27} + \\cdots = \\tfrac12$, so $\\tfrac23 S = \\tfrac12$ and $S = \\tfrac34$.' },
  };

  H['c310-buildheap-level-work'] = {
    asks: 'In the level-by-level picture, estimate the total Heapify work done at all the nodes of height 2.',
    idea: 'Work at one height = (how many nodes are there) × (how far each can sink). Going up one height halves the count but adds only 1 to the cost, so the halving wins.',
    steps: [
      'Nodes at height 2: about $n/2^{2+1} = n/8$.',
      'Each can sink at most 2 levels: cost 2.',
      'Work: $\\tfrac n8 \\cdot 2 = \\tfrac{2n}{8} = \\tfrac n4$.',
      { text: 'All heights:', table: { head: ['height $h$', 'nodes', 'cost each', 'work'], rows: [['0', '$n/2$', '0', '0'], ['1', '$n/4$', '1', '$n/4$'], ['2', '$n/8$', '2', '$n/4$'], ['3', '$n/16$', '3', '$3n/16$'], ['4', '$n/32$', '4', '$n/8$'], ['5', '$n/64$', '5', '$5n/64$']] } },
      'Total: $n(\\tfrac14 + \\tfrac14 + \\tfrac3{16} + \\tfrac18 + \\cdots) = n \\sum h/2^{h+1} = n \\cdot 1 = n$. So $O(n)$.',
    ],
    graph: G_WORK,
    answer: '$n/4$: about $n/8$ nodes, each sinking at most 2 levels.',
    mistake: 'Reading "total work $O(n)$" on every row of the handout’s table and multiplying by $\\lg n$ rows to get $O(n \\lg n)$. The rows shrink ($\\tfrac{3n}{16}, \\tfrac n8, \\tfrac{5n}{64}, \\dots$), so together they still add to about $n$.',
    tryIt: { q: 'In a heap with $n = 1024$ nodes, about how much work is done at height 4?', a: '$1024/2^5 = 32$ nodes, at most 4 swaps each: $32 \\cdot 4 = 128 = n/8$.' },
  };

  H['c310-buildheap-leaves-work'] = {
    asks: 'How many nodes have height 0, and how much does BuildHeap spend on them?',
    idea: 'Height 0 means no children: a leaf. A single value is already a heap, so there is nothing to fix. Half the tree costs nothing.',
    steps: [
      'Node $i$ has a left child only if $2i \\le n$. So the leaves are the indices with $2i > n$: $\\lfloor n/2 \\rfloor + 1$ through $n$.',
      'That is $n - \\lfloor n/2 \\rfloor = \\lceil n/2 \\rceil$ nodes, about $n/2$. For $n = 15$: indices 8–15, eight leaves.',
      'BuildHeap’s loop starts at $i = \\lfloor n/2 \\rfloor$, the last internal node, so Heapify is never called on a leaf. Work: $\\tfrac n2 \\cdot 0 = 0$.',
      'This is the heart of the linear bound: half of the nodes cost nothing, and the next quarter cost at most 1 swap each.',
    ],
    heapSteps: [HEIGHTS15_STEP],
    answer: 'About $n/2$ (exactly $\\lceil n/2 \\rceil$) leaves, and they need 0 work: a one-node subtree is already a heap.',
    mistake: 'Thinking the leaves must be "checked" too. The loop starts at $\\lfloor n/2 \\rfloor$ precisely so that no leaf is ever visited.',
    tryIt: { q: 'A heap has $n = 20$ nodes. Which indices are leaves, and where does BuildHeap’s loop start?', a: 'Leaves: indices 11–20, ten nodes, no work. The loop starts at $i = \\lfloor 20/2 \\rfloor = 10$.' },
  };

  H['c310-buildheap-lower'] = {
    asks: 'Explain why BuildHeap needs at least linear time, and what that gives together with the $O(n)$ ceiling.',
    idea: 'A ceiling says "no more than"; a tight bound also needs a floor, "no less than". BuildHeap’s floor is easy: its loop runs about $n/2$ times whatever the input is.',
    steps: [
      'The loop runs $i = \\lfloor n/2 \\rfloor, \\dots, 1$: $\\lfloor n/2 \\rfloor$ Heapify calls, even on an input that is already a heap.',
      'Each call is on an internal node, so it compares A[i] with at least its left child: at least one step per call.',
      'So $T(n) \\ge \\lfloor n/2 \\rfloor \\ge n/4$ for $n \\ge 2$ (check: $n = 2$ gives $1 \\ge 0.5$, $n = 3$ gives $1 \\ge 0.75$). That is $\\Omega(n)$ with $c = \\tfrac14$, $n_0 = 2$.',
      'The height sum gave $O(n)$. With $\\Omega(n)$, both bounds are multiples of $n$, so $T(n) = \\Theta(n)$.',
    ],
    graph: {
      caption: 'Bars: the number of Heapify calls, $\\lfloor n/2 \\rfloor$. They never drop below the line $n/4$, so the time is at least linear.',
      x: [0, 31], xLabel: 'n', yLabel: 'calls',
      curves: [{ label: 'floor $n/4$', f: n => n / 4, tone: 'a' }],
      bars: { label: 'Heapify calls $\\lfloor n/2 \\rfloor$', tone: 'b', values: Array.from({ length: 14 }, (_, k) => [2 * k + 3, k + 1]) },
    },
    answer: 'It processes $\\lfloor n/2 \\rfloor$ internal nodes, one Heapify call each, so it does at least linear work: $\\Omega(n)$. With $O(n)$, the bound is $\\Theta(n)$.',
    mistake: 'Stopping at $O(n)$ and writing $\\Theta(n)$. $\\Theta$ needs the floor too; here it is one line, but it has to be said.',
    tryIt: { q: 'BuildHeap runs on a 1,000-element array that is already a max-heap. How many Heapify calls, and how many swaps?', a: '500 calls ($\\lfloor 1000/2 \\rfloor$) and 0 swaps. The calls alone are linear work, which is the $\\Omega(n)$ floor.' },
  };

  H['c310-buildheap-key-idea'] = {
    asks: 'Say in one sentence why BuildHeap runs in linear time.',
    idea: 'A heap is a pyramid: wide at the bottom, narrow at the top. Heapify is cheap at the bottom (little room to sink) and expensive at the top, and almost all the nodes are at the bottom.',
    steps: [
      'Cost rises with height: a node at height $h$ costs at most $h$ swaps.',
      'Count falls with height: about $n/2^{h+1}$ nodes, halving with each step up.',
      { text: 'For $n = 31$:', table: { head: ['height $h$', '0', '1', '2', '3', '4'], rows: [['nodes', '16', '8', '4', '2', '1'], ['cost each', '0', '1', '2', '3', '4'], ['work', '0', '8', '8', '6', '4']] } },
      'The root, the most expensive node, costs 4 of the 26; the 16 leaves cost nothing. The total, 26, is under $n = 31$.',
    ],
    graph: {
      caption: 'Bars: how many nodes have height $h$ when $n = 31$. Line: what each one costs. Where the nodes are many, the cost is low; where the cost is high, there is 1 node.',
      x: [-0.5, 4.5], y: [0, 17], xLabel: 'height h', yLabel: 'count / cost',
      curves: [{ label: 'cost per node $= h$', f: h => h, tone: 'a' }],
      bars: { label: 'nodes at height $h$', tone: 'b', values: [[0, 16], [1, 8], [2, 4], [3, 2], [4, 1]] },
    },
    answer: 'Most nodes in a heap are near the bottom, where Heapify is cheap; only a few are near the top, where Heapify is expensive.',
    mistake: 'Saying "Heapify is $O(\\lg n)$ and $\\lg n$ is small". $n/2$ calls at $\\lg n$ each would be $n \\lg n$; the linear total comes from most calls costing far less than $\\lg n$.',
    tryIt: { q: 'In a 63-node perfect heap, what fraction of the nodes have height 0 or 1, and how much can they cost together?', a: '$32 + 16 = 48$ of 63, about 76%. Together they cost at most $16 \\cdot 1 = 16$ swaps.' },
  };

  H['c310-buildheap-vs-insert'] = {
    asks: 'Build a heap by calling insert $n$ times instead of running BuildHeap. What is the worst-case total time?',
    idea: 'Insert puts the new key at the bottom and lets it bubble UP, so its cost is the node’s depth. Heapify sinks DOWN, so its cost is the node’s height. Most nodes are deep and short: bad for insert, good for BuildHeap.',
    steps: [
      'The $k$-th insert lands at index $k$, depth $\\lfloor \\lg k \\rfloor$. With keys arriving in increasing order, each new key climbs to the root: $\\lfloor \\lg k \\rfloor$ swaps.',
      'Total: $\\sum_{k=1}^{n} \\lfloor \\lg k \\rfloor$. Ceiling: each term is $\\le \\lg n$, so $O(n \\lg n)$.',
      'Floor: the last half of the inserts ($k > n/2$) each climb $\\lfloor \\lg k \\rfloor > \\lg n - 2$ levels. So the total is at least $\\tfrac n2(\\lg n - 2)$, which is $\\Omega(n \\lg n)$.',
      { text: 'Increasing keys, swaps counted by running both:', table: { head: ['$n$', 'insert one at a time', 'BuildHeap, same input'], rows: [['7', '10', '4'], ['15', '34', '11'], ['31', '98', '26'], ['1000', '7987', '992']] } },
      'Both $O(n \\lg n)$ and $\\Omega(n \\lg n)$: inserting one at a time is $\\Theta(n \\lg n)$, against $\\Theta(n)$ for BuildHeap.',
    ],
    graph: {
      caption: 'Increasing keys inserted one at a time: total swaps $\\sum \\lfloor \\lg k \\rfloor$ bend upward like $n \\lg n$. BuildHeap never goes above the straight line $n$.',
      x: [1, 300], xLabel: 'n', yLabel: 'swaps',
      curves: [
        { label: 'insert one at a time, $\\sum_{k \\le n} \\lfloor \\lg k \\rfloor$', f: n => { let s = 0; for (let k = 1; k <= Math.floor(n); k++) s += floorLg(k); return s; }, tone: 'c' },
        { label: 'BuildHeap ceiling $n$', f: n => n, tone: 'a' },
      ],
    },
    answer: '$\\Theta(n \\lg n)$. Each insert can bubble up its full depth $\\lfloor \\lg k \\rfloor$, and half of the inserts land at depth above $\\lg n - 2$. BuildHeap is $\\Theta(n)$.',
    mistake: 'Assuming the early, cheap inserts balance things out. They are cheap but few: half of all inserts happen when the tree is already nearly at full height.',
    tryIt: { q: 'Insert 1, 2, 3, 4, 5, 6, 7 one at a time into an empty max-heap. How many swaps in total?', a: 'Each new key climbs to the root: $0 + 1 + 1 + 2 + 2 + 2 + 2 = 10$ swaps. BuildHeap on ⟨1, …, 7⟩ makes 4.' },
  };

  H['c310-buildheap-proof-order'] = {
    asks: 'Put the five steps of the tight $O(n)$ proof for BuildHeap in order.',
    idea: 'The proof is a bill: price per item, how many items at each price, the total, then show the total is a fixed multiple of $n$.',
    steps: [
      'Price: Heapify at height $h$ costs $O(h)$. It comes first because the sum needs a price per node.',
      'Quantity: at most $\\lceil n/2^{h+1} \\rceil$ nodes have height $h$.',
      'Total: multiply and add over heights, $T(n) \\le \\sum \\lceil n/2^{h+1} \\rceil O(h) = O(n \\sum h/2^h)$. This needs both lines above.',
      'Bound the series: $\\sum_{h=0}^{\\infty} h/2^h = 2$, a constant. (The Heap slides, p. 18, write $\\sum h/2^{h+1} = 2$; that one is 1, and either constant works.)',
      'Conclude: $T(n) = O(n \\cdot 2) = O(n)$.',
    ],
    graph: G_WORK,
    answer: 'Heapify at height $h$ costs $O(h)$ → at most $\\lceil n/2^{h+1} \\rceil$ nodes have height $h$ → $T(n) \\le \\sum \\lceil n/2^{h+1} \\rceil O(h) = O(n \\sum h/2^h)$ → $\\sum_{h=0}^{\\infty} h/2^h = 2$ → $T(n) = O(n)$.',
    mistake: 'Putting the series first. It only matters once the sum has been written; on its own, $\\sum h/2^h = 2$ says nothing about heaps.',
    tryIt: { q: 'Suppose Heapify at height $h$ cost $O(h^2)$. Which steps change, and would BuildHeap still be $O(n)$?', a: 'The price, the total and the series change: the series becomes $\\sum h^2/2^h = 6$, still a constant. So yes, still $O(n)$.' },
  };

  H['c310-buildheap-max-swaps15'] = {
    asks: 'For a 15-node heap, find the largest number of swaps BuildHeap could make, over all possible inputs.',
    idea: 'Heapify swaps at most once per level below its node, so a node contributes at most its height. Add up the heights of all 15 nodes.',
    steps: [
      'Most swaps from one call at height $h$: $h$ (the value sinks all the way to a leaf).',
      'Heights in the 15-node perfect tree (drawn): 8 nodes at 0, 4 at 1, 2 at 2, 1 at 3.',
      '$8 \\cdot 0 + 4 \\cdot 1 + 2 \\cdot 2 + 1 \\cdot 3 = 0 + 4 + 4 + 3 = 11$.',
      'It is reachable: on the ascending array ⟨1, 2, …, 15⟩ every value sinks to a leaf, exactly 11 swaps.',
      '11 is under $n = 15$, as $\\Theta(n)$ predicts. The naive count, 7 calls × 3, would say 21.',
    ],
    heapSteps: [HEIGHTS15_STEP],
    answer: '11, the sum of all node heights: $4 \\cdot 1 + 2 \\cdot 2 + 1 \\cdot 3$.',
    mistake: 'Computing $\\lfloor n/2 \\rfloor \\cdot \\lfloor \\lg n \\rfloor = 7 \\cdot 3 = 21$. Only the root can sink 3 levels.',
    tryIt: { q: 'A 7-node perfect heap: most swaps BuildHeap can make?', a: '$4 \\cdot 0 + 2 \\cdot 1 + 1 \\cdot 2 = 4$.' },
  };

  H['c310-buildheap-asc15'] = {
    asks: 'Run BuildHeap (with the MAX-HEAPIFY shown) on ⟨1, 2, …, 15⟩ and count every swap.',
    idea: 'In an ascending array every value is smaller than everything below it. So each Heapify starts on the smallest value in its subtree, and that value sinks all the way to a leaf: exactly the worst case.',
    steps: [
      'Height-1 nodes, $i = 7, 6, 5, 4$: each swaps once with its larger child (7↔15, 6↔13, 5↔11, 4↔9). 4 swaps.',
      '$i = 3$: 3 swaps with 15 (index 7), then with 14 (index 14). $i = 2$: 2 swaps with 11 (index 5), then with 10 (index 10), so 8 swaps so far.',
      '$i = 1$: 1 swaps with 15 (index 3), then 14 (index 7), then 7 (index 15). 3 more, 11 in all.',
      'Why each value sinks fully: everything below index $i$ started at a larger index, so with a larger value. Heapifying the subtrees only rearranges those larger values.',
      'So the swaps equal the sum of heights: $4 \\cdot 1 + 2 \\cdot 2 + 1 \\cdot 3 = 11$.',
    ],
    heapSteps: [
      { text: 'Start: ⟨1, 2, …, 15⟩.', heap: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] },
      { text: 'After $i = 7, 6, 5, 4$: 4 swaps.', heap: [1, 2, 3, 9, 11, 13, 15, 8, 4, 10, 5, 12, 6, 14, 7] },
      { text: 'After $i = 3, 2$: 8 swaps.', heap: [1, 11, 15, 9, 10, 13, 14, 8, 4, 2, 5, 12, 6, 3, 7] },
      { text: 'After $i = 1$: 11 swaps, a max-heap.', heap: [15, 11, 14, 9, 10, 13, 7, 8, 4, 2, 5, 12, 6, 3, 1] },
    ],
    answer: '11 swaps. The result is ⟨15, 11, 14, 9, 10, 13, 7, 8, 4, 2, 5, 12, 6, 3, 1⟩.',
    mistake: 'Counting one swap per call (7 calls, 7 swaps). MAX-HEAPIFY keeps recursing: the 1 at the root sinks three levels in a single call.',
    tryIt: { q: 'Run BuildHeap on ⟨1, 2, 3, 4, 5, 6, 7⟩. How many swaps, and what is the result?', a: '$i = 3$: 3↔7. $i = 2$: 2↔5. $i = 1$: 1↔7, then 1↔6. 4 swaps; result ⟨7, 5, 6, 4, 2, 1, 3⟩.' },
  };

  H['c310-buildheap-max-swaps31'] = {
    asks: 'For a 31-node perfect heap (height 4), find the most swaps BuildHeap can make.',
    idea: 'Same as the 15-node case, one level taller: each node contributes at most its height, so add the heights.',
    steps: [
      'Height 4 means 5 levels. From the bottom: 16 leaves (height 0), 8 nodes at height 1, 4 at 2, 2 at 3, 1 at 4.',
      '$16 \\cdot 0 + 8 \\cdot 1 + 4 \\cdot 2 + 2 \\cdot 3 + 1 \\cdot 4 = 0 + 8 + 8 + 6 + 4 = 26$.',
      'The ascending input ⟨1, …, 31⟩ reaches it: running BuildHeap on it makes 26 swaps.',
      { text: 'A pattern for perfect heaps: most swaps $= n -$ (number of levels).', table: { head: ['$n$', 'levels', 'most swaps', '$n -$ levels'], rows: [['7', '3', '4', '4'], ['15', '4', '11', '11'], ['31', '5', '26', '26'], ['63', '6', '57', '57']] } },
      'So the worst case stays just under $n$: linear.',
    ],
    graph: {
      caption: 'Most swaps for perfect heaps of 3 to 63 nodes (bars) against the line $n$: always just below it.',
      x: [0, 70], xLabel: 'n', yLabel: 'swaps',
      curves: [{ label: '$n$', f: n => n, tone: 'a' }],
      bars: { label: 'most swaps', tone: 'b', values: PERFECT_SWAPS },
    },
    answer: '26 $= 8 \\cdot 1 + 4 \\cdot 2 + 2 \\cdot 3 + 1 \\cdot 4$, still under $n = 31$.',
    mistake: 'Charging each level its depth instead of its height. The root has height 4 (it can sink 4 levels), and the 16 leaves contribute 0.',
    tryIt: { q: 'A 255-node perfect heap (height 7): most swaps?', a: '$64 \\cdot 1 + 32 \\cdot 2 + 16 \\cdot 3 + 8 \\cdot 4 + 4 \\cdot 5 + 2 \\cdot 6 + 1 \\cdot 7 = 247 = 255 - 8$.' },
  };

  // ---------------------------------------------------------------- Comparison-sort lower bound

  H['c310-lowerbound-def'] = {
    asks: 'What does a lower bound for a problem tell you, and how is it different from one algorithm’s running time?',
    idea: 'An upper bound is a promise about one algorithm: "this method never needs more than X". A lower bound is a wall around the problem: "no method, even one not invented yet, can always do it with fewer than Y".',
    steps: [
      'Upper bound (one algorithm): merge sort never needs more than about $n \\lg n$ comparisons.',
      'Lower bound (the problem): every algorithm that sorts by comparing must, on some input, make at least $\\lg(n!)$ comparisons.',
      '"Worst case" matters: the wall says some input forces that many comparisons, not that every input does.',
      { text: 'For $n = 16$, worst-case comparisons:', table: { head: ['', 'comparisons'], rows: [['insertion sort (one algorithm)', '120'], ['merge sort (one algorithm)', '49'], ['lower bound (every algorithm)', '$\\lceil \\lg 16! \\rceil = 45$']] } },
      'Merge sort is close to the wall. No comparison sort, however clever, can guarantee fewer than 45.',
    ],
    graph: G_SORTS,
    answer: 'The minimum amount of work that ANY algorithm must do to solve the problem; for sorting, the fewest comparisons any comparison sort needs on $n$ elements in the worst case.',
    mistake: 'Treating a lower bound as an algorithm’s best case. It is a statement about every algorithm’s worst case.',
    tryIt: { q: 'Which is a lower-bound statement? (a) Quicksort makes at most $n^2/2$ comparisons. (b) Any algorithm that finds the largest of $n$ numbers must make at least $n - 1$ comparisons.', a: '(b): it is about every algorithm for the problem. (a) is an upper bound on one algorithm.' },
  };

  H['c310-lowerbound-comparison-sort'] = {
    asks: 'Define a comparison-based sorting algorithm.',
    idea: 'Picture the algorithm blindfolded. It cannot see the values; it can only ask a referee "is $A_i < A_j$?" and hear yes or no. Everything it learns about the order comes from those answers.',
    steps: [
      'The only operation that looks at values is comparing two elements, $A_i < A_j$?, with answer yes or no.',
      'It may move or copy elements, but it never does arithmetic on them or uses a value as an array index.',
      'The handout’s examples: bubble, selection, insertion, merge, quick and heap sort. Each moves elements based only on comparison results.',
      'Not one: counting sort runs C[A[j]] += 1, using the value A[j] as an index. It learns the order without comparing pairs.',
      'Why the definition matters: if yes/no answers are the only information, every run is a path of yes/no branches, which is the decision tree.',
    ],
    tree: {
      levels: [{ nodes: ['$A_i < A_j$?'] }, { nodes: ['yes', 'no'] }],
      caption: 'One comparison is one two-way branch. A comparison sort is a sequence of these.',
    },
    answer: 'One that determines the order of the elements only by comparing pairs of elements (e.g. "is $A_i < A_j$?").',
    mistake: 'Calling a sort comparison-based because it "puts things in order". The test is how it learns the order: only by comparing pairs.',
    tryIt: { q: 'An algorithm sorts exam scores 0–100 by making 101 piles, dropping each score on the pile with its number, then reading the piles in order. Comparison-based?', a: 'No. It uses each score as a pile number (an index), like counting sort, and never compares two scores.' },
  };

  H['c310-lowerbound-classify'] = {
    asks: 'Pick the algorithm that does not sort by comparing pairs, so the $\\Omega(n \\lg n)$ bound does not apply to it.',
    idea: 'Ask of each algorithm: how does it find out which element goes first? If the only way is "compare two elements", the bound applies.',
    steps: [
      { text: 'How each one learns the order:', table: { head: ['algorithm', 'how it learns the order', 'comparison sort?'], rows: [['heapsort', 'compares a parent with its children', 'yes'], ['insertion sort', 'compares the key with A[j]', 'yes'], ['quicksort', 'compares each element with the pivot', 'yes'], ['counting sort', 'uses each value as an index: C[A[j]] += 1', 'no']] } },
      'Counting sort never compares two elements. It counts how many of each value there are, then writes them out in index order.',
      'It runs in $O(n + k)$ for keys in $0..k$; with $k = O(n)$ that is $O(n)$. No contradiction: the bound only covers comparison sorts.',
    ],
    answer: 'Counting sort: it indexes an array by key value instead of comparing elements.',
    mistake: 'Picking heapsort because it uses a heap instead of a list. Heapsort still decides everything by comparing keys.',
    tryIt: { q: 'Merge sort, selection sort, radix sort, bubble sort: which one is not a comparison sort?', a: 'Radix sort. It sorts digit by digit with counting sort, using digit values as indices.' },
  };

  H['c310-lowerbound-tree-parts'] = {
    asks: 'In the decision tree of a comparison sort, say what each part stands for: an internal node, a branch, a leaf, and a path from the root to a leaf.',
    idea: 'The decision tree is a map of every run the algorithm could make on $n$ elements. Each fork is a question, each turn is an answer, each endpoint is a final verdict about the order.',
    steps: [
      'Internal node "$i{:}j$": one comparison, of $a_i$ with $a_j$ (original positions). Figure 8.1 is insertion sort on 3 elements.',
      'Branch: the outcome. Left means $a_i \\le a_j$, right means $a_i > a_j$.',
      'Leaf, e.g. ⟨3, 1, 2⟩: the algorithm’s conclusion, a permutation meaning $a_3 \\le a_1 \\le a_2$.',
      'Root-to-leaf path: one run. For ⟨2, 9, 4⟩: 1:2 ($2 \\le 9$, left), 2:3 ($9 > 4$, right), 1:3 ($2 \\le 4$, left), leaf ⟨1, 3, 2⟩, i.e. $2 \\le 4 \\le 9$.',
      { text: 'Every internal node of Figure 8.1:', table: { head: ['node', 'reached when', 'left ($\\le$)', 'right ($>$)'], rows: [['1:2 (root)', 'always', '2:3', '1:3'], ['2:3', '$a_1 \\le a_2$', '⟨1,2,3⟩', '1:3'], ['1:3', '$a_1 \\le a_2$, $a_2 > a_3$', '⟨1,3,2⟩', '⟨3,1,2⟩'], ['1:3', '$a_1 > a_2$', '⟨2,1,3⟩', '2:3'], ['2:3', '$a_1 > a_2$, $a_1 > a_3$', '⟨2,3,1⟩', '⟨3,2,1⟩']] } },
      'There is one tree per algorithm and per input size $n$.',
    ],
    tree: FIG81_TOP,
    answer: 'Internal node: one comparison ($a_i$ vs $a_j$). Branch: its outcome. Leaf: a possible sorted order (a permutation, the algorithm’s conclusion). Root-to-leaf path: the comparisons the algorithm makes on one input.',
    mistake: 'Reading a leaf as values. A leaf lists positions: ⟨3, 1, 2⟩ means the element that started in position 3 comes first.',
    tryIt: { q: 'Follow Figure 8.1 for ⟨a1, a2, a3⟩ = ⟨6, 2, 9⟩. Which leaf, after how many comparisons?', a: '1:2: $6 > 2$, right. 1:3: $6 \\le 9$, left. Leaf ⟨2, 1, 3⟩ ($2 \\le 6 \\le 9$), after 2 comparisons.' },
  };

  H['c310-lowerbound-height'] = {
    asks: 'Which measurement of the decision tree equals the largest number of comparisons the algorithm ever makes?',
    idea: 'Running the algorithm on one input is walking one path down the tree, one comparison per edge. The worst input has the longest path, and the longest root-to-leaf path is, by definition, the height.',
    steps: [
      'Comparisons made on an input = edges on its path = depth of the leaf it reaches.',
      { text: 'Figure 8.1, every leaf:', table: { head: ['leaf', '⟨1,2,3⟩', '⟨1,3,2⟩', '⟨3,1,2⟩', '⟨2,1,3⟩', '⟨2,3,1⟩', '⟨3,2,1⟩'], rows: [['comparisons', '2', '3', '3', '2', '3', '3']] } },
      'Worst case = the largest of these = 3 = the height of the tree.',
      'So a bound on the height of every possible decision tree is a bound on the worst case of every comparison sort. That is the plan of the lower-bound proof.',
    ],
    tree: {
      sumsLabel: 'test',
      levels: [
        { nodes: ['1:2'], sum: '$9 > 5$: right' },
        { nodes: ['1:3'], sum: '$9 > 2$: right' },
        { nodes: ['2:3'], sum: '$5 > 2$: right' },
        { nodes: ['⟨3,2,1⟩'], sum: '3 comparisons' },
      ],
      caption: 'A longest path in Figure 8.1, taken by ⟨9, 5, 2⟩: three edges, so three comparisons. No path is longer, so the height is 3.',
    },
    answer: 'Its height: the longest root-to-leaf path.',
    mistake: 'Counting nodes on the path instead of edges, which gives one too many. The path 1:2 → 1:3 → 2:3 → leaf has 3 edges: 3 comparisons.',
    tryIt: { q: 'A decision tree for some sort on 4 elements has leaves at depths 4, 5 and 6 only. Worst-case number of comparisons?', a: '6, the height (the deepest leaf).' },
  };

  H['c310-lowerbound-perms'] = {
    asks: 'In how many different orders can 4 distinct elements arrive?',
    idea: 'Fill the 4 positions one at a time. The first position has 4 choices, the next only the 3 left over, then 2, then 1.',
    steps: [
      'Position 1: any of the 4 elements; position 2: any of the 3 left; position 3: one of the 2 left; position 4: the last one.',
      'Every choice combines with every later choice, so multiply: $4 \\cdot 3 \\cdot 2 \\cdot 1 = 24 = 4!$.',
      'Check with $n = 3$: $3! = 6$, the handout’s list ABC, ACB, BAC, BCA, CAB, CBA.',
      { text: 'How fast $n!$ grows:', table: { head: ['$n$', '3', '4', '5', '6', '10'], rows: [['$n!$', '6', '24', '120', '720', '3,628,800']] } },
      'A correct sort must tell all $n!$ orders apart, so its decision tree needs at least $n!$ leaves.',
    ],
    graph: {
      caption: 'Log scale: $n!$, the number of orders to tell apart, pulls away from $2^n$.',
      x: [1, 12], logY: true, xLabel: 'n', yLabel: 'count',
      curves: [{ label: '$n!$', f: fact, tone: 'a' }, { label: '$2^n$', f: n => 2 ** n, tone: 'b' }],
    },
    answer: '24: $4! = 4 \\cdot 3 \\cdot 2 \\cdot 1$.',
    mistake: 'Answering $4^4 = 256$, which lets the same element fill two positions. Each element is used once, so the choices shrink: $4 \\cdot 3 \\cdot 2 \\cdot 1$.',
    tryIt: { q: 'How many orders do 6 distinct elements have?', a: '$6! = 6 \\cdot 5 \\cdot 4 \\cdot 3 \\cdot 2 \\cdot 1 = 720$.' },
  };

  H['c310-lowerbound-why-leaves'] = {
    asks: 'Argue that the decision tree of a correct comparison sort on $n$ distinct elements has at least $n!$ leaves.',
    idea: 'A leaf is a final instruction such as "output $a_3, a_1, a_2$". Two inputs that need different instructions cannot share a leaf, and there are $n!$ orders, each needing its own instruction.',
    steps: [
      'Different input orders need different rearrangements: ⟨5, 6, 8⟩ needs ⟨1, 2, 3⟩, while ⟨5, 8, 6⟩ needs ⟨1, 3, 2⟩.',
      'Suppose both reached the same leaf. A leaf fixes one rearrangement, so one input would come out unsorted (⟨5, 8, 6⟩ output as 5, 8, 6).',
      'So no two orders share a leaf: at least one leaf per order, $L \\ge n!$.',
      '$L$ can be larger, because some trees have leaves that no input reaches. That only adds leaves.',
      'Consequence for $n = 3$: 6 orders need 6 leaves, but a tree of height 2 has at most 4 (drawn). So no comparison sort always sorts 3 elements in 2 comparisons.',
    ],
    tree: { ...perfectTree(2), caption: 'Any tree of height 2 has at most 4 leaves. Three elements have 6 orders, so two orders would have to share a leaf.' },
    answer: 'There are $n!$ input orders and each needs a different rearrangement to become sorted, so each must reach its own leaf. Hence $L \\ge n!$.',
    mistake: 'Writing $L \\le n!$, as the Linear Time slides (p. 5) print it. The argument gives at least one leaf per order: $L \\ge n!$.',
    tryIt: { q: 'Could a comparison sort on 4 elements always finish within 4 comparisons?', a: 'No. Height 4 allows at most $2^4 = 16$ leaves, but $4! = 24$ orders need 24.' },
  };

  H['c310-lowerbound-leaves-mc'] = {
    asks: 'Choose the relation that must hold between $L$, the number of leaves of a correct comparison sort’s decision tree, and $n!$.',
    idea: 'Each of the $n!$ input orders needs its own leaf. That is a floor on $L$: at least $n!$.',
    steps: [
      'One leaf per order, plus possibly some unreachable leaves: $L \\ge n!$.',
      'The Linear Time slides (p. 5) print $L \\le n!$, though the same slide says "at least $n!$ leaves". $\\ge$ is the one the proof uses.',
      '$L \\le n!$ would allow a one-leaf tree with 0 comparisons, which cannot sort anything; it gives no lower bound.',
      { text: 'The other options against $n!$:', table: { head: ['$n$', '$n!$', '$2n$', '$2^n$'], rows: [['3', '6', '6', '8'], ['4', '24', '8', '16'], ['5', '120', '10', '32']] } },
      'From $n = 4$ on, $2n$ and $2^n$ are below $n!$, so "$L = 2n$" or "$L \\le 2^n$" would leave orders without a leaf. The power-of-2 ceiling uses the height: $L \\le 2^h$.',
    ],
    graph: {
      caption: 'Log scale: $n!$ meets $2n$ at $n = 3$ (both 6) and passes $2^n$ between 3 and 4. From $n = 4$ on it is above both and pulls away.',
      x: [1, 10], logY: true, xLabel: 'n', yLabel: 'count',
      curves: [{ label: '$n!$', f: fact, tone: 'a' }, { label: '$2^n$', f: n => 2 ** n, tone: 'b' }, { label: '$2n$', f: n => 2 * n, tone: 'c' }],
      marks: [{ x: 4, label: '$n = 4$' }],
    },
    answer: '$L \\ge n!$.',
    mistake: 'Picking $L \\le 2^n$ by mixing up $n$ (elements) with $h$ (height). The true ceiling is $L \\le 2^h$, and the pair $n! \\le L \\le 2^h$ gives the bound.',
    tryIt: { q: 'Someone claims a correct comparison sort on 4 elements whose decision tree has 20 leaves. Possible?', a: 'No. $20 < 24 = 4!$, so two of the 24 orders would share a leaf and one would be sorted wrongly.' },
  };

  H['c310-lowerbound-max-leaves'] = {
    asks: 'A binary tree has height $h$. What is the largest number of leaves it can have?',
    idea: 'Start at the root and give every node two children. The node count doubles on each level, 1, 2, 4, 8, …, and the tree cannot go deeper than $h$.',
    steps: [
      'Level 0 has 1 node. Each node has at most 2 children, so level $d$ has at most twice as many as level $d - 1$: 1, 2, 4, …, $2^d$.',
      'Every leaf sits at depth $\\le h$, and the deepest level holds at most $2^h$ nodes.',
      'A leaf higher up, at depth $d < h$, takes the place of up to $2^{h-d}$ bottom-level leaves, so it only lowers the count. The most is $2^h$, all at depth $h$.',
      'Figure 8.1 has height 3: room for $2^3 = 8$ leaves, and it uses 6 (two of its leaves are at depth 2).',
    ],
    tree: { ...perfectTree(3), caption: 'Height 3 with every node branching: 1, 2, 4, then $8 = 2^3$ leaves. No tree of height 3 has more.' },
    answer: '$2^h$.',
    mistake: 'Writing $2h$ or $2^{h+1} - 1$. $2h$ is too small (6 against 8 at $h = 3$), and $2^{h+1} - 1$ counts all the nodes, not just the leaves.',
    tryIt: { q: 'At most how many leaves does a binary tree of height 5 have? Could it be the decision tree of a sort on 5 elements?', a: '$2^5 = 32$. No: 5 elements have $5! = 120$ orders, more than 32.' },
  };

  H['c310-lowerbound-chain'] = {
    asks: 'Put the two leaf counts together to get a lower bound on the decision tree’s height $h$.',
    idea: 'The tree needs at least $n!$ leaves, and height $h$ allows at most $2^h$. So $2^h$ must be big enough to hold $n!$; taking $\\lg$ turns "how big $2^h$ is" into "how big $h$ is".',
    steps: [
      'Needed: $L \\ge n!$; available: $L \\le 2^h$. Chain them: $n! \\le L \\le 2^h$, so $2^h \\ge n!$.',
      '$\\lg$ is increasing (a bigger input gives a bigger output), so applying it to both sides keeps $\\ge$: $\\lg(2^h) \\ge \\lg(n!)$.',
      '$\\lg(2^h) = h$, because $\\lg$ undoes "2 to the power". So $h \\ge \\lg(n!)$.',
      'Example, $n = 3$: $h \\ge \\lg 6 \\approx 2.585$, and a height is a whole number, so $h \\ge 3$. Figure 8.1 has height 3, as good as possible.',
    ],
    graph: leavesGraph(3, 5, 'Leaves available, $2^h$, reach the leaves needed, $3! = 6$, at $h = \\lg 6 \\approx 2.585$. The first whole height past that is 3 (shaded from there).'),
    answer: '$n! \\le L \\le 2^h$, so $2^h \\ge n!$. Taking $\\log_2$ of both sides: $h \\ge \\lg(n!)$.',
    mistake: 'Flipping the inequality while taking logs. $\\lg$ is increasing, so $2^h \\ge n!$ becomes $h \\ge \\lg(n!)$, still $\\ge$.',
    tryIt: { q: 'Find the smallest height allowed for a comparison sort on 6 elements.', a: '$2^h \\ge 6! = 720$. $2^9 = 512 < 720 \\le 1024 = 2^{10}$, so $h \\ge 10$ ($\\lg 720 \\approx 9.49$).' },
  };

  H['c310-lowerbound-lgfact'] = {
    asks: 'Prove $\\lg(n!) = \\Omega(n \\lg n)$ the way the handout does: keep only the last half of the factors of $n!$.',
    idea: 'For a floor, you may throw things away. Of the factors $1, 2, \\dots, n$, the top half are each at least $n/2$, and there are $n/2$ of them. That alone makes $n!$ at least $(n/2)^{n/2}$, which after taking logs is already about $n \\lg n$.',
    steps: [
      'Write $n! = 1 \\cdot 2 \\cdots \\tfrac n2 \\cdot (\\tfrac n2 + 1) \\cdots n$ (take $n$ even).',
      'Drop the first-half factors. Each is $\\ge 1$, so dropping them cannot make the product bigger: $n! \\ge (\\tfrac n2 + 1) \\cdots n$.',
      'That leaves $n/2$ factors, each $\\ge n/2$; shrink each to $n/2$: $n! \\ge (n/2)^{n/2}$. At $n = 8$: $40320 \\ge 5 \\cdot 6 \\cdot 7 \\cdot 8 = 1680 \\ge 4^4 = 256$.',
      'Take $\\lg$ (it keeps $\\ge$) and use $\\lg(x^k) = k \\lg x$: $\\lg(n!) \\ge \\tfrac n2 \\lg \\tfrac n2$.',
      '$\\lg \\tfrac n2 = \\lg n - \\lg 2 = \\lg n - 1$, so $\\lg(n!) \\ge \\tfrac n2(\\lg n - 1)$.',
      'For $n \\ge 4$, $\\lg n \\ge 2$, so $\\lg n - 1 \\ge \\tfrac12 \\lg n$. Then $\\lg(n!) \\ge \\tfrac14 n \\lg n$: $\\Omega(n \\lg n)$ with $c = \\tfrac14$, $n_0 = 4$.',
    ],
    graph: G_LG,
    answer: '$n! \\ge (\\tfrac n2 + 1) \\cdots n \\ge (n/2)^{n/2}$, so $\\lg(n!) \\ge \\tfrac n2 \\lg \\tfrac n2 = \\tfrac n2(\\lg n - 1) \\ge \\tfrac14 n \\lg n$ for $n \\ge 4$. That is $\\Omega(n \\lg n)$.',
    mistake: 'Ending with $O(n \\lg n)$, as the Linear Time slides (p. 7) write. That is true but proves nothing about a floor; the lower bound needs $\\Omega$.',
    tryIt: { q: 'Use the same style to show the ceiling $\\lg(n!) \\le n \\lg n$.', a: 'Each of the $n$ factors is $\\le n$, so $n! \\le n^n$. Take $\\lg$: $\\lg(n!) \\le n \\lg n$. With the floor, $\\lg(n!) = \\Theta(n \\lg n)$.' },
  };

  H['c310-lowerbound-why-half'] = {
    asks: 'Justify the step $n! \\ge (n/2)^{n/2}$ in the proof that $\\lg(n!) = \\Omega(n \\lg n)$.',
    idea: 'A floor is allowed to be stingy. Throw away factors and round the rest down; whatever is left is smaller than $n!$, so if it is still large, $n!$ is large too.',
    steps: [
      'Multiplying by a number $\\ge 1$ never makes a product smaller. So removing factors that are $\\ge 1$ can only make it smaller or keep it equal.',
      'All of $1, 2, \\dots, \\tfrac n2$ are $\\ge 1$: remove them. $n! \\ge (\\tfrac n2 + 1)(\\tfrac n2 + 2) \\cdots n$.',
      'Those factors run from $\\tfrac n2 + 1$ to $n$: $n - \\tfrac n2 = \\tfrac n2$ of them.',
      'Each is bigger than $n/2$, so replacing each by $n/2$ shrinks the product again: $\\ge (n/2)^{n/2}$.',
      { text: 'At $n = 8$:', table: { head: ['', 'value'], rows: [['$8! = 1 \\cdot 2 \\cdots 8$', '40320'], ['keep $5 \\cdot 6 \\cdot 7 \\cdot 8$', '1680'], ['$(8/2)^{8/2} = 4^4$', '256']] } },
      'For odd $n$, keep $\\lceil n/2 \\rceil, \\dots, n$: more than $n/2$ factors, each $\\ge n/2$, so the same bound holds.',
    ],
    graph: G_LG,
    answer: 'Dropping the first-half factors (each $\\ge 1$) can only make the product smaller; each of the remaining $\\approx n/2$ factors is $\\ge n/2$, so their product is $\\ge (n/2)^{n/2}$.',
    mistake: 'Thinking the step needs $n!$ to be close to $(n/2)^{n/2}$. It is far bigger (40320 against 256 at $n = 8$); a floor only has to be below and still grow like $n \\lg n$ after the log.',
    tryIt: { q: 'Use the same step to show $10! \\ge 5^5$.', a: 'Keep the top five factors: $10! \\ge 6 \\cdot 7 \\cdot 8 \\cdot 9 \\cdot 10 = 30240$, and each is $\\ge 5$, so $\\ge 5^5 = 3125$. (In fact $10! = 3{,}628{,}800$.)' },
  };

  H['c310-lowerbound-why-omega'] = {
    asks: 'Show that $\\tfrac n2(\\lg n - 1)$ is $\\Omega(n \\lg n)$ by finding the constants.',
    idea: 'The "$-1$" matters only while $\\lg n$ is tiny. Once $\\lg n \\ge 2$, subtracting 1 removes at most half of $\\lg n$, so at least half is left.',
    steps: [
      'Goal, from the definition of $\\Omega$: find $c > 0$ and $n_0$ with $\\tfrac n2(\\lg n - 1) \\ge c\\,n \\lg n$ for all $n \\ge n_0$.',
      'When is $\\lg n - 1 \\ge \\tfrac12 \\lg n$? Subtract $\\tfrac12 \\lg n$ from both sides: when $\\tfrac12 \\lg n \\ge 1$, i.e. $\\lg n \\ge 2$, i.e. $n \\ge 4$.',
      'Multiply both sides by $\\tfrac n2 > 0$: $\\tfrac n2(\\lg n - 1) \\ge \\tfrac n2 \\cdot \\tfrac12 \\lg n = \\tfrac14 n \\lg n$ for $n \\ge 4$.',
      { text: 'So $c = \\tfrac14$, $n_0 = 4$. Check:', table: { head: ['$n$', '$\\tfrac n2(\\lg n - 1)$', '$\\tfrac14 n \\lg n$'], rows: [['4', '2', '2'], ['8', '8', '6'], ['16', '24', '16'], ['1024', '4608', '2560']] } },
      'The Linear Time slides (p. 7) write $O(n \\lg n)$ at this point; for a lower bound it has to be $\\Omega$.',
    ],
    graph: {
      caption: 'From $n_0 = 4$ on (shaded), $\\tfrac n2(\\lg n - 1)$ stays on or above $\\tfrac14 n \\lg n$. Before 4 it can be below, which the definition allows.',
      x: [1, 20], xLabel: 'n', yLabel: 'value',
      curves: [{ label: '$\\tfrac n2(\\lg n - 1)$', f: n => n / 2 * (lg(n) - 1), tone: 'a' }, { label: '$\\tfrac14 n \\lg n$', f: n => n * lg(n) / 4, tone: 'b' }],
      marks: [{ x: 4, label: '$n_0 = 4$' }],
      from: 4,
    },
    answer: 'For $n \\ge 4$, $\\lg n - 1 \\ge \\tfrac12 \\lg n$, so $\\tfrac n2(\\lg n - 1) \\ge \\tfrac14 n \\lg n$: $\\Omega(n \\lg n)$ with $c = \\tfrac14$, $n_0 = 4$.',
    mistake: 'Saying "the $-1$ is a lower-order term, drop it" and stopping. That is the idea, but a proof names $c$ and $n_0$ and checks the inequality.',
    tryIt: { q: 'Show $\\tfrac n3(\\lg n - 2) = \\Omega(n \\lg n)$.', a: '$\\lg n - 2 \\ge \\tfrac12 \\lg n$ when $\\lg n \\ge 4$, i.e. $n \\ge 16$. Then $\\tfrac n3(\\lg n - 2) \\ge \\tfrac16 n \\lg n$: $c = \\tfrac16$, $n_0 = 16$.' },
  };

  H['c310-lowerbound-summary-order'] = {
    asks: 'Put the seven steps of the comparison-sort lower-bound argument in order.',
    idea: 'Two counts and a squeeze. Count the outcomes the algorithm must be able to give ($n!$), count the outcomes a height-$h$ tree can hold ($2^h$), require the second to be at least the first, then solve for $h$.',
    steps: [
      'Count what must be told apart: $n!$ orders of $n$ distinct elements.',
      'Model the algorithm: a comparison has two outcomes, so the decision tree is binary.',
      'Capacity: a binary tree of height $h$ has at most $2^h$ leaves.',
      'Demand: the tree needs at least $n!$ leaves, one per order. Together: $2^h \\ge n!$.',
      'Solve: take logs, $h \\ge \\lg(n!)$. Then $\\lg(n!) = \\Omega(n \\lg n)$, so $h = \\Omega(n \\lg n)$.',
      'Run it at $n = 4$: 24 orders, so $2^h \\ge 24$ and $h \\ge \\lg 24 \\approx 4.58$: at least 5 comparisons in the worst case.',
    ],
    graph: G_LG,
    answer: '$n!$ orderings → binary tree → at most $2^h$ leaves → at least $n!$ leaves → $2^h \\ge n!$ → $h \\ge \\lg(n!)$ → $\\lg(n!) = \\Omega(n \\lg n)$, so $h = \\Omega(n \\lg n)$.',
    mistake: 'Putting "$\\lg(n!) = \\Omega(n \\lg n)$" before "$h \\ge \\lg(n!)$". It is the last link: first get $h \\ge \\lg(n!)$, then size up $\\lg(n!)$.',
    tryIt: { q: 'Run the chain for $n = 7$. At least how many comparisons in the worst case?', a: '$7! = 5040$ orders. $2^{12} = 4096 < 5040 \\le 8192 = 2^{13}$, so $h \\ge 13$.' },
  };

  H['c310-lowerbound-n4'] = {
    asks: 'Use $h \\ge \\lg(n!)$ to find the fewest worst-case comparisons any comparison sort can manage on 4 elements.',
    idea: 'The tree needs a leaf for each of the 24 orders. Find the smallest whole height whose $2^h$ leaves are enough.',
    steps: [
      '$4! = 24$ leaves needed.',
      'Try heights: $2^4 = 16 < 24$, too few. $2^5 = 32 \\ge 24$, enough.',
      'Same thing with logs: $\\lg 24 \\approx 4.585$. A height is a whole number of comparisons, so round up: $h \\ge 5$.',
      'The bound can be met: merge sort on 4 elements never needs more than 5 comparisons.',
    ],
    graph: leavesGraph(4, 7, 'Log scale. $2^h$ passes the 24 leaves needed at $h \\approx 4.585$; the first whole height that works is 5.'),
    answer: '5: $\\lceil \\lg 24 \\rceil$, since $2^4 = 16 < 24 \\le 32 = 2^5$.',
    mistake: 'Rounding 4.585 down to 4. A height-4 tree has only 16 leaves, fewer than the 24 orders, so you must round up.',
    tryIt: { q: 'Same question for 3 elements.', a: '$3! = 6$; $2^2 = 4 < 6 \\le 8 = 2^3$, so at least 3 comparisons.' },
  };

  H['c310-lowerbound-n5'] = {
    asks: 'Use $h \\ge \\lg(n!)$ to find the fewest worst-case comparisons any comparison sort can manage on 5 elements.',
    idea: 'Each of the $5!$ orders needs its own leaf. Find the smallest whole height $h$ with $2^h \\ge 5!$.',
    steps: [
      '$5! = 5 \\cdot 4 \\cdot 3 \\cdot 2 \\cdot 1 = 120$ leaves needed.',
      '$2^6 = 64 < 120$, too few. $2^7 = 128 \\ge 120$, enough.',
      'With logs: $\\lg 120 \\approx 6.907$, rounded up to 7.',
      'For comparison, merge sort can need 8 comparisons on 5 elements. The bound says no algorithm can promise fewer than 7.',
    ],
    graph: leavesGraph(5, 9, 'Log scale. $2^h$ passes the 120 leaves needed at $h \\approx 6.907$; the first whole height that works is 7.'),
    answer: '7: $\\lceil \\lg 120 \\rceil$, since $2^6 = 64 < 120 \\le 128 = 2^7$.',
    mistake: 'Rounding $\\lg 120 \\approx 6.9$ to the nearest whole number by habit. The height must be at least 6.9, so round up; here both give 7, but at 4.585 (for $n = 4$) only rounding up is right.',
    tryIt: { q: 'Same question for 8 elements.', a: '$8! = 40320$. $2^{15} = 32768 < 40320 \\le 65536 = 2^{16}$, so at least 16.' },
  };

  H['c310-lowerbound-n10'] = {
    asks: 'Use $h \\ge \\lg(n!)$ to find the fewest worst-case comparisons any comparison sort can manage on 10 elements.',
    idea: 'Same recipe: find the first power of 2 that reaches $10!$. With big numbers, adding logs is easier than computing $10!$ first.',
    steps: [
      '$10! = 3{,}628{,}800$ leaves needed.',
      'Powers of 2 around it: $2^{21} = 2{,}097{,}152 < 3{,}628{,}800 \\le 4{,}194{,}304 = 2^{22}$.',
      'Without computing $10!$: the log of a product is the sum of logs, $\\lg(10!) = \\lg 1 + \\lg 2 + \\cdots + \\lg 10 \\approx 0 + 1 + 1.585 + 2 + 2.322 + 2.585 + 2.807 + 3 + 3.170 + 3.322 = 21.79$.',
      'Round up: at least 22 comparisons in the worst case.',
      'For scale: merge sort’s worst case on 10 elements is 25 comparisons, insertion sort’s is 45.',
    ],
    graph: leavesGraph(10, 25, 'Log scale. $2^h$ passes $10! = 3{,}628{,}800$ at $h \\approx 21.79$; the first whole height that works is 22.'),
    answer: '22: $\\lg(10!) \\approx 21.79$, rounded up ($2^{21} < 10! \\le 2^{22}$).',
    mistake: 'Using $n \\lg n = 10 \\lg 10 \\approx 33$ as the answer. The exact bound is $\\lg(n!)$; $n \\lg n$ is only its growth rate.',
    tryIt: { q: 'Same question for 12 elements ($12! = 479{,}001{,}600$).', a: '$2^{28} = 268{,}435{,}456 < 479{,}001{,}600 \\le 536{,}870{,}912 = 2^{29}$, so at least 29 ($\\lg 12! \\approx 28.84$).' },
  };

  H['c310-lowerbound-half-bound16'] = {
    asks: 'Plug $n = 16$ into the proof’s floor $\\tfrac n2(\\lg n - 1)$.',
    idea: 'Arithmetic, then a sanity check: the floor must come out below the true $\\lg(16!)$.',
    steps: [
      '$\\tfrac n2 = \\tfrac{16}{2} = 8$.',
      '$\\lg 16 = 4$, because $2^4 = 16$. So $\\lg n - 1 = 3$.',
      'Multiply: $8 \\cdot 3 = 24$.',
      'Sanity check: $\\lg(16!) \\approx 44.25$ and $n \\lg n = 64$. So $24 \\le 44.25 \\le 64$: the floor is loose, but it grows at the same $n \\lg n$ rate.',
    ],
    graph: { ...G_LG, marks: [{ x: 16, label: '$n = 16$' }], caption: 'At $n = 16$: floor 24, true $\\lg(16!) \\approx 44.25$, ceiling 64. All three curves keep the same $n \\lg n$ shape.' },
    answer: '24: $(16/2)(4 - 1) = 8 \\cdot 3$.',
    mistake: 'Using $\\ln$ or $\\log_{10}$ for lg. Here $\\lg = \\log_2$, so $\\lg 16 = 4$; with $\\ln 16 \\approx 2.77$ you would get about 14.2.',
    tryIt: { q: 'Evaluate the floor at $n = 64$ and compare with $\\lg(64!) \\approx 296.0$.', a: '$\\tfrac{64}{2}(\\lg 64 - 1) = 32 \\cdot 5 = 160$, below 296.0 as it must be.' },
  };

  H['c310-lowerbound-insertion-leaf'] = {
    asks: 'Run the input $a_1 = 6, a_2 = 8, a_3 = 5$ down Figure 8.1 (insertion sort on 3 elements) and name the leaf it reaches.',
    idea: 'At each node "$i{:}j$", compare $a_i$ with $a_j$: go left if $a_i \\le a_j$, right if $a_i > a_j$. Stop at a leaf; it lists the positions in sorted order.',
    steps: [
      'Root 1:2: $a_1 = 6$, $a_2 = 8$. $6 \\le 8$: go left, to 2:3.',
      '2:3: $a_2 = 8$, $a_3 = 5$. $8 > 5$: go right, to 1:3.',
      '1:3: $a_1 = 6$, $a_3 = 5$. $6 > 5$: go right, to leaf ⟨3, 1, 2⟩.',
      'Read the leaf as positions: $a_3 \\le a_1 \\le a_2$, i.e. $5 \\le 6 \\le 8$. Sorted, after 3 comparisons.',
      'In insertion-sort terms: 8 stays after 6; then 5 is compared with 8, then with 6, and moves to the front.',
    ],
    tree: {
      sumsLabel: 'test',
      levels: [
        { nodes: ['1:2'], sum: '$6 \\le 8$: left' },
        { nodes: ['2:3'], sum: '$8 > 5$: right' },
        { nodes: ['1:3'], sum: '$6 > 5$: right' },
        { nodes: ['⟨3,1,2⟩'], sum: '$5 \\le 6 \\le 8$' },
      ],
      caption: 'The path that ⟨6, 8, 5⟩ takes through Figure 8.1: three comparisons, ending at ⟨3, 1, 2⟩.',
    },
    answer: '⟨3, 1, 2⟩, meaning $a_3 \\le a_1 \\le a_2$ ($5 \\le 6 \\le 8$).',
    mistake: 'Writing the sorted values (5, 6, 8) instead of the leaf. The leaf names positions: 3, 1, 2.',
    tryIt: { q: 'Same tree, input $a_1 = 7, a_2 = 3, a_3 = 5$. Which leaf?', a: '1:2: $7 > 3$, right. 1:3: $7 > 5$, right. 2:3: $3 \\le 5$, left. Leaf ⟨2, 3, 1⟩ ($3 \\le 5 \\le 7$).' },
  };

  H['c310-lowerbound-best-case'] = {
    asks: 'Insertion sort makes only $n - 1$ comparisons on sorted input. Does that contradict the $\\Omega(n \\lg n)$ lower bound?',
    idea: 'The bound is about the deepest leaf, not every leaf. A tree may have some short paths as long as it is tall somewhere.',
    steps: [
      'What the theorem says: height $\\ge \\lg(n!)$. The height is the longest path, which belongs to the worst input.',
      'Figure 8.1: sorted input goes 1:2 left, 2:3 left, to leaf ⟨1, 2, 3⟩ at depth 2. Four other leaves are at depth 3, so the height is $3 \\ge \\lg 6 \\approx 2.58$.',
      'For $n$ elements, sorted input makes $n - 1$ comparisons: each new key is compared once with its left neighbour and stays put. That is one short path.',
      { text: 'For $n = 10$:', table: { head: ['', 'comparisons'], rows: [['sorted input (one leaf)', '9'], ['lower bound on the height', '22'], ['insertion sort’s height (worst case)', '45']] } },
      'No contradiction: the bound only demands some path of length at least 22, and insertion sort’s longest is 45.',
    ],
    tree: { ...FIG81_TOP, caption: 'Sorted input stops at ⟨1, 2, 3⟩ after 2 comparisons. The tree is still height 3: ⟨1,3,2⟩, ⟨3,1,2⟩ (under the left 1:3) and ⟨2,3,1⟩, ⟨3,2,1⟩ (under the right 2:3) are at depth 3.' },
    answer: 'No. The bound is on the WORST case: the tree’s height must be $\\ge \\lg(n!)$. Single leaves, like the sorted input’s, can be much shallower.',
    mistake: 'Reading $\\Omega(n \\lg n)$ as "every input takes $n \\lg n$". It is a worst-case statement: at least one input must.',
    tryIt: { q: 'In Figure 8.1, which other leaf is reached after only 2 comparisons? Give an input that reaches it.', a: '⟨2, 1, 3⟩, via 1:2 right then 1:3 left. Example: $a = ⟨4, 1, 8⟩$ ($4 > 1$, then $4 \\le 8$).' },
  };

  H['c310-lowerbound-optimal'] = {
    asks: 'What does the $\\Omega(n \\lg n)$ lower bound let you conclude about merge sort and heapsort?',
    idea: 'The lower bound is a floor for every comparison sort, and merge sort and heapsort already reach it, up to a constant factor. When the best possible and what you have meet, you have found the optimum.',
    steps: [
      'Merge sort and heapsort: worst case $O(n \\lg n)$, a ceiling for these two algorithms.',
      'Every comparison sort, these two included, has worst case $\\Omega(n \\lg n)$: the floor.',
      'Ceiling and floor are both multiples of $n \\lg n$, so their worst case is $\\Theta(n \\lg n)$: tight.',
      'Optimal: no comparison sort can beat them by more than a constant factor in the worst case.',
      { text: 'Worst-case comparisons:', table: { head: ['$n$', 'merge sort', 'floor $\\lceil \\lg n! \\rceil$', 'insertion sort'], rows: [['16', '49', '45', '120'], ['100', '573', '525', '4,950'], ['1000', '8,977', '8,530', '499,500']] } },
      'Merge sort stays within 10% of the floor here; insertion sort’s gap keeps growing.',
    ],
    graph: G_SORTS,
    answer: 'Their $O(n \\lg n)$ worst case matches the lower bound, so they are asymptotically optimal comparison sorts, and their worst case is tight: $\\Theta(n \\lg n)$.',
    mistake: 'Reading "optimal" as "no faster sort exists". Counting and radix sort beat $n \\lg n$ by not comparing; optimal here means among comparison sorts, up to a constant factor.',
    tryIt: { q: 'Quicksort’s worst case is $\\Theta(n^2)$. Is it asymptotically optimal by this argument?', a: 'No. Its worst case exceeds the $\\Omega(n \\lg n)$ floor by more than any constant factor; the bound only says $n \\lg n$ is the best possible.' },
  };

  H['c310-lowerbound-scope'] = {
    asks: 'State the sorting lower bound with all its conditions, and explain how counting sort and radix sort get under it.',
    idea: 'The proof only counts yes/no answers to comparisons. An algorithm that learns from the values themselves, by using a key as an array index, is not a tree of comparisons, so the proof says nothing about it.',
    steps: [
      'Precise statement: every comparison-based sort makes $\\Omega(n \\lg n)$ comparisons in the worst case.',
      'Two conditions: "comparison-based" (only pair comparisons give order information) and "worst case" (some input forces that many).',
      'Counting sort: keys are integers in $0..k$, counted with C[A[j]] += 1. Time $O(n + k)$, with no comparisons between elements.',
      'Radix sort: $d$ passes of a stable counting sort, one per digit: $O(d(n + k))$. With fixed $d$ and $k = O(n)$, that is $O(n)$.',
      { text: 'Sorting $n = 1{,}000{,}000$ bytes (values 0–255, so $k = 255$):', table: { head: ['method', 'work'], rows: [['counting sort, $n + k$', '1,000,255 steps'], ['any comparison sort, worst case', 'at least $\\lceil \\lg(10^6!) \\rceil = 18{,}488{,}885$ comparisons']] } },
      'The price: they need assumptions about the keys (small integer range, fixed number of digits). For keys known only through comparisons, $\\Omega(n \\lg n)$ still stands.',
    ],
    graph: {
      caption: 'With $k = 255$, counting sort’s $n + 255$ line drops below the comparison floor $\\lg(n!)$ from $n = 69$ on, and the gap keeps widening.',
      x: [2, 200], xLabel: 'n', yLabel: 'steps',
      curves: [{ label: 'counting sort $n + 255$', f: n => n + 255, tone: 'b' }, { label: 'comparison floor $\\lg(n!)$', f: lgFact, tone: 'a' }],
      marks: [{ x: 69, label: '$n = 69$' }],
    },
    answer: 'Comparison-based sorting has a worst-case lower bound of $\\Omega(n \\lg n)$. Counting and radix sort do not rely only on comparisons; with assumptions about the keys (small integer range, fixed digits) they run faster.',
    mistake: 'Saying "no sort can beat $n \\lg n$". Only comparison sorts are bound by it; counting and radix sort beat it by using the key values, under their assumptions.',
    tryIt: { q: 'Radix sort on 1,000,000 nine-digit IDs, one decimal digit per pass (10 counters). About how many steps, compared with the comparison-sort floor?', a: '9 passes × $(10^6 + 10) \\approx 9{,}000{,}090$ steps, about half of $\\lceil \\lg(10^6!) \\rceil = 18{,}488{,}885$. And it grows linearly in $n$.' },
  };
})(globalThis.FC = globalThis.FC || {});
