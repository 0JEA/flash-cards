// Topic groups for CSC 370, shown as toggles on the class screen:
//   Theory      concepts (criteria, translation, grammars, names, types, lifetime, scope, control)
//   History     the languages' history (early computing, Fortran, Lisp, Algol, COBOL, Prolog)
//   Programming cards built around reading or tracing code, grouped by language
// FC.topics.csc370(card) -> { cat, sub }. Blank cards are placed by lecture and slide.
(function (FC) {
  'use strict';

  const programming = {
    C: ['l3-banana-out', 'l3-banana-val', 'l52-block-trace', 'l52-sa-tenth', 'l10-assign-trace', 'l10-dangling-4', 'l10-dangling-14', 'l10-fallthrough', 'l10-weird-for', 'l10-c-loop'],
    Python: ['l52-py-trace', 'l52-kiwi-static', 'l52-kiwi-dynamic', 'l10-py-loop'],
    JavaScript: ['l52-js-static', 'l52-js-dynamic'],
    'Scheme / Lisp': ['l2-scheme-trace', 'l1-expressivity', 'l2-code-scheme'],
    Fortran: ['l2-code-fortran'],
    Algol: ['l2-code-algol'],
    COBOL: ['l2-code-cobol'],
    Prolog: ['l2-code-prolog'],
  };
  const theory = {
    'Language basics': ['l1-pl-def', 'l1-turing', 'l1-html', 'l1-categories', 'l1-cat-prolog', 'l1-cat-scheme'],
    'Language criteria': ['l1-criteria', 'l1-subcriteria', 'l1-tradeoff', 'l1-readwrite'],
    Translation: ['l4-compiler-steps', 'l4-lexeme-token', 'l4-symtab', 'l4-same', 'l4-diff', 'l4-adv-compiled', 'l4-adv-interp', 'l4-xyz-order', 'l4-where-2', 'l4-where-x', 'l4-token-i', 'l4-token-10'],
    'Grammars & BNF': ['l4-gpa-bnf', 'l4-gpa-derive', 'l4-gpa-41', 'l4-ambiguous', 'l4-precedence-level', 'l4-assoc', 'l4-assoc-ambig', 'l4-ebnf', 'l4-sample-derive', 'l4-sample-prec', 'l4-ambig-values'],
    'Names & binding': ['l51-attrs', 'l51-name-issues', 'l51-case', 'l51-anychar', 'l51-meaning', 'l51-keywords', 'l51-maxlen', 'l51-bindtimes', 'l51-case-arg', 'l51-spaces', 'l51-single', 'l51-name-objcode', 'l51-unique'],
    Types: ['l51-type-name', 'l51-type-infer', 'l51-type-dynamic', 'l51-type-exact', 'l51-explicit-types', 'l3-banana-java'],
    'Lifetime & storage': ['l51-storage', 'l52-implicit-heap', 'l52-explicit-heap', 'l52-static-eg', 'l52-lifetime-vs-scope', 'l52-sa-error'],
    Scope: ['l52-scope-def', 'l52-block-java', 'l52-py-unbound', 'l52-scope-hole', 'l52-dynamic-def'],
    'Named constants': ['l52-const-c', 'l52-const-csharp', 'l52-java-final'],
  };
  const history = {
    'Early computing': ['l2-eniac-how', 'l2-eniac-women', 'l2-vonneumann', 'l2-plankalkul'],
    'Big four': ['l2-bigfour', 'l2-recursion'],
    Fortran: ['l2-fortran-names', 'l2-fortran-acronym', 'l2-ibm704', 'l2-fortran-goal', 'l2-fortran-if', 'l2-fortran-sub'],
    Lisp: ['l2-lisp-origin', 'l2-lisp-dialects'],
    Algol: ['l2-algol-committee', 'l2-algol-today', 'l2-algol-origin', 'l2-algol-death'],
    COBOL: ['l2-cobol-sections', 'l2-cobol-goals', 'l2-cobol-records'],
    Prolog: ['l2-prolog-true', 'l2-prolog-origin'],
  };
  const byId = new Map();
  for (const [cat, groups] of [['Programming', programming], ['Theory', theory], ['History', history]]) {
    for (const [sub, ids] of Object.entries(groups)) for (const id of ids) byId.set(id, { cat, sub });
  }

  // Blanks by lecture and slide.
  function blankTopic(lecture, slide) {
    if (lecture === '1') return slide === 5 || slide === 19 ? { cat: 'Theory', sub: 'Language basics' } : { cat: 'Theory', sub: 'Language criteria' };
    if (lecture === '2') {
      if (slide <= 5) return { cat: 'History', sub: 'Early computing' };
      if (slide <= 15) return { cat: 'History', sub: 'Fortran' };
      if (slide <= 24) return { cat: 'History', sub: 'Lisp' };
      if (slide <= 32) return { cat: 'History', sub: 'Algol' };
      if (slide <= 37) return { cat: 'History', sub: 'COBOL' };
      return { cat: 'History', sub: 'Prolog' };
    }
    if (lecture === '4') return slide === 6 ? { cat: 'Theory', sub: 'Translation' } : { cat: 'Theory', sub: 'Grammars & BNF' };
    if (lecture === '5.1') return { cat: 'Theory', sub: 'Names & binding' };
    if (lecture === '5.2') {
      if (slide <= 12) return { cat: 'Theory', sub: 'Lifetime & storage' };
      if (slide <= 26) return { cat: 'Theory', sub: 'Scope' };
      return { cat: 'Theory', sub: 'Named constants' };
    }
    return { cat: 'Theory', sub: 'Control structures' };
  }

  (FC.topics = FC.topics || {}).csc370 = card => {
    if (byId.has(card.id)) return byId.get(card.id);
    if (card.blankRef) return blankTopic(card.blankRef.lecture, card.blankRef.slide);
    if (card.lecture === '10') return { cat: 'Theory', sub: 'Control structures' };
    return { cat: 'Theory', sub: 'Other' };
  };
  FC.topics.csc370Order = ['Theory', 'History', 'Programming'];
  // Subgroups in teaching order (History is chronological).
  FC.topics.csc370SubOrder = [].concat(Object.keys(theory), ['Control structures'], Object.keys(history), Object.keys(programming));
})(globalThis.FC = globalThis.FC || {});
