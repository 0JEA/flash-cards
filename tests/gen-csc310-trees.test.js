// Tree practice for AUCSC 310 (js/gen-csc310-trees.js). Every tree and answer is re-derived
// here with SEPARATE code: insertion / merge (with ∞ sentinels, as in CLRS) / quick sort
// re-written 0-based with a comparison logger, the worksheet's binary-search loop, and
// QUICKSORT / MergeSort call recorders. Two trees are pinned to the course's own figures:
// insertion sort's decision tree (Sorting in Linear Time p. 4, CLRS Figure 8.1) and the
// call trees of Lecure 7 p. 8 and Lecture 4 p. 10.
const test = require('node:test');
const assert = require('node:assert/strict');
require('../js/generators.js');
require('../js/tree.js');
require('../js/gen-csc310-trees.js');
const katex = require('../vendor/katex/katex.min.js');
const G = globalThis.FC.gen, T = globalThis.FC.tree;

const SEEDS = Array.from({ length: 400 }, (_, i) => (Math.imul(i + 7, 2654435761) >>> 0));
const IDS = ['gen-310-dtree-build', 'gen-310-dtree-path', 'gen-310-dtree-facts', 'gen-310-bsearch-path', 'gen-310-qs-calltree', 'gen-310-ms-calltree'];
const cards = new Map(IDS.map(id => [id, SEEDS.map(s => G.instance(id, s))]));
const WHY_MAX = 350;
const norm = s => String(s).replace(/\s+/g, '');
const kidsOf = t => t.kids || [];
const walk = (t, f, path = '0', depth = 0) => { f(t, path, depth); kidsOf(t).forEach((k, i) => walk(k, f, path + '.' + i, depth + 1)); };
const all = t => { const out = []; walk(t, (x, path, depth) => out.push({ t: x, path, depth })); return out; };
const height = t => kidsOf(t).length ? 1 + Math.max(...kidsOf(t).map(height)) : 0;

// ─────────────── shared field checks ───────────────
test('tree generators are registered with deck, lecture, category', () => {
  const want = { 'gen-310-dtree-build': 'lowerbound', 'gen-310-dtree-path': 'lowerbound', 'gen-310-dtree-facts': 'lowerbound',
    'gen-310-bsearch-path': 'ws-binsearch', 'gen-310-qs-calltree': '7', 'gen-310-ms-calltree': '4' };
  require('../decks/csc310.js');
  const deck = globalThis.FC.decks.csc310;
  for (const id of IDS) {
    const g = G.all().find(x => x.id === id);
    assert.ok(g, id);
    assert.equal(g.deck, 'csc310');
    assert.equal(g.lecture, want[id]);
    assert.ok(deck.lectures.some(l => l.n === g.lecture));
    assert.ok(deck.catOrder.includes(g.cat), `${id}: cat ${g.cat}`);
  }
});

