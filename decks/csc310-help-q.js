// Help walkthroughs for the CSC 310 cards on the five bounds' names, kinds and rules
// (c310-3-bnd-*, and the true/false facts c310-3-tf-* added 2026-10-18). Same format as
// decks/csc310-help.js. Every limit and constant here was checked with python3 on 2026-10-18.
(function (FC) {
  'use strict';
  const H = FC.help = FC.help || {};

  const TABLE = {
    head: ['Name', 'Symbol', 'Like', 'Kind of bound', '$\\lim f/g$'],
    rows: [
      ['Big-O', '$O$', '$\\le$', 'upper, may be tight', '$< \\infty$'],
      ['Big-Omega', '$\\Omega$', '$\\ge$', 'lower, may be tight', '$> 0$'],
      ['Big-Theta', '$\\Theta$', '$=$', 'tight (both)', '$0 < L < \\infty$'],
      ['little-o', '$o$', '$<$', 'upper, NOT tight', '$= 0$'],
      ['little-omega', '$\\omega$', '$>$', 'lower, NOT tight', '$= \\infty$'],
    ],
  };
  const kind = (sym, like, answer, ex, mistake) => ({
    asks: `Which of the five notations is ${answer.toLowerCase()}?`,
    idea: `Match each notation to a comparison of numbers. "May be tight" means equality is allowed (like $\\le$ or $\\ge$); "not tight" means strict (like $<$ or $>$).`,
    steps: [
      { text: 'The five, side by side:', table: TABLE },
      `So the answer is ${sym}, which behaves like ${like}. Example: ${ex}`,
    ],
    answer: `${sym}`,
    mistake,
  });

  H['c310-3-bnd-names'] = {
    asks: 'Name each of the five symbols aloud.',
    idea: 'Capital letters are "Big", lower-case letters are "little". The Greek ones are Omega ($\\Omega$, $\\omega$) and Theta ($\\Theta$).',
    steps: [{ text: 'All five:', table: TABLE }],
    answer: '$O$ Big-O, $\\Omega$ Big-Omega, $\\Theta$ Big-Theta, $o$ little-o, $\\omega$ little-omega.',
    mistake: 'Calling $\\omega$ "w" or mixing up $o$ with $O$: the case matters, because little means strict.',
  };
  H['c310-3-bnd-kind-O'] = kind('$O$ (Big-O)', '$\\le$', 'an upper bound that may be tight', '$3n^2 = O(n^2)$ is tight; $n = O(n^2)$ is not, and both are true.', 'Choosing $\\Theta$: $\\Theta$ is tight in BOTH directions, not just an upper bound.');
  H['c310-3-bnd-kind-o'] = kind('$o$ (little-o)', '$<$', 'an upper bound that is NOT tight', '$n = o(n^2)$, but $n^2 \\ne o(n^2)$.', 'Choosing $O$: $O$ allows the tight case ($n^2 = O(n^2)$); $o$ forbids it.');
  H['c310-3-bnd-kind-Omega'] = kind('$\\Omega$ (Big-Omega)', '$\\ge$', 'a lower bound that may be tight', '$n^2 = \\Omega(n^2)$ and $n^2 = \\Omega(n)$ are both true.', 'Choosing $\\omega$: that is the strict version.');
  H['c310-3-bnd-kind-omega'] = kind('$\\omega$ (little-omega)', '$>$', 'a lower bound that is NOT tight', '$n^2 = \\omega(n)$, but $n^2 \\ne \\omega(n^2)$.', 'Choosing $\\Omega$: $\\Omega$ allows the tight case.');

  H['c310-3-bnd-flip-O'] = {
    asks: 'Turn "$f = O(g)$" around: what does it say about $g$ compared with $f$?',
    idea: 'Same as numbers: $a \\le b$ is the same fact as $b \\ge a$. $O$ is the $\\le$, so the flip is the $\\ge$, which is $\\Omega$.',
    steps: [
      '$f = O(g)$: there are $c > 0$, $n_0$ with $f(n) \\le c\\, g(n)$ for $n \\ge n_0$.',
      'Divide by $c$: $g(n) \\ge \\tfrac1c f(n)$. That is the $\\Omega$ definition with constant $1/c$.',
    ],
    answer: '$g = \\Omega(f)$.',
    mistake: 'Answering $g = O(f)$: that would mean they grow at the same rate, which $O$ alone does not say ($n = O(n^2)$ but $n^2 \\ne O(n)$).',
  };
  H['c310-3-bnd-flip-o'] = {
    asks: 'Turn "$f = o(g)$" around: what is $g$ compared with $f$?',
    idea: 'Like $a < b$ being the same fact as $b > a$. Little-o is the $<$, so the flip is the $>$: little-omega.',
    steps: [
      '$f = o(g)$ means $f(n)/g(n) \\to 0$.',
      'Then $g(n)/f(n) \\to \\infty$, which is the limit test for $g = \\omega(f)$.',
    ],
    answer: '$g = \\omega(f)$.',
    mistake: 'Answering $\\Omega$: true, but not the full flip. The strict $o$ flips to the strict $\\omega$.',
  };
  H['c310-3-bnd-flip-Theta'] = {
    asks: 'If $f = \\Theta(g)$, is $g = \\Theta(f)$ too?',
    idea: '$\\Theta$ is like $=$, and $=$ works both ways.',
    steps: [
      '$c_1 g \\le f \\le c_2 g$ for $n \\ge n_0$.',
      'Rearrange: $\\tfrac{1}{c_2} f \\le g \\le \\tfrac{1}{c_1} f$. Those are $\\Theta$ constants for $g$ relative to $f$.',
    ],
    answer: '$g = \\Theta(f)$.',
    mistake: 'Thinking $\\Theta$ needs flipping to a different symbol like $O$ does. It is the one symmetric bound.',
  };
  H['c310-3-bnd-o-implies-O'] = {
    asks: 'If little-o holds, does Big-O hold?',
    idea: 'Little-o demands the bound for EVERY $c$; Big-O only asks for ONE $c$. Passing the harder test passes the easier one.',
    steps: [
      '$f = o(g)$: for every $c > 0$ there is an $n_0$ with $f(n) < c\\, g(n)$ beyond it.',
      'Pick $c = 1$: then $f(n) \\le 1 \\cdot g(n)$ beyond that $n_0$, which is the $O$ definition.',
    ],
    answer: 'Yes: $f = o(g)$ implies $f = O(g)$.',
    mistake: 'Assuming the reverse also holds. It does not: see the next card.',
  };
  H['c310-3-bnd-O-not-o'] = {
    asks: 'Big-O holds. Must little-o hold?',
    idea: 'Big-O allows "same rate". Little-o forbids it. One function that grows at the same rate as $g$ is enough to say no.',
    steps: [
      'Take $f = g = n^2$. Then $f \\le 1 \\cdot g$, so $f = O(g)$.',
      'But $f/g = 1$ does not go to 0, so $f \\ne o(g)$ (for $c = \\tfrac12$, $n^2 < \\tfrac12 n^2$ never holds).',
    ],
    answer: 'No. Counterexample: $n^2 = O(n^2)$ but $n^2$ is not $o(n^2)$.',
    mistake: 'Treating $O$ and $o$ as the same with different typography.',
  };
  H['c310-3-bnd-o-and-Omega'] = {
    asks: 'Can $f$ be strictly slower than $g$ and also at least as fast as $g$?',
    idea: 'No more than $a < b$ and $a \\ge b$ can both hold.',
    steps: [
      '$f = \\Omega(g)$ gives a fixed $c > 0$ with $f \\ge c\\, g$, so $f/g \\ge c$ for large $n$.',
      '$f = o(g)$ needs $f/g \\to 0$, so eventually $f/g < c$. Contradiction.',
    ],
    answer: 'No.',
    mistake: 'Thinking little-o and Big-Omega are about different things (upper vs lower) so they can coexist.',
  };
  H['c310-3-bnd-theta-both'] = {
    asks: 'Which two bounds together make $\\Theta$?',
    idea: '$\\Theta$ is a sandwich: a ceiling and a floor of the same shape.',
    steps: [
      'Ceiling: $f \\le c_2 g$, which is $f = O(g)$.',
      'Floor: $f \\ge c_1 g$, which is $f = \\Omega(g)$.',
      'Both at once (take $n_0$ as the larger of the two) is exactly the $\\Theta$ definition.',
    ],
    answer: '$f = O(g)$ and $f = \\Omega(g)$.',
    mistake: 'Saying $O$ and $o$: $o$ would rule out the floor.',
  };
  H['c310-3-bnd-self'] = {
    asks: 'Compare $f$ with itself. Which of the five hold?',
    idea: 'Like comparing a number with itself: $a \\le a$, $a \\ge a$, $a = a$ are true; $a < a$ and $a > a$ are false.',
    steps: ['The ratio $f/f = 1$: a positive constant.', { text: 'A positive constant limit gives:', table: { head: ['$O$', '$\\Omega$', '$\\Theta$', '$o$', '$\\omega$'], rows: [['yes', 'yes', 'yes', 'no', 'no']] } }],
    answer: '$O$, $\\Omega$ and $\\Theta$ (never $o$ or $\\omega$).',
    mistake: 'Picking "all five": the strict ones can never hold for a function against itself.',
  };
  H['c310-3-bnd-transitive'] = {
    asks: 'Chain two Big-O facts: $f$ under $g$, $g$ under $h$. What about $f$ and $h$?',
    idea: 'Like $a \\le b \\le c$ giving $a \\le c$. The constants multiply.',
    steps: [
      '$f \\le c_1 g$ for $n \\ge n_1$, and $g \\le c_2 h$ for $n \\ge n_2$.',
      'For $n \\ge \\max(n_1, n_2)$: $f \\le c_1 g \\le c_1 c_2 h$. So $f = O(h)$ with constant $c_1 c_2$.',
    ],
    answer: '$f = O(h)$.',
    mistake: 'Concluding $f = \\Theta(h)$: two upper bounds only give an upper bound.',
  };
  H['c310-3-bnd-const'] = {
    asks: 'Multiplying a function by a positive constant: does its growth rate change?',
    idea: 'No. Asymptotic notation ignores constant factors on purpose (they depend on the machine and the compiler).',
    steps: ['$(k f)/f = k$, a positive constant, so the limit test gives $\\Theta$.', 'Examples: $100n = \\Theta(n)$, $n^2/2 = \\Theta(n^2)$, $0.001 \\cdot 2^n = \\Theta(2^n)$.'],
    answer: '$k \\cdot f(n) = \\Theta(f(n))$.',
    mistake: 'Thinking $100n$ is "bigger" than $\\Theta(n)$. It is bigger, but by a constant, which $\\Theta$ absorbs.',
  };
  H['c310-3-bnd-sum'] = {
    asks: 'Adding two growth rates: what is the growth rate of the sum?',
    idea: 'The bigger one wins. The smaller one adds at most as much again.',
    steps: [
      'Let $m = \\max(f, g)$. Then $m \\le f + g$ (both are positive).',
      'And $f + g \\le m + m = 2m$.',
      'So $1 \\cdot m \\le f + g \\le 2 \\cdot m$: the $\\Theta$ sandwich with $c_1 = 1$, $c_2 = 2$.',
    ],
    answer: '$f(n) + g(n) = \\Theta(\\max(f(n), g(n)))$.',
    mistake: 'Answering $\\Theta(f \\cdot g)$ or $\\Theta(f + g)$ "can\'t be simplified". It simplifies to the larger term: $n^2 + n \\lg n = \\Theta(n^2)$.',
  };

  const tf = (asks, idea, steps, answer, mistake) => ({ asks, idea, steps, answer, mistake });
  H['c310-3-tf-n-theta-n2'] = tf('Is $n$ in the tight class of $n^2$?', '$\\Theta$ needs both a ceiling and a floor of shape $n^2$. $n^2$ is a ceiling for $n$, but no $c\\, n^2$ stays under $n$.',
    ['$n / n^2 = 1/n \\to 0$.', 'Limit 0 means $o$ (and $O$), not $\\Theta$.'], 'False. $n = o(n^2)$.', 'Confusing "$n = O(n^2)$" (true) with $\\Theta$.');
  H['c310-3-tf-100n'] = tf('Is $100n$ bounded above by a constant times $n$?', 'Big constants still count as constants.',
    ['We need $100n \\le c \\cdot n$ for large $n$.', 'Take $c = 100$ (any $n_0$).'], 'True, with $c = 100$.', 'Thinking a large constant makes it grow faster than $n$.');
  H['c310-3-tf-2n1'] = tf('Is $2^{n+1}$ the same growth rate as $2^n$?', 'Adding 1 to the exponent multiplies by 2, a constant.',
    ['$2^{n+1} = 2 \\cdot 2^n$.', 'Ratio $2^{n+1}/2^n = 2$: a positive constant, so $\\Theta$.'], 'True.', 'Treating any change to an exponent as a change in growth rate. Adding a constant is fine; multiplying is not (next card).');
  H['c310-3-tf-22n'] = tf('Is $2^{2n}$ bounded above by a constant times $2^n$?', 'Doubling the exponent squares the value: $2^{2n} = (2^n)^2 = 4^n$.',
    ['$2^{2n} / 2^n = 2^n$.', 'That ratio is unbounded, so no constant $c$ works: not $O$. In fact $2^{2n} = \\omega(2^n)$.'], 'False.', 'Pattern-matching on the previous card: $2^{n+1}$ is a constant factor away, $2^{2n}$ is not.');
  H['c310-3-tf-lgn2'] = tf('Is $\\lg(n^2)$ the same growth rate as $\\lg n$?', 'Log rule: $\\lg(a^k) = k \\lg a$.',
    ['$\\lg(n^2) = 2 \\lg n$.', 'Ratio 2: a positive constant, so $\\Theta$.'], 'True.', 'Confusing $\\lg(n^2)$ with $(\\lg n)^2$, which is NOT $\\Theta(\\lg n)$ (its ratio $\\lg n \\to \\infty$).');
  H['c310-3-tf-fact-2n'] = tf('Does $n!$ grow strictly faster than $2^n$?', 'Write both as products of $n$ factors: $n! = 1 \\cdot 2 \\cdots n$ and $2^n = 2 \\cdot 2 \\cdots 2$.',
    ['$n!/2^n = \\tfrac12 \\cdot \\tfrac22 \\cdot \\tfrac32 \\cdots \\tfrac n2$.', { text: 'From the 3rd factor on, each is above 1 and growing:', table: { head: ['$n$', '$n!$', '$2^n$', '$n!/2^n$'], rows: [['4', '24', '16', '1.5'], ['8', '40320', '256', '157.5'], ['12', '479001600', '4096', '116943.75']] } }, 'The ratio goes to $\\infty$: $\\omega$.'],
    'True: $n! = \\omega(2^n)$.', 'Guessing from small $n$: at $n = 3$, $3! = 6 < 8 = 2^3$.');
  H['c310-3-tf-lg-sqrt'] = tf('Does $\\lg n$ grow strictly slower than $\\sqrt n$?', 'Logs lose to every positive power of $n$, even $n^{0.5}$.',
    ['Ratio $\\lg n / \\sqrt n$. Both go to $\\infty$, so use L\'Hôpital.', 'Derivatives: $\\dfrac{1/(n \\ln 2)}{1/(2\\sqrt n)} = \\dfrac{2}{\\sqrt n \\ln 2} \\to 0$.', 'Limit 0: little-o.'],
    'True.', 'Thinking $\\lg n$ and $\\sqrt n$ are "both slow" so they must be $\\Theta$ of each other.');
  H['c310-3-tf-pow-nlgn'] = tf('Is $n^{1.01}$ bounded above by a constant times $n \\lg n$?', 'Cancel one $n$: compare $n^{0.01}$ with $\\lg n$. A power of $n$, however tiny, beats a log eventually.',
    ['$\\dfrac{n^{1.01}}{n \\lg n} = \\dfrac{n^{0.01}}{\\lg n}$.', 'Any positive power beats a log, so this ratio $\\to \\infty$: not $O$ (in fact $n^{1.01} = \\omega(n \\lg n)$).', 'The crossover is enormous ($n$ near $2^{1000}$), which is why it surprises people.'],
    'False.', 'Checking small values: for every $n$ you could ever run, $n \\lg n$ is bigger. Asymptotics is about the limit, not practical sizes.');
})(globalThis.FC = globalThis.FC || {});
