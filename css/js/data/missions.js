/**
 * Mission definitions database - Independent Sections
 */

const passwordTrainingPool = [
    { value: "sarah1998", weak: true, tags: ["name_year", "osint"] },
    { value: "rahim2001", weak: true, tags: ["name_year", "osint"] },
    { value: "maria2000", weak: true, tags: ["name_year", "osint"] },
    { value: "tania1997", weak: true, tags: ["name_year", "osint"] },
    { value: "shadowdef2024", weak: true, tags: ["company_number", "pattern"] },
    { value: "acmecorp123", weak: true, tags: ["company_number", "pattern"] },
    { value: "northstar1", weak: true, tags: ["company_number", "pattern"] },
    { value: "welcome123", weak: true, tags: ["leaked", "common"] },
    { value: "password123", weak: true, tags: ["leaked", "common"] },
    { value: "admin123", weak: true, tags: ["leaked", "common"] },
    { value: "letmein", weak: true, tags: ["leaked", "common"] },
    { value: "qwerty123", weak: true, tags: ["keyboard", "pattern"] },
    { value: "asdfghjkl", weak: true, tags: ["keyboard", "pattern"] },
    { value: "1q2w3e4r", weak: true, tags: ["keyboard", "pattern"] },
    { value: "123456", weak: true, tags: ["sequence", "common"] },
    { value: "12345678", weak: true, tags: ["sequence", "common"] },
    { value: "987654321", weak: true, tags: ["sequence", "pattern"] },
    { value: "11111111", weak: true, tags: ["sequence", "pattern"] },
    { value: "football7", weak: true, tags: ["leaked", "common"] },
    { value: "iloveyou", weak: true, tags: ["leaked", "common"] },
    { value: "dragon", weak: true, tags: ["leaked", "common"] },
    { value: "sunshine99", weak: true, tags: ["pattern", "common"] },
    { value: "T7!kP9@vQ2", weak: false, tags: ["random", "strong"] },
    { value: "nR4$zL8#pW1", weak: false, tags: ["random", "strong"] },
    { value: "X2@bM9!qL7#", weak: false, tags: ["random", "strong"] },
    { value: "vQ8!rN3@tP6$", weak: false, tags: ["random", "strong"] },
    { value: "BlueRiver!Train!Cloud!19", weak: false, tags: ["passphrase", "strong"] },
    { value: "Orbit-Mango-Delta-47!Signal", weak: false, tags: ["passphrase", "strong"] },
    { value: "QuietFalcon_StoneWave_882", weak: false, tags: ["passphrase", "strong"] },
    { value: "Maple!Harbor!Cipher!204", weak: false, tags: ["passphrase", "strong"] },
    { value: "Lemon&Steel&Comet&431", weak: false, tags: ["passphrase", "strong"] },
    { value: "SignalBridge!Aurora!915", weak: false, tags: ["passphrase", "strong"] },
    { value: "Correct-Horse-Battery-Staple", weak: false, tags: ["passphrase", "strong"] },
    { value: "GreenFalcon_Cipher_302", weak: false, tags: ["passphrase", "strong"] },
    { value: "OrbitDelta!Safe!551", weak: false, tags: ["passphrase", "strong"] },
    { value: "N7#hP4@kR2!x", weak: false, tags: ["random", "strong"] }
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
    const weakPool = passwordTrainingPool.filter(p => p.weak && p.tags.some(t => weakTags.includes(t)));
    const strongPool = passwordTrainingPool.filter(p => !p.weak && p.tags.some(t => strongTags.includes(t)));
    const weak = randomPick(weakPool, weakCount);
    const strong = randomPick(strongPool, total - weakCount);
    const mixed = randomPick([...weak, ...strong], total);
    return {
        options: mixed.map((p, i) => ({ id: i + 1, value: p.value, isWeak: p.weak })),
        weakAnswers: weak.map(p => p.value),
        correctWeakPasswords: weak.map(p => p.value),
        storyHint,
        failHints,
        securityInsight
    };
};

const validateWeakSelection = (selectedIds, session) => {
    const weakIds = session.options.filter(o => o.isWeak).map(o => o.id);
    const selectedSet = {};
    selectedIds.forEach(id => { selectedSet[id] = true; });
    const allWeakSelected = weakIds.every(id => !!selectedSet[id]);
    const noStrongSelected = selectedIds.every(id => {
        const item = session.options.find(o => o.id === id);
        return item && item.isWeak;
    });
    return allWeakSelected && noStrongSelected;
};