for (const id of IDS) {
  test(`${id}: valid fields, deterministic, varied, KaTeX parses, short why`, () => {
    const list = cards.get(id), prompts = new Set();
    list.forEach((c, i) => {
      assert.deepEqual(JSON.parse(JSON.stringify(G.instance(id, SEEDS[i]))), JSON.parse(JSON.stringify(c)), 'same seed, same problem');
      assert.ok(c.prompt.length > 20 && c.why.length > 10 && c.source && c.spec);
      for (const s of [c.prompt, c.why, JSON.stringify(c.answer ?? ''), JSON.stringify(c.options || []), JSON.stringify(c.tree || '')]) {
        assert.ok(!/undefined|NaN|\[object|null/.test(s), `bad interpolation: ${s}`);
        assert.ok(!/slide/i.test(s), `"slide" in ${s}`);
      }
      assert.ok(c.why.length <= WHY_MAX, `why is ${c.why.length} chars: ${c.why}`);
      const shown = [c.prompt, c.why].concat(c.type === 'mc' ? c.options.concat(c.answer) : []);
      for (const s of shown) {
        assert.equal((s.match(/(?<!\\)\$/g) || []).length % 2, 0, `unbalanced $ in: ${s}`);
        for (const m of s.matchAll(/(?<!\\)\$(.+?)(?<!\\)\$/g)) assert.doesNotThrow(() => katex.renderToString(m[1], { throwOnError: true }), `KaTeX rejects ${m[1]}`);
      }
      // Labels the student types or taps stay plain (no LaTeX).
      for (const t of [c.tree, c.type === 'tree' ? c.answer : null].filter(Boolean)) walk(t, x => {
        assert.ok(!String(x.label).includes('$') && !String(x.answer || '').includes('$'), 'LaTeX in a tree label');
        assert.ok(String(x.label).length <= 24, `label too long to draw: ${x.label}`);
      });
      if (c.type === 'typed') { assert.ok(typeof c.answer === 'string' && c.answer && !c.answer.includes('$')); if (c.accept) assert.ok(!c.accept.includes(c.answer)); }
      if (c.type === 'mc') { assert.ok(c.options.length >= 1 && c.options.length <= 3 && !c.options.includes(c.answer) && new Set(c.options).size === c.options.length); }
      if (c.type === 'path') {
        // The app records t.id for every tap and refuses a second tap on the same node: ids must be unique.
        const ids = all(c.tree).map(n => String(n.t.id));
        assert.equal(new Set(ids).size, ids.length, 'path ids unique');
        assert.ok(c.answer.length >= 1 && c.answer.every(x => ids.includes(String(x))), 'every answer id is a node');
        // An answer is a root-down chain: each tapped node is a child of the one before.
        let at = c.tree;
        assert.equal(String(at.id), String(c.answer[0]), 'starts at the root');
        for (const x of c.answer.slice(1)) { at = kidsOf(at).find(k => String(k.id) === String(x)); assert.ok(at, `answer ${c.answer} is not a root-down path`); }
      }
      if (c.type === 'fill') {
        const blanks = all(c.tree).filter(n => n.t.blank);
        assert.ok(blanks.length >= 2 && blanks.length <= 4, `${blanks.length} blanks`);
        assert.ok(!c.tree.blank, 'root is given');
        for (const b of blanks) assert.ok(typeof b.t.answer === 'string' && b.t.answer.length && b.t.label === '', 'blank has an answer and shows empty');
        assert.ok(c.prompt.includes(`Fill the ${blanks.length} dashed`), 'prompt states the blank count');
        // The app's grader: right answers pass, one wrong answer is caught at that node.
        const right = Object.fromEntries(blanks.map(b => [b.path, b.t.answer]));
        assert.equal(T.fillMistakes(c.tree, right).size, 0);
        assert.deepEqual([...T.fillMistakes(c.tree, { ...right, [blanks[0].path]: right[blanks[0].path] + ',0' })], [blanks[0].path]);
      }
      if (c.type === 'tree') {
        const ok = new Set([c.start].concat(c.palette));
        walk(c.answer, x => assert.ok(ok.has(x.label), `label ${x.label} not buildable from start/palette`));
        assert.equal(c.start, '', 'root is tapped by the student');
      }
      prompts.add(c.prompt + JSON.stringify(c.tree || '') + JSON.stringify(c.answer));
    });
    assert.ok(prompts.size >= 9, `only ${prompts.size} distinct problems`);
    assert.ok(new Set(list.map(c => c.spec.kind)).size >= 2, 'more than one kind comes up');
  });
}

// ─────────────── decision trees: independent comparison loggers ───────────────
// Each sorts [{ val, idx }] and calls cmp(x, y) => x.val <= y.val, logging "x.idx:y.idx".
function insertion0(arr, cmp) {            // 0-based; while the element left of the key is bigger, shift
  const a = arr.slice();
  for (let j = 1; j < a.length; j++) {
    const key = a[j]; let i = j - 1;
    for (; i >= 0; i--) { if (cmp(a[i], key)) break; a[i + 1] = a[i]; }
    a[i + 1] = key;
  }
  return a;
}
function merge0(arr, cmp) {                // CLRS MERGE with ∞ sentinels: comparisons with ∞ are not element comparisons
  const a = arr.slice(), INF = { val: Infinity };
  (function sort(p, r) {                   // 1-based bounds like the notes
    if (p < r) {
      const q = (p + r) >> 1;
      sort(p, q); sort(q + 1, r);
      const L = a.slice(p - 1, q).concat([INF]), R = a.slice(q, r).concat([INF]);
      let i = 0, j = 0;
      for (let k = p - 1; k < r; k++) {
        const takeLeft = L[i] === INF ? false : R[j] === INF ? true : cmp(L[i], R[j]);
        a[k] = takeLeft ? L[i++] : R[j++];
      }
    }
  })(1, a.length);
  return a;
}
function quick0(arr, cmp) {                // 0-based Lomuto, pivot = last
  const a = arr.slice();
  (function sort(lo, hi) {
    if (lo >= hi) return;
    let i = lo;
    for (let j = lo; j < hi; j++) if (cmp(a[j], a[hi])) { [a[i], a[j]] = [a[j], a[i]]; i++; }
    [a[i], a[hi]] = [a[hi], a[i]];
    sort(lo, i - 1); sort(i + 1, hi);
  })(0, a.length - 1);
  return a;
}
const SORTS = { insertion: insertion0, merge: merge0, quick: quick0 };
function logged(alg, vals) {
  const log = [];
  const out = SORTS[alg](vals.map((val, k) => ({ val, idx: k + 1 })), (x, y) => { log.push({ label: `${x.idx}:${y.idx}`, le: x.val <= y.val }); return x.val <= y.val; });
  return { log, order: out.map(e => e.idx) };
}
const PERMS = [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]];
const leafOf = order => '⟨' + order.join(',') + '⟩';
// Follow a run down a (sub)tree: the node labels it passes must be the comparisons logged.
function follow(tree, log) {
  const path = []; let t = tree;
  for (const c of log) {
    assert.equal(t.label, c.label, `tree node ${t.label} but the algorithm compares ${c.label}`);
    path.push(t); t = kidsOf(t)[c.le ? 0 : 1];
    assert.ok(t, 'tree ends before the algorithm stops comparing');
  }
  path.push(t);
  assert.equal(kidsOf(t).length, 0, `run ends at internal node ${t.label}`);
  return path;
}
// Every 3-element order runs down the tree to its own leaf; every leaf is reached.
function checkDecisionTree(alg, tree, firstLe) {
  const reached = new Set();
  for (const p of PERMS) {
    const { log, order } = logged(alg, p);
    if (firstLe != null && log[0].le !== firstLe) continue;
    const path = follow(tree, firstLe == null ? log : log.slice(1));
    const leaf = path[path.length - 1];
    assert.equal(leaf.label, leafOf(order), `${alg} on ${p}`);
    reached.add(leaf);
  }
  assert.equal(reached.size, all(tree).filter(n => !kidsOf(n.t).length).length, 'a leaf no input reaches');
}

