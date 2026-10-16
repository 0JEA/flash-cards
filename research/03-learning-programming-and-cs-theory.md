# 03 - How people learn programming and CS theory (computing-education research)

Compiled 2026-10-15. Scope: what the peer-reviewed literature says about practice formats for algorithms, proofs, low-level/assembly, discrete math, number theory. Target learner: 3rd-year CS+Math undergrad, fast intuition-first, foundational notation gaps.

**Verification key** (every entry states which applies):
- **FULL** = I loaded the paper's text (author/repository PDF) and the numbers below come from it.
- **ABSTRACT** = I loaded a page with the real abstract (Crossref abstract, Semantic Scholar API, repository record).
- **EXISTENCE-ONLY** = Crossref (api.crossref.org) confirmed title/authors/venue/year; I did NOT read the paper or abstract. Any findings text is from search-result summaries and is labelled as such.
- ACM Digital Library returned HTTP 403 for every fetch, and doi.org redirects land there, so no ACM page was readable. Crossref was used as the existence check for all ACM items.
- Do NOT use `crpit.com` (the domain now serves spam); the Parsons & Haden CRPIT page on westernsydney.edu.au did not resolve.

---

## What this means for the app

Headline: the evidence supports **reading/tracing and scaffolded construction before free production**, and **mixed (interleaved) and spaced practice**; it does NOT support plain recall flashcards as the main tool for procedural CS/math content. Strength of evidence is uneven (see caveats per entry). Items marked (inference) are my extrapolation, not a paper's claim.

1. **Trace-this-code / trace-this-assembly with a typed answer** (final register values, memory, output; loop iteration counts). Reading and tracing skill predicts writing skill and novices are weak at it. Papers: Lister 2004, Lopez 2008, Venables 2009; replication is mixed (Fowler 2022). For Pep/9: trace to final A, X, memory cells, and status bits (inference; no assembly-specific study found).
2. **Parsons (ordering) problems**: scrambled lines of code, a Pep/9 routine, a loop-invariant proof (initialization/maintenance/termination), a modular-arithmetic derivation, or an induction proof. Same learning as writing in much less time. Papers: Parsons & Haden 2006, Ericson 2017/2018 (secondary summaries only), Poulsen 2022 (Proof Blocks; the strongest numbers, in discrete math).
3. **Worked example with a missing step, fading** (full solution, then one step blank, then two, then none). Papers: Sweller & Cooper 1985, Atkinson 2000, Renkl 2002, Chen 2025. Use for recurrences (Master theorem cases), loop-invariant proofs, extended Euclid, ray-sphere intersection algebra.
4. **Subgoal-labelled solutions**: show the solution chunked under named subgoals ("set up recurrence", "pick case", "verify regularity"). Strong in a 2012 App Inventor study (N=40), but did not replicate cleanly in text-language CS1 (Morrison 2015). Treat as promising, not settled. Margulieux 2012, Morrison 2015.
5. **Explain-this-step / self-explanation prompts** on proofs and algorithms: "why does this line follow?", "what does this symbol mean?". Self-explanation training raised proof comprehension (d = 0.95, Hodds 2014). Best match for the learner's notation gaps (inference): add "decode this notation" items (sigma, floor/ceiling, mod congruence, set-builder, dot-product subscripts).
6. **Compare-two-methods items** (two solutions to the same problem, or two near-identical snippets/proof sketches that differ in one crucial feature; "which is correct and why"). Rittle-Johnson & Star 2007/2009, Schwartz 2011. Also doubles as **spot-the-bug** (Qian & Lehman 2017 catalog of misconceptions to seed distractors).
7. **Interleaved, not blocked, scheduling**: mix problem types (recurrence method, which addressing mode, mod-inverse vs mod-exponent) in one session instead of one topic at a time; feels worse during practice, tests better a week later. Rohrer & Taylor 2007 (N=66 and a small Exp 2). Spacing is also supported there.
8. **Predict-the-output / predict-then-reveal with notional-machine view**: show the machine state (stack, registers, memory) stepping, ask for the next state. Sorva 2013, du Boulay 1986 (EXISTENCE-ONLY for both). Pep/9 is itself a notional machine, so this maps directly (inference).
9. **Do not rely on multiple-choice recall for theory**: the CS-specific evidence for spaced retrieval is thin (one observational CS1 case study), so reuse the existing MC format for definitions/terminology only, and treat spaced scheduling of the above richer items as a reasonable-but-unproven design (inference).
10. **Mark confidence in the app UI**, e.g. a "typed answer" field with self-grade, because Parsons/tracing items need generated feedback; keep every item tagged by type so the learner can see which format is paying off for him (inference).

