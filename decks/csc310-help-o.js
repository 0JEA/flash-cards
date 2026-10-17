// Help walkthroughs for CSC 310 Lectures 3–6 (minus the master theorem): growth ordering,
// Big-O/Omega/Theta facts, divide and conquer, recursive algorithms, merge sort, recurrence
// basics, the iteration method and the substitution method (FC.csc310Cards, ids c310-3-*,
// c310-4-*, c310-5-iter*, c310-5-findmax-iter, c310-6-*). Same entry format as
// decks/csc310-help.js (see its header comment).
// ACADEMIC INTEGRITY: no Assignment 1 or Assignment 2 question, function pair or recurrence is
// used anywhere here; every example and tryIt uses other functions and recurrences, and no
// uneven split appears.
// Slide slips noted where relevant: Lecture 4 slide 43 has a stray factor 2 ("2cn(log n − log 2)")
// and both substitution slides end "≤ n log n" where it should be "≤ c n lg n".
// Every expansion, closed form, table value, constant and tryIt answer was checked with python3
// (exact integers / fractions) on 2026-10-16.
(function (FC) {
  'use strict';
  const H = FC.help = FC.help || {};
  const lg = x => Math.log2(x);

  // Merge sort's recursion tree for T(n) = 2T(n/2) + cn, T(1) = c.
  const MS_TREE = {
    sumsLabel: 'level total',
    levels: [
      { nodes: ['$cn$'], sum: '$cn$' },
      { nodes: ['$c\\tfrac{n}{2}$', '$c\\tfrac{n}{2}$'], sum: '$cn$' },
      { nodes: ['$c\\tfrac{n}{4}$', '$c\\tfrac{n}{4}$', '$c\\tfrac{n}{4}$', '$c\\tfrac{n}{4}$'], sum: '$cn$' },
      { gap: true },
      { nodes: ['$c$', '$c$', '$\\cdots$', '$c$', '$c$'], sum: '$n \\cdot c = cn$' },
    ],
  };

  // ---------------------------------------------------------------- Lecture 3

  H['c310-3-rate-def'] = {
    asks: 'Two things: what "rate of growth" means for a running time $T(n)$, and the recipe for getting it from an exact formula such as $0.3n^2 + 10n + 20$.',
    idea: 'Ask what happens to $T(n)$ when $n$ gets big. One term ends up doing almost all the work and the others become rounding error. The rate of growth is that one term with its constant multiplier removed.',
    steps: [
      'Rate of growth means how fast $T(n)$ grows as $n$ grows. Only large $n$ matters, because small inputs are fast anyway.',
      { text: 'Split $T(n) = 0.3n^2 + 10n + 20$ into its parts and watch which one takes over:', table: { head: ['$n$', '$0.3n^2$', '$10n + 20$', 'share of $0.3n^2$'], rows: [['10', '30', '120', '20%'], ['100', '3000', '1020', '74.6%'], ['1000', '300000', '10020', '96.8%']] } },
      'Keep the most significant term, $0.3n^2$. Cast aside the lower-order terms $10n + 20$: their share shrinks toward 0.',
      'Drop the constant $0.3$ too, because it does not change how the time scales. Doubling $n$ multiplies $0.3n^2$ by 4, and it would multiply $5n^2$ by 4 as well, so the growth is $n^2$.',
    ],
    graph: {
      caption: 'The share of $T(n)$ that comes from $0.3n^2$. It passes one half near $n = 36$ and keeps climbing toward 1: for large $n$, the $n^2$ term is the running time.',
      x: [1, 1000], y: [0, 1], xLabel: 'n', yLabel: 'share',
      curves: [{ label: '$\\dfrac{0.3n^2}{0.3n^2 + 10n + 20}$', f: n => 0.3 * n * n / (0.3 * n * n + 10 * n + 20), tone: 'a' }],
      marks: [{ x: 36, label: '$n = 36$' }],
    },
    answer: 'Rate of growth is how fast $T(n)$ grows with respect to $n$. To get it, keep the most significant term and cast aside the rest: lower-order terms and constant coefficients. $0.3n^2 + 10n + 20$ grows as $n^2$.',
    mistake: 'Dropping only one of the two things: writing "$n^2 + n$" (kept a lower-order term) or "$0.3n^2$" (kept the constant). Both go.',
    tryIt: { q: 'What is the rate of growth of $T(n) = 5n^3 + 2n^2 + 100$?', a: '$n^3$ (cubic). At $n = 100$, $5n^3 = 5{,}000{,}000$ while $2n^2 + 100 = 20{,}100$, so $5n^3$ is over 99% of the total. Drop the rest and the 5.' },
  };

  H['c310-3-drop-terms'] = {
    asks: 'For small $n$ the "small" part $10n + 20$ is actually bigger than $0.3n^2$. Why do we still say $T(n)$ grows like $n^2$?',
    idea: 'A race between a slow starter that keeps accelerating ($0.3n^2$) and a fast starter that never speeds up ($10n + 20$). The fast starter leads early, but once it is passed it falls further behind at every step. Asymptotic analysis only looks at the race far down the track.',
    steps: [
      { text: 'Compare the two parts at a few values:', table: { head: ['$n$', '$0.3n^2$', '$10n + 20$', 'bigger'], rows: [['10', '30', '120', '$10n + 20$'], ['35', '367.5', '370', '$10n + 20$'], ['36', '388.8', '380', '$0.3n^2$'], ['100', '3000', '1020', '$0.3n^2$']] } },
      'From $n = 36$ on, $0.3n^2$ is the bigger part. The next card finds that point exactly.',
      'The lead keeps widening: the gap $0.3n^2 - (10n + 20)$ is $8.8$ at $n = 36$ and $1980$ at $n = 100$. A quadratic minus a linear function grows without limit.',
      'So for large $n$ the $n^2$ term decides the running time. Drop $10n + 20$ and the constant $0.3$: $T(n) = \\Theta(n^2)$.',
    ],
    graph: {
      caption: 'The straight line leads until $n = 36$; after that the parabola is above it and the gap keeps growing.',
      x: [0, 60], y: [0, 1100], xLabel: 'n', yLabel: 'value',
      curves: [{ label: '$0.3n^2$', f: n => 0.3 * n * n, tone: 'a' }, { label: '$10n + 20$', f: n => 10 * n + 20, tone: 'b' }],
      marks: [{ x: 36, label: '$n = 36$' }],
      from: 36,
    },
    answer: 'Because $0.3n^2$ passes $10n + 20$ at $n = 36$ and its lead keeps growing. Only large $n$ counts, so $n^2$ is the most significant factor: drop the lower-order terms and the constant, and the growth is quadratic, $\\Theta(n^2)$.',
    mistake: 'Deciding growth by which term is bigger at small $n$. Any $an^2$ with $a > 0$ eventually beats any linear $bn + d$, however big $b$ and $d$ are.',
    tryIt: { q: 'For $T(n) = 0.5n^2 + 20n + 50$, from which $n$ on is $0.5n^2$ the bigger part? What is the growth?', a: 'First at $n = 43$: $924.5 > 910$ (at $n = 42$, $882 < 890$). Growth $\\Theta(n^2)$.' },
  };

  H['c310-3-crossover'] = {
    asks: 'Find the first whole number $n$ at which $0.3n^2$ is strictly bigger than $10n + 20$.',
    idea: 'Move everything to one side and find where the parabola $0.3n^2 - 10n - 20$ crosses zero. Left of the crossing it is negative, right of it positive. The answer is the first whole number past the crossing.',
    steps: [
      '$0.3n^2 > 10n + 20 \\iff 0.3n^2 - 10n - 20 > 0$ (subtract $10n + 20$). Multiply by 10 to clear the decimal: $3n^2 - 100n - 200 > 0$.',
      'Quadratic formula with $a = 3$, $b = -100$, $c = -200$: $n = \\frac{100 \\pm \\sqrt{100^2 + 4 \\cdot 3 \\cdot 200}}{2 \\cdot 3} = \\frac{100 \\pm \\sqrt{12400}}{6}$.',
      '$\\sqrt{12400} \\approx 111.36$, so the positive root is $\\frac{211.36}{6} \\approx 35.23$. The other root is negative and does not matter.',
      'The parabola opens upward, so it is positive for $n > 35.23$. The first whole number past 35.23 is 36.',
      { text: 'Check the integers around the root:', table: { head: ['$n$', '$0.3n^2$', '$10n + 20$', '$0.3n^2 > 10n + 20$?'], rows: [['34', '346.8', '360', 'no'], ['35', '367.5', '370', 'no'], ['36', '388.8', '380', 'yes'], ['37', '410.7', '390', 'yes']] } },
    ],
    graph: {
      caption: 'The difference $0.3n^2 - 10n - 20$ crosses zero at $n \\approx 35.23$. It is negative at 35 and positive from 36 on.',
      x: [30, 40], xLabel: 'n', yLabel: 'difference',
      curves: [{ label: '$0.3n^2 - 10n - 20$', f: n => 0.3 * n * n - 10 * n - 20, tone: 'a' }],
      marks: [{ x: 35.23, label: '$n \\approx 35.23$' }],
      from: 36,
    },
    answer: '36. The crossing is at $n \\approx 35.23$; at $n = 35$, $367.5 < 370$, and at $n = 36$, $388.8 > 380$.',
    mistake: 'Rounding the root to the nearest whole number (35). A root of 35.23 means 35 is still on the wrong side: round up, then check that integer.',
    tryIt: { q: 'What is the smallest positive integer $n$ with $0.2n^2 > 8n + 30$?', a: 'Multiply by 5: $n^2 - 40n - 150 > 0$. Root $n = 20 + \\sqrt{550} \\approx 43.45$, so $n = 44$. Check: at 43, $369.8 < 374$; at 44, $387.2 > 382$.' },
  };

  H['c310-3-ins-omega-O'] = {
    asks: 'Decide whether both statements hold for insertion sort over every possible input: "at least about $n$" ($\\Omega(n)$) and "at most about $n^2$" ($O(n^2)$).',
    idea: 'Every input’s running time lands somewhere between the best case (sorted input) and the worst case (reversed input). A floor under the best case is a floor under everything, and a ceiling over the worst case is a ceiling over everything.',
    steps: [
      'Count the comparisons $A[i] > key$ on line 4. Sorted input: each $j$ compares once and stops, so $n - 1$ comparisons in total, the best case, $\\Theta(n)$.',
      'Reversed input: $A[j]$ is compared with all $j - 1$ elements before it, so $1 + 2 + \\dots + (n-1) = \\frac{n(n-1)}{2}$ comparisons, the worst case, $\\Theta(n^2)$.',
      { text: 'Every other input falls between these two columns:', table: { head: ['$n$', 'best: $n - 1$', 'worst: $\\frac{n(n-1)}{2}$'], rows: [['5', '4', '10'], ['10', '9', '45'], ['100', '99', '4950']] } },
      '$\\Omega(n)$: no input does less work than the best case, and the best case is linear. So every input takes at least $c\\,n$ time for large $n$.',
      '$O(n^2)$: no input does more work than the worst case, which is quadratic. So every input takes at most $c\\,n^2$ time, and both statements are true.',
    ],
    graph: {
      caption: 'The comparison count of any input lies in the band between the two curves. The bottom curve is linear (the floor), the top is quadratic (the ceiling).',
      x: [2, 20], xLabel: 'n', yLabel: 'comparisons',
      curves: [{ label: 'worst $\\frac{n(n-1)}{2}$', f: n => n * (n - 1) / 2, tone: 'b' }, { label: 'best $n - 1$', f: n => n - 1, tone: 'a' }],
    },
    answer: 'True. The best case (sorted input) is $\\Theta(n)$, so every input takes at least linear time: $\\Omega(n)$. The worst case (reversed input) is $\\Theta(n^2)$, so every input takes at most quadratic time: $O(n^2)$.',
    mistake: 'Writing "insertion sort is $\\Theta(n^2)$" with no case attached: that is only the worst case, and sorted input runs in $\\Theta(n)$. Over all inputs, only the pair $\\Omega(n)$ and $O(n^2)$ is correct.',
    tryIt: { q: 'The loop version of FindMax always makes exactly $n - 1$ comparisons. Over all inputs, is its time in $\\Omega(n)$? In $O(n^2)$? Is there one $\\Theta$ for every input?', a: 'Yes and yes ($n - 1 \\ge \\tfrac12 n$ for $n \\ge 2$, and $n - 1 \\le n^2$). Its best and worst cases are the same, $n - 1$, so $\\Theta(n)$ holds for every input, unlike insertion sort.' },
  };

  H['c310-3-binsearch-omega'] = {
    asks: '"Binary search is $\\Omega(\\log n)$" says binary search needs at least about $\\log n$ steps. Say which case makes that true, and show an input where it fails.',
    idea: 'A lower bound for "every input" has to hold even for the luckiest input. Binary search’s luckiest input has the key exactly in the middle, found on the first look. One step is not "at least $c \\log n$" once $n$ is large.',
    steps: [
      { text: 'Worst case (key absent): each round halves the search range until it has size 1. For $n = 16$:', table: { head: ['round', 'range size'], rows: [['1', '16'], ['2', '8'], ['3', '4'], ['4', '2'], ['5', '1']] } },
      'That is about $\\lg n + 1$ rounds ($n/2^k = 1 \\Rightarrow k = \\lg n$, slide 15). So the worst case is $\\Theta(\\log n)$, and in particular $\\Omega(\\log n)$.',
      'Best case: the key is at $A[m]$ in round 1. That is one round whatever the size of $n$, so $\\Theta(1)$.',
      '"Every input takes at least $c \\log n$" would need $1 \\ge c \\log n$ in the best case for all large $n$. But $c \\log n$ passes 1 eventually (for $c = 0.5$, once $n > 4$), so the best case breaks it.',
    ],
    graph: {
      caption: 'The worst case climbs like $\\lg n$; the best case stays at 1. Any line $c \\lg n$ (here $c = 0.5$) rises above the best case, past $n = 4$ for this $c$.',
      x: [2, 256], xLabel: 'n', yLabel: 'rounds',
      curves: [{ label: 'worst $\\lg n + 1$', f: n => lg(n) + 1, tone: 'b' }, { label: '$0.5 \\lg n$', f: n => 0.5 * lg(n), tone: 'c' }, { label: 'best $1$', f: () => 1, tone: 'a' }],
      marks: [{ x: 4, label: '$n = 4$' }],
    },
    answer: 'True for the worst-case running time, which is $\\Theta(\\log n)$ and hence $\\Omega(\\log n)$. False as a bound on every input: the best case finds the key in one comparison, $\\Theta(1)$, which is not $\\ge c \\log n$.',
    mistake: 'Reading $\\Omega$ as "best case" automatically. $\\Omega$ is a lower bound on whatever function you name, so name it: "worst-case time is $\\Omega(\\log n)$" is true, "time on every input is $\\Omega(\\log n)$" is false.',
    tryIt: { q: 'Slide 19 also says linear search is $\\Omega(n)$. True for the worst case? For every input?', a: 'Worst case (key absent): all $n$ elements are checked, so yes. Every input: no. If the key is in $A[1]$ the loop returns after one check, $\\Theta(1)$.' },
  };

  H['c310-3-nlogn-name'] = {
    asks: 'The growth rate $n \\log n$ has its own one-word name on slide 11. What is it?',
    idea: 'Glue the two words together: linear ($n$) times logarithmic ($\\log n$) gives lin-earithmic. On the slide 11 ladder it sits between linear and quadratic.',
    steps: [
      'Slide 11, slowest to fastest: constant $\\Theta(1)$, logarithmic $\\Theta(\\log n)$, linear $\\Theta(n)$, linearithmic $\\Theta(n \\log n)$, quadratic $\\Theta(n^2)$, cubic $\\Theta(n^3)$, exponential $\\Theta(b^n)$.',
      { text: '$n \\lg n$ is $n$ multiplied by $\\lg n$, and $\\lg n$ is far smaller than $n$, so it lands between $n$ and $n^2$:', table: { head: ['$n$', '$n$', '$n \\lg n$', '$n^2$'], rows: [['8', '8', '24', '64'], ['64', '64', '384', '4096'], ['1024', '1024', '10240', '1048576']] } },
      'Merge sort is the standard example: about $\\lg n$ levels of splitting with $n$ work per level gives $n \\lg n$.',
    ],
    graph: {
      caption: 'On a log scale the ladder is easy to see: $n \\lg n$ runs just above $n$ and far below $n^2$.',
      x: [2, 1024], logY: true, xLabel: 'n', yLabel: 'value (log scale)',
      curves: [
        { label: '$\\lg n$', f: n => lg(n), tone: 'c' },
        { label: '$n$', f: n => n, tone: 'a' },
        { label: '$n \\lg n$', f: n => n * lg(n), tone: 'b' },
        { label: '$n^2$', f: n => n * n, tone: 'd' },
      ],
    },
    answer: 'Linearithmic.',
    mistake: 'Calling it "logarithmic". Logarithmic is $\\log n$ alone, which grows much more slowly; $n \\log n$ grows a little faster than linear.',
    tryIt: { q: 'Name $\\Theta(n^3)$ and $\\Theta(\\log n)$, and order them with $\\Theta(n \\log n)$.', a: 'Cubic and logarithmic. Order: $\\log n$ (logarithmic) $<$ $n \\log n$ (linearithmic) $<$ $n^3$ (cubic).' },
  };

  H['c310-3-theta-intuition'] = {
    asks: 'Say in plain words what "the worst-case time of linear search is $\\Theta(n)$" promises.',
    idea: 'A sandwich between two straight lines through the origin. Past some point, the time is never below a gentle line $c_1 n$ and never above a steeper line $c_2 n$. So it grows exactly like $n$: double $n$ and the time roughly doubles.',
    steps: [
      'Worst case: the key is absent, so all $n$ elements are checked. Slide 8 writes this as $c_1 n + c_2$; take concrete costs, 3 units per check and 5 for setup and return: $T(n) = 3n + 5$.',
      'Floor: $3n \\le 3n + 5$ for every $n \\ge 1$. So the lower line is $3n$.',
      'Ceiling: $3n + 5 \\le 4n \\iff 5 \\le n$ (subtract $3n$ from both sides). So from $n = 5$ on, the upper line is $4n$.',
      { text: 'Check the sandwich:', table: { head: ['$n$', '$3n$', '$T(n) = 3n + 5$', '$4n$', 'inside?'], rows: [['2', '6', '11', '8', 'no'], ['5', '15', '20', '20', 'yes'], ['10', '30', '35', '40', 'yes'], ['100', '300', '305', '400', 'yes']] } },
      'So $T(n) = \\Theta(n)$ with constants 3 and 4 from $n_0 = 5$ on. These are the $c_1, c_2$ of the $\\Theta$ definition, not the costs on slide 8.',
    ],
    graph: {
      caption: 'From $n_0 = 5$ on, $T(n) = 3n + 5$ stays between the lines $3n$ and $4n$: a tight bound, from above and from below.',
      x: [0, 20], y: [0, 85], xLabel: 'n', yLabel: 'time',
      curves: [{ label: '$c_1 n = 3n$', f: n => 3 * n, tone: 'c' }, { label: '$T(n) = 3n + 5$', f: n => 3 * n + 5, tone: 'a' }, { label: '$c_2 n = 4n$', f: n => 4 * n, tone: 'b' }],
      marks: [{ x: 5, label: '$n_0 = 5$' }],
      from: 5,
    },
    answer: 'Once $n$ is large enough, the worst-case time is at least $c_1 n$ and at most $c_2 n$ for some positive constants $c_1, c_2$. It is sandwiched between two lines: an asymptotically tight bound, so it grows linearly.',
    mistake: 'Reading $\\Theta(n)$ as "exactly $n$ steps". It allows any constant multiplier and any lower-order extra, as long as both lines hold from some $n_0$ on.',
    tryIt: { q: 'A worst case is $T(n) = 2n + 9$. Give $c_1$, $c_2$ and $n_0$ that show $T(n) = \\Theta(n)$.', a: '$c_1 = 2$, since $2n \\le 2n + 9$ always. $2n + 9 \\le 3n \\iff n \\ge 9$, so $c_2 = 3$ and $n_0 = 9$.' },
  };

  // ---------------------------------------------------------------- Lecture 4: divide and conquer

  H['c310-4-dc-steps'] = {
    asks: 'Put the three steps that divide and conquer performs at every level of the recursion in order.',
    idea: 'Sorting a pile of exam papers with friends: split the pile in two (divide), each half gets sorted the same way (conquer), then you zip the two sorted halves together (combine). The order is forced, because you cannot combine answers you do not have yet.',
    steps: [
      'Divide: split the problem into smaller instances of the same problem. Merge sort computes mid and splits A[left..right] into two halves.',
      'Conquer: solve each piece recursively. A piece that is small enough (one element) is solved directly.',
      'Combine: build the full answer from the pieces’ answers. Merge sort calls Merge on the two sorted halves.',
      { text: 'The same three steps in two algorithms:', table: { head: ['step', 'merge sort', 'FindMax'], rows: [['Divide', 'mid = (left + right)/2', 'mid = (left + right)/2'], ['Conquer', 'sort both halves', 'max of each half'], ['Combine', 'Merge the halves', 'return the larger max']] } },
    ],
    tree: {
      levels: [
        { nodes: ['8 7 5 1'] },
        { nodes: ['8 7', '5 1'] },
        { nodes: ['8', '7', '5', '1'] },
      ],
      caption: 'Divide goes down the tree until pieces have one element. Combine happens on the way back up: 7 8 and 1 5, then 1 5 7 8.',
    },
    answer: 'Divide, Conquer, Combine.',
    mistake: 'Putting Combine before Conquer. Combine works on solved subproblems, so it always comes last.',
    tryIt: { q: 'Name binary search’s divide, conquer and combine steps.', a: 'Divide: compare the key with $A[m]$ and keep one half. Conquer: search that half recursively. Combine: nothing to do, the half’s answer is the answer.' },
  };

  H['c310-4-dc-divide'] = {
    asks: 'Say what the Divide step produces and the two conditions its subproblems must meet.',
    idea: 'Cut the job into pieces that are the same kind of job, only smaller, and that share no work. If two pieces overlap, the same work is done twice; that situation belongs to a different technique (dynamic programming).',
    steps: [
      '"Smaller instances of the same problem": sorting A[1..8] becomes sorting A[1..4] and sorting A[5..8]. Still sorting, just shorter arrays, so the same algorithm handles them.',
      '"Non-overlapping": A[1..4] and A[5..8] share no element. Every element belongs to exactly one piece, so no work is repeated.',
      { text: 'Merge sort’s pieces for $n = 8$ cover the array exactly once at every level:', table: { head: ['level', 'subarrays'], rows: [['0', 'A[1..8]'], ['1', 'A[1..4], A[5..8]'], ['2', 'A[1..2], A[3..4], A[5..6], A[7..8]'], ['3', 'A[1], A[2], …, A[8]']] } },
      'Contrast: Fib($n$) calls Fib($n-1$) and Fib($n-2$), and Fib($n-1$) calls Fib($n-2$) again. Those subproblems overlap, so naive recursion repeats work.',
    ],
    answer: 'It splits the problem into a number of subproblems that are smaller instances of the same problem, and the subproblems do not overlap.',
    mistake: 'Thinking the pieces must be exactly equal halves. They must be smaller and non-overlapping; merge sort on 9 elements splits them 5 and 4.',
    tryIt: { q: 'Is splitting A[1..10] into A[1..6] and A[5..10] a valid Divide for merge sort?', a: 'No. A[5] and A[6] are in both pieces: they would be sorted twice and appear twice after merging (12 elements out of 10).' },
  };

  H['c310-4-dc-conquer'] = {
    asks: 'What happens in the Conquer step, and what happens when a subproblem is tiny?',
    idea: 'Conquer means "trust the recursion": hand each piece to the same algorithm. The recursion has to stop somewhere, so a piece that is small enough is answered directly. That direct answer is the base case.',
    steps: [
      'Conquer solves each subproblem by calling the algorithm on it recursively.',
      'Each call divides again, so the pieces keep shrinking: for merge sort, $n \\to n/2 \\to n/4 \\to \\dots$',
      'When a piece is small enough, solve it straightforwardly. Merge sort: one element (left = right) is already sorted, so do nothing; FindMax: one element, return A[right].',
      { text: 'FindMax on A[1..4] = 3, 9, 2, 6:', table: { head: ['call', 'size', 'what happens'], rows: [['FindMax(A, 1, 4)', '4', 'divide, two calls'], ['FindMax(A, 1, 2)', '2', 'divide, two calls'], ['FindMax(A, 3, 4)', '2', 'divide, two calls'], ['FindMax(A, i, i), i = 1..4', '1', 'base case: return A[i]']] } },
      'On the way back up: the larger of 3 and 9 is 9, the larger of 2 and 6 is 6, and the larger of 9 and 6 is 9.',
    ],
    answer: 'It solves the subproblems recursively. When a subproblem is small enough, it is solved directly (the base case).',
    mistake: 'Leaving out the base case. Without it the recursion never stops, and the recurrence has no $T(1)$ to end on.',
    tryIt: { q: 'Recursive FindMax on 8 elements: how many calls in total, and how many are base cases?', a: 'One base case per element: 8. Calls: $1 + 2 + 4 + 8 = 15$.' },
  };

  H['c310-4-dc-combine'] = {
    asks: 'What does the Combine step do in general, and what exactly is it in merge sort and in recursive FindMax?',
    idea: 'Combine is the glue work done after the recursive calls come back. Its cost per call is the added term $f(n)$ in the recurrence, so it shapes the running time: merge sort glues with a linear pass, FindMax with one comparison.',
    steps: [
      'Combine turns the subproblems’ answers into the answer for the whole problem.',
      'Merge sort: the halves come back sorted, for example 1 5 and 2 6. Merge walks both and always takes the smaller front, giving 1 2 5 6; every element moves once, so $\\Theta(n)$.',
      'FindMax: the halves come back as two numbers, for example 9 and 6. One comparison picks 9, which is $\\Theta(1)$.',
      { text: 'The combine cost becomes the added term of the recurrence:', table: { head: ['algorithm', 'combine', 'cost', 'recurrence'], rows: [['merge sort', 'Merge', '$\\Theta(n)$', '$2T(n/2) + \\Theta(n)$'], ['FindMax', 'larger of two', '$\\Theta(1)$', '$2T(n/2) + \\Theta(1)$']] } },
    ],
    answer: 'It combines the subproblem solutions into the solution of the original problem. Merge sort: Merge the two sorted halves, $\\Theta(n)$. FindMax: return the larger of the two halves’ maxima, $\\Theta(1)$.',
    mistake: 'Charging the linear cost to the Divide step. In merge sort, Divide (computing mid) is $\\Theta(1)$; the $\\Theta(n)$ is all in Merge.',
    tryIt: { q: 'A recursive Sum(A, left, right) adds up an array by summing each half. What is its combine step, and what does it cost?', a: 'Add the two halves’ sums: one addition, $\\Theta(1)$. Recurrence $2T(n/2) + \\Theta(1)$, the same shape as FindMax.' },
  };

  H['c310-4-recursive-parts'] = {
    asks: 'List the four parts that slide 5 says a recursive algorithm consists of.',
    idea: 'Read any recursive function from top to bottom and you meet them in order: "am I small enough to answer now?", "cut the input", "call myself on the pieces", "put the answers together".',
    steps: [
      'Base case: the input is small enough to answer without recursing.',
      'Work to divide the input into smaller subproblems.',
      'The recursive calls on those subproblems.',
      'End work to combine the solutions of the recursive calls.',
      { text: 'All four in FindMax (slide 8):', table: { head: ['part', 'FindMax line', 'D&C step'], rows: [['base case', 'if (left ≥ right) return A[right]', 'stop'], ['divide work', 'mid = (left + right)/2', 'Divide'], ['recursive calls', 'FindMax(A, left, mid), FindMax(A, mid+1, right)', 'Conquer'], ['end work', 'return the larger of first, second', 'Combine']] } },
    ],
    answer: 'A base case; work to divide the input into smaller subproblems; the recursive calls; end work to combine the solutions of the recursive calls.',
    mistake: 'Listing only "base case and recursive call". The course’s list also has the divide work and the end (combine) work, which is where the non-recursive cost comes from.',
    tryIt: { q: 'Find the four parts in Factorial(n): if n == 0 return 1, else return n * Factorial(n − 1).', a: 'Base case: n == 0 returns 1. Divide work: form n − 1. Recursive call: Factorial(n − 1). End work: multiply its result by n.' },
  };

  H['c310-4-factorial'] = {
    asks: 'Write Factorial recursively, then turn the code into a running-time recurrence and solve it.',
    idea: 'Each call does a fixed amount of work (one test, one multiply) and hands off to a problem one smaller. So the time is one unit per call times the number of calls, and there are about $n$ calls.',
    steps: [
      'Code (slide 6): Factorial(n): if (n == 0) return 1; else return n * Factorial(n − 1).',
      'One call costs a comparison and a multiplication besides the recursion: constant, call it 1. The recursive call is on $n - 1$, so $T(n) = T(n-1) + 1$.',
      'Iterate: $T(n) = 1 + T(n-1) = 2 + T(n-2) = 3 + T(n-3) = \\dots = k + T(n-k)$.',
      'Stop at the base case. The slides use $n - k = 1$, so $k = n - 1$ and $T(n) = (n - 1) + T(1) = \\Theta(n)$.',
      { text: 'Factorial(4) makes 5 calls, one per value from 4 down to 0:', table: { head: ['call', 'returns'], rows: [['Factorial(4)', '4 · 6 = 24'], ['Factorial(3)', '3 · 2 = 6'], ['Factorial(2)', '2 · 1 = 2'], ['Factorial(1)', '1 · 1 = 1'], ['Factorial(0)', '1 (base case)']] } },
    ],
    answer: 'if $n = 0$ return 1, else return $n \\cdot$ Factorial($n - 1$). $T(n) = T(n-1) + 1$, which solves to $T(n) = k + T(n-k)$; with $k = n - 1$, $T(n) = n - 1 + T(1) = \\Theta(n)$.',
    mistake: 'Mixing up the value and the time. The value $n!$ grows enormously, but the time is one multiplication per call: $\\Theta(n)$.',
    tryIt: { q: 'Sum(n) returns $1 + 2 + \\dots + n$: if n == 0 return 0, else return n + Sum(n − 1). Recurrence and solution?', a: '$T(n) = T(n-1) + 1$, the same shape as Factorial. So $T(n) = k + T(n-k)$ and $T(n) = \\Theta(n)$.' },
  };

  H['c310-4-fib-code'] = {
    asks: 'Turn the definition $F_0 = 1$, $F_1 = 1$, $F_n = F_{n-1} + F_{n-2}$ into a recursive algorithm.',
    idea: 'The definition already is the algorithm: the given values become base cases, the formula becomes the recursive case. Because the formula reaches back two steps, you need two base cases.',
    steps: [
      'Base cases from $F_0 = 1$ and $F_1 = 1$: if $n = 0$ or $n = 1$, return 1.',
      'Recursive case from $F_n = F_{n-1} + F_{n-2}$: return Fib($n - 1$) + Fib($n - 2$).',
      'Why two base cases: with only $n = 0$, Fib(1) would call Fib(0) and Fib($-1$), and Fib($-1$) never stops.',
      { text: 'The number of calls grows like the Fibonacci numbers themselves:', table: { head: ['$n$', '$F_n$', 'calls made by Fib($n$)'], rows: [['0', '1', '1'], ['1', '1', '1'], ['2', '2', '3'], ['3', '3', '5'], ['4', '5', '9'], ['5', '8', '15'], ['10', '89', '177']] } },
      'The calls overlap: Fib(4) computes Fib(2) twice and Fib(1) three times. That repeated work makes the naive version exponential.',
    ],
    graph: {
      caption: 'Calls made by Fib($n$), on a log scale. Equal steps up on a log scale mean the count multiplies by about the same factor (about 1.6) each time: exponential growth.',
      x: [-0.5, 10.5], y: [0.5, 300], logY: true, xLabel: 'n', yLabel: 'calls (log scale)',
      bars: { label: 'calls made by Fib($n$)', tone: 'b', values: [[0, 1], [1, 1], [2, 3], [3, 5], [4, 9], [5, 15], [6, 25], [7, 41], [8, 67], [9, 109], [10, 177]] },
    },
    answer: 'Fib($n$): if $n = 0$ or $n = 1$ return 1; else return Fib($n - 1$) + Fib($n - 2$).',
    mistake: 'Writing one base case, or returning 0 for $n = 0$. This course defines $F_0 = 1$, so both base cases return 1.',
    tryIt: { q: 'Write a recursive G($n$) for $G_0 = 2$, $G_1 = 1$, $G_n = G_{n-1} + G_{n-2}$, and find $G_4$.', a: 'If $n = 0$ return 2; if $n = 1$ return 1; else return G($n - 1$) + G($n - 2$). $G_2 = 3$, $G_3 = 4$, $G_4 = 7$.' },
  };

  H['c310-4-fib-value'] = {
    asks: 'Compute $F_5$ using this course’s starting values $F_0 = 1$, $F_1 = 1$.',
    idea: 'Build up from the bottom: each new term is the sum of the two before it. Writing the list is faster and safer than expanding the recursion.',
    steps: [
      '$F_0 = 1$ and $F_1 = 1$ are given.',
      '$F_2 = F_1 + F_0 = 1 + 1 = 2$.',
      '$F_3 = F_2 + F_1 = 2 + 1 = 3$, and $F_4 = F_3 + F_2 = 3 + 2 = 5$.',
      '$F_5 = F_4 + F_3 = 5 + 3 = 8$.',
    ],
    answer: '$F_5 = 8$. The list is 1, 1, 2, 3, 5, 8.',
    mistake: 'Using the common textbook start $F_0 = 0$, $F_1 = 1$, which gives $F_5 = 5$. Use the starting values the question gives.',
    tryIt: { q: 'Same definition: what is $F_7$?', a: 'Continue the list: $F_6 = 8 + 5 = 13$, $F_7 = 13 + 8 = 21$.' },
  };

  H['c310-4-findmax-recurrence'] = {
    asks: 'Read the FindMax code and write $T(n)$, its time on $n$ elements, as a recurrence. Say where each term comes from.',
    idea: 'Go through the code line by line and charge each line its cost. A line that calls FindMax on half the array costs "$T$ of half", $T(n/2)$. Everything else is a fixed number of operations.',
    steps: [
      { text: 'Charge each line:', table: { head: ['line', 'cost'], rows: [['if (left ≥ right)', '$\\Theta(1)$'], ['return A[right] (only when $n = 1$)', '$\\Theta(1)$'], ['mid = (left + right)/2', '$\\Theta(1)$'], ['first = FindMax(A, left, mid)', '$T(n/2)$'], ['second = FindMax(A, mid+1, right)', '$T(n/2)$'], ['if first > second … return', '$\\Theta(1)$']] } },
      'Base case $n = 1$: only the test and the return run, so $T(1) = \\Theta(1)$.',
      'For $n > 1$: the two calls on halves give $T(n/2) + T(n/2) = 2T(n/2)$.',
      'The rest (test, mid, one comparison) is a constant number of steps, and constants added together stay constant: $\\Theta(1)$.',
      'So $T(n) = 2T(n/2) + \\Theta(1)$ for $n > 1$. It solves to $\\Theta(n)$; with every $\\Theta(1)$ counted as 1, $T(n) = 2n - 1$.',
    ],
    answer: '$T(n) = \\Theta(1)$ if $n = 1$, and $T(n) = 2T(n/2) + \\Theta(1)$ if $n > 1$. The two half-size calls give $2T(n/2)$; computing mid and comparing first with second is constant work.',
    mistake: 'Writing $T(n/2) + \\Theta(1)$, as if there were one call. There are two recursive calls, one per half, so the term is $2T(n/2)$.',
    tryIt: { q: 'CountNeg(A, left, right) counts negative entries: one element, return 1 or 0; otherwise return CountNeg(left half) + CountNeg(right half). Recurrence?', a: '$T(1) = \\Theta(1)$ and $T(n) = 2T(n/2) + \\Theta(1)$: two half-size calls, then one addition.' },
  };

  // ---------------------------------------------------------------- Lecture 4: merge sort

  H['c310-4-mergesort-code'] = {
    asks: 'Write the merge sort procedure from slide 9 and mark which line divides, which lines conquer and which line combines.',
    idea: 'Three lines of real work inside one if: find the middle, sort each side by calling yourself, merge the two sides. The if is the base case in disguise: a subarray with one element is already sorted, so nothing runs.',
    steps: [
      'Guard: if (left < right). When left ≥ right the subarray has at most one element and is already sorted, so the call does nothing (base case).',
      'Divide: mid = (left + right)/2, with integer division.',
      'Conquer: MergeSort(A, left, mid) and MergeSort(A, mid + 1, right). The right call starts at mid + 1, so the halves do not overlap.',
      'Combine: Merge(A, left, mid, right) merges the two sorted halves into one sorted A[left..right].',
      { text: 'Trace MergeSort(A, 1, 4) on A = 4 1 3 2 (calls on single elements do nothing):', table: { head: ['call', 'mid', 'after the call'], rows: [['MergeSort(A, 1, 2)', '1', 'A[1..2] = 1 4'], ['MergeSort(A, 3, 4)', '3', 'A[3..4] = 2 3'], ['MergeSort(A, 1, 4)', '2', 'A[1..4] = 1 2 3 4']] } },
    ],
    answer: 'if left < right: mid = (left + right)/2 [divide]; MergeSort(A, left, mid) and MergeSort(A, mid + 1, right) [conquer]; Merge(A, left, mid, right) [combine].',
    mistake: 'Writing the second call as MergeSort(A, mid, right). Then A[mid] is in both halves, and with two elements (left = mid) the call never shrinks: infinite recursion.',
    tryIt: { q: 'Which calls does MergeSort(A, 1, 6) make directly?', a: 'mid = (1 + 6)/2 = 3 with integer division. It calls MergeSort(A, 1, 3), then MergeSort(A, 4, 6), then Merge(A, 1, 3, 6).' },
  };

  H['c310-4-merge-precondition'] = {
    asks: 'Merge(A, left, mid, right) is a helper. What must already be true when it is called, and what does it guarantee when it returns?',
    idea: 'Merge is a zipper: it only works if both rows of teeth are already in order. It never looks back, so it relies on both halves being sorted, and the recursive calls make sure they are.',
    steps: [
      'Input: A[left..mid] is sorted and A[mid+1..right] is sorted. Those are exactly the halves the two recursive calls just sorted.',
      'Output: A[left..right] is one sorted subarray holding the same elements.',
      'Why it needs sorted halves: at each step it takes the smaller of the two FRONT elements, trusting that nothing smaller sits further back.',
      { text: 'Break the precondition: left half 5 2 (not sorted), right half 1 4:', table: { head: ['compare fronts', 'output'], rows: [['5 vs 1', '1'], ['5 vs 4', '4'], ['right half empty', 'copy 5, 2']] } },
      'The result is 1 4 5 2, which is not sorted. Merge did its job; the input broke the contract.',
    ],
    answer: 'It assumes A[left..mid] and A[mid+1..right] are each already sorted, and it produces A[left..right] as a single sorted subarray.',
    mistake: 'Saying Merge sorts its input. It only merges: on unsorted halves it returns an unsorted result, as the example shows.',
    tryIt: { q: 'A = [2, 6, 9, 1, 7]. May you call Merge(A, 1, 3, 5), and what does it produce?', a: 'Yes: A[1..3] = 2 6 9 and A[4..5] = 1 7 are each sorted. The result is A[1..5] = 1 2 6 7 9.' },
  };

  H['c310-4-merge-trace'] = {
    asks: 'Run Merge by hand on the sorted halves [3, 7, 9, 12] and [2, 4, 6, 11] and give the merged output.',
    idea: 'Two sorted queues and one exit. Look at the person at the front of each queue, send the smaller one out, repeat. When one queue is empty, the rest of the other walks out as it is.',
    steps: [
      'Keep a finger on the front of each half: L starts at 3, R starts at 2.',
      { text: 'Each row compares the two fronts and outputs the smaller; only the finger in that half moves:', table: { head: ['L front', 'R front', 'take', 'output so far'], rows: [['3', '2', '2 (R)', '2'], ['3', '4', '3 (L)', '2 3'], ['7', '4', '4 (R)', '2 3 4'], ['7', '6', '6 (R)', '2 3 4 6'], ['7', '11', '7 (L)', '2 3 4 6 7'], ['9', '11', '9 (L)', '2 3 4 6 7 9'], ['12', '11', '11 (R)', '2 3 4 6 7 9 11']] } },
      'R is now empty. Copy what is left of L, just 12, without comparing.',
      'Output: 2 3 4 6 7 9 11 12.',
    ],
    answer: '2 3 4 6 7 9 11 12.',
    mistake: 'Comparing elements at the same position (3 with 2, then 7 with 4, and so on) instead of the current fronts. The finger moves only in the half you took from.',
    tryIt: { q: 'Merge [1, 4, 8] and [2, 3, 9, 10].', a: '1 (L), 2 (R), 3 (R), 4 (L), 8 (L); L is empty, so copy 9 10. Output: 1 2 3 4 8 9 10.' },
  };

  H['c310-4-merge-comparisons'] = {
    asks: 'Count the comparisons (front of L against front of R) that Merge makes on [3, 7, 9, 12] and [2, 4, 6, 11].',
    idea: 'Each comparison sends exactly one element to the output. Comparing stops the moment one half runs out, because the leftovers are copied without looking.',
    steps: [
      'One comparison per output element, as long as both halves still have elements.',
      'The output 2, 3, 4, 6, 7, 9, 11 comes out one comparison each (see the merge trace). That is 7 comparisons.',
      'After 11 leaves, R is empty, and 12 is copied with no comparison.',
      'So comparisons = elements − leftovers when a half empties $= 8 - 1 = 7$.',
      { text: 'For $n$ elements in total:', table: { head: ['case', 'when', 'comparisons'], rows: [['most', 'the halves interleave to the very end', '$n - 1$'], ['fewest', 'all of one half is smaller than all of the other', 'size of that half']] } },
    ],
    answer: '7. Every output element except the last one (12) needed one comparison.',
    mistake: 'Answering 8, one per element. Once a half runs out, the rest is copied with no comparisons.',
    tryIt: { q: 'How many comparisons does Merge make on [1, 2, 3] and [7, 8, 9]?', a: '3: 1 vs 7, 2 vs 7, 3 vs 7. L is then empty and 7 8 9 are copied without comparing, the fewest possible for two halves of 3.' },
  };

  H['c310-4-merge-time'] = {
    asks: 'Merging two sorted halves with $n$ elements in total: how does the time grow with $n$, and why?',
    idea: 'Each step of Merge outputs one element and does a constant amount of work for it (one comparison, one copy). $n$ elements out means $n$ steps: linear.',
    steps: [
      'One step: compare the two fronts, copy the smaller to the output, advance one finger. That is a fixed number of operations, $\\Theta(1)$.',
      'Every step outputs exactly one element, and each element is output once. So there are $n$ steps (comparisons plus tail copies).',
      '$n$ steps at $\\Theta(1)$ each is $\\Theta(n)$. It cannot be less, because every element has to be moved at least once.',
      { text: 'Comparisons for two equal halves:', table: { head: ['$n$', 'fewest ($n/2$)', 'most ($n - 1$)'], rows: [['8', '4', '7'], ['16', '8', '15'], ['64', '32', '63']] } },
    ],
    graph: {
      caption: 'Fewest and most comparisons for two equal halves. Both are straight lines in $n$, so Merge is $\\Theta(n)$ either way.',
      x: [2, 64], xLabel: 'n (total elements)', yLabel: 'comparisons',
      curves: [{ label: 'most $n - 1$', f: n => n - 1, tone: 'b' }, { label: 'fewest $n/2$', f: n => n / 2, tone: 'a' }],
    },
    answer: '$\\Theta(n)$: each step does constant work and outputs one element, so $n$ elements take $n$ steps.',
    mistake: 'Thinking every element of L is compared with every element of R, giving $n^2$. Because both halves are sorted, each element is compared only with the current front of the other half.',
    tryIt: { q: 'Two sorted halves of 500 elements each. What are the most and the fewest comparisons Merge can make?', a: 'Most: $n - 1 = 999$ (interleaved to the end). Fewest: 500 (all of one half smaller than all of the other).' },
  };

  H['c310-4-ms-example'] = {
    asks: 'Trace merge sort on 8, 7, 5, 1, 6, 2, 4, 3: give the sorted pairs after the first merges and the two sorted halves just before the last merge.',
    idea: 'Two passes. Going down, halve until every piece has one element (one element is sorted for free). Going up, merge neighbours: pairs, then fours, then all eight.',
    steps: [
      'Divide (tree above): 8 elements become two 4s, four 2s, then eight single elements, the recursion base.',
      'First merges, each pair: 8 and 7 give 7 8; 5 and 1 give 1 5; 6 and 2 give 2 6; 4 and 3 give 3 4.',
      { text: 'Next, merge neighbouring pairs:', table: { head: ['merge', 'result'], rows: [['7 8 with 1 5', '1 5 7 8'], ['2 6 with 3 4', '2 3 4 6']] } },
      'Final merge: 1 5 7 8 with 2 3 4 6 gives 1 2 3 4 5 6 7 8.',
      'The code does the merges depth-first (7 8, 1 5, then 1 5 7 8, before touching the right half). The results at each level are the same as in this level-by-level picture.',
    ],
    tree: {
      levels: [
        { nodes: ['8 7 5 1 6 2 4 3'] },
        { nodes: ['8 7 5 1', '6 2 4 3'] },
        { nodes: ['8 7', '5 1', '6 2', '4 3'] },
        { nodes: ['8', '7', '5', '1', '6', '2', '4', '3'] },
      ],
      caption: 'The divide pass. The merges retrace this tree from the bottom: each pair, then each four, then all eight.',
    },
    answer: 'Pairs: (7, 8), (1, 5), (2, 6), (3, 4). Halves before the final merge: 1, 5, 7, 8 and 2, 3, 4, 6. Final: 1 2 3 4 5 6 7 8.',
    mistake: 'Pairing elements that are not siblings in the tree, for example 7 with 5. The pairs come from the halving: positions 1–2, 3–4, 5–6, 7–8.',
    tryIt: { q: 'Merge sort on 4, 9, 2, 7, 5, 1, 8, 3: the pairs after the first merges and the halves before the final merge?', a: 'Pairs: 4 9 | 2 7 | 1 5 | 3 8. Halves: 2 4 7 9 and 1 3 5 8. Final: 1 2 3 4 5 7 8 9.' },
  };

  H['c310-4-ms-9'] = {
    asks: 'With 9 elements the halves cannot be equal. Find where MergeSort splits A = {10, 5, 7, 6, 1, 4, 8, 3, 2} at the top, and the two sorted halves just before the last merge.',
    idea: 'mid is rounded down, so with an odd count the LEFT half gets the extra element. After that nothing changes: each half is sorted completely by its own recursive call before the final merge.',
    steps: [
      'Top call MergeSort(A, 1, 9): mid $= \\lfloor (1 + 9)/2 \\rfloor = 5$. Left is A[1..5] = 10 5 7 6 1, right is A[6..9] = 4 8 3 2.',
      'Left half (5 elements): mid $= \\lfloor (1 + 5)/2 \\rfloor = 3$, giving 10 5 7 | 6 1, and 10 5 7 splits into 10 5 | 7. Right half (4 elements): 4 8 | 3 2.',
      { text: 'Merges inside each half, in the order the code does them:', table: { head: ['merge', 'result'], rows: [['10 with 5', '5 10'], ['5 10 with 7', '5 7 10'], ['6 with 1', '1 6'], ['5 7 10 with 1 6', '1 5 6 7 10'], ['4 with 8', '4 8'], ['3 with 2', '2 3'], ['4 8 with 2 3', '2 3 4 8']] } },
      'Before the final merge: 1 5 6 7 10 and 2 3 4 8. Merging them gives 1 2 3 4 5 6 7 8 10.',
    ],
    tree: {
      levels: [
        { nodes: ['10 5 7 6 1 4 8 3 2'] },
        { nodes: ['10 5 7 6 1', '4 8 3 2'] },
        { nodes: ['10 5 7', '6 1', '4 8', '3 2'] },
        { nodes: ['10 5', '7', '6', '1', '4', '8', '3', '2'] },
      ],
      caption: 'Odd sizes put the extra element on the left: 9 splits 5 + 4, 5 splits 3 + 2, 3 splits 2 + 1. The piece 10 5 splits once more (not drawn), so the first merge is 10 with 5.',
    },
    answer: 'Split: indices 1..5 = {10, 5, 7, 6, 1} and 6..9 = {4, 8, 3, 2}. Sorted halves before the final merge: 1, 5, 6, 7, 10 and 2, 3, 4, 8.',
    mistake: 'Splitting 4 + 5, with the extra element on the right. $\\lfloor (1 + 9)/2 \\rfloor = 5$ puts indices 1 to 5 on the left.',
    tryIt: { q: 'MergeSort on A = {9, 2, 6, 4, 8, 1, 7} (indices 1..7): the top split and the halves before the final merge?', a: 'mid $= \\lfloor (1 + 7)/2 \\rfloor = 4$: 9 2 6 4 | 8 1 7. Sorted halves: 2 4 6 9 and 1 7 8. Final: 1 2 4 6 7 8 9.' },
  };

  H['c310-4-ms-recurrence'] = {
    asks: 'Turn the MergeSort code into a recurrence for its worst-case time $T(n)$, and say which line produces each term.',
    idea: 'The same line-by-line charging as for FindMax. The only difference is the combine line: Merge touches every element, so it costs $\\Theta(n)$ instead of $\\Theta(1)$.',
    steps: [
      { text: 'Charge each line (slide 13):', table: { head: ['line', 'cost'], rows: [['if (left < right)', '$\\Theta(1)$'], ['mid = (left + right)/2 (divide)', '$\\Theta(1)$'], ['MergeSort(A, left, mid) (conquer)', '$T(n/2)$'], ['MergeSort(A, mid+1, right) (conquer)', '$T(n/2)$'], ['Merge(A, left, mid, right) (combine)', '$\\Theta(n)$']] } },
      '$n = 1$: only the test runs, so $T(1) = \\Theta(1)$.',
      '$n > 1$: $T(n) = \\Theta(1) + 2T(n/2) + \\Theta(n)$. A constant is smaller than a multiple of $n$ for large $n$, so the $\\Theta(1)$ is absorbed: $T(n) = 2T(n/2) + \\Theta(n)$.',
      'The tree above shows where this leads: every level of the recursion costs $cn$ in total, and there are $\\lg n + 1$ levels, so $T(n) = \\Theta(n \\lg n)$.',
    ],
    tree: { ...MS_TREE, caption: 'Write the $\\Theta(n)$ as $cn$. Each node is one call’s Merge work; each row adds up to $cn$.' },
    answer: '$T(n) = \\Theta(1)$ if $n = 1$, and $T(n) = 2T(n/2) + \\Theta(n)$ if $n > 1$. The test and computing mid are $\\Theta(1)$ (divide), the two calls on halves give $2T(n/2)$ (conquer), and Merge is $\\Theta(n)$ (combine).',
    mistake: 'Putting the $\\Theta(n)$ into Divide. Splitting is only computing mid, $\\Theta(1)$; the linear work is Merge.',
    tryIt: { q: 'A variant of merge sort replaces Merge by a combine step that takes $\\Theta(n^2)$. What is the new recurrence?', a: '$T(1) = \\Theta(1)$ and $T(n) = 2T(n/2) + \\Theta(n^2)$. Only the combine term changes.' },
  };

  // ---------------------------------------------------------------- Lecture 4: recurrences

  H['c310-4-recurrence-def'] = {
    asks: 'Define a recurrence, and say what it means to solve one.',
    idea: 'A recurrence defines $T(n)$ by pointing at $T$ of smaller inputs, plus a starting value. Solving it gets rid of the pointing: you end with a formula or bound that you can evaluate for any $n$ directly.',
    steps: [
      'A recurrence describes a function in terms of its value on smaller inputs. Example: $T(1) = 1$, $T(n) = 2T(n/2) + n$ (merge sort with every cost set to 1).',
      { text: 'As written, you can only evaluate it bottom-up, one value at a time:', table: { head: ['$n$', '$T(n) = 2T(n/2) + n$'], rows: [['1', '1 (given)'], ['2', '2 · 1 + 2 = 4'], ['4', '2 · 4 + 4 = 12'], ['8', '2 · 12 + 8 = 32'], ['16', '2 · 32 + 16 = 80']] } },
      'Solving eliminates the recursion. Here $T(n) = n \\lg n + n$, which gives $T(16) = 16 \\cdot 4 + 16 = 80$ in one line.',
      'In this course "solve" usually means an asymptotic bound, here $T(n) = \\Theta(n \\lg n)$. The tools are iteration, recursion trees, substitution and the master theorem.',
    ],
    answer: 'An equation that describes a function in terms of its value on smaller inputs. Solving it eliminates the recursion by obtaining an asymptotic bound ($\\Theta$ or $O$) on the solution.',
    mistake: 'Forgetting the base case. Without $T(1)$ the values never get started; the table above begins at $T(1) = 1$.',
    tryIt: { q: 'Which is a recurrence? (a) $T(1) = 1$, $T(n) = T(n-1) + 2n$. (b) $T(n) = 3n^2 + 4$.', a: '(a) is: $T(n)$ is defined through $T(n-1)$. (b) is not; it is already a closed form, with nothing to solve.' },
  };

  H['c310-4-binsearch-recurrence'] = {
    asks: 'Match $T(n) = T(n/2) + \\Theta(1)$ to the algorithm whose code produces it.',
    idea: 'Read a recurrence as a description of one call: how many recursive calls (the number in front of $T$), how big each one is (inside $T$), and how much extra work (the added term). Then find the algorithm that behaves that way.',
    steps: [
      '$T(n/2)$ with no number in front: exactly ONE recursive call, on half the input.',
      '$+\\,\\Theta(1)$: a constant amount of extra work per call.',
      { text: 'The four candidates:', table: { head: ['algorithm', 'calls', 'size', 'extra work', 'recurrence'], rows: [['binary search', '1', '$n/2$', 'one comparison', '$T(n/2) + \\Theta(1)$'], ['merge sort', '2', '$n/2$', 'Merge, $\\Theta(n)$', '$2T(n/2) + \\Theta(n)$'], ['FindMax', '2', '$n/2$', 'one comparison', '$2T(n/2) + \\Theta(1)$'], ['factorial', '1', '$n - 1$', 'one multiply', '$T(n-1) + \\Theta(1)$']] } },
      'Only binary search makes one call on half: it compares the key with the middle element and continues in one half.',
    ],
    answer: 'Binary search: one recursive call on half the array plus constant work (one comparison with the middle). It solves to $\\Theta(\\lg n)$.',
    mistake: 'Picking FindMax because it also halves with constant extra work. FindMax recurses into BOTH halves, which gives $2T(n/2)$.',
    tryIt: { q: 'An algorithm makes 2 recursive calls on halves and does $\\Theta(n)$ extra work. Which one is it?', a: 'Merge sort: $2T(n/2) + \\Theta(n)$.' },
  };

  H['c310-4-findmax-match'] = {
    asks: 'Match $T(n) = 2T(n/2) + \\Theta(1)$ to its algorithm.',
    idea: 'The 2 says two recursive calls, the $n/2$ says each is on half the input, the $\\Theta(1)$ says the glue is tiny. Two halves glued together by one comparison is FindMax.',
    steps: [
      '$2T(n/2)$: two recursive calls, each on half. That rules out binary search (one call) and factorial (one call on $n - 1$).',
      '$+\\,\\Theta(1)$: constant extra work. That rules out merge sort, whose Merge is $\\Theta(n)$.',
      'FindMax computes mid, finds the max of each half recursively and returns the larger with one comparison: exactly $2T(n/2) + \\Theta(1)$.',
      { text: 'With $T(1) = 1$ and each $\\Theta(1)$ counted as 1, the values grow linearly, $2n - 1$:', table: { head: ['$n$', '$T(n) = 2T(n/2) + 1$'], rows: [['1', '1'], ['2', '3'], ['4', '7'], ['8', '15'], ['16', '31']] } },
    ],
    answer: 'Recursive FindMax: two half-size calls, then one comparison. It solves to $\\Theta(n)$.',
    mistake: 'Picking merge sort because of the $2T(n/2)$. Check the added term: merge sort adds $\\Theta(n)$, not $\\Theta(1)$.',
    tryIt: { q: 'Which algorithm has $T(n) = T(n-1) + \\Theta(1)$?', a: 'Recursive factorial: one call on $n - 1$ and one multiplication.' },
  };

  H['c310-4-methods'] = {
    asks: 'Name the three general techniques the course uses to solve recurrences (the master method is a separate shortcut).',
    idea: 'Two ways to unroll and one way to verify. Unroll with algebra (iteration), unroll with a picture (recursion tree), or guess the answer and prove it (substitution).',
    steps: [
      'Iteration method: substitute the recurrence into itself again and again until a pattern appears, write it as a sum, evaluate the sum.',
      'Recursion tree: draw each call as a node labelled with its own cost, add up each level, then add up the levels.',
      'Substitution method: guess a bound, then prove it by induction, finding the constants on the way.',
      { text: 'All three on $T(n) = 2T(n/2) + n$:', table: { head: ['method', 'what you see'], rows: [['iteration', '$2^k T(n/2^k) + kn$, then set $k = \\lg n$'], ['recursion tree', '$\\lg n + 1$ levels, each costing $n$'], ['substitution', 'proves $T(n) \\le c\\,n \\lg n$ by induction']] } },
    ],
    answer: 'The iteration method, recursion trees, and the substitution method.',
    mistake: 'Listing the master method as one of the three. It is a "cookbook" for recurrences of the form $aT(n/b) + f(n)$, presented separately.',
    tryIt: { q: 'You already believe $T(n) = O(n \\lg n)$ and need a rigorous proof. Which method?', a: 'Substitution: the guess is in hand, and induction proves it and finds $c$ and $n_0$.' },
  };

  // ---------------------------------------------------------------- Iteration method (Lectures 4–5)

  H['c310-4-iteration-steps'] = {
    asks: 'Put the four steps of the iteration method (slide 21) in order.',
    idea: 'Unroll, spot the pattern, add it up. You cannot write the sum before you have expanded, and you cannot evaluate a sum you have not written.',
    steps: [
      'Step 1, equations of $T$ for decreasing $n$. Example: $T(1) = 2$, $T(n) = 3 + T(n-1)$, so $T(n-1) = 3 + T(n-2)$ and $T(n-2) = 3 + T(n-3)$.',
      'Step 2, substitute them into the original: $T(n) = 3 + T(n-1) = 3 + 3 + T(n-2) = 3 + 3 + 3 + T(n-3)$.',
      'Step 3, express $T$ as a summation: after $k$ substitutions, $T(n) = \\sum_{i=1}^{k} 3 + T(n-k) = 3k + T(n-k)$.',
      'Step 4, evaluate: reach the base case with $n - k = 1$, so $k = n - 1$ and $T(n) = 3(n-1) + 2 = 3n - 1$.',
      { text: 'Check against the recurrence:', table: { head: ['$n$', 'by the recurrence', '$3n - 1$'], rows: [['1', '2', '2'], ['2', '5', '5'], ['3', '8', '8'], ['10', '29', '29']] } },
    ],
    answer: 'Find equations of $T$ for decreasing values of $n$; substitute them into the original $T$ to expand it; express $T$ as a summation; evaluate the summation.',
    mistake: 'Stopping at step 3 with $3k + T(n-k)$. That still contains $k$: choose $k$ so the argument hits the base case, then evaluate.',
    tryIt: { q: 'Run the four steps on $T(1) = 1$, $T(n) = T(n-1) + 5$.', a: '$T(n) = 5k + T(n-k)$; $k = n - 1$ gives $T(n) = 5(n-1) + 1 = 5n - 4$. Check: $T(2) = 6 = 5 \\cdot 2 - 4$.' },
  };

  H['c310-4-iter-factorial'] = {
    asks: 'Unroll $T(n) = 1 + T(n-1)$, $T(1) = 1$ step by step, spot the pattern, and use the base case to finish.',
    idea: 'Each unrolling peels off one call and adds 1. After $k$ peels you have collected $k$ ones. Keep peeling until you reach $T(1)$.',
    steps: [
      { text: 'Substitute $T(n-1) = 1 + T(n-2)$, then $T(n-2) = 1 + T(n-3)$, and so on:', table: { head: ['$k$', '$T(n)$ after $k$ substitutions'], rows: [['1', '$1 + T(n-1)$'], ['2', '$2 + T(n-2)$'], ['3', '$3 + T(n-3)$'], ['$k$', '$k + T(n-k)$']] } },
      'Pattern: the number in front equals how far the argument has dropped, so $T(n) = k + T(n-k)$.',
      'Base case: make the argument 1, so $n - k = 1 \\Rightarrow k = n - 1$.',
      'Plug in: $T(n) = (n - 1) + T(1) = (n - 1) + 1 = n$, which is $\\Theta(n)$.',
      { text: 'Check:', table: { head: ['$n$', 'by the recurrence', '$n$'], rows: [['1', '1', '1'], ['2', '2', '2'], ['3', '3', '3'], ['5', '5', '5']] } },
    ],
    answer: '$T(n) = 1 + T(n-1) = 2 + T(n-2) = \\dots = k + T(n-k)$. With $n - k = 1$, $k = n - 1$, so $T(n) = (n - 1) + T(1) = n = \\Theta(n)$.',
    mistake: 'Setting $n - k = 0$ when the base case you are given is $T(1)$. Stop at the base case you have: $n - k = 1$.',
    tryIt: { q: 'Solve $T(1) = 3$, $T(n) = 1 + T(n-1)$.', a: 'The same pattern $k + T(n-k)$; $k = n - 1$ gives $T(n) = n - 1 + 3 = n + 2 = \\Theta(n)$.' },
  };

  H['c310-4-iter-n-plus'] = {
    asks: 'Unroll $T(n) = n + T(n-1)$, $T(1) = 1$, write the result as a sum, and evaluate the sum.',
    idea: 'Each step adds the current size: $n$, then $n - 1$, then $n - 2$, down to the base. That is the staircase $1 + 2 + \\dots + n$, the same sum as insertion sort’s worst case, about $n^2/2$.',
    steps: [
      { text: 'Expand:', table: { head: ['$k$', '$T(n)$ after $k$ substitutions'], rows: [['1', '$n + T(n-1)$'], ['2', '$n + (n-1) + T(n-2)$'], ['3', '$n + (n-1) + (n-2) + T(n-3)$'], ['$k$', '$n + (n-1) + \\dots + (n-k+1) + T(n-k)$']] } },
      'Row $k$ has $k$ terms counting down from $n$, so the last is $n - (k-1) = n - k + 1$. As a sum: $T(n) = \\sum_{i=n-k+1}^{n} i + T(n-k)$.',
      'Base case: $n - k = 1 \\Rightarrow k = n - 1$, and the sum then starts at $i = n - (n-1) + 1 = 2$. So $T(n) = \\sum_{i=2}^{n} i + T(1)$.',
      '$\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}$, and removing the $i = 1$ term gives $\\sum_{i=2}^{n} i = \\frac{n(n+1)}{2} - 1$. So $T(n) = \\frac{n(n+1)}{2} - 1 + 1 = \\frac{n(n+1)}{2}$.',
      '$\\frac{n(n+1)}{2} = \\frac{n^2}{2} + \\frac{n}{2}$, so $T(n) = \\Theta(n^2)$. Check: $T(4) = 4 + 3 + 2 + 1 = 10 = \\frac{4 \\cdot 5}{2}$.',
    ],
    graph: {
      caption: 'The bars are $T(n)$ computed from the recurrence; the curve is $\\frac{n(n+1)}{2}$ and passes through every bar. The bend upward is the $n^2$.',
      x: [0.5, 10.5], y: [0, 62], xLabel: 'n', yLabel: 'T(n)',
      bars: { label: '$T(n)$ from the recurrence', tone: 'b', values: [[1, 1], [2, 3], [3, 6], [4, 10], [5, 15], [6, 21], [7, 28], [8, 36], [9, 45], [10, 55]] },
      curves: [{ label: '$\\frac{n(n+1)}{2}$', f: n => n * (n + 1) / 2, tone: 'a' }],
    },
    answer: '$T(n) = \\sum_{i=n-k+1}^{n} i + T(n-k)$; with $k = n - 1$, $T(n) = \\sum_{i=2}^{n} i + T(1) = \\frac{n(n+1)}{2} - 1 + 1 = \\frac{n(n+1)}{2} = \\Theta(n^2)$.',
    mistake: 'Concluding $\\Theta(n)$ because each step "adds one term". The terms are not constants; most of them are close to $n$ in size.',
    tryIt: { q: 'Solve $T(1) = 1$, $T(n) = 2n + T(n-1)$.', a: '$T(n) = \\sum_{i=2}^{n} 2i + T(1) = 2\\left(\\frac{n(n+1)}{2} - 1\\right) + 1 = n^2 + n - 1 = \\Theta(n^2)$. Check: $T(2) = 4 + 1 = 5$.' },
  };

  H['c310-4-iter-2T2-pattern'] = {
    asks: 'Unroll $T(n) = 2T(n/2) + 2$, $T(1) = 2$: find the form after $k$ steps, the $k$ that reaches $T(1)$, and the exact formula.',
    idea: 'Each unrolling doubles the number of $T$ pieces and halves their size, and leaves behind a power of 2 as extra cost: 2, then 4, then 8. Add up those leftovers with the geometric sum, then stop when the size reaches 1.',
    steps: [
      { text: 'Expand (slide 24):', table: { head: ['$k$', '$T(n)$ after $k$ substitutions'], rows: [['1', '$2T(n/2) + 2$'], ['2', '$2(2T(n/4) + 2) + 2 = 4T(n/4) + 4 + 2$'], ['3', '$8T(n/8) + 8 + 4 + 2$'], ['$k$', '$2^k T(n/2^k) + (2^k + \\dots + 4 + 2)$']] } },
      'The leftovers add up to $\\sum_{i=1}^{k} 2^i = 2^{k+1} - 2$ (geometric sum). So $T(n) = 2^k T(n/2^k) + 2^{k+1} - 2$.',
      'Stop when the size is 1: $n/2^k = 1 \\Rightarrow 2^k = n \\Rightarrow k = \\lg n$.',
      'Substitute $2^k = n$ and $2^{k+1} = 2 \\cdot 2^k = 2n$: $T(n) = n \\cdot T(1) + 2n - 2 = 2n + 2n - 2 = 4n - 2$.',
      { text: 'Check:', table: { head: ['$n$', 'by the recurrence', '$4n - 2$'], rows: [['1', '2', '2'], ['2', '6', '6'], ['4', '14', '14'], ['8', '30', '30']] } },
    ],
    answer: 'After $k$ steps $T(n) = 2^k T(n/2^k) + 2^{k+1} - 2$. Stop at $n/2^k = 1$, so $k = \\lg n$. Then $T(n) = n \\cdot 2 + 2n - 2 = 4n - 2 = \\Theta(n)$.',
    mistake: 'Writing the leftovers as $2k$, as if 2 were added once per step. At step 2 the earlier 2 was multiplied by 2: the leftovers are $2, 4, 8, \\dots$, not $2, 2, 2, \\dots$',
    tryIt: { q: 'Solve $T(1) = 3$, $T(n) = 2T(n/2) + 3$ exactly.', a: '$T(n) = 2^k T(n/2^k) + 3(2^k - 1)$. With $k = \\lg n$: $3n + 3n - 3 = 6n - 3$. Check: $T(2) = 9$, $T(4) = 21$.' },
  };

  H['c310-4-geom-2i'] = {
    asks: 'Write $2 + 4 + 8 + \\dots + 2^k$ as a formula with no "$\\dots$" in it.',
    idea: 'Each power of 2 is one more than all the smaller powers put together: $1 + 2 + 4 = 7 = 8 - 1$. So a sum of powers of 2 always lands just below the next power of 2.',
    steps: [
      'Call the sum $S = 2 + 4 + \\dots + 2^k$.',
      'Double it: $2S = 4 + 8 + \\dots + 2^k + 2^{k+1}$. Every term moved up one power.',
      'Subtract $S$ from $2S$: everything from 4 to $2^k$ cancels, leaving $2S - S = 2^{k+1} - 2$. So $S = 2^{k+1} - 2$.',
      { text: 'Check:', table: { head: ['$k$', '$2 + \\dots + 2^k$', '$2^{k+1} - 2$'], rows: [['1', '2', '2'], ['2', '6', '6'], ['3', '14', '14'], ['4', '30', '30'], ['5', '62', '62']] } },
    ],
    graph: {
      caption: 'The terms for $k = 5$. The last bar (32) is bigger than all the others together ($2 + 4 + 8 + 16 = 30$), so the sum is $32 + 30 = 62 = 2^6 - 2$.',
      x: [0.5, 5.5], y: [0, 34], xLabel: 'i', yLabel: 'term',
      bars: { label: '$2^i$', tone: 'b', values: [[1, 2], [2, 4], [3, 8], [4, 16], [5, 32]] },
    },
    answer: '$\\sum_{i=1}^{k} 2^i = 2^{k+1} - 2$.',
    mistake: 'Using the formula for a sum that starts at $i = 0$, which is $2^{k+1} - 1$. Starting at $i = 1$ leaves out $2^0 = 1$, so subtract one more.',
    tryIt: { q: 'Write $\\sum_{i=1}^{k} 3^i$ in closed form.', a: '$S = 3 + \\dots + 3^k$ and $3S = 9 + \\dots + 3^{k+1}$, so $3S - S = 3^{k+1} - 3$ and $S = \\frac{3^{k+1} - 3}{2}$. Check $k = 2$: $3 + 9 = 12 = \\frac{27 - 3}{2}$.' },
  };

  H['c310-4-iter-2T2-value'] = {
    asks: 'Compute $T(16)$ for $T(1) = 2$, $T(n) = 2T(n/2) + 2$.',
    idea: 'Two independent routes that must agree: build the values up from $T(1)$, or plug $n = 16$ into the closed form $4n - 2$ from the iteration method.',
    steps: [
      { text: 'Bottom-up, doubling $n$ each row:', table: { head: ['$n$', '$2T(n/2) + 2$'], rows: [['1', '2 (given)'], ['2', '2 · 2 + 2 = 6'], ['4', '2 · 6 + 2 = 14'], ['8', '2 · 14 + 2 = 30'], ['16', '2 · 30 + 2 = 62']] } },
      'Closed form from the iteration method: $T(n) = 4n - 2$, so $T(16) = 64 - 2 = 62$.',
      'Both routes give 62.',
    ],
    graph: {
      caption: 'The bars are the bottom-up values at $n = 1, 2, 4, 8, 16$; the line $4n - 2$ passes through all of them.',
      x: [0, 17], y: [0, 70], xLabel: 'n', yLabel: 'T(n)',
      bars: { label: '$T(n)$ bottom-up', tone: 'b', values: [[1, 2], [2, 6], [4, 14], [8, 30], [16, 62]] },
      curves: [{ label: '$4n - 2$', f: n => 4 * n - 2, tone: 'a' }],
    },
    answer: '62.',
    mistake: 'Using $T(1) = 1$ out of habit, which gives $3n - 2 = 46$. The base value here is 2.',
    tryIt: { q: 'For $T(1) = 1$, $T(n) = 2T(n/2) + 3$, find $T(8)$ both ways.', a: 'Bottom-up: $T(2) = 5$, $T(4) = 13$, $T(8) = 29$. Closed form: $2^k \\cdot 1 + 3(2^k - 1) = 4n - 3$, and $4 \\cdot 8 - 3 = 29$.' },
  };

  H['c310-5-iter-plus2'] = {
    asks: 'Unroll $T(n) = T(n-1) + 2$, $T(1) = 1$ into a formula in $n$ with no $T$ left.',
    idea: 'Stairs: every step down from $n$ to $n - 1$ costs 2. From $n$ down to 1 there are $n - 1$ steps, so $2(n-1)$ in total, plus the starting value 1.',
    steps: [
      { text: 'Expand:', table: { head: ['$k$', '$T(n)$ after $k$ substitutions'], rows: [['1', '$T(n-1) + 2$'], ['2', '$T(n-2) + 4$'], ['3', '$T(n-3) + 6$'], ['$k$', '$T(n-k) + 2k$']] } },
      'Base case: $n - k = 1 \\Rightarrow k = n - 1$.',
      '$T(n) = T(1) + 2(n - 1) = 1 + 2n - 2 = 2n - 1$.',
      { text: 'Check:', table: { head: ['$n$', 'by the recurrence', '$2n - 1$'], rows: [['1', '1', '1'], ['2', '3', '3'], ['3', '5', '5'], ['10', '19', '19']] } },
    ],
    answer: '$T(n) = 2n - 1$, which is $\\Theta(n)$.',
    mistake: 'Writing $2n$. There are $n - 1$ steps, not $n$, and then the base value $T(1) = 1$ is added.',
    tryIt: { q: 'Solve $T(1) = 4$, $T(n) = T(n-1) + 3$ exactly.', a: '$T(n) = T(n-k) + 3k$; $k = n - 1$ gives $4 + 3(n-1) = 3n + 1$. Check: $T(2) = 7$.' },
  };

  H['c310-5-iter-half-n'] = {
    asks: 'Unroll $T(n) = T(n/2) + n$, $T(1) = 1$ ($n$ a power of 2) to an exact formula and a $\\Theta$ bound.',
    idea: 'One call on half the input, plus work equal to the size. The work goes $n, n/2, n/4, \\dots$, like walking half the remaining distance to a wall each time: you never cover more than twice the first step.',
    steps: [
      { text: 'Expand:', table: { head: ['$k$', '$T(n)$ after $k$ substitutions'], rows: [['1', '$n + T(n/2)$'], ['2', '$n + n/2 + T(n/4)$'], ['3', '$n + n/2 + n/4 + T(n/8)$'], ['$k$', '$n + n/2 + \\dots + n/2^{k-1} + T(n/2^k)$']] } },
      'Base case: $n/2^k = 1 \\Rightarrow k = \\lg n$. The last term before $T(1)$ is then $n/2^{k-1} = 2$.',
      'So $T(n) = (n + n/2 + \\dots + 4 + 2) + 1$. Read the bracket backwards: $2 + 4 + \\dots + n = \\sum_{i=1}^{\\lg n} 2^i = 2^{\\lg n + 1} - 2 = 2n - 2$.',
      '$T(n) = 2n - 2 + 1 = 2n - 1 = \\Theta(n)$.',
      { text: 'Check:', table: { head: ['$n$', 'by the recurrence', '$2n - 1$'], rows: [['1', '1', '1'], ['2', '3', '3'], ['4', '7', '7'], ['8', '15', '15'], ['16', '31', '31']] } },
    ],
    graph: {
      caption: 'The work added at each depth for $n = 16$: 16, 8, 4, 2, then $T(1) = 1$. The first bar is more than half of the total, 31.',
      x: [-0.5, 4.5], y: [0, 17], xLabel: 'depth', yLabel: 'work',
      bars: { label: 'work at that depth', tone: 'b', values: [[0, 16], [1, 8], [2, 4], [3, 2], [4, 1]] },
    },
    answer: '$T(n) = n + n/2 + n/4 + \\dots + 2 + T(1) = (2n - 2) + 1 = 2n - 1 = \\Theta(n)$.',
    mistake: 'Counting $\\lg n$ terms of size $n$ and getting $n \\lg n$. The terms halve each time, so the first one dominates the total.',
    tryIt: { q: 'Solve $T(1) = 1$, $T(n) = T(n/2) + 2n$ exactly.', a: '$T(n) = 2(n + n/2 + \\dots + 2) + 1 = 2(2n - 2) + 1 = 4n - 3$. Check: $T(2) = 4 + 1 = 5$, $T(4) = 8 + 5 = 13$.' },
  };

  H['c310-5-iter-2Tm1'] = {
    asks: 'Unroll $T(n) = 2T(n-1) + 1$, $T(1) = 1$ to an exact formula and a $\\Theta$ bound.',
    idea: 'Two calls, and each one is only ONE smaller. The number of calls doubles at every level and there are $n$ levels: $1, 2, 4, \\dots, 2^{n-1}$ calls. That is exponential; the Towers of Hanoi move count follows exactly this recurrence.',
    steps: [
      { text: 'Expand:', table: { head: ['$k$', '$T(n)$ after $k$ substitutions'], rows: [['1', '$2T(n-1) + 1$'], ['2', '$2(2T(n-2) + 1) + 1 = 4T(n-2) + 2 + 1$'], ['3', '$8T(n-3) + 4 + 2 + 1$'], ['$k$', '$2^k T(n-k) + (2^{k-1} + \\dots + 2 + 1)$']] } },
      'The bracket is $\\sum_{i=0}^{k-1} 2^i = 2^k - 1$. So $T(n) = 2^k T(n-k) + 2^k - 1$.',
      'Base case: $n - k = 1 \\Rightarrow k = n - 1$. Then $T(n) = 2^{n-1} \\cdot 1 + 2^{n-1} - 1 = 2 \\cdot 2^{n-1} - 1 = 2^n - 1$.',
      { text: 'Check:', table: { head: ['$n$', 'by the recurrence', '$2^n - 1$'], rows: [['1', '1', '1'], ['2', '3', '3'], ['3', '7', '7'], ['4', '15', '15'], ['10', '1023', '1023']] } },
    ],
    graph: {
      caption: 'On a log scale $2^n - 1$ is a straight line going up, while the polynomial $n^2$ bends over and falls further behind.',
      x: [1, 20], logY: true, xLabel: 'n', yLabel: 'value (log scale)',
      curves: [{ label: '$T(n) = 2^n - 1$', f: n => 2 ** n - 1, tone: 'b' }, { label: '$n^2$', f: n => n * n, tone: 'a' }],
    },
    answer: '$T(n) = 2^k T(n-k) + 2^k - 1$. With $k = n - 1$: $2^{n-1} + 2^{n-1} - 1 = 2^n - 1 = \\Theta(2^n)$.',
    mistake: 'Seeing $T(n-1)$ and expecting linear growth, as for $T(n-1) + 1$. The factor 2 in front doubles the work at every level, and that makes it exponential.',
    tryIt: { q: 'Solve $T(1) = 1$, $T(n) = 3T(n-1) + 1$ exactly.', a: '$T(n) = 3^k T(n-k) + \\frac{3^k - 1}{2}$. With $k = n - 1$: $3^{n-1} + \\frac{3^{n-1} - 1}{2} = \\frac{3^n - 1}{2} = \\Theta(3^n)$. Check: $T(3) = 13$.' },
  };

  H['c310-5-iter-half-1'] = {
    asks: 'Unroll $T(n) = T(n/2) + 1$, $T(1) = 1$ ($n$ a power of 2) to an exact formula.',
    idea: 'Each call pays 1 and halves the size. So the only question is how many times you can halve $n$ before reaching 1, and that count is $\\lg n$.',
    steps: [
      { text: 'Expand:', table: { head: ['$k$', '$T(n)$ after $k$ substitutions'], rows: [['1', '$T(n/2) + 1$'], ['2', '$T(n/4) + 2$'], ['3', '$T(n/8) + 3$'], ['$k$', '$T(n/2^k) + k$']] } },
      'Base case: $n/2^k = 1 \\Rightarrow 2^k = n \\Rightarrow k = \\lg n$ (take $\\lg$ of both sides).',
      '$T(n) = T(1) + \\lg n = \\lg n + 1$.',
      { text: 'Check:', table: { head: ['$n$', 'by the recurrence', '$\\lg n + 1$'], rows: [['1', '1', '1'], ['2', '2', '2'], ['4', '3', '3'], ['16', '5', '5'], ['1024', '11', '11']] } },
    ],
    graph: {
      caption: '$\\lg n + 1$ grows very slowly: multiplying $n$ by 1024 adds only 10.',
      x: [1, 1024], xLabel: 'n', yLabel: 'T(n)',
      curves: [{ label: '$T(n) = \\lg n + 1$', f: n => lg(n) + 1, tone: 'a' }],
    },
    answer: '$T(n) = T(n/2^k) + k$; $k = \\lg n$ gives $T(n) = \\lg n + 1 = \\Theta(\\lg n)$. This is binary search’s recurrence.',
    mistake: 'Answering $\\lg n$ and forgetting $T(1) = 1$. The halvings cost $\\lg n$; the base call costs 1 more.',
    tryIt: { q: 'Solve $T(1) = 2$, $T(n) = T(n/2) + 3$ exactly.', a: '$T(n) = T(n/2^k) + 3k$; $k = \\lg n$ gives $T(n) = 3 \\lg n + 2$. Check: $T(4) = T(2) + 3 = 5 + 3 = 8 = 3 \\cdot 2 + 2$.' },
  };

  H['c310-5-iter-mergesort'] = {
    asks: 'Unroll merge sort’s recurrence $T(n) = 2T(n/2) + cn$, $T(1) = c$ all the way down and find the exact $T(n)$.',
    idea: 'Every unrolling adds one more full $cn$: at each level there are more pieces, but each is smaller by the same factor, so the level costs $cn$ in total. There are $\\lg n$ levels of this, plus the $n$ base calls.',
    steps: [
      { text: 'Expand:', table: { head: ['$k$', '$T(n)$ after $k$ substitutions'], rows: [['1', '$2T(n/2) + cn$'], ['2', '$2\\left(2T(n/4) + c\\tfrac{n}{2}\\right) + cn = 4T(n/4) + 2cn$'], ['3', '$8T(n/8) + 3cn$'], ['$k$', '$2^k T(n/2^k) + k\\,cn$']] } },
      'Why another $cn$ each time: at depth $k$ there are $2^k$ pieces, each costing $c \\cdot n/2^k$, and $2^k \\cdot c\\frac{n}{2^k} = cn$.',
      'Base case: $n/2^k = 1 \\Rightarrow k = \\lg n$, and then $2^k = n$.',
      '$T(n) = n \\cdot T(1) + cn \\lg n = cn + cn \\lg n = cn \\lg n + cn$.',
      { text: 'Check with $c = 1$:', table: { head: ['$n$', 'by the recurrence', '$n \\lg n + n$'], rows: [['1', '1', '1'], ['2', '4', '4'], ['4', '12', '12'], ['8', '32', '32'], ['16', '80', '80']] } },
      '$cn \\lg n$ outgrows $cn$, so $T(n) = \\Theta(n \\lg n)$.',
    ],
    tree: { ...MS_TREE, caption: 'Each row of the tree is one unrolling: $\\lg n$ rows of $cn$ from the merges, plus the bottom row of $n$ base calls at $c$ each.' },
    answer: '$T(n) = 2^k T(n/2^k) + k\\,cn$. With $k = \\lg n$: $T(n) = n \\cdot c + cn \\lg n = cn \\lg n + cn = \\Theta(n \\lg n)$.',
    mistake: 'Leaving out the base row: the $n$ calls of size 1 cost $c$ each and add $cn$. The exact answer is $cn \\lg n + cn$, not $cn \\lg n$.',
    tryIt: { q: 'Solve $T(1) = 3$, $T(n) = 2T(n/2) + 5n$ exactly.', a: '$T(n) = 2^k T(n/2^k) + 5kn$; $k = \\lg n$ gives $T(n) = 5n \\lg n + 3n$. Check: $T(2) = 6 + 10 = 16 = 5 \\cdot 2 \\cdot 1 + 3 \\cdot 2$.' },
  };

  H['c310-5-findmax-iter'] = {
    asks: 'For $T(1) = 1$, $T(n) = 2T(n/2) + 1$ (FindMax with unit costs), compute $T(16)$.',
    idea: 'Bottom-up: double the previous value and add 1. Or use the closed form $2n - 1$ from the iteration method; it counts the calls, since every call costs exactly 1.',
    steps: [
      { text: 'Bottom-up:', table: { head: ['$n$', '$2T(n/2) + 1$'], rows: [['1', '1 (given)'], ['2', '2 · 1 + 1 = 3'], ['4', '2 · 3 + 1 = 7'], ['8', '2 · 7 + 1 = 15'], ['16', '2 · 15 + 1 = 31']] } },
      'Closed form: after $k$ steps $T(n) = 2^k T(n/2^k) + (1 + 2 + \\dots + 2^{k-1}) = 2^k T(n/2^k) + 2^k - 1$. With $k = \\lg n$: $n + n - 1 = 2n - 1$.',
      '$T(16) = 2 \\cdot 16 - 1 = 31$, the same as the table.',
      'Third check, counting calls: FindMax on 16 elements makes $1 + 2 + 4 + 8 + 16 = 31$ calls at one unit each.',
    ],
    answer: '31.',
    mistake: 'Adding 1 once per level, which gives $\\lg n + 1 = 5$. Every call adds 1, and depth $i$ has $2^i$ calls.',
    tryIt: { q: 'For $T(1) = 2$, $T(n) = 2T(n/2) + 1$, find $T(8)$.', a: '$T(2) = 5$, $T(4) = 11$, $T(8) = 23$. Closed form: $2n + (n - 1) = 3n - 1 = 23$.' },
  };

  // ---------------------------------------------------------------- Substitution method (Lecture 6)

  // Exact T(n) for T(1) = 1, T(n) = 2T(n/2) + n at powers of 2 is n lg n + n.
  const T_MS = n => n * lg(n) + n;

  H['c310-6-subst-steps'] = {
    asks: 'Name the two steps of the substitution method.',
    idea: 'Guess, then check the guess with induction (dominoes): show the bound holds at the start, and that if it holds for smaller inputs it holds for $n$. The check also tells you which constant $c$ makes it work.',
    steps: [
      'Step 1, guess the form of the answer, e.g. "$T(n) = O(n \\lg n)$", which means $T(n) \\le c\\,n \\lg n$ for some $c$. Guesses come from a recursion tree or from a similar recurrence you know.',
      'Step 2, induction. Assume the bound for smaller inputs; for $T(n) = 2T(n/2) + n$ that is $T(n/2) \\le c\\,\\frac{n}{2} \\lg \\frac{n}{2}$.',
      'Substitute the assumption into the recurrence and simplify until it reads $T(n) \\le c\\,n \\lg n$ with the same $c$. The algebra tells you the condition on $c$ (here $c \\ge 1$).',
      'Check the base case and pick $n_0$ and $c$ so that both the base case and the step work (here $n_0 = 2$, $c = 2$).',
    ],
    answer: '1) Guess the form of the solution (a bound). 2) Use mathematical induction to find the constants and show that the solution works.',
    mistake: 'Expecting the method to produce the answer by itself. It only verifies a bound you already have, so a bad guess just makes the proof fail.',
    tryIt: { q: 'Use both steps on $T(1) = 1$, $T(n) = T(n-1) + 1$.', a: 'Guess $T(n) \\le cn$. Assume $T(n-1) \\le c(n-1)$; then $T(n) \\le c(n-1) + 1 = cn - c + 1 \\le cn$ when $c \\ge 1$. Base: $T(1) = 1 \\le c$. So $c = 1$ works and $T(n) = O(n)$.' },
  };

  H['c310-6-subst-goal'] = {
    asks: 'Before any algebra: to prove $T(n) = 2T(n/2) + n$ is $O(n \\lg n)$ by substitution, what exactly is the target inequality, and what are you allowed to assume?',
    idea: 'Induction climbs a ladder. The target is the rung at $n$; the assumption is that every lower rung is already in place. The recurrence only reaches down to $n/2$, so that is the one lower rung you use.',
    steps: [
      'Turn the guess into an inequality: $T(n) = O(n \\lg n)$ means there are $c > 0$ and $n_0$ with $T(n) \\le c\\,n \\lg n$ for all $n \\ge n_0$. That is what you must show.',
      'Induction hypothesis: the bound already holds for every value smaller than $n$ (and at least $n_0$). You may use that for free.',
      'The recurrence only uses $T(n/2)$, so you need the hypothesis at $n/2$. Replace every $n$ in $c\\,n \\lg n$ by $\\frac{n}{2}$: $T(n/2) \\le c\\,\\frac{n}{2} \\lg \\frac{n}{2}$.',
      { text: 'With numbers:', table: { head: ['$n$', 'hypothesis (at $n/2$)', 'goal (at $n$)'], rows: [['8', '$T(4) \\le c \\cdot 4 \\lg 4 = 8c$', '$T(8) \\le c \\cdot 8 \\lg 8 = 24c$'], ['16', '$T(8) \\le 24c$', '$T(16) \\le c \\cdot 16 \\lg 16 = 64c$']] } },
      'Next, substitute the hypothesis into $T(n) = 2T(n/2) + n$ and simplify until it reads $\\le c\\,n \\lg n$.',
    ],
    answer: 'Show there are constants $c > 0$ and $n_0$ with $T(n) \\le c\\,n \\lg n$ for all $n \\ge n_0$. Assume (inductive hypothesis) the bound holds for all values smaller than $n$, in particular $T(n/2) \\le c\\,(n/2) \\lg(n/2)$.',
    mistake: 'Assuming the bound at $n$ itself, the thing you are trying to prove. You may only assume it for smaller values such as $n/2$.',
    tryIt: { q: 'To prove $T(n) = T(n/2) + n$ is $O(n)$ by substitution, what is the goal and what is the hypothesis?', a: 'Goal: $T(n) \\le cn$ for all $n \\ge n_0$. Hypothesis: $T(n/2) \\le c\\,\\frac{n}{2}$. (Then $T(n) \\le \\frac{cn}{2} + n \\le cn$ when $c \\ge 2$.)' },
  };

  H['c310-6-subst-algebra'] = {
    asks: 'Plug the hypothesis $T(n/2) \\le c\\,\\frac{n}{2} \\lg \\frac{n}{2}$ into $T(n) = 2T(n/2) + n$, simplify, and find which $c$ makes the result $\\le c\\,n \\lg n$.',
    idea: 'After substituting and simplifying you get exactly the target, $c\\,n \\lg n$, plus a leftover $-cn + n$. The proof works when that leftover is never positive, and that happens when $c \\ge 1$.',
    steps: [
      'Replace $T(n/2)$ by its upper bound: $T(n) = 2T(n/2) + n \\le 2 \\cdot c\\,\\frac{n}{2} \\lg \\frac{n}{2} + n$. The $\\le$ appears because you swapped in something at least as big.',
      'Cancel $2 \\cdot \\frac{n}{2} = n$: the right side becomes $cn \\lg \\frac{n}{2} + n$. Lecture 4 slide 43 keeps a stray 2 here ("$2cn(\\log n - \\log 2)$"), but that 2 was already used to cancel the $\\frac{n}{2}$; Lecture 6 slide 3 has it right.',
      'Log rule: $\\lg \\frac{n}{2} = \\lg n - \\lg 2 = \\lg n - 1$. So $cn(\\lg n - 1) + n = cn \\lg n - cn + n$.',
      'Compare with the goal: $cn \\lg n - cn + n \\le cn \\lg n \\iff -cn + n \\le 0 \\iff n \\le cn \\iff 1 \\le c$ (divide by $n > 0$).',
      'So for $c \\ge 1$, $T(n) \\le c\\,n \\lg n$ with the same $c$ as the hypothesis. Both slide versions end "$\\le n \\log n$"; the correct last line is $\\le c\\,n \\lg n$.',
      { text: 'Check with $T(1) = 1$, where the exact value is $T(n) = n \\lg n + n$:', table: { head: ['$n$', '$T(n)$', '$1 \\cdot n \\lg n$', '$2 \\cdot n \\lg n$'], rows: [['2', '4', '2', '4'], ['4', '12', '8', '16'], ['8', '32', '24', '48'], ['16', '80', '64', '128']] } },
      'With $c = 1$ the bound fails at every $n$ in the table, because the inductive step only passes the bound upward; the base case has to start it, and it needs $c \\ge 2$. With $c = 2$ every row holds.',
    ],
    graph: {
      caption: '$T(n) = n \\lg n + n$ lies above $1 \\cdot n \\lg n$ everywhere but stays under $2 \\cdot n \\lg n$ from $n = 2$ on.',
      x: [1, 64], xLabel: 'n', yLabel: 'value',
      curves: [{ label: '$T(n) = n \\lg n + n$', f: T_MS, tone: 'a' }, { label: '$1 \\cdot n \\lg n$', f: n => n * lg(n), tone: 'c' }, { label: '$2 \\cdot n \\lg n$', f: n => 2 * n * lg(n), tone: 'b' }],
      marks: [{ x: 2, label: '$n_0 = 2$' }],
      from: 2,
    },
    answer: '$T(n) \\le 2 \\cdot c\\,\\frac{n}{2} \\lg \\frac{n}{2} + n = cn(\\lg n - 1) + n = cn \\lg n - cn + n \\le cn \\lg n$, which holds whenever $c \\ge 1$ (then $-cn + n \\le 0$).',
    mistake: 'Writing $\\lg \\frac{n}{2} = \\frac{\\lg n}{2}$. The log of a quotient is a difference: $\\lg n - \\lg 2 = \\lg n - 1$.',
    tryIt: { q: 'Substitute $T(n/2) \\le c\\,\\frac{n}{2} \\lg \\frac{n}{2}$ into $T(n) = 2T(n/2) + 3n$. Which $c$ gives $T(n) \\le c\\,n \\lg n$ in the inductive step?', a: '$T(n) \\le cn(\\lg n - 1) + 3n = cn \\lg n - cn + 3n \\le cn \\lg n$ when $-cn + 3n \\le 0$, that is $c \\ge 3$.' },
  };

  H['c310-6-subst-exact-form'] = {
    asks: 'In a substitution proof of $T(n) \\le c\\,n \\lg n$, why must the last line be exactly "$\\le c\\,n \\lg n$" with the same $c$ as the hypothesis?',
    idea: 'Induction is a relay: each step must hand on exactly the baton it received. If one step hands on "$c + 1$" instead of "$c$", the next step starts with a weaker promise, and after $\\lg n$ hand-offs the "constant" has grown with $n$.',
    steps: [
      'The statement being proved is one fixed sentence: "$T(m) \\le c\\,m \\lg m$", with one $c$ for every $m$. The step must show: if it holds at $n/2$, it holds at $n$.',
      'Ending with $T(n) \\le (c+1)\\,n \\lg n$ proves something weaker than the sentence at $n$. The next step up needs the sentence itself, so the chain breaks.',
      'Chained anyway, the constant grows by 1 per level: $c$, then $c + 1$, then $c + 2$. After $\\lg n$ levels it is $c + \\lg n$, which depends on $n$ and so is not a constant.',
      'The slides end with "$\\le n \\log n$", which silently uses the constant 1, and with $T(1) = 1$ that statement is false at every $n$:',
      { text: 'Exact $T(n) = n \\lg n + n$ against $n \\lg n$:', table: { head: ['$n$', '$T(n)$', '$n \\lg n$', '$T(n) \\le n \\lg n$?'], rows: [['2', '4', '2', 'no'], ['4', '12', '8', 'no'], ['16', '80', '64', 'no']] } },
      'So read the slides’ last line as $\\le c\\,n \\lg n$ for the $c$ you fixed ($c \\ge 1$ for the step; $c = 2$ once the base case is included).',
    ],
    answer: 'Induction proves exactly the statement it assumes. Ending with $(c + 1)\\,n \\lg n$, or with "$\\le n \\lg n$" for a different constant, does not establish the hypothesis for the next $n$, and the constant could grow at every level of the recursion.',
    mistake: 'Accepting "$\\le (c+1)\\,n \\lg n = O(n \\lg n)$" as a finished step. Saying it is still $O(\\dots)$ hides the growing constant; the last line must match the hypothesis exactly.',
    tryIt: { q: 'A proof for $T(n) = T(n/2) + 2$ reaches $T(n) \\le c \\lg n - c + 2$ and then writes "$\\le c \\lg n$". For which $c$ is that last step legitimate?', a: 'It needs $-c + 2 \\le 0$, that is $c \\ge 2$. For $c < 2$ the leftover is positive and the step fails.' },
  };

  H['c310-6-subst-pitfall'] = {
    asks: 'Someone "proves" $T(n) = 2T(n/2) + n$ is $O(n)$: assume $T(n/2) \\le c\\,\\frac{n}{2}$, so $T(n) \\le cn + n = O(n)$. Find the flaw.',
    idea: 'Each step of their argument loses a little: the constant creeps from $c$ to $c + 1$. One step looks harmless, but the recursion has $\\lg n$ levels, so the creep adds up to $\\lg n$, exactly the factor that separates $n$ from $n \\lg n$.',
    steps: [
      'The goal for $O(n)$ is $T(n) \\le cn$ with the same $c$ as the hypothesis.',
      'Their algebra is fine as far as it goes: $T(n) \\le 2 \\cdot c\\,\\frac{n}{2} + n = cn + n = (c + 1)n$.',
      'But $(c + 1)n > cn$ for every $n \\ge 1$. They never reach $T(n) \\le cn$, so the inductive step fails; "$(c + 1)n = O(n)$" is true but proves nothing here.',
      { text: 'Chain the faulty step up the recursion and the constant keeps growing:', table: { head: ['$n$', 'bound the faulty step gives'], rows: [['1', '$c \\cdot 1$'], ['2', '$(c + 1) \\cdot 2$'], ['4', '$(c + 2) \\cdot 4$'], ['$2^k$', '$(c + k) \\cdot 2^k$']] } },
      'At $n = 2^k$ the "constant" is $c + k = c + \\lg n$. So the real bound is $n(c + \\lg n)$, which is $\\Theta(n \\lg n)$, not $O(n)$.',
    ],
    graph: {
      caption: 'With $T(1) = 1$, $T(n)/n = \\lg n + 1$. A bound $T(n) \\le cn$ would need this curve to stay under a flat line; it crosses $c = 3$ at $n = 4$ and $c = 6$ at $n = 32$, and it crosses every $c$ eventually.',
      x: [1, 1024], y: [0, 12], xLabel: 'n', yLabel: 'T(n) / n',
      curves: [{ label: '$T(n)/n = \\lg n + 1$', f: n => lg(n) + 1, tone: 'a' }, { label: '$c = 3$', f: () => 3, tone: 'c' }, { label: '$c = 6$', f: () => 6, tone: 'b' }],
      marks: [{ x: 4, label: '$n = 4$' }, { x: 32, label: '$n = 32$' }],
    },
    answer: 'They had to show $T(n) \\le cn$ with the same $c$, but they got $(c + 1)n$, which is larger than $cn$. The inductive step fails; the true bound is $\\Theta(n \\lg n)$.',
    mistake: 'Ending a substitution step with "$= O(n)$". The last line must be $\\le cn$ with the exact $c$ you assumed, not a different constant hidden inside $O$.',
    tryIt: { q: 'Someone "proves" $T(n) = 2T(n/2) + 1$ is $O(1)$: assume $T(n/2) \\le c$, so $T(n) \\le 2c + 1 = O(1)$. What is wrong?', a: 'They needed $T(n) \\le c$ but got $2c + 1 > c$, so the step fails. The true answer is $\\Theta(n)$: with $T(1) = 1$, $T(n) = 2n - 1$.' },
  };

  H['c310-6-boundary'] = {
    asks: 'For $T(1) = 1$, $T(n) = 2T(n/2) + n$, the claim $T(n) \\le c\\,n \\lg n$ is false at $n = 1$. Show why, and how the proof gets around it.',
    idea: '$\\lg 1 = 0$, so at $n = 1$ the bound says $T(1) \\le 0$, and no constant can fix a zero. But $O$ only promises the bound from some $n_0$ on, so you start the induction at $n_0 = 2$ instead.',
    steps: [
      'Test $n = 1$: $c \\cdot 1 \\cdot \\lg 1 = c \\cdot 0 = 0$, but $T(1) = 1 > 0$. No choice of $c$ helps, because the right side is 0.',
      '$O$ only needs the bound for $n \\ge n_0$, and you choose $n_0$. So drop $n = 1$ from the proof and use $n_0 = 2$ as the base case (slide 4).',
      'New base case: $T(2) = 2T(1) + 2 = 2 \\cdot 1 + 2 = 4$, and $c \\cdot 2 \\lg 2 = 2c$. $4 \\le 2c \\iff c \\ge 2$.',
      'The chain still works: for $n \\ge 4$, $n/2 \\ge 2$, so the hypothesis is never used at $n = 1$. (With $n/2$ rounded down, $n = 3$ also reaches $T(1)$, so it is a base case too: $T(3) = 2T(1) + 3 = 5 \\le 2 \\cdot 3 \\lg 3 \\approx 9.51$.)',
      { text: 'With $c = 2$:', table: { head: ['$n$', '$T(n)$', '$2n \\lg n$', 'holds?'], rows: [['1', '1', '0', 'no (excluded)'], ['2', '4', '4', 'yes'], ['4', '12', '16', 'yes'], ['8', '32', '48', 'yes'], ['16', '80', '128', 'yes']] } },
    ],
    graph: {
      caption: 'At $n = 1$ the bound $2n \\lg n$ is 0, below $T(1) = 1$. From $n_0 = 2$ on it stays above $T(n)$.',
      x: [1, 16], xLabel: 'n', yLabel: 'value',
      curves: [{ label: '$T(n) = n \\lg n + n$', f: T_MS, tone: 'a' }, { label: '$2n \\lg n$', f: n => 2 * n * lg(n), tone: 'b' }],
      marks: [{ x: 2, label: '$n_0 = 2$' }],
      from: 2,
    },
    answer: 'At $n = 1$, $c \\cdot 1 \\cdot \\lg 1 = 0 < T(1) = 1$, so the bound fails for every $c$. The bound is only needed for $n \\ge n_0$, so start the induction at $n_0 = 2$: $T(2) = 4 \\le c \\cdot 2 \\lg 2 = 2c$ holds for any $c \\ge 2$.',
    mistake: 'Trying to rescue $n = 1$ with a bigger $c$. $c \\cdot 1 \\cdot \\lg 1 = 0$ for every $c$; the only fix is moving $n_0$.',
    tryIt: { q: 'For $T(1) = 3$, $T(n) = 2T(n/2) + n$, with $n_0 = 2$: which $c$ makes the base case $T(2) \\le c \\cdot 2 \\lg 2$ true?', a: '$T(2) = 2 \\cdot 3 + 2 = 8 \\le 2c \\iff c \\ge 4$.' },
  };

  H['c310-6-boundary-c'] = {
    asks: 'Find the smallest constant $c$ for which the base case $T(2) \\le c \\cdot 2 \\lg 2$ holds, given $T(1) = 1$ and $T(n) = 2T(n/2) + n$.',
    idea: 'Turn both sides into plain numbers. The left side is a fixed number from the recurrence; the right side is $c$ times a number. Divide to get the threshold, then check it against the inductive step’s condition.',
    steps: [
      '$T(2) = 2T(2/2) + 2 = 2T(1) + 2 = 2 \\cdot 1 + 2 = 4$.',
      '$c \\cdot 2 \\lg 2 = c \\cdot 2 \\cdot 1 = 2c$, since $\\lg 2 = 1$.',
      '$4 \\le 2c \\iff 2 \\le c$ (divide both sides by 2).',
      'The inductive step needed $c \\ge 1$. Both conditions hold when $c \\ge 2$, so the smallest is $c = 2$.',
      { text: 'Check a few values of $c$:', table: { head: ['$c$', '$2c$', '$4 \\le 2c$?'], rows: [['1', '2', 'no'], ['1.5', '3', 'no'], ['2', '4', 'yes (equal)'], ['3', '6', 'yes']] } },
    ],
    answer: '$c = 2$. $T(2) = 4$ and $c \\cdot 2 \\lg 2 = 2c$, so $c \\ge 2$, which also satisfies the step’s $c \\ge 1$.',
    mistake: 'Taking $c = 1$ from the inductive step. The proof needs one $c$ that satisfies the step AND the base case, so take the stricter requirement.',
    tryIt: { q: 'Same recurrence but $T(1) = 2$. Smallest $c$ for the base case at $n_0 = 2$?', a: '$T(2) = 2 \\cdot 2 + 2 = 6 \\le 2c \\iff c \\ge 3$. The step needs $c \\ge 1$, so $c = 3$.' },
  };

  H['c310-6-subst-omega'] = {
    asks: 'Use substitution to show $T(n) = 2T(n/2) + n$ is $\\Omega(n \\lg n)$: state the hypothesis, do the algebra, and find which $c$ works.',
    idea: 'Run the $O$ proof in a mirror: every $\\le$ becomes $\\ge$. The same leftover $-cn + n$ appears, but now it must be $\\ge 0$ instead of $\\le 0$, which flips the condition to $c \\le 1$.',
    steps: [
      'Goal: $T(n) \\ge c\\,n \\lg n$ for all $n \\ge n_0$, some $c > 0$. Hypothesis: $T(n/2) \\ge c\\,\\frac{n}{2} \\lg \\frac{n}{2}$.',
      'Substitute: $T(n) = 2T(n/2) + n \\ge 2 \\cdot c\\,\\frac{n}{2} \\lg \\frac{n}{2} + n = cn(\\lg n - 1) + n = cn \\lg n - cn + n$.',
      'Need $cn \\lg n - cn + n \\ge cn \\lg n$, that is $-cn + n \\ge 0$, that is $n \\ge cn$, that is $c \\le 1$.',
      'Base case: $T(1) = 1 \\ge c \\cdot 1 \\cdot \\lg 1 = 0$ for any $c$, so here $n = 1$ causes no trouble. Take $c = 1$, $n_0 = 1$.',
      { text: 'Check with $T(1) = 1$:', table: { head: ['$n$', '$T(n)$', '$1 \\cdot n \\lg n$', '$T(n) \\ge n \\lg n$?'], rows: [['1', '1', '0', 'yes'], ['2', '4', '2', 'yes'], ['4', '12', '8', 'yes'], ['16', '80', '64', 'yes']] } },
      'Together with the $O$ proof ($c = 2$): $n \\lg n \\le T(n) \\le 2n \\lg n$ for $n \\ge 2$, so $T(n) = \\Theta(n \\lg n)$.',
    ],
    graph: {
      caption: '$T(n)$ is trapped between $1 \\cdot n \\lg n$ (this proof) and $2 \\cdot n \\lg n$ (the $O$ proof) from $n = 2$ on: that is $\\Theta(n \\lg n)$.',
      x: [1, 64], xLabel: 'n', yLabel: 'value',
      curves: [{ label: '$2 \\cdot n \\lg n$', f: n => 2 * n * lg(n), tone: 'b' }, { label: '$T(n) = n \\lg n + n$', f: T_MS, tone: 'a' }, { label: '$1 \\cdot n \\lg n$', f: n => n * lg(n), tone: 'c' }],
    },
    answer: 'Hypothesis: $T(n/2) \\ge c\\,\\frac{n}{2} \\lg \\frac{n}{2}$. Then $T(n) \\ge 2c\\,\\frac{n}{2}(\\lg n - 1) + n = cn \\lg n - cn + n \\ge cn \\lg n$, which holds when $0 < c \\le 1$.',
    mistake: 'Keeping "$c \\ge 1$" from the $O$ proof. The inequality flipped, so the condition flips: $\\Omega$ needs $c \\le 1$ (and $c > 0$).',
    tryIt: { q: 'Prove $T(n) = T(n/2) + n$, $T(1) = 1$, is $\\Omega(n)$ by substitution.', a: 'Hypothesis $T(n/2) \\ge c\\,\\frac{n}{2}$. Then $T(n) \\ge \\frac{cn}{2} + n \\ge cn$ when $n \\ge \\frac{cn}{2}$, that is $c \\le 2$. Base: $T(1) = 1 \\ge c$ needs $c \\le 1$. Take $c = 1$.' },
  };

  H['c310-6-subst-practice-n2'] = {
    asks: 'Prove by substitution that $T(n) = T(n-1) + n$ is $O(n^2)$: hypothesis, algebra, and a constant that works.',
    idea: 'This recurrence steps from $n - 1$ to $n$, so the hypothesis is about $n - 1$. Expanding $(n-1)^2$ produces a $-2cn$, which has room to absorb the added $n$ as long as $c$ is not tiny.',
    steps: [
      'Goal: $T(n) \\le cn^2$. Hypothesis, at the value just below: $T(n-1) \\le c(n-1)^2$.',
      'Substitute: $T(n) = T(n-1) + n \\le c(n-1)^2 + n$.',
      'Expand $(n-1)^2 = n^2 - 2n + 1$: $c(n^2 - 2n + 1) + n = cn^2 - 2cn + c + n = cn^2 - (2c - 1)n + c$.',
      'Need $cn^2 - (2c - 1)n + c \\le cn^2$, that is $c \\le (2c - 1)n$. With $c = 1$ this reads $1 \\le n$, true for every $n \\ge 1$.',
      'Base case with $T(1) = 1$: $T(1) = 1 \\le 1 \\cdot 1^2$. So $c = 1$, $n_0 = 1$.',
      { text: 'Check against the exact value $T(n) = \\frac{n(n+1)}{2}$:', table: { head: ['$n$', '$T(n)$', '$n^2$'], rows: [['1', '1', '1'], ['2', '3', '4'], ['3', '6', '9'], ['10', '55', '100']] } },
    ],
    answer: 'Hypothesis $T(n-1) \\le c(n-1)^2$. Then $T(n) \\le c(n^2 - 2n + 1) + n = cn^2 - (2c - 1)n + c \\le cn^2$ when $(2c - 1)n \\ge c$; with $c = 1$ that is $n \\ge 1$. So $T(n) \\le n^2$ for $n \\ge 1$, given a base case like $T(1) \\le 1$.',
    mistake: 'Expanding $(n-1)^2$ as $n^2 - 1$. The middle term $-2n$ is the one that makes this proof work.',
    tryIt: { q: 'Prove $T(n) = T(n-1) + 2n$, $T(1) = 1$, is $O(n^2)$.', a: '$T(n) \\le c(n-1)^2 + 2n = cn^2 - (2c - 2)n + c$. Need $c \\le (2c - 2)n$; with $c = 2$ that is $2 \\le 2n$, true for $n \\ge 1$. Base: $T(1) = 1 \\le 2$. So $c = 2$.' },
  };

  H['c310-6-subst-practice-lg'] = {
    asks: 'Prove by substitution that $T(n) = T(n/2) + 1$ is $O(\\lg n)$: hypothesis, algebra, and the condition on $c$.',
    idea: 'Halving the argument of $\\lg$ subtracts exactly 1: $\\lg \\frac{n}{2} = \\lg n - 1$. So the hypothesis hands you $c \\lg n - c$, and the recurrence adds 1 back. That is fine as long as $c \\ge 1$.',
    steps: [
      'Goal: $T(n) \\le c \\lg n$. Hypothesis: $T(n/2) \\le c \\lg \\frac{n}{2}$.',
      'Substitute: $T(n) = T(n/2) + 1 \\le c \\lg \\frac{n}{2} + 1 = c(\\lg n - 1) + 1 = c \\lg n - c + 1$.',
      'Need $c \\lg n - c + 1 \\le c \\lg n$, that is $-c + 1 \\le 0$, that is $c \\ge 1$.',
      'Base case: $n = 1$ fails because $c \\lg 1 = 0 < T(1)$. Start at $n_0 = 2$; with $T(1) = 1$, $T(2) = 2 \\le c \\lg 2 = c$ needs $c \\ge 2$, so take $c = 2$.',
      { text: 'Check the exact $T(n) = \\lg n + 1$ against $2 \\lg n$:', table: { head: ['$n$', '$T(n)$', '$2 \\lg n$'], rows: [['1', '1', '0 (excluded)'], ['2', '2', '2'], ['4', '3', '4'], ['16', '5', '8'], ['1024', '11', '20']] } },
    ],
    answer: 'Hypothesis $T(n/2) \\le c \\lg \\frac{n}{2}$. Then $T(n) \\le c(\\lg n - 1) + 1 = c \\lg n - c + 1 \\le c \\lg n$ whenever $c \\ge 1$. Base case at $n_0 = 2$: $T(2) \\le c \\lg 2 = c$, true for $c \\ge T(2)$.',
    mistake: 'Writing $\\lg \\frac{n}{2} = \\frac{\\lg n}{2}$. The log of a quotient is a difference: $\\lg n - \\lg 2 = \\lg n - 1$.',
    tryIt: { q: 'Prove $T(n) = T(n/2) + 3$, $T(1) = 1$, is $O(\\lg n)$.', a: '$T(n) \\le c(\\lg n - 1) + 3 = c \\lg n - c + 3 \\le c \\lg n$ when $c \\ge 3$. Base at $n_0 = 2$: $T(2) = 4 \\le c$. So $c = 4$.' },
  };

  H['c310-6-guess-heuristics'] = {
    asks: 'The substitution method needs a guess. Give the three ways slide 6 suggests for making a good one.',
    idea: 'Three sources for a guess: draw it (recursion tree), recognise it (a recurrence you have seen), or corner it (prove an easy floor and an easy ceiling, then squeeze them together).',
    steps: [
      'Recursion tree: draw a few levels and add each level. For $T(n) = 2T(n/2) + n$ every level costs $n$ and there are about $\\lg n$ levels, so guess $n \\lg n$.',
      'Similar recurrence: if it looks like one you have solved, guess the same answer. $2T(n/2 + 17) + n$ looks like merge sort, so guess $n \\lg n$.',
      'Loose bounds, then narrow: prove something easy on each side, such as $T(n) \\ge n$ (the top call alone costs $n$) and $T(n) \\le n^2$. Then raise the lower bound and lower the upper bound until they meet.',
      { text: 'Narrowing for $2T(n/2) + n$ with $T(1) = 1$: the true values sit well inside the loose bounds, which points to something in between, like $n \\lg n$.', table: { head: ['$n$', 'lower: $n$', '$T(n)$', 'upper: $n^2$'], rows: [['4', '4', '12', '16'], ['16', '16', '80', '256'], ['64', '64', '448', '4096']] } },
    ],
    graph: {
      caption: 'On a log scale: $T(n) = n \\lg n + n$ runs between the loose floor $n$ and the loose ceiling $n^2$, pulling away from both.',
      x: [2, 64], logY: true, xLabel: 'n', yLabel: 'value (log scale)',
      curves: [{ label: 'floor $n$', f: n => n, tone: 'c' }, { label: '$T(n)$', f: T_MS, tone: 'a' }, { label: 'ceiling $n^2$', f: n => n * n, tone: 'b' }],
    },
    answer: 'Use a recursion tree; notice the recurrence is similar to one you have seen before; prove loose upper and lower bounds, then narrow the range until they converge.',
    mistake: 'Guessing from the number of recursive calls alone ("two calls, so $2^n$"). How fast the size shrinks and what each level costs decide the answer.',
    tryIt: { q: 'Use a recursion tree to guess a bound for $T(n) = 4T(n/2) + n^2$.', a: 'Depth $i$ has $4^i$ nodes of size $n/2^i$, each costing $(n/2^i)^2 = n^2/4^i$, so every level costs $n^2$. About $\\lg n + 1$ levels: guess $\\Theta(n^2 \\lg n)$.' },
  };

  H['c310-6-guess-17'] = {
    asks: 'Make a good guess for $T(n) = 2T(n/2 + 17) + n$ and justify it.',
    idea: 'Squint: this is merge sort’s recurrence with "+17" tacked onto the size. When $n$ is a million, half of it plus 17 is basically half of it. A constant shift barely changes the tree, so guess what merge sort gives.',
    steps: [
      'Compare with $2T(n/2) + n$: the same number of calls (2) and the same added work ($n$). Only the size changes, $n/2 + 17$ instead of $n/2$.',
      { text: 'How much does the +17 matter?', table: { head: ['$n$', '$n/2$', '$n/2 + 17$', 'ratio'], rows: [['100', '50', '67', '1.34'], ['1000', '500', '517', '1.034'], ['1000000', '500000', '500017', '1.000034']] } },
      'For large $n$ the ratio goes to 1, so the upper levels of the tree look like merge sort’s: about $n$ per level, about $\\lg n$ levels.',
      'The size only shrinks while $n/2 + 17 < n$, that is $n > 34$. Below that a base case has to take over, which is constant work per leaf and does not change the growth rate.',
      'Guess $T(n) = O(n \\lg n)$, in fact $\\Theta(n \\lg n)$, then prove it with substitution.',
    ],
    answer: '$O(n \\lg n)$, and in fact $\\Theta(n \\lg n)$. It looks like merge sort’s $2T(n/2) + n$, and for large $n$, $n/2 + 17$ and $n/2$ are almost the same size, so the $+17$ does not change the growth rate.',
    mistake: 'Expecting the $+17$ to change the growth rate. Adding a constant to the subproblem size only adds lower-order work; the growth stays $n \\lg n$.',
    tryIt: { q: 'What is a good guess for $T(n) = T(n/2 + 5) + 1$?', a: 'It looks like binary search’s $T(n/2) + 1$, and $n/2 + 5 \\approx n/2$ for large $n$. Guess $\\Theta(\\lg n)$.' },
  };
})(globalThis.FC = globalThis.FC || {});
