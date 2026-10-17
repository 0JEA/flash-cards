// "Help" walkthroughs for CSC 370, Lecture 2 (history), first half: early computing,
// Fortran, Lisp, Algol, COBOL, Prolog. Format: see the header of decks/csc370-help.js.
// Facts come from her Lecture 2 slides and Sebesta ch. 2 (the course text); Scheme and C
// sample outputs were checked by running them (guile, gcc).
(function (FC) {
  'use strict';
  const H = FC.help = FC.help || {};
  const leaf = label => ({ label, kids: [] });
  const node = (label, ...kids) => ({ label, kids });

  // ---------- Early computing ----------

  H['blank:b2-2-1agyy4z'] = {
    asks: 'Who designed the first computer: the Difference Engine (1832) and the Analytical Engine (1834)?',
    idea: 'The story of programming starts with a machine, not a language. One man in 19th-century England designed mechanical calculating machines, and the second one was general enough that someone could write programs for it.',
    steps: [
      'The problem of the era: tables of numbers (for navigation, science, engineering) were computed by hand and full of errors.',
      'Charles Babbage designed the Difference Engine to compute such tables mechanically, with gears instead of people.',
      'He then designed the Analytical Engine: a general machine driven by punched cards. Sebesta calls it "the first programmable computer"; it could even reuse a group of instruction cards in several places, the ancestor of a subprogram.',
      'Because it was programmable, it needed a programmer. That leads straight to the next name on the slide, Ada Lovelace.',
    ],
    answer: 'Charles Babbage.',
    mistake: 'Mixing up the two people: Babbage designed the machines; Ada Lovelace wrote programs (algorithms) for the Analytical Engine.',
    tryIt: { q: 'Which of Babbage\'s two machines is the one you could program with punched cards?', a: 'The Analytical Engine (1834). The Difference Engine did one fixed job: computing tables.' },
  };

  H['blank:b2-2-10jp8y1'] = {
    asks: 'Who wrote algorithms for Babbage\'s Analytical Engine and is called the first programmer?',
    idea: 'A machine that follows instructions needs someone to write the instructions. Ada Lovelace did that for Babbage\'s Analytical Engine, and she also saw that it could work on more than numbers.',
    steps: [
      'Babbage designed the Analytical Engine; Ada Lovelace worked with him.',
      'She wrote several algorithms for it: step-by-step instructions for getting the machine to do a task. That is exactly what a program is.',
      'Her slide adds that she saw uses beyond mathematics, such as music. Thinking of a computer as a general symbol-manipulator was far ahead of its time.',
      'Sebesta notes she is "generally recognized as being the world\'s first programmer", and the U.S. DoD language Ada (late 1970s) is named after her.',
    ],
    answer: 'Ada Lovelace (Augusta Ada King, Countess of Lovelace).',
    mistake: 'Writing "Babbage" for both blanks. Babbage built the machine; Lovelace programmed it.',
    tryIt: { q: 'Which programming language, developed for the U.S. Department of Defense, is named after the first programmer?', a: 'Ada.' },
  };

  H['l2-eniac-how'] = {
    asks: 'ENIAC (1940s) had no programming language and no program in memory. How did people tell it what to do?',
    idea: 'On ENIAC the program was not stored anywhere: it WAS the wiring. To change the program you physically rebuilt the connections.',
    steps: [
      'ENIAC was an electronic computer, but it had no place in memory to hold instructions.',
      'So the "program" was set up by hand: plugging cords (cables) to connect units, and turning knobs and switches to set values.',
      'The plan for each job was worked out first and written on paper, to tell the operators what to plug and set.',
      'Rewiring for every new problem was slow. That pain is exactly what von Neumann\'s stored-program idea fixed.',
    ],
    answer: 'By moving cords (plugging cables) and turning knobs. The instructions were often written on paper for the operators.',
    mistake: 'Answering "with punched cards" or "in machine code". There was no stored program yet, so programming meant rewiring.',
    tryIt: { q: 'After the stored-program idea, what replaced rewiring when you wanted the machine to do a new job?', a: 'Loading a different program into memory, just like loading new data.' },
  };

  H['l2-eniac-women'] = {
    asks: 'ENIAC\'s programmers were mostly women. What was the reason?',
    idea: 'It comes down to timing: ENIAC was built during and just after the Second World War, when many of the men were away in the military.',
    steps: [
      'ENIAC was built in the mid-1940s, during WWII and just after it.',
      'Many men were serving in the army and navy, so the people available for this new kind of work were largely women.',
      'The women chosen had been doing ballistics calculations by hand, so they already understood the math the machine was built for.',
      'This is part of a pattern on these slides: Ada Lovelace was the first programmer, and Grace Hopper (COBOL) is another pioneer.',
    ],
    answer: 'More of the men were in the army and navy, during WWII and just after the war.',
    mistake: 'Inventing a reason like "programming was seen as easy". The answer she wants is the wartime one: the men were in the armed forces.',
    tryIt: { q: 'Which woman on the Lecture 2 slides led the push toward English-like business programming and is linked to the 1947 "first computer bug"?', a: 'Grace Hopper.' },
  };

  H['l2-vonneumann'] = {
    asks: 'What was John von Neumann\'s main idea that changed how ENIAC and later computers were programmed?',
    idea: 'Treat the program as data. Once instructions sit in memory just like numbers, you can change them by loading new ones, and other programs can write them.',
    steps: [
      'The problem: on ENIAC, changing the program meant rewiring cords and knobs.',
      'Von Neumann\'s idea: store the program in memory, in the same memory as the data it works on (the slide also credits Alan Turing).',
      'Result 1: changing the program means loading different instructions, not rebuilding the machine.',
      'Result 2: since a program is just data, a program can produce another program. That is what a compiler does, which makes Fortran and every later language possible.',
      'Sebesta calls this design the von Neumann architecture; nearly every computer since is built on it.',
    ],
    answer: 'The stored program: the program is kept in memory just like the data it manipulates.',
    mistake: 'Saying "he invented the computer" or "binary". The key word is STORED program: instructions live in memory alongside data.',
    tryIt: { q: 'Why does the stored-program idea make a compiler possible?', a: 'A compiler outputs a machine-code program, which is just data in memory; because programs are stored like data, that output can then be run.' },
  };

  // ---------- Big four ----------

  H['l2-bigfour'] = {
    asks: 'Name the four original "big" programming languages.',
    idea: 'In the late 1950s, four different groups each had a different problem, and each built a language for it. Remember the four problems and the four names follow.',
    steps: [
      { text: 'One language per job:', table: { head: ['language', 'who needed it', 'problem it solved'], rows: [
        ['FORTRAN (1957)', 'scientists, IBM', 'fast number crunching without hand-written machine code'],
        ['LISP (1958)', 'AI researchers', 'symbolic data in lists, with recursion'],
        ['Algol (1958/60)', 'international committee', 'one machine-independent language for algorithms'],
        ['COBOL (1959)', 'business, U.S. DoD', 'English-like programs for business records']] } },
      'A handy order: FORTRAN came first, LISP and Algol right behind, COBOL in 1959.',
      'All four are from the late 1950s, and most later languages descend from them (especially Algol).',
    ],
    answer: 'FORTRAN, LISP, Algol, COBOL.',
    mistake: 'Adding C, Pascal or Prolog. Those came later (Prolog is 1972); the big four are all 1950s.',
    tryIt: { q: 'Which big-four language would you pick for each: an AI program, a payroll system, a physics simulation?', a: 'AI: LISP. Payroll: COBOL. Physics: FORTRAN.' },
  };

  // ---------- Fortran ----------

  H['blank:b2-9-ic8frt'] = {
    asks: 'Fortran was described on paper in 1954. What was Fortran I, in 1957?',
    idea: 'A language on paper is just an idea. Fortran I is the moment it became real: IBM shipped a working compiler, and people could finally run Fortran programs.',
    steps: [
      'The problem: in the early 1950s programs were hand-written in machine code, and machines cost far more than programmers, so the code had to be fast.',
      '1954: John Backus\'s group at IBM described Fortran on paper (Sebesta calls it Fortran 0) for the IBM 704.',
      'April 1957: the first compiler was released. The language it implemented is Fortran I, the first implemented version.',
      'Its goal: machine code nearly as good as a human would write by hand. Most of the 18 worker-years went into optimization, and it came close.',
      { text: 'Fortran I style: a counted DO loop and the 3-way IF (negative, zero, positive):', code: '      DO 10 I = 1, 100\n      SUM = SUM + X(I)\n   10 CONTINUE\n      IF (SUM - 50.0) 20, 30, 40' },
    ],
    answer: 'The first implemented version of Fortran: its first compiler, released in 1957.',
    mistake: 'Confusing "first described" (1954, on paper) with "first implemented" (1957, Fortran I).',
    tryIt: { q: 'Fortran I had no type declarations. What type was a variable named KOUNT, and one named XSUM?', a: 'KOUNT is integer (names starting with I to N were integers); XSUM is floating-point.' },
  };

  H['blank:b2-11-m5kc41'] = {
    asks: 'Fortran II (1958) added a new kind of compilation. What was it?',
    idea: 'In Fortran I, one change meant recompiling the whole program, on a machine that often broke down mid-compile. Fortran II let each subroutine be compiled on its own.',
    steps: [
      'Fortran I problem: no independent compilation, so any change meant recompiling the entire program.',
      'The IBM 704 was unreliable, so long compiles often failed partway. In practice programs were limited to about 300 to 400 lines.',
      'Fortran II fix: independent compilation of subroutines. Already-compiled subroutines could be reused as machine code.',
      'Effect: much shorter compiles, so much larger programs became practical. It also fixed many Fortran I bugs.',
    ],
    answer: 'Independent compilation of subroutines.',
    mistake: 'Writing "recursion" or "separate declarations". Fortran II\'s headline feature is independent (separate) compilation.',
    tryIt: { q: 'Without independent compilation, what must happen when you fix one line inside one subroutine?', a: 'The entire program has to be recompiled.' },
  };

  H['blank:b2-12-3ce9tq'] = {
    asks: 'Fortran IV (1962) added a kind of declaration. Which kind?',
    idea: 'Before Fortran IV, a variable\'s type came from the first letter of its name. Fortran IV let you state the type yourself.',
    steps: [
      'Fortran I and II rule: names starting with I, J, K, L, M or N were integers; everything else was floating-point. No declarations at all.',
      'That is restrictive: a count called TOTAL would be floating-point whether you wanted it or not.',
      { text: 'Fortran IV added explicit type declarations:', code: '      INTEGER TOTAL\n      REAL KOUNT' },
      'Now the programmer, not the first letter, decides the type. (Fortran IV was standardized as Fortran 66.)',
    ],
    answer: 'Explicit type declarations.',
    mistake: 'Thinking Fortran always had declarations. Fortran I relied entirely on the implicit first-letter rule.',
    tryIt: { q: 'Under the old first-letter rule, what type is INDEX? How would Fortran IV make it real instead?', a: 'Integer (it starts with I). Declare it: `REAL INDEX`.' },
  };

  H['blank:b2-12-9cf50u'] = {
    asks: 'In Fortran IV, subprogram names could be passed as what?',
    idea: 'Fortran IV let you hand a subroutine or function to another one, so one routine can work with any function you give it.',
    steps: [
      'Before: a subprogram could only call the specific subprograms written into it.',
      'Fortran IV: a subprogram name can be passed as a parameter to another subprogram.',
      { text: 'Example: one plotting routine that can draw any function you hand it:', code: '      EXTERNAL F\n      CALL PLOT(F, 0.0, 1.0)' },
      'The same idea lives on today: C\'s `qsort` takes a comparison function as a parameter.',
    ],
    answer: 'Parameters (passed to other subprograms).',
    mistake: 'Writing "variables" or "pointers". The answer is parameters: a subprogram handed to another subprogram.',
    tryIt: { q: 'You write one routine `INTEG` that integrates a function between two bounds. What Fortran IV feature lets it work for SIN, COS or your own F?', a: 'Passing subprogram names as parameters: call `INTEG(SIN, 0.0, 1.0)` and so on.' },
  };

  H['blank:b2-13-rcmyge'] = {
    asks: 'Fortran 77 (standard in 1978) added three things. Name them.',
    idea: 'Fortran was built for numbers. By the 1970s programs also needed text and cleaner decisions, so Fortran 77 added strings, a two-way IF, and loops controlled by a condition.',
    steps: [
      'Character string handling: Fortran could now work with text, not just numbers.',
      'IF-THEN-ELSE: before, Fortran IV\'s logical IF ran a single statement and had no else.',
      'Logical loop control statements: loops controlled by a true/false condition (her slide: "logical loop control ops").',
      { text: 'Strings and IF-THEN-ELSE in Fortran 77:', code: '      CHARACTER*10 NAME\n      NAME = \'BACKUS\'\n      IF (N .GT. 0) THEN\n         PRINT *, \'POSITIVE\'\n      ELSE\n         PRINT *, \'NOT POSITIVE\'\n      END IF' },
    ],
    answer: 'Character string handling, logical loop control statements, and an IF-THEN-ELSE statement.',
    mistake: 'Listing Fortran 90 features (modules, dynamic arrays, pointers, recursion). Those came in 90, not 77.',
    tryIt: { q: 'Fortran IV or Fortran 77: which one could you use to write an IF with an ELSE branch?', a: 'Fortran 77. Fortran IV only had the logical IF, which runs one statement with no else.' },
  };

  H['blank:b2-15-ksgz9q'] = {
    asks: 'What is Fortran still mainly used for today?',
    idea: 'Fortran was born to crunch numbers fast, and it never left that job. Huge amounts of tested scientific code are written in it. (This answer is the best reading of the slide; check it against your notes.)',
    steps: [
      'Born for science: Fortran was built in the 1950s, when computers were used mainly for scientific calculation, and its goal was fast machine code.',
      'Kept that focus: later versions added parallel features (Fortran 2008 concurrent loops, 2018 parallel features on her slide).',
      'Stayed in place: Sebesta says the huge investment in Fortran software has kept it in use, and quotes Alan Perlis calling it "the lingua franca of the computing world".',
      'So today: scientific and numerical computing, especially high-performance (supercomputer) work.',
    ],
    answer: 'Scientific and numerical (high-performance) computing.',
    mistake: 'Saying Fortran is dead. Her slide says it is still widely used, mainly for scientific and numerical computing.',
    tryIt: { q: 'A team is writing a big physics simulation to run on a supercomputer. Which big-four language is still a natural choice?', a: 'Fortran: fast numerical computing is exactly what it was built for.' },
  };

  // ---------- Lisp ----------

  H['blank:b2-17-1upkq0w'] = {
    asks: 'Lisp grew out of AI research. What two kinds of processing did AI need?',
    idea: 'Fortran handled numbers in arrays. AI work (understanding language, proving theorems, modelling the brain) needs symbols such as words and facts, linked together in lists. That gap is why Lisp exists.',
    steps: [
      'In the mid-1950s, linguists, psychologists and mathematicians all started AI work (her slide lists natural language, modelling the brain, programs that write programs).',
      'Sebesta: all of them reached the same conclusion: computers must process symbolic data in linked lists.',
      'But at the time, almost all computation was on numeric data in arrays (Fortran\'s world).',
      'So AI needed: list processing (not arrays) and symbolic computation (not numeric). LISP literally means LISt Processing.',
    ],
    answer: 'Processing data in lists (rather than arrays) and symbolic computation (rather than numeric).',
    mistake: 'Answering "recursion and conditionals". Those were McCarthy\'s requirements for the language; the question asks what kind of processing AI needed.',
    tryIt: { q: 'Before Lisp, what kind of data was most computation done on?', a: 'Numeric data in arrays.' },
  };

  H['blank:b2-19-sv918w'] = {
    asks: 'Pure Lisp has exactly two kinds of data. Name them, using `grizzly` and `(lynx (grizzly black) moose)` as the examples.',
    idea: 'Everything in pure Lisp is built from just two pieces: indivisible things (atoms) and parenthesized groups of things (lists). A list can contain other lists, which makes a tree.',
    steps: [
      'Atom: a single symbol or number that cannot be split, like `grizzly`, `moose` or `42`.',
      'List: elements in parentheses, like `(lynx (grizzly black) moose)`. Its elements can be atoms or other lists.',
      'Read a list one level at a time. The top level of `(lynx (grizzly black) moose)` has 3 elements: the atom `lynx`, the list `(grizzly black)`, the atom `moose`.',
      'Nesting gives a tree: the picture above is the list from her slide, with every atom as a leaf.',
    ],
    ptree: { tree: node('( list )', leaf('lynx'), node('( list )', leaf('grizzly'), leaf('black')), leaf('moose'),
      node('( list )', leaf('elk'), node('( list )', leaf('whitetail'), leaf('mule')))),
      caption: '(lynx (grizzly black) moose (elk (whitetail mule))): the leaves are atoms; every inner node is a list.' },
    answer: 'Atoms (like `grizzly`) and lists (like `(lynx (grizzly black) moose)`).',
    mistake: 'Answering "numbers and strings" or "lists and arrays". Pure Lisp has no arrays; the two kinds are atoms and lists.',
    tryIt: { q: 'How many top-level elements does `(a (b c) d (e (f g)))` have, and which are atoms?', a: 'Four: `a`, `(b c)`, `d`, `(e (f g))`. The atoms are `a` and `d`; the other two are lists.' },
  };

  H['blank:b2-19-1xw7i6e'] = {
    asks: 'Pure Lisp has only one kind of computation. What is it?',
    idea: 'There are no assignment statements or loops in pure Lisp. Every piece of work, even plain addition, is a function applied to arguments.',
    steps: [
      'In Lisp, the first item in a list is the function and the rest are the arguments: `(+ 2 3)` applies `+` to 2 and 3.',
      'Bigger computations are just applications nested inside applications.',
      { text: 'Example (run in Scheme):', code: '(* 4 (+ 1 2))   ; apply + to 1 and 2 -> 3\n                ; apply * to 4 and 3 -> 12' },
      'Sebesta: "All computation in a purely functional program is accomplished by applying functions to arguments." No assignment, no loops: repetition is done with recursion.',
    ],
    answer: 'Applying functions to arguments (function application).',
    mistake: 'Answering "assignment" or "list processing". List processing is the data side; the one kind of computation is function application.',
    tryIt: { q: 'In `(- 10 (* 2 3))`, which functions are applied, in what order, and what is the value?', a: 'First `*` is applied to 2 and 3 (giving 6), then `-` to 10 and 6. Value: 4.' },
  };

  H['blank:b2-20-1ugwahe'] = {
    asks: 'Pure Lisp has no loops. Explain why it can still compute anything a language with loops can (why it is still Turing complete).',
    idea: 'A loop is just one way to repeat. Pure Lisp still has all the parts a general-purpose language needs: a way to repeat (recursion), a way to choose (cond), and a place to keep data (lists and parameters). (The last two points are the best reading of the slide; check your notes.)',
    steps: [
      'Repetition: a function calls itself on a smaller problem. Recursion does everything a loop does.',
      'Selection: `cond` picks a branch, including the base case that stops the recursion.',
      'Memory: values live in lists and in function parameters, so no assignment is needed.',
      { text: 'Adding 4 + 3 + 2 + 1 with no loop (run in Scheme, gives 10):', code: '(define (sum-to n)\n  (cond ((= n 0) 0)\n        (else (+ n (sum-to (- n 1))))))\n\n(sum-to 4)   ; 10' },
    ],
    answer: 'Repetition comes from recursion; selection comes from conditional expressions (`cond`); data is held in lists and function parameters.',
    mistake: 'Saying "it isn\'t Turing complete" or "it secretly has loops". It needs no loops, because recursion does the repeating.',
    tryIt: { q: 'Without a loop, how would pure Lisp add up the numbers in `(4 5 6)`?', a: 'Recursion: the sum is the first number plus the sum of the rest, with `cond` returning 0 for the empty list. Result: 15.' },
  };

  H['blank:b2-21-1sfiv4g'] = {
    asks: 'Which pure Lisp built-in functions give you the parts of a list?',
    idea: 'A list has two parts: its first element, and everything after it. `car` gives the first element, `cdr` gives the rest. Any element can be reached by combining them.',
    steps: [
      '`car` returns the first element of a list.',
      '`cdr` (say "could-er") returns the rest of the list, without the first element. The result is always a list.',
      { text: 'Run in Scheme:', code: "(car '(lynx (grizzly black) moose))   ; lynx\n(cdr '(lynx (grizzly black) moose))   ; ((grizzly black) moose)\n(car (cdr '(lynx (grizzly black) moose)))   ; (grizzly black)" },
      'The odd names come from the IBM 704 that Lisp was first built on: "contents of the address / decrement part of the register".',
    ],
    answer: '`car` (first element) and `cdr` (the rest of the list).',
    mistake: 'Thinking `cdr` returns the last element. It returns everything except the first, as a list.',
    tryIt: { q: "What is `(car (cdr '(red green blue)))`?", a: '`green`: the cdr is `(green blue)`, and its car is `green`.' },
  };

  H['blank:b2-21-1n18m9z'] = {
    asks: 'Which pure Lisp built-in builds a list?',
    idea: '`cons` is the opposite of `car` and `cdr`: it glues a first element onto the front of an existing list. `list` is a convenience that makes a list from any number of items.',
    steps: [
      '`(cons x lst)` makes a new list whose car is `x` and whose cdr is `lst`.',
      '`(list a b c)` builds the list of exactly those items.',
      { text: 'Run in Scheme; watch the difference:', code: "(cons 'elk '(lynx moose))   ; (elk lynx moose)\n(cons 'x '(y z))             ; (x y z)\n(list 'x '(y z))             ; (x (y z))" },
      '`cons` adds ONE element to the front; `list` wraps each argument as its own element.',
    ],
    answer: '`cons` (and also `list`).',
    mistake: 'Expecting `(cons \'x \'(y z))` to give `(x (y z))`. `cons` puts x in front of the existing list, giving `(x y z)`.',
    tryIt: { q: "What is `(cons '(a) '(b c))`?", a: '`((a) b c)`: the list `(a)` becomes the new first element.' },
  };

  H['blank:b2-21-1yv7i6o'] = {
    asks: 'Which pure Lisp built-in stops an expression from being evaluated?',
    idea: 'In Lisp, code and data look the same: both are lists. So you need a way to say "this list is data, do not run it". That is `quote`, usually written as a single apostrophe.',
    steps: [
      'Normally Lisp evaluates a list: `(+ 2 3)` is run and gives 5.',
      '`(quote (+ 2 3))`, or the shorthand `\'(+ 2 3)`, returns the list itself, unevaluated: `(+ 2 3)`.',
      { text: 'Run in Scheme:', code: "(car '(x y))    ; x  : quote keeps (x y) as data, then car runs\n'(car (x y))    ; (car (x y)) : the whole thing is just data" },
      'Without the quote, `(car (x y))` would try to call a function named `x`. That is why list data in Lisp is always quoted.',
    ],
    answer: '`quote` (written `\'`).',
    mistake: 'Leaving off the quote on list data. `(car (a b c))` tries to call `a` as a function; you need `(car \'(a b c))`.',
    tryIt: { q: "What does `'(+ 1 2)` evaluate to, and what does `(+ 1 2)` evaluate to?", a: 'The quoted one gives the list `(+ 1 2)`; the unquoted one gives 3.' },
  };

  H['blank:b2-21-17znw7t'] = {
    asks: 'Which pure Lisp built-in forces an expression to be evaluated?',
    idea: '`eval` is the opposite of `quote`. Take a list that is being held as data and run it as code. This works because Lisp code and data have the same form.',
    steps: [
      '`\'(+ 2 3)` is just a three-element list (data).',
      '`(eval \'(+ 2 3))` runs that list as code and gives 5.',
      { text: 'Run in Scheme (Scheme\'s `eval` also takes an environment argument):', code: "'(* 2 (+ 1 1))           ; (* 2 (+ 1 1))\n(eval '(* 2 (+ 1 1)) (interaction-environment))   ; 4" },
      'Sebesta: McCarthy wrote EVAL as a universal function that can evaluate any other function. Steve Russell noticed it could serve as an interpreter, and implemented it on the IBM 704 (1959).',
    ],
    answer: '`eval`.',
    mistake: 'Mixing up the pair. `quote` STOPS evaluation (keeps it as data); `eval` FORCES it (runs data as code).',
    tryIt: { q: "What is `(eval '(- 10 4))`?", a: '6: `eval` runs the quoted list as code.' },
  };

  H['blank:b2-21-131ctqn'] = {
    asks: 'Which pure Lisp built-in is used for conditions (making a choice)?',
    idea: '`cond` is Lisp\'s if/else-if chain. It checks tests in order and returns the value for the first one that is true. It is also what stops a recursion.',
    steps: [
      '`cond` takes pairs: `(test value)`. It tries each test in order; the first true test picks the result.',
      '`else` at the end catches everything else.',
      { text: 'Run in Scheme:', code: '(define (my-max a b)\n  (cond ((> a b) a)\n        (else b)))\n\n(my-max 3 7)   ; 7' },
      '`if` also works for a simple two-way choice: `(if (> 3 7) \'yes \'no)` gives `no`.',
    ],
    answer: '`cond` (`if` also works).',
    mistake: 'Answering "`if`-statement". In Lisp, `cond` and `if` are expressions that RETURN a value, not statements.',
    tryIt: { q: 'Write absolute value with `cond`. What do you get for -5 and 3?', a: '`(define (my-abs x) (cond ((< x 0) (- x)) (else x)))` gives 5 and 3.' },
  };

  // ---------- Algol ----------

  H['blank:b2-25-1tp5re4'] = {
    asks: 'How are most programming languages around today related to Algol?',
    idea: 'Algol was hardly used, but it was copied by almost everyone. Its ideas (blocks, `:=`, recursion, BNF) became the standard shape of imperative languages.',
    steps: [
      'Algol (late 1950s, same era as Fortran and Lisp) was an attempt at one universal, machine-independent language.',
      'It never became widely used, especially in the U.S., but it became the standard way to publish algorithms for over 20 years.',
      'Sebesta: every imperative language designed since 1960 owes something to ALGOL 60, and most are direct or indirect descendants.',
    ],
    ptree: { tree: node('ALGOL 60', leaf('PL/I'), leaf('SIMULA 67'), leaf('ALGOL 68'), leaf('Pascal'), leaf('C'), leaf('Ada'), leaf('C++'), leaf('Java'), leaf('C#')),
      caption: 'Sebesta\'s list of direct or indirect descendants (not a strict parent-child tree).' },
    answer: 'They descend from (are based on) Algol.',
    mistake: 'Saying most languages descend from Fortran because Fortran was first. Fortran was first and widely used, but Algol is the main ancestor of modern language design.',
    tryIt: { q: 'Name three languages you know that descend (directly or indirectly) from Algol.', a: 'Any three of: C, C++, Java, C#, Pascal, Ada, PL/I, SIMULA 67, ALGOL 68.' },
  };

  H['blank:b2-28-1qeng0e'] = {
    asks: 'Europe was far more invested in Algol. What group-designed language did the U.S. develop for itself instead?',
    idea: 'The U.S. had a home-grown alternative for each job: IBM kept Fortran for science, and a U.S. committee built COBOL for business. (COBOL is the best reading of this blank; check your notes.)',
    steps: [
      'Algol was a joint U.S. and European effort, but Europe pushed it much harder.',
      'In the U.S., IBM owned Fortran and would not support Algol, and the U.S. wanted its own language.',
      'In 1959, a U.S. committee sponsored by the Department of Defense designed COBOL, a group-driven language for business.',
    ],
    answer: 'COBOL.',
    mistake: 'Writing "Fortran". Fortran was designed by an IBM team, not a group or committee, and it existed before Algol.',
    tryIt: { q: 'Which company owned Fortran and so had no interest in backing Algol?', a: 'IBM.' },
  };

  H['blank:b2-29-1dxh0dq'] = {
    asks: 'Algol formalized the concept of what?',
    idea: 'In Fortran I, a variable\'s type was a side effect of its first letter. Algol made type a real, declared property of a variable: the idea of a data type.',
    steps: [
      'Fortran I: no declarations; names starting I to N were integers, the rest floating-point.',
      'ALGOL 58 formalized the concept of data type: variables are declared with a type (Sebesta notes only non-floating-point ones strictly had to be).',
      { text: 'Algol 60 declarations:', code: 'integer count;\nreal average;\nBoolean done;' },
      'This is the ancestor of `int x;` in C and Java.',
    ],
    answer: 'Data type.',
    mistake: 'Writing "variables" or "syntax". Algol formalized syntax with BNF too, but that is a separate blank; here it is data type.',
    tryIt: { q: 'How did Fortran I know the type of a variable, and how did Algol?', a: 'Fortran I: from the first letter of the name. Algol: from a type declaration.' },
  };

  H['blank:b2-29-wvjh0m'] = {
    asks: 'Algol introduced parameter modes. What does a parameter\'s mode tell you?',
    idea: 'A mode is the direction data travels between caller and subprogram: in, out, or both ways.',
    steps: [
      'In mode: the parameter only receives data from the caller.',
      'Out mode: the parameter only sends a result back to the caller.',
      'Inout mode: it does both: brings a value in and sends a changed value back.',
      { text: 'In Algol 60, `value n` makes n pass-by-value: data goes in only.', code: 'integer procedure fact(n); value n; integer n;\n  fact := if n = 0 then 1 else n * fact(n - 1);' },
    ],
    answer: 'Whether it carries data in to the subprogram, out of it, or both.',
    mistake: 'Confusing mode with type. The type says what kind of value it is; the mode says which way data flows.',
    tryIt: { q: 'A subprogram `swap(a, b)` exchanges two variables. What mode are a and b?', a: 'Inout: each brings a value in and must send a new value back out.' },
  };

  H['blank:b2-30-5loocb'] = {
    asks: 'Algol introduced a kind of program structure that creates local scopes. What is it called?',
    idea: 'A block is a begin...end region that can declare its own variables. Those variables exist only inside it. Every { } with local variables in C or Java descends from this.',
    steps: [
      'Before Algol, variables were visible throughout their whole program unit.',
      'ALGOL 60 introduced block structure: a block can declare new variables, creating a new scope.',
      { text: 'Algol 60: the inner x is a different variable from the outer x:', code: 'begin\n  integer x;\n  x := 1;\n  begin\n    integer x;\n    x := 2\n  end;\n  comment the outer x is still 1\nend' },
      { text: 'The same idea in C (run with gcc: prints `2 1`):', code: 'int x = 1;\n{ int x = 2; printf("%d ", x); }\nprintf("%d\\n", x);' },
    ],
    answer: 'Block structure.',
    mistake: 'Answering "functions" or "modules". The answer is blocks: begin...end regions with their own local variables.',
    tryIt: { q: 'In C: `int y = 5; { int y = 9; } printf("%d", y);` What prints, and why?', a: '5. The inner y belongs to the block and disappears when it ends; the outer y was never changed.' },
  };

  H['blank:b2-30-18zqk9a'] = {
    asks: 'What was Algol\'s assignment operator?',
    idea: 'Algol kept `=` for asking "are these equal?" and used `:=` to mean "store this value". Two different jobs, two different symbols.',
    steps: [
      'In math, `=` states that two things are equal. Using it for assignment makes `x = x + 1` look like nonsense.',
      'Algol used `:=` for assignment, so `=` could mean comparison.',
      'Sebesta\'s story: Zuse wrote `expression => variable`; card punches had no `>`, so it became a colon, and the Americans had it turned around to `variable := expression`.',
      { text: 'Both symbols in one Algol 60 line:', code: 'fact := if n = 0 then 1 else n * fact(n - 1);' },
      'Descendants that kept `:=` include Pascal and Ada; C went back to `=` and uses `==` for comparison.',
    ],
    answer: '`:=` (not `=`).',
    mistake: 'Writing `=` because that is what C and Java use. Algol deliberately chose `:=`.',
    tryIt: { q: 'In Algol, what do `x := 5` and `x = 5` each mean?', a: '`x := 5` stores 5 in x. `x = 5` is a true/false test of whether x equals 5.' },
  };

  H['blank:b2-30-fjs056'] = {
    asks: 'What did Algol allow in a nonfunctional (imperative) language?',
    idea: 'Lisp already had recursion, but Lisp is functional. Algol was the imperative language that let a procedure call itself. Fortran could not.',
    steps: [
      'Fortran (before 90) fixed every variable\'s storage before the program ran, one spot each. A second call to the same subprogram would overwrite the first call\'s values, so recursion was impossible.',
      'ALGOL 60 allowed procedures to be recursive. Each call gets its own fresh local variables.',
      { text: 'Recursive factorial in Algol 60:', code: 'integer procedure fact(n); value n; integer n;\n  fact := if n = 0 then 1 else n * fact(n - 1);' },
      'This needs a run-time stack, and Sebesta notes that Burroughs later built machines with a hardware stack for exactly this.',
    ],
    answer: 'Recursion (recursive procedures).',
    mistake: 'Thinking Algol invented recursion. Lisp had recursive functions in 1959; Algol brought recursion to imperative languages.',
    tryIt: { q: 'Why could early Fortran not support recursion?', a: 'Storage for every variable was fixed before run time, one copy each, so a second active call would overwrite the first call\'s variables.' },
  };

  H['blank:b2-31-1jdluvo'] = {
    asks: 'What kind of array allocation did Algol introduce?',
    idea: 'In Fortran an array\'s size was fixed before the program ran. Algol let the size come from a variable, decided when execution reaches the declaration, with the array living on the stack.',
    steps: [
      'Stack-dynamic array: the subscript range is given by variables, so the size is set when storage is allocated, which happens when the declaration is reached during execution.',
      'The array lives on the run-time stack and disappears when its block ends. This fits naturally with Algol\'s blocks and recursion.',
      { text: 'Algol 60: the array size depends on n:', code: 'procedure fill(n); value n; integer n;\nbegin\n  integer array a[1:n];\n  ...\nend' },
      { text: 'The same idea in C99 (run: `fill(3)` gives 12 bytes, `fill(5)` gives 20, with 4-byte ints):', code: 'void fill(int n) {\n  int a[n];   /* size fixed when this line runs */\n  printf("%zu\\n", sizeof a);\n}' },
    ],
    answer: 'Stack-dynamic (allocated on the stack).',
    mistake: 'Answering "heap-dynamic" or "static". Algol\'s arrays are allocated on the stack, sized at run time when the declaration is reached.',
    tryIt: { q: 'A procedure declares `real array b[1:k]` and is called with k = 10, then k = 50. How big is b each time?', a: '10 elements, then 50: a stack-dynamic array gets its size each time the declaration is reached.' },
  };

  H['blank:b2-31-1br7kp3'] = {
    asks: 'Algol was the first language to have a formal specification of something, which led to general parsers. What was formally specified?',
    idea: 'Before Algol, a language\'s rules were described in English. Algol 60\'s syntax was written in BNF, a precise grammar, so a program could read the grammar and build a parser from it.',
    steps: [
      '1959: John Backus introduced a notation for describing syntax. Peter Naur used it to describe ALGOL 60, and it became BNF (Backus-Naur Form).',
      'ALGOL 60 was the first language whose syntax was formally described.',
      { text: 'A BNF rule is a precise grammar rule, for example:', code: '<digits> → <digit> | <digit> <digits>' },
      'Because the grammar is exact, tools can take a syntax specification and generate parse trees. Sebesta: this started formal languages, parsing theory and BNF-based compiler design.',
      'Irony: in 1960 BNF looked strange, and "hard to understand BNF" was one reason Algol itself was not widely adopted.',
    ],
    answer: 'Its syntax (written in BNF).',
    mistake: 'Answering "semantics" (meaning). Only the syntax (the form) was formally specified.',
    tryIt: { q: 'Write a BNF rule for `<ident>`: one `<letter>` followed by zero or more `<letter>`s.', a: '`<ident> → <letter> | <ident> <letter>`.' },
  };

  // ---------- COBOL ----------

  H['blank:b2-34-1nex99h'] = {
    asks: 'Who designed COBOL in 1959?',
    idea: 'Not one person and not one company: a committee. Business computing needed one common language that ran on every maker\'s machine, so the makers and the government sat down together.',
    steps: [
      'The problem: in 1959 each manufacturer had its own business language (FLOW-MATIC belonged to UNIVAC). That would not work for a common language.',
      'A meeting sponsored by the U.S. Department of Defense was held at the Pentagon in May 1959.',
      'A committee of computer makers and government users (CODASYL, the Conference on Data Systems Languages) designed COBOL.',
      'Grace Hopper\'s FLOW-MATIC was its main ancestor, which is where the English-like style came from.',
      { text: 'COBOL reads like English, so that managers could read it:', code: 'MULTIPLY PRICE BY QUANTITY GIVING TOTAL.' },
    ],
    answer: 'A committee (CODASYL: computer makers plus the U.S. DoD).',
    mistake: 'Answering "Grace Hopper". She was a key influence through FLOW-MATIC, but COBOL itself was designed by a committee.',
    tryIt: { q: 'Algol was also designed by a group. Which one?', a: 'An international committee: the U.S. ACM and the German GAMM (the Zurich meeting of 1958).' },
  };

  H['blank:b2-34-1rw1fxo'] = {
    asks: 'How much has COBOL influenced the design of other languages?',
    idea: 'COBOL is the opposite of Algol: Algol was barely used but copied by everyone; COBOL was used everywhere but copied by almost no one. The one big exception is its records.',
    steps: [
      'Sebesta: COBOL has had little effect on later languages (apart from PL/I). One reason: few people ever designed a new business language, because COBOL met that need so well.',
      'The exception: COBOL was the first to implement hierarchical data structures (records), which first appeared in Zuse’s Plankalkül.',
      { text: 'A COBOL record (from Sebesta\'s example):', code: '01 BAL-FWD-CARD.\n   02 BAL-ITEM-NO     PICTURE IS 9(5).\n   02 BAL-ITEM-DESC   PICTURE IS X(20).\n   02 BAL-UNIT-PRICE  PICTURE IS 999V99.' },
      { text: 'Her slide: records prompted structs in C, and eventually OOP objects:', code: 'struct item { int item_no; char desc[21]; double price; };' },
    ],
    answer: 'Very little, except its records (hierarchical data structures), which prompted structs in C.',
    mistake: 'Saying COBOL influenced nothing at all. Its records are the one big legacy, leading to C structs and later objects.',
    tryIt: { q: 'Compare Algol and COBOL: which was widely used, and which was widely copied?', a: 'COBOL was widely used but rarely copied (except records). Algol was rarely used but copied by most later languages.' },
  };

  H['blank:b2-37-1idwzjh'] = {
    asks: 'COBOL caught on quickly. Who mandated (required) its use?',
    idea: 'The biggest buyer of computers in the U.S. said "use COBOL", so everyone selling to it had to support COBOL.',
    steps: [
      'Early COBOL compilers were slow, so the language was expensive to use.',
      'Sebesta: COBOL was the first programming language whose use was mandated by the U.S. Department of Defense.',
      'Because of the mandate, manufacturers had to provide COBOL. Sebesta says it probably would not have survived without it.',
      'Same pattern later: her slide notes that DoD backing is also why Ada was so well used.',
    ],
    answer: 'The U.S. Department of Defense (DoD).',
    mistake: 'Answering "IBM" or "ANSI". ANSI standardized COBOL (1968 onward); the DoD mandated its use.',
    tryIt: { q: 'Which later language, also backed by the U.S. DoD, was named after Ada Lovelace?', a: 'Ada.' },
  };

  // ---------- Prolog ----------

  H['blank:b2-40-10ykmya'] = {
    asks: 'What is Prolog (1972) based on?',
    idea: 'Prolog means PROgramming in LOGic. You do not write steps; you state facts and rules in formal logic, then ask questions, and the system works out the answer.',
    steps: [
      'Designed in the early 1970s by Alain Colmerauer, Phillippe Roussel and Robert Kowalski; the first interpreter was in 1972.',
      'It is built on formal logic: predicate calculus propositions, plus resolution as the way to infer answers.',
      { text: 'Facts and a rule (Sebesta-style):', code: 'parent(tom, bob).\nparent(bob, ann).\ngrandparent(X, Z) :- parent(X, Y), parent(Y, Z).\n\n?- grandparent(tom, ann).\ntrue.' },
      'Non-procedural: you program by stating facts and setting up rules, not by giving step-by-step instructions.',
    ],
    answer: 'Formal logic (predicate calculus).',
    mistake: 'Calling Prolog functional like Lisp. Her slide says it is non-procedural AND non-functional: it is logic-based.',
    tryIt: { q: 'Using the facts above, what does `?- grandparent(bob, ann).` answer, and why?', a: '`false`: there is no Y with parent(bob, Y) and parent(Y, ann); bob is ann\'s parent, not her grandparent.' },
  };

  H['blank:b2-41-qujqf6'] = {
    asks: 'What is Prolog\'s main problem when programs run?',
    idea: 'Prolog has to search for an answer by trying facts and rules, where an imperative program simply follows direct steps. That search makes it slow. (This is the best reading of the slide; check your notes.)',
    steps: [
      'You tell Prolog WHAT is true; it must work out HOW to prove your query by trying matching facts and rules, and backing up when a path fails.',
      'Sebesta: logic programs have proven to be highly inefficient compared with equivalent imperative programs.',
      'That, plus being effective in only a few areas (some databases, some AI), is why logic programming never became mainstream, even after the big Japanese project of 1982.',
    ],
    answer: 'Inefficiency: it is slow at run time.',
    mistake: 'Answering "hard to read" or "no recursion". The run-time problem is speed (inefficiency).',
    tryIt: { q: 'Sebesta gives two reasons logic programming has not been widely used. One is inefficiency. What is the other?', a: 'It has proven effective in only a few, fairly small areas: certain kinds of database systems and some areas of AI.' },
  };
})(globalThis.FC = globalThis.FC || {});
