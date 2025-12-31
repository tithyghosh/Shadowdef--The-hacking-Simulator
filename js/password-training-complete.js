// Password Training System - Complete Implementation
// This file contains the complete password training system logic

// Password Training Game State
let passwordGameState = {
    currentLevel: 1,
    unlockedLevels: [1],
    completedLevels: [],
    levelStates: {
        classification: { answers: {}, completed: false },
        lengthDemo: { targetMet: false, completed: false },
        character_builder: { completed: false, password: '', score: 0, typesUsed: 0 },
        dictionary_test: { completed: false, password: '', securityScore: 0, survived: false }
    }
};

// Password Training Levels Data
const passwordLevels = {
    1: {
        title: "Password Basics",
        topic: "Weak vs Strong Passwords",
        description: "Learn to identify weak and strong passwords based on cybersecurity principles",
        objective: "Classify passwords as weak or strong - achieve 70% accuracy to pass",
        type: "classification",
        data: {
            passwords: [
                { text: "123456", correct: "weak", reason: "Sequential numbers - easily guessed by attackers" },
                { text: "P@ssw0rd2024!", correct: "strong", reason: "Long with mixed characters, numbers, and symbols" },
                { text: "password", correct: "weak", reason: "Common dictionary word - vulnerable to dictionary attacks" },
                { text: "qwerty", correct: "weak", reason: "Keyboard pattern - predictable sequence" },
                { text: "Tr0ub4dor&3", correct: "strong", reason: "Good length with character variety and symbols" },
                { text: "admin", correct: "weak", reason: "Too short and extremely common - high attack risk" }
            ]
        }
    },
    2: {
        title: "Password Length Impact",
        topic: "Password Length vs Security",
        description: "Visualize how longer passwords exponentially increase resistance to attacks",
        objective: "Use the slider to reach the target length and understand security scaling",
        type: "length_demo",
        data: {
            minLength: 4,
            maxLength: 20,
            targetLength: 12,
            charset: 95,
            attackSpeed: 1000000000 // 1 billion attempts per second
        }
    },
    3: {
        title: "Character Complexity",
        topic: "Letters, Numbers, and Symbols",
        description: "Compare passwords with different character sets and see security improvements",
        objective: "Build a password using all 4 character types for maximum security",
        type: "character_builder",
        data: {
            requiredTypes: ['lowercase', 'uppercase', 'numbers', 'symbols'],
            minLength: 8,
            targetScore: 100
        }
    },
    4: {
        title: "Dictionary Attack Defense",
        topic: "Dictionary Attacks (Simulated)",
        description: "Test passwords against a simulated dictionary attack to see how quickly common passwords are cracked",
        objective: "Create a password that survives the dictionary attack simulation",
        type: "dictionary_test",
        data: {
            commonPasswords: [
                "password", "123456", "password123", "admin", "qwerty", "letmein", 
                "welcome", "monkey", "1234567890", "abc123", "Password1", "iloveyou",
                "princess", "rockyou", "12345678", "sunshine", "football", "charlie",
                "aa123456", "donald", "password1", "qwerty123"
            ],
            commonWords: [
                "love", "hate", "good", "bad", "home", "work", "family", "friend",
                "happy", "sad", "computer", "internet", "email", "phone", "money",
                "time", "life", "world", "people", "water", "food", "music", "game"
            ],
            commonPatterns: [
                /^[a-z]+$/,           // all lowercase
                /^[A-Z]+$/,           // all uppercase  
                /^\d+$/,              // all numbers
                /^[a-z]+\d+$/,        // word + numbers
                /^\d+[a-z]+$/,        // numbers + word
                /^[a-z]+\d{1,4}$/,    // word + 1-4 digits
                /^(19|20)\d{2}$/,     // years
                /^(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])$/  // dates
            ],
            minSecurityScore: 60,
            maxAttempts: 1000000
        }
    },
    5: {
        title: "Pattern Recognition",
        topic: "Predictable Patterns",
        description: "Show why patterns like 123, abc, or qwerty are insecure against pattern attacks",
        objective: "Identify common password patterns and understand their vulnerabilities",
        type: "demo",
        data: {}
    },
    6: {
        title: "Brute Force Simulation",
        topic: "Brute Force Time Estimation",
        description: "Visually estimate cracking time based on password strength - no real brute force code",
        objective: "Create a password that takes over 1000 years to crack with brute force",
        type: "demo",
        data: {}
    },
    7: {
        title: "Password Reuse Risk",
        topic: "Credential Reuse",
        description: "Demonstrate how one leaked password affects multiple accounts",
        objective: "Understand the cascade effect of password reuse in data breaches",
        type: "demo",
        data: {}
    },
    8: {
        title: "Phishing Detection",
        topic: "Fake Login Detection",
        description: "Identify phishing pages and deceptive messages to protect credentials",
        objective: "Achieve 80% accuracy in identifying phishing attempts",
        type: "demo",
        data: {}
    },
    9: {
        title: "Hashing & Salting",
        topic: "Secure Password Storage",
        description: "Visually explain hashing and salting - no cryptographic implementation",
        objective: "Understand how passwords should be stored securely by systems",
        type: "demo",
        data: {}
    },
    10: {
        title: "Multi-Factor Authentication",
        topic: "Defense Mechanisms",
        description: "Learn about additional security layers beyond passwords",
        objective: "Set up multiple authentication factors for maximum security",
        type: "demo",
        data: {}
    }
};

// Main Password Training Functions
function showPasswordTraining() {
    console.log('🔐 Showing password training...');
    
    // Try to use game screen manager first
    if (window.game && window.game.screens && typeof window.game.screens.showScreen === 'function') {
        window.game.screens.showScreen('password-missions');
    } else {
        // Fallback to direct screen switching
        console.log('🔄 Using fallback screen switching for password training');
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => {
            screen.classList.remove('active');
            screen.style.display = 'none';
        });
        
        const passwordScreen = document.getElementById('password-missions');
        if (passwordScreen) {
            passwordScreen.classList.add('active');
            passwordScreen.style.display = 'block';
            console.log('✅ Password training screen shown');
        } else {
            console.error('❌ Password training screen not found');
            return;
        }
    }
    
    // Ensure the level selection is visible and game screen is hidden
    const levelSelection = document.getElementById('passwordLevelSelection');
    const gameScreen = document.getElementById('passwordGameScreen');
    
    if (levelSelection) {
        levelSelection.style.display = 'block';
        console.log('✅ Level selection screen shown');
    } else {
        console.error('❌ Level selection screen not found');
    }
    
    if (gameScreen) {
        gameScreen.style.display = 'none';
    }
    
    renderPasswordLevels();
}

