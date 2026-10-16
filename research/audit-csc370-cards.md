# Audit: AUCSC 370 deck, card by card (2026-10-16)

**Status: REPORT ONLY. No deck file was changed.** Every fix below is a proposal. Nothing in it is true of the deck until someone edits `decks/csc370*.js` and runs `node --test tests/`.

## Read this first

- **Coverage is the deck's biggest problem, more than card quality.** Her C exam (`~/Downloads/Exam 1 C Language SOLUTION 2026.pdf`) is worth 32 marks: 18 for memory/stack diagrams with pointers, 11 for writing a pointer-based C function, 3 for malloc/free. The deck has **0 pointer cards and 0 memory-diagram cards**.
- **History is about 35% of the deck (109 of 313 cards), but it was one 10-mark test.** That test asks for the big four, ENIAC, von Neumann and language-matching items. It never asks for line limits, name lengths, or who built the first Lisp compiler.
- **Every "argue" card and every trace card is copied from one of her past tests or slides.** The deck trains recall of one model answer, not the skill. Her next test will use new programs and new design questions.
- **The 4 order cards on derivations and compiler steps can be solved without the knowledge.** The derivation steps sort by how much of the string has been expanded. On the others, her test asks the student to produce the list, and an order card hands it over.
- **10 answers are wrong or need a caveat.** The worst are `blank:b4-14-1mg5y26` (wrong definition of an ambiguous grammar), `blank:b2-34-1rw1fxo` (contradicts two other cards), `blank:b2-25-g4eews` (an invented label) and `blank:b5.2-5-o2oefn` (wrong reason). Details are in the per-card tables.
- **What is already good:** all 21 trace and typed-output cards are machine-verified by `tests/` (gcc, python3, node, guile, ecl), and I hand-checked them too. No MC card has a longest-option cue (0 of 29). The test-matched recall cards (l1-html, l3-banana-java, l4-gpa-bnf, l51-case-arg, l52-kiwi-*) follow her answer keys closely.

## Method and proof

Cards were extracted exactly as the app builds them (184 blank questions + 129 authored cards = 313), then read one by one. They were checked against her answer keys (`~/Downloads/*SOLUTION*.pdf`), her student slides (lectures 1, 2, 4, 5.1, 5.2, 10) and Sebesta-level knowledge, using the rules in `research/01-03`.

```sh
cd /home/coke/flash-cards && node -e '
for (const f of ["csc370","csc370-blank-answers","csc370-blank-questions","csc370-topics"]) require("./decks/"+f+".js");
const d=FC.decks.csc370; console.log(FC.blankGroups.length + d.blanks.filter(b=>!new Set(FC.blankGroups.flatMap(g=>g.ids)).has(b.id)).length, d.cards.length)'
# expect: 184 129        verified: 2026-10-16
pdftotext -layout "/home/coke/Downloads/Exam 1 C Language SOLUTION 2026.pdf" - | grep -c "memory"   # expect 4: Q1, Q2, Q3 diagrams + Q4 malloc (verified 2026-10-16)
```

The research rules applied (with the file each comes from):

- Generation beats recognition, so prefer recall over MC or order (01 §1.3, 02 item 4).
- Higher-order "why/derive" items transfer and fact-detail cards do not (02 items 8, 20, 21).
- Tracing and Parsons problems help, but only when the order is not given away (03 items 1, 2).
- Use contrasting cases (03 item 6).

## Summary

