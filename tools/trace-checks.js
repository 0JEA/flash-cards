// Checks a recorded CSC 310 trace against its card's answer, as tools/csc310-trace-runs.js
// says (`check`). Used when recording (tools/record-traces.js) and by tests/traces.test.js.
// Returns null when the run supports the answer, else what is wrong.
'use strict';
const nums = s => (String(s).match(/-?\d+/g) || []).map(Number);
function check310(t, card, chk) {
  const printed = t.steps.map(s => s.out || '').join('');
  const want = nums(Array.isArray(card.answer) ? card.answer.join(' ') : card.answer);
  const same = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);
  if (chk === 'none') return null;
  if (chk === 'out') return same(nums(printed), want) ? null : `printed ${JSON.stringify(printed.trim())}, answer ${card.answer}`;
  if (chk.count) {
    const src = t.source.split('\n');
    const n = t.steps.filter(s => s.line && src[s.line - 1].includes(chk.count)).length;
    const exp = chk.n != null ? chk.n : want[0];
    return n === exp ? null : `line "${chk.count}" ran ${n} times, expected ${exp}`;
  }
  if (chk === 'held' || chk.held) {
    // An array's contents at some step, a run of one variable's successive values, or one
    // value. `held: [...]` lists several (an answer that gives the array at each step).
    const holds = w => {
      const timelines = new Map();
      for (const s of t.steps) for (const f of s.frames) for (const [k, v] of Object.entries(f.vars)) {
        const items = Array.isArray(v) ? v : v && v.items;
        if (items && same(items.map(Number), w)) return true;
        if (typeof v === 'number') { const key = f.fn + ' ' + k, tl = timelines.get(key) || []; if (tl[tl.length - 1] !== v) tl.push(v); timelines.set(key, tl); }
      }
      for (const tl of timelines.values()) for (let i = 0; i + w.length <= tl.length; i++) if (same(tl.slice(i, i + w.length), w)) return true;
      return false;
    };
    const missing = (chk.held || [card.answer]).filter(w => !holds(nums(w)));
    return missing.length ? `the run never holds ${missing.join(' / ')}` : null;
  }
  return `unknown check ${JSON.stringify(chk)}`;
}

module.exports = { nums, check310 };
