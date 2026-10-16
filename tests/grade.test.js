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
  // Swapped adjacent letters are the most common typo: one edit, not two.
  assert.equal(G.cloze('a metalangauge', 'a metalanguage'), true);
});

test('order: exact sequence only', () => {
  assert.equal(G.order(['a', 'b', 'c'], ['a', 'b', 'c']), true);
  assert.equal(G.order(['a', 'c', 'b'], ['a', 'b', 'c']), false);
  assert.equal(G.order(['a', 'b'], ['a', 'b', 'c']), false);
});

test('edit distance counts an adjacent swap as one edit', () => {
  assert.equal(G.editDistance('kitten', 'sitting'), 3);
  assert.equal(G.editDistance('', 'abc'), 3);
  assert.equal(G.editDistance('ab', 'ba'), 1);
  assert.equal(G.editDistance('recieve', 'receive'), 1);
});

test('typed: verified program output is case-sensitive; other answers (even beside code) are not', () => {
  const trace = { answer: 'Hi 30', code: 'x', verify: { lang: 'python', src: '' } };
  assert.equal(G.typed('hi 30', trace), false);
  assert.equal(G.typed('Hi   30', trace), true);
  assert.equal(G.typed('Identifier', { answer: 'identifier', code: 'for (int i = 0; …' }), true);
  assert.equal(G.typed('turing completeness', { answer: 'Turing completeness' }), true);
});

test('set: any order, comma or newline separated, brackets/spaces ignored, duplicates matter', () => {
  const card = { answer: ['17', '18', '19', '64', '65', '66'] };
  assert.equal(G.set('66, 65, 64, 19, 18, 17', card), true);
  assert.equal(G.set('17\n18\n19\n64\n65\n66', card), true);
  assert.equal(G.set('17, 18, 19, 64, 65', card), false);          // missing one
  assert.equal(G.set('17, 18, 19, 64, 65, 66, 67', card), false);  // extra one
  const paths = { answer: ['N0,N1,N2', 'N1,N2,N1'] };
  assert.equal(G.set('[N1, N2, N1]; [N0, N1, N2]', paths), true);  // ; also separates, brackets/spaces ignored
  assert.equal(G.set('', card), false);
});
