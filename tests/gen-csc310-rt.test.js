// Assignment 2 recursion-tree generators (js/gen-csc310-rt.js, plus the a2-tagged
// gen-310-recursion-tree in js/gen-csc310.js). Every answer is re-solved here with SEPARATE
// code: the recurrence is read back from the PROMPT text (not the generator's spec), the
// actual tree is walked node by node with exact BigInt sizes, level totals are summed from
// those nodes, depths come from repeated division, uneven trees are enumerated state by state,
// and Θ classes come from summing the recurrence numerically, never from the master theorem.
const test = require('node:test');
const assert = require('node:assert/strict');
require('../js/generators.js');
require('../js/grade.js');
require('../js/tree.js');
require('../js/gen-csc310.js');
require('../js/gen-csc310-rt.js');
const katex = require('../vendor/katex/katex.min.js');
const G = globalThis.FC.gen, grade = globalThis.FC.grade, T = globalThis.FC.tree;

const SEEDS = Array.from({ length: 300 }, (_, i) => (Math.imul(i + 1, 2654435761) >>> 0));
const NEW = ['gen-310-rt-fill', 'gen-310-rt-measure', 'gen-310-rt-uneven'];
const A2 = NEW.concat('gen-310-recursion-tree');
const cards = new Map(A2.map(id => [id, SEEDS.map(s => G.instance(id, s))]));
const WHY_MAX = 350;
const ok = (c, s) => grade.typed(s, c);
const strip = s => String(s).replace(/\$/g, '');
const bgcd = (x, y) => (y ? bgcd(y, x % y) : (x < 0n ? -x : x));
const bred = (p, q) => { const g = bgcd(p, q); return [p / g, q / g]; };

// ─────────────── reading the recurrence back from the prompt ───────────────
function evenRec(prompt) {
  const m = prompt.match(/T\(n\) = (\d*)T\(n\/(\d+)\) \+ cn(?:\^(\d))?/);
  assert.ok(m, `no even recurrence in: ${prompt}`);
  return { a: m[1] ? +m[1] : 1, b: +m[2], k: m[3] ? +m[3] : 1 };
}
function unevenRec(prompt) {
  const m = prompt.match(/T\(n\) = T\((\d*)n\/(\d+)\) \+ T\((\d*)n\/(\d+)\) \+ cn/);
  assert.ok(m, `no uneven recurrence in: ${prompt}`);
  const fr = [[m[1] ? +m[1] : 1, +m[2]], [m[3] ? +m[3] : 1, +m[4]]].sort((x, y) => x[0] / x[1] - y[0] / y[1]);
  return { small: fr[0], big: fr[1] };
}

