// Sync against an in-memory fake of the GitHub contents API (list, raw read, PUT with SHA check).
const test = require('node:test');
const assert = require('node:assert/strict');
require('../js/log.js');
require('../js/sync.js');
const { log, sync: Sync } = globalThis.FC;

function fakeGitHub() {
  const files = new Map(); // path -> { text, sha }
  let shaN = 0, puts = 0, interfere = null;
  const json = (status, body) => ({ status, ok: status < 300, json: async () => body, text: async () => JSON.stringify(body) });
  async function fetch(url, opts = {}) {
    const u = new URL(url);
    const path = decodeURIComponent(u.pathname.replace('/repos/0JEA/flash-cards/contents/', ''));
    if (opts.headers.Authorization !== 'Bearer good') return json(401, {});
    if ((opts.method || 'GET') === 'GET') {
      if (path === 'log') {
        const list = [...files].filter(([p]) => p.startsWith('log/')).map(([p, f]) => ({ name: p.slice(4), sha: f.sha }));
        return list.length ? json(200, list) : json(404, {});
      }
      const f = files.get(path);
      if (!f) return json(404, {});
      return { status: 200, ok: true, text: async () => f.text };
    }
    // PUT
    const body = JSON.parse(opts.body);
    if (interfere) { const fn = interfere; interfere = null; fn(); }
    const cur = files.get(path);
    if (cur && body.sha !== cur.sha) return json(409, {});
    if (!cur && body.sha) return json(422, {});
    puts++;
    const sha = 'sha' + (++shaN);
    files.set(path, { text: Buffer.from(body.content, 'base64').toString('utf8'), sha });
    return json(200, { content: { sha } });
  }
  return { fetch, files, get puts() { return puts; }, interfereOnce(fn) { interfere = fn; } };
}

function memStore() { const m = new Map(); return { getItem: k => m.get(k) ?? null, setItem: (k, v) => m.set(k, v), removeItem: k => m.delete(k) }; }
const ev = (i, t, extra = {}) => ({ i, t, k: 'r', c: 'card', ok: 1, s: 1, d: 'x', ...extra });
const OCT = Date.UTC(2026, 9, 10), NOV = Date.UTC(2026, 10, 2);

test('first sync writes one file per month; a second sync with nothing new writes nothing', async () => {
  const gh = fakeGitHub();
  const a = Sync.create({ token: 'good', fetch: gh.fetch, store: memStore() });
  const out = await a.sync([ev('1', OCT), ev('2', NOV)]);
  assert.equal(out.length, 2);
  assert.deepEqual([...gh.files.keys()].sort(), ['log/2026-10.jsonl', 'log/2026-11.jsonl']);
  const puts = gh.puts;
  await a.sync(out);
  assert.equal(gh.puts, puts);
});

test('two devices converge on the union of their events', async () => {
  const gh = fakeGitHub();
  const phone = Sync.create({ token: 'good', fetch: gh.fetch, store: memStore() });
  const laptop = Sync.create({ token: 'good', fetch: gh.fetch, store: memStore() });
  let p = await phone.sync([ev('p1', OCT), ev('p2', OCT + 1000)]);
  let l = await laptop.sync([ev('l1', OCT + 500)]);
  assert.deepEqual(l.map(e => e.i), ['p1', 'l1', 'p2']);
  p = await phone.sync(p.concat([ev('p3', OCT + 2000)]));
  assert.deepEqual(p.map(e => e.i), ['p1', 'l1', 'p2', 'p3']);
  l = await laptop.sync(l);
  assert.deepEqual(l.map(e => e.i), ['p1', 'l1', 'p2', 'p3']);
  assert.equal(log.fromJSONL(gh.files.get('log/2026-10.jsonl').text).length, 4);
});

test('a write that races another device re-reads, merges and retries without losing either side', async () => {
  const gh = fakeGitHub();
  const phone = Sync.create({ token: 'good', fetch: gh.fetch, store: memStore() });
  const laptop = Sync.create({ token: 'good', fetch: gh.fetch, store: memStore() });
  await laptop.sync([ev('l1', OCT)]);
  // While the phone is about to PUT, the laptop sneaks in a write.
  gh.interfereOnce(() => { gh.files.set('log/2026-10.jsonl', { text: log.toJSONL([ev('l1', OCT), ev('l2', OCT + 5)]), sha: 'sneaky' }); });
  const p = await phone.sync([ev('p1', OCT + 10)]);
  assert.deepEqual(p.map(e => e.i), ['l1', 'l2', 'p1']);
  assert.deepEqual(log.fromJSONL(gh.files.get('log/2026-10.jsonl').text).map(e => e.i), ['l1', 'l2', 'p1']);
});

test('a bad token surfaces a 401 SyncError', async () => {
  const gh = fakeGitHub();
  const s = Sync.create({ token: 'bad', fetch: gh.fetch, store: memStore() });
  await assert.rejects(s.sync([ev('1', OCT)]), e => e instanceof Sync.SyncError && e.status === 401);
});

test('non-ASCII text survives the base64 round trip', async () => {
  const gh = fakeGitHub();
  const s = Sync.create({ token: 'good', fetch: gh.fetch, store: memStore() });
  await s.sync([{ i: 'b1', t: OCT, k: 'b', b: 'x', v: 'Zuse’s Plankalkül → “ok”', d: 'x' }]);
  assert.equal(log.fromJSONL(gh.files.get('log/2026-10.jsonl').text)[0].v, 'Zuse’s Plankalkül → “ok”');
});

test('one device alone: events added after a sync are uploaded on the next sync', async () => {
  const gh = fakeGitHub();
  const a = Sync.create({ token: 'good', fetch: gh.fetch, store: memStore() });
  let out = await a.sync([ev('1', OCT)]);
  out = await a.sync(out.concat([ev('2', OCT + 1)]));   // remote unchanged since our last write
  assert.deepEqual(log.fromJSONL(gh.files.get('log/2026-10.jsonl').text).map(e => e.i), ['1', '2']);
});
