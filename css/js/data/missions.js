/**
 * Mission definitions database - Password Section (10 Levels) — IMPROVED v2
 *
 * Fixes applied:
 *  L2  — maxAttempts raised to 2; second wrong choice costs vault, not instant fail
 *  L6  — breach triage board now uses the premium level 1 shell with incident-response logic
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

const breachTriagePool = [
  {
    value: "Welcome@2025",
    response: "reset",
    tags: ["leaked","common","seasonal","shared_reset"],
    sourceLabel: "Helpdesk reset batch",
    strengthScore: 12,
    triage: {
      observedReuse: "18 accounts",
      privilegeTier: "Shared employee template",
      privilegeSpread: "2 admin + 16 employee",
      departmentSpread: "HR / Support / Sales",
      attackVelocity: "Template active this week",
      priorityCue: "Seen in the current helpdesk reset macro across multiple teams.",
      analystNote: "If attackers recover this once, they can spray it across a wide onboarding cohort immediately.",
      guidance: "P1 reset now. Shared seasonal resets create fast lateral spread."
    }
  },
  {
    value: "shadowdef2025!",
    response: "reset",
    tags: ["company_number","pattern","shared_reset"],
    sourceLabel: "Brand pattern cluster",
    strengthScore: 22,
    triage: {
      observedReuse: "14 accounts",
      privilegeTier: "Contractor + portal overlap",
      privilegeSpread: "4 elevated portal roles",
      departmentSpread: "Brand-wide reuse",
      attackVelocity: "Public naming pattern",
      priorityCue: "Company name + year drift repeated after the rebrand rollout.",
      analystNote: "Brand-pattern passwords are easy to predict once one sample leaks.",
      guidance: "P1 reset now. This pattern can be regenerated by attackers without a wordlist."
    }
  },
  {
    value: "AdminPortal1!",
    response: "reset",
    tags: ["company_number","pattern","role","privileged"],
    sourceLabel: "Privileged role cluster",
    strengthScore: 18,
    triage: {
      observedReuse: "6 accounts",
      privilegeTier: "Privileged admin cluster",
      privilegeSpread: "6 admin / service identities",
      departmentSpread: "Admin tools only",
      attackVelocity: "Immediate privileged replay",
      priorityCue: "Low account count, but every hit lands in a privileged workflow.",
      analystNote: "This is a classic admin naming drift password with direct control-plane impact.",
      guidance: "P1 reset now. Privileged reuse outranks broader but lower-access weak passwords."
    }
  },
  {
    value: "Password123!",
    response: "reset",
    tags: ["leaked","common","shared_reset"],
    sourceLabel: "Breach list match",
    strengthScore: 8,
    triage: {
      observedReuse: "23 accounts",
      privilegeTier: "Global breach-list hit",
      privilegeSpread: "3 admin + 20 employee",
      departmentSpread: "Every business unit",
      attackVelocity: "Immediate stuffing risk",
      priorityCue: "Exact match for one of the most replayed passwords in breach corpora.",
      analystNote: "This will be tried first by any attacker running a standard stuffing kit.",
      guidance: "P1 reset now. This is the fastest cross-account compromise multiplier on the board."
    }
  },
  {
    value: "FinanceTeam#1",
    response: "monitor",
    tags: ["company_number","pattern","role"],
    sourceLabel: "Department naming drift",
    strengthScore: 25,
    triage: {
      observedReuse: "7 accounts",
      privilegeTier: "Business-unit scoped",
      privilegeSpread: "Finance staff only",
      departmentSpread: "Finance",
      attackVelocity: "Targeted departmental spray",
      priorityCue: "Weak and repeated, but currently contained to one business unit.",
      analystNote: "Second-wave reset candidate once the broadest hotspots are contained.",
      guidance: "Watchlist for wave two. Risky, but narrower than the global reset patterns."
    }
  },
  {
    value: "QuarterEnd#2024",
    response: "monitor",
    tags: ["company_number","pattern","shared_reset","seasonal"],
    sourceLabel: "Finance reset schedule",
    strengthScore: 27,
    triage: {
      observedReuse: "5 accounts",
      privilegeTier: "Reporting workflow overlap",
      privilegeSpread: "1 reporting role + contractors",
      departmentSpread: "Quarter-end finance ops",
      attackVelocity: "Date-pattern replay",
      priorityCue: "Predictable temporary reset tied to quarter-close timing.",
      analystNote: "Attackers can generate similar variants, but current spread is still narrower than the top four.",
      guidance: "Watchlist for wave two. This should be contained after the broader compromise multipliers."
    }
  },
  {
    value: "SpringAudit#1",
    response: "monitor",
    tags: ["pattern","company_number","shared_reset","seasonal"],
    sourceLabel: "Quarterly audit wave",
    strengthScore: 24,
    triage: {
      observedReuse: "4 accounts",
      privilegeTier: "Audit analyst lane",
      privilegeSpread: "Audit team only",
      departmentSpread: "Audit / compliance",
      attackVelocity: "Predictable cycle-based reset",
      priorityCue: "Weak audit-season password, but reuse is currently contained to one specialist team.",
      analystNote: "Good watchlist candidate because attackers may pivot into evidence stores later.",
      guidance: "Watchlist for wave two. Dangerous, but not wider than the immediate reset queue."
    }
  },
  {
    value: "Welcome2Office",
    response: "monitor",
    tags: ["common","pattern","shared_reset"],
    sourceLabel: "Onboarding template",
    strengthScore: 16,
    triage: {
      observedReuse: "6 accounts",
      privilegeTier: "New-hire cohort",
      privilegeSpread: "Employee-only",
      departmentSpread: "Recent onboarding wave",
      attackVelocity: "High replay value",
      priorityCue: "Common onboarding phrase reused across recent hires.",
      analystNote: "Very weak, but the blast radius is still smaller than the global breach-list and admin patterns.",
      guidance: "Watchlist for wave two unless a P1 slot opens up."
    }
  },
  {
    value: "Rahim2001!",
    response: "defer",
    tags: ["name_year","osint"],
    sourceLabel: "Single-user OSINT pivot",
    strengthScore: 18,
    triage: {
      observedReuse: "1 account",
      privilegeTier: "Single-user weak password",
      privilegeSpread: "No privileged access",
      departmentSpread: "Personal only",
      attackVelocity: "Targeted guess",
      priorityCue: "Still weak, but the current spill only ties it to one person.",
      analystNote: "Do not burn scarce P1 reset capacity on a single-user OSINT guess before containing shared patterns.",
      guidance: "Defer from the first wave. Handle after shared hotspots are isolated."
    }
  },
  {
    value: "Tania1997!",
    response: "defer",
    tags: ["name_year","osint"],
    sourceLabel: "Public profile pivot",
    strengthScore: 17,
    triage: {
      observedReuse: "1 account",
      privilegeTier: "Single-user weak password",
      privilegeSpread: "No privileged access",
      departmentSpread: "Personal only",
      attackVelocity: "Targeted guess",
      priorityCue: "Weak, but scoped to one exposed identity rather than a shared pattern.",
      analystNote: "This can wait until the org-wide reuse chains are broken.",
      guidance: "Defer from the first wave. Handle after blast-radius credentials are contained."
    }
  },
  {
    value: "Nabil@Home88",
    response: "defer",
    tags: ["name_year","pattern"],
    sourceLabel: "Scoped personal pattern",
    strengthScore: 29,
    triage: {
      observedReuse: "1 account",
      privilegeTier: "Single-user pattern",
      privilegeSpread: "No privileged access",
      departmentSpread: "Personal only",
      attackVelocity: "Manual targeting only",
      priorityCue: "Patterned, but not currently observed across multiple accounts.",
      analystNote: "This is a weak credential, not an immediate reset-wave multiplier.",
      guidance: "Defer from the first wave. Not a shared hotspot."
    }
  },
  {
    value: "BlueHarbor!Comet!91",
    response: "defer",
    tags: ["passphrase","strong"],
    sourceLabel: "Length-based passphrase",
    strengthScore: 84,
    triage: {
      observedReuse: "1 account",
      privilegeTier: "Resilient credential",
      privilegeSpread: "Single employee",
      departmentSpread: "No pattern reuse seen",
      attackVelocity: "Low replay value",
      priorityCue: "Long passphrase with no evidence of spread.",
      analystNote: "Do not spend reset capacity here while widespread weak templates remain active.",
      guidance: "Defer. This is not part of the chain-failure path."
    }
  },
  {
    value: "N7#hP4@kR2!x",
    response: "defer",
    tags: ["random","strong"],
    sourceLabel: "Entropy-forward build",
    strengthScore: 96,
    triage: {
      observedReuse: "1 account",
      privilegeTier: "Randomized reset-safe",
      privilegeSpread: "Single employee",
      departmentSpread: "No repeat evidence",
      attackVelocity: "Very low replay value",
      priorityCue: "High-entropy random string with no organizational pattern.",
      analystNote: "Safe to leave out of the emergency reset wave.",
      guidance: "Defer. No shared hotspot indicators."
    }
  },
  {
    value: "Ledger-Window-Cipher-88",
    response: "defer",
    tags: ["passphrase","strong"],
    sourceLabel: "Long unique phrase",
    strengthScore: 88,
    triage: {
      observedReuse: "1 account",
      privilegeTier: "Strong passphrase",
      privilegeSpread: "Single business user",
      departmentSpread: "No spread detected",
      attackVelocity: "Low replay value",
      priorityCue: "Long and unique, with no evidence of reuse.",
      analystNote: "This would be noise in the first reset wave.",
      guidance: "Defer. Keep focus on the high-blast credentials."
    }
  },
  {
    value: "QuietFalcon_StoneWave_882",
    response: "defer",
    tags: ["passphrase","strong"],
    sourceLabel: "Passphrase lane",
    strengthScore: 86,
    triage: {
      observedReuse: "1 account",
      privilegeTier: "Strong passphrase",
      privilegeSpread: "Single employee",
      departmentSpread: "No spread detected",
      attackVelocity: "Low replay value",
      priorityCue: "No indication this phrase is reused anywhere else.",
      analystNote: "Not a candidate for scarce emergency-reset capacity.",
      guidance: "Defer. Strong and isolated."
    }
  },
  {
    value: "M9!tR2#kL8@q",
    response: "defer",
    tags: ["random","strong"],
    sourceLabel: "Randomized reset-safe",
    strengthScore: 95,
    triage: {
      observedReuse: "1 account",
      privilegeTier: "High-entropy random",
      privilegeSpread: "Single employee",
      departmentSpread: "No shared pattern",
      attackVelocity: "Very low replay value",
      priorityCue: "No breach-intel shortcut here.",
      analystNote: "Attackers cannot cheaply regenerate this from org patterns.",
      guidance: "Defer. Not part of the immediate compromise cascade."
    }
  },
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

const makeBreachTriageSession = () => {
  const resetPool = breachTriagePool.filter(entry => entry.response === "reset");
  const monitorPool = breachTriagePool.filter(entry => entry.response === "monitor");
  const deferPool = breachTriagePool.filter(entry => entry.response === "defer");

  const resetTargets = resetPool.slice(0, 4);
  const monitorTargets = randomPick(monitorPool, 3);
  const deferTargets = randomPick(deferPool, 5);
  const mixed = randomPick([...resetTargets, ...monitorTargets, ...deferTargets], 12);

  return {
    options: mixed.map((entry, index) => ({
      id: index + 1,
      value: entry.value,
      isWeak: entry.response !== "defer",
      expectedAction: entry.response,
      tags: entry.tags || [],
      sourceLabel: entry.sourceLabel,
      strengthScore: entry.strengthScore,
      triage: entry.triage || {},
    })),
    weakAnswers: resetTargets.map(entry => entry.value),
    correctWeakPasswords: resetTargets.map(entry => entry.value),
    resetTargets: resetTargets.map(entry => entry.value),
    monitorTargets: monitorTargets.map(entry => entry.value),
    storyHint: "The breach team decrypted a small credential slice, but the first emergency reset wave can only hit the highest blast-radius passwords. Inspect the board, spend the reset budget carefully, and watchlist the next-most-dangerous credentials.",
    failHints: [
      "Think blast radius first: breach-list favorites and shared admin patterns outrank one-person weak passwords.",
      "A password can be weak without belonging in the first reset wave. Scope matters.",
      "Watchlist the second-wave suspects, but reserve P1 for the credentials that can unlock many accounts right now."
    ],
    securityInsight: [
      "Incident response triage is about blast radius, not just raw password weakness.",
      "Shared defaults, admin naming drift, and breach-list favorites should consume the first emergency reset wave before narrower one-person guesses.",
      "Second-wave watchlists matter too: defenders need to contain both the immediate cascade and the next cluster of risky reuse."
    ],
  };
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
    timeLimit: 60,
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
        6,
        3
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
    timeLimit: 60,
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
    timeLimit: 60,
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
    timeLimit: 60,
    disableAIOpponent: true,
    evidenceLogs: [
      "02:12:58 - Failed login: admin",
      "02:13:00 - Failed login: admin",
      "02:13:03 - Successful login: admin",
    ],
    profileData: { name: "Rahim Hasan", publicInfo: "Graduation year: 2001", role: "System Administrator" },
    systemPolicy: { rateLimiting: "No rate limiting", accountLockout: "No account lockout", passwordRule: "Basic complexity only" },
    choices: [
      {
        id: "brute_force",
        label: "Brute Force",
        description: "Tries a very large range of random passwords. It is broad but slower than a targeted wordlist attack."
      },
      {
        id: "dictionary_attack",
        label: "Dictionary Attack",
        description: "Tests common words and predictable patterns like a name plus birth or graduation year. That matches this breach trail."
      },
      {
        id: "credential_reuse",
        label: "Credential Reuse",
        description: "Uses passwords leaked from another service. It usually points to reused credentials, not a rapid guess-and-success pattern."
      },
      {
        id: "insider_access",
        label: "Insider Access",
        description: "A trusted user abuses legitimate access. That would not look like repeated failed logins before success."
      },
    ],
    correctAnswer: "dictionary_attack",
    revealOnCorrect: { actualPassword: "rahim2001", message: "The attacker guessed a name + year pattern." },
    simpleExplanation: "Dictionary Attack: an automated system trying common words and patterns.",
    followUpDefenseQuestion: {
      prompt: "What would prevent this next time?",
      options: [
        {
          id: "lockout_rule",
          label: "Add lockout rule",
          description: "Temporarily blocks the account after repeated failures, cutting off unlimited guessing."
        },
        {
          id: "increase_font",
          label: "Increase font size",
          description: "Purely visual. It does not change the authentication flow or stop automated attacks."
        },
        {
          id: "hide_login_button",
          label: "Hide login button",
          description: "Security through obscurity. Attackers can still hit the login endpoint directly."
        },
        {
          id: "remove_usernames",
          label: "Remove usernames",
          description: "Reducing exposed usernames may help a little, but it does not stop unlimited password guessing."
        },
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
    timeLimit: 60,
    disableAIOpponent: true,
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
   LEVEL 6 — Live Defense Simulation  *** DIFFICULTY RAMP FIX ***
   FIX: attackSpawnRate now has a rampUpAfterSeconds field.
        For the first 15 seconds the spawn interval is 4-6s (gentle).
        After 15 seconds it tightens to 2-4s (full pressure).
        This bridges the difficulty climb from Level 5's storage audit.
   ══════════════════════════════════════════════════════════════════════════ */
