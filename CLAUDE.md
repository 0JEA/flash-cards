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

A static, single-page study app: no build step and no backend. Classes: AUCSC 370 Programming Languages, AUCSC 310 Algorithm Design & Analysis, AUCSC 325 Software Testing, and the Ethics quiz. Each class screen groups cards by topic, lecture, or assignment.

The design, and the paper behind each learning rule, are in `docs/superpowers/specs/2026-10-16-csc370-study-app-design.md`. The research notes it cites are in `research/`.

| File | Role |
|---|---|
| `index.html` | Markup + CSS for all screens (Classes, Class, Mix, Study, Done, Settings) and the script order |
| `js/log.js` | Append-only event log in `localStorage['fc.events']`; merge = union by event id |
| `js/scheduler.js` | Pure functions: learning criterion, review ladder, exam cap, queue (shuffled), delayed-recall metric, `Session` (misses go to the END of the queue) |
| `js/grade.js` | Answer matching: typed, cloze, order, set (any order) |
| `js/sync.js` | Sync to branch `progress` through the GitHub contents API (per-month files, SHA retry) |
| `js/generators.js` | Generator contract: a card that builds a new problem (values, names, code) each time it is shown |
| `js/gen-csc370.js`, `js/gen-softtest.js`, `js/gen-csc310.js` | The generators; each has a test file that re-solves every answer independently |
| `js/app.js` | UI controller. Card text goes through `textContent` or KaTeX (`math()`), never `innerHTML` (the page holds a token) |
| `decks/csc370*.js` | CSC 370 cards, slide blanks + supplied answers (`basis`), rewritten blank questions, topic map, gcc-verified C pointer bank (`tools/gen-c-pointer-bank.js` rebuilds it) |
| `decks/softtest-{a,b,c}.js` + `decks/softtest.js` | CSC 325 cards + assembler |
| `decks/csc310-{a,b}.js` + `decks/csc310.js` | CSC 310 cards + assembler (lectures, assignments, topic order) |
| `decks/ethics.js` | Ethics quiz (MC) |
| `decks/csc310-help*.js` | Help walkthroughs (`FC.help[cardId]`: asks, idea, steps, graph, answer, mistake, tryIt). Format in `decks/csc310-help.js`. All 49 Assignment 1 cards covered as of 2026-10-16; other cards have no Help button yet. Opening Help before answering counts the card as not known |
| `vendor/pretext-0.0.9.min.js`, `vendor/katex/` | Text fitting; math rendering |
| `tools/fit-sweep.js` | Headless fit check of every card at a given viewport |

Rebuild Pretext (only to change the version):
```sh
npm pack @chenglou/pretext@<ver> && tar xzf chenglou-pretext-<ver>.tgz
npx esbuild package/dist/layout.js --bundle --format=iife --global-name=Pretext --minify --target=es2020 --outfile=vendor/pretext-<ver>.min.js
```
Then update the `<script>` tag in `index.html`.

## Commands

- Tests (321 as of 2026-10-16, about 10 s; needs python3, gcc, node, bash, guile, ecl, javac/java; python3 with mpmath for the CSC 310 growth checks): `node --test tests/`
- Run locally: `python3 -m http.server 8765 --bind 127.0.0.1`, then open http://127.0.0.1:8765/. Opening `index.html` directly from disk also works.

## Deployed vs repo-only

- **Deployed:** nothing current. See the first bullet: Pages still serves the April ethics quiz.
- **Device-only:** the GitHub token (`localStorage['fc.token']`), settings and the local event log live in each browser. Sync makes the log converge across devices; the token never leaves the browser.
