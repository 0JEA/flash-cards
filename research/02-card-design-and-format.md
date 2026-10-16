# 02 - Card design and format: what the peer-reviewed research says

Compiled 2026-10-15. Scope: item format, recall vs recognition, multiple-choice (MC) pitfalls, generation, elaboration, confidence, pretesting, card granularity.

## How verification was done (read this first)

PubMed and publisher sites (PsycNet, SAGE, T&F) blocked the fetch tool (cookie wall, 403, SSO redirect). So "verified" below means one of these, and the URL listed is the page I actually loaded:

- **EPMC** = Europe PMC REST record (a PubMed mirror that returns title, authors, journal, DOI, PMID and the full abstract). I loaded it via the API.
- **Crossref** = Crossref REST record (confirms title, authors, journal, volume, pages). It shows the paper exists but gives no abstract.
- **PDF** = I downloaded the actual PDF and read it with pdftotext.
- **Page** = a university or repository page I fetched that states the abstract.

Numbers are quoted only where the loaded page contained them. If I only have the abstract, I say so, and I do not quote effect sizes I did not see. Nothing here is cited from memory alone. Two corrections to the brief: "Lin, McDaniel & **Miyatake**" is actually **Miyatsu**; and the Little et al. 2012 paper in my first lookup was confused with Little & Bjork 2015, so both are listed.

Searching used about 11 web searches plus direct API lookups.

## Facts about the current app (measured 2026-10-15 from `/home/coke/flash-cards/questions.js`)

- 122 questions; 87 have 4 options, 35 have 5.
- The correct option is strictly the longest in 81/122 (66%); with ties 83/122 (68%), which matches your figure. The median correct option is 1.61x the mean length of its distractors.
- 3 questions carry a "None of them / None of the above" option, and in all 3 it is wrong. That is a free elimination.
- Option order is shuffled at run time (`index.html` line 560 onward). The source file has the correct answer in slot 0 for 115/122 items, so position is NOT a cue in the app. Length is.
- The app shows green/red feedback immediately and re-queues missed items in-session. It has no confidence rating, no explanation text, and no multi-day spacing (grep of `index.html`, no such code).

---

## What this means for the app (10 lines)

1. **Fix the length cue first.** A 66-68% longest-correct rate lets the learner score by test-wise guessing rather than retrieving; the item-writing literature treats "keep options about equal length" as a standard rule (Haladyna et al. 2002, guideline 20a as quoted in Casu & Garcia-Garcia 2018), and the longest-correct flaw raised scores in a controlled study (Pham et al. 2018). Rewrite or trim the correct options so lengths are matched, or pad plausible distractors up to length. Programmatic check: correct length must not exceed the max distractor length in more than about 30% of items.
2. **Make distractors competitive, not absurd.** Plausible wrong options force the learner to retrieve why each is wrong, which is what makes MC work as retrieval practice (Little et al. 2012; Little & Bjork 2015). Absurd options ("good Wi-Fi") reduce the item to elimination. Rewrite each distractor as a real misconception or a near-miss from the course material.
3. **Always show the correct answer plus feedback, and keep doing it immediately.** MC lures can plant false knowledge (Roediger & Marsh 2005; Marsh et al. 2007), but feedback largely removes the damage (Butler & Roediger 2008). The app already does this; keep it, and also show a one-line "why the others are wrong".
4. **Do not let MC be the only mode.** Retrieval from scratch (recall) usually beats recognition (Rowland 2014 meta-analysis: initial recall tests give larger testing benefits than recognition tests). But Smith & Karpicke 2014 found MC practice was about as good as short-answer in 3 of 4 experiments, so MC is an acceptable fallback, not a failure. Add a "type/think the answer first, then reveal" mode (hybrid) for hard items.
5. **Drop "None of the above" / "All of the above" and use 3-4 options, not 5.** Rodriguez 2005 (meta-analysis of 80 years) concludes 3 options are optimal; plausible 4th/5th distractors are hard to write and rarely function. Your 35 five-option items probably contain filler distractors. Drop the weakest distractor per item.
6. **Add a "predict or guess before seeing options" step for new material** (pretesting). Unsuccessful attempts still improve later learning (Kornell, Hays & Bjork 2009; Richland, Kornell & Kao 2009).
7. **Add a 1-3 confidence rating before reveal.** High-confidence errors are corrected most reliably when feedback arrives (Butterfield & Metcalfe 2001) and the rating gives the learner calibration data for deciding what to restudy. Use it to prioritize re-queueing: confident wrong answers first.
8. **For algorithms/crypto/graphics math, write "why/derive" items, not just definitions.** Higher-order retrieval practice improved higher-order test performance and fact-only quizzes did not (Agarwal 2019). Detailed (fact-detail) flashcards gave no significant gain over free study on authentic materials (Lin, McDaniel & Miyatsu 2018). Use cards like "Why does Dijkstra fail with negative edges?" over "Define relaxation".
9. **Add an explanation field to each card and (optionally) a prompt to explain in your own words.** Elaborative interrogation and self-explanation earned only "moderate" utility ratings (Dunlosky et al. 2013) and work better with prior knowledge, so use them on topics you already partly know. Self-explanation prompts raised understanding in Chi et al. 1994 (small n).
10. **Spread reviews over days, not only in one sitting.** Students tend to practice to criterion but under-use long lags (Wissman, Rawson & Pyc 2012). The app's in-session re-queue is not spacing. This is outside format, so see the spacing file; it is flagged here because the format studies above all assume feedback and repeated retrieval.

