# CSC 370 study app: design

Date: 2026-10-16. Branch: `csc370` of `0JEA/flash-cards`. Status: BUILT and merged to `master` (2026-10-16). 59 tests, plus a mutation check: 18 of 19 rule-breaking mutations are caught, and the 19th is equivalent.

## What NOT to assume (read first)

- **`master` is live.** GitHub Pages serves `master` at https://0jea.github.io/flash-cards/. Merging to `master` deploys.
- **The ethics quiz is retired, not deleted.** It moves to `archive/ethics-questions.js` and is not loaded. Four of its answer keys look wrong (see the 2026-10-15 look-over); they were left as they are.
- **Lecture blanks are supplied, with a source label.** SUPERSEDED: the 2026-10-15 plan had the owner fill them himself, but he doesn't have them all. On 2026-10-16 every blank got an answer in `decks/csc370-blank-answers.js`, tagged slides / sebesta / history / inferred; inferred ones show as guesses. The Fill-blanks screen was removed, and blanks are now self-graded "Fill the blank" cards.
- **Progress is public.** The review log lives on the `progress` branch of a public repo. The owner accepted this on 2026-10-16.

## Goal

The owner (3rd-year CS + Math) wants to do well on AUCSC 370 Programming Languages pre-tests, post-tests and exams. Those are written short answers, arguments and code traces. Success means:

- he studies on phone and laptop, with progress synced;
- cards come back on a schedule across days;
- a card counts as learned only after repeated correct recall on separate days;
- the progress number shown is delayed recall, not in-session score.

## Learning decisions

Paper references point to `research/01-…` (R1), `research/02-…` (R2) and `research/03-…` (R3).

| # | Decision | Evidence |
|---|---|---|
| L1 | **Every card needs a committed answer before feedback** (typed, chosen or ordered). "I don't know" is allowed, counts as a miss, and still shows the answer. | Retrieval over restudy (Roediger & Karpicke 2006; Karpicke & Blunt 2011, R1). Generation effect d=.40 (Bertsch 2007, R2). Failed attempts still help (Kornell, Hays & Bjork 2009; Richland 2009, R2). |
| L2 | **Recall is the default format.** Multiple choice only where the wrong options are real, plausible confusions (for example which binding time or which language), with 3–4 options of similar length. | Recall beats recognition on average (Rowland 2014, R1/R2). MC works when distractors are competitive (Little 2012; Little & Bjork 2015, R2). Length cue (Pham 2018; Haladyna 2002, R2). 3 options suffice (Rodriguez 2005, R2). |
| L3 | **Code traces are typed and checked exactly** (whitespace-normalised). Every trace answer was produced by running the code. | Tracing precedes writing (Lister 2004; Lopez 2008; Venables 2009, R3). |
| L4 | **Ordering cards (Parsons style)** for sequences: compiler phases, binding times, derivations. Tap tiles in order (works on a phone). | Proof Blocks: same learning as writing in about 1/4 of the time (Poulsen 2022, R3). |
| L5 | **Immediate feedback on every card**, showing the correct answer, your answer and a one-line "why". | Feedback is the biggest lever (Butler & Roediger 2008: .31 none vs .45/.56 with feedback; Pashler 2005; Rowland 2014, R1). |
| L6 | **Confidence is one tap:** submit as **Sure** or **Guess**. A confident miss is flagged and explained. A guessed hit is not counted as learned. | Hypercorrection of confident errors (Butterfield & Metcalfe 2001, R2). |
| L7 | **Re-ask until correct.** A miss (or a guess, or a new card short of 3 correct today) goes to the END of the session queue, so no card repeats until every other card has been seen (owner, 2026-10-16; longer lags help more). | The owner's own drill preference (memory: re-ask the same question until correct). Success rate matters (Rowland 2014, R1). |
| L8 | **Criterion learning:** a new card must be answered correctly (and Sure) **3 times on its first day**, then **relearned** on later days. It counts as **mastered after 3 successful relearning days.** | Rawson & Dunlosky 2011: "criterion of 3 correct recalls and then relearn them 3 times at widely spaced intervals" (R1). |
| L9 | **Spacing:** relearning intervals of 1, 3, 7, 14, 30, 60 and 120 days. A miss on a review day resets to 1 day. If an exam date is set, an interval is capped at 30% of the days left. | Spacing (Cepeda 2006; Kornell 2009, R1). Optimal gap is 20–40% of the horizon for short horizons (Cepeda 2008, R1). A simple scheduler captures most of the benefit (Settles & Meeder 2016; Lindsey 2014, R1). |
| L10 | **No "drop", "suspend" or "I know this" button.** The scheduler decides. | Learners drop cards too early (Karpicke 2009; Kornell & Bjork 2008b, R1). Students don't space by themselves (Wissman 2012, R2). |
| L11 | ~~New cards come in lecture order~~ SUPERSEDED 2026-10-16 (owner): **every session is fully shuffled, new cards included.** New cards are still *picked* in lecture order under a daily limit. | Interleaving helps discrimination (Rohrer & Taylor 2007; Brunmair & Richter 2019, g=.42) but blocking is better for words and definitions (g=−.39), so new definitions stay grouped (R1). |
| L12 | **Headline metric = delayed recall:** the share of first attempts that were right on cards last seen 1+ days earlier, over the last 14 days. No in-session percentage. | Learners misjudge from in-session fluency (Kornell 2009: 72% preferred massing; Bjork & Bjork 2023, R1). |
| L13 | **Higher-order cards** (argue, compare, why) sit alongside facts, taken from the course's own post-tests. **Compare cards** set two methods side by side (static vs dynamic scope, compiler vs interpreter, stack vs heap). | Fact-only quizzes don't build higher-order skill (Agarwal 2019, R2). Comparing methods (Rittle-Johnson & Star 2009, R3). |
| L14 | **Recall cards show key points to grade against**, so self-grading is honest. | Self-explanation against a model (Hodds 2014, d=.95, R3). Inference for self-grading. |
| L15 | ~~The owner writes the blank answers himself~~ SUPERSEDED 2026-10-16: answers are supplied with a source label. The learner still types each blank before seeing it (generation), then self-grades. | Generation effect (Bertsch 2007, R2). |

