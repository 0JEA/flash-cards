#!/usr/bin/env node
// Records the step-through trace shown in Help for every CSC 370 and CSC 310 code card,
// with steptrace (~/steptrace, a separate local project; set STEPTRACE_DIR to use another
// checkout), into decks/csc370-traces.js and decks/csc310-traces.js. Run it again after
// adding or editing a code card.
//
//   node tools/record-traces.js                  # all CSC 370 cards
//   node tools/record-traces.js l3-alias         # some cards (the others are kept from the file)
//   node tools/record-traces.js --deck csc310    # all CSC 310 cards
//
// How each card is traced:
//   C            the card's code made into a whole program (statements go in main(); a
//                `/* in main: */` marker splits functions from main's body; a missing call
//                is added; variables the question gives values for are declared), compiled
//                and stepped under gdb. Answers the program never prints become `result`.
//   Python       real Python (sys.settrace) for real Python programs.
//   Scope cards  "Python-like" / JavaScript code whose question names STATIC or DYNAMIC
//                scoping runs in steptrace's interpreter under that rule, so Help can
//                switch between the two.
//   Lisp/Scheme  no recorder: the hand-written trace in decks/csc370-trace*.js is used.
//   CSC 310      the card's textbook pseudocode (or Java) in steptrace's interpreter, with
//                the question's input and call from tools/csc310-trace-runs.js; the run is
//                checked against the card's answer as that file says (`check` is kept in
//                the trace for tests/traces.test.js).
// Notes written by hand in decks/csc370-trace*.js are attached to the recorded steps whose
// line has the same text, in order.
'use strict';
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const ROOT = path.join(__dirname, '..');
const ST = process.env.STEPTRACE_DIR || path.join(os.homedir(), 'steptrace');
const { record } = require(path.join(ST, 'recorder/record.js'));
const { run } = require(path.join(ST, 'interp/run.js'));

global.FC = {};
require(path.join(ROOT, 'js/generators.js'));
require(path.join(ROOT, 'js/grade.js'));
require(path.join(ROOT, 'decks/csc370.js'));
for (const f of fs.readdirSync(path.join(ROOT, 'decks')).filter(f => /^csc310(-\w)?\.js$/.test(f))) require(path.join(ROOT, 'decks', f));
for (const f of fs.readdirSync(path.join(ROOT, 'decks')).filter(f => /^csc370-trace(-\w)?\.js$/.test(f))) require(path.join(ROOT, 'decks', f));
const hand = FC.trace || {};
const norm = s => FC.grade.normalize(Array.isArray(s) ? s.join(' ') : String(s));
const DECK = process.argv.includes('--deck') ? process.argv[process.argv.indexOf('--deck') + 1] : 'csc370';
const OUT = path.join(ROOT, `decks/${DECK}-traces.js`);