const level7 = {
  id: 16, level: 6,
  title: "LEVEL 6: Vault Defense Grid — Hold the Line",
  desc: "Survive coordinated attack waves by rotating the right controls under energy and cooldown pressure.",
  difficulty: "Hard", type: "password",
  estimatedTime: "6-8 min",
  objective: "Keep Vault Health above zero through a 60-second coordinated attack run.",
  scenario: "A three-wave attack campaign is hitting the authentication platform. Brute force probes, credential stuffing, phishing, and offline cracking surge in sequence. Read the intel feed and deploy the right control before each threat window closes.",
  userTask: "Watch the live attack intel, deploy the right control card, and survive the full defense timer.",
  simulationLogic: "Wave-based cyber defense board with fixed attack sequences, cooldown rotation, and energy management.",
  visualMode: "2D",
  successCondition: "Vault Health stays above 0 after 60 seconds.",
  successFeedback: "Defense successful. The vault stayed protected under live pressure.",
  failureFeedback: "Vault breach occurred. Defense timing and coverage were not enough.",
  objectives: [
    "Read the wave intel before each threat window closes",
    "Rotate controls without starving your energy pool",
    "Hold the vault through the final surge",
  ],
  hintSystem: {
    hint1: "Save MFA for phishing and credential stuffing. It is too expensive to waste on easy waves.",
    hint2: "Salting only pays off against offline crack attempts. Do not burn it elsewhere.",
    hint3: "Cheaper brute-force controls help you stay alive while your premium counters recharge.",
  },
  knowledgeSummary: {
    title: "Good defenders rotate controls, not panic-click buttons",
    bullets: [
      "Every attack family has a best-fit counter. Using the right control matters more than using the most expensive one.",
      "Energy management is a proxy for budget: cheap, well-timed controls can keep the grid alive while premium counters recharge.",
      "MFA is powerful, but if you waste it early you will be exposed when phishing or credential stuffing hits later.",
    ],
    insight: "Security is a system, not a product. Controls must work together.",
  },
  puzzle: {
    interactionMode: "liveDefenseSimulation",
    noTimerPressure: true,
    timeLimit: 0,
    defenses: [
      { id:"rate",    name:"Rate Limiting",            energyCost:20, cooldown:5,  protectsAgainst:["Brute Force"], tags:["Brute Force"], description:"Throttle repeated login attempts before they cascade into a full brute-force breach." },
      { id:"lockout", name:"Account Lockout",          energyCost:15, cooldown:6,  protectsAgainst:["Brute Force"], tags:["Brute Force"], description:"Force a hard stop after repeated failures and break the attacker rhythm." },
      { id:"salt",    name:"Salting",                  energyCost:25, cooldown:8,  protectsAgainst:["Offline Crack Attempt"], tags:["Offline Crack"], description:"Neutralize stolen-hash cracking windows before the dump can be weaponized." },
      { id:"mfa",     name:"MFA",                      energyCost:35, cooldown:10, protectsAgainst:["Credential Stuffing","Phishing Wave"], tags:["Credential Stuffing","Phishing Wave"], description:"High-impact identity control that blocks stolen credentials and phishing reuse." },
      { id:"pwreuse", name:"Password Reuse Detection", energyCost:30, cooldown:9,  protectsAgainst:["Credential Stuffing"], tags:["Credential Stuffing"], description:"Flag replayed breach credentials before they spread laterally across accounts." },
      { id:"breach",  name:"Breach Monitoring",        energyCost:25, cooldown:7,  protectsAgainst:["Credential Stuffing","Phishing Wave"], tags:["Credential Stuffing","Phishing Wave"], description:"Surface live exposure signals fast enough to cut off stuffing and phishing surges." },
    ],
    waves: [
      {
        name: "Brute Force Campaign",
        attacks: [
          { type:"Brute Force", damage:10, desc:"High-volume repeated login guesses against one account.", counterIds:["rate","lockout"] },
          { type:"Brute Force", damage:10, desc:"High-volume repeated login guesses against one account.", counterIds:["rate","lockout"] },
          { type:"Offline Crack Attempt", damage:15, desc:"Hash dump being cracked offline at high speed.", counterIds:["salt"] },
        ]
      },
      {
        name: "Credential Stuffing Wave",
        attacks: [
          { type:"Credential Stuffing", damage:20, desc:"Leaked username/password pairs being tried at scale.", counterIds:["mfa","pwreuse","breach"] },
          { type:"Phishing Wave", damage:25, desc:"Mass phishing campaign harvesting credentials.", counterIds:["mfa","breach"] },
          { type:"Credential Stuffing", damage:20, desc:"Second wave of stuffed credentials from a new breach.", counterIds:["mfa","pwreuse","breach"] },
        ]
      },
      {
        name: "Advanced Persistent Threat",
        attacks: [
          { type:"Brute Force", damage:10, desc:"Distributed brute force across thousands of IPs.", counterIds:["rate","lockout"] },
          { type:"Phishing Wave", damage:25, desc:"Spear phishing targeting executives.", counterIds:["mfa","breach"] },
          { type:"Offline Crack Attempt", damage:20, desc:"Sophisticated offline crack using GPUs.", counterIds:["salt"] },
          { type:"Credential Stuffing", damage:30, desc:"Mega-breach credential dump attack.", counterIds:["mfa","pwreuse","breach"] },
        ]
      },
    ],
    simulationConfig: {
      vaultHealth: 100,
      playerEnergy: 100,
      energyRegenRate: { amount: 3, everySeconds: 1 },
      simulationDuration: 60,
      initialAttackDelayMs: 3000,
      betweenAttackDelayMs: 3000,
      betweenWaveDelayMs: 4000,
      attackResolveWindowMs: 5000,
      tutorialOverlay: {
        enabled: true,
        message: "Wave 1 begins in 3 seconds. Read the intel feed, preserve energy, and keep MFA ready for the harder surges.",
      },
    },
    educationalSummary: "Security works best when the defender reads the threat, rotates the right control, and preserves enough energy for the next wave.",
  },
  aiSpeed: 1.0,
  rewards: { xp: 340, credits: 165 },
  completed: false, locked: true, bestScore: 0,
};

