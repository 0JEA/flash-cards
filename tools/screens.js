#!/usr/bin/env node
// Screenshots of every screen and every card type (asking and answered), for design review.
//
//   NODE_PATH=<dir containing playwright-core> node tools/screens.js <outDir> [width] [height]
//
// Needs the page served: python3 -m http.server 8765 --bind 127.0.0.1
const { chromium } = require('playwright-core');
const fs = require('fs');

(async () => {
  const [out = '.', w = 632, h = 595] = process.argv.slice(2);
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: +w, height: +h } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(process.env.FIT_URL || 'http://localhost:8765/index.html');
  await p.evaluate(() => document.fonts.ready);
  const shot = async (name, full) => { await p.waitForTimeout(650); await p.screenshot({ path: `${out}/${name}-${w}.png`, fullPage: !!full }); };
  const click = async sel => { await p.locator(sel).first().click(); };

  await shot('01-classes', true);
  await p.locator('.pass').nth(1).locator('.pass-head').click(); await shot('02-classes-310', true);
  await p.locator('.pass.open .pass-actions button').first().click(); await shot('03-class-310', true);
  await p.evaluate(() => document.querySelector('#viewSwitch [data-view="assignment"]')?.click()); await shot('04-class-310-assign', true);
  await p.goto(process.env.FIT_URL || 'http://localhost:8765/index.html'); await p.evaluate(() => document.fonts.ready);
  await p.locator('.pass').nth(4).locator('.pass-head').click(); await p.locator('.pass.open .go').click(); await shot('05-mix', true);
  await click('#navSettings'); await shot('06-settings', true);

  // One card of each type: [deck, predicate, name]. The predicates are fixed strings in this
  // file (evaluated in the page to pick a card), never page or user data.
  const kinds = [
    ['csc370', 'c => c.type === "mc" && c.code', 'mc-code'],
    ['csc370', 'c => c.type === "typed" && c.verify', 'typed-trace'],
    ['csc370', 'c => c.type === "recall" && !c.blank', 'recall'],
    ['csc370', 'c => c.type === "order"', 'order'],
    ['csc370', 'c => c.type === "tree"', 'tree-build'],
    ['csc310', 'c => c.type === "typed" && /\\$/.test(c.prompt)', 'typed-math'],
    ['csc310', 'c => c.type === "gen" && c.generator === "gen-310-heapify-swaps"', 'swaps'],
    ['csc310', 'c => c.type === "gen" && c.generator === "gen-310-rt-fill"', 'fill'],
    ['csc310', 'c => c.type === "gen" && c.generator === "gen-310-bsearch-path"', 'path'],
    ['csc310', 'c => c.type === "gen" && c.generator === "gen-310-compare-growth"', 'gen-graph'],
    ['softtest', 'c => c.type === "set"', 'set'],
    ['softtest', 'c => c.type === "cloze"', 'cloze'],
    ['ethics', 'c => c.type === "mc"', 'mc-ethics'],
  ];
  let i = 10;
  for (const [deck, pred, name] of kinds) {
    const id = await p.evaluate(([deck, pred]) => {
      const cs = FC.app.cardsFor(deck); const c = cs.find(eval(pred));
      if (!c) return null;
      FC.app.startSession(cs, { queue: [c.id, cs.find(x => x.id !== c.id).id] }); FC.app.renderNow(c.id); return c.id;
    }, [deck, pred]);
    if (!id) { console.log('no card for', name); continue; }
    await shot(`${i}-ask-${name}`);
    if (name.startsWith('mc')) { await p.keyboard.press('2'); await shot(`${i}-picked-${name}`); await p.keyboard.press('Enter'); }
    else await p.locator('#actions button', { hasText: 'I don' }).click();
    await shot(`${i}-answered-${name}`);
    i++;
  }
  // Recall self-grade (typed something, then Sure)
  await p.evaluate(() => { const cs = FC.app.cardsFor('csc370'); const c = cs.find(x => x.type === 'recall' && x.points && x.points.length > 2); FC.app.startSession(cs, { queue: [c.id] }); FC.app.renderNow(c.id); });
  await p.fill('#ans', 'syntax and semantics, instructions for a computer');
  await p.locator('#actions .pair .btn.primary').click(); await shot('30-recall-selfgrade');
  // Help over the card
  await p.evaluate(() => { const cs = FC.app.cardsFor('csc370'); FC.app.startSession(cs, { queue: ['l4-ambig-values'] }); FC.app.renderNow('l4-ambig-values'); });
  await click('#helpBtn'); await shot('31-help');
  await p.evaluate(() => document.getElementById('helpMargin').scrollTo(0, 900)); await shot('32-help-scrolled');
  await click('#helpBack');
  // Session done with misses
  await p.evaluate(() => { const cs = FC.app.cardsFor('csc370').filter(c => c.type === 'mc').slice(0, 3); FC.app.startSession(cs, { queue: cs.map(c => c.id), from: 'classes' }); });
  for (let k = 0; k < 6; k++) {
    if (await p.locator('#screen-done').isVisible()) break;
    const idk = p.locator('#actions button', { hasText: 'I don' });
    if (await idk.count()) await idk.click(); else await p.keyboard.press('Enter');
    await p.waitForTimeout(80);
    if (await p.locator('#contBtn').count()) await p.locator('#contBtn').click();
    await p.waitForTimeout(700);
  }
  await p.evaluate(() => document.getElementById('endBtn').click());
  await shot('40-done', true);
  console.log(`screens at ${w}x${h} -> ${out}; page errors: ${errs.length}`, errs.slice(0, 5));
  await b.close();
})();