function renderPasswordLevels() {
    console.log('🎯 Rendering password levels...');
    const grid = document.getElementById('passwordLevelsGrid');
    if (!grid) {
        console.error('❌ Password levels grid not found!');
        return;
    }
    
    console.log('✅ Found password levels grid, clearing and populating...');
    grid.innerHTML = '';
    
    for (let i = 1; i <= 10; i++) {
        const level = passwordLevels[i];
        if (!level) {
            console.error(`❌ Level ${i} not found in passwordLevels`);
            continue;
        }
        
        const isUnlocked = passwordGameState.unlockedLevels.includes(i);
        const isCompleted = passwordGameState.completedLevels.includes(i);

        const card = document.createElement('div');
        card.className = `password-level-card ${isCompleted ? 'completed' : (isUnlocked ? 'unlocked' : 'locked')}`;
        
        if (isUnlocked) {
            card.onclick = () => startPasswordLevel(i);
        }

        let statusText, statusIcon;
        if (isCompleted) {
            statusText = 'Completed';
            statusIcon = '<span class="password-status-icon password-completed-icon">✓</span>';
        } else if (isUnlocked) {
            statusText = 'Available';
            statusIcon = '<span class="password-status-icon password-play-icon">▶</span>';
        } else {
            statusText = 'Locked';
            statusIcon = '<span class="password-status-icon password-lock-icon">🔒</span>';
        }

        card.innerHTML = `
            <div class="password-level-number">Level ${i}</div>
            <div class="password-level-title">${level.title}</div>
            <div class="password-level-topic">${level.topic}</div>
            <div class="password-level-description">${level.description}</div>
            <div class="password-level-status">
                <span class="password-status-text">${statusText}</span>
                ${statusIcon}
            </div>
        `;

        grid.appendChild(card);
    }
    
    console.log(`✅ Rendered ${grid.children.length} password levels`);
}

function startPasswordLevel(levelNum) {
    if (!passwordGameState.unlockedLevels.includes(levelNum)) {
        showPasswordNotification('This level is locked! Complete previous levels first.', 'error');
        return;
    }

    passwordGameState.currentLevel = levelNum;
    const level = passwordLevels[levelNum];

    // Switch to game screen
    document.getElementById('passwordLevelSelection').style.display = 'none';
    document.getElementById('passwordGameScreen').style.display = 'flex';

    // Update header
    document.getElementById('passwordCurrentLevel').textContent = `Level ${levelNum}: ${level.title}`;
    document.getElementById('passwordLevelObjective').textContent = level.objective;
    document.getElementById('passwordProgressFill').style.width = '0%';
    document.getElementById('passwordProgressText').textContent = '0%';

    // Load level content
    loadPasswordLevelContent(level);

    // Show check button, hide continue button
    document.getElementById('passwordCheckBtn').style.display = 'inline-block';
    document.getElementById('passwordContinueBtn').style.display = 'none';
}

function loadPasswordLevelContent(level) {
    const content = document.getElementById('passwordGameContent');
    
    switch (level.type) {
        case 'classification':
            renderPasswordClassification(content, level);
            break;
        case 'length_demo':
            renderPasswordLengthDemo(content, level);
            break;
        case 'character_builder':
            renderCharacterBuilder(content, level);
            break;
        case 'dictionary_test':
            renderDictionaryTest(content, level);
            break;
        default:
            content.innerHTML = `
                <div class="password-instruction-panel">
                    <h3>🎯 ${level.title}</h3>
                    <p>${level.description}</p>
                    <p><strong>Objective:</strong> ${level.objective}</p>
                    <div style="text-align: center; margin-top: 30px;">
                        <button class="btn btn-success" onclick="completePasswordDemo()">Complete Demo Level</button>
                    </div>
                </div>
            `;
    }
}

