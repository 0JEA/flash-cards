// "Help" walkthroughs for the CSC 310 Lecture 1–2 cards: algorithms and pseudocode,
// correctness, decision problems, Turing machines, P/NP, selection vs. merge sort, binary
// trees, asymptotic analysis, the RAM model, best/worst/average case, binary search,
// insertion sort (traces, loop invariant, average case).
// Same entry format as decks/csc310-help.js (see the header comment there).
// Assignment 1's own algorithms and questions are NOT used; every tryIt uses new data.
// Every number, trace row and tryIt answer was checked with python3 on 2026-10-16.
(function (FC) {
  'use strict';
  const H = FC.help = FC.help || {};

  // ---------------------------------------------------------------- What an algorithm is

  H['c310-1-algo-def'] = {
    asks: 'Give the course’s definition of an algorithm: what it is, and what it is for.',
    idea: 'Think of a recipe. It is a fixed list of steps that ends, it turns ingredients (input) into a dish (output), and it is written for one clearly stated job.',
    steps: [
      'What it is: a finite sequence of computational steps. Finite means it stops; a list of steps that can run forever is not an algorithm.',
      'What it does: transforms the input into the output. FindMaximum takes ⟨3, 7, 2, 9, 5⟩ in and gives 9 out.',
      'What it is for: solving a well-specified computational problem, one whose input and output are stated precisely. "Sort these numbers" qualifies; "make this list look nicer" does not.',
      { text: 'All three parts, for FindMaximum:', table: { head: ['part', 'FindMaximum'], rows: [['finite steps', 'set max, loop over $i = 1, \\dots, n - 1$, compare, maybe update, return'], ['input → output', 'an array A → its largest element'], ['well-specified problem', '"given A, return the largest element of A"']] } },
    ],
    answer: 'A finite sequence of computational steps that transforms the input into the output; a tool for solving a well-specified computational problem.',
    mistake: 'Saying only "a set of instructions". The definition has three parts to state: finite steps, input turned into output, and a well-specified problem.',
    tryIt: { q: 'Procedure: "x ← 1; repeat forever: x ← x + 2". Is it an algorithm under the course’s definition? Which parts fail?', a: 'No. It never stops, so it is not a finite sequence of steps, and it never hands back an output, so it does not transform input into output.' },
  };

  H['c310-1-three-goals'] = {
    asks: 'List the three properties the course wants the algorithms it studies to have.',
    idea: 'Three questions you ask of any algorithm: is the answer right, is it the same every time, and how fast does it come? Alphabetical order makes them easy to recall: Correct, Deterministic, Efficient.',
    steps: [
      { text: 'One question per property:', table: { head: ['property', 'question', 'course definition'], rows: [['correct', 'right answer?', 'correct output for every input instance'], ['deterministic', 'same answer every run?', 'same input, same conditions → same output'], ['efficient', 'how fast?', 'time to turn the input into the correct output']] } },
      'FindMaximum has all three: it returns the largest element for every array, returns the same value on every run, and makes $n - 1$ comparisons.',
      'The one students forget is "deterministic". Simplicity and short code are not on the list.',
    ],
    answer: 'Efficient, deterministic, and correct.',
    mistake: 'Listing "fast, simple, short". The course’s three are correct, deterministic and efficient; each gets its own definition on slides 17 and 20.',
    tryIt: { q: '"Maximum" that picks a random element of A and returns it. Which of the three properties does it break?', a: 'Correct (it is wrong on most inputs) and deterministic (two runs on the same array can return different values). It is efficient: one step.' },
  };

  H['c310-1-deterministic'] = {
    asks: 'Say what it means for an algorithm to be deterministic.',
    idea: 'A vending machine: press the same button, get the same snack, every time. A deterministic algorithm never decides anything by chance, so its input fully decides its output.',
    steps: [
      'Fix one input, say ⟨3, 7, 2, 9, 5⟩, and run FindMaximum on it as many times as you like.',
      'Every run makes the same comparisons in the same order and returns 9. Nothing inside the algorithm can make two runs differ.',
      'Contrast: a randomized algorithm (a separate design strategy on slide 5) uses coin flips, so two runs on the same input can behave differently.',
      '"Under the same conditions" rules out outside changes, such as feeding it a different file. The algorithm itself adds no randomness.',
    ],
    answer: 'Given the same input and run under the same conditions, it always produces the same output.',
    mistake: 'Mixing up deterministic and correct. An algorithm can be deterministic and wrong: it gives the same wrong answer every time.',
    tryIt: { q: 'A procedure returns some element larger than the average of A; when several qualify it picks one by a coin flip. Deterministic?', a: 'No. On ⟨1, 8, 9⟩ (average 6) it may return 8 on one run and 9 on another: same input, different outputs.' },
  };

  H['c310-1-pseudocode'] = {
    asks: 'Say what pseudocode is, and why algorithms are written in it rather than in Java or Python.',
    idea: 'Pseudocode is the algorithm with the programming-language paperwork stripped off: no types, no semicolons, no class wrapper. Only the steps are left, so any reader can follow them and count them.',
    steps: [
      'Definition (slide 17): an informal, high-level description of the algorithm procedure, in plain human-readable language.',
      { text: 'The same lines of FindMaximum, two ways:', table: { head: ['Java', 'pseudocode'], rows: [['public static int findMax(int[] A) {', 'Algorithm FindMaximum(A)'], ['int max = A[0];', 'max ← A[0]'], ['for (int i = 1; i < A.length; i++) {', 'for i ← 1 to length(A) − 1 do'], ['if (A[i] > max) max = A[i];', 'if A[i] > max then max ← A[i]']] } },
      'Everything that is only Java (int, public static, braces, i++) is about the language, not the method. Pseudocode drops it.',
      'Because it is tied to no language, the same pseudocode can be written in Java, C or Python, and its step counts are the same in all of them.',
    ],
    answer: 'An informal, high-level, plain human-readable description of an algorithm’s procedure; it is less formal and easier to understand than programming-language code.',
    mistake: 'Thinking pseudocode may be vague. It is informal about syntax, not about steps: every line must still say exactly what happens.',
    tryIt: { q: 'Write pseudocode that returns how many elements of A are negative.', a: 'count ← 0; for i ← 0 to length(A) − 1 do: if A[i] < 0 then count ← count + 1; return count.' },
  };

  H['c310-1-correct-def'] = {
    asks: 'State when the course calls an algorithm correct.',
    idea: 'Correct is a promise about every input, not about the inputs you tried. One input where it fails is enough to make it incorrect.',
    steps: [
      'Definition (slide 20): it produces a correct output instance for each input instance.',
      'A trap: a "find the max" that returns the last element. On ⟨1, 4, 9⟩ it returns 9, which is right.',
      'On ⟨9, 4, 1⟩ it returns 1, which is wrong. That single input shows the algorithm is not correct.',
      'So a test can prove an algorithm wrong (find a failing input) but never prove it right (there are infinitely many inputs). That is why Lecture 2 proves correctness with loop invariants.',
    ],
    answer: 'When it produces a correct output for EVERY input instance.',
    mistake: 'Taking "it worked on my examples" as correctness. It only shows those examples work; correctness needs an argument that covers all inputs.',
    tryIt: { q: 'IsSorted(A) returns true when A[1] ≤ A[2], and false otherwise. Find an input that shows it is not correct.', a: '⟨1, 2, 0⟩: A[1] ≤ A[2], so it says true, but the array is not sorted. One counterexample is enough.' },
  };

  H['c310-1-efficiency'] = {
    asks: 'Say how efficiency is measured, and name the two choices the lecture says change it.',
    idea: 'Efficiency is how long the trip from input to correct output takes. The trip depends on the route you choose (the algorithm) and the vehicle carrying the data (the data structure).',
    steps: [
      'Measure (slide 20): the time to transform the input into the correct output. In this course that time is counted in instructions, not seconds.',
      'Choice 1, the algorithm: in the slide 34–35 example, merge sort on a slow computer beats selection sort on a fast one, about 1163 s against 20,000 s.',
      'Choice 2, the data structure: reading A[i] from an array is one step, because you jump straight to slot $i$.',
      'Reading the $i$-th item of a linked list means following $i$ links from the head: $i$ steps. Same task, different structure, different cost.',
      { text: 'Reading items one by one, "get item $i$" for every $i$:', table: { head: ['structure', 'cost of item $i$', 'total for $n$ items'], rows: [['array', '$1$', '$n$'], ['linked list (walk from the head each time)', '$i$', '$1 + 2 + \\dots + n = \\frac{n(n+1)}{2}$']] } },
    ],
    graph: {
      caption: 'Same loop, two data structures: the array cost grows as a straight line, the linked-list cost as a parabola. At $n = 50$: 50 steps against 1275.',
      x: [1, 50], y: [0, 1300], xLabel: 'n (items read)', yLabel: 'steps',
      curves: [{ label: 'array: $n$', f: n => n, tone: 'a' }, { label: 'linked list: $n(n+1)/2$', f: n => n * (n + 1) / 2, tone: 'b' }],
    },
    answer: 'By how long it takes to transform the input into the correct output. It changes with the choice of algorithm (e.g. different sorting algorithms) and with the data structure used (e.g. array vs. linked list).',
    mistake: 'Answering "how fast the computer is". Machine speed changes the seconds, but the two things the lecture names are the algorithm and the data structure.',
    tryIt: { q: 'Read items 1 to 20 of a linked list by index, walking from the head each time. How many link steps in total?', a: 'Item $i$ costs $i$ steps: $1 + 2 + \\dots + 20 = \\frac{20 \\cdot 21}{2} = 210$, against 20 steps on an array.' },
  };

  H['c310-1-runtime-def'] = {
    asks: 'Give the course’s definition of the running time of an algorithm on an input of size $n$.',
    idea: 'Running time is a count, not a stopwatch reading. You count the instructions the algorithm executes, and that count is the same on every computer, so it measures the algorithm and not the hardware.',
    steps: [
      'Definition (slide 33): the count of instructions that have to be executed by the algorithm for an input of size $n$.',
      'Why a count: one program may take 2 s on an old laptop and 0.5 s on a new one, but it executes the same instructions on both.',
      'Why "of size $n$": bigger inputs need more instructions, so running time is a function, written $T(n)$.',
      { text: 'Linear search, worst case (key absent), counting comparisons:', table: { head: ['$n$', '$T(n)$'], rows: [['5', '5'], ['100', '100'], ['1,000,000', '1,000,000']] } },
    ],
    answer: 'The count of instructions executed by the algorithm for an input of size $n$, written $T(n)$.',
    mistake: 'Giving it in seconds. Seconds depend on the machine; the course’s running time is the instruction count.',
    tryIt: { q: '"for i = 1 to n: print i" executes one print per pass. Counting prints, what are $T(n)$ and $T(20)$?', a: '$T(n) = n$, so $T(20) = 20$ prints, on any computer.' },
  };

  // ---------------------------------------------------------------- FindMaximum

  H['c310-1-findmax-updates'] = {
    asks: 'Run FindMaximum on ⟨3, 7, 2, 9, 5⟩ and count how many times the line max ← A[i] inside the if is executed.',
    idea: 'The update runs only when you meet a new record: an element bigger than everything before it. So count the records after the first element.',
    steps: [
      'Start: max ← A[0] = 3. That is the first line of the algorithm, not the update inside the if, so it does not count.',
      { text: 'One row per loop pass:', table: { head: ['$i$', 'A[i]', 'max before', 'A[i] > max?', 'updates so far'], rows: [['1', '7', '3', 'yes', '1'], ['2', '2', '7', 'no', '1'], ['3', '9', '7', 'yes', '2'], ['4', '5', '9', 'no', '2']] } },
      'The comparison ran 4 times, once per pass. The update ran only on the two "yes" rows.',
      'Read as records: 7 beats everything before it, and so does 9; 2 and 5 do not. Two records, two updates.',
    ],
    graph: {
      caption: 'Bars are the array values; the line is max so far. The line jumps exactly twice (at $i = 1$ and $i = 3$), and each jump is one update.',
      x: [-0.5, 4.5], y: [0, 10], xLabel: 'index i', yLabel: 'value',
      curves: [{ label: 'max so far', f: i => (i < 0.5 ? 3 : i < 2.5 ? 7 : 9), tone: 'a' }],
      bars: { label: 'A[i]', tone: 'b', values: [[0, 3], [1, 7], [2, 2], [3, 9], [4, 5]] },
      marks: [{ x: 1, label: 'update 1' }, { x: 3, label: 'update 2' }],
    },
    answer: '2: at $i = 1$ ($7 > 3$) and at $i = 3$ ($9 > 7$).',
    mistake: 'Answering 4, the number of comparisons. The comparison runs on every pass; the update runs only when it says yes.',
    tryIt: { q: 'FindMaximum on ⟨4, 6, 5, 9, 12, 3⟩: how many updates?', a: '$6 > 4$ yes, $5 > 6$ no, $9 > 6$ yes, $12 > 9$ yes, $3 > 12$ no: 3 updates (and 5 comparisons).' },
  };

  H['c310-1-findmax-invariant'] = {
    asks: 'Write a statement that is true at the start of every pass of FindMaximum’s loop, then use it to show the algorithm returns the largest element.',
    idea: 'Picture walking along the array carrying a "best so far" trophy. At the start of pass $i$ you have looked at A[0..i−1], and the trophy is the biggest of those. When you run out of array, you have looked at everything.',
    steps: [
      'Invariant: at the start of the pass with index $i$, max equals the largest element of A[0..i−1].',
      'Initialization: before the first pass $i = 1$ and max = A[0]. The range A[0..0] holds only A[0], so max is its largest element.',
      'Maintenance: if A[i] > max, max becomes A[i], which is then the largest of A[0..i]. If not, max is already at least A[i], so it is still the largest of A[0..i].',
      { text: 'Check on ⟨3, 7, 2, 9, 5⟩:', table: { head: ['start of pass $i$', 'A[0..i−1]', 'max'], rows: [['1', '3', '3'], ['2', '3, 7', '7'], ['3', '3, 7, 2', '7'], ['4', '3, 7, 2, 9', '9'], ['exit, $i = 5$', '3, 7, 2, 9, 5', '9']] } },
      'Termination: the loop stops when $i = n$ (the length). Put $i = n$ into the invariant: max is the largest of A[0..n−1], the whole array.',
    ],
    answer: 'Invariant: at the start of pass $i$, max = the largest element of A[0..i−1]. Initialization: $i = 1$, max = A[0]. Maintenance: the if keeps max = the largest of A[0..i]. Termination: the loop ends at $i = n$, so max is the largest element of all of A.',
    mistake: 'Writing "max is the largest of A[0..i]" at the start of pass $i$. At that moment A[i] has not been looked at yet, so the range ends at $i - 1$.',
    tryIt: { q: 'FindMinimum: min ← A[0]; for i ← 1 to length(A) − 1: if A[i] < min then min ← A[i]. State its invariant and its termination step.', a: 'At the start of pass $i$, min is the smallest of A[0..i−1]. The loop ends at $i = n$, so min is the smallest of A[0..n−1], the whole array.' },
  };

  // ---------------------------------------------------------------- Decision problems

  H['c310-1-decision-def'] = {
    asks: 'Define a decision problem.',
    idea: 'A decision problem is a yes/no question about an input. You hand it an input, and the only possible answers are "yes" and "no".',
    steps: [
      'Two parts: an input instance and a property. The question is whether the input has the property.',
      { text: 'Examples:', table: { head: ['problem', 'input', 'example answer'], rows: [['Is $n$ prime?', 'a positive integer', '13: yes'], ['Is A sorted?', 'an array', '⟨2, 5, 4⟩: no'], ['Does A contain the key?', 'an array and a key', '⟨4, 8, 1⟩, key 8: yes']] } },
      'Quick test: if the answer could be a number, a list or a route, the problem as stated is not a decision problem.',
    ],
    answer: 'A problem whose answer is binary (yes/no): it asks whether a given input instance satisfies a particular property or condition.',
    mistake: 'Calling "find the largest prime factor of $n$" a decision problem because it is about primes. Its answer is a number, so it is not.',
    tryIt: { q: 'Turn "find the largest element of A" into a decision problem.', a: '"Given A and a number $k$, does A contain an element $\\ge k$?" The answer is yes or no.' },
  };

  H['c310-1-decision-vs-opt'] = {
    asks: 'Explain how a decision problem differs from an optimization problem.',
    idea: 'Decision: "is there one that is good enough?" and the answer is yes or no. Optimization: "which one is best?" and the answer is the best solution itself.',
    steps: [
      'Optimization problem: among many possible solutions, find the best one (shortest, cheapest, most valuable).',
      'Decision problem: only say whether a solution meeting some condition exists.',
      { text: 'The same problem asked both ways:', table: { head: ['problem', 'optimization version', 'decision version'], rows: [['TSP', 'find the shortest tour of all cities', 'is there a tour of length $\\le 500$?'], ['Knapsack', 'find the most valuable load within capacity 10', 'is there a load of value $\\ge 80$ within capacity 10?']] } },
      'Any optimization problem has a decision version: replace "find the best" with "is there one at least this good?"',
    ],
    answer: 'An optimization problem asks for the best solution among many; a decision problem only asks whether a solution meeting some condition exists (yes/no).',
    mistake: 'Assuming the decision version is easy. "Is there a tour of length $\\le k$?" is still NP-complete; P and NP are defined using decision versions.',
    tryIt: { q: 'Write the decision version of "find the smallest number of coins that make 87 cents".', a: '"Can 87 cents be made with at most $k$ coins?" The answer is yes or no.' },
  };

  H['c310-1-decision-classify'] = {
    asks: 'For each of the three problems, decide whether the answer is yes/no (decision) or the best of many solutions (optimization).',
    idea: 'Ignore the topic and look at the shape of the answer. Yes/no means decision; a best route, set or value means optimization.',
    steps: [
      '(a) "Is 91 prime?" The answer is yes or no, so it is a decision problem. (It is no: $91 = 7 \\cdot 13$.)',
      '(b) "Find the shortest route…" The answer is a route, the best of many, so it is an optimization problem: TSP as slide 31 states it.',
      '(c) "Does some subset of $\\{4, 9, 13\\}$ sum to 17?" The answer is yes or no, so it is a decision problem.',
      { text: 'Checking (c) by listing every subset:', table: { head: ['subset', 'sum'], rows: [['∅', '0'], ['{4}', '4'], ['{9}', '9'], ['{13}', '13'], ['{4, 9}', '13'], ['{4, 13}', '17 ✓'], ['{9, 13}', '22'], ['{4, 9, 13}', '26']] } },
    ],
    answer: '(a) decision; (b) optimization; (c) decision.',
    mistake: 'Calling (c) optimization because you have to choose a subset. It asks only whether one exists, so it is a decision problem.',
    tryIt: { q: 'Classify: (a) Find the subset of $\\{3, 8, 11\\}$ with the largest sum below 15. (b) Can 8 queens be placed on a chessboard so that none attacks another?', a: '(a) Optimization: the answer is a best subset ({3, 11}, sum 14). (b) Decision: yes or no (it is yes).' },
  };

  // ---------------------------------------------------------------- Turing machines

  H['c310-1-dtm-def'] = {
    asks: 'Say what makes a Turing machine deterministic, and how deterministic machines relate to nondeterministic ones.',
    idea: 'Picture the machine’s rulebook as a table: each row is a (current state, symbol under the head) pair. Deterministic means every row holds exactly one instruction; nondeterministic means a row may offer several.',
    steps: [
      'At each step the machine looks at two things: its current state and the symbol under the head.',
      { text: 'Two rulebooks for the same pair:', table: { head: ['(state, symbol)', 'deterministic machine', 'nondeterministic machine'], rows: [['(q0, 0)', 'write 1, move right, go to q1', 'either: write 1, right, q1; or: write 0, left, q2'], ['(q0, 1)', 'write 1, move right, stay in q0', 'write 1, move right, stay in q0']] } },
      'Deterministic: exactly one valid transition for every (state, symbol), so the next move is never ambiguous and each run is a single path.',
      'A DTM is the special case of a nondeterministic machine in which every row happens to have one option. So DTMs are a subset of nondeterministic TMs.',
    ],
    answer: 'For every combination of state and symbol there is exactly one valid transition (it is unambiguous). Deterministic TMs are a subset of nondeterministic TMs.',
    mistake: 'Saying nondeterministic machines are a subset of deterministic ones. It is the other way round: every DTM is an NTM with one choice everywhere.',
    tryIt: { q: 'A machine has the rules (q1, a) → (write b, right, q2) and (q1, a) → (write a, left, q1). Is it deterministic?', a: 'No: the pair (q1, a) has two valid transitions, so the machine is nondeterministic.' },
  };

  H['c310-1-dtm-parts'] = {
    asks: 'Name the four key components of a deterministic Turing machine.',
    idea: 'Picture a clerk with a long strip of paper. The strip is the tape, the pencil tip is the head, the note saying which step the clerk is on is the state register, and the rulebook is the transition function.',
    steps: [
      { text: 'The four parts:', table: { head: ['part', 'what it does', 'picture'], rows: [['tape', 'a row of cells, each holding a symbol; holds the input and all work', 'the paper strip'], ['head', 'reads and writes one cell, moves left or right', 'the pencil'], ['state register', 'stores the current state', 'the note "I am on step 3"'], ['transition function', '(state, symbol) → (symbol to write, move, next state)', 'the rulebook']] } },
      'One step: read the symbol under the head, look up (state, symbol) in the transition function, then write, move and change state.',
      'Two physical parts (tape, head) and two control parts (state register, transition function).',
    ],
    answer: 'Tape, head, state register, transition function.',
    mistake: 'Listing "input" and "output" as parts. Both are written on the tape; the four parts are the machine itself.',
    tryIt: { q: 'A DTM is in state q3 reading 0, and its transition function says (q3, 0) → (1, left, q4). Which parts change, and how?', a: 'Tape: that cell becomes 1. Head: moves one cell left. State register: q3 becomes q4. The transition function never changes.' },
  };

  // ---------------------------------------------------------------- P, NP, NP-hard, NP-complete

  H['c310-1-P-def'] = {
    asks: 'Define the complexity class P.',
    idea: 'P is the "easy to solve" class: yes/no problems for which some step-by-step algorithm finds the answer within a polynomial number of steps, like $n$, $n^2$ or $n^3$.',
    steps: [
      'Three parts: decision problems; SOLVED (the answer is found, not just checked); in polynomial time by a deterministic Turing machine (an ordinary algorithm).',
      'Polynomial time means at most $c \\cdot n^k$ steps for some fixed $c$ and $k$. So $n$, $n \\lg n$ and $n^3$ qualify; $2^n$ and $n!$ do not.',
      { text: 'Why the line is drawn there:', table: { head: ['$n$', '$n^2$', '$n^3$', '$2^n$'], rows: [['10', '100', '1,000', '1,024'], ['20', '400', '8,000', '1,048,576'], ['40', '1,600', '64,000', '$\\approx 1.1 \\times 10^{12}$']] } },
      'Problems in P: "Is A sorted?" (one pass, $n - 1$ comparisons) and "Is the key in A?" (linear search, at most $n$ comparisons).',
    ],
    graph: {
      caption: 'Log scale. The polynomials $n^2$ and $n^3$ bend over; $2^n$ is a straight line that climbs past them both. That gap is what separates "solvable quickly" from "not known to be".',
      x: [1, 40], xLabel: 'n', yLabel: 'steps (log scale)', logY: true,
      curves: [{ label: '$n^2$', f: n => n * n, tone: 'a' }, { label: '$n^3$', f: n => n * n * n, tone: 'b' }, { label: '$2^n$', f: n => Math.pow(2, n), tone: 'c' }],
    },
    answer: 'The decision problems that can be solved in polynomial time by a deterministic Turing machine. Slogan: "Can I find the answer quickly?"',
    mistake: 'Leaving out "decision problems". P and NP classify yes/no problems.',
    tryIt: { q: 'The decision problem "Does A contain two equal elements?" can be answered by comparing every pair. Is it in P?', a: 'Yes: there are $\\frac{n(n-1)}{2}$ pairs, a polynomial number ($\\Theta(n^2)$) of comparisons.' },
  };

  H['c310-1-NP-def'] = {
    asks: 'Define the complexity class NP.',
    idea: 'NP is the "easy to check" class. Someone hands you a proposed answer, and you can confirm it is right in polynomial time, even if finding it yourself might take enormously long.',
    steps: [
      'Definition: the decision problems for which a proposed solution can be VERIFIED in polynomial time by a deterministic Turing machine.',
      'Example: Subset Sum with $\\{8, 3, 15, 6, 11\\}$ and target 20. Finding a subset by brute force means trying up to $2^5 = 32$ subsets, and $2^n$ in general.',
      'Checking a proposed subset, say $\\{3, 6, 11\\}$: add $3 + 6 + 11 = 20$ and compare with the target. At most $n$ additions and one comparison: polynomial.',
      { text: 'Find versus check:', table: { head: ['task', 'work'], rows: [['find a subset (brute force)', 'up to $2^n$ subsets'], ['verify a given subset', 'at most $n$ additions + 1 comparison']] } },
      'NP stands for "nondeterministic polynomial time". Whether every NP problem can also be SOLVED in polynomial time is not known.',
    ],
    answer: 'The decision problems for which a proposed solution can be verified in polynomial time by a deterministic Turing machine. Slogan: "Can I verify an answer quickly?"',
    mistake: 'Reading NP as "not polynomial". It means nondeterministic polynomial, and every problem in P is also in NP.',
    tryIt: { q: '"Can the vertices of graph G be coloured with 3 colours so that no edge joins two vertices of the same colour?" Why is this in NP?', a: 'Given a proposed colouring, check each edge once: one comparison per edge, which is polynomial. Quick to verify, so it is in NP.' },
  };

  H['c310-1-P-NP-relation'] = {
    asks: 'Say what is proven and what is still unknown about how P and NP relate.',
    idea: 'Picture two circles, P drawn inside NP. Proven: P sits inside NP. Unknown: whether NP has anything outside P, or the two circles are really the same circle.',
    steps: [
      'Why $P \\subseteq NP$: if you can solve a problem in polynomial time, you can check a proposed answer by ignoring it and solving the problem yourself. That is still polynomial.',
      { text: 'The two possible pictures:', table: { head: ['if…', 'picture', 'meaning'], rows: [['$P \\ne NP$', 'P is a smaller circle inside NP', 'some answers are quick to check but not quick to find'], ['$P = NP$', 'one circle', 'every answer that is quick to check is also quick to find']] } },
      'Nobody knows which picture is true (slide 26). It is one of the biggest open questions in computer science.',
      'No polynomial algorithm has been found for any NP-complete problem, which is why most people expect $P \\ne NP$. Expected is not proven.',
    ],
    answer: 'Known: $P \\subseteq NP$. Unknown: whether $P = NP$ or $P \\ne NP$, that is, whether every answer that can be checked quickly can also be found quickly.',
    mistake: 'Stating "$P \\ne NP$" as a fact. It is widely believed but unproven; only $P \\subseteq NP$ is known.',
    tryIt: { q: 'True, false or unknown: (a) every problem in P is in NP; (b) every problem in NP is in P.', a: '(a) True, proven ($P \\subseteq NP$). (b) Unknown: that is exactly the question "$P = NP$?"' },
  };

  H['c310-1-NPhard-def'] = {
    asks: 'Define NP-hard.',
    idea: 'NP-hard is a floor on difficulty: the problem is at least as hard as the hardest problems in NP. It sets no ceiling, so the problem may be much harder and need not be in NP at all.',
    steps: [
      '"At least as hard as the hardest problems in NP": a fast algorithm for it would give fast algorithms for every NP problem.',
      'It does not have to be verifiable in polynomial time, so it can lie outside NP (slide 28).',
      { text: 'Compare the classes:', table: { head: ['class', 'must be in NP?', 'at least as hard as the hardest in NP?'], rows: [['P', 'yes', 'only if $P = NP$'], ['NP-complete', 'yes', 'yes'], ['NP-hard', 'no', 'yes']] } },
      'Example outside NP: TSP as an optimization problem, "find the shortest tour". It is not a yes/no problem, and no fast way is known to confirm that a given tour is the shortest.',
    ],
    answer: 'A problem at least as hard as the hardest problems in NP. It need not be in NP: it does not have to be verifiable in polynomial time.',
    mistake: 'Reading NP-hard as "in NP and hard". The NP in the name is the class it is compared with, not a class it has to belong to.',
    tryIt: { q: 'Problem X is NP-hard, and then someone proves X is in NP. What is X called?', a: 'NP-complete: it is in NP and it is NP-hard.' },
  };

  H['c310-1-NPhard-meaning'] = {
    asks: 'Does NP-hard mean a problem cannot be solved? What do researchers do with NP-hard problems in practice?',
    idea: 'NP-hard means "no fast exact method is known", not "no method". Trying every possibility always works, it just takes exponential time, so in practice people accept a good answer found quickly.',
    steps: [
      'Brute force always solves it exactly: for Subset Sum, try all $2^n$ subsets. Correct, just slow.',
      { text: 'How slow, at $10^9$ subsets checked per second:', table: { head: ['$n$', 'subsets $2^n$', 'time'], rows: [['20', '1,048,576', 'about 0.001 s'], ['40', '$\\approx 1.1 \\times 10^{12}$', 'about 18 minutes'], ['60', '$\\approx 1.15 \\times 10^{18}$', 'about 36.5 years']] } },
      'So "hard" means the time explodes as $n$ grows, and no polynomial-time algorithm is known that avoids it.',
      'Researchers design approximation algorithms and heuristics: fast methods whose answers are near-optimal (slide 28).',
      'A TSP heuristic: from each city, go to the nearest city not yet visited. It takes $\\Theta(n^2)$ time and usually gives a decent tour, though not always the shortest.',
    ],
    graph: {
      caption: 'Log scale: brute force ($2^n$) against a polynomial ($n^3$). They are close for small $n$; by $n = 60$ the exponential is about $5 \\times 10^{12}$ times larger.',
      x: [1, 60], xLabel: 'n', yLabel: 'steps (log scale)', logY: true,
      curves: [{ label: '$n^3$', f: n => n * n * n, tone: 'a' }, { label: '$2^n$', f: n => Math.pow(2, n), tone: 'c' }],
    },
    answer: 'No. It means no polynomial-time algorithm is known and the problem is likely hard. Researchers use approximation algorithms or heuristics that give near-optimal answers in practical time.',
    mistake: 'Saying NP-hard problems "cannot be solved". They can; nobody knows how to solve them exactly in polynomial time.',
    tryIt: { q: 'Brute force checks $2^n$ subsets. If $n = 30$ takes 1 second, how long does $n = 40$ take?', a: '$2^{40} / 2^{30} = 2^{10} = 1024$ times as long: about 1024 s, roughly 17 minutes.' },
  };

  H['c310-1-NPC-def'] = {
    asks: 'Define NP-complete.',
    idea: 'Two conditions, both required: the problem is in NP (answers are quick to check) AND it is NP-hard (as hard as anything in NP). NP-complete problems are the hardest problems inside NP.',
    steps: [
      'Condition 1, in NP: a proposed solution can be verified in polynomial time.',
      'Condition 2, NP-hard: it is as hard as the hardest problems in NP.',
      'NP-complete = NP-hard $\\cap$ NP, the overlap of the two.',
      { text: 'Testing both conditions:', table: { head: ['problem', 'in NP?', 'NP-hard?', 'NP-complete?'], rows: [['Subset Sum', 'yes', 'yes', 'yes'], ['TSP, "find the shortest tour"', 'no (not yes/no)', 'yes', 'no'], ['"Is A sorted?"', 'yes (it is in P)', 'only if $P = NP$', 'only if $P = NP$']] } },
    ],
    answer: 'A problem that is both in NP and as hard as the hardest problems in NP (NP-hard).',
    mistake: 'Giving only one condition. "As hard as the hardest in NP" alone is NP-hard; "in NP" alone includes the easy problems of P.',
    tryIt: { q: 'Problem Y is in NP, but nobody knows whether it is NP-hard. Can you call it NP-complete?', a: 'No. NP-complete needs both conditions, and NP-hardness has not been shown.' },
  };

  H['c310-1-NPC-consequence'] = {
    asks: 'If someone finds a polynomial-time algorithm for one NP-complete problem, what follows? And why is that thought unlikely but not ruled out?',
    idea: 'Every NP problem can be translated into any NP-complete problem. So a fast algorithm for one NP-complete problem is a fast algorithm for all of NP: knock over one domino and the whole row falls.',
    steps: [
      'NP-hard means every problem in NP can be converted, in polynomial time, into this problem.',
      'With a polynomial algorithm for it, take any NP problem: convert it (polynomial time), then solve it (polynomial time). The total is still polynomial.',
      'So every NP problem is in P, which means $NP \\subseteq P$. Since $P \\subseteq NP$ is already known, $P = NP$.',
      'Unlikely: decades of work have produced no efficient algorithm for any NP-complete problem. Not ruled out: nobody has proven that such an algorithm cannot exist (slide 30).',
    ],
    answer: 'Every problem in NP could then be solved in polynomial time, so $P = NP$. None has ever been found, but nobody has proven that one cannot exist.',
    mistake: 'Concluding that only that one problem becomes easy. The point of NP-complete is that all of NP comes with it.',
    tryIt: { q: 'Converting problem Q into Subset Sum gives an input of size $n^2$. If Subset Sum had an algorithm taking $m^3$ steps on inputs of size $m$, how fast could you solve Q?', a: 'About $(n^2)^3 = n^6$ steps plus the conversion: polynomial. A polynomial of a polynomial is still a polynomial.' },
  };

  H['c310-1-NPC-vs-NPhard'] = {
    asks: 'Pick the true statement about how NP-hard and NP-complete problems relate.',
    idea: 'NP-complete is the part of NP-hard that lies inside NP. So every NP-complete problem is NP-hard, but an NP-hard problem can sit outside NP.',
    steps: [
      'NP-hard: at least as hard as the hardest in NP, wherever it lies. NP-complete: NP-hard AND in NP.',
      { text: 'Three regions:', table: { head: ['region', 'example'], rows: [['in NP, not known to be NP-hard', '"Is A sorted?" (in P)'], ['NP-complete (in NP and NP-hard)', 'Subset Sum; the yes/no versions of TSP and Knapsack'], ['NP-hard, outside NP', 'TSP as "find the shortest tour"']] } },
      '"Every NP-hard problem is NP-complete" is false: shortest-tour TSP is NP-hard but not in NP. "Two names for the same class" is false for the same reason.',
      '"An NP-complete problem need not be in NP" is false: being in NP is half of its definition.',
    ],
    answer: 'Every NP-complete problem is NP-hard, but an NP-hard problem need not be in NP.',
    mistake: 'Getting the sizes backwards. NP-hard is the bigger set; NP-complete is the NP-hard problems that are also in NP.',
    tryIt: { q: 'Is every NP-complete problem in NP? Is every NP-hard problem in NP?', a: 'Yes, by definition. No: NP-hard problems may lie outside NP.' },
  };

  H['c310-1-NPC-examples'] = {
    asks: 'Name the three NP-complete problems the course uses as examples.',
    idea: 'Picture one trip: a travelling salesman plans his route (TSP), packs his knapsack (Knapsack), and pays an exact amount from his coins (Subset Sum).',
    steps: [
      { text: 'The three problems from slide 31:', table: { head: ['problem', 'input', 'asks'], rows: [['Traveling Salesman (TSP)', 'cities and the distances between them', 'the shortest route visiting each city once and returning home'], ['Knapsack', 'items with weights and values; a capacity', 'the most valuable set of items within the capacity'], ['Subset Sum', 'a set of integers; a target', 'is there a subset adding to exactly the target?']] } },
      'All three are easy to check and hard to solve: a proposed tour, load or subset is verified with a few additions, but brute force tries exponentially many.',
      'TSP and Knapsack as stated ask for the best answer. It is their yes/no versions ("a tour of length $\\le k$?", "value $\\ge V$ within capacity?") that are NP-complete; Subset Sum is already yes/no.',
    ],
    answer: 'The Traveling Salesman Problem, the Knapsack Problem, and the Subset Sum Problem.',
    mistake: 'Naming sorting or searching. Those are in P; the course’s NP-complete examples are TSP, Knapsack and Subset Sum.',
    tryIt: { q: 'Which of the three is already a decision problem as slide 31 states it?', a: 'Subset Sum ("determine if there exists a subset…"). TSP and Knapsack ask for the best route or load.' },
  };

  H['c310-1-knapsack'] = {
    asks: 'State the Knapsack problem.',
    idea: 'You have a backpack that holds at most $W$ kilograms and a pile of items, each with a weight and a value. Pick the items worth the most in total without going over $W$.',
    steps: [
      'Input: items, each with a weight and a value, and a capacity $W$. Output: the set of items with the largest total value whose total weight is at most $W$.',
      { text: 'Example, $W = 10$, items A (weight 5, value 10), B (4, 40), C (6, 30), D (3, 50):', table: { head: ['items', 'weight', 'value', 'fits?'], rows: [['B, D', '7', '90', 'yes, best'], ['C, D', '9', '80', 'yes'], ['B, C', '10', '70', 'yes'], ['A, D', '8', '60', 'yes'], ['B, C, D', '13', '120', 'no, too heavy']] } },
      'Brute force checks all $2^4 = 16$ subsets of the items and keeps the most valuable one that fits.',
    ],
    answer: 'Given items, each with a weight and a value, choose the most valuable combination to put in a knapsack of limited capacity without exceeding the capacity.',
    mistake: 'Leaving out one side of it. The weights limit what you may take (the capacity); the values are what you maximize.',
    tryIt: { q: 'Capacity 8; items P (weight 3, value 4), Q (4, 5), R (5, 8). What is the best load?', a: 'P + R: weight 8, value 12. (P + Q is 7 and 9; Q + R weighs 9, too heavy.)' },
  };

  H['c310-1-subset-sum'] = {
    asks: 'State the Subset Sum problem and describe its brute-force solution.',
    idea: 'You have coins of different values and must pay exactly $T$: is there a handful that adds up to exactly $T$? Brute force tries every possible handful.',
    steps: [
      'Input: a set of integers and a target $T$. Question (yes/no): is there a subset whose sum is exactly $T$?',
      { text: 'Example $\\{2, 5, 7\\}$, $T = 12$, every subset:', table: { head: ['subset', 'sum'], rows: [['∅', '0'], ['{2}', '2'], ['{5}', '5'], ['{7}', '7'], ['{2, 5}', '7'], ['{2, 7}', '9'], ['{5, 7}', '12 ✓'], ['{2, 5, 7}', '14']] } },
      'Brute force: list every subset, add it up, compare with $T$. Answer yes when one matches, no if none does.',
      'There are $2^n$ subsets, so this takes exponential time: correct, but hopeless for large sets.',
    ],
    answer: 'Given a set of integers and a target, decide whether some subset sums exactly to the target. Brute force: generate every subset and check whether any of them sums to the target.',
    mistake: 'Checking only pairs. Brute force covers every size, from the empty set to the whole set.',
    tryIt: { q: 'Set $\\{3, 6, 8\\}$, target 10: yes or no? Show the check.', a: 'Subset sums: 0, 3, 6, 8, 9, 11, 14, 17. None is 10, so no.' },
  };

  H['c310-1-subset-count'] = {
    asks: 'Count the subsets brute-force Subset Sum examines for a set of 10 integers, counting the empty set and the whole set.',
    idea: 'Build a subset by walking past the elements one at a time and saying "in" or "out" to each. Two choices, made 10 times: $2 \\times 2 \\times \\dots \\times 2$.',
    steps: [
      'Element 1: in or out, 2 ways. Element 2: in or out for each of those, $2 \\times 2 = 4$ ways.',
      'Each new element doubles the count. For $\\{A, B, C\\}$: $2^3 = 8$, the 8 subsets listed on slide 32.',
      { text: 'Doubling table:', table: { head: ['$n$', 'subsets $2^n$'], rows: [['1', '2'], ['2', '4'], ['3', '8'], ['4', '16'], ['5', '32'], ['10', '1024']] } },
      'For $n = 10$: $2^{10} = 1024$. That includes ∅ (every element out) and the whole set (every element in).',
    ],
    graph: {
      caption: 'Each extra element doubles the bar. Ten elements already give 1024 subsets; the curve $2^n$ keeps doubling.',
      x: [0, 11], y: [0, 1100], xLabel: 'n (set size)', yLabel: 'subsets',
      curves: [{ label: '$2^n$', f: n => Math.pow(2, n), tone: 'a' }],
      bars: { label: 'subsets of an n-element set', tone: 'b', values: [[1, 2], [2, 4], [3, 8], [4, 16], [5, 32], [6, 64], [7, 128], [8, 256], [9, 512], [10, 1024]] },
    },
    answer: '1024 = $2^{10}$.',
    mistake: 'Answering $10^2 = 100$. Each element has 2 options, so it is 2 multiplied by itself 10 times: $2^{10}$.',
    tryIt: { q: 'How many subsets does a 6-element set have, and how many of them are non-empty?', a: '$2^6 = 64$ subsets. Leaving out the empty set: 63.' },
  };

  // ---------------------------------------------------------------- Selection sort vs. merge sort

  H['c310-1-sel-vs-merge-small'] = {
    asks: 'Selection sort takes $c_1 n^2$ and merge sort $c_2 n \\lg n$, with $c_1 < c_2$. Say which is faster for small $n$ and which for large $n$, and why.',
    idea: 'Write both as $n \\times$ something: $c_1 \\cdot n \\cdot n$ against $c_2 \\cdot n \\cdot \\lg n$. The race is really $c_1 n$ against $c_2 \\lg n$: the smaller constant helps at the start, but $n$ runs away from $\\lg n$.',
    steps: [
      'Divide both by the common factor $n$: compare $c_1 n$ (selection) with $c_2 \\lg n$ (merge).',
      { text: 'Use the lecture’s instruction counts, $c_1 = 2$ and $c_2 = 50$:', table: { head: ['$n$', '$2n^2$', '$50 n \\lg n$', 'fewer'], rows: [['16', '512', '3,200', 'selection'], ['64', '8,192', '19,200', 'selection'], ['128', '32,768', '44,800', 'selection'], ['256', '131,072', '102,400', 'merge'], ['512', '524,288', '230,400', 'merge']] } },
      'Small $n$: $\\lg n$ is not much smaller than $n$ ($\\lg 16 = 4$), so the smaller constant $c_1$ decides it. Selection sort wins.',
      'Large $n$: $\\lg n$ is tiny next to $n$ ($\\lg 10^6 \\approx 20$), so $c_2 \\lg n < c_1 n$ whatever the constants. Merge sort wins; with 2 and 50 it takes over at $n = 190$.',
    ],
    graph: {
      caption: 'The parabola $2n^2$ starts below merge sort’s curve, crosses it at $n = 190$, and stays above for every larger $n$.',
      x: [2, 300], y: [0, 180000], xLabel: 'n', yLabel: 'instructions',
      curves: [{ label: 'selection: $2n^2$', f: n => 2 * n * n, tone: 'b' }, { label: 'merge: $50 n \\lg n$', f: n => 50 * n * Math.log2(n), tone: 'a' }],
      marks: [{ x: 190, label: '$n = 190$' }],
    },
    answer: 'Small $n$: selection sort, because its smaller constant matters more than the gap between $n$ and $\\lg n$. Large $n$: merge sort, because $\\lg n$ grows much more slowly than $n$, so $c_2 n \\lg n$ eventually beats $c_1 n^2$ whatever the constants.',
    mistake: 'Deciding from the constants alone ("$c_1 < c_2$, so selection is always faster"). Constants decide small $n$; growth rates decide large $n$.',
    tryIt: { q: 'Algorithm X costs $n^2$ and algorithm Y costs $8 n \\lg n$. Which does fewer steps at $n = 16$, and at $n = 64$?', a: '$n = 16$: X 256, Y $8 \\cdot 16 \\cdot 4 = 512$, so X. $n = 64$: X 4096, Y $8 \\cdot 64 \\cdot 6 = 3072$, so Y.' },
  };

  H['c310-1-sel-time-A'] = {
    asks: 'Find how many seconds computer A needs: the number of instructions divided by the instructions it runs per second.',
    idea: 'Time = work ÷ speed, like distance ÷ speed for a car trip. Here the work is $2n^2$ instructions and the speed is $10^{10}$ instructions per second.',
    steps: [
      'With $n = 10^7$: $n^2 = (10^7)^2 = 10^{14}$. A power of a power multiplies the exponents: $7 \\times 2 = 14$.',
      'Work: $2n^2 = 2 \\cdot 10^{14}$ instructions.',
      'Divide by the speed: $\\frac{2 \\cdot 10^{14}}{10^{10}} = 2 \\cdot 10^{14 - 10} = 2 \\cdot 10^4 = 20{,}000$ s.',
      'In hours: $20{,}000 / 3600 \\approx 5.56$ h, the slide’s "more than 5.5 hours".',
    ],
    answer: '20,000 seconds.',
    mistake: 'Writing $(10^7)^2 = 10^9$ by adding the exponents. For a power of a power, multiply them: $10^{14}$.',
    tryIt: { q: 'Same computer A ($10^{10}$ instructions per second, $2n^2$ instructions), $n = 10^6$. How many seconds?', a: '$2 \\cdot (10^6)^2 = 2 \\cdot 10^{12}$ instructions; $2 \\cdot 10^{12} / 10^{10} = 200$ s.' },
  };

  H['c310-1-merge-time-B'] = {
    asks: 'Find merge sort’s time on computer B: $50 n \\lg n$ instructions at $10^7$ per second, with $n = 10^7$.',
    idea: 'Same rule, time = work ÷ speed. The only new piece is $\\lg(10^7)$, the number of times you can halve $10^7$ before reaching 1: about 23.25.',
    steps: [
      '$\\lg(10^7) = 7 \\lg 10$, because the exponent comes out in front. And $\\lg 10 \\approx 3.3219$, since $2^{3.32} \\approx 10$.',
      '$7 \\times 3.3219 \\approx 23.253$.',
      'Work: $50 \\cdot 10^7 \\cdot 23.253 \\approx 1.1627 \\cdot 10^{10}$ instructions.',
      'Divide by $10^7$ per second. The $10^7$ cancels, leaving $50 \\times 23.253 \\approx 1162.7$, so about 1163 s.',
      'In minutes: $1163 / 60 \\approx 19.4$, the slide’s "less than 20 minutes".',
    ],
    answer: 'About 1163 seconds.',
    mistake: 'Using $\\log_{10}(10^7) = 7$, which gives $50 \\times 7 = 350$ s. In this course $\\lg$ means log base 2.',
    tryIt: { q: 'Same computer B, $n = 2^{20}$ (about a million). How many seconds?', a: '$\\lg 2^{20} = 20$. Work: $50 \\cdot 2^{20} \\cdot 20 = 1000 \\cdot 2^{20} = 1{,}048{,}576{,}000$; divided by $10^7$: about 104.9 s.' },
  };

  H['c310-1-sel-merge-lesson'] = {
    asks: 'Explain how computer B, 1000 times slower, still sorts $10^7$ numbers about 17 times sooner, and what happens as $n$ grows.',
    idea: 'Hardware speed is a constant factor: it divides the time by the same number at every $n$. The growth-rate gap between $n^2$ and $n \\lg n$ is the factor $n / \\lg n$, which keeps growing, and a growing factor eventually beats any fixed one.',
    steps: [
      'Ratio of the times, A over B: $\\frac{2n^2 / 10^{10}}{50 n \\lg n / 10^7} = \\frac{2n^2 \\cdot 10^7}{50 n \\lg n \\cdot 10^{10}} = \\frac{n}{25{,}000 \\lg n}$.',
      'At $n = 10^7$: $\\frac{10^7}{25{,}000 \\times 23.25} \\approx 17.2$. B finishes 17 times sooner.',
      { text: 'The same ratio at other sizes:', table: { head: ['$n$', 'A (selection)', 'B (merge)', 'A ÷ B'], rows: [['$10^5$', '2 s', '8.3 s', '0.24'], ['$10^6$', '200 s', '99.7 s', '2.0'], ['$10^7$', '20,000 s', '1163 s', '17.2'], ['$10^8$', '$2 \\cdot 10^6$ s', '13,288 s', '150.5']] } },
      'Each tenfold increase in $n$ makes B’s lead almost ten times bigger. Below about $n = 471{,}000$ computer A wins: its 1000-fold hardware lead still decides there.',
    ],
    graph: {
      caption: 'Log scale. A ÷ B crosses 1 (break-even) near $n \\approx 4.7 \\times 10^5$ and keeps climbing: about 17 at $10^7$, 150 at $10^8$.',
      x: [3, 9], xLabel: 'log10 of n', yLabel: 'A time ÷ B time (log scale)', logY: true,
      curves: [{ label: '$\\frac{n}{25000 \\lg n}$', f: e => Math.pow(10, e) / (25000 * e * Math.log2(10)), tone: 'a' }, { label: 'equal time', f: () => 1, tone: 'c' }],
      marks: [{ x: 5.67, label: 'break-even' }],
    },
    answer: 'Merge sort’s running time grows more slowly ($n \\lg n$ vs. $n^2$), and that outweighs a 1000-fold hardware advantage. The gap gets larger as $n$ grows.',
    mistake: 'Thinking a faster computer can make up for a worse growth rate. It helps by a fixed factor; $n / \\lg n$ passes any fixed factor once $n$ is large enough.',
    tryIt: { q: 'Using the ratio $\\frac{n}{25{,}000 \\lg n}$, how many times sooner does B finish at $n = 2^{30}$ (about $10^9$)?', a: '$\\lg 2^{30} = 30$: $\\frac{2^{30}}{25{,}000 \\cdot 30} = \\frac{1{,}073{,}741{,}824}{750{,}000} \\approx 1432$ times.' },
  };

  H['c310-1-sel-merge-1e8'] = {
    asks: 'Redo both time calculations with $n = 10^8$ and turn the seconds into hours or days.',
    idea: 'Same rule, time = work ÷ speed. One warning: slide 36 says selection sort takes "more than 23 hours", but the arithmetic gives about 23 days. Trust the arithmetic.',
    steps: [
      'A: $2 \\cdot (10^8)^2 = 2 \\cdot 10^{16}$ instructions; $2 \\cdot 10^{16} / 10^{10} = 2 \\cdot 10^6$ s.',
      'Convert: $2{,}000{,}000 / 3600 \\approx 555.6$ hours, and $555.6 / 24 \\approx 23.1$ days.',
      'B: $\\lg(10^8) = 8 \\times 3.3219 \\approx 26.58$. Work: $50 \\cdot 10^8 \\cdot 26.58 \\approx 1.329 \\cdot 10^{11}$; divided by $10^7$: about 13,288 s.',
      'Convert: $13{,}288 / 3600 \\approx 3.7$ hours, the slide’s "4 hours".',
      'So the slide’s "23 hours" should read 23 days: 555 hours is 23 days. CLRS’s version of this example also says 23 days.',
    ],
    answer: 'A: $2 \\cdot 10^6$ s, about 23 days. B: about 13,300 s, about 3.7 hours.',
    mistake: 'Copying the slide’s "23 hours". Divide by 3600 to get hours, then by 24 to get days: $2 \\cdot 10^6$ s is 555 hours.',
    tryIt: { q: 'How long does computer A take with selection sort at $n = 10^9$?', a: '$2 \\cdot 10^{18} / 10^{10} = 2 \\cdot 10^8$ s. Divided by 3600 and by 24: about 2315 days, roughly 6.3 years.' },
  };

  // ---------------------------------------------------------------- Binary trees

  H['c310-1-full-tree'] = {
    asks: 'Define a full binary tree.',
    idea: 'Full means "no only children". Look at each node: it has either no children (a leaf) or exactly two, never one.',
    tree: {
      levels: [{ nodes: ['R'] }, { nodes: ['A', 'B'] }, { nodes: ['C', 'D', '$\\varnothing$', '$\\varnothing$'] }],
      caption: '$\\varnothing$ marks an empty child slot. R and A have 2 children; B, C and D have 0. No node has exactly 1, so the tree is full, even though its leaves sit at different depths.',
    },
    steps: [
      'Check every node: count its children. Full means each count is 0 or 2.',
      { text: 'For the tree in the picture:', table: { head: ['node', 'children', '0 or 2?'], rows: [['R', '2', 'yes'], ['A', '2 (C, D)', 'yes'], ['B', '0', 'yes'], ['C', '0', 'yes'], ['D', '0', 'yes']] } },
      'Remove D: A now has 1 child, so the tree is no longer full.',
      'Fullness is about children per node only. Leaves at different depths (B at depth 1, C and D at depth 2) are allowed.',
    ],
    answer: 'A binary tree in which every node has either 0 or 2 children (no node has exactly one child).',
    mistake: 'Confusing full with "every level filled". A full tree can be lopsided; only the number of children per node matters.',
    tryIt: { q: 'Root R has children X and Y; X has one child, Z. Is the tree full? Fix it by adding one node.', a: 'Not full: X has 1 child. Give X a second child; then R and X have 2 children and Y, Z and the new node have 0.' },
  };

  H['c310-1-complete-tree'] = {
    asks: 'Define a complete binary tree.',
    idea: 'Fill the tree the way you read a page: top row first, each row from left to right, never skipping a spot. Stop anywhere, and the shape you have is complete.',
    tree: {
      levels: [{ nodes: ['R'] }, { nodes: ['A', 'B'] }, { nodes: ['C', 'D', 'E'] }],
      caption: 'Levels 0 and 1 are full. The last level holds C, D, E packed to the left (C, D under A, E under B); its gap is at the right end. Complete.',
    },
    steps: [
      'Rule 1: every level except possibly the last is completely filled.',
      'Rule 2: the nodes on the last level are as far left as possible, with no empty slot before a node.',
      { text: 'Test some shapes:', table: { head: ['shape', 'complete?', 'why'], rows: [['R; A, B; C, D, E (left-packed)', 'yes', 'last level’s gap is at the right'], ['R; A, B; C, D under A, E as B’s RIGHT child', 'no', 'B’s left slot is empty before E'], ['R with only a left child', 'yes', 'last level filled from the left'], ['R with only a right child', 'no', 'the left slot is empty']] } },
      'Number the nodes 1, 2, 3, … level by level, left to right. Complete means positions 1 to $n$ are all used with no holes, which is why heaps (later in the course) fit in an array.',
    ],
    answer: 'A binary tree in which every level is completely filled except possibly the last, and the last level is filled from left to right.',
    mistake: 'Calling a tree incomplete because its last level is only partly filled. That is allowed; the last level only has to be filled from the left.',
    tryIt: { q: 'A complete binary tree has 10 nodes. How many are on each level?', a: 'Level 0: 1, level 1: 2, level 2: 4 (7 so far), level 3: the remaining 3, at the far left.' },
  };

  H['c310-1-full-complete-tf'] = {
    asks: 'Decide whether "every full tree is complete" and "every complete tree is full" are true. For each false one, give a tree that breaks it.',
    idea: 'The two words check different things. Full checks each node (0 or 2 children); complete checks how the levels fill (top-down, left to right). A tree can pass one check and fail the other, in both directions.',
    tree: {
      levels: [{ nodes: ['R'] }, { nodes: ['A', 'B'] }, { nodes: ['$\\varnothing$', '$\\varnothing$', 'C', 'D'] }],
      caption: 'Counterexample for (a). Full: R and B have 2 children; A, C, D have 0. Not complete: on level 2, A’s two slots ($\\varnothing$) are empty while B’s are used.',
    },
    steps: [
      'To disprove "every X is Y", one tree that is X but not Y is enough.',
      '(a) The tree above: R has children A and B, B has children C and D, A is a leaf. Every node has 0 or 2 children, so it is full.',
      'Level 2 must fill from the left, but A’s slots are empty while B’s are used. So the tree is not complete, and (a) is false.',
      '(b) R with only a left child A is complete: level 0 is full and the last level is filled from the left. It is not full, because R has exactly 1 child, so (b) is false.',
      'The card’s answer uses a deeper tree for (a) (A’s left child has two children). Any full tree with a gap like this one works.',
    ],
    answer: '(a) False: e.g. R with children A and B, where only B has children; full, but level 2 is not filled from the left. (b) False: a root with only a left child is complete but not full.',
    mistake: 'Answering "true" for (b) because complete trees look tidy. The last node of a complete tree can be a lone left child, so some node can have 1 child.',
    tryIt: { q: 'Draw a 5-node tree that is both full and complete.', a: 'R with children A and B; A with children C and D. Full (every node has 0 or 2 children) and complete (levels 0 and 1 full, C and D at the left of level 2).' },
  };

  // ---------------------------------------------------------------- Asymptotic analysis, RAM

  H['c310-2-experimental-problems'] = {
    asks: 'Give the lecture’s three reasons why implementing two algorithms and timing them is a poor way to compare them.',
    idea: 'A stopwatch measures one race, on one track, on one day. You want to know which algorithm is faster in general: on any input, any machine, any size.',
    steps: [
      { text: 'The three problems, and how asymptotic analysis avoids each:', table: { head: ['problem', 'what goes wrong', 'the fix'], rows: [['depends on the input', 'linear search finds a key in slot 1 after 1 comparison, but needs $n$ on another input of the same size', 'analyze best, worst and average over all inputs of size $n$'], ['machine-dependent', 'the same code runs faster on a faster computer', 'count instructions, not seconds'], ['input size is limited', 'you can only test the sizes you have time for', 'study the count as $n \\to \\infty$']] } },
      'Asymptotic analysis answers all three at once: count instructions, for every input of size $n$, as a formula in $n$.',
      'Lecture 1 shows the danger: at $n = 10^5$ selection sort on A beats merge sort on B (2 s vs. 8.3 s), but at $n = 10^7$ it loses 17-fold. A test that stopped at $10^5$ picks the wrong algorithm.',
    ],
    answer: 'The running time depends on which input of size $n$ is given; it is machine-dependent; and the input sizes you can test are limited.',
    mistake: 'Listing "it takes too long to write the code". The three reasons are about what a timing means: which input, which machine, which sizes.',
    tryIt: { q: 'You time two sorts on your laptop using one random array of 1000 numbers. Which of the three problems does this test have?', a: 'All three: one input (another array of that size may behave differently), one machine, and one small size.' },
  };

  H['c310-2-asymptotic-def'] = {
    asks: 'Say what asymptotic analysis is and what it tells you about running time.',
    idea: 'Zoom out on the graph of running time until $n$ is huge. Constant factors and small bumps blur away and only the shape of the curve is left: linear, quadratic, and so on. That shape is the order of growth.',
    steps: [
      'Asymptotic analysis is the theoretical (not experimental) determination of the time, space and other resources an algorithm needs.',
      'Running time on one input = the number of primitive operations executed.',
      'Asymptotic analysis asks how that count grows as $n$ gets very large: its growth rate, or order of growth.',
      { text: 'Why only the growth rate matters in the end:', table: { head: ['$n$', '$100n + 500$', '$n^2$'], rows: [['10', '1,500', '100'], ['100', '10,500', '10,000'], ['1,000', '100,500', '1,000,000'], ['10,000', '1,000,500', '100,000,000']] } },
      'At small $n$ the quadratic looks cheaper; from $n \\approx 105$ on it is more expensive, forever. The growth rate decides.',
    ],
    graph: {
      caption: 'The line $100n + 500$ starts far above the parabola $n^2$, but the parabola crosses it near $n = 105$ and never comes back.',
      x: [0, 200], y: [0, 40000], xLabel: 'n', yLabel: 'operations',
      curves: [{ label: '$100n + 500$', f: n => 100 * n + 500, tone: 'a' }, { label: '$n^2$', f: n => n * n, tone: 'b' }],
      marks: [{ x: 105, label: '$n \\approx 105$' }],
    },
    answer: 'The theoretical determination of the time, space and other resources an algorithm needs. It gives the growth rate (order of growth) of the running time as the problem size gets very large, not the running time for one particular input.',
    mistake: 'Thinking it gives the running time on a particular input. It describes how the time grows as $n$ grows.',
    tryIt: { q: 'Which has the larger order of growth: $T_1(n) = 1000n$ or $T_2(n) = n^2 / 10$? Where do they meet?', a: '$T_2$ (quadratic). $n^2 / 10 = 1000n$ gives $n = 10{,}000$; beyond that $T_2$ is larger.' },
  };

  H['c310-2-ram'] = {
    asks: 'State the four assumptions of the RAM (Random Access Machine) model.',
    idea: 'The RAM is an imaginary, simplified computer on which every basic step costs the same. On it, "count the steps" and "measure the time" give the same answer. Each assumption removes one real-world complication.',
    steps: [
      { text: 'The four assumptions:', table: { head: ['assumption', 'real-world complication it removes'], rows: [['1. instructions run one after another, nothing concurrent', 'several cores working at once'], ['2. all memory is equally expensive to access', 'caches: some reads are faster than others'], ['3. each instruction takes constant time (except function calls)', 'some instructions taking longer than others'], ['4. word size is constant (unless manipulating bits)', 'numbers too big for one machine word']] } },
      'Short version: one at a time, any address, fixed price, fixed size.',
      'With all four, time = (number of instructions) × (a constant), so counting instructions gives the growth rate.',
    ],
    answer: '1) Instructions execute one after another, with no concurrent operations. 2) All memory is equally expensive to access. 3) Each instruction takes a constant amount of time (except function calls). 4) Word size is constant (unless explicitly manipulating bits).',
    mistake: 'Forgetting the function-call exception in assumption 3. A call costs whatever the called function costs.',
    tryIt: { q: 'Under the RAM model, roughly how many constant-time instructions is "x = A[i] + A[j] * 2", and does that depend on $n$?', a: 'About 5 (read A[i], read A[j], multiply, add, store). A constant: it does not depend on $n$ or on $i$ and $j$.' },
  };

  H['c310-2-ram-exception'] = {
    asks: 'Pick the operation that the RAM model does NOT count as one constant-time step.',
    idea: 'A function call is not one step: it hands control to a whole other algorithm, and you pay for everything that algorithm does.',
    steps: [
      'Reading $A[i]$: the RAM assumes all memory is equally expensive, so any index costs the same constant.',
      'Comparing two words and adding two integers: single instructions on fixed-size words, so constant.',
      'A function call costs the running time of the function it calls. "m = FindMaximum(A)" on $n$ elements costs $n - 1$ comparisons, not 1.',
      'With recursion this shows up in the formula: binary search’s call on half the list costs $T(n/2)$, so its cost is written $T(n) = T(n/2) + c$.',
    ],
    answer: 'A call to a function.',
    mistake: 'Charging 1 for a line that contains a call. Add the called function’s full cost.',
    tryIt: { q: 'A loop runs $n$ times, and each pass calls a function that does $n$ steps. What is the total cost?', a: '$n \\times n = n^2$ steps, not $n$: each call costs $n$.' },
  };

  // ---------------------------------------------------------------- Best, worst, average case

  H['c310-2-avg-def'] = {
    asks: 'Define the average-case running time, and name the shortcut the lecture says is wrong.',
    idea: 'Line up every input of size $n$, run the algorithm on each, and take the mean of the costs. Most inputs might be cheap, or most might be expensive, so you have to count rather than guess from the two extremes.',
    steps: [
      'Definition: the expected running time over all inputs of size $n$ (each input equally likely, or weighted by a probability distribution).',
      { text: 'Example: max updates in FindMaximum over all 24 orderings of 4 different numbers:', table: { head: ['updates', 'orderings with that many'], rows: [['0', '6'], ['1', '11'], ['2', '6'], ['3', '1']] } },
      'Average $= \\frac{0 \\cdot 6 + 1 \\cdot 11 + 2 \\cdot 6 + 3 \\cdot 1}{24} = \\frac{26}{24} \\approx 1.08$.',
      'The wrong shortcut: $(\\text{best} + \\text{worst}) / 2 = (0 + 3) / 2 = 1.5$. It misses because most orderings need few updates.',
    ],
    graph: {
      caption: 'How many of the 24 orderings need 0, 1, 2 or 3 updates. Most of the weight is on the left, so the true average (1.08) sits left of the midpoint (1.5).',
      x: [-0.5, 3.5], y: [0, 12], xLabel: 'updates', yLabel: 'orderings',
      bars: { label: 'orderings', tone: 'b', values: [[0, 6], [1, 11], [2, 6], [3, 1]] },
      marks: [{ x: 1.083, label: 'average 1.08' }, { x: 1.5, label: 'midpoint 1.5' }],
    },
    answer: 'The expected running time over all possible inputs of size $n$ (average every input’s time, or weight inputs by a probability distribution). It is NOT $(\\text{best} + \\text{worst})/2$.',
    mistake: 'Computing $(\\text{best} + \\text{worst}) / 2$. Weight each cost by how many inputs (or how much probability) have it.',
    tryIt: { q: 'Linear search on 4 elements; the key is in slot 1 half of the time, and in slots 2, 3, 4 with probability $\\frac{1}{6}$ each. Average comparisons?', a: '$\\frac{1}{2} \\cdot 1 + \\frac{1}{6}(2 + 3 + 4) = 0.5 + 1.5 = 2$. The midpoint $(1 + 4)/2 = 2.5$ would be wrong.' },
  };

  H['c310-2-linsearch-cases'] = {
    asks: 'For linear search on $n$ elements, say which input is the best case and which is the worst, and how many comparisons each makes.',
    idea: 'Linear search checks the slots in order and stops at the key. Best: the key is in the first slot. Worst: you check every slot and the key is not there (or it is in the last one).',
    steps: [
      { text: 'Slide 10’s array ⟨1, 3, 15, 7, 19, 11⟩, $n = 6$:', table: { head: ['key', 'comparisons', 'case'], rows: [['1', '1', 'best'], ['15', '3', ''], ['11', '6', 'worst (last slot)'], ['5', '6', 'worst (absent)']] } },
      'Best case: the key is at position 1, so 1 comparison, whatever $n$ is: $\\Theta(1)$.',
      'Worst case: the key is absent (or last), so all $n$ positions are checked: $n$ comparisons, $\\Theta(n)$. Lecture 3 writes it $T(n) = c_1 n + c_2$.',
    ],
    answer: 'Best: the key is at the first position, 1 comparison, $\\Theta(1)$. Worst: the key is not in the array (or is last), $n$ comparisons, $\\Theta(n)$.',
    mistake: 'Calling $n = 1$ the best case. The best case is the best input of a general size $n$: the key in slot 1.',
    tryIt: { q: 'Linear search on ⟨8, 2, 6, 2, 9⟩: how many comparisons for key 2, and for key 4?', a: 'Key 2: it stops at the first match, slot 2, so 2 comparisons. Key 4: absent, so all 5.' },
  };

  // ---------------------------------------------------------------- Binary search

  H['c310-2-binsearch-best'] = {
    asks: 'Say which input gives binary search its best case, and what $T(n)$ is then.',
    idea: 'Binary search starts by looking at the middle element. If the key is sitting right there, it is done after one look, however long the array is.',
    steps: [
      'First step: mid = left + (right − left) // 2, then test arr[mid] == target.',
      'Slide 12–13 example: arr = [1, 2, 3, 4, 5, 6, 7, 8, 9], left = 0, right = 8, so mid = 0 + 8 // 2 = 4 and arr[4] = 5. Target 5 is found on the first comparison.',
      'An array of a million elements behaves the same when the target is in the middle: one comparison, return. So $T(n) = 1$, constant.',
      { text: 'Best against worst:', table: { head: ['$n$', 'best', 'worst ($\\lfloor \\lg n \\rfloor + 1$)'], rows: [['9', '1', '4'], ['1,000', '1', '10'], ['1,000,000', '1', '20']] } },
    ],
    answer: 'The key equals the middle element on the first comparison, so it returns immediately: $T(n) = 1$, constant time whatever $n$ is.',
    mistake: 'Saying the best case is $\\lg n$ "because it halves". Halving happens only when the middle is not the key; in the best case it never halves.',
    tryIt: { q: 'Binary search on [2, 4, 6, 8, 10, 12, 14] (indices 0 to 6): which target gives the best case?', a: 'mid = 0 + 6 // 2 = 3, and arr[3] = 8. Target 8 is found on the first comparison.' },
  };

  H['c310-2-binsearch-solve-k'] = {
    asks: 'Solve $n / 2^k = 1$ for $k$.',
    idea: '$k$ is the number of times you can halve $n$ before 1 is left. Asking "2 to what power gives $n$?" is exactly what $\\lg n$ means.',
    steps: [
      'Multiply both sides by $2^k$: $n = 2^k$.',
      'Read it as a question: 2 raised to what power gives $n$? That power is, by definition, $\\log_2 n$, written $\\lg n$.',
      'The same thing with algebra: take $\\lg$ of both sides. $\\lg n = \\lg 2^k = k \\lg 2 = k \\cdot 1 = k$.',
      { text: 'Check some values:', table: { head: ['$n$', 'as a power of 2', '$k = \\lg n$'], rows: [['8', '$2^3$', '3'], ['32', '$2^5$', '5'], ['1024', '$2^{10}$', '10'], ['1,000,000', '$\\approx 2^{19.93}$', '$\\approx 19.93$']] } },
    ],
    graph: {
      caption: '$\\lg n$ grows very slowly: going from $n = 32$ to $n = 1024$, 32 times more data, only raises it from 5 to 10.',
      x: [1, 1100], y: [0, 12], xLabel: 'n', yLabel: 'k = lg n',
      curves: [{ label: '$k = \\lg n$', f: n => Math.log2(n), tone: 'a' }],
      marks: [{ x: 32, label: '$k = 5$' }, { x: 1024, label: '$k = 10$' }],
    },
    answer: '$k = \\lg n$ (from $2^k = n$).',
    mistake: 'Dividing instead: $k = n / 2$. One halving gives $n/2$; the question is how many halvings, and that count is a logarithm.',
    tryIt: { q: 'Solve $n / 4^k = 1$ for $k$. What is $k$ when $n = 64$?', a: '$n = 4^k$, so $k = \\log_4 n = \\frac{\\lg n}{2}$. For $64 = 4^3$: $k = 3$.' },
  };

  // ---------------------------------------------------------------- Sorting, insertion sort

  H['c310-2-sorting-problem'] = {
    asks: 'State the sorting problem formally: what the input is and what the output must be.',
    idea: 'A permutation means "the same cards in a new order". A sorting algorithm must hand back exactly the numbers it was given, rearranged so they never go down.',
    steps: [
      'Input: a sequence of $n$ numbers $\\langle a_1, a_2, \\dots, a_n \\rangle$.',
      'Output: a permutation (reordering) $\\langle a_1^{\\prime}, a_2^{\\prime}, \\dots, a_n^{\\prime} \\rangle$ of the input with $a_1^{\\prime} \\le a_2^{\\prime} \\le \\dots \\le a_n^{\\prime}$.',
      { text: 'Slide 16’s input ⟨31, 41, 59, 26, 41, 58⟩. Which outputs are valid?', table: { head: ['candidate output', 'non-decreasing?', 'permutation?', 'valid?'], rows: [['⟨26, 31, 41, 41, 58, 59⟩', 'yes', 'yes', 'yes'], ['⟨26, 31, 41, 58, 59⟩', 'yes', 'no, a 41 is lost', 'no'], ['⟨26, 26, 26, 26, 26, 26⟩', 'yes', 'no', 'no'], ['⟨59, 58, 41, 41, 31, 26⟩', 'no', 'yes', 'no']] } },
      'It is $\\le$, not $<$: equal values, like the two 41s, may sit next to each other.',
    ],
    answer: 'Input: a sequence of $n$ numbers $\\langle a_1, \\dots, a_n \\rangle$. Output: a permutation $\\langle a_1^{\\prime}, \\dots, a_n^{\\prime} \\rangle$ of the input such that $a_1^{\\prime} \\le a_2^{\\prime} \\le \\dots \\le a_n^{\\prime}$.',
    mistake: 'Writing only "the output is in increasing order". Without "a permutation of the input", six copies of 26 would count as sorted.',
    tryIt: { q: 'Is ⟨2, 3, 3, 7⟩ a valid output for the input ⟨3, 7, 2, 3⟩? For the input ⟨3, 7, 2, 2⟩?', a: 'First: yes (the same numbers, non-decreasing). Second: no. The input has two 2s and one 3, the output has one 2 and two 3s, so it is not a permutation.' },
  };

  H['c310-2-ins-idea'] = {
    asks: 'Describe how insertion sort works and the everyday comparison the lecture makes.',
    idea: 'Sorting a hand of cards: your hand holds a sorted fan. Pick up the next card, slide it left past every bigger card, and drop it into the gap. Repeat until no cards are left on the table.',
    steps: [
      'The array splits into a sorted left part $A[1..j-1]$ (the hand) and an unsorted right part (the table).',
      'Pick up key = $A[j]$ and compare it with the cards in the hand, from right to left.',
      'Each card bigger than key moves one place right, opening a gap. At the first card $\\le$ key (or the left end), drop key into the gap.',
      { text: 'Trace ⟨8, 3, 6, 1⟩:', table: { head: ['$j$', 'key', 'hand before', 'hand after'], rows: [['2', '3', '8', '3 8'], ['3', '6', '3 8', '3 6 8'], ['4', '1', '3 6 8', '1 3 6 8']] } },
      'It suits small or nearly sorted inputs, where few cards have to move.',
    ],
    answer: 'Like sorting a hand of cards: take the next element (key), shift every larger element of the sorted part one place right, and drop the key into the gap. Repeat for each element.',
    mistake: 'Describing it as swapping key with its neighbour over and over. The pseudocode shifts the larger elements right and writes key once, at the end (line 7).',
    tryIt: { q: 'Insertion sort on ⟨7, 2, 9, 4, 1⟩: what is the sorted hand after $j = 4$?', a: '$j = 2$: 2 7. $j = 3$: 2 7 9. $j = 4$: key 4 passes 9 and 7: 2 4 7 9.' },
  };

  H['c310-2-ins-while-role'] = {
    asks: 'Say what the inner while loop (lines 4–6) of insertion sort does.',
    idea: 'The while loop is the "make room" step. It walks left through the sorted part and slides every element bigger than key one slot right, until it reaches the place where key belongs.',
    steps: [
      'Line 3 sets $i = j - 1$: start at the right end of the sorted part $A[1..j-1]$.',
      'Line 4 tests two things: $i > 0$ (still inside the array) and $A[i] >$ key (this element has to move).',
      'Line 5 copies $A[i]$ one place right, into $A[i+1]$; line 6 steps left, $i = i - 1$.',
      { text: 'Example: ⟨2, 4, 6, 3⟩, $j = 4$, key = 3:', table: { head: ['$i$', '$A[i]$', '$A[i] > 3$?', 'action', 'array'], rows: [['3', '6', 'yes', 'A[4] = 6', '2 4 6 6'], ['2', '4', 'yes', 'A[3] = 4', '2 4 4 6'], ['1', '2', 'no', 'loop stops', '2 4 4 6'], ['', '', '', 'line 7: A[2] = 3', '2 3 4 6']] } },
      'The loop stops at $i = 0$ (key is the smallest so far) or at $A[i] \\le$ key. Line 7 then writes key into the gap at $A[i+1]$.',
    ],
    answer: 'It scans the sorted prefix $A[1..j-1]$ from right to left, shifting each element greater than key one position right, until it finds where key belongs ($i = 0$ or $A[i] \\le$ key).',
    mistake: 'Thinking the loop swaps. It copies right, so for a moment the array shows a duplicate (2 4 6 6), and key is written only once, by line 7.',
    tryIt: { q: 'Sorted part ⟨1, 5, 8⟩, key = 0. How many times does the while body run, and where does key go?', a: '8, 5 and 1 are all bigger than 0: 3 shifts. The loop stops at $i = 0$, and line 7 writes key into $A[1]$: ⟨0, 1, 5, 8⟩.' },
  };

  H['c310-2-ins-trace-j5'] = {
    asks: 'Run insertion sort on ⟨5, 2, 4, 6, 1, 3⟩ and give the array right after the pass with $j = 5$ ends.',
    idea: 'After pass $j$, the first $j$ slots are sorted and everything to their right is untouched. So the answer is: first five slots sorted, the sixth still 3.',
    steps: [
      { text: 'One row per pass:', table: { head: ['$j$', 'key', 'shifts', 'array after'], rows: [['2', '2', '1', '2 5 4 6 1 3'], ['3', '4', '1', '2 4 5 6 1 3'], ['4', '6', '0', '2 4 5 6 1 3'], ['5', '1', '4', '1 2 4 5 6 3']] } },
      'Pass $j = 5$: key = $A[5]$ = 1. It is smaller than 6, 5, 4 and 2, so all four shift right; $i$ reaches 0 and line 7 writes 1 into $A[1]$.',
      '$A[6] = 3$ has not been touched, because pass 6 has not run yet.',
      'Check: the first five slots, 1 2 4 5 6, are sorted and are exactly the first five input values.',
    ],
    graph: {
      caption: 'While tests $t_j$ in each pass. Pass 5 ($t_5 = 5$) reaches the worst-case line: key 1 is smaller than everything before it.',
      x: [1, 7], y: [0, 7], xLabel: 'pass j', yLabel: 'while tests t_j',
      curves: [{ label: 'worst case: $t_j = j$', f: j => j, tone: 'c' }],
      bars: { label: '$t_j$ for ⟨5, 2, 4, 6, 1, 3⟩', tone: 'b', values: [[2, 2], [3, 2], [4, 1], [5, 5], [6, 4]] },
    },
    answer: '1 2 4 5 6 3',
    mistake: 'Giving the fully sorted 1 2 3 4 5 6. That is the array after $j = 6$; the question stops one pass earlier, with 3 still at the end.',
    tryIt: { q: 'Insertion sort on ⟨6, 3, 5, 1, 4, 2⟩: the array after $j = 4$?', a: '$j = 2$: 3 6 5 1 4 2. $j = 3$: 3 5 6 1 4 2. $j = 4$: key 1 passes 6, 5, 3: 1 3 5 6 4 2.' },
  };

  H['c310-2-ins-shifts'] = {
    asks: 'Count every execution of line 5 (one element moving one slot right) during the whole sort of ⟨5, 2, 4, 6, 1, 3⟩.',
    idea: 'Each pair of elements that starts out in the wrong order (bigger one first) costs exactly one shift: the bigger one has to step past the smaller one once. So total shifts = number of out-of-order pairs, called inversions.',
    steps: [
      { text: 'Pass by pass:', table: { head: ['$j$', 'key', 'elements it passes', 'shifts'], rows: [['2', '2', '5', '1'], ['3', '4', '5', '1'], ['4', '6', 'none', '0'], ['5', '1', '6, 5, 4, 2', '4'], ['6', '3', '6, 5, 4', '3']] } },
      'Add the last column: $1 + 1 + 0 + 4 + 3 = 9$.',
      'Check by inversions, pairs with the bigger value first: (5,2), (5,4), (5,1), (5,3), (2,1), (4,1), (4,3), (6,1), (6,3). That is 9.',
      'In $t_j$ terms, pass $j$ makes $t_j - 1$ shifts, so the total is $\\sum (t_j - 1) = 14 - 5 = 9$ (14 tests over 5 passes).',
    ],
    graph: {
      caption: 'Shifts per pass (bars) against the most a pass can make, $j - 1$ (line). Passes 5 and 6 do most of the work.',
      x: [1, 7], y: [0, 6], xLabel: 'pass j', yLabel: 'shifts',
      curves: [{ label: 'most possible: $j - 1$', f: j => j - 1, tone: 'c' }],
      bars: { label: 'shifts in pass j', tone: 'b', values: [[2, 1], [3, 1], [4, 0], [5, 4], [6, 3]] },
    },
    answer: '9: $1 + 1 + 0 + 4 + 3$, which equals the number of inversions in the input.',
    mistake: 'Counting while tests (14) instead of shifts. Each pass has one extra test, the failing one, that moves nothing.',
    tryIt: { q: 'How many shifts does insertion sort make on ⟨3, 1, 4, 2⟩?', a: 'Key 1 passes 3 (1 shift); key 4 passes nothing (0); key 2 passes 4 and 3 (2). Total 3, matching the inversions (3,1), (3,2), (4,2).' },
  };

  H['c310-2-ins-trace-practice'] = {
    asks: 'Trace insertion sort on ⟨4, 3, 1, 2⟩, writing the array after each pass $j = 2, 3, 4$.',
    idea: 'Each pass grows the sorted prefix by one slot. Pick up $A[j]$, slide it left past bigger values, and write down the array once key is in place.',
    steps: [
      { text: 'One row per pass:', table: { head: ['$j$', 'key', 'comparisons, right to left', 'shifts', 'array after'], rows: [['2', '3', '4 > 3 move; left end', '1', '3 4 1 2'], ['3', '1', '4 > 1 move, 3 > 1 move; left end', '2', '1 3 4 2'], ['4', '2', '4 > 2 move, 3 > 2 move, 1 ≤ 2 stop', '2', '1 2 3 4']] } },
      'Pass 4 stops at 1 because $1 \\le 2$. Key 2 goes into the gap just right of it, slot 2.',
      'Total shifts: $1 + 2 + 2 = 5$, the number of inversions in ⟨4, 3, 1, 2⟩: (4,3), (4,1), (4,2), (3,1), (3,2).',
    ],
    graph: {
      caption: 'While tests per pass. Passes 2 and 3 hit the worst-case line (the key slid to the front); pass 4 stopped one short, at 1.',
      x: [1, 5], y: [0, 5], xLabel: 'pass j', yLabel: 'while tests t_j',
      curves: [{ label: 'worst case: $t_j = j$', f: j => j, tone: 'c' }],
      bars: { label: '$t_j$ for ⟨4, 3, 1, 2⟩', tone: 'b', values: [[2, 2], [3, 3], [4, 3]] },
    },
    answer: '$j = 2$: 3 4 1 2. $j = 3$: 1 3 4 2. $j = 4$: 1 2 3 4.',
    mistake: 'Writing the array in the middle of a pass, while it is shifting (like 4 4 1 2). Report it after line 7 has put key in place.',
    tryIt: { q: 'Trace ⟨12, 7, 9, 3, 10⟩: the array after each of $j = 2, 3, 4, 5$.', a: '7 12 9 3 10; 7 9 12 3 10; 3 7 9 12 10; 3 7 9 10 12 (shifts 1, 1, 3, 1).' },
  };

  H['c310-2-ins-trace-clrs'] = {
    asks: 'Run insertion sort on ⟨31, 41, 59, 26, 41, 58⟩ and give the array right after the pass with $j = 4$ ends.',
    idea: 'Only pass 4 does real work here: passes 2 and 3 find their keys already in place. Then 26, smaller than everything before it, slides all the way to the front.',
    steps: [
      { text: 'One row per pass:', table: { head: ['$j$', 'key', 'shifts', 'array after'], rows: [['2', '41', '0 ($31 \\le 41$)', '31 41 59 26 41 58'], ['3', '59', '0 ($41 \\le 59$)', '31 41 59 26 41 58'], ['4', '26', '3', '26 31 41 59 41 58']] } },
      'Passes 2 and 3: the while test fails at once, so $t_2 = t_3 = 1$ and nothing moves.',
      'Pass 4: key 26 is smaller than 59, 41 and 31, so all three shift right. $i$ reaches 0, and line 7 puts 26 into $A[1]$.',
      'Slots 5 and 6 (41, 58) stay as they were until passes 5 and 6.',
    ],
    answer: '26 31 41 59 41 58',
    mistake: 'Writing the fully sorted output, or moving the second 41 early. After pass 4 only the first four slots are sorted.',
    tryIt: { q: 'Insertion sort on ⟨44, 17, 62, 9, 30⟩: the array after $j = 4$?', a: '$j = 2$: 17 44 62 9 30. $j = 3$: 62 stays. $j = 4$: key 9 passes 62, 44, 17: 9 17 44 62 30.' },
  };

  // ---------------------------------------------------------------- Loop invariants

  H['c310-2-invariant-def'] = {
    asks: 'Say what a loop invariant is and the three things you must show to use one in a correctness proof.',
    idea: 'It works like climbing a ladder. Show you can step onto the first rung (initialization), show each rung gets you to the next (maintenance), and show what you are holding when you reach the top (termination).',
    steps: [
      'A loop invariant is a statement that is true before (and after) each iteration of a loop.',
      { text: 'The three parts:', table: { head: ['part', 'what you show', 'like induction'], rows: [['Initialization', 'it is true before the first iteration', 'base case'], ['Maintenance', 'if it is true before an iteration, it is true before the next', 'inductive step'], ['Termination', 'when the loop ends, the invariant gives the result you want', 'the extra step: stop and collect']] } },
      'Small example: "s = 0; for i = 1 to n: s = s + i". Invariant: at the start of pass $i$, $s = 1 + 2 + \\dots + (i - 1)$.',
      'Initialization: $i = 1$ and $s = 0$, the empty sum. Maintenance: adding $i$ makes $s = 1 + \\dots + i$, which is the claim for $i + 1$.',
      'Termination: the loop exits at $i = n + 1$, so $s = 1 + 2 + \\dots + n$.',
    ],
    answer: 'A statement that is true before (and after) each iteration of a loop. Show: Initialization (it holds before the first iteration), Maintenance (if it holds before an iteration, it holds before the next), Termination (when the loop ends, the invariant gives the property you wanted).',
    mistake: 'Choosing a statement that is true but useless at the end, like "$s \\ge 0$". Choose the invariant so that termination gives exactly what you want to prove.',
    tryIt: { q: '"p = 1; for i = 1 to n: p = p · 2". State an invariant, and what termination gives.', a: 'At the start of pass $i$, $p = 2^{i-1}$. Initialization: $i = 1$, $p = 1 = 2^0$. The loop ends at $i = n + 1$, so $p = 2^n$.' },
  };

  H['c310-2-invariant-order'] = {
    asks: 'Put the three parts of a loop-invariant argument in the order they are proved.',
    idea: 'Follow the life of the loop: before it starts, while it runs, after it stops. That gives Initialization, then Maintenance, then Termination.',
    steps: [
      { text: 'Each part belongs to one moment of the loop:', table: { head: ['moment', 'part'], rows: [['before the first iteration', 'Initialization'], ['during each iteration', 'Maintenance'], ['after the last iteration', 'Termination']] } },
      'Maintenance only says "true before an iteration means true after it". Without initialization there is nothing to carry forward, so initialization comes first.',
      'Termination uses the fact that the invariant held at every iteration, which the first two parts proved. So it comes last.',
    ],
    answer: 'Initialization, Maintenance, Termination.',
    mistake: 'Putting termination before maintenance. Termination relies on both earlier parts.',
    tryIt: { q: 'Which part says "before iteration 1, the one-element subarray is sorted"?', a: 'Initialization: it is about the moment before the first iteration.' },
  };

  H['c310-2-ins-invariant'] = {
    asks: 'State the loop invariant used to prove insertion sort correct.',
    idea: 'At the start of each pass, the cards already in your hand, slots 1 to $j - 1$, are in sorted order, and they are exactly the cards that started in those slots.',
    steps: [
      'When: at the start of each iteration of the for loop (line 1), with index $j$.',
      'What: $A[1..j-1]$ holds the elements originally in $A[1..j-1]$, in sorted order.',
      { text: 'Check on ⟨5, 2, 4, 6, 1, 3⟩:', table: { head: ['start of pass $j$', '$A[1..j-1]$', 'sorted?', 'the original first $j - 1$ values?'], rows: [['2', '5', 'yes', 'yes'], ['3', '2 5', 'yes', 'yes'], ['4', '2 4 5', 'yes', 'yes'], ['5', '2 4 5 6', 'yes', 'yes'], ['6', '1 2 4 5 6', 'yes', 'yes'], ['7 (exit)', '1 2 3 4 5 6', 'yes', 'yes']] } },
      'Slide 23 says it in words: "all elements before the key are maintained in sorted order".',
    ],
    answer: 'At the start of each iteration of the for loop (index $j$), the subarray $A[1..j-1]$ holds the elements originally in $A[1..j-1]$, in sorted order: all elements before the key are sorted.',
    mistake: 'Saying "the array is sorted". During the loop only the prefix $A[1..j-1]$ is sorted; the rest is still in its original order.',
    tryIt: { q: 'For ⟨9, 4, 7, 2⟩, what is $A[1..j-1]$ at the start of pass $j = 4$?', a: 'After pass 2: 4 9 7 2. After pass 3: 4 7 9 2. So $A[1..3]$ = 4 7 9: sorted, and the original first three values.' },
  };

  H['c310-2-ins-inv-init'] = {
    asks: 'Explain why the invariant "$A[1..j-1]$ is sorted" is true before the first pass.',
    idea: 'Before the first pass the sorted hand holds one card. One card is always in order: there is nothing for it to be out of order with.',
    steps: [
      'The for loop starts at $j = 2$, so check the invariant with $j = 2$: $A[1..j-1] = A[1..1]$.',
      '$A[1..1]$ is the single element $A[1]$. A one-element sequence is sorted, because no pair in it can be out of order.',
      'It is also the element originally in $A[1]$: no line has run yet, so nothing has moved.',
      'On ⟨5, 2, 4, 6, 1, 3⟩: before pass 2, $A[1..1]$ = ⟨5⟩, which is sorted.',
    ],
    answer: 'Before the first iteration $j = 2$, so the subarray is $A[1..1]$: a single element, which is trivially sorted.',
    mistake: 'Checking $A[1..2]$, or an empty prefix with $j = 1$. Put in the loop’s first index, $j = 2$, which gives $A[1..1]$.',
    tryIt: { q: 'A loop "for j = 3 to n" uses the invariant "$A[1..j-1]$ is sorted". What must be true before it starts?', a: 'With $j = 3$: $A[1..2]$ must be sorted, that is $A[1] \\le A[2]$. This is not automatic; the code before the loop has to make it true.' },
  };

  H['c310-2-ins-inv-maint'] = {
    asks: 'Show that if $A[1..j-1]$ is sorted at the start of pass $j$, then the invariant holds again at the start of the next pass.',
    idea: 'Assume the hand is sorted. The pass slides every card bigger than key one place right and drops key into the gap, between "no bigger than key" and "bigger than key". Putting one card into the right spot of a sorted hand keeps it sorted.',
    steps: [
      'Assume $A[1..j-1]$ is sorted, and let key = $A[j]$.',
      'The while loop moves $A[j-1], A[j-2], \\dots$ one slot right for as long as they are $>$ key. Moving them all one slot keeps their order.',
      'It stops at an $i$ with $A[i] \\le$ key (or $i = 0$), and line 7 puts key at $A[i+1]$. Everything left of key is $\\le$ key, and everything right of it (the shifted ones) is $>$ key.',
      { text: 'Example, pass $j = 5$ with $A[1..4]$ = 2 4 7 9 and key 5:', table: { head: ['step', 'array'], rows: [['start', '2 4 7 9 | 5'], ['9 > 5, shift', '2 4 7 9 9'], ['7 > 5, shift', '2 4 7 7 9'], ['4 ≤ 5, stop; line 7 writes A[3] = 5', '2 4 5 7 9']] } },
      'So $A[1..j]$ is sorted and holds the original first $j$ elements. The for loop then increases $j$ by 1, so "$A[1..j-1]$ is sorted" is true for the new $j$.',
    ],
    answer: 'The while loop moves $A[j-1], A[j-2], \\dots$ one place right until it finds the position for key, and key is inserted there, so $A[1..j]$ is sorted. Incrementing $j$ for the next iteration then makes the invariant true again.',
    mistake: 'Stopping at "the while loop shifts elements". Say why the result is sorted (left of key $\\le$ key $<$ right of key) and that increasing $j$ restores the invariant.',
    tryIt: { q: 'At the start of pass $j = 6$, $A[1..5]$ = ⟨1, 3, 3, 8, 9⟩ and key = 3. Where does key go, and is $A[1..6]$ sorted?', a: '9 and 8 are bigger than 3, so they shift. The loop stops at $A[3] = 3$, because $3 > 3$ is false, and key goes into $A[4]$: ⟨1, 3, 3, 3, 8, 9⟩, sorted.' },
  };

  H['c310-2-ins-inv-term'] = {
    asks: 'Say when insertion sort’s for loop stops, and what the invariant tells you at that moment.',
    idea: 'The invariant is a promise about $A[1..j-1]$. Find the value of $j$ at which the loop quits and read the promise there: the prefix has grown into the whole array.',
    steps: [
      '$j$ starts at 2 and increases by 1 each pass. The loop runs while $j \\le n$, so it stops the first time $j = n + 1$.',
      'Put $j = n + 1$ into the invariant: $A[1..(n+1)-1] = A[1..n]$, the whole array.',
      'So $A[1..n]$ holds the original $n$ elements in sorted order. The output is a sorted permutation of the input: insertion sort is correct.',
      { text: 'For $n = 6$:', table: { head: ['passes run', 'exit value', 'invariant says'], rows: [['$j = 2, 3, 4, 5, 6$', '$j = 7$', '$A[1..6]$ is sorted']] } },
    ],
    answer: 'Each iteration increases $j$ by 1, so the loop ends when $j = n + 1$. With $j = n + 1$ the invariant says $A[1..n]$, the whole array, is sorted, so the algorithm is correct.',
    mistake: 'Saying the loop ends at $j = n$. The pass with $j = n$ still runs; the check that fails is at $j = n + 1$, and that is the value to substitute.',
    tryIt: { q: 'Loop "for i = 1 to n" with invariant "at the start of pass $i$, total = A[1] + … + A[i − 1]". What does termination give?', a: 'The loop exits at $i = n + 1$, so total = A[1] + … + A[n], the sum of the whole array.' },
  };

  // ---------------------------------------------------------------- Insertion sort, average case

  H['c310-2-ins-avg'] = {
    asks: 'Explain why insertion sort’s running time on a randomly generated array is still quadratic.',
    idea: 'On a random array, the key is bigger than about half of the cards already in the hand and smaller than the other half. So it slides past about half of them: half the worst-case work, and half of a quadratic is still quadratic.',
    steps: [
      'In pass $j$ the hand $A[1..j-1]$ holds $j - 1$ cards. For a random key, each of them is bigger than key with probability about $\\frac{1}{2}$.',
      'So key passes about $\\frac{j-1}{2}$ cards, and the while test runs once more than that: $t_j \\approx \\frac{j}{2}$, the slide’s value.',
      'Add over the passes: $\\sum_{j=2}^{n} \\frac{j}{2} = \\frac{1}{2}\\left(\\frac{n(n+1)}{2} - 1\\right) = \\frac{n^2 + n - 2}{4}$.',
      'The $\\frac{n^2}{4}$ term dominates: about a quarter of $n^2$, against about half of $n^2$ in the worst case. Same shape: $\\Theta(n^2)$.',
      { text: 'Check on all 24 orderings of 4 numbers (total shifts):', table: { head: ['shifts', '0', '1', '2', '3', '4', '5', '6'], rows: [['orderings', '1', '3', '5', '6', '5', '3', '1']] } },
      'Average: $\\frac{0 + 3 + 10 + 18 + 20 + 15 + 6}{24} = \\frac{72}{24} = 3 = \\frac{4 \\cdot 3}{4}$, half of the worst case, 6.',
    ],
    graph: {
      caption: 'Bars: the exact average $t_j$ on random input, $\\frac{j+1}{2}$, which is about $\\frac{j}{2}$. Every bar is about half of the worst-case line $t_j = j$.',
      x: [1, 11], y: [0, 11], xLabel: 'pass j', yLabel: 'while tests t_j',
      curves: [{ label: 'worst: $t_j = j$', f: j => j, tone: 'c' }, { label: '$j/2$', f: j => j / 2, tone: 'a' }],
      bars: { label: 'average $t_j$', tone: 'b', values: [[2, 1.5], [3, 2], [4, 2.5], [5, 3], [6, 3.5], [7, 4], [8, 4.5], [9, 5], [10, 5.5]] },
    },
    answer: 'On average half of the elements in $A[1..j-1]$ are smaller than $A[j]$ and half are larger, so $t_j \\approx j/2$. Summing gives about $n^2/4$, a quadratic: $\\Theta(n^2)$.',
    mistake: 'Concluding that half the work means a better growth rate. Constant factors disappear inside $\\Theta$: $n^2/4$ and $n^2/2$ are both $\\Theta(n^2)$.',
    tryIt: { q: 'Estimate the average number of shifts insertion sort makes on a random array of 20 distinct numbers.', a: 'About $\\sum_{j=2}^{20} \\frac{j-1}{2} = \\frac{1}{2} \\cdot \\frac{20 \\cdot 19}{2} = 95$, half of the worst case, 190.' },
  };

  H['c310-2-avg-not-midpoint'] = {
    asks: 'Insertion sort’s best case is $\\Theta(n)$ and its worst case is $\\Theta(n^2)$. Pick its average case on random input.',
    idea: 'The average is not found by splitting the difference between two growth rates. You compute what a typical input costs, and for insertion sort a typical key still slides past half the hand, which is about $\\frac{n^2}{4}$ shifts.',
    steps: [
      'Compute it rather than guess: on random input $t_j \\approx \\frac{j}{2}$ (slide 28).',
      'Total shifts are then about $\\frac{n(n-1)}{4}$, a quadratic: $\\Theta(n^2)$.',
      { text: 'Best, average and worst shift counts side by side:', table: { head: ['$n$', 'best: 0 shifts ($n - 1$ tests)', 'average: $\\frac{n(n-1)}{4}$', 'worst: $\\frac{n(n-1)}{2}$'], rows: [['10', '9 tests', '22.5', '45'], ['100', '99 tests', '2,475', '4,950'], ['1,000', '999 tests', '249,750', '499,500']] } },
      'The average stays a fixed fraction (half) of the worst case, and far above the best. It has the worst case’s growth rate.',
      'Even the wrong midpoint, $\\frac{n + n^2}{2}$, is $\\Theta(n^2)$. Averaging $n$ and $n^2$ never gives something like $n \\lg n$ "in between".',
    ],
    graph: {
      caption: 'The average curve is the worst-case parabola at half height, both far above the best-case line. Same shape as the worst case: $\\Theta(n^2)$.',
      x: [1, 100], y: [0, 5000], xLabel: 'n', yLabel: 'operations',
      curves: [{ label: 'best: $n - 1$ tests', f: n => n - 1, tone: 'a' }, { label: 'average: $n(n-1)/4$ shifts', f: n => n * (n - 1) / 4, tone: 'b' }, { label: 'worst: $n(n-1)/2$ shifts', f: n => n * (n - 1) / 2, tone: 'c' }],
    },
    answer: '$\\Theta(n^2)$: $t_j \\approx j/2$, so the expected work is about $n^2/4$, still quadratic.',
    mistake: 'Picking $\\Theta(n \\lg n)$ or $\\Theta(n^{1.5})$ because they lie "between" $n$ and $n^2$. Growth rates are not averaged; the expected count is computed, and here it is quadratic.',
    tryIt: { q: 'An algorithm costs $n$ steps on 99% of inputs and $n^2$ steps on the other 1%. What is its average case?', a: '$0.99n + 0.01n^2$, which is $\\Theta(n^2)$: even a rare expensive input dominates once $n$ is large.' },
  };
})(globalThis.FC = globalThis.FC || {});
