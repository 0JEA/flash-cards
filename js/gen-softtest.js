// Generated practice for AUCSC 325 Software Testing (deck 'softtest'). Each generator builds a
// NEW problem from the seeded rng (fresh function, numbers, names) and a solver computes the
// answer, so the learner practises the procedure, not one memorised answer (research/04 rules
// 10 and 21). Contract: js/generators.js. Tests: tests/gen-softtest.test.js, which re-check every
// answer by an independent route (executing the displayed code, brute-force path enumeration,
// re-parsing the spec text).
//
// Definitions follow the instructor's slides:
//   Lecture 13: CFG nodes N0…, node / edge / edge-pair / complete / prime path coverage,
//               coverage level = satisfied test requirements / |TR|, "a test path tours a prime path
//               if the prime path appears inside it".
//   Lecture 12: equivalence classes, boundary values "inside, at boundary, outside".
//   Lecture 10: reach the fault, the state triggers (infects) it, it propagates to the output.
//   Lecture 4:  mutation score MS = K / (M − E); availability = MTBF / (MTBF + MTTR).
(function (FC) {
  'use strict';
  const G = FC.gen;
  const { int, pick, shuffle } = G;

  const L4 = 'Lecture 4 (Dependability & Systematic Testing)';
  const L10 = 'Lecture 10 (Reachability, Observability, BlackBox Testing)';
  const L12 = 'Lecture 12 (BlackBox Testing)';
  const L13 = 'Lecture 13 (Code Coverage)';
  const GEN = 'Generated practice · ';

  // ───────────── answer forms ─────────────
  const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
  const trimNum = s => (s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s);
  // x rounded to each number of decimal places, with and without trailing zeros and leading 0.
  function decForms(x, dps) {
    const out = new Set();
    for (const d of dps) { const f = x.toFixed(d); out.add(f); out.add(trimNum(f)); }
    for (const s of [...out]) if (s.startsWith('0.')) out.add(s.slice(1));
    return [...out];
  }
  const isExact = (x, dp) => Math.abs(Math.round(x * 10 ** dp) - x * 10 ** dp) < 1e-9;
  function pctForms(p, dps) {
    const out = [];
    for (const s of decForms(p, dps)) out.push(s + '%', s + ' %', s);
    return out;
  }
  // Every accepted spelling, minus anything equal to the answer itself (deck rule).
  function acceptList(answer, forms) {
    const norm = s => String(s).replace(/\s+/g, ' ').trim().toLowerCase();
    const a = norm(answer);
    return [...new Set(forms.map(String))].filter(f => norm(f) !== a);
  }
  // A coverage level c/t: the fraction (as counted, and reduced), percent to 1–2 dp, decimal to 3 dp.
  function fracAccept(c, t) {
    const g = gcd(c, t) || 1;
    const forms = [`${c}/${t}`, `${c} / ${t}`, `${c / g}/${t / g}`, `${c / g} / ${t / g}`];
    const p = 100 * c / t;
    forms.push(...pctForms(p, [1, 2]));
    if (isExact(p, 0)) forms.push(...pctForms(p, [0]));
    forms.push(...decForms(c / t, [3]));
    if (isExact(c / t, 2)) forms.push(...decForms(c / t, [2]));
    if (c === t) forms.push('1', '100%', '100');
    return forms;
  }
  const fmtPct = (c, t) => `${(100 * c / t).toFixed(1)}%`;

  // ───────────── a tiny language: sequence / if / if-else / while / return ─────────────
  const num = v => ({ k: 'num', v }), vr = n => ({ k: 'var', n });
  const bin = (op, l, r) => ({ k: 'bin', op, l, r }), cmp = (op, l, r) => ({ k: 'cmp', op, l, r });
  const assign = (v, e, decl) => ({ t: 'assign', v, e, decl: !!decl });
  const iff = (c, then, els) => ({ t: 'if', c, then, els: els || null });
  const wh = (c, body) => ({ t: 'while', c, body });
  const ret = e => ({ t: 'return', e });

  // Expression text is the same in both display languages (only `%` with == 0 / != 0, so the
  // Python and JS results agree on negative numbers too).
  function ex(e) {
    if (e.k === 'num') return String(e.v);
    if (e.k === 'var') return e.n;
    return `${ex(e.l)} ${e.op} ${ex(e.r)}`;
  }
  function ev(e, env) {
    switch (e.k) {
      case 'num': return e.v;
      case 'var': if (!(e.n in env)) throw new Error('unbound ' + e.n); return env[e.n];
      case 'bin': {
        const a = ev(e.l, env), b = ev(e.r, env);
        return e.op === '+' ? a + b : e.op === '-' ? a - b : e.op === '*' ? a * b : a % b;
      }
      default: {
        const a = ev(e.l, env), b = ev(e.r, env);
        switch (e.op) {
          case '<': return a < b; case '<=': return a <= b; case '>': return a > b;
          case '>=': return a >= b; case '==': return a === b; default: return a !== b;
        }
      }
    }
  }
  const cloneFn = fn => ({ name: fn.name, params: fn.params.slice(), body: JSON.parse(JSON.stringify(fn.body)), exit: fn.exit, n: fn.n });

  function walk(ss, f) {
    for (const s of ss) { f(s); if (s.t === 'if') { walk(s.then, f); if (s.els) walk(s.els, f); } else if (s.t === 'while') walk(s.body, f); }
  }
  // Node ids in source order: N0 = header, then every statement / condition, then the exit.
  function number(fn) {
    let id = 0;
    walk(fn.body, s => { s.id = ++id; });
    fn.exit = ++id; fn.n = id + 1;
    return fn;
  }
  function stmtById(fn, id) { let r = null; walk(fn.body, s => { if (s.id === id) r = s; }); return r; }
  const hasLoop = fn => { let l = false; walk(fn.body, s => { if (s.t === 'while') l = true; }); return l; };

  // CFG edges with a tag saying why each exists (used in the worked solutions).
  function edgesOf(fn) {
    const E = [];
    const add = (a, b, tag) => { if (!E.some(e => e[0] === a && e[1] === b)) E.push([a, b, tag]); };
    const link = (ss, next, loopHead) => {
      ss.forEach((s, i) => {
        const nx = i + 1 < ss.length ? ss[i + 1].id : next;
        const flow = nx === loopHead && i + 1 === ss.length ? 'back' : 'next';
        if (s.t === 'assign') add(s.id, nx, flow);
        else if (s.t === 'return') add(s.id, fn.exit, 'return');
        else if (s.t === 'if') {
          add(s.id, s.then[0].id, 'true'); link(s.then, nx, i + 1 === ss.length ? loopHead : null);
          if (s.els) { add(s.id, s.els[0].id, 'false'); link(s.els, nx, i + 1 === ss.length ? loopHead : null); } else add(s.id, nx, 'false');
        } else {
          add(s.id, s.body[0].id, 'enter'); link(s.body, s.id, s.id); add(s.id, nx, 'leave');
        }
      });
    };
    add(0, fn.body[0].id, 'next');
    link(fn.body, fn.exit, null);
    return E.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  }
  const edgeText = E => E.map(([a, b]) => `N${a}→N${b}`).join(', ');
  const pathText = p => p.map(n => 'N' + n).join(',');
  const pathBr = p => '[' + p.map(n => 'N' + n).join(', ') + ']';

  // Display lines: { ind, text, node } (node null for `else` / closing braces).
  function lines(fn, lang) {
    const py = lang === 'py', L = [];
    L.push({ ind: 0, text: py ? `def ${fn.name}(${fn.params.join(', ')}):` : `function ${fn.name}(${fn.params.join(', ')}) {`, node: 0 });
    const w = (ss, ind) => {
      for (const s of ss) {
        if (s.t === 'assign') L.push({ ind, text: py ? `${s.v} = ${ex(s.e)}` : `${s.decl ? 'let ' : ''}${s.v} = ${ex(s.e)};`, node: s.id });
        else if (s.t === 'return') L.push({ ind, text: py ? `return ${ex(s.e)}` : `return ${ex(s.e)};`, node: s.id });
        else if (s.t === 'if') {
          L.push({ ind, text: py ? `if ${ex(s.c)}:` : `if (${ex(s.c)}) {`, node: s.id });
          w(s.then, ind + 1);
          if (s.els) { L.push({ ind, text: py ? 'else:' : '} else {', node: null }); w(s.els, ind + 1); }
          if (!py) L.push({ ind, text: '}', node: null });
        } else {
          L.push({ ind, text: py ? `while ${ex(s.c)}:` : `while (${ex(s.c)}) {`, node: s.id });
          w(s.body, ind + 1);
          if (!py) L.push({ ind, text: '}', node: null });
        }
      }
    };
    w(fn.body, 1);
    L.push(py ? { ind: 1, text: '# exit', node: fn.exit } : { ind: 0, text: '}', node: fn.exit, exit: true });
    return L;
  }
  function render(fn, lang, labels) {
    const L = lines(fn, lang).filter(l => labels || !(lang === 'py' && l.text === '# exit'));
    const pad = lang === 'py' ? '    ' : '  ';
    const body = L.map(l => pad.repeat(l.ind) + l.text);
    if (!labels) return body.join('\n');
    const width = Math.max(...body.map(s => s.length)) + 3;
    const c = lang === 'py' ? '#' : '//';
    return L.map((l, i) => (l.node == null ? body[i] : body[i].padEnd(width) + `${c} N${l.node}${l.exit ? ' (exit)' : ''}`)).join('\n');
  }
  // Short text of each node, for worked solutions.
  function nodeTexts(fn, lang) {
    const t = {};
    for (const l of lines(fn, lang)) if (l.node != null) t[l.node] = l.node === fn.exit ? 'exit' : l.text.replace(/\s*[{:]$/, '').replace(/;$/, '');
    return t;
  }
  const sig = fn => `${fn.name}(${fn.params.join(', ')})`;
  const call = (fn, args) => `${fn.name}(${args.join(', ')})`;
  const CONV = 'Lecture convention: N0 is the function header, every statement and every if/while condition is one node, “else” and closing braces are not nodes, and there is one exit node.';

  // ───────────── interpreter (traces the node path; optionally watches a seeded fault) ─────────────
  const CAP = 5000, RUNAWAY = {};
  function run(fn, args, fault) {
    const env = Object.create(null);
    fn.params.forEach((p, i) => { env[p] = args[i]; });
    const path = [0];
    const info = { reached: false, infected: false, got: undefined, want: undefined };
    let steps = 0;
    const tick = () => { if (++steps > CAP) throw RUNAWAY; };
    const see = (s, v) => {
      if (!fault || s.id !== fault.id) return;
      const w = ev(fault.orig, env);
      if (!info.reached) { info.reached = true; info.got = v; info.want = w; }
      if (v !== w) info.infected = true;
    };
    const exec = ss => {
      for (const s of ss) {
        tick(); path.push(s.id);
        if (s.t === 'assign') { const v = ev(s.e, env); see(s, v); env[s.v] = v; }
        else if (s.t === 'return') { const v = ev(s.e, env); see(s, v); return { v }; }
        else if (s.t === 'if') { const c = ev(s.c, env); see(s, c); const r = exec(c ? s.then : s.els || []); if (r) return r; }
        else {
          let c = ev(s.c, env); see(s, c);
          while (c) { const r = exec(s.body); if (r) return r; tick(); path.push(s.id); c = ev(s.c, env); see(s, c); }
        }
      }
      return null;
    };
    try {
      const r = exec(fn.body);
      path.push(fn.exit);
      return Object.assign({ path, ret: r ? r.v : undefined }, info);
    } catch (e) { if (e === RUNAWAY) return null; throw e; }
  }

  // Inputs: friendly values first so worked examples use small non-negative numbers.
  const DOMAIN = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, -1, -2, -3];
  const inputs = (np, dom = DOMAIN) => (np === 1 ? dom.map(v => [v]) : dom.flatMap(a => dom.map(b => [a, b])));

  // ───────────── random function generator ─────────────
  const PARAMS = ['x', 'y', 'n', 'k', 'a', 'b', 'm', 'p', 'q'];
  const ACCS = ['r', 'res', 'total', 'out', 'acc', 'val'];
  const CNTS = ['i', 'j'];
  const OPS = ['<', '<=', '>', '>=', '==', '!='];

  function condOn(rng, p) {
    if (rng() < 0.12) return cmp(pick(rng, ['==', '!=']), bin('%', vr(p), num(pick(rng, [2, 3]))), num(0));
    return cmp(pick(rng, OPS), vr(p), num(int(rng, 0, 9)));
  }
  function accUpdate(rng, acc, ps, extra) {
    const srcs = ps.concat(extra || []);
    const r = rng();
    if (r < 0.42) return assign(acc, bin(pick(rng, ['+', '-']), vr(acc), rng() < 0.6 ? vr(pick(rng, srcs)) : num(int(rng, 1, 5))));
    if (r < 0.55) return assign(acc, bin('*', vr(acc), num(int(rng, 2, 3))));
    if (r < 0.82) { const op = pick(rng, ['+', '-', '*']); return assign(acc, bin(op, vr(pick(rng, srcs)), num(int(rng, op === '*' ? 2 : 1, 4)))); }
    return assign(acc, num(int(rng, 0, 9)));
  }
  function chunk(rng, kind, acc, ps) {
    const p = pick(rng, ps);
    switch (kind) {
      case 'seq': { let u; do u = accUpdate(rng, acc, ps); while (u.e.k === 'num'); return [u]; }
      case 'if': return [iff(condOn(rng, p), [accUpdate(rng, acc, ps)])];
      case 'ifelse': return [iff(condOn(rng, p), [accUpdate(rng, acc, ps)], [accUpdate(rng, acc, ps)])];
      case 'early': return [iff(condOn(rng, p), [ret(rng() < 0.7 ? num(int(rng, -1, 9)) : vr(pick(rng, ps)))])];
      case 'count': {
        const c = pick(rng, CNTS);
        const inc = assign(c, bin('+', vr(c), num(1)));
        const parity = () => cmp(pick(rng, ['==', '!=']), bin('%', vr(c), num(2)), num(0));
        const r = rng();
        let body;
        if (r < 0.4) body = [accUpdate(rng, acc, ps, [c]), inc];
        else if (r < 0.7) body = [iff(parity(), [accUpdate(rng, acc, ps, [c])]), inc];
        else if (r < 0.85) body = [iff(parity(), [accUpdate(rng, acc, ps, [c])], [accUpdate(rng, acc, ps, [c])]), inc];
        else body = [inc, accUpdate(rng, acc, ps, [c])];
        return [assign(c, num(0), true), wh(cmp(pick(rng, ['<', '<']), vr(c), vr(p)), body)];
      }
      default: { // 'down': count a parameter down
        const dec = assign(p, bin('-', vr(p), num(int(rng, 1, 3))));
        const body = rng() < 0.5 ? [dec] : shuffle(rng, [dec, accUpdate(rng, acc, ps)]);
        return [wh(cmp('>', vr(p), num(int(rng, 0, 4))), body)];
      }
    }
  }
  function draft(rng, o) {
    const np = o.params || (rng() < 0.45 ? 1 : 2);
    const ps = shuffle(rng, PARAMS).slice(0, np);
    const acc = pick(rng, ACCS);
    const [c0, c1] = o.chunks || [1, 3];
    const nch = int(rng, c0, c1);
    const loopAt = o.loop === 'no' ? -1 : (o.loop === 'yes' || rng() < 0.45) ? int(rng, 0, nch - 1) : -1;
    const kinds = [];
    for (let i = 0; i < nch; i++) kinds.push(i === loopAt ? pick(rng, ['count', 'count', 'down']) : pick(rng, o.kinds || ['seq', 'if', 'if', 'ifelse', 'ifelse', 'early']));
    if (kinds.every(k => k === 'seq')) return null;
    const body = [assign(acc, rng() < 0.5 ? num(int(rng, 0, 3)) : vr(ps[0]), true)];
    for (const k of kinds) body.push(...chunk(rng, k, acc, ps));
    body.push(ret(vr(acc)));
    // Drop parameters the body never reads (an unused parameter only confuses the CFG).
    const used = new Set();
    const vars = e => { if (e.k === 'var') used.add(e.n); else if (e.k !== 'num') { vars(e.l); vars(e.r); } };
    walk(body, s => { if (s.t === 'if' || s.t === 'while') vars(s.c); else vars(s.e); });
    const params = ps.filter(p => used.has(p));
    if (!params.length) return null;
    return { name: pick(rng, G.NAMES.fn), params, body };
  }
  // Every CFG edge must be taken by some input (no dead code), and every run must terminate.
  function feasible(fn) {
    const E = edgesOf(fn), seen = new Set(), runs = [];
    for (const args of inputs(fn.params.length)) {
      const r = run(fn, args);
      if (!r) return false;
      runs.push({ args, path: r.path, ret: r.ret });
      for (let i = 1; i < r.path.length; i++) seen.add(r.path[i - 1] + '>' + r.path[i]);
    }
    for (const s of seen) if (!E.some(([a, b]) => a + '>' + b === s)) throw new Error('CFG is missing an executed edge ' + s);
    if (seen.size !== E.length) return false;
    fn.runs = runs;
    return true;
  }
  function genFunc(rng, o = {}) {
    for (let t = 0; t < 2000; t++) {
      const fn = draft(rng, o);
      if (!fn) continue;
      number(fn);
      const nl = lines(fn, 'py').length - 1;
      const [l0, l1] = o.lines || [4, 9];
      if (nl < l0 || nl > l1) continue;
      if (o.maxNodes && fn.n > o.maxNodes) continue;
      if ((o.loop === 'yes' && !hasLoop(fn)) || (o.loop === 'no' && hasLoop(fn))) continue;
      if (!feasible(fn)) continue;
      if (o.accept && !o.accept(fn)) continue;
      return fn;
    }
    throw new Error('genFunc: no function satisfied the constraints');
  }

  // ───────────── graph algorithms ─────────────
  function graph(fn) {
    const E = edgesOf(fn), S = Array.from({ length: fn.n }, () => []);
    for (const [a, b] of E) S[a].push(b);
    return { n: fn.n, E, S, exit: fn.exit };
  }
  const key = p => ',' + p.join(',') + ',';
  const tours = (path, sub) => key(path).includes(key(sub));
  function simplePaths(g) {
    const out = [];
    const ext = p => {
      out.push(p);
      const last = p[p.length - 1];
      if (p.length > 1 && p[0] === last) return;
      for (const m of g.S[last]) if (!p.includes(m) || m === p[0]) ext(p.concat(m));
    };
    for (let s = 0; s < g.n; s++) ext([s]);
    return out;
  }
  function primePaths(g) {
    const sp = simplePaths(g);
    const pr = sp.filter(p => !sp.some(q => q.length > p.length && tours(q, p)));
    return pr.sort((a, b) => a[0] - b[0] || b.length - a.length || key(a).localeCompare(key(b)));
  }
  function edgePairs(g) { const out = []; for (const [a, b] of g.E) for (const c of g.S[b]) out.push([a, b, c]); return out; }
  function completePaths(g) { // loop-free graphs only
    const out = [];
    const dfs = p => { const last = p[p.length - 1]; if (last === g.exit) { out.push(p); return; } for (const m of g.S[last]) dfs(p.concat(m)); };
    dfs([0]);
    return out;
  }
  // Complete paths visiting each node at most V times (graph-only candidates for min-tests).
  function boundedPaths(g, V, cap = 6000) {
    const out = [], cnt = new Array(g.n).fill(0);
    const dfs = p => {
      if (out.length >= cap) return;
      const last = p[p.length - 1];
      if (last === g.exit) { out.push(p.slice()); return; }
      for (const m of g.S[last]) if (cnt[m] < V) { cnt[m]++; p.push(m); dfs(p); p.pop(); cnt[m]--; }
    };
    cnt[0] = 1; dfs([0]);
    return out;
  }
  function requirements(crit, g) {
    if (crit === 'node') return Array.from({ length: g.n }, (_, i) => [i]);
    if (crit === 'edge') return g.E.map(([a, b]) => [a, b]);
    return primePaths(g);
  }
  // Smallest set of candidate paths touring every requirement (exact search, iterative deepening).
  function minCover(reqs, cands) {
    const full = (1n << BigInt(reqs.length)) - 1n;
    const byMask = new Map();
    for (const c of cands) {
      let m = 0n;
      reqs.forEach((r, i) => { if (tours(c.path, r)) m |= 1n << BigInt(i); });
      if (!byMask.has(m)) byMask.set(m, { c, m });
    }
    const all = [...byMask.values()];
    const items = all.filter(a => !all.some(b => b !== a && (a.m & b.m) === a.m));
    if (items.reduce((m, it) => m | it.m, 0n) !== full) return null;
    const chosen = [];
    const search = (m, left) => {
      if (m === full) return true;
      if (!left) return false;
      let i = 0n; while ((m >> i) & 1n) i++;
      for (const it of items) if ((it.m >> i) & 1n) { chosen.push(it); if (search(m | it.m, left - 1)) return true; chosen.pop(); }
      return false;
    };
    for (let k = 1; k <= reqs.length; k++) if (search(0n, k)) return { k, chosen: chosen.map(x => x.c), items };
    return null;
  }
  // k requirements no single candidate path can tour together: a proof that k tests are needed.
  function incompatible(reqs, items, k) {
    if (k < 2 || reqs.length > 30) return null;
    const together = (i, j) => items.some(it => ((it.m >> BigInt(i)) & 1n) && ((it.m >> BigInt(j)) & 1n));
    const pickSet = [];
    const rec = start => {
      if (pickSet.length === k) return true;
      for (let i = start; i < reqs.length; i++) {
        if (pickSet.every(j => !together(i, j))) { pickSet.push(i); if (rec(i + 1)) return true; pickSet.pop(); }
      }
      return false;
    };
    return rec(0) ? pickSet.map(i => reqs[i]) : null;
  }
  const execCands = fn => {
    const seen = new Set(), out = [];
    for (const r of fn.runs) { const kk = key(r.path); if (!seen.has(kk)) { seen.add(kk); out.push(r); } }
    return out;
  };
  const andList = xs => (xs.length < 2 ? xs.join('') : xs.slice(0, -1).join(', ') + ' and ' + xs[xs.length - 1]);
  const reqText = (crit, r) => (crit === 'node' ? 'N' + r[0] : crit === 'edge' ? `N${r[0]}→N${r[1]}` : pathBr(r));
  const critName = c => (c === 'prime' ? 'prime path' : c);

  // ───────────── 1. CFG counts ─────────────
  function buildCfgCounts(rng) {
    const kind = pick(rng, ['nodes', 'edges', 'edgepairs', 'complete', 'prime', 'listedges']);
    const lang = pick(rng, ['py', 'js']);
    const fn = genFunc(rng, {
      loop: kind === 'complete' ? 'no' : 'any',
      accept: kind === 'prime' ? f => primePaths(graph(f)).length <= 14 : kind === 'edgepairs' ? f => edgePairs(graph(f)).length <= 24 : null,
    });
    const g = graph(fn), nt = nodeTexts(fn, lang), s = sig(fn);
    const labelled = render(fn, lang, true);
    const src = GEN + L13 + ' (CFG node/edge/edge-pair/complete/prime path definitions)';
    const graphLine = `CFG edges: ${edgeText(g.E)} (N${g.exit} is the exit).`;
    let card;
    if (kind === 'nodes') {
      card = { type: 'typed', code: render(fn, lang, false),
        prompt: `How many nodes does the control-flow graph of ${s} have? ${CONV} Answer with a number.`,
        answer: String(g.n),
        why: Object.keys(nt).map(i => `N${i} ${nt[i]}`).join(' · ') + ` → ${g.n} nodes.` };
    } else if (kind === 'edges') {
      const tagWord = { true: 'true', false: 'false', enter: 'enter loop', leave: 'leave loop', back: 'back to the loop', return: 'return → exit', next: '' };
      const bySrc = {};
      for (const [a, b, t] of g.E) (bySrc[a] = bySrc[a] || []).push(`N${a}→N${b}${tagWord[t] ? ' (' + tagWord[t] + ')' : ''}`);
      card = { type: 'typed', code: labelled,
        prompt: `The lines of ${s} are labelled with their CFG nodes N0–N${g.n - 1} (N${g.exit} is the exit). How many edges does its control-flow graph have? Answer with a number.`,
        answer: String(g.E.length),
        why: Object.values(bySrc).map(x => x.join(', ')).join('; ') + `. Every if/while has 2 out-edges, every other node 1 (the exit 0): ${g.E.length} edges.` };
    } else if (kind === 'edgepairs') {
      const pairs = edgePairs(g);
      const indeg = new Array(g.n).fill(0); for (const [, b] of g.E) indeg[b]++;
      const terms = [];
      for (let v = 0; v < g.n; v++) if (indeg[v] && g.S[v].length) terms.push(`N${v}: ${indeg[v]}×${g.S[v].length}`);
      const ex1 = pairs[Math.floor(pairs.length / 2)];
      card = { type: 'typed', code: labelled,
        prompt: `${s} — ${graphLine} How many edge-pair test requirements does it have (paths of exactly 2 edges, such as ${pathBr(ex1)})? Answer with a number.`,
        answer: String(pairs.length),
        why: `Each middle node contributes (edges in) × (edges out): ${terms.join(', ')} = ${pairs.length}. The pairs: ${pairs.map(pathBr).join(', ')}.` };
    } else if (kind === 'complete') {
      const cps = completePaths(g);
      card = { type: 'typed', code: labelled,
        prompt: `${s} has no loop. ${graphLine} How many complete paths (from N0 to the exit N${g.exit}) does the CFG have? Answer with a number.`,
        answer: String(cps.length),
        why: `${cps.map(pathBr).join(', ')} → ${cps.length}. Independent decisions multiply; an early return cuts the paths after it.` };
    } else if (kind === 'prime') {
      const pp = primePaths(g);
      card = { type: 'typed', code: labelled,
        prompt: `${s} — ${graphLine} How many prime paths does the CFG have? Answer with a number.`,
        answer: String(pp.length),
        why: `A prime path is a simple path that is not a sub-path of any other simple path. ${pp.map(pathBr).join(', ')} → ${pp.length}.` };
    } else {
      const bySrc = {};
      for (const [a, b] of g.E) (bySrc[a] = bySrc[a] || []).push(`N${a}→N${b}`);
      const pts = Object.values(bySrc).map(x => x.join(', '));
      card = { type: 'recall', code: labelled,
        prompt: `List every edge of the control-flow graph of ${s}, written as Na→Nb. The lines are labelled with their nodes; N${g.exit} is the exit.`,
        answer: edgeText(g.E),
        points: pts,
        why: `An if goes to its first true-branch node and to its false branch (or past the if); a while goes into its body and past the loop, and the body's last node goes back to the while; a return goes to the exit. ${g.E.length} edges.` };
    }
    card.source = src;
    return { card, meta: { kind, lang, labelled, n: g.n, E: g.E.map(([a, b]) => [a, b]), exit: g.exit, params: fn.params, name: fn.name } };
  }

  // ───────────── 2. Minimum number of tests ─────────────
  function buildMinTests(rng) {
    const crit = pick(rng, ['node', 'edge', 'prime']);
    const lang = pick(rng, ['py', 'js']);
    let res;
    const fn = genFunc(rng, {
      loop: crit === 'prime' ? (rng() < 0.75 ? 'yes' : 'no') : 'any',
      maxNodes: crit === 'prime' ? 10 : 12,
      accept: f => {
        const g = graph(f), R = requirements(crit, g);
        if (crit === 'prime' && R.length > 12) return false;
        const ex1 = minCover(R, execCands(f));
        if (!ex1) return false;
        const gr = minCover(R, boundedPaths(g, 3).map(p => ({ path: p })));
        if (!gr || gr.k !== ex1.k || ex1.k > 4) return false;
        res = { g, R, ex: ex1 };
        return true;
      },
    });
    const { g, R, ex: best } = res;
    const k = best.k;
    const tests = best.chosen.map(c => `${call(fn, c.args)} → ${pathText(c.path)}`);
    const clique = incompatible(R, best.items, k);
    const lower = k === 1 ? 'One test is enough, so 1 is the minimum.'
      : clique ? `Fewer is impossible: ${andList(clique.map(r => reqText(crit, r)))} can never be on the same test path, so each needs its own test.`
        : `Fewer is impossible: no ${k - 1} paths the inputs can take cover every requirement (checked exhaustively).`;
    const reqLine = crit === 'prime' ? `Prime paths (${R.length}): ${R.map(pathBr).join(', ')}. ` : '';
    const card = { type: 'typed', code: render(fn, lang, true),
      prompt: `${sig(fn)} — CFG edges: ${edgeText(g.E)}. What is the minimum number of test cases (calls to ${fn.name}) needed for 100% ${critName(crit)} coverage? Answer with a number.`,
      answer: String(k),
      why: `${reqLine}${k} test${k > 1 ? 's' : ''}, e.g. ${tests.join('; ')}. ${lower}`,
      source: GEN + L13 + ' (node / edge / prime path coverage; touring)' };
    return { card, meta: { crit, lang, labelled: card.code, E: g.E.map(([a, b]) => [a, b]), exit: g.exit, n: g.n, params: fn.params, name: fn.name } };
  }

  // ───────────── 3. Coverage level of a suite ─────────────
  function buildSuiteCoverage(rng) {
    const crit = pick(rng, ['node', 'edge']);
    const lang = pick(rng, ['py', 'js']);
    const fn = genFunc(rng, { loop: 'any' });
    const g = graph(fn);
    const size = int(rng, 2, 3), suite = [];
    for (let t = 0; suite.length < size && t < 100; t++) {
      const args = fn.params.map(() => int(rng, -2, 6));
      if (!suite.some(s => s.join() === args.join())) suite.push(args);
    }
    const runs = suite.map(a => ({ args: a, path: run(fn, a).path }));
    const R = requirements(crit, g);
    const covered = R.filter(r => runs.some(x => tours(x.path, r)));
    const missed = R.filter(r => !covered.includes(r));
    const c = covered.length, t = R.length;
    const what = crit === 'node' ? `node coverage (TR = all ${t} nodes N0–N${g.n - 1}, including N0 and the exit)` : `edge coverage (TR = all ${t} edges)`;
    const card = { type: 'typed', code: render(fn, lang, true),
      prompt: `Test suite: ${suite.map(a => call(fn, a)).join(', ')}. What ${what} does it reach? CFG edges: ${edgeText(g.E)}. Answer as a fraction covered/total.`,
      answer: `${c}/${t}`,
      why: runs.map(x => `${call(fn, x.args)} → ${pathText(x.path)}`).join('; ') +
        `. Covered: ${covered.map(r => reqText(crit, r)).join(', ')}. ` +
        (missed.length ? `Never covered: ${missed.map(r => reqText(crit, r)).join(', ')}. ` : 'Nothing is missed. ') +
        `Coverage level = ${c}/${t} = ${fmtPct(c, t)}.`,
      source: GEN + L13 + ' (coverage level = satisfied TR / |TR|)' };
    card.accept = acceptList(card.answer, fracAccept(c, t));
    return { card, meta: { crit, lang, labelled: card.code, E: g.E.map(([a, b]) => [a, b]), exit: g.exit, n: g.n, params: fn.params, name: fn.name, suite } };
  }

  // ───────────── 4. List the prime paths ─────────────
  function buildPrimePaths(rng) {
    const lang = pick(rng, ['py', 'js']);
    const fn = genFunc(rng, { loop: 'yes', maxNodes: 9, lines: [3, 8], accept: f => { const k = primePaths(graph(f)).length; return k >= 3 && k <= 9; } });
    const g = graph(fn), pp = primePaths(g);
    const cycles = pp.filter(p => p[0] === p[p.length - 1]);
    const fromStart = pp.filter(p => p[0] === 0);
    const rest = pp.filter(p => !cycles.includes(p) && !fromStart.includes(p));
    // A tempting simple path that is NOT prime (the slides' [N4, N2, N5] trap).
    // Prefer a path that starts inside the loop and runs to the exit, like the lecture's [N4, N2, N5].
    const inLoop = new Set(cycles.flat());
    const notPrime = simplePaths(g).filter(p => p.length >= 3 && !pp.some(q => key(q) === key(p)));
    const loopExit = notPrime.filter(p => inLoop.has(p[0]) && p[p.length - 1] === g.exit).sort((a, b) => b.length - a.length);
    const sp = loopExit.length ? loopExit : notPrime.sort((a, b) => b.length - a.length);
    let trap = '';
    if (sp.length) { const p = sp[0], q = pp.find(x => x.length > p.length && tours(x, p)); trap = ` ${pathBr(p)} is simple but NOT prime: it lies inside ${pathBr(q)}.`; }
    const grp = (name, list) => (list.length ? `${name}: ${list.map(pathBr).join(', ')}. ` : '');
    const card = { type: 'set', code: render(fn, lang, true),
      prompt: `List every prime path of the CFG of ${sig(fn)}. CFG edges: ${edgeText(g.E)}. Write each path as its nodes separated by commas (for example N0,N1,N2) and put one path per line (or separate paths with ;).`,
      answer: pp.map(pathText),
      why: `${pp.length} prime paths. ` + grp('From N0', fromStart) + grp('Loop cycles (one per starting node of the loop)', cycles) + grp('Other maximal simple paths', rest) + trap.trim(),
      source: GEN + L13 + ' (simple and prime paths)' };
    return { card, meta: { lang, labelled: card.code, E: g.E.map(([a, b]) => [a, b]), exit: g.exit, n: g.n, params: fn.params, name: fn.name } };
  }

  // ───────────── 5. Boundary values ─────────────
  const BVA_CTX = [
    { s: 'A cinema charges the standard rate when the customer’s age is', lo: [13, 25], span: [30, 50] },
    { s: 'A thermostat accepts a target temperature (whole degrees C) that is', lo: [5, 15], span: [8, 20] },
    { s: 'An online shop accepts an order quantity that is', lo: [1, 5], span: [10, 99] },
    { s: 'A sign-up form accepts a password whose length (in characters) is', lo: [6, 12], span: [8, 40] },
    { s: 'A parking meter accepts a stay (in minutes) that is', lo: [10, 30], span: [60, 200] },
    { s: 'A loan calculator accepts a term (in months) that is', lo: [6, 24], span: [36, 300] },
    { s: 'A booking system accepts a group size that is', lo: [2, 6], span: [6, 20] },
    { s: 'A quiz accepts a mark that is', lo: [0, 0], span: [10, 100] },
  ];
  function rangePhrase(rng, lo, hi) { // lo or hi may be null (one-sided)
    if (hi == null) return lo === 0 ? `at least ${lo}` : pick(rng, [`at least ${lo}`, `more than ${lo - 1}`, `${lo} or more`]);
    if (lo == null) return pick(rng, [`at most ${hi}`, `less than ${hi + 1}`, `${hi} or less`]);
    const forms = [`from ${lo} to ${hi} inclusive`, `at least ${lo} and less than ${hi + 1}`, `at least ${lo} and at most ${hi}`];
    if (lo > 0) forms.push(`strictly between ${lo - 1} and ${hi + 1}`, `more than ${lo - 1} and at most ${hi}`);
    return pick(rng, forms);
  }
  function buildBva(rng) {
    const ctx = pick(rng, BVA_CTX);
    const lo = int(rng, ctx.lo[0], ctx.lo[1]), hi = lo + int(rng, ctx.span[0], ctx.span[1]);
    const shape = rng() < 0.75 ? 'two' : pick(rng, ['low', 'high']);
    const L = shape === 'high' ? null : lo, H = shape === 'low' ? null : hi;
    const phrase = rangePhrase(rng, L, H);
    const vals = [];
    if (L != null) vals.push(L - 1, L, L + 1);
    if (H != null) vals.push(H - 1, H, H + 1);
    const acc = L != null && H != null ? `${L}…${H}` : L != null ? `${L} and up` : `up to ${H}`;
    const card = { type: 'set',
      prompt: `${ctx.s} ${phrase}. Using boundary value analysis, list the boundary values: for each boundary, the value just below it, the value at it, and the value just above it, where “at” means the smallest or largest whole number the spec accepts. Give the integers separated by commas.`,
      answer: vals.map(String),
      why: `Accepted whole numbers: ${acc}.` + (L != null ? ` Lower boundary ${L}: test ${L - 1} (outside), ${L} (at), ${L + 1} (inside).` : '') +
        (H != null ? ` Upper boundary ${H}: test ${H - 1} (inside), ${H} (at), ${H + 1} (outside).` : '') +
        ' Off-by-one faults (> vs ≥) only show up at these values.',
      source: GEN + L12 + ' (representative values: inside, at boundary, outside)' };
    return { card, meta: { lo: L, hi: H } };
  }

  // ───────────── 6. Equivalence classes ─────────────
  const PART_RANGE = [
    { intro: 'A museum sets the ticket type from the visitor’s age', field: 'age', labels: ['child', 'adult', 'senior'], min: 0, max: [99, 120], cuts: [[10, 17], [60, 67]] },
    { intro: 'A course turns a score into a result', field: 'score', labels: ['fail', 'pass', 'honours'], min: 0, max: [100, 100], cuts: [[40, 55], [75, 90]] },
    { intro: 'A courier prices a parcel by its weight in kg', field: 'weight', labels: ['small', 'medium', 'large'], min: 1, max: [30, 50], cuts: [[3, 6], [12, 20]] },
    { intro: 'A speed camera classifies a speed in km/h', field: 'speed', labels: ['no fine', 'small fine', 'large fine'], min: 0, max: [200, 250], cuts: [[51, 61], [81, 100]] },
  ];
  const PART_STR = [
    { what: 'A username', charset: 'letters and digits', pool: 'abcdefghjkmnpqrstuvwxyz0123456789', bad: ['!', '_', '-', '@', '#'] },
    { what: 'A PIN', charset: 'digits', pool: '0123456789', bad: ['a', 'x', '#', '-'] },
    { what: 'A product code', charset: 'uppercase letters', pool: 'ABCDEFGHJKLMNPQRSTUVWXYZ', bad: ['a', '7', '-', '_'] },
    { what: 'A nickname', charset: 'lowercase letters', pool: 'abcdefghijkmnpqrstuvwxyz', bad: ['A', '3', '!', '_'] },
  ];
  const PART_TWO = [
    { intro: 'A gym sets the monthly fee from the member’s age group and plan', flag: 'plan', values: ['basic', 'silver', 'gold'] },
    { intro: 'A bus company sets the fare from the rider’s age group and whether they show a student card', flag: 'student card', values: ['student card', 'no student card'] },
    { intro: 'A cinema sets the price from the customer’s age group and the day type', flag: 'day type', values: ['weekday', 'weekend'] },
  ];
  // Pick up to 3 distractors among the other classes, nearest first.
  function nearOptions(classes, i, rng) {
    const others = classes.map((c, j) => ({ c, d: Math.abs(j - i) + rng() * 0.5 })).filter((_, j) => j !== i).sort((a, b) => a.d - b.d);
    return others.slice(0, 3).map(o => o.c);
  }
  function buildPartitions(rng) {
    const kind = pick(rng, ['range', 'string', 'two']);
    const ask = rng() < 0.5 ? 'list' : 'which';
    if (kind === 'range') {
      const ctx = pick(rng, PART_RANGE);
      const max = int(rng, ctx.max[0], ctx.max[1]);
      const k = rng() < 0.6 ? 3 : 2;
      const starts = [ctx.min, ...(k === 3 ? ctx.cuts.map(c => int(rng, c[0], c[1])) : [int(rng, ctx.cuts[0][0], ctx.cuts[1][1])])];
      const labels = k === 3 ? ctx.labels : [ctx.labels[0], ctx.labels[2]];
      const ranges = starts.map((s, i) => [s, i + 1 < starts.length ? starts[i + 1] - 1 : max]);
      const spec = `${ctx.intro}: ${ranges.map((r, i) => `${r[0]}–${r[1]} → ${labels[i]}`).join('; ')}. Any other ${ctx.field} is rejected as invalid. (${ctx.field} is a whole number.)`;
      const classes = [`${ctx.field} below ${ctx.min} (invalid)`, ...ranges.map((r, i) => `${ctx.field} ${r[0]}–${r[1]} (${labels[i]})`), `${ctx.field} above ${max} (invalid)`];
      const meta = { kind, ctx: ctx.field, min: ctx.min, max, ranges, classes };
      if (ask === 'list') {
        return { meta, card: { type: 'recall', prompt: `${spec} List the equivalence classes for ${ctx.field}, valid and invalid.`,
          answer: classes.join('; '), points: classes,
          why: `One class per behaviour the spec describes (${k} valid ranges) plus one invalid class on each side of ${ctx.min}–${max}. One test per class represents it; boundary tests then probe the edges between classes.`,
          source: GEN + L10 + ' and ' + L12 + ' (partition testing)' } };
      }
      const ci = int(rng, 0, classes.length - 1);
      const v = ci === 0 ? ctx.min - int(rng, 1, 10) : ci === classes.length - 1 ? max + int(rng, 1, 30) : int(rng, ranges[ci - 1][0], ranges[ci - 1][1]);
      meta.input = v;
      return { meta, card: { type: 'mc', prompt: `${spec} Which equivalence class does the input ${ctx.field} = ${v} belong to?`,
        answer: classes[ci], options: nearOptions(classes, ci, rng),
        why: `${v} ${ci === 0 ? `is below ${ctx.min}` : ci === classes.length - 1 ? `is above ${max}` : `lies in ${ranges[ci - 1][0]}–${ranges[ci - 1][1]}`}, so it is in “${classes[ci]}”. Every input in a class should behave the same, so one test represents the whole class.`,
        source: GEN + L10 + ' and ' + L12 + ' (partition testing)' } };
    }
    if (kind === 'string') {
      const ctx = pick(rng, PART_STR);
      const lo = int(rng, 3, 6), hi = lo + int(rng, 3, 10);
      const spec = `${ctx.what} must be ${lo}–${hi} characters long and contain only ${ctx.charset}.`;
      const classes = [`valid: ${lo}–${hi} characters, only ${ctx.charset}`, `too short: fewer than ${lo} characters`, `too long: more than ${hi} characters`, `bad character: contains something other than ${ctx.charset}`];
      const meta = { kind, lo, hi, charset: ctx.charset, classes };
      if (ask === 'list') {
        return { meta, card: { type: 'recall', prompt: `${spec} List its equivalence classes (one valid class and the invalid ones).`,
          answer: classes.join('; '), points: classes,
          why: 'Each rule in the spec splits the input space: length below / inside / above the range, and characters allowed / not allowed. Test each invalid class with an input that breaks only that one rule, so a failure points at one cause.',
          source: GEN + L10 + ' and ' + L12 + ' (partition testing)' } };
      }
      const ci = int(rng, 0, 3);
      const len = ci === 1 ? int(rng, 1, lo - 1) : ci === 2 ? int(rng, hi + 1, hi + 6) : int(rng, lo, hi);
      const chars = Array.from({ length: len }, () => pick(rng, ctx.pool.split('')));
      if (ci === 3) chars[int(rng, 1, len - 2)] = pick(rng, ctx.bad);
      const s = chars.join('');
      meta.input = s;
      return { meta, card: { type: 'mc', prompt: `${spec} Which equivalence class does the input "${s}" (${len} characters) belong to? Each invalid input breaks exactly one rule.`,
        answer: classes[ci], options: shuffle(rng, classes.filter((_, j) => j !== ci)),
        why: `"${s}" has ${len} characters (allowed ${lo}–${hi}) and ${ci === 3 ? 'contains a character outside ' + ctx.charset : 'only ' + ctx.charset}, so it is in “${classes[ci]}”.`,
        source: GEN + L10 + ' and ' + L12 + ' (partition testing)' } };
    }
    const ctx = pick(rng, PART_TWO);
    const child = int(rng, 12, 18), three = rng() < 0.6, senior = int(rng, 60, 67);
    const groups = three ? [['child', 0, child - 1], ['adult', child, senior - 1], ['senior', senior, null]] : [['under ' + child, 0, child - 1], [child + ' and over', child, null]];
    const gText = groups.map(([n, a, b]) => (b == null ? `${n === 'senior' ? 'senior ' : ''}${a} and over` : `${n === 'child' ? 'child ' : ''}${a}–${b}`)).join(', ');
    const spec = `${ctx.intro}. Age groups: ${gText}; an age below 0 is invalid. ${ctx.flag[0].toUpperCase() + ctx.flag.slice(1)}: ${ctx.values.join(' / ')}.`;
    const gName = ([n, a, b]) => (b == null ? `age ${a}+` : `age ${a}–${b}`);
    const perField = ['age below 0 (invalid)', ...groups.map(gName), ...ctx.values];
    const combined = [];
    for (const gr of groups) for (const v of ctx.values) combined.push(`${gName(gr)}, ${v}`);
    const meta = { kind, groups, values: ctx.values, perField, combined };
    const q = pick(rng, ['list', 'count', 'which']);
    if (q === 'list') {
      return { meta, card: { type: 'recall', prompt: `${spec} List the equivalence classes of each input: age (valid groups and the invalid class) and ${ctx.flag}.`,
        answer: perField.join('; '), points: perField,
        why: `Age: one class per group (${groups.length}) plus the invalid class “below 0”. ${ctx.flag}: one class per value (${ctx.values.length}). Combining the valid ones gives ${combined.length} test frames, plus one for the invalid age.`,
        source: GEN + L12 + ' (category-partition: classes per input, then combine)' } };
    }
    if (q === 'count') {
      return { meta, card: { type: 'typed', prompt: `${spec} How many VALID combined classes are there (one per combination of a valid age group and a ${ctx.flag} value)? Answer with a number.`,
        answer: String(combined.length),
        why: `${groups.length} valid age groups × ${ctx.values.length} ${ctx.flag} values = ${combined.length}: ${combined.join('; ')}. The invalid age class is tested once on its own.`,
        source: GEN + L12 + ' (category-partition: combine representative values)' } };
    }
    const all = ['invalid (age below 0)', ...combined];
    const ci = int(rng, 0, all.length - 1);
    let age, flag;
    if (ci === 0) { age = -int(rng, 1, 5); flag = pick(rng, ctx.values); } else {
      const gr = groups[Math.floor((ci - 1) / ctx.values.length)]; flag = ctx.values[(ci - 1) % ctx.values.length];
      age = int(rng, gr[1], gr[2] == null ? gr[1] + 25 : gr[2]);
    }
    meta.input = [age, flag];
    return { meta, card: { type: 'mc', prompt: `${spec} Which class does the input (age ${age}, ${flag}) belong to?`,
      answer: all[ci], options: nearOptions(all, ci, rng),
      why: ci === 0 ? `Age ${age} is below 0, so the input is invalid whatever the ${ctx.flag}.` : `Age ${age} is in ${all[ci].split(',')[0]}, and the ${ctx.flag} is ${flag}: class “${all[ci]}”.`,
      source: GEN + L12 + ' (category-partition)' } };
  }

  // ───────────── 7. Off-by-one: smallest revealing input ─────────────
  const OBO_CTX = [
    { fn: ['canVote', 'can_vote'], v: 'age', who: 'A person can vote', T: [16, 21], dir: 'low' },
    { fn: ['canRentCar', 'can_rent_car'], v: 'age', who: 'A customer may rent a car', T: [21, 25], dir: 'low' },
    { fn: ['freeShipping', 'free_shipping'], v: 'total', who: 'An order ships free', T: [25, 100], dir: 'low' },
    { fn: ['passes', 'passes'], v: 'mark', who: 'A student passes', T: [40, 60], dir: 'low' },
    { fn: ['childFare', 'child_fare'], v: 'age', who: 'A rider pays the child fare', T: [5, 15], dir: 'high' },
    { fn: ['isSmallParcel', 'is_small_parcel'], v: 'weight', who: 'A parcel counts as small', T: [2, 10], dir: 'high' },
    { fn: ['lowStock', 'low_stock'], v: 'count', who: 'An item is flagged as low stock', T: [3, 20], dir: 'high' },
    { fn: ['validMonth', 'valid_month'], v: 'month', who: 'A month number is valid', A: 1, B: 12 },
    { fn: ['validHour', 'valid_hour'], v: 'hour', who: 'An hour is valid', A: 0, B: 23 },
    { fn: ['validPercent', 'valid_percent'], v: 'pct', who: 'A percentage is valid', A: 0, B: 100 },
    { fn: ['validFloor', 'valid_floor'], v: 'floor', who: 'A floor number is valid', A: 1, B: [10, 40] },
  ];
  const relPhrase = (op, T) => ({ '>=': [`at least ${T}`, `${T} or more`], '>': [`more than ${T}`, `over ${T}`], '<=': [`at most ${T}`, `${T} or less`], '<': [`less than ${T}`, `under ${T}`] }[op]);
  const holds = (op, x, T) => (op === '>=' ? x >= T : op === '>' ? x > T : op === '<=' ? x <= T : x < T);
  function buildOffByOne(rng) {
    const ctx = pick(rng, OBO_CTX), lang = pick(rng, ['py', 'js']);
    const name = lang === 'py' ? ctx.fn[1] : ctx.fn[0], v = ctx.v;
    let spec, specFn, clauses, near, specDesc;
    if (ctx.A == null) {
      const T = int(rng, ctx.T[0], ctx.T[1]);
      const sop = ctx.dir === 'low' ? pick(rng, ['>=', '>']) : pick(rng, ['<=', '<']);
      spec = `${ctx.who} if ${v} is ${pick(rng, relPhrase(sop, T))}.`;
      specFn = x => holds(sop, x, T); near = [T - 6, T + 6]; specDesc = `${v} ${sop} ${T}`;
      const cands = [];
      for (const op of ctx.dir === 'low' ? ['>=', '>'] : ['<=', '<']) for (let d = -2; d <= 2; d++) {
        if (op === sop && d === 0) continue;
        let differs = false; for (let x = T - 6; x <= T + 6; x++) if (holds(op, x, T + d) !== specFn(x)) differs = true;
        if (differs) cands.push([op, T + d]);
      }
      clauses = [pick(rng, cands)];
    } else {
      const A = ctx.A, B = Array.isArray(ctx.B) ? int(rng, ctx.B[0], ctx.B[1]) : ctx.B;
      spec = `${ctx.who} if ${v} is from ${A} to ${B} inclusive.`;
      specFn = x => x >= A && x <= B; near = [A - 6, B + 6]; specDesc = `${A} ≤ ${v} ≤ ${B}`;
      let lowC = pick(rng, [['>=', A], ['>', A - 1]]), highC = pick(rng, [['<=', B], ['<', B + 1]]);
      if (rng() < 0.5) lowC = pick(rng, [['>', A], ['>=', A + 1], ['>=', A - 1]]); else highC = pick(rng, [['<', B], ['<=', B - 1], ['<=', B + 1]]);
      clauses = [lowC, highC];
    }
    const codeFn = x => clauses.every(([op, T]) => holds(op, x, T));
    const cond = clauses.map(([op, T]) => `${v} ${op} ${T}`).join(lang === 'py' ? ' and ' : ' && ');
    const style = rng() < 0.5 ? 'return' : 'if';
    const code = lang === 'py'
      ? (style === 'return' ? `def ${name}(${v}):\n    return ${cond}` : `def ${name}(${v}):\n    if ${cond}:\n        return True\n    return False`)
      : (style === 'return' ? `function ${name}(${v}) {\n  return ${cond};\n}` : `function ${name}(${v}) {\n  if (${cond}) {\n    return true;\n  }\n  return false;\n}`);
    const diff = [];
    for (let x = near[0]; x <= near[1]; x++) if (codeFn(x) !== specFn(x)) diff.push(x);
    const ans = diff[0];
    const card = { type: 'typed', code,
      prompt: `Spec: ${spec} The code below is supposed to implement it. What is the smallest integer ${v} that reveals the bug (an input where the code’s result differs from the spec)? Answer with a number.`,
      answer: String(ans),
      why: `The spec accepts ${specDesc}; the code accepts ${cond.replace(/ and | && /, ' and ')}. They disagree only on ${andList(diff.map(String))}, so the smallest revealing input is ${ans}. Boundary value analysis puts a test right there; a typical value far from the boundary passes.`,
      source: GEN + L12 + ' (boundary values) and ' + L13 + ' (is_bigger: x > y vs x >= y)' };
    return { card, meta: { lang, v, diff } };
  }

  // ───────────── mutation operators (shared by 8 and 10) ─────────────
  const ROR = { '<': ['<=', '>'], '<=': ['<', '>='], '>': ['>=', '<'], '>=': ['>', '<='], '==': ['!=', '>=', '<='], '!=': ['==', '<', '>'] };
  const AOR = { '+': ['-', '*'], '-': ['+'], '*': ['+', '-'] };
  function mutationsOf(fn) {
    const out = [];
    walk(fn.body, s => {
      if (s.t === 'if') {
        const c = s.c;
        for (const op of ROR[c.op]) out.push({ id: s.id, orig: c, mut: cmp(op, c.l, c.r), kind: 'ROR (relational operator replacement) mutant' });
        if (c.l.k === 'var' && c.r.k === 'num') for (const d of [-1, 1]) out.push({ id: s.id, orig: c, mut: cmp(c.op, c.l, num(c.r.v + d)), kind: 'constant-replacement mutant' });
      } else if (s.t === 'assign' && s.e.k === 'bin' && AOR[s.e.op]) {
        for (const op of AOR[s.e.op]) out.push({ id: s.id, orig: s.e, mut: bin(op, s.e.l, s.e.r), kind: 'AOR (arithmetic operator replacement) mutant' });
        if (s.e.r.k === 'num') for (const d of [-1, 1]) out.push({ id: s.id, orig: s.e, mut: bin(s.e.op, s.e.l, num(s.e.r.v + d)), kind: 'constant-replacement mutant' });
      } else if ((s.t === 'return' || s.t === 'assign') && s.e.k === 'num') {
        for (const d of [-1, 1]) out.push({ id: s.id, orig: s.e, mut: num(s.e.v + d), kind: 'constant-replacement mutant' });
      }
    });
    return out;
  }
  function applyMut(fn, m) {
    const f = cloneFn(fn), s = stmtById(f, m.id);
    if (s.t === 'if') s.c = JSON.parse(JSON.stringify(m.mut)); else s.e = JSON.parse(JSON.stringify(m.mut));
    return f;
  }
  // The display line (no label) of node id, and whether it is unique in the code.
  function lineOf(fn, lang, id) {
    const L = lines(fn, lang), pad = lang === 'py' ? '    ' : '  ';
    const l = L.find(x => x.node === id);
    return { text: l.text, full: pad.repeat(l.ind) + l.text, unique: L.filter(x => x.text === l.text).length === 1 };
  }
  const MUT_DOM1 = Array.from({ length: 21 }, (_, i) => i), MUT_DOM2 = Array.from({ length: 10 }, (_, i) => i);
  function argForms(fn, a) {
    if (a.length === 1) { const [x] = a, p = fn.params[0]; return [`${x}`, `${p}=${x}`, `${p} = ${x}`, `${fn.name}(${x})`, `(${x})`]; }
    const [x, y] = a, [p, q] = fn.params;
    return [`${x}, ${y}`, `${x},${y}`, `(${x}, ${y})`, `(${x},${y})`, `${x} ${y}`, `${p}=${x}, ${q}=${y}`, `${p} = ${x}, ${q} = ${y}`, `${p}=${x},${q}=${y}`, `${fn.name}(${x}, ${y})`, `${fn.name}(${x},${y})`];
  }
  function compress(xs) { // [1,2,3,5] -> "1–3, 5"
    const out = []; let i = 0;
    while (i < xs.length) { let j = i; while (j + 1 < xs.length && xs[j + 1] === xs[j] + 1) j++; out.push(j > i + 1 ? `${xs[i]}–${xs[j]}` : j === i + 1 ? `${xs[i]}, ${xs[j]}` : `${xs[i]}`); i = j + 1; }
    return out.join(', ');
  }

  // ───────────── 8. Is the mutant killed? ─────────────
  function buildMutantKilled(rng) {
    const ask = rng() < 0.5 ? 'killed' : 'input';
    const lang = pick(rng, ['py', 'js']);
    for (let t = 0; t < 400; t++) {
      const fn = genFunc(rng, { loop: 'no', lines: [4, 8], chunks: [1, 3] });
      const muts = mutationsOf(fn);
      if (!muts.length) continue;
      const m = pick(rng, muts), mf = applyMut(fn, m);
      const o = lineOf(fn, lang, m.id), mm = lineOf(mf, lang, m.id);
      if (!o.unique) continue;
      const dom = inputs(fn.params.length, fn.params.length === 1 ? MUT_DOM1 : MUT_DOM2);
      const kills = dom.filter(a => run(fn, a).ret !== run(mf, a).ret);
      if (!kills.length) continue; // equivalent on this domain: not a fair question
      const killSet = new Set(kills.map(a => a.join()));
      let suite = null;
      const want = ask === 'input' ? false : rng() < 0.5;
      for (let s = 0; s < 60 && !suite; s++) {
        const n = int(rng, 2, 3), cand = [];
        while (cand.length < n) { const a = pick(rng, dom); if (!cand.includes(a)) cand.push(a); }
        if (cand.some(a => killSet.has(a.join())) === want) suite = cand;
      }
      if (!suite) continue;
      const exp = suite.map(a => run(fn, a).ret);
      const asserts = suite.map((a, i) => (lang === 'py' ? `assert ${call(fn, a)} == ${exp[i]}` : `assertEquals(${exp[i]}, ${call(fn, a)});`));
      const code = render(fn, lang, false) + '\n\n' + (lang === 'py' ? '# test suite\n' : '// test suite\n') + asserts.join('\n');
      const perTest = suite.map((a, i) => `${call(fn, a)}: original ${exp[i]}, mutant ${run(mf, a).ret}${killSet.has(a.join()) ? ' → fails (kills)' : ' → passes'}`).join('; ');
      const killDesc = fn.params.length === 1 ? `${fn.params[0]} = ${compress(kills.map(a => a[0]))}` :
        `${kills.length} of the 100 inputs, e.g. ${kills.slice(0, 6).map(a => `(${a.join(', ')})`).join(', ')}`;
      const mutLine = `An ${m.kind}: the line \`${o.text}\` becomes \`${mm.text}\`.`;
      const ripr = `To kill it a test must reach that line, make it compute a different value, and carry the difference to the return value. Over the input range that happens for ${killDesc}.`;
      const meta = { lang, ask, origLine: o.text, mutLine: mm.text, params: fn.params, name: fn.name, suite, exp, kills, labelled: render(fn, lang, true), mutId: m.id };
      if (ask === 'killed') {
        const killed = suite.some(a => killSet.has(a.join()));
        return { meta, card: { type: 'mc', code,
          prompt: `${mutLine} Is the mutant killed by the test suite below (does at least one assertion fail when run against the mutant)?`,
          answer: killed ? 'Yes: at least one test fails, so the mutant is killed' : 'No: every test still passes, so the mutant survives',
          options: [killed ? 'No: every test still passes, so the mutant survives' : 'Yes: at least one test fails, so the mutant is killed'],
          why: `${perTest}. ${ripr}`,
          source: GEN + L4 + ' (mutation testing: kill the mutant)' } };
      }
      const range = fn.params.length === 1 ? `${fn.params[0]} from 0 to 20` : `${fn.params[0]} and ${fn.params[1]} each from 0 to 9`;
      const fmt = fn.params.length === 1 ? `Answer with the value of ${fn.params[0]}.` : `Answer as ${fn.params[0]}, ${fn.params[1]} (two numbers separated by a comma).`;
      const ans = argForms(fn, kills[0])[0];
      return { meta, card: { type: 'typed', code,
        prompt: `${mutLine} The suite below does not kill it. Give one input (${range}) that kills the mutant. ${fmt}`,
        answer: ans,
        accept: acceptList(ans, kills.flatMap(a => argForms(fn, a))),
        why: `${perTest}. ${ripr} Any of those inputs, with its original output as the expected value, kills it.`,
        source: GEN + L4 + ' (mutation testing: kill the mutant)' } };
    }
    throw new Error('mutant-killed: gave up');
  }

  // ───────────── 9. Mutation score ─────────────
  function buildMutationScore(rng) {
    const kind = pick(rng, ['basic', 'basic', 'survivors', 'target']);
    const M = int(rng, 4, 40) * 5, E = int(rng, 0, Math.floor(M / 6)), live = M - E;
    const src = GEN + L4 + ' (mutation adequacy score MS = K / (M − E))';
    if (kind === 'target') {
      const T = pick(rng, [70, 75, 80, 85, 90, 95]);
      const need = Math.ceil(T * live / 100 - 1e-9);
      const K = int(rng, Math.max(0, need - 30), need - 1);
      return { meta: { kind, M, E, K, T }, card: { type: 'typed',
        prompt: `A mutation tool generated M = ${M} mutants; E = ${E} of them are equivalent. The suite kills K = ${K}. How many MORE mutants must the suite kill to reach a mutation score of at least ${T}%? Answer with a number.`,
        answer: String(need - K),
        why: `MS = K / (M − E) = K / ${live}. Reaching ${T}% needs K ≥ ${T / 100} × ${live} = ${(T * live / 100).toFixed(2).replace(/\.?0+$/, '')}, so K ≥ ${need}: ${need} − ${K} = ${need - K} more.`,
        source: src } };
    }
    const K = int(rng, Math.floor(live * 0.3), live);
    const ms = K / live;
    const given = kind === 'basic' ? `the suite kills K = ${K}` : `${live - K} of the non-equivalent mutants survive the suite`;
    const card = { type: 'typed',
      prompt: `A mutation tool generated M = ${M} mutants; E = ${E} of them are equivalent, and ${given}. What is the mutation score MS? Answer as a decimal rounded to 2 places.`,
      answer: ms.toFixed(2),
      why: (kind === 'survivors' ? `Killed K = (M − E) − survivors = ${live} − ${live - K} = ${K}. ` : '') +
        `MS = K / (M − E) = ${K} / (${M} − ${E}) = ${K}/${live} = ${ms.toFixed(4).replace(/0+$/, '').replace(/\.$/, '')}${isExact(ms, 2) ? '' : ` ≈ ${ms.toFixed(2)}`}. Equivalent mutants are left out because no test can kill them.`,
      source: src };
    const g = gcd(K, live);
    card.accept = acceptList(card.answer, [...decForms(ms, [2, 3]), ...pctForms(100 * ms, [0, 1]).filter(s => isExact(100 * ms, 0) || /\./.test(s)), `${K}/${live}`, `${K / g}/${live / g}`, ...(isExact(ms, 4) ? decForms(ms, [4]) : [])]);
    return { card, meta: { kind, M, E, K } };
  }

  // ───────────── 10. RIPR: reach, infect, propagate ─────────────
  const RIPR = {
    none: 'Doesn’t reach the fault',
    reach: 'Reaches it, but no infection',
    infect: 'Reaches and infects, but doesn’t propagate',
    prop: 'Reaches, infects and propagates (wrong output)',
  };
  const show = v => (typeof v === 'boolean' ? (v ? 'true' : 'false') : String(v));
  function buildRipr(rng) {
    const target = pick(rng, ['none', 'reach', 'infect', 'prop']);
    const lang = pick(rng, ['py', 'js']);
    for (let t = 0; t < 600; t++) {
      const fn = genFunc(rng, { loop: 'no', lines: [4, 9], chunks: [2, 3] });
      const muts = mutationsOf(fn);
      if (!muts.length) continue;
      const m = pick(rng, muts);
      const bad = applyMut(fn, m); // the program under test contains the fault
      const dom = inputs(fn.params.length, fn.params.length === 1 ? Array.from({ length: 13 }, (_, i) => i) : MUT_DOM2);
      const hits = [];
      for (const a of dom) {
        const r = run(bad, a, { id: m.id, orig: m.orig }), o = run(fn, a);
        const cat = !r.reached ? 'none' : !r.infected ? 'reach' : r.ret === o.ret ? 'infect' : 'prop';
        if (cat === target) hits.push({ a, r, o });
      }
      if (!hits.length) continue;
      const h = pick(rng, hits);
      const faulty = lineOf(bad, lang, m.id), correct = lineOf(fn, lang, m.id);
      const s = stmtById(bad, m.id);
      const isCond = s.t === 'if';
      const steps = [`Path of ${call(fn, h.a)} through the faulty code: ${pathText(h.r.path)}.`];
      if (!h.r.reached) steps.push(`N${m.id} (the fault) never runs, so nothing can go wrong: no reach.`);
      else {
        const what = s.t === 'return' ? 'the returned value' : `${s.v}`;
        steps.push(`Reach: N${m.id} runs.`);
        steps.push(isCond
          ? (h.r.infected ? `Infect: the correct condition is ${show(h.r.want)} but the faulty one is ${show(h.r.got)}, so the program takes the wrong branch: the state is wrong.`
            : `No infection: the correct and the faulty condition are both ${show(h.r.got)}, so the program takes the right branch.`)
          : (h.r.infected ? `Infect: the correct line gives ${what} = ${show(h.r.want)}, the faulty one gives ${show(h.r.got)}: the state is wrong.`
            : `No infection: the correct and faulty lines both give ${what} = ${show(h.r.got)}, so the state stays correct.`));
        if (h.r.infected) {
          steps.push(h.r.ret === h.o.ret ? `No propagation: both versions still return ${h.o.ret}; the wrong value is overwritten or never used.`
            : `Propagate: the correct code returns ${h.o.ret}, the faulty code returns ${h.r.ret}: a failure.`);
        }
      }
      const opts = Object.keys(RIPR).filter(k => k !== target).map(k => RIPR[k]);
      const code = render(bad, lang, true);
      return { card: { type: 'mc', code,
        prompt: `Fault in ${sig(fn)}: line N${m.id} \`${faulty.text}\` should be \`${correct.text}\`. Input ${call(fn, h.a)}: what happens?`,
        answer: RIPR[target], options: opts,
        why: steps.join(' '),
        source: GEN + L10 + ' (reach, trigger/infect, propagate)' },
      meta: { lang, target, labelled: code, faultId: m.id, faultLine: faulty.text, correctLine: correct.text, params: fn.params, name: fn.name, args: h.a } };
    }
    throw new Error('ripr: gave up');
  }

  // ───────────── 11. Availability ─────────────
  const NINES = { 2: 0.99, 3: 0.999, 4: 0.9999, 5: 0.99999 };
  const TARGETS = [['90', 9, 0.9], ['95', 19, 0.95], ['97.5', 39, 0.975], ['98', 49, 0.98], ['99', 99, 0.99], ['99.5', 199, 0.995], ['99.9', 999, 0.999]];
  function buildAvailability(rng) {
    const kind = pick(rng, ['fwd', 'fwd', 'fwdmin', 'inverse', 'nines', 'measured']);
    const src = GEN + L4 + ' (availability = MTBF / (MTBF + MTTR))';
    if (kind === 'fwd' || kind === 'fwdmin') {
      const mtbf = int(rng, 10, 400) * 5, mins = kind === 'fwdmin';
      const mttrShown = mins ? pick(rng, [10, 15, 20, 30, 45, 90]) : int(rng, 1, 48);
      const mttr = mins ? mttrShown / 60 : mttrShown;
      const A = mtbf / (mtbf + mttr);
      const card = { type: 'typed',
        prompt: `A service has MTBF = ${mtbf} hours and MTTR = ${mttrShown} ${mins ? 'minutes' : 'hours'}. What is its availability? Answer as a decimal rounded to 4 places.`,
        answer: A.toFixed(4),
        why: (mins ? `Same units first: ${mttrShown} min = ${trimNum(mttr.toFixed(4))} h. ` : '') + `Availability = MTBF / (MTBF + MTTR) = ${mtbf} / (${mtbf} + ${trimNum(mttr.toFixed(4))}) = ${A.toFixed(6)} ≈ ${A.toFixed(4)} (${(100 * A).toFixed(2)}% of the time up).`,
        source: src };
      card.accept = acceptList(card.answer, [...decForms(A, [4]), ...pctForms(100 * A, [2]).filter(s => /\./.test(s)), ...(isExact(A, 4) ? [trimNum(A.toFixed(4))] : [])]);
      return { card, meta: { kind, mtbf, mttr } };
    }
    if (kind === 'inverse') {
      const [pct, ratio, A] = pick(rng, TARGETS);
      const mttr = int(rng, 1, 24) / (rng() < 0.3 ? 2 : 1), mtbf = ratio * mttr;
      const card = { type: 'typed',
        prompt: `A service must reach an availability of ${pct}%. Its MTBF is ${trimNum(mtbf.toFixed(1))} hours. What is the largest MTTR (in hours) that still meets the target? Answer with a number.`,
        answer: trimNum(mttr.toFixed(2)),
        why: `A = MTBF / (MTBF + MTTR) ⇒ MTTR = MTBF × (1 − A) / A = ${trimNum(mtbf.toFixed(1))} × ${trimNum((1 - A).toFixed(4))} / ${A} = ${trimNum(mttr.toFixed(2))} h. Check: ${trimNum(mtbf.toFixed(1))} / (${trimNum(mtbf.toFixed(1))} + ${trimNum(mttr.toFixed(2))}) = ${A}.`,
        source: src };
      card.accept = acceptList(card.answer, [trimNum(mttr.toFixed(2)), mttr.toFixed(1), mttr.toFixed(2), `${trimNum(mttr.toFixed(2))} hours`, `${trimNum(mttr.toFixed(2))} h`, `${trimNum(mttr.toFixed(2))}h`]);
      return { card, meta: { kind, mtbf, A } };
    }
    if (kind === 'nines') {
      const n = int(rng, 2, 5), A = NINES[n];
      const period = pick(rng, ['year', 'year', '30-day month']);
      const hours = period === 'year' ? 8760 : 720;
      const unit = (n >= 4 || (n === 3 && period !== 'year')) ? 'minutes' : 'hours';
      const down = (1 - A) * hours * (unit === 'minutes' ? 60 : 1);
      const card = { type: 'typed',
        prompt: `A service promises ${n} nines of availability (${(100 * A).toFixed(n - 2)}%). How much downtime does that allow per ${period === 'year' ? 'year (365 days)' : '30-day month'}? Answer in ${unit}, rounded to 2 decimal places.`,
        answer: down.toFixed(2),
        why: `Downtime = (1 − A) × total time = ${trimNum((1 - A).toFixed(5))} × ${hours} h${unit === 'minutes' ? ' × 60' : ''} = ${trimNum(down.toFixed(4))} ${unit}. Each extra nine divides the allowed downtime by 10.`,
        source: src };
      card.accept = acceptList(card.answer, [...decForms(down, [2, 3]), `${down.toFixed(2)} ${unit}`, ...(isExact(down, 2) ? [trimNum(down.toFixed(2))] : [])]);
      return { card, meta: { kind, n, hours, unit } };
    }
    const d = int(rng, 1, 90) / (rng() < 0.4 ? 2 : 1);
    const A = 1 - d / 8760;
    const card = { type: 'typed',
      prompt: `Over one year (365 days = 8760 hours) a service was down for a total of ${trimNum(d.toFixed(1))} hours. What was its availability? Answer as a percentage rounded to 2 decimal places.`,
      answer: `${(100 * A).toFixed(2)}%`,
      why: `Up time = 8760 − ${trimNum(d.toFixed(1))} = ${trimNum((8760 - d).toFixed(1))} h. Availability = up / total = ${trimNum((8760 - d).toFixed(1))} / 8760 = ${A.toFixed(6)} ≈ ${(100 * A).toFixed(2)}%. (MTBF / (MTBF + MTTR) is the same ratio: time up over total time.)`,
      source: src };
    card.accept = acceptList(card.answer, [...pctForms(100 * A, [2]), ...decForms(A, [4])]);
    return { card, meta: { kind, d } };
  }

  // ───────────── registration ─────────────
  const BUILD = {
    'gen-st-cfg-counts': buildCfgCounts,
    'gen-st-min-tests': buildMinTests,
    'gen-st-suite-coverage': buildSuiteCoverage,
    'gen-st-prime-paths': buildPrimePaths,
    'gen-st-bva': buildBva,
    'gen-st-partitions': buildPartitions,
    'gen-st-offbyone': buildOffByOne,
    'gen-st-mutant-killed': buildMutantKilled,
    'gen-st-mutation-score': buildMutationScore,
    'gen-st-ripr': buildRipr,
    'gen-st-availability': buildAvailability,
  };
  const DEFS = [
    ['gen-st-cfg-counts', '13', 'Test adequacy', 'Graph coverage', 'CFG: count nodes, edges, edge-pairs, paths'],
    ['gen-st-min-tests', '13', 'Test adequacy', 'Graph coverage', 'Minimum tests for node / edge / prime path coverage'],
    ['gen-st-suite-coverage', '13', 'Test adequacy', 'Graph coverage', 'Coverage level of a test suite'],
    ['gen-st-prime-paths', '13', 'Test adequacy', 'Graph coverage', 'List the prime paths'],
    ['gen-st-bva', '12', 'Test design', 'Partitions & boundaries', 'Boundary values of a range'],
    ['gen-st-partitions', '12', 'Test design', 'Partitions & boundaries', 'Equivalence classes of a spec'],
    ['gen-st-offbyone', '12', 'Test design', 'Partitions & boundaries', 'Off-by-one: smallest revealing input'],
    ['gen-st-mutant-killed', '4', 'Test adequacy', 'Mutation testing', 'Is the mutant killed? Give a killing input'],
    ['gen-st-mutation-score', '4', 'Test adequacy', 'Mutation testing', 'Mutation score MS = K / (M − E)'],
    ['gen-st-ripr', '10', 'Foundations', 'Fault, error, failure & RIPR', 'Reach, infect, propagate for an input'],
    ['gen-st-availability', '4', 'Quality & process', 'Dependability', 'Availability, MTTR target, downtime'],
  ];
  for (const [id, lecture, cat, sub, title] of DEFS) {
    G.register({ id, deck: 'softtest', lecture, cat, sub, title, make: rng => BUILD[id](rng).card });
  }
  // Exposed for tests (and for anyone wanting the worked data behind a card).
  FC.genSofttest = { build: BUILD, run, edgesOf, primePaths, graph, render };
})(globalThis.FC = globalThis.FC || {});
