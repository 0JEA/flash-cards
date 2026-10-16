# Retrieval practice, spacing, and scheduling: evidence for the flashcard app

Compiled 2026-10-15. Scope: `/home/coke/flash-cards/index.html` + `questions.js` (122 multiple-choice questions, shuffled once per page load, no persistence, only an end-of-session "Review Missed" button). Learner: 3rd-year CS + Math undergrad, wants durable retention across several courses.

## How to read the verification tags

Every paper below was checked against a page I actually loaded in this session. The tag says how deep the check went, because the depth matters for how much to trust the numbers.

- **FULLTEXT**: I downloaded and read the paper (or an author/mirror copy). Numbers marked this way come from the paper itself.
- **ABSTRACT**: I loaded a bibliographic record plus the abstract (Crossref API and/or Europe PMC API) but not the full text (paywalled). Numbers are only those printed in the abstract. Anything else is flagged as unverified.
- **UNVERIFIED**: could not load a confirming page. Not used for any claim.

Pages used for the ABSTRACT checks (patterns; the DOI/PMID is substituted per paper):
- Crossref: `https://api.crossref.org/works/<DOI>`
- Europe PMC: `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=DOI:"<DOI>"&resultType=core&format=json`

Note on method: pubmed.ncbi.nlm.nih.gov returned a cookie wall to my fetcher, and several publisher sites (APA, SAGE, Science, Springer) returned 403/redirects. Two PMIDs I first tried from memory (24827079, 19076485) turned out to be unrelated papers (a Fontan-surgery paper and an fMRI in-group-bias paper). This is why nothing here is cited from memory.

---

## What this means for the app (10 design implications)

1. **Persistence is the prerequisite for everything else.** Spacing, successive relearning, and scheduling all need per-card history (last-seen time, number of correct recalls, interval) that survives page reloads. Use localStorage/IndexedDB plus a JSON export/import so progress is not lost. The multi-day designs behind the best results (Rawson & Dunlosky, Kornell, Cepeda) need several sessions on different days, which the current app cannot do. [Rawson & Dunlosky 2011; Rawson et al. 2013; Kornell 2009; Cepeda 2006/2008]
2. **Make the learner commit to an answer before seeing anything.** Retrieval beat restudy by large margins at delays of 2 days to 1 week (Roediger & Karpicke: 56% vs 42% at 1 week; Karpicke & Blunt: 0.67 vs 0.45), even though learners rated restudy as better. No "show answer first" mode as the default. [Roediger & Karpicke 2006; Karpicke & Blunt 2011; Rowland 2014]
3. **Multiple choice is a weaker form of retrieval than recall, unless recall would fail.** Recognition-type initial tests gave g about 0.29 to 0.32 vs 0.61 to 0.81 for recall in Rowland's meta-analysis, yet Smith & Karpicke found little or no advantage of short-answer over multiple choice in 3 of 4 experiments. Practical design: keep MCQ, but add an optional "type/think your answer first, then reveal options" step and (for CS/math) some free-response self-graded cards. Inference: for hard new material, MCQ is the better starting format because retrieval success is higher. [Rowland 2014; Smith & Karpicke 2014; Adesope 2017]
4. **Always show corrective feedback, including the correct answer after a wrong choice.** In Butler & Roediger, MCQ with no feedback gave only .31 correct on a 1-week cued-recall test vs .45 (immediate feedback) and .56 (feedback at end of block), and feedback reduced lure intrusions. Pashler et al.: feedback after errors raised 1-week retention by 494%; feedback after correct answers did little. In Rowland, tests answered at or below 50% initial accuracy with no feedback produced no benefit (g = 0.03). [Butler & Roediger 2008; Pashler 2005; Rowland 2014]
5. **Do not let the learner drop cards after one correct answer; enforce a criterion.** Learners remove items once they can recall them, and this costs retention (Karpicke 2008, 2009; Kornell & Bjork 2008). The best-supported rule: get each card correct 3 times in the first session, then relearn it (1 more correct recall) in about 3 later sessions at wide spacing. Mastery is "3 correct recalls across at least 3 separate days", not "got it right once". [Rawson & Dunlosky 2011; Rawson et al. 2013; Karpicke & Roediger 2008; Karpicke 2009]
6. **Set the gap relative to the date you need the knowledge.** The optimal gap between study sessions is about 20 to 40% of the delay to the test for a 1-week horizon, falling to about 5 to 10% for a 1-year horizon. If the learner enters an exam date per course, schedule reviews as a ratio of time remaining. Without a date, default to expanding intervals. Too short a gap loses more than too long a gap (asymmetric curve); when unsure, err long. The specific interval numbers I suggest are an inference from these ratios, not from a single study. [Cepeda 2008; Cepeda 2006; Cepeda 2009]
7. **Start with a simple scheduler; do not build a research-grade one first.** Published evidence that fancy algorithms beat simple spacing in real learning outcomes is thin: Lindsey 2014 (randomized, middle school) found +10.0% over one-size-fits-all spaced review; Settles & Meeder found only +0.3% overall engagement for HLR vs Leitner (the +12% headline compared HLR with and without word features); Tabibian's evidence is an observational "natural experiment"; FSRS and Ye et al. evidence is from the algorithm authors' own datasets/benchmarks. A Leitner-box or SM-2-like scheme with the criterion rule from item 5 captures most of the supported benefit. Move to FSRS only if you want calibrated recall probabilities and are willing to log reviews. [Settles & Meeder 2016; Lindsey 2014; Tabibian 2019; Ye 2022; srs-benchmark]
8. **Interleave when the task is discriminating between similar things; do not assume it helps for definitions.** Interleaving helped most for visual/category material (g = 0.67) and math (g = 0.34), and was worse than blocking for words (g = -0.39). Rohrer & Taylor: mixed vs blocked math practice 63% vs 20% on a test 1 week later, even though blockers did better during practice (89% vs 60%). Suggested default: shuffle across cards within a topic, treat cross-course mixing as a user option, and prefer mixing for "which method applies" math/CS cards (inference). [Brunmair & Richter 2019; Rohrer & Taylor 2007; Kornell & Bjork 2008a]
9. **Do not trust, or optimize for, how the session feels.** Learners rated massing, restudy, and concept mapping as more effective than spaced retrieval, even after seeing the opposite results (72% of participants in Kornell 2009; 75% in Karpicke & Blunt Exp. 2). The UI should show delayed-retest accuracy ("recalled correctly after 7+ days") rather than within-session accuracy as the progress metric, and should avoid self-rated "I know this" as the only scheduling input. [Kornell 2009; Karpicke & Blunt 2011; Bjork & Bjork 2023; Roediger & Karpicke 2006]
10. **Shuffle again on every presentation, including option order, and keep session items at a success rate that is not too low.** Initial retrieval success mattered: effect sizes grew from g = 0.03 (success at or below 50%, no feedback) to 0.29 (51 to 75%) to 0.56 (above 75%). Inference for the app: resurface a missed card within the same session (with feedback), and mix in previously-correct cards so overall in-session accuracy stays high enough to be useful, while the due-date logic spreads the real reviews across days. [Rowland 2014]

