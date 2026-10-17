// "Help" walkthroughs for the CSC 310 Assignment 1 skill cards (a1): counting operations,
// best/worst case, binary search, insertion sort, bounding code fragments, growth-rate order.
// Same entry format as decks/csc310-help.js (see the header comment there).
// Assignment 1's own algorithms and pairs are NOT used here; the tryIt problems use other code.
// Every number, trace row and tryIt answer was checked with python3 on 2026-10-16.
(function (FC) {
  'use strict';
  const H = FC.help = FC.help || {};

  // ---------------------------------------------------------------- Counting operations

  H['c310-1-findmax-count'] = {
    asks: 'Count how many times the test A[i] > max runs when FindMaximum gets an array of $n$ elements. The answer is a formula in $n$.',
    idea: 'The comparison sits directly inside the for loop, and nothing can skip it. So it runs exactly once per loop iteration: count the iterations and you are done.',
    steps: [
      'The array has indices $0$ to $n - 1$, so length(A) $- 1 = n - 1$ and the loop is "for $i \\leftarrow 1$ to $n - 1$".',
      'Count the values of $i$: $1, 2, \\dots, n - 1$. A range from $1$ to $m$ has $m$ values, so this one has $n - 1$.',
      { text: 'Trace $n = 5$, A = ⟨4, 9, 2, 7, 5⟩ (max starts as A[0] = 4):', table: { head: ['$i$', 'A[i]', 'max before', 'A[i] > max?', 'comparisons so far'], rows: [['1', '9', '4', 'yes', '1'], ['2', '2', '9', 'no', '2'], ['3', '7', '9', 'no', '3'], ['4', '5', '9', 'no', '4']] } },
      'A "yes" or "no" only decides whether max is updated, never whether the comparison runs. So every input of size $n$ gives $n - 1$ comparisons: $T(n) = n - 1 = \\Theta(n)$.',
    ],
    graph: {
      caption: 'Each bar is the comparison count for an array of that size. Every bar sits on the line $n - 1$: one more element, one more comparison.',
      x: [0, 11], y: [0, 11], xLabel: 'n (array size)', yLabel: 'comparisons',
      curves: [{ label: '$T(n) = n - 1$', f: n => n - 1, tone: 'a' }],
      bars: { label: 'comparisons for size n', tone: 'b', values: [[1, 0], [2, 1], [3, 2], [4, 3], [5, 4], [6, 5], [7, 6], [8, 7], [9, 8], [10, 9]] },
    },
    answer: '$n - 1$ comparisons: one per loop iteration, $i = 1, \\dots, n - 1$, on every input.',
    mistake: 'Answering $n$ because the array has $n$ elements. The loop starts at $i = 1$ (A[0] is already in max), so it makes one comparison fewer.',
    tryIt: { q: 'CountAbove(A, x) runs "for $i \\leftarrow 0$ to length(A) $- 1$: if A[i] > x then count $\\leftarrow$ count + 1". How many comparisons A[i] > x on $n$ elements?', a: '$n$: $i$ takes the values $0, 1, \\dots, n - 1$, which is $n$ values, one comparison each. $\\Theta(n)$.' },
  };

  H['c310-2-what-to-count'] = {
    asks: "The lecture estimates running time by counting operations and comparing the count to the input size. Which two kinds of operations does it say to count?",
    idea: 'Running time means "how many steps", and in the RAM model every simple step costs the same constant time. So instead of timing a program, you count the steps that do the work: the tests and the arithmetic.',
    steps: [
      'Comparisons: every $<, >, \\le, \\ge, ==$ that decides something, e.g. A[i] > max in an if, or A[i] > key in a while test.',
      'Arithmetic: addition, multiplication, division and mod, e.g. $i + 1$, $2 \\cdot j$, $(L + R)/2$.',
      { text: 'Count both kinds in FindMaximum on $n$ elements:', table: { head: ['operation', 'kind', 'times run'], rows: [['A[i] > max', 'comparison', '$n - 1$'], ['loop test $i \\le n - 1$', 'comparison', '$n$'], ['$i \\leftarrow i + 1$', 'arithmetic', '$n - 1$']] } },
      'Everything: $(n - 1) + n + (n - 1) = 3n - 2$; only the main comparison: $n - 1$. Both are straight lines in $n$, so both give $\\Theta(n)$.',
      'That is why you usually pick one basic operation, the one in the innermost loop, and count only it: the others change the constant, not the growth.',
    ],
    graph: {
      caption: 'Counting every operation gives a steeper line than counting one, but both are straight lines: both grow in proportion to $n$, so both are $\\Theta(n)$.',
      x: [1, 20], y: [0, 60], xLabel: 'n', yLabel: 'operations',
      curves: [{ label: '$3n - 2$ (all comparisons and additions)', f: n => 3 * n - 2, tone: 'a' }, { label: '$n - 1$ (only A[i] > max)', f: n => n - 1, tone: 'b' }],
    },
    answer: "Comparisons, and arithmetic operations (addition, multiplication, division, mod).",
    mistake: 'Not saying which operation you count. "The loop runs $n$ times" and "the comparison runs $n - 1$ times" are different counts: name the operation, then count it.',
    tryIt: { q: 'For "for $i = 1$ to $n$: $s = s + i \\cdot i$", how many multiplications and how many additions does the body perform in total?', a: 'The body runs $n$ times, with one multiplication ($i \\cdot i$) and one addition ($s + \\dots$) each: $n$ multiplications and $n$ additions, $2n$ operations, $\\Theta(n)$.' },
  };

  // ---------------------------------------------------------------- Best/worst/average case

  H['c310-2-best-def'] = {
    asks: "Say what \"best-case running time\" means.",
    idea: 'Fix the input size $n$ and line up every possible input of that size. Each input costs some number of steps. The best case is the cheapest input in that lineup, so no input can cost less: it is a floor (a lower bound).',
    steps: [
      'Take linear search on $n = 5$ elements (Lecture 2): it compares the key with A[1], A[2], … and stops when it finds it.',
      { text: 'List the inputs by where the key is:', table: { head: ['key is at', 'comparisons'], rows: [['A[1]', '1'], ['A[2]', '2'], ['A[3]', '3'], ['A[4]', '4'], ['A[5]', '5'], ['not present', '5']] } },
      'Best case = the smallest number in the right column: 1 (key in the first slot). Worst case = the largest: 5.',
      'Every row is $\\ge 1$, so on any input the search does at least the best-case work: the best case is a lower bound.',
      'The lecture calls it "bogus": one lucky input costing 1 comparison says nothing about the usual cost, which grows with $n$.',
    ],
    graph: {
      caption: 'For each $n$, every input’s cost lies between the flat best-case line and the rising worst-case line. The best case stays at 1 however large $n$ gets.',
      x: [1, 20], y: [0, 21], xLabel: 'n', yLabel: 'comparisons',
      curves: [{ label: 'best case: $1$', f: () => 1, tone: 'a' }, { label: 'worst case: $n$', f: n => n, tone: 'b' }],
    },
    answer: "The fewest operations (shortest running time) over all inputs of size $n$.",
    mistake: 'Taking a tiny input size (like $n = 1$) as "the best case". The best case is the best input for a fixed, general $n$, not the smallest $n$.',
    tryIt: { q: 'An algorithm scans an array left to right and stops at the first negative number. What is its best case on $n$ elements, and which input gives it?', a: 'A[1] is negative: it stops after 1 comparison, whatever $n$ is. Best case $= 1 = \\Theta(1)$.' },
  };

  H['c310-2-worst-def'] = {
    asks: "Say what \"worst-case running time\" means.",
    idea: 'Line up every input of size $n$ again; the worst case is the most expensive one. Because nothing costs more, it is a promise (an upper bound): "this algorithm never takes longer than this".',
    steps: [
      'Linear search on $n$ elements: the costliest input has the key missing (or in the last slot), $n$ comparisons. No input needs more, so the worst case is $n$.',
      'That is a guarantee you can plan around: whatever input arrives, at most $n$ comparisons.',
      'Second reason: the average case is often about as bad. For insertion sort the lecture gives average $t_j \\approx j/2$, half of the worst case $t_j = j$.',
      { text: 'Insertion sort shifts, worst case $n(n-1)/2$ vs. average about $n(n-1)/4$:', table: { head: ['$n$', 'worst $n(n-1)/2$', 'average $n(n-1)/4$'], rows: [['4', '6', '3'], ['10', '45', '22.5'], ['100', '4950', '2475']] } },
      'Halving the count changes only the constant. Both are quadratic, $\\Theta(n^2)$, so the worst case already shows how the typical case grows.',
    ],
    graph: {
      caption: 'The average curve is the worst-case parabola squashed to half its height: the same shape, so both are $\\Theta(n^2)$.',
      x: [0, 30], y: [0, 450], xLabel: 'n', yLabel: 'shifts',
      curves: [{ label: 'worst: $n(n-1)/2$', f: n => n * (n - 1) / 2, tone: 'b' }, { label: 'average: $n(n-1)/4$', f: n => n * (n - 1) / 4, tone: 'a' }],
    },
    answer: "The most operations (longest running time) over all inputs of size $n$.",
    mistake: 'Thinking the average case is $(\\text{best} + \\text{worst})/2$. The lecture says it is NOT: it is the cost averaged over all inputs of size $n$.',
    tryIt: { q: 'A loop compares neighbours A[i] and A[i+1] for $i = 1, \\dots, n - 1$ and stops at the first pair that is out of order. What is its worst case on $n$ elements, and which input causes it?', a: 'An already sorted array: no pair is out of order, so it checks all $n - 1$ pairs. Worst case $= n - 1 = \\Theta(n)$.' },
  };

  H['c310-2-findmax-sorted'] = {
    asks: "For FindMaximum on $n$ elements, give the best and worst number of comparisons.",
    idea: 'Two different operations, two different answers. The comparison runs every iteration no matter what; the update runs only when the comparison says "yes", so it depends on the input.',
    steps: [
      'Comparisons: one per iteration, $i = 1, \\dots, n - 1$, on every input. So best = worst = $n - 1$, $\\Theta(n)$.',
      { text: 'Updates on ascending ⟨1, 2, 3, 4, 5⟩:', table: { head: ['$i$', 'A[i]', 'max before', 'A[i] > max?', 'updates so far'], rows: [['1', '2', '1', 'yes', '1'], ['2', '3', '2', 'yes', '2'], ['3', '4', '3', 'yes', '3'], ['4', '5', '4', 'yes', '4']] } },
      'Each new element is bigger than everything before it, so every comparison says yes: $n - 1$ updates, the most possible.',
      'Descending ⟨5, 4, 3, 2, 1⟩: max = 5 from the start and every comparison says no: 0 updates.',
    ],
    graph: {
      caption: 'On ascending input the update bars reach the comparison line exactly (every comparison causes an update); on descending input updates stay at 0. The comparison line is the same for every input.',
      x: [0, 11], y: [0, 10], xLabel: 'n', yLabel: 'count',
      curves: [{ label: 'comparisons: $n - 1$ (any input)', f: n => n - 1, tone: 'a' }, { label: 'updates, descending input: $0$', f: () => 0, tone: 'c' }],
      bars: { label: 'updates, ascending input', tone: 'b', values: [[1, 0], [2, 1], [3, 2], [4, 3], [5, 4], [6, 5], [7, 6], [8, 7], [9, 8], [10, 9]] },
    },
    answer: "Best = worst = $n - 1$, $\\Theta(n)$: the comparison runs once per iteration whatever the input.",
    mistake: 'Calling sorted input FindMaximum’s best (or worst) case for comparisons. The comparison count never changes; only the update count does, so always name the operation you count.',
    tryIt: { q: 'FindMaximum on ⟨2, 7, 1, 8, 3⟩: how many comparisons, and how many updates?', a: '4 comparisons ($n - 1$ with $n = 5$). Updates: 7 > 2 yes, 1 > 7 no, 8 > 7 yes, 3 > 8 no: 2 updates.' },
  };

  // ---------------------------------------------------------------- Binary search

  H['c310-2-binsearch-worst'] = {
    asks: 'Find the largest number of loop iterations binary search can need on a sorted array of $n$ elements, and give it in $\\Theta$ form.',
    idea: 'Each iteration looks at the middle element and throws away half of the list. So the question is: how many times can you cut $n$ in half before 1 element is left?',
    steps: [
      { text: 'The worst case is a key that is not in the list, so nothing stops the search early. Track the list size for $n = 16$:', table: { head: ['iteration $k$', 'list size $n/2^k$'], rows: [['0', '16'], ['1', '8'], ['2', '4'], ['3', '2'], ['4', '1']] } },
      'In general, after $k$ iterations the size is $n/2^k$: each iteration divides by 2 once more.',
      'The search goes on until the size is 1. Set $n/2^k = 1$ and multiply both sides by $2^k$: $n = 2^k$.',
      'Take $\\lg$ (log base 2) of both sides: $\\lg n = \\lg 2^k = k$, so $k = \\lg n$. Check: $\\lg 16 = 4$, as in the table.',
      'The loop still examines that last element once, so it runs $\\lfloor \\lg n \\rfloor + 1$ times (5 for $n = 16$). Adding 1 does not change the growth: $T(n) = \\Theta(\\lg n)$.',
    ],
    graph: {
      caption: 'With $n = 64$ each bar is half the one before, and it takes 6 halvings to reach 1: $\\lg 64 = 6$. Doubling $n$ would add just one more bar.',
      x: [0, 7], y: [0, 66], xLabel: 'iteration k', yLabel: 'list size',
      curves: [{ label: '$n/2^k$ with $n = 64$', f: k => 64 / Math.pow(2, k), tone: 'a' }],
      bars: { label: 'list size after k iterations', tone: 'b', values: [[0, 64], [1, 32], [2, 16], [3, 8], [4, 4], [5, 2], [6, 1]] },
      marks: [{ x: 6, label: '$k = \\lg 64 = 6$' }],
    },
    answer: '$n/2^k = 1 \\Rightarrow n = 2^k \\Rightarrow k = \\lg n$, so the worst case is $\\Theta(\\lg n)$ (exactly $\\lfloor \\lg n \\rfloor + 1$ iterations).',
    mistake: 'Writing $n/2$ ("it halves the list") as the running time. One halving is one step; the count is how many halvings fit into $n$, which is $\\lg n$.',
    tryIt: { q: 'A search compares the key with two dividing points, keeps the one third of the list that could hold it, and repeats until 1 element is left. How many steps for $n$ elements in the worst case?', a: 'After $k$ steps the size is $n/3^k$. Set $n/3^k = 1$: $n = 3^k$, so $k = \\log_3 n = \\lg n / \\lg 3$, which is $\\Theta(\\lg n)$. For $n = 81$: 4 steps.' },
  };

  // ---------------------------------------------------------------- Insertion sort: counting

  H['c310-2-ins-tj'] = {
    asks: "In the insertion-sort cost table, say what $t_j$ counts.",
    idea: 'A loop test always runs once more than its body. Every test that says "yes" lets the body run once, and one final test says "no" and leaves. So if the test ran $t_j$ times, the body ran $t_j - 1$ times.',
    steps: [
      '$t_j$ = how many times the line-4 test "(i > 0) and (A[i] > key)" runs during the pass for one value of $j$. It depends on the input, so it is a variable.',
      'In pass $j$, each "yes" shifts one element (lines 5 and 6 run once). The last test answers "no" and exits; no shift follows it.',
      'So tests $=$ shifts $+ 1$, which means shifts $= t_j - 1$. Over all passes, lines 5 and 6 run $\\sum_{j=2}^{n} (t_j - 1)$ times.',
      { text: 'Trace A = ⟨3, 5, 1, 4⟩:', table: { head: ['$j$', 'key', 'tests $t_j$', 'shifts $t_j - 1$', 'A after'], rows: [['2', '5', '1', '0', '⟨3, 5, 1, 4⟩'], ['3', '1', '3', '2', '⟨1, 3, 5, 4⟩'], ['4', '4', '2', '1', '⟨1, 3, 4, 5⟩']] } },
      'Totals: $\\sum t_j = 1 + 3 + 2 = 6$ tests and $\\sum (t_j - 1) = 0 + 2 + 1 = 3$ shifts. The gap is 3, one per pass.',
    ],
    graph: {
      caption: 'Reverse-sorted input: the bars are the tests $t_j = j$, and the line $j - 1$ is the body count, always exactly one below each bar top.',
      x: [1, 9], y: [0, 9], xLabel: 'pass j', yLabel: 'count',
      curves: [{ label: 'body runs: $t_j - 1 = j - 1$', f: j => j - 1, tone: 'a' }],
      bars: { label: 'while tests $t_j = j$', tone: 'b', values: [[2, 2], [3, 3], [4, 4], [5, 5], [6, 6], [7, 7], [8, 8]] },
    },
    answer: "$t_j$ is the number of times the while test (line 4) runs in pass $j$.",
    mistake: 'Treating $t_j$ as the number of shifts. $t_j$ counts tests, including the final failing one, so shifts are $t_j - 1$ and $t_j \\ge 1$ always.',
    tryIt: { q: 'x starts at 1. How many times does the test of "while x < 10: x = x + 3" run, and how many times does the body run?', a: 'Tests at x = 1, 4, 7 (yes) and x = 10 (no): 4 tests. Body: 3 times, one fewer than the tests.' },
  };

  H['c310-2-ins-header-n'] = {
    asks: 'Count every time line 1, "for j = 2 to n", checks its condition, including the last check that ends the loop.',
    idea: 'A for loop is a while loop in disguise: "j = 2; while j ≤ n: body; j = j + 1". Like any loop test, it runs once more than the body, because the final check is the one that says stop.',
    steps: [
      'The body runs for $j = 2, 3, \\dots, n$. From $2$ to $n$ there are $n - 2 + 1 = n - 1$ values, so lines 2, 3 and 7 run $n - 1$ times.',
      'Each of those $n - 1$ runs comes after a check that passes. Then $j$ becomes $n + 1$, and one more check fails.',
      'Total checks: $(n - 1) + 1 = n$.',
      { text: 'Trace $n = 5$:', table: { head: ['check', '$j$', '$j \\le 5$?'], rows: [['1', '2', 'yes'], ['2', '3', 'yes'], ['3', '4', 'yes'], ['4', '5', 'yes'], ['5', '6', 'no, exit']] } },
      'That is why the cost table charges line 1 $c_1 n$ but lines 2, 3 and 7 only $c_2(n - 1)$, $c_3(n - 1)$ and $c_7(n - 1)$.',
    ],
    graph: {
      caption: 'Bars: header checks ($n$). Line: body runs ($n - 1$). The header is always exactly one ahead.',
      x: [1, 11], y: [0, 11], xLabel: 'n', yLabel: 'times run',
      curves: [{ label: 'body: $n - 1$', f: n => n - 1, tone: 'a' }],
      bars: { label: 'header checks: $n$', tone: 'b', values: [[2, 2], [3, 3], [4, 4], [5, 5], [6, 6], [7, 7], [8, 8], [9, 9], [10, 10]] },
    },
    answer: '$n$ times: $n - 1$ passing checks ($j = 2, \\dots, n$) plus one failing check at $j = n + 1$.',
    mistake: 'Answering $n - 1$ by counting only the passes. The question counts the header, and the header runs once more to find out it is done.',
    tryIt: { q: 'How many times does the header "for k = 3 to n" run, and how many times does its body run?', a: 'Body: $k = 3, \\dots, n$ is $n - 3 + 1 = n - 2$ values. Header: $(n - 2) + 1 = n - 1$ checks. For $n = 7$: 6 checks, 5 body runs.' },
  };

  H['c310-2-ins-T-formula'] = {
    asks: 'Write insertion sort’s exact running time as one formula: each line’s cost $c_1, \\dots, c_7$ times how often that line runs, all added up.',
    idea: 'Think of a bill: each line has a price ($c_k$) and a quantity (how many times it runs). $T(n)$ is the total of price × quantity over the seven lines. The only quantity that depends on the input is $t_j$.',
    steps: [
      { text: 'Fill in "times" line by line:', table: { head: ['line', 'cost', 'times', 'why'], rows: [['1 for', '$c_1$', '$n$', '$n - 1$ passes + 1 failing check'], ['2 key', '$c_2$', '$n - 1$', 'once per pass'], ['3 i', '$c_3$', '$n - 1$', 'once per pass'], ['4 while test', '$c_4$', '$\\sum_{j=2}^{n} t_j$', '$t_j$ tests in pass $j$'], ['5 shift', '$c_5$', '$\\sum_{j=2}^{n} (t_j - 1)$', 'one fewer than the tests'], ['6 i = i − 1', '$c_6$', '$\\sum_{j=2}^{n} (t_j - 1)$', 'same as line 5'], ['7 place key', '$c_7$', '$n - 1$', 'once per pass']] } },
      'Multiply cost by times on each row and add: $T(n) = c_1 n + c_2(n-1) + c_3(n-1) + c_4 \\sum_{j=2}^{n} t_j + c_5 \\sum_{j=2}^{n} (t_j - 1) + c_6 \\sum_{j=2}^{n} (t_j - 1) + c_7(n-1)$.',
      'Check with every $c_k = 1$, $n = 5$, sorted input ($t_j = 1$): $\\sum t_j = 4$ and $\\sum (t_j - 1) = 0$, so $T(5) = 5 + 4 + 4 + 4 + 0 + 0 + 4 = 21$.',
      'Same check on reverse-sorted input ($t_j = j$): $\\sum_{j=2}^{5} j = 2 + 3 + 4 + 5 = 14$ and $\\sum_{j=2}^{5} (j - 1) = 1 + 2 + 3 + 4 = 10$, so $T(5) = 5 + 4 + 4 + 14 + 10 + 10 + 4 = 51$.',
    ],
    graph: {
      caption: 'With every $c_k = 1$, the same formula gives a line when $t_j = 1$ and a parabola when $t_j = j$. At $n = 5$: 21 vs. 51.',
      x: [1, 12], y: [0, 260], xLabel: 'n', yLabel: 'T(n)',
      curves: [{ label: 'sorted ($t_j = 1$): $5n - 4$', f: n => 5 * n - 4, tone: 'a' }, { label: 'reversed ($t_j = j$): $1.5n^2 + 3.5n - 4$', f: n => 1.5 * n * n + 3.5 * n - 4, tone: 'b' }],
      marks: [{ x: 5, label: '$n = 5$' }],
    },
    answer: '$T(n) = c_1 n + c_2(n-1) + c_3(n-1) + c_4 \\sum_{j=2}^{n} t_j + c_5 \\sum_{j=2}^{n} (t_j - 1) + c_6 \\sum_{j=2}^{n} (t_j - 1) + c_7(n-1)$.',
    mistake: 'Writing line 1 as $n - 1$, or lines 5 and 6 as $\\sum t_j$. Loop headers and tests run one extra time; the bodies do not.',
    tryIt: { q: 'Line 1 "for i = 1 to n" costs $a$; line 2 "x = x + i" costs $b$. Write $T(n)$.', a: 'Line 1 runs $n + 1$ times ($n$ passing checks, 1 failing); line 2 runs $n$ times. $T(n) = a(n + 1) + bn = (a + b)n + a$, so $\\Theta(n)$.' },
  };

  H['c310-3-ins-worst-sum'] = {
    asks: 'Add up $1 + 2 + \\dots + (n - 1)$ for $n = 10$, that is, $1 + 2 + \\dots + 9$.',
    idea: 'Pair the smallest number with the largest, the second smallest with the second largest, and so on. Every pair has the same total, so the sum is (number of pairs) × (pair total).',
    steps: [
      'With $n = 10$ the last term is $n - 1 = 9$: the sum is $1 + 2 + 3 + 4 + 5 + 6 + 7 + 8 + 9$.',
      'Pair from the outside in: $(1 + 9) + (2 + 8) + (3 + 7) + (4 + 6) + 5 = 10 + 10 + 10 + 10 + 5 = 45$.',
      'General formula: $\\sum_{i=1}^{n-1} i = \\frac{n(n-1)}{2}$. With $n = 10$: $\\frac{10 \\cdot 9}{2} = \\frac{90}{2} = 45$.',
      'The lecture reaches the same formula from the sum up to $n$: $\\sum_{i=1}^{n} i - n = \\frac{n(n+1)}{2} - n = \\frac{n^2 + n - 2n}{2} = \\frac{n^2 - n}{2}$.',
      '$\\frac{n^2 - n}{2} = \\tfrac12 n^2 - \\tfrac12 n$: the $n^2$ term dominates, so the count is $O(n^2)$.',
    ],
    graph: {
      caption: 'The bars $1, 2, \\dots, 9$ form a staircase. Two copies of it, one flipped upside down, fit together into a 9 × 10 rectangle, so one staircase is $90 / 2 = 45$.',
      x: [0, 10], y: [0, 10], xLabel: 'i', yLabel: 'term',
      curves: [{ label: 'diagonal $y = i$', f: i => i, tone: 'a' }],
      bars: { label: 'term $i$', tone: 'b', values: [[1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6], [7, 7], [8, 8], [9, 9]] },
    },
    answer: '45: $\\frac{n(n-1)}{2} = \\frac{10 \\cdot 9}{2} = 45$.',
    mistake: 'Using $\\frac{n(n+1)}{2}$, which adds up to $n$, not $n - 1$: that gives 55. Check what the last term is before choosing the formula.',
    tryIt: { q: 'Evaluate $1 + 2 + \\dots + 19$.', a: 'The last term is $19 = n - 1$ with $n = 20$: $\\frac{20 \\cdot 19}{2} = 190$. By pairs: $(1 + 19) + \\dots + (9 + 11) + 10 = 9 \\cdot 20 + 10 = 190$.' },
  };

  // ---------------------------------------------------------------- Insertion sort: cases

  H['c310-2-ins-best'] = {
    asks: "Say which input makes insertion sort do the least work.",
    idea: 'Insertion sort slides each new key left until it meets something no bigger. If the array is already sorted, the element just to the left is never bigger, so every key stays put after one look.',
    steps: [
      { text: 'Trace sorted A = ⟨1, 2, 3, 4, 5⟩:', table: { head: ['$j$', 'key', 'A[j − 1]', 'A[j − 1] > key?', '$t_j$'], rows: [['2', '2', '1', 'no', '1'], ['3', '3', '2', 'no', '1'], ['4', '4', '3', 'no', '1'], ['5', '5', '4', 'no', '1']] } },
      'The first test fails every time, so $t_j = 1$ for all $j$, and the shift body runs $t_j - 1 = 0$ times.',
      'Plug in: $\\sum_{j=2}^{n} t_j = \\sum_{j=2}^{n} 1 = n - 1$ (there are $n - 1$ values of $j$), and $\\sum_{j=2}^{n} (t_j - 1) = 0$.',
      'So $T(n) = c_1 n + c_2(n-1) + c_3(n-1) + c_4(n-1) + c_7(n-1)$.',
      'Collect the $n$ terms and the constants: $T(n) = (c_1 + c_2 + c_3 + c_4 + c_7)n - (c_2 + c_3 + c_4 + c_7)$. That is $an + b$ for constants $a, b$: linear, $\\Theta(n)$.',
    ],
    graph: {
      caption: 'Sorted input: every bar has height 1, a flat row. The worst-case line $t_j = j$ climbs instead, and that climb is what makes the worst case quadratic.',
      x: [1, 11], y: [0, 11], xLabel: 'pass j', yLabel: 'while tests t_j',
      curves: [{ label: 'worst case: $t_j = j$', f: j => j, tone: 'c' }],
      bars: { label: 'sorted input: $t_j = 1$', tone: 'a', values: [[2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [8, 1], [9, 1], [10, 1]] },
    },
    answer: "An already sorted (or nearly sorted) array.",
    mistake: 'Saying $t_j = 0$. The while test still runs once per pass to find out that nothing needs to move, so $t_j = 1$.',
    tryIt: { q: 'Insertion sort on ⟨2, 1, 3, 4, 5, 6⟩: what is $\\sum t_j$ (total while tests)?', a: '$j = 2$: key 1 passes 2 (test yes), then $i = 0$ (test no), so $t_2 = 2$. $j = 3, \\dots, 6$: $t_j = 1$ each, 4 more. Total $2 + 4 = 6$, just one more than sorted.' },
  };

  H['c310-2-ins-worst'] = {
    asks: "Say which input makes insertion sort do the most work.",
    idea: 'In a reverse-sorted array each new key is smaller than everything to its left, so it slides all the way to the front. Pass $j$ moves past all $j - 1$ earlier elements.',
    steps: [
      'In pass $j$ the test says "yes" for A[$j - 1$], …, A[1] ($j - 1$ times), then fails once at $i = 0$. So $t_j = (j - 1) + 1 = j$.',
      { text: 'Trace ⟨5, 4, 3, 2, 1⟩:', table: { head: ['$j$', 'key', 'tests $t_j$', 'shifts $t_j - 1$'], rows: [['2', '4', '2', '1'], ['3', '3', '3', '2'], ['4', '2', '4', '3'], ['5', '1', '5', '4']] } },
      'Total shifts: $\\sum_{j=2}^{n} (j - 1) = 1 + 2 + \\dots + (n - 1)$.',
      'Write the sum forwards and backwards: $S = 1 + 2 + \\dots + (n-1)$ and $S = (n-1) + \\dots + 2 + 1$. Each of the $n - 1$ column pairs adds to $n$, so $2S = n(n - 1)$ and $S = \\frac{n(n-1)}{2}$.',
      'Check $n = 5$: $\\frac{5 \\cdot 4}{2} = 10 = 1 + 2 + 3 + 4$. Since $\\frac{n(n-1)}{2} = \\tfrac12 n^2 - \\tfrac12 n$ has an $n^2$ term, $T(n)$ is quadratic: $\\Theta(n^2)$.',
    ],
    graph: {
      caption: 'Worst-case shifts (parabola) against the best case’s $n - 1$ while tests (line). At $n = 20$: 190 vs. 19.',
      x: [0, 20], y: [0, 200], xLabel: 'n', yLabel: 'operations',
      curves: [{ label: 'worst: $n(n-1)/2$ shifts', f: n => n * (n - 1) / 2, tone: 'b' }, { label: 'best: $n - 1$ tests', f: n => n - 1, tone: 'a' }],
    },
    answer: "A reverse-sorted array.",
    mistake: 'Writing $t_j = j - 1$. That is the number of shifts; the test runs one more time (the failing check at $i = 0$).',
    tryIt: { q: 'Insertion sort on a reverse-sorted array of $n = 7$ elements: total while tests $\\sum_{j=2}^{7} t_j$?', a: '$t_j = j$: $2 + 3 + 4 + 5 + 6 + 7 = 27$. (Shifts: one fewer per pass, $27 - 6 = 21 = \\frac{7 \\cdot 6}{2}$.)' },
  };

  H['c310-2-ins-reverse-count'] = {
    asks: 'Run insertion sort by hand on ⟨5, 4, 3, 2, 1⟩ and count how many times line 5 (A[i+1] = A[i], one shift) runs in total.',
    idea: 'A shift is one element stepping one slot right to make room. In a reversed array every new key is the smallest so far, so it has to pass every element already sorted.',
    steps: [
      { text: 'One pass per $j$:', table: { head: ['$j$', 'key', 'shifts', 'A after'], rows: [['2', '4', '1', '⟨4, 5, 3, 2, 1⟩'], ['3', '3', '2', '⟨3, 4, 5, 2, 1⟩'], ['4', '2', '3', '⟨2, 3, 4, 5, 1⟩'], ['5', '1', '4', '⟨1, 2, 3, 4, 5⟩']] } },
      'Pass $j$ shifts $j - 1$ elements (everything to its left). Add them: $1 + 2 + 3 + 4 = 10$.',
      'Formula check: $\\frac{n(n-1)}{2} = \\frac{5 \\cdot 4}{2} = 10$.',
      'Compare sorted ⟨1, 2, 3, 4, 5⟩: no key moves, 0 shifts. Same $n$, 10 vs. 0: the input decides the cost.',
    ],
    graph: {
      caption: 'Bars: shifts in each pass. Line: the running total $j(j-1)/2$, which reaches 10 after pass 5.',
      x: [1, 6], y: [0, 16], xLabel: 'pass j', yLabel: 'shifts',
      curves: [{ label: 'running total $j(j-1)/2$', f: j => j * (j - 1) / 2, tone: 'a' }],
      bars: { label: 'shifts in pass j', tone: 'b', values: [[2, 1], [3, 2], [4, 3], [5, 4]] },
      marks: [{ x: 5, label: 'total 10' }],
    },
    answer: '10 shifts: $1 + 2 + 3 + 4 = 10 = \\frac{n(n-1)}{2}$ with $n = 5$.',
    mistake: 'Counting while tests instead of shifts. Tests are $2 + 3 + 4 + 5 = 14$; shifts are one fewer per pass, $14 - 4 = 10$.',
    tryIt: { q: 'Insertion sort on ⟨4, 3, 2, 1, 5⟩: how many shifts?', a: 'Passes $j = 2, 3, 4$ shift 1, 2, 3 (each key passes the whole reversed block); $j = 5$: key 5 is already the largest, 0. Total $1 + 2 + 3 + 0 = 6$.' },
  };

  // ---------------------------------------------------------------- Bounding code fragments

  H['c310-3-code-triangle'] = {
    asks: 'Count how many times x = x + 1 runs when $n = 10$, then say how the count grows with $n$.',
    idea: 'The inner loop’s length depends on the outer index: when $i = 1$ it runs once, when $i = 2$ twice, and so on. Stack those runs up and you get a triangle, about half of an $n \\times n$ square.',
    steps: [
      'For a fixed $i$, "for j = 1 to i" runs $i$ times, so x = x + 1 runs $i$ times in that outer pass.',
      { text: 'Trace $n = 10$:', table: { head: ['$i$', 'inner runs', 'total so far'], rows: [['1', '1', '1'], ['2', '2', '3'], ['3', '3', '6'], ['4', '4', '10'], ['5', '5', '15'], ['6', '6', '21'], ['7', '7', '28'], ['8', '8', '36'], ['9', '9', '45'], ['10', '10', '55']] } },
      'Total $= \\sum_{i=1}^{n} i = 1 + 2 + \\dots + n$. Pair first with last: $\\frac{n}{2}$ pairs, each adding to $n + 1$, giving $\\frac{n(n+1)}{2}$.',
      'For $n = 10$: $\\frac{10 \\cdot 11}{2} = 55$, as in the table.',
      '$\\frac{n(n+1)}{2} = \\tfrac12 n^2 + \\tfrac12 n$, so the count is $\\Theta(n^2)$.',
    ],
    graph: {
      caption: 'Bars: inner runs for each $i$, a growing staircase. Line: the running total $i(i+1)/2$, which ends at 55 when $i = 10$.',
      x: [0, 11], y: [0, 70], xLabel: 'outer index i', yLabel: 'runs',
      curves: [{ label: 'running total $i(i+1)/2$', f: i => i * (i + 1) / 2, tone: 'a' }],
      bars: { label: 'inner runs $= i$', tone: 'b', values: [[1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6], [7, 7], [8, 8], [9, 9], [10, 10]] },
    },
    answer: '55 $= \\frac{10 \\cdot 11}{2}$; in general $\\frac{n(n+1)}{2} = \\Theta(n^2)$.',
    mistake: 'Using $\\frac{n(n-1)}{2}$ (45). Here $j$ goes up to $i$ inclusive and $i$ goes up to $n$, so the terms are $1$ through $n$.',
    tryIt: { q: 'How many times does x = x + 1 run for $n = 5$ in "for i = 1 to n: for j = 1 to 2*i: x = x + 1"?', a: 'Inner runs $2i$ times: $2 + 4 + 6 + 8 + 10 = 30 = 2 \\cdot \\frac{5 \\cdot 6}{2}$. In general $n(n+1)$, $\\Theta(n^2)$.' },
  };

  H['c310-3-code-strict'] = {
    asks: 'Count how many times the comparison A[i] == A[j] runs when $n = 8$.',
    idea: 'The inner loop starts just after $i$, so early passes have many partners to the right and late passes have few. The work is a triangle again, shrinking instead of growing.',
    steps: [
      '"for j = i + 1 to n" has $n - (i + 1) + 1 = n - i$ values, so pass $i$ makes $n - i$ comparisons.',
      { text: 'Trace $n = 8$:', table: { head: ['$i$', '$j$ runs over', 'comparisons'], rows: [['1', '2 … 8', '7'], ['2', '3 … 8', '6'], ['3', '4 … 8', '5'], ['4', '5 … 8', '4'], ['5', '6 … 8', '3'], ['6', '7 … 8', '2'], ['7', '8', '1'], ['8', '(none)', '0']] } },
      'Total $= 7 + 6 + 5 + 4 + 3 + 2 + 1 + 0$. Pair: $(7 + 1) + (6 + 2) + (5 + 3) + 4 = 8 + 8 + 8 + 4 = 28$.',
      'General: $\\sum_{i=1}^{n} (n - i) = (n - 1) + \\dots + 1 + 0 = \\frac{n(n-1)}{2}$; for $n = 8$, $\\frac{8 \\cdot 7}{2} = 28$.',
      'The comparison runs whether or not the if succeeds; only count = count + 1 depends on the data. So the count is $\\Theta(n^2)$ on every input.',
    ],
    graph: {
      caption: 'Bars: comparisons in each pass, a shrinking staircase. Line: the running total, which flattens out at 28.',
      x: [0, 8.5], y: [0, 30], xLabel: 'outer index i', yLabel: 'comparisons',
      curves: [{ label: 'running total $8i - i(i+1)/2$', f: i => 8 * i - i * (i + 1) / 2, tone: 'a' }],
      bars: { label: 'comparisons $= 8 - i$', tone: 'b', values: [[1, 7], [2, 6], [3, 5], [4, 4], [5, 3], [6, 2], [7, 1], [8, 0]] },
    },
    answer: '28 $= \\frac{8 \\cdot 7}{2}$; $\\Theta(n^2)$ on every input.',
    mistake: 'Counting $n$ comparisons per pass ($8 \\cdot 8 = 64$). The inner loop starts at $i + 1$, so it shrinks each pass; for $i = n$ it does not run at all.',
    tryIt: { q: 'For $n = 7$, how many times does the body run in "for i = 1 to n: for j = i + 2 to n: body"?', a: 'Pass $i$ runs $n - i - 1$ times when that is positive: $5 + 4 + 3 + 2 + 1 + 0 + 0 = 15 = \\frac{6 \\cdot 5}{2}$. $\\Theta(n^2)$.' },
  };

  H['c310-3-code-doubling'] = {
    asks: 'Find how many times the loop body runs as a function of $n$, and give a tight bound ($\\Theta$).',
    idea: 'This is binary search run backwards: instead of halving $n$ down to 1, it doubles 1 up to $n$. Both take as many steps as there are factors of 2 between 1 and $n$, which is $\\lg n$.',
    steps: [
      'After $k$ iterations, $i = 2^k$ (it starts at $1 = 2^0$ and each iteration multiplies by 2).',
      { text: 'Trace $n = 64$:', table: { head: ['iterations so far $k$', '$i = 2^k$', '$i < 64$?'], rows: [['0', '1', 'yes'], ['1', '2', 'yes'], ['2', '4', 'yes'], ['3', '8', 'yes'], ['4', '16', 'yes'], ['5', '32', 'yes'], ['6', '64', 'no, stop']] } },
      'The loop stops at the first $k$ with $2^k \\ge n$. Solve $2^k = n$ by taking $\\lg$ of both sides: $k = \\lg n$ (6 for $n = 64$).',
      'When $n$ is not a power of 2, round up: $k = \\lceil \\lg n \\rceil$. For $n = 100$: $2^6 = 64 < 100 \\le 128 = 2^7$, so 7 iterations.',
      'Rounding up adds less than 1, so the count is $\\Theta(\\lg n)$.',
    ],
    graph: {
      caption: 'The count goes up by one each time $n$ doubles. The steps hug the smooth curve $\\lg n$ and are never a full 1 above it.',
      x: [1, 130], y: [0, 8], xLabel: 'n', yLabel: 'iterations',
      curves: [{ label: 'iterations $\\lceil \\lg n \\rceil$', f: n => Math.ceil(Math.log2(n)), tone: 'a' }, { label: '$\\lg n$', f: n => Math.log2(n), tone: 'b' }],
      marks: [{ x: 64, label: '$n = 64$: 6' }, { x: 100, label: '$n = 100$: 7' }],
    },
    answer: '$\\lceil \\lg n \\rceil$ iterations: $\\Theta(\\log n)$.',
    mistake: 'Answering $\\Theta(n)$ because "it loops until $n$". The variable does reach $n$, but by doubling, so it takes only $\\lg n$ steps.',
    tryIt: { q: 'Tight bound on the iterations of "i = 1; while i < n: i = 4 * i"? How many for $n = 64$?', a: 'After $k$ iterations $i = 4^k$; it stops when $4^k \\ge n$, so $k = \\lceil \\log_4 n \\rceil = \\Theta(\\lg n)$. For $n = 64 = 4^3$: 3 iterations.' },
  };

  H['c310-3-code-nlogn'] = {
    asks: 'Count how many times j = 2 * j runs in total, and give a tight bound.',
    idea: 'The inner while loop is the doubling loop: about $\\lg n$ steps. It never looks at $i$, so each of the $n$ outer passes does the same amount. Equal rows make a rectangle: $n$ wide, $\\lg n$ tall.',
    steps: [
      'Inner loop: $j$ goes $1, 2, 4, \\dots$ until $j \\ge n$, which takes $\\lceil \\lg n \\rceil$ doublings.',
      'j is reset to 1 at the start of every outer pass, so every pass repeats the same $\\lceil \\lg n \\rceil$ steps.',
      { text: 'Trace $n = 16$:', table: { head: ['$i$', 'values of j', 'doublings', 'total so far'], rows: [['1', '1, 2, 4, 8, 16', '4', '4'], ['2', '1, 2, 4, 8, 16', '4', '8'], ['3', '1, 2, 4, 8, 16', '4', '12'], ['…', '…', '…', '…'], ['16', '1, 2, 4, 8, 16', '4', '64']] } },
      'Total $= n \\cdot \\lceil \\lg n \\rceil$. For $n = 16$: $16 \\cdot 4 = 64$.',
      'Ignoring the rounding, that is $n \\lg n$: $\\Theta(n \\lg n)$.',
    ],
    graph: {
      caption: 'Every bar is 4 high (the inner loop for $n = 16$): equal bars, a rectangle. The running total climbs 4 per pass, a straight line ending at $16 \\cdot 4 = 64$.',
      x: [0, 17], y: [0, 70], xLabel: 'outer index i', yLabel: 'doublings',
      curves: [{ label: 'running total $4i$', f: i => 4 * i, tone: 'a' }],
      bars: { label: 'doublings in pass i', tone: 'b', values: [[1, 4], [2, 4], [3, 4], [4, 4], [5, 4], [6, 4], [7, 4], [8, 4], [9, 4], [10, 4], [11, 4], [12, 4], [13, 4], [14, 4], [15, 4], [16, 4]] },
    },
    answer: '$n \\lceil \\lg n \\rceil$ doublings: $\\Theta(n \\lg n)$.',
    mistake: 'Answering $\\Theta(n^2)$ because there are two nested loops. Multiply the real lengths: $n$ outer passes × $\\lg n$ inner steps.',
    tryIt: { q: 'Tight bound on the number of times k = 2 * k runs in "for i = 1 to n: for j = 1 to n: k = 1; while k < n: k = 2 * k"? Count for $n = 8$.', a: '$n \\cdot n$ passes of a $\\lceil \\lg n \\rceil$-step loop: $n^2 \\lceil \\lg n \\rceil = \\Theta(n^2 \\lg n)$. For $n = 8$: $64 \\cdot 3 = 192$.' },
  };

  H['c310-3-code-halving-sum'] = {
    asks: 'Count how many times x = x + 1 runs in total, give a tight bound, and justify it.',
    idea: 'The inner loop runs $i$ times, and $i$ halves every round: $n$, then $n/2$, then $n/4$, … Each round is half the one before, so all the later rounds together add up to less than the first. Total: less than $2n$.',
    steps: [
      { text: 'Trace $n = 16$:', table: { head: ['round', '$i$', 'inner runs', 'total so far'], rows: [['1', '16', '16', '16'], ['2', '8', '8', '24'], ['3', '4', '4', '28'], ['4', '2', '2', '30'], ['5', '1', '1', '31']] } },
      'So the total is $16 + 8 + 4 + 2 + 1 = 31$. Write it as $S = 1 + 2 + 4 + 8 + 16$.',
      'Double it: $2S = 2 + 4 + 8 + 16 + 32$. Subtract $S$: every term cancels except $32 - 1$, so $S = 31 = 2n - 1$.',
      'For any $n$: $n + \\frac{n}{2} + \\frac{n}{4} + \\dots \\le n\\left(1 + \\tfrac12 + \\tfrac14 + \\dots\\right) < 2n$. Since the first round alone is $n$, $n \\le$ total $< 2n$: $\\Theta(n)$.',
      'The trap: $\\lg n$ rounds × at most $n$ each $= n \\lg n$ is a true upper bound but not tight, because most rounds are far shorter than $n$.',
    ],
    graph: {
      caption: 'Bars halve each round. The running total climbs toward the line $2n = 32$ but never reaches it (31 after round 5).',
      x: [0, 6], y: [0, 34], xLabel: 'round', yLabel: 'runs',
      curves: [{ label: 'running total $32 - 32/2^k$', f: k => 32 - 32 / Math.pow(2, k), tone: 'a' }, { label: 'ceiling $2n = 32$', f: () => 32, tone: 'c' }],
      bars: { label: 'inner runs in round k', tone: 'b', values: [[1, 16], [2, 8], [3, 4], [4, 2], [5, 1]] },
    },
    answer: '$\\Theta(n)$: the total is $n + n/2 + n/4 + \\dots + 1$, at least $n$ and less than $2n$ ($2n - 1$ when $n$ is a power of 2).',
    mistake: 'Multiplying "$\\lg n$ rounds × $n$" to get $\\Theta(n \\lg n)$. When the inner length shrinks, add the actual lengths instead of multiplying by the largest.',
    tryIt: { q: 'Same code but with i = floor(i / 3). Count for $n = 27$, and the tight bound?', a: '$27 + 9 + 3 + 1 = 40$. In general $n\\left(1 + \\tfrac13 + \\tfrac19 + \\dots\\right) < \\tfrac32 n$, and the total is at least $n$: $\\Theta(n)$.' },
  };

  H['c310-3-code-cubic'] = {
    asks: 'Find a tight bound on how many times sum = sum + 1 runs. There are three nested loops; decide whether all three add a factor of $n$.',
    idea: 'Multiply the lengths of the nested loops. Two have length $n$; the third has length 10 whatever $n$ is. A fixed 10 is a constant factor, and constants drop out of $\\Theta$.',
    steps: [
      'Innermost: "for k = 1 to 10" runs 10 times for each pair $(i, j)$.',
      'Middle: $n$ values of $j$ for each $i$; outer: $n$ values of $i$. So there are $n \\cdot n = n^2$ pairs $(i, j)$.',
      'Total: $10 \\cdot n^2 = 10n^2$. Check $n = 3$: 9 pairs × 10 $= 90$.',
      '$10n^2$ is $n^2$ stretched by 10. With $c_1 = c_2 = 10$: $10n^2 \\le 10n^2 \\le 10n^2$ for all $n \\ge 1$, so $10n^2 = \\Theta(n^2)$.',
      'Not $\\Theta(n^3)$: $\\frac{10n^2}{n^3} = \\frac{10}{n}$, which shrinks toward 0, so $n^3$ leaves $10n^2$ behind once $n > 10$.',
    ],
    graph: {
      caption: '$10n^2$ (the code) is the $n^2$ curve stretched 10 times taller: the same shape. $n^3$ crosses it at $n = 10$ and pulls away.',
      x: [0, 20], y: [0, 8000], xLabel: 'n', yLabel: 'runs',
      curves: [{ label: '$10n^2$ (the code)', f: n => 10 * n * n, tone: 'a' }, { label: '$n^2$', f: n => n * n, tone: 'b' }, { label: '$n^3$', f: n => n * n * n, tone: 'c' }],
      marks: [{ x: 10, label: '$n = 10$' }],
    },
    answer: '$\\Theta(n^2)$: the count is exactly $10n^2$; the fixed-length loop adds only a factor of 10.',
    mistake: 'Counting nesting depth: three loops does not mean $n^3$. Only loops whose length grows with $n$ add a factor of $n$.',
    tryIt: { q: 'Tight bound for "for i = 1 to 100: for j = 1 to n: x = x + 1"?', a: '$100 \\cdot n = 100n$ runs. The outer loop is a fixed 100, so $\\Theta(n)$.' },
  };

  // ---------------------------------------------------------------- Growth-rate ordering

  H['c310-3-common-order'] = {
    asks: 'Put the seven standard growth rates in order from slowest-growing to fastest-growing.',
    idea: 'Plug in a large $n$ and compare sizes; the order you see is the order from then on. Each class is the one before it multiplied by something that grows: $n \\lg n$ is $n$ times $\\lg n$, and $n^3$ is $n^2$ times $n$.',
    steps: [
      { text: 'Values at $n = 16$ and $n = 64$ (logs base 2):', table: { head: ['class', '$n = 16$', '$n = 64$'], rows: [['$1$', '1', '1'], ['$\\lg n$', '4', '6'], ['$n$', '16', '64'], ['$n \\lg n$', '64', '384'], ['$n^2$', '256', '4096'], ['$n^3$', '4096', '262144'], ['$2^n$', '65536', 'about $1.8 \\times 10^{19}$']] } },
      'Neighbours differ by a growing factor: $\\frac{n \\lg n}{n} = \\lg n$ and $\\frac{n^2}{n \\lg n} = \\frac{n}{\\lg n}$. Both factors grow without limit, so the later class pulls ahead.',
      'Small $n$ can mislead: at $n = 9$, $2^9 = 512 < 729 = 9^3$. From $n = 10$ ($1024 > 1000$) $2^n$ stays ahead, because adding 1 to $n$ doubles $2^n$ while $n^3$ grows by a smaller and smaller percentage.',
      'Names, in order: constant, logarithmic, linear, linearithmic, quadratic, cubic, exponential.',
    ],
    graph: {
      caption: 'The y axis is logarithmic (each step up is ×10). Each curve ends above the one before it; $2^n$ starts below $n^3$ and overtakes it at $n = 10$.',
      x: [2, 40], logY: true, xLabel: 'n', yLabel: 'value (log scale)',
      curves: [{ label: '$\\lg n$', f: n => Math.log2(n), tone: 'a' }, { label: '$n \\lg n$', f: n => n * Math.log2(n), tone: 'b' }, { label: '$n^3$', f: n => n * n * n, tone: 'c' }, { label: '$2^n$', f: n => Math.pow(2, n), tone: 'd' }],
      marks: [{ x: 10, label: '$2^n$ passes $n^3$' }],
    },
    answer: 'Slowest to fastest: $\\Theta(1)$, $\\Theta(\\log n)$, $\\Theta(n)$, $\\Theta(n \\log n)$, $\\Theta(n^2)$, $\\Theta(n^3)$, $\\Theta(b^n)$ with $b > 1$.',
    mistake: 'Ordering by a small $n$, where $n^3$ beats $2^n$ (at $n = 5$: 125 vs. 32). Growth order is about large $n$, so test with a large value.',
    tryIt: { q: 'Order slowest to fastest: $n^2$, $500$, $n \\lg n$, $20n$, $\\lg n$.', a: '$500$, $\\lg n$, $20n$, $n \\lg n$, $n^2$. Constant factors do not change the class: $500$ is $\\Theta(1)$ and $20n$ is $\\Theta(n)$.' },
  };
})(globalThis.FC = globalThis.FC || {});
