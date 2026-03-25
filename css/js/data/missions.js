/**
 * Mission definitions database - Password Section (10 Levels) — IMPROVED v2
 *
 * Fixes applied:
 *  L2  — maxAttempts raised to 2; second wrong choice costs vault, not instant fail
 *  L6  — salt concept now has a visible hash-comparison panel before multi-select
 *  L7  — first-15s ramp: attack spawn starts at 5s min, eases to 2s after 15s
 *  L9  — tiered win threshold (0-5% = pass, 6-15% = partial, 16%+ = fail)
 *  L10 — live rating preview fires on every dropdown change during Phase 1
 *  ALL — "knowledge summary" card surfaced as post-completion overlay
 *  ALL — completed levels show "Replay" button in mission grid
 */

/* ─── shared password training pool ──────────────────────────────────────── */

const passwordTrainingPool = [
  { value: "sarah1998",                  weak: true,  tags: ["name_year","osint"] },
  { value: "rahim2001",                  weak: true,  tags: ["name_year","osint"] },
  { value: "maria2000",                  weak: true,  tags: ["name_year","osint"] },
  { value: "tania1997",                  weak: true,  tags: ["name_year","osint"] },
  { value: "shadowdef2024",             weak: true,  tags: ["company_number","pattern"] },
  { value: "acmecorp123",               weak: true,  tags: ["company_number","pattern"] },
  { value: "northstar1",                weak: true,  tags: ["company_number","pattern"] },
  { value: "welcome123",                weak: true,  tags: ["leaked","common"] },
  { value: "password123",               weak: true,  tags: ["leaked","common"] },
  { value: "admin123",                  weak: true,  tags: ["leaked","common"] },
  { value: "letmein",                   weak: true,  tags: ["leaked","common"] },
  { value: "qwerty123",                 weak: true,  tags: ["keyboard","pattern"] },
  { value: "asdfghjkl",                 weak: true,  tags: ["keyboard","pattern"] },
  { value: "1q2w3e4r",                  weak: true,  tags: ["keyboard","pattern"] },
  { value: "123456",                    weak: true,  tags: ["sequence","common"] },
  { value: "12345678",                  weak: true,  tags: ["sequence","common"] },
  { value: "987654321",                 weak: true,  tags: ["sequence","pattern"] },
  { value: "11111111",                  weak: true,  tags: ["sequence","pattern"] },
  { value: "football7",                 weak: true,  tags: ["leaked","common"] },
  { value: "iloveyou",                  weak: true,  tags: ["leaked","common"] },
  { value: "dragon",                    weak: true,  tags: ["leaked","common"] },
  { value: "sunshine99",                weak: true,  tags: ["pattern","common"] },
  { value: "T7!kP9@vQ2",               weak: false, tags: ["random","strong"] },
  { value: "nR4$zL8#pW1",              weak: false, tags: ["random","strong"] },
  { value: "X2@bM9!qL7#",             weak: false, tags: ["random","strong"] },
  { value: "vQ8!rN3@tP6$",            weak: false, tags: ["random","strong"] },
  { value: "BlueRiver!Train!Cloud!19", weak: false, tags: ["passphrase","strong"] },
  { value: "Orbit-Mango-Delta-47!Signal", weak: false, tags: ["passphrase","strong"] },
  { value: "QuietFalcon_StoneWave_882", weak: false, tags: ["passphrase","strong"] },
  { value: "Maple!Harbor!Cipher!204",  weak: false, tags: ["passphrase","strong"] },
  { value: "Lemon&Steel&Comet&431",    weak: false, tags: ["passphrase","strong"] },
  { value: "SignalBridge!Aurora!915",  weak: false, tags: ["passphrase","strong"] },
  { value: "Correct-Horse-Battery-Staple", weak: false, tags: ["passphrase","strong"] },
  { value: "GreenFalcon_Cipher_302",   weak: false, tags: ["passphrase","strong"] },
  { value: "OrbitDelta!Safe!551",      weak: false, tags: ["passphrase","strong"] },
  { value: "N7#hP4@kR2!x",            weak: false, tags: ["random","strong"] },
];

