/**
 * Password Training System - Cybersecurity Education
 * 10-Level Interactive Password Security Training
 * Educational and ethical use only - no real hacking code
 */

export class PasswordTrainingSystem {
    constructor(gameContainer) {
        this.container = gameContainer;
        this.currentLevelNum = 1;
        this.gameProgress = {
            unlockedLevels: [1],
            completedLevels: [],
            scores: {}
        };
        
        // Level state variables
        this.levelStates = {
            classification: { answers: {}, completed: false },
            dictionary_attack: { passwordTested: false, survived: false, completed: false },
            brute_force: { targetMet: false, completed: false },
            character_complexity: { typesUsed: 0, completed: false },
            hashing_basics: { demonstrated: false, completed: false },
            hash_cracking: { observed: false, completed: false },
            salting: { understood: false, completed: false },
            rate_limiting: { configured: false, completed: false },
            attack_scenario: { defensesSelected: [], completed: false },
            secure_design: { componentsConfigured: {}, completed: false }
        };
        
        this.initializeLevels();
        this.loadProgress();
    }

    initializeLevels() {
        this.levels = {
            1: {
                title: "Password Awareness",
                topic: "Identify Weak vs Strong Passwords",
                description: "Learn why short and common passwords fail. Identify weak vs strong passwords.",
                objective: "Classify passwords as weak or strong - achieve 70% accuracy to pass",
                type: "classification",
                data: {
                    passwords: [
                        { text: "123456", correct: "weak", reason: "Sequential numbers - easily guessed by attackers" },
                        { text: "P@ssw0rd2024!", correct: "strong", reason: "Long with mixed characters, numbers, and symbols" },
                        { text: "password", correct: "weak", reason: "Common dictionary word - vulnerable to dictionary attacks" },
                        { text: "qwerty", correct: "weak", reason: "Keyboard pattern - predictable sequence" },
                        { text: "Tr0ub4dor&3", correct: "strong", reason: "Good length with character variety and symbols" },
                        { text: "admin", correct: "weak", reason: "Too short and extremely common - high attack risk" },
                        { text: "iloveyou", correct: "weak", reason: "Common phrase - appears in password breach databases" },
                        { text: "Mj#9kL$2pQ", correct: "strong", reason: "Random characters with high entropy" }
                    ]
                }
            },
            2: {
                title: "Common Password Lists",
                topic: "Dictionary-Based Password Guessing",
                description: "Simulate dictionary-based password guessing. Understand why reused passwords are dangerous.",
                objective: "Test passwords against a simulated dictionary attack database - use a password that survives",
                type: "dictionary_attack",
                data: {
                    commonPasswords: [
                        "password", "123456", "123456789", "qwerty", "abc123", 
                        "password123", "admin", "letmein", "welcome", "monkey",
                        "dragon", "master", "shadow", "football", "baseball",
                        "12345678", "1234567", "sunshine", "princess", "welcome",
                        "login", "admin123", "root", "pass", "1234"
                    ],
                    explanation: "Dictionary attacks use lists of common passwords from data breaches"
                }
            },
            3: {
                title: "Brute Force Simulation",
                topic: "Visual Simulation of Brute Force Attack Speed",
                description: "Visual simulation of brute force attack speed. Compare short vs long passwords.",
                objective: "Create a password that takes over 1000 years to crack with brute force",
                type: "brute_force",
                data: {
                    targetYears: 1000,
                    attackSpeeds: [
                        { name: "Basic (1M/sec)", speed: 1000000, description: "Simple desktop computer" },
                        { name: "Advanced (1B/sec)", speed: 1000000000, description: "High-end GPU cluster" },
                        { name: "Supercomputer (1T/sec)", speed: 1000000000000, description: "Theoretical maximum" }
                    ],
                    explanation: "Brute force attacks try every possible combination systematically"
                }
            },
            4: {
                title: "Password Complexity",
                topic: "Uppercase, Numbers, and Symbols",
                description: "Analyze how uppercase, numbers, and symbols affect security. Learn password entropy concepts.",
                objective: "Build a password using all 4 character types for maximum security",
                type: "character_complexity",
                data: {
                    charTypes: [
                        { name: "lowercase", label: "Lowercase (a-z)", count: 26, example: "abc" },
                        { name: "uppercase", label: "Uppercase (A-Z)", count: 26, example: "ABC" },
                        { name: "numbers", label: "Numbers (0-9)", count: 10, example: "123" },
                        { name: "symbols", label: "Symbols (!@#$)", count: 33, example: "!@#" }
                    ],
                    targetTypes: 4
                }
            },
            5: {
                title: "Hashing Basics",
                topic: "Password Hashing (Visual Explanation)",
                description: "Introduce password hashing (visual explanation). Show why plain-text storage is insecure.",
                objective: "Understand how passwords should be stored securely by systems",
                type: "hashing_basics",
                data: {
                    storageMethods: [
                        { 
                            name: "Plain Text", 
                            security: "None", 
                            color: "#ff006e",
                            description: "Password stored as-is - extremely dangerous",
                            vulnerability: "Immediate exposure in data breaches",
                            example: "password123 → password123"
                        },
                        { 
                            name: "MD5 Hash", 
                            security: "Weak", 
                            color: "#fbbf24",
                            description: "Basic hashing - vulnerable to rainbow tables",
                            vulnerability: "Fast computation allows brute force attacks",
                            example: "password123 → 482c811da5d5b4bc6d497ffa98491e38"
                        },
                        { 
                            name: "SHA-256", 
                            security: "Better", 
                            color: "#60a5fa",
                            description: "Stronger hashing but still vulnerable without salt",
                            vulnerability: "Rainbow table attacks still possible",
                            example: "password123 → ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f"
                        },
                        { 
                            name: "bcrypt + Salt", 
                            security: "Strong", 
                            color: "#00ff41",
                            description: "Proper password hashing with unique salt",
                            vulnerability: "Resistant to most attack methods",
                            example: "password123 + salt → $2a$10$N9qo8uLOickgx2ZMRZoMye..."
                        }
                    ],
                    explanation: "Hashing converts passwords into fixed-length strings that cannot be reversed"
                }
            },
            6: {
                title: "Hash Cracking Simulation",
                topic: "Demonstrate How Weak Hashes Can Be Cracked",
                description: "Demonstrate how weak hashes can be cracked. Compare weak hash vs strong hash.",
                objective: "Observe hash cracking attempts and understand hash strength differences",
                type: "hash_cracking",
                data: {
                    hashes: [
                        {
                            password: "password123",
                            hashType: "MD5",
                            hash: "482c811da5d5b4bc6d497ffa98491e38",
                            strength: "weak",
                            crackTime: 0.5,
                            description: "MD5 hash - cracked quickly"
                        },
                        {
                            password: "password123",
                            hashType: "SHA-256",
                            hash: "ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f",
                            strength: "moderate",
                            crackTime: 120,
                            description: "SHA-256 hash - takes longer but still vulnerable"
                        },
                        {
                            password: "password123",
                            hashType: "bcrypt",
                            hash: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy",
                            strength: "strong",
                            crackTime: 999999,
                            description: "bcrypt hash - extremely resistant to cracking"
                        }
                    ],
                    explanation: "Weak hashes can be cracked quickly, strong hashes resist attacks"
                }
            },
            7: {
                title: "Salting Passwords",
                topic: "Learn How Salting Protects Hashes",
                description: "Learn how salting protects hashes. Simulate failed cracking attempts on salted passwords.",
                objective: "Understand how salting prevents rainbow table attacks",
                type: "salting",
                data: {
                    examples: [
                        {
                            password: "password123",
                            salt: "randomSalt1",
                            hash: "salted_hash_1",
                            description: "Same password with different salt produces different hash"
                        },
                        {
                            password: "password123",
                            salt: "randomSalt2",
                            hash: "salted_hash_2",
                            description: "Salt prevents rainbow table attacks"
                        }
                    ],
                    explanation: "Salting adds random data to each password before hashing, making rainbow tables useless"
                }
            },
            8: {
                title: "Rate Limiting & Lockout",
                topic: "Implement Login Attempt Limits",
                description: "Implement login attempt limits. Observe how defenses stop brute force attacks.",
                objective: "Configure rate limiting and account lockout policies",
                type: "rate_limiting",
                data: {
                    scenarios: [
                        {
                            name: "No Protection",
                            maxAttempts: 999999,
                            lockoutTime: 0,
                            description: "Unlimited attempts - vulnerable to brute force"
                        },
                        {
                            name: "Basic Rate Limiting",
                            maxAttempts: 5,
                            lockoutTime: 300,
                            description: "5 attempts then 5 minute lockout"
                        },
                        {
                            name: "Advanced Protection",
                            maxAttempts: 3,
                            lockoutTime: 900,
                            description: "3 attempts then 15 minute lockout"
                        }
                    ],
                    explanation: "Rate limiting and lockouts prevent automated brute force attacks"
                }
            },
            9: {
                title: "Real-World Attack Scenario",
                topic: "Simulate a System Under Attack",
                description: "Simulate a system under attack. Analyze logs and choose the correct defense.",
                objective: "Analyze attack logs and implement appropriate defenses",
                type: "attack_scenario",
                data: {
                    logs: [
                        { time: "10:23:15", ip: "192.168.1.100", action: "Failed login", username: "admin", status: "suspicious" },
                        { time: "10:23:18", ip: "192.168.1.100", action: "Failed login", username: "admin", status: "suspicious" },
                        { time: "10:23:21", ip: "192.168.1.100", action: "Failed login", username: "admin", status: "suspicious" },
                        { time: "10:23:24", ip: "192.168.1.100", action: "Failed login", username: "admin", status: "suspicious" },
                        { time: "10:23:27", ip: "192.168.1.100", action: "Failed login", username: "admin", status: "suspicious" },
                        { time: "10:23:30", ip: "192.168.1.100", action: "Account locked", username: "admin", status: "blocked" }
                    ],
                    defenses: [
                        { name: "Enable Rate Limiting", correct: true, description: "Limit login attempts per IP" },
                        { name: "Disable Account Lockout", correct: false, description: "Would allow unlimited attempts" },
                        { name: "Block IP Address", correct: true, description: "Immediate protection against this attacker" },
                        { name: "Increase Password Complexity", correct: false, description: "Doesn't help against brute force" }
                    ],
                    explanation: "Real-world attacks require multiple defense layers"
                }
            },
            10: {
                title: "Secure System Design",
                topic: "Design a Secure Password Policy",
                description: "Design a secure password policy. Combine strong passwords, hashing, salting, and protections. Final evaluation as a cyber security professional.",
                objective: "Design a complete secure password system with all protections",
                type: "secure_design",
                data: {
                    components: [
                        {
                            name: "Password Policy",
                            options: [
                                { name: "Minimum 12 characters", required: true },
                                { name: "Require uppercase, lowercase, numbers, symbols", required: true },
                                { name: "No dictionary words", required: true },
                                { name: "Password expiration every 90 days", required: false }
                            ]
                        },
                        {
                            name: "Password Storage",
                            options: [
                                { name: "Use bcrypt with salt", required: true },
                                { name: "Store plain text passwords", required: false },
                                { name: "Use MD5 hashing", required: false },
                                { name: "Unique salt per password", required: true }
                            ]
                        },
                        {
                            name: "Attack Protection",
                            options: [
                                { name: "Rate limiting (5 attempts)", required: true },
                                { name: "Account lockout after failures", required: true },
                                { name: "IP blocking for suspicious activity", required: true },
                                { name: "No protection needed", required: false }
                            ]
                        }
                    ],
                    explanation: "A secure system combines multiple defense layers"
                }
            }
        };
    }

