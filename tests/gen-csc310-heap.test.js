// Heap practice answered on a drawn heap (js/gen-csc310-heap.js). Every card is re-solved here
// with SEPARATE code: her pseudocode from Heap-HeapSort-Priority Queue.pdf written literally
// (recursive Max-Heapify on an object with heap_size, a for-loop BuildHeap, HEAP-INCREASE-KEY's
// while loop), recording each Swap call. Each card's swaps are replayed from `heap` to `answer`.
const test = require('node:test');
const assert = require('node:assert/strict');
require('../js/generators.js');
require('../js/grade.js');
require('../js/gen-csc310-heap.js');
require('../js/tree.js');
const katex = require('../vendor/katex/katex.min.js');
const G = globalThis.FC.gen, grade = globalThis.FC.grade;

const SEEDS = Array.from({ length: 400 }, (_, i) => (Math.imul(i + 7, 2654435761) >>> 0));
const IDS = ['gen-310-heapify-swaps', 'gen-310-buildheap-swaps', 'gen-310-insert-swaps', 'gen-310-extract-swaps', 'gen-310-heap-fill', 'gen-310-heap-check'];
const PQ = new Set(['gen-310-insert-swaps', 'gen-310-extract-swaps']);
const SUBS = new Set(['Max-Heapify', 'Build-heap', 'Heapsort', 'Priority queue ops', 'Heap structure']);
const cards = new Map(IDS.map(id => [id, SEEDS.map(s => G.instance(id, s))]));
const WHY_MAX = 350;

// ── Her pseudocode, literally (1-based: A[0] unused) ──
const Left = i => 2 * i, Right = i => 2 * i + 1, Parent = i => (i - (i % 2)) / 2;
function mkHeap(values, size = values.length) { return { A: [undefined, ...values], heap_size: size, log: [] }; }
function Swap(h, i, j) { const t = h.A[i]; h.A[i] = h.A[j]; h.A[j] = t; h.log.push([i, j]); }
function MaxHeapify(h, i) {
  const l = Left(i), r = Right(i);
  let largest;
  if (l <= h.heap_size && h.A[l] > h.A[i]) largest = l; else largest = i;
  if (r <= h.heap_size && h.A[r] > h.A[largest]) largest = r;
  if (largest !== i) { Swap(h, i, largest); MaxHeapify(h, largest); }
}
function BuildHeap(h) { for (let i = Parent(h.heap_size); i >= 1; i--) MaxHeapify(h, i); }
function HeapIncreaseKey(h, i, key) {
  assert.ok(!(key < h.A[i]), 'new key is smaller than current key');
  h.A[i] = key;
  while (i > 1 && h.A[Parent(i)] < h.A[i]) { Swap(h, i, Parent(i)); i = Parent(i); }
}
const vals = h => h.A.slice(1, h.heap_size + 1);
// Max-heap check written differently: every node vs. its children.
function isMaxHeap(arr, root = 1) {
  const n = arr.length, at = i => arr[i - 1];
  const sub = [root]; for (let k = 0; k < sub.length; k++) for (const c of [2 * sub[k], 2 * sub[k] + 1]) if (c <= n) sub.push(c);
  return sub.every(i => [2 * i, 2 * i + 1].every(c => c > n || at(c) <= at(i)));
}
const replay = (heap, swaps) => { const a = heap.slice(); for (const [i, j] of swaps) [a[i - 1], a[j - 1]] = [a[j - 1], a[i - 1]]; return a; };
const samePairs = (got, want) => got.length === want.length && got.every((p, k) => (p[0] === want[k][0] && p[1] === want[k][1]) || (p[0] === want[k][1] && p[1] === want[k][0]));

// ─────────────── shared field checks ───────────────
test('heap generators: registered with deck, lecture, cat, sub and the a-pq tag on PQ operations only', () => {
  for (const id of IDS) {
    const g = G.all().find(x => x.id === id);
    assert.ok(g, id);
    assert.equal(g.deck, 'csc310'); assert.equal(g.lecture, 'heap'); assert.equal(g.cat, 'Heaps & priority queues');
    assert.ok(SUBS.has(g.sub), `${id}: sub ${g.sub}`);
    assert.deepEqual(g.assignment, PQ.has(id) ? ['a-pq'] : undefined, id);
  }
});