// Password Cracking Section (10 levels)
export const passwordMissions = [
    {
        id: 1,
        level: 1,
        title: "LEVEL 1: Human Password Psychology",
        desc: "Identify weak, human-generated credentials using behavioral and OSINT-driven reasoning.",
        difficulty: "Easy",
        type: "password",
        estimatedTime: "5-7 min",
        objective: "Detect predictable password choices before adversaries weaponize them.",
        scenario: "SOC analysts intercepted credential hygiene telemetry after a low-noise intrusion attempt. Your task is to classify vulnerable passwords based on behavioral patterns.",
        userTask: "Select all weak passwords from the presented set. Avoid selecting strong passwords.",
        simulationLogic: "Educational classification simulation only. No cracking algorithms or exploit behavior.",
        visualMode: "2D",
        successCondition: "Select all weak passwords and avoid selecting strong passwords from the randomized set.",
        successFeedback: "Credential vulnerability successfully identified. Human predictability confirmed.",
        failureFeedback: "Security oversight detected. Reassess behavioral patterns used in password creation.",
        objectives: [
            "Analyze a story-based investigative hint",
            "Identify weak passwords using human behavior patterns",
            "Classify credentials with high SOC decision accuracy"
        ],
        hintSystem: {
            hint1: "Investigation note: personal details often become passwords.",
            hint2: "Look for names, years, and very common words.",
            hint3: "Focus on patterns attackers can guess from social media."
        },
        puzzle: {
            interactionMode: "multiSelect",
            maxAttempts: 3,
            requiredSelection: "all_weak_only",
            revealAnswerOnFail: false,
            timeLimit: 180,
            visualProfile: "human-pattern",
            riskSystem: { start: 0, wrongAdd: 20, max: 100, label: "Risk Meter", breachMessage: "Breach simulation: too many wrong choices gave the attacker enough chances." },
            generateSession: function () {
                return makeTrainingSession(
                    ["name_year", "osint", "common"],
                    ["strong", "random", "passphrase"],
                    "During review, SOC saw passwords that looked like personal details and easy words. Attackers can guess these fast from public information.",
                    [
                        "Check for names, years, and simple words first.",
                        "If it looks personal or common, it is usually weak.",
                        "Strong passwords look less predictable and less personal."
                    ],
                    [
                        "Attackers use public information (OSINT) like names and dates to guess passwords.",
                        "Leaked password lists are powerful because many people reuse common passwords.",
                        "Human-made passwords are often predictable."
                    ]
                );
            },
            validateSelection: validateWeakSelection
        },
        aiSpeed: 0.75,
        rewards: {
            xp: 140,
            credits: 70
        },
        completed: false,
        locked: false, // First level unlocked by default
        bestScore: 0
    },
    {
        id: 2,
        level: 2,
        title: "LEVEL 2: Live Attack Detection",
        desc: "Watch live login attempts and make one fast decision to stop the attack.",
        difficulty: "Easy",
        type: "password",
        estimatedTime: "3-5 min",
        objective: "Identify the attack type before Vault Integrity reaches zero.",
        scenario: "You are on SOC duty. Login attempts are coming in every second. You must read the pattern and choose the right attack type quickly.",
        userTask: "Watch the login stream and pick the correct attack type.",
        simulationLogic: "Training simulation only. No real systems are accessed.",
        visualMode: "2D",
        successCondition: "Choose the correct attack type before the timer ends and before Vault Integrity reaches 0.",
        successFeedback: "Good decision. The attack pattern was correctly identified and blocked.",
        failureFeedback: "The wrong decision gave the attacker more time. Review the pattern and try again.",
        objectives: [
            "Read fast-changing login attempt logs",
            "Spot the pattern in simple word+number guesses",
            "Make one correct decision under time pressure"
        ],
        hintSystem: {
            hint1: "Look for many common words with small number changes.",
            hint2: "The attacker is trying likely passwords from a word list.",
            hint3: "This pattern is not random guessing across all combinations."
        },
        puzzle: {
            interactionMode: "singleChoice",
            maxAttempts: 1,
            revealAnswerOnFail: false,
            timeLimit: 55,
            timerLabel: "Attack Window",
            breachOnTimeout: true,
            vaultIntegrity: {
                start: 100,
                passiveDropPerSecond: 2,
                wrongChoicePenalty: 35,
                min: 0,
                label: "Vault Integrity",
                breachMessage: "Breach simulation: Vault Integrity reached 0."
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
                    "02:14:08 - Login attempt: default8"
                ]
            },
            choices: [
                { id: "brute_force", label: "Brute Force" },
                { id: "dictionary_attack", label: "Dictionary Attack" },
                { id: "credential_stuffing", label: "Credential Stuffing" },
                { id: "insider_access", label: "Insider Access" }
            ],
            correctChoice: "dictionary_attack",
            choiceFeedback: {
                correct: "Correct. This is a Dictionary Attack.",
                wrong: "Incorrect. These attempts match a Dictionary Attack pattern."
            },
            shockEvent: {
                trigger: "afterCorrect",
                delayMs: 1200,
                title: "Alert: Credentials reused from external breach detected.",
                message: "Attack blocked. But there is still danger. Even strong passwords are risky when reused. If one website is breached, attackers try the same password on other accounts."
            }
        },
        aiSpeed: 0.82,
        rewards: {
            xp: 150,
            credits: 75
        },
        completed: false,
        locked: true,
        bestScore: 0
    },
    {
        id: 3,
        level: 3,
        title: "LEVEL 3: Password Strength Race",
        desc: "Predict which password will break first, then watch a live speed race.",
        difficulty: "Easy",
        type: "password",
        estimatedTime: "6-8 min",
        objective: "Learn why some passwords fail fast and others last longer.",
        scenario: "Your SOC team runs a safe test. You must predict which password falls first in an automated attack.",
        userTask: "Look at the passwords and choose the one that will break first.",
        simulationLogic: "Training simulation only. No real cracking tools are used.",
        visualMode: "Hybrid",
        successCondition: "Make a prediction and review the break speed race.",
        successFeedback: "Good call. You predicted the weaker password.",
        failureFeedback: "Incorrect prediction. The weaker password broke first.",
        objectives: [
            "Compare password length and pattern",
            "Notice that common words break quickly",
            "Learn that symbols alone do not always make a password strong"
        ],
        hintSystem: {
            hint1: "Longer passwords are usually safer.",
            hint2: "Random passwords are harder to guess than common words.",
            hint3: "A short password with symbols can still be weak if it is predictable."
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
                    breakTimeSeconds: {
                        "welcome123": 6,
                        "BlueRiver!Train!Cloud!19": 7200
                    },
                    simpleExplanation: "welcome123 is common and easy to guess. The long passphrase is much harder because it is longer and less predictable."
                },
                {
                    id: "short-random-vs-long-predictable",
                    options: ["T7!kP9@vQ2", "companyname2024"],
                    correctAnswer: "companyname2024",
                    breakTimeSeconds: {
                        "T7!kP9@vQ2": 2400,
                        "companyname2024": 25
                    },
                    simpleExplanation: "Length helps, but predictable words and years are risky. Random characters are less predictable."
                },
                {
                    id: "shock-symbol-trap",
                    options: ["P@ssw0rd!", "Correct-Horse-Battery-Staple"],
                    correctAnswer: "P@ssw0rd!",
                    breakTimeSeconds: {
                        "P@ssw0rd!": 12,
                        "Correct-Horse-Battery-Staple": 14400
                    },
                    simpleExplanation: "P@ssw0rd! looks strong, but it follows a very common pattern. The long passphrase is stronger because it is much longer and less predictable."
                }
            ],
            generateSession: function () {
                const allCases = Array.isArray(this.cases) ? this.cases : [];
                const selected = allCases[Math.floor(Math.random() * allCases.length)];
                return {
                    caseId: selected.id,
                    options: selected.options.slice(),
                    correctAnswer: selected.correctAnswer,
                    breakTimeSeconds: { ...selected.breakTimeSeconds },
                    simpleExplanation: selected.simpleExplanation
                };
            },
            simulateBreakTime: function (password, session) {
                if (!session || !session.breakTimeSeconds) return 60;
                return session.breakTimeSeconds[password] || 60;
            },
            simulationUI: {
                bars: true,
                showEstimatedTimes: true,
                animateDurationMs: 4200,
                weakLabel: "Breaks first",
                strongLabel: "Holds longer"
            },
            shockEvent: {
                triggerCaseId: "shock-symbol-trap",
                title: "Surprise Result",
                message: "P@ssw0rd! broke first. It has symbols, but it is still predictable. Strong means hard to guess, not just special characters."
            }
        },
        aiSpeed: 0.95,
        rewards: {
            xp: 200,
            credits: 100
        },
        completed: false,
        locked: true,
        bestScore: 0
    },
    {
        id: 13,
        level: 4,
        title: "LEVEL 4: Data Breach Investigation Mode",
        desc: "Review breach evidence and find how the attacker got in.",
        difficulty: "Medium",
        type: "password",
        estimatedTime: "8-10 min",
        objective: "Use logs, profile clues, and policy gaps to identify the breach cause.",
        scenario: "A breach already happened. You are the SOC analyst investigating what went wrong.",
        userTask: "Review the evidence panels and choose the real cause of breach.",
        simulationLogic: "Investigation training simulation only. No real systems are accessed.",
        visualMode: "2D",
        successCondition: "Correctly identify the breach cause and the best prevention step.",
        successFeedback: "Investigation complete. Root cause and prevention were identified.",
        failureFeedback: "Investigation incomplete. Review the evidence and reasoning.",
        objectives: [
            "Read login timeline evidence",
            "Connect profile clues to password pattern risk",
            "Identify the policy weakness that allowed the breach"
        ],
        hintSystem: {
            hint1: "The same account is tried repeatedly in a short time.",
            hint2: "The profile has public info that matches a common password pattern.",
            hint3: "No lockout means the attacker can keep trying until one guess works."
        },
        puzzle: {
            interactionMode: "investigation",
            maxAttempts: 3,
            timeLimit: 0,
            noTimerPressure: true,
            evidenceLogs: [
                "02:12:58 - Failed login: admin",
                "02:13:00 - Failed login: admin",
                "02:13:03 - Successful login: admin"
            ],
            profileData: {
                name: "Rahim Hasan",
                publicInfo: "Graduation year: 2001",
                role: "System Administrator"
            },
            systemPolicy: {
                rateLimiting: "No rate limiting",
                accountLockout: "No account lockout",
                passwordRule: "Basic complexity only"
            },
            choices: [
                { id: "brute_force", label: "Brute Force" },
                { id: "dictionary_attack", label: "Dictionary Attack" },
                { id: "credential_reuse", label: "Credential Reuse" },
                { id: "insider_access", label: "Insider Access" }
            ],
            correctAnswer: "dictionary_attack",
            revealOnCorrect: {
                actualPassword: "rahim2001",
                message: "The attacker guessed a name + year pattern."
            },
            simpleExplanation: "Dictionary Attack means an automated system trying common words and patterns.",
            followUpDefenseQuestion: {
                prompt: "What would prevent this next time?",
                options: [
                    { id: "lockout_rule", label: "Add lockout rule" },
                    { id: "increase_font", label: "Increase font size" },
                    { id: "hide_login_button", label: "Hide login button" },
                    { id: "remove_usernames", label: "Remove usernames" }
                ],
                correctAnswer: "lockout_rule",
                explanation: "A lockout rule stops unlimited guesses after repeated failed attempts."
            },
            educationalSummary: "This breach happened because of two issues together: a predictable password and a weak system policy. Better passwords and lockout rules prevent this."
        },
        aiSpeed: 1.02,
        rewards: {
            xp: 230,
            credits: 120
        },
        completed: false,
        locked: true,
        bestScore: 0
    },
    {
        id: 14,
        level: 5,
        title: "LEVEL 5: Storage Audit - What Is Really Stored?",
        desc: "Inspect two systems and decide which one stores passwords more safely.",
        difficulty: "Medium",
        type: "password",
        estimatedTime: "8-11 min",
        objective: "Audit stored password data and identify the safer storage approach.",
        scenario: "Two login systems look similar from outside, but they store passwords differently inside.",
        userTask: "Inspect both systems, simulate a breach, then choose the safer system.",
        simulationLogic: "Audit simulation only. No real systems are accessed.",
        visualMode: "Hybrid",
        successCondition: "Choose the safer storage system after reviewing the evidence.",
        successFeedback: "Correct. You identified the safer storage model.",
        failureFeedback: "Not correct yet. Review what each system stores and try again.",
        objectives: [
            "Compare stored password records",
            "Understand readable vs scrambled storage",
            "Choose the safer system using evidence"
        ],
        hintSystem: {
            hint1: "If passwords are directly readable, attackers can use them instantly.",
            hint2: "A hash is a one-way scrambled version of the password.",
            hint3: "Safer storage still needs strong passwords."
        },
        puzzle: {
            interactionMode: "inspection",
            maxAttempts: 3,
            timeLimit: 0,
            noTimerPressure: true,
            systems: [
                {
                    id: "system_a",
                    name: "System A",
                    databasePreview: [
                        "admin | admin123",
                        "rahim | rahim2001"
                    ],
                    breachOutcome: "Data stolen. All passwords readable instantly."
                },
                {
                    id: "system_b",
                    name: "System B",
                    databasePreview: [
                        "admin | 5f4dcc3b5aa765d61d8327deb882cf99",
                        "rahim | 1a79a4d60de6718e8e5b326e338ae533"
                    ],
                    breachOutcome: "Data stolen. Passwords appear scrambled and not directly readable."
                }
            ],
            choices: [
                { id: "system_a", label: "System A" },
                { id: "system_b", label: "System B" }
            ],
            correctAnswer: "system_b",
            simpleExplanation: "Hashing means storing a one-way scrambled version of the password. Even if data is stolen, attackers cannot directly see the real password.",
            shockReveal: {
                title: "Important Warning",
                message: "If weak passwords are used, attackers can still guess them even if hashed. The hash of common passwords like password123 is easy to match."
            },
            educationalSummary: "Hashing helps protect stored passwords, but weak passwords are still risky. Safe storage and strong passwords should be used together."
        },
        aiSpeed: 1.08,
        rewards: {
            xp: 260,
            credits: 130
        },
        completed: false,
        locked: true,
        bestScore: 0
    },
    {
        id: 15,
        level: 6,
        title: "LEVEL 6: Why Adding Random Salt Helps",
        desc: "Learn why adding random salt makes storage safer.",
        difficulty: "Hard",
        type: "password",
        estimatedTime: "9-12 min",
        objective: "Understand why same passwords should not look identical in storage.",
        scenario: "Salt means adding random extra text before hashing. This helps stop easy matching of same passwords between users.",
        userTask: "Select passwords most dangerous when users reuse the same simple value.",
        simulationLogic: "Simple concept training with safe examples.",
        visualMode: "Hybrid",
        successCondition: "Identify high reuse risk correctly.",
        successFeedback: "Credential vulnerability successfully identified. Human predictability confirmed.",
        failureFeedback: "Security oversight detected. Reassess behavioral patterns used in password creation.",
        objectives: [
            "Understand salt in plain words",
            "Find reuse risk",
            "Improve defensive thinking"
        ],
        hintSystem: {
            hint1: "If many users choose the same weak password, risk grows quickly.",
            hint2: "Salt helps by making stored results different for each user.",
            hint3: "Select passwords most likely to be reused by many people."
        },
        puzzle: {
            interactionMode: "multiSelect",
            maxAttempts: 3,
            revealAnswerOnFail: false,
            timeLimit: 220,
            riskSystem: { start: 0, wrongAdd: 16, max: 100, label: "Reuse Risk", breachMessage: "Breach simulation: reused simple passwords created a chain failure." },
            generateSession: function () {
                return makeTrainingSession(
                    ["leaked", "common", "sequence"],
                    ["random", "strong"],
                    "Records showed many users picked similar weak values. Even with secure systems, this behavior creates large shared risk.",
                    [
                        "Look for values many people would choose together.",
                        "Common list passwords are high reuse targets.",
                        "Unique and unpredictable values lower shared risk."
                    ],
                    [
                        "Salt is random extra text that helps separate users even with similar passwords."
                    ]
                );
            },
            validateSelection: validateWeakSelection
        },
        aiSpeed: 1.14,
        rewards: {
            xp: 300,
            credits: 145
        },
        completed: false,
        locked: true,
        bestScore: 0
    },
    {
        id: 16,
        level: 7,
        title: "LEVEL 7: Live Defense Simulation - Protect the Vault",
        desc: "Defend the vault in real time by activating the right protections under pressure.",
        difficulty: "Hard",
        type: "password",
        estimatedTime: "9-12 min",
        objective: "Keep Vault Health above zero until the simulation ends.",
        scenario: "You are defending a live platform under active attack. Waves are incoming now. Deploy defenses quickly and manage energy carefully.",
        userTask: "Watch each incoming attack and trigger the best defense before the vault takes damage.",
        simulationLogic: "Real-time defensive response simulation with attack waves, cooldowns, and energy management.",
        visualMode: "2D",
        successCondition: "Vault Health stays above 0 after 60 seconds.",
        successFeedback: "Defense successful. The vault stayed protected under live pressure.",
        failureFeedback: "Vault breach occurred. Defense timing and coverage were not enough.",
        objectives: [
            "Respond to live attack waves",
            "Use energy and cooldowns wisely",
            "Maintain vault protection for the full simulation"
        ],
        hintSystem: {
            hint1: "Do not spend all energy at once. Save some for harder waves.",
            hint2: "One defense does not stop every attack type.",
            hint3: "Rotate defenses based on cooldown and incoming threat."
        },
        puzzle: {
            interactionMode: "liveDefenseSimulation",
            attackTypes: [
                {
                    type: "Brute Force",
                    damage: 10,
                    counteredBy: ["Rate Limiting", "Account Lockout"]
                },
                {
                    type: "Credential Stuffing",
                    damage: 20,
                    counteredBy: ["MFA", "Password Reuse Detection"]
                },
                {
                    type: "Offline Crack Attempt",
                    damage: 25,
                    counteredBy: ["Salting"]
                },
                {
                    type: "Phishing Wave",
                    damage: 15,
                    counteredBy: ["MFA", "Breach Monitoring"]
                }
            ],
            defenses: [
                {
                    name: "Rate Limiting",
                    energyCost: 20,
                    cooldown: 5,
                    protectsAgainst: ["Brute Force"]
                },
                {
                    name: "Account Lockout",
                    energyCost: 15,
                    cooldown: 6,
                    protectsAgainst: ["Brute Force"]
                },
                {
                    name: "Salting",
                    energyCost: 25,
                    cooldown: 8,
                    protectsAgainst: ["Offline Crack Attempt"]
                },
                {
                    name: "MFA",
                    energyCost: 35,
                    cooldown: 10,
                    protectsAgainst: ["Credential Stuffing", "Phishing Wave"]
                },
                {
                    name: "Password Reuse Detection",
                    energyCost: 30,
                    cooldown: 9,
                    protectsAgainst: ["Credential Stuffing"]
                },
                {
                    name: "Breach Monitoring",
                    energyCost: 25,
                    cooldown: 7,
                    protectsAgainst: ["Phishing Wave"]
                }
            ],
            simulationConfig: {
                vaultHealth: 100,
                playerEnergy: 100,
                energyRegenRate: {
                    amount: 5,
                    everySeconds: 3
                },
                attackSpawnRate: {
                    minSeconds: 2,
                    maxSeconds: 4
                },
                simulationDuration: 60
            },
            educationalSummary: "Security works best when multiple defenses protect the system. No single tool can stop every attack."
        },
        aiSpeed: 1.2,
        rewards: {
            xp: 340,
            credits: 165
        },
        completed: false,
        locked: true,
        bestScore: 0
    },
    {
        id: 17,
        level: 8,
        title: "LEVEL 8: Enterprise Threat Hunt - Silent Intrusion Analysis",
        desc: "Investigate enterprise logs, detect a quiet attacker path, and contain the breach before escalation.",
        difficulty: "Hard",
        type: "password",
        estimatedTime: "10-12 min",
        objective: "Detect and contain a silent intrusion by analyzing evidence and taking precise containment actions.",
        scenario: "An attacker has already gained initial access and is operating quietly inside the environment. No loud alerts were triggered.",
        userTask: "Review evidence panels, identify malicious steps, and apply the right containment actions while minimizing false positives.",
        simulationLogic: "Threat hunting simulation focused on investigation, attacker tracing, and controlled containment decisions.",
        visualMode: "2D",
        successCondition: "Contain at least 3 major malicious events, keep attacker escalation under control, and keep Vault Health above 30%.",
        successFeedback: "Threat hunting operation successful. Intrusion path contained before critical compromise.",
        failureFeedback: "Threat hunting operation failed. Intrusion escalation exceeded acceptable limits.",
        objectives: [
            "Analyze enterprise logs for subtle malicious behavior",
            "Confirm attacker movement across systems and accounts",
            "Contain the intrusion with low false-positive impact"
        ],
        hintSystem: {
            hint1: "Focus on behavior patterns across multiple logs, not isolated events.",
            hint2: "Not every anomaly is malicious. Validate context before containment.",
            hint3: "Repeated suspicious access and privilege changes often indicate attacker movement."
        },
        puzzle: {
            interactionMode: "threatHuntSimulation",
            baseStats: {
                vaultHealth: 100,
                systemIntegrity: 100,
                falsePositiveCount: 0,
                attackerProgress: 0
            },
            evidencePanels: [
                {
                    id: "login_activity",
                    title: "Login Activity Log",
                    entries: [
                        { id: "L-101", timestamp: "02:14:08", user: "r.khan", action: "Successful login", locationOrIP: "198.51.100.27 (new region)", status: "anomalous" },
                        { id: "L-102", timestamp: "08:31:12", user: "a.rahman", action: "Successful login", locationOrIP: "10.10.4.21 (HQ)", status: "normal" },
                        { id: "L-103", timestamp: "02:16:44", user: "r.khan", action: "Mailbox access", locationOrIP: "198.51.100.27", status: "anomalous" },
                        { id: "L-104", timestamp: "09:02:19", user: "svc.backup", action: "Scheduled service login", locationOrIP: "10.10.8.9", status: "normal" }
                    ]
                },
                {
                    id: "privilege_change",
                    title: "Privilege Change Log",
                    entries: [
                        { id: "P-201", timestamp: "02:21:03", user: "r.khan", action: "Role changed to Admin (no approval ticket)", locationOrIP: "IAM-Core", status: "anomalous" },
                        { id: "P-202", timestamp: "11:15:40", user: "it.ops", action: "Temporary admin granted (approved CR-7742)", locationOrIP: "IAM-Portal", status: "normal" },
                        { id: "P-203", timestamp: "02:23:55", user: "r.khan", action: "Policy edit attempt", locationOrIP: "IAM-Core", status: "anomalous" }
                    ]
                },
                {
                    id: "database_access",
                    title: "Database Access Log",
                    entries: [
                        { id: "D-301", timestamp: "02:33:11", user: "r.khan", action: "SELECT * FROM customer_master (45,000 rows)", locationOrIP: "DB-PRD-01", status: "anomalous" },
                        { id: "D-302", timestamp: "10:12:09", user: "data.analyst", action: "Daily KPI query (aggregate only)", locationOrIP: "DB-REP-02", status: "normal" },
                        { id: "D-303", timestamp: "02:36:28", user: "r.khan", action: "Export job started: customer_master_full.csv", locationOrIP: "DB-PRD-01", status: "anomalous" }
                    ]
                },
                {
                    id: "network_traffic",
                    title: "Network Traffic Log",
                    entries: [
                        { id: "N-401", timestamp: "02:39:07", user: "r.khan", action: "Outbound TLS session", locationOrIP: "203.0.113.52:443", status: "anomalous" },
                        { id: "N-402", timestamp: "02:40:14", user: "r.khan", action: "Outbound TLS session", locationOrIP: "203.0.113.52:443", status: "anomalous" },
                        { id: "N-403", timestamp: "02:41:26", user: "cdn.sync", action: "Vendor sync", locationOrIP: "192.0.2.18:443", status: "normal" }
                    ]
                },
                {
                    id: "account_activity",
                    title: "Account Activity Log",
                    entries: [
                        { id: "A-501", timestamp: "02:27:50", user: "r.khan", action: "Session token used to access account: m.sen", locationOrIP: "APP-AUTH-03", status: "anomalous" },
                        { id: "A-502", timestamp: "14:05:33", user: "hr.bot", action: "Bulk profile updates", locationOrIP: "APP-HR-01", status: "normal" },
                        { id: "A-503", timestamp: "02:29:02", user: "m.sen", action: "New API key generated", locationOrIP: "APP-AUTH-03", status: "anomalous" }
                    ]
                }
            ],
            hiddenAttackChain: [
                {
                    step: 1,
                    key: "phishing_login",
                    label: "Phishing-based login",
                    linkedEvidence: ["L-101", "L-103"],
                    explanation: "A routine-looking login at an unusual hour from an unfamiliar region."
                },
                {
                    step: 2,
                    key: "privilege_escalation",
                    label: "Privilege escalation",
                    linkedEvidence: ["P-201", "P-203"],
                    explanation: "Admin rights granted without normal approval."
                },
                {
                    step: 3,
                    key: "lateral_movement",
                    label: "Lateral movement",
                    linkedEvidence: ["A-501", "A-503"],
                    explanation: "The attacker moving between accounts inside the system."
                },
                {
                    step: 4,
                    key: "database_escalation",
                    label: "Database query escalation",
                    linkedEvidence: ["D-301", "D-303"],
                    explanation: "Large, unusual data queries and export behavior."
                },
                {
                    step: 5,
                    key: "data_exfiltration",
                    label: "Data exfiltration attempt",
                    linkedEvidence: ["N-401", "N-402"],
                    explanation: "Repeated outbound encrypted traffic to a suspicious external host."
                }
            ],
            playerActions: [
                { id: "mark_suspicious", label: "Mark as Suspicious" },
                { id: "investigate", label: "Investigate", revealsContext: true },
                { id: "isolate_account", label: "Isolate Account" },
                { id: "block_ip", label: "Block IP" },
                { id: "ignore", label: "Ignore" }
            ],
            progressionLogic: {
                attackerProgressRules: {
                    missedMaliciousEventIncrease: 1,
                    correctMajorDetectionDecrease: 1,
                    criticalThreshold: 5,
                    maxEscalation: 7,
                    rapidVaultDrainOnCritical: 12
                },
                falsePositiveRules: {
                    incorrectFlagIncrease: 1,
                    systemIntegrityDropPerFalsePositive: 8,
                    systemIntegrityDropOnWrongContainment: 10
                },
                containmentEffects: {
                    isolateAccountStops: ["phishing_login", "privilege_escalation", "lateral_movement"],
                    blockIPStops: ["data_exfiltration"],
                    investigateReveals: "linked evidence, sequence relationship, and confidence note",
                    ignoreOnMalicious: "attacker advances to next step"
                },
                operationalFeedback: {
                    privilegeAlert: "Suspicious privilege escalation detected.",
                    exportAlert: "Unauthorized data export attempt identified.",
                    falseAlert: "False alert logged. Operational efficiency reduced.",
                    lateralMove: "Attacker lateral movement confirmed.",
                    criticalEscalation: "Warning: attacker progression has reached critical escalation level."
                },
                passiveRisk: {
                    enabledWhenUndetected: true,
                    vaultHealthDropPerCycle: 4,
                    cycleTurns: 2
                },
                noRealTimeWavePressure: true
            },
            winCondition: {
                majorMaliciousEventsContainedMin: 3,
                attackerProgressBelowCritical: true,
                vaultHealthAbovePercent: 30
            },
            failCondition: {
                any: [
                    { metric: "vaultHealth", operator: "<=", value: 0 },
                    { metric: "systemIntegrity", operator: "<", value: 40 },
                    { metric: "attackerProgress", operator: ">=", value: 7 }
                ]
            },
            educationalSummary: {
                reveal: "Initial access originated from a single phishing login that appeared routine.",
                message: "Modern cyber intrusions often begin with small, unnoticed events. Early detection prevents escalation into full data compromise."
            }
        },
        aiSpeed: 1.27,
        rewards: {
            xp: 380,
            credits: 185
        },
        completed: false,
        locked: true,
        bestScore: 0
    },
    {
        id: 18,
        level: 9,
        title: "LEVEL 9: Zero-Day Crisis - Live Patch Engineering Lab",
        desc: "Identify a live zero-day chain, patch vulnerable modules, re-test exploits, and secure the platform end-to-end.",
        difficulty: "Pro",
        type: "password",
        estimatedTime: "11-14 min",
        objective: "Detect and remediate layered vulnerabilities through live engineering decisions and exploit re-testing.",
        scenario: "A zero-day exploit path is actively targeting your authentication stack. Primary and secondary flaws may both exist.",
        userTask: "Inspect architecture modules, apply patches, deploy fixes, and run exploit simulation until risk is fully neutralized.",
        simulationLogic: "Interactive patch lab with modular remediation, exploit replay, and metric tradeoff analysis.",
        visualMode: "2D",
        successCondition: "Reduce exploitSuccessRate to 0% while keeping system stability metrics within safe thresholds.",
        successFeedback: "Remediation successful. Exploit chain fully blocked and system performance stabilized.",
        failureFeedback: "Remediation failed. Exploit pressure or operational instability exceeded safe limits.",
        objectives: [
            "Detect primary vulnerability in auth flow",
            "Patch logic modules and validate with exploit replay",
            "Discover and fix secondary access path",
            "Reach full exploit containment with balanced metrics"
        ],
        hintSystem: {
            hint1: "Fixing the first issue may not remove all exploit paths.",
            hint2: "Patch impact can improve security but may affect load and user experience.",
            hint3: "Use exploit simulation after each patch to verify real outcomes."
        },
        puzzle: {
            interactionMode: "livePatchSimulation",
            architectureModules: [
                {
                    id: "login_request",
                    name: "Login Request",
                    editable: false,
                    flowOrder: 1,
                    state: "active",
                    notes: "Entry point for credential authentication"
                },
                {
                    id: "input_validation",
                    name: "Input Validation",
                    editable: true,
                    flowOrder: 2,
                    state: "basic_validation",
                    notes: "Sanitization and request checks"
                },
                {
                    id: "password_comparison",
                    name: "Password Comparison",
                    editable: true,
                    flowOrder: 3,
                    state: "timing_sensitive_compare",
                    notes: "Comparison logic currently leaks timing patterns"
                },
                {
                    id: "session_token_generation",
                    name: "Session Token Generation",
                    editable: true,
                    flowOrder: 4,
                    state: "token_reuse_enabled",
                    notes: "Session token regeneration currently disabled"
                },
                {
                    id: "access_granted",
                    name: "Access Granted",
                    editable: false,
                    flowOrder: 5,
                    state: "active",
                    notes: "Final auth decision output"
                },
                {
                    id: "api_gateway",
                    name: "API Secondary Endpoint",
                    editable: true,
                    flowOrder: 6,
                    state: "static_token_exposed",
                    notes: "Secondary endpoint uses static API token"
                }
            ],
            vulnerabilities: [
                {
                    id: "vuln_timing_compare",
                    name: "Timing-based Password Comparison Weakness",
                    moduleId: "password_comparison",
                    severity: "high",
                    status: "open",
                    hiddenUntil: "start"
                },
                {
                    id: "vuln_session_reuse",
                    name: "Session Token Reuse",
                    moduleId: "session_token_generation",
                    severity: "high",
                    status: "open",
                    hiddenUntil: "start"
                },
                {
                    id: "vuln_missing_rate_limit",
                    name: "Missing Rate Limiting",
                    moduleId: "input_validation",
                    severity: "medium",
                    status: "open",
                    hiddenUntil: "start"
                },
                {
                    id: "vuln_static_api_token",
                    name: "Static API Token in Secondary Endpoint",
                    moduleId: "api_gateway",
                    severity: "critical",
                    status: "hidden",
                    hiddenUntil: "after_primary_patch"
                }
            ],
            systemMetrics: {
                vaultHealth: 100,
                exploitSuccessRate: 62,
                serverLoad: 46,
                userExperienceScore: 82,
                vulnerabilityCountRemaining: 4
            },
            patchOptions: [
                {
                    id: "patch_validation_logic",
                    action: "Modify validation logic",
                    appliesTo: ["input_validation"],
                    effects: {
                        exploitSuccessRateDelta: -8,
                        serverLoadDelta: 4,
                        userExperienceScoreDelta: -2,
                        closesVulnerabilities: []
                    }
                },
                {
                    id: "patch_constant_time_compare",
                    action: "Enable constant-time comparison",
                    appliesTo: ["password_comparison"],
                    effects: {
                        exploitSuccessRateDelta: -22,
                        serverLoadDelta: 3,
                        userExperienceScoreDelta: -1,
                        closesVulnerabilities: ["vuln_timing_compare"]
                    }
                },
                {
                    id: "patch_rate_limit",
                    action: "Add rate limiting",
                    appliesTo: ["input_validation"],
                    effects: {
                        exploitSuccessRateDelta: -14,
                        serverLoadDelta: 6,
                        userExperienceScoreDelta: -5,
                        closesVulnerabilities: ["vuln_missing_rate_limit"]
                    }
                },
                {
                    id: "patch_regen_session_tokens",
                    action: "Regenerate session tokens",
                    appliesTo: ["session_token_generation"],
                    effects: {
                        exploitSuccessRateDelta: -18,
                        serverLoadDelta: 2,
                        userExperienceScoreDelta: 0,
                        closesVulnerabilities: ["vuln_session_reuse"]
                    }
                },
                {
                    id: "patch_rotate_api_keys",
                    action: "Rotate API keys",
                    appliesTo: ["api_gateway"],
                    effects: {
                        exploitSuccessRateDelta: -10,
                        serverLoadDelta: 1,
                        userExperienceScoreDelta: 0,
                        closesVulnerabilities: []
                    }
                },
                {
                    id: "patch_secure_endpoint",
                    action: "Secure endpoint",
                    appliesTo: ["api_gateway"],
                    effects: {
                        exploitSuccessRateDelta: -25,
                        serverLoadDelta: 3,
                        userExperienceScoreDelta: -2,
                        closesVulnerabilities: ["vuln_static_api_token"]
                    }
                },
                {
                    id: "patch_deploy",
                    action: "Deploy patch",
                    appliesTo: ["input_validation", "password_comparison", "session_token_generation", "api_gateway"],
                    effects: {
                        exploitSuccessRateDelta: 0,
                        serverLoadDelta: 0,
                        userExperienceScoreDelta: 0,
                        closesVulnerabilities: []
                    }
                },
                {
                    id: "patch_simulate_exploit",
                    action: "Run exploit simulation",
                    appliesTo: ["all"],
                    effects: {
                        exploitSuccessRateDelta: 0,
                        serverLoadDelta: 0,
                        userExperienceScoreDelta: 0,
                        closesVulnerabilities: []
                    },
                    uiLabel: "🔴 Simulate Exploit"
                }
            ],
            exploitSimulationLogic: {
                simulationButtonLabel: "🔴 Simulate Exploit",
                onSimulate: {
                    ifUnpatched: {
                        vaultHealthDrop: 12,
                        message: "Exploit succeeded. Active vulnerability chain confirmed."
                    },
                    ifPartiallyPatched: {
                        vaultHealthDrop: 6,
                        exploitSuccessRateAdjustment: -8,
                        message: "Exploit partially successful. Residual weakness still exploitable."
                    },
                    ifFullyPatched: {
                        vaultHealthDrop: 0,
                        exploitSuccessRateSet: 0,
                        message: "Exploit blocked. No active path detected."
                    }
                },
                delayedEscalation: {
                    enabled: true,
                    trigger: "no_patch_action_interval",
                    turnsWithoutPatchThreshold: 2,
                    exploitSuccessRateIncreasePerTrigger: 5,
                    vaultHealthDropPerTrigger: 3,
                    message: "Threat pressure rising due to delayed remediation."
                },
                secondaryReveal: {
                    trigger: "after_primary_patch",
                    revealMessage: "Secondary access path detected.",
                    revealVulnerabilityId: "vuln_static_api_token",
                    requiredFollowUp: ["patch_rotate_api_keys", "patch_secure_endpoint"]
                },
                metricGuards: {
                    exploitSuccessRateMin: 0,
                    exploitSuccessRateMax: 100,
                    serverLoadMin: 0,
                    serverLoadMax: 100,
                    userExperienceScoreMin: 0,
                    userExperienceScoreMax: 100,
                    vaultHealthMin: 0,
                    vaultHealthMax: 100
                }
            },
            winCondition: {
                all: [
                    { metric: "exploitSuccessRate", operator: "==", value: 0 },
                    { metric: "vaultHealth", operator: ">", value: 40 },
                    { metric: "serverLoad", operator: "<", value: 85 },
                    { metric: "userExperienceScore", operator: ">", value: 40 }
                ]
            },
            failCondition: {
                any: [
                    { metric: "vaultHealth", operator: "<=", value: 0 },
                    { metric: "exploitSuccessRate", operator: ">", value: 80 },
                    { metric: "serverLoad", operator: ">", value: 95 }
                ]
            },
            educationalSummary: "Zero-day vulnerabilities often contain multiple layers. Fixing one weakness may not stop an attacker completely. Effective remediation requires testing, validation, and layered defense."
        },
        aiSpeed: 1.36,
        rewards: {
            xp: 430,
            credits: 210
        },
        completed: false,
        locked: true,
        bestScore: 0
    },
    {
        id: 19,
        level: 10,
        title: "LEVEL 10: Enterprise Security Architect - Final Certification Assessment",
        desc: "Final mastery simulation: design enterprise authentication architecture and earn your certification rating.",
        difficulty: "Pro",
        type: "password",
        estimatedTime: "12-16 min",
        objective: "Build a layered enterprise security architecture and validate it against controlled attack evaluations.",
        scenario: "You are leading final enterprise security design review. Your architecture will be tested across multiple attack paths and operational constraints.",
        userTask: "Configure all security control panels, run certification evaluation, and review your final architecture rating.",
        simulationLogic: "Three-phase certification simulation: architecture design, controlled attack evaluation, and professional scoring feedback.",
        visualMode: "Hybrid",
        successCondition: "Assessment always completes. Final rating reflects architecture quality.",
        successFeedback: "Certification assessment completed. Final enterprise security rating generated.",
        failureFeedback: "Assessment completed with major security gaps. Review recommendations and improve architecture.",
        objectives: [
            "Design full authentication security architecture",
            "Mitigate simulated enterprise attack scenarios",
            "Balance security, usability, and operational stability",
            "Earn professional certification rating"
        ],
        hintSystem: {
            hint1: "Layered controls perform better than single-control designs.",
            hint2: "Strong security choices can affect user experience and operations.",
            hint3: "Use monitoring and response controls to improve early detection."
        },
        puzzle: {
            interactionMode: "enterpriseArchitectureSimulation",
            configurationOptions: {
                passwordPolicy: {
                    title: "Password Policy",
                    options: [
                        {
                            id: "minimum_length",
                            label: "Minimum Length",
                            values: ["8", "12", "16"]
                        },
                        {
                            id: "allow_passphrases",
                            label: "Allow Passphrases",
                            values: ["yes", "no"]
                        },
                        {
                            id: "require_complexity",
                            label: "Require Complexity Rules",
                            values: ["yes", "no"]
                        },
                        {
                            id: "block_common_passwords",
                            label: "Block Common Password List",
                            values: ["yes", "no"]
                        }
                    ]
                },
                passwordStorage: {
                    title: "Password Storage",
                    options: [
                        { id: "plaintext", label: "Plain Text", securityLevel: "unsafe" },
                        { id: "hash_only", label: "Hash Only", securityLevel: "basic" },
                        { id: "hash_salt", label: "Hash + Salt", securityLevel: "recommended" },
                        { id: "hash_salt_iteration", label: "Hash + Salt + Iteration Cost", securityLevel: "best" }
                    ]
                },
                authenticationControls: {
                    title: "Authentication Controls",
                    options: [
                        { id: "no_mfa", label: "No MFA" },
                        { id: "sms_mfa", label: "SMS-based MFA" },
                        { id: "app_mfa", label: "Authenticator App MFA" },
                        { id: "hardware_key_mfa", label: "Hardware Security Key MFA" }
                    ]
                },
                loginProtection: {
                    title: "Login Protection",
                    options: [
                        { id: "no_login_protection", label: "No Rate Limiting" },
                        { id: "rate_limiting", label: "Rate Limiting" },
                        { id: "account_lockout", label: "Account Lockout" },
                        { id: "captcha", label: "CAPTCHA" },
                        { id: "adaptive_risk_login", label: "Adaptive Risk-based Login" }
                    ]
                },
                monitoringResponse: {
                    title: "Monitoring & Response",
                    options: [
                        { id: "no_monitoring", label: "No Monitoring" },
                        { id: "basic_logging", label: "Basic Logging" },
                        { id: "breach_alerts", label: "Breach Alert System" },
                        { id: "realtime_anomaly", label: "Real-time Anomaly Detection" }
                    ]
                }
            },
            evaluationEngine: {
                phases: [
                    {
                        id: "phase_1_design",
                        name: "System Design",
                        description: "Configure enterprise authentication architecture controls."
                    },
                    {
                        id: "phase_2_attack_eval",
                        name: "Controlled Attack Evaluation",
                        description: "Run structured attack simulations against selected controls."
                    },
                    {
                        id: "phase_3_metrics",
                        name: "Performance Metrics",
                        description: "Generate architecture scores and certification rating."
                    }
                ],
                attackCount: 5,
                resultLabels: ["Blocked", "Partially Mitigated", "Successful"]
            },
            attackSimulationMatrix: [
                {
                    attackId: "brute_force_test",
                    attackName: "Brute Force Test",
                    strongCounters: ["rate_limiting", "account_lockout", "adaptive_risk_login", "captcha"],
                    partialCounters: ["basic_logging"],
                    impactedBy: ["minimum_length", "block_common_passwords"]
                },
                {
                    attackId: "credential_stuffing_test",
                    attackName: "Credential Stuffing Test",
                    strongCounters: ["app_mfa", "hardware_key_mfa", "adaptive_risk_login", "breach_alerts"],
                    partialCounters: ["sms_mfa", "rate_limiting"],
                    impactedBy: ["block_common_passwords"]
                },
                {
                    attackId: "offline_database_theft_test",
                    attackName: "Offline Database Theft Test",
                    strongCounters: ["hash_salt_iteration", "hash_salt"],
                    partialCounters: ["hash_only"],
                    impactedBy: ["minimum_length", "allow_passphrases"]
                },
                {
                    attackId: "phishing_attempt_test",
                    attackName: "Phishing Attempt",
                    strongCounters: ["hardware_key_mfa", "app_mfa", "realtime_anomaly", "breach_alerts"],
                    partialCounters: ["sms_mfa", "basic_logging"],
                    impactedBy: ["require_complexity"]
                },
                {
                    attackId: "insider_privilege_misuse_test",
                    attackName: "Insider Privilege Misuse Test",
                    strongCounters: ["realtime_anomaly", "adaptive_risk_login", "breach_alerts"],
                    partialCounters: ["basic_logging"],
                    impactedBy: ["monitoringResponse"]
                }
            ],
            scoringAlgorithm: {
                weightedCategories: {
                    vaultSecurityScore: {
                        weight: 0.3,
                        basedOn: ["attack_outcomes", "storage_strength", "login_protection"]
                    },
                    breachResistanceScore: {
                        weight: 0.25,
                        basedOn: ["attack_outcomes", "mfa_strength", "password_policy"]
                    },
                    userExperienceScore: {
                        weight: 0.15,
                        basedOn: ["policy_friction", "mfa_usability", "login_flow"]
                    },
                    operationalStabilityScore: {
                        weight: 0.15,
                        basedOn: ["monitoring_overhead", "control_complexity", "response_consistency"]
                    },
                    incidentResponseMaturity: {
                        weight: 0.15,
                        basedOn: ["monitoring_response_stack", "detection_speed", "alert_quality"]
                    }
                },
                attackOutcomePoints: {
                    blocked: 100,
                    partially_mitigated: 65,
                    successful: 25
                },
                finalScoreRange: {
                    min: 0,
                    max: 100
                },
                ratingRules: [
                    { rating: "A+", minScore: 92 },
                    { rating: "A", minScore: 80 },
                    { rating: "B", minScore: 65 },
                    { rating: "C", minScore: 0 }
                ]
            },
            ratingBands: {
                "A+": "Exceptional Security Architect",
                "A": "Strong Defensive Design",
                "B": "Good but with Gaps",
                "C": "Needs Improvement"
            },
            feedbackGenerator: {
                summaryTemplate: "You successfully mitigated [mitigatedCount] of [totalThreats] simulated threats.",
                strongestAreaTemplate: "Strongest area: [strongestArea].",
                weakestAreaTemplate: "Weakest area: [weakestArea].",
                recommendationTemplate: "Recommended improvement: [recommendation].",
                professionalExample: "Your architecture performed strongly against offline attacks due to proper salting and iteration cost. However, lack of adaptive login monitoring reduced early detection capability.",
                humilityMessage: "No system is completely immune to risk. Continuous monitoring and user education remain critical."
            },
            certificationBadgeLogic: {
                badgeName: "Certified Security Architect",
                unlockCondition: {
                    minimumRating: "A",
                    minimumScore: 80
                },
                lockedMessage: "Certification not granted. Improve architecture and re-run assessment."
            }
        },
        aiSpeed: 1.45,
        rewards: {
            xp: 520,
            credits: 260
        },
        completed: false,
        locked: true,
        bestScore: 0
    }
];