---

## Papers

### 1. Reading and tracing before writing

**Lister, R., Adams, E. S., Fitzgerald, S., Fone, W., Hamer, J., Lindholm, M., McCartney, R., Moström, J. E., Sanders, K., Seppälä, O., Simon, B., Thomas, L. (2004). A multi-national study of reading and tracing skills in novice programmers. ACM SIGCSE Bulletin 36(4), 119-150 (ITiCSE 2004 working group).**
- URLs loaded: Crossref https://api.crossref.org/works/10.1145/1041624.1041673 ; working-group PDF https://www.cs.auckland.ac.nz/~j-hamer/ITiCSE04-wg.pdf (FULL)
- Design: 12 multiple-choice questions (predict output of short code; fill in missing lines), 7 countries; 941 students contributed some data, **N = 556 were given all 12**; mode score 8/12; quartile boundaries top 10-12, bottom 0-4. Mostly first-course students.
- Finding: many students were weak on these prerequisites; the paper's abstract says especially on the missing-code task; it also reports "doodle" data (students who sketch trace state tend to do better; I did not extract that number).
- Implication: trace/predict items are a legitimate, easy-to-auto-grade format; encourage scratch work (e.g. a state-table input area).
- Caveats: novices, not 3rd-years; MCQ format; instruments varied across institutions.

**Lopez, M., Whalley, J., Robbins, P., Lister, R. (2008). Relationships between reading, tracing and writing skills in introductory programming. ICER/Workshop on Computing Education Research (2008).**
- URLs loaded: Crossref https://api.crossref.org/works/10.1145/1404520.1404531 ; PDF https://opus.lib.uts.edu.au/bitstream/10453/10806/1/2008001530.pdf (FULL)
- Design: end-of-semester Java exam, one university; **38 students gave consent** (78 sat the exam). Stepwise regression with writing as the outcome, plus a Rasch model.
- Finding: tracing-of-iterative-code and "explain in plain English" questions together accounted for **46% of variance in code-writing score**; proposed hierarchy: basic knowledge -> tracing/explaining/Parsons -> writing.
- Implication: justifies tracing + explaining as precursor items before "write a loop" items.
- Caveats: N=38, correlational, one exam; the authors themselves note the link might reflect generic reasoning skill. The hierarchy is not cleanly replicated (below).

**Venables, A., Tan, G., Lister, R. (2009). A closer look at tracing, explaining and code writing skills in the novice programmer. ICER '09, 117-128. DOI 10.1145/1584322.1584336.**
- URLs loaded: https://opus.lib.uts.edu.au/handle/10453/11384 ; PDF https://opus.lib.uts.edu.au/bitstream/10453/11384/1/2009002706OK.pdf (FULL)
- Design: end-of-first-semester Java exam; **32 students**.
- Finding: broadly consistent with Lopez et al. In this data, tracing iterative code alone explained only R2 = 0.15 of writing variance and explaining R2 = 0.07 alone, with 0.46 for the pair as in Lopez; the explain-to-write link was sensitive to the specific questions; the Rasch model was unnecessary.
- Implication: don't over-engineer; but also don't assume any single item type "unlocks" writing.
- Caveats: N=32; weak/question-dependent explaining result.