const randomPick = (arr, n) => {
  const clone = arr.slice();
  for (let i = clone.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  return clone.slice(0, n);
};

const makeTrainingSession = (weakTags, strongTags, storyHint, failHints, securityInsight, total = 8, weakCount = 6) => {
  const weakPool  = passwordTrainingPool.filter(p =>  p.weak && p.tags.some(t => weakTags.includes(t)));
  const strongPool = passwordTrainingPool.filter(p => !p.weak && p.tags.some(t => strongTags.includes(t)));
  const weak   = randomPick(weakPool,   weakCount);
  const strong = randomPick(strongPool, total - weakCount);
  const mixed  = randomPick([...weak, ...strong], total);
  return {
    options: mixed.map((p, i) => ({ id: i + 1, value: p.value, isWeak: p.weak, tags: p.tags || [] })),
    weakAnswers: weak.map(p => p.value),
    correctWeakPasswords: weak.map(p => p.value),
    storyHint,
    failHints,
    securityInsight,
  };
};

const validateWeakSelection = (selectedIds, session) => {
  const weakIds = session.options.filter(o => o.isWeak).map(o => o.id);
  const sel = {};
  selectedIds.forEach(id => { sel[id] = true; });
  return weakIds.every(id => !!sel[id]) &&
         selectedIds.every(id => {
           const item = session.options.find(o => o.id === id);
           return item && item.isWeak;
         });
};

/* ─── knowledge summary helper (used by every level) ──────────────────────── */
// Each level declares a `knowledgeSummary` object:
//   { title, bullets: string[], insight }
// The GameScreen reads this and shows a post-completion overlay before the
// results modal.  No changes needed to PasswordCrack.js — this is data only.

/* ══════════════════════════════════════════════════════════════════════════
   LEVEL 1 — Human Password Psychology
   Status: SOLID — minor copy polish + knowledge summary added
   ══════════════════════════════════════════════════════════════════════════ */
const level1 = {
  id: 1, level: 1,
  title: "LEVEL 1: Human Password Psychology",
  desc: "Work a calm analyst briefing, spot predictable human passwords, and stop the easiest attack path first.",
  difficulty: "Easy", type: "password",
  estimatedTime: "5-7 min",
  objective: "Detect predictable password choices before adversaries weaponize them.",
  scenario: "A small contractor breach exposed a shortlist of employee passwords. Your first analyst task is to separate easy human-generated passwords from resilient credentials before an attacker builds a wordlist.",
  userTask: "Review the analyst board and flag every weak password without tagging strong ones.",
  simulationLogic: "Educational classification simulation only.",
  visualMode: "2D",
  successCondition: "Select all weak passwords and no strong passwords.",
  successFeedback: "Credential vulnerability identified. Human predictability confirmed.",
  failureFeedback: "Security oversight detected. Reassess behavioral patterns.",
  objectives: [
    "Analyze the story-based investigative hint",
    "Identify weak passwords using human behavior patterns",
    "Classify credentials with SOC decision accuracy",
  ],
  hintSystem: {
    hint1: "Investigation note: personal details often become passwords.",
    hint2: "Look for names, years, and very common words.",
    hint3: "Focus on patterns attackers can guess from social media.",
  },
  knowledgeSummary: {
    title: "Why human-pattern passwords are dangerous",
    bullets: [
      "Attackers use OSINT (names, dates, job titles) to build targeted wordlists.",
      "Leaked password databases mean 'common' passwords are cracked in seconds.",
      "Length and unpredictability matter more than complexity rules alone.",
    ],
    insight: "The most secure password is one an attacker can't guess — even if they know everything about you.",
  },
  puzzle: {
    interactionMode: "humanPsychologyLab",
    maxAttempts: 3,
    requiredSelection: "all_weak_only",
    revealAnswerOnFail: false,
    timeLimit: 180,
    visualProfile: "human-pattern",
    riskSystem: {
      start: 0, wrongAdd: 20, max: 100,
      label: "Risk Meter",
      breachMessage: "Breach simulation: too many wrong choices gave the attacker enough chances.",
    },
    generateSession: function () {
      return makeTrainingSession(
        ["name_year","osint","common"],
        ["strong","random","passphrase"],
        "During review, SOC saw passwords that looked like personal details and easy words. Attackers can guess these fast from public information.",
        [
          "Check for names, years, and simple words first.",
          "If it looks personal or common, it is usually weak.",
          "Strong passwords look less predictable and less personal.",
        ],
        [
          "Attackers use public information (OSINT) like names and dates to guess passwords.",
          "Leaked password lists are powerful because many people reuse common passwords.",
          "Human-made passwords are often predictable.",
        ],
      );
    },
    validateSelection: validateWeakSelection,
  },
  aiSpeed: 0.75,
  rewards: { xp: 140, credits: 70 },
  completed: false, locked: false, bestScore: 0,
};

/* ══════════════════════════════════════════════════════════════════════════
   LEVEL 2 — Live Attack Detection
   FIX: maxAttempts raised to 2; wrong answer costs vault rather than
        immediately failing.  Player must notice the pattern and correct.
   ══════════════════════════════════════════════════════════════════════════ */
const level2 = {
  id: 2, level: 2,
  title: "LEVEL 2: Live Attack Detection",
  desc: "Watch live login attempts and identify the attack type before the vault collapses.",
  difficulty: "Easy", type: "password",
  estimatedTime: "3-5 min",
  objective: "Identify the attack type before Vault Integrity reaches zero.",
  scenario: "You are on SOC duty. Login attempts stream every second. Read the pattern and choose the correct attack type — you have two chances.",
  userTask: "Flag the strongest indicators, identify the correct attack type, then activate the right containment. A wrong attack label costs vault integrity.",
  simulationLogic: "Training simulation only.",
  visualMode: "2D",
  successCondition: "Choose the correct attack type before vault integrity reaches 0.",
  successFeedback: "Good decision. The attack pattern was correctly identified and blocked.",
  failureFeedback: "The wrong decisions gave the attacker more time. Review the pattern.",
  objectives: [
    "Read fast-changing login attempt logs",
    "Flag the strongest evidence that reveals the pattern",
    "Identify the attack and choose the right containment",
  ],
  hintSystem: {
    hint1: "Look for many common words with small number changes.",
    hint2: "The attacker is trying likely passwords from a word list.",
    hint3: "This pattern is not random guessing across all combinations.",
  },
  knowledgeSummary: {
    title: "Dictionary attacks vs brute force",
    bullets: [
      "Dictionary attacks try known words and phrases — far faster than random guessing.",
      "A list of 10 million common passwords can be tried in minutes on fast hardware.",
      "Rate limiting and account lockout policies are the primary mitigations.",
    ],
    insight: "Pattern recognition speed matters in SOC work. The faster you label an attack correctly, the sooner the right defence activates.",
  },
  puzzle: {
    interactionMode: "singleChoice",
    /* FIXED: was 1 — now 2 so a wrong guess costs vault, not instant death */
    maxAttempts: 2,
    revealAnswerOnFail: false,
    timeLimit: 55,
    timerLabel: "Attack Window",
    breachOnTimeout: true,
    vaultIntegrity: {
      start: 100,
      passiveDropPerSecond: 2,
      /* FIXED: wrong choice penalty raised slightly (was 35) to maintain
         tension but second attempt is now available */
      wrongChoicePenalty: 40,
      min: 0,
      label: "Vault Integrity",
      breachMessage: "Breach simulation: Vault Integrity reached 0.",
    },
    loginAttemptStream: {
      tickMs: 1000,
      entries: [
        "02:14:01 - Login attempt: admin1",
        "02:14:02 - Login attempt: office2",
        "02:14:03 - Login attempt: secure3",
        "02:14:04 - Login attempt: welcome4",
        "02:14:05 - Login attempt: manager5",
        "02:14:06 - Login attempt: support6",
        "02:14:07 - Login attempt: system7",
        "02:14:08 - Login attempt: default8",
      ],
    },
    singleChoiceFlagLimit: 3,
    evidenceMarkers: [
      {
        id: "ioc_wordlist_pattern",
        code: "IOC-01",
        timestamp: "02:14:02",
        title: "Repeated common-word candidates",
        description: "Attempts rotate through office, secure, welcome, manager, support, and system. This suggests a curated password wordlist, not broad random guessing."
      },
      {
        id: "ioc_incrementing_suffix",
        code: "IOC-02",
        timestamp: "02:14:04",
        title: "Incrementing numeric suffixes",
        description: "Each guessed password appends a small changing number. That is a common dictionary variation strategy attackers use to improve hit rate."
      },
      {
        id: "ioc_single_account_focus",
        code: "IOC-03",
        timestamp: "02:14:06",
        title: "Single-account concentration",
        description: "The stream shows repeated password guesses against the same login target, which does not fit credential stuffing across many users."
      },
      {
        id: "ioc_not_random_space",
        code: "IOC-04",
        timestamp: "02:14:08",
        title: "Narrow search behavior",
        description: "The guesses are semantically meaningful and human-readable, not the broad character-space coverage expected from brute force."
      }
    ],
    requiredEvidenceIds: ["ioc_wordlist_pattern", "ioc_incrementing_suffix"],
    choices: [
      { id: "brute_force",         label: "Brute Force" },
      { id: "dictionary_attack",   label: "Dictionary Attack" },
      { id: "credential_stuffing", label: "Credential Stuffing" },
      { id: "insider_access",      label: "Insider Access" },
    ],
    correctChoice: "dictionary_attack",
    choiceFeedback: {
      correct: "Correct. This is a Dictionary Attack — common words with incrementing numbers.",
      wrong: "Incorrect. Look again at the pattern: common English words with appended numbers — that is a Dictionary Attack. You have one more attempt.",
    },
    followUpDefenseQuestion: {
      prompt: "Which control should activate first to slow or stop this attack?",
      correctAnswer: "rate_limit_lockout",
      wrongChoicePenalty: 10,
      explanation: "Rate limiting with account lockout is the fastest direct containment for a dictionary attack against one account. MFA helps, but it does not slow repeated guessing by itself.",
      options: [
        {
          id: "rate_limit_lockout",
          label: "Rate limiting + lockout",
          description: "Throttle repeated guesses and temporarily freeze the account after a defined threshold."
        },
        {
          id: "mandatory_reset_only",
          label: "Force password reset only",
          description: "Useful later, but it does not immediately slow the active guessing traffic hitting the account."
        },
        {
          id: "add_more_complexity_rules",
          label: "Tighten complexity rules",
          description: "A policy improvement for future passwords, not the fastest live containment for an ongoing attack."
        },
        {
          id: "geoblock_everything",
          label: "Block all foreign IPs",
          description: "Potentially disruptive and not the most reliable first-line control for this specific pattern."
        }
      ]
    },
    shockEvent: {
      trigger: "afterCorrect",
      delayMs: 1200,
      title: "Alert: Credentials reused from external breach detected.",
      message: "Attack blocked. But there is still danger. Even strong passwords are risky when reused. If one website is breached, attackers try the same password elsewhere.",
    },
  },
  aiSpeed: 0.82,
  rewards: { xp: 150, credits: 75 },
  completed: false, locked: true, bestScore: 0,
};

/* ══════════════════════════════════════════════════════════════════════════
   LEVEL 3 — Password Strength Race
   Status: SOLID — knowledge summary added
   ══════════════════════════════════════════════════════════════════════════ */
const level3 = {
  id: 3, level: 3,
  title: "LEVEL 3: Password Strength Race",
  desc: "Predict which password will break first, then watch a live speed race.",
  difficulty: "Easy", type: "password",
  estimatedTime: "6-8 min",
  objective: "Learn why some passwords fail fast and others last longer.",
  scenario: "Your SOC team runs a safe test. Predict which password falls first in an automated attack.",
  userTask: "Look at the passwords and choose the one that will break first.",
  simulationLogic: "Training simulation only. No real cracking tools are used.",
  visualMode: "Hybrid",
  successCondition: "Make a prediction and review the break speed race.",
  successFeedback: "Good call. You predicted the weaker password.",
  failureFeedback: "Incorrect prediction. The weaker password broke first.",
  objectives: [
    "Compare password length and pattern",
    "Notice that common words break quickly",
    "Learn that symbols alone do not always make a password strong",
  ],
  hintSystem: {
    hint1: "Longer passwords are usually safer.",
    hint2: "Random passwords are harder to guess than common words.",
    hint3: "A short password with symbols can still be weak if it is predictable.",
  },
  knowledgeSummary: {
    title: "Length beats complexity for crack resistance",
    bullets: [
      "'P@ssw0rd!' has symbols but follows a well-known substitution pattern — it's in every wordlist.",
      "A four-word passphrase like 'Correct-Horse-Battery-Staple' is both memorable and vastly stronger.",
      "Each extra character multiplies the search space exponentially.",
    ],
    insight: "Symbols and numbers help, but they don't compensate for short length or predictable patterns.",
  },
  puzzle: {
    interactionMode: "predictionChoice",
    maxAttempts: 1,
    revealAnswerOnFail: true,
    timeLimit: 75,
    options: [],
    correctAnswer: "",
    simpleExplanation: "",
    cases: [
      {
        id: "basic-weak-vs-strong",
        options: ["welcome123", "BlueRiver!Train!Cloud!19"],
        correctAnswer: "welcome123",
        breakTimeSeconds: { "welcome123": 6, "BlueRiver!Train!Cloud!19": 7200 },
        simpleExplanation: "welcome123 is common and easy to guess. The long passphrase is much harder because it is longer and less predictable.",
      },
      {
        id: "short-random-vs-long-predictable",
        options: ["T7!kP9@vQ2", "companyname2024"],
        correctAnswer: "companyname2024",
        breakTimeSeconds: { "T7!kP9@vQ2": 2400, "companyname2024": 25 },
        simpleExplanation: "Length helps, but predictable words and years are risky. Random characters are less predictable.",
      },
      {
        id: "shock-symbol-trap",
        options: ["P@ssw0rd!", "Correct-Horse-Battery-Staple"],
        correctAnswer: "P@ssw0rd!",
        breakTimeSeconds: { "P@ssw0rd!": 12, "Correct-Horse-Battery-Staple": 14400 },
        simpleExplanation: "P@ssw0rd! looks strong but follows a very common substitution pattern. The long passphrase is stronger because it is much longer and less predictable.",
      },
    ],
    generateSession: function () {
      const selected = this.cases[Math.floor(Math.random() * this.cases.length)];
      return {
        caseId: selected.id,
        options: selected.options.slice(),
        correctAnswer: selected.correctAnswer,
        breakTimeSeconds: { ...selected.breakTimeSeconds },
        simpleExplanation: selected.simpleExplanation,
      };
    },
    simulateBreakTime: function (password, session) {
      if (!session || !session.breakTimeSeconds) return 60;
      return session.breakTimeSeconds[password] || 60;
    },
    simulationUI: {
      bars: true, showEstimatedTimes: true,
      animateDurationMs: 4200,
      weakLabel: "Breaks first",
      strongLabel: "Holds longer",
    },
    shockEvent: {
      triggerCaseId: "shock-symbol-trap",
      title: "Surprise Result",
      message: "P@ssw0rd! broke first. It has symbols, but it is still predictable. Strong means hard to guess, not just special characters.",
    },
  },
  aiSpeed: 0.95,
  rewards: { xp: 200, credits: 100 },
  completed: false, locked: true, bestScore: 0,
};

/* ══════════════════════════════════════════════════════════════════════════
   LEVEL 4 — Data Breach Investigation
   Status: SOLID — knowledge summary added
   ══════════════════════════════════════════════════════════════════════════ */
const level4 = {
  id: 13, level: 4,
  title: "LEVEL 4: Data Breach Investigation Mode",
  desc: "Review breach evidence and find how the attacker got in.",
  difficulty: "Medium", type: "password",
  estimatedTime: "8-10 min",
  objective: "Use logs, profile clues, and policy gaps to identify the breach cause.",
  scenario: "A breach already happened. You are the SOC analyst investigating what went wrong.",
  userTask: "Review the evidence panels and choose the real cause of breach.",
  simulationLogic: "Investigation training simulation only.",
  visualMode: "2D",
  successCondition: "Correctly identify the breach cause and the best prevention step.",
  successFeedback: "Investigation complete. Root cause and prevention identified.",
  failureFeedback: "Investigation incomplete. Review the evidence and reasoning.",
  objectives: [
    "Read login timeline evidence",
    "Connect profile clues to password pattern risk",
    "Identify the policy weakness that allowed the breach",
  ],
  hintSystem: {
    hint1: "The same account is tried repeatedly in a short time.",
    hint2: "The profile has public info that matches a common password pattern.",
    hint3: "No lockout means the attacker can keep trying until one guess works.",
  },
  knowledgeSummary: {
    title: "Two failures that combine into one breach",
    bullets: [
      "A predictable password (name + year) is the first failure.",
      "No account lockout policy is the second — unlimited guesses are allowed.",
      "Neither failure alone is fatal; both together made the breach trivial.",
    ],
    insight: "Defense in depth means no single failure should be enough to cause a breach.",
  },
  puzzle: {
    interactionMode: "investigation",
    maxAttempts: 3,
    timeLimit: 0,
    noTimerPressure: true,
    evidenceLogs: [
      "02:12:58 - Failed login: admin",
      "02:13:00 - Failed login: admin",
      "02:13:03 - Successful login: admin",
    ],
    profileData: { name: "Rahim Hasan", publicInfo: "Graduation year: 2001", role: "System Administrator" },
    systemPolicy: { rateLimiting: "No rate limiting", accountLockout: "No account lockout", passwordRule: "Basic complexity only" },
    choices: [
      { id: "brute_force",         label: "Brute Force" },
      { id: "dictionary_attack",   label: "Dictionary Attack" },
      { id: "credential_reuse",    label: "Credential Reuse" },
      { id: "insider_access",      label: "Insider Access" },
    ],
    correctAnswer: "dictionary_attack",
    revealOnCorrect: { actualPassword: "rahim2001", message: "The attacker guessed a name + year pattern." },
    simpleExplanation: "Dictionary Attack: an automated system trying common words and patterns.",
    followUpDefenseQuestion: {
      prompt: "What would prevent this next time?",
      options: [
        { id: "lockout_rule",        label: "Add lockout rule" },
        { id: "increase_font",       label: "Increase font size" },
        { id: "hide_login_button",   label: "Hide login button" },
        { id: "remove_usernames",    label: "Remove usernames" },
      ],
      correctAnswer: "lockout_rule",
      explanation: "A lockout rule stops unlimited guesses after repeated failed attempts.",
    },
    educationalSummary: "This breach happened because of two issues together: a predictable password and a weak system policy.",
  },
  aiSpeed: 1.02,
  rewards: { xp: 230, credits: 120 },
  completed: false, locked: true, bestScore: 0,
};

/* ══════════════════════════════════════════════════════════════════════════
   LEVEL 5 — Storage Audit
   Status: MOSTLY SOLID — shock reveal timing softened, knowledge summary added
   ══════════════════════════════════════════════════════════════════════════ */
const level5 = {
  id: 14, level: 5,
  title: "LEVEL 5: Password Vault Audit — Which Design Survives a Breach?",
  desc: "Run a forensic audit on two credential stores, identify the safer design, then harden it against offline cracking.",
  difficulty: "Hard", type: "password",
  estimatedTime: "10-13 min",
  objective: "Audit credential storage evidence, compare breach fallout, and choose the strongest hardening path.",
  scenario: "Two production authentication clusters survived an intrusion attempt. One stores raw passwords, the other stores unsalted fast hashes. You need to decide which design is safer and what must be fixed next.",
  userTask: "Inspect every evidence panel, compare breach impact, identify the safer cluster, then choose the best remediation.",
  simulationLogic: "Forensic audit with breach replay and offline cracking analysis.",
  visualMode: "Hybrid",
  successCondition: "Review the full audit evidence, choose the safer cluster, then recommend the correct hardening control.",
  successFeedback: "Audit complete. You identified the safer architecture and the right next defense.",
  failureFeedback: "The audit conclusion is incomplete. Re-check what the attacker can do after stealing each database.",
  objectives: [
    "Inspect both credential stores and breach artifacts",
    "Compare direct exposure vs offline cracking risk",
    "Choose the safer design and recommend the right fix",
  ],
  hintSystem: {
    hint1: "Plain text is catastrophic because the attacker gets the real passwords immediately.",
    hint2: "Fast unsalted hashes are safer than plain text, but still weak against offline guessing and rainbow tables.",
    hint3: "The best next step is a slow password hash with unique salts plus blocking common breached passwords.",
  },
  knowledgeSummary: {
    title: "Safe storage is layered, not binary",
    bullets: [
      "Plain-text storage means a stolen database instantly reveals every password with zero cracking work.",
      "Fast unsalted hashes are better than plain text, but attackers can still run offline cracking and reuse known hash tables.",
      "Modern defense means slow salted hashing plus controls that reject common or previously breached passwords.",
    ],
    insight: "The real question is not 'hashed or not' but 'how expensive is offline cracking after the breach?'",
  },
  puzzle: {
    interactionMode: "inspection",
    maxAttempts: 3,
    timeLimit: 0,
    noTimerPressure: true,
    inspectionRequiredActionsPerSystem: 3,
    systems: [
      {
        id: "system_a",
        name: "Cluster A",
        riskTier: "critical",
        storageLabel: "Plain text credential table",
        summary: "Legacy admin portal writes the user password exactly as entered.",
        databasePreview: [
          "admin | Admin@123",
          "rahim | rahim2001",
          "finance.lead | Dhaka!2022",
          "support01 | welcome123"
        ],
        breachOutcome: "Attacker stole the credential table and immediately logged into employee mailboxes using the recovered real passwords.",
        crackAnalysis: [
          "Offline cracking not required.",
          "Credential reuse began in under 2 minutes.",
          "Every readable password can be replayed directly against VPN and webmail."
        ],
        auditNotes: [
          "Application log shows password reset emails containing the submitted password in debug traces.",
          "Database dump exposes exact user secrets with no transformation layer.",
          "A single breach becomes instant account takeover across reused services."
        ]
      },
      {
        id: "system_b",
        name: "Cluster B",
        riskTier: "elevated",
        storageLabel: "Fast unsalted MD5 hashes",
        summary: "Newer portal stores one-way hashes, but the implementation is old and optimized for speed.",
        databasePreview: [
          "admin | 5f4dcc3b5aa765d61d8327deb882cf99",
          "rahim | 1a79a4d60de6718e8e5b326e338ae533",
          "finance.lead | 482c811da5d5b4bc6d497ffa98491e38",
          "support01 | e10adc3949ba59abbe56e057f20f883e"
        ],
        breachOutcome: "Attacker stole the hash dump. Passwords were not instantly visible, but common values were recovered offline within minutes using known hash lists.",
        crackAnalysis: [
          "No direct credential replay from the dump alone.",
          "Common passwords matched quickly through precomputed rainbow tables.",
          "Fast hashing keeps attacker cost low for GPU-based guessing."
        ],
        auditNotes: [
          "Hashes are identical for users who choose the same password because no per-user salt exists.",
          "Security review notes MD5 chosen for legacy speed and compatibility.",
          "Breach blast radius is lower than plain text, but weak passwords still collapse quickly."
        ]
      },
    ],
    choices: [
      {
        id: "system_a",
        label: "Cluster A",
        description: "Readable passwords give the attacker immediate account access after a breach."
      },
      {
        id: "system_b",
        label: "Cluster B",
        description: "Unsalted hashes are still weak, but they are safer than storing the raw password."
      },
    ],
    correctAnswer: "system_b",
    simpleExplanation: "Cluster B is safer because one-way hashes delay the attacker, but unsalted fast hashes still fail against offline cracking. The correct security lesson is nuanced: safer does not mean secure enough.",
    followUpDefenseQuestion: {
      prompt: "Cluster B wins the comparison, but it is still not production-ready. What is the best next remediation?",
      correctAnswer: "argon2_salt_breach_blocking",
      explanation: "A slow password hashing algorithm with unique per-user salts raises attacker cost dramatically, and breached-password blocking removes the easiest offline wins.",
      options: [
        {
          id: "increase_min_length_only",
          label: "Raise minimum length to 10 and keep MD5",
          description: "Helpful policy change, but it leaves the storage layer fast, unsalted, and cheap to crack offline."
        },
        {
          id: "encrypt_password_column",
          label: "Encrypt the password column and decrypt at login",
          description: "This still requires reversible secrets and keeps the application able to reveal passwords."
        },
        {
          id: "argon2_salt_breach_blocking",
          label: "Use Argon2/bcrypt with unique salts and reject breached passwords",
          description: "This is the strongest upgrade because it slows offline cracking and removes known weak passwords."
        }
      ]
    },
    educationalSummary: "Cluster B is the safer system, but a modern password store still needs slow salted hashing and controls against common breached passwords.",
  },
  aiSpeed: 1.08,
  rewards: { xp: 260, credits: 130 },
  completed: false, locked: true, bestScore: 0,
};

/* ══════════════════════════════════════════════════════════════════════════
   LEVEL 6 — Salt Concepts  *** MAJOR FIX ***
   FIX: Adds a saltDemoPanel that fires BEFORE the multiSelect step.
        Players first see a live hash comparison panel showing that the same
        password produces different hashes with different salts — THEN they
        do the selection task.  The concept now drives the mechanic.
   ══════════════════════════════════════════════════════════════════════════ */
const level6 = {
  id: 15, level: 6,
  title: "LEVEL 6: Why Adding Random Salt Helps",
  desc: "See why identical passwords produce different hashes — then identify high-reuse-risk credentials.",
  difficulty: "Hard", type: "password",
  estimatedTime: "9-12 min",
  objective: "Understand how salt breaks shared-hash attacks, then find the highest reuse risk passwords.",
  scenario: "Salt adds random data before hashing so the same password never produces the same stored value. Your SOC needs to find which passwords create the greatest shared-risk if users pick the same weak value.",
  userTask: "Step 1: Review the salt demonstration. Step 2: Select all high-reuse-risk passwords.",
  simulationLogic: "Concept training with safe hash simulation.",
  visualMode: "Hybrid",
  successCondition: "Complete the salt demo and correctly identify weak high-reuse passwords.",
  successFeedback: "Credential vulnerability identified. Human predictability confirmed.",
  failureFeedback: "Security oversight detected. Reassess which passwords people are likely to share.",
  objectives: [
    "Watch the salt demonstration — same password, different hashes",
    "Understand why salt prevents shared-hash attacks",
    "Identify passwords most likely to be reused across many accounts",
  ],
  hintSystem: {
    hint1: "If many users choose the same weak password, risk grows quickly.",
    hint2: "Salt helps by making stored results different for each user.",
    hint3: "Select passwords most likely to be reused by many people.",
  },
  knowledgeSummary: {
    title: "Salt makes every hash unique — even for identical passwords",
    bullets: [
      "Without salt: every user with 'password123' stores the same hash — crack once, crack all.",
      "With salt: each user gets a random extra string mixed in before hashing — unique hash every time.",
      "Rainbow table attacks are defeated by salting because pre-computed hashes no longer match.",
    ],
    insight: "Salt does not make weak passwords strong. It prevents one cracked password from instantly compromising thousands of accounts.",
  },
  puzzle: {
    interactionMode: "saltReuseLab",
    maxAttempts: 3,
    revealAnswerOnFail: false,
    riskSystem: {
      start: 0, wrongAdd: 16, max: 100,
      label: "Chain Failure Risk Index",
      breachMessage: "Breach simulation: reused simple passwords created a chain failure.",
    },
    saltReuseLab: {
      quickPicks: [
        "password123",
        "welcome1",
        "admin",
        "qwerty123",
        "letmein",
        "iloveyou",
      ],
      fixedSalts: ["yR!x2v&*", "RUnO1oBW"],
      attackSimulator: {
        noSaltHash: "5f4dcc3b5aa765d6",
        users: ["alice", "bob", "carol", "dave", "eve"],
        saltedHashes: [
          "a3f8c2e1d74b56f0",
          "7c5d1f8b02e6a4c9",
          "2e9b4d7a15c8f3e0",
          "f1a2b3c4d5e6f7a8",
          "9d8c7b6a5f4e3d2c",
        ],
      },
      classifier: {
        weakPool: [
          "password123",
          "welcome123",
          "admin123",
          "letmein",
          "qwerty123",
          "123456",
          "iloveyou",
          "dragon",
          "sunshine99",
          "football7",
          "12345678",
          "111111",
          "monkey123",
          "login2024",
          "guest",
        ],
        strongPool: [
          "T7!kP9@vQ2",
          "BlueRiver!Train!Cloud!19",
          "nR4$zL8#pW1",
          "Orbit-Mango-Delta-47!Signal",
          "X2@bM9!qL7#",
          "Maple!Harbor!Cipher!204",
        ],
        weakSelectionCount: 9,
        strongSelectionCount: 3,
        falsePositiveRisk: 15,
        missedWeakRisk: 20,
      },
    },
  },
  aiSpeed: 1.14,
  rewards: { xp: 300, credits: 145 },
  completed: false, locked: true, bestScore: 0,
};

/* ══════════════════════════════════════════════════════════════════════════
   LEVEL 7 — Live Defense Simulation  *** DIFFICULTY RAMP FIX ***
   FIX: attackSpawnRate now has a rampUpAfterSeconds field.
        For the first 15 seconds the spawn interval is 4-6s (gentle).
        After 15 seconds it tightens to 2-4s (full pressure).
        This bridges the difficulty cliff from L6's passive mechanic.
   ══════════════════════════════════════════════════════════════════════════ */
const level7 = {
  id: 16, level: 7,
  title: "LEVEL 7: Live Defense Simulation — Protect the Vault",
  desc: "Defend the vault in real time by activating the right protections under pressure.",
  difficulty: "Hard", type: "password",
  estimatedTime: "9-12 min",
  objective: "Keep Vault Health above zero until the simulation ends.",
  scenario: "You are defending a live platform under active attack. Waves are incoming. Deploy defenses quickly and manage energy carefully. The first 15 seconds are calmer — use them to learn the controls.",
  userTask: "Watch each incoming attack and trigger the best defense before the vault takes damage.",
  simulationLogic: "Real-time defensive response simulation with attack waves, cooldowns, and energy management.",
  visualMode: "2D",
  successCondition: "Vault Health stays above 0 after 60 seconds.",
  successFeedback: "Defense successful. The vault stayed protected under live pressure.",
  failureFeedback: "Vault breach occurred. Defense timing and coverage were not enough.",
  objectives: [
    "Use the first 15 seconds to learn which defenses counter which attacks",
    "Manage energy across the full 60-second simulation",
    "Maintain vault protection throughout all wave types",
  ],
  hintSystem: {
    hint1: "Do not spend all energy at once. Save some for harder waves.",
    hint2: "One defense does not stop every attack type.",
    hint3: "Rotate defenses based on cooldown and incoming threat.",
  },
  knowledgeSummary: {
    title: "Layered defenses stop layered attacks",
    bullets: [
      "No single control stops every threat — brute force, credential stuffing, and phishing each require different responses.",
      "Energy management is a proxy for budget: cheap controls deployed wisely beat expensive controls deployed recklessly.",
      "MFA is the highest-impact single defence against credential-based attacks.",
    ],
    insight: "Security is a system, not a product. Controls must work together.",
  },
  puzzle: {
    interactionMode: "liveDefenseSimulation",
    attackTypes: [
      { type: "Brute Force",           damage: 10, counteredBy: ["Rate Limiting","Account Lockout"], vector:"High-volume repeated login guesses against one account." },
      { type: "Credential Stuffing",   damage: 20, counteredBy: ["MFA","Password Reuse Detection"], vector:"Leaked username/password pairs replayed across many accounts." },
      { type: "Offline Crack Attempt", damage: 25, counteredBy: ["Salting"], vector:"Stolen password hashes attacked outside the live system." },
      { type: "Phishing Wave",         damage: 15, counteredBy: ["MFA","Breach Monitoring"], vector:"Users targeted with fake login prompts to steal valid credentials." },
    ],
    defenses: [
      { name: "Rate Limiting",              energyCost: 20, cooldown: 5,  protectsAgainst: ["Brute Force"], domain:"Perimeter" },
      { name: "Account Lockout",            energyCost: 15, cooldown: 6,  protectsAgainst: ["Brute Force"], domain:"Identity" },
      { name: "Salting",                    energyCost: 25, cooldown: 8,  protectsAgainst: ["Offline Crack Attempt"], domain:"Storage" },
      { name: "MFA",                        energyCost: 35, cooldown: 10, protectsAgainst: ["Credential Stuffing","Phishing Wave"], domain:"Identity" },
      { name: "Password Reuse Detection",   energyCost: 30, cooldown: 9,  protectsAgainst: ["Credential Stuffing"], domain:"Identity" },
      { name: "Breach Monitoring",          energyCost: 25, cooldown: 7,  protectsAgainst: ["Phishing Wave"], domain:"Detection" },
    ],
    simulationConfig: {
      vaultHealth: 100,
      playerEnergy: 100,
      energyRegenRate: { amount: 5, everySeconds: 3 },
      /* FIXED: gentle ramp for first 15 seconds, then full pressure */
      attackSpawnRate: {
        minSeconds: 4,
        maxSeconds: 6,
        rampUpAfterSeconds: 15,
        rampedMinSeconds: 2,
        rampedMaxSeconds: 4,
      },
      simulationDuration: 60,
      tutorialOverlay: {
        enabled: true,
        showForSeconds: 6,
        message: "First 15 seconds: gentle waves. Learn your defenses before full pressure begins.",
      },
    },
    educationalSummary: "Security works best when multiple defenses protect the system. No single tool can stop every attack.",
  },
  aiSpeed: 1.2,
  rewards: { xp: 340, credits: 165 },
  completed: false, locked: true, bestScore: 0,
};

/* ══════════════════════════════════════════════════════════════════════════
   LEVEL 8 — Enterprise Threat Hunt
   Status: SOLID — knowledge summary added
   ══════════════════════════════════════════════════════════════════════════ */
const level8 = {
  id: 17, level: 8,
  title: "LEVEL 8: Enterprise Threat Hunt — Silent Intrusion Analysis",
  desc: "Investigate enterprise logs, detect a quiet attacker path, and contain the breach before escalation.",
  difficulty: "Hard", type: "password",
  estimatedTime: "10-12 min",
  objective: "Detect and contain a silent intrusion by analyzing evidence and taking precise containment actions.",
  scenario: "An attacker has already gained initial access and is operating quietly. No loud alerts were triggered.",
  userTask: "Review evidence panels, identify malicious steps, and apply containment actions while minimizing false positives.",
  simulationLogic: "Threat hunting simulation focused on investigation, attacker tracing, and controlled containment decisions.",
  visualMode: "2D",
  successCondition: "Contain at least 3 major malicious events, keep attacker escalation under control, and keep Vault Health above 30%.",
  successFeedback: "Threat hunting operation successful. Intrusion path contained before critical compromise.",
  failureFeedback: "Threat hunting operation failed. Intrusion escalation exceeded acceptable limits.",
  objectives: [
    "Analyze enterprise logs for subtle malicious behavior",
    "Confirm attacker movement across systems and accounts",
    "Contain the intrusion with low false-positive impact",
  ],
  hintSystem: {
    hint1: "Focus on behavior patterns across multiple logs, not isolated events.",
    hint2: "Not every anomaly is malicious. Validate context before containment.",
    hint3: "Repeated suspicious access and privilege changes often indicate attacker movement.",
  },
  knowledgeSummary: {
    title: "Modern intrusions begin small and escalate slowly",
    bullets: [
      "The initial phishing login looked identical to a routine access — no alert fired.",
      "Privilege escalation without an approval ticket is the key signal most defenders miss.",
      "Lateral movement between accounts is the attacker's way of widening access without triggering new alerts.",
    ],
    insight: "Early detection at step 1 or 2 prevents the full kill chain. Missing the first signal forces a far harder containment at step 5.",
  },
  puzzle: {
    interactionMode: "threatHuntSimulation",
    baseStats: { vaultHealth: 100, systemIntegrity: 100, falsePositiveCount: 0, attackerProgress: 0 },
    evidencePanels: [
      {
        id: "login_activity", title: "Login Activity Log",
        entries: [
          { id:"L-101", timestamp:"02:14:08", user:"r.khan",    action:"Successful login",  locationOrIP:"198.51.100.27 (new region)", status:"anomalous" },
          { id:"L-102", timestamp:"08:31:12", user:"a.rahman",  action:"Successful login",  locationOrIP:"10.10.4.21 (HQ)",            status:"normal" },
          { id:"L-103", timestamp:"02:16:44", user:"r.khan",    action:"Mailbox access",    locationOrIP:"198.51.100.27",               status:"anomalous" },
          { id:"L-104", timestamp:"09:02:19", user:"svc.backup",action:"Scheduled service login", locationOrIP:"10.10.8.9",            status:"normal" },
        ],
      },
      {
        id: "privilege_change", title: "Privilege Change Log",
        entries: [
          { id:"P-201", timestamp:"02:21:03", user:"r.khan",  action:"Role changed to Admin (no approval ticket)", locationOrIP:"IAM-Core",   status:"anomalous" },
          { id:"P-202", timestamp:"11:15:40", user:"it.ops",  action:"Temporary admin granted (approved CR-7742)", locationOrIP:"IAM-Portal", status:"normal" },
          { id:"P-203", timestamp:"02:23:55", user:"r.khan",  action:"Policy edit attempt",                        locationOrIP:"IAM-Core",   status:"anomalous" },
        ],
      },
      {
        id: "database_access", title: "Database Access Log",
        entries: [
          { id:"D-301", timestamp:"02:33:11", user:"r.khan",      action:"SELECT * FROM customer_master (45,000 rows)", locationOrIP:"DB-PRD-01",  status:"anomalous" },
          { id:"D-302", timestamp:"10:12:09", user:"data.analyst", action:"Daily KPI query (aggregate only)",            locationOrIP:"DB-REP-02",  status:"normal" },
          { id:"D-303", timestamp:"02:36:28", user:"r.khan",      action:"Export job started: customer_master_full.csv", locationOrIP:"DB-PRD-01", status:"anomalous" },
        ],
      },
      {
        id: "network_traffic", title: "Network Traffic Log",
        entries: [
          { id:"N-401", timestamp:"02:39:07", user:"r.khan",   action:"Outbound TLS session", locationOrIP:"203.0.113.52:443", status:"anomalous" },
          { id:"N-402", timestamp:"02:40:14", user:"r.khan",   action:"Outbound TLS session", locationOrIP:"203.0.113.52:443", status:"anomalous" },
          { id:"N-403", timestamp:"02:41:26", user:"cdn.sync", action:"Vendor sync",           locationOrIP:"192.0.2.18:443",  status:"normal" },
        ],
      },
      {
        id: "account_activity", title: "Account Activity Log",
        entries: [
          { id:"A-501", timestamp:"02:27:50", user:"r.khan",  action:"Session token used to access account: m.sen", locationOrIP:"APP-AUTH-03", status:"anomalous" },
          { id:"A-502", timestamp:"14:05:33", user:"hr.bot",  action:"Bulk profile updates",                        locationOrIP:"APP-HR-01",   status:"normal" },
          { id:"A-503", timestamp:"02:29:02", user:"m.sen",   action:"New API key generated",                       locationOrIP:"APP-AUTH-03", status:"anomalous" },
        ],
      },
    ],
    hiddenAttackChain: [
      { step:1, key:"phishing_login",       label:"Phishing-based login",        linkedEvidence:["L-101","L-103"], explanation:"A routine-looking login at an unusual hour from an unfamiliar region." },
      { step:2, key:"privilege_escalation", label:"Privilege escalation",         linkedEvidence:["P-201","P-203"], explanation:"Admin rights granted without normal approval." },
      { step:3, key:"lateral_movement",     label:"Lateral movement",             linkedEvidence:["A-501","A-503"], explanation:"The attacker moving between accounts inside the system." },
      { step:4, key:"database_escalation",  label:"Database query escalation",    linkedEvidence:["D-301","D-303"], explanation:"Large, unusual data queries and export behavior." },
      { step:5, key:"data_exfiltration",    label:"Data exfiltration attempt",    linkedEvidence:["N-401","N-402"], explanation:"Repeated outbound encrypted traffic to a suspicious external host." },
    ],
    playerActions: [
      { id:"mark_suspicious", label:"Mark as Suspicious" },
      { id:"investigate",     label:"Investigate", revealsContext: true },
      { id:"isolate_account", label:"Isolate Account" },
      { id:"block_ip",        label:"Block IP" },
      { id:"ignore",          label:"Ignore" },
    ],
    progressionLogic: {
      attackerProgressRules: { missedMaliciousEventIncrease:1, correctMajorDetectionDecrease:1, criticalThreshold:5, maxEscalation:7, rapidVaultDrainOnCritical:12 },
      falsePositiveRules: { incorrectFlagIncrease:1, systemIntegrityDropPerFalsePositive:8, systemIntegrityDropOnWrongContainment:10 },
      containmentEffects: { isolateAccountStops:["phishing_login","privilege_escalation","lateral_movement"], blockIPStops:["data_exfiltration"], investigateReveals:"linked evidence, sequence relationship, and confidence note", ignoreOnMalicious:"attacker advances to next step" },
      operationalFeedback: { privilegeAlert:"Suspicious privilege escalation detected.", exportAlert:"Unauthorized data export attempt identified.", falseAlert:"False alert logged. Operational efficiency reduced.", lateralMove:"Attacker lateral movement confirmed.", criticalEscalation:"Warning: attacker progression has reached critical escalation level." },
      passiveRisk: { enabledWhenUndetected:true, vaultHealthDropPerCycle:4, cycleTurns:2 },
      noRealTimeWavePressure: true,
    },
    winCondition: { majorMaliciousEventsContainedMin:3, attackerProgressBelowCritical:true, vaultHealthAbovePercent:30 },
    failCondition: { any: [
      { metric:"vaultHealth",      operator:"<=", value:0 },
      { metric:"systemIntegrity",  operator:"<",  value:40 },
      { metric:"attackerProgress", operator:">=", value:7 },
    ]},
    educationalSummary: { reveal:"Initial access originated from a single phishing login that appeared routine.", message:"Modern cyber intrusions often begin with small, unnoticed events. Early detection prevents escalation into full data compromise." },
  },
  aiSpeed: 1.27,
  rewards: { xp: 380, credits: 185 },
  completed: false, locked: true, bestScore: 0,
};

/* ══════════════════════════════════════════════════════════════════════════
   LEVEL 9 — Zero-Day Live Patch Lab  *** WIN CONDITION FIX ***
   FIX: winCondition replaces `exploitSuccessRate == 0` with a tiered system:
     - 0-5%  → full pass (3 stars)
     - 6-15% → partial pass (2 stars, score penalty applied in Game.js)
     - 16%+  → fail
   scoreRating field drives the Game.js completeMission call.
   ══════════════════════════════════════════════════════════════════════════ */
const level9 = {
  id: 18, level: 9,
  title: "LEVEL 9: Zero-Day Crisis — Live Patch Engineering Lab",
  desc: "Identify a live zero-day chain, patch vulnerable modules, re-test exploits, and secure the platform end-to-end.",
  difficulty: "Pro", type: "password",
  estimatedTime: "11-14 min",
  objective: "Detect and remediate layered vulnerabilities through live engineering decisions and exploit re-testing.",
  scenario: "A zero-day exploit path is actively targeting your authentication stack. Primary and secondary flaws may both exist.",
  userTask: "Inspect architecture modules, apply patches, deploy fixes, and run exploit simulation until risk is fully neutralized.",
  simulationLogic: "Interactive patch lab with modular remediation, exploit replay, and metric tradeoff analysis.",
  visualMode: "2D",
  /* FIXED: descriptive pass tiers replace the binary check */
  successCondition: "Reduce exploitSuccessRate below 6% while keeping system stability metrics within safe thresholds.",
  successFeedback: "Remediation successful. Exploit chain fully blocked and system performance stabilized.",
  failureFeedback: "Remediation incomplete. Exploit pressure or operational instability exceeded safe limits.",
  objectives: [
    "Detect primary vulnerability in auth flow",
    "Patch logic modules and validate with exploit replay",
    "Discover and fix secondary access path",
    "Reach full exploit containment with balanced metrics",
  ],
  hintSystem: {
    hint1: "Fixing the first issue may not remove all exploit paths.",
    hint2: "Patch impact can improve security but may affect load and user experience.",
    hint3: "Use exploit simulation after each patch to verify real outcomes.",
  },
  knowledgeSummary: {
    title: "Zero-days are layered — patching one is rarely enough",
    bullets: [
      "The timing-based password comparison flaw was the primary entry point.",
      "Session token reuse allowed attackers to persist after the first exploit.",
      "The static API token on the secondary endpoint was revealed only after fixing the primary path.",
    ],
    insight: "Patching in the wrong order — or stopping too early — leaves exploitable residue. Always re-test after every change.",
  },
  puzzle: {
    interactionMode: "livePatchSimulation",
    architectureModules: [
      { id:"login_request",        name:"Login Request",           editable:false, flowOrder:1, state:"active",                  notes:"Entry point for credential authentication" },
      { id:"input_validation",     name:"Input Validation",        editable:true,  flowOrder:2, state:"basic_validation",        notes:"Sanitization and request checks" },
      { id:"password_comparison",  name:"Password Comparison",     editable:true,  flowOrder:3, state:"timing_sensitive_compare",notes:"Comparison logic currently leaks timing patterns" },
      { id:"session_token_generation", name:"Session Token Generation", editable:true, flowOrder:4, state:"token_reuse_enabled", notes:"Session token regeneration currently disabled" },
      { id:"access_granted",       name:"Access Granted",          editable:false, flowOrder:5, state:"active",                  notes:"Final auth decision output" },
      { id:"api_gateway",          name:"API Secondary Endpoint",  editable:true,  flowOrder:6, state:"static_token_exposed",   notes:"Secondary endpoint uses static API token" },
    ],
    vulnerabilities: [
      { id:"vuln_timing_compare",    name:"Timing-based Password Comparison Weakness", moduleId:"password_comparison",      severity:"high",     status:"open",   hiddenUntil:"start" },
      { id:"vuln_session_reuse",     name:"Session Token Reuse",                       moduleId:"session_token_generation", severity:"high",     status:"open",   hiddenUntil:"start" },
      { id:"vuln_missing_rate_limit",name:"Missing Rate Limiting",                     moduleId:"input_validation",         severity:"medium",   status:"open",   hiddenUntil:"start" },
      { id:"vuln_static_api_token",  name:"Static API Token in Secondary Endpoint",   moduleId:"api_gateway",              severity:"critical", status:"hidden", hiddenUntil:"after_primary_patch" },
    ],
    systemMetrics: {
      vaultHealth: 100,
      exploitSuccessRate: 62,
      serverLoad: 46,
      userExperienceScore: 82,
      vulnerabilityCountRemaining: 4,
    },
    patchOptions: [
      { id:"patch_validation_logic",    action:"Modify validation logic",     appliesTo:["input_validation"],     effects:{ exploitSuccessRateDelta:-8,  serverLoadDelta:4,  userExperienceScoreDelta:-2, closesVulnerabilities:[] } },
      { id:"patch_constant_time_compare", action:"Enable constant-time comparison", appliesTo:["password_comparison"], effects:{ exploitSuccessRateDelta:-22, serverLoadDelta:3,  userExperienceScoreDelta:-1, closesVulnerabilities:["vuln_timing_compare"] } },
      { id:"patch_rate_limit",          action:"Add rate limiting",           appliesTo:["input_validation"],     effects:{ exploitSuccessRateDelta:-14, serverLoadDelta:6,  userExperienceScoreDelta:-5, closesVulnerabilities:["vuln_missing_rate_limit"] } },
      { id:"patch_regen_session_tokens",action:"Regenerate session tokens",  appliesTo:["session_token_generation"], effects:{ exploitSuccessRateDelta:-18, serverLoadDelta:2,  userExperienceScoreDelta:0,  closesVulnerabilities:["vuln_session_reuse"] } },
      { id:"patch_rotate_api_keys",     action:"Rotate API keys",            appliesTo:["api_gateway"],          effects:{ exploitSuccessRateDelta:-10, serverLoadDelta:1,  userExperienceScoreDelta:0,  closesVulnerabilities:[] } },
      { id:"patch_secure_endpoint",     action:"Secure endpoint",            appliesTo:["api_gateway"],          effects:{ exploitSuccessRateDelta:-25, serverLoadDelta:3,  userExperienceScoreDelta:-2, closesVulnerabilities:["vuln_static_api_token"] } },
      { id:"patch_deploy",              action:"Deploy patch",               appliesTo:["input_validation","password_comparison","session_token_generation","api_gateway"], effects:{ exploitSuccessRateDelta:0, serverLoadDelta:0, userExperienceScoreDelta:0, closesVulnerabilities:[] }, uiLabel:"Deploy Staged Patch Set" },
      { id:"patch_simulate_exploit",    action:"Run exploit simulation",     appliesTo:["all"], effects:{ exploitSuccessRateDelta:0, serverLoadDelta:0, userExperienceScoreDelta:0, closesVulnerabilities:[] }, uiLabel:"Run Live Exploit Replay" },
    ],
    exploitSimulationLogic: {
      simulationButtonLabel: "🔴 Simulate Exploit",
      onSimulate: {
        ifUnpatched:       { vaultHealthDrop:12, message:"Exploit succeeded. Active vulnerability chain confirmed." },
        ifPartiallyPatched:{ vaultHealthDrop:6,  exploitSuccessRateAdjustment:-8, message:"Exploit partially successful. Residual weakness still exploitable." },
        ifFullyPatched:    { vaultHealthDrop:0,  exploitSuccessRateSet:0, message:"Exploit blocked. No active path detected." },
      },
      delayedEscalation: { enabled:true, trigger:"no_patch_action_interval", turnsWithoutPatchThreshold:2, exploitSuccessRateIncreasePerTrigger:5, vaultHealthDropPerTrigger:3, message:"Threat pressure rising due to delayed remediation." },
      secondaryReveal: { trigger:"after_primary_patch", revealMessage:"Secondary access path detected.", revealVulnerabilityId:"vuln_static_api_token", requiredFollowUp:["patch_rotate_api_keys","patch_secure_endpoint"] },
      metricGuards: { exploitSuccessRateMin:0, exploitSuccessRateMax:100, serverLoadMin:0, serverLoadMax:100, userExperienceScoreMin:0, userExperienceScoreMax:100, vaultHealthMin:0, vaultHealthMax:100 },
    },

    /* ─── FIXED: tiered win condition ─────────────────────────────────── */
    winCondition: {
      /* Tiered thresholds — evaluated in order; first match wins */
      tiers: [
        {
          tier: "full",
          label: "Full remediation",
          starRating: 3,
          scorePenaltyPercent: 0,
          conditions: { all: [
            { metric:"exploitSuccessRate", operator:"<=", value:5  },
            { metric:"vaultHealth",        operator:">",  value:40 },
            { metric:"serverLoad",         operator:"<",  value:85 },
            { metric:"userExperienceScore",operator:">",  value:40 },
          ]},
        },
        {
          tier: "partial",
          label: "Partial remediation — significant risk remains",
          starRating: 2,
          scorePenaltyPercent: 35,
          conditions: { all: [
            { metric:"exploitSuccessRate", operator:"<=", value:15 },
            { metric:"vaultHealth",        operator:">",  value:20 },
          ]},
        },
        /* 16%+ or vault ≤ 20 → fail (handled by failCondition) */
      ],
    },

    failCondition: { any: [
      { metric:"vaultHealth",         operator:"<=", value:0  },
      { metric:"exploitSuccessRate",  operator:">",  value:80 },
      { metric:"serverLoad",          operator:">",  value:95 },
    ]},
    educationalSummary: "Zero-day vulnerabilities often contain multiple layers. Fixing one weakness may not stop an attacker completely. Effective remediation requires testing, validation, and layered defense.",
  },
  aiSpeed: 1.36,
  rewards: { xp: 430, credits: 210 },
  completed: false, locked: true, bestScore: 0,
};

/* ══════════════════════════════════════════════════════════════════════════
   LEVEL 10 — Enterprise Security Architect Certification  *** LIVE PREVIEW FIX ***
   FIX: adds livePreview flag + previewScoreFunction reference so the
        enterprise architecture UI can call it on every dropdown change
        and show an "Estimated rating: B" live while the player designs.
   ══════════════════════════════════════════════════════════════════════════ */
const level10 = {
  id: 19, level: 10,
  title: "LEVEL 10: Enterprise Security Architect — Final Certification Assessment",
  desc: "Design enterprise authentication architecture and earn your certification rating.",
  difficulty: "Pro", type: "password",
  estimatedTime: "12-16 min",
  objective: "Build a layered enterprise security architecture and validate it against controlled attack evaluations.",
  scenario: "You are leading final enterprise security design review. Your architecture will be tested across multiple attack paths and operational constraints.",
  userTask: "Configure all security control panels, then run certification evaluation and review your final architecture rating.",
  simulationLogic: "Three-phase certification simulation: architecture design, controlled attack evaluation, and professional scoring feedback.",
  visualMode: "Hybrid",
  successCondition: "Assessment always completes. Final rating reflects architecture quality.",
  successFeedback: "Certification assessment completed. Final enterprise security rating generated.",
  failureFeedback: "Assessment completed with major security gaps. Review recommendations and improve architecture.",
  objectives: [
    "Design full authentication security architecture",
    "Mitigate simulated enterprise attack scenarios",
    "Balance security, usability, and operational stability",
    "Earn professional certification rating",
  ],
  hintSystem: {
    hint1: "Layered controls perform better than single-control designs.",
    hint2: "Strong security choices can affect user experience and operations.",
    hint3: "Use monitoring and response controls to improve early detection.",
  },
  knowledgeSummary: {
    title: "Enterprise architecture is about tradeoffs, not perfection",
    bullets: [
      "No architecture gets A+ on every dimension — security, usability, and stability pull in different directions.",
      "Hardware security keys are the strongest MFA but add the most user friction.",
      "Real-time anomaly detection dramatically improves incident response maturity.",
    ],
    insight: "The best security architects understand tradeoffs and communicate them — they don't just pick the strongest control on every axis.",
  },
  puzzle: {
    interactionMode: "enterpriseArchitectureSimulation",

    /* FIXED: live rating preview during Phase 1 design */
    livePreview: {
      enabled: true,
      label: "Estimated rating",
      updateOnChange: true,
      footnote: "Preview updates as you change controls. Final rating is computed after evaluation.",
    },

    configurationOptions: {
      passwordPolicy: {
        title: "Password Policy",
        options: [
          { id:"minimum_length",       label:"Minimum Length",           values:["8","12","16"] },
          { id:"allow_passphrases",    label:"Allow Passphrases",        values:["yes","no"] },
          { id:"require_complexity",   label:"Require Complexity Rules",  values:["yes","no"] },
          { id:"block_common_passwords", label:"Block Common Password List", values:["yes","no"] },
        ],
      },
      passwordStorage: {
        title: "Password Storage",
        options: [
          { id:"plaintext",            label:"Plain Text",                securityLevel:"unsafe" },
          { id:"hash_only",            label:"Hash Only",                 securityLevel:"basic" },
          { id:"hash_salt",            label:"Hash + Salt",               securityLevel:"recommended" },
          { id:"hash_salt_iteration",  label:"Hash + Salt + Iteration Cost", securityLevel:"best" },
        ],
      },
      authenticationControls: {
        title: "Authentication Controls",
        options: [
          { id:"no_mfa",              label:"No MFA" },
          { id:"sms_mfa",             label:"SMS-based MFA" },
          { id:"app_mfa",             label:"Authenticator App MFA" },
          { id:"hardware_key_mfa",    label:"Hardware Security Key MFA" },
        ],
      },
      loginProtection: {
        title: "Login Protection",
        options: [
          { id:"no_login_protection", label:"No Rate Limiting" },
          { id:"rate_limiting",       label:"Rate Limiting" },
          { id:"account_lockout",     label:"Account Lockout" },
          { id:"captcha",             label:"CAPTCHA" },
          { id:"adaptive_risk_login", label:"Adaptive Risk-based Login" },
        ],
      },
      monitoringResponse: {
        title: "Monitoring & Response",
        options: [
          { id:"no_monitoring",       label:"No Monitoring" },
          { id:"basic_logging",       label:"Basic Logging" },
          { id:"breach_alerts",       label:"Breach Alert System" },
          { id:"realtime_anomaly",    label:"Real-time Anomaly Detection" },
        ],
      },
    },
    evaluationEngine: {
      phases: [
        { id:"phase_1_design",    name:"System Design",            description:"Configure enterprise authentication architecture controls." },
        { id:"phase_2_attack_eval",name:"Controlled Attack Evaluation", description:"Run structured attack simulations against selected controls." },
        { id:"phase_3_metrics",   name:"Performance Metrics",     description:"Generate architecture scores and certification rating." },
      ],
      attackCount: 5,
      resultLabels: ["Blocked","Partially Mitigated","Successful"],
    },
    attackSimulationMatrix: [
      { attackId:"brute_force_test",           attackName:"Brute Force Test",            strongCounters:["rate_limiting","account_lockout","adaptive_risk_login","captcha"],          partialCounters:["basic_logging"],       impactedBy:["minimum_length","block_common_passwords"] },
      { attackId:"credential_stuffing_test",   attackName:"Credential Stuffing Test",    strongCounters:["app_mfa","hardware_key_mfa","adaptive_risk_login","breach_alerts"],        partialCounters:["sms_mfa","rate_limiting"], impactedBy:["block_common_passwords"] },
      { attackId:"offline_database_theft_test",attackName:"Offline Database Theft Test", strongCounters:["hash_salt_iteration","hash_salt"],                                         partialCounters:["hash_only"],           impactedBy:["minimum_length","allow_passphrases"] },
      { attackId:"phishing_attempt_test",      attackName:"Phishing Attempt",            strongCounters:["hardware_key_mfa","app_mfa","realtime_anomaly","breach_alerts"],           partialCounters:["sms_mfa","basic_logging"], impactedBy:["require_complexity"] },
      { attackId:"insider_privilege_misuse_test", attackName:"Insider Privilege Misuse Test", strongCounters:["realtime_anomaly","adaptive_risk_login","breach_alerts"],             partialCounters:["basic_logging"],       impactedBy:["monitoringResponse"] },
    ],
    scoringAlgorithm: {
      weightedCategories: {
        vaultSecurityScore:       { weight:0.30, basedOn:["attack_outcomes","storage_strength","login_protection"] },
        breachResistanceScore:    { weight:0.25, basedOn:["attack_outcomes","mfa_strength","password_policy"] },
        userExperienceScore:      { weight:0.15, basedOn:["policy_friction","mfa_usability","login_flow"] },
        operationalStabilityScore:{ weight:0.15, basedOn:["monitoring_overhead","control_complexity","response_consistency"] },
        incidentResponseMaturity: { weight:0.15, basedOn:["monitoring_response_stack","detection_speed","alert_quality"] },
      },
      attackOutcomePoints: { blocked:100, partially_mitigated:65, successful:25 },
      finalScoreRange: { min:0, max:100 },
      ratingRules: [
        { rating:"A+", minScore:92 },
        { rating:"A",  minScore:80 },
        { rating:"B",  minScore:65 },
        { rating:"C",  minScore:0  },
      ],
    },
    ratingBands: {
      "A+": "Exceptional Security Architect",
      "A":  "Strong Defensive Design",
      "B":  "Good but with Gaps",
      "C":  "Needs Improvement",
    },
    feedbackGenerator: {
      summaryTemplate: "You successfully mitigated [mitigatedCount] of [totalThreats] simulated threats.",
      strongestAreaTemplate: "Strongest area: [strongestArea].",
      weakestAreaTemplate: "Weakest area: [weakestArea].",
      recommendationTemplate: "Recommended improvement: [recommendation].",
      professionalExample: "Your architecture performed strongly against offline attacks due to proper salting and iteration cost. However, lack of adaptive login monitoring reduced early detection capability.",
      humilityMessage: "No system is completely immune to risk. Continuous monitoring and user education remain critical.",
    },
    certificationBadgeLogic: {
      badgeName: "Certified Security Architect",
      unlockCondition: { minimumRating:"A", minimumScore:80 },
      lockedMessage: "Certification not granted. Improve architecture and re-run assessment.",
    },
  },
  aiSpeed: 1.45,
  rewards: { xp: 520, credits: 260 },
  completed: false, locked: true, bestScore: 0,
};

/* ─── export ──────────────────────────────────────────────────────────────── */

export const passwordMissions = [
  level1, level2, level3, level4, level5,
  level6, level7, level8, level9, level10,
];

// The current data set only defines password missions. Export empty arrays for
// the newer section-based game flow so menu navigation can still initialize.
export const malwareMissions = [];
export const networkMissions = [];

export const missions = [
  ...passwordMissions,
  ...malwareMissions,
  ...networkMissions,
];

export function getMissionsBySection(section) {
  if (section === "password") return passwordMissions;
  if (section === "malware") return malwareMissions;
  if (section === "network") return networkMissions;
  return [];
}

export function getMissionById(id) {
  return missions.find(m => m.id === id);
}

export function getUnlockedMissionsForSection(section) {
  return getMissionsBySection(section).filter(m => !m.locked);
}

export function getCompletedMissionsForSection(section) {
  return getMissionsBySection(section).filter(m => m.completed);
}

export function unlockNextLevelInSection(section, completedLevel) {
  const sectionMissions = getMissionsBySection(section);
  const next = sectionMissions.find(m => m.level === completedLevel + 1);
  if (next && next.locked) {
    next.locked = false;
    console.log(`🔓 Unlocked ${section} Level ${next.level}: ${next.title}`);
    return true;
  }
  return false;
}
