// "Help" walkthroughs for CSC 370, batch D: Lecture 3, the C language (pointers, arrays,
// strings, memory, C exam style). Format and rules: see the header of decks/csc370-help.js.
// Every output and value below (card code and tryIt code) was compiled with gcc -Wall and run.
(function (FC) {
  'use strict';
  const H = FC.help = FC.help || {};

  H['l3-banana-out'] = {
    asks: 'Decide which `printf` runs. That depends on whether the `if` condition `++banana - 7` counts as true.',
    idea: 'C has no true/false type in an `if`: it only asks "is this number zero?" Zero is false; every other number, even a negative one, is true. So work out the number first, then ask that one question.',
    steps: [
      '`int banana = 13;` makes one box named `banana` holding 13.',
      '`++banana` is pre-increment: add 1 to banana first (it becomes 14), then use the new value. So the condition is 14 - 7 = 7.',
      '7 is not zero, so C treats it as true and runs the first branch.',
      { text: 'Step by step:', table: { head: ['step', 'banana', 'condition'], rows: [['int banana = 13;', '13', '–'], ['++banana', '14', '–'], ['++banana - 7', '14', '7 (nonzero: true)']] } },
    ],
    answer: 'Boogy Boogy: the condition is 14 - 7 = 7, and any nonzero int is true in C.',
    mistake: 'Using 13 instead of 14 (pre-increment changes the box BEFORE the subtraction), or thinking an `if` needs a comparison like `> 0`. In C the number itself is the test.',
    tryIt: { q: 'What does this print? `int k = 3; if (k-- - 3) printf("A"); else printf("B");`', a: 'B. `k--` is post-decrement: it hands over the old value 3, then k becomes 2. The condition is 3 - 3 = 0, which is false.' },
  };

  H['l3-banana-val'] = {
    asks: 'After the code runs, what number sits in the box named `banana`?',
    idea: 'Only an operator that stores can change a box. `++` stores; `-` just computes a temporary answer that the `if` uses and then throws away.',
    steps: [
      'Start: banana holds 13.',
      '`++banana` adds 1 AND writes it back: banana now holds 14.',
      '`- 7` computes 14 - 7 = 7, but nothing says `banana = ...`, so the 7 is never stored. The `if` uses it and it is gone.',
      'The `printf` calls only print; they do not touch banana. So it ends at 14.',
    ],
    answer: '14: `++banana` stored 14; the subtraction stored nothing.',
    mistake: 'Answering 7, as if the subtraction were saved. A box only changes on `=`, `+=`, `++`, `--` and the like.',
    tryIt: { q: '`int m = 9; if (m++ - 9) printf("yes"); else printf("no");` What prints, and what is m afterwards?', a: 'It prints no, and m is 10. `m++` uses the old 9 (9 - 9 = 0, false) but still stores 10 in m.' },
  };

  H['l3-banana-java'] = {
    asks: 'C runs this code. Java (with `System.out.println` instead of `printf`) refuses to compile it. Name the rule that makes the difference.',
    idea: 'An `if` needs a condition. C accepts any number as a condition (0 false, nonzero true). Java demands an expression whose type is boolean, and its compiler checks that before anything runs. Sebesta calls C not strongly typed and Java nearly strongly typed.',
    steps: [
      'Find the type of the condition: `++banana` is an int and 7 is an int, so `++banana - 7` is an int (value 7).',
      'C is fine with that: C89 had no Boolean type at all, so numbers were used as conditions, and C still allows it.',
      'Java’s compiler checks the type of every `if` condition. An int where a boolean is required, with no conversion, is rejected: `javac` says "incompatible types: int cannot be converted to boolean".',
      'The compiler catches it, so it is a static (compile-time) type error, not a crash while running.',
      { text: 'What Java would need instead, an explicit comparison that produces a boolean:', code: 'if (++banana - 7 != 0) { ... }' },
    ],
    answer: 'Java checks types more strongly than C: the condition is an int, not a boolean, and is not converted to one, so the compiler rejects it (a static type error).',
    mistake: 'Blaming `printf` or the `++`. Both are fine in Java; the only problem is the type of the condition.',
    tryIt: { q: 'With `int x = 0;`, C compiles `if (x = 5) { ... }` (gcc only warns). Would Java compile it? Why?', a: 'No. `x = 5` is an assignment whose value is the int 5, and Java will not take an int as an if condition: the same static type error. C runs the branch, because 5 is nonzero.' },
  };

  H['l3-banana-diagram'] = {
    asks: 'Draw the boxes this code makes in memory and show how their values change, crossing out old ones.',
    idea: 'A memory diagram has one box per declared variable, nothing more. A value that is computed but never assigned to a variable gets no box.',
    steps: [
      'Count the declarations: only `int banana` makes a box. Draw it holding 13.',
      '`++banana` writes 14 into that box, so cross out 13 and write 14 beside it.',
      '`++banana - 7` gives 7, but no variable holds it: it is a temporary used by the `if`. No box.',
      '`printf` prints Boogy Boogy and changes no box.',
      { text: 'The finished diagram:', table: { head: ['name', 'value'], rows: [['banana', '13 → 14']] } },
    ],
    answer: 'One box: banana | 13 → 14. No box for the 7, because the subtraction’s result is never stored.',
    mistake: 'Drawing a box for 7 or for the text "Boogy Boogy". Only declared variables get boxes.',
    tryIt: { q: 'Diagram this: `int pear = 2; if (pear++ * 3) { printf("hi"); }`', a: 'pear | 2 → 3. `pear++ * 3` uses the old 2 (2 * 3 = 6, true) and stores 3; the 6 gets no box.' },
  };

  H['l3-exam-q1-diagram'] = {
    asks: 'Show the stack boxes for `a` and `b`, how they change, and what `printf` prints.',
    idea: 'On a stack diagram each new variable sits on top of the earlier ones. `--b` both changes b and supplies the condition, and in C -1 counts as true.',
    steps: [
      '`int a = 0;` is the first box, a = 0. `int b = 0;` goes on top of it, b = 0.',
      '`--b` is pre-decrement: b becomes -1 first (cross out 0), then -1 is the condition.',
      '-1 is not zero, so it is true and `b += 10` runs: -1 + 10 = 9 (cross out -1).',
      { text: 'Trace:', table: { head: ['line', 'a', 'b'], rows: [['int a = 0;', '0', '–'], ['int b = 0;', '0', '0'], ['if (--b)', '0', '-1 (true)'], ['b += 10;', '0', '9']] } },
      '`printf("%d %d", a, b)` prints 0 9.',
    ],
    answer: 'b | 0 → -1 → 9 on top of a | 0. Output: 0 9.',
    mistake: 'Thinking -1 is false. In C only 0 is false; negative numbers are true.',
    tryIt: { q: 'Diagram and output: `int a = 2; int b = 3; if (b--) { a += b; } printf("%d %d", a, b);`', a: 'b | 3 → 2 on top of a | 2 → 4. `b--` tests the old 3 (true) and stores 2; then a = 2 + 2 = 4. Output: 4 2.' },
  };

  H['l3-exam-q2-diagram'] = {
    asks: 'Draw the array and the pointer `p` with its arrow, then say what is printed.',
    idea: 'Pointer arithmetic counts in elements, not bytes: `arr + 1` means "one int further along". Picture `arr` as a box with an arrow to the row of cells, and `p` as a second arrow into that row.',
    steps: [
      '`int arr[] = {10, 20, 30, 40};` makes four int cells in a row. In her diagram `arr` is a box with an unknown address (?) and an arrow to the cells.',
      '`int *p;` makes a box that will hold an address. No arrow yet.',
      '`p = arr + 1;` starts at cell 0 and moves one int along (4 bytes on this machine), so p’s arrow lands on 20.',
      '`*p + 2`: `*p` follows the arrow and reads 20, then 2 is added. The `*` binds before `+`, so it is (*p) + 2 = 22.',
      { text: 'The diagram:', table: { head: ['name', 'value'], rows: [['p', '?? → the 20'], ['arr', '? → [ 10 | 20 | 30 | 40 ]']] } },
    ],
    answer: 'arr points at the four cells, p’s arrow points at the 20 (arr + 1), and the output is 22.',
    mistake: 'Reading `*p + 2` as `*(p + 2)`, which would be 40. Without parentheses, `*` grabs only `p`, and then 2 is added to the number.',
    tryIt: { q: '`int arr[] = {5, 10, 15, 20}; int *p; p = arr + 2; printf("%d", *(p - 1) * 2);` Where does p point, and what prints?', a: 'p points at 15. p - 1 points at 10, so it prints 10 * 2 = 20.' },
  };

  H['l3-exam-q3-diagram'] = {
    asks: 'Draw main’s box x and money’s boxes p and q, show where p’s arrow goes, and give the output.',
    idea: 'A called function gets fresh boxes on top of the caller’s. p is money’s own box that happens to hold x’s address. Re-pointing p redraws that arrow; it never touches x.',
    steps: [
      '`int x = 10;` main’s box: x = 10.',
      '`money(&x)` stacks money’s boxes on top. p receives a COPY of x’s address, so draw p with an arrow to x.',
      '`int q = 100;` another box on top: q = 100.',
      '`p = &q;` changes what is in p: cross out the arrow to x and draw a new arrow to q. Nothing was written into x.',
      { text: 'The diagram just before money returns:', table: { head: ['name', 'value'], rows: [['q', '100'], ['p', '? → x (crossed out), then → q'], ['x', '10']] } },
      'money returns, its boxes p and q disappear, and main prints x: still 10.',
    ],
    answer: 'q | 100, p | ? → x then → q, x | 10. Output: 10.',
    mistake: 'Thinking p "is" x because it pointed at x. `p = &q` changes p only. Writing through the arrow, `*p = ...`, is the only way to change x.',
    tryIt: { q: 'Same main, but `void cash(int *p) { int q = 50; *p = q; p = &q; }`. Diagram and output?', a: 'q | 50, p | ? → x then → q, x | 10 → 50. `*p = q` writes 50 into x BEFORE p is re-pointed. Output: 50.' },
  };

  H['l3-why-money'] = {
    asks: 'Explain why re-pointing p inside money leaves main’s x alone, and say which line would actually change x.',
    idea: 'C passes every argument by value: the function gets a copy. When the argument is an address, the copy is a second arrow to the same box. You can write through that arrow (`*p = ...`) or swing it somewhere else (`p = ...`). Only the first one reaches x.',
    steps: [
      '`money(&x)` copies x’s address into money’s own parameter p. p is a separate box that holds that address.',
      '`p = &q;` overwrites p’s copy with q’s address. main’s x got nothing.',
      '`*p = 100;` would follow p’s arrow and write 100 into the box it points at, which is x.',
      { text: 'The two lines side by side:', code: 'void money(int *p) {\n    int q = 100;\n    p = &q;     /* moves the arrow: x unchanged */\n}\n\nvoid money2(int *p) {\n    *p = 100;   /* writes through the arrow: x becomes 100 */\n}' },
      'gcc with `-Wall -Wextra` even warns "parameter p set but not used" for money: the compiler can see that line has no effect outside.',
    ],
    answer: 'C passes by value, so p is a local copy of x’s address; `p = &q` changes only the copy. To change x, assign through the pointer: `*p = 100;`',
    mistake: 'Writing `p = 100;` (that stores 100 as an address). The star is what means "the box p points at".',
    tryIt: { q: '`void reset(int *p) { int zero = 0; p = &zero; }` Does `reset(&x)` set x to 0? If not, fix it.', a: 'No: it only re-points the copy p, so x keeps its value. Fix: `void reset(int *p) { *p = 0; }`' },
  };

  H['l3-malloc-free'] = {
    asks: 'Name the two C library calls that get memory while the program runs and give it back.',
    idea: 'Ordinary local variables live on the stack and vanish when their function ends. Memory asked for at run time comes from the heap and stays until YOU release it. One call grabs, one call releases.',
    steps: [
      '`malloc(n)` (from stdlib) reserves n bytes on the heap and returns a pointer to them, or NULL if there is not enough memory.',
      '`free(p)` gives the whole block back so it can be reused. You cannot free only part of a block.',
      { text: 'The usual pattern:', code: '#include <stdlib.h>\n\nint *nums = malloc(5 * sizeof(int));  /* room for 5 ints */\nif (nums == NULL) { return 1; }       /* always check */\n*nums = 42;\nfree(nums);                           /* release it */' },
      'Forget `free` and the memory leaks until the program ends. Use the pointer after `free` and it is a dangling pointer: undefined behaviour.',
    ],
    answer: 'malloc (grabs heap memory) and free (releases it).',
    mistake: 'Answering `new` and `delete`: those are C++ words, not C.',
    tryIt: { q: 'Which stdlib call grabs memory like malloc but also sets it all to zero, and how do its arguments differ?', a: 'calloc. It takes a count and an item size, e.g. `calloc(5, sizeof(int))`, instead of one total size in bytes.' },
  };

  H['l3-reverse-string'] = {
    asks: 'Write a function that flips a string in its own memory ("stop" becomes "pots"), moving pointers instead of using `s[i]`.',
    idea: 'Put one finger on the first character and one on the last. Swap what they point at, move the fingers toward each other, and stop when they meet. The only tricky part is finding the last character: walk to the null, then step back one.',
    steps: [
      'Variables: `char temp` for the swap, and `char *endString` that starts at the same place as `theString`.',
      'Find the end: `while (*endString) endString++;` stops ON the null, because the null is 0, which is false.',
      '`endString--;` steps back onto the last real character. Without it, the null would be swapped to the front and the string would look empty.',
      'Swap through temp, then `theString++` and `endString--`. Loop while `theString < endString`: once they meet or cross, every pair is done (an odd middle character stays put).',
      { text: 'Trace on "stop" (positions 0 to 3, null at 4):', table: { head: ['pass', 'theString at', 'endString at', 'string after'], rows: [['find end', '0', '4 (null), back to 3', 'stop'], ['1', '0', '3', 'ptos'], ['2', '1', '2', 'pots'], ['done', '2', '1 (crossed)', 'pots']] } },
      { text: 'The whole function:', code: 'void reverseString(char *theString){\n    char temp;\n    char *endString;\n    endString = theString;\n    while (*endString){\n        endString++;\n    }\n    endString--;\n    while (theString < endString){\n        temp = *theString;\n        *theString = *endString;\n        *endString = temp;\n        endString--;\n        theString++;\n    }\n}' },
    ],
    answer: '`endString` walks to the null and backs up one; then, while `theString < endString`, swap `*theString` and `*endString` through `temp` and move `theString++` and `endString--`.',
    mistake: 'Forgetting `endString--` after the find-the-end loop (the null gets swapped to the front), or looping until the two pointers are equal: on an even-length string they jump past each other and never land on the same spot, so the loop runs off the string.',
    tryIt: { q: 'Run reverseString on "abcde". How many swaps happen, and which character never moves?', a: '2 swaps (a with e, then b with d). Then both pointers sit on c, `theString < endString` is false, and c stays in the middle. Result: "edcba".' },
  };

  H['l3-length'] = {
    asks: 'Return how many characters come before the null, using only pointers.',
    idea: 'Walk a second pointer from the start to the null, then subtract the two addresses. Subtracting pointers into the same array gives a count of elements, just as adding an int moves by elements.',
    steps: [
      '`char *end = s;` both pointers start on the first character.',
      '`while (*end) end++;` moves end until it sits on the null (0 is false).',
      '`return end - s;` is the number of steps end took, which is the number of characters.',
      { text: 'Trace on "hello":', table: { head: ['end at', '*end', 'what happens'], rows: [['0 to 4', 'h, e, l, l, o', 'nonzero, so end++'], ['5', 'null', 'stop: end - s = 5']] } },
      'An empty string "" stops at once: end - s = 0.',
    ],
    answer: '`char *end = s; while (*end) end++; return end - s;` gives 5 for "hello" and 0 for "".',
    mistake: 'Returning `end - s + 1` (that counts the null), or returning `*end`, which is the null character itself (0), not the length.',
    tryIt: { q: 'With the same walk, write `char last(char *s)` that returns the last real character (assume s is not empty). What is `last("pointer")`?', a: '`char *end = s; while (*end) end++; end--; return *end;` and `last("pointer")` is r.' },
  };

  H['l3-count-char'] = {
    asks: 'Walk through the string and count how many characters equal c.',
    idea: 'One pointer, one counter. Each pass: look at `*s`, count it if it matches, step s forward. The null ends the loop.',
    steps: [
      '`int count = 0;` start counting from zero.',
      '`while (*s)` keeps going until s sits on the null.',
      '`if (*s == c) count++;` compares the character s points at, not the pointer itself.',
      '`s++` moves to the next character. s is countChar’s own copy of the address, so moving it does not move the caller’s pointer.',
      { text: 'Trace on "banana" with c = a:', table: { head: ['*s', 'match?', 'count'], rows: [['b', 'no', '0'], ['a', 'yes', '1'], ['n', 'no', '1'], ['a', 'yes', '2'], ['n', 'no', '2'], ['a', 'yes', '3'], ['null', 'loop ends', 'return 3']] } },
    ],
    answer: 'Counter at 0; while *s is not the null, add 1 when *s == c, then s++; return the count ("banana", a gives 3).',
    mistake: 'Writing `if (s == c)`, which compares an address with a character, or forgetting `s++`, so the loop never ends.',
    tryIt: { q: 'Write `void replaceChar(char *s, char from, char to)` with pointers only. What does "banana" become with from = a, to = o?', a: '`while (*s) { if (*s == from) *s = to; s++; }` turns "banana" into "bonono". It writes into the string, so call it on an array like `char t[] = "banana";`, never on a string literal.' },
  };

  H['l3-ptr-inc'] = {
    asks: 'Track a and b through four lines where a is changed through a pointer.',
    idea: 'p holds a’s address, so `*p` is just another name for the box a. Anything done to `*p` is done to a.',
    steps: [
      { text: 'Trace (→ a means "arrow to a"):', table: { head: ['line', 'a', 'p', '*p', 'b'], rows: [['int a = 5;', '5', '–', '–', '–'], ['int *p = &a;', '5', '→ a', '5', '–'], ['*p += 3;', '8', '→ a', '8', '–'], ['int b = *p * 2;', '8', '→ a', '8', '16']] } },
      '`*p += 3` follows the arrow to a and adds 3 there: a becomes 8.',
      'In `*p * 2` the first `*` means "contents of p" (8) and the second is multiply: 8 * 2 = 16.',
      '`printf` prints a, then b: 8 16.',
    ],
    answer: '8 16: `*p += 3` changes a itself to 8, and b = 8 * 2 = 16.',
    mistake: 'Printing 5 for a because "only `*p` changed". `*p` IS a.',
    tryIt: { q: '`int a = 2; int *p = &a; *p = *p * 5; int b = *p - a; printf("%d %d", a, b);`', a: '10 0. `*p = *p * 5` makes a 10, and `*p - a` is a - a = 0.' },
  };

  H['l3-diagram-ptrinc'] = {
    asks: 'Draw boxes a, p and b (newest on top) as they stand after the last line.',
    idea: 'Changing `*p` crosses out a value in the box p points AT. p’s own box (the arrow) never changes in this code.',
    steps: [
      '`int a = 5;` bottom box: a = 5.',
      '`int *p = &a;` box p on top, holding an unknown address (?), drawn as an arrow to a.',
      '`*p += 3;` follow the arrow: cross out a’s 5 and write 8. p is untouched.',
      '`int b = *p * 2;` new box b on top: 8 * 2 = 16.',
      { text: 'The diagram:', table: { head: ['name', 'value'], rows: [['b', '16'], ['p', '? → a'], ['a', '5 → 8']] } },
    ],
    answer: 'b | 16, p | ? → a, a | 5 → 8 (bottom to top: a, p, b).',
    mistake: 'Writing 8 in p’s box. p holds an address; the 8 goes in the box it points at.',
    tryIt: { q: 'Diagram after: `int m = 4; int *r = &m; *r -= 1; int n = *r + m;`', a: 'n | 6, r | ? → m, m | 4 → 3. `*r` and m are both 3, so n = 3 + 3 = 6.' },
  };

  H['l3-swap-out'] = {
    asks: 'swap gets the addresses of c and d. Decide whether c and d really get exchanged.',
    idea: 'With the addresses, swap can reach into main’s boxes: `*x` is c and `*y` is d. Writing to `*x` and `*y` writes to c and d.',
    steps: [
      '`swap(&c, &d)`: x holds c’s address, y holds d’s.',
      '`int t = *x;` saves a copy of c: t = 1.',
      '`*x = *y;` writes d’s 2 into c. `*y = t;` writes the saved 1 into d.',
      { text: 'Trace:', table: { head: ['line', 'c', 'd', 't'], rows: [['start', '1', '2', '–'], ['int t = *x;', '1', '2', '1'], ['*x = *y;', '2', '2', '1'], ['*y = t;', '2', '1', '1']] } },
    ],
    answer: '2 1: swap writes through the pointers, so c and d themselves are exchanged.',
    mistake: 'Dropping the temp: `*x = *y; *y = *x;` gives 2 2, because c’s old 1 was overwritten before it could be copied.',
    tryIt: { q: 'Same main, but `void swap2(int x, int y) { int t = x; x = y; y = t; }` called as `swap2(c, d)`. What prints?', a: '1 2. swap2 gets copies of the numbers and swaps its own copies; main’s c and d never change.' },
  };

  H['l3-diagram-swap'] = {
    asks: 'Draw main’s boxes and swap’s boxes as they are just before swap returns.',
    idea: 'swap’s boxes go on top of main’s. x and y are arrows down into main’s c and d, so every `*x =` or `*y =` crosses out a value down in main’s part of the stack.',
    steps: [
      'main: c = 1 at the bottom, d = 2 above it.',
      'The call puts swap’s x (arrow to c) and y (arrow to d) on top.',
      '`int t = *x;` puts t = 1 on top.',
      '`*x = *y;` c: cross out 1, write 2. `*y = t;` d: cross out 2, write 1.',
      { text: 'The diagram, newest on top:', table: { head: ['name', 'value'], rows: [['t', '1'], ['y', '? → d'], ['x', '? → c'], ['d', '2 → 1'], ['c', '1 → 2']] } },
    ],
    answer: 't | 1, y | ? → d, x | ? → c, d | 2 → 1, c | 1 → 2 (swap’s boxes above main’s).',
    mistake: 'Crossing out values in x and y. Their arrows never move; the changes land in c and d.',
    tryIt: { q: 'Draw the stack just before addTo returns, then give the output: `void addTo(int *x, int y) { *x = *x + y; y = 0; }` with main `int c = 4; int d = 6; addTo(&c, d); printf("%d %d", c, d);`', a: 'y | 6 → 0, x | ? → c, d | 6, c | 4 → 10. Output: 10 6. c changed through the pointer, but y was only a copy of d.' },
  };

  H['l3-setto'] = {
    asks: 'Decide whether setTo changes main’s x.',
    idea: 'Look for a star on the left of `=`. `p = ...` swings setTo’s own arrow; only `*p = ...` writes into the box the arrow points at.',
    steps: [
      '`setTo(&x)`: p is a copy of x’s address (an arrow to x).',
      '`int q = 7;` a local box inside setTo.',
      '`p = &q;` re-points the copy to q. There is no `*p =` anywhere, so x is never written.',
      'setTo returns, p and q vanish, and x is still 3.',
    ],
    answer: '3: `p = &q` only re-points setTo’s copy of the address.',
    mistake: 'Answering 7 because p "was" x. Moving an arrow does not move a value.',
    tryIt: { q: '`void setTo2(int *p) { int q = 7; p = &q; *p = 1; }` With x = 3, what does main print after `setTo2(&x)`?', a: '3 again. `*p = 1` does write through the pointer, but by then p points at q, so q becomes 1 and x is untouched.' },
  };

  H['l3-addten'] = {
    asks: 'Decide what x is after addTen runs.',
    idea: '`*p += 10` has the star: it follows the arrow into main’s x and adds 10 there.',
    steps: [
      'main: x = 5. `addTen(&x)` gives p an arrow to x.',
      '`*p += 10;` means `*p = *p + 10`: read x (5), add 10, store 15 back in x.',
      { text: 'The diagram:', table: { head: ['name', 'value'], rows: [['p', '? → x'], ['x', '5 → 15']] } },
      'Compare setTo and money: they assign to p (no star) and change nothing in main.',
    ],
    answer: '15: addTen writes through the pointer, so main’s x becomes 5 + 10.',
    mistake: 'Thinking a C function can never change the caller’s variables. It can, when it is given an address and writes through it.',
    tryIt: { q: '`void twice(int *p) { *p += *p; }` With `int x = 3; twice(&x); twice(&x);` what is x?', a: '12. First call: 3 + 3 = 6. Second call: 6 + 6 = 12.' },
  };

  H['l3-arr-ptr'] = {
    asks: 'Follow a pointer into the middle of an array and print two values.',
    idea: '`arr + 2` is two ints along; `q - 1` is one int back. `*` reads the cell under the arrow.',
    steps: [
      { text: 'The array and where each pointer lands:', table: { head: ['index', '0', '1', '2', '3'], rows: [['value', '4', '8', '15', '16'], ['pointer', 'arr', 'q - 1', 'q', '']] } },
      '`int *q = arr + 2;` q points at index 2, the 15. So `*q` is 15.',
      '`*(q - 1) + 1`: the parentheses move first (to index 1, the 8), then `*` reads 8, then + 1 gives 9.',
    ],
    answer: '15 9: q points at 15; q - 1 points at 8, and 8 + 1 = 9.',
    mistake: 'Treating `arr + 2` as 2 bytes along, or mixing up `*(q - 1)` (move back, then read) with `*q - 1` (read 15, then subtract).',
    tryIt: { q: '`int arr[] = {3, 6, 9, 12}; int *q = arr + 3; printf("%d %d", *q, *(q - 3) + 1);`', a: '12 4. q points at 12; q - 3 is back at index 0 (the 3), and 3 + 1 = 4.' },
  };

  H['l3-arr-mod'] = {
    asks: 'Write into the array through a pointer, move the pointer, then print three values.',
    idea: '`*(p + k)` and `p[k]` name the same cell. Writing through a pointer changes the array itself; `p++` moves the arrow, not the data.',
    steps: [
      { text: 'Trace:', table: { head: ['line', 'arr', 'p points at'], rows: [['int *p = arr;', '{1, 2, 3}', 'index 0'], ['*(p + 1) = 9;', '{1, 9, 3}', 'index 0'], ['p++;', '{1, 9, 3}', 'index 1']] } },
      '`arr[1]` is 9 (written through the pointer).',
      '`*p`: p now points at index 1, so 9.',
      '`*(p + 1)`: one past p is index 2, so 3.',
    ],
    answer: '9 9 3',
    mistake: 'Thinking `p++` adds 1 to the value p points at. `p++` moves the arrow; `(*p)++` would change the value.',
    tryIt: { q: '`int arr[] = {5, 6, 7}; int *p = arr + 2; *(p - 2) = 0; p--; printf("%d %d %d", arr[0], *p, *(p - 1));`', a: '0 6 0. `*(p - 2)` is arr[0], set to 0; `p--` moves to arr[1] (6); `*(p - 1)` is arr[0], now 0.' },
  };

  H['l3-alias'] = {
    asks: 'Two pointers share one address. Find what x and *p show after writing through q.',
    idea: 'Copying a pointer copies the arrow, not the box. p and q both point at x, so there is still only one int. That is aliasing: several names for one cell.',
    steps: [
      { text: 'Trace:', table: { head: ['line', 'x', 'p', 'q'], rows: [['int x = 1;', '1', '–', '–'], ['int *p = &x;', '1', '→ x', '–'], ['int *q = p;', '1', '→ x', '→ x'], ['*q = 7;', '7', '→ x', '→ x']] } },
      '`*q = 7` follows q’s arrow, which ends at x, so x becomes 7.',
      '`*p` follows p’s arrow to the same box: also 7.',
    ],
    answer: '7 7: x, *p and *q are all the same cell.',
    mistake: 'Thinking `int *q = p;` makes a new int that q owns. No new int was declared; q is just a second arrow.',
    tryIt: { q: '`int x = 2; int *p = &x; int *q = p; *p = *q + 3; x = x * 2; printf("%d %d", *p, *q);`', a: '10 10. `*q` is x (2), so x becomes 5, then x = 10; *p and *q both read x.' },
  };

  H['l3-predec'] = {
    asks: 'Decide which branch runs and what n ends as.',
    idea: 'Pre-decrement stores first, and then the new value is tested. Here the new value is 0, and 0 is the one false value in C.',
    steps: [
      { text: 'Trace:', table: { head: ['line', 'n'], rows: [['int n = 1;', '1'], ['if (--n)', '0 (false)'], ['else: n -= 5;', '-5']] } },
      '`--n` makes n 0 before the test. 0 is false, so the else runs.',
      '`n -= 5` starts from the new 0: 0 - 5 = -5.',
    ],
    answer: '-5: `--n` stores 0, which is false, so the else does 0 - 5.',
    mistake: 'Testing the old value 1 (that is what `n--` would do), or forgetting that `--n` already changed n before `n -= 5`.',
    tryIt: { q: 'Same code with `if (n--)` instead of `if (--n)`. What prints?', a: '5. `n--` tests the old 1 (true), then stores 0; the then-branch does 0 + 5 = 5.' },
  };

  H['l3-walk'] = {
    asks: 'A pointer walks along "cat" until the loop stops. How far did it go?',
    idea: 'A string stored in an array gets a hidden null at the end. The loop slides e until it lands on that null; subtracting the start address gives how many steps it took.',
    steps: [
      { text: '`char s[] = "cat";` makes four chars:', table: { head: ['index', '0', '1', '2', '3'], rows: [['char', 'c', 'a', 't', 'null']] } },
      '`char *e = s;` e starts at index 0.',
      '`while (*e) e++;` c, a and t are nonzero, so e moves on; at index 3 it reads the null (0, false) and stops.',
      '`e - s` is 3. The `(int)` cast is there because a pointer difference is not an int type, and `%d` needs an int.',
    ],
    answer: '3: e stops on the null, three chars along from s.',
    mistake: 'Counting the null and answering 4. That is `sizeof(s)`, the array size, not the distance e travelled.',
    tryIt: { q: '`char s[] = "pizza"; char *e = s; while (*e != \'z\') e++; printf("%d", (int)(e - s));`', a: '2. e stops on the first z, at index 2.' },
  };

  H['l3-malloc-trace'] = {
    asks: 'One int is made on the heap and reached through two pointers. What does *p show?',
    idea: '`malloc` makes one unnamed int on the heap and p holds its address. `q = p` copies the arrow, so both pointers reach the same int.',
    steps: [
      { text: 'Trace:', table: { head: ['line', 'p', 'q', 'heap int'], rows: [['int *p = malloc(sizeof(int));', '→ heap', '–', '?'], ['*p = 4;', '→ heap', '–', '4'], ['int *q = p;', '→ heap', '→ heap', '4'], ['*q += 1;', '→ heap', '→ heap', '5']] } },
      'The heap int starts unknown (malloc does not clear it), then `*p = 4` fills it.',
      '`*q += 1` changes that one int to 5, so `*p` prints 5.',
      '`free(p)` releases the block once. After that, using *p or *q is undefined behaviour (dangling pointers), and `free(q)` as well would free it twice.',
    ],
    answer: '5: p and q point at the same heap int, so q’s change shows through p.',
    mistake: 'Thinking `int *q = p;` copies the int, so *p would still be 4. Only the address was copied.',
    tryIt: { q: '`int *p = malloc(2 * sizeof(int)); *p = 3; *(p + 1) = *p * 2; int *q = p + 1; *q -= 1; printf("%d %d", *p, *q); free(p);`', a: '3 5. The block holds 3 and 6; q points at the second int, which becomes 5. Free with p, the address malloc returned, not with q.' },
  };
})(globalThis.FC = globalThis.FC || {});