**Fowler, M., Smith IV, D. H., Hassan, M., Poulsen, S., West, M., Zilles, C. (2022). Reevaluating the relationship between explaining, tracing, and writing skills in CS1 in a replication study. Computer Science Education.** DOI 10.1080/08993408.2022.2079866.
- URLs loaded: Crossref https://api.crossref.org/works/10.1080/08993408.2022.2079866 ; FLoRA atlas https://forrt.org/flora-replication-atlas/doi/10.1080/08993408.2022.2079866/ (confirms it is a replication of Lopez 2008 but gives no results). **EXISTENCE-ONLY.**
- From search-result summaries only (not read): more than 600 students; Lopez's exact hierarchy was not among the best-fitting models, but similar models were; FLoRA tags the replication outcome "mixed".
- Implication: treat the tracing -> explaining -> writing ordering as a heuristic, not a law.

### 2. Parsons problems

**Parsons, D., Haden, P. (2006). Parson's programming puzzles: a fun and effective learning tool for first programming courses. Proc. 8th Australasian Computing Education Conference (ACE2006), CRPIT vol 52, Hobart, 157-163. DOI 10.5555/1151869.1151890.**
- URL loaded: https://en.wikipedia.org/wiki/Parsons_problem (secondary; carries the citation and ACM DOI). Crossref lookup of this DOI returned 404; ACM 403. **UNVERIFIED at the primary source**; existence rests on Wikipedia plus Lopez 2008's reference to "Parsons and Hayden, 2006" and a search hit listing CRPIT vol 52 pp 157-163.
- Described (secondary) as an interactive puzzle tool where students order scrambled lines; a design/tool paper, not a controlled study (inference from the descriptions I read).
- Implication: origin of the format; do not cite as evidence of effectiveness.

