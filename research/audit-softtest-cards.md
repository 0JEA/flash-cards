# Audit: AUCSC 325 Software Testing deck (428 cards)

Audited 2026-10-16. Source: `FC.decks.softtest.cards` as the app builds it (`decks/softtest-{a,b,c}.js` plus `decks/softtest.js`, which already drops the 22 ids in `DUPLICATES`). I checked the cards against the slide text (`pdftotext -layout` of `/home/coke/Downloads/{01..14}*.pdf`). For the availability slide I rendered L5 p.12 as an image. The Kidwell PDF's text layer uses a +29 character shift, so I decoded it before checking. Learning criteria come from `research/01-03`.

**Not touched:** no deck file was edited. This report is the only file written.

Reproduce the card dump:
```
cd /home/coke/flash-cards && node -e 'for (const f of ["softtest-a","softtest-b","softtest-c","softtest"]) require("./decks/"+f+".js"); console.log(FC.decks.softtest.cards.length)'   # 428
```

## Read this first (what is wrong, in order of harm)

1. **Five cards teach something that is wrong, or that conflicts with another card** (details in Fix 1):
   - The availability formula contradicts the slide's own MTBF diagram.
   - The slides list 7 prime paths for `foo`, but the card correctly says 6.
   - On the slide, MC/DC is credited with observability that MC/DC does not guarantee.
   - The "analyse a defect" order card contradicts the "first thing = reproduce" card.
   - Two different definitions of "test case" are taught without saying how they relate.
