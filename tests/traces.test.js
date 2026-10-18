// Recorded traces (decks/csc370-traces.js, built by tools/record-traces.js with steptrace):
// every code card has one, every line it points at exists, and the card's answer is what
// the run printed, or, when the question asks for a value the program never prints, a
// value the run actually held (so the answer shown at the end is not just restated).
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
require('../js/grade.js');
require('../decks/csc370.js');
require('../decks/csc370-traces.js');
const { decks, traces, grade } = globalThis.FC;
const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const norm = s => grade.normalize(Array.isArray(s) ? s.join(' ') : String(s));

test('the traces and the viewer are loaded by index.html', () => {
  for (const f of ['decks/csc370-traces.js', 'vendor/steptrace/steptrace.js', 'vendor/steptrace/steptrace-interp.js', 'vendor/steptrace/steptrace.css']) assert.ok(html.includes(f), f);
});

test('every runnable CSC 370 code card has a trace', () => {
  const missing = decks.csc370.cards.filter(c => c.code && c.verify && !/^l4-/.test(c.id) && !traces[c.id]).map(c => c.id);
  assert.deepEqual(missing, []);
});

const scalars = t => {
  const out = new Set();
  const walk = v => { if (Array.isArray(v)) v.forEach(walk); else if (v && typeof v === 'object') { if (v.fields) Object.values(v.fields).forEach(walk); if (v.items) v.items.forEach(walk); if ('now' in v) walk(v.now); } else out.add(norm(v)); };
  for (const s of t.steps) for (const f of s.frames || []) Object.values(f.vars || {}).forEach(walk);
  return out;
};

for (const [id, t] of Object.entries(traces)) {
  test(`trace ${id}`, () => {
    const card = decks.csc370.cards.find(c => c.id === id);
    assert.ok(card, 'no such card');
    const n = t.source.split('\n').length;
    assert.ok(t.steps.length >= 3, 'too few steps');
    for (const s of t.steps) for (const k of ['line', 'next']) if (s[k] != null) assert.ok(s[k] >= 1 && s[k] <= n, `${k} ${s[k]} out of 1..${n}`);
    for (const s of t.steps) if (s.note) assert.ok(!/\$|this card|slide \d/i.test(s.note), 'meta chatter in a note');
    assert.ok(!(t.exit && t.exit.error), t.exit && t.exit.error);
    if (t.language === 'manual') return;     // hand traces: tests/trace.test.js
    // The card's own code is in what was run, line for line.
    for (const l of card.code.split('\n').map(x => x.trim()).filter(x => x && !/^\/\*\s*in main/.test(x))) assert.ok(t.source.includes(l), `card line not in the traced program: ${l}`);
    const printed = norm(t.steps.map(s => s.out || '').join(''));
    const want = norm(card.answer);
    const last = t.steps[t.steps.length - 1];
    if (last.result == null) { assert.equal(printed, want); return; }
    assert.equal(norm(last.result), want, 'result differs from the card answer');
    // Supported by the run: printed, or every value in the answer was held by a variable.
    const nums = s => (s.match(/-?\d+/g) || []).join(' ');
    const held = scalars(t);
    const parts = String(card.answer).match(/-?\d+(\.\d+)?/g) || [];
    const ok = printed.includes(want) || (nums(want) && nums(printed).endsWith(nums(want)) && nums(want).split(' ').every(x => printed.includes(x)))
      || (parts.length && parts.every(x => held.has(norm(x))))
      || printed.split(/\n/).some(l => l.trim() === want);
    assert.ok(ok, `the run does not show ${JSON.stringify(card.answer)} (printed ${JSON.stringify(printed.slice(0, 80))})`);
  });
}
