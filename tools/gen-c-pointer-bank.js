#!/usr/bin/env node
// Generates decks/csc370-cpointer-bank.js: ~200 small C programs in the style of the
// AUCSC 370 C exam (pointer traces, swap, reassigning a pointer parameter, arr + k,
// pre/post increment through pointers, char pointers walking a string).
//
// Each template SIMULATES its program in JS (to write the worked trace) and the tool then
// compiles and runs the program with gcc; the bank keeps gcc's output, and the tool aborts if
// gcc and the simulation ever disagree. Memory-diagram entries are checked the same way: an
// instrumented copy prints every main variable after the marked line.
//
// Usage: node tools/gen-c-pointer-bank.js     (needs gcc; deterministic, seed below)
'use strict';
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
require('../js/generators.js');
const { rngFrom, int, pick, shuffle } = globalThis.FC.gen;

const SEED = 370;
const I = '    ';
const sample = (rng, a, k) => shuffle(rng, a).slice(0, k);
const chance = (rng, p) => rng() < p;
const arrText = a => `{${a.join(', ')}}`;

// A program under construction. main() lines are added with stmt(); markable lines are those a
// memory-diagram question may point at. vars: main's variables in declaration order.
function Prog() {
  const p = { head: ['#include <stdio.h>', ''], main: [], trace: [], vars: [], marks: [] };
  p.fn = lines => { p.head.push(...lines, ''); };
  p.stmt = (code, effect, opts = {}) => {
    p.main.push(I + code);
    p.trace.push(effect === null ? null : [code, effect]);
    if (opts.mark !== false) p.marks.push({ at: p.main.length - 1, nvars: p.vars.length, snap: opts.snap ? opts.snap() : null });
  };
  return p;
}
function finish(p, answerSim, diagramAt) {
  const lines = p.head.concat(['int main() {'], p.main, [I + 'return 0;', '}']);
  const offset = p.head.length + 1;
  const tr = p.trace.filter(Boolean);
  const w = Math.min(34, Math.max(...tr.map(([c]) => c.length)));
  const why = 'Trace (main):\n' + tr.map(([c, e]) => `${c.padEnd(w)}  ⇒ ${e}`).join('\n') + `\nOutput: ${answerSim}`;
  const entry = { code: lines.join('\n'), answer: answerSim, why };
  if (diagramAt) {
    entry.diagram = { line: diagramAt.at + offset, vars: diagramAt.show, spec: diagramAt.spec };
    entry.diagram.why = 'Trace up to the marked line:\n' + p.trace.slice(0, diagramAt.at + 1).filter(Boolean)
      .map(([c, e]) => `${c.padEnd(w)}  ⇒ ${e}`).join('\n') + '\nState after it:\n' + diagramAt.show.join('\n');
  }
  return entry;
}

// ── State model shared by templates: ints, int arrays, char arrays, pointers, pointer-to-pointer.
function State() {
  const s = { ints: new Map(), arrs: new Map(), strs: new Map(), ptrs: new Map(), pptrs: new Map(), order: [] };
  s.decl = (name, kind, v) => { s.order.push({ name, kind }); ({ int: s.ints, arr: s.arrs, str: s.strs, ptr: s.ptrs, pptr: s.pptrs })[kind].set(name, v); };
  // pointer value: { base: name, i: index or -1 for a scalar }
  s.get = t => (t.i < 0 ? s.ints.get(t.base) : s.arrs.has(t.base) ? s.arrs.get(t.base)[t.i] : s.strs.get(t.base)[t.i]);
  s.set = (t, v) => { if (t.i < 0) s.ints.set(t.base, v); else if (s.arrs.has(t.base)) s.arrs.get(t.base)[t.i] = v; else s.strs.get(t.base)[t.i] = v; };
  s.label = t => (t.i < 0 ? t.base : `${t.base}[${t.i}]`);
  s.show = () => s.order.map(({ name, kind }) => {
    if (kind === 'int') return `${name} = ${s.ints.get(name)}`;
    if (kind === 'arr') return `${name} = ${arrText(s.arrs.get(name))}`;
    if (kind === 'str') return `${name} = "${s.strs.get(name).slice(0, s.strs.get(name).indexOf('\0')).join('')}"`;
    if (kind === 'ptr') return `${name} → ${s.label(s.ptrs.get(name))}`;
    return `${name} → ${s.pptrs.get(name)}`;
  });
  s.spec = () => s.order.map(({ name, kind }) => ({ name, kind, len: kind === 'arr' ? s.arrs.get(name).length : kind === 'str' ? s.strs.get(name).length : undefined }));
  return s;
}
const snapOf = s => () => ({ show: s.show(), spec: s.spec() });
function pickMark(rng, p, minIdx = 0) {
  const ok = p.marks.filter(m => m.at >= minIdx && m.snap);
  if (!ok.length) return null;
  const m = pick(rng, ok);
  return { at: m.at, show: m.snap.show, spec: m.snap.spec };
}

// ── Templates ─────────────────────────────────────────────────────────────