// Malware Detection Section (2 levels)
export const malwareMissions = [
    {
        id: 8,
        level: 1,
        title: "LEVEL 1: System Scan",
        desc: "Identify infected files in a compromised system",
        difficulty: "easy",
        type: "malware",
        estimatedTime: "8-12 min",
        objectives: [
            "Scan file system",
            "Identify infected files",
            "Minimize false positives"
        ],
        puzzle: {
            totalFiles: 15,
            infectedFiles: 4,
            timeLimit: 180
        },
        aiSpeed: 0.9,
        rewards: {
            xp: 200,
            credits: 100
        },
        completed: false,
        locked: false, // First level unlocked by default
        bestScore: 0
    },
    {
        id: 11,
        level: 2,
        title: "LEVEL 2: Outbreak Response",
        desc: "Contain malware outbreak with precision",
        difficulty: "hard",
        type: "malware",
        estimatedTime: "12-15 min",
        objectives: [
            "Rapid system scan",
            "Identify all threats",
            "Zero false positives"
        ],
        puzzle: {
            totalFiles: 20,
            infectedFiles: 6,
            timeLimit: 240
        },
        aiSpeed: 1.2,
        rewards: {
            xp: 400,
            credits: 200
        },
        completed: false,
        locked: true,
        bestScore: 0
    }
];

