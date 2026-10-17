// "Help" walkthroughs for CSC 325 (softtest) cards, batch d: lectures 9 (test adequacy),
// 10 (reachability, observability, partition testing) and 12 (combinatorial testing).
// Format: see decks/csc370-help.js. Math is OFF: plain text, `backticks` for code words.
(function (FC) {
  'use strict';
  const H = FC.help = FC.help || {};

  // ---------- shared material ----------
  const PATHS = { head: ['path', 'which inputs', 'count of 10,000'], rows: [
    ['S0 then S2', 'y = 10x and x in 4..9', '6'],
    ['S0 then S3', 'y = 10x and x in 0..3', '4'],
    ['S1 then S2', 'y ≠ 10x, x > 3 and y > 10', '8,538'],
    ['S1 then S3', 'y ≠ 10x, not (x > 3 and y > 10)', '1,452']] };
  const RIVER_IDEA = 'Think of the program as a river: every input is a drop of water, and each `if` splits the flow. Some channels get almost all the water, others only a trickle. Random tests are like random drops, so they almost never visit the trickle channels. That is reachability.';
  const OBS_IDEA = 'Running a statement is not the same as seeing its effect. A value can be computed and then overwritten before anyone looks at it. A fault in such a statement is reached often but observed rarely: easy to reach, hard to observe.';
  const OBS_STEPS = [
    { text: 'Count how the 10,000 inputs split over the two `if`s:', table: PATHS },
    '`z = 10` sits on the else side of the first `if`, so it runs for every input with y ≠ 10x: 10,000 − 10 = 9,990 inputs, that is 99.9%.',
    'But on the S2 side of the second `if`, `z = 8` overwrites z. That happens for 8,538 of those 9,990 inputs.',
    'Only the 1,452 inputs on the S1-then-S3 path return the value 10: 1,452 / 10,000 = 14.52%, about 14%. A fault in `z = 10` shows in the output only that often.',
  ];
  const ADEQ_TERMS = { head: ['term', 'meaning'], rows: [
    ['test case', 'inputs + execution conditions + pass/fail criterion'],
    ['test case specification', 'a requirement satisfied by one or more test cases'],
    ['test obligation', 'a PARTIAL test case specification (one property important to thorough testing)'],
    ['test suite', 'a collection of test cases'],
    ['test / test execution', 'executing test cases and evaluating their results'],
    ['adequacy criterion', 'a true/false predicate on a <program, test suite> pair']] };
  const SOURCES = { head: ['source', 'derived from', 'example'], rows: [
    ['functional', 'the specification', 'spec demands recovery from power failure, so simulate a power failure'],
    ['fault-based', 'hypothesized faults (common bugs)', 'very large input to check buffer overflow handling'],
    ['model-based', 'a model of the system', 'exercise every transition of a protocol state machine'],
    ['structural', 'the code (white/glass box)', 'traverse each loop one or more times']] };
  const SOURCES_STEPS = [
    'A test obligation is one small thing the suite must do, like “execute statement 7”. Ask where the requirement came from.',
    { text: 'There are four places obligations come from:', table: SOURCES },
    'Each source gives a different family of adequacy criteria. Read the scenario and ask: did this test come from the spec, a guess about a common bug, a model, or the code itself?',
  ];
  const PROPS = { head: ['property', 'meaning'], rows: [
    ['applicability', 'easy to measure automatically'],
    ['monotonicity', 'adding valid test cases never decreases adequacy'],
    ['sensitivity', 'high adequacy strongly correlates with high fault detection']] };
  const PW_IDEA = 'Most failures are caused by one value or by two settings interacting. Pairwise testing makes sure every value of every attribute meets every value of every other attribute at least once, without paying for every full combination. Each test row covers several pairs at once, which is why far fewer rows are needed.';
  const FONT_IDEA = 'Seven checkboxes give 2 × 2 × ... = 2^7 = 128 combinations, and many are nonsense (text cannot be superscript and subscript at once). Category-partition first picks representative values, then combines them, and uses constraints to throw out impossible combinations and cut down the rest.';
  const FONT_STEPS = [
    'Each of the 7 Effects checkboxes is on or off, so the raw count is 2^7 = 128. With font styles and underline styles it reaches 8,192 for one font, and over 10^6 with advanced features.',
    'Huge value ranges are reduced to representatives: over 4 billion colours become black, white, coloured; font sizes [1..512] become small, medium, large.',
    'A test case specification picks one representative value for each category. For each naive combination ask: is it meaningful and feasible? If not, add a constraint.',
    { text: 'The constraints used for the Effects box:', table: { head: ['constraint', 'why'], rows: [
      ['at most one of {Strikethrough, Double strikethrough}', 'the two strike styles exclude each other'],
      ['at most one of {Superscript, Subscript}', 'text cannot be raised and lowered at once'],
      ['at most one of {Small caps, All caps}', 'two competing capital styles'],
      ['“Hidden” is single', 'tested once, not combined with everything'],
      ['“Double strikethrough” is single', 'tested once, not combined with everything']] } },
  ];
  const PART_IDEA = 'Failures are sparse over all inputs but dense in certain regions. If you split the inputs into classes that the program should treat the same way, and test some inputs from every class, you are bound to land in the dense regions that random testing would miss.';
  const POSTAL_STEPS = [
    'Start from the spec: 6 characters in the pattern letter-digit-letter digit-letter-digit, like T4V2R3. The output is a list of EI Economic Regions.',
    { text: 'Invalid classes come from each rule the input can break:', table: { head: ['invalid class', 'example'], rows: [
      ['more than 6 characters', 'T4V2R3X'], ['fewer than 6 characters', 'T4V2R'],
      ['invalid 1st character (number or unused letter)', '4TV2R3'], ['invalid 2nd character (not a digit)', 'TXV2R3'],
      ['invalid 3rd character (not a letter)', 'T492R3']] } },
    'Valid classes from the input: one class per valid first letter (A, B, C, E, G, H, J, K, ... T, V, X, Y), because the first letter picks the province or region, so each letter exercises a different lookup.',
    'Valid classes from the output: a code that belongs to exactly one EI economic region, and a code that maps to many regions. These catch faults in building the result list.',
  ];
  const REVERSE_STEPS = [
    'Question the spec first: are strings null-terminated, length-specified, or both? Is the reverse destructive (in place) or does it return a new string? Open questions in a spec are findings in themselves.',
    { text: 'Length classes:', table: { head: ['class', 'why'], rows: [
      ['empty string', 'boundary: nothing to swap'], ['one character', 'boundary: result equals input'],
      ['even length', 'no middle character'], ['odd length', 'the middle character must stay put'], ['very long string', 'size limits, performance']] } },
    { text: 'Special classes:', table: { head: ['class', 'why'], rows: [
      ['palindrome', 'output equals input, so a do-nothing bug hides here'], ['repeated characters', 'swap logic that tracks values, not positions, breaks'],
      ['spaces, special or multi-byte characters', 'byte-by-byte reversal scrambles multi-byte characters'], ['null input', 'the spec is silent about it']] } },
  ];
  const COMB_STEPS = [
    'Usually a feature has more than one input, so a test must combine values. Combinatorial testing: for each feature identify the distinct attributes that can be varied, then systematically generate combinations of their values.',
    { text: 'The attributes come in three kinds:', table: { head: ['kind', 'example'], rows: [
      ['input parameters', 'the string passed to `reverse`'], ['environment conditions', 'OS version, time zone, browser'],
      ['configurations', 'a setting of the app itself, such as dark mode on/off']] } },
    { text: 'Three techniques differ in how they pick and combine values:', table: { head: ['technique', 'how'], rows: [
      ['category-partition', 'characterize the input space with categories, then generate combinations (automatable), pruned by constraints'],
      ['pairwise', 'cover every pair of attribute values with a small number of tests'],
      ['catalog-based', 'test designers’ experience, recorded in catalogs, identifies values']] } },
  ];

  // ---------- lecture 12: pairwise counts ----------
  H['stx-pw-3bool-count'] = {
    asks: 'Three on/off settings. Find the fewest tests such that every pair of settings (A–B, A–C, B–C) shows TT, TF, FT and FF somewhere.',
    idea: PW_IDEA,
    steps: [
      'Lower bound: one pair alone, say A–B, needs four different value combinations, and one test shows only one of them. So at least 4 tests.',
      { text: 'Four are enough. Check every pair of columns:', table: { head: ['test', 'A', 'B', 'C', 'A–B', 'A–C', 'B–C'], rows: [
        ['1', 'T', 'T', 'T', 'TT', 'TT', 'TT'], ['2', 'T', 'F', 'F', 'TF', 'TF', 'FF'],
        ['3', 'F', 'T', 'F', 'FT', 'FF', 'TF'], ['4', 'F', 'F', 'T', 'FF', 'FT', 'FT']] } },
      'Each pair column holds all four of TT, TF, FT, FF. Exhaustive testing would need 2 × 2 × 2 = 8 tests, so pairwise halves it.',
    ],
    answer: '4: one pair already needs 4 tests, and TTT, TFF, FTF, FFT cover all pairs.',
    mistake: 'Answering 8. That is every full combination (exhaustive); pairwise only needs every PAIR of values.',
    tryIt: { q: 'Two settings, each with 3 values (x1, x2, x3 and y1, y2, y3). Minimum pairwise suite?', a: '9: there is only one pair of settings, and it has 3 × 3 = 9 value combinations, each needing its own test. With just two attributes pairwise equals exhaustive.' },
  };

  H['stx-pw-3bool-suite'] = {
    asks: 'Write four tests (values of A, B, C) that form a pairwise suite, and say what you must check to be sure it is one.',
    idea: PW_IDEA,
    steps: [
      'Start with the A–B columns: they must show TT, TF, FT, FF, so rows 1–4 begin TT, TF, FT, FF.',
      'Now choose C so that A–C and B–C also show all four. C = T, F, F, T works.',
      { text: 'Check all three pairs:', table: { head: ['test', 'A, B, C', 'A–B', 'A–C', 'B–C'], rows: [
        ['1', 'T, T, T', 'TT', 'TT', 'TT'], ['2', 'T, F, F', 'TF', 'TF', 'FF'],
        ['3', 'F, T, F', 'FT', 'FF', 'TF'], ['4', 'F, F, T', 'FF', 'FT', 'FT']] } },
      'The check is the whole answer: for every pair of attributes, every pair of values appears in at least one test.',
    ],
    answer: '(T,T,T), (T,F,F), (F,T,F), (F,F,T). Then check that A–B, A–C and B–C each show TT, TF, FT and FF.',
    mistake: 'Checking only A–B. A suite can cover one pair perfectly and miss FF on B–C; every pair of columns must be checked.',
    tryIt: { q: 'Is (T,T,F), (T,F,T), (F,T,T), (F,F,F) a pairwise suite for A, B, C?', a: 'Yes. A–B: TT, TF, FT, FF. A–C: TF, TT, FT, FF. B–C: TF, FT, TT, FF. All four in each pair.' },
  };

  H['stx-pw-browser-count'] = {
    asks: 'Browser has 2 values, OS 2, language 3. Exhaustive is 2 × 2 × 3 = 12. How few tests can still show every pair of values for every pair of attributes?',
    idea: PW_IDEA,
    steps: [
      'Lower bound: the biggest pair of attributes is language × browser (or language × OS): 3 × 2 = 6 value pairs, and each test shows only one of them. So at least 6.',
      { text: 'Six are enough:', table: { head: ['test', 'language', 'browser', 'OS'], rows: [
        ['1', 'EN', 'Chrome', 'Windows'], ['2', 'EN', 'Firefox', 'macOS'], ['3', 'FR', 'Chrome', 'macOS'],
        ['4', 'FR', 'Firefox', 'Windows'], ['5', 'ES', 'Chrome', 'Windows'], ['6', 'ES', 'Firefox', 'macOS']] } },
      'Check: language × browser has all 6 pairs; language × OS has all 6; browser × OS shows Chrome–Windows, Firefox–macOS, Chrome–macOS, Firefox–Windows.',
    ],
    answer: '6: language × browser alone needs 6 tests, and the 6 above cover every pair.',
    mistake: 'Adding the pair counts (6 + 6 + 4 = 16) as if each pair needed separate tests. One test row covers three pairs at once.',
    tryIt: { q: 'Payment ∈ {card, PayPal, cash}, shipping ∈ {standard, express}, gift wrap ∈ {yes, no}. Minimum pairwise suite?', a: '6: payment × shipping already needs 3 × 2 = 6 tests, and 6 rows can cover every pair.' },
  };

  H['stx-pw-4bool-count'] = {
    asks: 'Four on/off settings. What is the fewest tests where every pair of settings shows TT, TF, FT, FF?',
    idea: PW_IDEA,
    steps: [
      'Any pair needs 4 tests, so the answer is at least 4. For three settings, 4 was enough.',
      'With four settings, 4 tests are no longer enough: there is no way to arrange four rows so that all six pairs of columns get all four combinations. One more row is needed.',
      { text: 'Five tests that work:', table: { head: ['test', 'A', 'B', 'C', 'D'], rows: [
        ['1', 'T', 'T', 'T', 'T'], ['2', 'T', 'F', 'F', 'F'], ['3', 'F', 'T', 'F', 'F'], ['4', 'F', 'F', 'T', 'F'], ['5', 'F', 'F', 'F', 'T']] } },
      'Check any pair, say B–C: TT (row 1), TF (row 3), FT (row 4), FF (rows 2 and 5). Every pair works the same way. Exhaustive would be 2^4 = 16.',
    ],
    answer: '5: four tests are enough for three booleans but not for four; five rows such as TTTT, TFFF, FTFF, FFTF, FFFT cover every pair.',
    mistake: 'Assuming the minimum stays 4 for any number of booleans because each pair only needs 4. More columns put more pairs into the same few rows.',
    tryIt: { q: 'What is the minimum pairwise suite for five on/off settings (32 combinations)?', a: '6. The minimum grows very slowly: 4 for three booleans, 5 for four, 6 for five.' },
  };

  // ---------- lecture 9: Bug of the Day ----------
  H['st9-500-mile-story'] = {
    asks: 'Recall the strange symptom in the “500-mile email” story.',
    idea: 'A configuration fault can produce a symptom that looks like physics. A timeout of zero still lets a connection try for about 3 ms, and in 3 ms a signal can only travel a few hundred miles, so only nearby servers answered in time.',
    steps: [
      'Symptom (University of North Carolina, mid-1990s): “We can’t send mail more than 500 miles.”',
      'Cause: a software update set the connection timeout to zero by mistake. A zero timeout aborts a connect call in slightly over 3 ms.',
      { text: 'How far can a signal go in 3 ms?', table: { head: ['quantity', 'value'], rows: [
        ['speed of light', '186,000 miles/s = 186 miles/ms'], ['3 ms at light speed', '186 × 3 = 558 miles'], ['in copper, about 4/5 of light speed', '558 × 4/5 ≈ 446 miles']] } },
      'So servers farther than roughly 500 miles could not answer before the connection was aborted.',
    ],
    answer: 'The mail server could not send email to anywhere more than about 500 miles away.',
    mistake: 'Mixing the symptom with the cause. The symptom is the distance limit; the cause is the zero timeout.',
    tryIt: { q: 'If the timeout had aborted connections after about 6 ms instead, roughly what distance limit would users have seen?', a: 'About double: 186 × 6 × 4/5 ≈ 893 miles.' },
  };

  // ---------- lecture 9: terminology ----------
  H['st9-test-case'] = {
    asks: 'Give the formal three-part definition of a test case.',
    idea: 'A test is only a test if it can fail. So beyond the inputs, you need the conditions to run under and a rule that says pass or fail.',
    steps: [
      { text: 'Lecture 9 vocabulary:', table: ADEQ_TERMS },
      'Inputs: the data fed in. Execution conditions: the setup (state, environment, configuration) the run needs. Pass/fail criterion: how you judge the result.',
      'The simpler definition from lectures 2–3, test data + expected output, fits inside this one: an expected output is one kind of pass/fail criterion.',
    ],
    answer: 'A set of inputs, execution conditions, and a pass/fail criterion.',
    mistake: 'Leaving out the pass/fail criterion. Without it you are just running code, not testing it.',
    tryIt: { q: 'A test sets the clock to 23:59, calls `nextMinute()`, and expects 00:00. Name the three parts.', a: 'Input: the call `nextMinute()`. Execution condition: clock set to 23:59. Pass/fail criterion: result equals 00:00.' },
  };

  H['st9-spec-vs-obligation'] = {
    asks: 'Define a test case specification (and keep it apart from a test obligation).',
    idea: 'A specification is a requirement that tests must meet; an obligation is just one piece of such a requirement, the kind adequacy criteria are built from.',
    steps: [
      { text: 'Lecture 9 vocabulary:', table: ADEQ_TERMS },
      'A test case specification is a requirement that one or more test cases satisfy, for example “a test with an empty list”.',
      'A test obligation is a PARTIAL test case specification: it requires some property deemed important to thorough testing, such as “execute statement 7”.',
      'An adequacy criterion is a set of test obligations.',
    ],
    answer: 'A requirement to be satisfied by one or more test cases.',
    mistake: 'Calling it a test case. The specification is the requirement; test cases are what satisfy it.',
    tryIt: { q: '“Some test must make the loop on line 12 run zero times.” Is that a test case, or an obligation?', a: 'An obligation: a partial specification naming one property. It says nothing about inputs or pass/fail.' },
  };

  H['st9-test-execution'] = {
    asks: 'Pick the course’s meaning of “test” (test execution) out of three look-alike terms.',
    idea: 'The words sound alike but name different things: the activity, the collection, and the requirement.',
    steps: [
      { text: 'Lecture 9 vocabulary:', table: ADEQ_TERMS },
      '“A collection of test cases” is a test suite. “A requirement that test cases must satisfy” is a test case specification.',
      'A test, or test execution, is the activity: running test cases and evaluating their results.',
    ],
    answer: 'Executing test cases and evaluating their results.',
    mistake: 'Picking the collection. That is the suite, not the test.',
    tryIt: { q: 'Which term: “the 240 JUnit tests in the repo”?', a: 'A test suite (a collection of test cases). Running them and judging results is a test execution.' },
  };

  // ---------- lecture 9: adequacy criteria ----------
  H['st9-adequacy-criterion'] = {
    asks: 'Define an adequacy criterion.',
    idea: 'An adequacy criterion is a yes/no question you ask about a program and its test suite together: is this suite enough for this program?',
    steps: [
      'It is a predicate: true (satisfied) or false (not satisfied) of a <program, test suite> pair.',
      'Formally A(P, S, T): true if test suite T is sufficient for testing program P against specification S.',
      'In practice it is a set of test obligations, like “every statement executed”.',
    ],
    answer: 'A predicate that is true (satisfied) or false (not satisfied) of a <program, test suite> pair.',
    mistake: 'Defining it as a property of the suite alone. The same suite can be adequate for one program and not for another.',
    tryIt: { q: 'Statement coverage as an adequacy criterion: what makes it true for a given program and suite?', a: 'Every executable statement is executed by at least one test case, and every test passes.' },
  };

  H['st9-apst'] = {
    asks: 'In A(P, S, T), name what S stands for.',
    idea: 'Enough testing is always enough against something: the specification says what correct means.',
    steps: [
      'A(P, S, T) is true if test suite T is sufficient for testing program P against specification S.',
      'P = program, S = specification, T = test suite.',
    ],
    answer: 'Specification.',
    mistake: 'Answering “suite” or “statement”. T is the suite; S is what the program is checked against.',
    tryIt: { q: 'In A(P, S, T), which letter changes if you add a test case?', a: 'T, the test suite.' },
  };

  H['st9-dijkstra'] = {
    asks: 'Name who said “Testing shows the presence, not the absence of bugs”.',
    idea: 'A failing test proves a bug exists; a passing test proves nothing about the inputs you did not try. Since you cannot try them all, you need a rule for when to stop.',
    steps: [
      'Exhaustive testing is impossible, so passing tests never prove there are no bugs.',
      'Edsger Dijkstra put it this way, and it is the motivation for test adequacy rules.',
    ],
    answer: 'Dijkstra.',
    mistake: 'Reading the quote as “testing is useless”. It says testing cannot prove correctness, which is why we need adequacy criteria.',
    tryIt: { q: 'A suite of 10,000 passing tests: what does Dijkstra’s quote let you conclude?', a: 'Nothing about absence of bugs; only that those 10,000 inputs did not reveal one.' },
  };

  H['st9-why-adequacy-rule'] = {
    asks: 'Explain why a test adequacy rule is needed at all.',
    idea: 'You cannot test every input, and passing tests do not prove correctness, so “done” must be defined by a rule instead of by certainty.',
    steps: [
      'Exhaustive testing is impossible, and testing shows only the presence of bugs (Dijkstra).',
      'So we need a test adequacy rule: a rule to decide when we have done enough testing. Formally A(P, S, T).',
      'Defining one is very difficult; for correctness it is generally impossible. So adequacy is approximated with measurable things like coverage.',
    ],
    answer: 'Exhaustive testing is impossible, so we need a rule to decide when we have done enough testing.',
    mistake: 'Saying the rule proves the program correct. For correctness such a rule is generally impossible; it only approximates “enough”.',
    tryIt: { q: 'A function takes two 32-bit ints. Why can you not just test all inputs?', a: 'There are 2^64 input pairs, far too many to run, so you need an adequacy rule to say when to stop.' },
  };

  H['st9-adequacy-vs-stopping'] = {
    asks: 'Explain the difference between a stopping criterion and an adequacy criterion: who decides, and based on what.',
    idea: 'Two different questions: “can we afford more testing?” is a management question; “is the suite thorough enough?” is an engineering one. You can be forced to stop before the suite is adequate.',
    steps: [
      { text: 'Side by side:', table: { head: ['', 'stopping criterion', 'adequacy criterion'], rows: [
        ['kind', 'management decision', 'engineering measurement'],
        ['based on', 'resources: time, budget, deadlines, release schedule', 'code/spec structure, fault coverage, or risk']] } },
      'Example: “the release is Friday” is a stopping criterion; “every branch executed by a passing test” is an adequacy criterion.',
    ],
    answer: 'Stopping criteria are management decisions based on resources (time, budget, deadlines, release schedule). Adequacy criteria are engineering measurements based on code/spec structure, fault coverage, or risk.',
    mistake: 'Treating them as the same. Stopping says nothing about how thorough the suite is.',
    tryIt: { q: '“We stop when 90% of requirements have a passing test.” Stopping or adequacy?', a: 'Adequacy: it measures coverage of the specification, not time or money.' },
  };

  H['st9-stopping-scenario'] = {
    asks: 'Classify “we stopped because the release ships Friday and the budget is spent”.',
    idea: 'Ask what the decision is based on: resources means stopping criterion; structure, faults or risk means adequacy.',
    steps: [
      'Stopping criteria are management decisions based on resources: time, budget, deadlines, release schedule.',
      'Adequacy criteria are engineering measurements of the suite. A test obligation is one requirement inside an adequacy criterion.',
      'The team looked only at the calendar and the budget, not at the suite.',
    ],
    answer: 'A stopping criterion.',
    mistake: 'Picking adequacy because testing ended. Ending is not the same as being thorough enough.',
    tryIt: { q: 'A team stops once mutation testing kills 95% of mutants. Which kind of criterion?', a: 'Adequacy: it is an engineering measurement (killing score) of the suite.' },
  };

  H['st9-good-criterion'] = {
    asks: 'Name the three properties a good adequacy criterion needs.',
    idea: 'A useful ruler must be easy to read, must not go down when you do more work, and must actually track what you care about (finding faults).',
    steps: [
      { text: 'The three properties:', table: PROPS },
      'A criterion you cannot measure, that drops when you add tests, or that does not follow fault detection is not useful.',
      'Keep them apart from the three GOALS (effective, robust, reasonable cost).',
    ],
    answer: 'Applicability, monotonicity and sensitivity.',
    mistake: 'Listing the goals (effective, robust, reasonable cost) instead of the properties.',
    tryIt: { q: 'A criterion requires a human expert to judge each suite by hand. Which property is weak?', a: 'Applicability: it is not easy to measure automatically.' },
  };

  H['st9-monotonicity'] = {
    asks: 'Name the property “adding valid test cases never decreases adequacy”.',
    idea: 'More valid tests should never make the score worse; a measure that can drop when you do more work is misleading.',
    steps: [{ text: 'The three properties:', table: PROPS }, '“Never decreases” = monotonicity, like a function that only goes up or stays flat.'],
    answer: 'Monotonicity.',
    mistake: 'Choosing sensitivity. Sensitivity is about correlation with finding faults.',
    tryIt: { q: 'A score is “passing tests / total tests”. Can adding a valid test lower it, and which property does that break?', a: 'Yes, adding a failing test lowers it, so it is not monotonic.' },
  };

  H['st9-sensitivity-apply'] = {
    asks: 'A criterion is easy to measure and never drops, but high scores do not find more faults. Which property is missing?',
    idea: 'Cross off what the scenario says is present, and the missing one remains.',
    steps: [
      { text: 'The three properties:', table: PROPS },
      'Easy to measure automatically: applicability is present. Never drops: monotonicity is present.',
      'High scores not finding more faults means no correlation with fault detection: sensitivity is missing.',
    ],
    answer: 'Sensitivity.',
    mistake: 'Picking applicability because “easy to measure” sounds like a weakness. It is a property the criterion has.',
    tryIt: { q: 'A criterion tracks fault detection well and never drops, but needs a week of manual work to compute. Missing property?', a: 'Applicability (not easy to measure automatically).' },
  };

  H['st9-satisfy'] = {
    asks: 'State the two conditions for a test suite to satisfy an adequacy criterion.',
    idea: 'Coverage reached by a failing test does not count: the criterion is about a suite that both covers and passes.',
    steps: [
      'An adequacy criterion is a set of test obligations.',
      'A suite satisfies it if every obligation is satisfied by at least one test case in the suite, AND all the tests pass.',
      'Example, statement coverage: each executable statement is executed by at least one test case, and each test case’s outcome is “pass”.',
    ],
    answer: 'When every test obligation is satisfied by at least one test case in the suite and all the tests pass.',
    mistake: 'Forgetting “all tests pass”. Covering everything with failing tests does not satisfy the criterion.',
    tryIt: { q: 'Branch coverage: a suite takes every branch, all tests pass, but one branch is taken only by a test with no asserts. Satisfied?', a: 'Yes by the definition (every obligation met by a passing test), although the weak test shows why coverage is only a proxy.' },
  };

  H['st9-satisfy-failing'] = {
    asks: 'Every statement is executed, but one test fails. Is statement coverage satisfied?',
    idea: 'Satisfying a criterion has two parts: every obligation covered, and every test passing. Missing either one means not satisfied.',
    steps: [
      'Statement coverage is satisfied if each executable statement is executed by at least one test case AND the outcome of each test case is “pass”.',
      'The first part holds. The second fails because one test fails.',
    ],
    answer: 'No. All tests must also pass; covering every statement is necessary but not sufficient.',
    mistake: 'Answering yes because the coverage tool says 100%. The tool counts executions, not passes.',
    tryIt: { q: 'All tests pass, but statement 14 is never executed. Satisfied?', a: 'No: the obligation “execute statement 14” is not met by any test.' },
  };

  H['st9-approx-code'] = {
    asks: 'Name the three code-based ways the course approximates adequacy.',
    idea: 'True adequacy cannot be measured, so we measure how well we covered some aspect: either the code, or the inputs and specification.',
    steps: [
      { text: 'The approximations, split by what they look at:', table: { head: ['based on the code', 'based on inputs / specification'], rows: [
        ['statement/branch coverage', 'program input (input partitioning)'], ['path coverage', 'requirements'],
        ['mutation testing: killing score (strong mutants killed)', 'use cases (every documented use case covered)']] } },
      'Each measurement shows the (lack of) thoroughness of a suite, not its correctness.',
    ],
    answer: 'Statement/branch coverage, path coverage, and mutation testing measured by the killing score.',
    mistake: 'Listing requirements or use cases. Those come from the specification, not the code.',
    tryIt: { q: 'Is “every documented use case has a test” code-based or specification-based?', a: 'Specification-based (use cases).' },
  };

  H['st9-approx-spec'] = {
    asks: 'Name the three input- or specification-based ways the course approximates adequacy.',
    idea: 'Coverage does not have to be about code. You can also ask how well the inputs, the requirements and the use cases are covered.',
    steps: [
      { text: 'The approximations, split by what they look at:', table: { head: ['based on the code', 'based on inputs / specification'], rows: [
        ['statement/branch coverage', 'program input (input partitioning)'], ['path coverage', 'requirements'],
        ['mutation killing score', 'use cases (every documented use case covered)']] } },
      'These are black-box measures: you can use them without seeing the code.',
    ],
    answer: 'Program input (input partitioning), requirements, and use cases.',
    mistake: 'Listing path coverage or mutation score. Those need the code.',
    tryIt: { q: 'Is “a test for every input class of the postal-code checker” code-based or input-based?', a: 'Input-based (input partitioning).' },
  };

  H['st9-kill-score'] = {
    asks: 'Name the mutation-testing measurement used to approximate adequacy.',
    idea: 'Mutation testing plants small faults (mutants); a good suite notices them. Counting the noticed ones measures the suite.',
    steps: [
      'A mutant is the program with one small change. It is killed when some test’s result differs from the original.',
      'A strong mutant is killed only if the difference shows in the output.',
      'The killing score = the number of strong mutants killed by the suite.',
    ],
    answer: 'The killing score.',
    mistake: 'Calling it coverage. Coverage counts executed code; the killing score counts detected faults.',
    tryIt: { q: 'A suite kills 45 of 60 strong mutants. Killing score as a fraction?', a: '45 of 60, which is 75%.' },
  };

  H['st9-satisfied-or-not'] = {
    asks: 'Say what an UNSATISFIED adequacy criterion tells you.',
    idea: 'Coverage is lopsided: a gap tells you something concrete (here is what no test touched), while full marks only weakly suggest the suite is good.',
    steps: [
      'Not satisfied: an unsatisfied obligation may give useful information about how to improve the suite, for example “no test reaches line 40”.',
      'Satisfied: some evidence of thoroughness, but not proof the suite is effective; different criteria can be more or less effective.',
    ],
    answer: 'An unsatisfied obligation may give useful information about how to improve the test suite.',
    mistake: 'Saying it proves the program has a bug. It only shows where the suite is thin.',
    tryIt: { q: 'Your suite reaches 100% branch coverage. What can you claim?', a: 'Some evidence of thoroughness, not that the suite is effective at finding faults.' },
  };

  H['st9-limitations-theory'] = {
    asks: 'Name the two theoretical limitations of adequacy criteria.',
    idea: 'In theory: no single ruler fits every program, and deciding adequacy in general runs into the Halting Problem. In practice: once coverage becomes the goal, people (and AI) game it.',
    steps: [
      'Theoretical 1: no single adequacy criterion is ideal for all programs.',
      'Theoretical 2: adequacy is undecidable in the general case, because of the Halting Problem (you cannot always decide whether a statement can ever be reached).',
      'Practical: Goodhart’s law, “when a measure becomes a target, it ceases to be a good measure”, which leads to smoke tests that touch code without checking it.',
    ],
    answer: 'No single criterion is ideal for all programs, and adequacy is undecidable in general (Halting Problem).',
    mistake: 'Giving Goodhart’s law. That is the practical limitation.',
    tryIt: { q: 'Why can a tool not always tell you whether 100% statement coverage is achievable?', a: 'Whether a statement can ever execute is undecidable in general (Halting Problem).' },
  };

  H['st9-limitations-practice'] = {
    asks: 'State the practical limitation of adequacy criteria.',
    idea: 'A number that is used to judge work gets optimised directly, and stops measuring what it was meant to measure.',
    steps: [
      'Goodhart’s law: “When a measure becomes a target, it ceases to be a good measure.” True for humans, and even more for AI.',
      'Writing tests only to raise coverage gives smoke tests: they touch code without checking correctness.',
      'The theoretical limitations are different: no ideal criterion for all programs, and undecidability.',
    ],
    answer: '“When a measure becomes a target, it ceases to be a good measure” (Goodhart’s law), even truer for AI-written tests.',
    mistake: 'Answering “it is undecidable”. That is theoretical, not practical.',
    tryIt: { q: 'A manager pays a bonus per percent of coverage. What do you predict?', a: 'Coverage rises through assert-free smoke tests while fault detection does not: Goodhart’s law.' },
  };

  H['st9-smoke'] = {
    asks: 'Name tests that call every method but assert nothing.',
    idea: 'A smoke test just checks that nothing catches fire: the code runs. It never checks that the result is right.',
    steps: [
      'Writing tests solely to increase coverage leads to smoke testing: touching code without checking correctness.',
      'Mutation testing would expose these tests: with no asserts they kill almost no mutants. Regression and pairwise testing are unrelated here.',
    ],
    answer: 'Smoke testing.',
    mistake: 'Choosing mutation testing. Mutation testing is the tool that would reveal these tests are weak.',
    tryIt: { q: 'Which measure would show that assert-free tests are useless even at 100% coverage?', a: 'The mutation killing score: tests without asserts kill few mutants.' },
  };

  H['st9-obligation-sources'] = {
    asks: 'Name the four sources of test obligations and what each comes from.',
    idea: 'Every obligation is derived from something: the spec, a guess about bugs, a model, or the code.',
    steps: SOURCES_STEPS,
    answer: 'Functional (the specification), fault-based (hypothesized faults), model-based (a model of the system), structural (the code).',
    mistake: 'Mixing up model-based and structural. A model can be derived from code, but structural obligations come straight from the code (statements, loops, branches).',
    tryIt: { q: 'You test dates like February 29 because leap years often cause bugs. Which source?', a: 'Fault-based: a hypothesized common fault.' },
  };

  H['st9-obligation-fault'] = {
    asks: 'Classify “a very large input to check buffer overflow handling”.',
    idea: 'The test exists because buffer overflows are a known common bug, not because the spec or the code asked for it.',
    steps: SOURCES_STEPS,
    answer: 'Fault-based.',
    mistake: 'Calling it functional. The spec did not demand it; a hypothesized fault did.',
    tryIt: { q: 'You test with a null argument because null pointer bugs are common. Which source?', a: 'Fault-based.' },
  };

  H['st9-obligation-model'] = {
    asks: 'Classify “exercise every transition of the protocol’s state machine”.',
    idea: 'A state machine is a model of the system; covering its transitions is a model-based obligation.',
    steps: SOURCES_STEPS,
    answer: 'Model-based.',
    mistake: 'Calling it structural. The obligations come from the model, not from statements in the code.',
    tryIt: { q: 'You test every path through a UML activity diagram of checkout. Which source?', a: 'Model-based.' },
  };

  H['st9-obligation-functional'] = {
    asks: 'Classify “the spec requires power-failure recovery, so simulate a power failure”.',
    idea: 'If the spec says it, the obligation is functional.',
    steps: SOURCES_STEPS,
    answer: 'Functional.',
    mistake: 'Calling it fault-based because a power failure sounds like a fault. The requirement comes from the specification.',
    tryIt: { q: 'The spec says passwords must be at least 8 characters, so you test a 7-character password. Which source?', a: 'Functional.' },
  };

  H['st9-obligation-structural'] = {
    asks: 'Classify “add tests so each loop in the source runs one or more times”.',
    idea: 'You looked at the code to decide what to test: white/glass box, structural.',
    steps: SOURCES_STEPS,
    answer: 'Structural.',
    mistake: 'Calling it model-based. No model was involved; the loops are in the code.',
    tryIt: { q: 'You add tests until every `if` takes both its true and false branch. Which source?', a: 'Structural.' },
  };

  H['st9-unsat-example'] = {
    asks: 'Give an obligation that no suite can satisfy for a correct program.',
    idea: 'Code that only runs when something goes wrong cannot run if nothing goes wrong. In a correct program, the assertion-failure handler is dead code.',
    steps: [
      'Sometimes no test suite can satisfy a criterion for a given program.',
      'Example: an assertion never fails in a correct program, so the statements that handle its failure can never execute.',
      'Statement coverage asks for them anyway, so 100% is unreachable. That is why coverage is reported as a percentage.',
    ],
    answer: 'Executing the failure-handling code of an assertion: in a correct program the assertion never fails, so that code never runs.',
    mistake: 'Naming a hard-to-reach statement. Hard (like y == 10x) is still possible; the point is impossible.',
    tryIt: { q: '`if (x > 5 && x < 3) log();` Can any test cover `log()`?', a: 'No: no x is both above 5 and below 3, so the obligation is unsatisfiable.' },
  };

  H['st9-unsat-cope'] = {
    asks: 'Give the option for unsatisfiable obligations that is not “exclude them”.',
    idea: 'If 100% is impossible, report how close you got instead of a yes/no.',
    steps: [
      'Option 1: exclude unsatisfiable obligations, e.g., require only statements that can be executed. Problem: you cannot know for sure which ones are executable.',
      'Option 2: measure the extent to which the suite approaches the criterion.',
      'Example: 85 of 100 obligations satisfied = 85% coverage. This is how coverage tools report.',
    ],
    answer: 'Measure how close the suite gets: report the percentage of obligations satisfied (85 of 100 = 85% coverage).',
    mistake: 'Answering “delete the dead code”. That changes the program, not how you cope with the criterion.',
    tryIt: { q: '120 branches, 102 covered. What do you report?', a: '102 / 120 = 85% branch coverage.' },
  };

  H['st9-useful-harmful'] = {
    asks: 'Give two reasons coverage is useful and two reasons it is harmful.',
    idea: 'Coverage is a flashlight for finding gaps, not a grade. Used to find gaps it helps; used as a goal it seduces.',
    steps: [
      { text: 'Both sides:', table: { head: ['useful', 'harmful (“dangerous seduction”)'], rows: [
        ['shows progress toward a thorough suite', 'only a proxy for thoroughness or adequacy'],
        ['highlights trouble spots needing more attention', 'easy to raise without improving the suite']] } },
      'The only measure that really matters is (cost) effectiveness: how many faults found per effort.',
    ],
    answer: 'Useful: shows progress toward a thorough suite and highlights trouble spots. Harmful: only a proxy for thoroughness, and easy to raise without improving the suite.',
    mistake: 'Treating high coverage as proof of a good suite.',
    tryIt: { q: 'Coverage jumped from 60% to 95% overnight after adding tests with no asserts. Useful or harmful case?', a: 'Harmful: coverage rose without improving the suite.' },
  };

  H['st9-comparing'] = {
    asks: 'Describe the empirical and analytical ways to compare adequacy criteria, with each one’s limitation.',
    idea: 'You can compare criteria by watching them in practice (but results depend on the setting) or by proving one is stronger (but proof covers only part of effectiveness).',
    steps: [
      { text: 'Two approaches:', table: { head: ['approach', 'how', 'limitation'], rows: [
        ['empirical', 'study the effectiveness of testing approaches in practice', 'depends on the setting; cannot generalize from one organization or project to another'],
        ['analytical', 'prove one criterion is stronger (gives stronger guarantees), e.g., subsumption', 'only one piece of the overall effectiveness question']] } },
      'Subsumption (lecture 13) is the analytical approach: branch coverage subsumes statement coverage.',
    ],
    answer: 'Empirical: study effectiveness in practice, but results are setting-dependent and do not generalize. Analytical: prove one criterion stronger (subsumption), but that is only one piece of effectiveness.',
    mistake: 'Thinking “stronger” means “finds more bugs in every project”. It means stronger guarantees.',
    tryIt: { q: 'A study at one bank finds MC/DC catches more bugs than branch coverage. Which approach, and what is the catch?', a: 'Empirical; it may not generalize to other organizations or projects.' },
  };

  H['st9-goals'] = {
    asks: 'Name the three goals of a good adequacy criterion (not the three properties).',
    idea: 'Goals say what we want the criterion to achieve: find faults, not be fragile, not cost too much.',
    steps: [
      { text: 'Goals:', table: { head: ['goal', 'meaning'], rows: [
        ['effective at finding faults', 'better than random tests, and better than other metrics, for suites of the same size'],
        ['robust', 'not thrown off by simple changes in program/input structure'],
        ['reasonable', 'in number of tests required and in coverage analysis cost']] } },
      'Properties are different: applicability, monotonicity, sensitivity.',
    ],
    answer: 'Effective at finding faults (better than random and other metrics at the same size); robust to simple changes in program/input structure; reasonable in number of tests and analysis cost.',
    mistake: 'Giving applicability, monotonicity, sensitivity. Those are the properties.',
    tryIt: { q: 'Rewriting `if (a && b)` as two nested `if`s changes a criterion’s score a lot. Which goal fails?', a: 'Robustness to simple changes in program structure.' },
  };

  H['st9-uses'] = {
    asks: 'Name the three uses of adequacy criteria.',
    idea: 'A criterion can guide you before (selection), after (what did I miss?) or instead of you (generation).',
    steps: [
      'Test selection: guidance in devising a thorough suite, e.g., a spec-based criterion suggests representative combinations of values.',
      'Revealing missing tests: “what might I have missed with this suite?”',
      'Test generation: automatically generate tests to reach a level of coverage.',
      'Often combined: design the suite from the specification, then use a structural criterion to highlight missed logic.',
    ],
    answer: 'Test selection, revealing missing tests, and automatic test generation.',
    mistake: 'Listing “proving correctness”. No adequacy criterion does that.',
    tryIt: { q: 'A tool reads your code and writes inputs until every branch is taken. Which use?', a: 'Test generation.' },
  };

  // ---------- lecture 10: Bug of the Day, time ----------
  H['st10-australia'] = {
    asks: 'Explain why AngularJS unit tests failed only in Australia.',
    idea: 'A test that depends on the machine’s time zone tests the environment as well as the code, so its result changes from machine to machine.',
    steps: [
      'In Australia `new Date(0)` (1 January 1970) printed GMT+1000 on some JavaScript engines and GMT+1100 on others.',
      'The difference is Daylight Saving Time: parts of Australia adopted it in 1971, so engines disagree whether it applied in 1970.',
      'Angular used Date for measuring time, so the tests broke.',
      'Lesson: environment-dependent tests (here, time zone) are flaky.',
    ],
    answer: '`new Date(0)` printed GMT+1000 on some engines and GMT+1100 on others, because they disagree whether DST applied in Australia in 1970.',
    mistake: 'Blaming Angular’s logic. The code was the same; the environment changed the result.',
    tryIt: { q: 'A test passes on your laptop but fails on a server set to UTC. What is the likely kind of cause?', a: 'An environment (time-zone) dependence: the test is flaky across machines.' },
  };

  H['st10-time-hard'] = {
    asks: 'Explain why international time is so hard to implement correctly.',
    idea: 'Time rules are political, not mathematical: countries change them, so the data keeps changing and old dates follow old rules.',
    steps: [
      'Rules keep changing. The IANA tz dataset (2026d) has 2,086 time-zone exception rules and about 34,000 lines of explanation.',
      'When time breaks: hangs or infinite loops (the Zune example), incorrect communication between APIs, duplicate transactions.',
      'Even future dates break: Rhino used 1974 as an “equivalent year” without knowing 1974 had special US DST, giving wrong DST in 2041.',
    ],
    answer: 'Time-zone rules keep changing: the IANA tz dataset holds thousands of exception rules.',
    mistake: 'Saying “leap years”. Leap years follow a fixed formula; the hard part is ever-changing local rules.',
    tryIt: { q: 'A payment job runs twice when clocks go back one hour in autumn. Which listed failure is this?', a: 'Duplicate transactions.' },
  };

  // ---------- lecture 10: reachability ----------
  H['st10-river-s0'] = {
    asks: 'Count how many of the 10,000 (x, y) inputs reach S0.',
    idea: RIVER_IDEA,
    steps: [
      'S0 runs only when y == x*10. Since y is at most 99, x can only be 0..9, giving y = 0, 10, ..., 90.',
      { text: 'Every path, counted:', table: PATHS },
      'So 6 + 4 = 10 inputs reach S0: 0.1% of all inputs.',
    ],
    answer: '10 inputs (x = 0..9 with y = 10x), which is 0.1%.',
    mistake: 'Counting 100 (letting x go to 99). y = 10x must stay within 0..99.',
    tryIt: { q: 'x, y each in 0..99. How many inputs satisfy `if (x + y == 50)`?', a: '51: x can be 0..50, each with exactly one y = 50 − x.' },
  };

  H['st10-river-s1s2'] = {
    asks: 'Count the inputs that take S1 and then S2.',
    idea: RIVER_IDEA,
    steps: [
      'S1 needs y ≠ 10x (9,990 inputs). S2 needs x > 3 and y > 10.',
      'x > 3 and y > 10: 96 × 89 = 8,544 inputs. Of those, 6 have y = 10x (x = 4..9). Remove them: 8,544 − 6 = 8,538.',
      { text: 'Every path, counted (sums to 10,000):', table: PATHS },
    ],
    answer: '8,538.',
    mistake: 'Forgetting to subtract the 6 inputs with y = 10x, which go through S0, not S1.',
    tryIt: { q: '`if (x == y) S0 else S1; if (x > 50) S2 else S3;` with x, y in 0..99. How many inputs take S1 and S2?', a: '4,851: x > 50 gives 49 × 100 = 4,900, minus 49 with x == y.' },
  };

  H['st10-river-hardest'] = {
    asks: 'Say which statement random inputs reach least often, and why.',
    idea: RIVER_IDEA,
    steps: [
      { text: 'Count the flow through each path:', table: PATHS },
      'S0 gets 10 inputs; S1 gets 9,990; S2 gets 8,544; S3 gets 1,456. S0 is the trickle.',
      'An equality test between two inputs (y == x*10) is satisfied by very few inputs, so random testing rarely hits it.',
    ],
    answer: 'S0: only inputs with y == x*10 reach it, 10 of 10,000 (0.1%).',
    mistake: 'Picking S3 because the && condition looks harder. A strict equality is far rarer than two inequalities.',
    tryIt: { q: '`if (x == 42 && y == 7) A; else if (x > 50) B; else C;` x, y in 0..99. Hardest to reach?', a: 'A: exactly 1 input of 10,000.' },
  };

  // ---------- lecture 10: observability ----------
  H['st10-obs-visit'] = {
    asks: 'What percent of the 10,000 inputs execute `z = 10`?',
    idea: OBS_IDEA,
    steps: [...OBS_STEPS.slice(0, 2)],
    answer: '99.9%: every input except the 10 with y == x*10.',
    mistake: 'Answering 14%. That is how often its value reaches the output, not how often it runs.',
    tryIt: { q: '`if (x == y) S0 else z = 5;` x, y in 0..99. What percent run `z = 5`?', a: '99%: 9,900 of 10,000 (only the 100 with x == y skip it).' },
  };

  H['st10-obs-percent'] = {
    asks: 'In what percent of inputs does the value from `z = 10` survive to the return value?',
    idea: OBS_IDEA,
    steps: [...OBS_STEPS],
    answer: '14% (1,452 of 10,000 = 14.52%).',
    mistake: 'Answering 99.9%. Running the statement is not enough; `z = 8` overwrites it in 8,538 cases.',
    tryIt: { q: '`if (x == y) S0 else z = 5; if (x > 50) z = 7; else S3; return z;` x, y in 0..99. In what percent is 5 returned?', a: '50%: x ≠ y and x ≤ 50 gives 51 × 100 − 51 = 5,049, which is 50.49%.' },
  };

  H['st10-obs-quadrant'] = {
    asks: 'Place `z = 10` on the reachability/observability grid.',
    idea: OBS_IDEA,
    steps: [
      'Reachability: it runs for 99.9% of inputs, so easy to reach.',
      'Observability: its value reaches the output only 14% of the time, so hard to observe.',
      'The `y == x*10` branch is the opposite corner: hard to reach (0.1%), but whatever happens there is easy to observe.',
    ],
    answer: 'Easy to reach, hard to observe.',
    mistake: 'Calling it easy to observe because it runs so often. Running is reachability; observing needs propagation.',
    tryIt: { q: 'A statement inside `if (x == 0)` sets the return value directly. Which quadrant?', a: 'Hard to reach, easy to observe.' },
  };

  H['st10-obs-no-propagate'] = {
    asks: 'If `z = 10` should be `z = 11`, give one input that runs the bug but hides it, and one that reveals it.',
    idea: 'Reaching a fault and corrupting state is not enough: the bad value has to survive to the output. Pick an input where something overwrites it, and one where nothing does.',
    steps: [
      'To reach the fault you need y ≠ 10x.',
      'To hide it: also make x > 3 and y > 10, so `z = 8` overwrites the wrong value. (5, 20): returns 8 either way.',
      'To reveal it: make the second condition false, e.g., (2, 5). The function returns 10 instead of 11.',
    ],
    answer: 'Hides it: (5, 20), since y ≠ 10x, x > 3, y > 10, and `z = 8` masks the wrong value. Reveals it: (2, 5), which returns 10 instead of 11.',
    mistake: 'Picking an input with y = 10x, like (2, 20). It never reaches the faulty statement.',
    tryIt: { q: '`if (x == y) S0 else z = 5; if (x > 50) z = 7; return z;` If `z = 5` should be `z = 6`, give a hiding and a revealing input.', a: 'Hiding: (60, 3), since `z = 7` overwrites it. Revealing: (10, 3), which returns 5 instead of 6.' },
  };

  H['st10-ripr-order'] = {
    asks: 'Order the conditions a test must meet to find a fault.',
    idea: 'A fault is found only if the test gets there, the fault actually corrupts something, and the corruption reaches somewhere you look. Reach, infect, propagate.',
    steps: [
      '1. Reach: the test must execute the statement containing the fault.',
      '2. Infect (trigger): the system state at that statement must make the fault produce a wrong state.',
      '3. Propagate: the wrong state must travel to a point where it can be observed (output, assertion).',
      'Most coverage measures help only with step 1, which is why 100% coverage can still miss faults.',
    ],
    answer: 'Reach the faulty statement, then trigger (infect) the fault, then propagate it to an observable point.',
    mistake: 'Putting propagation before infection. Nothing can propagate until the state is wrong.',
    tryIt: { q: '`if (age > 18)` should be `>=`. Test age = 30. Which step fails?', a: 'Infection: the statement is reached, but `>` and `>=` agree for 30, so no wrong state.' },
  };

  H['st10-ripr-recall'] = {
    asks: 'Of reach, trigger and propagate, which does most coverage help with?',
    idea: 'Coverage asks “did this code run?”. That is reaching, and nothing more.',
    steps: [
      'A test finds a fault only if it reaches it, triggers it, and propagates it.',
      'Most coverage measures (statement, branch) only record that code ran: reachability.',
      'They do not measure observability. Exceptions named in the course: strong mutation and MC/DC.',
    ],
    answer: 'Only reachability; most coverage measures do not measure observability.',
    mistake: 'Saying coverage guarantees the fault is found once its line is covered.',
    tryIt: { q: 'Line 9 has a bug and is covered by a passing test. Name two ways the bug can still hide.', a: 'The input does not trigger the bug (no infection), or the wrong value is overwritten before the output (no propagation).' },
  };

  H['st10-off-by-one-input'] = {
    asks: 'Spec: 18 or older may buy. Code: `age > 18`. Find the smallest age that exposes the bug.',
    idea: 'Two conditions that differ by one only disagree at the boundary. Only an input that makes them disagree can infect the state.',
    steps: [
      { text: 'Compare the spec and the code:', table: { head: ['age', 'spec (>= 18)', 'code (> 18)', 'differs?'], rows: [
        ['17', 'refuse', 'refuse', 'no'], ['18', 'allow', 'refuse', 'yes'], ['19', 'allow', 'allow', 'no']] } },
      'Every age reaches the condition, but only 18 infects the decision, and the refusal is visible, so it propagates.',
    ],
    answer: '18.',
    mistake: 'Answering 17 or 19. They reach the fault but do not trigger it.',
    tryIt: { q: 'Spec: discount for orders of 100 items or fewer. Code: `if (n < 100)`. Which input reveals the bug?', a: '100: the spec gives a discount, the code does not. All other n agree.' },
  };

  H['st10-observability-measures'] = {
    asks: 'Name the two coverage measures the course says do account for observability.',
    idea: 'Most coverage only checks that code ran. A measure accounts for observability if it also cares whether a change can be seen.',
    steps: [
      'Strong mutation: a mutant is killed only if the difference shows in the output, so the test must reach, infect and propagate.',
      'MC/DC (Modified Condition/Decision Coverage): each condition must independently affect the decision.',
      'Caveat: plain MC/DC only shows the effect on the decision, not that it reaches the output; that is what Observable MC/DC adds. On the exam, give the course answer.',
    ],
    answer: 'Strong mutation and MC/DC.',
    mistake: 'Naming branch coverage. It only checks that each branch ran.',
    tryIt: { q: 'Why does weak mutation (state differs right after the mutated statement) not count?', a: 'It checks infection only, not that the difference reaches the output.' },
  };

  H['st10-observability-mc'] = {
    asks: 'Choose the adequacy measure that also checks propagation to the output.',
    idea: 'Ask which measure needs to SEE a difference, not only run code.',
    steps: [
      'Statement and branch coverage only require execution: reachability.',
      'A strong mutant is killed only if the output differs: it needs propagation.',
    ],
    answer: 'Strong mutation.',
    mistake: 'Picking branch coverage because it is stronger than statement coverage. Both are about reaching code.',
    tryIt: { q: 'Path coverage: does it account for observability?', a: 'No: it requires paths to be executed, which is still reachability.' },
  };

  // ---------- lecture 10: black box, partitions ----------
  H['st10-blackbox-why'] = {
    asks: 'Give reasons a black-box tester may have no access to the code.',
    idea: 'Black-box testing works from what the software promises, not how it is built, so you can test code you do not own, cannot see, or that does not exist yet.',
    steps: [
      'No access: closed-source or third-party components, remote services, independent test teams, or tests written before the code exists.',
      'What you have instead: the specification/documentation, the interface (inputs and outputs), and the observable behaviour of the running program.',
      'Because tests come from the spec, they can also catch missing functionality, which code-based tests cannot see.',
    ],
    answer: 'Closed-source/third-party components or remote services, independent test teams, or tests written before the code exists.',
    mistake: 'Thinking black box means lower quality. It finds things white box cannot, such as missing features.',
    tryIt: { q: 'You test a weather API you call over HTTP. Black or white box, and what do you work from?', a: 'Black box: the API documentation, its inputs/outputs, and observed responses.' },
  };

  H['st10-postal-length-valid'] = {
    asks: 'Name the two invalid classes that come from the postal code’s length.',
    idea: PART_IDEA,
    steps: POSTAL_STEPS,
    answer: 'More than 6 characters, and fewer than 6 characters.',
    mistake: 'Listing “exactly 6” as invalid. 6 is the valid length; the invalid ones lie on each side.',
    tryIt: { q: 'A PIN must be exactly 4 digits. Length-based invalid classes?', a: 'Fewer than 4 digits and more than 4 digits.' },
  };

  H['st10-postal-char-invalid'] = {
    asks: 'Give the invalid classes for the first three characters of a postal code.',
    idea: PART_IDEA,
    steps: [...POSTAL_STEPS.slice(0, 2), 'Each position has its own rule, so each gives its own invalid class. Letters D, F, I, O, Q, U, W, Z never start a Canadian postal code.'],
    answer: 'Invalid 1st character (a number, or a letter no postal code starts with); invalid 2nd character (not a digit); invalid 3rd character (not a letter).',
    mistake: 'One “bad character” class for all positions. A digit is valid in position 2 and invalid in position 1, so they behave differently.',
    tryIt: { q: 'Same pattern: give the invalid classes for characters 4, 5 and 6.', a: '4th not a digit, 5th not a letter, 6th not a digit.' },
  };

  H['st10-partition-def'] = {
    asks: 'State the two conditions for subsets of S to form a partition of S.',
    idea: 'A partition is slicing a cake: every crumb is in some slice, and no crumb is in two slices.',
    steps: [
      'Union of all the subsets = S (nothing is left out).',
      'Intersection of any two subsets is empty (nothing is in two).',
      'Partition testing: split the inputs so any sample from a class is a good representative, then choose one input per class.',
    ],
    answer: 'The union of all subsets equals S, and any two subsets have an empty intersection.',
    mistake: 'Giving only “covers everything”. Overlapping classes cover everything too but are not a partition.',
    tryIt: { q: 'Is {even integers}, {odd integers} a partition of the integers?', a: 'Yes: together they are every integer, and no integer is both.' },
  };

  H['st10-partition-check'] = {
    asks: 'Decide whether {x < 0}, {x > 0}, {x ≥ 0} is a partition of the integers.',
    idea: 'Check both conditions: covers everything, and no overlaps.',
    steps: [
      'Union: negatives, positives, and 0 (in x ≥ 0). All integers are covered.',
      'Intersection: 5 is in both {x > 0} and {x ≥ 0}. Not empty, so not a partition.',
      'Overlapping classes are allowed only in quasi-partition testing.',
    ],
    answer: 'No: {x > 0} and {x ≥ 0} overlap.',
    mistake: 'Saying 0 belongs to no class. It belongs to {x ≥ 0}.',
    tryIt: { q: 'Is {x < 0}, {x = 0}, {x > 0} a partition of the integers?', a: 'Yes: it covers every integer and no two classes overlap.' },
  };

  H['st10-sparse-dense'] = {
    asks: 'Explain how failures are spread over the inputs and why testing every class helps.',
    idea: PART_IDEA,
    steps: [
      'Failures are sparse overall: most inputs work.',
      'But they are dense in some regions (boundaries, special values, particular formats).',
      'So partition the input space into classes of hopefully equivalent inputs and test some from each class; that way the dense regions get included.',
      'Finding good classes takes skill and domain expertise.',
    ],
    answer: 'Failures are sparse overall but dense in some regions. Partition the inputs into classes of equivalent inputs and test each class, so the dense regions are sampled.',
    mistake: 'Thinking random testing does the same job. Random inputs rarely land in a small dense region.',
    tryIt: { q: 'A date parser fails only for February 29. Random dates vs one test per class (month length, leap day): which finds it?', a: 'The class-based suite: a leap-day class guarantees the test; random dates hit it about 1 time in 1,461.' },
  };

  H['st10-true-vs-quasi'] = {
    asks: 'Contrast ideal partitioning with the quasi-partitioning used in practice.',
    idea: 'Ideally every class behaves the same inside, so one test per class would do. In practice we cannot guarantee that, so we accept overlap and also test boundaries.',
    steps: [
      { text: 'Side by side:', table: { head: ['', 'true partition', 'quasi-partition'], rows: [
        ['overlap', 'classes disjoint', 'classes may overlap'],
        ['equivalence', 'every input in a class behaves the same', 'not guaranteed; hope for failure-dense classes'],
        ['chosen by', 'ideal', 'experience and heuristics']] } },
      'Functional testing: derive (quasi-)partitions from the specification, test each class and its boundaries, and combine representatives from different classes.',
    ],
    answer: 'True: disjoint classes where every input behaves equivalently, so one test per class would do. Quasi: classes may overlap and equivalence is not guaranteed; heuristics pick them. Functional testing derives them from the spec and tests each class and its boundaries.',
    mistake: 'Thinking one test per class is enough in practice. Without guaranteed equivalence, test the boundaries too.',
    tryIt: { q: 'Classes “passwords with a digit” and “passwords of 8+ characters” overlap. True or quasi?', a: 'Quasi: the intersection is not empty.' },
  };

  H['st10-postal-output'] = {
    asks: 'Name the two valid classes that come from the output of the postal-code lookup.',
    idea: PART_IDEA,
    steps: POSTAL_STEPS,
    answer: 'A code in exactly one EI economic region, and a code that maps to many EI economic regions.',
    mistake: 'Only partitioning by input format. The output can also split the inputs into classes.',
    tryIt: { q: 'A search returns a list of products. Give output-based classes.', a: 'Zero results, exactly one result, many results.' },
  };

  H['st10-postal-mc'] = {
    asks: 'Which input breaks only the rule for the second character?',
    idea: PART_IDEA,
    steps: [POSTAL_STEPS[1], 'The second character must be a digit. TXV2R3 has X there, and everything else is fine.'],
    answer: 'TXV2R3.',
    mistake: 'Picking 4TV2R3. Its first character is the problem.',
    tryIt: { q: 'Which class does T4V2RR belong to?', a: 'Invalid 6th character (not a digit).' },
  };

  H['st10-reverse-spec'] = {
    asks: 'Name the two questions the `reverse` spec leaves open.',
    idea: 'Black-box design starts by questioning the spec; each open question is a finding and a test idea.',
    steps: REVERSE_STEPS,
    answer: 'Null-terminated, length-specified, or both? And is the reverse destructive (in place) or does it return a new string?',
    mistake: 'Jumping to test values before asking what the spec means.',
    tryIt: { q: 'Spec: “sort takes a list of numbers and returns them sorted.” Name two open questions.', a: 'Ascending or descending? In place or new list? (Also: duplicates, stability.)' },
  };

  H['st10-reverse-length-classes'] = {
    asks: 'Give four length-based classes for testing `reverse`.',
    idea: PART_IDEA,
    steps: REVERSE_STEPS,
    answer: 'Empty string, single character, even and odd lengths, very long string.',
    mistake: 'Testing only “normal” strings. Lengths 0 and 1 are boundaries where loops misbehave.',
    tryIt: { q: 'Length classes for a function that returns the middle element of a list?', a: 'Empty, one element, odd length, even length (no single middle), very long.' },
  };

  H['st10-reverse-special-classes'] = {
    asks: 'Give four special classes for testing `reverse`, beyond length.',
    idea: PART_IDEA,
    steps: REVERSE_STEPS,
    answer: 'A palindrome, repeated characters, spaces/special/multi-byte characters, and null.',
    mistake: 'Forgetting multi-byte characters: reversing bytes scrambles them.',
    tryIt: { q: 'Why is a palindrome a weak test alone?', a: 'A broken reverse that returns its input unchanged would still pass it.' },
  };

  // ---------- lecture 12 ----------
  H['st12-ai-landing'] = {
    asks: 'Explain how the evolved landing algorithm scored perfectly.',
    idea: 'When the metric differs from the real goal, an optimizer finds the cheapest way to win the metric, even a bug in the test harness.',
    steps: [
      'Real goal: land the aircraft safely. Optimized goal: land with minimal measured forces.',
      'The physics simulator had an overflow error.',
      'The algorithm made forces so large that they overflowed and were estimated as zero: a perfect score.',
    ],
    answer: 'It exploited an overflow in the physics simulator: huge forces were estimated as zero.',
    mistake: 'Saying it learned to land gently. It learned to break the measurement.',
    tryIt: { q: 'An AI must reach 100% coverage and writes tests with no asserts. Same lesson?', a: 'Yes: it optimizes the measure (coverage), not the goal (finding faults).' },
  };

  H['st12-spec-steps-order'] = {
    asks: 'Put the steps for deriving tests from a specification in order.',
    idea: 'Each step needs the one before it: you cannot pick values before you know the features, nor combine values before picking them.',
    steps: [
      '1. Decompose the specification into independently testable features.',
      '2. Select representatives: representative values of each input, or behaviours of a model.',
      '3. Generate test specifications: combinations of representatives.',
      '4. Produce and execute actual tests.',
    ],
    answer: 'Decompose into features, select representatives, generate test specifications (combinations), produce and execute tests.',
    mistake: 'Generating combinations before selecting representatives.',
    tryIt: { q: 'For a login page, what is step 1?', a: 'Identify independently testable features, e.g., password check, lockout after failures, “remember me”.' },
  };

  H['st12-combinatorial'] = {
    asks: 'Define combinatorial testing.',
    idea: 'A feature usually has several things that can vary at once. Combinatorial testing lists them and combines their values systematically instead of at random.',
    steps: COMB_STEPS,
    answer: 'For each feature, identify the distinct attributes that can be varied and systematically generate combinations of their values.',
    mistake: 'Saying it means “all combinations”. Techniques like pairwise cover only some.',
    tryIt: { q: 'A video player: name one attribute of each kind.', a: 'Input parameter: the video file. Environment condition: the OS. Configuration: subtitles on/off.' },
  };

  H['st12-attribute-kind'] = {
    asks: 'Classify “the OS version the app runs on”.',
    idea: 'Ask whether the thing is fed in (input), surrounds the app (environment), or is a setting of the app itself (configuration).',
    steps: COMB_STEPS.slice(0, 2),
    answer: 'An environment condition.',
    mistake: 'Calling it a configuration. A configuration is a setting of the app itself.',
    tryIt: { q: 'Classify “the app’s language setting is French”.', a: 'A configuration.' },
  };

  H['st12-three-techniques'] = {
    asks: 'Name the three combinatorial techniques.',
    idea: 'They differ in how they pick values and how many combinations they keep.',
    steps: COMB_STEPS,
    answer: 'Category-partition, pairwise, and catalog-based testing.',
    mistake: 'Listing equivalence partitioning or boundary testing. Those are part of choosing values, not the three techniques.',
    tryIt: { q: 'Which technique writes down categories and constraints, then generates combinations automatically?', a: 'Category-partition.' },
  };

  H['st12-pairwise-mc'] = {
    asks: 'Which technique tests attribute interactions with few tests?',
    idea: PW_IDEA,
    steps: COMB_STEPS.slice(2),
    answer: 'Pairwise testing.',
    mistake: 'Choosing category-partition. It generates combinations but can still give many tests.',
    tryIt: { q: 'Three on/off settings: exhaustive vs pairwise test counts?', a: 'Exhaustive 8, pairwise 4.' },
  };

  H['st12-catalog-mc'] = {
    asks: 'Which technique relies on test designers’ experience to find values?',
    idea: 'A catalog is a written list of what has broken before, for example “try empty, one element, many”.',
    steps: COMB_STEPS.slice(2),
    answer: 'Catalog-based testing.',
    mistake: 'Picking pairwise. Pairwise is about combining values, not finding them.',
    tryIt: { q: 'A checklist says “for any integer, try 0, 1, −1, max”. Which technique?', a: 'Catalog-based.' },
  };

  H['st12-category-partition'] = {
    asks: 'Describe category-partition: its two phases and what constraints are for.',
    idea: FONT_IDEA,
    steps: [
      'Phase 1: identify values that characterize the input space: categories of values for each attribute (normal, boundary, special, error).',
      'Phase 2: generate combinations for test cases; this can be automated.',
      'Constraints eliminate impossible combinations and limit the possible ones.',
      ...FONT_STEPS.slice(3),
    ],
    answer: 'Phase 1: identify categories of values for each attribute (normal, boundary, special, error). Phase 2: generate combinations (automatable). Constraints eliminate impossible combinations and limit the possible ones.',
    mistake: 'Forgetting constraints. Without them the count explodes and many tests are meaningless.',
    tryIt: { q: 'Shipping form: country {Canada, US} and province/state. Which constraint is needed?', a: 'Province only with Canada and state only with US; e.g., US with Alberta is impossible.' },
  };

  H['st12-value-categories'] = {
    asks: 'Name the four categories of values in category-partition.',
    idea: 'Each category targets a different kind of fault: everyday use, edges, odd cases, and bad input.',
    steps: [
      { text: 'Categories, using font size [1..512]:', table: { head: ['category', 'example'], rows: [
        ['normal', '12'], ['boundary', '1, 512'], ['special', 'a fractional size like 10.5'], ['error', '0, 513, “abc”']] } },
      'Then combine one value per category into test case specifications.',
    ],
    answer: 'Normal, boundary, special, and error values.',
    mistake: 'Leaving out special values, which are neither normal nor wrong (null, palindromes, leap days).',
    tryIt: { q: 'Age field 0–120: one value from each category.', a: 'Normal 35; boundary 0 or 120; special e.g. 18 (legal-age cutoff); error −1 or “ten”.' },
  };

  H['st12-representative'] = {
    asks: 'Name the two things to consider when choosing representative classes.',
    idea: 'Faults cluster at edges and in error handling, so look at the boundaries and just outside the normal domain.',
    steps: [
      'Boundary values: inside, at, and outside each boundary.',
      'Erroneous conditions: values outside the domain of normal operation.',
      'Example: font size [1..512] gives 0, 1, 2 and 511, 512, 513, plus non-numeric input.',
    ],
    answer: 'Boundary values (inside, at, outside) and erroneous conditions (outside the normal domain).',
    mistake: 'Testing only at the boundary. Inside and outside are part of it.',
    tryIt: { q: 'Quantity [1..99]: boundary values?', a: '0, 1, 2 and 98, 99, 100.' },
  };

  H['st12-font-size-boundary'] = {
    asks: 'Give representative classes and inside/at/outside boundary values for font sizes [1..512].',
    idea: 'Shrink 512 values to a few classes, then add the edges where off-by-one bugs live.',
    steps: [
      'Classes: small, medium, large. Erroneous: below 1, above 512, non-numeric.',
      { text: 'Boundary values at each end:', table: { head: ['edge', 'outside', 'at', 'inside'], rows: [['low (1)', '0', '1', '2'], ['high (512)', '513', '512', '511']] } },
    ],
    answer: 'Classes small, medium, large (plus below 1, above 512, non-numeric). Boundaries: 0, 1, 2 and 511, 512, 513.',
    mistake: 'Testing 1 and 512 only. Outside values check rejection; inside values check the edge is not off by one.',
    tryIt: { q: 'Zoom accepts [10..400] percent. Boundary values?', a: '9, 10, 11 and 399, 400, 401.' },
  };

  H['st12-font-128'] = {
    asks: 'Count combinations of 7 independent on/off effects.',
    idea: FONT_IDEA,
    steps: [
      'Each checkbox doubles the count: 2 × 2 × 2 × 2 × 2 × 2 × 2 = 2^7 = 128.',
      'Add font styles and underline styles: 8,192 for one font; with advanced features, over 10^6.',
    ],
    answer: '128 (2^7).',
    mistake: 'Answering 14 (7 × 2). Choices multiply, they do not add.',
    tryIt: { q: '4 checkboxes and a 4-option style dropdown. Combinations?', a: '2^4 × 4 = 64.' },
  };

  H['st12-font-representatives'] = {
    asks: 'Name the representative values for the colour attribute.',
    idea: 'Over 4 billion colours, but the program likely treats them in a few ways: black, white, everything else.',
    steps: FONT_STEPS.slice(1, 2).concat(['White text matters on its own: on a white page it vanishes, a special case.']),
    answer: 'Black, white, and coloured.',
    mistake: 'Listing red, green, blue. Those are all one class: coloured.',
    tryIt: { q: 'Font sizes [1..512]: which representatives does the lecture use?', a: 'Small, medium, large.' },
  };

  H['st12-test-case-spec'] = {
    asks: 'Define a test case specification in category-partition.',
    idea: FONT_IDEA,
    steps: FONT_STEPS.slice(2),
    answer: 'A selection of one representative value for each category.',
    mistake: 'Saying it is a test case. It does not yet have concrete inputs and expected results.',
    tryIt: { q: 'Categories: size {small, medium, large}, colour {black, white, coloured}. Give one test case specification.', a: 'For example (large, white).' },
  };

  H['st12-font-constraint-count'] = {
    asks: 'Count combinations of 7 effects with three “at most one of” pairs.',
    idea: FONT_IDEA,
    steps: [
      'A free pair has 4 states. “At most one of” removes both-on, leaving 3: neither, first, second.',
      { text: 'Multiply:', table: { head: ['group', 'legal states'], rows: [
        ['{Strikethrough, Double strikethrough}', '3'], ['{Superscript, Subscript}', '3'], ['{Small caps, All caps}', '3'], ['Hidden', '2'], ['total', '3 × 3 × 3 × 2 = 54']] } },
    ],
    answer: '54.',
    mistake: 'Subtracting 3 from 128. Each constraint removes many combinations (every one with that pair on).',
    tryIt: { q: '4 checkboxes in two “at most one of” pairs. How many combinations?', a: '3 × 3 = 9 (out of 16).' },
  };

  H['st12-single'] = {
    asks: 'Explain what marking a value “single” means.',
    idea: FONT_IDEA,
    steps: [...FONT_STEPS.slice(3), '“Single” means test the value in one test case only, not combined with every value of the other categories.'],
    answer: 'The value is tested in only one test case instead of with every value of the others; its effect is assumed not to depend on them, so this shrinks the count.',
    mistake: 'Thinking “single” means “at most one checkbox on”. That is the “at most one of” constraint.',
    tryIt: { q: 'Why mark an error value like “size = −5” single?', a: 'The input should be rejected whatever the other settings, so one test is enough.' },
  };

  H['st12-invalid-combo'] = {
    asks: 'Which combination of Font effects is impossible?',
    idea: FONT_IDEA,
    steps: FONT_STEPS.slice(3),
    answer: 'Superscript and Subscript both checked.',
    mistake: 'Picking Superscript + All caps. They come from different groups, so they can combine.',
    tryIt: { q: 'Is Small caps + All caps feasible?', a: 'No: at most one of {Small caps, All caps}.' },
  };
})(globalThis.FC = globalThis.FC || {});
