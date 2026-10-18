// Step-through traces for CSC 370 code cards, shown in Help (format: js/trace.js header).
// Each trace follows the card's displayed `code`, one executed line per step, and its
// printed output must equal the card's answer (tests/trace.test.js checks that, and that
// every line number exists). Notes: one plain sentence about what that line did and why;
// no meta chatter.
(function (FC) {
  'use strict';
  const T = FC.trace = FC.trace || {};

  T['l3-swap-out'] = [
    { line: 7, note: 'main makes c and gives it 1.', frames: [{ fn: 'main', vars: { c: 1 } }] },
    { line: 8, note: 'main makes d and gives it 2.', frames: [{ fn: 'main', vars: { c: 1, d: 2 } }] },
    { line: 1, note: 'swap is called with the ADDRESSES of c and d, so x points at c and y points at d.',
      frames: [{ fn: 'main', vars: { c: 1, d: 2 } }, { fn: 'swap(&c, &d)', vars: { x: { to: 'c' }, y: { to: 'd' } } }] },
    { line: 2, note: 't gets *x: follow x to c and read 1.',
      frames: [{ fn: 'main', vars: { c: 1, d: 2 } }, { fn: 'swap(&c, &d)', vars: { x: { to: 'c' }, y: { to: 'd' }, t: 1 } }] },
    { line: 3, note: '*x = *y: read d (2) through y and write it into c through x. main’s c changes.',
      frames: [{ fn: 'main', vars: { c: 2, d: 2 } }, { fn: 'swap(&c, &d)', vars: { x: { to: 'c' }, y: { to: 'd' }, t: 1 } }] },
    { line: 4, note: '*y = t: write the saved 1 into d through y. main’s d changes.',
      frames: [{ fn: 'main', vars: { c: 2, d: 1 } }, { fn: 'swap(&c, &d)', vars: { x: { to: 'c' }, y: { to: 'd' }, t: 1 } }] },
    { line: 5, note: 'swap returns. Its x, y and t are gone, but the writes went to main’s own c and d.',
      frames: [{ fn: 'main', vars: { c: 2, d: 1 } }] },
    { line: 10, note: 'printf prints c and d: 2 1.', frames: [{ fn: 'main', vars: { c: 2, d: 1 } }], out: '2 1' },
  ];

  // Dynamic scoping: a free name is looked up in the CALLER's frame, then its caller, and so on.
  T['l52-kiwi-dynamic'] = [
    { line: 1, note: 'The global kiwi is set to 16.', frames: [{ fn: 'global', vars: { kiwi: 16 } }] },
    { line: 13, note: 'g(3) is called.', frames: [{ fn: 'global', vars: { kiwi: 16 } }, { fn: 'g(3)', vars: { x: 3 } }] },
    { line: 7, note: 'g makes its OWN local kiwi = 12. The global kiwi is still 16.',
      frames: [{ fn: 'global', vars: { kiwi: 16 } }, { fn: 'g(3)', vars: { x: 3, kiwi: 12 } }] },
    { line: 8, note: 'g calls h(x, kiwi) = h(3, 12).',
      frames: [{ fn: 'global', vars: { kiwi: 16 } }, { fn: 'g(3)', vars: { x: 3, kiwi: 12 } }, { fn: 'h(3, 12)', vars: { x: 3, y: 12 } }] },
    { line: 11, note: 'h calls f(y, 2 * x) = f(12, 6).',
      frames: [{ fn: 'global', vars: { kiwi: 16 } }, { fn: 'g(3)', vars: { x: 3, kiwi: 12 } }, { fn: 'h(3, 12)', vars: { x: 3, y: 12 } }, { fn: 'f(12, 6)', vars: { x: 12, y: 6 } }] },
    { line: 4, note: 'f needs kiwi but has none. Dynamic scoping searches the callers, newest first: h has none, g has kiwi = 12. So 12 + 6 + 12 = 30.',
      frames: [{ fn: 'global', vars: { kiwi: 16 } }, { fn: 'g(3)', vars: { x: 3, kiwi: 12 } }, { fn: 'h(3, 12)', vars: { x: 3, y: 12 } }, { fn: 'f(12, 6)', vars: { x: 12, y: 6 } }],
      find: { name: 'kiwi', looked: [3, 2, 1], at: 1 }, out: 'Hi 30' },
  ];
})(globalThis.FC = globalThis.FC || {});
