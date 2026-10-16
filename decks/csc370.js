// AUCSC 370 Programming Languages (Rosanna Heise), lectures 1-5 and 10.
//
// Sources: the 8 pre/post-test answer keys, the C Language Exam 1 (2026) key, and the
// non-blank text of the 6 "Student" slide decks (PDFs in ~/Downloads). Every `source` names
// where a card came from. Cards whose answer is NOT in those PDFs say so in `source`
// (Sebesta, standard knowledge, or "practice item").
//
// Recall `points` are graded one checkbox each and ALL are required, so every point is one
// checkable idea, never "any two of …".
//
// `blanks` are the empty fill-ins on the student slides. Their supplied answers live in
// decks/csc370-blank-answers.js. Blanks merged into a card here (or dropped as duplicates or
// trivia) are listed in FC.blankRetired there and are not studied on their own.
//
// Every `verify.src` is run by tests/verify-traces.test.js; its output must equal `answer`.
(function (FC) {
  'use strict';

  // One rubric for every “argue a design choice” card (research/04 rule 15: grade point by point).
  const ARGUE = [
    'takes a side',
    'names the criterion it rests on (readability, writeability, reliability or cost)',
    'gives a concrete code example',
    'admits the trade-off: what the other side gains',
  ];

  const cards = [
    // ───────────── Lecture 1: intro, what makes a language good ─────────────
    { id: 'l1-pl-def', lecture: '1', type: 'recall',
      prompt: 'Define “programming language” without using the words “program” or “language”.',
      answer: 'The syntax and semantics used to specify instructions to a computer, where those instructions must be able to do all computing.',
      points: ['syntax and semantics', 'used to give instructions to a computer', 'the instructions can do all computing (Turing complete)'],
      why: 'The “all computing” part is what rules out things like HTML.',
      source: 'Pre Test #1, Q3' },
    { id: 'l1-turing', lecture: '1', type: 'typed',
      prompt: 'What key characteristic must a language have for AUCSC 370 to count it as a programming language?',
      answer: 'Turing completeness', accept: ['Turing complete', 'Turing-complete', 'being Turing complete'],
      why: 'A language that is not Turing complete cannot express every computation.',
      source: 'Intro to PL answer key, Q2' },
    { id: 'l1-html', lecture: '1', type: 'recall',
      prompt: 'Is HTML a programming language? Why or why not?',
      answer: 'No. HTML has no conditional repetition (loops), so it is not Turing complete: there are things we should be able to tell a computer to do that HTML cannot express.',
      points: ['No', 'no conditional repetition (loops)', 'therefore not Turing complete'],
      why: 'Conditional repetition is one of the requirements for Turing completeness.',
      source: 'Pre Test #1 Q4; Intro to PL Q3' },
    { id: 'l1-criteria', lecture: '1', type: 'recall',
      prompt: 'Name the four top-level criteria for judging whether a language is good.',
      answer: 'Reliability, cost, readability, writeability.',
      points: ['reliability', 'cost', 'readability', 'writeability'],
      why: 'Every sub-criterion (simplicity, orthogonality, type checking, …) feeds one of these four.',
      source: 'Slides 1, slide 11' },
    { id: 'l1-subcriteria-all', lecture: '1', type: 'recall',
      prompt: 'Name all twelve sub-criteria used to judge a language.',
      answer: 'Simplicity, orthogonality, data types, syntax design, support for abstraction, expressivity; type checking, exception handling, restricted aliasing, run-time speed, portability, security.',
      points: ['simplicity', 'orthogonality', 'data types', 'syntax design', 'support for abstraction', 'expressivity', 'type checking', 'exception handling', 'restricted aliasing', 'run-time speed', 'portability', 'security'],
      why: 'The list is fixed, so the answer is the same every time. The first six mostly shape readability and writeability; the last six mostly reliability and cost. Each one also has its own definition card.',
      source: 'Slides 1, slide 12 (replaces the old “name any four” card)' },
    { id: 'l1-simplicity', lecture: '1', type: 'recall',
      prompt: 'What three properties make a language simple?',
      answer: 'A manageable (small) set of features and constructs; minimal feature multiplicity (few ways to do the same thing, e.g. count++ vs count = count + 1); minimal operator overloading.',
      points: ['a manageable (small) set of features and constructs', 'minimal feature multiplicity: few ways to do one thing', 'minimal operator overloading'],
      why: 'Each extra way of saying the same thing is one more thing a reader must know.',
      source: 'Slides 1, slide 13 (blank wording from Sebesta ch. 1; merges three slide blanks)' },
    { id: 'l1-orthogonality', lecture: '1', type: 'recall',
      prompt: 'Define orthogonality as a language criterion (three parts).',
      answer: 'A small set of primitive constructs can be combined in a relatively small number of ways to build the control and data structures; every possible combination is legal; there are few or no exceptions to the rules.',
      points: ['a small set of primitive constructs, combined in a small number of ways', 'every possible combination is legal', 'few or no exceptions to the rules'],
      why: 'Orthogonal = the features are independent, so knowing the parts tells you every combination.',
      source: 'Slides 1, slide 13 (blank wording from Sebesta ch. 1; merges three slide blanks)' },
    { id: 'l1-orthog-example', lecture: '1', type: 'recall',
      prompt: 'In C, a function may return a struct but not an array. Which sub-criterion does this rule break, and how?',
      answer: 'Orthogonality: “return type” and “array” are both legal constructs, but this one combination of them is not, so it is an exception the programmer has to remember.',
      points: ['orthogonality', 'one combination of two legal constructs is illegal (an exception to the rules)'],
      why: 'Classifying an example is how definitions transfer to new questions.',
      source: 'Sebesta ch. 1 example (not in her slides)' },
    { id: 'l1-syntax-design', lecture: '1', type: 'recall',
      prompt: 'Name three aspects of syntax design that affect readability.',
      answer: 'Special (reserved) words such as while, class and for; the way compound statements are formed (end if / end loop vs braces); meaningful keywords, so that a construct’s form shows what it does.',
      points: ['special words (e.g. while, class, for)', 'how compound statements are formed (e.g. end if vs { })', 'meaningful keywords: form shows meaning'],
      why: 'A closing brace says “something ended”; end loop says what ended.',
      source: 'Slides 1, slide 14 (blank wording from Sebesta ch. 1; merges three slide blanks)' },
    { id: 'l1-type-checking', lecture: '1', type: 'recall',
      prompt: 'Define type checking as a language criterion.',
      answer: 'The compiler (or the run-time system) checks that each variable is used in a way that is correct for its type.',
      points: ['done by the compiler or the run-time system', 'checks each variable is used correctly for its type'],
      why: 'It feeds reliability: type errors are caught instead of silently producing garbage.',
      source: 'Slides 1, slide 16 (blank wording from Sebesta ch. 1; merges two slide blanks)' },
    { id: 'l1-exception-handling', lecture: '1', type: 'recall',
      prompt: 'Define exception handling as a language criterion.',
      answer: 'The program intercepts run-time errors (unusual conditions) and takes corrective measures, so it can continue.',
      points: ['intercepts run-time errors / unusual conditions', 'takes corrective measures'],
      why: 'It feeds reliability.',
      source: 'Slides 1, slide 16 (blank wording from Sebesta ch. 1; merges two slide blanks)' },
    { id: 'l1-why-study', lecture: '1', type: 'recall',
      prompt: 'Give the six reasons the course gives for studying programming languages.',
      answer: 'Better ability to express ideas; choosing the appropriate language(s); learning new languages; seeing how the way a language is implemented has consequences for the programmer; better use of the languages you already know; advancing computational thinking.',
      points: ['better ability to express ideas', 'choose appropriate language(s)', 'learn new languages', 'how a language is implemented has consequences for the programmer', 'better use of languages you already know', 'advancement of computational thinking'],
      why: 'The list is fixed, in the order the slides give it.',
      source: 'Slides 1, slides 8-10' },
    { id: 'l1-readwrite', lecture: '1', type: 'recall',
      prompt: 'Considering only how the condition is written, discuss the readability of these two equivalent conditionals.',
      code: `In Pascal                      In Java
if kiwi > orange then          if (kiwi > orange)
   WriteLn('CLOUDS')              System.out.println("CLOUDS");
else if kiwi = orange then     else if (kiwi == orange)
   WriteLn('WINDY')               System.out.println("WINDY");
else                           else
   WriteLn('SUNNY')               System.out.println("SUNNY");`,
      answer: 'Pascal reads more like English (the word “then”, no brackets around the condition), which helps beginners. Experienced programmers find the two about equally readable.',
      points: ['Pascal is more English-like (then, no brackets)', 'this helps beginners most', 'experienced programmers find them about equal'],
      why: 'Her key separates readability, writeability and the verdict into three parts; so do these cards.',
      source: 'Intro to PL answer key, Q1a' },
    { id: 'l1-readwrite-w', lecture: '1', type: 'recall',
      prompt: 'Considering only how the condition is written, discuss the writeability of these two equivalent conditionals.',
      code: `In Pascal                      In Java
if kiwi > orange then          if (kiwi > orange)
   WriteLn('CLOUDS')              System.out.println("CLOUDS");
else if kiwi = orange then     else if (kiwi == orange)
   WriteLn('WINDY')               System.out.println("WINDY");
else                           else
   WriteLn('SUNNY')               System.out.println("SUNNY");`,
      answer: 'Java needs two fewer characters per condition, and we write a great many conditionals, so it may be more writeable. Against that: forgetting a bracket means going back to insert it, while in Pascal you just type “then” at the end.',
      points: ['Java: two fewer characters per condition', 'conditionals are frequent, so the saving adds up', 'counterpoint: a forgotten bracket costs a fix; “then” is typed at the end'],
      why: 'A writeability argument is about the effort of producing the code, not reading it.',
      source: 'Intro to PL answer key, Q1b' },
    { id: 'l1-readwrite-which', lecture: '1', type: 'recall',
      prompt: 'Which syntax is better, the Java version or the Pascal version? Argue it.',
      code: `In Pascal                      In Java
if kiwi > orange then          if (kiwi > orange)
   WriteLn('CLOUDS')              System.out.println("CLOUDS");
else if kiwi = orange then     else if (kiwi == orange)
   WriteLn('WINDY')               System.out.println("WINDY");
else                           else
   WriteLn('SUNNY')               System.out.println("SUNNY");`,
      answer: 'Either can be chosen if justified. Her answer: Pascal, because it is closer to English (“then”, no brackets). Working with beginners, forcing “then” into their thinking helps them see that something is about to happen, and beginners find brackets around a condition abnormal and “too mathy”. The cost: more typing on every conditional.',
      points: ['takes a side', 'names the criterion it rests on (readability or writeability)', 'points at the concrete difference (then / brackets / characters typed)', 'admits what the other version gains'],
      why: 'Her key: “Either could be chosen if properly justified.” The marks are for the justification.',
      source: 'Intro to PL answer key, Q1c' },
    { id: 'l1-expressivity', lecture: '1', type: 'typed',
      prompt: 'The slides use this Lisp line as an example of expressivity. What does it evaluate to?',
      code: `(mapcar '+ '(1 3 4 7) '(2 4 6 8))`,
      answer: '(3 7 10 15)',
      why: 'mapcar applies + to the first elements of both lists, then the second, and so on: 1+2, 3+4, 4+6, 7+8. One short command does a whole loop’s work, which is what expressivity means.',
      source: 'Slides 1, slide 15 (output verified with ECL Common Lisp)',
      verify: { lang: 'ecl', src: `(print (mapcar '+ '(1 3 4 7) '(2 4 6 8)))` } },
    { id: 'l1-categories', lecture: '1', type: 'recall',
      prompt: 'Name the four language categories the course uses.',
      answer: 'Procedural (imperative), functional, logic, object-oriented.',
      points: ['procedural = imperative', 'functional', 'logic', 'object-oriented'],
      why: 'The course languages cover them: C (procedural), Scheme (functional), Prolog (logic), Java (OO).',
      source: 'Slides 1, slide 19' },
    { id: 'l1-classify', lecture: '1', type: 'recall',
      prompt: 'Classify each course language by category: C, Scheme, Prolog, Java.',
      answer: 'C: procedural (imperative). Scheme: functional. Prolog: logic. Java: object-oriented.',
      points: ['C: procedural (imperative)', 'Scheme: functional', 'Prolog: logic', 'Java: object-oriented'],
      why: 'Prolog states what is true (facts and rules) and you query it; Scheme computes by applying functions.',
      source: 'Slides 1, slide 19; Pre Test #1 key (replaces the two one-language MC cards)' },
    { id: 'l1-tradeoff', lecture: '1', type: 'recall',
      prompt: 'Java refuses array indices that go out of bounds; C allows them. Which criteria trade off against each other here?',
      answer: 'Reliability (and security) against run-time speed: Java checks every index at run time, which costs time; C skips the check, which is faster but lets bugs and attacks through.',
      points: ['Java’s check buys reliability (and security)', 'C’s missing check buys run-time speed'],
      why: 'Almost every language feature buys one criterion by spending another.',
      source: 'Slides 1, slide 18 (the slide gives the example; the explanation follows Sebesta ch. 1, not the handout)' },

    // ───────────── Lecture 2: history ─────────────
    { id: 'l2-bigfour', lecture: '2', type: 'recall',
      prompt: 'What are the “big four” original programming languages?',
      answer: 'FORTRAN, LISP, Algol, COBOL.',
      points: ['FORTRAN', 'LISP', 'Algol', 'COBOL'],
      why: 'All four come from the late 1950s and most later languages descend from them.',
      source: 'History post-test, Q1' },
    { id: 'l2-eniac-how', lecture: '2', type: 'recall',
      prompt: 'How was ENIAC programmed?',
      answer: 'By moving cords (cables) and turning knobs; the instructions were often written on paper for the operators.',
      points: ['moving cords / plugging cables', 'turning knobs', 'instructions written on paper'],
      why: 'There was no stored program yet: programming meant rewiring.',
      source: 'History post-test, Q2b' },
    { id: 'l2-eniac-women', lecture: '2', type: 'recall',
      prompt: 'Why was ENIAC programmed mostly by women?',
      answer: 'More of the men were in the army and navy, during WWII and just after the war.',
      points: ['men were in the army/navy', 'WWII and just after'],
      why: '',
      source: 'History post-test, Q2c' },
    { id: 'l2-vonneumann', lecture: '2', type: 'recall',
      prompt: 'What was John von Neumann’s main contribution to programming ENIAC and later computers?',
      answer: 'The stored program: the program can be stored in memory just like the data it manipulates.',
      points: ['stored program', 'program kept in memory like data'],
      why: 'Once the program is data, a program (a compiler) can produce other programs.',
      source: 'History post-test, Q2d' },
    { id: 'l2-fortran-names', lecture: '2', type: 'mc',
      prompt: 'Which language treated variable names starting with I, J, K … N as integers and all other names as reals?',
      answer: 'FORTRAN', options: ['Plankalkül', 'COBOL', 'Algol'],
      why: 'Fortran I had no type declarations; the first letter of the name decided the type.',
      source: 'History post-test, Q3; Slides 2, slide 9' },
    { id: 'l2-prolog-true', lecture: '2', type: 'mc',
      prompt: 'In which language is a program a set of statements of what is true?',
      answer: 'Prolog', options: ['Scheme', 'Algol', 'COBOL'],
      why: 'Prolog programs are facts and rules; running one means asking a query.',
      source: 'History post-test, Q3' },
    { id: 'l2-algol-committee', lecture: '2', type: 'mc',
      prompt: 'Which language was created by an international committee?',
      answer: 'Algol', options: ['FORTRAN', 'LISP', 'Prolog'],
      why: 'Algol was a U.S. + European (Germany) effort at a universal language.',
      source: 'History post-test, Q3; Slides 2, slide 27' },
    { id: 'l2-algol-today', lecture: '2', type: 'mc',
      prompt: 'Which language’s most common use today is expressing algorithms?',
      answer: 'Algol', options: ['FORTRAN', 'COBOL', 'LISP'],
      why: 'Algol-style notation is how algorithms are still written down, and most languages descend from it.',
      source: 'History post-test, Q3' },
    { id: 'l2-cobol-sections', lecture: '2', type: 'mc',
      prompt: 'Which language has separate data and control sections?',
      answer: 'COBOL', options: ['FORTRAN', 'Algol', 'Prolog'],
      why: 'COBOL’s DATA DIVISION and PROCEDURE DIVISION (visible in its palindrome code).',
      source: 'History post-test, Q3' },
    { id: 'l2-recursion', lecture: '2', type: 'recall',
      prompt: 'Which two of the course’s languages originally got repetition only from recursion?',
      answer: 'LISP and Prolog.',
      points: ['LISP', 'Prolog'],
      why: 'Neither had loops originally; a function (or rule) calling itself was the only way to repeat.',
      source: 'History post-test, Q3 (key: A/D)' },
    { id: 'l2-wsut-oldest', lecture: '2', type: 'mc',
      prompt: 'Which is the oldest language that is still widely used today (her “WSUT” label)?',
      answer: 'FORTRAN', options: ['LISP', 'COBOL', 'Plankalkül'],
      why: 'Her slides badge FORTRAN, LISP and COBOL as the oldest, 2nd-oldest and 3rd-oldest WSUT languages. Plankalkül is older but was never in wide use. (The expansion of WSUT is not written out in her PDFs.)',
      source: 'History post-test, Q3' },
    { id: 'l2-wsut-order', lecture: '2', type: 'order',
      prompt: 'Order these still-widely-used (WSUT) languages from oldest to newest.',
      answer: ['FORTRAN', 'LISP', 'COBOL'],
      why: 'Fortran I compiler 1957; LISP designed 1958; COBOL 1959.',
      source: 'Slides 2, slides 9, 22, 34 (replaces the three “how is X labelled” blank cards)' },
    { id: 'l2-newest', lecture: '2', type: 'mc',
      prompt: 'Which of these languages is the newest?',
      answer: 'Python', options: ['Prolog', 'COBOL', 'LISP'],
      why: 'Python 1991; Prolog 1972; COBOL 1959; LISP 1958. Her key marks Python “newest” from a list that also had C and Java. Strictly, Java (1995) is newer than Python (1991), so this card leaves Java out; if her test lists both, her key says Python.',
      source: 'History post-test, Q3 (dates: standard history, not her slides)' },
    { id: 'l2-plankalkul', lecture: '2', type: 'recall',
      prompt: 'What was Plankalkül, and who designed it?',
      answer: 'Konrad Zuse’s “Program Calculus” (1945, published 1972): an early high-level language design that already had floating point, arrays and records.',
      points: ['Konrad Zuse', 'an early high-level language design (never implemented at the time)'],
      why: 'It shows the ideas were there long before the big four; it simply was not published or built.',
      source: 'Slides 2, slide 3 (“never implemented at the time” follows Sebesta)' },
    { id: 'l2-fortran-acronym', lecture: '2', type: 'typed',
      prompt: 'What does FORTRAN stand for?',
      answer: 'FORmula TRANslation', accept: ['formula translator'],
      why: 'It translated mathematical formulas into machine code.',
      source: 'Slides 2, slide 8' },
    { id: 'l2-ibm704', lecture: '2', type: 'recall',
      prompt: 'Fortran was designed for the IBM 704. What made that machine special?',
      answer: 'It was the first computer with floating-point hardware.',
      points: ['first computer with floating-point hardware'],
      why: 'With floating point in hardware, the interpretive overhead of earlier systems was no longer hidden, so compiled code had to be fast.',
      source: 'Slides 2, slide 8 (the “why” follows Sebesta, not the handout)' },
    { id: 'l2-fortran-goal', lecture: '2', type: 'recall',
      prompt: 'What was Fortran I’s main goal?',
      answer: 'Machine code generated as good as machine code someone could write by hand.',
      points: ['compiled code as good as hand-written machine code'],
      why: 'Programmers would only abandon hand coding if the compiler’s output was as fast.',
      source: 'Slides 2, slide 9' },
    { id: 'l2-fortran-1954', lecture: '2', type: 'recall',
      prompt: 'The first Fortran (1954, sometimes called Fortran 0) existed only on paper. What did that report claim?',
      answer: 'That compiled Fortran would be as efficient as hand-coded machine code, and that it would eliminate coding errors and debugging.',
      points: ['as efficient as hand-written machine code', 'would eliminate coding errors / debugging'],
      why: 'The first claim was the real design goal (and Fortran I nearly met it); the second was wildly over-optimistic.',
      source: 'Slides 2, slide 8 (blank wording from Sebesta ch. 2; merges three slide blanks)' },
    { id: 'l2-fortran-typing', lecture: '2', type: 'recall',
      prompt: 'In Fortran I, how did a variable get its type?',
      answer: 'From its name: there were no type declarations. Names starting with I, J, K, L, M or N were integers; all others were reals.',
      points: ['no type declarations', 'names starting with I to N were integers', 'all other names were reals'],
      why: 'Fortran IV later added explicit type declarations.',
      source: 'Slides 2, slide 9 (merges two slide blanks)' },
    { id: 'l2-fortran-if', lecture: '2', type: 'recall',
      prompt: 'Fortran I’s IF statement was 3-way. What were the three branches?',
      answer: 'Negative, zero and positive (the sign of the tested expression).',
      points: ['negative', 'zero', 'positive'],
      why: 'IF (expr) n1, n2, n3 jumped to one of three labels.',
      source: 'Slides 2, slide 9' },
    { id: 'l2-fortran-sub', lecture: '2', type: 'recall',
      prompt: 'Fortran I had subroutines, with two limits. What were they?',
      answer: 'They could not be external (separately compiled) and could not be recursive.',
      points: ['not external', 'not recursive'],
      why: 'Fortran II (1958) added independent compilation.',
      source: 'Slides 2, slides 9 and 11' },
    { id: 'l2-lisp-origin', lecture: '2', type: 'recall',
      prompt: 'What does LISP stand for, and who designed it?',
      answer: 'LISt Processing; John McCarthy (at MIT, 1958).',
      points: ['LISt Processing', 'John McCarthy'],
      why: 'It came out of artificial-intelligence research, which needed lists and recursion.',
      source: 'Slides 2, slides 17-18 and 22' },
    { id: 'l2-lisp-dialects', lecture: '2', type: 'recall',
      prompt: 'What are Lisp’s two main dialects today?',
      answer: 'Common Lisp and Scheme.',
      points: ['Common Lisp', 'Scheme'],
      why: 'More than 20 kinds exist (Clojure, Racket, Emacs Lisp …); Scheme is the one this course uses.',
      source: 'Slides 2, slide 23' },
    { id: 'l2-lisp-status', lecture: '2', type: 'recall',
      prompt: 'What do the slides say about Lisp’s status today?',
      answer: 'It dominated AI for about 25 years; Lisp machines have died out; it lives on inside Emacs (Editor MACroS).',
      points: ['dominated AI for about 25 years', 'Lisp machines died out', 'lives on in Emacs'],
      why: 'The slide says Lisp is “still leader for” AI. That is the slide’s (dated) claim: in 2026 the AI leader is Python.',
      source: 'Slides 2, slide 24 (the blank wording follows Sebesta; merges three slide blanks)' },
    { id: 'l2-algol-origin', lecture: '2', type: 'recall',
      prompt: 'What does Algol stand for, and what was it trying to be?',
      answer: 'ALGOrithmic Language: a universal, machine-independent language for expressing algorithms (one that would work on more than one architecture).',
      points: ['ALGOrithmic Language', 'a universal language that works on more than one architecture'],
      why: 'Same era as Lisp and Fortran (late 1950s). Who made it is on the “international committee” card.',
      source: 'Slides 2, slides 25 and 27' },
    { id: 'l2-algol-subgoals', lecture: '2', type: 'recall',
      prompt: 'What were Algol’s three subgoals?',
      answer: 'Syntax close to mathematical notation; good for describing algorithms in publications; mechanically translatable into machine code.',
      points: ['syntax close to mathematical notation', 'good for describing algorithms in publications', 'mechanically translatable into machine code'],
      why: 'The second subgoal is why Algol-style pseudocode is still how algorithms are written down.',
      source: 'Slides 2, slide 27 (blank wording from Sebesta ch. 2; merges three slide blanks)' },
    { id: 'l2-algol-death', lecture: '2', type: 'recall',
      prompt: 'Give four reasons Algol died quickly in the U.S.',
      answer: 'It had no I/O (left out because I/O is machine dependent); its BNF description was hard to understand; IBM owned Fortran, so IBM would not support Algol; the U.S. wanted its own language. (Algol 68 then made a complete redesign.)',
      points: ['no I/O statements (machine dependent)', 'BNF was hard to understand', 'IBM owned Fortran: no support', 'the U.S. wanted its own language'],
      why: 'It died commercially but lived on: most languages today descend from it.',
      source: 'Slides 2, slide 32 (the I/O and BNF items fill slide blanks, wording from Sebesta)' },
    { id: 'l2-cobol-hopper', lecture: '2', type: 'recall',
      prompt: 'Who is COBOL most associated with, and which way did she push programming notation?',
      answer: 'Grace Hopper: towards English, away from mathematical notation.',
      points: ['Grace Hopper', 'towards English', 'away from mathematical notation'],
      why: 'COBOL chose English over mathematical notation on purpose.',
      source: 'Slides 2, slide 34 (split from the old COBOL card)' },
    { id: 'l2-cobol-goals', lecture: '2', type: 'recall',
      prompt: 'What were COBOL’s five design goals?',
      answer: 'Look like simple English; managers should be able to read it; be easy to use, even if that means less powerful; broaden the base of computer programmers; have no preconceptions about what would be hard to implement in the compiler (English over math).',
      points: ['look like simple English', 'managers can read it', 'easy to use, even if less powerful', 'broaden the base of programmers', 'ignore what is hard for the compiler'],
      why: 'Every goal puts the human reader ahead of the compiler writer.',
      source: 'Slides 2, slide 35 (three blanks filled from Sebesta; merges four slide blanks)' },
    { id: 'l2-cobol-records', lecture: '2', type: 'recall',
      prompt: 'What data-structure idea did COBOL pioneer, and what did it lead to?',
      answer: 'Hierarchical data structures (records), the first in a high-level language. They prompted structs in C, and eventually object-oriented programming.',
      points: ['hierarchical data structures (records)', 'prompted structs in C', 'eventually OOP'],
      why: 'This is COBOL’s one big influence on later languages.',
      source: 'Slides 2, slide 36 (merges a slide blank)' },
    { id: 'l2-prolog-origin', lecture: '2', type: 'recall',
      prompt: 'What does Prolog stand for, and roughly when was it created?',
      answer: 'PROgramming LOGic; 1972.',
      points: ['PROgramming LOGic', '1972 (early 1970s)'],
      why: 'It is non-procedural: you state facts and rules instead of steps.',
      source: 'Slides 2, slide 40' },
    { id: 'l2-prolog-how', lecture: '2', type: 'recall',
      prompt: 'How do you write a Prolog program, and how do you get answers out of it?',
      answer: 'State facts and rules (what is true); then pose queries (goals), which the system tries to prove.',
      points: ['state facts and rules', 'pose queries (goals) that the system tries to prove'],
      why: 'Compare the palindrome rule: palindrome(Word) :- … then ?- palindrome(abba).',
      source: 'Slides 2, slide 40 (merges two slide blanks; the “queries” wording is a best guess at her blank)' },
    { id: 'l2-code-fortran', lecture: '2', type: 'mc',
      prompt: 'Which language is this palindrome function written in?',
      code: `function is_palindro(t)
  logical :: is_palindro
  character(len = *), intent(in) :: t
  integer :: i, length
  length = len(t)
  is_palindro = .false.
  do i = 1, length/2
     if (t(i:i) /= t(length-i+1:length-i+1)) return
  end do
  is_palindro = .true.
end function is_palindro`,
      answer: 'Fortran', options: ['Algol', 'COBOL', 'LISP (Scheme)'],
      why: 'Clues: “logical ::”, “intent(in)”, “do … end do”, and .false. / .true. (Fortran 90).',
      source: 'Slides 2, slide 6' },
    { id: 'l2-code-scheme', lecture: '2', type: 'mc',
      prompt: 'Which language is this palindrome function written in?',
      code: `(define (isPalindrome aList)
  (equal? aList (reverse aList)))`,
      answer: 'Scheme', options: ['Prolog', 'Algol', 'Fortran'],
      why: 'Fully parenthesised prefix notation and define: Scheme, a Lisp dialect.',
      source: 'Slides 2, slide 16' },
    { id: 'l2-code-algol', lecture: '2', type: 'mc',
      prompt: 'Which language is this palindrome procedure written in?',
      code: `PROC palindrome = (STRING s)BOOL:(
   FOR i := 0 STEP 1 UNTIL UPB s OVER 2 DO
   BEGIN
     IF s[i] /= s[UPB s - i+1] THEN
     BEGIN
        GO TO return false;
     END;
   END;
   TRUE EXIT;
   return false: FALSE;
);`,
      answer: 'Algol', options: ['Fortran', 'COBOL', 'LISP'],
      why: 'Clues: BEGIN … END blocks, := for assignment, PROC … BOOL.',
      source: 'Slides 2, slide 26' },
    { id: 'l2-code-cobol', lecture: '2', type: 'mc',
      prompt: 'Which language is this palindrome test written in?',
      code: `identification division.
function-id. palindromic-test.
data division.
linkage section.
01 test-text            pic x any length.
01 result               pic x.
procedure division using test-text returning result.
    set palindromic to false
    if test-text equal function reverse(test-text) then
        set palindromic to true
    end-if
    goback.`,
      answer: 'COBOL', options: ['Fortran', 'Algol', 'Prolog'],
      why: 'Clues: divisions (identification, data, procedure), pic clauses, English-like statements.',
      source: 'Slides 2, slide 33' },
    { id: 'l2-code-prolog', lecture: '2', type: 'mc',
      prompt: 'Which language is this palindrome rule written in?',
      code: `palindrome(Word) :- name(Word, List),
                    reverse(List, List).

?- palindrome(abba).
true.`,
      answer: 'Prolog', options: ['LISP (Scheme)', 'COBOL', 'Algol'],
      why: 'Clues: a rule with :-, and a ?- query that answers true/false.',
      source: 'Slides 2, slide 39' },
    { id: 'l2-scheme-trace', lecture: '2', type: 'typed',
      prompt: 'What does the last line return?',
      code: `(define (isPalindrome aList)
  (equal? aList (reverse aList)))

(isPalindrome '(1 0 1 0 1 0 0 1 0 1))`,
      answer: '#f', accept: ['false'],
      why: 'Reversed, the list is (1 0 1 0 0 1 0 1 0 1), which differs from the original at the 5th element.',
      source: 'Slides 2, slide 16 (verified with Guile Scheme)',
      verify: { lang: 'guile', src: `(define (isPalindrome aList) (equal? aList (reverse aList)))
(display (isPalindrome '(1 0 1 0 1 0 0 1 0 1)))` } },

    // ───────────── Lecture 3: C ─────────────
    { id: 'l3-banana-out', lecture: '3', type: 'typed',
      prompt: 'This C code runs without an error. What does it print?',
      code: `int banana = 13;
if (++banana - 7){
   printf("Boogy Boogy");
}
else{
   printf("Have a nice day");
}`,
      answer: 'Boogy Boogy',
      why: '++banana makes banana 14 first, so the condition is 14 - 7 = 7. In C any nonzero int is true.',
      source: 'Pre Test on C, Q1b (verified with gcc)',
      verify: { lang: 'c', src: `#include <stdio.h>
int main(void){ int banana = 13; if (++banana - 7){ printf("Boogy Boogy"); } else{ printf("Have a nice day"); } return 0; }` } },
    { id: 'l3-banana-val', lecture: '3', type: 'typed',
      prompt: 'Same code. What is the value of banana when it finishes?',
      code: `int banana = 13;
if (++banana - 7){
   printf("Boogy Boogy");
}
else{
   printf("Have a nice day");
}`,
      answer: '14',
      why: 'Pre-increment changes banana itself before the subtraction; the subtraction does not store anything.',
      source: 'Pre Test on C, Q1c (verified with gcc)',
      verify: { lang: 'c', src: `#include <stdio.h>
int main(void){ int banana = 13; if (++banana - 7){ } else{ } printf("%d", banana); return 0; }` } },
    { id: 'l3-banana-java', lecture: '3', type: 'recall',
      prompt: 'Even with printf changed to System.out.println, this code would not run in Java. Why?',
      code: `int banana = 13;
if (++banana - 7){
   printf("Boogy Boogy");
}
else{
   printf("Have a nice day");
}`,
      answer: 'Java checks types more strongly than C. The if condition is an int expression, not a boolean, and is not cast to one, so it is a static type error.',
      points: ['Java checks types more strongly', 'the condition is an int, not a boolean', 'static (compile-time) type error'],
      why: 'C treats any nonzero number as true; Java requires a boolean.',
      source: 'Pre Test on C, Q1d' },
    { id: 'l3-banana-diagram', lecture: '3', type: 'recall',
      prompt: 'Draw a memory diagram (variables with their values in RAM) of this code running. Type it as rows of  name | value,  crossing out old values with →.',
      code: `int banana = 13;
if (++banana - 7){
   printf("Boogy Boogy");
}
else{
   printf("Have a nice day");
}`,
      answer: 'banana | 13 → 14\n(no box for 7: the subtraction’s result is never stored)',
      points: ['one box, named banana', 'value 13, crossed out, then 14', 'no box for 7: the subtraction is not stored'],
      why: '++banana stores 14 back into banana before the subtraction; 14 - 7 = 7 is only a temporary value used by the if.',
      source: 'Pre Test on C, Q1a (4 marks; the key leaves the diagram blank, so this follows her C exam’s diagram style)' },

    // ── C & memory: her C exam (32 marks) is memory diagrams, a pointer function, malloc/free ──
    // Diagram cards use her exam's conventions: the stack is drawn newest on top, an
    // unknown address is ?, a pointer's value is an arrow, and old values are crossed out.
    { id: 'l3-exam-q1-diagram', lecture: '3', type: 'recall',
      prompt: 'Draw a memory (stack) diagram of this C program and give the output. Type rows of  name | value,  newest on top; cross out old values with →.',
      code: `#include <stdio.h>

int main() {
    int a = 0;
    int b = 0;

    if (--b) {
        b += 10;
    }

    printf("%d %d", a, b);
    return 0;
}`,
      answer: 'b | 0 → -1 → 9\na | 0\nOutput: 0 9',
      points: ['a below b (a declared first)', 'a: 0', 'b: 0, then -1, then 9 (old values crossed out)', 'output 0 9'],
      why: '--b stores -1 before the test. -1 is nonzero, so it counts as true in C, and b += 10 gives 9. Output gcc-verified.',
      source: 'C Language Exam 1 (2026), Q1 (6 marks: 1 per name, 1 per value, 2 for the output)' },
    { id: 'l3-exam-q2-diagram', lecture: '3', type: 'recall',
      prompt: 'Draw a memory diagram of this C program and give the output. Type rows of  name | value;  write ? for an unknown address and → for an arrow.',
      code: `#include <stdio.h>

int main() {
    int arr[] = {10, 20, 30, 40};
    int *p;

    p = arr + 1;
    printf("%d", *p + 2);
    return 0;
}`,
      answer: 'p   | ??  → (arrow to the 20)\narr | ?   → [ 10 | 20 | 30 | 40 ]\nOutput: 22',
      points: ['arr: an address (?) with an arrow to the four cells', 'the cells hold 10, 20, 30, 40 in order', 'p: an address (??) with an arrow to the 20 (arr + 1 is one int along)', 'output 22'],
      why: 'arr + 1 moves one int, not one byte, so p points at 20; *p + 2 = 22. Her diagram draws arr as a box pointing at the cells (strictly, the array is the cells and arr names the first one’s address). Output gcc-verified.',
      source: 'C Language Exam 1 (2026), Q2 (6 marks)' },
    { id: 'l3-exam-q3-diagram', lecture: '3', type: 'recall',
      prompt: 'Draw a memory diagram of this C program and give the output. Type rows of  name | value,  newest on top; write ? for an unknown address and → for an arrow.',
      code: `#include <stdio.h>

void money(int *p) {
    int q = 100;
    p = &q;
}

int main() {
    int x = 10;
    money(&x);
    printf("%d", x);
    return 0;
}`,
      answer: 'q | 100\np | ?  → x   (crossed out, then → q)\nx | 10\nOutput: 10',
      points: ['x: 10, and it never changes', 'p: an address with an arrow to x', 'p’s arrow is then redrawn to q (the old arrow crossed out)', 'q: 100', 'output 10'],
      why: 'p is a copy of x’s address. p = &q changes where the copy points, not x. Only *p = … would change x. Output gcc-verified.',
      source: 'C Language Exam 1 (2026), Q3 (6 marks)' },
    { id: 'l3-why-money', lecture: '3', type: 'recall',
      prompt: 'money() sets p = &q, yet x is still 10 afterwards. Why? What would money() have to do to change x?',
      code: `void money(int *p) {
    int q = 100;
    p = &q;
}
/* in main: */  int x = 10;  money(&x);  printf("%d", x);`,
      answer: 'C passes arguments by value: p is a local copy of x’s address. p = &q only changes where that copy points. To change x, money must assign through the pointer: *p = 100;',
      points: ['p is a local copy of x’s address (pass by value)', 'p = &q changes only the copy, not x', 'changing x needs an assignment through the pointer: *p = …'],
      why: 'Same trap in every “reassign the pointer inside the function” question.',
      source: 'C Language Exam 1 (2026), Q3 (the explanation is standard C, not in her key)' },
    { id: 'l3-malloc-free', lecture: '3', type: 'recall',
      prompt: 'If you need to grab and release memory dynamically in C, what two commands would you most likely use?',
      answer: 'malloc and free.',
      points: ['malloc (grabs heap memory)', 'free (releases it)'],
      why: 'Memory from malloc lives on the explicit heap until free is called. In Java, new creates heap objects and the garbage collector releases them.',
      source: 'C Language Exam 1 (2026), Q4 (3 marks)' },
    { id: 'l3-reverse-string', lecture: '3', type: 'recall',
      prompt: 'Write void reverseString(char *theString), which reverses a null-terminated string in place. Use pointers only: no array indexing and no imports.',
      answer: `void reverseString(char *theString){
    char temp;
    char *endString;
    endString = theString;
    while (*endString){        // find the null
        endString++;
    }
    endString--;               // back up to the last real character
    while (theString < endString){
        temp = *theString;     // exchange front and back
        *theString = *endString;
        *endString = temp;
        endString--;
        theString++;
    }
}`,
      points: ['handshake line: void reverseString(char *theString)', 'char temp, for the exchange', 'char *endString, initialised to theString', 'loop until *endString is the null, moving endString forward', 'step endString back one so it is on the last character, not the null', 'while theString < endString, exchange the two characters through temp', 'move both pointers: theString++ and endString--'],
      why: 'Her marks: 1 handshake, 3 variables + init, 3 find end, 1 the null, 2 exchange, 1 increment/decrement. This code was tested with gcc on "stressed", "" and "x".',
      source: 'C Language Exam 1 (2026), Q5 (11 marks)' },
    { id: 'l3-length', lecture: '3', type: 'recall',
      prompt: 'Using pointers only (no indexing, no <string.h>), write int length(char *s), which returns the number of characters before the null.',
      answer: `int length(char *s){
    char *end = s;
    while (*end){
        end++;
    }
    return end - s;
}`,
      points: ['signature: int length(char *s)', 'a second pointer that starts at s', 'loop while *end is not the null, moving end forward', 'return end - s (the pointer difference)'],
      why: 'Same “find the end” loop as reverseString. Subtracting two pointers into one array gives the number of elements between them. Tested with gcc: "hello" 5, "" 0.',
      source: 'Practice item in the style of C Exam 1, Q5 (not from her PDFs)' },
    { id: 'l3-count-char', lecture: '3', type: 'recall',
      prompt: 'Using pointers only (no indexing), write int countChar(char *s, char c), which returns how many times c appears in the string s.',
      answer: `int countChar(char *s, char c){
    int count = 0;
    while (*s){
        if (*s == c){
            count++;
        }
        s++;
    }
    return count;
}`,
      points: ['a counter that starts at 0', 'loop while *s is not the null', 'compare *s with c and count a match', 'advance s every pass', 'return the count'],
      why: 's is a copy of the caller’s pointer, so moving it does not move the caller’s. Tested with gcc: "banana" and a → 3.',
      source: 'Practice item in the style of C Exam 1, Q5 (not from her PDFs)' },
    { id: 'l3-ptr-inc', lecture: '3', type: 'typed',
      prompt: 'What does this C code print?',
      code: `int a = 5;
int *p = &a;
*p += 3;
int b = *p * 2;
printf("%d %d", a, b);`,
      answer: '8 16',
      why: 'p points at a, so *p += 3 changes a itself to 8. Then b = 8 * 2 = 16.',
      source: 'Practice item in the style of C Exam 1 (verified with gcc)',
      verify: { lang: 'c', src: `#include <stdio.h>
int main(void) { int a = 5; int *p = &a; *p += 3; int b = *p * 2; printf("%d %d", a, b); return 0; }` } },
    { id: 'l3-diagram-ptrinc', lecture: '3', type: 'recall',
      prompt: 'Draw the memory diagram for this code after the last line. Rows of  name | value,  newest on top; ? for an unknown address, → for an arrow.',
      code: `int a = 5;
int *p = &a;
*p += 3;
int b = *p * 2;`,
      answer: 'b | 16\np | ?  → a\na | 5 → 8',
      points: ['a: 5, crossed out, then 8', 'p: an address with an arrow to a', 'b: 16', 'order bottom to top: a, p, b'],
      why: 'Changing *p changes the box p’s arrow points at (a); p itself never changes.',
      source: 'Practice item in the style of C Exam 1, Q1-3 (values verified with gcc)' },
    { id: 'l3-swap-out', lecture: '3', type: 'typed',
      prompt: 'What does this C program print?',
      code: `void swap(int *x, int *y) {
    int t = *x;
    *x = *y;
    *y = t;
}
/* in main: */
int c = 1;
int d = 2;
swap(&c, &d);
printf("%d %d", c, d);`,
      answer: '2 1',
      why: 'x and y hold the addresses of c and d, so assigning to *x and *y changes c and d themselves.',
      source: 'Practice item in the style of C Exam 1 (verified with gcc)',
      verify: { lang: 'c', src: `#include <stdio.h>
void swap(int *x, int *y) { int t = *x; *x = *y; *y = t; }
int main(void) { int c = 1; int d = 2; swap(&c, &d); printf("%d %d", c, d); return 0; }` } },
    { id: 'l3-diagram-swap', lecture: '3', type: 'recall',
      prompt: 'Draw the stack just before swap returns. Rows of  name | value,  newest on top; ? for an unknown address, → for an arrow.',
      code: `void swap(int *x, int *y) {
    int t = *x;
    *x = *y;
    *y = t;
}
int main() {
    int c = 1;
    int d = 2;
    swap(&c, &d);
    printf("%d %d", c, d);
}`,
      answer: 't | 1\ny | ?  → d\nx | ?  → c\nd | 2 → 1\nc | 1 → 2',
      points: ['c: 1, crossed out, then 2', 'd: 2, crossed out, then 1', 'x: an arrow to c', 'y: an arrow to d', 't: 1', 'swap’s boxes (x, y, t) sit above main’s (c, d)'],
      why: 'Compare money(): here the function assigns through the pointers, so main’s variables change.',
      source: 'Practice item in the style of C Exam 1, Q1-3 (output 2 1 verified with gcc)' },
    { id: 'l3-setto', lecture: '3', type: 'typed',
      prompt: 'What does this C program print?',
      code: `void setTo(int *p) {
    int q = 7;
    p = &q;
}
/* in main: */
int x = 3;
setTo(&x);
printf("%d", x);`,
      answer: '3',
      why: 'p = &q only re-points setTo’s own copy of the address. Nothing is assigned through *p, so x stays 3. Same trap as money() on her exam.',
      source: 'Practice item in the style of C Exam 1, Q3 (verified with gcc)',
      verify: { lang: 'c', src: `#include <stdio.h>
void setTo(int *p) { int q = 7; p = &q; }
int main(void) { int x = 3; setTo(&x); printf("%d", x); return 0; }` } },
    { id: 'l3-addten', lecture: '3', type: 'typed',
      prompt: 'What does this C program print?',
      code: `void addTen(int *p) {
    *p += 10;
}
/* in main: */
int x = 5;
addTen(&x);
printf("%d", x);`,
      answer: '15',
      why: 'This time the function assigns through the pointer (*p), so main’s x changes: 5 + 10 = 15. Contrast setTo / money, which only re-point p.',
      source: 'Practice item in the style of C Exam 1 (verified with gcc)',
      verify: { lang: 'c', src: `#include <stdio.h>
void addTen(int *p) { *p += 10; }
int main(void) { int x = 5; addTen(&x); printf("%d", x); return 0; }` } },
    { id: 'l3-arr-ptr', lecture: '3', type: 'typed',
      prompt: 'What does this C code print?',
      code: `int arr[] = {4, 8, 15, 16};
int *q = arr + 2;
printf("%d %d", *q, *(q - 1) + 1);`,
      answer: '15 9',
      why: 'arr + 2 points two ints along, at 15. q - 1 points at 8, and 8 + 1 = 9.',
      source: 'Practice item in the style of C Exam 1, Q2 (verified with gcc)',
      verify: { lang: 'c', src: `#include <stdio.h>
int main(void) { int arr[] = {4, 8, 15, 16}; int *q = arr + 2; printf("%d %d", *q, *(q - 1) + 1); return 0; }` } },
    { id: 'l3-arr-mod', lecture: '3', type: 'typed',
      prompt: 'What does this C code print?',
      code: `int arr[] = {1, 2, 3};
int *p = arr;
*(p + 1) = 9;
p++;
printf("%d %d %d", arr[1], *p, *(p + 1));`,
      answer: '9 9 3',
      why: '*(p + 1) = 9 writes into arr[1]. p++ then moves p to arr[1], so *p is 9 and *(p + 1) is arr[2], 3.',
      source: 'Practice item in the style of C Exam 1, Q2 (verified with gcc)',
      verify: { lang: 'c', src: `#include <stdio.h>
int main(void) { int arr[] = {1, 2, 3}; int *p = arr; *(p + 1) = 9; p++; printf("%d %d %d", arr[1], *p, *(p + 1)); return 0; }` } },
    { id: 'l3-alias', lecture: '3', type: 'typed',
      prompt: 'What does this C code print?',
      code: `int x = 1;
int *p = &x;
int *q = p;
*q = 7;
printf("%d %d", x, *p);`,
      answer: '7 7',
      why: 'q = p copies the address, so x, *p and *q are three names for one memory cell (aliasing). Writing through q changes what the other two see.',
      source: 'Practice item in the style of C Exam 1 (verified with gcc)',
      verify: { lang: 'c', src: `#include <stdio.h>
int main(void) { int x = 1; int *p = &x; int *q = p; *q = 7; printf("%d %d", x, *p); return 0; }` } },
    { id: 'l3-predec', lecture: '3', type: 'typed',
      prompt: 'What does this C code print?',
      code: `int n = 1;
if (--n) {
    n += 5;
} else {
    n -= 5;
}
printf("%d", n);`,
      answer: '-5',
      why: '--n stores 0 first. 0 is false in C, so the else runs: 0 - 5 = -5. (On her exam, --b gave -1, which is true.)',
      source: 'Practice item in the style of C Exam 1, Q1 (verified with gcc)',
      verify: { lang: 'c', src: `#include <stdio.h>
int main(void) { int n = 1; if (--n) { n += 5; } else { n -= 5; } printf("%d", n); return 0; }` } },
    { id: 'l3-walk', lecture: '3', type: 'typed',
      prompt: 'What does this C code print?',
      code: `char s[] = "cat";
char *e = s;
while (*e) {
    e++;
}
printf("%d", (int)(e - s));`,
      answer: '3',
      why: 'e stops on the null after “t”, three chars along from s. The same loop finds the end in reverseString.',
      source: 'Practice item in the style of C Exam 1, Q5 (verified with gcc)',
      verify: { lang: 'c', src: `#include <stdio.h>
int main(void) { char s[] = "cat"; char *e = s; while (*e) { e++; } printf("%d", (int)(e - s)); return 0; }` } },
    { id: 'l3-malloc-trace', lecture: '3', type: 'typed',
      prompt: 'What does this C code print?',
      code: `int *p = malloc(sizeof(int));
*p = 4;
int *q = p;
*q += 1;
printf("%d", *p);
free(p);`,
      answer: '5',
      why: 'p and q both point at the one int on the heap, so q’s change is seen through p. free(p) releases it once; after that neither pointer may be used.',
      source: 'Practice item in the style of C Exam 1, Q4 (verified with gcc)',
      verify: { lang: 'c', src: `#include <stdio.h>
#include <stdlib.h>
int main(void) { int *p = malloc(sizeof(int)); *p = 4; int *q = p; *q += 1; printf("%d", *p); free(p); return 0; }` } },

    // ───────────── Lecture 4: translation ─────────────
    { id: 'l4-compiler-steps-list', lecture: '4', type: 'recall',
      prompt: 'List the three main steps of a compiler, in order.',
      answer: 'Lexical analysis; syntax analysis; low-level (machine) code generation.',
      points: ['lexical analysis', 'syntax analysis', 'low-level (machine) code generation', 'in that order'],
      why: 'Characters become tokens (lexical), tokens become a parse tree (syntax), the tree becomes machine code.',
      source: 'Post Test Translation, Q1 (replaces an order card that handed over the three steps)' },
    { id: 'l4-hybrid', lecture: '4', type: 'recall',
      prompt: 'Besides compiling and interpreting, what is a hybrid implementation system? Give an example.',
      answer: 'The source is compiled to an intermediate language (such as bytecode), which is then interpreted (or JIT-compiled) on each machine. Example: Java (source → bytecode → JVM).',
      points: ['compile to an intermediate language (e.g. bytecode)', 'then interpret that intermediate code', 'example: Java and its JVM'],
      why: 'It trades some speed for portability: the bytecode runs anywhere a JVM exists.',
      source: 'Slides 4, slide 2 names “Hybrid”; the definition is Sebesta ch. 1 (her diagram slides have no text)' },
    { id: 'l4-lexeme-token', lecture: '4', type: 'recall',
      prompt: 'What is the difference between a lexeme and a token?',
      answer: 'A lexeme is a lowest-level syntactic unit of a language (e.g. “if”). A token is a category of lexemes (e.g. “if” belongs to the token for the reserved word that starts a conditional).',
      points: ['lexeme: lowest-level syntactic unit', 'token: a category of lexemes', 'an example lexeme with its token (e.g. count → identifier)'],
      why: 'Many lexemes (count, i, total) share one token (identifier).',
      source: 'Post Test Translation, Q2' },
    { id: 'l4-tokenize-while', lecture: '4', type: 'recall',
      prompt: 'Split this Java statement into lexemes and give the token of each.',
      code: `while (count >= 10) sum = sum + count;`,
      answer: 'while: reserved word · ( : open paren · count: identifier · >= : relational operator · 10: integer literal · ) : close paren · sum: identifier · = : assignment operator · sum: identifier · + : plus (arithmetic) operator · count: identifier · ; : semicolon',
      points: ['while → reserved word', '( and ) → open / close paren', 'count and sum → identifier, every time', '>= → relational operator (one lexeme, not two)', '10 → integer literal', '= → assignment operator', '+ → plus (arithmetic) operator', '; → semicolon'],
      why: 'Token names vary between compilers (her slide writes for_resWord, int_literal …); what matters is the category.',
      source: 'Slides 4, slides 7-8 method, applied to a new statement (Sebesta ch. 3 example)' },
    { id: 'l4-how-know', lecture: '4', type: 'recall',
      prompt: 'In  x = y + 2 * z;  how does the compiler know that = and + are operations, x and z are variables, and ; is just syntax?',
      answer: 'The language has rules for what makes an operator, a variable and plain syntax. The lexical analyzer reads left to right, ignoring whitespace. On reading x it keeps adding characters to an identifier until it meets one that is not a letter, digit or underscore. Then it reads =, which the rules say is the assignment operator (with its own machine code), and so on.',
      points: ['the language’s rules define operators, variables and syntax', 'it reads left to right', 'whitespace is ignored', 'an identifier continues until a character that is not a letter, digit or underscore', 'each lexeme is then classified (= is the assignment operator, …)'],
      why: 'This is lexical analysis, the first compiler step.',
      source: 'Pre Test Translation, Q2e' },
    { id: 'l4-symtab', lecture: '4', type: 'recall',
      prompt: 'What is a symbol table, and what is its role in a compiler?',
      answer: 'A list of all the identifiers in a program, along with their value or memory location (and other properties).',
      points: ['all identifiers in the program', 'their value or memory location (and other properties)'],
      why: 'Later phases look names up here instead of re-reading the source.',
      source: 'Post Test Translation, Q3' },
    { id: 'l4-gpa-bnf', lecture: '4', type: 'recall',
      prompt: 'GPAs run from 0.0 to 4.0 with exactly one digit after the decimal point. Write a concise BNF grammar for GPAs.',
      answer: `<GPA> → 4.0 | <left digit> . <right digit>
<left digit> → 0 | 1 | 2 | 3
<right digit> → 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9`,
      points: ['4.0 handled as its own case', 'left digit limited to 0-3', 'right digit 0-9'],
      why: 'Limiting the left digit to 0-3 is what keeps 4.1 through 4.9 out.',
      source: 'Post Test Translation, Q4a' },
    { id: 'l4-gpa-derive-write', lecture: '4', type: 'recall',
      prompt: 'Using this GPA grammar, write the leftmost derivation of 3.9.',
      code: `<GPA> → 4.0 | <left digit> . <right digit>
<left digit> → 0 | 1 | 2 | 3
<right digit> → 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9`,
      answer: '<GPA> ⇒ <left digit> . <right digit> ⇒ 3 . <right digit> ⇒ 3.9',
      points: ['starts at the start symbol <GPA>', 'uses <GPA> → <left digit> . <right digit>', 'replaces <left digit> (the leftmost) with 3 first', 'then <right digit> with 9'],
      why: 'Leftmost: always replace the leftmost nonterminal first. One rule per ⇒.',
      source: 'Post Test Translation, Q4b (the key leaves the derivation blank; replaces an order card that could be sorted by length)' },
    { id: 'l4-gpa-41', lecture: '4', type: 'recall',
      prompt: 'Using this GPA grammar, derive 4.1.',
      code: `<GPA> → 4.0 | <left digit> . <right digit>
<left digit> → 0 | 1 | 2 | 3
<right digit> → 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9`,
      answer: 'It cannot be derived. The only rule that produces a leading 4 is <GPA> → 4.0, and <left digit> only goes up to 3. So 4.1 is not a sentence of the language, which is correct because 4.1 is not a valid GPA.',
      points: ['cannot be derived', 'only 4.0 starts with 4', '<left digit> stops at 3'],
      why: 'A derivation question can have “impossible” as its answer; say why.',
      source: 'Post Test Translation, Q4c (the key leaves this blank; the reasoning follows from the grammar)' },
    { id: 'l4-same', lecture: '4', type: 'recall',
      prompt: 'What is the similarity between a compiler and an interpreter?',
      answer: 'Both generate lower-level code (e.g. machine code) from higher-level code.',
      points: ['both translate higher-level code into lower-level code'],
      why: '',
      source: 'Pre Test Translation, Q1a' },
    { id: 'l4-diff', lecture: '4', type: 'recall',
      prompt: 'What is the difference between a compiler and an interpreter?',
      answer: 'A compiler processes the entire file and generates the lower-level code for the whole file at once. An interpreter generates machine code one line at a time: it translates a line, executes it, then moves to the next line.',
      points: ['compiler: whole file at once', 'interpreter: one line at a time, translate then execute'],
      why: '',
      source: 'Pre Test Translation, Q1b' },
    { id: 'l4-adv-compiled', lecture: '4', type: 'recall',
      prompt: 'What is the advantage of a language that is compiled?',
      answer: 'Once the program is compiled it runs faster, because it does not need to be translated again each time it runs.',
      points: ['faster run time', 'no re-translation on each run'],
      why: 'Compare with the advantage of an interpreted language: they mirror each other.',
      source: 'Pre Test Translation, Q1c' },
    { id: 'l4-adv-interp', lecture: '4', type: 'recall',
      prompt: 'What is the advantage of a language that is interpreted?',
      answer: 'Getting the program going is faster, and mistakes in some parts of the code do not stop the program from starting to run.',
      points: ['starts running sooner', 'errors elsewhere in the code do not block the start'],
      why: '',
      source: 'Pre Test Translation, Q1d' },
    { id: 'l4-xyz-instr', lecture: '4', type: 'recall',
      prompt: 'All variables are integers. What machine-language instructions must be generated for  x = y + 2 * z; ?',
      answer: 'Depends on the architecture, but something like: load y into register A and z into register B (from memory); shift register B left by 1 bit; add A and B, result into A; store A into memory at x.',
      points: ['load y and z from memory into registers', 'shift z’s register left 1 bit (× 2)', 'add the two registers', 'store the result into memory at x'],
      why: 'Multiplying by 2 is a 1-bit left shift, so no 2 is ever loaded.',
      source: 'Pre Test Translation, Q2a (replaces an order card)' },
    { id: 'l4-where-2', lecture: '4', type: 'recall',
      prompt: 'In  x = y + 2 * z;  where does the 2 come from during execution?',
      answer: 'Likely nowhere: the multiplication by 2 is replaced by a 1-bit left shift. Otherwise the compiler builds the 2 directly into the instruction.',
      points: ['replaced by a shift, so it is not stored anywhere', 'otherwise part of the instruction itself'],
      why: 'Constants usually live inside instructions, not in variables.',
      source: 'Pre Test Translation, Q2d' },
    { id: 'l4-where-x', lecture: '4', type: 'recall',
      prompt: 'In  x = y + 2 * z;  where does the x come from during execution?',
      answer: 'From memory (RAM or cache).',
      points: ['memory (RAM or cache)'],
      why: 'Variables live in memory; they are loaded into registers to be worked on, then stored back.',
      source: 'Pre Test Translation, Q2c' },
    { id: 'l4-how-instr', lecture: '4', type: 'recall',
      prompt: 'How are the machine-language instructions for a statement like  x = y + 2 * z;  determined?',
      answer: 'By the compiler or the interpreter: a program that runs to translate high-level code into lower-level code.',
      points: ['by the compiler or interpreter', 'a program that translates high-level code into lower-level code'],
      why: 'The same statement can become different instructions on different architectures.',
      source: 'Pre Test Translation, Q2b (split from the old two-part card)' },
    { id: 'l4-token-i', lecture: '4', type: 'typed',
      prompt: 'In the Java sentence below, what token is the lexeme  i ?',
      code: `for (int i = 0; i < 10; i++){`,
      answer: 'identifier', accept: ['id', 'ident', 'identifier name', 'variable name', 'variable', 'name'],
      why: 'Every i here is an identifier. (The slide’s table labels the second i “int_literal”, which is a slip.)',
      source: 'Slides 4, slides 7-8' },
    { id: 'l4-token-10', lecture: '4', type: 'typed',
      prompt: 'In the same Java sentence, what token is the lexeme  10 ?',
      code: `for (int i = 0; i < 10; i++){`,
      answer: 'int_literal', accept: ['int literal', 'integer literal', 'integer_literal', 'literal', 'number', 'integer', 'numeric literal', 'integer constant', 'int constant', 'constant'],
      why: 'A number written directly in the code is a literal; its token says which kind. Token names vary between compilers; her slide says int_literal.',
      source: 'Slides 4, slide 8' },
    { id: 'l4-sample-derive-write', lecture: '4', type: 'recall',
      prompt: 'Using this grammar, write the leftmost derivation of  c = c + 2 * a.',
      code: `<program> → <stmts>
<stmts> → <stmt> | <stmt> ; <stmts>
<stmt> → <var> = <expr>
<var> → a | b | c | d
<num> → 1 | 2 | 3
<expr> → <term> + <expr> | <term> * <expr> | <term>
<term> → <var> | <num>`,
      answer: `<program> ⇒ <stmts> ⇒ <stmt> ⇒ <var> = <expr> ⇒ c = <expr>
⇒ c = <term> + <expr> ⇒ c = <var> + <expr> ⇒ c = c + <expr>
⇒ c = c + <term> * <expr> ⇒ c = c + <num> * <expr> ⇒ c = c + 2 * <expr>
⇒ c = c + 2 * <term> ⇒ c = c + 2 * <var> ⇒ c = c + 2 * a`,
      points: ['<program> ⇒ <stmts> ⇒ <stmt> ⇒ <var> = <expr> (the one-statement rule)', 'always expands the leftmost nonterminal, one rule per ⇒', '<expr> ⇒ <term> + <expr> for the +', 'the inner <expr> ⇒ <term> * <expr> for the *', 'the leaves come from <var> (c, a) and <num> (2)'],
      why: 'Leftmost: the sentence fills in left to right.',
      source: 'Slides 4, slides 12-13 (derivation worked from the slide’s grammar; replaces an order card that could be sorted by length)' },
    { id: 'l4-derive-two', lecture: '4', type: 'recall',
      prompt: 'Using this grammar, write the leftmost derivation of  a = b ; c = 1.',
      code: `<program> → <stmts>
<stmts> → <stmt> | <stmt> ; <stmts>
<stmt> → <var> = <expr>
<var> → a | b | c | d
<num> → 1 | 2 | 3
<expr> → <term> + <expr> | <term> * <expr> | <term>
<term> → <var> | <num>`,
      answer: `<program> ⇒ <stmts> ⇒ <stmt> ; <stmts> ⇒ <var> = <expr> ; <stmts>
⇒ a = <expr> ; <stmts> ⇒ a = <term> ; <stmts> ⇒ a = <var> ; <stmts>
⇒ a = b ; <stmts> ⇒ a = b ; <stmt> ⇒ a = b ; <var> = <expr>
⇒ a = b ; c = <expr> ⇒ a = b ; c = <term> ⇒ a = b ; c = <num> ⇒ a = b ; c = 1`,
      points: ['<stmts> ⇒ <stmt> ; <stmts> for two statements', 'finishes the whole first statement before touching <stmts> (leftmost)', 'b via <expr> ⇒ <term> ⇒ <var> ⇒ b', 'the last <stmts> ⇒ <stmt> (one statement left)', '1 via <expr> ⇒ <term> ⇒ <num> ⇒ 1'],
      why: 'The recursion in <stmts> is what allows any number of statements.',
      source: 'Practice item on the Slides 4, slide 12 grammar (worked from the grammar)' },
    { id: 'l4-cannot-a4', lecture: '4', type: 'recall',
      prompt: 'Using this grammar, can  a = 4  be derived? Why or why not?',
      code: `<program> → <stmts>
<stmts> → <stmt> | <stmt> ; <stmts>
<stmt> → <var> = <expr>
<var> → a | b | c | d
<num> → 1 | 2 | 3
<expr> → <term> + <expr> | <term> * <expr> | <term>
<term> → <var> | <num>`,
      answer: 'No. The 4 would have to come from <term>, i.e. from <var> or <num>. <var> only gives a, b, c, d and <num> only gives 1, 2, 3, so the terminal 4 appears in no rule.',
      points: ['No', 'the 4 must come from <var> or <num>', '<num> only produces 1, 2, 3 (and <var> only letters)'],
      why: 'To show something cannot be derived, show that no rule can produce the missing piece.',
      source: 'Practice item on the Slides 4, slide 12 grammar (like Post Test Translation, Q4c)' },
    { id: 'l4-parse-tree', lecture: '4', type: 'recall',
      prompt: 'Draw the parse tree of  c = c + 2 * a  as an indented outline.',
      code: `<program> → <stmts>
<stmts> → <stmt> | <stmt> ; <stmts>
<stmt> → <var> = <expr>
<var> → a | b | c | d
<num> → 1 | 2 | 3
<expr> → <term> + <expr> | <term> * <expr> | <term>
<term> → <var> | <num>`,
      answer: `<program>
  <stmts>
    <stmt>
      <var> → c
      =
      <expr>
        <term> → <var> → c
        +
        <expr>
          <term> → <num> → 2
          *
          <expr>
            <term> → <var> → a`,
      points: ['root <program> → <stmts> → <stmt>', '<stmt> has three children: <var>, =, <expr>', 'the top <expr> has children <term> + <expr>', 'the inner <expr> has children <term> * <expr>', 'the leaves, read left to right, spell c = c + 2 * a'],
      why: '* sits deeper than +, so it is evaluated first, but only because it comes later in the sentence (compare a * b + c).',
      source: 'Slides 4, slide 13 (the slide draws the tree; outline form is ours)' },
    { id: 'l4-sample-prec', lecture: '4', type: 'typed',
      prompt: 'Using that same grammar, how is  a * b + c  grouped? Answer with brackets.',
      code: `<expr> → <term> + <expr> | <term> * <expr> | <term>
<term> → <var> | <num>`,
      answer: 'a * (b + c)', accept: ['a*(b+c)', 'a * (b+c)', 'a*(b + c)'],
      why: 'The only derivation is <expr> ⇒ <term> * <expr>, so everything after * (b + c) is one <expr> lower in the tree, and is done first. This grammar gives + and * equal precedence; a real grammar puts * at a lower level.',
      source: 'Practice item on the Slides 4, slide 12 grammar (worked from the grammar)' },
    { id: 'l4-ambiguous', lecture: '4', type: 'recall',
      prompt: 'What makes a grammar ambiguous, and why is that a problem for a compiler?',
      answer: 'A sentence (program) has two or more distinct parse trees. Compilers determine meaning, such as operator precedence, from the parse tree, so two trees mean two possible meanings.',
      points: ['two or more distinct parse trees for one sentence', 'meaning comes from the parse tree', 'so the meaning is not determined'],
      why: '',
      source: 'Slides 4, slide 14' },
    { id: 'l4-ambig-values', lecture: '4', type: 'typed',
      prompt: 'Under this ambiguous grammar,  3 – 10 / 5  has two parse trees. Using real division, what two values can it mean?',
      code: `<expr> → <expr> <op> <expr> | <const>
<const> → 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
<op> → / | -`,
      answer: '1 and -1.4', accept: ['-1.4 and 1', '1, -1.4', '-1.4, 1', '1 or -1.4', '-1.4 or 1', '1 -1.4', '-1.4 1'],
      why: '3 – (10 / 5) = 1; (3 – 10) / 5 = -1.4. Nothing in the grammar says which operator is lower in the tree.',
      source: 'Slides 4, slide 15 (values verified with Python)',
      verify: { lang: 'python', src: `print(f"{3 - 10 / 5:g} and {(3 - 10) / 5:g}")` } },
    { id: 'l4-precedence-level', lecture: '4', type: 'recall',
      prompt: 'In an unambiguous expression grammar, where must the operator with higher precedence appear?',
      answer: 'At a lower level of the grammar (deeper in the parse tree), so it is applied first.',
      points: ['lower level / deeper in the tree', 'so it is evaluated first'],
      why: 'In  <expr> → <expr> - <term> | <term>;  <term> → <term> / <const> | <const>,  / sits below -, so 3 – 10 / 5 is 1.',
      source: 'Slides 4, slide 16' },
    { id: 'l4-assoc', lecture: '4', type: 'typed',
      prompt: 'Under this unambiguous grammar, what is the value of  60 / 12 / 4 ?',
      code: `<expr> → <expr> / <const> | <const>`,
      answer: '1.25', accept: ['5/4'],
      why: 'The recursion is on the left, so the grammar groups left: (60 / 12) / 4 = 5 / 4 = 1.25. It doesn’t allow as much recursion on the right side.',
      source: 'Slides 4, slides 17-18 (value verified with Python)',
      verify: { lang: 'python', src: `print(f"{(60 / 12) / 4:g}")` } },
    { id: 'l4-assoc-ambig', lecture: '4', type: 'typed',
      prompt: 'Under the ambiguous  <expr> → <expr> / <expr> | <const>,  what two values can  60 / 12 / 4  have?',
      answer: '1.25 and 20', accept: ['20 and 1.25', '1.25, 20', '20, 1.25', '1.25 or 20', '20 or 1.25'],
      why: '(60 / 12) / 4 = 1.25 and 60 / (12 / 4) = 20. Associativity is a second thing a grammar must pin down, after precedence.',
      source: 'Slides 4, slide 17 (values verified with Python)',
      verify: { lang: 'python', src: `print(f"{(60 / 12) / 4:g} and {60 / (12 / 4):g}")` } },
    { id: 'l4-ebnf', lecture: '4', type: 'recall',
      prompt: 'In the EBNF used for the C grammar, what do  { }+,  { }*  and  { }?  mean?',
      answer: '{ }+ one or more; { }* zero or more; { }? zero or one (optional).',
      points: ['+ one or more', '* zero or more', '? optional (zero or one)'],
      why: 'Same meanings as in regular expressions.',
      source: 'Slides 4, slide 19' },
    { id: 'l4-production', lecture: '4', type: 'recall',
      prompt: 'What is a BNF rule called, and what may appear on each side of it?',
      answer: 'A production, written LHS → RHS. The LHS is exactly one nonterminal (in < > brackets). The RHS is a string of terminals and/or nonterminals; | separates alternatives.',
      points: ['a production: LHS → RHS', 'LHS: one nonterminal, in < >', 'RHS: a string of terminals and/or nonterminals', '| separates alternative RHSs'],
      why: 'A grammar is just a collection of these rules plus a start symbol.',
      source: 'Slides 4, slide 10 (blank wording from Sebesta ch. 3; merges three slide blanks)' },
    { id: 'l4-left-assoc', lecture: '4', type: 'recall',
      prompt: 'Rewrite  <expr> → <expr> / <expr> | <const>  so that / is left-associative. Why does your version work?',
      answer: '<expr> → <expr> / <const> | <const>. The recursion is only on the left, so in 60 / 12 / 4 the leftmost / ends up deepest in the parse tree and is evaluated first: (60 / 12) / 4.',
      points: ['<expr> → <expr> / <const> | <const>', 'recursion only on the left (the right operand can no longer be an <expr>)', 'the leftmost / ends up deepest in the tree, so it is done first'],
      why: 'Her slide’s phrase: “don’t allow as much recursion” on the right.',
      source: 'Slides 4, slide 18 (replaces the slide-word blank)' },
    { id: 'l4-show-ambig', lecture: '4', type: 'recall',
      prompt: 'Show that this grammar is ambiguous, using the sentence  a + a + a.',
      code: `<S> → <S> + <S> | a`,
      answer: `Two distinct parse trees for one sentence:
Tree 1, (a + a) + a:  <S> → <S> + <S>, and the LEFT <S> → <S> + <S>
Tree 2, a + (a + a):  <S> → <S> + <S>, and the RIGHT <S> → <S> + <S>
(Equivalently, two different leftmost derivations.) Two trees ⇒ ambiguous.`,
      points: ['one tree groups (a + a) + a: the left <S> expands again', 'one tree groups a + (a + a): the right <S> expands again', 'two distinct parse trees for one sentence = ambiguous'],
      why: 'Showing two derivations is not enough unless they are both leftmost (or both rightmost): every sentence has a leftmost and a rightmost derivation.',
      source: 'Practice item applying Slides 4, slides 14-17 (Sebesta ch. 3 method)' },
    { id: 'l4-rewrite-left', lecture: '4', type: 'recall',
      prompt: 'Rewrite this ambiguous grammar so it is unambiguous and + is left-associative.',
      code: `<S> → <S> + <S> | a`,
      answer: '<S> → <S> + a | a',
      points: ['<S> → <S> + a | a', 'recursion only on the left side of +'],
      why: 'Each + now has a plain a on its right, so a + a + a can only group as (a + a) + a.',
      source: 'Practice item applying Slides 4, slides 17-18' },
    { id: 'l4-write-prec', lecture: '4', type: 'recall',
      prompt: 'Write an unambiguous grammar for expressions over the variables a and b with + and *, where * binds tighter than + and both are left-associative.',
      answer: `<expr> → <expr> + <term> | <term>
<term> → <term> * <factor> | <factor>
<factor> → a | b`,
      points: ['+ at the top level: <expr> → <expr> + <term> | <term>', '* one level lower: <term> → <term> * <factor> | <factor>', 'operands at the bottom: <factor> → a | b', 'left recursion on both levels (left-associative)'],
      why: 'Higher precedence = lower in the grammar = deeper in the tree = done first. Same shape as her - and / grammar on slide 16.',
      source: 'Practice item applying Slides 4, slide 16 (standard expression grammar, Sebesta ch. 3)' },
    { id: 'l4-write-time24', lecture: '4', type: 'recall',
      prompt: 'Write a concise BNF grammar for 24-hour clock times from 00:00 to 23:59 (always two digits each side of the colon).',
      answer: `<time> → <hour> : <min>
<hour> → <d01> <digit> | 2 <d03>
<d01> → 0 | 1
<d03> → 0 | 1 | 2 | 3
<min> → <d05> <digit>
<d05> → 0 | 1 | 2 | 3 | 4 | 5
<digit> → 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9`,
      points: ['<time> → <hour> : <min>', 'hours 00-19: first digit 0 or 1, any second digit', 'hours 20-23 as their own case: 2 then 0-3', 'minutes: first digit 0-5, second digit 0-9'],
      why: 'Like 4.0 in the GPA grammar, the edge (20-23) needs its own alternative so 24-29 stay out.',
      source: 'Practice item in the style of Post Test Translation, Q4a (not from her PDFs)' },
    { id: 'l4-write-binary', lecture: '4', type: 'recall',
      prompt: 'Write a BNF grammar for binary numbers with no leading zeros (0 itself is allowed; 0101 is not).',
      answer: `<bin> → 0 | 1 | 1 <rest>
<rest> → <bit> | <bit> <rest>
<bit> → 0 | 1`,
      points: ['0 allowed on its own', 'every other number starts with 1', 'after the 1, any number of 0s and 1s (recursion)'],
      why: 'Forcing the first symbol to be 1 is what keeps leading zeros out.',
      source: 'Practice item in the style of Post Test Translation, Q4a (not from her PDFs)' },

    // ───────────── Lecture 5.1: names, binding, type, address ─────────────
    { id: 'l51-attrs', lecture: '5.1', type: 'recall',
      prompt: 'What six attributes are associated with a name in a program?',
      answer: 'Name, address, value, type, scope, lifetime.',
      points: ['name', 'address', 'value', 'type', 'scope', 'lifetime'],
      why: 'Lectures 5.1 and 5.2 walk through these one at a time.',
      source: 'Slides 5.1, slide 3' },
    { id: 'l51-name-issues', lecture: '5.1', type: 'recall',
      prompt: 'Name the four design issues for names.',
      answer: 'Which characters are allowed; case sensitivity; reserved words or keywords; length.',
      points: ['allowed characters', 'case sensitive?', 'reserved words or keywords?', 'length'],
      why: '',
      source: 'Slides 5.1, slide 5' },
    { id: 'l51-case', lecture: '5.1', type: 'mc',
      prompt: 'Which of these languages does NOT have case-sensitive names?',
      answer: 'Scheme', options: ['Java', 'C', 'Python'],
      why: 'In Scheme (per the slides), twoDArray and twoDarray are the same name. That is true of older (R5RS-era) Scheme; modern Scheme (R6RS, R7RS, Racket) is case-sensitive.',
      source: 'Slides 5.1, slide 7; Names post-test Q1' },
    { id: 'l51-anychar', lecture: '5.1', type: 'mc',
      prompt: 'Which language allows almost any keyboard character in a name?',
      answer: 'Scheme', options: ['Java', 'Python', 'C'],
      why: 'Java and Python allow only letters, digits and underscore.',
      source: 'Slides 5.1, slide 6' },
    { id: 'l51-meaning', lecture: '5.1', type: 'mc',
      prompt: 'In which of these languages do certain characters of a name carry meaning?',
      answer: 'Perl', options: ['Java', 'Scheme', 'Python'],
      why: 'Perl’s $, @ and % prefixes mark the kind of variable; Fortran’s first letter marked its type.',
      source: 'Slides 5.1, slide 6' },
    { id: 'l51-keywords', lecture: '5.1', type: 'mc',
      prompt: 'Which language uses only keywords, with no reserved words?',
      answer: 'Fortran', options: ['Java', 'Python', 'JavaScript'],
      why: 'A keyword is special only in context, so in Fortran a variable can even be named like one.',
      source: 'Slides 5.1, slide 8' },
    { id: 'l51-maxlen', lecture: '5.1', type: 'mc',
      prompt: 'Which language sets a maximum name length?',
      answer: 'C', options: ['Java', 'Python'],
      why: 'Early Fortran allowed only short names; Java and Python allow any length. Strictly, the C standard sets a minimum number of significant characters (31 in C89, 63 in C99) rather than a hard maximum; the slides call it a max length.',
      source: 'Slides 5.1, slide 9' },
    { id: 'l51-bindtimes', lecture: '5.1', type: 'order',
      prompt: 'Put the possible binding times in order, earliest first.',
      answer: ['Language design', 'Language implementation', 'Compile', 'Load', 'Run'],
      why: 'Example: * is bound to “multiply” at language design; a C static variable’s address at load time; a local’s value at run time.',
      source: 'Slides 5.1, slide 13 (examples are Sebesta’s, not the handout’s)' },
    { id: 'l51-entities', lecture: '5.1', type: 'recall',
      prompt: 'A name can stand for three kinds of program entity. Name each, with an example.',
      answer: 'A variable (stuName = “Jackie”); a label, i.e. a statement location (evenNum:); a subprogram and its calls (sumToN(12)).',
      points: ['a variable (e.g. stuName = “Jackie”)', 'a label / statement location (e.g. evenNum:)', 'a subprogram (e.g. sumToN(12))'],
      why: 'In every case the name is an abstraction of a memory location.',
      source: 'Slides 5.1, slide 2 (blank wording from Sebesta ch. 5; merges three slide blanks)' },
    { id: 'l51-binding-def', lecture: '5.1', type: 'recall',
      prompt: 'Define binding and binding time.',
      answer: 'A binding is an association between an entity and an attribute (e.g. a variable and its type, or a symbol and its operation). Binding time is the time at which that association is made.',
      points: ['binding: an association between an entity and an attribute', 'binding time: when that association is made'],
      why: 'Binding times run from language design to run time.',
      source: 'Slides 5.1, slide 12 (blank wording from Sebesta ch. 5; merges two slide blanks)' },
    { id: 'l51-bind-classify', lecture: '5.1', type: 'recall',
      prompt: 'In the C statement  count = count + 5;  give the binding time of: (1) the type of count, (2) the set of values count can hold, (3) the meaning of +, (4) the internal representation of 5, (5) the value of count.',
      answer: '(1) compile time; (2) language implementation time; (3) compile time (once the operand types are known); (4) language implementation time; (5) run time.',
      points: ['type of count: compile', 'possible values of count: language implementation', 'meaning of +: compile', 'representation of 5: language implementation', 'value of count: run'],
      why: 'int’s range and how a literal is stored are chosen by whoever implements C; + can mean int or float addition, so the compiler picks once it knows the types.',
      source: 'Sebesta ch. 5.4 example, mapped onto her binding-time list (Slides 5.1, slide 13)' },
    { id: 'l51-bind-classify2', lecture: '5.1', type: 'recall',
      prompt: 'Give the binding time of each in C: (1) the address of a global variable, (2) the address of a non-static local variable, (3) the number of bits in an int, (4) the fact that while starts a loop.',
      answer: '(1) load time; (2) run time (each call); (3) language implementation time; (4) language design time.',
      points: ['global’s address: load', 'non-static local’s address: run', 'bits in an int: language implementation', 'while starts a loop: language design'],
      why: 'Static/global storage is fixed when the program is loaded; a local gets fresh stack storage on every call.',
      source: 'Practice item using her binding-time list (Slides 5.1, slide 13) and the slide-13 example answers' },
    { id: 'l51-type-name', lecture: '5.1', type: 'mc',
      prompt: '“The type should be part of the name.” Which language does this?',
      answer: 'Perl', options: ['Python', 'C#', 'Java'],
      why: 'Python: implicit (just use the name); C#: var, type inferred; Java: declared explicitly.',
      source: 'Slides 5.1, slide 16' },
    { id: 'l51-type-infer', lecture: '5.1', type: 'mc',
      prompt: 'You say a name is a variable with  var  and the compiler infers its type. Which language’s example is this?',
      answer: 'C#', options: ['Python', 'Fortran', 'Pascal'],
      why: 'Inference still binds the type statically; Python binds it dynamically.',
      source: 'Slides 5.1, slide 16' },
    { id: 'l51-type-dynamic', lecture: '5.1', type: 'mc',
      prompt: 'In which language are types bound dynamically?',
      answer: 'JavaScript', options: ['C', 'Java', 'TypeScript'],
      why: 'Static: C, Java. Dynamic: Python, JavaScript.',
      source: 'Slides 5.1, slide 17' },
    { id: 'l51-type-exact', lecture: '5.1', type: 'mc',
      prompt: 'In which language can a value be treated as another type even without a cast?',
      answer: 'C', options: ['Java', 'Ada'],
      why: 'Java requires types to match exactly (or be a subset). See the banana pre-test: C accepts an int as a condition.',
      source: 'Slides 5.1, slide 18' },
    { id: 'l51-storage', lecture: '5.1', type: 'recall',
      prompt: 'When can a variable’s address be determined, and where can the storage live?',
      answer: 'Statically (before run time), or dynamically: on the stack, or on the heap (explicit or implicit).',
      points: ['static', 'dynamic: stack', 'dynamic: heap, explicit or implicit'],
      why: 'Where the address lives determines the lifetime (lecture 5.2).',
      source: 'Slides 5.1, slides 22-23' },
    { id: 'l51-case-arg', lecture: '5.1', type: 'recall',
      prompt: 'Should a programming language allow variable names to be case-sensitive? Argue it.',
      answer: 'Either side can be argued. Against: should twoDArray and twoDarray be one variable or two? Treating them as different allows more confusion and is less readable, since most people would read them as the same. Case-insensitivity doesn’t stop anyone from writing camelCase. For: languages are case-sensitive partly because it is less work for the compiler writer (simpler string comparisons).',
      points: ['takes a side', 'example like twoDArray vs twoDarray', 'readability / confusion argument', 'mentions the compiler-writer reason'],
      why: 'Python, Java and C are case-sensitive; Scheme is not.',
      source: 'Post Test Names & Identifiers, Q1' },
    { id: 'l51-explicit-types', lecture: '5.1', type: 'recall',
      prompt: 'Her key lists four advantages of declaring a variable’s type explicitly (as in Java) over just using a name (as in Python). Give all four.',
      answer: 'The compiler can catch spelling errors (one of the most common mistakes); the programmer has a clearer idea what the variable is for; the reader knows the intended type (in x = 5, is x an integer or a real?); the compiler can allocate the right amount of space immediately.',
      points: ['catches misspelled names', 'clearer purpose for the programmer', 'reader knows the type', 'right amount of space allocated'],
      why: 'Her test asks for three; learning all four means any three she accepts are covered.',
      source: 'Post Test Names & Identifiers, Q2' },
    { id: 'l51-spaces', lecture: '5.1', type: 'recall',
      prompt: 'Should a language allow variable names to have spaces? Why or why not?',
      answer: 'It could, but it shouldn’t. average grades = sum of grades / number of grades reads well, but in  if average grades < 50.0 :  is the variable “if average grades”, “average grades”, or two variables? It becomes unreadable and ambiguous. Also, most external linkers forbid spaces.',
      points: ['readable in simple cases', 'ambiguous with keywords (the if example)', 'external linking forbids spaces'],
      why: '',
      source: 'Pre Test Names & Identifiers, Q1' },
    { id: 'l51-single', lecture: '5.1', type: 'recall',
      prompt: 'Should a language forbid single-letter variable names? Why or why not?',
      answer: 'The professor says yes: single-letter names are not readable and not searchable. The possible exception is loop indices, but numbers[row][column] is still more readable than numbers[i][j].',
      points: ['not readable', 'not searchable', 'the usual exception is loop indices', 'even there, longer names read better (numbers[row][column])'],
      why: 'Python allows them, though pylint flags them.',
      source: 'Pre Test Names & Identifiers, Q2' },
    { id: 'l51-name-objcode', lecture: '5.1', type: 'recall',
      prompt: 'What is the significance of a name in a program, and where is the name in the object code?',
      answer: 'Names are for people (programmers and readers): they let people avoid knowing where something is in memory, what its actual value is, or how long it is stored. The name, as a literal, never exists in the object code.',
      points: ['names are for people', 'hide address, value and lifetime details', 'never in the object code'],
      why: 'The compiler replaces names with addresses (via the symbol table).',
      source: 'Pre Test Names & Identifiers, Q3' },
    { id: 'l51-unique', lecture: '5.1', type: 'recall',
      prompt: 'Many programmers work on one project. Must they all make sure their names are unique? Why or why not?',
      answer: 'No, provided the names are not global. Scope and lifetime rules mean a name only exists or is accessible in certain places, so good practice is to keep names local to a small context. Java goes furthest: classes give even method names a local context.',
      points: ['No, unless global', 'scope and lifetime rules limit where a name applies', 'keep names local'],
      why: '',
      source: 'Pre Test Names & Identifiers, Q4' },

    // ───────────── Lecture 5.2: lifetime and scope ─────────────
    { id: 'l52-scope-def', lecture: '5.2', type: 'recall',
      prompt: 'Define scope.',
      answer: 'The range of statements in a program over which a name is visible.',
      points: ['range of statements', 'where the name is visible'],
      why: 'Scope is about space (where in the text); lifetime is about time (when during the run).',
      source: 'Slides 5.2, slide 14' },
    { id: 'l52-lifetime-vs-scope', lecture: '5.2', type: 'recall',
      prompt: 'How do a variable’s lifetime and its scope differ? Use a C static local as the example.',
      answer: 'Lifetime is time: how long during execution the name is bound to a memory cell. Scope is space: the statements where the name is visible. A C static local in a function lives for the whole run (static lifetime), but it is only visible inside that function (local scope).',
      points: ['lifetime = time bound to a memory cell', 'scope = where the name is visible', 'a C static local lives for the whole run', 'but is visible only inside its function'],
      why: 'The sa example (lecture 5.2, slide 28) shows both at once.',
      source: 'Slides 5.2, slides 3-4 and 28 (the lifetime wording fills slide blanks; check it against your notes)' },
    { id: 'l52-implicit-heap', lecture: '5.2', type: 'mc',
      prompt: 'Python lists live in which kind of storage?',
      answer: 'Implicit heap', options: ['Stack', 'Explicit heap', 'Static'],
      why: 'Allocation and deallocation happen automatically on assignment; the programmer never asks for memory.',
      source: 'Slides 5.2, slide 11' },
    { id: 'l52-explicit-heap', lecture: '5.2', type: 'mc',
      prompt: 'Java objects live in which kind of storage?',
      answer: 'Explicit heap', options: ['Implicit heap', 'Stack', 'Static'],
      why: 'The programmer explicitly creates them (new); in C, explicit heap items come from malloc and are freed with free.',
      source: 'Slides 5.2, slide 9' },
    { id: 'l52-block-trace', lecture: '5.2', type: 'typed',
      prompt: 'What does a call to doThis() print?',
      code: `int i = 89;
void doThis(){
   int num = 10;
   int i = 1;
   while (i < num){
      int num = 0;
      num++;
      i++;
      printf("%d ", num);
   }//while
   printf("\\n%d\\n", num);
}//doThis`,
      answer: '1 1 1 1 1 1 1 1 1\n10',
      why: 'The while condition is outside the block, so it uses the outer num (10): 9 iterations as i goes 1 to 9. Each iteration makes a fresh inner num = 0 and prints 1. After the loop the inner num is gone, so the last line prints the outer num: 10.',
      source: 'Slides 5.2, slide 15 (output verified with gcc)',
      verify: { lang: 'c', src: `#include <stdio.h>
int i = 89;
void doThis(){ int num = 10; int i = 1; while (i < num){ int num = 0; num++; i++; printf("%d ", num); } printf("\\n%d\\n", num); }
int main(void){ doThis(); return 0; }` } },
    { id: 'l52-block-java', lecture: '5.2', type: 'recall',
      prompt: 'This doThis() code is legal in C and C++ but not in Java or C#. Why?',
      code: `int i = 89;
void doThis(){
   int num = 10;
   int i = 1;
   while (i < num){
      int num = 0;
      num++;
      i++;
      printf("%d ", num);
   }//while
   printf("\\n%d\\n", num);
}//doThis`,
      answer: 'It declares a second num inside a nested block while the outer num is still in scope. Java and C# forbid a local in a nested block from hiding an enclosing local; C and C++ allow it (the inner one hides the outer one).',
      points: ['inner num redeclares a name already in scope', 'Java/C#: not allowed to hide an enclosing local', 'C/C++: allowed, the inner one hides the outer'],
      why: 'This hiding is a scope hole inside one function.',
      source: 'Slides 5.2, slide 15' },
    { id: 'l52-py-trace', lecture: '5.2', type: 'typed',
      prompt: 'This Python program prints five lines. Give just the five numbers it prints, in order.',
      code: `x = 12
y = 82
def f(w):
    print("In f top, y is: ", y)
    # print("In f top, x is: ", x)
    def g(y):
        nonlocal x
        def h():
            print("In h, x is: ", x)
        print("In g, x is: ", x)
        x = 55
        h()
    x = 13
    g(100)
    print("In f bottom, x is: ", x)

f(x)
print("Global, x is: ", x)`,
      answer: '82 13 55 55 12',
      why: 'x = 13 inside f makes x local to f. nonlocal x makes g’s x the same variable as f’s, so g sets f’s x to 55, which h and the bottom of f both see. The global x is never touched: still 12. y in f is the global 82 (g’s parameter y is a different y).',
      source: 'Slides 5.2, slide 21 (output verified with Python 3)',
      verify: { lang: 'python', src: `import builtins
_out = []
def print(*a): _out.append(str(a[-1]))
x = 12
y = 82
def f(w):
    print("In f top, y is: ", y)
    def g(y):
        nonlocal x
        def h():
            print("In h, x is: ", x)
        print("In g, x is: ", x)
        x = 55
        h()
    x = 13
    g(100)
    print("In f bottom, x is: ", x)
f(x)
print("Global, x is: ", x)
builtins.print(' '.join(_out))` } },
    { id: 'l52-py-unbound', lecture: '5.2', type: 'recall',
      prompt: 'In this Python program, what happens if the commented-out line at the top of f is uncommented? Why?',
      code: `x = 12
y = 82
def f(w):
    print("In f top, y is: ", y)
    # print("In f top, x is: ", x)
    def g(y):
        nonlocal x
        def h():
            print("In h, x is: ", x)
        print("In g, x is: ", x)
        x = 55
        h()
    x = 13
    g(100)
    print("In f bottom, x is: ", x)

f(x)
print("Global, x is: ", x)`,
      answer: 'It crashes with UnboundLocalError. Because f assigns x later (x = 13), x is local to the whole body of f, so reading it on the first line means reading a local that hasn’t been bound yet. It does not fall back to the global x.',
      points: ['UnboundLocalError', 'x = 13 makes x local to all of f', 'so the read happens before the local is bound'],
      why: 'Python decides scope per function at compile time: static scoping.',
      source: 'Slides 5.2, slide 21 (verified with Python 3)' },
    { id: 'l52-scope-hole', lecture: '5.2', type: 'recall',
      prompt: 'What is a scope hole? Give an example in C.',
      answer: 'It needs two variables with the same name. A scope hole is where the broader-scoped variable cannot be accessed because a narrower-scoped variable has the same name. Example: a global int x = 2; and a function int f(int x) { … }: inside f there is no access to the global x, even though it exists and is in memory.',
      points: ['two variables, same name', 'the outer one cannot be accessed where the inner one is in scope', 'a C example (global x hidden by a parameter or local x)'],
      why: 'The outer variable is still alive (lifetime); it is just not visible (scope).',
      source: 'Post Test Names & Identifiers, Q3; Slides 5.2, slide 20' },
    { id: 'l52-js-static', lecture: '5.2', type: 'typed',
      prompt: 'Under static scoping, what value does inner2 get for x?',
      code: `function outer(){
   function inner1(){
      var x = 12;
      inner2();
   }
   function inner2(){
      var y = x;
   }
   var x = 22;
   inner1();
}`,
      answer: '22',
      why: 'Static scoping follows the text: inner2 is written inside outer, so its x is outer’s x (22).',
      source: 'Slides 5.2, slide 24 (verified with Node, which is statically scoped)',
      verify: { lang: 'node', src: `function outer(){ function inner1(){ var x = 12; inner2(); } function inner2(){ var y = x; console.log(y); } var x = 22; inner1(); } outer();` } },
    { id: 'l52-js-dynamic', lecture: '5.2', type: 'typed',
      prompt: 'Same code. Under dynamic scoping, what value does inner2 get for x?',
      code: `function outer(){
   function inner1(){
      var x = 12;
      inner2();
   }
   function inner2(){
      var y = x;
   }
   var x = 22;
   inner1();
}`,
      answer: '12',
      why: 'Dynamic scoping follows the calls: outer → inner1 → inner2, and the most recent x on that chain is inner1’s (12).',
      source: 'Slides 5.2, slide 24 (verified by running the same program in bash, whose local variables are dynamically scoped)',
      verify: { lang: 'bash', src: `outer() { inner1() { local x=12; inner2; }; inner2() { local y=$x; echo $y; }; local x=22; inner1; }; outer` } },
    { id: 'l52-kiwi-dynamic', lecture: '5.2', type: 'typed',
      prompt: 'Python-like syntax. What is the output under DYNAMIC scoping?',
      code: `kiwi = 16

def f(x, y):
   print('Hi', (x + y + kiwi))

def g(x):
   kiwi = 12
   h(x, kiwi)

def h(x, y):
   f(y, 2 * x)

g(3)`,
      answer: 'Hi 30',
      why: 'g(3) → h(3, 12) → f(12, 6). Under dynamic scoping f finds the most recent kiwi on the call chain: g’s 12. 12 + 6 + 12 = 30.',
      source: 'Post Test Names & Identifiers, Q4a (verified by running it in bash, which is dynamically scoped)',
      verify: { lang: 'bash', src: `kiwi=16
f() { local x=$1 y=$2; echo "Hi $((x + y + kiwi))"; }
g() { local x=$1; local kiwi=12; h $x $kiwi; }
h() { local x=$1 y=$2; f $y $((2 * x)); }
g 3` } },
    { id: 'l52-kiwi-static', lecture: '5.2', type: 'typed',
      prompt: 'Same program. What is the output under STATIC scoping?',
      code: `kiwi = 16

def f(x, y):
   print('Hi', (x + y + kiwi))

def g(x):
   kiwi = 12
   h(x, kiwi)

def h(x, y):
   f(y, 2 * x)

g(3)`,
      answer: 'Hi 34',
      why: 'Same calls: f(12, 6). Under static scoping f’s kiwi is the one in the text around f: the global 16. 12 + 6 + 16 = 34.',
      source: 'Post Test Names & Identifiers, Q4b (verified with Python, which is statically scoped)',
      verify: { lang: 'python', src: `kiwi = 16
def f(x, y):
   print('Hi', (x + y + kiwi))
def g(x):
   kiwi = 12
   h(x, kiwi)
def h(x, y):
   f(y, 2 * x)
g(3)` } },
    { id: 'l52-sa-tenth', lecture: '5.2', type: 'typed',
      prompt: 'main calls foo() 10 times. What does the 10th call print?',
      code: `void foo() {
   int a = 10;
   static int sa = 10;
   a += 5;
   sa += 5;
   printf("a = %d, sa = %d\\n", a, sa);
}

int main() {
   int i;
   for (i = 0; i < 10; ++i)
      foo();
}`,
      answer: 'a = 15, sa = 60',
      why: 'a is a stack variable: created fresh as 10 on every call, so always 15. sa is static: bound once before execution and kept, so it grows by 5 per call: 10 + 5 × 10 = 60.',
      source: 'Slides 5.2, slide 28 (verified with gcc)',
      verify: { lang: 'c', pick: 'last', src: `#include <stdio.h>
void foo() { int a = 10; static int sa = 10; a += 5; sa += 5; printf("a = %d, sa = %d\\n", a, sa); }
int main() { int i; for (i = 0; i < 10; ++i) foo(); return 0; }` } },
    { id: 'l52-sa-error', lecture: '5.2', type: 'recall',
      prompt: 'The line  sa = sa * 2;  in main is an error, even though sa exists for the whole run. Why?',
      code: `void foo() {
   int a = 10;
   static int sa = 10;
   a += 5;
   sa += 5;
   printf("a = %d, sa = %d\\n", a, sa);
}

int main() {
   int i;
   for (i = 0; i < 10; ++i)
      foo();
   sa = sa * 2;
   printf("sa = %d\\n", sa);
}`,
      answer: 'sa has static lifetime (it is bound to memory for the whole execution) but local scope: it is only visible inside foo. main cannot see the name, so the compiler rejects it.',
      points: ['lifetime: whole run (static)', 'scope: only inside foo', 'main cannot see the name, so it is a compile error'],
      why: 'The clearest example of lifetime and scope being different things.',
      source: 'Slides 5.2, slide 28' },
    { id: 'l52-dynamic-def', lecture: '5.2', type: 'recall',
      prompt: 'Under dynamic scoping, how is a reference to a variable resolved?',
      answer: 'By the calling sequence at run time, not the textual layout: search back through the chain of subprogram calls for the most recent declaration. It is temporal, where static scoping is spatial.',
      points: ['decided by the calls at run time, not the text', 'search back through the chain of calls', 'temporal vs spatial'],
      why: '',
      source: 'Slides 5.2, slide 23 (the slide blanks are filled here; check them against your notes)' },
    { id: 'l52-const-c', lecture: '5.2', type: 'mc',
      prompt: 'In C, which named constant is bound statically (at compile time)?',
      answer: '#define', options: ['const', 'volatile'],
      why: '#define is replaced before compilation; a const variable gets its value at run time.',
      source: 'Slides 5.2, slide 30' },
    { id: 'l52-const-csharp', lecture: '5.2', type: 'mc',
      prompt: 'In C#, which named constant has its value bound dynamically?',
      answer: 'readonly', options: ['const', 'internal'],
      why: 'C# const values are bound at compile time; readonly values are bound dynamically.',
      source: 'Slides 5.2, slide 31' },
    { id: 'l52-const-compare', lecture: '5.2', type: 'recall',
      prompt: 'When are named-constant values bound in C (#define, const), Java (final) and C# (const, readonly)?',
      answer: 'C: #define is static, const is not. Java: final is all dynamic. C#: const values are bound at compile time; readonly values are bound dynamically.',
      points: ['C: #define static, const not', 'Java: final dynamic', 'C#: const at compile time', 'C#: readonly dynamic'],
      why: 'Per the slides. Strictly, a Java static final with a constant initializer is a compile-time constant that javac inlines; “all dynamic” is the slides’ simplification.',
      source: 'Slides 5.2, slides 30-31 (replaces a two-option MC on Java final)' },

    { id: 'l52-lifetime-def', lecture: '5.2', type: 'recall',
      prompt: 'Define lifetime (of a variable).',
      answer: 'The time during which a name is bound to one particular memory cell, i.e. how long that cell is occupied by the name’s value.',
      points: ['the time a name is bound to a particular memory cell', 'how long that cell holds the name’s value'],
      why: 'The address (storage class) decides the lifetime: static, stack-dynamic, explicit heap or implicit heap.',
      source: 'Slides 5.1 slide 23 and 5.2 slide 3 (merges three slide blanks)' },
    { id: 'l52-static-lifetime', lecture: '5.2', type: 'recall',
      prompt: 'Define static lifetime.',
      answer: 'The variable is bound to its memory cell(s) before execution begins and stays bound to the same cells until execution ends.',
      points: ['bound before execution begins', 'stays bound to the same cells until execution ends'],
      why: 'Example: a C or C++ static variable inside a function (sa in the foo example).',
      source: 'Slides 5.2, slide 4 (blank wording from Sebesta ch. 5; merges two slide blanks)' },
    { id: 'l52-static-adv', lecture: '5.2', type: 'recall',
      prompt: 'What is the advantage of static variables, and where does it come from?',
      answer: 'Efficiency: all addressing is direct, and there is no run-time allocation or deallocation.',
      points: ['efficiency (speed)', 'direct addressing', 'no run-time allocation / deallocation'],
      why: 'The address is fixed before the program runs, so the code can use it directly.',
      source: 'Slides 5.2, slide 5 (blank wording from Sebesta ch. 5; merges two slide blanks)' },
    { id: 'l52-static-disadv', lecture: '5.2', type: 'recall',
      prompt: 'What are the disadvantages of static variables?',
      answer: 'Lack of flexibility: no recursion; the size must be known before run time; storage cannot be shared among variables.',
      points: ['lack of flexibility', 'no recursion', 'size must be known before run time', 'storage cannot be shared among variables'],
      why: 'All three specific problems come from “one fixed cell for the whole run”.',
      source: 'Slides 5.2, slide 5 (blank wording from Sebesta ch. 5; merges four slide blanks)' },
    { id: 'l52-static-recursion', lecture: '5.2', type: 'recall',
      prompt: 'Why can’t a language whose variables are all static support recursion?',
      answer: 'Each variable has exactly one memory cell for the whole run. A second, still-active call of the same function would use the same cells and overwrite the first call’s locals.',
      points: ['one memory cell per variable for the whole run', 'a recursive call would overwrite the active call’s locals'],
      why: 'Stack-dynamic locals fix this: every call gets fresh cells. Fortran I subprograms could not recurse for this reason.',
      source: 'Slides 5.2, slide 5 (the reason follows Sebesta ch. 5; replaces a blank whose reason was wrong)' },
    { id: 'l52-decl-rules', lecture: '5.2', type: 'recall',
      prompt: 'Compare C89/Pascal with C99/Java: where may declarations go, and what is a local variable’s scope?',
      answer: 'C89/Pascal: all declarations at the start of the block, and a local’s scope is the whole block. C99/Java: declarations anywhere a statement can go, and a local’s scope runs from its declaration to the end of the block.',
      points: ['C89/Pascal: declarations at the beginning of the block', 'C89/Pascal: scope is the whole block', 'C99/Java: declarations anywhere a statement can go', 'C99/Java: scope from the declaration to the end of the block'],
      why: 'Two answers to the first scope design issue: where declarations are done.',
      source: 'Slides 5.2, slide 17 (blank wording from Sebesta ch. 5; merges four slide blanks)' },
    { id: 'l52-static-scope-adv', lecture: '5.2', type: 'recall',
      prompt: 'What are the advantages of static scoping?',
      answer: 'Most languages do it, so it is familiar; and you can tell which variable a name refers to just by looking at the program, without having to run (trace) it.',
      points: ['most languages use it (familiar)', 'you can tell what a name refers to by reading the program, without running it'],
      why: 'Compare dynamic scoping, where you need the call sequence.',
      source: 'Slides 5.2, slide 25 (blank wording is a best guess at her slide; merges two slide blanks)' },
    { id: 'l52-dynamic-disadv', lecture: '5.2', type: 'recall',
      prompt: 'What are the disadvantages of dynamic scoping?',
      answer: 'You can’t tell what a variable refers to by reading the program; every called subprogram can see and change its callers’ locals (less reliable); non-local access is slower; few languages use it, so it is unfamiliar and harder to learn.',
      points: ['can’t tell what a variable is by looking at the program', 'called subprograms can see and change callers’ locals (less reliable)', 'slower non-local access', 'few languages use it (unfamiliar)'],
      why: 'Its one advantage: a called subprogram can use its caller’s variables without parameters, which helps avoid globals.',
      source: 'Slides 5.2, slide 26 (the first point is her slide; the rest follow Sebesta ch. 5; merges two slide blanks)' },
    { id: 'l52-named-const', lecture: '5.2', type: 'recall',
      prompt: 'What is a named constant, and what are its advantages?',
      answer: 'A “variable” bound to a value only once. Advantages: readability (PI instead of 3.14159), modifiability (change the value in one place), and it is used to parameterize programs.',
      points: ['bound to a value only once', 'readability (e.g. PI vs 3.14159)', 'modifiability: change it in one place', 'parameterizes programs'],
      why: 'Example of parameterizing: const int MAX = 100; used for every array size and loop bound.',
      source: 'Slides 5.2, slide 29 (two blanks filled from Sebesta ch. 5; merges two slide blanks)' },
    { id: 'l52-manifest', lecture: '5.2', type: 'recall',
      prompt: 'Named-constant values can be bound statically or dynamically. What are statically bound ones called, and which C construct makes one?',
      answer: 'Manifest constants; #define.',
      points: ['manifest constants', '#define in C'],
      why: '#define is replaced before compilation, so its value is fixed before the program ever runs.',
      source: 'Slides 5.2, slide 30 (blank wording from Sebesta ch. 5; merges two slide blanks)' },
    { id: 'l52-storage-classify', lecture: '5.2', type: 'recall',
      prompt: 'Classify the storage (lifetime) of each: (1) int g; at file scope in C, (2) static int s; inside a C function, (3) int t; inside a C function, (4) p in  int *p = malloc(sizeof(int));  inside a function, (5) the int that p points to, (6) a Python list.',
      answer: '(1) static; (2) static; (3) stack-dynamic; (4) stack-dynamic; (5) explicit heap; (6) implicit heap.',
      points: ['global g: static', 'static local s: static', 'plain local t: stack-dynamic', 'the pointer p itself: stack-dynamic', 'the malloc’d int: explicit heap', 'Python list: implicit heap'],
      why: 'The pointer and what it points to have different lifetimes: p dies when the function returns, the heap int lives until free().',
      source: 'Practice item using Slides 5.2, slides 4-12 (Sebesta ch. 5 categories)' },
    { id: 'l52-abc-static', lecture: '5.2', type: 'typed',
      prompt: 'Python-like syntax. What does this print under STATIC scoping?',
      code: `x = 1
def a():
    print(x)
def b():
    x = 2
    a()
def c():
    x = 3
    b()
c()
a()`,
      answer: '1 1',
      why: 'a is written at the top level, so its x is the global x, wherever a is called from.',
      source: 'Practice item in the style of Post Test Names Q4 (verified with Python, which is statically scoped)',
      verify: { lang: 'python', src: `x = 1
def a():
    print(x)
def b():
    x = 2
    a()
def c():
    x = 3
    b()
c()
a()` } },
    { id: 'l52-abc-dynamic', lecture: '5.2', type: 'typed',
      prompt: 'Same program. What does it print under DYNAMIC scoping?',
      code: `x = 1
def a():
    print(x)
def b():
    x = 2
    a()
def c():
    x = 3
    b()
c()
a()`,
      answer: '2 1',
      why: 'First call: c → b → a. Searching back up the call chain, the most recent x is b’s (2). Second call: a is called from the top level, so it finds the global x (1).',
      source: 'Practice item in the style of Post Test Names Q4 (verified in bash, whose locals are dynamically scoped)',
      verify: { lang: 'bash', src: `x=1
a() { echo "$x"; }
b() { local x=2; a; }
c() { local x=3; b; }
c
a` } },
    { id: 'l52-param-static', lecture: '5.2', type: 'typed',
      prompt: 'Python-like syntax. What does this print under STATIC scoping?',
      code: `n = 5
def show():
    print(n)
def setup(n):
    show()
def run():
    n = 7
    setup(9)
run()`,
      answer: '5',
      why: 'show is written at the top level, so its n is the global n.',
      source: 'Practice item in the style of Post Test Names Q4 (verified with Python)',
      verify: { lang: 'python', src: `n = 5
def show():
    print(n)
def setup(n):
    show()
def run():
    n = 7
    setup(9)
run()` } },
    { id: 'l52-param-dynamic', lecture: '5.2', type: 'typed',
      prompt: 'Same program. What does it print under DYNAMIC scoping?',
      code: `n = 5
def show():
    print(n)
def setup(n):
    show()
def run():
    n = 7
    setup(9)
run()`,
      answer: '9',
      why: 'Call chain run → setup → show. The most recent n is setup’s parameter n, which is 9: a parameter counts as a declaration.',
      source: 'Practice item in the style of Post Test Names Q4 (verified in bash, whose locals are dynamically scoped)',
      verify: { lang: 'bash', src: `n=5
show() { echo "$n"; }
setup() { local n=$1; show; }
run() { local n=7; setup 9; }
run` } },
    { id: 'l52-static-parent', lecture: '5.2', type: 'recall',
      prompt: 'Under static scoping, what is sub2’s static parent, and what are its static ancestors?',
      code: `def main():
    x = 1
    def sub1():
        def sub2():
            print(x)
        sub2()
    def sub3():
        sub1()
    sub3()`,
      answer: 'Static parent: sub1. Static ancestors: sub1, then main (then the global scope). The x in sub2 is found in main.',
      points: ['static parent: sub1', 'static ancestors: sub1 and main (then global)', 'x is found in main'],
      why: 'Static = by where the code is written. sub3 calls sub1 but does not enclose it, so sub3 is not an ancestor.',
      source: 'Practice item applying Slides 5.2, slide 18' },
    { id: 'l52-dynamic-chain', lecture: '5.2', type: 'recall',
      prompt: 'Under DYNAMIC scoping, in what order are subprograms searched for the x in sub2?',
      code: `def main():
    x = 1
    def sub1():
        def sub2():
            print(x)
        sub2()
    def sub3():
        sub1()
    sub3()`,
      answer: 'sub2 itself, then sub1 (its caller), then sub3, then main, where x is found.',
      points: ['starts in sub2', 'then back along the calls: sub1, then sub3', 'then main, where x is found'],
      why: 'Dynamic = by the order of calls (main → sub3 → sub1 → sub2), searched from the most recent. Static scoping skips sub3 entirely.',
      source: 'Practice item applying Slides 5.2, slide 23' },

    // ───────────── Lecture 10: control structures ─────────────
    { id: 'l10-control-stmt', lecture: '10', type: 'recall',
      prompt: 'What is a control statement? Give two examples.',
      answer: 'Something that changes execution from the normal (sequential) order to something non-sequential. E.g. goto, for, while, if, a function call; in Scheme, sequencing and cond.',
      points: ['changes execution from the normal (sequential) order to a non-sequential one', 'two valid examples (goto, for, while, if, a function call; cond in Scheme)'],
      why: '',
      source: 'Slides 10, slide 2' },
    { id: 'l10-control-struct', lecture: '10', type: 'recall',
      prompt: 'What is a control structure?',
      answer: 'A control statement plus the collection of statements controlled by it.',
      points: ['a control statement', 'plus the statements it controls'],
      why: '',
      source: 'Slides 10, slide 4' },
    { id: 'l10-turing', lecture: '10', type: 'recall',
      prompt: 'Ordered statements plus a goto with a compare are enough for Turing completeness. Why do languages still provide control structures?',
      answer: 'Goto-only code is sufficient but not structured: it cannot be read from top to bottom, so it is hard to read and maintain. Control structures give a top-to-bottom reading of the program.',
      points: ['goto with a compare is sufficient but not structured', 'control structures let you read the program top to bottom (readability, maintainability)'],
      why: 'The “what does Turing complete need” definition is on its own card (lecture 1).',
      source: 'Slides 10, slide 3' },
    { id: 'l10-design-q', lecture: '10', type: 'recall',
      prompt: 'What are the three design questions for any control structure?',
      answer: 'Can we enter the structure at multiple points (jump in, or only at the top)? Can we leave from multiple points? When we leave, must we go to the statement just below the structure, or can we go somewhere else?',
      points: ['multiple entry points?', 'multiple exit points?', 'exit only to the next statement?'],
      why: '',
      source: 'Slides 10, slide 5' },
    { id: 'l10-two-way-issues', lecture: '10', type: 'recall',
      prompt: 'What are the design issues for two-way selection (if … else)?',
      answer: 'The form and type of the control expression; the form of the structure (bracketing); the meaning of nested selection (e.g. the dangling else).',
      points: ['form and type of the control expression', 'bracketing', 'nested selection / dangling else'],
      why: '',
      source: 'Slides 10, slide 7' },
    { id: 'l10-assign-trace', lecture: '10', type: 'typed',
      prompt: 'The user types 3. What does this C code print?',
      code: `int userNum;
int favNum;
favNum = 5;
printf("Enter your number: ");
scanf("%d", &userNum);
if (userNum = favNum)
   printf("Awesome");
else
   printf("Unfortunate");`,
      answer: 'Awesome', accept: ['Enter your number: Awesome'],
      why: 'userNum = favNum is an assignment, not a comparison: it sets userNum to 5 and evaluates to 5, which C treats as true. It prints Awesome for any input (unless favNum were 0).',
      source: 'Slides 10, slide 8 (verified with gcc)',
      verify: { lang: 'c', src: `#include <stdio.h>
int main(void){ int userNum = 3; int favNum; favNum = 5; if (userNum = favNum) printf("Awesome"); else printf("Unfortunate"); return 0; }` } },
    { id: 'l10-assign-why', lecture: '10', type: 'recall',
      prompt: 'What design decision lets  if (userNum = favNum)  compile in C, and how does Java avoid this bug?',
      answer: 'In C (and C++, Python …) the control expression can be arithmetic, so any nonzero value counts as true, and an assignment is an expression with a value. Java requires the control expression to be a boolean, so an int assignment there is a compile-time type error.',
      points: ['C allows an arithmetic control expression', 'assignment yields a value (nonzero = true)', 'Java requires a boolean, so it won’t compile'],
      why: 'Same design issue as the banana pre-test: the form and type of the control expression.',
      source: 'Slides 10, slide 8' },
    { id: 'l10-perl', lecture: '10', type: 'mc',
      prompt: 'Which language needs braces around the body of an if even when the body is a single statement?',
      answer: 'Perl', options: ['C', 'Java', 'Python'],
      why: 'C and Java accept a single statement without braces; Python uses indentation.',
      source: 'Slides 10, slide 9' },
    { id: 'l10-algol68', lecture: '10', type: 'typed',
      prompt: 'In Algol 68, which keyword closes an  if ?',
      answer: 'fi',
      why: 'if … fi (and do … od): the closing word is the opening word reversed.',
      source: 'Slides 10, slide 9' },
    { id: 'l10-dangling-4', lecture: '10', type: 'typed',
      prompt: 'x = 4; y = 5; count = 20. What is result afterward?',
      code: `result = 111;
if (x > y)
   if (count == 0)
      result = 0;
   else
      result = 1;`,
      answer: '111',
      why: 'The else belongs to the closest if (count == 0). The outer if (4 > 5) is false, so nothing runs: result stays 111.',
      source: 'Slides 10, slide 12 (verified with gcc)',
      verify: { lang: 'c', src: `#include <stdio.h>
int main(void){ int x = 4, y = 5, count = 20, result; result = 111; if (x > y) if (count == 0) result = 0; else result = 1; printf("%d", result); return 0; }` } },
    { id: 'l10-dangling-14', lecture: '10', type: 'typed',
      prompt: 'Same code, but x = 14; y = 5; count = 20. What is result afterward?',
      code: `result = 111;
if (x > y)
   if (count == 0)
      result = 0;
   else
      result = 1;`,
      answer: '1',
      why: '14 > 5, so the inner if runs; count is not 0, so its else runs: result = 1.',
      source: 'Slides 10, slide 12 (verified with gcc)',
      verify: { lang: 'c', src: `#include <stdio.h>
int main(void){ int x = 14, y = 5, count = 20, result; result = 111; if (x > y) if (count == 0) result = 0; else result = 1; printf("%d", result); return 0; }` } },
    { id: 'l10-dangling-rule', lecture: '10', type: 'recall',
      prompt: 'In C today and in Java, which if does a dangling else belong to? How was early C different?',
      answer: 'The closest previous if: a formal semantic rule. Early versions of C had no formal semantics for it.',
      points: ['closest previous if', 'a formal semantic rule', 'early C: no formal semantics'],
      why: 'Indentation means nothing to the compiler, which is why the slide indents the else misleadingly.',
      source: 'Slides 10, slides 11-12' },
    { id: 'l10-multiway-issues', lecture: '10', type: 'recall',
      prompt: 'What are the five design issues for multi-way selection?',
      answer: 'The form and type of the control expression; how the selectable segments are specified; whether execution is restricted to a single segment; how case values are specified; what is done about unrepresented values.',
      points: ['control expression form and type', 'how segments are specified', 'single segment only?', 'how case values are specified', 'unrepresented values'],
      why: 'The original goal of multi-way selection was speed, not just a chain of conditions.',
      source: 'Slides 10, slides 14-15' },
    { id: 'l10-cswitch', lecture: '10', type: 'recall',
      prompt: 'Can one execution of C’s switch run more than one segment? Why?',
      answer: 'Yes. There is no implicit branch at the end of a segment, so execution falls through into the next segment until a break (“break is your friend”).',
      points: ['yes, any number of segments can run', 'no implicit branch at the end of a segment (falls through)', 'break stops it'],
      why: 'This is C’s answer to the design issue “restricted to a single segment?”.',
      source: 'Slides 10, slide 17 (split from the old five-part card)' },
    { id: 'l10-cswitch-types', lecture: '10', type: 'recall',
      prompt: 'In C’s switch, what types may the control expression and the case values have?',
      answer: 'Both must be integers, or types that implicitly convert to an integer (such as char).',
      points: ['control expression: evaluates to an integer', 'case values: integers or types that convert to integers'],
      why: 'C# relaxes this: its switch can use a string.',
      source: 'Slides 10, slide 17 (split from the old five-part card)' },
    { id: 'l10-cswitch-default', lecture: '10', type: 'recall',
      prompt: 'What does C’s switch do with a value that matches no case?',
      answer: 'Runs the default clause if there is one; with no default, the whole statement does nothing for that value.',
      points: ['runs default if present', 'with no default, does nothing'],
      why: 'C’s answer to the design issue “what is done about unrepresented values?”.',
      source: 'Slides 10, slide 17 (split from the old five-part card)' },
    { id: 'l10-switch-why', lecture: '10', type: 'recall',
      prompt: 'What was the original goal of multi-way selection (switch), and does every compiler achieve it?',
      answer: 'Speed: jump straight to the right segment instead of testing a chain of conditions. Not every compiler does this; some just generate a series of if / else-ifs.',
      points: ['goal: make selection fast', 'jump to the segment rather than test conditions one by one', 'some compilers just produce a chain of if / else-ifs'],
      why: 'That is why switch restricts case values to constants: a jump table needs them known at compile time.',
      source: 'Slides 10, slide 14 (the jump-table remark is Sebesta, not her slide)' },
    { id: 'l10-csharp-switch', lecture: '10', type: 'recall',
      prompt: 'Give two ways C#’s switch differs from C’s.',
      answer: 'C# disallows implicitly running more than one segment: each segment must end with an unconditional branch (break or goto). And its control expression can be a string.',
      points: ['no implicit fall-through: each segment ends with break or goto', 'the control expression can be a string'],
      why: 'C# keeps switch’s shape but removes C’s most common switch bug.',
      source: 'Slides 10, slide 18' },
    { id: 'l10-selector', lecture: '10', type: 'recall',
      prompt: 'What is a selector expression? Show how C and ML write  “m is the larger of x and y”  with one.',
      answer: 'A selection that produces a value (an expression, not a statement). C: m = x > y ? x : y;  ML: let m = if x > y then x else y',
      points: ['a selection that yields a value (an expression)', 'C: m = x > y ? x : y;', 'ML: let m = if x > y then x else y'],
      why: 'In ML the if itself is an expression; C needs the separate ?: operator for this.',
      source: 'Slides 10, slide 13' },
    { id: 'l10-ternary-trace', lecture: '10', type: 'typed',
      prompt: 'What does this C code print?',
      code: `int x = 4, y = 9;
int m = x > y ? x : y;
int n = (m % 2 == 0) ? m / 2 : m * 3;
printf("%d %d", m, n);`,
      answer: '9 27',
      why: '4 > 9 is false, so m = y = 9. 9 is odd, so n = 9 * 3 = 27.',
      source: 'Practice item applying Slides 10, slide 13 (verified with gcc)',
      verify: { lang: 'c', src: `#include <stdio.h>
int main(void) { int x = 4, y = 9; int m = x > y ? x : y; int n = (m % 2 == 0) ? m / 2 : m * 3; printf("%d %d", m, n); return 0; }` } },
    { id: 'l10-iter-design', lecture: '10', type: 'recall',
      prompt: 'What are the design issues for iteration (loops)?',
      answer: 'How is iteration controlled: logically, by a count, or by a data type with its own iterator? Can a loop be entered somewhere other than the top? Where is it decided whether the loop is done (top = pretest, bottom = posttest)?',
      points: ['how is it controlled: logical, counted, or a data type’s own iterator', 'can you enter other than at the top?', 'where is the done-test: top (pretest) or bottom (posttest)?'],
      why: 'C’s goto answers “yes” to entering anywhere; Java’s loops must be entered from the top.',
      source: 'Slides 10, slide 22' },
    { id: 'l10-fallthrough', lecture: '10', type: 'typed',
      prompt: 'What does this C code print?',
      code: `int n = 2;
switch (n) {
   case 1: printf("one ");
   case 2: printf("two ");
   case 3: printf("three ");
   default: printf("other");
}`,
      answer: 'two three other',
      why: 'C jumps to case 2, then falls through every later segment because there is no break.',
      source: 'Practice item applying Slides 10, slide 17 (output verified with gcc)',
      verify: { lang: 'c', src: `#include <stdio.h>
int main(void){ int n = 2; switch (n) { case 1: printf("one "); case 2: printf("two "); case 3: printf("three "); default: printf("other"); } return 0; }` } },
    { id: 'l10-csharp', lecture: '10', type: 'mc',
      prompt: 'Which language forbids falling through from one switch segment into the next?',
      answer: 'C#', options: ['C', 'C++', 'Java'],
      why: 'In C# each segment must end with an unconditional branch (break or goto). C# can also switch on a string.',
      source: 'Slides 10, slide 18' },
    { id: 'l10-loop-kinds', lecture: '10', type: 'mc',
      prompt: 'do … while is which kind of loop?',
      answer: 'Posttest', options: ['Pretest', 'Counter-controlled'],
      why: 'The condition is checked after the body, so the body always runs at least once. for, while and for-each are pretest.',
      source: 'Slides 10, slide 21' },
    { id: 'l10-weird-for', lecture: '10', type: 'typed',
      prompt: 'After this loop, what are i, j and sum? (Answer like: i = 1, j = 2, sum = 3)',
      code: `int i, j, sum = 0;
for(i = 0, j = 2; i < 10; sum = ++i + j, j *= 2);`,
      answer: 'i = 10, j = 2048, sum = 1034', accept: ['i=10, j=2048, sum=1034', 'i=10 j=2048 sum=1034', '10, 2048, 1034', '10 2048 1034'],
      why: 'The body is empty (the ; ). Each pass: i goes up by 1, sum = new i + current j, then j doubles. After 10 passes i = 10; the last sum used j = 1024: 10 + 1024 = 1034; then j doubled to 2048.',
      source: 'Slides 10, slide 23 (verified with gcc)',
      verify: { lang: 'c', src: `#include <stdio.h>
int main(void){ int i, j, sum = 0; for(i = 0, j = 2; i < 10; sum = ++i + j, j *= 2); printf("i = %d, j = %d, sum = %d", i, j, sum); return 0; }` } },
    { id: 'l10-py-loop', lecture: '10', type: 'typed',
      prompt: 'What does this Python loop print? (Spacing doesn’t matter.)',
      code: `for i in range(10):
    print(i)
    i *= 5`,
      answer: '0 1 2 3 4 5 6 7 8 9',
      why: 'range(10) hands out the next value each time regardless of what you do to i, so changing i inside the body has no effect on the loop.',
      source: 'Slides 10, slide 24 (verified with Python)',
      verify: { lang: 'python', src: `for i in range(10):
    print(i)
    i *= 5` } },
    { id: 'l10-c-loop', lecture: '10', type: 'typed',
      prompt: 'What does this C loop print?',
      code: `for(i = 0; i < 10; i++){
    printf("%d ", i);
    i *= 5;
}`,
      answer: '0 1 6',
      why: 'In C the loop variable is just a variable: i = 0 prints 0, becomes 0, ++ → 1; prints 1, becomes 5, ++ → 6; prints 6, becomes 30, ++ → 31, and 31 < 10 fails.',
      source: 'Slides 10, slide 24 (printf fixed to compile; verified with gcc)',
      verify: { lang: 'c', src: `#include <stdio.h>
int main(void){ int i; for(i = 0; i < 10; i++){ printf("%d ", i); i *= 5; } return 0; }` } },
    { id: 'l10-loop-compare', lecture: '10', type: 'recall',
      prompt: 'Why does  i *= 5  change how many times the C loop runs, but not the Python loop?',
      code: `Python                       C
for i in range(10):          for(i = 0; i < 10; i++){
    print(i)                     printf("%d ", i);
    i *= 5                       i *= 5;
                             }`,
      answer: 'C’s for(exp1; exp2; exp3) is really a while loop over an ordinary variable, so changing i changes the test. Python’s for takes the next value from range() each time, so changes to i inside the body are overwritten.',
      points: ['C: the loop variable is an ordinary variable tested each pass', 'Python: each pass takes the next value from the iterator', 'so changes to i are lost in Python'],
      why: 'The intent of a counted loop is easy counting; C’s version is more general than the intent.',
      source: 'Slides 10, slides 23-24' },
    { id: 'l10-other-loops', lecture: '10', type: 'recall',
      prompt: 'Logical loops (while, do … while) are considered harder to write. What three things must they include?',
      answer: 'Initialization of the variable(s); a stopping condition; a way to get the variables to the stopping condition.',
      points: ['initialization', 'stopping condition', 'progress toward the stopping condition'],
      why: 'Forget the third and you have an infinite loop.',
      source: 'Slides 10, slide 25' },
    { id: 'l10-break-continue', lecture: '10', type: 'recall',
      prompt: 'Java has no goto. What do break and continue do, and how do you exit an outer loop from inside an inner one?',
      answer: 'break exits the closest loop or switch; continue returns to the top of the closest loop (its next iteration). To exit an outer loop, use a labelled break.',
      points: ['break: exit closest loop/switch', 'continue: next iteration of closest loop', 'labelled break for outer loops'],
      why: 'Java loops must be entered from the top; C’s goto can enter and leave anywhere.',
      source: 'Slides 10, slide 26' },
    { id: 'l10-foreach', lecture: '10', type: 'recall',
      prompt: 'How does iteration built into a data type (for-each) work? Who writes what?',
      answer: 'The library creator implements an iterator (Iterable in Java): code that tracks the current element and moves to the next. Then the user gets the for-each loop for free.',
      points: ['library creator writes the iterator (current + move to next)', 'user just writes for-each'],
      why: 'Python’s for weather in myList and Java’s for(String weather: myList) are the same idea.',
      source: 'Slides 10, slide 27' },

    // ───────────── Argue a design choice ─────────────
    // Her tests ask “Should a language allow X? Why or why not?” and mark the justification,
    // not the side. Every card here is graded on the same four points (ARGUE).
    ...[
      { id: 'x-argue-goto', lecture: '10',
        prompt: 'Should a language have goto? Argue it. (Her slide asks: is the goto the problem, or the programmer who uses it?)',
        answer: 'No (either side can be argued). Criterion: readability and reliability. goto lets control jump into and out of the middle of structures, so the program can no longer be read top to bottom: a backwards  goto L7;  into a loop makes the flow a puzzle. Trade-off: goto is sufficient for everything and is sometimes the clearest exit from nested loops or jump to shared cleanup code in C. Java covers those uses with break, continue and labelled break, so a careful programmer loses little.',
        source: 'Slides 10, slides 26 and 28' },
      { id: 'x-argue-fallthrough', lecture: '10',
        prompt: 'Should a switch statement fall through to the next case by default, as C’s does? Argue it.',
        answer: 'No. Criterion: reliability. A forgotten break silently runs the next case:  case 1: x++;  case 2: y++;  increments y when the value is 1. Trade-off: fall-through lets several values share code ( case \'a\': case \'e\': vowels++; break; ). C# keeps that (stacked labels with no statements between them) but requires every segment with code to end in break or goto.',
        source: 'Slides 10, slides 17-18' },
      { id: 'x-argue-intcond', lecture: '10',
        prompt: 'Should an if statement accept an integer (arithmetic) condition, as C does, or only a boolean, as Java does? Argue it.',
        answer: 'Boolean only. Criterion: reliability. In C,  if (userNum = favNum)  compiles and is true for any nonzero favNum; in Java the same line is a compile-time type error. Trade-off: writeability. C idioms like  while (*endString)  and  if (count)  are shorter, and C programmers rely on them.',
        source: 'Slides 10, slide 8; Pre Test on C, Q1d' },
      { id: 'x-argue-dynscope', lecture: '5.2',
        prompt: 'Should a language use dynamic scoping? Argue it.',
        answer: 'No. Criterion: readability and reliability. In the kiwi program, the kiwi that f adds is 16 or 12 depending on who called f, so you cannot tell what a name means by reading the code, and any called function can change its callers’ locals. Trade-off: a called subprogram can use its caller’s variables without passing parameters, which makes it easier to avoid globals.',
        source: 'Slides 5.2, slides 23-26; Post Test Names Q4' },
      { id: 'x-argue-maxlen', lecture: '5.1',
        prompt: 'Should a language set a maximum length for names? Argue it.',
        answer: 'No (or only a generous one). Criterion: readability. numberOfStudentsEnrolled says what it holds; early Fortran’s 6-character limit forced names like NSTENR. Trade-off: cost. A limit made early compilers and linkers simpler (fixed-size symbol-table entries), which is why C only promises a minimum number of significant characters.',
        source: 'Slides 5.1, slide 9 (design issue: length)' },
      { id: 'x-argue-reserved', lecture: '5.1',
        prompt: 'Should a language’s special words be reserved words, or keywords that are special only in context (as in Fortran)? Argue it.',
        answer: 'Reserved. Criterion: readability. With keywords, Fortran accepts  INTEGER REAL  and  REAL INTEGER : a variable named REAL of type integer and one named INTEGER of type real. Trade-off: reserved words take names away from the programmer (no variable called class), and adding a reserved word in a later version breaks old programs that used it as a name.',
        source: 'Slides 5.1, slide 8 (the Fortran example is Sebesta ch. 5)' },
      { id: 'x-argue-nested', lecture: '5.2',
        prompt: 'Should a language allow nested function definitions (as Python, JavaScript and Scheme do)? Argue it.',
        answer: 'Yes. Criterion: writeability and support for abstraction. A helper that only one function uses can be hidden inside it and can read that function’s locals:  def area(r):  def sq(): return r * r … . Trade-off: nested static scopes are harder to read (which x is this? follow the static ancestors) and to implement; C leaves them out.',
        source: 'Slides 5.2, slide 19 (nested methods create nested static scopes)' },
      { id: 'x-argue-assignexpr', lecture: '10',
        prompt: 'Should assignment be an expression with a value (as in C), or only a statement? Argue it.',
        answer: 'Only a statement. Criterion: reliability.  if (userNum = favNum)  is legal C and is true for any nonzero favNum, a bug that looks like a comparison. Trade-off: writeability.  a = b = 0;  and  while ((c = getchar()) != EOF)  are compact idioms that need assignment to have a value.',
        source: 'Slides 10, slide 8' },
    ].map(c => Object.assign({
      type: 'recall',
      points: ARGUE,
      why: 'Either side earns the marks if it is justified. Check your answer against the four points, not against this model argument.',
    }, c, { source: c.source + ' (prompt is a practice item; model argument written from the course criteria)' })),
  ];

  // Fill-ins on the student slides. Answers are the owner's, from lecture notes.
  // "…" marks a neighbouring blank on the same line.
  const B = (lecture, slide, prompt) => ({ lecture, slide, prompt });
  const blankList = [
    B('1', 5, 'A Turing-complete language needs ____ instructions.'),
    B('1', 5, 'Turing complete: … instructions, first sub-point: ____'),
    B('1', 5, 'Turing complete: … instructions, second sub-point: ____'),
    B('1', 5, 'A Turing-complete language needs ____ to instructions.'),
    B('1', 5, 'Turing complete, 5th item on slide 5: ____'),
    B('1', 5, 'Turing complete, 6th item on slide 5: ____'),
    B('1', 5, 'Turing complete: information is ____'),
    B('1', 13, 'Simplicity: ____ of features and constructs'),
    B('1', 13, 'Simplicity: ____ feature multiplicity'),
    B('1', 13, 'Simplicity: ____ operator overloading'),
    B('1', 13, 'Orthogonality: a small set of primitive constructs ____'),
    B('1', 13, 'Orthogonality: every possible combination ____'),
    B('1', 13, 'Orthogonality: ____ to rules'),
    B('1', 14, 'Data types (sub-criterion): ____'),
    B('1', 14, 'Syntax design: special words, e.g. ____'),
    B('1', 14, 'Syntax design: ____ compound statements'),
    B('1', 14, 'Syntax design: meaningful ____'),
    B('1', 15, 'Support for abstraction: define and use complex structures/operations in ways that allow ____'),
    B('1', 15, 'Expressivity: a short command does lots of ____'),
    B('1', 16, 'Type checking: ____ check that … of variables is correct'),
    B('1', 16, 'Type checking: … check that ____ of variables is correct'),
    B('1', 16, 'Exception handling: intercept ____ and take … measures'),
    B('1', 16, 'Exception handling: intercept … and take ____ measures'),
    B('1', 16, 'Restricted aliasing: aliasing = ____ for the same memory location'),
    B('1', 17, 'Portability: ease of moving code ____'),
    B('1', 19, 'Procedural (imperative): central features are ____'),
    B('1', 19, 'Functional: computation by ____'),
    B('1', 19, 'Logic: ____'),
    B('1', 19, 'Object-oriented: forced organization into ____'),

    B('2', 2, 'First computer (Difference Engine 1832, Analytical Engine 1834), by ____'),
    B('2', 2, 'The first programmer was ____'),
    B('2', 4, 'Hardware programming (ENIAC): ____ connections'),
    B('2', 4, 'Hardware programming (ENIAC): ____ wheels and cranks'),
    B('2', 4, 'Hardware programming (ENIAC): ____ (written on paper, to tell operators what to do)'),
    B('2', 5, 'Von Neumann: put the program ____'),
    B('2', 8, 'Fortran on paper (1954), first point: ____'),
    B('2', 8, 'Fortran on paper (1954): variable names with up to ____ letters'),
    B('2', 8, 'Fortran on paper (1954): no ____'),
    B('2', 8, 'Fortran on paper (1954): … to claim ____ the old system of hand coding machine language'),
    B('2', 9, 'Fortran I’s badge (the box on slide 9): ____ Programming Language'),
    B('2', 9, 'Fortran I (1957): ____ (the first bullet)'),
    B('2', 9, 'Fortran I: variable names up to ____ characters'),
    B('2', 9, 'Fortran I: no ____'),
    B('2', 9, 'Fortran I: beginning ____ were integer names'),
    B('2', 9, 'Fortran I: programs limited to ____ lines, …'),
    B('2', 9, 'Fortran I: programs limited to … lines, ____'),
    B('2', 10, 'Fortran I: programs were stored ____'),
    B('2', 11, 'Fortran II (1958): independent ____'),
    B('2', 12, 'Fortran IV (1962): ____ (… 1966)'),
    B('2', 12, 'Fortran IV (1962): … (____ 1966)'),
    B('2', 12, 'Fortran IV: explicit ____'),
    B('2', 12, 'Fortran IV: subprogram names could be ____'),
    B('2', 13, 'Fortran 77, third point: ____'),
    B('2', 13, 'Fortran 77, fourth point: ____'),
    B('2', 13, 'Fortran 77: first time ____ could be used'),
    B('2', 14, 'Fortran 90: ____ arrays'),
    B('2', 14, 'Fortran 90, third point: ____'),
    B('2', 14, 'Fortran 90, fourth point: ____'),
    B('2', 14, 'Fortran 90, fifth point: ____'),
    B('2', 14, 'Fortran 90: parameter ____'),
    B('2', 15, 'Fortran current status, second point: ____'),
    B('2', 15, 'Fortran’s main competitors: ____'),
    B('2', 17, 'LISP was motivated by AI; first blank under it: ____'),
    B('2', 17, 'LISP motivation, second blank: ____'),
    B('2', 18, '1958: John McCarthy investigates ____'),
    B('2', 18, 'McCarthy needed ____ of algebraic expressions (so needed recursion and conditionals)'),
    B('2', 19, 'Pure Lisp, first kind of data: ____ (e.g. grizzly)'),
    B('2', 19, 'Pure Lisp, second kind of data: ____ (e.g. (lynx (grizzly black) moose …))'),
    B('2', 19, 'Pure Lisp, the one kind of computation: ____'),
    B('2', 20, 'Pure Lisp with no loops: does it break Turing completeness? First point: ____'),
    B('2', 20, 'Pure Lisp Turing completeness, second point: ____'),
    B('2', 20, 'Pure Lisp Turing completeness, third point: ____'),
    B('2', 21, 'Pure Lisp built-ins, list access: ____'),
    B('2', 21, 'Pure Lisp built-ins, list construction: ____'),
    B('2', 21, 'Pure Lisp built-ins, stop evaluation: ____'),
    B('2', 21, 'Pure Lisp built-ins, force evaluation: ____'),
    B('2', 21, 'Pure Lisp built-ins, condition: ____'),
    B('2', 22, 'Lisp’s badge (the box on slide 22): ____ Programming Language'),
    B('2', 22, '1959: Steve Russell implemented ____ on the IBM 704'),
    B('2', 22, '1962: the first Lisp ____ by Tim Hart and Mike Levin'),
    B('2', 22, '1973: the first ____ by Richard Greenblatt and Thomas Knight'),
    B('2', 24, 'Lisp current status: ____, still leader for …'),
    B('2', 24, 'Lisp current status: …, still leader for ____'),
    B('2', 24, 'Lisp’s competitor: ____'),
    B('2', 25, 'Algol’s badge (the box on slide 25, words before and after): ____'),
    B('2', 25, 'Algol’s goal: ____'),
    B('2', 25, 'Algol was designed by ____'),
    B('2', 25, 'Most programming languages around today ____ (Algol)'),
    B('2', 27, 'Algol subgoal 1: ____'),
    B('2', 27, 'Algol subgoal 2: ____'),
    B('2', 27, 'Algol subgoal 3: ____'),
    B('2', 28, 'Algol problem: ____ for decimal point?'),
    B('2', 28, 'Algol was meant to be an international language (____)'),
    B('2', 28, 'The U.S. developed its own group-driven language instead: ____'),
    B('2', 29, 'Algol contribution: concept of ____ formalized'),
    B('2', 29, 'Algol contribution: identifier names ____'),
    B('2', 29, 'Algol contribution: arrays could have ____ subscripts'),
    B('2', 29, 'Algol contribution: parameters separated by ____ (in & out)'),
    B('2', 29, 'Algol contribution: subscripts were placed in ____'),
    B('2', 30, 'Algol contribution: ____ structure'),
    B('2', 30, 'Algol contribution: IF had an ____ clause'),
    B('2', 30, 'Algol contribution: ____ as a statement separator'),
    B('2', 30, 'Algol contribution: assignment operator ____ (and not …)'),
    B('2', 30, 'Algol contribution: ____ in a nonfunctional language'),
    B('2', 31, 'Algol contribution: ____ array allocation (on the stack)'),
    B('2', 31, 'Algol contribution: formal ____ specification (led to general parsers)'),
    B('2', 32, 'Algol’s quick death: no ____ (left out because of machine dependence)'),
    B('2', 32, 'Algol’s quick death: hard to understand ____ (Backus-Naur Form)'),
    B('2', 32, 'Algol 68 made a ____'),
    B('2', 34, 'COBOL’s badge (the box on slide 34): ____ Programming Language'),
    B('2', 34, 'COBOL (Grace Hopper): move towards ____, away from …'),
    B('2', 34, 'COBOL: 1959, by ____'),
    B('2', 34, 'COBOL: ____ influenced any other languages'),
    B('2', 35, 'COBOL goal: must look like ____'),
    B('2', 35, 'COBOL goal: managers should be able to ____'),
    B('2', 35, 'COBOL goal: must be ____'),
    B('2', 36, 'COBOL contribution: first ____ in a high-level language'),
    B('2', 36, 'COBOL contribution: first implementation of ____ (prompted structs in C)'),
    B('2', 36, 'COBOL contribution: long names (up to ____ characters), with hyphens'),
    B('2', 36, 'COBOL contribution: separate ____'),
    B('2', 37, 'COBOL’s quick success: mandated by ____'),
    B('2', 40, 'Prolog is based on ____'),
    B('2', 40, 'Prolog: program by ____ and setting up …'),
    B('2', 40, 'Prolog: program by … and setting up ____'),
    B('2', 41, '1982: the Japanese ____ project (Prolog)'),
    B('2', 41, 'Prolog: ____ at run-time'),

    B('4', 6, 'Terminology: alphabet = ____'),
    B('4', 6, 'Terminology: lexeme = ____ (e.g. *, +, if, begin)'),
    B('4', 6, 'Terminology: token = ____ (e.g. identifier, reserved word, operator, number)'),
    B('4', 6, 'Terminology: sentence = ____, making an …'),
    B('4', 6, 'Terminology: language = all possible sentences = ____'),
    B('4', 9, 'BNF (Backus & Chomsky, independently): a ____ for programming languages'),
    B('4', 10, 'BNF description = ____ = collection of rules'),
    B('4', 10, 'Each BNF rule: is ____'),
    B('4', 10, 'BNF rule: the LHS must be a ____'),
    B('4', 10, 'BNF rule: the RHS contains ____'),
    B('4', 11, 'Start symbol: the nonterminal ____'),
    B('4', 11, 'Derivation: sequence of rules ____'),
    B('4', 14, 'Ambiguous grammar (first line of the definition): ____'),
    B('4', 18, 'Unambiguous associativity: don’t allow as much ____'),

    B('5.1', 2, 'Names = identifiers: an abstraction of ____'),
    B('5.1', 2, 'Names are for ____ (e.g. stuName = “Jackie”)'),
    B('5.1', 2, 'Names are for ____ (e.g. the label evenNum:)'),
    B('5.1', 2, 'Names are for ____ (e.g. sumToN(12))'),
    B('5.1', 11, 'Attributes are ____'),
    B('5.1', 12, 'Binding: an association between ____'),
    B('5.1', 12, 'Binding time: ____'),
    B('5.1', 13, 'Binding at language design time, e.g. ____'),
    B('5.1', 13, 'Binding at language implementation time, e.g. ____'),
    B('5.1', 13, 'Binding at compile time, e.g. ____'),
    B('5.1', 13, 'Binding at load time, e.g. ____'),
    B('5.1', 13, 'Binding at run time, e.g. ____'),
    B('5.1', 20, 'Value: what goes ____'),
    B('5.1', 23, 'Lifetime = time in which a ____ is bound to a particular …'),

    B('5.2', 3, 'Lifetime: time in which a name is bound to ____'),
    B('5.2', 3, 'Lifetime: ____ a memory cell is occupied by the value of the name'),
    B('5.2', 4, 'Static lifetime: a binding to memory cell(s) ____ execution begins and remains … execution'),
    B('5.2', 4, 'Static lifetime: a binding … and remains ____ execution'),
    B('5.2', 5, 'Static lifetime advantage: ____'),
    B('5.2', 5, 'Static lifetime: all addressing ____; no … allocation'),
    B('5.2', 5, 'Static lifetime disadvantage: ____'),
    B('5.2', 5, 'Static lifetime: that memory is always used; can’t do ____'),
    B('5.2', 5, 'Static lifetime: what if ____ before run-time?'),
    B('5.2', 5, 'Static lifetime: ____ difficult'),
    B('5.2', 7, 'Stack-dynamic: storage bindings are created when ____'),
    B('5.2', 7, 'Stack-dynamic, e.g. ____ in most languages such as Java and C'),
    B('5.2', 8, 'Stack-dynamic advantage 1: ____'),
    B('5.2', 8, 'Stack-dynamic advantage 2: ____'),
    B('5.2', 8, 'Stack-dynamic advantage 3: ____'),
    B('5.2', 8, 'Stack-dynamic disadvantage: time required for ____'),
    B('5.2', 8, 'Stack-dynamic disadvantage: confusion between ____'),
    B('5.2', 9, 'Explicit heap: allocated and deallocated by ____'),
    B('5.2', 9, 'Explicit heap: accessed only by ____'),
    B('5.2', 9, 'Explicit heap, in C: items made with ____ and collected with …'),
    B('5.2', 10, 'Explicit heap advantage: can make items where ____'),
    B('5.2', 10, 'Explicit heap disadvantage: ____'),
    B('5.2', 10, 'Explicit heap disadvantage: cost of ____'),
    B('5.2', 11, 'Implicit heap: allocation and deallocation ____'),
    B('5.2', 12, 'Implicit heap advantage: easy on ____'),
    B('5.2', 12, 'Implicit heap disadvantage: slows ____'),
    B('5.2', 12, 'Implicit heap disadvantage: loss of ____ (because no type checking)'),
    B('5.2', 12, 'Implicit heap disadvantage: complexity of ____'),
    B('5.2', 17, 'C89, Pascal: all declarations at ____'),
    B('5.2', 17, 'C89, Pascal: scope of a local variable is ____'),
    B('5.2', 17, 'C99, Java: declarations ____'),
    B('5.2', 17, 'C99, Java: scope of a local variable is from ____'),
    B('5.2', 18, 'Static scope search: first ____'),
    B('5.2', 18, 'Static scope search: then in ____, until one is found'),
    B('5.2', 18, 'Enclosing blocks are called ____'),
    B('5.2', 18, 'The nearest static ancestor is called the ____'),
    B('5.2', 20, 'Scope hole: hidden by having a ____ name that is …'),
    B('5.2', 22, 'Globals are handy for, e.g. ____'),
    B('5.2', 22, 'Globals: get ____'),
    B('5.2', 25, 'Static scoping advantage: ____ do this'),
    B('5.2', 25, 'Static scoping: can just ____ at the program to know what a variable is'),
    B('5.2', 25, 'Static scoping disadvantage: people ____'),
    B('5.2', 26, 'Dynamic scoping advantage: ____ to make it easier to avoid globals'),
    B('5.2', 26, 'Dynamic scoping disadvantage: ____ at the program what the variable is'),
    B('5.2', 26, 'Dynamic scoping disadvantage: ____, so harder to learn/program'),
    B('5.2', 29, 'Named constant: a “variable” bound to a value only ____'),
    B('5.2', 29, 'Named constants, advantage: ____'),
    B('5.2', 30, 'Named constant values can be bound ____ (called … constants)'),
    B('5.2', 30, 'Statically bound named constants are called ____ constants'),
  ];
  // Ids hash the prompt text, so inserting or reordering blanks never re-points a
  // saved answer at a different blank (editing a prompt's text does orphan its answer).
  function fnv1a(s) {
    let h = 0x811c9dc5;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    return h.toString(36);
  }
  const blanks = blankList.map(b => Object.assign({ id: `b${b.lecture}-${b.slide}-${fnv1a(b.prompt)}` }, b));

  (FC.decks = FC.decks || {}).csc370 = {
    id: 'csc370',
    title: 'CSC 370 · Programming Languages', short: 'CSC 370',
    lectures: [
      { n: '1', title: 'Intro: what makes a language good' },
      { n: '2', title: 'History of programming languages' },
      { n: '3', title: 'C' },
      { n: '4', title: 'Translation: compilers and grammars' },
      { n: '5.1', title: 'Names, binding, type, address' },
      { n: '5.2', title: 'Lifetime and scope' },
      { n: '10', title: 'Control structures' },
    ],
    cards,
    blanks,
  };
})(globalThis.FC = globalThis.FC || {});
