// Help walkthroughs (decks/*-help*.js): each belongs to a real card, has the required
// parts, every $...$ renders in KaTeX, and every graph draws finite values in range.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const katex = require('../vendor/katex/katex.min.js');
for (const f of ['csc370', 'softtest-a', 'softtest-b', 'softtest-c', 'softtest', 'ethics', 'csc310-a', 'csc310-b', 'csc310']) require('../decks/' + f + '.js');
const helpFiles = fs.readdirSync(path.join(__dirname, '../decks')).filter(f => /-help(-\w+)?\.js$/.test(f));
for (const f of helpFiles) require('../decks/' + f);
const { decks, help } = globalThis.FC;
const byId = new Map(Object.values(decks).flatMap(d => d.cards.map(c => [c.id, c])));
const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');

const texts = h => [h.asks, h.idea, h.answer, h.mistake, h.tryIt && h.tryIt.q, h.tryIt && h.tryIt.a,
  ...(h.steps || []).flatMap(st => typeof st === 'string' ? [st] : [st.text, ...(st.table ? st.table.head.concat(st.table.rows.flat()) : [])]),
  ...(h.graph ? [h.graph.caption, h.graph.bars && h.graph.bars.label, ...(h.graph.curves || []).map(c => c.label), ...(h.graph.marks || []).map(m => m.label)] : [])].filter(Boolean);

test('every help file is loaded by index.html', () => {
  for (const f of helpFiles) assert.ok(html.includes(`src="decks/${f}"`), `${f} is not in index.html`);
});

for (const [id, h] of Object.entries(help || {})) {
  test(`help ${id}`, () => {
    assert.ok(byId.has(id), `no card ${id}`);
    for (const k of ['asks', 'steps', 'answer']) assert.ok(h[k] && h[k].length, `missing ${k}`);
    for (const t of texts(h)) {
      assert.equal((String(t).match(/(?<!\\)\$/g) || []).length % 2, 0, `unbalanced $ in: ${t}`);
      for (const m of String(t).matchAll(/(?<!\\)\$(.+?)(?<!\\)\$/g)) assert.doesNotThrow(() => katex.renderToString(m[1], { throwOnError: true }), `KaTeX: ${m[1]}`);
    }
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
