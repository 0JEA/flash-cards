# CLAUDE.md: flash-cards (study app: CSC 370, CSC 310, CSC 325, Ethics)

## Read this first (what an agent gets wrong)

- **Pushing `master` does NOT deploy (verified 2026-10-16).** GitHub Pages is configured, but GitHub Actions are DISABLED on this repo, so Pages builds never run. The last build is from 2026-04-21, so https://0jea.github.io/flash-cards/ still serves the OLD ethics quiz. The owner chose NOT to enable Actions and to host on the VPS instead. That is PLANNED, NOT BUILT.
  Verify: `gh api repos/0JEA/flash-cards/actions/permissions --jq .enabled` (false) and `gh api repos/0JEA/flash-cards/pages/builds/latest --jq '.commit[0:7]'`
- **Running it today:** open `index.html` locally (`file://`), or serve it (see Commands). New-cards-per-session and session length are selects on each class screen (no URL flags).
- **The `progress` branch is DATA, not code.** It holds the owner's review log (`log/YYYY-MM.jsonl`), written by the app through the GitHub API. Never merge it into `master`, never rebase or force-push it, never delete files on it.
  Verify: `gh api "repos/0JEA/flash-cards/contents/?ref=progress" --jq '.[].path'`
- **Ethics is a class again** (`decks/ethics.js`, 122 MC cards, brought back 2026-10-16). `archive/ethics-questions.js` is the old quiz file, not loaded; several of its answer keys look wrong.
- **Lecture blank answers are SUPPLIED, with a source label** (owner decision 2026-10-16, reversing the earlier "owner fills them": he does not have them all). `decks/csc370.js` lists the empty fill-ins on the professor's slides; `decks/csc370-blank-answers.js` answers every one with a `basis`: `slides` | `sebesta` | `history` | `inferred`. The app shows `inferred` answers as best guesses. Never relabel a guess as fact. `node --test tests/` fails if any blank lacks an answer.
- **Text size on the STUDY screen is chosen by Pretext, per card** (`fitAsk`/`fitFeedback` in `js/app.js`; question and feedback share one scale). Only the study screen is held to the window; every other screen scrolls normally (owner, 2026-10-16). Don't fix study-screen overflow with scroll boxes, folding/hiding content, or fixed font sizes: shorten the card or generator text. Math blocks (KaTeX) are measured in the DOM at each candidate scale.
  Verify: `NODE_PATH=~/websites/seraph-ink/node_modules node tools/fit-sweep.js <w> <h> 40` (exit 0 = every card and 40 instances of each generator fit, asking and answered). Get w/h from `hyprctl clients -j` (window minus browser chrome; 632x682 window → 632x595 viewport, verified 2026-10-16: all fit).