test('insertion sort decision tree matches Figure 8.1 (Sorting in Linear Time p. 4)', () => {
  const n = (label, ...kids) => ({ label, kids });
  const fig = n('1:2', n('2:3', n('⟨1,2,3⟩'), n('1:3', n('⟨1,3,2⟩'), n('⟨3,1,2⟩'))), n('1:3', n('⟨2,1,3⟩'), n('2:3', n('⟨2,3,1⟩'), n('⟨3,2,1⟩'))));
  checkDecisionTree('insertion', fig);            // the test's logger agrees with the figure
  const c = cards.get('gen-310-dtree-build').find(x => x.spec.alg === 'insertion' && x.spec.kind === 'full');
  assert.ok(c && T.equal(c.answer, fig));
  // Her figure's shaded example: a1 = 6, a2 = 8, a3 = 5 reaches ⟨3,1,2⟩.
  assert.equal(follow(fig, logged('insertion', [6, 8, 5]).log).pop().label, '⟨3,1,2⟩');
});

test('gen-310-dtree-build: answer = the algorithm\'s real decision tree (or the asked side of it)', () => {
  const seen = new Set();
  for (const c of cards.get('gen-310-dtree-build')) {
    const { alg, kind } = c.spec;
    seen.add(alg + kind);
    checkDecisionTree(alg, c.answer, kind === 'full' ? null : kind === 'left');
    assert.equal(all(c.answer).filter(n => !kidsOf(n.t).length).length, kind === 'full' ? 6 : 3);
    assert.ok(c.prompt.toLowerCase().includes(alg === 'insertion' ? 'insertion sort' : alg === 'merge' ? 'merge sort' : 'quicksort'));
    for (const lab of c.palette) assert.ok(/^\d:\d$|^⟨\d,\d,\d⟩$/.test(lab));
    if (kind !== 'full') {   // the prompt names the root comparison and the side asked for
      const [x, y] = logged(alg, [1, 2, 3]).log[0].label.split(':');
      assert.ok(c.prompt.includes(`below root ${x}:${y}’s $a_${x} ${kind === 'left' ? '\\le' : '>'} a_${y}$ branch`), c.prompt);
    }
  }
  assert.equal(seen.size, 9, 'every algorithm × part comes up');
});

