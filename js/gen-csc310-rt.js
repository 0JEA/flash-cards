// Generated practice for CSC 310 Assignment 2 (recursion trees, Lecure 5, M. Qasem). The
// student learns each method from the Help pages (decks/csc310-help-d.js, -e.js) and then
// practises it here on a fresh recurrence every time. Contract: js/generators.js.
// Tests: tests/gen-csc310-rt.test.js re-solves every answer by walking the actual tree.
//
//   gen-310-rt-fill     fill in levels 1–2 of the tree (node costs or sizes); a level's total
//   gen-310-rt-measure  depth, leaves, ratio r, level-i cost, which level dominates, Θ
//   gen-310-rt-uneven   T(αn) + T((1−α)n) + cn: tree sizes, shallowest / deepest leaf,
//                       why a full level costs cn, the floor/ceiling sandwich, Θ
// Every card carries `rtree` (the recursion-tree diagram, format in decks/csc310-help.js),
// drawn from THIS instance and shown once the student has answered.
//
// Notation follows her notes: f(n) = cn^k, nodes hold their own cost (cn^2/16 = c(n/4)^2),
// the root is level/depth 0, leaves are T(1). Typed answers and fill blanks are PLAIN text
// (graded after removing spaces, $ and case), so each prompt shows the exact format.
//
// ACADEMIC INTEGRITY: Assignment 2 (graded) is a split into thirds. Nothing here uses b = 3,
// a 1/3–2/3 split, or base 3/2. Uneven splits are 1/4–3/4, 1/5–4/5 and 2/5–3/5 only, and
// their bases are written \tfrac{4}{3}, \tfrac{5}{3}, so no text contains "/3" (the test
// scans 1000 instances of every a2 generator for those patterns).
(function (FC) {
  'use strict';
  const G = FC.gen;
  if (!G) throw new Error('load js/generators.js before js/gen-csc310-rt.js');
  const { int, pick } = G;
  const BASE = { deck: 'csc310', lecture: '5', cat: 'Recurrences', sub: 'Recursion trees', assignment: ['a2'] };
  const source = 'Generated practice (new problem each time); method from Lecure 5.pdf (recursion trees, AUCSC 310, M. Qasem)';
  const M = s => '$' + s + '$';
  const uniq = a => [...new Set(a)];
  const gcd = (x, y) => (y ? gcd(y, x % y) : Math.abs(x));
  const red = (p, q) => { const g = gcd(p, q); return [p / g, q / g]; };
  function weighted(rng, ps) {
    const total = ps.reduce((s, p) => s + p[1], 0);
    let r = rng() * total;
    for (const [k, w] of ps) { if ((r -= w) < 0) return k; }
    return ps[ps.length - 1][0];
  }
  // Typed forms: as written, plus with spaces removed (unless that glues two numbers together).
  function typedAns(forms) {
    const u = uniq(forms.map(String).concat(forms.map(String).filter(s => !/\d\s+\d/.test(s)).map(s => s.replace(/\s+/g, ''))));
    return { answer: u[0], accept: u.slice(1) };
  }

  // ── Terms and their spellings ──────────────────────────────────────────
  // log_b a as a fraction [num, den] when rational (a^den = b^num), else null.
  function ratLog(a, b) {
    if (a === 1) return [0, 1];
    for (let y = 1; y <= 6; y++) for (let x = 1; x <= 24; x++) if (a ** y === b ** x) return [x, y];
    return null;
  }
  const fStr = k => 'cn' + (k === 1 ? '' : '^' + k);          // cn, cn^2 (TeX and plain alike)
  const logPlain = b => {
    const L = [`log_${b} n`, `log${b} n`, `log_${b}(n)`, `log${b}(n)`, `log_{${b}} n`, `log base ${b} of n`];
    return b === 2 ? ['lg n', 'lg(n)', 'log n', 'log(n)'].concat(L) : L;
  };
  // n^(log_b a): TeX and typed forms.
  function powTex(a, b) {
    const r = ratLog(a, b);
    if (!r) return `n^{\\log_{${b}} ${a}}`;
    const [x, y] = r;
    if (x === 0) return '1';
    if (y === 1) return x === 1 ? 'n' : `n^{${x}}`;
    return `n^{${x}/${y}}`;
  }
  function powPlain(a, b) {
    const r = ratLog(a, b);
    if (r) {
      const [x, y] = r;
      if (x === 0) return ['1', 'n^0'];
      if (y === 1) return x === 1 ? ['n', 'n^1'] : [`n^${x}`, `n^(${x})`];
      const out = [`n^(${x}/${y})`, `n^${x}/${y}`, `n^${x / y}`, `n^(${x / y})`];
      return x === 1 && y === 2 ? out.concat(['sqrt n', 'sqrt(n)', '√n']) : out;
    }
    const e = Math.log(a) / Math.log(b);
    const L = [`log_${b} ${a}`, `log${b} ${a}`, `log_${b}(${a})`, `log${b}(${a})`, `log_{${b}} ${a}`].concat(b === 2 ? [`lg ${a}`, `lg(${a})`] : []);
    return L.map(s => `n^(${s})`).concat(L.map(s => `n^${s}`), [`n^${e.toFixed(3)}`, `n^${e.toFixed(2)}`]);
  }
  // Θ class n^e (lg n)^l: { k } (e = k), or { a, b } (e = log_b a), with l = 0 or 1.
  const LG = ['lg n', 'log n', 'log2 n', 'log_2 n', 'lg(n)', 'log(n)'];
  function thetaAns(t) {
    const N = t.a ? powPlain(t.a, t.b) : t.k === 1 ? ['n'] : [`n^${t.k}`, `n^(${t.k})`];
    const cores = t.l ? N.flatMap(x => LG.flatMap(y => [`${x} ${y}`, `${x}*${y}`])) : N;
    const all = [];
    for (const c of cores) all.push(`Θ(${c})`, `theta(${c})`, `big theta(${c})`, c);
    return typedAns(all);
  }
  const thetaTex = t => `\\Theta(${t.a ? powTex(t.a, t.b) : t.k === 1 ? 'n' : `n^{${t.k}}`}${t.l ? ' \\lg n' : ''})`;
  const TYPE_THETA = 'Type it like Θ(n^2), Θ(n lg n) or Θ(n^(log_7 2)).';

  // p/q · f as TeX (reduced fraction; nothing when it is 1).
  const coefTex = (p, q, f) => (q === 1 ? (p === 1 ? '' : String(p)) : `\\tfrac{${p}}{${q}}\\,`) + f;
  // Typed spellings of (p/q)·f, reduced and unreduced.
  function coefPlain(pairs, f) {
    const out = [];
    for (const [p, q] of pairs) {
      if (q === 1) { out.push(p === 1 ? f : `${p}${f}`, `${p} ${f}`, `${p}*${f}`, `${p}·${f}`); continue; }
      out.push(`${p === 1 ? '' : p}${f}/${q}`, `${p}${f}/${q}`, `${p}/${q} ${f}`, `(${p}/${q})${f}`, `(${p}/${q}) ${f}`, `(${p}/${q})*${f}`,
        `${p}/${q}*${f}`, `${p}*${f}/${q}`, `(${p}${f})/${q}`, `${f}*${p}/${q}`, `${f}(${p}/${q})`);
    }
    return uniq(out);
  }

  // ═══════════════════════ Even splits: T(n) = aT(n/b) + cn^k ═══════════════════════
  const recTex = ({ a, b, k }) => `T(n) = ${a === 1 ? '' : a}T(n/${b}) + ${fStr(k)}`;
  const ratioOf = ({ a, b, k }) => red(a, b ** k);               // level i+1 / level i
  const levelTex = (I, i) => { const [p, q] = ratioOf(I); return coefTex(p ** i, q ** i, fStr(I.k)); };
  const nodeTex = (I, i) => (i ? `\\tfrac{${fStr(I.k)}}{${I.b ** (i * I.k)}}` : fStr(I.k));
  const leavesTex = ({ a, b }) => powTex(a, b);
  const many = (cnt, lab) => (cnt <= 4 ? Array(cnt).fill(lab) : [lab, lab, M('\\cdots'), lab, lab]);

  // Levels 0–1 with their totals, then the leaf row: a^(log_b n) = n^(log_b a) leaves.
  // Four rows: the diagram's rows are a fixed 54px, and it must fit under the answer at 632×595.
  function evenRtree(I) {
    const row = i => ({ nodes: many(I.a ** i, M(nodeTex(I, i))), sum: M(levelTex(I, i)) });
    const leaf = M('T(1)');
    return { sumsLabel: 'level total',
      levels: [row(0), row(1), { gap: true }, { nodes: I.a === 1 ? [leaf] : [leaf, leaf, M('\\cdots'), leaf, leaf], sum: M(`\\Theta(${leavesTex(I)})`) }] };
  }

  // ─────────────── 1. Fill in the tree ───────────────
  G.register({
    ...BASE, id: 'gen-310-rt-fill',
    title: 'Fill in a recursion tree: node costs, sizes, a level total',
    make(rng) {
      const kind = weighted(rng, [['costs', 3], ['sizes', 1.2], ['total', 2]]);
      const I = { a: pick(rng, [2, 2, 3]), b: pick(rng, [2, 4, 5]), k: pick(rng, [1, 2, 2, 3]) };
      if (I.b === 5 && I.k === 3) I.k = 2;                      // keep denominators short
      const { a, b, k } = I, f = fStr(k), rec = M(recTex(I));
      const spec = { kind, a, b, k };
      const pw = k === 1 ? '' : '^' + k;
      const one = i => `c(n/${b ** i})${pw}`;                   // her c(n/4)^2 form
      if (kind === 'total') {
        const j = int(rng, 1, a === 3 ? 2 : 3), [p, q] = ratioOf(I), P = p ** j, Q = q ** j;
        spec.j = j;
        const D = b ** (j * k);
        return { rtree: evenRtree(I), type: 'typed', prompt: `${rec}\nWhat do ALL the nodes on level ${j} of its recursion tree cost together? (Root = level 0.) Type it like 5${f}/49.`,
          ...typedAns(coefPlain([[P, Q], [a ** j, D]], f)),
          why: `Level ${j}: ${j === 1 ? a : M(`${a}^{${j}} = ${a ** j}`)} nodes of size ${M(`n/${b ** j}`)}, each costing ${M(`${one(j)} = \\tfrac{${f}}{${D}}`)}. Total ${M(`${a ** j} \\cdot \\tfrac{${f}}{${D}} = ${coefTex(P, Q, f)}`)}.`,
          source, spec };
      }
      const sizes = kind === 'sizes';
      const lab = i => (sizes ? (i ? `n/${b ** i}` : 'n') : (i ? `${f}/${b ** (i * k)}` : f));
      const pre1 = rng() < 0.35;                                 // sometimes level 1 is given
      const node = (i, blank, kids = []) => (blank ? { label: '', blank: true, answer: M(lab(i)), kids } : { label: M(lab(i)), kids });
      const grand = () => Array.from({ length: a }, () => node(2, true));
      // a = 3: only the first call's children are drawn (9 would be the same label 9 times).
      const kids = Array.from({ length: a }, (_, j) => node(1, !pre1, a === 2 || j === 0 ? grand() : [{ label: M('\\cdots'), kids: [] }]));
      const tree = node(0, false, kids);
      spec.pre1 = pre1;
      const what = sizes ? 'the size of its subproblem' : 'that call’s own cost';
      const like = sizes ? 'n/49' : `${f}/49`;
      const prompt = `Tree for ${rec}: each node is ${what}. Fill in the blanks${pre1 ? ' on level 2' : ''}. Type like ${like}${sizes ? '' : ' (c first)'}.${a === 3 ? ' Only the first call’s children are drawn.' : ''}`;
      const why = sizes
        ? `Each call divides its size by ${b}: level 1 is ${M(`n/${b}`)}, level 2 is ${M(`n/${b}/${b} = n/${b * b}`)}. The ${a} only sets how many nodes a level has (${a * a} on level 2), not their size.`
        : `A node of size ${M('m')} costs ${M('c' + 'm' + pw)}. Level 1 has size ${M(`n/${b}`)}: ${M(`${one(1)} = ${lab(1)}`)}. Level 2, size ${M(`n/${b * b}`)}: ${M(`${one(2)} = ${lab(2)}`)}. Level totals (${a}, ${a * a} nodes): ${M(levelTex(I, 1))}, ${M(levelTex(I, 2))}.`;
      return { type: 'fill', prompt, tree, answer: `${lab(1)}, ${lab(2)}`, why, source, spec, rtree: evenRtree(I) };
    },
  });

  // ─────────────── 2. Measure the tree ───────────────
  function measureInst(rng) {
    const target = weighted(rng, [['root', 1], ['equal', 1], ['leaves', 1]]);
    for (;;) {
      const a = pick(rng, [1, 2, 3, 4, 5, 6, 7, 8, 9, 16]), b = pick(rng, [2, 4, 5]), k = pick(rng, [1, 1, 2, 2, 3]);
      const s = Math.sign(a - b ** k), dom = s < 0 ? 'root' : s === 0 ? 'equal' : 'leaves';
      if (dom === target) return { a, b, k, dom };
    }
  }
  const DOM = { root: 'The root level dominates', equal: 'Every level costs the same', leaves: 'The leaf level dominates' };
  G.register({
    ...BASE, id: 'gen-310-rt-measure',
    title: 'Measure a recursion tree: depth, leaves, level cost, Θ',
    make(rng) {
      const I = measureInst(rng), { a, b, k, dom } = I, f = fStr(k), rec = M(recTex(I));
      const kind = weighted(rng, [['depth', 1], ['depthN', 1], ['leaves', 1.2], ['leavesN', 1], ['ratio', 1], ['levelCost', 1.2], ['dominant', 1], ['theta', 1.4]]);
      const spec = { kind, a, b, k, dom };
      const [p, q] = ratioOf(I), rT = q === 1 ? String(p) : `\\tfrac{${p}}{${q}}`;
      const rtree = evenRtree(I);
      const card = (o, why) => ({ ...o, why, source, spec, rtree });
      const typed = (q2, ans, why) => card({ type: 'typed', prompt: `${rec}\n${q2}`, ...(typeof ans === 'object' ? ans : { answer: String(ans) }) }, why);
      const shrink = `size ÷ ${b}${k === 1 ? '' : `, cost is size${'^' + k}`}`;
      const rWhy = `Down one level: ${a}× the nodes, each costing ${M(`1/${b ** k}`)} as much (${shrink}). So ${M(`r = ${a}/${b ** k}${p !== a ? ' = ' + (q === 1 ? p : `${p}/${q}`) : ''}`)}`;
      if (kind === 'depth' || kind === 'depthN') {
        if (kind === 'depth') {
          return typed(`At what depth are the leaves (subproblems of size 1)? Root = depth 0. Type like log_7 n.`, typedAns(logPlain(b)),
            `Depth ${M('i')} has size ${M(`n/${b}^i`)}. It is 1 when ${M(`${b}^i = n`)}, so ${M(`i = \\log_{${b}} n`)}. The ${a} (calls per node) sets the width, not the depth.`);
        }
        const h = int(rng, 3, b === 2 ? 7 : 5), n = b ** h;
        spec.n = n;
        const chain = Array.from({ length: h + 1 }, (_, i) => n / b ** i);
        return typed(`Take ${M(`n = ${n}`)}. At what depth are the leaves (size 1)? Root = depth 0.`, h,
          `Each level divides the size by ${b}: ${chain.join(' → ')}. That is ${h} steps, so ${M(`\\log_{${b}} ${n} = ${h}`)}.`);
      }
      if (kind === 'leaves') {
        const forms = powPlain(a, b).concat(a === 1 ? [] : [`${a}^(log_${b} n)`, `${a}^log_${b} n`, `${a}^(log${b} n)`]);
        const r = ratLog(a, b);
        return typed(`How many leaves does its tree have? Write it as a power of n, like n^2 or n^(log_7 2).`, typedAns(forms),
          a === 1 ? `One call per node: a single path, so 1 leaf (${M('1^{\\log_' + b + ' n} = 1')}).`
            : `Level ${M('i')} has ${M(`${a}^i`)} nodes; leaves are at depth ${M(`\\log_{${b}} n`)}. So ${M(`${a}^{\\log_{${b}} n} = n^{\\log_{${b}} ${a}}`)}${r && r[0] ? ` ${M('= ' + leavesTex(I))}, since ${M(`${b}^{${r[0]}${r[1] === 1 ? '' : '/' + r[1]}} = ${a}`)}` : ''}.`);
      }
      if (kind === 'leavesN') {
        const h = int(rng, 2, b === 2 ? 5 : 3), n = b ** h;
        spec.n = n;
        return typed(`Take ${M(`n = ${n}`)}. How many leaves does the tree have?`, a ** h,
          `Leaves are at depth ${M(`\\log_{${b}} ${n} = ${h}`)}, and each level has ${a}× as many nodes: ${M(`${a}^{${h}} = ${a ** h}`)}. Check: ${M(`${n}^{\\log_{${b}} ${a}} = ${a ** h}`)}.`);
      }
      if (kind === 'ratio') {
        const dec = String(p / q);
        const forms = uniq([q === 1 ? String(p) : `${p}/${q}`, `${a}/${b ** k}`, dec, `(${p}/${q})`].concat(dec.startsWith('0.') ? [dec.slice(1)] : []));
        return typed(`Each level of its tree costs ${M('r')} times the level above. What is ${M('r')}? Type a number or a fraction like 3/49.`, typedAns(forms), rWhy + '.');
      }
      if (kind === 'levelCost') {
        const show = ([x, y]) => (y === 1 && x === 1 ? f : y === 1 ? `${x}^i\\,${f}` : `(\\tfrac{${x}}{${y}})^i\\,${f}`);
        const right = [p, q], cands = [red(a, b), red(1, b ** k), [a, 1], red(a, b ** k * b)];
        const seen = new Set([right.join('/')]), wrong = [];
        for (const x of cands) if (!seen.has(x.join('/'))) { seen.add(x.join('/')); wrong.push(x); }
        spec.r = right;
        return card({ type: 'mc', prompt: `${rec}\nWhat do all the nodes at depth ${M('i')} cost together (above the leaves)?`,
          answer: M(show(right)), options: wrong.slice(0, 3).map(x => M(show(x))) },
        `${M(`${a}^i`)} nodes of size ${M(`n/${b}^i`)}, each ${M(`c(n/${b}^i)${k === 1 ? '' : '^' + k} = ${f}/${b ** k}^i`)}. Together ${M(`${a}^i ${f}/${b ** k}^i = ${show(right)}`)}.`);
      }
      const tail = dom === 'root' ? `${M('r < 1')}: level costs shrink geometrically, so the root's ${M(f)} dominates`
        : dom === 'equal' ? `${M('r = 1')}: every level costs ${M(f)}, and there are ${M(`\\log_{${b}} n + 1`)} levels`
          : `${M('r > 1')}: level costs grow, so the ${M(leavesTex(I))} leaves dominate`;
      if (kind === 'dominant') {
        return card({ type: 'mc', prompt: `${rec}\nGoing down its recursion tree, which level(s) decide the total?`, answer: DOM[dom], options: Object.values(DOM).filter(o => o !== DOM[dom]) },
          `${rWhy}; ${tail}.`);
      }
      const t = dom === 'root' ? { k, l: 0 } : dom === 'equal' ? { k, l: 1 } : { a, b, l: 0 };
      return typed(`Use the recursion tree to give ${M('T(n)')} in Θ form. ${TYPE_THETA}`, thetaAns(t), `${M(`r = ${rT}`)}. ${tail}. ${M('T(n) = ' + thetaTex(t))}.`);
    },
  });

  // ═══════════════════════ 3. Uneven splits: T(αn) + T((1−α)n) + cn ═══════════════════════
  // α = p/q, β = (q − p)/q. ONLY these three splits (never thirds: Assignment 2).
  const SPLITS = [[1, 4], [1, 5], [2, 5]];
  const sizePlain = (num, den) => (den === 1 ? 'n' : `${num === 1 ? '' : num}n/${den}`);
  const sizeTex = (num, den, v = 'n') => (den === 1 ? v : `\\tfrac{${num === 1 ? '' : num}${v}}{${den}}`);
  const baseTex = ([x, y]) => (y === 1 ? String(x) : `\\tfrac{${x}}{${y}}`);
  const basePow = B => (B[1] === 1 ? `${B[0]}^i` : `(${baseTex(B)})^i`);
  const logTex = B => `\\log_{${baseTex(B)}} n`;
  function unevenRtree(S) {
    const { p, q, r } = S;
    const lab = (num, den) => M(sizeTex(num, den, 'cn'));
    return { sumsLabel: 'level total',
      levels: [
        { nodes: [lab(1, 1)], sum: M('cn') },
        { nodes: [lab(p, q), lab(r, q)], sum: M('cn') },
        { gap: true },
        { nodes: [M('\\cdots'), M('T(1)')], sum: M('< cn') },
      ] };
  }
  // Smallest depth i with N·(num/den)^i <= 1, from logs (exact powers land on an integer).
  function edgeDepth(N, num, den) {
    const x = Math.log(N) / Math.log(den / num), r = Math.round(x);
    return { x, i: Math.abs(x - r) < 1e-9 ? r : Math.ceil(x), exact: Math.abs(x - r) < 1e-9 };
  }
  G.register({
    ...BASE, id: 'gen-310-rt-uneven',
    title: 'Uneven recursion tree: sizes, shortest and longest path, bounds',
    make(rng) {
      const [p, q] = pick(rng, SPLITS), r = q - p;
      const S = { p, q, r, shallow: [q, p], deep: red(q, r) };
      const kind = weighted(rng, [['fill', 1.6], ['shallow', 1], ['deep', 1.2], ['shallowN', 1], ['deepN', 1.2], ['levelsum', 1], ['partial', 0.8], ['lower', 1], ['upper', 1], ['theta', 0.8], ['const', 0.8]]);
      const smallFirst = kind === 'fill' || rng() < 0.7;
      const terms = [`T(${sizePlain(p, q)})`, `T(${sizePlain(r, q)})`];
      const recT = `T(n) = ${(smallFirst ? terms : terms.slice().reverse()).join(' + ')} + cn`, rec = M(recT);
      const spec = { kind, uneven: true, p, q };
      const rtree = unevenRtree(S);
      const sh = logTex(S.shallow), dp = logTex(S.deep);
      const aT = `\\tfrac{${p}}{${q}}`, bT = `\\tfrac{${r}}{${q}}`;
      const card = (o, why) => ({ ...o, why, source, spec, rtree });
      if (kind === 'fill') {
        const pre1 = rng() < 0.4;
        const kid = (num, den, blank, kids = []) => (blank ? { label: '', blank: true, answer: M(sizePlain(num, den)), kids } : { label: M(sizePlain(num, den)), kids });
        const g = x => kid(x, q * q, true);
        const tree = kid(1, 1, false, [kid(p, q, !pre1, [g(p * p), g(p * r)]), kid(r, q, !pre1, [g(r * p), g(r * r)])]);
        spec.pre1 = pre1;
        const l2 = [p * p, p * r, r * r].map(x => sizePlain(x, q * q));
        return card({ type: 'fill', prompt: `Tree for ${rec}: each node is its subproblem size, the ${M(aT)} piece on the left. Fill in the blanks${pre1 ? ' on level 2' : ''}. Type like 7n/64 or n/64.`,
          tree, answer: [sizePlain(p, q), sizePlain(r, q)].concat(l2).join(', ') },
        `A node of size ${M('m')} has children ${M(sizeTex(p, q, 'm'))} and ${M(sizeTex(r, q, 'm'))}. Level 1: ${M(sizeTex(p, q) + ',\\ ' + sizeTex(r, q))}. Level 2: ${M(l2.join(',\\ '))} (middle one twice). Each level adds to ${M('n')}, so costs ${M('cn')}.`);
      }
      if (kind === 'shallow' || kind === 'deep') {
        const want = kind === 'shallow' ? S.shallow : S.deep;
        const cand = [S.shallow, S.deep, [2, 1], kind === 'shallow' ? [p, q] : [r, q]].map(B => M(logTex(B)));
        const answer = M(logTex(want)), options = uniq(cand).filter(o => o !== answer).slice(0, 3);
        const why = kind === 'shallow'
          ? `Always taking the small piece ${M(aT)} shrinks fastest: size ${M(`n(${aT})^i = n/${basePow(S.shallow)}`)}, which is 1 at ${M('i = ' + sh)}. The number of children (2) does not set the depth.`
          : `Always taking the big piece ${M(bT)} shrinks slowest: size ${M(`n(${bT})^i = n/${basePow(S.deep)}`)}, which is 1 at ${M('i = ' + dp)}. The base is flipped to be ${M('> 1')}.`;
        return card({ type: 'mc', prompt: `${rec}\nHow deep is the ${kind === 'shallow' ? 'shallowest' : 'deepest'} leaf of its recursion tree?`, answer, options }, why);
      }
      if (kind === 'shallowN' || kind === 'deepN') {
        const small = kind === 'shallowN', [num, den] = small ? [p, q] : [r, q], B = small ? S.shallow : S.deep;
        const N = small && p === 1 && rng() < 0.4 ? q ** int(rng, 3, 5) : int(rng, 40, 5000);
        const { x, i, exact } = edgeDepth(N, num, den);
        spec.N = N;
        return card({ type: 'typed', prompt: `${rec}, ${M(`n = ${N}`)}. A piece of size ${M('\\le 1')} is a leaf. How deep is the ${small ? 'shallowest' : 'deepest'} leaf? (Root = depth 0.)`, answer: String(i) },
          `The ${small ? 'shallowest' : 'deepest'} path always keeps ${M(small ? aT : bT)}: size ${M(`${N}(${small ? aT : bT})^i`)}. That is ${M('\\le 1')} once ${M(`i \\ge \\log_{${baseTex(B)}} ${N} ${exact ? '=' : '\\approx'} ${exact ? x.toFixed(0) : x.toFixed(2)}`)}, so depth ${i}.`);
      }
      if (kind === 'levelsum') {
        const answer = `The two pieces add up to the parent (${M(`${sizeTex(p, q, 'm')} + ${sizeTex(r, q, 'm')} = m`)}), so a full level’s sizes add to ${M('n')}`;
        return card({ type: 'mc', prompt: `${rec}\nWhy does every complete level of its recursion tree cost exactly ${M('cn')}?`, answer,
          options: [`Each level has two nodes, each costing ${M('\\tfrac{cn}{2}')}`, `Every node costs ${M('cn')}, whatever its size`, `There are ${M(sh)} levels`] },
        `A node of size ${M('m')} costs ${M('cm')}; its children have sizes ${M(sizeTex(p, q, 'm'))} and ${M(sizeTex(r, q, 'm'))}, which add to ${M('m')}. So each full level’s sizes add to ${M('n')} and it costs ${M('cn')}.`);
      }
      if (kind === 'partial') {
        const answer = `At most ${M('cn')}: some branches have already ended`;
        return card({ type: 'mc', prompt: `${rec}\nWhat do the levels deeper than ${M(sh)} (the shallowest leaf) cost?`, answer,
          options: [`Exactly ${M('cn')}, like every level`, `More than ${M('cn')}: there are more nodes`, 'Nothing: the tree stops there'] },
        `Down to depth ${M(sh)} no branch has ended, so each level is complete: ${M('cn')}. Below it, finished branches leave gaps, so a level costs ${M('\\le cn')}, until the last leaf at ${M(dp)}.`);
      }
      if (kind === 'lower' || kind === 'upper') {
        const lower = kind === 'lower';
        const answer = M(lower ? `T(n) \\ge cn\\,${sh}` : `T(n) \\le cn\\,(${dp} + 1)`);
        const options = lower ? [M(`T(n) \\ge cn\\,${dp}`), M(`T(n) \\ge c\\,${sh}`), M('T(n) \\ge cn^2')]
          : [M(`T(n) \\le cn\\,(${sh} + 1)`), M(`T(n) \\le c\\,(${dp} + 1)`), M('T(n) \\le 2cn')];
        return card({ type: 'mc', prompt: `${rec}\n${lower ? 'Counting only the complete levels gives which lower bound?' : 'Counting every level as full gives which upper bound?'}`, answer, options },
          lower ? `Depths ${M('0')} to ${M(sh)} are complete, each costing ${M('cn')}; the rest costs ${M('\\ge 0')}. So ${M(`T(n) \\ge cn\\,${sh}`)} ${M('= \\Omega(n \\lg n)')}.`
            : `At most ${M(dp + ' + 1')} levels (depth 0 to the deepest leaf), each costing ${M('\\le cn')}. So ${M(`T(n) \\le cn(${dp} + 1)`)} ${M('= O(n \\lg n)')}.`);
      }
      if (kind === 'theta') {
        return card({ type: 'typed', prompt: `${rec}\nSqueeze ${M('T(n)')} between the complete levels and the deepest leaf. What is ${M('T(n)')} in Θ form? ${TYPE_THETA}`, ...thetaAns({ k: 1, l: 1 }) },
          `Floor: ${M(sh + ' + 1')} full levels of ${M('cn')}: ${M('\\Omega(n \\lg n)')}. Ceiling: ${M(dp + ' + 1')} levels, each ${M('\\le cn')}: ${M('O(n \\lg n)')}. Both logs are constants times ${M('\\lg n')}, so ${M('\\Theta(n \\lg n)')}.`);
      }
      // const: change of base for one of the two depths.
      const small = rng() < 0.4, B = small ? S.shallow : S.deep, lgB = Math.log2(B[0] / B[1]), K = 1 / lgB;
      spec.B = B;
      const forms = uniq([K.toFixed(2), K.toFixed(1), K.toFixed(3)].concat(K < 1 ? [K.toFixed(2).slice(1), K.toFixed(1).slice(1)] : []).flatMap(s => [s, s.replace(/0+$/, '').replace(/\.$/, '')]));
      return card({ type: 'typed', prompt: `${rec}\nIts ${small ? 'shallowest' : 'deepest'} leaf is at depth ${M(logTex(B))}. Written as ${M('K \\lg n')}, what is ${M('K')}? (2 decimals)`, ...typedAns(forms) },
        `Change of base: ${M(`${logTex(B)} = \\frac{\\lg n}{\\lg ${baseTex(B)}}`)}, and ${M(`\\lg ${baseTex(B)} \\approx ${lgB.toFixed(3)}`)}. So ${M(`K = 1/${lgB.toFixed(3)} \\approx ${K.toFixed(2)}`)}: still a constant times ${M('\\lg n')}.`);
    },
  });
})(globalThis.FC = globalThis.FC || {});