- **No meta chatter on cards** (owner, 2026-10-16): the feedback shows verdict, your answer, the answer, and the explanation. No source lines, no "comes back at the end", no keyword "doesn't seem to mention" nags. `source` stays in the data for audits only.
- **Math = inline LaTeX between `$...$`** in prompt/points/why/options (rendered by vendored KaTeX 0.16.11, `trust:false`). Never in typed/set `answer`/`accept` (that's what the student types) or in `code`.
- **CSC 310 assignments:** cards are tagged `assignment: [...]` for the concepts each assignment needs. The assignments' own questions/answers are NEVER on a card (graded work).
- **Every code-trace answer is machine-verified.** If you add or edit a card with `verify`, run `node --test tests/`. It executes each `verify.src` with python3, gcc, node, bash, guile or ecl and fails on any mismatch. A missing runtime fails rather than skips.

## What it is

A static, single-page study app: no build step and no backend. Classes: AUCSC 370 Programming Languages, AUCSC 310 Algorithm Design & Analysis, AUCSC 325 Software Testing, and the Ethics quiz. Each class screen picks cards with ONE list of lectures (with Everything) plus an assignment dropdown (settings.off keys 'L:<n>', 'A:<id>', 'A:none'; old topic keys are dropped at load). The owner rejected the three-filter picker on 2026-10-17 ("broken into 3 sections", main list at the bottom in an inner scroller).

**Answer modes (2026-10-17, for December finals, ~1 h sessions):** a `recall` card with ≤1 point (or `mode: 'quick'`) is QUICK: think, Show answer, Missed it / Got it (~10 s; covert retrieval retains as well as typing, Smith, Roediger & Karpicke 2013). A Quick card with several points (`mode: 'quick'`, ≤7 items) is a LIST: after Show answer you tick each item you had (no typing; right only if all ticked). Recall with 2+ points and no mode (or `mode: 'write'`) is WRITE: typed, graded by ticking points (honest grading of multi-point answers, Dunlosky 2011); kept to the long-answer questions a final would ask (~2-8 per lecture). MC graduates to Quick recall once right on a later day unless `noRecall: true`. Split pieces have ids `<orig>-qN` and no Help. Estimated hours to master everything (6 recalls/card): CSC 370 ~10, CSC 310 ~21, CSC 325 ~13 (was 20/42/38).

The design, and the paper behind each learning rule, are in `docs/superpowers/specs/2026-10-16-csc370-study-app-design.md`. The research notes it cites are in `research/`.

| File | Role |
|---|---|
| `PRODUCT.md` | Design brief (impeccable): users, personality, anti-references, principles. The look is iOS 13 dark (2019) with every element borrowed from a named pre-AI source and reworked (owner, 2026-10-16: "AI look" means layout, element choice, type and motion, not just colour). The source of each element is commented at its CSS block in `index.html` |
| `index.html` | Markup + CSS for all screens: Classes (Wallet pass stack, each class a boarding pass), Class (settings + iTunes-style column browser for the three filters), Mix, Study (the card is a ticket: question above a perforation, answers on the stub; film-counter for cards left; pen-mark verdicts), Help (margin notes sliding in beside the card), Done (when to come back + missed cards with Help), Settings; and the script order |
| `js/log.js` | Append-only event log in `localStorage['fc.events']`; merge = union by event id |
| `js/scheduler.js` | Pure functions: learning criterion, review ladder, exam cap, queue (shuffled), delayed-recall metric, `Session` (misses go to the END of the queue) |
| `js/grade.js` | Answer matching: typed, cloze, order, set (any order) |
| `js/sync.js` | Sync to branch `progress` through the GitHub contents API (per-month files, SHA retry) |
| `js/generators.js` | Generator contract: a card that builds a new problem (values, names, code) each time it is shown |
| `js/gen-csc370.js`, `js/gen-softtest.js`, `js/gen-csc310.js` | The generators; each has a test file that re-solves every answer independently |
| `js/gen-csc310-rt.js` | CSC 310 Assignment 2 practice: fill recursion trees, depth/leaves/level cost/Θ, uneven splits (never thirds: Assignment 2 is T(n/3)+T(2n/3)+cn) |
| `js/gen-csc310-heap.js` | CSC 310 heap practice answered ON a drawn heap (`swaps`: heapify, build-heap, insert/increase-key, extract; `fill`; read-the-heap checks). Tests re-run her pseudocode and replay each swap sequence |
| `js/gen-csc310-trees.js` | CSC 310 tree practice answered ON a tree: decision trees of insertion/merge/quick sort on 3 elements (`tree` build, `path` follow an input, facts with the tree drawn), binary search as a `path` in the tree of midpoints, QUICKSORT and MergeSort call trees (`fill`). Tests re-run each algorithm with a comparison logger / call recorder and pin Figure 8.1 and her lecture examples |
| `js/app.js` | UI controller. Card text goes through `textContent` or KaTeX (`math()`), never `innerHTML` (the page holds a token) |
| `decks/csc370*.js` | CSC 370 cards, slide blanks + supplied answers (`basis`), rewritten blank questions, topic map, gcc-verified C pointer bank (`tools/gen-c-pointer-bank.js` rebuilds it) |
| `decks/softtest-{a,b,c}.js` + `decks/softtest.js` | CSC 325 cards + assembler |
| `decks/csc310-{a,b}.js` + `decks/csc310.js` | CSC 310 cards + assembler (lectures, assignments, topic order) |
| `decks/ethics.js` | Ethics quiz (MC) |
| `decks/csc310-help*.js`, `decks/csc370-help*.js`, `decks/softtest-help-{a..e}.js` | Help walkthroughs (`FC.help[cardId]`: asks, idea, steps (text, table or code), graph, tree, heap/heapSteps, ptree (parse trees), answer, mistake, tryIt with optional code). Formats: `decks/csc310-help.js` (math on) and `decks/csc370-help.js` (math off: text as written, `backticks` = inline code; lecture blanks keyed `blank:<id>`). Every CSC 310 and CSC 370 card that existed on 2026-10-16 has an entry (482 and 294 after two duplicate merges; generators excluded; verified 2026-10-17 with `tools/help-check.js`). Quick cards split off on 2026-10-17 (ids `<orig>-q2`, `-q3` …) have no entry of their own: they open their original's walkthrough (idea, picture, steps) with their own answer (`helpOf` in js/app.js); and `decks/csc370-topics.js` files them under their original's topic; every CSC 325 card has one too (402 originals written 2026-10-17, plus their -qN pieces through the shared fallback: 471/482, the rest are generators). Ethics has none: its MC cards carry a `why`, and their keys were checked against sources on 2026-10-17 (unverified keys listed in the deck header). Cards without an entry show no Help button. Opening Help before answering counts the card as not known |
| `js/tree.js` | Trees: auto-oriented drawing, node diff, and the tree answer types `tree` (build), `swaps` (heap repair, checked per swap), `fill` (type blank nodes), `path` (tap in order). Formats in its header. `heap`/`tree` on any other card is drawn under the question |
| `vendor/pretext-0.0.9.min.js`, `vendor/katex/` | Text fitting; math rendering |
| `tools/fit-sweep.js` | Headless fit check of every card at a given viewport |
| `tools/screens.js` | Screenshots of every screen and card type, asking and answered (`<outDir> <w> <h>`), for design review |
| `tools/help-check.js` | Headless render of every Help page in a class (`<deck> <w> <h> [shotDir id...]`): math errors, raw `$`, stray backticks, sideways scroll, page errors; exit 0 = clean |

Rebuild Pretext (only to change the version):
```sh
npm pack @chenglou/pretext@<ver> && tar xzf chenglou-pretext-<ver>.tgz
npx esbuild package/dist/layout.js --bundle --format=iife --global-name=Pretext --minify --target=es2020 --outfile=vendor/pretext-<ver>.min.js
```
Then update the `<script>` tag in `index.html`.

## Commands

- Tests (1510 as of 2026-10-17, about 60 s; needs python3, gcc, node, bash, guile, ecl, javac/java; python3 with mpmath for the CSC 310 growth checks): `node --test tests/`
- Run locally: `python3 -m http.server 8765 --bind 127.0.0.1`, then open http://127.0.0.1:8765/. Opening `index.html` directly from disk also works.

## Deployed vs repo-only

- **Deployed:** nothing current. See the first bullet: Pages still serves the April ethics quiz.
- **Device-only:** the GitHub token (`localStorage['fc.token']`), settings and the local event log live in each browser. Sync makes the log converge across devices; the token never leaves the browser.