const parseInput = prompt => { const m = prompt.match(/a_1 = (\d+),\\ a_2 = (\d+),\\ a_3 = (\d+)/); return m.slice(1).map(Number); };
test('gen-310-dtree-path: the tapped path is the comparisons the algorithm makes, ending at a sorted leaf', () => {
  let ties = 0;
  for (const c of cards.get('gen-310-dtree-path')) {
    const v = parseInput(c.prompt), alg = c.spec.alg;
    checkDecisionTree(alg, c.tree);
    const { log, order } = logged(alg, v);
    const path = follow(c.tree, log);
    assert.deepEqual(c.answer.map(String), path.map(t => String(t.id)), `${alg} ${v}`);
    assert.equal(path[path.length - 1].label, leafOf(order));
    for (let k = 1; k < 3; k++) assert.ok(v[order[k - 1] - 1] <= v[order[k] - 1], 'leaf order is sorted');
    if (new Set(v).size < 3) ties++;
  }
  assert.ok(ties >= 10, `only ${ties} inputs with a tie (≤ must go left)`);
});

test('gen-310-dtree-facts: n!, ceil(lg n!), leaf depths re-derived', () => {
  const fact = n => (n <= 1 ? 1 : n * fact(n - 1));
  for (const c of cards.get('gen-310-dtree-facts')) {
    checkDecisionTree(c.spec.alg, c.tree);
    const n = +((c.prompt.match(/n = (\d+)\$/) || [])[1]);
    if (c.spec.kind === 'leaves') assert.equal(c.answer, String(fact(n)));
    else if (c.spec.kind === 'minh') { let h = 0; while (2 ** h < fact(n)) h++; assert.equal(c.answer, String(h)); assert.equal(+c.answer, Math.ceil(Math.log2(fact(n)))); }
    else if (c.spec.kind === 'depth') assert.equal(c.answer, String(logged(c.spec.alg, parseInput(c.prompt)).log.length));
    else if (c.spec.kind === 'fewest') assert.equal(c.answer, String(Math.min(...PERMS.map(p => logged(c.spec.alg, p).log.length))));
    else if (c.spec.kind === 'h2') { assert.ok(c.answer.startsWith('No') && 2 ** 2 < fact(3)); assert.equal(height(c.tree), 3); }
    else { assert.equal(c.spec.kind, 'why'); assert.ok(/n!/.test(c.answer) && /2\^h/.test(c.answer)); }
  }
});

// ─────────────── binary search: the worksheet's loop ───────────────
function worksheetSearch(a1, key) {        // a1 is 1-based (index 0 unused), exactly the worksheet loop
  let low = 1, high = a1.length - 1; const mids = [];
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    mids.push(mid);
    if (a1[mid] === key) return mids;
    if (a1[mid] < key) low = mid + 1; else high = mid - 1;
  }
  return mids;
}
// The midpoint tree built breadth-first from (low, high) ranges, with each node's range.
function rangeTree(n) {
  const root = { lo: 1, hi: n, kids: [] }, queue = [root];
  while (queue.length) {
    const t = queue.shift(); t.mid = Math.floor((t.lo + t.hi) / 2);
    if (t.lo <= t.mid - 1) { const k = { lo: t.lo, hi: t.mid - 1, kids: [] }; t.kids.push(k); queue.push(k); }
    if (t.mid + 1 <= t.hi) { const k = { lo: t.mid + 1, hi: t.hi, kids: [] }; t.kids.push(k); queue.push(k); }
  }
  return root;
}
test('gen-310-bsearch-path: tree = every reachable mid; answer = the loop\'s mids; key matches the prompt', () => {
  let missing = 0, found = 0;
  for (const c of cards.get('gen-310-bsearch-path')) {
    const a = c.spec.a, n = a.length, a1 = [null].concat(a);
    assert.ok(n >= 7 && n <= 20 && a.every((x, i) => i === 0 || x > a[i - 1]), 'sorted, n = 7..20');
    assert.ok(c.prompt.includes(`a[1..${n}]`));
    (function cmp(t, r) {
      assert.equal(t.id, r.mid);
      assert.equal(t.label, c.spec.kind === 'values' ? String(a1[r.mid]) : String(r.mid));
      if (c.spec.kind === 'values') assert.equal(t.note, String(r.mid));
      assert.equal(kidsOf(t).length, r.kids.length);
      // A lone child must be on the right side of the search: its range is above mid.
      r.kids.forEach((k, i) => cmp(kidsOf(t)[i], k));
    })(c.tree, rangeTree(n));
    // The key the prompt describes.
    let key = c.spec.key, m;
    if ((m = c.prompt.match(/key = a\[(\d+)\]/))) assert.equal(a1[+m[1]], key);
    else if ((m = c.prompt.match(/a\[(\d+)\] < key < a\[(\d+)\]/))) { assert.equal(+m[2], +m[1] + 1); assert.ok(a1[+m[1]] < key && key < a1[+m[2]]); }
    else if (/smaller than a\[1\]/.test(c.prompt)) assert.ok(key < a[0]);
    else if ((m = c.prompt.match(/larger than a\[(\d+)\]/))) { assert.equal(+m[1], n); assert.ok(key > a[n - 1]); }
    else { m = c.prompt.match(/key = (\d+)( \(not in a\))?/); assert.equal(+m[1], key); assert.equal(!!m[2], !a.includes(key)); }
    assert.deepEqual(c.answer, worksheetSearch(a1, key));
    if (a.includes(key)) { found++; assert.equal(a1[c.answer[c.answer.length - 1]], key); } else missing++;
    assert.ok(c.answer.length <= Math.floor(Math.log2(n)) + 1, 'never more than floor(lg n) + 1 probes');
  }
  assert.ok(found > 100 && missing > 100, `found ${found}, unsuccessful ${missing}`);
});