// Straight-line pointer code in main: *p += k, p = &x, (*p)++, ++*p, *p = *q + k, …
function tRandom(rng) {
  const p = Prog(), s = State();
  const names = sample(rng, ['a', 'b', 'c', 'x', 'y', 'n', 'm', 'k'], 5);
  const pn = sample(rng, ['p', 'q', 'r', 'ptr'], 2);
  const ints = [], ptrs = [];
  const snap = snapOf(s);
  const declInt = (n, v, why) => { s.decl(n, 'int', v); ints.push(n); };
  const a = names.shift(), b = names.shift();
  const va = int(rng, 1, 9), vb = int(rng, 1, 9);
  declInt(a, va); p.stmt(`int ${a} = ${va};`, `${a} = ${va}`, { snap });
  declInt(b, vb); p.stmt(`int ${b} = ${vb};`, `${b} = ${vb}`, { snap });
  s.decl(pn[0], 'ptr', { base: a, i: -1 }); ptrs.push(pn[0]);
  p.stmt(`int *${pn[0]} = &${a};`, `${pn[0]} → ${a}`, { snap });
  const nOps = int(rng, 3, 5);
  for (let k = 0; k < nOps; k++) {
    const P = pick(rng, ptrs), t = s.ptrs.get(P), T = s.label(t);
    const X = pick(rng, ints);
    const r = rng();
    const kk = int(rng, 2, 5);
    if (r < 0.18) {
      const op = pick(rng, ['+=', '-=', '*=']);
      const v = s.get(t), nv = op === '+=' ? v + kk : op === '-=' ? v - kk : v * kk;
      s.set(t, nv); p.stmt(`*${P} ${op} ${kk};`, `${T} = ${nv} (${P} points to ${T})`, { snap });
    } else if (r < 0.32) {
      const others = ints.filter(n => n !== t.base);
      const Y = pick(rng, others);
      s.ptrs.set(P, { base: Y, i: -1 }); p.stmt(`${P} = &${Y};`, `${P} → ${Y} (no int changes)`, { snap });
    } else if (r < 0.46 && names.length) {
      const Y = names.shift(); const op = pick(rng, ['+', '*']);
      const v = op === '+' ? s.get(t) + kk : s.get(t) * kk;
      declInt(Y, v); p.stmt(`int ${Y} = *${P} ${op} ${kk};`, `${Y} = ${s.get(t)} ${op} ${kk} = ${v}`, { snap });
    } else if (r < 0.56 && ptrs.length > 1) {
      const Q = pick(rng, ptrs.filter(n => n !== P)); const tq = s.ptrs.get(Q);
      const nv = s.get(tq) + kk; s.set(t, nv);
      p.stmt(`*${P} = *${Q} + ${kk};`, `${T} = ${s.label(tq)} + ${kk} = ${nv}`, { snap });
    } else if (r < 0.64) {
      const inc = chance(rng, 0.6); const nv = s.get(t) + (inc ? 1 : -1); s.set(t, nv);
      p.stmt(`(*${P})${inc ? '++' : '--'};`, `${T} = ${nv}`, { snap });
    } else if (r < 0.74 && names.length) {
      const Y = names.shift(); const old = s.get(t); s.set(t, old + 1); declInt(Y, old);
      p.stmt(`int ${Y} = (*${P})++;`, `${Y} = ${old} (old value), then ${T} = ${old + 1}`, { snap });
    } else if (r < 0.82 && names.length) {
      const Y = names.shift(); const nv = s.get(t) + 1; s.set(t, nv); declInt(Y, nv);
      p.stmt(`int ${Y} = ++*${P};`, `${T} = ${nv} first, then ${Y} = ${nv}`, { snap });
    } else if (r < 0.9 && ptrs.length < 2) {
      const Q = pn[1]; const Y = pick(rng, ints);
      s.decl(Q, 'ptr', { base: Y, i: -1 }); ptrs.push(Q);
      p.stmt(`int *${Q} = &${Y};`, `${Q} → ${Y}`, { snap });
    } else {
      const v = s.ints.get(X) + s.get(t); s.ints.set(X, v);
      p.stmt(`${X} += *${P};`, `${X} = ${v}`, { snap });
    }
  }
  const shown = sample(rng, ints, Math.min(ints.length, int(rng, 2, 3)));
  const ans = shown.map(n => s.ints.get(n)).join(' ');
  p.stmt(`printf("${shown.map(() => '%d').join(' ')}\\n", ${shown.join(', ')});`, `prints ${ans}`, { mark: false });
  return finish(p, ans, pickMark(rng, p, 3));
}

