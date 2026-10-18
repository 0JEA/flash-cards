// Step-through traces for CSC 370 code cards, shown in Help (format: js/trace.js header).
// Lisp/Scheme one-liners step through evaluation stages on the same line; C/Python control
// flow shows exactly which lines run and which are skipped. tests/trace.test.js checks that
// every line exists and that the output (or final result) equals the card's answer.
(function (FC) {
  'use strict';
  const T = FC.trace = FC.trace || {};

  // ---- Common Lisp: mapcar walks both lists in step ----
  const MC = "(mapcar '+ '(1 3 4 7) '(2 4 6 8))";
  T['l1-expressivity'] = [
    { line: 1, note: 'mapcar takes the function + and two lists. It will call + on the first items of both lists, then the second items, and so on, collecting the answers.',
      frames: [{ fn: 'global', vars: {} }, { fn: MC, vars: { pair: '?', built: "'()" } }] },
    { line: 1, note: 'First items: (+ 1 2) gives 3, the first item of the new list.',
      frames: [{ fn: 'global', vars: {} }, { fn: MC, vars: { pair: '1 and 2', built: "'(3)" } }] },
    { line: 1, note: 'Second items: (+ 3 4) gives 7.',
      frames: [{ fn: 'global', vars: {} }, { fn: MC, vars: { pair: '3 and 4', built: "'(3 7)" } }] },
    { line: 1, note: 'Third items: (+ 4 6) gives 10.',
      frames: [{ fn: 'global', vars: {} }, { fn: MC, vars: { pair: '4 and 6', built: "'(3 7 10)" } }] },
    { line: 1, note: 'Fourth items: (+ 7 8) gives 15. Both lists are now used up.',
      frames: [{ fn: 'global', vars: {} }, { fn: MC, vars: { pair: '7 and 8', built: "'(3 7 10 15)" } }] },
    { line: 1, note: 'mapcar returns the list of sums. One line did what a loop with an index and an accumulator would do elsewhere.',
      frames: [{ fn: 'global', vars: {} }], result: '(3 7 10 15)' },
  ];

  // ---- Scheme: a list is a palindrome when it equals its own reverse ----
  const PAL = "'(1 0 1 0 1 0 0 1 0 1)";
  const PCALL = '(isPalindrome (1 0 1 0 1 0 0 1 0 1))';
  T['l2-scheme-trace'] = [
    { line: 1, note: 'define binds the name isPalindrome to a procedure of one argument, aList. Nothing runs yet.',
      frames: [{ fn: 'global', vars: { isPalindrome: 'procedure' } }] },
    { line: 4, note: 'isPalindrome is called with the quoted list, so aList is bound to it.',
      frames: [{ fn: 'global', vars: { isPalindrome: 'procedure' } }, { fn: PCALL, vars: { aList: PAL } }] },
    { line: 2, note: '(reverse aList) builds a new list with the items in the opposite order.',
      frames: [{ fn: 'global', vars: { isPalindrome: 'procedure' } }, { fn: PCALL, vars: { aList: PAL, reversed: "'(1 0 1 0 0 1 0 1 0 1)" } }] },
    { line: 2, note: 'equal? compares item by item: 1 0 1 0 match, but the fifth items are 1 and 0, so the lists differ.',
      frames: [{ fn: 'global', vars: { isPalindrome: 'procedure' } }, { fn: PCALL, vars: { aList: PAL, reversed: "'(1 0 1 0 0 1 0 1 0 1)" } }] },
    { line: 4, note: 'equal? gave false, and that is the value the call returns: #f.',
      frames: [{ fn: 'global', vars: { isPalindrome: 'procedure' } }], result: '#f' },
  ];

  // ---- C: = inside an if is assignment, not comparison ----
  T['l10-assign-trace'] = [
    { line: 1, note: 'userNum is declared but not set.', frames: [{ fn: 'main', vars: { userNum: '?' } }] },
    { line: 2, note: 'favNum is declared but not set.', frames: [{ fn: 'main', vars: { userNum: '?', favNum: '?' } }] },
    { line: 3, note: 'favNum gets 5.', frames: [{ fn: 'main', vars: { userNum: '?', favNum: 5 } }] },
    { line: 4, note: 'The prompt is printed.', frames: [{ fn: 'main', vars: { userNum: '?', favNum: 5 } }], out: 'Enter your number: ' },
    { line: 5, note: 'The user types 3, and scanf stores it in userNum through its address.',
      frames: [{ fn: 'main', vars: { userNum: 3, favNum: 5 } }] },
    { line: 6, note: 'A single = ASSIGNS: userNum becomes 5, and the condition is that value, 5. Any nonzero value counts as true.',
      frames: [{ fn: 'main', vars: { userNum: 5, favNum: 5 } }] },
    { line: 7, note: 'The true branch prints Awesome and the else is skipped. The typed number was overwritten by 5, so any input gives the same result.',
      frames: [{ fn: 'main', vars: { userNum: 5, favNum: 5 } }], out: 'Awesome', result: 'Awesome' },
  ];

  // ---- C: dangling else, x = 4 ----
  T['l10-dangling-4'] = [
    { line: 1, note: 'result gets 111.', frames: [{ fn: 'main', vars: { x: 4, y: 5, count: 20, result: 111 } }] },
    { line: 2, note: '4 > 5 is false. The else belongs to the NEAREST if (the inner one), so this outer if has no else: lines 3 to 6 are all skipped.',
      frames: [{ fn: 'main', vars: { x: 4, y: 5, count: 20, result: 111 } }], result: '111' },
  ];

  // ---- C: dangling else, x = 14 ----
  T['l10-dangling-14'] = [
    { line: 1, note: 'result gets 111.', frames: [{ fn: 'main', vars: { x: 14, y: 5, count: 20, result: 111 } }] },
    { line: 2, note: '14 > 5 is true, so the inner if statement runs.',
      frames: [{ fn: 'main', vars: { x: 14, y: 5, count: 20, result: 111 } }] },
    { line: 3, note: 'count == 0 is false (count is 20), so line 4 is skipped.',
      frames: [{ fn: 'main', vars: { x: 14, y: 5, count: 20, result: 111 } }] },
    { line: 6, note: 'The else belongs to the NEAREST if, the count test, so its branch runs: result becomes 1.',
      frames: [{ fn: 'main', vars: { x: 14, y: 5, count: 20, result: 1 } }], result: '1' },
  ];

  // ---- C: the conditional operator ----
  T['l10-ternary-trace'] = [
    { line: 1, note: 'x gets 4 and y gets 9.', frames: [{ fn: 'main', vars: { x: 4, y: 9 } }] },
    { line: 2, note: 'x > y is 4 > 9, false, so the part after the colon is chosen: m = y = 9.',
      frames: [{ fn: 'main', vars: { x: 4, y: 9, m: 9 } }] },
    { line: 3, note: '9 % 2 is 1, so m is odd and the test is false. The part after the colon is chosen: n = 9 * 3 = 27.',
      frames: [{ fn: 'main', vars: { x: 4, y: 9, m: 9, n: 27 } }] },
    { line: 4, note: 'printf prints m and n with a space between.', frames: [{ fn: 'main', vars: { x: 4, y: 9, m: 9, n: 27 } }], out: '9 27' },
  ];

  // ---- C: switch fall-through ----
  T['l10-fallthrough'] = [
    { line: 1, note: 'n gets 2.', frames: [{ fn: 'main', vars: { n: 2 } }] },
    { line: 2, note: 'switch jumps straight to the label matching n, case 2. Case 1 is skipped.', frames: [{ fn: 'main', vars: { n: 2 } }] },
    { line: 4, note: 'case 2 prints its word.', frames: [{ fn: 'main', vars: { n: 2 } }], out: 'two ' },
    { line: 5, note: 'There is no break, so execution falls into case 3. A case label is only an entry point, not a wall.',
      frames: [{ fn: 'main', vars: { n: 2 } }], out: 'three ' },
    { line: 6, note: 'Still no break, so it falls into default too.', frames: [{ fn: 'main', vars: { n: 2 } }], out: 'other' },
    { line: 7, note: 'The end of the switch block is reached, so the switch finishes.', frames: [{ fn: 'main', vars: { n: 2 } }] },
  ];

  // ---- C: a for loop whose work is all in the header ----
  const W = (i, j, sum) => [{ fn: 'main', vars: { i, j, sum } }];
  T['l10-weird-for'] = [
    { line: 1, note: 'i and j are declared but not set; sum starts at 0.', frames: W('?', '?', 0) },
    { line: 2, note: 'Initialisation, run once: the comma operator does i = 0 and then j = 2.', frames: W(0, 2, 0) },
    { line: 2, note: 'Test: 0 < 10 is true. The body is just the semicolon at the end, an empty statement, so nothing happens.', frames: W(0, 2, 0) },
    { line: 2, note: 'Update, first part: ++i raises i to 1 BEFORE it is used, so sum = 1 + 2 = 3.', frames: W(1, 2, 3) },
    { line: 2, note: 'Update, second part: j *= 2 doubles j to 4. The comma makes this run after the sum.', frames: W(1, 4, 3) },
    { line: 2, note: 'Test: 1 < 10 is true; the empty body runs.', frames: W(1, 4, 3) },
    { line: 2, note: 'Update: i becomes 2, sum = 2 + 4 = 6.', frames: W(2, 4, 6) },
    { line: 2, note: 'Update: j doubles to 8.', frames: W(2, 8, 6) },
    { line: 2, note: 'From here one step is one whole pass (test, empty body, update): i becomes 3, sum = 3 + 8 = 11, j doubles to 16.', frames: W(3, 16, 11) },
    { line: 2, note: 'One whole pass: i = 4, sum = 4 + 16 = 20, j = 32.', frames: W(4, 32, 20) },
    { line: 2, note: 'One whole pass: i = 5, sum = 5 + 32 = 37, j = 64.', frames: W(5, 64, 37) },
    { line: 2, note: 'One whole pass: i = 6, sum = 6 + 64 = 70, j = 128.', frames: W(6, 128, 70) },
    { line: 2, note: 'One whole pass: i = 7, sum = 7 + 128 = 135, j = 256.', frames: W(7, 256, 135) },
    { line: 2, note: 'One whole pass: i = 8, sum = 8 + 256 = 264, j = 512.', frames: W(8, 512, 264) },
    { line: 2, note: 'One whole pass: i = 9, sum = 9 + 512 = 521, j = 1024.', frames: W(9, 1024, 521) },
    { line: 2, note: 'One whole pass: i = 10, sum = 10 + 1024 = 1034, and then j still doubles to 2048, because the doubling comes after the sum.', frames: W(10, 2048, 1034) },
    { line: 2, note: 'Test: 10 < 10 is false, so the loop ends. sum used j BEFORE its last doubling, which is why it is 10 + 1024.',
      frames: W(10, 2048, 1034), result: 'i = 10, j = 2048, sum = 1034' },
  ];

  // ---- Python: the for loop rebinds i from range each time ----
  const P = i => [{ fn: 'global', vars: { i } }];
  T['l10-py-loop'] = [
    { line: 1, note: 'range(10) will hand out 0, 1, ..., 9 in turn. i is bound to the first value, 0.', frames: P(0) },
    { line: 2, note: 'print shows 0.', frames: P(0), out: '0\n' },
    { line: 3, note: 'i becomes 0 * 5 = 0.', frames: P(0) },
    { line: 1, note: 'The loop takes the NEXT value from range, 1, and binds i to it. Whatever i was before does not matter.', frames: P(1) },
    { line: 2, note: 'print shows 1.', frames: P(1), out: '1\n' },
    { line: 3, note: 'i becomes 5, but only until the loop rebinds it.', frames: P(5) },
    { line: 2, note: 'Passes are now shown one step each: i is rebound to 2 and printed; line 3 then makes it 10, which is thrown away.', frames: P(2), out: '2\n' },
    { line: 2, note: 'One pass: i is rebound to 3 and printed (then set to 15).', frames: P(3), out: '3\n' },
    { line: 2, note: 'One pass: i is rebound to 4 and printed (then set to 20).', frames: P(4), out: '4\n' },
    { line: 2, note: 'One pass: i is rebound to 5 and printed (then set to 25).', frames: P(5), out: '5\n' },
    { line: 2, note: 'One pass: i is rebound to 6 and printed (then set to 30).', frames: P(6), out: '6\n' },
    { line: 2, note: 'One pass: i is rebound to 7 and printed (then set to 35).', frames: P(7), out: '7\n' },
    { line: 2, note: 'One pass: i is rebound to 8 and printed (then set to 40).', frames: P(8), out: '8\n' },
    { line: 1, note: 'Back to line by line: range hands out its last value, 9.', frames: P(9) },
    { line: 2, note: 'print shows 9.', frames: P(9), out: '9\n' },
    { line: 3, note: 'i becomes 45.', frames: P(45) },
    { line: 1, note: 'range has no values left, so the loop ends. i keeps 45, but the printing was never affected.', frames: P(45) },
  ];

  // ---- C: changing i inside the body does change the loop ----
  const C = i => [{ fn: 'main', vars: { i } }];
  T['l10-c-loop'] = [
    { line: 1, note: 'Initialisation sets i to 0; the test 0 < 10 is true, so the body runs.', frames: C(0) },
    { line: 2, note: 'Prints 0 and a space.', frames: C(0), out: '0 ' },
    { line: 3, note: 'i becomes 0 * 5 = 0.', frames: C(0) },
    { line: 1, note: 'i++ makes i 1; 1 < 10 is true. In C, i is the loop counter itself, so changes in the body carry over.', frames: C(1) },
    { line: 2, note: 'Prints 1.', frames: C(1), out: '1 ' },
    { line: 3, note: 'i becomes 1 * 5 = 5.', frames: C(5) },
    { line: 1, note: 'i++ makes i 6 (the 5 carried over, so 2 to 5 are skipped); 6 < 10 is true.', frames: C(6) },
    { line: 2, note: 'Prints 6.', frames: C(6), out: '6 ' },
    { line: 3, note: 'i becomes 6 * 5 = 30.', frames: C(30) },
    { line: 1, note: 'i++ makes i 31; 31 < 10 is false, so the loop ends.', frames: C(31) },
  ];
})(globalThis.FC = globalThis.FC || {});