// ─────────────── call trees ───────────────
// QUICKSORT re-written 0-based, in place; a node = the subarray when the call starts.
function quickTree(A0) {
  const a = A0.slice();
  const fmt = (lo, hi) => '{' + a.slice(lo, hi + 1).join(',') + '}';
  return (function call(lo, hi) {
    const node = { label: fmt(lo, hi), kids: [] };
    if (lo < hi) {
      let i = lo;
      for (let j = lo; j < hi; j++) if (a[j] <= a[hi]) { [a[i], a[j]] = [a[j], a[i]]; i++; }
      [a[i], a[hi]] = [a[hi], a[i]];
      const left = call(lo, i - 1);            // runs (and sorts its part) before the right call starts
      node.kids = [left, call(i + 1, hi)];
    }
    return node;
  })(0, a.length - 1);
}
const sameTree = (x, y) => norm(x.label) === norm(y.label) && kidsOf(x).length === kidsOf(y).length && kidsOf(x).every((k, i) => sameTree(k, kidsOf(y)[i]));
test('QUICKSORT call recorder reproduces the Example in Lecure 7 p. 8', () => {
  const n = (label, ...kids) => ({ label, kids });
  const fig = n('{10, 80, 35, 85, 40, 55, 70}',
    n('{10, 35, 40, 55}', n('{10, 35, 40}', n('{10, 35}', n('{10}'), n('{}')), n('{}')), n('{}')),
    n('{85, 80}', n('{}'), n('{85}')));
  assert.ok(sameTree(quickTree([10, 80, 35, 85, 40, 55, 70]), fig));
});
const parseA = (prompt, open) => prompt.match(new RegExp(`A = ${open ? '\\{' : ''}([\\d,]+)`))[1].split(',').map(Number);
test('gen-310-qs-calltree: the filled tree is QUICKSORT\'s call tree; blanks are fair', () => {
  let empties = 0;
  for (const c of cards.get('gen-310-qs-calltree')) {
    const A = parseA(c.prompt, true);
    assert.ok(A.length >= 6 && A.length <= 8 && new Set(A).size === A.length, 'six to eight distinct values');
    assert.ok(!['10,80,35,85,40,55,70', '2,8,7,1,3,5,6,4'].includes(A.join(',')), 'not the notes\' own arrays');
    assert.ok(c.prompt.includes(`QUICKSORT(A, 1, ${A.length})`));
    const want = quickTree(A);
    assert.ok(sameTree(T.filledTree(c.tree), want), `call tree differs for ${A}`);
    assert.ok(height(want) <= 4, 'at most 5 levels');
    const blanks = all(c.tree).filter(n => n.t.blank);
    assert.ok(blanks.some(b => kidsOf(b.t).length), 'at least one blank is a call that partitions');
    assert.ok(blanks.filter(b => b.t.answer === '{}').length <= 1, 'at most one empty-part blank');
    empties += blanks.filter(b => b.t.answer === '{}').length;
    // Sorted input is Assignment 3's degenerate case: never generated.
    assert.ok(A.some((x, i) => i && x < A[i - 1]));
  }
  assert.ok(empties > 20, 'empty parts are sometimes blank');
});

