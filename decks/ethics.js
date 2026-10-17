// Software-engineering ethics: the original quiz bank (archive/ethics-questions.js), brought back
// as a class on 2026-10-16. Multiple choice only. Every card got a `why` on 2026-10-17, options were cut
// to 2-3 distractors, and the keys were checked: each correction is recorded in that card's `source`
// ("key corrected" / "reworded"). Length cue fixed 2026-10-17: on 62 cards the correct option was the
// longest; answers were trimmed and distractors made equally specific (answer <= ~1.15x longest distractor).
// UNVERIFIED keys (kept; no source settles them, 2026-10-17): eth-18, eth-24, eth-25, eth-26, eth-29, eth-30,
// eth-31, eth-37, eth-39, eth-40. (eth-29/37: SE Code 6.12 suggests raising it with the person first.)
(function (FC) {
  (FC.decks = FC.decks || {}).ethics = {
    id: "ethics", title: "Software Engineering Ethics", short: "Ethics",
    lectures: [{ n: "1", title: "Ethics quiz bank" }],
    catOrder: ["Ethical theories", "Professional ethics", "Privacy & data", "Intellectual property", "Security", "Tech & society"],
    cards: [
 {
  "id": "eth-1",
  "lecture": "1",
  "cat": "Professional ethics",
  "sub": "SE Code of Ethics",
  "type": "mc",
  "noRecall": true,
  "prompt": "A software engineer encounters a situation where meeting project deadlines requires cutting corners and compromising on software quality. According to the SECEPP, what should the engineer prioritize?",
  "answer": "Ensuring the highest possible software quality",
  "options": [
   "Meeting project deadlines at all costs",
   "Balancing project deadlines and software quality",
   "Seeking guidance from the project manager"
  ],
  "why": "Principle 3 asks for the highest professional standards possible. Trade-offs with schedule are allowed only when made clear to and accepted by the client, never by quietly cutting corners.",
  "source": "Ethics quiz bank (archived question 1)"
 },
 {
  "id": "eth-2",
  "lecture": "1",
  "cat": "Ethical theories",
  "sub": "Kantianism",
  "type": "mc",
  "noRecall": true,
  "prompt": "According to Kantian ethics, what moral responsibility does Robert Tappan Morris, Jr. bear for launching the Internet Worm?",
  "answer": "Full moral accountability, as he violated the privacy and property rights of others",
  "options": [
   "No moral accountability, as the worm was a technological experiment",
   "Partial moral accountability, as his actions inadvertently exposed security flaws",
   "Moral responsibility lies with the institutions affected, not the individual attacker"
  ],
  "why": "Kant judges the act and the will, not side benefits. Morris used other people's computers without consent, treating their owners merely as means, so exposing flaws does not lessen his responsibility.",
  "source": "Ethics quiz bank (archived question 2)"
 },
 {
  "id": "eth-3",
  "lecture": "1",
  "cat": "Professional ethics",
  "sub": "Whistleblowing",
  "type": "mc",
  "prompt": "According to the SECEPP, what is the primary responsibility of a software engineer regarding whistleblowing on unethical practices within their organization?",
  "answer": "Report it to appropriate authorities within the organization",
  "options": [
   "Report it to the media so the public is warned",
   "Stay silent unless the client is directly harmed",
   "Report it anonymously to a competitor of the employer"
  ],
  "why": "The code says to raise concerns with the people involved first, then report significant violations to appropriate authorities. Going to the media or to competitors skips those steps.",
  "source": "Ethics quiz bank (archived question 3)"
 },
 {
  "id": "eth-4",
  "lecture": "1",
  "cat": "Professional ethics",
  "sub": "SE Code of Ethics",
  "type": "mc",
  "prompt": "According to the SECEPP, which principle requires software engineers to 'strive to fully understand the specifications for software on which they work'?",
  "answer": "Product",
  "options": [
   "Public",
   "Judgment",
   "Client and employer"
  ],
  "why": "Clause 3.07, under Product, says engineers strive to fully understand the specifications for software they work on. Product covers the quality of what you build: specs, testing, documentation.",
  "source": "Ethics quiz bank (archived question 4)"
 },
 {
  "id": "eth-5",
  "lecture": "1",
  "cat": "Ethical theories",
  "sub": "Relativism & egoism",
  "type": "mc",
  "prompt": "An ethical relativist claims that:",
  "answer": "There are no universal moral principles; moral judgments are culturally and individually subjective, varying across different societies and individuals.",
  "options": [
   "Morality is solely a construct of human society and does not have an existence outside of human thought and interaction.",
   "Free will is constrained by societal norms and cultural influences, rendering individual choices and actions relative to the context.",
   "The existence of a divine being does not determine or dictate moral standards; morality is contingent on human perspectives and experiences."
  ],
  "why": "Relativism says there are no universal moral norms: right depends on the person or the culture. Calling morality a human construct does not by itself say it varies.",
  "source": "Ethics quiz bank (archived question 5)"
 },
 {
  "id": "eth-6",
  "lecture": "1",
  "cat": "Tech & society",
  "sub": "Tech & society",
  "type": "mc",
  "noRecall": true,
  "prompt": "Analyze the ethical implications of social media platforms utilizing algorithmic content moderation. Which option best reflects the potential unintended consequence of algorithmic moderation?",
  "answer": "It reinforces existing biases and amplifies echo chambers.",
  "options": [
   "It enhances user engagement and satisfaction.",
   "It promotes diversity and inclusivity in online discourse.",
   "It improves the accuracy and reliability of online information."
  ],
  "why": "Algorithms trained on past behaviour repeat its biases and keep showing people more of what they already engage with. The other options are hoped-for benefits, not unintended harms.",
  "source": "Ethics quiz bank (archived question 6)"
 },
 {
  "id": "eth-7",
  "lecture": "1",
  "cat": "Tech & society",
  "sub": "Tech & society",
  "type": "mc",
  "noRecall": true,
  "prompt": "Assess the ethical implications of government-mandated internet censorship in the context of protecting national security. Which option best reflects the primary challenge in balancing security concerns with individual freedoms?",
  "answer": "It undermines democratic principles and restricts free expression.",
  "options": [
   "It safeguards citizens from online threats and cyber attacks.",
   "It restricts access to extremist content and incitement to violence.",
   "It fosters public trust and confidence in government institutions."
  ],
  "why": "Censorship meant for security also silences legitimate speech and weakens democratic debate. Blocking threats or extremist content is the stated benefit, not the problem.",
  "source": "Ethics quiz bank (archived question 7)"
 },
 {
  "id": "eth-8",
  "lecture": "1",
  "cat": "Tech & society",
  "sub": "Tech & society",
  "type": "mc",
  "noRecall": true,
  "prompt": "Consider the ethical implications of autonomous vehicles in modern transportation systems. Which option best reflects a potential ethical dilemma associated with self-driving cars?",
  "answer": "They challenge traditional notions of moral responsibility and decision-making, raising questions about the ethical programming of AI systems.",
  "options": [
   "They introduce complex legal and regulatory challenges, requiring re-evaluation of liability frameworks and accident culpability.",
   "They confront societal norms regarding human drivers' autonomy and control, prompting philosophical debates on the ethics of automation.",
   "They present existential dilemmas regarding the value of human life versus machine preservation, challenging ethical frameworks in life-or-death scenarios."
  ],
  "why": "Someone must program in advance how the car chooses who is harmed in a crash, so it is unclear who bears moral responsibility. Liability law is the legal side, not the core ethical one.",
  "source": "Ethics quiz bank (archived question 8)"
 },
 {
  "id": "eth-9",
  "lecture": "1",
  "cat": "Ethical theories",
  "sub": "Other theories",
  "type": "mc",
  "prompt": "Ethical objectivism is based on the idea that:",
  "answer": "Moral principles exist independently of individual beliefs or societal constructs, implying an objective moral reality.",
  "options": [
   "Morality is entirely contingent upon subjective human perceptions and cultural norms, lacking any universal applicability.",
   "Morality is inherently intertwined with legal systems, suggesting that legal standards determine moral rightness or wrongness.",
   "The existence of a divine being is essential for establishing moral standards, indicating that morality is contingent upon religious doctrine."
  ],
  "why": "Objectivism holds that some moral truths exist whatever any person or culture believes, the opposite of relativism. Divine command theory is one source of objective morality, not its definition.",
  "source": "Ethics quiz bank (archived question 9)"
 },
 {
  "id": "eth-10",
  "lecture": "1",
  "cat": "Privacy & data",
  "sub": "Privacy",
  "type": "mc",
  "noRecall": true,
  "prompt": "Evaluate the ethical considerations surrounding the collection and storage of user data by online service providers. Which consideration should come first in data retention policies?",
  "answer": "Protecting user privacy against unauthorized access",
  "options": [
   "Enabling personalized experiences and targeted ads",
   "Sharing data to advance research and technology",
   "Complying with legal regulations and industry standards"
  ],
  "why": "Stored personal data can be breached, misused or repurposed, so retention policies should first limit what is kept and protect it. Legal compliance is a minimum, not the ethical goal.",
  "source": "Ethics quiz bank (archived question 10); prompt reworded 2026-10-17: it asked for the main 'concern' but the keyed answer was the protection goal (SE Code 3.12, 1.03)"
 },
 {
  "id": "eth-11",
  "lecture": "1",
  "cat": "Privacy & data",
  "sub": "Privacy",
  "type": "mc",
  "noRecall": true,
  "prompt": "Evaluate the ethical considerations surrounding the practice of online behavioral advertising based on user data tracking. Which option best articulates a nuanced ethical dilemma associated with targeted advertising?",
  "answer": "It prompts concerns regarding the manipulation of user behavior and the invasion of personal privacy, raising questions about the ethical boundaries of advertising practices.",
  "options": [
   "It offers personalized product recommendations, catering to individual preferences and enhancing shopping experiences.",
   "It upholds user privacy rights by obtaining explicit consent for data collection and usage, fostering trust between consumers and advertisers.",
   "It strives for transparency by disclosing data collection methods and purposes, aiming to build transparency and accountability in advertising processes."
  ],
  "why": "Targeted ads rely on tracking people's behaviour and are designed to steer their choices, so they help and intrude at once. Consent and transparency are possible fixes, not the dilemma.",
  "source": "Ethics quiz bank (archived question 11)"
 },
 {
  "id": "eth-12",
  "lecture": "1",
  "cat": "Tech & society",
  "sub": "Tech & society",
  "type": "mc",
  "noRecall": true,
  "prompt": "Evaluate the ethical implications of digital content manipulation technologies, such as deepfake videos. Which option best reflects a potential ethical concern associated with the proliferation of manipulated content?",
  "answer": "They undermine trust in visual evidence and authenticity, posing significant challenges to truth and reality.",
  "options": [
   "They foster creativity and artistic expression, expanding storytelling possibilities in media production.",
   "They prompt critical media literacy and awareness about the dangers of misinformation and digital manipulation.",
   "They enable entertainment industries to create immersive and engaging virtual experiences for audiences."
  ],
  "why": "Convincing fakes make false video easy to believe and real video easy to dismiss, so recorded evidence loses its value. Better media literacy is a response to that harm.",
  "source": "Ethics quiz bank (archived question 12)"
 },
 {
  "id": "eth-13",
  "lecture": "1",
  "cat": "Privacy & data",
  "sub": "Privacy",
  "type": "mc",
  "prompt": "How do social media platforms often navigate the tension between user privacy and data monetization?",
  "answer": "By leveraging user data to generate revenue while offering limited transparency",
  "options": [
   "By prioritizing user privacy over profit, regardless of financial implications",
   "By implementing strict data protection measures to prevent unauthorized access",
   "By refraining from collecting any user data to avoid privacy concerns"
  ],
  "why": "Free platforms earn money from user data, mostly through advertising, while their policies and settings reveal little about how the data is used.",
  "source": "Ethics quiz bank (archived question 13)"
 },
 {
  "id": "eth-14",
  "lecture": "1",
  "cat": "Ethical theories",
  "sub": "Kantianism",
  "type": "mc",
  "noRecall": true,
  "prompt": "How does Kant's first formulation of the categorical imperative differ from rule utilitarian ethics?",
  "answer": "It focuses on the intention behind actions",
  "options": [
   "It promotes the greatest happiness for the greatest number of people",
   "It prioritizes maxims that focus on the consequences of actions",
   "It emphasizes the intrinsic value of human beings"
  ],
  "why": "Rule utilitarianism judges a rule by its consequences; Kant asks whether you could will your maxim as a universal law, whatever happens. Intrinsic human value is Kant's second formulation.",
  "source": "Ethics quiz bank (archived question 14)"
 },
 {
  "id": "eth-15",
  "lecture": "1",
  "cat": "Professional ethics",
  "sub": "SE Code of Ethics",
  "type": "mc",
  "prompt": "An internet service provider sells its users' data without their explicit consent. How does this practice relate to the software engineering code of ethics?",
  "answer": "By prioritizing profit over the privacy and interests of users",
  "options": [
   "By providing users with clear and transparent information about data collection practices",
   "By ensuring that user agreements contain explicit consent clauses for data sharing",
   "By seeking user input and feedback on data usage policies"
  ],
  "why": "Selling data without consent puts profit ahead of users' privacy, against the code's duties not to diminish privacy (1.03) and to respect the privacy of those affected (3.12).",
  "source": "Ethics quiz bank (archived question 15); prompt given the ISP scenario 2026-10-17 (it referred to a case not on the card)"
 },
 {
  "id": "eth-16",
  "lecture": "1",
  "cat": "Tech & society",
  "sub": "Tech & society",
  "type": "mc",
  "prompt": "How might the advent of creative computers challenge traditional notions of intellectual property rights by blurring the lines between human and machine creativity?",
  "answer": "By erasing the distinction between human-authored and AI-generated works, complicating ownership and attribution",
  "options": [
   "By reinforcing existing copyright laws to accommodate AI-generated content within established frameworks",
   "By fostering a collaborative approach to content creation, diminishing the emphasis on individual ownership",
   "By empowering creators to assert control over AI-generated works through innovative licensing models and agreements"
  ],
  "why": "Copyright assumes a human author. When a machine generates much of a work, it is unclear who owns it or deserves credit: the user, the programmer, or no one.",
  "source": "Ethics quiz bank (archived question 16)"
 },
 {
  "id": "eth-17",
  "lecture": "1",
  "cat": "Privacy & data",
  "sub": "Privacy",
  "type": "mc",
  "prompt": "How might the concept of 'algorithmic bias' impact the privacy rights of individuals on social media platforms?",
  "answer": "Algorithmic bias can sustain discriminatory practices and infringe upon the privacy of marginalized groups",
  "options": [
   "Algorithmic bias ensures fair and unbiased content distribution",
   "Algorithmic bias has no correlation with privacy concerns",
   "Algorithmic bias enhances user privacy by tailoring content to individual preferences"
  ],
  "why": "Biased algorithms can infer sensitive traits and target or exclude groups by them, so people already disadvantaged lose both fair treatment and control over their information.",
  "source": "Ethics quiz bank (archived question 17)"
 },
 {
  "id": "eth-18",
  "lecture": "1",
  "cat": "Professional ethics",
  "sub": "SE Code of Ethics",
  "type": "mc",
  "prompt": "In situations where personal beliefs conflict with professional responsibilities, what does the Software Engineering Code of Ethics and Professional Practice recommend?",
  "answer": "Strive to reconcile personal beliefs with professional responsibilities",
  "options": [
   "Abstain from expressing personal beliefs in professional settings",
   "Seek guidance from colleagues with similar beliefs",
   "Prioritize personal beliefs over professional responsibilities"
  ],
  "why": "The code expects engineers to apply ethical judgment in the public interest, so personal convictions are weighed together with professional duties rather than simply overriding them or being hidden.",
  "source": "Ethics quiz bank (archived question 18)"
 },
 {
  "id": "eth-19",
  "lecture": "1",
  "cat": "Intellectual property",
  "sub": "Open source",
  "type": "mc",
  "prompt": "In the context of open-source software, what is the primary purpose of copyleft provisions in licenses such as the GNU General Public License (GPL)?",
  "answer": "To require that anyone distributing a modified version shares it under the same terms",
  "options": [
   "To restrict users from modifying the software in any way",
   "To ensure that the software remains proprietary and closed-source",
   "To encourage users to freely distribute the software without any restrictions"
  ],
  "why": "Copyleft lets anyone use, change and even sell the code, but redistributed modified versions must carry the same license and source, so improvements stay free. Distribution is not unrestricted.",
  "source": "Ethics quiz bank (archived question 19); answer reworded 2026-10-17: the GPL allows commercial sale; copyleft's condition is that distributed modifications stay under the GPL (gnu.org/licenses/copyleft, GPL FAQ)"
 },
 {
  "id": "eth-20",
  "lecture": "1",
  "cat": "Professional ethics",
  "sub": "Whistleblowing",
  "type": "mc",
  "noRecall": true,
  "prompt": "In what way does the Whistleblower Protection Act differ from the False Claims Act?",
  "answer": "Unlike the Whistleblower Protection Act, the False Claims Act safeguards corporate employees from retaliation.",
  "options": [
   "Unlike the False Claims Act, the Whistleblower Protection Act extends its protection to corporate employees.",
   "Unlike the Whistleblower Protection Act, the False Claims Act safeguards federal employees from retaliation.",
   "Unlike the Whistleblower Protection Act, the False Claims Act guarantees the anonymity of the whistle-blower."
  ],
  "why": "The WPA protects federal employees. The False Claims Act's anti-retaliation clause covers any employee, contractor or agent who reports fraud on the government, so it reaches private-company workers.",
  "source": "Ethics quiz bank (archived question 20); key corrected 2026-10-17: the WPA covers federal employees; the FCA's anti-retaliation clause (31 U.S.C. 3730(h)) covers any employee, contractor or agent"
 },
 {
  "id": "eth-21",
  "lecture": "1",
  "cat": "Ethical theories",
  "sub": "Other theories",
  "type": "mc",
  "prompt": "The problem of moral luck is raised as a criticism of:",
  "answer": "Act utilitarianism.",
  "options": [
   "Kantianism.",
   "Rule utilitarianism.",
   "Cultural relativism."
  ],
  "why": "Act utilitarianism judges an act by its actual outcome, and outcomes can depend on luck beyond your control. Kantianism judges the will and the rule, not the outcome.",
  "source": "Ethics quiz bank (archived question 21); key corrected 2026-10-17: the old key said Kantianism, but Quinn lists moral luck under act utilitarianism (e.g. UBC CS430 Lect2-3 slides)"
 },
 {
  "id": "eth-22",
  "lecture": "1",
  "cat": "Intellectual property",
  "sub": "Copyright & patents",
  "type": "mc",
  "prompt": "Under what circumstance might the courts consider the use of decompilation tools as fair use in software development?",
  "answer": "When the decompilation is necessary to achieve interoperability with other software",
  "options": [
   "When the software is licensed under an open-source agreement",
   "When the purpose is to create a competing product for commercial gain",
   "When the software being decompiled is protected by strong encryption"
  ],
  "why": "In Sega v. Accolade, decompiling to learn the interface needed for compatibility was fair use, even though Accolade sold competing games. Encryption or an open-source license is not the test.",
  "source": "Ethics quiz bank (archived question 22)"
 },
 {
  "id": "eth-23",
  "lecture": "1",
  "cat": "Professional ethics",
  "sub": "Whistleblowing",
  "type": "mc",
  "noRecall": true,
  "prompt": "What do the Whistleblower Protection Act and the False Claims Act have in common?",
  "answer": "Both of them protect certain whistle-blowers from employer retaliation.",
  "options": [
   "Neither of them safeguards corporate employees from retaliation.",
   "Both of them guarantee the anonymity of whistle-blowers.",
   "Neither of them safeguards federal employees from retaliation."
  ],
  "why": "Each bans retaliation against a group of whistle-blowers: the WPA covers federal employees, the FCA covers employees, contractors and agents reporting fraud on the government. Neither guarantees anonymity.",
  "source": "Ethics quiz bank (archived question 23); key corrected 2026-10-17: the FCA does protect corporate employees (31 U.S.C. 3730(h)), so 'neither safeguards corporate employees' was false; both laws bar retaliation"
 },
 {
  "id": "eth-24",
  "lecture": "1",
  "cat": "Security",
  "sub": "Attacks",
  "type": "mc",
  "prompt": "What ethical concern arises from the use of spear-phishing attacks, as discussed in the textbook?",
  "answer": "Breach of individual privacy and confidentiality",
  "options": [
   "Manipulation of public opinion and political discourse",
   "Disruption of legitimate business operations and services",
   "Exploitation of vulnerable populations for financial gain"
  ],
  "why": "Spear phishing sends a convincing message tailored to one person to trick them into revealing passwords or private data, so the core wrong is deceiving someone out of confidential information.",
  "source": "Ethics quiz bank (archived question 24)"
 },
 {
  "id": "eth-25",
  "lecture": "1",
  "cat": "Ethical theories",
  "sub": "Other theories",
  "type": "mc",
  "prompt": "What ethical theory would advocate for prioritizing the development of machines that can be trusted to act in the best interest of humans?",
  "answer": "Social Contract Theory",
  "options": [
   "Virtue Ethics",
   "Act Utilitarianism",
   "Deontological Ethics"
  ],
  "why": "Social contract theory grounds morality in rules rational people accept for mutual benefit, so trustworthy machines are ones that reliably keep those agreed rules in humans' favour.",
  "source": "Ethics quiz bank (archived question 25)"
 },
 {
  "id": "eth-26",
  "lecture": "1",
  "cat": "Ethical theories",
  "sub": "Other theories",
  "type": "mc",
  "prompt": "What ethical theory would prioritize fairness, impartiality, and due process in the implementation of AI systems within criminal justice systems?",
  "answer": "Deontological Ethics",
  "options": [
   "Act Utilitarianism",
   "Rule Utilitarianism",
   "Social Contract Theory"
  ],
  "why": "Fairness, impartiality and due process are duties owed to each person regardless of outcome, the core of deontology. An act utilitarian would trade them away for a better overall result.",
  "source": "Ethics quiz bank (archived question 26)"
 },
 {
  "id": "eth-27",
  "lecture": "1",
  "cat": "Intellectual property",
  "sub": "Copyright & patents",
  "type": "mc",
  "noRecall": true,
  "prompt": "What is a major difference between software copyrights and software patents?",
  "answer": "Software copyrights are granted automatically upon creation, while software patents require registration.",
  "options": [
   "Software copyrights protect the functionality of software, while software patents protect its expression",
   "Software copyrights have a shorter duration than software patents",
   "Software copyrights protect the source code, while software patents protect the underlying algorithms"
  ],
  "why": "Copyright exists the moment the code is written; a patent must be applied for and granted. Copyright protects expression, not function, and lasts far longer than a 20-year patent.",
  "source": "Ethics quiz bank (archived question 27)"
 },
 {
  "id": "eth-28",
  "lecture": "1",
  "cat": "Ethical theories",
  "sub": "Other theories",
  "type": "mc",
  "prompt": "When considering the ethical implications of creating machines that could render human labor obsolete, which ethical theory would prioritize ensuring the fair distribution of wealth generated by these machines?",
  "answer": "Social Contract Theory",
  "options": [
   "Act Utilitarianism",
   "Virtue Ethics",
   "Deontological Ethics"
  ],
  "why": "Rawls's social contract theory says inequalities are fair only if they benefit the least advantaged, so the wealth machines create should also reach the workers they displace.",
  "source": "Ethics quiz bank (archived question 28)"
 },
 {
  "id": "eth-29",
  "lecture": "1",
  "cat": "Professional ethics",
  "sub": "SE Code of Ethics",
  "type": "mc",
  "noRecall": true,
  "prompt": "Which action aligns with Principle 4 (Judgment) of the software engineering code of ethics in the scenario about a friend's misconduct at work?",
  "answer": "Reporting the friend's misconduct to the employer with evidence",
  "options": [
   "Confronting the friend directly about their behavior",
   "Seeking advice from colleagues on how to handle the situation",
   "Ignoring the friend's actions and focusing on one's own work"
  ],
  "why": "Integrity in judgment means not letting friendship bend an honest assessment: documented misconduct should reach someone who can act on it. Ignoring it protects the friend at others' expense.",
  "source": "Ethics quiz bank (archived question 29)"
 },
 {
  "id": "eth-30",
  "lecture": "1",
  "cat": "Professional ethics",
  "sub": "SE Code of Ethics",
  "type": "mc",
  "noRecall": true,
  "prompt": "Which action aligns with Principle (Judgment) of the software engineering code of ethics in the ergonomic workstation bill scenario?",
  "answer": "Conducting a comprehensive cost-benefit analysis before making a decision",
  "options": [
   "Rejecting the bill to avoid imposing financial burdens on organizations",
   "Passing the bill without considering its potential economic impact on organizations",
   "Seeking advice from industry lobbyists on how to proceed with the bill"
  ],
  "why": "Judgment asks for objective, independent evaluation. Weighing the bill's health benefits against its real costs before deciding is objective; rejecting or passing it without that analysis is not.",
  "source": "Ethics quiz bank (archived question 30)"
 },
 {
  "id": "eth-31",
  "lecture": "1",
  "cat": "Professional ethics",
  "sub": "SE Code of Ethics",
  "type": "mc",
  "noRecall": true,
  "prompt": "Which action aligns with Principle (Judgment) of the software engineering code of ethics in a scenario where a client requests a less secure system to cut costs?",
  "answer": "Refusing to build the system as requested and explaining the ethical implications",
  "options": [
   "Complying with the client's request to build a less secure system",
   "Negotiating a compromise solution that balances security and cost concerns",
   "Seeking advice from colleagues on how to proceed"
  ],
  "why": "Judgment means tempering technical decisions by human values, and a knowingly insecure system endangers users. Explaining the risks and declining keeps integrity; a compromise that leaves users exposed does not.",
  "source": "Ethics quiz bank (archived question 31)"
 },
 {
  "id": "eth-32",
  "lecture": "1",
  "cat": "Intellectual property",
  "sub": "Copyright & patents",
  "type": "mc",
  "prompt": "Which court case established that recording a television broadcast to watch later (time-shifting) is fair use?",
  "answer": "Sony Corporation of America v. Universal City Studios, Inc.",
  "options": [
   "Sega v. Accolade",
   "Sony Computer Entertainment, Inc. v. Connectix Corporation",
   "Authors Guild v. Google"
  ],
  "why": "The 1984 Betamax case held home time-shifting to be fair use. Sega v. Accolade and Connectix concerned decompiling for compatibility; software backup copies are allowed by statute, not a court case.",
  "source": "Ethics quiz bank (archived question 32); key corrected 2026-10-17: no listed case is about archival backups (those are allowed by statute, 17 U.S.C. 117) and Sega v. Accolade was about decompiling, so the prompt now asks for Sony v. Universal's real holding (copyright.gov fair-use summary)"
 },
 {
  "id": "eth-33",
  "lecture": "1",
  "cat": "Intellectual property",
  "sub": "Open source",
  "type": "mc",
  "noRecall": true,
  "prompt": "Which of the following actions is NOT typically permitted under most open-source software licenses?",
  "answer": "Reproducing the software without including the original license terms",
  "options": [
   "Charging exorbitant fees for distributing the software",
   "Modifying the source code to suit individual needs",
   "Using the software for commercial purposes without contributing back to the open-source community"
  ],
  "why": "Nearly every open-source license, from MIT to the GPL, requires copies to keep the license and copyright notice. Charging for distribution, even a high price, is allowed.",
  "source": "Ethics quiz bank (archived question 33); key corrected 2026-10-17: licenses require keeping the license and copyright notice, while charging any fee for distribution is allowed (GPL FAQ, gnu.org)"
 },
 {
  "id": "eth-34",
  "lecture": "1",
  "cat": "Intellectual property",
  "sub": "Copyright & patents",
  "type": "mc",
  "noRecall": true,
  "prompt": "Which of the following is NOT true regarding software copyrights?",
  "answer": "Software copyrights only protect the functionality of the software, not its code.",
  "options": [
   "Preloading a program onto a computer being sold violates software copyrights",
   "Software copyrights protect the expression of an idea, not the idea itself",
   "Source code of a software program is typically treated as a trade secret"
  ],
  "why": "Copyright protects expression, the code itself, not the idea or functionality, which is patent territory. Unlicensed preloading is infringement, and source code is commonly kept as a trade secret.",
  "source": "Ethics quiz bank (archived question 34)"
 },
 {
  "id": "eth-35",
  "lecture": "1",
  "cat": "Ethical theories",
  "sub": "Kantianism",
  "type": "mc",
  "noRecall": true,
  "prompt": "Which of the following statements best contrasts the method of rule derivation in Kantianism and social contract theory?",
  "answer": "Kantianism derives rules by assessing their compatibility with the Categorical Imperative, while social contract theory derives rules by evaluating their potential for mutual benefit if universally adopted.",
  "options": [
   "Kantianism derives rules by examining their conformity to universal moral laws, while social contract theory derives rules by considering their consequences for societal harmony.",
   "Kantianism derives rules based on their ability to promote individual happiness, while social contract theory derives rules based on divine commandments.",
   "Kantianism derives rules through empirical observation and experimentation, while social contract theory derives rules through deductive reasoning."
  ],
  "why": "Kant tests a rule by whether it could be willed as a universal law; social contract theory asks whether rational people would agree to it because everyone benefits when all follow it.",
  "source": "Ethics quiz bank (archived question 35)"
 },
 {
  "id": "eth-36",
  "lecture": "1",
  "cat": "Ethical theories",
  "sub": "Kantianism",
  "type": "mc",
  "noRecall": true,
  "prompt": "Which of the following statements best distinguishes between divine command theory and Kantianism?",
  "answer": "Both are objective: divine command theory grounds the good in God's will, Kant in reason",
  "options": [
   "Divine command theory grounds rules in human reason; Kantianism grounds them in divine will",
   "Both are subjective: moral rules vary with each person's beliefs and upbringing",
   "Divine command theory is objective, but Kant lets each person's reason set their own rules"
  ],
  "why": "Both hold that right and wrong are objective, but divine command theory finds them in God's will as revealed in holy books, while Kant derives them from reason alone.",
  "source": "Ethics quiz bank (archived question 36)"
 },
 {
  "id": "eth-37",
  "lecture": "1",
  "cat": "Professional ethics",
  "sub": "SE Code of Ethics",
  "type": "mc",
  "prompt": "Which software engineering code of ethics principle is most relevant to a man's dilemma about whether to report a coworker's misconduct?",
  "answer": "Judgment",
  "options": [
   "Client and Employer",
   "Public",
   "Product"
  ],
  "why": "Judgment covers integrity and independence: loyalty to a coworker must not override an honest assessment of misconduct. The other principles concern the client, the public, or product quality.",
  "source": "Ethics quiz bank (archived question 37)"
 },
 {
  "id": "eth-38",
  "lecture": "1",
  "cat": "Privacy & data",
  "sub": "Privacy",
  "type": "mc",
  "prompt": "Which software engineering code of ethics principle is most relevant to the internet service provider's dilemma about selling user data without explicit consent?",
  "answer": "Public",
  "options": [
   "Client and Employer",
   "Product",
   "Judgment"
  ],
  "why": "Selling data without consent harms the users, not the employer, and Principle 1 says engineers approve software only if it does not diminish privacy. That makes Public the controlling principle.",
  "source": "Ethics quiz bank (archived question 38)"
 },
 {
  "id": "eth-39",
  "lecture": "1",
  "cat": "Professional ethics",
  "sub": "SE Code of Ethics",
  "type": "mc",
  "prompt": "Which software engineering code of ethics principle is most relevant to the legislature's dilemma about the ergonomic workstation bill?",
  "answer": "Public",
  "options": [
   "Client and Employer",
   "Product",
   "Judgment"
  ],
  "why": "Workstation safety rules affect the health of everyone who works at a computer, the public at large. Principle 1 asks engineers to moderate business interests with the public good.",
  "source": "Ethics quiz bank (archived question 39)"
 },
 {
  "id": "eth-40",
  "lecture": "1",
  "cat": "Professional ethics",
  "sub": "SE Code of Ethics",
  "type": "mc",
  "prompt": "Which software engineering code of ethics principle is most relevant to the self-employed computer consultant's dilemma?",
  "answer": "Client and Employer",
  "options": [
   "Public",
   "Product",
   "Judgment"
  ],
  "why": "A consultant's dilemma centres on duties to the client: competence, confidentiality, honest reports, and no outside work against them. Principle 2 covers acting in the client's best interests.",
  "source": "Ethics quiz bank (archived question 40)"
 },
 {
  "id": "eth-41",
  "lecture": "1",
  "cat": "Ethical theories",
  "sub": "Utilitarianism",
  "type": "mc",
  "prompt": "In the Trolley Problem, if you choose to push the heavy man off the bridge to save five people, which ethical theory are you applying?",
  "answer": "Act Utilitarianism",
  "options": [
   "Kantianism",
   "Divine Command Theory",
   "Virtue Ethics"
  ],
  "why": "Pushing the man trades one life for five, judged only by the outcome of this single act: act utilitarianism. Kant forbids using the man merely as a means to save others.",
  "source": "Ethics quiz bank (archived question 41)"
 },
 {
  "id": "eth-42",
  "lecture": "1",
  "cat": "Tech & society",
  "sub": "Tech & society",
  "type": "mc",
  "prompt": "A developer argues that we shouldn't kill one person to save five because 'murder is inherently wrong, regardless of the outcome.' This reflects:",
  "answer": "Deontological Ethics",
  "options": [
   "Act Utilitarianism",
   "Ethical Egoism",
   "Subjective Relativism"
  ],
  "why": "Holding an act wrong in itself, whatever the outcome, is deontology: duties come before consequences. An act utilitarian would kill one to save five.",
  "source": "Ethics quiz bank (archived question 42)"
 },
 {
  "id": "eth-43",
  "lecture": "1",
  "cat": "Tech & society",
  "sub": "Tech & society",
  "type": "mc",
  "prompt": "Horowitz discusses a 'Moral Operating System.' What is the primary difficulty in hard-coding these ethics into AI?",
  "answer": "People and cultures disagree, so there is no single agreed rule set",
  "options": [
   "AI lacks the processing power to evaluate moral logic in real time",
   "There are no published ethics frameworks written for engineers",
   "Morality is purely mathematical, but AI cannot process emotions"
  ],
  "why": "People and cultures disagree about what is right, so there is no single agreed rule set to encode. Computing power is not the obstacle.",
  "source": "Ethics quiz bank (archived question 43)"
 },
 {
  "id": "eth-44",
  "lecture": "1",
  "cat": "Tech & society",
  "sub": "Tech & society",
  "type": "mc",
  "prompt": "Which concept addresses the 'Innovation Trade-off' mentioned in class?",
  "answer": "Balancing rapid progress against time to weigh societal impacts",
  "options": [
   "Choosing between open-source and proprietary software licences",
   "Trading a processor's speed against its heat output and power",
   "Weighing the cost of hiring an ethicist against a junior developer"
  ],
  "why": "Moving fast brings benefits sooner but leaves less time to foresee harms. The trade-off is how much speed to give up to weigh effects on society first.",
  "source": "Ethics quiz bank (archived question 44)"
 },
 {
  "id": "eth-45",
  "lecture": "1",
  "cat": "Security",
  "sub": "Attacks",
  "type": "mc",
  "prompt": "If a programmer believes that hacking is 'okay for me' even if society hates it, they are practicing:",
  "answer": "Subjective Relativism",
  "options": [
   "Cultural Relativism",
   "Kantianism",
   "Social Contract Theory"
  ],
  "why": "Subjective relativism says each person decides what is right for themselves, whatever society thinks. Cultural relativism would treat society's disapproval as decisive.",
  "source": "Ethics quiz bank (archived question 45)"
 },
 {
  "id": "eth-46",
  "lecture": "1",
  "cat": "Tech & society",
  "sub": "Tech & society",
  "type": "mc",
  "prompt": "A company chooses to dump toxic waste because it's 'not illegal in this specific country.' Which theory are they using to justify this?",
  "answer": "Cultural Relativism",
  "options": [
   "Kantianism",
   "Rule Utilitarianism",
   "Virtue Ethics"
  ],
  "why": "Cultural relativism says right and wrong depend on each society's norms, so 'allowed here' becomes 'acceptable here'. Rule utilitarianism would look at the harm the practice causes.",
  "source": "Ethics quiz bank (archived question 46)"
 },
 {
  "id": "eth-47",
  "lecture": "1",
  "cat": "Professional ethics",
  "sub": "SE Code of Ethics",
  "type": "mc",
  "prompt": "An engineer works for a 'Rogue Web Hosting' service solely because it pays 3x the market rate, ignoring the illegal content hosted there. This is an example of:",
  "answer": "Ethical Egoism",
  "options": [
   "Divine Command Theory",
   "Act Utilitarianism",
   "Social Contract Theory"
  ],
  "why": "Ethical egoism says the right act is whatever best serves your own long-term interest, here the pay, ignoring the harm to others.",
  "source": "Ethics quiz bank (archived question 47)"
 },
 {
  "id": "eth-48",
  "lecture": "1",
  "cat": "Ethical theories",
  "sub": "Kantianism",
  "type": "mc",
  "prompt": "Under Kant's Categorical Imperative, why would 'making a lying promise to a client' be unethical?",
  "answer": "Because if everyone did it, promises would mean nothing",
  "options": [
   "Because it would probably cause the client to lose money",
   "Because the engineer would feel guilty about it afterwards",
   "Because it violates the company's code of conduct"
  ],
  "why": "Kant's universalizability test: if everyone made lying promises, no one would trust a promise, so the maxim defeats itself. Possible money loss is a consequence, which Kant does not use.",
  "source": "Ethics quiz bank (archived question 48)"
 },
 {
  "id": "eth-49",
  "lecture": "1",
  "cat": "Ethical theories",
  "sub": "Kantianism",
  "type": "mc",
  "prompt": "Kant’s 'Principle of Humanity' states that you should never treat a person merely as a means to an end. In software, this means:",
  "answer": "Not using users as data sources without informed consent",
  "options": [
   "Always releasing the software to users free of charge",
   "Making the interface easy enough for every user to learn",
   "Paying everyone who works on the product a fair wage"
  ],
  "why": "Using people merely as means is using them for your ends, such as harvesting their data, without their informed consent. Consent lets them share the end as rational agents.",
  "source": "Ethics quiz bank (archived question 49)"
 },
 {
  "id": "eth-50",
  "lecture": "1",
  "cat": "Ethical theories",
  "sub": "Utilitarianism",
  "type": "mc",
  "prompt": "An engineer discovers a small bug that won't harm anyone but would cost the company millions to fix. They decide to hide it to protect the 'greatest happiness' (company stability). This is:",
  "answer": "Act Utilitarianism",
  "options": [
   "Rule Utilitarianism",
   "Kantianism",
   "Virtue Ethics"
  ],
  "why": "Weighing the consequences of this one decision to maximize total happiness is act utilitarianism. A rule utilitarian would ask what happens if hiding bugs became the general rule.",
  "source": "Ethics quiz bank (archived question 50)"
 },
 {
  "id": "eth-51",
  "lecture": "1",
  "cat": "Ethical theories",
  "sub": "Utilitarianism",
  "type": "mc",
  "prompt": "A Rule Utilitarian would likely argue that we should *always* tell the truth about software vulnerabilities because:",
  "answer": "A rule of honesty yields more trust and long-term happiness",
  "options": [
   "Scripture forbids lying, so honesty is commanded by God",
   "Lying is self-contradictory when universalized as a maxim",
   "The engineer who lies might be caught and fired for it"
  ],
  "why": "Rule utilitarianism judges rules by the results of everyone following them, and universal honesty builds the trust security depends on. 'Lying contradicts itself' is Kantian reasoning.",
  "source": "Ethics quiz bank (archived question 51)"
 },
 {
  "id": "eth-52",
  "lecture": "1",
  "cat": "Ethical theories",
  "sub": "Other theories",
  "type": "mc",
  "prompt": "Social Contract Theory suggests we follow laws (like not pirating software) because:",
  "answer": "We agree to common rules in exchange for a stable society",
  "options": [
   "God has commanded us to obey the laws of our rulers",
   "Piracy fails as a maxim when universalized by everyone",
   "Piracy reduces total happiness across everyone affected"
  ],
  "why": "Rational people accept rules like respecting others' property because everyone is better off when all follow them. 'Piracy reduces total happiness' is a utilitarian reason.",
  "source": "Ethics quiz bank (archived question 52)"
 },
 {
  "id": "eth-53",
  "lecture": "1",
  "cat": "Ethical theories",
  "sub": "Other theories",
  "type": "mc",
  "prompt": "In Virtue Ethics, the focus of a software engineer should be on:",
  "answer": "Developing the traits of an honest, diligent, fair professional",
  "options": [
   "Calculating the consequences of every line of code written",
   "Following the checklist of rules provided by the manager",
   "Maximizing personal profit while staying within the law"
  ],
  "why": "Virtue ethics asks what a good person would do, so it focuses on building traits such as honesty and diligence rather than calculating outcomes or following checklists.",
  "source": "Ethics quiz bank (archived question 53)"
 },
 {
  "id": "eth-54",
  "lecture": "1",
  "cat": "Privacy & data",
  "sub": "Privacy",
  "type": "mc",
  "prompt": "European privacy rules prioritize 'Right to be Forgotten.' This implies that privacy is:",
  "answer": "An inherent human right that overrides business interests.",
  "options": [
   "A commodity that can be sold for the right price.",
   "A privilege granted by the government to wealthy citizens.",
   "Only applicable to digital data, not physical files."
  ],
  "why": "A right to have your data erased, even against a company's wishes, treats privacy as a right of the person rather than a commodity the company owns.",
  "source": "Ethics quiz bank (archived question 54)"
 },
 {
  "id": "eth-55",
  "lecture": "1",
  "cat": "Privacy & data",
  "sub": "Privacy",
  "type": "mc",
  "prompt": "A 'checkout clerk' asking for your phone number is a privacy concern because:",
  "answer": "It collects personal data with no clear need or consent for reuse",
  "options": [
   "It slows down checkout and wastes every customer's time",
   "Phone numbers are confidential government-issued information",
   "The clerk could personally use the number to contact you"
  ],
  "why": "Data should not be collected without need or reused without consent. A phone number at checkout links your purchases to you for marketing.",
  "source": "Ethics quiz bank (archived question 55)"
 },
 {
  "id": "eth-56",
  "lecture": "1",
  "cat": "Privacy & data",
  "sub": "Privacy",
  "type": "mc",
  "prompt": "Data mining user behavior to predict political leanings without their knowledge is primarily an issue of:",
  "answer": "Informed Consent",
  "options": [
   "Data Accuracy",
   "Software Performance",
   "Copyright Infringement"
  ],
  "why": "Profiling people's political views without their knowledge denies them any chance to agree or refuse: a failure of informed consent, even if the predictions are accurate.",
  "source": "Ethics quiz bank (archived question 56)"
 },
 {
  "id": "eth-57",
  "lecture": "1",
  "cat": "Privacy & data",
  "sub": "Privacy",
  "type": "mc",
  "prompt": "If a company processes data in the EU, they must register with the government. This is a measure to ensure:",
  "answer": "Accountability and Transparency",
  "options": [
   "Higher tax revenue for the EU",
   "That the software is written in a specific language",
   "That the data is stored on expensive servers"
  ],
  "why": "Registering with the data protection authority lets someone check who holds personal data and what they do with it, making processors accountable and their practices visible.",
  "source": "Ethics quiz bank (archived question 57)"
 },
 {
  "id": "eth-58",
  "lecture": "1",
  "cat": "Security",
  "sub": "Attacks",
  "type": "mc",
  "prompt": "Why is an XSS (Cross-Site Scripting) attack an ethical failure for a developer?",
  "answer": "It fails to protect users from malicious code treated as trusted",
  "options": [
   "It wastes server bandwidth that other users have paid for",
   "It is only a problem if the attacker is eventually caught",
   "It slows page loads and degrades the site's performance"
  ],
  "why": "XSS works because a site runs attacker input as if it were its own trusted script. Developers owe the users who trust their site protection from that.",
  "source": "Ethics quiz bank (archived question 58)"
 },
 {
  "id": "eth-59",
  "lecture": "1",
  "cat": "Security",
  "sub": "Attacks",
  "type": "mc",
  "prompt": "Stealing a 'session cookie' via XSS is unethical because it:",
  "answer": "Allows an attacker to impersonate a user and violate their privacy and trust.",
  "options": [
   "Gives the attacker free access to the website's premium content.",
   "Corrupts the user's hard drive.",
   "Is a violation of the server's terms of service but not 'unethical.'"
  ],
  "why": "With the session cookie the attacker becomes the user, reading private data and acting in their name, betraying the trust the user placed in the site.",
  "source": "Ethics quiz bank (archived question 59)"
 },
 {
  "id": "eth-60",
  "lecture": "1",
  "cat": "Security",
  "sub": "Attacks",
  "type": "mc",
  "prompt": "A developer uses 'parameterized queries' to prevent SQL Injection. This aligns with which professional responsibility?",
  "answer": "Protecting the integrity of the product and user data",
  "options": [
   "Meeting the shortest possible deadline for the release",
   "Reducing the amount of code the team has to maintain",
   "Keeping the product's database queries fast and efficient"
  ],
  "why": "Parameterized queries stop attackers reading or altering the database. Protecting users' data and the product's integrity is a core professional duty.",
  "source": "Ethics quiz bank (archived question 60)"
 },
 {
  "id": "eth-61",
  "lecture": "1",
  "cat": "Security",
  "sub": "Attacks",
  "type": "mc",
  "prompt": "A 'Backdoor Trojan' is particularly deceptive because it:",
  "answer": "It disguises itself as harmless software to gain secret access",
  "options": [
   "It only runs on older computers with unpatched systems",
   "It is written exclusively by government intelligence agencies",
   "It spreads by itself across networks with no user action"
  ],
  "why": "A Trojan looks like useful software, so users install it themselves; once in, its backdoor gives the attacker secret remote access.",
  "source": "Ethics quiz bank (archived question 61)"
 },
 {
  "id": "eth-62",
  "lecture": "1",
  "cat": "Security",
  "sub": "Attacks",
  "type": "mc",
  "prompt": "Is 'White Hat' hacking ethical if you exploit a system without permission to show it can be done?",
  "answer": "Controversial: it exposes flaws but is still unauthorized access",
  "options": [
   "Yes, showing someone their security mistakes is always ethical",
   "No, hacking is always a sin under divine command theory",
   "Yes, as long as you do not steal money or damage data"
  ],
  "why": "Good intentions aside, entering a system without the owner's consent is unauthorized and can cause harm, so it is not clearly ethical.",
  "source": "Ethics quiz bank (archived question 62)"
 },
 {
  "id": "eth-63",
  "lecture": "1",
  "cat": "Intellectual property",
  "sub": "Copyright & patents",
  "type": "mc",
  "prompt": "What is the primary ethical goal of 'Fair Use' in copyright law?",
  "answer": "Balancing creators' profit with public access for education",
  "options": [
   "Letting students obtain any copyrighted software for free",
   "Preventing companies from profiting from public-domain works",
   "Ensuring creators are paid whenever their work is quoted"
  ],
  "why": "Fair use lets the public quote, criticize, teach and research without permission, while creators still profit from their work.",
  "source": "Ethics quiz bank (archived question 63)"
 },
 {
  "id": "eth-64",
  "lecture": "1",
  "cat": "Intellectual property",
  "sub": "Copyright & patents",
  "type": "mc",
  "prompt": "Why might a patent be 'worse' for society than a trade secret for software?",
  "answer": "It grants a 20-year monopoly that can stifle related innovation",
  "options": [
   "A patent's contents are easier to steal than a trade secret",
   "Patents only cover hardware, so software is left unprotected",
   "Trade secrets are legally required to be published after 20 years"
  ],
  "why": "A patent gives 20 years of exclusive control, even against independent inventors. A trade secret only stops copying, so others may still build the same thing.",
  "source": "Ethics quiz bank (archived question 64)"
 },
 {
  "id": "eth-65",
  "lecture": "1",
  "cat": "Intellectual property",
  "sub": "Copyright & patents",
  "type": "mc",
  "prompt": "Reverse engineering a competitor's software to ensure your app works with theirs (interoperability) is usually:",
  "answer": "Ethically and legally defensible as Fair Use.",
  "options": [
   "A form of corporate espionage that is always wrong.",
   "Only legal if you pay the competitor a fee.",
   "Forbidden by the SECEPP."
  ],
  "why": "Courts (Sega v. Accolade) held reverse engineering for compatibility to be fair use when it is the only way to learn the interface. No fee is needed.",
  "source": "Ethics quiz bank (archived question 65)"
 },
 {
  "id": "eth-66",
  "lecture": "1",
  "cat": "Professional ethics",
  "sub": "SE Code of Ethics",
  "type": "mc",
  "prompt": "A manager asks you to hide a security flaw from a client. Which professional principle is most directly violated?",
  "answer": "Judgment and Integrity",
  "options": [
   "Lifelong Learning",
   "Colleague Support",
   "Software Maintenance"
  ],
  "why": "Hiding a flaw is deception. Judgment requires integrity and independence rather than just following the manager, and the code requires disclosing dangers.",
  "source": "Ethics quiz bank (archived question 66)"
 },
 {
  "id": "eth-67",
  "lecture": "1",
  "cat": "Professional ethics",
  "sub": "SE Code of Ethics",
  "type": "mc",
  "prompt": "You see a coworker taking undue credit for a library you wrote. Which professional value should you uphold?",
  "answer": "Giving full credit to the work of others.",
  "options": [
   "Ignoring it to maintain a peaceful office.",
   "Taking credit for their work in return.",
   "Quitting the job immediately."
  ],
  "why": "The code asks engineers to credit fully the work of others and refuse undue credit, which includes correcting the record when someone takes credit for yours.",
  "source": "Ethics quiz bank (archived question 67)"
 },
 {
  "id": "eth-68",
  "lecture": "1",
  "cat": "Professional ethics",
  "sub": "SE Code of Ethics",
  "type": "mc",
  "prompt": "An engineer refuses to work on a project for a rogue hosting service because it harms the public good. They are prioritizing:",
  "answer": "The Public Interest",
  "options": [
   "The Client's Interest",
   "Their own Career",
   "Management's Instructions"
  ],
  "why": "Principle 1 puts the public interest first: serve clients only consistently with the public good, and avoid businesses that conflict with the code.",
  "source": "Ethics quiz bank (archived question 68)"
 },
 {
  "id": "eth-69",
  "lecture": "1",
  "cat": "Professional ethics",
  "sub": "SE Code of Ethics",
  "type": "mc",
  "prompt": "A company provides 'due process' before firing an engineer for an ethical breach. This ensures:",
  "answer": "Fairness and the right to a hearing.",
  "options": [
   "That the engineer cannot sue the company.",
   "That the company saves money on legal fees.",
   "That the code is fixed automatically."
  ],
  "why": "Due process means the accused learns the charges and can answer them before a decision is made. The code asks managers to provide it.",
  "source": "Ethics quiz bank (archived question 69)"
 },
 {
  "id": "eth-70",
  "lecture": "1",
  "cat": "Tech & society",
  "sub": "Tech & society",
  "type": "mc",
  "prompt": "Internet addiction is often viewed through the lens of 'unintended consequences.' Who is ethically responsible for mitigating this?",
  "answer": "Both the developers of 'sticky' designs and the users themselves",
  "options": [
   "Only the government, through regulation of the app industry",
   "Nobody; it is a personal choice with no ethical dimension",
   "Only the ISPs, since they provide the internet connection"
  ],
  "why": "Developers who design engagement-maximizing features share responsibility for compulsive use; users remain responsible for their own habits.",
  "source": "Ethics quiz bank (archived question 70)"
 },
 {
  "id": "eth-71",
  "lecture": "1",
  "cat": "Tech & society",
  "sub": "Tech & society",
  "type": "mc",
  "prompt": "Using algorithmic moderation to silence political dissent is an example of:",
  "answer": "Censorship that undermines free expression and democracy",
  "options": [
   "Efficient and neutral community management at scale",
   "A justified sacrifice made in the name of national security",
   "Applying Kant's categorical imperative to online speech"
  ],
  "why": "Removing speech because it criticizes those in power is censorship, whatever tool does it, and it undermines the open debate democracy needs.",
  "source": "Ethics quiz bank (archived question 71)"
 },
 {
  "id": "eth-72",
  "lecture": "1",
  "cat": "Tech & society",
  "sub": "Tech & society",
  "type": "mc",
  "prompt": "A programmer realizes their AI model for hiring is biased against women. Ethically, they should:",
  "answer": "Disclose the bias and fix the training data before deployment",
  "options": [
   "Deploy it anyway, since the underlying math is neutral",
   "Quietly delete the project and pretend it never existed",
   "Deploy it and let hiring managers correct the results"
  ],
  "why": "Deploying a tool known to be biased would harm applicants unfairly. Disclose the problem and fix the data before release rather than hiding it.",
  "source": "Ethics quiz bank (archived question 72)"
 },
 {
  "id": "eth-73",
  "lecture": "1",
  "cat": "Professional ethics",
  "sub": "SE Code of Ethics",
  "type": "mc",
  "prompt": "If a software engineer is not 'qualified' for a safety-critical medical project, they should:",
  "answer": "State their limitations honestly and get training or expert help",
  "options": [
   "Accept the job and learn the domain on the fly from videos",
   "Accept it, then delegate the hardest parts to an intern",
   "Accept it but charge more because the work is high-risk"
  ],
  "why": "Engineers must work within their competence and be honest about limits. On safety-critical work, faked competence risks lives, so get training or expert help.",
  "source": "Ethics quiz bank (archived question 73)"
 },
 {
  "id": "eth-74",
  "lecture": "1",
  "cat": "Professional ethics",
  "sub": "Whistleblowing",
  "type": "mc",
  "prompt": "Whistleblowing is considered a 'last resort' ethically because:",
  "answer": "It harms the firm and the whistleblower; internal routes come first",
  "options": [
   "It is illegal in every US state, whatever the motive",
   "The social contract obliges employees to defer to managers",
   "It violates the principle of lifelong learning in the code"
  ],
  "why": "It can damage the organization and the whistleblower's career, so the code asks engineers to raise concerns with the people involved first and go outside only when that fails.",
  "source": "Ethics quiz bank (archived question 74)"
 },
 {
  "id": "eth-75",
  "lecture": "1",
  "cat": "Professional ethics",
  "sub": "SE Code of Ethics",
  "type": "mc",
  "prompt": "The 'Digital Divide' (access to tech) is an ethical concern for software engineers because:",
  "answer": "It distributes software's benefits unfairly by economic status",
  "options": [
   "Poor customers buy too little software to make it profitable",
   "Slow connections in poor areas slow the internet for everyone",
   "Sharing software with those who cannot pay violates copyright"
  ],
  "why": "The code asks engineers to consider economic disadvantage and other factors that limit access to software's benefits, so those benefits do not go only to the well-off.",
  "source": "Ethics quiz bank (archived question 75)"
 },
 {
  "id": "eth-76",
  "lecture": "1",
  "cat": "Professional ethics",
  "sub": "SE Code of Ethics",
  "type": "mc",
  "prompt": "A software engineer volunteers to teach coding at a local library. This aligns with:",
  "answer": "The duty to contribute to public education about the discipline",
  "options": [
   "The need to find cheap junior labour for their own company",
   "The egoist's pursuit of personal fame and a better reputation",
   "The duty of lifelong learning to keep one's own skills current"
  ],
  "why": "Principle 1 encourages engineers to volunteer their skills to good causes and to contribute to public education about the discipline.",
  "source": "Ethics quiz bank (archived question 76)"
 },
 {
  "id": "eth-77",
  "lecture": "1",
  "cat": "Ethical theories",
  "sub": "Utilitarianism",
  "type": "mc",
  "prompt": "Why is 'Spam' considered a moral issue in a Utilitarian framework?",
  "answer": "The sender's small gain is outweighed by the total cost to millions",
  "options": [
   "It breaks God's intended use of email as private correspondence",
   "It treats recipients merely as means, violating their dignity",
   "It is a form of digital art protected as free expression"
  ],
  "why": "Spam costs the sender almost nothing, but millions of recipients each lose time and the network carries the load; the total harm outweighs the sender's gain.",
  "source": "Ethics quiz bank (archived question 77)"
 },
 {
  "id": "eth-78",
  "lecture": "1",
  "cat": "Privacy & data",
  "sub": "Privacy",
  "type": "mc",
  "prompt": "If a developer is asked to write code that monitors employee bathroom breaks, they should consider:",
  "answer": "Whether it violates the employees' privacy and dignity",
  "options": [
   "Whether the code should be written in Python or in Java",
   "How large a bonus the company will pay for the code",
   "Whether the code will run on the company's existing Wi-Fi"
  ],
  "why": "Monitoring bathroom breaks intrudes on a private moment and treats employees as objects to watch. Weigh their privacy and dignity before writing it.",
  "source": "Ethics quiz bank (archived question 78)"
 },
 {
  "id": "eth-79",
  "lecture": "1",
  "cat": "Tech & society",
  "sub": "Tech & society",
  "type": "mc",
  "prompt": "What is the 'nuanced dilemma' of targeted advertising?",
  "answer": "It offers relevant content but manipulates and invades privacy",
  "options": [
   "It makes ads look too polished to be trusted by viewers",
   "It only works on mobile phones, not desktop browsers",
   "It costs too much for small businesses to compete with"
  ],
  "why": "The same tracking that makes ads relevant lets advertisers profile and steer people, so the benefit and the harm come from one practice.",
  "source": "Ethics quiz bank (archived question 79)"
 },
 {
  "id": "eth-80",
  "lecture": "1",
  "cat": "Professional ethics",
  "sub": "SE Code of Ethics",
  "type": "mc",
  "prompt": "Treating software maintenance with the 'same professionalism' as new code means:",
  "answer": "Fixes get the same testing and quality standards as new code",
  "options": [
   "Maintenance work should be done free of charge for clients",
   "Maintenance always takes priority over building new features",
   "Old code should never be deleted, only marked as deprecated"
  ],
  "why": "The code says to treat maintenance with the same professionalism as new development: changes need the same testing, review and documentation.",
  "source": "Ethics quiz bank (archived question 80)"
 },
 {
  "id": "eth-81",
  "lecture": "1",
  "cat": "Intellectual property",
  "sub": "Copyright & patents",
  "type": "mc",
  "prompt": "A developer discovers a colleague is using pirated development tools. Ethically, they should:",
  "answer": "Encourage the colleague to follow the code and use legal tools",
  "options": [
   "Ignore it, since it does not affect the quality of their own code",
   "Report them to the police immediately, without speaking to them",
   "Start using the pirated tools as well, to stay competitive"
  ],
  "why": "Engineers must not knowingly use illegally obtained software and should encourage colleagues to follow the code, starting with a direct conversation.",
  "source": "Ethics quiz bank (archived question 81)"
 },
 {
  "id": "eth-82",
  "lecture": "1",
  "cat": "Ethical theories",
  "sub": "Kantianism",
  "type": "mc",
  "prompt": "The 'Social Dilemma' suggests that users are the 'product.' From a Kantian perspective, this is wrong because:",
  "answer": "It treats people merely as means (data), not as ends",
  "options": [
   "It makes people less happy than they would otherwise be",
   "It violates the data-protection laws of most countries",
   "It wastes electricity running the data centres behind it"
  ],
  "why": "Kant says treat people as ends, never merely as means. Selling users' attention and data treats them as raw material, not as persons who consented.",
  "source": "Ethics quiz bank (archived question 82)"
 },
 {
  "id": "eth-83",
  "lecture": "1",
  "cat": "Privacy & data",
  "sub": "Privacy",
  "type": "mc",
  "prompt": "An ISP selling your browsing history without telling you violates which core principle?",
  "answer": "Public Interest and Trust.",
  "options": [
   "Lifelong Learning.",
   "Colleague Support.",
   "Cost Estimation."
  ],
  "why": "Selling browsing history without notice betrays users; the code's first principle is acting in the public interest, including not diminishing privacy.",
  "source": "Ethics quiz bank (archived question 83)"
 },
 {
  "id": "eth-84",
  "lecture": "1",
  "cat": "Professional ethics",
  "sub": "SE Code of Ethics",
  "type": "mc",
  "prompt": "The 'Morality of Breaking the Law' suggests that an engineer might break a non-disclosure agreement (NDA) if:",
  "answer": "The software poses a grave danger to the public or environment",
  "options": [
   "They are offered a better-paying job at a competitor",
   "They are bored with the project and want to leave it",
   "The NDA is too long and complex for them to read fully"
  ],
  "why": "The code says obey the law unless, in exceptional cases, that conflicts with the public interest. Grave danger to the public can justify it; personal convenience cannot.",
  "source": "Ethics quiz bank (archived question 84)"
 },
 {
  "id": "eth-85",
  "lecture": "1",
  "cat": "Professional ethics",
  "sub": "SE Code of Ethics",
  "type": "mc",
  "prompt": "Why should engineers provide an 'uncertainty assessment' with their cost estimates?",
  "answer": "To avoid deceptive or speculative claims about the project",
  "options": [
   "To make the project look more complex than it really is",
   "Because the law requires every estimate to show +/- 5%",
   "To hide the fact that they lack the needed expertise"
  ],
  "why": "Estimates are uncertain. Stating the uncertainty lets clients decide on accurate information instead of trusting a single number that may be speculative.",
  "source": "Ethics quiz bank (archived question 85)"
 },
 {
  "id": "eth-86",
  "lecture": "1",
  "cat": "Security",
  "sub": "Attacks",
  "type": "mc",
  "prompt": "If a student hacks a school grading system 'just to see if they can,' they have violated:",
  "answer": "The property and privacy rights of the school and students",
  "options": [
   "Nothing, as long as they did not change any of the grades",
   "The duty of lifelong learning in the software engineering code",
   "Only copyright law, by copying the grading software"
  ],
  "why": "Breaking in without permission violates the school's property and exposes other students' records, even if nothing was changed.",
  "source": "Ethics quiz bank (archived question 86)"
 },
 {
  "id": "eth-87",
  "lecture": "1",
  "cat": "Tech & society",
  "sub": "Tech & society",
  "type": "mc",
  "prompt": "Deepfake technology is an ethical concern primarily because it:",
  "answer": "It undermines trust in visual evidence and truth",
  "options": [
   "It uses too much GPU power and energy to render",
   "It is mostly used for harmless memes and parody",
   "It infringes patents on video encoding formats"
  ],
  "why": "Deepfakes show people saying or doing things they never did, so video stops being reliable evidence and real footage can be dismissed as fake.",
  "source": "Ethics quiz bank (archived question 87)"
 },
 {
  "id": "eth-88",
  "lecture": "1",
  "cat": "Security",
  "sub": "Attacks",
  "type": "mc",
  "prompt": "Which theory would say 'If hacking makes me happy, it is right'?",
  "answer": "Subjective Relativism",
  "options": [
   "Kantianism",
   "Rule Utilitarianism",
   "Virtue Ethics"
  ],
  "why": "Subjective relativism makes each person the judge of what is right for them, so 'it makes me happy' would be enough.",
  "source": "Ethics quiz bank (archived question 88)"
 },
 {
  "id": "eth-89",
  "lecture": "1",
  "cat": "Ethical theories",
  "sub": "Other theories",
  "type": "mc",
  "prompt": "A 'Moral OS' would need to handle 'Global Norms.' This is hard because:",
  "answer": "What counts as 'private' or 'offensive' varies across cultures",
  "options": [
   "The internet is blocked or unavailable in some countries",
   "English is the only language code can be written in",
   "Norms apply only to people, so computers cannot follow them"
  ],
  "why": "Privacy expectations and what counts as offensive differ between cultures, so one rule set cannot fit every user.",
  "source": "Ethics quiz bank (archived question 89)"
 },
 {
  "id": "eth-90",
  "lecture": "1",
  "cat": "Tech & society",
  "sub": "Tech & society",
  "type": "mc",
  "prompt": "In the context of Rogue Web Hosting, 'systematically identifying moral dimensions' means:",
  "answer": "Examining effects on users, society, law and professional standards",
  "options": [
   "Checking that the servers are online and properly configured",
   "Calculating the hosting company's monthly electricity bill",
   "Identifying which hacker using the host is the most skilled"
  ],
  "why": "It means listing every stakeholder and how they are affected, plus the laws and professional duties involved, before reaching a judgment.",
  "source": "Ethics quiz bank (archived question 90)"
 },
 {
  "id": "eth-91",
  "lecture": "1",
  "cat": "Tech & society",
  "sub": "Tech & society",
  "type": "mc",
  "prompt": "The 'Tragedy of the Commons' in tech often refers to:",
  "answer": "Each firm overusing a shared resource until it is ruined for all",
  "options": [
   "A fire in a shared server room that destroys everyone's data",
   "A shared code repository being deleted by one careless user",
   "A free app crashing because too many people use it at once"
  ],
  "why": "Each actor gains by overusing a shared resource while the cost is spread over everyone, until the resource is ruined for all.",
  "source": "Ethics quiz bank (archived question 91)"
 },
 {
  "id": "eth-92",
  "lecture": "1",
  "cat": "Professional ethics",
  "sub": "SE Code of Ethics",
  "type": "mc",
  "prompt": "If a manager asks you to bypass 'adequate testing' to meet a launch date, you should:",
  "answer": "Point out it violates professional standards and the public interest",
  "options": [
   "Do it, because the manager takes responsibility for the outcome",
   "Quit immediately and report the company to the news media",
   "Do it, but document that you were ordered to skip testing"
  ],
  "why": "The code requires adequate testing and approving software only if it is safe. Raise the issue: a manager's pressure does not remove your responsibility.",
  "source": "Ethics quiz bank (archived question 92)"
 },
 {
  "id": "eth-93",
  "lecture": "1",
  "cat": "Security",
  "sub": "Attacks",
  "type": "mc",
  "prompt": "Parameterized queries prevent SQLi by:",
  "answer": "Treating input as data only, never as executable code",
  "options": [
   "Encrypting the entire database so stolen data is unreadable",
   "Rejecting any input that contains the word 'SELECT'",
   "Requiring a separate password for every query sent"
  ],
  "why": "The query and the input are sent separately, so input is always treated as a value and never parsed as SQL.",
  "source": "Ethics quiz bank (archived question 93)"
 },
 {
  "id": "eth-94",
  "lecture": "1",
  "cat": "Professional ethics",
  "sub": "SE Code of Ethics",
  "type": "mc",
  "prompt": "A developer 'credits fully the work of others' by:",
  "answer": "Properly attributing the libraries and code snippets used",
  "options": [
   "Paying the original developers directly for their code",
   "Putting the other developers' names in the app title",
   "Avoiding using any code that was written by other developers"
  ],
  "why": "Crediting others means attributing borrowed code and libraries properly, in the documentation and as their licenses require.",
  "source": "Ethics quiz bank (archived question 94)"
 },
 {
  "id": "eth-95",
  "lecture": "1",
  "cat": "Tech & society",
  "sub": "Tech & society",
  "type": "mc",
  "prompt": "Treating users with 'Irrelevant Prejudices' in software design might look like:",
  "answer": "Making an app unusable for people with disabilities, without reason",
  "options": [
   "Choosing a colour scheme that only a small share of users like",
   "Charging Pro users more than basic users for extra features",
   "Naming the app after a pet instead of its main function"
  ],
  "why": "The code forbids unfair treatment from irrelevant prejudices and asks engineers to consider physical disabilities that limit access. Excluding disabled users without reason breaks both.",
  "source": "Ethics quiz bank (archived question 95)"
 },
 {
  "id": "eth-96",
  "lecture": "1",
  "cat": "Security",
  "sub": "Attacks",
  "type": "mc",
  "prompt": "A 'Backdoor' in a script is dangerous because:",
  "answer": "Anyone who finds it, not just its creator, can use it",
  "options": [
   "It increases the script's file size and slows its startup",
   "It only works when the attacker has a fast connection",
   "It can only be used by the person who originally wrote it"
  ],
  "why": "A backdoor bypasses normal authentication, and anyone who discovers it, not only its creator, can use it.",
  "source": "Ethics quiz bank (archived question 96)"
 },
 {
  "id": "eth-97",
  "lecture": "1",
  "cat": "Professional ethics",
  "sub": "Whistleblowing",
  "type": "mc",
  "prompt": "Whistleblower protection generally covers employees who:",
  "answer": "Report wrongdoing to authorities to protect the public",
  "options": [
   "Leak trade secrets to a competitor in exchange for a job",
   "Complain publicly about the quality of the office coffee",
   "Report their boss to HR for being rude in meetings"
  ],
  "why": "Whistleblower laws protect people who report illegal or dangerous wrongdoing to proper authorities, not personal grievances or leaks for gain.",
  "source": "Ethics quiz bank (archived question 97)"
 },
 {
  "id": "eth-98",
  "lecture": "1",
  "cat": "Privacy & data",
  "sub": "Privacy",
  "type": "mc",
  "prompt": "Under strong privacy rules, can a company share your data across borders?",
  "answer": "Only with safeguards, such as the person's express consent.",
  "options": [
   "Yes, as long as the other country has faster servers.",
   "No, data can never leave the city where it was born.",
   "Only if the data is encrypted in 128-bit keys."
  ],
  "why": "Strict regimes like the EU's allow transfers abroad only when the data stays protected, for example to a country with adequate protection or with the person's explicit consent.",
  "source": "Ethics quiz bank (archived question 98); answer reworded 2026-10-17: EU rules allow transfers on adequacy or other safeguards, with explicit consent as one basis, not the only one (GDPR Arts 45, 49)"
 },
 {
  "id": "eth-99",
  "lecture": "1",
  "cat": "Tech & society",
  "sub": "Tech & society",
  "type": "mc",
  "prompt": "A 'Virtuous' programmer handles a project failure by:",
  "answer": "Owning the failure, documenting the errors, and learning from them",
  "options": [
   "Blaming the hardware vendor whose components were faulty",
   "Quietly fixing it without telling the client it ever failed",
   "Calculating whether admitting fault maximizes total happiness"
  ],
  "why": "Virtue ethics asks what a person of good character would do: own the failure, be honest about it, and learn from it.",
  "source": "Ethics quiz bank (archived question 99)"
 },
 {
  "id": "eth-100",
  "lecture": "1",
  "cat": "Ethical theories",
  "sub": "Other theories",
  "type": "mc",
  "prompt": "Which ethical theory is most 'mathematical' in its approach to right and wrong?",
  "answer": "Utilitarianism",
  "options": [
   "Virtue Ethics",
   "Divine Command Theory",
   "Subjective Relativism"
  ],
  "why": "Utilitarianism adds up the benefits and harms for everyone affected and picks the action with the best total: a calculation.",
  "source": "Ethics quiz bank (archived question 100)"
 },
 {
  "id": "eth-101",
  "lecture": "1",
  "cat": "Tech & society",
  "sub": "Tech & society",
  "type": "mc",
  "prompt": "If you follow the law *only* because you are afraid of jail, you are acting based on:",
  "answer": "Ethical Egoism (self-interest)",
  "options": [
   "Social Contract Theory",
   "Kantianism",
   "Rule Utilitarianism"
  ],
  "why": "Obeying only to avoid punishment makes self-interest the reason: ethical egoism. Social contract theory obeys because shared rules benefit everyone.",
  "source": "Ethics quiz bank (archived question 101)"
 },
 {
  "id": "eth-102",
  "lecture": "1",
  "cat": "Professional ethics",
  "sub": "SE Code of Ethics",
  "type": "mc",
  "prompt": "The 'Fair Hearing' principle for colleagues means:",
  "answer": "Listening to their concerns or complaints objectively",
  "options": [
   "Giving everyone equal speaking time at every meeting",
   "Letting them win arguments to keep the team happy",
   "Taking disputes to a formal tribunal for judgement"
  ],
  "why": "The code asks engineers to give a fair hearing to colleagues' opinions, concerns and complaints, judging them on their merits.",
  "source": "Ethics quiz bank (archived question 102)"
 },
 {
  "id": "eth-103",
  "lecture": "1",
  "cat": "Professional ethics",
  "sub": "SE Code of Ethics",
  "type": "mc",
  "prompt": "'Lifelong Learning' in software ethics is a duty because:",
  "answer": "Tech changes fast, so old methods can become unsafe",
  "options": [
   "It lets you charge clients more per hour of work",
   "It is the only way to qualify for a graduate degree",
   "The code requires a set number of course hours each year"
  ],
  "why": "Practices, tools and threats change quickly, and outdated methods can produce unsafe software, so the code asks engineers to keep learning throughout their careers.",
  "source": "Ethics quiz bank (archived question 103)"
 },
 {
  "id": "eth-104",
  "lecture": "1",
  "cat": "Security",
  "sub": "Attacks",
  "type": "mc",
  "prompt": "An SQL injection that extracts an entire database violates which privacy principle?",
  "answer": "Confidentiality and Integrity",
  "options": [
   "Availability and Usability",
   "Cost Efficiency and Scalability",
   "Public Education and Outreach"
  ],
  "why": "Dumping the database exposes data to unauthorized people, a confidentiality breach, and shows the system cannot guarantee its data's integrity. Nothing was made unavailable.",
  "source": "Ethics quiz bank (archived question 104)"
 },
 {
  "id": "eth-105",
  "lecture": "1",
  "cat": "Privacy & data",
  "sub": "Privacy",
  "type": "mc",
  "prompt": "Why is it unethical to use accurate data in 'unauthorized ways'?",
  "answer": "It violates the trust and consent of the person who gave it",
  "options": [
   "It reduces the data's accuracy each time it is reused",
   "It uses up database storage the user has not paid for",
   "It only matters when the data turns out to be false"
  ],
  "why": "People give data for a purpose. Using even accurate data in ways they did not authorize breaks the trust and consent under which it was given.",
  "source": "Ethics quiz bank (archived question 105)"
 },
 {
  "id": "eth-106",
  "lecture": "1",
  "cat": "Professional ethics",
  "sub": "SE Code of Ethics",
  "type": "mc",
  "prompt": "A manager who punishes an engineer for expressing ethical concerns is:",
  "answer": "Violating the professional standards of management",
  "options": [
   "Being a strong leader who keeps the team on schedule",
   "Practicing act utilitarianism for the team's benefit",
   "Upholding the social contract within the company"
  ],
  "why": "The code says managers must not punish anyone for expressing ethical concerns about a project.",
  "source": "Ethics quiz bank (archived question 106)"
 },
 {
  "id": "eth-107",
  "lecture": "1",
  "cat": "Professional ethics",
  "sub": "SE Code of Ethics",
  "type": "mc",
  "prompt": "Software engineering 'Integrity' means:",
  "answer": "Staying objective even under pressure from clients or bosses",
  "options": [
   "Always shipping code that has been proven 100% bug-free",
   "Only working for clients whose values match your own",
   "Keeping the code base internally consistent and unmodified"
  ],
  "why": "Integrity under the Judgment principle means keeping professional judgment independent and objective, even when clients or managers push for a different answer.",
  "source": "Ethics quiz bank (archived question 107)"
 },
 {
  "id": "eth-108",
  "lecture": "1",
  "cat": "Tech & society",
  "sub": "Tech & society",
  "type": "mc",
  "prompt": "If a country censors the internet to 'promote social cohesion,' they are prioritizing:",
  "answer": "The State's goals over individual freedom of expression",
  "options": [
   "Individual expression over the State's collective goals",
   "Kantian duty over the overall happiness of citizens",
   "Minority rights over the views of the majority"
  ],
  "why": "Censoring speech for the sake of unity puts the state's goals ahead of each person's freedom of expression; the stated aim does not change that trade-off.",
  "source": "Ethics quiz bank (archived question 108)"
 },
 {
  "id": "eth-109",
  "lecture": "1",
  "cat": "Intellectual property",
  "sub": "Copyright & patents",
  "type": "mc",
  "prompt": "A copyright protects the 'Expression' of code. This means:",
  "answer": "Others can't copy your exact code but may reimplement the idea",
  "options": [
   "No one may use the same loop or algorithm as you again",
   "Your code must be kept secret so no one else can see it",
   "You own the idea, so others cannot reimplement it at all"
  ],
  "why": "Copyright covers the specific code you wrote, not the idea or algorithm behind it, so others may write their own implementation of the same idea.",
  "source": "Ethics quiz bank (archived question 109)"
 },
 {
  "id": "eth-110",
  "lecture": "1",
  "cat": "Intellectual property",
  "sub": "Copyright & patents",
  "type": "mc",
  "prompt": "'Decompilation' is legally fair use when:",
  "answer": "It is the only way to make two different software systems work together.",
  "options": [
   "You want to see how a competitor's secret algorithm works.",
   "You want to steal their art assets.",
   "The software was free to begin with."
  ],
  "why": "Courts allow decompiling when it is the only way to learn the interface needed for interoperability. Copying secret algorithms or assets is not fair use.",
  "source": "Ethics quiz bank (archived question 110)"
 },
 {
  "id": "eth-111",
  "lecture": "1",
  "cat": "Professional ethics",
  "sub": "SE Code of Ethics",
  "type": "mc",
  "prompt": "Why is 'Double Billing' (charging two clients for the same hour of work) unethical?",
  "answer": "It is a deceptive financial practice that violates honesty",
  "options": [
   "It gives the engineer an unfair advantage over competitors",
   "It is only wrong if a client actually notices the overlap",
   "It infringes the client's copyright in the delivered code"
  ],
  "why": "Double billing deceives clients about the work they pay for. The code names it, with bribery, as a deceptive financial practice.",
  "source": "Ethics quiz bank (archived question 111)"
 },
 {
  "id": "eth-112",
  "lecture": "1",
  "cat": "Ethical theories",
  "sub": "Kantianism",
  "type": "mc",
  "prompt": "In the 'Trolley Dilemma,' if you do nothing and 5 people die, a Kantian might say:",
  "answer": "You are not responsible, since you did not act to kill",
  "options": [
   "You are a hero, since refusing to act is always right",
   "You were obliged to divert it and kill the one instead",
   "You failed to maximize happiness by letting five die"
  ],
  "why": "Kant distinguishes doing from allowing: diverting the trolley would use one person as a means, while not acting does not make you a killer. Maximizing happiness is the utilitarian concern.",
  "source": "Ethics quiz bank (archived question 112)"
 },
 {
  "id": "eth-113",
  "lecture": "1",
  "cat": "Tech & society",
  "sub": "Tech & society",
  "type": "mc",
  "prompt": "Social media 'Echo Chambers' are an ethical concern because they:",
  "answer": "Polarize society and reduce the diversity of discourse",
  "options": [
   "Slow down the apps by loading too much similar content",
   "Overwhelm users with too many repetitive notifications",
   "Are a problem only in North American political debates"
  ],
  "why": "Feeds show people more of what they already believe, so groups see less of each other's views and society becomes more polarized.",
  "source": "Ethics quiz bank (archived question 113)"
 },
 {
  "id": "eth-114",
  "lecture": "1",
  "cat": "Professional ethics",
  "sub": "SE Code of Ethics",
  "type": "mc",
  "prompt": "An engineer who 'Accepts full responsibility' for their work (1.01) would:",
  "answer": "Admit a mistake rather than blame a teammate or the user",
  "options": [
   "Demand a higher salary to reflect the extra responsibility",
   "Work alone and never let anyone review their code",
   "Never stop working until the project is fully done"
  ],
  "why": "Accepting full responsibility means owning your mistakes instead of shifting the blame onto teammates or users.",
  "source": "Ethics quiz bank (archived question 114)"
 },
 {
  "id": "eth-115",
  "lecture": "1",
  "cat": "Intellectual property",
  "sub": "Copyright & patents",
  "type": "mc",
  "prompt": "A software patent lasts for 20 years. This duration is intended to:",
  "answer": "Reward the inventor with a limited monopoly for disclosure",
  "options": [
   "Ensure the inventor earns enough to become very wealthy",
   "Keep the technology secret from competitors for 20 years",
   "Stop anyone from ever using the technology commercially"
  ],
  "why": "A patent gives the inventor temporary exclusive rights in return for publishing how the invention works; after 20 years anyone may use it.",
  "source": "Ethics quiz bank (archived question 115)"
 },
 {
  "id": "eth-116",
  "lecture": "1",
  "cat": "Professional ethics",
  "sub": "SE Code of Ethics",
  "type": "mc",
  "prompt": "Why should engineers avoid 'Speculative' claims about software performance?",
  "answer": "They mislead clients about what the product can actually do",
  "options": [
   "They make sales harder by setting expectations too high",
   "They are fine as long as the software eventually works",
   "They breach the software's licence agreement with clients"
  ],
  "why": "The code asks engineers to avoid false, speculative or misleading claims about software, since clients and the public rely on them.",
  "source": "Ethics quiz bank (archived question 116)"
 },
 {
  "id": "eth-117",
  "lecture": "1",
  "cat": "Privacy & data",
  "sub": "Privacy",
  "type": "mc",
  "prompt": "If an app tracks your location 24/7 to 'improve performance' but doesn't tell you, it violates:",
  "answer": "Transparency and informed consent",
  "options": [
   "Data accuracy and integrity",
   "The terms of the GPL licence",
   "Copyright in the location data"
  ],
  "why": "Hidden constant tracking collects sensitive data without telling users or asking consent, so they cannot decide whether to accept it.",
  "source": "Ethics quiz bank (archived question 117)"
 },
 {
  "id": "eth-118",
  "lecture": "1",
  "cat": "Ethical theories",
  "sub": "Utilitarianism",
  "type": "mc",
  "prompt": "A Rule Utilitarian might support 'Freedom of Expression' because:",
  "answer": "Free sharing of ideas makes society happier and more innovative",
  "options": [
   "It is a logical requirement of the categorical imperative",
   "The constitution guarantees it, so obeying it is a duty",
   "God commands that truth be spoken freely by everyone"
  ],
  "why": "A rule utilitarian adopts the rule whose general practice produces the most happiness; free expression spreads ideas and exposes errors, benefiting society.",
  "source": "Ethics quiz bank (archived question 118)"
 },
 {
  "id": "eth-119",
  "lecture": "1",
  "cat": "Tech & society",
  "sub": "Tech & society",
  "type": "mc",
  "prompt": "Which theory says 'The right thing to do is whatever God says is right'?",
  "answer": "Divine Command Theory",
  "options": [
   "Subjective Relativism",
   "Kantianism",
   "Social Contract Theory"
  ],
  "why": "Divine command theory says an act is right because God commands it and wrong because God forbids it.",
  "source": "Ethics quiz bank (archived question 119)"
 },
 {
  "id": "eth-120",
  "lecture": "1",
  "cat": "Professional ethics",
  "sub": "SE Code of Ethics",
  "type": "mc",
  "prompt": "A developer who 'credits the work of others' is primarily being:",
  "answer": "Honest and supportive of their colleagues.",
  "options": [
   "Lazy for not writing their own code.",
   "A rule-breaker.",
   "Fearful of getting sued."
  ],
  "why": "Crediting others is honest about who did the work and fair to colleagues, which the Colleagues principle asks for.",
  "source": "Ethics quiz bank (archived question 120)"
 },
 {
  "id": "eth-121",
  "lecture": "1",
  "cat": "Tech & society",
  "sub": "Tech & society",
  "type": "mc",
  "prompt": "If a robot kills a person, who is ethically responsible according to the class discussions?",
  "answer": "Its creators, programmers and the organizations that deployed it",
  "options": [
   "The robot itself, since it acted as an autonomous moral agent",
   "Only the person operating it at the time of the incident",
   "Nobody; it's an 'act of God' like a natural disaster"
  ],
  "why": "A robot is not a moral agent, so responsibility falls on the people who designed, programmed and deployed it.",
  "source": "Ethics quiz bank (archived question 121)"
 },
 {
  "id": "eth-122",
  "lecture": "1",
  "cat": "Ethical theories",
  "sub": "Other theories",
  "type": "mc",
  "prompt": "Finally, why is 'Professional Objectivity' important in software evaluation?",
  "answer": "Software is judged on its merits, not personal gain or bias",
  "options": [
   "It makes evaluations faster and cheaper for the client",
   "It is required by law for all safety-critical software",
   "It lets evaluators disregard user needs in favour of specs"
  ],
  "why": "Professional objectivity means judging software on its merits, not on friendships, payments or rivalries, so the evaluation can be trusted.",
  "source": "Ethics quiz bank (archived question 122)"
 }
],
    blanks: [],
  };
})(globalThis.FC = globalThis.FC || {});
