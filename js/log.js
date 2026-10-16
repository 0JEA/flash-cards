// Append-only review log. Card state is always recomputed from these events,
// so two devices merge by set union on event id: no conflicts, nothing lost.
//
// Event shapes (short keys keep localStorage small):
//   review: { i, t, k: 'r', c: cardId, ok: 0|1, s: 0|1 (sure), g?: given, o?: 1 (override), d: device }
//   blank:  { i, t, k: 'b', b: blankId, v: text, d: device }   latest t per blank wins
(function (FC) {
  'use strict';

  const EVENTS_KEY = 'fc.events';
  const DEVICE_KEY = 'fc.device';

  // localStorage can be missing or throw (private mode, node tests); fall back to memory.
  const memory = new Map();
  function store() {
    try {
      const ls = globalThis.localStorage;
      if (ls) { ls.getItem(DEVICE_KEY); return ls; }
    } catch (e) { /* fall through */ }
    return {
      getItem: k => (memory.has(k) ? memory.get(k) : null),
      setItem: (k, v) => memory.set(k, String(v)),
      removeItem: k => memory.delete(k),
    };
  }

  function makeId() {
    const bytes = new Uint8Array(10);
    globalThis.crypto.getRandomValues(bytes);
    return Array.from(bytes, b => (b % 36).toString(36)).join('');
  }

  function device() {
    const s = store();
    let d = s.getItem(DEVICE_KEY);
    if (!d) { d = makeId().slice(0, 6); s.setItem(DEVICE_KEY, d); }
    return d;
  }

  function byTime(a, b) { return a.t - b.t || (a.i < b.i ? -1 : a.i > b.i ? 1 : 0); }

  function load() {
    try {
      const raw = store().getItem(EVENTS_KEY);
      const events = raw ? JSON.parse(raw) : [];
      return Array.isArray(events) ? events : [];
    } catch (e) {
      console.warn('fc: unreadable event log, starting empty', e);
      return [];
    }
  }

  function save(events) {
    store().setItem(EVENTS_KEY, JSON.stringify(events));
  }

  // Add one event (stamping id, time, device) and persist. Returns the event.
  function append(events, fields, now = Date.now()) {
    const ev = Object.assign({ i: makeId(), t: now }, fields, { d: device() });
    events.push(ev);
    save(events);
    return ev;
  }

  // Union by id, sorted by time. Inputs are not mutated.
  function merge(a, b) {
    const seen = new Map();
    for (const ev of a) seen.set(ev.i, ev);
    for (const ev of b) if (!seen.has(ev.i)) seen.set(ev.i, ev);
    return Array.from(seen.values()).sort(byTime);
  }

  // Shard key for sync files. UTC so every device agrees on the file.
  function monthOf(t) {
    return new Date(t).toISOString().slice(0, 7);
  }

  function toJSONL(events) {
    return events.slice().sort(byTime).map(ev => JSON.stringify(ev)).join('\n') + (events.length ? '\n' : '');
  }

  function fromJSONL(text) {
    const out = [];
    for (const line of String(text).split('\n')) {
      if (!line.trim()) continue;
      try {
        const ev = JSON.parse(line);
        if (ev && typeof ev.i === 'string' && typeof ev.t === 'number') out.push(ev);
      } catch (e) { /* skip a corrupt line rather than lose the file */ }
    }
    return out;
  }

  // Latest answer per blank id (a blank can be edited; newest wins).
  function blankAnswers(events) {
    const out = {};
    for (const ev of events) {
      if (ev.k !== 'b') continue;
      const cur = out[ev.b];
      if (!cur || ev.t > cur.t || (ev.t === cur.t && ev.i > cur.i)) out[ev.b] = ev;
    }
    const answers = {};
    for (const id in out) if (out[id].v && out[id].v.trim()) answers[id] = out[id].v.trim();
    return answers;
  }

  FC.log = { load, save, append, merge, monthOf, toJSONL, fromJSONL, blankAnswers, device, makeId, _store: store };
})(globalThis.FC = globalThis.FC || {});
