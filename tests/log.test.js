const test = require('node:test');
const assert = require('node:assert/strict');
require('../js/log.js');
const { log } = globalThis.FC;

test('two tabs: saving a stale in-memory log keeps the other tab\'s events', () => {
  const tabA = log.load(), tabB = log.load();      // both start empty from the same store
  log.append(tabA, { k: 'r', c: 'x', ok: 1, s: 1 });
  log.append(tabB, { k: 'r', c: 'y', ok: 1, s: 1 });  // B never saw A's event
  const stored = log.load().map(e => e.c).sort();
  assert.deepEqual(stored, ['x', 'y']);
  assert.deepEqual(tabB.map(e => e.c).sort(), ['x', 'y']); // and B now has it in memory
});