function tSwap(rng) {
  const p = Prog(), s = State(), snap = snapOf(s);
  const fname = pick(rng, ['swap', 'exchange', 'trade', 'flip']);
  const [x, y] = pick(rng, [['x', 'y'], ['p', 'q'], ['first', 'second'], ['m', 'n']]);
  const kind = pick(rng, ['good', 'good', 'value', 'ptrs', 'half']);
  const bodies = {
    good: [`void ${fname}(int *${x}, int *${y}) {`, `${I}int t = *${x};`, `${I}*${x} = *${y};`, `${I}*${y} = t;`, '}'],
    value: [`void ${fname}(int ${x}, int ${y}) {`, `${I}int t = ${x};`, `${I}${x} = ${y};`, `${I}${y} = t;`, '}'],
    ptrs: [`void ${fname}(int *${x}, int *${y}) {`, `${I}int *t = ${x};`, `${I}${x} = ${y};`, `${I}${y} = t;`, '}'],
    half: [`void ${fname}(int *${x}, int *${y}) {`, `${I}*${x} = *${y};`, `${I}*${y} = *${x};`, '}'],
  };
  p.fn(bodies[kind]);
  const [c, d, e] = sample(rng, ['a', 'b', 'c', 'd', 'e', 'u', 'v', 'w'], 3);
  const vals = sample(rng, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15], 3);
  s.decl(c, 'int', vals[0]); p.stmt(`int ${c} = ${vals[0]};`, `${c} = ${vals[0]}`, { snap });
  s.decl(d, 'int', vals[1]); p.stmt(`int ${d} = ${vals[1]};`, `${d} = ${vals[1]}`, { snap });
  const three = chance(rng, 0.3);
  if (three) { s.decl(e, 'int', vals[2]); p.stmt(`int ${e} = ${vals[2]};`, `${e} = ${vals[2]}`, { snap }); }
  const call = (u, v) => {
    const A = s.ints.get(u), B = s.ints.get(v);
    let effect;
    if (kind === 'good') { s.ints.set(u, B); s.ints.set(v, A); effect = `${fname} swaps through the pointers: ${u} = ${B}, ${v} = ${A}`; }
    else if (kind === 'half') { s.ints.set(u, B); effect = `*${x} = *${y} makes ${u} = ${B}; then *${y} = *${x} copies ${B} back: ${v} = ${B}`; }
    else if (kind === 'value') effect = `${fname} gets COPIES of ${u} and ${v}; swapping the copies changes nothing in main`;
    else effect = `${fname} swaps its own pointer copies ${x} and ${y}; nothing they point to changes`;
    const code = kind === 'value' ? `${fname}(${u}, ${v});` : `${fname}(&${u}, &${v});`;
    p.stmt(code, effect, { snap });
  };
  call(c, d);
  if (three) call(d, e);
  const shown = three ? [c, d, e] : [c, d];
  const ans = shown.map(n => s.ints.get(n)).join(' ');
  p.stmt(`printf("${shown.map(() => '%d').join(' ')}\\n", ${shown.join(', ')});`, `prints ${ans}`, { mark: false });
  return finish(p, ans, pickMark(rng, p, 2));
}

function tMoney(rng) {
  const p = Prog(), s = State(), snap = snapOf(s);
  const fname = pick(rng, ['money', 'setTo', 'change', 'reset', 'adjust', 'update']);
  const V = pick(rng, [5, 7, 20, 50, 100, 42]), V2 = int(rng, 1, 9);
  const kind = pick(rng, ['A', 'A', 'B', 'C', 'D', 'E', 'F']);
  const bodies = {
    A: [`${I}int q = ${V};`, `${I}p = &q;`],
    B: [`${I}int q = ${V};`, `${I}*p = q;`],
    C: [`${I}int q = ${V};`, `${I}*p = q;`, `${I}p = &q;`, `${I}*p = ${V2};`],
    D: [`${I}int q = ${V};`, `${I}p = &q;`, `${I}*p += ${V2};`],
    E: [`${I}int q = ${V};`, `${I}*p += q;`],
    F: [`${I}int q = *p;`, `${I}p = &q;`, `${I}*p = q * 2;`],
  };
  p.fn([`void ${fname}(int *p) {`, ...bodies[kind], '}']);
  const x = pick(rng, ['x', 'cash', 'total', 'amount', 'n']);
  const X = pick(rng, [3, 10, 12, 25, 8]);
  s.decl(x, 'int', X); p.stmt(`int ${x} = ${X};`, `${x} = ${X}`, { snap });
  const fx = {
    A: v => [v, `p is a COPY of &${x}; p = &q only redirects the copy, so ${x} stays ${v}`],
    B: v => [V, `*p = q writes through the pointer: ${x} = ${V}`],
    C: v => [V, `*p = q sets ${x} = ${V}; after p = &q, *p = ${V2} changes only q`],
    D: v => [v, `p = &q first, so *p += ${V2} changes q, not ${x}; ${x} stays ${v}`],
    E: v => [v + V, `*p += q: ${x} = ${v} + ${V} = ${v + V}`],
    F: v => [v, `q = *p copies ${v}; after p = &q, *p = q * 2 changes only q; ${x} stays ${v}`],
  }[kind];
  const doCall = () => { const [nv, eff] = fx(s.ints.get(x)); s.ints.set(x, nv); p.stmt(`${fname}(&${x});`, eff, { snap }); };
  doCall();
  if (chance(rng, 0.25)) doCall();
  const ans = String(s.ints.get(x));
  p.stmt(`printf("%d\\n", ${x});`, `prints ${ans}`, { mark: false });
  return finish(p, ans, pickMark(rng, p, 1));
}

