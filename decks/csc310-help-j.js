// Help walkthroughs for the CSC 310 hash-table cards (lecture "Hash Tables", M. Qasem):
// direct addressing, hash functions, open addressing, probe sequences, clustering, deletion.
// Same entry format as decks/csc310-help.js (see its header). Chaining entries live in
// decks/csc310-help-f.js; this file uses the same notation (slot, T[j], $k \bmod m$).
// Conventions are the slides' and the open-addressing worksheet's: linear
// $h(k,i) = (h'(k) + i) \bmod m$; quadratic $(h'(k) + c_1 i + c_2 i^2) \bmod m$ with
// $c_1 = 0$, $c_2 = 1$; double $(h_1(k) + i\,h_2(k)) \bmod m$; probes counted from $i = 0$;
// "-" is an empty slot. Every trace, slot, probe count and number below was computed with
// python3 running exactly those rules on 2026-10-16.
// Academic integrity: no hash-table assignment code, method names, keys, table sizes or
// discussion answers appear here; tryIt problems use their own keys and table sizes.
(function (FC) {
  'use strict';
  const H = FC.help = FC.help || {};

  // A one-row picture of a whole table: slot numbers on top, keys underneath.
  const slots = (m, keys) => ({
    head: ['slot', ...Array.from({ length: m }, (_, i) => String(i))],
    rows: [['key', ...keys.split(',').map(s => s.trim())]],
  });
  const SLIDE_TABLE = '-, -, 41, -, -, 18, 44, 59, 32, 22, 31, 73, -';

  // ═══════════════════════ Dictionaries, direct addressing, hash functions ═══════════════════════

  H['c310-hash-motivation'] = {
    asks: 'Say what we want a dictionary data structure to do, according to the start of the hash-table lecture.',
    idea: 'Think of a phone’s contact list: you type a name (the key) and want the number (the value) at once. You add and delete contacts all the time, and you never need the whole list in sorted order to do that.',
    steps: [
      'Data comes as $\\langle$key, value$\\rangle$ pairs. The slides’ example: prices = { GOOG: 513.25, CAT: 87.22, IBM: 93.37, MSFT: 44.12 }.',
      'Access is by key: prices["GOOG"] should hand back 513.25 directly, without scanning for it.',
      'Three operations must be fast: search, insertion and deletion.',
      { text: 'Why not a structure you already know? Costs with $n$ pairs stored:', table: { head: ['structure', 'search', 'insert', 'delete'], rows: [['unsorted linked list', '$O(n)$', '$O(1)$', '$O(n)$ (find it first)'], ['sorted array', '$O(\\lg n)$', '$O(n)$ (shift)', '$O(n)$ (shift)'], ['hash table (the goal)', '$O(1)$ average', '$O(1)$ average', '$O(1)$ average']] } },
      'Sorted order is not required. That is what lets a hash table scatter keys around its array however the hash function likes.',
    ],
    answer: 'An association of keys to values ($\\langle$key, value$\\rangle$ pairs), with values accessed directly by key and fast search, insertion and deletion. Sorting is usually not needed.',
    mistake: 'Adding "keeps keys in sorted order" to the list. A dictionary only promises fast access by key, and a hash table gives up order in exchange.',
    tryIt: { q: 'Which of these is a dictionary NOT designed to make fast: (a) look up the price stored under "IBM", (b) print every ticker in alphabetical order, (c) delete the entry for "CAT"?', a: '(b). Lookup and delete by key are the dictionary’s job; an alphabetical listing needs sorting, which a dictionary does not care about.' },
  };

  H['c310-hash-adt-names'] = {
    asks: 'Give the three names the course uses for the abstract data type that maps keys to values.',
    idea: 'An abstract data type (ADT) is a promise about operations ("give me the value for this key"), not a way of storing data. The same promise goes by three names, and a hash table is one way to keep it.',
    steps: [
      'Name 1: Dictionary. Like a real dictionary: look up a word (key), read its definition (value).',
      'Name 2: Map. Each key maps to one value, as in prices["GOOG"] $\\to$ 513.25.',
      'Name 3: Partial Map. "Partial" because most possible keys have no value: "XYZ" is a legal string but is not in prices.',
      { text: 'ADT versus data structure:', table: { head: ['level', 'example', 'what it fixes'], rows: [['ADT', 'Dictionary / Map / Partial Map', 'which operations exist (search, insert, delete by key)'], ['data structure', 'hash table', 'how pairs are stored; search $O(1)$ on average'], ['data structure', 'linked list of pairs', 'same operations, but search is $O(n)$']] } },
    ],
    answer: 'Dictionary, Map, Partial Map.',
    mistake: 'Listing "hash table" as one of the names. A hash table implements the ADT; it is not the ADT.',
    tryIt: { q: 'Is a hash table an ADT or a data structure? Name one other structure from the slides’ list (slide 3) that could implement a Map.', a: 'A data structure. A linked list (or double linked list) of $\\langle$key, value$\\rangle$ pairs also works; its search just costs $O(n)$ instead of $O(1)$ on average.' },
  };

  H['c310-hash-direct-def'] = {
    asks: 'Describe a direct-address table: what it assumes about the keys, what each array cell holds, and how long its operations take.',
    idea: 'Use the key itself as the array index. If every key is a small whole number, the key is its own address: the item with key 7 lives in T[7], like room 7 being the 7th door in a hallway.',
    steps: [
      'Assumption 1: every key is in the range $0..m-1$, so it is a legal index into T[0..m−1].',
      'Assumption 2: keys are distinct, so no two items ever want the same cell.',
      { text: 'Example: $m = 8$, items with keys 2, 5 and 7 (values Ana, Ben, Cy):', table: { head: ['slot', '0', '1', '2', '3', '4', '5', '6', '7'], rows: [['T[slot]', 'NULL', 'NULL', 'Ana', 'NULL', 'NULL', 'Ben', 'NULL', 'Cy']] } },
      'Search key 5: read T[5] and find Ben; insert key 3: write T[3]. Delete key 7: set T[7] = NULL.',
      'Each operation is one array access with no loop and no key comparisons, so each is $O(1)$.',
    ],
    answer: 'Keys are distinct and in $0..m-1$. T[0..m−1] has T[i] = the item whose key is i, or NULL if there is none. Search, insert and delete each take $O(1)$.',
    mistake: 'Leaving out the two assumptions. Without "distinct" two items fight over one cell, and without "range $0..m-1$" a key is not even a legal index.',
    tryIt: { q: 'Seats in a lecture hall are numbered 0 to 119 and every student has a different seat. In a direct-address table keyed by seat: how many cells, where does the student in seat 47 go, and what does deleting them cost?', a: '$m = 120$ cells, T[0..119]. The student goes in T[47]. Deleting sets T[47] = NULL: one access, $O(1)$.' },
  };

  H['c310-hash-direct-problem'] = {
    asks: 'Explain what breaks when direct addressing is used for 32-bit integer keys, and what the course does instead.',
    idea: 'Direct addressing needs a cell for every key that could ever appear, not just for the keys you actually have. With 32-bit keys that is billions of cells to store perhaps a thousand items, like building a hotel with a room for every person on Earth to host one conference.',
    steps: [
      'A 32-bit key can be any of $2^{32} = 4{,}294{,}967{,}296$ values, so T needs over 4 billion cells.',
      'Memory: at 8 bytes per cell (one pointer) that is $2^{32} \\times 8 = 2^{35}$ bytes, which is 32 GiB.',
      'Time: even with the memory, setting all $2^{32}$ cells to NULL before the first insert takes over 4 billion writes.',
      'Waste: 1,000 stored keys would use $1000 / 2^{32} \\approx 0.00002\\%$ of the cells.',
      'Fix (slide 5): map keys into a much smaller range $0..p-1$, with $p \\ll m$. The function that does this is the hash function; the price is that two keys can now land in the same cell.',
    ],
    graph: {
      caption: 'Cells a direct-address table needs for $b$-bit keys (log scale): the count doubles with every extra bit. The flat line is the 1,000 keys you might actually store.',
      x: [8, 32], logY: true, xLabel: 'key size b (bits)', yLabel: 'cells',
      curves: [
        { label: '$2^b$ cells needed', f: b => 2 ** b, tone: 'a' },
        { label: '1,000 keys stored', f: () => 1000, tone: 'c' },
      ],
      bars: { label: '$2^8$, $2^{16}$, $2^{24}$, $2^{32}$', tone: 'b', values: [[8, 256], [16, 65536], [24, 16777216], [32, 4294967296]] },
    },
    answer: 'The table needs $2^{32}$ (over 4 billion) entries: too much memory, and even initialising them all to NULL takes too long. Fix: a hash function maps keys into a small range $0..p-1$ with $p \\ll m$.',
    mistake: 'Saying the operations become slower. Each one is still $O(1)$; the trouble is the size of the table and the time to set it up.',
    tryIt: { q: 'Keys are 24-bit integers. How many cells would a direct-address table need, and how many bytes at 4 bytes per cell?', a: '$2^{24} = 16{,}777{,}216$ cells, and $2^{24} \\times 4 = 2^{26} = 67{,}108{,}864$ bytes (64 MiB). Possible, but wasteful if only a few thousand keys are stored.' },
  };

  H['c310-hash-uniform'] = {
    asks: 'Define simple uniform hashing.',
    idea: 'Picture throwing each key blindfolded at a row of $m$ buckets: every bucket is equally likely to catch it. A hash function that behaves like that spreads keys evenly, so no slot gets crowded.',
    steps: [
      'Definition: each key is equally likely to hash to any of the $m$ slots, so each slot has probability $1/m$.',
      'Consequence: with $n$ keys, each slot expects $n/m = \\alpha$ of them.',
      { text: 'Patterns in the data can break it. Keys 10, 20, …, 100 (all multiples of 10):', table: { head: ['$k$', '10', '20', '30', '40', '50', '60', '70', '80', '90', '100'], rows: [['$k \\bmod 10$', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0'], ['$k \\bmod 11$', '10', '9', '8', '7', '6', '5', '4', '3', '2', '1']] } },
      'With $m = 10$ every key lands in slot 0: $k \\bmod 10$ is the last digit, and every key ends in 0. With $m = 11$ the same keys use 10 different slots.',
      'Slide 7’s advice: derive the hash value in a way that is independent of patterns likely in the data (here, "the last digit is always 0").',
    ],
    answer: 'Each key is equally likely to hash to any of the $m$ slots.',
    mistake: 'Thinking it means "no collisions". A perfectly uniform hash still collides; uniform only means no slot is favoured.',
    tryIt: { q: 'Keys 4, 8, 12, 16, 20, 24. How many different slots does $h(k) = k \\bmod 8$ use? And $h(k) = k \\bmod 7$?', a: '$\\bmod 8$: 4, 0, 4, 0, 4, 0, only 2 slots (the keys are multiples of 4, which divides 8). $\\bmod 7$: 4, 1, 5, 2, 6, 3, all 6 different.' },
  };

  H['c310-hash-mod-apply'] = {
    asks: 'With $h(x) =$ the last four digits of $x$ and a table of $N = 10{,}000$ slots, find the slot for SSN 271-82-8182.',
    idea: 'The last four digits of a number are what is left after removing every full 10,000 from it. So "last four digits" is $x \\bmod 10{,}000$, which always lands in $0..9999$: exactly the slot numbers.',
    steps: [
      'Write the SSN as one integer: $x = 271{,}828{,}182$.',
      'Split off the multiples of 10,000: $271{,}828{,}182 = 27{,}182 \\times 10{,}000 + 8{,}182$.',
      'The remainder is $x \\bmod 10{,}000 = 8182$, the last four digits.',
      'Range check: $0 \\le 8182 \\le 9999$, a valid slot in a table of size $N = 10{,}000$.',
      'Slide 11 says "setting $N = 1000$ and looking at the last four digits"; those two do not match. Last four digits need $N = 10{,}000$, while $x \\bmod 1000$ keeps only the last three.',
    ],
    answer: 'Slot 8182: $271828182 \\bmod 10000 = 8182$.',
    mistake: 'Taking the first four digits (2718). The hash keeps the end of the number, because $\\bmod$ returns the remainder.',
    tryIt: { q: 'Same rule, SSN 314-15-9265. Which slot when $N = 10{,}000$? Which when $N = 100$ and $h(x) = x \\bmod 100$?', a: '$314159265 \\bmod 10000 = 9265$, so slot 9265. $314159265 \\bmod 100 = 65$, so slot 65.' },
  };

  H['c310-hash-ssn-collide'] = {
    asks: 'With $N = 100$ and $h(x) = x \\bmod 100$ (the last two digits), pick the two SSNs that land in the same slot.',
    idea: 'Two keys collide when their hash values are equal. Here the hash is just the last two digits, so only the end of each number matters.',
    steps: [
      { text: 'Hash every SSN in the options:', table: { head: ['SSN', 'last two digits', 'slot'], rows: [['025-612-0001', '01', '1'], ['981-101-0002', '02', '2'], ['451-229-0004', '04', '4'], ['200-751-9901', '01', '1']] } },
      '025-612-0001 and 200-751-9901 both go to slot 1: different keys, same slot. That is a collision.',
      'Slide 11 puts $n = 49$ employees into $N = 100$ slots. The chance that no two collide is $\\frac{100}{100} \\cdot \\frac{99}{100} \\cdots \\frac{52}{100} \\approx 0.0000006$.',
      'So a collision is all but certain with the table half empty, which is why the slides say we "need a method to handle collisions".',
    ],
    graph: {
      caption: 'Chance of at least one collision when $n$ keys hash uniformly into 100 slots. It passes 50% at just 12 keys and is essentially certain at 49.',
      x: [0, 50], y: [0, 1.05], xLabel: 'n (keys)', yLabel: 'P(some collision)',
      curves: [{ label: '$1 - \\frac{100}{100} \\cdot \\frac{99}{100} \\cdots \\frac{100-n+1}{100}$', f: n => { let p = 1; for (let i = 0; i < Math.floor(n); i++) p *= (100 - i) / 100; return 1 - p; }, tone: 'a' }],
      marks: [{ x: 12, label: '$n = 12$: about 50%' }, { x: 49, label: '$n = 49$' }],
    },
    answer: '025-612-0001 and 200-751-9901: both end in 01, so both hash to slot 1.',
    mistake: 'Looking for keys that are numerically close (0001 and 0002). Keys collide when their hash values match, and here only the last two digits count.',
    tryIt: { q: '$N = 100$, $h(x) = x \\bmod 100$. Which two collide: 123-45-6789, 987-65-4389, 555-12-3488?', a: 'Last two digits 89, 89, 88. The first two collide in slot 89.' },
  };

  H['c310-hash-avoid'] = {
    asks: 'Say whether collisions can be avoided, for both cases the slides distinguish.',
    idea: 'A hash function squeezes many possible keys into few slots; with more possible keys than slots, some must share. The only escape is knowing in advance exactly which keys will ever be stored.',
    steps: [
      'General case: SSNs have $10^9$ possible values, and the table has $10^4$ slots.',
      'Pigeonhole principle: whatever $h$ is, some slot receives at least $10^9 / 10^4 = 100{,}000$ of the possible keys. If two of those ever show up, they collide.',
      'So in general no hash function avoids collisions, and the table must handle them (chaining or open addressing).',
      'Static case: if the key set never changes (immutable data, e.g. the reserved words of a programming language), you can pick $h$ to give each of those keys its own slot.',
      'That is perfect hashing, named on slide 12 but not covered. It needs at least as many slots as keys.',
    ],
    answer: 'If the set of keys is static (immutable data), yes: perfect hashing. In general, no.',
    mistake: 'Answering "yes, with a good enough hash function". A better $h$ lowers the collision rate, but with more possible keys than slots it cannot reach zero for unknown data.',
    tryIt: { q: 'The keys are fixed forever as {14, 22, 30}. Is $h(k) = k \\bmod 3$ perfect for them? Is $h(k) = k \\bmod 4$?', a: '$\\bmod 3$: 2, 1, 0, all different, so yes. $\\bmod 4$: 2, 2, 2, every key collides, so no.' },
  };

  H['c310-hash-applications'] = {
    asks: 'Name the four uses of hashing listed on the summary slide.',
    idea: 'Hashing pays off wherever a program must find one item among very many, by a key, quickly. Each use below is a key-to-value lookup in disguise.',
    steps: [
      { text: 'The four uses, with the key and what it finds:', table: { head: ['use', 'key', 'finds'], rows: [['database indexing', 'a record’s key (e.g. a student ID)', 'where that record is stored'], ['compilers', 'an identifier’s name', 'its type and location (the symbol table)'], ['caching', 'a request (e.g. a URL)', 'a saved copy of the result'], ['password authentication', 'the hash of the typed password', 'a match with the stored hash']] } },
      'Mnemonic: D-C-C-P, "Data, Code, Cache, Passwords".',
      'Password systems store the hash of a password, never the password; at login they hash what you type and compare. That uses a cryptographic hash, a stronger cousin of this lecture’s table hash functions.',
    ],
    answer: 'Database indexing, compilers, caching, password authentication.',
    mistake: 'Adding sorting or "find all keys between $a$ and $b$". A hash table scatters keys, so anything that needs order is a poor fit.',
    tryIt: { q: 'A web browser keeps recently loaded pages so it can show them again without downloading. Which of the four uses is that, and what is the key?', a: 'Caching. The key is the page’s URL and the value is the saved page.' },
  };

  // ═══════════════════════ Open addressing ═══════════════════════

  H['c310-hash-oa-basics'] = {
    asks: 'Describe how insert and search work in an open-addressing hash table.',
    idea: 'Every key lives in the array itself, one per slot. If your slot is taken, walk to the next slot in a fixed order (the probe sequence) until one is free; a search walks exactly the same route.',
    steps: [
      'Use $m = 9$, $h(k) = k \\bmod 9$ and linear probing (next slot, wrapping around). Keys 14, 23, 32 all hash to 5.',
      { text: 'Insert them in order:', table: { head: ['key $k$', '$h(k)$', 'slots tried', 'placed in'], rows: [['14', '5', '5 (empty)', '5'], ['23', '5', '5 (14), 6 (empty)', '6'], ['32', '5', '5 (14), 6 (23), 7 (empty)', '7']] } },
      'Search 32: probe 5 (14), 6 (23), 7 (32), found after 3 probes. It retraces the route its insert took.',
      'Search 41 ($41 \\bmod 9 = 5$): probe 5 (14), 6 (23), 7 (32), 8 (empty). Stop: 41 is not in the table.',
      'Why an empty slot means "absent": had 41 ever been inserted, its insert would have walked this same route and stopped at slot 8 or earlier.',
    ],
    answer: 'Insert: if the slot is full, try another slot, and so on until an open one is found (probing). Search: follow the same probe sequence; reaching the key returns it, reaching an empty (NULL) slot means the key is not in the table.',
    mistake: 'Checking only slot $h(k)$ and giving up if the key is not there. With open addressing the key may sit several probes further along.',
    tryIt: { q: '$m = 8$, $h(k) = k \\bmod 8$, linear probing. Insert 19, 27, 35, then search for 43. Which slots does the search probe?', a: 'All four keys hash to 3. 19 → 3, 27 → 4, 35 → 5. Search 43 probes 3 (19), 4 (27), 5 (35), 6 (empty): not found after 4 probes.' },
  };

  H['c310-hash-oa-props'] = {
    asks: 'List the properties of open addressing given in the course, including the two load-factor limits.',
    idea: 'All keys sit inside one fixed array, with no linked lists. So the array can never hold more keys than it has slots, and the fuller it gets, the longer every probe walk becomes.',
    steps: [
      'A colliding item goes into a different cell of the same table, not into a list hanging off the slot.',
      'No dynamic memory: nothing is allocated per key. The table size $m$ is fixed when the table is created.',
      'Load factor $\\alpha = n/m$. One key per slot means $n \\le m$, so $\\alpha \\le 1$ always.',
      { text: 'Why the slides want $n/m < 0.5$: expected probes for an unsuccessful search, using the textbook bound $\\frac{1}{1-\\alpha}$ (not on the slides):', table: { head: ['$\\alpha$', '0.25', '0.5', '0.75', '0.9', '0.99'], rows: [['$\\frac{1}{1-\\alpha}$', '1.33', '2', '4', '10', '100']] } },
      'Below 0.5 a failed search costs at most about 2 probes. Past that the cost climbs fast.',
    ],
    graph: {
      caption: 'Expected probes for an unsuccessful search, $\\frac{1}{1-\\alpha}$: small and flat left of $\\alpha = 0.5$, then it shoots up as the table fills.',
      x: [0, 0.95], y: [0, 21], xLabel: 'load factor α = n/m', yLabel: 'expected probes',
      curves: [{ label: '$\\frac{1}{1-\\alpha}$', f: a => 1 / (1 - a), tone: 'a' }],
      marks: [{ x: 0.5, label: '$\\alpha = 0.5$' }],
    },
    answer: 'Colliding items go in a different cell of the table; no dynamic memory; fixed table size; load factor $n/m \\le 1$; keep $n/m < 0.5$ for reasonable performance.',
    mistake: 'Treating $n/m \\le 1$ and $n/m < 0.5$ as one rule. The first is a hard limit (there is no room otherwise); the second is performance advice.',
    tryIt: { q: 'An open-addressing table has $m = 64$ slots. What is the most keys it can hold, and the most it should hold under the slides’ advice?', a: 'At most 64, since $n \\le m$. For $n/m < 0.5$ you need $n < 32$, so at most 31 keys.' },
  };

  H['c310-hash-search-stop'] = {
    asks: 'In HASH-SEARCH(T, k), name the two conditions that end the loop without finding k, and what it returns then.',
    idea: 'A search can fail in two ways: it reaches an empty slot (proof the key was never placed on this route), or it has used up all $m$ probes (nothing left to check). Either way it returns NIL.',
    steps: [
      'The loop: $i = 0$; repeat { $j = h(k, i)$; if T[$j$] == $k$, return $j$; $i = i + 1$ } until T[$j$] == NIL or $i == m$; return NIL.',
      'Condition 1, T[$j$] == NIL: the slot just probed is empty. An insert of k would have stopped there, so k is absent.',
      'Condition 2, $i == m$: all probes $h(k, 0), \\dots, h(k, m-1)$ are used up. This happens only when no NIL was met, e.g. in a full table.',
      { text: 'Example: full table $m = 4$ holding 8, 13, 2, 7; linear probing; search for 12 ($12 \\bmod 4 = 0$):', table: { head: ['$i$', '$j = h(12, i)$', 'T[$j$]', 'T[$j$] == 12?', '$i$ after', 'stop?'], rows: [['0', '0', '8', 'no', '1', 'no'], ['1', '1', '13', 'no', '2', 'no'], ['2', '2', '2', 'no', '3', 'no'], ['3', '3', '7', 'no', '4', 'yes: $i == m$']] } },
      'The loop ends with $i = 4 = m$ and returns NIL. Without this check, a search in a full table would loop forever.',
    ],
    answer: 'It stops when T[$j$] == NIL or when $i == m$ (all $m$ slots probed), and returns NIL.',
    mistake: 'Listing only the NIL condition. A full table has no NIL, so the $i == m$ check is what stops the loop there.',
    tryIt: { q: '$m = 6$, $h^{\\prime}(k) = k \\bmod 6$, linear probing; T[0] = 4, T[3] = 9, T[4] = 15, T[5] = 21, slots 1 and 2 empty. Trace HASH-SEARCH for 27. Which condition stops it?', a: '$27 \\bmod 6 = 3$. Probes 3 (9), 4 (15), 5 (21), 0 (4), 1 (NIL). It stops on T[$j$] == NIL with $i = 5 < 6$ and returns NIL.' },
  };

  H['c310-hash-insert-overflow'] = {
    asks: 'Say when HASH-INSERT(T, k) reports "hash table overflow", and what it returns when it succeeds.',
    idea: 'Insert walks the probe sequence looking for an empty slot. It gets $m$ tries, one per value of $i$; if every one hits a full slot, it gives up with an error.',
    steps: [
      'The loop: $i = 0$; repeat { $j = h(k, i)$; if T[$j$] == NIL { T[$j$] = $k$; return $j$ } else $i = i + 1$ } until $i == m$; error "hash table overflow".',
      { text: 'Example: $m = 4$, $h^{\\prime}(k) = k \\bmod 4$, linear probing; T[1] = 9, T[2] = 14, T[3] = 3, slot 0 empty. Insert 17 ($17 \\bmod 4 = 1$):', table: { head: ['$i$', '$j$', 'T[$j$]', 'action'], rows: [['0', '1', '9', 'full: $i = 1$'], ['1', '2', '14', 'full: $i = 2$'], ['2', '3', '3', 'full: $i = 3$'], ['3', '0', 'NIL', 'store 17, return 0']] } },
      'Now insert 21 ($21 \\bmod 4 = 1$): slots 1, 2, 3, 0 are all full, $i$ reaches $4 = m$, and the loop ends with "hash table overflow".',
      'This basic version accepts only NIL. The version with DELETED markers also stores into a DELETED cell.',
      'With quadratic probing the $m$ probes can repeat slots, so overflow can be reported while empty slots remain.',
    ],
    answer: 'When $i$ reaches $m$: all $m$ probe positions $h(k, 0), \\dots, h(k, m-1)$ were full. Otherwise it stores k in the first NIL slot $j = h(k, i)$ and returns $j$.',
    mistake: 'Thinking it returns the key or a true/false flag. HASH-INSERT returns the slot index $j$ where k was stored.',
    tryIt: { q: '$m = 3$, $h^{\\prime}(k) = k \\bmod 3$, linear probing, empty table. Insert 7, 10, 13, 16. What does each call return?', a: 'All hash to 1. 7 returns 1; 10 tries 1, returns 2; 13 tries 1, 2, returns 0; 16 tries 1, 2, 0, all full, $i = 3 = m$: "hash table overflow".' },
  };

  H['c310-hash-oa-expected'] = {
    asks: 'Use the bound $1/(1-\\alpha)$ for an unsuccessful search to find the expected number of probes at $\\alpha = 0.9$.',
    idea: 'In a table that is a fraction $\\alpha$ full, each probe hits an occupied slot with probability about $\\alpha$. Searching for a missing key is like rolling a die until it shows "empty", and empty comes up with probability $1 - \\alpha$. The average number of rolls until something of probability $1 - \\alpha$ happens is $\\frac{1}{1-\\alpha}$.',
    steps: [
      'The first probe always happens: count 1. It hits a full slot with probability $\\alpha$, so a second probe happens with probability $\\alpha$, a third with probability about $\\alpha^2$, and so on.',
      'Expected probes $\\le 1 + \\alpha + \\alpha^2 + \\alpha^3 + \\dots = \\frac{1}{1 - \\alpha}$, a geometric series (valid because $\\alpha < 1$).',
      'Plug in $\\alpha = 0.9$: $\\frac{1}{1 - 0.9} = \\frac{1}{0.1} = 10$.',
      { text: 'Compare loads; the second row is the textbook bound for a successful search, $\\frac{1}{\\alpha}\\ln\\frac{1}{1-\\alpha}$:', table: { head: ['$\\alpha$', '0.25', '0.5', '0.75', '0.9', '0.95'], rows: [['unsuccessful $\\frac{1}{1-\\alpha}$', '1.33', '2', '4', '10', '20'], ['successful $\\frac{1}{\\alpha}\\ln\\frac{1}{1-\\alpha}$', '1.15', '1.39', '1.85', '2.56', '3.15']] } },
      'Going from half full to 90% full multiplies the failed-search cost by 5, which is why the slides advise $n/m < 0.5$. Both bounds come from the textbook (CLRS Theorems 11.6 and 11.8), not the slides.',
    ],
    graph: {
      caption: 'Both bounds stay small up to $\\alpha = 0.5$. The unsuccessful one then explodes and reaches 10 at $\\alpha = 0.9$.',
      x: [0.01, 0.95], y: [0, 21], xLabel: 'load factor α', yLabel: 'expected probes',
      curves: [
        { label: 'unsuccessful $\\frac{1}{1-\\alpha}$', f: a => 1 / (1 - a), tone: 'a' },
        { label: 'successful $\\frac{1}{\\alpha}\\ln\\frac{1}{1-\\alpha}$', f: a => Math.log(1 / (1 - a)) / a, tone: 'b' },
      ],
      marks: [{ x: 0.5, label: '$\\alpha = 0.5$' }, { x: 0.9, label: '$\\alpha = 0.9$: 10 probes' }],
    },
    answer: '10 probes: $1/(1 - 0.9) = 1/0.1 = 10$, against 2 at $\\alpha = 0.5$.',
    mistake: 'Computing $1/0.9 \\approx 1.1$ by dropping the "$1 -$". The denominator is the fraction of slots still empty, $1 - \\alpha = 0.1$.',
    tryIt: { q: 'Expected probes for an unsuccessful search at $\\alpha = 0.75$, and at $\\alpha = 0.95$?', a: '$\\frac{1}{0.25} = 4$ and $\\frac{1}{0.05} = 20$. Going from 75% to 95% full makes failed searches 5 times slower.' },
  };

  // ═══════════════════════ Probe sequences: linear probing ═══════════════════════

  H['c310-hash-probe-order'] = {
    asks: 'List the three common probing techniques in the order the course gives them.',
    idea: 'All three answer one question: "that slot was full, where next?". Linear steps by 1, quadratic takes steps that grow, and double hashing takes a step size that depends on the key; each fixes a weakness of the one before.',
    steps: [
      'Use $m = 11$, $h^{\\prime}(k) = k \\bmod 11$ and key 37: $37 \\bmod 11 = 4$.',
      { text: 'First four probes ($i = 0, 1, 2, 3$) of each method:', table: { head: ['method', '$h(k, i)$', 'probes'], rows: [['1. linear', '$(4 + i) \\bmod 11$', '4, 5, 6, 7'], ['2. quadratic ($c_1 = 0$, $c_2 = 1$)', '$(4 + i^2) \\bmod 11$', '4, 5, 8, 2'], ['3. double, $h_2(k) = 1 + (k \\bmod 10) = 8$', '$(4 + 8i) \\bmod 11$', '4, 1, 9, 6']] } },
      'Linear: keys pile up into long runs of full slots (primary clustering).',
      'Quadratic: jumps out of runs, but two keys with the same start still follow the same path (secondary clustering).',
      'Double hashing: the step $h_2(k)$ differs from key to key, so even keys with the same start split up.',
    ],
    answer: '1. Linear probing, 2. Quadratic probing, 3. Double hashing.',
    mistake: 'Putting double hashing in the middle. The order runs from the weakest fix for clustering to the strongest: step 1, growing steps, key-dependent steps.',
    tryIt: { q: '$m = 13$, key 50. Give the first three probes for linear ($h^{\\prime}(k) = k \\bmod 13$), quadratic ($c_1 = 0$, $c_2 = 1$), and double hashing with $h_2(k) = 1 + (k \\bmod 12)$.', a: '$50 \\bmod 13 = 11$. Linear: 11, 12, 0. Quadratic: 11, 12, $(11 + 4) \\bmod 13 = 2$. Double: $h_2 = 1 + 2 = 3$, so 11, $14 \\bmod 13 = 1$, $17 \\bmod 13 = 4$.' },
  };

  H['c310-hash-linear-formula'] = {
    asks: 'Write the linear-probing function $h(k, i)$ and say which slots it visits, in order.',
    idea: 'Start at the key’s own slot $h^{\\prime}(k)$ and step one slot to the right after each failed probe. The $\\bmod m$ bends the array into a circle: one step right from the last slot lands on slot 0.',
    steps: [
      'Formula: $h(k, i) = (h^{\\prime}(k) + i) \\bmod m$ for $i = 0, 1, \\dots, m - 1$. Here $h^{\\prime}$ is the auxiliary (ordinary) hash function and $i$ counts probes from 0.',
      { text: 'Example: $m = 8$, $h^{\\prime}(k) = k \\bmod 8$, key 29, so $h^{\\prime}(29) = 5$:', table: { head: ['$i$', '$5 + i$', '$(5 + i) \\bmod 8$'], rows: [['0', '5', '5'], ['1', '6', '6'], ['2', '7', '7'], ['3', '8', '0'], ['4', '9', '1'], ['5', '10', '2'], ['6', '11', '3'], ['7', '12', '4']] } },
      'Read the last column: 5, 6, 7, then wrap to 0, 1, 2, 3, 4. Every slot appears exactly once.',
      'So $m$ probes are enough to try the whole table, which is why $i$ stops at $m - 1$.',
    ],
    answer: '$h(k, i) = (h^{\\prime}(k) + i) \\bmod m$, $i = 0, 1, \\dots, m - 1$: first T[$h^{\\prime}(k)$], then the next slot, then the next, wrapping to slot 0 after slot $m - 1$.',
    mistake: 'Starting the count at $i = 1$, which skips the home slot. The first probe is $i = 0$: the slot $h^{\\prime}(k)$ itself.',
    tryIt: { q: '$m = 12$, $h^{\\prime}(k) = k \\bmod 12$. List the first four probes for key 58.', a: '$58 = 4 \\cdot 12 + 10$, so $h^{\\prime}(58) = 10$. Probes: 10, 11, $12 \\bmod 12 = 0$, $13 \\bmod 12 = 1$.' },
  };

  H['c310-hash-linear-slide-73'] = {
    asks: 'Insert 18, 41, 22, 44, 59, 32, 31, 73 with linear probing into $m = 13$, $h(x) = x \\bmod 13$, and find where 73 lands.',
    idea: 'Do the inserts one at a time and keep the table current: a key’s fate depends on everything inserted before it. 73 must walk past keys that are not even its own collisions, because earlier keys spilled into its neighbourhood.',
    steps: [
      { text: 'Insert trace:', table: { head: ['key', '$h(k) = k \\bmod 13$', 'slots tried', 'placed in'], rows: [['18', '5', '5', '5'], ['41', '2', '2', '2'], ['22', '9', '9', '9'], ['44', '5', '5 (18), 6', '6'], ['59', '7', '7', '7'], ['32', '6', '6 (44), 7 (59), 8', '8'], ['31', '5', '5, 6, 7, 8, 9 (all full), 10', '10'], ['73', '8', '8 (32), 9 (22), 10 (31), 11', '11']] } },
      '$73 = 5 \\cdot 13 + 8$, so $h(73) = 8$.',
      'Slot 8 holds 32, slot 9 holds 22 and slot 10 holds 31: three full probes.',
      'Slot 11 is empty, so 73 goes there on the 4th probe.',
      '73’s home slot 8 is occupied by 32, which hashed to 6, not 8. Spilled keys block other keys’ homes: that is clustering.',
    ],
    answer: 'Slot 11. $h(73) = 8$; slots 8 (32), 9 (22) and 10 (31) are full, so 73 lands in 11.',
    mistake: 'Answering 8 because $73 \\bmod 13 = 8$. That is only the first probe; check whether slot 8 is already taken.',
    tryIt: { q: '$m = 9$, $h(x) = x \\bmod 9$, linear probing. Insert 20, 11, 30, 2 in that order. Where does 2 land?', a: 'Homes: 20 → 2, 11 → 2, 30 → 3, 2 → 2. 20 takes 2; 11 tries 2, takes 3; 30 tries 3 (11), takes 4; 2 tries 2, 3, 4 and takes slot 5.' },
  };

  H['c310-hash-linear-slide-31'] = {
    asks: 'After 18, 41, 22, 44, 59, 32 are in the table ($m = 13$, linear probing), count the probes needed to insert 31.',
    idea: 'A probe is one slot inspected, and the final empty slot counts too. Write down the table first, then walk from $h(31)$ and count every slot you look at.',
    steps: [
      { text: 'Table after the first six inserts:', table: slots(13, '-, -, 41, -, -, 18, 44, 59, 32, 22, -, -, -') },
      '$31 = 2 \\cdot 13 + 5$, so $h(31) = 5$.',
      { text: 'Walk:', table: { head: ['probe #', '$i$', 'slot $(5 + i) \\bmod 13$', 'holds', 'action'], rows: [['1', '0', '5', '18', 'full, go on'], ['2', '1', '6', '44', 'full, go on'], ['3', '2', '7', '59', 'full, go on'], ['4', '3', '8', '32', 'full, go on'], ['5', '4', '9', '22', 'full, go on'], ['6', '5', '10', '-', 'empty: place 31']] } },
      'Count: 5 full slots plus the empty one, 6 probes.',
    ],
    answer: '6 probes: slots 5, 6, 7, 8, 9 are full and slot 10 is free.',
    mistake: 'Answering 5 (only the collisions) or 10 (the final slot). The probe count is every slot inspected, including the one where the key is stored.',
    tryIt: { q: '$m = 10$, $h(x) = x \\bmod 10$, linear probing. After inserting 13, 24, 33, how many probes does inserting 43 take?', a: '13 → 3, 24 → 4, 33 tries 3, 4 and takes 5. 43 hashes to 3 and probes 3, 4, 5 (full) and 6 (empty): 4 probes.' },
  };

  H['c310-hash-linear-slide-table'] = {
    asks: 'Insert 18, 41, 22, 44, 59, 32, 31, 73 into $m = 13$ with linear probing and $h(x) = x \\bmod 13$, then write out all 13 slots.',
    idea: 'Fill the array key by key: each key takes its home slot if free, otherwise the first free slot to its right. Then read the array from slot 0 to slot 12.',
    steps: [
      { text: 'Home slots (divide by 13, keep the remainder):', table: { head: ['key', '18', '41', '22', '44', '59', '32', '31', '73'], rows: [['$k \\bmod 13$', '5', '2', '9', '5', '7', '6', '5', '8']] } },
      'Keys whose home is free go straight there: 18 → 5, 41 → 2, 22 → 9, 59 → 7.',
      '44: home 5 holds 18, so 6. 32: home 6 holds 44 and 7 holds 59, so 8.',
      '31: slots 5 to 9 are all full, so 10. 73: slots 8, 9, 10 are full, so 11.',
      { text: 'Final table:', table: slots(13, SLIDE_TABLE) },
    ],
    answer: '-, -, 41, -, -, 18, 44, 59, 32, 22, 31, 73, -',
    mistake: 'Putting every key in its home slot first and fixing collisions afterwards. Order matters: each key sees only the keys inserted before it.',
    tryIt: { q: '$m = 9$, $h(x) = x \\bmod 9$, linear probing. Insert 19, 28, 5, 37, 14 and give slots 0–8.', a: 'Homes 1, 1, 5, 1, 5. 19 → 1, 28 → 2, 5 → 5, 37 → 3 (after 1, 2), 14 → 6 (after 5). Table: -, 19, 28, 37, -, 5, 14, -, -.' },
  };

  H['c310-hash-linear-search20'] = {
    asks: 'In the given table ($m = 13$, linear probing), count the probes a search for 20 makes.',
    idea: 'A search walks the route an insert would: start at $h(20)$ and step right until you hit 20 or an empty slot. Stepping off the end of the array wraps you around to slot 0.',
    steps: [
      { text: 'The table:', table: slots(13, '20, -, 41, -, -, 18, 44, 59, 32, 22, 31, 73, 12') },
      '$20 = 13 + 7$, so $h(20) = 7$.',
      { text: 'Walk:', table: { head: ['probe #', 'slot', 'holds', 'is it 20?'], rows: [['1', '7', '59', 'no, full: go on'], ['2', '8', '32', 'no'], ['3', '9', '22', 'no'], ['4', '10', '31', 'no'], ['5', '11', '73', 'no'], ['6', '12', '12', 'no'], ['7', '$13 \\bmod 13 = 0$', '20', 'yes: found']] } },
      '7 probes. The wrap from slot 12 to slot 0 is the $\\bmod 13$ in $h(k, i) = (h(k) + i) \\bmod 13$.',
      'It matches how 20 got there: inserted last, it found slots 7 through 12 full and wrapped to 0.',
    ],
    answer: '7 probes: slots 7, 8, 9, 10, 11, 12, then 0, where 20 is found.',
    mistake: 'Stopping at slot 12 and reporting "not found" because the array ended. The probe sequence wraps around; only an empty slot (or $m$ probes) ends a search.',
    tryIt: { q: '$m = 8$, $h(x) = x \\bmod 8$, linear probing; 14, 22, 30 were inserted in that order. Where is 30, and how many probes does a search for it take?', a: 'All three hash to 6. 14 → 6, 22 → 7, 30 wraps to 0. Search 30: 6 (14), 7 (22), 0 (30): 3 probes.' },
  };

  H['c310-hash-linear-search15'] = {
    asks: 'Trace a search for 15 ($m = 13$, $h(x) = x \\bmod 13$, linear probing) when slot 2 holds 41 and slot 3 is empty, and say why it stops.',
    idea: 'An empty slot is a wall for a search. If 15 had ever been inserted, its insert would have walked this same path and taken that empty slot (or one before it), so 15 cannot be hiding beyond it.',
    steps: [
      '$15 = 13 + 2$, so $h(15) = 2$.',
      'Probe 1: slot 2 holds 41. Not 15, but full, so keep going.',
      'Probe 2: slot 3 is empty. Stop and return null (not found).',
      'Why stopping is safe: an insert of 15 would also start at 2, find 41, and take slot 3. Slot 3 is still empty, so 15 was never inserted.',
      'This rule is what makes deletion tricky: emptying a slot would build a wall that was not there when later keys went in.',
    ],
    answer: 'Probe slot 2 (41, not 15), then slot 3 (empty): return null. An empty slot ends the probe sequence, because an insertion of 15 would have stopped there.',
    mistake: 'Scanning the rest of the table "to be sure". That throws away the speed-up, and the empty slot already proves 15 is absent.',
    tryIt: { q: 'Slide table ($m = 13$): T[0] = 20, T[2] = 41, T[5] = 18, T[6] = 44, T[7] = 59, T[8] = 32, T[9] = 22, T[10] = 31, T[11] = 73, T[12] = 12; slots 1, 3, 4 empty. Trace a search for 46.', a: '$46 = 3 \\cdot 13 + 7$, so start at 7. Slots 7, 8, 9, 10, 11, 12, 0 all hold other keys; slot 1 is empty. Not found after 8 probes.' },
  };

  H['c310-hash-linear-cluster'] = {
    asks: 'Name the problem linear probing suffers from, and explain how it hurts.',
    idea: 'A run of full slots is like a traffic jam: any car arriving anywhere along it crawls to the end and joins it, so the jam grows, and a longer jam catches even more cars. The worksheet calls this primary clustering.',
    steps: [
      { text: 'The slide table after its 8 inserts ($m = 13$) has two runs of full slots:', table: { head: ['run (slots)', 'keys', 'length'], rows: [['2', '41', '1'], ['5–11', '18, 44, 59, 32, 22, 31, 73', '7']] } },
      'A new key whose home is anywhere in 5–11, or 12 itself, ends up in slot 12. That is 8 of the 13 possible homes.',
      { text: 'Chance (uniform hashing) that the next key fills each empty slot:', table: { head: ['empty slot', '0', '1', '3', '4', '12'], rows: [['homes that end here', '0', '1', '2, 3', '4', '5–12'], ['probability', '1/13', '1/13', '2/13', '1/13', '8/13']] } },
      'So the long run is by far the most likely to grow, to length 8. Clusters cause future collisions to need longer probe sequences.',
      'Searches pay too: finding 31 now means walking all six slots 5–10.',
    ],
    graph: {
      caption: 'Expected probes for an unsuccessful search. Linear probing (Knuth’s estimate $\\frac12\\left(1 + \\frac{1}{(1-\\alpha)^2}\\right)$, not on the slides) pulls far above the ideal $\\frac{1}{1-\\alpha}$ as clusters form.',
      x: [0, 0.85], y: [0, 24], xLabel: 'load factor α', yLabel: 'expected probes',
      curves: [
        { label: 'linear probing $\\frac12\\left(1 + \\frac{1}{(1-\\alpha)^2}\\right)$', f: a => 0.5 * (1 + 1 / ((1 - a) * (1 - a))), tone: 'a' },
        { label: 'no clustering $\\frac{1}{1-\\alpha}$', f: a => 1 / (1 - a), tone: 'b' },
      ],
      marks: [{ x: 0.5, label: '$\\alpha = 0.5$' }],
    },
    answer: 'Clustering (primary clustering): colliding items pile up into runs of full cells, and those runs make later collisions need longer probe sequences.',
    mistake: 'Saying the problem is "collisions". Every method has collisions; linear probing’s particular problem is that collisions build runs that keep growing.',
    tryIt: { q: '$m = 10$, linear probing; T[1] = 21, T[2] = 12, T[3] = 33, T[5] = 45, T[6] = 56, others empty. Which empty slot is most likely to be filled by the next key, and with what probability?', a: 'Slot 4: keys with home 1, 2, 3 or 4 all end there, so $4/10$ (slot 7 gets homes 5, 6, 7: $3/10$). Filling 4 would merge the two runs into one run, slots 1–6.' },
  };

  H['c310-hash-linear-prac'] = {
    asks: 'Insert 27, 49, 16, 38, 5 into $m = 11$ with linear probing and $h(k) = k \\bmod 11$; where does 5 end up?',
    idea: 'Hash every key first and look for repeats. Here every key has the same home, so they form a queue: each takes the slot just after the previous one.',
    steps: [
      { text: 'Hash values:', table: { head: ['key', '27', '49', '16', '38', '5'], rows: [['division', '$2 \\cdot 11 + 5$', '$4 \\cdot 11 + 5$', '$1 \\cdot 11 + 5$', '$3 \\cdot 11 + 5$', '$0 \\cdot 11 + 5$'], ['$k \\bmod 11$', '5', '5', '5', '5', '5']] } },
      { text: 'Insert in order:', table: { head: ['key', 'slots tried', 'placed', 'probes'], rows: [['27', '5', '5', '1'], ['49', '5, 6', '6', '2'], ['16', '5, 6, 7', '7', '3'], ['38', '5, 6, 7, 8', '8', '4'], ['5', '5, 6, 7, 8, 9', '9', '5']] } },
      'Total $1 + 2 + 3 + 4 + 5 = 15$ probes for 5 keys. With $n$ keys sharing one home it is $1 + 2 + \\dots + n = \\frac{n(n+1)}{2}$, quadratic growth from a single cluster.',
      { text: 'Final table:', table: slots(11, '-, -, -, -, -, 27, 49, 16, 38, 5, -') },
    ],
    answer: 'Slot 9. All five keys hash to 5, so they fill 5, 6, 7, 8, and 5 takes 9 after five probes.',
    mistake: 'Answering 5 because $5 \\bmod 11 = 5$. Slot 5 went to the first key; the last key in a pile-up goes to the end of the run.',
    tryIt: { q: '$m = 12$, $h(k) = k \\bmod 12$, linear probing. Insert 15, 27, 39, 51. Where does 51 go, and how many probes do the four inserts take in total?', a: 'All hash to 3. They take 3, 4, 5, 6, so 51 is in slot 6. Probes: $1 + 2 + 3 + 4 = 10$.' },
  };

  // ═══════════════════════ Deletion ═══════════════════════

  H['c310-hash-delete-why'] = {
    asks: 'Explain why open addressing cannot delete a key by setting its slot back to NIL, and what it does instead.',
    idea: 'A search stops at the first empty slot. Emptying a slot in the middle of a run cuts the path that later keys used to pass it, so they become unreachable while still sitting in the table.',
    steps: [
      { text: 'Start from the slide table ($m = 13$):', table: slots(13, SLIDE_TABLE) },
      'Delete 44 the wrong way: T[6] = NIL.',
      'Search 31: $h(31) = 5$, and slot 5 holds 18. Slot 6 is now NIL, so the search stops with "not found", which is wrong: 31 is in slot 10.',
      'The fix: write the special value DELETED into slot 6 instead of NIL.',
      { text: 'Search 31 again:', table: { head: ['slot', 'holds', 'action'], rows: [['5', '18', 'full, go on'], ['6', 'DELETED', 'not NIL: go on'], ['7', '59', 'go on'], ['8', '32', 'go on'], ['9', '22', 'go on'], ['10', '31', 'found']] } },
    ],
    answer: 'A NIL would cut every probe sequence that passed through that slot, so searches for keys inserted after it would stop early and wrongly report "not found". Instead the slot is marked DELETED, which search skips over and insert may reuse.',
    mistake: 'Thinking only the deleted key is affected. The damage falls on other keys whose insertion probed past that slot.',
    tryIt: { q: '$m = 8$, $h(k) = k \\bmod 8$, linear probing; 13, 21, 29 were inserted (slots 5, 6, 7). Delete 21 by setting slot 6 to NIL, then search for 29. What happens? What happens with DELETED instead?', a: 'With NIL: probe 5 (13), 6 (empty), stop: "not found", which is wrong. With DELETED: 5 (13), 6 (DELETED, keep going), 7 (29): found in 3 probes.' },
  };

  H['c310-hash-delete-insert'] = {
    asks: 'Describe Delete(k) and Insert(k, o) for linear probing when DELETED markers are used.',
    idea: 'DELETED is a "seat taken" sign to a search and a "seat free" sign to an insert. A search must walk past it, since later keys may lie beyond; an insert may sit there, since the slot holds no key.',
    steps: [
      'Delete(k): search for k. If the entry (k, o) is found, write DELETED into its cell and return o.',
      'Insert(k, o): if the table is full, throw an exception. Otherwise start at cell $h(k)$ and probe consecutive cells.',
      'Stop at the first cell that is empty or holds DELETED (or when every cell has been probed), and store (k, o) there.',
      { text: 'Example on the slide table ($m = 13$): Delete(44) marks slot 6 DELETED. Then Insert(57), with $h(57) = 57 - 52 = 5$:', table: { head: ['slot', 'holds', 'insert does'], rows: [['5', '18', 'full, go on'], ['6', 'DELETED', 'reusable: store 57 here']] } },
      { text: 'How each operation treats each kind of cell:', table: { head: ['cell holds', 'search', 'insert'], rows: [['a key', 'compare; go on if different', 'go on'], ['DELETED', 'go on', 'may store here'], ['empty', 'stop: not found', 'store here']] } },
      'The worksheet adds a safety rule: insert remembers the first DELETED cell but keeps probing to an empty cell, to be sure k is not already stored further on.',
    ],
    answer: 'Delete(k): search for k; if (k, o) is found, replace it with DELETED and return o. Insert(k, o): throw an exception if the table is full; start at $h(k)$ and probe consecutive cells until one is empty or DELETED (or all were probed), and store (k, o) there.',
    mistake: 'Letting search stop at DELETED, or letting insert skip it. Search treats DELETED as occupied; insert treats it as free.',
    tryIt: { q: '$m = 8$, $h(k) = k \\bmod 8$, linear probing; T[5] = 13, T[6] = 21, T[7] = 29. Delete 21, then insert 37. Where does 37 go, and can 29 still be found?', a: 'Slot 6 becomes DELETED. $h(37) = 5$: slot 5 is full, slot 6 is DELETED, so 37 goes in 6. Search 29: 5 (13), 6 (37), 7 (29), found.' },
  };

  // ═══════════════════════ Quadratic probing ═══════════════════════

  H['c310-hash-quadratic'] = {
    asks: 'Give the quadratic-probing function and explain the kind of clustering it still has.',
    idea: 'Instead of shuffling along one slot at a time, jump further each time: $+0, +1, +4, +9, \\dots$ when $c_1 = 0$, $c_2 = 1$. That leaps out of a crowded run, but the jump pattern depends only on the starting slot, so keys that start in the same place still walk single file.',
    steps: [
      'Formula (slide 25): $h(k, i) = (h^{\\prime}(k) + c_1 i + c_2 i^2) \\bmod m$. The worksheet takes $c_1 = 0$, $c_2 = 1$: $h(k, i) = (k \\bmod m + i^2) \\bmod m$.',
      'The constants and $m$ must be chosen carefully: a bad choice can skip some slots forever, so an insert can fail with free slots left.',
      { text: 'Example $m = 11$: keys 3 and 14 both start at 3, key 4 starts at 4. First four probes:', table: { head: ['key', 'start', 'quadratic: $+0, +1, +4, +9$', 'linear: $+0, +1, +2, +3$'], rows: [['3', '3', '3, 4, 7, 1', '3, 4, 5, 6'], ['14', '3', '3, 4, 7, 1', '3, 4, 5, 6'], ['4', '4', '4, 5, 8, 2', '4, 5, 6, 7']] } },
      'Linear: 4’s path 4, 5, 6, 7 runs along 3’s path, so neighbouring starts share one growing run (primary clustering).',
      'Quadratic: 4’s path leaves 3’s path at once, but 3 and 14 still follow an identical path. That milder effect is secondary clustering.',
    ],
    answer: '$h(k, i) = (h^{\\prime}(k) + c_1 i + c_2 i^2) \\bmod m$, constants chosen carefully. Keys with the same initial probe position have the same probe sequence, so clustering still happens, though less than with linear probing (secondary clustering).',
    mistake: 'Claiming quadratic probing removes clustering. It stops neighbouring runs from merging, but keys with equal $h^{\\prime}(k)$ still collide all the way down their shared path.',
    tryIt: { q: '$m = 13$, $c_1 = 0$, $c_2 = 1$. Give the first four probes of keys 20, 33 and 8. Which two follow the same path?', a: '$20 \\bmod 13 = 7$ and $33 \\bmod 13 = 7$: both go 7, 8, 11, $16 \\bmod 13 = 3$. Key 8: 8, 9, 12, $17 \\bmod 13 = 4$. Keys 20 and 33 share a path (secondary clustering).' },
  };

  H['c310-hash-quad-fail'] = {
    asks: 'With $m = 7$, $h(k, i) = (k \\bmod 7 + i^2) \\bmod 7$ and table {24, -, -, 10, 17, 3, -}, explain what happens when you insert 31.',
    idea: 'Squares taken mod 7 only ever come out as 0, 1, 2 or 4. So from any start the probes reach at most 4 different slots, and if those 4 are full the insert fails while other slots sit empty.',
    steps: [
      'Check the table: 10 → 3; 17 → 3 full, $3 + 1 = 4$; 24 → 3, 4 full, $(3 + 4) \\bmod 7 = 0$; 3 → 3, 4, 0 full, $(3 + 9) \\bmod 7 = 5$.',
      '$31 = 4 \\cdot 7 + 3$, so $h^{\\prime}(31) = 3$.',
      { text: 'All $m = 7$ probes:', table: { head: ['$i$', '$i^2$', '$i^2 \\bmod 7$', 'slot $(3 + i^2) \\bmod 7$', 'holds'], rows: [['0', '0', '0', '3', '10'], ['1', '1', '1', '4', '17'], ['2', '4', '4', '0', '24'], ['3', '9', '2', '5', '3'], ['4', '16', '2', '5', '3'], ['5', '25', '4', '0', '24'], ['6', '36', '1', '4', '17']] } },
      'Every probe hits a full slot, $i$ reaches $m$, and the insert fails with "overflow". Slots 1, 2 and 6 are empty but never visited.',
      'Reason: $i^2 \\bmod 7 \\in \\{0, 1, 2, 4\\}$, so from slot 3 only slots 3, 4, 5, 0 are reachable. Quadratic probing need not examine every slot.',
      'A known safeguard (textbook fact, not on the slides): if $m$ is prime and the table is less than half full, $c_1 = 0$, $c_2 = 1$ always finds a free slot. Here 4 of 7 slots are full, more than half.',
    ],
    answer: '$31 \\bmod 7 = 3$; the probes visit 3, 4, 0, 5, 5, 0, 4, all full, and never slots 1, 2 or 6. The insert fails although three slots are empty: quadratic probing need not examine every slot, so its constants (and $m$) must be chosen carefully.',
    mistake: 'Assuming $m$ probes always cover all $m$ slots, as they do in linear probing. With $i^2$ the offsets repeat, so some slots are never reached.',
    tryIt: { q: '$m = 8$, $h(k, i) = (k \\bmod 8 + i^2) \\bmod 8$; T[2] = 18, T[3] = 27, T[6] = 22, the other 5 slots empty. Insert 10. What happens?', a: '$10 \\bmod 8 = 2$, and $i^2 \\bmod 8$ is only ever 0, 1 or 4. The probes are 2, 3, 6, 3, 2, 3, 6, 3, all full, so the insert fails with 5 slots empty.' },
  };

  // ═══════════════════════ Double hashing ═══════════════════════

  H['c310-hash-double'] = {
    asks: 'Give the double-hashing probe function, the condition on $h_2$ that lets it search the whole table, and the two standard ways to guarantee it.',
    idea: 'The start comes from one hash function and the step size from a second, so keys that start in the same place usually walk off with different strides. The stride must share no factor with $m$, or the walk circles a few slots and misses the rest, like a clock hand that moves 4 hours at a time and only ever shows 12, 4 and 8.',
    steps: [
      'Formula: $h(k, i) = (h_1(k) + i\\,h_2(k)) \\bmod m$. Probe $i$ is $i$ strides of length $h_2(k)$ past the start $h_1(k)$.',
      { text: 'What goes wrong: stride 4 starting from slot 1, in $m = 12$ versus $m = 13$:', table: { head: ['$m$', '$\\gcd(4, m)$', 'slots visited', 'distinct'], rows: [['12', '4', '1, 5, 9, 1, 5, 9, …', '3 of 12'], ['13', '1', '1, 5, 9, 0, 4, 8, 12, 3, 7, 11, 2, 6, 10', '13 of 13']] } },
      'In general the walk visits $m / \\gcd(h_2(k), m)$ slots. It visits all $m$ exactly when $\\gcd(h_2(k), m) = 1$, that is, when $h_2(k)$ is relatively prime to $m$.',
      'Way 1: $m$ a power of 2 and $h_2(k)$ always odd. The only prime factor of $m$ is 2, and an odd number does not have it.',
      'Way 2: $m$ prime and $h_2(k)$ always a positive integer less than $m$. A prime’s only factors are 1 and itself, and $h_2(k)$ is neither 0 nor a multiple of $m$.',
    ],
    answer: '$h(k, i) = (h_1(k) + i\\,h_2(k)) \\bmod m$. $h_2(k)$ must be relatively prime to $m$: either $m$ is a power of 2 and $h_2$ always odd, or $m$ is prime and $h_2$ always a positive integer less than $m$.',
    mistake: 'Allowing $h_2(k) = 0$. Then every probe is the same slot $h_1(k)$, which is why the slides’ example uses $h_2(k) = 1 + (k \\bmod m^{\\prime})$.',
    tryIt: { q: '$m = 16$. Starting from slot 3, how many different slots does a stride of 6 visit? A stride of 5?', a: '$\\gcd(6, 16) = 2$, so $16/2 = 8$ slots (3, 9, 15, 5, 11, 1, 7, 13). $\\gcd(5, 16) = 1$, so all 16: the "power of 2, odd stride" rule.' },
  };

  H['c310-hash-double-slide-h2'] = {
    asks: 'With $h_2(k) = 1 + (k \\bmod 700)$, compute $h_2(123456)$.',
    idea: '$k \\bmod 700$ is the remainder after taking out as many 700s as fit. The "$1 +$" shifts the range from $0..699$ to $1..700$, so the stride is never 0.',
    steps: [
      'How many 700s fit in 123456? $700 \\times 176 = 123{,}200$, while $700 \\times 177 = 123{,}900$ is too big.',
      'Remainder: $123{,}456 - 123{,}200 = 256$, so $123456 \\bmod 700 = 256$.',
      'Add 1: $h_2(123456) = 1 + 256 = 257$.',
      'The start, the same way with 701: $701 \\times 176 = 123{,}376$, remainder $123{,}456 - 123{,}376 = 80$, so $h_1 = 80$.',
      'The stride is legal: $m = 701$ is prime and $1 \\le 257 < 701$, so the probes reach every slot.',
    ],
    answer: '257: $123456 \\bmod 700 = 256$, plus 1.',
    mistake: 'Dropping the "$1 +$" and answering 256, or using $m = 701$ instead of $m^{\\prime} = 700$ inside $h_2$.',
    tryIt: { q: 'Same functions ($m = 701$, $m^{\\prime} = 700$). Find $h_1(54321)$ and $h_2(54321)$.', a: '$701 \\times 77 = 53{,}977$, so $h_1 = 54321 - 53977 = 344$. $700 \\times 77 = 53{,}900$, so $54321 \\bmod 700 = 421$ and $h_2 = 422$.' },
  };

  H['c310-hash-double-slide-second'] = {
    asks: 'For $k = 123456$, $m = 701$, $h_1(k) = k \\bmod 701$ and $h_2(k) = 1 + (k \\bmod 700)$, find the second probe ($i = 1$).',
    idea: 'Probe $i$ is the start plus $i$ strides, wrapped around the table. The second probe is just one stride past the start.',
    steps: [
      'Start and stride: $h_1 = 123456 \\bmod 701 = 80$ and $h_2 = 1 + (123456 \\bmod 700) = 257$.',
      'The second probe has $i = 1$; the first has $i = 0$.',
      '$h(k, 1) = (80 + 1 \\cdot 257) \\bmod 701 = 337 \\bmod 701 = 337$, since $337 < 701$.',
      { text: 'The next probes, to see the pattern:', table: { head: ['$i$', '$80 + 257i$', '$\\bmod 701$'], rows: [['0', '80', '80'], ['1', '337', '337'], ['2', '594', '594'], ['3', '851', '150']] } },
      'At $i = 3$ the sum passes 701 and wraps: $851 - 701 = 150$.',
    ],
    answer: '337: $(80 + 1 \\cdot 257) \\bmod 701$.',
    mistake: 'Calling $i = 1$ the first probe and answering 80, or using $i = 2$ and answering 594. Probes count from $i = 0$.',
    tryIt: { q: 'Same functions, $k = 54321$ (so $h_1 = 344$, $h_2 = 422$). Give probes $i = 1$ and $i = 2$.', a: '$i = 1$: $344 + 422 = 766$, and $766 - 701 = 65$. $i = 2$: $344 + 844 = 1188$, and $1188 - 701 = 487$.' },
  };

  H['c310-hash-double-prac'] = {
    asks: 'With $m = 13$, $h_1(k) = k \\bmod 13$ and $h_2(k) = 1 + (k \\bmod 11)$, list the first three probes for $k = 2026$.',
    idea: 'Two remainders give you everything: the start $h_1$ and the stride $h_2$. Then add the stride again and again, taking $\\bmod 13$ each time.',
    steps: [
      '$h_1$: $13 \\times 155 = 2015$, remainder $2026 - 2015 = 11$. The start is 11.',
      '$h_2$: $11 \\times 184 = 2024$, remainder $2026 - 2024 = 2$. The stride is $1 + 2 = 3$.',
      { text: 'Probes:', table: { head: ['$i$', '$11 + 3i$', '$\\bmod 13$'], rows: [['0', '11', '11'], ['1', '14', '1'], ['2', '17', '4']] } },
      'Stride 3 and $m = 13$ (prime) share no factor, so continuing would visit all 13 slots.',
    ],
    answer: '11, 1, 4.',
    mistake: 'Using $\\bmod 13$ inside $h_2$ as well. The second function uses 11 here; mixing them up changes the stride.',
    tryIt: { q: 'Same functions, $k = 1999$. First three probes?', a: '$1999 - 13 \\cdot 153 = 1999 - 1989 = 10$, so $h_1 = 10$. $1999 - 11 \\cdot 181 = 1999 - 1991 = 8$, so $h_2 = 9$. Probes: 10, $19 \\bmod 13 = 6$, $28 \\bmod 13 = 2$.' },
  };

  // ═══════════════════════ One key set, three methods ═══════════════════════

  H['c310-hash-compare-linear'] = {
    asks: 'With $m = 11$, $h^{\\prime}(k) = k \\bmod 11$ and linear probing, insert 14, 25, 36, 9, 47 and find 47’s slot.',
    idea: 'Four of these keys share home slot 3, so with linear probing they line up one behind another. 47 is fourth in that queue.',
    steps: [
      { text: 'Homes:', table: { head: ['key', '14', '25', '36', '9', '47'], rows: [['$k \\bmod 11$', '3', '3', '3', '9', '3']] } },
      { text: 'Insert trace:', table: { head: ['key', 'slots tried', 'placed'], rows: [['14', '3', '3'], ['25', '3 (14), 4', '4'], ['36', '3 (14), 4 (25), 5', '5'], ['9', '9', '9'], ['47', '3 (14), 4 (25), 5 (36), 6', '6']] } },
      { text: 'Final table:', table: slots(11, '-, -, -, 14, 25, 36, 47, -, -, 9, -') },
      'One solid run, slots 3–6: primary clustering. Quadratic probing and double hashing spread these same keys out.',
    ],
    answer: 'Slot 6: 47 probes 3, 4, 5 (all full) and lands in 6.',
    mistake: 'Answering 4, "the next slot". Each earlier key with home 3 (14, 25, 36) pushed the queue one further, so count all of them.',
    tryIt: { q: '$m = 13$, $h^{\\prime}(k) = k \\bmod 13$, linear probing. Insert 17, 30, 43, 8, 56. Where does 56 go?', a: '17, 30, 43, 56 all hash to 4; 8 hashes to 8. 17 → 4, 30 → 5, 43 → 6, 8 → 8, and 56 probes 4, 5, 6 and lands in 7.' },
  };

  H['c310-hash-compare-quad'] = {
    asks: 'Insert the same keys 14, 25, 36, 9, 47 into $m = 11$, now with quadratic probing $h(k, i) = (k \\bmod 11 + i^2) \\bmod 11$. Where does 47 go?',
    idea: 'Four keys still start at slot 3, but the jumps are now $+0, +1, +4, +9$. They still share one path (secondary clustering), but the path is spread across the table instead of forming a solid block.',
    steps: [
      'Offsets $i^2$: 0, 1, 4, 9. From slot 3 the path is 3, 4, 7, $12 \\bmod 11 = 1$.',
      { text: 'Insert trace:', table: { head: ['key', '$h^{\\prime}(k)$', 'slots tried', 'placed'], rows: [['14', '3', '3', '3'], ['25', '3', '3 (14), 4', '4'], ['36', '3', '3 (14), 4 (25), 7', '7'], ['9', '9', '9', '9'], ['47', '3', '3 (14), 4 (25), 7 (36), 1', '1']] } },
      '47 needs $i = 3$: $(3 + 3^2) \\bmod 11 = 12 \\bmod 11 = 1$.',
      { text: 'Final table:', table: slots(11, '-, 47, -, 14, 25, -, -, 36, -, 9, -') },
      '47 still takes 4 probes, as with linear probing, because all four keys share one path. But no solid run forms, so keys with other homes are not dragged in.',
    ],
    answer: 'Slot 1: 47 probes 3, 4, 7 (all full), then $(3 + 9) \\bmod 11 = 1$.',
    mistake: 'Adding $i$ instead of $i^2$ on the third or fourth probe (giving 5 or 6). The offsets are 0, 1, 4, 9, not 0, 1, 2, 3.',
    tryIt: { q: '$m = 13$, $h(k, i) = (k \\bmod 13 + i^2) \\bmod 13$. Insert 17, 30, 43, 8, 56. Where do 8 and 56 go?', a: '17 → 4; 30 tries 4, takes 5; 43 tries 4, 5, takes 8; 8 finds 8 taken by 43, takes $8 + 1 = 9$; 56 tries 4, 5, 8, takes $(4 + 9) \\bmod 13 = 0$.' },
  };

  H['c310-hash-compare-double'] = {
    asks: 'Insert the same keys 14, 25, 36, 9, 47 into $m = 11$, now with double hashing, $h_1(k) = k \\bmod 11$ and $h_2(k) = 1 + (k \\bmod 7)$. Where does 47 go?',
    idea: 'Keys with home 3 still start at 3, but each now has its own stride, so after the first collision they scatter in different directions. That breaks up both kinds of clustering.',
    steps: [
      { text: 'Start and stride for each key:', table: { head: ['key', '$h_1 = k \\bmod 11$', '$k \\bmod 7$', '$h_2 = 1 + (k \\bmod 7)$'], rows: [['14', '3', '0', '1'], ['25', '3', '4', '5'], ['36', '3', '1', '2'], ['9', '9', '2', '3'], ['47', '3', '5', '6']] } },
      { text: 'Insert trace (probe $i$ is $(h_1 + i\\,h_2) \\bmod 11$):', table: { head: ['key', 'slots tried', 'placed'], rows: [['14', '3', '3'], ['25', '3 (14), $3 + 5 = 8$', '8'], ['36', '3 (14), $3 + 2 = 5$', '5'], ['9', '9', '9'], ['47', '3 (14), $3 + 6 = 9$ (9), $(3 + 12) \\bmod 11 = 4$', '4']] } },
      '47 bumped into key 9 at slot 9: an unlucky one-off collision, not a cluster. It needed 3 probes against 4 for linear and quadratic.',
      { text: 'Final table:', table: slots(11, '-, -, -, 14, 47, 36, -, -, 25, 9, -') },
    ],
    answer: 'Slot 4: $h_2(47) = 6$, so 47 probes 3 (full), 9 (full), then $(3 + 12) \\bmod 11 = 4$.',
    mistake: 'Using 11 inside $h_2$, or dropping the "$1 +$". Here $h_2(47) = 1 + (47 \\bmod 7) = 1 + 5 = 6$.',
    tryIt: { q: '$m = 13$, $h_1(k) = k \\bmod 13$, $h_2(k) = 1 + (k \\bmod 11)$. Insert 17, 30, 43, 8, 56. Where does each land?', a: '17, 30, 43, 56 start at 4 with strides 7, 9, 11, 2; 8 starts at 8. 17 → 4; 30 → 4, then $13 \\bmod 13 = 0$; 43 → 4, then $15 \\bmod 13 = 2$; 8 → 8; 56 → 4, then 6.' },
  };
})(globalThis.FC = globalThis.FC || {});
