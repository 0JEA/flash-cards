// "Help" walkthroughs for the CSC 310 priority-queue cards (heap lecture, PQ part):
// MAXIMUM, EXTRACT-MAX, INCREASE-KEY, MAX-HEAP-INSERT, decrease-key, and their costs.
// Same entry format as decks/csc310-help.js (see the header comment there), plus
// `heap` / `heapSteps` (values of A[1..n], drawn as a tree with index badges + array strip).
// Procedures follow M. Qasem's slides exactly: 1-based, Parent(i) = floor(i/2).
// The PQ assignment's code, names and data are NOT used here; tryIt problems use other heaps.
// Every heap state, swap and tryIt answer was checked with python3 on 2026-10-16.
(function (FC) {
  'use strict';
  const H = FC.help = FC.help || {};
  const lg = n => Math.log2(n);

  // ---------------------------------------------------------------- The operations

  H['c310-heap-pq-maximum-mc'] = {
    asks: 'Of the four max-priority-queue operations, which one hands you the element with the largest key but leaves it in the queue?',
    idea: 'Picture a waiting room ordered by urgency. MAXIMUM is the nurse glancing at who is most urgent; EXTRACT-MAX is calling that patient in, so they leave the room.',
    steps: [
      'Read the four slide definitions: INSERT(S, x) adds x; MAXIMUM(S) returns the element with the largest key; EXTRACT-MAX(S) removes and returns it; INCREASE-KEY(S, x, k) raises x’s key to k.',
      'Cross out the two that do not return the largest element: INSERT returns nothing, and INCREASE-KEY only changes a key.',
      'Two remain, and both return the largest key. Only EXTRACT-MAX says "removes", so MAXIMUM is the one that leaves S unchanged.',
      'On a heap the largest key sits at the root, so HEAP-MAXIMUM is just "return A[1]": no swap, no change to heapSize, $\\Theta(1)$.',
      'Compare the two pictures below on the same heap: both calls return 16, but after EXTRACT-MAX the heap has 9 elements and has been rearranged.',
    ],
    heapSteps: [
      { text: 'After HEAP-MAXIMUM(A): returns 16, and the array is untouched (10 elements).', heap: [16, 14, 10, 8, 7, 9, 3, 2, 4, 1] },
      { text: 'After HEAP-EXTRACT-MAX(A) instead: returns 16, and 16 is gone (9 elements).', heap: [14, 8, 10, 4, 7, 9, 3, 2, 1] },
    ],
    answer: 'MAXIMUM(S). It returns the element with the largest key and leaves it in S; on a heap it is "return A[1]", $\\Theta(1)$.',
    mistake: 'Picking EXTRACT-MAX because it also "returns the max". The difference is removal: after EXTRACT-MAX the element is gone and heapSize is one smaller.',
    tryIt: { q: 'On the max-heap [50, 30, 40, 10, 20], call HEAP-MAXIMUM, then HEAP-EXTRACT-MAX. What does each return, and what is the array after both?', a: 'HEAP-MAXIMUM returns 50 and changes nothing. HEAP-EXTRACT-MAX returns 50 again, moves 20 to the root (size 4) and swaps it with its larger child 40: [40, 30, 20, 10].' },
  };

  H['c310-heap-increase-key-def'] = {
    asks: "Say what INCREASE-KEY(S, x, k) assumes about the new value k.",
    idea: 'It is a promotion: x’s key goes up to k. A promotion cannot be to a lower rank, so the operation assumes $k \\ge$ x’s current key; the heap version checks this and reports an error otherwise.',
    steps: [
      'Slide definition: INCREASE-KEY(S, x, k) increases the value of element x’s key to the new value k.',
      'The assumption: k is at least as large as x’s current key. A smaller k would be a decrease, which this operation does not handle.',
      'On a heap, x is named by its index i: HEAP-INCREASE-KEY(A, i, key). Its first line is: if key < A[i], error “new key is smaller than current key”.',
      'Example below: raise A[5] = 9 to 19. Since $19 \\ge 9$ there is no error, so set A[5] = 19.',
      'A bigger key can only be too big for its parent, so it moves up: parent A[2] = 15 < 19, so swap; then parent A[1] = $20 \\ge 19$, so stop.',
    ],
    heap: [20, 15, 18, 6, 9, 12, 4],
    heapSteps: [
      { text: 'Set A[5] = 19. Its parent A[2] = 15 is now smaller.', heap: [20, 15, 18, 6, 19, 12, 4] },
      { text: 'Swap A[5] and A[2]. Parent A[1] = 20 is $\\ge 19$: stop.', heap: [20, 19, 18, 6, 15, 12, 4] },
    ],
    answer: "$k \\ge$ x’s current key (it then sets x’s key to k). HEAP-INCREASE-KEY reports an error if key < A[i].",
    mistake: 'Treating INCREASE-KEY as "change the key to anything". It only raises a key; lowering one is a different repair that moves the element down (MAX-HEAPIFY).',
    tryIt: { q: 'Max-heap [40, 25, 30, 12, 20, 18, 7]. What does HEAP-INCREASE-KEY(A, 6, 10) do?', a: 'A[6] = 18 and the new key is 10. Since $10 < 18$ the first line fires: error “new key is smaller than current key”, and A is unchanged.' },
  };

  H['c310-heap-maximum'] = {
    asks: "Give the body of HEAP-MAXIMUM(A) for a max-heap stored in A[1..heapSize].",
    idea: 'In a max-heap every parent is at least as big as its children. Walk up from any node and the values can only grow, and every such walk ends at the root. So the root, A[1], beats everyone.',
    steps: [
      'Max-heap property (slide): $A[\\text{Parent}(i)] \\ge A[i]$ for every node $i$ other than the root.',
      'Take any node in the heap below, say A[6] = 15. Its parent is A[3] = 19, whose parent is A[1] = 21: going up, $15 \\le 19 \\le 21$.',
      'Every node’s walk up ends at index 1, so A[1] is $\\ge$ every element. The largest key is always at the root.',
      'So the procedure is one line: return A[1]. No loop, no comparison.',
      'That is one array read whether the heap holds 7 elements or 7 million: $\\Theta(1)$.',
    ],
    heap: [21, 17, 19, 8, 12, 15, 4],
    graph: {
      caption: 'HEAP-MAXIMUM reads one cell however big the heap is (the flat line). Operations that walk the tree grow with its height, $\\lg n$.',
      x: [1, 64], y: [0, 7], xLabel: 'n (heap size)', yLabel: 'steps',
      curves: [{ label: 'HEAP-MAXIMUM: $1$', f: () => 1, tone: 'a' }, { label: 'tree height: $\\lg n$', f: lg, tone: 'b' }],
    },
    answer: "return A[1] ($\\Theta(1)$). The max-heap property puts the largest key at the root.",
    mistake: 'Writing a loop that scans the array for the largest value. That is $\\Theta(n)$ and throws away the reason for using a heap.',
    tryIt: { q: 'In the max-heap [42, 37, 40, 12, 30, 25, 33], what does HEAP-MAXIMUM return? With all keys different, which indices can hold the second-largest key in any max-heap?', a: 'It returns A[1] = 42. The second-largest key can have only the root above it, so it must be a child of the root: index 2 or 3 (here 40, at index 3).' },
  };

  H['c310-heap-extract-order'] = {
    asks: 'Put the six lines of HEAP-EXTRACT-MAX(A) in the order her slide gives them.',
    idea: 'Removing the root leaves a hole at the top, but the array must stay gap-free. So fill the hole with the last element (the one that is easy to remove), shrink the heap, and let that element sink back to where it belongs.',
    steps: [
      'Guard first: if A.heapSize < 1, error “heap underflow”. An empty heap has nothing to extract.',
      'Save the answer before anything overwrites it: max = A[1].',
      'Fill the hole: A[1] = A[heapSize]. In the heap below, the last leaf 4 goes to the root.',
      'Shrink: A.heapSize = A.heapSize − 1. The old copy of 4 at the end is now outside the heap and is never compared again.',
      'Repair from the top with MAX-HEAPIFY(A, 1) (the slide writes MAX-HEAPIFY(A), meaning start at the root). Here 4 swaps with its larger child 18, then with its larger child 11.',
      'Return max, which is 20. The repair walks one path down the tree, so the whole procedure is $\\Theta(\\lg n)$.',
    ],
    heap: [20, 18, 15, 7, 11, 9, 4],
    heapSteps: [
      { text: 'max = 20; A[1] = A[7] = 4; heapSize = 6.', heap: [4, 18, 15, 7, 11, 9] },
      { text: 'Children of index 1 are 18 and 15; the larger, 18, beats 4: swap A[1] and A[2].', heap: [18, 4, 15, 7, 11, 9] },
      { text: 'Children of index 2 are 7 and 11; the larger, 11, beats 4: swap A[2] and A[5]. Index 5 has no children: done.', heap: [18, 11, 15, 7, 4, 9] },
    ],
    answer: 'if A.heapSize < 1: error “heap underflow”; max = A[1]; A[1] = A[heapSize]; A.heapSize = A.heapSize − 1; MAX-HEAPIFY(A, 1); return max.',
    mistake: 'Shrinking heapSize after MAX-HEAPIFY instead of before. Heapify then still treats the old last cell as part of the heap, so the heap keeps a duplicate and the wrong size.',
    tryIt: { q: 'Someone swaps lines 2 and 3, writing A[1] = A[heapSize] before max = A[1]. Run it on [20, 18, 15, 7, 11, 9, 4]: what is returned?', a: 'A[1] becomes 4 first, so max = 4 is saved and returned, and 20 is lost for good. The root must be saved before it is overwritten.' },
  };

  H['c310-heap-extract-slide'] = {
    asks: 'Run HEAP-EXTRACT-MAX on the slide heap [16, 14, 10, 8, 7, 9, 3, 2, 4, 1] and give the array afterwards. It returns 16.',
    idea: 'The last leaf (1) is promoted to the root, where it clearly does not belong. MAX-HEAPIFY then lets it sink: at each node, swap it with the larger child, until no child is larger.',
    steps: [
      'Save max = A[1] = 16 and move the last element to the root: A[1] = A[10] = 1. Then heapSize = 9, so index 10 is no longer in the heap.',
      'MAX-HEAPIFY(A, 1): the children are A[2] = 14 and A[3] = 10. The larger is 14, and $14 > 1$: swap A[1] and A[2].',
      '1 is now at index 2. Its children are A[4] = 8 and A[5] = 7; the larger is 8 > 1: swap A[2] and A[4].',
      '1 is now at index 4. Its children are A[8] = 2 and A[9] = 4; the larger is 4 > 1: swap A[4] and A[9].',
      'Index 9 would have children 18 and 19, both beyond heapSize = 9, so it is a leaf: stop. Three swaps, one per level, matching the height $\\lfloor \\lg 9 \\rfloor = 3$.',
    ],
    heap: [16, 14, 10, 8, 7, 9, 3, 2, 4, 1],
    heapSteps: [
      { text: 'A[1] = A[10] = 1, heapSize = 9.', heap: [1, 14, 10, 8, 7, 9, 3, 2, 4] },
      { text: 'Swap with the larger child 14 (index 2).', heap: [14, 1, 10, 8, 7, 9, 3, 2, 4] },
      { text: 'Swap with the larger child 8 (index 4).', heap: [14, 8, 10, 1, 7, 9, 3, 2, 4] },
      { text: 'Swap with the larger child 4 (index 9). Leaf: done.', heap: [14, 8, 10, 4, 7, 9, 3, 2, 1] },
    ],
    answer: '[14, 8, 10, 4, 7, 9, 3, 2, 1], and the call returns 16.',
    mistake: 'Swapping with the first child that is bigger instead of the larger child. At index 4, swapping 1 with 2 would put 2 above 4 and break the heap.',
    tryIt: { q: 'Run HEAP-EXTRACT-MAX on [50, 40, 45, 20, 35, 30, 10, 5].', a: 'Returns 50. Move 5 to the root (size 7); its larger child is 45 (index 3): swap. At index 3 the children are 30 and 10; 30 > 5: swap. Result [45, 40, 30, 20, 35, 5, 10].' },
  };

  H['c310-heap-extract-prac'] = {
    asks: 'Run HEAP-EXTRACT-MAX on [30, 20, 25, 8, 15, 22, 10] and give the array that is left.',
    idea: 'Same three moves every time: save the root, move the last leaf up to the root, let it sink. Here it sinks to the right, because the larger child is on the right.',
    steps: [
      'Save max = A[1] = 30, then move the last element up: A[1] = A[7] = 10 and heapSize = 6. Index 7 is now outside the heap.',
      'MAX-HEAPIFY(A, 1): the children are A[2] = 20 and A[3] = 25. The larger is 25 > 10: swap A[1] and A[3].',
      '10 is now at index 3. Its left child is index 6 (A[6] = 22); its right child would be index 7, but $7 > 6 =$ heapSize, so it is not checked.',
      '22 > 10: swap A[3] and A[6]. Index 6 would have children 12 and 13, both beyond heapSize: stop.',
      'Check the result: 25 is $\\ge$ 20 and 22; 20 is $\\ge$ 8 and 15; 22 is $\\ge$ 10. A valid max-heap.',
    ],
    heap: [30, 20, 25, 8, 15, 22, 10],
    heapSteps: [
      { text: 'A[1] = A[7] = 10, heapSize = 6.', heap: [10, 20, 25, 8, 15, 22] },
      { text: 'Swap with the larger child 25 (index 3).', heap: [25, 20, 10, 8, 15, 22] },
      { text: 'Swap with the only child in the heap, 22 (index 6). Leaf: done.', heap: [25, 20, 22, 8, 15, 10] },
    ],
    answer: '[25, 20, 22, 8, 15, 10], and the call returns 30.',
    mistake: 'Still looking at index 7 after heapSize dropped to 6. That cell held the 10 you just moved, and it is no longer part of the heap.',
    tryIt: { q: 'Run HEAP-EXTRACT-MAX on [60, 50, 45, 30, 40, 42, 12].', a: 'Returns 60. Move 12 to the root (size 6); its larger child is 50 (index 2): swap. At index 2 the children are 30 and 40; 40 > 12: swap. Result [50, 40, 45, 30, 12, 42].' },
  };

  H['c310-heap-increase-steps'] = {
    asks: "Say under what condition HEAP-INCREASE-KEY(A, i, key)’s loop swaps A[i] with its parent.",
    idea: 'A key that got bigger may now outrank its parent, like an employee promoted past their manager. They swap desks and the check repeats one level up, until the one above is at least as big or the key reaches the root.',
    steps: [
      'Check: if key < A[i], error “new key is smaller than current key”. This procedure only raises keys.',
      'Set A[i] = key. Nothing below i can break: the children were $\\le$ the old key, so they are $\\le$ the bigger new one.',
      'Loop: while $i > 1$ and A[Parent(i)] < A[i], swap A[i] with A[Parent(i)] and set $i = \\text{Parent}(i) = \\lfloor i/2 \\rfloor$.',
      'Example below: A[8] = 5 becomes 22. Parent 4 holds 9 < 22, swap; parent 2 holds 17 < 22, swap; parent 1 holds $25 \\ge 22$, stop.',
      'Each swap moves the key up one level, and the heap has height $\\lfloor \\lg n \\rfloor$. So there are at most $\\lfloor \\lg n \\rfloor$ swaps: $O(\\lg n)$.',
    ],
    heap: [25, 17, 20, 9, 14, 11, 3, 5, 8],
    heapSteps: [
      { text: 'Set A[8] = 22. Parent A[4] = 9 is smaller.', heap: [25, 17, 20, 9, 14, 11, 3, 22, 8] },
      { text: 'Swap A[8] and A[4]; now $i = 4$. Parent A[2] = 17 is smaller.', heap: [25, 17, 20, 22, 14, 11, 3, 9, 8] },
      { text: 'Swap A[4] and A[2]; now $i = 2$. Parent A[1] = 25 is not smaller: stop.', heap: [25, 22, 20, 17, 14, 11, 3, 9, 8] },
    ],
    graph: {
      caption: 'Bars: the most swaps INCREASE-KEY can make in a heap of $n$ elements, $\\lfloor \\lg n \\rfloor$. The staircase only steps up when $n$ doubles.',
      x: [0, 33], y: [0, 6], xLabel: 'n (heap size)', yLabel: 'swaps',
      curves: [{ label: '$\\lg n$', f: n => (n < 1 ? 0 : lg(n)), tone: 'a' }],
      bars: { label: 'worst-case swaps $\\lfloor \\lg n \\rfloor$', tone: 'b', values: Array.from({ length: 32 }, (_, k) => [k + 1, Math.floor(lg(k + 1))]) },
    },
    answer: "While $i > 1$ and A[Parent(i)] < A[i]: swap and set i = Parent(i). (Before that: error if key < A[i], then A[i] = key. $O(\\lg n)$.)",
    mistake: 'Forgetting the $i > 1$ test. Without it the root looks up Parent(1) = 0, which is not part of the heap.',
    tryIt: { q: 'Max-heap [40, 30, 35, 12, 25, 33, 20]: run HEAP-INCREASE-KEY(A, 7, 45). Give A and the number of swaps.', a: 'A[7] = 45. Parent 3 holds 35 < 45: swap. Parent 1 holds 40 < 45: swap. Now $i = 1$, so the loop ends. Result [45, 30, 40, 12, 25, 33, 35], 2 swaps.' },
  };

  H['c310-heap-increase-slide'] = {
    asks: 'On the slide heap [16, 14, 10, 8, 7, 9, 3, 2, 4, 1], raise A[9] from 4 to 15 with HEAP-INCREASE-KEY(A, 9, 15). Give the array afterwards.',
    idea: 'Only the path from index 9 up to the root can change: 9, 4, 2, 1 (each step is $\\lfloor i/2 \\rfloor$). 15 climbs that path until it meets a parent at least as big.',
    steps: [
      'Check: $15 \\ge 4$, so no error. Set A[9] = 15.',
      '$i = 9$: Parent(9) = $\\lfloor 9/2 \\rfloor = 4$ and A[4] = 8. Since $8 < 15$, swap: A[4] = 15, A[9] = 8, and $i = 4$.',
      'Parent(4) = 2 and A[2] = 14. Since $14 < 15$, swap: A[2] = 15, A[4] = 14, and $i = 2$.',
      'Parent(2) = 1 and A[1] = 16. $16 < 15$ is false, so the loop stops with 15 at index 2.',
      'Every cell off the path (indices 3, 5, 6, 7, 8, 10) is unchanged.',
    ],
    heap: [16, 14, 10, 8, 7, 9, 3, 2, 4, 1],
    heapSteps: [
      { text: 'Set A[9] = 15.', heap: [16, 14, 10, 8, 7, 9, 3, 2, 15, 1] },
      { text: '8 < 15: swap A[9] and A[4].', heap: [16, 14, 10, 15, 7, 9, 3, 2, 8, 1] },
      { text: '14 < 15: swap A[4] and A[2]. Then 16 is not < 15: stop.', heap: [16, 15, 10, 14, 7, 9, 3, 2, 8, 1] },
    ],
    answer: '[16, 15, 10, 14, 7, 9, 3, 2, 8, 1].',
    mistake: 'Using $i - 1$ or $(i + 1)/2$ as the parent and so climbing the wrong cells. For 1-based arrays, Parent(9) = 4, Parent(4) = 2, Parent(2) = 1.',
    tryIt: { q: 'Same starting heap [16, 14, 10, 8, 7, 9, 3, 2, 4, 1]: run HEAP-INCREASE-KEY(A, 10, 20).', a: 'The path is 10, 5, 2, 1. 7 < 20: swap; 14 < 20: swap; 16 < 20: swap; now $i = 1$. Result [20, 16, 10, 8, 14, 9, 3, 2, 4, 7].' },
  };

  H['c310-heap-increase-prac'] = {
    asks: 'On [30, 20, 25, 8, 15, 22, 10], run HEAP-INCREASE-KEY(A, 4, 28) and give the array.',
    idea: 'Index 4 is two levels below the root, so its path up is 4, 2, 1. 28 climbs past every parent smaller than it and stops under the first one that is at least 28.',
    steps: [
      'Check: $28 \\ge 8$, so no error. Set A[4] = 28.',
      'Parent(4) = 2 and A[2] = 20. Since $20 < 28$, swap: A[2] = 28, A[4] = 20, and $i = 2$.',
      'Parent(2) = 1 and A[1] = 30. $30 < 28$ is false: stop.',
      'Check: 30 is $\\ge$ 28 and 25; 28 is $\\ge$ 20 and 15; 25 is $\\ge$ 22 and 10. A valid max-heap.',
    ],
    heap: [30, 20, 25, 8, 15, 22, 10],
    heapSteps: [
      { text: 'Set A[4] = 28.', heap: [30, 20, 25, 28, 15, 22, 10] },
      { text: '20 < 28: swap A[4] and A[2]. Then 30 is not < 28: stop.', heap: [30, 28, 25, 20, 15, 22, 10] },
    ],
    answer: '[30, 28, 25, 20, 15, 22, 10].',
    mistake: 'Writing 28 into A[4] and stopping, or running MAX-HEAPIFY downward. A bigger key can only clash with its parent, so it must move up.',
    tryIt: { q: 'Same starting heap [30, 20, 25, 8, 15, 22, 10]: run HEAP-INCREASE-KEY(A, 6, 35).', a: 'A[6] = 35. Parent 3 holds 25 < 35: swap. Parent 1 holds 30 < 35: swap; now $i = 1$. Result [35, 20, 30, 8, 15, 25, 10].' },
  };

  H['c310-heap-insert-steps'] = {
    asks: "Explain why MAX-HEAP-INSERT first puts $-\\infty$ in the new cell.",
    idea: 'Insert reuses INCREASE-KEY. Add a new leaf holding the smallest possible value, which cannot break anything, then "promote" it to key. The promotion climbs exactly as far as needed.',
    steps: [
      'A.heapSize = A.heapSize + 1: the heap gets one new cell at the end, the next free spot on the bottom level.',
      'A[A.heapSize] = $-\\infty$. A leaf holding $-\\infty$ is $\\le$ its parent, so the heap is still valid.',
      'HEAP-INCREASE-KEY(A, A.heapSize, key). Its first line errors if key < A[i], but no key is smaller than $-\\infty$, so it never errors.',
      'Example below: insert 17 into a 7-element heap. Index 8 gets $-\\infty$, then 17; parent 4 holds 6 < 17: swap; parent 2 holds 15 < 17: swap; parent 1 holds 20: stop.',
      'The cost is one HEAP-INCREASE-KEY, at most one path to the root: $O(\\lg n)$.',
    ],
    heap: [20, 15, 18, 6, 9, 12, 4],
    heapSteps: [
      { text: 'heapSize = 8; A[8] = $-\\infty$ (not drawn), then raised to 17.', heap: [20, 15, 18, 6, 9, 12, 4, 17] },
      { text: '6 < 17: swap A[8] and A[4].', heap: [20, 15, 18, 17, 9, 12, 4, 6] },
      { text: '15 < 17: swap A[4] and A[2]. Then 20 is not < 17: stop.', heap: [20, 17, 18, 15, 9, 12, 4, 6] },
    ],
    answer: "$-\\infty$ keeps the heap valid and guarantees key $\\ge$ the current value, so INCREASE-KEY’s check passes. (Lines: heapSize += 1; A[heapSize] = $-\\infty$; HEAP-INCREASE-KEY(A, heapSize, key).)",
    mistake: 'Putting the new key at A[1], or anywhere other than the end. The new element always enters as the last leaf and climbs; only cells on its path move.',
    tryIt: { q: 'Suppose line 2 stored 0 instead of $-\\infty$. Insert $-5$ into the max-heap [$-2$, $-4$, $-3$]. What goes wrong?', a: 'Index 4 gets 0, but its parent A[2] = $-4$ is smaller, so the heap is already broken. Then HEAP-INCREASE-KEY(A, 4, $-5$) sees $-5 < 0$ and errors. $-\\infty$ avoids both problems.' },
  };

  H['c310-heap-insert-slide'] = {
    asks: 'Insert 12 into the slide heap [16, 14, 10, 8, 7, 9, 3, 2, 4, 1] with MAX-HEAP-INSERT and give the array.',
    idea: 'The new key enters as leaf 11, the next free spot. Its path up is 11, 5, 2, 1, and it climbs until a parent is at least 12.',
    steps: [
      'heapSize goes from 10 to 11. A[11] = $-\\infty$, then HEAP-INCREASE-KEY(A, 11, 12) sets A[11] = 12 (no error, since $12 \\ge -\\infty$).',
      'Parent(11) = $\\lfloor 11/2 \\rfloor = 5$ and A[5] = 7. Since $7 < 12$, swap: A[5] = 12, A[11] = 7, and $i = 5$.',
      'Parent(5) = 2 and A[2] = 14. $14 < 12$ is false: stop.',
      'One swap. Index 5 now holds 12, with children A[10] = 1 and A[11] = 7, both $\\le 12$.',
    ],
    heap: [16, 14, 10, 8, 7, 9, 3, 2, 4, 1],
    heapSteps: [
      { text: 'heapSize = 11; A[11] = $-\\infty$, raised to 12.', heap: [16, 14, 10, 8, 7, 9, 3, 2, 4, 1, 12] },
      { text: '7 < 12: swap A[11] and A[5]. Then 14 is not < 12: stop.', heap: [16, 14, 10, 8, 12, 9, 3, 2, 4, 1, 7] },
    ],
    answer: '[16, 14, 10, 8, 12, 9, 3, 2, 4, 1, 7].',
    mistake: 'Appending 12 and stopping. The array would end in 12 under parent 7, which breaks the heap property.',
    tryIt: { q: 'Insert 20 into the same starting heap [16, 14, 10, 8, 7, 9, 3, 2, 4, 1].', a: 'A[11] = 20. 7 < 20: swap to index 5; 14 < 20: swap to index 2; 16 < 20: swap to index 1. Result [20, 16, 10, 8, 14, 9, 3, 2, 4, 1, 7].' },
  };

  H['c310-heap-insert-prac'] = {
    asks: 'Insert 27 into [30, 20, 25, 8, 15, 22, 10] with MAX-HEAP-INSERT and give the array.',
    idea: '7 elements fill three levels exactly, so the new leaf starts a fourth level at index 8, under the 8 at index 4. From there it climbs the path 8, 4, 2, 1.',
    steps: [
      'heapSize goes from 7 to 8. A[8] = $-\\infty$, then HEAP-INCREASE-KEY(A, 8, 27) sets A[8] = 27.',
      'Parent(8) = 4 and A[4] = 8 < 27: swap. Now A[4] = 27, A[8] = 8, and $i = 4$.',
      'Parent(4) = 2 and A[2] = 20 < 27: swap. Now A[2] = 27, A[4] = 20, and $i = 2$.',
      'Parent(2) = 1 and A[1] = 30. $30 < 27$ is false: stop.',
    ],
    heap: [30, 20, 25, 8, 15, 22, 10],
    heapSteps: [
      { text: 'heapSize = 8; A[8] = $-\\infty$, raised to 27.', heap: [30, 20, 25, 8, 15, 22, 10, 27] },
      { text: '8 < 27: swap A[8] and A[4].', heap: [30, 20, 25, 27, 15, 22, 10, 8] },
      { text: '20 < 27: swap A[4] and A[2]. Then 30 is not < 27: stop.', heap: [30, 27, 25, 20, 15, 22, 10, 8] },
    ],
    answer: '[30, 27, 25, 20, 15, 22, 10, 8].',
    mistake: 'Hanging the new leaf under 10 (A[7]) because the right side "has room". The next slot is always index heapSize + 1 = 8, whose parent is index 4.',
    tryIt: { q: 'Insert 45 into the max-heap [50, 35, 40, 10, 30, 38, 22].', a: 'A[8] = 45. Parent 4 holds 10: swap. Parent 2 holds 35: swap. Parent 1 holds 50: stop. Result [50, 45, 40, 35, 30, 38, 22, 10].' },
  };

  H['c310-heap-decrease-key'] = {
    asks: "In a max-heap, the key at index i gets smaller. Which course procedure repairs the heap?",
    idea: 'This is a demotion, the mirror image of INCREASE-KEY. A smaller key is still $\\le$ its parent, but it may now be smaller than a child, so it can only sink, and sinking is exactly what MAX-HEAPIFY does.',
    steps: [
      'Above i: before the change, $A[\\text{Parent}(i)] \\ge$ old A[i] $>$ new A[i]. So the link to the parent is still fine.',
      'Below i: the children were $\\le$ the old key but may be $>$ the new one. That is the only place the heap can break.',
      'MAX-HEAPIFY(A, i) requires both subtrees of i to be heaps. They are, because lowering A[i] did not touch them.',
      'Example below: A[2] = 32 drops to 7. Its children are 18 and 27, so swap with 27; at index 5 the children are 20 and 6, so swap with 20; index 10 is a leaf, so stop.',
      'Decrease-key is not its own procedure on her slides: set A[i] to the smaller key, then call MAX-HEAPIFY(A, i). Cost: one path down, $O(\\lg n)$.',
    ],
    heap: [40, 32, 36, 18, 27, 30, 9, 11, 14, 20, 6],
    heapSteps: [
      { text: 'A[2] = 7. Parent 40 is still bigger; children 18 and 27 are not smaller.', heap: [40, 7, 36, 18, 27, 30, 9, 11, 14, 20, 6] },
      { text: 'MAX-HEAPIFY(A, 2): larger child 27 (index 5) beats 7: swap.', heap: [40, 27, 36, 18, 7, 30, 9, 11, 14, 20, 6] },
      { text: 'MAX-HEAPIFY(A, 5): larger child 20 (index 10) beats 7: swap. Leaf: done.', heap: [40, 27, 36, 18, 20, 30, 9, 11, 14, 7, 6] },
    ],
    answer: "MAX-HEAPIFY(A, i): the element can only move down (its parent is still $\\ge$ it), and both subtrees of i are still heaps, so the precondition holds.",
    mistake: 'Running the INCREASE-KEY loop (moving up) after a decrease. A smaller key never beats its parent, so that loop does nothing and the heap stays broken below.',
    tryIt: { q: 'Max-heap [50, 45, 40, 30, 35, 38, 22]: A[1] drops to 25. Repair it.', a: 'MAX-HEAPIFY(A, 1): children 45 and 40, swap with 45 (index 2). At index 2: children 30 and 35, swap with 35 (index 5). Leaf. Result [45, 35, 40, 30, 25, 38, 22].' },
  };

  H['c310-heap-decrease-prac'] = {
    asks: 'In [30, 20, 25, 8, 15, 22, 10], A[2] drops from 20 to 5. Repair the heap and give the array.',
    idea: '5 is now smaller than its children, so it sinks. MAX-HEAPIFY(A, 2) swaps it with the larger child until it is a leaf or at least as big as both children.',
    steps: [
      'Set A[2] = 5. The parent A[1] = 30 is $\\ge 5$, so nothing above needs fixing.',
      'MAX-HEAPIFY(A, 2): Left(2) = 4 and Right(2) = 5, holding 8 and 15. The larger is 15 > 5: swap A[2] and A[5].',
      '5 is now at index 5. Left(5) = 10 is beyond heapSize = 7, so index 5 is a leaf: stop.',
      'Check: 30 is $\\ge$ 15 and 25; 15 is $\\ge$ 8 and 5; 25 is $\\ge$ 22 and 10. A valid max-heap.',
    ],
    heap: [30, 20, 25, 8, 15, 22, 10],
    heapSteps: [
      { text: 'Set A[2] = 5. Its children 8 and 15 are both bigger.', heap: [30, 5, 25, 8, 15, 22, 10] },
      { text: 'Swap with the larger child 15 (index 5). Leaf: done.', heap: [30, 15, 25, 8, 5, 22, 10] },
    ],
    answer: '[30, 15, 25, 8, 5, 22, 10].',
    mistake: 'Swapping 5 with the left child 8 because it is checked first. Then 8 would sit above 15 and the heap breaks; always swap with the larger child.',
    tryIt: { q: 'Same starting heap [30, 20, 25, 8, 15, 22, 10]: A[3] drops from 25 to 9. Repair it.', a: 'MAX-HEAPIFY(A, 3): children 22 (index 6) and 10 (index 7). Both beat 9, but the larger is 22: swap. Leaf. Result [30, 20, 22, 8, 15, 9, 10].' },
  };

  // ---------------------------------------------------------------- Costs

  H['c310-heap-cost-peek'] = {
    asks: 'What is the worst-case running time of peek (max() on a max-heap, min() on a min-heap)?',
    idea: 'A heap keeps the winner in the same seat, A[1], at all times. Looking at it is one read, however many elements sit behind it.',
    steps: [
      'Peek returns the highest-priority element without removing it. On a max-heap that is HEAP-MAXIMUM: return A[1].',
      'The root is the maximum because every parent is $\\ge$ its children, so following parents up from any node ends at A[1].',
      'The work is one array read and a return. It does not depend on $n$, so it is $O(1)$, in fact $\\Theta(1)$, even in the worst case.',
      'Compare with an unsorted array: the maximum could be anywhere, so finding it means checking all $n$ cells, $\\Theta(n)$.',
      'A min-heap works the same way (every parent $\\le$ its children): min() returns A[1], also $O(1)$.',
    ],
    heap: [16, 14, 10, 8, 7, 9, 3, 2, 4, 1],
    graph: {
      caption: 'Peek is the flat line: a heap of 40 costs the same single read as a heap of 2. Insert and extract grow like $\\lg n$; scanning an unsorted array grows like $n$.',
      x: [1, 40], y: [0, 16], xLabel: 'n', yLabel: 'steps',
      curves: [
        { label: 'peek: $1$', f: () => 1, tone: 'a' },
        { label: 'insert / extract: $\\lg n$', f: lg, tone: 'b' },
        { label: 'scan an unsorted array: $n$', f: n => n, tone: 'c' },
      ],
    },
    answer: '$O(1)$ (indeed $\\Theta(1)$): peek is just return A[1].',
    mistake: 'Answering $O(\\lg n)$ because "heap operations are log n". Only operations that move an element along a path cost $\\lg n$; peek moves nothing.',
    tryIt: { q: 'You call peek 1000 times in a row on a max-heap of $n$ elements, with no inserts or extracts in between. What does each call return, and what is the total cost?', a: 'Each call reads A[1] and returns the same element, because peek does not change the heap. Total $1000 \\cdot O(1)$: it does not grow with $n$.' },
  };

  H['c310-heap-cost-insert-extract'] = {
    asks: 'What is the worst-case time of enqueue (insert) and dequeue (extract-max) when the priority queue is a binary heap?',
    idea: 'Both repair the heap by moving one element along a single root-to-leaf path: insert climbs up, extract sinks down. A heap is a nearly complete tree, so that path has only about $\\lg n$ edges.',
    steps: [
      'Insert is MAX-HEAP-INSERT: add a leaf, then HEAP-INCREASE-KEY climbs at most from the bottom level to the root, one swap per level.',
      'Extract is HEAP-EXTRACT-MAX: move the last leaf to the root, then MAX-HEAPIFY sinks it, at most one swap per level.',
      'A nearly complete tree with $n$ nodes has height $\\lfloor \\lg n \\rfloor$, because each new level doubles the room. The heap below has 15 nodes and height 3.',
      { text: 'Height for a few sizes:', table: { head: ['$n$', 'height $\\lfloor \\lg n \\rfloor$'], rows: [['7', '2'], ['15', '3'], ['1000', '9'], ['1,000,000', '19']] } },
      'So each operation does constant work per level over at most $\\lfloor \\lg n \\rfloor$ levels: $O(\\lg n)$ each. $O(1)$ ignores the climb or sink, and $O(n)$ would mean touching every element when only one path is touched.',
    ],
    heap: [15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
    graph: {
      caption: 'Vertical axis is logarithmic. At $n = 1000$ a path is about 10 steps while the whole heap is 1000 elements: insert and extract touch a tiny slice.',
      x: [2, 1024], logY: true, xLabel: 'n', yLabel: 'steps',
      curves: [
        { label: 'peek: $1$', f: () => 1, tone: 'a' },
        { label: 'insert / extract: $\\lg n$', f: lg, tone: 'b' },
        { label: 'touch every element: $n$', f: n => n, tone: 'c' },
      ],
      marks: [{ x: 1000, label: '$n = 1000$' }],
    },
    answer: '$O(\\lg n)$ each: one path of length at most $\\lfloor \\lg n \\rfloor$ (insert goes up, extract goes down).',
    mistake: 'Choosing "$O(1)$ insert" because appending to an array is cheap. The append is $O(1)$, but restoring the heap afterwards is the climb, up to $\\lfloor \\lg n \\rfloor$ swaps.',
    tryIt: { q: 'A heap holds 1000 keys. At most how many swaps can MAX-HEAP-INSERT make? At most how many can HEAP-EXTRACT-MAX make?', a: 'Insert: the new leaf is index 1001, at depth $\\lfloor \\lg 1001 \\rfloor = 9$, so at most 9 swaps up. Extract: after shrinking there are 999 keys, height $\\lfloor \\lg 999 \\rfloor = 9$, so at most 9 swaps down.' },
  };
})(globalThis.FC = globalThis.FC || {});
