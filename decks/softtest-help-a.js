// "Help" walkthroughs for CSC 325 (Software Testing) cards, batch A: lectures 1, 2, 3 and
// the Kidwell paper. Same format as decks/csc370-help.js (math OFF: plain text, `backticks`
// for code words). Cards ending in -qN reuse their original card's entry.
(function (FC) {
  'use strict';
  const H = FC.help = FC.help || {};

  H['st1-bug-meaning'] = {
    asks: "Long before computers, engineers called a machine problem a “bug”. What were they trying to signal about the problem by choosing that word?",
    idea: "A bug is tiny: you find it, pick it out, and the machine works again. Calling a flaw a “bug” frames it as a small slip in an otherwise sound design, not as a failure of the whole idea. Edison used the word exactly this way, to reassure people that his inventions were nearly there.",
    steps: [
      "Picture an insect stuck in a machine: annoying, but small, and once removed the machine is fine.",
      "Engineers borrowed that picture: a “bug” is a small, manageable problem that can be easily corrected.",
      "The word also says what the problem is NOT: not a failure in the thinking or the design behind the machine.",
      "The first published reference is from 1889: Edison had been up two nights “discovering ‘a bug’ in his phonograph”.",
    ],
    answer: "That the problem was small and manageable, and could be easily corrected (a minor slip, not a flaw in the whole design).",
    mistake: "Answering with the 1947 moth story. The question is about what the word was meant to suggest, and that meaning is older than computers.",
    tryIt: { q: "A manager tells a nervous investor, “It’s just a bug, we’ll have it fixed by Friday.” In the old sense of the word, what impression is she trying to give?", a: "That the problem is small and easily corrected, not a sign that the product’s design is wrong." },
  };

  H['st1-allegedly'] = {
    asks: "The moth taped into the Harvard Mark II logbook in September 1947 is often called the first computer bug. Why does the lecture add “allegedly”?",
    idea: "The word came first and the moth came later. Engineers were already calling machine flaws “bugs” decades before 1947, so the operators who found a real insect in a relay were making a joke on an existing word, not inventing it.",
    steps: [
      "In September 1947, operators of the Harvard Mark II (a 23-tonne machine) found a moth stuck in it and taped it into the logbook.",
      "But “bug” already meant a machine flaw: the first published reference is from 1889, about Edison hunting “a bug” in his phonograph.",
      "So 1947 was the first ACTUAL insect found causing a fault, not the first use of the word. The logbook note was funny precisely because everyone already knew the term.",
      "Historians argued this out in the Annals of the History of Computing through the 1980s and 90s (Hopper 1981 up to Kidwell 1998).",
    ],
    answer: "Because the word “bug” for a machine flaw was already in use decades earlier (Edison, 1889). The 1947 moth was just the first real insect found causing a fault, which is why the logbook entry was a joke.",
    mistake: "Saying the moth is why we call errors “bugs”. It is the other way round: the existing word is why the moth was funny.",
    tryIt: { q: "Someone writes: “The term ‘computer bug’ was coined by Grace Hopper’s team in 1947.” What is wrong with that sentence?", a: "The term already existed: “bug” meant a machine flaw by 1889 (Edison). The 1947 team found a literal bug and joked about the old word; they did not coin it." },
  };

  H['st1-chromium-lesson'] = {
    asks: "Chromium gets about 167 bug reports a day and fixes about 72. What does that gap tell you about how testing must be done?",
    idea: "When problems arrive faster than you can fix them, you cannot do everything. Testing then has to be effective: aimed at the bugs that matter most, not an attempt to test and fix every possible thing.",
    steps: [
      { text: "Compare the two daily numbers:", table: { head: ["per day", "count"], rows: [["bugs reported", "167"], ["bugs fixed", "72"], ["left over", "95"]] } },
      "So even Google, with huge teams, falls further behind every day. There is not enough time and manpower to fix everything.",
      "If you can’t fix everything, you can’t test everything either. Testing must be effective and prioritised: find the bugs that matter, early.",
      "This is the same point the course comes back to: testing is always incomplete, so the goal is to make it effective.",
    ],
    answer: "Reports outpace fixes, so there is not enough time and manpower to fix everything. Testing has to be effective and prioritised, not exhaustive.",
    mistake: "Concluding that Google is careless or that more testing would close the gap. The lesson is about limits: resources are finite, so testing effort must be aimed.",
    tryIt: { q: "A small team gets 40 bug reports a week and can fix 15. What should their testing strategy focus on?", a: "Effectiveness and priority: testing (and fixing) the most important, most costly areas first, since they can never clear everything." },
  };

  H['st1-crowdstrike-cause'] = {
    asks: "In July 2024 a CrowdStrike update crashed Windows machines worldwide. What was the actual coding mistake?",
    idea: "The code trusted its input. It assumed every channel file had 21 fields and read field 21 without checking how many fields were really there. One missing bounds check, in C, where reading past an array is not caught for you.",
    steps: [
      "The program, written in C, expected each channel file to give an array of 21 fields.",
      "One channel file was in an older data format with only 20 fields.",
      "The code never checked the array’s length before reading, so it accessed the 21st field anyway.",
      "That is an out-of-bounds memory read, and it crashed the system.",
      "Cost: about $5.4 billion to the Fortune 500 companies affected, and a 20% drop in CrowdStrike’s stock.",
    ],
    answer: "The array length was not checked before access: 21 fields were expected but an older-format channel file had only 20, so reading the 21st field was an out-of-bounds read that crashed the system.",
    mistake: "Blaming the rollout or the missing tests. Those are process gaps that let the bug through; the coding mistake itself was the missing length check.",
    tryIt: { q: "A C function reads `fields[9]` from a parsed record, but some old records have only 8 fields. What is the bug, and what happens on an old record?", a: "No length check before access. On an 8-field record, `fields[9]` is out of bounds (even `fields[8]` would be), so the read goes past the array and may crash or return garbage." },
  };

  H['st1-crowdstrike-process'] = {
    asks: "The CrowdStrike update reached every customer at once. Which gap in the release process allowed that?",
    idea: "A bug in the code is one problem; the process decides how far it spreads. CrowdStrike had four gaps, each of which might have caught or contained the bug: unit tests only on the default path, no regression tests, manual tests only on valid data, and no staggered rollout.",
    steps: [
      { text: "The four gaps the lecture lists:", table: { head: ["gap", "what a fix would have done"], rows: [["unit tests only tested the default path", "a test on an unusual path could hit the 20-field case"], ["no regression tests run", "re-running the suite on the new version could catch the break"], ["manual tests used only valid data", "an invalid / old-format file would expose the crash"], ["no staggered rollout", "a small first wave would limit the damage"]] } },
      "The first three are about catching the bug before release. The last is about limiting harm if one slips through.",
      "A staggered rollout sends an update to a small group first, watches for trouble, then widens. CrowdStrike sent it to all customers simultaneously.",
    ],
    answer: "No staggered rollout: the update was distributed to all customers simultaneously.",
    mistake: "Naming a testing gap (like “no regression tests”) for this question. Those let the bug be released; the rollout gap is why it hit everyone at the same moment.",
    tryIt: { q: "A phone app team ships an update to 100% of users at once and it crashes on launch for everyone. What release practice would have limited the damage?", a: "A staggered (gradual) rollout: release to a small percentage first, watch for crashes, then expand." },
  };

  H['st1-crowdstrike-lesson'] = {
    asks: "The CrowdStrike bug cost billions. What point does the instructor make about it?",
    idea: "We tend to imagine expensive bugs as deep, clever, hard-to-find ones. CrowdStrike’s was a missing bounds check, about as simple as bugs get. Cost depends on where the bug lands, not how complicated it is, so ordinary careful testing matters.",
    steps: [
      "The mistake: reading the 21st field of an array that only had 20. One missing length check.",
      "The cost: about $5.4 billion to affected Fortune 500 companies, and a 20% stock drop for CrowdStrike.",
      "The instructor’s words: “This is a simple bug!” and “Bugs don’t need to be complicated to be costly!”",
      "Conclusion: correct testing is critical. A simple test with an old-format, invalid input would have caught it.",
    ],
    answer: "It was a simple bug (a missing bounds check), yet it cost billions: bugs don’t need to be complicated to be costly, so correct testing is critical.",
    mistake: "Treating it as an exotic security or concurrency problem. The whole point is how simple it was.",
    tryIt: { q: "A bank’s app shows the wrong balance because a loop starts at index 1 instead of 0, and thousands of customers panic. Which CrowdStrike lesson does this echo?", a: "Bugs don’t need to be complicated to be costly: a one-character mistake can do huge damage, so correct testing is critical." },
  };

  H['st1-crowdstrike-apply'] = {
    asks: "The parser expects 21 fields. Design the one test input that would have exposed the 2024 crash, and say what the test should expect.",
    idea: "Bugs hide where the code’s assumptions break. The code assumed 21 fields, so the test to write is one that breaks that assumption: a file with fewer fields. CrowdStrike’s tests only used valid data and only the default path, so nobody ever fed it the bad case.",
    steps: [
      "Find the assumption: “every channel file has 21 fields”.",
      "Find a real input that breaks it: the older format, which has 20 fields.",
      "Write the test: give the parser a 20-field old-format channel file.",
      "Set the expected result: graceful rejection (an error or a skip), never a read of the 21st field or a crash.",
      "Keep the test in the suite as a regression test, so old formats are checked every release.",
    ],
    answer: "An old-format channel file with only 20 fields, expecting the parser to reject it gracefully instead of reading a 21st field.",
    mistake: "Proposing another valid 21-field file, or “more tests” in general. Valid data is exactly what their manual tests already used; the crash needs the invalid, short input.",
    tryIt: { q: "A CSV importer expects 5 columns per row and reads `row[4]` directly. What test input would expose a crash, and what should the test expect?", a: "A row with only 4 columns (say from an old export). Expect a clear error or the row being skipped, not an out-of-bounds read." },
  };

  H['st1-mythos'] = {
    asks: "VulnCheck checked 1,061 vulnerabilities found with AI help (Anthropic’s Project Glasswing) and confirmed only 14 as exploitable in the wild. What does that show?",
    idea: "A vulnerability is a weakness; an exploit is a way to actually use it to do harm. Lots of weaknesses can’t be reached or used in practice. So “AI finds many vulnerabilities” is a different claim from “AI makes hacking much easier”, and the source of each claim matters too.",
    steps: [
      { text: "The numbers:", table: { head: ["", "count"], rows: [["AI-assisted vulnerability discoveries", "1,061"], ["confirmed exploitable in the wild", "14"], ["share exploitable", "about 1.3%"]] } },
      "AI does find a lot of bugs and vulnerabilities. But vulnerabilities cannot always be exploited.",
      "So finding a vulnerability is not the same as being able to exploit it.",
      "Read the critique carefully as well: VulnCheck is a cybersecurity company (founded 2021) in roughly the same market as Anthropic. Consider the source.",
    ],
    answer: "Finding a vulnerability is not the same as being able to exploit it.",
    mistake: "Concluding that the AI findings were fake or useless. They were real vulnerabilities; most just weren’t shown to be exploitable.",
    tryIt: { q: "A scanner reports 500 “critical” issues in your web app, and a pentester can actually break in through 3 of them. What is the general lesson?", a: "A reported vulnerability is not automatically exploitable; only a few may be usable in practice, so found does not equal exploitable." },
  };

  H['st1-reliability-beyond'] = {
    asks: "The lecture says software reliability is “not JUST software testing”. Name the three other things it lists that make software reliable.",
    idea: "Testing finds problems after they are built. Reliable software also comes from making problems less likely and code easier to check in the first place: keep complexity under control, design and refactor well, and document it.",
    steps: [
      "Software complexity management: code that is too complex can’t be understood or tested well.",
      "Refactoring and good design: cleaner structure means fewer places for bugs and easier tests.",
      "Documentation: people can only check behaviour they know is intended.",
      "The lecture’s summary: we need dependable and testable software, and with AI generating more code faster, this matters even more.",
    ],
    answer: "Software complexity management; refactoring and good design; documentation.",
    mistake: "Listing other V&V techniques (code inspection, static analysis). Those are ways of checking; this list is about building software that is reliable and testable.",
    tryIt: { q: "A team’s tests pass, but a single 3,000-line function keeps producing new bugs every release. Which non-testing reliability activities from the list would help most?", a: "Complexity management and refactoring / good design: break the function up so it can be understood and tested properly (and document what each part should do)." },
  };

  H['st1-verification'] = {
    asks: "Give the slogan question for verification and say what it checks the software against.",
    idea: "V&V is two different comparisons. Verification compares the software to its specification: did we build what the spec says? Validation compares it to what the user really needs: is the spec itself the right thing? Both serve one goal: software that meets the user’s needs.",
    steps: [
      { text: "The two halves side by side:", table: { head: ["", "slogan", "checks against"], rows: [["Verification", "Are we building the product right?", "the specification"], ["Validation", "Are we building the right product?", "what the user really requires"]] } },
      "Verification: “The software should conform to its specifications.”",
      "Memory hook: verification has the product “right” at the end (built correctly); validation has the “right product” (the correct thing).",
      "A program can pass verification and still fail validation, if the spec misunderstood the user.",
    ],
    answer: "“Are we building the product right?”: the software should conform to its specification.",
    mistake: "Swapping the two slogans. Verification is about the product being built right (matches the spec), not about it being the right product.",
    tryIt: { q: "A tester checks that the login page locks an account after exactly 5 failed attempts, as the spec says. Is that verification or validation?", a: "Verification: it checks the software against its specification." },
  };

  H['st1-validation'] = {
    asks: "Give the slogan question for validation and say what it checks the software against.",
    idea: "Verification asks whether the software matches its spec. Validation steps back and asks whether it does what the user really needs. A spec can be followed perfectly and still be the wrong thing to build.",
    steps: [
      { text: "The two halves side by side:", table: { head: ["", "slogan", "checks against"], rows: [["Verification", "Are we building the product right?", "the specification"], ["Validation", "Are we building the right product?", "what the user really requires"]] } },
      "Validation: “The software should do what the user really requires.”",
      "Memory hook: validation is the “right product”, the thing users actually want.",
      "Both serve one V&V goal: assure the software meets the user’s needs.",
    ],
    answer: "“Are we building the right product?”: the software should do what the user really requires.",
    mistake: "Defining validation as “checking the code against the requirements document”. That is verification; validation checks against the user’s real needs.",
    tryIt: { q: "Before building, a team shows paper sketches of a checkout flow to real shoppers to see if it fits how they buy. Verification or validation?", a: "Validation: it checks whether this is the right product for what users really require." },
  };

  H['st1-vv-scenario'] = {
    asks: "A booking app passes every test written from its specification, yet shop owners say it doesn’t solve their scheduling problem. Which of the listed things has it failed?",
    idea: "Ask what each part of the story is compared with. Tests written from the spec compare software to the spec: that is verification, and it passed. The owners compare it to their real need: that is validation, and it failed.",
    steps: [
      "Passing every spec-based test means the app conforms to its specification. Verification passes.",
      "Users saying it doesn’t solve their problem means it doesn’t do what they really require. That is validation.",
      "So the spec itself was wrong or incomplete; the app was built right, but it is not the right product.",
      "The other options don’t fit: fault avoidance is about preventing faults in the code, and regression testing is re-running old tests on a new version.",
    ],
    answer: "Validation: it conforms to the spec (verification passes) but isn’t what users really require.",
    mistake: "Picking verification because “the app failed”. The tests from the spec all passed, so verification is the half that succeeded.",
    tryIt: { q: "A calculator app has a bug: the spec says 2 + 2 = 4, but the app shows 5. Users had asked for exactly this calculator. Which part of V&V fails?", a: "Verification: the software does not conform to its (correct) specification." },
  };

  H['st1-vv-goal'] = {
    asks: "Verification and validation are two checks. What single goal do they both serve?",
    idea: "Verification makes sure the software matches the spec; validation makes sure the spec matches the user. Put them together and you get the one thing that matters: software that meets the user’s needs.",
    steps: [
      "Verification: “Are we building the product right?” (conforms to the specification).",
      "Validation: “Are we building the right product?” (does what the user really requires).",
      "Chain them: software → spec → user. If both links hold, the software meets the user’s needs.",
      "Goal, as the lecture states it: assure the software meets user’s needs.",
    ],
    answer: "To assure the software meets the user’s needs.",
    mistake: "Answering “to find bugs” or “to match the spec”. Finding bugs is a means, and matching the spec is only verification; the goal is meeting user needs.",
    tryIt: { q: "A team says, “All our V&V passed, the code matches the spec exactly.” What V&V question have they possibly skipped?", a: "Validation: whether the spec reflects what users really require. Matching the spec alone does not assure the software meets user needs." },
  };

  H['st1-right-software'] = {
    asks: "To get software “right”, what does the lecture say you must do with the requirements?",
    idea: "Getting software right has two parts. First, the requirements: understand them, and validate that they are really what users need. Second, checking: apply several V&V techniques, all the way through development, using whatever works best.",
    steps: [
      "Requirements: you need to understand and validate them (covered in AUCSC 220).",
      "Checking: apply multiple V&V techniques throughout the development cycle, not one technique at the end.",
      "The techniques listed: code inspection, design discussions, static analysis, testing, runtime verification, AI, etc.",
      "“Technology doesn’t matter, we use whatever is best.” Testing is one technique among several.",
    ],
    answer: "Understand them and validate them.",
    mistake: "Answering “test them”. Requirements are understood and validated; testing is applied to the software.",
    tryIt: { q: "A team plans to write all the code first and run one big round of testing at the end. Which part of “getting software right” are they ignoring?", a: "Applying multiple V&V techniques throughout the development cycle (inspection, design discussions, static analysis, testing, …), not a single technique at the end." },
  };

  H['st1-vv-static'] = {
    asks: "From the lecture’s list of V&V techniques, pick the three that check code or design WITHOUT running the program.",
    idea: "Sort the list by one question: does the program have to run? Inspection, design discussions and static analysis look at code or design on paper (or in a tool) and never execute it. Testing and runtime verification only work while the program runs.",
    steps: [
      { text: "Sort the list by whether the program runs:", table: { head: ["technique", "program runs?"], rows: [["Code inspection", "no: people read the code"], ["Design discussions", "no: people discuss the design"], ["Static analysis", "no: a tool analyses the code"], ["Testing", "yes"], ["Runtime verification", "yes"]] } },
      "“AI” is also on the list; it can be used either way, so it doesn’t belong cleanly in either group.",
      "Static techniques can check code early, before it can even run. Running techniques see real behaviour.",
    ],
    answer: "Code inspection, design discussions, and static analysis.",
    mistake: "Including runtime verification because it sounds like “verification”, which feels static. It checks properties while the program runs.",
    tryIt: { q: "A linter flags an unused variable, and a profiler measures that a function takes 2 seconds. Which one is static and which needs the program to run?", a: "The linter is static (analyses code without running it); the profiler needs the program to run." },
  };

  H['st1-vv-runtime-mc'] = {
    asks: "Which V&V technique on the list checks properties while the program is actually running, but is not testing?",
    idea: "Split the list by whether the program runs. Only two techniques run it: testing, and runtime verification. Since the answer can’t be testing, it is runtime verification, which watches a running program and checks properties as it goes.",
    steps: [
      "Static analysis analyses the code without running it.",
      "Code inspection is people reading code; design discussions are people talking through the design. Neither runs anything.",
      "Testing runs the program, but the question excludes it.",
      "That leaves runtime verification: checking properties during real execution.",
    ],
    answer: "Runtime verification.",
    mistake: "Picking static program analysis because it is a tool that “checks properties”. Static means it never runs the program.",
    tryIt: { q: "Which of these does NOT need the program to run: testing, runtime verification, code inspection?", a: "Code inspection: people read the code; nothing is executed." },
  };

  H['st1-why-testing'] = {
    asks: "Why does the course focus on testing instead of other V&V techniques? What can only testing check?",
    idea: "Other techniques look at parts: a function, a design, a file. Testing runs the real thing, so it is the only defect-detection technique that can check the whole system working together. The course gives four reasons in all.",
    steps: [
      { text: "The four reasons to focus on testing:", table: { head: ["reason", "why"], rows: [["checks the whole system", "the only defect-detection technique that can"], ["best for some behaviours, e.g. performance", "algorithm analysis is complex and not scalable; AI is not accurate at it"], ["documents expected behaviour", "the tests show what the system should do"], ["needed for acceptance / certification", "customers must “accept” contract software; airplanes, medical devices, app stores (Nintendo LotCheck)"]] } },
      "But testing is always incomplete, so the goal is to make it effective.",
    ],
    answer: "Testing is the only defect-detection technique that can check the whole system.",
    mistake: "Answering “it proves the program is correct”. Testing never does that; it is always incomplete.",
    tryIt: { q: "A team says careful code review of each module is enough for their online store. What can testing check that reviewing modules one at a time cannot?", a: "The whole system: only testing runs all the parts together (checkout, payment, stock) and sees how they actually behave." },
  };

  H['st1-incomplete'] = {
    asks: "For a two-line Python `add_numbers(a, b)`, list everything a COMPLETE test would have to cover.",
    idea: "A function’s behaviour depends on its inputs AND on everything around it: the hardware, the OS, the Python version, the environment, even being interrupted. Even for a + b, that space is effectively infinite. So complete testing is impossible, and the real goal is effective testing.",
    steps: [
      { text: "The program:", code: "# Function to add two numbers\ndef add_numbers(a, b):\n  return a + b" },
      "Inputs: all numbers, and in fact all possible inputs (Python will also try to “add” strings, lists, and so on).",
      "Platforms: all possible hardware, all operating systems, all Python versions.",
      "Environments: many different ones (does anything change if it runs in space?), and an unexpected shutdown in the middle.",
      "Each list is huge on its own, and every combination counts. No one can run all of that, so testing is always incomplete.",
    ],
    answer: "Every possible input (all numbers, all values); on every hardware, OS and Python version; in every environment (even in space); and under unexpected shutdown. That is impossible, so testing is always incomplete.",
    mistake: "Listing only inputs. The slide’s point is that the platform and environment multiply the space too.",
    tryIt: { q: "What would a complete test of `def is_even(n): return n % 2 == 0` require? Name three dimensions.", a: "All possible inputs (every integer, plus non-integers), every platform (hardware, OS, Python version), and every environment, including interruption. Impossible, so testing is incomplete." },
  };

  H['st1-correctness-ambiguous'] = {
    asks: "The same three lines print True in one place and False in another. Explain why, and say what this shows about testing.",
    idea: "A test needs an expected output to compare against. Here, even the “correct” output depends on where you run the code. `is` asks “are these the same object?”, and whether Python makes one object or two depends on how the code is run.",
    steps: [
      { text: "The program:", code: "a = 257\nb = 257\nprint(a is b)" },
      "`==` asks whether two values are equal. `is` asks whether two names point to the very same object in memory (identity).",
      "Run as a script, Python compiles the whole file at once, and both 257 literals become one shared constant object. `a is b` gives True.",
      "Typed line by line in a shell, each line is compiled separately. 257 is outside Python’s small-int cache (−5 to 256), so each line makes a new object. `a is b` gives False.",
      { text: "What you see:", table: { head: ["how it runs", "objects", "prints"], rows: [["as a script", "one shared 257", "True"], ["shell, line by line", "two separate 257s", "False"], ["either, with 256 instead", "one cached 256", "True"]] } },
      "Lesson: correctness is ambiguous. If even the expected output depends on the environment, a test can’t just assume one “right” answer.",
    ],
    answer: "`is` tests identity, not equality. As a script both 257s become one shared constant object, so True; typed line by line in a shell, 257 is outside the small-int cache (−5 to 256), so two objects are made, so False. Point: correctness is ambiguous; even the expected output depends on the environment.",
    mistake: "Saying 257 is just “too big to compare”. The values are equal (`a == b` is always True); only identity changes, and only with how the code is run.",
    tryIt: { q: "In a Python shell, typed line by line: `x = 100`, `y = 100`, `print(x is y)`. What prints, and why?", a: "True: 100 is inside the small-int cache (−5 to 256), so both names point to the same cached object." },
  };

  H['st1-opt-pess-def'] = {
    asks: "What kind of mistake can a PESSIMISTIC analysis technique make?",
    idea: "No technique can perfectly verify every property, so each one leans toward a safe side. Pessimistic techniques assume the worst: when unsure, they flag the code, so they may reject a correct program (a false alarm). Optimistic techniques, like testing, assume the best: if the tests pass, they accept, so they may let a faulty program through.",
    steps: [
      "Perfect verification of any property sits in the middle of the lecture’s chart, and it is unattainable.",
      { text: "The two sides:", table: { head: ["side", "examples", "can wrongly…"], rows: [["Pessimistic", "linting, model checking, theorem proving, type checking", "reject a correct program (false alarm)"], ["Optimistic", "typical testing, coverage testing, tool-assisted testing", "accept a faulty program (missed bug)"]] } },
      "Example: a type checker refuses code that would never actually fail at runtime. Safe, but a false alarm.",
    ],
    answer: "It may reject (flag) a correct program: a false alarm, to be safe.",
    mistake: "Mixing up the two. Pessimistic = rejects good programs; optimistic = accepts bad ones.",
    tryIt: { q: "A linter warns “possible null dereference” on a line where the value can never actually be null. Is that the typical mistake of an optimistic or a pessimistic technique?", a: "Pessimistic: it rejected (flagged) correct code, a false alarm." },
  };

  H['st1-optimistic-meaning'] = {
    asks: "Testing is called an OPTIMISTIC technique. What does that mean, in terms of the mistake it can make?",
    idea: "Testing samples a few behaviours and, if they are right, assumes the program is fine. That is optimism: inputs you didn’t try might still fail, so a faulty program can be accepted. Pessimistic techniques make the opposite mistake: rejecting correct programs.",
    steps: [
      "A passing test shows the program was right for the inputs you tried, nothing more.",
      "Untested inputs may still fail, so testing may accept a faulty program.",
      "“It may reject a correct program” is the pessimistic mistake (linting, model checking).",
      "“It proves no faults” is false: testing never proves the absence of faults. “It needs no oracle” is false too: every test needs an expected result.",
    ],
    answer: "It may accept a faulty program.",
    mistake: "Thinking optimistic means “positive about finding bugs”. It means it gives the program the benefit of the doubt.",
    tryIt: { q: "A function passes all 20 tests, but crashes in production on an empty list, which no test used. Which property of testing does this show?", a: "Testing is optimistic: it accepted a faulty program because the failing input was never tried." },
  };

  H['st1-opt-pess-order'] = {
    asks: "Order five techniques from most pessimistic to most optimistic, as they sit left-to-right on the lecture’s chart.",
    idea: "The chart is a line from pessimistic (left) to optimistic (right), with unattainable perfect verification in the middle. Analysis techniques sit on the pessimistic side. Testing techniques sit on the optimistic side, and the more tools and coverage you add, the closer testing moves toward the middle.",
    steps: [
      "Far left: simplistic program analysis (linting), which flags a lot to be safe.",
      "Further in, still pessimistic: model checking (theorem proving sits nearer the middle).",
      "Across the middle, testing starts: tool-assisted testing is the least optimistic testing.",
      "Then coverage testing, and at the far right typical testing, which trusts a few passing tests.",
      { text: "Left to right:", table: { head: ["position", "technique", "side"], rows: [["1", "Simplistic program analysis (linting)", "pessimistic"], ["2", "Model checking", "pessimistic"], ["3", "Tool-assisted testing", "optimistic"], ["4", "Coverage testing", "optimistic"], ["5", "Typical testing", "optimistic"]] } },
    ],
    answer: "Simplistic program analysis (linting), model checking, tool-assisted testing, coverage testing, typical testing.",
    mistake: "Putting coverage testing as most optimistic. Measuring coverage makes testing more careful, so it sits left of plain typical testing.",
    tryIt: { q: "Which is more optimistic: coverage testing or tool-assisted testing? And which side is model checking on?", a: "Coverage testing is more optimistic (further right) than tool-assisted testing. Model checking is on the pessimistic side." },
  };

  H['st1-fault-def'] = {
    asks: 'Give the definition of a fault: what kind of thing it is and where it lives.',
    idea: 'Three words, three places. A fault lives in the code (static, there even when nothing runs). An error lives in the running program\'s memory (a wrong internal state). A failure lives outside the program, where a user or tester can see it (wrong behaviour compared with the requirements). Each one can cause the next, but none of them has to.',
    steps: [
      'Ask "does it need the program to be running?" A fault does not: you can point at it in the source file with the program switched off.',
      'In `numZero`, the line `for (int i = 1; ...)` is the fault. It is wrong in the code whether you run it zero times or a million times.',
      { text: 'Compare the three side by side:', table: { head: ['term', 'where it lives', 'needs a run?'], rows: [['fault', 'the code (static)', 'no'], ['error', 'internal state at runtime', 'yes'], ['failure', 'external, visible behaviour', 'yes']] } },
    ],
    answer: 'A fault is a static defect in the software: it exists in the code itself, not at runtime.',
    mistake: 'Calling the wrong output "the fault". The wrong output is the failure; the fault is the defective line of code that (sometimes) leads to it.',
    tryIt: { q: 'A function that should return the larger of two numbers is written `return a < b ? a : b;`. Which part is the fault?', a: 'The expression `a < b ? a : b` (it returns the smaller one). It is a fault because it is a defect sitting in the code, run or not.' },
  };

  H['st1-error-def'] = {
    asks: 'Give the definition of an error in the fault / error / failure vocabulary.',
    idea: 'Three words, three places. A fault lives in the code (static). An error lives inside the running program: some variable or state is not what it should be. A failure is what shows on the outside. The error is the middle link: the fault has "gone live" in memory, but nobody outside may ever see it.',
    steps: [
      'An error only exists while the program runs: it is a state, like "i holds 1 when it should hold 0".',
      'It is caused by a fault: the wrong state is how the fault shows up at runtime (its manifestation).',
      'An error can stay hidden. In `numZero([2, 7, 0])`, i is wrong on the first iteration, yet the method still returns the right answer, 1.',
    ],
    answer: 'An error is an incorrect internal state that is the manifestation of some fault, at runtime.',
    mistake: 'Using "error" in its everyday sense (any mistake, or an exception message). In this course it means one precise thing: a wrong internal state while running.',
    tryIt: { q: 'A loop meant to sum a list starts with `total = 1` instead of `total = 0`. While it runs, what is the error?', a: 'total holds 1 when it should hold 0 (and stays 1 too high after every step). That wrong internal value is the error; the `total = 1` line is the fault.' },
  };

  H['st1-failure-def'] = {
    asks: 'Give the definition of a failure in the fault / error / failure vocabulary.',
    idea: 'Three words, three places. A fault lives in the code, an error lives in the running program\'s state, and a failure is what reaches the outside: behaviour a user or tester can see that disagrees with the requirements (or whatever describes the expected behaviour). Tests catch failures; finding the fault behind one is debugging.',
    steps: [
      'A failure is external: a wrong return value, wrong screen, crash or wrong file, seen from outside the code.',
      '"Wrong" is judged against a description of expected behaviour, usually the requirements or spec.',
      'In `numZero([0, 2, 7])` the method returns 0 when the spec says 1. That visible wrong result is the failure.',
    ],
    answer: 'A failure is external, incorrect behaviour with respect to the requirements or other description of the expected behaviour.',
    mistake: 'Thinking every fault causes a failure. A fault can sit in the code, even cause an error, and still never show up as a failure on a given input.',
    tryIt: { q: 'A calculator app shows 2 + 2 = 5 on screen. Is that a fault, an error or a failure?', a: 'A failure: it is wrong behaviour visible from the outside. The fault is somewhere in the code; the error is whatever wrong value was computed inside.' },
  };

  H['st1-fef-order'] = {
    asks: 'Put fault, error and failure in the order one causes the next.',
    idea: 'A defect starts in the code, turns into bad state when that code runs, and only then can leak out as bad behaviour. Each step is a gate that might not open: the fault has to run and corrupt state, and the bad state has to reach the output.',
    steps: [
      'Fault first: the defect is in the code before anything runs.',
      'Error next: when the faulty code executes (on the right input), the internal state becomes wrong.',
      'Failure last: if the wrong state propagates to the output, the outside world sees incorrect behaviour.',
      { text: 'Each link can break, as in `numZero`:', table: { head: ['input', 'fault?', 'error?', 'failure?'], rows: [['[2, 7, 0]', 'yes', 'yes', 'no'], ['[0, 2, 7]', 'yes', 'yes', 'yes']] } },
    ],
    answer: 'Fault (static defect in the code) → Error (incorrect internal state when the fault executes) → Failure (incorrect external behaviour).',
    mistake: 'Putting error before fault because "error" sounds like the programmer\'s mistake. Here error means the runtime state, which can only exist after a fault is in the code.',
    tryIt: { q: 'A login check uses `>` where the spec needs `>=`. Order these: (a) the user at exactly the limit is locked out, (b) the comparison yields false when it should be true, (c) the `>` in the source.', a: '(c) fault → (b) error → (a) failure.' },
  };

  H['st1-fef-classify-1'] = {
    asks: 'The source line `int i = 1` should be `int i = 0`. Is that line a fault, an error or a failure?',
    idea: 'Sort by where the thing lives: in the code (fault), in the running state (error), or in visible behaviour (failure). A line of source code is in the code, so it can only be a fault.',
    steps: [
      'Ask: does this exist with the program switched off? A line in the source file does.',
      'Something that exists without running is static, and a static defect is a fault.',
      'It is not an error (that would be the wrong value of i during a run) and not a failure (that would be a wrong result someone sees).',
    ],
    answer: 'A fault: it is a static defect in the code, present even when nothing runs.',
    mistake: 'Calling it an error because the programmer "made an error". In this vocabulary, error means a wrong runtime state, not the programmer\'s slip.',
    tryIt: { q: 'A method that should return the last element of an array uses `arr[arr.length]`. Fault, error or failure?', a: 'Fault: the defective expression sits in the code. (Running it would then throw an exception, which is a failure.)' },
  };

  H['st1-fef-classify-2'] = {
    asks: 'During a run of `numZero`, i holds 1 on the first iteration instead of 0. Is that a fault, an error or a failure?',
    idea: 'Sort by where the thing lives: in the code (fault), in the running state (error), or in visible behaviour (failure). A variable holding a wrong value is state inside a running program, so it is an error.',
    steps: [
      'Ask: does this need the program running? Yes: i only has a value during a run.',
      'Is it visible from outside? No: i is a local variable inside the method.',
      'Wrong, internal, at runtime, caused by the fault `int i = 1`: that is the definition of an error.',
    ],
    answer: 'An error: an incorrect internal state that manifests the fault.',
    mistake: 'Calling it a failure because something "went wrong". A failure must be external behaviour; a wrong local variable is internal, and may never reach the output at all.',
    tryIt: { q: 'A sorting method, while running, has its array as [1, 5, 3] after the step where it should already be [1, 3, 5]; the final output is still sorted correctly. Fault, error or failure?', a: 'An error (wrong internal state during the run). There is no failure, because the final output is correct.' },
  };

  H['st1-fef-classify-3'] = {
    asks: 'A tester calls `numZero([0, 2, 7])`, expects 1 and gets 0. Is the wrong return value a fault, an error or a failure?',
    idea: 'Sort by where the thing lives: in the code (fault), in the running state (error), or in visible behaviour (failure). A return value the tester can check against the spec is visible behaviour, so it is a failure.',
    steps: [
      'The tester sees the value from outside the method, so it is external behaviour.',
      'The spec says "return the number of occurrences of 0", which is 1 for [0, 2, 7]. Getting 0 contradicts it.',
      'External and incorrect with respect to the expected behaviour: that is a failure. (Behind it: the fault `int i = 1`, and the errors i = 1 and count staying 0.)',
    ],
    answer: 'A failure: it is external, observable behaviour that contradicts the specification.',
    mistake: 'Answering "error" because the number is wrong. Wrong values only count as errors while they are internal; once they come out of the program, the result is a failure.',
    tryIt: { q: 'A web page shows a user\'s age as -3. Fault, error or failure?', a: 'A failure: wrong behaviour visible from outside. The fault is a defect somewhere in the code that computes the age.' },
  };

  H['st1-numzero-fault'] = {
    asks: 'Point at the defective line in `numZero` and say what is wrong with it.',
    idea: 'To find a fault, compare what the code does with what the spec promises, especially at the edges. The spec says "count the zeros in arr", which means every index from 0 to length - 1. Check whether the loop really visits the first and last index.',
    steps: [
      'Spec: return the number of 0s in arr. So every element must be examined.',
      'Java arrays start at index 0, so the loop should cover i = 0, 1, ..., arr.length - 1.',
      'The loop starts at `int i = 1`, so arr[0] is never looked at. The end, `i < arr.length`, is correct.',
      { text: 'The fix is one character:', code: 'for (int i = 0; i < arr.length; i++)' },
    ],
    answer: 'The loop starts at `int i = 1`, so it never examines arr[0]. Fix: start at i = 0.',
    mistake: 'Blaming the end condition (`i < arr.length` versus `<=`). That part is right: `<=` would read past the end and throw an exception.',
    tryIt: { q: 'Where is the fault?', code: 'def count_evens(xs):\n    n = 0\n    for i in range(1, len(xs)):\n        if xs[i] % 2 == 0:\n            n += 1\n    return n', a: '`range(1, len(xs))` starts at index 1, so xs[0] is never checked. Fix: `range(len(xs))`. For example count_evens([4, 3, 5]) returns 0 instead of 1.' },
  };

  H['st1-numzero-test1'] = {
    asks: 'Run `numZero([2, 7, 0])` by hand. Say what it returns, whether an error happens, whether a failure happens, and why.',
    idea: 'An error and a failure are separate questions. The fault runs on every input, so i is wrong on every run (an error each time). A failure only happens when that wrong state changes the output, and here it only matters if arr[0] is a zero.',
    steps: [
      { text: 'Trace it. The loop starts at i = 1, so arr[0] = 2 is skipped:', table: { head: ['i', 'arr[i]', 'count after'], rows: [['1', '7', '0'], ['2', '0', '1'], ['(i = 3, stop)', '', 'return 1']] } },
      'Expected 1 (one zero in [2, 7, 0]); actual 1. The test passes.',
      'Error? Yes: on the first iteration i is 1 when it should be 0. That wrong state is there on this run.',
      'Failure? No: the only element skipped is arr[0] = 2, which is not a zero, so count ends up right anyway.',
    ],
    answer: 'It returns 1, which is correct. There is an error (i is 1, not 0, on the first iteration) but no failure, because the skipped element arr[0] = 2 is not a zero, so the error never reaches the output.',
    mistake: 'Concluding "the test passed, so the code is fine". A passing test only shows this input did not fail; the fault ran and corrupted state the whole time.',
    tryIt: { q: 'Same buggy `numZero`. What does `numZero([3, 0, 0])` return, and is there an error? A failure?', a: 'It returns 2, which is correct. Error: yes (i starts at 1). Failure: no, because the skipped arr[0] = 3 is not a zero.' },
  };

  H['st1-numzero-test2'] = {
    asks: 'Trace `numZero([0, 2, 7])` with the faulty loop and give the number it returns.',
    idea: 'An error and a failure are separate questions. The fault (start at i = 1) runs on every input, but it only changes the result when the skipped element, arr[0], is a zero. Here it is, so the error spreads into count and out of the method.',
    steps: [
      { text: 'Trace it. arr[0] = 0 is skipped because the loop starts at i = 1:', table: { head: ['i', 'arr[i]', 'count after'], rows: [['1', '2', '0'], ['2', '7', '0'], ['(i = 3, stop)', '', 'return 0']] } },
      'Expected 1 (there is one zero); actual 0.',
      'Error: i is 1, not 0, on the first iteration, and the error propagates into count, which is 0 when it should be 1.',
      'Failure: the method returns 0, which contradicts the spec.',
    ],
    answer: '0. The one zero sits at arr[0], which the loop never reads, so count stays 0 and is returned: a failure.',
    mistake: 'Answering 1 by reading what the method should do instead of tracing what the code does. Always step through the loop exactly as written.',
    tryIt: { q: 'Same buggy `numZero`. What does `numZero([0, 0, 5])` return?', a: '1 (expected 2). arr[0] = 0 is skipped; only arr[1] = 0 is counted.' },
  };

  H['st1-numzero-expose'] = {
    asks: 'Describe exactly which input arrays make the faulty `numZero` give a wrong answer.',
    idea: 'A test reveals a fault only if three things happen: it reaches the faulty code, the code produces a wrong state, and that wrong state reaches the output. Every non-null array reaches the loop and gets i = 1, but the only element the bug hides is arr[0]. So the answer changes only when arr[0] is a zero.',
    steps: [
      'The loop skips exactly one element: arr[0]. Every other element is counted correctly.',
      'If arr[0] is not 0, skipping it loses nothing, so the result is still right.',
      'If arr[0] is 0, that zero is lost, so the result is 1 too low: a failure.',
      { text: 'Check against some inputs:', table: { head: ['input', 'returned', 'expected', 'failure?'], rows: [['[2, 7, 0]', '1', '1', 'no'], ['[]', '0', '0', 'no'], ['[0, 2, 7]', '0', '1', 'yes'], ['[0]', '0', '1', 'yes']] } },
    ],
    answer: 'arr[0] must be 0, since that is the one element the loop skips. Smallest example: [0], expected 1, actual 0.',
    mistake: 'Saying "any array containing a 0". [2, 7, 0] contains a zero and still passes; the zero must be in the first slot.',
    tryIt: { q: 'A method meant to return the maximum of a non-empty list starts with `best = 0`. Which lists make it fail?', a: 'Lists where every element is negative, for example [-5, -2]: it returns 0 instead of -2. Any list with an element of 0 or more is answered correctly.' },
  };

  H['st1-bug-term'] = {
    asks: 'Explain why testers avoid the word "bug" when they need to be precise.',
    idea: 'Fault, error and failure are three different things in three different places (code, runtime state, visible behaviour). "Bug" squashes them into one word, so a sentence like "I found a bug" does not say which one you found, and often the speaker does not know either.',
    steps: [
      '"Bug" is informal. People use it for the wrong line of code (fault), a bad value while running (error), and a wrong result on screen (failure).',
      'Those need different actions: a failure is reported and reproduced, an error is tracked down in a debugger, a fault is fixed in the code.',
      'So when precision matters, say fault, error or failure.',
    ],
    answer: 'It is informal: "bug" can mean a fault, an error or a failure, and often the speaker does not know which.',
    mistake: 'Treating "bug" as a fourth, separate term. It is not a category of its own; it is a loose word that could mean any of the three.',
    tryIt: { q: 'A user writes: "There is a bug: the total on my receipt is wrong." Which of the three is the user actually describing?', a: 'A failure: they see wrong external behaviour. The fault and errors behind it are in the code and unknown to them.' },
  };

  H['stx-cls-adult-18'] = {
    asks: 'The code uses `>` where the spec needs "18 or more". Called with 18, it returns False. Classify the run: error and failure, error only, fault reached with no error, or fault not run.',
    idea: 'Ask three questions in order. Did the run reach the faulty code? Did it make the state wrong (an error)? Did that wrong state reach the output (a failure)? Each answer can be no even when the one before is yes, and the four options are just the four places the chain can stop.',
    steps: [
      'Fault: `age > 18` should be `age >= 18`.',
      'Reached? Yes: every call runs the return line.',
      'Error? The faulty comparison gives 18 > 18 = False; the correct one gives 18 >= 18 = True. The state is wrong.',
      'Failure? That False is returned, and the spec says True. Wrong visible output.',
      { text: 'The chain for this run:', table: { head: ['reached', 'error', 'failure'], rows: [['yes', 'yes (False, should be True)', 'yes (returns False)']] } },
    ],
    answer: 'An error plus a failure: the faulty comparison gives False where True is correct, and that wrong value is returned.',
    mistake: 'Answering "no error" because False is a perfectly normal boolean value. An error means a value different from what the correct program would have at that point, not an odd-looking value.',
    tryIt: { q: 'Spec: return True when score is 50 or more. Code: `return score > 50`. Classify the call with score 50.', a: 'An error plus a failure: 50 > 50 is False where it should be True, and False is returned.' },
  };

  H['stx-cls-max-ok'] = {
    asks: 'The code starts `best` at 0 instead of the first element. `max_of([3, 9, 2])` returns 9, which is correct. Classify the run.',
    idea: 'Ask three questions in order. Did the run reach the faulty code? Did it make the state wrong (an error)? Did that wrong state reach the output (a failure)? A wrong state can be overwritten before the end, and then the output is still right.',
    steps: [
      'Fault: `best = 0`. A correct version starts best at the first element, 3.',
      'Reached and error? Yes: right after that line, best is 0 where the correct program has 3.',
      { text: 'Trace the loop:', table: { head: ['x', 'x > best?', 'best after'], rows: [['3', '3 > 0, yes', '3'], ['9', '9 > 3, yes', '9'], ['2', '2 > 9, no', '9']] } },
      'After the first element, best is 3, the same as in the correct program, so the error is gone. 9 is returned: no failure.',
    ],
    answer: 'An error but no failure: best wrongly starts at 0, but the first element replaces it, so the correct 9 comes out.',
    mistake: 'Answering "no error, fault reached" because the output is correct. Check the state right after the faulty line: 0 is not what the correct program has there, so there is an error.',
    tryIt: { q: 'Same code but for a minimum: `best = 0`, then `if x < best: best = x`. Classify `min_of([-3, 5])`, which returns -3.', a: 'An error but no failure: best starts at 0 instead of -3, but -3 < 0 replaces it at once, and -3 is the right answer.' },
  };

  H['stx-cls-area-22'] = {
    asks: 'The code returns `w + h` instead of `w * h`. `area(2, 2)` returns 4, which is correct. Classify the run.',
    idea: 'Ask three questions in order. Did the run reach the faulty code? Did it make the state wrong (an error)? Did that wrong state reach the output (a failure)? Reaching a fault is not enough: the input must also trigger it, meaning the faulty code computes something different from the correct code.',
    steps: [
      'Fault: `+` where the spec needs `*`.',
      'Reached? Yes: the only line runs on every call.',
      'Error? 2 + 2 = 4 and 2 × 2 = 4. The faulty expression produces exactly what the correct one would, so the state is not wrong.',
      'No error, so no failure is possible.',
      { text: 'Other inputs do trigger it:', table: { head: ['call', 'w + h', 'w × h', 'error?'], rows: [['area(2, 2)', '4', '4', 'no'], ['area(0, 0)', '0', '0', 'no'], ['area(3, 4)', '7', '12', 'yes, and a failure']] } },
    ],
    answer: 'No error, fault reached: the faulty line ran, but 2 + 2 equals 2 × 2, so the state matches the correct program.',
    mistake: 'Saying "error but no failure". There is no moment in this run where any value differs from the correct program, so there is no error at all.',
    tryIt: { q: 'Spec: return x squared. Code: `return x + x`. Classify the call with x = 2, and with x = 3.', a: 'x = 2: no error, fault reached (2 + 2 = 4 = 2 squared). x = 3: error plus failure (returns 6, should be 9).' },
  };

  H['stx-cls-vowels'] = {
    asks: 'The loop runs to `len(s) - 1`, so the last character is skipped. `count_vowels("hello")` returns 1. Classify the run.',
    idea: 'Ask three questions in order. Did the run reach the faulty code? Did it make the state wrong (an error)? Did that wrong state reach the output (a failure)? An off-by-one only hurts when the skipped element matters, here when the last letter is a vowel.',
    steps: [
      'Fault: `range(len(s) - 1)` should be `range(len(s))`.',
      'Reached? Yes, the loop runs.',
      'Error? The loop stops before index 4, so the final "o" is never examined and n misses it.',
      'Failure? "hello" has 2 vowels (e, o); the function returns 1. Wrong visible output.',
    ],
    answer: 'An error plus a failure: the last character "o" is skipped, so n is 1 instead of 2, and 1 is returned.',
    mistake: 'Not checking which character is skipped. With "hello" it is a vowel, so the error reaches the output; with a word ending in a consonant it would not.',
    tryIt: { q: 'Same `count_vowels`. Classify the call on "tea".', a: 'An error plus a failure: the final "a" is skipped, so it returns 1 instead of 2.' },
  };

  H['stx-cls-adult-30'] = {
    asks: 'The code uses `>` where the spec needs "18 or more". Called with 30, it returns True, which is correct. Classify the run.',
    idea: 'Ask three questions in order. Did the run reach the faulty code? Did it make the state wrong (an error)? Did that wrong state reach the output (a failure)? A wrong comparison operator only gives a different answer at the boundary; everywhere else the two operators agree.',
    steps: [
      'Fault: `age > 18` should be `age >= 18`.',
      'Reached? Yes, the return line runs.',
      'Error? 30 > 18 is True and 30 >= 18 is True. Same value, so no wrong state.',
      { text: '> and >= only disagree at 18:', table: { head: ['age', 'age > 18', 'age >= 18', 'error?'], rows: [['17', 'False', 'False', 'no'], ['18', 'False', 'True', 'yes'], ['30', 'True', 'True', 'no']] } },
    ],
    answer: 'No error, fault reached: the faulty comparison ran, but for 30 it gives the same True as the correct one.',
    mistake: 'Saying "error but no failure". Nothing in this run differs from the correct program, so there is no error. To catch this fault, a test must use exactly 18.',
    tryIt: { q: 'Spec: return True when score is 50 or more. Code: `return score > 50`. Classify the call with score 80.', a: 'No error, fault reached: 80 > 50 and 80 >= 50 are both True.' },
  };

  H['stx-cls-average'] = {
    asks: 'The code divides by `len(xs) + 1` instead of `len(xs)`. `average([0, 0])` returns 0.0, which is correct. Classify the run.',
    idea: 'Ask three questions in order. Did the run reach the faulty code? Did it make the state wrong (an error)? Did that wrong state reach the output (a failure)? A wrong intermediate value can be hidden by the rest of the computation, here because zero divided by anything is zero.',
    steps: [
      'Fault: `len(xs) + 1` should be `len(xs)`.',
      'Error? The divisor is 3 where the correct program has 2. That is a wrong internal value.',
      'Failure? sum is 0, and 0 / 3 = 0 / 2 = 0, so 0.0 is returned, matching the spec. No failure.',
      { text: 'A different input lets the error through:', table: { head: ['call', 'returned', 'correct', 'failure?'], rows: [['average([0, 0])', '0.0', '0.0', 'no'], ['average([2, 4])', '2.0', '3.0', 'yes']] } },
    ],
    answer: 'An error but no failure: the divisor is wrongly 3, but the sum is 0, so the result is 0 either way.',
    mistake: 'Answering "no error, fault reached" because the output is right. Look inside: the divisor really is wrong. Compare with area(2, 2), where no value ever differs.',
    tryIt: { q: 'Spec: return the total of a list. Code starts `t = 1` and adds each element. Classify `total([2, 3])`, which returns 6.', a: 'An error plus a failure: t starts 1 too high, stays 1 too high, and 6 is returned instead of 5.' },
  };

  H['stx-cls-max-neg'] = {
    asks: 'The code starts `best` at 0. `max_of([-5, -2])` returns 0. Classify the run.',
    idea: 'Ask three questions in order. Did the run reach the faulty code? Did it make the state wrong (an error)? Did that wrong state reach the output (a failure)? The starting value 0 is only overwritten by an element bigger than 0; if none exists, the wrong start survives to the end.',
    steps: [
      'Fault: `best = 0` instead of the first element.',
      'Error: right after that line best is 0, where the correct program has -5.',
      { text: 'Trace the loop:', table: { head: ['x', 'x > best?', 'best after'], rows: [['-5', '-5 > 0, no', '0'], ['-2', '-2 > 0, no', '0']] } },
      'Failure: 0 is returned, but the largest element is -2 (and 0 is not even in the list).',
    ],
    answer: 'An error plus a failure: best wrongly starts at 0, no element beats it, and 0 is returned instead of -2.',
    mistake: 'Testing max only with positive numbers. Those runs have the error but no failure; only an all-negative list exposes this fault.',
    tryIt: { q: 'Spec: return the absolute value of x. Code: `if x < 0: return x` then `return x`. Classify the call with x = 5, and with x = -3.', a: 'x = 5: no error, fault not run (the faulty `return x` inside the if is skipped). x = -3: error plus failure (returns -3 instead of 3).' },
  };

  H['st2-toyota-why'] = {
    asks: 'Toyota cars sped up on their own, and people died. Why did testing never catch the software faults behind it?',
    idea: 'Testability is something the code either has or lacks. If a piece of code is so tangled that nobody can set it up, drive it, and check it, then no amount of testing effort will find its bugs. Keeping code simple is part of making it reliable.',
    steps: [
      'In 2009 Toyota recalled 8 million cars: some accelerated even when the gas pedal was not touched. The bug is estimated to have killed 89 people worldwide.',
      'Analysis of the code found many faults: memory corruption, buffer overflow, unsafe casting and a race condition.',
      'The key finding was not one bad line. The most important acceleration code was so complex and poorly written that it was untestable.',
      'Untestable code hides its faults: you cannot reach the risky states on purpose, and you cannot tell from the outside whether the internal state went wrong.',
    ],
    answer: 'The critical acceleration code was so complex and poorly written that it could not be tested, so its faults stayed hidden.',
    mistake: 'Answering with one of the listed faults (race condition, buffer overflow). Those are what was wrong; the question is why nobody found them, and the answer is untestable complexity.',
    tryIt: { q: 'A team says "we will test it harder" about a 3000-line function with dozens of nested flags. Based on the Toyota lesson, what should they fix first?', a: 'The design: break the code into small, testable pieces. Effort cannot test code that is untestable by construction.' },
  };

  H['st2-why-hard'] = {
    asks: 'Explain why a program can pass all its tests and still be wrong.',
    idea: 'A test suite is a handful of samples from an enormous space of inputs and states. Sampling would be fine if nearby inputs behaved alike, but software does not work that way, so the untested cases tell you nothing.',
    steps: [
      'Even a two-line `add_numbers(a, b)` would need every number, every platform, every OS, every Python version and every environment to test completely. That is impossible.',
      'So testing only samples a set of possible behaviours.',
      'There is no sound basis for extrapolating from the tested cases to the untested ones, because software is discontinuous: one value can behave completely differently from its neighbours.',
      'To be sure, you would have to consider all possible states, and even small systems have trillions of them.',
    ],
    answer: 'Testing only samples behaviours; because software is discontinuous there is no sound basis to extrapolate from tested to untested cases, so you would need all possible states, and even small systems have trillions.',
    mistake: 'Stopping at "you cannot test everything". The full answer also says why sampling fails: discontinuity removes the basis for extrapolating.',
    tryIt: { q: 'A function passed 10,000 random tests. A colleague says that proves it is correct. What is wrong with that claim?', a: 'The tests are a sample, and software is discontinuous, so passing them gives no sound basis for the untested inputs; one untested value could still fail.' },
  };

  H['st2-discontinuous'] = {
    asks: 'Define "discontinuous" for software and use the bridge comparison to show why a few representative tests are not enough.',
    idea: 'Physical things change smoothly: a bit more weight means a bit more bending. That lets engineers test a few cases and fill in the gaps. Software can jump: one exact input can take a totally different path from the inputs right next to it.',
    steps: [
      'Physical world: if a bridge holds a 10-tonne truck, it will hold a 5-tonne one. Behaviour is continuous, so you can interpolate between tested cases.',
      'Software: OpenOffice printed fine six days a week but never on Tuesdays, because the text "Tue" triggered a special case.',
      'In bridge terms, that is a bridge that only breaks when a truck crosses on a Tuesday. No engineer would test for that, because physics does not behave that way.',
      'So passing nearby cases says nothing about untested ones. This is why exhaustive testing is needed for certainty, and why it is impossible.',
    ],
    answer: 'Physical systems are continuous (a bridge that holds 10 tonnes holds 5), so you can interpolate. Software is not: one specific input like "Tue" can behave completely differently from its neighbours, like a bridge that only breaks on Tuesdays.',
    mistake: 'Saying software is discontinuous because it "crashes suddenly". The point is about inputs: nearby inputs need not behave alike.',
    tryIt: { q: 'A tax program is correct for incomes of 49,999 and 50,001 dollars. Can you conclude it is correct for 50,000? Why?', a: 'No. Software is discontinuous: 50,000 might hit a special case (for example a wrong boundary check) that its neighbours never touch.' },
  };

  H['st2-openoffice'] = {
    asks: 'Explain the real cause behind the 2009 report "open office will never print on Tuesdays".',
    idea: 'A bug can depend on one exact piece of data that looks harmless. Here the date stamp in the print file accidentally looked like a different file type.',
    steps: [
      'Someone reported that OpenOffice would never print on Tuesdays. It sounded like a joke, but it was a real bug.',
      'The file sent to the printer contained the date, and on Tuesdays that included the text "Tue".',
      'The printer driver guessed file types by looking at the content, and "Tue" made it think the file was an Erlang JAM file (Erlang is a programming language; JAM was a virtual machine).',
      'So the driver ignored the job, and nothing printed. Every other day abbreviation was fine.',
      'This shows discontinuity: one specific value behaves completely differently from its neighbours.',
    ],
    answer: 'The print file contained "Tue", which the printer driver\'s file-type detection mistook for an Erlang JAM file, so it ignored the job.',
    mistake: 'Blaming OpenOffice\'s date code. The date was fine; the driver\'s file-type guessing misread it.',
    tryIt: { q: 'Which property of software does the Tuesday printing bug illustrate, and why?', a: 'Discontinuity: only one day\'s abbreviation triggers it, so testing Monday and Wednesday says nothing about Tuesday.' },
  };

  H['st2-zune-bug'] = {
    asks: 'Find the fault in the Zune loop that turns "days since 1980" into a year and day-of-year.',
    idea: 'Every pass through a loop must either make progress or leave. Trace each path through the body: one path in a leap year changes nothing, and if the loop condition is still true, it spins forever.',
    steps: [
      { text: 'The loop body has three paths:', table: { head: ['year is leap?', 'days', 'what happens'], rows: [['no', '> 365', 'days -= 365, year += 1 (progress)'], ['yes', '> 366', 'days -= 366, year += 1 (progress)'], ['yes', 'exactly 366', 'nothing changes']] } },
      'On the third path the outer test `days > 365` is true (366 > 365) but the inner test `days > 366` is false (366 is not > 366).',
      'Neither `days` nor `year` changes, so the next check is the same, and the loop repeats forever: the device hangs.',
      'It happened on 31 December 2008, the last day of a leap year: day 10593 since 1 January 1980 reduces to 366 with `year` = 2008.',
      'This is a boundary fault: `> 366` versus `>= 366`, with no handling for exactly 366. Finding it took domain knowledge (leap years), knowing boundaries are risky, and reading the code.',
    ],
    answer: 'In a leap year with `days` exactly 366, the outer test is true and the inner test is false, so nothing changes and the loop runs forever.',
    mistake: 'Saying the leap-year check is wrong. `IsLeapYear` is fine; the fault is the missing case for exactly 366 days.',
    tryIt: { q: 'Starting from `days` = 732 (year 1980, a leap year), trace the loop. Does it end, and with what values?', a: '1980 is leap and 732 > 366, so days = 366, year = 1981. 1981 is not leap, so days = 1, year = 1982. 1 is not > 365, so it ends with days 1, year 1982.' },
  };

  H['st2-zune-input'] = {
    asks: 'Give the exact value of `days`, while `year` is a leap year, for which the Zune loop never ends.',
    idea: 'Look for the input that enters the loop but takes no branch that changes anything. That is the gap between the outer test (> 365) and the inner test (> 366).',
    steps: [
      'To stay in the loop, `days > 365`, so `days` is at least 366.',
      'In a leap year, the body only does something when `days > 366`.',
      'The only value that passes the first test and fails the second is 366.',
      { text: 'Tracing a few starts from 1980 (a leap year):', table: { head: ['start days', 'result'], rows: [['366', 'hangs (366 in 1980)'], ['367', 'ends: day 1 of 1981'], ['731', 'ends: day 365 of 1981'], ['10593', 'hangs (366 in 2008, i.e. 31 Dec 2008)']] } },
    ],
    answer: '366: the outer test (366 > 365) is true, the inner test (366 > 366) is false, so nothing changes.',
    mistake: 'Answering 365. At 365 the loop condition `days > 365` is false, so the loop simply ends.',
    tryIt: { q: 'Suppose the inner test were mistakenly written `if (days > 367)`. Which `days` values in a leap year would now hang?', a: '366 and 367: both pass `days > 365` but fail `days > 367`, so neither changes anything.' },
  };

  H['st2-zune-fix'] = {
    asks: 'Change the Zune loop so it stops on day 366 of a leap year instead of hanging.',
    idea: 'A loop needs every path to make progress or exit. The leap-year branch had a path that did neither, so give that path an exit: day 366 is a real day, the last day of a leap year.',
    steps: [
      'The hang path: leap year and `days == 366`. Here the answer is already known: it is day 366 of the current year.',
      { text: 'So add an `else` that leaves the loop:', code: 'if (IsLeapYear(year)) {\n  if (days > 366) {\n    days -= 366;\n    year += 1;\n  } else {\n    break;   // day 366 of a leap year\n  }\n}' },
      'Now every path through the body either reduces `days` or exits, so the loop always terminates.',
      'A good test for the fix is exactly the boundary: a start value that reaches 366 in a leap year, such as 366 itself or 10593 (31 Dec 2008).',
    ],
    answer: 'When `days == 366` in a leap year, exit the loop (for example `else { break; }`): it is the valid last day of that year.',
    mistake: 'Changing `days > 366` to `days >= 366`. Then day 366 would be subtracted to 0 and the date becomes day 0 of the next year, which is wrong.',
    tryIt: { q: 'After the fix, what do `days` and `year` hold when the loop starts with 10593?', a: 'It reaches 366 with year 2008 (a leap year), then breaks: days 366, year 2008, which is 31 December 2008.' },
  };

  H['st2-zune-catch'] = {
    asks: 'Apart from knowing where programmers tend to slip up, what knowledge was needed to find the Zune bug?',
    idea: 'To find a bug you must know what correct looks like. For a date converter that means knowing how the calendar works, including the odd case: leap years with 366 days.',
    steps: [
      'The lecture lists what it took to find the Zune bug:',
      { text: 'The checklist:', table: { head: ['need', 'why it matters for Zune'], rows: [['knowledge of how days and years work', 'you must know a leap year has a day 366'], ['knowledge of where mistakes are likely', 'boundary conditions and complex boolean expressions'], ['a "helpful adversary" mindset', 'asking "how can I break this?"'], ['black-box and white-box testing', 'examine both the requirements and the code']] } },
      'Without domain knowledge, a tester would not think of the last day of a leap year as a special input.',
    ],
    answer: 'Domain knowledge: knowing how days and years work, including leap years.',
    mistake: 'Answering "white-box testing". That is on the list too, but the question asks for the knowledge besides where mistakes are likely, which is how the calendar works.',
    tryIt: { q: 'You are testing a payroll program that pays every two weeks. What domain knowledge would help you pick tricky inputs?', a: 'How the calendar and pay periods work, for example years with 27 pay periods instead of 26, month ends, and leap days.' },
  };

  H['st2-helpful-adversary'] = {
    asks: 'Name the tester\'s mindset of asking "How can I break this thing?"',
    idea: 'A good tester attacks the code on purpose, but for the team\'s benefit: every break found in testing is one the user never sees.',
    steps: [
      'Developers naturally test that their code works. Testers look for inputs that make it fail.',
      'Adversary: you try to break the software, for example with boundary values like day 366.',
      'Helpful: you do it to improve the product and support the developers, not to blame them.',
    ],
    answer: 'Helpful adversary.',
    mistake: 'Writing just "adversary" or "devil\'s advocate". Both words matter: adversarial toward the code, helpful toward the team.',
    tryIt: { q: 'A login form is "done". Acting as a helpful adversary, name two inputs you would try.', a: 'For example an empty password and a very long or special-character username: inputs chosen to break it, reported so the team can fix them.' },
  };

  H['st2-likely-mistakes'] = {
    asks: 'Name the two places where programmers most often make mistakes, according to the checklist for finding the Zune bug.',
    idea: 'Bugs cluster where the code makes fine distinctions: at the edges of ranges and inside tangled conditions. Testing there finds more bugs per test.',
    steps: [
      'Boundary conditions: the edges of ranges, where `>` versus `>=` or starting at 0 versus 1 matters.',
      'Zune is a boundary bug (`days` exactly 366), and so is numZero (the loop starts at `i = 1` instead of 0).',
      'Complex boolean expressions: conditions with several `&&`, `||` and `!` are easy to get subtly wrong.',
    ],
    answer: 'Boundary conditions and complex boolean expressions.',
    mistake: 'Listing "loops" or "null pointers". They can be buggy, but the checklist names exactly boundaries and complex boolean expressions.',
    tryIt: { q: 'Code says `if (age > 18 && !(member || age < 65))`. Which two kinds of risky spot does it contain?', a: 'A boundary (18 and 65: should it be > or >=?) and a complex boolean expression (&&, ||, ! combined).' },
  };

  H['st2-bb-wb'] = {
    asks: 'What do testers use to design black-box tests? (The sibling question asks the same for white-box tests.)',
    idea: 'The names describe what you can see. Black box: the code is hidden, so tests come from what the software should do. White box: the code is visible, so tests come from how it is built. Good testing needs both.',
    steps: [
      { text: 'The two approaches:', table: { head: ['', 'black-box', 'white-box'], rows: [['tests come from', 'requirements / specification', 'the code itself'], ['you look at the code?', 'no', 'yes'], ['catches', 'missing or misunderstood features', 'untested paths, boundary slips in code'], ['example', 'spec says dates up to 31 Dec must work', 'drive the path where the inner if is false']] } },
      'Structural (coverage) testing from later lectures is a kind of white-box testing.',
      'To test well you must examine both the requirements (black box) and the code (white box).',
    ],
    answer: 'From the requirements / specification, without looking at the code.',
    mistake: 'Swapping them. Remember: in a black box you cannot see inside, so you cannot use the code.',
    tryIt: { q: 'A tester reads the user manual for a calculator app and writes tests for every listed feature. Black-box or white-box?', a: 'Black-box: the tests come from the requirements (the manual), not the code.' },
  };

  H['st2-bb-wb-mc'] = {
    asks: 'A tester reads the Zune loop and writes a test to reach the path where the inner `if` is false. Which kind of testing is that?',
    idea: 'Ask where the test came from. If you needed to read the code to design it, it is white-box testing.',
    steps: [
      'The test targets a specific path inside the code: the leap-year branch where `days > 366` is false.',
      'You can only know that path exists by reading the source, so the test is derived from the code\'s structure.',
      'Black-box would come only from the requirements. Validation asks whether it is the right product for the user. Chaos testing is not part of this idea.',
    ],
    answer: 'White-box testing: the test was designed from the code\'s structure.',
    mistake: 'Choosing black-box because the test input is "just a number". What decides it is how the test was designed, not what the input looks like.',
    tryIt: { q: 'A tester who never sees the Zune code reads the spec "must handle every day from 1980 to 2030" and tests 31 December of each leap year. Which kind of testing?', a: 'Black-box: the inputs come from the requirements and domain knowledge, not the code.' },
  };

  H['st2-oracle-def'] = {
    asks: 'Define a test oracle.',
    idea: 'Running a test produces an output, but someone has to judge it. The oracle is that judge: it knows what the right answer is and decides pass or fail.',
    steps: [
      'A test feeds test data into the software under test, which produces an actual output.',
      'The oracle compares the actual output with the expected output.',
      'Match means pass; mismatch means fail.',
      'The oracle can be a human tester or automatic, like the asserts in JUnit or pyUnit.',
    ],
    answer: 'The part of a test that decides pass or fail by comparing the actual output with the expected output.',
    mistake: 'Calling the oracle the expected output itself. The expected output is data; the oracle is what does the comparing and decides.',
    tryIt: { q: 'In `assertEquals(1, numZero(new int[]{0, 2, 7}))`, what plays the role of the oracle, and what is the expected output?', a: 'The `assertEquals` check is the oracle; 1 is the expected output.' },
  };

  H['st2-oracle-kinds'] = {
    asks: 'Name the two drawbacks of using a human (the tester\'s opinion) as the test oracle.',
    idea: 'Oracles come in two kinds: a person who judges the output, or code that checks it. People are slow and inconsistent; automatic oracles are fast and repeatable.',
    steps: [
      { text: 'The two kinds of oracle:', table: { head: ['oracle', 'how it decides', 'drawbacks / strengths'], rows: [['human (tester\'s opinion)', 'a person looks at the output', 'not always reliable; expensive'], ['automatic (JUnit, pyUnit)', 'given input and output, checks true or false', 'runs thousands of tests very quickly']] } },
      'Not reliable: people get tired, miss details and disagree.',
      'Expensive: every check costs a person\'s time, every time the tests run.',
    ],
    answer: 'It is not always reliable, and it is expensive.',
    mistake: 'Saying "slow" only. The two drawbacks named are unreliable and expensive.',
    tryIt: { q: 'Why does an automatic oracle make it practical to run a test suite after every code change?', a: 'It checks true or false automatically and runs thousands of tests quickly, with no person\'s time or judgment needed.' },
  };

  H['st2-test-steps-order'] = {
    asks: 'Put the four phases of running a test in order.',
    idea: 'A test is like a lab experiment: prepare the setup, run it, judge the result, then clean the bench for the next one.',
    steps: [
      { text: 'The four phases:', table: { head: ['phase', 'what it does', 'example: test deleting an object'], rows: [['1. Setup', 'put the software into the test\'s condition', 'create the object'], ['2. Invocation', 'run the test case', 'call delete'], ['3. Assessment', 'compare actual with expected result', 'check the object is gone'], ['4. Teardown', 'clean up so nothing lasts beyond the test', 'close resources, restore data']] } },
      'Assessment comes after invocation because you cannot judge a result before it exists.',
      'Teardown is last so that each test leaves no trace that could affect the next one.',
    ],
    answer: 'Setup, Invocation, Assessment, Teardown.',
    mistake: 'Putting teardown before assessment. You clean up only after you have checked the result.',
    tryIt: { q: 'A test opens a temporary file, writes "hi", reads it back and checks it says "hi", then deletes the file. Label each action with its phase.', a: 'Open the file: setup. Write and read: invocation. Check it says "hi": assessment. Delete the file: teardown.' },
  };

  H['st2-test-steps-def'] = {
    asks: 'What does the invocation phase of a test do?',
    idea: 'Of the four phases, invocation is the one where the software under test actually runs. The others prepare for it, judge it, or clean up after it.',
    steps: [
      'Setup: put the software under test into the condition of the test (for example, create the object you will delete).',
      'Invocation: run the test case, that is, call the code with the test data.',
      'Assessment: evaluate the output by comparing the execution result with the expected result.',
      'Teardown: clean up so nothing lasts beyond the test (close resources, restore data).',
    ],
    answer: 'It runs the test case.',
    mistake: 'Saying invocation checks the result. Checking is assessment; invocation only runs the code.',
    tryIt: { q: 'In a test of `deleteUser("bob")`, which phase creates user bob, and which calls `deleteUser`?', a: 'Creating bob is setup; calling `deleteUser("bob")` is invocation.' },
  };

  H['st2-test-needs'] = {
    asks: 'Using the simple definition from lectures 2 and 3, what two parts make up a test case?',
    idea: 'A test case answers two questions: what do I feed in, and what should come out? The software produces the actual output, and the oracle compares the two.',
    steps: [
      { text: 'What a test needs, from the lecture summary:', table: { head: ['part', 'contains'], rows: [['test case', 'test data (input) + expected output'], ['software under test', 'produces the actual output'], ['oracle', 'compares actual with expected']] } },
      'Example from numZero: test data `[0, 2, 7]`, expected output 1.',
      'A later lecture gives a fuller definition: inputs, execution conditions and a pass/fail criterion. An expected output is one kind of pass/fail criterion.',
    ],
    answer: 'Test data (the input) and the expected output.',
    mistake: 'Including the actual output. That comes from running the software; it is not part of the test case you write in advance.',
    tryIt: { q: 'Write a test case for a function `max(a, b)`.', a: 'For example test data (3, 8) with expected output 8.' },
  };

  H['stp-author'] = {
    asks: 'What does Kidwell\'s paper "Stalking the Elusive Computer Bug" argue about where the word "bug" came from?',
    idea: 'The famous moth did not create the word "bug". Engineers already said "bug" for flaws; the Harvard team taped the moth in the logbook as a joke because it was a literal case of an existing term.',
    steps: [
      'Since at least the time of Thomas Edison, US engineers used "bug" for flaws in the systems they built.',
      'IBM engineers who installed the Mark I at Harvard in 1944 taught the word to the staff there, and Grace Hopper used it enthusiastically.',
      'In 1947 technicians found a moth in a relay of the Mark II and taped it into the logbook as the "first actual case of bug being found". The joke only works because "bug" already meant a flaw.',
      'Through glossaries (such as Hopper\'s for Univac programmers) and the popular press of the 1950s, "bug" and "debug" spread to computer programs.',
      'The author is Peggy Aldrich Kidwell, a curator of the mathematics collections at the Smithsonian\'s National Museum of American History.',
    ],
    answer: '"Bug" was US engineering slang for flaws long before computers; the 1947 moth was a joke on an existing word, not its origin.',
    mistake: 'Saying the moth was the origin of the word. The logbook note says "first actual case", which shows the word was already in use.',
    tryIt: { q: 'Who wrote "Stalking the Elusive Computer Bug", and where did she work?', a: 'Peggy Aldrich Kidwell, a curator at the Smithsonian (National Museum of American History).' },
  };

  H['stp-wilkes'] = {
    asks: 'What did Maurice Wilkes realise around June 1949 while working on the EDSAC computer?',
    idea: 'As soon as people started programming, they discovered that finding their own mistakes would take most of their time. Kidwell opens with this to show how central debugging was from the start.',
    steps: [
      'Wilkes was trying to get his first non-trivial program working: a numerical integration of Airy\'s differential equation.',
      'Walking between the EDSAC room and the punching equipment, "hesitating at the angles of the stairs", he realised that a good part of the rest of his life would be spent finding errors in his own programs.',
      'Kidwell uses it to show that early programmers realised, "with some distress", how much time debugging takes.',
    ],
    answer: 'That a good part of the rest of his life would be spent finding errors in his own programs.',
    mistake: 'Saying he found the first bug or invented debugging. His insight was about how much time debugging would take.',
    tryIt: { q: 'Fred Brooks put a number on what Wilkes felt. Roughly what share of a software project did he estimate goes to testing and debugging?', a: 'About 50 percent.' },
  };

  H['stp-brooks'] = {
    asks: 'Give Fred Brooks\'s estimate of how much of a software project\'s time goes to testing and debugging.',
    idea: 'Testing and debugging are not a small final step; they take about as much time as everything else combined, and they continue after release.',
    steps: [
      'Fred Brooks led the operating system work for IBM System/360 and wrote "The Mythical Man-Month".',
      'He estimated that testing and debugging take roughly 50 percent of the time of a software project.',
      'Decades later he saw no reason to change that estimate.',
      'And the work does not end at release: maintaining and debugging continue afterwards.',
    ],
    answer: '50 percent (about half).',
    mistake: 'Guessing 10 to 20 percent, as if testing were a quick check at the end. Brooks put it at half.',
    tryIt: { q: 'A team plans 12 months for a project, with 1 month at the end for testing. Using Brooks\'s estimate, about how long should testing and debugging take?', a: 'About half: roughly 6 of the 12 months.' },
  };

  H['stp-hopper-1953'] = {
    asks: 'Explain why Hopper\'s 1953 glossary for Univac programmers matters in the history of the word "bug".',
    idea: 'Before Hopper, "bug" and "debug" were mostly about hardware: machine malfunctions. Her glossary was the first to say in writing that errors in programs count too.',
    steps: [
      'Earlier glossaries either ignored the word (the Institute of Radio Engineers\' list) or defined "debug" only for hardware: "remove malfunctioning conditions from a computer".',
      'Hopper, then at Remington Rand\'s Univac division, prepared a glossary for programmers attending workshops on automatic coding.',
      'She defined "debug" as "to remove a malfunction from a computer or an error from a routine". The words "or an error from a routine" extend the term to programming errors.',
      'Her glossary became the basis of the ACM\'s 1954 glossary, which listed "debug" as a programmers\' term, not as slang.',
    ],
    answer: 'It defined "debug" as "to remove a malfunction from a computer or an error from a routine", explicitly extending "bug" from hardware to programming errors.',
    mistake: 'Saying it was the first use of the word "bug". The word was much older; what was new was applying it to errors in programs.',
    tryIt: { q: 'Which later glossary was based on Hopper\'s, and how did it treat "debug"?', a: 'The ACM\'s 1954 glossary; it listed "debug" as a term programmers use, not as slang.' },
  };

  H['stp-functions'] = {
    asks: 'According to Kidwell, why was a short, vague word like "bug" handy when a computer went wrong?',
    idea: 'Kidwell sums up what the phrase "computer bug" did for the people who used it. Each function explains why the word stuck.',
    steps: [
      { text: 'The functions Kidwell names:', table: { head: ['function', 'why'], rows: [['a short general term', 'the exact source of an error was often unknown'], ['humour', 'it appealed to the wit of programmers and users'], ['insider status', 'early on, a small group of experts used it, marking their special status'], ['optimism', '"bug" rather than "failure" suggests a small, correctable fault, not a failure in design']] } },
      'The first function answers this question: when you do not yet know what is wrong, you need a word that covers many kinds of flaw.',
    ],
    answer: 'The exact source of an error was often unknown, so a general term covering many kinds of flaw was useful.',
    mistake: 'Answering with the humour or optimism function. Those are real, but the question asks why a vague, general term was useful.',
    tryIt: { q: 'Kidwell: besides being a handy general term, what appeal did "computer bug" have for programmers and users?', a: 'Humour: it appealed to their wit.' },
  };

  // ---- Lecture 3: what a test is (four phases) ----
  const phaseIdeaF4 = 'A test is a small experiment with a clean start and a clean finish. Setup puts the software into the state the test needs, invocation runs the test case, assessment compares what came out with what was expected, and teardown puts the world back so the next test starts fresh.';
  const phaseTableF4 = { text: 'The four phases, in the order they happen:', table: { head: ['phase', 'what it does', 'example'], rows: [
    ['Setup', 'put the software under test in the condition the test needs', 'create the object you want to delete'],
    ['Invocation', 'run the test case', 'call `delete(obj)`'],
    ['Assessment', 'compare the actual result with the expected result', 'check the object is gone'],
    ['Teardown', 'clean up so nothing outlasts the test', 'close resources, restore data'],
  ] } };

  H['st3-setup-example'] = {
    asks: 'Before you can check that deleting an object works, something has to happen first. What is the setup phase responsible for here?',
    idea: phaseIdeaF4,
    steps: [
      'Deletion needs something to delete. If the object does not exist, the test cannot even run the operation it is meant to check.',
      'So setup creates the object. Its job in general is to put the software under test in exactly the condition the test needs.',
      phaseTableF4,
      'Only after setup does invocation call delete, and assessment then checks that the object is gone.',
    ],
    answer: 'Create the object first, so the software under test is in the condition the test needs (you cannot delete what does not exist).',
    mistake: 'Treating setup as "run the code". Running the operation is invocation; setup only prepares the starting state.',
    tryIt: { q: 'You want to test that renaming a file works. What does setup do?', a: 'Create a file with a known name, so there is something to rename. The rename call itself is invocation.' },
  };

  H['st3-phase-assessment'] = {
    asks: 'Of the four phases of a test, which one judges the result by comparing what actually happened with what was expected?',
    idea: phaseIdeaF4,
    steps: [
      phaseTableF4,
      'Invocation only runs the test case; it produces an actual output but says nothing about whether it is right.',
      'Assessment is the judging step: it compares the execution result with the expected result. This is where the oracle does its work.',
    ],
    answer: 'Assessment: it compares the execution result with the expected result.',
    mistake: 'Picking invocation because "that is when the test runs". Running and judging are separate phases.',
    tryIt: { q: 'In a JUnit test, the line `assertEquals(80, account.getBalance());` belongs to which phase?', a: 'Assessment: it compares the actual balance with the expected 80.' },
  };

  H['st3-phase-teardown'] = {
    asks: 'A test put rows into a database. Afterwards the rows are deleted and the connection is closed. Name the phase.',
    idea: phaseIdeaF4,
    steps: [
      phaseTableF4,
      'Deleting the inserted rows restores the data; closing the connection releases a resource. Both make sure nothing that should not last beyond the test does.',
      'That is exactly the definition of teardown, the last phase.',
    ],
    answer: 'Teardown: it cleans up so nothing outlasts the test (restoring data, closing resources).',
    mistake: 'Calling it setup because it touches the database. Setup prepares state before the test; teardown removes it after.',
    tryIt: { q: 'A test opens a temporary file, writes to it, checks the contents, then deletes the file. Which phase deletes the file?', a: 'Teardown.' },
  };

  H['st3-teardown-why'] = {
    asks: 'Suppose a test skips teardown entirely. What is the danger?',
    idea: phaseIdeaF4,
    steps: [
      'Teardown exists so that nothing that should not last beyond the test does: data gets restored and resources get closed.',
      'Without it, the test leaves things behind: extra rows in a database, a changed shared variable, an open file or connection.',
      'The next test then starts from a dirtied state instead of a known one, so it can pass or fail because of the earlier test rather than because of the code it is checking.',
      'Open resources also pile up across a big suite (for example, running out of connections).',
    ],
    answer: 'Leftover state or open resources leak into later tests and can change their outcome.',
    mistake: 'Thinking only the test without teardown is affected. The damage shows up in OTHER tests, which makes it hard to trace.',
    tryIt: { q: 'Test A sets a global `discount = 0.5` and never resets it. Test B checks a full-price total. What can happen to B?', a: 'B can fail when it runs after A, because it sees the leftover 50% discount. A teardown that resets `discount` fixes it.' },
  };

  H['st3-phases-scenario'] = {
    asks: 'Build a test for "withdraw $20 from an account holding $100" and say what happens in each of the four phases.',
    idea: phaseIdeaF4 + ' The test case itself is just the input plus the expected output; the phases are what you do with it.',
    steps: [
      'Test case: test data = withdraw 20 from a $100 account; expected output = balance $80 (100 − 20).',
      { text: 'Lay the phases out in order:', table: { head: ['phase', 'what happens'], rows: [
        ['Setup', 'create an account with a $100 balance'],
        ['Invocation', 'call `withdraw(20)`'],
        ['Assessment', 'compare the actual balance with the expected $80'],
        ['Teardown', 'delete the test account / restore the data'],
      ] } },
      { text: 'In JUnit it could look like this:', code: 'Account acc = new Account(100);   // setup\nacc.withdraw(20);                  // invocation\nassertEquals(80, acc.getBalance()); // assessment\n// teardown: remove the account / restore data' },
    ],
    answer: 'Setup: create an account with $100. Invocation: call withdraw(20). Assessment: check the balance is $80 against the actual balance. Teardown: delete the test account / restore the data.',
    mistake: 'Leaving out the expected value in assessment ("check the balance"). Assessment needs a concrete expected result, here $80.',
    tryIt: { q: 'Lay out a test for "add item to an empty cart, cart size should be 1" in four phases.', a: 'Setup: create an empty cart. Invocation: add one item. Assessment: expected size 1 vs actual size. Teardown: discard the cart / restore any saved data.' },
  };

  H['st3-test-suite'] = {
    asks: 'Define a test suite.',
    idea: 'A test case is one input with its expected output. A test suite is the collection of those cases that you run together against the software, so one command checks everything at once.',
    steps: [
      'A test case = test data (input) + expected output.',
      'A test suite = a collection of test cases run together against the software under test.',
      'Suites are what get reused: regression testing re-runs the same suite on each new version, and mutation testing measures how good a suite is at catching faults.',
    ],
    answer: 'A collection of test cases run together against the software under test.',
    mistake: 'Confusing a suite with a single test case, or with the testing tool (JUnit). JUnit runs suites; the suite is the set of cases.',
    tryIt: { q: 'You have 40 JUnit test methods for a `Calculator` class and run them all with one click before each release. What is that set of 40 tests, and what is re-running it on a new version called?', a: 'A test suite; re-running it on each new version is regression testing.' },
  };

  // ---- Bug of the Day: left-pad ----
  const leftpadIdeaF4 = 'Your program is a stack of other people\'s code. In 2016 one tiny JavaScript package, left-pad, sat deep in that stack under React, and when its author deleted it, everything built on top fell over. Dependability depends on the whole chain, not only on the code you wrote and tested.';

  H['st3-leftpad'] = {
    asks: 'Tell the story of the 2016 npm left-pad breakage: what was removed, and what broke?',
    idea: leftpadIdeaF4,
    steps: [
      'left-pad was a very small JavaScript package by Azer Koçulu, with only a handful of GitHub stars.',
      'He deleted (unpublished) it from npm, the JavaScript package manager.',
      'React depended on left-pad, and big sites such as Facebook, PayPal, Netflix and Spotify used React, so their builds broke.',
      'It "broke the internet" for about 2 hours, until npm had to "un-un-publish" (restore) the package.',
    ],
    answer: 'A developer deleted his tiny left-pad package from npm; React depended on it, so builds broke across the web (Facebook, Netflix, ...) until npm restored it about 2 hours later.',
    mistake: 'Saying left-pad had a bug in its code. The code was fine; the problem was that it disappeared.',
    tryIt: { q: 'Your app works today. Tomorrow a library three levels down in your dependencies is removed from the package registry. Will your own unit tests have warned you?', a: 'No: your tests check your code, not whether everything it depends on stays available. That is the left-pad lesson.' },
  };

  H['st3-leftpad-lesson'] = {
    asks: 'What does left-pad teach about how dependable software is?',
    idea: leftpadIdeaF4,
    steps: [
      'left-pad was tiny and obscure, but React needed it, and huge sites needed React.',
      'Removing that one small piece stopped builds everywhere: it was a single point of failure hidden deep in the chain.',
      'None of those companies\' own tests could have prevented it, because the failure came from something they did not control.',
    ],
    answer: 'A tiny dependency deep in the chain can be a single point of failure: your software is only as dependable as everything it depends on, which your own tests cannot control.',
    mistake: 'Drawing the lesson "write more unit tests". Testing your own code does not protect you from a dependency vanishing.',
    tryIt: { q: 'A team\'s payment page depends on a free third-party date-formatting library maintained by one volunteer. Which left-pad lesson applies?', a: 'That small library is a possible single point of failure: if it disappears or breaks, the payment page fails, no matter how well the team tested its own code.' },
  };

  // ---- JUnit ----
  const junitIdeaF4 = 'JUnit test code has two kinds of parts. Annotations such as `@Test` tell the framework which methods to run (and which are setup or teardown hooks). Assertions such as `assertEquals(expected, actual)` judge the result, so they are the automatic oracle.';

  H['st3-junit-parts'] = {
    asks: 'What job do annotations like `@Test` do in a JUnit test class?',
    idea: junitIdeaF4,
    steps: [
      { text: 'A small JUnit test shows both parts:', code: '@Test                         // annotation: "run me as a test"\npublic void addsTwoNumbers() {\n    assertEquals(5, add(2, 3)); // assertion: the oracle\n}' },
      'The annotation is a label on the method. JUnit scans for these labels to know what to run; hooks such as `@BeforeEach` / `@AfterEach` mark setup and teardown methods.',
      'The assertion does the checking: it compares the expected value with the actual one and makes the test pass or fail.',
    ],
    answer: 'They mark methods as tests (or setup/teardown hooks), so the framework knows what to run.',
    mistake: 'Saying `@Test` checks the result. It only marks the method; the assertion inside does the checking.',
    tryIt: { q: 'You write a correct test method but forget the `@Test` annotation. What happens when you run the suite?', a: 'JUnit does not treat it as a test, so it never runs it. The method is ignored.' },
  };

  H['st3-junit-oracle-mc'] = {
    asks: 'An oracle decides whether a test passed. In JUnit, which piece of the test plays that role automatically?',
    idea: junitIdeaF4,
    steps: [
      'An oracle compares the actual output with the expected output and decides pass or fail. A human can be an oracle, but that is slow and unreliable; an automatic oracle checks thousands of tests quickly.',
      '`assertEquals(expected, actual)` does exactly that comparison, so the assertions are the automatic oracle.',
      'Annotations only mark what to run, test data is the input, and teardown cleans up. None of them judges the result.',
    ],
    answer: 'The assertions: an assertion like `assertEquals(expected, actual)` decides pass/fail.',
    mistake: 'Choosing the test data because it "contains the answer". Test data is the input; the expected value lives in the assertion.',
    tryIt: { q: 'In `assertTrue(list.isEmpty());`, what is being used as the oracle?', a: 'The assertion `assertTrue`: it decides pass/fail by checking that `isEmpty()` returned true.' },
  };

  H['st3-junit-numzero'] = {
    asks: 'Run this JUnit test in your head against numZero, whose loop wrongly starts at `i = 1`. Pass or fail?',
    idea: 'numZero is supposed to count the zeros in an array, but its loop starts at index 1, so it never looks at index 0. A test only exposes that fault if it puts a zero exactly where the loop does not look.',
    steps: [
      { text: 'The faulty code:', code: 'int count = 0;\nfor (int i = 1; i < arr.length; i++)   // fault: should start at 0\n    if (arr[i] == 0) count++;\nreturn count;' },
      { text: 'Trace it on {0, 2, 7}:', table: { head: ['i', 'arr[i]', 'count after'], rows: [['(0 skipped)', '0', '0'], ['1', '2', '0'], ['2', '7', '0']] } },
      'Actual output 0, expected 1 (there is one zero). `assertEquals(1, 0)` fails.',
      'Test data {0, 2, 7}; expected output 1; oracle `assertEquals`. It is a good test because the zero sits in the one slot the faulty loop skips.',
    ],
    answer: 'It FAILS: numZero returns 0 but 1 is expected. Test data {0, 2, 7}; oracle: assertEquals.',
    mistake: 'Assuming any test with a zero catches the bug. With {2, 7, 0} the zero is at index 2, the loop sees it, and the test passes.',
    tryIt: { q: 'Same buggy numZero. Does `assertEquals(2, numZero(new int[] {0, 0, 5}))` pass?', a: 'No, it fails: the loop skips index 0 and counts only the zero at index 1, so it returns 1, not 2.' },
  };

  H['st3-main-harder'] = {
    asks: 'JUnit handles an ordinary method easily. Why is `main` harder?',
    idea: 'An assertion needs a returned value to compare. An ordinary method takes arguments and returns a result, which is perfect for that. `main` returns nothing and talks to the console, so the test has to fake the keyboard and capture the screen instead.',
    steps: [
      'Ordinary method: `assertEquals(5, add(2, 3));` passes input as arguments and checks the return value. Easy.',
      '`main` is `void`: there is no return value to assert on.',
      'It takes its input from the console (`System.in`) and prints its output (`System.out`), so the test must feed input into System.in and capture what goes to System.out before it can compare anything.',
      'Lesson for testability: put the real logic in small methods that take arguments and return values, and keep `main` thin.',
    ],
    answer: 'main returns nothing (void) and works through console I/O, so the test must feed System.in and capture System.out.',
    mistake: 'Saying main "cannot" be tested. It can; it just takes extra work to redirect input and output.',
    tryIt: { q: 'A method `void printTotal(int[] prices)` prints the sum. How could you change its design to make it easy to test with assertions?', a: 'Split it: `int total(int[] prices)` returns the sum (assert on it directly), and a thin print method prints `total(prices)`.' },
  };

  // ---- Test-driven development ----
  const tddIdeaF4 = 'Test-driven development: write the test cases first, from the specification, then write the code to make them pass. If you write the code first, your tests drift into checking what the code does instead of what the solution should do, and any mistake in the code gets copied into the "expected" values.';

  H['st3-tdd-def'] = {
    asks: 'In TDD, do the tests come before or after the code?',
    idea: tddIdeaF4,
    steps: [
      'TDD = write the test cases first.',
      'Each test case fixes an input and an expected output straight from the spec, before any code exists to bias you.',
      'Then you write code until those tests pass.',
    ],
    answer: 'Before the code.',
    mistake: 'Thinking TDD just means "lots of tests". The defining feature is the order: tests first.',
    tryIt: { q: 'A developer writes `sort()`, runs it, looks at the output, and pastes that output into assertions. Is that TDD?', a: 'No. The tests came after the code and copy what it does, which is exactly what TDD avoids.' },
  };

  H['st3-tdd-mc'] = {
    asks: 'What problem does the lecture say happens when tests are written after the code?',
    idea: tddIdeaF4,
    steps: [
      'Once code exists, it is tempting to write tests by looking at the code and what it outputs.',
      'Then the tests check what the code does, not what it should do (the solution in the spec).',
      'A bug in the code becomes the "expected" output, so the test passes and the bug survives.',
    ],
    answer: 'Tests check what the code does, not what it should do.',
    mistake: 'Picking an option about automation or refactoring. Tests written later can still be automated; the issue is what they end up checking.',
    tryIt: { q: 'Code-first, a programmer\'s `average([])` returns 0 by accident, and the test written afterwards asserts 0. The spec says an empty list is an error. What went wrong?', a: 'The test encoded what the code does (0) instead of what the spec requires (an error), so the bug passes its own test.' },
  };

  H['st3-tdd-radius'] = {
    asks: 'Spec: read a radius, print the circle\'s area and circumference. Writing tests first, what output do you expect at the boundary radius 0?',
    idea: tddIdeaF4 + ' For the radius program you decide each expected output before coding: typical values, the boundary 0, and bad input such as a negative number or "abc".',
    steps: [
      'Area = pi times r squared; circumference = 2 times pi times r.',
      { text: 'Expected outputs fixed before the code exists:', table: { head: ['input', 'expected output'], rows: [
        ['0 (boundary)', 'area 0, circumference 0'],
        ['1', 'area 3.14..., circumference 6.28...'],
        ['−3 (negative)', 'an error message, not a crash'],
        ['"abc" (not a number)', 'an error message'],
      ] } },
      'At r = 0 both formulas multiply by 0, so both results are 0.',
    ],
    answer: 'Area 0 and circumference 0.',
    mistake: 'Treating 0 as invalid input. A radius of 0 is the edge of the valid range, and the formulas give 0 for both.',
    tryIt: { q: 'Same spec. Expected output for radius 2?', a: 'Area = pi x 4 = about 12.57, circumference = 2 x pi x 2 = about 12.57. (At r = 2 the two numbers happen to be equal.)' },
  };

  H['stx-fl-order'] = {
    asks: 'Two tests share a static list. Each passes alone, but `testEmptyAtStart()` fails when it happens to run after `testAddUser()`. Why, and how do you fix it?',
    idea: 'Every test should start from the same known state. When tests share state and nobody resets it, the result depends on which test ran first, and JUnit does not promise any order. This is exactly what setup and teardown are for.',
    steps: [
      '`testAddUser()` adds a user to the static list and leaves it there: there is no teardown.',
      'If `testEmptyAtStart()` runs next, the list still holds that user, so "list is empty" fails. Run alone, it passes.',
      'JUnit does not guarantee test order, so the suite passes or fails depending on the order it happens to choose. This is test-order dependence.',
      { text: 'Fix: reset the shared state before (or after) each test:', code: '@BeforeEach\nvoid reset() {\n    users.clear();   // every test starts with an empty list\n}' },
    ],
    answer: 'Test-order dependence: state from one test leaks into another because nothing cleans it up, and JUnit does not guarantee order. Fix: reset the list in setup or teardown (`@BeforeEach` / `@AfterEach`).',
    mistake: 'Fixing it by forcing a test order. That hides the leak; resetting state makes every test independent.',
    tryIt: { q: 'testLogin() sets a static `currentUser`; testGuestView() assumes no one is logged in and fails only after testLogin(). Fix?', a: 'Reset `currentUser = null` in an `@BeforeEach` (or `@AfterEach`) method so each test starts logged out.' },
  };

  // ---- TDD exercises: tests straight from a spec ----
  const specIdeaF4 = 'With no code yet, the spec is the only source of expected outputs. Pick a typical value, the values right at and next to each boundary (where off-by-one mistakes hide), and an invalid input. Writing these first forces the spec to answer edge questions before code can guess.';

  H['stx-tdd-shipping'] = {
    asks: 'From the shippingFee spec alone, write 4 test cases: a normal paid order, one just below $50, one exactly at $50, and an invalid total.',
    idea: specIdeaF4,
    steps: [
      'Rule: under $50 pays $7; $50 or more pays $0; negative throws IllegalArgumentException. The boundary is at 50, and "or more" puts 50 itself on the free side.',
      { text: 'Pick one value per region and both sides of the boundary:', table: { head: ['purpose', 'input', 'expected'], rows: [
        ['typical paid', '20.00', '7'],
        ['just below boundary', '49.99', '7'],
        ['on the boundary', '50.00', '0'],
        ['invalid', '−1.00', 'IllegalArgumentException'],
      ] } },
      'The 49.99 / 50.00 pair catches the classic slip of writing `total > 50` instead of `total >= 50`.',
    ],
    answer: '20.00 → 7. 49.99 → 7. 50.00 → 0. −1.00 → IllegalArgumentException.',
    mistake: 'Testing only 20 and 100. Both pass even if the code gets the $50 boundary wrong.',
    tryIt: { q: 'Spec: ticketPrice(age) is 5 for ages under 12, 10 for ages 12 or more; negative ages throw. Give the two boundary test cases.', a: '11 → 5 and 12 → 10.' },
  };

  H['stx-tdd-password'] = {
    asks: 'Using the spec (8 to 64 characters and at least one digit), what should `isValidPassword("abcdefg1")` return? It has 8 characters.',
    idea: specIdeaF4 + ' Good invalid tests break exactly ONE rule each, so a failure tells you which rule the code gets wrong.',
    steps: [
      'Count: a b c d e f g 1 = 8 characters, and it contains the digit 1.',
      'Length 8 is inside 8 to 64 (the lower edge counts), and the digit rule holds, so it is valid.',
      { text: 'Test cases around the rules:', table: { head: ['input', 'length', 'digit?', 'expected'], rows: [
        ['"abcdefg1"', '8', 'yes', 'true (shortest valid)'],
        ['"abcdef1"', '7', 'yes', 'false (one too short)'],
        ['"abcdefgh"', '8', 'no', 'false (no digit)'],
        ['63 letters + "1"', '64', 'yes', 'true (longest valid)'],
        ['64 letters + "1"', '65', 'yes', 'false (one too long)'],
        ['null', '-', '-', 'IllegalArgumentException'],
      ] } },
    ],
    answer: 'true: it is the shortest valid password (8 characters, has a digit).',
    mistake: 'Answering false because 8 "is the limit". "8 to 64" includes 8.',
    tryIt: { q: 'Same spec: what should `isValidPassword("abcdefgh")` return?', a: 'false: 8 characters is fine, but there is no digit. It breaks exactly one rule.' },
  };

  H['stx-tdd-grade'] = {
    asks: 'Write 4 test cases from the letter(score) spec: both sides of the A/B line, a typical C, and an out-of-range score.',
    idea: specIdeaF4,
    steps: [
      'Rules: 90 or more → "A", 80 to 89 → "B", below 80 → "C", outside 0 to 100 → IllegalArgumentException. The A/B line is between 89 and 90.',
      { text: 'Choose:', table: { head: ['purpose', 'input', 'expected'], rows: [
        ['on the A boundary', '90', '"A"'],
        ['just below it', '89', '"B"'],
        ['typical C', '50', '"C"'],
        ['out of range', '101 (or −1)', 'IllegalArgumentException'],
      ] } },
      'If the code says `score > 90` instead of `score >= 90`, the 90 test returns "B" and fails, catching the off-by-one.',
    ],
    answer: '90 → "A". 89 → "B". 50 → "C". 101 → IllegalArgumentException (or −1).',
    mistake: 'Picking 95 and 85 for the A/B boundary. Both are far from the line, so an off-by-one at 90 slips through.',
    tryIt: { q: 'Same spec: which two inputs test the B/C line?', a: '80 → "B" and 79 → "C".' },
  };

  H['stx-tdd-leap'] = {
    asks: 'Apply the leap-year spec to 1900. True or false?',
    idea: specIdeaF4 + ' The leap rule has layers (divisible by 4, except centuries, unless divisible by 400), so each layer needs its own test.',
    steps: [
      '1900 ÷ 4 = 475, so the first rule says leap...',
      '...but 1900 is a century year, so it is leap only if divisible by 400. 1900 ÷ 400 = 4.75, not whole.',
      { text: 'One test per rule:', table: { head: ['year', 'rule it checks', 'expected'], rows: [
        ['2024', 'divisible by 4', 'true'],
        ['2023', 'not divisible by 4', 'false'],
        ['1900', 'century, not by 400', 'false'],
        ['2000', 'century, divisible by 400', 'true'],
        ['0', 'below 1', 'IllegalArgumentException'],
      ] } },
      'A code-first author who only checks 2024 and 2023 would miss a faulty century rule.',
    ],
    answer: 'false: 1900 is a century year not divisible by 400.',
    mistake: 'Stopping at "divisible by 4, so true". The century exception overrides it.',
    tryIt: { q: 'Same spec: isLeap(2100)?', a: 'false: century year, and 2100 ÷ 400 = 5.25 is not whole.' },
  };

  H['stx-tdd-truncate'] = {
    asks: 'Using the truncate spec, what does `truncate("hello", 5)` return? Note "hello" is exactly 5 characters.',
    idea: specIdeaF4 + ' Here the boundary is length == n: "at most n" means a string of exactly n characters is left alone.',
    steps: [
      '"hello" has 5 characters and n = 5. "At most n characters" includes exactly n.',
      'So it is returned unchanged, with no "…".',
      { text: 'Tests around the boundary:', table: { head: ['call', 'length vs n', 'expected'], rows: [
        ['truncate("hello", 5)', '5 = 5', '"hello"'],
        ['truncate("hello", 4)', '5 > 4', '"hell…"'],
        ['truncate("hi", 5)', '2 < 5', '"hi"'],
        ['truncate("hello", −1)', 'n < 0', 'IllegalArgumentException'],
      ] } },
    ],
    answer: '"hello": a string of length exactly n is NOT truncated.',
    mistake: 'Writing "hello…" or "hell…". That is the off-by-one the boundary test exists to catch (`>=` instead of `>` in the code).',
    tryIt: { q: 'Same spec: truncate("cat", 2)?', a: '"ca…": 3 characters is more than 2, so keep the first 2 and add "…".' },
  };

})(globalThis.FC = globalThis.FC || {});