**Existing bank, concretely:** (a) auto-flag every item where the correct option is the longest and trim/pad it; (b) delete the three "None of ..." options; (c) hand-review the 35 five-option items and cut the weakest distractor; (d) review distractors for absurdity (for example the bathroom Wi-Fi option) and replace them with real misconceptions; (e) add a one-sentence "why" per item; (f) tag items "recall" (stem-first, no options until reveal) vs "recognition" for the harder concepts. Note that many stems are source-bound ("According to the SECEPP ...", "According to Kantian ethics ..."), which are fine for a course quiz but are pure recognition of a named source; they will not transfer to other courses.

---

## Paper entries

### 1. Little, Bjork, Bjork & Angello (2012)
- **Citation:** Little, J. L., Bjork, E. L., Bjork, R. A., & Angello, G. (2012). Multiple-choice tests exonerated, at least of some charges: Fostering test-induced learning and avoiding test-induced forgetting. *Psychological Science, 23*(11), 1337-1344. DOI 10.1177/0956797612443370, PMID 23034566.
- **Verified URL:** https://europepmc.org/article/MED/23034566 (EPMC, abstract loaded). Search summary also reports samples of 32 and 96 (secondary, not the paper itself).
- **Design:** Two experiments comparing MC tests (with plausible alternatives) and cued-recall tests, then later tests including questions about the *incorrect* alternatives.
- **Key finding:** "Properly constructed" MC tests trigger productive retrieval, provided the alternatives are plausible enough to make test takers retrieve why each correct option is correct and each incorrect one wrong. Both formats improved retention of the tested info; MC also helped recall of information about the incorrect alternatives, cued recall did not. I did not see effect sizes in the abstract.
- **Implication:** The central justification for rewriting distractors as competitive. Absurd options remove this benefit (inference from the plausibility condition).
- **Caveats:** Lab study with word-passage materials, small samples (per secondary source). Not CS or math material.

### 2. Little & Bjork (2015)
- **Citation:** Little, J. L., & Bjork, E. L. (2015). Optimizing multiple-choice tests as tools for learning. *Memory & Cognition, 43*, 14-26. DOI 10.3758/s13421-014-0452-8.
- **Verified URL:** https://bjorklab.psych.ucla.edu/wp-content/uploads/sites/13/2017/01/LittleBjorkMC2014.pdf (PDF; read the abstract and intro).
- **Design:** Two experiments, one with corrective feedback during the MC test and one without.
- **Key finding:** Answering MC questions with *competitive* alternatives raised later cued-recall of previously nontested questions whose answers had appeared as competitive wrong options, but not when those alternatives were noncompetitive. Competitive alternatives were not more likely to be intruded as wrong answers.
- **Implication:** Supports (a) good distractors teach about neighbouring concepts, (b) the benefit does not come with extra false-answer intrusion in this study.
- **Caveats:** Lab text materials; page numbers 14-26 are from my memory of the citation and were not confirmed on the loaded page.