function tArray(rng) {
  const p = Prog(), s = State(), snap = snapOf(s);
  const A = pick(rng, ['arr', 'nums', 'vals', 'data']);
  const n = int(rng, 4, 5);
  const vals = Array.from({ length: n }, () => pick(rng, [2, 3, 4, 5, 6, 8, 10, 12, 15, 16, 20, 25, 30, 40]));
  s.decl(A, 'arr', vals.slice());
  p.stmt(`int ${A}[] = ${arrText(vals)};`, `${A} = ${arrText(vals)}`, { snap });
  const q = pick(rng, ['q', 'p', 'ptr']);
  let k = int(rng, 1, n - 2);
  s.decl(q, 'ptr', { base: A, i: k });
  p.stmt(`int *${q} = ${A} + ${k};`, `${q} → ${A}[${k}] (${A} + ${k} skips ${k} ints)`, { snap });
  const nm = int(rng, 0, 2);
  for (let i = 0; i < nm; i++) {
    const r = rng();
    const arr = s.arrs.get(A);
    if (r < 0.35 && k + 1 < n) {
      const v = arr[k] * 2; arr[k + 1] = v;
      p.stmt(`*(${q} + 1) = *${q} * 2;`, `${A}[${k + 1}] = ${arr[k]} * 2 = ${v}`, { snap });
    } else if (r < 0.65 && k + 1 < n - 1) {
      k++; s.ptrs.set(q, { base: A, i: k }); p.stmt(`${q}++;`, `${q} → ${A}[${k}] (moves one int)`, { snap });
    } else {
      const d = int(rng, 1, 5); arr[k] -= d; p.stmt(`*${q} -= ${d};`, `${A}[${k}] = ${arr[k]}`, { snap });
    }
  }
  const arr = s.arrs.get(A);
  const j = int(rng, 1, 5);
  const exprs = [
    [`*${q}`, arr[k], `*${q} = ${A}[${k}] = ${arr[k]}`],
    [`*${q} + ${j}`, arr[k] + j, `*${q} + ${j} = ${arr[k]} + ${j} = ${arr[k] + j} (dereference first, then add)`],
    [`*(${q} - 1)`, arr[k - 1], `*(${q} - 1) = ${A}[${k - 1}] = ${arr[k - 1]}`],
    [`*(${q} - 1) + ${j}`, arr[k - 1] + j, `*(${q} - 1) + ${j} = ${arr[k - 1]} + ${j} = ${arr[k - 1] + j}`],
    [`*${A} + ${j}`, arr[0] + j, `*${A} + ${j} = ${A}[0] + ${j} = ${arr[0] + j}`],
  ];
  if (k + 1 < n) exprs.push([`*(${q} + 1)`, arr[k + 1], `*(${q} + 1) = ${A}[${k + 1}] = ${arr[k + 1]}`]);
  const m = int(rng, 2, n - 1);
  exprs.push([`*(${A} + ${m})`, arr[m], `*(${A} + ${m}) = ${A}[${m}] = ${arr[m]}`]);
  const chosen = sample(rng, exprs, 2);
  const ans = chosen.map(e => e[1]).join(' ');
  p.stmt(`printf("%d %d\\n", ${chosen.map(e => e[0]).join(', ')});`, `prints ${ans}: ${chosen.map(e => e[2]).join('; ')}`, { mark: false });
  return finish(p, ans, pickMark(rng, p, 1));
}

function tIncr(rng) {
  const p = Prog(), s = State(), snap = snapOf(s);
  if (chance(rng, 0.4)) {
    const [a, b, c] = sample(rng, ['a', 'b', 'c', 'x', 'y', 'z', 'n'], 3);
    const P = pick(rng, ['p', 'q']);
    const A = int(rng, 1, 9);
    s.decl(a, 'int', A); p.stmt(`int ${a} = ${A};`, `${a} = ${A}`, { snap });
    s.decl(P, 'ptr', { base: a, i: -1 }); p.stmt(`int *${P} = &${a};`, `${P} → ${a}`, { snap });
    const forms = shuffle(rng, ['(*P)++', '++*P', '(*P)--', '--*P']).slice(0, 2);
    [b, c].forEach((v, i) => {
      const f = forms[i].replace('P', P);
      const old = s.ints.get(a), inc = f.includes('++') ? 1 : -1, post = f.startsWith('(');
      s.ints.set(a, old + inc);
      const val = post ? old : old + inc;
      s.decl(v, 'int', val);
      p.stmt(`int ${v} = ${f};`, post ? `${v} = ${old} (post: old value), then ${a} = ${old + inc}` : `${a} = ${old + inc} first (pre), then ${v} = ${old + inc}`, { snap });
    });
    const ans = [a, b, c].map(n => s.ints.get(n)).join(' ');
    p.stmt(`printf("%d %d %d\\n", ${a}, ${b}, ${c});`, `prints ${ans}`, { mark: false });
    return finish(p, ans, pickMark(rng, p, 2));
  }
  const A = pick(rng, ['arr', 'nums', 'v']);
  const n = 5;
  const vals = Array.from({ length: n }, () => int(rng, 1, 30));
  s.decl(A, 'arr', vals.slice()); p.stmt(`int ${A}[] = ${arrText(vals)};`, `${A} = ${arrText(vals)}`, { snap });
  const P = pick(rng, ['p', 'q']);
  let i = 0;
  s.decl(P, 'ptr', { base: A, i }); p.stmt(`int *${P} = ${A};`, `${P} → ${A}[0] (an array name is the address of its first element)`, { snap });
  const outs = sample(rng, ['x', 'y', 'z', 'w', 'k'], 3);
  const arr = s.arrs.get(A);
  for (const v of outs) {
    const ops = ['*P', '++*P', '(*P)++', '*P + 1'];
    if (i < n - 2) ops.push('*++P', '*P++', '*P++');
    const f = pick(rng, ops).replace('P', P);
    let val, eff;
    if (f === `*${P}++`) { val = arr[i]; eff = `${v} = ${A}[${i}] = ${val}, then ${P} moves to ${A}[${i + 1}] (++ applies to the pointer)`; i++; }
    else if (f === `*++${P}`) { i++; val = arr[i]; eff = `${P} moves to ${A}[${i}] first, then ${v} = ${val}`; }
    else if (f === `++*${P}`) { arr[i]++; val = arr[i]; eff = `${A}[${i}] = ${val} first, then ${v} = ${val}`; }
    else if (f === `(*${P})++`) { val = arr[i]; arr[i]++; eff = `${v} = ${val}, then ${A}[${i}] = ${arr[i]}`; }
    else if (f === `*${P} + 1`) { val = arr[i] + 1; eff = `${v} = ${A}[${i}] + 1 = ${val} (nothing changes)`; }
    else { val = arr[i]; eff = `${v} = ${A}[${i}] = ${val}`; }
    if (i >= n) throw new Error('walked off the array');
    s.ptrs.set(P, { base: A, i });
    s.decl(v, 'int', val);
    p.stmt(`int ${v} = ${f};`, eff, { snap });
  }
  const ans = outs.map(v => s.ints.get(v)).join(' ');
  p.stmt(`printf("%d %d %d\\n", ${outs.join(', ')});`, `prints ${ans}`, { mark: false });
  return finish(p, ans, pickMark(rng, p, 2));
}

