// "Help" walkthroughs for CSC 370, batch H: Lecture 5.2 second half (lifetime, scope,
// static vs dynamic scoping, blocks, declaration rules, named constants, scope traces).
// Format: see the header of decks/csc370-help.js. Math is OFF for this class.
// Every program output stated here was checked by running it: gcc (C), node (JavaScript,
// static scope), python3 (static scope), bash `local` (dynamic scope), perl `local` (dynamic).
(function (FC) {
  'use strict';
  const H = FC.help = FC.help || {};
  const leaf = label => ({ label, kids: [] });
  const node = (label, ...kids) => ({ label, kids });

  // ---------------------------------------------------------------- scope hole
  H['l52-scope-hole'] = {
    asks: 'Say what a scope hole is, and show one with a small piece of C.',
    idea: 'Two variables share one name. Where the inner one is in scope, the name always means the nearest declaration, so the outer variable is still alive in memory but cannot be reached by name. That region is the "hole" in the outer variable’s scope.',
    steps: [
      'You need two declarations with the same name: one with a wider scope (say a global) and one with a narrower scope (a parameter, a local, or a block variable).',
      { text: 'Here the parameter `x` hides the global `x` inside `f`:', code: 'int x = 2;              /* global x */\n\nint f(int x) {          /* parameter x */\n   return x * 10;       /* this x is the parameter */\n}\n\nint main(void) {\n   printf("%d\\n", f(5)); /* 50 */\n   printf("%d\\n", x);    /* 2: the global again */\n}' },
      'Static scope searches the nearest declaration first. Inside `f` the nearest `x` is the parameter, so every `x` in `f` means the parameter, and there is no way to name the global from there.',
      { text: 'Which `x` each part of the program sees:', table: { head: ['where', 'which x', 'value'], rows: [['inside f (the hole)', 'parameter x', '5'], ['inside main', 'global x', '2']] } },
      'The global is not destroyed inside `f`. It keeps its cell and its value 2 the whole time (lifetime); it is just not visible there (scope).',
    ],
    answer: 'A scope hole is a place where a wider-scoped variable cannot be accessed because a narrower-scoped variable has the same name. Example: global `int x = 2;` and `int f(int x) { … }`: inside `f`, the global `x` is hidden, even though it still exists in memory.',
    mistake: 'Saying the outer variable is overwritten or destroyed in the hole. Nothing happens to it: it is alive and unchanged, only out of sight. Also remember you need two variables with the same name; one variable alone cannot make a hole.',
    tryIt: { q: 'In C, `main` calls `g()` and then prints `n`. Where is the scope hole, and what is printed?', code: "int n = 4;\n\nvoid g(void) {\n   int n = 9;\n   printf(\"%d\\n\", n);\n}\n\nint main(void) {\n   g();\n   printf(\"%d\\n\", n);\n}", a: 'The body of `g` is a hole in the global `n`’s scope, because the local `n` hides it. Output: 9, then 4 (the global was never touched).' },
  };

  // ------------------------------------------------------- JS outer/inner1/inner2
  H['l52-js-static'] = {
    asks: '`inner2` uses `x` but never declares it. Under static scoping, which `x` does it get, and what is its value?',
    idea: 'Static scope means: read the text. Start where the name is used; if it is not declared there, step out to the function that the code is written inside (its static parent), and keep stepping out. Who called the function never matters.',
    steps: [
      '`inner2` declares only `y`, so `x` is not local. Search outward through the text.',
      '`inner2` is written directly inside `outer`, not inside `inner1`. So its static parent is `outer`.',
      { text: 'The search, step by step:', table: { head: ['search step', 'scope', 'declares x?'], rows: [['1', 'inner2 (where x is used)', 'no'], ['2', 'outer (static parent)', 'yes: x = 22']] } },
      '`inner1`’s `x = 12` is in a sibling function, not an ancestor, so it is never searched. Running the code in Node (which is statically scoped) gives `y = 22`.',
    ],
    ptree: { tree: node('outer x=22', node('inner1'), node('inner2')), caption: 'Nesting in the text. inner2 (which uses x) has one ancestor: outer (x = 22). inner1 (x = 12) is beside it, not above it.' },
    answer: '22: `inner2` is written inside `outer`, so its `x` is `outer`’s `x`.',
    mistake: 'Following the calls (outer → inner1 → inner2) and answering 12. That is dynamic scoping. For static scoping, only where `inner2` is written counts.',
    tryIt: { q: 'Under static scoping, what do the two calls of `b` print?', code: "function top(){\n   function a(){\n      var k = 1;\n      b();\n   }\n   function b(){\n      console.log(k);\n   }\n   var k = 2;\n   a();\n   b();\n}", a: '2 and 2. `b` is written inside `top`, so its `k` is always `top`’s `k`, whether `a` or `top` calls it.' },
  };

  H['l52-js-dynamic'] = {
    asks: 'Same code, but now `x` is looked up through the calls at run time. Which `x` does `inner2` find?',
    idea: 'Dynamic scope means: read the call stack, newest call first. The first active call that declares `x` wins.',
    steps: [
      'Trace the calls: `outer` sets `x = 22` and calls `inner1`; `inner1` declares `x = 12` and calls `inner2`.',
      { text: 'The call stack while `inner2` runs (newest on top):', table: { head: ['active call', 'declares x?', 'value'], rows: [['inner2 (running)', 'no', '–'], ['inner1 (its caller)', 'yes', '12'], ['outer', 'yes', '22 (hidden)']] } },
      'Search from the top: `inner2` has no `x`; its caller `inner1` does. Stop at the first hit: 12. `outer`’s 22 is never reached.',
      { text: 'You can check it for real: bash `local` variables are dynamically scoped, and this prints `inner2 y = 12`:', code: 'outer() {\n  inner1() { local x=12; inner2; }\n  inner2() { local y=$x; echo "inner2 y = $y"; }\n  local x=22\n  inner1\n}\nouter' },
    ],
    answer: '12: the calls go outer → inner1 → inner2, and the most recent `x` on that chain is `inner1`’s.',
    mistake: 'Starting the search at the oldest call (`outer`) and answering 22. Dynamic scoping searches from the newest call backwards.',
    tryIt: { q: 'Under dynamic scoping, what does `q` print?', code: "function main(){\n   function p(){\n      var m = 5;\n      q();\n   }\n   function q(){\n      console.log(m);\n   }\n   function r(){\n      var m = 8;\n      p();\n   }\n   var m = 3;\n   r();\n}", a: '5. The stack is main → r → p → q. `q` has no `m`; its caller `p` does (5). `r`’s 8 and `main`’s 3 are further back.' },
  };

  // --------------------------------------------------------------------- kiwi
  const kiwiCalls = { text: 'First, trace the calls and their arguments. `h` passes `y` first and `2 * x` second:', table: { head: ['call', 'x', 'y', 'its own kiwi'], rows: [['g(3)', '3', '–', '12'], ['h(3, 12)', '3', '12', '–'], ['f(12, 6)', '12', '6', '–']] } };

  H['l52-kiwi-dynamic'] = {
    asks: 'Run the program in your head, but look up `kiwi` (the one name `f` does not declare) through the chain of calls.',
    idea: 'Two separate jobs: first get the argument values by tracing the calls, then resolve the free name `kiwi` by walking back through the callers, newest first.',
    steps: [
      kiwiCalls,
      'Inside `f`, `x` and `y` are parameters, so they are local: x = 12, y = 6. Only `kiwi` needs a search.',
      'Dynamic: search the active calls from the newest. `f` has no `kiwi`, `h` has none, `g` has `kiwi = 12`. Stop there; the global 16 is hidden.',
      '12 + 6 + 12 = 30, so it prints `Hi 30`. The same program in bash (dynamic `local`) prints `Hi 30` too.',
    ],
    answer: 'Hi 30: f(12, 6) finds `g`’s `kiwi` (12) on the call chain, and 12 + 6 + 12 = 30.',
    mistake: 'Getting f’s arguments backwards. `h(x, y)` calls `f(y, 2 * x)`, so f gets 12 and 6, not 3 and 12. Write each call’s arguments down before looking up `kiwi`.',
    tryIt: { q: 'Python-like syntax, DYNAMIC scoping. What is printed?', code: "z = 10\n\ndef f(a):\n   print(a + z)\n\ndef g():\n   z = 1\n   f(z * 3)\n\ng()", a: '4. `g` sets its own `z = 1` and calls f(3). `f` has no `z`; its caller `g` does (1). 3 + 1 = 4. (Static scoping would give 13.)' },
  };

  H['l52-kiwi-static'] = {
    asks: 'Same program, but now `kiwi` is looked up through the text: where `f` is written.',
    idea: 'The calls still decide the argument values. Static scoping only changes where the free name `kiwi` comes from: the code around `f`, not `f`’s callers.',
    steps: [
      kiwiCalls,
      'Inside `f`, x = 12 and y = 6 are parameters. `kiwi` is not declared in `f`.',
      '`f` is written at the top level, so its static parent is the global scope, where `kiwi = 16`.',
      '`g`’s `kiwi = 12` is a local of `g`. `f` is not written inside `g`, so it cannot see it.',
      '12 + 6 + 16 = 34, so it prints `Hi 34` (Python, which is statically scoped, agrees).',
    ],
    answer: 'Hi 34: same call f(12, 6), but `f`’s `kiwi` is the global 16, and 12 + 6 + 16 = 34.',
    mistake: 'Letting the static/dynamic switch change the arguments too. The calls run the same way in both; only the lookup of `kiwi` changes, which is why the two answers differ by exactly 16 − 12 = 4.',
    tryIt: { q: 'Python-like syntax, STATIC scoping. What is printed?', code: "pear = 5\n\ndef p(a, b):\n   print(a * b + pear)\n\ndef q(a):\n   pear = 100\n   r(a + 1, pear)\n\ndef r(a, b):\n   p(a, b - 98)\n\nq(2)", a: '11. q(2) → r(3, 100) → p(3, 2). `p` is written at the top level, so `pear` is the global 5: 3 × 2 + 5 = 11.' },
  };

  // ----------------------------------------------------------------- sa (C)
  H['l52-sa-tenth'] = {
    asks: '`foo` has a plain local `a` and a `static` local `sa`. After ten calls, what does the last call print?',
    idea: '`a` is stack-dynamic: a brand-new `a` is made on every call. `sa` is static: it gets its cell (and its starting value 10) once, before the program runs, and keeps whatever it holds between calls.',
    steps: [
      '`int a = 10;` runs on every call: a fresh `a` set to 10, then `a += 5` makes 15. Every call prints a = 15.',
      '`static int sa = 10;` is set to 10 only once, before execution. Later calls do not reset it; they start from the value the last call left.',
      { text: 'Call by call:', table: { head: ['call', 'a', 'sa'], rows: [['1', '15', '15'], ['2', '15', '20'], ['3', '15', '25'], ['…', '15', '+5 each call'], ['10', '15', '60']] } },
      'So sa = 10 + 5 × 10 = 60. Compiling and running it with gcc prints exactly `a = 15, sa = 60` on the tenth line.',
    ],
    answer: 'a = 15, sa = 60: `a` is remade as 10 each call; `sa` started at 10 once and gained 5 ten times.',
    mistake: 'Thinking `static int sa = 10;` resets `sa` to 10 on each call (answer 15), or computing 10 × 5 = 50 and forgetting the starting 10.',
    tryIt: { q: '`main` calls `tick()` four times. What does the 4th call print?', code: "void tick(void) {\n   int c = 0;\n   static int s = 100;\n   c++;\n   s -= 10;\n   printf(\"%d %d\\n\", c, s);\n}", a: '`1 60`. `c` is remade as 0 each call, so it is always 1. `s` started at 100 once and lost 10 four times: 100 − 40 = 60.' },
  };

  H['l52-sa-error'] = {
    asks: '`sa` exists for the whole run, yet `main` cannot use it. Explain why using the words lifetime and scope.',
    idea: 'Lifetime and scope answer different questions. Lifetime: WHEN does the memory cell exist? (time). Scope: WHERE in the text can the name be used? (space). `sa` lives the whole run, but its name is only usable inside `foo`’s braces.',
    steps: [
      { text: 'Ask both questions about `sa`:', table: { head: ['question', 'answer for sa'], rows: [['How long does its cell exist? (lifetime)', 'whole run: static'], ['Where can its name be used? (scope)', 'only inside foo']] } },
      'When `main` reaches `sa = sa * 2;`, the cell is alive and holds 60. Lifetime is fine.',
      'But the compiler looks up the name `sa` from `main`: not declared in `main`, not declared globally. It is never searched for inside `foo`, because `main` is not written inside `foo`.',
      'So gcc rejects it: `error: ‘sa’ undeclared`. To share it with `main`, you would declare it at file scope instead.',
    ],
    answer: '`sa` has static lifetime (bound to memory for the whole execution) but local scope (visible only inside `foo`). `main` cannot see the name, so the compiler rejects the line.',
    mistake: 'Thinking `static` on a local makes it global. In C, `static` inside a function changes only the lifetime; the scope stays local to the function.',
    tryIt: { q: 'Which of the two `printf` lines in `main` compiles?', code: "int total = 0;\n\nvoid add(int v) {\n   static int calls = 0;\n   calls++;\n   total += v;\n}\n\nint main(void) {\n   add(3);\n   printf(\"%d\\n\", total);\n   printf(\"%d\\n\", calls);\n}", a: 'Only the `total` one. Both have static lifetime, but `total` has file scope while `calls` has local scope (only inside `add`), so gcc says `calls` is undeclared.' },
  };

  // ------------------------------------------------------------ dynamic scope
  H['l52-dynamic-def'] = {
    asks: 'Under dynamic scoping, when a function uses a name it did not declare, where does the language look for it?',
    idea: 'Static scope is spatial: look at where the code is written. Dynamic scope is temporal: look back in time at who called whom, most recent call first.',
    steps: [
      'First look in the running subprogram’s own declarations (the same first step as static scoping).',
      'If not found, look in its caller (its dynamic parent), then the caller’s caller, and so on back along the chain of calls, until a declaration is found. If none is, it is a run-time error.',
      { text: 'Bash `local` variables are dynamically scoped, so this is a real example. `show` declares no `x`:', code: 'show() { echo $x; }\np()    { local x=2; show; }\nmain() { local x=1; p; show; }\nmain        # prints 2, then 1' },
      { text: 'The same line `echo $x` finds two different variables:', table: { head: ['call', 'chain, newest first', 'x found in', 'prints'], rows: [['show from p', 'show, p, main', 'p', '2'], ['show from main', 'show, main', 'main', '1']] } },
      'Which `x` you get depends on the order of calls at run time, not the layout of the text. That is why it is called temporal.',
    ],
    answer: 'By the calls at run time, not the text: search back through the chain of calls for the most recent declaration (temporal, where static scoping is spatial).',
    mistake: 'Saying "search the enclosing functions". Enclosing (where it is written) is static scoping. Dynamic scoping follows the callers, which can be written anywhere in the program.',
    tryIt: { q: 'Dynamic scoping: `a` declares `y = 1` and calls `b`. `b` declares `y = 2` and calls `c`. `c` prints `y` and declares none. Then `a` calls `c` directly. What are the two outputs?', a: '2, then 1. First chain c ← b ← a: `b`’s `y` is the most recent. Second chain c ← a: `a`’s `y`.' },
  };

  // --------------------------------------------------------- named constants
  H['l52-const-c'] = {
    asks: 'C has two ways to name a constant. Which one has its value fixed before the program ever runs?',
    idea: '`#define` is handled by the preprocessor: the name is replaced by its text before the compiler even sees the code, so its value is bound before run time. A `const` variable is a real variable that cannot be assigned again, but its one value can come from code that runs.',
    steps: [
      { text: 'Both of these compile with gcc:', code: '#define MAX 50                /* replaced by 50 before compiling */\n\nint main(void) {\n   const int n = rand() % 10; /* value known only when it runs */\n   printf("%d %d\\n", MAX, n);\n}' },
      'The `const` gets its value from `rand()` while the program runs, so `const` is not static binding. It only promises the value will not change after that.',
      'One more sign: at file scope, `int a[SIZE];` with `#define SIZE 8` compiles, but `int b[N];` with `const int N = 8;` is rejected (“variably modified ‘b’ at file scope”). The compiler does not treat `N` as a fixed number.',
      '`volatile` is not a named constant at all: it tells the compiler a variable may change in ways it cannot see.',
    ],
    answer: '`#define`: it is replaced before compilation, while a C `const` variable gets its value at run time.',
    mistake: 'Assuming `const` means "known at compile time". In C, `const` means "cannot be assigned after it is bound"; the binding itself can happen at run time.',
    tryIt: { q: 'Is `const int len = strlen(argv[1]);` legal inside `main` in C? What does that tell you about when a C `const` is bound?', a: 'Legal: the value is computed while the program runs, so a C `const` is bound dynamically. Only `#define` is bound before run time.' },
  };

  H['l52-const-csharp'] = {
    asks: 'C# has two named-constant keywords. Which one gets its value while the program runs?',
    idea: 'Both kinds can never change once bound. The difference is when: `const` is baked in at compile time, so it can only be a literal or another `const`; `readonly` is set while the program runs (in its declaration or a constructor) and then frozen.',
    steps: [
      { text: 'Side by side:', code: 'class Config {\n   const int Max = 100;                          // compile time\n   static readonly DateTime Start = DateTime.Now; // run time\n}' },
      '`Max = 100` is a literal, so the compiler knows the value and can bind it statically.',
      '`DateTime.Now` (the current time) cannot be known until the program runs, so it can only be a `readonly`. As a `const` it would be rejected, because `const` values can only be literals or other `const` members.',
      '`internal` is an access modifier (who may use a member), not a kind of constant.',
    ],
    answer: '`readonly`: its value is bound dynamically. C# `const` values are bound at compile time.',
    mistake: 'Treating `const` and `readonly` as the same thing. Both cannot be changed; what differs is the binding time.',
    tryIt: { q: 'A C# program must remember the moment it started and never change it. `const` or `readonly`?', a: '`readonly`: the value is only known at run time. A `const` needs a value the compiler already knows (a literal or another `const`).' },
  };

  H['l52-const-compare'] = {
    asks: 'Say when Java’s final constants get their values, according to the slides.',
    idea: 'For each keyword ask one question: does the compiler already know the value, or may it be computed when the program runs? Only two are "known early": C `#define` and C# `const`.',
    steps: [
      { text: 'The whole picture in one table:', table: { head: ['language', 'keyword', 'binding', 'why'], rows: [['C', '#define', 'static', 'replaced before compiling'], ['C', 'const', 'not static', '`const int n = rand() % 10;` is legal'], ['Java', 'final', 'dynamic', 'can be set from any expression, e.g. input'], ['C#', 'const', 'compile time', 'literals or other consts only'], ['C#', 'readonly', 'dynamic', 'set in its declaration or a constructor']] } },
      'Watch the trap: the word `const` means different things in C and C#. C `const` is not static; C# `const` is.',
      'The slides say Java `final` is "all dynamic". Strictly, a `static final` with a constant value can be filled in by the compiler, but for this course write: `final` is dynamic.',
    ],
    answer: 'Dynamically: Java final is all dynamic. (C: #define static, const not. C#: const at compile time, readonly dynamic.)',
    mistake: 'Grouping by keyword name. C `const` and C# `const` sound the same but are bound at different times.',
    tryIt: { q: 'Static or dynamic? (1) Java `final double rate = readRate();` (2) C# `const int Days = 7;` (3) C `#define DAYS 7` (4) C# `readonly int id;` set in a constructor.', a: '(1) dynamic, (2) static (compile time), (3) static, (4) dynamic.' },
  };

  // ------------------------------------------------------- lifetime / storage
  H['l52-lifetime-def'] = {
    asks: 'Give the definition of a variable’s lifetime.',
    idea: 'Lifetime is a span of time. It starts when the name is bound to a memory cell (allocation) and ends when it is unbound (deallocation). During that time the cell holds the name’s value.',
    steps: [
      { text: 'A plain local in C:', code: 'void f(void) {\n   int t = 5;   /* t is bound to a cell when f starts */\n   ...\n}              /* and unbound when f returns */' },
      'Call `f` three times and `t` has three separate lifetimes, possibly in three different cells.',
      'Put `static` in front (`static int t;`) and there is one lifetime: the whole run, one cell.',
      'Lifetime is about time; scope is about where in the text. Keep them apart.',
    ],
    answer: 'The time during which a name is bound to one particular memory cell, i.e. how long that cell is occupied by the name’s value.',
    mistake: 'Defining lifetime as "where the variable can be used". That is scope. Lifetime is how long the memory cell belongs to the name.',
    tryIt: { q: 'A C function `g` has a plain local `int k;` and is called 3 times. How many lifetimes does `k` have, and when does each start and end?', a: 'Three. Each starts when that call of `g` begins (k is bound to a cell) and ends when that call returns (the cell is released).' },
  };

  H['l52-static-lifetime'] = {
    asks: 'Define a static lifetime: when is the variable bound to memory, and for how long?',
    idea: '"Static" means settled before running. The cell is picked before execution begins, and the same cell stays with the variable until the program ends.',
    steps: [
      'Before `main` even starts, `sa` in the `foo` example already has its cell. Every call of `foo` uses that same cell, which is why `sa` can climb to 60.',
      'Examples: a C global (`int g;` at file scope) and a C or C++ `static` variable inside a function.',
      { text: 'Compare with a plain local:', table: { head: ['kind', 'bound to a cell', 'unbound'], rows: [['static', 'before execution begins', 'when execution ends'], ['stack-dynamic', 'when its function is called', 'when that call returns']] } },
    ],
    answer: 'The variable is bound to its memory cell(s) before execution begins and stays bound to the same cells until execution ends.',
    mistake: 'Thinking "static" means the value never changes. `sa` changes on every call. What is static is the binding to the memory cell.',
    tryIt: { q: 'Which have static lifetime? (a) `int count;` at file scope in C, (b) the parameter `int n` of a C function, (c) `static double total;` inside a C function.', a: '(a) and (c). (b) is stack-dynamic: bound when the function is called, unbound when it returns.' },
  };

  H['l52-static-adv'] = {
    asks: 'Name the advantage of static variables.',
    idea: 'The address is fixed before the program runs, so the machine code can contain the address itself. And there is no setting up or tearing down of memory while running.',
    steps: [
      'A static variable gets a fixed address before execution. An instruction can read or write that exact address: direct addressing.',
      'A stack local’s address is only known relative to the current call’s spot on the stack, worked out while running. That usually means indirect addressing, which is slower.',
      'For `sa`, nothing happens on entry to or exit from `foo`. For the plain local `a`, every call must allocate a cell and every return must release it.',
      'Put together: efficiency.',
    ],
    answer: 'Efficiency: addressing is direct and nothing is allocated or freed at run time.',
    mistake: 'Answering only "it remembers its value between calls". That is a use of static variables; the advantage asked for here is speed, and where the speed comes from (direct addressing, no run-time allocation).',
    tryIt: { q: 'A function is called a million times. It has one plain local and one `static` local. For which one does the program do allocation work on every call?', a: 'The plain local: it gets a fresh cell on each call and gives it back on return. The static local was given its cell once, before the program started.' },
  };

  H['l52-static-disadv'] = {
    asks: 'Sum up the disadvantage of static variables in one phrase.',
    idea: 'All the problems come from one fact: one fixed cell per variable for the whole run. That is a lack of flexibility, and it shows up three ways.',
    steps: [
      'No recursion: every active call of a recursive function needs its own copy of the locals, but a static variable has only one cell.',
      'Size must be known before run time: the cell is reserved before the program starts, so it cannot depend on input. gcc rejects `void f(int n) { static int buf[n]; }` with “storage size of ‘buf’ isn’t constant”.',
      'Storage cannot be shared: two functions that are never active at the same time still each keep their static arrays for the whole run. That memory is always used.',
    ],
    answer: 'Lack of flexibility: no recursion, size must be known before run time, storage cannot be shared among variables.',
    mistake: 'Listing "slow". Static variables are the fast ones. Their cost is flexibility, not speed.',
    tryIt: { q: '`load()` and `save()` each have a `static char buf[1000000];` and are never running at the same time. Which disadvantage is this, and how much memory do the buffers take during the run?', a: 'Storage cannot be shared: both 1 MB buffers exist for the whole run (2 MB), although stack-dynamic buffers would never need more than 1 MB at once.' },
  };

  H['l52-static-recursion'] = {
    asks: 'Explain why recursion breaks when every variable is static.',
    idea: 'Recursion means several calls of the same function are active at once, and each one needs its own locals. Static gives each variable exactly one cell, so the calls trample each other.',
    steps: [
      { text: 'A factorial whose local `k` is static (runs with gcc):', code: 'int fact(int n) {\n   static int k;     /* one cell for every call */\n   k = n;\n   if (n <= 1) return 1;\n   int r = fact(n - 1);\n   return k * r;     /* k was overwritten by the deeper calls */\n}' },
      { text: 'Trace `fact(3)`. Each deeper call writes the same `k`:', table: { head: ['call', 'sets k to', 'k when it multiplies', 'returns'], rows: [['fact(3)', '3', '1', '1 × 1 = 1'], ['fact(2)', '2', '1', '1 × 1 = 1'], ['fact(1)', '1', '–', '1']] } },
      'So `fact(3)` returns 1 instead of 6. Remove `static` and it returns 6, because each call then gets its own fresh `k`.',
      'That fresh-cell-per-call is exactly what stack-dynamic locals give, and why Fortran I subprograms, with only static locals, could not recurse.',
    ],
    answer: 'Each variable has exactly one memory cell for the whole run. A second, still-active call of the same function would use the same cells and overwrite the first call’s locals.',
    mistake: 'Saying static variables "cannot be used inside functions" or "run out of memory". The real reason is sharing: one cell, many active calls.',
    tryIt: { q: 'With the same `fact` (static `k`), what does `fact(4)` return?', a: '1. The deepest call sets `k = 1` last, and every waiting call then multiplies by that 1.' },
  };

  // ----------------------------------------------------------- declaration rules
  H['l52-decl-rules'] = {
    asks: 'Say where declarations must be placed in C89 and Pascal.',
    idea: 'Older C89 and Pascal: declarations first, then code, and a local is visible in the whole block. Newer C99 and Java: declare anywhere, and a local is visible only from its declaration down.',
    steps: [
      { text: 'Side by side:', table: { head: ['', 'C89 / Pascal', 'C99 / Java'], rows: [['where declarations go', 'at the beginning of the block', 'anywhere a statement can go'], ['scope of a local', 'the whole block', 'from its declaration to the end of the block']] } },
      { text: 'This puts a declaration after a statement:', code: 'void f(void) {\n   int a = 1;\n   a++;\n   int b = a;   /* declared after a statement */\n}' },
      'gcc in C89 mode rejects it (“ISO C90 forbids mixed declarations and code”); in C99 mode it compiles.',
      'In C99, `b` cannot be used on the `a++` line: its scope has not started yet.',
    ],
    answer: 'At the beginning of the block (and a local’s scope is the whole block). C99/Java: anywhere a statement can go, scope from the declaration to the end of the block.',
    mistake: 'Mixing the pairs up. Remember the newer languages (C99, Java) are the looser ones: declare anywhere, and scope starts at the declaration.',
    tryIt: { q: 'In C99: `{ x = 3; int x = 5; }` with no other `x` anywhere. Is it legal? Would C89 accept the layout?', a: 'Not legal in C99: `x`’s scope starts at its declaration, so `x = 3` uses an undeclared name. C89 rejects it as well, because a declaration comes after a statement.' },
  };

  // ------------------------------------------------- evaluating the two scopings
  H['l52-static-scope-adv'] = {
    asks: 'Give the main advantage of static scoping for a reader.',
    idea: 'Static scope can be settled before the program runs, just from the text. So a person (or the compiler) can tell what a name means by reading. That, and the fact that nearly every language works this way.',
    steps: [
      'Most languages do it (C, Python, JavaScript, …), so it is familiar.',
      'You can tell which variable a name refers to just by looking at the program. In the kiwi program, `f` is written at the top level, so its `kiwi` is the global 16. No tracing needed.',
      'Under dynamic scoping, the same question needed the call trace g → h → f to find 12.',
      'The exact blank wording on her slide is a best guess, but these two ideas are what the slide and the textbook say.',
    ],
    answer: 'You can tell what a name refers to by reading the program, without running it. (Also: most languages do it, so it is familiar.)',
    mistake: 'Writing "it is faster" as the main point. Speed is real but the slide’s points are familiarity and that you can just look at the program.',
    tryIt: { q: 'You see `print(total)` inside a function `report` in a statically scoped program. What do you need to look at to know which `total` it is, and what can you ignore?', a: 'Only the text: `report`’s own declarations, then the functions it is written inside, then the globals. You can ignore who calls `report`.' },
  };

  H['l52-dynamic-disadv'] = {
    asks: 'Give the main disadvantage of dynamic scoping for someone reading the code.',
    idea: 'Because a name is resolved by whoever happens to be calling, the meaning of a name moves around at run time. Each disadvantage comes from that.',
    steps: [
      { text: 'A real example in bash (dynamic `local`). `bump` declares no `total`:', code: 'bump()   { total=$((total + 100)); }\nreport() { local total=1; bump; echo $total; }\nreport   # prints 101' },
      'Hard to read: from `bump`’s text alone you cannot tell which `total` it changes; it depends on who calls it.',
      'Less reliable: `bump` changed `report`’s local. Any function you call can see and change your locals, and you cannot protect them.',
      'Slower: finding a nonlocal means searching back through the active calls at run time.',
      'Unfamiliar: few languages use it, so it is harder to learn and program in.',
    ],
    answer: 'You can’t tell what a variable refers to by reading the program. (Also: callees can change callers’ locals; slower non-local access; unfamiliar.)',
    mistake: 'Writing one vague point like "it is confusing". Give the separate problems: unreadable, unsafe locals, slow, unfamiliar. Its one advantage (no need to pass the caller’s variables as parameters) is not a disadvantage.',
    tryIt: { q: 'Dynamic scoping: `report` declares `count = 0`, calls `helper`, which runs `count = count + 1` without declaring `count`, and then `report` prints `count`. What prints, and which disadvantage does it show?', a: '1. `helper` found and changed `report`’s local `count` through the call chain: called subprograms can change their callers’ locals, so programs are less reliable.' },
  };

  H['l52-named-const'] = {
    asks: 'Define a named constant.',
    idea: 'A named constant is a name tied to a value exactly once. After that, the name is just a readable label for the value, and the one line that sets it is the only place to change it.',
    steps: [
      { text: 'In C:', code: 'const double PI = 3.14159;\nconst int MAX = 100;\n\narea = PI * r * r;               /* readable */\nfor (i = 0; i < MAX; i++) ...    /* change MAX in one place */' },
      'Bound once: after `const int MAX = 100;`, the line `MAX = 200;` is a compile error (“assignment of read-only variable ‘MAX’”).',
      'Readability: `PI * r * r` says what it means; `3.14159 * r * r` makes the reader guess.',
      'Modifiability: if 100 appears in five places, changing to 200 means one edit, not five (and none missed).',
      'Parameterizing: `MAX` controls every array size and loop bound, so the program works for any `MAX`.',
    ],
    answer: 'A “variable” bound to a value only once. Advantages: readability (PI), modifiability (one place to change), parameterizing programs.',
    mistake: 'Reading "modifiability" as "you can change the constant while the program runs". It means the programmer can change the program easily, by editing one line.',
    tryIt: { q: 'A program uses 24 in six places to mean hours per day, and once to mean a class size. Why is `const int HOURS = 24;` better than editing the 24s by hand?', a: 'Readability: `HOURS` says what the number means. Modifiability: one line changes all six, and the class-size 24 cannot be changed by mistake.' },
  };

  H['l52-manifest'] = {
    asks: 'Give the name for named constants whose values are bound statically.',
    idea: 'A statically bound named constant is a manifest constant: its value is plain to see (manifest) before the program runs. In C, `#define` does this, because the preprocessor pastes the value into the code before compiling.',
    steps: [
      { text: 'Running only the preprocessor (`gcc -E`) shows the name is gone before compiling starts:', code: '/* you write */\n#define SIZE 8\nint a[SIZE];\n\n/* the compiler sees */\nint a[8];' },
      'The value 8 is bound before the program ever runs: static binding, so a manifest constant.',
      'A C `const` is not manifest: its value can be computed at run time.',
    ],
    answer: 'Manifest constants (in C, made with #define).',
    mistake: 'Answering `const` for C. That is the dynamically bound one in C.',
    tryIt: { q: 'In C#, which named-constant keyword gives a manifest (statically bound) constant?', a: '`const`: its value is bound at compile time. `readonly` values are bound dynamically.' },
  };

  H['l52-storage-classify'] = {
    asks: 'Classify the storage of int g; declared at file scope in C.',
    idea: 'Ask two questions: when is it given memory, and who gives it back? Before the run: static. On a function call: stack-dynamic. When the programmer asks (malloc/free): explicit heap. Automatically on assignment: implicit heap.',
    steps: [
      { text: 'Item by item:', table: { head: ['item', 'category', 'gets memory', 'gives it back'], rows: [['(1) global `int g;`', 'static', 'before the run', 'end of the run'], ['(2) `static int s;` in a function', 'static', 'before the run', 'end of the run'], ['(3) plain local `int t;`', 'stack-dynamic', 'function call', 'return'], ['(4) the pointer `p`', 'stack-dynamic', 'function call', 'return'], ['(5) the int `p` points to', 'explicit heap', '`malloc` runs', '`free` runs'], ['(6) a Python list', 'implicit heap', 'assignment', 'automatically']] } },
      'Explicit heap: the programmer asks for it and lets go of it, and it can only be reached through a pointer or reference.',
      'Implicit heap: memory is handed out automatically whenever a value is assigned (Python lists, strings in JavaScript).',
      '(4) and (5) are on the same line but are two different things: `p` is a local variable that dies when the function returns; the int it points to lives until `free()`.',
    ],
    answer: 'Static. (static local s: static; plain local t: stack-dynamic; pointer p: stack-dynamic; the malloc’d int: explicit heap; Python list: implicit heap.)',
    mistake: 'Calling `p` heap because `malloc` is on its line. `p` itself is a local on the stack; only the thing it points to is on the heap.',
    tryIt: { q: 'Classify: (1) `static char buf[64];` at file scope in C, (2) the parameter `int n` of a C function, (3) the array made by `calloc(10, sizeof(int))`, (4) a JavaScript string.', a: '(1) static, (2) stack-dynamic, (3) explicit heap, (4) implicit heap.' },
  };

  // ---------------------------------------------------------- a/b/c programs
  H['l52-abc-static'] = {
    asks: 'Run the program and print `x` from `a` twice, looking `x` up through the text.',
    idea: 'Static scope: `a` is written at the top level, so its `x` is the global, no matter who calls `a`.',
    steps: [
      'Calls: `c()` sets its own `x = 3` and calls `b()`; `b` sets its own `x = 2` and calls `a()`. Then the top level calls `a()` again.',
      '`a` declares no `x`. Its static parent is the global scope, where `x = 1`.',
      'The `x = 2` and `x = 3` are locals of `b` and `c`. `a` is not written inside either one, so they are invisible to it.',
      { text: 'Both calls:', table: { head: ['call of a', 'a is written in', 'x found in', 'prints'], rows: [['from b (via c)', 'top level', 'global', '1'], ['from top level', 'top level', 'global', '1']] } },
      'Python (statically scoped) prints 1 and 1.',
    ],
    answer: '1 1: `a`’s `x` is always the global, wherever `a` is called from.',
    mistake: 'Following the call c → b → a and answering 2 for the first call. That is the dynamic answer.',
    tryIt: { q: 'Python-like syntax, STATIC scoping. What is printed?', code: "y = 'g'\ndef show():\n    print(y)\ndef mid():\n    y = 'm'\n    show()\nmid()\nshow()", a: '`g` and `g`. `show` is written at the top level, so its `y` is always the global.' },
  };

  H['l52-abc-dynamic'] = {
    asks: 'Same program, but `a` looks up `x` back through its callers.',
    idea: 'Dynamic scope: each call of `a` can find a different `x`, depending on who is on the call stack at that moment.',
    steps: [
      { text: 'Call 1: `c()` → `b()` → `a()`. The stack, newest first:', table: { head: ['active call', 'declares x?'], rows: [['a', 'no'], ['b', 'yes: 2'], ['c', 'yes: 3 (hidden)'], ['global', 'yes: 1 (hidden)']] } },
      'The first `x` found going back is `b`’s, so the first print is 2.',
      'Call 2: the top level calls `a()` directly. By now `c` and `b` have returned, so their locals are gone. The stack is just `a`, then the global: prints 1.',
      'bash, with dynamic `local`, prints 2 then 1.',
    ],
    answer: '2 1: first chain c → b → a finds `b`’s `x` (2); second call comes from the top level and finds the global `x` (1).',
    mistake: 'Answering 3 for the first call because `c` was called first. Search starts at the most recent caller (`b`), not the oldest.',
    tryIt: { q: 'Python-like syntax, DYNAMIC scoping. What is printed?', code: "v = 0\ndef p():\n    print(v)\ndef q():\n    v = 4\n    p()\ndef r():\n    v = 6\n    p()\n    q()\nr()", a: '6, then 4. First p is called by r (r’s v = 6). Then r → q → p, and q’s v = 4 is the most recent.' },
  };

  H['l52-param-static'] = {
    asks: 'Print `n` from `show`, looking `n` up through the text.',
    idea: 'Static scope: `show` is written at the top level, so its `n` is the global 5. The parameter `n` of `setup` and the local `n` of `run` belong to those functions only.',
    steps: [
      'Calls: `run()` sets its local `n = 7` and calls `setup(9)`; `setup`’s parameter `n` is 9; `setup` calls `show()`.',
      '`show` declares no `n`, so search outward through the text: `show`’s static parent is the global scope, where `n = 5`.',
      '`run` and `setup` both have an `n`, but `show` is not written inside either, so neither is searched.',
      'Python (statically scoped) prints 5.',
    ],
    answer: '5: `show` is written at the top level, so its `n` is the global `n`.',
    mistake: 'Being distracted by the parameter. A parameter is a local of its own function; it is only visible to code written inside that function.',
    tryIt: { q: 'Python-like syntax, STATIC scoping. What is printed?', code: "t = 'top'\ndef say():\n    print(t)\ndef wrap(t):\n    say()\nwrap('param')", a: '`top`. `say` is written at the top level, so its `t` is the global; `wrap`’s parameter `t` is invisible to it.' },
  };

  H['l52-param-dynamic'] = {
    asks: 'Same program, but `show` looks up `n` back through its callers.',
    idea: 'Under dynamic scoping a parameter counts as a declaration, exactly like a local. So the most recent `n` on the call chain may be a parameter.',
    steps: [
      { text: 'Call chain: run → setup(9) → show. Newest first:', table: { head: ['active call', 'declares n?', 'value'], rows: [['show', 'no', '–'], ['setup', 'yes (parameter)', '9'], ['run', 'yes (local)', '7 (hidden)'], ['global', 'yes', '5 (hidden)']] } },
      '`show` has no `n`. Its caller `setup` has the parameter `n = 9`. Stop there.',
      'bash, with dynamic `local`, prints 9.',
    ],
    answer: '9: the most recent `n` on the chain run → setup → show is `setup`’s parameter, and a parameter counts as a declaration.',
    mistake: 'Skipping the parameter and answering 7 (`run`’s local). Parameters are declarations too.',
    tryIt: { q: 'Python-like syntax, DYNAMIC scoping. What is printed?', code: "k = 1\ndef out():\n    print(k)\ndef mid(k):\n    out()\ndef go(k):\n    mid(k + 10)\ngo(3)", a: '13. Chain go(3) → mid(13) → out. `out` has no `k`; its caller `mid` has the parameter `k = 13`.' },
  };

  // ------------------------------------------------- main/sub1/sub2/sub3 nesting
  const subTree = { tree: node('global', node('main x=1', node('sub1', node('sub2 uses x')), node('sub3'))), caption: 'Nesting in the text (sub3 calls sub1 but does not contain it). sub2’s ancestors are the path up from it: sub1, main, global. sub3 is not on that path.' };

  H['l52-static-parent'] = {
    asks: 'Name sub2’s static parent.',
    idea: 'Static parent = the function a function is written directly inside. Static ancestors = the parent, its parent, and so on outward. Calls play no part.',
    steps: [
      '`sub2` is written directly inside `sub1`, so `sub1` is its static parent.',
      '`sub1` is written inside `main`, and `main` is at the global level. So the static ancestors are `sub1`, then `main`, then the global scope.',
      { text: 'Searching for `x` from `sub2`:', table: { head: ['scope searched', 'declares x?'], rows: [['sub2', 'no'], ['sub1 (static parent)', 'no'], ['main', 'yes: x = 1']] } },
      '`sub3` calls `sub1`, but it does not enclose it, so `sub3` is not an ancestor and is never searched. Python prints 1.',
    ],
    ptree: subTree,
    answer: 'sub1. Static ancestors: sub1, then main (then global); x is found in main.',
    mistake: 'Listing `sub3` as an ancestor because it calls `sub1`. Calling is about run time; ancestors are about the text.',
    tryIt: { q: 'Under static scoping, what are `c`’s static parent and static ancestors, and where is `z` found?', code: "def a():\n    def b():\n        def c():\n            print(z)\n        c()\n    def d():\n        z = 2\n        b()\n    z = 1\n    d()\na()", a: 'Parent `b`; ancestors `b`, `a` (then global). `z` is found in `a` (1); `d`’s `z = 2` is not an ancestor’s, so it prints 1.' },
  };

  H['l52-dynamic-chain'] = {
    asks: 'Using the order of calls instead, list which subprograms are searched for `x`, in order.',
    idea: 'Dynamic search follows the call stack from newest to oldest, whatever the nesting in the text looks like.',
    steps: [
      'Calls happen in this order: `main` calls `sub3`, `sub3` calls `sub1`, `sub1` calls `sub2`.',
      { text: 'Stack while `sub2` runs, newest first, which is also the search order:', table: { head: ['search step', 'active call', 'declares x?'], rows: [['1', 'sub2', 'no'], ['2', 'sub1 (called sub2)', 'no'], ['3', 'sub3 (called sub1)', 'no'], ['4', 'main', 'yes: x = 1']] } },
      'Compare static scoping: sub2, sub1, main. Static skips `sub3`; dynamic includes it, because `sub3` is on the call chain.',
      'Here both end in `main`, so the value is the same (1). The search path is what differs.',
    ],
    ptree: { tree: subTree.tree, caption: 'Nesting in the text. Dynamic search ignores this picture and follows the calls instead: main → sub3 → sub1 → sub2.' },
    answer: '`sub2` itself, then `sub1` (its caller), then `sub3`, then `main`, where `x` is found.',
    mistake: 'Writing the static path (skipping `sub3`), or listing the calls oldest-first (main, sub3, sub1). Dynamic search starts at the newest call.',
    tryIt: { q: 'Under DYNAMIC scoping, in what order are subprograms searched for the `z` in `c`, and what prints?', code: "def a():\n    def b():\n        def c():\n            print(z)\n        c()\n    def d():\n        z = 2\n        b()\n    z = 1\n    d()\na()", a: 'c, b, d (found, z = 2). It prints 2. (Static would search c, b, a and print 1.)' },
  };

  // ------------------------------------------------------------ arguments
  H['x-argue-dynscope'] = {
    asks: 'Take a side on dynamic scoping and back it up: a criterion, a code example, and what the other side gains.',
    idea: 'A good design argument has four parts: a side, the criterion it rests on (readability, writeability, reliability or cost), a concrete example, and an honest trade-off. Either side can earn full marks.',
    steps: [
      'Side: no, use static scoping.',
      'Criterion: readability and reliability.',
      'Example: in the kiwi program, the `kiwi` that `f` adds is 16 when called one way and 12 when called from `g`. You cannot tell from `f`’s text, and any function `f` calls could change `f`’s locals.',
      'Trade-off: dynamic scoping lets a called subprogram use its caller’s variables without passing parameters, which makes it easier to avoid globals.',
    ],
    answer: 'No. Criterion: readability and reliability. In the kiwi program, `f`’s `kiwi` is 16 or 12 depending on who called `f`, so you cannot tell what a name means by reading the code, and any called function can change its callers’ locals. Trade-off: a called subprogram can use its caller’s variables without parameters, which helps avoid globals.',
    mistake: 'Stating a side with no example, or leaving out the trade-off. Check your answer against the four parts, not against the model wording.',
    tryIt: { q: 'Now argue the other side: give one reason FOR dynamic scoping, with its criterion and a short example.', a: 'Writeability: a helper like `print_line()` can use the caller’s `width` without it being passed as a parameter or made global. Trade-off: readers cannot tell which `width` it uses without tracing the calls.' },
  };

  H['x-argue-nested'] = {
    asks: 'Take a side on nested function definitions and back it up: a criterion, a code example, and what the other side gains.',
    idea: 'Same four parts: side, criterion, concrete example, honest trade-off. Nesting creates nested static scopes, which helps hide helpers but adds more places a name can come from.',
    steps: [
      'Side: yes, allow nested functions.',
      'Criterion: writeability and support for abstraction.',
      { text: 'Example: a helper only `area` uses lives inside it and reads `area`’s local `r`:', code: 'def area(r):\n    def sq():\n        return r * r\n    return 3.14159 * sq()' },
      'Trade-off: nested static scopes are harder to read (which `x` is this? follow the static ancestors) and to implement. C leaves them out.',
    ],
    answer: 'Yes. Criterion: writeability and support for abstraction. A helper used by only one function can be hidden inside it and read that function’s locals (e.g. `sq` inside `area` uses `r`). Trade-off: nested static scopes are harder to read and to implement; C leaves them out.',
    mistake: 'Arguing with no code example, or forgetting what the other side gains. Check your answer against the four parts, not against the model wording.',
    tryIt: { q: 'Argue the other side: why might a language leave nested functions out?', a: 'Readability and cost: with only one level of functions, a name is either local or global, so it is quick to find and simple to implement (as in C). Trade-off: helpers cannot be hidden inside the one function that uses them.' },
  };
})(globalThis.FC = globalThis.FC || {});