### 3. Roediger & Marsh (2005)
- **Citation:** Roediger, H. L., & Marsh, E. J. (2005). The positive and negative consequences of multiple-choice testing. *J. Exp. Psychol.: Learning, Memory, and Cognition, 31*(5), 1155-1159. DOI 10.1037/0278-7393.31.5.1155, PMID 16248758.
- **Verified URL:** https://europepmc.org/article/MED/16248758 (EPMC, abstract).
- **Design:** Students took an MC test, then a later general-knowledge cued-recall test with a warning not to guess.
- **Key finding:** A large positive testing effect; but prior reading of more MC lures decreased that effect and increased lures produced as wrong answers. "Multiple-choice testing may inadvertently lead to the creation of false knowledge." No numbers in the abstract.
- **Implication:** More options = more exposure to wrong statements. Another reason to trim 5-option items to 3-4 and always give feedback.
- **Caveats:** General-knowledge trivia, no feedback condition here; see Butler & Roediger 2008.

### 4. Marsh, Roediger, Bjork & Bjork (2007)
- **Citation:** Marsh, E. J., Roediger, H. L., Bjork, R. A., & Bjork, E. L. (2007). The memorial consequences of multiple-choice testing. *Psychonomic Bulletin & Review, 14*(2), 194-199. DOI 10.3758/BF03194051, PMID 17694900.
- **Verified URL:** https://europepmc.org/article/MED/17694900 (EPMC).
- **Key finding:** MC testing boosted later performance versus non-tested controls, including SAT II questions and items tapping higher levels of Bloom's taxonomy. Students also learned false facts; lure persistence "appears due to faulty reasoning rather than to an increase in the familiarity of lures." Positive effects outweigh the cost.
- **Implication:** MC is a defensible practice format even for conceptual items, with the false-fact risk handled by feedback.
- **Caveats:** Abstract contains no effect sizes.

### 5. Butler & Roediger (2008)
- **Citation:** Butler, A. C., & Roediger, H. L. (2008). Feedback enhances the positive effects and reduces the negative effects of multiple-choice testing. *Memory & Cognition, 36*(3), 604-616. DOI 10.3758/MC.36.3.604, PMID 18491500.
- **Verified URL:** https://europepmc.org/article/MED/18491500 (EPMC). Dunlosky et al. (PDF, entry 14) independently describes it.
- **Design:** Students studied passages, took an MC test with immediate, delayed, or no feedback, then a delayed cued-recall test.
- **Key finding:** Both immediate and delayed feedback increased correct responses and reduced lure intrusions relative to no feedback. Dunlosky et al. add that without feedback, MC practice increased intrusions of false alternatives, with no such increase when feedback was given.
- **Implication:** Keep the existing green/red feedback; add the explanation. Immediate vs delayed feedback was similar here, so the app need not delay.
- **Caveats:** Passage-based prose, not procedural math or code.

