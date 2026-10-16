// Generated AUCSC 310 problems (js/gen-csc310.js). Every answer is re-solved here with
// SEPARATE code: own implementations of each algorithm (written 0-based or recursively, unlike
// the generator), python3 to run the loop pseudocode exactly as displayed, and mpmath
// (bundled with sympy) for growth-rate comparisons at astronomically large n.
const test = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
require('../js/generators.js');
require('../js/grade.js');
require('../js/gen-csc310.js');
const katex = require('../vendor/katex/katex.min.js');
const G = globalThis.FC.gen, grade = globalThis.FC.grade;

const SEEDS = Array.from({ length: 300 }, (_, i) => (Math.imul(i + 1, 2654435761) >>> 0));
const IDS = ['gen-310-master', 'gen-310-recursion-tree', 'gen-310-growth-order', 'gen-310-loop-count', 'gen-310-partition',
  'gen-310-heap', 'gen-310-buildheap', 'gen-310-counting-sort', 'gen-310-hash', 'gen-310-binary-search'];
const cards = new Map(IDS.map(id => [id, SEEDS.map(s => G.instance(id, s))]));
const lectures = new Set(['1', '2', '3', 'ws-binsearch', '4', '5', 'master', '6', '7', 'heap', 'buildheap', 'lowerbound', 'linsort', 'hash', 'ws-openaddr']);
const WHY_MAX = 350; // raw characters, LaTeX source included (renders shorter)
const CATS = new Set(['Asymptotics', 'Recurrences', 'Sorting', 'Heaps & priority queues', 'Hashing']);

// Typed answers must be accepted by the real grader; return the canonical string.
const ok = (c, s) => grade.typed(s, c);
function expectTyped(c, expected) {
  assert.equal(c.type, 'typed', c.prompt);
  assert.ok(ok(c, String(expected)), `answer ${JSON.stringify(c.answer)} ≠ expected ${JSON.stringify(expected)}\n${c.prompt}`);
}
function expectList(c, arr) {
  assert.equal(c.type, 'typed');
  for (const s of [arr.join(', '), arr.join(','), '[' + arr.join(', ') + ']', arr.join(' ')]) {
    assert.ok(ok(c, s), `list ${JSON.stringify(s)} not accepted; answer ${c.answer}\n${c.prompt}`);
  }
}
const parseArr = (prompt, name = 'A') => {
  const m = prompt.match(new RegExp(`${name} = \\[([^\\]]*)\\]`));
  return m[1].split(',').map(x => Number(x.trim()));
};

// ─────────────── shared field checks ───────────────
test('csc310 registers exactly the expected generators', () => {
  assert.deepEqual(G.forDeck('csc310').map(g => g.id).sort(), IDS.slice().sort());
  for (const g of G.forDeck('csc310')) {
    assert.ok(lectures.has(g.lecture), `${g.id}: lecture ${g.lecture}`);
    assert.ok(CATS.has(g.cat), `${g.id}: cat ${g.cat}`);
  }
});