// ─────────────── even trees, walked node by node ───────────────
// Sum over the nodes at depth j of size^k (c = 1), for n = b^H (exact BigInt sizes).
function levelSum(a, b, k, j, H = 8) {
  const n = BigInt(b) ** BigInt(H);
  let sum = 0n, count = 0;
  (function walk(size, d) {
    if (d === j) { sum += size ** BigInt(k); count++; return; }
    for (let t = 0; t < a; t++) walk(size / BigInt(b), d + 1);
  })(n, 0);
  return { frac: bred(sum, n ** BigInt(k)), count };
}
// Depth at which repeated division by b reaches 1.
const divDepth = (n, b) => { let d = 0; while (n > 1) { assert.equal(n % b, 0); n /= b; d++; } return d; };
// Leaves counted by walking the tree for n = b^h.
function countLeaves(a, b, h) { let L = 0; (function w(s) { if (s === 1) { L++; return; } for (let t = 0; t < a; t++) w(s / b); })(b ** h); return L; }
// n^(log_b a) written by the test: rational exponent by search, else log form.
function powCanon(a, b) {
  if (a === 1) return '1';
  for (let y = 1; y <= 4; y++) for (let x = 1; x <= 30; x++) if (a ** y === b ** x) return y === 1 ? (x === 1 ? 'n' : `n^${x}`) : `n^(${x}/${y})`;
  return `n^(log_${b} ${a})`;
}
// Θ class by summing T(b^m) = a T(b^(m-1)) + (b^m)^k and checking which candidate ratio settles.
function thetaByTheSum(a, b, k) {
  const e = Math.log(a) / Math.log(b);
  const M = Math.floor(900 / (Math.log2(b) * Math.max(k, e, 1)));
  const Tm = m => { let t = 1; for (let j = 1; j <= m; j++) t = a * t + (b ** j) ** k; return t; };
  const cands = [{ name: 'root', g: n => n ** k }, { name: 'equal', g: n => n ** k * Math.log2(n) }, { name: 'leaves', g: n => n ** e }];
  const settled = cands.filter(c => { const r1 = Tm(M / 2 | 0) / c.g(b ** (M / 2 | 0)), r2 = Tm(M) / c.g(b ** M); return r2 / r1 > 0.95 && r2 / r1 < 1.05; });
  assert.ok(settled.length >= 1, `nothing settles for ${a},${b},${k}`);
  assert.equal(settled.length, 1, `classes ${settled.map(x => x.name)} all settle for ${a},${b},${k}`);
  return settled[0];
}
const thetaCanon = (dom, a, b, k) => dom === 'root' ? `Θ(${k === 1 ? 'n' : 'n^' + k})` : dom === 'equal' ? `Θ(${k === 1 ? 'n' : 'n^' + k} lg n)` : `Θ(${powCanon(a, b)})`;

// Parse "\tfrac{P}{Q}\,cn^k", "Pcn^k", "cn^k" (rtree sums) into [P, Q] and k.
function parseCoef(tex) {
  const t = strip(tex).replace(/\\,/g, '').replace(/\s/g, '');
  const m = t.match(/^(?:\\tfrac\{(\d+)\}\{(\d+)\}|(\d+))?cn(?:\^(\d))?$/);
  assert.ok(m, `cannot parse level total ${tex}`);
  return { P: BigInt(m[1] || m[3] || 1), Q: BigInt(m[2] || 1), k: m[4] ? +m[4] : 1 };
}
// Check an even-split rtree against the walked tree.
function checkEvenRtree(c, a, b, k) {
  const L = c.rtree.levels;
  assert.equal(L.length, 4);
  for (let i = 0; i < 2; i++) {
    const { frac, count } = levelSum(a, b, k, i);
    const s = parseCoef(L[i].sum);
    assert.equal(s.k, k);
    assert.deepEqual([s.P, s.Q], frac, `level ${i} total ${L[i].sum}`);
    assert.equal(L[i].nodes.length, count <= 4 ? count : 5, 'nodes drawn on the level');
    const D = BigInt(b) ** BigInt(i * k);
    const want = i ? `\\tfrac{cn${k === 1 ? '' : '^' + k}}{${D}}` : `cn${k === 1 ? '' : '^' + k}`;
    assert.ok(L[i].nodes.every(x => strip(x) === want || strip(x) === '\\cdots'), `node labels on level ${i}: ${L[i].nodes}`);
  }
  assert.ok(L[2].gap);
  assert.equal(strip(L[3].sum), `\\Theta(${{ 1: '1', n: 'n' }[powCanon(a, b)] || powCanon(a, b).replace(/\^\((\d+)\/(\d+)\)/, '^{$1/$2}').replace(/\^\(log_(\d+) (\d+)\)/, '^{\\log_{$1} $2}').replace(/\^(\d+)$/, '^{$1}')})`, 'leaf row = n^(log_b a)');
}

