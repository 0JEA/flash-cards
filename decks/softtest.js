// AUCSC 325 Software Testing and Quality Assurance (Thibaud "Tibo" Lutellier).
// Cards are written per slide deck into decks/softtest-{a,b,c}.js (FC.softtestCards);
// this file assembles them into the class. Each card carries its own topic (cat / sub).
(function (FC) {
  'use strict';
  // Lectures 4 and 5 (and 3 and 7) repeat the same slides, so the per-deck card writers made
  // the same cards twice. Keep the first lecture's card; drop the repeat (2026-10-16 audit).
  const DUPLICATES = new Set([
    'st5-dependability-def', 'st5-four-methods', 'st5-measures-list', 'st5-other-features', 'st5-avail-vs-rel',
    'st5-measure-integrity', 'st5-measure-safety', 'st5-measure-maint', 'st5-mtbf-mttr', 'st5-avail-formula',
    'st5-avail-calc-99', 'st5-planning-failure', 'st5-failure-tests', 'st5-chaos-monkey', 'st5-chaos-mc',
    'st5-do178-order', 'st5-do178-defs', 'st5-do178-major', 'st5-do178-minor',
    'st7-leftpad-story', 'st7-leftpad-framework', 'st1-first-bug-date',
  ]);
  (FC.decks = FC.decks || {}).softtest = {
    id: 'softtest', title: 'CSC 325 · Software Testing', short: 'CSC 325',
    lectures: [
      { n: '1', title: 'Intro' }, { n: '2', title: 'What is a software tester' }, { n: '3', title: 'Test cases and test suites' },
      { n: '4', title: 'Dependability & systematic testing' }, { n: '5', title: 'Dependability & systematic testing II' },
      { n: '6', title: 'Testing principles II' }, { n: '7', title: 'Bug reports and test doubles' }, { n: '8', title: 'Test doubles' },
      { n: '9', title: 'Factors influencing test effectiveness' }, { n: '10', title: 'Reachability, observability, black-box testing' },
      { n: '12', title: 'Black-box testing' }, { n: '13', title: 'Code coverage' }, { n: '14', title: 'AI agent harness' },
      { n: 'paper', title: 'Reading: Stalking the elusive computer bug' },
    ],
    catOrder: ['Foundations', 'Test design', 'Dependability', 'Principles', 'Bugs & reports', 'Test doubles', 'Coverage', 'Tools & automation', 'History & stories'],
    cards: (FC.softtestCards || []).filter(c => !DUPLICATES.has(c.id)),
    blanks: [],
  };
})(globalThis.FC = globalThis.FC || {});
