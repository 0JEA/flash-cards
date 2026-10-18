// Hand-written traces (decks/csc370-trace*.js, steptrace FORMAT.md steps): each belongs to a code
// card, every step points at a real line of the card's code, every lookup names a frame that
// exists, and what the trace prints (or its final result) equals the card's verified answer.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
require('../js/grade.js');
require('../decks/csc370.js');
const traceFiles = fs.readdirSync(path.join(__dirname, '../decks')).filter(f => /^csc370-trace(-\w+)?\.js$/.test(f));
for (const f of traceFiles) require('../decks/' + f);
const { decks, trace, grade } = globalThis.FC;
const cards = new Map(decks.csc370.cards.map(c => [c.id, c]));

// These hand traces are not loaded by the page: tools/record-traces.js copies their notes
// onto the recorded traces, and shows the Lisp/Scheme ones (no recorder) as they are.

for (const [id, steps] of Object.entries(trace)) {
  test(`trace ${id}`, () => {
    const card = cards.get(id);
    assert.ok(card, 'no such CSC 370 card');
    assert.ok(card.code, 'card has no code');
    const n = card.code.split('\n').length;
    assert.ok(Array.isArray(steps) && steps.length >= 2, 'needs at least 2 steps');
    steps.forEach((st, k) => {
      const at = `step ${k + 1}`;
      assert.ok(Number.isInteger(st.line) && st.line >= 1 && st.line <= n, `${at}: line ${st.line} not in 1..${n}`);
      assert.ok(card.code.split('\n')[st.line - 1].trim(), `${at}: line ${st.line} is blank`);
      assert.ok(typeof st.note === 'string' && st.note.length > 5 && st.note.length < 260, `${at}: note missing or over 260 chars`);
      assert.ok(!/\$|this card|slide \d/i.test(st.note), `${at}: note has $ or meta chatter`);
      assert.ok(Array.isArray(st.frames) && st.frames.every(f => typeof f.fn === 'string' && f.vars && typeof f.vars === 'object'), `${at}: bad frames`);
      if (st.find) {
        const { name, looked, at: where } = st.find;
        assert.ok(looked.every(i => st.frames[i]) && looked.includes(where), `${at}: find indices`);
        assert.ok(Object.prototype.hasOwnProperty.call(st.frames[where].vars, name), `${at}: ${name} is not in frame ${where}`);
        for (const i of looked.slice(0, looked.indexOf(where))) assert.ok(!Object.prototype.hasOwnProperty.call(st.frames[i].vars, name), `${at}: ${name} IS in skipped frame ${i}`);
      }
      if (k < steps.length - 1) assert.equal(st.result, undefined, `${at}: result only on the last step`);
    });
    const printed = steps.map(s => s.out || '').join('');
    const last = steps[steps.length - 1];
    const want = grade.normalize(Array.isArray(card.answer) ? card.answer.join(' ') : card.answer);
    const got = last.result != null ? last.result : printed;
    assert.equal(grade.normalize(got), want, 'trace output/result differs from the card answer');
  });
}