Not adopted (and why):
- FSRS or HLR: their evidence comes from the algorithm authors' own data and measures prediction, not learning (R1 §5).
- Interleaving across courses: untested (R1 open question 5). There is only one course for now anyway.
- Subgoal labels: did not replicate in text-language CS1 (Morrison 2015, R3).
- An "explain in your own words" step on every card: utility rated only moderate (Dunlosky 2013, R2), and it would slow every card.

## Card model (`decks/csc370.js`)

```js
FC.registerDeck({ id: 'csc370', title: '…', lectures: [{ n, title }], cards: [...], blanks: [...] })
// card
{ id, lecture, type: 'recall' | 'typed' | 'mc' | 'order', prompt, code?, why, source,
  answer,          // recall: model answer; typed: canonical string; order: array of tiles in correct order
  accept?,         // typed: other accepted strings
  points?,         // recall: key points to grade against
  options?,        // mc: wrong options (the correct one is `answer`)
  verify? }        // typed: { lang: 'python'|'c'|'bash'|'node'|'guile'|'ecl', src } -> run by tests/verify-traces
// blank
{ id, lecture, slide, prompt }   // prompt contains exactly one "____"
```

## Progress model (`js/log.js`)

Progress is an **append-only event log**. Card state is always recomputed from the log, so merging two devices is a set union by event id: no conflicts and no lost reviews.

```js
{ i: id, t: epochMs, k: 'r', c: cardId, ok: 0|1, s: 0|1 /*sure*/, g?: given, o?: 1 /*override*/, d: deviceId }
{ i: id, t: epochMs, k: 'b', b: blankId, v: text, d: deviceId }   // blank answer; latest t wins
```

