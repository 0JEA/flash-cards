// Generated CSC 325 practice (js/gen-softtest.js): every generator, seeds 1..300.
// Answers are re-checked by an INDEPENDENT route, not by calling the module's solvers:
//   - the code shown to the learner (Python or JS text) is converted to JS with trace hooks and
//     executed; the CFG is rebuilt from the executed node sequences and compared with the edge
//     list printed in the prompt;
//   - edge-pairs / complete paths / prime paths / minimum tests are recomputed by brute force;
//   - boundary values and off-by-one specs are re-parsed from the prompt text;
//   - mutants and seeded faults are rebuilt by text substitution on the displayed code;
//   - formulas (mutation score, availability) are recomputed from numbers parsed from the prompt.
const test = require('node:test');
const assert = require('node:assert/strict');
require('../js/generators.js');
require('../js/grade.js');
require('../js/gen-softtest.js');
const { gen, grade } = globalThis.FC;

const SEEDS = Array.from({ length: 300 }, (_, i) => i + 1);
const IDS = ['gen-st-cfg-counts', 'gen-st-min-tests', 'gen-st-suite-coverage', 'gen-st-prime-paths', 'gen-st-bva', 'gen-st-partitions',
  'gen-st-offbyone', 'gen-st-mutant-killed', 'gen-st-mutation-score', 'gen-st-ripr', 'gen-st-availability'];
const build = (id, seed) => globalThis.FC.genSofttest.build[id](gen.rngFrom(seed));
const cache = new Map();
function cards(id) {
  if (!cache.has(id)) cache.set(id, SEEDS.map(seed => ({ seed, card: gen.instance(id, seed), meta: build(id, seed).meta })));
  return cache.get(id);
}