function tString(rng) {
  const p = Prog(), s = State(), snap = snapOf(s);
  const word = pick(rng, ['kiwi', 'lemon', 'plum', 'bagel', 'robot', 'cards', 'trace', 'pointer', 'stack', 'heap', 'array', 'banana', 'letter']);
  const S = pick(rng, ['s', 'str', 'word', 'w']);
  const chars = word.split('').concat('\0');
  s.decl(S, 'str', chars);
  p.stmt(`char ${S}[] = "${word}";`, `${S} = "${word}" (${word.length} chars + '\\0')`, { snap });
  const C = pick(rng, ['c', 'p', 'cp']);
  const kind = pick(rng, ['len', 'find', 'suffix', 'count', 'modify', 'ends', 'chars']);
  const L = word.length;
  const str = () => chars.slice(0, chars.indexOf('\0')).join('');
  let ans;
  if (kind === 'len') {
    s.decl(C, 'ptr', { base: S, i: 0 }); p.stmt(`char *${C} = ${S};`, `${C} → ${S}[0]`, { snap });
    s.ptrs.set(C, { base: S, i: L }); p.stmt(`while (*${C}) ${C}++;`, `${C} walks to the '\\0' at ${S}[${L}]`, { snap });
    ans = String(L); p.stmt(`printf("%d\\n", (int)(${C} - ${S}));`, `${C} - ${S} = ${L} (pointer difference = number of chars)`, { mark: false });
  } else if (kind === 'find') {
    const target = pick(rng, word.split(''));
    const at = word.indexOf(target);
    s.decl(C, 'ptr', { base: S, i: 0 }); p.stmt(`char *${C} = ${S};`, `${C} → ${S}[0]`, { snap });
    s.ptrs.set(C, { base: S, i: at }); p.stmt(`while (*${C} != '${target}') ${C}++;`, `stops at the first '${target}', ${S}[${at}]`, { snap });
    ans = `${at} ${word.slice(at)}`;
    p.stmt(`printf("%d %s\\n", (int)(${C} - ${S}), ${C});`, `prints ${at} and the string from there: ${word.slice(at)}`, { mark: false });
  } else if (kind === 'suffix') {
    const k = int(rng, 1, L - 1);
    s.decl(C, 'ptr', { base: S, i: k }); p.stmt(`char *${C} = ${S} + ${k};`, `${C} → ${S}[${k}] = '${word[k]}'`, { snap });
    ans = `${word.slice(k)} ${word[k - 1]}`;
    p.stmt(`printf("%s %c\\n", ${C}, *(${C} - 1));`, `%s prints from ${C} to the '\\0': ${word.slice(k)}; *(${C} - 1) = '${word[k - 1]}'`, { mark: false });
  } else if (kind === 'count') {
    const letter = pick(rng, word.split(''));
    const N = pick(rng, ['n', 'count', 'hits']);
    s.decl(N, 'int', 0); p.stmt(`int ${N} = 0;`, `${N} = 0`, { snap });
    p.stmt(`char *${C};`, null, { mark: false });
    const cnt = word.split('').filter(ch => ch === letter).length;
    s.ints.set(N, cnt);
    p.stmt(`for (${C} = ${S}; *${C}; ${C}++) if (*${C} == '${letter}') ${N}++;`, `${C} visits every char until '\\0'; '${letter}' appears ${cnt} time(s): ${N} = ${cnt}`, { mark: false });
    ans = String(cnt); p.stmt(`printf("%d\\n", ${N});`, `prints ${cnt}`, { mark: false });
  } else if (kind === 'modify') {
    const k = int(rng, 1, L - 1), j = int(rng, 1, L - 1);
    const Z = pick(rng, ['Z', 'X', 'Q', '#']);
    s.decl(C, 'ptr', { base: S, i: 0 }); p.stmt(`char *${C} = ${S};`, `${C} → ${S}[0]`, { snap });
    chars[k] = Z; p.stmt(`*(${C} + ${k}) = '${Z}';`, `${S}[${k}] = '${Z}': ${S} = "${str()}"`, { snap });
    s.ptrs.set(C, { base: S, i: j }); p.stmt(`${C} += ${j};`, `${C} → ${S}[${j}]`, { snap });
    chars[j] = chars[0]; p.stmt(`*${C} = *${S};`, `${S}[${j}] = ${S}[0] = '${chars[0]}': ${S} = "${str()}"`, { snap });
    ans = str(); p.stmt(`printf("%s\\n", ${S});`, `prints ${ans}`, { mark: false });
  } else if (kind === 'ends') {
    const [a, b] = ['a', 'b'].map(x => x + (C === 'cp' ? 'p' : ''));
    s.decl(a, 'ptr', { base: S, i: 0 }); p.stmt(`char *${a} = ${S};`, `${a} → ${S}[0]`, { snap });
    s.decl(b, 'ptr', { base: S, i: 0 }); p.stmt(`char *${b} = ${S};`, `${b} → ${S}[0]`, { snap });
    s.ptrs.set(b, { base: S, i: L }); p.stmt(`while (*${b}) ${b}++;`, `${b} → ${S}[${L}] (the '\\0')`, { snap });
    s.ptrs.set(b, { base: S, i: L - 1 }); p.stmt(`${b}--;`, `${b} → ${S}[${L - 1}] = '${word[L - 1]}' (last real char)`, { snap });
    p.stmt(`char t = *${a};`, null, { mark: false });
    const t0 = chars[0]; chars[0] = chars[L - 1]; chars[L - 1] = t0;
    p.stmt(`*${a} = *${b};`, null, { mark: false });
    p.stmt(`*${b} = t;`, `first and last chars swapped: ${S} = "${str()}"`, { mark: false });
    ans = str(); p.stmt(`printf("%s\\n", ${S});`, `prints ${ans}`, { mark: false });
  } else {
    const k = int(rng, 1, Math.min(3, L - 2));
    s.decl(C, 'ptr', { base: S, i: k }); p.stmt(`char *${C} = ${S} + ${k};`, `${C} → ${S}[${k}]`, { snap });
    s.ptrs.set(C, { base: S, i: k + 1 }); p.stmt(`${C}++;`, `${C} → ${S}[${k + 1}] = '${word[k + 1]}'`, { snap });
    ans = `${word[0]}${word[k + 1]} ${word.slice(k + 1)}`;
    p.stmt(`printf("%c%c %s\\n", *${S}, *${C}, ${C});`, `*${S} = '${word[0]}', *${C} = '${word[k + 1]}', then the string from ${C}: ${word.slice(k + 1)}`, { mark: false });
  }
  return finish(p, ans, pickMark(rng, p, 1));
}

