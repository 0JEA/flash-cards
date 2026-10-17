// Help walkthroughs for the CSC 310 Lecture 7 quicksort cards (and the merge sort trade-off card)
// plus the hash-table / chaining cards. Same entry format as decks/csc310-help.js (see its header).
// PARTITION is the course's version (Lecture 7, p. 6): pivot = A[end], smallerCounter = start − 1,
// 1-based indices. Every trace, comparison count, slot and tryIt answer was computed with python3
// running that exact pseudocode on 2026-10-16.
// Academic integrity: no Assignment 3 code, data, timings or discussion answers (median-of-three,
// runtime tables, locality) and no hash-table assignment code, data or discussion answers appear here.
// tryIt problems use arrays and keys that no assignment uses.
(function (FC) {
  'use strict';
  const H = FC.help = FC.help || {};

  // ── shared pictures ──
  const PHEAD = ['$j$', 'A[$j$]', 'A[$j$] $\\le$ pivot?', 'smallerCounter', 'A afterwards'];
  const lg = Math.log2;

  const WORST_TREE = {
    sumsLabel: 'level total',
    levels: [
      { nodes: ['$cn$'], sum: '$cn$' },
      { nodes: ['$c(n-1)$'], sum: '$c(n-1)$' },
      { nodes: ['$c(n-2)$'], sum: '$c(n-2)$' },
      { gap: true },
      { nodes: ['$2c$'], sum: '$2c$' },
    ],
    caption: 'Sorted input: every call has one empty part (not drawn), so the tree is a single path $n - 1$ levels deep. The right column is $cn + c(n-1) + \\dots + 2c$.',
  };
  const BEST_TREE = {
    sumsLabel: 'level total',
    levels: [
      { nodes: ['$cn$'], sum: '$cn$' },
      { nodes: ['$\\tfrac{cn}{2}$', '$\\tfrac{cn}{2}$'], sum: '$cn$' },
      { nodes: ['$\\tfrac{cn}{4}$', '$\\tfrac{cn}{4}$', '$\\tfrac{cn}{4}$', '$\\tfrac{cn}{4}$'], sum: '$cn$' },
      { gap: true },
      { nodes: ['$c$', '$c$', '$\\cdots$', '$c$', '$c$'], sum: '$\\le cn$' },
    ],
    caption: 'Balanced splits: the piece size halves each level, so there are about $\\lg n$ levels, each costing about $cn$. (The pivots removed at each level make the real totals a little less than $cn$.)',
  };
  const SPLIT99_TREE = {
    sumsLabel: 'level total',
    levels: [
      { nodes: ['$cn$'], sum: '$cn$' },
      { nodes: ['$\\tfrac{cn}{100}$', '$\\tfrac{99cn}{100}$'], sum: '$cn$' },
      { nodes: ['$\\tfrac{cn}{10^4}$', '$\\tfrac{99cn}{10^4}$', '$\\tfrac{99cn}{10^4}$', '$\\tfrac{9801cn}{10^4}$'], sum: '$cn$' },
      { gap: true },
      { nodes: ['$c$', '$\\cdots$', '$c$'], sum: '$\\le cn$' },
    ],
    caption: 'Each level still adds up to $cn$ until the thin left branches run out (depth $\\log_{100} n$); after that the levels cost less than $cn$. The fat right branch ends at depth $\\log_{100/99} n$.',
  };

  // ═══════════════════════ Quicksort: running times ═══════════════════════

  H['c310-7-worst-time'] = {
    asks: 'Give quicksort’s running time on the worst possible input of size $n$, as a big-O.',
    idea: 'Quicksort is fast when the pivot lands near the middle, because then each call hands half the work to each side. In the worst case the pivot lands at an end every time, so each call only peels off one element (the pivot) and the next call has almost the whole array again.',
    steps: [
      'PARTITION on a piece of size $k$ looks at every element once, so it costs about $ck$.',
      'Worst split: $n - 1$ elements on one side and $0$ on the other. The next call works on $n - 1$ elements, then $n - 2$, and so on down to 2.',
      'Add the partition costs: $cn + c(n-1) + \\dots + 2c = c\\,(n + (n-1) + \\dots + 2)$.',
      'Arithmetic series: $1 + 2 + \\dots + n = \\frac{n(n+1)}{2}$. Our sum has no $1$, so it is $\\frac{n(n+1)}{2} - 1$, and $T(n) = c\\left(\\frac{n(n+1)}{2} - 1\\right)$.',
      'The biggest term is $\\frac{c}{2}n^2$, so $T(n) = \\Theta(n^2)$, which in particular is $O(n^2)$.',
      { text: 'Counting comparisons on sorted input of size $n$ gives $(n-1) + (n-2) + \\dots + 1 = \\frac{n(n-1)}{2}$:', table: { head: ['$n$', '8', '16', '32', '64'], rows: [['comparisons $\\tfrac{n(n-1)}{2}$', '28', '120', '496', '2016'], ['$n \\lg n$ for scale', '24', '64', '160', '384']] } },
    ],
    tree: WORST_TREE,
    graph: {
      caption: 'Bars: comparisons the course’s quicksort makes on sorted input. They follow $\\frac{n(n-1)}{2}$, a parabola, and leave $n \\lg n$ far behind.',
      x: [2, 66], y: [0, 2200], xLabel: 'n', yLabel: 'comparisons',
      curves: [
        { label: '$\\tfrac{n(n-1)}{2}$ (worst case)', f: n => n * (n - 1) / 2, tone: 'a' },
        { label: '$n \\lg n$', f: n => n * lg(n), tone: 'c' },
      ],
      bars: { label: 'sorted input, counted', tone: 'b', values: [[8, 28], [16, 120], [32, 496], [64, 2016]] },
    },
    answer: '$O(n^2)$ (in fact $\\Theta(n^2)$): with an $n-1$ / $0$ split at every level the partition work is $c(n + (n-1) + \\dots + 2)$, an arithmetic series.',
    mistake: 'Answering $O(n \\lg n)$ because that is the usual speed. The worst case asks about the worst input, and one bad split per level is enough to make it quadratic.',
    tryIt: { q: 'How many comparisons does the course’s quicksort make on a sorted array of 100 elements?', a: '$99 + 98 + \\dots + 1 = \\frac{100 \\cdot 99}{2} = 4950$. For scale, $100 \\lg 100 \\approx 664$.' },
  };

  H['c310-7-expected-time'] = {
    asks: 'Give quicksort’s expected (average-case) running time as a big-O.',
    idea: 'The worst case needs a terrible pivot at every single level, which almost never happens. A typical pivot lands somewhere in the middle part, and Lecture 7 shows that even a lopsided but proportional split (9-to-1) keeps the tree only $\\Theta(\\lg n)$ deep.',
    steps: [
      'Lecture 7’s model (p. 17): suppose every split is 9-to-1, $T(n) = T(\\tfrac{9n}{10}) + T(\\tfrac{n}{10}) + \\Theta(n)$.',
      'Per level: the pieces on one level are disjoint parts of the array, so together they hold at most $n$ elements. Partitioning them costs at most $cn$.',
      'Depth: the longest path always takes the $\\tfrac{9}{10}$ side. The size reaches 1 when $(\\tfrac{9}{10})^k n = 1$, i.e. $n = (\\tfrac{10}{9})^k$, so $k = \\log_{10/9} n$.',
      'Change of base: $\\log_{10/9} n = \\frac{\\lg n}{\\lg(10/9)} \\approx 6.58 \\lg n$. A constant times $\\lg n$ is still $\\Theta(\\lg n)$.',
      'Total: (at most $cn$ per level) $\\times$ ($\\Theta(\\lg n)$ levels) $= O(n \\lg n)$. Only the steady $n-1$ / $0$ split escapes this, and random input almost never does that.',
    ],
    graph: {
      caption: 'Even the 9-to-1 bound $n \\log_{10/9} n \\approx 6.58\\,n \\lg n$ is only a constant times $n \\lg n$. The worst case $n^2$ passes it at $n \\approx 33$ and pulls away.',
      x: [2, 200], y: [0, 12000], xLabel: 'n', yLabel: 'work',
      curves: [
        { label: '$n^2$ (worst case)', f: n => n * n, tone: 'a' },
        { label: '$n \\log_{10/9} n$ (9-to-1 splits)', f: n => n * Math.log(n) / Math.log(10 / 9), tone: 'b' },
        { label: '$n \\lg n$', f: n => n * lg(n), tone: 'c' },
      ],
      marks: [{ x: 33.3, label: '$n \\approx 33$' }],
    },
    answer: '$O(n \\lg n)$: any split by a constant proportion gives depth $\\Theta(\\lg n)$ with at most $cn$ work per level.',
    mistake: 'Thinking the average is "halfway between" $n \\lg n$ and $n^2$. Bad splits are rare and even uneven proportional splits cost only a constant factor, so the average stays $n \\lg n$.',
    tryIt: { q: 'If every split were 9-to-1, how deep would the deepest leaf be for $n = 5000$? Compare with $\\lg 5000$.', a: '$\\log_{10/9} 5000 = \\frac{\\ln 5000}{\\ln(10/9)} \\approx \\frac{8.517}{0.1054} \\approx 81$, versus $\\lg 5000 \\approx 12.3$. About 6.6 times deeper: a constant factor.' },
  };

  H['c310-7-dc-steps'] = {
    asks: "Say what quicksort’s divide step does to A[p..r].",
    idea: 'Picture sorting a pile of exam papers: pick the last one’s mark as a dividing line, toss lower-or-equal marks to the left and higher marks to the right, and put the dividing paper in the middle. Sort each pile the same way. When both piles are sorted, the stack is sorted; there is nothing to merge.',
    steps: [
      'Divide: pivot = A[r] (the last element). PARTITION rearranges A[p..r] so that A[p..q−1] $\\le$ A[q] $<$ A[q+1..r], and returns q.',
      { text: 'Example A = {3, 6, 1, 5, 2, 4}: pivot 4, PARTITION gives {3, 1, 2, 4, 6, 5} with q = 4.', table: { head: ['part', 'indices', 'elements', 'relation to pivot 4'], rows: [['left', '1..3', '3, 1, 2', 'all $\\le 4$'], ['pivot', '4', '4', 'final place'], ['right', '5..6', '6, 5', 'all $> 4$']] } },
      'Conquer: QUICKSORT(A, 1, 3) turns 3, 1, 2 into 1, 2, 3, and QUICKSORT(A, 5, 6) turns 6, 5 into 5, 6.',
      'Combine: nothing to do. The array now reads 1, 2, 3, 4, 5, 6 because every left element was already below every right element.',
      'Contrast with merge sort (Lecture 4): it splits by position and does its work in the combine step (Merge). Quicksort splits by value and does its work in the divide step (PARTITION).',
    ],
    tree: {
      sumsLabel: 'pivots placed',
      levels: [
        { nodes: ['3 6 1 5 2 4'], sum: '4' },
        { nodes: ['3 1 2', '6 5'], sum: '2, 5' },
        { nodes: ['1', '3', '(empty)', '6'], sum: 'base cases' },
      ],
      caption: 'Each call places its pivot for good and passes the two sides down. Nothing is ever merged on the way back up.',
    },
    answer: "Pick the last element as pivot and partition A[p..r] into A[p..q−1] ($\\le$ A[q]) and A[q+1..r] ($>$ A[q]), computing q. (Conquer then sorts both parts; combine does nothing.)",
    mistake: 'Copying merge sort’s steps ("divide in half, combine by merging"). Quicksort’s split is wherever the pivot lands, not the middle, and its combine step is empty.',
    tryIt: { q: 'For A = {4, 8, 2, 6, 1, 5}: what does the divide step produce, and which two calls does the conquer step make?', a: 'Pivot 5. PARTITION gives {4, 2, 1, 5, 8, 6}, q = 4. Conquer calls QUICKSORT(A, 1, 3) on 4, 2, 1 and QUICKSORT(A, 5, 6) on 8, 6. Combine: nothing.' },
  };

  // ═══════════════════════ PARTITION ═══════════════════════

  H['c310-7-partition-post'] = {
    asks: "After PARTITION(A, p, r) returns q, say how the elements of A[p..q−1] compare with A[q].",
    idea: 'PARTITION is a bouncer at a door marked with the pivot’s value: everyone $\\le$ pivot goes left, everyone $>$ pivot goes right, and the pivot stands in the doorway. Nobody inside either room is sorted yet; they are only on the correct side.',
    steps: [
      { text: 'Run it on A = {6, 3, 9, 2, 7, 5} (pivot 5):', table: { head: PHEAD, rows: [['1', '6', 'no', '0', '6, 3, 9, 2, 7, 5'], ['2', '3', 'yes', '1', '3, 6, 9, 2, 7, 5'], ['3', '9', 'no', '1', '3, 6, 9, 2, 7, 5'], ['4', '2', 'yes', '2', '3, 2, 9, 6, 7, 5'], ['5', '7', 'no', '2', '3, 2, 9, 6, 7, 5']] } },
      'Final swap A[3] with A[6]: A = {3, 2, 5, 6, 7, 9}, and PARTITION returns q = 3.',
      'Check the three claims: A[1..2] = {3, 2}, both $\\le 5$; A[3] = 5, the pivot; A[4..6] = {6, 7, 9}, all $> 5$.',
      'A[q] is in its final sorted place: exactly $q - p$ elements are smaller-or-equal and sit before it, and the rest sit after it, so sorting either side never moves it.',
      'Either part may be empty: if the pivot is the largest element, A[q+1..r] has nothing in it.',
    ],
    answer: "Every element of A[p..q−1] is $\\le$ A[q] (and every element of A[q+1..r] is $>$ A[q]; A[q] is the pivot in its final place). The left part may be empty.",
    mistake: 'Saying the left and right parts come out sorted. Here the left part is {3, 2}: on the correct side, but still out of order; the recursive calls sort it.',
    tryIt: { q: 'PARTITION on A = {5, 2, 8, 1, 9, 3, 7}: give A afterwards and q, then check the three claims.', a: 'A = {5, 2, 1, 3, 7, 8, 9}, q = 5. A[1..4] = {5, 2, 1, 3} all $\\le 7$; A[5] = 7; A[6..7] = {8, 9} all $> 7$.' },
  };

  H['c310-7-pivot-choice'] = {
    asks: 'Which position in A[start..end] does the course’s PARTITION take its pivot from?',
    idea: 'The first line of PARTITION answers it: pivot = A[end]. Taking a fixed position is simple, but it means the input decides how good the pivot is. On sorted input the last element is always the biggest one, the worst possible choice.',
    steps: [
      'Read line 1 of PARTITION(A, start, end): pivot = A[end]. So the pivot is the last element of the piece being partitioned.',
      'Example: on {3, 6, 1, 5, 2, 4} the pivot is 4; the loop compares each of 3, 6, 1, 5, 2 with it.',
      { text: 'Now sorted input {1, 2, 3, 4, 5}. Each recursive call works on a sorted piece, so its last element is its maximum:', table: { head: ['call', 'piece', 'pivot = A[end]', 'split'], rows: [['QUICKSORT(A, 1, 5)', '1 2 3 4 5', '5 (max)', '4 / 0'], ['QUICKSORT(A, 1, 4)', '1 2 3 4', '4 (max)', '3 / 0'], ['QUICKSORT(A, 1, 3)', '1 2 3', '3 (max)', '2 / 0'], ['QUICKSORT(A, 1, 2)', '1 2', '2 (max)', '1 / 0']] } },
      'Every split is $n-1$ / $0$, which is the worst case from the analysis on p. 11.',
    ],
    answer: 'The last element: pivot = A[end] (A[r]).',
    mistake: 'Answering "the middle element" or "the first element". Other textbooks use those; this course’s PARTITION uses A[end], and that choice is why sorted input is the worst case.',
    tryIt: { q: 'On the reverse-sorted array {5, 4, 3, 2, 1}, what is the first pivot, and what split does the first PARTITION give?', a: 'Pivot = A[5] = 1, the minimum. No element is $\\le 1$, so smallerCounter stays 0 and the final swap gives {1, 4, 3, 2, 5}, q = 1: split 0 / 4.' },
  };

  H['c310-7-quicksort-order'] = {
    asks: 'Put the four lines of QUICKSORT(A, start, end) in the order the course writes them.',
    idea: 'Think of the order as: check there is something to sort, divide, then conquer each side. The pivot’s index pivotLoc is the fence between the two recursive calls, so both calls stop one short of it.',
    steps: [
      '"if start < end" comes first: a piece with 0 or 1 elements is already sorted, and this test stops the recursion.',
      '"pivotLoc = PARTITION(A, start, end)" is the divide step. The recursive calls need pivotLoc, so it must come before them.',
      '"QUICKSORT(A, start, pivotLoc − 1)" sorts the part before the pivot; "QUICKSORT(A, pivotLoc + 1, end)" sorts the part after it.',
      { text: 'Trace on A = {3, 1, 4, 2} with QUICKSORT(A, 1, 4):', table: { head: ['call', 'start < end?', 'what happens'], rows: [['QUICKSORT(A, 1, 4)', 'yes', 'PARTITION gives {1, 2, 4, 3}, pivotLoc = 2'], ['QUICKSORT(A, 1, 1)', 'no', 'one element: return'], ['QUICKSORT(A, 3, 4)', 'yes', 'PARTITION on 4, 3 gives 3, 4, pivotLoc = 3'], ['QUICKSORT(A, 3, 2)', 'no', 'empty: return'], ['QUICKSORT(A, 4, 4)', 'no', 'one element: return']] } },
      'Final array {1, 2, 3, 4}. The pivot index is never passed to either call, because that element is already in place.',
    ],
    answer: 'if start < end → pivotLoc = PARTITION(A, start, end) → QUICKSORT(A, start, pivotLoc − 1) → QUICKSORT(A, pivotLoc + 1, end).',
    mistake: 'Writing QUICKSORT(A, start, pivotLoc) (including the pivot). The pivot is already in its final spot, and on sorted input that call would get the same piece again and never stop.',
    tryIt: { q: 'Trace QUICKSORT(A, 1, 5) on {30, 90, 50, 70, 60}: which two recursive calls does the top call make?', a: 'PARTITION gives {30, 50, 60, 70, 90}, pivotLoc = 3. Then QUICKSORT(A, 1, 2) on 30, 50 and QUICKSORT(A, 4, 5) on 70, 90.' },
  };

  H['c310-7-partition-order'] = {
    asks: 'Put the lines of the course’s PARTITION(A, start, end) in order.',
    idea: 'Keep a growing "small" zone at the front of the array. Walk j across everything except the pivot; whenever A[j] is small, stretch the zone by one and swap A[j] into its new last slot. At the end, the pivot goes right after the zone.',
    steps: [
      'Setup, 2 lines: pivot = A[end]; smallerCounter = start − 1 (the small zone A[start..smallerCounter] starts empty).',
      'Loop, 2 lines: for j = start to end − 1; if A[j] $\\le$ pivot, then smallerCounter += 1 and swap A[smallerCounter] with A[j].',
      'Finish, 2 lines: swap A[smallerCounter + 1] with A[end] (pivot goes right after the zone); return smallerCounter + 1.',
      { text: 'Check the order by running it on A = {3, 7, 1, 8, 2, 5} (pivot 5, smallerCounter starts at 0):', table: { head: PHEAD, rows: [['1', '3', 'yes', '1', '3, 7, 1, 8, 2, 5'], ['2', '7', 'no', '1', '3, 7, 1, 8, 2, 5'], ['3', '1', 'yes', '2', '3, 1, 7, 8, 2, 5'], ['4', '8', 'no', '2', '3, 1, 7, 8, 2, 5'], ['5', '2', 'yes', '3', '3, 1, 2, 8, 7, 5']] } },
      'Final swap A[4] with A[6]: {3, 1, 2, 5, 7, 8}; return 4.',
    ],
    answer: 'pivot = A[end] → smallerCounter = start − 1 → for j = start to end − 1 → if A[j] $\\le$ pivot: smallerCounter += 1, swap A[smallerCounter] and A[j] → swap A[smallerCounter + 1] and A[end] → return smallerCounter + 1.',
    mistake: 'Swapping before incrementing smallerCounter. The counter points at the last small element, so it must move first to the slot just past the zone.',
    tryIt: { q: 'Run PARTITION on {8, 1, 6, 3, 7, 4}. Give A afterwards and the returned index.', a: 'Pivot 4. Only 1 and 3 are $\\le 4$: after the loop {1, 3, 6, 8, 7, 4}, smallerCounter = 2. Swap A[3] with A[6]: {1, 3, 4, 8, 7, 6}; return 3.' },
  };

  H['c310-7-trace-slide'] = {
    asks: 'Run the course’s PARTITION on {2, 8, 7, 1, 3, 5, 6, 4} and write down the array when it finishes.',
    idea: 'Track one number, smallerCounter: it marks the end of the "$\\le$ pivot" zone. Each time j finds a small element, the zone grows by one and the small element is swapped to its end. The pivot moves only once, at the very end.',
    steps: [
      'pivot = A[8] = 4. smallerCounter = 0. j runs from 1 to 7.',
      { text: 'One row per value of j:', table: { head: PHEAD, rows: [['1', '2', 'yes', '1', '2, 8, 7, 1, 3, 5, 6, 4'], ['2', '8', 'no', '1', '2, 8, 7, 1, 3, 5, 6, 4'], ['3', '7', 'no', '1', '2, 8, 7, 1, 3, 5, 6, 4'], ['4', '1', 'yes', '2', '2, 1, 7, 8, 3, 5, 6, 4'], ['5', '3', 'yes', '3', '2, 1, 3, 8, 7, 5, 6, 4'], ['6', '5', 'no', '3', '2, 1, 3, 8, 7, 5, 6, 4'], ['7', '6', 'no', '3', '2, 1, 3, 8, 7, 5, 6, 4']] } },
      'At j = 1, smallerCounter becomes 1 and A[1] swaps with itself: nothing visible changes.',
      'At j = 4, smallerCounter becomes 2, so A[2] = 8 (the first big element) swaps with A[4] = 1. At j = 5, A[3] = 7 swaps with A[5] = 3.',
      'Final swap: A[smallerCounter + 1] = A[4] = 8 with A[8] = 4. Result {2, 1, 3, 4, 7, 5, 6, 8}, and PARTITION returns 4.',
    ],
    answer: '2, 1, 3, 4, 7, 5, 6, 8 (pivot 4 lands at index 4).',
    mistake: 'Sorting the parts while partitioning, e.g. writing 1, 2, 3, 4, 5, 6, 7, 8. PARTITION only separates small from big; 7, 5, 6, 8 stay in whatever order the swaps left them.',
    tryIt: { q: 'Run PARTITION on {6, 1, 8, 3, 9, 2, 5}. Give A afterwards.', a: 'Pivot 5. Small elements 1, 3, 2 are found at j = 2, 4, 6: {1, 6, 8, 3, 9, 2, 5} → {1, 3, 8, 6, 9, 2, 5} → {1, 3, 2, 6, 9, 8, 5}. Swap A[4] with A[7]: {1, 3, 2, 5, 9, 8, 6}.' },
  };

  H['c310-7-prac-1'] = {
    asks: 'Run the course’s PARTITION on {5, 9, 1, 7, 3, 6} and give the array afterwards.',
    idea: 'Same routine every time: the pivot is the last element, j walks left to right, and each small element is swapped to the end of the small zone. Write one row per j and you cannot lose track.',
    steps: [
      'pivot = A[6] = 6, smallerCounter = 0, j = 1 to 5.',
      { text: 'Trace:', table: { head: PHEAD, rows: [['1', '5', 'yes', '1', '5, 9, 1, 7, 3, 6'], ['2', '9', 'no', '1', '5, 9, 1, 7, 3, 6'], ['3', '1', 'yes', '2', '5, 1, 9, 7, 3, 6'], ['4', '7', 'no', '2', '5, 1, 9, 7, 3, 6'], ['5', '3', 'yes', '3', '5, 1, 3, 7, 9, 6']] } },
      'j = 1 is a self-swap (A[1] with A[1]). At j = 3, the 1 trades places with the 9; at j = 5, the 3 trades places with the 9 again.',
      'Final swap A[4] = 7 with A[6] = 6: {5, 1, 3, 6, 9, 7}. Return 4.',
    ],
    answer: '5, 1, 3, 6, 9, 7.',
    mistake: 'Swapping the small element with the pivot’s slot or with the front of the array. It goes to A[smallerCounter] after the increment, the first slot past the small zone.',
    tryIt: { q: 'Run PARTITION on {4, 8, 2, 6, 1, 5}.', a: 'Pivot 5. j = 1: 4 yes (self-swap); j = 3: 2 swaps with 8 → {4, 2, 8, 6, 1, 5}; j = 5: 1 swaps with 8 → {4, 2, 1, 6, 8, 5}. Final swap A[4] with A[6]: {4, 2, 1, 5, 8, 6}.' },
  };

  H['c310-7-prac-2'] = {
    asks: 'Run the course’s PARTITION on {7, 2, 9, 4, 8, 1, 5} and give the array afterwards.',
    idea: 'Here the very first element is big, so smallerCounter stays at 0 for a while. The first small element found is then swapped all the way to the front, past the big 7.',
    steps: [
      'pivot = A[7] = 5, smallerCounter = 0, j = 1 to 6.',
      { text: 'Trace:', table: { head: PHEAD, rows: [['1', '7', 'no', '0', '7, 2, 9, 4, 8, 1, 5'], ['2', '2', 'yes', '1', '2, 7, 9, 4, 8, 1, 5'], ['3', '9', 'no', '1', '2, 7, 9, 4, 8, 1, 5'], ['4', '4', 'yes', '2', '2, 4, 9, 7, 8, 1, 5'], ['5', '8', 'no', '2', '2, 4, 9, 7, 8, 1, 5'], ['6', '1', 'yes', '3', '2, 4, 1, 7, 8, 9, 5']] } },
      'Each "yes" swaps the small element with the leftmost big one: 2 with 7, then 4 with 7, then 1 with 9.',
      'Final swap A[4] = 7 with A[7] = 5: {2, 4, 1, 5, 8, 9, 7}. Return 4.',
    ],
    answer: '2, 4, 1, 5, 8, 9, 7.',
    mistake: 'Incrementing smallerCounter on a "no". It only moves when A[j] $\\le$ pivot; at j = 1 it stays 0.',
    tryIt: { q: 'Run PARTITION on {9, 3, 7, 1, 6, 2, 4}.', a: 'Pivot 4. Small elements 3, 1, 2 at j = 2, 4, 6: {3, 9, 7, 1, 6, 2, 4} → {3, 1, 7, 9, 6, 2, 4} → {3, 1, 2, 9, 6, 7, 4}. Swap A[4] with A[7]: {3, 1, 2, 4, 6, 7, 9}.' },
  };

  // ═══════════════════════ Quicksort analysis ═══════════════════════

  H['c310-7-example-sorted-part'] = {
    asks: "In the slide-8 example, the left part {10, 35, 40, 55} keeps splitting into \"everything\" and \"nothing\". Explain why.",
    idea: 'The pivot is always the last element. In a sorted piece the last element is the largest, so every other element is $\\le$ it and they all land on the left. The right side is empty every time.',
    steps: [
      'The first PARTITION of {10, 80, 35, 85, 40, 55, 70} leaves {10, 35, 40, 55} on the left, and this piece happens to be in sorted order.',
      { text: 'Partition that piece and each piece after it:', table: { head: ['piece', 'pivot (last)', 'is it the max?', 'left part', 'right part'], rows: [['10, 35, 40, 55', '55', 'yes', '10, 35, 40', '(empty)'], ['10, 35, 40', '40', 'yes', '10, 35', '(empty)'], ['10, 35', '35', 'yes', '10', '(empty)']] } },
      'In each run every test A[j] $\\le$ pivot is "yes", so smallerCounter reaches end − 1 and the final swap is the pivot with itself.',
      'So each call peels off one element and passes the rest down: sizes 4, 3, 2, 1. Comparisons: $3 + 2 + 1 = 6$.',
    ],
    tree: {
      sumsLabel: 'comparisons',
      levels: [
        { nodes: ['10 35 40 55'], sum: '3' },
        { nodes: ['10 35 40'], sum: '2' },
        { nodes: ['10 35'], sum: '1' },
        { nodes: ['10'], sum: '0' },
      ],
      caption: 'Slide 8’s left branch: each call’s right part is empty (not drawn), so the tree is a straight path. That is the worst-case shape.',
    },
    answer: "The part is already sorted, so its last element (the pivot) is always its maximum: every split is $n-1$ and $0$.",
    mistake: 'Blaming the values (they are "spread out") or the size. Only the order matters: sorted order makes the last element the maximum.',
    tryIt: { q: 'Quicksort on {30, 90, 50, 70, 60}: what are the two parts after the first PARTITION, and how does each of them split next?', a: 'Pivot 60 gives {30, 50, 60, 70, 90}: parts {30, 50} and {70, 90}. Both are sorted, so their pivots 50 and 90 are maxima and each splits 1 / 0.' },
  };

  H['c310-7-worst-when'] = {
    asks: "For the last-element-pivot quicksort, name the input the course gives as the worst case.",
    idea: 'The worst split is the most lopsided one: all the other elements on one side. That happens when the pivot is the largest (or smallest) value. With pivot = A[end], an already-sorted array puts the largest value at the end of every piece.',
    steps: [
      { text: 'PARTITION on the sorted piece {10, 20, 30, 40} (pivot 40):', table: { head: PHEAD, rows: [['1', '10', 'yes', '1', '10, 20, 30, 40'], ['2', '20', 'yes', '2', '10, 20, 30, 40'], ['3', '30', 'yes', '3', '10, 20, 30, 40']] } },
      'Every test is "yes", so smallerCounter ends at 3. The final swap is A[4] with A[4] and PARTITION returns 4: left part has 3 elements, right part has 0.',
      'The left part {10, 20, 30} is still sorted, so the same thing happens again on 3 elements, then 2.',
      'Each level removes only the pivot, so there are $n - 1$ levels of work $cn, c(n-1), \\dots$: the recurrence $T(n) = T(n-1) + \\Theta(n)$ from p. 11.',
    ],
    tree: WORST_TREE,
    answer: "An already-sorted array: each pivot is the maximum of its piece, so every PARTITION splits $n - 1$ and $0$.",
    mistake: 'Saying "a random array" or "an array with many swaps". Sorted input makes no swaps at all and is still the worst case, because the cost comes from the split, not from swapping.',
    tryIt: { q: 'Run the first PARTITION on the reverse-sorted piece {40, 30, 20, 10}. What split do you get?', a: 'Pivot 10 is the minimum: every test is "no", smallerCounter stays 0, and the final swap A[1] with A[4] gives {10, 30, 20, 40}, q = 1. Split 0 / 3: also worst-case.' },
  };

  H['c310-7-sorted-comps'] = {
    asks: 'Count every A[j] $\\le$ pivot test the course’s quicksort makes while sorting {1, 2, 3, 4, 5}.',
    idea: 'PARTITION on a piece of $k$ elements makes exactly $k - 1$ comparisons: one for each element except the pivot. So you only need the size of every piece that gets partitioned.',
    steps: [
      'On sorted input each pivot is the maximum, so each call leaves a piece one element smaller and an empty piece.',
      { text: 'List the calls that run PARTITION (start < end):', table: { head: ['call', 'piece size', 'comparisons', 'split'], rows: [['QUICKSORT(A, 1, 5)', '5', '4', '4 / 0'], ['QUICKSORT(A, 1, 4)', '4', '3', '3 / 0'], ['QUICKSORT(A, 1, 3)', '3', '2', '2 / 0'], ['QUICKSORT(A, 1, 2)', '2', '1', '1 / 0']] } },
      'Calls on 1 element or on an empty piece fail start < end and compare nothing.',
      'Total: $4 + 3 + 2 + 1 = 10$. In general $(n-1) + \\dots + 1 = \\frac{n(n-1)}{2}$, and $\\frac{5 \\cdot 4}{2} = 10$.',
    ],
    graph: {
      caption: 'Comparisons on sorted input of size $n$ (bars, counted by running the course’s quicksort) sit exactly on $\\frac{n(n-1)}{2}$.',
      x: [1, 9], y: [0, 30], xLabel: 'n', yLabel: 'comparisons',
      curves: [{ label: '$\\tfrac{n(n-1)}{2}$', f: n => n * (n - 1) / 2, tone: 'a' }],
      bars: { label: 'sorted {1..n}', tone: 'b', values: [[2, 1], [3, 3], [4, 6], [5, 10], [6, 15], [7, 21], [8, 28]] },
      marks: [{ x: 5, label: '$n = 5$: 10' }],
    },
    answer: '10: the splits are 4/0, 3/0, 2/0, 1/0, so $4 + 3 + 2 + 1 = 10 = \\frac{n(n-1)}{2}$.',
    mistake: 'Counting $k$ comparisons for a piece of size $k$ (giving 14). j runs from start to end − 1, so the pivot is never compared with itself.',
    tryIt: { q: 'How many comparisons on the sorted array {1, 2, 3, 4, 5, 6, 7, 8}?', a: '$7 + 6 + 5 + 4 + 3 + 2 + 1 = \\frac{8 \\cdot 7}{2} = 28$.' },
  };

  H['c310-7-best-case'] = {
    asks: "Write the recurrence for quicksort’s best case.",
    idea: 'The best pivot is the median, which cuts the piece into two equal halves. Then quicksort has exactly merge sort’s shape: two half-size calls plus linear work per call.',
    steps: [
      'Best split: sizes about $n/2$ and $n/2$ (exactly $\\frac{n-1}{2}$ each, since the pivot leaves).',
      'Cost of one call: PARTITION is $\\Theta(n)$, plus two calls on half the size: $T(n) = 2T(n/2) + \\Theta(n)$.',
      'Recursion tree (p. 14): every level costs $cn$, the size halves each level so there are $\\lg n$ levels, and $T(n) = cn \\lg n = \\Theta(n \\lg n)$.',
      { text: 'Counted comparisons when every pivot is the median ($n = 2^k - 1$) versus sorted input:', table: { head: ['$n$', '7', '15', '31', '63'], rows: [['best (median pivots)', '10', '34', '98', '258'], ['worst (sorted)', '21', '105', '465', '1953']] } },
      'Check $n = 15$: one partition of 15 (14 comparisons), two of 7 (6 each), four of 3 (2 each): $14 + 12 + 8 = 34$.',
    ],
    tree: BEST_TREE,
    graph: {
      caption: 'Bars: best-case comparison counts. They track $n \\lg n$, while the worst case $\\frac{n(n-1)}{2}$ climbs away.',
      x: [1, 66], y: [0, 2100], xLabel: 'n', yLabel: 'comparisons',
      curves: [
        { label: '$\\tfrac{n(n-1)}{2}$ (worst)', f: n => n * (n - 1) / 2, tone: 'a' },
        { label: '$n \\lg n$', f: n => n * lg(n), tone: 'c' },
      ],
      bars: { label: 'best case, counted', tone: 'b', values: [[7, 10], [15, 34], [31, 98], [63, 258]] },
    },
    answer: "$T(n) = 2T(n/2) + \\Theta(n)$ (balanced halves, same recurrence as merge sort); it solves to $\\Theta(n \\lg n)$.",
    mistake: 'Thinking the best case is sorted input because "nothing needs to move". For this quicksort sorted input is the worst case; the best case is about where the pivots land.',
    tryIt: { q: 'Every pivot is the median and $n = 31$. Count the comparisons level by level.', a: 'Pieces: one of 31, two of 15, four of 7, eight of 3. Comparisons $30 + 2 \\cdot 14 + 4 \\cdot 6 + 8 \\cdot 2 = 30 + 28 + 24 + 16 = 98$.' },
  };

  H['c310-7-99to1'] = {
    asks: 'If PARTITION always splits 99-to-1, what is quicksort’s running time? Justify it with the recursion tree.',
    idea: 'A 99-to-1 split looks terrible, but it still throws away a fixed fraction (1%) of the work into the small side each time. Shrinking by a constant factor per level means the depth is logarithmic. Each level still costs at most $cn$, so the total is $cn$ times a log.',
    steps: [
      'Recurrence: $T(n) = T(\\tfrac{99n}{100}) + T(\\tfrac{n}{100}) + \\Theta(n)$.',
      'Level cost: the pieces on one level are disjoint parts of the array, so they hold at most $n$ elements together and cost at most $cn$.',
      'Shallowest leaf (always the $\\tfrac{1}{100}$ side): $n/100^k = 1$ gives $k = \\log_{100} n$. Deepest leaf (always the $\\tfrac{99}{100}$ side): $(\\tfrac{99}{100})^k n = 1$ gives $n = (\\tfrac{100}{99})^k$, so $k = \\log_{100/99} n$.',
      'Change of base: $\\log_{100/99} n = \\frac{\\lg n}{\\lg(100/99)} \\approx 69 \\lg n$. That is a constant times $\\lg n$, so the depth is $\\Theta(\\lg n)$.',
      'Total: at most $cn$ per level $\\times$ $\\Theta(\\lg n)$ levels $= O(n \\lg n)$. The 99-to-1 split only made the constant bigger.',
    ],
    tree: SPLIT99_TREE,
    graph: {
      caption: 'Log scale. The 99-to-1 bound $n \\log_{100/99} n \\approx 69\\,n \\lg n$ starts above $n^2$, but $n^2$ overtakes it near $n \\approx 643$ and the gap keeps widening.',
      x: [2, 4000], y: [1, 2e7], logY: true, xLabel: 'n', yLabel: 'work',
      curves: [
        { label: '$n^2$ (worst case)', f: n => n * n, tone: 'a' },
        { label: '$n \\log_{100/99} n$ (99-to-1)', f: n => n * Math.log(n) / Math.log(100 / 99), tone: 'b' },
        { label: '$n \\lg n$', f: n => n * lg(n), tone: 'c' },
      ],
      marks: [{ x: 643, label: '$n \\approx 643$' }],
    },
    answer: 'Still $O(n \\lg n)$: $T(n) = T(99n/100) + T(n/100) + \\Theta(n)$, each level costs at most $cn$, and the depth is $\\log_{100/99} n = \\Theta(\\lg n)$. Only the constant factor grows.',
    mistake: 'Treating 99-to-1 like the worst case. The worst case removes one element per level (not proportional); 99-to-1 removes 1% per level, which still gives logarithmic depth.',
    tryIt: { q: 'Every split is 3-to-1. Give the recurrence and the depth of the deepest leaf.', a: '$T(n) = T(\\tfrac{3n}{4}) + T(\\tfrac{n}{4}) + \\Theta(n)$. Deepest leaf: $(\\tfrac34)^k n = 1$, so $k = \\log_{4/3} n \\approx 2.41 \\lg n$. Total $O(n \\lg n)$.' },
  };

  H['c310-heap-mergesort-tradeoff'] = {
    asks: "State merge sort’s main disadvantage, as the heap lecture lists it.",
    idea: 'Merge sort is reliably fast: its recursion tree is always balanced, whatever the input. The price is memory: merging two sorted halves needs somewhere to put them while you interleave them, a second array as big as the piece.',
    steps: [
      'Advantage, time: $T(n) = 2T(n/2) + \\Theta(n)$ on every input, which is $\\Theta(n \\log n)$ (Lecture 4).',
      { text: 'Disadvantage, space. Lecture 4’s Merge copies the halves out first, then writes them back in order:', table: { head: ['step', 'left half copy', 'right half copy', 'written to A'], rows: [['copy out', '3, 7, 9, 12', '2, 4, 6, 11', '(empty)'], ['2 < 3', '3, 7, 9, 12', '4, 6, 11', '2'], ['3 < 4', '7, 9, 12', '4, 6, 11', '2, 3'], ['…', '…', '…', '…'], ['done', '(empty)', '(empty)', '2, 3, 4, 6, 7, 9, 11, 12']] } },
      'The two copies together hold all 8 elements: $n$ extra cells for a piece of size $n$. At the top level that is the whole array, so merge sort uses $O(n)$ extra space.',
      'Insertion sort, by contrast, sorts in place: it only needs one spare variable (the key) no matter how big $n$ is.',
    ],
    graph: {
      caption: 'Extra memory cells needed. Merge sort’s auxiliary array grows with $n$; an in-place sort needs a constant number of spare cells.',
      x: [0, 100], y: [0, 105], xLabel: 'n', yLabel: 'extra cells',
      curves: [
        { label: 'merge sort: $n$', f: n => n, tone: 'a' },
        { label: 'in place (insertion sort): $1$', f: () => 1, tone: 'c' },
      ],
    },
    answer: "$O(n)$ extra space; it does not sort in place. (Its advantage: $\\Theta(n \\log n)$ time.)",
    mistake: 'Giving a time disadvantage ("slow on sorted input" or "$O(n^2)$ worst case"). Merge sort’s time is $\\Theta(n \\log n)$ on every input; its weakness is memory.',
    tryIt: { q: 'Merge sort runs on 500,000 four-byte integers. About how much extra memory does the top-level merge need?', a: 'It copies all $n$ elements out: $500{,}000 \\times 4$ bytes $= 2{,}000{,}000$ bytes, about 2 MB, on top of the array itself.' },
  };

  // ═══════════════════════ Hashing ═══════════════════════

  H['c310-hash-table-idea'] = {
    asks: "Say how a hash table decides which array slot a key goes in.",
    idea: 'A direct-address table uses the key itself as the index, which needs one slot for every possible key: far too many. A hash table runs the key through a function $h$ that squeezes it into a small range, and uses $h(\\text{key})$ as the index.',
    steps: [
      'Direct addressing with 7-digit student IDs would need $10^7$ slots, even to store 30 students.',
      { text: 'Hashing instead: a table of $m = 10$ slots with $h(k) = k \\bmod 10$ (the last digit).', table: { head: ['key $k$', '$h(k) = k \\bmod 10$', 'stored in'], rows: [['1504382', '2', 'T[2]'], ['1622917', '7', 'T[7]'], ['1588005', '5', 'T[5]']] } },
      'To search for 1622917, compute $h(1622917) = 7$ and look in T[7] only. No scanning of the rest of the table.',
      'Computing $h$ takes constant time, so insert, delete and search each aim for $O(1)$ (on average, when keys spread out well).',
    ],
    answer: 'The index is $h(\\text{key})$, computed by a hash function, not the key itself. The goal is $O(1)$ insert, delete and search.',
    mistake: 'Saying the key is the index. That is direct addressing; a hash table first maps the key into the much smaller range $0..m-1$.',
    tryIt: { q: 'Table of 100 slots, $h(k) = k \\bmod 100$. Which slot holds key 5551234?', a: '$5551234 \\bmod 100 = 34$ (the last two digits), so T[34].' },
  };

  H['c310-hash-collision'] = {
    asks: "Define a collision in a hash table.",
    idea: 'The hash function crams a huge set of possible keys into a few slots, so some different keys must end up wanting the same slot. Like 11 people and 10 chairs: someone has to share.',
    steps: [
      'Take $m = 10$, $h(k) = k \\bmod 10$.',
      { text: 'Hash a few keys:', table: { head: ['key $k$', '$h(k)$'], rows: [['1504382', '2'], ['1588005', '5'], ['1533912', '2']] } },
      '1504382 and 1533912 are different keys, but $h(1504382) = h(1533912) = 2$. That is a collision.',
      'They cannot be avoided in general: with 11 keys and 10 slots, at least two keys share a slot no matter what $h$ is.',
      'A collision is not an error: both keys are kept, using chaining or open addressing.',
    ],
    answer: 'The hash function maps two different keys to the same slot: $h(k_1) = h(k_2)$ with $k_1 \\neq k_2$.',
    mistake: 'Thinking a collision needs two equal keys. It is two different keys that land in the same slot.',
    tryIt: { q: '$m = 8$, $h(k) = k \\bmod 8$. Which of the keys 19, 35, 42, 27 collide?', a: '$19 \\bmod 8 = 3$, $35 \\bmod 8 = 3$, $42 \\bmod 8 = 2$, $27 \\bmod 8 = 3$. So 19, 35 and 27 all collide in slot 3; 42 is alone in slot 2.' },
  };

  H['c310-hash-parts'] = {
    asks: "Give the index where a hash table stores the item $(k, o)$.",
    idea: 'A hash table is just an ordinary array plus a rule for picking the index. The rule is the hash function $h$; the item $(k, o)$ (key $k$, value $o$) goes in the slot the rule picks for its key.',
    steps: [
      'Piece 1: a hash function $h$ that maps keys to integers in $[0, N - 1]$. For integer keys the slides use $h(x) = x \\bmod N$; $h(x)$ is called the hash value of $x$.',
      'Piece 2: an array (the table) of size $N$.',
      { text: 'Example with $N = 13$, $h(x) = x \\bmod 13$:', table: { head: ['item $(k, o)$', '$h(k)$', 'stored at'], rows: [['(40, Lee)', '$40 - 39 = 1$', 'index 1'], ['(58, Diaz)', '$58 - 52 = 6$', 'index 6'], ['(91, Kim)', '$91 - 91 = 0$', 'index 0']] } },
      'Only the key goes into $h$. The value $o$ just travels with it into the slot.',
    ],
    answer: "At index $i = h(k)$. (A hash table is a hash function $h$ plus an array of size $N$.)",
    mistake: 'Hashing the value $o$ (or the whole pair). The slot depends only on the key, so a search with just the key can find it.',
    tryIt: { q: '$N = 11$, $h(x) = x \\bmod 11$. Where is the item (100, Ito) stored?', a: '$100 = 9 \\cdot 11 + 1$, so $h(100) = 1$: index 1.' },
  };

  H['c310-hash-two-techniques'] = {
    asks: "Name the collision-resolution technique that keeps a linked list at each slot (and the other main technique).",
    idea: 'When a slot is taken there are two choices: let the slot hold more than one key (hang a list off it), or put the new key somewhere else in the same array. The first is chaining, the second is open addressing.',
    steps: [
      'Chaining: each slot holds a linked list of all keys that hash there. A collision just makes that list longer.',
      'Open addressing: every slot holds at most one key. If $h(k)$ is full, probe other slots in a fixed order (e.g. the next one) until an empty one turns up.',
      { text: 'Insert 10, 17, 5, 24 into $m = 7$ with $h(k) = k \\bmod 7$ (hash values 3, 3, 5, 3):', table: { head: ['slot', '3', '4', '5', '6'], rows: [['chaining (insert at head)', '24 → 17 → 10', '', '5', ''], ['open addressing (linear probing)', '10', '17', '5', '24']] } },
      'With linear probing, 17 finds 3 full and takes 4; 24 finds 3, 4, 5 full and takes 6. Chaining never leaves slot 3.',
      'Consequence: chaining can hold more keys than slots ($\\alpha > 1$); open addressing needs $n \\le m$.',
    ],
    graph: {
      caption: 'Expected cost of an unsuccessful search: chaining $1 + \\alpha$ (slides) versus open addressing $\\frac{1}{1 - \\alpha}$ (textbook bound, uniform hashing). Open addressing blows up as the table fills, which is why the slides say keep $n/m < 0.5$.',
      x: [0, 0.9], y: [0, 10.5], xLabel: 'load factor α', yLabel: 'expected probes',
      curves: [
        { label: 'chaining: $1 + \\alpha$', f: a => 1 + a, tone: 'b' },
        { label: 'open addressing: $\\frac{1}{1-\\alpha}$', f: a => 1 / (1 - a), tone: 'a' },
      ],
      marks: [{ x: 0.5, label: '$\\alpha = 0.5$' }],
    },
    answer: "Chaining keeps a linked list at each slot holding every key that hashes there. (Open addressing instead probes for another open slot in the table itself.)",
    mistake: 'Calling open addressing "making a new table" or "a second hash table". Everything stays in the one array; only the slot changes.',
    tryIt: { q: 'Insert 12, 5, 19 into $m = 7$, $h(k) = k \\bmod 7$. Where does each key end up with chaining, and with linear probing?', a: 'All three hash to 5. Chaining: slot 5 holds 19 → 5 → 12. Linear probing: 12 in slot 5, 5 in slot 6, 19 wraps to slot 0.' },
  };

  H['c310-hash-chain-worst'] = {
    asks: "With chaining, describe the worst case and what a search costs in it.",
    idea: 'The worst hash function sends every key to the same slot. Then the hash table is really one long linked list, and the operations cost what linked-list operations cost.',
    steps: [
      { text: 'Example: $m = 4$, $h(k) = k \\bmod 4$, keys 4, 8, 12, 16, 20. Every key is a multiple of 4:', table: { head: ['slot', '0', '1', '2', '3'], rows: [['chain', '20 → 16 → 12 → 8 → 4', '(empty)', '(empty)', '(empty)']] } },
      'Search for 24: $h(24) = 0$, so walk the whole chain, 5 comparisons, then report "not found". With $n$ keys that is $n$ comparisons: $O(n)$.',
      'Insert: a new key is put at the head of its list, a couple of pointer changes with no walking: $O(1)$, however long the chain is.',
      'Delete: the slides (following the textbook) count removing an element from its linked list as $O(1)$; the textbook gets this with a doubly linked list and a pointer to the element.',
    ],
    graph: {
      caption: 'Cost of a search with $m = 8$ slots as keys are added. All keys in one slot: the chain has all $n$ keys. Spread evenly: about $1 + n/8$.',
      x: [0, 40], y: [0, 42], xLabel: 'n (keys)', yLabel: 'search steps',
      curves: [
        { label: 'worst case: $n$', f: n => n, tone: 'a' },
        { label: 'average: $1 + n/8$', f: n => 1 + n / 8, tone: 'b' },
      ],
    },
    answer: "All $n$ keys hash to the same slot, forming one chain of length $n$, so search takes $O(n)$. (Insert and delete still take $O(1)$.)",
    mistake: 'Saying everything becomes $O(n)$. Only search has to walk the chain; insert at the head and delete of a given element do not.',
    tryIt: { q: '$m = 6$, $h(k) = k \\bmod 6$, keys 6, 12, 18, 24, 30, 36. How many key comparisons does a search for 42 make? For 3?', a: 'All six keys are in slot 0. $h(42) = 0$: walk all 6, not found. $h(3) = 3$: empty slot, 0 comparisons, not found.' },
  };

  H['c310-hash-chain-avg'] = {
    asks: 'With chaining, how long does a search take on average, written using the load factor $\\alpha$?',
    idea: 'A search does two things: jump to the right slot, then walk its chain. The jump is one step. If keys spread evenly, a chain holds $\\alpha = n/m$ keys on average, so the walk is about $\\alpha$ steps.',
    steps: [
      'Load factor: $\\alpha = n/m$, the number of keys divided by the number of slots, i.e. the average chain length.',
      'Step 1: compute $h(k)$ and go to that slot. That is constant work, the "1".',
      'Step 2: walk the chain. With simple uniform hashing the chain you land on has about $\\alpha$ keys, the "$\\alpha$".',
      { text: 'Example $m = 10$, $n = 30$:', table: { head: ['quantity', 'value'], rows: [['$\\alpha = n/m$', '$30/10 = 3$'], ['hash + jump', '1'], ['average chain to scan', '3'], ['average search', '$1 + 3 = 4$ steps']] } },
      'Together: $\\Theta(1 + \\alpha)$. The 1 matters when $\\alpha$ is tiny (a nearly empty table still costs one hash).',
    ],
    graph: {
      caption: 'Average search cost grows in a straight line with the load factor. At $\\alpha = 3$ it is about 4 steps.',
      x: [0, 6], y: [0, 7.5], xLabel: 'load factor α = n/m', yLabel: 'average search steps',
      curves: [{ label: '$1 + \\alpha$', f: a => 1 + a, tone: 'a' }],
      marks: [{ x: 3, label: '$\\alpha = 3$' }],
    },
    answer: '$\\Theta(1 + \\alpha)$: 1 to hash to the slot, plus $\\alpha = n/m$ expected chain length to scan.',
    mistake: 'Answering $\\Theta(1)$ always, or $\\Theta(n)$. It is $\\Theta(1)$ only while $\\alpha$ stays bounded; $\\Theta(n)$ is the worst case, not the average.',
    tryIt: { q: 'A chained table has $m = 100$ slots and $n = 250$ keys. What is the average search cost?', a: '$\\alpha = 250/100 = 2.5$, so about $1 + 2.5 = 3.5$ steps: $\\Theta(1 + \\alpha)$.' },
  };

  H['c310-hash-load-factor'] = {
    asks: 'Give the formula for the load factor $\\alpha$ of a table with $n$ elements and $m$ slots.',
    idea: 'Load factor means "how full is the table": keys per slot. Divide the number of keys by the number of slots.',
    steps: [
      'Formula: $\\alpha = n/m$.',
      { text: 'Examples with $m = 10$ slots:', table: { head: ['$n$ keys', '$\\alpha = n/10$', 'meaning'], rows: [['5', '0.5', 'half a key per slot'], ['10', '1', 'one key per slot on average'], ['20', '2', 'chains of 2 on average'], ['40', '4', 'chains of 4 on average']] } },
      'Chaining allows $\\alpha > 1$, because chains can hold any number of keys.',
      'Open addressing puts each key in its own slot, so $n \\le m$, i.e. $\\alpha \\le 1$; the slides advise $\\alpha < 0.5$ for reasonable performance.',
    ],
    graph: {
      caption: 'With $m = 10$ fixed, $\\alpha$ grows in step with $n$. Left of the line $\\alpha = 1$ an open-addressing table can still fit the keys; right of it only chaining can.',
      x: [0, 42], y: [0, 4.5], xLabel: 'n (keys), m = 10', yLabel: 'α',
      curves: [{ label: '$\\alpha = n/10$', f: n => n / 10, tone: 'a' }],
      bars: { label: 'examples', tone: 'b', values: [[5, 0.5], [10, 1], [20, 2], [40, 4]] },
      marks: [{ x: 10, label: '$n = m$' }],
    },
    answer: '$\\alpha = n/m$: the average number of elements per slot.',
    mistake: 'Writing $m/n$ (slots per key). Load factor goes up as the table fills, so the key count $n$ is on top.',
    tryIt: { q: 'An open-addressing table has $m = 40$ slots holding $n = 25$ keys. What is $\\alpha$, and is it within the slides’ advice?', a: '$\\alpha = 25/40 = 0.625$. It is allowed ($\\le 1$) but above the $0.5$ the slides recommend for reasonable performance.' },
  };

  H['c310-hash-load-apply'] = {
    asks: 'Compute the load factor of a chained hash table with 500 slots and 2,000 keys.',
    idea: 'Load factor is keys per slot. Share 2,000 keys among 500 slots and see how many each slot gets on average.',
    steps: [
      'Identify: $n = 2000$ keys, $m = 500$ slots.',
      'Divide: $\\alpha = n/m = 2000/500$. Since $500 \\times 4 = 2000$, $\\alpha = 4$.',
      'Meaning: chains hold 4 keys on average; some will be shorter, some longer.',
      'Average search: $\\Theta(1 + \\alpha) = \\Theta(1 + 4)$, about 5 steps.',
    ],
    graph: {
      caption: 'Average search cost $1 + \\alpha$; this table sits at $\\alpha = 4$, about 5 steps.',
      x: [0, 6], y: [0, 7.5], xLabel: 'load factor α', yLabel: 'average search steps',
      curves: [{ label: '$1 + \\alpha$', f: a => 1 + a, tone: 'a' }],
      marks: [{ x: 4, label: '$\\alpha = 4$' }],
    },
    answer: '$\\alpha = 2000/500 = 4$.',
    mistake: 'Dividing the other way ($500/2000 = 0.25$). Keys go on top: $\\alpha$ counts keys per slot.',
    tryIt: { q: 'A chained table has 1,200 slots and 3,000 keys. Load factor?', a: '$\\alpha = 3000/1200 = 2.5$, so an average search costs about $1 + 2.5 = 3.5$ steps.' },
  };

  H['c310-hash-chain-apply'] = {
    asks: 'Insert 15, 8, 22, 3, 10, 29 into a chained table with $m = 7$, $h(k) = k \\bmod 7$, and find the length of the longest chain.',
    idea: 'Each key goes to slot $k \\bmod 7$ (the remainder after dividing by 7). Compute every remainder, then count how many keys share each slot.',
    steps: [
      { text: 'Compute each slot. Remainder: subtract the largest multiple of 7 that fits.', table: { head: ['key $k$', 'largest multiple of 7 $\\le k$', '$k \\bmod 7$'], rows: [['15', '14', '1'], ['8', '7', '1'], ['22', '21', '1'], ['3', '0', '3'], ['10', '7', '3'], ['29', '28', '1']] } },
      { text: 'Build the chains (each new key goes at the head):', table: { head: ['slot', '0', '1', '2', '3', '4', '5', '6'], rows: [['chain', '', '29 → 22 → 8 → 15', '', '10 → 3', '', '', '']] } },
      'Count: slot 1 has 4 keys, slot 3 has 2, the rest are empty. The longest chain has length 4.',
      'Compare with the average: $\\alpha = 6/7 \\approx 0.86$. These keys clump (four are $1$ more than a multiple of 7), so one search can cost far more than the average suggests.',
    ],
    graph: {
      caption: 'Chain length per slot. The average (line) is under 1, but slot 1 holds 4 keys.',
      x: [-0.5, 6.5], y: [0, 4.5], xLabel: 'slot', yLabel: 'chain length',
      bars: { label: 'keys in slot', tone: 'b', values: [[0, 0], [1, 4], [2, 0], [3, 2], [4, 0], [5, 0], [6, 0]] },
      curves: [{ label: 'average $\\alpha = 6/7$', f: () => 6 / 7, tone: 'a' }],
    },
    answer: '4: 15, 8, 22 and 29 all have $k \\bmod 7 = 1$, so slot 1 holds 4 keys (3 and 10 share slot 3).',
    mistake: 'Answering with the load factor ($6/7$) or the number of non-empty slots. The question wants the single longest chain.',
    tryIt: { q: '$m = 8$, $h(k) = k \\bmod 8$. Insert 17, 9, 25, 4, 12, 30. Longest chain?', a: 'Slots: 1, 1, 1, 4, 4, 6. Slot 1 holds 17, 9, 25: longest chain 3.' },
  };
})(globalThis.FC = globalThis.FC || {});
