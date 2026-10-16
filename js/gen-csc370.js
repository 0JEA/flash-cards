// Generated practice problems for AUCSC 370 (Rosanna Heise). Each generator builds a NEW
// problem from the rng (different names, values and program shape) and computes the answer
// with a solver in this file, so the student practises the procedure, not one answer.
// Contract: js/generators.js. Tests: tests/gen-csc370.test.js (answers cross-checked by
// python3, bash, gcc and exhaustive grammar search, independently of these solvers).
//
//   gen-370-scope       static / dynamic scoping output, static parent, static ancestors
//   gen-370-derive      leftmost derivations; can this string be derived?
//   gen-370-ambiguous   ambiguity, two parse trees, grouping (precedence, associativity)
//   gen-370-c-pointers  C pointer traces + memory diagrams (from decks/csc370-cpointer-bank.js)
//   gen-370-binding     binding times and storage (lifetime) categories
//   gen-370-tokens      token category of a lexeme; number of lexemes; tokenize a statement
(function (FC) {
  'use strict';
  const G = FC.gen;
  if (!G) throw new Error('load js/generators.js before js/gen-csc370.js');
  const { int, pick, shuffle } = G;
  const chance = (rng, p) => rng() < p;
  const sample = (rng, arr, k) => shuffle(rng, arr).slice(0, k);
  const src = lec => `Generated practice (new problem each time); method from AUCSC 370 lecture ${lec}`;

  // ═══════════════════════════ 1. Static vs dynamic scope ═══════════════════════════
  // A tiny Python-like language: assignments, defs (nested allowed), calls, prints.
  // Expressions are sums of products: [{neg, f: [atom]}], atom = {n} | {v}.
  const SCOPE_VARS = ['x', 'y', 'z', 'n', 'm', 'w', 'kiwi', 'lime', 'fig', 'plum', 'total', 'count'];
  const FN_POOLS = [
    ['f', 'g', 'h', 'p', 'q', 'r', 's', 't'],
    ['sub1', 'sub2', 'sub3', 'sub4', 'sub5', 'sub6'],
    ['outer', 'inner', 'helper', 'show', 'calc', 'report', 'tally', 'probe', 'scale'],
  ];

  const atomText = a => (a.v !== undefined ? a.v : String(a.n));
  const exprText = e => e.map((t, i) => (i === 0 ? '' : t.neg ? ' - ' : ' + ') + t.f.map(atomText).join(' * ')).join('');
  const exprNames = e => e.flatMap(t => t.f.filter(a => a.v !== undefined).map(a => a.v));

  function pyLines(stmts, ind, out, top) {
    for (const s of stmts) {
      const pad = ' '.repeat(ind);
      if (s.k === 'assign') out.push(`${pad}${s.name} = ${exprText(s.e)}`);
      else if (s.k === 'call') out.push(`${pad}${s.name}(${s.args.map(exprText).join(', ')})`);
      else if (s.k === 'print') out.push(`${pad}print(${s.args.map(exprText).join(', ')})`);
      else if (s.k === 'def') {
        out.push(`${pad}def ${s.name}(${s.params.join(', ')}):`);
        pyLines(s.body, ind + 4, out, false);
        if (top) out.push('');
      }
    }
    return out;
  }

  // Run a program under 'static' or 'dynamic' scoping. Returns printed values and a trace.
  function runScope(prog, mode) {
    const out = [], trace = [];
    const global = { label: 'global', vars: new Map(), fns: new Map(), parent: null, caller: null };
    const link = mode === 'static' ? 'parent' : 'caller';
    let steps = 0;
    function lookup(frame, name) {
      for (let f = frame; f; f = f[link]) if (f.vars.has(name)) return { v: f.vars.get(name), where: f };
      throw new Error(`unbound ${name}`);
    }
    function findFn(frame, name) {
      for (let f = frame; f; f = f.parent) if (f.fns.has(name)) return f.fns.get(name);
      throw new Error(`no function ${name}`);
    }
    function ev(e, frame, notes) {
      let total = 0;
      for (const t of e) {
        let p = 1;
        for (const a of t.f) {
          if (a.v === undefined) { p *= a.n; continue; }
          const r = lookup(frame, a.v);
          if (notes && !notes.seen.has(a.v)) {
            notes.seen.add(a.v);
            notes.list.push(r.where === frame
              ? `${a.v} = ${r.v} (${frame.label === 'global' ? 'global' : 'its own'})`
              : `${a.v} → ${r.where.label === 'global' ? 'global' : r.where.label + '’s'} ${a.v} = ${r.v}`);
          }
          p *= r.v;
        }
        total += t.neg ? -p : p;
      }
      return total;
    }
    const newNotes = () => ({ seen: new Set(), list: [] });
    const lit = e => e.length === 1 && e[0].f.length === 1 && e[0].f[0].v === undefined;
    function exec(stmts, frame, depth) {
      const pad = '  '.repeat(depth);
      for (const s of stmts) {
        if (++steps > 500) throw new Error('runaway program');
        if (s.k === 'def') { frame.fns.set(s.name, { def: s, closure: frame }); continue; }
        if (s.k === 'assign') {
          const notes = newNotes();
          const v = ev(s.e, frame, notes);
          frame.vars.set(s.name, v);
          trace.push(`${pad}${frame.label}: ${s.name} = ${lit(s.e) ? v : `${exprText(s.e)} = ${v}`}${notes.list.length ? `   (${notes.list.join(', ')})` : ''}`);
        } else if (s.k === 'print') {
          const notes = newNotes();
          const vals = s.args.map(a => ev(a, frame, notes));
          out.push(...vals);
          trace.push(`${pad}${frame.label} prints ${s.args.map(exprText).join(', ')}: ${notes.list.length ? notes.list.join(', ') + ' ⇒ ' : ''}${vals.join(' ')}`);
        } else if (s.k === 'call') {
          const fn = findFn(frame, s.name);
          const notes = newNotes();
          const vals = s.args.map(a => ev(a, frame, notes));
          const f = { label: s.name, vars: new Map(), fns: new Map(), parent: fn.closure, caller: frame };
          fn.def.params.forEach((p, i) => f.vars.set(p, vals[i]));
          trace.push(`${pad}call ${s.name}(${fn.def.params.map((p, i) => `${p}=${vals[i]}`).join(', ')})${notes.list.length ? `   (arguments: ${notes.list.join(', ')})` : ''}`);
          exec(fn.def.body, f, depth + 1);
        }
      }
    }
    exec(prog, global, 0);
    return { out, trace };
  }

  // Build a random program. shape 'flat' = top-level functions only; 'nested' = an outer
  // function with inner functions (and sometimes a third level).
  function buildScopeProgram(rng, shape) {
    const fnNames = shuffle(rng, pick(rng, FN_POOLS));
    const vars = shuffle(rng, SCOPE_VARS);
    const globals = vars.slice(0, int(rng, 1, 2));
    const spare = vars.slice(2, 4);
    const fns = [];
    const mk = parent => {
      const f = { name: fnNames[fns.length], parent, children: [], params: [], decls: [], calls: [] };
      fns.push(f); if (parent) parent.children.push(f); return f;
    };
    if (shape === 'flat') {
      for (let i = int(rng, 2, 4); i > 0; i--) mk(null);
    } else {
      const outer = mk(null);
      for (let i = int(rng, 2, 3); i > 0; i--) mk(outer);
      if (chance(rng, 0.4)) mk(pick(rng, outer.children));
      if (chance(rng, 0.3)) mk(null);
    }
    const top = fns.filter(f => !f.parent);
    const ancestors = f => { const a = []; for (let p = f.parent; p; p = p.parent) a.push(p); return a; };
    // Rank: every function ranks above all of its descendants; calls go only to lower ranks,
    // so there is no recursion.
    const order = [];
    (function place(list) { for (const f of shuffle(rng, list)) { place(f.children); order.push(f); } })(top);
    order.forEach((f, i) => { f.rank = i; });
    const visible = (from, to) => to !== from && !ancestors(from).includes(to)
      && (to.parent === null || to.parent === from || ancestors(from).includes(to.parent));
    const called = new Set();
    for (const f of order) {
      const cand = order.filter(g => g.rank < f.rank && visible(f, g));
      if (!cand.length) continue;
      const fresh = cand.filter(g => !called.has(g));
      const n = chance(rng, 0.3) ? 2 : 1;
      const chosen = shuffle(rng, fresh).concat(shuffle(rng, cand.filter(g => called.has(g)))).slice(0, n);
      for (const g of chosen) { f.calls.push(g); called.add(g); }
    }
    for (const f of order) if (f.parent && !called.has(f)) { f.parent.calls.push(f); called.add(f); }
    // Params and local declarations, parents first.
    const preorder = []; (function walk(list) { for (const f of list) { preorder.push(f); walk(f.children); } })(top);
    for (const f of preorder) {
      if (chance(rng, 0.35)) {
        f.params.push(chance(rng, 0.5) ? pick(rng, globals) : spare[0]);
        if (chance(rng, 0.25) && !f.params.includes(spare[1])) f.params.push(spare[1]);
      }
      const outerNames = new Set(globals);
      for (const a of ancestors(f)) { a.params.forEach(p => outerNames.add(p)); a.decls.forEach(d => outerNames.add(d)); }
      f.outerNames = outerNames;
      const shadowable = [...outerNames].filter(v => !f.params.includes(v));
      const isLeaf = !f.calls.length;
      const pDecl = f.parent === null && f.children.length ? 0.85 : isLeaf ? 0.3 : 0.7;
      if (shadowable.length && chance(rng, pDecl)) {
        const s = shuffle(rng, shadowable);
        f.decls.push(s[0]);
        if (s[1] && chance(rng, 0.2)) f.decls.push(s[1]);
      }
    }
    // Expressions use only names resolvable under BOTH rules: own params/locals, ancestors'
    // params/locals (an inner function only runs while its ancestors are active) and globals.
    function mkExpr(names, preferFree, own, noLit) {
      const free = names.filter(v => !own.includes(v));
      const nm = () => (preferFree && free.length && chance(rng, 0.75) ? pick(rng, free) : pick(rng, names));
      const r = rng();
      if (!names.length || (r < 0.15 && !noLit)) return [{ neg: false, f: [{ n: int(rng, 2, 9) }] }];
      if (r < 0.5) return [{ neg: false, f: [{ v: nm() }] }];
      if (r < 0.8) return [{ neg: false, f: [{ v: nm() }] }, { neg: chance(rng, 0.3), f: [{ n: int(rng, 1, 9) }] }];
      if (r < 0.9) return [{ neg: false, f: [{ n: int(rng, 2, 3) }, { v: nm() }] }];
      const a = nm(); let b = nm(); if (b === a && names.length > 1) b = pick(rng, names.filter(v => v !== a));
      return [{ neg: false, f: [{ v: a }] }, { neg: false, f: [{ v: b }] }];
    }
    const litExpr = () => [{ neg: false, f: [{ n: int(rng, 1, 30) }] }];
    const argsFor = (g, names, own) => g.params.map(() => (chance(rng, 0.4) ? litExpr() : mkExpr(names, false, own)));
    function body(f) {
      const out = [];
      const own = f.params.slice();
      const outerOnly = [...f.outerNames].filter(v => !f.decls.includes(v) && !f.params.includes(v));
      for (const d of f.decls) {
        const names = own.concat(outerOnly);
        out.push({ k: 'assign', name: d, e: chance(rng, 0.55) || !names.length ? litExpr() : mkExpr(names, false, own) });
        own.push(d);
      }
      for (const c of shuffle(rng, f.children)) out.push({ k: 'def', name: c.name, params: c.params, body: body(c) });
      const names = own.concat(outerOnly);
      const actions = f.calls.map(g => ({ k: 'call', name: g.name, args: argsFor(g, names, own) }));
      if (!f.calls.length || chance(rng, 0.3)) {
        const args = [mkExpr(names, true, own, true)];
        if (chance(rng, 0.2)) args.push(mkExpr(names, true, own, true));
        actions.splice(int(rng, 0, actions.length), 0, { k: 'print', args });
      }
      if (f.decls.length && f.calls.length && chance(rng, 0.25)) {
        const d = pick(rng, f.decls);
        const e = chance(rng, 0.5) ? litExpr() : [{ neg: false, f: [{ v: d }] }, { neg: false, f: [{ n: int(rng, 1, 9) }] }];
        actions.splice(int(rng, 0, actions.length - 1), 0, { k: 'assign', name: d, e });
      }
      return out.concat(actions);
    }
    const prog = [];
    const used = new Set();
    for (const g of globals) {
      let v; do { v = int(rng, 1, 20); } while (used.has(v)); used.add(v);
      prog.push({ k: 'assign', name: g, e: [{ neg: false, f: [{ n: v }] }] });
    }
    for (const f of shuffle(rng, top)) prog.push({ k: 'def', name: f.name, params: f.params, body: body(f) });
    const mainCalls = top.filter(f => !called.has(f)).sort((a, b) => b.rank - a.rank);
    if (chance(rng, 0.35)) mainCalls.push(pick(rng, top));
    mainCalls.forEach((f, i) => {
      if (i > 0 && chance(rng, 0.3)) prog.push({ k: 'assign', name: pick(rng, globals), e: litExpr() });
      prog.push({ k: 'call', name: f.name, args: argsFor(f, globals, []) });
    });
    if (chance(rng, 0.12)) prog.push({ k: 'print', args: [[{ neg: false, f: [{ v: pick(rng, globals) }] }]] });
    return { prog, fns, globals };
  }

  const STATIC_RULE = 'Static: look in the function, then where it is DEFINED (its static parent), then outward to global.';
  const DYNAMIC_RULE = 'Dynamic: look in the function, then in its CALLER, then the caller’s caller, out to global.';
  const LOCAL_NOTE = 'Assigning to a name inside a function makes it local.';

  // Keep programs about as long as her exam's (the study screen must not scroll).
  const MAX_LINES = 15; // with the worked trace, longer programs don't fit a half-screen window
  const codeLines = p => pyLines(p.prog, 0, [], true).join('\n').replace(/\n+$/, '').split('\n').length;

  function scopeMake(rng) {
    const r = rng();
    const kind = r < 0.4 ? 'static' : r < 0.8 ? 'dynamic' : r < 0.92 ? 'parent' : 'ancestors';
    if (kind === 'static' || kind === 'dynamic') {
      let best = null;
      const wantDiff = chance(rng, 0.85);
      for (let attempt = 0; attempt < 40; attempt++) {
        const p = buildScopeProgram(rng, chance(rng, 0.55) ? 'flat' : 'nested');
        if (codeLines(p) > MAX_LINES) continue;
        const s = runScope(p.prog, 'static'), d = runScope(p.prog, 'dynamic');
        if (!s.out.length || s.out.length > 5) continue;
        // Prefer a short trace (the worked answer has to fit on screen); keep a long one only as a fallback.
        const short = s.trace.length <= 9 && d.trace.length <= 9;
        if (!short && best) continue;
        best = { p, s, d };
        if (short && (!wantDiff || s.out.join(' ') !== d.out.join(' '))) break;
      }
      const { p, s, d } = best;
      const res = kind === 'static' ? s : d;
      const other = kind === 'static' ? d : s;
      const answer = res.out.join(' ');
      return {
        type: 'typed',
        prompt: `What does this print under ${kind.toUpperCase()} scoping? ${LOCAL_NOTE} Separate values with spaces.`,
        code: pyLines(p.prog, 0, [], true).join('\n').replace(/\n+$/, ''),
        answer,
        why: [kind === 'static' ? STATIC_RULE : DYNAMIC_RULE, '', ...res.trace, '', `Output: ${answer}`,
          `(Under ${kind === 'static' ? 'dynamic' : 'static'} scoping it would print ${other.out.join(' ')}${other.out.join(' ') === answer ? ', the same' : ''}.)`].join('\n'),
        source: src('5.2'),
      };
    }
    // Static parent / ancestors: needs nesting.
    let p;
    do { p = buildScopeProgram(rng, 'nested'); } while (codeLines(p) > MAX_LINES);
    const nestedFns = p.fns.filter(f => f.parent);
    const deep = nestedFns.filter(f => f.parent.parent);
    const code = pyLines(p.prog, 0, [], true).join('\n').replace(/\n+$/, '');
    const chain = f => { const a = []; for (let q = f.parent; q; q = q.parent) a.push(q.name); return a.concat('global'); };
    if (kind === 'parent') {
      const target = chance(rng, 0.15) ? pick(rng, p.fns.filter(f => !f.parent)) : pick(rng, deep.length && chance(rng, 0.5) ? deep : nestedFns);
      const answer = target.parent ? target.parent.name : 'global';
      return {
        type: 'typed',
        prompt: `Python-like syntax. What is the static parent of ${target.name}? Type the function name, or global if ${target.name} is defined at the top level.`,
        code, answer,
        accept: answer === 'global' ? ['global scope', 'the global scope', 'main', 'main program', 'module', 'none'] : [],
        why: `The static parent is the nearest scope that encloses the definition in the program text (not the caller). ${target.name} is written ${target.parent ? `inside ${target.parent.name}` : 'at the top level'}, so its static parent is ${answer}. Its static ancestors, nearest first: ${chain(target).join(', ')}.`,
        source: src('5.2'),
      };
    }
    const target = pick(rng, deep.length && chance(rng, 0.6) ? deep : nestedFns);
    const anc = chain(target);
    return {
      type: 'set',
      prompt: `Python-like syntax. List ALL static ancestors of ${target.name} (every scope that encloses its definition), comma-separated in any order. Write the top level as global.`,
      code, answer: anc,
      why: `Walk outward through the program text from ${target.name}: ${anc.map((a, i) => (i === 0 ? `static parent ${a}` : a)).join(', then ')}. The callers do not matter for static ancestors.`,
      source: src('5.2'),
    };
  }

  G.register({ id: 'gen-370-scope', deck: 'csc370', lecture: '5.2', cat: 'Theory', sub: 'Scope',
    title: 'Static vs dynamic scope: trace the output', make: scopeMake });

  // ═══════════════════════════ Grammar engine (2 and 3) ═══════════════════════════
  // Grammar: { rules: [[lhs, [alt]]], start, char }. Symbols: '<name>' nonterminals,
  // one-character terminals. char = true: adjacent terminals are written together (3.9).
  const isNT = s => s.length > 2 && s[0] === '<' && s[s.length - 1] === '>';
  function symsText(syms, char) {
    let out = '';
    syms.forEach((s, i) => {
      if (i > 0) out += char && !isNT(s) && !isNT(syms[i - 1]) ? '' : ' ';
      out += s;
    });
    return out;
  }
  const grammarText = g => g.rules.map(([lhs, alts]) => `${lhs} → ${alts.map(a => symsText(a, g.char)).join(' | ')}`).join('\n');
  const stringText = (toks, char) => (char ? toks.join('') : toks.join(' '));

  // All parse trees (up to cap) of toks from the start symbol. Tree: { sym, kids? }.
  function parseTrees(g, toks, cap = 4) {
    const rules = new Map(g.rules);
    const memo = new Map();
    function trees(sym, i, j) {
      if (!isNT(sym)) return j === i + 1 && toks[i] === sym ? [{ sym }] : [];
      const key = `${sym}|${i}|${j}`;
      if (memo.has(key)) return memo.get(key);
      memo.set(key, []);
      const res = [];
      for (const alt of rules.get(sym)) {
        for (const kids of seq(alt, 0, i, j)) { if (res.length < cap) res.push({ sym, kids }); }
      }
      memo.set(key, res);
      return res;
    }
    function seq(alt, k, i, j) {
      const left = alt.length - 1 - k;
      if (left === 0) return trees(alt[k], i, j).map(t => [t]);
      const out = [];
      for (let m = i + 1; m <= j - left; m++) {
        const heads = trees(alt[k], i, m);
        if (!heads.length) continue;
        const tails = seq(alt, k + 1, m, j);
        for (const h of heads) for (const t of tails) { if (out.length < cap) out.push([h].concat(t)); }
      }
      return out;
    }
    return trees(g.start, 0, toks.length);
  }
  function leftmostForms(tree) {
    const forms = [[tree]];
    for (;;) {
      const cur = forms[forms.length - 1];
      const i = cur.findIndex(n => n.kids);
      if (i < 0) break;
      forms.push(cur.slice(0, i).concat(cur[i].kids, cur.slice(i + 1)));
    }
    return forms.map(f => f.map(n => n.sym));
  }
  // Fully bracketed grouping: every node that combines two or more parts gets brackets.
  function bracket(t) {
    if (!t.kids) return t.sym;
    if (t.kids.length === 1) return bracket(t.kids[0]);
    return '(' + t.kids.map(bracket).join(' ') + ')';
  }
  function outline(t, depth = 0, out = []) {
    out.push('  '.repeat(depth) + t.sym);
    if (t.kids) t.kids.forEach(k => outline(k, depth + 1, out));
    return out;
  }

  // ═══════════════════════════ 2. Derivations ═══════════════════════════
  const DIGITS = '0123456789'.split('');
  const alts1 = xs => xs.map(x => [x]);
  const orList = xs => xs.join(' | ');

  // Each family: grammar + a derivable string + underivable mutations (with the reason) +
  // false "reasons" used as wrong options.
  function famAssign(rng) {
    const vars = sample(rng, 'abcdexyz'.split(''), int(rng, 3, 4)).sort();
    const nums = sample(rng, DIGITS, int(rng, 2, 4)).sort();
    const ops = sample(rng, ['+', '*', '-', '/'], 2);
    const opNT = chance(rng, 0.35);
    const rules = [
      ['<program>', [['<stmts>']]],
      ['<stmts>', [['<stmt>'], ['<stmt>', ';', '<stmts>']]],
      ['<stmt>', [['<var>', '=', '<expr>']]],
      ['<var>', alts1(vars)],
      ['<num>', alts1(nums)],
    ];
    if (opNT) rules.push(['<expr>', [['<term>', '<op>', '<expr>'], ['<term>']]], ['<op>', alts1(ops)]);
    else rules.push(['<expr>', ops.map(o => ['<term>', o, '<expr>']).concat([['<term>']])]);
    rules.push(['<term>', [['<var>'], ['<num>']]]);
    const g = { rules, start: '<program>', char: false };
    const term = () => (chance(rng, 0.6) ? pick(rng, vars) : pick(rng, nums));
    const stmt = n => { const t = [pick(rng, vars), '=', term()]; for (let i = 1; i < n; i++) t.push(pick(rng, ops), term()); return t; };
    const two = chance(rng, 0.25);
    const good = two ? stmt(1).concat(';', stmt(int(rng, 1, 2))) : stmt(int(rng, 1, 3));
    const opsTxt = ops.join(' or ');
    const badVar = DIGITS.length && 'abcdefghjkmnpqrstuvwxyz'.split('').filter(c => !vars.includes(c));
    const badNum = DIGITS.filter(d => !nums.includes(d));
    const badOp = ['+', '*', '-', '/'].filter(o => !ops.includes(o));
    const idxOf = pred => good.map((t, i) => (pred(t, i) ? i : -1)).filter(i => i >= 0);
    const muts = [
      () => { const i = pick(rng, idxOf(t => vars.includes(t))); const c = pick(rng, badVar); const s = good.slice(); s[i] = c; return [s, `${c} is not a terminal of this grammar: <var> derives only ${orList(vars)}`]; },
      () => { const i = pick(rng, idxOf(t => vars.includes(t) || nums.includes(t))); const c = pick(rng, badNum); const s = good.slice(); s[i] = c; return [s, `${c} is not a terminal of this grammar: <num> derives only ${orList(nums)}`]; },
      () => { const is = idxOf(t => ops.includes(t)); if (!is.length) return null; const c = pick(rng, badOp); const s = good.slice(); s[pick(rng, is)] = c; return [s, `${c} is not a terminal of this grammar: <expr> joins terms only with ${opsTxt}`]; },
      () => { const s = [pick(rng, nums)].concat(good.slice(1)); return [s, `<stmt> → <var> = <expr> needs a <var> before =, and <var> derives only letters (${orList(vars)}), never a number`]; },
      () => { const s = good.concat(pick(rng, ops)); return [s, `every operator must be followed by an <expr>, which derives at least one <term>, so the string cannot end with an operator`]; },
      () => { const s = good.concat(';'); return [s, `; appears only in <stmts> → <stmt> ; <stmts>, so it must be followed by another statement`]; },
      () => { const is = idxOf(t => ops.includes(t)); if (!is.length) return null; const i = pick(rng, is); const s = good.slice(0, i + 1).concat(pick(rng, ops), good.slice(i + 1)); return [s, `an operator must sit between two <term>s (<term> ${opNT ? '<op>' : ops[0]} <expr>), so two operators in a row cannot be derived`]; },
      () => { const s = good.slice(); s.splice(1, 1); return [s, `<stmt> → <var> = <expr> requires = right after the <var>`]; },
    ];
    const present = good.filter(t => vars.includes(t) || nums.includes(t) || ops.includes(t));
    const lies = [
      '<expr> can hold only one operator',
      'a program can contain only one statement',
      'a <num> cannot appear right after =',
      'a <var> cannot appear on the right side of =',
      `the symbol ${pick(rng, present)} is not a terminal of this grammar`,
      'every statement must end with ;',
    ];
    return { g, good, muts, lies };
  }

  function famGPA(rng) {
    const name = pick(rng, ['<GPA>', '<rating>', '<score>', '<mark>']);
    const M = int(rng, 2, 9);
    const left = DIGITS.slice(0, M);
    const half = chance(rng, 0.25);
    const right = half ? ['0', '5'] : DIGITS;
    const L = half ? '<left digit>' : pick(rng, ['<left digit>', '<whole>']);
    const R = half ? '<half>' : L === '<whole>' ? '<tenth>' : '<right digit>';
    const g = { rules: [[name, [[String(M), '.', '0'], [L, '.', R]]], [L, alts1(left)], [R, alts1(right)]], start: name, char: true };
    const good = chance(rng, 0.2) ? [String(M), '.', '0'] : [pick(rng, left), '.', pick(rng, right)];
    const nonzeroRight = right.filter(d => d !== '0');
    const muts = [
      () => [[String(M), '.', pick(rng, DIGITS.slice(1))], `the only alternative that can start with ${M} is ${name} → ${M}.0, and ${L} derives only ${left[0]}–${left[left.length - 1]}`],
      () => (M < 9 ? [[String(int(rng, M + 1, 9)), '.', pick(rng, right)], `${L} derives only ${left[0]}–${left[left.length - 1]} and the other alternative is exactly ${M}.0, so nothing can start with a digit above ${M}`] : null),
      () => [[pick(rng, left), '.', pick(rng, right), pick(rng, right)], `${R} derives exactly one digit, so only one digit can follow the point`],
      () => [['1', pick(rng, left), '.', pick(rng, right)], `${L} derives exactly one digit, so only one digit can come before the point`],
      () => [[pick(rng, left), pick(rng, right)], `every alternative of ${name} contains the point (.), so a string without one cannot be derived`],
      () => (half ? [[pick(rng, left), '.', pick(rng, ['1', '2', '3', '4', '6', '7', '8', '9'])], `${R} derives only 0 | 5, so no other digit can follow the point`] : null),
    ];
    const lies = [
      'the point (.) is not a terminal of this grammar',
      `${M}.0 is the only string this grammar can derive`,
      `${L} cannot derive ${pick(rng, left)}`,
      `${R} cannot derive ${pick(rng, nonzeroRight)}`,
      'a derivation can use only one rule',
    ];
    return { g, good, muts, lies };
  }

  function famNoLeadZero(rng) {
    const binary = chance(rng, 0.5);
    const D = binary ? ['0', '1'] : DIGITS.slice(0, int(rng, 3, 5));
    const name = pick(rng, binary ? ['<bin>', '<binary>'] : ['<num>', '<count>', '<value>']);
    const rest = '<rest>';
    const dig = binary ? '<bit>' : '<digit>';
    const nz = D.slice(1);
    const rules = binary
      ? [[name, [['0'], ['1'], ['1', rest]]], [rest, [[dig], [dig, rest]]], [dig, alts1(D)]]
      : [[name, [['0'], ['<lead>'], ['<lead>', rest]]], [rest, [[dig], [dig, rest]]], ['<lead>', alts1(nz)], [dig, alts1(D)]];
    const g = { rules, start: name, char: true };
    const len = int(rng, 2, 5);
    const good = [pick(rng, nz)]; while (good.length < len) good.push(pick(rng, D));
    const bad = DIGITS.filter(d => !D.includes(d));
    const muts = [
      () => [['0'].concat(good.slice(1)), `a string starting with 0 can only come from ${name} → 0, which is the whole string; ${binary ? 'the other alternatives start with 1' : '<lead> never derives 0'}`],
      () => { const s = good.slice(); s[int(rng, 1, s.length - 1)] = pick(rng, bad); return [s, `${s.find(c => bad.includes(c))} is not a terminal of this grammar: ${dig} derives only ${orList(D)}`]; },
    ];
    const lies = [
      'the grammar cannot derive a string longer than two digits',
      `${dig} cannot derive 0`,
      'a string cannot end with 0',
      `the symbol ${pick(rng, good)} is not a terminal of this grammar`,
    ];
    return { g, good, muts, lies };
  }

  function famIdent(rng) {
    const letters = sample(rng, 'abcdefgh'.split(''), int(rng, 2, 3)).sort();
    const digs = sample(rng, DIGITS, int(rng, 2, 3)).sort();
    const name = pick(rng, ['<ident>', '<name>', '<id>']);
    const g = { rules: [
      [name, [['<letter>'], ['<letter>', '<rest>']]],
      ['<rest>', [['<letter>'], ['<digit>'], ['<letter>', '<rest>'], ['<digit>', '<rest>']]],
      ['<letter>', alts1(letters)],
      ['<digit>', alts1(digs)],
    ], start: name, char: true };
    const len = int(rng, 2, 4);
    const good = [pick(rng, letters)]; while (good.length < len) good.push(chance(rng, 0.5) ? pick(rng, letters) : pick(rng, digs));
    if (!good.some(c => digs.includes(c))) good[good.length - 1] = pick(rng, digs);
    const badL = 'ijkmnpqrsuvwxyz'.split('').filter(c => !letters.includes(c));
    const badD = DIGITS.filter(d => !digs.includes(d));
    const muts = [
      () => [[pick(rng, digs)].concat(good.slice(1)), `every alternative of ${name} starts with <letter>, so the string cannot start with a digit`],
      () => { const s = good.slice(); const c = pick(rng, badL); s[int(rng, 0, s.length - 1)] = c; return [s, `${c} is not a terminal of this grammar: <letter> derives only ${orList(letters)}`]; },
      () => { const s = good.slice(); const c = pick(rng, badD); s[int(rng, 1, s.length - 1)] = c; return [s, `${c} is not a terminal of this grammar: <digit> derives only ${orList(digs)}`]; },
    ];
    const lies = [
      'an identifier cannot contain a digit',
      'an identifier cannot end with a digit',
      `the symbol ${pick(rng, good)} is not a terminal of this grammar`,
      `${name} can derive only one character`,
    ];
    return { g, good, muts, lies };
  }

  const FAMILIES = [famAssign, famGPA, famNoLeadZero, famIdent];

  function deriveText(g, tree) {
    const forms = leftmostForms(tree).map(f => symsText(f, g.char));
    return forms;
  }

  function deriveMake(rng) {
    const r = rng();
    const mode = r < 0.4 ? 'derive' : r < 0.75 ? 'mc' : 'recall';
    const fam = pick(rng, FAMILIES);
    let F, tree, forms;
    for (let attempt = 0; attempt < 30; attempt++) {
      F = fam(rng);
      tree = parseTrees(F.g, F.good, 2)[0];
      if (!tree) throw new Error('derivable string did not parse');
      forms = deriveText(F.g, tree);
      if (forms.length <= 13) break;
    }
    const { g } = F;
    const code = grammarText(g);
    const startNote = `The start symbol is ${g.start}.`;
    const derivWhy = `Leftmost derivation: at each step, replace the LEFTMOST nonterminal using one rule.\n${forms.join('\n⇒ ')}`;
    if (mode === 'derive') {
      const s = stringText(F.good, g.char);
      return {
        type: 'recall',
        prompt: `Using this grammar, write the leftmost derivation of \`${s}\`. ${startNote} Write each sentential form in order, separated by =>.`,
        code, answer: forms.join(' => '), points: forms, why: derivWhy, source: src('4'),
      };
    }
    // Derivable or not (about half each).
    let target = F.good, reason = null;
    if (chance(rng, 0.55)) {
      for (const m of shuffle(rng, F.muts)) {
        const res = m();
        if (res && parseTrees(g, res[0], 1).length === 0) { [target, reason] = res; break; }
      }
    }
    const s = stringText(target, g.char);
    const derivable = !reason;
    if (mode === 'mc') {
      const lies = shuffle(rng, F.lies.filter((l, i, a) => a.indexOf(l) === i)).map(l => `No: ${l}`);
      const answer = derivable ? 'Yes' : `No: ${reason}`;
      const options = (derivable ? lies.slice(0, 3) : ['Yes'].concat(lies.slice(0, 2)));
      return {
        type: 'mc',
        prompt: `Using this grammar, can \`${s}\` be derived? ${startNote} Pick the correct answer and reason.`,
        code, answer, options,
        why: derivable ? `Yes. ${derivWhy}` : `No: ${reason}.\nThe other "No" reasons are false statements about this grammar.`,
        source: src('4'),
      };
    }
    return {
      type: 'recall',
      prompt: `Using this grammar, can \`${s}\` be derived? ${startNote} If yes, write the leftmost derivation (forms separated by =>); if not, explain which rule makes it impossible.`,
      code,
      answer: derivable ? `Yes: ${forms.join(' => ')}` : `No: ${reason}.`,
      points: derivable ? ['Yes'].concat(forms) : ['No', reason],
      why: derivable ? derivWhy : `No: ${reason}.`,
      source: src('4'),
    };
  }

  G.register({ id: 'gen-370-derive', deck: 'csc370', lecture: '4', cat: 'Theory', sub: 'Grammars & BNF',
    title: 'Leftmost derivations: derive it or show it cannot be derived', make: deriveMake });

  // ═══════════════════════════ 3. Ambiguity, precedence, associativity ═══════════════════════════
  // Expression grammars over one-character constants. Some are ambiguous; the parse-tree
  // counter decides every answer.
  function exprGrammar(rng) {
    const ops = sample(rng, ['+', '-', '*', '/'], 2);
    const consts = chance(rng, 0.5) ? sample(rng, 'abcd'.split(''), 3).sort() : sample(rng, '2345678'.split(''), 3).sort();
    const C = chance(rng, 0.5) ? '<const>' : '<id>';
    const E = '<expr>', T = '<term>';
    const c = [C, alts1(consts)];
    const [o1, o2] = ops;
    const fams = [
      () => [[E, [[E, '<op>', E], [C]]], ['<op>', alts1(ops)], c],
      () => [[E, [[E, o1, E], [C]]], c],
      () => [[E, [[E, o1, C], [C]]], c],
      () => [[E, [[C, o1, E], [C]]], c],
      () => [[E, [[E, o1, T], [T]]], [T, [[T, o2, C], [C]]], c],
      () => [[E, [[T, o1, E], [T]]], [T, [[C, o2, T], [C]]], c],
      () => [[E, [[T, o1, E], [T, o2, E], [T]]], [T, [[C]]], c],
      () => [[E, [[E, o1, C], [C, o1, E], [C]]], c],
      () => [[E, [[E, o1, E], [T]]], [T, [[T, o2, C], [C]]], c],
      () => [[E, [[E, o1, E], [E, o2, E], [C]]], c],
    ];
    const rules = pick(rng, fams)();
    const usedOps = ops.filter(o => rules.some(([, alts]) => alts.some(a => a.includes(o) || a.includes('<op>'))));
    return { g: { rules, start: E, char: false }, ops: usedOps, consts };
  }
  // Distinct groupings (bracketings) of a sentence; two or more means ambiguous.
  function groupings(g, toks) {
    const seen = new Map();
    for (const t of parseTrees(g, toks, 8)) { const b = bracket(t); if (!seen.has(b)) seen.set(b, t); }
    return [...seen.entries()].map(([b, t]) => ({ b, t }));
  }
  function exprString(rng, X, nOps, opList) {
    const t = [pick(rng, X.consts)];
    for (let i = 0; i < nOps; i++) t.push(opList ? opList[i] : pick(rng, X.ops), pick(rng, X.consts));
    return t;
  }
  // Shortest string with two parse trees, or null if every 2- and 3-operator string has one.
  function findWitness(rng, X) {
    const k = X.consts;
    for (const n of [2, 3]) {
      const combos = [];
      const rec = acc => { if (acc.length === n) { combos.push(acc); return; } for (const o of X.ops) rec(acc.concat(o)); };
      rec([]);
      for (const ops of shuffle(rng, combos)) {
        const s = exprString(rng, X, n, ops);
        if (groupings(X.g, s).length >= 2) return s;
      }
      void k;
    }
    return null;
  }
  const noSpace = s => s.replace(/\s+/g, '');
  const stripOuter = s => (s.startsWith('(') && s.endsWith(')') ? s.slice(1, -1) : s);
  const groupingAccepts = b => [...new Set([b, noSpace(b), stripOuter(b), noSpace(stripOuter(b))])].filter(x => x !== b);

  function ambMake(rng) {
    const r = rng();
    const mode = r < 0.3 ? 'isamb' : r < 0.5 ? 'witness' : r < 0.78 ? 'group' : 'mcgroup';
    let X, witness;
    for (let attempt = 0; attempt < 60; attempt++) {
      X = exprGrammar(rng);
      witness = findWitness(rng, X);
      if (mode === 'witness' && !witness) continue;
      if (mode === 'group' && witness) continue;
      break;
    }
    const { g } = X;
    const code = grammarText(g);
    if (mode === 'isamb') {
      const amb = !!witness;
      let why;
      if (amb) {
        const [{ b: a }, { b }] = groupings(g, witness);
        why = `Yes. A grammar is ambiguous if some sentence has two or more distinct parse trees. \`${stringText(witness)}\` has two:\n${a}\n${b}`;
      } else {
        const s = exprString(rng, X, 2);
        why = `No. Every operator is at a fixed level and its recursion is on one side only, so each sentence has exactly one parse tree (checked for every sentence with up to three operators). For example \`${stringText(s)}\` can only be grouped ${bracket(parseTrees(g, s, 1)[0])}.`;
      }
      return { type: 'mc', prompt: 'Is this grammar ambiguous?', code, answer: amb ? 'Yes' : 'No', options: [amb ? 'No' : 'Yes'], why, source: src('4') };
    }
    if (mode === 'witness') {
      const [{ b: a, t: ta }, { b, t: tb }] = groupings(g, witness);
      const s = stringText(witness);
      return {
        type: 'recall',
        prompt: 'Show that this grammar is ambiguous: give a sentence that has two different parse trees, and write the two groupings with brackets.',
        code,
        answer: `\`${s}\`: ${a} and ${b}`,
        points: [`a sentence with two parse trees, e.g. ${s}`, `grouping 1: ${a}`, `grouping 2: ${b}`],
        why: `\`${s}\` has two parse trees, so the grammar is ambiguous (any sentence with two trees is a valid answer).\nTree 1, ${a}:\n${outline(ta).join('\n')}\nTree 2, ${b}:\n${outline(tb).join('\n')}`,
        source: src('4'),
      };
    }
    const explain = () => {
      const notes = [];
      for (const [lhs, alts] of g.rules) {
        for (const a of alts) {
          if (a.length !== 3) continue;
          const op = a[1] === '<op>' ? 'each operator' : a[1];
          if (a[0] === lhs && a[2] === lhs) notes.push(`${lhs} → ${a.join(' ')} recurses on both sides of ${op}, so it does not decide the grouping`);
          else if (a[0] === lhs) notes.push(`${lhs} → ${a.join(' ')} recurses on the LEFT of ${op}: left-associative`);
          else if (a[2] === lhs) notes.push(`${lhs} → ${a.join(' ')} recurses on the RIGHT of ${op}: right-associative`);
        }
      }
      if (g.rules.some(([lhs]) => lhs === '<term>') && g.rules[1][1].some(a => a.length === 3)) notes.push('the operator in <term> sits at a LOWER level of the tree, so it is grouped first (higher precedence)');
      return notes.join('; ') + '.';
    };
    if (mode === 'group') {
      const s = exprString(rng, X, int(rng, 2, 3));
      const t = parseTrees(g, s, 2);
      const b = bracket(t[0]);
      return {
        type: 'typed',
        prompt: `How does this grammar group \`${stringText(s)}\`? Type it with brackets around every operation, e.g. ((a + b) + c).`,
        code, answer: b, accept: groupingAccepts(b),
        why: `The grammar has exactly one parse tree for it: ${b}. Why: ${explain()}\nParse tree:\n${outline(t[0]).join('\n')}`,
        source: src('4'),
      };
    }
    // mcgroup: two operators (same op → associativity; different → precedence).
    const ops = X.ops.length > 1 && chance(rng, 0.5) ? shuffle(rng, X.ops) : [X.ops[0], X.ops[0]];
    const s = exprString(rng, X, 2, ops);
    const [a, o1, b, o2, c] = s;
    const L = `((${a} ${o1} ${b}) ${o2} ${c})`, R = `(${a} ${o1} (${b} ${o2} ${c}))`, AMB = 'Either: it has a parse tree for each grouping, so the grammar does not decide';
    const gs = groupings(g, s);
    const t = gs.map(x => x.t);
    const answer = gs.length >= 2 ? AMB : gs[0].b;
    return {
      type: 'mc',
      prompt: `How does this grammar group \`${stringText(s)}\`?`,
      code, answer, options: [L, R, AMB].filter(o => o !== answer),
      why: gs.length >= 2 ? `It has two parse trees, ${bracket(t[0])} and ${bracket(t[1])}, so the grammar is ambiguous for this sentence. ${explain()}` : `Only one parse tree: ${answer}. Why: ${explain()}`,
      source: src('4'),
    };
  }

  G.register({ id: 'gen-370-ambiguous', deck: 'csc370', lecture: '4', cat: 'Theory', sub: 'Grammars & BNF',
    title: 'Ambiguity, precedence and associativity in a grammar', make: ambMake });

  // ═══════════════════════════ 4. C pointers (gcc-verified bank) ═══════════════════════════
  function cMake(rng) {
    const bank = FC.cPointerBank;
    if (!bank || !bank.length) throw new Error('decks/csc370-cpointer-bank.js is not loaded');
    const withDiagram = bank.filter(e => e.diagram);
    if (withDiagram.length && chance(rng, 0.35)) {
      const e = pick(rng, withDiagram);
      const lines = e.code.split('\n');
      lines[e.diagram.line] += '   // HERE';
      return {
        type: 'recall',
        prompt: 'Memory diagram: after the // HERE line runs, give every variable in main. Write a = 5, p → a, arr = {1, 2, 3}, s = "abc", ? if unknown.',
        code: lines.join('\n'),
        answer: e.diagram.vars.join('\n'),
        points: e.diagram.vars,
        why: String(e.diagram.why || e.why).replace(/\nState after it:[\s\S]*$/, ''), // the final state is the checklist
        source: 'Generated practice; AUCSC 370 C exam style (memory diagram); values verified by compiling and running with gcc',
      };
    }
    const e = pick(rng, bank);
    return {
      type: 'typed',
      prompt: 'What does this program print? Type the output exactly (line breaks may be typed as spaces).',
      code: e.code, answer: e.answer, why: e.why,
      source: 'Generated practice; AUCSC 370 C exam style; output verified by compiling and running with gcc',
    };
  }

  G.register({ id: 'gen-370-c-pointers', deck: 'csc370', lecture: '3', cat: 'Programming', sub: 'C & memory',
    title: 'C pointer traces and memory diagrams', make: cMake });

  // ═══════════════════════════ 5. Binding time and storage ═══════════════════════════
  const BT = ['Language design time', 'Language implementation time', 'Compile time', 'Load time', 'Run time'];
  const ST = ['Static', 'Stack-dynamic', 'Explicit heap-dynamic', 'Implicit heap-dynamic'];
  const BIND_NOTE = 'Binding times (earliest first): language design, language implementation, compile, load, run (Sebesta §5.4).';

  function bindingMake(rng) {
    const v = pick(rng, ['count', 'total', 'sum', 'score', 'n', 'items', 'width', 'level', 'hits', 'price']);
    const op = pick(rng, ['+', '*', '-']);
    const k = String(int(rng, 2, 99));
    const lang = pick(rng, ['C', 'Java']);
    const stmt = `${v} = ${v} ${op} ${k};`;
    const opName = { '+': 'addition', '*': 'multiplication', '-': 'subtraction' }[op];
    if (chance(rng, 0.55)) {
      const items = [
        [`the type of ${v}`, 'Compile time', `In ${lang} the type comes from the declaration int ${v};, so the compiler binds it when it reads that declaration (static type binding).`],
        [`the set of possible values of ${v} (for example, the range of int)`, 'Language implementation time', `How many bits an int has (and so its range) is chosen by whoever implements the ${lang} compiler.`],
        [`the meaning of the ${op} in this statement (which machine operation it becomes)`, 'Compile time', `Only once the compiler knows the operand types (int ${op} int) can it pick the operation.`],
        [`the internal representation of the literal ${k}`, 'Language implementation time', 'The bit pattern used for an integer literal is fixed by the language implementation.'],
        [`the value of ${v}`, 'Run time', 'The value changes as the program runs; this statement rebinds it each time it executes.'],
        [`the symbol ${op} standing for ${opName} at all`, 'Language design time', `The designers of ${lang} decided that ${op} means ${opName}.`],
      ];
      const [what, answer, why] = pick(rng, items);
      return {
        type: 'mc',
        prompt: `In the ${lang} statement ${stmt} (with ${v} declared as int), when is ${what} bound?`,
        answer, options: BT.filter(b => b !== answer),
        why: `${why} ${BIND_NOTE}`, source: src('5.1'),
      };
    }
    const fn = pick(rng, ['update', 'tick', 'process', 'record', 'step', 'load']);
    const cases = [
      [`int ${v};   // at file scope, outside every function`, 'C', `${v}`, 'Static', `A file-scope (global) variable is bound to its memory before execution starts and keeps it until the program ends. Its address is bound at load time.`],
      [`void ${fn}(void) {\n    static int ${v} = 0;\n    ${v}++;\n}`, 'C', `${v}`, 'Static', `static inside a function: one memory cell for the whole run, so ${v} keeps its value between calls (her sa example).`],
      [`void ${fn}(void) {\n    int ${v} = ${k};\n    ${v}++;\n}`, 'C', `${v}`, 'Stack-dynamic', `An ordinary local is allocated on the stack when ${fn} is called (its declaration is elaborated) and freed when it returns.`],
      [`int ${fn}(int ${v}) {\n    return ${v} * 2;\n}`, 'C', `${v} (the parameter)`, 'Stack-dynamic', `Parameters live in ${fn}'s stack frame, created at the call.`],
      [`int *${v} = malloc(${k} * sizeof(int));`, 'C', `the ${k} ints that ${v} points to`, 'Explicit heap-dynamic', `malloc allocates them by an explicit instruction at run time; they stay until free, and are reached only through the pointer.`],
      [`void ${fn}(void) {\n    int *${v} = malloc(sizeof(int));\n}`, 'C', `the pointer variable ${v} itself`, 'Stack-dynamic', `${v} is an ordinary local (it lives in ${fn}'s stack frame); only the int it points to is on the heap.`],
      [`Point ${v} = new Point(${k}, 1);`, 'Java', `the Point object`, 'Explicit heap-dynamic', `Every Java object is created with new, an explicit run-time allocation on the heap (freed by the garbage collector).`],
      [`static int ${v} = ${k};   // a field of class Counter`, 'Java', `${v}`, 'Static', `A static field exists once for the class, for the whole run.`],
      [`${v} = [${k}, 4, 1]\n${v}.append(9)`, 'Python', `the list ${v}`, 'Implicit heap-dynamic', `Python lists are allocated and resized automatically on assignment: implicit heap-dynamic (as are JavaScript arrays and strings).`],
      [`var ${v} = "ab";\n${v} = ${v} + "cd";`, 'JavaScript', `the string ${v}`, 'Implicit heap-dynamic', `JavaScript strings get heap storage automatically whenever a value is assigned; there is no explicit allocation.`],
    ];
    const [code, lang2, what, answer, why] = pick(rng, cases);
    return {
      type: 'mc',
      prompt: `${lang2}. Which storage (lifetime) category does ${what} have?`,
      code, answer, options: ST.filter(s => s !== answer),
      why: `${why} Categories: static (bound before execution, for the whole run), stack-dynamic (bound when the declaration is elaborated), explicit heap-dynamic (allocated by the programmer's instruction), implicit heap-dynamic (allocated whenever a value is assigned).`,
      source: src('5.2'),
    };
  }

  G.register({ id: 'gen-370-binding', deck: 'csc370', lecture: '5.1', cat: 'Theory', sub: 'Names & binding',
    title: 'Binding times and storage categories', make: bindingMake });

  // ═══════════════════════════ 6. Lexemes and tokens ═══════════════════════════
  const CAT = {
    rw: 'reserved word', id: 'identifier', int: 'integer literal', real: 'floating-point literal', str: 'string literal',
    asg: 'assignment operator', ar: 'arithmetic operator', rel: 'relational operator', inc: 'increment/decrement operator', pun: 'punctuation (bracket, brace, semicolon, comma)',
  };
  const RW = ['int', 'double', 'while', 'if', 'for', 'return'];
  function tokensStatement(rng) {
    const ids = shuffle(rng, ['sum', 'count', 'total', 'i', 'j', 'n', 'x', 'score', 'rate', 'limit', 'ifs', 'format', 'integer', 'doubled', 'returned', 'whileCount', 'index2', 'max_val']);
    const [a, b, c] = ids;
    const T = (lex, cat) => ({ lex, cat });
    const id = s => T(s, 'id');
    const num = () => T(String(int(rng, 0, 99)), 'int');
    const ar = () => T(pick(rng, ['+', '-', '*', '/', '%']), 'ar');
    const rel = () => T(pick(rng, ['<', '<=', '>', '>=', '==', '!=']), 'rel');
    const P = s => T(s, 'pun');
    const shapes = [
      () => [id(a), T('=', 'asg'), id(a), ar(), id(b), ar(), num(), P(';')],
      () => [T('while', 'rw'), P('('), id(a), rel(), num(), P(')'), id(b), T('=', 'asg'), id(b), ar(), id(a), P(';')],
      () => [T('for', 'rw'), P('('), T('int', 'rw'), id(a), T('=', 'asg'), num(), P(';'), id(a), rel(), id(b), P(';'), id(a), T(pick(rng, ['++', '--']), 'inc'), P(')'), P('{')],
      () => [T('if', 'rw'), P('('), id(a), rel(), id(b), P(')'), id(c), T(pick(rng, ['++', '--']), 'inc'), P(';')],
      () => [T('double', 'rw'), id(a), T('=', 'asg'), T(`${int(rng, 0, 9)}.${int(rng, 1, 9)}`, 'real'), ar(), id(b), P(';')],
      () => [id(a), T(pick(rng, ['+=', '-=', '*=']), 'asg'), id(b), ar(), num(), P(';')],
      () => [T('return', 'rw'), id(a), ar(), P('('), id(b), ar(), num(), P(')'), P(';')],
      () => [id('printf'), P('('), T('"%d\\n"', 'str'), P(','), id(a), ar(), num(), P(')'), P(';')],
    ];
    return pick(rng, shapes)();
  }
  function tokensText(rng, toks) {
    const compact = chance(rng, 0.35);
    let out = '';
    toks.forEach((t, i) => {
      if (i === 0) { out = t.lex; return; }
      const prev = toks[i - 1];
      const tight = t.cat === 'pun' && t.lex !== '{' || prev.lex === '(' || t.cat === 'inc';
      const wordy = x => /^[A-Za-z_0-9"]/.test(x.lex) && /[A-Za-z_0-9"]$/.test(x.lex);
      const needSpace = wordy(prev) && wordy(t);
      out += needSpace || (!compact && !tight) ? ' ' + t.lex : t.lex;
    });
    return out;
  }
  function tokensMake(rng) {
    const toks = tokensStatement(rng);
    const text = tokensText(rng, toks);
    const table = toks.map(t => `${t.lex}  →  ${CAT[t.cat]}`).join('\n');
    const lexWhy = 'The lexical analyzer reads left to right, skips white space, and takes the LONGEST possible lexeme each time (so >= is one lexeme, and ifs or integer is one identifier, not a reserved word plus letters).';
    const r = rng();
    if (r < 0.5) {
      const t = pick(rng, toks.filter(x => x.cat !== 'pun' || chance(rng, 0.3)));
      const confusable = { id: ['rw', 'str', 'int'], rw: ['id', 'pun', 'asg'], int: ['id', 'real', 'rw'], real: ['int', 'ar', 'id'], str: ['id', 'pun', 'rw'],
        asg: ['rel', 'ar', 'inc'], ar: ['asg', 'inc', 'rel'], rel: ['asg', 'ar', 'pun'], inc: ['ar', 'asg', 'id'], pun: ['ar', 'rel', 'id'] }[t.cat];
      return {
        type: 'mc',
        prompt: `In this C/Java statement, which token category does the lexeme \`${t.lex}\` belong to?`,
        code: text, answer: CAT[t.cat], options: confusable.map(k => CAT[k]),
        why: `A token is the category of a lexeme. ${lexWhy}\n${table}`, source: src('4'),
      };
    }
    if (r < 0.8) {
      return {
        type: 'typed',
        prompt: 'How many lexemes are in this C/Java statement? Type a number.',
        code: text, answer: String(toks.length),
        why: `${lexWhy} White space is not a lexeme. The ${toks.length} lexemes:\n${table}`, source: src('4'),
      };
    }
    return {
      type: 'recall',
      prompt: 'Split this C/Java statement into lexemes and give the token category of each, in order.',
      code: text, answer: table, points: toks.map(t => `${t.lex}: ${CAT[t.cat]}`),
      why: lexWhy, source: src('4'),
    };
  }

  G.register({ id: 'gen-370-tokens', deck: 'csc370', lecture: '4', cat: 'Theory', sub: 'Translation',
    title: 'Lexemes and tokens', make: tokensMake });

  // Exposed for tests only.
  FC.gen370 = { runScope, parseTrees, leftmostForms, bracket, grammarText, symsText, isNT, CAT };
})(globalThis.FC = globalThis.FC || {});
