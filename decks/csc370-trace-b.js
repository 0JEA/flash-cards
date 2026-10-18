// Step-through traces for CSC 370 scoping cards, part B (format: js/trace.js header).
// Same rules as decks/csc370-trace.js: one executed line per step, state after the line ran,
// printed output (or the final result) equals the card's answer. `def`/function-definition
// lines are skipped: nothing happens on them at run time that the stack can show.
(function (FC) {
  'use strict';
  const T = FC.trace = FC.trace || {};

  // C block scope: the while body is its own scope, so its num hides doThis's num.
  {
    const G = { fn: 'global', vars: { i: 89 } };
    const D = (i, num) => ({ fn: 'doThis()', vars: { num: num == null ? 10 : num, i } });
    const B = num => ({ fn: '{ while body }', vars: { num } });
    T['l52-block-trace'] = [
      { line: 1, note: 'A global i is created with 89.', frames: [G] },
      { line: 3, note: 'doThis() is running. It makes its own num = 10.', frames: [G, { fn: 'doThis()', vars: { num: 10 } }] },
      { line: 4, note: 'doThis makes its own i = 1. This local i hides the global i (89), which nothing here touches again.', frames: [G, D(1)] },
      { line: 5, note: 'Test i < num: 1 < 10 using doThis’s i and num. True, so the body runs.', frames: [G, D(1)],
        find: { name: 'num', looked: [1], at: 1 } },
      { line: 6, note: 'Entering the body opens a new block scope. int num = 0 makes a NEW num that hides doThis’s num inside the braces.', frames: [G, D(1), B(0)] },
      { line: 7, note: 'num++ finds the nearest num, the block’s own, and makes it 1. doThis’s num stays 10.', frames: [G, D(1), B(1)],
        find: { name: 'num', looked: [2], at: 2 } },
      { line: 8, note: 'i++: the block has no i, so the search goes out to doThis and finds i = 1 there, making it 2. The global 89 is never reached.', frames: [G, D(2), B(1)],
        find: { name: 'i', looked: [2, 1], at: 1 } },
      { line: 9, note: 'Print the block’s num: 1.', frames: [G, D(2), B(1)], out: '1 ' },
      { line: 5, note: 'The block ended and its num is gone. Test 2 < 10 with doThis’s num: true, so the body runs again.', frames: [G, D(2)],
        find: { name: 'num', looked: [1], at: 1 } },
      { line: 6, note: 'A fresh block scope: a brand new num starts at 0 again. The old 1 was thrown away when the last pass ended.', frames: [G, D(2), B(0)] },
      { line: 7, note: 'The block’s num goes to 1.', frames: [G, D(2), B(1)] },
      { line: 8, note: 'doThis’s i goes to 3.', frames: [G, D(3), B(1)] },
      { line: 9, note: 'Print 1 again.', frames: [G, D(3), B(1)], out: '1 ' },
      { line: 9, note: 'Passes 3 to 9 go the same way: each makes a new num = 0, bumps it to 1, prints 1, and adds 1 to i. After pass 9, i is 10.', frames: [G, D(10), B(1)],
        out: '1 1 1 1 1 1 1 ' },
      { line: 5, note: 'Test 10 < 10 with doThis’s num, which was never changed: false, so the loop stops.', frames: [G, D(10)],
        find: { name: 'num', looked: [1], at: 1 } },
      { line: 11, note: 'Outside the loop the only num in reach is doThis’s, still 10, so a newline and 10 are printed.', frames: [G, D(10)],
        find: { name: 'num', looked: [1], at: 1 }, out: '\n10\n' },
    ];
  }

  // Python: f's x is local to f (it is assigned there); g's nonlocal x IS f's x.
  {
    const G = { fn: 'global', vars: { x: 12, y: 82 } };
    const F = x => ({ fn: 'f(12)', vars: x == null ? { w: 12 } : { w: 12, x } });
    const Gf = { fn: 'g(100)', vars: { y: 100 } };
    T['l52-py-trace'] = [
      { line: 1, note: 'Global x is 12.', frames: [{ fn: 'global', vars: { x: 12 } }] },
      { line: 2, note: 'Global y is 82.', frames: [G] },
      { line: 17, note: 'f(x) is called, so w = 12. x is assigned later inside f, which makes x a local of f for the WHOLE function, not yet set.', frames: [G, F()] },
      { line: 4, note: 'f has no y, so Python looks in the enclosing scope, global, and finds 82.', frames: [G, F()],
        find: { name: 'y', looked: [1, 0], at: 0 }, out: 'In f top, y is:  82\n' },
      { line: 13, note: 'f sets its own local x to 13. The global x is still 12.', frames: [G, F(13)] },
      { line: 14, note: 'f calls g(100). g’s parameter y = 100 is a new local that hides the global y.', frames: [G, F(13), Gf] },
      { line: 7, note: 'nonlocal x tells Python that x inside g means the x of the enclosing function f, not a new local and not the global.', frames: [G, F(13), Gf] },
      { line: 10, note: 'g has no x of its own, so x is found in f, the function g was written inside: 13.', frames: [G, F(13), Gf],
        find: { name: 'x', looked: [2, 1], at: 1 }, out: 'In g, x is:  13\n' },
      { line: 11, note: 'Because of nonlocal, x = 55 writes into f’s x, not a new variable in g.', frames: [G, F(55), Gf] },
      { line: 12, note: 'g calls h(). h has no variables of its own.', frames: [G, F(55), Gf, { fn: 'h()', vars: {} }] },
      { line: 9, note: 'h has no x, g (where h was written) has no x of its own, so the search reaches f, where x is now 55.', frames: [G, F(55), Gf, { fn: 'h()', vars: {} }],
        find: { name: 'x', looked: [3, 2, 1], at: 1 }, out: 'In h, x is:  55\n' },
      { line: 15, note: 'h and g have returned. f’s own x was changed to 55 through nonlocal, so f prints 55.', frames: [G, F(55)],
        find: { name: 'x', looked: [1], at: 1 }, out: 'In f bottom, x is:  55\n' },
      { line: 18, note: 'f has returned. The global x was never touched, since f’s x was a separate local, so 12 is printed.', frames: [G],
        find: { name: 'x', looked: [0], at: 0 }, out: 'Global, x is:  12\n', result: '82 13 55 55 12' },
    ];
  }

  // JS nested functions, static vs dynamic lookup of x from inner2.
  {
    const G = { fn: 'global', vars: {} };
    const O = { fn: 'outer()', vars: { x: 22 } };
    const I1 = x => ({ fn: 'inner1()', vars: x == null ? {} : { x } });
    const base = [
      { line: 9, note: 'outer() is running and sets its own x to 22.', frames: [G, O] },
      { line: 10, note: 'outer calls inner1().', frames: [G, O, I1()] },
      { line: 3, note: 'inner1 makes its own local x = 12. outer’s x is still 22.', frames: [G, O, I1(12)] },
      { line: 4, note: 'inner1 calls inner2(). The stack is now outer, inner1, inner2.', frames: [G, O, I1(12), { fn: 'inner2()', vars: {} }] },
    ];
    T['l52-js-static'] = base.concat([
      { line: 7, note: 'inner2 has no x. Static scoping looks where inner2 was WRITTEN: inside outer, so x = 22. It skips inner1 because inner2 was not written inside inner1.',
        frames: [G, O, I1(12), { fn: 'inner2()', vars: { y: 22 } }], find: { name: 'x', looked: [3, 1], at: 1 }, result: '22' },
    ]);
    T['l52-js-dynamic'] = base.concat([
      { line: 7, note: 'inner2 has no x. Dynamic scoping looks at whoever CALLED it: inner1, which has x = 12, so y = 12. outer’s 22 is never reached.',
        frames: [G, O, I1(12), { fn: 'inner2()', vars: { y: 12 } }], find: { name: 'x', looked: [3, 2], at: 2 }, result: '12' },
    ]);
  }

  // Static scoping: f was written at the top level, so its free kiwi is the global one.
  {
    const G = { fn: 'global', vars: { kiwi: 16 } };
    const g = { fn: 'g(3)', vars: { x: 3, kiwi: 12 } };
    const h = { fn: 'h(3, 12)', vars: { x: 3, y: 12 } };
    T['l52-kiwi-static'] = [
      { line: 1, note: 'The global kiwi is set to 16.', frames: [G] },
      { line: 13, note: 'g(3) is called.', frames: [G, { fn: 'g(3)', vars: { x: 3 } }] },
      { line: 7, note: 'g makes its OWN local kiwi = 12. The global kiwi is still 16.', frames: [G, g] },
      { line: 8, note: 'g calls h(x, kiwi) = h(3, 12).', frames: [G, g, h] },
      { line: 11, note: 'h calls f(y, 2 * x) = f(12, 6).', frames: [G, g, h, { fn: 'f(12, 6)', vars: { x: 12, y: 6 } }] },
      { line: 4, note: 'f has no kiwi. Static scoping looks where f was written, the top level, and finds 16. It skips h and g because f was not written inside them. 12 + 6 + 16 = 34.',
        frames: [G, g, h, { fn: 'f(12, 6)', vars: { x: 12, y: 6 } }], find: { name: 'kiwi', looked: [3, 0], at: 0 }, out: 'Hi 34' },
    ];
  }

  // C static local: a is remade every call, sa is made once and keeps its value.
  {
    const S = sa => ({ fn: 'static (lives across calls)', vars: { sa } });
    const M = i => ({ fn: 'main', vars: { i } });
    const call = (i, sa, prev, n) => {
      const F = a => ({ fn: 'foo()', vars: a == null ? {} : { a } });
      return [
        { line: 12, note: `main calls foo() for call ${n}. foo gets a fresh frame with no a yet.`, frames: [S(prev), M(i), F()] },
        { line: 2, note: 'int a = 10 makes a new a in this call’s frame.', frames: [S(prev), M(i), F(10)] },
        { line: 3, note: n === 1
            ? 'The static sa was set to 10 once, before main started. This line does NOT reset it; it is skipped on every call.'
            : `Not reset: sa still holds ${prev} from the last call.`, frames: [S(prev), M(i), F(10)] },
        { line: 4, note: 'a goes from 10 to 15.', frames: [S(prev), M(i), F(15)] },
        { line: 5, note: `sa goes from ${prev} to ${sa}.`, frames: [S(sa), M(i), F(15)] },
        { line: 6, note: `Print a and sa. foo then returns and a is thrown away, but sa (${sa}) stays.`, frames: [S(sa), M(i), F(15)],
          out: `a = 15, sa = ${sa}\n` },
      ];
    };
    const steps = [
      { line: 10, note: 'main declares i, not set yet. sa already exists with 10: a static lives for the whole program.', frames: [S(10), M('?')] },
      { line: 11, note: 'The loop starts with i = 0.', frames: [S(10), M(0)] },
      ...call(0, 15, 10, 1),
      { line: 11, note: '++i makes i 1; 1 < 10, so loop again.', frames: [S(15), M(1)] },
      ...call(1, 20, 15, 2),
      { line: 6, note: 'Calls 3 to 9 go the same way: a is always 15, sa adds 5 each time, from 25 up to 55. i is now 8.', frames: [S(55), M(8)],
        out: 'a = 15, sa = 25\na = 15, sa = 30\na = 15, sa = 35\na = 15, sa = 40\na = 15, sa = 45\na = 15, sa = 50\na = 15, sa = 55\n' },
      { line: 11, note: '++i makes i 9; 9 < 10, so the 10th call happens.', frames: [S(55), M(9)] },
      ...call(9, 60, 55, 10),
    ];
    steps[steps.length - 1].result = 'a = 15, sa = 60';
    T['l52-sa-tenth'] = steps;
  }

  // a() called from inside b() (inside c()), then from the top level.
  {
    const run = (x2, x3, findFirst, first) => [
      { line: 1, note: 'The global x is 1.', frames: [{ fn: 'global', vars: { x: 1 } }] },
      { line: 10, note: 'c() is called.', frames: [{ fn: 'global', vars: { x: 1 } }, { fn: 'c()', vars: {} }] },
      { line: 8, note: 'c makes its own local x = 3.', frames: [{ fn: 'global', vars: { x: 1 } }, { fn: 'c()', vars: { x: 3 } }] },
      { line: 9, note: 'c calls b().', frames: [{ fn: 'global', vars: { x: 1 } }, { fn: 'c()', vars: { x: 3 } }, { fn: 'b()', vars: {} }] },
      { line: 5, note: 'b makes its own local x = 2.', frames: [{ fn: 'global', vars: { x: 1 } }, { fn: 'c()', vars: { x: 3 } }, { fn: 'b()', vars: { x: 2 } }] },
      { line: 6, note: 'b calls a(). The stack is now c, b, a.', frames: [{ fn: 'global', vars: { x: 1 } }, { fn: 'c()', vars: { x: 3 } }, { fn: 'b()', vars: { x: 2 } }, { fn: 'a()', vars: {} }] },
      { line: 3, note: first, frames: [{ fn: 'global', vars: { x: 1 } }, { fn: 'c()', vars: { x: 3 } }, { fn: 'b()', vars: { x: 2 } }, { fn: 'a()', vars: {} }],
        find: findFirst, out: x2 + '\n' },
      { line: 11, note: 'b and c have returned and their x values are gone. Now a() is called straight from the top level.', frames: [{ fn: 'global', vars: { x: 1 } }, { fn: 'a()', vars: {} }] },
      { line: 3, note: 'a has no x. Its only caller is the top level, which is also where a was written, so both rules give the global x = 1.',
        frames: [{ fn: 'global', vars: { x: 1 } }, { fn: 'a()', vars: {} }], find: { name: 'x', looked: [1, 0], at: 0 }, out: x3 + '\n' },
    ];
    T['l52-abc-static'] = run(1, 1, { name: 'x', looked: [3, 0], at: 0 },
      'a has no x. Static scoping looks where a was written, the top level, so x = 1. It skips b and c because a was not written inside them.');
    T['l52-abc-dynamic'] = run(2, 1, { name: 'x', looked: [3, 2], at: 2 },
      'a has no x. Dynamic scoping looks at its caller first: b, which has x = 2. So 2 is printed and c’s 3 and the global 1 are never reached.');
  }

  // A parameter is a local too: setup's n = 9 is visible to show() only under dynamic scoping.
  {
    const G = { fn: 'global', vars: { n: 5 } };
    const R = { fn: 'run()', vars: { n: 7 } };
    const S = { fn: 'setup(9)', vars: { n: 9 } };
    const base = [
      { line: 1, note: 'The global n is 5.', frames: [G] },
      { line: 9, note: 'run() is called.', frames: [G, { fn: 'run()', vars: {} }] },
      { line: 7, note: 'run makes its own local n = 7.', frames: [G, R] },
      { line: 8, note: 'run calls setup(9). The parameter n = 9 is a local of setup.', frames: [G, R, S] },
      { line: 5, note: 'setup calls show(). The stack is now run, setup, show.', frames: [G, R, S, { fn: 'show()', vars: {} }] },
    ];
    T['l52-param-static'] = base.concat([
      { line: 3, note: 'show has no n. Static scoping looks where show was written, the top level, so n = 5. It skips setup and run because show was not written inside them.',
        frames: [G, R, S, { fn: 'show()', vars: {} }], find: { name: 'n', looked: [3, 0], at: 0 }, out: '5\n' },
    ]);
    T['l52-param-dynamic'] = base.concat([
      { line: 3, note: 'show has no n. Dynamic scoping looks at its caller first: setup, whose parameter n is 9. So 9 is printed; run’s 7 and the global 5 are never reached.',
        frames: [G, R, S, { fn: 'show()', vars: {} }], find: { name: 'n', looked: [3, 2], at: 2 }, out: '9\n' },
    ]);
  }
})(globalThis.FC = globalThis.FC || {});
