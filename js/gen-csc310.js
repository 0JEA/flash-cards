// Generated practice problems for AUCSC 310 Algorithm Design & Analysis (M. Qasem). Each
// generator builds a NEW problem from the rng (different numbers, arrays, recurrences) and
// computes the answer with a solver in this file, so the student practises the procedure.
// Contract: js/generators.js. Tests: tests/gen-csc310.test.js re-solves every problem with
// separate code (and python3 + mpmath for growth rates and loop counts).
//
// Reader-facing text (prompt, why, mc options) writes math as inline LaTeX between single
// dollar signs (rendered by KaTeX in js/app.js). Typed/set answers, accept lists, order tiles,
// code blocks and data rows (arrays, hash tables) stay PLAIN: the student types those.
// Keep `why` short (about 350 characters): it has to fit with the prompt at 632×595.
//
// Conventions copied from the course notes (do not "fix" them to another textbook):
//   - Arrays are 1-based (A[1..n]) for heaps, quicksort, counting sort and binary search;
//     hash tables are 0-based (T[0..m-1]).
//   - PARTITION is Lomuto with the LAST element as pivot and the counter `smallerCounter`
//     (Lecure 7). Swap is called for every A[j] <= pivot, even when it swaps a cell with itself.
//   - Heaps: Left(i) = 2i, Right(i) = 2i + 1, Parent(i) = floor(i/2); Max-Heapify uses strict >.
//   - Master theorem exactly as in Master_Theorem.pdf / Lecure 6: a >= 1, b > 1, three cases,
//     Case 3 needs regularity. f(n) = n^(log_b a) lg n is in the GAP (Lecure 6, 2T(n/2) + n lg n).
//     (Master_Theorem.pdf's own gap example 2T(n/2) + n^2/log n is actually Case 3; not used.)
//   - Open addressing (worksheet): linear h(k,i) = (h'(k) + i) mod m; quadratic c1 = 0, c2 = 1;
//     double hashing h1 = k mod 13, h2 = 1 + (k mod 11); deleted slots become DEL tombstones.
//   - Binary search: the worksheet's iterative version, low = 1, high = n, mid = floor((low+high)/2).
//
//   gen-310-master          which case / Θ solution / n^(log_b a)
//   gen-310-recursion-tree  levels, nodes, per-level cost, leaves, exact total, Θ
//   gen-310-growth-order    order by growth; o / Θ / ω; true-or-false on O, Ω, Θ, o, ω
//   gen-310-loop-count      exact iteration count of a loop nest, and its Θ bound
//   gen-310-partition       Lomuto PARTITION: pivot index, array after, mid-trace, swaps
//   gen-310-heap            index arithmetic, MAX-HEAPIFY, BUILD-MAX-HEAP, extract, insert, increase-key, heapsort
//   gen-310-buildheap       leaves, heights, nodes per height, swaps in BuildHeap
//   gen-310-counting-sort   counting sort C arrays and output; radix sort passes
//   gen-310-hash            chaining, linear / quadratic / double hashing, probes, DEL, load factor
//   gen-310-binary-search   midpoints probed, iterations, return value, worst case
//   gen-310-insertion-count insertion sort shifts, while-tests t_j, best/worst/neither
//   gen-310-prove-bound     (c, n0) for O / Ω / Θ from the definition (pick one, or write the proof)
//   gen-310-compare-growth  o / Θ / ω from the ratio f/g
// Tagged assignment a1 (with a graph drawn from the instance's numbers): loop-count,
// growth-order, binary-search, insertion-count, prove-bound, compare-growth. Assignment 1 is
// graded on exponentials, factorials and c^(lg n) forms: those never appear in these six
// (the test rejects any exponent containing n and any factorial).
(function (FC) {
  'use strict';
  const G = FC.gen;
  if (!G) throw new Error('load js/generators.js before js/gen-csc310.js');
  const { int, pick, shuffle } = G;
  const DECK = 'csc310';
  const uniq = a => [...new Set(a)];
  const chance = (rng, p) => rng() < p;
  const sample = (rng, arr, k) => shuffle(rng, arr).slice(0, k);
  const src = file => `Generated practice (new problem each time); method from ${file} (AUCSC 310, M. Qasem)`;
  const fmt = a => '[' + a.join(', ') + ']';
  const M = s => '$' + s + '$'; // inline math
  const pairs = ps => ps.map(([x, y]) => `(${x},${y})`).join(' ');
  function weighted(rng, ps) {
    const total = ps.reduce((s, p) => s + p[1], 0);
    let r = rng() * total;
    for (const [k, w] of ps) { if ((r -= w) < 0) return k; }
    return ps[ps.length - 1][0];
  }
  function distinct(rng, k, lo, hi) {
    const all = []; for (let v = lo; v <= hi; v++) all.push(v);
    return sample(rng, all, k);
  }

  // ── Typed answer forms (plain text: the student types these) ──────────────────────────
  // grade.typed only folds whitespace and case, so every reasonable list spelling is accepted.
  function listAnswer(items) {
    const s = items.map(String), out = [];
    for (const sep of [', ', ',', ' ', ' , ', '; ', ';']) {
      const body = s.join(sep);
      for (const [l, r] of [['', ''], ['[', ']'], ['{', '}'], ['(', ')'], ['<', '>']]) out.push(l + body + r);
    }
    const u = uniq(out);
    return { answer: u[0], accept: u.slice(1) };
  }

  // Asymptotic classes n^e (lg n)^l. A term is { e, l, frac?: [num, den], irr?: [a, b] }:
  // irr means the exponent is log_b a and is irrational.
  const SUP = { 2: '²', 3: '³', 4: '⁴' };
  function nForms(t) {
    if (t.irr) {
      const [a, b] = t.irr, x = Math.log(a) / Math.log(b);
      const L = [`log_${b} ${a}`, `log${b} ${a}`, `log_${b}(${a})`, `log${b}(${a})`].concat(b === 2 ? [`lg ${a}`, `lg(${a})`] : []);
      return uniq(L.map(s => `n^(${s})`).concat(L.map(s => `n^${s}`), [`n^${x.toFixed(3)}`, `n^${x.toFixed(2)}`]));
    }
    const e = t.e;
    if (e === 0) return [];
    if (e === 1) return ['n'];
    if (e === 0.5) return ['sqrt n', '√n', 'sqrt(n)', 'n^0.5', 'n^(1/2)', 'n^1/2'];
    if (e === 1.5) return ['n^1.5', 'n^(3/2)', 'n^3/2', 'n√n', 'n sqrt n', 'n sqrt(n)'];
    if (Number.isInteger(e)) return [`n^${e}`].concat(SUP[e] ? ['n' + SUP[e]] : []);
    const [num, den] = t.frac;
    return [`n^(${num}/${den})`, `n^${num}/${den}`, `n^${e.toFixed(3)}`, `n^${e.toFixed(2)}`];
  }
  const LOGS = {
    1: ['lg n', 'log n', 'log2 n', 'log_2 n', 'lg(n)', 'log(n)', 'log2(n)'],
    2: ['lg^2 n', 'log^2 n', '(lg n)^2', '(log n)^2', 'lg² n', 'log² n', 'lg^2(n)', 'log^2(n)'],
  };
  function coreForms(t) {
    const N = nForms(t), Lg = LOGS[t.l] || [];
    if (!N.length && !Lg.length) return ['1'];
    if (!N.length) return Lg;
    if (!Lg.length) return N;
    const out = [];
    for (const a of N) for (const b of Lg) out.push(a + ' ' + b, a + '*' + b);
    return out;
  }
  function thetaAnswer(t, plain) {
    const all = [], cores = coreForms(t);
    if (plain) all.push(...cores);
    for (const c of cores) all.push(`Θ(${c})`, `theta(${c})`, `big theta(${c})`, c);
    // Also accept the no-space spelling ("nlgn"), unless that would glue two numbers together.
    const stripped = all.filter(s => !/\d\s+\d/.test(s)).map(s => s.replace(/\s+/g, ''));
    const u = uniq(all.concat(stripped));
    return { answer: u[0], accept: u.slice(1) };
  }
  const TYPE_THETA = 'Type it like Θ(n^2), Θ(n lg n), Θ(sqrt n) or Θ(n^(log_2 3)).';

  // ── LaTeX for the same terms (reader-facing) ──────────────────────────
  function nTex(t) {
    if (t.irr) return `n^{\\log_{${t.irr[1]}} ${t.irr[0]}}`;
    const e = t.e;
    if (e === 0) return '';
    if (e === 1) return 'n';
    if (e === 0.5) return '\\sqrt{n}';
    if (Number.isInteger(e) || e === 1.5) return `n^{${e}}`;
    return `n^{${t.frac[0]}/${t.frac[1]}}`;
  }
  function termTex(t) {
    const np = nTex(t), lg = t.l === 1 ? '\\lg n' : t.l === 2 ? '\\lg^2 n' : '';
    return [np, lg].filter(Boolean).join(' ') || '1';
  }
  const thetaTex = t => `\\Theta(${termTex(t)})`;

  // log_b a as a fraction [num, den] when it is rational (a^den = b^num), else null.
  function ratLog(a, b) {
    if (a === 1) return [0, 1];
    for (let y = 1; y <= 6; y++) for (let x = 1; x <= 24; x++) if (a ** y === b ** x) return [x, y];
    return null;
  }
  function critTerm(a, b, l = 0) {
    const r = ratLog(a, b);
    return r ? { e: r[0] / r[1], frac: r, l } : { e: Math.log(a) / Math.log(b), irr: [a, b], l };
  }
  const near = x => Math.abs(x - Math.round(x * 1000) / 1000) < 1e-9 ? String(Math.round(x * 1000) / 1000) : x.toFixed(3);
  const floorLog = (n, c) => { let t = 0, p = c; while (p <= n) { t++; p *= c; } return t; }; // largest t with c^t <= n

  // ═══════════════════════════ 1. Master theorem ═══════════════════════════
  // f(n) = coef · n^k · (lg n)^logf, logf ∈ {0, 1, -1}. k*2 is an integer.
  const K_SET = [0, 0.5, 1, 1.5, 2, 3];
  function fTex(f) {
    const np = nTex({ e: f.k });
    let core;
    if (f.logf === 0) core = np;
    else if (f.logf === 1) core = np ? np + ' \\lg n' : '\\lg n';
    else core = (np || '1') + '/\\lg n';
    if (!core) return String(f.coef);
    return (f.coef === 1 ? '' : String(f.coef)) + core;
  }
  const recTex = (a, b, f) => `T(n) = ${a === 1 ? '' : a}T(n/${b}) + ${fTex(f)}`;
  // Sign of k − log_b a, exactly: compare b^(2k) with a^2.
  const cmpExp = (k, a, b) => Math.sign(b ** (2 * k) - a * a);

  function solveMaster(a, b, f) {
    if (a < 1) return { kase: 'na', why: `The theorem needs ${M('a \\ge 1')}; here ${M('a = ' + a)}, so it does not apply.` };
    const s = cmpExp(f.k, a, b), crit = critTerm(a, b), p = crit.e;
    const step1 = `${M(`a = ${a},\\ b = ${b}`)}: ${M(`n^{\\log_{${b}} ${a}} ${crit.irr ? '\\approx n^{' + p.toFixed(3) + '}' : '= ' + termTex(crit)}`)}.`;
    if (s < 0) {
      return { kase: 1, ans: { ...crit, l: 0 }, why: `${step1} ${M('f(n) = ' + fTex(f))} is polynomially smaller (${M(`${near(f.k)} < ${near(p)}`)}, ${M('\\varepsilon \\approx ' + near(p - f.k))}). Case 1: ${M('T(n) = ' + thetaTex(crit))}.` };
    }
    if (s === 0 && f.logf === 0) {
      return { kase: 2, ans: { ...crit, l: 1 }, why: `${step1} ${M('f(n) = ' + fTex(f) + ' = \\Theta(n^{\\log_b a})')}. Case 2: ${M('T(n) = ' + thetaTex({ ...crit, l: 1 }))}.` };
    }
    if (s === 0) {
      return { kase: 'na', why: f.logf > 0
        ? `${step1} ${M('f(n)/n^{\\log_b a} = \\lg n')}: larger, but not by any ${M('n^{\\varepsilon}')}. That is the gap between Cases 2 and 3 (like ${M('2T(n/2) + n \\lg n')}), so the theorem does not apply.`
        : `${step1} ${M('n^{\\log_b a}/f(n) = \\lg n')}: smaller, but not by any ${M('n^{\\varepsilon}')}. That is the gap between Cases 1 and 2, so the theorem does not apply.` };
    }
    // s > 0 (logf is 0 or 1 here): Case 3, check regularity a f(n/b) <= c f(n).
    const bk = b ** f.k, c = a / bk;
    const cTex = Number.isInteger(bk) ? `\\tfrac{${a}}{${bk}}` : near(c);
    return { kase: 3, ans: { e: f.k, l: f.logf }, why: `${step1} ${M('f(n) = ' + fTex(f))} is polynomially larger (${M('\\varepsilon \\approx ' + near(f.k - p))}). Regularity: ${M(`${a}f(n/${b}) ${f.logf ? '\\le' : '='} ${cTex}\\,f(n)`)}, ${M('c < 1')} ✓. Case 3: ${M('T(n) = ' + thetaTex({ e: f.k, l: f.logf }))}.` };
  }

  function masterInstance(rng) {
    const target = weighted(rng, [[1, 3], [2, 3], [3, 3], ['gap', 1.5], ['aLess', 0.4]]);
    if (target === 'aLess') return { a: 0.5, b: pick(rng, [2, 3, 4]), f: { coef: 1, k: pick(rng, [1, 2]), logf: 0 } };
    for (let tries = 0; tries < 5000; tries++) {
      const a = pick(rng, [1, 2, 3, 4, 5, 6, 7, 8, 9, 16]), b = pick(rng, [2, 3, 4]);
      const crit = critTerm(a, b);
      let f;
      if (target === 2 || target === 'gap') {
        if (crit.irr || !K_SET.includes(crit.e)) continue;
        f = { coef: 1, k: crit.e, logf: target === 2 ? 0 : (crit.e > 0 && chance(rng, 0.35) ? -1 : 1) };
        if (target === 2) f.coef = f.k === 0 ? pick(rng, [1, 2, 5]) : pick(rng, [1, 1, 2, 3, 10]);
      } else {
        f = { coef: 1, k: pick(rng, K_SET), logf: chance(rng, 0.3) ? 1 : 0 };
        if (f.logf === 0) f.coef = f.k === 0 ? pick(rng, [1, 2, 5]) : pick(rng, [1, 1, 1, 2, 3, 5, 100]);
        const s = cmpExp(f.k, a, b);
        if ((target === 1 && s >= 0) || (target === 3 && s <= 0)) continue;
      }
      return { a, b, f };
    }
    throw new Error('master: no instance');
  }

  const CASE_OPT = { 1: 'Case 1', 2: 'Case 2', 3: 'Case 3', na: 'No case applies' };
  G.register({
    id: 'gen-310-master', deck: DECK, lecture: 'master', cat: 'Recurrences', sub: 'Master theorem',
    title: 'Solve a recurrence with the master theorem',
    make(rng) {
      const { a, b, f } = masterInstance(rng);
      const sol = solveMaster(a, b, f), rec = M(recTex(a, b, f));
      const kind = weighted(rng, [['case', 3], ['theta', 4], ['crit', a >= 1 ? 1.5 : 0]]);
      const spec = { gen: 'master', kind, a, b, f };
      const source = src('Master_Theorem.pdf and Lecure 6.pdf');
      if (kind === 'case') {
        const answer = CASE_OPT[sol.kase];
        return { type: 'mc', prompt: `${rec}\nWhich case of the master theorem applies? (As in the notes: ${M('a \\ge 1')}, ${M('b > 1')}; Case 3 also needs regularity.)`,
          answer, options: Object.values(CASE_OPT).filter(o => o !== answer), why: sol.why, source, spec };
      }
      if (kind === 'crit') {
        const t = critTerm(a, b);
        const { answer, accept } = t.e === 0 ? { answer: '1', accept: ['n^0', 'n^0 = 1', 'Θ(1)'] } : thetaAnswer(t, true);
        return { type: 'typed', prompt: `${rec}\nStep 1: what is ${M('n^{\\log_b a}')}? Type it like n^2, n^(3/2), or n^(log_2 3) when the exponent is irrational.`,
          answer, accept, why: sol.why, source, spec };
      }
      const prompt = `Solve ${rec} with the master theorem. ${TYPE_THETA} If it does not apply, type: does not apply`;
      if (sol.kase === 'na') {
        return { type: 'typed', prompt, answer: 'does not apply',
          accept: ["doesn't apply", 'not applicable', 'n/a', 'master theorem does not apply', 'no case applies', 'none', 'gap', 'it does not apply', 'cannot apply', "can't apply"],
          why: sol.why, source, spec };
      }
      return { type: 'typed', prompt, ...thetaAnswer(sol.ans), why: sol.why, source, spec };
    },
  });

  // ═══════════════════════════ 2. Recursion tree ═══════════════════════════
  // T(n) = a T(n/b) + c n^k, T(1) = 1, n = b^h. Depth i has a^i nodes of size n/b^i.
  function treeInstance(rng) {
    for (;;) {
      const a = pick(rng, [1, 2, 2, 3, 4, 4, 8, 9]), b = pick(rng, [2, 2, 3, 4]), k = pick(rng, [1, 1, 2]), c = int(rng, 1, 5);
      const h = int(rng, 3, b === 2 ? 6 : b === 3 ? 5 : 4), n = b ** h;
      let total = a ** h;
      for (let i = 0; i < h; i++) total += a ** i * c * (n / b ** i) ** k;
      if (total < 1e9) return { a, b, k, c, h, n, total };
    }
  }
  G.register({
    id: 'gen-310-recursion-tree', deck: DECK, lecture: '5', cat: 'Recurrences', sub: 'Recursion trees',
    title: 'Read a recursion tree: levels, per-level cost, total',
    make(rng) {
      const { a, b, k, c, h, n, total } = treeInstance(rng);
      const recT = `T(n) = ${a === 1 ? '' : a}T(n/${b}) + ${c === 1 ? '' : c}n${k === 1 ? '' : '^' + k}`;
      const head = `Recursion tree for ${M(recT)}, ${M('T(1) = 1')}, with ${M(`n = ${n} = ${b}^{${h}}`)}.`;
      const nodeCost = i => c * (n / b ** i) ** k, levelCost = i => a ** i * nodeCost(i);
      const costs = []; for (let i = 0; i < h; i++) costs.push(levelCost(i));
      const why = `Height ${M(`\\log_{${b}} ${n} = ${h}`)}, so ${h + 1} levels. Depth ${M('i')} has ${M(a + '^i')} nodes costing ${M(`${c === 1 ? '' : c}(n/${b}^i)${k === 1 ? '' : '^' + k}`)} each. Level costs: ${costs.join(', ')}; leaves: ${M(`${a}^{${h}} = ${a ** h}`)}. Total ${total}.`;
      const ratio = a / b ** k;
      const kind = weighted(rng, [['levels', 1], ['height', 0.6], ['nodes', 1], ['nodeCost', 1], ['levelCost', 1.4], ['leaves', 1], ['total', 1.4], ['theta', 1.2], ['dominant', 1]]);
      const spec = { gen: 'tree', kind, a, b, k, c, n };
      const source = src('Lecure 5.pdf (recursion trees)');
      const typed = (q, ans) => ({ type: 'typed', prompt: `${head}\n${q}`, answer: String(ans), why, source, spec });
      if (kind === 'levels') return typed('How many levels does the tree have, counting the root level and the leaf level?', h + 1);
      if (kind === 'height') return typed('What is the height of the tree (the depth of the leaves)?', h);
      if (kind === 'leaves') return typed('How many leaves does the tree have?', a ** h);
      if (kind === 'total') return typed('What is the exact total cost T(n), leaves included?', total);
      const i = int(rng, 1, h - 1);
      spec.i = i;
      if (kind === 'nodes') return typed(`How many nodes are at depth ${i} (the root is depth 0)?`, a ** i);
      if (kind === 'nodeCost') return typed(`What does ONE node at depth ${i} cost (its non-recursive work; the root is depth 0)?`, nodeCost(i));
      if (kind === 'levelCost') return typed(`What is the total cost of all nodes at depth ${i} (the root is depth 0)?`, levelCost(i));
      const dom = ratio < 1 ? 'root' : ratio === 1 ? 'equal' : 'leaves';
      const t = dom === 'root' ? { e: k, l: 0 } : dom === 'equal' ? { e: k, l: 1 } : critTerm(a, b);
      const domWhy = `Each level costs ${M(`a/b^k = ${a}/${b ** k}`)} times the one above${ratio === 1 ? ': every level costs the same, and there are about ' + M('\\lg n') + ' levels' : ratio < 1 ? ': costs shrink geometrically, so the root dominates' : ': costs grow geometrically, so the leaves dominate'}. ${M('T(n) = ' + thetaTex(t))}.`;
      if (kind === 'dominant') {
        const OPT = { root: 'Root level dominates', equal: 'All levels cost the same', leaves: 'Leaf level dominates' };
        return { type: 'mc', prompt: `${M(recT)}\nIn its recursion tree, how do the level costs behave as you go down?`,
          answer: OPT[dom], options: Object.values(OPT).filter(o => o !== OPT[dom]), why: domWhy, source, spec };
      }
      return { type: 'typed', prompt: `${M(recT)}\nUse the recursion tree to give T(n) in Θ form. ${TYPE_THETA}`,
        ...thetaAnswer(t), why: domWhy, source, spec };
    },
  });

  // ═══════════════════════════ 3. Growth of functions ═══════════════════════════
  // s: plain (order tiles, spec), t: LaTeX, f: the function itself (for the graph).
  // key compares lexicographically: [poly exponent, lg power, lg lg power].
  // Assignment 1 is graded on exponentials, factorials and c^(lg n) forms, so this
  // a1-tagged generator uses only polylog and polynomial functions.
  const L2 = Math.log2;
  const FUN = [
    { s: '1', t: '1', key: [0, 0, 0], f: () => 1 },
    { s: 'lg lg n', t: '\\lg\\lg n', key: [0, 0, 1], f: n => L2(L2(n)) },
    { s: 'lg n', t: '\\lg n', key: [0, 1, 0], f: n => L2(n) },
    { s: 'lg^2 n', t: '\\lg^2 n', key: [0, 2, 0], f: n => L2(n) ** 2 },
    { s: 'n^(1/3)', t: 'n^{1/3}', key: [1 / 3, 0, 0], f: n => Math.cbrt(n) },
    { s: '√n', t: '\\sqrt{n}', key: [0.5, 0, 0], f: n => Math.sqrt(n) },
    { s: 'n/lg n', t: 'n/\\lg n', key: [1, -1, 0], f: n => n / L2(n) },
    { s: 'n', t: 'n', key: [1, 0, 0], f: n => n },
    { s: 'n lg n', t: 'n \\lg n', key: [1, 1, 0], f: n => n * L2(n) },
    { s: 'n^1.5', t: 'n^{1.5}', key: [1.5, 0, 0], f: n => n ** 1.5 },
    { s: 'n^2', t: 'n^2', key: [2, 0, 0], f: n => n * n },
    { s: 'n^2 lg n', t: 'n^2 \\lg n', key: [2, 1, 0], f: n => n * n * L2(n) },
    { s: 'n^3', t: 'n^3', key: [3, 0, 0], f: n => n ** 3 },
  ];
  // Same Θ class as a pool function, written differently (cls: why it is that class).
  const VARIANT = [
    { s: '5n^2 + 3n', t: '5n^2 + 3n', of: 'n^2', f: n => 5 * n * n + 3 * n },
    { s: 'n^2/10', t: 'n^2/10', of: 'n^2', f: n => n * n / 10 },
    { s: '100n + 7', t: '100n + 7', of: 'n', f: n => 100 * n + 7 },
    { s: 'lg(n^3)', t: '\\lg(n^3)', of: 'lg n', cls: '3\\lg n', f: n => 3 * L2(n) },
    { s: 'log_3 n', t: '\\log_3 n', of: 'lg n', cls: '\\lg n/\\lg 3', f: n => L2(n) / L2(3) },
    { s: '3n lg n + n', t: '3n \\lg n + n', of: 'n lg n', f: n => 3 * n * L2(n) + n },
    { s: '√n + 10', t: '\\sqrt{n} + 10', of: '√n', f: n => Math.sqrt(n) + 10 },
    { s: 'n^3 + 1000n^2', t: 'n^3 + 1000n^2', of: 'n^3', f: n => n ** 3 + 1000 * n * n },
    { s: '0.3n^2 + 10n + 20', t: '0.3n^2 + 10n + 20', of: 'n^2', f: n => 0.3 * n * n + 10 * n + 20 },
  ];
  const byS = new Map(FUN.map(f => [f.s, f]));
  for (const v of VARIANT) byS.set(v.s, { ...v, key: byS.get(v.of).key });
  function cmpKey(x, y) { for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) return x[i] < y[i] ? -1 : 1; return 0; }
  const cmpFun = (f, g) => cmpKey(byS.get(f).key, byS.get(g).key);
  // "f = 3 lg n = Θ(lg n)" for a variant, plain "f = n^2" for a pool function.
  const classTex = s => { const x = byS.get(s); return x.of ? `${x.t}${x.cls ? ' = ' + x.cls : ''} = \\Theta(${byS.get(x.of).t})` : x.t; };
  const RULE = `Powers of ${M('\\lg n')} lose to any ${M('n^{\\varepsilon}')}; polynomials compare by exponent.`;
  // Graph of these functions against m = lg n (n = 2^m), log scale, starting where their
  // order is already the final one (checked on a fine grid up to m = 160).
  function growthGraph(fs) {
    const val = (s, m) => byS.get(s).f(2 ** m);
    let last = 2;
    for (let m = 2; m <= 160; m += 0.25) {
      for (const a of fs) for (const b of fs) {
        if (cmpFun(a, b) < 0 && !(val(a, m) < val(b, m))) last = m;
      }
    }
    const m0 = Math.ceil(last + 1), m1 = m0 + Math.max(12, m0);
    return { x: [m0, m1], logY: true, xLabel: 'lg n', yLabel: 'value',
      curves: fs.map((s, i) => ({ label: M(byS.get(s).t), f: m => val(s, m), tone: 'abc'[i] })),
      caption: `Across ${M('\\lg n')}, up log scale: from ${M('n = 2^{' + m0 + '}')} on the order never changes.` };
  }
  const REL = {
    O: { tex: 'O', t: c => c <= 0, like: 'a \\le b' }, 'Ω': { tex: '\\Omega', t: c => c >= 0, like: 'a \\ge b' }, 'Θ': { tex: '\\Theta', t: c => c === 0, like: 'a = b' },
    o: { tex: 'o', t: c => c < 0, like: 'a < b' }, 'ω': { tex: '\\omega', t: c => c > 0, like: 'a > b' },
  };
  G.register({
    id: 'gen-310-growth-order', deck: DECK, lecture: '3', cat: 'Asymptotics', sub: 'Growth of functions', assignment: ['a1'],
    title: 'Compare and order functions by growth rate',
    make(rng) {
      const kind = weighted(rng, [['order', 3], ['rel3', 2], ['tf', 2.5]]);
      const source = src('Lecture 3.pdf (growth of functions, O, Ω, Θ, o, ω)');
      if (kind === 'order') {
        const fs = sample(rng, FUN, 3).map(f => f.s);
        const sorted = fs.slice().sort(cmpFun);
        return { type: 'order', prompt: `Order by growth rate, slowest-growing first: ${fs.map(s => M(byS.get(s).t)).join(', ')}`,
          answer: sorted, why: `${M(sorted.map(s => byS.get(s).t).join(' \\ll '))}. ${RULE}`, source, spec: { gen: 'growth', kind, fs },
          graph: growthGraph(sorted) };
      }
      let f, g;
      do {
        const pool = FUN.map(x => x.s).concat(VARIANT.map(v => v.s));
        f = pick(rng, pool);
        if (chance(rng, 0.3)) {
          const same = [...byS.values()].filter(x => cmpFun(x.s, f) === 0 && x.s !== f).map(x => x.s);
          g = same.length ? pick(rng, same) : pick(rng, pool);
        } else g = pick(rng, pool);
      } while (f === g);
      const c = cmpFun(f, g), ft = byS.get(f).t, gt = byS.get(g).t;
      const explain = `${M('f = ' + classTex(f))}, ${M('g = ' + classTex(g))}. ` +
        (c === 0 ? `${M('f/g')} tends to a constant: ${M('f = \\Theta(g)')}, so ${M('O')} and ${M('\\Omega')} hold; ${M('o')}, ${M('\\omega')} fail.`
          : c < 0 ? `${M('f/g \\to 0')}: ${M('f = o(g)')}, so ${M('O')} holds; ${M('\\Theta')}, ${M('\\Omega')}, ${M('\\omega')} fail.`
            : `${M('f/g \\to \\infty')}: ${M('f = \\omega(g)')}, so ${M('\\Omega')} holds; ${M('\\Theta')}, ${M('O')}, ${M('o')} fail.`);
      const spec = { gen: 'growth', kind, f, g, ft, gt };
      const graph = growthGraph(c <= 0 ? [f, g] : [g, f]);
      if (kind === 'rel3') {
        const OPT = { '-1': M('f(n) = o(g(n))'), 0: M('f(n) = \\Theta(g(n))'), 1: M('f(n) = \\omega(g(n))') };
        const answer = OPT[c];
        return { type: 'mc', prompt: `${M('f(n) = ' + ft)}, ${M('g(n) = ' + gt)}.\nWhich statement is true?`, answer,
          options: Object.values(OPT).filter(o => o !== answer), why: `${explain} ${RULE}`, source, spec, graph };
      }
      const r = pick(rng, Object.keys(REL));
      spec.rel = r;
      const holds = REL[r].t(c);
      return { type: 'mc', prompt: `True or false: ${M(`${ft} = ${REL[r].tex}(${gt})`)}`, answer: holds ? 'Yes, true' : 'No, false',
        options: [holds ? 'No, false' : 'Yes, true'], why: `${M(REL[r].tex)} is like ${M(REL[r].like)}. ${explain}`, source, spec, graph };
    },
  });

  // ═══════════════════════════ 4. Counting loop iterations ═══════════════════════════
  // Pseudocode in the Lecture 2 style (plain code). count(n) is a closed form (the test runs the code).
  const LOOPS = [
    { id: 'square', theta: { e: 2, l: 0 }, code: () => ['for i = 1 to n', '    for j = 1 to n', '        count = count + 1'],
      count: n => n * n, explain: n => `${M('n')} outer × ${M('n')} inner: ${M(`${n} \\cdot ${n} = ${n * n}`)}. ${M('\\Theta(n^2)')}.` },
    { id: 'tri', theta: { e: 2, l: 0 }, code: () => ['for i = 1 to n', '    for j = 1 to i', '        count = count + 1'],
      count: n => n * (n + 1) / 2, explain: n => `Inner loop runs ${M('i')} times: ${M(`1 + 2 + \\dots + n = \\tfrac{n(n+1)}{2} = \\tfrac{${n} \\cdot ${n + 1}}{2} = ${n * (n + 1) / 2}`)}. ${M('\\Theta(n^2)')}.` },
    { id: 'tri-strict', theta: { e: 2, l: 0 }, code: () => ['for i = 1 to n', '    for j = i + 1 to n', '        count = count + 1'],
      count: n => n * (n - 1) / 2, explain: n => `Inner loop runs ${M('n - i')} times: ${M(`(n-1) + \\dots + 1 + 0 = \\tfrac{n(n-1)}{2} = \\tfrac{${n} \\cdot ${n - 1}}{2} = ${n * (n - 1) / 2}`)}. ${M('\\Theta(n^2)')}.` },
    { id: 'const-inner', theta: { e: 1, l: 0 }, params: rng => ({ c: int(rng, 3, 9) }),
      code: p => ['for i = 1 to n', `    for j = 1 to ${p.c}`, '        count = count + 1'],
      count: (n, p) => n * p.c, explain: (n, p) => `The inner loop is a constant ${p.c}: ${M(`${p.c} \\cdot ${n} = ${n * p.c}`)}. A constant inner loop adds no factor of ${M('n')}: ${M('\\Theta(n)')}.` },
    { id: 'double', theta: { e: 0, l: 1 }, params: rng => ({ c: pick(rng, [2, 2, 3]) }),
      code: p => ['i = 1', 'while i <= n', '    count = count + 1', `    i = i * ${p.c}`],
      count: (n, p) => floorLog(n, p.c) + 1,
      explain: (n, p) => `${M('i = 1, ' + p.c + ', ' + p.c ** 2 + ', \\dots \\le ' + n)}: ${M(`\\lfloor \\log_{${p.c}} ${n} \\rfloor + 1 = ${floorLog(n, p.c) + 1}`)} iterations. ${M('\\Theta(\\lg n)')}.` },
    { id: 'n-log', theta: { e: 1, l: 1 }, code: () => ['for i = 1 to n', '    j = 1', '    while j <= n', '        count = count + 1', '        j = j * 2'],
      count: n => n * (floorLog(n, 2) + 1), explain: n => `Doubling ${M('j')} runs ${M(`\\lfloor \\lg ${n} \\rfloor + 1 = ${floorLog(n, 2) + 1}`)} times, for each of the ${n} values of ${M('i')}: ${M(`${n} \\cdot ${floorLog(n, 2) + 1} = ${n * (floorLog(n, 2) + 1)}`)}. ${M('\\Theta(n \\lg n)')}.` },
    { id: 'halving-sum', theta: { e: 1, l: 0 }, code: () => ['i = n', 'while i >= 1', '    for j = 1 to i', '        count = count + 1', '    i = floor(i / 2)'],
      count: n => { let s = 0; for (let i = n; i >= 1; i = Math.floor(i / 2)) s += i; return s; },
      explain: n => { const t = []; for (let i = n; i >= 1; i = Math.floor(i / 2)) t.push(i); return `The inner loop runs ${M('i')} times for ${M('i')} = ${t.join(', ')}: ${t.reduce((x, y) => x + y, 0)}. ${M('n + n/2 + \\dots < 2n')}: ${M('\\Theta(n)')}.`; } },
    { id: 'cubic', theta: { e: 3, l: 0 }, code: () => ['for i = 1 to n', '    for j = 1 to n', '        for k = 1 to j', '            count = count + 1'],
      count: n => n * n * (n + 1) / 2, explain: n => `For each ${M('i')}: ${M(`1 + \\dots + n = \\tfrac{n(n+1)}{2} = ${n * (n + 1) / 2}`)}; times ${n} values of ${M('i')}: ${n * n * (n + 1) / 2}. ${M('\\Theta(n^3)')}.` },
    { id: 'sqrt', theta: { e: 0.5, l: 0 }, code: () => ['i = 1', 'while i * i <= n', '    count = count + 1', '    i = i + 1'],
      count: n => Math.floor(Math.sqrt(n + 0.5)), explain: n => `Runs for ${M('i = 1, 2, \\dots')} while ${M('i^2 \\le ' + n)}: ${M(`\\lfloor \\sqrt{${n}} \\rfloor = ${Math.floor(Math.sqrt(n + 0.5))}`)} times. ${M('\\Theta(\\sqrt{n})')}.` },
    { id: 'step', theta: { e: 1, l: 0 }, params: rng => ({ c: int(rng, 2, 5) }),
      code: p => ['i = 0', 'while i < n', '    count = count + 1', `    i = i + ${p.c}`],
      count: (n, p) => Math.ceil(n / p.c), explain: (n, p) => `${M(`i = 0, ${p.c}, ${2 * p.c}, \\dots < ${n}`)}: ${M(`\\lceil ${n}/${p.c} \\rceil = ${Math.ceil(n / p.c)}`)} iterations. Still ${M('\\Theta(n)')}.` },
    { id: 'squares', theta: { e: 3, l: 0 }, code: () => ['for i = 1 to n', '    for j = 1 to i * i', '        count = count + 1'],
      count: n => n * (n + 1) * (2 * n + 1) / 6, explain: n => `Inner loop runs ${M('i^2')} times: ${M(`1^2 + \\dots + n^2 = \\tfrac{n(n+1)(2n+1)}{6} = ${n * (n + 1) * (2 * n + 1) / 6}`)}. ${M('\\Theta(n^3)')}.` },
    { id: 'doubling-from-i', theta: { e: 1, l: 0 }, code: () => ['for i = 1 to n', '    j = i', '    while j <= n', '        count = count + 1', '        j = j * 2'],
      count: n => { let s = 0; for (let i = 1; i <= n; i++) s += floorLog(Math.floor(n / i), 2) + 1; return s; },
      explain: n => { let s = 0; for (let i = 1; i <= n; i++) s += floorLog(Math.floor(n / i), 2) + 1; return `For each ${M('i')} the while loop runs ${M('\\lfloor \\lg(n/i) \\rfloor + 1')} times: ${s} in all. Half the ${M('i')} give 1, a quarter give 2, …: about ${M('2n')}, so ${M('\\Theta(n)')}.`; } },
  ];
  // Graph: one bar per outer-loop value (its inner-loop runs), or one bar per iteration of a
  // single while loop (the value of i then), plus the matching formula as a curve.
  function loopGraph(id, n, p, total) {
    const range = (a, b) => Array.from({ length: b - a + 1 }, (_, k) => a + k);
    const outer = (h, f, label) => ({ x: [0.5, n + 0.5], xLabel: 'i', yLabel: 'inner runs',
      bars: { label: 'inner-loop runs for this i', tone: 'b', values: range(1, n).map(i => [i, h(i)]) },
      curves: [{ label, f, tone: 'a' }], caption: `The bars add up to count ${M('= ' + total)}.` });
    const lgn = floorLog(n, 2) + 1;
    if (id === 'square') return outer(() => n, () => n, M('n = ' + n) + ' each');
    if (id === 'tri') return outer(i => i, x => x, M('i') + ' runs');
    if (id === 'tri-strict') return outer(i => n - i, x => n - x, M('n - i') + ' runs');
    if (id === 'const-inner') return outer(() => p.c, () => p.c, M(String(p.c)) + ' runs');
    if (id === 'n-log') return outer(() => lgn, () => lgn, M('\\lfloor \\lg n \\rfloor + 1 = ' + lgn));
    if (id === 'cubic') return outer(() => n * (n + 1) / 2, () => n * (n + 1) / 2, M('n(n+1)/2') + ' each');
    if (id === 'squares') return outer(i => i * i, x => x * x, M('i^2') + ' runs');
    if (id === 'doubling-from-i') return outer(i => floorLog(Math.floor(n / i), 2) + 1, x => L2(n / x) + 1, M('\\lg(n/i) + 1'));
    // single while loops: the value of i at each iteration k
    let vals;
    if (id === 'halving-sum') { vals = []; for (let i = n; i >= 1; i = Math.floor(i / 2)) vals.push(i); }
    else if (id === 'double') { vals = []; for (let i = 1; i <= n; i *= p.c) vals.push(i); }
    else if (id === 'sqrt') vals = range(1, Math.floor(Math.sqrt(n + 0.5))).map(i => i * i);
    else vals = range(0, Math.ceil(n / p.c) - 1).map(k => k * p.c);
    const lab = id === 'halving-sum' ? 'inner runs ($i$) on this pass' : id === 'sqrt' ? M('i^2') + ' this iteration' : 'value of ' + M('i') + ' this iteration';
    return { x: [0.5, vals.length + 0.5], xLabel: 'iteration', yLabel: id === 'halving-sum' ? 'inner runs' : 'value',
      bars: { label: lab, tone: 'b', values: vals.map((v, k) => [k + 1, v]) },
      curves: [{ label: M('n = ' + n) + (id === 'halving-sum' ? '' : ' (loop stops above)'), f: () => n, tone: 'c' }],
      caption: id === 'halving-sum' ? `Each pass halves ${M('i')}; the bars add up to ${M(String(total))}.` : `${vals.length} bars: count ${M('= ' + total)}.` };
  }
  G.register({
    id: 'gen-310-loop-count', deck: DECK, lecture: '2', cat: 'Asymptotics', sub: 'Counting operations', assignment: ['a1'],
    title: 'Count loop iterations exactly, then bound them with Θ',
    make(rng) {
      const L = pick(rng, LOOPS), p = L.params ? L.params(rng) : {};
      const n = L.id === 'cubic' || L.id === 'squares' ? int(rng, 4, 12) : L.id === 'doubling-from-i' ? int(rng, 5, 16) : int(rng, 5, 40);
      const code = ['count = 0'].concat(L.code(p)).join('\n');
      const kind = chance(rng, 0.6) ? 'count' : 'theta';
      const spec = { gen: 'loop', kind, tpl: L.id, n, p };
      const graph = loopGraph(L.id, n, p, L.count(n, p));
      const source = src('Lecture 2.pdf and Lecture 3.pdf (counting operations, Θ)');
      if (kind === 'count') {
        return { type: 'typed', prompt: `After this fragment runs with ${M('n = ' + n)}, what is the value of count?`, code,
          answer: String(L.count(n, p)), why: L.explain(n, p), source, spec, graph };
      }
      return { type: 'typed', prompt: `How often does count = count + 1 run, in Θ form? (e.g. Θ(n^2), Θ(n lg n), Θ(sqrt n))`, code,
        ...thetaAnswer(L.theta), why: L.explain(n, p), source, spec, graph };
    },
  });

  // ═══════════════════════════ 5. Quicksort PARTITION (Lomuto, last element pivot) ═══════════════════════════
  function partitionTrace(A0) {
    const A = [null].concat(A0), n = A0.length, pivot = A[n];
    let sc = 0;
    const hits = [], swaps = [], after = [];
    for (let j = 1; j <= n - 1; j++) {
      if (A[j] <= pivot) { sc++; hits.push(j); swaps.push([sc, j]); [A[sc], A[j]] = [A[j], A[sc]]; }
      after[j] = A.slice(1);
    }
    [A[sc + 1], A[n]] = [A[n], A[sc + 1]];
    const q = sc + 1;
    const why = `pivot ${M('= A[' + n + '] = ' + pivot)}. ${M('A[j] \\le ' + pivot)} at ${M('j')} = ${hits.join(', ') || 'none'}, each bumping smallerCounter and swapping: ${pairs(swaps) || 'none'}. Final swap (${q},${n}) gives ${fmt(A.slice(1))}; returns ${M('q = ' + q)}.`;
    return { q, result: A.slice(1), after, swaps: swaps.length + 1, why };
  }
  G.register({
    id: 'gen-310-partition', deck: DECK, lecture: '7', cat: 'Sorting', sub: 'Quicksort partition',
    title: 'Trace one PARTITION step of quicksort',
    make(rng) {
      const n = int(rng, 6, 9);
      const A = distinct(rng, n, 1, 60);
      if (chance(rng, 0.25)) A[int(rng, 0, n - 2)] = A[n - 1]; // a duplicate of the pivot: tests "≤"
      const tr = partitionTrace(A);
      const kind = weighted(rng, [['q', 1], ['array', 1.5], ['midway', 1], ['swaps', 0.7], ['sizes', 0.6]]);
      const head = `PARTITION(A, 1, ${n}) as in the notes (pivot = A[end]; Swap for every ${M('A[j] \\le')} pivot) on\nA = ${fmt(A)}`;
      const spec = { gen: 'partition', kind, A };
      const source = src('Lecure 7 (1).pdf (QUICKSORT and PARTITION)');
      const base = { why: tr.why, source, spec };
      const ARR = 'Give comma-separated values, A[1] first.';
      if (kind === 'q') return { type: 'typed', prompt: `${head}\nWhat index does PARTITION return (the pivot's final position, 1-based)?`, answer: String(tr.q), ...base };
      if (kind === 'array') return { type: 'typed', prompt: `${head}\nWhat is A after PARTITION returns? ${ARR}`, ...listAnswer(tr.result), ...base };
      if (kind === 'swaps') return { type: 'typed', prompt: `${head}\nHow many times is Swap called in total (including swaps of a cell with itself and the final pivot swap)?`, answer: String(tr.swaps), ...base, why: `${tr.why} That is ${tr.swaps} Swap calls.` };
      if (kind === 'sizes') return { type: 'typed', prompt: `${head}\nQUICKSORT then recurses on A[1..q−1] and A[q+1..${n}]. How many elements does each part have? Answer as: left, right`, ...listAnswer([tr.q - 1, n - tr.q]), ...base };
      const j = int(rng, 2, n - 2);
      spec.j = j;
      return { type: 'typed', prompt: `${head}\nWhat is A right after the for-loop iteration ${M('j = ' + j)} finishes? ${ARR}`,
        ...listAnswer(tr.after[j]), ...base, why: `After ${M('j = ' + j)}: ${fmt(tr.after[j])}. ${tr.why}` };
    },
  });

  // ═══════════════════════════ 6. Heaps (1-based, max-heap) ═══════════════════════════
  const left = i => 2 * i, right = i => 2 * i + 1, parent = i => Math.floor(i / 2);
  // MAX-HEAPIFY on H (H[0] unused) with heap size hs; returns the swapped index pairs.
  function heapify(H, i, hs) {
    const sw = [];
    for (;;) {
      const l = left(i), r = right(i);
      let largest = l <= hs && H[l] > H[i] ? l : i;
      if (r <= hs && H[r] > H[largest]) largest = r;
      if (largest === i) return sw;
      [H[i], H[largest]] = [H[largest], H[i]];
      sw.push([i, largest]);
      i = largest;
    }
  }
  // BUILD-MAX-HEAP down to index `stop`; returns the heap and a short per-i swap summary.
  function buildHeap(A, stop = 1) {
    const H = [null].concat(A), n = A.length, parts = [];
    let total = 0;
    for (let i = Math.floor(n / 2); i >= stop; i--) {
      const sw = heapify(H, i, n);
      total += sw.length;
      if (sw.length) parts.push(`i=${i}: ${pairs(sw)}`);
    }
    const why = `Max-Heapify for ${M('i = ' + Math.floor(n / 2))} down to ${stop}; swaps ${parts.length ? parts.join('; ') : 'none'} (others: no swap).`;
    return { H, total, why };
  }
  G.register({
    id: 'gen-310-heap', deck: DECK, lecture: 'heap', cat: 'Heaps & priority queues', sub: 'Heap operations',
    title: 'Max-heap operations on an array (1-based)',
    make(rng) {
      const kind = weighted(rng, [['index', 1.2], ['heapify', 1.2], ['build', 1.2], ['extract', 1.2], ['insert', 1.2], ['increase', 1], ['heapsort', 0.8]]);
      const source = src('Heap-HeapSort-Priority Queue.pdf');
      const ARR = 'Give comma-separated values, A[1] first.';
      if (kind === 'index') {
        const n = int(rng, 9, 31), which = pick(rng, ['Left', 'Right', 'Parent']);
        const i = which === 'Parent' ? int(rng, 2, n) : int(rng, 1, Math.floor((n - 1) / 2));
        const ans = which === 'Left' ? left(i) : which === 'Right' ? right(i) : parent(i);
        const expr = which === 'Left' ? `2 \\cdot ${i}` : which === 'Right' ? `2 \\cdot ${i} + 1` : `\\lfloor ${i}/2 \\rfloor`;
        return { type: 'typed', prompt: `A heap is stored in A[1..${n}] (root at A[1]). What is ${which}(${i}), the index of node ${i}'s ${which === 'Parent' ? 'parent' : which.toLowerCase() + ' child'}?`,
          answer: String(ans), why: `${M('\\text{Left}(i) = 2i')}, ${M('\\text{Right}(i) = 2i+1')}, ${M('\\text{Parent}(i) = \\lfloor i/2 \\rfloor')}. ${M(`\\text{${which}}(${i}) = ${expr} = ${ans}`)}.`,
          source, spec: { gen: 'heap', kind, n, i, which } };
      }
      const n = int(rng, 7, 11);
      const A = distinct(rng, n, 10, 99); // values from 10 up, so 1..9 are free for a lowered key
      const spec = { gen: 'heap', kind, A };
      if (kind === 'build') {
        const r = buildHeap(A);
        return { type: 'typed', prompt: `Run BUILD-MAX-HEAP on A = ${fmt(A)}. What is A afterwards? ${ARR}`,
          ...listAnswer(r.H.slice(1)), why: `Leaves are A[${Math.floor(n / 2) + 1}..${n}]. ${r.why}`, source, spec };
      }
      const H = buildHeap(A).H, heap = H.slice(1); // a valid max-heap to start from
      spec.A = heap;
      if (kind === 'heapify') {
        // Break the heap property at one internal node i by lowering its key; subtrees stay heaps.
        const i = int(rng, 1, Math.floor(n / 2));
        const kids = [left(i), right(i)].filter(c => c <= n).map(c => H[c]);
        const used = new Set(heap), cands = [];
        for (let v = 1; v < Math.min(...kids); v++) if (!used.has(v)) cands.push(v);
        const B = H.slice();
        B[i] = pick(rng, cands);
        const start = B.slice(1);
        const sw = heapify(B, i, n);
        spec.A = start; spec.i = i;
        return { type: 'typed', prompt: `A = ${fmt(start)}. The subtrees of node ${i} are max-heaps. Run MAX-HEAPIFY(A, ${i}). What is A afterwards? ${ARR}`,
          ...listAnswer(B.slice(1)), why: `${M(`A[${i}] = ${start[i - 1]}`)} is smaller than a child, so it sinks, each time swapping with the LARGER child: ${pairs(sw)}. It stops when both children are smaller (or it is a leaf).`, source, spec };
      }
      if (kind === 'extract') {
        const B = H.slice(), max = B[1], last = B[n];
        B[1] = B[n]; B.length = n;
        const sw = heapify(B, 1, n - 1);
        return { type: 'typed', prompt: `The max-heap A = ${fmt(heap)}. Run HEAP-EXTRACT-MAX(A). What is the heap A[1..${n - 1}] afterwards? ${ARR}`,
          ...listAnswer(B.slice(1)), why: `It returns ${max}. ${M(`A[1] = A[${n}] = ${last}`)}, heap size ${n - 1}, then MAX-HEAPIFY(A, 1): swaps ${pairs(sw) || 'none'}.`, source, spec };
      }
      const used = new Set(heap);
      const freshAbove = lo => { const c = []; for (let v = lo + 1; v <= 99; v++) if (!used.has(v)) c.push(v); return pick(rng, c); };
      if (kind === 'insert' || kind === 'increase') {
        const B = H.slice();
        let i, key;
        if (kind === 'insert') { key = freshAbove(0); i = n + 1; }
        else { i = int(rng, 2, n); key = freshAbove(H[i]); }
        const old = B[i];
        B[i] = key;
        spec.i = i; spec.key = key;
        const sw = [];
        while (i > 1 && B[parent(i)] < B[i]) { const pi = parent(i); [B[i], B[pi]] = [B[pi], B[i]]; sw.push([i, pi]); i = pi; }
        const q = kind === 'insert' ? `Run MAX-HEAP-INSERT(A, ${key}).` : `Run HEAP-INCREASE-KEY(A, ${spec.i}, ${key}).`;
        const start = kind === 'insert' ? `Heap size ${n + 1}, ${M(`A[${n + 1}] = -\\infty`)}, then increase it to ${key}.` : `${M(`A[${spec.i}]`)}: ${old} becomes ${key}.`;
        return { type: 'typed', prompt: `The max-heap A = ${fmt(heap)}. ${q} What is A afterwards? ${ARR}`,
          ...listAnswer(B.slice(1)), why: `${start} While the parent is smaller, swap upward: ${pairs(sw) || 'none'}; stop at ${i === 1 ? 'the root' : `a parent ${M(`${B[parent(i)]} \\ge ${key}`)}`}.`, source, spec };
      }
      // heapsort: BUILD-MAX-HEAP already done (A is a heap); one or two iterations of the loop.
      const iters = int(rng, 1, 2), B = H.slice(), parts = [];
      let hs = n;
      for (let t = 0; t < iters; t++) {
        const top = B[1];
        [B[1], B[hs]] = [B[hs], B[1]];
        hs--;
        const sw = heapify(B, 1, hs);
        parts.push(`${M('i = ' + (hs + 1))}: ${top} to A[${hs + 1}], heapify swaps ${pairs(sw) || 'none'} → ${fmt(B.slice(1))}`);
      }
      spec.iters = iters;
      return { type: 'typed', prompt: `Heapsort: A = ${fmt(heap)} is already a max-heap. Run the first ${iters === 1 ? 'iteration' : 'two iterations'} of the for loop (Swap(A[1], A[i]), shrink heap_size, Heapify(A, 1)). What is the WHOLE array A[1..${n}] then? ${ARR}`,
        ...listAnswer(B.slice(1)), why: parts.join('. ') + '.', source, spec };
    },
  });

  // ═══════════════════════════ 7. BuildHeap analysis ═══════════════════════════
  const nodeHeight = (i, n) => floorLog(Math.floor(n / i), 2); // longest downward path follows left children
  G.register({
    id: 'gen-310-buildheap', deck: DECK, lecture: 'buildheap', cat: 'Heaps & priority queues', sub: 'Building a heap',
    title: 'BuildHeap: leaves, node heights, nodes per height, swaps',
    make(rng) {
      const kind = weighted(rng, [['firstLeaf', 1], ['calls', 0.7], ['height', 1], ['heapHeight', 0.7], ['countH', 1.2], ['swaps', 1.2], ['partial', 1.2]]);
      const source = src('BuildHeapAnalysis.pdf and Heap-HeapSort-Priority Queue.pdf');
      if (['firstLeaf', 'calls', 'height', 'heapHeight', 'countH'].includes(kind)) {
        const n = int(rng, 8, 60), half = Math.floor(n / 2);
        const spec = { gen: 'buildheap', kind, n };
        const head = `A heap has ${M('n = ' + n)} elements in A[1..${n}].`;
        if (kind === 'firstLeaf') return { type: 'typed', prompt: `${head} What is the index of the FIRST leaf?`, answer: String(half + 1),
          why: `A${M(`[\\lfloor n/2 \\rfloor + 1 .. n]`)} are all leaves: ${M(`\\lfloor ${n}/2 \\rfloor + 1 = ${half + 1}`)}. Node ${half} still has Left ${M(`= ${2 * half} \\le ${n}`)}.`, source, spec };
        if (kind === 'calls') return { type: 'typed', prompt: `${head} How many times does BuildHeap's for loop call Max-Heapify?`, answer: String(half),
          why: `The loop runs ${M('i = \\lfloor n/2 \\rfloor')} down to 1: ${M(`\\lfloor ${n}/2 \\rfloor = ${half}`)} calls. The leaves are already 1-element heaps.`, source, spec };
        if (kind === 'heapHeight') { const H = floorLog(n, 2); return { type: 'typed', prompt: `${head} What is the height of the heap (edges on the longest root-to-leaf path)?`, answer: String(H),
          why: `Height ${M('= \\lfloor \\lg n \\rfloor')}: ${M(`2^{${H}} = ${2 ** H} \\le ${n} < ${2 ** (H + 1)}`)}, so ${H}.`, source, spec }; }
        if (kind === 'height') {
          const i = int(rng, 1, half);
          spec.i = i;
          const path = []; for (let x = i; x <= n; x *= 2) path.push(x);
          return { type: 'typed', prompt: `${head} What is the height of node ${i} (edges on the longest downward path to a leaf)?`, answer: String(nodeHeight(i, n)),
            why: `The longest path follows left children: ${path.join(' → ')} (${path[path.length - 1] * 2} ${M('> ' + n)}): ${path.length - 1} edges. Max-Heapify(A, ${i}) can sink at most that far.`, source, spec };
        }
        const H = floorLog(n, 2), h = int(rng, 0, Math.min(3, H));
        spec.h = h;
        const nodes = []; for (let i = 1; i <= n; i++) if (nodeHeight(i, n) === h) nodes.push(i);
        const list = nodes.length <= 8 ? nodes.join(', ') : `${nodes[0]}..${nodes[nodes.length - 1]}`;
        return { type: 'typed', prompt: `${head} How many nodes have height exactly ${h}?`, answer: String(nodes.length),
          why: `Node ${M('i')} has height ${M('\\lfloor \\lg(n/i) \\rfloor')}; height ${h}: ${list}, so ${nodes.length}. The bound ${M(`\\lceil n/2^{h+1} \\rceil = ${Math.ceil(n / 2 ** (h + 1))}`)}; summing ${M('O(h)')} over these gives ${M('O(n)')}.`, source, spec };
      }
      const n = int(rng, 7, 12), A = distinct(rng, n, 1, 99);
      const spec = { gen: 'buildheap', kind, A };
      if (kind === 'swaps') {
        const r = buildHeap(A);
        return { type: 'typed', prompt: `Run BUILD-MAX-HEAP on A = ${fmt(A)}. How many swaps do the Max-Heapify calls make in total?`, answer: String(r.total),
          why: `${r.why} Total ${r.total}.`, source, spec };
      }
      // partial: the array after the loop has processed i = floor(n/2) down to some i0.
      const i0 = int(rng, 2, Math.floor(n / 2));
      spec.i0 = i0;
      const r = buildHeap(A, i0);
      return { type: 'typed', prompt: `BUILD-MAX-HEAP on A = ${fmt(A)}. What is A right after the loop's call Max-Heapify(A, ${i0}) finishes? Give comma-separated values, A[1] first.`,
        ...listAnswer(r.H.slice(1)), why: r.why, source, spec };
    },
  });

  // ═══════════════════════════ 8. Counting sort and radix sort ═══════════════════════════
  function countingSort(A, k) {
    const C = new Array(k + 1).fill(0);
    for (const x of A) C[x]++;
    const counts = C.slice();
    for (let i = 1; i <= k; i++) C[i] += C[i - 1];
    const prefix = C.slice(), B = new Array(A.length + 1).fill(null);
    let first = null, cAfterFirst = null;
    for (let j = A.length; j >= 1; j--) {
      const x = A[j - 1];
      if (j === A.length) first = { x, pos: C[x] };
      B[C[x]] = x; C[x]--;
      if (j === A.length) cAfterFirst = C.slice();
    }
    return { counts, prefix, B: B.slice(1), first, cAfterFirst };
  }
  const digit = (x, d) => Math.floor(x / 10 ** (d - 1)) % 10;
  function radixPass(A, d) { // stable sort on digit d (1 = ones)
    const buckets = Array.from({ length: 10 }, () => []);
    for (const x of A) buckets[digit(x, d)].push(x);
    return [].concat(...buckets);
  }
  G.register({
    id: 'gen-310-counting-sort', deck: DECK, lecture: 'linsort', cat: 'Sorting', sub: 'Counting & radix sort',
    title: 'Trace counting sort (C arrays, output) and radix sort passes',
    make(rng) {
      const kind = weighted(rng, [['counts', 1], ['prefix', 1.2], ['output', 1], ['firstPos', 0.8], ['cAfterFirst', 0.8], ['radix', 1.6]]);
      const source = src('Sorting in Linear Time .pdf (COUNTING-SORT, RADIX-SORT)');
      if (kind === 'radix') {
        const n = int(rng, 5, 8), A = distinct(rng, n, 100, 999);
        const pass = int(rng, 1, 3), name = ['', 'ones', 'tens', 'hundreds'][pass];
        const passes = [A];
        for (let d = 1; d <= 3; d++) passes.push(radixPass(passes[d - 1], d));
        const why = `Least significant digit first, a STABLE sort each pass (ties keep their order). Ones: ${passes[1].join(', ')}. Tens: ${passes[2].join(', ')}. Hundreds: ${passes[3].join(', ')}.`;
        return { type: 'typed', prompt: `Radix sort (least significant digit first, stable sort per digit) on: ${A.join(', ')}.\nWhat is the list after pass ${pass} (the ${name} digit)? Comma-separated, first element first.`,
          ...listAnswer(passes[pass]), why, source, spec: { gen: 'counting', kind, A, pass } };
      }
      const k = int(rng, 3, 6), n = int(rng, 6, 10);
      const A = Array.from({ length: n }, () => int(rng, 0, k));
      const r = countingSort(A, k);
      const head = `COUNTING-SORT on A = ${fmt(A)} (A[1..${n}]), keys 0..${k}. C is indexed C[0..${k}]; output B is B[1..${n}].`;
      const cLine = `Counting: C[v] = how many ${M('v')}s = ${fmt(r.counts)}.`;
      const pLine = `Prefix sums ${M('C[i] = C[i] + C[i-1]')} (keys ${M('\\le i')}): ${fmt(r.prefix)}.`;
      const spec = { gen: 'counting', kind, A, k };
      const C0 = 'Give C[0] first, comma-separated.';
      if (kind === 'counts') return { type: 'typed', prompt: `${head}\nWhat is C after the counting loop (before prefix sums)? ${C0}`, ...listAnswer(r.counts), why: cLine, source, spec };
      if (kind === 'prefix') return { type: 'typed', prompt: `${head}\nWhat is C after the prefix-sum loop? ${C0}`, ...listAnswer(r.prefix), why: `${cLine} ${pLine}`, source, spec };
      if (kind === 'output') return { type: 'typed', prompt: `${head}\nWhat is the output array B? Give B[1] first, comma-separated.`, ...listAnswer(r.B),
        why: `${cLine} ${pLine} Then ${M('j = n')} down to 1: ${M('B[C[A[j]]] = A[j]')}, then ${M('C[A[j]]')} drops by 1 (going backwards keeps it stable).`, source, spec };
      const { x, pos } = r.first;
      if (kind === 'firstPos') return { type: 'typed', prompt: `${head}\nThe placement loop starts at ${M('j = ' + n)}. At which index of B is A[${n}] = ${x} placed?`, answer: String(pos),
        why: `${pLine} ${M(`C[${x}] = ${pos}`)}, so ${M(`B[${pos}] = ${x}`)}: the LAST slot for ${x}s, which keeps equal keys in input order.`, source, spec };
      return { type: 'typed', prompt: `${head}\nWhat is C after the FIRST iteration of the placement loop (${M('j = ' + n)})? ${C0}`, ...listAnswer(r.cAfterFirst),
        why: `${pLine} ${M(`j = ${n}`)}: A[${n}] = ${x} goes to ${M(`B[${pos}]`)}, and ${M(`C[${x}]`)} drops to ${pos - 1}.`, source, spec };
    },
  });

  // ═══════════════════════════ 9. Hash tables ═══════════════════════════
  const PROBE = {
    linear: { m: [10, 11, 13], tex: m => `linear probing ${M(`h(k,i) = (k \\bmod ${m} + i) \\bmod ${m}`)}`, h: (k, i, m) => (k % m + i) % m },
    quadratic: { m: [11, 13, 7], tex: m => `quadratic probing (${M('c_1 = 0, c_2 = 1')}) ${M(`h(k,i) = (k \\bmod ${m} + i^2) \\bmod ${m}`)}`, h: (k, i, m) => (k % m + i * i) % m },
    double: { m: [13], tex: () => `double hashing ${M('h(k,i) = (h_1(k) + i\\,h_2(k)) \\bmod 13')}, ${M('h_1(k) = k \\bmod 13')}, ${M('h_2(k) = 1 + (k \\bmod 11)')}`, h: (k, i, m) => (k % 13 + i * (1 + k % 11)) % m },
  };
  // Insert keys; each key keeps its probe sequence. Returns null if some key cannot be placed.
  function openInsert(method, m, keys) {
    const T = new Array(m).fill(null), seqs = {};
    for (const k of keys) {
      const seq = [];
      let placed = false;
      for (let i = 0; i < m; i++) {
        const s = PROBE[method].h(k, i, m);
        seq.push(s);
        if (T[s] === null) { T[s] = k; placed = true; break; }
      }
      if (!placed) return null;
      seqs[k] = seq;
    }
    const col = keys.filter(k => seqs[k].length > 1).map(k => `${k}${method === 'double' ? ` (${M('h_2 = ' + (1 + k % 11))})` : ''}: ${seqs[k].join('→')}`);
    const why = `Collisions: ${col.join('; ') || 'none'}. Every other key lands at its first probe.`;
    return { T, seqs, why };
  }
  const tableText = T => T.map(x => x === null ? '-' : x);
  function tableAnswer(T) {
    const base = listAnswer(tableText(T));
    const out = [base.answer].concat(base.accept);
    for (const empty of ['∅', 'empty', 'null', 'nil', '_']) {
      const alt = listAnswer(T.map(x => x === null ? empty : x));
      out.push(alt.answer, ...alt.accept);
    }
    const u = uniq(out);
    return { answer: u[0], accept: u.slice(1) };
  }
  G.register({
    id: 'gen-310-hash', deck: DECK, lecture: 'hash', cat: 'Hashing', sub: 'Hash tables',
    title: 'Hash tables: chaining, probing, tombstones, load factor',
    make(rng) {
      const kind = weighted(rng, [['table', 3], ['probe', 1.5], ['chain', 1.2], ['longest', 0.6], ['alpha', 0.6], ['search', 1.3], ['insertDel', 1]]);
      const source = src('hash tables.pdf and worksheet___OpenAddressing.pdf');
      if (kind === 'chain' || kind === 'longest' || kind === 'alpha') {
        const m = int(rng, 5, 9), n = int(rng, 6, 11), keys = distinct(rng, n, 10, 99);
        const chains = Array.from({ length: m }, () => []);
        for (const k of keys) chains[k % m].push(k);
        const why = `${M('h(k) = k \\bmod ' + m)}. ` + chains.map((c, s) => c.length ? `slot ${s}: ${c.join(', ')}` : '').filter(Boolean).join('; ') + '; other slots empty.';
        const head = `Separate chaining, ${M('m = ' + m)} slots, ${M('h(k) = k \\bmod ' + m)}. Insert keys ${keys.join(', ')} (in this order).`;
        const spec = { gen: 'hash', kind, m, keys };
        if (kind === 'alpha') {
          const gcd = (x, y) => y ? gcd(y, x % y) : x, d = gcd(n, m);
          return { type: 'typed', prompt: `${head}\nWhat is the load factor ${M('\\alpha')}? (a fraction like 3/4, or a decimal to 2 places)`, answer: `${n}/${m}`,
            accept: uniq([String(Math.round(n / m * 100) / 100), (n / m).toFixed(2), (n / m).toFixed(3), String(Math.round(n / m * 1000) / 1000), d === m ? String(n / m) : `${n / d}/${m / d}`, `α = ${n}/${m}`, `α=${n}/${m}`]).filter(s => s !== `${n}/${m}`),
            why: `${M(`\\alpha = n/m = ${n}/${m} \\approx ${(n / m).toFixed(3)}`)}. With chaining an average search takes ${M('\\Theta(1 + \\alpha)')}.`, source, spec };
        }
        if (kind === 'longest') return { type: 'typed', prompt: `${head}\nHow many keys are in the longest chain?`, answer: String(Math.max(...chains.map(c => c.length))), why, source, spec };
        const multi = chains.map((c, i) => i).filter(i => chains[i].length >= 2), single = chains.map((c, i) => i).filter(i => chains[i].length === 1);
        const s = pick(rng, multi.length && (chance(rng, 0.8) || !single.length) ? multi : single);
        spec.slot = s;
        return { type: 'set', prompt: `${head}\nWhich keys end up in the chain at slot ${s}? (any order)`, answer: chains[s].map(String), why, source, spec };
      }
      const method = kind === 'search' || kind === 'insertDel' ? 'linear' : weighted(rng, [['linear', 1], ['quadratic', 1], ['double', 1]]);
      const m = pick(rng, PROBE[method].m);
      let keys, res;
      do {
        const n = method === 'quadratic' ? int(rng, 4, Math.floor((m + 1) / 2)) : int(rng, 5, Math.min(8, m - 3));
        keys = distinct(rng, n, 10, 99);
        if (chance(rng, 0.7)) { const r = keys[0] % m; keys[1] = r + m * int(rng, 1, Math.floor((99 - r) / m)); } // force a collision
        keys = uniq(keys);
        res = openInsert(method, m, keys);
      } while (!res || keys.length < 4 || Object.values(res.seqs).every(s => s.length === 1));
      const head = `Open addressing, ${M('m = ' + m)} (slots 0..${m - 1}), ${PROBE[method].tex(m)}. Start empty and insert ${keys.join(', ')} (in this order).`;
      const spec = { gen: 'hash', kind, method, m, keys };
      if (kind === 'table') return { type: 'typed', prompt: `${head}\nGive the final table, slot 0 first, comma-separated, '-' for an empty slot.`, ...tableAnswer(res.T), why: res.why, source, spec };
      if (kind === 'probe') {
        const k = keys.slice().sort((x, y) => res.seqs[y].length - res.seqs[x].length || keys.indexOf(x) - keys.indexOf(y))[0];
        spec.key = k;
        return { type: 'typed', prompt: `${head}\nList every slot probed while inserting ${k}, ${M('i = 0')} first, ending with the slot it lands in (comma-separated).`, ...listAnswer(res.seqs[k]), why: res.why, source, spec };
      }
      // Linear probing with a DEL tombstone.
      const victim = pick(rng, keys), delAt = res.T.indexOf(victim);
      const T = res.T.slice(); T[delAt] = 'DEL';
      spec.del = victim;
      const delLine = `Table: ${tableText(res.T).join(', ')}. Deleting ${victim} makes slot ${delAt} DEL.`;
      const show = s => `${s} (${T[s] === null ? 'empty' : T[s]})`;
      if (kind === 'search') {
        const path = x => { const q = []; for (let i = 0; i < m; i++) { const s = (x % m + i) % m; q.push(s); if (T[s] === x || T[s] === null) break; } return q; };
        const present = keys.filter(k => k !== victim);
        const absent = []; for (let x = 10; x <= 99; x++) if (!keys.includes(x)) absent.push(x);
        let pool = chance(rng, 0.55) ? present : absent;
        const crossing = pool.filter(x => path(x).includes(delAt));
        if (crossing.length && chance(rng, 0.75)) pool = crossing;
        const target = pick(rng, pool);
        const seq = path(target), found = T[seq[seq.length - 1]] === target;
        spec.target = target;
        return { type: 'typed', prompt: `${head}\nThen delete ${victim} (mark its slot DEL). Search for ${target}: list every slot probed, in order (comma-separated).`,
          ...listAnswer(seq), why: `${delLine} Search ${target}: ${seq.map(show).join(', ')}: ${found ? 'found' : 'empty slot, NOT FOUND'}. A DEL slot does not stop a search.`, source, spec };
      }
      // insertDel: a new key whose probe path crosses the DEL slot goes into the FIRST DEL seen.
      let key, seq, landing;
      for (let tries = 0; ; tries++) {
        key = int(rng, 10, 99);
        if (keys.includes(key)) continue;
        seq = []; landing = -1; let firstDel = -1;
        for (let i = 0; i < m; i++) {
          const s = (key % m + i) % m; seq.push(s);
          if (T[s] === 'DEL' && firstDel < 0) firstDel = s;
          if (T[s] === null) { landing = firstDel >= 0 ? firstDel : s; break; }
        }
        if (landing >= 0 && (seq.includes(delAt) || tries > 200)) break;
      }
      spec.key = key;
      return { type: 'typed', prompt: `${head}\nThen delete ${victim} (mark its slot DEL). Insert ${key} by the worksheet rule (remember the first DEL, keep probing to an empty slot to rule out a duplicate). Which slot does ${key} go into?`,
        answer: String(landing), why: `${delLine} Insert ${key}: ${seq.map(show).join(', ')}. ${seq.includes(delAt) ? `First DEL seen is slot ${delAt} and ${key} is not present, so slot ${landing}.` : `No DEL on the path: slot ${landing}.`}`, source, spec };
    },
  });

  // ═══════════════════════════ 10. Binary search (worksheet version) ═══════════════════════════
  function binSearch(a, key) {
    let low = 1, high = a.length; const mids = [], rows = [];
    const sizes = [];
    while (low <= high) {
      const mid = Math.floor((low + high) / 2), v = a[mid - 1];
      mids.push(mid); sizes.push(high - low + 1);
      rows.push(`(${low},${high})→${mid}: ${v === key ? 'found' : v < key ? `${v} < ${key}` : `${v} > ${key}`}`);
      if (v === key) return { mids, ret: mid, rows, sizes };
      if (v < key) low = mid + 1; else high = mid - 1;
    }
    rows.push(`(${low},${high}): low > high, return −1`);
    return { mids, ret: -1, rows, sizes };
  }
  // Bars: the part of the list still searched at each iteration; the curve halves from n.
  function halvingGraph(n, sizes, caption) {
    return { x: [0.5, sizes.length + 0.5], logY: n > 100, xLabel: 'iteration k', yLabel: 'list size',
      bars: { label: 'size at iteration k', tone: 'b', values: sizes.map((v, k) => [k + 1, v]) },
      curves: [{ label: M('n/2^{k-1}'), f: k => n / 2 ** (k - 1), tone: 'a' }], caption };
  }
  G.register({
    id: 'gen-310-binary-search', deck: DECK, lecture: 'ws-binsearch', cat: 'Asymptotics', sub: 'Binary search', assignment: ['a1'],
    title: 'Dry-run binary search: midpoints, iterations, result',
    make(rng) {
      const kind = weighted(rng, [['mids', 2], ['iters', 1.2], ['ret', 1], ['worst', 0.7]]);
      const source = src('worksheet1-binarySearchAnalysis.pdf');
      const MID = `low = 1, high = n, ${M('\\text{mid} = \\lfloor(\\text{low}+\\text{high})/2\\rfloor')}`;
      if (kind === 'worst') {
        const n = pick(rng, [int(rng, 5, 200), 2 ** int(rng, 3, 12), 2 ** int(rng, 3, 12) - 1, 1000, 1000000]);
        const w = floorLog(n, 2) + 1;
        return { type: 'typed', prompt: `The worksheet's BinarySearch(a, n, key) (${MID}). What is the MOST while-loop iterations (midpoints probed) for ${M('n = ' + n)}?`,
          answer: String(w), why: `Each probe leaves at most ${M('\\lfloor n/2 \\rfloor')} elements, so the worst case is ${M('\\lfloor \\lg n \\rfloor + 1')}: ${M(`2^{${w - 1}} \\le ${n} < 2^{${w}}`)}, so ${w}. The worksheet's "about ${M('\\log_2 n')}" rounds this. ${M('\\Theta(\\lg n)')}.`,
          source, spec: { gen: 'binsearch', kind, n },
          graph: halvingGraph(n, (() => { const z = []; for (let m = n; m >= 1; m = Math.floor(m / 2)) z.push(m); return z; })(), `Each probe keeps at most half: ${w} bars until 1 is left.`) };
      }
      const n = int(rng, 7, 16);
      const a = []; let v = int(rng, 1, 9);
      for (let i = 0; i < n; i++) { a.push(v); v += int(rng, 2, 9); }
      const key = chance(rng, 0.55) ? pick(rng, a) : pick(rng, [a[0] - 1, a[n - 1] + int(rng, 1, 5), a[int(rng, 0, n - 2)] + 1]);
      const r = binSearch(a, key);
      const head = `The worksheet's BinarySearch (${MID}, a is 1-based) on\na = ${fmt(a)}, n = ${n}, key = ${key}.`;
      const spec = { gen: 'binsearch', kind, a, key };
      const why = `(low, high)→mid: ${r.rows.join('; ')}.`;
      const graph = halvingGraph(n, r.sizes, `${r.sizes.length} iteration${r.sizes.length > 1 ? 's' : ''}; each keeps at most half.`);
      if (kind === 'mids') return { type: 'typed', prompt: `${head}\nList the values of mid in the order they are computed (comma-separated).`, ...listAnswer(r.mids), why, source, spec, graph };
      if (kind === 'iters') return { type: 'typed', prompt: `${head}\nHow many iterations does the while loop run (midpoints probed)?`, answer: String(r.mids.length), why, source, spec, graph };
      return { type: 'typed', prompt: `${head}\nWhat does BinarySearch return?`, answer: String(r.ret), why, source, spec, graph };
    },
  });

  // ═══════════════════════════ 11. Insertion sort counts (Lecture 2, Assignment 1) ═══════════════════════════
  // Her pseudocode, 1-based. t_j = times the while condition is tested for that j = shifts + 1.
  const INS_CODE = ['for j = 2 to n', '    key = A[j]; i = j - 1', '    while i > 0 and A[i] > key', '        A[i+1] = A[i]; i = i - 1', '    A[i+1] = key'].join('\n');
  function insertionTrace(A0) {
    const A = [null].concat(A0), n = A0.length, shifts = [];
    for (let j = 2; j <= n; j++) {
      const key = A[j]; let i = j - 1, s = 0;
      while (i > 0 && A[i] > key) { A[i + 1] = A[i]; i--; s++; }
      A[i + 1] = key;
      shifts[j] = s;
    }
    return shifts;
  }
  G.register({
    id: 'gen-310-insertion-count', deck: DECK, lecture: '2', cat: 'Foundations', sub: 'Insertion sort', assignment: ['a1'],
    title: 'Count insertion sort’s shifts and while-tests',
    make(rng) {
      const n = int(rng, 5, 8), shape = weighted(rng, [['sorted', 1], ['reversed', 1], ['nearly', 1.2], ['random', 2.5]]);
      let A = distinct(rng, n, 1, 50);
      if (shape !== 'random') A.sort((x, y) => x - y);
      if (shape === 'reversed') A.reverse();
      if (shape === 'nearly') { const k = int(rng, 0, n - 2); [A[k], A[k + 1]] = [A[k + 1], A[k]]; }
      const sh = insertionTrace(A), js = []; for (let j = 2; j <= n; j++) js.push(j);
      const total = js.reduce((t, j) => t + sh[j], 0), tests = total + n - 1;
      const kind = weighted(rng, [['shifts', 1.4], ['tests', 1.4], ['tj', 1], ['case', 1]]);
      const spec = { gen: 'insertion', kind, A };
      const source = src('Lecture 2.pdf (InsertionSort, t_j)');
      const head = `InsertionSort on A = ${fmt(A)}, ${M('n = ' + n)}.`;
      const trace = `Shifts for ${M('j')} = 2..${n}: ${js.map(j => sh[j]).join(', ')}.`;
      const useT = kind !== 'shifts';
      const graph = { x: [1.5, n + 0.5], y: [0, n + 0.5], xLabel: 'j', yLabel: useT ? 't_j' : 'shifts',
        bars: { label: useT ? M('t_j') + ' for this array' : 'shifts for this array', tone: 'b', values: js.map(j => [j, sh[j] + (useT ? 1 : 0)]) },
        curves: [{ label: `worst: ${M(useT ? 't_j = j' : 'j - 1')}`, f: x => (useT ? x : x - 1), tone: 'c' }, { label: `best: ${M(useT ? 't_j = 1' : '0')}`, f: () => (useT ? 1 : 0), tone: 'a' }],
      };
      const base = { code: INS_CODE, source, spec, graph };
      if (kind === 'shifts') return { type: 'typed', prompt: `${head}\nHow many times does A[i+1] = A[i] run in total?`, answer: String(total),
        why: `${trace} Each shift moves one bigger element right. Total ${M('= ' + total)}.`, ...base };
      if (kind === 'tests') return { type: 'typed', prompt: `${head}\n${M('t_j')} = times the while condition is tested for that ${M('j')}. What is ${M('\\sum_{j=2}^{' + n + '} t_j')}?`, answer: String(tests),
        why: `${trace} Each ${M('t_j')} = shifts + 1 (the last test fails), so ${M(`\\sum t_j = ${total} + (n-1) = ${tests}`)}.`, ...base };
      if (kind === 'tj') {
        const j = pick(rng, js.filter(x => sh[x] > 0).concat(js));
        spec.j = j;
        const pre = A.slice(0, j - 1).sort((x, y) => x - y);
        return { type: 'typed', prompt: `${head}\nWhat is ${M('t_{' + j + '}')}, the number of while-condition tests while inserting A[${j}] = ${A[j - 1]}?`, answer: String(sh[j] + 1),
          why: `A[1..${j - 1}] is then ${fmt(pre)}: ${sh[j]} bigger than ${A[j - 1]}, so ${sh[j]} shift${sh[j] === 1 ? '' : 's'} + 1 failing test: ${M('t_{' + j + '} = ' + (sh[j] + 1))}.`, ...base };
      }
      const OPT = { best: 'Best case (already sorted)', worst: 'Worst case (reverse order)', neither: 'Neither best nor worst' };
      const k = total === 0 ? 'best' : total === n * (n - 1) / 2 ? 'worst' : 'neither';
      return { type: 'mc', prompt: `${head}\nFor arrays of this size, is this input insertion sort’s best case, worst case, or neither?`, answer: OPT[k],
        options: Object.values(OPT).filter(o => o !== OPT[k]),
        why: `${trace} Best: 0 shifts. Worst: ${M(`n(n-1)/2 = ${n * (n - 1) / 2}`)}. Here ${total}: ${k === 'neither' ? 'neither' : k + ' case'}.`, ...base, spec };
    },
  });

  // ═══════════════════════════ 12. Proving a bound from the definition (Lecture 3, Assignment 1) ═══════════════════════════
  // f is a polynomial (coefficients f[k] of n^k), g = n^d, c = p/q. Definitions from Lecture 3:
  //   O: 0 <= f(n) <= c g(n) for all n >= n0;   Ω: f(n) >= c g(n) for all n >= n0 (c > 0).
  const polyAt = (P, n) => P.reduce((s, ck, k) => s + ck * n ** k, 0);
  function polyTex(P) {
    let out = '';
    for (let k = P.length - 1; k >= 0; k--) {
      const ck = P[k]; if (!ck) continue;
      const mag = Math.abs(ck), body = k === 0 ? String(mag) : (mag === 1 ? '' : mag) + (k === 1 ? 'n' : `n^${k}`);
      out += out ? (ck < 0 ? ' - ' : ' + ') + body : (ck < 0 ? '-' : '') + body;
    }
    return out || '0';
  }
  const cTex = c => (c[1] === 1 ? String(c[0]) : `\\tfrac{${c[0]}}{${c[1]}}`);
  const cgTex = (c, gT) => (c[0] === c[1] ? gT : cTex(c) + gT); // "n^2", not "1n^2"
  const gPoly = d => { const P = [0, 0, 0, 0]; P[d] = 1; return P; };
  // Holds for every n >= n0? Checked on [n0, 10^4]; beyond, the sign of the leading
  // coefficient of the difference decides (all its roots are far below 10^4 here).
  function holdsAt(rel, f, d, c, n) {
    const fv = polyAt(f, n), gv = n ** d;
    return rel === 'O' ? fv >= 0 && c[1] * fv <= c[0] * gv : c[1] * fv >= c[0] * gv;
  }
  function firstFail(rel, f, d, c, n0) {
    for (let n = n0; n <= 10000; n++) if (!holdsAt(rel, f, d, c, n)) return n;
    const H = f.map((fk, k) => (rel === 'O' ? 1 : -1) * (c[0] * (k === d ? 1 : 0) - c[1] * fk));
    let k = H.length - 1; while (k >= 0 && H[k] === 0) k--;
    return k >= 0 && H[k] < 0 ? Infinity : 0; // Infinity: fails beyond 10^4 (counts as invalid)
  }
  const valid = (rel, f, d, c, n0) => firstFail(rel, f, d, c, n0) === 0;
  function minN0(rel, f, d, c) { let last = 0; for (let n = 1; n <= 10000; n++) if (!holdsAt(rel, f, d, c, n)) last = n; return last + 1; }
  // Families: f, g = n^d, the relation, a constant and the key-inequality text.
  function boundInstance(rng) {
    const a = int(rng, 1, 6), b = int(rng, 1, 9), dd = int(rng, 1, 9);
    const fam = weighted(rng, [['O-quad', 2], ['O-lin', 1.2], ['O-cubic', 0.8], ['O-plus3', 1], ['Om-quad', 1.5], ['Om-lin', 1.2], ['Om-plus', 0.8]]);
    const half = a === 1;
    if (fam === 'O-quad') return { rel: 'O', d: 2, f: [0, b, a, 0], c: [a + 1, 1], key: `${a + 1}n^2 \\ge ${polyTex([0, b, a])} \\iff n^2 \\ge ${b === 1 ? '' : b}n \\iff n \\ge ${b}` };
    if (fam === 'O-lin') return { rel: 'O', d: 1, f: [b, a, 0, 0], c: [a + 1, 1], key: `${a + 1}n \\ge ${polyTex([b, a])} \\iff n \\ge ${b}` };
    if (fam === 'O-cubic') return { rel: 'O', d: 3, f: [0, 0, b, a], c: [a + 1, 1], key: `${a + 1}n^3 \\ge ${polyTex([0, 0, b, a])} \\iff n^3 \\ge ${b === 1 ? '' : b}n^2 \\iff n \\ge ${b}` };
    if (fam === 'O-plus3') return { rel: 'O', d: 2, f: [dd, b, a, 0], c: [a + b + dd, 1], key: `n \\ge 1:\\ ${b === 1 ? '' : b}n \\le ${b === 1 ? '' : b}n^2,\\ ${dd} \\le ${dd === 1 ? '' : dd}n^2,\\ \\text{so } f(n) \\le ${a + b + dd}n^2` };
    if (fam === 'Om-quad') return { rel: 'Ω', d: 2, f: [0, -b, a, 0], c: half ? [1, 2] : [a - 1, 1],
      key: half ? `n^2 - ${b === 1 ? '' : b}n \\ge \\tfrac{1}{2}n^2 \\iff \\tfrac{1}{2}n^2 \\ge ${b === 1 ? '' : b}n \\iff n \\ge ${2 * b}` : `${polyTex([0, -b, a])} \\ge ${a - 1 === 1 ? '' : a - 1}n^2 \\iff n^2 \\ge ${b === 1 ? '' : b}n \\iff n \\ge ${b}` };
    if (fam === 'Om-lin') return { rel: 'Ω', d: 1, f: [-b, a, 0, 0], c: half ? [1, 2] : [a - 1, 1],
      key: half ? `n - ${b} \\ge \\tfrac{1}{2}n \\iff \\tfrac{1}{2}n \\ge ${b} \\iff n \\ge ${2 * b}` : `${polyTex([-b, a])} \\ge ${a - 1 === 1 ? '' : a - 1}n \\iff n \\ge ${b}` };
    return { rel: 'Ω', d: 2, f: [dd, b, a, 0], c: [a, 1], key: `${b === 1 ? '' : b}n + ${dd} \\ge 0,\\ \\text{so } f(n) \\ge ${a === 1 ? '' : a}n^2 \\text{ for } n \\ge 1` };
  }
  const relTex = r => (r === 'O' ? 'O' : r === 'Ω' ? '\\Omega' : '\\Theta');
  G.register({
    id: 'gen-310-prove-bound', deck: DECK, lecture: '3', cat: 'Asymptotics', sub: 'Proofs from definitions', assignment: ['a1'],
    title: 'Prove f = O(g) / Ω(g) / Θ(g) with c and n₀',
    make(rng) {
      const kind = chance(rng, 0.55) ? 'pick' : 'prove';
      const source = src('Lecture 3.pdf (definitions of O, Ω, Θ)');
      let I = boundInstance(rng);
      // Θ (prove only): pair an O bound with the matching Ω bound for f = a n^2 ± b n.
      let theta = null;
      if (kind === 'prove' && chance(rng, 0.3)) {
        const a = int(rng, 2, 6), b = int(rng, 1, 9), plus = chance(rng, 0.5);
        I = plus
          ? { rel: 'Θ', d: 2, f: [0, b, a, 0], c: [a + 1, 1], key: `${a + 1}n^2 \\ge ${polyTex([0, b, a])} \\iff n \\ge ${b}` }
          : { rel: 'Θ', d: 2, f: [0, -b, a, 0], c: [a, 1], key: `${polyTex([0, -b, a])} \\le ${a}n^2 \\text{ always}` };
        theta = plus ? { c1: [a, 1], key1: `${polyTex([0, b, a])} \\ge ${a}n^2 \\text{ for } n \\ge 1` }
          : { c1: [a - 1, 1], key1: `${polyTex([0, -b, a])} \\ge ${a - 1 === 1 ? '' : a - 1}n^2 \\iff n \\ge ${b}` };
      }
      const { rel, d, f } = I;
      const gT = d === 1 ? 'n' : `n^${d}`, fT = polyTex(f);
      let n0;
      if (rel === 'Θ') n0 = Math.max(minN0('O', f, d, I.c), minN0('Ω', f, d, theta.c1));
      else n0 = minN0(rel, f, d, I.c);
      const spec = { gen: 'bound', kind, rel, f, d, c: I.c, n0, c1: theta && theta.c1 };
      const cg = (c, x) => c[0] / c[1] * x ** d;
      const x0 = Math.max(0, n0 - Math.max(3, Math.ceil(n0 / 2))), x1 = n0 + Math.max(5, n0);
      const curves = [{ label: M('f(n) = ' + fT), f: x => polyAt(f, x), tone: 'a' }, { label: M(cgTex(I.c, gT)), f: x => cg(I.c, x), tone: 'b' }];
      if (theta) curves.push({ label: M(cgTex(theta.c1, gT)), f: x => cg(theta.c1, x), tone: 'c' });
      const side = rel === 'O' ? 'below' : rel === 'Ω' ? 'above' : 'between';
      const graph = { x: [x0, x1], xLabel: 'n', yLabel: 'value', curves, marks: [{ x: n0, label: M('n_0 = ' + n0) }], from: n0,
        caption: `From ${M('n_0 = ' + n0)} on, ${M('f')} stays ${side} ${rel === 'Θ' ? 'the two lines' : M(cgTex(I.c, gT))}.` };
      const goal = `${M('f(n) = ' + fT)} is ${M(relTex(rel) + '(' + gT + ')')}`;
      if (kind === 'pick') {
        const a = f[d];
        const cands = [[I.c, n0 - 1], [I.c, Math.max(1, Math.floor(n0 / 2))], [I.c, 1], [[a, 1], 1], [[a, 1], n0], [[a, 1], 10 * n0], [[a + 1, 1], 1], [[Math.max(1, a - 1), 1], 1], [[a + 2, 1], 1]];
        const seen = new Set([`${I.c}|${n0}`]), wrong = [];
        for (const [c, m] of cands) {
          const k = `${c}|${m}`;
          if (m < 1 || seen.has(k) || valid(rel, f, d, c, m)) continue;
          seen.add(k); wrong.push([c, m]);
        }
        const opts = sample(rng, wrong, Math.min(3, wrong.length));
        const text = (c, m) => M(`c = ${cTex(c)},\\ n_0 = ${m}`);
        const ff = opts.map(([c, m]) => [c, m, firstFail(rel, f, d, c, m)]);
        const fails = ff.filter(x => Number.isFinite(x[2])).slice(0, 2).map(([c, m, k]) => `${M(`c = ${cTex(c)},\\ n_0 = ${m}`)} fails at ${M('n = ' + k)}.`).join(' ');
        spec.choices = [{ text: text(I.c, n0), c: I.c, n0 }].concat(opts.map(([c, m]) => ({ text: text(c, m), c, n0: m })));
        return { type: 'mc', prompt: `Which pair proves ${goal}? (${rel === 'O' ? M('0 \\le f(n) \\le c\\,g(n)') : M('f(n) \\ge c\\,g(n)')} for all ${M('n \\ge n_0')}.)`,
          answer: text(I.c, n0), options: opts.map(([c, m]) => text(c, m)),
          why: `${M(I.key)}, so ${M(`c = ${cTex(I.c)},\\ n_0 = ${n0}`)} works. ${fails}`, source, spec, graph };
      }
      const pts = rel === 'Θ'
        ? [`Name ${M('c_1, c_2, n_0')} (e.g. ${M(`c_1 = ${cTex(theta.c1)},\\ c_2 = ${cTex(I.c)},\\ n_0 = ${n0}`)})`, `Show both: ${M(theta.key1)}; ${M(I.key)}`, `Conclude: ${M(`${cgTex(theta.c1, gT)} \\le f(n) \\le ${cgTex(I.c, gT)}`)} for all ${M('n \\ge n_0')}`]
        : [`Name ${M('c')} and ${M('n_0')} (e.g. ${M(`c = ${cTex(I.c)},\\ n_0 = ${n0}`)})`, `Key inequality: ${M(I.key)}`, `Conclude: it holds for every ${M('n \\ge n_0')}, so ${M('f = ' + relTex(rel) + '(' + gT + ')')}`];
      const answer = rel === 'Θ'
        ? `${M(`c_1 = ${cTex(theta.c1)},\\ c_2 = ${cTex(I.c)},\\ n_0 = ${n0}`)}: ${M(theta.key1)} and ${M(I.key)}, so for ${M('n \\ge ' + n0)} f is between them.`
        : `${M(`c = ${cTex(I.c)},\\ n_0 = ${n0}`)}: ${M(I.key)}, so it holds for all ${M('n \\ge ' + n0)}.`;
      return { type: 'recall', prompt: `Prove from the definition that ${goal}: name ${rel === 'Θ' ? M('c_1, c_2') : M('c')} and ${M('n_0')}, show the key inequality, conclude.`,
        answer, points: pts, why: `Other valid constants are fine too.${n0 > 1 ? ` For these ${M('c')}, ${M('n_0 = ' + n0)} is the smallest start (${M('n = ' + (n0 - 1))} fails).` : ''}`, source, spec, graph };
    },
  });

  // ═══════════════════════════ 13. Comparing growth by the ratio f/g (Lecture 3, Assignment 1) ═══════════════════════════
  // Sums of terms c·n^(p6/6)·(lg n)^l. No exponentials or factorials (graded A1 territory).
  const T6 = (c, p6, l = 0) => ({ c, p6, l });
  const gcd = (x, y) => (y ? gcd(y, x % y) : Math.abs(x));
  function expTex(p6) { const g = gcd(p6, 6), num = p6 / g, den = 6 / g; return den === 1 ? String(num) : `${num}/${den}`; }
  function nPow(p6) { if (p6 === 0) return ''; if (p6 === 6) return 'n'; if (p6 === 3) return '\\sqrt{n}'; return `n^{${expTex(p6)}}`; }
  const lgPow = l => (l === 0 ? '' : l === 1 ? '\\lg n' : `\\lg^{${l}} n`);
  function termTex6(t, first) { const body = [nPow(t.p6), lgPow(t.l)].filter(Boolean).join(' '); return (t.c === 1 && body ? '' : String(t.c)) + body; }
  const sumTex = ts => ts.map(t => termTex6(t)).join(' + ');
  const termVal = (t, n) => t.c * n ** (t.p6 / 6) * L2(n) ** t.l;
  const sumVal = (ts, n) => ts.reduce((s, t) => s + termVal(t, n), 0);
  const lead = ts => ts.slice().sort((x, y) => y.p6 - x.p6 || y.l - x.l)[0];
  function compareInstance(rng) {
    const fam = weighted(rng, [['polyDiff', 2], ['polySame', 1.5], ['nlogPow', 1.2], ['logPow', 1.2], ['powPow', 1.2], ['mult', 1]]);
    const co = () => pick(rng, [1, 1, 2, 3, 4, 5, 7, 10]);
    if (fam === 'polyDiff') { const [p, r] = sample(rng, [1, 2, 3], 2); const q = int(rng, 0, p - 1); return [fam, [T6(co(), 6 * p)].concat(chance(rng, 0.7) ? [T6(int(rng, 1, 9), 6 * q)] : []), [T6(co(), 6 * r)]]; }
    if (fam === 'polySame') { const p = pick(rng, [1, 2, 3]); return [fam, [T6(co(), 6 * p), T6(int(rng, 1, 9), 6 * int(rng, 0, p - 1))], [T6(co(), 6 * p), T6(int(rng, 1, 20), 0)]]; }
    if (fam === 'nlogPow') return [fam, [T6(co(), 6, 1)], [T6(co(), pick(rng, [6, 9, 12]))]];
    if (fam === 'logPow') return [fam, [T6(1, 0, pick(rng, [2, 3]))], [T6(1, pick(rng, [2, 3, 6]))]];
    if (fam === 'powPow') { const [x, y] = sample(rng, [2, 3, 6, 9, 12, 18], 2); return [fam, [T6(co(), x)], [T6(co(), y)]]; }
    const [p6, l] = pick(rng, [[6, 0], [6, 1], [12, 0], [3, 0], [0, 1]]);
    let a = co(), c = co(); while (c === a) c = co();
    return [fam, [T6(a, p6, l)], [T6(c, p6, l)]];
  }
  G.register({
    id: 'gen-310-compare-growth', deck: DECK, lecture: '3', cat: 'Asymptotics', sub: 'Comparing growth', assignment: ['a1'],
    title: 'Compare f and g with the ratio f/g',
    make(rng) {
      let [fam, f, g] = compareInstance(rng);
      if (chance(rng, 0.5)) [f, g] = [g, f];
      const F = lead(f), Gt = lead(g);
      const dp = F.p6 - Gt.p6, dl = F.l - Gt.l;
      const c = dp !== 0 ? Math.sign(dp) : Math.sign(dl);
      const fT = sumTex(f), gT = sumTex(g);
      // The ratio of the leading terms, simplified: (a/c) n^dp (lg n)^dl, positive powers on top.
      const k = gcd(F.c, Gt.c), num = F.c / k, den = Gt.c / k;
      const top = [num === 1 ? '' : String(num), nPow(Math.max(dp, 0)), lgPow(Math.max(dl, 0))].filter(Boolean).join(' ') || '1';
      const bot = [den === 1 ? '' : String(den), nPow(Math.max(-dp, 0)), lgPow(Math.max(-dl, 0))].filter(Boolean).join(' ');
      const ratio = bot ? `\\frac{${top}}{${bot}}` : top;
      const multi = f.length > 1 || g.length > 1;
      const Ltex = c === 0 ? ratio : c < 0 ? '0' : '\\infty';
      const reason = c !== 0 && dp !== 0 && dl !== 0 ? ` (the power of ${M('n')} decides; ${M('\\lg n')} factors cannot change it)` : '';
      const holds = c === 0 ? `${M('O')}, ${M('\\Omega')}, ${M('\\Theta')} hold; ${M('o')}, ${M('\\omega')} fail` : c < 0 ? `${M('O')} and ${M('o')} hold; ${M('\\Omega')}, ${M('\\omega')}, ${M('\\Theta')} fail` : `${M('\\Omega')} and ${M('\\omega')} hold; ${M('O')}, ${M('o')}, ${M('\\Theta')} fail`;
      const OPT = { '-1': M('f(n) = o(g(n))'), 0: M('f(n) = \\Theta(g(n))'), 1: M('f(n) = \\omega(g(n))') };
      const lim = c === 0 && !multi ? `\\frac{f}{g} = ${ratio}` : `\\frac{f}{g} ${multi ? '\\approx' : '='} ${ratio} \\to ${Ltex}`;
      const why = `${multi ? 'Keep the biggest term of each: ' : ''}${M(lim)}${c === 0 ? ', a positive constant' : ''}${reason}. So ${OPT[c]}: ${holds}.`;
      // Graph: the exact ratio against m = lg n.
      const peak = fam === 'logPow' ? (Math.max(F.l, Gt.l) / (Math.max(F.p6, Gt.p6) / 6 * Math.LN2)) : 0;
      const m1 = Math.max(24, Math.ceil(3 * peak));
      const r = m => sumVal(f, 2 ** m) / sumVal(g, 2 ** m);
      const curves = [{ label: M('f(n)/g(n)'), f: r, tone: 'a' }];
      if (c === 0) curves.push({ label: `limit ${M(ratio)}`, f: () => num / den, tone: 'c' });
      const graph = { x: [1, m1], logY: c !== 0, xLabel: 'lg n', yLabel: 'f/g', curves,
        caption: c === 0 ? `The ratio settles at ${M(ratio)}.` : `The ratio ${peak ? 'may rise first, then ' : ''}${c < 0 ? 'falls toward 0' : 'grows without bound'}.` };
      return { type: 'mc', prompt: `${M('f(n) = ' + fT)}, ${M('g(n) = ' + gT)}.\nWhich holds? (Look at ${M('f(n)/g(n)')} as ${M('n \\to \\infty')}.)`,
        answer: OPT[c], options: Object.values(OPT).filter(o => o !== OPT[c]), why, source: src('Lecture 3.pdf (o, ω, Θ as limits of f/g)'),
        spec: { gen: 'compare', fam, f, g }, graph };
    },
  });
})(globalThis.FC = globalThis.FC || {});
