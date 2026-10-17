// "Help" walkthroughs for CSC 370 Lecture 2 (history of programming languages), second half:
// Fortran, Lisp, Algol, COBOL and Prolog, plus the palindrome code-identification cards.
// Same entry format as decks/csc370-help.js (see the header comment there).
// Facts come from her Lecture 2 slides and Sebesta ch. 2 (and ch. 5 and 10 for static storage).
// The Scheme, C and Python-ported examples were run on 2026-10-16 (guile, gcc, python3).
// No Fortran, Algol, COBOL or Prolog system is installed, so those snippets are short,
// standard forms that were checked by hand, not executed.
(function (FC) {
  'use strict';
  const H = FC.help = FC.help || {};

  // ---------------------------------------------------------------- Which language? (post-test)

  H['l2-fortran-names'] = {
    asks: 'One of these languages decided a variable’s type from the first letter of its name: I, J, K, L, M or N meant integer, anything else meant real. Which one?',
    idea: 'Fortran I (1957) had no type declarations at all, so the name itself had to carry the type. Scientists already wrote i, j and k for subscripts, so those letters (plus L, M and N) became integers, and everything else became real (floating point).',
    steps: [
      { text: 'The rule in action:', table: { head: ['name', 'first letter', 'type'], rows: [['`I`', 'I', 'integer'], ['`KOUNT`', 'K', 'integer'], ['`NUM`', 'N', 'integer'], ['`X`', 'X', 'real'], ['`ALPHA`', 'A', 'real']] } },
      'Why those letters: scientists and engineers used i, j and k as subscripts, and the designers added L, M and N (Sebesta).',
      'An old programmers’ joke makes it stick: "GOD is real, unless declared integer." G is outside I to N, so GOD is real. Declarations only arrived later, in Fortran IV.',
      'The wrong options do it differently: Plankalkül wrote each variable’s type on a separate line under it, COBOL describes every variable in its DATA DIVISION, and Algol formalized declared data types.',
    ],
    answer: 'FORTRAN (Fortran I): no type declarations, so names starting with I to N were integers and all others were reals.',
    mistake: 'Picking Algol because "types" sounds like Algol. Algol is the one that formalized declared data types; Fortran I is the one that had no declarations at all.',
    tryIt: { q: 'In Fortran I, which of these are integers: `MAX`, `TOTAL`, `JDAY`, `RATE`?', a: '`MAX` (M) and `JDAY` (J) are integers. `TOTAL` and `RATE` are reals, because T and R are outside I to N.' },
  };

  H['l2-prolog-true'] = {
    asks: 'In which language is a program just a list of statements about what is true, rather than steps for the computer to follow?',
    idea: 'Prolog means PROgramming LOGic. You never tell it HOW to compute. You tell it facts and rules, then ask a question, and it tries to prove the answer from what it was told.',
    steps: [
      'Algol and COBOL are step-by-step languages, and Scheme computes by applying functions. Prolog is non-procedural: there is no "do this, then that".',
      { text: 'A tiny Prolog program. Every line is a claim that is true:', code: 'parent(tom, bob).\nparent(bob, ann).\ngrandparent(X, Z) :- parent(X, Y), parent(Y, Z).' },
      '`:-` reads "is true if". The rule says: X is a grandparent of Z if X is a parent of some Y and that Y is a parent of Z.',
      { text: 'Running the program means asking a query. Prolog finds Y = bob and proves it:', code: '?- grandparent(tom, ann).\ntrue.' },
    ],
    answer: 'Prolog: a program is facts and rules (what is true), and you run it by asking a query.',
    mistake: 'Picking Scheme because it also looks unlike C. Scheme is functional: you still describe a computation, as functions applied to arguments. Only Prolog just states what is true.',
    tryIt: { q: 'With the facts above, what does `?- parent(ann, tom).` answer, and why?', a: '`false.` No fact or rule says ann is a parent of tom, so Prolog cannot prove it, and what it cannot prove it answers false.' },
  };

  H['l2-algol-committee'] = {
    asks: 'Which language was designed by an international committee, people from more than one country, rather than by one company or one person?',
    idea: 'In 1957 every new language was tied to one maker’s machines, and Fortran belonged to IBM. So American and European computing groups joined forces to design one universal, machine-independent language. That joint design was Algol.',
    steps: [
      { text: 'Who made each option:', table: { head: ['language', 'made by'], rows: [['FORTRAN', 'John Backus’s group at IBM'], ['LISP', 'John McCarthy at MIT'], ['Algol', 'a committee: ACM (U.S.) + GAMM (Germany)'], ['Prolog', 'a small research group in Marseille, helped from Edinburgh']] } },
      'The first design meeting was in Zurich in 1958, four members from each side. It was the first time an international group had designed a programming language (Sebesta).',
      'You can see the committee in the arguments: should the decimal point be a comma (European) or a period (American)?',
      'Chain: international committee → machine-independent goal → no I/O (I/O depends on the machine) → died quickly in the U.S. → yet most later languages descend from it.',
    ],
    answer: 'Algol, designed by a joint U.S. (ACM) and European (GAMM, Germany) committee.',
    mistake: 'Picking COBOL: it was also designed by a committee, but an American one sponsored by the U.S. Department of Defense. "International" is Algol’s mark.',
    tryIt: { q: 'Which language came from a 1959 committee sponsored by the U.S. Department of Defense, and how is it different from Algol’s committee?', a: 'COBOL. Its committee was American and aimed at business records; Algol’s was international (U.S. + Germany) and aimed at a universal scientific language.' },
  };

  H['l2-algol-today'] = {
    asks: 'Which language is used today mainly as a way to write algorithms down (in books, papers and notes), rather than to run programs?',
    idea: 'One of Algol’s three design subgoals was "good for describing algorithms in publications". Algol failed as a product, but that subgoal succeeded: the pseudocode in textbooks still looks like Algol.',
    steps: [
      'The name says it: ALGOrithmic Language.',
      { text: 'A loop in Algol 60 (in the style of Sebesta’s example):', code: 'for counter := 1 step 1 until listlen do\nbegin\n  sum := sum + intlist[counter]\nend;' },
      'Notice `:=`, `begin … end` and `for … do`: the same shapes you see in textbook pseudocode, which often writes `←` where Algol writes `:=`.',
      'The other options are still run for real: FORTRAN for scientific computing, COBOL for business systems, LISP inside Emacs. Algol survives as notation, and as the ancestor of most languages around today.',
    ],
    answer: 'Algol: its notation is still how algorithms are written down.',
    mistake: 'Picking FORTRAN because it is about formulas. Fortran is still used to run real programs; Algol is the one that lives on mainly as the way algorithms are written.',
    tryIt: { q: 'Which of Algol’s three subgoals explains how it is used today?', a: '"Good for describing algorithms in publications." That is exactly what it is used for now.' },
  };

  H['l2-cobol-sections'] = {
    asks: 'Which language splits every program into a part that only describes the data and a separate part that holds the actions?',
    idea: 'COBOL was built for business records: payroll, accounts, printed reports. The data (every field, its size, where its decimal point goes) mattered so much that it got its own division, separate from the procedure division that does the work.',
    steps: [
      'One of the 1959 committee’s early decisions: split statements into data description and executable operations, and keep the two in different parts of the program (Sebesta).',
      { text: 'The skeleton of her COBOL palindrome:', code: 'identification division.\n    function-id. palindromic-test.\ndata division.\n    01 result      pic x.\nprocedure division ...\n    set palindromic to true' },
      { text: 'What each division holds:', table: { head: ['division', 'holds'], rows: [['identification', 'the program’s name'], ['data', 'every variable, with its picture (`pic`): its kind and size'], ['procedure', 'the statements that actually run']] } },
      'Where it led: careful data descriptions gave COBOL hierarchical records, which prompted structs in C, and eventually objects.',
    ],
    answer: 'COBOL: its DATA DIVISION describes the data, and its PROCEDURE DIVISION holds the control (the actions).',
    mistake: 'Thinking any language with declarations counts. In C or Fortran, declarations sit inside the same function as the code; COBOL puts data and actions in different divisions of the program.',
    tryIt: { q: 'In COBOL, where does `01 total-pay pic 9(5)v99.` go, and where does `add bonus to total-pay` go?', a: 'The first describes data, so the DATA DIVISION. The second is an action, so the PROCEDURE DIVISION.' },
  };

  H['l2-recursion'] = {
    asks: 'Of the course’s languages, which two originally had no loop statement at all, so the only way to repeat something was for a function (or rule) to call itself?',
    idea: 'Both are "say what, not how" languages. Lisp computes by applying functions to arguments; Prolog by proving facts and rules. Neither had a loop, so a definition that refers to itself does the repeating.',
    steps: [
      { text: 'How each language repeats:', table: { head: ['language', 'repetition'], rows: [['FORTRAN', '`DO` loop'], ['Algol', '`for … step … until … do`'], ['COBOL', '`PERFORM` (its loop verb)'], ['LISP', 'a function that calls itself'], ['Prolog', 'a rule that uses itself']] } },
      'Why Lisp: McCarthy’s first problem was differentiating algebraic expressions, which needed recursion and conditionals. Fortran I had neither, so Lisp was built on them.',
      { text: 'Lisp (Scheme) counting down with no loop. `(count-down 3)` gives `(3 2 1)`:', code: '(define (count-down n)\n  (if (= n 0)\n      \'()\n      (cons n (count-down (- n 1)))))' },
      { text: 'Prolog: an ancestor is a parent, or a parent of an ancestor. The second rule uses itself:', code: 'ancestor(X, Z) :- parent(X, Z).\nancestor(X, Z) :- parent(X, Y), ancestor(Y, Z).' },
    ],
    answer: 'LISP and Prolog.',
    mistake: 'Picking Algol because it brought recursion to a non-functional language. Algol allowed recursion, but it also had a `for` loop. The question wants the languages where recursion was the ONLY way to repeat.',
    tryIt: { q: 'Write a Scheme function `(sum-to n)` that adds 1 + 2 + … + n without a loop. What is `(sum-to 4)`?', a: '`(define (sum-to n) (if (= n 0) 0 (+ n (sum-to (- n 1)))))`. Then `(sum-to 4)` = 4 + 3 + 2 + 1 + 0 = 10.' },
  };

  H['l2-wsut-oldest'] = {
    asks: 'Her slides tag some languages "WSUT" (best reading: Widely Still Used Today). Which of these is the oldest language that still carries that tag?',
    idea: 'Two filters: is it old, and is it still widely used? Plankalkül passes the first and fails the second. FORTRAN, compiled in 1957, is the oldest language that passes both.',
    steps: [
      { text: 'Put the options on a timeline:', table: { head: ['language', 'date', 'widely used today?'], rows: [['Plankalkül', '1945 (published 1972)', 'no: never in use'], ['FORTRAN', '1957', 'yes: oldest WSUT'], ['LISP', '1958', 'yes: 2nd oldest'], ['COBOL', '1959', 'yes: 3rd oldest']] } },
      'Plankalkül was Konrad Zuse’s design, unpublished until 1972, so nobody could use it. It is older, but it was never in wide use.',
      'Why Fortran lasted: it was first, its compiled code was nearly as fast as hand-written code, and it kept growing: Fortran 90, 2003, 2008 (concurrent) and 2018 (parallel).',
    ],
    answer: 'FORTRAN: the oldest language that is still widely used.',
    mistake: 'Picking Plankalkül because it is the oldest design. "Still widely used" rules it out: it was never used at all in its time.',
    tryIt: { q: 'Which WSUT language is the 3rd oldest?', a: 'COBOL (1959), after FORTRAN (1957) and LISP (1958).' },
  };

  H['l2-wsut-order'] = {
    asks: 'Put FORTRAN, LISP and COBOL in order from oldest to newest.',
    idea: 'They arrived one year apart, and each answered a different need: numbers for scientists, then symbols for AI, then records for business. Formulas, Lists, Commerce: 57, 58, 59.',
    steps: [
      { text: 'One year, one problem each:', table: { head: ['year', 'language', 'problem it solved'], rows: [['1957', 'FORTRAN I compiler', 'fast math for scientists'], ['1958', 'LISP designed', 'list processing for AI'], ['1959', 'COBOL', 'readable programs for business data']] } },
      'Lisp follows Fortran for a reason: McCarthy needed recursion and conditionals, and Fortran I had neither.',
      'COBOL follows because in 1959 business computing was where scientific computing had been a few years earlier, before Fortran (Sebesta). Business wanted its own common language.',
    ],
    answer: 'FORTRAN (1957), LISP (1958), COBOL (1959).',
    mistake: 'Putting COBOL first because it "feels oldest" (it runs old bank systems). It is the youngest of the three.',
    tryIt: { q: 'Order Prolog, FORTRAN, Python and COBOL from oldest to newest.', a: 'FORTRAN (1957), COBOL (1959), Prolog (1972), Python (1991).' },
  };

  H['l2-newest'] = {
    asks: 'Which of these four languages was created most recently?',
    idea: 'Python is from a different era. LISP and COBOL are from the first wave of high-level languages (late 1950s), Prolog is from the 1970s, and Python arrived in 1991.',
    steps: [
      { text: 'Put them on a timeline:', table: { head: ['language', 'year'], rows: [['LISP', '1958'], ['COBOL', '1959'], ['Prolog', '1972'], ['Python', '1991']] } },
      'On her test the list also had C (1972) and Java (1995). Strictly, Java is newer than Python, but her key marks Python as the newest, so if both appear, answer Python as her key does.',
    ],
    answer: 'Python (1991).',
    mistake: 'Picking Prolog because logic programming feels modern. Prolog is from 1972, almost 20 years before Python.',
    tryIt: { q: 'Which is older, Prolog or COBOL, and by about how much?', a: 'COBOL (1959) is older than Prolog (1972), by about 13 years.' },
  };

  // ---------------------------------------------------------------- Plankalkül and Fortran

  H['l2-plankalkul'] = {
    asks: 'Name the person behind Plankalkül and say what kind of thing it was.',
    idea: 'A language far ahead of its time that nobody saw. Konrad Zuse designed it alone in Germany in 1945, for his Z4 relay computer. It was not published until 1972, so the world had to reinvent its ideas.',
    steps: [
      'Plankalkül means "Program Calculus". It was a high-level language design: Zuse wrote real algorithms in it, from sorting to graph connectivity to 49 pages of chess (Sebesta).',
      'It already had what 1950s languages added later: floating point, arrays and records (even records inside records).',
      { text: 'Java’s `A[5] = A[4] + 1` in Plankalkül. Row V holds the subscripts, row S the data types (`1.n` = an n-bit integer):', code: '  | A + 1 => A\nV | 4        5\nS | 1.n      1.n' },
      'Chain: not published → nobody knew it → never implemented at the time → the credit went to Fortran, Lisp, Algol and COBOL. Some of its features did not appear elsewhere until about 15 years later.',
    ],
    answer: 'Konrad Zuse’s "Program Calculus" (1945, published 1972): an early high-level language design, never implemented at the time, that already had floating point, arrays and records.',
    mistake: 'Calling it the first widely used language. It was the earliest high-level design, but nobody used it; FORTRAN is the oldest language still widely used.',
    tryIt: { q: 'Records were already in Zuse’s 1945 design. Which language was the first to actually implement them, and what did that lead to?', a: 'COBOL (1959). Its records prompted structs in C, and eventually object-oriented programming.' },
  };

  H['l2-fortran-acronym'] = {
    asks: 'Expand the name FORTRAN.',
    idea: 'The name is the job description: take a FORmula as a scientist writes it and TRANslate it into machine code.',
    steps: [
      { text: 'Before Fortran, scientists hand-coded machine language. With Fortran they could write the formula itself and let the compiler produce the machine code:', code: 'Y = A*X**2 + B*X + C' },
      'The 1954 report was titled "The IBM Mathematical FORmula TRANslating System: FORTRAN" (Sebesta).',
      { text: 'The names of this lecture all describe their job:', table: { head: ['name', 'stands for'], rows: [['FORTRAN', 'FORmula TRANslation'], ['LISP', 'LISt Processing'], ['ALGOL', 'ALGOrithmic Language'], ['Prolog', 'PROgramming LOGic']] } },
    ],
    answer: 'FORmula TRANslation (also given as "formula translator").',
    mistake: 'Guessing "FORmat TRANslation" or "FORmal TRANslation". Think of what scientists fed it: formulas.',
    tryIt: { q: 'What do LISP and Prolog stand for?', a: 'LISP = LISt Processing; Prolog = PROgramming LOGic.' },
  };

  H['l2-ibm704'] = {
    asks: 'Fortran was designed for the IBM 704. What feature of that machine made it special?',
    idea: 'Before the 704, floating-point math ran in software and was so slow that a slow interpreter’s extra cost was barely noticed. Put floating point into hardware and that hiding place disappears: now only fast compiled code makes sense.',
    steps: [
      'Earlier machines had no floating-point hardware, so every floating-point operation was simulated in software, a very slow process.',
      'That is why slow interpretive systems were tolerated: their overhead was small next to the software floating point.',
      'The IBM 704 (announced 1954) had floating-point (and indexing) instructions in hardware. Floating point became fast, so the interpreter’s overhead was suddenly the slow part.',
      'Result: a compiler producing fast machine code was worth building. That compiler was Fortran.',
      'Her slide calls it the first computer with floating-point hardware; that is the answer to give. (Strictly it was the first mass-produced one: Zuse’s relay machines had floating point earlier.)',
    ],
    answer: 'It was the first computer with floating-point hardware.',
    mistake: 'Answering "it was the first computer" or "the first with a compiler". The special part is floating-point hardware, and that is what made compiled code worth having.',
    tryIt: { q: 'Why did programmers put up with slow interpreters before the 704?', a: 'All floating-point math was simulated in software, which was so slow that the interpreter’s extra cost hardly mattered.' },
  };

  H['l2-fortran-goal'] = {
    asks: 'What was the one main goal of Fortran I, the first Fortran that actually ran (1957)?',
    idea: 'In the 1950s computers were expensive and programmers were cheap, and good programmers hand-coded machine language. They would only switch if the compiler’s machine code was as good as their own, so the speed of the output code decided everything.',
    steps: [
      'The setting (Sebesta): small, slow, unreliable machines; mostly scientific work; and computers cost far more than programmers. So the speed of the generated code was the primary goal.',
      'That is where the effort went: most of the 18 worker-years spent building the first compiler went into optimization.',
      'It worked. The team nearly reached its efficiency goal, and by April 1958 roughly half the code written for 704s was Fortran.',
      'The same goal explains other choices: every variable’s type and storage was fixed before run time, which let the compiler optimize hard (at the cost of no recursion).',
    ],
    answer: 'Generate machine code as good as the machine code someone could write by hand.',
    mistake: 'Answering "make programming easier" or "eliminate bugs". Easier writing was a bonus; the goal that shaped Fortran I was fast output code.',
    tryIt: { q: 'Fortran I fixed every variable’s type and storage before the program ran. How did that serve the main goal?', a: 'Nothing had to be allocated or type-checked during execution, so the compiler could produce faster, highly optimized machine code. The price was flexibility: no recursion.' },
  };

  H['l2-fortran-1954'] = {
    asks: 'In 1954, before any Fortran compiler existed, a report described the language. What two promises did that report make?',
    idea: 'The report had to win over skeptics who coded by hand. One promise was bold but nearly kept (speed); the other was pure optimism (no more bugs).',
    steps: [
      'November 1954: John Backus’s group at IBM wrote the report on "Fortran 0". It existed only on paper; Fortran 0 even limited variable names to two characters.',
      { text: 'The two claims and what became of them:', table: { head: ['claim', 'what happened'], rows: [['as efficient as hand-coded machine code', 'Fortran I (1957) came close: this was the real design goal'], ['would eliminate coding errors and debugging', 'wildly wrong; and because of it, the first compiler did little syntax error checking']] } },
      'Chain: the speed claim → a heavily optimizing compiler → programmers gave up hand coding → Fortran became the oldest language still widely used.',
    ],
    answer: 'That compiled Fortran would be as efficient as hand-coded machine code, and that it would eliminate coding errors and debugging.',
    mistake: 'Remembering only the speed claim. The second one (no more errors or debugging) is the famous over-promise, and you need both.',
    tryIt: { q: 'Which of the two 1954 claims turned out roughly true, and which false?', a: 'Speed was roughly true: Fortran I came close to hand-coded efficiency. "No errors or debugging" was false: programs still had bugs, and the first compiler barely checked syntax.' },
  };

  H['l2-fortran-typing'] = {
    asks: 'Fortran I had no declarations like `int x;`. So how did the compiler know each variable’s type?',
    idea: 'The name was the declaration. First letter I to N: integer. Any other first letter: real (floating point).',
    steps: [
      { text: 'Read the type straight off the name:', table: { head: ['name', 'first letter', 'type'], rows: [['`INDEX`', 'I', 'integer'], ['`NSTEPS`', 'N', 'integer'], ['`XVAL`', 'X', 'real'], ['`SPEED`', 'S', 'real']] } },
      'Why I to N: scientists used i, j and k as subscripts, and the designers threw in L, M and N. Memory hook: the first two letters of INteger, I and N, are the two ends of the range.',
      'Either way, every type was fixed before the program ran, which helped the compiler make fast code, Fortran’s main goal.',
      'Fortran IV (1962) added explicit type declarations, so a programmer could finally choose a type regardless of the name.',
    ],
    answer: 'From its name, since there were no type declarations: names starting with I, J, K, L, M or N were integers, and all others were reals.',
    mistake: 'Remembering only I, J and K. The range is I through N: six letters, I J K L M N.',
    tryIt: { q: 'A Fortran I programmer wants the average of some values and stores it in `MEAN`. What type is `MEAN`, and what goes wrong?', a: '`MEAN` starts with M, so it is an integer: any fractional part of the average is lost. A real needs a name outside I to N, such as `AVG` or `XMEAN`.' },
  };

  H['l2-fortran-if'] = {
    asks: 'Fortran I’s IF statement jumped to one of three places. What decided which one?',
    idea: 'It did not test true or false. It computed ONE number and jumped according to its sign: negative, zero or positive. (All of Fortran I’s control statements were based on IBM 704 instructions.)',
    steps: [
      { text: 'The form: three statement labels after the expression.', code: 'IF (X - Y) 10, 20, 30' },
      { text: 'Label 10 if X − Y is negative, 20 if it is zero, 30 if it is positive:', table: { head: ['X', 'Y', 'X − Y', 'jumps to'], rows: [['3', '5', '−2 (negative)', '10'], ['5', '5', '0 (zero)', '20'], ['9', '5', '4 (positive)', '30']] } },
      'So to ask "is X less than Y?" you subtract and look at the sign. Logical IFs with `.LT.`, `.AND.` and friends only came in Fortran IV.',
    ],
    answer: 'Negative, zero and positive: the sign of the tested expression picks one of three labels.',
    mistake: 'Thinking of if / else-if / else on true and false. The 3-way IF tests the sign of a number, not a condition.',
    tryIt: { q: '`IF (N - 10) 100, 200, 300` with N = 12. Where does it jump?', a: 'N − 10 = 2, which is positive, so it jumps to label 300.' },
  };

  H['l2-fortran-sub'] = {
    asks: 'Fortran I had subroutines, but they had two limits. What two things could they not be?',
    idea: 'Two limits, two causes. Not external: the whole program was compiled in one go. Not recursive: every variable had one fixed memory spot, so there was nowhere to put a second copy.',
    steps: [
      'Not external: a subroutine could not be compiled separately. On the unreliable 704, a long compile often died before finishing, which in practice kept programs to about 300 to 400 lines (Sebesta).',
      'Not recursive: in Fortran I (and every Fortran before 90) the storage for all variables was fixed before run time. A recursive call needs a fresh copy of the local variables, and there was no place for one. (Lecture 5: a language with only static variables cannot support recursion.)',
      { text: 'Both limits were later lifted:', table: { head: ['limit', 'cause', 'lifted in'], rows: [['not external', 'everything compiled together', 'Fortran II (1958): independent compilation'], ['not recursive', 'all storage fixed before run time', 'Fortran 90']] } },
    ],
    answer: 'They could not be external (separately compiled) and could not be recursive.',
    mistake: 'Saying Fortran I had no subroutines. It had them; they were just limited.',
    tryIt: { q: 'Why was a 2,000-line Fortran I program impractical, and which version fixed that?', a: 'With no separate compilation, the whole program had to compile in one run on an unreliable machine, so long programs rarely compiled before a failure. Fortran II (1958) added independent compilation.' },
  };

  // ---------------------------------------------------------------- Lisp

  H['l2-lisp-origin'] = {
    asks: 'Expand the name LISP and name the person who designed it.',
    idea: 'Artificial-intelligence researchers wanted computers to work with symbols (words, expressions), not only numbers. Symbols fit naturally into lists, so the language was built around LISt Processing.',
    steps: [
      '1958: John McCarthy (MIT) studied symbolic computation, using differentiation of algebraic expressions as his example problem.',
      'That needed recursion and conditionals, and Fortran I had neither. So a new language was needed: Lisp.',
      'Pure Lisp has two kinds of data, atoms like `grizzly` and lists like `(lynx (grizzly black) moose)`, and one kind of computation: applying functions to arguments.',
      { text: 'In Scheme, `car` takes the first element of a list:', code: '(car \'(lynx (grizzly black) moose))   ; => lynx' },
      'Her timeline: 1958 on paper (McCarthy, MIT), 1959 first implemented by Steve Russell on the IBM 704.',
    ],
    answer: 'LISt Processing; designed by John McCarthy (MIT, 1958).',
    mistake: 'Expanding it as "LISt Programming". It is LISt Processing: the language exists to process lists.',
    tryIt: { q: 'How many top-level elements does the Lisp list `(elk (whitetail mule))` have?', a: 'Two: the atom `elk` and the sublist `(whitetail mule)`. `(length \'(elk (whitetail mule)))` returns 2.' },
  };

  H['l2-lisp-dialects'] = {
    asks: 'Lisp has many versions. Which two are its main dialects today?',
    idea: 'Lisp splintered into many versions, and programs could not move between them. Two standards came out of that: a big one that combined several dialects (Common Lisp) and a small, clean one (Scheme).',
    steps: [
      { text: 'The two dialects:', table: { head: ['dialect', 'standard', 'character (Sebesta)'], rows: [['Common Lisp', 'ANSI 1994', 'large: combines the features of several dialects'], ['Scheme', 'IEEE 1995', 'small and simple: the one this course uses']] } },
      'More than 20 kinds exist (Clojure, Racket, Emacs Lisp …), but her slide names these two as the dialects.',
      { text: 'Scheme, the one you will write:', code: '(define (square x) (* x x))\n(square 5)   ; => 25' },
    ],
    answer: 'Common Lisp and Scheme.',
    mistake: 'Naming Clojure or Racket. They are Lisps too, but the two main dialects on her slide are Common Lisp and Scheme.',
    tryIt: { q: 'Which standards body standardized each dialect, and when?', a: 'Common Lisp: ANSI, 1994. Scheme: IEEE, 1995.' },
  };

  H['l2-lisp-status'] = {
    asks: 'Give the three facts her slides state about where Lisp stands today.',
    idea: 'Rise, fall, survival: Lisp ran AI for a quarter century, even got its own hardware, the hardware died, and the language lives on inside a text editor.',
    steps: [
      { text: 'The three facts:', table: { head: ['fact', 'detail'], rows: [['dominated AI for about 25 years', 'Sebesta: it "completely dominated AI applications for a quarter century"'], ['Lisp machines died out', 'computers built to run Lisp, first in 1973 (Greenblatt and Knight); about 8000 were made'], ['lives on in Emacs', 'Emacs = Editor MACroS; you customize it in its own dialect, Emacs Lisp']] } },
      { text: 'A line from an Emacs settings file, which is Lisp:', code: '(setq fill-column 80)' },
      'Her slide also calls Lisp "still leader" for AI. That is a dated claim: in 2026 most AI work is done in Python. For her test, give the slide’s answer.',
    ],
    answer: 'It dominated AI for about 25 years; Lisp machines have died out; it lives on inside Emacs (Editor MACroS).',
    mistake: 'Saying "Lisp is dead". The Lisp machines died; the language did not (Emacs, Common Lisp, Scheme).',
    tryIt: { q: 'What does Emacs stand for, and how is Lisp involved?', a: 'Editor MACroS. The editor is customized and extended in its own Lisp dialect, Emacs Lisp.' },
  };

  // ---------------------------------------------------------------- Algol

  H['l2-algol-origin'] = {
    asks: 'Expand the name ALGOL and say what it was trying to be.',
    idea: 'By 1957 every language grew up around one family of machines (some UNIVAC, some IBM), so programs could not be shared. Algol was the fix: one universal language for algorithms that would work on any architecture.',
    steps: [
      'The name is the goal: ALGOrithmic Language, a language for expressing algorithms.',
      { text: 'Each problem of 1957 and Algol’s answer to it:', table: { head: ['problem', 'Algol’s answer'], rows: [['each language ran on one maker’s machines', 'a machine-independent design'], ['Fortran was owned by IBM alone', 'an open design by a U.S. + European committee'], ['no common way to publish algorithms', 'a notation good for publications']] } },
      'Same era as Lisp and Fortran (late 1950s): the first report was Algol 58, and the influential version was Algol 60.',
      'Machine independence had a price: I/O depends on the machine, so Algol left it out. That is one reason it died quickly in the U.S.',
    ],
    answer: 'ALGOrithmic Language: a universal, machine-independent language for expressing algorithms, one that would work on more than one architecture.',
    mistake: 'Expanding it as "ALGebraic Language". It is ALGOrithmic Language, a language for algorithms.',
    tryIt: { q: 'Why couldn’t Fortran simply become the universal language in 1958?', a: 'It was owned solely by IBM, and was built around IBM’s machines, so other makers and users could not adopt it as a common standard.' },
  };

  H['l2-algol-subgoals'] = {
    asks: 'Algol’s designers started with three subgoals. Name all three.',
    idea: 'Picture three readers of an Algol program: a mathematician (it should look like math), a journal reader (it should be publishable), and the computer (it must translate into machine code).',
    steps: [
      { text: 'One subgoal per reader:', table: { head: ['reader', 'subgoal'], rows: [['mathematician', 'syntax close to mathematical notation'], ['journal reader', 'good for describing algorithms in publications'], ['computer', 'mechanically translatable into machine code']] } },
      'These were set at the first meeting, in Zurich in 1958. Sebesta notes the second was entirely new to computing, and the third is needed by any programming language.',
      { text: 'Algol 60 reads almost like the math it computes:', code: 'average := sum / listlen;\nif intlist[counter] > average then result := result + 1' },
      'Long-term effect: subgoal 2 won. Pseudocode in textbooks still looks like Algol.',
    ],
    answer: 'Syntax close to mathematical notation; good for describing algorithms in publications; mechanically translatable into machine code.',
    mistake: 'Listing "machine independent" as a subgoal. That was the overall goal (a universal language); the three subgoals are math notation, publication, and translatable.',
    tryIt: { q: 'Which subgoal does `x := (a + b) / 2` show off, and which subgoal is true of every programming language?', a: '`x := (a + b) / 2` shows "syntax close to mathematical notation". "Mechanically translatable into machine code" is needed by any programming language.' },
  };

  H['l2-algol-death'] = {
    asks: 'Algol never caught on in the U.S. Give four reasons.',
    idea: 'Two reasons were its own design (no I/O, a scary syntax description) and two were politics (IBM backed Fortran, and the U.S. wanted a language of its own).',
    steps: [
      { text: 'The four reasons and what is behind each:', table: { head: ['reason', 'why'], rows: [['no I/O statements', 'I/O depends on the machine, and Algol was meant to be machine independent, so each implementation did its own I/O'], ['BNF was hard to understand', 'Backus-Naur Form looked strange and complicated in 1960'], ['IBM owned Fortran', 'the biggest maker gave Algol no support'], ['the U.S. wanted its own language', 'it built its own group-driven language, COBOL']] } },
      'The irony: BNF, one reason it died, became one of its greatest gifts. Formal syntax specification led to general parsers, and BNF is now the standard way to write grammars.',
      'Then Algol 68 was a complete redesign rather than a fix, which did not help.',
      'It died commercially but not as an idea: block structure, `:=`, recursion in an imperative language, and most languages today descend from it.',
    ],
    answer: 'No I/O (left out because I/O is machine dependent); its BNF description was hard to understand; IBM owned Fortran, so IBM would not support Algol; the U.S. wanted its own language. (Algol 68 then made a complete redesign.)',
    mistake: 'Concluding Algol was a bad language. It failed commercially in the U.S. for these four reasons, but its ideas won.',
    tryIt: { q: 'Which of the four reasons was a direct side effect of Algol’s main goal?', a: 'No I/O. The goal was machine independence, and I/O depends on the machine, so it was left out.' },
  };

  // ---------------------------------------------------------------- COBOL

  H['l2-cobol-hopper'] = {
    asks: 'Which person is COBOL most associated with, and in which direction did she push programming notation?',
    idea: 'Grace Hopper’s 1953 proposal: "mathematical programs should be written in mathematical notation, data processing programs should be written in English statements" (Sebesta). Business people are not mathematicians, so business code should read like English.',
    steps: [
      'In 1953 almost nobody believed a computer could understand English words. Her proposal became FLOW-MATIC at UNIVAC (1957), the main ancestor of COBOL; it was sold with a demo compiling English, then French, then German keywords.',
      'COBOL (1959, designed by a committee) carried that English style forward.',
      { text: 'The same addition, both ways:', table: { head: ['style', 'code'], rows: [['math (Fortran)', '`TPAY = TPAY + BONUS`'], ['English (COBOL)', '`add bonus to total-pay`']] } },
      'Hook from her slides: Hopper is also tied to the 1947 "first computer bug", a moth found in a relay.',
    ],
    answer: 'Grace Hopper: towards English, away from mathematical notation.',
    mistake: 'Reversing it. Moving towards mathematical notation was Algol’s subgoal; Hopper and COBOL went the other way, towards English.',
    tryIt: { q: 'Algol (1958–60) and COBOL (1959) went opposite ways. Which pushed towards mathematical notation, and which towards English?', a: 'Algol towards mathematical notation (subgoal: syntax close to math); COBOL towards English (Hopper’s direction).' },
  };

  H['l2-cobol-goals'] = {
    asks: 'COBOL had five design goals. Name them.',
    idea: 'Every goal puts the human ahead of the compiler. Ask three questions: who reads it (managers, so plain English), who writes it (more people, so easy even if less powerful), and who pays for it (the compiler writer, whose problems were ignored).',
    steps: [
      { text: 'The five goals, grouped by who they serve:', table: { head: ['goal', 'who it serves'], rows: [['look like simple English', 'readers'], ['managers should be able to read it', 'readers'], ['easy to use, even if that means less powerful', 'writers'], ['broaden the base of computer programmers', 'writers'], ['no preconceptions about what is hard to implement in the compiler (English over math)', 'nobody: the compiler writer pays']] } },
      'Source: the first meeting, at the Pentagon in May 1959, sponsored by the Department of Defense. Most agreed to use English as much as possible (Sebesta).',
      'Consequence of the last goal: early COBOL compilers performed poorly, and Sebesta judges COBOL probably survived only because the DoD mandated it.',
    ],
    answer: 'Look like simple English; managers should be able to read it; be easy to use, even if that means less powerful; broaden the base of computer programmers; have no preconceptions about what would be hard to implement in the compiler (English over math).',
    mistake: 'Adding "powerful" or "efficient". COBOL deliberately traded power for ease of use.',
    tryIt: { q: 'Which COBOL goal would a compiler writer complain about most, and why?', a: '"No preconceptions about what is hard to implement." English-like features were chosen without asking whether they were easy to compile, and early compilers were slow.' },
  };

  H['l2-cobol-records'] = {
    asks: 'What data-structure idea did COBOL pioneer, and what did that idea later lead to?',
    idea: 'Business data is nested: an employee record holds a name, which holds a first and a last name. COBOL let you describe that hierarchy directly with level numbers: a record.',
    steps: [
      { text: 'A COBOL record. Level numbers show nesting: 01 contains the 05s, and `emp-name` contains the 10s.', code: '01 employee.\n   05 emp-name.\n      10 first-name  pic x(10).\n      10 last-name   pic x(15).\n   05 salary         pic 9(6)v99.' },
      { text: 'The same shape as C structs (compiles with gcc):', code: 'struct name     { char first[10]; char last[15]; };\nstruct employee { struct name emp_name; double salary; };' },
      'Chain: COBOL records → structs in C → objects in object-oriented programming, which bundle the data with the functions that use it.',
      'Precisely: records first appeared in Zuse’s Plankalkül design (1945), but COBOL was the first to implement them in a high-level language.',
    ],
    answer: 'Hierarchical data structures (records), first implemented in a high-level language by COBOL. They prompted structs in C, and eventually OOP.',
    mistake: 'Saying COBOL invented objects. It gave records; OOP came much later and built on them (COBOL itself only added OOP in the 2000s).',
    tryIt: { q: 'In COBOL, `01 order.` contains `05 ship-to.`, which contains `10 city pic x(20).` What is the C equivalent?', a: 'Nested structs: `struct ship_to { char city[20]; };` and `struct order { struct ship_to ship_to; };`.' },
  };

  // ---------------------------------------------------------------- Prolog

  H['l2-prolog-origin'] = {
    asks: 'Expand the name Prolog and say roughly when it was created.',
    idea: 'The name tells the method: PROgramming in LOGic. And the date puts it a decade and more after the big four, as a deliberately different way to program.',
    steps: [
      'PROgramming LOGic: a program is a set of statements in formal logic (facts and rules), not a list of steps.',
      '1972: Alain Colmerauer and Phillippe Roussel at Marseille, with Robert Kowalski at Edinburgh. The first Prolog interpreter was built at Marseille in 1972 (Sebesta).',
      { text: 'Where it sits in time:', table: { head: ['years', 'languages'], rows: [['1957–59', 'FORTRAN, LISP, Algol, COBOL'], ['1972', 'Prolog'], ['1991', 'Python']] } },
      'Later, Japan’s 1982 national project bet on logic programming; her slide calls it "either a failure or ahead of its time".',
    ],
    answer: 'PROgramming LOGic; 1972 (early 1970s).',
    mistake: 'Grouping Prolog with the 1950s languages. It came about 15 years after Fortran.',
    tryIt: { q: 'Lisp and Prolog were both used for AI. Which is older, and by roughly how much?', a: 'Lisp (1958) is about 14 years older than Prolog (1972).' },
  };

  H['l2-prolog-how'] = {
    asks: 'How do you write a Prolog program, and how do you get an answer out of it?',
    idea: 'Two phases: tell, then ask. First you state what is true (facts and rules); then you ask a question (a query, or goal), and Prolog tries to prove it from what you told it.',
    steps: [
      { text: 'Tell: facts state what is true, and rules (`:-` means "if") state what can be deduced. Example in Sebesta’s style:', code: 'mother(joanne, jake).\nfather(vern, joanne).\nparent(X, Y) :- mother(X, Y).\nparent(X, Y) :- father(X, Y).\ngrandparent(X, Z) :- parent(X, Y), parent(Y, Z).' },
      { text: 'Ask: pose a query.', code: '?- grandparent(vern, jake).\ntrue.' },
      'Prolog proves it: vern is a parent of joanne (a fact via the father rule), and joanne is a parent of jake (via the mother rule), so the grandparent rule holds with Y = joanne.',
      'If it cannot prove a goal, it answers false. Her palindrome: `?- palindrome(abba).` gives true, `?- palindrome(hi).` gives false.',
      'The word "queries" is the best reading of her blank; "goals" means the same thing here.',
    ],
    answer: 'State facts and rules (what is true); then pose queries (goals), which the system tries to prove.',
    mistake: 'Trying to write steps ("first check this, then loop over that"). In Prolog you never say how; you state what is true and the system searches for a proof.',
    tryIt: { q: 'With the same facts, what does `?- grandparent(joanne, vern).` answer?', a: 'false. joanne’s only child is jake, and nothing says jake is a parent of vern, so the rule cannot be proved.' },
  };

  // ---------------------------------------------------------------- Which language is this code?

  H['l2-code-fortran'] = {
    asks: 'Name the language of this palindrome function from its syntax.',
    idea: 'Look for fingerprints, not logic: Fortran 90 marks declarations with `::`, has `intent(in)`, loops with `do … end do`, and writes its logical values with dots, `.true.` and `.false.`.',
    steps: [
      { text: 'The clues:', table: { head: ['clue', 'what it is'], rows: [['`logical :: is_palindro`', 'a Fortran 90 declaration (`::`)'], ['`intent(in)`', 'Fortran parameter mode: input only'], ['`do i = 1, length/2 … end do`', 'Fortran’s DO loop (DO goes back to Fortran I)'], ['`.false.`, `.true.`', 'Fortran logical constants, wrapped in dots']] } },
      'How it works: it starts with the result `.false.`, compares character i with character i from the end for the first half, and returns early on a mismatch. If the loop finishes, the result becomes `.true.`.',
      { text: 'Trace with t = "level" (length 5, so i runs 1 to 2):', table: { head: ['i', 't(i:i)', 't(length-i+1:…)', 'equal?'], rows: [['1', 'l', 'l', 'yes'], ['2', 'e', 'e', 'yes'], ['end', '', '', 'result .true.']] } },
      'Not Algol (no `begin … end`, no `:=`), not COBOL (no divisions), not Scheme (not wrapped in parentheses).',
    ],
    answer: 'Fortran (Fortran 90).',
    mistake: 'Being thrown by the lowercase, modern look. Fortran 90 is not all-caps Fortran I; `::` and dotted `.true.` give it away.',
    tryIt: { q: 'Which language is this, and what is `n` at the end?', code: 'integer :: n\nn = 10\ndo while (n > 0)\n   n = n - 3\nend do', a: 'Fortran 90 (`::`, `do while … end do`). n goes 10, 7, 4, 1, −2, so n ends as −2.' },
  };

  H['l2-code-scheme'] = {
    asks: 'Name the language of this two-line palindrome function.',
    idea: 'Everything is a parenthesized list with the function name first. That shape means a Lisp, and `define` with `equal?` means Scheme.',
    steps: [
      { text: 'The clues:', table: { head: ['clue', 'what it is'], rows: [['`(define (isPalindrome aList) …)`', 'Scheme’s way to define a function'], ['`(equal? aList (reverse aList))`', 'prefix notation: function first, then its arguments'], ['`?` ending `equal?`', 'Scheme’s naming style for a true/false test']] } },
      'Read it: a list is a palindrome when it equals its own reverse.',
      { text: 'Her examples (run in Guile Scheme):', code: '> (isPalindrome \'(r a c e c a r))\n#t\n> (isPalindrome \'(h i))\n#f' },
      'Not Prolog: Prolog uses `name(args) :- …` rules and `?-` queries, with no outer parentheses.',
    ],
    answer: 'Scheme (a Lisp dialect).',
    mistake: 'Mixing it up with Prolog because both are short and "logical". Scheme = parentheses everywhere, prefix order; Prolog = `:-` rules and `?-` queries.',
    tryIt: { q: 'Which language is this, and what does the last line return?', code: '(define (double x) (* 2 x))\n(double (+ 3 4))', a: 'Scheme. `(+ 3 4)` is 7, and doubling gives 14.' },
  };

  H['l2-code-algol'] = {
    asks: 'Name the language of this palindrome procedure from its syntax.',
    idea: 'Algol’s signatures: `BEGIN … END` blocks, `:=` for assignment, and a `FOR … STEP … UNTIL … DO` loop. `PROC … BOOL` (a procedure returning a boolean) seals it.',
    steps: [
      { text: 'The clues:', table: { head: ['clue', 'what it is'], rows: [['`BEGIN … END`', 'Algol’s block structure'], ['`i := 0`', 'Algol’s assignment operator `:=`, not `=`'], ['`FOR i := 0 STEP 1 UNTIL …`', 'Algol’s for loop'], ['`PROC palindrome = (STRING s)BOOL:`', 'a procedure that returns a boolean']] } },
      'How it works: compare `s[i]` with the matching character from the end; on a mismatch, `GO TO return false`. If the loop finishes, the result is TRUE.',
      'It is the same half-the-string idea as the Fortran version, so the logic tells you nothing. Only the syntax identifies the language.',
      'Not Fortran: Fortran assigns with `=` and loops with `do … end do`. Not COBOL: no divisions.',
    ],
    answer: 'Algol.',
    mistake: 'Calling it Fortran because of the `GO TO` and the counting loop. `:=` and `BEGIN … END` are Algol’s signature.',
    tryIt: { q: 'Which language is this, and what is `sum` at the end?', code: 'begin\n  integer i, sum;\n  sum := 0;\n  for i := 1 step 1 until 4 do\n    sum := sum + i\nend', a: 'Algol 60 (`begin … end`, `:=`, `for … step … until … do`). sum = 1 + 2 + 3 + 4 = 10.' },
  };

  H['l2-code-cobol'] = {
    asks: 'Name the language of this palindrome test from its syntax.',
    idea: 'Divisions, `pic` clauses and English verbs. If a program announces its own `division.`, it is COBOL.',
    steps: [
      { text: 'The clues:', table: { head: ['clue', 'what it is'], rows: [['`identification division.`, `data division.`, `procedure division`', 'COBOL’s fixed program sections'], ['`01 result pic x.`', 'a level number and a picture clause describing the data'], ['`if … equal … then`, `set … to true`', 'English words instead of symbols like `=` or `:=`'], ['each sentence ends with a period', 'English-style statements']] } },
      'How it works: the test text is compared with `function reverse(test-text)`; if they are equal, the result is set to true.',
      'Connect it to the history: English over math (Hopper), and separate data and procedure divisions.',
    ],
    answer: 'COBOL.',
    mistake: 'Overthinking it. No other language of the era writes `data division.` and `pic x`: those two alone mean COBOL.',
    tryIt: { q: 'Which language is this?', code: 'procedure division.\n    move 0 to total.\n    add price to total.\n    display total.', a: 'COBOL: a procedure division and English verbs (move, add, display).' },
  };

  H['l2-code-prolog'] = {
    asks: 'Name the language of this palindrome rule and query.',
    idea: 'A rule with `:-` ("is true if") and a query with `?-` that answers true or false: that is Prolog.',
    steps: [
      { text: 'The clues:', table: { head: ['clue', 'what it is'], rows: [['`palindrome(Word) :- …`', 'a rule: the head is true if the body is true'], ['`Word`, `List` capitalized', 'Prolog variables start with a capital letter'], ['`abba` lowercase', 'an atom (a constant)'], ['`?- palindrome(abba).` then `true.`', 'a query, answered by a proof']] } },
      'Read it: palindrome(Word) is true if `name` turns the word into a list of its characters, and that list is the reverse of itself. The trick is `reverse(List, List)`: the same variable on both sides.',
      'Not Scheme: no outer parentheses around everything, and no `define`.',
    ],
    answer: 'Prolog.',
    mistake: 'Picking Scheme because both have a `reverse`. Look at the shape: `:-` and `?-` only appear in Prolog.',
    tryIt: { q: 'Which language is this, and what does the query answer?', code: 'likes(mary, tea).\n\n?- likes(mary, coffee).', a: 'Prolog (a fact, then a `?-` query). The answer is false: no fact says mary likes coffee.' },
  };

  H['l2-scheme-trace'] = {
    asks: 'Run the function on the 10-element list: is the list equal to its own reverse? The answer is `#t` (true) or `#f` (false).',
    idea: 'A palindrome reads the same both ways, so position k must match position 11 − k. One mismatched pair is enough to make the answer `#f`.',
    steps: [
      '`(reverse aList)` builds the list backwards: `(1 0 1 0 0 1 0 1 0 1)`. Then `equal?` compares the two lists element by element.',
      { text: 'Original against reversed (run in Guile):', table: { head: ['position', 'original', 'reversed', 'same?'], rows: [['1', '1', '1', 'yes'], ['2', '0', '0', 'yes'], ['3', '1', '1', 'yes'], ['4', '0', '0', 'yes'], ['5', '1', '0', 'NO'], ['6', '0', '1', 'NO'], ['7', '0', '0', 'yes'], ['8', '1', '1', 'yes'], ['9', '0', '0', 'yes'], ['10', '1', '1', 'yes']] } },
      'The middle pair breaks it: element 5 is 1 and element 6 is 0. Mirrored, they should be equal, so the lists differ.',
      'So `equal?` returns false, written `#f` in Scheme.',
    ],
    answer: '`#f`: reversed, the list is (1 0 1 0 0 1 0 1 0 1), which differs from the original at the 5th element.',
    mistake: 'Checking only the ends (both 1) and answering `#t`. Every mirrored pair must match; the middle pair here does not.',
    tryIt: { q: 'What does `(isPalindrome \'(0 1 1 0 1 1 0))` return?', a: '`#t`. Mirrored pairs: positions 1 and 7 are 0 and 0, 2 and 6 are 1 and 1, 3 and 5 are 1 and 1, and position 4 is the middle. The reverse equals the original.' },
  };
})(globalThis.FC = globalThis.FC || {});