for (const id of IDS) {
  test(`${id}: deterministic, varied, valid fields, KaTeX parses, why ≤ ${WHY_MAX}`, () => {
    const list = cards.get(id), prompts = new Set();
    list.forEach((c, k) => {
      assert.deepEqual(G.instance(id, SEEDS[k]), c, 'same seed must give the same problem');
      prompts.add(c.prompt + JSON.stringify(c.heap));
      assert.ok(typeof c.prompt === 'string' && c.prompt.length > 10);
      assert.ok(typeof c.why === 'string' && c.why.length > 10 && c.why.length <= WHY_MAX, `why ${c.why.length}: ${c.why}`);
      assert.ok(c.source && c.spec);
      for (const s of [c.prompt, c.why, JSON.stringify(c.answer), JSON.stringify(c.options || [])]) {
        assert.ok(!/undefined|NaN|\[object|____|slide/i.test(s), `bad text: ${s}`);
        // Never the PQ assignment's own scenario (task scheduler, Task objects, priorities).
        assert.ok(!/task|schedul|priority|peek|java/i.test(s), `assignment scenario on a card: ${s}`);
      }
      if (c.heap) {
        assert.ok(Array.isArray(c.heap) && c.heap.length >= 4 && c.heap.length <= 12, 'drawn heap fits (≤ 12 nodes)');
        assert.equal(new Set(c.heap).size, c.heap.length, 'distinct keys: no tie decides a swap');
        assert.ok(c.heap.every(v => Number.isInteger(v) && v >= 1 && v <= 99));
      }
      if (c.type === 'swaps') {
        assert.ok(c.swaps.length >= 1, 'at least one swap');
        assert.deepEqual(replay(c.heap, c.swaps), c.answer, 'swaps replay from heap to answer');
      } else if (c.type === 'fill') {
        assert.ok(c.blanks.length >= 3 && c.blanks.length <= 6, `blanks ${c.blanks}`);
        assert.ok(c.blanks.length <= c.heap.length - 2, 'some nodes stay shown');
        assert.equal(new Set(c.blanks).size, c.blanks.length);
        assert.ok(c.blanks.every(i => i >= 1 && i <= c.heap.length));
      } else if (c.type === 'mc') {
        assert.ok(c.options.length >= 1 && c.options.length <= 3 && !c.options.includes(c.answer) && new Set(c.options).size === c.options.length);
      } else if (c.type === 'typed') {
        assert.ok(grade.typed(c.answer, c));
        for (const a of c.accept || []) assert.notEqual(a, c.answer);
      } else assert.fail(`type ${c.type}`);
      const shown = [c.prompt, c.why].concat(c.type === 'mc' ? c.options.concat(c.answer) : []);
      for (const s of shown) {
        assert.equal((s.match(/(?<!\\)\$/g) || []).length % 2, 0, `unbalanced $ in: ${s}`);
        for (const m of s.matchAll(/(?<!\\)\$(.+?)(?<!\\)\$/g)) assert.doesNotThrow(() => katex.renderToString(m[1], { throwOnError: true }), m[1]);
      }
      if (c.type === 'typed') for (const s of [c.answer].concat(c.accept || [])) assert.ok(!s.includes('$'));
    });
    assert.ok(prompts.size >= list.length * 0.9, `${id}: only ${prompts.size} distinct problems`);
  });
}

// ─────────────── re-solve each card ───────────────
test('gen-310-heapify-swaps: precondition holds and the swaps are MAX-HEAPIFY(A, i)', () => {
  const counts = {};
  for (const c of cards.get('gen-310-heapify-swaps')) {
    const i = Number(c.prompt.match(/MAX-HEAPIFY\(A, (\d+)\)/)[1]);
    assert.equal(i, c.spec.i);
    // Precondition: both subtrees of i are max-heaps; A[i] is smaller than a child.
    for (const ch of [Left(i), Right(i)]) if (ch <= c.heap.length) assert.ok(isMaxHeap(c.heap, ch), `subtree ${ch} is not a heap`);
    assert.ok([Left(i), Right(i)].some(ch => ch <= c.heap.length && c.heap[ch - 1] > c.heap[i - 1]), 'node i must violate');
    const h = mkHeap(c.heap); MaxHeapify(h, i);
    assert.ok(samePairs(c.swaps, h.log), `swaps ${JSON.stringify(c.swaps)} ≠ ${JSON.stringify(h.log)}`);
    assert.deepEqual(c.answer, vals(h));
    assert.ok(isMaxHeap(c.answer, i));
    counts[c.swaps.length] = (counts[c.swaps.length] || 0) + 1;
  }
  const n = cards.get('gen-310-heapify-swaps').length;
  assert.ok(((counts[2] || 0) + (counts[3] || 0)) / n >= 0.6, `mostly 2-3 swaps: ${JSON.stringify(counts)}`);
});

test('gen-310-buildheap-swaps: the full BuildHeap swap sequence, ≤ 8 swaps', () => {
  for (const c of cards.get('gen-310-buildheap-swaps')) {
    assert.ok(c.heap.length >= 6 && c.heap.length <= 10);
    assert.ok(c.prompt.includes(`n = ${c.heap.length}`));
    const h = mkHeap(c.heap); BuildHeap(h);
    assert.ok(samePairs(c.swaps, h.log), `swaps ${JSON.stringify(c.swaps)} ≠ ${JSON.stringify(h.log)}`);
    assert.ok(c.swaps.length <= 8);
    assert.deepEqual(c.answer, vals(h));
    assert.ok(isMaxHeap(c.answer));
  }
});

test('gen-310-insert-swaps: input heap valid apart from the new key; sift-up swaps', () => {
  for (const c of cards.get('gen-310-insert-swaps')) {
    const { kind, i, key } = c.spec;
    assert.equal(c.heap[i - 1], key, 'the new key is already placed');
    let before;
    if (kind === 'insert') {
      assert.equal(i, c.heap.length);
      assert.ok(c.prompt.includes(`MAX-HEAP-INSERT(A, ${key})`) && c.prompt.includes(`A[${i}]`));
      before = c.heap.slice(0, -1);
      assert.ok(isMaxHeap(before), 'heap before the insert is valid');
      const h = mkHeap(before.concat([-Infinity])); HeapIncreaseKey(h, i, key);
      assert.ok(samePairs(c.swaps, h.log)); assert.deepEqual(c.answer, vals(h));
    } else {
      const old = Number(c.prompt.match(/was (\d+)/)[1]);
      assert.ok(c.prompt.includes(`HEAP-INCREASE-KEY(A, ${i}, ${key})`));
      before = c.heap.slice(); before[i - 1] = old;
      assert.ok(isMaxHeap(before), 'heap before the increase is valid');
      assert.ok(key > old);
      const h = mkHeap(before); HeapIncreaseKey(h, i, key);
      assert.ok(samePairs(c.swaps, h.log)); assert.deepEqual(c.answer, vals(h));
    }
    assert.ok(isMaxHeap(c.answer));
  }
});

test('gen-310-extract-swaps: A[n] moved to the root of a valid heap, then MAX-HEAPIFY(A, 1)', () => {
  for (const c of cards.get('gen-310-extract-swaps')) {
    const before = c.spec.before, n = before.length;
    assert.ok(isMaxHeap(before), 'the heap before EXTRACT-MAX is valid');
    // Re-run HEAP-EXTRACT-MAX up to the move, and check the card's drawn state is exactly that.
    const h = mkHeap(before);
    const max = h.A[1]; h.A[1] = h.A[h.heap_size]; h.heap_size--;
    assert.deepEqual(c.heap, vals(h), 'drawn heap = after A[1] = A[heapSize], heapSize - 1');
    assert.ok(c.prompt.includes(`max = ${max}`) && c.prompt.includes(`A[1] = A[${n}] = ${before[n - 1]}`) && c.prompt.includes(`heapSize is now ${n - 1}`));
    MaxHeapify(h, 1);
    assert.ok(samePairs(c.swaps, h.log)); assert.deepEqual(c.answer, vals(h));
    assert.ok(isMaxHeap(c.answer));
  }
});

test('gen-310-heap-fill: the heap is the result, every changed position is blank', () => {
  for (const c of cards.get('gen-310-heap-fill')) {
    const A = c.prompt.match(/A = \[([^\]]*)\]/)[1].split(',').map(Number);
    let h, start;
    if (c.spec.kind === 'build') {
      h = mkHeap(A); BuildHeap(h); start = A;
    } else {
      assert.ok(isMaxHeap(A), 'heapsort starts from a max-heap');
      h = mkHeap(A);
      const i = h.heap_size;
      Swap(h, 1, i); h.heap_size--; MaxHeapify(h, 1);
      start = A.slice(0, -1);
      assert.ok(c.prompt.includes(`A[1..${A.length - 1}]`));
    }
    assert.deepEqual(c.heap, vals(h), 'fill heap = the result');
    assert.ok(isMaxHeap(c.heap));
    const changed = c.heap.map((v, k) => k + 1).filter(k => c.heap[k - 1] !== start[k - 1]);
    for (const k of changed) assert.ok(c.blanks.includes(k), `changed position ${k} not blank`);
    assert.ok(c.blanks.length > changed.length, 'plus at least one unchanged position');
    // The blank answers the app grades against are the result's keys.
    const T = globalThis.FC.tree.heapTree(c.heap, c.heap.length, c.blanks);
    const blanks = []; (function walk(t) { if (t.blank) blanks.push([t.id, t.answer]); (t.kids || []).forEach(walk); })(T);
    assert.deepEqual(blanks.map(b => b[0]).sort((a, b) => a - b), c.blanks);
    for (const [id, ans] of blanks) assert.equal(ans, String(vals(h)[id - 1]));
  }
});