**Ericson, B. J., Margulieux, L. E., Rick, J. (2017). Solving Parsons problems versus fixing and writing code. Koli Calling '17. DOI 10.1145/3141880.3141895.**
- URLs loaded: Crossref https://api.crossref.org/works/10.1145/3141880.3141895 ; Semantic Scholar record (abstract withheld by publisher). **EXISTENCE-ONLY** for the paper itself.
- Secondary (Ericson dissertation page https://hg.gatech.edu/node/603172, loaded; and Poulsen 2022's summary): Parsons problems were solved significantly faster than fixing or writing code, with the same pretest-to-posttest learning gain. Exact numbers not obtained.

**Ericson, B. J., Foley, J. D., Rick, J. (2018). Evaluating the efficiency and effectiveness of adaptive Parsons problems. ICER '18. DOI 10.1145/3230977.3231000.**
- URL loaded: https://api.crossref.org/works/10.1145/3230977.3231000 . **EXISTENCE-ONLY.** Dissertation page: adaptation (making a problem easier when the learner struggles) helped more learners succeed.

**Poulsen, S., Gertner, Y., Cosman, B., West, M., Herman, G. L. (2022). Efficiency of learning from Proof Blocks versus writing proofs. arXiv:2211.09609 (cs.CY).**
- URL loaded: https://arxiv.org/pdf/2211.09609 (FULL)
- Design: randomized, between-subjects lab study, **332 students** (analysed) from a discrete-math course, learning proof by induction; pretest, lecture notes, <1-hour activity, posttest a week later. Conditions: Proof Blocks only (n=107), hybrid (n=112), written proofs only (n=113).
- Finding: all three improved ~32-35% (pretest ~17-21 -> posttest ~50-54 out of 100; standardized gain 0.66-0.76; Kruskal-Wallis between groups p = 0.76, no group difference). Time: Proof Blocks mean **11.1 min** vs written **43.4 min**, about 4x faster (Cohen's d = 2.09 for written minus Proof Blocks).
- Implication: strongest direct support for drag-to-order proof lines (induction, loop invariants, number theory proofs) as the default early-stage format, with writing later.
- Caveats: early-phase learners, one topic, one university, one-week delay, "learned equally" is a failure to find a difference, not equivalence testing. Posttest scores were only ~50%, so absolute learning is modest. Preprint (arXiv version) - check peer-review status before citing as published.

### 3. Worked examples, subgoals, fading

**Sweller, J., Cooper, G. A. (1985). The use of worked examples as a substitute for problem solving in learning algebra. Cognition and Instruction 2(1), 59-89.**
- URL loaded: https://api.crossref.org/works/10.1207/s1532690xci0201_3 . **EXISTENCE-ONLY.**
- From search-result summaries (not read): five experiments with secondary-school algebra students; studying examples took less time and produced fewer errors on later similar problems; benefit limited to problems structurally similar to the examples.
- Implication: worked-example-first for new technique; expect weaker transfer to dissimilar problems.

**Atkinson, R. K., Derry, S. J., Renkl, A., Wortham, D. (2000). Learning from examples: instructional principles from the worked examples research. Review of Educational Research 70(2), 181-214.**
- URL loaded: https://api.crossref.org/works/10.3102/00346543070002181 . **EXISTENCE-ONLY** (a review; I did not read its principles).

**Renkl, A., Atkinson, R. K., Maier, U. H., Staley, R. (2002). From example study to problem solving: smooth transitions help learning. Journal of Experimental Education 70, 293-315.**
- URL loaded: https://api.crossref.org/works/10.1080/00220970209599510 . **EXISTENCE-ONLY.**
- From search summaries (not read): gradually removing solution steps (fading) beat alternating example/problem pairs on near transfer, not reliably on far transfer; backward fading (drop the last step first) favored.
- Implication: build "complete the last step" items first, then earlier steps.

**Margulieux, L. E., Guzdial, M., Catrambone, R. (2012). Subgoal-labeled instructional material improves performance and transfer in learning to develop mobile applications. ICER '12, 71-78. DOI 10.1145/2361276.2361291.**
- URLs loaded: Crossref https://api.crossref.org/works/10.1145/2361276.2361291 ; author-accepted PDF https://scholarworks.gsu.edu/server/api/core/bitstreams/ea5acfed-1bc8-4169-bc16-b2f990f31f2a/content (FULL)
- Design: App Inventor, novices (<=1 prior programming class). Exp 1 **N=40** (20 subgoal-labelled vs 20 conventional); Exp 2 **N=12**.
- Finding: subgoal group completed more subgoals correctly (M 28.1 vs 20.6; omega-squared .23) and finished about 2 min 18 s faster; far more likely to define a needed variable (55% vs 5%).
- Implication: label the chunks of multi-step procedures.
- Caveats: tiny N, drag-and-drop blocks language, lab setting, same group later failed to replicate in text code (next entry). Exp 2 N=12 is anecdotal.

**Morrison, B. B., Margulieux, L. E., Guzdial, M. (2015). Subgoals, context, and worked examples in learning computing problem solving. ICER '15, 21-29. DOI 10.1145/2787622.2787733.**
- URLs loaded: Crossref https://api.crossref.org/works/10.1145/2787622.2787733 ; PDF https://scholarworks.gsu.edu/server/api/core/bitstreams/f40a79f2-edaf-49fb-b0cb-05451bd21bac/content (FULL)
- Design: text-based while-loop task in intro programming classes (4 classes); 3 label conditions (none / given / self-generated) x isomorphic vs contextual transfer; error df of 60 imply about 66 participants (inference).
- Finding: the expected benefit of given labels **did not replicate**; there was a significant label x transfer-type interaction (reported p = .003, omega-squared .18); in one contrast generated labels beat none with d = 1.07 (p=.021). The authors conclude CS may impose different problem-solving demands than math/science.
- Implication: ask the learner to name the subgoals himself on some items (generate), do not assume pre-labelled solutions help.
- Caveats: ~11 per cell, many contrasts, mixed results; do not treat any single effect as firm.

**Chen, X. (2025). Effects of worked examples with explanation types and learner motivation on cognitive load and programming problem-solving performance. ACM Transactions on Computing Education. DOI 10.1145/3732791.**
- URL loaded: https://api.crossref.org/works/10.1145/3732791 (abstract; ABSTRACT)
- Design: N=75 non-CS first-course university students, 2x2 (instructional explanation vs guided self-explanation questions; high vs low motivation).
- Finding (from abstract): worked examples lowered extraneous load and raised retention; examples plus guided self-explanation helped transfer regardless of motivation; high-motivation learners did better.
- Implication: pair each worked example with a "why this step?" prompt.
- Caveats: novices, non-majors; I read only the abstract; effect sizes not obtained. Author initial "Chen" per Crossref (given name not captured).

### 4. Notional machines and misconceptions

**du Boulay, B. (1986). Some difficulties of learning to program. Journal of Educational Computing Research 2(1), (pages not verified).** DOI 10.2190/3LFX-9RRF-67T8-UVK9.
- URL loaded: https://api.crossref.org/works/10.2190/3lfx-9rrf-67t8-uvk9 . **EXISTENCE-ONLY.** Origin of the "notional machine" idea per Sorva-citing sources; I did not read it.

**Sorva, J. (2013). Notional machines and introductory programming education. ACM Transactions on Computing Education 13(2), Article 8.**
- URLs loaded: Crossref https://api.crossref.org/works/10.1145/2483710.2483713 ; Semantic Scholar https://api.semanticscholar.org/graph/v1/paper/DOI:10.1145/2483710.2483713 (abstract withheld). **EXISTENCE-ONLY.**
- From search summaries (not read): notional machine = idealized computer implied by the language's constructs; novices' models are often faulty; the notional machine should be taught explicitly (~336 citations per Semantic Scholar).
- Implication: for Pep/9 the notional machine is the CPU/memory model; teach it with state-stepping items.

**Qian, Y., Lehman, J. (2017). Students' misconceptions and other difficulties in introductory programming: a literature review. ACM Transactions on Computing Education 18(1), Article 1. DOI 10.1145/3077618.**
- URLs loaded: Crossref https://api.crossref.org/works/10.1145/3077618 ; Semantic Scholar record (abstract withheld); abstract text read via a search-result mirror (springerprofessional.de), not fetched by me. **EXISTENCE-ONLY.**
- Per that abstract: difficulties span syntactic, conceptual, strategic knowledge; contributors include unfamiliar syntax, math knowledge, inaccurate mental models, lack of strategies; authors call for moving beyond catalogues to conceptual-change approaches.
- Implication: use catalogued misconceptions as distractors/bug types; note "math knowledge" appears as a named contributor, consistent with the learner's notation gaps.
- Caveat: studies reviewed are overwhelmingly intro-level (CS1), not 3rd-year theory or assembly.

### 5. Retrieval and spaced / interleaved practice

**Rohrer, D., Taylor, K. (2007). The shuffling of mathematics problems improves learning. Instructional Science 35, 481-498.**
- URLs loaded: Crossref https://api.crossref.org/works/10.1007/s11251-007-9015-8 ; PDF https://www.Gwern.net/doc/psychology/spaced-repetition/2007-rohrer.pdf (FULL)
- Design: college students (USF), permutations task (Exp 1: **N=66** analysed) and a second experiment with small N (df 14-16, i.e. about 8-9 per group; inferred). Test 1 week after last practice.
- Finding: Exp 1: spaced 74% vs massed 49% vs light-massed 46% (F(2,57)=3.59, p<.05). Exp 2: mixed practice 63% vs blocked 20% on the test (d = 1.34) though blocked did better in practice (89% vs 60%).
- Implication: interleave problem types in the app; warn the learner that mixed sessions will feel harder.
- Caveats: one math task; artificial lab task; Exp 2 very small; effect sizes from tiny samples are inflated in expectation (inference). Not CS content.

**Moraes, M. C., Lionelle, A., Ghosh, S., Folkestad, J. E. (2023). Teach students to study using quizzes, study behavior visualization, and reflection: a case study in an introduction to programming course. ICETC 2023 (Barcelona).**
- URL loaded: https://mountainscholar.org/items/55f9d5e8-8575-45e5-962b-bb563f71d9b4/full (ABSTRACT; N not stated on page)
- Design: CS1 quizzes relabelled as repeatable low-stakes retrieval practice; compared students who spaced and interleaved with those who did not. Observational (selection bias likely).
- Finding: higher final Canvas exam, coding exam, and course grade for the spaced/interleaved group (significant per the abstract; no numbers on the page).
- Implication: the only CS-specific spaced-retrieval evidence I found; weak.
- Caveats: self-selected practice patterns (motivated students do both), no N, conference case study.

**Search negative result:** I found no randomized trial of retrieval practice or Anki-style spaced repetition on programming or CS-theory content (searched for CS1 quizzing RCTs, Anki in CS courses, testing effect with code). Evidence is largely from medicine, language, and psychology lab tasks. Treat spaced scheduling as a plausible design inheritance, not a CS-proven effect.

### 6. Proofs, loop invariants, algorithm analysis

**Weber, K. (2001). Student difficulty in constructing proofs: the need for strategic knowledge. Educational Studies in Mathematics 48(1), 101-119.**
- URL loaded: https://api.crossref.org/works/10.1023/A:1015535614355 ; Semantic Scholar record (abstract withheld). **EXISTENCE-ONLY.**
- From secondary papers citing it: students often have the definitions and theorems but lack strategic knowledge (how to search for a proof, pick a representation, decide to change approach). Design (small interview/observation study) not verified.
- Implication: include items that ask "what is your first move / which technique applies" rather than only "fill in the proof".

**Hodds, M., Alcock, L., Inglis, M. (2014). Self-explanation training improves proof comprehension. Journal for Research in Mathematics Education 45(1), 62-101.**
- URLs loaded: Crossref https://api.crossref.org/works/10.5951/jresematheduc.45.1.0062 ; Semantic Scholar API record with abstract (ABSTRACT)
- Design: three experiments: (1) training booklet vs control on comprehension test; (2) eye-tracking engagement; (3) 15-minute in-lecture intervention with later retest. Participants: undergraduates (N per experiment not obtained).
- Finding: Exp 1 trained students generated better explanations and scored higher on a proof comprehension test, **d = 0.95**; Exp 3 effect persisted over time.
- Implication: "explain why this line follows" with feedback against a model explanation; most relevant for the learner's math gaps.
- Caveats: comprehension of a given proof, not production of new proofs; N and delay length not retrieved.

**Loop invariants (gap).** A search surfaced Fowler et al. on students writing loop invariants in a RESOLVE-backed web IDE (SIGCSE/ITiCSE 2021 and a 2020 poster) via par.nsf.gov, which I could not load. **UNVERIFIED; not cited.** I found nothing on teaching asymptotic analysis/recurrences.

### 7. Threshold concepts and cognitive load

**Boustedt, J., Eckerdal, A., McCartney, R., Moström, J. E., Ratcliffe, M., Sanders, K., Zander, C. (2007). Threshold concepts in computer science: do they exist and are they useful? SIGCSE '07, 504-508. DOI 10.1145/1227310.1227482.**
- URL loaded: https://api.crossref.org/works/10.1145/1227310.1227482 (title there is shortened to "Threshold concepts in computer science"; the "do they exist" subtitle comes from the search hit). **EXISTENCE-ONLY.**
- From search summaries: input from 36 instructors and 16 students, several countries; object-orientation and pointers were the strongest candidates. Later work: Zander et al. 2008 and Sanders et al. 2012 appear in Crossref (titles confirmed via Crossref search, content not read).
- Implication: pointers/indirect addressing in Pep/9 is a likely threshold concept (inference): give it more, differently-framed items rather than more of the same.
- Caveats: qualitative, identification of "thresholds" is subjective; the framework itself is contested.

Cognitive load theory applied to programming is represented here by Morrison 2015, Margulieux 2012, and Chen 2025 (above); I did not find a pure CLT-in-CS review I could verify.

### 8. Contrasting cases and comparison

**Rittle-Johnson, B., Star, J. R. (2007). Does comparing solution methods facilitate conceptual and procedural knowledge? An experimental study on learning to solve equations. Journal of Educational Psychology 99(3), 561-574.**
- URL loaded: https://api.crossref.org/works/10.1037/0022-0663.99.3.561 . **EXISTENCE-ONLY.** (A search summary says N=70 seventh-graders; not verified by me.)

**Rittle-Johnson, B., Star, J. R. (2009). Compared to what? The effects of different comparisons on conceptual knowledge and procedural flexibility for equation solving. Journal of Educational Psychology 101(3), 529-544.**
- URL loaded: https://dash.harvard.edu/server/api/core/bitstreams/7312037c-9058-6bd4-e053-0100007fdf3b/content (FULL; author copy)
- Design: **N=162** 7th/8th graders; compare equivalent problems vs different problem types vs different solution methods for the same problem.
- Finding: conceptual knowledge and procedural flexibility best supported by comparing solution methods, less by comparing problem types.
- Implication: "here are two ways to compute this (e.g. repeated squaring vs naive mod-exp; substitution vs Master theorem) - which is better when?"
- Caveats: middle-school algebra, short intervention; transfer to university CS unproven.

**Schwartz, D. L., Chase, C. C., Oppezzo, M. A., Chin, D. B. (2011). Practicing versus inventing with contrasting cases: the effects of telling first on learning and transfer. Journal of Educational Psychology 103(4), 759-775.**
- URL loaded: https://api.crossref.org/works/10.1037/a0025140 . **EXISTENCE-ONLY.**
- From search summaries (cadrek12.org abstract, not fetched): Exp 1 N=128, Exp 2 N=120, physics/ratio concepts; inventing from contrasting cases before being told gave better transfer with equal procedure use. Sweller criticized the control conditions (multiple variables changed together).
- Implication: for intuition-first learners, maybe present a puzzle/contrast before the formula (inference).
- Caveats: invention before instruction is costly for self-study and the control issue is real; this learner has already seen the formal definitions in class, so the benefit may be small.

---

## Open questions / contested

- **Hierarchy not settled:** the tracing -> explaining -> writing ordering came from N=38 (Lopez) and N=32 (Venables); the >600-student replication (Fowler 2022) is "mixed" per the FLoRA atlas (from a search summary and an atlas label, not read).
- **Parsons problems:** "same learning, less time" is the repeated finding (Ericson; Poulsen), but the 2023 summary I saw via Wikipedia (Hou, Ericson, Wang; N=89) found no posttest difference with scaffolding; and "no difference" does not prove equivalence. The Wikipedia article itself says effectiveness is uncertain for lack of replication. **UNVERIFIED primary source for Hou et al.**
- **Subgoal labels:** strong in App Inventor (N=40), unreplicated in text code (Morrison 2015). Generating labels may beat receiving them, but cells are ~11 people.
- **Worked-example effect has an expertise reversal** (from the Renkl/Kalyuga literature; not verified here): a 3rd-year learner on familiar material may do better with problems than examples. Make the fade level adaptive (inference).
- **Spaced retrieval for procedural CS content:** no CS RCT found. Rohrer is math, lab, small. Whether card-style recall helps symbolic derivations or just recalls facts is unknown.
- **Assembly/low-level:** I found no peer-reviewed learning study of assembly or Pep/9. The only hit was a 2009 ASEE conference paper (Freudenthal & Carter, "A gentle introduction to addressing modes...", peer.asee.org/5725; teaching addressing modes one at a time, "encouraging" early results, no controlled data; search snippet only, not loaded) - **UNVERIFIED**. Items 1, 3, 8 above are carried over from Java/CS1 by inference.
- **Algorithm analysis, recurrences, asymptotics, modular arithmetic, ray intersection:** no learning-science studies found in my searches. Everything here is transferred from proofs/algebra/CS1.
- **Population mismatch:** almost every CS study is CS1 novices; the learner is a 3rd-year with strong intuition. Transfer of effect sizes is an assumption.
- **Self-explanation and notation gaps:** Hodds et al. is on proof comprehension in math majors, not notation decoding; using it to repair notation gaps is my inference.
- **Publication bias / small-N field:** CS-ed ICER/Koli/SIGCSE studies are typically N=30-100 single-institution; effect sizes (d > 1) should be discounted.
