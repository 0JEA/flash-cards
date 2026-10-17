// "Help" walkthroughs for CSC 325 (Software Testing) cards, lectures 4, 5 and 6:
// dependability, systematic testing (coverage, mutation testing), where bugs hide,
// how to test (divisibility, visibility, repeatability) and the defect report process.
// Same format as decks/csc370-help.js (math OFF: plain text, `backticks` for code words).
// Split-off cards (ids ending in -qN) reuse their original card's entry.
(function (FC) {
  'use strict';
  const H = FC.help = FC.help || {};

  // ---- Shared ideas (one per topic, reused by every card on that topic) ----
  const Y2038 = 'Computers often store time as one number: seconds since 1 January 1970. Any fixed-size counter has a largest value, and when the count passes it, the number wraps around to a negative value, so the clock jumps back to 1901. The fix is a bigger counter, but every system, file and database that stored the old 32-bit number has to change with it.';
  const METHODS = 'Think of four moments in a fault\'s life. Before it exists: stop it from being possible (fault avoidance). After it happens at run time: keep serving anyway (fault tolerance). While it sits in the code: find it and take it out (error removal, where testing lives). Before you even look: estimate where and how many there are (error forecasting).';
  const METHOD_STEPS = [
    { text: 'The four methods for a dependable system, each with the course\'s examples:', table: { head: ['method', 'how', 'examples'], rows: [
      ['Fault avoidance', 'prevent faults by construction', 'array bound checking, type checking'],
      ['Fault tolerance', 'keep correct service by redundancy, despite faults', 'redundant airplane systems, backup servers'],
      ['Error removal', 'minimise the errors present', 'code review, testing, patching a known bug'],
      ['Error forecasting', 'estimate by evaluation the presence, creation and consequences of errors', 'defect prediction, complexity metrics, anomaly detection']] } },
    'Ask: does it stop the fault from ever being written or run? Avoidance. Does a spare take over when something breaks? Tolerance. Does it find a fault that is already there? Removal. Does it only predict or measure? Forecasting.',
    'Testing is one form of error removal: "testing is only one part of the bigger scheme".',
  ];
  const MEASURES = 'Each measure answers a different question about trust. Is it up right now (availability)? Does it keep working without failing (reliability)? If it fails, does anyone get hurt (safety)? Can its data be changed improperly (integrity)? Can we fix and change it (maintainability)?';
  const MEASURE_STEPS = [
    { text: 'The five dependability measures, with their definitions:', table: { head: ['measure', 'definition'], rows: [
      ['Availability', 'readiness for correct service'],
      ['Reliability', 'continuity of correct service'],
      ['Safety', 'absence of catastrophic consequences for the user/environment'],
      ['Integrity', 'absence of improper system alteration (e.g. modifying data)'],
      ['Maintainability', 'ability to undergo modification and repair']] } },
    'The pair students mix up: availability is about being ready when asked (how much of the time it is up); reliability is about how long it keeps going before the next failure.',
    'Four other important features are named alongside them: confidentiality, security, testability and sustainability.',
  ];
  const AVAIL = 'Availability is a fraction of time: of all the hours, how many was the system up? A cycle is "running" (MTBF) followed by "being repaired" (MTTR), so the up fraction is MTBF / (MTBF + MTTR).';
  const AVAIL_STEPS = [
    'MTBF, Mean Time Between Failures, answers "how likely is the system to be running?". MTTR, Mean Time To Repair, answers "how quickly can it be restored after a failure?".',
    'One cycle of life is: run for MTBF hours, fail, spend MTTR hours being repaired. The whole cycle lasts MTBF + MTTR.',
    'Availability = MTBF / (MTBF + MTTR): the up part of the cycle divided by the whole cycle. It is between 0 and 1; closer to 1 is better.',
    'QA wants such a number to decide whether to spend more money on testing, and what to test.',
    'Careful: the lecture-5 timeline draws MTBF from one failure to the next, which includes repair time, and textbooks write MTTF / (MTTF + MTTR). For the exam, use the lecture formula and read MTBF as the up time.',
  ];
  const FAILPLAN = 'In a critical system, failure is not "if" but "when": hardware breaks and some software fails. So you decide in advance which failures are allowable and which are critical, and you test what happens when things break, with rigour matched to how bad the failure would be.';
  const FAILPLAN_STEPS = [
    'Expect physical devices to break and some software to fail.',
    'The key idea: identify allowable failures vs critical failures.',
    'That is why there are negative test cases, stress tests, and tests where you pull the plug on some hardware.',
    'Netflix\'s Chaos Monkey takes this into production: it randomly turns off servers during business hours, so engineers must build services that survive it.',
    'Criticality of failure drives the testing process: the worse a failure could be, the more rigorous the testing.',
  ];
  const DO178 = 'DO-178B (Software Considerations in Airborne Systems and Equipment Certification) sorts airplane software failures by how bad the result is. The worse the category, the more rigorous the testing must be.';
  const DO178_TABLE = { text: 'The five categories, most to least severe:', table: { head: ['category', 'what the failure does'], rows: [
    ['Catastrophic', 'may cause a crash of the airplane (deaths, usually loss of the aircraft)'],
    ['Hazardous', 'large negative impact on safety or performance'],
    ['Major', 'significant but not hazardous: passenger discomfort, higher crew workload'],
    ['Minor', 'noticeable, not much impact: e.g. a routine flight-plan change'],
    ['No effect', 'no impact on safety, operation or crew workload']] } };
  const COVER = 'Structural testing looks inside the code: if a line never ran during your tests, the tests cannot have checked it. Code coverage measures how much ran. But "it ran" is not "it was checked", and some code is hard or impossible to reach, so coverage is a floor, never a proof.';
  const COVER_STEPS = [
    'Structural testing is white-box testing: tests are based on knowledge of the code. Its principle: "If you have not sufficiently executed your code, how can you accept that it has been properly tested?"',
    'Coverage criteria named in the course: statement, condition, decision, branch, condition/decision, modified condition/decision (MC/DC), and observable MC/DC.',
    { text: 'Three challenges make structural coverage hard:', table: { head: ['challenge', 'why it hurts'], rows: [
      ['Interprocedural coverage of large OO programs', 'polymorphism: hard to know which code a call reaches'],
      ['Regression testing', 'the same suite run on a changed program may no longer cover it'],
      ['Late binding', 'functions created at run time']] } },
    'The infeasibility problem: 100% is often impossible, so teams accept an adequacy score such as 95% statement coverage. Downside: testers do the easy, high-coverage parts first and the hard parts stay untested.',
  ];
  const MUT = 'Mutation testing tests your tests. Plant a small, deliberate bug (a mutant) in a copy of the program and run your suite. If some test fails, the suite noticed the bug: the mutant is killed. If every test still passes, your suite is blind to that kind of change.';
  const MUT_STEPS = [
    'Start with a suite that passes on the original program. Question: how likely are these tests to reveal faults?',
    'Mutate: make many copies of the program, each with one small change, e.g. `delta = newGuess + sqrt;` becomes `delta = newGuess - sqrt;`.',
    'Run the same test data on the original and on each mutant, and compare: a mutant is killed when at least one test fails on it.',
    'A surviving (non-equivalent) mutant shows a test gap. A trivial mutant like `sqrt + newGuess` behaves the same as the original (it is equivalent); a stillborn mutant like `sqrt = newGuess +` does not even compile.',
    'Score: MS(P, T) = K / (M − E), with K killed, M generated, E equivalent mutants. Equivalent ones are removed because nothing can kill them.',
  ];
  const DOUBT = 'Coverage and mutation scores are popular and intuitive, but research is not fully convinced they measure what we care about: finding real faults. Use them as signals, not proof.';

  // ---- Year 2038 ----
  H['st4-2038-why'] = {
    asks: 'Explain why many systems will break on 19 January 2038.',
    idea: Y2038,
    steps: [
      'UNIX defined `time_t` as a signed 32-bit integer counting seconds since 1970-01-01.',
      'The largest signed 32-bit value is 2³¹ − 1 = 2,147,483,647.',
      { text: 'Counting that many seconds from 1970 lands on a fixed moment:', table: { head: ['value of time_t', 'date (UTC)'], rows: [['0', '1970-01-01 00:00:00'], ['2,147,483,647', '2038-01-19 03:14:07'], ['one more second', 'wraps to −2,147,483,648 = 1901-12-13 20:45:52']] } },
      'It is "beyond the year 2000 bug": the same kind of problem, a time format too small for the future.',
    ],
    answer: '`time_t` is a signed 32-bit count of seconds since 1970; its maximum 2³¹ − 1 = 2,147,483,647 is reached on 19 January 2038 (03:14:07 UTC), and the counter overflows.',
    mistake: 'Saying 2³² instead of 2³¹ − 1. The type is signed, so one bit holds the sign and the maximum is 2³¹ − 1.',
    tryIt: { q: 'If `time_t` had been an UNSIGNED 32-bit count of seconds since 1970, when would it run out?', a: 'Maximum 2³² − 1 = 4,294,967,295 seconds, reached on 7 February 2106 (06:28:15 UTC). It could not represent dates before 1970, though.' },
  };
  H['st4-2038-real'] = {
    asks: 'Desktops moved to 64-bit long ago. Where does the 2038 problem still bite?',
    idea: Y2038,
    steps: [
      '32-bit systems look outdated on desktops, but they are still used a lot in embedded systems: small computers built into devices.',
      'The lecture\'s examples: GPS receivers in aircraft, anti-lock braking systems (ABS) in cars, routers and IP cameras. Such devices run for decades and are rarely updated.',
      'Fixing it is not free: changing the time format may create problems retrieving old data stored in the 32-bit format.',
      'Developers take it seriously: it is already fixed in Linux, Ruby, NetBSD, C, NFS, MySQL, C++ and Python 2.',
    ],
    answer: 'In embedded systems, which still use 32-bit time a lot: aircraft GPS receivers, car anti-lock brakes, routers, IP cameras.',
    mistake: 'Answering "old PCs". The point is long-lived embedded devices that nobody replaces, some of them safety-critical.',
    tryIt: { q: 'A city installs traffic-light controllers in 2025, expected to run for 20 years, using a 32-bit `time_t`. Is this a 2038 risk?', a: 'Yes: they will still be running in 2038 (2025 + 20 = 2045), and embedded controllers like this are exactly where 32-bit time survives.' },
  };

  // ---- Dependability methods ----
  H['st4-dependability-def'] = {
    asks: 'Give the course definition of dependability.',
    idea: 'Dependable means you can trust it, and trust is about time: a service you could rely on yesterday but not tomorrow is not dependable.',
    steps: [
      'Dependability: the ability to provide services that can be trusted within a time-period.',
      'Two parts to remember: "services that can be trusted" and "within a time-period".',
      'It is achieved with four kinds of methods (fault avoidance, fault tolerance, error removal, error forecasting) and measured by availability, reliability, safety, integrity and maintainability.',
    ],
    answer: 'The ability to provide services that can be trusted within a time-period.',
    mistake: 'Defining it as "has no bugs". Dependability is about trusted service over time; a system with faults can still be dependable (e.g. through fault tolerance).',
    tryIt: { q: 'Which two key phrases must appear in a full definition of dependability?', a: '"Services that can be trusted" and "within a time-period".' },
  };
  H['st4-four-methods'] = {
    asks: 'List the four kinds of methods used to make a system dependable.',
    idea: METHODS,
    steps: METHOD_STEPS,
    answer: 'Fault avoidance, fault tolerance, error removal, and error forecasting.',
    mistake: 'Listing only testing-like activities. Two of the four (avoidance, tolerance) are about design, not finding bugs.',
    tryIt: { q: 'Which of the four methods does a code review belong to?', a: 'Error removal: it finds and removes errors already present (like testing and patching).' },
  };
  H['st4-fault-avoidance'] = {
    asks: 'Define fault avoidance and give an example.',
    idea: METHODS,
    steps: METHOD_STEPS,
    answer: 'Preventing, by construction, faults from occurring, e.g. Java array bound checking and type checking.',
    mistake: 'Confusing it with error removal. Avoidance makes the fault impossible from the start (the language or design stops it); removal finds one that already exists.',
    tryIt: { q: 'A language that has no null pointers at all, so a null dereference cannot be written. Which method?', a: 'Fault avoidance: the fault is prevented by construction.' },
  };
  H['st4-fault-tolerance'] = {
    asks: 'Define fault tolerance and give an example.',
    idea: METHODS,
    steps: METHOD_STEPS,
    answer: 'Providing, by redundancy, service that complies with the specification despite faults, e.g. redundant airplane systems, backup servers.',
    mistake: 'Thinking tolerance means the fault is gone. The fault still happens; redundancy keeps the service correct anyway.',
    tryIt: { q: 'A storage system keeps three copies of each file on different disks, so a dead disk loses nothing. Which method?', a: 'Fault tolerance: redundancy keeps correct service despite the fault.' },
  };
  H['st4-error-removal'] = {
    asks: 'Define error removal and give examples.',
    idea: METHODS,
    steps: METHOD_STEPS,
    answer: 'Minimising the presence of errors, e.g. code review, testing, patching a known bug.',
    mistake: 'Putting testing under error forecasting. Testing finds actual errors so they can be removed; forecasting only estimates.',
    tryIt: { q: 'A developer runs a static analyser, finds an unchecked null, and fixes it. Which method?', a: 'Error removal: an existing error is found and removed.' },
  };
  H['st4-error-forecasting'] = {
    asks: 'Define error forecasting and give examples.',
    idea: METHODS,
    steps: METHOD_STEPS,
    answer: 'Estimating, by evaluation, the presence, the creation and the consequences of errors, e.g. defect prediction, complexity metrics, anomaly detection.',
    mistake: 'Calling it removal because it is about errors. Forecasting removes nothing; it predicts or measures, to guide where to look.',
    tryIt: { q: 'A tool flags a sudden spike in a server\'s error log as unusual. Which method?', a: 'Error forecasting (anomaly detection): it estimates that something is wrong; it does not fix it.' },
  };
  H['st4-classify-backup'] = {
    asks: 'Backup servers take over when the main one crashes. Pick the dependability method.',
    idea: METHODS,
    steps: METHOD_STEPS,
    answer: 'Fault tolerance: the crash still happens, but redundancy keeps service correct.',
    mistake: 'Picking error removal. Nothing is fixed; a spare simply takes over.',
    tryIt: { q: 'An airplane has three flight computers that vote, so one wrong computer is outvoted. Which method?', a: 'Fault tolerance, by redundancy.' },
  };
  H['st4-classify-typecheck'] = {
    asks: 'The compiler refuses `int x = "hi";`. Pick the dependability method.',
    idea: METHODS,
    steps: METHOD_STEPS,
    answer: 'Fault avoidance: type checking prevents the fault by construction.',
    mistake: 'Picking error removal because the compiler "finds" something. The faulty program is never allowed to exist, so the fault is avoided.',
    tryIt: { q: 'Java throws `ArrayIndexOutOfBoundsException` instead of reading past an array. Which method?', a: 'Fault avoidance: array bound checking is the course\'s own example.' },
  };
  H['st4-classify-predict'] = {
    asks: 'Complexity metrics predict which modules will have most defects. Pick the method.',
    idea: METHODS,
    steps: METHOD_STEPS,
    answer: 'Error forecasting: it estimates where errors are; it does not remove them.',
    mistake: 'Picking error removal. A prediction removes nothing; it only tells you where to spend the removal effort.',
    tryIt: { q: 'A model trained on past bug reports ranks files by "likely to contain a bug". Which method?', a: 'Error forecasting (defect prediction).' },
  };
  H['st4-classify-testing'] = {
    asks: 'Which of the four methods does software testing fall under?',
    idea: METHODS,
    steps: METHOD_STEPS,
    answer: 'Error removal, alongside code review and patching known bugs.',
    mistake: 'Picking error forecasting because tests "measure" quality. A test finds real errors so they can be removed.',
    tryIt: { q: 'Patching a bug that a customer reported. Which method?', a: 'Error removal: patching a known bug is one of the course\'s examples.' },
  };

  // ---- Dependability measures ----
  H['st4-reliability-mc'] = {
    asks: 'Which measure is defined as "continuity of correct service"?',
    idea: MEASURES,
    steps: MEASURE_STEPS,
    answer: 'Reliability: how long correct service continues without failing.',
    mistake: 'Picking availability. Availability is readiness (up right now); reliability is continuity (keeps going).',
    tryIt: { q: 'A car\'s engine computer ran 200,000 km without a single fault. Which measure does that describe?', a: 'Reliability: continuity of correct service.' },
  };
  H['st4-availability-mc'] = {
    asks: 'Which measure is defined as "readiness for correct service"?',
    idea: MEASURES,
    steps: MEASURE_STEPS,
    answer: 'Availability: the system is ready to serve when asked.',
    mistake: 'Picking reliability. A system that crashes often but restarts instantly is still highly available, though not reliable.',
    tryIt: { q: 'A website promises it will be up 99.9% of the time. Which measure is that?', a: 'Availability: readiness for correct service.' },
  };
  H['st4-integrity-mc'] = {
    asks: 'Which measure is "absence of improper system alteration"?',
    idea: MEASURES,
    steps: MEASURE_STEPS,
    answer: 'Integrity: nothing (such as data) is improperly altered.',
    mistake: 'Picking safety. Safety is about catastrophic harm to users or the environment; integrity is about improper changes to the system.',
    tryIt: { q: 'A bug lets one user edit another user\'s bank balance. Which measure is violated?', a: 'Integrity: improper alteration of data.' },
  };
  H['st4-safety-mc'] = {
    asks: 'Which measure is "absence of catastrophic consequences for the user/environment"?',
    idea: MEASURES,
    steps: MEASURE_STEPS,
    answer: 'Safety.',
    mistake: 'Picking integrity. Integrity is about the system\'s data not being altered; safety is about harm in the real world.',
    tryIt: { q: 'An insulin pump\'s software overdoses a patient. Which measure failed?', a: 'Safety: a catastrophic consequence for the user.' },
  };
  H['st4-maintainability-mc'] = {
    asks: 'Which measure is the ability to undergo modification and repair?',
    idea: MEASURES,
    steps: MEASURE_STEPS,
    answer: 'Maintainability.',
    mistake: 'Picking availability because repair appears in the availability formula. Maintainability is about how easily the system can be changed and repaired.',
    tryIt: { q: 'A system where every bug fix takes weeks because nobody understands the code scores low on which measure?', a: 'Maintainability.' },
  };
  H['st4-other-features'] = {
    asks: 'Beyond the five measures, name the four other important features.',
    idea: MEASURES,
    steps: MEASURE_STEPS,
    answer: 'Confidentiality, security, testability, and sustainability.',
    mistake: 'Mixing them into the five measures. The five are availability, reliability, safety, integrity, maintainability; these four are listed separately.',
    tryIt: { q: 'Which of the four extra features is the one this course works on most directly?', a: 'Testability: how easy the software is to test.' },
  };

  // ---- Availability ----
  H['st4-mtbf-mttr'] = {
    asks: 'Expand MTBF and say what question it answers.',
    idea: AVAIL,
    steps: AVAIL_STEPS,
    answer: 'Mean Time Between Failures: how likely is the system to be running?',
    mistake: 'Swapping the questions. MTBF is about running; MTTR is about how fast it is restored after a failure.',
    tryIt: { q: 'What does MTTR stand for, and is a larger MTTR good or bad?', a: 'Mean Time To Repair; larger is bad, because the system stays down longer after each failure.' },
  };
  H['st4-availability-formula'] = {
    asks: 'Write availability using MTBF and MTTR, as the lecture gives it.',
    idea: AVAIL,
    steps: AVAIL_STEPS,
    answer: 'Availability = MTBF / (MTBF + MTTR): the fraction of time the system is up.',
    mistake: 'Writing MTTR / (MTBF + MTTR). That is the fraction of time the system is DOWN.',
    tryIt: { q: 'Using the formula, what happens to availability when MTTR shrinks toward 0?', a: 'It approaches MTBF / MTBF = 1: if repairs were instant, the system would always be ready.' },
  };
  H['st4-availability-calc'] = {
    asks: 'Compute availability with MTBF = 95 hours and MTTR = 5 hours.',
    idea: AVAIL,
    steps: [
      'Availability = MTBF / (MTBF + MTTR).',
      { text: 'Plug in the numbers:', table: { head: ['quantity', 'value'], rows: [['MTBF (up)', '95 h'], ['MTTR (repair)', '5 h'], ['MTBF + MTTR (one cycle)', '100 h'], ['Availability', '95 / 100 = 0.95']] } },
      'So it is up 95% of the time. Over a year (8,760 hours) that is about 438 hours down.',
    ],
    answer: '0.95, since 95 / (95 + 5) = 95 / 100.',
    mistake: 'Computing 95 / 5 or 1 − 5/95. The denominator is the whole cycle, MTBF + MTTR.',
    tryIt: { q: 'MTBF = 198 hours, MTTR = 2 hours. Availability?', a: '198 / (198 + 2) = 198 / 200 = 0.99.' },
  };

  // ---- Planning for failure ----
  H['st4-planning-failure'] = {
    asks: 'What is the central idea of planning for failure in critical systems?',
    idea: FAILPLAN,
    steps: FAILPLAN_STEPS,
    answer: 'Expect physical devices to break and some software to fail, and identify allowable failures vs critical failures.',
    mistake: 'Saying "make sure nothing fails". The premise is the opposite: failure will happen, so decide which failures are acceptable.',
    tryIt: { q: 'In a hospital system, which is an allowable failure and which is critical: the cafeteria menu page is down; the medication-dose calculator gives a wrong value?', a: 'The menu page down is allowable; a wrong dose is critical, and deserves the most rigorous testing.' },
  };
  H['st4-failure-tests'] = {
    asks: 'Name the three kinds of tests that planning for failure leads to.',
    idea: FAILPLAN,
    steps: FAILPLAN_STEPS,
    answer: 'Negative test cases, stress tests, and tests where we pull the plug on some hardware.',
    mistake: 'Listing only normal "happy path" tests. All three deliberately cause bad input, overload or broken hardware.',
    tryIt: { q: 'A test unplugs one of two database servers in the middle of a transaction. Which of the three kinds is it?', a: 'A "pull the plug on some hardware" test.' },
  };
  H['st4-chaos-monkey'] = {
    asks: 'Say what Netflix\'s Chaos Monkey does.',
    idea: FAILPLAN,
    steps: FAILPLAN_STEPS,
    answer: 'It randomly turns off servers (VM instances and containers) in the production environment during business hours.',
    mistake: 'Saying it runs in a test environment. The point is production, during business hours, when engineers are around to respond.',
    tryIt: { q: 'Why business hours rather than 3 a.m.?', a: 'Engineers are at work to see and fix what breaks, so failures teach them to build resilient services instead of causing unnoticed outages.' },
  };

  // ---- DO-178B ----
  H['st4-do178b'] = {
    asks: 'What is DO-178B, and how does it classify failures?',
    idea: DO178,
    steps: [DO178_TABLE, 'Criticality of failure drives the testing process: software whose failure could be catastrophic gets the most rigorous testing. (Lecture 5 shows the newer DO-178C, from 2012, with the same categories.)'],
    answer: '"Software Considerations in Airborne Systems and Equipment Certification": the airborne software certification standard. It classifies failures as catastrophic, hazardous, major, minor or no effect.',
    mistake: 'Treating it as a coding standard. It is a certification standard, and its core is the severity scale.',
    tryIt: { q: 'Which DO-178B category gets the least testing rigour?', a: 'No effect: the failure has no impact on safety, operation or crew workload.' },
  };
  H['st4-do178b-order'] = {
    asks: 'Order the five DO-178B categories from most to least severe.',
    idea: DO178,
    steps: [DO178_TABLE, 'Memory hook: C-H-M-M-N, "Crash, Harm, Major, Minor, Nothing".'],
    answer: 'Catastrophic, Hazardous, Major, Minor, No effect.',
    mistake: 'Putting Major above Hazardous. "Major" sounds big, but a major failure is significant yet not hazardous.',
    tryIt: { q: 'Which category sits just between Hazardous and Minor?', a: 'Major.' },
  };
  H['st4-do178b-catastrophic'] = {
    asks: 'Name the DO-178B category for a failure that may crash the airplane.',
    idea: DO178,
    steps: [DO178_TABLE],
    answer: 'Catastrophic.',
    mistake: 'Picking hazardous. Hazardous is a large negative impact on safety or performance, short of a crash.',
    tryIt: { q: 'A software failure in the engine controller can shut down both engines at once. Category?', a: 'Catastrophic: it may cause a crash.' },
  };
  H['st4-do178b-hazardous'] = {
    asks: 'Name the category for a large negative impact on safety or performance, but no crash.',
    idea: DO178,
    steps: [DO178_TABLE],
    answer: 'Hazardous.',
    mistake: 'Picking major. Major is significant but not hazardous (discomfort, more crew workload).',
    tryIt: { q: 'A failure shows the pilots a wrong altitude reading, seriously reducing safety margins, though the crew can still land. Category?', a: 'Hazardous: a large negative impact on safety, short of a crash.' },
  };
  H['st4-do178b-major'] = {
    asks: 'Name the category for passenger discomfort or higher crew workload, not hazardous.',
    idea: DO178,
    steps: [DO178_TABLE],
    answer: 'Major.',
    mistake: 'Picking minor. Minor is only noticeable with little impact; major means real discomfort or extra crew work.',
    tryIt: { q: 'An automatic system fails, so the crew must do its job by hand for the rest of the flight; safety is not at risk. Category?', a: 'Major: higher crew workload, but not hazardous.' },
  };
  H['st4-do178b-minor'] = {
    asks: 'Name the category for a noticeable failure with little impact, like a routine flight-plan change.',
    idea: DO178,
    steps: [DO178_TABLE],
    answer: 'Minor.',
    mistake: 'Picking no effect. A minor failure IS noticeable; no effect means no impact on safety, operation or crew workload at all.',
    tryIt: { q: 'A failure causes no impact on safety, operation or crew workload. Category?', a: 'No effect.' },
  };

  // ---- Structural testing and coverage ----
  H['st4-structural'] = {
    asks: 'State the structural testing principle and how it is measured.',
    idea: COVER,
    steps: COVER_STEPS,
    answer: '"If you have not sufficiently executed your code, how can you accept that it has been properly tested?" It is measured with code coverage.',
    mistake: 'Calling structural testing black-box. It is white-box: tests are based on knowledge of the code.',
    tryIt: { q: 'A function has an `else` branch that no test reaches. What does the structural principle say about it?', a: 'It has not been executed, so it cannot be accepted as tested; a test must reach it.' },
  };
  H['st4-mcdc-name-mc'] = {
    asks: 'Expand the coverage criterion name MC/DC.',
    idea: COVER,
    steps: COVER_STEPS,
    answer: 'Modified condition/decision coverage.',
    mistake: 'Picking "multiple condition coverage". That is a different criterion that tries every combination of conditions (exponential); MC/DC is "modified".',
    tryIt: { q: 'What is the stronger variant of MC/DC listed in the course?', a: 'Observable MC/DC (OMC/DC).' },
  };
  H['st4-coverage-challenges'] = {
    asks: 'Which coverage challenge does polymorphism in large OO programs cause?',
    idea: COVER,
    steps: COVER_STEPS,
    answer: 'Interprocedural coverage: with polymorphism, it is hard to know which code a call reaches.',
    mistake: 'Answering late binding. Late binding is functions created at run time; polymorphism belongs to interprocedural coverage.',
    tryIt: { q: '`shape.area()` is called on a list holding circles, squares and triangles. Why is covering this call hard?', a: 'Polymorphism: the call can reach three different `area` methods, so covering the call once does not cover all the code it can run.' },
  };
  H['st4-regression'] = {
    asks: 'Define regression testing.',
    idea: COVER,
    steps: COVER_STEPS,
    answer: 'Running the same test suite against the new (changed) version of a program.',
    mistake: 'Saying it means writing new tests. Regression testing reruns the existing suite on the changed program, to catch what the change broke.',
    tryIt: { q: 'After a regression run passes, why might the new version still be poorly tested?', a: 'The old tests were written for the old program; new or changed code may not be covered by them.' },
  };
  H['st4-late-binding-mc'] = {
    asks: 'Which coverage challenge is about functions created at run time?',
    idea: COVER,
    steps: COVER_STEPS,
    answer: 'Late binding.',
    mistake: 'Picking polymorphism. Both are run-time effects, but late binding is specifically functions created at run time.',
    tryIt: { q: 'A Python program builds functions with `lambda` from a config file when it starts. Which coverage challenge?', a: 'Late binding: the functions do not exist until run time.' },
  };
  H['st4-infeasibility'] = {
    asks: 'Explain the infeasibility problem, the usual workaround, and its downside.',
    idea: COVER,
    steps: COVER_STEPS,
    answer: 'Reaching 100% coverage is often impossible, so adequacy scores are used instead (e.g. 95% statement coverage). Downside: testers are lazy and test the easy things that cover many statements first, so the hard remaining parts may stay untested.',
    mistake: 'Stopping at "100% is impossible". A full answer has all three parts: impossible, adequacy score, and the easy-first downside.',
    tryIt: { q: 'A team sets an 80% branch-coverage target. Which branches are most likely to be in the untested 20%?', a: 'The hard ones: error handling and rare paths, which is where nasty bugs often hide.' },
  };
  H['st4-adequacy-apply'] = {
    asks: 'A suite hits its 95% coverage target. Explain how it could still miss a bug like the Zune leap-year hang.',
    idea: COVER,
    steps: [
      'Coverage says a statement ran. It does not say a test used the input that breaks it, or checked the output.',
      'The easy 95% may skip the rare path entirely: the leap-year branch on the last day of the year.',
      'Even if every statement ran, the bug needs one boundary value: day 366 of a leap year (`days == 366`), where the Zune loop never ends.',
      'Research agrees: coverage is not strongly correlated with test suite effectiveness (Inozemtseva & Holmes).',
    ],
    answer: 'Coverage only says code was executed, not that the right inputs or outputs were checked. The easy 95% may skip the rare path, and even if every statement runs, no test may use the boundary value (days == 366 in a leap year) that triggers the fault.',
    mistake: 'Assuming 100% coverage would have found it. Every line can run without the one input value that triggers the hang.',
    tryIt: { q: '`if (age >= 18) adult(); else child();` is fully covered by tests with age 30 and age 5. What bug could still slip through?', a: 'Writing `>` instead of `>=`: both tests still pass. Only the boundary value age 18 tells them apart.' },
  };

  // ---- Mutation testing ----
  H['st4-mutation-question'] = {
    asks: 'What question is mutation testing designed to answer?',
    idea: MUT,
    steps: MUT_STEPS,
    answer: 'Your test cases all pass: how good is the suite, i.e. how likely are the tests to reveal faults?',
    mistake: 'Saying it finds bugs in the program. It measures the test suite, not the program.',
    tryIt: { q: 'Your suite has 100% statement coverage but kills only 40% of mutants. What does that say?', a: 'The suite runs everything but checks little: most planted bugs go unnoticed, so it is weak.' },
  };
  H['st4-mutation-process'] = {
    asks: 'Put the four steps of mutation testing in order.',
    idea: MUT,
    steps: MUT_STEPS,
    answer: 'Mutate the original to create many mutants; run the same test data on the original and each mutant; compare outputs (does some test fail?); count killed mutants and compute the mutation score.',
    mistake: 'Computing the score before running the tests on the mutants. You can only count kills after running.',
    tryIt: { q: 'Which step decides whether a mutant is killed?', a: 'Comparing: a mutant is killed when at least one test fails on it.' },
  };
  H['st4-kill-mutant'] = {
    asks: 'Say when a mutant counts as killed.',
    idea: MUT,
    steps: MUT_STEPS,
    answer: 'When at least one test case fails on the mutant: the suite caught the difference between the two versions.',
    mistake: 'Thinking all tests must fail. One failing test is enough.',
    tryIt: { q: 'A mutant passes 49 of 50 tests and fails 1. Killed or survived?', a: 'Killed: one failing test is enough.' },
  };
  H['st4-mutant-examples'] = {
    asks: 'Write the four arithmetic-operator mutants of `delta = newGuess + sqrt;`.',
    idea: MUT,
    steps: MUT_STEPS.concat([{ text: 'Replace `+` by each other arithmetic operator:', code: 'delta = newGuess - sqrt;\ndelta = newGuess * sqrt;\ndelta = newGuess % sqrt;\ndelta = newGuess / sqrt;' }]),
    answer: '`delta = newGuess - sqrt;`, `delta = newGuess * sqrt;`, `delta = newGuess % sqrt;`, `delta = newGuess / sqrt;`.',
    mistake: 'Listing `delta = sqrt + newGuess;`. That swaps operands, not the operator; it is the trivial (equivalent) mutant.',
    tryIt: { q: 'Give the four arithmetic-operator mutants of `total = price * qty;`.', a: '`price + qty`, `price - qty`, `price / qty`, `price % qty`.' },
  };
  H['st4-stillborn-mc'] = {
    asks: 'Name the mutant `sqrt = newGuess +`, which does not compile.',
    idea: MUT,
    steps: MUT_STEPS,
    answer: 'A stillborn mutant: "born dead", rejected by the compiler with no test needed.',
    mistake: 'Calling it killed. Killed means a test failed on it; a stillborn mutant never runs at all.',
    tryIt: { q: 'Mutating `if (x > 0)` into `if (x > )`. What kind of mutant?', a: 'Stillborn: it does not compile.' },
  };
  H['st4-trivial-mc'] = {
    asks: 'Name the mutant `delta = sqrt + newGuess;` made from `delta = newGuess + sqrt;`.',
    idea: MUT,
    steps: MUT_STEPS,
    answer: 'A trivial mutant: addition is commutative, so it behaves exactly like the original.',
    mistake: 'Calling it stillborn. It compiles fine; it is just useless, because no test can tell it apart.',
    tryIt: { q: 'Mutating `area = w * h;` into `area = h * w;`. What kind of mutant?', a: 'Trivial: multiplication is commutative, so it is equivalent to the original.' },
  };
  H['st4-equivalent-spot'] = {
    asks: 'The mutant changes `a > b` to `a >= b` in a max computation. Can any test kill it?',
    idea: MUT,
    steps: [
      'The two versions can only differ when the conditions disagree, which happens only when `a == b`.',
      { text: 'Check each case:', table: { head: ['case', 'original (a > b)', 'mutant (a >= b)', 'same result?'], rows: [['a > b', 'returns a', 'returns a', 'yes'], ['a < b', 'returns b', 'returns b', 'yes'], ['a == b', 'returns b', 'returns a', 'yes, a and b are equal']] } },
      'No input gives different outputs, so no test can kill it: it is an equivalent mutant, removed (E) from the mutation score.',
    ],
    answer: 'No: when a == b both versions return the same value, so the mutant is equivalent.',
    mistake: 'Choosing a = b = 1 because "the branches differ". Different branches are taken, but both return 1, and a test only sees the output.',
    tryIt: { q: 'In `abs(x) = (x > 0) ? x : -x`, the mutant uses `x >= 0`. Equivalent?', a: 'Yes: they differ only at x = 0, where x and -x are both 0.' },
  };
  H['st4-ms-formula'] = {
    asks: 'Write MS(P, T) and define every symbol.',
    idea: MUT,
    steps: MUT_STEPS,
    answer: 'MS(P, T) = K / (M − E): K = killed mutants, M = generated mutants, E = equivalent mutants; P is the program, T the test suite.',
    mistake: 'Writing K / M. Equivalent mutants must come out of the denominator, because no test can ever kill them.',
    tryIt: { q: 'What is the best possible mutation score, and when is it reached?', a: '1 (100%): every non-equivalent mutant is killed, K = M − E.' },
  };
  H['st4-ms-why-e'] = {
    asks: 'Explain why E (equivalent mutants) is subtracted in K / (M − E).',
    idea: MUT,
    steps: MUT_STEPS,
    answer: 'Equivalent mutants behave exactly like the original program, so no test can ever kill them; counting them would unfairly lower the score. Only killable mutants belong in the denominator.',
    mistake: 'Saying they are subtracted because they do not compile. Those are stillborn; equivalent mutants compile and run, they just behave identically.',
    tryIt: { q: '10 mutants, 2 equivalent, 8 killed. What is MS with and without subtracting E?', a: 'With E: 8 / (10 − 2) = 1.0, a perfect suite. Without: 8 / 10 = 0.8, which wrongly blames the suite.' },
  };
  H['st4-ms-calc'] = {
    asks: 'M = 120 generated, E = 20 equivalent, K = 80 killed. Compute the mutation score.',
    idea: MUT,
    steps: [
      'MS = K / (M − E).',
      { text: 'Plug in:', table: { head: ['symbol', 'meaning', 'value'], rows: [['M', 'generated', '120'], ['E', 'equivalent', '20'], ['M − E', 'killable', '100'], ['K', 'killed', '80'], ['MS', 'K / (M − E)', '80 / 100 = 0.8']] } },
    ],
    answer: '0.8, since 80 / (120 − 20) = 80 / 100.',
    mistake: 'Computing 80 / 120 ≈ 0.67 by forgetting to remove the equivalent mutants.',
    tryIt: { q: 'M = 50, E = 10, K = 30. Mutation score?', a: '30 / (50 − 10) = 30 / 40 = 0.75.' },
  };
  H['st4-research'] = {
    asks: 'What did Inozemtseva & Holmes find about coverage and test suite effectiveness?',
    idea: DOUBT,
    steps: [
      'People use coverage and mutation scores, and intuitively they make sense.',
      'Coverage: Inozemtseva & Holmes found coverage is not strongly correlated with test suite effectiveness.',
      'Mutation: research (ICSE 2018) says it is unclear whether mutation scores are correlated with real fault detection.',
      'So treat both as useful signals, not proof that a suite is good.',
    ],
    answer: 'Coverage is not strongly correlated with test suite effectiveness.',
    mistake: 'Saying "coverage is useless". The finding is a weak correlation, not none; coverage still shows what never ran.',
    tryIt: { q: 'What does the ICSE 2018 research cited in the course say about mutation scores?', a: 'It is unclear whether mutation scores are correlated with real fault detection.' },
  };

  // ---- Lecture 5: failure in practice ----
  H['st5-pokemon-lesson'] = {
    asks: 'Explain why switching off mid-save corrupts the Pokémon Red party, and name the kind of test that would catch it.',
    idea: 'An operation that passes through a half-finished state is only safe if nothing can stop it halfway. Planning for failure means asking "what if the power goes out right here?" and testing exactly that.',
    steps: [
      'Saving first clears the save memory to 0xFF bytes, then three functions write parts of the save. The party data is written last, by the third function.',
      'Between the clear and the last write, the save is half-written: the party area still holds 0xFF.',
      'Cut the power there and the game later reads a party count of 0xFF = 255 Pokémon. The menu then reads neighbouring memory as Pokémon, which players exploit to overwrite memory and even run their own code.',
      'The save is not atomic. A failure test that interrupts the operation (the "pull the plug" kind from planning for failure) at each step would expose the bad state.',
    ],
    answer: 'The save is not atomic: it passes through a half-written state. Interrupted before the last step, the party data is left as 0xFF (a party count of 255). A test that interrupts the operation (the "pull the plug" kind of failure test) would catch it.',
    mistake: 'Blaming the player for switching off. Power loss is expected in a physical device; planning for failure says the software must survive it.',
    tryIt: { q: 'A program updates a config file by deleting it and then writing the new version. What failure test would reveal its weakness?', a: 'Kill the process (or cut power) between the delete and the write: the config file is gone. A safe version writes a new file first, then swaps it in.' },
  };
  H['st5-failure-timeline'] = {
    asks: 'Order the phases of the failure timeline, starting with the system working.',
    idea: AVAIL,
    steps: [
      { text: 'The timeline, phase by phase:', table: { head: ['phase', 'name'], rows: [['correct behaviour until the first failure', 'MTTF (time to failure)'], ['diagnose what went wrong', 'MTTD'], ['repair, from begin repair to end repair', 'MTTR'], ['correct behaviour again', 'MTTF'], ['second failure', 'end of the cycle']] } },
      'On the diagram, MTBF runs from the first failure to the second, so it covers MTTD + MTTR + MTTF.',
      'That is why textbooks write availability as MTTF / (MTTF + MTTR). For the exam, the lecture formula is MTBF / (MTBF + MTTR), reading MTBF as up time.',
    ],
    answer: 'Correct behaviour (MTTF) until the first failure; diagnose (MTTD); repair (MTTR); correct behaviour again (MTTF); second failure.',
    mistake: 'Putting repair before diagnosis. You must find what failed before you can fix it.',
    tryIt: { q: 'On the timeline, which phases does MTBF span?', a: 'From the first failure to the second: diagnose (MTTD) + repair (MTTR) + correct behaviour (MTTF).' },
  };
  H['st5-criticality-drives'] = {
    asks: 'How should testing differ between flight-control software and a hobby blog, and why?',
    idea: FAILPLAN,
    steps: FAILPLAN_STEPS.concat(['Testing effort is finite: spend it where a failure would cost the most.']),
    answer: 'Criticality of failure drives the testing process: the rigour of testing should match how severe a failure would be. Flight control (catastrophic failure possible) needs far more rigorous testing, including failure tests, than a blog whose failure has little effect.',
    mistake: 'Saying "test both thoroughly". The principle is proportion: rigour scales with the cost of failure.',
    tryIt: { q: 'Rank for testing rigour: a bank\'s transfer service, a music playlist app, a pacemaker\'s firmware.', a: 'Pacemaker (failure can kill), then the bank transfer (money and integrity), then the playlist app (little effect).' },
  };
  H['st5-avail-rel-scenario'] = {
    asks: 'Compare a chat server (20 crashes a day, 50 ms each) and a payment service (one 3-hour outage a month) on availability and reliability.',
    idea: MEASURES,
    steps: [
      'Availability = readiness: what fraction of time is it up? Reliability = continuity: how long does it run before the next failure?',
      { text: 'Work out the down time:', table: { head: ['', 'chat server', 'payment service'], rows: [['failures', '20 per day', '1 per month'], ['down time', '20 × 50 ms = 1 s per day', '3 h per month (about 720 h)'], ['availability', '1 − 1/86,400 ≈ 0.99999', '720 / 723 ≈ 0.996'], ['time between failures', 'about 72 minutes', 'about a month']] } },
      'The chat server is up more of the time (more available) but fails far more often (less reliable).',
    ],
    answer: 'The chat server is more available but less reliable.',
    mistake: 'Treating availability and reliability as one thing. Frequent short outages hurt reliability much more than availability.',
    tryIt: { q: 'System A fails once a year for 2 days. System B fails every hour for 1 second. Which is more reliable, and which more available?', a: 'A is more reliable (fails once a year). B is more available: about 24 s down per day (≈ 0.9997), against A\'s 2 days a year (363/365 ≈ 0.995).' },
  };

  // ---- Lecture 6: where are the bugs? ----
  const JANET = 'Software lives in the physical world. A song is just sound, but sound is vibration, and a hard drive is a spinning mechanical part. Nobody thought of audio as an input to the disk, so nobody tested it: an "unexpected physical/environmental condition".';
  const JANET_STEPS = [
    'Microsoft got complaints (Windows XP era) that playing Janet Jackson\'s "Rhythm Nation" video crashed some laptops, even a laptop sitting nearby.',
    'The song contained one of the natural resonant frequencies of a model of 5400 rpm laptop hard drive. The vibration made the drive fail and the machine crash.',
    'The manufacturer added a custom filter in the audio pipeline that detected and removed the offending frequencies: a software fix for a hardware problem. (It later got a CVE: CVE-2022-38392.)',
    'Lesson: one of the reasons programmers make mistakes is unexpected physical/environmental conditions.',
  ];
  const WHY = 'Bugs are not random bad luck; they come from predictable pressures on people. Knowing the causes, and that programmers tend to make similar mistakes, tells you where to look.';
  const WHY_STEPS = [
    { text: 'The seven reasons programmers make mistakes:', table: { head: ['group', 'reasons'], rows: [['complexity', 'complex existing code; complex infrastructure; complex system interactions'], ['requirements', 'misunderstanding of requirements; incorrect requirements'], ['other', 'time pressure; unexpected physical/environmental conditions']] } },
    'On average there are 15–50 bugs per 1,000 source lines of code (SLOC).',
    'Programmers tend to make similar mistakes, so error-prone aspects of code can be listed and checked.',
  ];
  const PRONE = 'Programmers make the same kinds of mistakes again and again, in the same kinds of code. Seven kinds of code are known trouble spots; when you test, aim at them first.';
  const PRONE_STEPS = [
    { text: 'The seven error-prone aspects:', table: { head: ['aspect', 'what goes wrong'], rows: [
      ['Floating-point numbers', 'inherently imprecise: invalid comparisons; sequences of computations lose precision'],
      ['Pointers (C/C++)', 'pointing at the wrong memory corrupts data; aliasing makes code hard to understand and change'],
      ['Parallelism', 'subtle timing errors from unforeseen interaction; deadlock when synchronization is used wrongly'],
      ['Numeric limits / boundaries', 'very large integer/float values overflow; boundary values of relational expressions'],
      ['Interrupts', 'can stop a critical operation partway; comparable to goto'],
      ['Complex Boolean expressions', 'nested Boolean operators are hard to understand'],
      ['Casts and conversions', 'especially numeric types: can lose precision or overflow']] } },
    'Memory hook for the three number ones: float, limits, casts. The other four are about memory and control: pointers, parallelism, interrupts, Booleans.',
  ];
  const HOWTEST = 'Three principles make testing possible at all. Divide it up so each piece is small (divisibility). Make sure you can see what happened inside (visibility). Make sure the same test gives the same verdict every time (repeatability).';
  const HOWTEST_STEPS = [
    { text: 'Divisibility, "you can\'t test everything at once", divides testing three ways:', table: { head: ['divide by', 'examples'], rows: [['scope', 'unit, integration, system testing'], ['purpose', 'business logic, memory, performance testing'], ['technique', 'different techniques are good at finding different bugs']] } },
    'Visibility: you need to understand what happens in the system: observability and state exposure. Sometimes you expose private data so a test can tell whether it passed or failed; logging helps. Both must be built into the program.',
    'Repeatability: a test should always pass or always fail as long as the program does not change. Tests that sometimes fail are flakey tests.',
    'Fixes for flakey tests: fix the random seed, force sequential execution (with a lot of trade-offs), use approximation. Sometimes nothing can be done.',
  ];
  const DEFECT = 'A bug report is a small project with a life cycle, so that nothing is lost between the person who found the bug and the person who fixes it: Analyse, Report, Track, Retest, Close.';
  const DEFECT_STEPS = [
    { text: 'The defect life cycle:', table: { head: ['step', 'what happens'], rows: [
      ['Analyse', 'find the root cause; reproducible or repeatable? isolate it; is it worth reporting?'],
      ['Report', 'not a duplicate (searchable issue tracker); talk with the developer; enter it; make sure it gets fixed'],
      ['Track', 'who is responsible for fixing it, etc.'],
      ['Retest', 'after the fix: fixed, remains, or replaced by a new problem'],
      ['Close', 'close the report']] } },
    'Root cause questions: is the test inaccurate? Did the tester/user make a mistake? Is there a problem with the product?',
    'Reproducible: you know the exact steps and can trigger it on demand. Repeatable: it happens repeatedly, but not on demand. The first thing to do is try to reproduce it.',
    'Not all defects are created equal: report the ones that matter in the context.',
  ];

  H['st6-janet-story'] = {
    asks: 'Explain how a music video could crash a laptop, even one sitting nearby.',
    idea: JANET,
    steps: JANET_STEPS,
    answer: 'The song contained a natural resonant frequency of a model of laptop hard drive, so the vibration made the drive fail and the machine crash.',
    mistake: 'Blaming a software bug in the video player. The cause was physical: sound making the disk resonate.',
    tryIt: { q: 'Why did a laptop that was NOT playing the video also crash?', a: 'Sound travels through the air: the nearby laptop\'s drive of the same model resonated with the music too.' },
  };
  H['st6-why-mistakes-complex'] = {
    asks: 'Name the three kinds of complexity that cause programmer mistakes.',
    idea: WHY,
    steps: WHY_STEPS,
    answer: 'Complex existing code, complex infrastructure, and complex system interactions.',
    mistake: 'Listing "complex requirements". Requirements appear as their own reasons (misunderstood, incorrect), not as complexity.',
    tryIt: { q: 'A bug appears only when the payment service and the email service both retry at once. Which complexity is this?', a: 'Complex system interactions.' },
  };
  H['st6-why-mistakes-other'] = {
    asks: 'Besides complexity, name the four reasons programmers make mistakes.',
    idea: WHY,
    steps: WHY_STEPS,
    answer: 'Time pressure; misunderstanding of requirements; incorrect requirements; unexpected physical/environmental conditions.',
    mistake: 'Merging the two requirement reasons. Misunderstanding a correct requirement and following an incorrect one are different causes.',
    tryIt: { q: 'The spec said "round to the nearest dollar" but the client meant "round down", and the code follows the spec. Which reason?', a: 'Incorrect requirements: the code matches the spec, but the spec is wrong.' },
  };
  H['st6-mistake-physical-mc'] = {
    asks: 'A song makes a nearby hard drive resonate and crash the laptop. Which reason for mistakes is this?',
    idea: JANET,
    steps: JANET_STEPS,
    answer: 'Unexpected physical conditions.',
    mistake: 'Picking complex system interactions. Nothing in the software interacted wrongly; the physical world did something nobody expected.',
    tryIt: { q: 'A sensor\'s software fails only in extreme cold, because the hardware reads wrong values below −40°C. Which reason?', a: 'Unexpected physical/environmental conditions.' },
  };
  H['st6-bug-density'] = {
    asks: 'How many bugs per 1,000 source lines of code, on average?',
    idea: WHY,
    steps: WHY_STEPS,
    answer: '15–50 bugs per 1,000 SLOC.',
    mistake: 'Guessing 1–5 because it sounds reasonable. The course figure is 15–50: bugs are common.',
    tryIt: { q: 'Using the course average, how many bugs would you expect in a 20,000-line program?', a: '20 × 15 = 300 to 20 × 50 = 1,000 bugs.' },
  };
  H['st6-error-prone-numeric'] = {
    asks: 'Name the three error-prone aspects about numbers.',
    idea: PRONE,
    steps: PRONE_STEPS,
    answer: 'Floating-point numbers; numeric limits / boundaries; casts and conversions between types.',
    mistake: 'Listing "integer division". It is not on the course list; stick to float, limits/boundaries, casts.',
    tryIt: { q: 'Which of the three does `(int) 3.99` (which gives 3) illustrate?', a: 'Casts and conversions: the cast loses precision.' },
  };
  H['st6-error-prone-control'] = {
    asks: 'Name the four error-prone aspects about memory, concurrency and control flow.',
    idea: PRONE,
    steps: PRONE_STEPS,
    answer: 'Pointers (C/C++); parallelism; interrupts; complex Boolean expressions.',
    mistake: 'Adding recursion or loops. The course list of seven has exactly these four non-numeric ones.',
    tryIt: { q: 'Which aspect is `if (!(a && (b || !c)) && d)`?', a: 'Complex Boolean expressions: nested operators are hard to understand.' },
  };
  H['st6-float-output'] = {
    asks: 'Predict what Python prints for `print(0.1 + 0.1 + 0.1 == 0.3)`.',
    idea: PRONE,
    steps: [
      '0.1 has no exact binary representation, so each 0.1 is stored as a value very slightly off.',
      { text: 'The tiny errors add up:', code: '>>> 0.1 + 0.1 + 0.1\n0.30000000000000004\n>>> 0.1 + 0.1 + 0.1 == 0.3\nFalse' },
      'Exact `==` on floats is an invalid comparison; compare within a tolerance instead.',
    ],
    answer: 'False: the sum is 0.30000000000000004, not 0.3.',
    mistake: 'Answering True because the math is right on paper. Floating-point numbers are inherently imprecise.',
    tryIt: { q: 'What does `print(abs(0.1 + 0.2 - 0.3) < 1e-9)` print?', a: 'True: 0.1 + 0.2 is 0.30000000000000004, within 1e-9 of 0.3.' },
  };
  H['st6-float-why'] = {
    asks: 'Why are floating-point numbers error-prone, and how should a test compare them?',
    idea: PRONE,
    steps: [
      'Floats are inherently imprecise: values like 0.1 are stored approximately.',
      'So comparisons can be invalid (`0.1 + 0.1 + 0.1 == 0.3` is False), and sequences of computations can lose precision.',
      { text: 'A test should accept any value close enough, using a tolerance:', code: 'assertEquals(0.3, total, 1e-9);   // JUnit: expected, actual, delta' },
    ],
    answer: 'They are inherently imprecise, so the imprecision can make comparisons invalid, and sequences of computations can lose precision. Tests should compare with a tolerance (an approximation), not exact equality.',
    mistake: 'Saying "use double instead of float". More bits shrink the error but do not remove it; you still need a tolerance.',
    tryIt: { q: 'A Python test needs to check `average(xs)` is 0.3. Write the check.', a: '`assert abs(average(xs) - 0.3) < 1e-9` (or `math.isclose(average(xs), 0.3)`).' },
  };
  H['st6-float-assert'] = {
    asks: 'Write a JUnit assertion that `average(scores)` is 0.3, robust to floating-point rounding.',
    idea: PRONE,
    steps: [
      'Exact `assertEquals(0.3, x)` fails when x is 0.30000000000000004.',
      { text: 'JUnit has a three-argument form for doubles: expected, actual, delta.', code: 'assertEquals(0.3, average(scores), 1e-9);' },
      'Delta is the largest difference still counted as equal. Expected value goes first, actual second.',
    ],
    answer: '`assertEquals(0.3, average(scores), 1e-9);`: expected first, actual second, and a delta, the largest difference still counted as equal.',
    mistake: 'Swapping expected and actual. It still passes or fails the same, but the failure message then reports them the wrong way round.',
    tryIt: { q: 'Write the JUnit assertion that `area(r)` equals 78.54 to within 0.01.', a: '`assertEquals(78.54, area(r), 0.01);`' },
  };
  H['st6-dangling'] = {
    asks: 'Find the bug in the C++ function that prints `*ptr` after `delete ptr`.',
    idea: PRONE,
    steps: [
      '`new int(42)` allocates memory and `ptr` points to it; the first print is fine.',
      '`delete ptr` frees that memory, but `ptr` still holds the old address: a dangling pointer.',
      'The second print dereferences freed memory: undefined behaviour. It may print 42, print garbage or crash, and may differ from run to run, which makes it hard to catch with tests.',
      'Fix: do not use the pointer after `delete` (and set it to `nullptr`).',
    ],
    answer: 'After `delete ptr`, `ptr` is a dangling pointer: it still holds the address of freed memory. Dereferencing it in the second print is undefined behaviour.',
    mistake: 'Saying "it crashes". It might, or it might print 42 and look fine; that unpredictability is exactly why it is dangerous.',
    tryIt: { q: 'What is wrong here?', code: 'int* make() {\n    int x = 7;\n    return &x;\n}', a: 'It returns the address of a local variable that no longer exists after `make` returns: the caller gets a dangling pointer.' },
  };
  H['st6-pointers'] = {
    asks: 'What happens when a C/C++ pointer refers to the wrong memory area?',
    idea: PRONE,
    steps: [
      'Pointers referring to the wrong memory areas can corrupt data: a write lands on someone else\'s variable.',
      'Aliasing (several pointers to the same memory) makes programs difficult to understand and change: changing data through one name silently changes it for the others.',
      'The Pokémon Red glitch is the same family: code reading and writing memory it should not touch.',
    ],
    answer: 'It can corrupt data.',
    mistake: 'Saying "the compiler catches it". C/C++ do not check where a pointer points; that is why pointers are error-prone.',
    tryIt: { q: 'After `int* p = &x; int* q = &x; *q = 5;`, why might a reader of the code be surprised by `x`?', a: 'Aliasing: `p` and `q` both point to `x`, so writing through `q` changed `x` with no mention of `x` or `p`.' },
  };
  H['st6-deadlock'] = {
    asks: 'Say what can go wrong in the two-lock Python program, and why it passes on some runs.',
    idea: PRONE,
    steps: [
      'Thread 1 takes `lock1` then wants `lock2`. Thread 2 takes `lock2` then wants `lock1`.',
      { text: 'One bad interleaving:', table: { head: ['time', 'thread 1', 'thread 2'], rows: [['1', 'takes lock1', ''], ['2', '', 'takes lock2'], ['3', 'waits for lock2', ''], ['4', '', 'waits for lock1'], ['5', 'waits forever', 'waits forever']] } },
      'That is deadlock: neither can proceed, so the final message never prints.',
      'If thread 1 finishes both locks before thread 2 starts, everything works. The result depends on timing, so some runs pass: a flakey test.',
      'Fix: make both threads take the locks in the same order.',
    ],
    answer: 'Deadlock: thread 1 can hold lock1 and wait for lock2 while thread 2 holds lock2 and waits for lock1, so neither proceeds and the final message never prints. It depends on timing, so some runs finish fine.',
    mistake: 'Calling it a crash or an exception. Nothing fails loudly; the program just hangs.',
    tryIt: { q: 'Change the program so it can never deadlock.', a: 'Make `thread2_routine` take `lock1` first and then `lock2`, the same order as thread 1. A thread holding lock2 then always already holds lock1, so no cycle of waiting can form.' },
  };
  H['st6-parallelism'] = {
    asks: 'Which bug does parallelism cause when synchronization is used incorrectly?',
    idea: PRONE,
    steps: [
      'Parallelism causes two kinds of bugs.',
      'Subtle timing errors, from unforeseen interaction between parallel processes.',
      'Deadlock, if synchronization (such as locks) is used incorrectly: each thread waits for a lock the other holds.',
      'Both depend on timing, which also makes tests flakey.',
    ],
    answer: 'Deadlock.',
    mistake: 'Answering "timing errors". Those come from unforeseen interaction; incorrect synchronization gives deadlock.',
    tryIt: { q: 'Two threads each add 1 to a shared counter 1,000 times without a lock, and the total is sometimes less than 2,000. Which of the two parallelism bugs?', a: 'A subtle timing error from unforeseen interaction (a race): no locks are used, so it is not deadlock.' },
  };
  H['st6-overflow-output'] = {
    asks: 'Predict what Java prints for `Integer.MAX_VALUE + 1`.',
    idea: PRONE,
    steps: [
      'A Java `int` is 32-bit signed: from −2,147,483,648 to 2,147,483,647.',
      'Adding 1 to the maximum overflows. Java throws no error; the value wraps around to the minimum.',
      { text: 'Result:', code: 'int result = Integer.MAX_VALUE + 1;\nSystem.out.println(result);   // -2147483648' },
    ],
    answer: '-2147483648: integer overflow wraps around to `Integer.MIN_VALUE`.',
    mistake: 'Expecting 2147483648 or an exception. Java `int` arithmetic silently wraps.',
    tryIt: { q: 'What does Java print for `Integer.MIN_VALUE - 1`?', a: '2147483647: it wraps the other way, to `Integer.MAX_VALUE`.' },
  };
  H['st6-limits'] = {
    asks: 'For the numeric-limits aspect, which integer and float values do you test?',
    idea: PRONE,
    steps: [
      'Numeric limits: try very large values for integers and floats, where overflow happens (e.g. `Integer.MAX_VALUE + 1` wraps to a negative number).',
      'Boundaries: try the boundary values of relational expressions, the exact point where a condition like `x < 10` flips (9 and 10).',
      'This is the motivation for boundary value testing.',
    ],
    answer: 'Very large values, where overflow happens.',
    mistake: 'Testing only typical values like 5 or 100. Bugs hide at the extremes and the edges.',
    tryIt: { q: 'Which values test the boundary of `if (score >= 50)`?', a: '49 and 50: the exact place where the condition flips.' },
  };
  H['st6-interrupts'] = {
    asks: 'Which error-prone aspect can stop a critical operation partway and is compared to goto?',
    idea: PRONE,
    steps: PRONE_STEPS.concat(['An interrupt jumps control flow somewhere else at any moment, like a `goto`, which makes the program hard to understand and can leave a critical operation half-done.']),
    answer: 'Interrupts.',
    mistake: 'Picking parallelism. Both are about timing, but only interrupts are compared to goto and cut an operation off partway.',
    tryIt: { q: 'A device writes a 4-byte value one byte at a time, and a hardware signal handler runs between byte 2 and byte 3 and reads it. Which aspect?', a: 'Interrupts: the handler interrupts a critical operation and sees a half-written value.' },
  };
  H['st6-bool-cast'] = {
    asks: 'Why are complex Boolean expressions error-prone?',
    idea: PRONE,
    steps: [
      'Complex Boolean expressions: nested Boolean operators are difficult to understand, so it is easy to get one wrong (a missing `!`, `&&` for `||`).',
      'Casts and conversions between types, especially numeric types, can lose precision or overflow.',
      { text: 'Two casts in Java:', code: '(int) 3.99      // 3      (precision lost)\n(byte) 200      // -56    (overflow: byte holds -128..127)' },
    ],
    answer: 'Nested Boolean operators are difficult to understand.',
    mistake: 'Saying "they are slow". The problem is human: people misread nested logic.',
    tryIt: { q: 'What does Java give for `(short) 40000`, and why?', a: '-25536: a `short` holds only -32,768 to 32,767, so the cast overflows.' },
  };
  H['st6-hashmap'] = {
    asks: 'Find four error-prone aspects in the `java.util.HashMap` excerpt, and say where each appears.',
    idea: PRONE,
    steps: [
      { text: 'Go through the code line by line:', table: { head: ['aspect', 'where'], rows: [
        ['Floating-point arithmetic', '`((float)s / loadFactor) + 1.0F` can be imprecise'],
        ['Casts and conversions', '`(float)s`, `(float)MAXIMUM_CAPACITY`, `(int)ft` can lose precision'],
        ['Numeric limits', 'capping `t` at `MAXIMUM_CAPACITY`'],
        ['Boundary values', '`s > 0`, `ft < MAXIMUM_CAPACITY`, `t > threshold`, `s > threshold`']] } },
      'Even a few lines of standard-library code touch several error-prone aspects, so tests should aim right at them, e.g. s = 0 and 1, and `ft` just below and at `MAXIMUM_CAPACITY`.',
    ],
    answer: 'Floating-point arithmetic (`s / loadFactor + 1.0F`) can be imprecise; casts between int and float (`(float)s`, `(float)MAXIMUM_CAPACITY`, `(int)ft`) can lose precision; numeric limits (the `MAXIMUM_CAPACITY` cap); boundary values in the relational expressions `s > 0`, `ft < MAXIMUM_CAPACITY`, `t > threshold`, `s > threshold`.',
    mistake: 'Naming only "floats". Look for every cast, every limit constant and every comparison too.',
    tryIt: { q: 'Which error-prone aspects appear in `int pct = (int)(done / (double)total * 100); if (pct >= 100) finish();`?', a: 'Casts (`(double)total`, `(int)(...)`), floating-point arithmetic (the division), and a boundary value (`pct >= 100`, test 99 and 100).' },
  };
  H['st6-80-20'] = {
    asks: 'State the 80-20 rule for module testing.',
    idea: 'Bugs cluster. They are not spread evenly over the code, so your testing effort should not be spread evenly either.',
    steps: [
      'A small number of modules usually contain most of the defects found during pre-release testing.',
      'Rule of thumb: 20% of the modules contain 80% of the bugs.',
      'So find that 20% (where defects have already appeared, code heavy in error-prone aspects) and test it hardest.',
    ],
    answer: 'A small number of modules usually contain most of the defects found during pre-release testing; as a rule of thumb, 20% of the modules contain 80% of the bugs.',
    mistake: 'Swapping the numbers ("80% of modules hold 20% of the bugs" said as the rule). The rule is about the FEW modules: 20% of modules hold 80% of the bugs.',
    tryIt: { q: 'A system has 50 modules and 400 known pre-release bugs. By the rule of thumb, how are they spread?', a: 'About 10 modules (20% of 50) hold about 320 bugs (80% of 400).' },
  };
  H['st6-80-20-apply'] = {
    asks: 'With time to extra-test only a few modules, explain how you choose them.',
    idea: 'Bugs cluster. They are not spread evenly over the code, so your testing effort should not be spread evenly either.',
    steps: [
      'The 80-20 rule: about 20% of modules contain 80% of the bugs.',
      'Where defects have already been found is a strong sign you are in that 20%.',
      'Also look for code heavy in the error-prone aspects: floating point, pointers, parallelism, numeric limits/boundaries, interrupts, complex Booleans, casts.',
    ],
    answer: 'Bugs cluster (80-20 rule), so focus on the modules where defects have already been found and on code heavy in error-prone aspects (floating point, pointers, parallelism, boundaries, interrupts, complex Booleans, casts).',
    mistake: 'Spreading the extra time evenly, or picking the biggest modules. Size is not the signal; bug history and error-prone code are.',
    tryIt: { q: 'Module A: 12 bugs found so far, lots of thread code. Module B: 1 bug, simple string formatting. Which gets the extra testing?', a: 'A: bugs cluster where they were already found, and parallelism is an error-prone aspect.' },
  };

  // ---- Lecture 6: how to test ----
  H['st6-three-principles'] = {
    asks: 'Name the three "how to test" principles.',
    idea: HOWTEST,
    steps: HOWTEST_STEPS,
    answer: 'Divisibility (divide and conquer), visibility (observe what happens inside), repeatability (same result every run).',
    mistake: 'Listing "isolation" or "coverage". The three are divisibility, visibility, repeatability.',
    tryIt: { q: 'A test sometimes fails for no reason. Which principle does it break?', a: 'Repeatability: it is a flakey test.' },
  };
  H['st6-divisibility'] = {
    asks: 'Name the three ways divisibility divides testing.',
    idea: HOWTEST,
    steps: HOWTEST_STEPS,
    answer: 'By scope (unit, integration, system), by purpose (business logic, memory, performance), and by technique.',
    mistake: 'Listing only the scope levels. Scope is one of three ways; purpose and technique are the others.',
    tryIt: { q: 'A team runs one suite for correctness of discounts and another for response time under load. Which way of dividing is that?', a: 'By purpose: business-logic testing vs performance testing.' },
  };
  H['st6-scope-order'] = {
    asks: 'Order the testing scopes from smallest to largest.',
    idea: HOWTEST,
    steps: HOWTEST_STEPS,
    answer: 'Unit testing, integration testing, system testing.',
    mistake: 'Putting system before integration. Integration tests a few units working together; system tests the whole thing.',
    tryIt: { q: 'A test checks that the login page, the user database and the email service work together for a full sign-up. Which scope?', a: 'System testing, if it exercises the whole application end to end; testing just two of the parts together would be integration.' },
  };
  H['st6-divide-purpose'] = {
    asks: 'Business-logic, memory and performance testing divide testing by what?',
    idea: HOWTEST,
    steps: HOWTEST_STEPS,
    answer: 'Purpose of testing.',
    mistake: 'Picking scope. Scope is unit/integration/system (how much code); these are about what you are checking for.',
    tryIt: { q: 'Running both a fuzzing tool and hand-written unit tests on the same parser divides testing by what?', a: 'By technique: different techniques are good at finding different bugs.' },
  };
  H['st6-visibility'] = {
    asks: 'What does the visibility principle require?',
    idea: HOWTEST,
    steps: HOWTEST_STEPS,
    answer: 'That you can understand what happens in the system: observability and state exposure.',
    mistake: 'Thinking visibility is about readable code. It is about being able to see the system\'s behaviour and state while testing.',
    tryIt: { q: 'A method updates a private cache and returns nothing. How can a test see whether it worked?', a: 'Expose the state (e.g. a getter for the cache size, needed to know pass or fail), or log what happened; both must be built into the program.' },
  };
  H['st6-logging-mc'] = {
    asks: 'Adding logging and exposing private state supports which principle?',
    idea: HOWTEST,
    steps: HOWTEST_STEPS,
    answer: 'Visibility (observability + state exposure).',
    mistake: 'Picking repeatability. Logs help you see what happened, which is visibility; they do not make results consistent.',
    tryIt: { q: 'Fixing a random seed so a test gives the same result every run supports which principle?', a: 'Repeatability.' },
  };
  H['st6-repeatability-def'] = {
    asks: 'What does repeatability demand of a test?',
    idea: HOWTEST,
    steps: HOWTEST_STEPS,
    answer: 'It should always pass or always fail as long as the program does not change.',
    mistake: 'Saying "it should always pass". A test that always fails on a buggy program is repeatable; the rule is about consistency.',
    tryIt: { q: 'A test passes on Monday and fails on Tuesday; nobody changed the code. What is it called?', a: 'A flakey test: it violates repeatability.' },
  };
  H['st6-flaky-fixes'] = {
    asks: 'Name the course\'s three fixes for flakey tests.',
    idea: HOWTEST,
    steps: HOWTEST_STEPS,
    answer: 'Fix the random seed; force sequential execution (with a lot of trade-offs); use approximation.',
    mistake: 'Adding "rerun until it passes". That hides flakiness instead of fixing it.',
    tryIt: { q: 'A test compares a double to 2.5 and fails on a different machine with 2.4999999999999996. Which fix?', a: 'Use approximation: compare within a tolerance.' },
  };
  H['st6-flakey-term'] = {
    asks: 'Name a test that sometimes passes and sometimes fails on unchanged code.',
    idea: HOWTEST,
    steps: HOWTEST_STEPS,
    answer: 'A flakey test.',
    mistake: 'Calling it a "failing test". A failing test fails every time; a flakey one changes its verdict.',
    tryIt: { q: 'Which principle does a flakey test violate?', a: 'Repeatability.' },
  };
  H['st6-fix-sequential'] = {
    asks: 'Two threads race on shared data and make a test flakey. Which fix applies?',
    idea: HOWTEST,
    steps: HOWTEST_STEPS.concat(['Forcing sequential execution makes the interleaving the same every run, but the test no longer runs the code the way production does, is slower, and may hide real concurrency bugs.']),
    answer: 'Force sequential execution, so the interleaving is always the same.',
    mistake: 'Picking "fix the seed". The randomness here is the thread timing, not a random number generator.',
    tryIt: { q: 'What does forcing sequential execution cost?', a: 'The test no longer runs the code as production does (and is slower), so it may hide real concurrency bugs.' },
  };

  // ---- Lecture 6: bug reports ----
  H['st6-process-order'] = {
    asks: 'Order the steps of the defect report life cycle.',
    idea: DEFECT,
    steps: DEFECT_STEPS.concat(['Memory hook: "A Real Tester Retests, then Closes."']),
    answer: 'Analyse, Report, Track, Retest, Close.',
    mistake: 'Putting Retest before Track. You track who is fixing it; you retest only after the fix.',
    tryIt: { q: 'A developer says "fixed". Which step comes next?', a: 'Retest: check whether the bug is still there, then Close.' },
  };
  H['st6-track-retest'] = {
    asks: 'What does the Track step record?',
    idea: DEFECT,
    steps: DEFECT_STEPS,
    answer: 'Who is responsible for fixing the defect.',
    mistake: 'Confusing it with Report. Report enters the defect; Track follows who owns it until it is fixed.',
    tryIt: { q: 'Name the three possible outcomes of Retest.', a: 'The problem has been fixed; the problem remains; the problem is replaced by a new problem.' },
  };
  H['st6-who-finds'] = {
    asks: 'Name the three questions that help find a new defect\'s root cause.',
    idea: DEFECT,
    steps: DEFECT_STEPS,
    answer: 'Is the test inaccurate? Did the tester/user make a mistake? Is there a problem with the product?',
    mistake: 'Assuming every reported bug is in the product. The test or the person may be the problem.',
    tryIt: { q: 'A test fails because its expected value was copied wrong from the spec. Which root-cause question catches this?', a: '"Is the test inaccurate?"' },
  };
  H['st6-repro-vs-repeat'] = {
    asks: 'What makes a defect reproducible?',
    idea: DEFECT,
    steps: DEFECT_STEPS,
    answer: 'We know the exact steps and can make it happen on demand.',
    mistake: 'Mixing it up with repeatable. Repeatable means it keeps happening, but you cannot trigger it on demand.',
    tryIt: { q: 'Clicking "Save" twice quickly crashes the app every time. Reproducible, repeatable, or both?', a: 'Both: it happens repeatedly, and you know the exact steps to trigger it on demand.' },
  };
  H['st6-repeatable-mc'] = {
    asks: 'The app crashes a few times a week; nobody knows how to trigger it. Classify the defect.',
    idea: DEFECT,
    steps: DEFECT_STEPS,
    answer: 'Repeatable but not reproducible.',
    mistake: 'Picking "reproducible". Reproducible needs known exact steps that trigger it on demand.',
    tryIt: { q: 'A tester finds that the crash happens whenever the device clock passes midnight during a sync. Now what is the defect?', a: 'Reproducible: there are now exact steps that trigger it on demand.' },
  };
  H['st6-first-thing'] = {
    asks: 'What is the first thing to do when analysing a reported defect?',
    idea: DEFECT,
    steps: DEFECT_STEPS,
    answer: 'Try to reproduce the defect.',
    mistake: 'Searching for duplicates first. That belongs to the Report step, after analysis.',
    tryIt: { q: 'Why does reproducing come before isolating the defect?', a: 'You cannot narrow down the cause of something you cannot make happen.' },
  };
  H['st6-analyse-activities'] = {
    asks: 'Name the four activities of analysing a defect.',
    idea: DEFECT,
    steps: DEFECT_STEPS,
    answer: 'Find the root cause; determine whether it is reproducible or repeatable; attempt to isolate the defect; decide whether it is worth reporting.',
    mistake: 'Including "check for duplicates". That is the first part of the Report step.',
    tryIt: { q: 'Of the four analysis activities, which one decides whether a report is filed at all?', a: 'Deciding whether it is worth reporting.' },
  };
  H['st6-pdf-worth'] = {
    asks: 'Of two PDF rendering differences, which is worth reporting?',
    idea: DEFECT,
    steps: DEFECT_STEPS.concat(['The same PDF should look the same in every reader. Chrome vs Adobe: slightly different greens, the map still reads fine. Firefox: most regions solid black, the map is unreadable.']),
    answer: 'The Firefox rendering (map unreadable); the slight shade difference may not be.',
    mistake: 'Reporting every difference. Not all defects are created equal; report those that matter in the context.',
    tryIt: { q: 'A web page\'s font is 1 pixel larger in one browser; in another, the "Pay" button is hidden. Which is worth reporting?', a: 'The hidden "Pay" button: users cannot complete the main task. The 1-pixel difference probably is not.' },
  };
  H['st6-reporting-steps'] = {
    asks: 'What does the "report the defect" step involve?',
    idea: DEFECT,
    steps: DEFECT_STEPS,
    answer: 'Ensure it is not a duplicate (which needs a searchable defect reporting system, i.e. an issue tracker), talk with the developer, enter it into the system, and make sure it gets fixed.',
    mistake: 'Stopping at "enter it into the system". The step continues until it gets fixed.',
    tryIt: { q: 'Why does avoiding duplicates require a searchable issue tracker?', a: 'You can only check whether a defect is already reported if the existing reports can be searched.' },
  };
  H['st6-duplicate-scenario'] = {
    asks: 'You have analysed and reproduced a crash. What do you do first when filing it?',
    idea: DEFECT,
    steps: DEFECT_STEPS,
    answer: 'Search the tracker for duplicates.',
    mistake: 'Retesting now. Retest only comes after a fix.',
    tryIt: { q: 'You find an existing report of the same crash. What do you do instead of filing a new one?', a: 'Add your new information (steps, environment) to the existing report.' },
  };

  // ---- Flakey-test practice ----
  H['stx-fl-playlist'] = {
    asks: 'A shuffle test with `new Random()` fails about 1 run in 24. Find the cause and the fix.',
    idea: HOWTEST,
    steps: [
      { text: 'Count the orders of 4 songs:', table: { head: ['songs', 'possible orders', 'chance the shuffle gives the original'], rows: [['4', '4! = 24', '1 / 24']] } },
      'Without a fixed seed, every run gets different random numbers, so in about 1 run of 24 the "shuffled" list equals the original and `assert order changed` fails.',
      'Fix the seed (`new Random(42)`) or inject the `Random`, so every run shuffles the same way, then assert the exact expected order.',
    ],
    answer: 'The shuffle is random with no fixed seed, and 1 of the 4! = 24 orders is the original, so sometimes nothing changes. Fix the seed (`new Random(42)`) or inject the `Random`, and assert the exact expected order.',
    mistake: 'Rerunning the test until it passes. That hides the flakiness; the fix is to remove the randomness.',
    tryIt: { q: 'Same test with a 5-song playlist. How often does it fail?', a: '1 run in 5! = 120.' },
  };
  H['stx-fl-float-jvm'] = {
    asks: 'An exact `assertEquals(0.3, total)` passes on one JVM and fails on another. Pick the fix.',
    idea: HOWTEST,
    steps: [
      'The value is 0.30000000000000004: floating-point rounding, which can differ with the environment (a change of Java version is one cause of flakiness).',
      'The course fix that matches: use approximation.',
      { text: 'Assert within a tolerance:', code: 'assertEquals(0.3, total, 1e-9);' },
    ],
    answer: 'Assert within a tolerance (delta): `assertEquals(0.3, total, 1e-9)`.',
    mistake: 'Fixing the seed. There is no random number here; the problem is exact equality on floating point.',
    tryIt: { q: 'A test that waits for a web page sometimes fails because the page is slow. Is "use approximation" the right fix?', a: 'No: that is a timing problem, not a floating-point one. Approximation fixes float comparisons.' },
  };
})(globalThis.FC = globalThis.FC || {});