/* ══════════════════════════════════════════════════════════════════════════
   LEVEL 7 — Signal Intercept
   Status: LIVE packet interception scenario
   ══════════════════════════════════════════════════════════════════════════ */
const level8 = {
  id: 17, level: 7,
  title: "LEVEL 7: Signal Intercept - Operation Signal Intercept",
  desc: "Intercept hostile packets across five escalating waves while preserving server integrity.",
  difficulty: "Hard", type: "password",
  estimatedTime: "5-7 min",
  objective: "Block malicious traffic, allow legitimate packets, and keep the corporate server online through the full attack window.",
  scenario: "A live intrusion is mixing hostile traffic with normal business packets on the same network lanes. One bad click can hurt the server as much as one missed threat.",
  userTask: "Click hostile packets before they reach the server, let legitimate traffic pass, and survive all five waves of escalation.",
  simulationLogic: "Real-time network interception drill with escalating attack waves, packet recognition, combo scoring, and server-integrity management.",
  visualMode: "2D",
  successCondition: "Survive all five waves with the server still online.",
  successFeedback: "Operation Signal Intercept complete. Hostile traffic was disrupted before the attacker could establish control.",
  failureFeedback: "Server breached. Too many malicious packets reached the core system.",
  objectives: [
    "Block hostile C2, exfiltration, tunneling, ransomware, and APT packets",
    "Avoid false positives on normal traffic such as auth, HTTP, DNS, and NTP",
    "Preserve server integrity through five attack waves"
  ],
  hintSystem: {
    hint1: "Red, orange, and purple threat packets are hostile and should be intercepted before they reach the server.",
    hint2: "Blue and green packets are normal business traffic. Clicking them hurts your integrity as a false positive.",
    hint3: "Long streaks and wave-clear bonuses help your score, but integrity preservation is what keeps the mission alive."
  },
  knowledgeSummary: {
    title: "Good defenders distinguish hostile traffic from normal activity under pressure",
    bullets: [
      "Not every packet moving fast across the network is malicious. Response quality depends on classification, not panic.",
      "False positives waste defender effort and damage business operations just like missed threats damage security.",
      "Wave-based pressure rewards both rapid response and restraint when legitimate traffic is mixed into the attack stream."
    ],
    insight: "Network defense is not only about blocking more. It is about blocking the right things at the right time without breaking healthy traffic."
  },
  puzzle: {
    interactionMode: "signalInterceptSimulation",
    timeLimit: 420,
    laneLabels: ["PORT 443", "PORT 80", "PORT 53", "PORT 8080", "PORT 22"],
    server: { label: "CORP-SRV", integrity: 100 },
    attacker: { label: "ATTACKER" },
    legendOrder: ["c2", "exfil", "dnstun", "http", "auth"],
    packetTypes: {
      c2:     { label: "C2 BEACON",   color: "#ff1744", glow: "rgba(255,23,68,.6)",   malicious: true,  shape: "diamond", points: 100, damage: 18 },
      exfil:  { label: "DATA EXFIL",  color: "#ff9100", glow: "rgba(255,145,0,.6)",  malicious: true,  shape: "hex",     points: 120, damage: 22 },
      dnstun: { label: "DNS TUNNEL",  color: "#c060ff", glow: "rgba(192,96,255,.6)", malicious: true,  shape: "tri",     points: 150, damage: 15 },
      ransom: { label: "RANSOMWARE",  color: "#ff1744", glow: "rgba(255,0,0,.8)",    malicious: true,  shape: "skull",   points: 200, damage: 35 },
      apt:    { label: "APT PAYLOAD", color: "#ff2d6b", glow: "rgba(255,45,107,.7)", malicious: true,  shape: "star",    points: 250, damage: 40 },
      http:   { label: "HTTP REQ",    color: "#448aff", glow: "rgba(68,138,255,.4)", malicious: false, shape: "circle",  points:   0, damage: 20 },
      auth:   { label: "AUTH TOKEN",  color: "#00e676", glow: "rgba(0,230,118,.4)",  malicious: false, shape: "circle",  points:   0, damage: 20 },
      dns:    { label: "DNS QUERY",   color: "#00ffe7", glow: "rgba(0,255,231,.3)",  malicious: false, shape: "circle",  points:   0, damage: 15 },
      ntp:    { label: "NTP SYNC",    color: "#448aff", glow: "rgba(68,138,255,.3)", malicious: false, shape: "circle",  points:   0, damage: 12 }
    },
    waves: [
      {
        name: "WAVE 1",
        subtitle: "RECON SWEEP",
        phaseLabel: "Wave 1 - Recon",
        duration: 30,
        spawnRateMs: 1800,
        desc: "Enemy reconnaissance is probing the edge. Block C2 beacon traffic and let standard auth and HTTP requests pass.",
        threats: "C2 Beacons, Port Scans",
        friendly: "Auth, HTTP",
        pool: ["c2", "c2", "c2", "http", "auth", "http", "dns", "c2", "auth"],
        speed: 1.8
      },
      {
        name: "WAVE 2",
        subtitle: "DATA EXFILTRATION",
        phaseLabel: "Wave 2 - Exfil",
        duration: 35,
        spawnRateMs: 1400,
        desc: "The attacker is pushing outbound theft attempts. Multiple hostile packet families are now active.",
        threats: "C2 Beacons, Data Exfil",
        friendly: "Auth, HTTP, NTP",
        pool: ["c2", "exfil", "exfil", "http", "auth", "c2", "ntp", "exfil", "http", "c2"],
        speed: 2.2
      },
      {
        name: "WAVE 3",
        subtitle: "C2 STORM",
        phaseLabel: "Wave 3 - C2 Storm",
        duration: 40,
        spawnRateMs: 1100,
        desc: "DNS tunneling joins the flood. Traffic density rises and hostile packets are designed to bait false positives.",
        threats: "C2, DNS Tunnel, Exfil",
        friendly: "HTTP, Auth, NTP",
        pool: ["c2", "dnstun", "exfil", "http", "c2", "auth", "dnstun", "c2", "ntp", "http", "dnstun"],
        speed: 2.8
      },
      {
        name: "WAVE 4",
        subtitle: "RANSOMWARE PAYLOAD",
        phaseLabel: "Wave 4 - Ransomware",
        duration: 40,
        spawnRateMs: 900,
        desc: "Critical payloads are now inbound. One missed ransomware packet can strip a huge chunk of server integrity.",
        threats: "Ransomware, C2, DNS Tunnel, Exfil",
        friendly: "Auth",
        pool: ["ransom", "c2", "http", "dnstun", "ransom", "auth", "exfil", "c2", "ransom", "dns"],
        speed: 3.3
      },
      {
        name: "WAVE 5",
        subtitle: "APT FINAL PUSH",
        phaseLabel: "Wave 5 - APT Final",
        duration: 45,
        spawnRateMs: 700,
        desc: "The final coordinated surge is underway. Maximum packet speed, mixed vectors, and almost no room for mistakes.",
        threats: "APT Payloads, Ransomware, Multi-Vector Storm",
        friendly: "Auth (rare)",
        pool: ["apt", "ransom", "c2", "exfil", "dnstun", "apt", "http", "ransom", "apt", "c2", "auth", "apt", "exfil"],
        speed: 4.0
      }
    ],
    scoring: {
      waveEndHigh: 500,
      waveEndMid: 250,
      waveEndLow: 100,
      integrityMultiplier: 8,
      accuracy90: 1000,
      accuracy75: 500,
      accuracyFallback: 200,
      comboMultiplier: 50,
      falsePositivePenalty: 30,
      missedPenalty: 50
    },
    waveTransitionDelayMs: 1500,
    completionDelayMs: 1900,
    educationalSummary: {
      reveal: "Hostile packet floods are hardest when good traffic is mixed into the stream",
      message: "This exercise showed how defenders must rapidly classify live traffic, intercept malicious packets, and avoid harming normal business flows under pressure."
    }
  },
  aiSpeed: 1.0,
  rewards: { xp: 395, credits: 190 },
  completed: false, locked: true, bestScore: 0,
};

