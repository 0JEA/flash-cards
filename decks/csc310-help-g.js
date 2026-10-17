// "Help" walkthroughs for the CSC 310 heap cards (decks/csc310-b.js): heap structure, index
// formulas, the max-heap property, MAX-HEAPIFY, BuildHeap, and the priority-queue definition.
// Same entry format as decks/csc310-help.js (see the header comment there), plus `heap` and
// `heapSteps` (1-based arrays, drawn as a top-down tree with the array strip underneath).
// Notation is M. Qasem's slides (Heap-HeapSort-Priority Queue.pdf): 1-based, Left(i) = 2i,
// Right(i) = 2i + 1, Parent(i) = ⌊i/2⌋, her MAX-HEAPIFY / BuildHeap / HEAP-* procedures.
// The priority-queue assignment's code, names and data are NOT used; tryIt problems use other arrays.
// Every heap state, index, comparison and swap below was produced by running her procedures
// in python3 on 2026-10-16.
(function (FC) {
  'use strict';
  const H = FC.help = FC.help || {};

  // The slide heap (p. 9 result) and a full 15-node max-heap used for the index cards.
  const SLIDE_HEAP = [16, 14, 10, 8, 7, 9, 3, 2, 4, 1];
  const HEAP15 = [50, 42, 38, 30, 35, 27, 33, 12, 25, 31, 20, 9, 22, 14, 6];

  // ---------------------------------------------------------------- Heap structure

  H['c310-heap-def'] = {
    asks: 'Give the course’s one-line definition of a heap: what it is stored in, and how you are meant to look at it.',
    idea: 'A heap is just an array. You read it as a tree by filling the tree level by level, left to right: A[1] is the root, A[2..3] the next level, A[4..7] the next, and so on. No pointers are stored; the positions are the tree.',
    steps: [
      'Take the slide heap A = ⟨16, 14, 10, 8, 7, 9, 3, 2, 4, 1⟩ ($n = 10$) and deal its cells out level by level.',
      { text: 'Level $k$ has room for $2^k$ nodes, so the cells split like this:', table: { head: ['level', 'room', 'indices', 'values'], rows: [['0', '1', '1', '16'], ['1', '2', '2–3', '14, 10'], ['2', '4', '4–7', '8, 7, 9, 3'], ['3', '8', '8–10', '2, 4, 1 (5 slots empty)']] } },
      '"Nearly complete" means every level is full except possibly the last, and the last is filled from the left with no gaps. Here level 3 holds indices 8, 9, 10 in its three leftmost slots.',
      'Because there are no gaps, a node’s position alone tells you its children and parent: Left(i) $= 2i$, Right(i) $= 2i + 1$, Parent(i) $= \\lfloor i/2 \\rfloor$.',
      'Full levels also keep the tree short: 10 nodes fit in 4 levels, height $\\lfloor \\lg 10 \\rfloor = 3$. That short height is why heap operations are fast.',
    ],
    heap: SLIDE_HEAP,
    answer: 'An array object that can be viewed as a nearly complete binary tree (every level full except possibly the last, which is filled from the left).',
    mistake: 'Saying "a sorted array" or "a binary search tree". A heap is not sorted and has no left-smaller/right-larger rule; the definition is only about the array-as-tree shape.',
    tryIt: { q: 'View A = ⟨9, 7, 8, 3, 5, 1⟩ as a nearly complete binary tree. Which values sit on each level?', a: 'Level 0: 9. Level 1: 7, 8 (indices 2–3). Level 2: 3, 5, 1 (indices 4–6), filling the 3 leftmost of its 4 slots.' },
  };

  H['c310-heap-left'] = {
    asks: 'In a heap stored from A[1], give the formula for the index of node $i$’s left child.',
    idea: 'Count who comes before. Every node before $i$ has two children, and they are all placed before $i$’s children. That count lands $i$’s left child exactly at $2i$.',
    steps: [
      'Nodes $1, 2, \\dots, i - 1$ come before node $i$, and each has 2 children: $2(i - 1)$ children in total.',
      'Those children fill the slots right after the root, starting at index 2: indices $2$ to $2(i-1) + 1 = 2i - 1$.',
      'So the next free slot, which holds $i$’s first (left) child, is $2i - 1 + 1 = 2i$.',
      { text: 'Check it on the slide heap ($n = 10$):', table: { head: ['$i$', 'A[$i$]', 'Left($i$) $= 2i$', 'A[Left($i$)]'], rows: [['1', '16', '2', '14'], ['2', '14', '4', '8'], ['3', '10', '6', '9'], ['4', '8', '8', '2'], ['5', '7', '10', '1']] } },
      'The left child exists only if $2i \\le n$. For $i = 6$, $2i = 12 > 10$: node 6 (value 9) is a leaf.',
    ],
    heap: SLIDE_HEAP,
    answer: 'Left(i) $= 2i$.',
    mistake: 'Writing $2i + 1$, which is the 0-indexed (Java array) left child. With the root at A[1], as in the slides, the left child is $2i$.',
    tryIt: { q: 'In a 15-element heap, what is the index of node 6’s left child, and does it exist?', a: 'Left(6) $= 2 \\cdot 6 = 12$, and $12 \\le 15$, so it exists.' },
  };

  H['c310-heap-right'] = {
    asks: 'In a heap stored from A[1], give the formula for the index of node $i$’s right child.',
    idea: 'The two children of a node sit side by side in the array. The left one is at $2i$, so the right one is the very next cell.',
    steps: [
      'Left(i) $= 2i$: all earlier nodes’ children fill indices $2$ to $2i - 1$, so $i$’s children start at $2i$.',
      'The two children of $i$ are adjacent on their level, so the right child is one cell later: $2i + 1$.',
      { text: 'Check it on the 15-node heap below:', table: { head: ['$i$', 'A[$i$]', 'Right($i$) $= 2i + 1$', 'A[Right($i$)]'], rows: [['1', '50', '3', '38'], ['2', '42', '5', '35'], ['3', '38', '7', '33'], ['5', '35', '11', '20'], ['7', '33', '15', '6']] } },
      'The right child exists only if $2i + 1 \\le n$. A node can have a left child and no right child: in a 10-element heap, node 5 has Left $= 10$ but Right $= 11 > 10$.',
    ],
    heap: HEAP15,
    answer: 'Right(i) $= 2i + 1$.',
    mistake: 'Assuming both children always exist. Check $2i + 1 \\le n$ before reading A[Right(i)]; the last internal node may have only a left child.',
    tryIt: { q: 'In a 12-element heap, what are Left(6) and Right(6), and which of them exist?', a: 'Left $= 12$, Right $= 13$. Only the left exists: $12 \\le 12$ but $13 > 12$.' },
  };

  H['c310-heap-parent'] = {
    asks: 'In a heap stored from A[1], give the formula for the index of node $i$’s parent.',
    idea: 'Undo the child formulas. Node $p$’s children are $2p$ and $2p + 1$; halve either one and round down, and you are back at $p$.',
    steps: [
      'Left child: $2p / 2 = p$ exactly.',
      'Right child: $(2p + 1)/2 = p + \\tfrac12$, and rounding down gives $p$.',
      'So for any non-root node $i$, Parent(i) $= \\lfloor i/2 \\rfloor$ (in code, integer division $i / 2$).',
      { text: 'Check it on the slide heap ($n = 10$):', table: { head: ['$i$', '$i/2$', 'Parent($i$) $= \\lfloor i/2 \\rfloor$'], rows: [['2', '1', '1'], ['3', '1.5', '1'], ['6', '3', '3'], ['7', '3.5', '3'], ['9', '4.5', '4'], ['10', '5', '5']] } },
      'The root ($i = 1$) has no parent: $\\lfloor 1/2 \\rfloor = 0$ is not a heap index.',
    ],
    heap: SLIDE_HEAP,
    answer: 'Parent(i) $= \\lfloor i/2 \\rfloor$.',
    mistake: 'Writing $(i - 1)/2$. That is the 0-indexed parent; with the root at A[1], halve $i$ itself and round down.',
    tryIt: { q: 'What is the parent of node 11, and which two nodes share that parent?', a: '$\\lfloor 11/2 \\rfloor = 5$. Node 5’s children are $2 \\cdot 5 = 10$ and $11$.' },
  };

  H['c310-heap-parent-apply'] = {
    asks: 'Use the parent formula on a concrete index: node 13 in a 20-element heap.',
    idea: 'Halve and round down. The heap size only matters to check that node 13 exists ($13 \\le 20$); it does not change the parent.',
    steps: [
      'Parent(13) $= \\lfloor 13/2 \\rfloor = \\lfloor 6.5 \\rfloor = 6$.',
      'Check by going back down: Left(6) $= 12$, Right(6) $= 13$. So 13 is node 6’s right child.',
      'Node 13 is odd, and odd indices are always right children; even indices are left children.',
      'In the 15-node heap drawn here, A[13] = 22 sits under A[6] = 27, and $27 \\ge 22$ as a max-heap requires.',
    ],
    heap: HEAP15,
    answer: '6, since $\\lfloor 13/2 \\rfloor = 6$ (node 6’s children are 12 and 13).',
    mistake: 'Answering 6.5 or 7 (rounding up). Indices are whole numbers, and the formula rounds DOWN.',
    tryIt: { q: 'In a 25-element heap, what is the parent of node 18?', a: '$\\lfloor 18/2 \\rfloor = 9$. Check: Left(9) $= 18$.' },
  };

  H['c310-heap-children-apply'] = {
    asks: 'Use the child formulas on a concrete node: node 7 in a 20-element heap. Then check both children really exist.',
    idea: 'Double for the left child, double plus one for the right. Then compare each to $n$: a formula can point past the end of the heap.',
    steps: [
      'Left(7) $= 2 \\cdot 7 = 14$.',
      'Right(7) $= 2 \\cdot 7 + 1 = 15$.',
      'Both exist because $14 \\le 20$ and $15 \\le 20$.',
      'Check by going back up: $\\lfloor 14/2 \\rfloor = 7$ and $\\lfloor 15/2 \\rfloor = 7$. In the 15-node heap drawn here, A[7] = 33 has children A[14] = 14 and A[15] = 6.',
    ],
    heap: HEAP15,
    answer: '14 and 15 (both $\\le 20$, so both exist).',
    mistake: 'Skipping the existence check. The answer is "14, 15" here only because both are $\\le n$; for a node near the end, one or both may not exist.',
    tryIt: { q: 'In a 20-element heap, what are node 10’s children?', a: 'Left $= 20$, Right $= 21$. Only node 20 exists ($21 > 20$), so node 10 has just a left child.' },
  };

  H['c310-heap-zero-index'] = {
    asks: 'Rewrite the three index formulas for an array whose root is at index 0 (as in Java), instead of the slides’ A[1].',
    idea: 'Same tree, every label shifted by one. Convert the 0-based index to the slides’ 1-based one (add 1), use the formula you know, then convert back (subtract 1).',
    steps: [
      'Let $j$ be the 0-based index. The same node has 1-based index $j + 1$.',
      'Left: $2(j + 1) = 2j + 2$ in 1-based terms; subtract 1 to get $2j + 1$.',
      'Right: $2(j + 1) + 1 = 2j + 3$; subtract 1 to get $2j + 2$.',
      'Parent: $\\lfloor (j + 1)/2 \\rfloor - 1 = \\lfloor (j + 1 - 2)/2 \\rfloor = \\lfloor (j - 1)/2 \\rfloor$.',
      { text: 'Check against the drawing (its badges are 1-based; 0-based $j$ = badge $- 1$):', table: { head: ['0-based $j$', 'left $2j + 1$', 'right $2j + 2$', 'parent $\\lfloor (j-1)/2 \\rfloor$'], rows: [['0', '1', '2', 'none (root)'], ['1', '3', '4', '0'], ['2', '5', '6', '0'], ['3', '7', '8', '1'], ['4', '9', '10', '1']] } },
    ],
    heap: SLIDE_HEAP,
    answer: 'Left $= 2j + 1$, right $= 2j + 2$, parent $= \\lfloor (j - 1)/2 \\rfloor$.',
    mistake: 'Mixing conventions: using $2j$ for the left child with a 0-based array makes the root its own left child ($2 \\cdot 0 = 0$). Pick one convention and use all three of its formulas.',
    tryIt: { q: 'In a 0-based heap array, what are the children of index 4, and what is the parent of index 9?', a: 'Children $2 \\cdot 4 + 1 = 9$ and $2 \\cdot 4 + 2 = 10$. Parent of 9 $= \\lfloor 8/2 \\rfloor = 4$ (consistent).' },
  };

  H['c310-heap-max-property'] = {
    asks: 'State the rule a max-heap obeys between each node and its parent, and say where that rule forces the largest value to be.',
    idea: 'Every parent is at least as big as its children. Walk up from any node and values can only grow, so every path ends at the root holding the biggest value.',
    steps: [
      'The rule: for every node $i$ except the root, $A[\\text{Parent}(i)] \\ge A[i]$.',
      'It compares only parent and child. Siblings and cousins are unordered: A[6] = 9 is bigger than its cousin A[5] = 7.',
      'Follow node 9 upward: A[9] = 4, A[4] = 8, A[2] = 14, A[1] = 16. Each step up is $\\ge$ the one before: $4 \\le 8 \\le 14 \\le 16$.',
      'Every node has such a path to the root, so every value is $\\le$ A[1]: the largest element is at the root.',
      'It is not sorted: A[9] = 4 on level 3 is bigger than A[7] = 3 on level 2, because they are on different branches.',
    ],
    heap: SLIDE_HEAP,
    answer: 'For every node $i$ other than the root, $A[\\text{Parent}(i)] \\ge A[i]$. So the largest element is at the root, A[1].',
    mistake: 'Thinking a max-heap is sorted level by level, or that the left child must be bigger than the right. The rule is only "parent $\\ge$ child".',
    tryIt: { q: 'In a max-heap with distinct values, where can the second-largest value be?', a: 'At index 2 or 3 (a child of the root). Its parent must be $\\ge$ it, and the only larger value is the maximum at A[1].' },
  };

  H['c310-heap-violation'] = {
    asks: 'Check every parent–child pair of A = ⟨20, 15, 18, 7, 12, 19⟩ and find the index $i$ where $A[\\text{Parent}(i)] \\ge A[i]$ fails.',
    idea: 'Go through the nodes $i = 2, \\dots, n$ (every node except the root), look up each one’s parent with $\\lfloor i/2 \\rfloor$, and compare. One comparison per node.',
    steps: [
      { text: '$n = 6$. Compare each node with its parent:', table: { head: ['$i$', 'Parent $\\lfloor i/2 \\rfloor$', 'A[parent]', 'A[$i$]', 'parent $\\ge$ child?'], rows: [['2', '1', '20', '15', 'yes'], ['3', '1', '20', '18', 'yes'], ['4', '2', '15', '7', 'yes'], ['5', '2', '15', '12', 'yes'], ['6', '3', '18', '19', 'no']] } },
      'Only $i = 6$ fails: $A[3] = 18 < A[6] = 19$.',
      'Report the child’s index, 6: it is the node whose $A[\\text{Parent}(i)] \\ge A[i]$ is false.',
      'Note 19 is not even the maximum, so the heap is broken in one place only, on the right branch.',
    ],
    heap: [20, 15, 18, 7, 12, 19],
    answer: '6: its parent is 3, and $A[3] = 18 < A[6] = 19$.',
    mistake: 'Reporting index 3 (the parent). The property is stated per non-root node $i$, so the violation belongs to the child, $i = 6$; read what the card asks for.',
    tryIt: { q: 'Which index of ⟨40, 35, 30, 36, 20, 25, 10⟩ breaks the max-heap property?', a: 'Index 4: its parent is 2, and $A[2] = 35 < A[4] = 36$. The other pairs (2, 3, 5, 6, 7) are fine.' },
  };

  H['c310-heap-ops-log'] = {
    asks: 'Explain why inserting into, deleting from, or heapifying a heap costs $O(\\lg n)$ and not $O(n)$.',
    idea: 'Each of these operations moves one value along a single root-to-leaf path, doing a constant amount of work per level. A nearly complete tree of $n$ nodes has only about $\\lg n$ levels.',
    steps: [
      'Level $k$ holds $2^k$ nodes, so levels $0..h$ hold $1 + 2 + \\dots + 2^h = 2^{h+1} - 1$ nodes.',
      'A heap of height $h$ has all of levels $0..h-1$ full plus at least one node on level $h$: $2^h \\le n \\le 2^{h+1} - 1$. Take $\\lg$: $h = \\lfloor \\lg n \\rfloor$.',
      { text: 'Heights grow very slowly:', table: { head: ['$n$', 'height $\\lfloor \\lg n \\rfloor$'], rows: [['7', '2'], ['15', '3'], ['16', '4'], ['1023', '9'], ['1,000,000', '19']] } },
      'MAX-HEAPIFY moves a value down one level per swap; HEAP-INCREASE-KEY (and so insert) moves one up one level per swap. Each swap is a constant number of comparisons.',
      'So at most $h$ swaps: $O(h) = O(\\lg n)$. For the 15-node heap drawn here, at most 3 swaps, never 15.',
      'Build-heap is the exception the card mentions: it calls MAX-HEAPIFY $\\lfloor n/2 \\rfloor$ times, and its total is $O(n)$.',
    ],
    heap: HEAP15,
    graph: {
      caption: 'Scanning every element costs $n$; walking one root-to-leaf path costs about $\\lg n$. At $n = 100$ that is 100 steps against fewer than 7.',
      x: [1, 100], y: [0, 100], xLabel: 'n (heap size)', yLabel: 'steps',
      curves: [{ label: '$n$ (touch every node)', f: n => n, tone: 'b' }, { label: '$\\lg n$ (one path, the height)', f: n => Math.log2(n), tone: 'a' }],
    },
    answer: 'A heap of $n$ elements is a complete binary tree of height $\\Theta(\\lg n)$, and these operations do constant work per level along one path, so they take $O(\\lg n)$.',
    mistake: 'Saying "because the heap is sorted" or "because it halves the array like binary search". The reason is the height: one path, at most $\\lfloor \\lg n \\rfloor$ levels.',
    tryIt: { q: 'A max-heap has 500 elements. At most how many swaps can one MAX-HEAPIFY(A, 1) make?', a: 'The height: $\\lfloor \\lg 500 \\rfloor = 8$ (since $2^8 = 256 \\le 500 < 512 = 2^9$). At most 8 swaps.' },
  };

  // ---------------------------------------------------------------- MAX-HEAPIFY

  H['c310-heap-heapify-assume'] = {
    asks: 'State MAX-HEAPIFY(A, i)’s precondition (what must already be true) and its postcondition (what it guarantees afterwards).',
    idea: 'MAX-HEAPIFY is a repair for one misplaced value. It only works if everything below that value is already a heap, so the only possible problem is A[i] being too small for its spot.',
    steps: [
      'Precondition: the subtrees rooted at Left(i) and Right(i) are already max-heaps. Only A[i] itself may be smaller than a child.',
      'First picture (slide array, $i = 2$): the subtree under node 4 (14; 2, 8) and the one under node 5 (7; 1) are heaps. Only A[2] = 4 is out of place.',
      'Postcondition: after the call, the whole subtree rooted at $i$ is a max-heap.',
      'Why the precondition matters: MAX-HEAPIFY(A, 1) on ⟨1, 2, 3, 4, 5, 6, 7⟩ (subtrees NOT heaps) swaps 1 with 3, then 1 with 7, and stops.',
      'Second picture: the result ⟨3, 2, 7, 4, 5, 6, 1⟩ still breaks the property at nodes 3, 4 and 5. MAX-HEAPIFY never looks at values it does not pass, so it cannot fix them.',
      'That is why BuildHeap calls it bottom-up: by the time it reaches node $i$, both child subtrees have already been made heaps.',
    ],
    heapSteps: [
      { text: 'Precondition holds: subtrees at 4 and 5 are heaps; only A[2] = 4 is misplaced.', heap: [16, 4, 10, 14, 7, 9, 3, 2, 8, 1] },
      { text: 'Precondition broken: ⟨1, 2, 3, 4, 5, 6, 7⟩, subtrees at 2 and 3 are not heaps.', heap: [1, 2, 3, 4, 5, 6, 7] },
      { text: 'After MAX-HEAPIFY(A, 1): still not a heap (3 < 7, 2 < 4, 2 < 5).', heap: [3, 2, 7, 4, 5, 6, 1] },
    ],
    answer: 'It assumes the subtrees rooted at Left(i) and Right(i) are already max-heaps (only A[i] may be out of place), and it makes the subtree rooted at $i$ a max-heap.',
    mistake: 'Calling MAX-HEAPIFY on an arbitrary array and expecting a heap. One call fixes one misplaced value; turning a whole array into a heap takes BuildHeap.',
    tryIt: { q: 'A = ⟨2, 9, 8, 5, 6⟩. Does MAX-HEAPIFY(A, 1)’s precondition hold?', a: 'Yes. Subtree at 2: 9 with children 5, 6, a heap. Subtree at 3: the leaf 8, a heap. Only A[1] = 2 is out of place.' },
  };

  H['c310-heap-heapify-process'] = {
    asks: 'Describe, step by step, what MAX-HEAPIFY(A, i) does to move a too-small A[i] into place.',
    idea: 'The small value sinks. At each level, compare it with its two children; if a child is bigger, the bigger child moves up and the small value moves down into its spot. Repeat until it is at least both children or reaches a leaf.',
    steps: [
      'Compute $l = $ Left(i) $= 2i$ and $r = $ Right(i) $= 2i + 1$. A child counts only if its index is $\\le$ heap_size.',
      'largest = the index of the biggest of A[i], A[l], A[r] (first test A[l] against A[i], then A[r] against the winner).',
      'If largest = $i$, A[i] is already $\\ge$ both children: stop.',
      'Otherwise swap A[i] with A[largest] and call MAX-HEAPIFY(A, largest): the small value is now one level lower, and only it can be wrong there.',
      'Pictured on ⟨3, 14, 12, 10, 8, 9, 5, 4, 7⟩ with $i = 1$: 3 vs 14, 12 → swap with 14 (index 2); 3 vs 10, 8 → swap with 10 (index 4); 3 vs 4, 7 → swap with 7 (index 9). Index 9 is a leaf: stop.',
    ],
    heapSteps: [
      { text: 'Start: A[1] = 3 is smaller than its children; both subtrees are heaps.', heap: [3, 14, 12, 10, 8, 9, 5, 4, 7] },
      { text: 'largest = 2 (14): swap A[1] and A[2].', heap: [14, 3, 12, 10, 8, 9, 5, 4, 7] },
      { text: 'At index 2, children 10 and 8: largest = 4, swap.', heap: [14, 10, 12, 3, 8, 9, 5, 4, 7] },
      { text: 'At index 4, children 4 and 7: largest = 9, swap. Index 9 has no children: done.', heap: [14, 10, 12, 7, 8, 9, 5, 4, 3] },
    ],
    answer: 'Find the largest of A[i], A[Left(i)], A[Right(i)] (children only if $\\le$ heap_size). If it is a child, swap A[i] with that larger child and recurse on the child’s index; stop when A[i] is the largest.',
    mistake: 'Swapping with the first child that is bigger, or the smaller child. Always swap with the LARGER child, so the value moving up is $\\ge$ its new sibling.',
    tryIt: { q: 'MAX-HEAPIFY(A, 1) on ⟨5, 13, 9, 11, 7, 8, 2⟩: which swaps happen?', a: '5 vs 13, 9: swap with 13 (index 2). 5 vs 11, 7: swap with 11 (index 4). Index 4 has no children ($8 > 7$): stop. Result ⟨13, 11, 9, 5, 7, 8, 2⟩.' },
  };

  H['c310-heap-heapify-slide'] = {
    asks: 'Trace MAX-HEAPIFY(A, 2) on the slide array ⟨16, 4, 10, 14, 7, 9, 3, 2, 8, 1⟩ (heap_size 10) and give the array at the end.',
    idea: 'The 4 at index 2 is too small for its spot, while everything under it is already a heap. Let it sink: swap with the larger child, one level at a time, until it fits.',
    steps: [
      'Call at $i = 2$: $l = 4$, $r = 5$. A[4] = 14 > A[2] = 4, so largest = 4; A[5] = 7 is not > A[4] = 14, so largest stays 4.',
      'largest $\\ne 2$: swap A[2] and A[4]. A = ⟨16, 14, 10, 4, 7, 9, 3, 2, 8, 1⟩; recurse on $i = 4$.',
      'Call at $i = 4$: $l = 8$, $r = 9$. A[8] = 2 is not > A[4] = 4, so largest = 4; A[9] = 8 > A[4] = 4, so largest = 9.',
      'Swap A[4] and A[9]. A = ⟨16, 14, 10, 8, 7, 9, 3, 2, 4, 1⟩; recurse on $i = 9$.',
      'Call at $i = 9$: $l = 18 > 10$ and $r = 19 > 10$, so no children; largest = 9 = $i$. Stop after 2 swaps.',
    ],
    heapSteps: [
      { text: 'Start: A[2] = 4 is smaller than both children (14, 7).', heap: [16, 4, 10, 14, 7, 9, 3, 2, 8, 1] },
      { text: 'Swap with the larger child, A[4] = 14.', heap: [16, 14, 10, 4, 7, 9, 3, 2, 8, 1] },
      { text: 'At index 4, children 2 and 8: swap with A[9] = 8. Index 9 is a leaf.', heap: [16, 14, 10, 8, 7, 9, 3, 2, 4, 1] },
    ],
    answer: '16, 14, 10, 8, 7, 9, 3, 2, 4, 1 (swaps 2 ↔ 4, then 4 ↔ 9).',
    mistake: 'Stopping after the first swap. After 4 moves to index 4 it is still smaller than its child 8; MAX-HEAPIFY recurses until the value is $\\ge$ both children or is a leaf.',
    tryIt: { q: 'MAX-HEAPIFY(A, 1) on ⟨6, 15, 11, 9, 12, 10⟩ (heap_size 6). Give A afterwards.', a: '6 vs 15, 11: swap with index 2. 6 vs A[4] = 9, A[5] = 12: swap with index 5. Index 5 is a leaf. Result ⟨15, 12, 11, 9, 6, 10⟩.' },
  };

  H['c310-heap-heapify-prac'] = {
    asks: 'Trace MAX-HEAPIFY(A, 2) on ⟨20, 6, 18, 15, 9, 11, 4, 3, 12⟩ (heap_size 9) and give the array afterwards.',
    idea: 'Same sinking as the slide example. Only the subtree under index 2 changes; A[1] and the right half (index 3 and below) are never touched.',
    steps: [
      'Call at $i = 2$: $l = 4$, $r = 5$. A[4] = 15 > A[2] = 6, so largest = 4; A[5] = 9 is not > 15, so largest stays 4.',
      'Swap A[2] and A[4]: A = ⟨20, 15, 18, 6, 9, 11, 4, 3, 12⟩; recurse on $i = 4$.',
      'Call at $i = 4$: $l = 8$, $r = 9$. A[8] = 3 is not > 6, so largest = 4; A[9] = 12 > 6, so largest = 9.',
      'Swap A[4] and A[9]: A = ⟨20, 15, 18, 12, 9, 11, 4, 3, 6⟩; recurse on $i = 9$.',
      'At $i = 9$: $l = 18 > 9$, no children, so stop. Two swaps, and the whole array is now a max-heap.',
    ],
    heapSteps: [
      { text: 'Start: A[2] = 6 is smaller than its children 15 and 9.', heap: [20, 6, 18, 15, 9, 11, 4, 3, 12] },
      { text: 'Swap with the larger child, A[4] = 15.', heap: [20, 15, 18, 6, 9, 11, 4, 3, 12] },
      { text: 'At index 4, children 3 and 12: swap with A[9] = 12. Done.', heap: [20, 15, 18, 12, 9, 11, 4, 3, 6] },
    ],
    answer: '20, 15, 18, 12, 9, 11, 4, 3, 6 (swaps 2 ↔ 4, then 4 ↔ 9).',
    mistake: 'At index 4, swapping with the left child 3 because it is checked first. Compare both children and take the larger one, 12.',
    tryIt: { q: 'MAX-HEAPIFY(A, 3) on ⟨30, 25, 4, 20, 22, 16, 11, 9, 5, 18, 7⟩ (heap_size 11). Give A afterwards.', a: '4 vs A[6] = 16, A[7] = 11: swap with index 6. Index 6’s children would be 12 and 13, both $> 11$: stop. Result ⟨30, 25, 16, 20, 22, 4, 11, 9, 5, 18, 7⟩.' },
  };

  // ---------------------------------------------------------------- BuildHeap

  H['c310-heap-build-prac1'] = {
    asks: 'Run BuildHeap on ⟨5, 12, 3, 9, 20, 7, 15⟩: call MAX-HEAPIFY(A, i) for $i = \\lfloor n/2 \\rfloor$ down to 1, and give the final array.',
    idea: 'Leaves are already 1-element heaps. Work from the last internal node back to the root, fixing each small subtree before its parent is fixed; each MAX-HEAPIFY call then has its precondition met.',
    steps: [
      '$n = 7$, $\\lfloor 7/2 \\rfloor = 3$. Indices 4–7 (9, 20, 7, 15) are leaves; the loop runs $i = 3, 2, 1$.',
      '$i = 3$: A[3] = 3, children A[6] = 7, A[7] = 15. Largest is 15, so swap 3 ↔ 7: A = ⟨5, 12, 15, 9, 20, 7, 3⟩.',
      '$i = 2$: A[2] = 12, children A[4] = 9, A[5] = 20. Largest is 20, so swap 2 ↔ 5: A = ⟨5, 20, 15, 9, 12, 7, 3⟩.',
      '$i = 1$: A[1] = 5, children 20 and 15. Swap 1 ↔ 2: A = ⟨20, 5, 15, 9, 12, 7, 3⟩.',
      'The 5 keeps sinking (same call): at index 2 its children are A[4] = 9 and A[5] = 12, so swap 2 ↔ 5. A = ⟨20, 12, 15, 9, 5, 7, 3⟩, and index 5 is a leaf: done.',
    ],
    heapSteps: [
      { text: 'Start: leaves 4–7 are 1-element heaps.', heap: [5, 12, 3, 9, 20, 7, 15] },
      { text: 'After MAX-HEAPIFY(A, 3): 3 ↔ 15.', heap: [5, 12, 15, 9, 20, 7, 3] },
      { text: 'After MAX-HEAPIFY(A, 2): 12 ↔ 20.', heap: [5, 20, 15, 9, 12, 7, 3] },
      { text: 'After MAX-HEAPIFY(A, 1): 5 ↔ 20, then 5 ↔ 12. A max-heap.', heap: [20, 12, 15, 9, 5, 7, 3] },
    ],
    answer: '20, 12, 15, 9, 5, 7, 3.',
    mistake: 'Stopping MAX-HEAPIFY(A, 1) after its first swap, leaving ⟨20, 5, 15, 9, 12, 7, 3⟩. The 5 at index 2 is below its child 12, so it must keep sinking.',
    tryIt: { q: 'Run BuildHeap on ⟨2, 8, 6, 10, 4, 7, 1⟩.', a: '$i = 3$: 6 ↔ 7. $i = 2$: 8 ↔ 10. $i = 1$: 2 ↔ 10, then 2 vs 8, 4 → 2 ↔ 8. Result ⟨10, 8, 7, 2, 4, 6, 1⟩.' },
  };

  // ---------------------------------------------------------------- Priority queues

  H['c310-heap-pq-def'] = {
    asks: 'Give the course’s definition of a priority queue: what it stores, and what each stored element carries.',
    idea: 'Think of an emergency room. Patients are not seen in arrival order; each has a severity score, and the most severe is seen next. The patients are the elements, the score is the key.',
    steps: [
      'A priority queue maintains a set S of elements. Elements can be added and removed over time.',
      'Each element has an associated value called its key. The key, not arrival time, decides who is served next.',
      { text: 'Keys arrive in the order 4, 9, 2, 7, 5:', table: { head: ['structure', 'removal order'], rows: [['ordinary queue (first in, first out)', '4, 9, 2, 7, 5'], ['max-priority queue (largest key first)', '9, 7, 5, 4, 2']] } },
      'A max-heap is a natural home for the keys: the largest is always at A[1]. Inserting 4, 9, 2, 7, 5 with MAX-HEAP-INSERT gives the heap drawn here, ⟨9, 7, 2, 4, 5⟩.',
      'The heap is not sorted, but it does not need to be: each removal only needs the current maximum, and MAX-HEAPIFY restores the next one in $O(\\lg n)$.',
    ],
    heap: [9, 7, 2, 4, 5],
    answer: 'A data structure for maintaining a set S of elements, each with an associated value called a key.',
    mistake: 'Defining it as "a sorted list" or "a queue". It is defined by the set and the keys; a heap is one way to implement it, not the definition.',
    tryIt: { q: 'Keys 6, 1, 8, 3 are inserted into a max-priority queue. In what order do repeated EXTRACT-MAX calls return them? And a plain FIFO queue?', a: 'Priority queue: 8, 6, 3, 1 (largest key first). FIFO queue: 6, 1, 8, 3 (arrival order).' },
  };

  H['c310-heap-pq-ops-order'] = {
    asks: 'List the four max-priority-queue operations in the order the slides give them.',
    idea: 'Follow the life of the queue: put an element IN, LOOK at the top, TAKE the top off, then BUMP someone’s key up. Insert, Maximum, Extract-Max, Increase-Key.',
    steps: [
      'INSERT(S, x), $O(\\lg n)$: add $x$ to S. On a heap, MAX-HEAP-INSERT puts a $-\\infty$ placeholder at the end, then HEAP-INCREASE-KEY raises it to the real key, which climbs while bigger than its parent.',
      'MAXIMUM(S), $\\Theta(1)$: return the element with the largest key, without removing it. On a heap, HEAP-MAXIMUM just returns A[1].',
      'EXTRACT-MAX(S), $\\Theta(\\lg n)$: remove and return the largest. On a heap, save A[1], move A[heap_size] to A[1], shrink the heap by one, and MAX-HEAPIFY the root.',
      'INCREASE-KEY(S, x, k), $O(\\lg n)$: raise $x$’s key to $k$ (assumed $\\ge$ the old key). On a heap, set A[i] = $k$ and swap upward while the parent is smaller.',
      'Pictured on ⟨15, 10, 12, 4, 7, 9⟩: insert 13 (climbs past 12), MAXIMUM returns 15 (no change), EXTRACT-MAX removes 15, then INCREASE-KEY raises A[5] from 7 to 14.',
    ],
    heapSteps: [
      { text: 'Start: a max-heap. MAXIMUM would return A[1] = 15 and change nothing.', heap: [15, 10, 12, 4, 7, 9] },
      { text: 'INSERT 13: it lands at index 7, beats its parent 12, swaps up to index 3, and stops below 15.', heap: [15, 10, 13, 4, 7, 9, 12] },
      { text: 'EXTRACT-MAX returns 15: A[7] = 12 moves to the root, then sinks below 13.', heap: [13, 10, 12, 4, 7, 9] },
      { text: 'INCREASE-KEY(A, 5, 14): 14 swaps with 10 (index 2), then with 13 (index 1).', heap: [14, 13, 12, 4, 10, 9] },
    ],
    answer: 'INSERT(S, x), MAXIMUM(S), EXTRACT-MAX(S), INCREASE-KEY(S, x, k).',
    mistake: 'Mixing up MAXIMUM and EXTRACT-MAX. MAXIMUM only looks ($\\Theta(1)$); EXTRACT-MAX removes the element and must repair the heap ($\\Theta(\\lg n)$).',
    tryIt: { q: 'On the max-heap ⟨20, 11, 18, 3, 9⟩, give the array after one EXTRACT-MAX.', a: 'Return 20; move A[5] = 9 to the root: ⟨9, 11, 18, 3⟩. MAX-HEAPIFY: 9 vs 11, 18 → swap with 18 (index 3), a leaf. Result ⟨18, 11, 9, 3⟩.' },
  };
})(globalThis.FC = globalThis.FC || {});
