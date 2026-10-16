# Learning plan: CSC 370 and CSC 325 (for the owner's approval)

Date: 2026-10-16. Status: **PLAN, NOT BUILT.** Nothing below exists in the app yet. Every item names its evidence; the full sources are in:

- `research/01`–`03`: earlier reports on spacing, formats and CS learning
- `research/04-item-writing-and-study-strategies.md`: how to write cards; grading; sessions
- `research/audit-csc370-cards.md`: all 313 CSC 370 cards, one by one
- `research/audit-softtest-cards.md`: all 428 CSC 325 cards, one by one

## The short version

1. **The cards test knowing the course, not doing it.** Her C exam is 32 marks: 18 for memory diagrams with pointers, 11 for writing a pointer function, 3 for malloc/free. The deck has 0 cards on any of that. Tibo's lectures are computations (coverage, prime paths, partitions, mutation), and every one of those cards reuses the same 2–3 programs. After one pass you would be remembering "5/7", not computing it. **The biggest change is practice problems that are new every time.**
2. **About 40% of the cards need fixing:** 138 of 313 in CSC 370 and 169 of 428 in CSC 325. Mostly they are slide fragments, duplicates, oversized lists or trivia. 15 are wrong or contradict another card.
3. **Self-grading is the weakest link.** Students give themselves credit for wrong answers about 42% of the time, against 18% for an automatic scorer. Ticking each key point separately cuts that a lot. The app currently asks a single "Got it / Missed it".
4. **Your study habit matters as much as the app.** Do short daily sessions, learn in the evening and relearn the next morning, start each lecture's cards the day it's taught, and switch to exam-format practice in the last week.

---

## Part 1 — How to study (habits, not app features)

