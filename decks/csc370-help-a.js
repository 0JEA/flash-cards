// "Help" walkthroughs for CSC 370, batch A: Lecture 1 (Introduction to the Course and to
// Programming Languages). Format: see the header of decks/csc370-help.js.
// Code outputs below were checked by running them (gcc, javac/java, python3, ECL Lisp, guile).
(function (FC) {
  'use strict';
  const H = FC.help = FC.help || {};
  const leaf = label => ({ label, kids: [] });
  const node = (label, ...kids) => ({ label, kids });

  // ---------- What a programming language is ----------

  H['blank:b1-5-1s832o7'] = {
    asks: 'List what a language must have before it counts as Turing complete, the course test for being a real programming language.',
    idea: 'Turing complete means "can compute anything that can be computed". Think of the smallest machine that could do that: it needs steps in order, a place to keep results, and a way to go back and repeat while some condition holds. This is the best reading of the slide\'s blanks, so check it against your notes.',
    steps: [
      'Ordered (sequential) instructions: the computer does step 1, then step 2, then step 3. Without an order there is no algorithm, just a pile of commands.',
      'The instructions read from and write to memory. A step must be able to look at a value and change it, or nothing ever progresses.',
      'A conditional jump (a `goto` together with a compare): "if this is true, jump back to step 2". That one tool gives you conditional repetition, which is how a loop is built. Ordered statements plus goto-with-compare are enough for every algorithm (this comes back in Control Structures).',
      'Memory: information is stored and can be changed later, so the result of one pass through the loop is still there for the next pass.',
      { text: 'All four together, in C with no loop keywords at all, only `goto` and `if`:', code: 'int i = 0, sum = 0;\ntop:  if (i >= 3) goto done;  // compare, jump\n      sum = sum + i;          // read, write\n      i = i + 1;\n      goto top;\ndone: printf("%d\\n", sum);   // prints 3' },
      { text: 'Trace of the values kept in memory:', table: { head: ['check', 'i at the check', 'jump to done?', 'sum after', 'i after'], rows: [['1', '0', 'no', '0', '1'], ['2', '1', 'no', '1', '2'], ['3', '2', 'no', '3', '3'], ['4', '3', 'yes', '3', '3']] } },
    ],
    answer: 'Ordered (sequential) instructions that read from and write to memory; a conditional jump (goto with a compare) so instructions can repeat conditionally; and memory, so information is stored and can be changed later.',
    mistake: 'Saying just "loops". A loop is only possible because three things work together: an order of steps, a compare-and-jump, and memory that remembers what changed. Name all of them.',
    tryIt: { q: 'A calculator app can add, store a value in memory and recall it, but it cannot jump back and repeat steps. Is its "language" Turing complete?', a: 'No. It has ordered steps and memory, but no conditional jump, so it cannot repeat steps until a condition holds.' },
  };

  H['l1-pl-def'] = {
    asks: 'Say what a programming language is, but without using the two words you would normally reach for.',
    idea: 'Every language has a form (what you may write) and a meaning (what it does). A programming language is that form-plus-meaning pointed at a computer, with one extra demand: it must be powerful enough to do any computation.',
    steps: [
      'Syntax = the form: which symbols, in which order, are legal. Semantics = the meaning: what each legal piece does. Together they replace the word "language".',
      'Used to give instructions to a computer: that replaces "program". It is who listens and what you are doing (instructing).',
      'The instructions must be able to do all computing, which is Turing completeness. This last part is what does the real work in the course: it rules out things like HTML, which has syntax and semantics but cannot do all computing.',
      { text: 'Build the definition one part at a time:', table: { head: ['part', 'what it rules in or out'], rows: [['syntax and semantics', 'it is a system of form plus meaning'], ['specifies instructions to a computer', 'a human language like English is out'], ['instructions can do all computing', 'HTML and other non-Turing-complete notations are out']] } },
    ],
    answer: 'The syntax and semantics used to specify instructions to a computer, where those instructions must be able to do all computing (be Turing complete).',
    mistake: 'Stopping after "syntax and semantics for giving instructions to a computer". That definition lets HTML in. The "must be able to do all computing" part is the one that earns the marks.',
    tryIt: { q: 'Using the definition, is a recipe written in English a programming language?', a: 'No. It is not instructions to a computer, and English has no fixed syntax and semantics a computer follows.' },
  };

  H['l1-turing'] = {
    asks: 'One property decides whether 370 counts something as a programming language. Name it.',
    idea: 'If there is some computation a notation cannot express, then it is not a full programming language. The name for "can express every computation" is Turing complete.',
    steps: [
      'A computer can, in principle, do any computation. A language that is supposed to instruct it must be able to ask for any of them.',
      'The property that guarantees this is Turing completeness, named after Alan Turing\'s model of computing.',
      'In practice a language is Turing complete when it has ordered instructions, memory it can read and change, and a conditional jump (conditional repetition).',
    ],
    answer: 'Turing completeness.',
    mistake: 'Answering "syntax and semantics". Every language has those, including HTML. The question asks for the property that separates programming languages from the rest.',
    tryIt: { q: 'C, Scheme and Prolog look nothing alike. What do they all have that makes each one a programming language?', a: 'Each is Turing complete: each can express any computation.' },
  };

  H['l1-html'] = {
    asks: 'Decide whether HTML counts as a programming language in this course, and give the reason.',
    idea: 'HTML describes how a page looks: headings, paragraphs, images, links. It never decides anything and never repeats anything. Without conditional repetition it cannot be Turing complete.',
    steps: [
      'Look at what HTML does: `<H1>This is a Header</H1>` says "show this text as a big heading". Every tag is a description of layout, done once, top to bottom.',
      'Check the Turing-complete ingredients. HTML has no way to say "repeat this until something is true": no loop and no conditional jump.',
      'So there are things we should be able to tell a computer to do (add up numbers until the total passes 100, for example) that HTML simply cannot express. That makes it not Turing complete, so not a programming language. It is a markup language.',
    ],
    answer: 'No. HTML has no conditional repetition (loops), so it is not Turing complete: there are things we should be able to tell a computer to do that HTML cannot express.',
    mistake: 'Saying "No, because it is just for web pages". The reason must point at the missing ability (conditional repetition) and connect it to Turing completeness.',
    tryIt: { q: 'A config file format lets you set values like `width = 800` and nothing else. Is it a programming language?', a: 'No. It has no conditional repetition, so it is not Turing complete; it only records values.' },
  };

  H['l1-why-study'] = {
    asks: 'List the six reasons the course gives for studying programming languages, in her order.',
    idea: 'The six come in three pairs. Each says how knowing many languages changes you as a programmer, from the ideas in your head to the field as a whole.',
    steps: [
      'Thinking and choosing. Better ability to express ideas: you can only build what you can describe, so more language features means more ideas you can use. Choose appropriate language(s): knowing more languages means not picking the one you happen to know for every job.',
      'Learning and implementation. Learn new languages: once you know the concepts, a new language is mostly old ideas in new spelling. How a language is implemented has consequences for the programmer: knowing what the machine does explains bugs and speed (for example, why a tiny function called millions of times can be slow).',
      'Use and the field. Better use of languages you already know: you discover parts of C or Java you never used. Advancement of computational thinking: when people understand languages, better languages win (Sebesta\'s example is ALGOL 60 losing to Fortran partly because people did not understand it).',
      { text: 'One line per reason, in order:', table: { head: ['#', 'reason', 'in short'], rows: [['1', 'better ability to express ideas', 'think bigger'], ['2', 'choose appropriate language(s)', 'pick the right tool'], ['3', 'learn new languages', 'learn faster'], ['4', 'implementation has consequences', 'know what the machine does'], ['5', 'better use of languages you know', 'use your tools fully'], ['6', 'advance computational thinking', 'move the field forward']] } },
      'A hook for the order: Express, Choose, Learn, Implement, Use, Advance (E C L I U A). Read it as "Every Coder Learns Implementation, Uses it, Advances".',
    ],
    answer: 'Better ability to express ideas; choosing the appropriate language(s); learning new languages; seeing how the way a language is implemented has consequences for the programmer; better use of the languages you already know; advancing computational thinking.',
    mistake: 'Giving general reasons like "to get a job" or "to know more languages". The list is fixed; learn her six, and in her order.',
    tryIt: { q: 'A C programmer learns Python\'s dictionaries and then builds a similar lookup table in C. Which reason does this show?', a: 'Better ability to express ideas: a feature learned in one language lets you think of (and build) it in another.' },
  };

  // ---------- Criteria ----------

  H['l1-criteria'] = {
    asks: 'Name the four big criteria for judging whether a programming language is good.',
    idea: 'Two criteria are about the person at the keyboard (can I read it, can I write it), and two are about the result (does it work, what does it cost). Everything else in the lecture is a detail under one of these four.',
    steps: [
      'Readability: how easily programs can be read and understood. Most of a program\'s life is maintenance, often by someone else, so reading matters a lot.',
      'Writeability: how easily the language can be used to create programs for the problem at hand.',
      'Reliability: the program performs to its specification under all conditions.',
      'Cost: the total cost of using the language, including training programmers, writing, compiling, running, and maintaining programs, and the cost of failures.',
      { text: 'Two pairs:', table: { head: ['about the programmer', 'about the result'], rows: [['readability', 'reliability'], ['writeability', 'cost']] } },
    ],
    answer: 'Reliability, cost, readability, writeability.',
    mistake: 'Listing sub-criteria such as simplicity or type checking. Those are the twelve sub-criteria; the question wants the four top-level ones they feed.',
    tryIt: { q: 'A language is easy to learn and its programs are easy to maintain, but its compiler is very expensive. Which two top-level criteria are in tension?', a: 'Readability (easy to read and maintain) against cost (an expensive implementation system is part of cost).' },
  };

  H['l1-subcriteria-all'] = {
    asks: 'List all twelve sub-criteria from the slide.',
    idea: 'The slide shows two columns of six. The left column is about how code reads and writes for a human; the right column is about how the program behaves when it runs: safely, quickly, anywhere.',
    steps: [
      'Left column (shape readability and writeability): simplicity, orthogonality, data types, syntax design, support for abstraction, expressivity.',
      'Right column (shape reliability and cost): type checking, exception handling, restricted aliasing, run-time speed, portability, security.',
      'Rebuild the left column as a story: a language should be simple, its parts should combine freely (orthogonality), it should have the data types you need, its syntax should be clear, it should let you hide details (abstraction), and short code should do a lot (expressivity).',
      'Rebuild the right column as things that go wrong at run time: wrong types (type checking), errors (exception handling), two names changing one value (aliasing), slowness (speed), moving to another machine (portability), attacks (security).',
    ],
    ptree: { tree: node('12 sub-criteria',
        node('reads and writes', leaf('simplicity'), leaf('orthogonality'), leaf('data types'), leaf('syntax design'), leaf('abstraction'), leaf('expressivity')),
        node('runs well', leaf('type checking'), leaf('exceptions'), leaf('aliasing'), leaf('speed'), leaf('portability'), leaf('security'))),
      caption: 'Six per column, in the slide\'s order.' },
    answer: 'Simplicity, orthogonality, data types, syntax design, support for abstraction, expressivity; type checking, exception handling, restricted aliasing, run-time speed, portability, security.',
    mistake: 'Mixing in the four top-level criteria (readability, writeability, reliability, cost). Those are the parents, not sub-criteria.',
    tryIt: { q: 'Which column does each belong in: "two pointers point to the same int" and "`count++` versus `count = count + 1`"?', a: 'The pointers are aliasing (right column, runs well). The two ways to add one are feature multiplicity, part of simplicity (left column, reads and writes).' },
  };

  H['l1-simplicity'] = {
    asks: 'Give the three things that make a language simple.',
    idea: 'Every extra thing in a language is one more thing a reader must know. Simplicity is about keeping that list short in three ways: few features, few ways to do each thing, and few symbols with more than one meaning.',
    steps: [
      'A manageable (small) set of features and constructs. In a huge language, each programmer learns a different subset, and then reads code written in a subset they never learned.',
      { text: 'Minimal feature multiplicity: few ways to do one thing. Java has four ways to add one to `count`:', code: 'count = count + 1;\ncount += 1;\ncount++;\n++count;' },
      'Minimal operator overloading: one symbol should not mean many things. Using `+` for both int and float addition is fine, but if a programmer makes `+` on two arrays mean "sum of all elements", readers are misled.',
      'Hook: small, single, steady. A small set of features, a single way to do each thing, and symbols that mean a steady single thing.',
    ],
    answer: 'A manageable (small) set of features and constructs; minimal feature multiplicity (few ways to do the same thing, e.g. count++ vs count = count + 1); minimal operator overloading.',
    mistake: 'Thinking simpler is always better. Assembly language is very simple, yet hard to read, because you need so many statements. Simplicity is one criterion among several.',
    tryIt: { q: 'Python lets you build a list with a loop, with a list comprehension, or with `map`. Which part of simplicity does that hurt?', a: 'Minimal feature multiplicity: there are several ways to do the same thing.' },
  };

  H['l1-orthogonality'] = {
    asks: 'Give the three parts of the definition of orthogonality.',
    idea: 'Think of a LEGO set: a few brick types, every brick snaps to every other brick, and there is no "except this one". Orthogonal features are independent, so knowing the parts tells you every combination.',
    steps: [
      'A small set of primitive constructs, combined in a relatively small number of ways, builds all the control and data structures. Example: a few base types (int, float, char) plus two ways to build on them (array, pointer).',
      'Every possible combination is legal (and meaningful): a pointer to an array, an array of pointers, a pointer to a pointer, all allowed.',
      'Few or no exceptions to the rules. Every exception is something extra to memorize. In C, functions may return structs but not arrays; that is an exception.',
      { text: 'Sebesta\'s machine example: adding two numbers, where each operand can be a register or memory.', table: { head: ['machine', 'combinations allowed', 'orthogonal?'], rows: [['VAX (one ADDL instruction)', 'all 4', 'yes'], ['IBM (A and AR instructions)', '2 of 4', 'no']] } },
    ],
    answer: 'A small set of primitive constructs can be combined in a relatively small number of ways to build the control and data structures; every possible combination is legal; there are few or no exceptions to the rules.',
    mistake: 'Defining it as "simple". Simplicity is about how many features there are; orthogonality is about whether they combine freely. Also, too much orthogonality can hurt: ALGOL 68 allowed nearly every combination and became very complex.',
    tryIt: { q: 'A language lets a pointer point to any type except arrays. Which part of orthogonality fails?', a: 'Every possible combination is legal: pointer + array is an illegal combination, an exception to the rule.' },
  };

  H['l1-orthog-example'] = {
    asks: 'C lets a function return a struct but not an array. Name the sub-criterion this breaks and explain how.',
    idea: 'Two features that are each fine on their own should combine. When one pairing is forbidden for no visible reason, the language has an exception, and exceptions are what orthogonality forbids.',
    steps: [
      'List the parts: "a function has a return type" is a legal construct. "An array is a type" is a legal construct.',
      'Orthogonality says every combination of legal constructs should be legal. So "a function returning an array" should be fine.',
      { text: 'It is not. gcc accepts the struct (even one holding an array) but rejects the array:', code: 'struct pair { int a[3]; };\nstruct pair f(void);   // OK: returns a struct\nint g(void)[3];        // error: \'g\' declared as function returning an array' },
      'So the programmer must remember a special case: that is a lack of orthogonality.',
    ],
    answer: 'Orthogonality: return type and array are both legal constructs, but this one combination of them is not, so it is an exception the programmer has to remember.',
    mistake: 'Calling it a simplicity problem. Simplicity counts features; here no feature is missing. The problem is one combination being banned.',
    tryIt: { q: 'In C, parameters are passed by value, except arrays, which act as if passed by reference. Which sub-criterion is this, and why?', a: 'Orthogonality: the rule for passing parameters has an exception for one type.' },
  };

  H['blank:b1-14-1l46rjl'] = {
    asks: 'Under the data types sub-criterion, what should a good language give you?',
    idea: 'If the language does not have a type for what you mean, you have to fake it with another type, and the reader has to guess what you meant.',
    steps: [
      { text: 'Sebesta\'s example: a language with no Boolean type, so a flag is stored as a number.', code: 'timeOut = 1      // a count? a flag? unclear\ntimeOut = true   // clearly a flag' },
      'The second line needs no comment because the type says what the value means. That is the readability gain.',
      'The same goes for data structures: a language with records (structs), arrays and so on lets you say "this is a student record" instead of juggling parallel variables.',
    ],
    answer: 'Adequate predefined data types and data structures.',
    mistake: 'Answering "many data types". The word is adequate: enough for what you need to express, not as many as possible.',
    tryIt: { q: 'A language has no character type, so letters are stored as integers like 65. Which sub-criterion suffers, and which top-level criterion does it hurt?', a: 'Data types; it hurts readability, since 65 does not show that it means the letter A.' },
  };

  H['l1-syntax-design'] = {
    asks: 'Name three aspects of syntax (the written form) that affect how readable a language is.',
    idea: 'Readers find their way through code by its words and shapes. The words should be reserved and clear, groups of statements should show where they end, and the look of a construct should hint at what it does.',
    steps: [
      'Special (reserved) words, such as `while`, `class`, `for`. They are signposts. If they can also be used as variable names (Fortran 95 allows a variable named `Do`), the signposts lie.',
      { text: 'How compound statements are formed. A brace closes everything the same way; Ada says what is closing:', code: '/* C */            -- Ada\n}                   end if;\n}                   end loop;' },
      'Meaningful keywords, so that form shows meaning. `while` reads as what it does. Sebesta\'s counter-example is the Unix command `grep`, whose name tells a beginner nothing.',
    ],
    answer: 'Special (reserved) words such as while, class and for; the way compound statements are formed (end if / end loop vs braces); meaningful keywords, so that a construct\'s form shows what it does.',
    mistake: 'Answering with semantics ("what the statement does"). Syntax design is about how it is written: the words and the shapes on the page.',
    tryIt: { q: 'In one language `static` means different things inside and outside a function. Which syntax design aspect does that hurt?', a: 'Meaningful keywords (form shows meaning): one word has two meanings depending on where it sits.' },
  };

  H['blank:b1-15-17cbqtc'] = {
    asks: 'Define support for abstraction.',
    idea: 'Abstraction is a black box: build something complicated once, give it a name, and from then on use it by name without thinking about its insides.',
    steps: [
      'Two things can be abstracted: operations (functions, procedures) and structures (data types, classes).',
      { text: 'An operation: you call it without knowing how it works.', code: 'double r = sqrt(2.0);   // no idea which algorithm runs, and no need' },
      'A structure: a `Stack` with push and pop. Users of it ignore whether it is an array or a linked list underneath.',
      'A language "supports" abstraction when it lets YOU make these, not only use the built-in ones. That helps writeability: you solve the hard part once and reuse it.',
    ],
    answer: 'Being able to define complex structures or operations and then use them while ignoring their details.',
    mistake: 'Leaving out "and then use them while ignoring the details". Defining complex things is not the point; being able to forget their details afterwards is.',
    tryIt: { q: 'You write a function `average(a, n)` once and then call it in ten places. Which sub-criterion are you using?', a: 'Support for abstraction (an operation defined once and used without thinking about its details).' },
  };

  H['blank:b1-15-7vrq6m'] = {
    asks: 'What does it mean for a language to be expressive?',
    idea: 'Expressive means a small amount of code says a lot. Compare how much you must type to get the same work done.',
    steps: [
      { text: 'Lisp adds two lists element by element in one line:', code: "(mapcar '+ '(1 3 4 7) '(2 4 6 8))   ; => (3 7 10 15)" },
      { text: 'C needs a loop to do the same work:', code: 'for (int i = 0; i < 4; i++)\n    c[i] = a[i] + b[i];   // c = 3 7 10 15' },
      'Same result, but the Lisp version hides the whole loop inside one command. A smaller everyday example: `count++` is shorter than `count = count + 1`.',
      'Expressivity mostly helps writeability: less to type and fewer places to make a mistake.',
    ],
    answer: 'A short command does a lot of computation.',
    mistake: 'Confusing it with readability. Very expressive code can be hard to read (one line doing a whole loop). Expressivity is about how much one command does.',
    tryIt: { q: 'Python\'s `sum(nums)` adds up a whole list. Which sub-criterion does it show, and what would C need instead?', a: 'Expressivity: one short call does a loop\'s worth of work; C would need a loop with an accumulator.' },
  };

  H['l1-expressivity'] = {
    asks: 'Work out what the Lisp expression returns.',
    idea: '`mapcar` walks down several lists in step and applies a function to each set of matching elements, collecting the results in a new list.',
    steps: [
      'Read it: apply `+` to the lists `(1 3 4 7)` and `(2 4 6 8)`. The quote marks just mean "take this as data, do not evaluate it".',
      { text: 'Pair the elements by position and add:', table: { head: ['position', 'first list', 'second list', '+'], rows: [['1', '1', '2', '3'], ['2', '3', '4', '7'], ['3', '4', '6', '10'], ['4', '7', '8', '15']] } },
      'Collect the sums in order into a new list: `(3 7 10 15)`. One short command did the work of a whole loop, which is why the slide uses it for expressivity.',
    ],
    answer: '(3 7 10 15)',
    mistake: 'Adding everything into one number (40) or writing the two lists joined together. `mapcar` keeps one result per position.',
    tryIt: { q: "What does `(mapcar '* '(1 2 3) '(4 5 6))` return?", a: '(4 10 18): 1*4, 2*5, 3*6.' },
  };

  H['l1-type-checking'] = {
    asks: 'Define type checking as a criterion.',
    idea: 'Every value has a type, and each type allows only some operations. Type checking is someone checking that you never do a wrong-type operation, either before the program runs or while it runs.',
    steps: [
      'Who checks: the compiler (before the program runs) or the run-time system (while it runs). Catching it at compile time is better: cheaper, and the bug never ships.',
      { text: 'Compile-time check, Java:', code: 'int x = "hello";\n// error: incompatible types: String cannot be converted to int' },
      { text: 'Run-time check, Python:', code: 'print(1 + "a")\n# TypeError: unsupported operand type(s) for +: \'int\' and \'str\'' },
      'Without any check, original C would pass an int to a function expecting a float, and the function would quietly compute nonsense. That is why type checking feeds reliability.',
    ],
    answer: 'The compiler (or the run-time system) checks that each variable is used in a way that is correct for its type.',
    mistake: 'Saying only "the compiler checks types". The check can also happen at run time; both count.',
    tryIt: { q: 'A program divides a string by 2 and crashes with an error message while running. Was there type checking? When?', a: 'Yes, at run time: the run-time system caught the wrong-type operation.' },
  };

  H['l1-exception-handling'] = {
    asks: 'Define exception handling as a criterion.',
    idea: 'Things go wrong while programs run: bad input, missing files, an index out of range. Exception handling lets the program notice the problem and recover instead of dying.',
    steps: [
      'Intercept: the program catches a run-time error or unusual condition when it happens.',
      'Take corrective measures: do something sensible, such as use a default value or ask again, and then continue.',
      { text: 'Java example (prints `bad number, using 0` and then `n = 0`):', code: 'int n;\ntry { n = Integer.parseInt("abc"); }\ncatch (NumberFormatException e) {\n    n = 0;\n    System.out.println("bad number, using 0");\n}\nSystem.out.println("n = " + n);' },
      'C has practically no exception handling, so a C program must check for every error by hand. Exception handling feeds reliability.',
    ],
    answer: 'The program intercepts run-time errors (unusual conditions) and takes corrective measures, so it can continue.',
    mistake: 'Describing type checking or compile errors. Exceptions are about errors while the program runs, and the key word is corrective: the program recovers.',
    tryIt: { q: 'A program asks for a file name, the file is missing, and it says "not found, try again" instead of crashing. Which sub-criterion is that?', a: 'Exception handling: it intercepted a run-time error and took a corrective measure.' },
  };

  H['blank:b1-16-1gd91b5'] = {
    asks: 'What is aliasing?',
    idea: 'An alias is a second name for the same thing. In a program, two names that reach the same memory cell mean a change through one name is silently seen through the other.',
    steps: [
      { text: 'In C, a pointer gives a second name for `x`:', code: 'int x = 5;\nint *p = &x;   // *p and x name the same cell\n*p = 9;\nprintf("%d\\n", x);   // prints 9' },
      { text: 'Trace:', table: { head: ['line', 'x', '*p'], rows: [['int x = 5;', '5', 'none yet'], ['int *p = &x;', '5', '5'], ['*p = 9;', '9', '9']] } },
      'We never wrote `x = 9`, yet `x` changed. In a large program that surprise causes bugs, so restricting aliasing helps reliability.',
    ],
    answer: 'Two or more distinct names for the same memory location.',
    mistake: 'Saying "two variables with the same value". Equal values in two separate cells is not aliasing; it is about one cell with two names.',
    tryIt: { q: 'In Java, `int[] a = {1, 2}; int[] b = a; b[0] = 7;` What is `a[0]`, and why?', a: '7. `a` and `b` refer to the same array, so they are aliases.' },
  };

  H['blank:b1-17-1u1df02'] = {
    asks: 'What is portability?',
    idea: 'Portable code is like a plug that fits every socket: write it once and it runs on another machine or compiler without rewriting.',
    steps: [
      '"Platform" here means an implementation: a particular compiler, operating system, or machine.',
      'Portability is strongest when the language is standardized, so every implementation agrees on what code means. Sebesta notes the C++ standard took from 1989 to 1998.',
      'Java is a well-known example: it compiles to byte code, and any machine with a byte code interpreter can run it.',
    ],
    answer: 'Ease of moving code from one platform (implementation) to another.',
    mistake: 'Confusing it with being small or light. "Portable" here means moving code between implementations, not file size.',
    tryIt: { q: 'A program works with one compiler but gives different results with another, because the language standard leaves a detail undefined. Which sub-criterion suffers?', a: 'Portability: the code does not move cleanly from one implementation to another.' },
  };

  H['l1-tradeoff'] = {
    asks: 'Java stops out-of-bounds array indexes, C does not. Which two criteria are being traded?',
    idea: 'Safety checks are not free. Every check is extra work at run time. A language designer picks: check (safer) or skip (faster).',
    steps: [
      { text: 'Java checks every index while running:', code: 'int[] a = {1, 2, 3};\na[3] = 99;\n// Exception: Index 3 out of bounds for length 3' },
      'That check runs on every array access, which costs time, but the bug is caught right away. This buys reliability (and security, since attackers cannot write past the array).',
      'C does no index check. `a[3] = 99;` compiles, and the write lands on whatever memory sits next to the array. C saves the time of the check, which buys run-time speed.',
      { text: 'Side by side:', table: { head: ['language', 'gains', 'pays'], rows: [['Java', 'reliability, security', 'run-time speed'], ['C', 'run-time speed', 'reliability, security']] } },
    ],
    answer: 'Reliability (and security) against run-time speed: Java checks every index at run time, which costs time; C skips the check, which is faster but lets bugs and attacks through.',
    mistake: 'Naming only one side. A trade-off needs both: what Java gains and what it gives up.',
    tryIt: { q: 'A language checks the type of every value each time it is used, while running. What does it gain and what does it pay?', a: 'It gains reliability (type errors are caught) and pays run-time speed (the checks take time).' },
  };

  // ---------- Pascal vs Java conditionals ----------

  const kiwi = 'Pascal:  if kiwi > orange then\nJava:    if (kiwi > orange)';

  H['l1-readwrite'] = {
    asks: 'Look only at how the condition is written in Pascal and Java and say which is easier to read, and for whom.',
    idea: 'Readability depends on who is reading. Something close to English helps a beginner a lot; an experienced programmer reads both shapes without effort.',
    steps: [
      { text: 'Put the two conditions next to each other:', code: kiwi },
      'Pascal reads like an English sentence: "if kiwi is greater than orange then ...". The word `then` tells you an action is coming.',
      'Java wraps the condition in brackets, which looks more like math. Beginners often find that odd.',
      'Verdict: Pascal is more readable for beginners; experienced programmers find the two about equally readable.',
    ],
    answer: 'Pascal reads more like English (the word “then”, no brackets around the condition), which helps beginners. Experienced programmers find the two about equally readable.',
    mistake: 'Talking about typing effort (that is writeability) or about `WriteLn` versus `println` (the question says condition only).',
    tryIt: { q: 'Ada ends an if with `end if;` while C ends it with `}`. Which is more readable, and why?', a: 'Ada for most readers: `end if` says what is ending, while `}` closes every kind of block the same way.' },
  };

  H['l1-readwrite-w'] = {
    asks: 'Same two conditionals, now judged on writeability: which takes less effort to type?',
    idea: 'Writeability is about the effort of producing the code. Count what you type, think about how often you type it, and think about what happens when you forget something.',
    steps: [
      { text: 'Compare what each adds around the condition:', code: kiwi },
      'Pascal adds the word `then` (4 letters). Java adds `(` and `)` (2 characters). So Java is two characters shorter per condition.',
      'Programmers write a great many conditionals, so a small saving each time adds up. That argues for Java.',
      'The counterpoint: if you forget the opening bracket in Java you must go back and insert it. In Pascal you just type `then` at the end, in the order you think.',
    ],
    answer: 'Java needs two fewer characters per condition, and we write a great many conditionals, so it may be more writeable. Against that: forgetting a bracket means going back to insert it, while in Pascal you just type “then” at the end.',
    mistake: 'Arguing that Pascal is easier to read. That is readability. Writeability is about the work of writing.',
    tryIt: { q: 'Python writes `if x > 0:` with no brackets and no `then`. Compared with Java\'s `if (x > 0)`, which is more writeable on character count?', a: 'Python: it adds only `:` (1 character) where Java adds `(` and `)` (2), and nothing has to be gone back for.' },
  };

  H['l1-readwrite-which'] = {
    asks: 'Choose Pascal or Java syntax and defend the choice.',
    idea: 'There is no single right side. The marks go to the argument: pick a side, name the criterion, point at the actual difference, and admit what the other side wins.',
    steps: [
      'Take a side. Her own choice was Pascal.',
      'Name the criterion it rests on: readability.',
      'Point at the concrete difference: `then` and no brackets make Pascal closer to English. For beginners, `then` builds the habit of seeing that an action is about to happen, and brackets around a condition feel abnormal and "too mathy".',
      'Admit the cost: Pascal means more typing on every conditional (writeability favours Java).',
      { text: 'A full answer has four parts:', table: { head: ['part', 'example'], rows: [['side', 'Pascal'], ['criterion', 'readability'], ['evidence', '`then`, no brackets, closer to English, good for beginners'], ['cost', 'more characters to type per condition']] } },
    ],
    answer: 'Either can be chosen if justified. Her answer: Pascal, because it is closer to English (“then”, no brackets). Working with beginners, forcing “then” into their thinking helps them see that something is about to happen, and beginners find brackets around a condition abnormal and “too mathy”. The cost: more typing on every conditional.',
    mistake: 'Writing "Java, because I know it better". Familiarity is not one of the criteria; tie the choice to readability or writeability and to the visible difference.',
    tryIt: { q: 'Argue for Java instead, in one or two sentences.', a: 'Java, for writeability: two fewer characters on every condition adds up over many conditionals, and experienced programmers read both equally well. The cost: beginners find the brackets less natural.' },
  };

  // ---------- Language categories ----------

  H['l1-categories'] = {
    asks: 'Name the four categories of programming languages used in the course.',
    idea: 'Each category is a different answer to "how do you tell a computer what to do?": give it steps, give it functions, give it rules, or give it objects. The four course languages are one of each.',
    steps: [
      'Procedural (also called imperative): give steps that change variables. Course language: C.',
      'Functional: compute by applying functions to arguments. Course language: Scheme.',
      'Logic: state facts and rules, then ask questions. Course language: Prolog.',
      'Object-oriented: organize the program into objects (classes) that hold data and methods. Course language: Java.',
      { text: 'Hook: steps, functions, rules, objects.', table: { head: ['category', 'you give the computer', 'course language'], rows: [['procedural', 'steps', 'C'], ['functional', 'functions', 'Scheme'], ['logic', 'rules', 'Prolog'], ['object-oriented', 'objects', 'Java']] } },
    ],
    answer: 'Procedural (imperative), functional, logic, object-oriented.',
    mistake: 'Listing "imperative" and "procedural" as two categories. They are two names for the same one.',
    tryIt: { q: 'Which category is a language whose programs are lists of facts and rules that you query?', a: 'Logic.' },
  };

  H['l1-classify'] = {
    asks: 'Put each course language in its category.',
    idea: 'Ask what you write most in each one: C is statements that change variables, Scheme is function calls, Prolog is facts and rules, Java is classes.',
    steps: [
      'C: you write step-by-step statements that assign to variables (`x = x + 1;`). Procedural (imperative).',
      'Scheme: everything is a function call, like `(+ 1 (* 2 3))`, which returns 7. Functional.',
      'Prolog: you state what is true (facts and rules) and the system works out the answer to a query. Logic.',
      'Java: all code must live inside a class. Object-oriented.',
      { text: 'Summary:', table: { head: ['language', 'what you write most', 'category'], rows: [['C', 'statements that change variables', 'procedural'], ['Scheme', 'function calls', 'functional'], ['Prolog', 'facts and rules', 'logic'], ['Java', 'classes', 'object-oriented']] } },
    ],
    answer: 'C: procedural (imperative). Scheme: functional. Prolog: logic. Java: object-oriented.',
    mistake: 'Calling Java procedural because its method bodies are made of statements. What puts Java in the OO category is that the program is forced to be organized into classes.',
    tryIt: { q: 'Lisp (with `mapcar`) is Scheme\'s ancestor. Which category is it in?', a: 'Functional: computation is done by applying functions to parameters.' },
  };

  H['blank:b1-19-1f3lwml'] = {
    asks: 'What are the central features of procedural (imperative) languages?',
    idea: 'Procedural languages are shaped by the hardware. A von Neumann computer has memory cells, moves values between memory and the CPU, and repeats code with a jump. Each central feature is a copy of one of those.',
    steps: [
      'Variables model the memory cells.',
      'Assignment statements model moving (piping) a value from the CPU back into a memory cell: `sum = sum + x;`.',
      'Iteration (loops) models repetition, which is fast on this hardware: the instructions sit next to each other in memory, so repeating needs only a jump back.',
      { text: 'All three in a few lines of C:', code: 'int sum = 0;                    // variable\nfor (int i = 1; i <= 3; i++)    // iteration\n    sum = sum + i;              // assignment' },
    ],
    answer: 'Variables, assignment statements, and iteration.',
    mistake: 'Answering "procedures (functions)". The name sounds like it, but the central features are variables, assignment and iteration.',
    tryIt: { q: 'Which of these three central features does a purely functional program avoid?', a: 'All three: it can work without variables (as memory cells), without assignment statements, and without iteration (it uses recursion instead).' },
  };

  H['blank:b1-19-1dq55la'] = {
    asks: 'How does a functional language compute?',
    idea: 'In a functional language a program is one big expression made of function calls. Nothing is assigned; each function takes values in and hands a value back.',
    steps: [
      { text: 'Scheme computes `1 + 2 * 3` by calling functions:', code: '(+ 1 (* 2 3))   ; (* 2 3) gives 6, then (+ 1 6) gives 7' },
      'There is no `x = ...` step. The inner call returns 6 straight into the outer call.',
      'Sebesta: programming can be done in a functional language without the variables, assignment statements, and iteration of imperative languages.',
    ],
    answer: 'By applying functions to given parameters.',
    mistake: 'Saying "by using functions". C uses functions too. The point is that applying functions is the main (or only) way computation happens.',
    tryIt: { q: 'In Scheme, what does `(* (+ 2 3) 4)` compute, and how?', a: '20: `(+ 2 3)` is applied first and gives 5, then `(* 5 4)` gives 20.' },
  };

  H['blank:b1-19-1hfdb5b'] = {
    asks: 'How is a program in a logic language written?',
    idea: 'In a procedural language you list the steps in order. In a logic language you list what is true, as rules, in any order, and the system decides the order in which to use them to answer your question.',
    steps: [
      { text: 'A small Prolog program: two facts and one rule.', code: 'parent(tom, bob).\nparent(bob, ann).\ngrandparent(X, Z) :- parent(X, Y), parent(Y, Z).' },
      'Read the rule as: X is a grandparent of Z if X is a parent of some Y and Y is a parent of Z.',
      'Ask `?- grandparent(tom, Who).` and the system works out `Who = ann`. You never wrote the steps for how to search.',
      'That is why it is called rule-based, and why the rules are specified in no particular order.',
    ],
    answer: 'As rules (rule-based), specified in no particular order.',
    mistake: 'Describing it as "using logic like if statements". C has if statements too. The difference is that you give rules, not an ordered algorithm.',
    tryIt: { q: 'Using the facts above, what does `?- parent(Who, ann).` answer?', a: '`Who = bob`, because the fact `parent(bob, ann)` matches.' },
  };

  H['blank:b1-19-1j9phr'] = {
    asks: 'An object-oriented language forces the program to be organized into what?',
    idea: 'In an OO language, data and the code that works on that data are packed together into one unit (a class, whose instances are objects). The best reading of the slide\'s blank is "objects/classes", so check the exact wording against your notes.',
    steps: [
      { text: 'In Java even the main program must sit inside a class:', code: 'class Counter {\n    private int count = 0;          // data\n    void tick() { count++; }        // method that works on it\n    int get() { return count; }\n}' },
      'Data (`count`) and methods (`tick`, `get`) are encapsulated together, and other code reaches the data only through the methods.',
      'Sebesta adds the two other ideas that make a language OO: inheritance and dynamic (run-time) method binding.',
    ],
    answer: 'Objects/classes (data and methods encapsulated together).',
    mistake: 'Saying "functions". A procedural language organizes code into functions; OO bundles functions with the data they work on.',
    tryIt: { q: 'C can store data in a struct and has separate functions that take the struct. Is that object-oriented by this definition?', a: 'No: the language does not force data and methods to be organized together into classes; they stay separate.' },
  };
})(globalThis.FC = globalThis.FC || {});