// Her exam Q1: pre/post decrement as an if condition.
function tDecb(rng) {
  const p = Prog(), s = State(), snap = snapOf(s);
  const [a, b] = sample(rng, ['a', 'b', 'x', 'y', 'i', 'j'], 2);
  const A = int(rng, 0, 3), B = int(rng, 0, 3);
  s.decl(a, 'int', A); p.stmt(`int ${a} = ${A};`, `${a} = ${A}`, { snap });
  s.decl(b, 'int', B); p.stmt(`int ${b} = ${B};`, `${b} = ${B}`, { snap });
  const K = pick(rng, [5, 10, 2, 3]);
  const kind = pick(rng, ['--b', 'b--', '++a', 'a++', 'while']);
  if (kind === 'while') {
    let av = A, bv = B, iters = 0;
    while (bv--) { av += K; iters++; }
    p.main.push(`${I}while (${b}--) {`, `${I}${I}${a} += ${K};`, `${I}}`);
    p.trace.push([`while (${b}--) ${a} += ${K};`, `the test uses ${b}'s OLD value: the body runs ${iters} time(s), and the final failing test still decrements: ${a} = ${av}, ${b} = ${bv}`], null, null);
    s.ints.set(a, av); s.ints.set(b, bv);
  } else {
    const v = kind.replace(/[+-]/g, '');
    const name = v === 'a' ? a : b;
    const old = s.ints.get(name), delta = kind.includes('++') ? 1 : -1, pre = /^[+-]/.test(kind);
    const nv = old + delta, cond = pre ? nv : old;
    s.ints.set(name, nv);
    const code = pre ? `${kind.slice(0, 2)}${name}` : `${name}${kind.slice(1)}`;
    const body = pick(rng, [`${b} += ${K};`, `${a} += ${K};`, `${a} = ${b} * 2;`]);
    p.main.push(`${I}if (${code}) {`, `${I}${I}${body}`, `${I}}`);
    let eff = `${name} becomes ${nv}; the condition is ${pre ? 'the NEW' : 'the OLD'} value ${cond}, which is ${cond ? 'true (non-zero)' : 'false (0)'}`;
    if (cond) {
      if (body.startsWith(`${b} +=`)) s.ints.set(b, s.ints.get(b) + K);
      else if (body.startsWith(`${a} +=`)) s.ints.set(a, s.ints.get(a) + K);
      else s.ints.set(a, s.ints.get(b) * 2);
      eff += `, so ${body} runs`;
    } else eff += ', so the body is skipped';
    p.trace.push([`if (${code}) { ${body} }`, eff], null, null);
  }
  const ans = `${s.ints.get(a)} ${s.ints.get(b)}`;
  p.stmt(`printf("%d %d\\n", ${a}, ${b});`, `prints ${ans}`, { snap });
  return finish(p, ans, chance(rng, 0.5) ? pickMark(rng, p, p.main.length - 1) : null);
}

