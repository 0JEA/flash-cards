// Trees of any shape (parse trees, recursion trees): layout, drawing, an interactive builder
// for answering, and node-by-node comparison for grading.
//
// Tree data: { label: '<expr>', kids: [ ... ] }   (`sym` is accepted as an alias of `label`)
// Optional node fields: side: 'L' | 'R' on a LONE child of a binary-tree node (drawn to that
// side, not straight below), id (what a 'path' answer records; heaps use the 1-based index),
// note (small corner badge, e.g. the heap index), blank: true + answer: '…' ('fill' cards).
// Labels may contain $...$ (rendered by KaTeX in classes with math on).
//
// Card types that answer ON a tree (see js/app.js):
//   tree   build it: { start, palette: [labels], answer: tree }
//   swaps  heap repair, one checked swap at a time: { heap: [values], swaps: [[i, j], ...], answer: [final values] }
//   fill   type the blank nodes: { tree (with blank nodes) } or { heap: [final values], blanks: [indices] }
//   path   tap nodes in order: { tree or heap, answer: [ids in order] }
// Any other card type with `tree` or `heap` gets the tree drawn under its question.
// Heaps are drawn top-down with their array underneath; other trees pick the orientation
// that fits the screen best.
(function (FC) {
  'use strict';

  const labelOf = t => String(t.label != null ? t.label : t.sym != null ? t.sym : '');
  const kidsOf = t => t.kids || t.children || [];
  const norm = s => String(s).replace(/\$/g, '').replace(/\s+/g, '').toLowerCase();

  // Tidy layout: leaves take consecutive slots left to right; a parent sits centred over its
  // first and last child. Returns nodes with x (slot units), depth, path ('0.2.1'), parent path.
  function layout(tree) {
    const nodes = [];
    let slot = 0;
    (function walk(t, depth, path, parent) {
      const node = { t, label: labelOf(t), depth, path, parent };
      nodes.push(node);
      const kids = kidsOf(t);
      if (!kids.length) node.x = slot++;
      else if (kids.length === 1 && (kids[0].side === 'L' || kids[0].side === 'R')) {
        // Binary trees: a lone child keeps its side, with an empty slot where its sibling would be.
        const left = kids[0].side === 'L';
        if (!left) slot++;
        const x = walk(kids[0], depth + 1, path + '.0', path).x;
        if (left) slot++;
        node.x = left ? x + 0.5 : x - 0.5;
      } else {
        const xs = kids.map((k, i) => walk(k, depth + 1, path + '.' + i, path).x);
        node.x = (xs[0] + xs[xs.length - 1]) / 2;
      }
      return node;
    })(tree, 0, '0', null);
    return { nodes, width: Math.max(1, slot), depth: Math.max(...nodes.map(n => n.depth)) + 1 };
  }

  // Paths whose label differs from the expected tree, plus nodes missing or extra.
  function diff(given, expected) {
    const wrong = new Set(), missing = [];
    (function walk(g, e, path) {
      if (!g) { missing.push(path); return; }
      if (!e) { wrong.add(path); kidsOf(g).forEach((k, i) => walk(k, null, path + '.' + i)); return; }
      if (norm(labelOf(g)) !== norm(labelOf(e))) wrong.add(path);
      const gk = kidsOf(g), ek = kidsOf(e);
      for (let i = 0; i < Math.max(gk.length, ek.length); i++) walk(gk[i], ek[i], path + '.' + i);
    })(given, expected, '0');
    return { wrong, missing, same: wrong.size === 0 && missing.length === 0 };
  }
  const equal = (a, b) => diff(a, b).same;

  // Feedback on ONE tree: paths of the expected tree where the given tree has a different
  // label or no node, and how many extra nodes the given tree has.
  function mistakesOn(given, expected) {
    const marks = new Set();
    let extra = 0;
    (function walk(g, e, path) {
      if (!e) { extra++; kidsOf(g).forEach(k => walk(k, null, '')); return; }
      if (!g || norm(labelOf(g)) !== norm(labelOf(e))) marks.add(path);
      const gk = g ? kidsOf(g) : [], ek = kidsOf(e);
      for (let i = 0; i < Math.max(gk.length, ek.length); i++) {
        if (ek[i]) walk(gk[i], ek[i], path + '.' + i); else walk(gk[i], null, '');
      }
    })(given, expected, '0');
    return { marks, extra };
  }

  // Draw a tree into a box. opts: { render(label) -> nodes, wrong: Set(paths), selected: path,
  // onSelect(path), maxHeight (px), fill (fill the parent's height), share }.
  // The tree is drawn top-down or left-to-right, whichever lets it be bigger in the box
  // (parse trees are deep and narrow, so a wide short box wants left-to-right). It shrinks
  // (never grows) to fit, and refits whenever the box resizes.
  function draw(tree, opts = {}) {
    const { nodes, width, depth } = layout(tree);
    const maxLen = Math.max(...nodes.map(n => n.label.replace(/\$/g, '').length), 1);
    const nodeW = Math.min(150, maxLen * 8.4 + 22);         // widest label, mono 0.85rem
    const V = { slot: Math.max(44, Math.min(nodeW, 64) + 8), row: 42 };   // top-down
    const Hz = { col: nodeW + 26, row: 30 };                              // left-to-right
    const dims = o => o === 'v' ? { W: width * V.slot, H: depth * V.row } : { W: depth * Hz.col, H: width * Hz.row };
    const box = document.createElement('div');
    box.className = 'ftree';
    const sizer = document.createElement('div');   // takes the scaled size, so a scrolling box knows it
    sizer.className = 'ftree-sizer';
    const inner = document.createElement('div');
    inner.className = 'ftree-inner';
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'ftree-edges');
    inner.append(svg);
    const byPath = new Map(nodes.map(n => [n.path, n]));
    const lines = nodes.filter(n => n.parent).map(n => { const l = document.createElementNS(NS, 'line'); svg.append(l); return [n, l]; });
    const els = nodes.map(n => {
      const el = document.createElement(opts.onSelect ? 'button' : 'div');
      if (opts.onSelect) { el.type = 'button'; el.addEventListener('click', () => opts.onSelect(n.path)); }
      el.className = 'ftree-node' + (opts.wrong && opts.wrong.has(n.path) ? ' wrong' : '') + (opts.selected === n.path ? ' selected' : '')
        + (opts.classOf ? ' ' + (opts.classOf(n) || '') : '');
      const content = opts.render ? opts.render(n.label) : [n.label];
      el.append(...content.map(c => c instanceof Node ? c : document.createTextNode(c || ' ')));
      if (!n.label) el.classList.add('empty');
      // Small corner badge: a heap index (t.note) or e.g. the order a node was tapped.
      const badge = opts.badge ? opts.badge(n) : n.t.note;
      if (badge != null && badge !== '') { const b = document.createElement('span'); b.className = 'ftree-badge'; b.textContent = badge; el.append(b); }
      inner.append(el);
      return [n, el];
    });
    sizer.append(inner);
    box.append(sizer);
    const place = o => {
      const at = n => o === 'v' ? { x: (n.x + 0.5) * V.slot, y: n.depth * V.row + V.row / 2 } : { x: n.depth * Hz.col + Hz.col / 2, y: (n.x + 0.5) * Hz.row };
      const { W, H } = dims(o);
      inner.style.width = W + 'px'; inner.style.height = H + 'px';
      svg.setAttribute('width', W); svg.setAttribute('height', H);
      for (const [n, l] of lines) { const a = at(byPath.get(n.parent)), b = at(n);
        l.setAttribute('x1', a.x); l.setAttribute('y1', a.y); l.setAttribute('x2', b.x); l.setAttribute('y2', b.y); }
      for (const [n, el] of els) { const p = at(n); el.style.left = p.x + 'px'; el.style.top = p.y + 'px'; }
      return { W, H };
    };
    if (opts.fill) {
      box.classList.add('fill');
      // A filling tree claims its natural height (up to a share of the window) before text is
      // fitted around it: the tree is the content, the text is context.
      const natural = Math.min(dims('v').H, dims('h').H);
      box.style.minHeight = Math.min(natural, Math.round(innerHeight * (opts.share || 0.4))) + 'px';
    }
    let last = '';
    const fit = () => {
      const availW = box.clientWidth || dims('v').W;
      const availH = opts.fill ? box.clientHeight || dims('v').H : opts.maxHeight || Infinity;
      const scale = o => { const { W, H } = dims(o); return Math.min(1, availW / W, availH / H); };
      const o = opts.orient || (scale('h') > scale('v') * 1.05 ? 'h' : 'v');
      // An editing canvas never shrinks below minScale: past that it scrolls, like a text box.
      const sc = Math.max(scale(o), opts.minScale || 0);
      if (o !== last) { place(o); last = o; }
      const { W, H } = dims(o);
      inner.style.transform = `scale(${sc})`;
      sizer.style.width = Math.ceil(W * sc) + 'px'; sizer.style.height = Math.ceil(H * sc) + 'px';
      box.classList.toggle('scrolls', sc > scale(o) + 1e-6);
      if (!opts.fill) box.style.height = Math.ceil(H * sc) + 'px';
      const sel = inner.querySelector('.selected');
      if (sel && box.classList.contains('scrolls')) sel.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    };
    box.fit = fit;
    requestAnimationFrame(fit);
    if (window.ResizeObserver) new ResizeObserver(() => fit()).observe(box);
    return box;
  }

  // Interactive builder. Returns { el, value(), refit() }.
  // opts: { start: root label, palette: [labels to tap], render, onChange }
  function builder(opts = {}) {
    let tree = { label: opts.start || '', kids: [] };
    let sel = '0';
    const history = [];
    const el = document.createElement('div');
    el.className = 'tbuild';
    const view = document.createElement('div');
    view.className = 'tbuild-view';
    const hint = document.createElement('div');
    hint.className = 'tbuild-hint';
    const input = document.createElement('input');
    Object.assign(input, { type: 'text', placeholder: 'Label for a new child, then Enter', autocomplete: 'off', spellcheck: false });
    input.setAttribute('aria-label', 'Label for a new child of the selected node');
    input.className = 'tbuild-input';
    const row = document.createElement('div');
    row.className = 'tbuild-row';
    const mk = (text, fn, cls) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'btn ' + (cls || ''); b.textContent = text; b.addEventListener('click', fn); return b; };
    const at = path => path.split('.').slice(1).reduce((t, i) => t.kids[+i], tree);
    const clone = t => ({ label: t.label, kids: t.kids.map(clone) });
    const save = () => { history.push({ tree: clone(tree), sel }); if (history.length > 100) history.shift(); };
    function add(label) {
      label = String(label).trim();
      if (!label) return;
      save();
      const node = at(sel);
      if (!node.label) node.label = label;        // first label names an empty node (the root)
      else node.kids.push({ label, kids: [] });
      paint();
    }
    function remove() {
      if (sel === '0') { save(); tree = { label: opts.start || '', kids: [] }; paint(); return; }
      save();
      const parts = sel.split('.');
      const parent = at(parts.slice(0, -1).join('.'));
      parent.kids.splice(+parts[parts.length - 1], 1);
      sel = parts.slice(0, -1).join('.');
      paint();
    }
    function rename() {
      const v = input.value.trim();
      if (!v) { input.focus(); return; }
      save(); at(sel).label = v; input.value = ''; paint();
    }
    function undo() { const h = history.pop(); if (h) { tree = h.tree; sel = h.sel; paint(); } }
    function paint() {
      const d = draw(tree, { render: opts.render, selected: sel, onSelect: p => { sel = p; paint(); input.focus(); }, fill: true, share: 0.2, minScale: 0.8 });
      view.replaceChildren(d);
      d.fit();
      const node = at(sel);
      input.placeholder = node.label ? `Add a child to ${node.label}` : 'Type the root label';
      if (opts.onChange) opts.onChange();
    }
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); add(input.value); input.value = ''; }
    });
    row.append(input, mk('Rename', rename), mk('Delete', remove), mk('Undo', undo));
    el.append(view);
    if (opts.palette && opts.palette.length) {
      const pal = document.createElement('div');
      pal.className = 'tbuild-palette';
      for (const lab of opts.palette) {
        const b = mk('', () => { add(lab); input.focus(); }, 'chip');
        b.append(...(opts.render ? opts.render(lab) : [lab]));
        pal.append(b);
      }
      el.append(pal);
    }
    el.append(row);
    paint();
    return { el, value: () => clone(tree), refit: () => { const d = view.firstChild; if (d && d.fit) d.fit(); }, focus: () => input.focus() };
  }

  // ── Heaps: array <-> tree ──────────────────────────────────────────────
  // heapTree([16, 14, 10]) -> root 16 (index 1) with children 14 (2) and 10 (3). Node ids are
  // the 1-based array indices (her convention: Left(i) = 2i, Right(i) = 2i + 1).
  function heapTree(arr, n = arr.length, blanks) {
    const make = i => ({ label: blanks && blanks.includes(i) ? '' : String(arr[i - 1]), note: String(i), id: i, blank: !!(blanks && blanks.includes(i)), answer: String(arr[i - 1]),
      kids: [2 * i, 2 * i + 1].filter(c => c <= n).map(make) });
    return make(1);
  }
  const nodeAt = (tree, path) => path.split('.').slice(1).reduce((t, i) => kidsOf(t)[+i], tree);
  const allNodes = tree => layout(tree).nodes;

  function stripOf(arr, cls) {
    const strip = document.createElement('div');
    strip.className = 'hstrip';
    arr.forEach((v, i) => {
      const c = document.createElement('div');
      c.className = 'hcell ' + (cls ? cls(i + 1) || '' : '');
      const iv = document.createElement('span'); iv.className = 'hidx'; iv.textContent = i + 1;
      c.append(String(v), iv);
      strip.append(c);
    });
    return strip;
  }

  // Swap mode: the student restores a heap one swap at a time. Each swap is checked at once
  // against the expected sequence; a wrong one is not applied. After two misses on the same
  // step the right pair is highlighted.
  // opts: { heap: [values], swaps: [[i, j], ...] (1-based), render, onChange }
  function swapper(opts) {
    const a = opts.heap.slice();
    const want = opts.swaps;
    let k = 0, errors = 0, misses = 0, sel = null, flash = null, hint = null;
    const el = document.createElement('div'); el.className = 'tbuild';
    const view = document.createElement('div'); view.className = 'tbuild-view';
    const status = document.createElement('div'); status.className = 'tbuild-hint';
    el.append(view, status);
    const same = (p, q) => (p[0] === q[0] && p[1] === q[1]) || (p[0] === q[1] && p[1] === q[0]);
    function attempt(i, j) {
      const exp = want[k];
      if (exp && same([i, j], exp)) {
        [a[i - 1], a[j - 1]] = [a[j - 1], a[i - 1]];
        k++; misses = 0; hint = null; flash = { ok: [i, j] };
      } else {
        errors++; misses++; flash = { bad: [i, j] };
        if (misses >= 2 && exp) hint = exp;
      }
      sel = null; paint();
      setTimeout(() => { flash = null; paint(); }, 700);
    }
    function onSelect(path) {
      const i = nodeAt(heapTree(a), path).id;
      if (k >= want.length) return;
      if (sel == null) sel = i; else if (sel === i) sel = null; else return attempt(sel, i);
      paint();
    }
    const cls = i => [sel === i ? 'selected' : '', hint && hint.includes(i) ? 'hint' : '',
      flash && flash.ok && flash.ok.includes(i) ? 'swapped' : '', flash && flash.bad && flash.bad.includes(i) ? 'wrong' : ''].join(' ');
    function paint() {
      const d = draw(heapTree(a), { render: opts.render, onSelect, classOf: n => cls(n.t.id), fill: true, share: 0.3, orient: 'v' });
      view.replaceChildren(d, stripOf(a, cls));
      d.fit();
      status.textContent = k >= want.length ? `Done: ${k} swap${k === 1 ? '' : 's'}` + (errors ? `, ${errors} wrong tr${errors === 1 ? 'y' : 'ies'}` : '')
        : `Tap two nodes to swap them.` + (k || errors ? ` ${k} swap${k === 1 ? '' : 's'} so far` + (errors ? `, ${errors} wrong` : '') + '.' : '');
      if (opts.onChange) opts.onChange();
    }
    paint();
    return { el, value: () => ({ done: k >= want.length, errors, k, heap: a.slice() }), ready: () => k > 0 || errors > 0 };
  }

  // Fill mode: the tree's shape is given; blank nodes (blank: true; their `answer` is the
  // right label) are filled by tapping them and typing. Enter moves to the next blank.
  // opts: { tree, render, onChange }
  function filler(opts) {
    const tree = opts.tree;
    const blanks = allNodes(tree).filter(n => n.t.blank).sort((p, q) => p.depth - q.depth || p.x - q.x).map(n => n.path);
    const vals = new Map();
    let sel = blanks[0];
    const el = document.createElement('div'); el.className = 'tbuild';
    const view = document.createElement('div'); view.className = 'tbuild-view';
    const row = document.createElement('div'); row.className = 'tbuild-row';
    const input = document.createElement('input');
    Object.assign(input, { type: 'text', autocomplete: 'off', spellcheck: false });
    input.className = 'tbuild-input';
    input.setAttribute('aria-label', 'Value for the selected node');
    row.append(input);
    el.append(view, row);
    const shown = t => ({ ...t, label: t.blank ? '' : t.label, kids: kidsOf(t).map(shown) });
    function display() {
      const copy = shown(tree);
      for (const [p, v] of vals) nodeAt(copy, p).label = v;
      return copy;
    }
    function set(v) {
      v = String(v).trim();
      if (!sel) return;
      if (v) vals.set(sel, v); else vals.delete(sel);
      const next = blanks.find(p => !vals.has(p) && p !== sel) || null;
      if (next) sel = next;
      paint();
    }
    input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); e.stopPropagation(); set(input.value); input.value = ''; } });
    function paint() {
      const d = draw(display(), { render: opts.render, selected: sel, onSelect: p => { if (blanks.includes(p)) { sel = p; input.value = vals.get(p) || ''; paint(); input.focus(); } },
        classOf: n => blanks.includes(n.path) ? 'blank' : '', fill: true, share: 0.34, minScale: 0.75, orient: opts.orient || 'v' });
      view.replaceChildren(d);
      d.fit();
      const left = blanks.filter(p => !vals.has(p)).length;
      input.placeholder = sel ? (left ? `Value for the selected node (${left} blank${left === 1 ? '' : 's'} left)` : 'All filled: change any by tapping it') : '';
      if (opts.onChange) opts.onChange();
    }
    paint();
    return { el, value: () => Object.fromEntries(vals), ready: () => blanks.every(p => vals.has(p)), focus: () => input.focus() };
  }
  // Grade a fill: the paths whose typed value differs from the node's answer.
  function fillMistakes(tree, vals) {
    return new Set(allNodes(tree).filter(n => n.t.blank && norm(vals[n.path] || '') !== norm(n.t.answer != null ? n.t.answer : n.t.label)).map(n => n.path));
  }
  const filledTree = t => ({ ...t, label: t.blank ? String(t.answer != null ? t.answer : t.label) : t.label, kids: kidsOf(t).map(filledTree) });

  // Path mode: tap nodes in order (e.g. the elements a search compares). Tap the last one
  // again to take it back. value() = the tapped nodes' ids (t.id, else the path).
  function pather(opts) {
    const tree = opts.tree;
    const seq = [];
    const el = document.createElement('div'); el.className = 'tbuild';
    const view = document.createElement('div'); view.className = 'tbuild-view';
    const status = document.createElement('div'); status.className = 'tbuild-hint';
    el.append(view, status);
    const idOf = p => { const t = nodeAt(tree, p); return t.id != null ? t.id : p; };
    function paint() {
      const d = draw(tree, { render: opts.render, onSelect: p => { if (seq[seq.length - 1] === p) seq.pop(); else if (!seq.includes(p)) seq.push(p); paint(); },
        classOf: n => seq.includes(n.path) ? 'picked' : '', badge: n => seq.includes(n.path) ? String(seq.indexOf(n.path) + 1) : n.t.note, fill: true, share: 0.34, orient: opts.orient || 'v' });
      view.replaceChildren(d);
      d.fit();
      status.textContent = seq.length ? `${seq.length} tapped. Tap the last one again to take it back.` : 'Tap the nodes in order.';
      if (opts.onChange) opts.onChange();
    }
    paint();
    return { el, value: () => seq.map(idOf), ready: () => seq.length > 0 };
  }

  // Indented outline <-> tree (for data entry and old outline answers).
  function fromOutline(text) {
    const lines = String(text).split('\n').filter(l => l.trim());
    const root = { label: '', kids: [] }, stack = [{ indent: -1, node: root }];
    for (const line of lines) {
      const indent = line.match(/^\s*/)[0].length;
      const node = { label: line.trim(), kids: [] };
      while (stack[stack.length - 1].indent >= indent) stack.pop();
      stack[stack.length - 1].node.kids.push(node);
      stack.push({ indent, node });
    }
    return root.kids[0] || root;
  }

  FC.tree = { layout, draw, builder, diff, equal, mistakesOn, fromOutline, labelOf, kidsOf,
    heapTree, stripOf, swapper, filler, fillMistakes, filledTree, pather, nodeAt };
})(globalThis.FC = globalThis.FC || {});
