# CLAUDE.md: flash-cards (CSC 370 study app)

## Read this first (what an agent gets wrong)

- **`master` is LIVE.** GitHub Pages serves `master` of `0JEA/flash-cards` at https://0jea.github.io/flash-cards/. Merging or pushing to `master` deploys.
  Verify: `gh api repos/0JEA/flash-cards/pages --jq '.source,.html_url'`
- **The `progress` branch is DATA, not code.** It holds the owner's review log (`log/YYYY-MM.jsonl`), written by the app through the GitHub API. Never merge it into `master`, never rebase or force-push it, never delete files on it.
  Verify: `gh api "repos/0JEA/flash-cards/contents/?ref=progress" --jq '.[].path'`
- **The ethics quiz is retired.** `archive/ethics-questions.js` is no longer loaded. Several of its answer keys look wrong; it was left untouched on purpose.
- **Lecture blank answers are the owner's own.** `decks/csc370.js` lists the empty fill-ins on the professor's slides (`blanks`). The owner fills them in the app from lecture notes. Do not fill them from a textbook or from memory.
- **Every code-trace answer is machine-verified.** If you add or edit a card with `verify`, run `node --test tests/`. It executes each `verify.src` with python3, gcc, node, bash, guile or ecl and fails on any mismatch. A missing runtime fails rather than skips.

## What it is

A static, single-page study app for AUCSC 370 Programming Languages: no build step and no backend. It opens from GitHub Pages or straight from the file.

The design, and the paper behind each learning rule, are in `docs/superpowers/specs/2026-10-16-csc370-study-app-design.md`. The research notes it cites are in `research/`.

| File | Role |
|---|---|
| `index.html` | Markup and CSS for the four screens: Home, Study, Fill blanks, Settings |
| `js/log.js` | Append-only event log in `localStorage['fc.events']`; merge = union by event id |
| `js/scheduler.js` | Pure functions: learning criterion, review ladder, exam cap, queue, delayed-recall metric, `Session` |
| `js/grade.js` | Answer matching (whitespace/case normalisation; cloze typo tolerance) |
| `js/sync.js` | Sync to branch `progress` through the GitHub contents API (per-month files, SHA retry) |
| `js/app.js` | UI controller. Card text only ever goes through `textContent` (the page holds a token) |
| `decks/csc370.js` | 129 cards and 199 lecture blanks; each card cites its source PDF |
| `vendor/pretext-0.0.9.min.js` | `@chenglou/pretext` 0.0.9, bundled to an IIFE (global `Pretext`). It predicts the question card's height before each card swap |

Rebuild Pretext (only to change the version):
```sh
npm pack @chenglou/pretext@<ver> && tar xzf chenglou-pretext-<ver>.tgz
npx esbuild package/dist/layout.js --bundle --format=iife --global-name=Pretext --minify --target=es2020 --outfile=vendor/pretext-<ver>.min.js
```
Then update the `<script>` tag in `index.html`.

## Commands

- Tests (59, about 1 s; needs python3, gcc, node, bash, guile, ecl): `node --test tests/`
- Run locally: `python3 -m http.server 8765 --bind 127.0.0.1`, then open http://127.0.0.1:8765/. Opening `index.html` directly from disk also works.

## Deployed vs repo-only

- **Deployed:** whatever is on `master` (GitHub Pages).
- **Device-only:** the GitHub token (`localStorage['fc.token']`), settings and the local event log live in each browser. Sync makes the log converge across devices; the token never leaves the browser.
