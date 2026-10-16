// Answers to the fill-in blanks on the AUCSC 370 student slides (2026-10-16).
// The owner does not have them all, so they were supplied: each says where it came from.
//   slides   = elsewhere in her own PDFs (note says where)
//   sebesta  = Sebesta, Concepts of Programming Languages (the course textbook)
//   history  = established historical fact
//   inferred = best guess from the slide layout; shown as a guess in the app
// Keyed by blank id from decks/csc370.js. An answer the owner types in the app wins.
(function (FC) {
  FC.blankAnswers = {
 "b1-5-1s832o7": {
  "answer": "Ordered (sequential)",
  "basis": "inferred",
  "note": "Her Control Structures slide 3 says all algorithms = 'ordered statements plus a conditional kind of repetition'. Layout guess."
 },
 "b1-5-fngtn3": {
  "answer": "Read (load) from memory",
  "basis": "inferred",
  "note": "Guessed from the Control <-> Memory diagram beside the two sub-points."
 },
 "b1-5-10haett": {
  "answer": "Write (store) to memory",
  "basis": "inferred",
  "note": "Guessed from the Control <-> Memory diagram beside the two sub-points."
 },
 "b1-5-7m32oy": {
  "answer": "Conditional jump (goto with compare)",
  "basis": "inferred",
  "note": "Control Structures slide 3: 'goto with compare is sufficient'."
 },
 "b1-5-s7pz3a": {
  "answer": "Conditional repetition (loops or recursion)",
  "basis": "inferred",
  "note": "Her keys: HTML fails because it has 'no conditional repetition'. Slot position is a guess."
 },
 "b1-5-182gwm3": {
  "answer": "Memory / variables (state)",
  "basis": "inferred",
  "note": "Guess; its sub-point is 'Information is ...'."
 },
 "b1-5-4eparh": {
  "answer": "stored and can be retrieved/changed later (remembered)",
  "basis": "inferred",
  "note": "Guess based on the memory requirement."
 },
 "b1-13-1lo5k3f": {
  "answer": "A manageable (small) set",
  "basis": "sebesta",
  "note": "Sebesta: 'a manageable set of features and constructs'."
 },
 "b1-13-1vptfan": {
  "answer": "Minimal",
  "basis": "sebesta",
  "note": "Sebesta: 'minimal feature multiplicity' (e.g. count++ vs count=count+1)."
 },
 "b1-13-yaafuc": {
  "answer": "Minimal",
  "basis": "sebesta",
  "note": "Sebesta: 'minimal operator overloading'."
 },
 "b1-13-1uiwubu": {
  "answer": "can be combined in a relatively small number of ways (to build the control and data structures)",
  "basis": "sebesta"
 },
 "b1-13-1bb3vzn": {
  "answer": "is legal",
  "basis": "sebesta"
 },
 "b1-13-jzmera": {
  "answer": "Few (no) exceptions",
  "basis": "sebesta",
  "note": "Sebesta: lack of orthogonality means exceptions to rules."
 },
 "b1-14-1l46rjl": {
  "answer": "Adequate predefined data types and structures",
  "basis": "sebesta"
 },
 "b1-14-1frds5a": {
  "answer": "while, class, for (reserved words)",
  "basis": "sebesta"
 },
 "b1-14-1fj8yuf": {
  "answer": "Methods of forming (e.g. end if / end loop vs braces)",
  "basis": "sebesta",
  "note": "Sebesta: 'special words and methods of forming compound statements'."
 },
 "b1-14-14iqt74": {
  "answer": "keywords (self-descriptive constructs; form matches meaning)",
  "basis": "sebesta"
 },
 "b1-15-17cbqtc": {
  "answer": "details to be ignored",
  "basis": "sebesta"
 },
 "b1-15-7vrq6m": {
  "answer": "computation (work)",
  "basis": "sebesta",
  "note": "Sebesta: a lot of computation done with a small program."
 },
 "b1-16-5s267y": {
  "answer": "Compiler (or run-time system)",
  "basis": "sebesta",
  "note": "Sebesta: type checking = testing for type errors, by the compiler or at run time. Exact blank wording is a guess."
 },
 "b1-16-1o087oo": {
  "answer": "type (usage)",
  "basis": "sebesta"
 },
 "b1-16-100awig": {
  "answer": "run-time errors (unusual conditions)",
  "basis": "sebesta"
 },
 "b1-16-1f265qw": {
  "answer": "corrective",
  "basis": "sebesta"
 },
 "b1-16-1gd91b5": {
  "answer": "two or more distinct names (referencing methods)",
  "basis": "sebesta"
 },
 "b1-17-1u1df02": {
  "answer": "from one platform (implementation) to another",
  "basis": "sebesta"
 },
 "b1-19-1f3lwml": {
  "answer": "variables, assignment statements, and iteration",
  "basis": "sebesta"
 },
 "b1-19-1dq55la": {
  "answer": "applying functions to given parameters",
  "basis": "sebesta"
 },
 "b1-19-1hfdb5b": {
  "answer": "Rule-based (rules specified in no particular order)",
  "basis": "sebesta"
 },
 "b1-19-1j9phr": {
  "answer": "objects/classes (data and methods encapsulated together)",
  "basis": "inferred",
  "note": "Wording is a guess; Sebesta lists encapsulation, inheritance, dynamic binding."
 },
 "b2-2-1agyy4z": {
  "answer": "Charles Babbage",
  "basis": "history"
 },
 "b2-2-10jp8y1": {
  "answer": "Ada Lovelace (Augusta Ada King, Countess of Lovelace)",
  "basis": "history"
 },
 "b2-4-1nt5uym": {
  "answer": "Moving cord (plug-cable)",
  "basis": "slides",
  "note": "History post-test answer key: ENIAC programmed 'by moving cords and turning knobs'."
 },
 "b2-4-wb62jk": {
  "answer": "Turning",
  "basis": "slides",
  "note": "History post-test answer key: 'turning knobs'."
 },
 "b2-4-53ku95": {
  "answer": "Instructions",
  "basis": "slides",
  "note": "History post-test answer key: 'instructions often written on paper'."
 },
 "b2-5-1hu26ma": {
  "answer": "in memory, stored just like the data (stored program)",
  "basis": "slides",
  "note": "History post-test answer key Q2d."
 },
 "b2-8-1e39jm4": {
  "answer": "Fortran 0: a report only, not implemented",
  "basis": "sebesta",
  "note": "Sebesta calls the 1954 report 'Fortran 0'. Slot wording is a guess."
 },
 "b2-8-1amnoyj": {
  "answer": "2",
  "basis": "sebesta",
  "note": "Fortran I allowed 6 characters, Fortran 0 allowed 2."
 },
 "b2-8-1tt0c81": {
  "answer": "debugging (coding errors)",
  "basis": "sebesta",
  "note": "1954 report claimed Fortran would eliminate coding errors and debugging."
 },
 "b2-8-19fizvh": {
  "answer": "superiority over (as efficient as)",
  "basis": "inferred",
  "note": "Sebesta: the report claimed the efficiency of hand-coded programs. Exact blank wording is a guess."
 },
 "b2-9-6xyr4a": {
  "answer": "Oldest WSUT (Widely Still Used Today?)",
  "basis": "inferred",
  "note": "Box has 2 short lines. History post-test answer key calls FORTRAN 'the oldest WSUT language'. WSUT expansion is unconfirmed."
 },
 "b2-9-ic8frt": {
  "answer": "First implemented version of Fortran (first compiler, April 1957)",
  "basis": "sebesta"
 },
 "b2-9-7u0gva": {
  "answer": "6",
  "basis": "sebesta"
 },
 "b2-9-1pr3e15": {
  "answer": "data-typing statements (no type declarations)",
  "basis": "sebesta"
 },
 "b2-9-1hsycm8": {
  "answer": "I, J, K, L, M, N (letters I-N)",
  "basis": "slides",
  "note": "History post-test answer key: names starting I..N denote integers."
 },
 "b2-9-95yyrz": {
  "answer": "400",
  "basis": "sebesta"
 },
 "b2-9-1s6lhvx": {
  "answer": "larger ones rarely compiled (unreliable IBM 704)",
  "basis": "sebesta"
 },
 "b2-10-19c3tbf": {
  "answer": "on punched cards",
  "basis": "history"
 },
 "b2-11-m5kc41": {
  "answer": "compilation of subroutines",
  "basis": "sebesta"
 },
 "b2-12-tihx5q": {
  "answer": "Standard",
  "basis": "sebesta",
  "note": "Sebesta: became Fortran 66, the ANSI standard of 1966. Same pattern as her Fortran 77 slide."
 },
 "b2-12-1n6i5jy": {
  "answer": "ANSI",
  "basis": "sebesta",
  "note": "Her Fortran 77 slide reads 'Standard (ANSI 1978)'."
 },
 "b2-12-3ce9tq": {
  "answer": "type declarations",
  "basis": "sebesta"
 },
 "b2-12-9cf50u": {
  "answer": "parameters (passed to other subprograms)",
  "basis": "sebesta"
 },
 "b2-13-rcmyge": {
  "answer": "Character string handling",
  "basis": "sebesta"
 },
 "b2-13-1lkuwux": {
  "answer": "IF-THEN-ELSE statement",
  "basis": "sebesta"
 },
 "b2-13-184z91j": {
  "answer": "lowercase letters (or: strings / block IF)",
  "basis": "inferred",
  "note": "Not in Sebesta; his 3 F77 items take up the other bullets. Unverified guess; ask the prof or check the lecture."
 },
 "b2-14-1q9irl6": {
  "answer": "Dynamic",
  "basis": "sebesta"
 },
 "b2-14-1ki8wyr": {
  "answer": "Pointers",
  "basis": "sebesta"
 },
 "b2-14-1dhnq6a": {
  "answer": "Recursion",
  "basis": "sebesta"
 },
 "b2-14-m9s88n": {
  "answer": "CASE statement",
  "basis": "sebesta"
 },
 "b2-14-fu1s9p": {
  "answer": "type checking",
  "basis": "sebesta"
 },
 "b2-15-ksgz9q": {
  "answer": "Still the main language for scientific / numerical (high-performance) computing",
  "basis": "inferred",
  "note": "Guess. Sebesta calls Fortran the lingua franca of scientific computing."
 },
 "b2-15-5d957n": {
  "answer": "C and C++",
  "basis": "inferred",
  "note": "Guess. Python or MATLAB would also be reasonable answers."
 },
 "b2-17-1upkq0w": {
  "answer": "Process data in lists (rather than arrays)",
  "basis": "sebesta"
 },
 "b2-17-4xn65v": {
  "answer": "Symbolic computation (rather than numeric)",
  "basis": "sebesta"
 },
 "b2-18-1k9huce": {
  "answer": "symbolic computation (its requirements)",
  "basis": "sebesta"
 },
 "b2-18-1uzj7j": {
  "answer": "Differentiation",
  "basis": "sebesta",
  "note": "Sebesta: pilot problem was differentiating algebraic expressions."
 },
 "b2-19-sv918w": {
  "answer": "Atoms",
  "basis": "sebesta"
 },
 "b2-19-1wor3hx": {
  "answer": "Lists",
  "basis": "sebesta"
 },
 "b2-19-1xw7i6e": {
  "answer": "Applying functions to arguments (function application)",
  "basis": "sebesta"
 },
 "b2-20-1ugwahe": {
  "answer": "No: repetition comes from recursion",
  "basis": "slides",
  "note": "History post-test answer key: 'Repetition only comes from recursion (originally)' = LISP."
 },
 "b2-20-4euqdy": {
  "answer": "Selection comes from conditional expressions (cond)",
  "basis": "inferred",
  "note": "Sebesta: control via recursion and conditional expressions. Slot order is a guess."
 },
 "b2-20-k9tt2n": {
  "answer": "Data/memory is held in lists and function parameters",
  "basis": "inferred",
  "note": "Guess at the third point."
 },
 "b2-21-1sfiv4g": {
  "answer": "car, cdr",
  "basis": "sebesta"
 },
 "b2-21-1n18m9z": {
  "answer": "cons (also list)",
  "basis": "sebesta"
 },
 "b2-21-1yv7i6o": {
  "answer": "quote (')",
  "basis": "sebesta"
 },
 "b2-21-17znw7t": {
  "answer": "eval",
  "basis": "sebesta"
 },
 "b2-21-131ctqn": {
  "answer": "cond",
  "basis": "sebesta"
 },
 "b2-22-1sar9py": {
  "answer": "2nd Oldest WSUT",
  "basis": "inferred",
  "note": "Box has 2 short lines like Fortran's. Lisp (1958) is the second-oldest language still in use, after Fortran."
 },
 "b2-22-1nrcgpx": {
  "answer": "eval, i.e. the first Lisp interpreter",
  "basis": "history"
 },
 "b2-22-1cnplg7": {
  "answer": "compiler (written in Lisp)",
  "basis": "history"
 },
 "b2-22-5qngrm": {
  "answer": "Lisp machine (MIT)",
  "basis": "history"
 },
 "b2-24-13lgn3q": {
  "answer": "Dominated AI for ~25 years",
  "basis": "sebesta",
  "note": "Sebesta: Lisp dominated AI for a quarter century and is still dominant."
 },
 "b2-24-1ed7fqu": {
  "answer": "AI (artificial intelligence)",
  "basis": "sebesta"
 },
 "b2-24-1jb3gcb": {
  "answer": "Python (historically Prolog)",
  "basis": "inferred",
  "note": "Guess. Python today and Prolog historically are both plausible."
 },
 "b2-25-g4eews": {
  "answer": "Best Programming Language You've Never Heard Of",
  "basis": "inferred",
  "note": "Box: 1 short line, 'Programming Language', then 2 lines, which fits your recollection. Alternative: 'Most Influential ... You've Never Heard Of'."
 },
 "b2-25-1i08umn": {
  "answer": "Universal, machine-independent language for expressing algorithms",
  "basis": "slides",
  "note": "Slide 27 says 'attempt at universal programming language'. History post-test answer key: Algol's main use today is expressing algorithms."
 },
 "b2-25-4ez7f5": {
  "answer": "an international committee (ACM + GAMM, U.S. + Germany)",
  "basis": "slides",
  "note": "History post-test answer key: 'Created by an international committee'."
 },
 "b2-25-1tp5re4": {
  "answer": "descend from (are based on) Algol",
  "basis": "sebesta"
 },
 "b2-27-1trn0u6": {
  "answer": "Syntax close to mathematical notation",
  "basis": "sebesta"
 },
 "b2-27-in6ge7": {
  "answer": "Good for describing algorithms in publications",
  "basis": "sebesta"
 },
 "b2-27-1gxvaog": {
  "answer": "Mechanically translatable into machine code",
  "basis": "sebesta"
 },
 "b2-28-f7vsxu": {
  "answer": "Period or comma",
  "basis": "inferred",
  "note": "Europe writes a decimal comma and the U.S. a period. The arrow lines below likely swap '.' and ','."
 },
 "b2-28-16o8t44": {
  "answer": "keywords in English or other languages?",
  "basis": "inferred",
  "note": "Guess at the parenthetical."
 },
 "b2-28-1qeng0e": {
  "answer": "COBOL",
  "basis": "inferred",
  "note": "COBOL was the U.S. committee (CODASYL/DoD) language of 1959."
 },
 "b2-29-1dxh0dq": {
  "answer": "data type",
  "basis": "sebesta"
 },
 "b2-29-1u3hy07": {
  "answer": "could be any length",
  "basis": "sebesta"
 },
 "b2-29-soyamr": {
  "answer": "any number of",
  "basis": "sebesta"
 },
 "b2-29-wvjh0m": {
  "answer": "mode",
  "basis": "sebesta"
 },
 "b2-29-17ert3j": {
  "answer": "brackets [ ]",
  "basis": "sebesta"
 },
 "b2-30-5loocb": {
  "answer": "Block",
  "basis": "sebesta",
  "note": "Algol 60: block structure (local scope)."
 },
 "b2-30-wcesra": {
  "answer": "else-if",
  "basis": "sebesta"
 },
 "b2-30-11brhvz": {
  "answer": "Semicolon",
  "basis": "sebesta"
 },
 "b2-30-18zqk9a": {
  "answer": ":=",
  "basis": "sebesta",
  "note": "The blank after 'and not' is presumably '='."
 },
 "b2-30-fjs056": {
  "answer": "Recursion (recursive procedures)",
  "basis": "sebesta"
 },
 "b2-31-1jdluvo": {
  "answer": "Stack-dynamic",
  "basis": "sebesta"
 },
 "b2-31-1br7kp3": {
  "answer": "syntax",
  "basis": "sebesta",
  "note": "First language whose syntax was formally defined (BNF)."
 },
 "b2-32-1v33sp": {
  "answer": "I/O (input/output statements)",
  "basis": "sebesta"
 },
 "b2-32-1u3vlgo": {
  "answer": "formal syntax description (BNF)",
  "basis": "sebesta"
 },
 "b2-32-ks9qku": {
  "answer": "complete redesign (big break)",
  "basis": "inferred",
  "note": "Sub-points are 'No ___' (likely backward compatibility with Algol 60) and weird bracketing (fi, od). Exact word is a guess."
 },
 "b2-34-d154lm": {
  "answer": "3rd Oldest WSUT",
  "basis": "inferred",
  "note": "Pattern guess: COBOL (1959) is third after Fortran and Lisp. But the box has only one short line, so it may be something else, e.g. 'Business'."
 },
 "b2-34-1wt15e2": {
  "answer": "English",
  "basis": "sebesta",
  "note": "Hopper: data-processing programs should be written in English statements, not mathematical notation."
 },
 "b2-34-1nex99h": {
  "answer": "a committee (CODASYL: computer makers + U.S. DoD)",
  "basis": "sebesta"
 },
 "b2-34-1rw1fxo": {
  "answer": "Hardly (barely)",
  "basis": "sebesta",
  "note": "Sebesta: little effect on later languages, only PL/I."
 },
 "b2-35-1brpsfm": {
  "answer": "simple English",
  "basis": "sebesta"
 },
 "b2-35-1r93pxg": {
  "answer": "read and understand the programs",
  "basis": "inferred",
  "note": "Follows from the English goal. Exact wording is a guess."
 },
 "b2-35-hq9j73": {
  "answer": "easy to use, even if that means less powerful",
  "basis": "sebesta"
 },
 "b2-36-19g160h": {
  "answer": "macro facility",
  "basis": "sebesta"
 },
 "b2-36-1ilwd9j": {
  "answer": "hierarchical data structures (records)",
  "basis": "sebesta"
 },
 "b2-36-2lbnmi": {
  "answer": "30",
  "basis": "sebesta"
 },
 "b2-36-1amaebz": {
  "answer": "data division (data separate from code)",
  "basis": "sebesta",
  "note": "History post-test answer key: COBOL 'has separate data and control sections'."
 },
 "b2-37-1idwzjh": {
  "answer": "the U.S. Department of Defense (DoD)",
  "basis": "sebesta"
 },
 "b2-40-10ykmya": {
  "answer": "formal logic (predicate calculus)",
  "basis": "sebesta"
 },
 "b2-40-i3wca9": {
  "answer": "stating facts and rules (what is true)",
  "basis": "slides",
  "note": "History post-test answer key: 'A program is statements of what is true' = Prolog."
 },
 "b2-40-16sajux": {
  "answer": "queries (goals)",
  "basis": "inferred",
  "note": "Guess. Might be 'rules' if the first blank is 'facts'."
 },
 "b2-41-1tsfogg": {
  "answer": "Fifth Generation Computer Systems (FGCS)",
  "basis": "history"
 },
 "b2-41-qujqf6": {
  "answer": "Inefficient (slow)",
  "basis": "inferred",
  "note": "Guess. Sebesta lists inefficiency as Prolog's main problem."
 },
 "b4-6-17wxr8m": {
  "answer": "set of all allowed characters (symbols)",
  "basis": "sebesta",
  "note": "Sebesta: sentences are strings of characters over some alphabet."
 },
 "b4-6-1pvaezd": {
  "answer": "lowest-level syntactic unit",
  "basis": "slides",
  "note": "Translation post-test answer key."
 },
 "b4-6-25409l": {
  "answer": "a category of lexemes",
  "basis": "slides",
  "note": "Translation post-test answer key."
 },
 "b4-6-11dwxuq": {
  "answer": "a string of characters (lexemes) over the alphabet",
  "basis": "sebesta",
  "note": "The neighbouring 'making an ___' blank is probably 'instruction/statement'."
 },
 "b4-6-a4deke": {
  "answer": "all possible programs (an infinite set of sentences)",
  "basis": "inferred",
  "note": "Sebesta: a language is a set of sentences. Exact blank wording is a guess."
 },
 "b4-9-1c2lc5i": {
  "answer": "metalanguage",
  "basis": "sebesta"
 },
 "b4-10-1emla9x": {
  "answer": "grammar",
  "basis": "sebesta"
 },
 "b4-10-gksina": {
  "answer": "a production: LHS -> RHS",
  "basis": "sebesta",
  "note": "Sebesta: rules (productions) have an LHS and an RHS."
 },
 "b4-10-188phra": {
  "answer": "nonterminal (abstraction)",
  "basis": "sebesta",
  "note": "The sub-point blank is presumably 'angle' brackets <>."
 },
 "b4-10-zrpxqy": {
  "answer": "a string of terminals and/or nonterminals",
  "basis": "sebesta"
 },
 "b4-11-um78hb": {
  "answer": "where every derivation starts (e.g. <program>)",
  "basis": "sebesta"
 },
 "b4-11-19gijsp": {
  "answer": "applied from the start symbol until only terminals remain",
  "basis": "sebesta",
  "note": "Sebesta: derivation = repeated application of rules, start symbol to a sentence."
 },
 "b4-14-1mg5y26": {
  "answer": "A grammar that can generate a sentence in more than one way (more than one meaning)",
  "basis": "inferred",
  "note": "Next line on the slide is 'two or more distinct parse trees'."
 },
 "b4-18-1rtsj9w": {
  "answer": "recursion (only left recursion, so left-associative)",
  "basis": "inferred",
  "note": "The unambiguous rule <expr> -> <expr> / <const> removes the right-side recursion."
 },
 "b5.1-2-1y46yxe": {
  "answer": "memory (memory cells / addresses)",
  "basis": "sebesta",
  "note": "Sebesta: a variable is an abstraction of a memory cell."
 },
 "b5.1-2-xih8qp": {
  "answer": "variables (data)",
  "basis": "sebesta"
 },
 "b5.1-2-1bzqiww": {
  "answer": "labels (statement locations)",
  "basis": "sebesta"
 },
 "b5.1-2-15dbo29": {
  "answer": "subprograms (functions/procedures) and their calls",
  "basis": "sebesta"
 },
 "b5.1-11-1alzemu": {
  "answer": "properties/characteristics of a name (address, value, type, scope, lifetime)",
  "basis": "inferred",
  "note": "The slide shows the tuple. The next blank is probably 'Binding'."
 },
 "b5.1-12-d0rlwo": {
  "answer": "an entity and an attribute",
  "basis": "sebesta"
 },
 "b5.1-12-1vp401l": {
  "answer": "the time at which a binding takes place",
  "basis": "sebesta"
 },
 "b5.1-13-1dentfq": {
  "answer": "* bound to the multiplication operation",
  "basis": "sebesta"
 },
 "b5.1-13-uyuo26": {
  "answer": "int bound to a range of values (e.g. 32 bits) / float representation",
  "basis": "sebesta"
 },
 "b5.1-13-3wpx1n": {
  "answer": "a variable bound to its type (C, Java)",
  "basis": "sebesta"
 },
 "b5.1-13-1mvewaw": {
  "answer": "a C static / global variable bound to a memory cell",
  "basis": "sebesta"
 },
 "b5.1-13-3j4dxz": {
  "answer": "a local (non-static) variable bound to a memory cell (also: a value bound to a variable)",
  "basis": "sebesta"
 },
 "b5.1-20-uo4ng": {
  "answer": "in the memory cell (at the address)",
  "basis": "inferred",
  "note": "Sub-points: '___' (likely 'bits') and 'programmer meaning'."
 },
 "b5.1-23-512qco": {
  "answer": "name",
  "basis": "slides",
  "note": "Lecture 5.2 slide 3: 'Time in which a name is bound to ...'."
 },
 "b5.2-3-1fpops0": {
  "answer": "a particular memory cell (address)",
  "basis": "sebesta"
 },
 "b5.2-3-13hvl1o": {
  "answer": "Time during which (how long)",
  "basis": "sebesta"
 },
 "b5.2-4-k5eo6i": {
  "answer": "before",
  "basis": "sebesta"
 },
 "b5.2-4-6sb5rq": {
  "answer": "bound to those same cells until the end of (throughout)",
  "basis": "sebesta"
 },
 "b5.2-5-1cn54g5": {
  "answer": "Efficiency (fast)",
  "basis": "sebesta"
 },
 "b5.2-5-185j6u1": {
  "answer": "direct",
  "basis": "sebesta",
  "note": "Next blank: no run-time allocation."
 },
 "b5.2-5-1apq569": {
  "answer": "Lack of flexibility",
  "basis": "sebesta"
 },
 "b5.2-5-o2oefn": {
  "answer": "recursion",
  "basis": "sebesta"
 },
 "b5.2-5-qzsegc": {
  "answer": "the size (amount of memory needed) is not known",
  "basis": "inferred",
  "note": "Fits the slide's question form."
 },
 "b5.2-5-vfx0v2": {
  "answer": "Sharing storage among variables",
  "basis": "sebesta",
  "note": "Sebesta: storage cannot be shared among variables."
 },
 "b5.2-7-1ioamgu": {
  "answer": "their declaration statements are elaborated (reached during execution)",
  "basis": "sebesta"
 },
 "b5.2-7-1x6mab9": {
  "answer": "local variables in functions/methods",
  "basis": "sebesta"
 },
 "b5.2-8-1ru0447": {
  "answer": "Allows recursion",
  "basis": "sebesta"
 },
 "b5.2-8-7nh2ae": {
  "answer": "Conserves storage (memory reused by subprograms)",
  "basis": "sebesta"
 },
 "b5.2-8-1r4q93h": {
  "answer": "Automatic: memory freed when the function returns (each call gets its own copy)",
  "basis": "inferred",
  "note": "Sebesta gives only two advantages, so the third is a guess."
 },
 "b5.2-8-2axjd9": {
  "answer": "allocation and deallocation (run-time overhead)",
  "basis": "sebesta"
 },
 "b5.2-8-1nwwcf2": {
  "answer": "stack and heap (what is stored where)",
  "basis": "inferred",
  "note": "Inferred from the slide: rules differ for scalar vs structure (e.g. Java primitives vs objects)."
 },
 "b5.2-9-1f8ecni": {
  "answer": "explicit run-time instructions written by the programmer",
  "basis": "sebesta"
 },
 "b5.2-9-n29d31": {
  "answer": "pointers or references",
  "basis": "sebesta",
  "note": "The Java e.g. is 'new'."
 },
 "b5.2-9-1wwejxc": {
  "answer": "malloc",
  "basis": "sebesta",
  "note": "Collected with free."
 },
 "b5.2-10-1lyuxb": {
  "answer": "size is not known until run time (dynamic structures like linked lists/trees that grow and shrink)",
  "basis": "sebesta"
 },
 "b5.2-10-1ii9e8o": {
  "answer": "Hard to use pointers/references correctly (dangling pointers, memory leaks)",
  "basis": "sebesta"
 },
 "b5.2-10-183ma1q": {
  "answer": "references (indirection) and heap storage management",
  "basis": "sebesta"
 },
 "b5.2-11-1tfkhqm": {
  "answer": "happen automatically when values are assigned",
  "basis": "sebesta"
 },
 "b5.2-12-amhff2": {
  "answer": "the programmer (highly flexible, generic code)",
  "basis": "sebesta"
 },
 "b5.2-12-1chqbh": {
  "answer": "execution (run-time overhead of tracking dynamic attributes)",
  "basis": "sebesta"
 },
 "b5.2-12-x45n2b": {
  "answer": "error detection (by the compiler)",
  "basis": "sebesta"
 },
 "b5.2-12-15xkz2k": {
  "answer": "storage management (allocation) and garbage collection",
  "basis": "sebesta"
 },
 "b5.2-17-1z0hmfk": {
  "answer": "the beginning of the block (function)",
  "basis": "sebesta"
 },
 "b5.2-17-1nmgw0y": {
  "answer": "the whole block",
  "basis": "sebesta"
 },
 "b5.2-17-1nupb69": {
  "answer": "anywhere a statement can appear",
  "basis": "sebesta"
 },
 "b5.2-17-xlqxev": {
  "answer": "its declaration to the end of the block",
  "basis": "sebesta"
 },
 "b5.2-18-1bdnapt": {
  "answer": "locally (current block/subprogram)",
  "basis": "sebesta"
 },
 "b5.2-18-1l2aj7l": {
  "answer": "enclosing scopes (static parent, then other static ancestors)",
  "basis": "sebesta"
 },
 "b5.2-18-y0ks90": {
  "answer": "static ancestors",
  "basis": "sebesta"
 },
 "b5.2-18-1c3pdl9": {
  "answer": "static parent",
  "basis": "sebesta"
 },
 "b5.2-20-1rd28ca": {
  "answer": "closer (more local)",
  "basis": "sebesta",
  "note": "Next blank: 'the same'. Losing access = 'scope hole'."
 },
 "b5.2-22-1ggm1g": {
  "answer": "a constant used everywhere (e.g. PI, max size)",
  "basis": "inferred",
  "note": "Slide has three e.g. lines; any reasonable use works, such as a debug flag or counters."
 },
 "b5.2-22-oyg3tt": {
  "answer": "permission first (justify it)",
  "basis": "inferred",
  "note": "Guess at the prof's warning. Unverifiable."
 },
 "b5.2-25-1tsvhoc": {
  "answer": "Most languages",
  "basis": "inferred",
  "note": "Guess. Static scoping is the norm."
 },
 "b5.2-25-cfdb6p": {
  "answer": "look",
  "basis": "inferred",
  "note": "Next blank is probably 'run/trace it'."
 },
 "b5.2-25-2dcfzo": {
  "answer": "make variables global (too much access)",
  "basis": "sebesta",
  "note": "Sebesta: static scoping pushes programmers toward too many globals."
 },
 "b5.2-26-1jx8zl7": {
  "answer": "Called subprogram can use caller's variables (no need to pass parameters)",
  "basis": "sebesta"
 },
 "b5.2-26-sjqamj": {
  "answer": "Can't tell by looking",
  "basis": "sebesta",
  "note": "Sebesta: dynamic scoping makes programs much harder to read."
 },
 "b5.2-26-j5g3ig": {
  "answer": "Few languages use it (unfamiliar)",
  "basis": "inferred",
  "note": "Guess. Other Sebesta disadvantages: less reliable, no static type checking, slower nonlocal access."
 },
 "b5.2-29-1ern6en": {
  "answer": "once",
  "basis": "sebesta",
  "note": "Second line: when it is bound to storage (can't change)."
 },
 "b5.2-29-1f7ujm2": {
  "answer": "Readability",
  "basis": "sebesta",
  "note": "Also modifiability/reliability."
 },
 "b5.2-30-9s5mne": {
  "answer": "Statically",
  "basis": "sebesta",
  "note": "Or dynamically."
 },
 "b5.2-30-17h7wbd": {
  "answer": "manifest",
  "basis": "sebesta"
 }
};
})(globalThis.FC = globalThis.FC || {});