// Level-specific rendering functions
function renderPasswordClassification(container, level) {
    container.innerHTML = `
        <div class="password-instruction-panel">
            <h3>🎯 Mission: Password Security Assessment</h3>
            <p>As a cybersecurity analyst, classify each password as WEAK or STRONG based on security principles.</p>
            <div style="background: rgba(0, 255, 65, 0.1); border: 1px solid #00ff41; border-radius: 8px; padding: 15px; margin-top: 15px;">
                <h4 style="color: #00ff41; margin-bottom: 10px;">Security Guidelines:</h4>
                <ul style="color: #9ca3af; padding-left: 20px;">
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
                    </div>
                    <div style="margin: 10px 0; font-size: 0.9rem; color: #9ca3af; text-align: center;">
                        Length: ${pwd.text.length} characters
                    </div>
                    <div class="password-classification-buttons">
                        <button class="password-classify-btn password-weak-btn" onclick="selectPasswordClassification(${index}, 'weak')" id="weak-btn-${index}">
                            🚨 WEAK
                        </button>
                        <button class="password-classify-btn password-strong-btn" onclick="selectPasswordClassification(${index}, 'strong')" id="strong-btn-${index}">
                            🛡️ STRONG
                        </button>
                    </div>
                    <div class="password-feedback-area" id="passwordFeedback-${index}"></div>
                </div>
            `).join('')}
        </div>
        
        <div class="password-score-panel">
            <div class="password-score-display">
                <span class="password-score-label">Progress:</span>
                <span class="password-score-value" id="passwordClassificationScore">0 / ${level.data.passwords.length}</span>
                <span class="password-score-percentage" id="passwordScorePercentage">(0%)</span>
            </div>
            <div style="color: #9ca3af; font-size: 0.9rem; margin-bottom: 20px;">
                Select your classification for each password, then submit your answers.
            </div>
            
            <div class="password-submit-section">
                <button class="password-submit-btn" onclick="submitPasswordClassification()" id="passwordSubmitBtn" disabled>
                    Submit Classifications
                </button>
                <div style="margin-top: 10px; color: #9ca3af; font-size: 0.9rem;">
                    Need 70% accuracy to pass (${Math.ceil(level.data.passwords.length * 0.7)} correct)
                </div>
            </div>
        </div>
    `;
}

function renderPasswordLengthDemo(container, level) {
    container.innerHTML = `
        <div class="password-instruction-panel">
            <h3>🎯 Mission: Password Length Security Analysis</h3>
            <p>Analyze how password length exponentially increases resistance to brute force attacks.</p>
            <div style="background: rgba(0, 243, 255, 0.1); border: 1px solid #00f3ff; border-radius: 8px; padding: 15px; margin-top: 15px;">
                <p><strong>Brute Force Attack:</strong> Systematically trying every possible password combination until the correct one is found.</p>
            </div>
        </div>
        
        <div class="password-length-demo">
            <div class="password-slider-section">
                <label class="password-slider-label">
                    Password Length: <span id="passwordLengthValue">8</span> characters
                </label>
                <input type="range" class="password-length-slider" id="passwordLengthSlider" 
                       min="${level.data.minLength}" max="${level.data.maxLength}" 
                       value="8" oninput="updatePasswordLengthDemo(this.value)">
            </div>
            
            <div class="password-security-metrics">
                <div class="password-metric-card">
                    <div class="password-metric-icon">🔢</div>
                    <div class="password-metric-label">Possible Combinations</div>
                    <div class="password-metric-value" id="passwordCombinations">0</div>
                </div>
                
                <div class="password-metric-card">
                    <div class="password-metric-icon">⏱️</div>
                    <div class="password-metric-label">Time to Crack (Average)</div>
                    <div class="password-metric-value" id="passwordCrackTime">0 seconds</div>
                </div>
                
                <div class="password-metric-card">
                    <div class="password-metric-icon">🎯</div>
                    <div class="password-metric-label">Security Level</div>
                    <div class="password-metric-value" id="passwordSecurityLevel">Weak</div>
                </div>
            </div>
            
            <div class="password-target-indicator">
                <div class="password-target-text" id="passwordLengthTarget">
                    🎯 Target: Reach ${level.data.targetLength}+ characters for strong security
                </div>
            </div>
            
            <div class="password-submit-section">
                <button class="password-submit-btn" onclick="submitPasswordLengthDemo()" id="passwordLengthSubmitBtn" disabled>
                    Submit Length Analysis
                </button>
            </div>
        </div>
    `;
    
    updatePasswordLengthDemo(8);
}

function renderCharacterBuilder(container, level) {
    container.innerHTML = `
        <div class="password-instruction-panel">
            <h3>🎯 Mission: Build a Secure Password</h3>
            <p>Create a password that uses all 4 character types to maximize security. Watch how each character type increases your password strength!</p>
            
            <div style="background: rgba(0, 255, 65, 0.1); border: 1px solid #00ff41; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
                <h4 style="color: #00ff41; margin-bottom: 10px;">Character Types Required:</h4>
                <div class="character-type-requirements" id="characterTypeRequirements">
                    <div class="char-type-item" id="lowercase-req">
                        <span class="char-type-icon">❌</span>
                        <span class="char-type-label">Lowercase letters (a-z)</span>
                        <span class="char-type-example">Example: hello</span>
                    </div>
                    <div class="char-type-item" id="uppercase-req">
                        <span class="char-type-icon">❌</span>
                        <span class="char-type-label">Uppercase letters (A-Z)</span>
                        <span class="char-type-example">Example: HELLO</span>
                    </div>
                    <div class="char-type-item" id="numbers-req">
                        <span class="char-type-icon">❌</span>
                        <span class="char-type-label">Numbers (0-9)</span>
                        <span class="char-type-example">Example: 123</span>
                    </div>
                    <div class="char-type-item" id="symbols-req">
                        <span class="char-type-icon">❌</span>
                        <span class="char-type-label">Symbols (!@#$%^&*)</span>
                        <span class="char-type-example">Example: !@#</span>
                    </div>
                </div>
            </div>
            
            <div class="password-builder-section">
                <label for="passwordBuilder" style="display: block; margin-bottom: 10px; color: #00f3ff; font-weight: bold;">
                    Build Your Password:
                </label>
                <input type="text" 
                       id="passwordBuilder" 
                       class="password-builder-input" 
                       placeholder="Start typing your secure password..."
                       oninput="analyzePasswordBuilder()"
                       style="width: 100%; padding: 15px; font-size: 1.1rem; border: 2px solid #374151; border-radius: 8px; background: rgba(0, 0, 0, 0.7); color: #e0e6ed; font-family: 'Courier New', monospace;">
            </div>
            
            <div class="password-strength-analysis" id="passwordStrengthAnalysis">
                <div class="strength-meter">
                    <div class="strength-label">Password Strength:</div>
                    <div class="strength-bar">
                        <div class="strength-fill" id="strengthFill" style="width: 0%; background: #ff006e;"></div>
                    </div>
                    <div class="strength-score" id="strengthScore">0/100</div>
                </div>
                
                <div class="character-breakdown" id="characterBreakdown">
                    <div class="breakdown-item">
                        <span class="breakdown-label">Length:</span>
                        <span class="breakdown-value" id="lengthValue">0 characters</span>
                    </div>
                    <div class="breakdown-item">
                        <span class="breakdown-label">Character Types:</span>
                        <span class="breakdown-value" id="typesValue">0/4 types</span>
                    </div>
                    <div class="breakdown-item">
                        <span class="breakdown-label">Estimated Crack Time:</span>
                        <span class="breakdown-value" id="crackTimeValue">Instant</span>
                    </div>
                </div>
            </div>
            
            <div class="password-submit-section">
                <button class="password-submit-btn" onclick="submitCharacterBuilder()" id="characterBuilderSubmitBtn" disabled>
                    Submit Password
                </button>
            </div>
        </div>
    `;
    
    // Initialize the analysis
    analyzePasswordBuilder();
}

function renderDictionaryTest(container, level) {
    container.innerHTML = `
        <div class="password-instruction-panel">
            <h3>🎯 Mission: Dictionary Attack Simulation</h3>
            <p>Test your passwords against a simulated dictionary attack. Common passwords and patterns are cracked instantly!</p>
            
            <div style="background: rgba(255, 0, 110, 0.1); border: 1px solid #ff006e; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
                <h4 style="color: #ff006e; margin-bottom: 10px;">⚠️ Dictionary Attack Threats:</h4>
                <ul style="color: #9ca3af; padding-left: 20px;">
                    <li>Common passwords (password, 123456, qwerty)</li>
                    <li>Dictionary words with simple modifications</li>
                    <li>Predictable patterns (word + numbers)</li>
                    <li>Years, dates, and sequential characters</li>
                </ul>
            </div>
            
            <div class="dictionary-test-section">
                <label for="dictionaryPasswordInput" style="display: block; margin-bottom: 10px; color: #00f3ff; font-weight: bold;">
                    Enter Password to Test:
                </label>
                <div class="password-input-container">
                    <input type="text" 
                           id="dictionaryPasswordInput" 
                           class="dictionary-password-input" 
                           placeholder="Enter a password to test against dictionary attack..."
                           oninput="analyzeDictionaryPassword()"
                           style="width: 70%; padding: 15px; font-size: 1.1rem; border: 2px solid #374151; border-radius: 8px; background: rgba(0, 0, 0, 0.7); color: #e0e6ed; font-family: 'Courier New', monospace;">
                    <button class="btn btn-warning" onclick="runDictionaryAttack()" id="dictionaryAttackBtn" style="width: 25%; margin-left: 10px;">
                        🔍 Run Attack
                    </button>
                </div>
            </div>
            
            <div class="dictionary-results" id="dictionaryResults" style="display: none;">
                <div class="attack-simulation" id="attackSimulation">
                    <div class="attack-header">
                        <h4>Dictionary Attack Simulation</h4>
                        <div class="attack-progress">
                            <div class="attack-progress-bar">
                                <div class="attack-progress-fill" id="attackProgressFill"></div>
                            </div>
                            <div class="attack-status" id="attackStatus">Preparing attack...</div>
                        </div>
                    </div>
                    
                    <div class="attack-log" id="attackLog">
                        <!-- Attack attempts will be logged here -->
                    </div>
                    
                    <div class="attack-result" id="attackResult">
                        <!-- Final result will be shown here -->
                    </div>
                </div>
            </div>
            
            <div class="dictionary-examples" style="margin-top: 20px;">
                <h4 style="color: #00f3ff; margin-bottom: 15px;">Quick Test Examples:</h4>
                <div class="example-passwords">
                    <button class="example-btn" onclick="testExamplePassword('password')">password</button>
                    <button class="example-btn" onclick="testExamplePassword('123456')">123456</button>
                    <button class="example-btn" onclick="testExamplePassword('qwerty123')">qwerty123</button>
                    <button class="example-btn" onclick="testExamplePassword('MySecure2024!')">MySecure2024!</button>
                </div>
            </div>
            
            <div class="dictionary-submit-section">
                <button class="password-submit-btn" onclick="submitDictionaryTest()" id="dictionarySubmitBtn" disabled>
                    Submit Secure Password
                </button>
            </div>
        </div>
    `;
}

// Password Level Logic Functions
let passwordSelections = {};
let passwordSubmitted = false;

function selectPasswordClassification(index, choice) {
    // Store the selection
    passwordSelections[index] = choice;
    
    // Update button states
    const weakBtn = document.getElementById(`weak-btn-${index}`);
    const strongBtn = document.getElementById(`strong-btn-${index}`);
    
    // Reset both buttons
    weakBtn.style.background = 'transparent';
    strongBtn.style.background = 'transparent';
    
    // Highlight selected button
    if (choice === 'weak') {
        weakBtn.style.background = '#ff006e';
        weakBtn.style.color = '#0a0e27';
    } else {
        strongBtn.style.background = '#00ff41';
        strongBtn.style.color = '#0a0e27';
    }
    
    updatePasswordSelectionProgress();
}

function updatePasswordSelectionProgress() {
    const level = passwordLevels[passwordGameState.currentLevel];
    const totalQuestions = level.data.passwords.length;
    const selectedCount = Object.keys(passwordSelections).length;
    
    document.getElementById('passwordClassificationScore').textContent = `${selectedCount} / ${totalQuestions}`;
    document.getElementById('passwordScorePercentage').textContent = `(${Math.round((selectedCount/totalQuestions)*100)}%)`;
    
    // Enable submit button when all passwords are classified
    const submitBtn = document.getElementById('passwordSubmitBtn');
    if (selectedCount === totalQuestions && !passwordSubmitted) {
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
    } else {
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.5';
    }
    
    updatePasswordProgress((selectedCount / totalQuestions) * 50); // 50% for selection, 50% for submission
}

function submitPasswordClassification() {
    if (passwordSubmitted) return;
    
    const level = passwordLevels[passwordGameState.currentLevel];
    let correctCount = 0;
    
    // Evaluate all answers and show feedback
    level.data.passwords.forEach((pwd, index) => {
        const userChoice = passwordSelections[index];
        const correct = pwd.correct === userChoice;
        
        if (correct) correctCount++;
        
        const card = document.querySelector(`[data-index="${index}"]`);
        const feedback = document.getElementById(`passwordFeedback-${index}`);
        const buttons = card.querySelectorAll('.password-classify-btn');
        
        // Disable buttons
        buttons.forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = '0.6';
        });
        
        // Show feedback
        if (correct) {
            card.style.borderColor = '#00ff41';
            card.style.background = 'rgba(0, 255, 65, 0.1)';
            feedback.innerHTML = `
                <div class="password-feedback correct">
                    <div style="font-size: 1.2rem;">✅</div>
                    <div>
                        <strong>Correct Assessment!</strong><br>
                        <em>${pwd.reason}</em>
                    </div>
                </div>
            `;
        } else {
            card.style.borderColor = '#ff006e';
            card.style.background = 'rgba(255, 0, 110, 0.1)';
            feedback.innerHTML = `
                <div class="password-feedback incorrect">
                    <div style="font-size: 1.2rem;">❌</div>
                    <div>
                        <strong>Incorrect Assessment</strong><br>
                        <em>${pwd.reason}</em>
                    </div>
                </div>
            `;
        }
    });
    
    passwordSubmitted = true;
    const percentage = Math.round((correctCount / level.data.passwords.length) * 100);
    const passed = percentage >= 70;
    
    // Update final score display
    document.getElementById('passwordClassificationScore').textContent = `${correctCount} / ${level.data.passwords.length}`;
    document.getElementById('passwordScorePercentage').textContent = `(${percentage}%)`;
    
    // Update progress to 100%
    updatePasswordProgress(100);
    
    // Store completion state
    passwordGameState.levelStates.classification.completed = passed;
    passwordGameState.levelStates.classification.answers = passwordSelections;
    
    // Disable submit button and hide it
    const submitBtn = document.getElementById('passwordSubmitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitted';
    submitBtn.style.display = 'none';
    
    // Hide the main Check Answer button and show appropriate completion modal
    document.getElementById('passwordCheckBtn').style.display = 'none';
    
    // Show completion modal immediately after feedback is shown
    setTimeout(() => {
        showPasswordCompletionModal(passed, correctCount, level.data.passwords.length, percentage);
    }, 1500);
}

function submitPasswordLengthDemo() {
    const level = passwordLevels[passwordGameState.currentLevel];
    const currentLength = parseInt(document.getElementById('passwordLengthSlider').value);
    const passed = currentLength >= level.data.targetLength;
    
    // Update completion state
    passwordGameState.levelStates.lengthDemo.completed = passed;
    passwordGameState.levelStates.lengthDemo.targetMet = passed;
    
    // Disable submit button and hide it
    const submitBtn = document.getElementById('passwordLengthSubmitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitted';
    submitBtn.style.display = 'none';
    
    // Hide the main Check Answer button
    document.getElementById('passwordCheckBtn').style.display = 'none';
    
    // Update progress to 100%
    updatePasswordProgress(100);
    
    // Show completion modal immediately
    setTimeout(() => {
        showPasswordCompletionModal(passed, currentLength, level.data.targetLength, null, 'length');
    }, 500);
}

function updatePasswordLengthDemo(length) {
    const level = passwordLevels[passwordGameState.currentLevel];
    const charset = level.data.charset;
    const combinations = Math.pow(charset, length);
    const attemptsPerSecond = level.data.attackSpeed;
    const secondsToCrack = combinations / (2 * attemptsPerSecond);
    
    document.getElementById('passwordLengthValue').textContent = length;
    document.getElementById('passwordCombinations').textContent = formatPasswordNumber(combinations);
    document.getElementById('passwordCrackTime').textContent = formatPasswordTime(secondsToCrack);
    
    // Update security level
    let securityLevel, color;
    if (length < 8) {
        securityLevel = 'Very Weak';
        color = '#ff006e';
    } else if (length < 10) {
        securityLevel = 'Weak';
        color = '#fbbf24';
    } else if (length < 12) {
        securityLevel = 'Moderate';
        color = '#60a5fa';
    } else if (length < 16) {
        securityLevel = 'Strong';
        color = '#00ff41';
    } else {
        securityLevel = 'Excellent';
        color = '#00ff41';
    }
    
    document.getElementById('passwordSecurityLevel').textContent = securityLevel;
    document.getElementById('passwordSecurityLevel').style.color = color;
    
    const targetMet = length >= level.data.targetLength;
    const target = document.getElementById('passwordLengthTarget');
    const submitBtn = document.getElementById('passwordLengthSubmitBtn');
    
    if (targetMet) {
        passwordGameState.levelStates.lengthDemo.targetMet = true;
        passwordGameState.levelStates.lengthDemo.completed = true;
        target.innerHTML = '🎉 Target achieved! Strong password length reached.';
        target.style.color = '#00ff41';
        
        // Enable submit button
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
        }
        
        showPasswordNotification('Excellent! You understand password length security.', 'success');
    } else {
        passwordGameState.levelStates.lengthDemo.targetMet = false;
        passwordGameState.levelStates.lengthDemo.completed = false;
        target.style.color = '#00f3ff';
        target.innerHTML = `🎯 Target: Reach ${level.data.targetLength}+ characters for strong security`;
        
        // Disable submit button
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.5';
        }
    }
    
    const progress = Math.min((length / level.data.targetLength) * 100, 100);
    updatePasswordProgress(progress);
}

function completePasswordDemo() {
    updatePasswordProgress(100);
    showPasswordNotification('Demo level completed!', 'success');
    
    // Mark as completed for demo levels
    const levelType = passwordLevels[passwordGameState.currentLevel].type;
    if (passwordGameState.levelStates[levelType]) {
        passwordGameState.levelStates[levelType].completed = true;
    }
}

// Character Builder Functions
function analyzePasswordBuilder() {
    const password = document.getElementById('passwordBuilder').value;
    const level = passwordLevels[passwordGameState.currentLevel];
    
    // Analyze character types
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSymbols = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    // Update requirement indicators
    updateCharacterTypeIndicator('lowercase-req', hasLowercase);
    updateCharacterTypeIndicator('uppercase-req', hasUppercase);
    updateCharacterTypeIndicator('numbers-req', hasNumbers);
    updateCharacterTypeIndicator('symbols-req', hasSymbols);
    
    // Calculate score
    let score = 0;
    let typesUsed = 0;
    
    // Length scoring (0-40 points)
    const lengthScore = Math.min(password.length * 3, 40);
    score += lengthScore;
    
    // Character type scoring (0-60 points, 15 points each)
    if (hasLowercase) { score += 15; typesUsed++; }
    if (hasUppercase) { score += 15; typesUsed++; }
    if (hasNumbers) { score += 15; typesUsed++; }
    if (hasSymbols) { score += 15; typesUsed++; }
    
    // Update UI
    document.getElementById('lengthValue').textContent = `${password.length} characters`;
    document.getElementById('typesValue').textContent = `${typesUsed}/4 types`;
    document.getElementById('strengthScore').textContent = `${score}/100`;
    
    // Update strength bar
    const strengthFill = document.getElementById('strengthFill');
    strengthFill.style.width = `${score}%`;
    
    // Update color based on score
    let color;
    if (score < 25) {
        color = '#ff006e'; // Red
    } else if (score < 50) {
        color = '#fbbf24'; // Yellow
    } else if (score < 75) {
        color = '#60a5fa'; // Blue
    } else {
        color = '#00ff41'; // Green
    }
    strengthFill.style.background = color;
    
    // Calculate estimated crack time
    const charset = calculateCharsetSize(hasLowercase, hasUppercase, hasNumbers, hasSymbols);
    const combinations = Math.pow(charset, password.length);
    const attemptsPerSecond = 1000000000; // 1 billion attempts per second
    const secondsToCrack = combinations / (2 * attemptsPerSecond);
    
    document.getElementById('crackTimeValue').textContent = formatPasswordTime(secondsToCrack);
    
    // Check if requirements are met
    const allTypesUsed = typesUsed === 4;
    const minLengthMet = password.length >= level.data.minLength;
    const targetScoreMet = score >= level.data.targetScore;
    
    const submitBtn = document.getElementById('characterBuilderSubmitBtn');
    if (allTypesUsed && minLengthMet && targetScoreMet) {
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
        submitBtn.textContent = '🎉 Submit Strong Password';
    } else {
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.5';
        submitBtn.textContent = 'Meet All Requirements First';
    }
    
    // Update progress
    let progress = 0;
    if (minLengthMet) progress += 25;
    if (typesUsed >= 2) progress += 25;
    if (typesUsed >= 3) progress += 25;
    if (allTypesUsed && targetScoreMet) progress += 25;
    
    updatePasswordProgress(progress);
}

function updateCharacterTypeIndicator(elementId, hasType) {
    const element = document.getElementById(elementId);
    const icon = element.querySelector('.char-type-icon');
    
    if (hasType) {
        icon.textContent = '✅';
        element.style.color = '#00ff41';
    } else {
        icon.textContent = '❌';
        element.style.color = '#9ca3af';
    }
}

function calculateCharsetSize(hasLower, hasUpper, hasNumbers, hasSymbols) {
    let size = 0;
    if (hasLower) size += 26;    // a-z
    if (hasUpper) size += 26;    // A-Z
    if (hasNumbers) size += 10;  // 0-9
    if (hasSymbols) size += 32;  // Common symbols
    return Math.max(size, 1);    // Avoid division by zero
}

function submitCharacterBuilder() {
    const password = document.getElementById('passwordBuilder').value;
    const level = passwordLevels[passwordGameState.currentLevel];
    
    // Final validation
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSymbols = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    const allTypesUsed = hasLowercase && hasUppercase && hasNumbers && hasSymbols;
    const minLengthMet = password.length >= level.data.minLength;
    
    let score = 0;
    score += Math.min(password.length * 3, 40);
    if (hasLowercase) score += 15;
    if (hasUppercase) score += 15;
    if (hasNumbers) score += 15;
    if (hasSymbols) score += 15;
    
    const targetScoreMet = score >= level.data.targetScore;
    const passed = allTypesUsed && minLengthMet && targetScoreMet;
    
    // Store completion state
    passwordGameState.levelStates.character_builder = {
        completed: passed,
        password: password,
        score: score,
        typesUsed: [hasLowercase, hasUppercase, hasNumbers, hasSymbols].filter(Boolean).length
    };
    
    // Disable submit button
    const submitBtn = document.getElementById('characterBuilderSubmitBtn');
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.5';
    
    // Update progress to 100%
    updatePasswordProgress(100);
    
    // Show completion modal
    setTimeout(() => {
        showPasswordCompletionModal(passed, score, 100, Math.round((score/100)*100), 'character_builder');
    }, 500);
}

// Dictionary Attack Functions
function analyzeDictionaryPassword() {
    const password = document.getElementById('dictionaryPasswordInput').value;
    const attackBtn = document.getElementById('dictionaryAttackBtn');
    
    if (password.length > 0) {
        attackBtn.disabled = false;
        attackBtn.textContent = '🔍 Run Attack';
    } else {
        attackBtn.disabled = true;
        attackBtn.textContent = '🔍 Run Attack';
    }
}

function testExamplePassword(password) {
    const input = document.getElementById('dictionaryPasswordInput');
    input.value = password;
    analyzeDictionaryPassword();
    runDictionaryAttack();
}

function runDictionaryAttack() {
    const password = document.getElementById('dictionaryPasswordInput').value;
    if (!password) return;
    
    const level = passwordLevels[passwordGameState.currentLevel];
    const resultsDiv = document.getElementById('dictionaryResults');
    const attackLog = document.getElementById('attackLog');
    const attackResult = document.getElementById('attackResult');
    const attackStatus = document.getElementById('attackStatus');
    const progressFill = document.getElementById('attackProgressFill');
    
    // Show results section
    resultsDiv.style.display = 'block';
    attackLog.innerHTML = '';
    attackResult.innerHTML = '';
    
    // Start attack simulation
    attackStatus.textContent = 'Dictionary attack in progress...';
    progressFill.style.width = '0%';
    
    let attempts = 0;
    let cracked = false;
    let crackMethod = '';
    let crackTime = 0;
    
    // Simulate attack with delays for visual effect
    setTimeout(() => {
        // Check against common passwords
        if (level.data.commonPasswords.includes(password.toLowerCase())) {
            cracked = true;
            crackMethod = 'Common Password Database';
            crackTime = Math.random() * 0.1; // Instant crack
            attempts = level.data.commonPasswords.indexOf(password.toLowerCase()) + 1;
        }
        
        progressFill.style.width = '25%';
        attackLog.innerHTML += `<div class="attack-log-entry">🔍 Checking common passwords... (${attempts} attempts)</div>`;
        
        setTimeout(() => {
            if (!cracked) {
                // Check against common words with modifications
                const baseWord = password.toLowerCase().replace(/\d+/g, '').replace(/[!@#$%^&*]/g, '');
                if (level.data.commonWords.includes(baseWord) && baseWord.length > 2) {
                    cracked = true;
                    crackMethod = 'Dictionary Word + Modifications';
                    crackTime = Math.random() * 2 + 0.5; // Quick crack
                    attempts += Math.floor(Math.random() * 1000) + 100;
                }
            }
            
            progressFill.style.width = '50%';
            attackLog.innerHTML += `<div class="attack-log-entry">🔍 Testing dictionary words with modifications... (${attempts} attempts)</div>`;
            
            setTimeout(() => {
                if (!cracked) {
                    // Check against common patterns
                    for (let pattern of level.data.commonPatterns) {
                        if (pattern.test(password)) {
                            cracked = true;
                            crackMethod = 'Pattern Recognition';
                            crackTime = Math.random() * 5 + 1; // Moderate crack time
                            attempts += Math.floor(Math.random() * 5000) + 1000;
                            break;
                        }
                    }
                }
                
                progressFill.style.width = '75%';
                attackLog.innerHTML += `<div class="attack-log-entry">🔍 Analyzing password patterns... (${attempts} attempts)</div>`;
                
                setTimeout(() => {
                    progressFill.style.width = '100%';
                    
                    if (cracked) {
                        attackStatus.textContent = '💥 PASSWORD CRACKED!';
                        attackStatus.style.color = '#ff006e';
                        
                        attackResult.innerHTML = `
                            <div class="attack-result-cracked">
                                <div class="result-header">💥 SECURITY BREACH!</div>
                                <div class="result-details">
                                    <div class="result-item">
                                        <span class="result-label">Crack Method:</span>
                                        <span class="result-value">${crackMethod}</span>
                                    </div>
                                    <div class="result-item">
                                        <span class="result-label">Time to Crack:</span>
                                        <span class="result-value">${crackTime.toFixed(2)} seconds</span>
                                    </div>
                                    <div class="result-item">
                                        <span class="result-label">Attempts:</span>
                                        <span class="result-value">${attempts.toLocaleString()}</span>
                                    </div>
                                </div>
                                <div class="result-advice">
                                    <strong>⚠️ This password is vulnerable!</strong><br>
                                    Try a longer password with mixed characters that doesn't use common words or patterns.
                                </div>
                            </div>
                        `;
                        
                        // Disable submit button
                        document.getElementById('dictionarySubmitBtn').disabled = true;
                        document.getElementById('dictionarySubmitBtn').textContent = 'Password Too Weak';
                        
                    } else {
                        // Password survived the attack
                        const securityScore = calculateDictionarySecurityScore(password);
                        const survived = securityScore >= level.data.minSecurityScore;
                        
                        if (survived) {
                            attackStatus.textContent = '🛡️ PASSWORD SECURE!';
                            attackStatus.style.color = '#00ff41';
                            
                            attackResult.innerHTML = `
                                <div class="attack-result-secure">
                                    <div class="result-header">🛡️ ATTACK DEFENDED!</div>
                                    <div class="result-details">
                                        <div class="result-item">
                                            <span class="result-label">Security Score:</span>
                                            <span class="result-value">${securityScore}/100</span>
                                        </div>
                                        <div class="result-item">
                                            <span class="result-label">Dictionary Attempts:</span>
                                            <span class="result-value">${level.data.maxAttempts.toLocaleString()}</span>
                                        </div>
                                        <div class="result-item">
                                            <span class="result-label">Result:</span>
                                            <span class="result-value">Not Found</span>
                                        </div>
                                    </div>
                                    <div class="result-advice">
                                        <strong>✅ Excellent password security!</strong><br>
                                        Your password successfully resisted dictionary attack methods.
                                    </div>
                                </div>
                            `;
                            
                            // Enable submit button
                            document.getElementById('dictionarySubmitBtn').disabled = false;
                            document.getElementById('dictionarySubmitBtn').textContent = '🎉 Submit Secure Password';
                            
                        } else {
                            attackStatus.textContent = '⚠️ WEAK PASSWORD';
                            attackStatus.style.color = '#fbbf24';
                            
                            attackResult.innerHTML = `
                                <div class="attack-result-weak">
                                    <div class="result-header">⚠️ SECURITY WARNING</div>
                                    <div class="result-details">
                                        <div class="result-item">
                                            <span class="result-label">Security Score:</span>
                                            <span class="result-value">${securityScore}/100 (Need ${level.data.minSecurityScore}+)</span>
                                        </div>
                                    </div>
                                    <div class="result-advice">
                                        <strong>⚠️ Password needs improvement!</strong><br>
                                        While not in common dictionaries, your password could be stronger.
                                    </div>
                                </div>
                            `;
                            
                            document.getElementById('dictionarySubmitBtn').disabled = true;
                            document.getElementById('dictionarySubmitBtn').textContent = 'Improve Password Security';
                        }
                    }
                    
                    attackLog.innerHTML += `<div class="attack-log-entry">✅ Dictionary attack simulation complete</div>`;
                    
                }, 1000);
            }, 1000);
        }, 1000);
    }, 500);
}

function calculateDictionarySecurityScore(password) {
    let score = 0;
    
    // Length bonus
    score += Math.min(password.length * 5, 40);
    
    // Character variety bonus
    if (/[a-z]/.test(password)) score += 10;
    if (/[A-Z]/.test(password)) score += 10;
    if (/[0-9]/.test(password)) score += 10;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 15;
    
    // Uniqueness bonus (not common patterns)
    if (!/^[a-z]+\d+$/.test(password)) score += 5; // Not word+numbers
    if (!/^\d+[a-z]+$/.test(password)) score += 5; // Not numbers+word
    if (!/^(19|20)\d{2}$/.test(password)) score += 5; // Not a year
    
    // Complexity bonus
    if (password.length >= 12) score += 10;
    if (password.length >= 16) score += 5;
    
    return Math.min(score, 100);
}

function submitDictionaryTest() {
    const password = document.getElementById('dictionaryPasswordInput').value;
    const level = passwordLevels[passwordGameState.currentLevel];
    
    const securityScore = calculateDictionarySecurityScore(password);
    const passed = securityScore >= level.data.minSecurityScore;
    
    // Store completion state
    passwordGameState.levelStates.dictionary_test = {
        completed: passed,
        password: password,
        securityScore: securityScore,
        survived: passed
    };
    
    // Disable submit button
    const submitBtn = document.getElementById('dictionarySubmitBtn');
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.5';
    
    // Update progress to 100%
    updatePasswordProgress(100);
    
    // Show completion modal
    setTimeout(() => {
        showPasswordCompletionModal(passed, securityScore, 100, securityScore, 'dictionary_test');
    }, 500);
}

function checkPasswordLevel() {
    const level = passwordLevels[passwordGameState.currentLevel];
    
    switch (level.type) {
        case 'classification':
            // For classification levels, trigger the submit function
            submitPasswordClassification();
            break;
            
        case 'length_demo':
            // For length demo levels, trigger the submit function
            submitPasswordLengthDemo();
            break;
            
        default:
            // For demo levels, complete immediately
            completePasswordDemo();
            setTimeout(() => {
                showPasswordCompletionModal(true, 1, 1, 100, 'demo');
            }, 500);
    }
}

// Completion and Navigation Functions
function showPasswordCompletionModal(passed, score, total, percentage, type = 'classification') {
    const level = passwordLevels[passwordGameState.currentLevel];
    const isLastLevel = passwordGameState.currentLevel === 10;
    
    let title, message, summary;
    
    if (passed) {
        title = '🎉 Level Completed!';
        if (type === 'classification') {
            message = `Excellent work! You correctly classified ${score} out of ${total} passwords (${percentage}%).`;
            summary = `
                <h4>What You Learned:</h4>
                <p>You can now identify weak passwords that are vulnerable to attacks and recognize strong passwords that provide better security. Key factors include length, character variety, and avoiding common patterns.</p>
            `;
        } else if (type === 'length') {
            message = `Perfect! You understand how password length exponentially increases security.`;
            summary = `
                <h4>What You Learned:</h4>
                <p>Password length is one of the most important factors in security. Each additional character exponentially increases the time needed for brute force attacks, making longer passwords significantly more secure.</p>
            `;
        } else if (type === 'character_builder') {
            message = `Outstanding! You created a strong password with a security score of ${score}/100.`;
            summary = `
                <h4>What You Learned:</h4>
                <p>Using all four character types (lowercase, uppercase, numbers, and symbols) dramatically increases password security. Your password combines length and complexity to create a robust defense against cyber attacks.</p>
            `;
        } else if (type === 'dictionary_test') {
            message = `Excellent! Your password achieved a security score of ${score}/100 and survived the dictionary attack.`;
            summary = `
                <h4>What You Learned:</h4>
                <p>Dictionary attacks target common passwords and predictable patterns. By avoiding common words, patterns, and using complex character combinations, you've created a password that resists these automated attacks.</p>
            `;
        } else {
            message = 'Great job completing this cybersecurity training level!';
            summary = `
                <h4>What You Learned:</h4>
                <p>You've gained valuable knowledge about password security principles that will help protect you and others from cyber attacks.</p>
            `;
        }
        
        // Mark level as completed and unlock next level
        if (!passwordGameState.completedLevels.includes(passwordGameState.currentLevel)) {
            passwordGameState.completedLevels.push(passwordGameState.currentLevel);
        }
        
        // Unlock next level
        const nextLevel = passwordGameState.currentLevel + 1;
        if (nextLevel <= 10 && !passwordGameState.unlockedLevels.includes(nextLevel)) {
            passwordGameState.unlockedLevels.push(nextLevel);
        }
        
    } else {
        title = '📚 Keep Learning!';
        if (type === 'classification') {
            message = `You got ${score} out of ${total} correct (${percentage}%). You need 70% to pass.`;
            summary = `
                <h4>Try Again:</h4>
                <p>Review the security guidelines and try to identify what makes passwords weak or strong. Consider factors like length, character variety, and common patterns.</p>
            `;
        } else if (type === 'character_builder') {
            message = `Your password scored ${score}/100. You need all 4 character types and a score of 100 to pass.`;
            summary = `
                <h4>Try Again:</h4>
                <p>Make sure your password includes lowercase letters, uppercase letters, numbers, and symbols. Aim for at least 8 characters with good variety to maximize security.</p>
            `;
        } else if (type === 'dictionary_test') {
            message = `Your password scored ${score}/100. You need a security score of 60+ to resist dictionary attacks.`;
            summary = `
                <h4>Try Again:</h4>
                <p>Avoid common words, predictable patterns, and simple modifications. Create a longer password with mixed character types that doesn't follow common patterns.</p>
            `;
        } else {
            message = 'You need to meet the target requirement to pass this level.';
            summary = `
                <h4>Try Again:</h4>
                <p>Adjust the settings to meet the security requirements and learn more about this cybersecurity concept.</p>
            `;
        }
    }
    
    const modal = document.createElement('div');
    modal.className = 'password-completion-modal';
    modal.innerHTML = `
        <div class="password-completion-content">
            <div class="password-completion-title">${title}</div>
            <div class="password-completion-message">${message}</div>
            <div class="password-completion-summary">${summary}</div>
            <div class="password-completion-buttons">
                ${passed && !isLastLevel ? `
                    <button class="password-completion-btn primary" onclick="continueToNextPasswordLevel()">
                        Continue to Next Level
                    </button>
                ` : ''}
                ${passed && isLastLevel ? `
                    <button class="password-completion-btn primary" onclick="closePasswordCompletionModal()">
                        🎉 Training Complete!
                    </button>
                ` : ''}
                ${!passed ? `
                    <button class="password-completion-btn primary" onclick="retryPasswordLevel()">
                        Try Again
                    </button>
                ` : ''}
                <button class="password-completion-btn secondary" onclick="closePasswordCompletionModal()">
                    Back to Levels
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Store modal reference
    window.currentPasswordModal = modal;
}

