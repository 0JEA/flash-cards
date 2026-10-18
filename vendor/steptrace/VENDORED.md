# steptrace viewer (vendored)

Copied from `~/steptrace/viewer/` at steptrace commit `6b089cb` (2026-10-18). steptrace is the
owner's separate LOCAL-ONLY project (no GitHub repo, by his decision). It records program
runs and plays them back like a debugger. The recorders and the interpreter's sources are
there, not here.

- `steptrace.js` + `steptrace.css`: the viewer (code, controls, output; stack of
  activation records with dynamic/static links, heap, pointer arrows).
- `steptrace-interp.js`: the pseudocode interpreter bundle (built by
  `node tools/build-interp.js` in ~/steptrace). With it loaded, the viewer can re-run a
  pseudocode trace under static/dynamic scoping and each parameter mode.

To update: in ~/steptrace run `node tools/build-interp.js`, copy the three files here,
update the commit above, then re-record: `node tools/record-traces.js`.