// Network & Phishing Section (7 levels)
export const networkMissions = [
    {
        id: 4,
        level: 1,
        title: "LEVEL 1: Port Scanner",
        desc: "Navigate through network ports to reach the core",
        difficulty: "easy",
        type: "firewall",
        estimatedTime: "5-8 min",
        objectives: [
            "Map the network topology",
            "Find path to target server",
            "Bypass security nodes"
        ],
        puzzle: {
            gridSize: 5,
            blockedNodes: [6, 11, 13, 18],
            startNode: 0,
            endNode: 24,
            maxMoves: 30
        },
        aiSpeed: 0.8,
        rewards: {
            xp: 150,
            credits: 75
        },
        completed: false,
        locked: false, // First level unlocked by default
        bestScore: 0
    },
    {
        id: 5,
        level: 2,
        title: "LEVEL 2: Network Infiltration",
        desc: "Navigate complex network with multiple firewalls",
        difficulty: "medium",
        type: "firewall",
        estimatedTime: "8-12 min",
        objectives: [
            "Analyze network structure",
            "Identify optimal route",
            "Minimize detection risk"
        ],
        puzzle: {
            gridSize: 6,
            blockedNodes: [7, 12, 13, 19, 20, 24, 26, 31],
            startNode: 0,
            endNode: 35,
            maxMoves: 40
        },
        aiSpeed: 1.0,
        rewards: {
            xp: 200,
            credits: 100
        },
        completed: false,
        locked: true,
        bestScore: 0
    },
    {
        id: 6,
        level: 3,
        title: "LEVEL 3: Fortress Network",
        desc: "Break through heavily fortified network defenses",
        difficulty: "hard",
        type: "firewall",
        estimatedTime: "10-15 min",
        objectives: [
            "Navigate complex firewall maze",
            "Find efficient path",
            "Avoid security clusters"
        ],
        puzzle: {
            gridSize: 7,
            blockedNodes: [8, 9, 10, 15, 17, 22, 23, 24, 29, 31, 36, 37, 38, 43, 45],
            startNode: 0,
            endNode: 48,
            maxMoves: 50
        },
        aiSpeed: 1.2,
        rewards: {
            xp: 300,
            credits: 150
        },
        completed: false,
        locked: true,
        bestScore: 0
    },
    {
        id: 7,
        level: 4,
        title: "LEVEL 4: Router Navigation",
        desc: "Navigate through interconnected network nodes",
        difficulty: "medium",
        type: "network",
        estimatedTime: "6-10 min",
        objectives: [
            "Analyze network topology",
            "Find efficient route",
            "Reach target server"
        ],
        puzzle: {
            nodeCount: 8,
            startNode: 0,
            endNode: 7,
            maxHops: 10
        },
        aiSpeed: 1.0,
        rewards: {
            xp: 200,
            credits: 100
        },
        completed: false,
        locked: true,
        bestScore: 0
    },
    {
        id: 9,
        level: 5,
        title: "LEVEL 5: Email Analysis",
        desc: "Identify phishing attempts in suspicious emails",
        difficulty: "easy",
        type: "phishing",
        estimatedTime: "5-8 min",
        objectives: [
            "Review suspicious email",
            "Identify red flags",
            "Submit accurate analysis"
        ],
        puzzle: {
            correctIndicators: [0, 1, 2, 3, 5],
            minCorrect: 3
        },
        aiSpeed: 0.9,
        rewards: {
            xp: 180,
            credits: 90
        },
        completed: false,
        locked: true,
        bestScore: 0
    },
    {
        id: 10,
        level: 6,
        title: "LEVEL 6: Complex Network",
        desc: "Navigate large-scale network infrastructure",
        difficulty: "hard",
        type: "network",
        estimatedTime: "10-15 min",
        objectives: [
            "Map complex network",
            "Optimize route selection",
            "Minimize hop count"
        ],
        puzzle: {
            nodeCount: 12,
            startNode: 0,
            endNode: 11,
            maxHops: 12
        },
        aiSpeed: 1.3,
        rewards: {
            xp: 350,
            credits: 175
        },
        completed: false,
        locked: true,
        bestScore: 0
    },
    {
        id: 12,
        level: 7,
        title: "LEVEL 7: Spear Phishing",
        desc: "Analyze sophisticated targeted phishing attack",
        difficulty: "hard",
        type: "phishing",
        estimatedTime: "8-12 min",
        objectives: [
            "Analyze complex phishing attempt",
            "Identify subtle indicators",
            "High accuracy required"
        ],
        puzzle: {
            correctIndicators: [0, 1, 2, 3, 4, 6],
            minCorrect: 5
        },
        aiSpeed: 1.1,
        rewards: {
            xp: 380,
            credits: 190
        },
        completed: false,
        locked: true,
        bestScore: 0
    }
];

