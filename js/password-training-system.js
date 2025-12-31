// Password Training System Implementation
let passwordGameState = {
    currentLevel: 1,
    unlockedLevels: [1],
    completedLevels: [],
    levelStates: {
        classification: { answers: {}, completed: false },
        lengthDemo: { targetMet: false, completed: false }
    }
};

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
        type: "demo",
        data: {}
    },
    4: {
        title: "Dictionary Attack Defense",
        topic: "Dictionary Attacks (Simulated)",
        description: "Demonstrate how common passwords fail quickly against dictionary attacks",
        objective: "Test passwords against a simulated dictionary attack database",
        type: "demo",
        data: {}
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
        description: "Secure an account using password + extra verification methods",
        objective: "Set up multiple authentication factors for maximum security",
        type: "demo",
        data: {}
    }
};

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

// Make functions globally available
window.showPasswordTraining = showPasswordTraining;
window.startPasswordLevel = startPasswordLevel;
window.renderPasswordLevels = renderPasswordLevels;
window.loadPasswordLevelContent = loadPasswordLevelContent;
window.renderPasswordClassification = renderPasswordClassification;
window.renderPasswordLengthDemo = renderPasswordLengthDemo;