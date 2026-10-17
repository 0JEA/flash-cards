// Help walkthroughs for the CSC 310 open-addressing worksheet cards (deletion & tombstones,
// probe sequences, clustering). Same entry format as decks/csc310-help.js (see its header).
// Rules are HER worksheet's (worksheet___OpenAddressing.pdf, p. 1): probes start at i = 0;
// delete marks the slot DEL; search continues past keys and DEL and stops at ∅; insert records
// the FIRST DEL on the probe path, keeps probing for a duplicate, and stores the key in that DEL
// (or in the ∅ if no DEL was seen). Every probe sequence, table and tryIt answer was simulated
// with python3 under exactly these rules on 2026-10-16.
// Worksheet slips noted where they matter: h2(65) is printed as 10 but is 11 (same final slot);
// Section 4 Q2a says "line 26" but the duplicate return is line 29.
// Academic integrity: the graded hash-table assignment (separate chaining in Java) is not used
// here. tryIt problems use keys and table sizes the worksheet does not use.
(function (FC) {
  'use strict';
  const H = FC.help = FC.help || {};

  // ── shared pictures ──
  const PH = ['key', '$i$', 'slot', 'contents', 'action'];          // probe table header
  const cell = v => (v === null ? '∅' : String(v));
  // Vertical slot table: one row per slot, one column per labelled table state.
  const slots = (labels, ...states) => ({
    head: ['slot', ...labels],
    rows: states[0].map((_, s) => [String(s), ...states.map(T => cell(T[s]))]),
  });
  const E = null, D = 'DEL';

  // Problem 1.2 (linear, m = 10)
  const T12_START = [70, 81, 22, 93, 4, 32, 6, 5, 8, 99];
  const T12_DELS = [70, 81, 22, 93, 4, D, 6, 5, D, 99];
  const T12_FINAL = [70, 81, 22, 93, 4, D, 6, 5, 18, 99];
  // Problem 2.2 (quadratic, m = 11)
  const T22_START = [21, 1, 24, 13, 15, 37, E, 7, 32, 19, 10];
  const T22_DELS = [21, 1, D, 13, 15, D, E, 7, 32, 19, 10];
  const T22_FINAL = [21, 1, 46, 13, 15, D, E, 7, 32, 19, 10];
  // Problem 3.2 (double hashing, m = 13)
  const T32_DEL = [D, 14, 41, 3, 43, 18, 6, 33, 8, 9, 23, 11, 31];
  const T32_FINAL = [65, 14, 41, 3, 43, 18, 6, 33, 8, 9, 23, 11, 31];

  // ═══════════════════════ The rules ═══════════════════════

  H['c310-ws-openaddr-first-i'] = {
    asks: 'Probe sequences are written $h(k, i)$. Which number does $i$ start at, and which slot does that first probe look at?',
    idea: '$i$ counts the collisions you have already had. Before the first look you have had none, so the first probe is $i = 0$, and it lands on the key’s home slot.',
    steps: [
      'Her rule (worksheet p. 1): "Always calculate sequence terms starting from probe attempt $i = 0$."',
      'Linear: $h(k, 0) = (h^{\\prime}(k) + 0) \\bmod m = h^{\\prime}(k)$. The mod changes nothing, because $h^{\\prime}(k)$ is already between $0$ and $m - 1$.',
      'Quadratic: $(h^{\\prime}(k) + c_1 \\cdot 0 + c_2 \\cdot 0^2) \\bmod m = h^{\\prime}(k)$. Double hashing: $(h_1(k) + 0 \\cdot h_2(k)) \\bmod m = h_1(k)$.',
      { text: 'Her Problem 2.1 (quadratic, $m = 11$), key 13 after 24 is in slot 2. Each collision moves $i$ up by one:', table: { head: PH, rows: [
        ['13', '0', '$(2 + 0) \\bmod 11 = 2$', '24', 'collision, go on'],
        ['13', '1', '$(2 + 1) \\bmod 11 = 3$', '∅', 'place at 3'],
      ] } },
    ],
    answer: '$i = 0$. Probe 0 examines the home slot $h^{\\prime}(k)$ (for double hashing, $h_1(k)$); $i = 1, 2, \\dots$ come only after collisions.',
    mistake: 'Starting at $i = 1$, which skips the home slot and shifts every slot in the sequence. Her tables in Problems 2.1 and 3.1 always begin with an $i = 0$ row.',
    tryIt: { q: 'Linear probing, $m = 7$, $h^{\\prime}(k) = k \\bmod 7$. Which slots do probes $i = 0, 1, 2$ of key 23 examine?', a: '$23 = 3 \\cdot 7 + 2$, so $h^{\\prime}(23) = 2$. Probes: $i = 0$ → 2, $i = 1$ → 3, $i = 2$ → 4.' },
  };

  H['c310-ws-openaddr-search-rule'] = {
    asks: "A search along the probe path of a table with tombstones meets a DEL slot. What do you do?",
    idea: 'An empty slot is the only proof of absence: had the key been inserted, it would have stopped at this ∅ (or earlier) and be sitting there. Another key or a DEL only means "not here, it could be further along".',
    steps: [
      'Start at the home slot $h(k, 0)$.',
      'The slot holds $k$: FOUND, stop. It holds another key: go on to probe $i + 1$.',
      'It holds DEL: go on to $i + 1$. That slot was full when later keys were inserted, so they may lie beyond it.',
      'It is ∅: stop, NOT FOUND. If all $m$ slots are probed without an ∅, also NOT FOUND.',
      { text: 'Two searches from her worksheet: 5 in Problem 1.2 (linear, $m = 10$) and 28 in Problem 2.2 (quadratic, $m = 11$, $28 \\bmod 11 = 6$):', table: { head: PH, rows: [
        ['5', '0', '5', 'DEL', 'continue'],
        ['5', '1', '6', '6', 'continue'],
        ['5', '2', '7', '5', 'FOUND'],
        ['28', '0', '6', '∅', 'stop: NOT FOUND'],
      ] } },
    ],
    answer: "Continue to the next probe. (The key: FOUND. Another key: continue. ∅: stop, NOT FOUND.)",
    mistake: 'Stopping at a DEL as if it were empty. DEL means keep going; only ∅ ends a search.',
    tryIt: { q: 'Linear probing, $m = 7$, $h^{\\prime}(k) = k \\bmod 7$. Slots 0–6: ∅, 8, DEL, 22, ∅, ∅, ∅. Search for 22, then for 29.', a: '22: home 1 (8, continue), 2 (DEL, continue), 3: FOUND. 29: home 1 (8), 2 (DEL), 3 (22), 4 (∅): NOT FOUND after 4 probes.' },
  };

  H['c310-ws-openaddr-insert-rule'] = {
    asks: 'Inserting into a table with tombstones: what do you do when the probe path first meets a DEL, and which slot does the key finally go into?',
    idea: 'A DEL is a free seat, but you cannot sit down yet: the same key may already be stored further along the path (it was inserted while this slot was full). So remember the first DEL, walk on until ∅ proves the key is absent, then go back and use the remembered seat.',
    steps: [
      'Probe $i = 0, 1, 2, \\dots$, and at the first DEL write down its slot and keep going. Later DELs are ignored: you already have the earliest one.',
      'If you meet the key itself, it is a duplicate: insert nothing.',
      'If you meet ∅, the key is not in the table. Store it in the recorded DEL if there is one, otherwise in this ∅.',
      'If all $m$ slots are probed with no ∅ and no duplicate, store it in the recorded DEL (no DEL either means the table is full).',
      { text: 'Her Problem 2.2, insert 46 (quadratic, $m = 11$, $46 \\bmod 11 = 2$):', table: { head: PH, rows: [
        ['46', '0', '$(2 + 0) \\bmod 11 = 2$', 'DEL', 'record slot 2, continue'],
        ['46', '1', '$(2 + 1) \\bmod 11 = 3$', '13', 'continue'],
        ['46', '2', '$(2 + 4) \\bmod 11 = 6$', '∅', 'stop: 46 absent, place at 2'],
      ] } },
      'The lecture slides (p. 25) stop at the first DEL or ∅. The worksheet adds the duplicate check; use the worksheet’s rule on worksheet questions.',
    ],
    answer: 'Record the first DEL’s position and keep probing. If the key turns up, do nothing (duplicate). Otherwise, when an ∅ is reached (or every slot has been probed), store the key in the first recorded DEL, or in the ∅ if no DEL was seen.',
    mistake: 'Putting the key in the ∅ where probing stopped even though a DEL came earlier. The ∅ only ends the duplicate check; the key goes into the first DEL.',
    tryIt: { q: 'Linear probing, $m = 7$, $h^{\\prime}(k) = k \\bmod 7$. Slots 0–6: ∅, 8, DEL, 22, ∅, ∅, ∅. Insert 22, then insert 29.', a: '22: slot 1 (8), slot 2 DEL (record 2), slot 3 holds 22: duplicate, nothing inserted. 29: slot 1 (8), slot 2 DEL (record), slot 3 (22), slot 4 ∅: stop; 29 goes into slot 2.' },
  };

  H['c310-ws-openaddr-update-rule'] = {
    asks: "How do you change the value stored with a key that is already in the table?",
    idea: 'An update is a search followed by overwriting the value. The key stays exactly where the search found it.',
    steps: [
      'Search for the key with the normal search rule: continue past other keys and DEL, stop at ∅.',
      'Where it is found, overwrite its value. Do not delete and re-insert it, and do not re-hash it.',
      { text: 'Her two update questions:', table: { head: PH, rows: [
        ['93 (1.2, linear, $m = 10$)', '0', '$93 \\bmod 10 = 3$', '93', 'FOUND: update in place at 3'],
        ['19 (2.2, quadratic, $m = 11$)', '0', '$19 \\bmod 11 = 8$', '32', 'continue'],
        ['19', '1', '$(8 + 1) \\bmod 11 = 9$', '19', 'FOUND: update in place at 9'],
      ] } },
      'Her blank "Does index change?" expects: No. 93 stays at 3 and 19 stays at 9.',
    ],
    answer: 'Search for the key, then overwrite its value in the slot where it was found. The key is not moved or re-hashed, so its index does not change.',
    mistake: 'Treating an update as delete + insert. That leaves a DEL behind and can move the key to an earlier DEL; her rule says the index must not change.',
    tryIt: { q: 'Linear probing, $m = 7$, $h^{\\prime}(k) = k \\bmod 7$. Slots 0–6: ∅, 8, DEL, 22, ∅, ∅, ∅. Update 22’s value: which slot, and does its index change?', a: 'Search: slot 1 (8), slot 2 (DEL, continue), slot 3: found. The value is changed at slot 3; the index stays 3 even though slot 2 is free.' },
  };

  // ═══════════════════════ Problem 1: linear probing (m = 10) ═══════════════════════

  H['c310-ws-openaddr-1-1'] = {
    asks: 'Linear probing, $m = 10$, $h^{\\prime}(k) = k \\bmod 10$, empty table. Insert 44, 25, 76, 82, 11, 40 in order and write the final table.',
    idea: '$k \\bmod 10$ is just the last digit of $k$. A key goes to its last-digit slot; only if that slot is taken does it step +1 (wrapping from 9 to 0).',
    steps: [
      { text: 'One row per key. Each home slot is checked against the table as it is at that moment:', table: { head: ['key', '$h^{\\prime}(k)$', 'slot at $i = 0$', 'contents', 'action'], rows: [
        ['44', '4', '4', '∅', 'place at 4'],
        ['25', '5', '5', '∅', 'place at 5'],
        ['76', '6', '6', '∅', 'place at 6'],
        ['82', '2', '2', '∅', 'place at 2'],
        ['11', '1', '1', '∅', 'place at 1'],
        ['40', '0', '0', '∅', 'place at 0'],
      ] } },
      'The six last digits (4, 5, 6, 2, 1, 0) are all different, so no key collides. Every key uses only probe $i = 0$; her $i = 1$ and $i = 2$ columns are N/A and every Probes entry is 0.',
      { text: 'Final table:', table: slots(['key'], [40, 11, 82, E, 44, 25, 76, E, E, E]) },
    ],
    answer: '40, 11, 82, ∅, 44, 25, 76, ∅, ∅, ∅ (slots 0–9). Each key sits in its home slot $k \\bmod 10$; there are no collisions.',
    mistake: 'Expecting collisions because the table has $i = 1$ and $i = 2$ columns. Check each home slot against the current table; here every one is free.',
    tryIt: { q: 'Same setup ($m = 10$, linear). Insert 31, 52, 41, 60 into an empty table. Final table?', a: 'Homes 1, 2, 1, 0. 41: slot 1 (31) and slot 2 (52) are full, so $i = 2$ gives slot 3. Final: 60, 31, 52, 41, then ∅ in slots 4–9.' },
  };

  H['c310-ws-openaddr-1-2-del32'] = {
    asks: 'Table (linear, $m = 10$): 70, 81, 22, 93, 4, 32, 6, 5, 8, 99. To delete 32 you must first find it. Which slots does that search visit?',
    idea: 'Delete = search, then mark the slot DEL. 32 is not in its home slot: collisions pushed it along when it was inserted, and the search retraces those same steps.',
    steps: [
      '$h^{\\prime}(32) = 32 \\bmod 10 = 2$.',
      { text: 'Search for 32:', table: { head: PH, rows: [
        ['32', '0', '2', '22', 'continue'],
        ['32', '1', '3', '93', 'continue'],
        ['32', '2', '4', '4', 'continue'],
        ['32', '3', '5', '32', 'FOUND: mark slot 5 DEL'],
      ] } },
      { text: 'Before and after:', table: slots(['before', 'after delete 32'], T12_START, [70, 81, 22, 93, 4, D, 6, 5, 8, 99]) },
      'Her next line, delete 8: $h^{\\prime}(8) = 8$, found at slot 8 on probe $i = 0$, so slot 8 becomes DEL too.',
    ],
    answer: '2, 3, 4, 5. Slots 2, 3, 4 hold other keys (22, 93, 4); 32 is found at slot 5, which becomes DEL.',
    mistake: 'Writing only "2" (the home slot) or "5" (where 32 is). The probe sequence is every slot visited, from home to the slot where the key is found.',
    tryIt: { q: 'Linear probing, $m = 10$. Slots 0–9: 50, 11, 21, 3, 31, ∅, ∅, ∅, ∅, ∅. Delete 31: probe sequence, and which slot becomes DEL?', a: 'Home $31 \\bmod 10 = 1$. Slots 1 (11), 2 (21), 3 (3) hold other keys; 31 is found at 4. Sequence 1, 2, 3, 4; slot 4 becomes DEL.' },
  };

  H['c310-ws-openaddr-1-2-search5'] = {
    asks: 'Table after the two deletes (linear, $m = 10$): 70, 81, 22, 93, 4, DEL, 6, 5, DEL, 99. Search for 5: which slots?',
    idea: 'Slot 5 is 5’s home, but it now holds DEL. DEL means "something used to be here, keep looking", so the search walks past it.',
    steps: [
      '$h^{\\prime}(5) = 5 \\bmod 10 = 5$.',
      { text: 'Search for 5:', table: { head: PH, rows: [
        ['5', '0', '5', 'DEL', 'continue'],
        ['5', '1', '6', '6', 'continue'],
        ['5', '2', '7', '5', 'FOUND at 7'],
      ] } },
      'Why 5 is in slot 7: when it was inserted, slots 5 and 6 were already full. The DEL left by 32 keeps that path alive.',
      'Had slot 5 been emptied instead, this search would stop at slot 5 and wrongly report NOT FOUND.',
    ],
    answer: '5, 6, 7: DEL at 5 (continue), 6 in slot 6 (continue), 5 found in slot 7.',
    mistake: 'Stopping at slot 5 because "it is empty now". DEL is not empty; only ∅ ends a search.',
    tryIt: { q: 'Linear probing, $m = 10$. Slots 0–9: 50, DEL, 21, 3, DEL, ∅, ∅, ∅, ∅, ∅. Search for 21.', a: 'Home $21 \\bmod 10 = 1$: DEL, continue. Slot 2 holds 21: found. Sequence 1, 2.' },
  };

  H['c310-ws-openaddr-1-2-search20'] = {
    asks: 'Same table (70, 81, 22, 93, 4, DEL, 6, 5, DEL, 99). 20 is not in it. How many slots does the search probe before reporting NOT FOUND?',
    idea: 'A search stops early only at an ∅. This table has no ∅ at all (both freed slots are DEL), so nothing stops the search: it looks at every slot.',
    steps: [
      '$h^{\\prime}(20) = 20 \\bmod 10 = 0$.',
      { text: 'Search for 20, one row per probe:', table: { head: PH, rows: [
        ['20', '0', '0', '70', 'continue'],
        ['20', '1', '1', '81', 'continue'],
        ['20', '2', '2', '22', 'continue'],
        ['20', '3', '3', '93', 'continue'],
        ['20', '4', '4', '4', 'continue'],
        ['20', '5', '5', 'DEL', 'continue'],
        ['20', '6', '6', '6', 'continue'],
        ['20', '7', '7', '5', 'continue'],
        ['20', '8', '8', 'DEL', 'continue'],
        ['20', '9', '9', '99', 'continue'],
      ] } },
      'After $i = 9$ all $m = 10$ slots have been checked; probe $i = 10$ would be slot 0 again. So stop: NOT FOUND.',
      'Count: probes $i = 0$ through $i = 9$ make $10$ probes.',
    ],
    answer: '10. No slot is ∅ and DEL does not stop a search, so all 10 slots are probed before NOT FOUND.',
    mistake: 'Stopping at the first DEL (slot 5, after 6 probes). Tombstones make unsuccessful searches longer; that is the price of deleting this way.',
    tryIt: { q: 'Linear probing, $m = 7$, $h^{\\prime}(k) = k \\bmod 7$. Slots 0–6: 7, DEL, 9, 3, DEL, 12, 6. Search for 14: how many probes?', a: 'Home $14 \\bmod 7 = 0$. There is no ∅ and 14 is absent, so all 7 slots are probed: 7 probes, NOT FOUND.' },
  };

  H['c310-ws-openaddr-1-2-ins18'] = {
    asks: 'Insert 18 into 70, 81, 22, 93, 4, DEL, 6, 5, DEL, 99 (linear, $m = 10$) with the record-the-first-DEL rule. Which slot does 18 end up in?',
    idea: 'Home slot 8 is a DEL, so 18 could go there, but first the rule makes you check that 18 is not already further along. With no ∅ to stop at, that check walks the whole table.',
    steps: [
      '$h^{\\prime}(18) = 18 \\bmod 10 = 8$.',
      { text: 'Probe for 18:', table: { head: PH, rows: [
        ['18', '0', '8', 'DEL', 'record slot 8, continue'],
        ['18', '1', '9', '99', 'continue'],
        ['18', '2', '0', '70', 'continue'],
        ['18', '3', '1', '81', 'continue'],
        ['18', '4', '2', '22', 'continue'],
        ['18', '5', '3', '93', 'continue'],
        ['18', '6', '4', '4', 'continue'],
        ['18', '7', '5', 'DEL', 'already have a DEL, continue'],
        ['18', '8', '6', '6', 'continue'],
        ['18', '9', '7', '5', 'continue'],
      ] } },
      'All 10 slots probed: no 18 and no ∅. Store 18 in the recorded DEL, slot 8.',
      'Her "Reason" blank: it overwrote a DEL (the first on its path), not an ∅; the table has no ∅.',
      { text: 'Before and after:', table: slots(['before', 'after insert 18'], T12_DELS, T12_FINAL) },
    ],
    answer: '8. Slot 8 is the first DEL on 18’s path; probing the rest finds no 18 (and no ∅), so 18 overwrites that DEL.',
    mistake: 'Choosing slot 5 because it is the lowest-numbered DEL. "First" means first along the probe path (8, 9, 0, 1, …), not smallest index.',
    tryIt: { q: 'Linear probing, $m = 7$, $h^{\\prime}(k) = k \\bmod 7$. Slots 0–6: 7, DEL, 9, 3, DEL, 12, 6. Insert 11.', a: 'Home $11 \\bmod 7 = 4$: DEL, record 4. Then 5, 6, 0, 1 (DEL, already have one), 2, 3: no 11, no ∅. 11 goes into slot 4, even though slot 1 has a smaller index.' },
  };

  H['c310-ws-openaddr-1-2-final'] = {
    asks: 'Start from 70, 81, 22, 93, 4, 32, 6, 5, 8, 99 (linear, $m = 10$). Apply: delete 32, delete 8, search 5, search 20, insert 18, update 93. Give the final table.',
    idea: 'Only deletes and inserts change which key is in which slot. Searches only read, and an update changes a value, not a slot, so you track just three changes.',
    steps: [
      { text: 'All six operations:', table: { head: ['operation', 'probe sequence', 'result', 'table change'], rows: [
        ['delete 32', '2, 3, 4, 5', 'found at 5', 'slot 5 → DEL'],
        ['delete 8', '8', 'found at 8', 'slot 8 → DEL'],
        ['search 5', '5, 6, 7', 'found at 7', 'none'],
        ['search 20', '0, 1, …, 9', 'NOT FOUND', 'none'],
        ['insert 18', '8 (DEL, recorded), 9, 0, …, 7', 'no duplicate, no ∅', 'slot 8 → 18'],
        ['update 93', '3', 'found at 3', 'value only; index stays 3'],
      ] } },
      { text: 'The table at each stage:', table: slots(['start', 'after deletes', 'final'], T12_START, T12_DELS, T12_FINAL) },
      'Slot 5 keeps its DEL: no insert reused it. Slot 8’s DEL was reused by 18 because it was the first DEL on 18’s path.',
    ],
    answer: '70, 81, 22, 93, 4, DEL, 6, 5, 18, 99. 32 leaves a DEL at 5; 8’s DEL at slot 8 is reused by 18; 93 stays at 3.',
    mistake: 'Writing ∅ at slot 5 in the final table. A deleted slot stays DEL until an insert reuses it, and nothing reused slot 5.',
    tryIt: { q: 'Linear probing, $m = 7$, $h^{\\prime}(k) = k \\bmod 7$. Slots 0–6: 7, 15, 9, 3, 11, 12, 6. Delete 15, delete 11, insert 25, update 9. Final table?', a: '15 → DEL at 1; 11 → DEL at 4. 25: home 4 is DEL (record), then 5, 6, 0, 1, 2, 3 show no 25 and no ∅, so 25 goes to 4. 9 is updated at 2. Final: 7, DEL, 9, 3, 25, 12, 6.' },
  };

  // ═══════════════════════ Problem 2: quadratic probing (m = 11) ═══════════════════════

  H['c310-ws-openaddr-2-1-32'] = {
    asks: 'Quadratic probing, $m = 11$, $h(k, i) = (k \\bmod 11 + i^2) \\bmod 11$. After inserting 24, 13, 10, 21, insert 32. Give its probe sequence.',
    idea: 'Quadratic probing jumps $i^2$ from the home slot: $+0, +1, +4, +9, \\dots$, always measured from home (not from the previous probe), then wrapped with mod 11.',
    steps: [
      'Table before: 24 → slot 2; 13 → slot 2 is taken, so $(2 + 1) = 3$; 10 → slot 10; 21 → slot 10 is taken, so $(10 + 1) \\bmod 11 = 0$.',
      '$h^{\\prime}(32) = 32 \\bmod 11 = 32 - 22 = 10$.',
      { text: 'Probe for 32:', table: { head: PH, rows: [
        ['32', '0', '$(10 + 0) \\bmod 11 = 10$', '10', 'continue'],
        ['32', '1', '$(10 + 1) \\bmod 11 = 0$', '21', 'continue'],
        ['32', '2', '$(10 + 4) \\bmod 11 = 3$', '13', 'continue'],
        ['32', '3', '$(10 + 9) \\bmod 11 = 8$', '∅', 'place at 8'],
      ] } },
      'The wrap at $i = 3$: $10 + 9 = 19$, and $19 - 11 = 8$.',
    ],
    answer: '10, 0, 3, 8. Slots 10, 0, 3 are full (10, 21, 13); slot $(10 + 9) \\bmod 11 = 8$ is free.',
    mistake: 'Adding $i^2$ to the previous probe instead of to the home slot, which gives 10, 0, 4, …. Every probe is $h^{\\prime}(k) + i^2$, measured from home.',
    tryIt: { q: 'Quadratic probing, $m = 7$, $h(k, i) = (k \\bmod 7 + i^2) \\bmod 7$. Insert 14, 21, 28, then 35. Probe sequence of 35?', a: 'All four have home 0. 14 → 0; 21 → 0, 1; 28 → 0, 1, 4. 35: 0 (14), 1 (21), 4 (28), $(0 + 9) \\bmod 7 = 2$: free. Sequence 0, 1, 4, 2.' },
  };

  H['c310-ws-openaddr-2-1-final'] = {
    asks: 'Quadratic probing, $m = 11$, $h(k, i) = (k \\bmod 11 + i^2) \\bmod 11$, empty table. Insert 24, 13, 10, 21, 32 and write the final table.',
    idea: 'Do one key at a time: home slot first, then $+1$, $+4$, $+9$ from home until a slot is free.',
    steps: [
      'Home slots: $24 - 22 = 2$, $13 - 11 = 2$, $10$, $21 - 11 = 10$, $32 - 22 = 10$. Two keys share home 2 and three share home 10, so expect collisions.',
      { text: 'Every probe:', table: { head: PH, rows: [
        ['24', '0', '$(2 + 0) \\bmod 11 = 2$', '∅', 'place at 2'],
        ['13', '0', '$(2 + 0) \\bmod 11 = 2$', '24', 'continue'],
        ['13', '1', '$(2 + 1) \\bmod 11 = 3$', '∅', 'place at 3'],
        ['10', '0', '$(10 + 0) \\bmod 11 = 10$', '∅', 'place at 10'],
        ['21', '0', '$(10 + 0) \\bmod 11 = 10$', '10', 'continue'],
        ['21', '1', '$(10 + 1) \\bmod 11 = 0$', '∅', 'place at 0'],
        ['32', '0', '$(10 + 0) \\bmod 11 = 10$', '10', 'continue'],
        ['32', '1', '$(10 + 1) \\bmod 11 = 0$', '21', 'continue'],
        ['32', '2', '$(10 + 4) \\bmod 11 = 3$', '13', 'continue'],
        ['32', '3', '$(10 + 9) \\bmod 11 = 8$', '∅', 'place at 8'],
      ] } },
      { text: 'Final table:', table: slots(['key'], [21, E, 24, 13, E, E, E, E, 32, E, 10]) },
    ],
    answer: '21, ∅, 24, 13, ∅, ∅, ∅, ∅, 32, ∅, 10 (slots 0–10).',
    mistake: 'Stepping +1 like linear probing, which would put 32 in slot 1. Quadratic jumps from home 10 are +1, +4, +9, reaching 0, 3, 8.',
    tryIt: { q: 'Quadratic probing, $m = 7$, $h(k, i) = (k \\bmod 7 + i^2) \\bmod 7$. Insert 10, 3, 17, 24 into an empty table. Final table?', a: 'All four have home 3. 10 → 3; 3 → 3, 4; 17 → 3, 4, $(3 + 4) \\bmod 7 = 0$; 24 → 3, 4, 0, $(3 + 9) \\bmod 7 = 5$. Final: 17, ∅, ∅, 10, 3, 24, ∅.' },
  };

  H['c310-ws-openaddr-2-2-ins46'] = {
    asks: 'Quadratic probing, $m = 11$, table 21, 1, DEL, 13, 15, DEL, ∅, 7, 32, 19, 10. Insert 46 with the record-the-first-DEL rule. Which slot does it end up in?',
    idea: 'Home slot 2 is a DEL: remember it. Then keep probing only until an ∅ proves 46 is not already stored further along.',
    steps: [
      '$h^{\\prime}(46) = 46 \\bmod 11 = 46 - 44 = 2$.',
      { text: 'Probe for 46:', table: { head: PH, rows: [
        ['46', '0', '$(2 + 0) \\bmod 11 = 2$', 'DEL', 'record slot 2, continue'],
        ['46', '1', '$(2 + 1) \\bmod 11 = 3$', '13', 'continue'],
        ['46', '2', '$(2 + 4) \\bmod 11 = 6$', '∅', 'stop: 46 absent'],
      ] } },
      'Slot 6 is ∅, so 46 is not in the table. It goes into the recorded DEL, slot 2, not into slot 6.',
      { text: 'Before and after:', table: slots(['before', 'after insert 46'], T22_DELS, T22_FINAL) },
    ],
    answer: '2. 46’s path is 2 (DEL, recorded), 3 (13), 6 (∅). The ∅ proves 46 is absent, so it goes into the first DEL, slot 2.',
    mistake: 'Placing 46 in slot 6 because that is where probing stopped. The ∅ only ends the duplicate check; the key goes into the first recorded DEL.',
    tryIt: { q: 'Quadratic probing, $m = 7$, $h(k, i) = (k \\bmod 7 + i^2) \\bmod 7$. Slots 0–6: 17, ∅, ∅, DEL, 3, ∅, ∅. Insert 31.', a: 'Home $31 \\bmod 7 = 3$: DEL, record. Then 4 (3), $(3 + 4) \\bmod 7 = 0$ (17), $(3 + 9) \\bmod 7 = 5$ (∅): stop. 31 goes into slot 3.' },
  };

  H['c310-ws-openaddr-2-2-search28'] = {
    asks: "Quadratic probing, $m = 11$, $h^{\\prime}(k) = k \\bmod 11$. Table: 21, 1, DEL, 13, 15, DEL, ∅, 7, 32, 19, 10. Trace the search for 28.",
    idea: 'Always compute the home slot first. If it is ∅, the search is over at once.',
    steps: [
      '$h^{\\prime}(28) = 28 \\bmod 11 = 28 - 22 = 6$.',
      { text: 'Search for 28:', table: { head: PH, rows: [['28', '0', '$(6 + 0) \\bmod 11 = 6$', '∅', 'stop: NOT FOUND']] } },
      'Why one probe is enough: had 28 ever been inserted, its first probe would have found slot 6 free and taken it. (Had it then been deleted, slot 6 would show DEL, not ∅.)',
      'Contrast her previous line, search 13: slot 2 is DEL (continue), slot 3 holds 13 (found). DEL lets a search continue; ∅ ends it.',
    ],
    answer: '$h^{\\prime}(28) = 6$. Slot 6 is ∅, so the search stops after one probe: NOT FOUND.',
    mistake: 'Probing on past the ∅ to $(6 + 1)$, $(6 + 4)$, …. An ∅ ends a search immediately; only DEL and other keys are stepped over.',
    tryIt: { q: 'Quadratic probing, $m = 7$, $h(k, i) = (k \\bmod 7 + i^2) \\bmod 7$. Slots 0–6: 17, ∅, ∅, DEL, 3, ∅, ∅. Search for 13, then for 38.', a: '13: home 6 is ∅: NOT FOUND after 1 probe. 38: home 3 (DEL, continue), 4 (3), $(3 + 4) \\bmod 7 = 0$ (17), $(3 + 9) \\bmod 7 = 5$ (∅): NOT FOUND after 4 probes.' },
  };

  H['c310-ws-openaddr-2-2-final'] = {
    asks: 'Quadratic probing, $m = 11$, start: 21, 1, 24, 13, 15, 37, ∅, 7, 32, 19, 10. Apply: delete 24, delete 37, search 13, search 28, insert 46, update 19. Give the final table.',
    idea: 'Only the two deletes and the insert move anything. Do the probing for each, then write the table once at the end.',
    steps: [
      { text: 'All six operations ($k \\bmod 11$ is the first slot of each path):', table: { head: ['operation', 'probe sequence', 'result', 'table change'], rows: [
        ['delete 24', '2', 'found at 2', 'slot 2 → DEL'],
        ['delete 37', '4 (15), $(4 + 1) = 5$', 'found at 5', 'slot 5 → DEL'],
        ['search 13', '2 (DEL), 3', 'found at 3', 'none'],
        ['search 28', '6 (∅)', 'NOT FOUND', 'none'],
        ['insert 46', '2 (DEL, recorded), 3, 6 (∅)', 'absent', 'slot 2 → 46'],
        ['update 19', '8 (32), 9', 'found at 9', 'value only; index stays 9'],
      ] } },
      '37 has home $37 - 33 = 4$, but it lives in slot 5, so the DEL goes in slot 5, the slot where the search finds it.',
      { text: 'The table at each stage:', table: slots(['start', 'after deletes', 'final'], T22_START, T22_DELS, T22_FINAL) },
    ],
    answer: '21, 1, 46, 13, 15, DEL, ∅, 7, 32, 19, 10. 46 reuses 24’s DEL at slot 2; 37’s DEL at 5 stays; 19 is updated in place at 9.',
    mistake: 'Marking slot 4 as DEL for 37 because 4 is its home. Mark the slot where the search actually finds the key; her own line says "Mark slot 5".',
    tryIt: { q: 'Quadratic probing, $m = 7$, $h(k, i) = (k \\bmod 7 + i^2) \\bmod 7$. Slots 0–6: 17, ∅, ∅, 10, 3, 24, ∅. Delete 3, search 24, insert 11, update 10. Final table?', a: 'Delete 3: home 3 (10), 4: found, DEL at 4. Search 24: 3, 4 (DEL), 0, 5: found. Insert 11: home 4 is DEL (record), 5 (24), $(4 + 4) \\bmod 7 = 1$ (∅): 11 into slot 4. Final: 17, ∅, ∅, 10, 11, 24, ∅.' },
  };

  // ═══════════════════════ Problem 3: double hashing (m = 13) ═══════════════════════

  H['c310-ws-openaddr-3-1-31'] = {
    asks: 'Double hashing, $m = 13$, $h_1(k) = k \\bmod 13$, $h_2(k) = 1 + (k \\bmod 11)$. After inserting 18, 41, 23, insert 31. Give its probe sequence.',
    idea: 'Double hashing starts at $h_1(k)$ and then steps by a key-specific stride $h_2(k)$, wrapping mod 13. Compute $h_1$ and $h_2$ once, then add the stride over and over.',
    steps: [
      'Table before: $18 \\bmod 13 = 5$, $41 \\bmod 13 = 41 - 39 = 2$, $23 \\bmod 13 = 10$. All were free, so slots 2, 5, 10 are full.',
      '$h_1(31) = 31 - 26 = 5$. $h_2(31) = 1 + (31 \\bmod 11) = 1 + (31 - 22) = 1 + 9 = 10$.',
      { text: 'Probe for 31:', table: { head: PH, rows: [
        ['31', '0', '$(5 + 0) \\bmod 13 = 5$', '18', 'continue'],
        ['31', '1', '$(5 + 10) \\bmod 13 = 2$', '41', 'continue'],
        ['31', '2', '$(5 + 20) \\bmod 13 = 12$', '∅', 'place at 12'],
      ] } },
      'The wraps: $15 - 13 = 2$ and $25 - 13 = 12$.',
    ],
    answer: '5, 2, 12. The stride is $h_2(31) = 10$: $5$, then $(5 + 10) \\bmod 13 = 2$, then $(5 + 20) \\bmod 13 = 12$.',
    mistake: 'Dropping the "1 +" in $h_2$ (a stride of 9 gives 5, 1, …) or taking $h_2$ mod 13 instead of mod 11. Write $h_2$ out in full before probing.',
    tryIt: { q: 'Double hashing, $m = 11$, $h_1(k) = k \\bmod 11$, $h_2(k) = 1 + (k \\bmod 9)$. Insert 14, then 11, then 25. Probe sequence of 25?', a: '14 → 3, 11 → 0. $h_1(25) = 3$, $h_2(25) = 1 + 7 = 8$. Slot 3 (14), $(3 + 8) \\bmod 11 = 0$ (11), $(3 + 16) \\bmod 11 = 8$: free. Sequence 3, 0, 8.' },
  };

  H['c310-ws-openaddr-3-2-search79'] = {
    asks: 'Double hashing, $m = 13$, $h_1(k) = k \\bmod 13$, $h_2(k) = 1 + (k \\bmod 11)$. Table: DEL, 14, 41, 3, 43, 18, 6, 33, 8, 9, 23, 11, 31 (no ∅). Search for 79: give the full probe sequence.',
    idea: 'There is no ∅ and 79 is not stored, so nothing stops the search: it visits every slot. The stride 3 shares no factor with 13, so the 13 probes land on 13 different slots.',
    steps: [
      '$h_1(79) = 79 - 78 = 1$ (since $78 = 6 \\cdot 13$). $h_2(79) = 1 + (79 \\bmod 11) = 1 + (79 - 77) = 3$.',
      'Each probe adds 3 to the previous one, wrapping past 12: $1, 4, 7, 10$, then $13 - 13 = 0$, $3, 6, 9, 12$, then $15 - 13 = 2$, $5, 8, 11$.',
      { text: 'Search for 79:', table: { head: PH, rows: [
        ['79', '0', '1', '14', 'continue'], ['79', '1', '4', '43', 'continue'], ['79', '2', '7', '33', 'continue'],
        ['79', '3', '10', '23', 'continue'], ['79', '4', '0', 'DEL', 'continue'], ['79', '5', '3', '3', 'continue'],
        ['79', '6', '6', '6', 'continue'], ['79', '7', '9', '9', 'continue'], ['79', '8', '12', '31', 'continue'],
        ['79', '9', '2', '41', 'continue'], ['79', '10', '5', '18', 'continue'], ['79', '11', '8', '8', 'continue'],
        ['79', '12', '11', '11', 'continue'],
      ] } },
      'After $i = 12$ all 13 slots are checked; the next probe, $(1 + 39) \\bmod 13 = 1$, is the home slot again. NOT FOUND.',
    ],
    answer: '1, 4, 7, 10, 0, 3, 6, 9, 12, 2, 5, 8, 11, then NOT FOUND. Stride 3; with no ∅ to stop at, all 13 slots are checked.',
    mistake: 'Stopping at slot 0 because it is DEL. DEL means continue; with no ∅ in the table, an unsuccessful search costs all $m$ probes.',
    tryIt: { q: 'Double hashing, $m = 7$, $h_1(k) = k \\bmod 7$, $h_2(k) = 1 + (k \\bmod 5)$. Slots 0–6: DEL, 8, 2, 10, 4, 12, 13. Search for 22: full probe sequence?', a: '$h_1(22) = 1$, $h_2(22) = 1 + 2 = 3$. Slots 1, 4, 0 (DEL), 3, 6, 2, 5: all 7 slots, no 22, no ∅: NOT FOUND.' },
  };

  H['c310-ws-openaddr-3-2-ins65'] = {
    asks: 'Same table (DEL, 14, 41, 3, 43, 18, 6, 33, 8, 9, 23, 11, 31; $m = 13$). Insert 65 with the record-the-first-DEL rule. Which slot does it end up in?',
    idea: 'Home slot 0 is a DEL: record it. The table has no ∅, so the duplicate check runs through all 13 slots before 65 may take the recorded DEL.',
    steps: [
      '$h_1(65) = 65 \\bmod 13 = 0$ (since $65 = 5 \\cdot 13$). $h_2(65) = 1 + (65 \\bmod 11) = 1 + (65 - 55) = 1 + 10 = 11$.',
      'Worksheet slip: it prints $h_2(65) = 10$, but the value is 11. The final slot is the same either way, because slot 0 is probe $i = 0$.',
      { text: 'Probe for 65 (stride 11):', table: { head: PH, rows: [
        ['65', '0', '0', 'DEL', 'record slot 0, continue'], ['65', '1', '11', '11', 'continue'], ['65', '2', '$22 \\bmod 13 = 9$', '9', 'continue'],
        ['65', '3', '$33 \\bmod 13 = 7$', '33', 'continue'], ['65', '4', '$44 \\bmod 13 = 5$', '18', 'continue'], ['65', '5', '$55 \\bmod 13 = 3$', '3', 'continue'],
        ['65', '6', '$66 \\bmod 13 = 1$', '14', 'continue'], ['65', '7', '$77 \\bmod 13 = 12$', '31', 'continue'], ['65', '8', '$88 \\bmod 13 = 10$', '23', 'continue'],
        ['65', '9', '$99 \\bmod 13 = 8$', '8', 'continue'], ['65', '10', '$110 \\bmod 13 = 6$', '6', 'continue'], ['65', '11', '$121 \\bmod 13 = 4$', '43', 'continue'],
        ['65', '12', '$132 \\bmod 13 = 2$', '41', 'continue'],
      ] } },
      'No 65 and no ∅ in 13 probes, so 65 overwrites the recorded DEL in slot 0. Her "Action" blank: overwrite DEL.',
      { text: 'Before and after:', table: slots(['before', 'after insert 65'], T32_DEL, T32_FINAL) },
    ],
    answer: '0. Slot 0 is the first DEL on 65’s path; the other 12 probes find no 65 and no ∅, so 65 overwrites the DEL in slot 0.',
    mistake: 'Answering "table full" because there is no ∅. A DEL is free space: after all $m$ probes the key goes into the recorded DEL.',
    tryIt: { q: 'Double hashing, $m = 7$, $h_1(k) = k \\bmod 7$, $h_2(k) = 1 + (k \\bmod 5)$. Slots 0–6: DEL, 8, 2, 10, 4, 12, 13. Insert 21.', a: '$h_1(21) = 0$ (DEL, record), $h_2(21) = 1 + 1 = 2$. Probes 0, 2, 4, 6, 1, 3, 5: no 21 and no ∅. 21 goes into slot 0.' },
  };

  // ═══════════════════════ Section 4: Java trace ═══════════════════════

  const JH = ['$i$', 'slot', 'table[slot]', 'what the code does', 'tombstoneIndex after'];

  H['c310-ws-openaddr-java-E'] = {
    asks: 'Trace insert("E") on the table "A", "DEL", "C", null, "DEL" (capacity 5), with initial slot 0. What does it return?',
    idea: 'The method is the worksheet’s insert rule in code. tombstoneIndex remembers the first DEL (−1 means none yet), and a null slot ends the loop and writes the key into the remembered DEL if there is one.',
    steps: [
      'Start: initialSlot = 0, tombstoneIndex = −1. Each pass computes slot = (0 + i) % 5, which is just $i$ here.',
      { text: 'Her trace table (Q1a):', table: { head: JH, rows: [
        ['0', '0', '"A"', 'not null, not DEL, not "E": nothing', '−1'],
        ['1', '1', '"DEL"', 'DEL and tombstoneIndex is −1: set it to 1', '1'],
        ['2', '2', '"C"', 'not null, not DEL, not "E": nothing', '1'],
        ['3', '3', 'null', 'targetSlot = tombstoneIndex = 1; store, return 1', '1'],
      ] } },
      'At $i = 3$: targetSlot = (tombstoneIndex != −1) ? tombstoneIndex : slot gives 1, so table[1] = "E" and the method returns 1.',
      'Table afterwards: "A", "E", "C", null, "DEL". The DEL in slot 4 is never reached.',
    ],
    answer: '1. The first DEL (slot 1) is remembered at $i = 1$; the null in slot 3 proves "E" is absent, so "E" is written into slot 1 and 1 is returned.',
    mistake: 'Returning 3, the slot where the loop stopped. The null only ends the search; targetSlot picks the remembered tombstone first.',
    tryIt: { q: 'Same method, capacity 5, table "P", null, "DEL", "Q", "DEL". insert("R") with initial slot 2: what does it return?', a: '$i = 0$: slot 2 DEL, tombstoneIndex = 2. $i = 1$: slot 3 "Q". $i = 2$: slot 4 DEL, already set, stays 2. $i = 3$: slot 0 "P". $i = 4$: slot 1 null, so "R" goes to slot 2: returns 2.' },
  };

  H['c310-ws-openaddr-java-why'] = {
    asks: "In the trace of insert(\"E\") on \"A\", \"DEL\", \"C\", null, \"DEL\", why is \"E\" not written into slot 1 the moment the DEL there is found?",
    idea: 'At slot 1 the method knows the seat is free, but not whether "E" is already stored further along its probe path. Only reaching null (or finishing the loop) answers that.',
    steps: [
      'How such a table arises: a key whose path starts at slot 0 can be inserted while slot 1 is full, landing at 2 or later. Deleting slot 1’s old key later turns slot 1 into DEL, but the later key stays put.',
      'So when insert("E") reaches the DEL at slot 1, "E" might already be in slot 2 or beyond. Writing now could create a second "E".',
      'The code only records it (tombstoneIndex = 1) and keeps looping: slot 2 is "C" (not "E"), slot 3 is null.',
      'null means "E" cannot be further on: any earlier insert of "E" would have stopped at this null or before it. Now writing into slot 1 is safe.',
      'insert("C") on the same table shows the check working: it records slot 1, then finds "C" in slot 2 and returns −2 instead of making a copy.',
    ],
    answer: 'Because "E" might already exist further along the probe sequence. The method only remembers slot 1 in tombstoneIndex and keeps probing; when the null in slot 3 proves "E" is absent, it writes "E" into slot 1.',
    mistake: 'Answering "slot 1 is not free". It is free; the reason to wait is the duplicate check.',
    tryIt: { q: 'Capacity 5, table "P", null, "DEL", "Q", "DEL". A buggy insert writes into the first DEL immediately. What happens on insert("Q") with initial slot 2?', a: 'Slot 2 is DEL, so the buggy code writes "Q" there: the table now holds "Q" in slots 2 and 3. The correct code records 2, finds "Q" at slot 3 on the next probe, and returns −2.' },
  };

  H['c310-ws-openaddr-java-C'] = {
    asks: 'Same method and table ("A", "DEL", "C", null, "DEL"). insert("C") with initial slot 0: what does it return?',
    idea: 'Every slot that holds a real key is compared with the key being inserted. A match means "already here": the method returns −2 before writing anything.',
    steps: [
      { text: 'Trace:', table: { head: JH, rows: [
        ['0', '0', '"A"', 'not null, not DEL, not "C": nothing', '−1'],
        ['1', '1', '"DEL"', 'DEL and tombstoneIndex is −1: set it to 1', '1'],
        ['2', '2', '"C"', 'table[slot].equals(key) is true: return −2', '1 (discarded)'],
      ] } },
      'Nothing is written. The recorded tombstone is thrown away, and the table stays "A", "DEL", "C", null, "DEL".',
      'Her question says "line 26" triggers, but in her numbered listing line 26 is only a closing brace (a worksheet slip). The line that fires is line 29, return -2, right after the equals test on line 28.',
    ],
    answer: '-2. At $i = 2$, table[2].equals("C") is true, so the duplicate branch (her line 29) returns -2 without inserting.',
    mistake: 'Answering 1 because a tombstone was already recorded. The tombstone is used only once the key is proved absent; finding the key returns -2 first.',
    tryIt: { q: 'Capacity 5, table "P", null, "DEL", "Q", "DEL". insert("P") with initial slot 4: what does it return?', a: '$i = 0$: slot 4 DEL, tombstoneIndex = 4. $i = 1$: slot $(4 + 1) \\% 5 = 0$ holds "P", equal to the key: return -2; nothing is written.' },
  };

  H['c310-ws-openaddr-dup-bug'] = {
    asks: "Suppose an insert wrote the key into the FIRST DEL it met, without probing on for a duplicate. What would go wrong?",
    idea: 'A key can sit past a DEL on its own path (it was inserted while that slot was full). Dropping a new copy into the DEL gives the table two copies, and the two copies then disagree.',
    steps: [
      'Use her Java table "A", "DEL", "C", null, "DEL" and a buggy insert("C") with initial slot 0. Slot 0 holds "A"; slot 1 is DEL, so the bug writes "C" there at once.',
      { text: 'Now "C" is in two slots. Watch what a later delete("C") does:', table: slots(['before', 'after buggy insert("C")', 'after delete("C")'], ['A', D, 'C', E, D], ['A', 'C', 'C', E, D], ['A', D, 'C', E, D]) },
      'Search and update: a search for "C" stops at the first copy (slot 1), so an update changes only that copy; slot 2 keeps the old value.',
      'Delete: delete("C") finds slot 1 and marks it DEL. A later search walks past that DEL and finds the stale copy in slot 2, so the deleted key is still "there".',
    ],
    answer: "If the key already existed further along the probe sequence, the table would hold two copies. (Searches and updates reach only the first copy, and after a delete the stale older copy is found again.)",
    mistake: 'Thinking the only cost is a wasted slot. The real damage is wrong answers: updates miss a copy and deleted keys come back.',
    tryIt: { q: 'Linear probing, $m = 7$, $h^{\\prime}(k) = k \\bmod 7$. Insert 10 and 17, delete 10, then run the buggy insert of 17. Now delete 17 and search for 17. What happens?', a: '10 → 3, 17 → 4; deleting 10 leaves DEL at 3. Buggy insert 17: home 3 is DEL, so 17 is written there: copies in 3 and 4. Delete 17 marks slot 3 DEL; the search goes 3 (DEL), 4: found. The deleted key is still found.' },
  };

  // ═══════════════════════ Section 5: clustering ═══════════════════════

  H['c310-ws-openaddr-primary'] = {
    asks: 'Under linear probing, long continuous blocks of occupied slots build up. What is this called?',
    idea: 'With linear probing, any key whose home falls inside a block slides to the block’s end and joins it. So a block grows from every key that hashes into it, and neighbouring blocks merge.',
    steps: [
      'Picture $m = 10$ with slots 3, 4, 5, 6 full: one block of 4. A new key’s home is equally likely to be any slot.',
      { text: 'Where a new key lands, by home slot:', table: { head: ['home slot', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'], rows: [['lands in', '0', '1', '2', '7', '7', '7', '7', '7', '8', '9']] } },
      'Homes 3–7 all land in slot 7, and home 2 lands in slot 2, right in front of the block. Either way the block grows: 6 of 10 homes make it longer.',
      'A lone empty slot with empty neighbours, like 9, is filled only by home 9: 1 in 10. Big blocks grow fastest, and her name for this (worksheet Part A) is primary clustering.',
    ],
    answer: 'Primary clustering: under linear probing, colliding keys fill consecutive slots, forming long runs (primary clusters) that new keys keep extending.',
    mistake: 'Calling it secondary clustering. Secondary clustering is the quadratic-probing effect (same home, same path); long contiguous blocks are primary.',
    tryIt: { q: 'Linear probing, $m = 10$: slots 0–7 full, 8 and 9 empty. A new key’s home is equally likely to be any slot. What is the chance it lands in slot 8?', a: 'Homes 0–7 slide down the block to slot 8, and home 8 is slot 8 itself. Only home 9 avoids it: $9/10$.' },
  };

  H['c310-ws-openaddr-primary-why'] = {
    asks: 'Explain why primary clustering pushes linear-probing lookups from $O(1)$ toward $O(n)$ as the load factor $\\alpha$ approaches 1.',
    idea: 'A key whose home is inside a cluster must walk to the cluster’s end. As $\\alpha \\to 1$ the clusters merge into one run almost as long as the table, so one walk can cost almost $n$ probes.',
    steps: [
      'Cost of a search or insert = number of probes = the full slots walked over, plus 1 for the slot where it stops.',
      'Small $\\alpha$: most slots are ∅ and clusters are short, so a typical walk is 1 or 2 probes: $O(1)$.',
      'Clusters feed themselves: a cluster of length $L$ catches every key whose home is one of its $L$ slots, so long clusters grow fastest, and two clusters merge when the gap between them fills.',
      { text: 'Example: $m = 10$, slots 0–7 full in one run ($n = 8$, $\\alpha = 0.8$). Probes for an unsuccessful search, by home slot:', table: { head: ['home slot', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'], rows: [['probes', '9', '8', '7', '6', '5', '4', '3', '2', '1', '1']] } },
      'Average: $(9 + 8 + 7 + 6 + 5 + 4 + 3 + 2 + 1 + 1)/10 = 46/10 = 4.6$ probes, and the worst is $n + 1 = 9$. As $\\alpha \\to 1$ the single run covers almost all $n$ keys, so the walk grows like $n$: $O(n)$.',
    ],
    answer: 'A key that hashes anywhere into a cluster must probe to its end, and is then added there, so big clusters grow faster and merge with neighbours. As $\\alpha \\to 1$ the runs approach the whole table, so a search or insert can scan nearly all $n$ keys.',
    mistake: 'Saying it is slow simply "because the table is full". The cause is the runs: linear probing makes them grow and merge on their own, and one long run makes each lookup walk many slots.',
    tryIt: { q: 'Linear probing, $m = 10$: slots 0–3 and 5–8 full (two runs of 4), slots 4 and 9 empty. Average probes for an unsuccessful search, each home equally likely? Then a key fills slot 4: average now?', a: 'By home 0–9: 5, 4, 3, 2, 1, 5, 4, 3, 2, 1, average $30/10 = 3.0$. Filling slot 4 merges the runs into 0–8: 10, 9, …, 2, then 1 for home 9, average $55/10 = 5.5$. One extra key nearly doubled the cost.' },
  };

  H['c310-ws-openaddr-secondary'] = {
    asks: 'Two different keys have the same home slot, so quadratic probing sends them along identical probe paths. What is this effect called?',
    idea: 'Quadratic probing’s path is home $+ 0, 1, 4, 9, \\dots$: it depends only on the home slot, not on the key. Keys with the same home walk exactly the same path and collide at each step.',
    steps: [
      'Her Problem 2.1: 10, 21 and 32 all have $k \\bmod 11 = 10$.',
      { text: 'Their path, the same for all three keys:', table: { head: ['$i$', '$i^2$', 'slot $(10 + i^2) \\bmod 11$'], rows: [['0', '0', '10'], ['1', '1', '0'], ['2', '4', '3'], ['3', '9', '8']] } },
      '21 retraces 10’s path and collides at slot 10; 32 retraces it and collides at slots 10 and 0 with those same two keys.',
      'This is secondary clustering. It is milder than primary clustering: keys with nearby but different homes jump apart, so long blocks do not form, but equal homes still share one path (worksheet Part B).',
    ],
    answer: 'Secondary clustering: under quadratic probing the probe sequence depends only on $h^{\\prime}(k)$, so keys with the same home slot follow the identical path.',
    mistake: 'Calling it primary clustering. Primary means contiguous blocks under linear probing; secondary means shared paths for keys with equal home slots.',
    tryIt: { q: 'Quadratic probing, $m = 11$, $h(k, i) = (k \\bmod 11 + i^2) \\bmod 11$. Give the first four probes of 14 and of 25.', a: 'Both have home 3 ($14 - 11 = 3$, $25 - 22 = 3$). Both paths: $3, 4, 7, (3 + 9) \\bmod 11 = 1$. Identical: secondary clustering.' },
  };

  H['c310-ws-openaddr-double-fix'] = {
    asks: "How does double hashing avoid both primary and secondary clustering?",
    idea: 'In double hashing the stride $h_2(k)$ comes from the key itself. Two keys with the same home usually get different strides, so after their first collision their paths split.',
    steps: [
      'Linear forms blocks because every key uses stride 1, so keys with nearby homes run into each other (primary).',
      'Quadratic shares paths because the offsets $i^2$ are the same for every key, so the path depends only on the home (secondary).',
      'Double hashing: probe $i$ is $(h_1(k) + i \\cdot h_2(k)) \\bmod m$. Both the start and the stride depend on $k$.',
      { text: 'Her Problem 3 ($m = 13$): 18 and 31 share home $h_1 = 5$, but $h_2(18) = 1 + 7 = 8$ and $h_2(31) = 1 + 9 = 10$:', table: { head: ['$i$', 'slot for 18 (stride 8)', 'slot for 31 (stride 10)'], rows: [['0', '5', '5'], ['1', '$13 \\bmod 13 = 0$', '$15 \\bmod 13 = 2$'], ['2', '$21 \\bmod 13 = 8$', '$25 \\bmod 13 = 12$'], ['3', '$29 \\bmod 13 = 3$', '$35 \\bmod 13 = 9$']] } },
      'Same home, different paths after the first probe: no shared path (no secondary clustering) and no +1 sliding into blocks (no primary clustering).',
    ],
    answer: 'The step size $h_2(k)$ depends on the key, so keys that collide, even with the same home $h_1$, usually follow different probe sequences instead of sharing one run or one path.',
    mistake: 'Saying double hashing "never collides". It still collides; it just sends colliding keys on different paths, provided $h_2(k)$ is never 0 and shares no factor with $m$.',
    tryIt: { q: 'Double hashing, $m = 11$, $h_1(k) = k \\bmod 11$, $h_2(k) = 1 + (k \\bmod 7)$. First four probes of 14 and of 25?', a: 'Both have home 3. $h_2(14) = 1 + 0 = 1$: 3, 4, 5, 6. $h_2(25) = 1 + 4 = 5$: 3, 8, $13 \\bmod 11 = 2$, $18 \\bmod 11 = 7$. The paths split after slot 3.' },
  };

  H['c310-ws-openaddr-gcd'] = {
    asks: 'Double hashing with $m = 12$. A key has $h_1 = 5$ and $h_2 = 4$. How many different slots can its probe sequence ever visit?',
    idea: 'Picture a 12-hour clock: start at 5 and jump 4 hours at a time. Three jumps make 12 hours, a full lap, so you are back at 5 having seen only 3 positions.',
    steps: [
      { text: 'Compute the probes $(5 + 4i) \\bmod 12$:', table: { head: ['$i$', '$4i$', '$5 + 4i$', 'slot'], rows: [['0', '0', '5', '5'], ['1', '4', '9', '9'], ['2', '8', '13', '$13 - 12 = 1$'], ['3', '12', '17', '$17 - 12 = 5$ (repeat)']] } },
      'At $i = 3$, $3 \\cdot 4 = 12$ is a full lap, so the probe is back at 5, and 5, 9, 1 repeat forever.',
      'General rule: the path first returns home when $i \\cdot h_2$ is a multiple of $m$, at $i = m / \\gcd(h_2, m) = 12 / \\gcd(4, 12) = 12/4 = 3$.',
      'If slots 5, 9 and 1 are full, the insert fails although 9 other slots are free. With $\\gcd(h_2(k), m) = 1$ (for example $m$ prime, as in her Problem 3 with $m = 13$), every path reaches all $m$ slots.',
    ],
    answer: '3: slots 5, 9, 1, then it repeats. $12 / \\gcd(4, 12) = 12/4 = 3$.',
    mistake: 'Answering 12 because the loop runs $m$ times. It does run 12 times, but it visits the same 3 slots four times each.',
    tryIt: { q: 'Double hashing, $m = 15$, a key with $h_1 = 2$ and $h_2 = 6$. How many different slots, and which?', a: '$\\gcd(6, 15) = 3$, so $15/3 = 5$ slots: 2, 8, 14, $20 \\bmod 15 = 5$, $26 \\bmod 15 = 11$; then $(2 + 30) \\bmod 15 = 2$ again.' },
  };
})(globalThis.FC = globalThis.FC || {});
