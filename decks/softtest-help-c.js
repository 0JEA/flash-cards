// "Help" walkthroughs for CSC 325 (Software Testing), batch c: Lecture 7 (bug reports,
// flakey tests) and Lecture 8 (test doubles and Mockito), plus the matching practice cards.
// Format: see decks/csc370-help.js. Math is OFF: plain text, `backticks` for code words.
(function (FC) {
  'use strict';
  const H = FC.help = FC.help || {};

  // ---------- shared pieces ----------
  const REPORT_IDEA = 'A defect report is a message to a stranger who must find it, read it, reproduce the bug and fix it, often weeks later. The seven characteristics of an effective report all serve that stranger. Four are about FORM, how it is written: numbered, simple, written, understandable. Three are about CONTENT, what it must say: complete, explains the problem, and the minimum number of steps to reproduce.';
  const REPORT_TABLE = { text: 'The seven characteristics, and what each one buys the reader:', table: { head: ['characteristic', 'group', 'why it matters'], rows: [
    ['Numbered', 'form', 'it has an ID, so people can refer to it, assign it, retest it and close it'],
    ['Simple', 'form', 'one defect, said concisely; lots of stakeholders read it'],
    ['Written', 'form', 'a hallway remark is lost; a written report is searchable and lasts'],
    ['Understandable', 'form', 'someone who was not there can follow it'],
    ['Complete', 'content', 'version, environment, inputs: nothing the developer must guess'],
    ['Explains the problem', 'content', 'what happened versus what should have happened'],
    ['Minimum steps to reproduce', 'content', 'only the steps that matter, so the cause stands out'],
  ] } };

  const SEC_IDEA = 'A security bug is different from an ordinary one: the report itself is dangerous, because it is a recipe for an attack. So it is never posted publicly, and it carries five items. Three say WHAT and WHERE (type of issue, product and version, any special configuration needed to reproduce) and two say HOW DANGEROUS (proof-of-concept or exploit code, and the impact, including how an attacker could exploit it). The vendor then gets 45 to 90 days to fix it before full public disclosure, unless the vulnerability is already actively exploited.';
  const SEC_TABLE = { text: 'The five items of a security report:', table: { head: ['item', 'tells the vendor'], rows: [
    ['Type of issue (buffer overflow, SQL injection, cross-site scripting, ...)', 'what is wrong'],
    ['Product and version that contain the bug', 'where it is'],
    ['Any special configuration required to reproduce it', 'how to see it'],
    ['Proof-of-concept or exploit code', 'that it is real and exploitable'],
    ['Impact, including how an attacker could exploit it', 'how bad it is'],
  ] } };

  const LIFE_IDEA = 'Every defect follows one lifecycle: Analyse, Report, Track, Retest, Close. Retesting after a fix has three possible outcomes: the problem has been fixed, the problem remains, or the problem is replaced by a new problem. Only the first one lets you close the report.';

  const TRACK_IDEA = 'A bug tracking system (Jira, GitHub Issues, Bugzilla, Redmine, Mantis) is the shared memory of the defect lifecycle. It must be searchable so you can check a new report is not a duplicate before filing it, and it records who is responsible for fixing each defect, so nothing falls between people.';

  const FLAKY_IDEA = 'A flakey test passes sometimes and fails sometimes with no change to the code. That happens when the result depends on something the test does not control. The course groups those things into three causes: concurrency (multiple threads or multiple processes), timing, and changes in environment.';
  const FLAKY_TABLE = { text: 'What makes a test flakey:', table: { head: ['cause', 'examples'], rows: [
    ['Concurrency', 'multiple threads; multiple processes'],
    ['Timing', 'a fixed sleep or a time limit that is sometimes too short'],
    ['Change in environment (software)', 'Java environment/version, operating system, GUI framework'],
    ['Change in environment (machine and world)', 'a different machine, the date/time, RAM / processor / disk speed'],
  ] } };

  const DOUBLE_IDEA = 'A test double is a lightweight stand-in for a component the system under test (SUT) needs, like a stunt double in a movie. Doubles come in two families. Three PROVIDE TEST INPUTS: a dummy only fills a required slot, a stub feeds canned answers in, a fake is a small working implementation of something heavy (like a database). Two MONITOR TEST OUTPUTS: a mock checks the indirect results the SUT produces (which calls, how often, which parameters, what order), and a spy does the same on a REAL object whose real methods still run.';
  const DOUBLE_TABLE = { text: 'The five doubles side by side:', table: { head: ['double', 'family', 'what it does'], rows: [
    ['Dummy', 'input', 'fills an object the SUT requires but the test never uses'],
    ['Stub', 'input', 'returns preset ("dummy") input data'],
    ['Fake', 'input', 'a lightweight working implementation of a heavyweight process, e.g. a database'],
    ['Mock', 'output', 'checks the indirect results of the SUT: calls, order, parameters'],
    ['Spy', 'output', 'observes the interactions of a REAL object; real methods run'],
  ] } };
  const ROLE_STEP = 'In Mockito every double is made with `mock()` (or `spy()`), so the name of the method does not tell you the role. The role comes from how the test USES it: nothing at all = dummy; only `when(...).thenReturn(...)` = stub; `verify(...)` = mock; `spy(new Real())` = spy; a hand-written working class = fake.';

  const WHY_IDEA = 'There are six reasons to use a test double, in two groups of three. Three are about the REAL component being a problem: it is not yet finished, it is computationally expensive to construct, or it is owned by someone else. Three are about what the TEST gains: no side effects on real components, help preventing flakey tests, and finer-grained observation of the system under test.';
  const WHY_TABLE = { text: 'The six reasons:', table: { head: ['reason', 'group', 'example'], rows: [
    ['Real component not yet finished', 'real component', 'the database is not created yet'],
    ['Expensive to construct', 'real component', 'starting a full server for every test'],
    ['Owned by someone else', 'real component', 'a weather or payment API you do not control'],
    ['Avoid side effects', 'test gains', 'do not charge a real card or email a real customer'],
    ['Prevent flakey tests', 'test gains', 'a fixed answer instead of a live network value'],
    ['Finer-grained observation', 'test gains', 'see which calls the SUT made, not just what it returned'],
  ] } };

  const MOCKITO_IDEA = 'Mockito is a popular Java framework for creating test doubles, integrated with JUnit. Its goal is to mock away a unit\'s dependencies and inspect the interactions between the SUT and those mocks. Two moves cover most of it: `when(mock.m(args)).thenReturn(value)` makes a double PROVIDE input, and `verify(mock).m(args)` makes it CHECK output. An unstubbed mock does nothing and returns defaults: values "tend toward null or 0".';

  const VERIFY_IDEA = 'Testing is more than checking a function\'s output. A void function returns nothing, and many important effects are calls to other objects (send an email, write a log, charge a card). Mocks let you test those interactions: methods called in the proper order, methods called or not called, and the proper parameters passed. Mockito\'s tools: `verify(mock).m(...)` (called exactly once), `times(n)` (exactly n times), `never()` (not called), `inOrder(...)` (sequence), and argument matchers like `any()` (any value).';
  const VERIFY_TABLE = { text: 'The verification tools:', table: { head: ['you want to check', 'Mockito'], rows: [
    ['called exactly once with these arguments', 'verify(mock).m(args)'],
    ['called exactly n times', 'verify(mock, times(n)).m(args)'],
    ['never called', 'verify(mock, never()).m(args)'],
    ['called at least once', 'verify(mock, atLeastOnce()).m(args)'],
    ['called in this sequence', 'InOrder o = inOrder(a, b); o.verify(a)...; o.verify(b)...'],
    ['any argument is fine', 'any(), anyString(), anyInt()'],
  ] } };

  // ---------- Lecture 7: bug reports ----------
  H['st7-effective-form'] = {
    asks: 'Of the seven characteristics of an effective defect report, name the four that are about how the report is written (its form), not what it says.',
    idea: REPORT_IDEA,
    steps: [
      REPORT_TABLE,
      'Form is what you can judge without understanding the bug at all: does it have a number, is it short and clean, is it written down, can an outsider read it?',
      'Content is what it tells the developer: the whole story (complete), what is wrong (explains the problem), and the shortest path to see it (minimum steps).',
    ],
    answer: 'Numbered, simple, written, understandable.',
    mistake: 'Putting "complete" in the form group. Completeness is about what the report contains (version, environment, inputs), so it is content.',
    tryIt: { q: 'A tester mentions a bug to a developer at lunch and never puts it anywhere. Which form characteristics fail?', a: 'Written and numbered: it is not in the tracker, so it has no ID and nobody can search for it, assign it or retest it.' },
  };

  H['st7-effective-content'] = {
    asks: 'Of the seven characteristics of an effective defect report, name the three that are about what the report must contain.',
    idea: REPORT_IDEA,
    steps: [
      REPORT_TABLE,
      'Ask what the developer needs in order to act: all the facts (complete), what is wrong compared with what should happen (explains the problem), and a short recipe to see it (minimum steps to reproduce).',
      'The other four (numbered, simple, written, understandable) are about the shape of the report, not its facts.',
    ],
    answer: 'Complete; explains the problem; includes the minimum number of steps to reproduce.',
    mistake: 'Writing just "steps to reproduce". The characteristic is the MINIMUM number of steps: extra steps hide which ones matter.',
    tryIt: { q: 'A report says: "Crash when saving. See the attached 40-step screen recording." The crash is clear. Which content characteristic does it fail?', a: 'Minimum number of steps to reproduce: 40 steps, most of them probably irrelevant, hide what actually triggers the crash.' },
  };

  H['st7-missing-1'] = {
    asks: 'The whole report is "The app is broken sometimes, please fix ASAP!!". Check it against the effective-report characteristics and say which it fails.',
    idea: REPORT_IDEA,
    steps: [
      REPORT_TABLE,
      { text: 'Go down the content list first, since that is where it collapses:', table: { head: ['characteristic', 'met?', 'why'], rows: [
        ['Minimum steps to reproduce', 'no', 'no steps at all'],
        ['Explains the problem', 'no', '"broken" says nothing about what happened or what should happen'],
        ['Complete', 'no', 'no version, device, browser or inputs'],
        ['Understandable', 'no', 'only the writer knows what "broken" meant'],
      ] } },
      '"Sometimes" also hides whether the bug is repeatable (happens repeatedly but not on demand) or reproducible (exact steps, on demand). Saying which tells the developer how much isolation is still needed.',
    ],
    answer: 'It has no steps to reproduce, does not explain the problem (no expected versus actual), is not complete (no version or environment), and is not understandable to anyone who was not there.',
    mistake: 'Thinking urgency ("ASAP!!") helps. It adds no information, and the reader still cannot act.',
    tryIt: { q: 'A report reads in full: "Login page is slow." Which characteristics does it fail?', a: 'It does not explain the problem (how slow, and what was expected?), has no steps (which account, which network?), and is not complete (no version, browser or device).' },
  };

  H['st7-missing-2'] = {
    asks: 'The crash is explained clearly, but the report lists 25 steps and most of them have nothing to do with the crash. Which characteristic does it break?',
    idea: 'The first stage of the lifecycle is analysing the defect: reproduce it, then try to isolate it. Isolation is what turns "everything I did" into "the few things that cause it". A report should carry the minimum number of steps to reproduce, because extra steps waste the developer\'s time and hide the cause.',
    steps: [
      REPORT_TABLE,
      'To cut steps: remove one (or a block), retry. If the bug still appears, that step was not needed. Repeat until removing anything makes the bug disappear.',
      'The result is short and also points at the cause: whatever is left is what triggers the defect.',
    ],
    answer: 'Minimum steps to reproduce: 25 steps, mostly unrelated, should be cut down to only the ones that trigger the crash.',
    mistake: 'Choosing "explains the problem". The problem IS explained clearly here; the steps are the issue.',
    tryIt: { q: 'A report has 10 steps. You find the crash still happens when you skip steps 1 to 7 and only do 8, 9 and 10, but not when you also skip step 8. What should the steps section say?', a: 'Steps 8, 9 and 10 only: they are the minimum needed to reproduce, and step 8 is clearly part of the trigger.' },
  };

  H['st7-security-where'] = {
    asks: 'A security report has five items. Name the three that say what is wrong and where it is.',
    idea: SEC_IDEA,
    steps: [
      SEC_TABLE,
      'Read the first three as "what, where, how to see it": the type of issue, the product and version, and any special configuration needed to reproduce it.',
      'The last two (proof-of-concept code and impact) are the "how dangerous" pair.',
    ],
    answer: 'The type of issue (buffer overflow, SQL injection, cross-site scripting, ...); the product and version that contain the bug; any special configuration needed to reproduce it.',
    mistake: 'Listing "steps to reproduce" as its own item. In the security list, reproduction is covered by the special configuration, and the proof-of-concept code demonstrates it.',
    tryIt: { q: 'Which of the five items is this line: "Only happens when the server runs with debug mode turned on"?', a: 'Any special configuration required to reproduce the issue.' },
  };

  H['st7-security-danger'] = {
    asks: 'A security report has five items. Name the two that show how dangerous the bug is.',
    idea: SEC_IDEA,
    steps: [
      SEC_TABLE,
      'Proof-of-concept or exploit code shows the bug is real and exploitable, not just theoretical.',
      'The impact says what an attacker gains and how they could exploit it, which is what decides how urgently the vendor must act.',
      'Because both make the report a ready-made attack, the report is sent privately, never in public.',
    ],
    answer: 'Proof-of-concept or exploit code, and the impact (including how an attacker could exploit it).',
    mistake: 'Naming the type of issue. "SQL injection" says what kind of bug it is, not how bad this one is.',
    tryIt: { q: 'Which item is this line: "Any logged-in user can download every other user\'s tax documents"?', a: 'The impact of the issue.' },
  };

  H['st7-disclosure'] = {
    asks: 'After you privately report a vulnerability, how long does the vendor normally get before full public disclosure?',
    idea: SEC_IDEA,
    steps: [
      'Report privately first, so attackers do not learn about the hole before a fix exists.',
      'Give the vendor a deadline: the standard is 45 to 90 days. That is long enough to build and ship a fix, short enough that it does not get ignored.',
      'Then disclose publicly so users know to update. The exception: if the vulnerability is already being actively exploited, users need to know sooner to protect themselves.',
    ],
    answer: '45 to 90 days.',
    mistake: 'Picking "immediately". Publishing at once hands attackers a working recipe before anyone can patch.',
    tryIt: { q: 'You report a vulnerability on March 1 and give the vendor the longest standard deadline. On what date may you publish?', a: '90 days after March 1, which is May 30.' },
  };

  H['st7-disclosure-exception'] = {
    asks: 'Normally you wait 45 to 90 days before going public with a vulnerability. In which situation do you not wait?',
    idea: SEC_IDEA,
    steps: [
      'The wait exists to protect users: it keeps attackers from learning about the hole before a fix exists.',
      'If attackers are already using it (an actively exploited vulnerability), the secret is out. Waiting only keeps users in the dark while they are being attacked.',
      'So the exception is about attackers, not about the vendor\'s reply, the bug type, or the reporter\'s code.',
    ],
    answer: 'When the vulnerability is already being actively exploited.',
    mistake: 'Choosing "the vendor has not replied". A silent vendor is what the deadline is for; it does not cancel the wait.',
    tryIt: { q: 'Ten days after your private report you see attack traffic using exactly your hole on many sites. Must you wait until day 45?', a: 'No: the vulnerability is now actively exploited, which is the exception, so users should be told now.' },
  };

  H['st7-retest-outcomes'] = {
    asks: 'After a developer says a defect is fixed, you retest. What three results can that retest have?',
    idea: LIFE_IDEA,
    steps: [
      'Lifecycle: Analyse, Report, Track, Retest, Close.',
      { text: 'Retest outcomes:', table: { head: ['outcome', 'what you do'], rows: [
        ['Problem has been fixed', 'close the report'],
        ['Problem remains', 'send it back; the report stays open'],
        ['Problem is replaced by a new problem', 'do not just close it: the fix introduced a new defect'],
      ] } },
      'Retest with the exact steps from the report, and also look near the fix, because the third outcome is easy to miss.',
    ],
    answer: 'The problem has been fixed; the problem remains; the problem is replaced by a new problem.',
    mistake: 'Forgetting the third outcome. A fix can remove the original symptom and create a different defect.',
    tryIt: { q: 'You rerun the report\'s steps 20 times after the fix; the bug never appears and nothing else changed. Which outcome, and what next?', a: 'Fixed: you can close the report.' },
  };

  H['st7-retest-mc'] = {
    asks: 'The crash is gone after the fix, but the same screen now shows the wrong total. Which of the three retest outcomes is it?',
    idea: LIFE_IDEA,
    steps: [
      'The original problem (the crash) no longer happens, so it is not "remains".',
      'But something that worked before (the total) is now wrong, so it is not cleanly "fixed" either.',
      'That is the third outcome: the problem is replaced by a new problem. The report should not simply be closed.',
    ],
    answer: 'Replaced by a new problem.',
    mistake: 'Choosing "fixed" because the reported symptom is gone. Retesting checks the area around the fix, not only the one symptom.',
    tryIt: { q: 'After a fix, the app still crashes with the same steps, just with a different error message. Which outcome?', a: 'Problem remains: the same defect still happens.' },
  };

  H['st7-tracker-why'] = {
    asks: 'Why does a bug tracker need a search function?',
    idea: TRACK_IDEA,
    steps: [
      'Step 2 of the lifecycle, Report, starts with: ensure it is not a duplicate. You can only do that if you can search what is already filed.',
      'Duplicates waste time twice: two people investigate the same defect, and the information is split across two reports.',
      'The tracker also records who is responsible for fixing each defect, so every report has an owner through Track, Retest and Close.',
    ],
    answer: 'So you can check that a new report is not a duplicate of one already filed.',
    mistake: 'Answering "so developers can find bugs to fix". Assignment is what the tracker records; searchability is specifically for catching duplicates.',
    tryIt: { q: 'Two testers each file "PDF export produces a blank page", a day apart. What should the second tester have done?', a: 'Searched the tracker first, found the existing report, and added any new details to it instead of filing a duplicate.' },
  };

  H['st7-linus'] = {
    asks: 'Linus Torvalds\' 2014 report about a gcc-4.9.0 code-generation bug is the course\'s example of how NOT to report. What was wrong with it?',
    idea: 'A bug report is communication with the people who will fix it, and many stakeholders read it. That is why reports should be simple, concise and factual, and follow the project\'s template. Insults add no facts and make the reader less willing to help.',
    steps: [
      'The report called the compiler "pure and utter *shit*" and insulted its developers.',
      'The real content, that the compiler spilled a constant to the stack, was buried under the abuse.',
      'Strip the anger and you have a good report: what the compiler generated, what it should have generated, the version, and a minimal example.',
    ],
    answer: 'It was abusive and profane instead of simple, concise and factual, and the real technical problem was buried under the insults.',
    mistake: 'Thinking the content was wrong. The bug was real; the way it was reported is the lesson.',
    tryIt: { q: 'Rewrite: "This idiotic validator rejects my perfectly valid email. Who wrote this garbage?"', a: 'Title: Signup rejects valid email with a plus sign. Steps: enter ana+news@x.com, press Sign up. Expected: account created. Actual: "Invalid email". Version 1.2.' },
  };

  H['st7-tap-why'] = {
    asks: 'Why do flakey tests cost Google\'s TAP testing system so much computing power?',
    idea: 'At small scale a flakey test is an annoyance. At Google\'s scale it is a measurable cost: every flakey failure has to be rerun to find out whether it was real, and it teaches developers to stop trusting red builds.',
    steps: [
      { text: 'The TAP numbers:', table: { head: ['fact', 'value'], rows: [
        ['test executions per day', '150 million'],
        ['share that fail', 'about 1%'],
        ['failures per day', '1.6 million on average'],
        ['of those, due to flakey tests', '73,000 (about 1 in 22)'],
        ['compute spent rerunning flakey tests (2017)', '2 to 16%'],
        ['tests that are flakey at some point before retirement', '16%'],
      ] } },
      'Reruns are the cost: you cannot tell a flakey failure from a real one without running again.',
      'The human cost: when failures are often noise, developers learn to ignore red builds, and then real failures get ignored too.',
    ],
    answer: 'A large number of the daily failures are flakey rather than real bugs (about 73K of 1.6M a day), and rerunning them used 2 to 16% of Google\'s compute in 2017.',
    mistake: 'Saying flakey tests are a large share of failures. 73K of 1.6M is under 5%; the point is that even that share costs a lot of compute at this scale.',
    tryIt: { q: 'Your team\'s CI shows about 50 red builds a week and 45 turn green when rerun. What habit is forming, and what is the danger?', a: 'People learn to ignore red builds (just rerun). The danger is that the 5 real failures get ignored along with the noise.' },
  };

  H['st7-flakey-causes-3'] = {
    asks: 'Name the three categories of causes that make a test flakey.',
    idea: FLAKY_IDEA,
    steps: [
      FLAKY_TABLE,
      'Concurrency: when threads or processes interleave differently on each run, the result can change.',
      'Timing: a test that waits a fixed time, or asserts a time limit, passes or fails depending on how fast things happened that run.',
      'Environment: anything outside the code that differs between runs or machines.',
    ],
    answer: 'Concurrency (multiple threads or processes), timing, and changes in environment.',
    mistake: 'Listing "bad code" or "random input". The course\'s three categories are concurrency, timing and environment.',
    tryIt: { q: 'A test starts a background job, sleeps 100 ms, then asserts the job has finished. It sometimes fails. Which category?', a: 'Timing: 100 ms is sometimes not long enough.' },
  };

  H['st7-flakey-env-sw'] = {
    asks: 'Changes in environment can make a test flakey. Name the three changes on the software side.',
    idea: FLAKY_IDEA,
    steps: [
      FLAKY_TABLE,
      'Software side: the Java environment (for example the Java version), the operating system, and the GUI framework.',
      'Each can change behaviour the test silently depended on, such as path separators on another OS or iteration order in a new Java version.',
    ],
    answer: 'A different Java environment/version, a different operating system, and a different GUI framework.',
    mistake: 'Including "a different machine". That is on the list too, but it is hardware/setup, not software.',
    tryIt: { q: 'A test passes on JDK 17 and fails on JDK 21 with no code change. Which environment change?', a: 'A change in Java environment (the Java version).' },
  };

  H['st7-flakey-env-hw'] = {
    asks: 'Apart from software (Java version, OS, GUI framework), name the three other environment changes that can make a test flakey.',
    idea: FLAKY_IDEA,
    steps: [
      FLAKY_TABLE,
      'Machine side: a different machine, the date/time the test runs, and RAM, processor or disk speed.',
      'The date/time is the sneaky one: a test can pass all year and fail on one day (a birthday, a month end, a leap day).',
    ],
    answer: 'A different machine, the date/time the test runs, and RAM / processor / disk speed.',
    mistake: 'Forgetting date/time. It is not hardware, but it is part of the environment the test runs in.',
    tryIt: { q: 'A test only fails when it runs on December 31. Which environment change?', a: 'A change in date/time.' },
  };

  // ---------- Lecture 8: Bug of the Day ----------
  H['st8-gandhi-underflow'] = {
    asks: 'Gandhi\'s aggressiveness is 1, stored as an unsigned 8-bit integer, and Democracy subtracts 2. What value is stored?',
    idea: 'An unsigned 8-bit integer can only hold 0 to 255. It cannot go negative, so arithmetic wraps around: going below 0 lands at the top of the range. That wrap is an integer underflow.',
    steps: [
      'Real result: 1 - 2 = -1, which is not representable.',
      'Unsigned arithmetic is done modulo 2^8 = 256, so -1 becomes -1 + 256 = 255.',
      { text: 'Counting down past zero:', table: { head: ['value', 'minus 1'], rows: [['2', '1'], ['1', '0'], ['0', '255']] } },
      { text: 'In C:', code: 'unsigned char aggressiveness = 1;\naggressiveness -= 2;\nprintf("%d\\n", aggressiveness);   // 255' },
    ],
    answer: '255: 1 - 2 = -1 wraps around to 2^8 - 1 = 255, the maximum aggressiveness.',
    mistake: 'Answering -1 or 0. Unsigned types neither go negative nor stop at zero; they wrap.',
    tryIt: { q: 'An unsigned 8-bit value holds 3 and you subtract 5. What is stored?', a: '3 - 5 = -2, and -2 + 256 = 254.' },
  };

  H['st8-gandhi-fake'] = {
    asks: 'The "Nuclear Gandhi" bug in Civilization (1991) is famous. Why is it a lesson about bug reports?',
    idea: 'The story: Gandhi starts at aggressiveness 1, Democracy subtracts 2, the unsigned value underflows to the maximum, and Gandhi goes nuclear. It is one of the most famous bugs in games, and it is fake. Aggressiveness was random or static; there was no underflow. A plausible story spread because people wanted to believe it.',
    steps: [
      'The mechanism sounds right, which is exactly why nobody checked it.',
      'The first job when analysing a defect is to try to reproduce it and find the root cause: is the report accurate, did the user make a mistake, or is the product wrong?',
      'Lesson: beware cognitive bias in bug reports. A convincing explanation is not evidence; reproduce before you believe.',
    ],
    answer: 'The underflow bug never existed (aggressiveness was random or static). People believed a plausible story, so beware cognitive bias: reproduce a bug before you trust a report of it.',
    mistake: 'Saying the lesson is about integer underflow. The underflow is the story; the lesson is that the story was false.',
    tryIt: { q: 'A user insists "the app deletes my files every Friday" and offers a clever theory about a weekly cron job. What do you do before filing?', a: 'Try to reproduce it and find the root cause (maybe the user, maybe another tool) instead of filing the theory as fact.' },
  };

  // ---------- Lecture 8: why test doubles ----------
  H['st8-wild'] = {
    asks: 'Why is it usually impossible to unit test code completely on its own, "in a vacuum"?',
    idea: 'Real units do not live alone: they talk to an ecosystem of a database, a file system, or a framework/API you do not own. Sometimes that ecosystem is unavailable (airplane software testers have no airplane; an airport system is not tested in a real airport), and sometimes it does not exist yet (the database has not been created). Test doubles provide the missing ecosystem.',
    steps: [
      'List what the unit touches: a database, files, outside services. Those are its ecosystem.',
      'A unit test should test the unit, but the unit cannot run without answers from that ecosystem.',
      'So you either bring the real ecosystem (slow, risky, maybe impossible) or provide a stand-in: a test double.',
    ],
    answer: 'Units interact with an ecosystem (a database, a file system, a framework or API you do not own), so a test must supply that ecosystem.',
    mistake: 'Answering "because units have bugs". The point is dependency on outside components, not code quality.',
    tryIt: { q: 'A unit computes shipping cost by calling a courier company\'s rate API. Why can\'t it be tested in a vacuum, and what helps?', a: 'It depends on an API you do not own, so the test must provide that ecosystem: a test double standing in for the rate API.' },
  };

  H['st8-double-def'] = {
    asks: 'Define a test double.',
    idea: 'A stunt double looks enough like the actor for the scene, without being the actor. A test double is the same: a lightweight version of a component that some class or system needs in order to be tested, good enough for the test and nothing more.',
    steps: [
      'Lightweight: it is cheaper, faster and safer than the real component.',
      'Necessary: the SUT cannot run without SOMETHING in that slot.',
      DOUBLE_TABLE,
    ],
    answer: 'A lightweight version of a component that is necessary to test some class or system, standing in for the real one like a stunt double in a movie.',
    mistake: 'Saying it is a copy of the class under test. The double replaces a DEPENDENCY, never the SUT itself.',
    tryIt: { q: 'Tests use a small in-memory list in place of the production database. Is that a test double, and which kind?', a: 'Yes: a lightweight stand-in for a needed component. It is a fake (a working lightweight implementation).' },
  };

  H['st8-why-doubles-a'] = {
    asks: 'Of the six reasons to use test doubles, name the three that are about the real component being a problem.',
    idea: WHY_IDEA,
    steps: [
      WHY_TABLE,
      'Ask: what is wrong with just using the real thing? It may not exist yet, it may be too costly to build for every test, or it may belong to someone else.',
    ],
    answer: 'The real component is not yet finished; it is computationally expensive to construct; it is owned by someone else.',
    mistake: 'Mixing in "avoid side effects". That is about protecting the real component from the test, one of the test-gains reasons.',
    tryIt: { q: 'The team building the tax service will deliver it in three months, and you must test invoicing now. Which reason?', a: 'The real component is not yet finished.' },
  };

  H['st8-why-doubles-b'] = {
    asks: 'Of the six reasons to use test doubles, name the three that are about what the test gains.',
    idea: WHY_IDEA,
    steps: [
      WHY_TABLE,
      'Ask: what does the test get that it could not get with the real thing? Safety (no side effects), repeatability (no flakiness), and visibility (finer-grained observation of the SUT).',
    ],
    answer: 'Avoid side effects on real components; help prevent flakey tests; allow finer-grained observation of the system under test.',
    mistake: 'Listing "faster tests". Speed comes from avoiding expensive construction, which is a real-component reason.',
    tryIt: { q: 'With a double you can check that the SUT called the logger with "retry 2". Which reason is that?', a: 'Finer-grained observation of the system under test.' },
  };

  H['st8-why-sideeffect'] = {
    asks: 'Checkout calls a payment service that charges a real credit card. What is the main reason to swap in a test double?',
    idea: WHY_IDEA,
    steps: [
      WHY_TABLE,
      'Running the test with the real service would charge a real card: an effect outside the test that you cannot undo.',
      'That is the "avoid side effects on real components" reason. The service is finished and cheap to call, so the other reasons do not fit.',
    ],
    answer: 'To avoid side effects on real components: running the test must not move real money.',
    mistake: 'Choosing "owned by someone else". That may also be true, but the danger the question points at is the real charge.',
    tryIt: { q: 'Testing the "forgot password" flow would send a real email to a real customer. Main reason for a double?', a: 'Avoid side effects on real components.' },
  };

  H['st8-why-flakey'] = {
    asks: 'Explain how a test double helps keep a test from being flakey.',
    idea: WHY_IDEA,
    steps: [
      'A test is flakey when its result depends on something it does not control: a network service, a live database, the clock, a slow disk.',
      'A double replaces that dependency with a controlled stand-in that gives the same answer every run.',
      'With nothing varying, the test always passes or always fails, so a failure means a real bug.',
    ],
    answer: 'It replaces dependencies whose behaviour varies between runs (network services, real databases, clocks, slow file systems) with controlled stand-ins that answer the same way every time, so the test always passes or always fails.',
    mistake: 'Saying doubles make the test faster. Speed may improve, but repeatability is what removes flakiness.',
    tryIt: { q: 'A test reads today\'s exchange rate from a live API and asserts a converted amount. How does a double fix it?', a: 'A stub returns a fixed rate, so the expected amount is the same on every run.' },
  };

  H['st8-sut'] = {
    asks: 'What do the letters SUT stand for in test-double terminology?',
    idea: 'Every test has one thing it is actually testing; everything else is support. The thing being tested is the system under test (SUT). Doubles replace the support, never the SUT.',
    steps: [
      'SUT = system under test: the class or system whose behaviour the test checks.',
      'Its collaborators (database, mailer, recipe objects) may be replaced by doubles.',
      'Finding the SUT first tells you which objects must be real and which can be doubles.',
    ],
    answer: 'System under test.',
    mistake: 'Writing "software under test". The course\'s term is system under test.',
    tryIt: { q: 'A test of OrderService uses a Mockito mock of PaymentGateway and asserts the order status. Which is the SUT?', a: 'OrderService; the PaymentGateway is a double.' },
  };

  // ---------- Lecture 8: the five doubles ----------
  H['st8-dummy-mc'] = {
    asks: 'Which double exists only to fill in an object the SUT requires but that does not matter for this test?',
    idea: DOUBLE_IDEA,
    steps: [
      DOUBLE_TABLE,
      'A dummy is passed in because a constructor or method signature demands something there. Nothing is read from it and nothing is checked on it.',
    ],
    answer: 'Dummy object.',
    mistake: 'Choosing stub. A stub is read from (it returns data); a dummy is never used at all.',
    tryIt: { q: 'A constructor needs a Logger, but the method you test never logs. You pass `mock(Logger.class)` and never stub or verify it. Which double?', a: 'A dummy object.' },
  };

  H['st8-stub-mc'] = {
    asks: 'Which double supplies preset input data that the SUT reads?',
    idea: DOUBLE_IDEA,
    steps: [
      DOUBLE_TABLE,
      'A stub answers the SUT\'s questions with canned values, e.g. `when(weather.getTemp()).thenReturn(35)`. It checks nothing.',
    ],
    answer: 'Test stub.',
    mistake: 'Choosing mock. A mock is about checking outputs; feeding inputs is a stub\'s job.',
    tryIt: { q: 'A replacement clock always says it is 2026-01-01 so date logic can be tested. Which double?', a: 'A test stub: it provides a fixed input.' },
  };

  H['st8-fake-mc'] = {
    asks: 'Which double is a lightweight implementation of a heavyweight process such as a database?',
    idea: DOUBLE_IDEA,
    steps: [
      DOUBLE_TABLE,
      'A fake really works: save something, then query it, and you get it back. It is just much cheaper than the real thing (for example an in-memory database).',
    ],
    answer: 'Fake object.',
    mistake: 'Choosing stub. A stub returns preset answers; a fake computes real answers from what was stored.',
    tryIt: { q: 'A test uses a HashMap-backed class in place of a key-value store server; put and get really work. Which double?', a: 'A fake object.' },
  };

  H['st8-mock-mc'] = {
    asks: 'Which double checks the indirect results the SUT produces?',
    idea: DOUBLE_IDEA,
    steps: [
      DOUBLE_TABLE,
      'Indirect results are effects that do not come back as a return value: calls the SUT makes on other objects. A mock records them so the test can check which methods were called, how often, and with what parameters.',
    ],
    answer: 'Mock object.',
    mistake: 'Choosing stub because both are made with `mock()` in Mockito. The kind of double is about its role, and checking results is a mock\'s role.',
    tryIt: { q: 'A test asserts that `notifier.send("order shipped")` was called once. Which double is the notifier?', a: 'A mock object: it checks an indirect result.' },
  };

  H['st8-inputs-outputs'] = {
    asks: 'Which two kinds of test double monitor test outputs?',
    idea: DOUBLE_IDEA,
    steps: [
      DOUBLE_TABLE,
      'Output family: mock (observes interactions of a fake object) and spy (observes interactions of a real object). The slide calls spy a near-synonym of mock.',
      'Input family: dummy, stub, fake.',
    ],
    answer: 'Mock and spy.',
    mistake: 'Including stub. A stub provides inputs; it never checks anything.',
    tryIt: { q: 'Sort into the two families: fake, spy, dummy, mock, stub.', a: 'Inputs: dummy, stub, fake. Outputs: mock, spy.' },
  };

  H['st8-stub-vs-mock'] = {
    asks: 'Compare a test stub with a mock object: what does each do for the test?',
    idea: DOUBLE_IDEA,
    steps: [
      DOUBLE_TABLE,
      'Stub = input side. It feeds the SUT canned data so the test can run: `when(prices.priceOf("ABC")).thenReturn(10.0)`.',
      'Mock = output side. It checks the indirect results of the SUT: which methods were called or not, how often, with what parameters, in what order: `verify(mailer).send("ana@x.com", "Welcome!")`.',
      ROLE_STEP,
    ],
    answer: 'A stub provides inputs: canned data fed to the SUT. A mock monitors outputs: it checks the indirect results and interactions of the SUT (methods called or not, order, parameters).',
    mistake: 'Saying the difference is the Mockito method used to create them. Both come from `mock()`; the difference is `when` versus `verify`.',
    tryIt: { q: 'A double has `when(repo.count()).thenReturn(3)` and later `verify(repo).save(order)`. Stub or mock?', a: 'A mock: it is also stubbed, but being verified is what makes it a mock.' },
  };

  H['st8-stub-vs-fake'] = {
    asks: 'What is the difference between a fake object and a test stub?',
    idea: DOUBLE_IDEA,
    steps: [
      DOUBLE_TABLE,
      'A stub only knows the answers you wrote into it. Ask it anything else and you get a default (null, 0, empty).',
      'A fake actually works: it is a lightweight implementation (for example an in-memory database), so if you save a record and then query it, you get it back, across many calls.',
    ],
    answer: 'A stub only returns preset answers; a fake is a working lightweight implementation (such as an in-memory database) that behaves realistically across many calls.',
    mistake: 'Saying a fake is "more fake". The fake is the one with real working logic.',
    tryIt: { q: 'You need a double where save(x) followed by findAll() returns x, for many different x. Stub or fake?', a: 'A fake: only a working implementation stays consistent across save-then-query calls.' },
  };

  H['st8-mock-vs-spy'] = {
    asks: 'Compare a mock object and a spy object.',
    idea: DOUBLE_IDEA,
    steps: [
      'Same job: both observe interactions (which methods were called, how often, with which parameters).',
      'A mock wraps nothing: its methods do nothing and return defaults unless stubbed. It observes interactions of a fake object.',
      'A spy wraps a REAL object: the real method is called, and the call is also recorded. You can still overwrite a spy\'s output, just as you would for a mock.',
      { text: 'In Mockito:', code: 'Cart cart = spy(new Cart());\ncart.add(item);           // real add() runs\nverify(cart).add(item);   // and the call was recorded' },
    ],
    answer: 'Both observe interactions. A mock observes interactions of a fake object (its methods do nothing and return defaults unless stubbed). A spy observes interactions of a real object: the real methods run, and you can still overwrite a spy\'s output like a mock\'s.',
    mistake: 'Saying a spy cannot be stubbed. You can overwrite a spy\'s output; the default is just that real code runs.',
    tryIt: { q: 'A test needs Cart.total() to really add up prices, but also wants to check clear() was called. Mock or spy, and why?', a: 'A spy: a mock\'s total() would return 0, while a spy runs the real total() and still records the clear() call.' },
  };

  H['st8-scn-stub'] = {
    asks: 'Your code shows a heat warning based on a remote weather API. Which double lets you test the 35 degree case without the network?',
    idea: DOUBLE_IDEA,
    steps: [
      'What does the test need from the weather API? Only an input: the temperature.',
      'A double that provides fixed input is a test stub. It also avoids a service you do not own and keeps the test repeatable.',
      { text: 'In Mockito:', code: 'Weather weather = mock(Weather.class);\nwhen(weather.getTemp()).thenReturn(35);' },
    ],
    answer: 'A test stub that returns 35 degrees.',
    mistake: 'Choosing a mock. Nothing about the weather API is being checked; it only supplies data.',
    tryIt: { q: 'Your app shows "Low battery" below 15%. Which double tests the 10% case, and what is the Mockito line?', a: 'A test stub: `when(battery.level()).thenReturn(10);`' },
  };

  // ---------- Lecture 8: Mockito and CoffeeMaker ----------
  H['st8-mockito'] = {
    asks: 'What is Mockito?',
    idea: MOCKITO_IDEA,
    steps: [
      'Mockito is a popular Java framework for creating test doubles. It integrates well with JUnit, and supports all the different kinds of doubles.',
      'Its goal: mock away a unit\'s dependencies, then inspect the interactions between the SUT and the mocks.',
      { text: 'The two core moves:', code: 'when(recipe1.getName()).thenReturn("Coffee");  // provide input\nverify(inventory).useIngredients(recipe);      // check output' },
    ],
    answer: 'A popular Java framework for creating test doubles, integrated with JUnit.',
    mistake: 'Calling it a test runner. JUnit runs the tests; Mockito creates the doubles used inside them.',
    tryIt: { q: 'What is Mockito\'s goal in a unit test, in one sentence?', a: 'To mock away a unit\'s dependencies and inspect the interactions between the SUT and the mocks.' },
  };

  H['st8-constructor'] = {
    asks: 'CoffeeMaker got a new constructor that takes a RecipeBook and an Inventory. Why does that matter for test doubles?',
    idea: 'A double can only replace a dependency if the test can hand it in. If a class builds its own RecipeBook inside, the test is stuck with the real one. If the RecipeBook is passed in, the test chooses what goes in: the real object or a double. Passing dependencies in is called dependency injection.',
    steps: [
      { text: 'The new constructor:', code: 'public CoffeeMaker(RecipeBook recipeBook, Inventory inventory) {\n    CoffeeMaker.recipeBook = recipeBook;\n    CoffeeMaker.inventory = inventory;\n}' },
      'Before, CoffeeMaker made its own dependencies, so tests always used the real ones.',
      'Now a test can write `new CoffeeMaker(mock(RecipeBook.class), new Inventory())`: a double for one, the real thing for the other.',
    ],
    answer: 'The dependencies are passed in rather than created inside CoffeeMaker, so a test can pass test doubles (such as a Mockito mock of RecipeBook) in place of the real objects.',
    mistake: 'Thinking it is about having two fields. What matters is WHO creates the objects: the caller, so the test can choose.',
    tryIt: { q: 'A class does `this.clock = new SystemClock();` inside its constructor. Why is that hard to test, and what change fixes it?', a: 'The test cannot replace the clock. Take the clock as a constructor parameter so the test can pass a stub.' },
  };

  H['st8-default-null'] = {
    asks: 'An unstubbed Mockito mock of RecipeBook: what does getRecipes(), which returns an array, give back?',
    idea: MOCKITO_IDEA,
    steps: [
      'An unstubbed mock method runs no real code; it returns a default value.',
      { text: 'Mockito\'s defaults ("values tend toward null or 0"):', table: { head: ['return type', 'default'], rows: [['int, long, double', '0'], ['boolean', 'false'], ['String, arrays, other objects', 'null'], ['List and other collections', 'empty collection'], ['Optional', 'Optional.empty()']] } },
      'An array is an object reference, so getRecipes() returns null, which is why the test can `assertNull(recipeBookStub.getRecipes())`.',
    ],
    answer: 'null.',
    mistake: 'Expecting an empty array. Mockito gives empty collections for List and similar types, but an array gets null.',
    tryIt: { q: 'Unstubbed mock: what does `user.getName()` (returns String) give?', a: 'null: a String is an object reference.' },
  };

  H['st8-default-zero'] = {
    asks: 'An unstubbed Mockito mock of Recipe: what does getPrice(), which returns an int, give back?',
    idea: MOCKITO_IDEA,
    steps: [
      'Unstubbed mock methods return defaults instead of running real code.',
      'Primitive numbers cannot be null, so an int gets 0. Object references get null.',
      'So the slide\'s check is `assertEquals(0, recipeStub.getPrice())`.',
    ],
    answer: '0.',
    mistake: 'Answering null. An int is a primitive and can never be null.',
    tryIt: { q: 'Unstubbed mock: what does `account.isLocked()` (returns boolean) give?', a: 'false, the default for a boolean.' },
  };

  H['st8-testmocking-role'] = {
    asks: 'In testMocking, the variable is named recipeBookStub. Which kind of double is it really playing?',
    idea: DOUBLE_IDEA,
    steps: [
      'Look at what the test does with it: it is created with `mock(...)`, never given a `when(...)`, never verified, and passed to the CoffeeMaker constructor.',
      'Nothing is read from it for the test\'s purpose and nothing is checked on it: it only fills the constructor parameter.',
      'That is a dummy. The slide\'s own comment says "Create a dummy object; note that Mockito uses \'mock\' for this role".',
      ROLE_STEP,
    ],
    answer: 'A dummy object: it has no functionality and only fills the constructor parameter.',
    mistake: 'Trusting the variable name. "Stub" in the name does not make it a stub; it never returns preset data.',
    tryIt: { q: '`new ReportService(mock(EmailClient.class)).countPages(doc)` — the email client is never stubbed or verified. Which double?', a: 'A dummy: it only satisfies the constructor.' },
  };

  H['st8-testaddrecipe-role'] = {
    asks: 'In testAddRecipe, recipe1 is created with `mock(Recipe.class)` and given `when(recipe1.getName()).thenReturn("Coffee")`. Which double is it?',
    idea: DOUBLE_IDEA,
    steps: [
      { text: 'The test:', code: 'RecipeBook recipeBook = new RecipeBook();\nrecipe1 = mock(Recipe.class);\nwhen(recipe1.getName()).thenReturn("Coffee");\nboolean added = recipeBook.addRecipe(recipe1);\nRecipe[] recipes = recipeBook.getRecipes();\nassertEquals("Coffee", recipes[0].getName());' },
      'recipe1 gets a preset answer ("Coffee") and is never verified, so it is a stub.',
      'The real RecipeBook is the SUT; recipe1 just supplies data so the test does not depend on the real Recipe class.',
    ],
    answer: 'A test stub: `when(...).thenReturn("Coffee")` makes it provide preset data, and nothing is verified on it.',
    mistake: 'Choosing mock because of `mock(Recipe.class)`. In Mockito the creation method is the same for every role.',
    tryIt: { q: 'Same test, but it ends with `verify(recipe1).getName();` instead of the assertEquals. Which double is recipe1 now?', a: 'A mock: it is verified, so it checks an interaction.' },
  };

  H['st8-testaddrecipe-what'] = {
    asks: 'In testAddRecipe (a mocked Recipe that answers "Coffee" is added to a real RecipeBook), what is the system under test, and what does the assertion check?',
    idea: 'To read any test, ask two questions: which object is real and being exercised (the SUT), and which objects are doubles supporting it? Then read the assertion as a claim about the SUT\'s behaviour.',
    steps: [
      { text: 'The test:', code: 'RecipeBook recipeBook = new RecipeBook();   // real\nrecipe1 = mock(Recipe.class);              // double\nwhen(recipe1.getName()).thenReturn("Coffee");\nboolean added = recipeBook.addRecipe(recipe1);\nRecipe[] recipes = recipeBook.getRecipes();\nassertEquals("Coffee", recipes[0].getName());' },
      'RecipeBook is created with `new`: real. Recipe is created with `mock`: a stub. So the SUT is the RecipeBook.',
      'The assertion checks that addRecipe put the recipe into the array: element 0 of getRecipes() answers "Coffee".',
      'Note that the returned boolean `added` is never asserted, so the test would not notice if addRecipe returned the wrong value.',
    ],
    answer: 'The real RecipeBook.',
    mistake: 'Saying the Recipe is the SUT because the assertion calls getName(). getName() is just the stub answering; the behaviour under test is RecipeBook storing it.',
    tryIt: { q: 'A test makes `Inventory inv = new Inventory();`, a stubbed `Recipe r = mock(Recipe.class)`, then asserts `inv.enoughIngredients(r)` is true. What is the SUT?', a: 'The real Inventory; the Recipe is a stub.' },
  };

  H['st8-when-then'] = {
    asks: 'Fill in the two Mockito words so that recipe1.getName() returns "Coffee".',
    idea: MOCKITO_IDEA,
    steps: [
      'Read it as a sentence: WHEN this method is called, THEN RETURN this value.',
      { text: 'The full line:', code: 'when(recipe1.getName()).thenReturn("Coffee");' },
      'Other endings exist: `thenThrow(...)` to make the call fail, and `thenReturn(a, b, c)` for different answers on successive calls.',
    ],
    answer: '`when`, `thenReturn`: `when(recipe1.getName()).thenReturn("Coffee");`',
    mistake: 'Writing `verify` in the first blank. `verify` checks a call afterwards; `when` sets up an answer beforehand.',
    tryIt: { q: 'Make `repo.findById(7)` throw a RuntimeException instead.', a: '`when(repo.findById(7)).thenThrow(new RuntimeException("DB down"));`' },
  };

  // ---------- Lecture 8: verifying interactions ----------
  H['st8-monitor-why'] = {
    asks: 'Why test a void function\'s interactions with mocks rather than its output?',
    idea: VERIFY_IDEA,
    steps: [
      'A void function returns nothing, so `assertEquals(expected, f())` is impossible.',
      'Its effects show up as calls to other objects. A mock records those calls, so you test the interactions instead.',
      'Mocks can check three kinds of interaction: methods called in the proper order, methods called or not called, and proper parameters passed.',
    ],
    answer: 'A void function has no output to check, so you test its interactions instead.',
    mistake: 'Thinking a void function cannot be tested. "Testing is more than checking function outputs."',
    tryIt: { q: '`void register(String email)` must send a welcome email through a Mailer. What do you check, and how?', a: 'The interaction: `verify(mailer).send(email, "Welcome!");` since there is no return value.' },
  };

  H['st8-verify-fns'] = {
    asks: 'In Mockito, what does `times(n)` check?',
    idea: VERIFY_IDEA,
    steps: [
      VERIFY_TABLE,
      '`times(n)` goes inside verify: `verify(audit, times(2)).log(anyString())` passes only if log was called exactly 2 times.',
      'Plain `verify(mock).m()` means `times(1)`: exactly once.',
    ],
    answer: 'That a method was called exactly n times.',
    mistake: 'Reading it as "at least n". For a lower bound use `atLeast(n)` or `atLeastOnce()`.',
    tryIt: { q: 'A method was called 3 times. Does `verify(m, times(2)).f()` pass?', a: 'No: times(2) means exactly 2, and there were 3 calls.' },
  };

  H['st8-never-mc'] = {
    asks: 'On makeCoffee\'s negative path (not enough money), you want to prove the inventory is never touched. What do you combine with `verify()`?',
    idea: VERIFY_IDEA,
    steps: [
      'Positive path (enough money): the inventory must be used, `verify(inventory).useIngredients(recipe)`.',
      'Negative path (not enough money): the inventory must NOT be used. "Methods called/not called" is one of the interactions mocks check.',
      { text: 'The check:', code: 'verify(inventory, never()).useIngredients(any());' },
    ],
    answer: '`never()`: `verify(mock, never()).method(...)` asserts the call did not happen.',
    mistake: 'Choosing `times()`. `times(0)` would also work, but the course\'s tool for "not called" is `never()`.',
    tryIt: { q: 'Checkout must not charge the card when the cart is empty. Write the check.', a: '`verify(gateway, never()).charge(anyInt());`' },
  };

  H['st8-inorder-mc'] = {
    asks: 'Which Mockito function checks that calls on mocks happened in a particular sequence?',
    idea: VERIFY_IDEA,
    steps: [
      'Ordinary `verify` calls check that something happened, not when. Two of them pass in either order.',
      '`inOrder(...)` creates an object whose verifications must match the real call sequence.',
      { text: 'Example:', code: 'InOrder o = inOrder(db, mailer);\no.verify(db).save(order);\no.verify(mailer).sendConfirmation(order);' },
    ],
    answer: '`inOrder()`.',
    mistake: 'Thinking the order of plain `verify` lines matters. It does not; only InOrder checks sequence.',
    tryIt: { q: 'A heater must be switched off before the door unlocks. Write the check.', a: '`InOrder o = inOrder(heater, door); o.verify(heater).off(); o.verify(door).unlock();`' },
  };

  H['st8-reader-close'] = {
    asks: 'A mutant that deletes `reader.close()` survives ordinary output assertions. How do test doubles kill it?',
    idea: 'A mutant is killed when some test fails on it. Output assertions only see return values and state. Deleting `close()` changes neither, so they cannot tell the mutant from the original. But it does change an interaction, and mocks are built to observe interactions.',
    steps: [
      'Original: reads the file, returns the data, closes the reader. Mutant: same, minus the close. Same return value, so `assertEquals` passes on both.',
      'Pass a mock (or a spy, to keep real reading behaviour) of the reader into the code.',
      { text: 'Then verify the interaction:', code: 'verify(reader).close();' },
      'On the mutant, close() is never called, verification fails, and the mutant is killed. This is the "can we kill reader.close()?" question from Lab 1.',
    ],
    answer: 'Deleting close() changes no return value, so output assertions cannot detect it. Pass in a mock or spy of the reader and `verify(reader).close()`; the mutant fails that check and is killed.',
    mistake: 'Calling the mutant equivalent. It is not: leaving a reader open is a real defect (leaked resource). It is only invisible to output checks.',
    tryIt: { q: 'A mutant deletes `connection.commit()` in a method that returns nothing. How do you kill it?', a: 'Pass in a mock of the connection and `verify(connection).commit();` the mutant never commits, so the check fails.' },
  };

  // ---------- practice: rewriting bug reports ----------
  H['stx-br-angry-upload'] = {
    asks: 'Rewrite a venting report ("Doesn\'t work!!! ... Fix it.") about a failed photo upload so it meets the effective-report checklist, inventing the details you need.',
    idea: REPORT_IDEA,
    steps: [
      REPORT_TABLE,
      'Strip the emotion: "third evening wasted" and "Fix it" give the developer nothing to act on.',
      'Name the symptom and where it happens in the title, then give numbered steps, expected versus actual, and the version/environment.',
      { text: 'A rewrite (details invented):', code: 'Title: Profile photo upload fails with "Error 500" for a 6 MB PNG\nSteps:\n  1. Log in.\n  2. Settings > Profile > Upload photo.\n  3. Choose a 6 MB PNG.\nExpected: photo saved, or a size-limit message.\nActual: spinner, then "Error 500".\nApp 2.3.1, Chrome 129, Windows 11.' },
    ],
    answer: 'A title naming the symptom and place ("Profile photo upload fails with Error 500 for a 6 MB PNG"), numbered steps, expected (saved or a size-limit message) versus actual (spinner, then Error 500), the version and environment, and a neutral tone.',
    mistake: 'Keeping "doesn\'t work" in the title. A title should let someone searching the tracker recognise the exact defect.',
    tryIt: { q: 'Rewrite: "Search is useless, it never finds anything, terrible app."', a: 'Title: Search returns no results for exact product names. Steps: 1. Type "Blue Mug" in search. 2. Press Enter. Expected: the Blue Mug product. Actual: "No results". Version 4.1, Firefox 131.' },
  };

  H['stx-br-three-in-one'] = {
    asks: 'One report titled "Checkout bugs" describes three different defects. Rewrite it so each can be tracked.',
    idea: REPORT_IDEA,
    steps: [
      'Simple means one defect per report. Three symptoms in one report break the lifecycle: one report cannot be assigned to three people, retested three ways, or closed until all three are fixed.',
      { text: 'Split into three reports:', table: { head: ['report', 'expected', 'actual'], rows: [
        ['Expired coupon SPRING24 accepted at checkout', 'rejected', '10% off applied'],
        ['Checkout total omits 5% GST', '$100 cart totals $105', '$100'],
        ['Pay button clipped on 360 px-wide screens (Android 14, Chrome)', 'full button visible', 'right half cut off'],
      ] } },
      'Each one can now be found by search, assigned, fixed and retested on its own.',
    ],
    answer: 'File three reports, one symptom each: expired coupon accepted (expected rejected, actual 10% off); total omits 5% GST ($100 cart: expected $105, actual $100); Pay button clipped on 360 px screens (expected full button, actual right half cut off).',
    mistake: 'Making one report with a numbered list of three bugs. It is still one report with one status.',
    tryIt: { q: 'A report says: "Profile page: avatar is blurry and the Save button does nothing." How many reports?', a: 'Two: one for the blurry avatar, one for the Save button, each with its own steps and expected versus actual.' },
  };

  H['stx-br-long-steps'] = {
    asks: 'A crash report gives 23 steps, mostly unrelated browsing, ending with typing "Ünïcode" into search. Rewrite the steps section.',
    idea: 'Analysing a defect includes isolating it: find the smallest set of steps that still triggers it. That is the "minimum number of steps to reproduce" characteristic, and it often reveals the cause.',
    steps: [
      'Try the last steps on their own: open the app, type "Ünïcode", press Enter. If it still crashes, the 20 browsing steps were noise.',
      { text: 'The rewrite:', code: 'Steps:\n  1. Open the app.\n  2. Type "Ünïcode" into the search box.\n  3. Press Enter.\nExpected: search results (or "no results").\nActual: the app closes.' },
      'Keep the exact input. "Some text" would lose the clue: the accented, non-ASCII characters are the likely cause.',
    ],
    answer: 'Steps: 1. Open the app. 2. Type "Ünïcode" into the search box. 3. Press Enter. Expected: results or "no results"; actual: the app closes. (Isolated by retrying without the browsing steps.)',
    mistake: 'Shortening the input to "type something". The minimum steps must still reproduce the defect, and the exact text is the trigger.',
    tryIt: { q: 'A 15-step report ends: "...upload a file named résumé.pdf, the upload fails." Retrying with only login and upload still fails. Rewrite the steps.', a: '1. Log in. 2. Upload a file named "résumé.pdf". Expected: uploaded. Actual: upload fails. Keep the exact accented file name.' },
  };

  H['stx-br-no-expected'] = {
    asks: 'An "Invoice total wrong" report gives steps (3 items at $19.99, open preview) but never says what is wrong. Rewrite it.',
    idea: REPORT_IDEA,
    steps: [
      '"Wrong" forces the reader to guess. Explaining the problem means stating expected and actual side by side.',
      { text: 'Work out the expected value:', table: { head: ['items', 'price', 'expected total'], rows: [['3', '$19.99', '3 × 19.99 = $59.97']] } },
      'Then say what the preview actually shows ($59.96, invented), and add the build and environment so the report is complete.',
      'A 1 cent difference also hints at the cause: a floating-point rounding fault.',
    ],
    answer: 'Title: Invoice preview total is 1 cent low for 3 × $19.99. Steps as given. Expected: $59.97. Actual: $59.96. Build 4.8.2, web app, Firefox 131 on Ubuntu 24.04.',
    mistake: 'Writing only "Expected: correct total". Give the number; that is what lets the developer see the bug at a glance.',
    tryIt: { q: 'A report: "Discount wrong. Steps: apply 25% off to a $80 item." Add expected versus actual (actual shows $20.00).', a: 'Expected: $60.00 (80 minus 25%). Actual: $20.00 (it shows the discount amount instead of the price).' },
  };

  H['stx-br-sometimes'] = {
    asks: '"The video player freezes sometimes." Rewrite the report so the defect can be chased down.',
    idea: 'Analysing a defect means deciding whether it is reproducible (you know the exact steps and can trigger it on demand) or only repeatable (it happens again and again, but not on demand). A good report says which, and gives everything that narrows it down.',
    steps: [
      'Replace "sometimes" with what you were doing and how often: "when seeking past the buffered part, about 1 in 5 tries".',
      'State honestly that it is repeatable but not yet reproducible on demand, so the developer knows isolation is still needed.',
      'Add the version, browser, OS and a log.',
      { text: 'A rewrite:', code: 'Title: Player freezes when seeking past the buffered part of a 1080p video\nSteps: 1. Play any 1080p video. 2. Drag the seek bar beyond the grey buffered area.\nHappens about 1 in 5 tries (repeatable, not yet reproducible on demand).\nApp 5.2.0, Firefox 131, macOS 14. Console log attached.' },
    ],
    answer: 'Title: Player freezes when seeking past the buffered part of a 1080p video. Steps: play a 1080p video, drag the seek bar beyond the buffered area. About 1 in 5 tries (repeatable, not reproducible on demand). App 5.2.0, Firefox 131, macOS 14. Log attached.',
    mistake: 'Hiding the uncertainty and writing steps as if it always happens. Saying "1 in 5" is more useful than pretending.',
    tryIt: { q: 'Repeatable or reproducible: "Every time I paste more than 10,000 characters, the editor hangs."', a: 'Reproducible: exact steps that trigger it on demand.' },
  };

  H['stx-br-blame'] = {
    asks: 'Rewrite "Dave broke login AGAIN: his lazy refactor broke login, the password hashing is obviously wrong."',
    idea: 'Many stakeholders read reports, so they must be factual, follow the project template, and describe what was OBSERVED. Blame makes people defensive, and a guessed cause can send the developer looking in the wrong place.',
    steps: [
      'Remove the person and the insult.',
      'Remove the guessed cause ("hashing"). You observed a symptom, not a cause.',
      'Describe the symptom with steps, expected and actual, and add the clue you did observe: the old password still works.',
    ],
    answer: 'Title: Login rejects the new password after a password reset. Steps: 1. Reset the password for a test account. 2. Log in with the new password. Expected: logged in. Actual: "Incorrect password"; the old password still works. Version 3.1.0.',
    mistake: 'Keeping "hashing is wrong" as a helpful hint. Unless you verified it, it is a guess, and it may steer the fix away from the real fault.',
    tryIt: { q: 'Rewrite: "The new intern\'s CSS broke the menu on phones."', a: 'Title: Main menu items overlap on 375 px-wide screens. Steps: open the home page on an iPhone SE, tap the menu. Expected: items in a list. Actual: items stacked on top of each other. Version 2.7.' },
  };

  H['stx-br-public-security'] = {
    asks: 'Someone posted a public GitHub issue showing how to read anyone\'s invoices by changing user=123 in the URL, with a script that downloads them all. Say how and what they should have reported.',
    idea: SEC_IDEA,
    steps: [
      'How: privately, through the project\'s security contact. A public issue with a working script is an attack recipe for everyone.',
      SEC_TABLE,
      { text: 'Filled in for this bug:', table: { head: ['item', 'content'], rows: [
        ['Type of issue', 'broken access control: invoices are not checked against the logged-in user'],
        ['Product and version', 'the app and its version'],
        ['Special configuration / steps', 'log in as any user, change user= in /invoices?user=...'],
        ['Proof of concept', 'the download script, shared privately'],
        ['Impact', 'any user can read every user\'s invoices'],
      ] } },
      'Then allow the usual 45 to 90 days before full public disclosure, unless it is already actively exploited.',
    ],
    answer: 'Report it privately through the project\'s security contact, not as a public issue. Include the issue type (broken access control), product and version, steps, the proof-of-concept script (shared privately) and the impact (any user can read every invoice).',
    mistake: 'Only removing the script but keeping the issue public. The description alone tells attackers exactly what to do.',
    tryIt: { q: 'You find that the login form is open to SQL injection on version 3.2. Where do you report it, and which item is "SQL injection"?', a: 'Privately to the vendor\'s security contact. "SQL injection" is the type of issue.' },
  };

  H['stx-br-hallway'] = {
    asks: 'A tester tells a developer in the hallway that "the CSV export thing was weird yesterday". What must happen, and what goes in the report?',
    idea: REPORT_IDEA,
    steps: [
      'A spoken remark is not written, not numbered and not searchable: nobody can track, assign or retest it.',
      'Lifecycle step 2, Report: first search the tracker so you do not file a duplicate.',
      'Then file a written report that explains the problem with numbers.',
      { text: 'A rewrite (details invented):', code: 'Title: CSV export drops rows after row 1000\nSteps: export a 1,500-row table to CSV.\nExpected: 1,500 rows.\nActual: 1,000 rows, no warning.\nVersion 2.0.4.' },
    ],
    answer: 'Search the tracker for a duplicate, then file a written, numbered report, e.g. "CSV export drops rows after row 1000": export a 1,500-row table; expected 1,500 rows, actual 1,000 with no warning; version 2.0.4.',
    mistake: 'Skipping the duplicate search. That is the first thing the reporting step asks for.',
    tryIt: { q: 'A colleague posts in team chat: "dark mode looks off on settings". What do you do?', a: 'Search the tracker; if it is new, file a written report with steps, expected versus actual (e.g. grey text on a grey background) and the version.' },
  };

  // ---------- practice: choosing and writing doubles ----------
  H['stx-dbl-portfolio'] = {
    asks: 'Portfolio.value() multiplies each holding by `prices.priceOf(symbol)` from a remote PriceService. Write the Mockito lines that test 3 shares of "ABC" at $10.00 without the network.',
    idea: DOUBLE_IDEA,
    steps: [
      'What does the test need from PriceService? Only an input: a price. So the double is a test stub.',
      { text: 'Create it, stub it, inject it, assert:', code: 'PriceService prices = mock(PriceService.class);\nwhen(prices.priceOf("ABC")).thenReturn(10.0);\nPortfolio p = new Portfolio(prices);   // holds 3 x ABC\nassertEquals(30.0, p.value(), 0.001);' },
      'Expected value: 3 × 10.00 = 30.00.',
      ROLE_STEP,
    ],
    answer: '`PriceService prices = mock(PriceService.class); when(prices.priceOf("ABC")).thenReturn(10.0);` then assert value() is 30.0. It is a test stub: it only feeds a fixed price in.',
    mistake: 'Adding `verify(prices).priceOf("ABC")`. That checks an interaction nobody asked about and turns a simple stub test into a brittle mock test.',
    tryIt: { q: 'Cart.total() asks `tax.rateFor("AB")` and adds tax. Stub a 5% rate.', a: '`TaxService tax = mock(TaxService.class); when(tax.rateFor("AB")).thenReturn(0.05);` then a $100 cart should total $105.' },
  };

  H['stx-dbl-db-down'] = {
    asks: 'UserService.displayName(7) should return "unknown" when the repository fails. Write the Mockito line that makes `repo.findById(7)` fail on demand.',
    idea: MOCKITO_IDEA,
    steps: [
      'An error path is hard to reach with a real database: you would have to break it. A stub can feed the failure in, every run.',
      { text: 'Use thenThrow instead of thenReturn:', code: 'UserRepository repo = mock(UserRepository.class);\nwhen(repo.findById(7)).thenThrow(new RuntimeException("DB down"));\nassertEquals("unknown", new UserService(repo).displayName(7));' },
      'The exception is the stub\'s "input" to the SUT, so the double is still a test stub.',
    ],
    answer: '`when(repo.findById(7)).thenThrow(new RuntimeException("DB down"));` then assert displayName(7) returns "unknown". A test stub that supplies the failure.',
    mistake: 'Trying to make the real database fail. A stub makes the error path repeatable.',
    tryIt: { q: 'Make `api.fetch("x")` throw a TimeoutException (a checked exception the method declares).', a: '`when(api.fetch("x")).thenThrow(new TimeoutException());`' },
  };

  H['stx-dbl-thermostat'] = {
    asks: 'Thermostat.tick() reads `sensor.read()` once per call. The test calls tick() three times and expects the fan on only after the third reading (above 30). Write the stubbing.',
    idea: MOCKITO_IDEA,
    steps: [
      'You need a different answer on each call: 20, then 25, then something above 30.',
      { text: 'thenReturn takes several values, returned in order:', code: 'Sensor sensor = mock(Sensor.class);\nwhen(sensor.read()).thenReturn(20, 25, 31);' },
      { text: 'What each call returns:', table: { head: ['call', 'read()', 'fan'], rows: [['1', '20', 'off'], ['2', '25', 'off'], ['3', '31', 'on'], ['4 and later', '31 (last value repeats)', 'on']] } },
    ],
    answer: '`when(sensor.read()).thenReturn(20, 25, 31);`: the 1st call gives 20, the 2nd 25, then 31 (and 31 on every later call). A test stub.',
    mistake: 'Writing three separate `when(...)` lines. Each new stubbing replaces the previous one, so every call would return 31.',
    tryIt: { q: 'Stub `queue.poll()` to return "a", then "b", then null for ever after.', a: '`when(queue.poll()).thenReturn("a", "b", null);` the last value repeats.' },
  };

  H['stx-dbl-geo-any'] = {
    asks: 'Signup.region(ip) calls `geo.lookup(ip)`. Whatever IP the code passes, the lookup should answer "CA". Write the Mockito line.',
    idea: MOCKITO_IDEA,
    steps: [
      'A stub written with a literal argument only answers for that exact argument. `when(geo.lookup("1.2.3.4"))` returns null for any other IP.',
      'An argument matcher widens it: `anyString()` (or `any()`) matches whatever is passed.',
      { text: 'The line:', code: 'when(geo.lookup(anyString())).thenReturn("CA");' },
    ],
    answer: '`when(geo.lookup(anyString())).thenReturn("CA");` A test stub with an argument matcher.',
    mistake: 'Stubbing one specific IP and being surprised by null. Unmatched calls fall back to the default, which is null for a String.',
    tryIt: { q: 'Make `rates.forDay(anyDate)` return 1.37 for every LocalDate.', a: '`when(rates.forDay(any())).thenReturn(1.37);`' },
  };

  H['stx-dbl-matchers-mix'] = {
    asks: '`when(rates.convert("USD", anyDouble())).thenReturn(1.37);` throws InvalidUseOfMatchersException. Fix the line.',
    idea: MOCKITO_IDEA,
    steps: [
      'The rule: if any argument uses a matcher, every argument must be a matcher.',
      'Here `anyDouble()` is a matcher but `"USD"` is a plain value, so Mockito cannot line them up.',
      { text: 'Wrap the literal in eq():', code: 'when(rates.convert(eq("USD"), anyDouble())).thenReturn(1.37);' },
      'Now convert("USD", 5) returns 1.37 and convert("EUR", 5) still returns the default 0.0.',
    ],
    answer: '`when(rates.convert(eq("USD"), anyDouble())).thenReturn(1.37);` once one argument is a matcher, all must be, so "USD" goes inside `eq()`.',
    mistake: 'Replacing "USD" with `anyString()`. That fixes the error but changes the meaning: every currency would return 1.37.',
    tryIt: { q: 'Fix: `verify(mailer).send("ana@x.com", contains("Welcome"));`', a: '`verify(mailer).send(eq("ana@x.com"), contains("Welcome"));`' },
  };

  H['stx-dbl-welcome'] = {
    asks: 'Registration.register("ana@x.com") returns void but must send exactly "Welcome!" to that address through a Mailer. Which Mockito line checks it?',
    idea: VERIFY_IDEA,
    steps: [
      'Void method: nothing to assert on the return. The effect is an indirect output, a call on the Mailer.',
      { text: 'Mock the Mailer, run, verify:', code: 'Mailer mailer = mock(Mailer.class);\nnew Registration(mailer).register("ana@x.com");\nverify(mailer).send("ana@x.com", "Welcome!");' },
      'Plain `verify(mock).m(args)` means "called exactly once with these arguments" (times(1) is the default).',
    ],
    answer: '`verify(mailer).send("ana@x.com", "Welcome!");` A mock: the void method\'s indirect output is checked.',
    mistake: 'Stubbing `send` with when(). It returns void, and the test is about checking the call, not feeding an answer.',
    tryIt: { q: 'Logout must call `session.invalidate()` exactly once. Write the check.', a: '`verify(session).invalidate();`' },
  };

  H['stx-dbl-audit-twice'] = {
    asks: 'Transfer.execute() must write two audit entries through `AuditLog.log(String)`, whatever the messages say. Which Mockito line checks the count?',
    idea: VERIFY_IDEA,
    steps: [
      VERIFY_TABLE,
      'Exactly two calls: `times(2)`. Any message: `anyString()`.',
      { text: 'The line:', code: 'verify(audit, times(2)).log(anyString());' },
    ],
    answer: '`verify(audit, times(2)).log(anyString());` A mock, checked with a call count and a matcher.',
    mistake: 'Writing `verify(audit).log(anyString())`. That means exactly once and fails with two calls.',
    tryIt: { q: 'A batch job must call `store.save(any())` once per item for 5 items. Write the check.', a: '`verify(store, times(5)).save(any());`' },
  };

  H['stx-dbl-empty-cart'] = {
    asks: 'Checkout.pay(cart) must not charge the card when the cart is empty. Which Mockito line proves the gateway was never charged?',
    idea: VERIFY_IDEA,
    steps: [
      'This is a negative path: the interaction must NOT happen. "Called or not called" is one of the things mocks check.',
      'Use `never()`, and an `anyInt()` matcher so a charge of ANY amount counts as a failure.',
      { text: 'The line:', code: 'verify(gateway, never()).charge(anyInt());' },
    ],
    answer: '`verify(gateway, never()).charge(anyInt());` A mock checked on the negative path.',
    mistake: 'Writing `never()).charge(0)`. That only forbids a charge of exactly 0 cents; a charge of 500 would slip through.',
    tryIt: { q: 'When a password is wrong, the app must never call `audit.loginSucceeded(...)`. Write the check.', a: '`verify(audit, never()).loginSucceeded(any());`' },
  };

  H['stx-dbl-cache-hit'] = {
    asks: 'On a cache hit, Lookup.find("k") must read `cache.get("k")` and do nothing else with the cache. Which two Mockito lines check that?',
    idea: VERIFY_IDEA,
    steps: [
      'First stub `get("k")` to return a value, so the code sees a hit.',
      { text: 'Then verify the one expected call, and that nothing else happened:', code: 'when(cache.get("k")).thenReturn("v");\nlookup.find("k");\nverify(cache).get("k");\nverifyNoMoreInteractions(cache);' },
      '`verifyNoMoreInteractions` fails if any call on the mock has not already been verified, such as a stray put or evict.',
    ],
    answer: '`verify(cache).get("k"); verifyNoMoreInteractions(cache);` The second line fails if any other call reached the cache.',
    mistake: 'Writing `never()` checks for put and evict only. That misses any other method added later; verifyNoMoreInteractions covers them all.',
    tryIt: { q: 'A read-only report must call `db.query(...)` once and nothing else on db. Write the two lines.', a: '`verify(db).query(any()); verifyNoMoreInteractions(db);`' },
  };

  H['stx-dbl-inorder'] = {
    asks: 'OrderService.place(order) must save the order BEFORE emailing the confirmation. Write the Mockito check.',
    idea: VERIFY_IDEA,
    steps: [
      'Two plain `verify` lines would pass in either order, so they cannot catch "email first".',
      { text: 'Use an InOrder over both mocks:', code: 'InOrder inOrder = inOrder(db, mailer);\ninOrder.verify(db).save(order);\ninOrder.verify(mailer).sendConfirmation(order);' },
      'If the code emails first, the second inOrder.verify fails.',
    ],
    answer: '`InOrder inOrder = inOrder(db, mailer); inOrder.verify(db).save(order); inOrder.verify(mailer).sendConfirmation(order);`',
    mistake: 'Thinking the order of plain verify lines in the test enforces the order of calls. It does not.',
    tryIt: { q: 'A deploy must call `build.run()` then `server.restart()`. Write the check.', a: '`InOrder o = inOrder(build, server); o.verify(build).run(); o.verify(server).restart();`' },
  };

  H['stx-dbl-spy-today'] = {
    asks: 'Keep ReportGenerator fully real except `today()`, which should return "2026-10-16". Write the Mockito lines.',
    idea: DOUBLE_IDEA,
    steps: [
      'Real methods must run, so a mock is wrong (build() would do nothing). Use a spy of a real object.',
      'With a spy, `when(gen.today())` calls the REAL today() while setting up the stub. Use the do-family, which names the method after `when(spy)`, so the real one is not called.',
      { text: 'The lines:', code: 'ReportGenerator gen = spy(new ReportGenerator());\ndoReturn("2026-10-16").when(gen).today();\nString report = gen.build();   // real build(), fixed date' },
    ],
    answer: '`ReportGenerator gen = spy(new ReportGenerator()); doReturn("2026-10-16").when(gen).today();` A spy: real methods run, one is overridden.',
    mistake: 'Using `when(gen.today()).thenReturn(...)` on a spy. It runs the real today() during stubbing, which may fail or have side effects.',
    tryIt: { q: 'Keep a real PriceCalculator but make `randomDiscount()` return 0.10. Write the lines.', a: '`PriceCalculator c = spy(new PriceCalculator()); doReturn(0.10).when(c).randomDiscount();`' },
  };

  H['stx-dbl-spy-clear'] = {
    asks: 'Checkout.complete(cart) must empty the cart. The real Cart must keep working, but you also want to check clear() was called. Write the Mockito lines.',
    idea: DOUBLE_IDEA,
    steps: [
      'You need two things at once: real behaviour (totals, items) and a record of calls. That is a spy.',
      'A mock would return 0 from total() and an empty item list, breaking the code under test.',
      { text: 'The lines:', code: 'Cart cart = spy(new Cart());\ncart.add(item);\ncheckout.complete(cart);\nverify(cart).clear();' },
    ],
    answer: '`Cart cart = spy(new Cart()); checkout.complete(cart); verify(cart).clear();` A spy: real behaviour plus recorded calls.',
    mistake: 'Using `mock(Cart.class)`. Its real methods would not run, so total() would be 0 and the checkout logic would take a different path.',
    tryIt: { q: 'You want a real ArrayList to behave normally but check that add() was called 3 times. Write it.', a: '`List<String> list = spy(new ArrayList<>()); ... verify(list, times(3)).add(anyString());`' },
  };

  H['stx-dbl-fake-repo'] = {
    asks: 'BookingService saves dozens of bookings and then queries them by date, customer and room. Stubbing every answer by hand is unworkable. Which double fits?',
    idea: DOUBLE_IDEA,
    steps: [
      'A stub only returns preset answers. With many saves followed by many different queries, you would have to predict every answer by hand.',
      'A fake really works: save stores, queries search what was stored, so it stays consistent across all those calls.',
      { text: 'No Mockito: write a small class.', code: 'class InMemoryBookingRepo implements BookingRepo {\n    private final List<Booking> all = new ArrayList<>();\n    public void save(Booking b) { all.add(b); }\n    public List<Booking> byDate(LocalDate d) { /* filter all */ }\n    public List<Booking> byCustomer(String c) { /* filter all */ }\n}' },
      'Pass `new InMemoryBookingRepo()` into BookingService.',
    ],
    answer: 'A fake object: a small working implementation such as InMemoryBookingRepo backed by a List, passed in instead of the real repository. No Mockito line needed.',
    mistake: 'Reaching for Mockito out of habit. A fake is usually a hand-written class, not a `mock()`.',
    tryIt: { q: 'Tests of a shopping app need a FileStore where write(name, bytes) then read(name) returns those bytes. Which double, and how?', a: 'A fake: a class backed by a HashMap from name to bytes, implementing FileStore.' },
  };

  H['stx-dbl-dummy-logger'] = {
    asks: 'InvoiceService needs a Logger in its constructor, but subtotal() never logs. What do you pass for the logger?',
    idea: DOUBLE_IDEA,
    steps: [
      'The logger is required by the signature but irrelevant to the test: that is a dummy.',
      { text: 'Mockito uses mock() for the dummy role too:', code: 'InvoiceService s = new InvoiceService(repo, mock(Logger.class));\nassertEquals(30, s.subtotal(lines));' },
      'No `when()` and no `verify()` on it. If the constructor does not reject null, null also works.',
    ],
    answer: '`mock(Logger.class)` with no `when()` and no `verify()`: a dummy object (null also works if the constructor accepts it).',
    mistake: 'Verifying the logger "just in case". That adds a check the spec never asked for and makes the test fail for the wrong reasons.',
    tryIt: { q: 'A Shape constructor requires a Color, but you only test area(). What do you pass?', a: 'A dummy: `mock(Color.class)` (or any simple Color), never stubbed or verified.' },
  };

  H['stx-dbl-optional-user'] = {
    asks: 'Login.greet("a@b.c") should return "Hi Ana" when the repository finds that user. findByEmail returns Optional<User>. Write the stubbing.',
    idea: MOCKITO_IDEA,
    steps: [
      'The test needs an input: a found user. That is a stub returning an object.',
      'Unstubbed, a mock returns Optional.empty() for an Optional, so the "not found" path would run.',
      { text: 'The stubbing:', code: 'when(users.findByEmail("a@b.c")).thenReturn(Optional.of(new User("Ana")));\nassertEquals("Hi Ana", login.greet("a@b.c"));' },
    ],
    answer: '`when(users.findByEmail("a@b.c")).thenReturn(Optional.of(new User("Ana")));` A test stub returning an object.',
    mistake: 'Returning `new User("Ana")` directly. The method returns Optional<User>, so it must be wrapped in Optional.of.',
    tryIt: { q: 'Test the "not found" path of greet: what stubbing do you need?', a: 'None strictly: an unstubbed mock already returns Optional.empty(). Writing `thenReturn(Optional.empty())` makes the intent explicit.' },
  };

  H['stx-dbl-void-throws'] = {
    asks: 'Exporter.export() must show "Disk full" when `writer.write(text)` throws IOException. write returns void, so `when(...).thenThrow` cannot be used. What is the line?',
    idea: MOCKITO_IDEA,
    steps: [
      '`when(x)` needs a value: `when(writer.write("a"))` does not compile, because a void call has no value to pass in.',
      'The do-family flips the order: the action first, then `when(mock)`, then the method call.',
      { text: 'The line:', code: 'doThrow(new IOException("disk full")).when(writer).write(anyString());' },
      'The same family has doReturn (for spies) and doNothing.',
    ],
    answer: '`doThrow(new IOException("disk full")).when(writer).write(anyString());` a void method cannot go inside `when()`, so the do-family names it after `when(mock)`.',
    mistake: 'Writing `when(writer).write(...)` without doThrow, or putting the void call inside when(). Neither compiles.',
    tryIt: { q: 'Make the void `mailer.send(any(), any())` throw a RuntimeException.', a: '`doThrow(new RuntimeException()).when(mailer).send(any(), any());`' },
  };

  H['stx-dbl-low-stock'] = {
    asks: 'Inventory.remove(item, n) must warn through `alerts.warn(msg)` when stock drops below 5. The message includes the item name. Which Mockito line checks the warning without hard-coding the whole message?',
    idea: VERIFY_IDEA,
    steps: [
      'The spec fixes only part of the message ("low stock"), not the item name. Verify only what the spec fixes.',
      'String matchers check part of an argument: `contains()`, `startsWith()`, `endsWith()`.',
      { text: 'The line:', code: 'verify(alerts).warn(contains("low stock"));' },
    ],
    answer: '`verify(alerts).warn(contains("low stock"));` A mock with a string matcher: only part of the message is checked.',
    mistake: 'Hard-coding the full message ("low stock: tea (4 left)"). A wording change breaks the test even though the behaviour is right.',
    tryIt: { q: 'An error log must start with "ERROR:". Write the check on `log.write(String)`.', a: '`verify(log).write(startsWith("ERROR:"));`' },
  };

  H['stx-dbl-makecoffee'] = {
    asks: 'On makeCoffee\'s positive path, the inventory must say "yes, enough ingredients" and then be used. Write the stubbing and the check for this one double.',
    idea: DOUBLE_IDEA,
    steps: [
      'Input part: the SUT asks enoughIngredients, so stub it to return true.',
      'Output part: the SUT must then call useIngredients, so verify that.',
      { text: 'The lines:', code: 'when(inventory.enoughIngredients(recipe)).thenReturn(true);\ncoffeeMaker.makeCoffee(...);   // enough money\nverify(inventory).useIngredients(recipe);' },
      'A double that is both stubbed and verified counts as a mock: the verification is what it is for.',
    ],
    answer: '`when(inventory.enoughIngredients(recipe)).thenReturn(true);` then after makeCoffee, `verify(inventory).useIngredients(recipe);` A mock that is also stubbed.',
    mistake: 'Calling it a stub because of the when(). Once you verify it, its job is checking output.',
    tryIt: { q: 'The negative path (not enough money): what changes in the check?', a: '`verify(inventory, never()).useIngredients(any());` the inventory must not be used.' },
  };

  H['stx-dbl-fixed-clock'] = {
    asks: 'Subscription.isExpired() compares an end date with `clock.now()`. The test passes today and will fail next year. Write the Mockito line that makes it repeatable.',
    idea: FLAKY_IDEA,
    steps: [
      'A change in date/time is one of the environment causes of flaky tests. The test depends on when it runs.',
      'Make "now" an input the test controls: a test stub for the clock.',
      { text: 'The line:', code: 'when(clock.now()).thenReturn(Instant.parse("2026-01-01T00:00:00Z"));' },
      'The test\'s "today" is now fixed for ever, so the result never changes.',
    ],
    answer: '`when(clock.now()).thenReturn(Instant.parse("2026-01-01T00:00:00Z"));` A test stub giving a fixed time as input.',
    mistake: 'Updating the expected date every year. That treats the symptom; the dependency on the real clock is the bug in the test.',
    tryIt: { q: 'A greeting says "Good morning" before noon. Stub a Clock so the test always runs at 9 am.', a: '`when(clock.now()).thenReturn(Instant.parse("2026-01-01T09:00:00Z"));` (with the code using UTC).' },
  };

  H['stx-dbl-heartbeat'] = {
    asks: 'Worker.run() must ping a Monitor at least once, but how many pings depends on timing. Which Mockito line checks it without making the test flaky?',
    idea: VERIFY_IDEA,
    steps: [
      'An exact count like `times(3)` would depend on timing, one of the causes of flaky tests.',
      'Check only what the spec fixes: at least one ping. That is a lower bound.',
      { text: 'The line:', code: 'verify(monitor, atLeastOnce()).ping();' },
    ],
    answer: '`verify(monitor, atLeastOnce()).ping();` A mock verified with a lower bound instead of an exact count.',
    mistake: 'Using plain `verify(monitor).ping()`. That means exactly once and fails whenever there are two pings.',
    tryIt: { q: 'A retry loop must try `api.call()` at least 2 times. Write the check.', a: '`verify(api, atLeast(2)).call();`' },
  };

  // ---------- practice: flaky tests ----------
  H['stx-fl-counter-threads'] = {
    asks: 'Two threads each do `counter++` 1,000 times on a shared int. The test asserts 2000 and fails about once in fifty runs. Which cause of flakiness is it?',
    idea: FLAKY_IDEA,
    steps: [
      FLAKY_TABLE,
      '`counter++` is three steps: read, add 1, write back. Two threads can both read the same value, both add 1, and both write it: one increment is lost.',
      'Whether that happens depends on how the threads interleave on that run: concurrency.',
      'Fix the code (synchronise, or use AtomicInteger). Forcing the test to run sequentially only hides the bug.',
    ],
    answer: 'Concurrency (threads): two threads interleave the read-modify-write of `counter++` and lose an update.',
    mistake: 'Choosing timing. Timing is about waits and time limits; here the cause is threads sharing data.',
    tryIt: { q: 'Two test methods run in parallel and both modify the same static list. Sometimes one sees the other\'s items. Which cause?', a: 'Concurrency: two threads share one resource.' },
  };

  H['stx-fl-birthday'] = {
    asks: '`assertEquals(20, person.age())` passes all year, then fails the day after the person\'s birthday. age() uses LocalDate.now(). Cause, and fix?',
    idea: FLAKY_IDEA,
    steps: [
      FLAKY_TABLE,
      'The code did not change; the date did. A change in date/time is an environment cause.',
      'Fix: make the date an input the test controls. Inject a clock (and give it a fixed date in the test, e.g. Clock.fixed(...)), or pass today\'s date in as a parameter.',
    ],
    answer: 'A change in environment, the date the test runs on: 20 is only true until the birthday. Fix: inject a clock fixed to a known date in the test, or pass the date in.',
    mistake: 'Changing the expected value to 21. It will break again next year.',
    tryIt: { q: 'A test asserts `isWeekend()` is false and fails every Saturday. Cause and fix?', a: 'Change in date/time. Inject a stubbed clock fixed to a known weekday.' },
  };

  H['stx-fl-paths'] = {
    asks: 'A test builds the path "data\\input.csv". It passes on Windows and fails on the Linux build server. Which cause?',
    idea: FLAKY_IDEA,
    steps: [
      FLAKY_TABLE,
      'Windows separates folders with a backslash; Linux uses a forward slash. The test depends on the OS it runs on.',
      'That is a change in environment (a different OS).',
      'Fix: build paths portably, `Paths.get("data", "input.csv")` or `File.separator`.',
    ],
    answer: 'Change in environment (a different OS). Fix: `Paths.get("data", "input.csv")` or File.separator.',
    mistake: 'Choosing concurrency or timing because it fails "only on the server". Ask what differs between the two machines.',
    tryIt: { q: 'A test compares output to a file with "\\r\\n" line endings; it fails on Linux. Which cause?', a: 'Change in environment (OS): Windows and Linux use different line endings.' },
  };

  H['stx-fl-dialog'] = {
    asks: 'A GUI test clicks Save, sleeps 200 ms, then asserts the "Saved" dialog is visible. It passes locally but fails on the slower CI machine. Cause, and fix?',
    idea: FLAKY_IDEA,
    steps: [
      FLAKY_TABLE,
      'The fixed 200 ms sleep guesses how long saving takes: timing.',
      'A slower processor makes the guess wrong more often: an environment change that makes the timing problem worse.',
      'Fix: wait for the condition itself (poll until the dialog is visible, with a generous timeout). A longer sleep only makes failures rarer and every run slower.',
    ],
    answer: 'Timing, made worse by an environment change (a slower processor): the 200 ms sleep is sometimes too short. Fix: wait for the dialog to appear (poll with a generous timeout) instead of a fixed sleep.',
    mistake: 'Raising the sleep to 2 seconds. Still a guess, and every run gets slower.',
    tryIt: { q: 'A test starts a server, sleeps 1 second, then connects. It fails occasionally on CI. Fix?', a: 'Timing: poll until the server accepts a connection (with a timeout) instead of sleeping a fixed second.' },
  };

  H['stx-fl-exchange-api'] = {
    asks: 'A unit test converts 100 USD through a live exchange-rate service and asserts 137.20 CAD. It fails most days. Which fix fits best?',
    idea: WHY_IDEA,
    steps: [
      'The rate changes daily and is outside the test\'s control; the service is also owned by someone else.',
      'Replace it with a stub that returns a fixed rate (1.372). Then 100 × 1.372 = 137.20 every run.',
      'Retrying until it passes hides the problem; seeds and sequential execution are fixes for randomness and concurrency, not for a live value.',
    ],
    answer: 'Replace the service with a stub that returns a fixed rate: test doubles help prevent flaky tests.',
    mistake: 'Choosing "retry until it passes". That turns a failing test into a test that checks nothing.',
    tryIt: { q: 'A test checks a "rain warning" against a live weather API and fails on sunny days. Fix?', a: 'Stub the weather API to return rain (a fixed input).' },
  };

  H['stx-fl-perf'] = {
    asks: 'A unit test asserts that sorting 1,000,000 items takes under 500 ms. It fails when the CI machine is busy. Cause, and fix?',
    idea: FLAKY_IDEA,
    steps: [
      FLAKY_TABLE,
      'The time depends on processor speed and on what else the machine is doing: timing that depends on the environment (RAM, processor, disk speed).',
      'Fix: take the wall-clock limit out of the unit test. Keep the unit test for correctness (is it sorted?), and measure speed separately in a benchmark with a generous margin.',
    ],
    answer: 'Timing that depends on the environment (processor speed and machine load). Fix: keep the unit test for correctness and measure speed in a separate benchmark with a generous margin.',
    mistake: 'Raising the limit to 5 seconds. It still fails on a busy enough machine, and it no longer catches a real slowdown.',
    tryIt: { q: 'A test asserts a file copy takes under 50 ms; it fails on a laptop with a slow disk. Which environment change?', a: 'Disk speed (RAM / processor / disk speed).' },
  };

  H['stx-fl-hashmap-order'] = {
    asks: 'A test asserts the exact `map.toString()` text of a HashMap. It passed for years, then failed after a Java upgrade. Which cause?',
    idea: FLAKY_IDEA,
    steps: [
      FLAKY_TABLE,
      'HashMap\'s iteration order is unspecified: it depends on the implementation, which can change between Java versions.',
      'So the test silently depended on the Java environment: a change in environment.',
      'Fix: compare the maps themselves, `assertEquals(expectedMap, map)`, or use a sorted map if order matters.',
    ],
    answer: 'Change in environment (Java version): HashMap order is unspecified and changed. Fix: `assertEquals(expectedMap, map)` or a sorted map.',
    mistake: 'Calling it concurrency. Nothing runs in parallel; the order changed because the Java version did.',
    tryIt: { q: 'A test asserts the exact order of `new HashSet<>(List.of("b", "a", "c"))` printed. Is it safe?', a: 'No: HashSet order is unspecified and can differ across Java versions. Compare sets with assertEquals instead.' },
  };

  H['stx-fl-tmpfile'] = {
    asks: 'Two CI test processes run in parallel and both write then read /tmp/report.csv, so a test sometimes reads the other\'s data. Cause, and fix?',
    idea: FLAKY_IDEA,
    steps: [
      FLAKY_TABLE,
      'Two processes share one resource, the file. Who wins depends on how they interleave: concurrency (multiple processes).',
      'Fix: give each test its own temporary file (e.g. JUnit\'s `@TempDir`). Forcing sequential execution also works, but every run gets slower.',
    ],
    answer: 'Concurrency between processes sharing one file. Fix: give each test its own temporary file (e.g. `@TempDir`); running sequentially also works but is slower.',
    mistake: 'Thinking concurrency only means threads. The course lists multiple processes too.',
    tryIt: { q: 'Two test suites on the same CI box both use the test database "app_test" and sometimes see each other\'s rows. Cause and fix?', a: 'Concurrency (processes) on a shared resource. Give each run its own database (e.g. a unique name per run).' },
  };

  H['stx-fl-port'] = {
    asks: 'An integration test starts a server on port 8080 and fails on one developer\'s machine, where another program already uses 8080. Which cause?',
    idea: FLAKY_IDEA,
    steps: [
      FLAKY_TABLE,
      'The test assumes something about the machine it runs on: that port 8080 is free.',
      'On a different machine that assumption breaks: a change in environment (a different machine).',
      'Fix: ask the OS for any free port (port 0) and read back which one was assigned.',
    ],
    answer: 'Change in environment (a different machine). Fix: bind to port 0 so the OS picks a free port, then read it back.',
    mistake: 'Choosing concurrency. Another program holding the port is a fact about that machine, not two parts of the test racing.',
    tryIt: { q: 'A test expects a folder C:\\TestData that only exists on the original developer\'s PC. Which cause?', a: 'Change in environment (a different machine).' },
  };

  // ---------- practice: classify the double ----------
  H['stx-cls-canned'] = {
    asks: 'A replacement PaymentGateway always answers "APPROVED" so checkout can be tested offline. It records nothing and nothing is checked on it. Which double?',
    idea: DOUBLE_IDEA,
    steps: [
      DOUBLE_TABLE,
      'It gives the SUT a canned answer (an input) and checks nothing: stub.',
      'Not a fake: it does not really process payments. Not a mock or spy: nothing is observed.',
    ],
    answer: 'A stub: it provides canned input data to the SUT and monitors nothing.',
    mistake: 'Choosing fake because it "pretends to be the gateway". All doubles pretend; a fake actually works.',
    tryIt: { q: 'A replacement AuthService always returns "user is admin". Nothing is checked on it. Which double?', a: 'A stub.' },
  };

  H['stx-cls-inmemory'] = {
    asks: 'A HashMap-backed class implements UserRepository: save() really stores users and findByEmail() really finds them. Which double?',
    idea: DOUBLE_IDEA,
    steps: [
      DOUBLE_TABLE,
      'It has real working logic, just much lighter than a database: a lightweight implementation of a heavyweight component.',
      'That is a fake. A stub would only return answers written in advance.',
    ],
    answer: 'A fake object: a lightweight working implementation of the database.',
    mistake: 'Choosing stub. Stubs do not store anything; what you save into a fake comes back out.',
    tryIt: { q: 'A test uses a class whose send(msg) appends to an in-memory queue and receive() pops from it, standing in for a message broker. Which double?', a: 'A fake: a working lightweight broker.' },
  };

  H['stx-cls-sms-list'] = {
    asks: 'A hand-written SmsSender replacement appends each message to a list, and the test then asserts the list holds exactly one "Your code is 4821". Which double?',
    idea: DOUBLE_IDEA,
    steps: [
      DOUBLE_TABLE,
      'Its purpose is to check an indirect output of the SUT (the message it sent). That is the output family.',
      'It wraps no real SmsSender, so it is not a spy (a spy observes a REAL object). That leaves mock.',
      'Hand-written or Mockito does not matter: the role decides the kind.',
    ],
    answer: 'A mock object: it exists to check an indirect output of the SUT, and it wraps no real object, so it is not a spy.',
    mistake: 'Choosing stub because it is hand-written and simple. What matters is that the test checks what was recorded.',
    tryIt: { q: 'A hand-written EventBus replacement records published events, and the test asserts "OrderPlaced" was published once. Which double?', a: 'A mock: it checks an indirect output and wraps no real bus.' },
  };

  H['stx-cls-spy-cart'] = {
    asks: 'A test wraps a real ShoppingCart: the real add() and total() run, and afterwards the test checks add() was called twice. Which double?',
    idea: DOUBLE_IDEA,
    steps: [
      DOUBLE_TABLE,
      'It observes interactions (output family) AND the real methods run.',
      'Observing a real object is exactly what a spy is. A mock observes a fake object with no real behaviour.',
      { text: 'In Mockito:', code: 'ShoppingCart cart = spy(new ShoppingCart());\n// ... SUT uses cart ...\nverify(cart, times(2)).add(any());' },
    ],
    answer: 'A spy object: it observes the interactions of a real object.',
    mistake: 'Choosing mock because of the verify. Both verify; the real methods running is what makes it a spy.',
    tryIt: { q: 'A test wraps a real Logger so lines are still printed, and checks error() was called once. Which double?', a: 'A spy.' },
  };

  H['stx-cls-real-db'] = {
    asks: 'Instead of the production PostgreSQL server, the tests start an embedded in-memory SQL database that answers the same queries. Which double?',
    idea: DOUBLE_IDEA,
    steps: [
      DOUBLE_TABLE,
      'It really works (real SQL queries, real answers), just much more cheaply than a full server.',
      'That matches the slide\'s definition word for word: a lightweight implementation of a heavyweight process like a database.',
    ],
    answer: 'A fake object: a lightweight implementation of a heavyweight process (the database).',
    mistake: 'Thinking it is "not a double" because it is a real database engine. It still stands in for the production component.',
    tryIt: { q: 'Tests replace a cloud file storage service with a local folder that supports the same upload/download calls. Which double?', a: 'A fake: a lightweight working implementation.' },
  };
})(globalThis.FC = globalThis.FC || {});