### 6. Smith & Karpicke (2014)
- **Citation:** Smith, M. A., & Karpicke, J. D. (2014). Retrieval practice with short-answer, multiple-choice, and hybrid tests. *Memory, 22*(7), 784-802. DOI 10.1080/09658211.2013.831454, PMID 24059563.
- **Verified URL:** https://europepmc.org/article/MED/24059563 (EPMC) and the PDF https://learninglab.psych.purdue.edu/downloads/2014/2014_Smith_Karpicke_Memory.pdf (downloaded; the text confirms the DOI and Purdue affiliation).
- **Design:** Four experiments, N = 372; short-answer, MC, or hybrid (recall attempt, then MC) practice, then a final test one week later with verbatim and inference questions.
- **Key finding:** All retrieval formats beat a study-only control on both question types. "Little or no advantages" of short-answer or hybrid over MC in three experiments. In Experiment 4, when initial short-answer retrieval success was raised, short-answer and hybrid beat MC. They conclude retrieval *success* matters.
- **Implication:** MC is fine for retrieval practice; the recall-first mode helps mainly when the learner can usually succeed. So add recall mode for well-known material, not for brand-new items.
- **Caveats:** Educational prose texts, not equations or code. A secondary blog said a different meta-analysis found hybrid best; not relied upon.

### 7. Rowland (2014)
- **Citation:** Rowland, C. A. (2014). The effect of testing versus restudy on retention: A meta-analytic review of the testing effect. *Psychological Bulletin, 140*(6), 1432-1463. DOI 10.1037/a0037559, PMID 25150680.
- **Verified URL:** https://europepmc.org/article/MED/25150680 (EPMC).
- **Key finding (abstract):** "Initial recall tests yielding larger testing benefits than recognition tests," supporting an effortful-processing account. The abstract gives no numbers; I did not read the effect sizes.
- **Implication:** The best direct evidence for "recall beats recognition on average" - so MC should not be the only format.
- **Caveats:** An average across studies; Smith & Karpicke show MC can match recall when conditions are right. Added beyond your list because it directly answers the recall-vs-recognition question.

### 8. Slamecka & Graf (1978)
- **Citation:** Slamecka, N. J., & Graf, P. (1978). The generation effect: Delineation of a phenomenon. *J. Exp. Psychol.: Human Learning and Memory, 4*(6), 592-604. DOI 10.1037/0278-7393.4.6.592.
- **Verified URL:** https://api.crossref.org/works?query.bibliographic=Slamecka+Graf+1978 (Crossref record loaded, confirming title, authors, journal, volume, pages). **Abstract UNVERIFIED**: PsycNet redirected to a login wall.
- **Key finding (from Bertsch et al., entry 9, not from the original abstract):** subjects who generate material remember it better than material they read.
- **Implication:** Supports making the learner produce the answer (or a partial one) before seeing it.
- **Caveats:** Original used word pairs and rules (my memory, unverified here).

### 9. Bertsch, Pesta, Wiscott & McDaniel (2007)
- **Citation:** Bertsch, S., Pesta, B. J., Wiscott, R., & McDaniel, M. A. (2007). The generation effect: A meta-analytic review. *Memory & Cognition, 35*(2), 201-210. DOI 10.3758/BF03193441, PMID 17645161.
- **Verified URL:** https://europepmc.org/article/MED/17645161 (EPMC).
- **Key finding:** 445 effect sizes over 86 studies; mean effect size **.40**, "a benefit of almost half a standard deviation of generation over reading." Eleven moderators examined with substantial variability.
- **Implication:** A modest, real benefit for "produce it first" cards; shows the case for a type-the-answer step.
- **Caveats:** Mostly word-level materials; the abstract does not say which moderators matter, and I did not read them. Generation helps less than testing with feedback in some designs (inference; not tested in this file).

### 10. Haladyna, Downing & Rodriguez (2002)
- **Citation:** Haladyna, T. M., Downing, S. M., & Rodriguez, M. C. (2002). A review of multiple-choice item-writing guidelines for classroom assessment. *Applied Measurement in Education, 15*(3), 309-333. DOI 10.1207/s15324818ame1503_5.
- **Verified URL:** https://experts.umn.edu/en/publications/a-review-of-multiple-choice-item-writing-guidelines-for-classroom/ (page loaded: title, authors, journal, pages) plus Crossref. The abstract states a taxonomy of **31 guidelines** validated against 27 textbooks and 27 studies/reviews since 1990.
- **Option-writing rules (second-hand):** "keep the length of options about equal" is guideline 20a, quoted in Casu & Garcia-Garcia (entry 13). "All/None of the above" and plausible-distractor rules come from secondary summaries only. I did not load the paper's full text, so the exact wording of those rules is UNVERIFIED.
- **Implication:** The checklist behind items 1, 2 and 5 above.
- **Caveats:** A consensus-plus-evidence taxonomy; the evidence for individual rules is uneven (see entries 11-13).

