const test = require('node:test');
const assert = require('node:assert/strict');
require('../js/grade.js');
const G = globalThis.FC.grade;

test('typed: whitespace, newlines, case and smart quotes do not matter', () => {
  const card = { answer: 'In g, x is: 13\nIn h, x is: 55', accept: [] };
  assert.equal(G.typed('in g, x is: 13   in h, x is: 55', card), true);
  assert.equal(G.typed('  In g, x is: 13\n\nIn h, x is: 55 \n', card), true);
  assert.equal(G.typed('In g, x is: 13 In h, x is: 56', card), false);
  assert.equal(G.typed('‘a’', { answer: "'a'" }), true);
});

test('typed: any accepted alternative matches; a trailing period is ignored', () => {
  const card = { answer: 'Turing completeness', accept: ['Turing complete'] };
  assert.equal(G.typed('turing complete.', card), true);
  assert.equal(G.typed('Turing', card), false);
});

test('typed: empty answers never match', () => {
  assert.equal(G.typed('   ', { answer: '' }), false);
});

test('cloze: tolerates a small typo on longer answers, exact on short ones', () => {
  assert.equal(G.cloze('recursion', 'recursion'), true);
  assert.equal(G.cloze('recusion', 'recursion'), true);      // 1 edit, 9 chars
  assert.equal(G.cloze('iteration', 'recursion'), false);
  assert.equal(G.cloze('6', '6'), true);
  assert.equal(G.cloze('5', '6'), false);                    // short: exact only
  assert.equal(G.cloze('IBM', 'ibm'), true);
});

test('order: exact sequence only', () => {
  assert.equal(G.order(['a', 'b', 'c'], ['a', 'b', 'c']), true);
  assert.equal(G.order(['a', 'c', 'b'], ['a', 'b', 'c']), false);
  assert.equal(G.order(['a', 'b'], ['a', 'b', 'c']), false);
});

test('levenshtein', () => {
  assert.equal(G.levenshtein('kitten', 'sitting'), 3);
  assert.equal(G.levenshtein('', 'abc'), 3);
});
