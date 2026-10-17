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

test('heapTree: node i has children 2i and 2i+1, ids and index notes are 1-based', () => {
  const t = T.heapTree([16, 14, 10, 8, 7]);
  assert.equal(t.id, 1); assert.equal(t.label, '16');
  assert.deepEqual(t.kids.map(k => k.id), [2, 3]);
  assert.deepEqual(t.kids[0].kids.map(k => [k.id, k.label]), [[4, '8'], [5, '7']]);
  assert.equal(t.kids[1].kids.length, 0);
});
test('fill: blanks are graded against their answers; filledTree restores every label', () => {
  const t = T.heapTree([16, 14, 10, 8, 7], 5, [2, 5]);
  const paths = T.layout(t).nodes.filter(n => n.t.blank).map(n => n.path);
  assert.deepEqual(paths, ['0.0', '0.0.1']);
  assert.equal(T.fillMistakes(t, { '0.0': '14', '0.0.1': ' 7 ' }).size, 0);
  assert.deepEqual([...T.fillMistakes(t, { '0.0': '14', '0.0.1': '8' })], ['0.0.1']);
  assert.deepEqual([...T.fillMistakes(t, { '0.0': '14' })], ['0.0.1']);
  assert.ok(T.equal(T.filledTree(t), T.heapTree([16, 14, 10, 8, 7])));
});
