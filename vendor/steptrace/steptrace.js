// steptrace viewer: plays a trace (FORMAT.md) in the browser like a debugger.
//
// Left: the source (✓ on the line that just ran, ➜ on the line that runs next), the step
// controls, one line saying what just happened, and the output. Right: memory. The stack is
// a pile of activation records (newest on top), each with its parameters, locals, where it
// returns to, and its dynamic and static links; the global area sits at the bottom. The
// heap is beside it. Pointers are drawn as arrows to what they point at. A record glows on
// the step it is pushed and leaves a faded outline on the step it is popped; heap blocks
// are marked when allocated and crossed out when freed.
//
//   const v = StepTrace.mount(element, trace, { keys: true });
//   v.go(1); v.go(-1); v.goto(0); v.destroy();
//
// Options: keys (true: arrows/Home/End while the viewer has focus; 'global': anywhere outside
// a text field), source (code to show instead of trace.source), start (first step shown).
// No dependencies; every piece of program text is set with textContent.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.StepTrace = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const SVG = 'http://www.w3.org/2000/svg';
  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else if (k === 'dataset') Object.assign(el.dataset, v);
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (const kid of kids.flat()) if (kid != null && kid !== false) el.append(kid instanceof Node ? kid : String(kid));
    return el;
  }
  const s = (tag, attrs) => { const el = document.createElementNS(SVG, tag); for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v); return el; };
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const has = (o, k) => o != null && Object.prototype.hasOwnProperty.call(o, k);
  const isPtr = v => v && typeof v === 'object' && !Array.isArray(v) && has(v, 'to');

  // Short text of a value, for the "what happened" line.
  function brief(v) {
    if (isPtr(v)) return v.to === null ? 'NULL' : '→ ' + v.to;
    if (Array.isArray(v)) return '[' + v.map(brief).join(', ') + ']';
    if (v && typeof v === 'object') return has(v, 'fn') ? 'function ' + v.fn : has(v, 'addr') ? v.addr : '{…}';
    return String(v);
  }

  // A value as DOM. Pointers are chips that the arrow layer connects to their target.
  function value(v, ptrs) {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      if (has(v, 'to')) {
        if (v.to === null) return h('span', { class: 'st-null' }, 'NULL');
        const chip = h('span', { class: 'st-ptr', title: `points to ${v.to}` }, h('span', { class: 'st-ptr-name' }, v.to), h('span', { class: 'st-dot' }));
        if (ptrs) ptrs.push({ chip, v });
        return chip;
      }
      if (has(v, 'addr')) return h('span', { class: 'st-ptr st-unknown', title: 'an address outside every known variable' }, v.addr);
      if (has(v, 'fn')) return h('span', { class: 'st-fnval' }, 'ƒ ' + v.fn);
      // A by-name parameter: the caller's expression, re-evaluated at every use.
      if (has(v, 'thunk')) return h('span', { class: 'st-thunk', title: 'passed by name: the expression is evaluated again, in the caller, every time it is used' },
        h('span', { class: 'st-thunk-tag' }, 'by name'), h('span', { class: 'st-thunk-expr' }, v.thunk), v.now !== undefined && v.now !== '?' ? h('span', { class: 'st-thunk-now' }, '= ', value(v.now)) : null);
      if (has(v, 'items')) return arr(v.items, v.from || 0, ptrs);
      if (has(v, 'fields')) return h('span', { class: 'st-obj' }, Object.entries(v.fields).map(([k, x]) => h('span', { class: 'st-field' }, h('span', { class: 'st-key' }, k), value(x, ptrs))));
    }
    if (Array.isArray(v)) return arr(v, 0, ptrs);
    if (v === '?') return h('span', { class: 'st-unset', title: 'not set yet' }, '?');
    if (v === 'freed') return h('span', { class: 'st-unset' }, 'freed');
    return h('span', null, String(v));
  }

  const heapShift = st => (st.frames && st.frames[0] && st.frames[0].fn === 'heap' ? 1 : 0);

  function arr(items, from, ptrs) {
    return h('span', { class: 'st-arr' }, items.map((x, i) => h('span', { class: 'st-cell', dataset: { i: String(i + from) } }, h('small', null, String(i + from)), value(x, ptrs))));
  }

  // Frame identity across steps: frames match bottom-up while their names agree, so a new
  // call (even a recursive one) is a new record and a return is a pop.
  function identify(steps) {
    let prev = [], next = 1;
    return steps.map(st => {
      const fr = (st.frames || []).filter(f => f.fn !== 'heap');
      const ids = [];
      for (let d = 0; d < fr.length; d++) {
        const keep = d < prev.length && prev[d].fn === fr[d].fn && ids.length === d;
        ids.push(keep ? prev[d] : { fn: fr[d].fn, id: next++ });
      }
      prev = ids;
      return ids.map(x => x.id);
    });
  }

  function mount(container, trace, opts = {}) {
    // Pseudocode with the interpreter loaded (steptrace-interp.js): rule switches re-run it.
    if (trace.rules && !opts.rerun && typeof StepTraceInterp !== 'undefined') {
      opts = Object.assign({}, opts, { rerun: (rules, at) => {
        let t;
        try { t = StepTraceInterp.run(trace.source, { syntax: trace.rules.syntax, scoping: rules.scoping, params: rules.params }); }
        catch (e) { return; }
        const keep = opts.holder || ctrl;      // the controller the page holds stays valid
        keep.destroy();
        Object.assign(keep, mount(container, t, Object.assign({}, opts, { rerun: null, holder: keep, start: Math.min(at, t.steps.length - 1) })));
        keep.el.focus({ preventScroll: true });
      } });
    }
    const steps = trace.steps || [];
    const ids = identify(steps);
    const lines = String(opts.source != null ? opts.source : trace.source || '').split('\n');
    let k = Math.max(0, Math.min(steps.length - 1, opts.start || 0));

    const rows = lines.map((l, i) => h('div', { class: 'st-line' },
      h('span', { class: 'st-mark', 'aria-hidden': 'true' }), h('span', { class: 'st-n' }, String(i + 1)), h('span', { class: 'st-src' }, l || ' ')));
    const code = h('div', { class: 'st-code' }, rows);
    const count = h('span', { class: 'st-count' });
    const btn = (label, title, d, cls) => h('button', { type: 'button', class: 'st-btn' + (cls ? ' ' + cls : ''), title, 'aria-label': title, onclick: () => go(d) }, label);
    const first = btn('⏮', 'First step (Home)', -Infinity), back = btn('‹ Back', 'Back (←)', -1);
    const fwd = btn('Step ›', 'Step (→)', 1, 'st-primary'), last = btn('⏭', 'Last step (End)', Infinity);
    const scrub = h('input', { type: 'range', class: 'st-scrub', min: '0', max: String(Math.max(0, steps.length - 1)), value: String(k), 'aria-label': 'Step' });
    scrub.addEventListener('input', () => goto(Number(scrub.value)));
    const what = h('p', { class: 'st-what', 'aria-live': 'polite' });
    const note = h('p', { class: 'st-note' });
    const out = h('pre', { class: 'st-out' });
    const status = h('p', { class: 'st-status' });
    const stack = h('div', { class: 'st-stack' });
    const heap = h('div', { class: 'st-heapcol' });
    const arrows = s('svg', { class: 'st-arrows', 'aria-hidden': 'true' });
    const mem = h('div', { class: 'st-mem' },
      h('div', { class: 'st-col' }, h('h3', null, 'Stack', h('small', null, 'activation records, newest on top')), stack),
      h('div', { class: 'st-col st-heap-col' }, h('h3', null, 'Heap'), heap), arrows);
    // Pseudocode traces can be re-run under other rules (opts.rerun(rules) -> trace).
    const rulesBar = h('div', { class: 'st-rules' });
    if (trace.rules) {
      const cur = { scoping: trace.rules.scoping, params: trace.rules.paramsMode || 'default' };
      const seg = (label, key, choices) => h('div', { class: 'st-seg', role: 'group', 'aria-label': label }, h('span', null, label),
        choices.map(([val, text]) => h('button', { type: 'button', 'aria-pressed': String(cur[key] === val), disabled: !opts.rerun,
          title: opts.rerun ? `Run the program again with ${text.toLowerCase()} ${key === 'scoping' ? 'scoping' : 'parameters'}` : null,
          onclick: () => { if (!opts.rerun || cur[key] === val) return; const next = Object.assign({}, cur, { [key]: val }); opts.rerun({ scoping: next.scoping, params: next.params === 'default' ? null : next.params }, k); } }, text)));
      rulesBar.append(seg('Scoping', 'scoping', [['static', 'Static'], ['dynamic', 'Dynamic']]));
      if (opts.paramModes !== false) rulesBar.append(seg('Parameters', 'params', [['default', trace.rules.params === 'by name unless value' ? 'ALGOL default' : 'Default'], ['value', 'Value'], ['reference', 'Reference'], ['value-result', 'Value-result'], ['name', 'Name']]));
    }
    rulesBar.hidden = !trace.rules;
    const el = h('div', { class: 'steptrace', tabindex: '0', role: 'group', 'aria-label': 'Program trace' },
      h('div', { class: 'st-left' }, code,
        h('div', { class: 'st-ctl' }, first, back, count, fwd, last), scrub, what, note,
        h('div', { class: 'st-console' }, h('h3', null, 'Output'), out, status)),
      h('div', { class: 'st-right' }, rulesBar, mem));
    container.replaceChildren(el);
    container.style.containerType = 'inline-size';
    container.style.containerName = 'steptrace';
    let ptrs = [];

    // Hovering a pointer or a static link lights up its target.
    el.addEventListener('mouseover', e => {
      el.querySelectorAll('.st-lit').forEach(x => x.classList.remove('st-lit'));
      const p = e.target.closest('[data-lights]');
      if (p) el.querySelectorAll(`[data-key="${CSS.escape(p.dataset.lights)}"]`).forEach(x => x.classList.add('st-lit'));
    });

    function record(fr, i, frames, st, prevSt, prevIds, curIds) {
      const isGlobal = fr.fn === 'global' && i === 0;
      const prevIdx = prevIds ? prevIds.indexOf(curIds[i]) : -1;
      const pf = prevIdx >= 0 ? prevSt.frames.filter(f => f.fn !== 'heap')[prevIdx] : null;
      const pushed = k > 0 && prevIdx < 0 && !isGlobal;
      const f = st.find;
      const found = f && f.at === i, looked = f && f.looked.includes(i);
      const ret = has(fr.vars, 'return');
      const names = Object.keys(fr.vars || {}).filter(n => n !== 'return');
      const args = new Set(fr.args || []);
      const row = n => {
        const changed = k > 0 && !pushed && (!pf || !has(pf.vars, n) || !same(pf.vars[n], fr.vars[n]));
        return h('div', { class: 'st-var' + (found && f.name === n ? ' st-hit' : ''), dataset: { key: `${curIds[i]}:${n}`, name: n } },
          h('span', { class: 'st-name' }, n), h('span', { class: 'st-val' + (changed ? ' st-changed' : '') }, value(fr.vars[n], ptrs)));
      };
      const params = names.filter(n => args.has(n)), locals = names.filter(n => !args.has(n));
      const top = i === frames.length - 1;
      const caller = i > 0 ? frames[i - 1] : null;
      const links = [];
      if (!isGlobal) {
        // The global area of a compiled program is storage, not a caller: main has no caller.
        if (caller && !(caller.fn === 'global' && caller.line == null)) links.push(h('div', { class: 'st-link', 'data-lights': `rec:${curIds[i - 1]}` },
          h('span', null, 'dynamic link'), h('span', null, '↓ ' + caller.fn + (caller.line ? `, back to line ${caller.line}` : ''))));
        else if (caller) links.push(h('div', { class: 'st-link' }, h('span', null, 'dynamic link'), h('span', null, 'none (started by the system)')));
        // `parent` indexes the trace's frames, which may start with the heap.
        const pi = typeof fr.parent === 'number' ? fr.parent - heapShift(st) : -1;
        if (pi >= 0 && frames[pi]) links.push(h('div', { class: 'st-link', 'data-lights': `rec:${curIds[pi]}` },
          h('span', null, 'static link'), h('span', null, '→ ' + (pi === 0 && frames[0].fn === 'global' ? 'global' : frames[pi].fn))));
      }
      const badge = looked ? (found ? `${f.name} found here` : `no ${f.name} here`)
        : ret ? `returning ${brief(fr.vars.return)}` : pushed ? 'pushed' : top && !isGlobal ? 'running' : '';
      return h('div', { class: 'st-rec' + (isGlobal ? ' st-global' : '') + (fr.block ? ' st-blockrec' : '') + (top && !isGlobal ? ' st-top' : '') + (pushed ? ' st-pushed' : '')
        + (looked ? ' st-looked' : '') + (found ? ' st-found' : '') + (ret ? ' st-returning' : ''), dataset: { key: `rec:${curIds[i]}` } },
        h('div', { class: 'st-rec-head' }, h('span', { class: 'st-fn' }, isGlobal ? 'global (static area)' : fr.fn), badge ? h('span', { class: 'st-badge' }, badge) : null),
        params.length ? h('div', { class: 'st-group' }, h('div', { class: 'st-sub' }, 'parameters'), h('div', { class: 'st-vars' }, params.map(row))) : null,
        locals.length ? h('div', { class: 'st-group' }, params.length ? h('div', { class: 'st-sub' }, 'locals') : null, h('div', { class: 'st-vars' }, locals.map(row))) : null,
        !names.length ? h('p', { class: 'st-empty' }, isGlobal ? 'no globals' : 'no variables yet') : null,
        ret ? h('div', { class: 'st-vars st-retrow' }, h('span', { class: 'st-name' }, 'return value'), h('span', { class: 'st-val st-changed' }, value(fr.vars.return, ptrs))) : null,
        links.length ? h('div', { class: 'st-links' }, links) : null);
    }

    function describe(st, prevSt, curIds, prevIds) {
      if (k === 0 && !st.line) return 'Nothing has run yet. Step to run the first line.';
      const said = [];
      const frames = (st.frames || []).filter(f => f.fn !== 'heap');
      const pframes = prevSt ? (prevSt.frames || []).filter(f => f.fn !== 'heap') : [];
      const pushed = frames.filter((f, i) => !prevIds || !prevIds.includes(curIds[i])).filter(f => f.fn !== 'global');
      const popped = prevIds ? pframes.filter((f, i) => !curIds.includes(prevIds[i])) : [];
      for (const f of popped) said.push(`${f.fn} returned${has(f.vars, 'return') ? ' ' + brief(f.vars.return) : ''}; its activation record is popped.`);
      for (const f of pushed) said.push(`Called ${f.fn}; a new activation record is pushed.`);
      const ph = prevSt && (prevSt.frames || []).find(f => f.fn === 'heap'), hp = (st.frames || []).find(f => f.fn === 'heap');
      for (const [b, v] of Object.entries(hp ? hp.vars : {})) {
        if (!ph || !has(ph.vars, b)) said.push(`${b} is allocated on the heap.`);
        else if (v === 'freed' && ph.vars[b] !== 'freed') said.push(`${b} is freed.`);
      }
      if (!pushed.length && !popped.length) {
        const top = frames[frames.length - 1], pi = pframes.length - 1;
        const changes = [];
        frames.forEach((f, i) => {
          const pf = prevIds ? pframes[prevIds.indexOf(curIds[i])] : null;
          for (const [n, v] of Object.entries(f.vars || {})) if (n !== 'return' && (!pf || !has(pf.vars, n) || !same(pf.vars[n], v)) && v !== '?') changes.push(`${n} = ${brief(v)}`);
        });
        if (changes.length) said.push(changes.slice(0, 3).join(', ') + (changes.length > 3 ? ' …' : '') + '.');
        if (top && has(top.vars, 'return') && pi >= 0) said.push(`${top.fn} is about to return ${brief(top.vars.return)}.`);
      }
      if (st.find) {
        const nm = i => (frames[i] ? (frames[i].fn === 'global' ? 'global' : frames[i].fn) : '?');
        const missed = st.find.looked.filter(i => i !== st.find.at).map(nm);
        said.push(`Looked up ${st.find.name}: ${missed.length ? `not in ${missed.join(', not in ')}; ` : ''}found in ${nm(st.find.at)}.`);
      }
      if (st.out) said.push(`Printed ${JSON.stringify(st.out.replace(/\n$/, ''))}.`);
      if (!said.length) said.push(st.line ? `Ran line ${st.line}.` : '');
      return said.join(' ');
    }

    function paint() {
      const st = steps[k] || { frames: [] }, prevSt = k ? steps[k - 1] : null;
      const curIds = ids[k] || [], prevIds = k ? ids[k - 1] : null;
      rows.forEach((r, i) => { r.classList.toggle('st-ran', st.line === i + 1); r.classList.toggle('st-next', st.next === i + 1); });
      const focus = rows[(st.next || st.line || 1) - 1];
      if (focus && focus.offsetParent) {
        const c = code.getBoundingClientRect(), r = focus.getBoundingClientRect();
        if (r.top < c.top || r.bottom > c.bottom) code.scrollTop += r.top - c.top - c.height / 3;
      }
      count.textContent = steps.length ? `${k + 1} / ${steps.length}` : 'no steps';
      first.disabled = back.disabled = k === 0;
      fwd.disabled = last.disabled = k >= steps.length - 1;
      scrub.value = String(k);
      what.textContent = describe(st, prevSt, curIds, prevIds);
      note.textContent = st.note || '';
      note.hidden = !st.note;

      ptrs = [];
      const frames = (st.frames || []).filter(f => f.fn !== 'heap');
      const recs = frames.map((fr, i) => record(fr, i, frames, st, prevSt, prevIds, curIds));
      // Records popped on this step stay one step as faded outlines, on top where they were.
      const pframes = prevSt ? (prevSt.frames || []).filter(f => f.fn !== 'heap') : [];
      const ghosts = prevIds ? pframes.map((f, i) => [f, prevIds[i]]).filter(([, id]) => !curIds.includes(id))
        .map(([f]) => h('div', { class: 'st-rec st-popped' }, h('div', { class: 'st-rec-head' }, h('span', { class: 'st-fn' }, f.fn), h('span', { class: 'st-badge' }, 'popped')))) : [];
      stack.replaceChildren(...ghosts.reverse(), ...recs.reverse());
      if (!frames.length && !ghosts.length) stack.replaceChildren(h('p', { class: 'st-empty' }, k > 0 ? 'The program has finished; the stack is empty.' : 'Empty.'));
      const hp = (st.frames || []).find(f => f.fn === 'heap'), ph = prevSt && (prevSt.frames || []).find(f => f.fn === 'heap');
      heap.replaceChildren(...(hp ? Object.entries(hp.vars).map(([b, v]) => {
        const isNew = k > 0 && (!ph || !has(ph.vars, b)), gone = v === 'freed', changed = !isNew && ph && !same(ph.vars[b], v);
        return h('div', { class: 'st-block' + (isNew ? ' st-pushed' : '') + (gone ? ' st-freed' : ''), dataset: { key: `heap:${b}` } },
          h('div', { class: 'st-rec-head' }, h('span', { class: 'st-fn' }, b), h('span', { class: 'st-badge' }, gone ? 'freed' : isNew ? 'allocated' : '')),
          gone ? null : h('div', { class: 'st-val' + (changed ? ' st-changed' : '') }, value(v, ptrs)));
      }) : [h('p', { class: 'st-empty' }, 'Nothing allocated.')]));

      const text = steps.slice(0, k + 1).map(x => x.out || '').join('');
      out.textContent = text || 'Nothing printed yet.';
      out.classList.toggle('st-none', !text);
      out.classList.toggle('st-fresh', !!st.out);
      const end = k === steps.length - 1, ex = trace.exit || {};
      status.textContent = st.result != null ? `The answer: ${st.result}`
        : end && trace.truncated ? `Stopped after ${steps.length} steps.`
        : end && ex.error ? `Stopped with an error: ${ex.error}`
        : end && ex.code != null ? `Finished${ex.code ? ` with exit code ${ex.code}` : ''}.` : '';
      status.hidden = !status.textContent;
      requestAnimationFrame(drawArrows);
    }

    // Arrows from each pointer chip to the variable, array cell or heap block it names.
    function target(v, frames, curIds) {
      const name = String(v.to), base = name.replace(/\[\d+\]$/, ''), idx = /\[(\d+)\]$/.exec(name);
      if (/^block /.test(name) || v.frame === 0 && frames[0] && frames[0].fn === 'heap') {
        const blk = mem.querySelector(`[data-key="heap:${CSS.escape(base)}"]`);
        return idx && blk ? blk.querySelector(`.st-cell[data-i="${idx[1]}"]`) || blk : blk;
      }
      const real = (steps[k].frames || []);
      const heapFirst = real[0] && real[0].fn === 'heap' ? 1 : 0;
      let recIdx = typeof v.frame === 'number' ? v.frame - heapFirst : -1;
      if (recIdx < 0) for (let i = curIds.length - 1; i >= 0; i--) if (has(frames[i] && frames[i].vars, base)) { recIdx = i; break; }
      if (recIdx < 0 || curIds[recIdx] == null) return null;
      const row = mem.querySelector(`[data-key="${CSS.escape(`${curIds[recIdx]}:${base}`)}"]`);
      if (!row) return null;
      const valEl = row.querySelector('.st-val');
      return idx ? valEl.querySelector(`.st-cell[data-i="${idx[1]}"]`) || valEl : valEl;
    }
    function drawArrows() {
      arrows.replaceChildren();
      if (!el.isConnected) return;
      const box = mem.getBoundingClientRect();
      arrows.setAttribute('width', box.width); arrows.setAttribute('height', box.height);
      arrows.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
      const defs = s('defs', {}); const m = s('marker', { id: 'st-head', viewBox: '0 0 10 10', refX: '9', refY: '5', markerWidth: '7', markerHeight: '7', orient: 'auto-start-reverse' });
      m.append(s('path', { d: 'M0 0 L10 5 L0 10 z', class: 'st-arrowhead' })); defs.append(m);
      const mx = m.cloneNode(true); mx.setAttribute('id', 'st-head-x'); mx.firstChild.setAttribute('class', 'st-arrowhead st-x'); defs.append(mx);
      arrows.append(defs);
      for (const { chip, v } of ptrs) {
        const t = target(v, steps[k].frames || [], ids[k] || []);
        if (!t || t.closest('.st-popped')) continue;
        const a = chip.querySelector('.st-dot').getBoundingClientRect(), b = t.getBoundingClientRect();
        const x1 = a.left + a.width / 2 - box.left, y1 = a.top + a.height / 2 - box.top;
        const y2 = b.top + b.height / 2 - box.top;
        const right = b.left - box.left > x1 + 20;
        const inHeap = !!chip.closest('.st-heap-col') && !!t.closest('.st-heap-col');
        let d;
        if (right) {                                   // across to the right (stack → heap)
          const x2 = b.left - box.left - 2, bend = Math.max(30, (x2 - x1) / 2);
          d = `M${x1} ${y1} C${x1 + bend} ${y1} ${x2 - bend} ${y2} ${x2} ${y2}`;
        } else if (inHeap) {                           // heap → heap: loop out to the right of the blocks
          const edge = chip.closest('.st-block').getBoundingClientRect().right - box.left;
          const x2 = b.right - box.left + 2, out = Math.max(edge, x2) + 14 + Math.min(24, Math.abs(y2 - y1) / 6);
          d = `M${x1} ${y1} L${edge} ${y1} C${out} ${y1} ${out} ${y2} ${x2} ${y2}`;
        } else {                                       // within the stack: loop through the gap on the right
          const x2 = b.right - box.left + 2, out = Math.max(x1, x2) + 28 + Math.min(40, Math.abs(y2 - y1) / 5);
          d = `M${x1} ${y1} C${out} ${y1} ${out} ${y2} ${x2} ${y2}`;
        }
        // A pointer into freed memory is dangling: drawn red and dashed.
        const dangling = !!t.closest('.st-freed');
        chip.classList.toggle('st-dangling', dangling);
        if (dangling) chip.title = `points to ${v.to}, which was freed (dangling pointer)`;
        arrows.append(s('path', { d, class: 'st-arrow' + (dangling ? ' st-dangle' : t.closest('.st-block') ? ' st-to-heap' : ''), 'marker-end': `url(#st-head${dangling ? '-x' : ''})` }));
      }
    }
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => requestAnimationFrame(drawArrows)) : null;
    if (ro) ro.observe(mem);

    function goto(n) { k = Math.max(0, Math.min(steps.length - 1, n)); paint(); }
    function go(d) { goto(d === Infinity ? steps.length - 1 : d === -Infinity ? 0 : k + d); }
    const onKey = e => {
      if (e.ctrlKey || e.metaKey || e.altKey || !el.isConnected) return;
      if (opts.keys !== 'global' && !el.contains(document.activeElement)) return;
      const tag = document.activeElement && document.activeElement.tagName;
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag) && document.activeElement !== scrub) return;
      const d = { ArrowRight: 1, ArrowLeft: -1, Home: -Infinity, End: Infinity }[e.key];
      if (d === undefined) return;
      e.preventDefault(); go(d);
    };
    if (opts.keys) document.addEventListener('keydown', onKey);
    paint();
    const ctrl = { el, trace, go, goto, step: () => k, redraw: () => requestAnimationFrame(drawArrows),
      destroy() { document.removeEventListener('keydown', onKey); if (ro) ro.disconnect(); el.remove(); } };
    return ctrl;
  }

  return { mount, value };
});