test('gen-310-heap-check: first violation, Parent/Left/Right, height', () => {
  for (const c of cards.get('gen-310-heap-check')) {
    const k = c.spec.kind;
    if (k === 'isHeap') {
      const A = c.heap;
      const all = A.map((_, i) => i + 1).filter(i => i >= 2 && A[i - 1] > A[Math.floor(i / 2) - 1]);
      const first = all.length ? Math.min(...all) : 0;
      assert.equal(first === 0, isMaxHeap(A));
      assert.ok(first ? c.answer.endsWith(`i = ${first}`) && c.answer.startsWith('No') : c.answer.startsWith('Yes'), `${c.answer} vs ${first}`);
    } else if (k === 'nav') {
      const { i, which, ask } = c.spec, A = c.heap, n = A.length;
      assert.ok(c.prompt.includes(`key ${A[i - 1]} `));
      const i0 = i - 1, j0 = which === 'Left' ? 2 * i0 + 1 : which === 'Right' ? 2 * i0 + 2 : Math.floor((i0 - 1) / 2); // 0-based formulas
      assert.ok(j0 >= 0 && j0 < n, 'the asked node exists');
      assert.ok(grade.typed(String(ask === 'value' ? A[j0] : j0 + 1), c));
    } else if (k === 'height') {
      const n = c.heap ? c.heap.length : c.spec.n;
      if (c.heap) assert.equal(n, c.spec.n); else assert.ok(c.prompt.includes(`n = ${n}`));
      let h = 0, i = 1; while (2 * i <= n) { i *= 2; h++; } // follow left children down
      assert.ok(grade.typed(String(h), c));
    } else assert.fail(k);
  }
});

// ─────────────── fixed deck cards with a drawn heap ───────────────
test('csc310 deck: a card\'s drawn `heap` is exactly the array its prompt shows', () => {
  for (const f of ['csc310-a', 'csc310-b', 'csc310']) require('../decks/' + f + '.js');
  const withHeap = globalThis.FC.decks.csc310.cards.filter(c => c.heap);
  assert.ok(withHeap.length >= 15, `only ${withHeap.length} cards draw a heap`);
  for (const c of withHeap) {
    if (['swaps', 'fill', 'path'].includes(c.type)) continue;
    const shown = [...c.prompt.matchAll(/[{[]([\d,\s]+)[}\]]/g)].map(m => m[1].split(',').map(Number));
    assert.ok(shown.some(a => JSON.stringify(a) === JSON.stringify(c.heap)), `${c.id}: heap ${c.heap} not in prompt`);
    assert.ok(c.heap.length <= 12, `${c.id}: heap too big to draw`);
  }
});
