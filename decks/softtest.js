// AUCSC 325 Software Testing and Quality Assurance (Thibaud "Tibo" Lutellier).
// Cards are written per slide deck into decks/softtest-{a,b,c}.js (FC.softtestCards);
// this file assembles them into the class. Each card carries its own topic (cat / sub).
// Repeated slides (lectures 4/5, 3/7) were de-duplicated in the part files themselves
// on 2026-10-16, so there is no filter here: a card id appears exactly once.
(function (FC) {
  'use strict';
  // Topics in teaching order (the `sub` of every card is one of these).
  const SUB_ORDER = [
    'Why test, V&V & limits', 'Fault, error, failure & RIPR', 'Test anatomy, JUnit & TDD',
    'Dependability', 'Where bugs hide & flaky tests', 'Bug reports',
    'Partitions, boundaries & combinations',
    'Adequacy criteria', 'Graph coverage', 'Mutation testing',
    'Test doubles & Mockito', 'AI agent harness',
    'Bug of the Day lessons', 'Origin of “bug”',
  ];
  // js/app.js reads sub order from FC.topics[<deck id> + 'SubOrder'].
  (FC.topics = FC.topics || {}).softtestSubOrder = SUB_ORDER;
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
    // 12 study topics in 5 categories, plus History as its own optional category
    // (regrouped 2026-10-16 per research/audit-softtest-cards.md, "Proposed regrouping").
    catOrder: ['Foundations', 'Quality & process', 'Test design', 'Test adequacy', 'Doubles & tools', 'History & stories'],
    subOrder: SUB_ORDER,
    cards: FC.softtestCards || [],
    blanks: [],
  };
})(globalThis.FC = globalThis.FC || {});
