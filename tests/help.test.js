// Help walkthroughs (decks/*-help*.js): each belongs to a real card, has the required
// parts, every $...$ renders in KaTeX, and every graph draws finite values in range.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const katex = require('../vendor/katex/katex.min.js');
for (const f of ['csc370', 'csc370-blank-answers', 'csc370-blank-questions', 'softtest-a', 'softtest-b', 'softtest-c', 'softtest', 'ethics', 'csc310-a', 'csc310-b', 'csc310']) require('../decks/' + f + '.js');
require('../js/tree.js');
const helpFiles = fs.readdirSync(path.join(__dirname, '../decks')).filter(f => /-help(-\w+)?\.js$/.test(f));
for (const f of helpFiles) require('../decks/' + f);
const { decks, help } = globalThis.FC;
const byId = new Map(Object.values(decks).flatMap(d => d.cards.map(c => [c.id, Object.assign({ deck: d.id }, c)])));
// Lecture blanks studied as cards (same rule as blankCards in js/app.js): 'blank:<id>'.
{
  const F = globalThis.FC, grouped = new Set((F.blankGroups || []).flatMap(g => g.ids)), retired = new Set(F.blankRetired || []);
  for (const g of F.blankGroups || []) if (!g.ids.every(id => retired.has(id))) byId.set('blank:' + g.ids[0], { deck: 'csc370', prompt: g.ask });
  for (const b of decks.csc370.blanks) if (!grouped.has(b.id) && !retired.has(b.id) && F.blankAnswers[b.id]) byId.set('blank:' + b.id, { deck: 'csc370', prompt: b.prompt });
}
const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');

const texts = h => [h.asks, h.idea, h.answer, h.mistake, h.tryIt && h.tryIt.q, h.tryIt && h.tryIt.a,
  ...(h.steps || []).flatMap(st => typeof st === 'string' ? [st] : [st.text, ...(st.table ? st.table.head.concat(st.table.rows.flat()) : [])]),
  ...(h.heapSteps || []).map(st => st.text), ...[].concat(h.ptree || []).map(p => p.caption),
  ...(h.tree ? [h.tree.caption, h.tree.sumsLabel, ...h.tree.levels.flatMap(l => l.gap ? [] : [...l.nodes, l.sum])] : []),
  ...(h.graph ? [h.graph.caption, h.graph.bars && h.graph.bars.label, ...(h.graph.curves || []).map(c => c.label), ...(h.graph.marks || []).map(m => m.label)] : [])].filter(Boolean);

test('every help file is loaded by index.html', () => {
  for (const f of helpFiles) assert.ok(html.includes(`src="decks/${f}"`), `${f} is not in index.html`);
});

for (const [id, h] of Object.entries(help || {})) {
  test(`help ${id}`, () => {
    assert.ok(byId.has(id), `no card ${id}`);
    for (const k of ['asks', 'steps', 'answer']) assert.ok(h[k] && h[k].length, `missing ${k}`);
    const mathOn = !!decks[byId.get(id).deck].math;
    if (h.tryIt) assert.ok(h.tryIt.q && h.tryIt.a && (h.tryIt.code == null || typeof h.tryIt.code === 'string'), 'tryIt needs q and a; code is a string');
    for (const st of h.steps) if (typeof st !== 'string') assert.ok(st.text && (st.code == null || typeof st.code === 'string'), 'step needs text; code is a string');
    assert.ok([].concat(h.ptree || []).length <= 3, 'at most 3 ptrees');
    for (const p of [].concat(h.ptree || [])) {
      const { nodes } = globalThis.FC.tree.layout(p.tree);
      assert.ok(nodes.length >= 2 && nodes.length <= 40 && nodes.every(n => n.label.trim()), 'ptree: 2–40 labelled nodes');
    }
    for (const t of texts(h)) {
      if (!mathOn) { assert.equal((String(t).match(/`/g) || []).length % 2, 0, `unbalanced backtick in: ${t}`); continue; }
      assert.equal((String(t).match(/(?<!\\)\$/g) || []).length % 2, 0, `unbalanced $ in: ${t}`);
      for (const m of String(t).matchAll(/(?<!\\)\$(.+?)(?<!\\)\$/g)) assert.doesNotThrow(() => katex.renderToString(m[1], { throwOnError: true }), `KaTeX: ${m[1]}`);
    }
    for (const arr of [h.heap, ...(h.heapSteps || []).map(st => st.heap)].filter(Boolean))
      assert.ok(Array.isArray(arr) && arr.length >= 1 && arr.length <= 15 && arr.every(Number.isFinite), 'heap must be 1–15 numbers');
    if (h.tree) for (const l of h.tree.levels) if (!l.gap) assert.ok(l.nodes.length >= 1 && l.nodes.length <= 9, 'tree levels need 1–9 nodes');
    const g = h.graph;
    if (g) {
      const [x0, x1] = g.x;
      assert.ok(x1 > x0, 'x range');
      for (const c of g.curves || []) for (let i = 0; i <= 200; i++) {
        const v = c.f(x0 + (x1 - x0) * i / 200);
        assert.ok(Number.isFinite(v) && (!g.logY || v > 0), `${c.label} at sample ${i} = ${v}`);
      }
      for (const m of g.marks || []) assert.ok(m.x >= x0 && m.x <= x1, `mark ${m.x} outside x`);
      for (const [bx, bh] of g.bars ? g.bars.values : []) assert.ok(bx >= x0 && bx <= x1 && Number.isFinite(bh), `bar ${bx}`);
    }
  });
}