Cloze cards from blanks get the card id `blank:<blankId>`.

Local storage: `localStorage['fc.events']`. Capacity is about 40k events (about 2 semesters at 100 reviews a day). If that is ever hit, move to IndexedDB.

## Scheduler (`js/scheduler.js`, pure functions)

All days are local calendar days.

1. **Learning.** On the first day a card is seen, count its successes (correct and Sure). At 3 or more it graduates with step 0 and is due the next day. If that day ends below 3, the card stays in learning and is due again the next day (the count restarts each day).
2. **Review.** The first attempt on a due day decides the outcome:
   - success (correct and Sure): step += 1;
   - correct but Guess: step unchanged;
   - miss: step = 0.
   The next due date is the day + `INTERVALS[step]`, capped by the exam rule. Later re-asks that same day don't change the step.
3. **Mastered** = step ≥ 3.
4. **Session queue.** Due learning and review cards are shuffled. Then new cards are added in deck order, up to the new-per-day limit (default 10).
   - A miss or a Guess is re-inserted 3–5 cards later.
   - A learning card that hasn't reached its 3 successes today is re-inserted 6–10 cards later.
   - The session ends when the queue is empty.

## Sync (`js/sync.js`)

- **Where:** `0JEA/flash-cards`, branch `progress`, files `log/YYYY-MM.jsonl` (sharded by the month of each event), through the GitHub REST contents API.
- **Pull:** list `log/`, then fetch only files whose SHA changed since the last sync, and union them into the local log.
- **Push:** for each month that has local events missing from the remote, read the file and its SHA, union, and PUT with that SHA. On a 409/422 conflict, retry.
- **When:** pull on load; push on session end, on `visibilitychange → hidden`, and from the manual "Sync now" button. Offline is fine: it's local first.
- **Auth:** a fine-grained token limited to `0JEA/flash-cards` with Contents read/write, pasted once per device into Settings and kept in that browser's localStorage. Card text is rendered with `textContent` only.
  - Risk accepted: the token can also write `master`, so a stolen token could change the live site.

## UI

One page with three screens: **Home** (cards to review and to learn, remembered-later %, per-lecture mastery, Study button), **Study**, **Settings** (token, exam date, cards to learn per day, sync status). The page never scrolls. On the study screen Pretext picks the text scale per card so everything fits (`fitAsk`/`fitFeedback`), and wide windows put the question beside the answer.

The existing look carries over: dark, Geist and Space Grotesk, GSAP transitions, and Pretext measuring the incoming card's height.

Keyboard (as built):
- One-line answers (typed answers, traces, cloze): Enter submits as Sure; Shift+Enter submits as Guess. Traces are typed on one line, since whitespace is normalised.
- Recall textarea: Ctrl/Cmd+Enter is Sure; Ctrl/Cmd+Shift+Enter is Guess.
- MC: 1–4 select an option, then Enter or Shift+Enter submits.
- Feedback screen: Enter continues. On recall cards, 1 means "Missed it" and 2 means "Got it".

Typed, trace and cloze answers marked wrong offer an "I was right (only wording/formatting differs)" override. It is logged with `o: 1`.

## Testing

- `node --test tests/`: scheduler rules, merge and union, answer matching, and deck integrity (unique ids, MC length cue, order tiles, exactly one `____` per blank).
- `tests/verify-traces.js`: runs every card's `verify.src` with the named runtime and compares the output with `answer`.
- Playwright: a session end to end on a phone viewport and on desktop.
- Sync: one live round-trip against a throwaway path on the `progress` branch, then cleaned up.

## Content notes found while building (owner should know)

- History post-test Q3, "Newest of the languages listed": the key says **Python**, but Java (1995) is newer than Python (1991). The card is left out; ask the professor.
- History post-test Q3, "The oldest WSUT language": "WSUT" isn't defined anywhere in the PDFs, so the card is left out.
- Translation slide 8 labels the second `i` as `int_literal`. It's an `identifier`. Cards use `identifier`.
