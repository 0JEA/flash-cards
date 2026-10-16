# 04 - Writing good cards, and the study strategies that actually work

Compiled 2026-10-16. Scope: the layer that reports 01-03 left out. How to WRITE a recall prompt so it has one findable answer, what to put inside a card (examples, "why", diagrams, worked steps), how honest self-grading is, when fact cards stop helping, what is known about teaching software testing and PL, and how to shape sessions. Applied to AUCSC 370 (Programming Languages) and AUCSC 325 (Software Testing). Learner: 3rd-year CS + Math, fast and intuition-first, weaker on notation, admits avoidance tendencies, studies on a laptop.

Do not re-read 01-03 for these topics; this file does not repeat their content. It cites them as R1 (`01-retrieval-and-spacing.md`), R2 (`02-card-design-and-format.md`), R3 (`03-learning-programming-and-cs-theory.md`). App rules L1-L15 are in `docs/superpowers/specs/2026-10-16-csc370-study-app-design.md`.

## Read this first (what an agent would otherwise get wrong)

- **There is no peer-reviewed study of "atomic" vs "complex" flashcards, and none comparing cloze deletion with question-answer cards on the same content.** R2 said this for atomic cards; this pass searched again for both and found nothing. The rules below that touch these are built from adjacent evidence (encoding specificity, fill-in-the-blank transfer studies, self-scoring studies) plus practitioner sources, and are labelled that way.
- **Wozniak's "20 rules" and Matuschak's "How to write good prompts" are NOT research.** Both authors say their advice is experience-based. They are used here only where research is silent, and always labelled PRACTITIONER.
- **No study gives a number for "new cards per day" or "best session length".** The numbers in rule 22 are arithmetic from the app's own scheduler, not findings.
- **"Typing the answer helps memory" is FALSE as stated.** Covert retrieval (just thinking the answer) produced the same retention as overt (Smith, Roediger & Karpicke 2013). Typing is still worth requiring, for a different reason: it is what makes self-grading honest (rules 15-16).
- **The software-testing education literature is almost all CS1/CS2 assignment studies, not flashcard studies.** It tells you WHAT students get wrong (happy-path tests, missed exceptions, decision coverage, MC/DC), not how to drill it.
- **Nothing found on teaching scoping, binding, lifetime, or BNF derivations.** The PL-misconception inventory found (Chiodini et al. 2021) covers Java/JavaScript/Python semantics, not PL-course theory.

## How verification was done

Every source below was checked against a page loaded in this session (2026-10-16). Tags:

