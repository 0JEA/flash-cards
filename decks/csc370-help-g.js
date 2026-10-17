// Help walkthroughs for CSC 370, Lecture 5.2 (first half): lifetime (static, stack-dynamic,
// explicit and implicit heap-dynamic) and scope (static scoping, scope holes, globals,
// dynamic scoping). Format: see the header of decks/csc370-help.js.
// Every program output stated here was run: gcc (C), python3, node, bash `local`, perl.
(function (FC) {
  'use strict';
  const H = FC.help = FC.help || {};
  const leaf = label => ({ label, kids: [] });
  const node = (label, ...kids) => ({ label, kids });

  // The nesting from her slide 24 (and Sebesta’s big/sub1/sub2).
  const outerTree = {
    tree: node('outer', leaf('inner1'), leaf('inner2')),
    caption: 'outer declares x = 22, inner1 declares x = 12, inner2 uses x. inner2 is written inside outer, so outer is its static parent; inner1 is a sibling, not an ancestor.',
  };
  const outerCode = 'function outer(){\n   function inner1(){\n      var x = 12;\n      inner2();\n   }\n   function inner2(){\n      var y = x;\n   }\n   var x = 22;\n   inner1();\n}';

  // ---------------------------------------------------------------- stack-dynamic

  H['blank:b5.2-8-1ru0447'] = {
    asks: 'Name the three good things about stack-dynamic variables (locals that get a fresh cell on the run-time stack each call).',
    idea: 'Each call pushes its own little box of locals onto the stack and pops it on return. Own box per call means recursion works; popping means the space is reused and nobody has to free it.',
    steps: [
      { text: 'Two versions of the same recursive sum. The only difference is `static` on `k`:', code: 'int sumD(int n){ int k = n;        if (n == 0) return 0; return sumD(n-1) + k; }\nint sumS(int n){ static int k; k = n; if (n == 0) return 0; return sumS(n-1) + k; }' },
      'Recursion: `sumD(3)` gives 6, because each call keeps its own `k` (3, 2, 1, 0). `sumS(3)` gives 0: there is only ONE static `k`, and the deepest call overwrote it with 0 before anyone added it.',
      'Conserves storage: when `sumD` returns, its box is popped and the next call to any function reuses those same bytes. A static variable holds its cell for the whole run, even when unused.',
      'Freed automatically: you never write `free` for a local. Returning from the function pops it.',
    ],
    answer: 'They allow recursion (each call gets its own copy), they conserve storage (the same stack memory is reused by later calls), and they are freed automatically when the function returns.',
    mistake: 'Listing speed as an advantage. Compared with static variables, stack-dynamic ones are a little SLOWER (allocation and deallocation take time); that is the disadvantage on the same slide.',
    tryIt: { q: 'A language has only static variables (no stack). Which of the three advantages does it lose most visibly?', a: 'Recursion: every active call would share one copy of each local, so a deeper call overwrites the values a shallower call still needs.' },
  };

  H['blank:b5.2-7-1ioamgu'] = {
    asks: 'A stack-dynamic variable gets its memory cell at some moment during the run. Which moment?',
    idea: '"Elaborated" just means execution reaches the declaration and does what it says: set aside the cell. No call, no cell.',
    steps: [
      { text: 'Look at this C function:', code: 'void f(){\n   int a = 1;          /* cell for a made when f runs */\n   if (a > 0) {\n      int temp = 5;    /* cell for temp made when this block is entered */\n   }\n}                      /* both cells gone after f returns */' },
      'Before `f` is ever called, `a` has no memory at all. Each call to `f` reaches `int a` and binds `a` to a fresh stack cell; returning unbinds it.',
      'So the binding happens at run time, when the declaration is reached. Its TYPE (`int`) was fixed at compile time; only the storage is dynamic.',
      'Sebesta adds a detail: many compilers reserve all of a function’s locals together when the function starts. The meaning is the same: the cell exists from the call until the return.',
    ],
    answer: 'When their declaration statements are elaborated, i.e. when execution reaches the declaration at run time (in practice, when the function is called).',
    mistake: 'Saying "at compile time". That is when a static variable’s cell is fixed (before execution begins). A stack-dynamic variable has no cell until the code runs.',
    tryIt: { q: 'In C, `void g(){ for (int i = 0; i < 3; i++) { int sq = i * i; } }`. When is `sq` bound to a cell, and how many times per call to g?', a: 'Each time execution enters the loop body and reaches `int sq`, so conceptually 3 times per call (a fresh `sq` each iteration), and it is unbound when the body ends.' },
  };

  H['blank:b5.2-7-1x6mab9'] = {
    asks: 'What is the everyday example of a stack-dynamic variable in C or Java?',
    idea: 'Anything declared inside a function body without `static` lives on the stack: born when the function runs, gone when it returns.',
    steps: [
      { text: 'Sort the variables in this C file by lifetime:', code: 'int count = 0;              /* global          */\nvoid f(int n){              /* parameter n     */\n   int total = 0;           /* local           */\n   static int calls = 0;    /* static local    */\n   int *p = malloc(4);      /* p local, *p heap */\n}' },
      { text: 'Only the plain locals (and parameters) are stack-dynamic:', table: { head: ['variable', 'kind of lifetime'], rows: [['count', 'static (whole run)'], ['n, total, p', 'stack-dynamic'], ['calls', 'static (because of `static`)'], ['what p points to', 'explicit heap'] ] } },
      'In Java, variables declared in methods are stack-dynamic by default, the same way.',
    ],
    answer: 'Local variables of functions/methods (declared inside the function, not `static`).',
    mistake: 'Forgetting that a `static` local in C is NOT stack-dynamic: `static` gives it a cell for the whole run even though it is declared inside the function.',
    tryIt: { q: 'In `void h(){ static int s; int t; }`, which variable is stack-dynamic?', a: '`t`. `s` is static: one cell for the whole run.' },
  };

  H['blank:b5.2-8-2axjd9'] = {
    asks: 'Stack-dynamic variables cost something static variables don’t. What work happens at run time?',
    idea: 'A static variable’s address is settled before the program starts. A local has to be given space on every call and given back on every return, and that takes (a little) time.',
    steps: [
      { text: 'Call this a million times:', code: 'int sq(int n){\n   int r = n * n;   /* r: space reserved on entry, released on return */\n   return r;\n}' },
      'Every call: allocate room for `n` and `r` on the stack (push), and every return: deallocate it (pop). One million calls = one million allocations and deallocations.',
      'Sebesta notes this cost is small, because all of a function’s locals are pushed and popped together. Accessing them can also be a bit slower than a static variable’s direct address.',
    ],
    answer: 'Allocation and deallocation (done at run time, on every call and return).',
    mistake: 'Answering "garbage collection". The stack needs no garbage collector; popping a frame is the deallocation.',
    tryIt: { q: 'Which costs no allocation time at all during the run: a global in C, or a parameter?', a: 'The global. It is bound to its cell before execution begins; a parameter is allocated on every call.' },
  };

  H['blank:b5.2-8-1nwwcf2'] = {
    asks: 'Second disadvantage of stack-dynamic: because languages treat simple values and structures differently, what do programmers mix up?',
    idea: 'One line of code can put some things on the stack and others on the heap, depending on whether the thing is a single value or a structure. Programmers lose track of which is which. (This answer is a best guess at her blank; check it against your notes.)',
    steps: [
      'In Java, a local `int n` (a scalar) sits on the stack. A local array `int[] a = new int[3];` puts only the reference `a` on the stack; the three ints themselves live on the heap.',
      { text: 'In C the same confusion bites: a local array is on the stack and dies at return, so this is a bug:', code: 'int *make(){\n   int a[3] = {1, 2, 3};   /* on the STACK */\n   return a;              /* pointer to a dead frame */\n}' },
      'Knowing what is on the stack (gone at return) versus the heap (lives until freed) is exactly what the slide warns gets confused.',
    ],
    answer: 'Stack versus heap: what is stored where (rules often differ for scalars and structures).',
    mistake: 'Thinking every local variable’s data is on the stack. A local can be just a pointer or reference on the stack whose data is on the heap.',
    tryIt: { q: 'In C, `void f(){ int *p = malloc(3 * sizeof(int)); }`. Where is `p`, and where are the 3 ints?', a: '`p` is a local, on the stack (gone at return). The 3 ints are on the heap (they stay until `free`; here nothing frees them, so they leak).' },
  };

  // ---------------------------------------------------------------- explicit heap

  H['blank:b5.2-9-1f8ecni'] = {
    asks: 'Who or what creates and destroys an explicit heap variable?',
    idea: '"Explicit" means you, the programmer, write the instruction that asks for the memory, and it runs during execution.',
    steps: [
      { text: 'In C you write both instructions yourself:', code: 'int *p = malloc(sizeof(int));   /* allocate: an explicit instruction */\n*p = 42;\nfree(p);                         /* deallocate: another one */' },
      'Nothing is allocated until that `malloc` line actually runs, so this happens during execution, not at compile time.',
      'C++ uses `new` and `delete`. Java uses `new` to create objects; Java has no explicit delete, so its garbage collector does the freeing.',
    ],
    answer: 'Explicit run-time instructions written by the programmer (e.g. `malloc`/`free` in C, `new`/`delete` in C++, `new` in Java).',
    mistake: 'Mixing it up with implicit heap, where storage is allocated just by assigning a value (Python lists). Explicit means there is a visible allocation instruction.',
    tryIt: { q: 'C++: `int *q = new int[n];` ... `delete[] q;`. Which lines allocate and deallocate, and when do they run?', a: '`new int[n]` allocates, `delete[] q` deallocates. Both run during execution, when control reaches them.' },
  };

  H['blank:b5.2-9-n29d31'] = {
    asks: 'How can your program get at an explicit heap variable?',
    idea: 'A heap cell has no name of its own. The only handle you have is an address stored in a pointer or reference.',
    steps: [
      { text: 'Follow the cell:', code: 'int *p = malloc(sizeof(int));  /* the new cell has no name */\n*p = 7;                        /* reach it only through p */\np = NULL;                      /* handle gone: cell unreachable */' },
      'After `p = NULL` the cell still exists on the heap, but nothing points to it. You can never use or free it again: a memory leak.',
      'Java is the same: all objects are made with `new`, and a variable like `s` holds a reference to the object, never the object itself.',
    ],
    answer: 'Only through pointers or references (the heap cells themselves are nameless).',
    mistake: 'Thinking the pointer variable `p` IS the heap variable. `p` is an ordinary (often stack) variable; the heap variable is the nameless cell it points to.',
    tryIt: { q: '`int *a = malloc(4); int *b = a; a = NULL;` Can the heap cell still be used?', a: 'Yes, through `b`. It holds the same address, so the cell is still reachable.' },
  };

  H['blank:b5.2-10-1lyuxb'] = {
    asks: 'What can explicit heap allocation do that static and stack variables can’t do as easily?',
    idea: 'A static or stack variable’s size is written in the code. The heap lets you ask for exactly as much memory as you discover you need, while the program runs.',
    steps: [
      { text: 'The size comes from the user, at run time:', code: 'int n;\nscanf("%d", &n);\nint *scores = malloc(n * sizeof(int));   /* n not known until now */' },
      'Linked lists and trees are the classic case: each new node is one more `malloc`, so the structure can grow and shrink during execution.',
    ],
    answer: 'You can make items whose size isn’t known until run time (e.g. dynamic structures like linked lists and trees that grow and shrink).',
    mistake: 'Answering "it’s faster". Heap allocation is slower than stack or static; its advantage is flexibility of size.',
    tryIt: { q: 'Why would a program that reads an unknown number of lines from a file use the heap?', a: 'It can’t know at compile time how many lines will come, so it allocates (or grows) storage at run time as lines arrive.' },
  };

  H['blank:b5.2-10-1ii9e8o'] = {
    asks: 'Why do explicit heap variables cause so many bugs?',
    idea: 'You manage the memory by hand, through pointers. Forget to free and memory leaks; free too early and a pointer points at nothing valid.',
    steps: [
      { text: 'Dangling pointer:', code: 'int *p = malloc(sizeof(int));\nfree(p);\n*p = 5;     /* p still holds the address, but the cell is gone */' },
      { text: 'Leak:', code: 'int *q = malloc(100);\nq = malloc(100);   /* first block lost forever, never freed */' },
      'Both compile without complaint. That is why Sebesta lists "difficulty of using pointer and reference variables correctly" as the first disadvantage.',
    ],
    answer: 'Pointers/references are hard to use correctly: dangling pointers, memory leaks.',
    mistake: 'Thinking the compiler catches these. It doesn’t; they show up (or silently corrupt data) only at run time.',
    tryIt: { q: '`int *a = malloc(4); int *b = a; free(a);` What is `b` now?', a: 'A dangling pointer: it still holds the address of a cell that has been freed.' },
  };

  H['blank:b5.2-10-183ma1q'] = {
    asks: 'Besides bugs, what does explicit heap allocation cost in speed?',
    idea: 'Two costs: every use goes through a pointer first (an extra step), and the system has to keep track of which heap pieces are free.',
    steps: [
      { text: 'Compare reaching a value:', code: 'int x = 5;      /* x: read the cell directly */\nint *p = malloc(sizeof(int));\n*p = 5;         /* read p, THEN go to the address in p */' },
      'That extra hop on every access is the "cost of references" (indirection).',
      'The heap is disorganized: `malloc` must search for a free block big enough, and `free` must put it back. That bookkeeping is heap storage management, and it costs time.',
    ],
    answer: 'The cost of references (indirection on every access) and of heap storage management.',
    mistake: 'Listing only one of the two. The slide’s blank is about the cost of using references AND the complexity of managing the heap.',
    tryIt: { q: 'Which is cheaper to allocate: 10 local ints in one function, or 10 separate `malloc(sizeof(int))` calls? Why?', a: 'The 10 locals: they are reserved together when the function’s stack frame is pushed. Each `malloc` must search and update the heap’s free-block records.' },
  };

  // ---------------------------------------------------------------- implicit heap

  H['blank:b5.2-11-1tfkhqm'] = {
    asks: 'For implicit heap variables, when is storage allocated and freed?',
    idea: 'You never ask for memory. Assigning a value IS the request: the language makes a heap object big enough for it, every time.',
    steps: [
      { text: 'Sebesta’s JavaScript example, then a reassignment:', code: 'highs = [74, 84, 86, 90, 71];   // heap space for a 5-number array\nhighs = "warm";                 // new heap space for a string' },
      'Line 1: storage for the array is allocated just because you assigned it. No `new`, no `malloc`.',
      'Line 2: `highs` is rebound to new storage, and the old array is no longer used; the system reclaims it later without you writing anything.',
      'Her examples: all variables in APL, lists in Python, strings and arrays in Perl, JavaScript and PHP.',
    ],
    answer: 'Automatically, whenever values are assigned (no explicit allocation instruction).',
    mistake: 'Saying "when the function is called". That is stack-dynamic. Implicit heap binding happens on each assignment.',
    tryIt: { q: 'Python: `a = [1, 2]` then `a = a + [3]`. How many list objects get heap storage, and did you request any?', a: 'Two: `[1, 2]` and the new `[1, 2, 3]` made by `a + [3]`. You never requested memory; each assignment did it.' },
  };

  H['blank:b5.2-12-amhff2'] = {
    asks: 'What is good about implicit heap variables, and who benefits?',
    idea: 'The programmer writes the least memory code possible: no sizes, no types, no freeing. The same code works for whatever you assign.',
    steps: [
      { text: 'One Python function works on a list of any size and any element type:', code: 'def first_and_last(xs):\n    return [xs[0], xs[-1]]\n\nfirst_and_last([3, 9, 4])        # [3, 4]\nfirst_and_last(["a", "b"])       # [\'a\', \'b\']' },
      'No `malloc`, no array size, no `free`. Sebesta calls this the highest degree of flexibility, which allows highly generic code.',
    ],
    answer: 'It is easy on the programmer: very flexible, so generic code is simple to write.',
    mistake: 'Saying it is easy on the computer. The machine does MORE work (the disadvantages on the same slide).',
    tryIt: { q: 'In C, a function that returns a growing list must take a size or call `realloc`. Why doesn’t the Python version need either?', a: 'Python lists are implicit heap: the language allocates and resizes storage automatically as values are assigned or appended.' },
  };

  H['blank:b5.2-12-1chqbh'] = {
    asks: 'What gets slower because of implicit heap allocation?',
    idea: 'Everything the programmer no longer decides, the running program has to work out: types, sizes, new storage on every assignment.',
    steps: [
      { text: 'In Python, this line does a lot behind the scenes:', code: 'x = x + 1' },
      'At run time it must check what `x` currently is (int? string? list?), pick the right `+`, make heap storage for the result, and rebind `x`. A C compiler decides all that before the program runs.',
      'Sebesta: the run-time overhead of maintaining all the dynamic attributes.',
    ],
    answer: 'Execution: there is run-time overhead.',
    mistake: 'Saying it slows compilation or the programmer. It speeds up the programmer; it slows the running program.',
    tryIt: { q: 'Why can a C compiler emit one machine add for `a + b` with two `int`s, but a Python interpreter can’t?', a: 'In Python the types of `a` and `b` are only known at run time, so it must check them each time before it can choose the operation.' },
  };

  H['blank:b5.2-12-x45n2b'] = {
    asks: 'Implicit heap variables aren’t type checked by a compiler. What does that cost you?',
    idea: 'Any variable can be given a value of any type. So a typo that assigns the wrong thing is not an error; it just changes the variable’s type and fails later.',
    steps: [
      { text: 'Sebesta’s example, in Python: you meant `i = x` but typed `i = y`.', code: 'x = 5\ny = [1, 2]\ni = y          # meant: i = x\nprint("no error yet")\nprint(i + 1)   # TypeError here, much later' },
      'No complaint at `i = y`; `i` simply becomes a list. The crash comes later at `i + 1`.',
      'In a statically typed language (C, Java) the compiler rejects the bad assignment before the program ever runs.',
    ],
    answer: 'Error detection: the compiler can no longer catch type errors.',
    mistake: 'Thinking the error is lost forever. It usually still shows up, but at run time and far from the real mistake, which is harder to debug.',
    tryIt: { q: 'In JavaScript, `total = 0; ... total = "0";` Does anything stop the second line?', a: 'No. `total` silently becomes a string; a later `total + 5` gives "05" instead of 5.' },
  };

  H['blank:b5.2-12-15xkz2k'] = {
    asks: 'Which two jobs behind the scenes get complicated with implicit heap variables?',
    idea: 'Every assignment may create a new heap object and abandon an old one. Someone has to hand out space (storage management) and find and take back the abandoned pieces (garbage collection).',
    steps: [
      { text: 'Each assignment here makes a new list and leaves the old one behind:', code: 'a = [1]\na = [1, 2]\na = [1, 2, 3]   # the first two lists are now garbage' },
      'Storage management: find heap room of the right (changing) size for each new value.',
      'Garbage collection: detect that `[1]` and `[1, 2]` are no longer reachable and reclaim their memory, since the programmer never says `free`.',
    ],
    answer: 'Storage management and garbage collection.',
    mistake: 'Thinking the programmer does these. With implicit heap the language system does both, which is exactly why they are complex.',
    tryIt: { q: 'Python: `s = "a"; s = s + "b"; s = s + "c"`. How many string objects become garbage by the end?', a: 'Two: `"a"` and `"ab"`. Only `"abc"` is still referenced by `s`.' },
  };

  // ---------------------------------------------------------------- static scope

  H['blank:b5.2-18-1bdnapt'] = {
    asks: 'Under static scoping, the compiler sees a name like `x`. Where does it look for the declaration first?',
    idea: 'Always start at home: the block or function where the name is used. Only if it isn’t declared there do you look outward.',
    steps: [
      { text: 'In this C function, which `num` does `printf` use?', code: 'int num = 1;\nvoid f(){\n   int num = 2;\n   printf("%d\\n", num);\n}' },
      'Search starts locally, in `f`. `f` declares `num`, so the search stops there and prints 2. The global `num` is never reached.',
    ],
    answer: 'Locally: in the current block or subprogram where the name is used.',
    mistake: 'Starting with globals because they are "declared first" in the file. Order in the file doesn’t matter; nearness does.',
    tryIt: { q: 'Python: `n = 5` then `def g(): n = 9; print(n)` and `g()`. What prints, and where did the search stop?', a: '9. `n` is assigned in `g`, so it is local to `g` and found on the first (local) search.' },
  };

  H['blank:b5.2-18-1l2aj7l'] = {
    asks: 'The name isn’t declared locally. Under static scoping, where does the compiler look next?',
    idea: 'Walk outward through the TEXT: the block or function that encloses this one, then the one around that, and so on to the outermost. Who called whom doesn’t matter.',
    steps: [
      { text: 'Her example (JavaScript). Which `x` does `inner2` use?', code: outerCode },
      'Local first: `inner2` declares no `x`.',
      'Next, its static parent, the function `inner2` is written inside: `outer`, which declares `x = 22`. Found; stop.',
      { text: 'The search path:', table: { head: ['step', 'scope searched', 'x declared?'], rows: [['1', 'inner2 (local)', 'no'], ['2', 'outer (static parent)', 'yes: 22']] } },
      'The `x = 12` in `inner1` is never searched: `inner1` is a sibling of `inner2`, not one of its enclosing scopes, even though it is the caller. (Running it with node gives 22.)',
    ],
    ptree: outerTree,
    answer: 'In the enclosing scopes: first the static parent, then the other static ancestors, until a declaration is found.',
    mistake: 'Looking in the CALLER (`inner1`). That is dynamic scoping. Static scoping follows the nesting in the source text.',
    tryIt: { q: 'JavaScript: `var x = "global"; function a(){ var x = "a"; function b(){ function c(){ console.log(x); } c(); } b(); } a();` What prints?', a: '`a`. c has no x, its static parent b has none, the next ancestor a has `x = "a"`.' },
  };

  H['blank:b5.2-18-y0ks90'] = {
    asks: 'What is the name for all the scopes that enclose a given scope?',
    idea: 'Think of a family tree drawn by nesting in the source code: your parent, grandparent and so on up to the top are your ancestors. "Static" because it’s fixed by the text.',
    steps: [
      { text: 'Nesting (Python):', code: 'def main():\n    def big():\n        def sub1():\n            def sub2():\n                ...' },
      'For `sub2`: the scopes that enclose it are `sub1`, `big` and `main`. Those are its static ancestors.',
      'The nearest one, `sub1`, has its own name: the static parent.',
    ],
    ptree: { tree: node('main', node('big', node('sub1', leaf('sub2')))), caption: 'Static ancestors of sub2: sub1, big, main.' },
    answer: 'Static ancestors.',
    mistake: 'Calling them "dynamic ancestors" or "callers". Callers are about the call stack (dynamic scope); ancestors here are about text nesting.',
    tryIt: { q: 'In the tree above, what are the static ancestors of `sub1`?', a: '`big` and `main` (`big` is also its static parent).' },
  };

  H['blank:b5.2-18-1c3pdl9'] = {
    asks: 'Among the enclosing scopes, what is the closest one called?',
    idea: 'Of all your static ancestors, the one directly around you is your static parent. It is the second place the compiler looks.',
    steps: [
      { text: 'Her example again:', code: outerCode },
      '`inner2` is written directly inside `outer`, so `outer` is the static parent of `inner2`. The same is true of `inner1`.',
      'Even though `inner1` calls `inner2`, `inner1` is not its static parent: calling has nothing to do with it.',
    ],
    ptree: outerTree,
    answer: 'The static parent.',
    mistake: 'Naming the caller as the parent. The caller is the dynamic parent; the static parent is the scope the function is WRITTEN inside.',
    tryIt: { q: 'Python: `def p():` contains `def q():` which contains `def r():`. Who is r’s static parent, and who are its static ancestors?', a: 'Static parent: `q`. Static ancestors: `q` and `p` (and the module/global scope around them).' },
  };

  H['blank:b5.2-20-1rd28ca'] = {
    asks: 'For an inner declaration to hide an outer variable, where must it be?',
    idea: 'The search stops at the first match going outward, so a declaration with the SAME name in a nearer scope wins, and the outer one is shut out. That gap is the scope hole.',
    steps: [
      { text: 'Run this:', code: 'int max = 100;\nvoid f(){\n   int max = 5;\n   printf("%d\\n", max);   /* 5 */\n}\nint main(){ f(); printf("%d\\n", max); }   /* 100 */' },
      'Inside `f`, the local `max` is closer, so the search finds it first: prints 5. The global `max` still exists (main prints 100), but `f` can’t reach it by that name.',
      'So the global `max` has a hole in its scope: the body of `f`.',
    ],
    answer: 'In a closer (more local) scope, with the same name. Losing access to the outer variable this way is a scope hole.',
    mistake: 'Thinking the inner declaration changes or replaces the outer variable. It doesn’t touch it; it only hides it inside the inner scope.',
    tryIt: { q: 'C: `int x = 1; void g(){ { int x = 2; } printf("%d", x); }` What does `g` print?', a: '1. The inner `x` only hides the global inside the inner block; after the block ends, `x` means the global again.' },
  };

  H['blank:b5.2-22-1ggm1g'] = {
    asks: 'Globals are usually a bad idea. Give a case where one is actually handy.',
    idea: 'A global is fine when almost every part of the program needs the same thing and nobody should be passing it around, especially if it never changes. (Her slide lists three examples we can’t see; this answer is a best guess, and any reasonable use counts.)',
    steps: [
      { text: 'A constant everyone reads:', code: '#define MAX_SIZE 100\nconst double PI = 3.14159;' },
      'Every function can use `PI` without a parameter, and because it is constant, no function can change it behind another’s back. That removes the usual danger of globals.',
      'Other reasonable answers: a debug flag, or a counter many functions update.',
    ],
    answer: 'For a value used everywhere, like a constant (`PI`, a maximum size); also e.g. a debug flag or a shared counter.',
    mistake: 'Giving an ordinary working variable (like a loop counter) as the example. The point of a good global is that it is truly needed everywhere.',
    tryIt: { q: 'Why is a global `const int LANES = 4;` much safer than a global `int lanes = 4;`?', a: 'The `const` one cannot be changed, so no function can surprise another by modifying it; the plain one can be changed from anywhere.' },
  };

  H['blank:b5.2-25-2dcfzo'] = {
    asks: 'One disadvantage of static scoping: what do programmers end up doing with their variables?',
    idea: 'Under static scoping a function can only see variables in the scopes it is written inside. When a change means two far-apart functions both need a variable, the quick fix is to move it to the top: make it global.',
    steps: [
      { text: 'Start: only `report` needs `count`.', code: 'void report(){ int count = 0; ... }\nvoid save(){ ... }   /* later: now save needs count too */' },
      'Under static scoping, `save` can’t see a local of `report`. The easy fix is to move `count` out to the global level so both can see it.',
      'Repeat that over years and most variables end up global, with far more access than any one function needs. Sebesta: designers are encouraged to use far more globals than necessary.',
    ],
    answer: 'Make them global (giving too much access).',
    mistake: 'Answering "make them local". Static scoping’s problem is that it pushes variables OUTWARD, toward globals.',
    tryIt: { q: 'Instead of making `count` global, what is a cleaner fix for `save` needing it?', a: 'Pass it as a parameter (or keep it in a structure both functions are given), so only those two functions can reach it.' },
  };

  // ---------------------------------------------------------------- dynamic scope

  H['blank:b5.2-26-1jx8zl7'] = {
    asks: 'Dynamic scoping has one real advantage that helps you avoid globals. What is it?',
    idea: 'Under dynamic scoping a name is looked up through the CALL STACK: if the function doesn’t declare it, its caller’s variable is used. So a helper can read its caller’s locals without any parameters.',
    steps: [
      { text: 'Bash `local` variables are dynamically scoped:', code: 'report(){ echo "$name scored $score"; }\ngrade(){ local name=Ana; local score=91; report; }\ngrade' },
      'This prints `Ana scored 91`. `report` declares nothing and takes no parameters.',
      { text: 'Look back through the call stack for `name`:', table: { head: ['stack (top first)', 'declares name?'], rows: [['report', 'no'], ['grade (caller)', 'yes: Ana']] } },
      'No globals and no parameter passing, yet `report` got the values. That is the advantage.',
    ],
    answer: 'A called subprogram can use its caller’s variables, so they don’t need to be passed as parameters or made global.',
    mistake: 'Thinking this makes programs easier to read. It doesn’t: you must know the calling sequence to know which variable a name means. That is its main disadvantage.',
    tryIt: { q: 'bash: `show(){ echo "$x"; }; a(){ local x=1; show; }; b(){ local x=2; show; }; x=0; a; b; show` What three lines print?', a: '1, 2, 0. Each `show` uses the `x` of whoever called it; the last call comes from the top level, so it sees the global 0.' },
  };

  // ---------------------------------------------------------------- scope / lifetime

  H['l52-scope-def'] = {
    asks: 'Give the definition of scope.',
    idea: 'Scope is about WHERE in the program text a name can be used. Think of highlighting the lines where you are allowed to write the name.',
    steps: [
      { text: 'Highlight where `t` can be used:', code: 'void f(){\n   int a = 1;\n   if (a) {\n      int t = 2;     /* t visible from here ... */\n      a = a + t;     /* ... to here */\n   }\n   /* t is not visible here */\n}' },
      'The scope of `t` is those statements inside the `if` block. Outside them, writing `t` is an error.',
      'Scope is space (which statements). Lifetime is time (when during the run a cell exists).',
    ],
    answer: 'The range of statements in a program over which a name is visible.',
    mistake: 'Defining scope as "how long the variable exists". That is lifetime.',
    tryIt: { q: 'C: `for (int i = 0; i < 3; i++) { ... }` then `printf("%d", i);` after the loop. Legal?', a: 'No. The scope of `i` is the `for` statement only, so `i` is not visible after the loop.' },
  };

  H['l52-lifetime-vs-scope'] = {
    asks: 'Explain the difference between lifetime and scope, using a `static` local variable in C.',
    idea: 'Lifetime is time (when a memory cell is held). Scope is space (which lines can name it). A C static local pulls them apart: it lives the whole run, but only one function can see it.',
    steps: [
      { text: 'Her program, called three times:', code: 'void foo() {\n   int a = 10;\n   static int sa = 10;\n   a += 5;\n   sa += 5;\n   printf("a = %d, sa = %d\\n", a, sa);\n}\n/* prints: a = 15, sa = 15\n           a = 15, sa = 20\n           a = 15, sa = 25 */' },
      '`sa` keeps growing, so its cell survives between calls: lifetime = the whole run.',
      '`a` is back to 15 every time, because it is stack-dynamic: a new cell each call.',
      'Yet `sa = sa * 2;` inside `main` is a compile error: `sa` is visible only inside `foo`. Long lifetime, local scope.',
      { text: 'Side by side:', table: { head: ['variable', 'lifetime (time)', 'scope (space)'], rows: [['a', 'one call of foo', 'body of foo'], ['sa', 'whole program run', 'body of foo']] } },
    ],
    answer: 'Lifetime is time: how long during execution the name is bound to a memory cell. Scope is space: the statements where the name is visible. A C static local lives for the whole run (static lifetime) but is visible only inside its function (local scope).',
    mistake: 'Assuming a variable stops existing the moment you can’t see it. `sa` is invisible in `main` but still alive, holding its value for the next call.',
    tryIt: { q: 'C: `int tick(){ static int n = 0; n++; return n; }`. `main` calls `tick()` three times and prints the third result. What prints, and what are n’s lifetime and scope?', a: '3. Lifetime: the whole run (static, so n keeps counting). Scope: only the body of `tick`.' },
  };

  H['l52-implicit-heap'] = {
    asks: 'Where in memory do Python lists live: stack, explicit heap, implicit heap, or static?',
    idea: 'Ask two questions. Did the programmer write an allocation instruction? (No.) Does the memory appear just because a value was assigned? (Yes.) That is implicit heap.',
    steps: [
      { text: 'Making and replacing a list in Python:', code: 'nums = [4, 8, 15]   # heap storage appears on assignment\nnums = nums + [16]  # new list allocated, old one later reclaimed' },
      'No `malloc` or `new` anywhere, and nobody frees anything: allocation and deallocation happen automatically on assignment.',
      'Not stack: a list can outlive the function that made it (you can return it). Not static: it doesn’t exist before the run.',
      'Her slide lists Python lists right next to APL variables and Perl/JavaScript/PHP strings and arrays as implicit heap.',
    ],
    answer: 'Implicit heap: storage is allocated and freed automatically whenever values are assigned.',
    mistake: 'Picking explicit heap because lists are on "the heap". The heap part is right; what makes it implicit is that you never ask for the memory yourself.',
    tryIt: { q: 'In JavaScript, `let words = ["hi", "yo"];`. What kind of storage holds the array?', a: 'Implicit heap. The array’s storage is allocated just by assigning it; there is no allocation instruction.' },
  };

  H['l52-explicit-heap'] = {
    asks: 'Where in memory do Java objects live: implicit heap, stack, static, or explicit heap?',
    idea: 'Java objects only come into existence when the programmer writes `new`. A written allocation instruction means explicit heap.',
    steps: [
      { text: 'Making an object in Java:', code: 'StringBuilder sb = new StringBuilder();   // explicit: you wrote new\nsb.append("hi");                          // reached only through the reference sb' },
      'The object is on the heap, made by an explicit run-time instruction (`new`), and reached only through the reference `sb`. Those are the two marks of explicit heap.',
      'The local variable `sb` itself is stack-dynamic; it just holds the reference.',
      'C’s version: `malloc` to make it, `free` to release it. Java has no `free`; its garbage collector reclaims objects, but creating them is still explicit.',
    ],
    answer: 'Explicit heap: the programmer creates them with `new`, and they are accessed only through references.',
    mistake: 'Choosing implicit heap because Java frees objects automatically. The category is decided by how the object is CREATED: an explicit `new` makes it explicit heap.',
    tryIt: { q: 'In C++, `Node *n = new Node();`. What kind of storage holds the Node, and what holds `n` if it is a local?', a: 'The Node is explicit heap (made by `new`, freed with `delete`). The local pointer `n` is stack-dynamic.' },
  };

  // ---------------------------------------------------------------- traces

  H['l52-block-trace'] = {
    asks: 'Trace `doThis()` and give exactly what it prints. Two different variables are both called `num`.',
    idea: 'Each `num` is visible only in its own block. The `while (i < num)` test sits OUTSIDE the loop’s braces, so it sees the outer `num` (10). Inside the braces, the inner `num` hides it.',
    steps: [
      'Outer scope of `doThis`: `num = 10`, `i = 1` (this local `i` hides the global `i = 89`).',
      'Loop test `i < num` uses the outer `num`, 10. The body declares a fresh inner `num = 0` every pass, adds 1, and prints 1. It also increments the outer `i` (no inner `i`).',
      { text: 'Pass by pass:', table: { head: ['pass', 'i at test', 'i < 10?', 'inner num printed'], rows: [['1', '1', 'yes', '1'], ['2', '2', 'yes', '1'], ['…', '…', 'yes', '1'], ['9', '9', 'yes', '1'], ['-', '10', 'no: stop', '-']] } },
      'Nine passes, nine `1 `s. After the loop the inner `num` is gone, so the last `printf` uses the outer `num`: 10.',
      { text: 'Output:', code: '1 1 1 1 1 1 1 1 1 \n10' },
    ],
    answer: '1 1 1 1 1 1 1 1 1, then a newline and 10. The inner num is new (0, then 1) each pass; the loop test and the last printf see the outer num, 10.',
    mistake: 'Thinking `num++` changes the loop test’s `num`, so the loop ends early or prints 1, 2, 3, … The inner `num` is a different variable, re-created at 0 on every pass.',
    tryIt: { q: 'What does `go()` print? `void go(){ int k = 3; int j = 0; while (j < k){ int k = 7; k = k + j; j++; printf("%d ", k); } printf("\\n%d\\n", k); }`', a: '`7 8 9` then 3. The test uses the outer k = 3 (3 passes, j = 0, 1, 2); the inner k is 7 + j; after the loop, k is the outer 3.' },
  };

  H['l52-block-java'] = {
    asks: 'The same `doThis()` compiles in C and C++ but is rejected in Java and C#. What rule is different?',
    idea: 'C lets an inner block reuse a name and hide the outer one. Java and C# designers thought that was too error-prone, so they ban a nested local from reusing an enclosing local’s name.',
    steps: [
      'Inside the `while` block, `int num = 0;` declares a second `num` while the function’s own `num` is still in scope.',
      'C and C++: legal. The inner one hides the outer one in the block (a scope hole). gcc compiles it; only `-Wshadow` warns.',
      { text: 'Java refuses it. javac says:', code: 'error: variable num is already defined in method doThis()' },
      'Hiding a GLOBAL `i` with a local `i` (also in this code) is not the problem; the ban is on a nested local hiding an enclosing LOCAL.',
    ],
    answer: 'The inner block redeclares `num` while the outer local `num` is still in scope. Java and C# forbid a local in a nested block from hiding an enclosing local; C and C++ allow it, and the inner one hides the outer one.',
    mistake: 'Blaming the loop, or the fact that C has `printf`. The only problem for Java is the second `int num` inside the nested block.',
    tryIt: { q: 'Would Java accept `void f(){ { int t = 1; } { int t = 2; } }`?', a: 'Yes (javac compiles it). The two `t`s are in separate sibling blocks; when the second is declared, the first is no longer in scope, so nothing is hidden.' },
  };

  H['l52-py-trace'] = {
    asks: 'Run the Python program in your head and give the five numbers it prints, in order.',
    idea: 'Python decides each name’s scope per function, from the text. An assignment in a function makes the name local to that whole function, unless `nonlocal` or `global` says otherwise. Find which `x` each line means, then follow the values.',
    steps: [
      'Global: `x = 12`, `y = 82`. Call `f(12)`.',
      'In `f`: `y` is never assigned, so it is the global y: prints 82. `x = 13` appears in `f`, so `f` has its own local `x`.',
      '`g` says `nonlocal x`, so g’s `x` IS f’s `x`. (g’s parameter `y` is a separate y; it doesn’t matter here.)',
      { text: 'Follow the one shared x of f and g:', table: { head: ['line run', 'which x', 'value', 'prints'], rows: [['f top', '(y = global)', '-', '82'], ['f: x = 13', 'f’s x', '13', ''], ['g: print', 'f’s x', '13', '13'], ['g: x = 55', 'f’s x', '55', ''], ['h: print', 'f’s x (h looks outward)', '55', '55'], ['f bottom', 'f’s x', '55', '55'], ['global print', 'global x', '12', '12']] } },
      '`h` has no `x`, so it looks out to its static parent `g`, whose `x` is f’s. The global `x` was never touched: 12.',
    ],
    ptree: { tree: node('global  (x = 12, y = 82)', node('f  (x = 13)', node('g  (nonlocal x)', leaf('h  (uses x)')))), caption: 'Static nesting: h looks out to g, and g’s x is f’s x.' },
    answer: '82 13 55 55 12',
    mistake: 'Thinking `x = 55` in g changes the global x, so the last number is 55. `nonlocal` links g to f’s x only; the global x stays 12.',
    tryIt: { q: 'What two numbers does this print?', code: 'a = 1\ndef p():\n    a = 2\n    def q():\n        nonlocal a\n        a = a + 10\n    def r():\n        global a\n        a = a + 100\n    q()\n    r()\n    print(a)\np()\nprint(a)', a: '12 then 101. q changes p’s a (2 to 12); r changes the global a (1 to 101). p prints its own a, 12.' },
  };

  H['l52-py-unbound'] = {
    asks: 'Say what happens when the commented-out print at the top of f is turned back on.',
    idea: 'Python decides scope before running, for the whole function at once. Because `f` assigns `x` somewhere (`x = 13`), every `x` in `f` means f’s local x, even on lines above the assignment.',
    steps: [
      'Compile time: Python sees `x = 13` in `f`, so `x` is local to all of `f`.',
      'Run time: the first line of `f` reads local `x`, but nothing has been assigned to it yet.',
      'It does not fall back to the global `x = 12`: the scope was already decided, statically.',
      { text: 'python3 output:', code: 'In f top, y is:  82\nUnboundLocalError: cannot access local variable \'x\' where it is not associated with a value' },
    ],
    answer: 'UnboundLocalError: x = 13 later in f makes x local to all of f, so the read comes before the local is bound.',
    mistake: 'Expecting it to print the global 12 because the assignment comes later. Scope is fixed for the whole function by the text, not by which line runs first.',
    tryIt: { q: 'Python, three lines: `n = 1`, then `def p(): print(n); n = 2`, then `p()`. What happens? And if you delete `; n = 2`?', a: 'UnboundLocalError, because `n = 2` makes n local to all of p. Without it, n is not local, so the search reaches the global and it prints 1.' },
  };
})(globalThis.FC = globalThis.FC || {});
