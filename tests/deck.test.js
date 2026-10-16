// Deck integrity, including the item-writing rules from research/02 (length cue,
// option count, no "none/all of the above").
const test = require('node:test');
const assert = require('node:assert/strict');
require('../decks/csc370.js');
const deck = globalThis.FC.decks.csc370;
const lectures = new Set(deck.lectures.map(l => l.n));

test('card ids are unique and every card has the fields its type needs', () => {
  const ids = new Set();
  for (const c of deck.cards) {
    assert.ok(!ids.has(c.id), `duplicate id ${c.id}`); ids.add(c.id);
    assert.ok(lectures.has(c.lecture), `${c.id}: unknown lecture ${c.lecture}`);
    assert.ok(c.prompt && c.source, `${c.id}: prompt and source are required`);
    assert.ok(typeof c.why === 'string', `${c.id}: why must be a string (may be empty)`);
    if (c.type === 'recall') assert.ok(c.answer && c.points && c.points.length, `${c.id}: recall needs answer + points`);
    else if (c.type === 'typed') assert.ok(typeof c.answer === 'string' && c.answer, `${c.id}: typed needs answer`);
    else if (c.type === 'mc') assert.ok(c.options && c.options.length >= 1 && c.options.length <= 3, `${c.id}: mc needs 1-3 wrong options (2-4 total)`);
    else if (c.type === 'order') assert.ok(Array.isArray(c.answer) && c.answer.length >= 3 && new Set(c.answer).size === c.answer.length, `${c.id}: order needs 3+ distinct tiles`);
    else assert.fail(`${c.id}: unknown type ${c.type}`);
  }
});

test('mc: the correct option is not among the wrong ones, and no none/all-of-the-above', () => {
  for (const c of deck.cards.filter(c => c.type === 'mc')) {
    assert.ok(!c.options.includes(c.answer), c.id);
    for (const o of c.options.concat(c.answer)) assert.ok(!/(none|all) of the above/i.test(o), c.id);
  }
});

test('mc: the correct option is strictly the longest in at most 30% of items (research/02, item 1)', () => {
  const mc = deck.cards.filter(c => c.type === 'mc');
  const longest = mc.filter(c => c.options.every(o => c.answer.length > o.length));
  assert.ok(longest.length / mc.length <= 0.3, `${longest.length}/${mc.length}: ${longest.map(c => c.id).join(', ')}`);
  // ...and fixing that must not flip it into a "pick the shortest" cue.
  const shortest = mc.filter(c => c.options.every(o => c.answer.length < o.length));
  assert.ok(shortest.length / mc.length <= 0.3, `${shortest.length}/${mc.length}: ${shortest.map(c => c.id).join(', ')}`);
});

test('typed: no accepted alternative duplicates the answer', () => {
  for (const c of deck.cards.filter(c => c.type === 'typed')) {
    for (const a of c.accept || []) assert.notEqual(a.trim().toLowerCase(), c.answer.trim().toLowerCase(), c.id);
  }
});

test('blanks: unique ids, a known lecture, exactly one ____ each', () => {
  const ids = new Set();
  for (const b of deck.blanks) {
    assert.ok(!ids.has(b.id), `duplicate blank ${b.id} (${b.prompt})`); ids.add(b.id);
    assert.ok(lectures.has(b.lecture), b.id);
    assert.equal((b.prompt.match(/____/g) || []).length, 1, `${b.id}: ${b.prompt}`);
  }
});
