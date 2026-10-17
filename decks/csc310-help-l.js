// "Help" walkthroughs for the CSC 310 "Sorting in Linear Time" cards: the decision-tree
// lower bound they start from, counting sort, radix sort, bucket sort, and the summary table.
// Same entry format as decks/csc310-help.js (see the header comment there).
// Procedures follow M. Qasem's slides: CountingSort(A, B, k) with 1-based A and B, C[0..k],
// placement j = n downto 1; RadixSort(A, d) least significant digit first, a stable sort per
// digit; Bucket-Sort(A) with n buckets, key x into B[floor(n x)], insertion sort per bucket.
// Slide slips handled where relevant: her clear/prefix loops start at 1 and 2 although keys run
// 0..k; "L <= n!" should be L >= n!; lg(n!) = O(n lg n) is used where Omega is needed.
// No assignment problem is used; tryIt problems use other arrays. Every trace, pass and bucket
// below was checked with python3 (her pseudocode) on 2026-10-16.
(function (FC) {
  'use strict';
  const H = FC.help = FC.help || {};
  const lg = n => Math.log2(n);
  const lgFact = n => { let s = 0; for (let i = 2; i <= n; i++) s += Math.log2(i); return s; };

  // ---------------------------------------------------------------- Lower bound and the three sorts

  H['c310-linsort-tree-def'] = {
    asks: 'Give her definition of a decision tree: what kind of tree it is, what it represents, and for which algorithm and input size.',
    idea: 'Think of a sort as a game of yes/no questions. Each question is a comparison like "is A[1] < A[2]?", and the answer decides which question comes next. Draw every way the game can go for inputs of size $n$ and you have the decision tree.',
    steps: [
      'Fix one algorithm (say insertion sort) and one input size $n$. The tree describes that algorithm on that size only; another algorithm or another $n$ gives another tree.',
      { text: 'Read each part of the tree:', table: { head: ['part', 'stands for'], rows: [
        ['internal node', 'one comparison, e.g. "Is A[i] < A[j]?"'],
        ['branch', 'the result of that comparison (true / false)'],
        ['leaf', 'one possible sorted order: the algorithm’s conclusion'],
        ['root-to-leaf path', 'the comparisons made on one particular input'],
        ['height', 'the most comparisons on any input: the worst case']] } },
      'A comparison has exactly two outcomes, so every internal node has exactly two children. That is what "full binary tree" means.',
      'Why the course wants it: the tree must have a leaf for every possible output order, and its height is the worst-case number of comparisons. Bounding the height of every such tree bounds every comparison sort at once.',
    ],
    answer: 'A full binary tree that represents the comparisons between elements performed by a particular sorting algorithm on inputs of size $n$. Internal node = a comparison, branch = its result, leaf = a sorted order.',
    mistake: 'Leaving out "a particular algorithm, input size $n$". The tree is not a data structure the sort builds; it is the map of every comparison one algorithm can make for one $n$.',
    tryIt: { q: 'For $n = 3$ elements, how many leaves must a correct decision tree have, and why can its height not be 2?', a: 'There are $3! = 6$ input orders, so at least 6 leaves. A binary tree of height 2 has at most $2^2 = 4$ leaves, fewer than 6, so the height is at least 3: some input needs 3 comparisons.' },
  };

  H['c310-linsort-stirling'] = {
    asks: 'State Stirling’s approximation of $n!$, then use it to find how fast $\\lg(n!)$ grows.',
    idea: '$n! = 1 \\cdot 2 \\cdots n$ is a product of $n$ numbers. Taking $\\lg$ turns it into a sum of $n$ terms, each at most $\\lg n$, and the top half of them close to $\\lg n$. So $\\lg(n!)$ should behave like $n \\lg n$; Stirling’s formula makes that exact enough to prove.',
    steps: [
      'Stirling: $n! \\approx \\sqrt{2\\pi n}\\,(n/e)^n$. Her slide writes the same thing as $n^n e^{-n} \\sqrt{2\\pi n}$.',
      'Take $\\lg$ of both sides; logs turn products into sums and powers into multipliers: $\\lg(n!) \\approx \\lg\\sqrt{2\\pi n} + n \\lg(n/e)$.',
      'Split the last term: $n \\lg(n/e) = n \\lg n - n \\lg e \\approx n \\lg n - 1.44\\,n$. The first term is $\\tfrac{1}{2}\\lg(2\\pi n)$, which grows only like $\\lg n$.',
      'So $\\lg(n!) \\approx n \\lg n - 1.44\\,n + \\tfrac{1}{2}\\lg(2\\pi n)$. For large $n$ the $n \\lg n$ term outgrows the others, so $\\lg(n!) = \\Theta(n \\lg n)$.',
      { text: 'Check against exact values:', table: { head: ['$n$', '$\\lg(n!)$ exact', 'Stirling', '$n \\lg n$'], rows: [
        ['4', '4.58', '4.55', '8'], ['16', '44.25', '44.24', '64'], ['64', '296.00', '295.99', '384'], ['100', '524.76', '524.76', '664.39']] } },
      'Her slide writes $\\lg(n!) = O(n \\lg n)$. The lower bound needs the other direction, $\\lg(n!) = \\Omega(n \\lg n)$ ("at least about $n \\lg n$"); $\\Theta$ gives both.',
    ],
    graph: {
      caption: 'Bars: exact $\\lg(n!)$. The Stirling curve sits on top of them. $n \\lg n$ stays above but grows at the same rate (the ratio climbs toward 1), which is what $\\Theta(n \\lg n)$ says.',
      x: [2, 20], y: [0, 90], xLabel: 'n', yLabel: 'value',
      curves: [{ label: 'Stirling: $\\lg\\sqrt{2\\pi n} + n\\lg(n/e)$', f: n => 0.5 * lg(2 * Math.PI * n) + n * lg(n / Math.E), tone: 'a' }, { label: '$n \\lg n$', f: n => n * lg(n), tone: 'b' }],
      bars: { label: 'exact $\\lg(n!)$', tone: 'c', values: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20].map(n => [n, lgFact(n)]) },
    },
    answer: '$n! \\approx \\sqrt{2\\pi n}\\,(n/e)^n$, so $\\lg(n!) \\approx n \\lg n - 1.44\\,n + O(\\lg n)$, i.e. $\\lg(n!) = \\Theta(n \\lg n)$.',
    mistake: 'Copying only $O(n \\lg n)$ from the slide. The proof has $h \\ge \\lg(n!)$, so it needs $\\lg(n!) = \\Omega(n \\lg n)$; an upper bound on $\\lg(n!)$ says nothing about how tall $h$ must be.',
    tryIt: { q: 'Use Stirling to estimate $\\lg(16!)$, and compare it with $16 \\lg 16$.', a: '$\\tfrac{1}{2}\\lg(32\\pi) \\approx 3.33$ and $16(\\lg 16 - \\lg e) \\approx 16(4 - 1.44) = 40.92$, total $\\approx 44.2$ (exact 44.25). $16 \\lg 16 = 64$, so $\\lg(16!)$ is about $0.69 \\cdot n \\lg n$ here.' },
  };

  H['c310-linsort-three-order'] = {
    asks: 'Name the three sorts of her "Sorting in Linear Time" lecture in the order she teaches them, each with the assumption it makes about the keys.',
    idea: 'Each sort replaces comparisons with a fact about the keys. Small whole numbers can be used as array positions (counting), numbers with a fixed number of digits can be sorted one digit at a time (radix), and numbers spread evenly over a range can be dropped into equal-width bins (bucket).',
    steps: [
      'Counting sort first: keys are integers in $0..k$. Each key is used directly as an index into the count array C.',
      'Radix sort second: each key has $d$ digits, each digit from a small range. It runs a stable sort, counting sort, once per digit, so it is built on top of counting sort.',
      'Bucket sort third: keys are uniformly distributed over a known range such as $[0, 1)$. Key $x$ goes into bucket $\\lfloor n x \\rfloor$.',
      { text: 'Side by side:', table: { head: ['sort', 'assumption on keys', 'how a key is used'], rows: [
        ['counting', 'integers in $0..k$', 'as an index: C[A[j]] += 1'],
        ['radix', 'fixed number of digits $d$', 'one digit at a time, $d$ passes'],
        ['bucket', 'uniform over e.g. $[0, 1)$', 'to pick bucket $\\lfloor n x \\rfloor$']] } },
      'One way to remember the order: radix needs counting sort, so counting comes first; bucket is the only one that needs to know how the keys are spread, so it comes last.',
    ],
    answer: 'Counting sort (integer keys in $0..k$), radix sort (keys with a fixed number of digits $d$), bucket sort (keys uniformly distributed over a known range such as $[0, 1)$).',
    mistake: 'Swapping the radix and bucket assumptions. Radix needs a fixed digit count (SSNs, licence IDs); bucket needs the values spread evenly, and it is the only one that must know the distribution in advance.',
    tryIt: { q: 'Which sort fits each input: (a) 10,000 exam scores, integers 0–100; (b) 1,000 reals drawn evenly at random from $[0, 1)$; (c) 50,000 eight-digit student IDs?', a: '(a) counting sort with $k = 100$. (b) bucket sort: uniform over $[0, 1)$. (c) radix sort: $d = 8$ passes of counting sort on digits 0–9 (counting sort on the whole ID would need $k \\approx 10^8$).' },
  };

  H['c310-linsort-which-uniform'] = {
    asks: 'Of counting, radix and bucket sort, which one is only fast if you already know the keys are spread evenly (uniformly) over their range?',
    idea: 'Bucket sort is like sorting letters into $n$ pigeonholes by postal zone. If the letters are spread evenly, each hole gets about one letter and tidying each hole is instant. If every letter goes to the same hole, you are back to sorting one big pile.',
    steps: [
      'Counting sort assumes integer keys in $0..k$, and radix sort assumes $d$ digits. Neither says anything about how the values are spread.',
      'Bucket sort sends key $x \\in [0, 1)$ to bucket $\\lfloor n x \\rfloor$. Bucket $i$ covers $[i/n, (i+1)/n)$, a slice $1/n$ wide.',
      'If the keys are uniform, a slice of width $1/n$ expects $n \\cdot \\tfrac{1}{n} = 1$ key. Insertion sort on about one key is $O(1)$, so all buckets together cost $O(n)$.',
      { text: 'Two inputs with $n = 5$ (bucket $= \\lfloor 5x \\rfloor$):', table: { head: ['input', 'buckets used', 'largest bucket'], rows: [
        ['.13, .52, .91, .37, .70 (spread)', '0, 2, 4, 1, 3', '1 key'],
        ['.41, .43, .45, .47, .49 (bunched)', '2, 2, 2, 2, 2', '5 keys']] } },
      'In the bunched input one bucket holds all $n$ keys, and insertion sort on it can cost $\\Theta(n^2)$. Knowing in advance that the input is uniform is what rules this out.',
    ],
    answer: 'Bucket sort. It requires advance knowledge that the input is uniformly distributed over a known range (e.g. $[0, 1)$), so each bucket expects $O(1)$ keys.',
    mistake: 'Choosing counting sort because it "knows the range". Counting sort needs the range $0..k$ but not an even spread: it is $O(n + k)$ for any mix of values in that range.',
    tryIt: { q: 'Bucket sort with $n = 4$ on {.26, .31, .29, .27}. Which buckets are used, and what does that say about this input?', a: '$4x$ = 1.04, 1.24, 1.16, 1.08, so all four go to bucket 1, $[0.25, 0.5)$; buckets 0, 2, 3 stay empty. The input is not uniform, and bucket 1 needs a full insertion sort of all 4 keys.' },
  };

  H['c310-linsort-which-digits'] = {
    asks: 'Which linear-time sort fits keys that all have the same fixed number of digits, such as a 9-digit SSN or a driver’s licence ID?',
    idea: 'Counting sort on a whole SSN would need one counter for every possible SSN: a billion counters. Radix sort sorts on one digit at a time instead, and a digit has only 10 possible values. Nine cheap passes beat one enormous one.',
    steps: [
      'Try counting sort on the whole key first. Keys run from 0 to 999,999,999, so $k \\approx 10^9$ and C needs about a billion slots.',
      'Counting sort costs $O(n + k)$. For $n = 10{,}000$ people that is about $10^9$ steps, nearly all spent clearing and summing empty counters.',
      'Radix sort: $d = 9$ passes, each a counting sort on one digit, with 10 possible values. Total about $9(n + 10)$.',
      { text: 'For $n = 10{,}000$ keys:', table: { head: ['method', 'formula', 'steps'], rows: [
        ['counting sort on whole key', '$n + k$', '1,000,010,000'],
        ['radix sort, 9 digit passes', '$9(n + 10)$', '90,090'],
        ['merge sort (comparisons)', '$n \\lg n$', 'about 132,877']] } },
      'Bucket sort is built for keys known to be spread evenly over a range like $[0, 1)$. A fixed digit count is exactly radix sort’s assumption, and her slide gives SSNs and licence IDs as its example.',
    ],
    answer: 'Radix sort: one stable pass (counting sort) per digit. With $d$ fixed and each digit in a small range, it runs in $O(n)$.',
    mistake: 'Picking counting sort because the keys are integers. They are, but $k \\approx 10^9$, and counting sort’s time is $O(n + k)$, not $O(n)$.',
    tryIt: { q: 'Sort 2,000 six-digit account numbers (000000–999999). Compare the work of counting sort on the whole number with radix sort.', a: 'Counting sort: $n + k \\approx 2{,}000 + 10^6 = 1{,}002{,}000$. Radix sort: 6 passes of $n + 10$, so $6 \\cdot 2{,}010 = 12{,}060$. Radix sort does about 83 times less work.' },
  };

  H['c310-linsort-beat-bound'] = {
    asks: 'Every comparison sort needs $\\Omega(n \\lg n)$ comparisons in the worst case. How can any sort run faster than that?',
    idea: 'The lower bound is about the yes/no game: with only two-way answers you need about $\\lg(n!)$ questions to tell $n!$ orders apart. A sort that never asks "is a < b?" is not playing that game, so the bound says nothing about it.',
    steps: [
      'What the bound covers: algorithms that learn about order only by comparing pairs ("is A[i] < A[j]?"): insertion, merge, heap and quick sort.',
      'The proof: such an algorithm’s decision tree needs at least $n!$ leaves, so its height is $h \\ge \\lg(n!) = \\Omega(n \\lg n)$. Every step relies on each question having just two answers.',
      'Counting sort never compares two keys. It runs C[A[j]] += 1: the key itself is the array index, so one array access settles which of the $k + 1$ values the key has.',
      'The price is an assumption about the keys: integers in $0..k$ (counting), $d$ digits (radix), uniform spread (bucket). Without one, you cannot use a key as an index.',
    ],
    graph: {
      caption: 'Counting sort with $k = n$ does about $2n$ steps; a comparison sort needs about $n \\lg n$. The gap keeps growing, and the bound does not forbid it because counting sort makes no comparisons.',
      x: [2, 64], y: [0, 400], xLabel: 'n', yLabel: 'steps',
      curves: [{ label: 'comparison-sort bound: $n \\lg n$', f: n => n * lg(n), tone: 'b' }, { label: 'counting sort, $k = n$: $n + k = 2n$', f: n => 2 * n, tone: 'a' }],
    },
    answer: 'By not basing the sort on comparisons: use the key values themselves, e.g. as array indices. That requires assumptions about the keys (range $0..k$, $d$ digits, or uniform spread). The $\\Omega(n \\lg n)$ bound is proved only for comparison sorts.',
    mistake: 'Thinking the bound is "broken". It still holds for every comparison sort; the linear sorts sit outside the model it was proved for, and pay with assumptions about the input.',
    tryIt: { q: 'Can a sort that only compares keys sort any $n$ reals in $O(n)$ worst-case time? Can some sort handle $n$ integers known to lie in $0..50$ in $O(n)$?', a: 'Comparisons only: no, every comparison sort needs $\\Omega(n \\lg n)$ comparisons in the worst case. Integers in $0..50$: yes, counting sort with $k = 50$ takes $O(n + 50) = O(n)$.' },
  };

  // ---------------------------------------------------------------- Counting sort

  H['c310-linsort-counting-idea'] = {
    asks: 'Explain how counting sort puts each element into its place without ever comparing two elements.',
    idea: 'Picture a lineup by height. If you know exactly 7 people are no taller than you, you stand in spot 7, without comparing yourself to anyone. Counting sort finds "how many elements are $\\le x$" by counting, then drops $x$ straight into that spot.',
    steps: [
      'Assumption: keys are integers in $0..k$. So a key can be used as an index into an array C[0..k].',
      'Count: for each element, add 1 to C[its value]. On A = {2, 5, 3, 0, 2, 3, 0, 3}: C = 2, 0, 2, 3, 0, 1 (two 0s, no 1s, two 2s, three 3s, no 4s, one 5).',
      'Turn counts into "how many are $\\le i$" with running totals: C = 2, 2, 4, 7, 7, 8. For example C[3] = 7: seven elements are $\\le 3$.',
      'Place: a 3 goes to position 7 of the output B, the last spot for 3s. Then C[3] drops to 6, so the next 3 goes to position 6.',
      'One pass over A from right to left fills B = 0, 0, 2, 2, 3, 3, 3, 5. No two keys were ever compared.',
    ],
    answer: 'Keys are integers in $0..k$. Use array indexing to count how many times each value occurs; turn the counts into "number of elements $\\le x$"; that number is the output position for $x$, so place $x$ there directly.',
    mistake: 'Saying it counts the elements "smaller than $x$". The slide says smaller than or equal to $x$, and that count is $x$’s position in B (the last position for its value), counting from 1.',
    tryIt: { q: 'A = {3, 1, 0, 3, 1, 2}, k = 3. How many elements are $\\le 1$, and so which output position does the last 1 in A take?', a: 'One 0 and two 1s: $1 + 2 = 3$ elements are $\\le 1$. The last 1 (A[5]) goes to B[3]; the other 1 (A[2]) then goes to B[2].' },
  };

  H['c310-linsort-counting-order'] = {
    asks: 'Put the four loops of her CountingSort(A, B, k) in order.',
    idea: 'Four jobs, each needing the one before: wipe the tally sheet, tally, turn the tallies into "where each value’s seats end", then seat everyone. You cannot seat anyone until you know where the blocks end.',
    steps: [
      'Clear: C[i] = 0 for every value $i$. Counters must start at zero.',
      'Count: for j = 1 to n, C[A[j]] += 1. Now C[i] = how many elements equal $i$.',
      'Prefix sums: for i = 1 to k, C[i] = C[i] + C[i − 1]. Now C[i] = how many elements are $\\le i$.',
      'Place: for j = n downto 1, B[C[A[j]]] = A[j], then C[A[j]] −= 1. Each element goes to the last free slot for its value.',
      { text: 'C on her example A = {2, 5, 3, 0, 2, 3, 0, 3}, k = 5:', table: { head: ['after', 'C[0..5]'], rows: [
        ['clear', '0, 0, 0, 0, 0, 0'], ['count', '2, 0, 2, 3, 0, 1'], ['prefix sums', '2, 2, 4, 7, 7, 8'], ['place', '0, 2, 2, 4, 7, 7 (and B = 0, 0, 2, 2, 3, 3, 3, 5)']] } },
      'Her slide starts the clear loop at 1 and the prefix loop at 2. Keys run $0..k$, so C has a slot 0: the loops must start at 0 and at 1, as on this card.',
    ],
    answer: 'Clear C; count (j = 1 to n: C[A[j]] += 1); prefix sums (i = 1 to k: C[i] += C[i − 1]); place backwards (j = n downto 1: B[C[A[j]]] = A[j]; C[A[j]] −= 1).',
    mistake: 'Putting the prefix-sum loop before the counting loop. Running totals of all-zero counters are still zero; count first, then accumulate.',
    tryIt: { q: 'A = {2, 0, 2, 1, 0}, k = 2. Give C after each of the first three loops.', a: 'Clear: 0, 0, 0. Count: 2, 1, 2. Prefix sums: 2, 3, 5.' },
  };

  H['c310-linsort-counting-c-meaning'] = {
    asks: 'Say what C[i] means at two moments: right after the counting loop, and right after the prefix-sum loop.',
    idea: 'C starts as a tally sheet (how many of each value) and becomes a set of fence posts (where each value’s block of the output ends).',
    steps: [
      'The counting loop adds 1 to C[A[j]] once per element. So afterwards C[i] = the number of elements equal to $i$.',
      'The prefix loop adds C[i − 1] into C[i], left to right. So C[i] becomes (count of $i$) + (count of everything below $i$) = the number of elements $\\le i$.',
      { text: 'On A = {2, 5, 3, 0, 2, 3, 0, 3}:', table: { head: ['$i$', '0', '1', '2', '3', '4', '5'], rows: [
        ['equal to $i$', '2', '0', '2', '3', '0', '1'],
        ['$\\le i$', '2', '2', '4', '7', '7', '8'],
        ['block in B', '1–2', 'none', '3–4', '5–7', 'none', '8']] } },
      'Read C[3] = 7: seven elements are $\\le 3$, so the 3s fill B up to position 7. There are three 3s, so they sit at positions 5, 6, 7.',
      'So after the prefix sums, C[i] is the LAST output position for value $i$. The placement loop puts an $i$ there and decrements C[i], so the next $i$ goes one slot to the left.',
    ],
    answer: 'After counting: C[i] = the number of elements equal to $i$. After prefix sums: C[i] = the number of elements $\\le i$, which is the last position in B for value $i$.',
    mistake: 'Reading C[i] after the prefix sums as the FIRST position of value $i$. It is the last; the first is C[i − 1] + 1 (the 3s start at C[2] + 1 = 5).',
    tryIt: { q: 'A = {1, 3, 0, 1, 3, 3}, k = 3. Give C after counting and after prefix sums, and say which positions of B hold the 3s.', a: 'Counting: 1, 2, 0, 3. Prefix sums: 1, 3, 3, 6. The 3s fill positions C[2] + 1 = 4 through C[3] = 6.' },
  };

  H['c310-linsort-counting-slide-c'] = {
    asks: 'Run only the clear and counting loops on her example and report C[0..5]: how many times each value 0 to 5 appears in A.',
    idea: 'C is a row of six tally boxes labelled 0 to 5. Walk through A and, for each element, add one mark to the box with that element’s number.',
    steps: [
      'Clear loop: C = 0, 0, 0, 0, 0, 0 (indices 0..5, because k = 5).',
      { text: 'Counting loop, j = 1 to 8, doing C[A[j]] += 1:', table: { head: ['$j$', '$A[j]$', 'C[0..5] after'], rows: [
        ['1', '2', '0, 0, 1, 0, 0, 0'], ['2', '5', '0, 0, 1, 0, 0, 1'], ['3', '3', '0, 0, 1, 1, 0, 1'], ['4', '0', '1, 0, 1, 1, 0, 1'],
        ['5', '2', '1, 0, 2, 1, 0, 1'], ['6', '3', '1, 0, 2, 2, 0, 1'], ['7', '0', '2, 0, 2, 2, 0, 1'], ['8', '3', '2, 0, 2, 3, 0, 1']] } },
      'Check: $2 + 0 + 2 + 3 + 0 + 1 = 8 = n$. Every element was counted exactly once.',
    ],
    answer: '2, 0, 2, 3, 0, 1 (two 0s, no 1s, two 2s, three 3s, no 4s, one 5).',
    mistake: 'Listing counts only for values that appear (2, 2, 3, 1). C has a slot for every value $0..k$, so the zeros for 1 and 4 belong in the answer.',
    tryIt: { q: 'A = {4, 2, 2, 0, 4, 1, 2}, k = 4. Give C[0..4] after the counting loop.', a: '1, 1, 3, 0, 2 (one 0, one 1, three 2s, no 3s, two 4s); they add up to 7 = n.' },
  };

  H['c310-linsort-counting-slide-prefix'] = {
    asks: 'Start from the counts C = 2, 0, 2, 3, 0, 1 and run the prefix-sum loop. Give the new C[0..5].',
    idea: 'Running totals: each box gets everything to its left added in. Like a scoreboard that shows the total so far rather than this round’s points.',
    steps: [
      'Start: C = 2, 0, 2, 3, 0, 1. C[0] stays 2, since nothing is to its left.',
      { text: 'For i = 1 to 5, C[i] = C[i] + C[i − 1]:', table: { head: ['$i$', 'C[i] + C[i − 1]', 'new C[i]'], rows: [
        ['1', '0 + 2', '2'], ['2', '2 + 2', '4'], ['3', '3 + 4', '7'], ['4', '0 + 7', '7'], ['5', '1 + 7', '8']] } },
      'Each step adds the NEW C[i − 1] just computed, so the totals keep building from left to right.',
      'Check: C[5] = 8 = n. The total for the largest value must equal the number of elements.',
      'Her slide runs this loop from i = 2. Because keys start at 0, it must start at i = 1, or C[1] would stay 0 instead of 2.',
    ],
    answer: '2, 2, 4, 7, 7, 8. C[i] is now the number of elements $\\le i$.',
    mistake: 'Adding the OLD count of the left neighbour (C[3] = 3 + 2 = 5). The loop adds the already-updated C[2] = 4, so C[3] = 3 + 4 = 7.',
    tryIt: { q: 'The counts are C = 1, 1, 3, 0, 2 (from A = {4, 2, 2, 0, 4, 1, 2}, k = 4). Give C after the prefix-sum loop.', a: '1, 2, 5, 5, 7: $1$, $1 + 1$, $3 + 2$, $0 + 5$, $2 + 5$. The last entry is 7 = n.' },
  };

  H['c310-linsort-counting-slide-first'] = {
    asks: 'The placement loop starts at the right end of A. Into which index of B does A[8] = 3 go?',
    idea: 'C[3] = 7 says the block of 3s in B ends at position 7. Walking A from the right, the first 3 you meet is the last 3 of the input, so it takes the last seat in that block.',
    steps: [
      'The line is B[C[A[j]]] = A[j] with j = 8, and A[8] = 3.',
      'Look up C[A[8]] = C[3] = 7, so B[7] = 3.',
      'Then C[A[j]] −= 1 makes C[3] = 6. C is now 2, 2, 4, 6, 7, 8.',
      { text: 'The first three placements (· = empty slot of B):', table: { head: ['$j$', '$A[j]$', 'goes to', 'C after', 'B[1..8] after'], rows: [
        ['8', '3', 'B[7]', '2, 2, 4, 6, 7, 8', '· · · · · · 3 ·'],
        ['7', '0', 'B[2]', '1, 2, 4, 6, 7, 8', '· 0 · · · · 3 ·'],
        ['6', '3', 'B[6]', '1, 2, 4, 5, 7, 8', '· 0 · · · 3 3 ·']] } },
      'The next 3 met (A[6]) lands one slot to the left, at B[6]. The 3s fill their block from right to left, keeping their input order.',
    ],
    answer: '7: B[C[3]] = B[7] = 3, and then C[3] becomes 6.',
    mistake: 'Answering 8 because j = 8 or because it is the last element. The slot comes from C[A[j]] = C[3] = 7, not from $j$.',
    tryIt: { q: 'A = {3, 0, 2, 3, 1, 0, 2}, k = 3, prefix sums C = 2, 3, 5, 7. Where does A[7] go, and what is C afterwards?', a: 'A[7] = 2 and C[2] = 5, so B[5] = 2. Then C[2] drops to 4: C = 2, 3, 4, 7.' },
  };

  H['c310-linsort-counting-slide-out'] = {
    asks: 'Finish the whole run on her example and give the sorted output B[1..8].',
    idea: 'After the prefix sums, C tells you where each value’s block ends. The last loop walks A from right to left and fills each block from its right end.',
    steps: [
      'Counts: C = 2, 0, 2, 3, 0, 1. Prefix sums: C = 2, 2, 4, 7, 7, 8.',
      { text: 'Placement loop, j = 8 down to 1 (· = empty):', table: { head: ['$j$', '$A[j]$', 'goes to', 'C after', 'B[1..8] after'], rows: [
        ['8', '3', 'B[7]', '2, 2, 4, 6, 7, 8', '· · · · · · 3 ·'],
        ['7', '0', 'B[2]', '1, 2, 4, 6, 7, 8', '· 0 · · · · 3 ·'],
        ['6', '3', 'B[6]', '1, 2, 4, 5, 7, 8', '· 0 · · · 3 3 ·'],
        ['5', '2', 'B[4]', '1, 2, 3, 5, 7, 8', '· 0 · 2 · 3 3 ·'],
        ['4', '0', 'B[1]', '0, 2, 3, 5, 7, 8', '0 0 · 2 · 3 3 ·'],
        ['3', '3', 'B[5]', '0, 2, 3, 4, 7, 8', '0 0 · 2 3 3 3 ·'],
        ['2', '5', 'B[8]', '0, 2, 3, 4, 7, 7', '0 0 · 2 3 3 3 5'],
        ['1', '2', 'B[3]', '0, 2, 2, 4, 7, 7', '0 0 2 2 3 3 3 5']] } },
      'Quick check from the prefix sums alone: 0s end at 2, 2s end at 4, 3s end at 7, the 5 ends at 8. That gives B = 0, 0, 2, 2, 3, 3, 3, 5.',
    ],
    answer: '0, 0, 2, 2, 3, 3, 3, 5.',
    mistake: 'Shifting every index by one (writing to B[C[x] − 1]). In her pseudocode B is 1-based, so C[x] is used directly as the index.',
    tryIt: { q: 'A = {3, 1, 0, 3, 1, 2}, k = 3. Give the prefix sums and the output B.', a: 'Counts 1, 2, 1, 2; prefix sums 1, 3, 4, 6. B = 0, 1, 1, 2, 3, 3 (the first placement is A[6] = 2 into B[4]).' },
  };

  H['c310-linsort-counting-prac-prefix'] = {
    asks: 'Run the first three loops on A = {1, 4, 1, 2, 0, 4, 2, 1} with k = 4 and give C[0..4] after the prefix sums.',
    idea: 'Two passes: tally each value, then turn the tallies into running totals. The last total must equal $n = 8$.',
    steps: [
      'Clear: C = 0, 0, 0, 0, 0 (five slots, for values 0..4).',
      'Count: one 0 (A[5]); three 1s (A[1], A[3], A[8]); two 2s (A[4], A[7]); no 3s; two 4s (A[2], A[6]). C = 1, 3, 2, 0, 2.',
      { text: 'Prefix sums, C[i] = C[i] + C[i − 1]:', table: { head: ['$i$', 'C[i] + C[i − 1]', 'new C[i]'], rows: [
        ['0', '(unchanged)', '1'], ['1', '3 + 1', '4'], ['2', '2 + 4', '6'], ['3', '0 + 6', '6'], ['4', '2 + 6', '8']] } },
      'Check: C[4] = 8 = n. Meaning: 1 element is $\\le 0$, 4 are $\\le 1$, 6 are $\\le 2$, 6 are $\\le 3$, 8 are $\\le 4$.',
    ],
    answer: '1, 4, 6, 6, 8.',
    mistake: 'Skipping the slot for 3 because no 3 appears in A. C[3] still exists, and it gets the running total 6.',
    tryIt: { q: 'A = {1, 0, 3, 1, 2, 1}, k = 3. Give C after counting and after the prefix sums.', a: 'Counting: 1, 3, 1, 1. Prefix sums: 1, 4, 5, 6.' },
  };

  H['c310-linsort-counting-prac-last'] = {
    asks: 'Prefix sums are C = 1, 4, 6, 6, 8, and the placement loop starts at j = 8. Into which index of B does A[8] = 1 go?',
    idea: 'C[1] = 4: four elements are $\\le 1$, so the block of 1s ends at position 4. A[8] is the last 1 in A, so it takes the last seat for 1s.',
    steps: [
      'j = 8, A[8] = 1. C[A[8]] = C[1] = 4, so B[4] = 1.',
      'Then C[1] −= 1 makes C[1] = 3: C = 1, 3, 6, 6, 8.',
      { text: 'Follow only the 1s through the rest of the loop:', table: { head: ['$j$', '$A[j]$', 'goes to', 'C[1] after'], rows: [
        ['8', '1', 'B[4]', '3'], ['3', '1', 'B[3]', '2'], ['1', '1', 'B[2]', '1']] } },
      'The 1s that were first, second and third in A end up at B[2], B[3], B[4]: the same order as in the input. That is stability.',
      'The whole output is B = 0, 1, 1, 1, 2, 2, 4, 4.',
    ],
    answer: '4: B[C[1]] = B[4], then C[1] becomes 3.',
    mistake: 'Putting it at B[2], the first slot for 1s, because 1 is a small value. The loop always uses C[x], which after the prefix sums is the LAST free slot for $x$.',
    tryIt: { q: 'A = {4, 2, 2, 0, 4, 1, 2}, k = 4, prefix sums C = 1, 2, 5, 5, 7. Where do A[7], A[3] and A[2] (all 2s) go?', a: 'A[7] → B[C[2]] = B[5], then C[2] = 4; A[3] → B[4], then C[2] = 3; A[2] → B[3]. The 2s keep their input order in B[3..5].' },
  };

  H['c310-linsort-counting-prac-out'] = {
    asks: 'For A = {3, 0, 1, 3, 2, 0, 3} with k = 3, give C[0..3] after the prefix-sum loop.',
    idea: 'Tally the four values, then turn the tallies into running totals. The last total is $n = 7$.',
    steps: [
      'Count: 0 twice (A[2], A[6]); 1 once (A[3]); 2 once (A[5]); 3 three times (A[1], A[4], A[7]). C = 2, 1, 1, 3.',
      { text: 'Prefix sums:', table: { head: ['$i$', 'C[i] + C[i − 1]', 'new C[i]'], rows: [
        ['0', '(unchanged)', '2'], ['1', '1 + 2', '3'], ['2', '1 + 3', '4'], ['3', '3 + 4', '7']] } },
      'Check: C[3] = 7 = n. So 2 elements are $\\le 0$, 3 are $\\le 1$, 4 are $\\le 2$, 7 are $\\le 3$.',
      { text: 'Finishing the sort with these positions (j = 7 down to 1):', table: { head: ['$j$', '$A[j]$', 'goes to', 'C after', 'B[1..7] after'], rows: [
        ['7', '3', 'B[7]', '2, 3, 4, 6', '· · · · · · 3'],
        ['6', '0', 'B[2]', '1, 3, 4, 6', '· 0 · · · · 3'],
        ['5', '2', 'B[4]', '1, 3, 3, 6', '· 0 · 2 · · 3'],
        ['4', '3', 'B[6]', '1, 3, 3, 5', '· 0 · 2 · 3 3'],
        ['3', '1', 'B[3]', '1, 2, 3, 5', '· 0 1 2 · 3 3'],
        ['2', '0', 'B[1]', '0, 2, 3, 5', '0 0 1 2 · 3 3'],
        ['1', '3', 'B[5]', '0, 2, 3, 4', '0 0 1 2 3 3 3']] } },
    ],
    answer: '2, 3, 4, 7. (The sort then gives B = 0, 0, 1, 2, 3, 3, 3.)',
    mistake: 'Giving the counts (2, 1, 1, 3) instead of the running totals. The question asks for C after the prefix-sum loop.',
    tryIt: { q: 'A = {3, 0, 2, 3, 1, 0, 2}, k = 3. Give C after the prefix-sum loop.', a: 'Counts 2, 1, 2, 2; prefix sums 2, 3, 5, 7.' },
  };

  H['c310-linsort-stable-def'] = {
    asks: 'Define what it means for a sorting algorithm to be stable.',
    idea: 'Sort a class list by grade. Ana and Ben both got an A, and Ana was listed above Ben. A stable sort keeps Ana above Ben: ties keep the order they came in.',
    steps: [
      'Stability is only about equal keys. Elements with different keys are ordered by key, as in any sort.',
      { text: 'Her example with labels on the equal keys (the sort reads only the numbers):', table: { head: ['', 'order'], rows: [
        ['input', '2a 5 3a 0a 2b 3b 0b 3c'],
        ['counting sort (stable)', '0a 0b 2a 2b 3a 3b 3c 5'],
        ['same loop run forward (not stable)', '0b 0a 2b 2a 3c 3b 3a 5']] } },
      'Both outputs are sorted by number. Only the stable one keeps a before b before c inside each group of equal keys.',
      'Why it matters in this lecture: radix sort sorts one digit at a time and relies on ties keeping the order the previous pass left.',
    ],
    answer: 'Elements with equal keys appear in the output in the same relative order as they had in the input.',
    mistake: 'Mixing up stable and in place: in place is about extra memory, stable is about the order of equal keys. Counting sort is stable but not in place.',
    tryIt: { q: 'Sort the pairs (2, x), (1, y), (2, z), (1, w) by number only. Give the stable result.', a: '(1, y), (1, w), (2, x), (2, z): y came before w and x before z in the input, so they stay that way.' },
  };

  H['c310-linsort-counting-why-backwards'] = {
    asks: 'Explain why counting sort’s last loop runs j = n down to 1 instead of 1 up to n.',
    idea: 'C[x] points at the right end of x’s block and moves left after each use, so the block fills from right to left. To keep equal keys in input order, you must hand them over right to left too: last occurrence first.',
    steps: [
      'After the prefix sums, C[x] is the LAST slot for value $x$. Each placement uses it, then decrements it.',
      'Going j = n down to 1, the first $x$ met is the last $x$ in A, so it takes the last slot. The $x$ before it in A takes the slot before, and input order is kept.',
      { text: 'Her example: the 3s are A[3], A[6], A[8]; call them 3a, 3b, 3c. Their block is B[5..7].', table: { head: ['loop', '3s met in order', 'slots used', 'B[5..7]'], rows: [
        ['j = n downto 1 (hers)', '3c, 3b, 3a', '7, 6, 5', '3a 3b 3c'],
        ['j = 1 to n', '3a, 3b, 3c', '7, 6, 5', '3c 3b 3a']] } },
      'Both directions sort the values correctly. Only the backward loop keeps equal keys in order, so only it is stable.',
      'Radix sort needs every pass to be stable, so the direction is part of the algorithm, not a style choice.',
    ],
    answer: 'C[x] gives the last free slot for $x$ and is decremented after each use. Scanning A backwards puts the last $x$ in the last slot, the one before it in the slot before, and so on, so equal keys keep their input order: the sort is stable.',
    mistake: 'Thinking the direction decides whether the output is sorted. Either direction sorts the values; the forward loop only reverses the order of equal keys.',
    tryIt: { q: 'A = {1a, 0, 1b}, k = 1, prefix sums C = 1, 3. Run the placement loop FORWARD (j = 1 to 3). What is B?', a: '1a → B[3] (C[1] becomes 2); 0 → B[1]; 1b → B[2]. B = 0, 1b, 1a: the two 1s came out reversed, so the forward loop is not stable.' },
  };

  H['c310-linsort-counting-time'] = {
    asks: 'Give counting sort’s running time for $n$ keys whose values lie in $0..k$.',
    idea: 'Add up the loops. Two loops walk the $n$ elements, two loops walk the $k + 1$ counters, and nothing is nested, so the costs add: $n + k$.',
    steps: [
      { text: 'Cost of each loop:', table: { head: ['loop', 'iterations', 'cost'], rows: [
        ['clear C[0..k]', '$k + 1$', '$O(k)$'], ['count', '$n$', '$O(n)$'], ['prefix sums', '$k$', '$O(k)$'], ['place into B', '$n$', '$O(n)$']] } },
      'Each iteration does a constant amount of work: one or two array reads and writes.',
      'Total: $O(k) + O(n) + O(k) + O(n) = O(n + k)$. No loop depends on the order of the input, so worst, average and best case are all $O(n + k)$.',
      'It is linear when $k = O(n)$. For example, if $k \\le n$ then $n + k \\le 2n$, which is $O(n)$.',
      'If $k$ grows faster than $n$ (say $k = n^2$), the $k$ term dominates and counting sort is slower than an $n \\lg n$ comparison sort. The graph shows both cases.',
    ],
    graph: {
      caption: 'With $k = n$, counting sort ($2n$) is a straight line well under $n \\lg n$. With $k = n^2$ it shoots past $n \\lg n$ almost at once: the $k$ term is real.',
      x: [2, 40], y: [0, 400], xLabel: 'n', yLabel: 'steps',
      curves: [{ label: '$k = n$: $n + k = 2n$', f: n => 2 * n, tone: 'a' }, { label: '$n \\lg n$', f: n => n * lg(n), tone: 'b' }, { label: '$k = n^2$: $n + n^2$', f: n => n + n * n, tone: 'c' }],
    },
    answer: '$O(n + k)$ (in fact $\\Theta(n + k)$). It is $O(n)$ when $k = O(n)$.',
    mistake: 'Calling it $O(n)$ with no condition. The $k$ is real: when $k$ is much bigger than $n$, the clear and prefix loops over C dominate.',
    tryIt: { q: '$n = 1{,}000$ keys. Count the iterations of all four loops for $k = 99$ and for $k = 999{,}999$.', a: '$k = 99$: $100 + 1000 + 99 + 1000 = 2199$. $k = 999{,}999$: $1{,}000{,}000 + 1000 + 999{,}999 + 1000 = 2{,}001{,}999$, almost all of it the two loops over C.' },
  };

  H['c310-linsort-counting-props'] = {
    asks: 'Is counting sort stable? Is it in place? Choose the pair that is true.',
    idea: 'In place means the sort works inside A with only a constant amount of extra memory. Counting sort writes its result into a second array B and keeps a third array C, so it is not in place. Stability comes from the backward placement loop.',
    steps: [
      'In place: apart from A, only $O(1)$ extra storage. Counting sort allocates B ($n$ slots) and C ($k + 1$ slots), which is $O(n + k)$ extra.',
      'So it is not in place. Her slide lists "doesn’t sort in place" and "requires $O(n + k)$ extra storage" as cons.',
      'Stable: the j = n downto 1 loop fills each value’s block from the right, starting with that value’s last occurrence, so equal keys keep their input order.',
      { text: 'For comparison with sorts from earlier lectures:', table: { head: ['sort', 'stable', 'in place'], rows: [
        ['counting sort', 'yes', 'no'], ['insertion sort', 'yes', 'yes'], ['merge sort', 'yes', 'no'], ['heapsort', 'no', 'yes']] } },
    ],
    answer: 'Stable, not in place.',
    mistake: 'Thinking "no comparisons" means "no extra memory". Counting sort trades memory for speed: B and C are the price of skipping comparisons.',
    tryIt: { q: 'Counting sort on $n = 500$ keys with values in $0..99$: how many extra array slots does it use?', a: 'B has 500 slots and C has 100 (indices 0..99): 600 extra slots, which is $O(n + k)$.' },
  };

  H['c310-linsort-counting-bad-k'] = {
    asks: 'Apply the running time $O(n + k)$ when the keys range over $0..n^2$, so $k = n^2$.',
    idea: 'Counting sort pays one step per possible value, not just per element. With $n^2$ possible values most counters stay empty, but the clear and prefix loops still visit every one of them.',
    steps: [
      'Counting sort’s running time is $O(n + k)$.',
      'Substitute $k = n^2$: $O(n + n^2)$.',
      'For $n \\ge 1$, $n \\le n^2$, so $n + n^2 \\le 2n^2$. Hence $O(n + n^2) = O(n^2)$.',
      { text: 'Compare with a comparison sort:', table: { head: ['$n$', '$n + n^2$', '$n \\lg n$'], rows: [
        ['10', '110', 'about 33'], ['100', '10,100', 'about 664'], ['1000', '1,001,000', 'about 9,966']] } },
      'That is worse than merge sort’s $O(n \\lg n)$. Radix sort fixes it by splitting each key into digits with a small range, so each pass has a small $k$.',
    ],
    graph: {
      caption: 'With $k = n^2$, counting sort’s work ($n + n^2$) climbs far above $n \\lg n$. Counting sort is only linear when $k = O(n)$, like the bottom line.',
      x: [2, 20], y: [0, 450], xLabel: 'n', yLabel: 'steps',
      curves: [{ label: '$k = n^2$: $n + n^2$', f: n => n + n * n, tone: 'c' }, { label: '$n \\lg n$', f: n => n * lg(n), tone: 'b' }, { label: '$k = n$: $2n$', f: n => 2 * n, tone: 'a' }],
    },
    answer: '$O(n^2)$: $O(n + k)$ with $k = n^2$. Counting sort pays off only when $k = O(n)$.',
    mistake: 'Answering $O(n)$ because "counting sort is linear". It is linear only when $k = O(n)$; here $k$ grows much faster than $n$.',
    tryIt: { q: 'Counting sort on $n$ integers whose values lie in $0..100n$. What is the running time?', a: '$O(n + 100n) = O(101\\,n) = O(n)$. Here $k = 100n$ is still $O(n)$, so the sort stays linear, with a large constant.' },
  };

  H['c310-linsort-counting-proscons'] = {
    asks: 'List the three cons of counting sort from her slide.',
    idea: 'Each con comes from how it works. It writes into new arrays (so it is not in place and needs extra storage), and it uses keys as array indices (so keys must be countable: integers in a known range).',
    steps: [
      'Doesn’t sort in place: the sorted result goes into a second array B, not back into A.',
      'Elements must be countable: C[A[j]] uses the key as an index, so keys must be integers in $0..k$. There is no C[2.5] or C["apple"].',
      'Requires $O(n + k)$ extra storage: B has $n$ slots and C has $k + 1$.',
      { text: 'Her slide in one table:', table: { head: ['pros', 'cons'], rows: [
        ['fast', 'doesn’t sort in place'], ['asymptotically fast: $O(n + k)$', 'elements must be countable'], ['simple to code', 'requires $O(n + k)$ extra storage']] } },
    ],
    answer: 'It doesn’t sort in place; elements must be countable; it requires $O(n + k)$ extra storage.',
    mistake: 'Listing "not stable" as a con. Counting sort IS stable, which is exactly why radix sort uses it.',
    tryIt: { q: 'Which con stops counting sort on {2.5, 0.75, 1.25}? How could you rescue it if every value is a multiple of 0.25 in $[0, 3]$?', a: 'Elements must be countable (integer keys). Multiply each by 4: the keys become 10, 3, 5, integers in $0..12$, so counting sort with $k = 12$ works.' },
  };

  // ---------------------------------------------------------------- Radix sort

  H['c310-linsort-radix-idea'] = {
    asks: 'Describe her RadixSort(A, d) for keys that have $d$ digits.',
    idea: 'Sort a pile of numbered cards by the ones digit, then by the tens, then by the hundreds, keeping ties in their current order every time. It feels backwards, but the most important digit goes last so it gets the final say; the earlier passes only settle ties.',
    steps: [
      'Pseudocode: for i = 1 to d: StableSort(A) on digit i. Digit 1 is the least significant one (the ones digit).',
      'Each pass looks at one digit only and uses a stable sort; counting sort with 10 possible digit values is the course’s choice.',
      { text: 'Her example, one column per pass:', table: { head: ['input', 'after ones', 'after tens', 'after hundreds'], rows: [
        ['329', '720', '720', '329'], ['457', '355', '329', '355'], ['657', '436', '436', '436'], ['839', '457', '839', '457'],
        ['436', '657', '355', '657'], ['720', '329', '457', '720'], ['355', '839', '657', '839']] } },
      'After pass $i$ the list is sorted by its last $i$ digits. After pass $d$ it is sorted by all $d$ digits, i.e. fully sorted.',
    ],
    answer: 'RadixSort(A, d): for i = 1 to d, stably sort A on digit $i$, starting with the least significant digit. That is $d$ passes, each a stable sort such as counting sort.',
    mistake: 'Starting with the most significant digit. The hundreds pass must come last so that it decides the final order; the earlier passes only break its ties.',
    tryIt: { q: 'Radix sort {81, 24, 57, 13, 92, 45}: give the list after each pass.', a: 'Ones pass: 81, 92, 13, 24, 45, 57. Tens pass: 13, 24, 45, 57, 81, 92 (sorted).' },
  };

  H['c310-linsort-radix-slide-1'] = {
    asks: 'Do the first pass of radix sort on her example: stably sort the list by the ones digit only.',
    idea: 'Look only at the last digit of each number and sort by that, as if the other digits were invisible. When two numbers share a last digit, keep them in the order they already have.',
    steps: [
      { text: 'Read off each ones digit:', table: { head: ['number', '329', '457', '657', '839', '436', '720', '355'], rows: [['ones digit', '9', '7', '7', '9', '6', '0', '5']] } },
      'Sort by that digit: 0 (720), 5 (355), 6 (436), 7 (457, 657), 9 (329, 839).',
      'Ties: 457 came before 657 in the input, and 329 before 839, so they stay that way. That is the stable sort at work.',
    ],
    answer: '720, 355, 436, 457, 657, 329, 839.',
    mistake: 'Sorting by the hundreds digit first, or ordering the tie 329/839 by the whole number. Radix sort starts at the least significant digit, and ties keep their current order.',
    tryIt: { q: 'Radix sort {412, 305, 781, 226, 690, 153}: give the list after the ones-digit pass.', a: 'Ones digits 2, 5, 1, 6, 0, 3, so: 690, 781, 412, 153, 305, 226.' },
  };

  H['c310-linsort-radix-slide-2'] = {
    asks: 'Start from the list after the ones pass, {720, 355, 436, 457, 657, 329, 839}, and stably sort it by the tens digit.',
    idea: 'Group the numbers by their tens digit, and inside each group keep the order they are in now. That current order already has the ones digits sorted, so you keep that work.',
    steps: [
      { text: 'Read off each tens digit (in the current order):', table: { head: ['number', '720', '355', '436', '457', '657', '329', '839'], rows: [['tens digit', '2', '5', '3', '5', '5', '2', '3']] } },
      'Group by tens digit, keeping the current order inside each group: 2 → 720, 329; 3 → 436, 839; 5 → 355, 457, 657.',
      'Read the groups in digit order: 720, 329, 436, 839, 355, 457, 657.',
      'Check: the last two digits now read 20, 29, 36, 39, 55, 57, 57, in order. The list is sorted by its last two digits, as it should be after two passes.',
    ],
    answer: '720, 329, 436, 839, 355, 457, 657.',
    mistake: 'Putting 329 before 720 because 329 is the smaller number. Within a tie on the tens digit, keep the order from the previous pass: 720 was ahead of 329.',
    tryIt: { q: 'After the ones pass a list is {690, 781, 412, 153, 305, 226}. Give it after the tens pass.', a: 'Tens digits 9, 8, 1, 5, 0, 2, so: 305, 412, 226, 153, 781, 690.' },
  };

  H['c310-linsort-radix-prac-1'] = {
    asks: 'Do the first radix-sort pass on {512, 108, 341, 219, 830, 425, 617}: stably sort by the ones digit.',
    idea: 'Cover all but the last digit of each number and sort by what is left showing. Ties, if any, keep their current order.',
    steps: [
      { text: 'Read off each ones digit:', table: { head: ['number', '512', '108', '341', '219', '830', '425', '617'], rows: [['ones digit', '2', '8', '1', '9', '0', '5', '7']] } },
      'Sort by that digit: 0 (830), 1 (341), 2 (512), 5 (425), 7 (617), 8 (108), 9 (219).',
      'No two numbers share a ones digit, so stability plays no part in this pass. It will in the next one.',
    ],
    answer: '830, 341, 512, 425, 617, 108, 219.',
    mistake: 'Sorting by the first digit (giving 108 first). The first pass of radix sort uses the least significant digit.',
    tryIt: { q: 'Radix sort {732, 415, 128, 906, 350, 647}: give the list after the ones-digit pass.', a: 'Ones digits 2, 5, 8, 6, 0, 7, so: 350, 732, 415, 906, 647, 128.' },
  };

  H['c310-linsort-radix-prac-2'] = {
    asks: 'Start from {830, 341, 512, 425, 617, 108, 219} (the list after the ones pass) and stably sort it by the tens digit.',
    idea: 'Group by the tens digit; inside each group keep the current order, because that order already has the ones digits sorted.',
    steps: [
      { text: 'Read off each tens digit (in the current order):', table: { head: ['number', '830', '341', '512', '425', '617', '108', '219'], rows: [['tens digit', '3', '4', '1', '2', '1', '0', '1']] } },
      'Groups in digit order: 0 → 108; 1 → 512, 617, 219 (their current order); 2 → 425; 3 → 830; 4 → 341.',
      'Read them off: 108, 512, 617, 219, 425, 830, 341.',
      'Check: the last two digits read 08, 12, 17, 19, 25, 30, 41, in order. The hundreds pass would then give 108, 219, 341, 425, 512, 617, 830.',
    ],
    answer: '108, 512, 617, 219, 425, 830, 341.',
    mistake: 'Putting 219 first in the tens-digit-1 group because it is the smallest number. Inside a group the order from the ones pass stays: 512 (ones 2), 617 (ones 7), 219 (ones 9).',
    tryIt: { q: 'After the ones pass a list is {350, 732, 415, 906, 647, 128}. Give it after the tens pass.', a: 'Tens digits 5, 3, 1, 0, 4, 2, so: 906, 415, 128, 732, 647, 350.' },
  };

  H['c310-linsort-radix-prac-3'] = {
    asks: 'Do the first radix-sort pass on the two-digit list {47, 12, 93, 35, 61, 28}: stably sort by the ones digit.',
    idea: 'Two-digit keys need two passes: ones digit first, then tens. The first pass sorts by the last digit only.',
    steps: [
      { text: 'Read off each ones digit:', table: { head: ['number', '47', '12', '93', '35', '61', '28'], rows: [['ones digit', '7', '2', '3', '5', '1', '8']] } },
      'Sort by that digit: 1 (61), 2 (12), 3 (93), 5 (35), 7 (47), 8 (28).',
      { text: 'Both passes, for the full picture:', table: { head: ['input', 'after ones', 'after tens'], rows: [
        ['47', '61', '12'], ['12', '12', '28'], ['93', '93', '35'], ['35', '35', '47'], ['61', '47', '61'], ['28', '28', '93']] } },
    ],
    answer: '61, 12, 93, 35, 47, 28. (The tens pass then gives 12, 28, 35, 47, 61, 93.)',
    mistake: 'Giving the fully sorted list (12, 28, …) as the answer to the first pass. After one pass the list is sorted by the ones digit only.',
    tryIt: { q: 'Radix sort {64, 31, 58, 22, 97, 40}: give the list after each pass.', a: 'Ones pass: 40, 31, 22, 64, 97, 58. Tens pass: 22, 31, 40, 58, 64, 97.' },
  };

  H['c310-linsort-radix-why-stable'] = {
    asks: 'Explain why every pass of radix sort must use a stable sort.',
    idea: 'When two numbers tie on the current digit, the only thing that can still put them in the right order is the order the earlier passes left them in. A stable sort keeps that order; an unstable one may throw it away.',
    steps: [
      'After the tens pass on her example: 720, 329, 436, 839, 355, 457, 657. It is sorted by the last two digits.',
      'Hundreds pass: 329 and 355 tie (both have 3). Which comes first depends on the lower digits (29 < 55), and the tens pass already put 329 ahead of 355.',
      'A stable sort keeps 329 ahead of 355, so the result is 329, 355, 436, 457, 657, 720, 839: sorted.',
      { text: 'An unstable sort is allowed to reverse ties. Suppose it does:', table: { head: ['hundreds pass', 'result'], rows: [
        ['stable', '329, 355, 436, 457, 657, 720, 839'],
        ['unstable (ties reversed)', '355, 329, 457, 436, 657, 720, 839']] } },
      'The unstable result has 355 before 329 and 457 before 436: not sorted. The ones and tens passes did their work for nothing.',
    ],
    answer: 'Keys that tie on the current digit must keep the order the earlier (less significant) passes gave them. That order is the only record of the lower digits; an unstable sort could scramble it.',
    mistake: 'Treating stability as a nice extra. In radix sort it is what makes the result correct.',
    tryIt: { q: 'After the ones pass, 31 is ahead of 34. They tie on the tens digit. What does a stable tens pass do with them, and what can an unstable one do?', a: 'Stable: keeps 31, 34, which is correct. Unstable: may output 34, 31, which is wrong, even though that pass did sort correctly by its own digit.' },
  };

  H['c310-linsort-radix-which-sort'] = {
    asks: 'Which stable sort does the course use for each pass of radix sort, and how long does one pass take?',
    idea: 'One pass sorts $n$ numbers by one digit, and a digit has only a few possible values (10 for decimal). Small integer keys are exactly what counting sort is built for, and counting sort is stable.',
    steps: [
      'A pass needs a sort that is stable (so earlier passes are not undone) and fast on small integer keys.',
      'Counting sort is both: stable thanks to its backward loop, and $O(n + k)$ where $k$ is the number of possible digit values.',
      { text: 'Counting sort on the ones digits of her example (329, 457, 657, 839, 436, 720, 355):', table: { head: ['digit', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'], rows: [
        ['count', '1', '0', '0', '0', '0', '1', '1', '2', '0', '2'],
        ['prefix', '1', '1', '1', '1', '1', '2', '3', '5', '5', '7']] } },
      'Placing backwards with these positions gives 720, 355, 436, 457, 657, 329, 839: exactly the first column of her radix example.',
      'For decimal digits $k = 10$, so one pass costs $O(n + 10) = O(n)$.',
    ],
    answer: 'Counting sort. One pass over $n$ numbers whose digits have $k$ possible values takes $O(n + k)$.',
    mistake: 'Using merge sort or heapsort for each pass. Merge sort is stable but makes each pass $O(n \\lg n)$, losing the linear time; heapsort is not stable at all.',
    tryIt: { q: 'Radix sort on hexadecimal keys (digits 0–F). How many slots does C need in each counting-sort pass, and what does one pass cost on $n$ keys?', a: '16 possible digit values, so C has 16 slots. One pass is $O(n + 16) = O(n)$.' },
  };

  H['c310-linsort-radix-time'] = {
    asks: 'Give radix sort’s total running time on $n$ numbers of $d$ digits (each digit with $k$ possible values), and say when it is $O(n)$.',
    idea: 'Radix sort is just $d$ counting sorts in a row. One costs $O(n + k)$, so $d$ of them cost $d$ times that.',
    steps: [
      'One pass is one counting sort on a digit: $O(n + k)$.',
      'There are $d$ passes: $d \\cdot O(n + k) = O(dn + dk) = O(d(n + k))$.',
      'If $d$ is a constant and $k = O(n)$ (say $k \\le c\\,n$), then $d(n + k) \\le d(1 + c)\\,n$, which is $O(n)$.',
      { text: 'For $n = 1{,}000{,}000$ nine-digit keys ($d = 9$, $k = 10$):', table: { head: ['method', 'formula', 'steps'], rows: [
        ['radix sort', '$d(n + k)$', '9,000,090'], ['merge sort', '$n \\lg n$', 'about 19,931,569']] } },
      'Every pass does the same work whatever the input order, so worst, average and best case are all $O(d(n + k))$. Her summary table writes $k^{\\prime}$ for the digit range.',
    ],
    graph: {
      caption: 'Three-digit keys ($d = 3$, $k = 10$): radix sort’s $3(n + 10)$ is a straight line; $n \\lg n$ bends upward and passes it near $n = 22$. Past that, the linear sort keeps pulling ahead.',
      x: [2, 100], y: [0, 700], xLabel: 'n', yLabel: 'steps',
      curves: [{ label: 'radix: $3(n + 10)$', f: n => 3 * (n + 10), tone: 'a' }, { label: '$n \\lg n$', f: n => n * lg(n), tone: 'b' }],
      marks: [{ x: 22, label: '$n \\approx 22$' }],
    },
    answer: '$O(dn + dk) = O(d(n + k))$. It is $O(n)$ when $d$ is a constant and $k = O(n)$.',
    mistake: 'Forgetting the factor $d$. If the number of digits grows with $n$ (for example $d \\approx \\lg n$ bits), radix sort is $O(n \\lg n)$, no better than merge sort.',
    tryIt: { q: '$n = 5{,}000$ keys, each with 4 decimal digits. Estimate radix sort’s steps with $d(n + k)$, and compare with $n \\lg n$.', a: '$4 \\cdot (5000 + 10) = 20{,}040$. $n \\lg n = 5000 \\cdot \\lg 5000 \\approx 5000 \\cdot 12.29 \\approx 61{,}439$, about three times more.' },
  };

  H['c310-linsort-radix-cons'] = {
    asks: 'List the two cons of radix sort from her slide.',
    idea: 'Radix sort needs keys that break into a small, fixed number of digits, each from a small set, and it builds its output in a second array. Anything that breaks those needs is a con.',
    steps: [
      'Doesn’t sort in place: each pass is a counting sort, which writes into a separate array B.',
      'Floating-point numbers: a real such as 3.14159… has no fixed number of digits, and numbers with different exponents do not line up digit by digit. There is no small, fixed $d$ to loop over.',
      'Arbitrary strings: lengths differ ("a" versus "algorithm"), so there is no single $d$; padding every string to the longest length wastes passes on short ones.',
      { text: 'Her slide in one table:', table: { head: ['pros', 'cons'], rows: [
        ['fast; simple to code; a good choice', 'doesn’t sort in place'], ['$O(n)$ when $d$ is constant and $k = O(n)$', 'not a good choice for floating point numbers or arbitrary strings']] } },
    ],
    answer: 'It doesn’t sort in place, and it is not a good choice for floating-point numbers or arbitrary strings.',
    mistake: 'Listing "not stable" as a con. Radix sort with counting-sort passes is stable.',
    tryIt: { q: 'You must sort 1,000 product names of 3 to 40 characters. Which radix-sort con applies, and how many passes would plain radix sort need?', a: 'Arbitrary strings: the lengths differ, so every name must be padded to 40 characters and radix sort does $d = 40$ passes, even though most names are much shorter.' },
  };

  // ---------------------------------------------------------------- Bucket sort

  H['c310-linsort-bucket-order'] = {
    asks: 'Put the steps of her Bucket-Sort(A), for keys in $[0, 1)$, in order.',
    idea: 'Like sorting exam papers into trays by score range (0–9, 10–19, …), sorting each small tray by hand, then stacking the trays in order. Every paper in a lower tray beats every paper in a higher tray, so the stack comes out sorted.',
    steps: [
      'n = length[A]. There will be $n$ buckets, B[0..n − 1].',
      'For i = 1 to n: insert A[i] into list $B[\\lfloor n \\cdot A[i] \\rfloor]$. Bucket $j$ collects the keys in $[j/n, (j+1)/n)$.',
      'For i = 0 to n − 1: sort list B[i] with insertion sort. With uniform input each list is short.',
      'Concatenate B[0], B[1], …, B[n − 1]. Every key in bucket $j$ is smaller than every key in bucket $j + 1$, so the result is sorted.',
      { text: 'Small run, $n = 5$, A = {.64, .23, .81, .29, .05}:', table: { head: ['bucket', 'range', 'after inserting', 'after sorting'], rows: [
        ['0', '[0, .2)', '.05', '.05'], ['1', '[.2, .4)', '.23, .29', '.23, .29'], ['2', '[.4, .6)', '(empty)', '(empty)'], ['3', '[.6, .8)', '.64', '.64'], ['4', '[.8, 1)', '.81', '.81']] } },
      'Concatenated: .05, .23, .29, .64, .81.',
    ],
    answer: 'n = length[A]; insert each A[i] into list $B[\\lfloor n A[i] \\rfloor]$; sort each list with insertion sort; concatenate B[0], B[1], …, B[n − 1].',
    mistake: 'Sorting the buckets while still distributing, or concatenating before sorting them. All keys are distributed first, then each bucket is sorted, then the buckets are joined.',
    tryIt: { q: 'Bucket sort {.66, .14, .45, .97, .52} with $n = 5$: give each bucket after distribution, then the output.', a: '$\\lfloor 5x \\rfloor$ = 3, 0, 2, 4, 2. Buckets: 0: .14; 1: empty; 2: .45, .52; 3: .66; 4: .97. Output .14, .45, .52, .66, .97.' },
  };

  H['c310-linsort-bucket-index'] = {
    asks: 'With $n = 8$ keys in $[0, 1)$, into which bucket does bucket sort put 0.59?',
    idea: 'Cut $[0, 1)$ into $n$ equal slices of width $1/n$. Multiplying by $n$ stretches $[0, 1)$ to $[0, n)$, and rounding down tells you which slice $x$ landed in.',
    steps: [
      'Bucket index = $\\lfloor n \\cdot x \\rfloor$, here with $n = 8$ and $x = 0.59$.',
      'Multiply: $8 \\cdot 0.59 = 4.72$.',
      'Round down (floor): $\\lfloor 4.72 \\rfloor = 4$.',
      { text: 'The eight buckets and their ranges:', table: { head: ['bucket', '0', '1', '2', '3', '4', '5', '6', '7'], rows: [['from', '0', '.125', '.25', '.375', '.5', '.625', '.75', '.875']] } },
      'Check: $0.5 \\le 0.59 < 0.625$, so 0.59 lies in bucket 4’s range, $[4/8, 5/8)$.',
    ],
    answer: 'Bucket 4: $\\lfloor 8 \\cdot 0.59 \\rfloor = \\lfloor 4.72 \\rfloor = 4$.',
    mistake: 'Rounding to the nearest whole number ($4.72 \\to 5$). The bucket is the whole-number part of $n x$: always round down.',
    tryIt: { q: 'Which bucket gets 0.31 when $n = 6$? Which gets 0.87 when $n = 5$?', a: '$6 \\cdot 0.31 = 1.86$, so bucket 1, range $[1/6, 2/6)$. $5 \\cdot 0.87 = 4.35$, so bucket 4, range $[0.8, 1)$.' },
  };

  H['c310-linsort-bucket-slide'] = {
    asks: 'Run bucket sort on her 10-key example and list what bucket 2 holds after the buckets are sorted.',
    idea: 'With $n = 10$, bucket $j$ holds the keys whose first decimal digit is $j$: bucket 2 is $[0.2, 0.3)$. Collect those keys in input order, then sort them.',
    steps: [
      { text: 'Bucket of each key, $\\lfloor 10x \\rfloor$:', table: { head: ['key', '.78', '.17', '.39', '.26', '.72', '.94', '.21', '.12', '.23', '.68'], rows: [['bucket', '7', '1', '3', '2', '7', '9', '2', '1', '2', '6']] } },
      'Bucket 2 receives, in input order, .26 (A[4]), .21 (A[7]) and .23 (A[9]): the list .26, .21, .23.',
      'Insertion sort on that list gives .21, .23, .26.',
      { text: 'All buckets after sorting:', table: { head: ['bucket', 'contents'], rows: [
        ['0', '(empty)'], ['1', '.12, .17'], ['2', '.21, .23, .26'], ['3', '.39'], ['4', '(empty)'], ['5', '(empty)'], ['6', '.68'], ['7', '.72, .78'], ['8', '(empty)'], ['9', '.94']] } },
    ],
    answer: '0.21, 0.23, 0.26.',
    mistake: 'Leaving bucket 2 in arrival order (.26, .21, .23). The question asks for the contents after the buckets are sorted.',
    tryIt: { q: 'Bucket sort {.24, .91, .57, .18, .66, .35, .12, .83} with $n = 8$: what does bucket 1 hold after sorting?', a: 'Bucket 1 is $[0.125, 0.25)$: .24 ($8 \\cdot .24 = 1.92$) and .18 ($1.44$) arrive in that order; sorted: .18, .24.' },
  };

  H['c310-linsort-bucket-prac'] = {
    asks: 'Run bucket sort on {.42, .07, .93, .55, .48, .81, .13, .59} with $n = 8$ and list bucket 3 after sorting.',
    idea: 'With $n = 8$ each bucket is $1/8 = 0.125$ wide, so bucket 3 is $[0.375, 0.5)$. Find the keys in that range, then put them in order.',
    steps: [
      { text: 'Bucket of each key, $\\lfloor 8x \\rfloor$:', table: { head: ['key', '.42', '.07', '.93', '.55', '.48', '.81', '.13', '.59'], rows: [['$8x$', '3.36', '0.56', '7.44', '4.4', '3.84', '6.48', '1.04', '4.72'], ['bucket', '3', '0', '7', '4', '3', '6', '1', '4']] } },
      'Bucket 3 receives .42 (A[1]) and then .48 (A[5]). They are already in order, so insertion sort leaves them as .42, .48.',
      { text: 'All buckets after sorting:', table: { head: ['bucket', 'contents'], rows: [
        ['0', '.07'], ['1', '.13'], ['2', '(empty)'], ['3', '.42, .48'], ['4', '.55, .59'], ['5', '(empty)'], ['6', '.81'], ['7', '.93']] } },
    ],
    answer: '0.42, 0.48.',
    mistake: 'Using $n = 10$ out of habit, as on the slide example (which would put .42 and .48 in bucket 4). The number of buckets is the number of keys, here 8.',
    tryIt: { q: 'Bucket sort {.47, .08, .92, .31, .53, .25} with $n = 6$: list bucket 1 after sorting.', a: 'Bucket 1 is $[1/6, 2/6) \\approx [0.167, 0.333)$: .31 ($6 \\cdot .31 = 1.86$) then .25 ($1.5$) arrive; sorted: .25, .31.' },
  };

  H['c310-linsort-bucket-time'] = {
    asks: 'Say when bucket sort runs in $O(n)$, and what happens to its time if the keys are far from uniform, for example all in one bucket.',
    idea: 'Bucket sort is fast only if the keys land about one per bucket. Uniform input makes that the expected case. If they all pile into one bucket, "sort each bucket" becomes insertion sort on all $n$ keys.',
    steps: [
      'Distributing and concatenating are $O(n)$ each: one pass over A, one pass over the $n$ buckets.',
      'Uniform input: each bucket expects $n \\cdot \\tfrac{1}{n} = 1$ key, so each insertion sort is $O(1)$ on average. The expected total is $O(n)$, as her slide says.',
      'Far from uniform: if every key lies in $[0, 1/n)$, all $n$ keys go to bucket 0.',
      'Insertion sort on $n$ keys in the worst case (reverse order) makes $1 + 2 + \\cdots + (n - 1) = \\tfrac{n(n-1)}{2}$ comparisons, which is $\\Theta(n^2)$.',
      { text: 'Work for the bucket-sorting step:', table: { head: ['$n$', 'uniform (about $n$)', 'one bucket, worst case $\\tfrac{n(n-1)}{2}$'], rows: [
        ['10', '10', '45'], ['100', '100', '4,950'], ['1000', '1,000', '499,500']] } },
    ],
    graph: {
      caption: 'Uniform input keeps bucket sort on the straight line $n$. With every key in one bucket, the insertion sort’s worst case $n(n-1)/2$ takes over.',
      x: [1, 30], y: [0, 450], xLabel: 'n', yLabel: 'comparisons',
      curves: [{ label: 'uniform: about $n$', f: n => n, tone: 'a' }, { label: 'one bucket: $n(n-1)/2$', f: n => n * (n - 1) / 2, tone: 'c' }],
    },
    answer: '$O(n)$ on average when the input is uniformly distributed, so buckets stay small. If all keys fall into one bucket, insertion-sorting that bucket dominates: $O(n^2)$.',
    mistake: 'Calling bucket sort $O(n)$ in the worst case. Her summary table gives only an average-case $O(n)$; skewed input drives it to $O(n^2)$.',
    tryIt: { q: 'Bucket sort with $n = 6$ on {.01, .15, .03, .12, .07, .10}. Where do the keys go, and at most how many comparisons can sorting the fullest bucket take?', a: 'Every key is below $1/6 \\approx 0.167$, so all six go to bucket 0. Insertion sort on 6 keys takes at most $6 \\cdot 5 / 2 = 15$ comparisons.' },
  };

  // ---------------------------------------------------------------- Summary

  H['c310-linsort-summary'] = {
    asks: 'From her summary table, give the running times of counting, radix and bucket sort, and whether each sorts in place.',
    idea: 'Each time comes from the sort’s own structure: counting touches $n$ elements and $k$ counters; radix does $d$ counting sorts; bucket is linear only on average, because it relies on uniform input. All three build their output outside A.',
    steps: [
      { text: 'Her table:', table: { head: ['sort', 'worst', 'average', 'best', 'in place'], rows: [
        ['counting', '$O(n + k)$', '$O(n + k)$', '$O(n + k)$', 'no'],
        ['radix', '$O(d(n + k^{\\prime}))$', '$O(d(n + k^{\\prime}))$', '$O(d(n + k^{\\prime}))$', 'no'],
        ['bucket', '', '$O(n)$', '', 'no']] } },
      'Counting: $k$ is the largest key. Radix: $d$ digits, each with $k^{\\prime}$ possible values; each pass is a counting sort costing $O(n + k^{\\prime})$.',
      'Bucket: only an average is listed, because it depends on uniform input. (If all keys land in one bucket it degrades to $O(n^2)$.)',
      'None is in place: counting and radix write into B; bucket sort builds $n$ separate lists.',
    ],
    answer: 'Counting sort $O(n + k)$; radix sort $O(d(n + k^{\\prime}))$; bucket sort $O(n)$ average. None of the three sorts in place.',
    mistake: 'Writing radix as $O(n + k)$, dropping the factor $d$, or calling any of the three in place.',
    tryIt: { q: 'Which entries of the table become $O(n)$ when $d$ is a constant and $k, k^{\\prime} = O(n)$?', a: 'All three. Counting: $O(n + k) = O(n)$. Radix: $O(d(n + k^{\\prime})) = O(n)$. Bucket: already $O(n)$ on average, for uniform input.' },
  };
})(globalThis.FC = globalThis.FC || {});