2. **The deck is mostly about knowing the course, not doing it.** 48 cards carry code, but they come from only 20 snippets. Every coverage, prime-path and reachability computation reuses one of three programs (`arePositive`, `foo`, the "river" function), so after one pass the learner is recalling answers, not computing them. No card asks the learner to partition a new spec, build a CFG, write a bug report, or name a mutant-killing input for new code.
3. **About 18% of the deck is History & stories (76 cards)**, and about half of those test numbers (Pokémon slot counts, TAP percentages, Mark II floor area, Edison's device).
4. **Duplicates remain after the `DUPLICATES` filter**: 55 cards are duplicates or near-duplicates, and about 40 of them can simply be deleted (L4/L5 dependability, L3/L7 left-pad, the L14 "harness" summary cluster, kinds-of-doubles).

## Summary

Counts are tallied by script from the per-card table below. One card can carry several codes.

| Problem type (rubric #) | Cards | Notes |
|---|---|---|
| 1. Unclear cue (CUE) | 4 | vague "guidance / key understandings / goals vs properties" prompts |
| 2. One-right-answer risk (ONE) | 16 | ranges or phrases typed (`15-50`, `45 to 90 days`, `2-16%`, the MC/DC name, "try to reproduce it"); missing accept variants (`8,538`, `80`, `4/5`, date forms) |
| 3. Not standalone | 0 | screenshots and demos are described well enough in the card |
| 4. Too big (BIG: ≥5 parts or >350 chars) | 52 | 33 recall cards have ≥5 points, 27 have answers over 350 chars (the groups overlap) |
| 4. Trivially small (TINY) | 2 | `st2-trillions`, `st8-mockito-name` |
| 5. Type fit / weak MC options (TYPE) | 16 | correct option strictly longest in 28/92 MC (30%, the ceiling `research/02` sets); 8 with a big gap; 5 with absurd distractors |
| 6. Low value / trivia (VAL) | 65 | 58 of them in History & stories |
| 7. Accuracy / internal conflict (ACC) | 13 | 5 distinct issues (Fix 1) spread over 13 cards. No arithmetic errors. |
| 8. Duplicate / near-duplicate (DUP) | 55 | after the existing `DUPLICATES` filter |

**169 of 428 cards (39%) have at least one problem.** Recommended actions:
- Drop 74 cards outright, plus about 10 more marked "optional".
- Trim, split, merge or rewrite about 75.
- Convert 5 typed cards to MC.
- Add notes or accept variants to 14.

**The other 259 cards need no change.**

**Every computation re-checked by hand (all correct):**
- River counts: 10 / 8538 / 6 / 4 / 1452, 99.9%, 14%
- Coverage levels: 5/7 and 4/6
- Edge-pairs: 8. Complete paths: 4
- Prime paths: 6. Minimum tests: 2. `foo(2)` prints twice
- Mutation score: 80/(120−20) = 0.8
- Availability: 0.95 and 0.8
- Font-effect combinations: 2^7 = 128 and 3·3·3·2 = 54
- 2^31−1 and the 2038-01-19 03:14:07 rollover
- `Integer.MAX_VALUE + 1`, 1 − 2 in 8 bits = 255, and 186·3·0.8 = 446

**Overall verdict:** the cards match the slides, and the scenario cards are good: numZero, Zune, river, the choosing-a-double scenarios, the flaky-test diagnoses and is_bigger. Trimming won't fix the deck. It needs (a) the accuracy notes, (b) about 85 fewer cards, and (c) generated problem sets for the six computational skills the exam will test. Flashcards can't supply those.

## The 10 most important fixes

1. **Fix the five accuracy and conflict problems** (add a `why` note. Don't silently change slide-faithful answers, because the exam follows the slides):
   - `st4-availability-formula`, `st5-failure-timeline`, `st5-mtbf-span`, `st4-availability-calc`, `st5-avail-calc-80`: the L5 p.12 diagram defines MTBF as first failure → second failure, which equals MTTD + MTTR + MTTF. Under that definition, the slide formula A = MTBF/(MTBF+MTTR) counts repair time twice. The standard formula is A = MTTF/(MTTF+MTTR) = MTTF/MTBF. Note to add: "On the exam use the slide formula, reading MTBF as uptime. Textbooks write MTTF/(MTTF+MTTR)."
   - `st13-prime-list`, `st13-prime-count`, `st13-not-prime-mc`: slides 22–24 list `[N4,N2,N5]` among foo's prime paths (7), but slide 25 tours only 6. The card's 6 is correct by definition, since `[N4,N2,N5]` is a sub-path of `[N3,N4,N2,N5]`. Add a note that the slide list includes it by mistake, so the learner isn't thrown by it on the exam.
   - `st10-observability-measures`: the slide names MC/DC, but plain MC/DC only requires each condition to independently affect the decision. It does not require the effect to reach the output. Observability is what *Observable* MC/DC (OMC/DC, from lecture 4) adds. Keep the slide answer and add this note.
   - `st6-analyse-order` vs `st6-first-thing`: the order card puts "Find the root cause" first, while the other card (quoting the same slide) says "the first thing to do is to try to reproduce". The slide lists bullets, not a strict sequence. Drop the order card, or convert it to recall: "list the four analysis activities".
   - `st2-test-case-def` (test data + expected output, L2/L3) vs `st9-test-case` (inputs + execution conditions + pass/fail criterion, L9): add a shared note saying the L9 definition is the formal one, and an expected output is one kind of pass/fail criterion.
2. **Build generated practice for the six computational skills** (specs in "Coverage gaps"): boundary values and equivalence classes; CFG to node/edge/edge-pair/prime-path coverage; coverage level of a suite; mutant killed or not, plus a killing input; RIPR for a given input; availability. Use fresh numbers and programs every time. The fixed computation cards (river ×7, arePositive ×8, foo ×10) then become worked examples, not the practice itself.
3. **Cut History & stories from 76 to about 25 cards.** Keep the card that carries each story's lesson. Drop every card whose answer is only a number, date, name or device (list in the table), and default the category to off in exam mode. Treat the Kidwell reading as optional unless the syllabus examines it: keep 6 of its 23 cards (`stp-author`, `stp-hopper-1953`, `stp-wilkes`, `stp-brooks`, `stp-functions`, `stp-first-published-nuance`).
4. **Delete the remaining duplicates** (about 40 of the 55 flagged; the rest merge, all listed in the table):
   - L5 copies of the L4 dependability classifications (`st5-avoidance-mc`, `st5-tolerance-mc`, `st5-removal-mc`, `st5-forecasting-mc`, `st5-testing-place`, `st5-why-metrics`)
   - The L7 left-pad cards
   - `st2-oracle-mc`, `st12-spec-steps`, `st8-kinds`, `st8-spy-real`
   - The L14 summary cluster: `st14-core-question`, `st14-anatomy`, `st14-five-things`, `st14-shift`
   - These can go straight into the existing `DUPLICATES` set in `decks/softtest.js`.
5. **Convert the risky typed cards to MC or recall, and add missing accept variants:**
   - To MC: `st6-bug-density` (range), `st7-disclosure` (range), `st6-first-thing` (phrase), `st4-mcdc-name` (slash and spacing variants fail, e.g. "Modified Condition / Decision Coverage")
   - Drop: `st7-tap-compute`
   - Add accept variants: `st10-river-s1s2` ("8,538"), `st4-ms-calc` and `st5-avail-calc-80` ("80", "4/5"), `st4-availability-calc` ("95", "19/20"), `stp-moth-date` and `st4-2038-date` ("September 9th, 1947", "January 19th 2038"), and `st8-when-then` ("when(), thenReturn()", "when,thenReturn").
   - `grade.js` only folds case and whitespace and drops one trailing period, so commas, ordinals and slash spacing all fail.
6. **Split or trim the 43 oversized cards.** Rule: at most 4 points, and each point is something the learner would actually retrieve. Worst cases:
   - `st1-why-testing` (513 chars), `stp-oed`, `stp-quadruplex`, `st1-opt-pess`
   - `st10-quasi` / `st10-equivalence-class` (merge these two)
   - `st9-obligation-sources`, `st9-unsatisfiability`, `st8-kinds`, `st4-measures`, `st4-do178b-levels`
   - For list cards the learner should know in full (error-prone aspects, effective-report traits), grade "≥5 of 7" in `points` instead of all-or-nothing.
7. **Repair the weak MC items:**
   - Length cue (correct option much longer than any distractor): `st7-missing-2` (48 vs 20 chars), `st7-flakey-date` (33/16), `st13-myth2-mc` (38/18), `st3-tdd-mc` (65/49), `st6-janet-fix`, `st6-duplicate-scenario`, `st9-smoke`, `st14-evidence-mc`
   - Absurd distractors: `st1-lotcheck` (DO-178B, mutation score), `st3-leftpad-react` (JUnit/Selenium/Log4J as "web frameworks"), `st3-tdd-mc` ("every mutant becomes stillborn"), `st4-research-mc`, `st6-duplicate-scenario` ("report it publicly with exploit code")
   - `st12-attribute-kind` leaves out the one real near-miss ("a configuration").
8. **Add two fixed exercise banks that the slides call for and the deck lacks:**
   - (a) "Rewrite this bug report": 6–10 bad reports, self-graded against the effective-report checklist. Today only `st7-missing-1` and `st7-missing-2` touch this, and only by classifying.
   - (b) "Which double, and write the Mockito line": about 20 rotating scenarios covering when/thenReturn, verify+times/never, inOrder and spy. Today there are 6 scenarios and no card where the learner writes the code.
9. **Regroup the 87 subgroups into 12 topics plus an optional History category** (see "Proposed regrouping"):
   - 43 subgroups have ≤3 cards and 11 have exactly 1, so toggling them is meaningless.
   - Four subgroup names exist under two categories each: "Flakey tests", "Mockito basics", "Adequacy criteria", "RIPR model".
10. **Fill the core concept gaps the slides cover but the deck only defines.** Each needs one applied card:
    - Reliability vs availability as an MC scenario (only definitions exist)
    - Spotting an equivalent mutant in new code (only the commutative `sqrt + newGuess` example)
    - Statement vs branch coverage on a new if-without-else
    - An off-by-one relational fault with "give the smallest input that reveals it"
    - A float-tolerance JUnit assertion (`assertEquals(expected, actual, delta)`), written rather than recalled

## Coverage gaps and suggested exercise types

The slides' applied skills, and whether the deck practises them:

| Skill (lecture) | In deck today | Gap | Exercise type | Generated or fixed |
|---|---|---|---|---|
| Equivalence classes for a spec (L10, L12) | postal code, reverse, font size (3 specs, fixed) | Never a fresh spec | "Spec → list valid/invalid classes"; "input → which class?" (MC) | **Generated**: templates for an int range (inclusive/exclusive), string length + charset, two-field rule (age × membership → price) |
| Boundary values (L2, L6, L12) | `st12-font-size-boundary`, Zune, is_bigger | No BVA on new ranges; no off-by-one code | "Range [a,b] → the 6 BVA values" (needs an order-insensitive *set* grader); "`if (x > 17)` vs spec 'age ≥ 18': smallest revealing input" (typed) | **Generated** |
| Category-partition counting (L12) | `st12-font-128`, `st12-font-constraint-count` | Only the font example | "k categories with sizes, 'at most one of' / single / error marks → how many test frames?" (typed) | **Generated** |
| Pairwise (L12) | definition MC only | No construction | "3 boolean parameters: give a 4-test pairwise suite" (recall, self-check that every pair appears) | Fixed (3–4 cards) |
| CFG from code (L13) | CFG always given | Never drawn | "Number the nodes and list the edges" for a 5–8 line snippet (recall); "how many edges?" (typed) | **Generated** from a small grammar (seq / if / if-else / while / early return) |
| Node/edge/edge-pair/complete-path counts, min tests (L13) | arePositive ×8, foo ×10 | Same two graphs | Typed counts + "coverage level of this suite" as a fraction | **Generated** |
| Prime paths (L13) | foo only | Same graph | "List the prime paths" (recall) + "how many?" (typed) + "min tests to tour all?" on graphs with one loop | **Generated** |
| Statement/branch coverage of a suite on code (L4, L13) | none beyond arePositive | — | "Given f and inputs {…}: statement %, branch %" (typed) | **Generated** |
| Mutation: mutant killed? killing input? score (L4) | one score calc, one generic "+ → − survived" card | No concrete code + suite + mutant | "f, suite, mutant (ROR/AOR/constant) → killed? If not, give a killing input" and "is this mutant equivalent?" | **Generated** (mutate a relational/arithmetic op in a generated function) |
| Reachability / infection / propagation (L10) | river ×7 (fixed), numZero ×4 | Same two programs | "Fault + input → reaches? infects? propagates?" (3 yes/no); small-domain river counts (x, y in 0..9) | **Generated** |
| Fault vs error vs failure on new code (L1) | numZero only | — | Buggy variant + input → error? failure? | **Generated** (numZero-style templates: off-by-one start/end, wrong operator) |
| Availability (L4/L5) | 2 fixed calcs | No inverse or nines | Forward calc; inverse ("MTTR for 99.9% given MTBF"); downtime per year | **Generated** |
| Choosing a test double (L8) | 6 scenarios + 3 Mockito-role MC | No code writing | Scenario → double + the Mockito line | Fixed bank of ~20, shuffled |
| Bug reports (L6/L7) | classify-only cards | No rewriting | "Rewrite this report" against a checklist; "public issue or private security report?" | Fixed bank of 6–10 |
| Flaky-test diagnosis (L6/L7) | 5 scenarios | Fine, but small | Scenario → cause (concurrency / timing / environment) + fix (seed / sequential / tolerance / double) | Fixed bank of ~12 |
| Writing tests first, TDD (L3) | `st3-tdd-radius` | One spec | "Spec → write 4 test cases (input, expected)" | Fixed, 4–6 specs; self-graded |

The research supports this. `03-learning-programming-and-cs-theory.md` (items 1, 6, 7) says tracing and spot-the-bug items, plus interleaving of "which method applies" problems, beat recall flashcards for procedural CS content. `02-card-design-and-format.md` (item 8) says the same of higher-order "derive/why" items over fact cards. Coverage, mutation and partitioning are procedures. Once the inputs repeat, a fixed card stops testing the procedure and starts testing memory of one answer.

Not a gap yet: decision, condition and MC/DC coverage. The L13 slides say "Next time: decision coverage", so add these when that lecture arrives.

## Proposed regrouping

Today there are 87 subgroups, 43 with ≤3 cards and 11 with exactly 1, and four names that appear under two categories. Proposal: 5 categories, 12 study topics, plus History as a separate optional category. Each topic is a sensible unit to toggle before an exam. The counts are today's cards, and the figure in brackets is the estimate after this audit's drops.

| Category | Topic (toggle) | Current subgroups folded in | Cards now (after) |
|---|---|---|---|
| Foundations | 1. Why test, V&V, limits of testing | Why test software, Verification vs validation, Why focus on testing, Testing is incomplete, Optimistic vs pessimistic, Why testing is hard | 22 (14) |
| Foundations | 2. Fault, error, failure & RIPR | Fault/error/failure, Reachability & observability, RIPR model (both copies), Choosing test inputs | 23 (21) |
| Foundations | 3. Test anatomy, JUnit & TDD | Anatomy of a test, Test oracles, Test terminology, Writing test cases, JUnit, Test-driven development | 24 (19) |
| Quality & process | 4. Dependability | Dependability methods/measures, Availability metric(s), Planning for failure, Chaos engineering, DO-178B, DO-178 failure levels | 39 (22) |
| Quality & process | 5. Where bugs hide & flaky tests | Where bugs are, Error-prone aspects, How to test, Flakey tests (both copies), Thinking like a tester, Testability | 40 (31) |
| Quality & process | 6. Bug reports | all of Bugs & reports | 26 (17) |
| Test design (black box) | 7. Partitions, boundaries, combinations | Negative testing, Boundary conditions, Black box vs white box, Partition testing, Equivalence partitioning, Boundary values, Combinatorial testing, Category-partition | 37 (30) |
| Test adequacy (white box) | 8. Adequacy criteria | Adequacy criteria (both copies), Test obligations, Structural testing, Coverage criteria, Coverage challenges, Adequacy scores, Do they work? | 35 (28) |
| Test adequacy (white box) | 9. Graph coverage | White-box basics, Path coverage, Coverage limits, Coverage level, Node & edge, Subsumption, Prime paths, Coverage tools | 38 (34) |
| Test adequacy (white box) | 10. Mutation testing | Mutation testing, Mutation score | 10 (10) |
| Doubles & tools | 11. Test doubles & Mockito | Why/Kinds of doubles, Mocks vs stubs/spies, Choosing a double, Mockito basics (both copies), Mockito verification | 35 (30) |
| Doubles & tools | 12. AI agent harness | Agent harness, Context engineering, Agent loop, Agent permissions, Booking race demo | 23 (15) |
| History (optional, off in exam mode) | H1. Bug of the Day lessons | Bug of the Day, Costly bugs, CrowdStrike, AI and bugs, Discontinuous bugs, Zune, Year 2038 | 49 (~20) |
| History (optional) | H2. Origin of "bug" (Kidwell reading) | Origin of "bug", The Mark II moth, Debugging history | 27 (~7) |

The generated problem sets from "Coverage gaps" should get their own toggle: a "Problems" mode across topics 2, 4, 7, 9 and 10. Interleaving "which technique applies" items is where `research/01` (item 8) and `research/03` (item 7) find the benefit.

## Per-card findings (only cards with a problem)

Codes: **CUE** unclear cue · **ONE** grading risk · **BIG** too big · **TINY** trivial · **TYPE** wrong type / weak MC options · **VAL** low value / trivia · **ACC** accuracy or conflict · **DUP** duplicate.

### Lecture 1 (Intro)

| id | problem(s) | concrete fix |
|---|---|---|
| st1-mark2-specs | VAL | Drop. Floor area and add/multiply times are not testable knowledge; `st1-first-bug-machine` keeps the machine. |
| st1-edison-1889 | VAL | Keep only if the reading is examinable. Otherwise fold "1889" into `st1-allegedly`'s answer and drop. |
| st1-edison-device | VAL | Drop. |
| st1-where-software | BIG, VAL | Drop. A 13-item list whose point is "software is everywhere, including safety-critical systems", which `st1-so-what` already carries. |
| st1-chromium-numbers | BIG, VAL | Rewrite: "Chromium receives ~167 bug reports a day but fixes ~72. What problem does this show, and what does it mean for testing?" → "Reports outpace fixes, so the backlog grows; there isn't the manpower to fix everything, so testing must be prioritised and effective, not exhaustive." 2 points. |
| st1-chromium-reported | VAL | Drop. |
| st1-cost-list | BIG, VAL | Drop. 6 failures × year × cost. |
| st1-mars-orbiter | VAL, DUP | Drop. Keep at most one cost card (`st1-knight`). |
| st1-crowdstrike-cost | VAL | Trim to the lesson: "What does the instructor stress about the CrowdStrike bug?" → "It was a simple missing bounds check, yet it cost billions: bugs don't need to be complicated to be costly, so correct testing is critical." Drop the stock-price figures. |
| st1-mythos | BIG | Trim to 2 points: "found ≠ exploitable (14 of 1,061 confirmed)" and "consider the source: VulnCheck is in roughly the same market as Anthropic." |
| st1-mythos-number | VAL | Drop. |
| st1-so-what | BIG | Trim to 3 points: testing is increasingly important (especially with AI-generated code); there isn't enough manpower to fix everything; failures are costly. `st1-reliability-beyond` already covers the "not just testing" point. |
| st1-vv-techniques | BIG | Rewrite: "Name four V&V techniques other than testing." → code inspection, design discussions, static analysis, runtime verification. |
| st1-why-testing | BIG | Split. (a) "Why is testing the course's focus? Give 3 reasons" (graded 3 of 4: checks the whole system; best for behaviours like performance; documents expected behaviour; needed for customer acceptance / certification). (b) Drop the LotCheck example from the answer. |
| st1-performance | DUP | Merge into the split card above. |
| st1-lotcheck | TYPE, VAL | Drop. The distractors (DO-178B, staggered rollout, mutation score) are not answers to "a game-store certification step". |
| st1-vv-mc | DUP | Drop. Same direction as `st1-verification`; `st1-vv-scenario` is the better MC. |
| st1-correctness-ambiguous | BIG | Reword the cue to "Why can this print True in one environment and False in another, and what testing point does that make?" Cut the answer to 3 points: identity vs equality, small-int cache / per-compilation constants, the expected output itself is ambiguous. |
| st1-opt-pess | BIG | Split. (a) "Optimistic vs pessimistic technique: define each" (2 points: may accept faulty programs / may reject correct ones). The examples are already practised by `st1-opt-pess-order`. |
| st1-optimistic-mc | TYPE, DUP | Replace with: "Testing is an *optimistic* technique. What does that mean?" Options: "It may accept a faulty program" ✓ / "It may reject a correct program" / "It proves absence of faults for the inputs tried" / "It needs no oracle". |

### Lecture 2 (What is a software tester)

| id | problem(s) | concrete fix |
|---|---|---|
| st2-toyota | VAL | Trim to the lesson: "What does the Toyota case show about bugs and testability?" → "Bugs can kill (≈89 deaths); the acceleration code was so complex it was untestable." Merge with `st2-toyota-why`. |
| st2-toyota-deaths | VAL | Drop. |
| st2-toyota-bugs | VAL | Optional. If kept, link it to error-prone aspects ("which error-prone aspects do these four bug kinds belong to?"). |
| st2-trillions | TINY, VAL | Drop. A verbatim one-word cloze; `st2-why-hard` carries the idea. |
| st2-openoffice-mc | DUP | Drop. The recall card `st2-openoffice` is enough. |
| st2-zune-catch | DUP | Remove "boundary conditions / complex booleans" (practised by `st2-likely-mistakes`). Keep 3 points: domain knowledge, helpful adversary, black box + white box. |
| st2-oracle-mc | DUP | Drop. Same question and direction as `st2-oracle-def`. |
| st2-what-is-test / st2-test-needs | DUP | Merge into one: "What do you NEED for a test?" (test case = data + expected output; SUT → actual output; oracle). |
| st2-test-case-def | ACC (conflict) | Add a `why`: "The L9 formal definition is inputs + execution conditions + pass/fail criterion; an expected output is one kind of pass/fail criterion." |

### Lecture 3 (Test cases and suites)

| id | problem(s) | concrete fix |
|---|---|---|
| st3-leftpad | BIG | Trim to 3 points: a tiny package was deleted from npm; React (and through it Facebook/Netflix/…) depended on it; builds broke until npm restored it. |
| st3-leftpad-year | VAL | Drop. |
| st3-leftpad-react | VAL, TYPE | Drop. JUnit, Selenium and Log4J are not web frameworks, so the item is pure elimination. |
| st3-tdd-mc | TYPE | Correct option is 65 chars vs 49, and the distractors are absurd ("every mutant becomes stillborn"). New options: "Tests end up checking what the code does, not what it should do" ✓ / "Tests end up checking only the happy path of the spec" / "Tests can no longer be automated with JUnit" / "Tests must be rewritten after each refactoring". Trim lengths to within ±10 chars. |

### Lecture 4 (Dependability & systematic testing)

| id | problem(s) | concrete fix |
|---|---|---|
| st4-2038-moment | VAL, ONE | Drop, or move to optional. The exact `YYYY-MM-DD HH:MM:SS` match has no accepts (e.g. `2038-01-19T03:14:07`). |
| st4-2038-real | BIG, VAL | Trim: "Why is the 2038 problem still real?" → "32-bit time_t lives on in embedded systems (aircraft GPS, car ABS, routers, IP cameras), and fixing it can break reading old data." Drop the list of 8 already-fixed systems. |
| st4-2038-date | ONE | Add accepts: "January 19th 2038", "19th January 2038", "Jan 19, 2038". |
| st4-four-methods | BIG, DUP | Drop. The four single-method cards and the four scenario MCs already cover it. |
| st4-measures | BIG, DUP | Drop. Replace with an MC for the missing measure: "'Continuity of correct service' defines which measure?" (Reliability / Availability / Safety / Integrity). |
| st4-availability-formula | ACC, DUP | Keep the formula and drop the "why QA needs metrics" half (duplicated by `st5-why-metrics`). Add a `why`: "The slide's diagram makes MTBF include repair time, so strictly A = MTTF/(MTTF+MTTR). Use the slide formula on the exam." |
| st4-availability-calc | ONE, ACC | Add accepts "95", "19/20". Same `why` note as above. Replace with the generator (Fix 2). |
| st4-chaos-monkey-name | DUP | Drop. `st4-chaos-monkey` covers it. |
| st4-do178b | DUP | Keep this one and drop `st5-do178-name`'s DO-178 half. |
| st4-do178b-levels | BIG, DUP | Drop. The order card plus scenario MCs cover it. Add 2 scenario MCs for Catastrophic and Hazardous to complete the set. |
| st4-summary | DUP | Keep, but drop `st5-testing-place`. |
| st4-coverage-standards | BIG, VAL | 7 names are not yet defined in the course (decision coverage is "next time"), and the points list 5 items while the answer has 7. Defer until L14+, or drop. |
| st4-mcdc-name | ONE | Convert to MC ("MC/DC stands for…") or add accepts: "modified condition / decision coverage", "modified condition-decision coverage". |
| st4-coverage-challenges | DUP | Drop the regression part (it has its own card) and keep polymorphism + late binding. |
| st4-adequacy-apply | ACC (points ≠ answer) | Point 4 ("research: coverage is not strongly correlated…") is not in the answer. Remove it or add it to the answer. |
| st4-ms-calc | ONE | Add accepts "80", "4/5". Move to the generator. |
| st4-research | BIG | Trim to 2 points: coverage is not strongly correlated with suite effectiveness, and it is unclear whether mutation scores track real fault detection. Drop the venue and university names. |
| st4-research-mc | TYPE | Length cue (65/54) and implausible distractors. New options (similar lengths): "Coverage is not strongly correlated with effectiveness" ✓ / "Coverage strongly predicts how many faults a suite finds" / "Coverage matters only for unit tests, not system tests" / "Branch coverage predicts effectiveness; statement coverage does not". |

### Reading: Kidwell, "Stalking the elusive computer bug" (lecture "paper")

| id | problem(s) | concrete fix |
|---|---|---|
| stp-author | BIG | Trim to author + claim. Drop the volume/number. |
| stp-moth-date | VAL, ONE | Drop. If kept, add accepts ("September 9th, 1947", "Sep 9 1947"). |
| stp-moth-details | VAL | Drop. "Relay #70 Panel F" is from the logbook photo, not the paper text. |
| stp-myth-corrections | BIG, VAL | Drop, or keep one point: "Palmer showed no Mark II existed in 1945". |
| stp-palmer-mc | VAL | Drop. |
| stp-harvard-1944 | VAL, DUP | Drop. `st1-allegedly` carries "the word predates the moth". |
| stp-oed | BIG, VAL | Drop (501 chars). |
| stp-pallmall-mc | VAL | Drop. |
| stp-quadruplex | BIG, VAL | Drop (481 chars). |
| stp-edison-1878 | VAL | Fold "minimise problems to reassure an investor" into `st1-bug-meaning`'s `why`, then drop. |
| stp-dictionaries | VAL | Drop. |
| stp-wilkes | BIG | Trim to the lesson: "Wilkes (EDSAC, 1949) realised much of his life would be spent finding errors in his own programs". Drop Airy's equation. |
| stp-hopper-cartoons | VAL | Drop. |
| stp-glossaries-order | VAL | Drop. |
| stp-popular-press | VAL | Drop. |
| stp-functions | BIG | Trim to 3 points: humour/wit, a general term when the cause is unknown, and implying small fixable faults (optimism). |
| stp-future | BIG, VAL | Drop. |
| stp-french | VAL | Drop. |
| stp-hopper-bio | VAL | Drop. |
| stp-first-published-nuance | BIG | Trim to: "Earlier than the 1889 OED example: The Operator 1875 (telegraphy), Edison's 1877–78 uses." |

### Lecture 5 (Dependability II)

| id | problem(s) | concrete fix |
|---|---|---|
| st5-pokemon-save | BIG, VAL | Rewrite as a lesson card: "Pokémon Red clears save memory to 0xFF, then writes the party last. Why does switching off mid-save corrupt the party, and what kind of test would catch it?" → "The save is not atomic, so the party count is left at 0xFF = 255; an interrupted-operation (pull-the-plug) test." |
| st5-pokemon-255 / st5-pokemon-249 / st5-ace-acronym | VAL | Drop all three. |
| st5-pokemon-ace | BIG, VAL | Drop, or trim to "out-of-bounds read/write of party slots → arbitrary code execution". |
| st5-avoidance-mc / st5-tolerance-mc / st5-removal-mc / st5-forecasting-mc | DUP | Drop. They repeat the slide examples already in `st4-fault-avoidance`, `st4-fault-tolerance`, `st4-error-removal` and `st4-error-forecasting`, and in `st4-classify-*`. Add them to `DUPLICATES`. |
| st5-testing-place | DUP | Drop (`st4-classify-testing`, `st4-summary`). |
| st5-why-metrics | DUP | Drop (`st4-availability-formula`). |
| st5-avail-calc-80 | ONE, DUP | Add accepts "80", "4/5". Replace with the generator. |
| st5-failure-timeline | ACC | Add the MTTF/MTBF note from Fix 1. |
| st5-mtbf-span | DUP, ACC | Merge into `st5-failure-timeline`'s `why`. |
| st5-do178-name | DUP, VAL | Drop the DO-178 half and keep only DO-330 if wanted (it's low value; dropping it is fine). |

### Lecture 6 (Testing principles II, bug reports I)

| id | problem(s) | concrete fix |
|---|---|---|
| st6-janet-rpm | VAL | Drop. |
| st6-janet-fix | TYPE, VAL | Drop (length cue 69/56). Fold "software filter for a hardware problem" into `st6-janet-story`. |
| st6-bug-density | ONE | Convert to MC: "Average bugs per 1,000 SLOC?" → 15–50 ✓ / 1–5 / 150–500 / under 1. |
| st6-error-prone-list | BIG | Keep, but set the points to grade "≥5 of 7". Add generated "spot the error-prone aspect" snippets (like `st6-hashmap`). |
| st6-80-20-typed | DUP | Drop (`st6-80-20`). |
| st6-divide-technique | DUP | Drop (`st6-divisibility` point 3). |
| st6-two-understandings | CUE, VAL | Drop. A vague cue for a verbatim slide line. |
| st6-report-purpose | VAL | Drop. A verbatim textbook definition with nothing to apply. |
| st6-process-steps | DUP | Trim to the steps that aren't obvious: "What happens in Track and in Retest?" The order card covers the sequence. |
| st6-analyse-order | ACC, TYPE | Drop, or convert to recall "list the four analysis activities". It puts root cause before reproducing, which contradicts `st6-first-thing`. |
| st6-first-thing | ONE | Convert to MC: "Try to reproduce it" ✓ / "Search the tracker for duplicates" / "Find who wrote the code" / "Estimate its severity". |
| st6-prioritization | DUP | Drop (`st6-pdf-worth`). |

### Lecture 7 (Bug reports, test doubles intro)

| id | problem(s) | concrete fix |
|---|---|---|
| st7-leftpad-fix / st7-leftpad-hours | DUP, VAL | Drop (the L3 left-pad cards). Add to `DUPLICATES`. |
| st7-common-sense | CUE, VAL | Drop. |
| st7-guides | VAL | Drop. |
| st7-trackers | VAL | Trim to "Why does a team need a searchable tracker?" → avoid duplicates; track owner and status. Drop the 11-name list. |
| st7-missing-2 | TYPE | Length cue (48/20). New options: "Include the minimum steps to reproduce" ✓ / "Explain the problem clearly" / "Be understandable to outsiders" / "Be numbered and written down". |
| st7-disclosure | ONE | Convert to MC: "45–90 days" ✓ / "7–14 days" / "6–12 months" / "Immediately after reporting". |
| st7-tap-numbers | BIG, VAL | Rewrite: "Why are flaky tests expensive at Google's scale (TAP)?" → "A large share of daily failures are flaky, and 2–16% of compute goes on reruns; flaky failures waste machines and teach people to ignore red builds." 2 points. |
| st7-tap-name / st7-tap-compute / st7-tap-sixteen / st7-tap-failures | VAL (+ONE for compute) | Drop all four. |
| st7-flakey-date | TYPE | Length cue (33/16). Options: "Environment change (date/time)" ✓ / "Concurrency (thread interleaving)" / "Timing (a fixed sleep too short)" / "Floating-point imprecision". |

### Lecture 8 (Test doubles)

| id | problem(s) | concrete fix |
|---|---|---|
| st8-gandhi-legend | DUP | Merge into `st8-gandhi-fake`: "What was the 'Nuclear Gandhi' bug supposed to be, and why is it a lesson about bug reports?" |
| st8-gandhi-underflow | (miscategorised) | Move to topic 5 (error-prone aspects / numeric limits). The arithmetic is good practice. |
| st8-why-doubles | BIG | Set the points to grade "≥4 of 6". |
| st8-kinds | BIG, DUP | Drop. The 4 kind MCs plus `st8-inputs-outputs` cover it. |
| st8-mockito-name | TINY, DUP | Drop. |
| st8-when-then | ONE | Split into two typed cloze cards (one blank each), or add accepts "when(), thenReturn()", "when,thenReturn", "when(…).thenReturn(…)". |
| st8-monitor-why | BIG, DUP | Trim to the three checkable interactions (order, called/not called, parameters). The void-method motivation is in `st8-scn-mock`. |
| st8-spy-real | DUP | Drop (`st8-mock-vs-spy`). |

### Lecture 9 (Factors influencing test effectiveness)

| id | problem(s) | concrete fix |
|---|---|---|
| st9-500-mile-story | BIG | Trim to the symptom and cause (zero timeout → ~3 ms → ~500 miles). Drop the university and years. |
| st9-500-mile-calc | VAL | Optional. Physics arithmetic, not testing. |
| st9-test-case | ACC (conflict) | Add the same note as `st2-test-case-def`. |
| st9-approximating | BIG | Trim to 4 points: statement/branch coverage, mutation killing score, input partitioning, requirements/use cases. |
| st9-limitations | BIG | Split. (a) theoretical (no ideal criterion; undecidable). (b) practical (Goodhart: coverage targets → smoke tests). |
| st9-smoke | TYPE | Length cue, and the answer repeats the stem. Options: "Smoke testing" ✓ / "Mutation testing" / "Regression testing" / "Pairwise testing". |
| st9-obligation-sources | BIG, DUP | Trim to the four names with one-line sources. The three scenario MCs give the examples. Add the missing structural scenario MC ("traverse each loop 0, 1, many times"). |
| st9-unsatisfiability | BIG | Split. (a) "Give an obligation no test can satisfy" (failure-handling code for an assertion that cannot fail). (b) "Two ways to cope" (exclude infeasible obligations, or report % satisfied). |
| st9-useful-harmful | BIG | Trim to 2+2 points. |
| st9-comparing | BIG | Trim: empirical (setting-dependent) vs analytical (subsumption; only part of effectiveness). |
| st9-goals | CUE, DUP | It is easily confused with `st9-good-criterion` (three *properties*). Reword the cue: "Beyond the three properties, what GOALS should an adequacy criterion meet?" |
| st9-uses | BIG | Trim to 3 uses + "spec first, structural coverage to find missed logic". |
| st9-sensitivity | TYPE | Convert to an applied MC: "A criterion's score rises steadily, but suites that score high find no more faults. Which property fails?" (Sensitivity / Monotonicity / Applicability). |

### Lecture 10 (Reachability, observability, black box)

| id | problem(s) | concrete fix |
|---|---|---|
| st10-rhino | BIG, VAL | Drop. |
| st10-time-hard | BIG, VAL | Trim to "what goes wrong when time handling breaks" (hangs, API miscommunication, duplicate transactions). Drop the tz dataset counts. |
| st10-tz-iana | VAL | Drop. |
| st10-river-s1s2 | ONE | Add the accept "8,538". |
| st10-observability-measures | ACC | Add a `why`: "Plain MC/DC does not guarantee the effect reaches the output; Observable MC/DC (OMC/DC, L4) adds that. Exam answer per slide: strong mutation, MC/DC." |
| st10-partition-principle / st10-sparse-dense / st10-equivalence-class / st10-quasi | DUP, BIG | Merge into two cards. (a) "Partition principle: why does sampling every class help?" (failures sparse overall, dense in some regions; one sample per class hits the dense ones). (b) "True partition vs quasi-partition testing" (disjoint + equivalence vs overlap allowed, heuristics; test each class *and* its boundaries). |
| st10-partition-check | TYPE | Length cue. Options: "No — {x > 0} and {x ≥ 0} overlap" ✓ / "No — 0 belongs to no class" / "Yes — together they cover every integer". |
| st10-postal-partitions | BIG | Keep, but grade "≥4 of 5". It's the model for the spec-partitioning generator. |
| st10-reverse-classes | BIG | Grade "≥5 classes". |

### Lecture 12 (Black-box testing)

| id | problem(s) | concrete fix |
|---|---|---|
| st12-ai-landing-mc | DUP | Drop (`st12-ai-landing`). |
| st12-spec-steps | DUP | Drop. Same content as `st12-spec-steps-order`. |
| st12-attribute-kind | TYPE | Add the real near-miss: options "An environment condition" ✓ / "A configuration" / "An input parameter". |
| st12-font-explosion | VAL | Trim to the method: "colours → {black, white, coloured}, sizes → {small, medium, large}". Drop 8,192 and 4 billion. |
| st12-font-constraints | VAL, DUP | Drop. A rote list; `st12-invalid-combo` applies it. Add one more applied MC: "Which spec is infeasible: Small caps + All caps?" |

### Lecture 13 (Code coverage)

| id | problem(s) | concrete fix |
|---|---|---|
| st13-myth2-mc | TYPE | Length cue (38/18). Options: "Input partitioning (black box)" ✓ / "Branch coverage (white box)" / "Statement coverage (white box)". |
| st13-edge-pairs | ACC (definition) | Add a `why`: "Per the slide, pairs of exactly 2 edges = 8. Ammann & Offutt's textbook TR is paths of length ≤ 2 (so it also contains the edges); follow the slide on the exam." |
| st13-prime-list / st13-prime-count / st13-not-prime-mc | ACC (slide inconsistency) | Add the Fix 1 note: slides 22–24 list `[N4,N2,N5]` (7 paths), but it is a sub-path of `[N3,N4,N2,N5]`, so it is not prime. Slide 25 tours 6. |
| st13-jacoco / st13-gcov-mc | DUP, VAL | Drop both. `st13-tools` covers the four tool names. |
| st13-coverage-limits | DUP | Keep, but drop `st13-combine-mc` or turn it into the applied version: "Your suite has 100% branch coverage but a mutant `>`→`>=` survives. Which technique told you, and what does it say is missing?" |

### Lecture 14 (AI agent harness)

| id | problem(s) | concrete fix |
|---|---|---|
| st14-raw-agent | DUP | Merge into `st14-failure-modes` (same four failure modes). |
| st14-core-question | DUP | Drop (`st14-three-layers`, `st14-not-magic`). |
| st14-anatomy | BIG, DUP | Drop. |
| st14-five-things | BIG, DUP | Drop. A summary slide restating the cards above. |
| st14-shift | VAL | Drop. An order of slogan stages. |
| st14-repo-rules | BIG | Keep the 4 rules; drop the "why store in repo" part (or make it its own small card). |
| st14-least-privilege | DUP | Merge into `st14-autonomy` (same three tiers, different labels). |
| st14-evidence-mc | TYPE | Length cue (66/54). Options: "Evidence, not proof" ✓ / "Proof, if coverage is 100%" / "Proof, if a human approves" / "Unnecessary once CI passes". |
| st14-what-changed | BIG, CUE | Drop. A verbatim 4×2 slide table; `st14-booking-why` holds the transferable lesson (reach/trigger/observe the race). |

### History & stories: lecture Bug-of-the-Day cards not listed above

| id | problem(s) | concrete fix |
|---|---|---|
| st9-500-mile-cause | TYPE | Only 2 distractors, and the correct option is longest. Fine; shorten to "A zero connection timeout". |
| st10-australia | BIG | Trim to "new Date(0) gave GMT+10 or +11 depending on the engine's DST rules for 1970 → environment-dependent (flaky) tests". |
| st12-ai-landing | — (keep) | No change. A good lesson card, linked to Goodhart and `st14-failure-modes`. |

## Cards checked and found fine (for the record)

All other cards passed every check. They include the full numZero set, Zune (`st2-zune-bug`, `st2-zune-input`, `st2-zune-fix`), the river reachability/observability set, is_bigger, arePositive, foo, subsumption, mutation, flaky diagnosis, choosing-a-double scenarios, Mockito roles and defaults, V&V scenario, retest outcomes, security disclosure scenario, and the DO-178 order and MCs.