    loadProgress() {
        const saved = localStorage.getItem('passwordSecurityProgress');
        if (saved) {
            try {
                this.gameProgress = JSON.parse(saved);
            } catch (e) {
                console.warn('Failed to load progress, starting fresh');
                this.gameProgress = { unlockedLevels: [1], completedLevels: [], scores: {} };
            }
        }
    }

    saveProgress() {
        localStorage.setItem('passwordSecurityProgress', JSON.stringify(this.gameProgress));
    }
    startGame(level = 1) {
        this.currentLevelNum = level;
        this.createGameInterface();
        this.renderLevelSelection();
    }

    createGameInterface() {
        this.container.innerHTML = `
            <div class="password-security-wrapper">
                <!-- Level Selection Screen -->
                <div class="level-selection" id="levelSelection">
                    <div class="security-header">
                        <h2 class="main-title">🔐 PASSWORD CRACKING TRAINING SYSTEM</h2>
                        <p class="subtitle">Cybersecurity Training Environment - Cyber Security Trainee Portal</p>
                        <div class="progress-overview">
                            <span id="overallProgress">Level 1 of 10</span>
                        </div>
                        <div style="margin-top: 10px; color: #9ca3af; font-size: 0.9rem;">
                            <strong>Role:</strong> Cyber Security Trainee | <strong>System:</strong> Virtual Training Environment
                        </div>
                    </div>
                    <div class="levels-grid" id="levelsGrid">
                        <!-- Levels will be populated by JavaScript -->
                    </div>
                </div>

                <!-- Game Screen -->
                <div class="game-screen" id="gameScreen" style="display: none;">
                    <!-- Level Header -->
                    <div class="level-header">
                        <div class="level-info">
                            <div class="current-level" id="currentLevel">Level 1</div>
                            <div class="level-topic" id="levelTopic">Password Basics</div>
                            <div class="progress-container">
                                <div class="progress-bar">
                                    <div class="progress-fill" id="progressFill"></div>
                                </div>
                                <span class="progress-text" id="progressText">0%</span>
                            </div>
                        </div>
                        <div class="level-objective" id="levelObjective">
                            Learn to identify weak vs strong passwords
                        </div>
                    </div>

                    <!-- Game Content -->
                    <div class="game-content" id="gameContent">
                        <!-- Level content will be loaded here -->
                    </div>

                    <!-- Game Controls -->
                    <div class="game-controls">
                        <button class="btn btn-secondary" onclick="passwordTraining.backToLevels()">
                            ← Back to Levels
                        </button>
                        <div class="control-buttons">
                            <button class="btn btn-primary" id="checkBtn" onclick="passwordTraining.checkLevel()" style="display: none;">
                                Check Answer
                            </button>
                            <button class="btn btn-success" id="continueBtn" onclick="passwordTraining.nextLevel()" style="display: none;">
                                Continue →
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        window.passwordTraining = this;
        this.addStyles();
    }
    addStyles() {
        if (document.getElementById('password-security-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'password-security-styles';
        style.textContent = `
            .password-security-wrapper {
                width: 100%;
                height: 100%;
                min-height: 600px;
                background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%);
                color: #00ff41;
                font-family: 'Courier New', monospace;
                position: relative;
                overflow-y: auto;
            }

            .security-header {
                text-align: center;
                padding: 30px 20px;
                background: rgba(0, 0, 0, 0.8);
                border-bottom: 2px solid #00ff41;
                margin-bottom: 30px;
                backdrop-filter: blur(10px);
            }

            .main-title {
                font-size: 2.5rem;
                color: #00f3ff;
                text-shadow: 0 0 20px rgba(0, 243, 255, 0.5);
                margin-bottom: 10px;
                animation: glow 2s ease-in-out infinite alternate;
            }

            @keyframes glow {
                from { text-shadow: 0 0 20px rgba(0, 243, 255, 0.5); }
                to { text-shadow: 0 0 30px rgba(0, 243, 255, 0.8); }
            }

            .subtitle {
                color: #9ca3af;
                font-size: 1.1rem;
                margin-bottom: 15px;
            }

            .progress-overview {
                color: #00ff41;
                font-size: 1rem;
                font-weight: bold;
            }

            .level-selection {
                padding: 20px;
            }