// MergeSort re-written with explicit index ranges; split = part at call time, merged = after.
function mergeTrees(A0) {
  const a = A0.slice();
  return (function call(left, right) {        // 1-based like the notes
    const before = a.slice(left - 1, right).join(',');
    if (left >= right) return { split: { label: before, kids: [] }, merged: { label: before, kids: [] } };
    const mid = (left + right) >> 1;
    const L = call(left, mid), R = call(mid + 1, right);
    a.splice(left - 1, right - left + 1, ...a.slice(left - 1, right).sort((x, y) => x - y));
    return { split: { label: before, kids: [L.split, R.split] }, merged: { label: a.slice(left - 1, right).join(','), kids: [L.merged, R.merged] } };
  })(1, a.length);
}
test('MergeSort recorder reproduces the Example in Lecture 4 p. 10', () => {
  const { split, merged } = mergeTrees([8, 7, 5, 1, 6, 2, 4, 3]);
  const level = (t, d) => d === 0 ? [t.label] : kidsOf(t).flatMap(k => level(k, d - 1));
  assert.deepEqual(level(split, 1), ['8,7,5,1', '6,2,4,3']);
  assert.deepEqual(level(split, 2), ['8,7', '5,1', '6,2', '4,3']);
  assert.deepEqual(level(merged, 2), ['7,8', '1,5', '2,6', '3,4']);
  assert.deepEqual(level(merged, 1), ['1,5,7,8', '2,3,4,6']);
  assert.equal(merged.label, '1,2,3,4,5,6,7,8');
  // Lecture 4 p. 12 (9 elements): the left half gets the extra element.
  assert.deepEqual(level(mergeTrees([10, 5, 7, 6, 1, 4, 8, 3, 2]).split, 1), ['10,5,7,6,1', '4,8,3,2']);
});
test('gen-310-ms-calltree: the filled tree is MergeSort\'s split tree / merge results', () => {
  const kinds = new Set();
  for (const c of cards.get('gen-310-ms-calltree')) {
    const A = parseA(c.prompt, false);
    assert.ok(A.length >= 6 && A.length <= 8 && new Set(A).size === A.length);
    const want = mergeTrees(A)[c.spec.kind];
    kinds.add(c.spec.kind);
    assert.ok(sameTree(T.filledTree(c.tree), want), `${c.spec.kind} tree differs for ${A}`);
    assert.ok(c.prompt.includes(c.spec.kind === 'split' ? 'STARTS' : 'AFTER'), 'prompt says which tree');
    for (const b of all(c.tree).filter(n => n.t.blank)) if (c.spec.kind === 'merged') assert.ok(kidsOf(b.t).length, 'merged blanks are merges, not leaves');
  }
  assert.equal(kinds.size, 2);
});

// ─────────────── trees drawn under deck cards ───────────────
test('deck cards: decision-tree drawings are insertion sort\'s real tree; dry-run drawings are the n = 10 midpoint tree', () => {
  require('../decks/csc310-a.js'); require('../decks/csc310-b.js');
  const deckCards = globalThis.FC.csc310Cards;
  const dt = deckCards.filter(c => c.lecture === 'lowerbound' && c.tree);
  const bs = deckCards.filter(c => c.lecture === 'ws-binsearch' && c.tree);
  assert.ok(dt.length >= 3 && bs.length >= 1, `${dt.length} decision-tree and ${bs.length} binary-search cards draw a tree`);
  for (const c of dt) checkDecisionTree('insertion', c.tree);
  const a1 = [null, 3, 8, 15, 22, 27, 31, 39, 44, 52, 60];   // the worksheet's array
  for (const c of bs) {
    (function cmp(t, r) { assert.equal(t.label, String(r.mid)); assert.equal(kidsOf(t).length, r.kids.length); r.kids.forEach((k, i) => cmp(kidsOf(t)[i], k)); })(c.tree, rangeTree(10));
    assert.ok(!c.code, `${c.id}: code + tree do not fit the study screen together`);
    if (!c.prompt.includes('[3, 8, 15, 22, 27, 31, 39, 44, 52, 60]')) continue;
    const key = +c.prompt.match(/key = (\d+)/)[1];
    let t = c.tree;   // the search's mids form a root-down path in the drawing
    for (const m of worksheetSearch(a1, key).slice(1)) { t = kidsOf(t).find(k => k.label === String(m)); assert.ok(t, `${c.id}: mid ${m} not below the previous one`); }
  }
});