| Do | Why (evidence) |
|---|---|
| A short, fixed daily session that always ends: about 20–30 min, with the due load kept under that | No study sets an ideal length. A session you'll actually start beats a long one you avoid. (R4 rule 22) |
| Learn new cards in the evening; do the first relearning the next morning | Sleeping between learning and relearning halved the practice needed and improved retention at 1 week and 6 months (Mazza 2016) (R4 rule 24) |
| Start a lecture's cards **the day it is taught**, then keep relearning | Successive relearning in real courses raised exam scores by at least 10% (Rawson 2013; Janes 2020) (R1, R4 rule 25) |
| Last week before an exam: mixed practice in the exam's own format | Practice transfers best when it matches the test's response format (Pan & Rickard 2018) (R4 rule 2) |
| Never trade sleep for a late review | Students who cut sleep to study had more trouble understanding class the next day (Gillen-O'Neel 2013) |
| Don't reread slides as "studying" | Rereading gives little or no benefit (Callender & McDaniel 2009; Dunlosky 2013) |
| Expect mixed sessions to feel harder; that's the point | Interleaved practice feels worse but tests 50–125% better (Rohrer 2020; Samani & Pan 2021) |
| Mix 370 and 325 only if it helps you start | Alternating unrelated courses neither helps nor hurts (Hausman & Kornell 2014) |
| Ignore "visual learner" etc. | There's no evidence learning styles exist in the way people use them (Pashler 2008) |

---

## Part 2 — Fix the existing cards

### CSC 370 (audit: 138 of 313 flagged)
- **Fix 5 wrong answers:**
  - the ambiguous-grammar definition;
  - "COBOL hardly influenced other languages" (it contradicts 2 other cards);
  - the Fortran 77 "lowercase letters" guess;
  - the invented Algol badge text, which should be labelled as unknown;
  - why static variables rule out recursion.
- **Slide fragments → real definition cards.** Merge the ~50 one-phrase blanks into about 20 definition cards. Example: the 6 orthogonality/simplicity fragments become "What makes a language simple? What is orthogonality?", graded point by point. Research says fill-in-the-blank cards don't transfer to new questions (Hinze & Wiley 2011), so every concept also gets a question card. (R4 rules 1, 6)
- **Lists:** "name at least 4 of 12" cards can't be graded. Replace each with one card for the whole fixed-order list plus one card per item, weighted toward the middle items, which are recalled worst. (R4 rule 5)
- **Order cards that give the answer away:** the derivation tiles can be sorted by string length alone. Turn them into written derivations. (Audit fix 3)
- **Cards that say "that code"** while the code is on a different card: put the code on each card. Sessions are shuffled now, so the other card may not have come first.
- **History:** it's 35% of the deck. Drop 13 number/name/year cards, merge the 4 ENIAC cards and 3 lifetime-definition duplicates, and keep each story's lesson. That takes it from 109 to about 70 cards.

### CSC 325 (audit: 169 of 428 flagged; no arithmetic errors)
- **Remove about 40 more duplicates** left over from slides that repeat across lectures; merge 15 more.
- **History: 76 → about 25 cards.** Keep each story's lesson ("why did CrowdStrike reach every customer?") and drop the numbers (Pokémon slot counts, Google TAP percentages, Mark II weight).
- **Split the 52 oversized cards** (5+ parts). Convert 5 risky typed answers to multiple choice, and fix 8 multiple-choice items whose correct option is much longer than the others.
- **Add notes to 5 slide inconsistencies.** Example: the slides' availability formula conflicts with their own MTBF diagram. Keep the slide's answer, since the exam follows the slides.
- **Regroup 87 subgroups into 12 topics plus an optional History group:**
  - Why test
  - Fault/error/failure & RIPR
  - Test anatomy/JUnit/TDD
  - Dependability
  - Where bugs hide & flaky tests
  - Bug reports
  - Partitions/boundaries/combinations
  - Adequacy criteria
  - Graph coverage
  - Mutation
  - Test doubles & Mockito
  - AI agent harness

## Part 3 — New kinds of practice (the big change)

### 3a. Problems that are new every time (generated, with answers checked by a solver)
A procedural card that shows the same program every time turns into a fact card. Varied practice improves long-term retention and transfer (Schmidt & Bjork 1992; Paas & van Merriënboer 1994). (R4 rules 10, 21)

| Course | Generated problem | Answer checked by |
|---|---|---|
| 325 | Small function → control-flow graph → node / edge / edge-pair / prime-path counts; min tests; coverage % of a given suite | In-app solver, tested like `verify` |
| 325 | Spec (range, string rule, two-field rule) → equivalence classes and boundary values | Solver; needs a new "set" grader (any order) |
| 325 | Function + test suite + mutant → killed? Give a killing input; mutation score | Solver runs the JS function and the mutant |
| 325 | Fault + input → reaches? infects? propagates? | Solver |
| 325 | Availability: forward, inverse ("what MTTR for 99.9%?"), downtime per year | Formula |
| 370 | New program → output under static AND dynamic scoping; static parent / ancestors | Interpreter for a tiny language, both scoping rules |
| 370 | Grammar + string → derive, or show it can't be derived; is it ambiguous? | Parser in the app |
| 370 | C pointer traces like her exam (`*p += 3`, `swap(&a,&b)`, `p = &q` inside a function, `arr + 2`) | A bank of ~150 programs generated offline, each verified by gcc |

### 3b. Exam-format practice that's missing entirely
- **C exam (32 marks):** draw the stack after line N, as a table of name, value and arrow, graded on her marking points. Plus "write `length(char *s)` with pointers only" against her reverseString rubric.
- **Write a grammar** from a new spec each time (24-hour times, binary numbers, …). **Show that a grammar is ambiguous, then rewrite it** for precedence or associativity.
- **Argue a design choice:** 8 new prompts, all graded on one rubric (takes a side · names a criterion · gives a code example · admits the trade-off). Prompts: should a language have goto? should switch fall through? int conditions? dynamic scope? max name length? reserved words? nested functions? assignment as an expression?
- **Tokenize a whole statement**, and "how does the compiler know x is a variable?" (Translation pre-test Q2e)
- **325 fixed banks:** rewrite this bad bug report; scenario → which test double + the Mockito line; flaky test → cause + fix; spec → 4 test cases written test-first.

### 3c. Worked example → faded → solve, for each procedure
Show a full worked solution, then the same kind of problem with one step hidden, then two, then a fresh problem. Medium effect on problem solving (g = 0.48, Barbieri 2023). Fading plus naming the rule behind each step helps transfer (Atkinson 2003). Fade fast: you're a 3rd-year, and worked examples stop helping as skill grows (expertise reversal). (R4 rules 9, 12)

### 3d. Example cards and mixed "which method?" sets
- "Here's an example: which concept is it?" cards, with examples of different concepts mixed together (d = 0.30–1.67; Rawson 2015). For 325: "returns canned answers, records nothing: stub, mock, fake or spy?"
- Within each course, mixed sets: "static or dynamic scope?", "which binding time?", "which coverage criterion does this suite satisfy?". (R4 rules 8, 11)
- 325 cards aimed at what testing students measurably get wrong: high coverage still missing bugs, boundaries, exception partitions, and black-box from the spec only, never the code. (R4 rule 14)

## Part 4 — App changes

1. **Grade point by point.** Recall cards show a checkbox per key point ("did your answer say this?"), and the app decides Got it / Missed it. If you mark something as covered but your typed answer doesn't mention its key word, it asks "Are you sure?". (R4 rules 15, 16)
2. **Generator framework:** a card can be a recipe that builds a fresh problem, plus a solver that computes the answer, unit-tested the same way trace answers are. Includes a "set" grader for any-order answers.
3. **Honesty display:** "When you said Sure on cards you'd seen before, you were right X%." The data is already being collected. (R4 rule 17)
4. **Exam mode:** when a class's exam date is set, the last 7 days add mixed sets in that exam's format, and History is off by default.
5. **Time-based sessions:** pick "20 minutes" instead of a number of new cards. Show the review load tomorrow will bring, so it never balloons.
6. **"Report this card" button:** flags a card as wrong or unclear and saves it in a list I fix next session. It is not a suspend button, because letting you drop cards early hurts retention (Karpicke 2009).

## Part 5 — Order of work

| Phase | What | Why first |
|---|---|---|
| 1 | Fix the 15 wrong answers; point-by-point grading; dedupe and trim History; C exam pointer and memory-diagram cards (gcc-verified bank); the "argue a design" set | Highest value and fastest; the C exam has 32 marks and no cards |
| 2 | Generator framework + 325 generators (graph coverage, partitions/boundaries, mutation) + 370 generators (scope traces, derivations) | The biggest learning gain, but more to build |
| 3 | Merge the 370 blanks into definition cards; regroup 325 topics; worked → faded sequences; honesty display; exam mode; time-based sessions; report button | Polish and long-term features |

## Decisions I need from you

1. **History cards:** cut to the lessons, about 70 cards for 370 and 25 for 325 (my recommendation), or keep everything but switch History off by default?
2. **CSC 370 slide blanks:** merge the ~50 one-phrase blanks into ~20 definition cards (my recommendation), or keep every blank?
3. **Missing material:**
   - Do you have CSC 370 lectures 6–9, or any Scheme/Prolog material?
   - Any CSC 325 quizzes or exams, so cards can match how Tibo asks?
   - Lecture 13 says decision coverage, condition coverage and MC/DC come next time. Send that lecture when you have it.
4. **Exam dates** for both classes. They drive spacing and exam mode.
5. **Daily time** you'll realistically give this, e.g. 20 minutes. It sets the session size.
