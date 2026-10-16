// Sync the event log through the GitHub contents API: branch `progress` of the app's
// own repo, one JSONL file per month (log/YYYY-MM.jsonl). Merge is a set union by
// event id (see log.js), so devices never conflict; a stale SHA just means re-read
// and retry.
(function (FC) {
  'use strict';

  const REPO = { owner: '0JEA', repo: 'flash-cards', branch: 'progress', dir: 'log' };
  const CACHE_KEY = 'fc.sync';

  function b64encode(str) {
    const bytes = new TextEncoder().encode(str);
    let bin = '';
    for (let i = 0; i < bytes.length; i += 0x8000) {
      bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    }
    return btoa(bin);
  }

  class SyncError extends Error {
    constructor(message, status) { super(message); this.status = status; }
  }

  function create({ token, fetch = globalThis.fetch.bind(globalThis), store, repo = REPO }) {
    const api = `https://api.github.com/repos/${repo.owner}/${repo.repo}/contents`;
    const cacheStore = store || FC.log._store();

    function cache() {
      try { return JSON.parse(cacheStore.getItem(CACHE_KEY)) || { months: {} }; }
      catch (e) { return { months: {} }; }
    }
    function saveCache(c) { cacheStore.setItem(CACHE_KEY, JSON.stringify(c)); }

    async function call(url, opts = {}, accept = 'application/vnd.github+json') {
      const res = await fetch(url, {
        ...opts,
        cache: 'no-store',
        headers: { Authorization: `Bearer ${token}`, Accept: accept, 'X-GitHub-Api-Version': '2022-11-28', ...(opts.headers || {}) },
      });
      if (res.status === 401) throw new SyncError('GitHub rejected the token (401). Check it in Settings.', 401);
      if (res.status === 403) throw new SyncError('Token lacks access (403). It needs Contents: read and write on 0JEA/flash-cards.', 403);
      return res;
    }

    // { 'YYYY-MM': sha } for files on the progress branch.
    async function listRemote() {
      const res = await call(`${api}/${repo.dir}?ref=${repo.branch}`);
      if (res.status === 404) return {};
      if (!res.ok) throw new SyncError(`Listing failed (${res.status}).`, res.status);
      const out = {};
      for (const f of await res.json()) {
        const m = /^(\d{4}-\d{2})\.jsonl$/.exec(f.name);
        if (m) out[m[1]] = f.sha;
      }
      return out;
    }

    async function readMonth(month) {
      const res = await call(`${api}/${repo.dir}/${month}.jsonl?ref=${repo.branch}`, {}, 'application/vnd.github.raw+json');
      if (res.status === 404) return { events: [], sha: null };
      if (!res.ok) throw new SyncError(`Reading ${month} failed (${res.status}).`, res.status);
      const text = await res.text();
      // Raw responses carry no SHA; read it from the listing instead.
      return { events: FC.log.fromJSONL(text) };
    }

    async function writeMonth(month, events, sha) {
      const body = {
        message: `progress ${month}: ${events.length} events`,
        content: b64encode(FC.log.toJSONL(events)),
        branch: repo.branch,
      };
      if (sha) body.sha = sha;
      const res = await call(`${api}/${repo.dir}/${month}.jsonl`, { method: 'PUT', body: JSON.stringify(body) });
      if (res.status === 409 || res.status === 422) return null; // stale SHA: caller re-reads
      if (!res.ok) throw new SyncError(`Writing ${month} failed (${res.status}).`, res.status);
      return (await res.json()).content.sha;
    }

    // Pull + push in one pass. Returns the merged event list (local ∪ remote).
    async function sync(localEvents) {
      const c = cache();
      let all = localEvents.slice();
      const byMonth = ev => FC.log.monthOf(ev.t);
      for (let attempt = 0; attempt < 3; attempt++) {
        const remote = await listRemote();
        const months = new Set(Object.keys(remote).concat(all.map(byMonth)));
        let stale = false;
        for (const month of months) {
          const sha = remote[month] || null;
          const prev = c.months[month] || {};
          let localM = all.filter(ev => byMonth(ev) === month);
          // Nothing changed on either side since the last sync of this month.
          if (sha && sha === prev.sha && localM.length === prev.n) continue;
          let remoteM = [];
          if (sha && sha !== prev.sha) {
            remoteM = (await readMonth(month)).events;
            all = FC.log.merge(all, remoteM);
            localM = all.filter(ev => byMonth(ev) === month);
          } else if (sha) {
            remoteM = null; // remote unchanged since we last merged it: it is a subset of local
          }
          const remoteCount = remoteM === null ? prev.n : remoteM.length;
          let newSha = sha;
          if (!sha || localM.length > remoteCount) {
            newSha = await writeMonth(month, localM, sha);
            if (newSha === null) { stale = true; break; }
          }
          c.months[month] = { sha: newSha, n: localM.length };
        }
        saveCache(c);
        if (!stale) return all;
      }
      throw new SyncError('Another device kept writing at the same time; try Sync again.', 409);
    }

    // Cheap token check: 200/404 on the listing both mean the token works.
    async function check() {
      await listRemote();
      return true;
    }

    return { sync, check, listRemote };
  }

  function resetCache(store) { (store || FC.log._store()).removeItem(CACHE_KEY); }

  FC.sync = { create, resetCache, REPO, SyncError, _b64encode: b64encode };
})(globalThis.FC = globalThis.FC || {});
