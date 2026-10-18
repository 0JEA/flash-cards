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
    { id: 'l1-pl-def', lecture: '1', type: 'recall', mode: 'write',
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
      points: ['No: no conditional repetition (loops), so not Turing complete'],
      why: 'Conditional repetition is one of the requirements for Turing completeness.',
      source: 'Pre Test #1 Q4; Intro to PL Q3' },
    { id: 'l1-criteria', lecture: '1', type: 'recall', mode: 'write',
      prompt: 'Name the four top-level criteria for judging whether a language is good.',
      answer: 'Reliability, cost, readability, writeability.',
      points: ['reliability', 'cost', 'readability', 'writeability'],
      why: 'Every sub-criterion (simplicity, orthogonality, type checking, …) feeds one of these four.',
      source: 'Slides 1, slide 11' },
    { id: 'l1-subcriteria-all', lecture: '1', type: 'recall', mode: 'write',
      prompt: 'Name all twelve sub-criteria used to judge a language.',
      answer: 'Simplicity, orthogonality, data types, syntax design, support for abstraction, expressivity; type checking, exception handling, restricted aliasing, run-time speed, portability, security.',
      points: ['simplicity', 'orthogonality', 'data types', 'syntax design', 'support for abstraction', 'expressivity', 'type checking', 'exception handling', 'restricted aliasing', 'run-time speed', 'portability', 'security'],
      why: 'The list is fixed, so the answer is the same every time. The first six mostly shape readability and writeability; the last six mostly reliability and cost. Each one also has its own definition card.',
      source: 'Slides 1, slide 12 (replaces the old “name any four” card)' },
    { id: 'l1-simplicity', lecture: '1', type: 'recall',
      prompt: 'A language offers count++, count += 1 and count = count + 1. Which property of simplicity does that break?',
      answer: 'Minimal feature multiplicity: there should be few ways to do the same thing.',
      points: ['Minimal feature multiplicity: there should be few ways to do the same thing.'],
      why: 'Each extra way of saying the same thing is one more thing a reader must know.',
      source: 'Slides 1, slide 13 (blank wording from Sebesta ch. 1; merges three slide blanks)' },
    { id: 'l1-simplicity-q2', lecture: '1', type: 'recall',
      prompt: 'For simplicity, how large should a language’s set of features and constructs be?',
      answer: 'Manageable (small).',
      points: ['Manageable (small).'],
      why: 'In a huge language each programmer learns a different subset, then reads code written in a subset they never learned.',
      source: 'Slides 1, slide 13 (blank wording from Sebesta ch. 1; merges three slide blanks) (split from l1-simplicity)' },
    { id: 'l1-simplicity-q3', lecture: '1', type: 'recall',
      prompt: 'Which property of simplicity is broken when one operator symbol is given many meanings?',
      answer: 'Minimal operator overloading.',
      points: ['Minimal operator overloading.'],
      why: 'A reader seeing the symbol can no longer tell which meaning is in play.',
      source: 'Slides 1, slide 13 (blank wording from Sebesta ch. 1; merges three slide blanks) (split from l1-simplicity)' },
    { id: 'l1-orthogonality', lecture: '1', type: 'recall',
      prompt: 'In an orthogonal language, how is a small set of primitive constructs used to build the control and data structures?',
      answer: 'They are combined in a relatively small number of ways.',
      points: ['They are combined in a relatively small number of ways.'],
      why: 'Orthogonal = the features are independent, so knowing the parts tells you every combination.',
      source: 'Slides 1, slide 13 (blank wording from Sebesta ch. 1; merges three slide blanks)' },
    { id: 'l1-orthogonality-q2', lecture: '1', type: 'recall',
      prompt: 'In an orthogonal language, which combinations of its primitive constructs are legal?',
      answer: 'Every possible combination.',
      points: ['Every possible combination.'],
      why: 'In C, a function may return a struct but not an array: one illegal combination, so C is not fully orthogonal.',
      source: 'Slides 1, slide 13 (blank wording from Sebesta ch. 1; merges three slide blanks) (split from l1-orthogonality)' },
    { id: 'l1-orthogonality-q3', lecture: '1', type: 'recall',
      prompt: 'In an orthogonal language, how many exceptions are there to the rules for combining constructs?',
      answer: 'Few or none.',
      points: ['Few or none.'],
      why: 'Every exception is one more thing the programmer has to remember.',
      source: 'Slides 1, slide 13 (blank wording from Sebesta ch. 1; merges three slide blanks) (split from l1-orthogonality)' },
    { id: 'l1-orthog-example', lecture: '1', type: 'recall',
      prompt: 'In C, a function may return a struct but not an array. Which sub-criterion does this rule break, and how?',
      answer: 'Orthogonality: “return type” and “array” are both legal constructs, but this one combination of them is not, so it is an exception the programmer has to remember.',
      points: ['orthogonality: one combination of two legal constructs is illegal (an exception)'],
      why: 'Classifying an example is how definitions transfer to new questions.',
      source: 'Sebesta ch. 1 example (not in her slides)' },
    { id: 'l1-syntax-design', lecture: '1', type: 'recall',
      prompt: 'Which aspect of syntax design is about writing end if / end loop instead of a closing brace?',
      answer: 'How compound statements are formed.',
      points: ['How compound statements are formed.'],
      why: 'A closing brace says “something ended”; end loop says what ended.',
      source: 'Slides 1, slide 14 (blank wording from Sebesta ch. 1; merges three slide blanks)' },
    { id: 'l1-syntax-design-q2', lecture: '1', type: 'recall',
      prompt: 'Which aspect of syntax design covers words such as while, class and for?',
      answer: 'Special (reserved) words.',
      points: ['Special (reserved) words.'],
      why: 'They mark where constructs begin, which helps readability.',
      source: 'Slides 1, slide 14 (blank wording from Sebesta ch. 1; merges three slide blanks) (split from l1-syntax-design)' },
    { id: 'l1-syntax-design-q3', lecture: '1', type: 'recall',
      prompt: 'Which aspect of syntax design asks that a construct’s form show what it does?',
      answer: 'Meaningful keywords (form shows meaning).',
      points: ['Meaningful keywords (form shows meaning).'],
      why: '',
      source: 'Slides 1, slide 14 (blank wording from Sebesta ch. 1; merges three slide blanks) (split from l1-syntax-design)' },
    { id: 'l1-type-checking', lecture: '1', type: 'recall',
      prompt: 'Define type checking as a language criterion.',
      answer: 'The compiler (or the run-time system) checks that each variable is used in a way that is correct for its type.',
      points: ['The compiler (or the run-time system) checks that each variable is used in a way that is correct for its type.'],
      why: 'It feeds reliability: type errors are caught instead of silently producing garbage.',
      source: 'Slides 1, slide 16 (blank wording from Sebesta ch. 1; merges two slide blanks)' },
    { id: 'l1-exception-handling', lecture: '1', type: 'recall',
      prompt: 'Define exception handling as a language criterion.',
      answer: 'The program intercepts run-time errors (unusual conditions) and takes corrective measures, so it can continue.',
      points: ['The program intercepts run-time errors (unusual conditions) and takes corrective measures, so it can continue.'],
      why: 'It feeds reliability.',
      source: 'Slides 1, slide 16 (blank wording from Sebesta ch. 1; merges two slide blanks)' },
    { id: 'l1-why-study', lecture: '1', type: 'recall', mode: 'write',
      prompt: 'Give the six reasons the course gives for studying programming languages.',
      answer: 'Better ability to express ideas; choosing the appropriate language(s); learning new languages; seeing how the way a language is implemented has consequences for the programmer; better use of the languages you already know; advancing computational thinking.',
      points: ['better ability to express ideas', 'choose appropriate language(s)', 'learn new languages', 'how a language is implemented has consequences for the programmer', 'better use of languages you already know', 'advancement of computational thinking'],
      why: 'The list is fixed, in the order the slides give it.',
      source: 'Slides 1, slides 8-10' },
    { id: 'l1-readwrite', lecture: '1', type: 'recall',
      prompt: 'Considering only how the condition is written, which of these two conditionals is more readable, and for whom?',
      code: `In Pascal                      In Java
if kiwi > orange then          if (kiwi > orange)
   WriteLn('CLOUDS')              System.out.println("CLOUDS");
else if kiwi = orange then     else if (kiwi == orange)
   WriteLn('WINDY')               System.out.println("WINDY");
else                           else
   WriteLn('SUNNY')               System.out.println("SUNNY");`,
      answer: 'Pascal, for beginners: it reads more like English (the word “then”, no brackets around the condition). Experienced programmers find the two about equally readable.',
      points: ['Pascal is more English-like (then, no brackets), which helps beginners most'],
      why: 'Her key separates readability, writeability and the verdict into three parts; so do these cards.',
      source: 'Intro to PL answer key, Q1a' },
    { id: 'l1-readwrite-w', lecture: '1', type: 'recall',
      prompt: 'Considering only how the condition is written, which of these two conditionals is more writeable, and why?',
      code: `In Pascal                      In Java
if kiwi > orange then          if (kiwi > orange)
   WriteLn('CLOUDS')              System.out.println("CLOUDS");
else if kiwi = orange then     else if (kiwi == orange)
   WriteLn('WINDY')               System.out.println("WINDY");
else                           else
   WriteLn('SUNNY')               System.out.println("SUNNY");`,
      answer: 'Java may be: it needs two fewer characters per condition, and we write a great many conditionals. Against that: forgetting a bracket means going back to insert it, while in Pascal you just type “then” at the end.',
      points: ['Java: two fewer characters per condition, and conditionals are frequent'],
      why: 'A writeability argument is about the effort of producing the code, not reading it.',
      source: 'Intro to PL answer key, Q1b' },
    { id: 'l1-readwrite-which', lecture: '1', type: 'recall', mode: 'write',
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
      prompt: 'Which of the course’s four language categories is also called imperative?',
      answer: 'Procedural.',
      points: ['Procedural.'],
      why: 'The four categories: procedural (imperative), functional, logic, object-oriented. The language cards ask the other three.',
      source: 'Slides 1, slide 19' },
    { id: 'l1-classify', lecture: '1', type: 'recall',
      prompt: 'Which language category does Prolog belong to?',
      answer: 'Logic.',
      points: ['Logic.'],
      why: 'Prolog states what is true (facts and rules) and you query it.',
      source: 'Slides 1, slide 19; Pre Test #1 key (replaces the two one-language MC cards)' },
    { id: 'l1-classify-q2', lecture: '1', type: 'recall',
      prompt: 'Which language category does C belong to?',
      answer: 'Procedural (imperative).',
      points: ['Procedural (imperative).'],
      why: '',
      source: 'Slides 1, slide 19; Pre Test #1 key (replaces the two one-language MC cards) (split from l1-classify)' },
    { id: 'l1-classify-q3', lecture: '1', type: 'recall',
      prompt: 'Which language category does Scheme belong to?',
      answer: 'Functional.',
      points: ['Functional.'],
      why: 'Scheme computes by applying functions.',
      source: 'Slides 1, slide 19; Pre Test #1 key (replaces the two one-language MC cards) (split from l1-classify)' },
    { id: 'l1-classify-q4', lecture: '1', type: 'recall',
      prompt: 'Which language category does Java belong to?',
      answer: 'Object-oriented.',
      points: ['Object-oriented.'],
      why: '',
      source: 'Slides 1, slide 19; Pre Test #1 key (replaces the two one-language MC cards) (split from l1-classify)' },
    { id: 'l1-tradeoff', lecture: '1', type: 'recall',
      prompt: 'Java refuses array indices that go out of bounds; C allows them. Which criteria trade off against each other here?',
      answer: 'Reliability (and security) against run-time speed: Java checks every index at run time, which costs time; C skips the check, which is faster but lets bugs and attacks through.',
      points: ['reliability (and security) against run-time speed'],
      why: 'Almost every language feature buys one criterion by spending another.',
      source: 'Slides 1, slide 18 (the slide gives the example; the explanation follows Sebesta ch. 1, not the handout)' },

    // ───────────── Lecture 2: history ─────────────
    { id: 'l2-bigfour', lecture: '2', type: 'recall', mode: 'write',
      prompt: 'What are the “big four” original programming languages?',
      answer: 'FORTRAN, LISP, Algol, COBOL.',
      points: ['FORTRAN', 'LISP', 'Algol', 'COBOL'],
      why: 'All four come from the late 1950s and most later languages descend from them.',
      source: 'History post-test, Q1' },
    { id: 'l2-eniac-how', lecture: '2', type: 'recall',
      prompt: 'How was ENIAC programmed?',
      answer: 'By moving cords (cables) and turning knobs.',
      points: ['By moving cords (cables) and turning knobs.'],
      why: 'There was no stored program yet: programming meant rewiring.',
      source: 'History post-test, Q2b' },
    { id: 'l2-eniac-how-q2', lecture: '2', type: 'recall',
      prompt: 'ENIAC was programmed by rewiring. Where were its instructions often written down for the operators?',
      answer: 'On paper.',
      points: ['On paper.'],
      why: '',
      source: 'History post-test, Q2b (split from l2-eniac-how)' },
    { id: 'l2-eniac-women', lecture: '2', type: 'recall',
      prompt: 'Why was ENIAC programmed mostly by women?',
      answer: 'More of the men were in the army and navy, during WWII and just after the war.',
      points: ['More of the men were in the army and navy, during WWII and just after the war.'],
      why: '',
      source: 'History post-test, Q2c' },
    { id: 'l2-vonneumann', lecture: '2', type: 'recall',
      prompt: 'What was John von Neumann’s main contribution to programming ENIAC and later computers?',
      answer: 'The stored program: the program can be stored in memory just like the data it manipulates.',
      points: ['The stored program: the program can be stored in memory just like the data it manipulates.'],
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
      points: ["LISP","Prolog"], mode: 'quick',
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
    { id: 'l2-newest', lecture: '2', type: 'mc', noRecall: true,
      prompt: 'Which of these languages is the newest?',
      answer: 'Python', options: ['Prolog', 'COBOL', 'LISP'],
      why: 'Python 1991; Prolog 1972; COBOL 1959; LISP 1958. Her key marks Python “newest” from a list that also had C and Java. Strictly, Java (1995) is newer than Python (1991), so this card leaves Java out; if her test lists both, her key says Python.',
      source: 'History post-test, Q3 (dates: standard history, not her slides)' },
    { id: 'l2-plankalkul', lecture: '2', type: 'recall',
      prompt: 'Who designed Plankalkül?',
      answer: 'Konrad Zuse.',
      points: ['Konrad Zuse.'],
      why: 'Plankalkül (“Program Calculus”, 1945, published 1972) shows the ideas were there long before the big four.',
      source: 'Slides 2, slide 3 (“never implemented at the time” follows Sebesta)' },
    { id: 'l2-plankalkul-q2', lecture: '2', type: 'recall',
      prompt: 'What was Konrad Zuse’s Plankalkül?',
      answer: 'An early high-level language design (1945), never implemented at the time.',
      points: ['An early high-level language design (1945), never implemented at the time.'],
      why: 'It already had floating point, arrays and records; it simply was not published or built.',
      source: 'Slides 2, slide 3 (“never implemented at the time” follows Sebesta) (split from l2-plankalkul)' },
    { id: 'l2-fortran-acronym', lecture: '2', type: 'typed',
      prompt: 'What does FORTRAN stand for?',
      answer: 'FORmula TRANslation', accept: ['formula translator'],
      why: 'It translated mathematical formulas into machine code.',
      source: 'Slides 2, slide 8' },
    { id: 'l2-ibm704', lecture: '2', type: 'recall',
      prompt: 'Fortran was designed for the IBM 704. What made that machine special?',
      answer: 'It was the first computer with floating-point hardware.',
      points: ['first computer with floating-point hardware'],
      why: 'With floating point in hardware, the interpretive overhead of earlier systems was no longer hidden, so compiled code had to be fast. (Strictly, the first mass-produced one: a few experimental machines had it earlier.)',
      source: 'Slides 2, slide 8 (the “why” follows Sebesta, not the handout)' },
    { id: 'l2-fortran-goal', lecture: '2', type: 'recall',
      prompt: 'What was Fortran I’s main goal?',
      answer: 'Machine code generated as good as machine code someone could write by hand.',
      points: ['compiled code as good as hand-written machine code'],
      why: 'Programmers would only abandon hand coding if the compiler’s output was as fast.',
      source: 'Slides 2, slide 9' },
    { id: 'l2-fortran-1954', lecture: '2', type: 'recall',
      prompt: 'The 1954 Fortran report made a wildly over-optimistic claim about programmers’ mistakes. What was it?',
      answer: 'That Fortran would eliminate coding errors and debugging.',
      points: ['That Fortran would eliminate coding errors and debugging.'],
      why: 'Its other claim, compiled code as efficient as hand-coded machine code, was the real design goal, and Fortran I nearly met it.',
      source: 'Slides 2, slide 8 (blank wording from Sebesta ch. 2; merges three slide blanks)' },
    { id: 'l2-fortran-typing', lecture: '2', type: 'recall',
      prompt: 'In Fortran I, how did a variable get its type?',
      answer: 'From its name (there were no type declarations): names starting with I, J, K, L, M or N were integers; all others were reals.',
      points: ['from the first letter: I to N integer, all others real'],
      why: 'Fortran IV later added explicit type declarations.',
      source: 'Slides 2, slide 9 (merges two slide blanks)' },
    { id: 'l2-fortran-if', lecture: '2', type: 'recall',
      prompt: 'Fortran I’s IF statement was 3-way. What were the three branches?',
      answer: 'Negative, zero and positive (the sign of the tested expression).',
      points: ["Negative","zero","positive (the sign of the tested expression)"], mode: 'quick',
      why: 'IF (expr) n1, n2, n3 jumped to one of three labels.',
      source: 'Slides 2, slide 9' },
    { id: 'l2-fortran-sub', lecture: '2', type: 'recall',
      prompt: 'Fortran I had subroutines, with two limits. What were they?',
      answer: 'They could not be external (separately compiled) and could not be recursive.',
      points: ["They could not be external (separately compiled)","could not be recursive"], mode: 'quick',
      why: 'Fortran II (1958) added independent compilation.',
      source: 'Slides 2, slides 9 and 11' },
    { id: 'l2-lisp-origin', lecture: '2', type: 'recall',
      prompt: 'Who designed LISP?',
      answer: 'John McCarthy (at MIT, 1958).',
      points: ['John McCarthy (at MIT, 1958).'],
      why: 'It came out of artificial-intelligence research, which needed lists and recursion.',
      source: 'Slides 2, slides 17-18 and 22' },
    { id: 'l2-lisp-origin-q2', lecture: '2', type: 'recall',
      prompt: 'What does LISP stand for?',
      answer: 'LISt Processing.',
      points: ['LISt Processing.'],
      why: '',
      source: 'Slides 2, slides 17-18 and 22 (split from l2-lisp-origin)' },
    { id: 'l2-lisp-dialects', lecture: '2', type: 'recall',
      prompt: 'What are Lisp’s two main dialects today?',
      answer: 'Common Lisp and Scheme.',
      points: ["Common Lisp","Scheme"], mode: 'quick',
      why: 'More than 20 kinds exist (Clojure, Racket, Emacs Lisp …); Scheme is the one this course uses.',
      source: 'Slides 2, slide 23' },
    { id: 'l2-lisp-status', lecture: '2', type: 'recall',
      prompt: 'For about how long did Lisp dominate artificial intelligence?',
      answer: 'About 25 years.',
      points: ['About 25 years.'],
      why: 'The slide says Lisp is “still leader for” AI. That is the slide’s (dated) claim: in 2026 the AI leader is Python.',
      source: 'Slides 2, slide 24 (the blank wording follows Sebesta; merges three slide blanks)' },
    { id: 'l2-lisp-status-q2', lecture: '2', type: 'recall',
      prompt: 'Which text editor keeps Lisp alive today?',
      answer: 'Emacs (Editor MACroS).',
      points: ['Emacs (Editor MACroS).'],
      why: '',
      source: 'Slides 2, slide 24 (the blank wording follows Sebesta; merges three slide blanks) (split from l2-lisp-status)' },
    { id: 'l2-lisp-status-q3', lecture: '2', type: 'recall',
      prompt: 'What happened to Lisp machines?',
      answer: 'They died out.',
      points: ['They died out.'],
      why: '',
      source: 'Slides 2, slide 24 (the blank wording follows Sebesta; merges three slide blanks) (split from l2-lisp-status)' },
    { id: 'l2-algol-origin', lecture: '2', type: 'recall',
      prompt: 'What was Algol trying to be?',
      answer: 'A universal, machine-independent language for expressing algorithms: one that would work on more than one architecture.',
      points: ['A universal, machine-independent language for expressing algorithms: one that would work on more than one architecture.'],
      why: 'Same era as Lisp and Fortran (late 1950s). Who made it is on the “international committee” card.',
      source: 'Slides 2, slides 25 and 27' },
    { id: 'l2-algol-origin-q2', lecture: '2', type: 'recall',
      prompt: 'What does Algol stand for?',
      answer: 'ALGOrithmic Language.',
      points: ['ALGOrithmic Language.'],
      why: '',
      source: 'Slides 2, slides 25 and 27 (split from l2-algol-origin)' },
    { id: 'l2-algol-subgoals', lecture: '2', type: 'recall',
      prompt: 'Which Algol subgoal is why Algol-style pseudocode is still how algorithms are written down?',
      answer: 'Being good for describing algorithms in publications.',
      points: ['Being good for describing algorithms in publications.'],
      why: 'The second subgoal is why Algol-style pseudocode is still how algorithms are written down.',
      source: 'Slides 2, slide 27 (blank wording from Sebesta ch. 2; merges three slide blanks)' },
    { id: 'l2-algol-subgoals-q2', lecture: '2', type: 'recall',
      prompt: 'Algol’s syntax was meant to be close to which notation?',
      answer: 'Mathematical notation.',
      points: ['Mathematical notation.'],
      why: '',
      source: 'Slides 2, slide 27 (blank wording from Sebesta ch. 2; merges three slide blanks) (split from l2-algol-subgoals)' },
    { id: 'l2-algol-subgoals-q3', lecture: '2', type: 'recall',
      prompt: 'Algol had to be mechanically translatable into what?',
      answer: 'Machine code.',
      points: ['Machine code.'],
      why: '',
      source: 'Slides 2, slide 27 (blank wording from Sebesta ch. 2; merges three slide blanks) (split from l2-algol-subgoals)' },
    { id: 'l2-algol-death', lecture: '2', type: 'recall',
      prompt: 'Which statements did Algol leave out because they are machine dependent, helping it die in the U.S.?',
      answer: 'I/O (input/output) statements.',
      points: ['I/O (input/output) statements.'],
      why: 'Algol died commercially but lived on: most languages today descend from it. (Algol 68 then made a complete redesign.)',
      source: 'Slides 2, slide 32 (the I/O and BNF items fill slide blanks, wording from Sebesta)' },
    { id: 'l2-algol-death-q2', lecture: '2', type: 'recall',
      prompt: 'Why would IBM not support Algol?',
      answer: 'IBM owned Fortran.',
      points: ['IBM owned Fortran.'],
      why: '',
      source: 'Slides 2, slide 32 (the I/O and BNF items fill slide blanks, wording from Sebesta) (split from l2-algol-death)' },
    { id: 'l2-algol-death-q3', lecture: '2', type: 'recall',
      prompt: 'Which part of Algol’s definition was hard to understand, hurting its adoption in the U.S.?',
      answer: 'Its BNF description.',
      points: ['Its BNF description.'],
      why: '',
      source: 'Slides 2, slide 32 (the I/O and BNF items fill slide blanks, wording from Sebesta) (split from l2-algol-death)' },
    { id: 'l2-algol-death-q4', lecture: '2', type: 'recall',
      prompt: 'Besides no I/O, BNF and IBM, what national reason helped Algol die in the U.S.?',
      answer: 'The U.S. wanted its own language.',
      points: ['The U.S. wanted its own language.'],
      why: '',
      source: 'Slides 2, slide 32 (the I/O and BNF items fill slide blanks, wording from Sebesta) (split from l2-algol-death)' },
    { id: 'l2-cobol-hopper', lecture: '2', type: 'recall',
      prompt: 'Who is COBOL most associated with?',
      answer: 'Grace Hopper.',
      points: ['Grace Hopper.'],
      why: 'COBOL chose English over mathematical notation on purpose.',
      source: 'Slides 2, slide 34 (split from the old COBOL card)' },
    { id: 'l2-cobol-hopper-q2', lecture: '2', type: 'recall',
      prompt: 'Which way did Grace Hopper push programming notation?',
      answer: 'Towards English, away from mathematical notation.',
      points: ['Towards English, away from mathematical notation.'],
      why: 'COBOL chose English over mathematical notation on purpose; its first design goal was to look like simple English.',
      source: 'Slides 2, slide 34 (split from the old COBOL card) (split from l2-cobol-hopper)' },
    { id: 'l2-cobol-goals', lecture: '2', type: 'recall',
      prompt: 'Which group of non-programmers was COBOL meant to be readable by?',
      answer: 'Managers.',
      points: ['Managers.'],
      why: 'Every COBOL goal puts the human reader ahead of the compiler writer.',
      source: 'Slides 2, slide 35 (three blanks filled from Sebesta; merges four slide blanks)' },
    { id: 'l2-cobol-goals-q2', lecture: '2', type: 'recall',
      prompt: 'What was COBOL willing to give up in order to be easy to use?',
      answer: 'Power: easy to use, even if less powerful.',
      points: ['Power: easy to use, even if less powerful.'],
      why: '',
      source: 'Slides 2, slide 35 (three blanks filled from Sebesta; merges four slide blanks) (split from l2-cobol-goals)' },
    { id: 'l2-cobol-goals-q3', lecture: '2', type: 'recall',
      prompt: 'What did COBOL aim to do to the base of computer programmers?',
      answer: 'Broaden it.',
      points: ['Broaden it.'],
      why: '',
      source: 'Slides 2, slide 35 (three blanks filled from Sebesta; merges four slide blanks) (split from l2-cobol-goals)' },
    { id: 'l2-cobol-goals-q4', lecture: '2', type: 'recall',
      prompt: 'When choosing its notation, what was COBOL told to ignore?',
      answer: 'What would be hard to implement in the compiler (no preconceptions about it).',
      points: ['What would be hard to implement in the compiler (no preconceptions about it).'],
      why: '',
      source: 'Slides 2, slide 35 (three blanks filled from Sebesta; merges four slide blanks) (split from l2-cobol-goals)' },
    { id: 'l2-cobol-records', lecture: '2', type: 'recall',
      prompt: 'What data-structure idea did COBOL pioneer in a high-level language?',
      answer: 'Hierarchical data structures (records).',
      points: ['Hierarchical data structures (records).'],
      why: 'This is COBOL’s one big influence on later languages.',
      source: 'Slides 2, slide 36 (merges a slide blank)' },
    { id: 'l2-cobol-records-q2', lecture: '2', type: 'recall',
      prompt: 'COBOL’s records prompted which C feature, and what did they eventually lead to?',
      answer: 'Structs in C, and eventually object-oriented programming.',
      points: ['structs in C (then OOP)'],
      why: '',
      source: 'Slides 2, slide 36 (merges a slide blank) (split from l2-cobol-records)' },
    { id: 'l2-prolog-origin', lecture: '2', type: 'recall',
      prompt: 'What does Prolog stand for?',
      answer: 'PROgramming LOGic.',
      points: ['PROgramming LOGic.'],
      why: 'It is non-procedural: you state facts and rules instead of steps.',
      source: 'Slides 2, slide 40' },
    { id: 'l2-prolog-origin-q2', lecture: '2', type: 'recall',
      prompt: 'Roughly when was Prolog created?',
      answer: '1972 (early 1970s).',
      points: ['1972 (early 1970s).'],
      why: '',
      source: 'Slides 2, slide 40 (split from l2-prolog-origin)' },
    { id: 'l2-prolog-how', lecture: '2', type: 'recall',
      prompt: 'How do you write a Prolog program?',
      answer: 'By stating facts and rules (what is true).',
      points: ['By stating facts and rules (what is true).'],
      why: 'Compare the palindrome rule: palindrome(Word) :- …',
      source: 'Slides 2, slide 40 (merges two slide blanks; the “queries” wording is a best guess at her blank)' },
    { id: 'l2-prolog-how-q2', lecture: '2', type: 'recall',
      prompt: 'How do you get answers out of a Prolog program?',
      answer: 'Pose queries (goals), which the system tries to prove.',
      points: ['Pose queries (goals), which the system tries to prove.'],
      why: 'e.g. ?- palindrome(abba).',
      source: 'Slides 2, slide 40 (merges two slide blanks; the “queries” wording is a best guess at her blank) (split from l2-prolog-how)' },
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
      points: ['the condition is an int, not a boolean: a static (compile-time) type error in Java'],
      why: 'C treats any nonzero number as true; Java requires a boolean.',
      source: 'Pre Test on C, Q1d' },
    { id: 'l3-banana-diagram', lecture: '3', type: 'recall',
      prompt: 'Picture the memory diagram (variables with their values in RAM) of this code running. Which boxes does it have, with which values?',
      code: `int banana = 13;
if (++banana - 7){
   printf("Boogy Boogy");
}
else{
   printf("Have a nice day");
}`,
      answer: 'banana | 13 → 14\n(no box for 7: the subtraction’s result is never stored)',
      points: ['one box, banana: 13 crossed out, then 14 (no box for the 7)'],
      why: '++banana stores 14 back into banana before the subtraction; 14 - 7 = 7 is only a temporary value used by the if.',
      source: 'Pre Test on C, Q1a (4 marks; the key leaves the diagram blank, so this follows her C exam’s diagram style)' },

    // ── C & memory: her C exam (32 marks) is memory diagrams, a pointer function, malloc/free ──
    // Diagram cards use her exam's conventions: the stack is drawn newest on top, an
    // unknown address is ?, a pointer's value is an arrow, and old values are crossed out.
    { id: 'l3-exam-q1-diagram', lecture: '3', type: 'recall', mode: 'write',
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
    { id: 'l3-exam-q2-diagram', lecture: '3', type: 'recall', mode: 'write',
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
    { id: 'l3-exam-q3-diagram', lecture: '3', type: 'recall', mode: 'write',
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
      prompt: 'money() sets p = &q, yet x is still 10 afterwards. Why?',
      code: `void money(int *p) {
    int q = 100;
    p = &q;
}
/* in main: */  int x = 10;  money(&x);  printf("%d", x);`,
      answer: 'C passes arguments by value: p is a local copy of x’s address, so p = &q only changes where that copy points, not x.',
      points: ['C passes arguments by value: p is a local copy of x’s address, so p = &q only changes where that copy points, not x.'],
      why: 'Same trap in every “reassign the pointer inside the function” question.',
      source: 'C Language Exam 1 (2026), Q3 (the explanation is standard C, not in her key)' },
    { id: 'l3-why-money-q2', lecture: '3', type: 'recall',
      prompt: 'What statement inside money() would actually change main’s x to 100?',
      code: `void money(int *p) {
    int q = 100;
    p = &q;
}
/* in main: */  int x = 10;  money(&x);  printf("%d", x);`,
      answer: '*p = 100; (an assignment through the pointer).',
      points: ['*p = 100; (an assignment through the pointer).'],
      why: 'Only writing through *p reaches the box p points at.',
      source: 'C Language Exam 1 (2026), Q3 (the explanation is standard C, not in her key) (split from l3-why-money)' },
    { id: 'l3-malloc-free', lecture: '3', type: 'recall',
      prompt: 'Which C function grabs memory dynamically (on the heap)?',
      answer: 'malloc.',
      points: ['malloc.'],
      why: 'Memory from malloc lives on the explicit heap until free is called.',
      source: 'C Language Exam 1 (2026), Q4 (3 marks)' },
    { id: 'l3-malloc-free-q2', lecture: '3', type: 'recall',
      prompt: 'Which C function releases memory grabbed with malloc?',
      answer: 'free.',
      points: ['free.'],
      why: 'In Java, the garbage collector releases heap objects instead.',
      source: 'C Language Exam 1 (2026), Q4 (3 marks) (split from l3-malloc-free)' },
    { id: 'l3-reverse-string', lecture: '3', type: 'recall', mode: 'write',
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
    { id: 'l3-length', lecture: '3', type: 'recall', mode: 'write',
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
    { id: 'l3-count-char', lecture: '3', type: 'recall', mode: 'write',
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
    { id: 'l3-diagram-ptrinc', lecture: '3', type: 'recall', mode: 'write',
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
    { id: 'l3-diagram-swap', lecture: '3', type: 'recall', mode: 'write',
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
      prompt: 'Which compiler step comes first and turns characters into tokens?',
      answer: 'Lexical analysis.',
      points: ['Lexical analysis.'],
      why: 'Order: lexical analysis, syntax analysis, code generation.',
      source: 'Post Test Translation, Q1 (replaces an order card that handed over the three steps)' },
    { id: 'l4-compiler-steps-list-q2', lecture: '4', type: 'recall',
      prompt: 'Which compiler step comes second and turns tokens into a parse tree?',
      answer: 'Syntax analysis.',
      points: ['Syntax analysis.'],
      why: '',
      source: 'Post Test Translation, Q1 (replaces an order card that handed over the three steps) (split from l4-compiler-steps-list)' },
    { id: 'l4-compiler-steps-list-q3', lecture: '4', type: 'recall',
      prompt: 'Which compiler step comes last and turns the parse tree into machine code?',
      answer: 'Low-level (machine) code generation.',
      points: ['Low-level (machine) code generation.'],
      why: '',
      source: 'Post Test Translation, Q1 (replaces an order card that handed over the three steps) (split from l4-compiler-steps-list)' },
    { id: 'l4-hybrid', lecture: '4', type: 'recall',
      prompt: 'Besides compiling and interpreting, what is a hybrid implementation system?',
      answer: 'The source is compiled to an intermediate language (such as bytecode), which is then interpreted (or JIT-compiled) on each machine.',
      points: ['The source is compiled to an intermediate language (such as bytecode), which is then interpreted (or JIT-compiled) on each machine.'],
      why: 'It trades some speed for portability: the bytecode runs anywhere a JVM exists.',
      source: 'Slides 4, slide 2 names “Hybrid”; the definition is Sebesta ch. 1 (her diagram slides have no text)' },
    { id: 'l4-hybrid-q2', lecture: '4', type: 'recall',
      prompt: 'Give the standard example of a hybrid implementation system, and its intermediate language.',
      answer: 'Java: source → bytecode → the JVM.',
      points: ['Java: source → bytecode → the JVM.'],
      why: 'The bytecode runs anywhere a JVM exists.',
      source: 'Slides 4, slide 2 names “Hybrid”; the definition is Sebesta ch. 1 (her diagram slides have no text) (split from l4-hybrid)' },
    { id: 'l4-lexeme-token', lecture: '4', type: 'recall',
      prompt: 'What is a lexeme?',
      answer: 'A lowest-level syntactic unit of a language (e.g. “if”, “count”).',
      points: ['A lowest-level syntactic unit of a language (e.g. “if”, “count”).'],
      why: 'Many lexemes (count, i, total) share one token (identifier).',
      source: 'Post Test Translation, Q2' },
    { id: 'l4-lexeme-token-q2', lecture: '4', type: 'recall',
      prompt: 'What is a token?',
      answer: 'A category of lexemes (e.g. count, i and total are all identifiers).',
      points: ['A category of lexemes (e.g. count, i and total are all identifiers).'],
      why: '',
      source: 'Post Test Translation, Q2 (split from l4-lexeme-token)' },
    { id: 'l4-tokenize-while', lecture: '4', type: 'recall',
      prompt: 'In this statement, how many lexemes is >=, and what is its token?',
      code: `while (count >= 10) sum = sum + count;`,
      answer: 'One lexeme: a relational operator.',
      points: ['One lexeme: a relational operator.'],
      why: 'The lexical analyzer reads the longest lexeme it can: >= is one operator, not > then =.',
      source: 'Slides 4, slides 7-8 method, applied to a new statement (Sebesta ch. 3 example)' },
    { id: 'l4-tokenize-while-q2', lecture: '4', type: 'recall',
      prompt: 'In this statement, what is the token of the lexeme while?',
      code: `while (count >= 10) sum = sum + count;`,
      answer: 'Reserved word.',
      points: ['Reserved word.'],
      why: 'Token names vary between compilers (her slide writes for_resWord); what matters is the category.',
      source: 'Slides 4, slides 7-8 method, applied to a new statement (Sebesta ch. 3 example) (split from l4-tokenize-while)' },
    { id: 'l4-tokenize-while-q3', lecture: '4', type: 'recall',
      prompt: 'In this statement, what is the token of the lexeme = ?',
      code: `while (count >= 10) sum = sum + count;`,
      answer: 'Assignment operator.',
      points: ['Assignment operator.'],
      why: '',
      source: 'Slides 4, slides 7-8 method, applied to a new statement (Sebesta ch. 3 example) (split from l4-tokenize-while)' },
    { id: 'l4-tokenize-while-q4', lecture: '4', type: 'recall',
      prompt: 'In this statement, what is the token of the lexeme + ?',
      code: `while (count >= 10) sum = sum + count;`,
      answer: 'Plus (arithmetic) operator.',
      points: ['Plus (arithmetic) operator.'],
      why: '',
      source: 'Slides 4, slides 7-8 method, applied to a new statement (Sebesta ch. 3 example) (split from l4-tokenize-while)' },
    { id: 'l4-how-know', lecture: '4', type: 'recall',
      prompt: 'Reading x = y + 2 * z; how does the lexical analyzer decide where the identifier x ends?',
      answer: 'It keeps adding characters to the identifier until it meets one that is not a letter, digit or underscore.',
      points: ['It keeps adding characters to the identifier until it meets one that is not a letter, digit or underscore.'],
      why: 'This is lexical analysis, the first compiler step.',
      source: 'Pre Test Translation, Q2e' },
    { id: 'l4-how-know-q2', lecture: '4', type: 'recall',
      prompt: 'In which direction does the lexical analyzer read the source, and what does it do with whitespace?',
      answer: 'Left to right, ignoring whitespace.',
      points: ['Left to right, ignoring whitespace.'],
      why: '',
      source: 'Pre Test Translation, Q2e (split from l4-how-know)' },
    { id: 'l4-how-know-q3', lecture: '4', type: 'recall',
      prompt: 'In x = y + 2 * z; how does the compiler know that = is an operation and ; is just syntax?',
      answer: 'The language has rules for what makes an operator, a variable and plain syntax; the rules say = is the assignment operator (with its own machine code).',
      points: ['The language has rules for what makes an operator, a variable and plain syntax; the rules say = is the assignment operator (with its own machine code).'],
      why: '',
      source: 'Pre Test Translation, Q2e (split from l4-how-know)' },
    { id: 'l4-symtab', lecture: '4', type: 'recall',
      prompt: 'What is a symbol table, and what is its role in a compiler?',
      answer: 'A list of all the identifiers in a program, along with their value or memory location (and other properties).',
      points: ['A list of all the identifiers in a program, along with their value or memory location (and other properties).'],
      why: 'Later phases look names up here instead of re-reading the source.',
      source: 'Post Test Translation, Q3' },
    { id: 'l4-gpa-bnf', lecture: '4', type: 'recall', mode: 'write',
      prompt: 'GPAs run from 0.0 to 4.0 with exactly one digit after the decimal point. Write a concise BNF grammar for GPAs.',
      answer: `<GPA> → 4.0 | <left digit> . <right digit>
<left digit> → 0 | 1 | 2 | 3
<right digit> → 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9`,
      points: ['4.0 handled as its own case', 'left digit limited to 0-3', 'right digit 0-9'],
      why: 'Limiting the left digit to 0-3 is what keeps 4.1 through 4.9 out.',
      source: 'Post Test Translation, Q4a' },
    { id: 'l4-gpa-derive-write', lecture: '4', type: 'recall', mode: 'write',
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
      points: ['cannot be derived: only 4.0 starts with 4, and <left digit> stops at 3'],
      why: 'A derivation question can have “impossible” as its answer; say why.',
      source: 'Post Test Translation, Q4c (the key leaves this blank; the reasoning follows from the grammar)' },
    { id: 'l4-same', lecture: '4', type: 'recall',
      prompt: 'What is the similarity between a compiler and an interpreter?',
      answer: 'Both generate lower-level code (e.g. machine code) from higher-level code.',
      points: ['both translate higher-level code into lower-level code'],
      why: '',
      source: 'Pre Test Translation, Q1a' },
    { id: 'l4-diff', lecture: '4', type: 'recall',
      prompt: 'How much of a program does a compiler translate before generating its lower-level code?',
      answer: 'The entire file, at once.',
      points: ['The entire file, at once.'],
      why: 'An interpreter, by contrast, works one line at a time.',
      source: 'Pre Test Translation, Q1b' },
    { id: 'l4-diff-q2', lecture: '4', type: 'recall',
      prompt: 'How does an interpreter work through a program?',
      answer: 'One line at a time: it translates a line, executes it, then moves to the next line.',
      points: ['One line at a time: it translates a line, executes it, then moves to the next line.'],
      why: '',
      source: 'Pre Test Translation, Q1b (split from l4-diff)' },
    { id: 'l4-adv-compiled', lecture: '4', type: 'recall',
      prompt: 'What is the advantage of a language that is compiled?',
      answer: 'Once compiled it runs faster, because it does not need to be translated again each time it runs.',
      points: ['Once compiled it runs faster, because it does not need to be translated again each time it runs.'],
      why: 'Compare with the advantage of an interpreted language: they mirror each other.',
      source: 'Pre Test Translation, Q1c' },
    { id: 'l4-adv-interp', lecture: '4', type: 'recall',
      prompt: 'What is the main advantage of a language that is interpreted?',
      answer: 'Getting the program going is faster: it starts running sooner.',
      points: ['Getting the program going is faster: it starts running sooner.'],
      why: '',
      source: 'Pre Test Translation, Q1d' },
    { id: 'l4-adv-interp-q2', lecture: '4', type: 'recall',
      prompt: 'With an interpreted language, what effect do mistakes in other parts of the code have on starting the program?',
      answer: 'None: they do not stop the program from starting to run.',
      points: ['None: they do not stop the program from starting to run.'],
      why: '',
      source: 'Pre Test Translation, Q1d (split from l4-adv-interp)' },
    { id: 'l4-xyz-instr', lecture: '4', type: 'recall',
      prompt: 'All variables are integers. What machine-language instructions must be generated for  x = y + 2 * z; ?',
      answer: 'Depends on the architecture, but something like: load y into register A and z into register B (from memory); shift register B left by 1 bit; add A and B, result into A; store A into memory at x.',
      points: ['load y and z into registers, shift z’s left 1 bit, add, store into x'],
      why: 'Multiplying by 2 is a 1-bit left shift, so no 2 is ever loaded.',
      source: 'Pre Test Translation, Q2a (replaces an order card)' },
    { id: 'l4-where-2', lecture: '4', type: 'recall',
      prompt: 'In  x = y + 2 * z;  where does the 2 come from during execution?',
      answer: 'Likely nowhere: the multiplication by 2 is replaced by a 1-bit left shift. Otherwise the compiler builds the 2 directly into the instruction.',
      points: ['nowhere: × 2 becomes a shift (otherwise it is part of the instruction)'],
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
      points: ['By the compiler or the interpreter: a program that runs to translate high-level code into lower-level code.'],
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
    { id: 'l4-sample-derive-write', lecture: '4', type: 'recall', mode: 'write',
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
    { id: 'l4-derive-two', lecture: '4', type: 'recall', mode: 'write',
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
      points: ['No: the 4 must come from <var> or <num>, and neither produces 4'],
      why: 'To show something cannot be derived, show that no rule can produce the missing piece.',
      source: 'Practice item on the Slides 4, slide 12 grammar (like Post Test Translation, Q4c)' },
    { id: 'l4-parse-tree', lecture: '4', type: 'tree',
      prompt: 'Build the parse tree of  c = c + 2 * a  under this grammar.',
      code: `<program> → <stmts>
<stmts> → <stmt> | <stmt> ; <stmts>
<stmt> → <var> = <expr>
<var> → a | b | c | d
<num> → 1 | 2 | 3
<expr> → <term> + <expr> | <term> * <expr> | <term>
<term> → <var> | <num>`,
      start: '<program>',
      palette: ['<stmts>', '<stmt>', '<var>', '<expr>', '<term>', '<num>', '=', '+', '*', ';', 'a', 'b', 'c', 'd', '1', '2', '3'],
      answer: { label: '<program>', kids: [{ label: '<stmts>', kids: [{ label: '<stmt>', kids: [
        { label: '<var>', kids: [{ label: 'c', kids: [] }] },
        { label: '=', kids: [] },
        { label: '<expr>', kids: [
          { label: '<term>', kids: [{ label: '<var>', kids: [{ label: 'c', kids: [] }] }] },
          { label: '+', kids: [] },
          { label: '<expr>', kids: [
            { label: '<term>', kids: [{ label: '<num>', kids: [{ label: '2', kids: [] }] }] },
            { label: '*', kids: [] },
            { label: '<expr>', kids: [{ label: '<term>', kids: [{ label: '<var>', kids: [{ label: 'a', kids: [] }] }] }] },
          ] },
        ] },
      ] }] }] },
      why: '* sits deeper than +, so it is evaluated first, but only because it comes later in the sentence (compare a * b + c).',
      source: 'Slides 4, slide 13 (the slide draws the tree)' },
    { id: 'l4-sample-prec', lecture: '4', type: 'typed',
      prompt: 'Using that same grammar, how is  a * b + c  grouped? Answer with brackets.',
      code: `<expr> → <term> + <expr> | <term> * <expr> | <term>
<term> → <var> | <num>`,
      answer: 'a * (b + c)', accept: ['a*(b+c)', 'a * (b+c)', 'a*(b + c)'],
      why: 'The only derivation is <expr> ⇒ <term> * <expr>, so everything after * (b + c) is one <expr> lower in the tree, and is done first. This grammar gives + and * equal precedence; a real grammar puts * at a lower level.',
      source: 'Practice item on the Slides 4, slide 12 grammar (worked from the grammar)' },
    { id: 'l4-ambiguous', lecture: '4', type: 'recall',
      prompt: 'What makes a grammar ambiguous?',
      answer: 'Some sentence (program) has two or more distinct parse trees.',
      points: ['Some sentence (program) has two or more distinct parse trees.'],
      why: '',
      source: 'Slides 4, slide 14' },
    { id: 'l4-ambiguous-q2', lecture: '4', type: 'recall',
      prompt: 'Why is an ambiguous grammar a problem for a compiler?',
      answer: 'Compilers determine meaning, such as operator precedence, from the parse tree, so two trees mean two possible meanings.',
      points: ['Compilers determine meaning, such as operator precedence, from the parse tree, so two trees mean two possible meanings.'],
      why: '',
      source: 'Slides 4, slide 14 (split from l4-ambiguous)' },
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
      points: ['At a lower level of the grammar (deeper in the parse tree), so it is applied first.'],
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
      prompt: 'In the EBNF used for the C grammar, what does  { }*  mean?',
      answer: 'Zero or more.',
      points: ['Zero or more.'],
      why: 'Same meanings as in regular expressions.',
      source: 'Slides 4, slide 19' },
    { id: 'l4-ebnf-q2', lecture: '4', type: 'recall',
      prompt: 'In the EBNF used for the C grammar, what does  { }+  mean?',
      answer: 'One or more.',
      points: ['One or more.'],
      why: '',
      source: 'Slides 4, slide 19 (split from l4-ebnf)' },
    { id: 'l4-ebnf-q3', lecture: '4', type: 'recall',
      prompt: 'In the EBNF used for the C grammar, what does  { }?  mean?',
      answer: 'Zero or one (optional).',
      points: ['Zero or one (optional).'],
      why: '',
      source: 'Slides 4, slide 19 (split from l4-ebnf)' },
    { id: 'l4-production', lecture: '4', type: 'recall',
      prompt: 'What is a single BNF rule (LHS → RHS) called?',
      answer: 'A production.',
      points: ['A production.'],
      why: 'A grammar is just a collection of these rules plus a start symbol.',
      source: 'Slides 4, slide 10 (blank wording from Sebesta ch. 3; merges three slide blanks)' },
    { id: 'l4-production-q2', lecture: '4', type: 'recall',
      prompt: 'What may the left-hand side of a BNF production be?',
      answer: 'Exactly one nonterminal (in < > brackets).',
      points: ['Exactly one nonterminal (in < > brackets).'],
      why: '',
      source: 'Slides 4, slide 10 (blank wording from Sebesta ch. 3; merges three slide blanks) (split from l4-production)' },
    { id: 'l4-production-q3', lecture: '4', type: 'recall',
      prompt: 'What may the right-hand side of a BNF production be?',
      answer: 'A string of terminals and/or nonterminals.',
      points: ['A string of terminals and/or nonterminals.'],
      why: '',
      source: 'Slides 4, slide 10 (blank wording from Sebesta ch. 3; merges three slide blanks) (split from l4-production)' },
    { id: 'l4-production-q4', lecture: '4', type: 'recall',
      prompt: 'In BNF, what does | separate?',
      answer: 'Alternative right-hand sides.',
      points: ['Alternative right-hand sides.'],
      why: '',
      source: 'Slides 4, slide 10 (blank wording from Sebesta ch. 3; merges three slide blanks) (split from l4-production)' },
    { id: 'l4-left-assoc', lecture: '4', type: 'recall',
      prompt: 'Rewrite  <expr> → <expr> / <expr> | <const>  so that / is left-associative.',
      answer: '<expr> → <expr> / <const> | <const>',
      points: ['<expr> → <expr> / <const> | <const>'],
      why: 'Her slide’s phrase: “don’t allow as much recursion” on the right.',
      source: 'Slides 4, slide 18 (replaces the slide-word blank)' },
    { id: 'l4-left-assoc-q2', lecture: '4', type: 'recall',
      prompt: 'Why does  <expr> → <expr> / <const> | <const>  make / left-associative?',
      answer: 'The recursion is only on the left, so in 60 / 12 / 4 the leftmost / ends up deepest in the parse tree and is evaluated first: (60 / 12) / 4.',
      points: ['The recursion is only on the left, so in 60 / 12 / 4 the leftmost / ends up deepest in the parse tree and is evaluated first: (60 / 12) / 4.'],
      why: '',
      source: 'Slides 4, slide 18 (replaces the slide-word blank) (split from l4-left-assoc)' },
    { id: 'l4-show-ambig', lecture: '4', type: 'recall', mode: 'write',
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
      points: ['<S> → <S> + a | a'],
      why: 'Each + now has a plain a on its right, so a + a + a can only group as (a + a) + a.',
      source: 'Practice item applying Slides 4, slides 17-18' },
    { id: 'l4-write-prec', lecture: '4', type: 'recall', mode: 'write',
      prompt: 'Write an unambiguous grammar for expressions over the variables a and b with + and *, where * binds tighter than + and both are left-associative.',
      answer: `<expr> → <expr> + <term> | <term>
<term> → <term> * <factor> | <factor>
<factor> → a | b`,
      points: ['+ at the top level: <expr> → <expr> + <term> | <term>', '* one level lower: <term> → <term> * <factor> | <factor>', 'operands at the bottom: <factor> → a | b', 'left recursion on both levels (left-associative)'],
      why: 'Higher precedence = lower in the grammar = deeper in the tree = done first. Same shape as her - and / grammar on slide 16.',
      source: 'Practice item applying Slides 4, slide 16 (standard expression grammar, Sebesta ch. 3)' },
    { id: 'l4-write-time24', lecture: '4', type: 'recall', mode: 'write',
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
    { id: 'l4-write-binary', lecture: '4', type: 'recall', mode: 'write',
      prompt: 'Write a BNF grammar for binary numbers with no leading zeros (0 itself is allowed; 0101 is not).',
      answer: `<bin> → 0 | 1 | 1 <rest>
<rest> → <bit> | <bit> <rest>
<bit> → 0 | 1`,
      points: ['0 allowed on its own', 'every other number starts with 1', 'after the 1, any number of 0s and 1s (recursion)'],
      why: 'Forcing the first symbol to be 1 is what keeps leading zeros out.',
      source: 'Practice item in the style of Post Test Translation, Q4a (not from her PDFs)' },

    // ───────────── Lecture 5.1: names, binding, type, address ─────────────
    { id: 'l51-attrs', lecture: '5.1', type: 'recall', mode: 'write',
      prompt: 'What six attributes are associated with a name in a program?',
      answer: 'Name, address, value, type, scope, lifetime.',
      points: ['name', 'address', 'value', 'type', 'scope', 'lifetime'],
      why: 'Lectures 5.1 and 5.2 walk through these one at a time.',
      source: 'Slides 5.1, slide 3' },
    { id: 'l51-name-issues', lecture: '5.1', type: 'recall',
      prompt: 'Should twoDArray and twoDarray be the same name? Which design issue for names is that?',
      answer: 'Case sensitivity.',
      points: ['Case sensitivity.'],
      why: '',
      source: 'Slides 5.1, slide 5' },
    { id: 'l51-name-issues-q2', lecture: '5.1', type: 'recall',
      prompt: 'May $, @ or a space appear in a variable name? Which design issue for names is that?',
      answer: 'Which characters are allowed.',
      points: ['Which characters are allowed.'],
      why: '',
      source: 'Slides 5.1, slide 5 (split from l51-name-issues)' },
    { id: 'l51-name-issues-q3', lecture: '5.1', type: 'recall',
      prompt: 'Can while or INTEGER be used as a variable name? Which design issue for names is that?',
      answer: 'Reserved words or keywords.',
      points: ['Reserved words or keywords.'],
      why: '',
      source: 'Slides 5.1, slide 5 (split from l51-name-issues)' },
    { id: 'l51-name-issues-q4', lecture: '5.1', type: 'recall',
      prompt: 'Early Fortran allowed only 6-character names. Which design issue for names is that?',
      answer: 'Length.',
      points: ['Length.'],
      why: '',
      source: 'Slides 5.1, slide 5 (split from l51-name-issues)' },
    { id: 'l51-case', lecture: '5.1', type: 'mc', noRecall: true,
      prompt: 'Which of these languages does NOT have case-sensitive names?',
      answer: 'Scheme', options: ['Java', 'C', 'Python'],
      why: 'In Scheme (per the slides), twoDArray and twoDarray are the same name. That is true of older (R5RS-era) Scheme; modern Scheme (R6RS, R7RS, Racket) is case-sensitive.',
      source: 'Slides 5.1, slide 7; Names post-test Q1' },
    { id: 'l51-anychar', lecture: '5.1', type: 'mc',
      prompt: 'Which language allows almost any keyboard character in a name?',
      answer: 'Scheme', options: ['Java', 'Python', 'C'],
      why: 'Java and Python allow only letters, digits and underscore.',
      source: 'Slides 5.1, slide 6' },
    { id: 'l51-meaning', lecture: '5.1', type: 'mc', noRecall: true,
      prompt: 'In which of these languages do certain characters of a name carry meaning?',
      answer: 'Perl', options: ['Java', 'Scheme', 'Python'],
      why: 'Perl’s $, @ and % prefixes mark the kind of variable; Fortran’s first letter marked its type.',
      source: 'Slides 5.1, slide 6' },
    { id: 'l51-keywords', lecture: '5.1', type: 'mc',
      prompt: 'Which language uses only keywords, with no reserved words?',
      answer: 'Fortran', options: ['Java', 'Python', 'JavaScript'],
      why: 'A keyword is special only in context, so in Fortran a variable can even be named like one.',
      source: 'Slides 5.1, slide 8' },
    { id: 'l51-maxlen', lecture: '5.1', type: 'mc', noRecall: true,
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
      prompt: 'In  evenNum:  what kind of program entity does the name stand for?',
      answer: 'A label: a statement location.',
      points: ['A label: a statement location.'],
      why: 'In every case the name is an abstraction of a memory location.',
      source: 'Slides 5.1, slide 2 (blank wording from Sebesta ch. 5; merges three slide blanks)' },
    { id: 'l51-entities-q2', lecture: '5.1', type: 'recall',
      prompt: 'In  sumToN(12)  what kind of program entity does the name sumToN stand for?',
      answer: 'A subprogram (and its calls).',
      points: ['A subprogram (and its calls).'],
      why: '',
      source: 'Slides 5.1, slide 2 (blank wording from Sebesta ch. 5; merges three slide blanks) (split from l51-entities)' },
    { id: 'l51-entities-q3', lecture: '5.1', type: 'recall',
      prompt: 'Whether it names a variable, a label or a subprogram, a name is an abstraction of what?',
      answer: 'A memory location.',
      points: ['A memory location.'],
      why: '',
      source: 'Slides 5.1, slide 2 (blank wording from Sebesta ch. 5; merges three slide blanks) (split from l51-entities)' },
    { id: 'l51-binding-def', lecture: '5.1', type: 'recall',
      prompt: 'Define binding.',
      answer: 'An association between an entity and an attribute (e.g. a variable and its type, or a symbol and its operation).',
      points: ['An association between an entity and an attribute (e.g. a variable and its type, or a symbol and its operation).'],
      why: 'Binding times run from language design to run time.',
      source: 'Slides 5.1, slide 12 (blank wording from Sebesta ch. 5; merges two slide blanks)' },
    { id: 'l51-binding-def-q2', lecture: '5.1', type: 'recall',
      prompt: 'Define binding time.',
      answer: 'The time at which a binding (entity–attribute association) is made.',
      points: ['The time at which a binding (entity–attribute association) is made.'],
      why: '',
      source: 'Slides 5.1, slide 12 (blank wording from Sebesta ch. 5; merges two slide blanks) (split from l51-binding-def)' },
    { id: 'l51-bind-classify', lecture: '5.1', type: 'recall',
      prompt: 'The type of count in the C statement  count = count + 5;  is bound when?',
      answer: 'Compile time.',
      points: ['Compile time.'],
      why: 'Declarations are read by the compiler.',
      source: 'Sebesta ch. 5.4 example, mapped onto her binding-time list (Slides 5.1, slide 13)' },
    { id: 'l51-bind-classify-q2', lecture: '5.1', type: 'recall',
      prompt: 'The set of values count can hold, in the C statement  count = count + 5;  is bound when?',
      answer: 'Language implementation time.',
      points: ['Language implementation time.'],
      why: 'int’s range is chosen by whoever implements C.',
      source: 'Sebesta ch. 5.4 example, mapped onto her binding-time list (Slides 5.1, slide 13) (split from l51-bind-classify)' },
    { id: 'l51-bind-classify-q3', lecture: '5.1', type: 'recall',
      prompt: 'The meaning of + in the C statement  count = count + 5;  is bound when?',
      answer: 'Compile time (once the operand types are known).',
      points: ['Compile time (once the operand types are known).'],
      why: '+ can mean int or float addition, so the compiler picks once it knows the types.',
      source: 'Sebesta ch. 5.4 example, mapped onto her binding-time list (Slides 5.1, slide 13) (split from l51-bind-classify)' },
    { id: 'l51-bind-classify-q4', lecture: '5.1', type: 'recall',
      prompt: 'The internal representation of the literal 5 in C is bound when?',
      answer: 'Language implementation time.',
      points: ['Language implementation time.'],
      why: 'How a literal is stored is chosen by whoever implements C.',
      source: 'Sebesta ch. 5.4 example, mapped onto her binding-time list (Slides 5.1, slide 13) (split from l51-bind-classify)' },
    { id: 'l51-bind-classify-q5', lecture: '5.1', type: 'recall',
      prompt: 'The value of count in the C statement  count = count + 5;  is bound when?',
      answer: 'Run time.',
      points: ['Run time.'],
      why: '',
      source: 'Sebesta ch. 5.4 example, mapped onto her binding-time list (Slides 5.1, slide 13) (split from l51-bind-classify)' },
    { id: 'l51-bind-classify2', lecture: '5.1', type: 'recall',
      prompt: 'The address of a C global variable is bound when?',
      answer: 'Load time.',
      points: ['Load time.'],
      why: 'Static/global storage is fixed when the program is loaded.',
      source: 'Practice item using her binding-time list (Slides 5.1, slide 13) and the slide-13 example answers' },
    { id: 'l51-bind-classify2-q2', lecture: '5.1', type: 'recall',
      prompt: 'The address of a non-static C local variable is bound when?',
      answer: 'Run time (on each call).',
      points: ['Run time (on each call).'],
      why: 'A local gets fresh stack storage on every call.',
      source: 'Practice item using her binding-time list (Slides 5.1, slide 13) and the slide-13 example answers (split from l51-bind-classify2)' },
    { id: 'l51-bind-classify2-q3', lecture: '5.1', type: 'recall',
      prompt: 'The number of bits in a C int is bound when?',
      answer: 'Language implementation time.',
      points: ['Language implementation time.'],
      why: '',
      source: 'Practice item using her binding-time list (Slides 5.1, slide 13) and the slide-13 example answers (split from l51-bind-classify2)' },
    { id: 'l51-bind-classify2-q4', lecture: '5.1', type: 'recall',
      prompt: 'The fact that while starts a loop in C is bound when?',
      answer: 'Language design time.',
      points: ['Language design time.'],
      why: '',
      source: 'Practice item using her binding-time list (Slides 5.1, slide 13) and the slide-13 example answers (split from l51-bind-classify2)' },
    { id: 'l51-type-name', lecture: '5.1', type: 'mc', noRecall: true,
      prompt: '“The type should be part of the name.” Which language does this?',
      answer: 'Perl', options: ['Python', 'C#', 'Java'],
      why: 'Python: implicit (just use the name); C#: var, type inferred; Java: declared explicitly.',
      source: 'Slides 5.1, slide 16' },
    { id: 'l51-type-infer', lecture: '5.1', type: 'mc',
      prompt: 'You say a name is a variable with  var  and the compiler infers its type. Which language’s example is this?',
      answer: 'C#', options: ['Python', 'Fortran', 'Pascal'],
      why: 'Inference still binds the type statically; Python binds it dynamically.',
      source: 'Slides 5.1, slide 16' },
    { id: 'l51-type-dynamic', lecture: '5.1', type: 'mc', noRecall: true,
      prompt: 'In which language are types bound dynamically?',
      answer: 'JavaScript', options: ['C', 'Java', 'TypeScript'],
      why: 'Static: C, Java. Dynamic: Python, JavaScript.',
      source: 'Slides 5.1, slide 17' },
    { id: 'l51-type-exact', lecture: '5.1', type: 'mc', noRecall: true,
      prompt: 'In which language can a value be treated as another type even without a cast?',
      answer: 'C', options: ['Java', 'Ada'],
      why: 'Java requires types to match exactly (or be a subset). See the banana pre-test: C accepts an int as a condition.',
      source: 'Slides 5.1, slide 18' },
    { id: 'l51-storage', lecture: '5.1', type: 'recall',
      prompt: 'When can a variable’s address be determined, and where can the storage live?',
      answer: 'Statically (before run time), or dynamically: on the stack, or on the heap (explicit or implicit).',
      points: ['static, or dynamic: stack, explicit heap or implicit heap'],
      why: 'Where the address lives determines the lifetime (lecture 5.2).',
      source: 'Slides 5.1, slides 22-23' },
    { id: 'l51-case-arg', lecture: '5.1', type: 'recall', mode: 'write',
      prompt: 'Should a programming language allow variable names to be case-sensitive? Argue it.',
      answer: 'Either side can be argued. Against: should twoDArray and twoDarray be one variable or two? Treating them as different allows more confusion and is less readable, since most people would read them as the same. Case-insensitivity doesn’t stop anyone from writing camelCase. For: languages are case-sensitive partly because it is less work for the compiler writer (simpler string comparisons).',
      points: ['takes a side', 'example like twoDArray vs twoDarray', 'readability / confusion argument', 'mentions the compiler-writer reason'],
      why: 'Python, Java and C are case-sensitive; Scheme is not.',
      source: 'Post Test Names & Identifiers, Q1' },
    { id: 'l51-explicit-types', lecture: '5.1', type: 'recall', mode: 'write',
      prompt: 'Her key lists four advantages of declaring a variable’s type explicitly (as in Java) over just using a name (as in Python). Give all four.',
      answer: 'The compiler can catch spelling errors (one of the most common mistakes); the programmer has a clearer idea what the variable is for; the reader knows the intended type (in x = 5, is x an integer or a real?); the compiler can allocate the right amount of space immediately.',
      points: ['catches misspelled names', 'clearer purpose for the programmer', 'reader knows the type', 'right amount of space allocated'],
      why: 'Her test asks for three; learning all four means any three she accepts are covered.',
      source: 'Post Test Names & Identifiers, Q2' },
    { id: 'l51-spaces', lecture: '5.1', type: 'recall', mode: 'write',
      prompt: 'Should a language allow variable names to have spaces? Why or why not?',
      answer: 'It could, but it shouldn’t. average grades = sum of grades / number of grades reads well, but in  if average grades < 50.0 :  is the variable “if average grades”, “average grades”, or two variables? It becomes unreadable and ambiguous. Also, most external linkers forbid spaces.',
      points: ['readable in simple cases', 'ambiguous with keywords (the if example)', 'external linking forbids spaces'],
      why: '',
      source: 'Pre Test Names & Identifiers, Q1' },
    { id: 'l51-single', lecture: '5.1', type: 'recall',
      prompt: 'Should a language forbid single-letter variable names? Why or why not?',
      answer: 'The professor says yes: single-letter names are not readable and not searchable. The possible exception is loop indices, but numbers[row][column] is still more readable than numbers[i][j].',
      points: ['yes: not readable and not searchable (even loop indices read better as real names)'],
      why: 'Python allows them, though pylint flags them.',
      source: 'Pre Test Names & Identifiers, Q2' },
    { id: 'l51-name-objcode', lecture: '5.1', type: 'recall',
      prompt: 'Where is a variable’s name in the object code?',
      answer: 'Nowhere: the name, as a literal, never exists in the object code.',
      points: ['Nowhere: the name, as a literal, never exists in the object code.'],
      why: 'The compiler replaces names with addresses (via the symbol table). Strictly, a global or function name that other files need stays in the object file’s symbol table for the linker; the instructions themselves use only addresses.',
      source: 'Pre Test Names & Identifiers, Q3' },
    { id: 'l51-name-objcode-q2', lecture: '5.1', type: 'recall',
      prompt: 'Who are the names in a program for, and what do they spare those people from knowing?',
      answer: 'People (programmers and readers): they avoid knowing where something is in memory, its actual value, or how long it is stored.',
      points: ['People (programmers and readers): they avoid knowing where something is in memory, its actual value, or how long it is stored.'],
      why: '',
      source: 'Pre Test Names & Identifiers, Q3 (split from l51-name-objcode)' },
    { id: 'l51-unique', lecture: '5.1', type: 'recall',
      prompt: 'Many programmers work on one project. Must they all make sure their names are unique? Why or why not?',
      answer: 'No, provided the names are not global. Scope and lifetime rules mean a name only exists or is accessible in certain places, so good practice is to keep names local to a small context. Java goes furthest: classes give even method names a local context.',
      points: ['No, unless global: scope and lifetime rules confine each name to its context'],
      why: '',
      source: 'Pre Test Names & Identifiers, Q4' },

    // ───────────── Lecture 5.2: lifetime and scope ─────────────
    { id: 'l52-scope-def', lecture: '5.2', type: 'recall',
      prompt: 'Define scope.',
      answer: 'The range of statements in a program over which a name is visible.',
      points: ['The range of statements in a program over which a name is visible.'],
      why: 'Scope is about space (where in the text); lifetime is about time (when during the run).',
      source: 'Slides 5.2, slide 14' },
    { id: 'l52-lifetime-vs-scope', lecture: '5.2', type: 'recall', mode: 'write',
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
      points: ['the inner num hides an enclosing local, which Java and C# forbid'],
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
      prompt: 'In this Python program, what happens if the commented-out line at the top of f is uncommented?',
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
      answer: 'It crashes with UnboundLocalError.',
      points: ['It crashes with UnboundLocalError.'],
      why: 'Python decides scope per function at compile time: static scoping.',
      source: 'Slides 5.2, slide 21 (verified with Python 3)' },
    { id: 'l52-py-unbound-q2', lecture: '5.2', type: 'recall',
      prompt: 'Uncommenting the first line of f makes this program crash instead of printing the global x. Why doesn’t the read fall back to the global?',
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
      answer: 'Because f assigns x later (x = 13), x is local to the whole body of f, so the first line reads a local that hasn’t been bound yet.',
      points: ['Because f assigns x later (x = 13), x is local to the whole body of f, so the first line reads a local that hasn’t been bound yet.'],
      why: 'Python decides scope per function at compile time: static scoping.',
      source: 'Slides 5.2, slide 21 (verified with Python 3) (split from l52-py-unbound)' },
    { id: 'l52-scope-hole', lecture: '5.2', type: 'recall', mode: 'write',
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
      points: ['sa’s scope is only foo, so main cannot see the name (its lifetime does not matter)'],
      why: 'The clearest example of lifetime and scope being different things.',
      source: 'Slides 5.2, slide 28' },
    { id: 'l52-dynamic-def', lecture: '5.2', type: 'recall',
      prompt: 'Under dynamic scoping, how is a reference to a variable resolved?',
      answer: 'By the calling sequence at run time, not the textual layout: search back through the chain of subprogram calls for the most recent declaration.',
      points: ['By the calling sequence at run time, not the textual layout: search back through the chain of subprogram calls for the most recent declaration.'],
      why: '',
      source: 'Slides 5.2, slide 23 (the slide blanks are filled here; check them against your notes)' },
    { id: 'l52-dynamic-def-q2', lecture: '5.2', type: 'recall',
      prompt: 'Static scoping is spatial. Which word describes dynamic scoping?',
      answer: 'Temporal.',
      points: ['Temporal.'],
      why: 'Static follows where code is written; dynamic follows when calls happen.',
      source: 'Slides 5.2, slide 23 (the slide blanks are filled here; check them against your notes) (split from l52-dynamic-def)' },
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
      prompt: 'Per the slides, when are Java final named constants bound?',
      answer: 'Dynamically (all of them).',
      points: ['Dynamically (all of them).'],
      why: 'Per the slides. Strictly, a Java static final with a constant initializer is a compile-time constant that javac inlines; “all dynamic” is the slides’ simplification.',
      source: 'Slides 5.2, slides 30-31 (replaces a two-option MC on Java final)' },
    { id: 'l52-const-compare-q2', lecture: '5.2', type: 'recall',
      prompt: 'When are C# const values bound?',
      answer: 'At compile time (statically).',
      points: ['At compile time (statically).'],
      why: 'C# readonly values, by contrast, are bound dynamically.',
      source: 'Slides 5.2, slides 30-31 (replaces a two-option MC on Java final) (split from l52-const-compare)' },

    { id: 'l52-lifetime-def', lecture: '5.2', type: 'recall',
      prompt: 'Define lifetime (of a variable).',
      answer: 'The time during which a name is bound to one particular memory cell, i.e. how long that cell is occupied by the name’s value.',
      points: ['the time a name is bound to one particular memory cell'],
      why: 'The address (storage class) decides the lifetime: static, stack-dynamic, explicit heap or implicit heap.',
      source: 'Slides 5.1 slide 23 and 5.2 slide 3 (merges three slide blanks)' },
    { id: 'l52-static-lifetime', lecture: '5.2', type: 'recall',
      prompt: 'Define static lifetime.',
      answer: 'The variable is bound to its memory cell(s) before execution begins and stays bound to the same cells until execution ends.',
      points: ['The variable is bound to its memory cell(s) before execution begins and stays bound to the same cells until execution ends.'],
      why: 'Example: a C or C++ static variable inside a function (sa in the foo example).',
      source: 'Slides 5.2, slide 4 (blank wording from Sebesta ch. 5; merges two slide blanks)' },
    { id: 'l52-static-adv', lecture: '5.2', type: 'recall',
      prompt: 'What is the advantage of static variables?',
      answer: 'Efficiency (speed).',
      points: ['Efficiency (speed).'],
      why: 'The address is fixed before the program runs, so the code can use it directly.',
      source: 'Slides 5.2, slide 5 (blank wording from Sebesta ch. 5; merges two slide blanks)' },
    { id: 'l52-static-adv-q2', lecture: '5.2', type: 'recall',
      prompt: 'Why are static variables efficient?',
      answer: 'All addressing is direct, and there is no run-time allocation or deallocation.',
      points: ['All addressing is direct, and there is no run-time allocation or deallocation.'],
      why: 'The address is fixed before the program runs, so the code can use it directly.',
      source: 'Slides 5.2, slide 5 (blank wording from Sebesta ch. 5; merges two slide blanks) (split from l52-static-adv)' },
    { id: 'l52-static-disadv', lecture: '5.2', type: 'recall',
      prompt: 'In one phrase, what is the overall disadvantage of static variables?',
      answer: 'Lack of flexibility.',
      points: ['Lack of flexibility.'],
      why: 'Its specific forms: no recursion, size known before run time, no shared storage. All come from “one fixed cell for the whole run”.',
      source: 'Slides 5.2, slide 5 (blank wording from Sebesta ch. 5; merges four slide blanks)' },
    { id: 'l52-static-disadv-q2', lecture: '5.2', type: 'recall',
      prompt: 'With static variables, what must be known before run time?',
      answer: 'The size of each variable.',
      points: ['The size of each variable.'],
      why: '',
      source: 'Slides 5.2, slide 5 (blank wording from Sebesta ch. 5; merges four slide blanks) (split from l52-static-disadv)' },
    { id: 'l52-static-disadv-q3', lecture: '5.2', type: 'recall',
      prompt: 'Besides no recursion and fixed sizes, what storage limitation do static variables have?',
      answer: 'Their storage cannot be shared among variables.',
      points: ['Their storage cannot be shared among variables.'],
      why: '',
      source: 'Slides 5.2, slide 5 (blank wording from Sebesta ch. 5; merges four slide blanks) (split from l52-static-disadv)' },
    { id: 'l52-static-recursion', lecture: '5.2', type: 'recall',
      prompt: 'Why can’t a language whose variables are all static support recursion?',
      answer: 'Each variable has exactly one memory cell for the whole run. A second, still-active call of the same function would use the same cells and overwrite the first call’s locals.',
      points: ['Each variable has exactly one memory cell for the whole run. A second, still-active call of the same function would use the same cells and overwrite the first call’s locals.'],
      why: 'Stack-dynamic locals fix this: every call gets fresh cells. Fortran I subprograms could not recurse for this reason.',
      source: 'Slides 5.2, slide 5 (the reason follows Sebesta ch. 5; replaces a blank whose reason was wrong)' },
    { id: 'l52-decl-rules', lecture: '5.2', type: 'recall',
      prompt: 'Where must declarations go in C89 and Pascal?',
      answer: 'At the start (beginning) of the block.',
      points: ['At the start (beginning) of the block.'],
      why: 'Two answers to the first scope design issue: where declarations are done.',
      source: 'Slides 5.2, slide 17 (blank wording from Sebesta ch. 5; merges four slide blanks)' },
    { id: 'l52-decl-rules-q2', lecture: '5.2', type: 'recall',
      prompt: 'In C89 and Pascal, what is a local variable’s scope?',
      answer: 'The whole block.',
      points: ['The whole block.'],
      why: '',
      source: 'Slides 5.2, slide 17 (blank wording from Sebesta ch. 5; merges four slide blanks) (split from l52-decl-rules)' },
    { id: 'l52-decl-rules-q3', lecture: '5.2', type: 'recall',
      prompt: 'Where may declarations go in C99 and Java?',
      answer: 'Anywhere a statement can go.',
      points: ['Anywhere a statement can go.'],
      why: '',
      source: 'Slides 5.2, slide 17 (blank wording from Sebesta ch. 5; merges four slide blanks) (split from l52-decl-rules)' },
    { id: 'l52-decl-rules-q4', lecture: '5.2', type: 'recall',
      prompt: 'In C99 and Java, where does a local variable’s scope start and end?',
      answer: 'From its declaration to the end of the block.',
      points: ['From its declaration to the end of the block.'],
      why: '',
      source: 'Slides 5.2, slide 17 (blank wording from Sebesta ch. 5; merges four slide blanks) (split from l52-decl-rules)' },
    { id: 'l52-static-scope-adv', lecture: '5.2', type: 'recall',
      prompt: 'What is the main advantage of static scoping for someone reading a program?',
      answer: 'You can tell which variable a name refers to just by looking at the program, without running (tracing) it.',
      points: ['You can tell which variable a name refers to just by looking at the program, without running (tracing) it.'],
      why: 'Compare dynamic scoping, where you need the call sequence.',
      source: 'Slides 5.2, slide 25 (blank wording is a best guess at her slide; merges two slide blanks)' },
    { id: 'l52-static-scope-adv-q2', lecture: '5.2', type: 'recall',
      prompt: 'Why is static scoping familiar to programmers?',
      answer: 'Most languages use it.',
      points: ['Most languages use it.'],
      why: '',
      source: 'Slides 5.2, slide 25 (blank wording is a best guess at her slide; merges two slide blanks) (split from l52-static-scope-adv)' },
    { id: 'l52-dynamic-disadv', lecture: '5.2', type: 'recall',
      prompt: 'Under dynamic scoping, what can’t you tell by reading the program?',
      answer: 'Which variable a name refers to.',
      points: ['Which variable a name refers to.'],
      why: 'Its one advantage: a called subprogram can use its caller’s variables without parameters, which helps avoid globals.',
      source: 'Slides 5.2, slide 26 (the first point is her slide; the rest follow Sebesta ch. 5; merges two slide blanks)' },
    { id: 'l52-dynamic-disadv-q2', lecture: '5.2', type: 'recall',
      prompt: 'Why is dynamic scoping less reliable?',
      answer: 'Every called subprogram can see and change its callers’ locals.',
      points: ['Every called subprogram can see and change its callers’ locals.'],
      why: '',
      source: 'Slides 5.2, slide 26 (the first point is her slide; the rest follow Sebesta ch. 5; merges two slide blanks) (split from l52-dynamic-disadv)' },
    { id: 'l52-dynamic-disadv-q3', lecture: '5.2', type: 'recall',
      prompt: 'Under dynamic scoping, how fast is access to non-local variables?',
      answer: 'Slower.',
      points: ['Slower.'],
      why: '',
      source: 'Slides 5.2, slide 26 (the first point is her slide; the rest follow Sebesta ch. 5; merges two slide blanks) (split from l52-dynamic-disadv)' },
    { id: 'l52-dynamic-disadv-q4', lecture: '5.2', type: 'recall',
      prompt: 'Why is dynamic scoping harder to learn?',
      answer: 'Few languages use it, so it is unfamiliar.',
      points: ['Few languages use it, so it is unfamiliar.'],
      why: '',
      source: 'Slides 5.2, slide 26 (the first point is her slide; the rest follow Sebesta ch. 5; merges two slide blanks) (split from l52-dynamic-disadv)' },
    { id: 'l52-named-const', lecture: '5.2', type: 'recall',
      prompt: 'What is a named constant?',
      answer: 'A “variable” bound to a value only once.',
      points: ['A “variable” bound to a value only once.'],
      why: 'Example of parameterizing: const int MAX = 100; used for every array size and loop bound.',
      source: 'Slides 5.2, slide 29 (two blanks filled from Sebesta ch. 5; merges two slide blanks)' },
    { id: 'l52-named-const-q2', lecture: '5.2', type: 'recall',
      prompt: 'Writing PI instead of 3.14159 is which advantage of named constants?',
      answer: 'Readability.',
      points: ['Readability.'],
      why: '',
      source: 'Slides 5.2, slide 29 (two blanks filled from Sebesta ch. 5; merges two slide blanks) (split from l52-named-const)' },
    { id: 'l52-named-const-q3', lecture: '5.2', type: 'recall',
      prompt: 'Changing a value in one place instead of everywhere is which advantage of named constants?',
      answer: 'Modifiability.',
      points: ['Modifiability.'],
      why: '',
      source: 'Slides 5.2, slide 29 (two blanks filled from Sebesta ch. 5; merges two slide blanks) (split from l52-named-const)' },
    { id: 'l52-named-const-q4', lecture: '5.2', type: 'recall',
      prompt: 'const int MAX = 100; used for every array size and loop bound shows which use of named constants?',
      answer: 'Parameterizing programs.',
      points: ['Parameterizing programs.'],
      why: '',
      source: 'Slides 5.2, slide 29 (two blanks filled from Sebesta ch. 5; merges two slide blanks) (split from l52-named-const)' },
    { id: 'l52-manifest', lecture: '5.2', type: 'recall',
      prompt: 'Named-constant values can be bound statically or dynamically. What are statically bound ones called?',
      answer: 'Manifest constants.',
      points: ['Manifest constants.'],
      why: 'In C, #define makes one: it is replaced before compilation, so its value is fixed before the program ever runs.',
      source: 'Slides 5.2, slide 30 (blank wording from Sebesta ch. 5; merges two slide blanks)' },
    { id: 'l52-storage-classify', lecture: '5.2', type: 'recall',
      prompt: 'What storage (lifetime) category is  int g;  declared at file scope in C?',
      answer: 'Static.',
      points: ['Static.'],
      why: '',
      source: 'Practice item using Slides 5.2, slides 4-12 (Sebesta ch. 5 categories)' },
    { id: 'l52-storage-classify-q2', lecture: '5.2', type: 'recall',
      prompt: 'What storage (lifetime) category is  static int s;  inside a C function?',
      answer: 'Static.',
      points: ['Static.'],
      why: '',
      source: 'Practice item using Slides 5.2, slides 4-12 (Sebesta ch. 5 categories) (split from l52-storage-classify)' },
    { id: 'l52-storage-classify-q3', lecture: '5.2', type: 'recall',
      prompt: 'What storage (lifetime) category is a plain  int t;  inside a C function?',
      answer: 'Stack-dynamic.',
      points: ['Stack-dynamic.'],
      why: '',
      source: 'Practice item using Slides 5.2, slides 4-12 (Sebesta ch. 5 categories) (split from l52-storage-classify)' },
    { id: 'l52-storage-classify-q4', lecture: '5.2', type: 'recall',
      prompt: 'Inside a C function, int *p = malloc(sizeof(int)); What storage (lifetime) category is the pointer p itself?',
      answer: 'Stack-dynamic.',
      points: ['Stack-dynamic.'],
      why: 'The pointer and what it points to have different lifetimes: p dies when the function returns, the heap int lives until free().',
      source: 'Practice item using Slides 5.2, slides 4-12 (Sebesta ch. 5 categories) (split from l52-storage-classify)' },
    { id: 'l52-storage-classify-q5', lecture: '5.2', type: 'recall',
      prompt: 'Inside a C function, int *p = malloc(sizeof(int)); What storage (lifetime) category is the int that p points to?',
      answer: 'Explicit heap.',
      points: ['Explicit heap.'],
      why: 'It lives until free() is called.',
      source: 'Practice item using Slides 5.2, slides 4-12 (Sebesta ch. 5 categories) (split from l52-storage-classify)' },
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
      prompt: 'Under static scoping, what is sub2’s static parent?',
      code: `def main():
    x = 1
    def sub1():
        def sub2():
            print(x)
        sub2()
    def sub3():
        sub1()
    sub3()`,
      answer: 'sub1.',
      points: ['sub1.'],
      why: 'Static = by where the code is written.',
      source: 'Practice item applying Slides 5.2, slide 18' },
    { id: 'l52-static-parent-q2', lecture: '5.2', type: 'recall',
      prompt: 'Under static scoping, what are sub2’s static ancestors?',
      code: `def main():
    x = 1
    def sub1():
        def sub2():
            print(x)
        sub2()
    def sub3():
        sub1()
    sub3()`,
      answer: 'sub1, then main (then the global scope).',
      points: ['sub1, then main (then the global scope).'],
      why: 'sub3 calls sub1 but does not enclose it, so sub3 is not an ancestor.',
      source: 'Practice item applying Slides 5.2, slide 18 (split from l52-static-parent)' },
    { id: 'l52-static-parent-q3', lecture: '5.2', type: 'recall',
      prompt: 'Under static scoping, in which subprogram is the x in sub2 found?',
      code: `def main():
    x = 1
    def sub1():
        def sub2():
            print(x)
        sub2()
    def sub3():
        sub1()
    sub3()`,
      answer: 'main.',
      points: ['main.'],
      why: '',
      source: 'Practice item applying Slides 5.2, slide 18 (split from l52-static-parent)' },
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
      points: ['sub2 itself, then sub1 (its caller), then sub3, then main, where x is found.'],
      why: 'Dynamic = by the order of calls (main → sub3 → sub1 → sub2), searched from the most recent. Static scoping skips sub3 entirely.',
      source: 'Practice item applying Slides 5.2, slide 23' },

    // ───────────── Lecture 10: control structures ─────────────
    { id: 'l10-control-stmt', lecture: '10', type: 'recall',
      prompt: 'What is a control statement?',
      answer: 'Something that changes execution from the normal (sequential) order to something non-sequential, e.g. goto, for, while, if, a function call; in Scheme, sequencing and cond.',
      points: ['changes execution from the normal (sequential) order to a non-sequential one'],
      why: '',
      source: 'Slides 10, slide 2' },
    { id: 'l10-control-struct', lecture: '10', type: 'recall',
      prompt: 'What is a control structure?',
      answer: 'A control statement plus the collection of statements controlled by it.',
      points: ['A control statement plus the collection of statements controlled by it.'],
      why: '',
      source: 'Slides 10, slide 4' },
    { id: 'l10-turing', lecture: '10', type: 'recall',
      prompt: 'Ordered statements plus a goto with a compare are enough for Turing completeness. Why do languages still provide control structures?',
      answer: 'Goto-only code is sufficient but not structured: it cannot be read from top to bottom, so it is hard to read and maintain. Control structures give a top-to-bottom reading of the program.',
      points: ['goto is sufficient but unstructured; control structures let you read top to bottom'],
      why: 'The “what does Turing complete need” definition is on its own card (lecture 1).',
      source: 'Slides 10, slide 3' },
    { id: 'l10-design-q', lecture: '10', type: 'recall',
      prompt: 'What are the three design questions for any control structure?',
      answer: 'Can we enter the structure at multiple points (jump in, or only at the top)? Can we leave from multiple points? When we leave, must we go to the statement just below the structure, or can we go somewhere else?',
      points: ["multiple entries?","multiple exits?","exit only to the next statement?"], mode: 'quick',
      why: '',
      source: 'Slides 10, slide 5' },
    { id: 'l10-two-way-issues', lecture: '10', type: 'recall',
      prompt: 'The dangling else belongs to which design issue for two-way selection?',
      answer: 'The meaning of nested selection.',
      points: ['The meaning of nested selection.'],
      why: '',
      source: 'Slides 10, slide 7' },
    { id: 'l10-two-way-issues-q2', lecture: '10', type: 'recall',
      prompt: 'C accepting  if (userNum = favNum)  belongs to which design issue for two-way selection?',
      answer: 'The form and type of the control expression.',
      points: ['The form and type of the control expression.'],
      why: '',
      source: 'Slides 10, slide 7 (split from l10-two-way-issues)' },
    { id: 'l10-two-way-issues-q3', lecture: '10', type: 'recall',
      prompt: 'Braces versus end if belongs to which design issue for two-way selection?',
      answer: 'The form of the structure (bracketing).',
      points: ['The form of the structure (bracketing).'],
      why: '',
      source: 'Slides 10, slide 7 (split from l10-two-way-issues)' },
    { id: 'l10-assign-trace', lecture: '10', type: 'typed',
      prompt: 'The user types 3. After the “Enter your number” prompt, what does this C code print?',
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
      prompt: 'What design decision lets  if (userNum = favNum)  compile in C?',
      answer: 'In C the control expression can be arithmetic, so any nonzero value counts as true, and an assignment is an expression with a value (here 5).',
      points: ['In C the control expression can be arithmetic, so any nonzero value counts as true, and an assignment is an expression with a value (here 5).'],
      why: 'Java requires the control expression to be a boolean, so there it is a compile-time type error. Same design issue as the banana pre-test.',
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
      prompt: 'In C today and in Java, which if does a dangling else belong to?',
      answer: 'The closest previous if (a formal semantic rule).',
      points: ['The closest previous if (a formal semantic rule).'],
      why: 'Indentation means nothing to the compiler, which is why the slide indents the else misleadingly.',
      source: 'Slides 10, slides 11-12' },
    { id: 'l10-dangling-rule-q2', lecture: '10', type: 'recall',
      prompt: 'How did early versions of C handle the dangling else?',
      answer: 'They had no formal semantics for it.',
      points: ['They had no formal semantics for it.'],
      why: '',
      source: 'Slides 10, slides 11-12 (split from l10-dangling-rule)' },
    { id: 'l10-multiway-issues', lecture: '10', type: 'recall',
      prompt: 'C’s default clause answers which design issue for multi-way selection?',
      answer: 'What is done about unrepresented values.',
      points: ['What is done about unrepresented values.'],
      why: 'The original goal of multi-way selection was speed, not just a chain of conditions.',
      source: 'Slides 10, slides 14-15' },
    { id: 'l10-multiway-issues-q2', lecture: '10', type: 'recall',
      prompt: 'C’s switch falling through answers which design issue for multi-way selection?',
      answer: 'Whether execution is restricted to a single segment.',
      points: ['Whether execution is restricted to a single segment.'],
      why: '',
      source: 'Slides 10, slides 14-15 (split from l10-multiway-issues)' },
    { id: 'l10-multiway-issues-q3', lecture: '10', type: 'recall',
      prompt: 'C requiring the switch expression to be an integer answers which design issue for multi-way selection?',
      answer: 'The form and type of the control expression.',
      points: ['The form and type of the control expression.'],
      why: '',
      source: 'Slides 10, slides 14-15 (split from l10-multiway-issues)' },
    { id: 'l10-multiway-issues-q4', lecture: '10', type: 'recall',
      prompt: 'C requiring case labels to be integer constants answers which design issue for multi-way selection?',
      answer: 'How case values are specified.',
      points: ['How case values are specified.'],
      why: '',
      source: 'Slides 10, slides 14-15 (split from l10-multiway-issues)' },
    { id: 'l10-multiway-issues-q5', lecture: '10', type: 'recall',
      prompt: 'Multi-way selection: besides the control expression, single segment, case values and unrepresented values, what is the fifth design issue?',
      answer: 'How the selectable segments are specified.',
      points: ['How the selectable segments are specified.'],
      why: '',
      source: 'Slides 10, slides 14-15 (split from l10-multiway-issues)' },
    { id: 'l10-cswitch', lecture: '10', type: 'recall',
      prompt: 'Can one execution of C’s switch run more than one segment? Why?',
      answer: 'Yes. There is no implicit branch at the end of a segment, so execution falls through into the next segment until a break (“break is your friend”).',
      points: ['yes: no implicit branch at a segment’s end, so it falls through until a break'],
      why: 'This is C’s answer to the design issue “restricted to a single segment?”.',
      source: 'Slides 10, slide 17 (split from the old five-part card)' },
    { id: 'l10-cswitch-types', lecture: '10', type: 'recall',
      prompt: 'In C’s switch, what types may the control expression and the case values have?',
      answer: 'Both must be integers, or types that implicitly convert to an integer (such as char).',
      points: ['Both must be integers, or types that implicitly convert to an integer (such as char).'],
      why: 'C# relaxes this: its switch can use a string.',
      source: 'Slides 10, slide 17 (split from the old five-part card)' },
    { id: 'l10-cswitch-default', lecture: '10', type: 'recall',
      prompt: 'What does C’s switch do with a value that matches no case?',
      answer: 'Runs the default clause if there is one; with no default, the whole statement does nothing for that value.',
      points: ['Runs the default clause if there is one; with no default, the whole statement does nothing for that value.'],
      why: 'C’s answer to the design issue “what is done about unrepresented values?”.',
      source: 'Slides 10, slide 17 (split from the old five-part card)' },
    { id: 'l10-switch-why', lecture: '10', type: 'recall',
      prompt: 'What was the original goal of multi-way selection (switch)?',
      answer: 'Speed: jump straight to the right segment instead of testing a chain of conditions.',
      points: ['Speed: jump straight to the right segment instead of testing a chain of conditions.'],
      why: 'That is why switch restricts case values to constants: a jump table needs them known at compile time.',
      source: 'Slides 10, slide 14 (the jump-table remark is Sebesta, not her slide)' },
    { id: 'l10-switch-why-q2', lecture: '10', type: 'recall',
      prompt: 'What do some compilers generate for a switch instead of a direct jump to the segment?',
      answer: 'A chain of if / else-ifs.',
      points: ['A chain of if / else-ifs.'],
      why: '',
      source: 'Slides 10, slide 14 (the jump-table remark is Sebesta, not her slide) (split from l10-switch-why)' },
    { id: 'l10-csharp-switch', lecture: '10', type: 'recall',
      prompt: 'How must every C# switch segment end?',
      answer: 'With an unconditional branch (break or goto): C# allows no implicit fall-through.',
      points: ['With an unconditional branch (break or goto): C# allows no implicit fall-through.'],
      why: 'C# keeps switch’s shape but removes C’s most common switch bug.',
      source: 'Slides 10, slide 18' },
    { id: 'l10-csharp-switch-q2', lecture: '10', type: 'recall',
      prompt: 'What type can C#’s switch control expression have that C’s cannot?',
      answer: 'A string.',
      points: ['A string.'],
      why: '',
      source: 'Slides 10, slide 18 (split from l10-csharp-switch)' },
    { id: 'l10-selector', lecture: '10', type: 'recall',
      prompt: 'What is a selector expression?',
      answer: 'A selection that produces a value (an expression, not a statement).',
      points: ['A selection that produces a value (an expression, not a statement).'],
      why: 'In ML the if itself is an expression; C needs the separate ?: operator for this.',
      source: 'Slides 10, slide 13' },
    { id: 'l10-selector-q2', lecture: '10', type: 'recall',
      prompt: 'Write “m is the larger of x and y” as a C selector expression.',
      answer: 'm = x > y ? x : y;',
      points: ['m = x > y ? x : y;'],
      why: '',
      source: 'Slides 10, slide 13 (split from l10-selector)' },
    { id: 'l10-selector-q3', lecture: '10', type: 'recall',
      prompt: 'Write “m is the larger of x and y” as an ML selector expression.',
      answer: 'let m = if x > y then x else y',
      points: ['let m = if x > y then x else y'],
      why: '',
      source: 'Slides 10, slide 13 (split from l10-selector)' },
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
      prompt: 'Pretest versus posttest answers which design issue for iteration?',
      answer: 'Where the done-test is: at the top (pretest) or the bottom (posttest).',
      points: ['Where the done-test is: at the top (pretest) or the bottom (posttest).'],
      why: '',
      source: 'Slides 10, slide 22' },
    { id: 'l10-iter-design-q2', lecture: '10', type: 'recall',
      prompt: 'What three ways can a loop’s iteration be controlled?',
      answer: 'Logically, by a count, or by a data type with its own iterator.',
      points: ["Logically","by a count","by a data type with its own iterator"], mode: 'quick',
      why: '',
      source: 'Slides 10, slide 22 (split from l10-iter-design)' },
    { id: 'l10-iter-design-q3', lecture: '10', type: 'recall',
      prompt: 'C’s goto answers “yes” and Java’s loops “no” to which design issue for iteration?',
      answer: 'Can a loop be entered somewhere other than the top?',
      points: ['Can a loop be entered somewhere other than the top?'],
      why: 'C’s goto can enter anywhere; Java’s loops must be entered from the top.',
      source: 'Slides 10, slide 22 (split from l10-iter-design)' },
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
      prompt: 'Why does  i *= 5  change how many times the C loop runs?',
      code: `Python                       C
for i in range(10):          for(i = 0; i < 10; i++){
    print(i)                     printf("%d ", i);
    i *= 5                       i *= 5;
                             }`,
      answer: 'C’s for(exp1; exp2; exp3) is really a while loop over an ordinary variable, so changing i changes the test.',
      points: ['C’s for(exp1; exp2; exp3) is really a while loop over an ordinary variable, so changing i changes the test.'],
      why: 'The intent of a counted loop is easy counting; C’s version is more general than the intent.',
      source: 'Slides 10, slides 23-24' },
    { id: 'l10-loop-compare-q2', lecture: '10', type: 'recall',
      prompt: 'Why does  i *= 5  not change the Python loop?',
      code: `Python                       C
for i in range(10):          for(i = 0; i < 10; i++){
    print(i)                     printf("%d ", i);
    i *= 5                       i *= 5;
                             }`,
      answer: 'Python’s for takes the next value from range() each time, so changes to i inside the body are overwritten.',
      points: ['Python’s for takes the next value from range() each time, so changes to i inside the body are overwritten.'],
      why: '',
      source: 'Slides 10, slides 23-24 (split from l10-loop-compare)' },
    { id: 'l10-other-loops', lecture: '10', type: 'recall',
      prompt: 'Logical loops (while, do … while) are considered harder to write. What three things must they include?',
      answer: 'Initialization of the variable(s); a stopping condition; a way to get the variables to the stopping condition.',
      points: ["Initialization of the variable(s)","a stopping condition","a way to get the variables to the stopping condition"], mode: 'quick',
      why: 'Forget the third and you have an infinite loop.',
      source: 'Slides 10, slide 25' },
    { id: 'l10-break-continue', lecture: '10', type: 'recall',
      prompt: 'In Java, what does break do?',
      answer: 'Exits the closest loop or switch.',
      points: ['Exits the closest loop or switch.'],
      why: 'Java has no goto; loops must be entered from the top.',
      source: 'Slides 10, slide 26' },
    { id: 'l10-break-continue-q2', lecture: '10', type: 'recall',
      prompt: 'In Java, what does continue do?',
      answer: 'Returns to the top of the closest loop (its next iteration).',
      points: ['Returns to the top of the closest loop (its next iteration).'],
      why: '',
      source: 'Slides 10, slide 26 (split from l10-break-continue)' },
    { id: 'l10-break-continue-q3', lecture: '10', type: 'recall',
      prompt: 'In Java, how do you exit an outer loop from inside an inner one?',
      answer: 'A labelled break.',
      points: ['A labelled break.'],
      why: '',
      source: 'Slides 10, slide 26 (split from l10-break-continue)' },
    { id: 'l10-foreach', lecture: '10', type: 'recall',
      prompt: 'In iteration built into a data type (for-each), what does the library creator write, so that users get for-each for free?',
      answer: 'An iterator (Iterable in Java): code that tracks the current element and moves to the next.',
      points: ['An iterator (Iterable in Java): code that tracks the current element and moves to the next.'],
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
      type: 'recall', mode: 'write',
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
