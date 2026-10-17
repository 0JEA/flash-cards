// Tree answers: layout, grading by node-by-node comparison, and outline parsing.
const test = require('node:test');
const assert = require('node:assert/strict');
require('../js/tree.js');
const T = globalThis.FC.tree;
const n = (label, ...kids) => ({ label, kids });
const ans = n('<expr>', n('<term>', n('a')), n('+'), n('<expr>', n('<term>', n('b'))));

test('equal: same labels and shape; spacing, case and $ do not matter', () => {
  assert.ok(T.equal(n('<expr>', n('<term>', n(' a ')), n('+'), n('<EXPR>', n('<term>', n('$b$')))), ans));
});
test('diff: a wrong label is marked at its path', () => {
  const d = T.diff(n('<expr>', n('<term>', n('a')), n('*'), n('<expr>', n('<term>', n('b')))), ans);
  assert.deepEqual([...d.wrong], ['0.1']); assert.equal(d.same, false);
});
test('diff: missing and extra children are both caught', () => {
  assert.deepEqual(T.diff(n('<expr>', n('<term>', n('a')), n('+')), ans).missing, ['0.2']);
  const extra = T.diff(n('<expr>', n('<term>', n('a')), n('+'), n('<expr>', n('<term>', n('b'))), n('c')), ans);
  assert.ok(extra.wrong.has('0.3'));
});
test('diff: child order matters (a parse tree is ordered)', () => {
  assert.equal(T.equal(n('<expr>', n('+'), n('<term>', n('a')), n('<expr>', n('<term>', n('b')))), ans), false);
});
test('layout: leaves take consecutive slots, parents centre over their children', () => {
  const { nodes, width, depth } = T.layout(ans);
  assert.equal(width, 3); assert.equal(depth, 4);
  const root = nodes.find(x => x.path === '0');
  assert.equal(root.x, (nodes.find(x => x.path === '0.0').x + nodes.find(x => x.path === '0.2').x) / 2);
});
test('fromOutline: indentation gives the shape', () => {
  assert.ok(T.equal(T.fromOutline('<expr>\n  <term>\n    a\n  +\n  <expr>\n    <term>\n      b'), ans));
});