---

## Paper entries

Format: citation · verified URL · design · key finding · implication for this app · caveats.

### 1. Testing effect / retrieval practice

#### 1.1 Roediger & Karpicke (2006), the foundational study  [FULLTEXT]
- **Citation:** Roediger, H. L., & Karpicke, J. D. (2006). Test-enhanced learning: Taking memory tests improves long-term retention. *Psychological Science, 17*(3), 249-255. DOI 10.1111/j.1467-9280.2006.01693.x
- **URL loaded:** https://learninglab.psych.purdue.edu/downloads/2006/2006_Roediger_Karpicke_PsychSci.pdf (full text); abstract also via Europe PMC (PMID 16507066).
- **Design:** Exp. 1: 120 Washington University undergraduates; prose passages (about 30 idea units each); study once then either restudy or take a free-recall test, no feedback; final free recall at 5 min, 2 days, or 1 week. Exp. 2: 180 undergraduates; repeated study (SSSS) vs study plus 1 test (SSST) vs repeated tests (STTT).
- **Key finding:** At 5 min, restudy won (81% vs 75%, d = 0.52). At 2 days, testing won (68% vs 54%, d = 0.95). At 1 week, testing 56% vs restudy 42% (d = 0.83). Exp. 2, 1 week: STTT 61%, SSST 56%, SSSS 40%. Learners in the repeated-study group predicted they would do best.
- **Implication:** Quiz-first beats re-reading for anything you need after more than a day. Also a warning that "I did well just now" is uninformative.
- **Caveats:** Prose passages and free recall with no feedback, not MCQ; undergraduate lab sample; students were told in advance only one-week-later testing was possible in some cells. The 5-min reversal means testing does not help for cramming-style short horizons.

#### 1.2 Karpicke & Blunt (2011)  [FULLTEXT]
- **Citation:** Karpicke, J. D., & Blunt, J. R. (2011). Retrieval practice produces more learning than elaborative studying with concept mapping. *Science, 331*(6018), 772-775. DOI 10.1126/science.1199327
- **URL loaded:** https://learninglab.psych.purdue.edu/downloads/2011/2011_Karpicke_Blunt_Science.pdf (full text); abstract via Europe PMC (PMID 21252317).
- **Design:** Exp. 1: 80 undergraduates studied a science text (study once, repeated study, concept mapping, or retrieval practice), final short-answer test 1 week later (verbatim and inference questions). Exp. 2: 120 students, within-subject, retrieval vs concept mapping, final test either short-answer or a concept-map task.
- **Key finding:** Exp. 1: retrieval practice M = 0.67 vs concept mapping 0.45 (about a 50% relative gain; d = 1.50). Advantage also held on inference questions. Exp. 2: 84% of students scored higher after retrieval practice; 75% had predicted concept mapping would be better.
- **Implication:** Supports a quiz-centred app over "read the explanation" features, for conceptual and inference-level content, not only rote facts.
- **Caveats:** Lab study, one week delay, single text type. Concept mapping is one comparator, not "all elaboration".

#### 1.3 Rowland (2014) meta-analysis  [FULLTEXT]
- **Citation:** Rowland, C. A. (2014). The effect of testing versus restudy on retention: A meta-analytic review of the testing effect. *Psychological Bulletin, 140*(6), 1432-1463. DOI 10.1037/a0037559
- **URL loaded:** https://courseware.epfl.ch/assets/courseware/v1/fdde2f0aa590bf3b1324077a6bf1540c/asset-v1%3AEPFL%2BDEMO%2B2020%2Btype%40asset%2Bblock/Rowland2014-meta-analysis.pdf (a copy of the paper, 34 pages); DOI resolves to https://doi.apa.org/doi/10.1037/a0037559.
- **Design:** Random-effects meta-analysis, k = 159 effect sizes, testing vs restudy.
- **Key finding:** Overall g = 0.50 (95% CI 0.42-0.58). Retention of 1 day or more g = 0.69 vs under 1 day g = 0.41. Initial test type: cued recall g = 0.61, free recall g = 0.29, recognition g = 0.29 (in the "high-exposure" data subset: cued recall 0.72, free recall 0.81, recognition 0.36). Final test type: cued 0.57, free recall 0.49, recognition 0.31. Feedback: with feedback g = 0.73 vs without 0.39. Feedback timing, among feedback studies: delayed g = 1.38 (k = 6) vs immediate g = 0.66 (k = 46); the author warns this is based on few studies and confounded. Initial retrieval success with no feedback: at or below 50% g = 0.03 (CI -0.21 to 0.27), 51-75% g = 0.29, above 75% g = 0.56.
- **Implication:** (a) MCQ-style (recognition) testing still helps but less than recall; (b) feedback matters most; (c) benefits grow with delay, so measure retention days later.
- **Caveats:** High heterogeneity (tau-squared 0.21, Q = 1009). Recognition tests rarely used with feedback in this literature so the cued-vs-recognition difference is partly confounded with feedback use (the author says so). Control is restudy, not "no study".

