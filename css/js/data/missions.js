/**
 * Mission definitions database - Independent Sections
 */

// Password Cracking Section (3 levels)
export const passwordMissions = [
    {
        id: 1,
        level: 1,
        title: "LEVEL 1: Basic Access",
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
        aiSpeed: 0.7,
        rewards: {
            xp: 100,
            credits: 50
        },
        completed: false,
        locked: false, // First level unlocked by default
        bestScore: 0
    },
    {
        id: 2,
        level: 2,
        title: "LEVEL 2: Alpha Protocol",
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
        level: 3,
        title: "LEVEL 3: Digital Keys",
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
        aiSpeed: 1.0,
        rewards: {
            xp: 200,
            credits: 100
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
    return missions.filter(m => m.difficulty === difficulty);
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