#!/usr/bin/env node
// Help render check: opens the Help page of every card in a class that has one, at a given
// viewport, and lists pages with math errors, unrendered $...$ (math classes), a page wider
// than the window (sideways scroll), or page errors. Optional screenshots of named cards.
//
//   NODE_PATH=<dir containing playwright-core> node tools/help-check.js <deck> [width] [height] [shotDir id...]
//   e.g. NODE_PATH=~/websites/seraph-ink/node_modules node tools/help-check.js csc370 390 800
//
// Needs the page served: python3 -m http.server 8765 --bind 127.0.0.1
const { chromium } = require('playwright-core');

(async () => {
  const [deck = 'csc370', w = 632, h = 595, shotDir, ...shots] = process.argv.slice(2);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: +w, height: +h } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(process.env.FIT_URL || 'http://localhost:8765/index.html');
  await p.evaluate(() => document.fonts.ready);
  const r = await p.evaluate(deck => {
    const cards = FC.app.cardsFor(deck).filter(c => FC.help[c.id] || FC.help[String(c.id).replace(/-q\d+$/, '')]);
    const bad = []; let pics = 0;
    for (const c of cards) {
      FC.app.startSession(cards, { queue: [c.id] }); FC.app.renderNow(c.id);
      document.getElementById('helpBtn').click();
      const body = document.getElementById('helpBody');
      const k = body.querySelectorAll('.katex-error').length;
      const raw = FC.decks[deck].math && [...body.querySelectorAll('p, li, td, th, .help-answer, .help-mistake, figcaption')]
        .some(e => /(^|[^\\])\$[^$]+\$/.test([...e.childNodes].filter(x => x.nodeType === 3).map(x => x.data).join('')));
      const tick = [...body.querySelectorAll('p, li, td, th, .help-answer, .help-mistake, figcaption')]
        .some(e => [...e.childNodes].some(x => x.nodeType === 3 && x.data.includes('`')));
      pics += body.querySelector('figure') ? 1 : 0;
      const wide = document.scrollingElement.scrollWidth > innerWidth + 1;
      if (k || raw || tick || wide) bad.push(c.id + (k ? ' katex' : '') + (raw ? ' raw$' : '') + (tick ? ' stray`' : '') + (wide ? ' too-wide' : ''));
      document.getElementById('helpBack').click();
    }
    return { cards: FC.app.cardsFor(deck).length, withHelp: cards.length, withPicture: pics, problems: bad };
  }, deck);
  for (const id of shots) {
    await p.evaluate(id => { const cards = FC.app.cardsFor(FC.app.cardsFor('csc370').some(c => c.id === id) ? 'csc370' : FC.app.decks.find(d => FC.app.cardsFor(d.id).some(c => c.id === id)).id);
      FC.app.startSession(cards, { queue: [id] }); FC.app.renderNow(id); document.getElementById('helpBtn').click(); }, id);
    await p.screenshot({ path: `${shotDir}/help-${id.replace(/[^\w-]/g, '_')}-${w}.png`, fullPage: true });
  }
  console.log(`${deck} at ${w}x${h}: ${JSON.stringify(r)}; page errors: ${errs.length}`, errs.slice(0, 3));
  await b.close();
  process.exit(r.problems.length || errs.length ? 1 : 0);
})();
