/**
 * Mission definitions database
 */

export const missions = [
    {
        id: 1,
        title: "INITIATION: Basic Access",
        desc: "Crack a simple 4-character password using pattern recognition",
        difficulty: "easy",
        type: "password",
        estimatedTime: "3-5 min",
        objectives: [
            "Analyze the intelligence hints",
            "Enter the correct password",
            "Beat the AI opponent"
        ],
        puzzle: {
            password: "HACK",
            hints: [
                "All characters are letters",
                "First letter is 'H'",
                "Common tech term"
            ]
        },
        aiSpeed: 0.7, // 70% speed (easier)
        rewards: {
            xp: 100,
            credits: 50
        },
        completed: false,
        locked: false,
        bestScore: 0
    },
    {
        id: 2,
        title: "DECRYPTION: Alpha Protocol",
        desc: "Decode encrypted message with advanced patterns",
        difficulty: "easy",
        type: "password",
        estimatedTime: "5-7 min",
        objectives: [
            "Analyze encryption pattern",
            "Decode the message",
            "Submit solution quickly"
        ],
        puzzle: {
            password: "CODE",
            hints: [
                "Related to programming",
                "4 letters",
                "Starts with 'C'"
            ]
        },
        aiSpeed: 0.8,
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
        title: "AUTHENTICATION: Digital Keys",
        desc: "Crack a complex password using multiple clues",
        difficulty: "medium",
        type: "password",
        estimatedTime: "7-10 min",
        objectives: [
            "Analyze multiple intelligence sources",
            "Identify the pattern",
            "Access secure system"
        ],
        puzzle: {
            password: "CYBER",
            hints: [
                "Related to digital security",
                "5 letters",
                "Common prefix in tech"
            ]
        },
        aiSpeed: 1.0, // Normal speed
        rewards: {
            xp: 200,
            credits: 100
        },
        completed: false,
        locked: true,
        bestScore: 0
    },
    {
        id: 4,
        title: "FIREWALL: Port Scanner",
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
        locked: true,
        bestScore: 0
    },
    {
        id: 5,
        title: "BREACH: Network Infiltration",
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
        title: "ADVANCED: Fortress Network",
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
        title: "SOCIAL: Phishing Analysis",
        desc: "Identify phishing attempts in email messages",
        difficulty: "hard",
        type: "phishing",
        estimatedTime: "10-12 min",
        objectives: [
            "Review suspicious email",
            "Identify phishing indicators",
            "Report accurate findings"
        ],
        puzzle: {
            emails: 1,
            indicators: 6,
            correctIndicators: 4
        },
        aiSpeed: 1.3,
        rewards: {
            xp: 450,
            credits: 225
        },
        completed: false,
        locked: true,
        bestScore: 0
    },
    {
        id: 8,
        title: "ADVANCED: Multi-Layer Defense",
        desc: "Combine multiple techniques to breach security",
        difficulty: "hard",
        type: "mixed",
        estimatedTime: "20-25 min",
        objectives: [
            "Crack authentication",
            "Navigate network",
            "Evade detection systems"
        ],
        puzzle: {
            stages: 3,
            types: ["password", "firewall", "malware"]
        },
        aiSpeed: 1.5,
        rewards: {
            xp: 600,
            credits: 300
        },
        completed: false,
        locked: true,
        bestScore: 0
    }
];

/**
 * Get mission by ID
 */
export function getMissionById(id) {
    return missions.find(m => m.id === id);
}

/**
 * Get missions by difficulty
 */
export function getMissionsByDifficulty(difficulty) {
    return missions.filter(m => m.difficulty === difficulty);
}

/**
 * Get missions by type
 */
export function getMissionsByType(type) {
    return missions.filter(m => m.type === type);
}

/**
 * Get unlocked missions
 */
export function getUnlockedMissions() {
    return missions.filter(m => !m.locked);
}

/**
 * Get completed missions
 */
export function getCompletedMissions() {
    return missions.filter(m => m.completed);
}

/**
 * Get next available mission
 */
export function getNextMission() {
    return missions.find(m => !m.locked && !m.completed);
}