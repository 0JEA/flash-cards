// Generated CSC 370 problems (js/gen-csc370.js). For every generator, 300+ seeds:
// fields are valid, make() is deterministic, enough distinct problems, and every answer is
// confirmed by an INDEPENDENT check that does not reuse the generator's solver:
//   scope       static answers run as real Python (python3); dynamic answers run as bash,
//               whose `local` variables are dynamically scoped; static parents from indentation
//   derive      each derivation step re-checked against the grammar text on the card;
//               every "cannot be derived" confirmed by exhaustive leftmost-derivation search
//   ambiguous   parse trees counted by enumerating leftmost derivations
//   c-pointers  a sample of the bank recompiled and run with gcc; diagrams checked by an
//               instrumented gcc run with its own assertions
//   tokens      a separate maximal-munch lexer
// A missing runtime (python3, bash, gcc) fails the test rather than skipping it.
const test = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
require('../js/grade.js');
require('../js/generators.js');
require('../decks/csc370-cpointer-bank.js');
require('../js/gen-csc370.js');
const { gen, grade, cPointerBank } = globalThis.FC;

const N = 300;
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'gen370-'));
const cards = {};
const IDS = ['gen-370-scope', 'gen-370-derive', 'gen-370-ambiguous', 'gen-370-c-pointers', 'gen-370-binding', 'gen-370-tokens'];
for (const id of IDS) cards[id] = Array.from({ length: N }, (_, i) => gen.instance(id, i + 1));
const norm = s => String(s).replace(/\s+/g, ' ').trim();
const tick = s => (s.match(/`([^`]+)`/) || [])[1];

// ─── Generic contract checks ─────────────────────────────────────────────
const META = {
  'gen-370-scope': ['5.2', 'Theory', 'Scope'],
  'gen-370-derive': ['4', 'Theory', 'Grammars & BNF'],
  'gen-370-ambiguous': ['4', 'Theory', 'Grammars & BNF'],
  'gen-370-c-pointers': ['3', 'Programming', 'C & memory'],
  'gen-370-binding': ['5.1', 'Theory', 'Names & binding'],
  'gen-370-tokens': ['4', 'Theory', 'Translation'],
};
for (const id of IDS) {
  test(`${id}: registered for csc370 with its lecture, cat and sub`, () => {
    const g = gen.all().find(x => x.id === id);
    assert.ok(g, 'not registered');
    assert.equal(g.deck, 'csc370');
    assert.deepEqual([g.lecture, g.cat, g.sub], META[id]);
  });
  test(`${id}: ${N} seeds give valid, deterministic, gradeable cards`, () => {
    for (let i = 0; i < N; i++) {
      const c = cards[id][i];
      const again = gen.instance(id, i + 1);
      assert.equal(JSON.stringify(c), JSON.stringify(again), `seed ${i + 1} not deterministic`);
      assert.ok(['typed', 'mc', 'recall', 'set', 'order'].includes(c.type), c.type);
      assert.ok(typeof c.prompt === 'string' && c.prompt.length > 10);
      assert.ok(typeof c.why === 'string' && c.why.length > 10, 'why missing');
      const text = [c.prompt, c.code || '', JSON.stringify(c.answer), c.why, JSON.stringify(c.points || []), JSON.stringify(c.options || [])].join('\n');
      assert.ok(!text.includes('____'), `blank in seed ${i + 1}`);
      assert.ok(!/slide/i.test(text), `"slide" in seed ${i + 1}`);
      if (c.type === 'typed') {
        assert.ok(typeof c.answer === 'string' && c.answer.trim());
        assert.ok(grade.typed(c.answer, c));
        for (const a of c.accept || []) assert.ok(grade.typed(a, c));
      } else if (c.type === 'mc') {
        assert.ok(typeof c.answer === 'string' && c.answer);
        assert.ok(Array.isArray(c.options) && c.options.length >= 1);
        assert.ok(!c.options.includes(c.answer), `answer among wrong options (seed ${i + 1})`);
        assert.equal(new Set(c.options).size, c.options.length, `duplicate options (seed ${i + 1})`);
      } else if (c.type === 'recall') {
        assert.ok(typeof c.answer === 'string' && c.answer);
        assert.ok(Array.isArray(c.points) && c.points.length && c.points.every(p => typeof p === 'string' && p));
      } else if (c.type === 'set') {
        assert.ok(Array.isArray(c.answer) && c.answer.length);
        assert.equal(new Set(c.answer).size, c.answer.length);
        assert.ok(grade.set(c.answer.join(', '), c));
        assert.ok(grade.set(c.answer.slice().reverse().join(', '), c));
      }
    }
  });
  test(`${id}: at least 20 distinct problems`, () => {
    const distinct = new Set(cards[id].map(c => c.prompt + '\n' + (c.code || '')));
    assert.ok(distinct.size >= 20, `only ${distinct.size}`);
  });
}

// ─── Scope: python3 (static) and bash (dynamic) ──────────────────────────
function splitArgs(s) { return s.trim() ? s.split(',').map(x => x.trim()) : []; }
// Translate the Python-like program on the card to bash. bash `local` is dynamically scoped.
function toBash(code) {
  const out = [], open = [];
  for (const line of code.split('\n')) {
    if (!line.trim()) continue;
    const ind = line.match(/^ */)[0].length, t = line.trim();
    while (open.length && ind <= open[open.length - 1]) { open.pop(); out.push('}'); }
    let m;
    if ((m = t.match(/^def (\w+)\(([^)]*)\):$/))) {
      const ps = splitArgs(m[2]);
      out.push(`${m[1]}() {` + (ps.length ? ` local ${ps.map((p, i) => `${p}=$${i + 1}`).join(' ')};` : ' :;'));
      open.push(ind);
    } else if ((m = t.match(/^print\((.*)\)$/))) out.push('echo ' + splitArgs(m[1]).map(a => `$((${a}))`).join(' '));
    else if ((m = t.match(/^(\w+) = (.+)$/))) out.push(`${open.length ? 'local ' : ''}${m[1]}=$((${m[2]}))`);
    else if ((m = t.match(/^(\w+)\((.*)\)$/))) out.push(`${m[1]} ${splitArgs(m[2]).map(a => `$((${a}))`).join(' ')}`);
    else throw new Error(`cannot translate: ${t}`);
  }
  while (open.pop() !== undefined) out.push('}');
  return out.join('\n');
}
function splitRuns(out) {
  const res = new Map(); let cur = null;
  for (const line of out.split('\n')) {
    const m = line.match(/^@@(\d+)$/);
    if (m) { cur = +m[1]; res.set(cur, []); } else if (cur !== null && line.trim()) res.get(cur).push(line.trim());
  }
  return i => (res.get(i) || []).join(' ');
}
const scope = cards['gen-370-scope'];
const staticCards = scope.filter(c => /under STATIC/.test(c.prompt));
const dynamicCards = scope.filter(c => /under DYNAMIC/.test(c.prompt));

test('gen-370-scope: STATIC answers match real Python (python3)', () => {
  assert.ok(staticCards.length >= 60, `only ${staticCards.length} static cards`);
  const data = path.join(tmp, 'scope.json'), drv = path.join(tmp, 'drv.py');
  fs.writeFileSync(data, JSON.stringify(staticCards.map(c => c.code)));
  fs.writeFileSync(drv, 'import json, sys\nfor i, src in enumerate(json.load(open(sys.argv[1]))):\n    print("@@%d" % i)\n    exec(compile(src, "<card>", "exec"), {})\n');
  const get = splitRuns(execFileSync('python3', ['-I', drv, data]).toString());
  staticCards.forEach((c, i) => assert.equal(norm(get(i)), norm(c.answer), `static mismatch:\n${c.code}`));
});

test('gen-370-scope: DYNAMIC answers match bash (dynamic scoping)', () => {
  assert.ok(dynamicCards.length >= 60, `only ${dynamicCards.length} dynamic cards`);
  const sh = path.join(tmp, 'scope.sh');
  fs.writeFileSync(sh, dynamicCards.map((c, i) => `echo @@${i}\n(\n${toBash(c.code)}\n)`).join('\n') + '\n');
  const get = splitRuns(execFileSync('bash', ['--norc', '--noprofile', sh]).toString());
  dynamicCards.forEach((c, i) => assert.equal(norm(get(i)), norm(c.answer), `dynamic mismatch:\n${c.code}\n---\n${toBash(c.code)}`));
});

test('gen-370-scope: most programs print differently under the two rules', () => {
  const both = staticCards.concat(dynamicCards);
  const differ = both.filter(c => !c.why.includes(', the same.)')).length;
  assert.ok(differ / both.length > 0.7, `${differ}/${both.length}`);
});

test('gen-370-scope: static parent / ancestors agree with the indentation', () => {
  const qs = scope.filter(c => /static (parent|ancestors)/.test(c.prompt));
  assert.ok(qs.length >= 20, `only ${qs.length}`);
  for (const c of qs) {
    const defs = [];
    for (const line of c.code.split('\n')) {
      const m = line.match(/^( *)def (\w+)\(/);
      if (m) defs.push({ name: m[2], ind: m[1].length });
    }
    const parentOf = name => {
      const i = defs.findIndex(d => d.name === name);
      for (let j = i - 1; j >= 0; j--) if (defs[j].ind < defs[i].ind) return defs[j].name;
      return 'global';
    };
    const target = c.prompt.match(/(?:parent|ancestors) of (\w+)/)[1];
    if (c.type === 'typed') assert.equal(c.answer, parentOf(target), c.code);
    else {
      const chain = []; let n = target;
      while (n !== 'global') { n = parentOf(n); chain.push(n); }
      assert.deepEqual(c.answer.slice().sort(), chain.sort(), c.code);
    }
  }
});

// ─── Grammars: parse the grammar text on the card; exhaustive search ─────
const TOK = /<[^>]+>|[^\s<>]/g;
const isNT = s => s.length > 2 && s[0] === '<' && s.endsWith('>');
function readGrammar(text) {
  const rules = new Map(); let start = null;
  for (const line of text.split('\n')) {
    const [lhs, rhs] = line.split('→').map(s => s.trim());
    if (!start) start = lhs;
    rules.set(lhs, rhs.split(' | ').map(a => a.match(TOK)));
  }
  return { rules, start };
}
const toks = s => s.match(TOK);
// Number of leftmost derivations of target (= number of parse trees), memoised on the form.
function countDerivations(g, target) {
  const memo = new Map();
  function count(f) {
    if (f.length > target.length) return 0;
    let i = 0;
    while (i < f.length && !isNT(f[i])) { if (f[i] !== target[i]) return 0; i++; }
    if (i === f.length) return f.length === target.length ? 1 : 0;
    const key = f.join('\u0001');
    if (memo.has(key)) return memo.get(key);
    memo.set(key, 0);
    let n = 0;
    for (const alt of g.rules.get(f[i])) n += count(f.slice(0, i).concat(alt, f.slice(i + 1)));
    memo.set(key, n);
    return n;
  }
  return count([g.start]);
}
// Every parse tree (as a bracketing), from the rule sequence of each leftmost derivation.
function allBracketings(g, target) {
  const res = new Set();
  (function dfs(f, seq) {
    if (f.length > target.length) return;
    let i = 0;
    while (i < f.length && !isNT(f[i])) { if (f[i] !== target[i]) return; i++; }
    if (i === f.length) {
      if (f.length !== target.length) return;
      let k = 0;
      const build = sym => (isNT(sym) ? seq[k++].map(build) : sym);
      const br = n => (typeof n === 'string' ? n : n.length === 1 ? br(n[0]) : `(${n.map(br).join(' ')})`);
      res.add(br(build(g.start)));
      return;
    }
    for (const alt of g.rules.get(f[i])) dfs(f.slice(0, i).concat(alt, f.slice(i + 1)), seq.concat([alt]));
  })([g.start], []);
  return res;
}
function checkDerivation(g, forms, target) {
  const fs_ = forms.map(toks);
  assert.deepEqual(fs_[0], [g.start], 'derivation must start at the start symbol');
  for (let k = 1; k < fs_.length; k++) {
    const prev = fs_[k - 1], next = fs_[k];
    const i = prev.findIndex(isNT);
    assert.ok(i >= 0, 'step after a sentence');
    const ok = g.rules.get(prev[i]).some(alt => JSON.stringify(prev.slice(0, i).concat(alt, prev.slice(i + 1))) === JSON.stringify(next));
    assert.ok(ok, `step ${k} does not apply one rule to the leftmost nonterminal: ${forms[k - 1]} => ${forms[k]}`);
  }
  assert.deepEqual(fs_[fs_.length - 1], target, 'derivation does not end at the string');
}

test('gen-370-derive: every derivation is valid and every "no" is truly underivable', () => {
  let derivs = 0, nos = 0, yeses = 0;
  for (const c of cards['gen-370-derive']) {
    const g = readGrammar(c.code);
    const target = toks(tick(c.prompt));
    assert.ok(/start symbol is </.test(c.prompt) && c.prompt.includes(`start symbol is ${g.start}`));
    if (c.type === 'recall' && /write the leftmost derivation of/.test(c.prompt)) {
      checkDerivation(g, c.points, target); derivs++;
    } else if (c.type === 'recall') {
      if (c.points[0] === 'Yes') { checkDerivation(g, c.points.slice(1), target); yeses++; }
      else { assert.equal(c.points[0], 'No'); assert.equal(countDerivations(g, target), 0, `derivable: ${tick(c.prompt)}`); nos++; }
    } else {
      const can = countDerivations(g, target) > 0;
      assert.equal(c.answer === 'Yes', can, `${tick(c.prompt)} with\n${c.code}`);
      if (!can) { assert.ok(c.answer.startsWith('No: ')); nos++; } else yeses++;
      if (can) assert.ok(c.options.every(o => o.startsWith('No: ')));
    }
  }
  assert.ok(derivs >= 50 && nos >= 50 && yeses >= 50, `${derivs} derivations, ${nos} no, ${yeses} yes`);
});

test('gen-370-derive: covers all four grammar families', () => {
  const starts = new Set(cards['gen-370-derive'].map(c => readGrammar(c.code).start));
  for (const s of ['<program>', '<ident>']) assert.ok(starts.has(s), s);
  assert.ok([...starts].some(s => ['<GPA>', '<rating>', '<score>', '<mark>'].includes(s)));
  assert.ok([...starts].some(s => ['<bin>', '<binary>', '<num>', '<count>', '<value>'].includes(s)));
});

test('gen-370-ambiguous: answers agree with parse trees counted by derivation enumeration', () => {
  const seen = { isamb: 0, witness: 0, group: 0, mcgroup: 0 };
  for (const c of cards['gen-370-ambiguous']) {
    const g = readGrammar(c.code);
    const terms = [...new Set([...g.rules.values()].flat(2).filter(s => !isNT(s)))];
    const constNT = [...g.rules.keys()].find(k => k === '<const>' || k === '<id>');
    const k0 = g.rules.get(constNT)[0][0];
    const ops = terms.filter(t => !g.rules.get(constNT).some(a => a[0] === t));
    if (c.prompt === 'Is this grammar ambiguous?') {
      // Constants are interchangeable, so one constant and every operator sequence (1–4 ops) suffices.
      let amb = false;
      const rec = s => { if (amb) return; if (s.length > 1 && countDerivations(g, s) >= 2) { amb = true; return; } if (s.length < 9) for (const o of ops) rec(s.concat(o, k0)); };
      rec([k0]);
      assert.equal(c.answer, amb ? 'Yes' : 'No', c.code);
      seen.isamb++;
    } else if (c.type === 'recall') {
      const s = toks(c.points[0].replace(/^.*e\.g\. /, ''));
      const br = allBracketings(g, s);
      assert.ok(countDerivations(g, s) >= 2);
      const g1 = c.points[1].replace('grouping 1: ', ''), g2 = c.points[2].replace('grouping 2: ', '');
      assert.notEqual(g1, g2);
      assert.ok(br.has(g1) && br.has(g2), `${g1} / ${g2} not trees of ${c.points[0]}`);
      seen.witness++;
    } else if (c.type === 'typed') {
      const s = toks(tick(c.prompt));
      assert.equal(countDerivations(g, s), 1, 'grouping asked on an ambiguous sentence');
      assert.equal(c.answer, [...allBracketings(g, s)][0]);
      seen.group++;
    } else {
      const s = toks(tick(c.prompt));
      const br = allBracketings(g, s);
      assert.ok(br.size >= 1);
      if (br.size >= 2) assert.ok(c.answer.startsWith('Either'), c.code);
      else assert.equal(c.answer, [...br][0]);
      seen.mcgroup++;
    }
  }
  for (const [k, v] of Object.entries(seen)) assert.ok(v >= 25, `${k}: only ${v}`);
});

// ─── C bank: gcc ─────────────────────────────────────────────────────────
function runC(code, name) {
  const f = path.join(tmp, name + '.c');
  fs.writeFileSync(f, code + '\n');
  execFileSync('gcc', ['-std=c99', '-w', '-o', f + '.out', f]);
  return execFileSync(f + '.out', { timeout: 5000 }).toString();
}

test('C pointer bank: about 200 distinct programs, most with memory diagrams', () => {
  assert.ok(Array.isArray(cPointerBank) && cPointerBank.length >= 150, `${cPointerBank && cPointerBank.length}`);
  assert.equal(new Set(cPointerBank.map(e => e.code)).size, cPointerBank.length);
  assert.ok(cPointerBank.filter(e => e.diagram).length >= 100);
  for (const e of cPointerBank) assert.ok(e.code.includes('int main()') && e.answer && e.why);
});

test('C pointer bank: a sample of outputs re-verified with gcc', () => {
  const sample = cPointerBank.filter((_, i) => i % 7 === 3);
  assert.ok(sample.length >= 25);
  sample.forEach((e, i) => assert.equal(norm(runC(e.code, `out${i}`)), norm(e.answer), e.code));
});

test('C pointer bank: a sample of memory diagrams re-verified with gcc, listing every main variable', () => {
  const sample = cPointerBank.filter(e => e.diagram).filter((_, i) => i % 9 === 4);
  assert.ok(sample.length >= 20);
  sample.forEach((e, n) => {
    const lines = e.code.split('\n');
    const mainAt = lines.indexOf('int main() {');
    const declared = lines.slice(mainAt + 1, e.diagram.line + 1)
      .map(l => l.match(/^\s*(?:int|char)\s+\**(\w+)/)).filter(Boolean).map(m => m[1]);
    const names = e.diagram.vars.map(v => v.match(/^(\w+)/)[1]);
    assert.deepEqual(names.slice().sort(), declared.slice().sort(), `diagram vars vs declarations:\n${e.code}`);
    const checks = e.diagram.vars.map(v => {
      let m;
      const bad = `printf("BAD ${v.replace(/"/g, '\\"')}\\n");`;
      if ((m = v.match(/^(\w+) = (-?\d+)$/))) return `if (${m[1]} != ${m[2]}) ${bad}`;
      if ((m = v.match(/^(\w+) = \{(.*)\}$/))) return m[2].split(', ').map((x, i) => `if (${m[1]}[${i}] != ${x}) ${bad}`).join(' ');
      if ((m = v.match(/^(\w+) = "(.*)"$/))) return `{ const char *e_ = "${m[2]}"; int i_ = 0; while (e_[i_] && ${m[1]}[i_] == e_[i_]) i_++; if (e_[i_] != ${m[1]}[i_]) ${bad} }`;
      if ((m = v.match(/^(\w+) → (\w+)\[(\d+)\]$/))) return `if ((void *)${m[1]} != (void *)&${m[2]}[${m[3]}]) ${bad}`;
      if ((m = v.match(/^(\w+) → (\w+)$/))) return `if ((void *)${m[1]} != (void *)&${m[2]}) ${bad}`;
      throw new Error(`unparsed diagram entry ${v}`);
    });
    lines.splice(e.diagram.line + 1, 0, ...checks, 'printf("CHECKED\\n");');
    const out = runC(lines.join('\n'), `diag${n}`);
    assert.ok(out.includes('CHECKED') && !out.includes('BAD'), `${out}\n${e.code}`);
  });
});