- **FULLTEXT**: I downloaded the paper (PDF or full-text XML) and read the parts quoted. Numbers come from it.
- **ABSTRACT**: I loaded a record with the real abstract (ERIC API, Europe PMC API, Crossref, OpenAlex, Semantic Scholar, or the author's page). Only numbers printed in the abstract are quoted.
- **EXISTENCE-ONLY**: Crossref or OpenAlex confirmed authors/title/venue, but I did not read an abstract. Nothing beyond the title is claimed from it.
- **SECONDARY**: the number comes from another paper's description of it; that paper is named.
- **PRACTITIONER**: not peer-reviewed. Weighted below any research.

Endpoints used (the identifier is substituted per paper): `https://api.ies.ed.gov/eric/?search=id:<ERIC id>&format=json`; `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=DOI:"<DOI>"&resultType=core&format=json`; `https://api.crossref.org/works/<DOI>`; `https://api.openalex.org/works/doi:<DOI>`. Springer (Educational Psychology Review), Elsevier (ScienceDirect) and APA PsycNet blocked the fetcher (login redirect or 403), so for those journals the ERIC abstract was the deepest check possible. About 16 web searches were used; the rest of the lookups went straight to these APIs.

---

## What this means for the app and these two courses

Rules are grouped: A writing cards, B card types to add, C grading honestly, D stop doing, E sessions and exams. "Inference" marks my extrapolation, not a paper's claim.

### A. Writing a card

1. **One cue, one answer, with nothing else on screen.** Test every prompt: would a classmate who knows the material give the same answer with only this prompt in front of them? "Orthogonality: ____ to rules" fails, because the cue was the slide around it, and the slide is not on the card. Encoding specificity: a cue helps recall only if it was encoded with the item. Weak cues that were present at study raised recall (15.7 vs 10.7 words with no cue), while the same cues not present at study did not help (11.1 vs 14.1). A slide fragment is a cue you encoded once, in lecture; a self-contained question works on day 30. Specific retrieval questions beat unspecific ones when the material contains irrelevant detail (Eitel et al. 2022, N = 103, 1-week test), which lecture slides do. [Thomson & Tulving 1970 FULLTEXT; Tulving & Thomson 1973 EXISTENCE-ONLY; Eitel, Endres & Renkl 2022 ABSTRACT; Matuschak "precise", "consistent" PRACTITIONER]
   - Bad: `Orthogonality: ____ to rules`. Good: `In an orthogonal language, how many exceptions are there to the rules for combining constructs?` (the existing rewrite in `decks/csc370-blank-questions.js` already does this).

2. **Ask in the form the exam asks.** Transfer is largest when the practice response matches the test response (Pan & Rickard 2018, moderator "response congruency"; overall transfer d = 0.40). AUCSC 370 tests want short written answers, arguments and traces, so prompts should be "Define…", "Argue whether…", "Trace and give the output…". AUCSC 325 wants computations, so prompts should be "Compute the branch coverage of suite T on this function" and not "What is branch coverage?" alone. [Pan & Rickard 2018 ABSTRACT; Morris, Bransford & Franks 1977 EXISTENCE-ONLY (transfer-appropriate processing); McDaniel et al. 2007 ABSTRACT]

3. **Do not give many cards the same opening cue.** Three cards beginning "Orthogonality:" or ten beginning "Fault:" share a cue. A cue linked to many answers retrieves each of them less well (cue overload). Make the distinguishing part of the question come first: "Which kind of anomaly is a wrong statement in the source code?" rather than "Fault: ____". [Watkins & Watkins 1975 EXISTENCE-ONLY; Wozniak rule 11 "combat interference" PRACTITIONER. Inference: applying cue overload to card stems.]

4. **Keep each answer to about 1-4 idea units, and write those units as the card's `points`.** No study tests atomic vs complex cards (R2, and this search). What research does show is that students CAN learn multi-idea definitions by successive relearning (Rawson & Dunlosky 2011, R1) but CANNOT grade them honestly unless the answer is broken into idea units (rule 15). So the size limit is set by honest grading, not by memory: if you cannot list the points that must be present, the card is too big; split it. [Dunlosky et al. 2011 ABSTRACT; Lipko et al. 2009 ABSTRACT; Wozniak rule 4 "minimum information" PRACTITIONER; Matuschak "focused" PRACTITIONER]

5. **Lists: closed, ordered, and small, then one card per member.** Free recall of a set is hard, and how you cue it matters:
   - Showing some members as cues while asking for the rest (a list cloze such as "reliability, cost, ____, writeability") IMPAIRS recall of the rest. Meta-analysis: a robust, medium-sized impairment over 109 samples (N = 5,605), insensitive to list length and number of cues; it shrinks at longer retention intervals (Pepe et al. 2023), and can turn into facilitation after a long delay (Lehmer & Bäuml 2018). So list-cloze is a weak card early on.
   - Repeated free recall of the WHOLE list increases how organised recall becomes (more categories accessed, more clustering), which is part of why testing helps lists (Zaromb & Roediger 2010).
   - Middle items of a list are recalled worst, and first and last best (serial position; Murdock 1962).
   - So: one "Name all four, in the course's order" card (fixed order, so the answer is identical every time), plus one discrimination card per member ("Which top-level criterion does type checking feed?"), with the per-member cards weighted toward the middle items. Replace open-set prompts such as `Name at least four of the twelve sub-criteria` (the answer differs every time and cannot be graded) with either the full ordered list split into chunks of 3-4, or per-item cards. [Pepe et al. 2023 ABSTRACT; Lehmer & Bäuml 2018 FULLTEXT; Zaromb & Roediger 2010 ABSTRACT; Murdock 1962 ABSTRACT (partial); Wozniak rules 9-10 "avoid sets, convert to enumerations" PRACTITIONER; Matuschak "closed vs open lists" PRACTITIONER]

6. **Use cloze only for terms and notation; every concept also gets a question card.** Fill-in-the-blank (FITB) practice helped later recall of the SAME blanks but did not transfer to related questions (Hinze & Wiley 2011, 3 experiments, 2- and 7-day delays); only open-ended paragraph recall transferred. Pan et al. (2019, 6 experiments) also found FITB with feedback "improved learning but not transfer". In a real class, FITB quizzes and MC quizzes improved exam scores equally (Lawson 2022). Matuschak reports cloze cards give him "shallower understanding" because the surrounding text gives hints (PRACTITIONER, personal experience). For 370's 203 lecture blanks: keep them (they rehearse the slide wording the professor may reuse), but do not count a lecture's concept as covered until it also has a question or apply card. [Hinze & Wiley 2011 ABSTRACT; Pan et al. 2019 ABSTRACT; Lawson 2022 ABSTRACT; Matuschak note PRACTITIONER]

7. **No bare yes/no or binary prompts; attach "and why?" or rephrase as "which".** A binary answer can be guessed 50% of the time and carries no grading information. "Is HTML a programming language? Why or why not?" (already in the deck) is the right shape. [Matuschak "binary prompts" PRACTITIONER; Rowland 2014 retrieval success rates, R1. No research directly on binary prompts was found.]

### B. Card types to add

8. **Concrete-example cards, and "classify this example" cards.** Studying a definition followed by examples beat studying the definition twice on classifying NEW examples (Rawson, Thomas & Jacoby 2015: d = 0.74 to 1.67, 3 experiments). An independent replication found d = 0.30 (Micallef & Newton 2022), so expect a real but smaller effect. Classifying provided examples beat both reading and generating examples (Steininger et al. 2022, N = 83). Provided examples beat self-generated ones for long-term learning and efficiency (Zamary & Rawson 2018). Examples of DIFFERENT concepts should be interleaved (Rawson 2015, Exp. 2).
   - 325: "A developer typed `<` for `<=`. The loop index reached 11, and the report crashed. Name the fault, the error, and the failure." "This object returns canned answers and records nothing. Stub, mock, fake, or spy?"
   - 370: "`int x;` declared at file scope in C. When is x bound to its storage?" "Here are two outputs of the same program under static and dynamic scoping; which is which?"

9. **Worked example, then faded example, then solve, for every procedure.** Applies to: statement/branch coverage percentages, prime paths, mutation score, equivalence partitions and boundary values, BNF leftmost derivations and parse trees, static vs dynamic scope traces, binding-time classification. Worked examples have a medium effect on math performance (g = 0.48 over 55 studies; Barbieri et al. 2023). Fading (removing steps one at a time) helped near transfer (Renkl et al. 2002), and fading plus a prompt to name the principle behind each step gave medium-to-large near AND far transfer with no extra time (Atkinson, Renkl & Merrill 2003). Fade quickly: examples lose their value, and can hurt, as expertise grows (expertise reversal; Kalyuga et al. 2003), and this learner is a 3rd-year. Template: card 1 shows the full derivation; card 2 hides the last step; card 3 hides two; card 4 is a fresh problem. [Barbieri et al. 2023 ABSTRACT; Renkl et al. 2002 ABSTRACT; Atkinson et al. 2003 ABSTRACT; Kalyuga et al. 2003 ABSTRACT]

10. **Generated problems: different numbers or a different program at each review.** A procedural card that shows the same program every time becomes a fact card (you memorise "75%"). Variable practice lowers performance during training but improves long-term retention and transfer (Schmidt & Bjork 1992), and high-variability worked examples gave better transfer with less effort than low-variability ones (Paas & van Merriënboer 1994). Testing transfers worst "to rearranged stimulus-response items" and "to problems involving worked examples" (Pan & Rickard 2018). Build parameterised cards (a small function generator plus a solver) for coverage, mutation score, boundary values, and derivations; check every generated answer the way `verify` already checks traces. [Schmidt & Bjork 1992 ABSTRACT; Paas & van Merriënboer 1994 ABSTRACT; Pan & Rickard 2018 ABSTRACT]

11. **Mixed "which method applies?" sets for procedures, within a course.** Interleaving problem types beat blocking in a 7th-grade classroom RCT (61% vs 38% one month later, d = 0.83; Rohrer et al. 2020), in an earlier classroom study (d = 0.42 immediate, 0.79 at 30 days; Rohrer, Dedrick & Stershic 2015), and in undergraduate physics homework (median improvements of 50% and 125% on two surprise tests; Samani & Pan 2021), where students rated it harder and wrongly believed they learned less. For 325: one set mixing "which coverage criterion does this suite satisfy?", "which test double is this?", "which partition is missing?". For 370: one set mixing "static or dynamic scope?", "which binding time?", "which grammar is ambiguous?". [Rohrer et al. 2020 ABSTRACT; Rohrer, Dedrick & Stershic 2015 ABSTRACT; Samani & Pan 2021 ABSTRACT]

12. **Short "which rule licenses this step?" prompts on worked steps, not long free-form self-explanation.** Self-explanation prompts have a medium overall effect (g = 0.55, 69 effect sizes; Bisra et al. 2018). But in math worked-example studies, adding self-explanation prompts REDUCED the worked-example effect (Barbieri et al. 2023), while principle-naming prompts combined with fading helped (Atkinson 2003). Reconcile by keeping the prompt short and checkable: "Which production rule was applied here?", "Why is this node a boundary value?". Elaborative interrogation ("why is this true?") works best when the learner already has a rich knowledge base (Willoughby et al. 1994, 3 experiments, 304 college students), so add "why" cards to material already learned, not on day one. [Bisra et al. 2018 ABSTRACT; Barbieri et al. 2023 ABSTRACT; Atkinson et al. 2003 ABSTRACT; Willoughby et al. 1994 ABSTRACT; Dunlosky et al. 2013 rated both "moderate" (R2)]

13. **Diagram cards where the content is spatial: parse trees, scope chains, stack frames, control-flow graphs.** Text with simplified diagrams beat text alone for mental-model building, and simplified diagrams beat detailed ones for factual learning (Butcher 2006, 2 experiments). Prime paths and coverage cannot be computed without the CFG, so a prime-path card should show (or ask the learner to sketch) the graph. Use diagrams because the CONTENT is structural, not because of a "visual learning style" (rule 19). [Butcher 2006 ABSTRACT; Clark & Paivio 1991 EXISTENCE-ONLY (dual coding)]

14. **AUCSC 325: cards that target what testing students measurably get wrong.**
    - High coverage is not bug-finding: student suites averaged 95.4% branch coverage yet detected 13.6% of the faults present across 101 solutions, and 90% of suites were highly similar "happy path" tests (Edwards & Shams 2014). Card: "This suite reaches 100% branch coverage. Write an input it would not catch the bug on."
    - Black-box means spec only: students who had no test training thought they tested systematically but did not, and could only invent tests from code even when no code was given (Bijlsma et al. 2021, interviews of 11). Black-box partition cards should show ONLY a specification, never code.
    - What students miss: in a senior testing course (N = 46), decision coverage was missed in about 89-90% of submissions and exception tests in 35-42% (Andleeb et al. 2025). In a 230-student course, boundary tests were the 4th most common feedback theme (258 times; 142 times a boundary was not fully tested), and MC/DC was the topic most rated hard (49% of surveyed students) followed by "how much to test" (42%) (Aniche et al. 2019). Weight cards toward decision coverage, MC/DC, exception partitions and boundaries.
    - Mutation feedback: hints about live mutants gave a small but significant increase in mutants detected in a controlled experiment with 4,122 students (Perretta et al. 2025). Card: "Here is a mutant (`>` to `>=`). Give a test input that kills it." Mutation score cards should be generated (rule 10).
    - "Appear knowledgeable long before competence": students could define equivalence classes and explain a boundary table but could not apply the method (Kaner 2004, teaching report). Definition cards alone will produce this exact illusion.
    [Edwards & Shams 2014 ABSTRACT; Bijlsma et al. 2021 ABSTRACT; Andleeb et al. 2025 FULLTEXT (preprint); Aniche, Hermans & van Deursen 2019 FULLTEXT; Perretta et al. 2025 ABSTRACT; Kaner 2004 FULLTEXT]

### C. Grading honestly

15. **Self-grade point by point, and let the app compute the verdict.** Today a `recall` card shows "Count it if you had" points and then asks one binary question (Got it / Missed it). Students award themselves credit for completely wrong answers: 43% of the time in Rawson & Dunlosky 2007 (as reported by Grimaldi & Karpicke 2014); students' false-positive rate was .42 vs .18 for an automatic scorer (Grimaldi & Karpicke 2014, FULLTEXT). Showing the correct definition cut credit given to wrong answers from 73% to 44%, and asking a yes/no judgment on EACH idea unit cut it further (Lipko et al. 2009); idea-unit judgments also reduced overconfidence in college students (Dunlosky et al. 2011). Change the UI to a checkbox per point ("Did your answer say this?"), then mark Got it only if every required point is ticked. (Highlighting the expected answer during self-scoring did not significantly help in Grimaldi & Karpicke: 74% vs 69% agreement, p = .26, so per-point checking is the part that matters.) [Lipko et al. 2009 ABSTRACT; Dunlosky et al. 2011 ABSTRACT; Grimaldi & Karpicke 2014 FULLTEXT; Rawson & Dunlosky 2007 SECONDARY]

16. **Keep the "type something before reveal" rule (L1), and add a cheap keyword check.** Typing does not improve memory over thinking the answer (Smith, Roediger & Karpicke 2013, 4 experiments, including 2-day delay). It matters for a different reason: judgments of what you know were accurate only when a recall attempt was REQUIRED before judging (Dunlosky, Rawson & Middleton 2005), and seeing the answer creates a sense of "I knew that" because the answer makes the cue-answer link feel stronger than it is when the cue is alone (Koriat & Bjork 2005). Add a check modelled on QuickScore: if the learner clicks Got it but none of a point's key terms appear in what they typed, ask "Are you sure? Your answer doesn't mention X." [Smith et al. 2013 ABSTRACT; Dunlosky, Rawson & Middleton 2005 ABSTRACT; Koriat & Bjork 2005 ABSTRACT; Grimaldi & Karpicke 2014 FULLTEXT. The keyword check is inference.]

17. **Show calibration from delayed data: "When you said Sure on cards last seen 1+ days ago, you were right X%."** Overconfidence is not harmless: in two studies, students whose self-judgments were more accurate retained more 2 days later, and this was not explained by feedback, effort or trials to criterion (Dunlosky & Rawson 2012); overconfident students stop practising too early. Judgments made after a delay are much more accurate than immediate ones (delayed-JOL effect: g = 0.93 on relative accuracy, 112 effect sizes; Rhodes & Tauber 2011; Nelson & Dunlosky 1991). At the level of single questions, students of all ability levels had trouble telling which questions they would get right (Lindsey & Nagel 2015). The app's Sure/Guess tap (L6) already collects the data; this rule only displays it. [Dunlosky & Rawson 2012 ABSTRACT; Rhodes & Tauber 2011 ABSTRACT; Nelson & Dunlosky 1991 ABSTRACT; Lindsey & Nagel 2015 ABSTRACT]

### D. Stop doing

18. **Stop rereading slides as "study", and do not trust that a lecture you can follow is learned.** Rereading a text gave little or no benefit on educationally relevant tests in 4 experiments (Callender & McDaniel 2009); most students still reread rather than self-test (Karpicke, Butler & Roediger 2009, survey of 177). Low-utility: highlighting, summarising, rereading (Dunlosky et al. 2013, R2). [Callender & McDaniel 2009 ABSTRACT; Karpicke, Butler & Roediger 2009 ABSTRACT]

19. **Ignore "learning styles" (visual/auditory/kinaesthetic).** The meshing hypothesis requires a style-by-method crossover interaction; Pashler et al. (2008) set out that test and found the evidence lacking. A later test using that design found no relationship between auditory/visual preference and learning from audiobook vs e-text, immediately or after 2 weeks (Rogowsky, Calhoun & Tallal 2015). Choose the format by the content (rule 13), not by a self-label. [Pashler et al. 2008 ABSTRACT; Rogowsky et al. 2015 ABSTRACT]

20. **Do not make up your own examples as the first way to learn a definition.** Generated examples were less effective and less efficient than provided ones (Zamary & Rawson 2018), and generating examples made learners overly optimistic about what they had learned (Steininger et al. 2022). Generate examples only after the definition is stable, and check them against the source. [Zamary & Rawson 2018 ABSTRACT; Steininger et al. 2022 ABSTRACT]

21. **Do not let a procedural card be "learned" by memorising its one answer.** If the same coverage problem shows up again, you will retrieve "75%", not the method; the card will look mastered while the skill is not (Kaner 2004's "appear knowledgeable"; Pan & Rickard 2018 on weak transfer to rearranged items). Retire fixed-number procedural cards once a generator exists (rule 10). [Kaner 2004 FULLTEXT; Pan & Rickard 2018 ABSTRACT]

### E. Sessions and exams

22. **Cap new cards by minutes, not by count, and keep the daily due load small enough to start without dread.** UNVERIFIED as research: no study found sets a session length or a new-cards-per-day number. Arithmetic from the app's own rules (L8, L9): a new card needs at least 3 correct answers on day 1, then reviews at 1, 3, 7, 14, 30, 60, 120 days, so roughly 10 answers in its first four months even with no misses; 20 new cards a day means about 60 first-day answers plus a growing review tail. Inference for this learner (avoidance tendency): a short, fixed daily session that always ends is more likely to happen than a long one; cap new cards so that the due load stays under the time he will actually sit down for. Measure it from the log rather than guessing.

23. **Mixing the two courses in one session is a convenience choice, not a learning gain.** Alternating flashcards from two unrelated topics (anatomy terms and Indonesian vocabulary) had no reliable effect, positive or negative, in four experiments, in one day or over two days (Hausman & Kornell 2014). Interleaving pays off for confusable problem types WITHIN a course (rule 11; Brunmair & Richter 2019 in R1). So: mix 370 and 325 if that makes it easier to start; just don't expect it to help. [Hausman & Kornell 2014 ABSTRACT]

24. **Learn new cards in the evening, relearn them the next morning; never trade sleep for review before an exam.** Learning foreign vocabulary in the evening, sleeping, and relearning in the morning halved the practice needed to relearn and gave better retention at 1 week and 6 months than the same 12-hour gap within one day (Mazza et al. 2016, N = 40). Sleep supports consolidation of newly learned material (Diekelmann & Born 2010, review). In 14-day diaries (N = 535 high-school students), studying more than usual at the expense of sleep was followed by MORE trouble understanding class material and on tests the next day (Gillen-O'Neel et al. 2013; correlational, within-person). [Mazza et al. 2016 ABSTRACT; Diekelmann & Born 2010 ABSTRACT; Gillen-O'Neel et al. 2013 ABSTRACT]

25. **Exam prep = successive relearning started at lecture time, then mixed exam-format practice in the last week.** Successive relearning on a virtual flashcard program raised exam performance in a difficult biopsychology course by at least 10% (d = 0.54 to 1.10, 2 experiments; Janes et al. 2020); this replicates the intro-psych result in R1. The app's exam cap (L9) already shortens intervals as the exam nears. In the final week, add mixed sets in the test's own format (short arguments and traces for 370; computations and partition designs for 325), because transfer is best when the practice response matches the test (rule 2). [Janes et al. 2020 ABSTRACT; Pan & Rickard 2018 ABSTRACT; Rawson, Dunlosky & Sciartelli 2013 in R1]

---

## Source entries

Format: citation · URL loaded · tag · design · finding · implication · caveats.

### 1. Item writing: cues, specificity, lists, cloze

**1.1 Thomson, D. M., & Tulving, E. (1970). Associative encoding and retrieval: Weak and strong cues. *Journal of Experimental Psychology, 86*(2), 255-262.** [FULLTEXT]
- URL: https://support.pstnet.com/hc/en-us/article_attachments/360082711074 (PDF, 9 pages; header confirms journal, volume, pages). DOI not recorded.
- Design: 3 experiments; word lists studied with weak associate cues, strong associate cues, or no cues; recall with weak, strong, or no cues.
- Finding (Exp. I means): weak cues at both study and test 15.7 words vs 10.7 with no test cue; weak cues at test that were NOT present at study 11.1 vs 14.1 (no help); strong cues at test after weak cues at study 13.9, much less than strong cues after no cue or strong cues at study (19.0, 20.2).
- Implication: a cue works only if it was part of how the item was stored. A slide fragment taken out of the slide is a broken cue (rule 1).
- Caveats: word lists, immediate recall; lab sample.

**1.2 Tulving, E., & Thomson, D. M. (1973). Encoding specificity and retrieval processes in episodic memory. *Psychological Review, 80*(5), 352-373. DOI 10.1037/h0020071.** [EXISTENCE-ONLY]
- URL: https://api.crossref.org/works/10.1037/h0020071 (also OpenAlex). No abstract available to me; PsycNet blocked.
- Use here: only as the name of the principle tested in 1.1. A web-search summary notes later work questioned the generality of cue-dependent forgetting results; not verified.

**1.3 Morris, C. D., Bransford, J. D., & Franks, J. J. (1977). Levels of processing versus transfer appropriate processing. *JVLVB, 16*(5), 519-533. DOI 10.1016/S0022-5371(77)80016-9.** [EXISTENCE-ONLY]
- URL: Crossref and OpenAlex records. Claimed here only as the origin of the term; the evidence used for rule 2 is Pan & Rickard 2018 (5.1).

**1.4 Watkins, O. C., & Watkins, M. J. (1975). Buildup of proactive inhibition as a cue-overload effect. *JEP: Human Learning and Memory, 1*(4), 442-452. DOI 10.1037/0278-7393.1.4.442.** [EXISTENCE-ONLY]
- URL: Crossref and OpenAlex. Abstract elided by the publisher. Used only for the term "cue overload" in rule 3; the rule is inference.

**1.5 Eitel, A., Endres, T., & Renkl, A. (2022). Specific questions during retrieval practice are better for texts containing seductive details. *Applied Cognitive Psychology*. DOI 10.1002/acp.3984. ERIC EJ1349145.** [ABSTRACT]
- URL: https://api.ies.ed.gov/eric/?search=id:EJ1349145&format=json
- Design: N = 103, 2 x 2 (text with/without seductive details x specific/unspecific retrieval questions); posttest 1 week later.
- Finding: with seductive details present, specific questions gave better learning outcomes than an unspecific question.
- Implication: lecture slides are full of side detail; specific prompts aim retrieval at the point that matters (rule 1).
- Caveats: one text (coffee), one study; "unspecific" here means a broad recall prompt, not an ambiguous fragment.

**1.6 Hinze, S. R., & Wiley, J. (2011). Testing the limits of testing effects using completion tests. *Memory, 19*(3), 290-304. DOI 10.1080/09658211.2011.560121. PMID 21500089.** [ABSTRACT]
- URL: Europe PMC (DOI query).
- Design: 3 experiments; fill-in-the-blank (FITB) tests on a science text; final test with repeated and related items; 2-day and 7-day delays; Exp. 3 compared FITB with paragraph recall.
- Finding: FITB helped only repeated items, not related items; only open-ended paragraph recall improved transfer to novel questions.
- Implication: cloze cards train the exact blank (rule 6).
- Caveats: prose text, not CS; no effect sizes in abstract.

**1.7 Pan, S. C., Hutter, S. A., D'Andrea, D., & Unwalla, D. (2019). In search of transfer following cued recall practice: The case of process-based biology concepts. *Applied Cognitive Psychology*. DOI 10.1002/acp.3506. ERIC EJ1262450.** [ABSTRACT]
- URL: ERIC API (id) and Semantic Scholar record.
- Design: 6 experiments on process-based biology concepts.
- Finding: FITB with immediate or delayed repeated feedback improved learning but not transfer; questions on process steps, order or inferences did not improve transfer either; transfer appeared only with "retrieval-verification-scoring" (difficult FITB plus extensive feedback processing).
- Implication: transfer from cued recall is hard to get; procedures need variable practice (rule 10).
- Caveats: biology; effect sizes not in abstract.

**1.8 Lawson, T. J. (2022). Effects of cued-recall versus recognition retrieval practice on beginning college students' exam performance. *College Teaching*. ERIC EJ1352095.** [ABSTRACT]
- URL: ERIC API (keyword search result; DOI not recorded).
- Design: intro psychology; chapters assigned to no-quiz, FITB-quiz or MC-quiz conditions.
- Finding: both quiz types improved exam scores; no significant difference between them.
- Caveats: one course, one instructor; exams were presumably MC (not stated in the abstract).

**1.9 McDaniel, M. A., Anderson, J. L., Derbish, M. H., & Morrisette, N. (2007). Testing the testing effect in the classroom. *European Journal of Cognitive Psychology, 19*(4-5), 494-513. DOI 10.1080/09541440701326154.** [ABSTRACT]
- URL: https://api.openalex.org/works/doi:10.1080/09541440701326154
- Design: college course; weekly MC or short-answer quizzes with feedback vs extra reading; MC unit tests and final.
- Finding: quizzing, not extra reading, improved criterial tests; short-answer quizzes gave more robust benefits than MC.
- Implication: recall-style prompts are worth their extra cost (supports L2, rule 2).
- Caveats: no effect sizes in the abstract.

**1.10 Murdock, B. B. (1962). The serial position effect of free recall. *Journal of Experimental Psychology, 64*(5), 482-488. DOI 10.1037/h0045106.** [ABSTRACT, truncated]
- URL: OpenAlex record (abstract cut off mid-sentence).
- Finding (as far as loaded): steep primacy over the first 3-4 words, S-shaped recency over the last 8, flat middle.
- Implication: middle members of a list are the weak ones (rule 5).
- Caveats: long lists (10-40 words), immediate recall; course lists are short and relearned, so this is a weak inference.

**1.11 Slamecka, N. J. (1968). An examination of trace storage in free recall. *Journal of Experimental Psychology, 76*, 504-513. DOI 10.1037/h0025695.** [EXISTENCE-ONLY]
- Confirmed via the reference list of Lehmer & Bäuml 2018 (1.13) and the Semantic Scholar record (abstract elided). Origin of the part-list cuing paradigm. No finding claimed from it directly.

**1.12 Pepe, N. W., Moyer, A., Peña, T., & Rajaram, S. (2023). Deceitful hints: A meta-analytic review of the part-list cuing impairment in recall. *Psychonomic Bulletin & Review*. DOI 10.3758/s13423-023-02263-9. PMID 36917371.** [ABSTRACT]
- URL: Europe PMC (DOI query).
- Design: meta-analysis, 109 samples, N = 5,605.
- Finding: robust, medium-sized impairment when some studied items are given as cues; not significantly sensitive to number of study items, item relations, number of cues, or recall time; longer retention periods mitigate it.
- Implication: list-cloze (show 3, ask for the 4th) is a handicapped retrieval cue (rule 5).
- Caveats: word lists studied once; the exact pooled d is not in the abstract.

**1.13 Lehmer, E. M., & Bäuml, K.-H. T. (2018). The many faces of part-list cuing: Evidence for the interplay between detrimental and beneficial mechanisms. *Frontiers in Psychology, 9*, 701. DOI 10.3389/fpsyg.2018.00701. PMID 29867667.** [FULLTEXT]
- URL: https://www.ebi.ac.uk/europepmc/webservices/rest/PMC5958219/fullTextXML (full text read).
- Finding: impairment is explained by blocking, inhibition, or disruption of the learner's own retrieval order; part-list cues IMPROVED recall after a 48-hour delay where they impaired it after a few minutes (Bäuml & Schlichting 2014, as reviewed); impairment depends on how associatively the list was encoded.
- Implication: list-cloze may be fine on long-interval reviews and harmful in the first session (rule 5).
- Caveats: narrative review; word lists.

**1.14 Zaromb, F. M., & Roediger, H. L. (2010). The testing effect in free recall is associated with enhanced organizational processes. *Memory & Cognition, 38*(8), 995-1008. DOI 10.3758/MC.38.8.995. PMID 21156864.** [ABSTRACT]
- URL: Europe PMC.
- Finding: recall 2 days later rose with the number of tests and fell with the number of study-only trials; testing increased categories accessed, items per category, and clustering.
- Implication: "name all N in order" is itself a useful card (rule 5).
- Caveats: categorised word lists.

**1.15 Wozniak, P. (1999, updated). Effective learning: Twenty rules of formulating knowledge.** [PRACTITIONER]
- URL: https://www.supermemo.com/en/archives1990-2015/articles/20rules (page loaded).
- Content used: rule 4 minimum information; 5 cloze "easy and effective"; 9 avoid sets ("listing members in varying order at each repetition has a disastrous effect on memory"; convert sets to enumerations); 10 avoid enumerations, use cloze if unavoidable; 11 interference is "probably the single greatest cause of forgetting"; 17 redundancy is acceptable.
- Evidence: none controlled; anecdotes (an item forgotten 20 times in a year until an example was added).
- Note: his rule 5 (cloze is effective) conflicts with Hinze & Wiley and Pan et al. on transfer, and his rule 10 (cloze for enumerations) conflicts with the part-list cuing literature for early reviews. Research wins where they conflict.

**1.16 Matuschak, A. (2020). How to write good prompts: Using spaced repetition to create understanding.** [PRACTITIONER]
- URLs: https://andymatuschak.org/prompts/ ; note https://notes.andymatuschak.org/zPJt42JTcoAPTTTa2vdDonV
- Content used: prompts should be focused, precise, consistent, tractable, effortful; closed lists vs open lists; avoid binary prompts; cloze invites pattern matching; the note claims cloze produces "less understanding" than question-answer pairs.
- Evidence: the author states the evidence "stops well short of exact guidance"; the cloze claim is first-person experience ("I find").

### 2. Elaboration inside the card

**2.1 Rawson, K. A., Thomas, R. C., & Jacoby, L. L. (2015). The power of examples: Illustrative examples enhance conceptual learning of declarative concepts. *Educational Psychology Review, 27*(3), 483-504. DOI 10.1007/s10648-014-9273-3. ERIC EJ1071985.** [ABSTRACT]
- URL: ERIC API; Springer page redirected to login.
- Design: 3 experiments; definitions followed by illustrative examples vs extra study of definitions; classification test on new examples.
- Finding: d = 0.74 to 1.67 for examples; order (before/after definition) did not matter; classification depended on interleaving examples of different concepts and on presenting definitions with examples.
- Implication: rule 8.
- Caveats: psychology concepts; lab.

**2.2 Micallef, A., & Newton, P. M. (2022/2024). The use of concrete examples enhances the learning of abstract concepts: A replication study. *Teaching of Psychology*. DOI 10.1177/00986283211058069. ERIC EJ1404608.** [ABSTRACT]
- URL: OpenAlex and ERIC.
- Finding: replicated Rawson Exp. 1 with paid online non-psychology participants; d = 0.30.
- Implication: real effect, smaller than the original; expect modest gains.

**2.3 Zamary, A., & Rawson, K. A. (2018). Which technique is most effective for learning declarative concepts: Provided examples, generated examples, or both? *Educational Psychology Review*. DOI 10.1007/s10648-016-9396-9. ERIC EJ1170236.** [ABSTRACT]
- Design: 2 experiments, 10 social-psychology concepts; provided vs generated vs alternating; classification and definition tests 2 days later.
- Finding: long-term learning and study efficiency were greater for provided examples than the other techniques.
- Implication: rules 8, 20.

**2.4 Steininger, T. M., Wittwer, J., & Voss, T. (2022). Classifying examples is more effective for learning relational categories than reading or generating examples. *Instructional Science*. DOI 10.1007/s11251-022-09584-7.** [ABSTRACT]
- URL: OpenAlex (open access).
- Design: N = 83 student teachers; reading vs generating vs classifying examples.
- Finding: classifying beat reading and generating for conceptual learning; reading = generating; generating led to "overly optimistic judgments of conceptual learning".
- Implication: "which concept is this?" cards (rule 8); generating examples feels better than it works (rule 20).

**2.5 Bisra, K., Liu, Q., Nesbit, J. C., Salimi, F., & Winne, P. H. (2018). Inducing self-explanation: A meta-analysis. *Educational Psychology Review, 30*(3), 703-725. DOI 10.1007/s10648-018-9434-x. ERIC EJ1186664.** [ABSTRACT]
- Finding: 69 effect sizes from 64 reports; g = 0.55 overall; 20 moderators coded (not reported in the abstract).
- Caveats: moderator results not verified; see the conflict with 2.10.

**2.6 Gonçalves, A. de O., Muniz, B. F. B., & Jaeger, A. (2025). Retrieval practice versus elaborative encoding: A systematic and meta-analytic review. *Educational Psychology Review*. DOI 10.1007/s10648-025-10076-6. ERIC EJ1492680.** [ABSTRACT]
- Finding: 44 studies, 142 comparisons; retrieval beat elaborative conditions by only g = 0.14 overall; free recall beat cued recall as the retrieval format (g = 0.23); retrieval's advantage depended on feedback (g = 0.50 with feedback), and without feedback elaboration did better; retrieval beat concept mapping and group discussion but was indistinguishable from other elaborative tasks.
- Implication: retrieval is not magic versus good elaboration; keep feedback on every card (L5), and adding a "why" is not a waste.
- Caveats: very recent; not yet cited enough to judge.

**2.7 Willoughby, T., et al. (1994). Isolating variables that impact on or detract from the effectiveness of elaboration strategies. *Journal of Educational Psychology*. ERIC EJ490268.** [ABSTRACT]
- Finding: 3 experiments, 304 college students; elaborative interrogation most effective with a rich knowledge base; with low knowledge, imagery strategies did better.
- Implication: "why" cards after, not before, the basics (rule 12).

**2.8 Butcher, K. R. (2006). Learning from text with diagrams: Promoting mental model development and inference generation. *Journal of Educational Psychology, 98*(1). ERIC EJ734393.** [ABSTRACT]
- Finding: 2 experiments (heart/circulatory system): diagrams of both kinds supported mental-model development; simplified diagrams best supported factual learning and integration; diagrams reduced comprehension errors.
- Implication: rule 13; keep diagrams simple.

**2.9 Clark, J. M., & Paivio, A. (1991). Dual coding theory and education. *Educational Psychology Review, 3*(3), 149-210. DOI 10.1007/BF01320076.** [EXISTENCE-ONLY]
- Theory reference only; no claim drawn from it.

**2.10 Barbieri, C. A., Miller-Cotto, D., Clerjuste, S. N., & Chawla, K. (2023). A meta-analysis of the worked examples effect on mathematics performance. *Educational Psychology Review, 35*. DOI 10.1007/s10648-023-09745-1. ERIC EJ1364058.** [ABSTRACT]
- Finding: 43 articles, 55 studies, 181 effect sizes; g = 0.48; adding self-explanation prompts moderated the effect NEGATIVELY; correct examples alone beat incorrect or mixed; medium effect whether for practice or initial acquisition.
- Implication: worked examples for procedures (rule 9); be careful with long self-explanation prompts (rule 12).
- Caveats: mostly K-12; this conflicts with Atkinson 2003 and Bisra 2018 (see Contested).

**2.11 Renkl, A., Atkinson, R. K., Maier, U. H., & Staley, R. (2002). From example study to problem solving: Smooth transitions help learning. *Journal of Experimental Education, 70*, 293-315. ERIC EJ658398.** [ABSTRACT] (R3 had this as EXISTENCE-ONLY.)
- Finding: fading vs example-problem pairs with 20 ninth graders, 54 and 45 college students; fading fostered near transfer; far transfer unclear.

**2.12 Atkinson, R. K., Renkl, A., & Merrill, M. M. (2003). Transitioning from studying examples to solving problems: Effects of self-explanation prompts and fading worked-out steps. *Journal of Educational Psychology, 95*. ERIC EJ678596.** [ABSTRACT]
- Finding: fading combined with prompts to identify the principle behind each step produced medium-to-large effects on near and far transfer across 2 experiments without extra time on task.
- Implication: principle-naming prompts on faded steps (rules 9, 12).

**2.13 Kalyuga, S., Ayres, P., Chandler, P., & Sweller, J. (2003). The expertise reversal effect. *Educational Psychologist, 38*(1), 23-31. DOI 10.1207/S15326985EP3801_4.** [ABSTRACT]
- URL: OpenAlex (open-access link http://handle.unsw.edu.au/1959.4/42177 listed).
- Finding (review): techniques that help novices "can lose their effectiveness and even have negative consequences" with more experienced learners.
- Implication: fade fast for a 3rd-year; skip the full worked example once the first faded card is answered correctly (rule 9; inference).

**2.14 Paas, F. G. W. C., & van Merriënboer, J. J. G. (1994). Variability of worked examples and transfer of geometrical problem-solving skills. *Journal of Educational Psychology, 86*(1), 122-133. DOI 10.1037/0022-0663.86.1.122.** [ABSTRACT]
- Finding: 4 training strategies (CNC machine programming geometry); learners who studied worked examples gained most from HIGH-variability examples, invested less effort, and transferred better than those who solved problems first.
- Implication: generate varied instances (rule 10).

### 3. Popular but wrong

**3.1 Pashler, H., McDaniel, M., Rohrer, D., & Bjork, R. (2008). Learning styles: Concepts and evidence. *Psychological Science in the Public Interest, 9*(3), 105-119. DOI 10.1111/j.1539-6053.2009.01038.x. PMID 26162104.** [ABSTRACT]
- Finding: valid support for learning-styles instruction requires a specific crossover interaction (style x method) under random assignment; the review concluded such evidence was lacking (the "meshing hypothesis" is unsupported).
- Implication: rule 19.

**3.2 Rogowsky, B. A., Calhoun, B. M., & Tallal, P. (2015). Matching learning style to instructional method: Effects on comprehension. *Journal of Educational Psychology*. DOI 10.1037/a0037478. ERIC EJ1055886.** [ABSTRACT]
- Finding: using Pashler's design with college-educated adults, no relationship between auditory/visual preference and comprehension from audiobook vs e-text, immediately or 2 weeks later.

**3.3 Callender, A. A., & McDaniel, M. A. (2009). The limited benefits of rereading educational texts. *Contemporary Educational Psychology, 34*(1), 30-41. DOI 10.1016/j.cedpsych.2008.07.001. ERIC EJ819481.** [ABSTRACT]
- Finding: 4 experiments with textbook chapters / Scientific American article; "with only several exceptions, rereading did not significantly increase performance"; reading ability did not change this.

**3.4 Karpicke, J. D., Butler, A. C., & Roediger, H. L. (2009). Metacognitive strategies in student learning: Do students practise retrieval when they study on their own? *Memory, 17*(4), 471-479. DOI 10.1080/09658210802647009. PMID 19358016.** [ABSTRACT]
- Finding: survey of 177 students; most repeatedly reread notes or textbook; few self-test. (Grimaldi & Karpicke 2014 report the figures as 84% reread vs 11% self-test.)

### 4. Illusions of competence and self-scoring

**4.1 Koriat, A., & Bjork, R. A. (2005). Illusions of competence in monitoring one's knowledge during study. *JEP: LMC, 31*(2), 187-194. DOI 10.1037/0278-7393.31.2.187. PMID 15755238.** [ABSTRACT]
- Finding: judgments of learning are made with the answer present, which is absent at test; the felt link between cue and answer when both are present drives JOLs, while the cue-alone link drives later recall.
- Implication: "I knew that" after reveal is the expected illusion; commit before reveal (rule 16).

**4.2 Nelson, T. O., & Dunlosky, J. (1991). When people's judgments of learning (JOLs) are extremely accurate at predicting subsequent recall: The "delayed-JOL effect". *Psychological Science, 2*(4), 267-271. DOI 10.1111/j.1467-9280.1991.tb00147.x.** [ABSTRACT]
- Finding: JOLs made on the cue alone shortly after study, rather than immediately, become highly accurate.

**4.3 Rhodes, M. G., & Tauber, S. K. (2011). The influence of delaying judgments of learning on metacognitive accuracy: A meta-analytic review. *Psychological Bulletin, 137*(1), 131-148. DOI 10.1037/a0021705. PMID 21219059.** [ABSTRACT]
- Finding: 112 effect sizes, 4,554 participants: delayed JOLs much more accurate (g = 0.93); delayed JOLs also slightly improve memory (g = 0.08, 98 effect sizes).
- Implication: calibrate from 1+ day data (rule 17).

**4.4 Dunlosky, J., Rawson, K. A., & Middleton, E. L. (2005). What constrains the accuracy of metacomprehension judgments? *Journal of Memory and Language*. DOI 10.1016/j.jml.2005.01.011. ERIC EJ698013.** [ABSTRACT]
- Finding: term-specific judgments beat global ones, "but only when pre-judgment recall was required"; accuracy was also limited by accessing incorrect information.

**4.5 Lipko, A. R., Dunlosky, J., Hartwig, M. K., & Rawson, K. A. (2009). Using standards to improve middle school students' accuracy at evaluating the quality of their recall. *JEP: Applied*. DOI 10.1037/a0017599. ERIC EJ867031.** [ABSTRACT]
- Finding: students gave full or partial credit to 73% of commission errors with no standard vs 44% with the full correct definition; idea-unit standards reduced overconfidence further.
- Caveats: middle-school students; see 4.6 for college.

**4.6 Dunlosky, J., Hartwig, M. K., Rawson, K. A., & Lipko, A. R. (2011). Improving college students' evaluation of text learning using idea-unit standards. *Quarterly Journal of Experimental Psychology, 64*(3), 467-484. DOI 10.1080/17470218.2010.502239. PMID 20700858.** [ABSTRACT]
- Finding: college students were overconfident even with commission errors; idea-unit judgments reduced overconfidence; students were overconfident even when grading OTHER students' answers; self-generated idea units also helped.
- Implication: per-point checkboxes (rule 15).

**4.7 Rawson, K. A., & Dunlosky, J. (2007). Improving students' self-evaluation of learning for key concepts in textbook materials. *European Journal of Cognitive Psychology, 19*, 559-579. DOI 10.1080/09541440701326022.** [SECONDARY]
- Number from Grimaldi & Karpicke 2014 (4.9): students given the correct answer gave full or partial credit to completely incorrect responses 43% of the time. Not read directly.

**4.8 Dunlosky, J., & Rawson, K. A. (2012). Overconfidence produces underachievement: Inaccurate self evaluations undermine students' learning and retention. *Learning and Instruction, 22*(4), 271-280. DOI 10.1016/j.learninstruc.2011.08.003. ERIC EJ964388.** [ABSTRACT]
- URL: ERIC API; ScienceDirect returned 403.
- Design: 2 studies; college students typed key-term definitions in cued recall, judged their own answer, and continued until a definition had been JUDGED correct 3 times; final test 2 days later. Study 1 manipulated judgment accuracy; Study 2 used individual differences.
- Finding: greater judgment accuracy went with higher retention, not explained by feedback, effort or trials to criterion.
- Implication: the app's criterion rule (L8) is only as good as the self-grade that feeds it (rules 15-17). This is exactly the app's design, so it is the most directly relevant study here.
- Caveats: effect sizes not in the abstract; psychology definitions.

**4.9 Grimaldi, P. J., & Karpicke, J. D. (2014). Guided retrieval practice of educational materials using automated scoring. *Journal of Educational Psychology*. DOI 10.1037/a0033208. ERIC EJ1054491.** [FULLTEXT]
- URL: https://learninglab.psych.purdue.edu/downloads/2014/2014_Grimaldi_Karpicke_JEDP.pdf
- Design: anatomy materials; Exp. 1A/1B repeated retrieval vs repeated study with automatic scoring (QuickScore); Exp. 2 compared QuickScore with student self-scoring, with or without highlighted answer keywords.
- Finding: retrieval vs study on the 2-day test .71 vs .54 (d = 0.79) and .70 vs .58 (d = 0.87). Self-scoring false positives .42 vs QuickScore .18 (QuickScore false negatives .26 vs students .08). Agreement with raters: QuickScore 78%; students 72%; highlighting 74% vs 69%, not significant (p = .26).
- Implication: automatic checks beat self-scoring at catching wrong "Got it"s (rules 15-16).

**4.10 Smith, M. A., Roediger, H. L., & Karpicke, J. D. (2013). Covert retrieval practice benefits retention as much as overt retrieval practice. *JEP: LMC, 39*(6), 1712-1725. DOI 10.1037/a0033569. PMID 23815513.** [ABSTRACT]
- Finding: 4 experiments; covert and overt retrieval gave equivalent testing effects, including after 2 days; covert beat restudy.
- Implication: require typing for grading honesty, not for memory (rule 16).

**4.11 Lindsey, B. A., & Nagel, M. L. (2015). Do students know what they know? *Physical Review Special Topics - Physics Education Research, 11*, 020103. ERIC EJ1069909.** [ABSTRACT]
- Finding: at the overall-score level, a Dunning-Kruger pattern; at the single-question level, students of all ability levels had difficulty telling which questions they would get right.

### 5. When fact cards stop helping

**5.1 Pan, S. C., & Rickard, T. C. (2018). Transfer of test-enhanced learning: Meta-analytic review and synthesis. *Psychological Bulletin, 144*(7), 710-756. DOI 10.1037/bul0000151. PMID 29733621.** [ABSTRACT]
- Finding: 192 transfer effect sizes, 122 experiments, N = 10,382; transfer d = 0.40 (95% CI 0.31-0.50). Greatest across test formats, to application/inference questions; weakest to rearranged stimulus-response items, untested material, and problems involving worked examples. Response congruency, elaborated retrieval, and initial test performance strongly moderate. After publication-bias correction the intercept often showed NO positive transfer when none of those moderators was present.
- Implication: retrieval practice transfers only when designed to (rules 2, 10, 21).

**5.2 Schmidt, R. A., & Bjork, R. A. (1992). New conceptualizations of practice. *Psychological Science, 3*(4), 207-218. DOI 10.1111/j.1467-9280.1992.tb00029.x.** [ABSTRACT]
- Finding (review): manipulations that maximise performance during training can harm long-term retention and transfer; those that slow acquisition can help; parallel in motor and verbal learning.

**5.3 Kaner, C. (2004). Teaching domain testing: A status report. *Proc. 17th Conference on Software Engineering Education and Training (CSEE&T)*. DOI 10.1109/CSEE.2004.1276519.** [FULLTEXT]
- URL: https://kaner.com/pdfs/domain_testing_cseet.pdf (DOI via Crossref bibliographic search).
- Content: domain testing = equivalence partitioning / boundary analysis / category partitioning; "seems easy to explain and teach but students can appear knowledgeable long before they achieve competence". Students could define equivalence classes and read a boundary table (Bloom levels 1-2) but could not yet apply it; common errors: poor choice of variables, missing error-handling cases (fixed by end of term for most), excess redundant values (e.g. 97, 98 along with 99, 100).
- Caveats: a teacher's experience report, not a controlled study.

**5.4 Rohrer, D., Dedrick, R. F., & Stershic, S. (2015). Interleaved practice improves mathematics learning. *Journal of Educational Psychology, 107*(3), 900-908. DOI 10.1037/edu0000001.** [ABSTRACT]
- URL: Semantic Scholar record. N = 126 7th graders over 3 months; interleaved beat blocked, d = 0.42 (1 day) and 0.79 (30 days).

**5.5 Rohrer, D., Dedrick, R. F., Hartwig, M. K., & Cheung, C.-N. (2020). A randomized controlled trial of interleaved mathematics practice. *Journal of Educational Psychology*. DOI 10.1037/edu0000367. ERIC EJ1237752.** [ABSTRACT]
- Preregistered cluster RCT, 54 7th-grade classes, 4 months; unannounced test one month later: 61% vs 38%, d = 0.83.

**5.6 Samani, J., & Pan, S. C. (2021). Interleaved practice enhances memory and problem-solving ability in undergraduate physics. *npj Science of Learning*. DOI 10.1038/s41539-021-00110-x.** [ABSTRACT]
- Two lecture sections over 8 weeks, thrice-weekly homework interleaved vs blocked; median improvements of 50% and 125% on two surprise tests of novel, harder problems; students rated interleaving harder and believed they learned less.
- Implication: the closest population to this learner (university STEM, problem solving).

### 6. Teaching software testing and PL

**6.1 Edwards, S. H. (2004). Using software testing to move students from trial-and-error to reflection-in-action. *SIGCSE '04*, 26-30. DOI 10.1145/971300.971312.** [ABSTRACT]
- Position/experience: assessing students on demonstrating correctness through their own tests, with automated feedback, encourages hypothesis-forming over trial-and-error. No numbers in the abstract.

**6.2 Edwards, S. H., & Shams, Z. (2014). Do student programmers all tend to write the same software tests? *ITiCSE '14*, 171-176. DOI 10.1145/2591708.2591757.** [ABSTRACT]
- 101 CS2 queue implementations; average 95.4% branch coverage on own code but 13.6% of faults in the whole population detected; high similarity among 90% of suites; "happy path" testing.

**6.3 Aniche, M., Hermans, F., & van Deursen, A. (2019). Pragmatic software testing education. *SIGCSE '19*, 414-420. DOI 10.1145/3287324.3287461.** [FULLTEXT]
- URL: https://repository.tudelft.nl/file/File_0b3a713c-7f65-42df-939d-430c96714584 (TU Delft repository PDF).
- 230 students (TA feedback analysed), survey of 84 students and 7 TAs. Feedback themes by frequency: test coverage 416 (20.9%), maintainability of test code 407 (20.4%), understanding testing concepts 306 (15.4%), boundary testing 258 (13.0%; 142 cases of not covering a boundary fully), state-based testing 247, assertions 158, mock objects 117 (how to verify interactions; when to mock), tools 84. Hardest topics: MC/DC 49% rated hard/very hard; how much to test 42%; structural coverage only 16% hard. A TA noted tests that exercise no production code still show a green bar.
- Caveats: one university, Java; perceptions, not measured learning.

**6.4 Bijlsma, A., Doorn, N., Passier, H., Pootjes, H., & Stuurman, S. (2021). How do students test software units? *ICSE-SEET 2021*. DOI 10.1109/ICSE-SEET52601.2021.00029.** [ABSTRACT]
- Students after an intro programming course with no testing education; surveys, 4 exercises, 11 interviews. Students do not test systematically but think they do; most can only think of tests based on code, even for black-box tasks with no code given.

**6.5 Andleeb, S., Mendoza, T., Cordova, L., Walia, G., & Carver, J. (2025). Enhancing software testing education: Understanding where students struggle. arXiv:2510.00957 (SIGCITE '25).** [FULLTEXT, preprint]
- URL: https://arxiv.org/pdf/2510.00957
- 46 students, senior testing course, automated-feedback tool comparing student suites to a reference suite. Concept missed (% of submissions, assignment 1 / 2): decision coverage 89.7 / 88.4; branch coverage 91 / 96; exceptions 35.5 / 42; boundary values 12 / 11.8; equivalence partitioning 3 / 89.7; functionality 5.6 / 3.9. Ineffective changes were mostly superficial (renaming, trivial additions), assertion misuse, happy-path bias.
- Caveats: small N; the equivalence-partitioning jump between assignments is unexplained; preprint numbers.

**6.6 Kazerouni, A. M., Davis, J. C., Basak, A., Shaffer, C. A., & Servant, F. (2021). Fast and accurate incremental feedback for students' software tests using selective mutation analysis. *Journal of Systems and Software*. DOI 10.1016/j.jss.2021.110905.** [ABSTRACT]
- 1,389 student projects; coverage is widely known to be a weak adequacy measure; with only 2 mutation operators, cost fell 2-3x with negligible accuracy loss. Tool paper; no learning outcome.

**6.7 Perretta, J., DeOrio, A., Guha, A., & Bell, J. (2025). Instructor-written hints as automated test suite quality feedback. *SIGCSE TS 2025*. DOI 10.1145/3641554.3701866.** [ABSTRACT]
- URL: https://www.khoury.northeastern.edu/~arjunguha/main/papers/perretta-mutant-hints.html and the SIGCSE 2025 program page.
- Controlled experiment, 4 assignments, 2 intro courses, 4,122 students; small, significant increase in mutants detected with hints; in 25% of hint instances the mutant was killed in one revision.
- Caveats: measures test-suite quality on the assignment, not durable learning.

**6.8 Janzen, D. S., & Saiedian, H. (2006). Test-driven learning. *SIGCSE '06*. DOI 10.1145/1121341.1121419.** [ABSTRACT]
- Proposal paper: introduce concepts through automated unit tests; "initial evidence" of improved comprehension claimed, no numbers. Weak evidence; listed because test-first is in the question.

**6.9 Garousi, V., Rainer, A., Lauvås, P., & Arcuri, A. (2020). Software-testing education: A systematic literature mapping. *Journal of Systems and Software, 165*, 110570. DOI 10.1016/j.jss.2020.110570.** [ABSTRACT]
- 204 papers (1992-2019) classified; a map of approaches and challenges, not an effect-size synthesis. Useful as an index; it does not establish which teaching method works.

**6.10 Chiodini, L., Moreno Santos, I., Gallidabino, A., Tafliovich, A., Santos, A. L., & Hauswirth, M. (2021). A curated inventory of programming language misconceptions. *ITiCSE 2021*. DOI 10.1145/3430665.3456343.** [FULLTEXT]
- URL: https://luce.si.usi.ch/assets/publications/chiodiniCuratedInventoryProgramming2021.pdf
- Defines a PL misconception, introduces progmiscon.org with 198 misconceptions in Java, JavaScript and Python, and compares with Sorva's catalogue of 162.
- Implication: a source of plausible distractors for 370 code-tracing MC items; nothing on scope rules, binding times or grammars.

### 7. Session design

**7.1 Hausman, H., & Kornell, N. (2014). Mixing topics while studying does not enhance learning. *Journal of Applied Research in Memory and Cognition, 3*(3), 153-160. DOI 10.1016/j.jarmac.2014.03.003.** [ABSTRACT]
- URL: OpenAlex.
- 4 experiments; alternating anatomy terms and Indonesian translations vs one topic then the other (items interleaved within topic in both); no reliable effect on a single day or over two days.

**7.2 Mazza, S., Gerbier, E., Gustin, M.-P., Kasikci, Z., Koenig, O., & Toppino, T. C. (2016; author list as shown in the Crossref record, which may be truncated). Relearn faster and retain longer: Along with practice, sleep makes perfect. *Psychological Science, 27*(10), 1321-1330. DOI 10.1177/0956797616659930. PMID 27530500.** [ABSTRACT]
- N = 40; foreign vocabulary to perfect performance in two sessions 12 h apart, with or without sleep between; sleep between halved relearning practice and improved retention at 1 week and 6 months.
- Caveats: small N; vocabulary; time-of-day confounded with sleep by design.

**7.3 Diekelmann, S., & Born, J. (2010). The memory function of sleep. *Nature Reviews Neuroscience, 11*(2), 114-126. DOI 10.1038/nrn2762. PMID 20046194.** [ABSTRACT]
- Review: sleep optimises consolidation of newly acquired information, depending on learning conditions and timing.

**7.4 Gillen-O'Neel, C., Huynh, V. W., & Fuligni, A. J. (2013). To study or to sleep? The academic costs of extra studying at the expense of sleep. *Child Development*. DOI 10.1111/j.1467-8624.2012.01834.x. ERIC EJ1010022.** [ABSTRACT]
- N = 535, 14-day diaries in grades 9, 10, 12; sacrificing sleep to study more than usual predicted more trouble understanding class material and more struggle on a test or assignment the next day.
- Caveats: adolescents; self-report; correlational within-person.

**7.5 Janes, J. L., Dunlosky, J., Rawson, K. A., & Jasnow, A. (2020). Successive relearning improves performance on a high-stakes exam in a difficult biopsychology course. *Applied Cognitive Psychology, 34*(5), 1118-1132. DOI 10.1002/acp.3699.** [ABSTRACT]
- 2 experiments; virtual flashcard successive relearning vs business-as-usual content; at least 10% boost, d = 0.54 to 1.10.

**7.6 Session length and new items per day.** [NEGATIVE RESULT]
- A targeted search (session length, fatigue, vigilance decrement, new items per session, flashcards) returned only practitioner guides and forums, no controlled study. Rule 22 is therefore arithmetic plus inference.

---

## Contested and open questions

1. **Self-explanation prompts: help or hurt?** Bisra et al. 2018 (g = 0.55 overall) and Atkinson et al. 2003 (principle prompts with fading, medium-large transfer) say help; Barbieri et al. 2023 found that adding self-explanation prompts REDUCED the worked-example effect in math. The likely difference is prompt type (short principle-naming vs open explanation) and population (K-12 in Barbieri). This review cannot settle it; rule 12 picks the short, checkable form.
2. **Cloze vs question.** No head-to-head on the same content was found. The indirect evidence (Hinze & Wiley 2011; Pan et al. 2019) says FITB trains the blank and transfers poorly; Lawson 2022 says FITB and MC are equal in class. Wozniak (practitioner) recommends cloze; Matuschak (practitioner) distrusts it. Treat rule 6 as a reasonable default, not a finding.
3. **Atomic vs complex cards.** Still no direct study (R2 found none; neither did this pass). The idea-unit grading research is the strongest reason to keep answers small, and it is about grading accuracy, not memory.
4. **List cloze.** Part-list cuing impairs at short delays (Pepe 2023) but can facilitate after long delays (Lehmer & Bäuml 2018). All of this is word-list research; whether it holds for a 4-item list relearned over weeks is untested.
5. **Concrete examples: effect size.** d = 0.74-1.67 in the original vs 0.30 in the replication. Plan for the smaller number.
6. **Interleaving limits.** Strong for confusable problem types (Rohrer 2015, 2020; Samani & Pan 2021); null for unrelated topics (Hausman & Kornell 2014); negative for word-like material (Brunmair & Richter 2019 in R1). App rule L11 (fully shuffled sessions) is neither supported nor harmed by this evidence for definitions; its benefit should come only from problem-type cards.
7. **Software-testing education evidence is thin and assignment-centred.** The only large controlled study (Perretta 2025, N = 4,122) found a small effect on suite quality. No study tests flashcards, worked examples, or spaced practice for coverage or partition skills. Rules 9-10 and 14 transfer math and CS1 findings to testing by inference.
8. **PL course pedagogy:** no learning study found for scope, binding, lifetime, or BNF derivation. Every rule for these topics is transferred from math and CS1 (see also R3's "Open questions").
9. **Elaborative encoding vs retrieval.** Gonçalves et al. 2025 found retrieval's edge over good elaboration is small (g = 0.14) and depends on feedback (g = 0.50 with feedback). This tempers R1's "retrieval beats everything" reading of Karpicke & Blunt 2011, which compared retrieval with concept mapping, the one elaborative task retrieval clearly beats.
10. **Sleep studies are small or correlational.** Mazza 2016 is N = 40; Gillen-O'Neel 2013 is diary data from adolescents. The direction is consistent with the consolidation review, but the size of the benefit for this learner is unknown.

## Verification summary

| Source | Depth | Loaded via |
|---|---|---|
| Thomson & Tulving 1970 | FULLTEXT | pstnet.com PDF |
| Tulving & Thomson 1973 | EXISTENCE-ONLY | Crossref |
| Morris et al. 1977 | EXISTENCE-ONLY | Crossref, OpenAlex |
| Watkins & Watkins 1975 | EXISTENCE-ONLY | Crossref, OpenAlex |
| Eitel et al. 2022 | ABSTRACT | ERIC |
| Hinze & Wiley 2011 | ABSTRACT | Europe PMC |
| Pan et al. 2019 | ABSTRACT | ERIC, Semantic Scholar |
| Lawson 2022 | ABSTRACT | ERIC |
| McDaniel et al. 2007 | ABSTRACT | OpenAlex |
| Murdock 1962 | ABSTRACT (truncated) | OpenAlex |
| Slamecka 1968 | EXISTENCE-ONLY | reference list of Lehmer & Bäuml; Semantic Scholar |
| Pepe et al. 2023 | ABSTRACT | Europe PMC |
| Lehmer & Bäuml 2018 | FULLTEXT | Europe PMC full-text XML |
| Zaromb & Roediger 2010 | ABSTRACT | Europe PMC |
| Wozniak 1999 | PRACTITIONER | supermemo.com |
| Matuschak 2020 | PRACTITIONER | andymatuschak.org |
| Rawson, Thomas & Jacoby 2015 | ABSTRACT | ERIC |
| Micallef & Newton 2022 | ABSTRACT | OpenAlex, ERIC |
| Zamary & Rawson 2018 | ABSTRACT | ERIC |
| Steininger et al. 2022 | ABSTRACT | OpenAlex |
| Bisra et al. 2018 | ABSTRACT | ERIC |
| Gonçalves et al. 2025 | ABSTRACT | ERIC |
| Willoughby et al. 1994 | ABSTRACT | ERIC |
| Butcher 2006 | ABSTRACT | ERIC |
| Clark & Paivio 1991 | EXISTENCE-ONLY | Crossref, OpenAlex |
| Barbieri et al. 2023 | ABSTRACT | ERIC |
| Renkl et al. 2002 | ABSTRACT | ERIC |
| Atkinson et al. 2003 | ABSTRACT | ERIC |
| Kalyuga et al. 2003 | ABSTRACT | OpenAlex |
| Paas & van Merriënboer 1994 | ABSTRACT | OpenAlex |
| Pashler et al. 2008 | ABSTRACT | Crossref, Europe PMC |
| Rogowsky et al. 2015 | ABSTRACT | ERIC |
| Callender & McDaniel 2009 | ABSTRACT | ERIC |
| Karpicke, Butler & Roediger 2009 | ABSTRACT | Europe PMC |
| Koriat & Bjork 2005 | ABSTRACT | Europe PMC |
| Nelson & Dunlosky 1991 | ABSTRACT | Crossref |
| Rhodes & Tauber 2011 | ABSTRACT | Europe PMC |
| Dunlosky, Rawson & Middleton 2005 | ABSTRACT | ERIC |
| Lipko et al. 2009 | ABSTRACT | ERIC |
| Dunlosky et al. 2011 | ABSTRACT | Europe PMC, Crossref |
| Rawson & Dunlosky 2007 | SECONDARY | via Grimaldi & Karpicke full text |
| Dunlosky & Rawson 2012 | ABSTRACT | ERIC |
| Grimaldi & Karpicke 2014 | FULLTEXT | Purdue learning lab PDF |
| Smith, Roediger & Karpicke 2013 | ABSTRACT | Europe PMC |
| Lindsey & Nagel 2015 | ABSTRACT | ERIC |
| Pan & Rickard 2018 | ABSTRACT | Europe PMC |
| Schmidt & Bjork 1992 | ABSTRACT | Crossref |
| Kaner 2004 | FULLTEXT | kaner.com PDF |
| Rohrer, Dedrick & Stershic 2015 | ABSTRACT | Semantic Scholar |
| Rohrer et al. 2020 | ABSTRACT | ERIC |
| Samani & Pan 2021 | ABSTRACT | OpenAlex |
| Edwards 2004 | ABSTRACT | OpenAlex |
| Edwards & Shams 2014 | ABSTRACT | OpenAlex |
| Aniche et al. 2019 | FULLTEXT | TU Delft repository |
| Bijlsma et al. 2021 | ABSTRACT | OpenAlex |
| Andleeb et al. 2025 | FULLTEXT (preprint) | arXiv |
| Kazerouni et al. 2021 | ABSTRACT | OpenAlex |
| Perretta et al. 2025 | ABSTRACT | author page, SIGCSE program |
| Janzen & Saiedian 2006 | ABSTRACT | OpenAlex |
| Garousi et al. 2020 | ABSTRACT | Semantic Scholar |
| Chiodini et al. 2021 | FULLTEXT | USI PDF |
| Hausman & Kornell 2014 | ABSTRACT | OpenAlex |
| Mazza et al. 2016 | ABSTRACT | Crossref, Europe PMC |
| Diekelmann & Born 2010 | ABSTRACT | Europe PMC |
| Gillen-O'Neel et al. 2013 | ABSTRACT | ERIC |
| Janes et al. 2020 | ABSTRACT | Crossref, Semantic Scholar |

Looked for and NOT used (could not verify content): Pyc & Rawson 2009, retrieval effort hypothesis (DOI 10.1016/j.jml.2009.01.004, abstract elided by publisher); Pressley et al. 1987 on elaboration precision (existence only); Kornell & Son 2009 (not located).
