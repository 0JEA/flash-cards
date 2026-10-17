// Help walkthroughs for CSC 310: the binary-search worksheet cards (worksheet1-binarySearchAnalysis.pdf),
// the Lecture 7 quicksort cards not covered in csc310-help-f.js, and the remaining heap / heapsort cards
// ("Heap-HeapSort-Priority Queue.pdf"). Same entry format as decks/csc310-help.js (see its header).
// Conventions follow the slides exactly:
//   - BinarySearch (worksheet p. 1): 1-based, low = 1, high = n, while low <= high, mid = floor((low+high)/2).
//     RecursiveBinarySearch (worksheet p. 3): 0-based A[0..n-1], mid = (low + high) // 2.
//   - PARTITION (Lecture 7, p. 6): pivot = A[end], smallerCounter = start - 1, 1-based.
//   - Max-Heapify / BuildHeap / Heapsort: 1-based, Left(i) = 2i, Right(i) = 2i + 1.
// Every trace, count, heap state and tryIt answer was computed with python3 running that exact
// pseudocode on 2026-10-16.
// Academic integrity: nothing from Assignment 3 (QuickSort vs MergeSort lab: no median-of-three, no
// timing data, no locality discussion) or the priority-queue assignment (no Task / scheduler code).
// tryIt problems use arrays and keys that no assignment uses.
(function (FC) {
  'use strict';
  const H = FC.help = FC.help || {};

  // ── shared pictures ──
  const PHEAD = ['$j$', 'A[$j$]', 'A[$j$] $\\le$ pivot?', 'smallerCounter', 'A afterwards'];
  const BHEAD = ['iteration', 'low', 'high', 'mid', 'a[mid]', 'compare', 'then'];
  const lg = Math.log2;
  const worstIters = n => Math.floor(Math.log2(n)) + 1;   // exact worst-case loop count, n >= 1
  const WS = '[3, 8, 15, 22, 27, 31, 39, 44, 52, 60]';

  // ═══════════════════════ Binary search worksheet ═══════════════════════

  H['c310-ws-precondition'] = {
    asks: "Say what must be true of the array before binary search can be used.",
    idea: 'Think of finding a word in a dictionary: open near the middle, see that the word there comes after yours, and tear away the whole back half without reading it. You may only throw that half away because the dictionary is in order.',
    steps: [
      'Requirement: a[1..n] is sorted in ascending order. Then everything left of mid is $\\le a[\\text{mid}]$ and everything right of it is $\\ge a[\\text{mid}]$.',
      'One step: take mid, the middle of the current interval low..high, and compare a[mid] with the key.',
      'If they are equal, the search is done; if a[mid] < key, the key can only be right of mid (low = mid + 1); if a[mid] > key, high = mid − 1. Either way about half the interval is gone.',
      { text: 'What goes wrong without sorting: search for key 2 in the unsorted [7, 2, 9, 4, 1].', table: { head: BHEAD, rows: [['1', '1', '5', '3', '9', '9 > 2', 'high = 2'], ['2', '1', '2', '1', '7', '7 > 2', 'high = 0'], ['—', '1', '0', '—', '—', 'low > high', 'return −1']] } },
      'It returns −1, yet 2 sits at index 2: at iteration 2, "7 > 2" threw that index away. On unsorted data a comparison says nothing about which side the key is on.',
    ],
    answer: "The array must be sorted; otherwise comparing with the middle element says nothing about which half holds the key.",
    mistake: 'Saying the array must be "small" or "free of duplicates". The only requirement is sorted order (with duplicates it returns one of the matching indices).',
    tryIt: { q: 'Binary search for key 8 in the unsorted [9, 8, 2, 7, 5]. What is returned, and is it right?', a: 'mid = 3: 2 < 8, low = 4. mid = 4: 7 < 8, low = 5. mid = 5: 5 < 8, low = 6 > high = 5: returns −1. Wrong: 8 is at index 2, which the first step discarded.' },
  };

  H['c310-ws-code'] = {
    asks: 'Write the worksheet’s iterative binary search on a 1-based sorted array a[1..n]. It returns the index of key, or −1.',
    idea: 'Keep two fingers, low and high, on the ends of the part of the array that could still hold the key. Look at the middle and move one finger past it. When the fingers cross, that part is empty and the key is not there.',
    steps: [
      'Start with the whole array as the candidate interval: low = 1, high = $n$.',
      'Loop while low $\\le$ high (at least one element left). Compute mid $= \\lfloor (\\text{low} + \\text{high})/2 \\rfloor$.',
      'If a[mid] = key, return mid; if a[mid] < key, the key is to the right, so low = mid + 1; otherwise it is to the left, so high = mid − 1.',
      'The +1 and −1 matter: mid has just been checked, so it is excluded. That also makes the interval shrink every iteration, so the loop must end.',
      'If the loop ends (low > high), nothing is left to check: return −1.',
      { text: 'Check it on a = [2, 5, 9, 12, 20], key 12:', table: { head: BHEAD, rows: [['1', '1', '5', '3', '9', '9 < 12', 'low = 4'], ['2', '4', '5', '4', '12', 'equal', 'return 4']] } },
    ],
    answer: 'low = 1; high = $n$; while low $\\le$ high: mid $= \\lfloor (\\text{low} + \\text{high})/2 \\rfloor$; if a[mid] = key return mid; else if a[mid] < key: low = mid + 1; else high = mid − 1. After the loop, return −1.',
    mistake: 'Writing while low < high. When low = high there is still one unchecked element: a = [4] with key 4 would wrongly return −1.',
    tryIt: { q: 'With the same code, what does BinarySearch return for key 6 on a = [2, 5, 9, 12, 20]?', a: 'mid = 3: 9 > 6, high = 2. mid = 1: 2 < 6, low = 2. mid = 2: 5 < 6, low = 3. Now low = 3 > high = 2: return −1.' },
  };

  H['c310-ws-update-mc'] = {
    asks: 'a[mid] is smaller than the key. Pick the update to low or high that keeps binary search correct.',
    idea: 'In a sorted array, everything at or left of mid is $\\le a[\\text{mid}]$, which is smaller than the key, so none of it can be the key. The new interval starts just right of mid.',
    steps: [
      'a[mid] < key and the array is sorted, so a[1..mid] are all < key. If the key is present, it is in a[mid+1..high].',
      'So low = mid + 1, and high stays as it is.',
      'high = mid − 1 goes the wrong way: it keeps the left half, where the key cannot be.',
      { text: 'Why not low = mid? Try a = [4, 7], key 7, with the wrong update:', table: { head: BHEAD, rows: [['1', '1', '2', '1', '4', '4 < 7', 'low = mid = 1'], ['2', '1', '2', '1', '4', '4 < 7', 'low = mid = 1'], ['3', '1', '2', '1', '4', '4 < 7', '… forever']] } },
      'Because the floor makes mid = low when high = low + 1, low = mid changes nothing and the loop never ends. With low = mid + 1: low = 2, mid = 2, found.',
    ],
    answer: 'low = mid + 1: mid and everything left of it are smaller than the key.',
    mistake: 'Choosing low = mid "in case the key is at mid". The test a[mid] = key ran one line earlier, so mid is already ruled out.',
    tryIt: { q: 'Now a[mid] > key. Which update is correct, and what goes wrong with high = mid on a = [5], key 3?', a: 'high = mid − 1. With high = mid: low = high = 1, mid = 1, 5 > 3, high stays 1, and the loop repeats forever.' },
  };

  H['c310-ws-dry-27'] = {
    asks: 'Trace the worksheet code on a = ' + WS + ' with key 27, and give the index it returns.',
    idea: 'The first element binary search looks at is the middle one. If the key happens to be exactly there, the search ends after one look: the best case.',
    steps: [
      '$n = 10$, so low = 1 and high = 10.',
      'mid $= \\lfloor (1 + 10)/2 \\rfloor = \\lfloor 5.5 \\rfloor = 5$.',
      { text: 'Trace:', table: { head: BHEAD, rows: [['1', '1', '10', '5', '27', '27 = 27', 'return 5']] } },
      'One iteration, one comparison with the key: the best case, $T_{best}(n) = 1$.',
    ],
    answer: '5 (found on the first iteration).',
    mistake: 'Rounding 5.5 up to 6, or counting from 0 (giving 4). The worksheet uses 1-based indices and the floor.',
    tryIt: { q: 'On a = [4, 9, 13, 18, 21, 30, 35, 41, 47], search for key 9. Give (low, high, mid) at each iteration.', a: '(1, 9, 5): 21 > 9, high = 4. (1, 4, 2): a[2] = 9 = key: return 2.' },
  };

  H['c310-ws-dry-25'] = {
    asks: 'Trace the search for key 25, which is not in a = ' + WS + ', and give the result.',
    idea: 'For a missing key the interval keeps shrinking until it is empty. You know it is empty when low passes high; that is the signal to return −1.',
    steps: [
      'Start low = 1, high = 10. Each row: compute mid, compare a[mid] with 25, move one end.',
      { text: 'Trace:', table: { head: BHEAD, rows: [['1', '1', '10', '5', '27', '27 > 25', 'high = 4'], ['2', '1', '4', '2', '8', '8 < 25', 'low = 3'], ['3', '3', '4', '3', '15', '15 < 25', 'low = 4'], ['4', '4', '4', '4', '22', '22 < 25', 'low = 5'], ['—', '5', '4', '—', '—', 'low > high', 'return −1']] } },
      'Iteration 3: mid $= \\lfloor 7/2 \\rfloor = 3$. Iteration 4: low = high = 4, a one-element interval that still has to be checked.',
      'Then low = 5 > high = 4, the loop condition fails, and the function returns −1. Notice that 25 would sit between 22 (index 4) and 27 (index 5): exactly where high and low crossed.',
    ],
    answer: '(1, 10, 5): 27 > 25, high = 4. (1, 4, 2): 8 < 25, low = 3. (3, 4, 3): 15 < 25, low = 4. (4, 4, 4): 22 < 25, low = 5. Now low = 5 > high = 4: return −1.',
    mistake: 'Stopping when low = high. A one-element interval still needs its check (iteration 4); the loop stops only when low > high.',
    tryIt: { q: 'On a = [4, 9, 13, 18, 21, 30, 35, 41, 47], search for key 33. Give (low, high, mid) and the result.', a: '(1, 9, 5): 21 < 33, low = 6. (6, 9, 7): 35 > 33, high = 6. (6, 6, 6): 30 < 33, low = 7. Now 7 > 6: return −1.' },
  };

  H['c310-ws-dry-25-iters'] = {
    asks: 'Count the loop iterations (runs of the while body) in the search for 25.',
    idea: 'Count the mids, not the updates. Each iteration computes exactly one mid. The last test of low $\\le$ high, the one that fails, is not an iteration.',
    steps: [
      'The mids from the trace: 5, 2, 3, 4 (27 > 25, 8 < 25, 15 < 25, 22 < 25).',
      'Then low = 5, high = 4: the condition fails and the body does not run again. 4 iterations.',
      'Compare with the most a 10-element search can take: $\\lfloor \\lg 10 \\rfloor + 1 = 3 + 1 = 4$ (since $\\lg 10 \\approx 3.32$). So this search is a worst case.',
    ],
    graph: {
      caption: 'Worst-case iterations $\\lfloor \\lg n \\rfloor + 1$ climb one step each time $n$ reaches a power of 2. At $n = 10$ the worst case is 4, which the search for 25 hits.',
      x: [1, 20], y: [0, 6], xLabel: 'n', yLabel: 'iterations',
      curves: [{ label: '$\\lfloor \\lg n \\rfloor + 1$', f: worstIters, tone: 'a' }],
      marks: [{ x: 10, label: '$n = 10$' }],
    },
    answer: '4 (mids 5, 2, 3, 4).',
    mistake: 'Answering 5 by counting the final, failed test of low $\\le$ high as an iteration.',
    tryIt: { q: 'How many iterations to search for 50 in a = [4, 9, 13, 18, 21, 30, 35, 41, 47]?', a: 'mids 5, 7, 8, 9 (21, 35, 41, 47 are all < 50), then low = 10 > high = 9: 4 iterations, which is $\\lfloor \\lg 9 \\rfloor + 1$.' },
  };

  H['c310-ws-dry-60'] = {
    asks: 'Search for 60, the last element of a = ' + WS + ', and list the mid values.',
    idea: 'The key is at the far right, so every comparison says "go right": low keeps jumping up while high stays at 10.',
    steps: [
      { text: 'Trace:', table: { head: BHEAD, rows: [['1', '1', '10', '5', '27', '27 < 60', 'low = 6'], ['2', '6', '10', '8', '44', '44 < 60', 'low = 9'], ['3', '9', '10', '9', '52', '52 < 60', 'low = 10'], ['4', '10', '10', '10', '60', 'equal', 'return 10']] } },
      'Iteration 2: mid $= \\lfloor 16/2 \\rfloor = 8$. Iteration 3: mid $= \\lfloor 19/2 \\rfloor = \\lfloor 9.5 \\rfloor = 9$.',
      'Found at iteration 4, the maximum for $n = 10$: the last element is one of the deepest positions.',
    ],
    answer: '5, 8, 9, 10.',
    mistake: 'Rounding $19/2 = 9.5$ up to 10, which skips index 9 and gives 5, 8, 10.',
    tryIt: { q: 'On a = [4, 9, 13, 18, 21, 30, 35, 41, 47], list the mids when searching for 47.', a: '5, 7, 8, 9: (1, 9) → 5: 21 < 47; (6, 9) → 7: 35 < 47; (8, 9) → 8: 41 < 47; (9, 9) → 9: found.' },
  };

  H['c310-ws-dry-3'] = {
    asks: 'Search for 3, the first element of a = ' + WS + ', and list the mid values.',
    idea: 'The mirror image of searching for the last element: every comparison says "go left", so high drops while low stays at 1.',
    steps: [
      { text: 'Trace:', table: { head: BHEAD, rows: [['1', '1', '10', '5', '27', '27 > 3', 'high = 4'], ['2', '1', '4', '2', '8', '8 > 3', 'high = 1'], ['3', '1', '1', '1', '3', 'equal', 'return 1']] } },
      'Iteration 2: mid $= \\lfloor 5/2 \\rfloor = 2$. Iteration 3: low = high = 1, so mid = 1.',
      'Only 3 iterations, against 4 for the last element. The floor makes mid lean left, so the left piece (here 1..4, four elements) is never bigger than the right piece (6..10, five).',
    ],
    answer: '5, 2, 1.',
    mistake: 'Assuming the first and last elements cost the same. Here the first takes 3 iterations and the last takes 4, because of the floor.',
    tryIt: { q: 'On a = [4, 9, 13, 18, 21, 30, 35, 41, 47], list the mids when searching for 4.', a: '5, 2, 1: (1, 9) → 5: 21 > 4, high = 4; (1, 4) → 2: 9 > 4, high = 1; (1, 1) → 1: found.' },
  };

  H['c310-ws-cases'] = {
    asks: "Say about how many comparisons binary search makes in the worst case on $n$ elements, and when that happens.",
    idea: 'Picture every place the search can stop as a tree: the first mid at the top, the two possible second mids below it, and so on (the card draws it for $n = 10$). The best case is the top and the worst case is the bottom level. Most positions are near the bottom, so the average is close to the worst.',
    steps: [
      'Best case: the key is a[mid] for the very first mid. 1 comparison, $T_{best}(n) = 1$, whatever $n$ is.',
      'Worst case: the key is absent, or found only when one element is left. Each step halves the interval, so about $\\log_2 n$ steps (exactly $\\lfloor \\lg n \\rfloor + 1$ iterations).',
      { text: 'Average for $n = 10$: search for each of the 10 keys once and count iterations.', table: { head: ['iterations to find', '1', '2', '3', '4'], rows: [['how many keys', '1', '2', '4', '3'], ['which indices', '5', '2, 8', '1, 3, 6, 9', '4, 7, 10']] } },
      'Average $= \\frac{1 \\cdot 1 + 2 \\cdot 2 + 3 \\cdot 4 + 4 \\cdot 3}{10} = \\frac{29}{10} = 2.9$, close to the worst case of 4. So $T_{avg}(n) \\approx \\log_2 n$ as well.',
      'The worksheet labels its average-case line "$T_{worst}(n)$". That is a typo for $T_{avg}(n)$.',
    ],
    graph: {
      caption: 'Best case stays flat at 1. Worst case (exact) steps up by one at each power of 2, tracking $\\log_2 n$. The average sits just under the worst case.',
      x: [1, 64], y: [0, 8], xLabel: 'n', yLabel: 'comparisons',
      curves: [
        { label: 'worst: $\\lfloor \\lg n \\rfloor + 1$', f: worstIters, tone: 'a' },
        { label: '$\\log_2 n$', f: n => lg(n), tone: 'c' },
        { label: 'best: 1', f: () => 1, tone: 'b' },
      ],
    },
    answer: "About $\\log_2 n$, when the key is absent (or found only when one element remains).",
    mistake: 'Expecting the average to be half the worst, as in linear search ($n/2$ vs $n$). In binary search most keys sit in the bottom levels, so the average is only about one step below the worst.',
    tryIt: { q: 'For $n = 7$ (indices 1..7), how many keys are found in 1, 2 and 3 iterations, and what is the average?', a: '1 key (index 4) in 1, 2 keys (2, 6) in 2, 4 keys (1, 3, 5, 7) in 3. Average $= \\frac{1 + 4 + 12}{7} = \\frac{17}{7} \\approx 2.43$; worst 3.' },
  };

  H['c310-ws-1024-linear'] = {
    asks: 'Linear search checks a[1], a[2], ... in order. How many comparisons does it make in the worst case for $n = 1024$?',
    idea: 'Linear search can rule out only one element per comparison. If the key is absent, it cannot say "not found" until it has looked at every element.',
    steps: [
      'Worst case: the key is not in the array (or it is in the last slot).',
      'Each comparison eliminates exactly one element, so all $n$ must be compared: $T_{worst}(n) = n$.',
      '$n = 1024$: 1024 comparisons.',
      'For contrast, binary search on the same 1024 elements needs only about $\\log_2 1024 = 10$.',
    ],
    graph: {
      caption: 'Linear search’s worst case is the straight line $n$. Binary search’s curve is so flat it barely leaves the axis.',
      x: [1, 1024], xLabel: 'n', yLabel: 'comparisons',
      curves: [{ label: 'linear: $n$', f: n => n, tone: 'a' }, { label: 'binary: $\\log_2 n$', f: n => lg(n), tone: 'b' }],
      marks: [{ x: 1024, label: '$n = 1024$' }],
    },
    answer: '1024: the key is absent and every element is checked once.',
    mistake: 'Answering $n/2 = 512$. That is the average for a key that is present; the worst case is all $n$.',
    tryIt: { q: 'Linear search with $n = 500$: worst-case and best-case comparisons?', a: 'Worst 500 (key absent or last). Best 1 (key is a[1]).' },
  };

  H['c310-ws-1024-binary'] = {
    asks: 'Use the worksheet’s model $T_{worst}(n) = \\log_2 n$ to count binary search’s worst-case comparisons for $n = 1024$.',
    idea: '$\\log_2 n$ answers one question: how many times can you halve $n$ before you reach 1? For 1024 you can do that by hand.',
    steps: [
      'Halve until 1: 1024 → 512 → 256 → 128 → 64 → 32 → 16 → 8 → 4 → 2 → 1. That is 10 halvings.',
      'So $\\log_2 1024 = 10$, because $2^{10} = 1024$. The worksheet answer is 10.',
      'Exact count with the code: an absent key takes $\\lfloor \\lg 1024 \\rfloor + 1 = 11$ iterations, because once the interval is down to one element, that element still has to be checked.',
      'The +1 is a constant. Both 10 and 11 come from $\\Theta(\\lg n)$, so for growth-rate questions the model is fine.',
    ],
    answer: '10, since $2^{10} = 1024$ (the exact loop count for an absent key is 11).',
    mistake: 'Answering $1024/2 = 512$. Binary search halves again and again; it does not stop after one halving.',
    tryIt: { q: '$n = 4096$: the model’s answer, and the exact worst-case iterations?', a: '$2^{12} = 4096$, so the model gives 12; exactly $\\lfloor \\lg 4096 \\rfloor + 1 = 13$.' },
  };

  H['c310-ws-1e6'] = {
    asks: "Give the worst-case number of comparisons of binary search for $n = 1{,}000{,}000$.",
    idea: 'Linear search pays one comparison per element. Binary search pays one per halving, and a million can only be halved about 20 times.',
    steps: [
      'Linear: the worst case is $n$, so $1{,}000{,}000$.',
      'Binary: $\\log_2(10^6)$. Use $2^{10} = 1024 \\approx 10^3$, so $2^{20} \\approx 10^6$: about 20.',
      'More exactly, $\\log_2(10^6) \\approx 19.93$, and the code makes $\\lfloor 19.93 \\rfloor + 1 = 20$ iterations.',
      { text: 'Side by side:', table: { head: ['$n$', 'linear (worst)', 'binary (worst iterations)'], rows: [['10', '10', '4'], ['1,024', '1,024', '11'], ['1,000,000', '1,000,000', '20']] } },
      'Ratio: $10^6 / 20 = 50{,}000$ times fewer comparisons.',
    ],
    answer: "About 20: $\\log_2(10^6) \\approx 19.93$, so exactly 20 loop iterations (linear search would need $1{,}000{,}000$).",
    mistake: 'Using $\\log_{10}(10^6) = 6$. Binary search halves, so the base is 2.',
    tryIt: { q: 'Same comparison for $n = 10^9$.', a: 'Linear $10^9$. Binary: $2^{30} \\approx 10^9$, so about 30; exactly $\\lfloor 29.9 \\rfloor + 1 = 30$ iterations.' },
  };

  H['c310-ws-exact-100'] = {
    asks: 'Find the exact largest number of while-loop iterations for $n = 100$, not just "about $\\log_2 n$".',
    idea: 'Follow the unluckiest search: at every step it is left with the bigger of the two leftover pieces. Count steps until the piece is empty.',
    steps: [
      'Checking mid in an interval of $s$ elements leaves $\\lceil s/2 \\rceil - 1$ on the left and $\\lfloor s/2 \\rfloor$ on the right. The bigger is $\\lfloor s/2 \\rfloor$.',
      { text: 'Unluckiest path for $n = 100$:', table: { head: ['iteration', 'interval size before', 'biggest piece after'], rows: [['1', '100', '50'], ['2', '50', '25'], ['3', '25', '12'], ['4', '12', '6'], ['5', '6', '3'], ['6', '3', '1'], ['7', '1', '0']] } },
      'After iteration 7 the interval is empty (low > high), so the loop stops: at most 7 iterations.',
      'Formula: $2^6 = 64 \\le 100 < 128 = 2^7$, so $\\lfloor \\lg 100 \\rfloor = 6$ and $\\lfloor \\lg 100 \\rfloor + 1 = 7$.',
    ],
    graph: {
      caption: 'The exact worst case is a staircase: 7 for every $n$ from 64 to 127, so 7 at $n = 100$.',
      x: [1, 128], y: [0, 9], xLabel: 'n', yLabel: 'iterations',
      curves: [{ label: '$\\lfloor \\lg n \\rfloor + 1$', f: worstIters, tone: 'a' }, { label: '$\\lg n$', f: n => lg(n), tone: 'c' }],
      marks: [{ x: 100, label: '$n = 100$' }],
    },
    answer: '7 $= \\lfloor \\lg 100 \\rfloor + 1$ (since $\\lg 100 \\approx 6.64$).',
    mistake: 'Rounding $\\lg 100 \\approx 6.64$ down to 6, which loses the final one-element check. $\\lceil \\lg n \\rceil$ happens to give 7 here but fails at powers of 2: for $n = 64$ it gives 6, and the truth is 7.',
    tryIt: { q: 'At most how many iterations for $n = 1000$?', a: '$2^9 = 512 \\le 1000 < 1024$, so $\\lfloor \\lg 1000 \\rfloor = 9$ and the answer is 10. (Sizes 1000, 500, 250, 125, 62, 31, 15, 7, 3, 1.)' },
  };

  H['c310-ws-graph-shape'] = {
    asks: "Describe the shape of binary search’s average and worst cases when plotted against $n$.",
    idea: 'Ask what happens to each count when $n$ doubles. Linear search doubles; binary worst and average go up by 1; binary best does not change.',
    steps: [
      'Best case: 1 comparison for every $n$, a flat horizontal line at height 1.',
      'Worst case: $\\lfloor \\lg n \\rfloor + 1$, about $\\log_2 n$. It climbs at first, then flattens: going from 32 to 64 adds only one.',
      'Average: about $\\log_2 n$ too, just under the worst-case curve.',
      'Linear search: worst $n$ and average about $n/2$, straight lines through the origin.',
      { text: 'A few values:', table: { head: ['$n$', '8', '64', '1024'], rows: [['linear worst', '8', '64', '1024'], ['binary worst', '4', '7', '11'], ['binary best', '1', '1', '1']] } },
    ],
    graph: {
      caption: 'Linear search’s lines keep rising at a constant slope. Binary search’s worst case bends over and stays near the bottom; its best case is flat.',
      x: [1, 64], y: [0, 66], xLabel: 'n', yLabel: 'comparisons',
      curves: [
        { label: 'linear worst: $n$', f: n => n, tone: 'a' },
        { label: 'linear average: $n/2$', f: n => n / 2, tone: 'd' },
        { label: 'binary worst: $\\lfloor \\lg n \\rfloor + 1$', f: worstIters, tone: 'b' },
        { label: 'binary best: 1', f: () => 1, tone: 'c' },
      ],
    },
    answer: "Logarithmic curves that rise slowly and flatten out, far below linear search’s straight lines.",
    mistake: 'Drawing binary search’s worst case as a straight line with a smaller slope. A log curve bends: its slope keeps shrinking as $n$ grows.',
    tryIt: { q: 'At $n = 512$, give linear worst, binary worst and binary best.', a: '512; $\\lfloor \\lg 512 \\rfloor + 1 = 9 + 1 = 10$; 1.' },
  };

  H['c310-ws-why-not-linear'] = {
    asks: "Explain why binary search’s comparison count grows like $\\log_2 n$ rather than $n$.",
    idea: 'A comparison in linear search removes one element. A comparison in binary search removes half of what is left. So doubling the array costs linear search $n$ more comparisons, but costs binary search just one: its first comparison cuts the array back to the old size.',
    steps: [
      'Linear: $T(n) = n$, so doubling the input gives $T(2n) = 2n$, twice the work. That is a straight line.',
      'Binary: one comparison turns an array of $2n$ into an interval of about $n$. So $T(2n) = T(n) + 1$.',
      'Start at $T(1) = 1$ and keep doubling: $T(2) = 2$, $T(4) = 3$, $T(8) = 4$, ..., $T(2^k) = k + 1$.',
      'If $n = 2^k$ then $k = \\log_2 n$, so $T(n) = \\log_2 n + 1$: logarithmic, not linear.',
      { text: 'Doubling $n$:', table: { head: ['$n$', 'linear (worst)', 'binary (worst)'], rows: [['1', '1', '1'], ['2', '2', '2'], ['4', '4', '3'], ['8', '8', '4'], ['16', '16', '5'], ['1024', '1024', '11']] } },
    ],
    answer: "Each comparison halves the remaining interval instead of removing one element, so doubling $n$ adds only one comparison.",
    mistake: 'Saying "because it is faster": something faster can still be linear, for example $n/2$. The shape comes from halving: doubling $n$ adds a constant, not a multiple.',
    tryIt: { q: '$n$ grows from 1000 to 8000 (8 times). How do the two worst cases change?', a: 'Linear: 1000 → 8000 (8 times). Binary: 8 times is three doublings, so 10 → 13 (+3). Check: $\\lfloor \\lg 8000 \\rfloor + 1 = 12 + 1 = 13$.' },
  };

  H['c310-ws-prefer-linear'] = {
    asks: "For an unsorted array searched exactly once, explain why linear search beats sorting and then binary searching.",
    idea: 'Binary search is cheap, but its entry ticket, a sorted array, is expensive. Paying $n \\lg n$ for the ticket to save less than $n$ on one search is a bad deal. It pays off only when the ticket is reused for many searches.',
    steps: [
      'Linear search once: at most $n$ comparisons, $\\Theta(n)$.',
      'Sort first: $\\Theta(n \\lg n)$ (merge sort), then binary search adds $\\Theta(\\lg n)$. Total $\\Theta(n \\lg n)$.',
      '$n \\lg n > n$ whenever $\\lg n > 1$, that is $n > 2$. For $n = 1024$: about $1024 \\cdot 10 = 10{,}240$ steps to sort, against 1024 for one linear search.',
      'With $k$ searches: linear costs $kn$, sort-first costs about $n \\lg n + k \\lg n$. Sorting first wins only once $k$ is bigger than about $\\lg n$.',
      'Other cases that favour linear search: very small $n$, or a linked list, where you cannot jump straight to the middle.',
    ],
    graph: {
      caption: 'One search: sort-then-search ($n \\lg n + \\lg n$) is above a single linear search ($n$) for every $n$ past 2, and the gap widens.',
      x: [2, 64], xLabel: 'n', yLabel: 'steps',
      curves: [{ label: 'sort + binary search: $n \\lg n + \\lg n$', f: n => n * lg(n) + lg(n), tone: 'a' }, { label: 'one linear search: $n$', f: n => n, tone: 'b' }],
    },
    answer: "Sorting first costs at least $\\Theta(n \\log n)$, more than one $\\Theta(n)$ linear search; sorting only pays off over many searches.",
    mistake: 'Comparing only the search times ($\\lg n$ against $n$) and forgetting the sort. For a single search, the one-time sort is the dominant cost.',
    tryIt: { q: 'Take $n = 1024$, sorting cost $\\approx n \\lg n$, binary search 11 comparisons, linear search 1024. From how many searches $k$ does sorting first win?', a: 'Need $1024k > 10{,}240 + 11k$, so $1013k > 10{,}240$ and $k > 10.1$: from 11 searches on.' },
  };

  H['c310-ws-dynamic'] = {
    asks: "Say which search method is easier on data with frequent insertions and deletions.",
    idea: 'Linear search does not care about order, so a new element can go anywhere, such as the end. Binary search works only while the array stays sorted, and keeping an array sorted means sliding elements over to open or close a gap.',
    steps: [
      'Linear search: insert by appending at the end and delete by moving the last element into the hole, both $\\Theta(1)$. Searching still works.',
      'Binary search: a new element must go in its sorted position, and everything after that position shifts right by one.',
      { text: 'Insert 10 into the sorted [2, 5, 8, 13, 17, 21]:', table: { head: ['step', 'array'], rows: [['start', '2, 5, 8, 13, 17, 21'], ['shift 21, 17, 13 one place right', '2, 5, 8, _, 13, 17, 21'], ['write 10 into the gap', '2, 5, 8, 10, 13, 17, 21']] } },
      'That moved 3 elements. Inserting a value smaller than everything moves all $n$: $\\Theta(n)$ per update, far more than the $\\Theta(\\lg n)$ search.',
      'Deleting is the same in reverse: everything after the hole shifts left by one.',
    ],
    answer: "Linear search: it works on data in any order. Binary search needs the array kept sorted, at $\\Theta(n)$ shifting per update.",
    mistake: 'Answering "binary search, because it is faster". Its search is faster, but every update costs $\\Theta(n)$ to keep the order; when updates are frequent, that cost dominates.',
    tryIt: { q: 'Delete 5 from the sorted [2, 5, 8, 13, 17, 21] and keep it sorted. How many elements move?', a: '8, 13, 17 and 21 each shift one place left: 4 moves, giving [2, 8, 13, 17, 21].' },
  };

  H['c310-ws-rec-code'] = {
    asks: "Give the base case of RecursiveBinarySearch(A, low, high, key) and what it returns.",
    idea: 'Same idea as the loop, but instead of moving low or high, the function calls itself on the smaller interval. An empty interval (low > high) is the base case.',
    steps: [
      'Base case: if low > high the interval is empty: return −1.',
      'mid = (low + high) // 2 (integer division, so a floor). If A[mid] = key, return mid.',
      'If key < A[mid], search the left part: return RBS(A, low, mid − 1, key). Otherwise search the right part: return RBS(A, mid + 1, high, key).',
      'The first call covers the whole array: RBS(A, 0, n − 1, key). This version is 0-based, unlike the iterative worksheet code.',
      { text: 'Trace on A = [6, 11, 14, 20, 25, 31] with key 12:', table: { head: ['call', 'low', 'high', 'mid', 'A[mid]', 'next'], rows: [['1', '0', '5', '2', '14', '12 < 14: RBS(A, 0, 1)'], ['2', '0', '1', '0', '6', '12 > 6: RBS(A, 1, 1)'], ['3', '1', '1', '1', '11', '12 > 11: RBS(A, 2, 1)'], ['4', '2', '1', '—', '—', 'low > high: return −1']] } },
    ],
    answer: "If low > high, the interval is empty: return $-1$ (key not found).",
    mistake: 'Leaving out "return" before the recursive calls. The inner call finds the index, but without return the outer call throws it away.',
    tryIt: { q: 'Trace RBS(A, 0, 5, 25) on A = [6, 11, 14, 20, 25, 31].', a: 'mid = 2: 25 > 14, call RBS(A, 3, 5). mid = 4: A[4] = 25: return 4, which the first call passes back up.' },
  };

  H['c310-ws-rec-why-log'] = {
    asks: 'Explain why recursive binary search is $\\Theta(\\log n)$ in the worst case and not $\\Theta(n)$, and write its recurrence.',
    idea: 'Each call does a few constant-time steps and then makes ONE call on half the interval. So its recursion tree is a single path, and halving $n$ reaches 1 after $\\lg n$ steps.',
    steps: [
      'Work in one call, not counting the recursion: test low > high, compute mid, compare A[mid] with the key. A constant, $c$.',
      'At most one of the two recursive calls runs (if / else), on at most half the interval: $T(n) = T(n/2) + c$, with $T(1) = c$.',
      'Unroll: $T(n) = c + T(n/2) = 2c + T(n/4) = \\dots = kc + T(n/2^k)$.',
      'Stop when $n/2^k = 1$, that is $k = \\lg n$: $T(n) = c \\lg n + c = \\Theta(\\lg n)$.',
      'Compare FindMax by halves: TWO calls, $T(n) = 2T(n/2) + c$, so its tree doubles every level and makes about $2n$ calls: $\\Theta(n)$. One call against two is the whole difference.',
    ],
    tree: {
      sumsLabel: 'cost',
      levels: [
        { nodes: ['$n$'], sum: '$c$' },
        { nodes: ['$n/2$'], sum: '$c$' },
        { nodes: ['$n/4$'], sum: '$c$' },
        { gap: true },
        { nodes: ['$1$'], sum: '$c$' },
      ],
      caption: 'Nodes show the interval size. One call per level, each costing $c$, and $\\lg n + 1$ levels: total $c(\\lg n + 1)$.',
    },
    answer: 'Each call does constant work and makes only ONE recursive call, on half the interval: $T(n) = T(n/2) + \\Theta(1)$. The recursion is about $\\log_2 n$ deep, so $T(n) = \\Theta(\\log n)$.',
    mistake: 'Writing $T(n) = 2T(n/2) + c$ because the code contains two recursive calls. They are in different branches of an if / else; only one runs.',
    tryIt: { q: 'Unroll $T(n) = T(n/2) + 3$ with $T(1) = 3$ for $n = 32$.', a: '$T(32) = 3 + T(16) = 6 + T(8) = 9 + T(4) = 12 + T(2) = 15 + T(1) = 18$, which is $3(\\lg 32 + 1) = 3 \\cdot 6$.' },
  };

  H['c310-ws-rec-time'] = {
    asks: "Say what extra time recursion adds to binary search, given both versions are $\\Theta(\\log n)$.",
    idea: 'Big-Θ hides constant factors. Both versions halve the same number of times, but each recursive halving also pays for a function call: a new stack frame, four arguments copied in, a return. That makes the constant per step bigger; it does not change the growth rate.',
    steps: [
      'Iterative: each halving is one loop iteration, a few comparisons and an assignment. Call its cost $a$.',
      'Recursive: each halving is one call: the same comparisons plus call overhead $b$ (push a frame, pass A, low, high, key, return). Cost $a + b$.',
      'Both make about $\\lg n$ steps: $T_{iter} \\approx a \\lg n$ and $T_{rec} \\approx (a + b) \\lg n$.',
      'The ratio $\\frac{a + b}{a}$ is a constant, so both are $\\Theta(\\lg n)$, but the recursive one is slower by that constant factor.',
      'This is the RAM-model point from Lecture 2: a function call is not one constant-time instruction like the others.',
    ],
    answer: "A constant per call (stack frame, arguments, return); the asymptotic bound is unchanged.",
    mistake: 'Answering "no, both are $\\log n$". Equal Θ means the same growth rate, not the same running time.',
    tryIt: { q: 'A loop iteration costs 4 units; a recursive call costs $4 + 6 = 10$. Compare the totals for 20 halvings and for 40.', a: '20: 80 against 200. 40: 160 against 400. Both double when the steps double, and the recursive one is always 2.5 times slower: same Θ, different constant.' },
  };

  H['c310-ws-rec-space'] = {
    asks: "Give the extra space used by recursive binary search.",
    idea: 'A recursive call cannot finish until the call it made finishes, so every call along the path waits on the stack at the same time. The path is about $\\lg n$ long, so that is about $\\lg n$ stack frames. The loop reuses the same three variables.',
    steps: [
      'Iterative: low, high and mid, the same number for any $n$: $\\Theta(1)$ extra space.',
      'Recursive: each call has a frame (A, low, high, key, mid, return address), constant size. Calls nest until the base case, one frame per level.',
      'Depth: at most $\\lfloor \\lg n \\rfloor + 1$ calls that check an element, plus one base-case call for an absent key. Space $\\Theta(\\lg n)$.',
      { text: 'Deepest stack for an absent key:', table: { head: ['$n$', 'frames'], rows: [['1,000', '11'], ['1,000,000', '21'], ['1,000,000,000', '31']] } },
      'So the extra memory stays small, but it is more than the loop needs, and in languages without tail-call optimization (Java, Python) deep recursion risks a stack overflow.',
    ],
    answer: "$\\Theta(\\log n)$ for the call stack, one frame per level (the iterative version needs $\\Theta(1)$).",
    mistake: 'Calling the recursive version $\\Theta(n)$ space because it "copies the array". Only a reference to A is passed; each frame has constant size.',
    tryIt: { q: 'At most how many frames are on the stack for an absent key with $n = 1024$?', a: '$\\lfloor \\lg 1024 \\rfloor + 1 = 11$ calls that check an element, plus one base-case call: 12. The iterative version still needs $\\Theta(1)$.' },
  };

  // ═══════════════════════ Lecture 7: Quicksort ═══════════════════════

  H['c310-7-memory-mc'] = {
    asks: 'Pick the course’s description of how much extra memory quicksort uses.',
    idea: 'PARTITION rearranges elements by swapping pairs inside A itself. It never copies the subarray anywhere else, unlike merge sort, which merges into a second array.',
    steps: [
      'PARTITION uses three variables (pivot, smallerCounter, j), and every move is a Swap of two slots inside A[start..end].',
      'QUICKSORT then recurses on two pieces of the same array, A[start..pivotLoc−1] and A[pivotLoc+1..end]. No new array is created.',
      { text: 'Compare:', table: { head: ['algorithm', 'extra storage', 'why'], rows: [['quicksort', 'a few variables per call', 'swaps inside A'], ['merge sort', '$O(n)$ array', 'merging needs somewhere to write'], ['counting sort', '$O(n + k)$', 'count array of size $k$ plus output array']] } },
      '"In place" means the data is never copied. The recursion stack still exists (one frame per active call), but it is not an auxiliary array.',
    ],
    answer: 'It sorts in place: PARTITION only swaps elements inside A[p..r].',
    mistake: 'Picking $O(n)$ because quicksort is "like merge sort". Both are divide and conquer, but only merge sort needs a buffer to merge into.',
    tryIt: { q: 'Sorting 1,000,000 integers: which of quicksort and merge sort needs a second array of 1,000,000 slots?', a: 'Merge sort, for its auxiliary array. Quicksort only swaps within the original array.' },
  };

  H['c310-7-no-combine'] = {
    asks: 'Explain why quicksort has no combine step after its two recursive calls, while merge sort needs one.',
    idea: 'Quicksort separates by VALUE before recursing: after PARTITION every small element is already left of every big one. Sorting each side then leaves nothing to fix. Merge sort splits by POSITION (first half, second half), so values from both halves still have to be interleaved.',
    steps: [
      'After PARTITION: A[start..q−1] $\\le$ A[q] < A[q+1..end], and A[q] is in its final place.',
      'The left part holds exactly the values that belong in positions start..q−1, so sorting it in place puts them there. The same holds for the right part.',
      { text: 'Example {7, 3, 9, 1, 6}:', table: { head: ['stage', 'array'], rows: [['after PARTITION (pivot 6)', '3, 1, 6, 7, 9'], ['sort left part {3, 1}', '1, 3, 6, 7, 9'], ['sort right part {7, 9}', '1, 3, 6, 7, 9 (already in order)']] } },
      'Merge sort on the same array splits it into {7, 3, 9} and {1, 6}. Sorted halves {3, 7, 9} and {1, 6} still need merging, because 1 has to jump ahead of 3, 7 and 9.',
      'So quicksort does its work in the divide step; merge sort does it in the combine step.',
    ],
    answer: 'After PARTITION every element left of the pivot is $\\le$ it and every element right of it is $>$ it, and the pivot is in its final position. Once both parts are sorted in place, the whole array is sorted. Merge sort splits by position, not value, so its sorted halves must still be merged.',
    mistake: 'Saying quicksort "merges the parts with the pivot". Nothing is merged: the parts are neighbouring pieces of one array, already in the right order relative to each other.',
    tryIt: { q: 'After a PARTITION, A = {2, 1, 4, 8, 5, 9} with the pivot 4 at index 3. Finish the sort without merging.', a: 'Sort {2, 1} → {1, 2} and {8, 5, 9} → {5, 8, 9} in place: {1, 2, 4, 5, 8, 9}. Each part already holds exactly the values for its positions.' },
  };

  H['c310-7-initial-call'] = {
    asks: 'Give the first call that makes the course’s QUICKSORT sort an entire array A.',
    idea: 'QUICKSORT(A, start, end) sorts the piece A[start..end], both ends included. To sort everything, that piece must be the whole array, from the first index to the last.',
    steps: [
      'The course’s arrays are 1-indexed: the first element is A[1].',
      'end is inclusive (PARTITION uses A[end] as the pivot), so the last index is A.length itself.',
      'So the call is QUICKSORT(A, 1, A.length); for an array of $n$ elements, QUICKSORT(A, 1, n).',
      'Every other call is made by QUICKSORT itself on smaller pieces: QUICKSORT(A, start, pivotLoc − 1) and QUICKSORT(A, pivotLoc + 1, end).',
    ],
    answer: 'QUICKSORT(A, 1, A.length).',
    mistake: 'Writing QUICKSORT(A, 0, n − 1). That is the 0-based convention of languages like Java or C; the course pseudocode is 1-based.',
    tryIt: { q: 'Give the call that sorts only A[3..7] of a 10-element array, and the call that sorts all 10.', a: 'QUICKSORT(A, 3, 7); QUICKSORT(A, 1, 10).' },
  };

  H['c310-7-i-start'] = {
    asks: 'Give the starting value of smallerCounter in PARTITION(A, start, end), and explain it.',
    idea: 'smallerCounter points at the LAST slot of the "$\\le$ pivot" zone, which grows from the left edge. Before anything has been examined the zone is empty, so its last slot is one to the left of start.',
    steps: [
      'Invariant: A[start..smallerCounter] holds the elements found so far that are $\\le$ pivot.',
      'At the start nothing has been found, so A[start..smallerCounter] must be empty. A range A[p..q] is empty when q = p − 1, so smallerCounter = start − 1.',
      'When the first small element turns up, smallerCounter += 1 makes it equal to start, and the swap puts that element at A[start]: the zone now has one element.',
      'Not 0: for a right-hand piece such as PARTITION(A, 6, 10) the zone begins at index 6, so smallerCounter must start at 5.',
      'If no element is $\\le$ pivot, smallerCounter stays at start − 1 and PARTITION returns start: the pivot moves to the front of the piece.',
    ],
    answer: 'start − 1: the "$\\le$ pivot" zone A[start..smallerCounter] starts out empty, so its end is one before start.',
    mistake: 'Starting it at 0, or at start. 0 works only for a piece that starts at index 1; start would claim one small element before any has been found.',
    tryIt: { q: 'PARTITION(A, 4, 9): what does smallerCounter start at, and what does PARTITION return if no element is $\\le$ the pivot?', a: 'It starts at 3. It never moves, so the final swap is A[4] with A[9] and PARTITION returns 4 (= start).' },
  };

  H['c310-7-return'] = {
    asks: "Say what expression PARTITION returns.",
    idea: 'After the loop, smallerCounter is the last slot of the small zone. The next slot, smallerCounter + 1, is where the final swap drops the pivot. That slot is the pivot’s true sorted position, because exactly the right number of elements sit to its left.',
    steps: [
      'After the loop: A[start..smallerCounter] $\\le$ pivot and A[smallerCounter+1..end−1] > pivot.',
      'The final swap puts the pivot at smallerCounter + 1, and PARTITION returns that index.',
      'It is final: everything smaller or equal is on its left and everything larger on its right, so in the sorted array it would sit exactly there.',
      { text: 'Example {5, 2, 8, 1, 4} (pivot 4):', table: { head: PHEAD, rows: [['1', '5', 'no', '0', '5, 2, 8, 1, 4'], ['2', '2', 'yes', '1', '2, 5, 8, 1, 4'], ['3', '8', 'no', '1', '2, 5, 8, 1, 4'], ['4', '1', 'yes', '2', '2, 1, 8, 5, 4']] } },
      'smallerCounter = 2; the final swap A[3] ↔ A[5] gives {2, 1, 4, 5, 8}, and PARTITION returns 3. QUICKSORT then sorts A[1..2] and A[4..5].',
    ],
    answer: "smallerCounter + 1: the index where the pivot ends up, its final position in the sorted array.",
    mistake: 'Returning the pivot’s value (4) instead of its index (3). QUICKSORT needs an index to split the recursion.',
    tryIt: { q: 'PARTITION on {9, 4, 7, 2, 6}: what does it return, and what are the two recursive calls?', a: 'Pivot 6; 4 and 2 are small, so smallerCounter = 2 and the result is {4, 2, 6, 9, 7}. Returns 3; the calls are QUICKSORT(A, 1, 2) and QUICKSORT(A, 4, 5).' },
  };

  H['c310-7-final-swap'] = {
    asks: "Just before PARTITION’s last line, Swap(A[smallerCounter + 1], A[end]), say which element sits at A[smallerCounter + 1].",
    idea: 'During the loop the pivot waits at the far right while the rest arranges itself as [small | big | pivot]. The pivot belongs between small and big. Swapping it with the FIRST big element puts it there, and that big element simply moves to the end of the big zone, where it still belongs.',
    steps: [
      'After the loop, with i = smallerCounter: A[start..i] $\\le$ pivot, A[i+1..end−1] > pivot, A[end] = pivot.',
      'The pivot’s correct slot is right after the small zone: index i + 1.',
      'A[i+1] is the first big element. After the swap it sits at A[end], the right edge of the big zone: still > pivot, still on the correct side.',
      'If the big zone is empty, i + 1 = end and the pivot swaps with itself: nothing moves.',
      { text: 'Example {3, 9, 1, 5}: after the loop A = {3, 1, 9, 5} and i = 2.', table: { head: ['', 'A[1]', 'A[2]', 'A[3]', 'A[4]'], rows: [['before the final swap', '3', '1', '9', '5'], ['after Swap(A[3], A[4])', '3', '1', '5', '9']] } },
    ],
    answer: "The first element of the \"> pivot\" region (or the pivot itself if that region is empty). Swapping it with A[end] puts the pivot between the two regions, at its final position.",
    mistake: 'Swapping the pivot with A[smallerCounter], the last small element. That puts a small element at the far end, on the big side.',
    tryIt: { q: 'After the loop of some PARTITION, A = {2, 4, 1, 8, 9, 6, 5} and smallerCounter = 3. Do the final swap and give the return value.', a: 'Swap A[4] = 8 with A[7] = 5: {2, 4, 1, 5, 9, 6, 8}. Return 4.' },
  };

  H['c310-7-regions-order'] = {
    asks: 'Name the four regions of A[p..r] during PARTITION, in order from left to right.',
    idea: 'Picture j as a scanner moving right. Behind it, everything is sorted into two piles, small on the left and big on the right; ahead of it is unread data, and the pivot waits at the far end.',
    steps: [
      'A[p..i]: examined and $\\le$ pivot (i is smallerCounter).',
      'A[i+1..j−1]: examined and > pivot.',
      'A[j..r−1]: not examined yet, so anything could be there.',
      'A[r]: the pivot x itself.',
      { text: 'Snapshot of PARTITION on {5, 9, 2, 7, 1, 8, 4, 6} just before j = 6 (A = {5, 2, 1, 7, 9, 8, 4, 6}, i = 3):', table: { head: ['region', 'indices', 'values'], rows: [['$\\le$ pivot', '1..3', '5, 2, 1'], ['> pivot', '4..5', '7, 9'], ['not examined', '6..7', '8, 4'], ['pivot', '8', '6']] } },
    ],
    answer: 'A[p..i]: elements $\\le$ pivot; A[i+1..j−1]: elements > pivot; A[j..r−1]: not yet examined; A[r]: the pivot x.',
    mistake: 'Putting the unexamined region before the > region. Both examined regions are behind j; the unknown part is always ahead of j.',
    tryIt: { q: 'p = 1, r = 9, i = 2, j = 6. Give the index range of each region.', a: '$\\le$ pivot: 1..2. > pivot: 3..5. Not examined: 6..8. Pivot: 9.' },
  };

  H['c310-7-region-gt'] = {
    asks: 'Using i and j, give the index range of the elements already examined that are greater than the pivot.',
    idea: 'Two boundaries are known exactly: the small zone ends at i, and the unread zone starts at j. The big elements fill the gap between them.',
    steps: [
      'A[p..i] is the $\\le$ region, so the next region starts at i + 1.',
      'A[j..r−1] has not been examined, so the examined part ends at j − 1.',
      'So the > region is A[i+1..j−1]. It holds $(j - 1) - (i + 1) + 1 = j - i - 1$ elements.',
      'It can be empty: if every element so far was small, i = j − 1 and the range A[j..j−1] is empty.',
      'Slide array {2, 8, 7, 1, 3, 5, 6, 4} at the start of j = 4: i = 1, so the > region is A[2..3] = 8, 7.',
    ],
    answer: 'A[i+1..j−1].',
    mistake: 'Writing A[i..j]. A[i] is the last small element and A[j] is the element about to be examined; neither is in the > region.',
    tryIt: { q: 'p = 1, i = 3, j = 7. Which indices form the > region, and how many elements is that?', a: 'A[4..6]: $7 - 3 - 1 = 3$ elements.' },
  };

  H['c310-7-trace-slide-q'] = {
    asks: 'Run PARTITION(A, 1, 8) on A = {2, 8, 7, 1, 3, 5, 6, 4} and give the index it returns.',
    idea: 'For the return value you do not need the whole trace: the pivot lands just after all the elements that are $\\le$ it. Count them and add one (when start = 1). The trace confirms it.',
    steps: [
      'pivot = A[8] = 4. Among A[1..7], the elements $\\le 4$ are 2, 1 and 3: three of them.',
      'smallerCounter starts at 0 and goes up once per small element, so it ends at 3.',
      { text: 'Trace:', table: { head: PHEAD, rows: [['1', '2', 'yes', '1', '2, 8, 7, 1, 3, 5, 6, 4'], ['2', '8', 'no', '1', '2, 8, 7, 1, 3, 5, 6, 4'], ['3', '7', 'no', '1', '2, 8, 7, 1, 3, 5, 6, 4'], ['4', '1', 'yes', '2', '2, 1, 7, 8, 3, 5, 6, 4'], ['5', '3', 'yes', '3', '2, 1, 3, 8, 7, 5, 6, 4'], ['6', '5', 'no', '3', '2, 1, 3, 8, 7, 5, 6, 4'], ['7', '6', 'no', '3', '2, 1, 3, 8, 7, 5, 6, 4']] } },
      'Return smallerCounter + 1 = 4. The final array is {2, 1, 3, 4, 7, 5, 6, 8}, with the pivot at index 4.',
    ],
    answer: '4: three elements (2, 1, 3) are $\\le 4$, so the pivot lands at $3 + 1$.',
    mistake: 'Returning 8, the pivot’s starting index. (Here the pivot’s value is also 4, but that is a coincidence; PARTITION returns an index.)',
    tryIt: { q: 'PARTITION(A, 1, 7) on {8, 3, 6, 1, 9, 2, 5}: which index is returned?', a: 'Pivot 5; the elements $\\le 5$ are 3, 1, 2 (three), so it returns 4. Result {3, 1, 2, 5, 9, 6, 8}.' },
  };

  H['c310-7-trace-mid'] = {
    asks: 'Trace PARTITION on {2, 8, 7, 1, 3, 5, 6, 4} only until the end of the loop iteration with j = 4, and give A at that moment.',
    idea: 'Stop exactly where asked. After iteration j = 4, iterations 5 to 7 have not happened and the final pivot swap has not happened either: the 4 is still at the end.',
    steps: [
      'pivot = A[8] = 4, smallerCounter = 0.',
      { text: 'Iterations 1 to 4:', table: { head: PHEAD, rows: [['1', '2', 'yes', '1', '2, 8, 7, 1, 3, 5, 6, 4'], ['2', '8', 'no', '1', '2, 8, 7, 1, 3, 5, 6, 4'], ['3', '7', 'no', '1', '2, 8, 7, 1, 3, 5, 6, 4'], ['4', '1', 'yes', '2', '2, 1, 7, 8, 3, 5, 6, 4']] } },
      'j = 1: 2 $\\le$ 4, smallerCounter = 1, A[1] swaps with itself. j = 2 and 3: 8 and 7 are > 4, nothing happens.',
      'j = 4: 1 $\\le$ 4, smallerCounter = 2, so A[2] = 8 and A[4] = 1 swap: {2, 1, 7, 8, 3, 5, 6, 4}.',
    ],
    answer: '2, 1, 7, 8, 3, 5, 6, 4.',
    mistake: 'Giving the final array {2, 1, 3, 4, 7, 5, 6, 8}. The question stops in the middle of the loop, while the pivot 4 is still at A[8].',
    tryIt: { q: 'PARTITION on {6, 2, 9, 4, 7, 3, 5}: give A right after the iteration with j = 4.', a: 'Pivot 5. j = 1: 6, no. j = 2: 2, yes, smallerCounter = 1, swap A[1] and A[2] → {2, 6, 9, 4, 7, 3, 5}. j = 3: 9, no. j = 4: 4, yes, smallerCounter = 2, swap A[2] and A[4] → {2, 4, 9, 6, 7, 3, 5}.' },
  };

  H['c310-7-trace-why'] = {
    asks: "In the slide trace, at j = 4 the 1 swaps with the 8 at A[2]. Explain why the 8 and not some other element.",
    idea: 'The swap always goes to A[smallerCounter] right after the increment: the slot just past the small zone. That slot always holds the leftmost element of the big zone, whatever its value.',
    steps: [
      'Before j = 4: A = {2, 8, 7, 1, ...} and smallerCounter = 1. Small zone A[1..1] = {2}; big zone A[2..3] = {8, 7}.',
      'A[4] = 1 $\\le$ 4, so smallerCounter becomes 2. A[2] is the first slot of the big zone, and it holds 8.',
      'Swap A[2] and A[4]: {2, 1, 7, 8, ...}. The small zone grows to A[1..2] = {2, 1}; the big zone becomes A[3..4] = {7, 8}.',
      'The big zone lost nothing: 8 moved from its left end to its right end. Both zones stay contiguous.',
    ],
    answer: "Because $1 \\le 4$, smallerCounter advances from 1 to 2, and A[2] = 8 is the first element of the \"> pivot\" region.",
    mistake: 'Thinking the 1 swaps with "the largest element" or "the element before it". The target is chosen by position (A[smallerCounter]), never by value.',
    tryIt: { q: 'PARTITION on {5, 9, 7, 2, 6}: at j = 4 (the 2), which element does the 2 swap with, and why?', a: 'smallerCounter goes from 1 to 2, and A[2] = 9 is the first element of the big zone {9, 7}. Result {5, 2, 7, 9, 6}.' },
  };

  H['c310-7-prac-3'] = {
    asks: 'Run the course’s PARTITION on {3, 8, 2, 5, 1, 4, 7, 6} and give the array afterwards.',
    idea: 'Most elements here are small (5 of the 7), so the small zone grows almost every step, and the 8 is pushed one place right each time.',
    steps: [
      'pivot = A[8] = 6, smallerCounter = 0, j = 1 to 7.',
      { text: 'Trace:', table: { head: PHEAD, rows: [['1', '3', 'yes', '1', '3, 8, 2, 5, 1, 4, 7, 6'], ['2', '8', 'no', '1', '3, 8, 2, 5, 1, 4, 7, 6'], ['3', '2', 'yes', '2', '3, 2, 8, 5, 1, 4, 7, 6'], ['4', '5', 'yes', '3', '3, 2, 5, 8, 1, 4, 7, 6'], ['5', '1', 'yes', '4', '3, 2, 5, 1, 8, 4, 7, 6'], ['6', '4', 'yes', '5', '3, 2, 5, 1, 4, 8, 7, 6'], ['7', '7', 'no', '5', '3, 2, 5, 1, 4, 8, 7, 6']] } },
      'From j = 3 to j = 6 each small element swaps with the 8, which moves right: index 2 → 3 → 4 → 5 → 6.',
      'Final swap A[6] = 8 with A[8] = 6: {3, 2, 5, 1, 4, 6, 7, 8}. PARTITION returns 6.',
    ],
    answer: '3, 2, 5, 1, 4, 6, 7, 8 (pivot 6 at index 6).',
    mistake: 'Moving the 7 at j = 7. 7 > 6, so it stays; only the final swap touches A[8].',
    tryIt: { q: 'Run PARTITION on {4, 7, 1, 9, 3, 8, 2, 5}.', a: 'Pivot 5. 4 (self-swap), then 1 ↔ 7, 3 ↔ 7, 2 ↔ 9 → {4, 1, 3, 2, 7, 8, 9, 5}. Final swap A[5] ↔ A[8]: {4, 1, 3, 2, 5, 8, 9, 7}, return 5.' },
  };

  H['c310-7-prac-q'] = {
    asks: 'PARTITION(A, 1, 7) on A = {9, 6, 3, 8, 1, 7, 4}: which index does it return?',
    idea: 'With start = 1, the return value is (number of elements $\\le$ pivot) + 1. Here the pivot is small, few elements are $\\le$ it, so it lands near the front.',
    steps: [
      'pivot = A[7] = 4. Among 9, 6, 3, 8, 1, 7, only 3 and 1 are $\\le 4$.',
      { text: 'Trace:', table: { head: PHEAD, rows: [['1', '9', 'no', '0', '9, 6, 3, 8, 1, 7, 4'], ['2', '6', 'no', '0', '9, 6, 3, 8, 1, 7, 4'], ['3', '3', 'yes', '1', '3, 6, 9, 8, 1, 7, 4'], ['4', '8', 'no', '1', '3, 6, 9, 8, 1, 7, 4'], ['5', '1', 'yes', '2', '3, 1, 9, 8, 6, 7, 4'], ['6', '7', 'no', '2', '3, 1, 9, 8, 6, 7, 4']] } },
      'smallerCounter ends at 2. Final swap A[3] = 9 with A[7] = 4: {3, 1, 4, 8, 6, 7, 9}.',
      'Return smallerCounter + 1 = 3.',
    ],
    answer: '3.',
    mistake: 'Counting the pivot as one of the "$\\le$" elements and returning 4. The loop stops at end − 1, so the pivot is never compared with itself.',
    tryIt: { q: 'PARTITION(A, 1, 8) on {1, 9, 8, 2, 7, 3, 6, 5}: return value?', a: 'Pivot 5; the elements $\\le 5$ are 1, 2, 3, so smallerCounter = 3 and it returns 4. Result {1, 2, 3, 5, 7, 8, 6, 9}.' },
  };

  H['c310-7-example-first'] = {
    asks: 'Quicksort on {10, 80, 35, 85, 40, 55, 70}: give the array right after the FIRST call to PARTITION.',
    idea: 'The first PARTITION runs on the whole array with pivot 70. Quicksort recurses only after it returns, so the answer is one partition pass and nothing more.',
    steps: [
      'pivot = A[7] = 70, smallerCounter = 0.',
      { text: 'Trace:', table: { head: PHEAD, rows: [['1', '10', 'yes', '1', '10, 80, 35, 85, 40, 55, 70'], ['2', '80', 'no', '1', '10, 80, 35, 85, 40, 55, 70'], ['3', '35', 'yes', '2', '10, 35, 80, 85, 40, 55, 70'], ['4', '85', 'no', '2', '10, 35, 80, 85, 40, 55, 70'], ['5', '40', 'yes', '3', '10, 35, 40, 85, 80, 55, 70'], ['6', '55', 'yes', '4', '10, 35, 40, 55, 80, 85, 70']] } },
      'smallerCounter ends at 4, so the final swap exchanges A[5] = 80 with A[7] = 70: {10, 35, 40, 55, 70, 85, 80}. PARTITION returns 5.',
      'The recursion continues on A[1..4] = {10, 35, 40, 55} and A[6..7] = {85, 80}, as in the tree below.',
    ],
    tree: {
      sumsLabel: 'comparisons',
      levels: [
        { nodes: ['10 80 35 85 40 55 70'], sum: '6' },
        { nodes: ['10 35 40 55', '85 80'], sum: '3 + 1' },
        { nodes: ['10 35 40', '{ }', '{ }', '85'], sum: '2' },
        { nodes: ['10 35', '{ }'], sum: '1' },
        { nodes: ['10', '{ }'], sum: '0' },
      ],
      caption: 'The slide’s recursion tree. Each row lists the pieces at that depth (before they are partitioned); a piece of $k$ elements costs $k - 1$ comparisons. Total $6 + 4 + 2 + 1 = 13$.',
    },
    answer: '10, 35, 40, 55, 70, 85, 80.',
    mistake: 'Writing the fully sorted array. The question asks only for the state after the first PARTITION, when 85 and 80 are still out of order.',
    tryIt: { q: 'Quicksort on {20, 60, 15, 45, 30, 50, 40}: the array after the first PARTITION, and the two parts?', a: 'Pivot 40; 20, 15, 30 are $\\le 40$. After the loop {20, 15, 30, 45, 60, 50, 40}; swap A[4] ↔ A[7]: {20, 15, 30, 40, 60, 50, 45}. Parts {20, 15, 30} and {60, 50, 45}.' },
  };

  H['c310-7-partition-cost'] = {
    asks: 'Count the A[j] $\\le$ pivot tests one PARTITION call makes on a subarray of $n$ elements.',
    idea: 'The loop visits every element except the pivot exactly once and makes exactly one test per visit. Nothing else in PARTITION compares elements.',
    steps: [
      'j runs from start to end − 1, and the piece A[start..end] has $n$ = end − start + 1 elements.',
      'Number of j values: (end − 1) − start + 1 = end − start = $n - 1$.',
      'Each iteration makes exactly one test, A[j] $\\le$ pivot, whether or not it swaps. So $n - 1$ comparisons.',
      'Swaps vary (from 0 up to $n - 1$, plus the final one), but each takes constant time, so PARTITION is $\\Theta(n)$ overall.',
      'Check with the slide array (8 elements): j = 1 to 7, 7 tests.',
    ],
    answer: '$n - 1$: one test for each non-pivot element. So partitioning costs $\\Theta(n)$.',
    mistake: 'Answering $n$ by counting the pivot. The loop stops at end − 1; the pivot is never tested against itself.',
    tryIt: { q: 'PARTITION(A, 3, 9): how many comparisons?', a: 'The piece has $9 - 3 + 1 = 7$ elements; j = 3 to 8 gives 6 comparisons.' },
  };

  H['c310-7-worst-recurrence'] = {
    asks: "Write quicksort’s worst-case recurrence (for $n > 1$).",
    idea: 'In the worst case each PARTITION strips off only the pivot: one recursive call gets everything else and the other gets nothing. The problem shrinks by just one per call, while each call still pays linear time.',
    steps: [
      'Base case: a piece of 0 or 1 elements fails start < end and does nothing, so $T(n) = 0$ for $n = 0$ or $1$.',
      'For $n > 1$: PARTITION costs $\\Theta(n)$; write it $cn$. The split is $n - 1$ and $0$: $T(n) = T(n-1) + T(0) + cn = T(n-1) + cn$.',
      'Unroll it: $T(n) = cn + c(n-1) + T(n-2) = \\dots = c\\,(n + (n-1) + \\dots + 2) + T(1)$.',
      'That sum is $\\frac{n(n+1)}{2} - 1$, so $T(n) = c\\left(\\frac{n(n+1)}{2} - 1\\right) = \\Theta(n^2)$.',
      { text: 'Counting comparisons only (a piece of $k$ costs $k - 1$): $T(n) = T(n-1) + (n - 1)$.', table: { head: ['$n$', '2', '3', '4', '5', '6'], rows: [['$T(n)$', '1', '3', '6', '10', '15']] } },
    ],
    answer: "$T(n) = T(n-1) + \\Theta(n)$, with $T(n) = 0$ for $n = 0$ or $1$. It solves to $\\Theta(n^2)$.",
    mistake: 'Writing $T(n) = 2T(n-1) + \\Theta(n)$. There are two calls, but one of them is on 0 elements and costs nothing.',
    tryIt: { q: 'With $T(n) = T(n-1) + (n - 1)$ and $T(1) = 0$, find $T(7)$.', a: '$6 + 5 + 4 + 3 + 2 + 1 = 21 = \\frac{7 \\cdot 6}{2}$.' },
  };

  H['c310-7-worst-sum'] = {
    asks: 'Add up the partition cost on each level of the worst-case recursion tree to get $\\Theta(n^2)$.',
    idea: 'The worst-case tree is a straight path with piece sizes $n, n-1, n-2, \\dots, 2$. Each level costs $c$ times its size, so the total is $c$ times an arithmetic series, which you can add up by pairing terms.',
    steps: [
      'Level costs: $cn, c(n-1), c(n-2), \\dots, 2c$. The size-1 piece at the bottom costs nothing.',
      'Total: $T(n) = c\\,(n + (n-1) + \\dots + 2)$.',
      'Gauss: $1 + 2 + \\dots + n = \\frac{n(n+1)}{2}$. Write the sum forwards and backwards under each other; each of the $n$ columns adds to $n + 1$, and that counts the sum twice.',
      'Our sum is missing the 1: $n + (n-1) + \\dots + 2 = \\frac{n(n+1)}{2} - 1$.',
      'So $T(n) = c\\left(\\frac{n(n+1)}{2} - 1\\right) = \\frac{c}{2}n^2 + \\frac{c}{2}n - c$. The leading term is $n^2$: $\\Theta(n^2)$.',
    ],
    tree: {
      sumsLabel: 'level cost',
      levels: [
        { nodes: ['$n$'], sum: '$cn$' },
        { nodes: ['$n-1$'], sum: '$c(n-1)$' },
        { nodes: ['$n-2$'], sum: '$c(n-2)$' },
        { gap: true },
        { nodes: ['$2$'], sum: '$2c$' },
      ],
      caption: 'Nodes show piece sizes; the empty part of each split is not drawn. The right column is the series $cn + c(n-1) + \\dots + 2c$.',
    },
    graph: {
      caption: 'With $c = 1$ the exact total $\\frac{n(n+1)}{2} - 1$ runs alongside $\\frac{n^2}{2}$: same $n^2$ growth, gap only linear.',
      x: [2, 20], xLabel: 'n', yLabel: 'cost',
      curves: [{ label: '$\\frac{n(n+1)}{2} - 1$', f: n => n * (n + 1) / 2 - 1, tone: 'a' }, { label: '$\\frac{n^2}{2}$', f: n => n * n / 2, tone: 'b' }],
    },
    answer: 'Levels cost $cn, c(n-1), c(n-2), \\dots, 2c$, so $T(n) = c(n + (n-1) + \\dots + 2) = c\\left(\\frac{n(n+1)}{2} - 1\\right) = \\Theta(n^2)$.',
    mistake: 'Using "$n$ levels × $cn$ per level" without noticing that the levels shrink. That gives the upper bound $cn^2$, about twice the true sum; the true sum is still $\\Theta(n^2)$.',
    tryIt: { q: 'With $c = 1$, total the level costs for $n = 10$.', a: '$10 + 9 + \\dots + 2 = \\frac{10 \\cdot 11}{2} - 1 = 54$.' },
  };

  H['c310-7-reverse-comps'] = {
    asks: 'Count the comparisons the course’s quicksort makes on the reverse-sorted array {5, 4, 3, 2, 1}.',
    idea: 'Reverse order sounds like the opposite of sorted, but now the last element is the minimum, and a minimum pivot is just as lopsided as a maximum: everything goes to one side. The pieces that follow keep ending in an extreme value too.',
    steps: [
      'Each PARTITION on $k$ elements makes $k - 1$ comparisons, so list every call that runs PARTITION.',
      { text: 'Calls with start < end:', table: { head: ['call', 'piece', 'pivot', 'comparisons', 'split (left / right)'], rows: [['QUICKSORT(A, 1, 5)', '5, 4, 3, 2, 1', '1 (min)', '4', '0 / 4'], ['QUICKSORT(A, 2, 5)', '4, 3, 2, 5', '5 (max)', '3', '3 / 0'], ['QUICKSORT(A, 2, 4)', '4, 3, 2', '2 (min)', '2', '0 / 2'], ['QUICKSORT(A, 3, 4)', '3, 4', '4 (max)', '1', '1 / 0']] } },
      'Why it alternates: the first final swap moved the 5 to the end of the right piece, making it that piece’s maximum, and the pattern repeats.',
      'Total $4 + 3 + 2 + 1 = 10 = \\frac{5 \\cdot 4}{2}$: the same as sorted input, $\\Theta(n^2)$.',
    ],
    answer: '10: the pivots are 1, 5, 2, 4, each the minimum or maximum of its piece, so every split leaves one side empty: $4 + 3 + 2 + 1$.',
    mistake: 'Expecting reverse-sorted input to be a good case because it is the "opposite" of sorted. A minimum pivot is as bad as a maximum one.',
    tryIt: { q: 'How many comparisons on {6, 5, 4, 3, 2, 1}?', a: 'Every split is again lopsided: $5 + 4 + 3 + 2 + 1 = 15$.' },
  };

  H['c310-7-equal-keys'] = {
    asks: "All $n$ elements have the same value. Give the course’s quicksort running time.",
    idea: 'The test is A[j] $\\le$ pivot, with $\\le$. When every element equals the pivot, every test says "yes", so everything goes to the left side, exactly like sorted input.',
    steps: [
      'PARTITION on $k$ equal elements: all $k - 1$ tests are true, so smallerCounter ends at end − 1.',
      'The final swap is A[end] with itself and PARTITION returns end. Split: $k - 1$ on the left, 0 on the right.',
      'That gives the worst-case recurrence $T(n) = T(n-1) + \\Theta(n)$, so $\\Theta(n^2)$.',
      { text: 'Comparisons for 6 equal elements:', table: { head: ['piece size', '6', '5', '4', '3', '2'], rows: [['comparisons', '5', '4', '3', '2', '1']] } },
      'Total $5 + 4 + 3 + 2 + 1 = 15 = \\frac{6 \\cdot 5}{2}$.',
    ],
    answer: "$\\Theta(n^2)$: every test A[j] $\\le$ pivot is true, so each partition splits $n - 1$ and $0$, just like sorted input.",
    mistake: 'Answering $\\Theta(n)$, or "best case, it is already sorted". It is sorted, and sorted is exactly the bad case for this PARTITION.',
    tryIt: { q: 'How many comparisons on {3, 3, 3, 3}?', a: '$3 + 2 + 1 = 6$.' },
  };

  H['c310-7-best-tree'] = {
    asks: 'Use the recursion tree of quicksort’s best case to explain $T(n) = cn \\lg n$.',
    idea: 'Two numbers give a recursion tree’s total: what one level costs, and how many levels there are. In the best case every level partitions the whole array once (cost $cn$), and halving gives $\\lg n$ levels.',
    steps: [
      'Best case: every pivot splits its piece into two halves, so $T(n) = 2T(n/2) + cn$.',
      'Level 0 is one piece of $n$ (cost $cn$), and level 1 is two pieces of $n/2$ (cost $2 \\cdot \\frac{cn}{2} = cn$). Level $d$ has $2^d$ pieces of $\\frac{n}{2^d}$, costing $2^d \\cdot \\frac{cn}{2^d} = cn$.',
      'Pieces reach size 1 when $\\frac{n}{2^d} = 1$, that is $d = \\lg n$. So $\\lg n$ levels do work.',
      'Total = (cost per level) × (number of levels) $= cn \\cdot \\lg n = \\Theta(n \\lg n)$.',
    ],
    tree: {
      sumsLabel: 'level cost',
      levels: [
        { nodes: ['$16c$'], sum: '$16c$' },
        { nodes: ['$8c$', '$8c$'], sum: '$16c$' },
        { nodes: ['$4c$', '$4c$', '$4c$', '$4c$'], sum: '$16c$' },
        { nodes: ['$2c$', '$2c$', '$2c$', '$2c$', '$2c$', '$2c$', '$2c$', '$2c$'], sum: '$16c$' },
      ],
      caption: '$n = 16$: four levels of work ($\\lg 16 = 4$), each adding up to $16c$. Total $16c \\cdot 4 = 64c = cn \\lg n$.',
    },
    answer: 'Every level of the tree partitions about $n$ elements in total, so each level costs $cn$; halving the size each time gives $\\lg n$ levels; total $cn \\cdot \\lg n = \\Theta(n \\lg n)$.',
    mistake: 'Adding only one node per level ($cn + \\frac{cn}{2} + \\frac{cn}{4} + \\dots \\approx 2cn$). Level $d$ has $2^d$ nodes; add all of them.',
    tryIt: { q: 'Best case with $n = 1024$: how many levels, what does each cost, and what is the total?', a: '$\\lg 1024 = 10$ levels, $1024c$ each, total $10{,}240c$.' },
  };

  H['c310-7-balanced-comps'] = {
    asks: 'Count the comparisons the course’s quicksort makes on {1, 3, 2, 6, 5, 7, 4}, and compare with 21 for sorted {1..7}.',
    idea: 'This input is built so that every pivot (the last element of its piece) is the median of that piece. Then every split is perfectly even: the best case.',
    steps: [
      'Top call: pivot 4 is the median of 1..7. PARTITION makes 6 comparisons and gives {1, 3, 2, 4, 5, 7, 6}.',
      { text: 'Every call that runs PARTITION:', table: { head: ['call', 'piece', 'pivot', 'comparisons', 'parts'], rows: [['QUICKSORT(A, 1, 7)', '1, 3, 2, 6, 5, 7, 4', '4', '6', '{1, 3, 2} and {5, 7, 6}'], ['QUICKSORT(A, 1, 3)', '1, 3, 2', '2', '2', '{1} and {3}'], ['QUICKSORT(A, 5, 7)', '5, 7, 6', '6', '2', '{5} and {7}']] } },
      'Pieces of size 1 fail start < end and make no comparisons.',
      'Total $6 + 2 + 2 = 10$, against $6 + 5 + 4 + 3 + 2 + 1 = 21$ for sorted input.',
    ],
    tree: {
      sumsLabel: 'comparisons',
      levels: [
        { nodes: ['1 3 2 6 5 7 4'], sum: '6' },
        { nodes: ['1 3 2', '5 7 6'], sum: '2 + 2' },
        { nodes: ['1', '3', '5', '7'], sum: '0' },
      ],
      caption: 'A perfectly balanced tree: 2 levels of work instead of the 6 a sorted input needs.',
    },
    answer: '10 $= 6 + 2 + 2$: every pivot is the median of its piece, a perfectly balanced best case.',
    mistake: 'Counting the pivot too ($7 + 3 + 3 = 13$) or charging the size-1 pieces. A piece of $k$ costs $k - 1$, and size 1 costs 0.',
    tryIt: { q: 'Count the comparisons on {6, 1, 3, 2, 7, 5, 4}.', a: 'Pivot 4 (median): 6 comparisons, giving {1, 3, 2, 4, 7, 5, 6}. Parts {1, 3, 2} (pivot 2, median) and {7, 5, 6} (pivot 6, median): 2 each. Total 10.' },
  };

  H['c310-7-general-rec'] = {
    asks: "In the course’s general recurrence $T(n) = T(n-k) + T(k) + \\Theta(n)$, say what $k$ is.",
    idea: 'Every quicksort call does three things: partition (linear work), sort the left part, sort the right part. The recurrence is that sentence in symbols, and $k$ records how lopsided the split was.',
    steps: [
      '$\\Theta(n)$: PARTITION, with $n - 1$ comparisons plus swaps.',
      '$T(k)$: the recursive call on the part holding the $k$ elements smaller than the pivot.',
      '$T(n - k)$: the recursive call on the other part. (Strictly that part has $n - k - 1$ elements, because the pivot is in neither; the slide rounds this, which changes no bound.)',
      { text: 'Different $k$ give the cases from the lecture:', table: { head: ['$k$', 'split', 'recurrence', 'result'], rows: [['0', '0 and $n - 1$', '$T(n-1) + \\Theta(n)$', 'worst: $\\Theta(n^2)$'], ['$\\approx n/2$', 'halves', '$2T(n/2) + \\Theta(n)$', 'best: $\\Theta(n \\lg n)$'], ['$n/10$', '1-to-9', '$T(\\tfrac{9n}{10}) + T(\\tfrac{n}{10}) + \\Theta(n)$', '$O(n \\lg n)$']] } },
    ],
    answer: "$k$ is the number of elements smaller than the pivot. ($T(n-k)$, $T(k)$: the two recursive calls; $\\Theta(n)$: partitioning.)",
    mistake: 'Reading $k$ as the pivot’s value. It is a count: how many elements are smaller than the pivot, which also fixes where the pivot lands.',
    tryIt: { q: 'PARTITION on 10 elements (start = 1) returns index 4. What is $k$, and what sizes are the two recursive calls?', a: '3 elements lie left of the pivot, so $k = 3$; the calls are on 3 and $10 - 3 - 1 = 6$ elements: $T(3) + T(6) + \\Theta(10)$.' },
  };

  H['c310-7-9to1-depth'] = {
    asks: 'In the recursion tree of $T(n) = T(9n/10) + T(n/10) + \\Theta(n)$, find the depth of the deepest leaf.',
    idea: 'The deepest leaf is reached by always taking the bigger child, the $\\frac{9}{10}$ side, because that side shrinks slowest. Count how many times you can multiply by $\\frac{9}{10}$ before the size reaches 1.',
    steps: [
      'After $d$ steps down the $\\frac{9}{10}$ side, the piece has size $(\\tfrac{9}{10})^d n$.',
      'It is a leaf when the size is 1: $(\\tfrac{9}{10})^d n = 1$.',
      'Multiply both sides by $(\\tfrac{10}{9})^d$: $n = (\\tfrac{10}{9})^d$.',
      'Take $\\log_{10/9}$ of both sides: $d = \\log_{10/9} n$.',
      'Check with $n = 1000$: $\\log_{10/9} 1000 = \\frac{\\ln 1000}{\\ln(10/9)} \\approx \\frac{6.908}{0.1054} \\approx 65.6$, while the shallowest leaf is at $\\log_{10} 1000 = 3$.',
    ],
    graph: {
      caption: 'Depth of the deepest leaf ($\\log_{10/9} n$) against the shallowest ($\\log_{10} n$) and $\\lg n$. All three are logarithms, so all are constant multiples of $\\lg n$.',
      x: [2, 1000], xLabel: 'n', yLabel: 'depth',
      curves: [
        { label: '$\\log_{10/9} n$ (deepest)', f: n => Math.log(n) / Math.log(10 / 9), tone: 'a' },
        { label: '$\\lg n$', f: n => lg(n), tone: 'c' },
        { label: '$\\log_{10} n$ (shallowest)', f: n => Math.log10(n), tone: 'b' },
      ],
      marks: [{ x: 1000, label: '$n = 1000$' }],
    },
    answer: '$\\log_{10/9} n$.',
    mistake: 'Choosing $\\log_9 n$. The base is the factor the size shrinks by per level, $\\frac{10}{9}$, not 9.',
    tryIt: { q: 'For a 3-to-2 split, $T(n) = T(\\tfrac{3n}{5}) + T(\\tfrac{2n}{5}) + \\Theta(n)$, at what depth is the deepest leaf?', a: '$(\\tfrac35)^d n = 1$, so $n = (\\tfrac53)^d$ and $d = \\log_{5/3} n$.' },
  };

  H['c310-7-adoption'] = {
    asks: "Name the C standard library function the course cites as evidence that quicksort is widely used.",
    idea: 'All three are standard libraries: the code most programmers call instead of writing their own sort. Remember them as "Unix, C, Java".',
    steps: [
      'Unix: quicksort became the default library sort subroutine.',
      'C: the standard library’s sorting function is qsort ("quick sort").',
      'Java: the reference implementation used it.',
      'The same slide gives the reasons libraries chose it: it sorts in place, and its expected running time is $O(n \\lg n)$.',
    ],
    answer: "qsort. (The other two pieces of evidence: Unix’s default library sort, and Java’s reference implementation.)",
    mistake: 'Listing any language or tool that sorts, such as Python or merge sort. The slide names exactly Unix, C’s qsort and Java’s reference implementation.',
    tryIt: { q: 'Which of the three is a function name, and what does it abbreviate?', a: 'qsort, in the C standard library: "quick sort".' },
  };

  // ═══════════════════════ Heaps and heapsort ═══════════════════════

  H['c310-heap-insertion-tradeoff'] = {
    asks: "Say on what kind of input insertion sort performs well.",
    idea: 'Insertion sort slides each new element left until it fits, like sorting cards in your hand. On nearly sorted input each card barely moves; on reverse-sorted input every card travels all the way.',
    steps: [
      'Advantage 1, in place: it shifts elements within the array and needs only one temporary variable.',
      'Advantage 2, nearly sorted input: each element moves only a few places, so the time is close to $n$.',
      'Disadvantage: on reverse-sorted input element $j$ moves $j - 1$ places, for a total of $1 + 2 + \\dots + (n-1) = \\frac{n(n-1)}{2}$, which is $O(n^2)$.',
      { text: 'Shifts for $n = 6$:', table: { head: ['input', 'shifts'], rows: [['1, 2, 3, 4, 5, 6 (sorted)', '0'], ['1, 2, 4, 3, 5, 6 (one pair swapped)', '1'], ['6, 5, 4, 3, 2, 1 (reversed)', '15']] } },
      'The lecture then introduces heapsort as merge sort’s $O(n \\lg n)$ time combined with insertion sort’s in-place property.',
    ],
    answer: "Nearly sorted input. (Also: it sorts in place; its disadvantage is $O(n^2)$ worst case.)",
    mistake: 'Listing "$O(n)$ space" as insertion sort’s disadvantage. That is merge sort’s; insertion sort is in place.',
    tryIt: { q: 'How many shifts does insertion sort make on {2, 1, 3, 5, 4, 6}?', a: 'Two: the 1 moves past the 2, and the 4 moves past the 5.' },
  };

  H['c310-heap-heapsort-combines'] = {
    asks: "Name the insertion sort advantage that heapsort shares.",
    idea: 'Each older sort has one strength and one weakness. Heapsort keeps both strengths: merge sort’s guaranteed $n \\lg n$ time, and insertion sort’s working inside the array.',
    steps: [
      { text: 'The three sorts side by side:', table: { head: ['', 'worst-case time', 'extra space'], rows: [['merge sort', '$\\Theta(n \\lg n)$ (good)', '$O(n)$ (bad)'], ['insertion sort', '$O(n^2)$ (bad)', 'in place (good)'], ['heapsort', '$O(n \\lg n)$ (good)', 'in place (good)']] } },
      'Time: BuildHeap is $O(n)$, and the loop makes $n - 1$ MAX-HEAPIFY calls of $O(\\lg n)$ each: $O(n \\lg n)$ on every input.',
      'Space: the heap lives in A itself, and the sorted part grows at the right end of the same array. Only swaps, no second array.',
    ],
    answer: "Sorting in place. (From merge sort it takes the $O(n \\lg n)$ worst-case time.)",
    mistake: 'Adding "fast on nearly sorted input" from insertion sort. Heapsort does not get that; it inherits only the in-place property.',
    tryIt: { q: 'Memory is tight and you need a guaranteed $O(n \\lg n)$ worst case. Which of the three sorts?', a: 'Heapsort: merge sort needs an $O(n)$ buffer, and insertion sort can take $O(n^2)$.' },
  };

  H['c310-heap-min-property'] = {
    asks: "Pick the inequality that is the min-heap property.",
    idea: 'A min-heap is a max-heap with the inequality flipped: every parent is $\\le$ its children, so values only grow as you walk down. The smallest value can only be at the top.',
    steps: [
      'Property: for every node $i$ except the root, $A[\\text{parent}(i)] \\le A[i]$, where $\\text{parent}(i) = \\lfloor i/2 \\rfloor$.',
      'Walk from any node up to the root: each step reaches a value $\\le$ the one before. So the root is $\\le$ every node, and the minimum is A[1].',
      'Siblings are not ordered. The property compares only a parent with its children.',
      { text: 'Check ⟨2, 5, 3, 9, 6, 4⟩ (drawn below) node by node:', table: { head: ['$i$', 'A[$i$]', 'parent', 'A[parent]', 'A[parent] $\\le$ A[$i$]?'], rows: [['2', '5', '1', '2', 'yes'], ['3', '3', '1', '2', 'yes'], ['4', '9', '2', '5', 'yes'], ['5', '6', '2', '5', 'yes'], ['6', '4', '3', '3', 'yes']] } },
    ],
    heap: [2, 5, 3, 9, 6, 4],
    answer: "$A[\\text{parent}(i)] \\le A[i]$ for every non-root $i$: a node is at least its parent, so the smallest element is at the root.",
    mistake: 'Thinking a min-heap is sorted. ⟨2, 5, 3, 9, 6, 4⟩ is a valid min-heap, yet 5 comes before 3.',
    tryIt: { q: 'Is ⟨2, 5, 3, 4, 6, 1⟩ a min-heap?', a: 'No. A[6] = 1 and its parent A[3] = 3, but $3 \\le 1$ is false.' },
  };

  H['c310-heap-height-def'] = {
    asks: "Define the height of a node in a heap.",
    idea: 'Height measures how far a node is above the bottom, counted in edges along the longest path down. Leaves are at the bottom, so their height is 0. The heap’s height is its root’s height.',
    steps: [
      'Height of a node: the number of EDGES on the longest downward path from that node to a leaf.',
      'Height of the heap: the height of its root.',
      { text: 'In the 10-node heap below:', table: { head: ['node(s)', 'longest path down', 'height'], rows: [['1', '1 → 2 → 4 → 8', '3'], ['2', '2 → 4 → 8', '2'], ['3, 4, 5', 'e.g. 5 → 10', '1'], ['6 to 10', '(leaves)', '0']] } },
      'A heap of $n$ nodes has height $\\lfloor \\lg n \\rfloor$. For $n = 10$: $\\lfloor 3.32 \\rfloor = 3$, the root’s height above.',
    ],
    heap: [16, 14, 10, 8, 7, 9, 3, 2, 4, 1],
    answer: "The number of edges on the longest downward path from that node to a leaf. (The heap’s height is its root’s height.)",
    mistake: 'Counting nodes instead of edges (4 for this root). A one-node heap has height 0, not 1.',
    tryIt: { q: 'In a 12-node heap, what are the heights of nodes 1, 3 and 6?', a: 'Node 1: 1 → 2 → 4 → 8, height 3. Node 3: 3 → 6 → 12, height 2. Node 6: 6 → 12, height 1.' },
  };

  H['c310-heap-height-apply'] = {
    asks: 'Find the height of a heap with 16 elements.',
    idea: 'A heap fills its levels top to bottom, left to right, and level $d$ holds $2^d$ nodes. Count how many full levels 16 nodes fill, and see where the rest go.',
    steps: [
      { text: 'Fill the levels:', table: { head: ['level $d$', 'nodes', 'indices'], rows: [['0', '1', '1'], ['1', '2', '2–3'], ['2', '4', '4–7'], ['3', '8', '8–15'], ['4', '1', '16']] } },
      'Levels 0 to 3 hold $1 + 2 + 4 + 8 = 15$ nodes, so node 16 starts level 4, as the left child of node 8.',
      'The longest path from the root is 1 → 2 → 4 → 8 → 16: 4 edges. Height 4.',
      'Formula: $\\lfloor \\lg 16 \\rfloor = 4$.',
    ],
    answer: '4.',
    mistake: 'Answering 5, the number of levels. Height counts edges: 5 levels have 4 edges from top to bottom.',
    tryIt: { q: 'Heights for $n = 31$ and $n = 32$?', a: '31 fills levels 0 to 4 exactly ($1 + 2 + 4 + 8 + 16$): height 4. Node 32 starts level 5: height 5. ($\\lfloor \\lg 31 \\rfloor = 4$, $\\lfloor \\lg 32 \\rfloor = 5$.)' },
  };

  H['c310-heap-heapify-why-larger'] = {
    asks: 'Explain why MAX-HEAPIFY swaps A[i] with the LARGER child and not the smaller one.',
    idea: 'Whichever child moves up becomes the parent of the other child. A parent must be $\\ge$ its children, so the child moving up has to be the bigger of the two.',
    steps: [
      'Setting: A[i] is smaller than at least one child, and both child subtrees are already heaps.',
      'After the swap, the promoted child sits at i, above the old A[i] (now one level down) and above its own sibling.',
      'Promote the larger child $L$: $L \\ge$ its sibling and $L >$ the old A[i], so node i is fine.',
      'Promote the smaller child $S$: then $S$ sits above its larger sibling $L$, and $S < L$ is a new violation at i.',
      'Slide example: A[2] = 4 with children 14 and 7. Promoting 14 is fine (14 ends up above 4 and 7); promoting 7 would put 7 above 14.',
    ],
    heap: [16, 4, 10, 14, 7, 9, 3, 2, 8, 1],
    heapSteps: [
      { text: 'Correct: swap 4 with the larger child 14. Node 2 is fixed (the 4 keeps sinking from index 4).', heap: [16, 14, 10, 4, 7, 9, 3, 2, 8, 1] },
      { text: 'Wrong: swap 4 with the smaller child 7. Now 7 sits above 14.', heap: [16, 7, 10, 14, 4, 9, 3, 2, 8, 1] },
    ],
    answer: 'The child that moves up becomes the parent of the other child. Only the larger child is $\\ge$ the other child, so only that swap leaves the property true at node i.',
    mistake: 'Swapping with the first child that is bigger than A[i]. When both children are bigger, it must be the larger of the two.',
    tryIt: { q: 'A[i] = 3 with children 9 and 6. Which swap, and what goes wrong with the other one?', a: 'Swap 3 with 9; then 9 is above 6 and 3. Swapping with 6 would put 6 above 9.' },
  };

  H['c310-heap-heapify-recurrence'] = {
    asks: 'Give the recurrence for MAX-HEAPIFY on a subtree of $n$ nodes, explain each term, and solve it.',
    idea: 'One call does a constant amount of comparing and swapping, then recurses into ONE child’s subtree. So the cost is a constant times the number of levels it can sink. The $2n/3$ only bounds how big that child subtree can be.',
    steps: [
      '$\\Theta(1)$: compare A[i] with A[Left(i)] and A[Right(i)], and maybe swap.',
      '$T(2n/3)$: the recursive call on one child’s subtree. That subtree is largest relative to $n$ when the bottom level is exactly half full, all of it under the left child.',
      { text: 'Bottom level half full: the left subtree is complete with height $h$, the right with height $h - 1$.', table: { head: ['$h$', 'left', 'right', '$n$', 'left / $n$'], rows: [['1', '3', '1', '5', '0.600'], ['2', '7', '3', '11', '0.636'], ['3', '15', '7', '23', '0.652'], ['4', '31', '15', '47', '0.660']] } },
      'The fraction creeps toward $\\frac23$ but never passes it, so $T(n) \\le T(2n/3) + \\Theta(1)$.',
      'Master theorem: $a = 1$, $b = \\frac32$, so $n^{\\log_b a} = n^0 = 1$, and $f(n) = \\Theta(1)$ matches it: case 2, $T(n) = \\Theta(n^0 \\lg n) = \\Theta(\\lg n)$. So MAX-HEAPIFY is $O(\\lg n)$.',
    ],
    answer: '$T(n) \\le T(2n/3) + \\Theta(1)$. $\\Theta(1)$ fixes up A[i], A[Left(i)], A[Right(i)]; a child’s subtree has at most $2n/3$ nodes (worst case: bottom level exactly half full). By case 2 of the master theorem, $T(n) = O(\\lg n)$.',
    mistake: 'Using $T(n/2)$ because "each child has half the nodes". When the bottom level is half full, the left child holds almost $\\frac23$ of them.',
    tryIt: { q: 'Solve $T(n) = T(n/2) + \\Theta(1)$ with the master theorem.', a: '$a = 1$, $b = 2$, $n^{\\log_2 1} = n^0 = 1$, and $f(n) = \\Theta(1)$: case 2, so $T(n) = \\Theta(\\lg n)$.' },
  };

  H['c310-heap-build-loop'] = {
    asks: "Explain why BuildHeap’s loop starts at $\\lfloor n/2 \\rfloor$.",
    idea: 'Every leaf is already a heap of one element, so there is nothing to fix there. The last node that has a child is node $\\lfloor n/2 \\rfloor$. Start fixing there and work back to the root.',
    steps: [
      'Code: for $i = \\lfloor n/2 \\rfloor$ down to 1: MAX-HEAPIFY(A, i).',
      'Node i has a left child exactly when Left(i) $= 2i \\le n$, that is $i \\le n/2$. Since i is a whole number, $i \\le \\lfloor n/2 \\rfloor$.',
      'So nodes $\\lfloor n/2 \\rfloor + 1$ to $n$ have no children: they are leaves, 1-element heaps.',
      { text: 'Examples:', table: { head: ['$n$', '$\\lfloor n/2 \\rfloor$', 'loop runs i =', 'leaves'], rows: [['7', '3', '3, 2, 1', '4–7'], ['10', '5', '5, 4, 3, 2, 1', '6–10'], ['13', '6', '6, 5, …, 1', '7–13']] } },
      'Starting at $n$ would only waste calls on leaves; starting below $\\lfloor n/2 \\rfloor$ would skip a node that has a child.',
    ],
    answer: "$A[\\lfloor n/2 \\rfloor + 1 .. n]$ are all leaves, and each leaf is already a 1-element heap. (The loop: for $i = \\lfloor n/2 \\rfloor$ down to 1: MAX-HEAPIFY(A, i).)",
    mistake: 'Dropping the floor. For $n = 7$, $7/2 = 3.5$ is not an index; node 3 (children 6 and 7) is the last parent.',
    tryIt: { q: 'For $n = 11$, where does the loop start, and which indices are leaves?', a: '$\\lfloor 11/2 \\rfloor = 5$ (children 10 and 11). Leaves: 6 to 11. The loop runs $i = 5, 4, 3, 2, 1$.' },
  };

  H['c310-heap-build-why-down'] = {
    asks: 'Explain why BuildHeap’s loop goes DOWN from $\\lfloor n/2 \\rfloor$ to 1 instead of up from 1.',
    idea: 'MAX-HEAPIFY can fix a node only if both subtrees below it are already heaps. Children have larger indices than their parents, so counting down fixes every subtree before its parent needs it, like building a wall from the bottom row up.',
    steps: [
      'MAX-HEAPIFY(A, i) assumes the subtrees at Left(i) = 2i and Right(i) = 2i + 1 are heaps.',
      'Counting down, the loop handles 2i and 2i + 1 (larger numbers) before i, so the assumption holds every time.',
      { text: 'Counting UP on ⟨1, 2, 3, 4, 5, 6, 7⟩ goes wrong:', table: { head: ['step', 'A'], rows: [['start', '1, 2, 3, 4, 5, 6, 7'], ['$i = 1$: 1 ↔ 3, then 1 ↔ 7', '3, 2, 7, 4, 5, 6, 1'], ['$i = 2$: 2 ↔ 5', '3, 5, 7, 4, 2, 6, 1'], ['$i = 3$: 7 $\\ge$ 6 and 1, no swap', '3, 5, 7, 4, 2, 6, 1']] } },
      'The root 3 is below its child 7. When $i = 1$ ran, the big values were still deep down, and nothing afterwards brings them back up to the root.',
      'Counting down on the same array gives the valid heap ⟨7, 5, 6, 4, 2, 1, 3⟩.',
    ],
    heap: [1, 2, 3, 4, 5, 6, 7],
    heapSteps: [
      { text: 'Counting up: the result has 3 above 7 and 5. Not a heap.', heap: [3, 5, 7, 4, 2, 6, 1] },
      { text: 'Counting down ($i = 3, 2, 1$): a valid max-heap.', heap: [7, 5, 6, 4, 2, 1, 3] },
    ],
    answer: 'Processing in decreasing index order guarantees that the children of node i are already heaps when i is processed, which is MAX-HEAPIFY’s precondition.',
    mistake: 'Thinking the direction is only about speed. Counting up gives a wrong result, not just a slower one.',
    tryIt: { q: 'Count UP on ⟨1, 3, 2, 4⟩ ($i = 1$, then 2). Is the result a heap?', a: '$i = 1$: 1 ↔ 3, then 1 ↔ 4 → ⟨3, 4, 2, 1⟩. $i = 2$: 4 $\\ge$ 1, no swap. Not a heap: 3 is above 4. (Counting down gives ⟨4, 3, 2, 1⟩.)' },
  };

  H['c310-heap-first-leaf'] = {
    asks: 'In a 1-indexed heap of 13 elements, find the index of the first leaf.',
    idea: 'A node is a leaf when its left child’s index, $2i$, would fall past the end of the array.',
    steps: [
      'Node i has a child exactly when $2i \\le 13$, that is $i \\le 6.5$, so $i \\le 6$.',
      'Check: node 6 has children 12 and 13, both present. Node 7’s children would be 14 and 15, both beyond 13: no children.',
      'So the first leaf is $7 = \\lfloor 13/2 \\rfloor + 1$, and indices 7 to 13 are all leaves (the bottom row of the drawing).',
    ],
    heap: [50, 45, 40, 30, 35, 20, 25, 10, 15, 5, 12, 8, 18],
    answer: '7 $= \\lfloor 13/2 \\rfloor + 1$.',
    mistake: 'Answering 6 (or 6.5) from $n/2$. $\\lfloor n/2 \\rfloor$ is the LAST internal node; the first leaf is the one after it.',
    tryIt: { q: 'Index of the first leaf in a 20-element heap?', a: '$\\lfloor 20/2 \\rfloor + 1 = 11$. Node 10 still has child 20; node 11’s child would be 22.' },
  };

  H['c310-heap-build-slide'] = {
    asks: 'Run BuildHeap on the slide array ⟨4, 1, 3, 2, 16, 9, 10, 14, 8, 7⟩ and give the resulting max-heap.',
    idea: 'Same loop as always: $i$ from $\\lfloor 10/2 \\rfloor = 5$ down to 1, with MAX-HEAPIFY at each. Small values near the top (4, 1) sink a long way; big values near the bottom (16, 14) rise.',
    steps: [
      '$i = 5$: A[5] = 16 and its only child A[10] = 7. $16 \\ge 7$: no swap.',
      '$i = 4$: A[4] = 2, children 14 and 8: swap with 14. $i = 3$: A[3] = 3, children 9 and 10: swap with 10.',
      '$i = 2$: A[2] = 1, children 14 and 16: swap with 16 (index 5). At index 5 the 1 has child 7: swap again.',
      '$i = 1$: the 4 sinks three levels, swapping with 16 (index 2), then 14 (index 4), then 8 (index 9). Index 9 is a leaf: done.',
    ],
    heap: [4, 1, 3, 2, 16, 9, 10, 14, 8, 7],
    heapSteps: [
      { text: 'After $i = 5$ (no change) and $i = 4$ (2 ↔ 14).', heap: [4, 1, 3, 14, 16, 9, 10, 2, 8, 7] },
      { text: 'After $i = 3$ (3 ↔ 10).', heap: [4, 1, 10, 14, 16, 9, 3, 2, 8, 7] },
      { text: 'After $i = 2$ (1 ↔ 16, then 1 ↔ 7).', heap: [4, 16, 10, 14, 7, 9, 3, 2, 8, 1] },
      { text: 'After $i = 1$ (4 ↔ 16, 4 ↔ 14, 4 ↔ 8): a max-heap.', heap: [16, 14, 10, 8, 7, 9, 3, 2, 4, 1] },
    ],
    answer: '16, 14, 10, 8, 7, 9, 3, 2, 4, 1.',
    mistake: 'Stopping each MAX-HEAPIFY after one swap. At $i = 1$ the 4 sinks three levels (to index 9); stopping early leaves 4 above 14.',
    tryIt: { q: 'Run BuildHeap on ⟨1, 4, 2, 8, 5, 6, 3⟩.', a: '$i = 3$: 2 ↔ 6. $i = 2$: 4 ↔ 8. $i = 1$: 1 ↔ 8, then 1 vs 4 and 5 → 1 ↔ 5. Result ⟨8, 5, 6, 4, 1, 2, 3⟩.' },
  };

  H['c310-heap-build-prac2'] = {
    asks: 'Run BuildHeap on ⟨3, 9, 2, 1, 4, 5⟩ and give the resulting max-heap.',
    idea: '$n = 6$, so the loop is $i = 3, 2, 1$. Node 3 has only a left child (index 6), so its check is a single comparison.',
    steps: [
      '$i = 3$: A[3] = 2, left child A[6] = 5, no right child ($7 > 6$). Swap: ⟨3, 9, 5, 1, 4, 2⟩.',
      '$i = 2$: A[2] = 9, children A[4] = 1 and A[5] = 4. 9 is the largest: no swap.',
      '$i = 1$: A[1] = 3, children 9 and 5. Swap with 9: ⟨9, 3, 5, 1, 4, 2⟩.',
      'The 3 keeps sinking in the same call: at index 2 its children are 1 and 4, so it swaps with 4, giving ⟨9, 4, 5, 1, 3, 2⟩. Index 5 is a leaf: done.',
    ],
    heap: [3, 9, 2, 1, 4, 5],
    heapSteps: [
      { text: 'After $i = 3$ (2 ↔ 5); $i = 2$ changes nothing.', heap: [3, 9, 5, 1, 4, 2] },
      { text: '$i = 1$, first swap: 3 ↔ 9.', heap: [9, 3, 5, 1, 4, 2] },
      { text: '$i = 1$, second swap: 3 ↔ 4. A max-heap.', heap: [9, 4, 5, 1, 3, 2] },
    ],
    answer: '9, 4, 5, 1, 3, 2.',
    mistake: 'Looking for a right child of node 3 at index 7. With heap_size 6 it does not exist; the test r $\\le$ heap_size skips it.',
    tryIt: { q: 'Run BuildHeap on ⟨5, 3, 8, 1, 9, 2⟩.', a: '$i = 3$: 8 $\\ge$ 2, no swap. $i = 2$: 3 vs 1 and 9 → 3 ↔ 9. $i = 1$: 5 vs 9 and 8 → 5 ↔ 9; at index 2, 5 vs 1 and 3: stays. Result ⟨9, 5, 8, 1, 3, 2⟩.' },
  };

  H['c310-heap-build-bound-mc'] = {
    asks: 'BuildHeap makes $O(n)$ calls to MAX-HEAPIFY, each $O(\\lg n)$. Pick the TIGHT bound on its running time.',
    idea: '$O(\\lg n)$ is what a call at the ROOT can cost. Most nodes are near the bottom, and a node at height $h$ can sink at most $h$ levels. Half the nodes are leaves (cost 0), a quarter have height 1, and so on, so the total is linear.',
    steps: [
      '$O(n) \\cdot O(\\lg n) = O(n \\lg n)$ is a true upper bound, but not a tight one.',
      'A node at height $h$ costs $O(h)$, and there are at most about $\\frac{n}{2^{h+1}}$ nodes at height $h$.',
      { text: 'A full heap with $n = 15$:', table: { head: ['height $h$', 'nodes', 'max swaps each', 'max swaps total'], rows: [['0', '8', '0', '0'], ['1', '4', '1', '4'], ['2', '2', '2', '4'], ['3', '1', '3', '3']] } },
      'At most $0 + 4 + 4 + 3 = 11$ swaps, fewer than $n = 15$. In general $T(n) \\le \\sum_{h} \\frac{n}{2^{h+1}} \\cdot ch = cn \\sum_{h} \\frac{h}{2^{h+1}}$.',
      '$\\sum_{h=0}^{\\infty} \\frac{h}{2^{h+1}} = \\frac14 + \\frac28 + \\frac{3}{16} + \\dots = 1$, a constant (the slide writes 2, which is the value of $\\sum \\frac{h}{2^h}$; either way a constant). So $T(n) = O(n)$, and since the loop alone takes $\\Omega(n)$, it is $\\Theta(n)$.',
    ],
    graph: {
      caption: 'Bars: the most swaps BuildHeap can make on a full heap of $n$ nodes (sorted ascending input, counted by running it). They stay under the line $n$, far below $n \\lg n$.',
      x: [1, 1100], xLabel: 'n', yLabel: 'swaps',
      curves: [{ label: '$n \\lg n$', f: n => n * lg(n), tone: 'a' }, { label: '$n$', f: n => n, tone: 'c' }],
      bars: { label: 'max swaps, full heap', tone: 'b', values: [[15, 11], [31, 26], [63, 57], [127, 120], [255, 247], [511, 502], [1023, 1013]] },
    },
    answer: '$\\Theta(n)$: most nodes are near the bottom, and $\\sum_h \\frac{n}{2^{h+1}} \\cdot O(h) = O(n)$.',
    mistake: 'Choosing $\\Theta(n \\lg n)$ from "$n$ calls × $\\lg n$ each". That charges every call the root’s cost, but only the few nodes near the root can sink $\\lg n$ levels.',
    tryIt: { q: 'A full heap with $n = 31$ has 16 nodes at height 0, 8 at height 1, 4 at 2, 2 at 3 and 1 at 4. At most how many swaps can BuildHeap make?', a: '$8 \\cdot 1 + 4 \\cdot 2 + 2 \\cdot 3 + 1 \\cdot 4 = 8 + 8 + 6 + 4 = 26$, fewer than 31.' },
  };

  H['c310-heap-heapsort-order'] = {
    asks: 'Put the steps of Heapsort(A) in order.',
    idea: 'Build the heap once. Then repeat one move: take the biggest element (the root), park it at the end of the array, shrink the heap so it is never touched again, and repair the root.',
    steps: [
      'BUILD-MAX-HEAP(A): once, before the loop. Now A[1] is the maximum.',
      'for i = length(A) downto 2: i is the slot that the next maximum goes into, filling from the right.',
      'Swap A[1] and A[i]: the maximum moves to its final slot.',
      'heap_size(A) = heap_size(A) − 1: slot i leaves the heap.',
      'MAX-HEAPIFY(A, 1): the element just swapped to the root sinks to its place. The loop stops at 2 because the one element left is already in place.',
    ],
    answer: 'BUILD-MAX-HEAP(A); for i = length(A) downto 2: swap A[1] and A[i]; heap_size(A) = heap_size(A) − 1; MAX-HEAPIFY(A, 1).',
    mistake: 'Calling MAX-HEAPIFY before shrinking heap_size. The maximum is then still inside the heap and can be pulled back up: on ⟨5, 3, 4⟩, swapping gives ⟨4, 3, 5⟩, and heapifying with size 3 puts 5 back at the root.',
    tryIt: { q: 'Run the whole loop on the max-heap ⟨4, 1, 3⟩.', a: 'i = 3: swap → ⟨3, 1, 4⟩, size 2, heapify: 3 $\\ge$ 1, no change. i = 2: swap → ⟨1, 3, 4⟩, size 1. Sorted: ⟨1, 3, 4⟩.' },
  };

  H['c310-heap-heapsort-why-swap'] = {
    asks: "In Heapsort’s loop, explain why A[1] is swapped into A[i].",
    idea: 'The heap is a machine that always keeps the maximum on top. Heapsort keeps taking the top item and stacking it at the right end of the array, which becomes the sorted pile. Each removal breaks the machine slightly at the top, and MAX-HEAPIFY repairs it.',
    steps: [
      'A[1] is the maximum of A[1..i]. In sorted order it belongs in the last slot of that range, A[i], and the swap puts it there.',
      'heap_size − 1: A[i] is now final, and shrinking the heap stops later steps from moving it.',
      'The element now at A[1] came from the bottom, so it is probably small. The subtrees at nodes 2 and 3 were not touched and are still heaps.',
      'That is exactly MAX-HEAPIFY’s precondition, so MAX-HEAPIFY(A, 1) restores the heap in $O(\\lg n)$, and the next maximum is at A[1].',
      { text: 'On the heap ⟨5, 3, 4⟩:', table: { head: ['i', 'after Swap(A[1], A[i])', 'heap after shrinking', 'after MAX-HEAPIFY(A, 1)'], rows: [['3', '4, 3, 5', 'A[1..2] = 4, 3', '4, 3, 5 (no change)'], ['2', '3, 4, 5', 'A[1..1] = 3', '3, 4, 5']] } },
    ],
    answer: "A[1] is the maximum of the remaining heap, so A[i] is its final sorted place. (Then heap_size shrinks and MAX-HEAPIFY(A, 1) repairs the root.)",
    mistake: 'Rebuilding the whole heap each iteration. Only the root is out of place, so one MAX-HEAPIFY ($O(\\lg n)$) is enough; a rebuild would cost $O(n)$ every time.',
    tryIt: { q: 'One iteration on the heap ⟨6, 4, 5, 1, 2⟩: give A afterwards.', a: 'Swap 6 ↔ 2: ⟨2, 4, 5, 1 | 6⟩, size 4. Heapify: 2 vs 4 and 5 → 2 ↔ 5; index 3 has no children within size 4. Result ⟨5, 4, 2, 1, 6⟩.' },
  };

  H['c310-heap-heapsort-build'] = {
    asks: 'Heapsort on A = ⟨4, 3, 2, 1, 8, 7, 6, 5⟩: give A after the first phase, BUILD-MAX-HEAP.',
    idea: 'This is plain BuildHeap with $n = 8$: MAX-HEAPIFY at $i = 4, 3, 2, 1$. Heapsort’s loop has not started yet.',
    steps: [
      '$i = 4$: A[4] = 1 and its only child A[8] = 5. Swap: ⟨4, 3, 2, 5, 8, 7, 6, 1⟩.',
      '$i = 3$: A[3] = 2, children 7 and 6. Swap with 7: ⟨4, 3, 7, 5, 8, 2, 6, 1⟩.',
      '$i = 2$: A[2] = 3, children 5 and 8, so swap with 8: ⟨4, 8, 7, 5, 3, 2, 6, 1⟩ (index 5 is a leaf).',
      '$i = 1$: A[1] = 4, children 8 and 7, so swap with 8; at index 2 the children are 5 and 3, so swap with 5. Result ⟨8, 5, 7, 4, 3, 2, 6, 1⟩.',
    ],
    heap: [4, 3, 2, 1, 8, 7, 6, 5],
    heapSteps: [
      { text: 'After $i = 4$: 1 ↔ 5.', heap: [4, 3, 2, 5, 8, 7, 6, 1] },
      { text: 'After $i = 3$: 2 ↔ 7.', heap: [4, 3, 7, 5, 8, 2, 6, 1] },
      { text: 'After $i = 2$: 3 ↔ 8.', heap: [4, 8, 7, 5, 3, 2, 6, 1] },
      { text: 'After $i = 1$: 4 ↔ 8, then 4 ↔ 5. A max-heap.', heap: [8, 5, 7, 4, 3, 2, 6, 1] },
    ],
    answer: '8, 5, 7, 4, 3, 2, 6, 1.',
    mistake: 'Starting the loop at $i = 8$, or forgetting that node 4 has a child (index 8). $\\lfloor 8/2 \\rfloor = 4$, so node 4 is the first one processed.',
    tryIt: { q: 'BUILD-MAX-HEAP on ⟨2, 6, 1, 5, 3, 4⟩.', a: '$i = 3$: 1 ↔ 4. $i = 2$: 6 $\\ge$ 5 and 3, no swap. $i = 1$: 2 ↔ 6, then at index 2: 2 vs 5 and 3 → 2 ↔ 5. Result ⟨6, 5, 4, 2, 3, 1⟩.' },
  };

  H['c310-heap-heapsort-iter1'] = {
    asks: 'Starting from the heap ⟨8, 5, 7, 4, 3, 2, 6, 1⟩, do ONE Heapsort loop iteration (i = 8) and give A.',
    idea: 'Swap the maximum to the end, then let the 1 that landed on top sink through a heap that is now only 7 long. Index 8 is off limits from now on.',
    steps: [
      'Swap A[1] = 8 and A[8] = 1: ⟨1, 5, 7, 4, 3, 2, 6 | 8⟩, and heap_size = 7.',
      'MAX-HEAPIFY(A, 1): 1 against children 5 and 7; the larger is 7 (index 3), so swap: ⟨7, 5, 1, 4, 3, 2, 6 | 8⟩.',
      'At index 3 the children are A[6] = 2 and A[7] = 6; the larger is 6, so swap: ⟨7, 5, 6, 4, 3, 2, 1 | 8⟩.',
      'Index 7 has no children inside the heap ($14 > 7$): stop.',
    ],
    heap: [8, 5, 7, 4, 3, 2, 6, 1],
    heapSteps: [
      { text: 'Swap A[1] and A[8]. The 8 is now outside the heap (heap_size 7).', heap: [1, 5, 7, 4, 3, 2, 6, 8] },
      { text: 'MAX-HEAPIFY: 1 ↔ 7 (the larger child).', heap: [7, 5, 1, 4, 3, 2, 6, 8] },
      { text: '1 ↔ 6. Index 7 is a leaf: done.', heap: [7, 5, 6, 4, 3, 2, 1, 8] },
    ],
    answer: '7, 5, 6, 4, 3, 2, 1, 8.',
    mistake: 'Swapping the 1 with the left child 5 because it comes first. MAX-HEAPIFY always picks the LARGER child, here 7.',
    tryIt: { q: 'One Heapsort iteration on the heap ⟨9, 6, 8, 2, 5, 7⟩.', a: 'Swap 9 ↔ 7: ⟨7, 6, 8, 2, 5 | 9⟩. Heapify with size 5: 7 vs 6 and 8 → swap with 8; index 3 has no children within size 5. Result ⟨8, 6, 7, 2, 5, 9⟩.' },
  };

  H['c310-heap-heapsort-iter2'] = {
    asks: 'A = ⟨7, 5, 6, 4, 3, 2, 1, 8⟩ with heap_size 7. Do the next Heapsort iteration (i = 7) and give A.',
    idea: 'Same move, one size smaller: swap the root with the last heap slot (index 7), shrink to 6, and sink the new root.',
    steps: [
      'Swap A[1] = 7 and A[7] = 1: ⟨1, 5, 6, 4, 3, 2 | 7, 8⟩, and heap_size = 6.',
      'MAX-HEAPIFY(A, 1): children 5 and 6. Swap with 6 (index 3): ⟨6, 5, 1, 4, 3, 2 | 7, 8⟩.',
      'At index 3: left child A[6] = 2. The right child would be index 7, but $7 >$ heap_size $= 6$, so it is ignored (it holds the sorted 7).',
      '$2 > 1$, so swap: ⟨6, 5, 2, 4, 3, 1 | 7, 8⟩. Index 6 is a leaf: done.',
    ],
    heap: [7, 5, 6, 4, 3, 2, 1, 8],
    heapSteps: [
      { text: 'Swap A[1] and A[7]; heap_size 6 (7 and 8 are sorted).', heap: [1, 5, 6, 4, 3, 2, 7, 8] },
      { text: 'MAX-HEAPIFY: 1 ↔ 6.', heap: [6, 5, 1, 4, 3, 2, 7, 8] },
      { text: '1 ↔ 2 (index 7 is outside the heap). Done.', heap: [6, 5, 2, 4, 3, 1, 7, 8] },
    ],
    answer: '6, 5, 2, 4, 3, 1, 7, 8.',
    mistake: 'Comparing the 1 at index 3 with A[7] = 7 and swapping it back. Index 7 left the heap in this iteration; the test r $\\le$ heap_size excludes it.',
    tryIt: { q: 'Continue the previous tryIt: A = ⟨8, 6, 7, 2, 5, 9⟩ with heap_size 5. Next iteration?', a: 'Swap 8 ↔ 5: ⟨5, 6, 7, 2 | 8, 9⟩. Heapify with size 4: 5 vs 6 and 7 → swap with 7. Result ⟨7, 6, 5, 2, 8, 9⟩.' },
  };

  H['c310-heap-heapsort-analysis'] = {
    asks: 'Derive Heapsort’s running time from its two phases.',
    idea: 'Add the phases: one build, then $n - 1$ repairs at the root. Each repair can sink at most the height of the heap, $\\lg n$ levels.',
    steps: [
      'Phase 1: BUILD-MAX-HEAP costs $O(n)$.',
      'Phase 2: the loop runs for $i = n$ down to 2, which is $n - 1$ iterations.',
      'Each iteration: one swap and one decrement ($O(1)$), plus MAX-HEAPIFY(A, 1), which sinks at most the height $\\lfloor \\lg n \\rfloor$: $O(\\lg n)$.',
      'Total: $T(n) = O(n) + (n - 1)\\,O(\\lg n) = O(n) + O(n \\lg n) = O(n \\lg n)$, because $n \\lg n$ grows faster than $n$.',
    ],
    graph: {
      caption: 'The bound $n + (n - 1)\\lg n$ runs right alongside $n \\lg n$: the build phase adds only a linear term.',
      x: [2, 64], xLabel: 'n', yLabel: 'steps',
      curves: [{ label: '$n + (n-1)\\lg n$', f: n => n + (n - 1) * lg(n), tone: 'a' }, { label: '$n \\lg n$', f: n => n * lg(n), tone: 'b' }],
    },
    answer: 'BUILD-MAX-HEAP is $O(n)$; the loop runs $n - 1$ times, each with an $O(\\lg n)$ MAX-HEAPIFY. $T(n) = O(n) + (n - 1)\\,O(\\lg n) = O(n \\lg n)$.',
    mistake: 'Multiplying the phases, $O(n) \\cdot O(n \\lg n)$. The phases run one after the other, so their costs add.',
    tryIt: { q: 'For $n = 1024$ the heap height is at most 10. Bound the sinking swaps in phase 2.', a: '1023 iterations × at most 10 swaps each $= 10{,}230$. Phase 1 adds at most about $n$ more, so the sort is $O(n \\lg n)$.' },
  };

  H['c310-heap-heapsort-vs-quick'] = {
    asks: 'According to the course, which usually wins in practice: heapsort or a good quicksort implementation?',
    idea: 'A worst-case guarantee and everyday speed are different questions. Heapsort wins the guarantee ($n \\lg n$ always); a good quicksort usually wins the race on real inputs. Big-O cannot settle the race, because both are $n \\lg n$ on typical inputs and only the constants differ.',
    steps: [
      { text: 'What the two have in common, and where they differ:', table: { head: ['', 'heapsort', 'quicksort'], rows: [['worst case', '$O(n \\lg n)$', '$O(n^2)$'], ['expected', '$O(n \\lg n)$', '$O(n \\lg n)$'], ['in place', 'yes', 'yes']] } },
      'The slide: "Heapsort is an excellent algorithm, but a good implementation of quicksort usually beats it in practice."',
      '"Usually" matters: quicksort can still hit $O(n^2)$ on bad inputs, and there heapsort’s guarantee wins.',
      'That is why the slides move on to the heap’s other big use, the priority queue.',
    ],
    answer: 'A good quicksort usually beats heapsort in practice.',
    mistake: 'Choosing heapsort because its worst case is better. The question asks about usual practice, not the worst case.',
    tryIt: { q: 'You need a sort that is NEVER worse than $O(n \\lg n)$ and uses no extra array. Heapsort or quicksort?', a: 'Heapsort. Quicksort is in place too, but its worst case is $O(n^2)$.' },
  };

  H['c310-heap-pq-prim'] = {
    asks: 'Pick the algorithm that uses a priority queue to build a minimum spanning tree.',
    idea: 'Match each algorithm to its goal. "Minimum spanning tree" (connect every vertex as cheaply as possible) is Prim’s. All four use a priority queue to pick "the best next item".',
    steps: [
      { text: 'The four algorithms from the slide:', table: { head: ['algorithm', 'goal', 'the priority queue picks'], rows: [['Prim', 'minimum spanning tree', 'the cheapest edge to a new vertex'], ['Dijkstra', 'single-source shortest paths', 'the closest unfinished vertex'], ['Huffman coding', 'optimal prefix-code tree', 'the two least frequent trees'], ['A* search', 'guided search to a goal', 'the most promising node']] } },
      'The key words in the question are "minimum spanning tree"; only Prim’s algorithm has that goal.',
      'Dijkstra is the usual trap: it also grows a tree using a priority queue, but a shortest-path tree, not a minimum spanning tree.',
    ],
    answer: 'Prim’s algorithm.',
    mistake: 'Choosing Dijkstra because both are greedy graph algorithms with priority queues. Go by the goal: Dijkstra = shortest paths, Prim = MST.',
    tryIt: { q: 'Which of the four uses a priority queue to find shortest paths from one source?', a: 'Dijkstra’s algorithm.' },
  };

  H['c310-heap-pq-os'] = {
    asks: 'Name the two operating-system uses of priority queues given in the course.',
    idea: 'An operating system keeps asking "what is the most urgent thing to do next?" It asks that in two places: which process gets the CPU, and which interrupt gets handled first.',
    steps: [
      'CPU scheduling: ready processes wait in a priority queue, and the scheduler removes the highest-priority one. Under shortest remaining time first, the smallest remaining time is the highest priority.',
      'Interrupt handling: pending interrupts are kept by severity, and the most severe is handled first.',
      'Both need the same two operations to be fast: insert a new item, and extract the top one. A heap does each in $O(\\lg n)$.',
      '"Smallest remaining time first" is a smallest-first rule, which suits a min-priority queue; the slides note that min-heaps are commonly used for priority queues.',
    ],
    answer: 'CPU scheduling (prioritising processes, e.g. shortest remaining time first) and interrupt handling (managing interrupts by severity or priority).',
    mistake: 'Naming Dijkstra or Huffman coding. Those are on the same slide but are computing applications, not operating-system ones.',
    tryIt: { q: 'Interrupts with severities 2, 7, 4, 9 arrive in that order. In what order does a max-priority queue hand them out? A plain FIFO queue?', a: 'Max-priority queue: 9, 7, 4, 2. FIFO: 2, 7, 4, 9.' },
  };
})(globalThis.FC = globalThis.FC || {});