test('gen-370-c-pointers: cards come from the bank (output and memory-diagram variants)', () => {
  const byCode = new Map(cPointerBank.map(e => [e.code, e]));
  let out = 0, diag = 0;
  for (const c of cards['gen-370-c-pointers']) {
    if (c.type === 'typed') { assert.equal(byCode.get(c.code).answer, c.answer); out++; }
    else {
      assert.equal(c.code.split('// HERE').length, 2);
      const e = byCode.get(c.code.replace('   // HERE', ''));
      assert.deepEqual(c.points, e.diagram.vars);
      assert.ok(c.code.split('\n')[e.diagram.line].endsWith('// HERE'));
      diag++;
    }
  }
  assert.ok(out >= 100 && diag >= 50, `${out} output, ${diag} diagram`);
  assert.ok(new Set(cards['gen-370-c-pointers'].map(c => c.code)).size >= 120);
});

// ─── Binding: a second, hand-written key (Sebesta §5.4; lecture 5.1/5.2) ──
test('gen-370-binding: every answer matches the hand-written key', () => {
  const key = [
    [/the type of \w+ bound/, 'Compile time'],
    [/set of possible values/, 'Language implementation time'],
    [/meaning of the . in this statement/, 'Compile time'],
    [/internal representation of the literal/, 'Language implementation time'],
    [/the value of \w+ bound/, 'Run time'],
    [/standing for \w+ at all/, 'Language design time'],
    [/^C\. .*the \d+ ints that/, 'Explicit heap-dynamic'],
    [/^C\. .*the pointer variable/, 'Stack-dynamic'],
    [/^C\. .*\(the parameter\)/, 'Stack-dynamic'],
    [/^Java\. .*the Point object/, 'Explicit heap-dynamic'],
    [/^Python\. .*the list/, 'Implicit heap-dynamic'],
    [/^JavaScript\. .*the string/, 'Implicit heap-dynamic'],
  ];
  const storageByCode = [[/at file scope/, 'Static'], [/static int/, 'Static'], [/^void \w+\(void\) \{\n {4}int \w+ = \d+;/, 'Stack-dynamic']];
  const seenAnswers = new Set();
  for (const c of cards['gen-370-binding']) {
    let hit = key.find(([re]) => re.test(c.prompt));
    if (!hit && c.code) hit = storageByCode.find(([re]) => re.test(c.code));
    assert.ok(hit, `no key for: ${c.prompt}\n${c.code || ''}`);
    assert.equal(c.answer, hit[1], c.prompt);
    seenAnswers.add(c.answer);
  }
  assert.ok(seenAnswers.size >= 8, [...seenAnswers].join(', '));
});

// ─── Tokens: an independent maximal-munch lexer ──────────────────────────
const LEX = /\s*("(?:[^"\\]|\\.)*"|\d+\.\d+|\d+|[A-Za-z_]\w*|\+\+|--|\+=|-=|\*=|\/=|<=|>=|==|!=|[-+*/%<>=(){};,])/y;
const RESERVED = new Set(['int', 'double', 'char', 'float', 'while', 'if', 'else', 'for', 'return', 'void', 'do']);
function lex(s) {
  const out = []; LEX.lastIndex = 0;
  while (LEX.lastIndex < s.trimEnd().length) {
    const m = LEX.exec(s);
    if (!m) throw new Error(`cannot lex ${s} at ${LEX.lastIndex}`);
    out.push(m[1]);
  }
  return out;
}
function category(x) {
  if (x.startsWith('"')) return 'string literal';
  if (/^\d+\.\d+$/.test(x)) return 'floating-point literal';
  if (/^\d+$/.test(x)) return 'integer literal';
  if (/^[A-Za-z_]/.test(x)) return RESERVED.has(x) ? 'reserved word' : 'identifier';
  if (['++', '--'].includes(x)) return 'increment/decrement operator';
  if (['=', '+=', '-=', '*=', '/='].includes(x)) return 'assignment operator';
  if (['<', '<=', '>', '>=', '==', '!='].includes(x)) return 'relational operator';
  if (['+', '-', '*', '/', '%'].includes(x)) return 'arithmetic operator';
  return 'punctuation (bracket, brace, semicolon, comma)';
}
test('gen-370-tokens: counts and categories agree with an independent lexer', () => {
  const kinds = { mc: 0, typed: 0, recall: 0 };
  for (const c of cards['gen-370-tokens']) {
    const lx = lex(c.code);
    if (c.type === 'typed') assert.equal(c.answer, String(lx.length), c.code);
    else if (c.type === 'mc') {
      const t = tick(c.prompt);
      assert.ok(lx.includes(t), `${t} is not a lexeme of ${c.code}`);
      assert.equal(c.answer, category(t), `${t} in ${c.code}`);
    } else assert.deepEqual(c.points, lx.map(x => `${x}: ${category(x)}`));
    kinds[c.type]++;
  }
  for (const [k, v] of Object.entries(kinds)) assert.ok(v >= 30, `${k}: ${v}`);
});