// ── C: make the card's snippet a program ──
function cProgram(card) {
  const code = card.code;
  const head = '#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n';
  if (/\bmain\s*\(/.test(code)) return head + code + '\n';
  const lines = code.split('\n');
  const mark = lines.findIndex(l => /\/\*\s*in main:?\s*\*\//.test(l));
  let before = [], body = lines;
  if (mark >= 0) { before = lines.slice(0, mark); body = lines.slice(mark + 1); }
  else if (/^\s*(void|int|char|double|float)\s+\w+\s*\([^;]*\)\s*\{/m.test(code) && topLevelOnlyDecls(code)) {
    // Functions (and globals) only: main calls the function the question names.
    const fn = (/call to (\w+)\(\)/.exec(card.prompt) || [])[1] || /^\s*(?:void|int)\s+(\w+)\s*\(/m.exec(code)[1];
    return head + code + `\n\nint main(void) {\n  ${fn}();\n  return 0;\n}\n`;
  }
  return head + (before.length ? before.join('\n') + '\n\n' : '') + 'int main(void) {\n' + body.map(l => '  ' + l).join('\n') + '\n  return 0;\n}\n';
}
function topLevelOnlyDecls(code) {
  let depth = 0;
  for (const l of code.split('\n')) {
    const t = l.replace(/\/\/.*$/, '').trim();
    if (depth === 0 && t && !/^(int|char|double|float|void|static|const|long)\b/.test(t) && !/^[{}]/.test(t)) return false;
    for (const ch of t) depth += ch === '{' ? 1 : ch === '}' ? -1 : 0;
  }
  return true;
}
// Declare variables the snippet uses but never declares (the question gives their values).
function declareMissing(src, card) {
  for (let round = 0; round < 6; round++) {
    const file = path.join(os.tmpdir(), `rt-${process.pid}.c`);
    fs.writeFileSync(file, src);
    try { execFileSync('gcc', ['-fsyntax-only', file], { stdio: 'pipe' }); return src; }
    catch (e) {
      const names = [...new Set([...String(e.stderr).matchAll(/[‘'](\w+)[’'] undeclared/g)].map(m => m[1]))];
      if (!names.length) throw new Error(`${card.id}: does not compile:\n${e.stderr}`);
      const given = n => { const m = new RegExp(`\\b${n}\\s*=\\s*(-?\\d+)`).exec(card.prompt); return m ? m[1] : null; };
      const decl = names.map(n => `  int ${n}${given(n) != null ? ` = ${given(n)}` : ''};`).join('\n');
      src = src.replace('int main(void) {\n', `int main(void) {\n${decl}\n`);
    }
  }
  throw new Error(`${card.id}: could not declare its variables`);
}

// ── Which recorder ──
function plan(card) {
  const lang = card.verify && card.verify.lang;
  const scope = /\b(STATIC|DYNAMIC)\b|static scoping|dynamic scoping/i.exec(card.prompt);
  const dynamic = /dynamic/i.test(scope ? scope[0] : '') || lang === 'bash';
  if (/^l4-/.test(card.id)) return null;                        // grammars: parse trees, not programs
  if (lang === 'ecl' || lang === 'guile') return hand[card.id] ? { kind: 'hand' } : null;
  if (lang === 'c') return { kind: 'c' };
  if (lang === 'bash' || lang === 'node' || (lang === 'python' && /^l52-/.test(card.id))) {
    const syntax = /\bfunction\b|\{/.test(card.code) ? 'braces' : 'python';
    return { kind: 'interp', syntax, scoping: dynamic ? 'dynamic' : 'static' };
  }
  if (lang === 'python') return { kind: 'python' };
  return null;
}

// A braces program that only defines functions gets a call to the outermost one.
function withCall(src) {
  let depth = 0, loose = false;
  for (const l of src.split('\n')) {
    const t = l.trim();
    if (depth === 0 && t && !/^function\b/.test(t) && !/^[{}]/.test(t)) loose = true;
    for (const ch of t) depth += ch === '{' ? 1 : ch === '}' ? -1 : 0;
  }
  if (loose) return src;
  const fn = /^function\s+(\w+)/m.exec(src);
  return fn ? `${src}\n${fn[1]}();` : src;
}

// Hand notes onto recorded steps, by the text of the line, in order.
function attachNotes(trace, card) {
  const h = hand[card.id];
  if (!h) return 0;
  const srcLines = trace.source.split('\n').map(l => l.trim());
  const codeLines = card.code.split('\n').map(l => l.trim());
  let at = 0, n = 0;
  for (const st of h) {
    if (!st.note) continue;
    const text = codeLines[st.line - 1];
    for (let k = at; k < trace.steps.length; k++) {
      const s = trace.steps[k];
      if (s.line && srcLines[s.line - 1] === text) { s.note = st.note; at = k + 1; n++; break; }
    }
  }
  return n;
}

// Hand trace (FORMAT.md without `next` or a start step) to a full trace.
function fromHand(card) {
  const h = hand[card.id];
  const steps = [{ next: h[0].line, frames: [] }].concat(h.map((s, i) => Object.assign({}, s, h[i + 1] ? { next: h[i + 1].line } : {})));
  return { version: 1, language: 'manual', source: card.code, steps, exit: {}, truncated: false };
}

// ── CSC 310: textbook pseudocode, checked against the card ──
const { nums, check310 } = require('./trace-checks.js');
async function record310() {
  const runs = require('./csc310-trace-runs.js');
  const out = {}, report = [];
  let bad = 0;
  for (const card of FC.decks.csc310.cards.filter(c => c.code)) {
    const r = runs[card.id];
    if (!r) { report.push(`${card.id}: no run in tools/csc310-trace-runs.js`); bad++; continue; }
    const src = (r.before || '') + card.code + '\n' + (r.after || '');
    const t = run(src, { syntax: r.syntax || 'textbook', base: r.base, hashCodes: r.hashCodes, max: 3000 });
    if (t.exit.error || t.truncated) { report.push(`${card.id}: ${t.exit.error || 'too many steps'}`); bad++; continue; }
    const why = check310(t, card, r.check);
    if (why) { report.push(`${card.id}: CHECK FAILED ${why}`); bad++; continue; }
    delete t.rules;                 // no scoping/parameter switches: these cards aren't about them
    t.check = r.check;
    const printed = t.steps.map(s => s.out || '').join('');
    if (r.check !== 'none' && r.check !== 'out' && nums(printed).join(' ') !== nums(card.answer).join(' ')) t.steps[t.steps.length - 1].result = String(card.answer);
    out[card.id] = t;
    report.push(`${card.id}: ${t.steps.length} steps, check ${typeof r.check === 'string' ? r.check : r.check.count ? 'count ' + r.check.count : 'held ' + r.check.held.length}`);
  }
  return { out, report, bad };
}

function write(out) {
  // Steps repeat most of their activation records, so each distinct record is written once
  // (F) and steps list indices into it; the file rebuilds the steps when it loads.
  // Variable values (arrays especially) are pooled the same way (V).
  const pool = new Map(), F = [], vpool = new Map(), V = [];
  const vIdx = v => { const key = JSON.stringify(v); if (!vpool.has(key)) { vpool.set(key, V.length); V.push(v); } return vpool.get(key); };
  const packed = {};
  for (const id of Object.keys(out).sort()) {
    const t = out[id];
    packed[id] = Object.assign({}, t, { steps: t.steps.map(st => Object.assign({}, st, { frames: (st.frames || []).map(f => {
      const vars = {};
      for (const [k, v] of Object.entries(f.vars || {})) vars[k] = vIdx(v);
      const key = JSON.stringify(Object.assign({}, f, { vars }));
      if (!pool.has(key)) { pool.set(key, F.length); F.push(Object.assign({}, f, { vars })); }
      return pool.get(key);
    }) })) });
  }
  const seen = new Map();
  const body = Object.keys(packed).map(id => {
    const json = JSON.stringify(packed[id]);
    if (seen.has(json)) return `T[${JSON.stringify(id)}] = T[${JSON.stringify(seen.get(json))}];`;
    seen.set(json, id);
    return `T[${JSON.stringify(id)}] = unpack(${json});`;
  }).join('\n');
  fs.writeFileSync(OUT, `// GENERATED by tools/record-traces.js (steptrace). Do not edit: change the card${DECK === 'csc310' ? ', or its run in\n// tools/csc310-trace-runs.js' : ', or the\n// hand notes in decks/csc370-trace*.js'}, and record again.
(function (FC) {
  'use strict';
  const T = FC.traces = FC.traces || {};
  const V = ${JSON.stringify(V)};
  const F = ${JSON.stringify(F)}.map(f => { for (const k in f.vars) f.vars[k] = V[f.vars[k]]; return f; });
  const unpack = t => { t.steps.forEach(s => { s.frames = s.frames.map(i => F[i]); }); return t; };
${body}
})(globalThis.FC = globalThis.FC || {});
`);
  console.log(`\n${Object.keys(out).length} traces -> ${path.relative(ROOT, OUT)} (${Math.round(fs.statSync(OUT).size / 1024)} KB)`);
}

(async () => {
  if (DECK === 'csc310') {
    const { out, report, bad } = await record310();
    console.log(report.join('\n'));
    if (bad) { console.error(`\n${bad} card(s) failed; nothing written`); process.exit(1); }
    write(out);
    return;
  }
  const only = new Set(process.argv.slice(2));
  const cards = FC.decks.csc370.cards.filter(c => c.code && (!only.size || only.has(c.id)));
  const prev = {};
  if (only.size && fs.existsSync(OUT)) { global.FC.traces = undefined; require(OUT); Object.assign(prev, FC.traces || {}); }
  const out = Object.assign({}, prev);
  const report = [];
  for (const card of cards) {
    const p = plan(card);
    if (!p) continue;
    let t;
    try {
      if (p.kind === 'hand') t = fromHand(card);
      else if (p.kind === 'interp') t = run(p.syntax === 'braces' ? withCall(card.code) : card.code, { syntax: p.syntax, scoping: p.scoping });
      else {
        const src = p.kind === 'c' ? declareMissing(cProgram(card), card) : card.code;
        const file = path.join(os.tmpdir(), `${card.id}.${p.kind === 'c' ? 'c' : 'py'}`);
        fs.writeFileSync(file, src);
        const typed = /types (\d+)/.exec(card.prompt);
        t = await record(file, { stdin: typed ? typed[1] + '\n' : '' });
      }
    } catch (e) { report.push(`${card.id}: FAILED ${e.message.split('\n')[0]}`); continue; }
    if (t.exit && t.exit.error) { report.push(`${card.id}: program error: ${t.exit.error}`); continue; }
    const printed = t.steps.map(s => s.out || '').join('');
    const want = norm(card.answer);
    let how = 'prints the answer';
    if (norm(printed) !== want && t.language !== 'manual') {
      // The question asks for something the program does not print as is (a value, one
      // line of several, the output after a prompt): show the card's answer at the end.
      t.steps[t.steps.length - 1].result = Array.isArray(card.answer) ? card.answer.join(', ') : String(card.answer);
      how = `answer shown as result (printed ${JSON.stringify(printed.slice(0, 40))})`;
    }
    const notes = attachNotes(t, card);
    out[card.id] = t;
    report.push(`${card.id}: ${p.kind}${p.scoping ? ' ' + p.scoping : ''}, ${t.steps.length} steps, ${notes} notes, ${how}`);
  }
  console.log(report.join('\n'));
  write(out);
})().catch(e => { console.error(e); process.exit(1); });