| Problem (rubric #) | Cards flagged | What it usually looks like here |
|---|---|---|
| Clear cue (1) | 23 | The prompt is built around one missing slide word, or gives the answer away ("how much operator overloading should a *simple* language have?" → "minimal") |
| One right answer (2) | 5 | Typed exact match on names the slide made up (`int_literal`); 5 lines of case-sensitive output |
| Standalone (3) | 7 | "that code" / "that grammar" with no code on the card, while the app interleaves cards |
| Size: too big (4) | 10 | 3 to 5 separate facts on one card (`l10-cswitch`, `l2-cobol-goals`, `l2-lisp-origin`) |
| Size: too small (4) | 49 | One slide sentence split across 2 to 4 cards, one phrase each |
| Type fit (5) | 7 | Order cards that sort themselves; a 2-option MC; typed where recall is needed |
| Value (6) | 33 | History numbers, names and years; risky inferred answers |
| Accuracy (7) | 10 | See the "Read this first" list and the tables |
| Duplicates (8) | 34 | ENIAC ×4, von Neumann ×2, lexeme/token ×3, lifetime definition ×3, COBOL "English" ×4 |
| **Cards with at least one problem** | **138 of 313 (44%)** | 105 of 184 blank questions (57%); 33 of 129 authored cards (26%) |

By lecture (flagged / total): L1 18/34 · L2 61/115 · L3 1/3 · L4 15/37 · L5.1 9/33 · L5.2 29/67 · L10 5/24.

If every fix below is applied, about 68 cards go: 40 merged, 15 dropped and 13 suspended. About 8 are added by splits. That leaves roughly 250 cards, with history down to about 70.

**Overall verdict:** the authored cards (`l*`) are mostly sound and close to her answer keys. The blank questions are where quality drops. They are slide fragments turned into questions, so many are tiny, guessable, duplicated, or history trivia. The bigger risk is not a bad card but missing ones: the deck does not practise the work her tests mark most, which is memory diagrams, pointers, writing grammars and derivations, and arguing about designs or tracing programs it has not seen before.

## The 10 most important fixes

1. **Add C pointer and memory-diagram practice.** Her C exam gives 32 marks to this (0 cards now). See gap G1 below for example cards; their outputs were verified with gcc.
2. **Make the derivation and compiler-step cards generative.** Convert `l4-gpa-derive`, `l4-sample-derive`, `l4-compiler-steps` and `l4-xyz-order` to recall ("write the leftmost derivation", "list the three steps"). Or keep the derivations as order cards with 2 wrong distractor steps added, so they cannot be sorted by length.
3. **Fix the accuracy problems.** Rewrite `b4-14-1mg5y26` (ambiguity means two parse trees, not two derivations), `b2-34-1rw1fxo` (COBOL influenced little *except* records), `b2-13-rcmyge` (drop the lowercase guess), `b5.2-5-o2oefn` (recursion fails because there is one cell per variable). Drop `b2-25-g4eews` and `b5.2-22-oyg3tt`, which are invented answers. Add caveats to `l51-case`, `l51-maxlen`, `l52-java-final` and `b2-24-1ed7fqu`.
4. **Cut history trivia.** Suspend the 13 number/name/year cards (Fortran 0 name length, 400 lines, Russell 1959, Hart and Levin, Greenblatt, FGCS, 30 characters, …). Merge the WSUT-label cards into one order card. This frees about 40% of history review time for the topics her tests mark.
5. **Merge the fragmented slide-sentence blanks into one definition card each.** Simplicity, orthogonality, syntax design, type checking, exception handling, static lifetime, declaration rules, named constants: about 40 cards become about 15. One card per idea, answered in full, is what her short-answer questions need.
6. **Remove the 34 duplicates.** Keep the version worded like her test (e.g. `l2-eniac-how`, `l2-vonneumann`, `l4-lexeme-token`, `l4-ambiguous`).
7. **Make the 7 dependent cards standalone.** Add the code or grammar to `l3-banana-java`, `l52-block-java`, `l52-py-unbound`, `l52-sa-error`, `l10-loop-compare`, `l4-gpa-derive` and `l4-gpa-41`.
8. **Add transfer items next to every copied test item.** These are new argue prompts with a fixed rubric (G6), new static-vs-dynamic scope programs (G5) and new grammars (G2). Without them the cards reward memorizing one answer key.
9. **Split the oversized cards.** Split `l10-cswitch` into 3, `l2-cobol-goals`, `l4-where-x` and `l1-readwrite` the way her test splits them, and trim `l2-lisp-origin`, `l2-prolog-origin`, `l2-plankalkul` and `l2-algol-origin` to the part worth knowing.
10. **Fix answer matching on typed cards.** Add accepts to `l4-token-10` (literal, number, integer literal …) and `l4-token-i`. Ask `l52-py-trace` for the five printed values ("82 13 55 55 12") instead of five lines of exact, case-sensitive text.

## Coverage gaps against her tests

What she asks, and what the deck practises today:

| What her tests or slides ask | Source | Deck today |
|---|---|---|
| Draw a memory (stack) diagram and give the output; pointers, `arr + 1`, passing `&x` and reassigning `p` inside the function | C exam Q1–3 (18 marks); C pre-test Q1a (4 marks) | **0** |
| Write a C function using pointers only (reverseString) | C exam Q5 (11 marks) | **0** |
| "What two commands grab and release memory?" (malloc, free) | C exam Q4 | 1 blank, malloc only |
| Write a concise BNF grammar | Translation post-test Q4a | 1 (the GPA question itself, so the answer is memorized) |
| Show a derivation; show a string cannot be derived | Translation post-test Q4b,c | 2 order + 1 recall, all on the slide's examples |
| Show ambiguity (two parse trees); rewrite a grammar for precedence or associativity | Slides L4 14–18 | concept cards only; no drawing or rewriting |
| Split a statement into lexemes and tokens | Slide L4 8 | 2 typed cards (single lexemes) |
| How does the compiler know `=`, `+`, `x` are an operator, a variable …? | Translation pre-test Q2e | **0** |
| "Should a language allow X? Why or why not?" | Names pre/post tests | 4 cards, all verbatim from those tests; **0 new prompts**. Slide L10 28 ("Is the goto the problem, or the programmer?") has no card |
| Output under static vs dynamic scoping | Names post-test Q4; slide L5.2 24 | 4 typed cards on the same 2 programs |
| Which language? (matching) | History post-test Q3 | 5 MC; missing "oldest WSUT language" and "newest" |
| Why study programming languages (6 reasons); trade-off example 2 (three `for` spellings) | Slides L1 8–10, 18 | **0** |
| Hybrid implementation; full compiler phase diagram | Slides L4 2–5, 20–23 | 0; only the 3 main steps |
| Selector expressions (`?:`, ML `if`), why switch exists (speed), C# switch rules, iteration design issues, goto debate | Slides L10 13–14, 18, 22, 28 | **0** |
| Lectures 6–9 (and any Scheme/Prolog programming) | no slides in `~/Downloads` | not in deck. UNVERIFIED what they cover. Check: `ls ~/Downloads \| grep -iE "student\|control"` (verified 2026-10-16: only L1, L2, L4, L5.1, L5.2, L10) |

Suggested new card types, each with a worked example:

**G1. C pointer trace (typed, verify with gcc) and memory diagram (recall, self-graded).** The outputs below were verified 2026-10-16 by compiling and running them with gcc.
- `int a = 5; int *p = &a; *p += 3; int b = *p * 2; printf("%d %d", a, b);` → `8 16`
- `void swap(int *x, int *y){int t=*x; *x=*y; *y=t;}` called with `swap(&c,&d)` where c=1, d=2, then `printf("%d %d",c,d)` → `2 1`
- `void setTo(int *p){ int q = 7; p = &q; }` with `int x = 3; setTo(&x); printf("%d", x);` → `3` (same trap as her `money` question)
- `int arr[] = {4, 8, 15, 16}; int *q = arr + 2; printf("%d %d", *q, *(q-1) + 1);` → `15 9`
- Memory diagram card: same code. Prompt "Draw the stack after line N: name, value, and arrows for pointers." Model answer as a text table. Self-graded on her marking points (each variable, each value, each arrow).
- Write card: "Using pointers only, no indexing, write `int length(char *s)`." Self-grade against her reverseString rubric (signature, pointer variable, find the null, return the difference).

**G2. Write a grammar (recall).** Use new specs every time. Examples:
- 24-hour times 00:00–23:59: `<time> → <hour> : <min>`, `<hour> → <d01> <digit> | 2 <d03>`, `<d01> → 0 | 1`, `<d03> → 0 | 1 | 2 | 3`, `<min> → <d05> <digit>`, `<d05> → 0 | … | 5`, `<digit> → 0 | … | 9`.
- Binary numbers with no leading zeros: `<bin> → 0 | 1 | 1 <rest>`, `<rest> → <bit> | <bit> <rest>`, `<bit> → 0 | 1`.

**G3. Derive / cannot derive / parse tree (recall).** "Using the sample grammar, derive `a = b ; c = 1`." "Can `a = 4` be derived? Why not?" (No: `<num>` is only 1 | 2 | 3.) "Draw the parse tree of `c = c + 2 * a` as an indented outline."

**G4. Ambiguity and rewriting (recall).** "Show that `<S> → <S> + <S> | a` is ambiguous using `a + a + a`." (Two trees: `(a+a)+a` and `a+(a+a)`.) "Rewrite it so + is left-associative." (`<S> → <S> + a | a`.) "Write an unambiguous grammar for + and * over a, b, with * binding tighter." (`<expr> → <expr> + <term> | <term>`, `<term> → <term> * <factor> | <factor>`, `<factor> → a | b`.)

**G5. New scope traces (typed, two cards per program).** Example (Python-like):
```
x = 1
def a(): print(x)
def b():
    x = 2
    a()
def c():
    x = 3
    b()
c()
a()
```
Static: `1 1` (verified with python3). Dynamic: `2 1` (traced by hand: inside c→b→a the most recent x is b's). Add "What is sub2's static parent / what are its static ancestors?" items for nested definitions.

**G6. Argue a design choice (recall, fixed rubric).** Rubric for every prompt: takes a side · names a criterion (readability / writeability / reliability / cost) · gives a concrete code example · admits the trade-off. Prompts:
- Should a language have goto?
- Should switch fall through by default?
- Should `if` accept an int condition?
- Should scoping be dynamic?
- Should names have a maximum length?
- Reserved words or keywords?
- Should a language allow nested functions?
- Should assignment be an expression?

**G7. Classification drills (recall), contrasting cases.**
- "In C's `count = count + 5;` give the binding time of: the type of count (compile), its set of possible values (language implementation), the meaning of + (compile), the internal representation of 5 (language implementation), the value of count (run)." (Sebesta §5.4.)
- "Classify the storage of each: `int g;` at file scope (static); `static int s;` in f (static); `int t;` in f (stack-dynamic); `int *p = malloc(…)` (p stack-dynamic, *p explicit heap); a Python list (implicit heap)."

**G8. Interleaved "which language?" set (MC, her matching format).** Add "oldest WSUT language" (FORTRAN), "newest of FORTRAN/LISP/COBOL/Python" (Python) and "repetition only from recursion" (LISP / Prolog). Shuffle with the existing 5 MCs.

**G9. Tokenize a whole statement (recall).** `while (count >= 10) sum = sum + count;` → while: reserved word · `(`: open paren · count: identifier · `>=`: relational operator · 10: int literal · `)`: close paren · sum: identifier · `=`: assignment operator · sum: identifier · `+`: plus operator · count: identifier · `;`: semicolon. Pair it with Translation pre-test Q2e: "How does the compiler know x is a variable and = an operator?" (Language rules; the lexical analyzer reads left to right, extends an identifier until a character that is not a letter, digit or underscore, skips whitespace, and classifies each lexeme into a token.)

## Per-card findings (only cards with a problem)

Codes: CUE = unclear cue or answer given away · ANS = a correct answer would be marked wrong · STAND = not standalone · BIG = split · TINY = trivially small, merge · TYPE = wrong card type · VALUE = trivia or risky inferred answer · ACC = inaccurate · DUP = duplicate. "Suspend" means keep the card in the file but take it out of review. Table cells write `<` as `\<` so that BNF survives Markdown rendering.

### Lecture 1: intro, criteria, categories (18 flagged)

| id | type | problem(s) | concrete fix |
|---|---|---|---|
| `blank:b1-5-1s832o7` | blank/inferred | DUP | Overlaps l10-turing. Keep this one as the definition: Q “What three things does a language need to be Turing complete?” A “Ordered (sequential) instructions; memory that can be read and changed; a conditional jump (compare + goto), i.e. conditional repetition.” Then refocus l10-turing on the “but not structured” point (see its row). |
| `blank:b1-13-1lo5k3f` | blank/sebesta | TINY, CUE | Merge the three Simplicity blanks (this, b1-13-1vptfan, b1-13-yaafuc) into one card. Q “What three properties make a language simple?” A “A manageable (small) set of features and constructs; minimal feature multiplicity (few ways to do one thing, e.g. count++ vs count = count + 1); minimal operator overloading.” |
| `blank:b1-13-1vptfan` | blank/sebesta | TINY, CUE | The word “simple” in the prompt gives away “minimal”. Fold into the merged Simplicity card (row above). |
| `blank:b1-13-yaafuc` | blank/sebesta | TINY, CUE | Same as above: answer guessable from the prompt. Fold into the merged Simplicity card. |
| `blank:b1-13-1uiwubu` | blank/sebesta | TINY | Merge the three Orthogonality blanks (this, b1-13-1bb3vzn, b1-13-jzmera). Q “Define orthogonality (three parts).” A “A small set of primitive constructs that can be combined in a relatively small number of ways to build control and data structures; every possible combination is legal; few or no exceptions to the rules.” Add a follow-up: Q “Give an example of a non-orthogonal rule.” A “In C a function can return a struct but not an array.” (Sebesta.) |
| `blank:b1-13-1bb3vzn` | blank/sebesta | TINY, CUE | “Which combinations are legal?” → “every” is guessable. Fold into the merged Orthogonality card. |
| `blank:b1-13-jzmera` | blank/sebesta | TINY, CUE | “How many exceptions?” → “few or none” is guessable. Fold into the merged Orthogonality card. |
| `blank:b1-14-1frds5a` | blank/sebesta | TINY | Merge the three Syntax-design blanks (this, b1-14-1fj8yuf, b1-14-14iqt74). Q “Name three aspects of syntax design that affect readability, with an example of each.” A “Special (reserved) words such as while, class, for; how compound statements are formed (end if / end loop vs braces); meaningful keywords, so that a construct's form shows its purpose.” |
| `blank:b1-14-1fj8yuf` | blank/sebesta | TINY | Fold into the merged Syntax-design card. |
| `blank:b1-14-14iqt74` | blank/sebesta | TINY | Fold into the merged Syntax-design card. |
| `blank:b1-15-17cbqtc` | blank/sebesta | CUE | The prompt is shaped around one missing word, so the student has to guess the slide's phrasing. Rewrite: Q “Define support for abstraction as a language criterion.” A “You can define complex structures or operations and then use them while ignoring their details.” |
| `blank:b1-16-5s267y` | blank/sebesta | TINY | Merge with b1-16-1o087oo. Q “Define type checking.” A “The compiler (or run-time system) checks that each variable is used in a way that is correct for its type.” |
| `blank:b1-16-1o087oo` | blank/sebesta | CUE, TINY | The answer (“its type”) is in the prompt (“Type checking: …”). Fold into the merged Type-checking card. |
| `blank:b1-16-100awig` | blank/sebesta | TINY | Merge with b1-16-1f265qw. Q “Define exception handling.” A “Intercepting run-time errors (unusual conditions) and taking corrective measures, so the program can continue.” |
| `blank:b1-16-1f265qw` | blank/sebesta | TINY | Fold into the merged Exception-handling card. |
| `l1-readwrite` | recall | BIG | Her test splits this into three parts (a: readability, b: writeability, c: which is better? argue). Split it the same way: (a) Q “Discuss the readability of the two versions.” A “Pascal reads more like English (then, no brackets), which helps beginners; experienced programmers find them equal.” (b) Q “Discuss the writeability.” A “Java needs two fewer characters per condition, and we write many conditionals; but a forgotten bracket costs edits.” (c) Q “Which is better? Argue.” A “Either side, if justified using a named criterion and a concrete example.” |
| `l1-cat-prolog` | mc | TINY | A 4-option MC with an obvious answer. Merge with l1-cat-scheme into one matching card in her test format: Q “Classify each language: C, Scheme, Prolog, Java.” A “C: procedural (imperative); Scheme: functional; Prolog: logic; Java: object-oriented.” |
| `l1-cat-scheme` | mc | TINY, DUP | Fold into the merged classification card (row above). |

### Lecture 2: history (61 flagged)

| id | type | problem(s) | concrete fix |
|---|---|---|---|
| `blank:b2-4-1nt5uym` | blank/slides | DUP | Duplicates l2-eniac-how, which is her actual test question. Drop. |
| `blank:b2-4-wb62jk` | blank/slides | DUP, CUE, TINY | “What was done to the wheels and cranks? Turning them” gives itself away. Drop (l2-eniac-how covers it). |
| `blank:b2-4-53ku95` | blank/slides | DUP, CUE, TINY | “What was written on paper? Instructions” gives itself away. Drop. |
| `blank:b2-5-1hu26ma` | blank/slides | DUP | Same fact as l2-vonneumann, which is worded like her test. Drop. |
| `blank:b2-8-1amnoyj` | blank/sebesta | VALUE | Digit trivia (2-letter names in a never-implemented report). Not the kind of thing her tests ask. Suspend. |
| `blank:b2-8-1tt0c81` | blank/sebesta | VALUE | Merge with b2-8-19fizvh, then make it low priority. Q “What did the 1954 Fortran report claim?” A “That compiled Fortran would be as efficient as hand-coded machine code and would eliminate coding errors and debugging.” |
| `blank:b2-8-19fizvh` | blank/inferred | VALUE, DUP | Inferred, and overlaps l2-fortran-goal. Fold into the merged 1954-report card. |
| `blank:b2-9-6xyr4a` | blank/inferred | CUE, VALUE | “How is FORTRAN labelled?” cannot be answered without already knowing the made-up label. The expansion “Widely Still Used Today” is a guess (the slides only say WSUT). Replace this card and b2-22-1sar9py and b2-34-d154lm with one order card: Q “Order these still widely used (WSUT) languages from oldest to newest: COBOL, LISP, FORTRAN.” A “FORTRAN \| LISP \| COBOL.” Also add her test item as MC: “Which is the oldest WSUT language?” → FORTRAN. |
| `blank:b2-9-7u0gva` | blank/sebesta | VALUE | Number trivia (6-character names). Suspend. |
| `blank:b2-9-1pr3e15` | blank/sebesta | DUP | Merge with b2-9-1hsycm8. Q “In Fortran I, how did a variable get its type?” A “From its name. There were no type declarations: names starting with I to N were integers, all others were reals.” This still pairs with the MC l2-fortran-names (recall + recognition is fine). |
| `blank:b2-9-1hsycm8` | blank/slides | DUP | Fold into the merged Fortran-I typing card (row above). |
| `blank:b2-9-95yyrz` | blank/sebesta | VALUE | Merge with b2-9-1s6lhvx into one low-priority card, or suspend both. Q “What limited Fortran I programs?” A “Programs over about 400 lines rarely compiled correctly, because the IBM 704 was unreliable.” |
| `blank:b2-9-1s6lhvx` | blank/sebesta | VALUE | Fold into the row above. |
| `blank:b2-10-19c3tbf` | blank/history | VALUE | Punched cards: trivia. Suspend. |
| `blank:b2-12-tihx5q` | blank/sebesta | CUE, DUP | “What official status did it gain?” → “a standard” is given away, and the next card asks for the same event. Merge: Q “Who standardized Fortran IV, when, and under what name?” A “ANSI, in 1966, as Fortran 66.” |
| `blank:b2-12-1n6i5jy` | blank/sebesta | DUP | Fold into the merged standard card. |
| `blank:b2-13-rcmyge` | blank/sebesta | CUE, ACC | The prompt is padded with hints (“ANSI standard, 1978, with logical loop control”), and the answer includes a labelled “best guess” about lowercase letters. Lowercase became standard only in Fortran 90 (in Fortran 77 it was a common compiler extension), so the guess is probably wrong. Rewrite: Q “What did Fortran 77 add?” A “Character string handling, logical loop control statements, and IF-THEN-ELSE.” (Sebesta.) |
| `blank:b2-14-1q9irl6` | blank/sebesta | BIG, VALUE | A five-item list on a low-yield topic. Keep it low priority and self-grade on any three of the five, or suspend it. |
| `blank:b2-15-ksgz9q` | blank/inferred | VALUE | The competitors (C, C++) are inferred. Keep only the part the sources support: A “Still widely used, mainly for scientific and numerical (high-performance) computing.” |
| `blank:b2-18-1k9huce` | blank/sebesta | DUP | Same answer (“symbolic computation”) as b2-17-1upkq0w. Drop. |
| `blank:b2-18-1uzj7j` | blank/sebesta | VALUE | Differentiation is a minor detail. Low priority, or suspend. |
| `blank:b2-21-131ctqn` | blank/sebesta | ANS | In Scheme, if is also a correct answer. A “cond (if also works).” |
| `blank:b2-22-1sar9py` | blank/inferred | CUE, VALUE | See b2-9-6xyr4a: replace with the single WSUT order card. |
| `blank:b2-22-1nrcgpx` | blank/history | VALUE | Names and years (Russell, 1959). Her tests never ask these. Suspend. |
| `blank:b2-22-1cnplg7` | blank/history | VALUE | Names and years (Hart and Levin, 1962). Suspend. |
| `blank:b2-22-5qngrm` | blank/history | VALUE | Names and years (Greenblatt and Knight, 1973). Suspend. |
| `blank:b2-24-13lgn3q` | blank/sebesta | DUP | Merge with b2-24-1ed7fqu and b2-24-1jb3gcb. Q “Lisp's status, per the slides?” A “It dominated AI for about 25 years; Lisp machines died out; it lives on in Emacs.” Treat “still the leader in AI” as the slide's (dated) claim: in 2026 the leader is Python. |
| `blank:b2-24-1ed7fqu` | blank/sebesta | DUP, ACC | Same fact as the row above, and stated as present-day truth, which it is not. Fold into the merged card. |
| `blank:b2-24-1jb3gcb` | blank/inferred | VALUE, ACC | Inferred answer that hedges between two answers (“Python (historically Prolog)”). Drop. |
| `blank:b2-25-g4eews` | blank/inferred | CUE, VALUE, ACC | “The Best Programming Language You've Never Heard Of” is an invented label. The slide's blank is unknown, and no student could produce this answer. Drop. |
| `blank:b2-25-1i08umn` | blank/slides | DUP | Same as the goal half of l2-algol-origin. Keep one (see l2-algol-origin). |
| `blank:b2-27-1trn0u6` | blank/sebesta | TINY | Merge the three subgoal blanks. Q “What were Algol's three subgoals?” A “Syntax close to mathematical notation; good for describing algorithms in publications; mechanically translatable into machine code.” |
| `blank:b2-27-in6ge7` | blank/sebesta | TINY | Fold into the merged subgoals card. |
| `blank:b2-27-1gxvaog` | blank/sebesta | TINY | Fold into the merged subgoals card. |
| `blank:b2-28-f7vsxu` | blank/inferred | VALUE | Inferred anecdote (period vs comma). Suspend. |
| `blank:b2-28-16o8t44` | blank/inferred | VALUE | Inferred. Suspend. |
| `blank:b2-29-1u3hy07` | blank/sebesta | TINY, VALUE | Merge the minor Algol syntax firsts (this, b2-29-soyamr, b2-29-17ert3j, b2-30-11brhvz, b2-30-wcesra) into one card. Q “Name four Algol firsts that are still in modern languages.” A (any four) “Formalized data types; block structure (local scopes); := for assignment and ; as separator; recursion in an imperative language; stack-dynamic arrays; formal syntax in BNF; identifiers of any length; arrays with any number of subscripts in [ ]; else-if.” Keep b2-29-1dxh0dq, b2-30-5loocb, b2-30-fjs056, b2-31-1jdluvo and b2-31-1br7kp3 as separate cards: they tie into later lectures. |
| `blank:b2-29-soyamr` | blank/sebesta | TINY, VALUE | Fold into the merged Algol-firsts card. |
| `blank:b2-29-17ert3j` | blank/sebesta | TINY, VALUE | Fold into the merged Algol-firsts card. |
| `blank:b2-29-wvjh0m` | blank/sebesta | CUE | “By what were parameters distinguished? Mode” needs the exact slide word. Rewrite: Q “Algol introduced parameter modes. What is a parameter's mode?” A “Whether it carries data in to the subprogram, out of it, or both.” |
| `blank:b2-30-wcesra` | blank/sebesta | TINY | Fold into the merged Algol-firsts card. |
| `blank:b2-30-11brhvz` | blank/sebesta | TINY | Fold into the merged Algol-firsts card. |
| `blank:b2-32-1v33sp` | blank/sebesta | DUP | Covered by l2-algol-death (its answer lists no I/O). Drop. |
| `blank:b2-32-1u3vlgo` | blank/sebesta | DUP | Covered by l2-algol-death (BNF hard to understand). Drop. |
| `blank:b2-34-d154lm` | blank/inferred | CUE, VALUE | See b2-9-6xyr4a: replace with the single WSUT order card. |
| `blank:b2-34-1wt15e2` | blank/sebesta | DUP | Same fact (“English”) as b2-35-1brpsfm, b2-35-1r93pxg and l2-cobol-goals. Keep one: the split COBOL-goals card (see l2-cobol-goals). |
| `blank:b2-35-1brpsfm` | blank/sebesta | DUP | Fold into the COBOL-goals card. |
| `blank:b2-35-1r93pxg` | blank/inferred | DUP | Fold into the COBOL-goals card. |
| `blank:b2-34-1rw1fxo` | blank/sebesta | ACC | Contradicts b2-36-1ilwd9j and l2-cobol-records, which say COBOL's records led to structs in C and eventually OOP. Rewrite A: “Very little, except for its record (hierarchical data) structures, which prompted structs in C.” |
| `blank:b2-36-1ilwd9j` | blank/sebesta | DUP | Same fact as l2-cobol-records. Merge: Q “What data-structure idea did COBOL pioneer, and what did it lead to?” A “Hierarchical data structures (records), which led to structs in C and eventually to OOP.” |
| `blank:b2-36-2lbnmi` | blank/sebesta | VALUE | Number trivia (30 characters). Suspend. |
| `blank:b2-40-i3wca9` | blank/slides | DUP | Overlaps l2-prolog-true and b1-19-1hfdb5b. Merge with b2-40-16sajux: Q “How do you write a Prolog program, and how do you get answers from it?” A “State facts and rules (what is true), then pose queries (goals) that the system tries to prove.” |
| `blank:b2-40-16sajux` | blank/inferred | TINY | Fold into the merged Prolog card. |
| `blank:b2-41-1tsfogg` | blank/history | VALUE | Project-name trivia (FGCS). Suspend. |
| `l2-plankalkul` | recall | BIG, VALUE | Three-part name/date trivia. Trim: Q “What was Plankalkül, and who designed it?” A “Konrad Zuse's “Program Calculus” (1945, published 1972): an early high-level language design with floating point, arrays and records.” |
| `l2-lisp-origin` | recall | BIG, VALUE | Four facts on one card. Trim: Q “What does LISP stand for, and who designed it?” A “LISt Processing; John McCarthy (MIT).” |
| `l2-lisp-dialects` | recall | VALUE | Standards bodies and years are trivia. Trim: Q “What are Lisp's two main dialects?” A “Common Lisp and Scheme.” |
| `l2-algol-origin` | recall | BIG, DUP | Four points that overlap b2-25-1i08umn and l2-algol-committee. Trim: Q “What does Algol stand for, and what was it trying to be?” A “ALGOrithmic Language: a universal, machine-independent language for expressing algorithms.” |
| `l2-cobol-goals` | recall | BIG | Two questions in one (who, and goals). Split: (1) Q “Who is COBOL most associated with?” A “Grace Hopper.” (2) Q “Name three of COBOL's design goals.” A “Look like simple English so managers can read it; be easy to use even if less powerful; broaden the base of programmers; ignore what would be hard for the compiler (English over math).” |
| `l2-cobol-records` | recall | DUP | See b2-36-1ilwd9j; keep one. |
| `l2-prolog-origin` | recall | BIG, VALUE | Three researchers' names are trivia. Trim: Q “What does Prolog stand for, and roughly when was it created?” A “PROgramming LOGic; 1972.” |

### Lecture 3: C pre-test (1 flagged)

| id | type | problem(s) | concrete fix |
|---|---|---|---|
| `l3-banana-java` | recall | STAND | “That code” is not shown on this card, and the app interleaves cards. Add the banana code as this card's code field. |

### Lecture 4: translation, grammars (15 flagged)

| id | type | problem(s) | concrete fix |
|---|---|---|---|
| `blank:b4-6-1pvaezd` | blank/slides | DUP | Same as half of l4-lexeme-token, which is her test question. Drop. |
| `blank:b4-6-25409l` | blank/slides | DUP | Same as the other half of l4-lexeme-token. Drop. |
| `blank:b4-6-a4deke` | blank/inferred | CUE | The prompt already contains most of the answer. Rewrite: Q “In translation terminology, what is a language?” A “The set of all possible sentences; for a programming language, all possible programs.” |
| `blank:b4-10-188phra` | blank/sebesta | TINY | Merge with b4-10-gksina and b4-10-zrpxqy. Q “What is a BNF rule called, and what may appear on each side?” A “A production, LHS → RHS. The LHS is one nonterminal (in \< >). The RHS is a string of terminals and/or nonterminals; \| separates alternatives.” |
| `blank:b4-10-zrpxqy` | blank/sebesta | TINY | Fold into the merged production card. |
| `blank:b4-14-1mg5y26` | blank/inferred | DUP, ACC | Inaccurate: every grammar can generate a sentence “in more than one way” (leftmost vs rightmost derivations), so that is not ambiguity. It also duplicates l4-ambiguous. Drop, or rewrite A: “A grammar in which some sentence has two or more distinct parse trees (equivalently, two leftmost derivations).” |
| `blank:b4-18-1rtsj9w` | blank/inferred | CUE | “What does the grammar allow less of?” cannot be answered without the slide's exact word. Rewrite: Q “Change \<expr> → \<expr> / \<expr> \| \<const> so that / is left-associative. Why does it work?” A “\<expr> → \<expr> / \<const> \| \<const>. Recursion is only on the left, so the leftmost / ends up deepest in the parse tree and is evaluated first.” |
| `l4-compiler-steps` | order | TYPE | Her test says “List the three main steps”, which is free recall. An order card hands over the three items. Convert to recall: Q “List the three main steps of a compiler, in order.” Points: lexical analysis; syntax analysis; code generation. |
| `l4-gpa-derive` | order | TYPE, STAND | Each step is the previous one with one more symbol expanded, so the order can be found by string length without knowing BNF. The grammar is also not shown. Convert to recall with the grammar in the code field: Q “Write the leftmost derivation of 3.9.” A “\<GPA> ⇒ \<left digit> . \<right digit> ⇒ 3 . \<right digit> ⇒ 3.9.” |
| `l4-gpa-41` | recall | STAND | “Using that GPA grammar”: the grammar is not on the card. Add it as the code field. |
| `l4-xyz-order` | order | TYPE | Her test asks “What machine language instructions must be generated?”, which is generation, not arrangement. Convert to recall with points: load y and z into registers; shift z's register left 1 bit (×2); add; store into x. |
| `l4-where-x` | recall | BIG | Two different test sub-questions on one card. Split: (1) Q “In x = y + 2 * z;, where does x come from during execution?” A “Memory (RAM or cache).” (2) Q “How are the machine instructions for a statement determined?” A “By the compiler or interpreter: a program that translates high-level code into lower-level code.” |
| `l4-token-i` | typed | ANS | Token names vary between compilers. Add accepts: id, ident, identifier name, variable name. |
| `l4-token-10` | typed | ANS | int_literal is the slide's private name, and the slide's own token examples say “number”. Typed exact-match will reject correct answers. Add accepts: literal, number, integer, int literal, numeric literal, integer constant. Better still, make it self-graded recall. |
| `l4-sample-derive` | order | TYPE | Same flaw as l4-gpa-derive: ten steps sortable by how much is expanded, with no grammar knowledge needed. Convert to recall (“write the rest of the leftmost derivation”), or keep it as order but add two wrong distractor steps (e.g. “c = \<term> * \<expr>”, “c = c + \<num> + \<expr>”) that must be left out. |

### Lecture 5.1: names, binding, types (9 flagged)

| id | type | problem(s) | concrete fix |
|---|---|---|---|
| `blank:b5.1-2-xih8qp` | blank/sebesta | TINY | Merge the three entity blanks (this, b5.1-2-1bzqiww, b5.1-2-15dbo29). Q “A name can stand for three kinds of program entity. Name each, with an example.” A “A variable (stuName = “Jackie”); a label, i.e. a statement location (evenNum:); a subprogram (sumToN(12)).” |
| `blank:b5.1-2-1bzqiww` | blank/sebesta | TINY | Fold into the merged entity card. |
| `blank:b5.1-2-15dbo29` | blank/sebesta | TINY | Fold into the merged entity card. |
| `blank:b5.1-11-1alzemu` | blank/inferred | CUE, VALUE, DUP | Vague inferred answer that restates l51-attrs. Drop. |
| `blank:b5.1-12-1vp401l` | blank/sebesta | TINY | Circular (“binding time = the time a binding takes place”). Merge with b5.1-12-d0rlwo: Q “Define binding and binding time.” A “A binding is an association between an entity and an attribute (e.g. a variable and its type); binding time is when that association is made.” |
| `blank:b5.1-20-uo4ng` | blank/inferred | CUE | Vague prompt with an inferred answer. Rewrite: Q “What is a variable's value?” A “The contents of the memory cell(s) at its address, interpreted through its type (the programmer's meaning).” |
| `blank:b5.1-23-512qco` | blank/slides | DUP | Same definition as b5.2-3-1fpops0 and b5.2-3-13hvl1o. Keep one: Q “Define lifetime.” A “The time during which a name is bound to a particular memory cell, i.e. how long that cell holds the name's value.” |
| `l51-case` | mc | ACC | Matches the slides, but modern Scheme (R6RS, R7RS, Racket) is case-sensitive; only older (R5RS-era) Scheme folded case. Keep the answer and add a note to it: “(per the slides; true of older Scheme)”. |
| `l51-maxlen` | mc | ACC | Minor: the C standard sets a minimum number of significant characters (31 internal in C89, 63 in C99), not a hard maximum length. Keep the answer and add that note. |

### Lecture 5.2: lifetime, scope, constants (29 flagged)

| id | type | problem(s) | concrete fix |
|---|---|---|---|
| `blank:b5.2-3-1fpops0` | blank/sebesta | DUP | Fold into the single lifetime definition. |
| `blank:b5.2-3-13hvl1o` | blank/sebesta | DUP | Fold into the single lifetime definition. |
| `blank:b5.2-4-k5eo6i` | blank/sebesta | TINY | Merge with b5.2-4-6sb5rq. Q “Define static lifetime.” A “The variable is bound to its memory cell(s) before execution begins and stays bound to the same cells until execution ends.” |
| `blank:b5.2-4-6sb5rq` | blank/sebesta | TINY | Fold into the merged static-lifetime card. |
| `blank:b5.2-5-1cn54g5` | blank/sebesta | TINY | Merge with b5.2-5-185j6u1. Q “What is the advantage of static variables, and why?” A “Efficiency: direct addressing and no run-time allocation or deallocation.” |
| `blank:b5.2-5-185j6u1` | blank/sebesta | TINY | Fold into the row above. |
| `blank:b5.2-5-1apq569` | blank/sebesta | TINY | Merge the disadvantage blanks (this, b5.2-5-qzsegc, b5.2-5-vfx0v2). Q “What are the disadvantages of static variables?” A “Lack of flexibility: no recursion, the size must be known before run time, and storage cannot be shared among variables.” |
| `blank:b5.2-5-o2oefn` | blank/sebesta | ACC | The reason given (“memory is always in use”) is not why recursion fails. Rewrite as a “why” card: Q “Why can't a language with only static variables support recursion?” A “Each variable has exactly one memory cell for the whole run, so a second active call of the same function would overwrite the first call's locals.” |
| `blank:b5.2-5-qzsegc` | blank/inferred | TINY | Fold into the merged disadvantages card. |
| `blank:b5.2-5-vfx0v2` | blank/sebesta | TINY | Fold into the merged disadvantages card. |
| `blank:b5.2-9-1wwejxc` | blank/sebesta | ANS | Her C exam asks for both commands (“malloc and free”). Rewrite: Q “Which calls create and release explicit-heap memory in C, and what creates heap objects in Java?” A “malloc and free; new.” |
| `blank:b5.2-17-1z0hmfk` | blank/sebesta | TINY | Merge the four declaration-rule blanks into one contrast card. Q “Compare C89/Pascal with C99/Java: where may declarations go, and what is a local variable's scope?” A “C89/Pascal: declarations at the start of the block, scope is the whole block. C99/Java: declarations anywhere a statement can go, scope runs from the declaration to the end of the block.” |
| `blank:b5.2-17-1nmgw0y` | blank/sebesta | TINY | Fold into the declaration-rules contrast card. |
| `blank:b5.2-17-1nupb69` | blank/sebesta | TINY | Fold into the declaration-rules contrast card. |
| `blank:b5.2-17-xlqxev` | blank/sebesta | TINY | Fold into the declaration-rules contrast card. |
| `blank:b5.2-22-oyg3tt` | blank/inferred | CUE, VALUE | “Get permission” is a guess at an unknown slide word, and the prompt cannot cue it. Drop. |
| `blank:b5.2-25-1tsvhoc` | blank/inferred | CUE, TINY | The prompt (“in terms of language adoption”) leads to the answer. Merge with b5.2-25-cfdb6p: Q “What are the advantages of static scoping?” A “Most languages use it, so it is familiar; you can tell which variable a name refers to just by reading the program, without running it.” |
| `blank:b5.2-25-cfdb6p` | blank/inferred | TINY | Fold into the merged static-scoping advantages card. |
| `blank:b5.2-26-j5g3ig` | blank/inferred | VALUE | Inferred, and it misses the main disadvantage. Merge with b5.2-26-sjqamj: Q “What are the disadvantages of dynamic scoping?” A “You can't tell what a variable refers to by reading the program; every called subprogram can see and change its callers' locals (less reliable); non-local access is slower; few languages use it, so it is unfamiliar.” |
| `blank:b5.2-29-1ern6en` | blank/sebesta | TINY | “How many times is a constant bound? Once” gives itself away. Merge with b5.2-29-1f7ujm2: Q “What is a named constant, and what are two advantages?” A “A variable bound to a value only once. It improves readability (PI instead of 3.14159) and modifiability (change the value in one place); it also parameterizes programs.” |
| `blank:b5.2-30-9s5mne` | blank/sebesta | CUE, TINY | “Besides dynamically, how?” leaves only one possible answer. Merge with b5.2-30-17h7wbd: Q “Named-constant values can be bound statically or dynamically. What are statically bound ones called, and which C construct is one?” A “Manifest constants; #define.” |
| `blank:b5.2-30-17h7wbd` | blank/sebesta | TINY | Fold into the row above. |
| `l52-static-eg` | recall | DUP, TINY | The same example is required in l52-lifetime-vs-scope. Drop. |
| `l52-block-java` | recall | STAND | “That doThis() code” is not on the card. Add it as the code field. |
| `l52-py-trace` | typed | TYPE, ANS | Five lines of case-sensitive literal output (“In f top, y is: 82” …) is a typing test, not a scope test. Keep the program and ask only for the values: Q “What value of x (or y) does each print show? Give five numbers in order.” A “82 13 55 55 12.” Or make it self-graded recall. |
| `l52-py-unbound` | recall | STAND | “That Python program” is not on the card. Add the program as the code field. |
| `l52-sa-error` | recall | STAND, DUP | No code on the card, and it overlaps l52-lifetime-vs-scope. Add the foo/main code (with the sa = sa * 2; line) so it becomes the applied version of the lifetime-vs-scope concept card. |
| `l52-const-c` | mc | TYPE | Three near-identical recognition items (this, l52-const-csharp, l52-java-final). Keep this MC and add one recall comparison card: Q “When are named-constant values bound in C (#define, const), Java (final) and C# (const, readonly)?” A “C: #define static, const not static; Java: final dynamic; C#: const at compile time, readonly dynamic.” |
| `l52-java-final` | mc | TYPE, ACC | A two-option MC is a coin flip. Also, Java's static final constants with constant initializers are compile-time constants (inlined by javac), so “all dynamic” is the slide's simplification. Fold into the comparison card and note “(per slides)”. |

### Lecture 10: control structures (5 flagged)

| id | type | problem(s) | concrete fix |
|---|---|---|---|
| `l10-turing` | recall | DUP | Overlaps blank:b1-5-1s832o7. Refocus on the part only this lecture adds: Q “Ordered statements plus a conditional goto are enough for Turing completeness. Why do languages still provide control structures?” A “Goto-only code is sufficient but not structured: it cannot be read top to bottom, so it is hard to read and maintain.” |
| `l10-multiway-issues` | recall | BIG | A five-item list is hard to self-grade. Keep it, but grade on any four of five, and teach it alongside the split C-switch cards below. |
| `l10-cswitch` | recall | BIG | Five sub-answers on one card. Split into three: (1) Q “Does C's switch run more than one segment? Why?” A “Yes: there is no implicit branch at the end of a segment, so it falls through until a break.” (2) Q “What types may C's switch expression and case values be?” A “Integers, or types that convert to integers.” (3) Q “What does C's switch do with a value that has no case?” A “Runs default if there is one, otherwise nothing.” |
| `l10-loop-compare` | recall | STAND | Neither loop is shown. Add both (the Python range loop and the C for loop) as the code field. |
| `l10-algol68` | typed | VALUE | Trivia (fi). Low priority. |
