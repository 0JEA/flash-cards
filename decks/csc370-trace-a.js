// Step-through traces for CSC 370 code cards, batch A (format: js/trace.js header).
// Same rules as decks/csc370-trace.js: one executed line per step, state after it ran,
// and the printed output (or the final result) equals the card's answer.
(function (FC) {
  'use strict';
  const T = FC.trace = FC.trace || {};

  T['l3-banana-out'] = [
    { line: 1, note: 'banana starts at 13.', frames: [{ fn: 'main', vars: { banana: 13 } }] },
    { line: 2, note: '++banana is a pre-increment: banana becomes 14 first, then 14 - 7 = 7. Any nonzero number counts as true in C, so the if branch runs.',
      frames: [{ fn: 'main', vars: { banana: 14 } }] },
    { line: 3, note: 'The if branch prints Boogy Boogy. The else branch is skipped entirely.',
      frames: [{ fn: 'main', vars: { banana: 14 } }], out: 'Boogy Boogy' },
  ];

  T['l3-banana-val'] = [
    { line: 1, note: 'banana starts at 13.', frames: [{ fn: 'main', vars: { banana: 13 } }] },
    { line: 2, note: '++banana changes banana itself to 14 before the subtraction. The condition 14 - 7 = 7 is nonzero, so it is true. The subtraction does not store anything.',
      frames: [{ fn: 'main', vars: { banana: 14 } }] },
    { line: 3, note: 'The if branch prints, which does not touch banana. Only the ++ in the condition ever changed it, so banana ends at 14.',
      frames: [{ fn: 'main', vars: { banana: 14 } }], out: 'Boogy Boogy', result: '14' },
  ];

  T['l3-ptr-inc'] = [
    { line: 1, note: 'a gets 5.', frames: [{ fn: 'main', vars: { a: 5 } }] },
    { line: 2, note: 'p stores the address of a, so p points at a.', frames: [{ fn: 'main', vars: { a: 5, p: { to: 'a' } } }] },
    { line: 3, note: '*p += 3 follows p to a and adds 3 there. a itself becomes 8; p still points at a.',
      frames: [{ fn: 'main', vars: { a: 8, p: { to: 'a' } } }] },
    { line: 4, note: '*p reads a, which is now 8, so b = 8 * 2 = 16. The * before p is a dereference; the second * is multiplication.',
      frames: [{ fn: 'main', vars: { a: 8, p: { to: 'a' }, b: 16 } }] },
    { line: 5, note: 'Prints a and b: 8 16. a changed even though the code never wrote a = ..., because p is another way to reach it.',
      frames: [{ fn: 'main', vars: { a: 8, p: { to: 'a' }, b: 16 } }], out: '8 16' },
  ];

  T['l3-setto'] = [
    { line: 6, note: 'main makes x and gives it 3.', frames: [{ fn: 'main', vars: { x: 3 } }] },
    { line: 1, note: 'setTo is called with the address of x, so its parameter p points at x. p itself is a local copy of that address.',
      frames: [{ fn: 'main', vars: { x: 3 } }, { fn: 'setTo(&x)', vars: { p: { to: 'x' } } }] },
    { line: 2, note: 'setTo makes its own local q = 7.',
      frames: [{ fn: 'main', vars: { x: 3 } }, { fn: 'setTo(&x)', vars: { p: { to: 'x' }, q: 7 } }] },
    { line: 3, note: 'p = &q changes the local pointer p to aim at q. Nothing is written through p, so x is untouched. Changing *p would change x; changing p does not.',
      frames: [{ fn: 'main', vars: { x: 3 } }, { fn: 'setTo(&x)', vars: { p: { to: 'q' }, q: 7 } }] },
    { line: 4, note: 'setTo returns and its p and q disappear. x was never written, so it is still 3.',
      frames: [{ fn: 'main', vars: { x: 3 } }] },
    { line: 8, note: 'Prints x: 3.', frames: [{ fn: 'main', vars: { x: 3 } }], out: '3' },
  ];

  T['l3-addten'] = [
    { line: 5, note: 'main makes x and gives it 5.', frames: [{ fn: 'main', vars: { x: 5 } }] },
    { line: 1, note: 'addTen is called with the address of x, so p points at main’s x.',
      frames: [{ fn: 'main', vars: { x: 5 } }, { fn: 'addTen(&x)', vars: { p: { to: 'x' } } }] },
    { line: 2, note: '*p += 10 follows p to x and adds 10 there, so main’s x becomes 15. This is pass by address: the function writes into the caller’s variable.',
      frames: [{ fn: 'main', vars: { x: 15 } }, { fn: 'addTen(&x)', vars: { p: { to: 'x' } } }] },
    { line: 3, note: 'addTen returns. p is gone, but the change it made to x stays.',
      frames: [{ fn: 'main', vars: { x: 15 } }] },
    { line: 7, note: 'Prints x: 15.', frames: [{ fn: 'main', vars: { x: 15 } }], out: '15' },
  ];

  T['l3-arr-ptr'] = [
    { line: 1, note: 'arr holds 4, 8, 15, 16 at indexes 0 to 3.', frames: [{ fn: 'main', vars: { arr: [4, 8, 15, 16] } }] },
    { line: 2, note: 'arr + 2 is pointer arithmetic: it moves two ints forward from arr[0], so q points at arr[2], not at the number 2.',
      frames: [{ fn: 'main', vars: { arr: [4, 8, 15, 16], q: { to: 'arr[2]' } } }] },
    { line: 3, note: '*q reads arr[2] = 15. q - 1 points at arr[1], so *(q - 1) is 8, and + 1 makes 9. The + 1 is outside the brackets, so it adds to the value, not the address.',
      frames: [{ fn: 'main', vars: { arr: [4, 8, 15, 16], q: { to: 'arr[2]' } } }], out: '15 9' },
  ];

  T['l3-arr-mod'] = [
    { line: 1, note: 'arr holds 1, 2, 3.', frames: [{ fn: 'main', vars: { arr: [1, 2, 3] } }] },
    { line: 2, note: 'An array name used as a value is the address of its first element, so p points at arr[0].',
      frames: [{ fn: 'main', vars: { arr: [1, 2, 3], p: { to: 'arr[0]' } } }] },
    { line: 3, note: 'p + 1 is the address of arr[1]; writing 9 through it changes arr[1] to 9. p itself does not move.',
      frames: [{ fn: 'main', vars: { arr: [1, 9, 3], p: { to: 'arr[0]' } } }] },
    { line: 4, note: 'p++ moves the pointer one int forward, so p now points at arr[1]. The array values do not change.',
      frames: [{ fn: 'main', vars: { arr: [1, 9, 3], p: { to: 'arr[1]' } } }] },
    { line: 5, note: 'arr[1] is 9; *p is also arr[1], so 9; p + 1 now points at arr[2], so *(p + 1) is 3.',
      frames: [{ fn: 'main', vars: { arr: [1, 9, 3], p: { to: 'arr[1]' } } }], out: '9 9 3' },
  ];

  T['l3-alias'] = [
    { line: 1, note: 'x gets 1.', frames: [{ fn: 'main', vars: { x: 1 } }] },
    { line: 2, note: 'p stores the address of x.', frames: [{ fn: 'main', vars: { x: 1, p: { to: 'x' } } }] },
    { line: 3, note: 'q = p copies the address, not the value. Now p and q both point at the same x: they are aliases.',
      frames: [{ fn: 'main', vars: { x: 1, p: { to: 'x' }, q: { to: 'x' } } }] },
    { line: 4, note: '*q = 7 writes 7 into x through q. Since p points at the same x, *p now also reads 7.',
      frames: [{ fn: 'main', vars: { x: 7, p: { to: 'x' }, q: { to: 'x' } } }] },
    { line: 5, note: 'x is 7 and *p reads that same x, so it prints 7 7.',
      frames: [{ fn: 'main', vars: { x: 7, p: { to: 'x' }, q: { to: 'x' } } }], out: '7 7' },
  ];

  T['l3-predec'] = [
    { line: 1, note: 'n starts at 1.', frames: [{ fn: 'main', vars: { n: 1 } }] },
    { line: 2, note: '--n is a pre-decrement: n drops to 0 first, and the condition uses that new 0. Zero is false in C, so the else branch runs.',
      frames: [{ fn: 'main', vars: { n: 0 } }] },
    { line: 5, note: 'The else branch subtracts 5 from the current n, which is already 0, giving -5.',
      frames: [{ fn: 'main', vars: { n: -5 } }] },
    { line: 7, note: 'Prints n: -5.', frames: [{ fn: 'main', vars: { n: -5 } }], out: '-5' },
  ];

  const cat = ["'c'", "'a'", "'t'", "'\\0'"];
  T['l3-walk'] = [
    { line: 1, note: 'A string literal stores its characters plus a hidden null terminator, so s has 4 chars: c, a, t, and \\0.',
      frames: [{ fn: 'main', vars: { s: cat } }] },
    { line: 2, note: 'e starts at the first character, s[0].', frames: [{ fn: 'main', vars: { s: cat, e: { to: 's[0]' } } }] },
    { line: 3, note: '*e is the char c. Any nonzero char counts as true, so the loop body runs.',
      frames: [{ fn: 'main', vars: { s: cat, e: { to: 's[0]' } } }] },
    { line: 4, note: 'e++ moves e one char forward, to s[1].', frames: [{ fn: 'main', vars: { s: cat, e: { to: 's[1]' } } }] },
    { line: 3, note: '*e is now a, still nonzero, so the loop runs again.', frames: [{ fn: 'main', vars: { s: cat, e: { to: 's[1]' } } }] },
    { line: 4, note: 'e moves to s[2].', frames: [{ fn: 'main', vars: { s: cat, e: { to: 's[2]' } } }] },
    { line: 4, note: 'Third iteration, compressed: *e is t, nonzero, so the body runs once more and e moves to s[3].',
      frames: [{ fn: 'main', vars: { s: cat, e: { to: 's[3]' } } }] },
    { line: 3, note: '*e is the null terminator, which is 0, so the condition is false and the loop stops with e at s[3].',
      frames: [{ fn: 'main', vars: { s: cat, e: { to: 's[3]' } } }] },
    { line: 6, note: 'Subtracting two pointers into the same array counts the elements between them: s[3] minus s[0] is 3, the string length without the null.',
      frames: [{ fn: 'main', vars: { s: cat, e: { to: 's[3]' } } }], out: '3' },
  ];

  T['l3-malloc-trace'] = [
    { line: 1, note: 'malloc reserves room for one int on the heap, its contents not yet set, and p holds its address.',
      frames: [{ fn: 'main', vars: { p: { to: 'block 1' } } }, { fn: 'heap', vars: { 'block 1': '?' } }] },
    { line: 2, note: '*p = 4 writes 4 into the heap block. p is just the address; the 4 lives in the block.',
      frames: [{ fn: 'main', vars: { p: { to: 'block 1' } } }, { fn: 'heap', vars: { 'block 1': 4 } }] },
    { line: 3, note: 'q = p copies the address, so q points at the same heap block. There is still only one int.',
      frames: [{ fn: 'main', vars: { p: { to: 'block 1' }, q: { to: 'block 1' } } }, { fn: 'heap', vars: { 'block 1': 4 } }] },
    { line: 4, note: '*q += 1 adds 1 to the shared block, making it 5. Reading through p sees the same change.',
      frames: [{ fn: 'main', vars: { p: { to: 'block 1' }, q: { to: 'block 1' } } }, { fn: 'heap', vars: { 'block 1': 5 } }] },
    { line: 5, note: '*p reads the block, which is 5.',
      frames: [{ fn: 'main', vars: { p: { to: 'block 1' }, q: { to: 'block 1' } } }, { fn: 'heap', vars: { 'block 1': 5 } }], out: '5' },
    { line: 6, note: 'free(p) gives the block back. p and q still hold the old address, but both now dangle and must not be used.',
      frames: [{ fn: 'main', vars: { p: { to: 'block 1' }, q: { to: 'block 1' } } }, { fn: 'heap', vars: { 'block 1': 'freed' } }] },
  ];
})(globalThis.FC = globalThis.FC || {});