### 11. Rodriguez (2005)
- **Citation:** Rodriguez, M. C. (2005). Three options are optimal for multiple-choice items: A meta-analysis of 80 years of research. *Educational Measurement: Issues and Practice, 24*(2), 3-13. DOI 10.1111/j.1745-3992.2005.00006.x.
- **Verified URL:** https://api.crossref.org/works/10.1111/j.1745-3992.2005.00006.x (Crossref, abstract loaded).
- **Key finding (abstract):** More 3-option items can be administered per testing time than 4- or 5-option items, improving content coverage without detrimental effects on psychometric quality; researchers have endorsed 3-option items for over 80 years. A secondary medical-education summary claims reliability drops when options are cut except 4 to 3; I could not confirm that, and I did not see study counts.
- **Implication:** Cut weak distractors; for a self-study app, fewer options also means more questions per minute.
- **Caveats:** About psychometrics of exams, not learning. Fewer options also raise the guessing floor (33% vs 20%); that matters less for study than for grading.

### 12. Tarrant & Ware (2008) (and Tarrant et al. 2006)
- **Citation:** Tarrant, M., & Ware, J. (2008). Impact of item-writing flaws in multiple-choice questions on student achievement in high-stakes nursing assessments. *Medical Education, 42*(2), 198-206. DOI 10.1111/j.1365-2923.2007.02957.x, PMID 18230093. Also Tarrant, Knierim, Hayes & Ware (2006), *Nurse Education in Practice, 6*(6), 354-363, DOI 10.1016/j.nepr.2006.07.002, PMID 19040902.
- **Verified URLs:** https://europepmc.org/article/MED/18230093 and https://europepmc.org/article/MED/19040902 (EPMC).
- **Key finding:** 47.3% of items across 10 papers were flawed (range 28-75%). Removing the flawed items made fewer examinees pass (748, 90.6%, versus 779, 94.3%), and more reach 80%+ on the unflawed scale (173, 20.9%, versus 120, 14.5%). Conclusion: flaws did not disadvantage borderline students; high achievers were penalised more. In the 2006 study, 46.2% of 2,770 items had violations, over 90% were low cognitive level, and correct answers were evenly spread across positions.
- **Implication:** Flaw effects are small and uneven, so do not over-promise; but a flawed bank is the norm, and your 68% length cue is a real flaw.
- **Caveats:** Nursing exams in Hong Kong; exam scores, not learning outcomes.

### 13. Longest-answer cue studies (added)
- **Casu & Garcia-Garcia.** *Revista de Psicologia Educativa, 25*(1), 43-48 (online 2018), DOI 10.5093/psed2018a20. URL loaded: https://journals.copmadrid.org/psed/art/psed2018a20. N = 55 psychology students, randomized pilot; the flawed correct option had at least 5 more uninformative words than the longest distractor. 6 of 9 items were easier in the flawed version; only 3 differences were significant, with medium effect sizes; post-hoc power .44. The authors say a true null is possible.
- **Pham, Besanko & Devitt (2018).** "Examining the impact of specific types of item-writing flaws..." *MedEdPublish*, DOI 10.15694/mep.2018.0000225.1. URL loaded: https://europepmc.org/article/MED/38089249 (the record shows the abstract). Cross-over design, 100 pairs of items, medical students. Of 10 flaw types, the predicted effect on mean scores was confirmed in 4. "Longest choice is correct" and "Implausible distractors" positively affected scores (made items easier). The abstract (as loaded) says flaws did not systematically change difficulty or discrimination.
- **Rush, Rankin & White (2016).** *BMC Medical Education, 16*, 250, DOI 10.1186/s12909-016-0773-3. Record loaded via the Europe PMC REST API (query by DOI 10.1186/s12909-016-0773-3; no stable article URL was recorded), abstract read. 1,925 vet items; 37.3% had more than one flaw; "longest response is correct" and "implausible distractors" were among the most common flaws. The page I read did not report the effect of each flaw (I did not read it); the volume number 16 and article number 250 are from my memory and UNVERIFIED.
- **Implication:** The longest-answer cue is real and common, but its measured effect on difficulty is inconsistent and modest. Fix it anyway: it is cheap, and a learner who has noticed it will stop retrieving. Whether *your* learner exploits it is an inference; testable by comparing accuracy on longest-correct vs matched-length items after the rewrite.
- **Caveats:** Small, mixed evidence (see Open questions). Rodriguez's 1997 meta-analysis is cited in a search summary as showing easier items; I did not verify it, so it is not counted here.

