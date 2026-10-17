// "Help" walkthroughs for CSC 325 (Software Testing) cards, lectures 13 (Code Coverage) and
// 14 (AI Agent Harness). Format: see the header of decks/csc370-help.js (math OFF: plain
// text, `backticks` for code words).
(function (FC) {
  'use strict';
  const H = FC.help = FC.help || {};

  const ARE_POS = 'def arePositive(x, y):   # N0\n    if x > 0:            # N1\n        print("x>0")     # N2\n    if y > 0:            # N3\n        print("y>0")     # N4\n    # exit               # N5';
  const FOO = 'def foo(x):            # N0\n    x = x + 1          # N1\n    while x < 5:       # N2\n        x = x + 1      # N3\n        print(x)       # N4\n    # exit             # N5';
  const BAR = 'def bar(n):            # N0\n    while n > 0:       # N1\n        n = n - 2      # N2\n    return n           # N3\n# CFG edges: N0->N1, N1->N2, N2->N1, N1->N3';
  const CLIP = 'def clip(x):           # N0\n    if x > 10:         # N1\n        x = 10         # N2\n    return x           # N3\n# CFG edges: N0->N1, N1->N2, N2->N3, N1->N3';

  // Shared ideas for card groups (the -qN siblings show the same idea and steps).
  const IDEA_GRAPH = 'Turn the code into a control-flow graph (CFG): one node per statement or decision, one edge per possible jump. Each coverage criterion is just a list of graph pieces (test requirements) your tests must walk through: nodes, edges, edge pairs, prime paths, or whole paths. The bigger the pieces, the stronger the criterion and the more tests it needs.';
  const STEPS_AREPOS = [
    { text: 'The CFG of `arePositive`: two ifs in a row, neither has an else.', code: ARE_POS + '\n# edges: N0->N1, N1->N2, N1->N3, N2->N3, N3->N4, N3->N5, N4->N5' },
    'Node coverage: visit all 6 nodes. One test with both conditions true, `arePositive(1, 1)`, takes [N0, N1, N2, N3, N4, N5] and visits every node.',
    'Edge coverage: walk all 7 edges. That same path never takes a false edge (N1→N3, N3→N5), because an if with no else has an edge that skips the body. Add `arePositive(-1, -1)` = [N0, N1, N3, N5].',
    { text: 'Complete path coverage: every entry-to-exit path. Two independent ifs give 2 × 2 = 4.', table: { head: ['criterion', 'requirements', 'min tests'], rows: [['node', '6 nodes', '1'], ['edge', '7 edges', '2'], ['complete path', '4 paths', '4']] } },
  ];
  const STEPS_PRIME = [
    { text: 'The loop in `foo` makes the CFG cyclic: N2 → N3 → N4 → N2.', code: FOO + '\n# edges: N0->N1, N1->N2, N2->N3, N3->N4, N4->N2, N2->N5' },
    'Complete paths are infinite (one per number of iterations), so we need finite requirements. A simple path never repeats a node, except that it may end where it started (a loop).',
    'A prime path is a simple path that is not a sub-path of any longer simple path: a maximal one. A test path tours a prime path if the prime path appears inside it.',
    { text: 'foo has 6 prime paths, in three groups:', table: { head: ['group', 'prime path'], rows: [['no loop / enter loop', '[N0, N1, N2, N5]'], ['', '[N0, N1, N2, N3, N4]'], ['loop execution', '[N2, N3, N4, N2]'], ['', '[N3, N4, N2, N3]'], ['', '[N4, N2, N3, N4]'], ['loop exit', '[N3, N4, N2, N5]']] } },
    'Two calls tour them all: `foo(10)` skips the loop ([N0, N1, N2, N5]); `foo(2)` runs it twice (path [N0, N1, N2, N3, N4, N2, N3, N4, N2, N5]) and tours the other five. That is the "0, 1, many iterations" loop rule, made systematic.',
  ];
  const STEPS_SUBSUME = [
    'C1 subsumes C2 when every test set that satisfies C1 automatically satisfies C2. Walking every edge forces you through every node, so edge subsumes node.',
    { text: 'The chain, strongest first:', table: { head: ['criterion', 'requirement', 'subsumes'], rows: [['complete path', 'every entry-to-exit path', 'all below'], ['prime path', 'every maximal simple path', 'edge-pair, edge, node'], ['edge-pair', 'every path of 2 edges', 'edge, node'], ['edge', 'every edge', 'node'], ['node', 'every node', '-']] } },
    'Stronger is not always usable: complete path is infeasible as soon as there is a loop, and some single requirements are infeasible (a path needing both `x > 0` and `x < 0`). So 100% is not always reachable.',
  ];

  // ---------------- Lecture 13: Code Coverage ----------------

  H['st13-myth2-lesson'] = {
    asks: 'The Myth II uninstaller deleted its install folder, so an install at C:\\ wiped the drive. Why would statement or branch coverage not have caught this?',
    idea: 'Coverage asks "did this code run?", not "did we try the dangerous input?". Every line of the uninstaller runs on a normal install. The bug only shows for one special kind of input (install directory = a drive root), and no coverage criterion asks for that input.',
    steps: [
      'The uninstaller simply deleted the directory the game was installed in. Fine for C:\\Games\\Myth2, a disaster for C:\\, which is the whole drive.',
      'A single normal test (install to a game folder, uninstall) already executes every statement and branch of that code. Statement and branch coverage are at 100%, and still green.',
      'What finds it is input partitioning (black-box): split install locations into classes such as "normal folder", "folder with other files in it", and "drive root". Each class gets a test.',
      'The cost of skipping that: a marketing person found it, and Bungie recalled about 200,000 copies (around $800,000).',
    ],
    answer: 'A normal install already runs every statement and branch, so coverage is complete. Only treating "installed at a drive root" as its own input class reveals the bug: that is input partitioning, not coverage.',
    mistake: 'Thinking a stronger coverage criterion (paths, prime paths) would have caught it. The structure is the same for every install location; the danger is in the input value, so you need black-box input classes.',
    tryIt: { q: 'A cleanup script runs `rm -rf "$DIR"/*`, with DIR read from a config file. Your one test (DIR=/home/u/cache) runs every line. Which input class should you add?', a: 'DIR empty or unset, which turns the command into `rm -rf /*`. Coverage is already 100%; only an input class for "empty value" exposes it.' },
  };

  H['st13-whitebox'] = {
    asks: 'Define white-box testing.',
    idea: 'Black-box testing picks tests from the specification without looking inside. White-box testing opens the box: the code itself tells you which tests to write, so that its structure (statements, branches, paths, loops) gets exercised.',
    steps: [
      { text: 'The three classic white-box criteria, from weakest to strongest:', table: { head: ['criterion', 'requires'], rows: [['statement', 'every statement executed at least once'], ['branch', 'every outcome (true and false) of every condition taken at least once'], ['path', 'every execution path tested at least once']] } },
      'Loops get their own rule: test the loop not entered, executed once, executed more than once, and left through every exit.',
      'Example: for `if x > y: ... else: ...`, branch coverage needs one test where `x > y` is true and one where it is false.',
    ],
    answer: 'Testing that uses the code directly to guide the design of test cases.',
    mistake: 'Confusing it with "testing by developers" or "unit testing". White-box is about how you choose tests (from the code\'s structure), not who writes them or how big they are.',
    tryIt: { q: 'You read a function, see `if total > 100:`, and choose one input that makes it true and one that makes it false. Which kind of testing is this, and which criterion are you aiming for?', a: 'White-box testing, aiming for branch coverage (both outcomes of the condition).' },
  };

  H['st13-branch-mc'] = {
    asks: 'Which criterion requires every condition to come out both true and false at least once?',
    idea: 'Statement coverage counts lines, branch coverage counts decision outcomes, path coverage counts whole routes. An if with no else shows the difference: running its body covers every statement, but the "false" outcome was never taken.',
    steps: [
      { text: 'Compare the three criteria:', table: { head: ['criterion', 'unit counted'], rows: [['statement', 'each statement'], ['branch', 'each true/false outcome of each condition'], ['path', 'each full execution path']] } },
      'The question names "every outcome (true and false) of every condition". That is the definition of branch coverage.',
      'Statement is too weak (no false outcomes needed). Path is too strong (it needs every combination of outcomes along a route, not just each outcome once).',
    ],
    answer: 'Branch coverage: every outcome (true and false) of every condition is taken at least once.',
    mistake: 'Picking path coverage because it also involves true and false. Path coverage needs every combination along whole paths, which is far more than each outcome once.',
    tryIt: { q: 'Code: `def f(x):` / `    if x > 0:` / `        print("pos")`. The only test is f(5). Which of statement or branch coverage does it fail?', a: 'Branch coverage: every statement ran, but the false outcome of `x > 0` was never taken. Add f(-1).' },
  };

  H['st13-loops'] = {
    asks: 'Name the four situations white-box testing should check for a loop.',
    idea: 'Loop bugs hide at the edges: the body never runs (empty input), runs exactly once, runs again with leftover state, or leaves through an unusual exit (a `break` or `return`). Test each edge.',
    steps: [
      'Not entered: the condition is false on the first check (empty list, n = 0).',
      'Executed once: catches off-by-one errors and bad initialisation.',
      'Executed more than once: catches state carried from one iteration to the next.',
      'Left through all its exits: the normal exit (condition false) and every `break`/`return` inside the body.',
      'Prime path coverage later turns this "0, 1, many" rule into a precise criterion.',
    ],
    answer: 'The loop is not entered; executed once; executed more than once; and left through all its exits.',
    mistake: 'Forgetting the "not entered" case (an empty input) or the extra exits. A loop with a `break` has two exits, and each needs its own test.',
    tryIt: { q: 'Which inputs test this loop fully?', code: 'def total(items):\n    t = 0\n    for x in items:\n        if x < 0:\n            break\n        t += x\n    return t',
      a: '[] (not entered, returns 0), [5] (once, 5), [5, 6] (more than once, 11), and [5, -1, 6] (leaves through the break, 5).' },
  };

  H['st13-is-bigger-paths'] = {
    asks: 'Give the smallest set of tests that walks every complete path of `is_bigger`, with the node path each test takes.',
    idea: 'Number the lines, draw the graph, then list every route from entry to exit. One if/else splits the graph into exactly two routes, so two tests, one per route.',
    steps: [
      'Nodes: 0 (entry), 1 (`if x > y`), 2 (`res = True`), 4 (`res = False`), 5 (`return res`). Line 3 (`else:`) is not a node of its own.',
      'Routes: 0 → 1 → 2 → 5 (condition true) and 0 → 1 → 4 → 5 (condition false). There are no other paths.',
      { text: 'Pick one input per route:', table: { head: ['test (x, y)', 'x > y?', 'path'], rows: [['(4, 2)', 'true', '[0, 1, 2, 5]'], ['(2, 4)', 'false', '[0, 1, 4, 5]']] } },
    ],
    answer: 'Two tests: (x=4, y=2) takes [0, 1, 2, 5]; (x=2, y=4) takes [0, 1, 4, 5].',
    mistake: 'Writing line 3 (`else:`) into the path. It is just syntax; control goes straight from the decision (1) to `res = False` (4).',
    tryIt: { q: 'Same numbering. Give minimal complete-path tests.', code: '0 def sign(x):\n1     if x < 0:\n2         s = -1\n3     else:\n4         s = 1\n5     return s',
      a: 'sign(-3) takes [0, 1, 2, 5]; sign(3) takes [0, 1, 4, 5]. Two tests.' },
  };

  const IDEA_ISBIGGER = 'Paths are about structure; bugs often live in values. Both routes through the if/else can be walked while the one dangerous value, the boundary where x equals y, is never tried. Coverage chooses which way to go, not which numbers to go with.';
  const STEPS_ISBIGGER = [
    'The spec (docstring): return True if x > y, False if x <= y. The code says `if x >= y`.',
    { text: 'The two all-paths tests both pass:', table: { head: ['test', 'path', 'returns', 'spec says'], rows: [['(4, 2)', '[0, 1, 2, 5]', 'True', 'True'], ['(2, 4)', '[0, 1, 4, 5]', 'False', 'False']] } },
    'Try the boundary (4, 4): `4 >= 4` is true, so it returns True, but the spec says False when x <= y. That test fails and reveals the bug.',
    'All-paths coverage never asked for x == y: (4, 4) takes the same path [0, 1, 2, 5] as (4, 2). Boundary value analysis (black-box) is what supplies that test.',
  ];

  H['st13-is-bigger-bug'] = {
    asks: 'This `is_bigger` passes two tests that cover all paths. Find the bug and a test that catches it.',
    idea: IDEA_ISBIGGER,
    steps: STEPS_ISBIGGER,
    answer: 'The condition is `x >= y` instead of `x > y`, so equal inputs return True. The test (4, 4) detects it, but all-paths coverage does not require it.',
    mistake: 'Believing 100% path coverage means the function is correct. It only means every route was walked, not that the boundary value of each condition was tried.',
    tryIt: { q: 'Spec: adult means age >= 18. Tests is_adult(30) → True and is_adult(5) → False cover both paths and pass. Bug and revealing test?', code: 'def is_adult(age):\n    if age > 18:\n        return True\n    else:\n        return False',
      a: 'It uses > instead of >=. is_adult(18) returns False but should be True; the boundary test 18 reveals it.' },
  };

  H['st13-is-bigger-44'] = {
    asks: 'Trace the buggy `is_bigger` (it uses `>=`) on x = 4, y = 4. What does it return?',
    idea: IDEA_ISBIGGER,
    steps: STEPS_ISBIGGER,
    answer: 'True, because 4 >= 4 holds. The spec wants False when x <= y, so this test exposes the bug.',
    mistake: 'Reading the code as the spec says it should be (`>`) and answering False. Trace exactly what is written.',
    tryIt: { q: 'With the buggy is_adult (it uses `age > 18`), what does is_adult(18) return?', a: 'False, since 18 > 18 is false. The spec says 18 is an adult, so the test fails and reveals the bug.' },
  };

  const IDEA_LEVEL = 'Coverage level is a score: list the things your tests should touch (the test requirements, TR), then count how many your test set T actually touched. Repeating something already touched adds nothing to the score.';
  const STEPS_LEVEL = [
    'Coverage level = (number of requirements in TR satisfied by T) / |TR|.',
    'Ice cream stand, TR = {flavor=chocolate, flavor=vanilla, flavor=mint}.',
    { text: 'Score the two suites:', table: { head: ['suite', 'cones', 'flavours hit', 'level'], rows: [['1', '3 chocolate, 1 vanilla', 'chocolate, vanilla', '2/3 = 66.7%'], ['2', '1 of each', 'all three', '3/3 = 100%']] } },
    'Suite 1 has more tests (4 cones) but a lower level: the extra chocolate cones repeat a requirement already met. More tests is not better tests.',
    'In code, TR is the set of nodes, edges or paths from the criterion you chose.',
  ];

  H['st13-coverage-level'] = {
    asks: 'Give the definition of coverage level for test requirements TR and a test set T.',
    idea: IDEA_LEVEL,
    steps: STEPS_LEVEL,
    answer: 'The number of test requirements in TR satisfied by T, divided by the size of TR.',
    mistake: 'Dividing by the number of tests (or lines of code) instead of by |TR|. The denominator is always the requirement count.',
    tryIt: { q: 'Edge coverage of a function with 5 edges; your tests walk 3 distinct edges, one of them twice. Coverage level?', a: '3/5 = 60%. The repeated edge counts once.' },
  };

  H['st13-icecream'] = {
    asks: 'TR is the three flavours. Suite 1 is 3 chocolate cones and 1 vanilla. What is its coverage level as a percentage?',
    idea: IDEA_LEVEL,
    steps: STEPS_LEVEL,
    answer: '66.7%: 2 of the 3 flavour requirements are met (chocolate and vanilla), and 2/3 = 66.7%.',
    mistake: 'Answering 4/3 or 75% by counting cones. Three chocolate cones satisfy the single requirement flavor=chocolate once.',
    tryIt: { q: 'TR = 4 toppings {sprinkles, nuts, syrup, cherry}. Suite: sprinkles, sprinkles, nuts, cherry, nuts. Coverage level?', a: '3 toppings hit (sprinkles, nuts, cherry) out of 4: 3/4 = 75%.' },
  };

  H['st13-icecream-lesson'] = {
    asks: 'Of the two ice cream test suites, which is better and why?',
    idea: IDEA_LEVEL,
    steps: STEPS_LEVEL,
    answer: 'Suite 2: it reaches 100% coverage versus suite 1\'s 66.7%, with fewer tests. More tests is not better tests.',
    mistake: 'Picking suite 1 because it has more tests. Judge a suite by which requirements it hits, not by its size.',
    tryIt: { q: 'Login form, TR = {valid login, wrong password, unknown user}. Suite A: 10 valid logins. Suite B: one test of each case. Which is better?', a: 'Suite B: 3/3 = 100% versus A\'s 1/3 = 33.3%, with 7 fewer tests.' },
  };

  H['st13-node-vs-edge'] = {
    asks: 'Which is the stronger criterion, node coverage or edge coverage?',
    idea: IDEA_GRAPH,
    steps: STEPS_AREPOS,
    answer: 'Edge coverage. Covering every edge visits every node, but covering every node can skip edges (the false edge of an if with no else).',
    mistake: 'Thinking they are equal because in an if/else they need the same tests. The difference shows when an if has no else: its skip edge has no node of its own.',
    tryIt: { q: 'Which is stronger, edge coverage or edge-pair coverage?', a: 'Edge-pair. Every edge sits inside some 2-edge path (if it has a neighbour), so covering all pairs covers all edges; the reverse is not true.' },
  };

  H['st13-node-not-edge'] = {
    asks: 'The single path [N0, N1, N2, N3, N4, N5] visits every node of `arePositive`. Which edges does it miss?',
    idea: IDEA_GRAPH,
    steps: STEPS_AREPOS,
    answer: 'N1→N3 and N3→N5: the false outcomes of the two ifs. Neither if has an else, so these skip edges have no node of their own.',
    mistake: 'Listing nodes instead of edges, or saying it misses nothing because every node was hit.',
    tryIt: { q: 'Which edge does clip(20) miss? Which test adds it?', code: CLIP, a: 'clip(20) takes [N0, N1, N2, N3], missing N1→N3 (the false outcome). clip(5) takes [N0, N1, N3] and covers it.' },
  };

  H['st13-node-min'] = {
    asks: 'What is the fewest tests that visit every node of `arePositive`?',
    idea: IDEA_GRAPH,
    steps: STEPS_AREPOS,
    answer: '1: arePositive(1, 1) takes [N0, N1, N2, N3, N4, N5], every node.',
    mistake: 'Answering 2 because there are two ifs. Nodes only need to be visited; the true outcome of both ifs visits all of them in one run.',
    tryIt: { q: 'Minimum tests for 100% node coverage of clip?', code: CLIP, a: '1: clip(20) takes [N0, N1, N2, N3], every node.' },
  };

  H['st13-edge-min'] = {
    asks: 'What is the fewest tests that walk every edge of `arePositive`?',
    idea: IDEA_GRAPH,
    steps: STEPS_AREPOS,
    answer: '2: arePositive(1, 1) and arePositive(-1, -1) cover all 7 edges. One path cannot take both outcomes of an if.',
    mistake: 'Answering 4 (one per complete path). Edge coverage does not need every combination of outcomes, just every outcome once; all-true plus all-false does it.',
    tryIt: { q: 'A function has THREE ifs in a row, none with an else. Minimum tests for edge coverage?', a: '2: one with all three conditions true, one with all three false. Every true edge and every skip edge is walked.' },
  };

  H['st13-complete-paths-count'] = {
    asks: 'Count every path from N0 to N5 in `arePositive`.',
    idea: IDEA_GRAPH,
    steps: STEPS_AREPOS.slice(0, 3).concat([
      { text: 'Each if is independently taken or skipped, so 2 × 2 = 4 complete paths:', table: { head: ['x > 0', 'y > 0', 'path'], rows: [['T', 'T', '[N0, N1, N2, N3, N4, N5]'], ['F', 'F', '[N0, N1, N3, N5]'], ['T', 'F', '[N0, N1, N2, N3, N5]'], ['F', 'T', '[N0, N1, N3, N4, N5]']] } },
    ]),
    answer: '4: two independent ifs, each taken or skipped, give 2 × 2 paths.',
    mistake: 'Adding instead of multiplying (2 + 2). Paths combine every choice with every other choice.',
    tryIt: { q: 'How many complete paths does a function with THREE ifs in a row (no else, no loop) have?', a: '2 × 2 × 2 = 8.' },
  };

  H['st13-edge-level'] = {
    asks: 'The suite is only arePositive(1, 1). What fraction of the 7 edges does it cover?',
    idea: IDEA_GRAPH,
    steps: STEPS_AREPOS.slice(0, 1).concat([
      { text: 'arePositive(1, 1) takes [N0, N1, N2, N3, N4, N5]. Check each edge:', table: { head: ['edge', 'covered?'], rows: [['N0→N1', 'yes'], ['N1→N2', 'yes'], ['N1→N3', 'no'], ['N2→N3', 'yes'], ['N3→N4', 'yes'], ['N3→N5', 'no'], ['N4→N5', 'yes']] } },
      'Coverage level = covered requirements / all requirements = 5/7 (about 71.4%).',
    ]),
    answer: '5/7: it walks every edge except the two false edges N1→N3 and N3→N5.',
    mistake: 'Answering 6/6 or 100% by counting nodes. The requirements here are edges, and there are 7.',
    tryIt: { q: 'Edge coverage level of the suite {clip(20)}?', code: CLIP, a: 'Path [N0, N1, N2, N3] walks N0→N1, N1→N2, N2→N3 but not N1→N3: 3/4 = 75%.' },
  };

  H['st13-node-level'] = {
    asks: 'The suite is only arePositive(-1, -1). What fraction of the 6 nodes does it visit?',
    idea: IDEA_GRAPH,
    steps: STEPS_AREPOS.slice(0, 1).concat([
      'With x = -1 and y = -1, both conditions are false, so both prints are skipped: the path is [N0, N1, N3, N5].',
      { text: 'Count the nodes:', table: { head: ['node', 'visited?'], rows: [['N0', 'yes'], ['N1', 'yes'], ['N2', 'no'], ['N3', 'yes'], ['N4', 'no'], ['N5', 'yes']] } },
      'Coverage level = 4/6 (= 2/3, about 66.7%).',
    ]),
    answer: '4/6: the path [N0, N1, N3, N5] skips the two print nodes N2 and N4.',
    mistake: 'Counting edges instead of nodes, or counting a node twice.',
    tryIt: { q: 'Node coverage level of the suite {clip(5)}?', code: CLIP, a: 'clip(5) takes [N0, N1, N3], skipping N2: 3/4 = 75%.' },
  };

  H['st13-edge-pairs'] = {
    asks: 'Count the edge-pair requirements of `arePositive`: every path made of exactly 2 edges.',
    idea: IDEA_GRAPH,
    steps: [
      { text: 'The CFG:', code: ARE_POS + '\n# edges: N0->N1, N1->N2, N1->N3, N2->N3, N3->N4, N3->N5, N4->N5' },
      'An edge pair is two edges joined at a middle node: [a, b, c] with a→b and b→c. For each middle node b, multiply (edges in) × (edges out).',
      { text: 'Count by middle node:', table: { head: ['middle', 'in × out', 'pairs'], rows: [['N1', '1 × 2', '[0,1,2], [0,1,3]'], ['N2', '1 × 1', '[1,2,3]'], ['N3', '2 × 2', '[1,3,4], [1,3,5], [2,3,4], [2,3,5]'], ['N4', '1 × 1', '[3,4,5]'], ['total', '', '8']] } },
      'N0 has no incoming edge and N5 no outgoing one, so neither can be a middle.',
    ],
    answer: '8: [0,1,2], [0,1,3], [1,2,3], [1,3,4], [1,3,5], [2,3,4], [2,3,5], [3,4,5]. (Following the lecture: paths of exactly 2 edges. The textbook counts paths of length up to 2, which would add the single edges.)',
    mistake: 'Missing the pairs through N3: it has 2 edges in and 2 out, so it is the middle of 4 pairs.',
    tryIt: { q: 'How many edge-pair requirements does clip have?', code: CLIP, a: '3: [N0, N1, N2], [N0, N1, N3], [N1, N2, N3]. Only N1 (1 × 2) and N2 (1 × 1) can be a middle.' },
  };

  H['st13-loop-infinite'] = {
    asks: 'How many complete paths does `foo` have, given its while loop and no limit on x?',
    idea: IDEA_GRAPH + ' A loop is a cycle in the graph, and you can go around a cycle any number of times.',
    steps: STEPS_PRIME.slice(0, 1).concat([
      { text: 'Each extra iteration gives a new, longer path:', table: { head: ['iterations', 'complete path'], rows: [['0', '[N0, N1, N2, N5]'], ['1', '[N0, N1, N2, N3, N4, N2, N5]'], ['2', '[N0, N1, N2, N3, N4, N2, N3, N4, N2, N5]'], ['...', '...']] } },
      'A smaller x gives more iterations, and x has no lower limit, so there is no last path: complete path coverage is infeasible. Prime paths replace it.',
    ]),
    answer: 'Infinitely many: one complete path for each number of iterations.',
    mistake: 'Answering 2 (loop entered or not). Each number of times around the loop is a different path.',
    tryIt: { q: 'How many complete paths does bar have, and what criterion do you use instead?', code: BAR, a: 'Infinitely many (0, 1, 2, ... iterations, since n has no upper limit). Use prime path coverage, which is finite.' },
  };

  H['st13-simple-path'] = {
    asks: 'Define a simple path in a control-flow graph.',
    idea: 'Loops make complete paths infinite, so we need path pieces that cannot grow forever. A simple path is not allowed to revisit a node, which caps its length, except that it may return to its start, so a single trip around a loop still counts.',
    steps: STEPS_PRIME.slice(0, 3).concat([
      { text: 'Simple or not, in foo:', table: { head: ['path', 'simple?', 'why'], rows: [['[N0, N1]', 'yes', 'no repeats'], ['[N2, N3, N4, N2]', 'yes', 'only first = last'], ['[N2, N3, N4, N2, N3]', 'no', 'N2 and N3 repeat in the middle']] } },
    ]),
    answer: 'A path in which no node appears more than once, except that the first and last node may be the same.',
    mistake: 'Forgetting the exception and calling [N2, N3, N4, N2] not simple. One full loop is the important case the exception is for.',
    tryIt: { q: 'In bar, is [N1, N2, N1] simple? Is [N0, N1, N2, N1, N3]?', code: BAR, a: '[N1, N2, N1] is simple (only first = last). [N0, N1, N2, N1, N3] is not: N1 repeats in the middle.' },
  };

  H['st13-simple-mc'] = {
    asks: 'Which of the listed paths in foo breaks the simple-path rule?',
    idea: H['st13-simple-path'].idea,
    steps: H['st13-simple-path'].steps,
    answer: '[N2, N3, N4, N2, N3]: N2 and N3 each appear twice and are not just the first and last nodes.',
    mistake: 'Picking [N2, N3, N4, N2]. A repeat is allowed when it is exactly the first and last node, which is one full loop.',
    tryIt: { q: 'In bar, which is NOT simple: [N0, N1, N3], [N2, N1, N2], or [N1, N2, N1, N2]?', code: BAR, a: '[N1, N2, N1, N2]: N1 repeats in the middle (and N2 repeats too).' },
  };

  H['st13-prime-def'] = {
    asks: 'Define a prime path.',
    idea: 'There are many simple paths, and most hide inside longer ones. Keep only the maximal ones, the simple paths that cannot be extended and still be simple. Those are the prime paths, and touring all of them covers every shorter simple path for free.',
    steps: STEPS_PRIME,
    answer: 'A simple path that does not appear as a sub-path of any other simple path, so it is a maximal simple path.',
    mistake: 'Calling any simple path prime. [N4, N2, N5] is simple but sits inside [N3, N4, N2, N5], so it is not prime.',
    tryIt: { q: 'In bar, is [N1, N2, N1] a prime path?', code: BAR, a: 'Yes. It is simple, and no longer simple path contains it: extending it would repeat N1 or N2 in the middle.' },
  };

  H['st13-prime-list'] = {
    asks: 'List all prime paths of `foo`, in the lecture\'s three groups.',
    idea: H['st13-prime-def'].idea,
    steps: STEPS_PRIME.concat([
      'One slide also lists [N4, N2, N5]. It is simple, but it is a sub-path of [N3, N4, N2, N5], so it is not prime. Six is correct.',
    ]),
    answer: 'No loop / entering: [N0, N1, N2, N5], [N0, N1, N2, N3, N4]. Loop execution: [N2, N3, N4, N2], [N3, N4, N2, N3], [N4, N2, N3, N4]. Loop exit: [N3, N4, N2, N5].',
    mistake: 'Including [N4, N2, N5], or forgetting the three rotations of the loop. Each node of the cycle can be the start and end of its own loop path.',
    tryIt: { q: 'List the prime paths of bar.', code: BAR, a: '5: [N0, N1, N3] (no loop), [N0, N1, N2] (enter), [N1, N2, N1] and [N2, N1, N2] (loop rotations), [N2, N1, N3] (exit).' },
  };

  H['st13-prime-count'] = {
    asks: 'How many prime paths does `foo` have?',
    idea: H['st13-prime-def'].idea,
    steps: H['st13-prime-list'].steps,
    answer: '6. The seventh path one slide shows, [N4, N2, N5], is a sub-path of [N3, N4, N2, N5], so it is not prime.',
    mistake: 'Answering 7 by copying the slide list that includes [N4, N2, N5]. Check each candidate: is it inside a longer simple path?',
    tryIt: { q: 'How many prime paths does bar have?', code: BAR, a: '5: [N0, N1, N3], [N0, N1, N2], [N1, N2, N1], [N2, N1, N2], [N2, N1, N3].' },
  };

  H['st13-not-prime-mc'] = {
    asks: 'Which of the given simple paths in foo is not prime?',
    idea: H['st13-prime-def'].idea,
    steps: H['st13-prime-list'].steps,
    answer: '[N4, N2, N5]: it appears inside the simple path [N3, N4, N2, N5], so it is not maximal.',
    mistake: 'Trusting the slide list that includes it. Test the definition: can you extend it at either end and stay simple? Adding N3 in front works, so it is not prime.',
    tryIt: { q: 'In bar, which simple path is NOT prime: [N1, N3], [N2, N1, N3], or [N0, N1, N3]?', code: BAR, a: '[N1, N3]: it sits inside both [N0, N1, N3] and [N2, N1, N3].' },
  };

  H['st13-prime-tests'] = {
    asks: 'What is the fewest calls to `foo` that tour all of its prime paths?',
    idea: H['st13-prime-def'].idea,
    steps: STEPS_PRIME,
    answer: '2: foo(10) skips the loop and tours [N0, N1, N2, N5]; foo(2) loops twice and tours the other five. No single call can both skip and enter the loop.',
    mistake: 'Answering 6, one test per prime path. A long test path tours many prime paths at once.',
    tryIt: { q: 'Minimum tests for prime path coverage of bar? Give inputs.', code: BAR, a: '2: bar(0) tours [N0, N1, N3]; bar(4) loops twice ([N0, N1, N2, N1, N2, N1, N3]) and tours the other four.' },
  };

  H['st13-prime-which-inputs'] = {
    asks: 'Of the two tests x = 10 and x = 2, which prime path does x = 10 tour?',
    idea: H['st13-prime-def'].idea,
    steps: STEPS_PRIME,
    answer: '[N0, N1, N2, N5]: x becomes 11, `11 < 5` is false, and the loop is not entered.',
    mistake: 'Thinking a large x loops many times. Trace it: the condition is x < 5, so a big x skips the loop.',
    tryIt: { q: 'Which prime path of bar does bar(0) tour?', code: BAR, a: '[N0, N1, N3]: 0 > 0 is false, so the loop is not entered.' },
  };

  H['st13-foo3'] = {
    asks: 'Would foo(3) alone tour all six prime paths? If not, which does it miss?',
    idea: H['st13-prime-def'].idea,
    steps: STEPS_PRIME.concat([
      { text: 'Trace foo(3): x = 4; 4 < 5, so x = 5 and print; 5 < 5 is false, so exit. Path [N0, N1, N2, N3, N4, N2, N5].', table: { head: ['prime path', 'toured by foo(3)?'], rows: [['[N0, N1, N2, N5]', 'no (loop entered)'], ['[N0, N1, N2, N3, N4]', 'yes'], ['[N2, N3, N4, N2]', 'yes'], ['[N3, N4, N2, N3]', 'no (needs 2 iterations)'], ['[N4, N2, N3, N4]', 'no (needs 2 iterations)'], ['[N3, N4, N2, N5]', 'yes']] } },
    ]),
    answer: 'No. The loop runs only once, so it misses [N3, N4, N2, N3] and [N4, N2, N3, N4] (they need 2 or more iterations) and [N0, N1, N2, N5] (loop not entered).',
    mistake: 'Saying "the loop ran, so the loop is covered". The repeated-iteration prime paths need a second trip round the loop.',
    tryIt: { q: 'Does bar(2) alone tour all of bar\'s prime paths?', code: BAR, a: 'No. bar(2) takes [N0, N1, N2, N1, N3] (one iteration). It misses [N2, N1, N2] (needs 2 iterations) and [N0, N1, N3] (loop not entered).' },
  };

  H['st13-foo2-prints'] = {
    asks: 'Trace foo(2) and count how many times `print(x)` runs.',
    idea: 'A trace is a table: one row per check of the loop condition, with the value of x at that moment. Count the rows where the body runs.',
    steps: [
      { text: 'The code:', code: FOO },
      { text: 'Trace foo(2):', table: { head: ['step', 'x', 'x < 5?', 'prints'], rows: [['x = x + 1', '3', '', ''], ['check', '3', 'yes', 'x = 4, print 4'], ['check', '4', 'yes', 'x = 5, print 5'], ['check', '5', 'no', 'exit']] } },
      'Two prints, so two iterations. That is why foo(2) tours the repeated-iteration prime paths.',
    ],
    answer: '2: it prints 4, then 5; then 5 < 5 is false and the loop ends.',
    mistake: 'Forgetting line N1 (`x = x + 1` before the loop) and starting the loop with x = 2, which would give 3 prints.',
    tryIt: { q: 'How many times does foo(0) print?', a: '4: x starts at 1, then the loop prints 2, 3, 4, 5 and exits when x = 5.' },
  };

  H['st13-subsumes'] = {
    asks: 'What does "C1 subsumes C2" mean for coverage criteria?',
    idea: 'Subsumption is a guarantee, not a tendency: if a test set meets the stronger criterion, it is certain to meet the weaker one. It lets you compare criteria by reasoning about their definitions instead of running experiments.',
    steps: STEPS_SUBSUME,
    answer: 'Every test set that satisfies C1 also satisfies C2.',
    mistake: 'Reading it backwards ("C2 satisfies C1"), or thinking it means "C1 usually finds more bugs". It is a statement about satisfying requirements, for every possible test set.',
    tryIt: { q: 'Does node coverage subsume edge coverage? Give a reason.', a: 'No. The single test arePositive(1, 1) satisfies node coverage but misses edges N1→N3 and N3→N5.' },
  };

  H['st13-subsumption-order'] = {
    asks: 'Rank the five graph criteria from strongest to weakest.',
    idea: H['st13-subsumes'].idea,
    steps: STEPS_SUBSUME,
    answer: 'Complete path, prime path, edge-pair, edge, node. Each subsumes the next.',
    mistake: 'Putting edge-pair above prime path. Prime paths are the longest simple paths, so touring them walks every edge pair too.',
    tryIt: { q: 'Order from strongest to weakest: node, prime path, edge.', a: 'Prime path, edge, node.' },
  };

  H['st13-subsume-mc'] = {
    asks: 'Your suite meets prime path coverage. Which criterion might it still fail?',
    idea: H['st13-subsumes'].idea,
    steps: STEPS_SUBSUME,
    answer: 'Complete path coverage. Prime path subsumes edge-pair, edge and node, but complete path is above it in the chain (and infeasible when there is a loop).',
    mistake: 'Thinking prime path is the top of the chain. Complete path is stronger; it is just usually impossible to reach.',
    tryIt: { q: 'A suite satisfies edge coverage. Is it guaranteed to satisfy node coverage? Edge-pair coverage?', a: 'Node: yes (edge subsumes node). Edge-pair: no (edge-pair is stronger).' },
  };

  H['st13-infeasible'] = {
    asks: 'Give an example of a coverage requirement that no test can satisfy.',
    idea: 'Coverage requirements are drawn from the graph, but the graph does not know what the conditions mean. Some paths exist in the graph yet need contradictory inputs, so no test can ever walk them.',
    steps: [
      { text: 'Example:', code: 'if x > 0:\n    a()\nif x < 0:\n    b()' },
      'The graph has a path through both `a()` and `b()`. Walking it needs x > 0 and x < 0 at once, which is impossible: the requirement is infeasible.',
      'Loops make complete path coverage infeasible as a whole: there are infinitely many complete paths.',
      'So 100% is not always reachable. Exclude the infeasible requirements from TR, or report the coverage level you did reach.',
    ],
    answer: 'A path through both `if x > 0` and `if x < 0` (taking both true branches): no input satisfies both.',
    mistake: 'Giving a requirement that is merely hard to reach (a rare error path). Infeasible means impossible for every input.',
    tryIt: { q: 'Code: `if x > 10: A` then `if x < 5: B`. Name an infeasible path requirement and what you do about it.', a: 'The path through both A and B (needs x > 10 and x < 5). Remove it from TR, or report the level reached, for example 3 of 4 paths.' },
  };

  H['st13-coverage-limits'] = {
    asks: 'What does a coverage number fail to tell you, and what should you pair coverage with?',
    idea: 'For a test to find a fault it must reach the faulty line, trigger a wrong state, and make that wrong state show up where an assertion checks it. Coverage measures only the first step. A test with no assertions can score 100%.',
    steps: [
      'Coverage guarantees reachability only: the faulty line ran. It says nothing about whether the fault was triggered or observed.',
      'Chasing a number produces smoke tests: tests that call code to raise coverage but assert little. So use coverage to find untested code (gaps), not to prove code is tested.',
      { text: 'Combine techniques, each covering a weakness of the others:', table: { head: ['technique', 'role'], rows: [['coverage', 'find untested code'], ['black-box (partitions, boundaries)', 'choose the inputs'], ['mutation testing', 'check that the assertions catch faults']] } },
      '100% coverage is not the same as no bugs.',
    ],
    answer: 'Coverage only shows reachability: the faulty line ran, not that the fault was triggered or observed. Use it to find untested code, not to prove code is tested. Combine it with black-box testing to choose inputs and mutation testing to check the assertions.',
    mistake: 'Treating a high coverage percentage as a quality grade. It is a map of where tests have not been, nothing more.',
    tryIt: { q: 'A test calls `checkout(cart)` and asserts nothing; coverage of checkout is 100%. Which fault-finding step is missing, and which technique would expose the weakness?', a: 'Observation: no assertion checks the result, so a wrong total passes. Mutation testing would show many surviving mutants.' },
  };

  H['st13-stmt-vs-branch'] = {
    asks: 'With the single test discount(100, True), what statement and branch coverage does `discount` reach?',
    idea: 'An if with no else is where statement and branch coverage split apart. Running the body covers every statement, but the "false" outcome, skipping the body, is a branch with no statement of its own.',
    steps: [
      { text: 'Code:', code: 'def discount(price, member):\n    total = price\n    if member:\n        total = total * 0.9\n    return total' },
      { text: 'discount(100, True):', table: { head: ['measure', 'covered', 'level'], rows: [['statements', 'all 4 (total =, if, total *= 0.9, return)', '4/4 = 100%'], ['branch outcomes', 'member = True only', '1/2 = 50%']] } },
      'Adding discount(100, False) takes the false outcome and brings branch coverage to 100%.',
    ],
    answer: '100% statement, 50% branch: every statement runs, but only the true outcome of `if member` is taken.',
    mistake: 'Answering 100% branch because "all the code ran". Branch coverage counts outcomes, and the false one was never taken.',
    tryIt: { q: 'Single test fee(1, False). Statement and branch coverage?', code: 'def fee(amount, rush):\n    f = 5\n    if rush:\n        f = f + 10\n    return f', a: '3/4 = 75% statement (`f = f + 10` never runs) and 1/2 = 50% branch (only the false outcome).' },
  };

  H['st13-coverage-not-bugs'] = {
    asks: 'max3 passes two tests with 100% branch coverage. Find the fault and an input that exposes it.',
    idea: 'Branch coverage asks each condition to be true once and false once, but not in every combination of values. A fault that only shows for one ordering of the inputs can slip past a suite that hits every branch.',
    steps: [
      { text: 'Trace both tests:', table: { head: ['call', 'm after `b > m`', '`c > a`?', 'returns', 'branches'], rows: [['max3(1, 2, 3)', '2', 'yes, m = 3', '3', 'both true'], ['max3(3, 2, 1)', '3', 'no', '3', 'both false']] } },
      'Both ifs took both outcomes: 100% branch coverage, and both pass.',
      'The second condition compares c with `a`, the first value, instead of `m`, the largest so far. It goes wrong when c beats a but not b: a < c < b.',
      'max3(1, 5, 3): m = 1, then m = 5; `3 > 1` is true, so m = 3. Returns 3, expected 5.',
    ],
    answer: 'The second condition is `c > a`; it should be `c > m`. Any input with a < c < b reveals it, for example max3(1, 5, 3) returns 3 instead of 5.',
    mistake: 'Thinking 100% branch coverage means the logic is right. In one study, student suites averaging 95% branch coverage caught only about 14% of faults (Edwards & Shams 2014).',
    tryIt: { q: 'One test, avg([4, 6]) → 5, passes with 100% coverage. Find the fault and a revealing input.', code: 'def avg(xs):\n    return sum(xs) / 2', a: 'It divides by 2 instead of len(xs). avg([1, 2, 3]) returns 3.0; expected 2.0.' },
  };

  H['st13-tools'] = {
    asks: 'Name the usual coverage tool for Java, JavaScript, C and Python.',
    idea: 'Nobody counts coverage by hand: a tool records which lines and branches ran during the test suite and reports the percentages. Each language has its standard one.',
    steps: [
      { text: 'One per language:', table: { head: ['language', 'tool'], rows: [['Java', 'JaCoCo'], ['JavaScript', 'Istanbul'], ['C', 'gcov'], ['Python', 'coverage.py']] } },
      'They measure statement and branch coverage automatically; use their reports to find untested code.',
    ],
    answer: 'Java: JaCoCo. JavaScript: Istanbul. C: gcov. Python: coverage.py.',
    mistake: 'Mixing up JaCoCo (Java) and Istanbul (JavaScript). Memory hook: JaCoCo starts with "Ja" for Java.',
    tryIt: { q: 'Your project has a Python backend and a JavaScript frontend. Which two coverage tools do you use?', a: 'coverage.py for the backend, Istanbul for the frontend.' },
  };

  // ---------------- Lecture 14: AI Agent Harness ----------------

  const IDEA_LAYERS = 'A capable model is not an engineering process. Split the system into three layers with separate jobs: the model generates and reasons, the agent takes actions with the model, and the harness controls the work (context, tools, permissions, workflow, verification). Trust comes from that separation, not from the model being smart.';
  const STEPS_LAYERS = [
    { text: 'The three layers:', table: { head: ['layer', 'job'], rows: [['model', 'generates and reasons'], ['agent', 'takes actions with the model (edits files, runs commands)'], ['harness', 'controls context, tools, permissions, workflow and verification']] } },
    'The shift: from autocomplete (suggest code, answer questions) to an agent that uses tools and operates inside a controlled process.',
    'Without the harness, a raw agent edits the wrong file, invents an API, skips tests, and declares success too early.',
  ];

  H['st14-three-layers'] = {
    asks: 'In the model / agent / harness picture, what is the agent layer\'s job, compared with the model\'s?',
    idea: IDEA_LAYERS,
    steps: STEPS_LAYERS,
    answer: 'The agent takes actions with the model; the model only generates and reasons.',
    mistake: 'Treating "model" and "agent" as the same thing. The model produces text; the agent is what turns that into actions such as editing files or running tests.',
    tryIt: { q: 'Which layer does each: (a) writes a candidate patch, (b) runs the test command, (c) blocks `git push` until a human approves?', a: '(a) model (generates), (b) agent (acts), (c) harness (controls permissions).' },
  };

  H['st14-layers-mc'] = {
    asks: 'Which layer controls context, tools, permissions, workflow and verification?',
    idea: IDEA_LAYERS,
    steps: STEPS_LAYERS,
    answer: 'The harness: it is the system around the model that controls the work.',
    mistake: 'Choosing the agent because it is the one using the tools. The agent uses them; the harness decides which tools it may use and how the work is checked.',
    tryIt: { q: 'A rule says the agent may run tests but must ask before installing a package. Which layer enforces it?', a: 'The harness (permissions).' },
  };

  H['st14-context'] = {
    asks: 'What should an engineered context give the agent, instead of the bare prompt "Fix login"?',
    idea: 'An agent can only aim at requirements it was given. "Fix login" forces it to guess what is broken, where to look, and when it is done. Context engineering means giving the right information at the right moment.',
    steps: [
      { text: 'Too little context versus engineered context:', table: { head: ['"Fix login" leaves the agent guessing', 'Engineered context supplies'], rows: [['what is failing', 'the failure'], ['where to look', 'the relevant files'], ['what it may not break', 'the constraints'], ['what correct looks like', 'the expected behaviour'], ['when to stop', 'the evidence of done']] } },
      'Evidence of done is what testers care about most: a check (for example a test that now passes) that makes "finished" verifiable instead of claimed.',
    ],
    answer: 'The failure, the relevant files, the constraints and expected behaviour, and the evidence of done. With "Fix login" alone the agent must guess the failure, the scope and the definition of done.',
    mistake: 'Answering "a longer, more detailed prompt". The point is specific information: what fails, where, under what limits, and how done will be proven.',
    tryIt: { q: 'Rewrite "Make search faster" as engineered context.', a: 'Failure: search takes about 4 s on 10,000 items. Files: search.py and its tests. Constraints: keep the public API, no new dependencies. Expected: same results, faster. Evidence of done: a benchmark test under the target time and the full suite passing.' },
  };

  H['st14-repo-rules'] = {
    asks: 'Name the four repository rules that keep an AI agent\'s expectations persistent.',
    idea: 'A prompt is forgotten at the next prompt; a rule stored in the repository travels with the work. Put the standing expectations where every session will read them.',
    steps: [
      { text: 'The four rules:', table: { head: ['#', 'rule', 'protects against'], rows: [['1', 'read the README and tests first', 'missing context'], ['2', 'preserve architecture and public APIs', 'breaking other code'], ['3', 'no migration changes or new dependencies without approval', 'risky, hard-to-undo changes'], ['4', 'run tests, linting and type checks; review the final diff', 'declaring success too early']] } },
    ],
    answer: '1. Read the README and tests first. 2. Preserve architecture and public APIs. 3. Do not change migrations or add dependencies without approval. 4. Run tests, linting and type checks, and review the final diff.',
    mistake: 'Listing general advice ("write clean code"). These four are specific, checkable rules stored in the repo.',
    tryIt: { q: 'An agent fixing a date bug decides to add a new date library. Which rule applies, and what should happen?', a: 'Rule 3: no new dependencies without approval. It must ask a human first (or fix the bug without the library).' },
  };

  H['st14-loop-order'] = {
    asks: 'Put the agent execution loop steps in order.',
    idea: 'Reliable action is iterative: each step produces evidence that the next step uses. The agent does not act once and stop; it checks its work and goes round again until the check passes.',
    steps: [
      { text: 'The loop:', table: { head: ['step', 'what happens'], rows: [['Understand', 'read the task and context'], ['Plan', 'decide what to change'], ['Act', 'edit, run commands'], ['Observe', 'look at the results (output, test runs)'], ['Verify', 'compare with the evidence of done'], ['Retry or finish', 'go round again, or stop']] } },
      'Memory hook: think before you act (Understand, Plan), act, then check (Observe, Verify), then decide.',
    ],
    answer: 'Understand, Plan, Act, Observe, Verify, Retry or finish.',
    mistake: 'Putting Verify before Observe. You must see what happened before you can judge whether it is right.',
    tryIt: { q: 'The agent just ran the tests and sees 2 failures. Which step is it in, and what comes next?', a: 'Observe. Next is Verify (the evidence of done is not met), then Retry.' },
  };

  H['st14-tests-feedback'] = {
    asks: 'In an AI agent harness, what role do tests play?',
    idea: 'For a human, a failing test often feels like a grade. For an agent loop it is a signal: it tells the agent what to fix next. Automatic checks are what let the loop decide between retry and finish.',
    steps: [
      { text: 'The checks in the feedback cycle:', table: { head: ['kind', 'examples'], rows: [['tests', 'unit, integration'], ['static checks', 'lint, type checks'], ['build and security', 'build, security checks']] } },
      'A failure is fed back into the next iteration (read the error, fix, rerun) rather than ending the run.',
    ],
    answer: 'They turn generated code into feedback, not a verdict: failures become signals for the next iteration.',
    mistake: 'Saying tests "prove the agent\'s code is correct". Tests give feedback and evidence, not proof.',
    tryIt: { q: 'The agent\'s change fails a type check with "str has no attribute append". Verdict or feedback, and what happens next?', a: 'Feedback: the agent reads the error, fixes the type mistake, and reruns the checks.' },
  };

  const IDEA_RISK = 'Grant only what the task needs, and add control as the risk of an action rises. Low-risk actions run automatically, changes are reviewable, and actions that are hard to undo (push, deploy, credentials) need a human\'s approval. Useful systems are rarely all-manual or all-autonomous.';
  const STEPS_RISK = [
    { text: 'Least privilege: three risk tiers.', table: { head: ['tier', 'example actions'], rows: [['lower risk', 'reading files, running tests'], ['stronger controls', 'installing packages'], ['highest risk', 'pushing code, deploying, touching credentials']] } },
    { text: 'Autonomy spectrum: the same idea as zones.', table: { head: ['zone', 'actions', 'handling'], rows: [['Observe', 'search files, read docs, run tests', 'automatic'], ['Change', 'edit source, update tests, retry failures', 'reviewable'], ['Commit', 'push code, deploy, touch credentials', 'human approval']] } },
    'Automate the low-risk path; gate the high-risk one.',
  ];

  H['st14-privilege-mc'] = {
    asks: 'Under least privilege, which risk tier is "installing a package"?',
    idea: IDEA_RISK,
    steps: STEPS_RISK,
    answer: 'Stronger controls: riskier than reading files or running tests, but below pushing, deploying or touching credentials.',
    mistake: 'Calling it lower risk because it is common. A package adds code you did not write to the project, so it needs more control.',
    tryIt: { q: 'Which tier: (a) reading a config file, (b) rotating an API key?', a: '(a) lower risk; (b) highest risk (touching credentials).' },
  };

  H['st14-autonomy'] = {
    asks: 'On the autonomy spectrum, which zone needs human approval? Give an example.',
    idea: IDEA_RISK,
    steps: STEPS_RISK,
    answer: 'The Commit zone: pushing code, deploying, touching credentials.',
    mistake: 'Putting "edit source code" in the approval zone. Edits are reviewable (they can be seen and undone before they ship); approval is for actions that leave the machine.',
    tryIt: { q: 'Which zone: (a) deploy to staging, (b) update a failing test?', a: '(a) Commit, needs approval (deploying). (b) Change, reviewable.' },
  };

  H['st14-autonomy-mc'] = {
    asks: 'How should "edit source code and retry failing tests" be handled on the autonomy spectrum?',
    idea: IDEA_RISK,
    steps: STEPS_RISK,
    answer: 'Reviewable: these are Change actions. Observe actions are automatic; Commit actions need approval.',
    mistake: 'Choosing "require explicit approval". Asking a human before every edit makes the agent useless; review of the diff controls the risk instead.',
    tryIt: { q: 'How is "search files and read the docs" handled?', a: 'Automatically: it is an Observe action.' },
  };

  const IDEA_FAILURE = 'An unharnessed agent fails in recognisable ways, and each harness piece is aimed at one of them. A harness controls the process, not just the answer, and a passing test suite is evidence, not proof.';
  const STEPS_FAILURE = [
    { text: 'Failure modes and what the harness adds:', table: { head: ['what can go wrong', 'harness answer'], rows: [['invented API or library', 'tests that expose failures'], ['wrong objective, perfectly executed', 'repository context and rules (a clear "done")'], ['important context never loaded (edits the wrong file)', 'repository context and rules'], ['tool misuse or shortcuts (skips tests, early success)', 'bounded tools and permissions, retry rules and human gates']] } },
    'Weak tests can still certify the wrong thing, so passing tests are evidence, not proof.',
  ];

  H['st14-failure-modes'] = {
    asks: 'Name four ways an unharnessed AI coding agent goes wrong.',
    idea: IDEA_FAILURE,
    steps: STEPS_FAILURE,
    answer: 'It invents an API or library; pursues the wrong objective, perfectly executed; never loads important context (and edits the wrong file); misuses tools or takes shortcuts (skips tests, declares success too early).',
    mistake: 'Only listing "writes buggy code". "Wrong objective, perfectly executed" is the dangerous one: the code works, it just solves the wrong problem.',
    tryIt: { q: 'To make a failing test pass, the agent deletes the test\'s assertion and reports success. Which failure mode is this?', a: 'Tool misuse / shortcut behaviour (declaring success too early).' },
  };

  H['st14-harness-adds'] = {
    asks: 'Name the four things a harness adds against an agent\'s failure modes.',
    idea: IDEA_FAILURE,
    steps: STEPS_FAILURE,
    answer: 'Repository context and rules; bounded tools and permissions; tests that expose failures; retry rules and human gates.',
    mistake: 'Answering "a better model". The harness is everything around the model; none of the four depends on the model being smarter.',
    tryIt: { q: 'The agent calls a function that does not exist in the library. Which harness piece catches it?', a: 'Tests (and type checks) that expose failures: the call fails when run, and the failure is fed back to the agent.' },
  };

  H['st14-evidence-mc'] = {
    asks: 'What is a passing test suite for agent-written code, according to the lecture?',
    idea: IDEA_FAILURE,
    steps: STEPS_FAILURE,
    answer: 'Evidence, not proof. Weak tests can still certify the wrong thing; like coverage, passing tests only show what they check.',
    mistake: 'Accepting "proof if coverage is 100%". Coverage only shows the code ran, not that the assertions would catch a fault.',
    tryIt: { q: 'A payment module\'s suite has one happy-path test, and it passes. Is the module shown correct?', a: 'No. It is evidence only about that one path; refunds, failures and edge cases were never checked.' },
  };

  H['st14-not-magic'] = {
    asks: '"Harness is not magic": what can no harness guarantee, what does it do instead, and who still exercises judgment?',
    idea: 'Reliability comes from the engineering around the model, and that engineering ends with a person. Each part has one job: the model generates possibilities, the agent acts, the harness shapes the environment, and a human reviewer judges.',
    steps: [
      { text: 'Four roles:', table: { head: ['part', 'job'], rows: [['model', 'generates possibilities'], ['agent', 'takes actions'], ['harness', 'shapes the environment'], ['reviewer', 'exercises judgment']] } },
      'No harness guarantees correctness. What it does is make requirements, evidence and risk visible enough to manage.',
      'Guardrails reduce risk; they do not guarantee correctness. Good AI engineering looks like good software engineering.',
    ],
    answer: 'No harness guarantees correctness. It makes requirements, evidence and risk visible enough to manage, and a human reviewer still exercises judgment.',
    mistake: 'Saying the harness "makes the code correct" or replaces review. It reduces risk and exposes evidence; the decision stays human.',
    tryIt: { q: 'A manager says: "We have a harness with tests and permissions, so we can skip code review." Reply in one sentence.', a: 'No: the harness reduces risk and shows the evidence, but it cannot guarantee correctness, so a reviewer must still judge the diff.' },
  };

  const IDEA_BOOKING = 'The booking race shows that passing tests only speak about what they exercise. Sequential tests never send two requests at once, so they never reach the bug. The harnessed workflow starts by reproducing the bug as a failing test, which turns "fixed" into something checkable.';
  const STEPS_BOOKING = [
    'Setup: one seat, two students booking at the same time.',
    { text: 'Two workflows:', table: { head: ['', 'raw agent', 'harnessed agent'], rows: [['task', '"Fix the booking bug."', 'capacity + retry contract define done'], ['tests', 'four ordinary tests pass', 'reproduce the race first; add a concurrency + retry test'], ['process', 'changes stay implicit', 'preserve the API contract; run checks, retry on failure'], ['result', 'both get HTTP 201; counter below zero', 'exactly one booking succeeds; retries are safe']] } },
    'Why the ordinary tests passed: each sent one request at a time. A test only finds a fault if it reaches the faulty code, triggers a bad state, and lets you observe it. Only a concurrency test does all three here.',
  ];

  H['st14-booking-raw'] = {
    asks: 'After the raw agent\'s fix, four ordinary tests passed. What went wrong in the booking demo?',
    idea: IDEA_BOOKING,
    steps: STEPS_BOOKING,
    answer: 'Both students got HTTP 201 (both booked the one seat), and the capacity counter went below zero.',
    mistake: 'Assuming the fix failed the tests. The tests passed; they just never sent concurrent requests.',
    tryIt: { q: 'Two people withdraw the last $50 from a shared account at the same moment. Sequential tests pass. What could go wrong?', a: 'Both withdrawals succeed and the balance goes to -$50: the same race as the double booking.' },
  };

  H['st14-booking-harnessed'] = {
    asks: 'In the booking demo, what was the harnessed agent\'s first step?',
    idea: IDEA_BOOKING,
    steps: STEPS_BOOKING,
    answer: 'It reproduced the race first, as a failing test.',
    mistake: 'Saying it "fixed the code first". Reproducing first gives a test that fails before the fix and passes after it: proof that the fix addresses the real bug.',
    tryIt: { q: 'For the shared-account double withdrawal, what should a harnessed agent do first?', a: 'Write a test that sends two simultaneous withdrawals of the last $50 and fails because both succeed. Then fix, and rerun.' },
  };

  H['st14-booking-why'] = {
    asks: 'Why did four ordinary tests pass while two students could book the one seat? Use the conditions for a test to find a fault.',
    idea: IDEA_BOOKING,
    steps: STEPS_BOOKING,
    answer: 'The ordinary tests sent one request at a time, so they never reached the faulty interleaving (two simultaneous bookings). A concurrency test is needed to reach the race, trigger the bad state (double 201, counter below zero), and observe it.',
    mistake: 'Blaming weak assertions. The assertions might be fine; the problem is that the faulty interleaving was never reached at all.',
    tryIt: { q: 'An upload bug only appears for files over 2 GB; every test uses a 1 KB file and passes. Which condition fails?', a: 'Reachability: no test reaches the faulty large-file code path, so it can never trigger or be observed. Add a test with a file over 2 GB.' },
  };

  H['st14-pr-pipeline'] = {
    asks: 'Order the five steps of the workflow that produces a reviewed pull request.',
    idea: 'The output of AI-assisted development is not "some code"; it is a reviewed pull request. Each step hands the next one something checkable, and a human makes the final call.',
    steps: [
      { text: 'The pipeline:', table: { head: ['#', 'who', 'does'], rows: [['1', 'developer', 'specifies behaviour + constraints'], ['2', 'harness', 'supplies context + allowed tools'], ['3', 'agent', 'edits, checks, and responds to failures'], ['4', 'CI', 'repeats the checks and preserves evidence'], ['5', 'reviewer', 'examines the diff and decides']] } },
      'The question is no longer whether AI can generate code, but how to make generated code trustworthy.',
    ],
    answer: 'Developer specifies behaviour + constraints; harness supplies context + allowed tools; agent edits, checks and responds to failures; CI repeats checks and preserves evidence; reviewer examines the diff and decides.',
    mistake: 'Putting CI before the agent, or ending with CI. CI re-runs the agent\'s checks independently, and a human reviewer always decides last.',
    tryIt: { q: 'In this workflow, who decides whether the change is merged, and what does CI add that the agent\'s own checks do not?', a: 'The reviewer decides. CI repeats the checks independently and keeps the evidence for the reviewer.' },
  };
})(globalThis.FC = globalThis.FC || {});