            .levels-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
                gap: 25px;
                max-width: 1400px;
                margin: 0 auto;
            }

            .level-card {
                background: rgba(0, 0, 0, 0.7);
                border: 2px solid #374151;
                border-radius: 15px;
                padding: 25px;
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
                backdrop-filter: blur(10px);
                overflow: hidden;
            }

            .level-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(0, 255, 65, 0.1), transparent);
                transition: left 0.5s;
            }

            .level-card.unlocked {
                border-color: #00ff41;
                cursor: pointer;
            }

            .level-card.unlocked:hover {
                border-color: #00f3ff;
                transform: translateY(-5px);
                box-shadow: 0 15px 40px rgba(0, 255, 65, 0.3);
            }

            .level-card.unlocked:hover::before {
                left: 100%;
            }

            .level-card.locked {
                opacity: 0.5;
                cursor: not-allowed;
            }

            .level-card.completed {
                border-color: #00ff41;
                background: rgba(0, 255, 65, 0.1);
            }

            .level-number {
                font-size: 1.8rem;
                font-weight: bold;
                color: #00f3ff;
                margin-bottom: 10px;
            }

            .level-title {
                font-size: 1.3rem;
                color: #e0e6ed;
                margin-bottom: 8px;
                font-weight: bold;
            }

            .level-topic {
                font-size: 1rem;
                color: #fbbf24;
                margin-bottom: 12px;
                font-style: italic;
            }

            .level-description {
                color: #9ca3af;
                font-size: 0.9rem;
                line-height: 1.5;
                margin-bottom: 20px;
            }

            .level-status {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-top: 15px;
                padding-top: 15px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
            }

            .status-text {
                font-size: 0.9rem;
                font-weight: bold;
            }

            .status-icon {
                font-size: 1.5rem;
            }

            .lock-icon { color: #ff006e; }
            .play-icon { color: #00f3ff; }
            .completed-icon { color: #00ff41; }

            /* Game Screen Styles */
            .game-screen {
                display: flex;
                flex-direction: column;
                height: 100%;
            }

            .level-header {
                background: rgba(0, 0, 0, 0.8);
                border-bottom: 2px solid #00f3ff;
                padding: 20px;
                margin-bottom: 20px;
            }

            .level-info {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
            }

            .current-level {
                font-size: 1.5rem;
                color: #00f3ff;
                font-weight: bold;
            }

            .level-topic {
                font-size: 1rem;
                color: #fbbf24;
                margin-left: 15px;
            }

            .progress-container {
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .progress-bar {
                width: 200px;
                height: 8px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 4px;
                overflow: hidden;
            }

            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #00ff41, #00f3ff);
                width: 0%;
                transition: width 0.5s ease;
            }

            .progress-text {
                color: #9ca3af;
                font-size: 0.9rem;
                min-width: 40px;
            }

            .level-objective {
                color: #9ca3af;
                font-style: italic;
            }

            .game-content {
                flex: 1;
                padding: 20px;
                overflow-y: auto;
            }

            .game-controls {
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: rgba(0, 0, 0, 0.8);
                border-top: 2px solid #374151;
                padding: 20px;
            }

            .control-buttons {
                display: flex;
                gap: 15px;
            }

            .btn {
                padding: 12px 24px;
                border: 2px solid;
                background: transparent;
                border-radius: 8px;
                cursor: pointer;
                font-weight: bold;
                transition: all 0.3s ease;
                font-family: inherit;
                text-transform: uppercase;
                font-size: 0.9rem;
            }

            .btn-primary {
                border-color: #00f3ff;
                color: #00f3ff;
            }

            .btn-primary:hover {
                background: #00f3ff;
                color: #0a0e27;
                box-shadow: 0 0 20px rgba(0, 243, 255, 0.5);
            }

            .btn-success {
                border-color: #00ff41;
                color: #00ff41;
            }

            .btn-success:hover {
                background: #00ff41;
                color: #0a0e27;
                box-shadow: 0 0 20px rgba(0, 255, 65, 0.5);
            }

            .btn-secondary {
                border-color: #9ca3af;
                color: #9ca3af;
            }

            .btn-secondary:hover {
                background: #9ca3af;
                color: #0a0e27;
            }

            .btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }

            /* Level Content Styles */
            .level-content {
                max-width: 1200px;
                margin: 0 auto;
            }

            .instruction-panel {
                background: rgba(0, 0, 0, 0.6);
                border: 2px solid #00f3ff;
                border-radius: 12px;
                padding: 25px;
                margin-bottom: 30px;
            }

            .instruction-panel h3 {
                color: #00f3ff;
                margin-bottom: 15px;
                font-size: 1.4rem;
            }

            .instruction-panel p {
                color: #e0e6ed;
                line-height: 1.6;
                margin-bottom: 15px;
            }

            .security-tips {
                background: rgba(0, 255, 65, 0.1);
                border: 1px solid #00ff41;
                border-radius: 8px;
                padding: 15px;
                margin-top: 15px;
            }

            .security-tips h4 {
                color: #00ff41;
                margin-bottom: 10px;
            }

            .security-tips ul {
                color: #9ca3af;
                padding-left: 20px;
            }

            .security-tips li {
                margin-bottom: 5px;
            }

            /* Password Classification Styles */
            .password-analysis-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 20px;
                margin: 30px 0;
            }

            .password-analysis-card {
                background: rgba(0, 0, 0, 0.6);
                border: 2px solid #374151;
                border-radius: 12px;
                padding: 20px;
                transition: all 0.3s ease;
            }

            .password-display {
                background: rgba(0, 0, 0, 0.8);
                border-radius: 8px;
                padding: 15px;
                margin-bottom: 15px;
                text-align: center;
            }

            .password-text {
                font-size: 1.3rem;
                color: #e0e6ed;
                font-weight: bold;
                letter-spacing: 2px;
            }

            .analysis-tools {
                margin-top: 10px;
                font-size: 0.9rem;
                color: #9ca3af;
            }

            .classification-buttons {
                display: flex;
                gap: 10px;
                justify-content: center;
                margin-bottom: 15px;
            }

            .classify-btn {
                padding: 10px 20px;
                border: 2px solid;
                background: transparent;
                border-radius: 6px;
                cursor: pointer;
                font-weight: bold;
                transition: all 0.3s ease;
                font-size: 0.9rem;
            }

            .weak-btn {
                border-color: #ff006e;
                color: #ff006e;
            }

            .weak-btn:hover:not(:disabled) {
                background: #ff006e;
                color: #0a0e27;
            }

            .strong-btn {
                border-color: #00ff41;
                color: #00ff41;
            }

            .strong-btn:hover:not(:disabled) {
                background: #00ff41;
                color: #0a0e27;
            }

            .feedback-area {
                min-height: 60px;
            }

            .feedback {
                display: flex;
                align-items: flex-start;
                gap: 10px;
                padding: 10px;
                border-radius: 6px;
                font-size: 0.9rem;
            }

            .feedback.correct {
                background: rgba(0, 255, 65, 0.1);
                border: 1px solid #00ff41;
            }

            .feedback.incorrect {
                background: rgba(255, 0, 110, 0.1);
                border: 1px solid #ff006e;
            }

            .feedback-icon {
                font-size: 1.2rem;
                flex-shrink: 0;
            }

            .feedback-text {
                line-height: 1.4;
            }

            .score-panel {
                background: rgba(0, 0, 0, 0.6);
                border: 2px solid #00f3ff;
                border-radius: 12px;
                padding: 20px;
                text-align: center;
            }

            .score-display {
                font-size: 1.2rem;
                margin-bottom: 10px;
            }

            .score-label {
                color: #9ca3af;
            }

            .score-value {
                color: #00f3ff;
                font-weight: bold;
                margin: 0 10px;
            }

            .score-percentage {
                color: #fbbf24;
            }

            .pass-requirement {
                color: #9ca3af;
                font-size: 0.9rem;
            }

            /* Length Demo Styles */
            .length-demo-container {
                background: rgba(0, 0, 0, 0.4);
                border-radius: 12px;
                padding: 30px;
            }

            .slider-section {
                text-align: center;
                margin-bottom: 30px;
            }

            .slider-label {
                display: block;
                font-size: 1.2rem;
                color: #e0e6ed;
                margin-bottom: 20px;
            }

            .length-slider {
                width: 100%;
                max-width: 500px;
                height: 8px;
                border-radius: 4px;
                background: rgba(255, 255, 255, 0.1);
                outline: none;
                cursor: pointer;
                -webkit-appearance: none;
                appearance: none;
            }

            .length-slider::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: #00f3ff;
                cursor: pointer;
                box-shadow: 0 0 10px rgba(0, 243, 255, 0.5);
            }

            .slider-markers {
                display: flex;
                justify-content: space-between;
                max-width: 500px;
                margin: 10px auto 0;
                color: #9ca3af;
                font-size: 0.8rem;
            }

            .security-metrics {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }

            .metric-card {
                background: rgba(0, 0, 0, 0.6);
                border: 2px solid #374151;
                border-radius: 12px;
                padding: 20px;
                text-align: center;
                transition: all 0.3s ease;
            }

            .metric-card:hover {
                border-color: #00f3ff;
                transform: translateY(-2px);
            }

            .metric-icon {
                font-size: 2rem;
                margin-bottom: 10px;
            }

            .metric-label {
                color: #9ca3af;
                font-size: 0.9rem;
                margin-bottom: 5px;
            }

            .metric-value {
                color: #00f3ff;
                font-size: 1.5rem;
                font-weight: bold;
                margin-bottom: 5px;
            }

            .metric-note {
                color: #9ca3af;
                font-size: 0.8rem;
            }

            .target-indicator {
                text-align: center;
                padding: 20px;
                background: rgba(0, 243, 255, 0.1);
                border: 2px solid #00f3ff;
                border-radius: 12px;
            }

            .target-text {
                font-size: 1.1rem;
                color: #00f3ff;
                font-weight: bold;
            }

            /* Character Complexity Styles */
            .complexity-builder {
                background: rgba(0, 0, 0, 0.4);
                border-radius: 12px;
                padding: 30px;
            }

            .password-input-section {
                margin-bottom: 30px;
            }

            .password-input-section label {
                display: block;
                color: #e0e6ed;
                font-size: 1.1rem;
                margin-bottom: 10px;
            }

            .character-types-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
                margin-bottom: 30px;
            }

            .char-type-card {
                background: rgba(0, 0, 0, 0.6);
                border: 2px solid #374151;
                border-radius: 8px;
                padding: 15px;
                transition: all 0.3s ease;
            }

            .char-type-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
            }

            .char-type-name {
                color: #e0e6ed;
                font-weight: bold;
                font-size: 0.9rem;
            }

            .char-type-status {
                font-size: 1.2rem;
            }

            .char-type-info {
                color: #9ca3af;
                font-size: 0.8rem;
            }

            .char-count {
                margin-bottom: 5px;
            }

            .char-example {
                font-family: 'Courier New', monospace;
                background: rgba(0, 0, 0, 0.5);
                padding: 2px 6px;
                border-radius: 3px;
            }

            .complexity-metrics {
                background: rgba(0, 0, 0, 0.6);
                border: 2px solid #00f3ff;
                border-radius: 12px;
                padding: 20px;
            }

            .metric-display {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
            }

            .metric-item {
                text-align: center;
            }

            .metric-item .metric-label {
                color: #9ca3af;
                font-size: 0.9rem;
                margin-bottom: 5px;
            }

            .metric-item .metric-value {
                color: #00f3ff;
                font-size: 1.3rem;
                font-weight: bold;
            }

            /* Terminal-style UI Components */
            .attack-simulation, .brute-force-simulator, .hashing-demo, .hash-cracking-sim,
            .salting-demo, .rate-limiting-sim, .attack-scenario, .secure-design-builder {
                background: rgba(0, 0, 0, 0.4);
                border: 1px solid #374151;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
            }

            .storage-methods-grid, .hash-examples, .salt-examples {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                gap: 20px;
                margin: 20px 0;
            }

            .storage-method-card, .hash-example-card, .salt-example-card {
                background: rgba(0, 0, 0, 0.6);
                border: 2px solid #374151;
                border-radius: 8px;
                padding: 15px;
                transition: all 0.3s ease;
            }

            .storage-method-card:hover, .hash-example-card:hover, .salt-example-card:hover {
                border-color: #00f3ff;
                transform: translateY(-2px);
            }

            .method-header, .hash-header, .salt-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
            }

            .method-header h4, .salt-header h4 {
                margin: 0;
                color: #e0e6ed;
            }

            .hash-type, .hash-strength {
                font-weight: bold;
                font-size: 0.9rem;
            }

            .security-badge {
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 0.8rem;
                font-weight: bold;
            }

            .method-example, .hash-display, .salt-details {
                background: rgba(0, 0, 0, 0.8);
                border: 1px solid #374151;
                border-radius: 4px;
                padding: 10px;
                margin: 10px 0;
                font-family: 'Courier New', monospace;
                font-size: 0.85rem;
            }

            .example-label, .hash-label {
                color: #9ca3af;
                font-size: 0.8rem;
                margin-bottom: 5px;
            }

            .example-value, .hash-value {
                color: #00f3ff;
                word-break: break-all;
            }

            .method-description, .salt-description {
                color: #9ca3af;
                font-size: 0.9rem;
                margin: 10px 0;
            }

            .method-vulnerability {
                font-size: 0.85rem;
                margin-top: 10px;
            }

            .log-viewer, .log-container {
                background: rgba(0, 0, 0, 0.8);
                border: 1px solid #374151;
                border-radius: 8px;
                padding: 15px;
                margin: 15px 0;
                max-height: 300px;
                overflow-y: auto;
            }

            .log-entry {
                font-family: 'Courier New', monospace;
                font-size: 0.85rem;
                padding: 5px 0;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }

            .defense-selector, .defense-option {
                margin: 15px 0;
            }

            .defense-option {
                background: rgba(0, 0, 0, 0.4);
                border: 1px solid #374151;
                border-radius: 6px;
                padding: 10px;
                transition: all 0.3s ease;
            }

            .defense-option:hover {
                border-color: #00f3ff;
                background: rgba(0, 243, 255, 0.1);
            }

            .component-section {
                background: rgba(0, 0, 0, 0.4);
                border: 1px solid #374151;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
            }

            .option-item {
                background: rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 4px;
                margin: 8px 0;
                transition: all 0.3s ease;
            }

            .option-item:hover {
                border-color: #00f3ff;
                background: rgba(0, 243, 255, 0.05);
            }

            .crack-result, .defense-feedback, .evaluation-result {
                margin-top: 15px;
            }

            .attack-log {
                background: rgba(0, 0, 0, 0.8);
                border: 1px solid #374151;
                border-radius: 8px;
                padding: 15px;
                margin-top: 15px;
                max-height: 300px;
                overflow-y: auto;
                font-family: 'Courier New', monospace;
                font-size: 0.85rem;
            }

            .scenario-selector {
                margin: 20px 0;
            }

            .current-config {
                background: rgba(0, 0, 0, 0.6);
                border: 2px solid #00f3ff;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
            }

            .explanation-panel {
                background: rgba(0, 255, 65, 0.1);
                border: 1px solid #00ff41;
                border-radius: 8px;
                padding: 15px;
                margin: 15px 0;
            }

            .explanation-panel h4 {
                color: #00ff41;
                margin-bottom: 10px;
            }

            .explanation-panel ul {
                color: #9ca3af;
                padding-left: 20px;
                margin-top: 10px;
            }

            .explanation-panel li {
                margin: 5px 0;
            }

            /* Terminal-style input enhancements */
            input[type="text"], input[type="password"] {
                font-family: 'Courier New', monospace;
                letter-spacing: 1px;
            }

            /* Responsive Design */
            @media (max-width: 768px) {
                .main-title {
                    font-size: 2rem;
                }

                .levels-grid {
                    grid-template-columns: 1fr;
                    padding: 0 10px;
                }

                .password-analysis-grid {
                    grid-template-columns: 1fr;
                }

                .security-metrics {
                    grid-template-columns: 1fr;
                }

                .storage-methods-grid, .hash-examples, .salt-examples {
                    grid-template-columns: 1fr;
                }

                .game-controls {
                    flex-direction: column;
                    gap: 15px;
                }

                .control-buttons {
                    width: 100%;
                    justify-content: center;
                }

                .level-info {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 10px;
                }

                .progress-container {
                    width: 100%;
                }

                .progress-bar {
                    flex: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }
    renderLevelSelection() {
        const grid = document.getElementById('levelsGrid');
        const overallProgress = document.getElementById('overallProgress');
        
        if (!grid) return;
        
        grid.innerHTML = '';
        
        const completedCount = this.gameProgress.completedLevels.length;
        const unlockedCount = this.gameProgress.unlockedLevels.length;
        
        if (overallProgress) {
            overallProgress.textContent = `${completedCount} of 10 Levels Completed`;
        }

        for (let i = 1; i <= 10; i++) {
            const level = this.levels[i];
            const isUnlocked = this.gameProgress.unlockedLevels.includes(i);
            const isCompleted = this.gameProgress.completedLevels.includes(i);

            const card = document.createElement('div');
            card.className = `level-card ${isCompleted ? 'completed' : (isUnlocked ? 'unlocked' : 'locked')}`;
            
            if (isUnlocked) {
                card.onclick = () => this.startLevel(i);
            }

            let statusText, statusIcon;
            if (isCompleted) {
                statusText = 'Completed';
                statusIcon = '<span class="status-icon completed-icon">✓</span>';
            } else if (isUnlocked) {
                statusText = 'Available';
                statusIcon = '<span class="status-icon play-icon">▶</span>';
            } else {
                statusText = 'Locked';
                statusIcon = '<span class="status-icon lock-icon">🔒</span>';
            }

            card.innerHTML = `
                <div class="level-number">Level ${i}</div>
                <div class="level-title">${level.title}</div>
                <div class="level-topic">${level.topic}</div>
                <div class="level-description">${level.description}</div>
                <div class="level-status">
                    <span class="status-text">${statusText}</span>
                    ${statusIcon}
                </div>
            `;

            grid.appendChild(card);
        }
    }

    startLevel(levelNum) {
        if (!this.gameProgress.unlockedLevels.includes(levelNum)) {
            this.showNotification('This level is locked! Complete previous levels first.', 'error');
            return;
        }

        this.currentLevelNum = levelNum;
        const level = this.levels[levelNum];

        if (!level) {
            this.showNotification('Level not found!', 'error');
            return;
        }

        // Reset level state
        this.resetLevelState();

        // Switch to game screen
        document.getElementById('levelSelection').style.display = 'none';
        document.getElementById('gameScreen').style.display = 'flex';

        // Update header
        document.getElementById('currentLevel').textContent = `Level ${levelNum}`;
        document.getElementById('levelTopic').textContent = level.topic;
        document.getElementById('levelObjective').textContent = level.objective;
        document.getElementById('progressFill').style.width = '0%';
        document.getElementById('progressText').textContent = '0%';

        // Load level content
        this.loadLevelContent(level);

        // Show check button, hide continue button
        document.getElementById('checkBtn').style.display = 'inline-block';
        document.getElementById('continueBtn').style.display = 'none';
    }

    resetLevelState() {
        // Reset all level-specific state variables
        this.levelStates = {
            classification: { answers: {}, completed: false },
            dictionary_attack: { passwordTested: false, survived: false, completed: false },
            brute_force: { targetMet: false, completed: false },
            character_complexity: { typesUsed: 0, completed: false },
            hashing_basics: { demonstrated: false, completed: false },
            hash_cracking: { observed: false, completed: false },
            salting: { understood: false, completed: false },
            rate_limiting: { configured: false, completed: false },
            attack_scenario: { defensesSelected: [], completed: false },
            secure_design: { componentsConfigured: {}, completed: false },
            lengthDemo: { targetMet: false, completed: false } // Legacy support for length demo
        };
    }
    loadLevelContent(level) {
        const content = document.getElementById('gameContent');
        
        switch (level.type) {
            case 'classification':
                this.renderPasswordClassification(content, level);
                break;
            case 'dictionary_attack':
                this.renderDictionaryAttack(content, level);
                break;
            case 'brute_force':
                this.renderBruteForce(content, level);
                break;
            case 'character_complexity':
                this.renderCharacterComplexity(content, level);
                break;
            case 'hashing_basics':
                this.renderHashingBasics(content, level);
                break;
            case 'hash_cracking':
                this.renderHashCracking(content, level);
                break;
            case 'salting':
                this.renderSalting(content, level);
                break;
            case 'rate_limiting':
                this.renderRateLimiting(content, level);
                break;
            case 'attack_scenario':
                this.renderAttackScenario(content, level);
                break;
            case 'secure_design':
                this.renderSecureDesign(content, level);
                break;
            default:
                content.innerHTML = `
                    <div style="text-align: center; padding: 50px;">
                        <h2 style="color: #ff006e;">⚠️ Level Implementation Error</h2>
                        <p style="color: #9ca3af; margin: 20px 0;">This level type is not implemented.</p>
                    </div>
                `;
        }
    }

    // Level 1: Password Classification
    renderPasswordClassification(container, level) {
        container.innerHTML = `
            <div class="level-content">
                <div class="instruction-panel">
                    <h3>🎯 Mission: Password Security Assessment</h3>
                    <p>As a cybersecurity analyst, classify each password as WEAK or STRONG based on security principles.</p>
                    <div class="security-tips">
                        <h4>Security Guidelines:</h4>
                        <ul>
                            <li>Strong passwords are long (12+ characters)</li>
                            <li>Mix uppercase, lowercase, numbers, and symbols</li>
                            <li>Avoid dictionary words and common patterns</li>
                            <li>Avoid personal information and predictable sequences</li>
                        </ul>
                    </div>
                </div>
                
                <div class="password-analysis-grid">
                    ${level.data.passwords.map((pwd, index) => `
                        <div class="password-analysis-card" data-index="${index}">
                            <div class="password-display">
                                <span class="password-text">${pwd.text}</span>
                                <div class="analysis-tools">
                                    <span class="length-indicator">Length: ${pwd.text.length}</span>
                                </div>
                            </div>
                            <div class="classification-buttons">
                                <button class="classify-btn weak-btn" onclick="passwordTraining.classifyPassword(${index}, 'weak')">
                                    🚨 WEAK
                                </button>
                                <button class="classify-btn strong-btn" onclick="passwordTraining.classifyPassword(${index}, 'strong')">
                                    🛡️ STRONG
                                </button>
                            </div>
                            <div class="feedback-area" id="feedback-${index}"></div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="score-panel">
                    <div class="score-display">
                        <span class="score-label">Accuracy:</span>
                        <span class="score-value" id="classificationScore">0 / ${level.data.passwords.length}</span>
                        <span class="score-percentage" id="scorePercentage">(0%)</span>
                    </div>
                    <div class="pass-requirement">
                        Need 70% accuracy to pass (${Math.ceil(level.data.passwords.length * 0.7)} correct)
                    </div>
                </div>
            </div>
        `;
    }
    // Level 2: Password Length Demo
    renderLengthDemo(container, level) {
        container.innerHTML = `
            <div class="level-content">
                <div class="instruction-panel">
                    <h3>🎯 Mission: Password Length Security Analysis</h3>
                    <p>Analyze how password length exponentially increases resistance to brute force attacks.</p>
                    <div class="security-explanation">
                        <p><strong>Brute Force Attack:</strong> Systematically trying every possible password combination until the correct one is found.</p>
                    </div>
                </div>
                
                <div class="length-demo-container">
                    <div class="slider-section">
                        <label class="slider-label">
                            Password Length: <span id="lengthValue">8</span> characters
                        </label>
                        <input type="range" class="length-slider" id="lengthSlider" 
                               min="${level.data.minLength}" max="${level.data.maxLength}" 
                               value="8" oninput="passwordTraining.updateLengthDemo(this.value)">
                        <div class="slider-markers">
                            <span>Weak</span>
                            <span>Better</span>
                            <span>Strong</span>
                            <span>Excellent</span>
                        </div>
                    </div>
                    
                    <div class="security-metrics">
                        <div class="metric-card">
                            <div class="metric-icon">🔢</div>
                            <div class="metric-content">
                                <div class="metric-label">Possible Combinations</div>
                                <div class="metric-value" id="combinations">0</div>
                                <div class="metric-note">Total password possibilities</div>
                            </div>
                        </div>
                        
                        <div class="metric-card">
                            <div class="metric-icon">⏱️</div>
                            <div class="metric-content">
                                <div class="metric-label">Time to Crack (Average)</div>
                                <div class="metric-value" id="crackTime">0 seconds</div>
                                <div class="metric-note">At 1 billion attempts/sec</div>
                            </div>
                        </div>
                        
                        <div class="metric-card">
                            <div class="metric-icon">🎯</div>
                            <div class="metric-content">
                                <div class="metric-label">Security Level</div>
                                <div class="metric-value" id="securityLevel">Weak</div>
                                <div class="metric-note" id="securityAdvice">Increase length</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="target-indicator">
                        <div class="target-text" id="lengthTarget">
                            🎯 Target: Reach ${level.data.targetLength}+ characters for strong security
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.updateLengthDemo(8);
    }
    // Interactive Logic Functions

    // Level 1: Password Classification Logic
    classifyPassword(index, choice) {
        const level = this.levels[this.currentLevelNum];
        const password = level.data.passwords[index];
        const correct = password.correct === choice;
        
        this.levelStates.classification.answers[index] = { choice, correct };
        
        const card = document.querySelector(`[data-index="${index}"]`);
        const feedback = document.getElementById(`feedback-${index}`);
        const buttons = card.querySelectorAll('.classify-btn');
        
        // Disable buttons
        buttons.forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = '0.6';
        });
        
        // Show feedback with cybersecurity explanation
        if (correct) {
            card.style.borderColor = '#00ff41';
            card.style.background = 'rgba(0, 255, 65, 0.1)';
            feedback.innerHTML = `
                <div class="feedback correct">
                    <div class="feedback-icon">✅</div>
                    <div class="feedback-text">
                        <strong>Correct Assessment!</strong><br>
                        <em>${password.reason}</em>
                    </div>
                </div>
            `;
        } else {
            card.style.borderColor = '#ff006e';
            card.style.background = 'rgba(255, 0, 110, 0.1)';
            feedback.innerHTML = `
                <div class="feedback incorrect">
                    <div class="feedback-icon">❌</div>
                    <div class="feedback-text">
                        <strong>Incorrect Assessment</strong><br>
                        <em>${password.reason}</em>
                    </div>
                </div>
            `;
        }
        
        this.updateClassificationScore();
    }

    updateClassificationScore() {
        const answers = this.levelStates.classification.answers;
        const correctCount = Object.values(answers).filter(a => a.correct).length;
        const totalAnswers = Object.keys(answers).length;
        const totalQuestions = this.levels[this.currentLevelNum].data.passwords.length;
        
        document.getElementById('classificationScore').textContent = `${correctCount} / ${totalQuestions}`;
        
        const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
        document.getElementById('scorePercentage').textContent = `(${percentage}%)`;
        
        const progress = (totalAnswers / totalQuestions) * 100;
        this.updateProgress(progress);
        
        // Check if level is complete
        if (totalAnswers === totalQuestions) {
            this.levelStates.classification.completed = percentage >= 70;
        }
    }

    // Level 2: Length Demo Logic (Legacy support - not used in current 10-level structure)
    updateLengthDemo(length) {
        const level = this.levels[this.currentLevelNum];
        if (!level || !level.data) {
            console.warn('updateLengthDemo: Level data not available');
            return;
        }
        
        // Use fallback values if properties don't exist
        const charset = level.data.charset || 95; // Default to full ASCII printable
        const attemptsPerSecond = level.data.attackSpeed || 1000000000; // Default to 1 billion/sec
        const targetLength = level.data.targetLength || 12; // Default target length
        
        const combinations = Math.pow(charset, length);
        const secondsToCrack = combinations / (2 * attemptsPerSecond); // Average case
        
        const lengthValueEl = document.getElementById('lengthValue');
        const combinationsEl = document.getElementById('combinations');
        const crackTimeEl = document.getElementById('crackTime');
        
        if (lengthValueEl) lengthValueEl.textContent = length;
        if (combinationsEl) combinationsEl.textContent = this.formatNumber(combinations);
        if (crackTimeEl) crackTimeEl.textContent = this.formatTime(secondsToCrack);
        
        // Update security level
        let securityLevel, securityAdvice, color;
        if (length < 8) {
            securityLevel = 'Very Weak';
            securityAdvice = 'Extremely vulnerable';
            color = '#ff006e';
        } else if (length < 10) {
            securityLevel = 'Weak';
            securityAdvice = 'Still vulnerable';
            color = '#fbbf24';
        } else if (length < 12) {
            securityLevel = 'Moderate';
            securityAdvice = 'Getting better';
            color = '#60a5fa';
        } else if (length < 16) {
            securityLevel = 'Strong';
            securityAdvice = 'Good security';
            color = '#00ff41';
        } else {
            securityLevel = 'Excellent';
            securityAdvice = 'Very secure';
            color = '#00ff41';
        }
        
        const securityLevelEl = document.getElementById('securityLevel');
        const securityAdviceEl = document.getElementById('securityAdvice');
        if (securityLevelEl) {
            securityLevelEl.textContent = securityLevel;
            securityLevelEl.style.color = color;
        }
        if (securityAdviceEl) securityAdviceEl.textContent = securityAdvice;
        
        // Initialize lengthDemo state if it doesn't exist
        if (!this.levelStates.lengthDemo) {
            this.levelStates.lengthDemo = { targetMet: false, completed: false };
        }
        
        const targetMet = length >= targetLength;
        const target = document.getElementById('lengthTarget');
        
        if (targetMet && !this.levelStates.lengthDemo.targetMet) {
            this.levelStates.lengthDemo.targetMet = true;
            this.levelStates.lengthDemo.completed = true;
            if (target) {
                target.innerHTML = '🎉 Target achieved! Strong password length reached.';
                target.style.color = '#00ff41';
            }
            this.showNotification('Excellent! You understand password length security.', 'success');
        } else if (!targetMet) {
            this.levelStates.lengthDemo.targetMet = false;
            this.levelStates.lengthDemo.completed = false;
            if (target) {
                target.style.color = '#00f3ff';
            }
        }
        
        const progress = Math.min((length / targetLength) * 100, 100);
        this.updateProgress(progress);
    }
    // Level 3: Character Complexity
    renderCharacterComplexity(container, level) {
        container.innerHTML = `
            <div class="level-content">
                <div class="instruction-panel">
                    <h3>🎯 Mission: Character Complexity Analysis</h3>
                    <p>Build a password using different character types and see how complexity affects security.</p>
                </div>
                
                <div class="complexity-builder">
                    <div class="password-input-section">
                        <label>Build Your Password:</label>
                        <input type="text" id="complexityPassword" placeholder="Type your password here..." 
                               oninput="passwordTraining.analyzeComplexity(this.value)"
                               style="width: 100%; padding: 15px; font-size: 1.2rem; font-family: 'Courier New', monospace; 
                                      background: rgba(0,0,0,0.8); border: 2px solid #374151; border-radius: 8px; color: #e0e6ed;">
                    </div>
                    
                    <div class="character-types-grid">
                        ${level.data.charTypes.map((type, index) => `
                            <div class="char-type-card" id="charType-${type.name}">
                                <div class="char-type-header">
                                    <span class="char-type-name">${type.label}</span>
                                    <span class="char-type-status" id="status-${type.name}">❌</span>
                                </div>
                                <div class="char-type-info">
                                    <div class="char-count">${type.count} characters</div>
                                    <div class="char-example">Example: ${type.example}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="complexity-metrics">
                        <div class="metric-display">
                            <div class="metric-item">
                                <span class="metric-label">Character Types Used:</span>
                                <span class="metric-value" id="typesUsed">0 / 4</span>
                            </div>
                            <div class="metric-item">
                                <span class="metric-label">Character Pool Size:</span>
                                <span class="metric-value" id="poolSize">0</span>
                            </div>
                            <div class="metric-item">
                                <span class="metric-label">Security Score:</span>
                                <span class="metric-value" id="complexityScore">0%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    analyzeComplexity(password) {
        const level = this.levels[this.currentLevelNum];
        const charTypes = level.data.charTypes;
        
        let typesUsed = 0;
        let poolSize = 0;
        
        charTypes.forEach(type => {
            let hasType = false;
            const statusEl = document.getElementById(`status-${type.name}`);
            const cardEl = document.getElementById(`charType-${type.name}`);
            
            switch (type.name) {
                case 'lowercase':
                    hasType = /[a-z]/.test(password);
                    break;
                case 'uppercase':
                    hasType = /[A-Z]/.test(password);
                    break;
                case 'numbers':
                    hasType = /[0-9]/.test(password);
                    break;
                case 'symbols':
                    hasType = /[^a-zA-Z0-9]/.test(password);
                    break;
            }
            
            if (hasType) {
                typesUsed++;
                poolSize += type.count;
                statusEl.textContent = '✅';
                cardEl.style.borderColor = '#00ff41';
                cardEl.style.background = 'rgba(0, 255, 65, 0.1)';
            } else {
                statusEl.textContent = '❌';
                cardEl.style.borderColor = '#374151';
                cardEl.style.background = 'rgba(0, 0, 0, 0.6)';
            }
        });
        
        const score = Math.round((typesUsed / 4) * 100);
        
        document.getElementById('typesUsed').textContent = `${typesUsed} / 4`;
        document.getElementById('poolSize').textContent = poolSize;
        document.getElementById('complexityScore').textContent = `${score}%`;
        
        this.levelStates.character_complexity.typesUsed = typesUsed;
        this.levelStates.character_complexity.completed = typesUsed === 4;
        
        this.updateProgress(score);
    }
    // Level 2: Dictionary Attack
    renderDictionaryAttack(container, level) {
        container.innerHTML = `
            <div class="level-content">
                <div class="instruction-panel">
                    <h3>🎯 Mission: Dictionary Attack Simulation</h3>
                    <p>Simulate dictionary-based password guessing. Understand why reused passwords are dangerous.</p>
                    <div class="security-tips">
                        <h4>Dictionary Attack:</h4>
                        <p>${level.data.explanation}</p>
                        <p>Attackers use lists of common passwords from data breaches to quickly crack weak passwords.</p>
                    </div>
                </div>
                <div class="attack-simulation">
                    <div class="password-input-section">
                        <label>Enter Password to Test:</label>
                        <input type="text" id="testPassword" placeholder="Type password here..." 
                               style="width: 100%; padding: 15px; font-size: 1.2rem; font-family: 'Courier New', monospace; 
                                      background: rgba(0,0,0,0.8); border: 2px solid #374151; border-radius: 8px; color: #e0e6ed; margin: 20px 0;">
                    </div>
                    <button class="btn btn-primary" onclick="passwordTraining.testDictionary()">Test Against Dictionary</button>
                    <div id="attackResult" style="margin-top: 20px;"></div>
                    <div class="dictionary-info" style="margin-top: 20px; padding: 15px; background: rgba(0,0,0,0.6); border-radius: 8px;">
                        <h4>Common Passwords Database:</h4>
                        <p style="color: #9ca3af; font-size: 0.9rem;">This simulation uses a database of ${level.data.commonPasswords.length}+ common passwords from real data breaches.</p>
                    </div>
                </div>
            </div>
        `;
    }

    testDictionary() {
        const password = document.getElementById('testPassword').value;
        if (!password) {
            this.showNotification('Please enter a password to test', 'warning');
            return;
        }
        
        const level = this.levels[this.currentLevelNum];
        const isCommon = level.data.commonPasswords.includes(password.toLowerCase());
        const result = document.getElementById('attackResult');
        
        // Simulate attack animation
        result.innerHTML = `<div style="color: #00f3ff;">🔍 Scanning dictionary database...</div>`;
        
        setTimeout(() => {
        if (isCommon) {
                result.innerHTML = `
                    <div style="color: #ff006e; padding: 15px; background: rgba(255,0,110,0.1); border: 2px solid #ff006e; border-radius: 8px; margin-top: 15px;">
                        <strong>🚨 PASSWORD CRACKED!</strong><br>
                        Found in dictionary database after ${Math.floor(Math.random() * 50) + 1} attempts.<br>
                        <em>${level.data.explanation}</em>
                    </div>
                `;
                this.levelStates.dictionary_attack.survived = false;
        } else {
                result.innerHTML = `
                    <div style="color: #00ff41; padding: 15px; background: rgba(0,255,65,0.1); border: 2px solid #00ff41; border-radius: 8px; margin-top: 15px;">
                        <strong>✅ PASSWORD SURVIVED!</strong><br>
                        Not found in common dictionary database.<br>
                        <em>This password would resist dictionary attacks.</em>
                    </div>
                `;
                this.levelStates.dictionary_attack.survived = true;
            }
            
            this.levelStates.dictionary_attack.passwordTested = true;
            this.levelStates.dictionary_attack.completed = this.levelStates.dictionary_attack.survived;
            this.updateProgress(this.levelStates.dictionary_attack.completed ? 100 : 50);
        }, 1000);
    }

    // Level 3: Brute Force Simulation
    renderBruteForce(container, level) {
        container.innerHTML = `
            <div class="level-content">
                <div class="instruction-panel">
                    <h3>🎯 Mission: Brute Force Attack Simulation</h3>
                    <p>Visual simulation of brute force attack speed. Compare short vs long passwords.</p>
                    <div class="security-tips">
                        <h4>Brute Force Attack:</h4>
                        <p>Systematically tries every possible password combination until the correct one is found.</p>
                    </div>
                </div>
                
                <div class="brute-force-simulator">
                    <div class="password-input-section">
                        <label>Enter Password to Test:</label>
                        <input type="text" id="bruteForcePassword" placeholder="Type password here..." 
                               oninput="passwordTraining.simulateBruteForce(this.value)"
                               style="width: 100%; padding: 15px; font-size: 1.2rem; font-family: 'Courier New', monospace; 
                                      background: rgba(0,0,0,0.8); border: 2px solid #374151; border-radius: 8px; color: #e0e6ed; margin: 20px 0;">
                    </div>
                    
                    <div class="attack-results" id="attackResults">
                        <div class="metric-card">
                            <div class="metric-label">Password Length</div>
                            <div class="metric-value" id="pwdLength">0</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-label">Character Set Size</div>
                            <div class="metric-value" id="charsetSize">0</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-label">Possible Combinations</div>
                            <div class="metric-value" id="combinations">0</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-label">Time to Crack (1B/sec)</div>
                            <div class="metric-value" id="crackTime">0</div>
                        </div>
                    </div>
                    
                    <div class="target-indicator" id="bruteForceTarget">
                        <div class="target-text">
                            🎯 Target: Create a password that takes over ${level.data.targetYears} years to crack
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    simulateBruteForce(password) {
        if (!password) {
            document.getElementById('pwdLength').textContent = '0';
            document.getElementById('charsetSize').textContent = '0';
            document.getElementById('combinations').textContent = '0';
            document.getElementById('crackTime').textContent = '0';
            return;
        }
        
        const level = this.levels[this.currentLevelNum];
        const length = password.length;
        
        // Calculate character set
        let charset = 0;
        if (/[a-z]/.test(password)) charset += 26;
        if (/[A-Z]/.test(password)) charset += 26;
        if (/[0-9]/.test(password)) charset += 10;
        if (/[^a-zA-Z0-9]/.test(password)) charset += 33;
        
        const combinations = Math.pow(charset, length);
        const attemptsPerSecond = 1000000000; // 1 billion
        const secondsToCrack = combinations / (2 * attemptsPerSecond);
        const yearsToCrack = secondsToCrack / 31536000;
        
        document.getElementById('pwdLength').textContent = length;
        document.getElementById('charsetSize').textContent = charset;
        document.getElementById('combinations').textContent = this.formatNumber(combinations);
        document.getElementById('crackTime').textContent = this.formatTime(secondsToCrack);
        
        const target = document.getElementById('bruteForceTarget');
        if (yearsToCrack >= level.data.targetYears) {
            this.levelStates.brute_force.targetMet = true;
            this.levelStates.brute_force.completed = true;
            target.innerHTML = '<div class="target-text" style="color: #00ff41;">🎉 Target achieved! Password is secure against brute force.</div>';
            this.updateProgress(100);
        } else {
            this.levelStates.brute_force.targetMet = false;
            this.levelStates.brute_force.completed = false;
            target.innerHTML = `<div class="target-text">🎯 Target: Create a password that takes over ${level.data.targetYears} years to crack (Current: ${yearsToCrack.toFixed(2)} years)</div>`;
            this.updateProgress(Math.min((yearsToCrack / level.data.targetYears) * 100, 100));
        }
    }

    // Level 5: Hashing Basics
    renderHashingBasics(container, level) {
        container.innerHTML = `
            <div class="level-content">
                <div class="instruction-panel">
                    <h3>🎯 Mission: Password Hashing Basics</h3>
                    <p>Introduce password hashing (visual explanation). Show why plain-text storage is insecure.</p>
                </div>
                
                <div class="hashing-demo">
                    <div class="password-input-section">
                        <label>Enter Password to Hash:</label>
                        <input type="text" id="hashPassword" placeholder="Type password here..." 
                               oninput="passwordTraining.demonstrateHashing(this.value)"
                               style="width: 100%; padding: 15px; font-size: 1.2rem; font-family: 'Courier New', monospace; 
                                      background: rgba(0,0,0,0.8); border: 2px solid #374151; border-radius: 8px; color: #e0e6ed; margin: 20px 0;">
                    </div>
                    
                    <div class="storage-methods-grid">
                        ${level.data.storageMethods.map((method, index) => `
                            <div class="storage-method-card" style="border-color: ${method.color};">
                                <div class="method-header" style="color: ${method.color};">
                                    <h4>${method.name}</h4>
                                    <span class="security-badge" style="background: ${method.color}20; color: ${method.color};">
                                        ${method.security}
                                    </span>
                                </div>
                                <div class="method-example" id="example-${index}">
                                    <div class="example-label">Example:</div>
                                    <div class="example-value">${method.example}</div>
                                </div>
                                <div class="method-description">${method.description}</div>
                                <div class="method-vulnerability" style="color: #ff006e;">
                                    ⚠️ ${method.vulnerability}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="hashing-explanation">
                        <p><strong>${level.data.explanation}</strong></p>
                    </div>
                </div>
            </div>
        `;
    }

    demonstrateHashing(password) {
        if (!password) return;
        
        // Simulate different hash outputs (visual only, not real hashing)
        const md5Hash = Array.from({length: 32}, () => Math.floor(Math.random() * 16).toString(16)).join('');
        const sha256Hash = Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
        const bcryptHash = '$2a$10$' + Array.from({length: 53}, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789./'[Math.floor(Math.random() * 64)]).join('');
        
        document.getElementById('example-0').innerHTML = `
            <div class="example-label">Example:</div>
            <div class="example-value">${password}</div>
        `;
        document.getElementById('example-1').innerHTML = `
            <div class="example-label">Example:</div>
            <div class="example-value">${md5Hash}</div>
        `;
        document.getElementById('example-2').innerHTML = `
            <div class="example-label">Example:</div>
            <div class="example-value">${sha256Hash}</div>
        `;
        document.getElementById('example-3').innerHTML = `
            <div class="example-label">Example:</div>
            <div class="example-value">${bcryptHash}</div>
        `;
        
        this.levelStates.hashing_basics.demonstrated = true;
        this.levelStates.hashing_basics.completed = true;
        this.updateProgress(100);
    }

    // Level 6: Hash Cracking Simulation
    renderHashCracking(container, level) {
        container.innerHTML = `
            <div class="level-content">
                <div class="instruction-panel">
                    <h3>🎯 Mission: Hash Cracking Simulation</h3>
                    <p>Demonstrate how weak hashes can be cracked. Compare weak hash vs strong hash.</p>
                </div>
                
                <div class="hash-cracking-sim">
                    <div class="hash-examples">
                        ${level.data.hashes.map((hashData, index) => `
                            <div class="hash-example-card" data-index="${index}">
                                <div class="hash-header">
                                    <span class="hash-type">${hashData.hashType}</span>
                                    <span class="hash-strength" style="color: ${hashData.strength === 'weak' ? '#ff006e' : hashData.strength === 'moderate' ? '#fbbf24' : '#00ff41'};">
                                        ${hashData.strength.toUpperCase()}
                                    </span>
                                </div>
                                <div class="hash-display">
                                    <div class="hash-label">Hash:</div>
                                    <div class="hash-value">${hashData.hash}</div>
                                </div>
                                <div class="hash-info">
                                    <div>Password: <strong>${hashData.password}</strong></div>
                                    <div>${hashData.description}</div>
                                </div>
                                <button class="btn btn-primary" onclick="passwordTraining.attemptHashCrack(${index})">
                                    Attempt Crack
                                </button>
                                <div class="crack-result" id="crack-result-${index}"></div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    attemptHashCrack(index) {
        const level = this.levels[this.currentLevelNum];
        const hashData = level.data.hashes[index];
        const resultDiv = document.getElementById(`crack-result-${index}`);
        
        resultDiv.innerHTML = '<div style="color: #00f3ff;">🔍 Attempting to crack hash...</div>';
        
        setTimeout(() => {
            if (hashData.strength === 'weak') {
                resultDiv.innerHTML = `
                    <div style="color: #ff006e; padding: 10px; background: rgba(255,0,110,0.1); border: 1px solid #ff006e; border-radius: 6px; margin-top: 10px;">
                        <strong>🚨 CRACKED!</strong><br>
                        Password found: <strong>${hashData.password}</strong><br>
                        Time: ${hashData.crackTime} seconds
                    </div>
                `;
            } else if (hashData.strength === 'moderate') {
                resultDiv.innerHTML = `
                    <div style="color: #fbbf24; padding: 10px; background: rgba(251,191,36,0.1); border: 1px solid #fbbf24; border-radius: 6px; margin-top: 10px;">
                        <strong>⚠️ CRACKED (Slow)</strong><br>
                        Password found: <strong>${hashData.password}</strong><br>
                        Time: ${hashData.crackTime} seconds<br>
                        <em>Stronger hash needed</em>
                    </div>
                `;
            } else {
                resultDiv.innerHTML = `
                    <div style="color: #00ff41; padding: 10px; background: rgba(0,255,65,0.1); border: 1px solid #00ff41; border-radius: 6px; margin-top: 10px;">
                        <strong>✅ SECURE</strong><br>
                        Hash resisted cracking attempts<br>
                        Estimated time: ${hashData.crackTime} years<br>
                        <em>Strong hash with proper salting</em>
                    </div>
                `;
            }
            
            this.levelStates.hash_cracking.observed = true;
            this.levelStates.hash_cracking.completed = true;
            this.updateProgress(100);
        }, 1500);
    }

    // Level 7: Salting Passwords
    renderSalting(container, level) {
        container.innerHTML = `
            <div class="level-content">
                <div class="instruction-panel">
                    <h3>🎯 Mission: Salting Passwords</h3>
                    <p>Learn how salting protects hashes. Simulate failed cracking attempts on salted passwords.</p>
                </div>
                
                <div class="salting-demo">
                    <div class="password-input-section">
                        <label>Enter Password:</label>
                        <input type="text" id="saltPassword" placeholder="Type password here..." 
                               oninput="passwordTraining.demonstrateSalting(this.value)"
                               style="width: 100%; padding: 15px; font-size: 1.2rem; font-family: 'Courier New', monospace; 
                                      background: rgba(0,0,0,0.8); border: 2px solid #374151; border-radius: 8px; color: #e0e6ed; margin: 20px 0;">
                    </div>
                    
                    <div class="salt-examples">
                        ${level.data.examples.map((example, index) => `
                            <div class="salt-example-card" id="salt-example-${index}">
                                <div class="salt-header">
                                    <h4>Example ${index + 1}</h4>
                                </div>
                                <div class="salt-details">
                                    <div><strong>Password:</strong> <span id="salt-pwd-${index}">-</span></div>
                                    <div><strong>Salt:</strong> <span id="salt-value-${index}">-</span></div>
                                    <div><strong>Hash:</strong> <span id="salt-hash-${index}" class="hash-display">-</span></div>
                                </div>
                                <div class="salt-description">${example.description}</div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="salting-explanation">
                        <div class="explanation-panel">
                            <h4>Why Salting Works:</h4>
                            <p>${level.data.explanation}</p>
                            <ul>
                                <li>Each password gets a unique random salt</li>
                                <li>Same password + different salt = different hash</li>
                                <li>Rainbow tables become useless</li>
                                <li>Attackers must crack each hash individually</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    demonstrateSalting(password) {
        if (!password) return;
        
        // Generate random salts (visual simulation)
        const salt1 = Array.from({length: 16}, () => Math.floor(Math.random() * 16).toString(16)).join('');
        const salt2 = Array.from({length: 16}, () => Math.floor(Math.random() * 16).toString(16)).join('');
        const hash1 = Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
        const hash2 = Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
        
        document.getElementById('salt-pwd-0').textContent = password;
        document.getElementById('salt-value-0').textContent = salt1;
        document.getElementById('salt-hash-0').textContent = hash1;
        
        document.getElementById('salt-pwd-1').textContent = password;
        document.getElementById('salt-value-1').textContent = salt2;
        document.getElementById('salt-hash-1').textContent = hash2;
        
        this.levelStates.salting.understood = true;
        this.levelStates.salting.completed = true;
        this.updateProgress(100);
    }

    // Level 8: Rate Limiting & Lockout
    renderRateLimiting(container, level) {
        container.innerHTML = `
            <div class="level-content">
                <div class="instruction-panel">
                    <h3>🎯 Mission: Rate Limiting & Lockout</h3>
                    <p>Implement login attempt limits. Observe how defenses stop brute force attacks.</p>
                </div>
                
                <div class="rate-limiting-sim">
                    <div class="scenario-selector">
                        <h4>Select Protection Level:</h4>
                        ${level.data.scenarios.map((scenario, index) => `
                            <button class="btn ${index === 1 ? 'btn-success' : 'btn-secondary'}" 
                                    onclick="passwordTraining.configureRateLimiting(${index})"
                                    style="margin: 10px;">
                                ${scenario.name}
                            </button>
                        `).join('')}
                    </div>
                    
                    <div class="current-config" id="currentConfig">
                        <h4>Current Configuration:</h4>
                        <div id="configDetails">Select a protection level above</div>
                    </div>
                    
                    <div class="attack-simulation" id="attackSim">
                        <h4>Simulated Attack:</h4>
                        <button class="btn btn-primary" onclick="passwordTraining.simulateAttack()">
                            Start Attack Simulation
                        </button>
                        <div class="attack-log" id="attackLog"></div>
                    </div>
                </div>
            </div>
        `;
    }

    configureRateLimiting(index) {
        const level = this.levels[this.currentLevelNum];
        const scenario = level.data.scenarios[index];
        
        document.getElementById('configDetails').innerHTML = `
            <div style="padding: 15px; background: rgba(0,0,0,0.6); border-radius: 8px; margin-top: 10px;">
                <div><strong>Max Attempts:</strong> ${scenario.maxAttempts === 999999 ? 'Unlimited' : scenario.maxAttempts}</div>
                <div><strong>Lockout Time:</strong> ${scenario.lockoutTime === 0 ? 'None' : scenario.lockoutTime + ' seconds'}</div>
                <div style="margin-top: 10px; color: #9ca3af;">${scenario.description}</div>
            </div>
        `;
        
        this.currentRateLimitConfig = scenario;
        this.levelStates.rate_limiting.configured = true;
    }

    simulateAttack() {
        if (!this.currentRateLimitConfig) {
            this.showNotification('Please configure rate limiting first', 'warning');
            return;
        }
        
        const log = document.getElementById('attackLog');
        log.innerHTML = '';
        
        let attempts = 0;
        const maxAttempts = this.currentRateLimitConfig.maxAttempts;
        const lockoutTime = this.currentRateLimitConfig.lockoutTime;
        
        const attackInterval = setInterval(() => {
            attempts++;
            const logEntry = document.createElement('div');
            logEntry.style.cssText = 'padding: 8px; margin: 5px 0; background: rgba(255,0,110,0.1); border-left: 3px solid #ff006e; font-family: monospace;';
            
            if (attempts <= maxAttempts) {
                logEntry.textContent = `[${new Date().toLocaleTimeString()}] Attempt ${attempts}: Failed login`;
                log.appendChild(logEntry);
            } else {
                clearInterval(attackInterval);
                const blockedEntry = document.createElement('div');
                blockedEntry.style.cssText = 'padding: 8px; margin: 5px 0; background: rgba(0,255,65,0.1); border-left: 3px solid #00ff41; font-family: monospace;';
                blockedEntry.textContent = `[${new Date().toLocaleTimeString()}] Account locked for ${lockoutTime} seconds`;
                log.appendChild(blockedEntry);
                
                this.levelStates.rate_limiting.completed = true;
                this.updateProgress(100);
            }
        }, 500);
    }

    // Level 9: Real-World Attack Scenario
    renderAttackScenario(container, level) {
        container.innerHTML = `
            <div class="level-content">
                <div class="instruction-panel">
                    <h3>🎯 Mission: Real-World Attack Scenario</h3>
                    <p>Simulate a system under attack. Analyze logs and choose the correct defense.</p>
                </div>
                
                <div class="attack-scenario">
                    <div class="log-viewer">
                        <h4>System Logs:</h4>
                        <div class="log-container">
                            ${level.data.logs.map((log, index) => `
                                <div class="log-entry" style="color: ${log.status === 'suspicious' ? '#ff006e' : '#00ff41'};">
                                    [${log.time}] ${log.ip} - ${log.action} - ${log.username} - <strong>${log.status.toUpperCase()}</strong>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="defense-selector">
                        <h4>Select Appropriate Defenses:</h4>
                        ${level.data.defenses.map((defense, index) => `
                            <div class="defense-option">
                                <label style="display: flex; align-items: center; padding: 10px; cursor: pointer;">
                                    <input type="checkbox" value="${index}" 
                                           onchange="passwordTraining.selectDefense(${index}, this.checked)"
                                           style="margin-right: 10px;">
                                    <div>
                                        <strong>${defense.name}</strong><br>
                                        <span style="color: #9ca3af; font-size: 0.9rem;">${defense.description}</span>
                                    </div>
                                </label>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="defense-feedback" id="defenseFeedback"></div>
                </div>
            </div>
        `;
    }

    selectDefense(index, selected) {
        const level = this.levels[this.currentLevelNum];
        const defense = level.data.defenses[index];
        
        if (selected) {
            if (!this.levelStates.attack_scenario.defensesSelected.includes(index)) {
                this.levelStates.attack_scenario.defensesSelected.push(index);
            }
        } else {
            this.levelStates.attack_scenario.defensesSelected = 
                this.levelStates.attack_scenario.defensesSelected.filter(i => i !== index);
        }
        
        const correctDefenses = level.data.defenses.filter((d, i) => d.correct);
        const selectedCorrect = this.levelStates.attack_scenario.defensesSelected.filter(i => level.data.defenses[i].correct);
        
        const feedback = document.getElementById('defenseFeedback');
        if (selectedCorrect.length === correctDefenses.length && 
            this.levelStates.attack_scenario.defensesSelected.length === correctDefenses.length) {
            feedback.innerHTML = `
                <div style="color: #00ff41; padding: 15px; background: rgba(0,255,65,0.1); border: 2px solid #00ff41; border-radius: 8px; margin-top: 15px;">
                    <strong>✅ Correct Defenses Selected!</strong><br>
                    ${level.data.explanation}
                </div>
            `;
            this.levelStates.attack_scenario.completed = true;
            this.updateProgress(100);
        } else {
            feedback.innerHTML = `
                <div style="color: #fbbf24; padding: 15px; background: rgba(251,191,36,0.1); border: 2px solid #fbbf24; border-radius: 8px; margin-top: 15px;">
                    Selected: ${selectedCorrect.length} / ${correctDefenses.length} correct defenses
                </div>
            `;
            this.updateProgress((selectedCorrect.length / correctDefenses.length) * 100);
        }
    }

    // Level 10: Secure System Design
    renderSecureDesign(container, level) {
        container.innerHTML = `
            <div class="level-content">
                <div class="instruction-panel">
                    <h3>🎯 Mission: Secure System Design (Pro Level)</h3>
                    <p>Design a secure password policy. Combine strong passwords, hashing, salting, and protections.</p>
                    <p><strong>Final evaluation as a cyber security professional.</strong></p>
                </div>
                
                <div class="secure-design-builder">
                    ${level.data.components.map((component, compIndex) => `
                        <div class="component-section">
                            <h4>${component.name}</h4>
                            ${component.options.map((option, optIndex) => `
                                <div class="option-item">
                                    <label style="display: flex; align-items: center; padding: 10px; cursor: pointer;">
                                        <input type="checkbox" 
                                               data-component="${compIndex}" 
                                               data-option="${optIndex}"
                                               onchange="passwordTraining.configureComponent(${compIndex}, ${optIndex}, this.checked)"
                                               ${option.required ? 'checked' : ''}
                                               style="margin-right: 10px;">
                                        <div>
                                            <strong>${option.name}</strong>
                                            ${option.required ? '<span style="color: #00ff41; margin-left: 10px;">(Required)</span>' : ''}
                                        </div>
                                    </label>
                                </div>
                            `).join('')}
                        </div>
                    `).join('')}
                    
                    <div class="design-evaluation" id="designEvaluation">
                        <button class="btn btn-success" onclick="passwordTraining.evaluateDesign()">
                            Evaluate Secure System Design
                        </button>
                        <div id="evaluationResult" style="margin-top: 20px;"></div>
                    </div>
                </div>
            </div>
        `;
    }

    configureComponent(compIndex, optIndex, selected) {
        if (!this.levelStates.secure_design.componentsConfigured[compIndex]) {
            this.levelStates.secure_design.componentsConfigured[compIndex] = [];
        }
        
        if (selected) {
            if (!this.levelStates.secure_design.componentsConfigured[compIndex].includes(optIndex)) {
                this.levelStates.secure_design.componentsConfigured[compIndex].push(optIndex);
            }
        } else {
            this.levelStates.secure_design.componentsConfigured[compIndex] = 
                this.levelStates.secure_design.componentsConfigured[compIndex].filter(i => i !== optIndex);
        }
    }

    evaluateDesign() {
        const level = this.levels[this.currentLevelNum];
        let score = 0;
        let maxScore = 0;
        const issues = [];
        
        level.data.components.forEach((component, compIndex) => {
            component.options.forEach((option, optIndex) => {
                maxScore++;
                const isSelected = this.levelStates.secure_design.componentsConfigured[compIndex]?.includes(optIndex) || false;
                
                if (option.required && !isSelected) {
                    issues.push(`Missing required: ${option.name}`);
                } else if (option.required && isSelected) {
                    score++;
                } else if (!option.required && !isSelected) {
                    score++;
                } else if (!option.required && isSelected && (option.name.includes('plain text') || option.name.includes('MD5') || option.name.includes('No protection'))) {
                    issues.push(`Incorrect selection: ${option.name}`);
                } else {
                    score++;
                }
            });
        });
        
        const percentage = Math.round((score / maxScore) * 100);
        const resultDiv = document.getElementById('evaluationResult');
        
        if (percentage >= 90 && issues.length === 0) {
            resultDiv.innerHTML = `
                <div style="color: #00ff41; padding: 20px; background: rgba(0,255,65,0.1); border: 2px solid #00ff41; border-radius: 8px;">
                    <h3>🎉 Excellent! Secure System Design</h3>
                    <p><strong>Score: ${percentage}%</strong></p>
                    <p>You have successfully designed a secure password system with:</p>
                    <ul>
                        <li>Strong password policy</li>
                        <li>Proper password storage (hashing + salting)</li>
                        <li>Attack protection mechanisms</li>
                    </ul>
                    <p><strong>Congratulations! You are now a certified Cyber Security Professional!</strong></p>
                </div>
            `;
            this.levelStates.secure_design.completed = true;
            this.updateProgress(100);
        } else {
            resultDiv.innerHTML = `
                <div style="color: #fbbf24; padding: 20px; background: rgba(251,191,36,0.1); border: 2px solid #fbbf24; border-radius: 8px;">
                    <h3>⚠️ Design Needs Improvement</h3>
                    <p><strong>Score: ${percentage}%</strong></p>
                    ${issues.length > 0 ? `
                        <p><strong>Issues found:</strong></p>
                        <ul>
                            ${issues.map(issue => `<li>${issue}</li>`).join('')}
                        </ul>
                    ` : ''}
                    <p>Review your configuration and ensure all required security measures are enabled.</p>
                </div>
            `;
            this.updateProgress(percentage);
        }
    }
    // Core Game Control Functions

    checkLevel() {
        const level = this.levels[this.currentLevelNum];
        let passed = false;
        let message = '';
        
        switch (level.type) {
            case 'classification':
                const state = this.levelStates.classification;
                const totalQuestions = level.data.passwords.length;
                const answeredAll = Object.keys(state.answers).length === totalQuestions;
                
                if (!answeredAll) {
                    message = 'Please classify all passwords before checking your score.';
                } else if (state.completed) {
                    passed = true;
                    const correctCount = Object.values(state.answers).filter(a => a.correct).length;
                    message = `Excellent! You got ${correctCount}/${totalQuestions} correct (${Math.round((correctCount/totalQuestions)*100)}%).`;
                } else {
                    message = `You need at least 70% accuracy to pass. Try reviewing the security guidelines.`;
                }
                break;
                
            case 'dictionary_attack':
                if (this.levelStates.dictionary_attack.completed) {
                    passed = true;
                    message = 'Great! Your password survived the dictionary attack.';
                } else if (this.levelStates.dictionary_attack.passwordTested) {
                    message = 'Try a password that is not in the common passwords database.';
                } else {
                    message = 'Please test a password against the dictionary attack.';
                }
                break;
                
            case 'brute_force':
                if (this.levelStates.brute_force.completed) {
                    passed = true;
                    message = 'Perfect! You created a password secure against brute force attacks.';
                } else {
                    message = 'Please create a password that takes over 1000 years to crack.';
                }
                break;
                
            case 'character_complexity':
                if (this.levelStates.character_complexity.completed) {
                    passed = true;
                    message = 'Excellent! You used all character types for maximum security.';
                } else {
                    message = 'Please create a password using all 4 character types.';
                }
                break;
                
            case 'hashing_basics':
                if (this.levelStates.hashing_basics.completed) {
                    passed = true;
                    message = 'Excellent! You understand password hashing basics.';
                } else {
                    message = 'Please enter a password to see hashing demonstration.';
                }
                break;
                
            case 'hash_cracking':
                if (this.levelStates.hash_cracking.completed) {
                    passed = true;
                    message = 'Great! You observed how different hash strengths resist cracking.';
                } else {
                    message = 'Please attempt to crack the hashes to observe the differences.';
                }
                break;
                
            case 'salting':
                if (this.levelStates.salting.completed) {
                    passed = true;
                    message = 'Perfect! You understand how salting protects passwords.';
                } else {
                    message = 'Please enter a password to see salting demonstration.';
                }
                break;
                
            case 'rate_limiting':
                if (this.levelStates.rate_limiting.completed) {
                    passed = true;
                    message = 'Excellent! You configured rate limiting and observed its effectiveness.';
                } else {
                    message = 'Please configure rate limiting and run the attack simulation.';
                }
                break;
                
            case 'attack_scenario':
                if (this.levelStates.attack_scenario.completed) {
                    passed = true;
                    message = 'Perfect! You selected the correct defenses for the attack scenario.';
                } else {
                    message = 'Please analyze the logs and select appropriate defenses.';
                }
                break;
                
            case 'secure_design':
                if (this.levelStates.secure_design.completed) {
                    passed = true;
                    message = '🎉 Congratulations! You designed a secure password system!';
                } else {
                    message = 'Please configure all security components and evaluate your design.';
                }
                break;
                
            default:
                const levelType = level.type;
                if (this.levelStates[levelType] && this.levelStates[levelType].completed) {
                    passed = true;
                    message = 'Level completed!';
                } else {
                    message = 'Please complete the level activities.';
                }
        }
        
        if (passed) {
            this.completeLevel();
        } else {
            this.showNotification(message, 'warning');
        }
    }

    completeLevel() {
        // Mark level as completed in training system
        if (!this.gameProgress.completedLevels.includes(this.currentLevelNum)) {
            this.gameProgress.completedLevels.push(this.currentLevelNum);
        }
        
        // Unlock next level
        const nextLevel = this.currentLevelNum + 1;
        if (nextLevel <= 10 && !this.gameProgress.unlockedLevels.includes(nextLevel)) {
            this.gameProgress.unlockedLevels.push(nextLevel);
            this.showNotification(`Level ${nextLevel} unlocked!`, 'success');
        }
        
        // Save progress
        this.saveProgress();
        
        // Update main game progress if available
        if (window.game && window.game.passwordMissions) {
            const mainGameMission = window.game.passwordMissions.find(m => m.level === this.currentLevelNum);
            if (mainGameMission) {
                mainGameMission.completed = true;
                mainGameMission.bestScore = Math.max(mainGameMission.bestScore || 0, 100);
                
                // Unlock next level in main game
                if (nextLevel <= 10) {
                    const nextMainGameMission = window.game.passwordMissions.find(m => m.level === nextLevel);
                    if (nextMainGameMission) {
                        nextMainGameMission.locked = false;
                    }
                }
                
                // Save main game progress
                if (window.game.saveProgress) {
                    window.game.saveProgress();
                }
                
                // Update category progress display
                if (window.game.updateCategoryProgress) {
                    window.game.updateCategoryProgress();
                }
            }
        }
        
        // Show completion message
        this.showNotification(`Level ${this.currentLevelNum} completed!`, 'success');
        
        // Update UI
        document.getElementById('checkBtn').style.display = 'none';
        
        // Only show Continue button if not on final level
        if (this.currentLevelNum < 10) {
            document.getElementById('continueBtn').style.display = 'inline-block';
        } else {
            this.showNotification('🎉 Congratulations! You completed all Password Security training levels!', 'success');
            setTimeout(() => {
                this.showNotification('You are now equipped with essential password security knowledge!', 'info');
            }, 2000);
        }
        
        this.updateProgress(100);
    }

    nextLevel() {
        const nextLevelNum = this.currentLevelNum + 1;
        if (nextLevelNum <= 10 && this.levels[nextLevelNum]) {
            this.startLevel(nextLevelNum);
        } else {
            this.showNotification('No more levels available!', 'info');
            this.backToLevels();
        }
    }

    backToLevels() {
        document.getElementById('gameScreen').style.display = 'none';
        document.getElementById('levelSelection').style.display = 'block';
        this.renderLevelSelection();
        this.resetLevelState();
    }

    updateProgress(percentage) {
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        if (progressFill) progressFill.style.width = `${percentage}%`;
        if (progressText) progressText.textContent = `${Math.round(percentage)}%`;
    }
    // Utility Functions

    formatNumber(num) {
        if (num < 1000) return num.toString();
        if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
        if (num < 1000000000) return (num / 1000000).toFixed(1) + 'M';
        if (num < 1000000000000) return (num / 1000000000).toFixed(1) + 'B';
        if (num < 1000000000000000) return (num / 1000000000000).toFixed(1) + 'T';
        return (num / 1000000000000000).toFixed(1) + 'Q';
    }

    formatTime(seconds) {
        if (seconds < 60) return `${seconds.toFixed(1)} seconds`;
        if (seconds < 3600) return `${(seconds / 60).toFixed(1)} minutes`;
        if (seconds < 86400) return `${(seconds / 3600).toFixed(1)} hours`;
        if (seconds < 31536000) return `${(seconds / 86400).toFixed(1)} days`;
        if (seconds < 31536000000) return `${(seconds / 31536000).toFixed(1)} years`;
        return `${(seconds / 31536000000).toFixed(1)} millennia`;
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.95);
            border: 2px solid ${type === 'success' ? '#00ff41' : type === 'error' ? '#ff006e' : type === 'warning' ? '#fbbf24' : '#00f3ff'};
            color: ${type === 'success' ? '#00ff41' : type === 'error' ? '#ff006e' : type === 'warning' ? '#fbbf24' : '#00f3ff'};
            border-radius: 8px;
            padding: 15px 20px;
            z-index: 1000;
            font-family: 'Courier New', monospace;
            max-width: 300px;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.5);
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        }, 3000);
    }

    exitGame() {
        // Clean up
        if (window.passwordTraining) {
            delete window.passwordTraining;
        }
        
        // Remove styles
        const styles = document.getElementById('password-security-styles');
        if (styles) {
            styles.remove();
        }
        
        // Clear container
        this.container.innerHTML = '';
        
        // Return to password missions screen using the main game's navigation
        if (window.game && window.game.showCategoryMissions) {
            window.game.showCategoryMissions('password');
        } else {
            // Fallback: try to show password missions screen directly
            const passwordMissionsScreen = document.getElementById('password-missions');
            const gameScreen = document.getElementById('game-screen');
            
            if (passwordMissionsScreen && gameScreen) {
                gameScreen.style.display = 'none';
                gameScreen.classList.remove('active');
                passwordMissionsScreen.style.display = 'flex';
                passwordMissionsScreen.classList.add('active');
            }
        }
        
        console.log('🔐 Password Security Training System exited');
    }
}

// Add CSS animations
const animationStyles = document.createElement('style');
animationStyles.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(animationStyles);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PasswordTrainingSystem };
}