#!/usr/bin/env node
// Fit sweep: renders every card (generated ones N times each) on the study screen, asking
// and then with the full answer shown, at a given window size, and lists every case where
// anything would need to scroll. Uses its own headless Chromium, so it never fights over a
// shared browser.
//
//   NODE_PATH=<dir containing playwright-core> node tools/fit-sweep.js [width] [height] [genReps] [deck...]
//   e.g. NODE_PATH=~/websites/seraph-ink/node_modules node tools/fit-sweep.js 632 595 40
//
// Width/height are the browser VIEWPORT (the owner's window minus browser chrome): read the
// window from `hyprctl clients -j`. Needs the page served (fonts load like in real use):
// python3 -m http.server 8765 --bind 127.0.0.1
const { chromium } = require('playwright-core');

(async () => {
  const [w = 632, h = 595, reps = 25, ...only] = process.argv.slice(2);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: +w, height: +h } });
  page.on('pageerror', e => console.error('page error:', e.message));
  await page.goto(process.env.FIT_URL || 'http://localhost:8765/index.html');
  const out = await page.evaluate(async ({ reps, only }) => {
    await document.fonts.ready;
    const $ = id => document.getElementById(id);
    const btn = t => [...$('actions').querySelectorAll('button')].find(b => b.textContent.startsWith(t));
    // Overflow in px; the app's own "could not fit" flag counts too. (Tree-building canvases
    // scroll by design, like a text box, so their inner scroll is not counted.)
    const over = () => { const a = $('answerArea'), q = $('qcard');
      const px = Math.max(0, a.scrollHeight - a.clientHeight) + Math.max(0, q.scrollHeight - q.clientHeight) + Math.max(0, document.scrollingElement.scrollHeight - innerHeight);
      return px || ($('screen-study').classList.contains('fit-overflow') ? 1 + px : 0); };
    const res = {};
    for (const d of FC.app.decks) {
      if (only.length && !only.includes(d.id)) continue;
      const cards = FC.app.cardsFor(d.id);
      if (!cards.length) continue;
      FC.app.startSession(cards, { queue: [cards[0].id] });
      const bad = {}; let shown = 0;
      for (const c of cards) {
        for (let r = 0; r < (c.type === 'gen' ? reps : 1); r++) {
          FC.app.session.queue.splice(0, FC.app.session.queue.length, c.id);
          FC.app.renderNow(c.id); shown++;
          let o = over(); if (o > 1) (bad['ask:' + c.id] = bad['ask:' + c.id] || []).push(o);
          btn('I don').click();
          o = over(); if (o > 1) (bad['fb:' + c.id] = bad['fb:' + c.id] || []).push(o);
        }
      }
      $('endBtn').click();
      res[d.id] = { cards: cards.length, rendered: shown, notFitting: Object.entries(bad).map(([k, v]) => `${k} ×${v.length} (worst ${Math.max(...v)}px)`) };
    }
    return res;
  }, { reps: +reps, only });
  console.log(`viewport ${w}x${h}`);
  let fails = 0;
  for (const [id, r] of Object.entries(out)) {
    console.log(`${id}: ${r.cards} cards, ${r.rendered} renders, ${r.notFitting.length ? 'NOT FITTING:' : 'all fit'}`);
    for (const x of r.notFitting) console.log('   ' + x);
    fails += r.notFitting.length;
  }
  await browser.close();
  process.exit(fails ? 1 : 0);
})();
