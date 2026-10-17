// "Help" walkthroughs for CSC 370 Lecture 4 (translation: compilers, interpreters, lexemes and
// tokens, BNF, derivations, parse trees, ambiguity, precedence, associativity, EBNF).
// Format: see the header of decks/csc370-help.js. Math is OFF for this class.
(function (FC) {
  'use strict';
  const H = FC.help = FC.help || {};
  const leaf = label => ({ label, kids: [] });
  const node = (label, ...kids) => ({ label, kids });

  // ---- shared tree builders --------------------------------------------------------------
  // Slide 12 sample grammar.
  const sVar = v => node('<var>', leaf(v));
  const sNum = n => node('<num>', leaf(n));
  const sTermV = v => node('<term>', sVar(v));
  const sTermN = n => node('<term>', sNum(n));
  // c = c + 2 * a
  const ccTree = () => node('<program>', node('<stmts>', node('<stmt>', sVar('c'), leaf('='),
    node('<expr>', sTermV('c'), leaf('+'), node('<expr>', sTermN('2'), leaf('*'), node('<expr>', sTermV('a')))))));
  // a * b + c, the <expr> part only
  const abcExpr = () => node('<expr>', sTermV('a'), leaf('*'), node('<expr>', sTermV('b'), leaf('+'), node('<expr>', sTermV('c'))));
  // GPA grammar
  const gpa = (l, r) => node('<GPA>', node('<left digit>', leaf(l)), leaf('.'), node('<right digit>', leaf(r)));
  // <expr> → <expr> / <const> | <const>
  const cst = n => node('<const>', leaf(n));
  const leftDiv = () => node('<expr>', node('<expr>', node('<expr>', cst('60')), leaf('/'), cst('12')), leaf('/'), cst('4'));
  // <expr> → <expr> / <expr> | <const>
  const ec = n => node('<expr>', cst(n));
  const ambDivL = () => node('<expr>', node('<expr>', ec('60'), leaf('/'), ec('12')), leaf('/'), ec('4'));
  const ambDivR = () => node('<expr>', ec('60'), leaf('/'), node('<expr>', ec('12'), leaf('/'), ec('4')));
  // <S> → <S> + <S> | a
  const Sa = () => node('<S>', leaf('a'));
  const sLeft = () => node('<S>', node('<S>', Sa(), leaf('+'), Sa()), leaf('+'), Sa());
  const sRight = () => node('<S>', Sa(), leaf('+'), node('<S>', Sa(), leaf('+'), Sa()));

  const GPA = '<GPA> → 4.0 | <left digit> . <right digit>\n<left digit> → 0 | 1 | 2 | 3\n<right digit> → 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9';

  // ---- terminology ------------------------------------------------------------------------
  H['blank:b4-6-17wxr8m'] = {
    asks: 'The first word in the translation vocabulary: what is the alphabet of a language?',
    idea: 'Before you can talk about words, sentences or whole programs, you need the characters you are allowed to write with. That set of characters is the alphabet, and everything else is built on top of it.',
    steps: [
      'In English the alphabet is the letters, plus punctuation and the space. Every English sentence is written using only those.',
      'For Java, the alphabet is every character allowed in a source file: letters, digits, `_`, `+`, `=`, `;`, `{`, spaces, and so on.',
      'A small language can have a tiny alphabet. In the GPA grammar every sentence uses only the digits 0 to 9 and `.`',
      { text: 'Each vocabulary word is built from the one before it:', table: { head: ['word', 'what it is', 'Java example'], rows: [
        ['alphabet', 'the set of allowed characters', '`a`, `9`, `=`, `;`'],
        ['lexeme', 'a lowest-level unit made of those characters', '`count`, `>=`, `while`'],
        ['sentence', 'a string of characters (lexemes)', '`sum = sum + 1;`'],
        ['language', 'all possible sentences', 'every Java program']] } },
    ],
    answer: 'The set of all allowed characters (symbols) that sentences are written with.',
    mistake: 'Mixing the alphabet up with keywords or tokens. The alphabet is single characters; `while` is a lexeme made of five of them.',
    tryIt: { q: 'A language’s sentences are binary numbers such as `101` and `0`. What is its alphabet?', a: 'The set {0, 1}: those are the only characters any of its sentences use.' },
  };

  H['blank:b4-6-11dwxuq'] = {
    asks: 'In the translation vocabulary, what is a sentence?',
    idea: 'Take characters from the alphabet and string them together: that string is a sentence. In code, a sentence is a statement, and a whole program is one long sentence too.',
    steps: [
      '`x = y + 2;` is a string of characters from Java’s alphabet. It is a sentence.',
      'You can also read it as a string of lexemes rather than characters: `x`, `=`, `y`, `+`, `2`, `;`. The textbook says the strings of a language are called sentences or statements.',
      'To be a sentence of a particular language, the string must follow that language’s rules. `= x ; 2 +` uses the same characters, but no Java rule builds it.',
      'Her slide example `for (int i = 0; i < 10; i++){` is also called a Java sentence.',
    ],
    answer: 'A string of characters (lexemes) over the alphabet; in a programming language, a statement or program.',
    mistake: 'Thinking a sentence has to be English or end with a period. Here a sentence is any string the language’s rules accept.',
    tryIt: { q: 'The language of binary numbers has alphabet {0, 1}. Is `1021` a sentence of it?', a: 'No: `2` is not in the alphabet, so the string is not even built from the right characters.' },
  };

  H['blank:b4-6-a4deke'] = {
    asks: 'After alphabet, lexeme and sentence: what is a language?',
    idea: 'One sentence is one statement or one program. The language is the whole collection: every sentence that can possibly be written. (The exact words in her slide’s blank are a best guess; the idea, that a language is a set of sentences, is straight from the textbook.)',
    steps: [
      'One Java program is a sentence. Java, the language, is the set of every possible Java program, all at once.',
      'That set is infinite: you can always add one more statement. So nobody lists it; instead a grammar describes it with a finite set of rules.',
      'A small language can be finite. The GPA language is {0.0, 0.1, …, 3.9, 4.0}: 4 × 10 + 1 = 41 sentences.',
    ],
    answer: 'The set of all possible sentences; for a programming language, all possible programs.',
    mistake: 'Thinking a language means its keywords or its compiler. It is the set of sentences; the grammar is how we describe that set.',
    tryIt: { q: 'The language of 24-hour clock times runs from 00:00 to 23:59. How many sentences does it have?', a: '24 hours × 60 minutes = 1440 sentences.' },
  };

  H['blank:b4-9-1c2lc5i'] = {
    asks: 'BNF is used to describe programming languages. What kind of language is BNF itself?',
    idea: '"Meta" means "about". A metalanguage is a language used to describe another language. BNF talks about Java; it is not Java.',
    steps: [
      'To describe a programming language precisely you need a notation of its own, separate from the language being described.',
      { text: 'Her slide’s example describes a Java `for` statement:', code: '<for_stmt> → for (<init_stmt>;<bool_exp>;<assign_stmt>) | …' },
      'The `→`, the `|` and the `< >` names belong to BNF, the metalanguage. The `for`, `(` and `;` belong to Java, the language being described.',
      'John Backus and Noam Chomsky came up with this idea independently; Backus and Peter Naur used it for Algol.',
    ],
    answer: 'A metalanguage: a language used to describe another language.',
    mistake: 'Answering "a grammar" or "a programming language". BNF is the notation; a description written in it is a grammar.',
    tryIt: { q: 'In `<assign> → <var> = <expr>`, which parts are BNF and which belong to the language being described?', a: '`→` and the bracketed names `<assign>`, `<var>`, `<expr>` are BNF; the `=` is a symbol of the described language.' },
  };

  H['blank:b4-10-1emla9x'] = {
    asks: 'A BNF description is a collection of rules. What is that collection called?',
    idea: 'One rule describes one piece of the language. Put all the rules together and you have described the whole language: that collection is a grammar.',
    steps: [
      'One rule: `<var> → a | b | c | d` says what a variable can be.',
      'Her sample grammar is seven rules together, starting with `<program> → <stmts>`.',
      'The textbook uses "BNF" and "grammar" interchangeably for this reason.',
    ],
    answer: 'A grammar.',
    mistake: 'Calling it "a language". The language is the set of sentences; the grammar is the rules that generate them.',
    tryIt: { q: 'How many rules does the GPA grammar have, and what is the whole set called?', a: 'Three rules (`<GPA>`, `<left digit>`, `<right digit>`), and together they are a grammar.' },
  };

  H['blank:b4-11-um78hb'] = {
    asks: 'What is the start symbol of a grammar?',
    idea: 'Every derivation has to begin somewhere. The start symbol is the nonterminal that stands for a whole sentence (a whole program), so every derivation and every parse tree starts from it.',
    steps: [
      'In her sample grammar the start symbol is `<program>`: every program is derived from it.',
      'If you are not told which symbol it is, assume the first (top-most) nonterminal in the grammar.',
      'In the GPA grammar that is `<GPA>`. It is always the root of the parse tree.',
    ],
    ptree: { tree: gpa('2', '7'), caption: 'The parse tree of 2.7: the root is the start symbol <GPA>.' },
    answer: 'The nonterminal where every derivation starts (e.g. `<program>`).',
    mistake: 'Picking whichever nonterminal looks most important. Unless told otherwise, it is the one on the left of the first rule.',
    tryIt: { q: 'A grammar begins `<time> → <hour> : <min>`, followed by rules for `<hour>` and `<min>`. What is the start symbol?', a: '`<time>`: it is the top-most nonterminal, and it stands for a whole time.' },
  };

  H['blank:b4-11-19gijsp'] = {
    asks: 'What is a derivation?',
    idea: 'A derivation proves a sentence belongs to the language: start at the start symbol and keep replacing a nonterminal using a rule, one rule per step, until only terminals are left.',
    steps: [
      'Each step replaces one nonterminal with one of its right-hand sides. The symbol `⇒` is read "derives".',
      { text: 'Deriving 3.9 with the GPA grammar:', table: { head: ['string so far', 'rule used'], rows: [
        ['`<GPA>`', 'start symbol'],
        ['`<left digit> . <right digit>`', '`<GPA> → <left digit> . <right digit>`'],
        ['`3 . <right digit>`', '`<left digit> → 3`'],
        ['`3.9`', '`<right digit> → 9`']] } },
      'Each string along the way is called a sentential form. The derivation stops when the string has no nonterminals: that is the sentence.',
      'The parse tree records the same rule choices as a picture.',
    ],
    ptree: { tree: gpa('3', '9'), caption: 'The derivation of 3.9 drawn as a tree: each parent and its children is one rule.' },
    answer: 'A sequence of rule applications from the start symbol until only terminals remain (a sentence).',
    mistake: 'Writing two replacements in one step, or ending while a nonterminal is still in the string.',
    tryIt: { q: 'Derive 0.5 with the GPA grammar.', a: '`<GPA>` ⇒ `<left digit> . <right digit>` ⇒ `0 . <right digit>` ⇒ `0.5`' },
  };

  // ---- compilers and interpreters ---------------------------------------------------------
  H['l4-compiler-steps-list'] = {
    asks: 'Name the first step of a compiler, the one that turns characters into tokens.',
    idea: 'Follow one statement through the pipeline. Characters become tokens, tokens become a parse tree, and the tree becomes machine code. Each step needs the previous step’s output.',
    steps: [
      'Lexical analysis: read the characters left to right and group them into lexemes, each labelled with a token. `x = y + 2 * z;` becomes `x` identifier, `=` assignment operator, `y` identifier, and so on.',
      'Syntax analysis: fit those tokens to the grammar and build a parse tree. The tree shows that `2 * z` is grouped before the `+`.',
      'Code generation: walk the tree and emit machine instructions: load `y` and `z`, shift, add, store into `x`.',
      { text: 'One statement through all three:', table: { head: ['step', 'takes in', 'gives out'], rows: [
        ['1. lexical analysis', 'characters', 'lexemes + tokens'],
        ['2. syntax analysis', 'tokens', 'parse tree'],
        ['3. code generation', 'parse tree', 'machine code']] } },
    ],
    answer: 'Lexical analysis. Then syntax analysis (parse tree), then low-level code generation.',
    mistake: 'Putting syntax analysis first. The parser builds its tree out of tokens, so the lexical analyzer has to produce them before it can start.',
    tryIt: { q: 'Name the step that produces each: (a) a parse tree, (b) `load`/`add`/`store` instructions, (c) the pair `sum` / identifier.', a: '(c) lexical analysis comes first, then (a) syntax analysis, then (b) code generation.' },
  };

  H['l4-hybrid'] = {
    asks: 'Besides pure compiling and pure interpreting, there is a third way to run a program. Describe it.',
    idea: 'Compile once into a halfway language that is easy to interpret, then let each machine interpret that. You get most of a compiler’s speed and an interpreter’s portability.',
    steps: [
      'A pure compiler turns source into machine code for one kind of processor: fast, but tied to that machine.',
      'A pure interpreter decodes the high-level statements every time they run, which is slow.',
      'A hybrid system translates the source once into an intermediate language (such as bytecode) and then interprets that. It is faster than pure interpretation because the source is decoded only once.',
      { text: 'Java does exactly this:', code: 'javac Hello.java   → Hello.class  (bytecode, not machine code)\njava Hello         → the JVM interprets (or JIT-compiles) the bytecode' },
      'A JIT (just-in-time) system goes further: it compiles each bytecode method to machine code the first time it is called and keeps it for later calls.',
    ],
    answer: 'Compile to an intermediate language (such as bytecode), then interpret that on each machine. Example: Java and its JVM.',
    mistake: 'Calling bytecode machine code. No real processor runs Java bytecode directly; the JVM does.',
    tryIt: { q: 'Python’s usual implementation turns `.py` source into bytecode, then runs that bytecode on a virtual machine. Compiled, interpreted or hybrid?', a: 'Hybrid: compile once to an intermediate language (bytecode), then interpret it.' },
  };

  H['l4-lexeme-token'] = {
    asks: 'Define a lexeme.',
    idea: 'A lexeme is the actual text in the source. A token is the name of its category. Think of a word and its part of speech: "dog" is the word, "noun" is its category.',
    steps: [
      { text: 'The textbook’s example, `index = 2 * count + 17;`:', table: { head: ['lexeme (the text)', 'token (its category)'], rows: [
        ['`index`', 'identifier'], ['`=`', 'equal_sign'], ['`2`', 'int_literal'], ['`*`', 'mult_op'],
        ['`count`', 'identifier'], ['`+`', 'plus_op'], ['`17`', 'int_literal'], ['`;`', 'semicolon']] } },
      'Many lexemes share one token: `index` and `count` are different lexemes, both identifiers.',
      'Some tokens have only one possible lexeme: the token for `+` is only ever `+`.',
    ],
    answer: 'A lowest-level syntactic unit, like `if` or `count`. A token is the category of a lexeme (count → identifier).',
    mistake: 'Swapping them. The lexeme is what is literally written; the token is the label the compiler gives it.',
    tryIt: { q: 'Give the lexemes and tokens of `total = total - 5;`', a: '`total` identifier, `=` assignment operator, `total` identifier, `-` minus operator, `5` integer literal, `;` semicolon.' },
  };

  H['l4-tokenize-while'] = {
    asks: 'Say whether >= is one lexeme or two, and name its token.',
    idea: 'Read left to right, skip spaces, and take the longest piece that still makes sense as one unit. Then ask "what kind of thing is this?" for each piece.',
    steps: [
      'Spaces separate lexemes but are not lexemes themselves.',
      '`>=` is ONE lexeme: the analyzer keeps reading while the characters still form one operator.',
      { text: 'The full list:', table: { head: ['lexeme', 'token'], rows: [
        ['`while`', 'reserved word'], ['`(`', 'open paren'], ['`count`', 'identifier'], ['`>=`', 'relational operator'],
        ['`10`', 'integer literal'], ['`)`', 'close paren'], ['`sum`', 'identifier'], ['`=`', 'assignment operator'],
        ['`sum`', 'identifier'], ['`+`', 'plus (arithmetic) operator'], ['`count`', 'identifier'], ['`;`', 'semicolon']] } },
      'Token names differ between compilers (her slide writes things like `for_resWord`, `int_literal`); what matters is the category.',
    ],
    answer: 'One lexeme, a relational operator. (Whole statement: while reserved word, ( paren, count identifier, >= relational operator, 10 integer literal, ) paren, sum identifier, = assignment operator, sum identifier, + plus operator, count identifier, ; semicolon.)',
    mistake: 'Splitting `>=` into `>` and `=`, or giving `count` a different token the second time it appears. The same text always gets the same token.',
    tryIt: { q: 'Lexemes and tokens of `if (x != 0) y = y / x;`', a: '`if` reserved word, `(` open paren, `x` identifier, `!=` relational operator, `0` integer literal, `)` close paren, `y` identifier, `=` assignment operator, `y` identifier, `/` division operator, `x` identifier, `;` semicolon: 12 lexemes.' },
  };

  H['l4-how-know'] = {
    asks: 'Say how the lexical analyzer knows where an identifier such as x stops.',
    idea: 'The compiler does not "know" anything. The language’s rules say what each kind of lexeme looks like, and the lexical analyzer checks the characters against those rules one at a time, left to right.',
    steps: [
      { text: 'The lexical analyzer’s loop, roughly:', code: 'repeat until the end of the file:\n  skip whitespace\n  letter or _ : keep reading while letter, digit or _   → identifier\n  digit       : keep reading while digit                → integer literal\n  otherwise   : match a symbol from the rules (= + * ;) → its operator / punctuation' },
      'It reads `x`. A letter starts an identifier, so it keeps going. The next character is a space (not a letter, digit or underscore), so the identifier is just `x`.',
      'It skips the space and reads `=`. The rules say `=` is the assignment operator, which has its own machine code.',
      'Same for the rest: `y` and `z` are identifiers, `+` and `*` are operators, `2` is a literal, and `;` is punctuation that ends the statement.',
    ],
    answer: 'It reads left to right, ignoring whitespace, and keeps adding characters to the identifier until one is not a letter, digit or underscore. Each lexeme is then classified by the language’s rules (= is the assignment operator).',
    mistake: 'Saying it relies on the spaces. `x=y+2*z;` with no spaces is read exactly the same way, because each lexeme ends where the rules say it ends.',
    tryIt: { q: 'In `count2=7;` why is `count2` read as one identifier and not `count` followed by `2`?', a: 'Digits may continue an identifier, so reading goes on through the `2` and stops only at `=`, which is not a letter, digit or underscore.' },
  };

  H['l4-symtab'] = {
    asks: 'What is a symbol table, and what does a compiler use it for?',
    idea: 'It is the compiler’s address book for names. Every identifier gets an entry the first time it is seen, so later steps can look a name up instead of re-reading the source.',
    steps: [
      'As the lexical and syntax analyzers meet each user-defined name, they record it along with its properties.',
      { text: 'For `int x, y, z;  x = y + 2 * z;` the table might hold (addresses made up):', table: { head: ['name', 'type', 'memory location'], rows: [['`x`', 'int', '1000'], ['`y`', 'int', '1004'], ['`z`', 'int', '1008']] } },
      'When code generation needs "load `y`", it looks up `y` here and finds its location, 1004.',
    ],
    answer: 'A list of all the identifiers in the program, with their value or memory location (and other properties such as type). Later phases look names up there.',
    mistake: 'Putting keywords, operators or literals in it. It holds the program’s own names (identifiers), not `int`, `=` or `2`.',
    tryIt: { q: 'For `double rate; int n; rate = n * 1.5;` which entries go into the symbol table?', a: 'Just `rate` (double) and `n` (int). Not `1.5`, `*`, `=` or the keywords.' },
  };

  // ---- GPA grammar ------------------------------------------------------------------------
  H['l4-gpa-bnf'] = {
    asks: 'Write BNF rules that accept every GPA from 0.0 to 4.0 (one digit after the point) and nothing else.',
    idea: 'Split each GPA into pieces: digit, point, digit. Give each piece its own nonterminal listing exactly what is allowed. The tricky part is the edge: 4.0 is allowed but 4.1 is not.',
    steps: [
      'Every GPA has the shape digit `.` digit.',
      'A first try, `<GPA> → <digit> . <digit>`, accepts 4.5 and 9.9: too much.',
      'A left digit of 0 to 3 can go with any right digit. A left digit of 4 can only go with 0. So 4.0 gets its own alternative, and `<left digit>` stops at 3.',
      { text: 'The grammar:', code: GPA },
      'Check the edges: 0.0 yes, 3.9 yes, 4.0 yes (the first alternative), 4.1 no.',
    ],
    ptree: [
      { tree: gpa('2', '7'), caption: '2.7 uses the second alternative.' },
      { tree: node('<GPA>', leaf('4.0')), caption: '4.0 is its own alternative.' },
    ],
    answer: '`<GPA> → 4.0 | <left digit> . <right digit>`; `<left digit> → 0 | 1 | 2 | 3`; `<right digit> → 0 | 1 | … | 9`.',
    mistake: 'Letting the left digit go up to 4 (which lets in 4.1 to 4.9), or forgetting 4.0 entirely.',
    tryIt: { q: 'Write BNF for ratings from 1.0 to 5.0 with one digit after the point.', a: '`<rating> → 5.0 | <left> . <right>`; `<left> → 1 | 2 | 3 | 4`; `<right> → 0 | 1 | … | 9`.' },
  };

  H['l4-gpa-derive-write'] = {
    asks: 'Write out the leftmost derivation of 3.9 with the GPA grammar: every step from `<GPA>` until only characters remain.',
    idea: 'Start at the start symbol. At each step, replace the leftmost nonterminal using one rule. Stop when no nonterminals are left.',
    steps: [
      'Which alternative of `<GPA>`? 3.9 does not start with 4, so it must be `<left digit> . <right digit>`.',
      { text: 'One rule per step, always the leftmost nonterminal:', table: { head: ['sentential form', 'rule used'], rows: [
        ['`<GPA>`', 'start'],
        ['`<left digit> . <right digit>`', '`<GPA> → <left digit> . <right digit>`'],
        ['`3 . <right digit>`', '`<left digit> → 3`'],
        ['`3.9`', '`<right digit> → 9`']] } },
      'Leftmost means `<left digit>` is replaced before `<right digit>`, so the sentence fills in left to right.',
    ],
    ptree: { tree: gpa('3', '9'), caption: 'The parse tree of the same derivation.' },
    answer: '`<GPA>` ⇒ `<left digit> . <right digit>` ⇒ `3 . <right digit>` ⇒ `3.9`',
    mistake: 'Replacing both digits in one step, or doing `<right digit>` first (that is a rightmost derivation).',
    tryIt: { q: 'Leftmost derivation of 1.6 with the same grammar.', a: '`<GPA>` ⇒ `<left digit> . <right digit>` ⇒ `1 . <right digit>` ⇒ `1.6`' },
  };

  H['l4-gpa-41'] = {
    asks: 'Try to derive 4.1 with the GPA grammar. Can you?',
    idea: 'To derive a sentence, every piece of it has to come from some rule. Check each way the grammar could produce a leading 4.',
    steps: [
      { text: 'Look at both alternatives of `<GPA>`:', table: { head: ['alternative', 'what it can give', '4.1?'], rows: [
        ['`4.0`', 'exactly 4.0', 'no: the digit after the point is 0, not 1'],
        ['`<left digit> . <right digit>`', 'left digit 0 to 3', 'no: `<left digit>` has no 4']] } },
      'Neither alternative can produce 4.1, so there is no derivation.',
      'That is the grammar doing its job: 4.1 is not a valid GPA, and it is not a sentence of this language.',
    ],
    answer: 'It cannot be derived. The only rule giving a leading 4 is `<GPA> → 4.0`, and `<left digit>` stops at 3. So 4.1 is not a sentence of the language, which is right because 4.1 is not a valid GPA.',
    mistake: 'Forcing a derivation anyway, for example writing `<left digit> → 4`. You may only use rules that are in the grammar.',
    tryIt: { q: 'With the same grammar, can 3.10 be derived?', a: 'No: `<right digit>` gives exactly one digit and nothing may follow it, so the extra 0 has no rule to come from.' },
  };

  // ---- compiler vs interpreter --------------------------------------------------------------
  H['l4-same'] = {
    asks: 'Compilers and interpreters differ in when they do their work. What job do they share?',
    idea: 'The processor only runs machine instructions. Both a compiler and an interpreter exist to bridge that gap: they take code people write and turn it into lower-level code the machine can run.',
    steps: [
      'You write `x = y + 2 * z;`. The processor cannot run that text.',
      'A compiler turns it into lower-level code (load, shift, add, store) ahead of time.',
      'An interpreter turns it into the same kind of lower-level work as the program runs.',
      'Same job; the difference (next card) is when and how much at a time.',
    ],
    answer: 'Both generate lower-level code (e.g. machine code) from higher-level code.',
    mistake: 'Describing a difference (speed, whole file vs one line) when the question asks for what they share.',
    tryIt: { q: 'Which is the similarity? (a) both translate the whole file before running, (b) both turn higher-level code into lower-level code, (c) both make the program faster at run time.', a: '(b). (a) is only true of a compiler, and (c) is the compiler’s advantage.' },
  };

  H['l4-diff'] = {
    asks: 'Say how much of the program a compiler processes before it produces lower-level code.',
    idea: 'Think of translating a book. A compiler translates the whole book first, then you read it. An interpreter is a live interpreter: it translates one sentence, you hear it, then it moves to the next.',
    steps: [
      'Compiler: processes the entire file and produces the lower-level code for all of it at once. Only then does the program run.',
      'Interpreter: takes one line, translates it, executes it, then moves on to the next line.',
      { text: 'Side by side:', table: { head: ['', 'compiler', 'interpreter'], rows: [
        ['how much at a time', 'whole file', 'one line'], ['when it runs', 'after all of it is translated', 'each line right after it is translated'],
        ['typo on the last line', 'nothing runs', 'earlier lines run first']] } },
    ],
    answer: 'The entire file at once. An interpreter instead translates one line, executes it, then moves on.',
    mistake: 'Saying "a compiler makes machine code and an interpreter does not". Both produce lower-level code; the difference is whole file vs line by line.',
    tryIt: { q: 'A 100-line program has a typo on line 90. What happens with a compiler, and with an interpreter?', a: 'Compiler: the whole file must translate first, so nothing runs. Interpreter: lines 1 to 89 run, then it stops at line 90.' },
  };

  H['l4-adv-compiled'] = {
    asks: 'Why would you want a language to be compiled? What does compiling buy you?',
    idea: 'Translate once, run many times. All the translation work is paid up front, so every run afterwards is just the machine code going at full speed.',
    steps: [
      'A compiled program is translated once. After that, running it means running machine code directly.',
      'An interpreted program is translated again each time it runs, and a line inside a loop is decoded every time round the loop. The textbook calls that decoding the interpreter’s bottleneck.',
      'So the compiled program runs faster, especially if it runs often or loops a lot.',
    ],
    answer: 'Once compiled, the program runs faster, because it does not need to be translated again each time it runs.',
    mistake: 'Saying it is faster to get started. That is the interpreter’s advantage; the compiler’s is speed once it is running.',
    tryIt: { q: 'A game runs for hours, repeating the same code millions of times. Compiled or interpreted, and why?', a: 'Compiled: the translation is done once, and every repetition runs at machine-code speed.' },
  };

  H['l4-adv-interp'] = {
    asks: 'Give the main advantage of running a language with an interpreter.',
    idea: 'An interpreter does not wait to translate the whole file. It starts on line 1 right away, so you see results sooner, even if a later part of the code is still broken.',
    steps: [
      'With a compiler, the whole file must be translated (and be free of errors) before anything runs.',
      'An interpreter translates and runs the first line immediately, so the program gets going faster.',
      'A mistake further down does not stop the start: the earlier lines still run, and it only stops when it reaches the broken line.',
    ],
    answer: 'It starts running sooner, and mistakes elsewhere in the code do not stop it from starting.',
    mistake: 'Saying interpreted programs run faster. Overall they run slower; the advantage is starting sooner and not being blocked by errors elsewhere.',
    tryIt: { q: 'You are trying out a short script, changing one line and rerunning it every minute. Which approach suits this better?', a: 'Interpreted: each run starts right away, with no wait to translate the whole file first.' },
  };

  // ---- x = y + 2 * z -----------------------------------------------------------------------
  H['l4-xyz-instr'] = {
    asks: 'Spell out roughly what machine instructions `x = y + 2 * z;` turns into, assuming all variables are integers.',
    idea: 'The processor can only work on values in its registers. So: bring `y` and `z` in from memory, do the arithmetic in registers, and put the result back in memory at `x`.',
    steps: [
      'Load `y` into register A and `z` into register B (from memory).',
      'Multiply `z` by 2. In binary that is a left shift by 1 bit, just as adding a 0 in decimal multiplies by 10: 3 is `011`, shifted it is `110`, which is 6.',
      'Add the registers: A + B, result into A. The multiply comes before the add because it is deeper in the parse tree.',
      'Store A into memory at `x`.',
      { text: 'Written as pseudo-assembly (real names depend on the processor):', code: 'LOAD  A, y     ; A ← y   (from memory)\nLOAD  B, z     ; B ← z\nSHL   B, 1     ; B ← 2 * z (shift left 1 bit)\nADD   A, B     ; A ← y + 2 * z\nSTORE A, x     ; x ← A   (back to memory)' },
      'Check with y = 5, z = 3: B = 3 shifted = 6, then 5 + 6 = 11, which is 5 + 2 × 3.',
    ],
    answer: 'Depends on the architecture, but something like: load `y` into register A and `z` into register B; shift B left 1 bit; add A and B into A; store A into memory at `x`.',
    mistake: 'Forgetting the load at the start or the store at the end. Arithmetic only happens in registers, and `x` lives in memory.',
    tryIt: { q: 'Integers again: roughly what instructions for `a = b * 4 + c;`?', a: 'Load `b` and `c` into registers, shift `b`’s register left 2 bits (4 = 2 × 2), add the two registers, store the result at `a`.' },
  };

  H['l4-where-2'] = {
    asks: 'When `x = y + 2 * z;` actually runs, where is the 2 kept?',
    idea: 'Variables live in memory, but a constant is not a variable: there is no memory cell named 2. Either the 2 disappears into a shift, or it is written inside the instruction itself.',
    steps: [
      'Multiplying by 2 is a 1-bit left shift, so the compiler can drop the 2 completely.',
      { text: 'Two ways it can turn out:', code: 'SHL  B, 1     ; times 2 as a shift: no 2 anywhere\nMUL  B, 2     ; or: the 2 is written inside the instruction itself' },
      'Either way nothing has to fetch a 2 from a variable in memory, the way `y` and `z` are fetched.',
    ],
    answer: 'Likely nowhere: the multiplication by 2 is replaced by a 1-bit left shift. Otherwise the compiler builds the 2 directly into the instruction.',
    mistake: 'Saying it is loaded from memory like `y` and `z`. Constants usually live inside the instructions, not in variables.',
    tryIt: { q: 'In `n = n + 10;`, where does the 10 come from during execution?', a: 'There is no shift trick for adding, so the compiler builds 10 into the add instruction itself; it is not a variable in memory.' },
  };

  H['l4-where-x'] = {
    asks: 'When `x = y + 2 * z;` runs, where does `x` live?',
    idea: 'Every variable has a home in memory, and its location is recorded in the symbol table. The processor works on copies in registers, and results go back home to memory.',
    steps: [
      '`x` is a variable, so it has a memory location (in RAM, possibly held in the cache for speed).',
      'In this statement `x` is where the result goes: the last instruction stores the register’s value into `x`’s memory location.',
      { text: 'Where each piece is during execution:', table: { head: ['piece', 'what it is', 'where it is'], rows: [
        ['`x`, `y`, `z`', 'variables', 'memory (RAM or cache); loaded into registers to work on'],
        ['`2`', 'constant', 'inside the instruction, or gone (a shift)'],
        ['`+`, `*`', 'operators', 'the instructions themselves (add, shift)']] } },
    ],
    answer: 'From memory (RAM or cache).',
    mistake: 'Answering "a register". Registers hold copies while the work is done; the variable itself lives in memory.',
    tryIt: { q: 'In the same statement, where does `y` come from?', a: 'From memory (RAM or cache): it is loaded into a register before the add.' },
  };

  H['l4-how-instr'] = {
    asks: 'Who or what decides which machine instructions a statement like `x = y + 2 * z;` becomes?',
    idea: 'Nothing magic: it is another program. A compiler or interpreter reads your high-level code and produces the lower-level instructions for it.',
    steps: [
      'The translator follows the language’s rules: lexical analysis, syntax analysis, then code generation.',
      'Code generation is where the instructions are chosen: load, shift, add, store.',
      'It is written for one kind of processor, so the same statement can become different instructions on different machines.',
    ],
    answer: 'By the compiler or the interpreter: a program that runs to translate high-level code into lower-level code.',
    mistake: 'Saying "the processor" or "the operating system". The processor only runs instructions; a translator program produced them.',
    tryIt: { q: 'The same C file is compiled for a laptop and for a phone with a different processor. Do they get the same machine instructions?', a: 'No. Each compiler targets its own processor, so the instructions differ, though both do the same work.' },
  };

  // ---- tokens on her slide ----------------------------------------------------------------
  H['l4-token-i'] = {
    asks: 'In `for (int i = 0; i < 10; i++){`, what category (token) does the lexeme `i` belong to?',
    idea: '`i` is a name the programmer made up for a variable. Every programmer-chosen name is an identifier, wherever it appears.',
    steps: [
      'It is not a reserved word (like `for` or `int`), not an operator, and not a number written in the code.',
      'It names a variable, so its token is identifier. That holds for all three `i`s in the line.',
      { text: 'The full line (her slide’s table labels the second `i` int_literal, which is a slip):', table: { head: ['lexeme', 'token'], rows: [
        ['`for`', 'for_resWord'], ['`(`', 'openPar'], ['`int`', 'int_resWord'], ['`i`', 'identifier'], ['`=`', 'assign_Op'], ['`0`', 'int_literal'],
        ['`;`', 'semicolon'], ['`i`', 'identifier'], ['`<`', 'lt_Op'], ['`10`', 'int_literal'], ['`;`', 'semicolon'], ['`i`', 'identifier'],
        ['`++`', 'plusPlus_Op'], ['`)`', 'closePar'], ['`{`', 'openCur']] } },
    ],
    answer: 'identifier',
    mistake: 'Copying the slip on the slide. A lexeme’s token depends on what it is, not where it sits, so every `i` is an identifier.',
    tryIt: { q: 'In `for (int j = n; j > 0; j--)`, what are the tokens of `n` and of `--`?', a: '`n` is an identifier (a programmer’s name); `--` is the decrement operator (in her style, something like minusMinus_Op).' },
  };

  H['l4-token-10'] = {
    asks: 'In `for (int i = 0; i < 10; i++){`, what token is the lexeme `10`?',
    idea: 'A number typed straight into the code is a literal: its value is literally what is written. Its token says what kind of literal it is.',
    steps: [
      '`10` is not a name and not an operator; it is a value written directly in the source.',
      'It is a whole number, so it is an integer literal. Her slide names that token `int_literal`.',
      'The `0` in `i = 0` gets the same token.',
    ],
    answer: '`int_literal` (an integer literal).',
    mistake: 'Calling it an identifier or a variable. Nothing is being named; `10` just is the value 10.',
    tryIt: { q: 'In `double r = 2.5;`, what token is `2.5`?', a: 'A floating-point literal (something like float_literal): a value written directly in the code, with a decimal point.' },
  };

  // ---- slide 12 sample grammar -------------------------------------------------------------
  H['l4-sample-derive-write'] = {
    asks: 'Starting from `<program>`, replace one nonterminal at a time (always the leftmost one) until you have exactly `c = c + 2 * a`.',
    idea: 'A leftmost derivation fills the sentence in from left to right. At each step, look at the leftmost nonterminal and pick the one rule that makes it match the next part of the sentence.',
    steps: [
      'One statement, so `<stmts> ⇒ <stmt>`, then `<stmt> ⇒ <var> = <expr>`, and `<var> ⇒ c`.',
      'The `<expr>` must make `c + 2 * a`. The first operator is `+`, so use `<expr> → <term> + <expr>`, with `<term>` making `c`.',
      'The inner `<expr>` must make `2 * a`, so use `<expr> → <term> * <expr>`: `<term> ⇒ <num> ⇒ 2`, and the last `<expr> ⇒ <term> ⇒ <var> ⇒ a`.',
      { text: 'Every step (always the leftmost nonterminal):', table: { head: ['sentential form', 'rule used'], rows: [
        ['`<stmts>`', '`<program> → <stmts>`'], ['`<stmt>`', '`<stmts> → <stmt>`'], ['`<var> = <expr>`', '`<stmt> → <var> = <expr>`'],
        ['`c = <expr>`', '`<var> → c`'], ['`c = <term> + <expr>`', '`<expr> → <term> + <expr>`'], ['`c = <var> + <expr>`', '`<term> → <var>`'],
        ['`c = c + <expr>`', '`<var> → c`'], ['`c = c + <term> * <expr>`', '`<expr> → <term> * <expr>`'], ['`c = c + <num> * <expr>`', '`<term> → <num>`'],
        ['`c = c + 2 * <expr>`', '`<num> → 2`'], ['`c = c + 2 * <term>`', '`<expr> → <term>`'], ['`c = c + 2 * <var>`', '`<term> → <var>`'],
        ['`c = c + 2 * a`', '`<var> → a`']] } },
    ],
    ptree: { tree: ccTree(), caption: 'The same derivation as a tree: each parent with its children is one row of the table.' },
    answer: '`<program>` ⇒ `<stmts>` ⇒ `<stmt>` ⇒ `<var> = <expr>` ⇒ `c = <expr>` ⇒ `c = <term> + <expr>` ⇒ `c = <var> + <expr>` ⇒ `c = c + <expr>` ⇒ `c = c + <term> * <expr>` ⇒ `c = c + <num> * <expr>` ⇒ `c = c + 2 * <expr>` ⇒ `c = c + 2 * <term>` ⇒ `c = c + 2 * <var>` ⇒ `c = c + 2 * a`',
    mistake: 'Skipping the "boring" steps such as `<term> ⇒ <var>`, or jumping from `<expr>` straight to `c`. Each ⇒ applies exactly one rule.',
    tryIt: { q: 'Same grammar: leftmost derivation of `d = a * 1`.', a: '`<program>` ⇒ `<stmts>` ⇒ `<stmt>` ⇒ `<var> = <expr>` ⇒ `d = <expr>` ⇒ `d = <term> * <expr>` ⇒ `d = <var> * <expr>` ⇒ `d = a * <expr>` ⇒ `d = a * <term>` ⇒ `d = a * <num>` ⇒ `d = a * 1`' },
  };

  H['l4-derive-two'] = {
    asks: 'Write the leftmost derivation of a program with two statements, `a = b ; c = 1`, using her sample grammar.',
    idea: 'The recursive rule `<stmts> → <stmt> ; <stmts>` is how the grammar allows more than one statement: one `<stmt>`, a semicolon, then "the rest". Leftmost means you finish the whole first statement before touching the rest.',
    steps: [
      'Two statements, so the first `<stmts>` uses `<stmt> ; <stmts>`.',
      'Leftmost: work only on the first `<stmt>` until it is fully `a = b`.',
      'Then the remaining `<stmts>` has one statement left, so it uses `<stmts> → <stmt>`.',
      { text: 'Every step:', table: { head: ['sentential form', 'rule used'], rows: [
        ['`<stmts>`', '`<program> → <stmts>`'], ['`<stmt> ; <stmts>`', '`<stmts> → <stmt> ; <stmts>`'], ['`<var> = <expr> ; <stmts>`', '`<stmt> → <var> = <expr>`'],
        ['`a = <expr> ; <stmts>`', '`<var> → a`'], ['`a = <term> ; <stmts>`', '`<expr> → <term>`'], ['`a = <var> ; <stmts>`', '`<term> → <var>`'],
        ['`a = b ; <stmts>`', '`<var> → b`'], ['`a = b ; <stmt>`', '`<stmts> → <stmt>`'], ['`a = b ; <var> = <expr>`', '`<stmt> → <var> = <expr>`'],
        ['`a = b ; c = <expr>`', '`<var> → c`'], ['`a = b ; c = <term>`', '`<expr> → <term>`'], ['`a = b ; c = <num>`', '`<term> → <num>`'],
        ['`a = b ; c = 1`', '`<num> → 1`']] } },
    ],
    ptree: { tree: node('<program>', node('<stmts>', node('<stmt>', sVar('a'), leaf('='), node('<expr>', sTermV('b'))), leaf(';'),
      node('<stmts>', node('<stmt>', sVar('c'), leaf('='), node('<expr>', sTermN('1')))))), caption: 'The second statement hangs off the recursive <stmts> on the right.' },
    answer: '`<program>` ⇒ `<stmts>` ⇒ `<stmt> ; <stmts>` ⇒ `<var> = <expr> ; <stmts>` ⇒ `a = <expr> ; <stmts>` ⇒ `a = <term> ; <stmts>` ⇒ `a = <var> ; <stmts>` ⇒ `a = b ; <stmts>` ⇒ `a = b ; <stmt>` ⇒ `a = b ; <var> = <expr>` ⇒ `a = b ; c = <expr>` ⇒ `a = b ; c = <term>` ⇒ `a = b ; c = <num>` ⇒ `a = b ; c = 1`',
    mistake: 'Expanding the second `<stmts>` before the first statement is finished. In a leftmost derivation you always work on the leftmost nonterminal.',
    tryIt: { q: 'How do the first steps change for three statements, `a = b ; c = 1 ; d = 2`?', a: '`<stmts>` ⇒ `<stmt> ; <stmts>`, and after the first statement is done, that `<stmts>` ⇒ `<stmt> ; <stmts>` again; only the last one uses `<stmts> → <stmt>`.' },
  };

  H['l4-cannot-a4'] = {
    asks: 'Is `a = 4` a sentence of her sample grammar? Decide by asking where the 4 could come from.',
    idea: 'To show something cannot be derived, follow the piece that is missing. Find every rule that could produce it; if none can, there is no derivation.',
    steps: [
      '`a = …` is fine: `<stmt> → <var> = <expr>` and `<var> → a`.',
      'The right side is an `<expr>`. With no `+` or `*`, the only choice is `<expr> → <term>`, and `<term>` must become `<var>` or `<num>`.',
      { text: 'What those can produce:', table: { head: ['nonterminal', 'can produce'], rows: [['`<var>`', 'a, b, c, d'], ['`<num>`', '1, 2, 3']] } },
      'The terminal 4 appears in no rule at all, so no derivation can ever produce it.',
    ],
    ptree: { tree: node('<program>', node('<stmts>', node('<stmt>', sVar('a'), leaf('='), node('<expr>', sTermN('3'))))), caption: 'The closest legal sentence, a = 3: the leaf under <num> can only be 1, 2 or 3.' },
    answer: 'No. The 4 would have to come from `<term>`, so from `<var>` or `<num>`. `<var>` only gives a, b, c, d and `<num>` only gives 1, 2, 3, so the terminal 4 appears in no rule.',
    mistake: 'Answering "no" without the reason. The marks are for naming the rules that could produce the 4 and showing that none of them do.',
    tryIt: { q: 'Same grammar: can `a = b ;` (with a semicolon at the end) be derived?', code: '<stmts> → <stmt> | <stmt> ; <stmts>', a: 'No. The only rule with `;` is `<stmts> → <stmt> ; <stmts>`, which needs another statement after the semicolon.' },
  };

  H['l4-parse-tree'] = {
    asks: 'Draw the parse tree for `c = c + 2 * a`: the start symbol at the root, each rule as a parent with its children, and the sentence along the leaves.',
    idea: 'A parse tree is the derivation drawn as a picture. Every parent with its children is one rule from the grammar, and reading the leaves left to right gives back the sentence.',
    steps: [
      'Root `<program>` → `<stmts>` → `<stmt>` (one statement) → `<var> = <expr>`, and `<var>` → c.',
      'The `<expr>` uses `<term> + <expr>`: the left `<term>` → `<var>` → c.',
      'The right `<expr>` uses `<term> * <expr>`: `<term>` → `<num>` → 2, and the last `<expr>` → `<term>` → `<var>` → a.',
      'Check: every parent with its children matches a rule, and the leaves read c = c + 2 * a.',
      'The `*` sits deeper than the `+`, so it is done first. But that is only because `*` comes later in the sentence: this grammar always puts the right-most operator deepest. Compare `a * b + c`, where the `+` ends up deeper.',
    ],
    ptree: [
      { tree: ccTree(), caption: 'c = c + 2 * a. Leaves left to right give the sentence.' },
      { tree: abcExpr(), caption: 'Just the <expr> of a * b + c: now + is deeper, so it is done first.' },
    ],
    answer: '`<program>` → `<stmts>` → `<stmt>` → `<var>` (c), `=`, `<expr>`; that `<expr>` → `<term>` (→ `<var>` → c), `+`, `<expr>`; that `<expr>` → `<term>` (→ `<num>` → 2), `*`, `<expr>` → `<term>` → `<var>` → a.',
    mistake: 'Putting the leaves directly under `<expr>` or `<term>` and skipping `<var>` and `<num>`. Every rule step is its own level.',
    tryIt: { q: 'Describe the parse tree of `d = 1 * b`.', a: '`<program>` → `<stmts>` → `<stmt>` → `<var>` (→ d), `=`, `<expr>`; `<expr>` → `<term>` (→ `<num>` → 1), `*`, `<expr>` → `<term>` → `<var>` → b.' },
  };

  H['l4-sample-prec'] = {
    asks: 'Her sample grammar decides the grouping of `a * b + c`, not your math habits. Which part is done first? Show it with brackets.',
    idea: 'In a parse tree, deeper means done first. This grammar only lets an operator have a single `<term>` on its left, and everything to its right becomes one `<expr>`. So whatever comes after an operator is grouped together first.',
    steps: [
      'The top `<expr>` has to choose a rule. `<term> + <expr>` would need `a * b` to be a single `<term>`, but a `<term>` is only one variable or number. So it must be `<term> * <expr>`.',
      'That makes `a` the `<term>` and `b + c` the inner `<expr>`, one level deeper.',
      'Deeper is done first: `b + c` is worked out, then multiplied by `a`.',
      'With a = 2, b = 3, c = 4 the grammar gives 2 × (3 + 4) = 14, while ordinary math precedence would give 2 × 3 + 4 = 10.',
    ],
    ptree: { tree: abcExpr(), caption: 'b + c sits inside the lower <expr>, so it is done before the *.' },
    answer: '`a * (b + c)`: the only derivation is `<expr> ⇒ <term> * <expr>`, so `b + c` is one `<expr>` lower in the tree and is done first. This grammar gives `+` and `*` equal precedence.',
    mistake: 'Answering `(a * b) + c` from math class. The question is what this grammar does, and this grammar groups everything after an operator first.',
    tryIt: { q: 'Same grammar: how is `a + b * c + d` grouped?', a: '`a + (b * (c + d))`: each operator takes everything to its right as one deeper `<expr>`.' },
  };

  // ---- ambiguity, precedence, associativity -------------------------------------------------
  const ambOp = (x, op, y) => node('<expr>', x, node('<op>', leaf(op)), y);
  const oc = n => node('<expr>', node('<const>', leaf(n)));
  H['l4-ambiguous'] = {
    asks: 'Say what makes a grammar ambiguous.',
    idea: 'The compiler gets a program’s meaning from its parse tree: deeper parts are done first. If one sentence can have two different trees, it has two possible meanings, and the compiler has no way to know which one you meant.',
    steps: [
      'A grammar is ambiguous if some sentence (program) has two or more distinct parse trees.',
      'Her grammar: `<expr> → <expr> <op> <expr> | <const>`, with `<op> → / | -`. Nothing says which `<expr>` should hold the other operator.',
      'Take `8 - 4 - 2`. One tree does the left `-` first: (8 - 4) - 2 = 2. The other does the right `-` first: 8 - (4 - 2) = 6.',
      'Code generation walks the tree, so two trees mean two different programs. The fix is to rewrite the grammar so only one tree is possible.',
    ],
    ptree: [
      { tree: ambOp(ambOp(oc('8'), '-', oc('4')), '-', oc('2')), caption: '(8 - 4) - 2 = 2: the left - is deeper.' },
      { tree: ambOp(oc('8'), '-', ambOp(oc('4'), '-', oc('2'))), caption: '8 - (4 - 2) = 6: the right - is deeper.' },
    ],
    answer: 'One sentence has two or more distinct parse trees. Since the compiler takes meaning from the tree, the meaning is then not determined.',
    mistake: 'Saying "ambiguous means it has two derivations". Every sentence can have several derivations (leftmost, rightmost); what matters is two distinct parse trees.',
    tryIt: { q: 'Is her sample grammar ambiguous for `c = c + 2 * a`?', a: 'No. At each step only one rule fits (a `<term>` is a single variable or number), so there is exactly one parse tree.' },
  };

  const s16c = n => node('<const>', leaf(n));
  H['l4-precedence-level'] = {
    asks: 'To make one operator bind tighter (be done first), where in the grammar do you put it?',
    idea: 'Deeper in the tree means done first. So the operator that should be done first goes in a rule further from the start symbol. Then the tree can only ever put it lower down.',
    steps: [
      'Her unambiguous grammar: `<expr> → <expr> - <term> | <term>` and `<term> → <term> / <const> | <const>`.',
      '`<expr>` is the only rule that makes `-`; `/` only comes from `<term>`, which is always under an `<expr>`. So `/` always ends up below `-`.',
      'For `3 - 10 / 5`: the `-` is at the top, and `10 / 5` is inside the `<term>` beneath it. So 10 / 5 = 2 first, then 3 - 2 = 1.',
      'It does not matter where the `/` is written. In `10 / 5 - 3`, the `/` is still deeper: 2 - 3 = -1.',
    ],
    ptree: [
      { tree: node('<expr>', node('<expr>', node('<term>', s16c('3'))), leaf('-'), node('<term>', node('<term>', s16c('10')), leaf('/'), s16c('5'))), caption: '3 - 10 / 5 = 1: / is at the lower level.' },
      { tree: node('<expr>', node('<expr>', node('<term>', node('<term>', s16c('10')), leaf('/'), s16c('5'))), leaf('-'), node('<term>', s16c('3'))), caption: '10 / 5 - 3 = -1: / is still lower.' },
    ],
    answer: 'At a lower level of the grammar (deeper in the parse tree), so it is applied first.',
    mistake: 'Putting the higher-precedence operator at the top rule because it is "more important". Top of the tree means done last.',
    tryIt: { q: 'Swap the operators. What is `3 - 10 / 5` under this grammar?', code: '<expr> → <expr> / <term> | <term>\n<term> → <term> - <const> | <const>', a: 'Now `-` is lower, so it is done first: (3 - 10) / 5 = -1.4.' },
  };

  H['l4-assoc'] = {
    asks: 'With `<expr> → <expr> / <const> | <const>`, `60 / 12 / 4` has only one parse tree. Which division happens first, and what is the value?',
    idea: 'The right operand of every `/` must be a single `<const>`. So the right-hand `12 / 4` can never be grouped; the tree can only grow down the left side.',
    steps: [
      'The top `/` must have a plain `<const>` on its right: that is the 4.',
      'Its left `<expr>` holds `60 / 12`, which is deeper, so it is done first.',
      '60 / 12 = 5, then 5 / 4 = 1.25.',
      'Recursion on the left (the `<expr>` is on the left of `/`) gives left associativity: equal operators are done left to right.',
    ],
    ptree: { tree: leftDiv(), caption: 'The tree can only grow on the left: (60 / 12) / 4.' },
    answer: '1.25, from (60 / 12) / 4 = 5 / 4.',
    mistake: 'Giving 20 by doing 12 / 4 first. That grouping needs an `<expr>` on the right of `/`, and this grammar does not allow one.',
    tryIt: { q: 'Same grammar: what is `100 / 10 / 5`?', a: '(100 / 10) / 5 = 10 / 5 = 2.' },
  };

  H['l4-assoc-ambig'] = {
    asks: 'With the ambiguous `<expr> → <expr> / <expr> | <const>`, `60 / 12 / 4` can be grouped two ways. What are the two values?',
    idea: 'This rule lets either side of a `/` be a whole `<expr>`, so either division can sit deeper. Two trees, two orders, two answers. Precedence was about two different operators; this is the same operator twice, which is associativity.',
    steps: [
      'Tree 1: the top `/` has `60 / 12` on its left. (60 / 12) / 4 = 5 / 4 = 1.25.',
      'Tree 2: the top `/` has `12 / 4` on its right. 60 / (12 / 4) = 60 / 3 = 20.',
      'Division is not associative, so the grouping changes the answer. The grammar has to pin it down.',
    ],
    ptree: [
      { tree: ambDivL(), caption: '(60 / 12) / 4 = 1.25' },
      { tree: ambDivR(), caption: '60 / (12 / 4) = 20' },
    ],
    answer: '1.25 and 20: (60 / 12) / 4 = 1.25 and 60 / (12 / 4) = 20.',
    mistake: 'Giving only 1.25 because you read left to right out of habit. The ambiguous grammar allows both trees.',
    tryIt: { q: 'Same grammar: what two values can `64 / 8 / 2` have?', a: '(64 / 8) / 2 = 4 and 64 / (8 / 2) = 16.' },
  };

  H['l4-ebnf'] = {
    asks: 'Say what { }* means in the C grammar’s EBNF.',
    idea: 'EBNF is BNF with shorthand for repetition, so you do not need a recursive rule every time you want a list. The marks mean the same as in regular expressions.',
    steps: [
      { text: 'The three marks:', table: { head: ['mark', 'how many times', 'example'], rows: [
        ['`{ X }+`', 'one or more', '`<number> → {<digit>}+`'],
        ['`{ X }*`', 'zero or more', '`<block> → begin {<stmt>}* end`'],
        ['`{ X }?`', 'zero or one (optional)', '`<if> → if ( <expr> ) <stmt> {else <stmt>}?`']] } },
      { text: 'Plain BNF says "one or more digits" with recursion; EBNF says it in one rule:', code: 'BNF:   <number> → <digit> | <digit> <number>\nEBNF:  <number> → {<digit>}+' },
      'Heads up: the textbook writes the same ideas with different brackets (`[ ]` for optional, `{ }` for zero or more). For her course, use the `+`, `*`, `?` marks.',
    ],
    answer: '{ }* zero or more. (And { }+ one or more; { }? zero or one.)',
    mistake: 'Mixing up `+` and `*`. `*` allows zero (none at all); `+` needs at least one.',
    tryIt: { q: 'Given `<list> → <item> {, <item>}*`, which are lists: `x`, `x, y, z`, an empty string, `x,`?', a: '`x` and `x, y, z` only. Empty fails (at least one `<item>` is required), and `x,` fails (each comma must be followed by an item).' },
  };

  H['l4-production'] = {
    asks: 'Name what a BNF rule is called.',
    idea: 'A rule says "this one abstract thing can be made of these pieces". So the left side is exactly one name, and the right side is the pieces, which can be actual symbols (terminals) or more names (nonterminals).',
    steps: [
      'A rule is called a production, written LHS → RHS.',
      { text: 'Take apart `<stmt> → <var> = <expr>`:', table: { head: ['part', 'here', 'what it is'], rows: [
        ['LHS', '`<stmt>`', 'exactly one nonterminal, in < > brackets'],
        ['RHS', '`<var> = <expr>`', 'a string of terminals (`=`) and nonterminals (`<var>`, `<expr>`)']] } },
      '`|` separates alternative right-hand sides: `<var> → a | b | c | d` is four choices for one LHS.',
      'Why one nonterminal on the left: each derivation step replaces one nonterminal using a rule whose LHS is that nonterminal.',
    ],
    answer: 'A production, LHS → RHS: one nonterminal on the left; terminals and/or nonterminals on the right; | separates alternatives.',
    mistake: 'Putting terminals, or two nonterminals, on the left. Only one nonterminal ever goes there.',
    tryIt: { q: 'Which are legal BNF rules? (a) `<digit> → 0 | 1`, (b) `<a> <b> → x`, (c) `x → <var>`', a: 'Only (a). (b) has two nonterminals on the left, and (c) has a terminal on the left.' },
  };

  H['l4-left-assoc'] = {
    asks: 'Rewrite the ambiguous rule so that / groups from the left.',
    idea: 'Ambiguity came from both sides of `/` being allowed to grow. Take away the growth on the right: make the right operand a plain `<const>`. Then the tree can only grow down the left, and the leftmost `/` ends up deepest.',
    steps: [
      'Replace the right `<expr>` with `<const>`: `<expr> → <expr> / <const> | <const>`.',
      'Now the right side of every `/` is a single number, so `12 / 4` can never be grouped together.',
      'In `60 / 12 / 4` the only tree puts `60 / 12` deepest: (60 / 12) / 4 = 1.25.',
      'Her slide’s phrase: "don’t allow as much recursion" on the right. Recursion on the right instead, `<expr> → <const> / <expr>`, would make `/` right-associative.',
    ],
    ptree: [
      { tree: leftDiv(), caption: 'Left recursion, <expr> → <expr> / <const>: (60 / 12) / 4 = 1.25.' },
      { tree: node('<expr>', cst('60'), leaf('/'), node('<expr>', cst('12'), leaf('/'), node('<expr>', cst('4')))), caption: 'If you put the recursion on the right instead, <expr> → <const> / <expr>: 60 / (12 / 4) = 20.' },
    ],
    answer: '<expr> → <expr> / <const> | <const>. Recursion is only on the left, so the leftmost / is deepest and done first.',
    mistake: 'Writing `<expr> → <const> / <expr> | <const>`. That is unambiguous too, but it groups right to left.',
    tryIt: { q: 'Most languages make power `^` right-associative: 2 ^ 3 ^ 2 = 2 ^ (3 ^ 2). Write an unambiguous rule over `<const>` that does that.', a: '`<expr> → <const> ^ <expr> | <const>`: recursion on the right puts the rightmost `^` deepest.' },
  };

  H['l4-show-ambig'] = {
    asks: 'Prove `<S> → <S> + <S> | a` is ambiguous by finding two different parse trees for `a + a + a`.',
    idea: 'One sentence, two trees: that is the definition of ambiguous. The two `+` signs can be grouped either way, because either side of a `+` is allowed to be another `<S> + <S>`.',
    steps: [
      'Both trees start with `<S> → <S> + <S>`. The question is which `<S>` holds the second `+`.',
      'Tree 1: the LEFT `<S>` expands again, giving (a + a) + a.',
      'Tree 2: the RIGHT `<S>` expands again, giving a + (a + a).',
      { text: 'The same thing as two different leftmost derivations:', table: { head: ['tree 1: (a + a) + a', 'tree 2: a + (a + a)'], rows: [
        ['`<S> + <S>`', '`<S> + <S>`'], ['`<S> + <S> + <S>`', '`a + <S>`'], ['`a + <S> + <S>`', '`a + <S> + <S>`'],
        ['`a + a + <S>`', '`a + a + <S>`'], ['`a + a + a`', '`a + a + a`']] } },
      'Two distinct trees for one sentence, so the grammar is ambiguous.',
    ],
    ptree: [
      { tree: sLeft(), caption: 'Tree 1: (a + a) + a. The left <S> expanded again.' },
      { tree: sRight(), caption: 'Tree 2: a + (a + a). The right <S> expanded again.' },
    ],
    answer: 'Two distinct parse trees for one sentence: in one, the LEFT `<S>` of `<S> + <S>` expands again, grouping (a + a) + a; in the other, the RIGHT `<S>` does, grouping a + (a + a). Two trees (equivalently, two leftmost derivations), so the grammar is ambiguous.',
    mistake: 'Showing a leftmost and a rightmost derivation and calling it done. Every sentence has both; you need two different trees (or two different leftmost derivations).',
    tryIt: { q: 'Show `<E> → <E> - <E> | 1` is ambiguous, and give the two values of `1 - 1 - 1`.', a: 'Two trees: (1 - 1) - 1 = -1 (the left `<E>` expands again) and 1 - (1 - 1) = 1 (the right one does). Two trees, so ambiguous.' },
  };

  H['l4-rewrite-left'] = {
    asks: 'Rewrite `<S> → <S> + <S> | a` so that it describes the same sentences but each one has only one tree, grouped left to right.',
    idea: 'The ambiguity comes from both sides of `+` being allowed to grow. Let only the left side grow: make the right side a plain `a`. The tree can then only grow down the left, which is left associativity.',
    steps: [
      'Keep `<S>` on the left of `+` (left recursion), and replace the right `<S>` with `a`: `<S> → <S> + a | a`.',
      'Same sentences as before: a, a + a, a + a + a, and so on.',
      'Now every `+` has a single `a` on its right, so `a + (a + a)` cannot be built. Only (a + a) + a is left.',
    ],
    ptree: [
      { tree: node('<S>', node('<S>', node('<S>', leaf('a')), leaf('+'), leaf('a')), leaf('+'), leaf('a')), caption: 'New grammar: the only tree of a + a + a, (a + a) + a.' },
      { tree: sRight(), caption: 'Old grammar only: a + (a + a). The new grammar cannot build this, since the right of + must be a plain a.' },
    ],
    answer: '`<S> → <S> + a | a`. The recursion is only on the left of `+`, so a + a + a can only group as (a + a) + a.',
    mistake: 'Writing `<S> → a + <S> | a`. It is unambiguous, but it groups right to left.',
    tryIt: { q: 'Rewrite the same grammar so that `+` is right-associative instead.', a: '`<S> → a + <S> | a`: the recursion is on the right, so a + a + a groups as a + (a + a).' },
  };

  H['l4-write-prec'] = {
    asks: 'Build a grammar for `a`/`b` expressions with `+` and `*` that has one tree per sentence, does `*` before `+`, and groups each left to right.',
    idea: 'Two ideas stacked. Precedence: one level of the grammar per operator, with the tighter operator lower down. Associativity: make each level left-recursive.',
    steps: [
      'Top level, the operator done last: `<expr> → <expr> + <term> | <term>`.',
      'One level lower, the operator done first: `<term> → <term> * <factor> | <factor>`.',
      'Bottom, the operands: `<factor> → a | b`.',
      'Each level is left-recursive (the nonterminal itself is on the left of its operator), so `a + b + a` groups as (a + b) + a.',
      { text: 'The whole grammar (same shape as her `-` and `/` grammar):', code: '<expr>   → <expr> + <term> | <term>\n<term>   → <term> * <factor> | <factor>\n<factor> → a | b' },
    ],
    ptree: { tree: node('<expr>', node('<expr>', node('<expr>', node('<term>', node('<factor>', leaf('a')))), leaf('+'), node('<term>', node('<term>', node('<factor>', leaf('b'))), leaf('*'), node('<factor>', leaf('b')))), leaf('+'), node('<term>', node('<factor>', leaf('a')))),
      caption: 'a + b * b + a: the * is deepest (done first), and the left + is below the right one.' },
    answer: '`<expr> → <expr> + <term> | <term>`; `<term> → <term> * <factor> | <factor>`; `<factor> → a | b`.',
    mistake: 'Putting `*` at the top level because it "matters more". The top is done last, so the tighter operator goes lower.',
    tryIt: { q: 'Extend this grammar with `-` (same level as `+`) and `/` (same level as `*`), still left-associative.', code: '<expr>   → <expr> + <term> | <term>\n<term>   → <term> * <factor> | <factor>\n<factor> → a | b', a: '`<expr> → <expr> + <term> | <expr> - <term> | <term>`; `<term> → <term> * <factor> | <term> / <factor> | <factor>`; `<factor> → a | b`.' },
  };

  // ---- writing BNF ---------------------------------------------------------------------------
  const d = (nt, v) => node(nt, leaf(v));
  H['l4-write-time24'] = {
    asks: 'Write BNF that accepts exactly the 24-hour times 00:00 to 23:59, always two digits on each side of the colon.',
    idea: 'Same trick as the GPA grammar: split the time into pieces and limit each digit. The awkward edge is the hours: after a 0 or 1 any digit is fine, but after a 2 only 0 to 3.',
    steps: [
      'Overall shape: `<time> → <hour> : <min>`.',
      'Hours 00 to 19: first digit 0 or 1, then any digit: `<d01> <digit>`.',
      'Hours 20 to 23 get their own alternative: `2 <d03>`. This keeps 24 to 29 out.',
      'Minutes 00 to 59: first digit 0 to 5, then any digit: `<d05> <digit>`.',
      { text: 'The grammar:', code: '<time>  → <hour> : <min>\n<hour>  → <d01> <digit> | 2 <d03>\n<d01>   → 0 | 1\n<d03>   → 0 | 1 | 2 | 3\n<min>   → <d05> <digit>\n<d05>   → 0 | 1 | 2 | 3 | 4 | 5\n<digit> → 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9' },
      'Check: 20 + 4 = 24 hours and 6 × 10 = 60 minutes, so 1440 times, exactly a day.',
    ],
    ptree: [
      { tree: node('<time>', node('<hour>', d('<d01>', '0'), d('<digit>', '9')), leaf(':'), node('<min>', d('<d05>', '3'), d('<digit>', '0'))), caption: '09:30 uses <hour> → <d01> <digit>.' },
      { tree: node('<time>', node('<hour>', leaf('2'), d('<d03>', '3')), leaf(':'), node('<min>', d('<d05>', '5'), d('<digit>', '9'))), caption: '23:59 uses the edge case <hour> → 2 <d03>.' },
    ],
    answer: '`<time> → <hour> : <min>`; `<hour> → <d01> <digit> | 2 <d03>`; `<d01> → 0 | 1`; `<d03> → 0 | 1 | 2 | 3`; `<min> → <d05> <digit>`; `<d05> → 0 | … | 5`; `<digit> → 0 | … | 9`.',
    mistake: 'Writing `<hour> → <d02> <digit>` with a first digit of 0 to 2. That lets in 24 to 29.',
    tryIt: { q: 'Write BNF for 12-hour times 1:00 to 12:59 (no leading zero on the hour).', a: '`<time> → <hour> : <min>`; `<hour> → <d19> | 1 <d02>`; `<d19> → 1 | … | 9`; `<d02> → 0 | 1 | 2`; `<min> → <d05> <digit>`, with `<d05>` and `<digit>` as before.' },
  };

  H['l4-write-binary'] = {
    asks: 'Write BNF for binary numbers like 0, 1, 10, 1011, but not ones with leading zeros such as 0101.',
    idea: 'A leading zero only happens if a number starts with 0 and keeps going. So: 0 is allowed by itself, and every longer number must start with 1. After that 1, any bits at all.',
    steps: [
      'The single digit 0 is its own alternative: `<bin> → 0`.',
      'Everything else starts with 1: `<bin> → 1` or `1 <rest>`.',
      'BNF has no "…", so "any number of bits" is written with recursion: `<rest> → <bit> | <bit> <rest>`.',
      { text: 'The grammar:', code: '<bin>  → 0 | 1 | 1 <rest>\n<rest> → <bit> | <bit> <rest>\n<bit>  → 0 | 1' },
      'Check 0101: it starts with 0, and the only rule with a leading 0 is `<bin> → 0`, which ends right there. So it cannot be derived.',
    ],
    ptree: [
      { tree: node('<bin>', leaf('1'), node('<rest>', d('<bit>', '0'), node('<rest>', d('<bit>', '1'), node('<rest>', d('<bit>', '1'))))), caption: '1011: one 1, then <rest> recurses for each bit.' },
      { tree: node('<bin>', leaf('0')), caption: '0 on its own.' },
    ],
    answer: '`<bin> → 0 | 1 | 1 <rest>`; `<rest> → <bit> | <bit> <rest>`; `<bit> → 0 | 1`.',
    mistake: 'Writing `<bin> → <bit> | <bit> <bin>`. That accepts any string of bits, leading zeros included.',
    tryIt: { q: 'Write BNF for EVEN binary numbers with no leading zeros (0, 10, 100, 110, …).', a: '`<even> → 0 | 1 <tail>`; `<tail> → 0 | <bit> <tail>`; `<bit> → 0 | 1`. A `<tail>` is any bits ending in 0.' },
  };
})(globalThis.FC = globalThis.FC || {});