#### 1.4 Adesope, Trevisan & Sundararajan (2017) meta-analysis  [ABSTRACT; numbers from secondary summary]
- **Citation:** Adesope, O. O., Trevisan, D. A., & Sundararajan, N. (2017). Rethinking the use of tests: A meta-analysis of practice testing. *Review of Educational Research, 87*(3), 659-701. DOI 10.3102/0034654316689306
- **URL loaded:** Crossref record https://api.crossref.org/works/10.3102/0034654316689306 (abstract); secondary summary https://www.learningscientists.org/blog/2017/2/9-1 (blog by Y. Weinstein summarizing the paper). Publisher page returned 403.
- **Design:** Meta-analysis. Search results disagree on the number of articles (118 vs 188) but agree on 272 independent effect sizes; I could not confirm this in a primary source. UNVERIFIED: overall g (a figure of 0.61 circulates; I did not find it in a source I loaded).
- **Key finding (qualitative, via abstract and blog summary):** practice tests beat restudy and all other comparison conditions; hybrid/mixed-format practice tests did slightly better than other formats; matching practice and final test format was slightly better; benefits were larger when the delay was over 1 day; feedback added only a small advantage in this synthesis (this differs from Rowland's larger feedback effect); effects appeared in real classrooms and transfer tests.
- **Implication:** Corroborates Rowland and Yang on the direction of the effect and on MCQ being a viable practice format.
- **Caveats:** I have no verified effect-size numbers for this paper. The blog is a secondary source.

#### 1.5 Yang, Luo, Vadillo, Yu & Shanks (2021) classroom meta-analysis  [ABSTRACT]
- **Citation:** Yang, C., Luo, L., Vadillo, M. A., Yu, R., & Shanks, D. R. (2021). Testing (quizzing) boosts classroom learning: A systematic and meta-analytic review. *Psychological Bulletin, 147*(4), 399-435. DOI 10.1037/bul0000309
- **URL loaded:** Crossref https://api.crossref.org/works/10.1037/bul0000309 and Europe PMC (PMID 33683913).
- **Design:** 222 independent studies, 48,478 students, classroom settings.
- **Key finding:** Overall g = 0.499. Moderated by control-condition strategy, test-format consistency, material matching, corrective feedback, number of test repetitions, test timing/location, treatment duration, design. Supports exposure, transfer-appropriate-processing, and motivation accounts.
- **Implication:** The effect is not a lab artifact. Number of repetitions and feedback are moderators you control in the app.
- **Caveats:** Abstract only; moderator-level numbers not verified.

#### 1.6 Karpicke & Roediger (2008)  [ABSTRACT]
- **Citation:** Karpicke, J. D., & Roediger, H. L. (2008). The critical importance of retrieval for learning. *Science, 319*(5865), 966-968. DOI 10.1126/science.1152408
- **URL loaded:** Crossref https://api.crossref.org/works/10.1126/science.1152408 and Europe PMC abstract.
- **Design (from abstract):** Students learned foreign-language vocabulary with study-test trials; once an item was recalled it was either kept in study and test, dropped from testing only, dropped from study only, or dropped from both.
- **Key finding (abstract):** Repeated studying after first correct recall had no effect on delayed recall; repeated testing produced a large positive effect. Students' predictions of their own performance were uncorrelated with actual performance. (Specific percentages not verified.)
- **Implication:** The criterion rule in implication #5 is justified: stop re-presenting a card after one correct answer and you stop the learning.
- **Caveats:** Vocabulary pairs, lab setting.

#### 1.7 Smith & Karpicke (2014), MCQ vs short-answer vs hybrid  [ABSTRACT]
- **Citation:** Smith, M. A., & Karpicke, J. D. (2014). Retrieval practice with short-answer, multiple-choice, and hybrid tests. *Memory, 22*(7), 784-802. DOI 10.1080/09658211.2013.831454
- **URL loaded:** Europe PMC (PMID 24059563).
- **Design:** Four experiments, N = 372; educational texts; retrieval via short-answer, MCQ, or hybrid (recall attempt then MCQ); final assessment 1 week later with verbatim and inference questions.
- **Key finding:** All formats beat study-only on both question types. Little or no advantage of short-answer or hybrid over MCQ in 3 of 4 experiments; in Exp. 4, when initial short-answer retrieval success was improved, short-answer/hybrid beat MCQ.
- **Implication:** Directly relevant to this MCQ app: the format is fine; retrieval success rate is the lever.
- **Caveats:** Reading-comprehension texts; no spacing manipulation.

### 2. Spacing and lag

#### 2.1 Cepeda, Pashler, Vul, Wixted & Rohrer (2006) meta-analysis  [ABSTRACT]
- **Citation:** Cepeda, N. J., Pashler, H., Vul, E., Wixted, J. T., & Rohrer, D. (2006). Distributed practice in verbal recall tasks: A review and quantitative synthesis. *Psychological Bulletin, 132*(3), 354-380. DOI 10.1037/0033-2909.132.3.354
- **URL loaded:** Europe PMC (PMID 16719566) and Crossref.
- **Design:** 839 assessments of distributed practice in 317 experiments from 184 articles.
- **Key finding:** Inter-study interval (ISI) and retention interval interact: the ISI that maximizes retention increases as the retention interval increases. Effects of spacing, lag, and expanding intervals analyzed (the abstract gives no pooled effect size).
- **Implication:** There is no single best interval; the schedule must depend on how far away the test is.
- **Caveats:** Verbal recall tasks only; many short-delay studies. Abstract only, so the pooled effect numbers are not verified here.

#### 2.2 Cepeda, Vul, Rohrer, Wixted & Pashler (2008) "temporal ridgeline"  [ABSTRACT]
- **Citation:** Cepeda, N. J., Vul, E., Rohrer, D., Wixted, J. T., & Pashler, H. (2008). Spacing effects in learning: A temporal ridgeline of optimal retention. *Psychological Science, 19*(11), 1095-1102. DOI 10.1111/j.1467-9280.2008.02209.x
- **URL loaded:** Europe PMC (PMID 19076480).
- **Design:** More than 1,350 individuals taught facts, reviewed after a gap of up to 3.5 months, tested after a further delay of up to 1 year (an internet-based study).
- **Key finding:** Increasing the gap first raised then lowered final test accuracy. Optimal gap as a share of test delay fell from about 20-40% (1-week delay) to about 5-10% (1-year delay).
- **Implication:** Source for the ratio rule in implication #6. Example (inference, applying the ratio): exam in 4 weeks, first review about 4-8 days after first study; exam in 1 year, review about 2-5 weeks after.
- **Caveats:** Two-session design (one review), trivia-style facts, not a full multi-review schedule; the ratios are an average over item types.

#### 2.3 Cepeda, Coburn, Rohrer, Wixted, Mozer & Pashler (2009)  [ABSTRACT]
- **Citation:** Cepeda, N. J., Coburn, N., Rohrer, D., Wixted, J. T., Mozer, M. C., & Pashler, H. (2009). Optimizing distributed practice: Theoretical analysis and practical implications. *Experimental Psychology, 56*(4), 236-246. DOI 10.1027/1618-3169.56.4.236
- **URL loaded:** Europe PMC (PMID 19439395).
- **Design:** Two three-session lab studies; foreign vocabulary, facts, names of visual objects; test delays up to 6 months.
- **Key finding:** An optimal gap improved final recall by up to 150%; the gap effect was non-monotonic (sharp rise then gradual decline).
- **Implication:** Confirms the shape of the curve (too-short gaps cost much more than too-long ones); supports cumulative review.
- **Caveats:** Abstract only.

#### 2.4 Kornell (2009), flashcards: spacing vs cramming  [FULLTEXT]
- **Citation:** Kornell, N. (2009). Optimising learning using flashcards: Spacing is more effective than cramming. *Applied Cognitive Psychology, 23*(9), 1297-1317. DOI 10.1002/acp.1537
- **URL loaded:** https://web.williams.edu/Psychology/Faculty/Kornell/Publications/Kornell.2009b.pdf (full text, 21 pages). Abstract also on Crossref.
- **Design:** Three experiments run online with UCLA students: Exp. 1 N = 20 (one stack of 20 cards = spaced vs four stacks of 5 = massed), test 24 h later; Exp. 2 N = 25, four days of study then test on day 5 (spaced vs massed vs cramming); Exp. 3 N = 25, adds a day-5 review, test on day 6. Materials: GRE-type synonym pairs. Cards were studied, not self-tested (no overt response).
- **Key finding:** Exp. 1: 49% (spaced) vs 36% (massed). Exp. 2: 54% vs 21% (massed); spaced 54% vs cramming 34%. Exp. 3: 65% vs 34% (massed); 65% vs 37% for items massed on the last day (d = 0.90). Spacing beat massing for 90% of participants, yet after session 1, 72% believed massing had been better.
- **Implication:** Evidence that even simple spacing of a flashcard deck beats the learner's usual strategies; also evidence that dividing a large deck into small stacks (what many students do) reduces spacing. Argues for one big rotating deck per course.
- **Caveats:** Small samples (20-25), lab-style online study, tiny effect on only a couple of days' lag, study-only trials rather than test trials, 24 h to 2 day retention only.

### 3. Successive relearning

#### 3.1 Rawson & Dunlosky (2011)  [ABSTRACT]
- **Citation:** Rawson, K. A., & Dunlosky, J. (2011). Optimizing schedules of retrieval practice for durable and efficient learning: How much is enough? *Journal of Experimental Psychology: General, 140*(3), 283-302. DOI 10.1037/a0023956
- **URL loaded:** Europe PMC and Crossref.
- **Design:** 3 experiments, 533 students, conceptual material (key terms) via retrieval practice with restudy. Initial criterion 1 to 4 correct recalls, then 1 correct recall in 1 to 5 relearning sessions; durability tested by cued recall and relearning rate 1 to 4 months later; efficiency = total practice trials. More than 100,000 hand-scored responses.
- **Key finding:** Initial-criterion and relearning effects were subadditive: criterion mattered a lot before relearning and much less after. Relearning had large effects on retention at a small added cost in trials. Recommendation: "practice recalling concepts to an initial criterion of 3 correct recalls and then to relearn them 3 times at widely spaced intervals."
- **Implication:** The core scheduling rule for the app (implication #5).
- **Caveats:** Abstract only here (specific retention percentages not verified). Definitions/key terms; motivated lab volunteers.

#### 3.2 Rawson & Dunlosky (2013)  [ABSTRACT]
- **Citation:** Rawson, K. A., & Dunlosky, J. (2013). Relearning attenuates the benefits and costs of spacing. *Journal of Experimental Psychology: General, 142*(4), 1113-1129. DOI 10.1037/a0030498
- **URL loaded:** Europe PMC (PMID 23088488).
- **Design:** 3 experiments, 567 students, key-term definitions via test-restudy practice to 1 or 3 correct recalls; initial practice massed or spaced; 2-3 relearning sessions; final test days or weeks later.
- **Key finding:** Benefits of initial spacing were large before relearning but significantly attenuated after relearning; the extra time cost of spaced initial learning was also attenuated by faster relearning.
- **Implication:** If the learner does enough relearning sessions, the exact first-session spacing matters less. Do not over-engineer the first-session schedule.
- **Caveats:** Abstract only.

#### 3.3 Rawson, Dunlosky & Sciartelli (2013), classroom study  [secondary source only; primary paywalled]
- **Citation:** Rawson, K. A., Dunlosky, J., & Sciartelli, S. M. (2013). The power of successive relearning: Improving performance on course exams and long-term retention. *Educational Psychology Review, 25*(4), 523-548. DOI 10.1007/s10648-013-9240-4 (existence confirmed via a Crossref bibliographic search, https://api.crossref.org/works?query.bibliographic=Rawson+Dunlosky+Sciartelli+power+of+successive+relearning, and in the reference list of the chapter below).
- **URL loaded (numbers come from here, not the paper):** Dunlosky, Greve, Badali, Wissman & Rawson (2023), "Successive relearning" in *In Their Own Words*, Division 2, APA, https://www.unh.edu/teaching-learning-resource-hub/sites/default/files/media/2023-06/itow-successive-relearning-dunlosky-greve-badali-wissman-rawson.pdf (read in full via pdftotext). Springer page redirected to a login; I did not read the paper itself.
- **Design (as described by the authors in the chapter):** Intro psychology course, students learned course concepts on virtual flashcard stacks of 6-8 concepts, at least 3 sessions separated by at least one day, begun when the instructor introduced the concepts; within-student comparison with "business as usual" concepts and with spaced-restudy and self-regulated groups.
- **Key finding (per the chapter):** Successive relearning raised exam performance by over 10% relative to the baseline control; a retention test 24 days after the exam showed over 60% recall for successively relearned concepts vs under 20% for concepts studied the students' own way. Restudy-only and self-regulated groups benefited from spacing but less. A separate 2020 study on probability problem solving found only a small advantage (Cohen's d = .28) and performance around 50% or less.
- **Implication:** Real-course evidence that the schedule transfers to exams, and a caution for math: for problem-solving skills, successive relearning of cards may not be enough (more varied practice needed).
- **Caveats:** Authors summarizing their own work, so treat the exact numbers as "as reported by the authors", not independently verified. The probability-problem result is relevant for the Math side of this learner.

### 4. Interleaving

#### 4.1 Rohrer & Taylor (2007)  [FULLTEXT]
- **Citation:** Rohrer, D., & Taylor, K. (2007). The shuffling of mathematics problems improves learning. *Instructional Science, 35*(6), 481-498. DOI 10.1007/s11251-007-9015-8
- **URL loaded:** https://www.gwern.net/doc/psychology/spaced-repetition/2007-rohrer.pdf (full text).
- **Design:** Exp. 1: 66 USF undergraduates, permutation problems; spaced (two sessions 1 week apart) vs massed (one session), tested 1 week after last practice. Exp. 2: 18 undergraduates, volume formulas for four geometric solids; mixed vs blocked practice; test 1 week later.
- **Key finding:** Exp. 1: spacers 74% vs massers 49% and light massers 46%. Exp. 2: mixed 63% vs blocked 20% on the test (d = 1.34); in practice, blockers did better (89% vs 60%).
- **Implication:** Mixing problem types makes practice feel worse but works better later; relevant to Math cards that ask "which formula/method".
- **Caveats:** Very small Exp. 2 (N = 18, the authors say statistical power was not a concern because effects were large); lab, one week, learners new to the material.

#### 4.2 Kornell & Bjork (2008a), "Learning concepts and categories"  [ABSTRACT]
- **Citation:** Kornell, N., & Bjork, R. A. (2008). Learning concepts and categories: Is spacing the "enemy of induction"? *Psychological Science, 19*(6), 585-592. DOI 10.1111/j.1467-9280.2008.02127.x
- **URL loaded:** Europe PMC and Crossref.
- **Design:** Participants studied paintings by several artists massed (consecutive) vs spaced/interleaved, then classified new paintings (inductive learning).
- **Key finding:** Induction was better after spacing/interleaving, though participants rated massing as more effective even after their own test results showed the opposite.
- **Implication:** Interleaving helps category/pattern learning (e.g., recognizing which type of problem or algorithm applies).
- **Caveats:** Paintings are visual categories; the meta-analysis below shows this is where interleaving works best, so do not generalize to definitions.

#### 4.3 Brunmair & Richter (2019) meta-analysis  [ABSTRACT]
- **Citation:** Brunmair, M., & Richter, T. (2019). Similarity matters: A meta-analysis of interleaved learning and its moderators. *Psychological Bulletin, 145*(11), 1029-1052. DOI 10.1037/bul0000209
- **URL loaded:** Europe PMC and Crossref.
- **Design:** 59 studies, 238 effect sizes, 158 samples; multilevel meta-analysis.
- **Key finding:** Overall interleaving effect Hedges' g = 0.42. By material: paintings g = 0.67; math tasks g = 0.34; expository texts and tastes ambiguous (non-significant); words: blocking better, g = -0.39. Stronger interleaving effects when material is more similar between categories, less similar within categories, and more complex.
- **Implication:** Interleave confusable concepts and problem types; do not force interleaving of vocabulary-style definitions. Mixing different courses is NOT what this literature tests (it studies similar categories); the cross-course mixing benefit is an inference at best.
- **Caveats:** Abstract only; mostly lab studies with short delays.

### 5. Scheduling algorithms with published evaluations

#### 5.1 Leitner system (1972/1974 book)  [UNVERIFIED original; described in Settles & Meeder]
- **Citation:** Leitner, S. (1972; cited as 1974 in other papers). *So lernt man lernen.* Freiburg: Herder.
- **Why UNVERIFIED:** I could not load the book. Its description comes from Settles & Meeder 2016 (Sec. 3.2, https://aclanthology.org/P16-1174.pdf) and Tabibian et al. (which cite it as [12]).
- **How it works (per Settles & Meeder):** cards sit in boxes corresponding to practice intervals (they describe 1-day, 2-day, and so on); a correct recall promotes the card to a longer-interval box, an incorrect one demotes it to a shorter-interval box. Simple, adaptive, no parameters to fit.
- **Evidence:** In Settles & Meeder's historical-log comparison, Leitner had MAE 0.235 and the highest AUC of the compared methods (0.542) but negative half-life correlation, i.e. a reasonable ranker but a weaker calibrated predictor than HLR (MAE 0.128).
- **Implication:** A good baseline for the app. Easy to implement with persistence.

#### 5.2 SM-2 (Wozniak)  [FULLTEXT of the algorithm description; no controlled evaluation]
- **Citation:** Wozniak, P. A. (1990). *Optimization of learning* (Master's thesis, University of Technology, Poznan); web adaptation "Algorithm SM-2", 1998.
- **URL loaded:** https://super-memory.com/english/ol/sm2.htm
- **Algorithm (as published):** new items start with E-factor (EF) 2.5; intervals I(1) = 1 day, I(2) = 6 days, I(n) = I(n-1) x EF; after each repetition grade quality q on 0-5; EF' = EF + (0.1 - (5-q) x (0.08 + (5-q) x 0.02)), minimum 1.3; if q < 3 restart the item's intervals; at the end of a day, repeat items scored below 4 until they reach at least 4.
- **Evidence:** An informal single-user report (the author, learning English vocabulary): 10,255 items memorized in the first year at about 41 minutes/day, overall retention 89.3% (92% excluding items with intervals under 3 weeks). No controlled comparison.
- **Implication:** Widely implemented, simple, 0-5 grading maps onto a "correct/incorrect + confidence" input for a quiz app. The "repeat until q >= 4 within the same day" rule is consistent with in-session feedback and re-presentation.
- **Caveats:** The evidence is the author's own case report. The benchmark below shows later algorithms predict recall better than simple heuristics, though that benchmark does not include SM-2 in its table.

#### 5.3 Settles & Meeder (2016), Half-Life Regression (Duolingo)  [FULLTEXT]
- **Citation:** Settles, B., & Meeder, B. (2016). A trainable spaced repetition model for language learning. *Proceedings of ACL 2016* (Volume 1: Long Papers), pp. 1848-1858.
- **URL loaded:** https://aclanthology.org/P16-1174.pdf (full text).
- **Design:** Two weeks of Duolingo log data (12.9 million student-word instances), 90/10 train/test split; plus two controlled user experiments in production (about 6 weeks, just under 1 million students for Experiment I).
- **Key finding:** Historical data: HLR MAE 0.128 vs Leitner 0.235 vs Pimsleur 0.445 (constant-average baseline 0.175); AUC HLR 0.538 vs Leitner 0.542 (Leitner higher on AUC, and all AUCs are low). The abstract claims error reduced 45%+ and a 12% engagement gain. In the actual user-experiment table, HLR vs Leitner changed daily retention by +0.3% (any activity), +0.3% (lessons), -7.3% (practice, significant); the +12.0% "any activity" figure is for HLR without vs with lexeme features (Experiment II).
- **Implication:** Better calibration does not automatically mean better learning or behaviour. Do not take the abstract's "12%" as the benefit of HLR over simple rules.
- **Caveats:** Engagement (daily return rate), not retention or learning outcomes, was the user-experiment metric. Duolingo is the authors' own product. The model predicts recall probability from review history; it was never tested against a no-algorithm control for learning.

#### 5.4 Tabibian et al. (2019), MEMORIZE  [ABSTRACT for PNAS; numbers from arXiv preprint]
- **Citation:** Tabibian, B., Upadhyay, U., De, A., Zarezade, A., Schölkopf, B., & Gomez-Rodriguez, M. (2019). Enhancing human learning via spaced repetition optimization. *PNAS, 116*(10), 3988-3993. DOI 10.1073/pnas.1815156116
- **URLs loaded:** Crossref https://api.crossref.org/works/10.1073/pnas.1815156116 and Europe PMC abstract (DOI search); preprint "Optimizing Human Learning" https://arxiv.org/pdf/1712.01856 (read in full; this is an earlier version, so some details may differ from the PNAS paper).
- **Design:** Optimal-control derivation (marked temporal point processes); the optimal reviewing intensity is proportional to the item's forgetting probability. Simulation plus a "natural experiment" on Duolingo data comparing users whose actual review times happened to follow MEMORIZE-like vs uniform vs threshold schedules.
- **Key finding:** Simulations: MEMORIZE outperformed uniform, last-minute, and threshold baselines on recall probability and forgetting rate. Duolingo data: learners whose review times were more likely under MEMORIZE had lower empirical forgetting rates and lower effort (for example, for a red-red-green-green recall pattern, 0.05x the effort and 0.12x the forgetting rate of the second-best schedule, per the preprint).
- **Implication:** Gives a theoretical principle ("review when recall probability drops") but needs a memory model fitted to data.
- **Caveats:** The Duolingo result is observational, not a randomized trial; the preprint explicitly lists "large scale interventional experiments" as future work. Flag: popular as "proven by Duolingo data" but the evidence is correlational. The PNAS paper may differ from the preprint; I only read the PNAS abstract.

#### 5.5 Ye, Su & Cao (2022), stochastic shortest path (MaiMemo)  [ABSTRACT]
- **Citation:** Ye, J., Su, J., & Cao, Y. (2022). A stochastic shortest path algorithm for optimizing spaced repetition scheduling. *Proceedings of the 28th ACM SIGKDD Conference on Knowledge Discovery and Data Mining (KDD '22)*, pp. 4381-4390. DOI 10.1145/3534678.3539081
- **URLs loaded:** https://hit.globalimpact.cn/en/publications/a-stochastic-shortest-path-algorithm-for-optimizing-spaced-repeti/ (bibliographic record and abstract; reached via redirect from scholar.hit.edu.cn); Crossref https://api.crossref.org/works/10.1145/3534678.3539081. The ACM DL page was not loaded. The MaiMemo paper page returned empty.
- **Design (per abstract):** Memory-behaviour logs from 220 million students (MaiMemo app) used to build a Markov-property memory model; a scheduler minimizes review cost via a stochastic shortest path algorithm.
- **Key finding (per abstract):** 12.6% improvement over the state of the art in experiments; deployed in MaiMemo serving millions of learners. This is the origin of the DHP/FSRS family of memory models (FSRS description via the wiki below).
- **Implication:** FSRS-style scheduling is a reasonable long-term target but requires collecting review logs per card.
- **Caveats:** Company authors (MaiMemo), vocabulary-learning domain, and I could not verify what "12.6%" is measured on or the baseline from the full paper. Treat as UNVERIFIED beyond the abstract.

#### 5.6 FSRS and the open-spaced-repetition benchmark  [not peer-reviewed; page loaded]
- **URLs loaded:** https://github.com/open-spaced-repetition/srs-benchmark (README) and https://github.com/open-spaced-repetition/awesome-fsrs/wiki/ABC-of-FSRS
- **What the benchmark is:** A community benchmark on Anki users' review histories (10,000 collections; 349,923,850 reviews evaluated without same-day reviews), metrics log loss, RMSE (bins), AUC.
- **Numbers (as displayed on the README when loaded, mean values, without same-day reviews):** FSRS-6 log loss 0.3460, AUC 0.7034; FSRS v4 0.3726 / 0.6853; HLR 0.4694 / 0.6369; Ebisu v2 0.4989 / 0.6051; constant-average baseline 0.3945 / 0.4997. Newer FSRS versions (FSRS-7 variants) rank higher still; a neural model (RWKV-Instant) scores best on log loss and AUC but is noted as not user-interpretable.
- **FSRS vs SM-2:** The ABC-of-FSRS wiki claims about 20-30% fewer reviews than SM-2 for the same retention, and states this comes from simulation. SM-2 and Leitner do not appear in the README result tables I read.
- **Implication:** Predicting whether a card will be remembered is a solved-enough problem for FSRS-class models; the parameter count (21 in FSRS-6) means you want hundreds of reviews per user before fitting, so default parameters would be used at first.
- **Caveats:** Maintained by the FSRS developers, not independently reviewed; measures prediction of recall, not final learning outcomes; Anki users are a self-selected population doing mostly self-graded cards; the "20-30%" is a simulation under FSRS's own memory model.

#### 5.7 Lindsey, Shroyer, Pashler & Mozer (2014)  [ABSTRACT]
- **Citation:** Lindsey, R. V., Shroyer, J. D., Pashler, H., & Mozer, M. C. (2014). Improving students' long-term knowledge retention through personalized review. *Psychological Science, 25*(3), 639-647. DOI 10.1177/0956797613504302
- **URL loaded:** Europe PMC (PMID 24444515).
- **Design:** Semester-long middle-school Spanish course using retrieval-practice software; time-matched review strategies compared on a cumulative exam after the semester ended.
- **Key finding:** Personalized review (inferring individual differences, combined with a memory theory) gave a 16.5% boost in course retention over massed study and a 10.0% improvement over a one-size-fits-all spaced strategy.
- **Implication:** One of very few real-classroom tests of an adaptive scheduler vs fixed spacing; supports "adaptive beats fixed", but the size is modest and the algorithm was heavy.
- **Caveats:** One course, one age group; percentages are relative course-retention gains; abstract only.

### 6. Feedback

#### 6.1 Butler & Roediger (2008)  [FULLTEXT]
- **Citation:** Butler, A. C., & Roediger, H. L. (2008). Feedback enhances the positive effects and reduces the negative effects of multiple-choice testing. *Memory & Cognition, 36*(3), 604-616. DOI 10.3758/MC.36.3.604
- **URL loaded:** https://mrbartonmaths.com/resourcesnew/8.%20Research/Formative%20Assessment/Feedback%20enhances%20the%20positive%20effects%20and%20reduces.pdf (a copy of the paper, 13 pages); abstract also on Crossref and Europe PMC (PubMed 18491500).
- **Design:** 72 Washington University undergraduates; passages studied, then an MCQ test (varying numbers of alternatives), with immediate feedback (10 s after each response), delayed feedback (end of the test block), or none; final cued recall test 1 week later.
- **Key finding (forced-report proportion correct, collapsed over conditions):** no test .14; MCQ with no feedback .31; immediate feedback .45; delayed (end-of-block) feedback .56. No-feedback produced significantly more lure intrusions than either feedback condition (d = .65 vs immediate; d = .81 vs delayed). Without feedback learners were overconfident.
- **Implication:** For an MCQ app, showing the right answer after every response is the highest-leverage feature, and exposure to wrong options (lures) is only harmful without feedback. Showing feedback for a block of questions at once is not worse than showing it right away.
- **Caveats:** Prose passages; "delayed" means a few minutes within the session, not a day; one experiment with a single delay manipulation, so do not conclude "always delay feedback"; I did not verify the wider feedback-timing literature. Rowland's delayed-feedback number (g = 1.38) rests on 6 effect sizes.

#### 6.2 Pashler, Cepeda, Wixted & Rohrer (2005)  [ABSTRACT]
- **Citation:** Pashler, H., Cepeda, N. J., Wixted, J. T., & Rohrer, D. (2005). When does feedback facilitate learning of words? *Journal of Experimental Psychology: Learning, Memory, and Cognition, 31*(1), 3-8. DOI 10.1037/0278-7393.31.1.3
- **URL loaded:** Europe PMC and Crossref.
- **Design:** N = 258; Luganda-English word pairs; two initial exposures then several tests with feedback varying between subjects; final test after 1 week.
- **Key finding:** Giving the correct answer after an incorrect response raised final retention by 494%; feedback after correct responses made little difference, regardless of confidence.
- **Implication:** Prioritise feedback on errors; correct-answer feedback can be minimal.
- **Caveats:** Paired associates (pure memorisation). The 494% is relative to an uncorrected base that was very low; Butler & Roediger found feedback after correct low-confidence answers helped too (outside this review's verification).

### 7. Metacognition and desirable difficulties

#### 7.1 Karpicke (2009)  [ABSTRACT]
- **Citation:** Karpicke, J. D. (2009). Metacognitive control and strategy selection: Deciding to practice retrieval during learning. *Journal of Experimental Psychology: General, 138*(4), 469-486. DOI 10.1037/a0017341
- **URL loaded:** Europe PMC and Crossref.
- **Design:** 4 experiments; foreign-language items across multiple study and test periods; learners either assigned to repeated testing/studying/removal, or given control to choose.
- **Key finding:** Assigned repeated retrieval produced powerful effects; when given control, many learners removed items rather than practice retrieval, with poor retention. A "metacognitive illusion": once an item can be recalled, learners believe they have "learned" it.
- **Implication:** Remove the option to drop cards; let the scheduler decide.
- **Caveats:** Abstract only; vocabulary items.

#### 7.2 Kornell & Bjork (2008b), dropping flashcards  [ABSTRACT]
- **Citation:** Kornell, N., & Bjork, R. A. (2008). Optimising self-regulated study: The benefits and costs of dropping flashcards. *Memory, 16*(2), 125-136. DOI 10.1080/09658210701763899
- **URL loaded:** Europe PMC (PMID 18286417).
- **Design:** Four experiments on flashcard dropping.
- **Key finding (abstract):** Being allowed to drop flashcards had "small but consistently negative effects on learning"; dropping rests on poor metacognitive monitoring and underestimating the value of further study. A secondary blog quotes 59% vs 63% recall, which I could not verify, so ignore that number.
- **Implication:** The effect of letting learners drop cards is small, so this is a lower priority than spacing and feedback; but it is free to avoid.
- **Caveats:** The UCLA PDF host refused my connection. Abstract only.

#### 7.3 Bjork & Bjork on desirable difficulties  [FULLTEXT of the 2023 chapter; 2011 chapter UNVERIFIED]
- **Citation loaded:** Bjork, E. L., & Bjork, R. A. (2023). Introducing desirable difficulties into practice and instruction: Obstacles and opportunities. In *In Their Own Words*, Division 2, APA.
- **URL loaded:** https://www.unh.edu/teaching-learning-resource-hub/sites/default/files/media/2023-06/itow-introducing-desirable-difficulties-into-practice-and-instruction-bjork-and-bjork.pdf
- **UNVERIFIED:** Bjork & Bjork (2011), "Making things hard on yourself, but in a good way", in *Psychology and the Real World* (Worth). The UCLA lab PDF refused the connection; a web search listed the chapter, but I did not load it.
- **Content (2023 chapter):** Desirable difficulties include spacing, interleaving, and testing; they are desirable only if the learner has the background to respond successfully, otherwise they are undesirable. Learners tend not to believe spaced or interleaved practice works because massing and blocking produce fluent in-session performance. Retrieval strength and storage strength are distinguished (learning vs performance).
- **Implication:** Basis for implication #9: show retention-based progress, and warn that sessions that feel hard are not failing.
- **Caveats:** A theoretical/review chapter, not an experiment. "Desirable difficulty" is a framework label that does not by itself predict which difficulties help; Brunmair & Richter's finding that interleaving hurts for words shows it needs boundary conditions.

#### 7.4 Dunlosky, Rawson, Marsh, Nathan & Willingham (2013)  [ABSTRACT]
- **Citation:** Dunlosky, J., Rawson, K. A., Marsh, E. J., Nathan, M. J., & Willingham, D. T. (2013). Improving students' learning with effective learning techniques. *Psychological Science in the Public Interest, 14*(1), 4-58. DOI 10.1177/1529100612453266
- **URL loaded:** Crossref and Europe PMC abstract (the monograph reviews 10 techniques including practice testing, distributed practice, interleaved practice, rereading, highlighting).
- **Not verified:** The per-technique utility ratings (practice testing and distributed practice rated high, interleaving rated low for lack of evidence at the time) are what I recall of this paper; I could not load the ratings section. Do not cite the ratings without checking.
- **Implication:** Context only.

---

## Open questions / contested

1. **MCQ vs recall is not settled.** Rowland found recognition tests give smaller testing effects; Smith & Karpicke found MCQ roughly as good as short answer when retrieval success is not improved. Adesope's summary favours mixed formats. For this app, the likely resolution is "success rate and feedback matter more than format", but no study here tests MCQ with spaced relearning on CS/Math content.
2. **Feedback timing.** Butler & Roediger found end-of-block feedback beat immediate; Rowland's delayed-feedback effect (g = 1.38) rests on 6 effect sizes and is flagged by its author as possibly confounded. Adesope's summary found only a small overall feedback benefit, in tension with Rowland's 0.73 vs 0.39. Treat "immediate correct answer plus later second attempt" as a safe default.
3. **Do sophisticated schedulers improve learning, not just prediction?** Lindsey 2014 is the best controlled evidence (+10% over fixed spacing). Settles & Meeder's randomized test showed essentially no engagement gain over Leitner (+0.3%), and Tabibian's support is observational. The FSRS benchmark and Ye et al. are author-run and measure recall prediction or review cost, not exam performance. No source I verified shows FSRS beating a well-tuned simple spacer on long-term learning in a randomized study.
4. **"Optimal gap" ratios** come from two-session trivia/vocabulary designs (Cepeda 2008, 2009). Whether the 5-40% rule extends to multi-review schedules and to conceptual CS/Math material is untested in anything I loaded.
5. **Interleaving across courses.** The meta-analytic evidence is for interleaving similar categories within a topic. Mixing unrelated courses in one session is a plausible scheduling convenience, but I found no study that tests it; it is an inference to leave off by default.
6. **Math problem-solving.** The one successive-relearning study on probability problems found only d = .28 and low performance (as reported in a secondary source). Card-based retrieval may not transfer to solving novel problems; worked-example and varied-problem practice are probably needed alongside it (inference).
7. **Meta-analytic overestimation risk.** Rowland and Adesope both pool lab-heavy literatures with restudy controls; Yang et al. found g about 0.50 in classrooms, which is close, but publication bias was not something I could assess from abstracts. Adesope's authors report fail-safe tests (via the blog), which are weak evidence.
8. **The "learners drop cards too early" result is robust in direction, small in size.** Kornell & Bjork 2008b describe the cost as small; Karpicke 2009 and Karpicke & Roediger 2008 describe it as large when dropping happens after one correct recall. The difference is the stage at which items are removed.
9. **Popular but weak or contested claims to avoid putting in the UI copy:** "spaced repetition makes you remember 200%/150% more" (the 150% in Cepeda 2009 is the best-gap vs a poor-gap in a lab, not a general effect); "FSRS needs 20-30% fewer reviews" (simulation by FSRS authors); "Duolingo's algorithm doubled retention" (the 12% in Settles & Meeder abstract compares HLR variants, not HLR vs Leitner); "the testing effect is d = 0.5 everywhere" (varies with delay, feedback, retrieval success).

## Verification summary

| Paper | Depth | Notes |
|---|---|---|
| Roediger & Karpicke 2006 | FULLTEXT | Purdue PDF |
| Karpicke & Blunt 2011 | FULLTEXT | Purdue PDF |
| Rowland 2014 | FULLTEXT | EPFL-hosted copy |
| Adesope et al. 2017 | ABSTRACT + secondary | no verified g |
| Yang et al. 2021 | ABSTRACT | g = 0.499 |
| Karpicke & Roediger 2008 | ABSTRACT | |
| Smith & Karpicke 2014 | ABSTRACT | |
| Cepeda 2006 / 2008 / 2009 | ABSTRACT | |
| Kornell 2009 | FULLTEXT | williams.edu PDF |
| Rawson & Dunlosky 2011 / 2013 | ABSTRACT | |
| Rawson et al. 2013 | existence via Crossref; numbers SECONDARY | authors' 2023 chapter |
| Rohrer & Taylor 2007 | FULLTEXT | gwern mirror |
| Kornell & Bjork 2008a | ABSTRACT | |
| Brunmair & Richter 2019 | ABSTRACT | |
| Leitner 1972 | UNVERIFIED (book) | described via Settles |
| SM-2 | FULLTEXT of web description | single-user report |
| Settles & Meeder 2016 | FULLTEXT | ACL anthology |
| Tabibian et al. 2019 | ABSTRACT (PNAS) + FULLTEXT preprint | |
| Ye, Su & Cao 2022 | ABSTRACT | |
| FSRS benchmark | README page | not peer-reviewed |
| Lindsey et al. 2014 | ABSTRACT | |
| Butler & Roediger 2008 | FULLTEXT | |
| Pashler et al. 2005 | ABSTRACT | |
| Karpicke 2009 | ABSTRACT | |
| Kornell & Bjork 2008b | ABSTRACT | |
| Bjork & Bjork 2023 chapter | FULLTEXT | 2011 chapter UNVERIFIED |
| Dunlosky et al. 2013 | ABSTRACT | ratings not verified |