/* ══════════════════════════════════════════════════════════════════════════
   LEVEL 8 — Zero-Day Live Patch Lab  *** WIN CONDITION FIX ***
   FIX: winCondition replaces `exploitSuccessRate == 0` with a tiered system:
     - 0-5%  → full pass (3 stars)
     - 6-15% → partial pass (2 stars, score penalty applied in Game.js)
     - 16%+  → fail
   scoreRating field drives the Game.js completeMission call.
   ══════════════════════════════════════════════════════════════════════════ */
const level9 = {
  id: 18, level: 8,
  title: "LEVEL 8: Zero-Day Crisis — Live Patch Engineering Lab",
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
   LEVEL 9 — Enterprise Security Architect Certification  *** LIVE PREVIEW FIX ***
   FIX: adds livePreview flag + previewScoreFunction reference so the
        enterprise architecture UI can call it on every dropdown change
        and show an "Estimated rating: B" live while the player designs.
   ══════════════════════════════════════════════════════════════════════════ */
const level10 = {
  id: 19, level: 9,
  title: "LEVEL 9: Enterprise Security Architect — Final Certification Assessment",
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
];

const zeroDayCountdownBlueprints = [
  {
    name: 'Binary Intercept',
    step: 'INTERCEPT',
    difficulty: 'Easy',
    estimatedTime: '45s',
    hl1: 'DECODE',
    hl2: 'THE',
    hl3a: 'BINARY',
    hl3b: '',
    typeLabel: 'Binary Decode',
    techniqueBullet: 'Split the transmission into 8-bit chunks and convert each byte from binary to ASCII.',
    insight: 'Binary payloads often hide plain-text commands inside packet captures. Byte-by-byte discipline matters.',
    storyTitle: 'Breach Detected - Alpha Server',
    storyBody: 'At 02:14 AM, an unknown actor penetrated Alpha Server\'s outer firewall. Before losing the connection, sensors captured a binary transmission believed to contain the attacker\'s access keyword.',
    storyObj: 'Decode the 4-byte binary transmission to retrieve the stolen keyword.',
    desc: 'Enemy agents transmitted a password in 8-bit ASCII binary over an unsecured channel. Identify each byte and recover the keyword.',
    cipher: '01000100 01000001 01010100 01000001',
    isBinary: true,
    answer: 'DATA',
    hint: 'Convert each 8-bit group to decimal, then match that value to an ASCII letter.',
    explain: '01000100=68=D, 01000001=65=A, 01010100=84=T, 01000001=65=A -> DATA',
    aiSpeed: 0.78
  },
  {
    name: 'Caesar Shift',
    step: 'DECRYPT',
    difficulty: 'Easy',
    estimatedTime: '45s',
    hl1: 'CRACK',
    hl2: 'THE',
    hl3a: 'CAESAR',
    hl3b: '',
    typeLabel: 'Cipher Decode',
    techniqueBullet: 'A Caesar cipher moves letters a fixed number of places through the alphabet. Reverse the shift to recover the original word.',
    insight: 'Simple substitution ciphers fail once you identify the shift pattern. Pattern recognition beats brute force here.',
    storyTitle: 'Encrypted Note on a Compromised Workstation',
    storyBody: 'Forensics recovered a text file on a hacked workstation. The note uses a Caesar cipher with a forward shift of three positions.',
    storyObj: 'Reverse the Caesar shift and decode the 4-letter keyword.',
    desc: 'Every letter was shifted forward by three positions. Walk each character back to reveal the hidden keyword.',
    cipher: 'KDFN',
    isBinary: false,
    answer: 'HACK',
    hint: 'Shift every letter backward by three positions: K becomes H.',
    explain: 'K-3=H, D-3=A, F-3=C, N-3=K -> HACK',
    aiSpeed: 0.82
  },
  {
    name: 'Binary Password',
    step: 'NEUTRALIZE',
    difficulty: 'Easy',
    estimatedTime: '45s',
    hl1: 'RECOVER',
    hl2: 'STOLEN',
    hl3a: 'CREDENTIALS',
    hl3b: '',
    typeLabel: 'Binary Decode',
    techniqueBullet: 'Binary credential leaks still resolve to ASCII. Converting each byte exposes the stolen word directly.',
    insight: 'Credential theft rarely looks dramatic in raw traffic. Tiny captures can still reveal the keys to the kingdom.',
    storyTitle: 'Admin Credentials Exfiltrated',
    storyBody: 'The attacker exfiltrated admin credentials encoded in binary before the IDS triggered. A short packet capture still holds the key to the control panel.',
    storyObj: 'Decode the binary transmission to recover the stolen admin password.',
    desc: 'Binary-encoded credentials were pulled from the packet log before the breach closed. Decode every byte to recover the password.',
    cipher: '01010010 01001111 01001111 01010100',
    isBinary: true,
    answer: 'ROOT',
    hint: 'R=82, O=79, O=79, T=84 in ASCII decimal.',
    explain: '01010010=82=R, 01001111=79=O, 01001111=79=O, 01010100=84=T -> ROOT',
    aiSpeed: 0.88
  },
  {
    name: 'ROT13 Taunt',
    step: 'ANALYSE',
    difficulty: 'Medium',
    estimatedTime: '50s',
    hl1: 'DECODE',
    hl2: 'THE',
    hl3a: 'ROT13',
    hl3b: ' MESSAGE',
    typeLabel: 'Cipher Decode',
    techniqueBullet: 'ROT13 rotates every letter by 13 places. Because the alphabet has 26 letters, applying ROT13 again reverses it.',
    insight: 'Attackers use low-effort obfuscation constantly. Analysts still need to spot it instantly to keep pace.',
    storyTitle: 'Defacement Message Recovered',
    storyBody: 'The attacker defaced a public site and left a taunting message in ROT13 before disappearing.',
    storyObj: 'Apply ROT13 again to recover the 8-letter keyword.',
    desc: 'ROT13 is its own inverse. Run the ciphertext through the same rotation to decode the warning.',
    cipher: 'CNFFJBEQ',
    isBinary: false,
    answer: 'PASSWORD',
    hint: 'ROT13 is symmetrical. Apply the same 13-letter shift one more time.',
    explain: 'C->P, N->A, F->S, F->S, J->W, B->O, E->R, Q->D -> PASSWORD',
    aiSpeed: 0.96
  },
  {
    name: 'Binary SOS',
    step: 'CONTAIN',
    difficulty: 'Medium',
    estimatedTime: '45s',
    hl1: 'RECEIVE',
    hl2: 'THE',
    hl3a: 'DISTRESS',
    hl3b: ' SIGNAL',
    typeLabel: 'Binary Decode',
    techniqueBullet: 'Short binary sequences still follow the same ASCII rules. Three bytes can be enough to reveal the entire message.',
    insight: 'Containment decisions often depend on tiny clues from partial telemetry. Read the small signal correctly and fast.',
    storyTitle: 'Compromised Satellite Distress Signal',
    storyBody: 'A compromised orbital satellite is transmitting one last repeating binary signal before remote shutdown.',
    storyObj: 'Decode the 3-byte binary distress call from the satellite.',
    desc: 'Three ASCII bytes identify the emergency signal type. Decode them before the transmission dies.',
    cipher: '01010011 01001111 01010011',
    isBinary: true,
    answer: 'SOS',
    hint: 'S=83 and O=79 in ASCII decimal.',
    explain: '01010011=83=S, 01001111=79=O, 01010011=83=S -> SOS',
    aiSpeed: 1.02
  },
  {
    name: 'Reverse Cipher',
    step: 'TRACE',
    difficulty: 'Medium',
    estimatedTime: '50s',
    hl1: 'REVERSE',
    hl2: 'THE',
    hl3a: 'DARK WEB',
    hl3b: ' MESSAGE',
    typeLabel: 'Cipher Decode',
    techniqueBullet: 'A reverse cipher simply flips character order. Reading from right to left restores the original string.',
    insight: 'Not every hostile message is sophisticated. Analysts win by clearing easy obfuscation instantly and moving on.',
    storyTitle: 'Dark Web Message Intercepted',
    storyBody: 'Monitoring caught a message between two threat actors using a naive reverse cipher as quick obfuscation.',
    storyObj: 'Reverse the string to uncover the hidden security keyword.',
    desc: 'The actor reversed the message letter by letter. Read it backward to expose the keyword.',
    cipher: 'LLAWERIF',
    isBinary: false,
    answer: 'FIREWALL',
    hint: 'Read the characters from right to left.',
    explain: 'LLAWERIF reversed becomes FIREWALL',
    aiSpeed: 1.1
  },
  {
    name: 'Binary Command',
    step: 'ISOLATE',
    difficulty: 'Hard',
    estimatedTime: '50s',
    hl1: 'IDENTIFY',
    hl2: 'BOTNET',
    hl3a: 'COMMAND',
    hl3b: '',
    typeLabel: 'Binary Decode',
    techniqueBullet: 'Botnet C2 traffic often hides short commands in binary-safe payloads. ASCII decoding exposes the operator intent.',
    insight: 'Even tiny C2 fragments can tell you whether the attacker is staging, beaconing, or executing.',
    storyTitle: 'Botnet Command Captured in Packet Trace',
    storyBody: 'Wireshark flagged suspicious outbound traffic from an infected machine. A binary payload sent to the botnet controller was recovered.',
    storyObj: 'Decode the 4-byte binary botnet command.',
    desc: 'Translate each byte from binary into ASCII to identify the command issued to the botnet.',
    cipher: '01000010 01001111 01001111 01010100',
    isBinary: true,
    answer: 'BOOT',
    hint: 'B=66, O=79, O=79, T=84 in ASCII decimal.',
    explain: '01000010=66=B, 01001111=79=O, 01001111=79=O, 01010100=84=T -> BOOT',
    aiSpeed: 1.18
  },
  {
    name: 'Atbash Mirror',
    step: 'MIRROR',
    difficulty: 'Hard',
    estimatedTime: '55s',
    hl1: 'BREAK',
    hl2: 'THE',
    hl3a: 'ATBASH',
    hl3b: ' CODE',
    typeLabel: 'Cipher Decode',
    techniqueBullet: 'Atbash maps each letter to its alphabet mirror: A<->Z, B<->Y, C<->X. Mirror each character to decode the text.',
    insight: 'Historical ciphers still appear in training data, challenge platforms, and adversary taunts. Foundations still matter.',
    storyTitle: 'Recovered Notebook Cipher',
    storyBody: 'Field agents recovered a notebook filled with words encoded using Atbash mirroring.',
    storyObj: 'Apply Atbash mirroring to decode the 4-letter word.',
    desc: 'Mirror every letter against the alphabet to recover the hidden keyword.',
    cipher: 'SZXP',
    isBinary: false,
    answer: 'HACK',
    hint: 'S mirrors to H, Z mirrors to A, X mirrors to C, and P mirrors to K.',
    explain: 'S->H, Z->A, X->C, P->K -> HACK',
    aiSpeed: 1.26
  },
  {
    name: 'Binary Threat ID',
    step: 'CLASSIFY',
    difficulty: 'Hard',
    estimatedTime: '50s',
    hl1: 'CLASSIFY',
    hl2: 'THE',
    hl3a: 'MALWARE',
    hl3b: ' TYPE',
    typeLabel: 'Binary Decode',
    techniqueBullet: 'Header metadata often exposes the family or behavior of a sample once the bytes are decoded.',
    insight: 'Fast classification lets defenders move from detection to the right containment playbook without hesitation.',
    storyTitle: 'Unknown Malware Signature Detected',
    storyBody: 'A new malware strain is spreading across university networks. Binary metadata from the sample header may identify the family.',
    storyObj: 'Decode the header bytes and identify the malware type.',
    desc: 'Translate the 4-byte header metadata and classify the threat before it spreads further.',
    cipher: '01010111 01001111 01010010 01001101',
    isBinary: true,
    answer: 'WORM',
    hint: 'W=87, O=79, R=82, M=77 in ASCII decimal.',
    explain: '01010111=87=W, 01001111=79=O, 01010010=82=R, 01001101=77=M -> WORM',
    aiSpeed: 1.34
  },
  {
    name: 'Final Cipher',
    step: 'ENDGAME',
    difficulty: 'Hard',
    estimatedTime: '60s',
    hl1: 'STOP',
    hl2: 'THE',
    hl3a: 'ZERO-DAY',
    hl3b: '',
    typeLabel: 'Cipher Decode',
    techniqueBullet: 'Final-stage payload controls are often hidden in plain text with only trivial obfuscation. Recovering the kill command is the real race.',
    insight: 'The last step in incident response is not just understanding the attack. It is recovering the exact control needed to stop it.',
    storyTitle: 'Final Stage - Ghost\'s Last Message',
    storyBody: 'You reached the final stage. The master operator known only as GHOST left one last reversed message before triggering the Zero-Day payload.',
    storyObj: 'Decode the final reversed cipher and issue the kill command.',
    desc: 'Reverse the final command string before the exploit window closes and neutralize the campaign.',
    cipher: 'DNAMMOC',
    isBinary: false,
    answer: 'COMMAND',
    hint: 'Read the command from right to left.',
    explain: 'DNAMMOC reversed becomes COMMAND',
    aiSpeed: 1.44
  }
];

const buildZeroDayObjectives = (typeLabel) => [
  `Intercept the ${String(typeLabel || 'decode').toLowerCase()} transmission`,
  'Apply the correct decoding technique',
  'Submit the hostile keyword before deployment'
];

const buildZeroDayHintSystem = (mission) => ({
  hint1: mission.hint,
  hint2: mission.explain,
  hint3: mission.techniqueBullet
});

const buildZeroDayKnowledgeSummary = (mission) => ({
  title: `Debrief - ${mission.name}`,
  bullets: [
    mission.techniqueBullet,
    mission.hint,
    mission.explain
  ],
  insight: mission.insight
});

export const malwareMissions = zeroDayCountdownBlueprints.slice(0, 5).map((mission, index) => ({
  id: 101 + index,
  level: index + 1,
  title: `LEVEL ${index + 1}: ${mission.name}`,
  desc: mission.desc,
  difficulty: mission.difficulty,
  type: 'zeroday',
  estimatedTime: mission.estimatedTime,
  objective: mission.storyObj,
  scenario: mission.storyBody,
  userTask: mission.desc,
  simulationLogic: 'Educational cyber response simulation only.',
  visualMode: '2D',
  successCondition: 'Decode the hostile keyword before the payload chain completes.',
  successFeedback: 'Threat neutralized. Transmission decoded in time.',
  failureFeedback: 'The signal window collapsed before containment completed.',
  objectives: buildZeroDayObjectives(mission.typeLabel),
  hintSystem: buildZeroDayHintSystem(mission),
  knowledgeSummary: buildZeroDayKnowledgeSummary(mission),
  puzzle: {
    interactionMode: 'zeroDayCountdownLab',
    maxAttempts: 3,
    timeLimit: Number.parseInt(mission.estimatedTime, 10) || 45,
    name: mission.name,
    stepLabel: mission.step,
    typeLabel: mission.typeLabel,
    storyTitle: mission.storyTitle,
    storyObjective: mission.storyObj,
    description: mission.desc,
    cipher: mission.cipher,
    isBinary: mission.isBinary,
    answer: mission.answer,
    hint: mission.hint,
    explain: mission.explain,
    hero: {
      line1: mission.hl1,
      line2: mission.hl2,
      line3Accent: mission.hl3a,
      line3Tail: mission.hl3b
    }
  },
  aiSpeed: mission.aiSpeed,
  rewards: { xp: 160 + (index * 18), credits: 80 + (index * 10) },
  completed: false,
  locked: index !== 0,
  bestScore: 0,
}));

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