for (const id of IDS) {
  test(`${id}: valid fields, deterministic, varied, no placeholders`, () => {
    const list = cards.get(id), prompts = new Set();
    let longest = 0;
    list.forEach((c, i) => {
      const again = G.instance(id, SEEDS[i]);
      assert.deepEqual(again, c, 'same seed must give the same problem');
      assert.ok(typeof c.prompt === 'string' && c.prompt.length > 10, 'prompt');
      assert.ok(typeof c.why === 'string' && c.why.length > 10, 'why must show the worked steps');
      assert.ok(c.source && c.spec, 'source and spec');
      for (const s of [c.prompt, c.why, c.code || '', JSON.stringify(c.answer), JSON.stringify(c.options || [])]) {
        assert.ok(!s.includes('____'), `placeholder blank in ${id}: ${s}`);
        assert.ok(!/slide/i.test(s), `"slide" in ${id}: ${s}`);
        assert.ok(!/undefined|NaN|\[object/.test(s), `bad interpolation in ${id}: ${s}`);
      }
      if (c.type === 'typed') {
        assert.ok(typeof c.answer === 'string' && c.answer.length, 'typed answer');
        assert.ok(ok(c, c.answer));
        if (c.accept) {
          assert.ok(!c.accept.includes(c.answer), 'accept duplicates answer');
          assert.equal(new Set(c.accept).size, c.accept.length, 'accept has duplicates');
        }
      } else if (c.type === 'mc') {
        assert.ok(Array.isArray(c.options) && c.options.length >= 1 && c.options.length <= 3, 'mc: 1-3 wrong options');
        assert.ok(!c.options.includes(c.answer), 'mc: answer among wrong options');
        assert.equal(new Set(c.options).size, c.options.length);
      } else if (c.type === 'order') {
        assert.ok(Array.isArray(c.answer) && c.answer.length >= 3 && new Set(c.answer).size === c.answer.length, 'order: 3+ distinct tiles');
      } else if (c.type === 'set') {
        assert.ok(Array.isArray(c.answer) && c.answer.length >= 1);
        assert.ok(grade.set(c.answer.join(', '), c));
      } else assert.fail(`unexpected type ${c.type}`);
      // Inline LaTeX ($…$) only in reader-facing text, and every formula must parse in KaTeX.
      for (const s of [c.prompt, c.why].concat(c.type === 'mc' ? c.options.concat(c.answer) : [])) {
        assert.equal((s.match(/(?<!\\)\$/g) || []).length % 2, 0, `unbalanced $ in: ${s}`);
        for (const m of s.matchAll(/(?<!\\)\$(.+?)(?<!\\)\$/g)) {
          assert.doesNotThrow(() => katex.renderToString(m[1], { throwOnError: true }), `KaTeX rejects ${m[1]}`);
        }
      }
      if (c.type !== 'mc') {
        for (const s of [].concat(c.answer, c.accept || [])) assert.ok(!String(s).includes('$'), `LaTeX in a typed answer: ${s}`);
      }
      assert.ok(!(c.code || '').includes('$'), 'code stays plain');
      // Fit at 632×595: short worked solution, short code.
      assert.ok(c.why.length <= WHY_MAX, `why is ${c.why.length} chars: ${c.why}`);
      assert.ok((c.code || '').split('\n').length <= 12, 'code over 12 lines');
      longest = Math.max(longest, c.why.length);
      prompts.add(c.prompt + '\n' + (c.code || ''));
    });
    assert.ok(prompts.size >= 20, `only ${prompts.size} distinct prompts`);
    // Every question kind the generator has should actually come up across 300 seeds.
    const kinds = new Set(list.map(c => c.spec.kind));
    assert.ok(kinds.size >= 2, `${id}: only kinds ${[...kinds]}`);
  });
}

// ─────────────── Θ parsing (test side) ───────────────
// Parse "Θ(n^2 lg n)", "Θ(n^(log_2 3))", "Θ(√n)", "n^(3/2)" into { e, l }.
function parseTheta(s) {
  let t = s.trim().replace(/^Θ\((.*)\)$/, '$1');
  let l = 0;
  const lg = t.match(/\s*lg(\^2)? n$/);
  if (lg) { l = lg[1] ? 2 : 1; t = t.slice(0, lg.index); }
  if (t === '' ) return { e: 0, l };
  if (t === '1') return { e: 0, l };
  if (t === 'n') return { e: 1, l };
  if (t === '√n' || t === 'sqrt n') return { e: 0.5, l };
  let m;
  if ((m = t.match(/^n\^\(log_(\d+) (\d+)\)$/))) return { e: Math.log(+m[2]) / Math.log(+m[1]), l };
  if ((m = t.match(/^n\^\((\d+)\/(\d+)\)$/))) return { e: +m[1] / +m[2], l };
  if ((m = t.match(/^n\^([\d.]+)$/))) return { e: +m[1], l };
  throw new Error('cannot parse ' + s);
}
const sameTheta = (x, y) => Math.abs(x.e - y.e) < 1e-9 && x.l === y.l;

// ─────────────── 1. master theorem ───────────────
test('gen-310-master: case and Θ re-derived from the notes\' statement; Θ checked numerically', () => {
  for (const c of cards.get('gen-310-master')) {
    const { a, b, f, kind } = c.spec;
    assert.ok(c.prompt.includes(`${a === 1 ? '' : a}T(n/${b})`), c.prompt);
    let kase, sol;
    if (a < 1) kase = 'na';
    else {
      const p = Math.log(a) / Math.log(b), d = f.k - p;
      if (d < -1e-9) { kase = 1; sol = { e: p, l: 0 }; }
      else if (d > 1e-9) { kase = 3; assert.notEqual(f.logf, -1); sol = { e: f.k, l: f.logf }; }
      else if (f.logf === 0) { kase = 2; sol = { e: p, l: 1 }; }
      else kase = 'na';
      if (kind === 'crit') { assert.ok(sameTheta(parseTheta(c.answer), { e: p, l: 0 }), `${c.answer} vs n^${p}`); continue; }
    }
    if (kind === 'case') { assert.equal(c.answer, { 1: 'Case 1', 2: 'Case 2', 3: 'Case 3', na: 'No case applies' }[kase]); continue; }
    if (kase === 'na') { expectTyped(c, 'does not apply'); continue; }
    assert.ok(sameTheta(parseTheta(c.answer), sol), `${c.answer} vs ${JSON.stringify(sol)} for ${c.prompt}`);
    // Numeric: T(b^m) / g(b^m) should settle to a constant (T(1) = 1).
    const fv = n => f.coef * n ** f.k * (f.logf === 1 ? Math.log2(n) : 1);
    const ratio = m => { let T = 1; for (let j = 1; j <= m; j++) { const n = b ** j; T = a * T + fv(n); } const n = b ** m; return T / (n ** sol.e * Math.log2(n) ** sol.l); };
    const M = Math.floor(300 / Math.log2(b) / Math.max(1, sol.e, f.k, Math.log2(a) / Math.log2(b) + 1));
    const r1 = ratio(Math.floor(M / 2)), r2 = ratio(M);
    assert.ok(r2 / r1 > 0.6 && r2 / r1 < 1.6, `numeric ratio drifts ${r1} → ${r2} for ${c.prompt}`);
    // A few spellings a student would type.
    for (const s of [c.answer.replace('Θ', 'theta'), c.answer.replace(/^Θ\((.*)\)$/, '$1')]) assert.ok(ok(c, s), s);
  }
});

// ─────────────── 2. recursion tree ───────────────
test('gen-310-recursion-tree: numbers come from walking the actual tree', () => {
  for (const c of cards.get('gen-310-recursion-tree')) {
    const { a, b, k, c: cc, n, kind, i } = c.spec;
    const depthNodes = [], depthCost = [];
    (function walk(size, d) { // every node, one by one
      depthNodes[d] = (depthNodes[d] || 0) + 1;
      const cost = size === 1 ? 1 : cc * size ** k;
      depthCost[d] = (depthCost[d] || 0) + cost;
      if (size > 1) for (let t = 0; t < a; t++) walk(size / b, d + 1);
    })(n, 0);
    const levels = depthNodes.length, leaves = depthNodes[levels - 1];
    const total = depthCost.reduce((x, y) => x + y, 0);
    const T = m => m === 1 ? 1 : a * T(m / b) + cc * m ** k;
    assert.equal(total, T(n));
    if (kind !== 'theta' && kind !== 'dominant') assert.ok(c.prompt.includes(`n = ${n}`));
    if (kind === 'levels') expectTyped(c, levels);
    else if (kind === 'height') expectTyped(c, levels - 1);
    else if (kind === 'leaves') expectTyped(c, leaves);
    else if (kind === 'total') expectTyped(c, total);
    else if (kind === 'nodes') expectTyped(c, depthNodes[i]);
    else if (kind === 'nodeCost') expectTyped(c, depthCost[i] / depthNodes[i]);
    else if (kind === 'levelCost') expectTyped(c, depthCost[i]);
    else {
      const r = a - b ** k; // compare a with b^k
      if (kind === 'dominant') assert.equal(c.answer, r < 0 ? 'Root level dominates' : r === 0 ? 'All levels cost the same' : 'Leaf level dominates');
      else assert.ok(sameTheta(parseTheta(c.answer), r < 0 ? { e: k, l: 0 } : r === 0 ? { e: k, l: 1 } : { e: Math.log(a) / Math.log(b), l: 0 }), c.answer);
    }
  }
});

// ─────────────── 3. growth of functions (mpmath at huge n) ───────────────
// ln f(n) per function, as mpmath expressions. Python evaluates only these test-owned strings
// (and, below, pseudocode generated by our own generator): no outside input reaches eval/exec.
const PY_LN = {
  '1': 'mpf(0)', 'lg lg n': 'log(log(log(n,2),2))', 'lg n': 'log(log(n,2))', 'lg^2 n': '2*log(log(n,2))',
  'n^(1/3)': 'log(n)/3', '√n': 'log(n)/2', 'n/lg n': 'log(n)-log(log(n,2))', 'n': 'log(n)', 'n lg n': 'log(n)+log(log(n,2))',
  'n^1.5': '1.5*log(n)', 'n^2': '2*log(n)', 'n^2 lg n': '2*log(n)+log(log(n,2))', 'n^3': '3*log(n)', '2^n': 'n*log(2)',
  'n·2^n': 'log(n)+n*log(2)', '3^n': 'n*log(3)', 'n!': 'loggamma(n+1)', 'n^n': 'n*log(n)',
  '5n^2 + 3n': 'log(5*n**2+3*n)', 'n^2/10': '2*log(n)-log(10)', '100n + 7': 'log(100*n+7)', 'lg(n^3)': 'log(3*log(n,2))',
  'log_3 n': 'log(log(n,3))', '2^(n+1)': '(n+1)*log(2)', '3n lg n + n': 'log(3*n*log(n,2)+n)', '√n + 10': 'log(sqrt(n)+10)',
  'n^3 + 1000n^2': 'log(n**3+1000*n**2)', '2^(lg n)': 'log(n,2)*log(2)', '4^(lg n)': 'log(n,2)*log(4)', '0.3n^2 + 10n + 20': 'log(mpf(3)/10*n**2+10*n+20)',
};
function growthClasses(pairs) {
  // For each pair [f, g]: -1 if f = o(g), 0 if Θ, 1 if ω — from ln f − ln g at n = 10^30, 10^60, 10^120.
  const script = `
import sys, json
from mpmath import mp, mpf, log, sqrt, loggamma
mp.dps = 250
F = json.loads(sys.argv[1]); pairs = json.loads(sys.stdin.read())
def ln(s, n): return eval(F[s], {'log': log, 'sqrt': sqrt, 'loggamma': loggamma, 'mpf': mpf, 'n': n})
out = []
for f, g in pairs:
    d = [ln(f, mpf(10)**e) - ln(g, mpf(10)**e) for e in (30, 60, 120)]
    if abs(d[2] - d[0]) < mpf('0.01'): out.append(0)
    else:
        assert (d[1] - d[0]) * (d[2] - d[1]) > 0, (f, g, d)
        out.append(1 if d[2] > d[0] else -1)
print(json.dumps(out))`;
  return JSON.parse(execFileSync('python3', ['-I', '-c', script, JSON.stringify(PY_LN)], { input: JSON.stringify(pairs) }).toString());
}
test('gen-310-growth-order: orders and relations agree with mpmath at n up to 10^120', () => {
  const list = cards.get('gen-310-growth-order');
  const pairs = [], uses = [];
  for (const c of list) {
    if (c.type === 'order') {
      assert.equal(c.answer.length, c.spec.fs.length);
      assert.deepEqual(c.answer.slice().sort(), c.spec.fs.slice().sort());
      for (let i = 0; i + 1 < c.answer.length; i++) { uses.push([c, 'adj']); pairs.push([c.answer[i], c.answer[i + 1]]); }
    } else {
      assert.ok(c.prompt.includes(c.spec.ft) && c.prompt.includes(c.spec.gt));
      uses.push([c, 'pair']); pairs.push([c.spec.f, c.spec.g]);
    }
  }
  for (const [f, g] of pairs) assert.ok(PY_LN[f] && PY_LN[g], `test needs a formula for ${f} / ${g}`);
  const cls = growthClasses(pairs);
  cls.forEach((r, i) => {
    const [c, how] = uses[i];
    if (how === 'adj') { assert.equal(r, -1, `order: ${pairs[i][0]} should grow strictly slower than ${pairs[i][1]}`); return; }
    if (c.spec.kind === 'rel3') assert.equal(c.answer, { '-1': '$f(n) = o(g(n))$', 0: '$f(n) = \\Theta(g(n))$', 1: '$f(n) = \\omega(g(n))$' }[r], c.prompt);
    else {
      const holds = { O: r <= 0, 'Ω': r >= 0, 'Θ': r === 0, o: r < 0, 'ω': r > 0 }[c.spec.rel];
      assert.equal(c.answer, holds ? 'Yes, true' : 'No, false', c.prompt);
    }
  });
});

// ─────────────── 4. loop counts: run the displayed pseudocode in python3 ───────────────
function toPython(code, n) {
  const out = ['from math import floor', `n = ${n}`];
  for (const line of code.split('\n')) {
    const ind = line.match(/^ */)[0], s = line.trim();
    let m;
    if ((m = s.match(/^for (\w+) = (.+) to (.+)$/))) out.push(`${ind}for ${m[1]} in range(${m[2]}, (${m[3]}) + 1):`);
    else if ((m = s.match(/^while (.+)$/))) out.push(`${ind}while ${m[1]}:`);
    else if (/^\w+ = .+$/.test(s)) out.push(ind + s);
    else throw new Error('unknown pseudocode line: ' + s);
  }
  return out.join('\n') + '\nprint(count)';
}
const runPy = progs => JSON.parse(execFileSync('python3', ['-I', '-c', `
import sys, json, io, contextlib
res = []
for src in json.loads(sys.stdin.read()):
    buf = io.StringIO()
    with contextlib.redirect_stdout(buf): exec(src, {})
    res.append(int(buf.getvalue()))
print(json.dumps(res))`], { input: JSON.stringify(progs), maxBuffer: 1 << 24 }).toString());
test('gen-310-loop-count: exact counts match python3 running the shown code; Θ matches measured growth', () => {
  const list = cards.get('gen-310-loop-count');
  const counted = list.filter(c => c.spec.kind === 'count');
  const got = runPy(counted.map(c => toPython(c.code, c.spec.n)));
  counted.forEach((c, i) => { assert.ok(c.prompt.includes(`n = ${c.spec.n}`)); expectTyped(c, got[i]); });
  // Θ: measure count(2N)/count(N) on each distinct fragment.
  const thetaCards = list.filter(c => c.spec.kind === 'theta');
  const codes = [...new Set(thetaCards.map(c => c.code))];
  const small = runPy(codes.flatMap(code => [toPython(code, 32), toPython(code, 64)]));
  const K = 10, N = 2 ** K;
  const bigIdx = codes.map((_, i) => small[2 * i + 1] / small[2 * i] < 6);
  const big = runPy(codes.filter((_, i) => bigIdx[i]).flatMap(code => [toPython(code, N), toPython(code, 2 * N)]));
  const cls = new Map();
  let j = 0;
  codes.forEach((code, i) => {
    if (!bigIdx[i]) { cls.set(code, { e: 3, l: 0 }); return; }
    const r = big[2 * j + 1] / big[2 * j]; j++;
    const cand = [[{ e: 0, l: 1 }, (K + 2) / (K + 1)], [{ e: 0.5, l: 0 }, Math.SQRT2], [{ e: 1, l: 0 }, 2], [{ e: 1, l: 1 }, 2 * (K + 2) / (K + 1)], [{ e: 2, l: 0 }, 4]];
    cand.sort((x, y) => Math.abs(x[1] - r) - Math.abs(y[1] - r));
    cls.set(code, cand[0][0]);
  });
  for (const c of thetaCards) {
    assert.ok(sameTheta(parseTheta(c.answer), cls.get(c.code)), `${c.answer} vs measured ${JSON.stringify(cls.get(c.code))}\n${c.code}`);
    assert.ok(ok(c, c.answer.replace(/^Θ\((.*)\)$/, 'theta($1)')));
  }
});

// ─────────────── 5. PARTITION ───────────────
function lomuto0(arr) { // 0-based: pivot last, i = boundary of the "≤ pivot" region
  const A = arr.slice(), r = A.length - 1, x = A[r], snaps = [];
  let i = -1, swaps = 0;
  for (let j = 0; j < r; j++) {
    if (A[j] <= x) { i += 1; const t = A[i]; A[i] = A[j]; A[j] = t; swaps++; }
    snaps.push(A.slice());
  }
  const t = A[i + 1]; A[i + 1] = A[r]; A[r] = t; swaps++;
  return { q1: i + 2, A, snaps, swaps };
}
test('gen-310-partition: Lomuto PARTITION re-run 0-based', () => {
  for (const c of cards.get('gen-310-partition')) {
    const A = parseArr(c.prompt);
    assert.deepEqual(A, c.spec.A);
    const r = lomuto0(A);
    assert.ok(r.A.slice(0, r.q1 - 1).every(v => v <= r.A[r.q1 - 1]) && r.A.slice(r.q1).every(v => v > r.A[r.q1 - 1]));
    const k = c.spec.kind;
    if (k === 'q') expectTyped(c, r.q1);
    else if (k === 'array') expectList(c, r.A);
    else if (k === 'swaps') expectTyped(c, r.swaps);
    else if (k === 'sizes') expectList(c, [r.q1 - 1, A.length - r.q1]);
    else expectList(c, r.snaps[c.spec.j - 1]);
  }
});

// ─────────────── 6. heaps ───────────────
// 0-based helpers: children 2i+1, 2i+2.
function siftDown(A, i, size) {
  let swaps = 0;
  while (true) {
    const kids = [2 * i + 1, 2 * i + 2].filter(x => x < size);
    if (!kids.length) return swaps;
    const big = kids.reduce((x, y) => (A[y] > A[x] ? y : x));
    if (A[big] <= A[i]) return swaps;
    [A[i], A[big]] = [A[big], A[i]]; swaps++; i = big;
  }
}
const isMaxHeap = (A, size = A.length) => A.slice(1, size).every((v, i) => A[Math.floor(i / 2)] >= v);
function build0(arr, stopAt1 = 1) { // stopAt1: last 1-based index processed
  const A = arr.slice(); let swaps = 0;
  for (let i = Math.floor(A.length / 2) - 1; i >= stopAt1 - 1; i--) swaps += siftDown(A, i, A.length);
  return { A, swaps };
}
test('gen-310-heap: operations re-run on a 0-based heap', () => {
  for (const c of cards.get('gen-310-heap')) {
    const k = c.spec.kind;
    if (k === 'index') {
      const { i, which, n } = c.spec;
      const i0 = i - 1, ans0 = which === 'Left' ? 2 * i0 + 1 : which === 'Right' ? 2 * i0 + 2 : Math.floor((i0 - 1) / 2);
      assert.ok(ans0 >= 0 && ans0 < n);
      expectTyped(c, ans0 + 1);
      continue;
    }
    const A = parseArr(c.prompt);
    assert.deepEqual(A, c.spec.A);
    if (k === 'build') { const r = build0(A); assert.ok(isMaxHeap(r.A)); expectList(c, r.A); continue; }
    if (k === 'heapify') {
      const i0 = c.spec.i - 1, B = A.slice();
      // Precondition from the notes: both subtrees of i are max-heaps; A[i] breaks the property.
      const sub = r => { const q = [r], out = []; while (q.length) { const x = q.shift(); if (x < B.length) { out.push(x); q.push(2 * x + 1, 2 * x + 2); } } return out; };
      for (const r of [2 * i0 + 1, 2 * i0 + 2]) for (const x of sub(r)) for (const y of [2 * x + 1, 2 * x + 2]) if (y < B.length) assert.ok(B[x] >= B[y]);
      assert.ok([2 * i0 + 1, 2 * i0 + 2].some(y => y < B.length && B[y] > B[i0]));
      siftDown(B, i0, B.length);
      expectList(c, B);
      continue;
    }
    assert.ok(isMaxHeap(A), 'operations start from a valid max-heap');
    if (k === 'extract') {
      const B = A.slice(); B[0] = B.pop(); siftDown(B, 0, B.length);
      assert.ok(isMaxHeap(B)); expectList(c, B);
    } else if (k === 'insert' || k === 'increase') {
      const B = A.slice(); let i;
      if (k === 'insert') { B.push(c.spec.key); i = B.length - 1; assert.ok(c.prompt.includes(`MAX-HEAP-INSERT(A, ${c.spec.key})`)); }
      else { i = c.spec.i - 1; assert.ok(c.spec.key > B[i]); B[i] = c.spec.key; assert.ok(c.prompt.includes(`HEAP-INCREASE-KEY(A, ${c.spec.i}, ${c.spec.key})`)); }
      while (i > 0 && B[(i - 1) >> 1] < B[i]) { const p = (i - 1) >> 1; [B[i], B[p]] = [B[p], B[i]]; i = p; }
      assert.ok(isMaxHeap(B)); expectList(c, B);
    } else if (k === 'heapsort') {
      const B = A.slice(); let size = B.length;
      for (let t = 0; t < c.spec.iters; t++) { [B[0], B[size - 1]] = [B[size - 1], B[0]]; size--; siftDown(B, 0, size); }
      assert.ok(isMaxHeap(B, size));
      expectList(c, B);
    } else assert.fail(k);
  }
});

// ─────────────── 7. BuildHeap analysis ───────────────
test('gen-310-buildheap: heights and counts from an explicit tree walk', () => {
  for (const c of cards.get('gen-310-buildheap')) {
    const k = c.spec.kind;
    if (['firstLeaf', 'calls', 'height', 'heapHeight', 'countH'].includes(k)) {
      const n = c.spec.n;
      assert.ok(c.prompt.includes(`n = ${n}`));
      const h = i => (2 * i > n ? 0 : 1 + Math.max(h(2 * i), 2 * i + 1 <= n ? h(2 * i + 1) : 0)); // 1-based tree, height in edges
      const internal = []; for (let i = 1; i <= n; i++) if (2 * i <= n) internal.push(i);
      if (k === 'firstLeaf') expectTyped(c, internal.length + 1);
      else if (k === 'calls') expectTyped(c, internal.length);
      else if (k === 'heapHeight') expectTyped(c, h(1));
      else if (k === 'height') expectTyped(c, h(c.spec.i));
      else { let cnt = 0; for (let i = 1; i <= n; i++) if (h(i) === c.spec.h) cnt++; expectTyped(c, cnt); assert.ok(cnt <= Math.ceil(n / 2 ** (c.spec.h + 1))); }
      continue;
    }
    const A = parseArr(c.prompt);
    if (k === 'swaps') expectTyped(c, build0(A).swaps);
    else { assert.ok(c.prompt.includes(`Max-Heapify(A, ${c.spec.i0})`)); expectList(c, build0(A, c.spec.i0).A); }
  }
});

// ─────────────── 8. counting / radix sort ───────────────
test('gen-310-counting-sort: C arrays, output and radix passes', () => {
  for (const c of cards.get('gen-310-counting-sort')) {
    const k = c.spec.kind;
    if (k === 'radix') {
      const A = c.spec.A; assert.ok(c.prompt.includes(A.join(', ')));
      let L = A.slice();
      for (let d = 0; d < c.spec.pass; d++) L = L.slice().sort((x, y) => Math.floor(x / 10 ** d) % 10 - Math.floor(y / 10 ** d) % 10); // Array.sort is stable
      expectList(c, L);
      continue;
    }
    const A = parseArr(c.prompt), K = c.spec.k;
    assert.deepEqual(A, c.spec.A);
    const counts = Array.from({ length: K + 1 }, (_, v) => A.filter(x => x === v).length);
    const prefix = counts.map((_, v) => A.filter(x => x <= v).length);
    const last = A[A.length - 1];
    if (k === 'counts') expectList(c, counts);
    else if (k === 'prefix') expectList(c, prefix);
    else if (k === 'output') expectList(c, A.slice().sort((x, y) => x - y));
    else if (k === 'firstPos') expectTyped(c, prefix[last]);
    else expectList(c, prefix.map((v, i) => (i === last ? v - 1 : v)));
  }
});

// ─────────────── 9. hashing ───────────────
const probeFn = {
  linear: (k, i, m) => (k + i) % m,
  quadratic: (k, i, m) => ((k % m) + i ** 2) % m,
  double: (k, i, m) => ((k % 13) + i * (1 + (k % 11))) % m,
};
function openTable(method, m, keys) {
  const T = Array(m).fill(null), seqs = new Map();
  keys.forEach(k => {
    const seq = [];
    for (let i = 0; i < m; i++) { const s = probeFn[method](k, i, m); seq.push(s); if (T[s] === null) { T[s] = k; break; } }
    seqs.set(k, seq);
  });
  return { T, seqs };
}
test('gen-310-hash: tables, probe sequences, DEL rules and load factor', () => {
  for (const c of cards.get('gen-310-hash')) {
    const { kind, m, keys } = c.spec;
    assert.ok(c.prompt.includes(keys.join(', ')) && c.prompt.includes(`${m}`));
    if (['chain', 'longest', 'alpha'].includes(kind)) {
      const chain = s => keys.filter(x => x % m === s);
      if (kind === 'alpha') { expectTyped(c, `${keys.length}/${m}`); assert.ok(ok(c, (keys.length / m).toFixed(2))); }
      else if (kind === 'longest') expectTyped(c, Math.max(...Array.from({ length: m }, (_, s) => chain(s).length)));
      else { assert.equal(c.type, 'set'); assert.ok(grade.set(chain(c.spec.slot).join(','), c)); }
      continue;
    }
    const { T, seqs } = openTable(c.spec.method, m, keys);
    assert.equal(T.filter(x => x !== null).length, keys.length, 'every key placed');
    if (kind === 'table') {
      const row = T.map(x => (x === null ? '-' : x));
      expectList(c, row);
      assert.ok(ok(c, T.map(x => (x === null ? '∅' : x)).join(', ')));
      continue;
    }
    if (kind === 'probe') { expectList(c, seqs.get(c.spec.key)); continue; }
    assert.equal(c.spec.method, 'linear');
    const D = T.slice(); D[D.indexOf(c.spec.del)] = 'DEL';
    if (kind === 'search') {
      const x = c.spec.target, seq = [];
      for (let i = 0; i < m; i++) { const s = (x + i) % m; seq.push(s); if (D[s] === null || D[s] === x) break; }
      expectList(c, seq);
    } else {
      // Worksheet: remember the first DEL, keep probing until empty (no duplicate), then use the DEL.
      const x = c.spec.key; let firstDel = null, slot = null;
      for (let i = 0; i < m && slot === null; i++) {
        const s = (x + i) % m;
        assert.notEqual(D[s], x);
        if (D[s] === 'DEL' && firstDel === null) firstDel = s;
        if (D[s] === null) slot = firstDel === null ? s : firstDel;
      }
      expectTyped(c, slot);
    }
  }
});

// ─────────────── 10. binary search ───────────────
function bsRec(a, key, low, high, mids) { // 1-based, recursive (the worksheet's Part 4 shape)
  if (low > high) return -1;
  const mid = (low + high) >> 1; mids.push(mid);
  if (a[mid - 1] === key) return mid;
  return key < a[mid - 1] ? bsRec(a, key, low, mid - 1, mids) : bsRec(a, key, mid + 1, high, mids);
}
const worst = n => (n === 0 ? 0 : 1 + worst(Math.floor(n / 2))); // larger half after the probe is floor(n/2)
test('gen-310-binary-search: midpoints, iterations and result re-run recursively', () => {
  for (let n = 1; n <= 64; n++) { // brute-force the worst-case formula on real arrays
    const a = Array.from({ length: n }, (_, i) => 2 * i + 2);
    let mx = 0; for (let key = 1; key <= 2 * n + 3; key++) { const m = []; bsRec(a, key, 1, n, m); mx = Math.max(mx, m.length); }
    assert.equal(worst(n), mx);
  }
  for (const c of cards.get('gen-310-binary-search')) {
    if (c.spec.kind === 'worst') { expectTyped(c, worst(c.spec.n)); continue; }
    const a = parseArr(c.prompt, 'a'), key = c.spec.key;
    assert.ok(c.prompt.includes(`key = ${key}`));
    assert.ok(a.every((v, i) => i === 0 || a[i - 1] < v), 'sorted');
    const mids = [], ret = bsRec(a, key, 1, a.length, mids);
    if (c.spec.kind === 'mids') expectList(c, mids);
    else if (c.spec.kind === 'iters') expectTyped(c, mids.length);
    else expectTyped(c, ret);
  }
});