### 14. Dunlosky, Rawson, Marsh, Nathan & Willingham (2013)
- **Citation:** Dunlosky, J., Rawson, K. A., Marsh, E. J., Nathan, M. J., & Willingham, D. T. (2013). Improving students' learning with effective learning techniques: Promising directions from cognitive and educational psychology. *Psychological Science in the Public Interest, 14*(1), 4-58. DOI 10.1177/1529100612453266, PMID 26173288.
- **Verified URLs:** https://europepmc.org/article/MED/26173288 (EPMC) and the full text PDF https://pdf.stafforini.com/dunlosky-2013-improving-students-learning.pdf (downloaded, read).
- **Key finding:** Utility ratings: **high** = practice testing, distributed practice. **Moderate** = elaborative interrogation, self-explanation, interleaved practice (they "fell short of a high utility assessment because the evidence for their efficacy is limited," notably lack of testing in educational contexts). **Low** = summarization, highlighting, keyword mnemonic, imagery for text, rereading. Elaborative interrogation example: accuracy about 72% versus about 37% in two control groups on a fact-recall test; Seifert (1993) reported average effect sizes of 0.85 to 2.57. Elaborative interrogation effects generally increase as prior knowledge increases. For practice testing, they state practice testing with feedback "consistently outperforms practice testing alone" and is "extremely robust"; MC practice tests have produced testing effects.
- **Implication:** Practice testing with feedback is the right core; add "why" prompts only for material the learner partly knows.
- **Caveats:** Lab-heavy evidence; ratings are the authors' judgments; 2013 and pre-dates some later replication work.

### 15. Chi, de Leeuw, Chiu & LaVancher (1994)
- **Citation:** Chi, M. T. H., de Leeuw, N., Chiu, M.-H., & LaVancher, C. (1994). Eliciting self-explanations improves understanding. *Cognitive Science, 18*(3), 439-477. DOI 10.1207/s15516709cog1803_3.
- **Verified URL:** https://api.crossref.org/works/10.1207/s15516709cog1803_3 (Crossref, abstract loaded).
- **Design:** 14 eighth-graders prompted to self-explain each line of a circulatory-system text, versus 10 who read the text twice.
- **Key finding:** The prompted group had a greater pre-to-post gain; "high explainers" all reached the correct mental model. No effect sizes in the abstract.
- **Implication:** Basis for an optional "explain it back" step on conceptual cards.
- **Caveats:** Very small n (14 vs 10), one biology text, a self-selected "high explainer" split (correlational within the group). Dunlosky rates the technique moderate for this reason.

