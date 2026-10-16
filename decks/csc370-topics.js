// Topic groups for CSC 370, shown as toggles on the class screen:
//   Theory      concepts (criteria, translation, grammars, names, types, lifetime, scope,
//               control) plus "Argue a design": her "should a language allow X?" questions
//   History     the languages' history (early computing, Fortran, Lisp, Algol, COBOL, Prolog),
//               subgroups in chronological order
//   Programming cards built around reading, tracing or writing code, grouped by language;
//               "C & memory" holds the C exam's work (memory diagrams, pointers, malloc/free)
// FC.topics.csc370(card) -> { cat, sub }. Blank cards are placed by lecture and slide.
// Every authored card must be listed here or be a lecture-10 card (tests/classes.test.js).
(function (FC) {
  'use strict';

  const programming = {
    C: ['l3-banana-out', 'l3-banana-val', 'l52-block-trace', 'l52-sa-tenth', 'l10-assign-trace', 'l10-dangling-4', 'l10-dangling-14', 'l10-fallthrough', 'l10-weird-for', 'l10-c-loop', 'l10-ternary-trace'],
    'C & memory': ['l3-banana-diagram', 'l3-exam-q1-diagram', 'l3-exam-q2-diagram', 'l3-exam-q3-diagram', 'l3-why-money', 'l3-malloc-free', 'l3-reverse-string', 'l3-length', 'l3-count-char',
      'l3-ptr-inc', 'l3-diagram-ptrinc', 'l3-swap-out', 'l3-diagram-swap', 'l3-setto', 'l3-addten', 'l3-arr-ptr', 'l3-arr-mod', 'l3-alias', 'l3-predec', 'l3-walk', 'l3-malloc-trace'],
    Python: ['l52-py-trace', 'l52-kiwi-static', 'l52-kiwi-dynamic', 'l52-abc-static', 'l52-abc-dynamic', 'l52-param-static', 'l52-param-dynamic', 'l10-py-loop'],
    JavaScript: ['l52-js-static', 'l52-js-dynamic'],
    'Scheme / Lisp': ['l2-scheme-trace', 'l1-expressivity', 'l2-code-scheme'],
    Fortran: ['l2-code-fortran'],
    Algol: ['l2-code-algol'],
    COBOL: ['l2-code-cobol'],
    Prolog: ['l2-code-prolog'],
  };
  const theory = {
    'Language basics': ['l1-pl-def', 'l1-turing', 'l1-html', 'l1-categories', 'l1-classify', 'l1-why-study'],
    'Language criteria': ['l1-criteria', 'l1-subcriteria-all', 'l1-simplicity', 'l1-orthogonality', 'l1-orthog-example', 'l1-syntax-design', 'l1-type-checking', 'l1-exception-handling', 'l1-tradeoff', 'l1-readwrite', 'l1-readwrite-w'],
    Translation: ['l4-compiler-steps-list', 'l4-hybrid', 'l4-lexeme-token', 'l4-tokenize-while', 'l4-how-know', 'l4-symtab', 'l4-same', 'l4-diff', 'l4-adv-compiled', 'l4-adv-interp', 'l4-xyz-instr', 'l4-where-2', 'l4-where-x', 'l4-how-instr', 'l4-token-i', 'l4-token-10'],
    'Grammars & BNF': ['l4-gpa-bnf', 'l4-gpa-derive-write', 'l4-gpa-41', 'l4-production', 'l4-sample-derive-write', 'l4-derive-two', 'l4-cannot-a4', 'l4-parse-tree', 'l4-sample-prec',
      'l4-ambiguous', 'l4-ambig-values', 'l4-show-ambig', 'l4-precedence-level', 'l4-write-prec', 'l4-assoc', 'l4-assoc-ambig', 'l4-left-assoc', 'l4-rewrite-left', 'l4-ebnf', 'l4-write-time24', 'l4-write-binary'],
    'Names & binding': ['l51-attrs', 'l51-entities', 'l51-name-issues', 'l51-case', 'l51-anychar', 'l51-meaning', 'l51-keywords', 'l51-maxlen', 'l51-binding-def', 'l51-bindtimes', 'l51-bind-classify', 'l51-bind-classify2', 'l51-name-objcode', 'l51-unique'],
    Types: ['l51-type-name', 'l51-type-infer', 'l51-type-dynamic', 'l51-type-exact', 'l51-explicit-types', 'l3-banana-java'],
    'Lifetime & storage': ['l51-storage', 'l52-lifetime-def', 'l52-static-lifetime', 'l52-static-adv', 'l52-static-disadv', 'l52-static-recursion', 'l52-implicit-heap', 'l52-explicit-heap', 'l52-storage-classify', 'l52-lifetime-vs-scope', 'l52-sa-error'],
    Scope: ['l52-scope-def', 'l52-decl-rules', 'l52-block-java', 'l52-py-unbound', 'l52-scope-hole', 'l52-static-parent', 'l52-dynamic-def', 'l52-dynamic-chain', 'l52-static-scope-adv', 'l52-dynamic-disadv'],
    'Named constants': ['l52-named-const', 'l52-manifest', 'l52-const-c', 'l52-const-csharp', 'l52-const-compare'],
  };
  // Shown after 'Control structures' (lecture 10 cards fall there by default).
  const argue = ['l1-readwrite-which', 'l51-case-arg', 'l51-spaces', 'l51-single',
    'x-argue-goto', 'x-argue-fallthrough', 'x-argue-intcond', 'x-argue-dynscope', 'x-argue-maxlen', 'x-argue-reserved', 'x-argue-nested', 'x-argue-assignexpr'];
  const history = {
    'Early computing': ['l2-eniac-how', 'l2-eniac-women', 'l2-vonneumann', 'l2-plankalkul'],
    'Big four': ['l2-bigfour', 'l2-recursion', 'l2-wsut-oldest', 'l2-wsut-order', 'l2-newest'],
    Fortran: ['l2-fortran-names', 'l2-fortran-acronym', 'l2-ibm704', 'l2-fortran-1954', 'l2-fortran-goal', 'l2-fortran-typing', 'l2-fortran-if', 'l2-fortran-sub'],
    Lisp: ['l2-lisp-origin', 'l2-lisp-dialects', 'l2-lisp-status'],
    Algol: ['l2-algol-committee', 'l2-algol-today', 'l2-algol-origin', 'l2-algol-subgoals', 'l2-algol-death'],
    COBOL: ['l2-cobol-sections', 'l2-cobol-hopper', 'l2-cobol-goals', 'l2-cobol-records'],
    Prolog: ['l2-prolog-true', 'l2-prolog-origin', 'l2-prolog-how'],
  };
  const byId = new Map();
  for (const [cat, groups] of [['Programming', programming], ['Theory', theory], ['Theory', { 'Argue a design': argue }], ['History', history]]) {
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
  FC.topics.csc370SubOrder = [].concat(Object.keys(theory), ['Control structures', 'Argue a design'], Object.keys(history), Object.keys(programming));
})(globalThis.FC = globalThis.FC || {});
