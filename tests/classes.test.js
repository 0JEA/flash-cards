// Every class: unique card ids across classes, a topic on every card, and the same
// item-writing rules as CSC 370 (no none/all-of-the-above, no slide-position prompts).
const test = require('node:test');
const assert = require('node:assert/strict');
// Every deck file index.html loads (a missing file fails: a skipped deck would look verified).
for (const f of ['csc370', 'csc370-topics', 'softtest-a', 'softtest-b', 'softtest-c', 'softtest', 'ethics', 'csc310-a', 'csc310-b', 'csc310']) require('../decks/' + f + '.js');
const { decks, topics } = globalThis.FC;

test('card ids are unique across all classes', () => {
  const seen = new Map();
  for (const d of Object.values(decks)) for (const c of d.cards) {
    assert.ok(!seen.has(c.id), `${c.id} is in both ${seen.get(c.id)} and ${d.id}`);
    seen.set(c.id, d.id);
  }
});

test('every CSC 370 card lands in a named topic (none fall into "Other")', () => {
  const other = decks.csc370.cards.filter(c => topics.csc370(c).sub === 'Other').map(c => c.id);
  assert.deepEqual(other, []);
});

test('every card in the other classes carries its own topic', () => {
  for (const d of Object.values(decks).filter(d => d.id !== 'csc370')) {
    for (const c of d.cards) assert.ok(c.cat && c.sub, `${d.id}/${c.id} has no cat/sub`);
    for (const c of d.cards) if (d.catOrder) assert.ok(d.catOrder.includes(c.cat), `${d.id}/${c.id}: unknown cat ${c.cat}`);
  }
});

test('Software Testing cards: fields per type, plausible MC, no slide-position prompts', () => {
  if (!decks.softtest) return;
  const lectures = new Set(decks.softtest.lectures.map(l => l.n));
  for (const c of decks.softtest.cards) {
    assert.ok(lectures.has(c.lecture), `${c.id}: lecture ${c.lecture}`);
    assert.ok(c.prompt && c.source && typeof c.why === 'string', `${c.id}: fields`);
    if (c.type === 'recall') assert.ok(c.answer && c.points && c.points.length, `${c.id}: recall`);
    if (c.type === 'mc') {
      assert.ok(c.options.length >= 2 && c.options.length <= 3 && !c.options.includes(c.answer), `${c.id}: mc`);
      for (const o of c.options.concat(c.answer)) assert.ok(!/(none|all) of the above/i.test(o), `${c.id}: none/all of the above`);
    }
    if (c.type === 'order') assert.ok(Array.isArray(c.answer) && c.answer.length >= 3, `${c.id}: order`);
    assert.ok(!/slide \d|the (first|second|third) (point|bullet)/i.test(c.prompt), `${c.id}: positional prompt`);
  }
});

test('answer modes: mode is quick|write on recall cards; noRecall only on mc', () => {
  for (const d of Object.values(decks)) for (const c of d.cards) {
    if (c.mode != null) assert.ok(c.type === 'recall' && ['quick', 'write'].includes(c.mode), `${d.id}/${c.id}: mode`);
    if (c.noRecall != null) assert.ok(c.type === 'mc' && c.noRecall === true, `${d.id}/${c.id}: noRecall`);
    if (c.type === 'recall' && c.mode === 'quick') assert.ok(!c.points || c.points.length <= 2, `${d.id}/${c.id}: a quick card has one idea`);
  }
});