### 16. Butterfield & Metcalfe (2001)
- **Citation:** Butterfield, B., & Metcalfe, J. (2001). Errors committed with high confidence are hypercorrected. *J. Exp. Psychol.: Learning, Memory, and Cognition, 27*(6), 1491-1494. DOI 10.1037/0278-7393.27.6.1491, PMID 11713883.
- **Verified URL:** https://europepmc.org/article/MED/11713883 (EPMC).
- **Key finding:** "Highly confident errors were the most likely to be corrected in a subsequent retest," contrary to the authors' expectations. No numbers in the abstract. Dunlosky et al. cite it for feedback being especially effective at correcting high-confidence errors.
- **Implication:** Collect confidence; do not skip feedback on confident-wrong answers; these are the best items to re-queue and explain.
- **Caveats:** General-knowledge trivia. Carpenter et al. 2018 (EPMC https://europepmc.org/article/MED/29781391, PMID 29781391) found hypercorrection in an authentic college horticulture class, with higher-prior-knowledge students more confident and correcting more effectively. I did not find a CS/math study.

### 17. Kornell, Hays & Bjork (2009)
- **Citation:** Kornell, N., Hays, M. J., & Bjork, R. A. (2009). Unsuccessful retrieval attempts enhance subsequent learning. *J. Exp. Psychol.: Learning, Memory, and Cognition, 35*(4), 989-998. DOI 10.1037/a0015729, PMID 19586265.
- **Verified URL:** https://europepmc.org/article/MED/19586265 (EPMC).
- **Design:** Six experiments; fictional general-knowledge questions and weak-associate word pairs, so guesses were nearly always wrong (rare correct guesses excluded).
- **Key finding:** Attempting to answer before seeing the answer beat reading question and answer together. No numbers in the abstract.
- **Implication:** Supports "try before options/reveal" on unfamiliar cards (a guess-then-check mode).
- **Caveats:** Materials were artificially unanswerable; effects with real coursework are less certain.

### 18. Richland, Kornell & Kao (2009)
- **Citation:** Richland, L. E., Kornell, N., & Kao, L. S. (2009). The pretesting effect: Do unsuccessful retrieval attempts enhance learning? *J. Exp. Psychol.: Applied, 15*(3), 243-257. DOI 10.1037/a0016496, PMID 19751074.
- **Verified URL:** https://europepmc.org/article/MED/19751074 (EPMC).
- **Design:** Five experiments; students read an essay on vision, either pretested on embedded concepts or given extra study time, with tested concepts emphasized in both.
- **Key finding:** Posttest performance was better in the pretest condition in all experiments, analyzing only items missed on the pretest. In Experiment 5, presenting the questions without asking for answers also helped (attention direction is part of it).
- **Implication:** Showing the question first has value even if the learner can't answer.
- **Caveats:** One reading passage domain; effect partly attention.

### 19. Wissman, Rawson & Pyc (2012)
- **Citation:** Wissman, K. T., Rawson, K. A., & Pyc, M. A. (2012). How and when do students use flashcards? *Memory, 20*(6), 568-579. DOI 10.1080/09658211.2012.687052, PMID 22671698.
- **Verified URL:** https://europepmc.org/article/MED/22671698 (EPMC).
- **Design:** Survey of 374 undergraduates about amount and timing of flashcard practice.
- **Key finding:** Students understand the benefit of practicing to higher criterion levels but "do not typically implement or understand the benefits of practising with longer lags."
- **Implication:** The app should schedule spacing for the learner, not leave it to choice.
- **Caveats:** Self-report survey, not an experiment; says nothing about card design.

### 20. Lin, McDaniel & Miyatsu (2018)
- **Citation:** Lin, C., McDaniel, M. A., & Miyatsu, T. (2018). Effects of flashcards on learning authentic materials: The role of detailed versus conceptual flashcards and individual differences in structure-building ability. *J. Applied Research in Memory and Cognition, 7*(4), 529-539. DOI 10.1016/j.jarmac.2018.05.003.
- **Verified URL:** https://profiles.wustl.edu/en/publications/effects-of-flashcards-on-learning-authentic-materials-the-role-of/ (page loaded; authors, journal, DOI and abstract content).
- **Key finding:** Experiment 1: across several content areas, flashcards did not significantly improve final-test performance over free study. Experiment 2: conceptual cards beat detailed cards on short-answer tests for low structure-builders, but not for high structure-builders. The authors attribute the limited benefit to students already using effective free-study strategies and to the dominance of detailed cards. I could not see sample sizes or effect sizes.
- **Implication:** Flashcards are not magic for understanding. Write conceptual cards (relationships, why, compare) and don't assume cards beat reading and thinking. A learner who builds structure well gains less from conceptual cards.
- **Caveats:** One lab, authentic-text materials; the stated mechanisms are the authors' hypotheses.

### 21. Agarwal (2019)
- **Citation:** Agarwal, P. K. (2019). Retrieval practice & Bloom's taxonomy: Do students need fact knowledge before higher order learning? *Journal of Educational Psychology, 111*(2), 189-209. DOI 10.1037/edu0000282.
- **Verified URL:** https://remix.berklee.edu/faculty-works/11 (page loaded; summary of abstract).
- **Design:** Three experiments (two college, one middle school); fact quizzes, higher-order quizzes, or mixed quizzes versus rereading or no quiz.
- **Key finding:** Retrieval practice improved delayed performance. Higher-order and mixed quizzes improved higher-order test performance; fact-only quizzes did not. The author suggests that fact-based retrieval practice may be less effective for higher-order learning than higher-order retrieval practice itself. I did not see effect sizes.
- **Implication:** For algorithms and math, don't rely on definition cards to build problem-solving. Write "apply/derive/why" items and mixed quizzes.
- **Caveats:** Classroom science/social-studies content, not CS or proofs. "Fact knowledge first" is still sensible for novices (inference).

---

## Open questions / contested

- **Does MC bypass retrieval?** Little et al. 2012 say plausible distractors fix this; Rowland 2014 says recall tests produce larger benefits on average; Smith & Karpicke 2014 found little or no recall advantage in 3 of 4 experiments. Probably depends on retrieval success and difficulty. No one has tested this on CS or math item banks.
- **Longest-answer cue.** Widely listed as a flaw, but measured effects are mixed: easier items in Pham et al. 2018 (a medical student cross-over), only partial significance in Casu & Garcia-Garcia (power .44), and not systematic across all flaws. Your 68% (vs 24% chance) is far larger than a typical drift, so whether your learner uses it is checkable: compare accuracy on longest-correct items before vs after matching lengths.
- **3 vs 4 options.** Rodriguez 2005 favours 3 for exams; for a study tool the stronger reason to prune is lure exposure (Roediger & Marsh) and distractor quality. I did not find a study on the number of options and *learning*.
- **"All of the above"/"None of the above."** Haladyna et al. advise caution; I did not verify the specific evidence and could not read the paper's full text.
- **Elaborative interrogation / self-explanation.** Large effect sizes (0.85 to 2.57, Seifert 1993 via Dunlosky) but rated only moderate, mostly lab fact lists, dependent on prior knowledge. Chi 1994 is n=14 vs 10. Treat as optional, not core.
- **Confidence and hypercorrection.** Robust for trivia and a horticulture class (Carpenter et al. 2018); untested for math or code items. I did not search for judgments-of-learning studies beyond what Dunlosky reports, so that topic is covered thinly here.
- **Atomic vs complex cards.** I found **no peer-reviewed study** testing "atomic" (one-fact) cards against complex cards; the "atomic cards" advice is popular practice lore (spaced-repetition community), not research. The closest evidence is Lin et al. 2018 (conceptual vs detailed) and Agarwal 2019 (fact vs higher-order). Mark any "atomic cards are better" claim in the app as UNVERIFIED.
- **Generation effect vs testing.** Bertsch's 0.40 is for generation versus reading, not versus testing with feedback; those are different comparisons, and I did not compare them.
- **Transfer to CLRS, Pep/9, cryptography and graphics math.** Every study here used prose, word lists, trivia or classroom science. I found no study of these formats on code tracing, proofs or equation derivation. This is the largest gap; treat the format advice as plausible, not proven, for those subjects.
- **Items I could not fully verify:** Slamecka & Graf (abstract behind a login), Haladyna et al. option rules (second-hand), Rush et al. volume/article number, and Little & Bjork 2015 page numbers (checked DOI only through the PDF header).