// ─────────────── uneven trees, enumerated by (small steps i, big steps j) ───────────────
// size(i, j) = N·s^i·g^j; a node exists iff a parent that exists is bigger than 1. cnt = paths.
function unevenTree(N, small, big, maxD = 80) {
  const [sp, sq] = small.map(BigInt), [gp, gq] = big.map(BigInt), NN = BigInt(N);
  const leafAt = (i, j) => NN * sp ** BigInt(i) * gp ** BigInt(j) <= sq ** BigInt(i) * gq ** BigInt(j);
  const sizeF = (i, j) => N * (small[0] / small[1]) ** i * (big[0] / big[1]) ** j;
  const cnt = new Map([['0,0', 1]]), levels = [];
  let minLeaf = Infinity, maxLeaf = -1;
  for (let d = 0; d <= maxD; d++) {
    let sum = 0, any = false;
    for (let i = 0; i <= d; i++) {
      const j = d - i, c = cnt.get(i + ',' + j);
      if (!c) continue;
      any = true;
      sum += c * sizeF(i, j);
      if (leafAt(i, j)) { minLeaf = Math.min(minLeaf, d); maxLeaf = Math.max(maxLeaf, d); continue; }
      cnt.set((i + 1) + ',' + j, (cnt.get((i + 1) + ',' + j) || 0) + c);
      cnt.set(i + ',' + (j + 1), (cnt.get(i + ',' + (j + 1)) || 0) + c);
    }
    if (!any) break;
    levels.push(sum);
  }
  // T with every node costing its size (leaves included) and with leaves costing 1.
  return { minLeaf, maxLeaf, levels };
}
const fracTexT = ([x, y]) => (y === 1 ? String(x) : `\\tfrac{${x}}{${y}}`);
const igcd = (u, v) => (v ? igcd(v, u % v) : u);
const flip = ([x, y]) => { const d = igcd(y, x); return [y / d, x / d]; };   // 1 / (x/y), reduced
const logT = B => `\\log_{${fracTexT(B)}} n`;
const parseSize = s => { const m = strip(s).replace(/\s/g, '').match(/^(\d*)n(?:\/(\d+))?$/); assert.ok(m, `size label ${s}`); return [m[1] ? +m[1] : 1, m[2] ? +m[2] : 1]; };

// ─────────────── shared field checks ───────────────
const mathIn = s => [...String(s).matchAll(/(?<!\\)\$(.+?)(?<!\\)\$/g)].map(m => m[1]);
const treeStrings = t => [t.label || '', t.answer || ''].concat((t.kids || []).flatMap(treeStrings));
function shownText(c) {
  const out = [c.prompt, c.why];
  if (c.type === 'mc') out.push(...c.options, c.answer);
  if (c.tree) out.push(...treeStrings(c.tree));
  const r = c.rtree;
  if (!r) return out;
  out.push(r.caption || '', r.sumsLabel || '');
  assert.ok(r.levels.length <= 4, 'rtree rows are a fixed 54px: at most 4 fit under the answer at 632×595');
  for (const l of r.levels) if (!l.gap) out.push(...l.nodes, l.sum || '');
  return out;
}
const freeze = c => JSON.parse(JSON.stringify(c));