function tPP(rng) {
  const p = Prog(), s = State(), snap = snapOf(s);
  const [a, b] = sample(rng, ['a', 'b', 'x', 'y', 'n'], 2);
  const A = int(rng, 1, 9), B = int(rng, 1, 9);
  s.decl(a, 'int', A); p.stmt(`int ${a} = ${A};`, `${a} = ${A}`, { snap });
  s.decl(b, 'int', B); p.stmt(`int ${b} = ${B};`, `${b} = ${B}`, { snap });
  s.decl('p', 'ptr', { base: a, i: -1 }); p.stmt(`int *p = &${a};`, `p → ${a}`, { snap });
  s.decl('pp', 'pptr', 'p'); p.stmt(`int **pp = &p;`, `pp → p`, { snap });
  const nOps = int(rng, 2, 3);
  for (let i = 0; i < nOps; i++) {
    const t = s.ptrs.get('p'), T = t.base;
    const r = rng(), k = int(rng, 2, 4);
    if (r < 0.35) { s.ints.set(T, s.ints.get(T) + k); p.stmt(`**pp += ${k};`, `**pp is *p is ${T}: ${T} = ${s.ints.get(T)}`, { snap }); }
    else if (r < 0.6) { const o = T === a ? b : a; s.ptrs.set('p', { base: o, i: -1 }); p.stmt(`*pp = &${o};`, `*pp is p, so p → ${o}`, { snap }); }
    else if (r < 0.8) { s.ints.set(T, s.ints.get(T) * k); p.stmt(`**pp *= ${k};`, `${T} = ${s.ints.get(T)}`, { snap }); }
    else { const o = T === a ? b : a; s.ints.set(o, s.ints.get(T) + k); p.stmt(`${o} = **pp + ${k};`, `${o} = ${T} + ${k} = ${s.ints.get(o)}`, { snap }); }
  }
  const T = s.ptrs.get('p').base;
  const ans = `${s.ints.get(a)} ${s.ints.get(b)} ${s.ints.get(T)}`;
  p.stmt(`printf("%d %d %d\\n", ${a}, ${b}, *p);`, `prints ${ans} (*p is ${T})`, { mark: false });
  return finish(p, ans, pickMark(rng, p, 4));
}

function tArrFn(rng) {
  const p = Prog(), s = State(), snap = snapOf(s);
  const fname = pick(rng, ['scaleAll', 'bump', 'addTo', 'doubleSome']);
  const op = pick(rng, ['*=', '+=', '-=']), K = int(rng, 2, 3);
  p.fn([`void ${fname}(int *v, int n) {`, `${I}for (int i = 0; i < n; i++) {`, `${I}${I}*(v + i) ${op} ${K};`, `${I}}`, '}']);
  const A = pick(rng, ['arr', 'nums', 'data']);
  const len = 5;
  const vals = Array.from({ length: len }, () => int(rng, 1, 12));
  s.decl(A, 'arr', vals.slice()); p.stmt(`int ${A}[] = ${arrText(vals)};`, `${A} = ${arrText(vals)}`, { snap });
  const st = int(rng, 0, 2), n = int(rng, 1, len - st);
  const arr = s.arrs.get(A);
  for (let i = st; i < st + n; i++) arr[i] = op === '*=' ? arr[i] * K : op === '+=' ? arr[i] + K : arr[i] - K;
  p.stmt(`${fname}(${st ? `${A} + ${st}` : A}, ${n});`, `v → ${A}[${st}], so elements ${st}..${st + n - 1} change: ${A} = ${arrText(arr)}`, { snap });
  p.stmt(`for (int *p = ${A}; p < ${A} + ${len}; p++) printf("%d ", *p);`, null, { mark: false });
  p.stmt(`printf("\\n");`, `prints every element: ${arr.join(' ')}`, { mark: false });
  return finish(p, arr.join(' '), pickMark(rng, p, 1));
}

function tAddTo(rng) {
  const p = Prog(), s = State(), snap = snapOf(s);
  const fname = pick(rng, ['addTo', 'deposit', 'grow', 'raise']);
  p.fn([`void ${fname}(int *t, int k) {`, `${I}*t += k;`, `${I}k = 0;`, '}']);
  const [a, k] = pick(rng, [['a', 'k'], ['total', 'step'], ['bank', 'amt'], ['x', 'd']]);
  const A = int(rng, 1, 20), K = int(rng, 2, 9);
  s.decl(a, 'int', A); p.stmt(`int ${a} = ${A};`, `${a} = ${A}`, { snap });
  s.decl(k, 'int', K); p.stmt(`int ${k} = ${K};`, `${k} = ${K}`, { snap });
  const times = int(rng, 1, 2);
  for (let i = 0; i < times; i++) {
    s.ints.set(a, s.ints.get(a) + K);
    p.stmt(`${fname}(&${a}, ${k});`, `*t += k: ${a} = ${s.ints.get(a)}; k = 0 changes only the parameter copy, so ${k} stays ${K}`, { snap });
  }
  const ans = `${s.ints.get(a)} ${K}`;
  p.stmt(`printf("%d %d\\n", ${a}, ${k});`, `prints ${ans}`, { mark: false });
  return finish(p, ans, pickMark(rng, p, 2));
}