function continueToNextPasswordLevel() {
    closePasswordCompletionModal();
    const nextLevelNum = passwordGameState.currentLevel + 1;
    if (nextLevelNum <= 10 && passwordLevels[nextLevelNum]) {
        resetPasswordLevelState();
        startPasswordLevel(nextLevelNum);
    }
}

function retryPasswordLevel() {
    closePasswordCompletionModal();
    resetPasswordLevelState();
    startPasswordLevel(passwordGameState.currentLevel);
}

function closePasswordCompletionModal() {
    if (window.currentPasswordModal) {
        document.body.removeChild(window.currentPasswordModal);
        window.currentPasswordModal = null;
    }
}

function resetPasswordLevelState() {
    // Reset all level-specific state
    passwordSelections = {};
    passwordSubmitted = false;
    passwordGameState.levelStates = {
        classification: { answers: {}, completed: false },
        lengthDemo: { targetMet: false, completed: false },
        character_builder: { completed: false, password: '', score: 0, typesUsed: 0 },
        dictionary_test: { completed: false, password: '', securityScore: 0, survived: false }
    };
    
    // Reset UI elements
    const checkBtn = document.getElementById('passwordCheckBtn');
    const continueBtn = document.getElementById('passwordContinueBtn');
    
    if (checkBtn) {
        checkBtn.style.display = 'inline-block';
    }
    if (continueBtn) {
        continueBtn.style.display = 'none';
    }
}

