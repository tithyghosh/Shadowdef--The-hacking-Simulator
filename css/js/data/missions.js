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
        title: "LEVEL 5: What Is Hashing?",
        desc: "Learn hashing in simple words.",
        difficulty: "Medium",
        type: "password",
        estimatedTime: "8-11 min",
        objective: "Understand safer storage choices.",
        scenario: "One system keeps passwords as normal readable text. Another uses hashing, which means passwords are stored as scrambled text.",
        userTask: "Select choices that show unsafe password handling risk.",
        simulationLogic: "Simple storage-safety training.",
        visualMode: "Hybrid",
        successCondition: "Find plain-text risk patterns correctly.",
        successFeedback: "Credential vulnerability successfully identified. Human predictability confirmed.",
        failureFeedback: "Security oversight detected. Reassess behavioral patterns used in password creation.",
        objectives: [
            "Understand plain text vs hashing",
            "Find risky patterns",
            "Decide quickly"
        ],
        hintSystem: {
            hint1: "Readable password storage is dangerous.",
            hint2: "Hashing means storing a scrambled result instead of the original password.",
            hint3: "Pick choices easiest to abuse if data is stolen."
        },
        puzzle: {
            interactionMode: "multiSelect",
            maxAttempts: 3,
            revealAnswerOnFail: false,
            timeLimit: 220,
            riskSystem: { start: 0, wrongAdd: 16, max: 100, label: "Storage Risk", breachMessage: "Shock moment: system looked safe, but plain-text storage exposed everything instantly." },
            generateSession: function () {
                return makeTrainingSession(
                    ["common", "name_year", "company_number"],
                    ["strong", "passphrase"],
                    "Audit found a hidden issue: one service looked secure on screen, but passwords were saved as normal text.",
                    [
                        "Readable and predictable passwords are the highest danger.",
                        "If data leaks, plain text gives instant access.",
                        "Scrambled storage and strong choices reduce damage."
                    ],
                    [
                        "Hashing means the stored value is scrambled, not directly readable."
                    ],
                    8,
                    5
                );
            },
            validateSelection: validateWeakSelection
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
        title: "LEVEL 7: Blocking Too Many Login Attempts",
        desc: "Learn why limiting repeated tries protects accounts.",
        difficulty: "Hard",
        type: "password",
        estimatedTime: "9-12 min",
        objective: "Recognize passwords that fail when systems do not limit attempts.",
        scenario: "A portal had no lockout rule. Attackers kept trying simple guesses until one worked.",
        userTask: "Pick passwords that are most dangerous without login limits.",
        simulationLogic: "Defense policy awareness training.",
        visualMode: "2D",
        successCondition: "Classify high-guessability credentials.",
        successFeedback: "Credential vulnerability successfully identified. Human predictability confirmed.",
        failureFeedback: "Security oversight detected. Reassess behavioral patterns used in password creation.",
        objectives: [
            "Understand lockout value",
            "Identify easy-guess targets",
            "Keep risk under control"
        ],
        hintSystem: {
            hint1: "Without attempt limits, simple passwords are easy targets.",
            hint2: "Attackers test common lists first, then patterns.",
            hint3: "Pick options guessed quickly in many tries."
        },
        puzzle: {
            interactionMode: "multiSelect",
            maxAttempts: 3,
            revealAnswerOnFail: false,
            timeLimit: 230,
            riskSystem: { start: 0, wrongAdd: 17, max: 100, label: "Login Defense Risk", breachMessage: "Breach simulation: no lockout + weak passwords led to account compromise." },
            generateSession: function () {
                return makeTrainingSession(
                    ["common", "leaked", "keyboard", "sequence"],
                    ["strong", "random"],
                    "Monitoring showed repeated login attempts over time. Weak patterns finally gave the attacker access.",
                    [
                        "Easy guesses become dangerous when attempts are unlimited.",
                        "Common and patterned passwords are first targets.",
                        "Strong unpredictable values resist repeated guessing."
                    ],
                    [
                        "Rate limiting means slowing or blocking too many login tries."
                    ]
                );
            },
            validateSelection: validateWeakSelection
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
        title: "LEVEL 8: Password Reuse Shock",
        desc: "Shock lesson: strong-looking passwords still fail if reused.",
        difficulty: "Hard",
        type: "password",
        estimatedTime: "10-12 min",
        objective: "Spot risky reuse behavior, even when password looks complex.",
        scenario: "An employee used one strong-looking password on multiple sites. A small forum breach exposed it, then attackers used it on company login.",
        userTask: "Select passwords most dangerous in reuse scenarios.",
        simulationLogic: "Safe reuse-risk simulation.",
        visualMode: "Hybrid",
        successCondition: "Identify reuse-prone risky choices.",
        successFeedback: "Credential vulnerability successfully identified. Human predictability confirmed.",
        failureFeedback: "Security oversight detected. Reassess behavioral patterns used in password creation.",
        objectives: [
            "Understand reuse shock",
            "Classify cross-site risk",
            "Apply new thinking"
        ],
        hintSystem: {
            hint1: "A password can look strong but still be risky if reused.",
            hint2: "One breach on another site can expose that same password.",
            hint3: "Pick options people are likely to use in many places."
        },
        puzzle: {
            interactionMode: "multiSelect",
            maxAttempts: 3,
            revealAnswerOnFail: false,
            timeLimit: 230,
            riskSystem: { start: 0, wrongAdd: 18, max: 100, label: "Cross-Site Risk", breachMessage: "Shock moment: strong-looking password was reused, so one outside breach opened internal access." },
            generateSession: function () {
                return makeTrainingSession(
                    ["common", "company_number", "name_year"],
                    ["random", "passphrase"],
                    "Security team found a surprise: the password looked strong, but reuse made it easy to abuse after an external leak.",
                    [
                        "Do not trust strength alone without uniqueness.",
                        "Reused passwords create cross-site breach chains.",
                        "Guessable personal and company patterns are often reused."
                    ],
                    [
                        "Unique password per site is critical, even for strong-looking values."
                    ],
                    8,
                    5
                );
            },
            validateSelection: validateWeakSelection
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
        title: "LEVEL 9: Insider or Delayed Breach",
        desc: "Find hidden weak choices before a silent breach grows.",
        difficulty: "Pro",
        type: "password",
        estimatedTime: "11-14 min",
        objective: "Detect passwords that allow delayed compromise.",
        scenario: "Logs looked normal at first. Days later, quiet login abuse was traced to old weak credential habits.",
        userTask: "Select passwords that could enable silent long-term risk.",
        simulationLogic: "Silent-risk awareness simulation.",
        visualMode: "3D",
        successCondition: "Correctly identify delayed-breach risk credentials.",
        successFeedback: "Credential vulnerability successfully identified. Human predictability confirmed.",
        failureFeedback: "Security oversight detected. Reassess behavioral patterns used in password creation.",
        objectives: [
            "Read incident pattern",
            "Pick stealth-risk credentials",
            "Protect long-term access"
        ],
        hintSystem: {
            hint1: "Some breaches do not happen immediately.",
            hint2: "Weak, reused, and guessable passwords can stay exposed for a long time.",
            hint3: "Pick options attackers can keep trying quietly over time."
        },
        puzzle: {
            interactionMode: "multiSelect",
            maxAttempts: 3,
            revealAnswerOnFail: false,
            timeLimit: 240,
            riskSystem: { start: 0, wrongAdd: 18, max: 100, label: "Silent Breach Risk", breachMessage: "Breach simulation: delayed compromise succeeded because weak patterns stayed in use." },
            generateSession: function () {
                return makeTrainingSession(
                    ["leaked", "name_year", "sequence", "keyboard"],
                    ["random", "strong"],
                    "This incident stayed hidden for days because weak credentials kept giving attackers quiet retry opportunities.",
                    [
                        "Silent breaches often start with old weak password habits.",
                        "Patterned and leaked-list passwords are easy to revisit quietly.",
                        "Long-term safety needs both strong and unique choices."
                    ],
                    [
                        "Attackers may wait and retry over time instead of rushing."
                    ]
                );
            },
            validateSelection: validateWeakSelection
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
        title: "LEVEL 10: Build a Secure System",
        desc: "Final review: apply everything and build safer password policy.",
        difficulty: "Pro",
        type: "password",
        estimatedTime: "12-16 min",
        objective: "Use all lessons to make strong, practical security choices.",
        scenario: "You are security lead now. Choose rules that reduce human mistakes and lower breach risk.",
        userTask: "Select risky credentials correctly, then complete final review for a rating.",
        simulationLogic: "Final training review. Educational only.",
        visualMode: "Hybrid",
        successCondition: "Finish classification with low risk and complete final policy checks.",
        successFeedback: "Credential vulnerability successfully identified. Human predictability confirmed.",
        failureFeedback: "Security oversight detected. Reassess behavioral patterns used in password creation.",
        objectives: [
            "Use all previous lessons",
            "Keep risk low",
            "Earn final rating"
        ],
        hintSystem: {
            hint1: "Strong security is many good choices working together.",
            hint2: "Block common patterns, avoid reuse, use safe storage, and limit login attempts.",
            hint3: "Choose what reduces guessability, reuse damage, and silent risk together."
        },
        puzzle: {
            interactionMode: "multiSelect",
            maxAttempts: 3,
            revealAnswerOnFail: false,
            finalReview: true,
            timeLimit: 260,
            riskSystem: { start: 0, wrongAdd: 20, max: 100, label: "Enterprise Risk", breachMessage: "Final breach simulation: weak policy choices left clear paths for account abuse." },
            ratingBands: {
                "A+": "Excellent: very low risk choices and strong understanding.",
                "A": "Strong: good decisions with small gaps.",
                "B": "Fair: some risky patterns still accepted.",
                "C": "Needs work: too many weak-risk decisions."
            },
            performanceSummaryTemplate: "You spotted [correct]/[total] weak risks. Your final security rating is [rating]. Main improvement area: [focus].",
            generateSession: function () {
                return makeTrainingSession(
                    ["name_year", "company_number", "leaked", "keyboard", "sequence"],
                    ["random", "passphrase", "strong"],
                    "Final audit combines all lessons: predictability, reuse, storage safety, and login protection.",
                    [
                        "Check for personal clues, common lists, and easy patterns first.",
                        "Think about reuse damage and long-term silent risk.",
                        "Best choices are unique, long, and hard to predict."
                    ],
                    [
                        "Good password policy reduces both quick attacks and slow hidden attacks."
                    ]
                );
            },
            validateSelection: validateWeakSelection
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