// ─── Build-the-parse-tree: checked against the grammar text on the card ─────
test('gen-370-parsetree: every node uses a rule of the card\'s grammar, leaves spell the string, and it is the only parse tree', () => {
  require('../js/tree.js');
  for (let seed = 1; seed <= N; seed++) {
    const c = gen.instance('gen-370-parsetree', seed);
    const where = `seed ${seed}`;
    assert.equal(c.type, 'tree', where);
    const g = readGrammar(c.code);
    const target = toks(c.prompt.match(/`([^`]*)`/)[1]);
    assert.equal(c.answer.label, g.start, `${where}: root is the start symbol`);
    const leaves = [];
    (function walk(t) {
      if (!t.kids.length) { assert.ok(!isNT(t.label), `${where}: leaf ${t.label} is a nonterminal`); leaves.push(t.label); return; }
      const rhs = t.kids.map(k => k.label);
      assert.ok((g.rules.get(t.label) || []).some(alt => alt.join(' ') === rhs.join(' ')), `${where}: ${t.label} → ${rhs.join(' ')} is not a rule`);
      t.kids.forEach(walk);
    })(c.answer);
    assert.deepEqual(leaves, target, `${where}: leaves spell the string`);
    assert.equal(countDerivations(g, target), 1, `${where}: exactly one parse tree`);
    const ok = new Set([c.start].concat(c.palette));
    (function walk(t) { assert.ok(ok.has(t.label), `${where}: ${t.label} not offered`); t.kids.forEach(walk); })(c.answer);
  }
});