// ───────────── run the displayed code ─────────────
const LABEL = /^(.*?)\s+(?:#|\/\/) N(\d+)( \(exit\))?\s*$/;
function convert(code) {
  const lines = code.split('\n');
  const py = /^def /.test(lines[0]);
  const out = [], stack = [], decl = new Set();
  let name, params, exitId = null;
  const pyExpr = e => e.replace(/\band\b/g, '&&').replace(/\bor\b/g, '||').replace(/\bTrue\b/g, 'true').replace(/\bFalse\b/g, 'false');
  for (const raw of lines) {
    const m = raw.match(LABEL);
    const text = m ? m[1] : raw, id = m ? +m[2] : null, ind = text.match(/^ */)[0].length, t = text.trim();
    if (!t) continue;
    let mm;
    if (py) {
      if (t === '# exit') { exitId = id; continue; }
      while (stack.length && stack[stack.length - 1] >= ind) { stack.pop(); out.push('}'); }
      if ((mm = t.match(/^def (\w+)\((.*)\):$/))) { name = mm[1]; params = mm[2].split(',').map(s => s.trim()); out.push(`function ${name}(${mm[2]}) {`, '/*DECL*/', `__t(${id});`); stack.push(ind); }
      else if ((mm = t.match(/^if (.*):$/))) { out.push(`if (__c(${id}, ${pyExpr(mm[1])})) {`); stack.push(ind); }
      else if ((mm = t.match(/^while (.*):$/))) { out.push(`while (__c(${id}, ${pyExpr(mm[1])})) {`); stack.push(ind); }
      else if (t === 'else:') { out.push('else {'); stack.push(ind); }
      else if ((mm = t.match(/^return (.*)$/))) out.push(`return __s(${id}, ${pyExpr(mm[1])});`);
      else if ((mm = t.match(/^(\w+) = (.*)$/))) { decl.add(mm[1]); out.push(`${mm[1]} = __s(${id}, ${pyExpr(mm[2])});`); }
      else throw new Error('cannot convert: ' + t);
    } else {
      if ((mm = t.match(/^function (\w+)\((.*)\) \{$/))) { name = mm[1]; params = mm[2].split(',').map(s => s.trim()); out.push(t, '/*DECL*/', `__t(${id});`); }
      else if ((mm = t.match(/^if \((.*)\) \{$/))) out.push(`if (__c(${id}, (${mm[1]}))) {`);
      else if ((mm = t.match(/^while \((.*)\) \{$/))) out.push(`while (__c(${id}, (${mm[1]}))) {`);
      else if (t === '} else {') out.push(t);
      else if (t === '}') { out.push('}'); if (m && m[3]) exitId = id; }
      else if ((mm = t.match(/^return (.*);$/))) out.push(`return __s(${id}, ${mm[1]});`);
      else if ((mm = t.match(/^(?:let )?(\w+) = (.*);$/))) { decl.add(mm[1]); out.push(`${mm[1]} = __s(${id}, ${mm[2]});`); }
      else throw new Error('cannot convert: ' + t);
    }
  }
  while (stack.length) { stack.pop(); out.push('}'); }
  const locals = [...decl].filter(v => !params.includes(v));
  const src = out.join('\n').replace('/*DECL*/', locals.length ? `let ${locals.join(', ')};` : '');
  return { src, name, params, exitId };
}
function runner(code) {
  const c = convert(code);
  let cur;
  const t = id => { if (id == null) return; if (++cur.steps > 50000) throw new Error('runaway'); cur.path.push(id); };
  const hooks = [t, (id, v) => { t(id); cur.ev.push(id + ':' + !!v); return v; }, (id, v) => { t(id); cur.ev.push(id + ':' + v); return v; }];
  const f = new Function('__t', '__c', '__s', `'use strict';\n${c.src}\nreturn ${c.name};`)(...hooks);
  return Object.assign(c, {
    call(args) { cur = { path: [], ev: [], steps: 0 }; const ret = f(...args); if (c.exitId != null) cur.path.push(c.exitId); return { path: cur.path, ev: cur.ev, ret }; },
  });
}
const DOMAIN = Array.from({ length: 16 }, (_, i) => i - 3); // -3..12, the inputs a generated function is defined over
const argsOver = (np, dom) => (np === 1 ? dom.map(v => [v]) : dom.flatMap(a => dom.map(b => [a, b])));

// The CFG as observed by executing the labelled code on every input.
function observe(labelled) {
  const r = runner(labelled);
  const nodes = new Set(), edges = new Set(), runs = [];
  for (const a of argsOver(r.params.length, DOMAIN)) {
    const x = r.call(a); runs.push({ args: a, path: x.path });
    x.path.forEach((n, i) => { nodes.add(n); if (i) edges.add(x.path[i - 1] + '>' + n); });
  }
  const labels = labelled.split('\n').map(l => l.match(LABEL)).filter(Boolean).map(m => +m[2]);
  return { r, nodes, edges, runs, labels, exit: r.exitId };
}
const promptEdges = prompt => new Set([...prompt.matchAll(/N(\d+)→N(\d+)/g)].map(m => m[1] + '>' + m[2]));
const edgeList = set => [...set].map(s => s.split('>').map(Number));
const sameSet = (a, b) => a.size === b.size && [...a].every(x => b.has(x));

// ───────────── brute-force graph facts ─────────────
function succOf(E) { const S = new Map(); for (const [a, b] of E) { if (!S.has(a)) S.set(a, []); S.get(a).push(b); } return S; }
function isSimple(p) {
  const inner = p.length > 1 && p[0] === p[p.length - 1] ? p.slice(0, -1) : p;
  return new Set(inner).size === inner.length && (inner.length === p.length || p.length > 2 || p.length === 2);
}
function simpleByBFS(E, nodes) {
  const S = succOf(E), all = [];
  let frontier = [...nodes].map(n => [n]);
  while (frontier.length) {
    const next = [];
    for (const p of frontier) {
      all.push(p);
      if (p.length > 1 && p[0] === p[p.length - 1]) continue;
      for (const m of S.get(p[p.length - 1]) || []) { const q = p.concat(m); if (isSimple(q)) next.push(q); }
    }
    frontier = next;
  }
  return all;
}
// Prime = a simple path that cannot be extended by one node at either end and stay simple.
function primesBrute(E, nodes) {
  const S = succOf(E), P = new Map();
  for (const [a, b] of E) { if (!P.has(b)) P.set(b, []); P.get(b).push(a); }
  return simpleByBFS(E, nodes).filter(p => {
    if (p.length > 1 && p[0] === p[p.length - 1]) return true; // a cycle can't be extended
    const right = (S.get(p[p.length - 1]) || []).some(m => isSimple(p.concat(m)));
    const left = (P.get(p[0]) || []).some(m => isSimple([m].concat(p)));
    return !right && !left;
  });
}
const contains = (path, sub) => (',' + path.join(',') + ',').includes(',' + sub.join(',') + ',');
function bruteMin(reqs, paths) {
  const masks = [...new Set(paths.map(p => reqs.reduce((m, r, i) => (contains(p, r) ? m | (1 << i) : m), 0)))];
  const full = (1 << reqs.length) - 1;
  for (let k = 1; k <= 6; k++) {
    const rec = (start, left, m) => (left === 0 ? m === full : masks.slice(start).some((x, j) => rec(start + j + 1, left - 1, m | x)));
    if (rec(0, k, 0)) return k;
  }
  return Infinity;
}

// ───────────── generic contract checks ─────────────
const norm = s => String(s).replace(/\s+/g, ' ').trim().toLowerCase();
for (const id of IDS) {
  test(`${id}: fields, types, prompt rules, determinism, variety (300 seeds)`, () => {
    const g = gen.all().find(x => x.id === id);
    assert.ok(g, 'registered');
    assert.equal(g.deck, 'softtest');
    const prompts = new Set();
    for (const { seed, card } of cards(id)) {
      const where = `${id} seed ${seed}`;
      assert.ok(['typed', 'mc', 'recall', 'set'].includes(card.type), where);
      for (const k of ['prompt', 'why', 'source']) assert.ok(typeof card[k] === 'string' && card[k].trim(), `${where}: ${k}`);
      assert.ok(!/____|slide/i.test(card.prompt), `${where}: prompt mentions a blank or a slide`);
      if (card.code !== undefined) assert.ok(typeof card.code === 'string' && card.code.trim(), where);
      if (card.type === 'typed') {
        assert.ok(typeof card.answer === 'string' && card.answer.trim(), where);
        assert.ok(grade.typed(card.answer, card), `${where}: its own answer must grade correct`);
        for (const a of card.accept || []) { assert.equal(typeof a, 'string', where); assert.notEqual(norm(a), norm(card.answer), `${where}: accept duplicates answer`); }
      } else if (card.type === 'mc') {
        assert.ok(Array.isArray(card.options) && card.options.length >= 1 && card.options.length <= 3, `${where}: 1-3 wrong options`);
        assert.ok(!card.options.includes(card.answer), `${where}: answer among wrong options`);
        assert.equal(new Set(card.options).size, card.options.length, `${where}: duplicate options`);
      } else if (card.type === 'set') {
        assert.ok(Array.isArray(card.answer) && card.answer.length >= 1, where);
        assert.equal(new Set(card.answer).size, card.answer.length, `${where}: duplicate set items`);
        assert.ok(grade.set(card.answer.join('\n'), card), `${where}: its own answer must grade correct`);
        assert.ok(grade.set(card.answer.slice().reverse().join('\n'), card), `${where}: any order`);
      } else {
        assert.ok(typeof card.answer === 'string' && card.answer && Array.isArray(card.points) && card.points.length, where);
      }
      const again = gen.instance(id, seed);
      assert.deepEqual(again, card, `${where}: not deterministic`);
      prompts.add(card.prompt);
    }
    assert.ok(prompts.size >= 20, `${id}: only ${prompts.size} distinct prompts`);
  });
}

// ───────────── per-generator answer checks ─────────────
test('gen-st-cfg-counts: counts match the CFG rebuilt by executing the displayed code', () => {
  const kinds = new Set();
  for (const { seed, card, meta } of cards('gen-st-cfg-counts')) {
    const where = `seed ${seed} (${meta.kind})`; kinds.add(meta.kind);
    const o = observe(meta.labelled);
    assert.ok(sameSet(new Set(o.labels), o.nodes), `${where}: some labelled node is never executed`);
    assert.equal(o.labels.length, new Set(o.labels).size, where);
    const E = edgeList(o.edges);
    if (/CFG edges:/.test(card.prompt)) assert.ok(sameSet(promptEdges(card.prompt), o.edges), `${where}: prompt edge list ≠ executed CFG`);
    const n = o.labels.length;
    if (meta.kind === 'nodes') {
      const stripped = meta.labelled.split('\n').map(l => { const m = l.match(LABEL); return m ? m[1].replace(/\s+$/, '') : l; }).filter(l => l.trim() !== '# exit').join('\n');
      assert.equal(card.code, stripped, `${where}: unlabelled code is not the same function`);
      assert.equal(card.answer, String(n), where);
    } else if (meta.kind === 'edges') assert.equal(card.answer, String(o.edges.size), where);
    else if (meta.kind === 'edgepairs') {
      const indeg = {}, outdeg = {};
      for (const [a, b] of E) { outdeg[a] = (outdeg[a] || 0) + 1; indeg[b] = (indeg[b] || 0) + 1; }
      const pairs = Object.keys(indeg).reduce((s, v) => s + indeg[v] * (outdeg[v] || 0), 0);
      assert.equal(card.answer, String(pairs), where);
    } else if (meta.kind === 'complete') {
      const S = succOf(E), memo = new Map();
      const count = v => (v === o.exit ? 1 : memo.has(v) ? memo.get(v) : (memo.set(v, (S.get(v) || []).reduce((s, m) => s + count(m), 0)), memo.get(v)));
      assert.equal(card.answer, String(count(0)), where);
    } else if (meta.kind === 'prime') assert.equal(card.answer, String(primesBrute(E, o.nodes).length), where);
    else {
      assert.ok(sameSet(promptEdges(card.answer), o.edges), `${where}: listed edges ≠ executed CFG`);
      assert.equal(card.type, 'recall', where);
    }
  }
  assert.equal(kinds.size, 6, 'every question kind appears');
});

test('gen-st-min-tests: brute-force minimum over every path the inputs can take', () => {
  const answers = new Set();
  for (const { seed, card, meta } of cards('gen-st-min-tests')) {
    const where = `seed ${seed} (${meta.crit})`;
    const o = observe(card.code);
    assert.ok(sameSet(promptEdges(card.prompt), o.edges), `${where}: prompt edge list ≠ executed CFG`);
    const E = edgeList(o.edges);
    const reqs = meta.crit === 'node' ? [...o.nodes].map(n => [n]) : meta.crit === 'edge' ? E : primesBrute(E, o.nodes);
    assert.equal(card.answer, String(bruteMin(reqs, o.runs.map(r => r.path))), where);
    answers.add(card.answer);
  }
  assert.ok(answers.size >= 3, 'answers vary: ' + [...answers]);
});

test('gen-st-suite-coverage: executing the suite gives the stated fraction; percent forms accepted', () => {
  let partial = 0;
  for (const { seed, card, meta } of cards('gen-st-suite-coverage')) {
    const where = `seed ${seed} (${meta.crit})`;
    const o = observe(card.code);
    assert.ok(sameSet(promptEdges(card.prompt), o.edges), where);
    const suite = [...card.prompt.split('. What')[0].matchAll(new RegExp(`${o.r.name}\\(([-\\d, ]+)\\)`, 'g'))].map(m => m[1].split(',').map(Number));
    assert.deepEqual(suite, meta.suite, where);
    const paths = suite.map(a => o.r.call(a).path);
    let c, t;
    if (meta.crit === 'node') { const seen = new Set(paths.flat()); c = [...o.nodes].filter(n => seen.has(n)).length; t = o.nodes.size; }
    else { const seen = new Set(paths.flatMap(p => p.slice(1).map((n, i) => p[i] + '>' + n))); c = [...o.edges].filter(e => seen.has(e)).length; t = o.edges.size; }
    assert.equal(card.answer, `${c}/${t}`, where);
    const g = c && (function gcd(a, b) { return b ? gcd(b, a % b) : a; })(c, t);
    assert.ok(grade.typed(`${c / g}/${t / g}`, card) || c / g === c, `${where}: reduced fraction`);
    assert.ok(grade.typed(`${(100 * c / t).toFixed(1)}%`, card) || c === t, `${where}: 1-dp percent`);
    assert.ok(!grade.typed(`${c + 1}/${t}`, card), `${where}: a wrong count must fail`);
    if (c < t) partial++;
  }
  assert.ok(partial > 60, 'most suites leave something uncovered');
});

test('gen-st-prime-paths: the answer set equals brute-force prime paths of the executed CFG', () => {
  for (const { seed, card } of cards('gen-st-prime-paths')) {
    const o = observe(card.code);
    assert.ok(sameSet(promptEdges(card.prompt), o.edges), `seed ${seed}`);
    const brute = new Set(primesBrute(edgeList(o.edges), o.nodes).map(p => p.map(n => 'N' + n).join(',')));
    assert.ok(sameSet(brute, new Set(card.answer)), `seed ${seed}: ${[...brute]} vs ${card.answer}`);
    assert.ok([...o.nodes].length && card.answer.some(p => { const q = p.split(','); return q[0] === q[q.length - 1]; }), `seed ${seed}: has a loop cycle`);
    // The learner's natural spellings grade correct; a missing path does not.
    assert.ok(grade.set(card.answer.map(p => '[' + p.replace(/,/g, ', ') + ']').join('; '), card), `seed ${seed}`);
    assert.ok(!grade.set(card.answer.slice(1).join('\n'), card), `seed ${seed}`);
  }
});

// Spec phrases → accepted integer range (parsed independently of the generator).
function parseRange(text) {
  let m;
  if ((m = text.match(/from (-?\d+) to (-?\d+) inclusive/))) return [+m[1], +m[2]];
  if ((m = text.match(/strictly between (-?\d+) and (-?\d+)/))) return [+m[1] + 1, +m[2] - 1];
  let lo = null, hi = null;
  if ((m = text.match(/at least (-?\d+)/))) lo = +m[1];
  if ((m = text.match(/more than (-?\d+)/))) lo = +m[1] + 1;
  if ((m = text.match(/over (-?\d+)/))) lo = +m[1] + 1;
  if ((m = text.match(/(-?\d+) or more/))) lo = +m[1];
  if ((m = text.match(/at most (-?\d+)/))) hi = +m[1];
  if ((m = text.match(/(?:less than|under) (-?\d+)/))) hi = +m[1] - 1;
  if ((m = text.match(/(-?\d+) or less/))) hi = +m[1];
  return [lo, hi];
}

test('gen-st-bva: boundary values recomputed from the spec text', () => {
  for (const { seed, card } of cards('gen-st-bva')) {
    const spec = card.prompt.split('. Using')[0];
    const [lo, hi] = parseRange(spec);
    const want = [];
    if (lo != null) want.push(lo - 1, lo, lo + 1);
    if (hi != null) want.push(hi - 1, hi, hi + 1);
    assert.ok(want.length, `seed ${seed}: could not parse "${spec}"`);
    assert.deepEqual(card.answer.map(Number).sort((a, b) => a - b), want.sort((a, b) => a - b), `seed ${seed}: ${spec}`);
    assert.ok(grade.set(want.join(', '), card), `seed ${seed}`);
  }
});

test('gen-st-partitions: the input really lies in the answered class (and in no distractor)', () => {
  const RX = { 'letters and digits': /^[A-Za-z0-9]$/, digits: /^[0-9]$/, 'uppercase letters': /^[A-Z]$/, 'lowercase letters': /^[a-z]$/ };
  const seen = new Set();
  for (const { seed, card, meta } of cards('gen-st-partitions')) {
    const where = `seed ${seed} (${meta.kind}/${card.type})`; seen.add(meta.kind + card.type);
    if (meta.kind === 'range') {
      for (const r of meta.ranges) assert.ok(card.prompt.includes(`${r[0]}–${r[1]}`), where);
      if (card.type === 'recall') { assert.equal(card.points.length, meta.ranges.length + 2, where); continue; }
      const v = meta.input;
      assert.ok(card.prompt.includes(`= ${v} belong`), where);
      const i = v < meta.min ? 0 : v > meta.max ? meta.classes.length - 1 : 1 + meta.ranges.findIndex(r => v >= r[0] && v <= r[1]);
      assert.equal(card.answer, meta.classes[i], where);
    } else if (meta.kind === 'string') {
      if (card.type === 'recall') { assert.equal(card.points.length, 4, where); continue; }
      const s = meta.input, ok = [...s].every(ch => RX[meta.charset].test(ch));
      assert.ok(card.prompt.includes(`"${s}"`), where);
      const broken = [s.length < meta.lo, s.length > meta.hi, !ok];
      assert.ok(broken.filter(Boolean).length <= 1, `${where}: input breaks more than one rule`);
      const i = broken.indexOf(true) + 1; // 0 = valid
      assert.equal(card.answer, meta.classes[i], `${where}: "${s}"`);
    } else {
      const combos = meta.groups.length * meta.values.length;
      if (card.type === 'recall') { assert.equal(card.points.length, 1 + meta.groups.length + meta.values.length, where); continue; }
      if (card.type === 'typed') { assert.equal(card.answer, String(combos), where); continue; }
      const [age, flag] = meta.input;
      assert.ok(card.prompt.includes(`(age ${age}, ${flag})`), where);
      if (age < 0) { assert.match(card.answer, /^invalid/, where); continue; }
      const gi = meta.groups.findIndex(([, a, b]) => age >= a && (b == null || age <= b));
      assert.equal(card.answer, meta.combined[gi * meta.values.length + meta.values.indexOf(flag)], where);
      assert.ok(!card.options.includes(meta.combined[gi * meta.values.length + meta.values.indexOf(flag)]), where);
    }
  }
  assert.ok(seen.size >= 6, 'all spec kinds and question kinds appear: ' + [...seen]);
});

test('gen-st-offbyone: executing the code against the spec text finds the same smallest input', () => {
  for (const { seed, card } of cards('gen-st-offbyone')) {
    const spec = card.prompt.match(/^Spec: .* if \w+ is (.*?)\. The code/)[1];
    const [lo, hi] = parseRange(spec);
    const f = runner(card.code);
    let first = null;
    for (let x = -50; x <= 300 && first == null; x++) {
      const want = (lo == null || x >= lo) && (hi == null || x <= hi);
      if (!!f.call([x]).ret !== want) first = x;
    }
    assert.notEqual(first, null, `seed ${seed}: the code is not buggy`);
    assert.equal(card.answer, String(first), `seed ${seed}: ${spec}\n${card.code}`);
  }
});

function splitSuite(code) {
  const [fnCode, suite] = code.split('\n\n');
  const tests = suite.split('\n').slice(1).map(l => {
    const m = l.match(/^assert (\w+)\(([-\d, ]+)\) == (-?\d+)$/) || l.match(/^assertEquals\((-?\d+), (\w+)\(([-\d, ]+)\)\);$/);
    return l.startsWith('assert ') ? { args: m[2].split(',').map(Number), exp: +m[3] } : { args: m[3].split(',').map(Number), exp: +m[1] };
  });
  return { fnCode, tests };
}
test('gen-st-mutant-killed: mutant rebuilt from the displayed line; kills checked by execution', () => {
  const answers = { yes: 0, no: 0, input: 0 };
  for (const { seed, card, meta } of cards('gen-st-mutant-killed')) {
    const where = `seed ${seed} (${meta.ask})`;
    const { fnCode, tests } = splitSuite(card.code);
    assert.ok(card.prompt.includes(`\`${meta.origLine}\``) && card.prompt.includes(`\`${meta.mutLine}\``), where);
    const hits = fnCode.split('\n').filter(l => l.trim() === meta.origLine);
    assert.equal(hits.length, 1, `${where}: mutated line must be unique`);
    const orig = runner(fnCode), mut = runner(fnCode.replace(meta.origLine, meta.mutLine));
    for (const t of tests) assert.equal(orig.call(t.args).ret, t.exp, `${where}: expected value is the original's output`);
    const kills = a => orig.call(a).ret !== mut.call(a).ret;
    const killed = tests.some(t => kills(t.args));
    if (card.type === 'mc') {
      assert.equal(card.answer.startsWith('Yes'), killed, where);
      answers[killed ? 'yes' : 'no']++;
    } else {
      answers.input++;
      assert.equal(killed, false, `${where}: the suite must not already kill it`);
      const dom = orig.params.length === 1 ? Array.from({ length: 21 }, (_, i) => i) : Array.from({ length: 10 }, (_, i) => i);
      const killing = argsOver(orig.params.length, dom).filter(kills).map(a => a.join(','));
      const given = new Set([card.answer, ...card.accept].map(s => [...s.matchAll(/-?\d+/g)].map(Number).join(',')));
      assert.ok(killing.length, where);
      assert.ok(sameSet(given, new Set(killing)), `${where}: accepted inputs ≠ killing inputs`);
      assert.ok(!grade.typed(argsOver(orig.params.length, dom).find(a => !kills(a))?.join(', ') ?? 'none', card), `${where}: a non-killing input is rejected`);
    }
  }
  assert.ok(answers.yes > 30 && answers.no > 30 && answers.input > 60, JSON.stringify(answers));
});

test('gen-st-mutation-score: MS recomputed from the numbers in the prompt', () => {
  for (const { seed, card } of cards('gen-st-mutation-score')) {
    const n = k => { const m = card.prompt.match(new RegExp(`${k} = (\\d+)`)); return m && +m[1]; };
    const M = n('M'), E = n('E');
    if (/MORE/.test(card.prompt)) {
      const K = n('K'), T = +card.prompt.match(/at least (\d+)%/)[1];
      let need = 0; while ((K + need) / (M - E) < T / 100) need++;
      assert.equal(card.answer, String(need), `seed ${seed}`);
      continue;
    }
    const surv = card.prompt.match(/(\d+) of the non-equivalent mutants survive/);
    const K = surv ? M - E - +surv[1] : n('K');
    const ms = K / (M - E);
    assert.equal(card.answer, ms.toFixed(2), `seed ${seed}`);
    assert.ok(grade.typed(`${K}/${M - E}`, card) && grade.typed(`${(100 * ms).toFixed(1)}%`, card), `seed ${seed}: fraction and percent forms`);
    assert.ok(!grade.typed((ms + 0.05).toFixed(2), card), `seed ${seed}: wrong value rejected`);
  }
});

test('gen-st-ripr: reach / infect / propagate recomputed by running the correct and faulty code', () => {
  const OPT = ['Doesn’t reach', 'Reaches it, but', 'Reaches and infects', 'Reaches, infects and propagates'];
  const counts = [0, 0, 0, 0];
  for (const { seed, card, meta } of cards('gen-st-ripr')) {
    const where = `seed ${seed}`;
    const pm = card.prompt.match(/line N(\d+) `(.*?)` should be `(.*?)`\. Input \w+\(([-\d, ]+)\)/);
    const [id, faultLine, correctLine, args] = [+pm[1], pm[2], pm[3], pm[4].split(',').map(Number)];
    const lines = card.code.split('\n');
    const at = lines.findIndex(l => { const m = l.match(LABEL); return m && +m[2] === id; });
    assert.equal(lines[at].match(LABEL)[1].trim(), faultLine, `${where}: the labelled line is the stated fault`);
    const fixed = lines.slice(); fixed[at] = lines[at].replace(faultLine, correctLine);
    const bad = runner(card.code).call(args), good = runner(fixed.join('\n')).call(args);
    const reached = bad.path.includes(id);
    const infected = bad.ev.join('|') !== good.ev.join('|');
    const propagated = bad.ret !== good.ret;
    assert.ok(reached || !infected, where);
    assert.ok(infected || !propagated, where);
    const k = !reached ? 0 : !infected ? 1 : !propagated ? 2 : 3;
    assert.ok(card.answer.startsWith(OPT[k]), `${where}: expected "${OPT[k]}…", got "${card.answer}"`);
    counts[k]++;
  }
  assert.ok(counts.every(c => c > 40), 'all four outcomes are practised: ' + counts);
});

test('gen-st-availability: answers recomputed from the numbers in the prompt', () => {
  for (const { seed, card } of cards('gen-st-availability')) {
    const p = card.prompt, where = `seed ${seed}: ${p}`;
    let m;
    if ((m = p.match(/MTBF = (\d+) hours and MTTR = (\d+) (hours|minutes)/))) {
      const mttr = +m[2] / (m[3] === 'minutes' ? 60 : 1);
      assert.equal(card.answer, (+m[1] / (+m[1] + mttr)).toFixed(4), where);
    } else if ((m = p.match(/availability of ([\d.]+)%\. Its MTBF is ([\d.]+) hours/))) {
      const A = +m[1] / 100, mtbf = +m[2], mttr = +card.answer;
      assert.ok(Math.abs(mtbf / (mtbf + mttr) - A) < 1e-9, where);
    } else if ((m = p.match(/promises (\d) nines.*per (year|30-day month).*Answer in (hours|minutes)/))) {
      const A = 1 - 10 ** -+m[1], hours = m[2] === 'year' ? 365 * 24 : 30 * 24;
      assert.equal(card.answer, ((1 - A) * hours * (m[3] === 'minutes' ? 60 : 1)).toFixed(2), where);
    } else if ((m = p.match(/down for a total of ([\d.]+) hours/))) {
      assert.equal(card.answer, `${(100 * (1 - +m[1] / 8760)).toFixed(2)}%`, where);
    } else assert.fail('unparsed prompt: ' + p);
    for (const a of card.accept || []) {
      const v = parseFloat(a.replace(/^\./, '0.'));
      const ans = parseFloat(card.answer);
      assert.ok(Math.abs(v - ans) < 0.0051 * Math.max(1, Math.abs(ans)) || Math.abs(v / 100 - ans) < 1e-4 || Math.abs(v - ans / 100) < 1e-4, `${where}: accept "${a}" is not the answer`);
    }
  }
});
