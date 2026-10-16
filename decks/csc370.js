// AUCSC 370 Programming Languages (Rosanna Heise), lectures 1-5 and 10.
//
// Sources: the 8 pre/post-test answer keys and the non-blank text of the 6 "Student"
// slide decks (PDFs in ~/Downloads, 2026-10-15). Every `source` names where a card came
// from. Cards whose answer is NOT in those PDFs say so in `source`.
//
// `blanks` are the empty fill-ins on the student slides. Their answers come from the
// owner's lecture notes (entered in the app), never from this file.
//
// Every `verify.src` is run by tests/verify-traces.js; its output must equal `answer`.
(function (FC) {
  'use strict';

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
    { id: 'l1-subcriteria', lecture: '1', type: 'recall',
      prompt: 'Name at least four of the twelve sub-criteria for judging a language.',
      answer: 'Simplicity, orthogonality, data types, syntax design, support for abstraction, expressivity, type checking, exception handling, restricted aliasing, run-time speed, portability, security.',
      points: ['any four of the twelve listed'],
      why: 'Slide 12 lists them in two columns; slides 13-17 explain each.',
      source: 'Slides 1, slide 12' },
    { id: 'l1-readwrite', lecture: '1', type: 'recall',
      prompt: 'Compare the readability and the writeability of these two equivalent conditionals.',
      code: `In Pascal                      In Java
if kiwi > orange then          if (kiwi > orange)
   WriteLn('CLOUDS')              System.out.println("CLOUDS");
else if kiwi = orange then     else if (kiwi == orange)
   WriteLn('WINDY')               System.out.println("WINDY");
else                           else
   WriteLn('SUNNY')               System.out.println("SUNNY");`,
      answer: 'Readability: Pascal reads more like English (the word “then”, no brackets around the condition), which helps beginners; experienced programmers find them about equal. Writeability: Java needs two fewer characters per condition, which adds up because we write a lot of conditionals (though forgetting a bracket costs edits). Either version can be called better if the argument is justified.',
      points: ['readability: Pascal is more English-like, no brackets', 'writeability: Java types fewer characters per condition', 'either side is acceptable if justified'],
      why: 'The professor’s key picks Pascal for beginners, but grades the justification, not the choice.',
      source: 'Intro to PL answer key, Q1' },
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
    { id: 'l1-cat-prolog', lecture: '1', type: 'mc',
      prompt: 'Prolog belongs to which language category?',
      answer: 'Logic', options: ['Functional', 'Procedural', 'Object-oriented'],
      why: 'A Prolog program is a set of statements of what is true (facts and rules) that you query.',
      source: 'Slides 1, slide 19; History post-test Q3' },
    { id: 'l1-cat-scheme', lecture: '1', type: 'mc',
      prompt: 'Scheme belongs to which language category?',
      answer: 'Functional', options: ['Logic', 'Procedural', 'Object-oriented'],
      why: 'Scheme is a Lisp dialect: computation happens by applying functions.',
      source: 'Slides 1, slide 19; Pre Test #1 key (C, Scheme, Prolog)' },
    { id: 'l1-tradeoff', lecture: '1', type: 'recall',
      prompt: 'Java refuses array indices that go out of bounds; C allows them. Which criteria trade off against each other here?',
      answer: 'Reliability (and security) against run-time speed: Java checks every index at run time, which costs time; C skips the check, which is faster but lets bugs and attacks through.',
      points: ['Java: more reliable / secure', 'C: faster, no run-time index check', 'the two criteria pull against each other'],
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
    { id: 'l2-plankalkul', lecture: '2', type: 'recall',
      prompt: 'Plankalkül: what does the name mean, who designed it, and when?',
      answer: 'Program Calculus; Konrad Zuse; written in 1945, published in 1972.',
      points: ['Program Calculus', 'Zuse', '1945 (published 1972)'],
      why: 'It already had floating point, arrays and records.',
      source: 'Slides 2, slide 3' },
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
      prompt: 'LISP: what does the name stand for, who designed it, and where and when?',
      answer: 'LISt Processing; John McCarthy, at MIT, on paper in 1958.',
      points: ['LISt Processing', 'John McCarthy', 'MIT, 1958'],
      why: 'It came out of artificial-intelligence research, which needed lists and recursion.',
      source: 'Slides 2, slides 17-18 and 22' },
    { id: 'l2-lisp-dialects', lecture: '2', type: 'recall',
      prompt: 'Name Lisp’s two main dialects and how each was standardised.',
      answer: 'Common Lisp (ANSI standard, 1994) and Scheme (IEEE standard, 1995).',
      points: ['Common Lisp, ANSI 1994', 'Scheme, IEEE 1995'],
      why: 'More than 20 kinds exist (Clojure, Racket, Emacs Lisp …), but these two are the main dialects.',
      source: 'Slides 2, slide 23' },
    { id: 'l2-algol-origin', lecture: '2', type: 'recall',
      prompt: 'What does Algol stand for, and what was it trying to be?',
      answer: 'ALGOrithmic Language: an attempt at a universal programming language that would work on more than one architecture, by the U.S. and Germany.',
      points: ['ALGOrithmic Language', 'universal language', 'more than one architecture', 'U.S. + Germany'],
      why: 'Same era as Lisp and Fortran (late 1950s).',
      source: 'Slides 2, slides 25 and 27' },
    { id: 'l2-algol-death', lecture: '2', type: 'recall',
      prompt: 'Give three reasons Algol died quickly in the U.S.',
      answer: 'Its BNF description was hard to understand; IBM owned Fortran, so IBM would not support Algol; the U.S. wanted its own language. (Also: no I/O, left out because of machine dependence, and Algol 68 changed too much.)',
      points: ['BNF was hard to understand', 'IBM owned Fortran: no support', 'the U.S. wanted its own language'],
      why: 'It died commercially but lived on: most languages today descend from it.',
      source: 'Slides 2, slide 32 (the parenthetical items fill slide blanks; check them against your notes)' },
    { id: 'l2-cobol-goals', lecture: '2', type: 'recall',
      prompt: 'COBOL: who is it associated with, and name two of its design goals from the slides.',
      answer: 'Grace Hopper. Goals: look like simple English so managers could read it; broaden the base of computer programmers; have no preconceptions about what would be hard to implement in the compiler (English over math).',
      points: ['Grace Hopper', 'any two goals: English-like, broaden the programmer base, ignore compiler difficulty'],
      why: 'COBOL chose English over mathematical notation on purpose.',
      source: 'Slides 2, slides 34-35' },
    { id: 'l2-cobol-records', lecture: '2', type: 'recall',
      prompt: 'COBOL pioneered a way of grouping data. What later features did that idea prompt?',
      answer: 'Structs in C, and eventually object-oriented programming.',
      points: ['structs in C', 'eventually OOP'],
      why: 'COBOL records (hierarchical data) were the first of their kind in a high-level language.',
      source: 'Slides 2, slide 36' },
    { id: 'l2-prolog-origin', lecture: '2', type: 'recall',
      prompt: 'Prolog: what does the name stand for, when was it created, and by whom?',
      answer: 'PROgramming LOGic; 1972; Alain Colmerauer, Philippe Roussel and Robert Kowalski.',
      points: ['PROgramming LOGic', '1972', 'Colmerauer, Roussel, Kowalski'],
      why: 'It is non-procedural: you state facts and rules instead of steps.',
      source: 'Slides 2, slide 40' },
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
      prompt: 'Even with printf changed to System.out.println, that code would not run in Java. Why?',
      answer: 'Java checks types more strongly than C. The if condition is an int expression, not a boolean, and is not cast to one, so it is a static type error.',
      points: ['Java checks types more strongly', 'the condition is an int, not a boolean', 'static (compile-time) type error'],
      why: 'C treats any nonzero number as true; Java requires a boolean.',
      source: 'Pre Test on C, Q1d' },

    // ───────────── Lecture 4: translation ─────────────
    { id: 'l4-compiler-steps', lecture: '4', type: 'order',
      prompt: 'Put the three main steps of a compiler in order.',
      answer: ['Lexical analysis', 'Syntax analysis', 'Low-level (machine) code generation'],
      why: 'Characters become tokens (lexical), tokens become a parse tree (syntax), the tree becomes machine code.',
      source: 'Post Test Translation, Q1' },
    { id: 'l4-lexeme-token', lecture: '4', type: 'recall',
      prompt: 'What is the difference between a lexeme and a token?',
      answer: 'A lexeme is a lowest-level syntactic unit of a language (e.g. “if”). A token is a category of lexemes (e.g. “if” belongs to the token for the reserved word that starts a conditional).',
      points: ['lexeme: lowest-level syntactic unit', 'token: a category of lexemes', 'an example of each'],
      why: 'Many lexemes (count, i, total) share one token (identifier).',
      source: 'Post Test Translation, Q2' },
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
    { id: 'l4-gpa-derive', lecture: '4', type: 'order',
      prompt: 'Using that GPA grammar, put the leftmost derivation of 3.9 in order.',
      answer: ['<GPA>', '<left digit> . <right digit>', '3 . <right digit>', '3.9'],
      why: 'Leftmost: always replace the leftmost nonterminal first.',
      source: 'Post Test Translation, Q4b (the key leaves the derivation blank)' },
    { id: 'l4-gpa-41', lecture: '4', type: 'recall',
      prompt: 'Using that GPA grammar, derive 4.1.',
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
    { id: 'l4-xyz-order', lecture: '4', type: 'order',
      prompt: 'All variables are integers. Put the machine instructions a compiler might generate for  x = y + 2 * z;  in order.',
      answer: ['Load y into register A and z into register B (from memory)', 'Shift register B left by 1 bit', 'Add registers A and B, result into A', 'Store register A into memory at x'],
      why: 'Multiplying by 2 is a 1-bit left shift, so no 2 is ever loaded. The exact instructions depend on the architecture.',
      source: 'Pre Test Translation, Q2a' },
    { id: 'l4-where-2', lecture: '4', type: 'recall',
      prompt: 'In  x = y + 2 * z;  where does the 2 come from during execution?',
      answer: 'Likely nowhere: the multiplication by 2 is replaced by a 1-bit left shift. Otherwise the compiler builds the 2 directly into the instruction.',
      points: ['replaced by a shift, so it is not stored anywhere', 'otherwise part of the instruction itself'],
      why: 'Constants usually live inside instructions, not in variables.',
      source: 'Pre Test Translation, Q2d' },
    { id: 'l4-where-x', lecture: '4', type: 'recall',
      prompt: 'In  x = y + 2 * z;  where does the x come from during execution, and what decides which machine instructions are generated?',
      answer: 'x comes from memory (RAM or cache). The instructions are decided by the compiler or interpreter: a program that translates high-level code into lower-level code.',
      points: ['x: memory (RAM or cache)', 'chosen by the compiler / interpreter'],
      why: '',
      source: 'Pre Test Translation, Q2b-c' },
    { id: 'l4-token-i', lecture: '4', type: 'typed',
      prompt: 'In the Java sentence below, what token is the lexeme  i ?',
      code: `for (int i = 0; i < 10; i++){`,
      answer: 'identifier',
      why: 'Every i here is an identifier. (The slide’s table labels the second i “int_literal”, which is a slip.)',
      source: 'Slides 4, slides 7-8' },
    { id: 'l4-token-10', lecture: '4', type: 'typed',
      prompt: 'In the same Java sentence, what token is the lexeme  10 ?',
      code: `for (int i = 0; i < 10; i++){`,
      answer: 'int_literal', accept: ['int literal', 'integer literal', 'integer_literal'],
      why: 'A number written directly in the code is a literal; its token says which kind.',
      source: 'Slides 4, slide 8' },
    { id: 'l4-sample-derive', lecture: '4', type: 'order',
      prompt: 'Grammar below. The derivation of  c = c + 2 * a  starts  <program> ⇒ <stmts> ⇒ <stmt> ⇒ <var> = <expr>.  Put the rest of the leftmost derivation in order.',
      code: `<program> → <stmts>
<stmts> → <stmt> | <stmt> ; <stmts>
<stmt> → <var> = <expr>
<var> → a | b | c | d
<num> → 1 | 2 | 3
<expr> → <term> + <expr> | <term> * <expr> | <term>
<term> → <var> | <num>`,
      answer: ['c = <expr>', 'c = <term> + <expr>', 'c = <var> + <expr>', 'c = c + <expr>', 'c = c + <term> * <expr>', 'c = c + <num> * <expr>', 'c = c + 2 * <expr>', 'c = c + 2 * <term>', 'c = c + 2 * <var>', 'c = c + 2 * a'],
      why: 'Leftmost: each step rewrites the leftmost nonterminal, so the sentence fills in left to right.',
      source: 'Slides 4, slides 12-13 (derivation worked from the slide’s grammar)' },
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
      why: 'In Scheme, twoDArray and twoDarray are the same name.',
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
      why: 'Early Fortran allowed only short names; Java and Python allow any length.',
      source: 'Slides 5.1, slide 9' },
    { id: 'l51-bindtimes', lecture: '5.1', type: 'order',
      prompt: 'Put the possible binding times in order, earliest first.',
      answer: ['Language design', 'Language implementation', 'Compile', 'Load', 'Run'],
      why: 'Example: * is bound to “multiply” at language design; a C static variable’s address at load time; a local’s value at run time.',
      source: 'Slides 5.1, slide 13 (examples are Sebesta’s, not the handout’s)' },
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
      prompt: 'Give three advantages of declaring a variable’s type explicitly (as in Java) over just using a name (as in Python).',
      answer: 'The compiler can catch spelling errors (one of the most common mistakes); the programmer has a clearer idea what the variable is for; the reader knows the intended type (in x = 5, is x an integer or a real?); the compiler can allocate the right amount of space immediately.',
      points: ['catches misspelled names', 'clearer purpose for the programmer', 'reader knows the type', 'right amount of space allocated'],
      why: 'Any three of the four count.',
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
      points: ['not readable', 'not searchable', 'loop indices are the usual exception, and even there longer names read better'],
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
      points: ['lifetime = time bound to a memory cell', 'scope = where the name is visible', 'static local: whole-run lifetime, function-only scope'],
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
    { id: 'l52-static-eg', lecture: '5.2', type: 'recall',
      prompt: 'Give the slides’ example of a variable with static lifetime.',
      answer: 'A static variable inside a function in C or C++.',
      points: ['C / C++ static variable in a function'],
      why: 'It is bound to memory before execution begins and stays bound until execution ends.',
      source: 'Slides 5.2, slide 4' },
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
      prompt: 'That doThis() code is legal in C and C++ but not in Java or C#. Why?',
      answer: 'It declares a second num inside a nested block while the outer num is still in scope. Java and C# forbid a local in a nested block from hiding an enclosing local; C and C++ allow it (the inner one hides the outer one).',
      points: ['inner num redeclares a name already in scope', 'Java/C#: not allowed to hide an enclosing local', 'C/C++: allowed, the inner one hides the outer'],
      why: 'This hiding is a scope hole inside one function.',
      source: 'Slides 5.2, slide 15' },
    { id: 'l52-py-trace', lecture: '5.2', type: 'typed',
      prompt: 'What does this Python program print? (Type the five lines; spacing doesn’t matter.)',
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
      answer: 'In f top, y is: 82\nIn g, x is: 13\nIn h, x is: 55\nIn f bottom, x is: 55\nGlobal, x is: 12',
      why: 'x = 13 inside f makes x local to f. nonlocal x makes g’s x the same variable as f’s, so g sets f’s x to 55, which h and the bottom of f both see. The global x is never touched: still 12. y in f is the global 82 (g’s parameter y is a different y).',
      source: 'Slides 5.2, slide 21 (output verified with Python 3)',
      verify: { lang: 'python', src: `x = 12
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
print("Global, x is: ", x)` } },
    { id: 'l52-py-unbound', lecture: '5.2', type: 'recall',
      prompt: 'In that Python program, what happens if the commented-out line at the top of f is uncommented? Why?',
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
      prompt: 'Adding  sa = sa * 2;  to main is an error, even though sa exists for the whole run. Why?',
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
    { id: 'l52-java-final', lecture: '5.2', type: 'mc',
      prompt: 'When are the values of Java final named constants bound?',
      answer: 'Dynamically (at run time)', options: ['Statically (at compile time)'],
      why: 'The slides: Java final is “all dynamic”.',
      source: 'Slides 5.2, slide 30' },

    // ───────────── Lecture 10: control structures ─────────────
    { id: 'l10-control-stmt', lecture: '10', type: 'recall',
      prompt: 'What is a control statement? Give two examples.',
      answer: 'Something that changes execution from the normal (sequential) order to something non-sequential. E.g. goto, for, while, if, a function call; in Scheme, sequencing and cond.',
      points: ['changes execution from sequential to non-sequential', 'two examples'],
      why: '',
      source: 'Slides 10, slide 2' },
    { id: 'l10-control-struct', lecture: '10', type: 'recall',
      prompt: 'What is a control structure?',
      answer: 'A control statement plus the collection of statements controlled by it.',
      points: ['a control statement', 'plus the statements it controls'],
      why: '',
      source: 'Slides 10, slide 4' },
    { id: 'l10-turing', lecture: '10', type: 'recall',
      prompt: 'What control flow is enough for Turing completeness, and what is the catch?',
      answer: 'Ordered statements plus a goto with a conditional (a compare): a conditional kind of repetition. The catch: it is sufficient but not structured.',
      points: ['ordered statements', 'conditional goto (conditional repetition)', 'sufficient but not structured'],
      why: 'This is why structured control statements exist even though goto is enough.',
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
      prompt: 'Describe C’s design choices for switch (the answers to the five multi-way design issues).',
      answer: 'The control expression must evaluate to an integer; segments can be statement sequences or blocks; any number of segments can execute in one run (no implicit branch at the end of a segment, so break is your friend); case values must be integers or types that convert to integers; default handles unrepresented values, and with no default the statement does nothing for them.',
      points: ['integer control expression', 'sequences or blocks', 'falls through: no implicit branch, use break', 'integer case values', 'default for unrepresented values'],
      why: '',
      source: 'Slides 10, slide 17' },
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
    title: 'CSC 370 · Programming Languages',
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
