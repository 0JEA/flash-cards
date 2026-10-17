// "Help" walkthroughs for CSC 370, Lecture 10 (control structures): selection, switch,
// loops, iterators, goto, and the argue-a-design cards on those topics. Format: see the
// header of decks/csc370-help.js. Every output stated here was checked with gcc, python3,
// perl, javac or guile.
(function (FC) {
  'use strict';
  const H = FC.help = FC.help || {};
  const leaf = label => ({ label, kids: [] });
  const node = (label, ...kids) => ({ label, kids });

  // The two ways to read  if (x > y) if (count == 0) result = 0; else result = 1;
  // Labels kept short (c = count, r = result) so sibling nodes never overlap.
  const treeInner = node('if x>y', node('then', node('if c==0', node('then', leaf('r = 0')), node('else', leaf('r = 1')))));
  const treeOuter = node('if x>y', node('then', node('if c==0', node('then', leaf('r = 0')))), node('else', leaf('r = 1')));

  // ---------- What control is ----------

  H['l10-control-stmt'] = {
    asks: 'Say what makes a statement a control statement, and name two of them.',
    idea: 'With no control statements, a program runs like reading a page: line 1, then line 2, then line 3, each once. A control statement is anything that breaks that “just go to the next line” habit: it skips lines, repeats lines, or jumps somewhere else.',
    steps: [
      'Start from the default order: sequential. Each statement runs once, top to bottom.',
      'Ask of any statement: “after this one, does the program always go to the next line?” If not, it is a control statement.',
      { text: 'Check the usual suspects:', table: { head: ['statement', 'what it does to the order'], rows: [
        ['`if`', 'may skip some lines'], ['`while`, `for`', 'repeat lines'], ['`goto`', 'jumps to a label, anywhere'],
        ['function call', 'jumps into the function, then comes back'], ['`x = y + 1;`', 'nothing: goes to the next line, so NOT a control statement']] } },
      'In Scheme the examples are sequencing (evaluate these expressions in this order) and `cond` (pick which expression gets evaluated).',
    ],
    answer: 'A statement that changes execution from the normal sequential order to a non-sequential one. Examples: `if`, `while`, `for`, `goto`, a function call (and in Scheme, sequencing and `cond`).',
    mistake: 'Listing any statement at all, such as an assignment. An assignment computes something but never changes which statement runs next.',
    tryIt: { q: 'Which of these are control statements: `x = y + 1;`, `while (x < 10) x++;`, `break;`?', a: '`while` (repeats its body) and `break` (jumps out of a loop). `x = y + 1;` just moves on to the next line.' },
  };

  H['l10-control-struct'] = {
    asks: 'Define a control structure, which is a bigger thing than a control statement.',
    idea: 'The control statement is the steering wheel; the control structure is the wheel plus everything it steers.',
    steps: [
      'The control statement is the part that decides, such as the header `while (i < 3)`.',
      { text: 'The statements it decides about are its body:', code: 'while (i < 3) {     /* control statement */\n    sum += i;       /* statements it controls */\n    i++;\n}' },
      'Put them together, header plus body, and you have the control structure. For an `if`: the condition plus its then and else clauses.',
      'Sebesta gives the same definition: “a control statement and the collection of statements whose execution it controls.”',
    ],
    answer: 'A control statement plus the collection of statements it controls.',
    mistake: 'Giving only one half: just “a control statement” or just “a block of code”. You need both the deciding statement and the statements it decides about.',
    tryIt: { q: 'In `if (n > 0) { pos++; } else { neg++; }`, what is the control statement and what is the control structure?', a: 'The control statement is the `if (n > 0) … else` decision. The control structure is all of it: the decision plus both clauses, `pos++;` and `neg++;`.' },
  };

  H['l10-turing'] = {
    asks: 'If a `goto` with a compare can already compute anything, why bother with `if`, `while` and `for`?',
    idea: 'Being able to compute something and being able to read it are different things. Goto has all the power; control structures add a shape you can read from the top down.',
    steps: [
      'Turing completeness needs only ordered statements plus some conditional kind of repetition. A compare plus a `goto` back gives you that.',
      { text: 'The same loop, written both ways (both print `k=0 k=1 k=2`):', code: 'int k = 0;\nL7: printf("k=%d ", k);\n    k++;\n    if (k < 3) goto L7;\n\nint k = 0;\nwhile (k < 3) {\n    printf("k=%d ", k);\n    k++;\n}' },
      'To understand the first, you must find label `L7` and notice the jump goes backwards. In the second, the shape tells you at once: this block repeats while `k < 3`.',
      'That is what “sufficient but not structured” means: with gotos, the order things run is not the order on the page. Control structures give a top-to-bottom read, so code is easier to read and maintain.',
      'Sebesta adds the other side of the coin: Böhm and Jacopini (1966) showed that one two-way selection and one logical loop are also enough, so goto is not even needed.',
    ],
    answer: 'Goto with a compare is sufficient but not structured: the program cannot be read top to bottom, so it is hard to read and maintain. Control structures give a top-to-bottom reading.',
    mistake: 'Saying goto is slower or less powerful. It is neither; the cost is readability and maintainability.',
    tryIt: { q: 'Rewrite this with a `while` and say what it prints.', code: 'int n = 10;\ntop: if (n <= 0) goto done;\n     printf("%d ", n);\n     n -= 4;\n     goto top;\ndone: ;', a: '`while (n > 0) { printf("%d ", n); n -= 4; }` prints `10 6 2`. Notice how much faster the while version is to read.' },
  };

  H['l10-design-q'] = {
    asks: 'Name the three questions a designer must answer for every control structure, whatever kind it is.',
    idea: 'Picture the structure as a room. How many doors lead in? How many lead out? And when you go out, do you always land in the hallway right outside, or can a door drop you anywhere in the building?',
    steps: [
      'Q1: can we enter at multiple points (jump into the middle), or only at the top? C says yes: a `goto` can jump into a loop body. Java says no: loops are entered only at the top.',
      { text: 'Multiple entry in C (it prints `in loop i=7` and `in loop i=8`; the `i = 0` start is skipped):', code: 'int i = 7;\ngoto inside;              /* jump INTO the loop */\nfor (i = 0; i < 9; i++) {\n    inside: printf("in loop i=%d\\n", i);\n}' },
      'Q2: can we leave from multiple points? Almost every language says yes: besides the normal end, `break` or `return` can leave from the middle.',
      'Q3: when we leave, must we go to the statement just below the structure? `break` always lands just below the loop. C’s `goto` can land anywhere. Java’s labelled break lands just below an enclosing loop.',
      { text: 'Two languages, three answers each:', table: { head: ['question', 'C', 'Java'], rows: [
        ['enter at several points?', 'yes, with `goto`', 'no, top only'], ['leave from several points?', 'yes (`break`, `return`, `goto`)', 'yes (`break`, `return`)'],
        ['exit only to just below?', 'no, `goto` goes anywhere', 'yes (or below an outer loop, with labelled break)']] } },
    ],
    answer: 'Can we enter at multiple points (or only at the top)? Can we leave from multiple points? When we leave, must we go to the statement just below the structure, or can we go somewhere else?',
    mistake: 'Answering with the design issues of one particular structure (like the five for switch). These three are about doors: in, out, and where “out” leads.',
    tryIt: { q: 'Python has no goto, and its `break` leaves only the closest loop. How does Python answer the three questions?', a: 'Multiple entry: no, top only. Multiple exits: yes (`break`, `return`). Exit only to just below: yes, a `break` always lands on the statement after the loop.' },
  };

  // ---------- Two-way selection ----------

  H['l10-two-way-issues'] = {
    asks: 'List the decisions a language designer must make when adding `if … else`.',
    idea: 'Pretend you are designing `if` for a new language. You must decide three things: what is allowed inside the condition, how the clauses are wrapped, and what it means when one if sits inside another. Each real language answers these differently.',
    steps: [
      { text: '1. Form and type of the control expression. C, C++ and Python allow an arithmetic condition (nonzero means true); Java demands a `boolean`.', code: 'if (count) …     /* C: fine, true when count != 0 */\nif (count) …     // Java: compile error, int is not boolean' },
      { text: '2. Form of the structure: bracketing. C and Java take one statement, or several in braces, with no `then`. Perl demands braces even for one statement. Algol 68 closes with `fi`; Ada with `end if`; Python uses indentation.', code: 'if (x > 0) y = 1;          /* C: fine */\nif ($x > 0) { $y = 1; }    # Perl: braces required' },
      '3. Meaning of nested selection. With two `if`s and one `else`, which `if` owns the else? That is the dangling else. C and Java settle it with a rule: the closest previous if.',
      'Memory hook: what goes IN the parentheses, how the clauses are WRAPPED, what happens when ifs are NESTED.',
    ],
    answer: 'The form and type of the control expression; the form of the structure (bracketing); the meaning of nested selection (e.g. the dangling else).',
    mistake: 'Mixing in the multi-way (switch) issues, such as fall-through or unrepresented values. Those only arise when there are many cases; two-way selection has just these three.',
    tryIt: { q: 'Ruby writes `if a > b then … else … end`. Which design issue does the `end` keyword answer, and what problem does it remove?', a: 'Bracketing (form of the structure). Because `end` closes each if, you can always see which if an else belongs to, so the dangling-else problem disappears.' },
  };

  H['l10-assign-trace'] = {
    asks: 'Run the code by hand with input 3 and say what appears.',
    idea: 'In C a single `=` always assigns, even inside an `if`. And an assignment has a value: the value that was just stored.',
    steps: [
      'The program prints the prompt `Enter your number: `, then reads 3 into `userNum`.',
      'Next is `if (userNum = favNum)`. One `=` is assignment, not comparison (that would be `==`). It copies 5 into `userNum`.',
      'The whole assignment expression has a value: 5. C treats any nonzero value as true.',
      { text: 'Track the variables:', table: { head: ['moment', 'userNum', 'favNum', 'condition'], rows: [
        ['after `scanf`', '3', '5', '–'], ['after `userNum = favNum`', '5', '5', '5, nonzero, so true']] } },
      'So the then branch prints `Awesome`. The input never mattered: every number gives the same result.',
    ],
    answer: '`Awesome` (after the prompt, so the full output is `Enter your number: Awesome`). The condition assigns 5, and 5 counts as true.',
    mistake: 'Reading `=` as “equals” and answering `Unfortunate` because 3 is not 5. In C, comparison is `==`; a lone `=` in a condition is almost always this bug.',
    tryIt: { q: '`int a = 7, b = 0; if (a = b) printf("Yes"); else printf("No");` What prints, and what is `a` afterward?', a: '`No`, and `a` is 0. The assignment stores 0 in `a`, and its value 0 counts as false.' },
  };

  H['l10-assign-why'] = {
    asks: 'Name the language-design choice that lets `if (userNum = favNum)` compile in C, and explain what Java does differently.',
    idea: 'Two features have to line up for the bug to compile: the condition may be a number, and an assignment produces a number. Java keeps the second but removes the first.',
    steps: [
      'The design issue is the form and type of the control expression. C (also C++ and Python) lets it be arithmetic: 0 is false, anything else is true.',
      'In C an assignment is also an expression with a value: `userNum = favNum` has the value 5. So the condition is the int 5: legal, and true.',
      { text: 'Java answers the design question the other way: the condition must be a `boolean`. The assignment still has a value, but its type is `int`, so javac rejects it:', code: 'error: incompatible types: int cannot be converted to boolean\n  if (userNum = favNum) …' },
      'Python allows arithmetic conditions too, but it blocks this bug another way: its `=` is a statement, not an expression, so `if x = 5:` is a syntax error.',
    ],
    answer: 'C allows an arithmetic control expression (nonzero = true), and an assignment is an expression whose value is the value assigned. Java requires a boolean control expression, so the int assignment is a compile-time type error.',
    mistake: 'Saying Java “forbids assignment in an if”. It does not: with booleans, `if (done = true)` compiles in Java and is always true. Java only catches the int case, because an `int` is not a `boolean`.',
    tryIt: { q: 'In C, how many times does the body of `while (n = 0) { … }` run? Would Java accept it if `n` is an `int`?', a: 'Zero times: `n = 0` stores 0, and its value 0 is false. Java rejects it at compile time: int cannot be converted to boolean.' },
  };

  H['l10-perl'] = {
    asks: 'Pick the language whose `if` body must always be in braces, even when it is one statement.',
    idea: 'This is the bracketing design issue. Most C-family languages make braces optional for one statement; Perl made them mandatory every time.',
    steps: [
      'C and Java: a single statement needs no braces; braces only group several statements.',
      'Python: no braces at all. The indented lines after the colon are the clause.',
      { text: 'Perl: always braces.', code: 'if ($x) print "x\\n";        # Perl: syntax error\nif ($x) { print "x\\n"; }    # Perl: correct' },
      'The payoff (from Sebesta): because every clause is braced, Perl has no dangling-else problem. The braces always show which if an else belongs to.',
    ],
    answer: 'Perl: every then and else clause must be a braced block, even if it holds one statement.',
    mistake: 'Choosing C or Java because they often use braces. There the braces are optional for a single statement, and that option is what makes the dangling else possible.',
    tryIt: { q: 'Which language in the lecture marks its if clauses with neither braces nor a closing keyword?', a: 'Python: a clause is the indented lines after the colon (with `elif` and `else:` for the other branches).' },
  };

  H['l10-algol68'] = {
    asks: 'Give the keyword that ends an `if` statement in Algol 68.',
    idea: 'Algol 68 closes a construct with its opening word spelled backwards.',
    steps: [
      'Bracketing again: instead of braces, Algol 68 wraps the whole if in keywords, with an opening word and a closing word.',
      { text: 'A complete Algol 68 if:', code: 'if x > y then m := x else m := y fi' },
      'The same trick appears elsewhere in the language: `do … od` for loops.',
      'Because `fi` always marks the end, you can see exactly where each if stops, so there is no doubt which if an else belongs to.',
    ],
    answer: '`fi`: `if` spelled backwards.',
    mistake: 'Writing `end if` or `endif`. `end if` is Ada’s closing keyword, also shown in the lecture.',
    tryIt: { q: 'Algol 68’s multi-way selection opens with `case`. Using the same rule, what closes it?', a: '`esac`, which is `case` spelled backwards.' },
  };

  H['l10-dangling-4'] = {
    asks: 'Trace the nested ifs with x = 4, y = 5, count = 20 and give the final value of `result`.',
    idea: 'Ignore the indentation, because the compiler does. First work out which if owns the else (the closest one), then run it.',
    steps: [
      'Structure first: the `else` attaches to the closest previous if that has no else yet, which is `if (count == 0)`.',
      { text: 'So the code really means:', code: 'result = 111;\nif (x > y) {\n    if (count == 0)\n        result = 0;\n    else\n        result = 1;\n}' },
      'Now run it. `x > y` is `4 > 5`: false. The outer if has no else of its own, so everything inside it is skipped.',
      { text: 'Trace:', table: { head: ['test', 'value', 'effect'], rows: [
        ['`x > y` (4 > 5)', 'false', 'skip the whole inner if/else'], ['`count == 0`', 'never checked', '–'], ['`result`', '', 'stays 111']] } },
    ],
    ptree: [
      { tree: treeInner, caption: 'C’s rule: the else belongs to the inner if (c is count, r is result). With 4 > 5 false, nothing under the top “then” runs.' },
      { tree: treeOuter, caption: 'The reading the indentation suggests (not C’s): the else hangs off the outer if, which would give result = 1.' },
    ],
    answer: '111. The else belongs to `if (count == 0)`, and the outer test 4 > 5 is false, so nothing runs.',
    mistake: 'Trusting the indentation and giving the else to the outer if, which would make the answer 1. C and Java pair the else with the closest if.',
    tryIt: { q: 'Same code with x = 2, y = 9, count = 0. What is `result`?', a: '111. `2 > 9` is false, so the inner if/else never runs, whatever `count` is.' },
  };

  H['l10-dangling-14'] = {
    asks: 'Trace the same nested ifs with x = 14, y = 5, count = 20.',
    idea: 'Same structure as before (the else belongs to the inner if), but this time the outer test is true, so you go inside.',
    steps: [
      'The else belongs to the closest if, `if (count == 0)`. The outer if has no else.',
      'Outer test: `14 > 5` is true, so run the inner if/else.',
      'Inner test: `count == 0` is `20 == 0`: false, so its else runs: `result = 1`.',
      { text: 'Trace:', table: { head: ['test', 'value', 'effect'], rows: [
        ['`x > y` (14 > 5)', 'true', 'go into the inner if'], ['`count == 0` (20 == 0)', 'false', 'take the inner else'], ['`result`', '', 'becomes 1']] } },
    ],
    ptree: { tree: treeInner, caption: 'c is count, r is result. Follow then (14 > 5 is true), then else (count is not 0): result = 1.' },
    answer: '1. 14 > 5 is true, count is not 0, so the inner else sets result = 1.',
    mistake: 'Thinking the else is attached to the outer if and so “only runs when x ≤ y”. It is the inner if’s else: it runs when x > y AND count is not 0.',
    tryIt: { q: 'Braces force the other meaning. With x = 14, y = 5, count = 20, what is `result`?', code: 'result = 111;\nif (x > y) {\n   if (count == 0)\n      result = 0;\n}\nelse\n   result = 1;', a: '111. The braces give the else to the outer if. 14 > 5 is true, so the inner if runs; count is not 0 and the inner if has no else, so nothing changes.' },
  };

  H['l10-dangling-rule'] = {
    asks: 'State the rule C and Java use to decide which if a dangling else belongs to, and what early C did instead.',
    idea: 'The grammar for if/else is ambiguous: one sentence, two parse trees. A language must pick one, either with a rule or by changing the syntax.',
    steps: [
      '`if (A) if (B) S1; else S2;` has two ifs and one else. The grammar allows both pairings, so it has two parse trees and two meanings.',
      'C today and Java: the else goes with the closest previous if (the nearest one that has no else yet). This is a formal semantic rule, not part of the grammar.',
      'Early versions of C had no formal semantics for this case: no rule pinned the meaning down.',
      'Indentation means nothing to the compiler. To get the other meaning, wrap the inner if in braces: `if (A) { if (B) S1; } else S2;`.',
      'Other languages remove the problem in the syntax instead: Perl requires braces on every clause; Algol 68 and Ruby close every if with `fi` or `end`.',
    ],
    ptree: [
      { tree: treeInner, caption: 'Closest-if rule (C now, Java): else pairs with the inner if. (c is count, r is result.)' },
      { tree: treeOuter, caption: 'The other legal parse: else pairs with the outer if. C and Java never choose this unless braces force it.' },
    ],
    answer: 'The closest previous if, by a formal semantic rule. Early versions of C had no formal semantics for it.',
    mistake: 'Saying the else goes with the if it lines up with. Indentation is ignored in C and Java (Python is the exception, because there indentation is the structure).',
    tryIt: { q: '`if (a) if (b) if (c) x = 1; else x = 2;` Which if owns the else, and when does `x = 2` run?', a: 'The innermost, `if (c)`. `x = 2` runs only when a and b are true and c is false.' },
  };

  // ---------- Multi-way selection ----------

  H['l10-multiway-issues'] = {
    asks: 'Rebuild the five design questions a language designer must answer for a switch/case statement.',
    idea: 'Imagine designing `switch` from scratch. You must decide: what can you switch on, how is each arm written, can more than one arm run, how are the arm labels written, and what if nothing matches. Those five decisions are the five issues.',
    steps: [
      { text: 'Walk through each question with two real answers:', table: { head: ['design issue', 'C', 'another language'], rows: [
        ['1. form and type of control expression', 'must be an integer', 'C#: can be a string'],
        ['2. how segments are specified', '`case v:` then a statement sequence or block', 'Scheme `cond`: (predicate expression) pairs'],
        ['3. only a single segment per run?', 'no: falls through until `break`', 'C#: yes, every segment ends in `break` or `goto`'],
        ['4. how case values are specified', 'integer constants (or a char)', 'C#: string constants too'],
        ['5. unrepresented values', 'run `default`; with none, do nothing', 'Scheme `cond`: an optional final `#t` clause']] } },
      { text: 'Issue 3 is the one that bites. In C, a forgotten break runs the next case too:', code: 'switch (val) {\n   case 1: x++;      /* no break! */\n   case 2: y++;\n}                    /* val = 1: x and y both go up */' },
      'Why have switch at all, when nested ifs can do it? The original goal was speed: jump straight to the right segment instead of testing condition after condition.',
      'Memory hook: what goes IN, how the ARMS are written, how MANY arms run, how the LABELS look, what if NOTHING matches.',
    ],
    answer: 'Form and type of the control expression; how the selectable segments are specified; whether execution is restricted to a single segment; how case values are specified; what is done about unrepresented values.',
    mistake: 'Answering with the two-way issues (bracketing, dangling else). The multi-way list is longer because many cases create new questions: fall-through, case labels, and the no-match value.',
    tryIt: { q: 'Give C#’s answers to issue 1 (control expression type) and issue 3 (single segment only?).', a: 'Issue 1: integer or string. Issue 3: yes, only one segment runs: each segment must end with an unconditional branch (`break` or `goto`).' },
  };

  H['l10-cswitch'] = {
    asks: 'Can more than one case body run in a single execution of a C `switch`? Explain why.',
    idea: 'In C, `case 2:` is just a label, a place to start; it is not a wall. Once execution starts, it keeps walking down through the following cases until something stops it.',
    steps: [
      'The switch evaluates its expression and jumps to the matching `case` label.',
      'At the end of that segment there is no implicit branch out. The next line in the switch is the next segment, so execution falls into it.',
      { text: 'Example: with `val = 1`, both counters go up:', code: 'switch (val) {\n   case 1: x++;\n   case 2: y++;\n}\n/* val = 1  ->  x = 1, y = 1 */' },
      '`break` is the way out: it jumps to the first statement after the switch (Sebesta calls it a restricted goto). Hence “break is your friend”.',
    ],
    answer: 'Yes, any number of segments can run. C has no implicit branch at the end of a segment, so execution falls through into the next one until a `break`.',
    mistake: 'Saying “no, only the matching case runs”. That is true in C#, not in C. In C, only a `break` (or the end of the switch) stops the fall.',
    tryIt: { q: 'What prints when `v = 3`?', code: 'switch (v) {\n   case 1: printf("A ");\n   case 3: printf("B ");\n   case 5: printf("C "); break;\n   case 7: printf("D ");\n   default: printf("E");\n}', a: '`B C `. It starts at case 3, falls into case 5, then `break` stops it before case 7.' },
  };

  H['l10-cswitch-types'] = {
    asks: 'Say which types C allows for the value being switched on and for the case labels.',
    idea: 'C’s switch is built for whole numbers, which can be used directly to find where to jump. Anything that is “really an integer underneath”, like a `char`, is allowed too.',
    steps: [
      'Control expression: must evaluate to an integer (implicitly). `switch (n + 1)` is fine.',
      { text: 'A `char` is an integer underneath (its character code), so it works for both the expression and the labels:', code: 'char c = \'b\';\nswitch (c) {\n   case \'a\': printf("got a\\n"); break;\n   case \'b\': printf("got b (%d)\\n", c); break;\n}\n/* prints: got b (98) */' },
      { text: 'Not integers: rejected by gcc.', code: 'switch (3.5) …     /* error: switch quantity not an integer */\nswitch ("yes") …   /* error: switch quantity not an integer */' },
      'C# is different here: it allows strings for both the control expression and the case values.',
    ],
    answer: 'Both must be integers, or types that implicitly convert to an integer (such as `char`).',
    mistake: 'Assuming you can switch on a string in C because some other languages allow it. In C a string is a pointer to characters, not an integer value you can match.',
    tryIt: { q: 'Which of these can be a C switch control expression: `n + 1` (n is an int), `\'q\'`, `3.5`, `"yes"`?', a: '`n + 1` and `\'q\'` (a char converts to an int). `3.5` and `"yes"` are compile errors.' },
  };

  H['l10-cswitch-default'] = {
    asks: 'Say what C’s switch does when its value matches none of the cases.',
    idea: 'This is the design issue “what is done about unrepresented values?”. C’s answer: you may supply a catch-all, and if you don’t, nothing happens at all.',
    steps: [
      'If there is a `default:` label, execution jumps there.',
      { text: 'If there is no default, the whole switch does nothing for that value: no error, no output.', code: 'int w = 9;\nprintf("[");\nswitch (w) { case 1: printf("one"); break;\n             case 2: printf("two"); break; }\nprintf("]");\n/* prints: [] */' },
      'Note that `default` is just another label: it does not have to be last, and fall-through applies to it too.',
    ],
    answer: 'It runs the `default` clause if there is one; with no default, the switch does nothing for that value.',
    mistake: 'Thinking an unmatched value is an error or crashes. C stays silent, which is exactly why a missing case can go unnoticed.',
    tryIt: { q: 'With `k = 5`, what prints?', code: 'switch (k) {\n   case 1: puts("one"); break;\n   default: puts("other");\n   case 2: puts("two");\n}', a: '`other` then `two`. 5 matches no case, so it jumps to `default`, which has no break and falls into `case 2`.' },
  };

  H['l10-switch-why'] = {
    asks: 'Say what multi-way selection was originally meant to achieve, and whether compilers always deliver it.',
    idea: 'A chain of if/else-ifs is like asking “is it 0? is it 1? is it 2?…” one question at a time. A switch can, in principle, go straight to the right door, like using the value as an index into a table of addresses.',
    steps: [
      'With nested ifs, finding case 9 out of 10 may take 9 or 10 tests, one after another.',
      'The original goal of switch was speed: compute where to jump and go there, instead of testing a chain of conditions.',
      'Sebesta describes how: if the case values are dense, build an array of segment addresses indexed by the value (unused slots point to `default`); for many sparse values, a hash table or binary search table.',
      'But not every compiler does this. Some just turn the switch into a series of if / else-ifs, which is no faster than writing them yourself.',
      'This is also why case values must be constants: the table has to be built when the program is compiled.',
    ],
    answer: 'Speed: jump straight to the right segment instead of testing conditions one by one. Not every compiler achieves it; some just generate a chain of if / else-ifs.',
    mistake: 'Saying the purpose was only readability. Readability is a bonus; the stated original goal is speed.',
    tryIt: { q: 'A switch has cases 0 through 7, each with its own segment. How could a compiler reach the segment for 5 without testing 0, 1, 2, 3 and 4 first?', a: 'Build an array of 8 segment addresses indexed by the case value, and jump to entry 5 directly: one lookup, whichever value comes in.' },
  };

  H['l10-csharp-switch'] = {
    asks: 'Name two ways C#’s switch differs from C’s.',
    idea: 'C# kept C’s switch shape but fixed C’s most common switch bug (falling through by accident) and widened what you can switch on.',
    steps: [
      'Difference 1: no implicit fall-through. Every segment that has code must end with an unconditional branch: `break`, or a `goto` such as `goto case 1;`. Leave it out and it is a compile error, not a silent bug.',
      'Difference 2: the control expression (and the case values) can be a string, not just an integer.',
      { text: 'Both differences in one example (C#):', code: 'switch (day) {            // day is a string\n   case "Sat":\n   case "Sun":            // stacked labels, no code between: allowed\n      weekend = true;\n      break;              // required\n   case "Mon":\n      weekend = false;\n      break;\n}' },
      'Sharing code between values still works by stacking labels with nothing between them; what is banned is running one segment’s code and then sliding into the next.',
    ],
    answer: 'C# disallows implicitly running more than one segment (each segment must end with `break` or `goto`), and its control expression can be a string.',
    mistake: 'Saying C# “has no fall-through at all, so cases can’t share code”. Stacked empty labels are fine, and `goto case` lets you continue on purpose.',
    tryIt: { q: 'Would this compile in C#? `case 1: x++; case 2: y++; break;` How would you fix it if you really want both increments for 1?', a: 'No: the `case 1` segment has code and does not end in `break` or `goto`. Fix: end it with `goto case 2;`.' },
  };

  H['l10-selector'] = {
    asks: 'Define a selector expression, then write “m is the larger of x and y” with one in C and in ML.',
    idea: 'A statement does something; an expression has a value. A selector expression is a choice that produces a value, so it can sit on the right side of `=`.',
    steps: [
      'C’s `if` is a statement, so `m = if (x > y) x else y;` is not C. C provides a separate operator for a choice with a value: `cond ? a : b`.',
      { text: 'C:', code: 'm = x > y ? x : y;' },
      { text: 'In ML (and other functional languages) the `if` itself is an expression, so you can bind its value directly:', code: 'let m =\n   if x > y then x\n   else y' },
      'Because an ML `if` must produce a value, it must always have an `else` (otherwise there would be no value when the test is false). That also means ML has no dangling-else problem.',
      'Python has one too: `m = x if x > y else y` (with x = 4, y = 9 it gives 9).',
    ],
    answer: 'A selection that produces a value (an expression, not a statement). C: `m = x > y ? x : y;`  ML: `let m = if x > y then x else y`.',
    mistake: 'Writing `m = if (x > y) x; else y;` in C. C’s if does not produce a value; you need `?:`.',
    tryIt: { q: 'Write “d is the distance between x and y” (always non-negative) with a selector expression in C and in ML. What is d for x = 3, y = 8?', a: 'C: `d = x < y ? y - x : x - y;`  ML: `let d = if x < y then y - x else x - y`. With 3 and 8, d = 5.' },
  };

  H['l10-ternary-trace'] = {
    asks: 'Evaluate two conditional (`?:`) expressions in a row and give the printed output.',
    idea: '`test ? a : b` means “if test then a else b”, and it produces a value. Do the test, pick the side, move on.',
    steps: [
      '`m = x > y ? x : y`: is 4 > 9? No, so take the right side: `m = y = 9`.',
      '`n = (m % 2 == 0) ? m / 2 : m * 3`: 9 % 2 is 1, not 0, so the test is false: take the right side, `9 * 3 = 27`.',
      { text: 'Trace:', table: { head: ['line', 'test', 'true or false', 'value'], rows: [
        ['`m = …`', '4 > 9', 'false', 'm = y = 9'], ['`n = …`', '9 % 2 == 0', 'false', 'n = 9 * 3 = 27']] } },
      'The printf prints `m`, a space, then `n`.',
    ],
    answer: '`9 27`',
    mistake: 'Taking the left side when the test is false. Left of the `:` is the “true” value; right is the “false” value.',
    tryIt: { q: 'Same code but with `x = 12, y = 7`. What prints?', a: '`12 6`. 12 > 7, so m = 12; 12 is even, so n = 12 / 2 = 6.' },
  };

  // ---------- Loops ----------

  H['l10-iter-design'] = {
    asks: 'List the design questions a language designer must answer for loops.',
    idea: 'Design a loop from scratch and three questions jump out: what decides how many times it runs, where can you come in, and when do you check whether to stop?',
    steps: [
      { text: '1. How is iteration controlled? By a logical condition, by a count, or by a data type that hands out its own elements.', code: 'while (x < 10) …               /* logical */\nfor (i = 0; i < 10; i++) …     /* counted */\nfor weather in myList:         # data type with its own iterator (Python)' },
      '2. Can you get into the loop other than at the top? C: yes, a `goto` can jump into the body. Java: no, loops are entered only at the top.',
      '3. Where is it decided whether the loop is done? At the top (pretest: `while`, `for`; the body may run 0 times) or at the bottom (posttest: `do … while`; the body runs at least once).',
      { text: 'Issue 3 in action, with `k = 5`:', code: 'while (k < 3) { … }        /* body runs 0 times */\ndo { … } while (k < 3);    /* body runs once */' },
    ],
    answer: 'How is iteration controlled (logically, by a count, or by a data type with its own iterator)? Can a loop be entered other than at the top? Where is it decided whether the loop is done (top = pretest, bottom = posttest)?',
    mistake: 'Listing kinds of loops (for, while, do-while) instead of questions. Each issue is a question; the loop kinds are the different answers to it.',
    tryIt: { q: 'How does Python’s `for x in myList:` answer the three questions?', a: 'Controlled by the list’s own iterator (a data type). Entered only at the top (Python has no goto). Tested at the top before each pass, so an empty list runs the body 0 times (pretest).' },
  };

  H['l10-fallthrough'] = {
    asks: 'Trace a C switch with no `break`s and give the printed output for n = 2.',
    idea: 'The switch only decides where to START. With no break, it then runs everything below that point.',
    steps: [
      'n is 2, so the switch jumps to `case 2:`.',
      { text: 'From there, no segment ends with a break, so execution walks down through every later segment:', table: { head: ['segment', 'runs?', 'prints'], rows: [
        ['`case 1`', 'no (we start below it)', ''], ['`case 2`', 'yes, start here', 'two '], ['`case 3`', 'yes, fall through', 'three '], ['`default`', 'yes, fall through', 'other']] } },
      'Note `default` runs even though 2 matched a case: it is just the next label down.',
    ],
    answer: '`two three other`',
    mistake: 'Answering just `two`. That would need a `break` after `printf("two ");`. Also, case 1 does not run: falling goes downward only.',
    tryIt: { q: 'What prints when `v = 7`?', code: 'switch (v) {\n   case 1: printf("A ");\n   case 3: printf("B ");\n   case 5: printf("C "); break;\n   case 7: printf("D ");\n   default: printf("E");\n}', a: '`D E`. It starts at case 7 and falls into default; the earlier break is above the start, so it never runs.' },
  };

  H['l10-csharp'] = {
    asks: 'Pick the language whose switch refuses to slide from one case into the next.',
    idea: 'C’s switch was copied into C++, Java and JavaScript with fall-through intact. C# is the one that kept the shape but removed the accidental fall-through.',
    steps: [
      'C, C++ and Java: no implicit branch at the end of a segment, so a missing `break` falls into the next case.',
      'C#: a static rule says each segment with code must end with an unconditional branch: `break` or `goto`. Forget it and the program does not compile.',
      'C# also lets the control expression be a string.',
    ],
    answer: 'C#: each segment must end with `break` or `goto`, so it never falls through implicitly.',
    mistake: 'Picking Java because it is “safer” than C. Java’s switch statement falls through exactly like C’s.',
    tryIt: { q: 'In C#, how do you deliberately run case 0’s code and then case 1’s code?', a: 'End case 0 with `goto case 1;`. C# never falls through on its own, but an explicit goto to another case is allowed.' },
  };

  H['l10-loop-kinds'] = {
    asks: 'Classify `do … while`: is its stopping test before or after the body?',
    idea: 'The names say where the test is: PRE-test checks before the body, POST-test checks after. In `do { … } while (cond);` you can see the condition sits after the body.',
    steps: [
      'Read the shape: `do` comes first, then the body, and `while (cond);` comes last. So the body runs, then the test.',
      { text: 'Compare the two with the same start value:', table: { head: ['loop', 'test', 'minimum runs'], rows: [
        ['`while`, `for`, for-each', 'before the body (pretest)', '0'], ['`do … while`', 'after the body (posttest)', '1']] } },
      '“Counter-controlled” answers a different question (how the loop is controlled, by counting), so it is not about where the test is.',
    ],
    answer: 'Posttest: the condition is checked after the body, so the body always runs at least once.',
    mistake: 'Picking “counter-controlled” because it is a loop kind too. Pretest/posttest is about where the test is; counted/logical is about what controls the loop. `do … while` is logical and posttest.',
    tryIt: { q: 'With `int k = 10;`, how many times does the body run in `while (k < 5) k++;`, and in `do k++; while (k < 5);`?', a: '`while`: 0 times (10 < 5 is false before the body). `do … while`: 1 time (k becomes 11, then the test fails).' },
  };

  H['l10-weird-for'] = {
    asks: 'Trace a `for` loop with an empty body, where all the work happens in the header, and give i, j and sum at the end.',
    idea: '`for (A; B; C);` means: do A once; then repeat “test B; if true, run the (empty) body, then run C”. Here C does all the work: `sum = ++i + j`, then `j *= 2`.',
    steps: [
      'The `;` right after the `)` is the body: it does nothing. All changes happen in the third part.',
      'Start: `i = 0, j = 2` (the comma runs both). Each pass: test `i < 10`; then `++i` (i goes up first), `sum = i + j`, then `j` doubles.',
      { text: 'Trace (values after each pass’s third part):', table: { head: ['pass', 'i', 'sum = i + j', 'j after doubling'], rows: [
        ['1', '1', '1 + 2 = 3', '4'], ['2', '2', '2 + 4 = 6', '8'], ['3', '3', '3 + 8 = 11', '16'], ['…', '…', '…', '…'],
        ['9', '9', '9 + 512 = 521', '1024'], ['10', '10', '10 + 1024 = 1034', '2048']] } },
      'Pattern: after pass k, i = k and j = 2 to the power k + 1. Now the test `10 < 10` is false, so the loop stops.',
    ],
    answer: '`i = 10, j = 2048, sum = 1034`. The last sum used j = 1024 before j doubled to 2048.',
    mistake: 'Using the final j in the last sum (10 + 2048). The sum is computed first, with j = 1024, and only then does `j *= 2` run.',
    tryIt: { q: '`for(i = 0, j = 1; i < 4; sum = ++i + j, j *= 3);` What are i, j and sum afterward?', a: 'i = 4, j = 81, sum = 31. Passes: sum = 1+1 = 2 (j→3), 2+3 = 5 (j→9), 3+9 = 12 (j→27), 4+27 = 31 (j→81).' },
  };

  H['l10-py-loop'] = {
    asks: 'Predict what a Python `for` loop prints when the body changes the loop variable.',
    idea: 'Python’s `for i in range(10)` is like a dealer handing you the next card each turn. Whatever you do to the card in your hand, the dealer still hands you the next one in the deck.',
    steps: [
      '`range(10)` produces 0, 1, 2, …, 9. At the start of each pass, `i` is set to the next one of those.',
      '`i *= 5` changes the variable `i`, but only until the next pass, when `i` is overwritten with range’s next value.',
      { text: 'Trace:', table: { head: ['pass', 'range gives', 'prints', 'i after `i *= 5`'], rows: [
        ['1', '0', '0', '0'], ['2', '1', '1', '5'], ['3', '2', '2', '10'], ['…', '…', '…', '…'], ['10', '9', '9', '45']] } },
      'The change does stick after the final pass: printing `i` after the loop gives 45. It just never affects the loop.',
    ],
    answer: '`0 1 2 3 4 5 6 7 8 9`: range hands out the next value each pass, so changing i inside the body has no effect on the loop.',
    mistake: 'Treating it like a C loop where `i` itself is tested each time. Python never tests `i`; it just asks range for the next value.',
    tryIt: { q: 'What does this print?', code: 'for i in range(1, 8, 2):\n    print(i)\n    i = 100', a: '`1 3 5 7`. range(1, 8, 2) gives 1, 3, 5, 7, and each pass overwrites the 100.' },
  };

  H['l10-c-loop'] = {
    asks: 'Predict what a C `for` loop prints when the body changes the loop variable.',
    idea: 'In C, `i` is just an ordinary variable. The loop does three things: test `i < 10`, run the body, do `i++`. If the body changes `i`, the next test sees the change.',
    steps: [
      'Order of one pass: test `i < 10`; if true, print i, then `i *= 5`; then `i++`.',
      { text: 'Trace:', table: { head: ['i at test', 'i < 10?', 'prints', 'after `i *= 5`', 'after `i++`'], rows: [
        ['0', 'yes', '0', '0', '1'], ['1', 'yes', '1', '5', '6'], ['6', 'yes', '6', '30', '31'], ['31', 'no: stop', '', '', '']] } },
      'Three passes, and i ends at 31.',
    ],
    answer: '`0 1 6`',
    mistake: 'Forgetting the `i++` after the body (giving 0 then 5), or forgetting that 0 * 5 is still 0 (giving 0 then 1 then 2 …).',
    tryIt: { q: 'What does this print?', code: 'for(i = 1; i < 20; i++){\n    printf("%d ", i);\n    i *= 3;\n}', a: '`1 4 13`. 1 → 3 → 4; 4 → 12 → 13; 13 → 39 → 40, and 40 < 20 fails.' },
  };

  H['l10-loop-compare'] = {
    asks: 'Explain why the same `i *= 5` changes how often the C loop runs but not the Python loop.',
    idea: 'C’s for is a while loop in disguise: it re-tests an ordinary variable each pass. Python’s for asks an iterator for the next value each pass, ignoring what you did to the variable.',
    steps: [
      { text: 'C’s `for(exp1; exp2; exp3)` is really this while loop:', code: 'i = 0;               /* exp1 */\nwhile (i < 10) {     /* exp2, tested every pass */\n    printf("%d ", i);\n    i *= 5;\n    i++;             /* exp3 */\n}' },
      'So any change to `i` in the body is seen by the next test. C prints `0 1 6`.',
      'Python’s `for i in range(10)` assigns `i` the next value from `range` at the start of every pass. Your `i *= 5` is overwritten before anyone checks it. Python prints 0 through 9.',
      'The intent of a counted loop is easy counting. Python’s version sticks to that intent; C’s is more general (and so easier to break).',
    ],
    answer: 'C’s `for(exp1; exp2; exp3)` is a while loop over an ordinary variable, so changing i changes the test. Python’s for takes the next value from `range()` each pass, so changes to i inside the body are overwritten.',
    mistake: 'Saying “Python makes i read-only” or “Python copies i”. Python does let you change i; the change simply gets overwritten by the next value from range.',
    tryIt: { q: 'What does each loop print?', code: '# Python\nfor i in range(5):\n    print(i)\n    i += 10\n\n/* C */\nfor(i = 0; i < 5; i++){\n    printf("%d ", i);\n    i += 10;\n}', a: 'Python: `0 1 2 3 4` (range ignores the change). C: just `0` (i becomes 10, then 11, and 11 < 5 fails).' },
  };

  H['l10-other-loops'] = {
    asks: 'Name the three things every logical loop (`while`, `do … while`) has to contain.',
    idea: 'A counted `for` keeps start, test and step together in its header. A `while` makes you place all three yourself, which is why it is considered harder to write: forget one and the loop breaks.',
    steps: [
      { text: 'Find the three parts in this loop (it ends with n = 64 after 6 passes):', code: 'int n = 1;           /* 1. initialization */\nwhile (n < 50) {     /* 2. stopping condition */\n    n = n * 2;       /* 3. progress toward it */\n}' },
      'Without 1, the test reads a garbage value. Without 2, there is no loop. Without 3, the condition never changes, so the loop runs forever.',
      'In a `for` the same three sit in the header: `for (i = 0; i < 10; i++)`.',
    ],
    answer: 'Initialization of the variable(s); a stopping condition; a way to get the variables to the stopping condition.',
    mistake: 'Listing “a body” or “a counter”. The third item is progress: something in the loop must move the variables toward making the condition false.',
    tryIt: { q: 'What is missing, and what happens?', code: 'int i = 0;\nwhile (i < 5) {\n    printf("%d", i);\n}', a: 'The progress step: `i` never changes, so `i < 5` stays true and it prints 0 forever. Add `i++;` in the body.' },
  };

  H['l10-break-continue'] = {
    asks: 'Explain `break` and `continue`, and how Java leaves an outer loop from inside an inner one.',
    idea: 'Java removed `goto` but kept the useful, tame jumps. Each jumps only to a fixed, nearby place: `break` to just after the loop, `continue` to the loop’s next pass.',
    steps: [
      '`break` exits the closest enclosing loop (or switch) and goes to the statement just after it.',
      '`continue` skips the rest of this pass and returns to the top of the closest loop: its next iteration.',
      { text: 'Both in one loop (prints `0 1 3`):', code: 'for (i = 0; i < 6; i++) {\n    if (i == 2) continue;   /* skip printing 2 */\n    if (i == 4) break;      /* stop the loop at 4 */\n    printf("%d ", i);\n}' },
      { text: 'A plain `break` inside the inner loop only stops the inner loop. To stop both, label the outer loop and break to the label:', code: 'outer:\nfor (int r = 0; r < 3; r++)\n    for (int c = 0; c < 3; c++)\n        if (found(r, c)) break outer;   // leaves BOTH loops' },
    ],
    answer: '`break` exits the closest loop or switch; `continue` goes to the next iteration of the closest loop. To exit an outer loop, use a labelled break.',
    mistake: 'Thinking `continue` restarts the loop from the beginning (i = 0 again). It only skips to the next pass, so `i++` still happens.',
    tryIt: { q: 'What does this Java print?', code: 'outer:\nfor (int r = 0; r < 3; r++)\n    for (int c = 0; c < 3; c++) {\n        if (c == 1) continue;\n        if (r == 1 && c == 2) break outer;\n        System.out.println(r + "," + c);\n    }', a: '`0,0` `0,2` `1,0`, then nothing more. c = 1 is always skipped, and at r = 1, c = 2 the labelled break leaves both loops.' },
  };

  H['l10-foreach'] = {
    asks: 'Explain how a for-each loop works and divide the work: what the library author writes, and what the user writes.',
    idea: 'Someone has to know how to walk through the data: where am I now, and what comes next? The library author writes that once (the iterator). After that, every user just says “for each element” and never thinks about positions.',
    steps: [
      'The library creator implements an iterator (in Java: the class implements `Iterable`). The iterator remembers the current element and knows how to move to the next and when there are none left.',
      { text: 'A tiny iterator written by a “library author” in Python (it remembers `cur` between calls):', code: 'class Countdown:\n    def __init__(self, start): self.cur = start\n    def __iter__(self): return self\n    def __next__(self):\n        if self.cur <= 0: raise StopIteration\n        v = self.cur; self.cur -= 1; return v' },
      { text: 'The user gets the loop for free (this prints `3 2 1`):', code: 'for n in Countdown(3):\n    print(n)' },
      'Built-in collections already come with iterators: Python’s `for weather in myList:` and Java’s `for (String weather : myList)` both use the list’s own.',
    ],
    answer: 'The library creator implements an iterator (`Iterable` in Java): code that tracks the current element and moves to the next. The user then gets the for-each loop for free.',
    mistake: 'Saying the user writes the iterator, or that for-each is just a counted loop with an index. The point is that the user never sees positions; the data type’s own code handles them.',
    tryIt: { q: 'You write a `Playlist` class and want users to be able to write `for song in playlist:`. Whose job is it to track the current song, and what must that code be able to do?', a: 'Yours, as the library creator: write an iterator that remembers the current position, moves to the next song, and signals when there are no more. Users then just write the for-each loop.' },
  };

  // ---------- Argue a design ----------

  const argueSteps = [
    'An argument earns the marks by its structure, not its side. You need four things: a side, the criterion it rests on, a concrete code example, and the trade-off.',
  ];

  H['x-argue-goto'] = {
    asks: 'Take a side on whether a language should include `goto`, and defend it like a language designer.',
    idea: 'Every design argument is a trade between the course criteria: readability, writeability, reliability, cost. Goto is the classic case: maximum power, worst readability.',
    steps: argueSteps.concat([
      'Side and criterion: “No goto, for readability (and so reliability).” Control structures give a top-to-bottom read; goto can jump anywhere, into or out of the middle of structures.',
      { text: 'Concrete example: a backward goto hides a loop. You only see it is a loop when you find the label.', code: 'int k = 0;\nL7: printf("k=%d ", k);\n    k++;\n    if (k < 3) goto L7;   /* surprise: this was a loop */' },
      'Trade-off: goto is sufficient for everything, and sometimes the clearest way out of nested loops or to shared cleanup code in C. Java covers those uses with `break`, `continue` and labelled break, so little is lost.',
      'Her question, “is the goto the problem, or the programmer?”, is the other side’s best line: careful, downward-only gotos can be readable. Either side is fine if it is argued.',
    ]),
    answer: 'Model answer: No. Criterion: readability and reliability. goto lets control jump into and out of the middle of structures, so the program can no longer be read top to bottom (a backward `goto L7;` makes the flow a puzzle). Trade-off: goto is sufficient for everything and sometimes the clearest exit from nested loops or jump to cleanup code; Java covers those with break, continue and labelled break. Either side earns marks if justified.',
    mistake: 'Writing “goto is bad because Dijkstra said so” or “goto is bad practice” with no criterion and no example. Name the criterion, show code, and admit what the other side gains.',
    tryIt: { q: 'Argue: should a language allow jumping INTO the middle of a loop (multiple entry)?', a: 'Model: No. Criterion: readability/reliability. `goto inside;` into `for (i = 0; i < 9; i++) { inside: … }` with i = 7 skips the `i = 0` start, so the loop runs for i = 7 and 8 only: you cannot understand the loop from its header. Trade-off: some flexibility for rare clever code is lost, but Sebesta notes multiple entries add little flexibility relative to the loss in readability.' },
  };

  H['x-argue-fallthrough'] = {
    asks: 'Take a side on whether a switch should fall through to the next case by default, as C’s does, and defend it.',
    idea: 'Fall-through is a trade of reliability for flexibility. The question is which you value more, and whether you can keep the flexibility some safer way.',
    steps: argueSteps.concat([
      'Side and criterion: “No fall-through by default, for reliability.” A forgotten break gives no error; it silently runs the next case.',
      { text: 'Concrete example: with val = 1, both x and y go up.', code: 'switch (val) {\n   case 1: x++;      /* forgot break */\n   case 2: y++;\n}' },
      { text: 'Trade-off: fall-through lets several values share code:', code: 'case \'a\': case \'e\': case \'i\': case \'o\': case \'u\':\n    vowels++;\n    break;' },
      'Then show you can keep the good part: C# allows stacked labels with no code between them, but requires every segment with code to end in `break` or `goto`.',
    ]),
    answer: 'Model answer: No. Criterion: reliability. A forgotten break silently runs the next case: `case 1: x++; case 2: y++;` increments y when the value is 1. Trade-off: fall-through lets several values share code (`case \'a\': case \'e\': vowels++; break;`). C# keeps that with stacked labels but requires every segment with code to end in break or goto. Either side earns marks if justified.',
    mistake: 'Only saying “fall-through causes bugs”. Show the code that goes wrong, and give the other side its due: shared code for several values is a real benefit.',
    tryIt: { q: 'Argue: should a switch with no matching case and no default silently do nothing, as C’s does?', a: 'Model: No. Criterion: reliability. If a new value 4 is added but no `case 4:`, the switch skips it with no error and the bug hides. Alternative: make an unmatched value an error (Sebesta: the choice is between disallowing the situation and doing nothing). Trade-off: writeability, since you would have to write a `default` you do not need in every switch.' },
  };

  H['x-argue-intcond'] = {
    asks: 'Take a side on whether an `if` should accept an integer condition (C) or only a boolean (Java), and defend it.',
    idea: 'This is the design issue “form and type of the control expression”, argued. Integer conditions make code shorter; boolean-only conditions let the compiler catch a classic bug.',
    steps: argueSteps.concat([
      'Side and criterion: “Boolean only, for reliability.” The compiler can then reject conditions that are not really tests.',
      { text: 'Concrete example: legal C, always true (favNum is 5), whatever the user typed. In Java, a compile error.', code: 'if (userNum = favNum)   /* C: compiles, true */\n                        // Java: int cannot be converted to boolean' },
      { text: 'Trade-off: writeability. C programmers use integer tests as short idioms:', code: 'while (*endString) …   /* until the \'\\0\' at the end of the string */\nif (count) …           /* if count is not zero */' },
    ]),
    answer: 'Model answer: Boolean only. Criterion: reliability. In C, `if (userNum = favNum)` compiles and is true for any nonzero favNum; in Java it is a compile-time type error. Trade-off: writeability: C idioms like `while (*endString)` and `if (count)` are shorter. Either side earns marks if justified.',
    mistake: 'Arguing about style only (“booleans are cleaner”). Tie it to a criterion and show the actual bug the rule prevents.',
    tryIt: { q: 'Argue: should every `if` clause be required to use braces, as in Perl?', a: 'Model: Yes. Criterion: readability/reliability. Without required braces, `if (x > y) if (count == 0) result = 0; else result = 1;` needs the closest-if rule, and the indentation can lie about which if owns the else. With mandatory braces the pairing is always visible. Trade-off: writeability, more typing for one-line bodies.' },
  };

  H['x-argue-assignexpr'] = {
    asks: 'Take a side on whether assignment should be an expression with a value (C) or only a statement, and defend it.',
    idea: 'If assignment has a value, it can hide inside other expressions, conditions included. That enables compact idioms and also the `=` versus `==` bug.',
    steps: argueSteps.concat([
      'Side and criterion: “Statement only, for reliability.” An assignment that cannot appear inside a condition cannot be mistaken for a comparison.',
      { text: 'Concrete example: looks like a comparison, is an assignment, and is true for any nonzero favNum.', code: 'if (userNum = favNum) …' },
      { text: 'Trade-off: writeability. These compact idioms need assignment to have a value:', code: 'a = b = 0;                        /* chain: b = 0 has value 0 */\nwhile ((c = getchar()) != EOF) …  /* read and test in one line */' },
      'Python shows the statement-only choice: `if x = 5:` is a syntax error there.',
    ]),
    answer: 'Model answer: Only a statement. Criterion: reliability. `if (userNum = favNum)` is legal C and is true for any nonzero favNum, a bug that looks like a comparison. Trade-off: writeability: `a = b = 0;` and `while ((c = getchar()) != EOF)` are compact idioms that need assignment to have a value. Either side earns marks if justified.',
    mistake: 'Confusing this with the integer-condition argument. Here the question is whether `=` produces a value at all; the integer-condition question is what types a condition may have. They are two separate design choices that together make the bug possible.',
    tryIt: { q: 'Argue: should `++i` be allowed inside larger expressions, as in `sum = ++i + j`?', a: 'Model: No. Criterion: readability. `for(i = 0, j = 2; i < 10; sum = ++i + j, j *= 2);` needs a trace table to read because i changes in the middle of computing sum. Trade-off: writeability: compact loops and expressions are shorter to write, and C programmers know the idiom.' },
  };
})(globalThis.FC = globalThis.FC || {});