const TEMPLATES = [[tRandom, 45], [tSwap, 20], [tMoney, 22], [tArray, 26], [tIncr, 26], [tString, 32], [tDecb, 16], [tPP, 12], [tArrFn, 12], [tAddTo, 10]];

// ── gcc verification ─────────────────────────────────────────────────────
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cbank-'));
let nRun = 0;
function runC(code) {
  const f = path.join(dir, `p${nRun++}.c`);
  fs.writeFileSync(f, code + '\n');
  execFileSync('gcc', ['-std=c99', '-w', '-o', f + '.out', f]);
  return execFileSync(f + '.out', { timeout: 5000 }).toString();
}
const norm = s => s.replace(/\s+/g, ' ').trim();
// Instrumented copy: after the marked line, print every main variable in diagram format.
function instrument(entry) {
  const { line, spec } = entry.diagram;
  const out = [];
  const ints = spec.filter(v => v.kind === 'int').map(v => [`&${v.name}`, v.name]);
  const cells = spec.flatMap(v => (v.kind === 'arr' || v.kind === 'str' ? Array.from({ length: v.len + (v.kind === 'arr' ? 1 : 0) }, (_, i) => [`&${v.name}[${i}]`, `${v.name}[${i}]`]) : []));
  const ptrs = spec.filter(v => v.kind === 'ptr').map(v => [`&${v.name}`, v.name]);
  const chain = (name, cands) => cands.map(([e, l]) => `(void *)${name} == (void *)(${e}) ? "${l}" : `).join('') + '"?"';
  for (const v of spec) {
    if (v.kind === 'int') out.push(`printf("@@${v.name} = %d\\n", ${v.name});`);
    else if (v.kind === 'arr') out.push(`printf("@@${v.name} = {"); for (int i_ = 0; i_ < ${v.len}; i_++) printf(i_ ? ", %d" : "%d", ${v.name}[i_]); printf("}\\n");`);
    else if (v.kind === 'str') out.push(`printf("@@${v.name} = \\"%s\\"\\n", ${v.name});`);
    else if (v.kind === 'ptr') out.push(`printf("@@${v.name} → %s\\n", ${chain(v.name, ints.concat(cells))});`);
    else out.push(`printf("@@${v.name} → %s\\n", ${chain(v.name, ptrs)});`);
  }
  const lines = entry.code.split('\n');
  lines.splice(line + 1, 0, ...out.map(l => I + l));
  return lines.join('\n');
}

function build() {
  const rng = rngFrom(SEED);
  const bank = [];
  const seen = new Set();
  for (const [t, n] of TEMPLATES) {
    let made = 0, tries = 0;
    while (made < n && tries++ < n * 20) {
      const e = t(rng);
      if (seen.has(e.code)) continue;
      seen.add(e.code);
      const got = norm(runC(e.code));
      if (got !== norm(e.answer)) throw new Error(`${t.name}: gcc printed "${got}" but the simulation says "${e.answer}"\n${e.code}`);
      e.answer = got;
      if (e.diagram) {
        const lines = runC(instrument(e)).split('\n').filter(l => l.startsWith('@@')).map(l => l.slice(2));
        if (lines.join('\n') !== e.diagram.vars.join('\n')) throw new Error(`${t.name}: diagram mismatch\ngcc: ${lines.join(' | ')}\nsim: ${e.diagram.vars.join(' | ')}\n${e.code}`);
        delete e.diagram.spec;
      }
      bank.push({ t: t.name.slice(1).toLowerCase(), ...e });
      made++;
    }
  }
  return bank;
}

if (require.main === module) {
  const bank = build();
  const out = path.join(__dirname, '..', 'decks', 'csc370-cpointer-bank.js');
  const header = `// GENERATED by tools/gen-c-pointer-bank.js (seed ${SEED}). Do not edit by hand: rerun the tool.\n`
    + `// ${bank.length} C programs in the AUCSC 370 C-exam style. Every answer is gcc's actual output, and every\n`
    + '// memory diagram was checked by an instrumented gcc run. tests/gen-csc370.test.js re-verifies a sample.\n';
  fs.writeFileSync(out, header + '(function (FC) {\n  \'use strict\';\n  FC.cPointerBank = [\n' + bank.map(e => '    ' + JSON.stringify(e)).join(',\n') + '\n  ];\n})(globalThis.FC = globalThis.FC || {});\n');
  const nd = bank.filter(e => e.diagram).length;
  console.log(`wrote ${bank.length} programs (${nd} with memory diagrams) to ${path.relative(process.cwd(), out)}`);
}
module.exports = { build };
