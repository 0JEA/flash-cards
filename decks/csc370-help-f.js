// "Help" walkthroughs for CSC 370, Lecture 5.1 (names, binding, binding time, type, value,
// address/storage). Format: see decks/csc370-help.js. Math is OFF for this class.
// Every printed value below was produced by actually running the code (gcc 16 on x86-64
// Linux, Python 3, Node, Perl, Guile, javac). Addresses are from one real run; yours differ.
(function (FC) {
  'use strict';
  const H = FC.help = FC.help || {};

  H['blank:b5.1-2-1y46yxe'] = {
    asks: 'What a name stands in for: the thing you would have to handle directly if names did not exist.',
    idea: 'Before names, programmers wrote raw memory addresses. A name is a label stuck on a memory location so you never have to know its number. Sebesta puts it as: a variable is an abstraction of a memory cell (or a group of cells).',
    steps: [
      'In machine language you would say "add 5 to the cell 4 bytes below the frame pointer". In C you just write `count = count + 5;` and let the compiler find the cell.',
      { text: 'Compile that line with gcc and look at the machine code: the name `count` is gone, replaced by its location.', code: 'count = count + 5;        /* what you write  */\naddl $0x5,-0x4(%rbp)      /* what gcc made   */' },
      'The same goes for the other named things: a label (`evenNum:`) names where a statement sits, and a subprogram (`sumToN(12)`) names where its code starts. Every name hides a memory location.',
      'That was the big step from machine language to assembly language: names replaced numeric addresses, and the translator chose the addresses.',
    ],
    answer: 'Memory: a name is an abstraction of a memory cell (or cells), i.e. of an address you no longer have to know.',
    mistake: 'Answering "a value". The value is what sits in the cell. The name refers to the cell itself; the value can change while the cell stays the same.',
    tryIt: { q: 'In `int score = 90;`, what does the name `score` abstract, and what is `90`?', a: '`score` abstracts a memory cell (its address); 90 is the value stored in that cell.' },
  };

  H['blank:b5.1-13-1dentfq'] = {
    asks: 'Give one binding that is fixed when the language itself is designed, before any compiler for it exists.',
    idea: 'Language design time is when the language’s authors write the rulebook. Whatever the rulebook fixes (what a symbol means, which words start which statements) is bound then, once, for every compiler and every program.',
    steps: [
      'A binding pairs an entity with an attribute. Here the entity is the symbol `*` and the attribute is the operation "multiply".',
      { text: 'In this line, nobody chose that `*` multiplies: not you, and not the compiler writer. The designers of C did, when they defined the language.', code: 'area = width * height;' },
      'Other design-time bindings: `while` means "repeat while true", `%` means remainder.',
      'Quick test: if changing it would make it a different language, it was bound at design time.',
    ],
    answer: 'The symbol `*` bound to the multiplication operation (Sebesta’s example).',
    mistake: 'Giving a per-program binding such as "a variable bound to its type". That happens each time a program is compiled; design time happens once, for the whole language.',
    tryIt: { q: 'When is the C word `if` bound to "choose what to run based on a condition"?', a: 'Language design time: it is part of the definition of C, the same in every compiler and every program.' },
  };

  H['blank:b5.1-13-uyuo26'] = {
    asks: 'Give one binding made by the people who build a compiler (or interpreter) for the language, after the language is designed but before anyone’s program is compiled.',
    idea: 'The language definition deliberately leaves some details open. C says an `int` must be at least 16 bits but may be bigger, so each implementation picks the actual size, and that size fixes the range of values.',
    steps: [
      'The entity is the type `int`; the attribute is its set of possible values.',
      { text: 'gcc on x86-64 Linux chose 32 bits. Running this printed the range:', code: 'printf("%zu bits: %d to %d\\n", sizeof(int) * 8, INT_MIN, INT_MAX);\n/* prints: 32 bits: -2147483648 to 2147483647 */' },
      'The compiler writers made that choice once, and it holds for every program that compiler builds. That is language implementation time.',
      'Sebesta’s other example of the same kind: how a literal like `5` is stored inside the machine. He calls it "compiler design time", which means the same thing.',
    ],
    answer: '`int` bound to its range of values, e.g. 32 bits: -2147483648 to 2147483647 with gcc.',
    mistake: 'Calling it design time. The C designers chose not to fix the size of `int`; they left that to each implementation.',
    tryIt: { q: 'When is the number of bytes in a C `double` bound?', a: 'Language implementation time: the compiler writers choose it (gcc on x86-64 uses 8 bytes).' },
  };

  H['blank:b5.1-13-3wpx1n'] = {
    asks: 'Give one binding that the compiler makes while it translates your particular program.',
    idea: 'The compiler reads your declarations and writes each variable’s type into its symbol table. From then on every use of that name is checked against the type, all before the program runs.',
    steps: [
      { text: 'When gcc reads the first line, it binds `count` to type `int`. Your next program could make `count` a `double`: this binding belongs to one program.', code: 'int count;\ncount = count + 5;' },
      'It happens during compilation and never changes while the program runs, so it is a static binding.',
      'The compiler then uses the type straight away: because `count` is an `int`, it picks integer addition for `+` (gcc emitted an integer `addl` instruction).',
      'Contrast Python: `x = 5` then `x = "hi"` changes x’s type while running, so there the type is bound at run time. That is why the answer names C and Java.',
    ],
    answer: 'A variable bound to its type, e.g. `int count;` in C or Java: the compiler fixes it from the declaration.',
    mistake: 'Saying "a variable bound to its value". The value changes as the program runs, so that is run time.',
    tryIt: { q: 'Inside a C function: `double avg = 0;`. When is `avg` bound to its type, and when to its value 0?', a: 'Type: compile time, from the declaration. Value: run time, when the statement executes on each call.' },
  };

  H['blank:b5.1-13-1mvewaw'] = {
    asks: 'Give one binding made when the program is loaded into memory, after compiling but before `main` starts.',
    idea: 'A global or `static` variable needs exactly one cell for the whole run. That cell is settled when the program is placed in memory, before execution begins, and it never moves until the program ends.',
    steps: [
      { text: 'Both of these are static variables: one cell each, for the whole run.', code: 'int total = 0;                          /* global */\nvoid f(void) { static int calls = 0; calls++; }' },
      { text: 'A C program printed `&total` from several calls, then was run again:', table: { head: ['run', 'call', '&total'], rows: [['1', '1st', '0x55c05b59b02c'], ['1', '2nd', '0x55c05b59b02c'], ['1', '3rd', '0x55c05b59b02c'], ['2', '1st', '0x55fa7f04c02c']] } },
      'Same address on every call, but a new one in the next run: Linux places the program somewhere new each time it loads it. So the address is fixed at load, never during calls.',
      'Sebesta calls this static binding: made before run time begins and unchanged for the whole execution.',
    ],
    answer: 'A C static or global variable bound to its memory cell when the program is loaded.',
    mistake: 'Mixing it up with a local variable. A non-static local gets a new cell on every call (run time); only globals and `static` variables keep one cell from load to exit.',
    tryIt: { q: '`static int hits = 0;` sits inside a function that is called 5 times. How many cells does `hits` get, and when is it bound to one?', a: 'One cell, bound at load time. All 5 calls share it, which is why `hits` remembers its value between calls.' },
  };

  H['blank:b5.1-13-3j4dxz'] = {
    asks: 'Give one binding that is made while the program is running.',
    idea: 'A non-static local variable gets a fresh cell on the run-time stack each time its function is called, and gives it back on return. Calls happen during execution, so this binding is made at run time, again and again.',
    steps: [
      { text: 'A recursive function with one local and one global:', code: 'int total = 0;\nvoid f(int depth) {\n    int local = depth;\n    printf("%p %p\\n", (void *)&local, (void *)&total);\n    if (depth < 3) f(depth + 1);\n}' },
      { text: 'Calling `f(1)` gave these addresses (one real run; yours will differ):', table: { head: ['depth', '&local', '&total'], rows: [['1', '0x7ffdf48a2284', '0x55c05b59b02c'], ['2', '0x7ffdf48a2254', '0x55c05b59b02c'], ['3', '0x7ffdf48a2224', '0x55c05b59b02c']] } },
      'Three active calls, three different cells for `local`: each call got its own copy when it started. The global `total` stays at one address.',
      'This is what makes recursion work: every active call has its own version of the locals.',
    ],
    answer: 'A local (non-static) variable bound to a memory cell, freshly on each call.',
    mistake: 'Thinking it is only the value that is bound at run time. For a local, the cell itself (its address) is bound at run time, a new one per call.',
    tryIt: { q: 'A recursive function with a local `int n` is 4 calls deep. How many `n` cells exist right now, and when was each bound?', a: 'Four, one per active call; each was bound at run time when its call began.' },
  };

  H['blank:b5.1-20-uo4ng'] = {
    asks: 'What a variable’s value actually is, in terms of memory. (Her slide has two sub-points: one blank, most likely "the bits", and "programmer meaning". The answer here is a best guess at her wording, so check it against your notes.)',
    idea: 'Memory only holds bits. The value is the bits in the variable’s cell(s), read through the variable’s type: the type is what turns a bit pattern into the programmer’s meaning (a letter, a whole number, a decimal).',
    steps: [
      'Sebesta: the value is the contents of the memory cell or cells associated with the variable. Address says where; value says what is there.',
      { text: 'The same byte read two ways:', code: 'unsigned char c = 65;\nprintf("%c %d\\n", c, c);     /* prints: A 65 */' },
      { text: 'The same 32 bits stored once as a `float`, then read as an `unsigned int`:', table: { head: ['bits (hex)', 'read as', 'value'], rows: [['40490fd0', 'float', '3.141590'], ['40490fd0', 'unsigned int', '1078530000']] } },
      'So a value is bits plus meaning, and the type supplies the meaning. Sebesta also calls the value the r-value (what you get with the name on the right of `=`) and the address the l-value.',
    ],
    answer: 'The contents of the memory cell(s) at the variable’s address (the bits), given meaning by its type (the programmer’s meaning).',
    mistake: 'Confusing value with address. In `y = x;`, `x` supplies its value (contents) and `y` supplies its address (where to store).',
    tryIt: { q: 'In `int a = 7; int b = a;`, which attribute of `a` does the second statement use, and which attribute of `b`?', a: 'It uses `a`’s value (r-value: the contents, 7) and `b`’s address (l-value: where to put it).' },
  };

  H['l51-attrs'] = {
    asks: 'List the six attributes a name (variable) carries.',
    idea: 'Think of six questions you can ask any variable: What are you called? Where do you live? What do you hold? What kind of thing are you? Where in the code can you be seen? How long do you exist?',
    steps: [
      { text: 'Ask the six questions of `int count = 0;` written inside a C function:', table: { head: ['attribute', 'question', 'for `count`'], rows: [
        ['name', 'what is it called?', '`count`'],
        ['address', 'where in memory?', 'a stack cell, new on each call'],
        ['value', 'what is stored there?', '0, then whatever is assigned'],
        ['type', 'what values and operations?', '`int`'],
        ['scope', 'where in the code is it visible?', 'from its declaration to the end of its block'],
        ['lifetime', 'how long is it bound to a cell?', 'while that call is running'],
      ] } },
      'Her slides go through them in exactly this order: name, address, value, type, scope, lifetime.',
    ],
    answer: 'Name, address, value, type, scope, lifetime.',
    mistake: 'Merging scope and lifetime. Scope is WHERE in the program text the name can be used; lifetime is WHEN during the run the variable has memory. A `static` local has a small scope but lives for the whole run.',
    tryIt: { q: 'Give all six attributes of a C global `double rate = 0.05;`.', a: 'Name `rate`; address fixed at load time; value 0.05; type `double`; scope from its declaration to the end of the file; lifetime the whole run.' },
  };

  H['l51-name-issues'] = {
    asks: 'Asking whether twoDArray and twoDarray are one name settles one of the four design issues for names. Name it.',
    idea: 'Think of the rules on any sign-up form for a username: which characters? Is "Bob" the same as "bob"? Are some words banned? How long can it be? A language designer answers the same four questions for names.',
    steps: [
      { text: 'Each issue, with the examples from her slides:', table: { head: ['issue', 'question', 'examples'], rows: [
        ['characters', 'which characters may a name use?', 'letters, digits, _ (Java, Python); almost anything (Scheme); some characters carry meaning (Perl, Fortran)'],
        ['case', 'is `twoDArray` the same as `twoDarray`?', 'case-sensitive: Java, C, Python; not: Scheme'],
        ['special words', 'reserved words, or only keywords?', 'reserved: Java, Python, C; keywords only: Fortran'],
        ['length', 'is there a limit?', 'short only: early Fortran; any length: Java, Python; a max: C'],
      ] } },
      'All four are about the spelling of the name itself, not about what the name refers to.',
    ],
    answer: 'Case sensitivity. (The four issues: allowed characters, case sensitivity, reserved words or keywords, length.)',
    mistake: 'Listing variable attributes (type, scope, lifetime). Those belong to the variable; these four belong to the name’s spelling.',
    tryIt: { q: 'A language rule says: "names may be up to 8 characters long, and `Total` and `total` are different names". Which two design issues does it settle?', a: 'Length (max 8) and case sensitivity (yes, case-sensitive).' },
  };

  H['l51-case'] = {
    asks: 'Which language treats `twoDArray` and `twoDarray` as the same name?',
    idea: 'Case-sensitive means the compiler compares names letter for letter, capitals included. The C family and Python do that; her slides name Scheme as the language that does not.',
    steps: [
      { text: 'In Python these are two separate variables:', code: 'twoDArray = 1\ntwoDarray = 2\nprint(twoDArray, twoDarray)    # prints: 1 2' },
      'Java and C behave the same way. Sebesta’s example: in C++, `rose`, `ROSE` and `Rose` are three different names.',
      'On her slides, Scheme ignores case, so those two spellings name one variable. That is classic Scheme; newer Scheme standards (and Guile, which is installed here) are case-sensitive, but for this course the answer is Scheme.',
    ],
    answer: 'Scheme: its names are not case-sensitive (on her slides), while Java, C and Python are.',
    mistake: 'Assuming every language works like Python. Here the odd one out is the one that ignores case.',
    tryIt: { q: 'In C, are `Count` and `count` the same variable?', a: 'No. C is case-sensitive, so they are two different names.' },
  };

  H['l51-anychar'] = {
    asks: 'Which language lets names use almost any character on the keyboard, not just letters, digits and `_`?',
    idea: 'In Scheme every operator is written inside parentheses with spaces around it, like `(- a b)`. So a `-`, `?` or `!` inside a word cannot be mistaken for an operator, and it can be part of a name.',
    steps: [
      { text: 'All three of these are ordinary names in Scheme (this ran in Guile):', code: '(define total-sum 10)\n(define empty? #t)\n(define set-count! 3)' },
      { text: 'In C, the same spelling means something else: `total-sum` is subtraction.', code: 'int total = 10, sum = 3;\nprintf("%d\\n", total-sum);     /* prints: 7 */' },
      'Java and Python allow only letters, digits and underscore, so `total_sum` is the closest they get.',
    ],
    answer: 'Scheme.',
    mistake: 'Picking Python because its names feel flexible. Python names are still only letters, digits and underscore.',
    tryIt: { q: 'Which of these could be one name in Scheme but not in C: `total_sum` or `total-sum`?', a: '`total-sum`. In C it reads as total minus sum; `total_sum` is a legal name in both.' },
  };

  H['l51-meaning'] = {
    asks: 'In which language does a character inside the name tell you something about the variable?',
    idea: 'In Perl the first character of a variable’s name says what kind of variable it is: `$` a scalar (one number or string), `@` an array, `%` a hash. The character is part of the name and carries meaning.',
    steps: [
      { text: 'Three different variables that share the word `apple`:', code: '$apple = 5;\n@apple = (1, 2, 3);\n%apple = (a => 1);\nprint "$apple ", scalar(@apple), " ", scalar(keys %apple), "\\n";\n# prints: 5 3 1' },
      'Sebesta: each prefix gives its own namespace, so `@apple` and `%apple` are unrelated, and a reader always knows the kind of variable just from its name.',
      'Fortran did it with the first letter: by default, names starting with I to N were integers and the rest were reals.',
    ],
    answer: 'Perl (Fortran too): `$`, `@` and `%` mark the kind of variable.',
    mistake: 'Treating Perl’s `$` as decoration, like an underscore. Change the prefix and you are naming a different variable.',
    tryIt: { q: 'In Perl, what kind of variable is `@scores`, and what kind is `$total`, from the names alone?', a: '`@scores` is an array; `$total` is a scalar (a single number or string).' },
  };

  H['l51-keywords'] = {
    asks: 'Which language has no reserved words at all, only words that are special in certain positions?',
    idea: 'A reserved word can never be used as a name (`while` in C). A keyword is special only where the grammar expects it; anywhere else it is an ordinary name. Fortran uses only keywords.',
    steps: [
      { text: 'The difference:', table: { head: ['kind', 'can it be a variable name?', 'example'], rows: [['reserved word', 'never', '`while`, `class`, `int` in C, Java, Python'], ['keyword', 'yes, outside its special position', '`INTEGER`, `REAL` in Fortran']] } },
      { text: 'Sebesta’s Fortran example. The first word of each line is read as the type, the second as a name:', code: 'INTEGER REAL\nREAL INTEGER' },
      'That declares a variable named `REAL` of type integer and a variable named `INTEGER` of type real. Legal, and very hard to read.',
      'Python, by contrast, refuses `class = 5` with a `SyntaxError`, because `class` is reserved.',
    ],
    answer: 'Fortran.',
    mistake: 'Treating "keyword" and "reserved word" as the same thing. In this course they differ: reserved means never a name; keyword means special only in context.',
    tryIt: { q: 'Can you name a variable `for` in C? Can you name one `DO` in Fortran?', a: 'C: no, `for` is reserved. Fortran: yes, because DO is only a keyword.' },
  };

  H['l51-maxlen'] = {
    asks: 'Which language puts an upper limit on how long a name can be?',
    idea: 'Her slide gives three positions on length: names must be short (early Fortran, at most 6 characters), any length (Java, Python), or a maximum length (C).',
    steps: [
      'Sebesta: in C99 only the first 63 characters of an internal name are significant, and external names (the ones the linker handles) are limited to 31.',
      'So two long names that differ only past that point may be treated as the same name.',
      'Strictly, the C standard sets how many characters a compiler must at least pay attention to; gcc actually keeps them all (two 70-character names differing only in the last character stayed separate). Her slides call this C’s max length, and that is the answer she expects.',
      'Java and Python have no limit, and every character counts.',
    ],
    answer: 'C.',
    mistake: 'Thinking Java or Python cap names. Both allow any length.',
    tryIt: { q: 'Two global functions differ only in their 35th character. Under the C99 rule for external names (31 significant characters), what could go wrong?', a: 'The linker may treat them as the same name, so they would clash.' },
  };

  H['l51-bindtimes'] = {
    asks: 'Order the five binding times on her slide, earliest first.',
    idea: 'Follow a language from idea to running program: someone designs it, someone builds a compiler for it, you compile your program, the system loads it, and it runs. Each stage can bind things.',
    steps: [
      { text: 'Each time, who decides, and one example:', table: { head: ['time', 'who decides', 'example'], rows: [
        ['1. language design', 'the language’s designers', '`*` means multiply'],
        ['2. language implementation', 'the compiler writers', '`int` is 32 bits (gcc)'],
        ['3. compile', 'the compiler reading your program', '`count` is an `int`'],
        ['4. load', 'the system placing it in memory', 'a global’s address'],
        ['5. run', 'the running program', 'a local’s address; `count`’s value'],
      ] } },
      'Each stage needs the one before it: you cannot build a compiler before the language exists, or load a program before it is compiled.',
      'Sebesta also mentions link time (a library call bound to the library’s code), which falls between compile and load. Her list leaves it out.',
    ],
    answer: 'Language design, language implementation, compile, load, run.',
    mistake: 'Swapping design and implementation. Design writes the rulebook; implementation builds a compiler from that rulebook, so it comes second.',
    tryIt: { q: 'Order by binding time: (a) local `i` gets a stack cell, (b) `double` gets 8 bytes, (c) `%` means remainder, (d) a variable declared `float x;` gets type float.', a: 'c (design), b (implementation), d (compile), a (run).' },
  };

  H['l51-entities'] = {
    asks: 'Name the kind of entity the name evenNum: stands for.',
    idea: 'A name labels a place in memory, and three kinds of things live in memory: data (variables), statements (labels mark where one sits), and code you call (subprograms).',
    steps: [
      { text: 'All three in one C fragment:', code: 'char *stuName = "Jackie";   /* variable   */\nevenNum:                    /* label      */\n    n = n + 2;\nsumToN(12);                 /* subprogram */' },
      { text: 'What each name stands for:', table: { head: ['kind', 'example', 'the name stands for'], rows: [['variable', '`stuName = “Jackie”`', 'the cells holding the data'], ['label', '`evenNum:`', 'the location of a statement (a `goto` target)'], ['subprogram', '`sumToN(12)`', 'where the subprogram’s code starts']] } },
      'In every case the name is an abstraction of a memory location.',
    ],
    answer: 'A label (a statement location). Names can also stand for variables (stuName) and subprograms (sumToN(12)).',
    mistake: 'Forgetting labels. They are rare in modern code, but `goto evenNum;` jumps to a statement by its name.',
    tryIt: { q: 'In the C line `loop: total = total + price(item);`, find a name of each kind.', a: 'Label: `loop`. Variables: `total`, `item`. Subprogram: `price`.' },
  };

  H['l51-binding-def'] = {
    asks: 'Define a binding.',
    idea: 'A binding is a pairing: this thing goes with this property. Binding time is simply when the pairing is made.',
    steps: [
      'Binding: an association between an entity (a variable, a symbol) and an attribute (a type, a value, an operation, an address).',
      { text: 'Sebesta’s line `count = count + 5;` contains several bindings, each made at its own time:', table: { head: ['entity', 'attribute', 'binding time'], rows: [['variable `count`', 'its type, `int`', 'compile'], ['symbol `+`', 'integer addition', 'compile'], ['variable `count`', 'its new value', 'run']] } },
      'Binding time: the moment that association is made, anywhere from language design to run time.',
      'Made before run time and never changed: static. Made during the run, or able to change: dynamic.',
    ],
    answer: 'An association between an entity and an attribute. Binding time is when that association is made.',
    mistake: 'Defining binding as "assigning a value". Assignment is only one kind of binding (variable and value); types, addresses and operations are bound too.',
    tryIt: { q: 'Inside a C function, `float rate;`. Name two bindings and their times.', a: '`rate` with type `float` at compile time; `rate` with a stack cell at run time, on each call.' },
  };

  H['l51-bind-classify'] = {
    asks: 'Give the binding time of the type of count in count = count + 5; (C).',
    idea: 'For each part ask who could possibly decide it: the compiler writers (for every program), the compiler reading THIS program, or the program as it runs.',
    steps: [
      { text: 'Work through the five:', table: { head: ['part', 'bound to', 'when', 'why'], rows: [
        ['(1) type of `count`', '`int`', 'compile', 'the compiler reads the declaration'],
        ['(2) values `count` can hold', '-2147483648 to 2147483647', 'implementation', 'the compiler writers chose a 32-bit `int`'],
        ['(3) meaning of `+`', 'integer addition', 'compile', 'needs the operand types first'],
        ['(4) representation of `5`', 'its bit pattern', 'implementation', 'the compiler writers chose the format'],
        ['(5) value of `count`', 'the new sum', 'run', 'the statement has to execute'],
      ] } },
      { text: 'You can see (3) being decided: gcc turned the line into an integer add instruction.', code: 'addl $0x5,-0x4(%rbp)' },
      'Sebesta words (2) and (4) as "compiler design time". That is the same as language implementation time.',
    ],
    answer: 'Compile time. (Values count can hold: implementation; meaning of +: compile; representation of 5: implementation; value of count: run.)',
    mistake: 'Calling (3) design time. The designers bound `+` to addition in general, but whether it is integer or floating-point addition depends on this program’s types, so the compiler decides.',
    tryIt: { q: 'Inside a C function, `double avg = total / 2.0;`. Binding time of (1) the meaning of `/` here, (2) the value of `avg`?', a: '(1) Compile time: seeing a `double` operand, the compiler picks floating-point division. (2) Run time.' },
  };

  H['l51-bind-classify2'] = {
    asks: 'Give the binding time of a C global variable’s address.',
    idea: 'Walk the life of a program: the language is designed, a compiler is built, the program is loaded, then it runs. Put each item where it is first settled.',
    steps: [
      { text: 'The four items:', table: { head: ['item', 'when', 'how you know'], rows: [
        ['(1) global’s address', 'load', 'same address on every call, new address each run'],
        ['(2) non-static local’s address', 'run', 'a new cell on every call'],
        ['(3) bits in an `int`', 'implementation', 'gcc chose 32; C itself only requires at least 16'],
        ['(4) `while` starts a loop', 'design', 'part of the definition of C'],
      ] } },
      { text: 'Proof for (1) and (2): a recursive function printed both addresses three calls deep.', table: { head: ['call depth', '&local', '&global'], rows: [['1', '0x7ffdf48a2284', '0x55c05b59b02c'], ['2', '0x7ffdf48a2254', '0x55c05b59b02c'], ['3', '0x7ffdf48a2224', '0x55c05b59b02c']] } },
      'The global never moved during the run (it was placed at load); the local got a fresh stack cell on each call.',
    ],
    answer: 'Load time. (Non-static local’s address: run; bits in an int: implementation; while starts a loop: design.)',
    mistake: 'Giving both addresses the same time. Globals and `static` variables are placed once, at load; non-static locals get new storage every call.',
    tryIt: { q: 'In C: (1) the address of a `static` local variable, (2) that `%` means remainder, (3) the value of a global after `g = 4;` executes.', a: '(1) Load time. (2) Language design time. (3) Run time.' },
  };

  H['l51-type-name'] = {
    asks: 'Which language shows a variable’s type in the spelling of its name?',
    idea: 'Her slide has four ways to say what type a variable is: say nothing (just use the name), say it is a variable and let the compiler infer the type, put the type in the name, or declare it explicitly.',
    steps: [
      { text: 'The four ways:', table: { head: ['how the type is given', 'example', 'language'], rows: [
        ['implicit: just use the name', '`x = 5`', 'Python'],
        ['say it is a variable; type inferred', '`var x = 5;`', 'C#'],
        ['type is part of the name', '`$x`, `@xs`, `%table`', 'Fortran, Perl'],
        ['declared explicitly', '`int x = 5;`', 'Java, C, Pascal, Ada'],
      ] } },
      'In Perl `$` marks a scalar, `@` an array and `%` a hash, so the name itself carries the type.',
    ],
    answer: 'Perl (Fortran also does this).',
    mistake: 'Choosing Python because its types are implicit. A Python name says nothing about the type: `x` can hold an int and later a string.',
    tryIt: { q: 'Which of the four ways is each? (a) `var total = 10;` in C#, (b) `int total = 0;` in C, (c) `@totals = (1, 2);` in Perl.', a: '(a) say it is a variable, type inferred; (b) declared explicitly; (c) type is part of the name.' },
  };

  H['l51-type-infer'] = {
    asks: 'Which language uses the word `var` to declare a variable and has the compiler work out its type?',
    idea: 'C# `var` means "this is a variable; work out its type from the value I give it". The type is still fixed by the compiler, before the program runs.',
    steps: [
      { text: 'Sebesta’s C# example:', code: 'var sum = 0;\nvar name = "Fred";' },
      'The compiler sees the initial values and binds `sum` to `int` and `name` to `string`. That is why a `var` declaration must include an initial value.',
      'Sebesta stresses these are still statically typed: the type is fixed for the life of the unit they are declared in. Python is different: it binds types at run time, and they can change.',
    ],
    answer: 'C#.',
    mistake: 'Thinking `var` makes C# dynamically typed like Python. Inference is done once, by the compiler; the type cannot change afterward.',
    tryIt: { q: 'In C#, `var count = 10;`. What type is `count`, and when is it bound?', a: '`int`, at compile time, inferred from the initial value 10.' },
  };

  H['l51-type-dynamic'] = {
    asks: 'In which language is a variable’s type decided while the program runs, and able to change?',
    idea: 'With dynamic type binding a variable has no declared type. It takes the type of whatever value it is assigned, at the moment that assignment runs, and can switch types later.',
    steps: [
      { text: 'Run in Node (JavaScript):', code: 'let x = 5;\nconsole.log(typeof x);   // number\nx = "hi";\nconsole.log(typeof x);   // string' },
      'Same variable, two types, decided at run time. Her slide lists Python and JavaScript as dynamic; C and Java as static.',
      'TypeScript is the trap: it adds type annotations to JavaScript and checks them before the program runs, so its types are bound statically.',
    ],
    answer: 'JavaScript.',
    mistake: 'Picking TypeScript because it sounds like JavaScript. Its whole purpose is to add static types.',
    tryIt: { q: 'Python: `n = 3`, then later `n = [3, 4]`. What happens to `n`’s type, and when?', a: 'It changes from `int` to `list` when the second assignment runs (run time). Python binds types dynamically.' },
  };

  H['l51-type-exact'] = {
    asks: 'Which language lets a value of one type be used as another type without you writing a cast?',
    idea: 'This is the "how exact is type checking?" design issue. Java insists the types match (or that one fits inside the other); C quietly converts and carries on.',
    steps: [
      { text: 'This C compiled with no warnings (`gcc -Wall`) and ran:', code: 'int i = 3.9;          /* i = 3: the .9 is dropped        */\ndouble d = 7 / 2;     /* d = 3.0: int division, then widened */\nif (5) printf("5 is true\\n");   /* an int used as a condition */' },
      { text: 'The same ideas in Java do not compile:', table: { head: ['line', 'C', 'Java'], rows: [['`int i = 3.9;`', 'accepted, i = 3', 'error: possible lossy conversion from double to int'], ['`if (5)`', 'accepted, 5 counts as true', 'error: int cannot be converted to boolean'], ['`double d = 5;`', 'accepted', 'accepted (int fits inside double)']] } },
      'The last row is her "or subset": Java accepts an `int` where a `double` is expected, because every int value fits.',
    ],
    answer: 'C.',
    mistake: 'Thinking "no cast" means "no conversion". C still converts 3.9 to 3; it just does it silently.',
    tryIt: { q: 'In C, does `int flag = \'A\';` compile without a cast? What is `flag`?', a: 'Yes. A char is treated as an int, so `flag` is 65.' },
  };

  H['l51-storage'] = {
    asks: 'Two parts: when a variable’s address can be decided (before or during the run), and which region of memory it can live in.',
    idea: 'Static storage is decided before the program runs and stays put. Everything else is dynamic, decided while running: on the stack (one cell per call) or on the heap (cells handed out on request).',
    steps: [
      { text: 'The four kinds (Sebesta’s categories):', table: { head: ['kind', 'address decided', 'where', 'example'], rows: [
        ['static', 'before run (load)', 'static area', 'C global `int total;`'],
        ['stack-dynamic', 'run time, each call', 'stack', 'C local `int count;`'],
        ['explicit heap-dynamic', 'run time, when the code asks', 'heap', 'C `p = malloc(sizeof(int));`'],
        ['implicit heap-dynamic', 'run time, on assignment', 'heap', 'JavaScript `highs = [74, 84, 86, 90, 71];`'],
      ] } },
      'Explicit means the programmer writes the allocation (`malloc` in C, `new` in C++). Implicit means the language allocates by itself whenever you assign.',
      'Where the address lives sets the lifetime (lecture 5.2): static for the whole run, stack for one call, heap until freed or garbage-collected.',
    ],
    answer: 'Statically (before run time), or dynamically at run time: on the stack, or on the heap (explicit or implicit).',
    mistake: 'Thinking "dynamic" means the heap only. Stack variables are dynamic too: their address is decided at run time, on each call.',
    tryIt: { q: 'Classify: (a) `static int hits;` inside a C function, (b) the 100 bytes from `malloc(100)`, (c) JavaScript `names = ["a", "b"];`.', a: '(a) static, (b) explicit heap-dynamic, (c) implicit heap-dynamic.' },
  };

  H['l51-case-arg'] = {
    asks: 'An argue question: take a side on case-sensitive names and back it up.',
    idea: 'A good argument has four parts: a side, a concrete example, the reason it matters, and the other side’s best point. Her key leans against case sensitivity, but a well-argued "for" also earns marks.',
    steps: [
      'Side: names should NOT be case-sensitive.',
      'Example: should `twoDArray` and `twoDarray` be one variable or two? Most readers would take them as the same name.',
      'Reason (readability): treating them as different invites confusion. Sebesta: names that look alike but mean different things break the rule that similar-looking things should mean similar things. And ignoring case does not stop anyone writing camelCase.',
      'Other side: languages are case-sensitive partly because it is less work for the compiler writer: names are compared exactly, character by character.',
    ],
    answer: 'Against (her key): `twoDArray` vs `twoDarray` as two variables invites confusion and hurts readability, since most people read them as the same name; case-insensitivity still allows camelCase. For: it is simpler for the compiler writer (exact string comparison).',
    mistake: 'Stating an opinion with no example and no reason. Without the `twoDArray`/`twoDarray` example and the readability point, it is not an argument.',
    tryIt: { q: 'Write a short "for case sensitivity" argument with an example.', a: 'For: case can carry meaning; C programmers conventionally write constants in capitals (`MAX`) and variables in lowercase (`max`), so the two can coexist. It also keeps the compiler simple (exact comparison). Concede: similar-looking names can confuse a reader.' },
  };

  H['l51-explicit-types'] = {
    asks: 'Why is writing the type (`int count;`) better than just using a name (`count = 0`)? Four reasons.',
    idea: 'A declaration is a promise written down. The compiler can check it and plan memory with it; the programmer and the reader can read it.',
    steps: [
      { text: 'Spelling: Python silently makes a new variable from a typo, while C (declarations required) refuses.', code: '# Python\ntotal = 0\ntotl = total + 5      # no error: a new variable totl\n\n/* C */\nint total = 0;\ntotl = total + 5;     /* error: ‘totl’ undeclared */' },
      { text: 'All four, and who benefits:', table: { head: ['advantage', 'who it helps', 'example'], rows: [
        ['catches misspelled names', 'the compiler (for you)', '`totl` above'],
        ['clearer purpose', 'the programmer', 'writing `int count` forces you to decide what it holds'],
        ['reader knows the type', 'the reader', 'in `x = 5`, is x an integer or a real? `double x = 5;` says'],
        ['right space allocated at once', 'the compiler', '`int` is 4 bytes, `double` 8 (gcc)'],
      ] } },
      'Her test asks for three; knowing all four covers whichever three you remember.',
    ],
    answer: 'The compiler can catch spelling errors; the programmer has a clearer idea what the variable is for; the reader knows the intended type (in `x = 5`, integer or real?); the compiler can allocate the right amount of space immediately.',
    mistake: 'Giving the spelling reason three times in different words. Each of the four helps someone different: compiler, programmer, reader, memory layout.',
    tryIt: { q: 'In Python you meant `rate = rate * 2` but typed `rte = rate * 2`. What happens, and which advantage of declarations would have caught it?', a: 'Python quietly creates a new variable `rte`, and `rate` never changes. With required declarations the compiler would reject the undeclared name `rte`.' },
  };

  H['l51-spaces'] = {
    asks: 'Should names be allowed to contain spaces? Give a reason either way.',
    idea: 'Spaces are how both the compiler and the reader tell where one word stops and the next starts. Let names contain spaces and that signal is gone.',
    steps: [
      'It could work: `average grades = sum of grades / number of grades` reads like English.',
      'But take `if average grades < 50.0 :`. Is the name `if average grades`, `average grades`, or two names, `average` and `grades`? Neither the compiler nor the reader can tell for sure.',
      'Practical reason: names visible outside the program are passed to the linker, and most linkers do not allow spaces.',
      'So it shouldn’t. Write `averageGrades` or `average_grades` instead.',
    ],
    answer: 'It could, but it shouldn’t. Simple cases read well, but `if average grades < 50.0 :` becomes ambiguous (is the name `if average grades`, `average grades`, or two names?), and most external linkers forbid spaces.',
    mistake: 'Stopping at "it would be confusing" without the example. The `if average grades` line shows exactly where it breaks.',
    tryIt: { q: 'If names could contain spaces, how many ways could `print total cost` be read?', a: 'Several: one name `print total cost`; `print` applied to a name `total cost`; or three separate names. That ambiguity is the argument against.' },
  };

  H['l51-single'] = {
    asks: 'Should a language ban one-letter names like `x` or `i`? Take a side and say why.',
    idea: 'Her answer is yes, for two reasons you can test yourself: a one-letter name tells the reader nothing, and you cannot search for it.',
    steps: [
      'Readable: `numbers[row][column]` tells you what each index means; `numbers[i][j]` makes you work it out.',
      'Searchable: search a file for `i` and you hit every `i` in `if`, `int`, `print`. Search for `row` and you find the variable.',
      'The usual exception is loop indices (`for i in ...`), but even there a real name reads better.',
    ],
    answer: 'Yes (her answer): single-letter names are not readable and not searchable. The possible exception is loop indices, but `numbers[row][column]` is still more readable than `numbers[i][j]`.',
    mistake: 'Only saying "they are short". Give the two named reasons, readable and searchable, plus the loop-index exception.',
    tryIt: { q: 'Rename the names in `t = p * q` for a shop till, and say which of the two reasons you fixed.', a: 'e.g. `total = price * quantity`. Now it is readable (says what each holds) and searchable (searching for `price` finds only that variable).' },
  };

  H['l51-name-objcode'] = {
    asks: 'Say where a variable’s name ends up in the object code.',
    idea: 'Names are for people. The machine only uses addresses, so the compiler looks each name up in its symbol table and writes the address into the instructions instead.',
    steps: [
      'Names let people avoid knowing where something is in memory, what bits it actually holds, and how long it is stored.',
      { text: 'Compile `count = count + 5;` (with `count` a local) and look at the machine code. The instruction says "add 5 to the cell at -4 from the frame pointer"; `count` is gone.', code: 'count = count + 5;\naddl $0x5,-0x4(%rbp)' },
      'One nuance: names that other files need, such as global variables and function names, are kept in a symbol table in the object file so the linker can join files together (`nm` lists them). Local names like `count` vanish completely, and the instructions themselves never contain names.',
    ],
    answer: 'Nowhere: names are for people (they hide address, value and lifetime); the name never exists in the object code.',
    mistake: 'Thinking the computer looks names up while the program runs. The lookup happens at compile time, and only addresses reach the instructions.',
    tryIt: { q: 'Two functions each have a local named `temp`. In the compiled code, how does the machine tell them apart?', a: 'By location: each `temp` becomes a different stack offset in its own function’s instructions. The name `temp` is not in the instructions at all.' },
  };

  H['l51-unique'] = {
    asks: 'On a big team, does every programmer have to pick names nobody else uses?',
    idea: 'A name only means something inside its scope. Two functions can each have a local `count`, and they are two different variables that never meet. Only global names share one space for the whole program.',
    steps: [
      { text: 'Two locals with the same name, both fine:', code: 'void a(void) { int count = 1;  printf("%d\\n", count); }   /* prints 1  */\nvoid b(void) { int count = 99; printf("%d\\n", count); }   /* prints 99 */' },
      { text: 'Two globals with the same name in two files do clash. Linking them failed:', code: 'file1.c:  int limit;\nfile2.c:  int limit;\nld: multiple definition of `limit\'' },
      'Scope (where a name is visible) and lifetime (when it exists) keep names apart, so good practice is to keep names local to a small context.',
      'Languages with classes go further: each class is its own context, so even method names only need to be unique within their class.',
    ],
    answer: 'No, as long as the names are not global. Scope and lifetime rules mean a name only exists or is visible in certain places, so keep names local. Java goes furthest: classes give even method names a local context.',
    mistake: 'Saying "yes, otherwise they clash". Local names never clash; only globals need agreement.',
    tryIt: { q: 'Two programmers each write a function with a local `int i`. Two others each put a global `int max;` in their own file. Which pair has a problem?', a: 'The globals: both define the same global name, so linking fails. The two locals are separate variables.' },
  };

  H['x-argue-maxlen'] = {
    asks: 'An argue question: should names have a length limit? Take a side and justify it.',
    idea: 'Marks come from four parts, not from picking the "right" side: a side, the criterion it rests on, a concrete example, and what the other side gains.',
    steps: [
      'Side: no limit (or only a generous one).',
      'Criterion: readability. A long name can say what it holds.',
      'Example: `numberOfStudentsEnrolled` is clear. Early Fortran allowed at most 6 characters, forcing something like `NSTENR`, which nobody can decode.',
      'Trade-off (cost): a limit made early compilers and linkers simpler, since every symbol-table entry could be the same size. That is why C only promises a minimum number of significant characters (31 for external names in C99).',
    ],
    answer: 'No (or only a generous one), on readability: `numberOfStudentsEnrolled` vs early Fortran’s 6-character `NSTENR`. Trade-off: a limit made compilers and linkers cheaper and simpler.',
    mistake: 'Listing points for both sides and never choosing. Pick one, then concede the other side’s best point.',
    tryIt: { q: 'Argue FOR a limit of 12 characters, with all four parts.', a: 'Side: yes, 12. Criterion: readability (and writeability). Example: `totalAmountDueAfterAllDiscountsApplied` is tiring to read and type; `amountDue` says enough. Trade-off: some meanings need more than 12 characters, so names get cryptic abbreviations.' },
  };

  H['x-argue-reserved'] = {
    asks: 'An argue question: should a language’s special words be reserved (never usable as names) or keywords (special only in context, as in Fortran)?',
    idea: 'Same four-part shape as every argue question: side, criterion, concrete example, trade-off.',
    steps: [
      'Side: reserved.',
      'Criterion: readability. If a special word can also be a name, the reader has to work out which it is on every line.',
      { text: 'Example (Fortran, which has only keywords): this declares a variable named REAL of type integer, and a variable named INTEGER of type real.', code: 'INTEGER REAL\nREAL INTEGER' },
      'Trade-off: reserved words take names away from programmers. Sebesta: COBOL has 300 reserved words, including common names like `COUNT` and `LENGTH`. And adding a reserved word later breaks old programs: Python 3.7 reserved `async`, so code that used it as a name stopped working (`async = 1` is now a `SyntaxError`).',
    ],
    answer: 'Reserved, on readability: Fortran’s keywords allow `INTEGER REAL` and `REAL INTEGER`. Trade-off: reserved words take names from the programmer (no variable called `class`), and adding one later breaks old code that used it as a name.',
    mistake: 'Writing "reserved words are clearer" with no example. The `INTEGER REAL` line is what makes the argument land.',
    tryIt: { q: 'Argue for keywords instead, in four parts.', a: 'Side: keywords. Criterion: writeability. Example: with reserved words you cannot name a variable `class` or `count` (COBOL reserves COUNT). Trade-off: lines like Fortran’s `INTEGER REAL` become legal and hard to read.' },
  };
})(globalThis.FC = globalThis.FC || {});
