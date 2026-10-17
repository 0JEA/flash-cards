// Heap practice for AUCSC 310 (M. Qasem), answered ON a drawn heap (js/tree.js card types
// `swaps` and `fill`; any other type with `heap` gets the heap drawn under its question).
// Contract: js/generators.js. Tests: tests/gen-csc310-heap.test.js re-runs her pseudocode with
// separate code and records the swap sequence.
//
// Conventions copied from Heap-HeapSort-Priority Queue.pdf (do not "fix" them to a textbook):
//   - 1-based arrays: Left(i) = 2i, Right(i) = 2i + 1, Parent(i) = floor(i/2).
//   - Max-Heapify(A, i): largest = l if l <= heap_size and A[l] > A[i], else i; then
//     largest = r if r <= heap_size and A[r] > A[largest]; swap and recurse if largest != i.
//   - BuildHeap: for i = floor(n/2) down to 1: Max-Heapify(A, i).
//   - HEAP-EXTRACT-MAX: max = A[1]; A[1] = A[heapSize]; heapSize - 1; MAX-HEAPIFY(A, 1).
//   - HEAP-INCREASE-KEY: A[i] = key; while i > 1 and A[Parent(i)] < A[i]: swap, i = Parent(i).
//     MAX-HEAP-INSERT: heapSize + 1, A[heapSize] = -inf, HEAP-INCREASE-KEY(A, heapSize, key).
//   - Heapsort loop body: Swap(A[1], A[i]); heap_size - 1; Heapify(A, 1).
// Keys are distinct, so no tie ever decides a swap.
//
//   gen-310-heapify-swaps    MAX-HEAPIFY(A, i), one swap at a time
//   gen-310-buildheap-swaps  every swap BUILD-MAX-HEAP makes, in order (<= 8)
//   gen-310-insert-swaps     sift-up after MAX-HEAP-INSERT / HEAP-INCREASE-KEY        (a-pq)
//   gen-310-extract-swaps    sift-down after HEAP-EXTRACT-MAX moved A[n] to the root  (a-pq)
//   gen-310-heap-fill        fill in the heap after BUILD-MAX-HEAP / one heapsort pass
//   gen-310-heap-check       is it a max-heap (first violation); Parent/Left/Right on a drawn heap; height
// The priority-queue assignment (Java task scheduler) is tagged only as a concept link: no card
// uses its tasks, priorities, methods or tests.
(function (FC) {
  'use strict';
  const G = FC.gen;
  if (!G) throw new Error('load js/generators.js before js/gen-csc310-heap.js');
  const { int, pick, shuffle } = G;
  const DECK = 'csc310', CAT = 'Heaps & priority queues';
  const source = 'Generated practice (new problem each time); method from Heap-HeapSort-Priority Queue.pdf (AUCSC 310, M. Qasem)';
  const M = s => '$' + s + '$';
  const fmt = a => '[' + a.join(', ') + ']';
  const pairs = ps => ps.map(([x, y]) => `(${x},${y})`).join(' ');
  const left = i => 2 * i, right = i => 2 * i + 1, parent = i => Math.floor(i / 2);
  const distinct = (rng, k, lo, hi) => { const all = []; for (let v = lo; v <= hi; v++) all.push(v); return shuffle(rng, all).slice(0, k); };
  function weighted(rng, ps) {
    const total = ps.reduce((s, p) => s + p[1], 0);
    let r = rng() * total;
    for (const [k, w] of ps) { if ((r -= w) < 0) return k; }
    return ps[ps.length - 1][0];
  }

  // H is 1-based (H[0] unused). Returns the swapped pairs [i, largest] and the steps for `why`.
  function heapify(H, i, size) {
    const sw = [], steps = [];
    for (;;) {
      const l = left(i), r = right(i);
      let largest = l <= size && H[l] > H[i] ? l : i;
      if (r <= size && H[r] > H[largest]) largest = r;
      if (largest === i) {
        const kids = [l, r].filter(c => c <= size).map(c => H[c]);
        steps.push(kids.length ? `${H[i]} ≥ ${kids.join(', ')}: stop` : `A[${i}] is a leaf: stop`);
        return { sw, steps };
      }
      steps.push(`A[${i}]=${H[i]} < ${H[largest]}: (${i},${largest})`);
      [H[i], H[largest]] = [H[largest], H[i]];
      sw.push([i, largest]);
      i = largest;
    }
  }
  function buildHeap(A) {
    const H = [null].concat(A), n = A.length, per = [];
    for (let i = parent(n); i >= 1; i--) per.push({ i, sw: heapify(H, i, n).sw });
    return { H, per, swaps: [].concat(...per.map(p => p.sw)) };
  }
  const buildWhy = (n, per) => `i = ${M(`\\lfloor ${n}/2 \\rfloor = ${parent(n)}`)} down to 1. ` + per.map(p => `i=${p.i}: ${pairs(p.sw) || 'none'}`).join('; ') + '.';
  function siftUp(H, i) {
    const sw = [];
    while (i > 1 && H[parent(i)] < H[i]) { const p = parent(i); [H[i], H[p]] = [H[p], H[i]]; sw.push([i, p]); i = p; }
    return { sw, at: i };
  }
  // A random valid max-heap of n distinct keys in [lo, hi] (1-based H).
  const randomHeap = (rng, n, lo = 10, hi = 99) => buildHeap(distinct(rng, n, lo, hi)).H;
  const nodeHeight = (i, n) => { let h = 0; while (left(i) <= n) { i = left(i); h++; } return h; };

  // ═══════════════ 1. MAX-HEAPIFY, swap by swap ═══════════════
  G.register({
    id: 'gen-310-heapify-swaps', deck: DECK, lecture: 'heap', cat: CAT, sub: 'Max-Heapify',
    title: 'MAX-HEAPIFY on a drawn heap, one swap at a time',
    make(rng) {
      const want = weighted(rng, [[1, 0.15], [2, 0.55], [3, 0.3]]);
      for (let t = 0; ; t++) {
        const n = int(rng, 7, 12), H = randomHeap(rng, n);
        const internal = []; for (let i = 1; i <= parent(n); i++) internal.push(i);
        const i = pick(rng, internal.filter(x => nodeHeight(x, n) >= Math.min(want, 2)).concat(t > 50 ? internal : []));
        if (!i) continue;
        // Lower the key at i below its larger child (subtrees stay heaps, so the precondition holds).
        const kids = [left(i), right(i)].filter(c => c <= n).map(c => H[c]);
        const used = new Set(H.slice(1)), cands = [];
        for (let v = 1; v < Math.max(...kids); v++) if (!used.has(v)) cands.push(v);
        if (!cands.length) continue;
        const B = H.slice(); B[i] = pick(rng, cands);
        const start = B.slice(1), r = heapify(B, i, n);
        if (r.sw.length !== want && t < 200) continue;
        return { type: 'swaps', heap: start, swaps: r.sw, answer: B.slice(1),
          prompt: `Both subtrees of node ${i} are max-heaps. Run MAX-HEAPIFY(A, ${i}): make each swap it makes, in order.`,
          why: `Swap with the LARGER child while it is bigger. ${r.steps.join('. ')}.`, source, spec: { kind: 'heapify', i, n } };
      }
    },
  });

  // ═══════════════ 2. BUILD-MAX-HEAP, every swap ═══════════════
  G.register({
    id: 'gen-310-buildheap-swaps', deck: DECK, lecture: 'heap', cat: CAT, sub: 'Build-heap',
    title: 'BUILD-MAX-HEAP on a drawn array: every swap, in order',
    make(rng) {
      for (let t = 0; ; t++) {
        const n = int(rng, 6, 10), A = distinct(rng, n, 1, 99), r = buildHeap(A);
        if ((r.swaps.length < 2 || r.swaps.length > 8) && t < 500) continue;
        return { type: 'swaps', heap: A, swaps: r.swaps, answer: r.H.slice(1),
          prompt: `Run BUILD-MAX-HEAP on A (n = ${n}). Make every swap its MAX-HEAPIFY calls make, in order.`,
          why: buildWhy(n, r.per) + ' Leaves need no call.', source, spec: { kind: 'build', n } };
      }
    },
  });

  // ═══════════════ 3. MAX-HEAP-INSERT / HEAP-INCREASE-KEY: sift up ═══════════════
  G.register({
    id: 'gen-310-insert-swaps', deck: DECK, lecture: 'heap', cat: CAT, sub: 'Priority queue ops', assignment: ['a-pq'],
    title: 'MAX-HEAP-INSERT and HEAP-INCREASE-KEY: the swaps up the tree',
    make(rng) {
      const kind = weighted(rng, [['insert', 1.2], ['increase', 1]]);
      const want = weighted(rng, [[1, 0.2], [2, 0.5], [3, 0.3]]);
      for (let t = 0; ; t++) {
        const n = int(rng, 6, 11), H = randomHeap(rng, n);
        const used = new Set(H.slice(1));
        const B = H.slice();
        const i = kind === 'insert' ? n + 1 : int(rng, 2, n);
        const old = kind === 'insert' ? null : H[i];
        const cands = []; for (let v = (old || 0) + 1; v <= 99; v++) if (!used.has(v)) cands.push(v);
        if (!cands.length) continue;
        const key = pick(rng, cands);
        B[i] = key;
        const start = B.slice(1), r = siftUp(B, i);
        if (!r.sw.length || (r.sw.length !== want && t < 300)) continue;
        const stop = r.at === 1 ? 'it reached the root' : `parent ${B[parent(r.at)]} ≥ ${key}`;
        const prompt = kind === 'insert'
          ? `MAX-HEAP-INSERT(A, ${key}) on a max-heap of ${n}: heapSize is now ${n + 1} and A[${n + 1}] = ${M('-\\infty')} was raised to ${key} (drawn). Make HEAP-INCREASE-KEY's swaps.`
          : `HEAP-INCREASE-KEY(A, ${i}, ${key}) on a max-heap: A[${i}] was ${old} and is now ${key} (drawn). Make the swaps that restore the heap.`;
        return { type: 'swaps', heap: start, swaps: r.sw, answer: B.slice(1), prompt,
          why: `While ${M('A[\\text{Parent}(i)] < A[i]')}, swap with the parent (${M('\\lfloor i/2 \\rfloor')}): ${pairs(r.sw)}. Stop: ${stop}.`,
          source, spec: { kind, i, key, n } };
      }
    },
  });

  // ═══════════════ 4. HEAP-EXTRACT-MAX: sift down from the root ═══════════════
  G.register({
    id: 'gen-310-extract-swaps', deck: DECK, lecture: 'heap', cat: CAT, sub: 'Priority queue ops', assignment: ['a-pq'],
    title: 'HEAP-EXTRACT-MAX: the swaps after the last key moves to the root',
    make(rng) {
      const n = int(rng, 7, 12), H = randomHeap(rng, n);
      const max = H[1], last = H[n];
      const B = H.slice(0, n); B[1] = last;
      const start = B.slice(1), r = heapify(B, 1, n - 1);
      return { type: 'swaps', heap: start, swaps: r.sw, answer: B.slice(1),
        prompt: `HEAP-EXTRACT-MAX on a max-heap of ${n}: max = ${max} was saved, A[1] = A[${n}] = ${last}, heapSize is now ${n - 1} (drawn). Make MAX-HEAPIFY(A, 1)'s swaps.`,
        why: `${r.steps.join('. ')}. It returns ${max}.`, source, spec: { kind: 'extract', n, max, last, before: H.slice(1) } };
    },
  });

  // ═══════════════ 5. Fill in the heap ═══════════════
  G.register({
    id: 'gen-310-heap-fill', deck: DECK, lecture: 'heap', cat: CAT, sub: 'Build-heap',
    title: 'Fill in the heap after BUILD-MAX-HEAP or one heapsort pass',
    make(rng) {
      const kind = weighted(rng, [['build', 1.3], ['heapsort', 1]]);
      for (let t = 0; ; t++) {
        let start, fin, why, prompt;
        if (kind === 'build') {
          const n = int(rng, 6, 9), A = distinct(rng, n, 1, 99), r = buildHeap(A);
          start = A; fin = r.H.slice(1);
          prompt = `BUILD-MAX-HEAP(A) on A = ${fmt(A)}. Fill in the blank nodes of the resulting max-heap.`;
          why = buildWhy(n, r.per);
        } else {
          const n = int(rng, 7, 11), H = randomHeap(rng, n), B = H.slice();
          [B[1], B[n]] = [B[n], B[1]];
          const r = heapify(B, 1, n - 1);
          start = H.slice(1, n); fin = B.slice(1, n);
          prompt = `Heapsort, A = ${fmt(H.slice(1))} is already a max-heap. After the first loop iteration (Swap(A[1], A[${n}]), heap_size − 1, Heapify(A, 1)), fill in the heap A[1..${n - 1}].`;
          why = `Swap A[1] = ${H[1]} with A[${n}] = ${H[n]}; ${H[1]} is now sorted in A[${n}]. Heapify(A, 1) on size ${n - 1}: ${pairs(r.sw) || 'none'}.`;
        }
        const changed = []; for (let i = 1; i <= fin.length; i++) if (fin[i - 1] !== start[i - 1]) changed.push(i);
        // Blanks = every changed position plus 1-2 unchanged ones; at least 2 nodes stay shown.
        const cap = Math.min(6, fin.length - 2);
        if ((changed.length < 2 || changed.length + 1 > cap) && t < 500) continue;
        const others = shuffle(rng, fin.map((_, k) => k + 1).filter(i => !changed.includes(i)));
        const target = Math.min(cap, Math.max(3, changed.length + int(rng, 1, 2)));
        const blanks = changed.concat(others.slice(0, target - changed.length)).sort((a, b) => a - b);
        return { type: 'fill', heap: fin, blanks, answer: fin.slice(), prompt, why, source, spec: { kind, start, changed } };
      }
    },
  });

  // ═══════════════ 6. Reading a drawn heap ═══════════════
  G.register({
    id: 'gen-310-heap-check', deck: DECK, lecture: 'heap', cat: CAT, sub: 'Heap structure',
    title: 'Read a drawn heap: max-heap or not, Parent/Left/Right, height',
    make(rng) {
      const kind = weighted(rng, [['isHeap', 1.4], ['nav', 1.4], ['height', 0.8]]);
      if (kind === 'isHeap') {
        const n = int(rng, 6, 12), H = randomHeap(rng, n), how = weighted(rng, [['valid', 0.35], ['swap', 0.35], ['raise', 0.3]]);
        if (how === 'swap') { const k = int(rng, 2, n), p = parent(k); [H[k], H[p]] = [H[p], H[k]]; }
        if (how === 'raise') {
          const k = int(rng, 2, n), used = new Set(H.slice(1)), cands = [];
          for (let v = H[parent(k)] + 1; v <= 99; v++) if (!used.has(v)) cands.push(v);
          if (cands.length) H[k] = pick(rng, cands); else { const p = parent(k); [H[k], H[p]] = [H[p], H[k]]; }
        }
        const A = H.slice(1);
        let first = 0; for (let i = 2; i <= n; i++) if (H[parent(i)] < H[i]) { first = i; break; }
        const opt = i => `No: first broken at i = ${i}`, YES = 'Yes: it is a max-heap';
        const answer = first ? opt(first) : YES;
        const pool = []; for (let i = 2; i <= n; i++) if (i !== first) pool.push(i);
        const near = first ? [first ^ 1, parent(first), first + 1, first - 1] : [];
        const wrongIdx = [...new Set(near.filter(i => i >= 2 && i <= n && i !== first).concat(shuffle(rng, pool)))].slice(0, first ? 2 : 3);
        const options = (first ? [YES] : []).concat(wrongIdx.map(opt));
        const checks = []; for (let i = 2; i <= (first || n); i++) checks.push(`${H[i]}${H[i] <= H[parent(i)] ? '≤' : '>'}${H[parent(i)]}`);
        return { type: 'mc', heap: A, answer, options,
          prompt: `Is this array a max-heap? If not, where is the FIRST break (smallest i with ${M('A[i] > A[\\text{Parent}(i)]')})?`,
          why: `Compare each A[i] with ${M('A[\\lfloor i/2 \\rfloor]')}, i = 2 up: ${checks.join(', ')}${first ? `. A[${first}] = ${H[first]} > its parent A[${parent(first)}] = ${H[parent(first)]}` : ': every node ≤ its parent'}.`,
          source, spec: { kind, A, first } };
      }
      if (kind === 'nav') {
        const n = int(rng, 7, 12), H = randomHeap(rng, n), A = H.slice(1);
        const which = pick(rng, ['Parent', 'Left', 'Right']);
        const ok = []; for (let i = 1; i <= n; i++) {
          const j = which === 'Parent' ? parent(i) : which === 'Left' ? left(i) : right(i);
          if (j >= 1 && j <= n) ok.push(i);
        }
        const i = pick(rng, ok), j = which === 'Parent' ? parent(i) : which === 'Left' ? left(i) : right(i);
        const ask = weighted(rng, [['value', 1], ['index', 1]]);
        const expr = which === 'Parent' ? `\\lfloor ${i}/2 \\rfloor` : which === 'Left' ? `2 \\cdot ${i}` : `2 \\cdot ${i} + 1`;
        const rel = which === 'Parent' ? 'parent' : which.toLowerCase() + ' child';
        const prompt = ask === 'value'
          ? `The key ${H[i]} is in this heap. Which KEY is its ${rel}? Find its index, then use ${which}(i).`
          : `The key ${H[i]} is in this heap. What is the INDEX of its ${rel}?`;
        return { type: 'typed', heap: A, prompt, answer: String(ask === 'value' ? H[j] : j), ...(ask === 'value' ? {} : { accept: [`A[${j}]`, `i = ${j}`] }),
          why: `${H[i]} is at index ${i}. ${M(`\\text{${which}}(${i}) = ${expr} = ${j}`)}, and ${M(`A[${j}] = ${H[j]}`)}.`, source, spec: { kind, A, i, which, ask } };
      }
      // height: of the drawn heap, or of a bigger one given only n
      const drawn = rng() < 0.5, n = drawn ? int(rng, 4, 12) : int(rng, 13, 200);
      let h = 0; while (2 ** (h + 1) <= n) h++;
      const card = { type: 'typed', answer: String(h),
        prompt: drawn ? `What is the height of this heap (edges on the longest root-to-leaf path)?`
          : `A heap has n = ${n} elements. What is its height (edges on the longest root-to-leaf path)?`,
        why: `Height ${M('= \\lfloor \\lg n \\rfloor')}: ${M(`2^{${h}} = ${2 ** h} \\le ${n} < ${2 ** (h + 1)}`)}, so ${h}. Level ${h} is the last one, possibly partly full.`,
        source, spec: { kind, n } };
      if (drawn) card.heap = randomHeap(rng, n).slice(1);
      return card;
    },
  });
})(globalThis.FC = globalThis.FC || {});