for (const id of A2) {
  test(`${id}: valid fields, deterministic, KaTeX, rtree shape, short why`, () => {
    const list = cards.get(id), prompts = new Set();
    list.forEach((c, i) => {
      assert.deepEqual(freeze(G.instance(id, SEEDS[i])), freeze(c), 'same seed, same problem');
      assert.deepEqual(c.assignment, ['a2']);
      assert.equal(c.lecture, '5'); assert.equal(c.cat, 'Recurrences'); assert.equal(c.sub, 'Recursion trees');
      assert.ok(c.prompt.length > 10 && c.why.length > 10);
      assert.ok(c.why.length <= WHY_MAX, `why is ${c.why.length} chars: ${c.why}`);
      for (const s of [c.prompt, c.why, JSON.stringify(c.answer), JSON.stringify(c.options || []), JSON.stringify(c.rtree || {}), JSON.stringify(c.tree || {})]) {
        assert.ok(!/undefined|NaN|\[object|Infinity/.test(s), `bad interpolation: ${s}`);
      }
      if (c.type === 'typed') {
        assert.ok(typeof c.answer === 'string' && c.answer.length && ok(c, c.answer));
        for (const s of [].concat(c.answer, c.accept || [])) assert.ok(!String(s).includes('$'), `LaTeX in a typed answer: ${s}`);
        if (c.accept) { assert.ok(!c.accept.includes(c.answer)); assert.equal(new Set(c.accept).size, c.accept.length); }
      } else if (c.type === 'mc') {
        assert.ok(c.options.length >= 1 && c.options.length <= 3 && !c.options.includes(c.answer) && new Set(c.options).size === c.options.length);
      } else if (c.type === 'fill') {
        const blanks = T.layout(c.tree).nodes.filter(n => n.t.blank);
        assert.ok(blanks.length >= 2, 'fill needs blanks');
        assert.ok(blanks.every(n => strip(n.t.answer).trim().length > 0), 'every blank has an answer');
        assert.ok(/Type like /.test(c.prompt), 'prompt states the format');
      } else assert.fail(`unexpected type ${c.type}`);
      // Every formula parses; $ balanced.
      for (const s of shownText(c)) {
        assert.equal((String(s).match(/(?<!\\)\$/g) || []).length % 2, 0, `unbalanced $ in ${s}`);
        for (const m of mathIn(s)) assert.doesNotThrow(() => katex.renderToString(m, { throwOnError: true }), `KaTeX rejects ${m}`);
      }
      // rtree on every card: 1–9 nodes on every drawn level, 3–4 rows, a total on each.
      assert.ok(c.rtree && c.rtree.levels.length >= 3, 'rtree');
      for (const l of c.rtree.levels) {
        if (l.gap) continue;
        assert.ok(l.nodes.length >= 1 && l.nodes.length <= 9, `rtree level has ${l.nodes.length} nodes`);
        assert.ok(l.sum, 'level total');
      }
      prompts.add(c.prompt + JSON.stringify(c.tree || ''));
    });
    assert.ok(prompts.size >= 40, `only ${prompts.size} distinct problems`);
  });
}

test('every kind of every new generator comes up', () => {
  const want = {
    'gen-310-rt-fill': ['costs', 'sizes', 'total'],
    'gen-310-rt-measure': ['depth', 'depthN', 'leaves', 'leavesN', 'ratio', 'levelCost', 'dominant', 'theta'],
    'gen-310-rt-uneven': ['fill', 'shallow', 'deep', 'shallowN', 'deepN', 'levelsum', 'partial', 'lower', 'upper', 'theta', 'const'],
  };
  for (const [id, kinds] of Object.entries(want)) {
    const seen = new Set(cards.get(id).map(c => c.spec.kind));
    assert.deepEqual([...seen].sort(), kinds.slice().sort(), id);
  }
  const dom = new Set(cards.get('gen-310-rt-measure').map(c => c.spec.dom));
  assert.equal(dom.size, 3, 'root, equal and leaves recurrences all come up');
});

// ─────────────── 1. fill ───────────────
test('gen-310-rt-fill: node labels and level totals from the walked tree; the grader takes typed answers', () => {
  for (const c of cards.get('gen-310-rt-fill')) {
    const { a, b, k } = evenRec(c.prompt);
    assert.ok(a <= 3 && [2, 4, 5].includes(b), 'small tree, b never 3');
    checkEvenRtree(c, a, b, k);
    if (c.type === 'typed') {
      const j = +c.prompt.match(/on level (\d)/)[1];
      const { frac: [P, Q] } = levelSum(a, b, k, j);
      const f = 'cn' + (k === 1 ? '' : '^' + k);
      const canon = Q === 1n ? (P === 1n ? f : `${P}${f}`) : `${P === 1n ? '' : P}${f}/${Q}`;
      assert.ok(ok(c, canon), `level ${j} total ${canon} not accepted; answer ${c.answer}`);
      if (Q !== 1n) for (const s of [`${P}/${Q} ${f}`, `(${P}/${Q})${f}`]) assert.ok(ok(c, s), s);
      assert.ok(!ok(c, `${P + 1n}${f}/${Q}`), 'a wrong total is rejected');
      assert.ok(/Type it like 5cn/.test(c.prompt));
      continue;
    }
    const sizes = /size of its subproblem/.test(c.prompt);
    // The why states both level totals (summed here from the walked tree).
    if (!sizes) for (const j of [1, 2]) {
      const { frac: [P, Q] } = levelSum(a, b, k, j), f = 'cn' + (k === 1 ? '' : '^' + k);
      const want = Q === 1n ? (P === 1n ? f : `${P}${f}`) : `\\tfrac{${P}}{${Q}}\\,${f}`;
      assert.ok(c.why.includes('$' + want + '$'), `why lacks level ${j} total ${want}: ${c.why}`);
    }
    const ex = c.prompt.match(/Type like (\S+?)[ .]/)[1];
    // Walk: depth d has size n/b^d; its cost is c(n/b^d)^k = cn^k / b^(dk).
    const nodes = T.layout(c.tree).nodes;
    const vals = {}, blanks = [];
    for (const nd of nodes) {
      const lab = strip(nd.t.blank ? nd.t.answer : nd.t.label);
      if (lab === '\\cdots') { assert.equal(a, 3); continue; }
      let D = 1; for (let d = 0; d < nd.depth; d++) D *= b;
      const want = sizes ? (nd.depth ? `n/${D}` : 'n') : (nd.depth ? `cn${k === 1 ? '' : '^' + k}/${D ** k}` : `cn${k === 1 ? '' : '^' + k}`);
      assert.equal(lab, want, `node at depth ${nd.depth}: ${lab} ≠ ${want}`);
      if (nd.t.blank) { vals[nd.path] = want.replace('/', ' / '); blanks.push(nd.path); assert.notEqual(want, ex, 'the format example is not an answer'); }
    }
    // The example has the same shape as the answers.
    assert.ok(sizes ? /^n\/\d+$/.test(ex) : new RegExp(`^cn${k === 1 ? '' : '\\^' + k}/\\d+$`).test(ex), `example ${ex}`);
    // Shape: root with a kids; a = 2 full, a = 3 only the first child expanded.
    assert.equal(c.tree.kids.length, a);
    c.tree.kids.forEach((kid, i) => assert.equal(kid.kids.length, a === 2 || i === 0 ? a : 1));
    assert.ok(blanks.length >= a, 'at least level 2 is blank');
    assert.equal(T.fillMistakes(c.tree, vals).size, 0, 'typed answers (with spaces) grade as right');
    const wrong = { ...vals, [blanks[0]]: 'cn^9/7' };
    assert.equal(T.fillMistakes(c.tree, wrong).size, 1, 'a wrong blank is caught');
  }
});

// ─────────────── 2. measure ───────────────
test('gen-310-rt-measure: depth, leaves, ratio, level cost, dominance, Θ re-derived independently', () => {
  for (const c of cards.get('gen-310-rt-measure')) {
    const { a, b, k } = evenRec(c.prompt), kind = c.spec.kind;
    checkEvenRtree(c, a, b, k);
    const L0 = levelSum(a, b, k, 0).frac, L1 = levelSum(a, b, k, 1).frac;
    const dom = L1[0] * L0[1] < L0[0] * L1[1] ? 'root' : L1[0] * L0[1] === L0[0] * L1[1] ? 'equal' : 'leaves';
    const nIn = () => +c.prompt.match(/n = (\d+)/)[1];
    if (kind === 'depth') {
      assert.equal(divDepth(b ** 5, b), 5);
      assert.ok(ok(c, `log_${b} n`) && ok(c, `log${b}(n)`), c.answer);
      if (b === 2) assert.ok(ok(c, 'lg n'));
      assert.ok(!ok(c, `log_${a === b ? b + 1 : a} n`) || a === b, 'the number of calls is not the base');
    } else if (kind === 'depthN') assert.ok(ok(c, String(divDepth(nIn(), b))));
    else if (kind === 'leavesN') { const n = nIn(); assert.ok(ok(c, String(countLeaves(a, b, divDepth(n, b))))); }
    else if (kind === 'leaves') {
      const canon = powCanon(a, b);
      assert.ok(ok(c, canon), `${canon} not accepted; answer ${c.answer}`);
      // The canonical form, evaluated at n = b^h, equals the leaves counted on the tree.
      for (const h of [2, 3]) {
        const n = b ** h, e = Math.log(a) / Math.log(b);
        assert.ok(Math.abs(n ** e - countLeaves(a, b, h)) < 1e-6 * countLeaves(a, b, h));
      }
      if (a > 1) assert.ok(ok(c, `${a}^(log_${b} n)`));
      assert.ok(!ok(c, 'n^9'));
    } else if (kind === 'ratio') {
      const [P, Q] = bred(L1[0] * L0[1], L1[1] * L0[0]);
      assert.ok(ok(c, Q === 1n ? String(P) : `${P}/${Q}`), `ratio ${P}/${Q} vs ${c.answer}`);
      assert.ok(ok(c, String(Number(P) / Number(Q))), 'decimal');
    } else if (kind === 'levelCost') {
      const [P, Q] = bred(L1[0] * L0[1], L1[1] * L0[0]), f = `cn${k === 1 ? '' : '^' + k}`;
      const want = Q === 1n && P === 1n ? f : Q === 1n ? `${P}^i\\,${f}` : `(\\tfrac{${P}}{${Q}})^i\\,${f}`;
      assert.equal(strip(c.answer), want);
      // Level 2 obeys the same ratio (it is really (P/Q)^i), and no option has the same ratio.
      assert.deepEqual(levelSum(a, b, k, 2).frac, bred(P * P, Q * Q));
      for (const o of c.options) assert.notEqual(strip(o), want);
    } else if (kind === 'dominant') {
      assert.equal(c.answer, { root: 'The root level dominates', equal: 'Every level costs the same', leaves: 'The leaf level dominates' }[dom]);
    } else if (kind === 'theta') {
      const byTheSum = thetaByTheSum(a, b, k).name;
      assert.equal(byTheSum, dom, `the sum says ${byTheSum}, the tree says ${dom} for ${c.prompt}`);
      assert.ok(ok(c, thetaCanon(dom, a, b, k)), `${thetaCanon(dom, a, b, k)} not accepted; answer ${c.answer}`);
      for (const d of ['root', 'equal', 'leaves']) {
        if (d !== dom && thetaCanon(d, a, b, k) !== thetaCanon(dom, a, b, k)) assert.ok(!ok(c, thetaCanon(d, a, b, k)), `wrong class ${d} accepted`);
      }
    } else assert.fail(kind);
  }
});

// ─────────────── 3. uneven ───────────────
const SPLITS = new Set(['1/4|3/4', '1/5|4/5', '2/5|3/5']);
test('uneven trees: the depth formulas, full levels and the sandwich hold on the enumerated tree', () => {
  for (const [small, big] of [[[1, 4], [3, 4]], [[1, 5], [4, 5]], [[2, 5], [3, 5]]]) {
    for (const N of [100, 1000, 4096, 15625, 100000]) {
      const t = unevenTree(N, small, big);
      const lo = Math.log(N) / Math.log(small[1] / small[0]), hi = Math.log(N) / Math.log(big[1] / big[0]);
      const r = x => (Math.abs(x - Math.round(x)) < 1e-9 ? Math.round(x) : Math.ceil(x));
      assert.equal(t.minLeaf, r(lo), `shallowest leaf, N = ${N}`);
      assert.equal(t.maxLeaf, r(hi), `deepest leaf, N = ${N}`);
      t.levels.forEach((s, d) => {
        if (d < t.minLeaf) assert.ok(Math.abs(s - N) < 1e-6 * N, `complete level ${d} adds to N`);
        else assert.ok(s <= N * (1 + 1e-9), `level ${d} adds to at most N`);
      });
      assert.ok(t.levels.slice(t.minLeaf + 1).some(s => s < N * 0.999), 'deeper levels lose size');
      const total = t.levels.reduce((x, y) => x + y, 0);   // every node costs its size (c = 1)
      assert.ok(total >= N * lo, 'floor: T(N) ≥ N log_shallow N');
      assert.ok(total <= N * (hi + 2), 'ceiling: T(N) ≤ N (log_deep N + 2) (rounding of the last level)');
    }
  }
});

test('gen-310-rt-uneven: answers from the enumerated tree; only the three allowed splits', () => {
  for (const c of cards.get('gen-310-rt-uneven')) {
    const { small, big } = unevenRec(c.prompt), kind = c.spec.kind;
    assert.ok(SPLITS.has(`${small.join('/')}|${big.join('/')}`), `split ${small}|${big}`);
    assert.equal(small[0] * big[1] + big[0] * small[1], small[1] * big[1], 'pieces add to the whole');
    const shallowB = flip(small), deepB = flip(big);
    // rtree: costs, small piece left, level totals cn.
    const L = c.rtree.levels;
    assert.deepEqual(L.map(l => l.gap ? 'gap' : strip(l.sum)), ['cn', 'cn', 'gap', '< cn']);
    const cT = ([x, y]) => `\\tfrac{${x === 1 ? '' : x}cn}{${y}}`;
    assert.deepEqual(L[1].nodes.map(strip), [cT(small), cT(big)]);
    const prod = (u, v) => [u[0] * v[0], u[1] * v[1]];
    if (kind === 'fill') {
      for (const nd of T.layout(c.tree).nodes) {
        let s = [1, 1];
        for (const step of nd.path.split('.').slice(1)) s = prod(s, step === '0' ? small : big);
        assert.deepEqual(parseSize(nd.t.blank ? nd.t.answer : nd.t.label), s, `size at ${nd.path}`);
      }
      const ex = c.prompt.match(/Type like (\S+) or/)[1];
      assert.ok(/^\d+n\/\d+$/.test(ex));
    } else if (kind === 'shallow' || kind === 'deep') {
      assert.equal(strip(c.answer), logT(kind === 'shallow' ? shallowB : deepB));
      assert.ok(c.options.map(strip).includes(logT(kind === 'shallow' ? deepB : shallowB)), 'the other edge is a distractor');
    } else if (kind === 'shallowN' || kind === 'deepN') {
      const N = +c.prompt.match(/n = (\d+)/)[1], t = unevenTree(N, small, big);
      expectInt(c, kind === 'shallowN' ? t.minLeaf : t.maxLeaf);
    } else if (kind === 'levelsum') assert.ok(/add up to the parent/.test(c.answer) && c.answer.includes(`\\tfrac{${small[0] === 1 ? '' : small[0]}m}{${small[1]}}`));
    else if (kind === 'partial') assert.ok(c.answer.startsWith('At most'));
    else if (kind === 'lower') assert.equal(strip(c.answer), `T(n) \\ge cn\\,${logT(shallowB)}`);
    else if (kind === 'upper') assert.equal(strip(c.answer), `T(n) \\le cn\\,(${logT(deepB)} + 1)`);
    else if (kind === 'theta') { assert.ok(ok(c, 'Θ(n lg n)') && ok(c, 'n log n')); assert.ok(!ok(c, 'Θ(n)') && !ok(c, 'Θ(n^2)')); }
    else if (kind === 'const') {
      const deepest = /deepest leaf is at depth/.test(c.prompt), B = deepest ? deepB : shallowB;
      assert.ok(c.prompt.includes(logT(B)));
      const K = Math.log(2) / Math.log(B[0] / B[1]);
      assert.ok(ok(c, K.toFixed(2)), `K = ${K.toFixed(2)}, answer ${c.answer}`);
    } else assert.fail(kind);
  }
});
function expectInt(c, v) { assert.equal(c.type, 'typed'); assert.ok(ok(c, String(v)), `expected ${v}, answer ${c.answer}\n${c.prompt}`); }

// ─────────────── 4. the existing generator's numeric rtree ───────────────
test('gen-310-recursion-tree: rtree rows match the walked tree for its own n', () => {
  for (const c of cards.get('gen-310-recursion-tree')) {
    const { a, b, k, c: cc, n } = c.spec;
    assert.notEqual(b, 3);
    const cost = [], cnt = [];
    (function walk(size, d) {
      cnt[d] = (cnt[d] || 0) + 1;
      cost[d] = (cost[d] || 0) + (size === 1 ? 1 : cc * size ** k);
      if (size > 1) for (let t = 0; t < a; t++) walk(size / b, d + 1);
    })(n, 0);
    const h = cost.length - 1, L = c.rtree.levels;
    const rows = L.filter(l => !l.gap);
    for (let i = 0; i < 2; i++) assert.equal(+strip(rows[i].sum), cost[i], `depth ${i}`);
    assert.equal(+strip(rows[rows.length - 1].sum), cnt[h], 'leaf row');
    assert.equal(L.some(l => l.gap), h > 2);
    assert.ok(L.length <= 4, 'four rows fit under the answer');
    assert.ok(c.rtree.caption.includes(`= ${cost.reduce((x, y) => x + y, 0)}`), 'caption total');
  }
});

// ─────────────── academic integrity ───────────────
// Assignment 2 (graded) is a split into thirds. 1000 instances of every a2 generator: an uneven
// one may never contain any of these; an even one never has b = 3 or a division by 3.
const BANNED = ['/3', '2n/3', '\\frac{1}{3}', '\\frac{2}{3}', '\\tfrac{1}{3}', '\\tfrac{2}{3}', '3/2', 'log_{3/2}', '\\log_{3/2}'];
const EVEN_BANNED = [/\/3(?!\d)/, /\\t?frac\{[12]\}\{3\}/, /log_\{?3/, /log3/, /T\(n\/3\)/];
const allStrings = x => (typeof x === 'string' ? [x] : Array.isArray(x) ? x.flatMap(allStrings) : x && typeof x === 'object' ? Object.values(x).flatMap(allStrings) : []);
test('no a2 generator ever touches the graded split (1000 instances each)', () => {
  const tagged = G.all().filter(g => (g.assignment || []).includes('a2')).map(g => g.id).sort();
  assert.deepEqual(tagged, A2.slice().sort(), 'exactly these generators practise a2');
  for (const id of A2) {
    for (let s = 0; s < 1000; s++) {
      const c = G.instance(id, (Math.imul(s + 7, 40503) ^ 0x5bd1e995) >>> 0);
      const text = allStrings(c);
      const uneven = id === 'gen-310-rt-uneven';
      if (uneven) {
        assert.ok(c.spec.uneven);
        for (const t of text) for (const bad of BANNED) assert.ok(!t.includes(bad), `${id} contains "${bad}": ${t}`);
      } else {
        assert.notEqual(c.spec.b, 3, `${id}: b = 3`);
        for (const t of text) for (const bad of EVEN_BANNED) assert.ok(!bad.test(t), `${id} matches ${bad}: ${t}`);
      }
    }
  }
});