// Combined missions array for backward compatibility
export const missions = [...passwordMissions, ...malwareMissions, ...networkMissions];

/**
 * Get missions for a specific section
 */
export function getMissionsBySection(section) {
    switch (section) {
        case 'password':
            return passwordMissions;
        case 'malware':
            return malwareMissions;
        case 'network':
            return networkMissions;
        default:
            return [];
    }
}

/**
 * Get mission by ID from any section
 */
export function getMissionById(id) {
    return missions.find(m => m.id === id);
}

/**
 * Get missions by difficulty
 */
export function getMissionsByDifficulty(difficulty) {
    const normalized = String(difficulty || '').toLowerCase();
    return missions.filter(m => String(m.difficulty || '').toLowerCase() === normalized);
}

/**
 * Get missions by type
 */
export function getMissionsByType(type) {
    return missions.filter(m => m.type === type);
}

/**
 * Get unlocked missions for a section
 */
export function getUnlockedMissionsForSection(section) {
    const sectionMissions = getMissionsBySection(section);
    return sectionMissions.filter(m => !m.locked);
}

/**
 * Get completed missions for a section
 */
export function getCompletedMissionsForSection(section) {
    const sectionMissions = getMissionsBySection(section);
    return sectionMissions.filter(m => m.completed);
}

/**
 * Get next available mission in a section
 */
export function getNextMissionInSection(section) {
    const sectionMissions = getMissionsBySection(section);
    return sectionMissions.find(m => !m.locked && !m.completed);
}

/**
 * Unlock next level in a section after completing current level
 */
export function unlockNextLevelInSection(section, completedLevel) {
    const sectionMissions = getMissionsBySection(section);
    const nextMission = sectionMissions.find(m => m.level === completedLevel + 1);
    
    if (nextMission && nextMission.locked) {
        nextMission.locked = false;
        console.log(`🔓 Unlocked ${section} Level ${nextMission.level}: ${nextMission.title}`);
        return true;
    }
    
    return false;
}
