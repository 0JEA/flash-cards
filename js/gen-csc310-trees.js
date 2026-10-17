// Tree practice for AUCSC 310 (M. Qasem), answered ON a drawn tree (js/tree.js card types
// 'tree' = build it, 'fill' = type the dashed nodes, 'path' = tap nodes in order).
// Contract: js/generators.js. Tests: tests/gen-csc310-trees.test.js re-runs every algorithm
// with separate code (a comparison logger for decision trees, the worksheet loop for binary
// search, in-place 0-based QUICKSORT/MergeSort recording their calls) and compares.
//
// Conventions copied from the course notes (do not "fix" them to another textbook):
//   - Decision trees as in Sorting in Linear Time p. 4 (CLRS Figure 8.1): node "i:j" compares
//     a_i with a_j, LEFT child = a_i <= a_j, RIGHT child = a_i > a_j; leaf "⟨3,1,2⟩" means
//     a_3 <= a_1 <= a_2. A tree is built from the algorithm's real element comparisons:
//     insertion sort "A[i] > key" (Lecture 2), MERGE "L[i] <= R[j]" (comparisons with the
//     sentinel never branch), PARTITION "A[j] <= pivot" (Lecure 7). So quicksort's tree has
//     a node "2:1": a_2 vs a_1, left when a_2 <= a_1.
//   - Binary search: the worksheet loop, low = 1, high = n, mid = floor((low+high)/2),
//     equal -> return, a[mid] < key -> low = mid + 1, else high = mid - 1. Node ids = mid.
//   - QUICKSORT: Lecure 7, pivot = A[end] (Lomuto). Its call tree is drawn like her Example
//     (Lecure 7 p. 8): each node is the subarray as the call starts, in braces, children =
//     before-pivot and after-pivot parts, an empty part is "{}", 0/1-element calls are leaves.
//   - MergeSort: Lecture 4, mid = (left + right) / 2 integer division; nodes written like
//     her Example (Lecture 4 p. 10): "8,7,5,1" (no braces).
//   - Never Assignment 3's tasks (median-of-three timing lab, sorted-input degenerate case):
//     call-tree inputs are kept shallow (<= 5 levels), so already-sorted runs never appear.
//
//   gen-310-dtree-build   build insertion / merge / quick sort's 3-element decision tree, or one side of it
//   gen-310-dtree-path    tap the comparisons an algorithm makes on a concrete input, then the leaf
//   gen-310-dtree-facts   n! leaves, ceil(lg n!) height, depth of a leaf, why Ω(n lg n) (tree drawn)
//   gen-310-bsearch-path  tap the midpoints the worksheet's search compares (found and not found)
//   gen-310-qs-calltree   fill blanks in QUICKSORT's call tree
//   gen-310-ms-calltree   fill blanks in MergeSort's split tree or its merged results
(function (FC) {
  'use strict';
  const G = FC.gen;
  if (!G) throw new Error('load js/generators.js before js/gen-csc310-trees.js');
  const { int, pick, shuffle } = G;
  const DECK = 'csc310';
  const M = s => '$' + s + '$';
  const chance = (rng, p) => rng() < p;
  const src = file => `Generated practice (new problem each time); method from ${file} (AUCSC 310, M. Qasem)`;
  const weighted = (rng, ps) => {
    let r = rng() * ps.reduce((s, p) => s + p[1], 0);
    for (const [k, w] of ps) if ((r -= w) < 0) return k;
    return ps[ps.length - 1][0];
  };
  const distinct = (rng, k, lo, hi) => shuffle(rng, Array.from({ length: hi - lo + 1 }, (_, i) => lo + i)).slice(0, k);
  const nodes = t => { const out = []; (function w(x, p) { out.push({ t: x, path: p }); x.kids.forEach((k, i) => w(k, p + '.' + i)); })(t, '0'); return out; };
  const levels = t => 1 + Math.max(0, ...t.kids.map(levels));
  const clean = t => ({ label: t.label, kids: t.kids.map(clean) });

  // ═══════════════════════ 1. Decision trees (3 elements) ═══════════════════════
  // Each algorithm sorts items { v, i } (value, 1-based original index) and asks le(x, y)
  // for every comparison between two ELEMENTS; le logs "x.i:y.i" and returns x.v <= y.v.
  const ALGS = {
    insertion: {
      name: 'insertion sort', file: 'Lecture 2 (InsertionSort)',
      sort(A, le) {          // for j = 2 to n; while i > 0 and A[i] > key: shift
        for (let j = 1; j < A.length; j++) {
          const key = A[j]; let i = j - 1;
          while (i >= 0 && !le(A[i], key)) { A[i + 1] = A[i]; i--; }
          A[i + 1] = key;
        }
        return A;
      },
    },
    merge: {
      name: 'merge sort', file: 'Lecture 4 (MergeSort)',
      sort(A, le) {
        const ms = (p, r) => {   // 1-based, mid = floor((p + r) / 2)
          if (p >= r) return;
          const q = Math.floor((p + r) / 2);
          ms(p, q); ms(q + 1, r);
          const L = A.slice(p - 1, q), R = A.slice(q, r);
          let i = 0, j = 0;
          for (let k = p - 1; k < r; k++) {
            if (j >= R.length || (i < L.length && le(L[i], R[j]))) A[k] = L[i++]; else A[k] = R[j++];
          }
        };
        ms(1, A.length);
        return A;
      },
    },
    quick: {
      name: 'quicksort', file: 'Lecure 7 (QUICKSORT, PARTITION)',
      sort(A, le) {
        const qs = (s, e) => {   // 1-based, pivot = A[e]
          if (s >= e) return;
          const pivot = A[e - 1]; let sc = s - 1;
          for (let j = s; j <= e - 1; j++) if (le(A[j - 1], pivot)) { sc++; [A[sc - 1], A[j - 1]] = [A[j - 1], A[sc - 1]]; }
          [A[sc], A[e - 1]] = [A[e - 1], A[sc]];
          qs(s, sc); qs(sc + 2, e);
        };
        qs(1, A.length);
        return A;
      },
    },
  };
  const leafLabel = order => '⟨' + order.join(',') + '⟩';
  // One run on values vals (a_1..a_n): the comparisons made (label, le outcome) and the leaf.
  function runLogged(alg, vals) {
    const log = [];
    const le = (x, y) => { const r = x.v <= y.v; log.push({ label: `${x.i}:${y.i}`, le: r, x: x.v, y: y.v }); return r; };
    const out = ALGS[alg].sort(vals.map((v, k) => ({ v, i: k + 1 })), le);
    return { log, leaf: leafLabel(out.map(e => e.i)) };
  }
  const PERMS3 = [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]];
  // The decision tree = the trie of the runs on all 3! orders. Node ids are tree paths.
  const dtreeCache = {};
  function dtree(alg) {
    if (dtreeCache[alg]) return dtreeCache[alg];
    let root = null;
    for (const p of PERMS3) {
      const { log, leaf } = runLogged(alg, p);
      let slot = { get: () => root, set: v => { root = v; } };
      for (const c of log) {
        let n = slot.get();
        if (!n) { n = { label: c.label, kids: [null, null] }; slot.set(n); }
        if (n.label !== c.label) throw new Error(`${alg}: inconsistent tree at ${n.label}/${c.label}`);
        const k = c.le ? 0 : 1, parent = n;
        slot = { get: () => parent.kids[k], set: v => { parent.kids[k] = v; } };
      }
      if (slot.get()) throw new Error(`${alg}: two orders reach one leaf`);
      slot.set({ label: leaf, kids: [] });
    }
    const fix = (t, path) => {
      if (t.kids.length && t.kids.some(k => !k)) throw new Error(`${alg}: node ${t.label} lacks a child`);
      return { label: t.label, id: path, kids: t.kids.map((k, i) => fix(k, path + '.' + i)) };
    };
    return (dtreeCache[alg] = fix(root, '0'));
  }
  const ALL_LEAVES = PERMS3.map(leafLabel);
  const PALETTE = ['1:2', '1:3', '2:3', '2:1'].concat(ALL_LEAVES);
  const RULE = `Node i:j: left if ${M('a_i \\le a_j')}, right if ${M('a_i > a_j')}. Leaf ⟨3,1,2⟩: ${M('a_3 \\le a_1 \\le a_2')}.`;
  const ALG_NAMES = { insertion: 'INSERTION SORT', merge: 'MERGE SORT (mid = ⌊(left+right)/2⌋)', quick: 'QUICKSORT (pivot = last element)' };
  const pickAlg = rng => weighted(rng, [['insertion', 1.4], ['merge', 1], ['quick', 1]]);
  const inputVals = rng => {
    const v = distinct(rng, 3, 1, 19);
    if (chance(rng, 0.15)) { const i = int(rng, 0, 2), j = (i + int(rng, 1, 2)) % 3; v[j] = v[i]; } // a tie: ≤ goes left
    return v;
  };
  const inputTex = v => M(`a_1 = ${v[0]},\\ a_2 = ${v[1]},\\ a_3 = ${v[2]}`);
  // "1:3: 6 ≤ 9 left" steps for one run.
  const stepsOf = log => log.map(c => `${c.label}: ${M(c.le ? `${c.x} \\le ${c.y}` : `${c.x} > ${c.y}`)} ${c.le ? 'left' : 'right'}`).join('; ');

  G.register({
    id: 'gen-310-dtree-build', deck: DECK, lecture: 'lowerbound', cat: 'Sorting', sub: 'Decision trees',
    title: 'Build a sorting algorithm’s decision tree (3 elements)',
    make(rng) {
      const alg = pickAlg(rng), part = weighted(rng, [['full', 1], ['left', 1], ['right', 1]]);
      const full = dtree(alg), sub = part === 'full' ? full : full.kids[part === 'left' ? 0 : 1];
      const root = full.label, [i, j] = root.split(':');
      const short = ALG_NAMES[alg].replace(/ \(.*\)$/, ''), note = (ALG_NAMES[alg].match(/\((.*)\)$/) || [])[1];
      const what = (part === 'full' ? `${short}’s whole decision tree on ${M('a_1, a_2, a_3')}`
        : `the part of ${short}’s decision tree on ${M('a_1, a_2, a_3')} below root ${root}’s ${M(part === 'left' ? `a_${i} \\le a_${j}` : `a_${i} > a_${j}`)} branch`) + (note ? ` (${note})` : '');
      const prompt = `Build ${what}. ${RULE} Tap the root’s label first; add left children before right.`;
      const leaves = nodes(sub).filter(n => !n.t.kids.length).map(n => n.t.label);
      const why = `${part === 'full' ? '' : `Below ${root} ${part === 'left' ? '≤' : '>'}: `}${outline(sub)}. ${leaves.length} leaves${part === 'full' ? `, one per order (${M('3! = 6')}); height ${levels(full) - 1}` : ''}.`;
      return { type: 'tree', prompt, start: '', palette: PALETTE.slice(), answer: clean(sub), why,
        source: src(`Sorting in Linear Time p. 4 (Figure 8.1) and ${ALGS[alg].file}`), spec: { gen: 'dtree-build', kind: part, alg } };
    },
  });
  // Compact one-line outline: 1:2(2:3(⟨1,2,3⟩, 1:3(⟨1,3,2⟩, ⟨3,1,2⟩)), …)
  const outline = t => t.kids.length ? `${t.label}(${t.kids.map(outline).join(', ')})` : t.label;

  G.register({
    id: 'gen-310-dtree-path', deck: DECK, lecture: 'lowerbound', cat: 'Sorting', sub: 'Decision trees',
    title: 'Follow an input down a decision tree',
    make(rng) {
      const alg = pickAlg(rng), v = inputVals(rng), tree = dtree(alg);
      const { log, leaf } = runLogged(alg, v);
      const ids = []; let t = tree;
      for (const c of log) { ids.push(t.id); t = t.kids[c.le ? 0 : 1]; }
      ids.push(t.id);
      const prompt = `${ALG_NAMES[alg]} runs on ${inputTex(v)}. Its decision tree is drawn (left = ${M('a_i \\le a_j')}, right = ${M('a_i > a_j')}). Tap the comparisons it makes, in order, then the leaf it reaches.`;
      const order = leaf.slice(1, -1).split(',').map(Number);
      const why = `${stepsOf(log)}. Leaf ${leaf}: ${M(order.map(k => v[k - 1]).join(' \\le '))}. ${log.length} comparisons.`;
      return { type: 'path', prompt, tree, answer: ids, why,
        source: src(`Sorting in Linear Time p. 4 (Figure 8.1) and ${ALGS[alg].file}`), spec: { gen: 'dtree-path', kind: alg, alg, v, tie: new Set(v).size < 3 } };
    },
  });

  const fact = n => { let f = 1; for (let k = 2; k <= n; k++) f *= k; return f; };
  const ceilLg = x => { let h = 0; while (2 ** h < x) h++; return h; };
  G.register({
    id: 'gen-310-dtree-facts', deck: DECK, lecture: 'lowerbound', cat: 'Sorting', sub: 'Decision trees',
    title: 'Decision trees: leaves, height and the Ω(n lg n) bound',
    make(rng) {
      const kind = weighted(rng, [['leaves', 1], ['minh', 1.2], ['depth', 1.2], ['fewest', 0.8], ['h2', 0.6], ['why', 0.7]]);
      const alg = pickAlg(rng), tree = clean(dtree(alg));
      const source = src('Sorting Lower Bound handout and Sorting in Linear Time p. 4');
      const base = { tree, source, spec: { gen: 'dtree-facts', kind, alg } };
      const drawn = `The drawn tree is ${ALGS[alg].name}’s decision tree on 3 elements.`;
      if (kind === 'leaves' || kind === 'minh') {
        const n = int(rng, 3, 8), f = fact(n), h = ceilLg(f);
        base.spec.n = n;
        if (kind === 'leaves') return { ...base, type: 'typed', prompt: `${drawn} A correct comparison sort on ${M('n = ' + n)} distinct elements: at least how many leaves must its decision tree have?`,
          answer: String(f), accept: f >= 1000 ? [f.toLocaleString('en-US')] : undefined,
          why: `One leaf per possible input order: ${M(`${n}! = ${f}`)}. (The drawn tree, ${M('n = 3')}, has ${M('3! = 6')}.)` };
        return { ...base, type: 'typed', prompt: `${drawn} By ${M('h \\ge \\lg(n!)')}, at least how many comparisons must ANY comparison sort make in the worst case on ${M('n = ' + n)} elements?`,
          answer: String(h),
          why: `${M(`${n}! = ${f}`)} leaves are needed and ${M(`2^{${h - 1}} = ${2 ** (h - 1)} < ${f} \\le 2^{${h}} = ${2 ** h}`)}, so the height is at least ${h}.${n === 3 ? ` The drawn tree has height ${levels(tree) - 1}.` : ''}` };
      }
      if (kind === 'depth') {
        const v = inputVals(rng), { log, leaf } = runLogged(alg, v);
        base.spec.v = v;
        return { ...base, type: 'typed', prompt: `${drawn} How many comparisons does it make on ${inputTex(v)}? (Follow the input down the tree: left = ${M('a_i \\le a_j')}, right = ${M('a_i > a_j')}.)`,
          answer: String(log.length), why: `${stepsOf(log)}: leaf ${leaf} at depth ${log.length}.` };
      }
      if (kind === 'fewest') {
        const depths = nodes(tree).filter(n => !n.t.kids.length).map(n => n.path.split('.').length - 1);
        const lo = Math.min(...depths), hi = Math.max(...depths);
        return { ...base, type: 'typed', prompt: `${drawn} What is the FEWEST comparisons it makes on any input of 3 elements?`,
          answer: String(lo), why: `The shallowest leaf is at depth ${lo}${lo === hi ? ': every leaf is at the same depth, so every input costs ' + lo : `; the deepest is at ${hi} (its worst case)`}. The bound ${M('\\lceil \\lg 3! \\rceil = 3')} is about the worst case only.` };
      }
      if (kind === 'h2') return { ...base, type: 'mc', prompt: `${drawn} Could SOME comparison sort always sort 3 elements with at most 2 comparisons?`,
        answer: `No: a height-2 tree has at most ${M('2^2 = 4')} leaves, but ${M('3! = 6')} are needed`,
        options: [`Yes: the drawn tree already reaches some leaves after 2 comparisons`, `Yes: with 3 elements there are only 3 pairs to compare`, `No: every comparison sort needs ${M('n^2')} comparisons`],
        why: `${M('L \\le 2^h')} and ${M('L \\ge n!')}, so ${M('h \\ge \\lg 6 \\approx 2.58')}: at least 3 in the worst case. Short paths for some inputs are allowed.` };
      const opts = [`Each comparison removes at most one candidate order, so all ${M('n!')} must be tried`,
        `Every comparison sort must recursively sort both halves of the input`,
        `Every one of the ${M('n(n-1)/2')} pairs must be compared at least once`];
      return { ...base, type: 'mc', prompt: `${drawn} Why must EVERY comparison sort make ${M('\\Omega(n \\lg n)')} comparisons in the worst case?`,
        answer: `It needs ${M('\\ge n!')} leaves and a height-${M('h')} tree has ${M('\\le 2^h')}, so ${M('h \\ge \\lg(n!) = \\Omega(n \\lg n)')}`,
        options: opts,
        why: `${M('2^h \\ge L \\ge n!')} gives ${M('h \\ge \\lg(n!)')}, and ${M('\\lg(n!) \\ge (n/2)(\\lg n - 1)')} by keeping the last ${M('n/2')} factors of ${M('n!')}. The height is the worst-case comparison count.` };
    },
  });

  // ═══════════════════════ 2. Binary search: the tree of midpoints ═══════════════════════
  // Node = the mid the loop computes for a reachable (low, high); left child = after
  // high = mid − 1, right child = after low = mid + 1. id = mid.
  function midTree(lo, hi, label, note) {
    if (lo > hi) return null;
    const m = Math.floor((lo + hi) / 2);
    const L = midTree(lo, m - 1, label, note), R = midTree(m + 1, hi, label, note);
    if (L && !R) L.side = 'L'; if (R && !L) R.side = 'R'; // drawn to its side
    const t = { label: label(m), id: m, kids: [L, R].filter(Boolean) };
    if (note) t.note = note(m);
    return t;
  }
  function searchMids(a, key) {           // the worksheet's loop, a 1-based (a[0] unused)
    let low = 1, high = a.length - 1; const mids = [], rows = [];
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      mids.push(mid);
      if (a[mid] === key) { rows.push(`(${low},${high})→${mid} found`); return { mids, rows, ret: mid }; }
      if (a[mid] < key) { rows.push(`(${low},${high})→${mid} <`); low = mid + 1; } else { rows.push(`(${low},${high})→${mid} >`); high = mid - 1; }
    }
    rows.push(`(${low},${high}) empty: −1`);
    return { mids, rows, ret: -1 };
  }
  const LOOP = `low = 1, high = n, mid = ${M('\\lfloor(\\text{low}+\\text{high})/2\\rfloor')}`;
  G.register({
    id: 'gen-310-bsearch-path', deck: DECK, lecture: 'ws-binsearch', cat: 'Divide & conquer', sub: 'Binary search',
    title: 'Binary search as a path in the tree of midpoints',
    make(rng) {
      const kind = weighted(rng, [['values', 1.6], ['between', 1]]);
      const n = int(rng, 7, 20);
      const a = [null]; let v = int(rng, 1, 9);
      for (let i = 1; i <= n; i++) { a.push(v); v += int(rng, 2, 6); }
      const found = chance(rng, 0.5);
      let key, keyText;
      if (found) { const i = int(rng, 1, n); key = a[i]; keyText = kind === 'values' ? `key = ${key}` : `key = a[${i}]`; }
      else {
        const gap = int(rng, 0, n);       // key below a[1] (0), above a[n] (n), or between a[gap] and a[gap+1]
        key = gap === 0 ? a[1] - 1 : gap === n ? a[n] + 1 : a[gap] + 1;
        keyText = kind === 'values' ? `key = ${key} (not in a)`
          : gap === 0 ? `a key smaller than a[1]` : gap === n ? `a key larger than a[${n}]` : `a key with a[${gap}] < key < a[${gap + 1}]`;
      }
      const r = searchMids(a, key);
      const tree = kind === 'values' ? midTree(1, n, m => String(a[m]), m => String(m)) : midTree(1, n, m => String(m));
      const shown = kind === 'values' ? `Each node is a[mid], with mid in the corner` : `Each node is a mid index`;
      const prompt = `The worksheet’s BinarySearch (${LOOP}) on a sorted a[1..${n}]. ${shown}; left child = next mid after high = mid − 1, right = after low = mid + 1. Search for ${keyText}: tap every mid it compares, in order.`;
      const why = `(low,high)→mid: ${r.rows.join('; ')}. ${r.mids.length} comparison${r.mids.length > 1 ? 's' : ''}; ${r.ret > 0 ? `returns ${r.ret}` : 'not found, returns −1'}.`;
      return { type: 'path', prompt, tree, answer: r.mids, why, source: src('worksheet1-binarySearchAnalysis.pdf'),
        spec: { gen: 'bsearch-path', kind, a: a.slice(1), key, found } };
    },
  });

  // ═══════════════════════ 3. Sorting call trees ═══════════════════════
  const braces = xs => '{' + xs.join(',') + '}';
  const plain = xs => xs.join(',');
  // QUICKSORT(A, start, end) exactly as in Lecure 7 (1-based). Returns the call tree and a
  // log of partitions ("{5,2,8} p=8 → {5,2}|{}").
  function quickCalls(A0) {
    const A = [null].concat(A0), log = [];
    function qs(s, e) {
      const t = { label: braces(A.slice(s, e + 1)), kids: [] };
      if (s < e) {
        const pivot = A[e]; let sc = s - 1;
        for (let j = s; j <= e - 1; j++) if (A[j] <= pivot) { sc++; [A[sc], A[j]] = [A[j], A[sc]]; }
        [A[sc + 1], A[e]] = [A[e], A[sc + 1]];
        const q = sc + 1;
        log.push(`pivot ${pivot}: ${braces(A.slice(s, q))} ${braces(A.slice(q + 1, e + 1))}`);
        t.kids = [qs(s, q - 1), qs(q + 1, e)];
      }
      return t;
    }
    return { tree: qs(1, A0.length), log };
  }
  // Blank k non-root nodes: at least one internal node, at most one "{}".
  function blankSome(rng, tree, k, isEmpty) {
    const cand = shuffle(rng, nodes(tree).filter(n => n.path !== '0'));
    const pickd = [];
    const internal = cand.find(n => n.t.kids.length);
    if (internal) pickd.push(internal);
    for (const n of cand) {
      if (pickd.length >= k) break;
      if (pickd.includes(n)) continue;
      if (isEmpty(n.t) && pickd.some(p => isEmpty(p.t))) continue;
      pickd.push(n);
    }
    for (const n of pickd) { n.t.answer = n.t.label; n.t.label = ''; n.t.blank = true; }
    return pickd.length;
  }
  const SLIDE_QS = [[10, 80, 35, 85, 40, 55, 70], [2, 8, 7, 1, 3, 5, 6, 4]];
  const SLIDE_MS = [[8, 7, 5, 1, 6, 2, 4, 3], [10, 5, 7, 6, 1, 4, 8, 3, 2]];
  const same = (x, y) => x.length === y.length && x.every((v, i) => v === y[i]);
  G.register({
    id: 'gen-310-qs-calltree', deck: DECK, lecture: '7', cat: 'Sorting', sub: 'Quicksort algorithm', assignment: ['a3'],
    title: 'Fill in QUICKSORT’s call tree',
    make(rng) {
      let A, r;
      for (;;) {       // shallow trees only (≤ 5 levels): readable, and never a sorted run
        A = distinct(rng, int(rng, 6, 8), 1, 9);
        r = quickCalls(A);
        if (levels(r.tree) <= 5 && !SLIDE_QS.some(s => same(s, A))) break;
      }
      const k = int(rng, 2, A.length >= 8 ? 4 : 3);
      const blanks = blankSome(rng, r.tree, k, t => t.answer === '{}' || t.label === '{}');
      const prompt = `QUICKSORT(A, 1, ${A.length}) with the notes’ PARTITION (pivot = last element) on A = ${braces(A)}. Each node is a call’s subarray as the call starts; its children are the before-pivot and after-pivot parts (empty = {}). Fill the ${blanks} dashed nodes, typed like {3,1,2}.`;
      return { type: 'fill', prompt, tree: r.tree, why: r.log.join('; ') + '.', source: src('Lecure 7 (1).pdf (QUICKSORT, PARTITION, Example)'),
        spec: { gen: 'qs-calltree', kind: blanks > 3 ? 'many' : 'few', A } };
    },
  });

  // MergeSort(A, left, right), Lecture 4: returns the split tree (subarray at call time) and
  // the merged tree (subarray after the call returns), plus the merges in order.
  function mergeCalls(A0) {
    const merges = [];
    function ms(xs) {
      if (xs.length <= 1) return { split: { label: plain(xs), kids: [] }, merged: { label: plain(xs), kids: [] }, out: xs };
      const q = Math.floor((1 + xs.length) / 2);       // mid - left + 1 for mid = floor((left+right)/2)
      const L = ms(xs.slice(0, q)), R = ms(xs.slice(q));
      const out = []; let i = 0, j = 0;
      while (i < L.out.length || j < R.out.length) out.push(j >= R.out.length || (i < L.out.length && L.out[i] <= R.out[j]) ? L.out[i++] : R.out[j++]);
      merges.push(`${plain(L.out)} + ${plain(R.out)} → ${plain(out)}`);
      return { split: { label: plain(xs), kids: [L.split, R.split] }, merged: { label: plain(out), kids: [L.merged, R.merged] }, out };
    }
    const r = ms(A0);
    return { split: r.split, merged: r.merged, merges };
  }
  G.register({
    id: 'gen-310-ms-calltree', deck: DECK, lecture: '4', cat: 'Sorting', sub: 'Merge sort', assignment: ['a3'],
    title: 'Fill in MergeSort’s split tree or merge results',
    make(rng) {
      const kind = weighted(rng, [['split', 1], ['merged', 1.4]]);
      let A;
      do A = distinct(rng, int(rng, 6, 8), 1, 40); while (SLIDE_MS.some(s => same(s, A)));
      const r = mergeCalls(A), tree = r[kind];
      // Blanks: internal (non-root) nodes are the work; for the split tree a leaf or two too.
      const inner = shuffle(rng, nodes(tree).filter(x => x.path !== '0' && x.t.kids.length));
      const leaves = shuffle(rng, nodes(tree).filter(x => !x.t.kids.length));
      const pickd = kind === 'merged' ? inner.slice(0, int(rng, 2, Math.min(4, inner.length))) : inner.slice(0, int(rng, 2, 3)).concat(leaves.slice(0, int(rng, 0, 1)));
      for (const x of pickd) { x.t.answer = x.t.label; x.t.label = ''; x.t.blank = true; }
      const MID = `mid = ${M('\\lfloor(\\text{left}+\\text{right})/2\\rfloor')}`;
      const prompt = kind === 'split'
        ? `MergeSort(A, 1, ${A.length}) (${MID}) on A = ${plain(A)}. Each node is the part of A one call sorts, as the call STARTS (children: A[left..mid], A[mid+1..right]). Fill the ${pickd.length} dashed nodes, typed like 8,7,5.`
        : `MergeSort(A, 1, ${A.length}) (${MID}) on A = ${plain(A)}. Each node shows its part of A AFTER that call returns (merged, sorted); leaves are single elements. Fill the ${pickd.length} dashed nodes, typed like 5,7,8.`;
      const q = Math.floor((1 + A.length) / 2);
      const why = kind === 'split'
        ? `${M(`\\text{mid} = \\lfloor (1+${A.length})/2 \\rfloor = ${q}`)}: left ${plain(A.slice(0, q))}, right ${plain(A.slice(q))}. Each part splits the same way (left gets the extra one) down to single elements.`
        : `Merges, deepest first: ${r.merges.join('; ')}.`;
      return { type: 'fill', prompt, tree, why, source: src('Lecture 4 (1).pdf (MergeSort, Example)'), spec: { gen: 'ms-calltree', kind, A } };
    },
  });

})(globalThis.FC = globalThis.FC || {});
