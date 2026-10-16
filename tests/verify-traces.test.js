// Every card with `verify` must print exactly its `answer` (whitespace-normalised).
// Runtimes: python3, gcc, node, bash, guile, ecl. A missing runtime fails the test
// rather than skipping it: an unverified trace answer must not look verified.
const test = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
require('../js/grade.js');
require('../decks/csc370.js');
const { grade, decks } = globalThis.FC;

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fc-traces-'));
const run = {
  python: f => execFileSync('python3', ['-I', f]),
  node: f => execFileSync('node', [f]),
  bash: f => execFileSync('bash', ['--norc', '--noprofile', f]),
  guile: f => execFileSync('guile', ['--no-auto-compile', '-s', f], { stdio: ['ignore', 'pipe', 'ignore'] }),
  ecl: f => execFileSync('ecl', ['--norc', '--shell', f]),
  c: f => { execFileSync('gcc', ['-w', '-o', f + '.out', f]); return execFileSync(f + '.out'); },
};
const ext = { python: '.py', node: '.js', bash: '.sh', guile: '.scm', ecl: '.lisp', c: '.c' };

for (const card of decks.csc370.cards.filter(c => c.verify)) {
  test(`${card.id} (${card.verify.lang}) prints its answer`, () => {
    const file = path.join(dir, card.id + ext[card.verify.lang]);
    fs.writeFileSync(file, card.verify.src + '\n');
    let out = run[card.verify.lang](file).toString();
    if (card.verify.pick === 'last') out = out.trim().split('\n').pop();
    assert.equal(grade.normalize(out), grade.normalize(card.answer));
  });
}