function completePasswordLevel() {
    // Mark level as completed
    if (!passwordGameState.completedLevels.includes(passwordGameState.currentLevel)) {
        passwordGameState.completedLevels.push(passwordGameState.currentLevel);
    }
    
    // Unlock next level
    const nextLevel = passwordGameState.currentLevel + 1;
    if (nextLevel <= 10 && !passwordGameState.unlockedLevels.includes(nextLevel)) {
        passwordGameState.unlockedLevels.push(nextLevel);
        showPasswordNotification(`Level ${nextLevel} unlocked!`, 'success');
    }
    
    // Update main game progress
    if (window.game && window.game.passwordMissions) {
        const mainGameMission = window.game.passwordMissions.find(m => m.level === passwordGameState.currentLevel);
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
    showPasswordNotification(`Level ${passwordGameState.currentLevel} completed!`, 'success');
    
    // Update UI
    document.getElementById('passwordCheckBtn').style.display = 'none';
    
    // Only show Continue button if not on final level
    if (passwordGameState.currentLevel < 10) {
        document.getElementById('passwordContinueBtn').style.display = 'inline-block';
    } else {
        showPasswordNotification('🎉 Congratulations! You completed all Password Security training levels!', 'success');
        setTimeout(() => {
            showPasswordNotification('You are now equipped with essential password security knowledge!', 'info');
        }, 2000);
    }
    
    updatePasswordProgress(100);
}

function nextPasswordLevel() {
    const nextLevelNum = passwordGameState.currentLevel + 1;
    if (nextLevelNum <= 10 && passwordLevels[nextLevelNum]) {
        // Reset level states
        passwordGameState.levelStates = {
            classification: { answers: {}, completed: false },
            lengthDemo: { targetMet: false, completed: false },
            character_builder: { completed: false, password: '', score: 0, typesUsed: 0 },
            dictionary_test: { completed: false, password: '', securityScore: 0, survived: false }
        };
        startPasswordLevel(nextLevelNum);
    } else {
        showPasswordNotification('No more levels available!', 'info');
        backToPasswordLevels();
    }
}

function backToPasswordLevels() {
    document.getElementById('passwordGameScreen').style.display = 'none';
    document.getElementById('passwordLevelSelection').style.display = 'block';
    renderPasswordLevels();
    
    // Reset level states
    passwordGameState.levelStates = {
        classification: { answers: {}, completed: false },
        lengthDemo: { targetMet: false, completed: false },
        character_builder: { completed: false, password: '', score: 0, typesUsed: 0 },
        dictionary_test: { completed: false, password: '', securityScore: 0, survived: false }
    };
}

function updatePasswordProgress(percentage) {
    const progressFill = document.getElementById('passwordProgressFill');
    const progressText = document.getElementById('passwordProgressText');
    
    if (progressFill) progressFill.style.width = `${percentage}%`;
    if (progressText) progressText.textContent = `${Math.round(percentage)}%`;
}

// Utility Functions
function formatPasswordNumber(num) {
    if (num < 1000) return num.toString();
    if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
    if (num < 1000000000) return (num / 1000000).toFixed(1) + 'M';
    if (num < 1000000000000) return (num / 1000000000).toFixed(1) + 'B';
    if (num < 1000000000000000) return (num / 1000000000000).toFixed(1) + 'T';
    return (num / 1000000000000000).toFixed(1) + 'Q';
}

function formatPasswordTime(seconds) {
    if (seconds < 60) return `${seconds.toFixed(1)} seconds`;
    if (seconds < 3600) return `${(seconds / 60).toFixed(1)} minutes`;
    if (seconds < 86400) return `${(seconds / 3600).toFixed(1)} hours`;
    if (seconds < 31536000) return `${(seconds / 86400).toFixed(1)} days`;
    if (seconds < 31536000000) return `${(seconds / 31536000).toFixed(1)} years`;
    return `${(seconds / 31536000000).toFixed(1)} millennia`;
}

function showPasswordNotification(message, type = 'info') {
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
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

// Make functions globally available
window.showPasswordTraining = showPasswordTraining;
window.startPasswordLevel = startPasswordLevel;
window.selectPasswordClassification = selectPasswordClassification;
window.updatePasswordLengthDemo = updatePasswordLengthDemo;
window.completePasswordDemo = completePasswordDemo;
window.checkPasswordLevel = checkPasswordLevel;
window.nextPasswordLevel = nextPasswordLevel;
window.backToPasswordLevels = backToPasswordLevels;
window.submitPasswordClassification = submitPasswordClassification;
window.submitPasswordLengthDemo = submitPasswordLengthDemo;
window.analyzePasswordBuilder = analyzePasswordBuilder;
window.submitCharacterBuilder = submitCharacterBuilder;
window.analyzeDictionaryPassword = analyzeDictionaryPassword;
window.runDictionaryAttack = runDictionaryAttack;
window.testExamplePassword = testExamplePassword;
window.submitDictionaryTest = submitDictionaryTest;
window.continueToNextPasswordLevel = continueToNextPasswordLevel;
window.retryPasswordLevel = retryPasswordLevel;
window.closePasswordCompletionModal = closePasswordCompletionModal;

// Initialize password training system when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔐 Password Training System initialized');
    
    // Ensure password training is available globally
    if (typeof window.showPasswordTraining === 'function') {
        console.log('✅ Password training functions available globally');
    } else {
        console.error('❌ Password training functions not available');
    }
    
    // Add event listener for category selection if not already handled
    if (!window.passwordTrainingEventListenerAdded) {
        document.addEventListener('click', (e) => {
            const categoryCard = e.target.closest('[data-category="password"]');
            if (categoryCard) {
                console.log('🎯 Password category clicked via password training listener');
                e.preventDefault();
                e.stopPropagation();
                showPasswordTraining();
            }
        });
        window.passwordTrainingEventListenerAdded = true;
        console.log('✅ Password training event listener added');
    }
});

// Also initialize when window loads (fallback)
window.addEventListener('load', function() {
    console.log('🔐 Password Training System ready (window load)');
});