// Cards must make sense without the slide in front of you. Blanks that were defined by
// their position ("third point", "the box on slide 25") are either merged into one
// question about the whole list (blankGroups) or reworded around their content (blankAsk).
(function (FC) {
  FC.blankGroups = [
    { ids: ['b1-5-1s832o7', 'b1-5-fngtn3', 'b1-5-10haett', 'b1-5-7m32oy', 'b1-5-s7pz3a', 'b1-5-182gwm3', 'b1-5-4eparh'],
      ask: 'What does a language need to be Turing complete?',
      answer: 'Ordered (sequential) instructions that read from and write to memory; a conditional jump (goto with a compare) so instructions can repeat conditionally; and memory, so information is stored and can be changed later.',
      basis: 'inferred', note: 'Her slide 5 lists these as blanks; her Control Structures slides confirm “ordered statements plus a conditional kind of repetition (goto with compare) is sufficient”.' },
    { ids: ['b2-13-rcmyge', 'b2-13-1lkuwux', 'b2-13-184z91j'],
      ask: 'What did Fortran 77 add? (It was also an ANSI standard, 1978, with logical loop control.)',
      answer: 'Character string handling and the IF-THEN-ELSE statement (also: lowercase letters could be used for the first time, a best guess).',
      basis: 'sebesta', note: 'The lowercase-letters item is a guess at one blank; the rest is Sebesta.' },
    { ids: ['b2-14-1q9irl6', 'b2-14-1ki8wyr', 'b2-14-1dhnq6a', 'b2-14-m9s88n', 'b2-14-fu1s9p'],
      ask: 'What did Fortran 90 add (besides modules)?',
      answer: 'Dynamic arrays, pointers, recursion, a CASE statement, and parameter type checking.',
      basis: 'sebesta' },
    { ids: ['b2-15-ksgz9q', 'b2-15-5d957n'],
      ask: 'Fortran today: what is it still used for, and what are its main competitors?',
      answer: 'Still widely used, mainly for scientific / numerical (high-performance) computing; its main competitors are C and C++.',
      basis: 'inferred' },
    { ids: ['b2-17-1upkq0w', 'b2-17-4xn65v'],
      ask: 'LISP came from AI research. What two kinds of processing did that need?',
      answer: 'Processing data in lists (rather than arrays) and symbolic computation (rather than numeric).',
      basis: 'sebesta' },
    { ids: ['b2-19-sv918w', 'b2-19-1wor3hx'],
      ask: 'Pure Lisp has exactly two kinds of data. What are they? (e.g. grizzly vs (lynx (grizzly black) moose))',
      answer: 'Atoms (like grizzly) and lists (like (lynx (grizzly black) moose)).',
      basis: 'sebesta' },
    { ids: ['b2-20-1ugwahe', 'b2-20-4euqdy', 'b2-20-k9tt2n'],
      ask: 'Pure Lisp has no loops. Why is it still Turing complete?',
      answer: 'Repetition comes from recursion; selection comes from conditional expressions (cond); data/memory is held in lists and function parameters.',
      basis: 'inferred', note: 'Recursion as the source of repetition is from her History post-test; the other two points are best guesses.' },
    { ids: ['b5.2-8-1ru0447', 'b5.2-8-7nh2ae', 'b5.2-8-1r4q93h'],
      ask: 'What are the advantages of stack-dynamic variables?',
      answer: 'They allow recursion; they conserve storage (memory is reused across calls); and they are freed automatically when the function returns.',
      basis: 'sebesta', note: 'The third point is a best guess at her wording.' },
  ];
  FC.blankAsk = {
    'b2-9-6xyr4a': 'Her label for FORTRAN: “____ Programming Language”',
    'b2-22-1sar9py': 'Her label for LISP: “____ Programming Language”',
    'b2-25-g4eews': 'Her label for Algol (words before and after “Programming Language”): ____',
    'b2-34-d154lm': 'Her label for COBOL: “____ Programming Language”',
    'b2-9-ic8frt': 'What was Fortran I (1957)?',
    'b2-8-1e39jm4': 'What was the 1954 “Fortran on paper”, and was it implemented?',
    'b4-14-1mg5y26': 'Define an ambiguous grammar.',
  };
})(globalThis.FC = globalThis.FC || {});
