// Professional Cybersecurity Training System - Password Security Module
let securityTrainingState = {
    currentLevel: 1,
    unlockedLevels: [1],
    completedLevels: [],
    traineeProfile: {
        name: "Security Trainee",
        rank: "Junior Analyst",
        totalScore: 0,
        sessionTime: 0,
        startTime: Date.now()
    },
    levelStates: {
        password_awareness: { completed: false, score: 0, attempts: 0 },
        dictionary_attack: { completed: false, score: 0, attempts: 0 },
        brute_force: { completed: false, score: 0, attempts: 0 },
        complexity_analysis: { completed: false, score: 0, attempts: 0 },
        hashing_basics: { completed: false, score: 0, attempts: 0 },
        hash_cracking: { completed: false, score: 0, attempts: 0 },
        salting_defense: { completed: false, score: 0, attempts: 0 },
        rate_limiting: { completed: false, score: 0, attempts: 0 },
        attack_scenario: { completed: false, score: 0, attempts: 0 },
        system_design: { completed: false, score: 0, attempts: 0 }
    }
};

const securityLevels = {
    1: {
        title: "Password Awareness Assessment",
        category: "FUNDAMENTALS",
        description: "Analyze password strength and identify security vulnerabilities in common authentication practices",
        objective: "Classify 10 passwords as SECURE or VULNERABLE based on cybersecurity standards",
        difficulty: "BEGINNER",
        type: "password_awareness",
        timeLimit: 300, // 5 minutes
        passingScore: 80,
        data: {
            passwords: [
                { 
                    text: "admin", 
                    classification: "VULNERABLE", 
                    vulnerabilities: ["Too short (5 chars)", "Common default password", "No complexity"],
                    riskLevel: "CRITICAL"
                },
                { 
                    text: "P@ssw0rd2024!", 
                    classification: "SECURE", 
                    strengths: ["14 characters", "Mixed case", "Numbers", "Symbols", "Not in common lists"],
                    riskLevel: "LOW"
                },
                { 
                    text: "123456789", 
                    classification: "VULNERABLE", 
                    vulnerabilities: ["Sequential numbers", "No letters", "Predictable pattern"],
                    riskLevel: "CRITICAL"
                },
                { 
                    text: "MyDog2023", 
                    classification: "VULNERABLE", 
                    vulnerabilities: ["Dictionary word", "Predictable pattern", "Personal information"],
                    riskLevel: "HIGH"
                },
                { 
                    text: "Tr0ub4dor&3", 
                    classification: "SECURE", 
                    strengths: ["11 characters", "Mixed complexity", "Non-dictionary", "Symbol usage"],
                    riskLevel: "LOW"
                },
                { 
                    text: "password", 
                    classification: "VULNERABLE", 
                    vulnerabilities: ["Most common password", "All lowercase", "Dictionary word"],
                    riskLevel: "CRITICAL"
                },
                { 
                    text: "qwerty123", 
                    classification: "VULNERABLE", 
                    vulnerabilities: ["Keyboard pattern", "Common suffix", "Predictable"],
                    riskLevel: "HIGH"
                },
                { 
                    text: "X9$mK2#vL8@pQ", 
                    classification: "SECURE", 
                    strengths: ["13 characters", "High entropy", "Random pattern", "Strong complexity"],
                    riskLevel: "VERY LOW"
                },
                { 
                    text: "welcome123", 
                    classification: "VULNERABLE", 
                    vulnerabilities: ["Common word", "Sequential numbers", "Lowercase only"],
                    riskLevel: "HIGH"
                },
                { 
                    text: "Cyber$ec2024!", 
                    classification: "SECURE", 
                    strengths: ["12 characters", "Domain-relevant", "Mixed complexity", "Current year"],
                    riskLevel: "LOW"
                }
            ]
        }
    },
    2: {
        title: "Dictionary Attack Simulation",
        category: "ATTACK VECTORS",
        description: "Simulate automated dictionary attacks against password databases and analyze defense effectiveness",
        objective: "Understand dictionary attack methodology and identify vulnerable password patterns",
        difficulty: "BEGINNER",
        type: "dictionary_attack",
        timeLimit: 420,
        passingScore: 75,
        data: {}
    },
    3: {
        title: "Brute Force Attack Analysis",
        category: "ATTACK VECTORS", 
        description: "Analyze brute force attack timelines and understand the mathematical relationship between password length and security",
        objective: "Calculate and compare brute force attack times for different password configurations",
        difficulty: "INTERMEDIATE",
        type: "brute_force",
        timeLimit: 480,
        passingScore: 70,
        data: {}
    },
    4: {
        title: "Password Complexity Analysis",
        category: "DEFENSE MECHANISMS",
        description: "Analyze password entropy and complexity metrics to understand cryptographic strength",
        objective: "Calculate password entropy and assess security based on character set diversity",
        difficulty: "INTERMEDIATE", 
        type: "complexity_analysis",
        timeLimit: 360,
        passingScore: 75,
        data: {}
    },
    5: {
        title: "Cryptographic Hashing Fundamentals",
        category: "CRYPTOGRAPHY",
        description: "Learn password hashing principles and understand why plaintext storage is a critical vulnerability",
        objective: "Understand hash functions, one-way encryption, and secure password storage practices",
        difficulty: "INTERMEDIATE",
        type: "hashing_basics", 
        timeLimit: 420,
        passingScore: 80,
        data: {}
    },
    6: {
        title: "Hash Cracking Simulation",
        category: "ATTACK VECTORS",
        description: "Simulate hash cracking attacks using rainbow tables and understand hash vulnerability assessment",
        objective: "Analyze hash cracking techniques and identify vulnerable hashing implementations",
        difficulty: "ADVANCED",
        type: "hash_cracking",
        timeLimit: 540,
        passingScore: 70,
        data: {}
    },
    7: {
        title: "Salt-Based Hash Protection",
        category: "DEFENSE MECHANISMS", 
        description: "Implement salt-based hashing to prevent rainbow table attacks and enhance password security",
        objective: "Understand salt generation, implementation, and effectiveness against hash cracking",
        difficulty: "ADVANCED",
        type: "salting_defense",
        timeLimit: 480,
        passingScore: 75,
        data: {}
    },
    8: {
        title: "Rate Limiting & Account Lockout",
        category: "DEFENSE MECHANISMS",
        description: "Implement and configure rate limiting systems to prevent automated password attacks",
        objective: "Design effective rate limiting policies and account lockout mechanisms",
        difficulty: "ADVANCED", 
        type: "rate_limiting",
        timeLimit: 420,
        passingScore: 80,
        data: {}
    },
    9: {
        title: "Real-World Attack Scenario",
        category: "INCIDENT RESPONSE",
        description: "Analyze a simulated security breach and implement appropriate defensive measures",
        objective: "Identify attack patterns in system logs and deploy effective countermeasures",
        difficulty: "EXPERT",
        type: "attack_scenario", 
        timeLimit: 600,
        passingScore: 85,
        data: {}
    },
    10: {
        title: "Secure System Architecture Design",
        category: "SYSTEM DESIGN",
        description: "Design a comprehensive password security system incorporating all learned principles",
        objective: "Create a professional-grade password security policy and implementation plan",
        difficulty: "EXPERT",
        type: "system_design",
        timeLimit: 720,
        passingScore: 90,
        data: {}
    }
};

// Professional Security Training Functions
function showSecurityTraining() {
    console.log('🔐 Initializing Professional Cybersecurity Training System...');
    
    // Try to use game screen manager first
    if (window.game && window.game.screens && typeof window.game.screens.showScreen === 'function') {
        window.game.screens.showScreen('password-missions');
    } else {
        // Fallback to direct screen switching
        console.log('🔄 Using fallback screen switching for security training');
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => {
            screen.classList.remove('active');
            screen.style.display = 'none';
        });
        
        const securityScreen = document.getElementById('password-missions');
        if (securityScreen) {
            securityScreen.classList.add('active');
            securityScreen.style.display = 'block';
            console.log('✅ Security training screen shown');
        } else {
            console.error('❌ Security training screen not found');
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
    
    renderSecurityLevels();
    updateTraineeDashboard();
}

function renderSecurityLevels() {
    console.log('🎯 Rendering professional security training levels...');
    console.log('Training state:', {
        currentLevel: securityTrainingState.currentLevel,
        completedLevels: securityTrainingState.completedLevels,
        unlockedLevels: securityTrainingState.unlockedLevels
    });
    
    const grid = document.getElementById('passwordLevelsGrid');
    if (!grid) {
        console.error('❌ Security levels grid not found!');
        return;
    }
    
    console.log('✅ Found security levels grid, clearing and populating...');
    grid.innerHTML = '';
    
    for (let i = 1; i <= 10; i++) {
        const level = securityLevels[i];
        if (!level) {
            console.error(`❌ Level ${i} not found in securityLevels`);
            continue;
        }
        
        const isUnlocked = securityTrainingState.unlockedLevels.includes(i);
        const isCompleted = securityTrainingState.completedLevels.includes(i);
        const levelState = securityTrainingState.levelStates[level.type];

        console.log(`Level ${i}: unlocked=${isUnlocked}, completed=${isCompleted}`);

        const card = document.createElement('div');
        card.className = `security-level-card ${isCompleted ? 'completed' : (isUnlocked ? 'unlocked' : 'locked')}`;
        
        if (isUnlocked) {
            card.onclick = () => {
                console.log(`🎯 Level ${i} card clicked`);
                startSecurityLevel(i);
            };
            card.style.cursor = 'pointer';
        } else {
            card.style.cursor = 'not-allowed';
        }

        let statusText, statusIcon, difficultyColor;
        
        // Difficulty color coding
        switch(level.difficulty) {
            case 'BEGINNER': difficultyColor = '#00ff41'; break;
            case 'INTERMEDIATE': difficultyColor = '#fbbf24'; break;
            case 'ADVANCED': difficultyColor = '#ff006e'; break;
            case 'EXPERT': difficultyColor = '#8b5cf6'; break;
            default: difficultyColor = '#9ca3af';
        }
        
        if (isCompleted) {
            statusText = `COMPLETED (${levelState.score}%)`;
            statusIcon = '<span class="security-status-icon completed">✓</span>';
        } else if (isUnlocked) {
            statusText = 'AVAILABLE';
            statusIcon = '<span class="security-status-icon available">▶</span>';
        } else {
            statusText = 'LOCKED';
            statusIcon = '<span class="security-status-icon locked">🔒</span>';
        }

        card.innerHTML = `
            <div class="security-level-header">
                <div class="security-level-number">LEVEL ${i}</div>
                <div class="security-level-category" style="color: ${difficultyColor}">${level.category}</div>
            </div>
            <div class="security-level-title">${level.title}</div>
            <div class="security-level-difficulty" style="color: ${difficultyColor}">${level.difficulty}</div>
            <div class="security-level-description">${level.description}</div>
            <div class="security-level-objective">
                <strong>OBJECTIVE:</strong> ${level.objective}
            </div>
            <div class="security-level-meta">
                <div class="security-level-time">⏱️ ${Math.floor(level.timeLimit / 60)}min</div>
                <div class="security-level-passing">🎯 ${level.passingScore}%</div>
            </div>
            <div class="security-level-status">
                <span class="security-status-text">${statusText}</span>
                ${statusIcon}
            </div>
        `;

        grid.appendChild(card);
    }
    
    console.log(`✅ Rendered ${grid.children.length} professional security training levels`);
}

function updateTraineeDashboard() {
    const completedCount = securityTrainingState.completedLevels.length;
    const totalScore = securityTrainingState.completedLevels.reduce((sum, levelNum) => {
        const levelType = securityLevels[levelNum].type;
        return sum + (securityTrainingState.levelStates[levelType].score || 0);
    }, 0);
    const averageScore = completedCount > 0 ? Math.round(totalScore / completedCount) : 0;
    
    // Update rank based on progress
    let rank = "Junior Analyst";
    if (completedCount >= 8) rank = "Senior Security Specialist";
    else if (completedCount >= 5) rank = "Security Analyst";
    else if (completedCount >= 3) rank = "Associate Analyst";
    
    document.getElementById('traineeRank').textContent = rank;
    document.getElementById('completedLevels').textContent = `${completedCount}/10`;
    document.getElementById('overallScore').textContent = `${averageScore}%`;
    
    securityTrainingState.traineeProfile.rank = rank;
    securityTrainingState.traineeProfile.totalScore = averageScore;
}

// Initialize new PasswordTrainingSystem if not already initialized
let passwordTrainingSystem = null;

function initializePasswordTrainingSystem() {
    if (!passwordTrainingSystem) {
        const container = document.getElementById('password-training-container');
        if (container) {
            // Import and initialize the new PasswordTrainingSystem
            import('../css/js/games/PasswordTrainingSystem.js').then(module => {
                passwordTrainingSystem = new module.PasswordTrainingSystem(container);
                passwordTrainingSystem.startGame(1);
                console.log('✅ New PasswordTrainingSystem initialized');
            }).catch(err => {
                console.error('❌ Failed to load PasswordTrainingSystem:', err);
            });
        }
    }
    return passwordTrainingSystem;
}

function startSecurityLevel(levelNum) {
    console.log(`🎯 Starting security level ${levelNum}...`);
    console.log('Unlocked levels:', securityTrainingState.unlockedLevels);
    console.log('Is level unlocked?', securityTrainingState.unlockedLevels.includes(levelNum));
    
    // Check if level is unlocked
    if (!securityTrainingState.unlockedLevels.includes(levelNum)) {
        console.log(`❌ Level ${levelNum} is locked`);
        showSecurityNotification('ACCESS DENIED: Complete previous levels to unlock', 'error');
        return;
    }
    
    // Try to use new PasswordTrainingSystem first, but fallback immediately if not available
    const container = document.getElementById('password-training-container');
    if (container && false) { // Disable the import attempt for now
        import('../css/js/games/PasswordTrainingSystem.js').then(module => {
            if (!passwordTrainingSystem) {
                passwordTrainingSystem = new module.PasswordTrainingSystem(container);
            }
            passwordTrainingSystem.startLevel(levelNum);
            console.log('✅ Using new PasswordTrainingSystem');
        }).catch(err => {
            console.warn('⚠️ New system not available, using fallback:', err);
            startSecurityLevelFallback(levelNum);
        });
    } else {
        // Use fallback directly
        console.log('🔄 Using fallback security level system');
        startSecurityLevelFallback(levelNum);
    }
}

function startSecurityLevelFallback(levelNum) {
    if (!securityTrainingState.unlockedLevels.includes(levelNum)) {
        showSecurityNotification('ACCESS DENIED: Complete previous levels to unlock', 'error');
        return;
    }

    securityTrainingState.currentLevel = levelNum;
    const level = securityLevels[levelNum];

    // Switch to training screen
    document.getElementById('passwordLevelSelection').style.display = 'none';
    document.getElementById('passwordGameScreen').style.display = 'flex';

    // Update header with professional styling
    document.getElementById('passwordCurrentLevel').innerHTML = `
        <div class="training-level-info">
            <div class="training-level-number">LEVEL ${levelNum}</div>
            <div class="training-level-title">${level.title}</div>
            <div class="training-level-category">${level.category}</div>
        </div>
    `;
    
    document.getElementById('passwordLevelObjective').innerHTML = `
        <div class="training-objective">
            <div class="objective-label">MISSION OBJECTIVE:</div>
            <div class="objective-text">${level.objective}</div>
            <div class="objective-meta">
                <span class="difficulty-badge ${level.difficulty.toLowerCase()}">${level.difficulty}</span>
                <span class="time-limit">⏱️ ${Math.floor(level.timeLimit / 60)}:${(level.timeLimit % 60).toString().padStart(2, '0')}</span>
                <span class="passing-score">🎯 ${level.passingScore}%</span>
            </div>
        </div>
    `;
    
    document.getElementById('passwordProgressFill').style.width = '0%';
    document.getElementById('passwordProgressText').textContent = '0%';

    // Load level content
    loadSecurityLevelContent(level);

    // Show appropriate buttons based on level type
    const checkBtn = document.getElementById('passwordCheckBtn');
    const continueBtn = document.getElementById('passwordContinueBtn');
    
    if (checkBtn) {
        checkBtn.style.display = 'inline-block';
        checkBtn.disabled = false;
        checkBtn.textContent = 'Submit Assessment';
    }
    if (continueBtn) {
        continueBtn.style.display = 'none';
    }
    
    // Start timer
    securityTrainingState.levelStartTime = Date.now();
}

function loadSecurityLevelContent(level) {
    const content = document.getElementById('passwordGameContent');
    
    switch (level.type) {
        case 'password_awareness':
            renderPasswordAwareness(content, level);
            break;
        case 'dictionary_attack':
            renderDictionaryAttack(content, level);
            break;
        case 'brute_force':
            renderBruteForceAnalysis(content, level);
            break;
        case 'complexity_analysis':
            renderComplexityAnalysis(content, level);
            break;
        case 'hashing_basics':
            renderHashingBasics(content, level);
            break;
        case 'hash_cracking':
            renderHashCracking(content, level);
            break;
        case 'salting_defense':
            renderSaltingDefense(content, level);
            break;
        case 'rate_limiting':
            renderRateLimiting(content, level);
            break;
        case 'attack_scenario':
            renderAttackScenario(content, level);
            break;
        case 'system_design':
            renderSystemDesign(content, level);
            break;
        default:
            console.error(`❌ Unknown level type: ${level.type}`);
            content.innerHTML = `
                <div class="security-error-panel">
                    <h3>⚠️ LEVEL CONFIGURATION ERROR</h3>
                    <p>Level type "${level.type}" is not implemented.</p>
                    <button class="btn btn-secondary" onclick="backToSecurityLevels()">Return to Training Menu</button>
                </div>
            `;
    }
}

// Level 1: Password Awareness Assessment
function renderPasswordAwareness(container, level) {
    container.innerHTML = `
        <div class="security-training-panel">
            <div class="training-header">
                <h3>🔍 PASSWORD SECURITY ASSESSMENT</h3>
                <div class="training-briefing">
                    <p>As a cybersecurity analyst, you must evaluate password security based on industry standards and threat intelligence.</p>
                    <div class="assessment-criteria">
                        <h4>CLASSIFICATION CRITERIA:</h4>
                        <div class="criteria-grid">
                            <div class="criteria-item secure">
                                <strong>SECURE:</strong> 12+ chars, mixed case, numbers, symbols, not in breach databases
                            </div>
                            <div class="criteria-item vulnerable">
                                <strong>VULNERABLE:</strong> Short, common patterns, dictionary words, predictable sequences
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="password-assessment-grid" id="passwordAssessmentGrid">
                <!-- Password assessment cards will be populated here -->
            </div>
            
            <div class="assessment-progress">
                <div class="progress-info">
                    <span id="assessmentProgress">0 / ${level.data.passwords.length}</span>
                    <span class="progress-label">Passwords Classified</span>
                </div>
                <div class="assessment-score">
                    <span id="assessmentScore">0%</span>
                    <span class="score-label">Accuracy</span>
                </div>
            </div>
            
            <div class="assessment-submit">
                <button class="security-submit-btn" onclick="submitPasswordAssessment()" id="assessmentSubmitBtn" disabled>
                    SUBMIT SECURITY ASSESSMENT
                </button>
            </div>
        </div>
    `;
    
    renderPasswordAssessmentCards(level.data.passwords);
}

function renderPasswordAssessmentCards(passwords) {
    const grid = document.getElementById('passwordAssessmentGrid');
    grid.innerHTML = '';
    
    passwords.forEach((pwd, index) => {
        const card = document.createElement('div');
        card.className = 'password-assessment-card';
        card.dataset.index = index;
        
        card.innerHTML = `
            <div class="password-display">
                <div class="password-text">${pwd.text}</div>
                <div class="password-length">${pwd.text.length} characters</div>
            </div>
            <div class="classification-buttons">
                <button class="classify-btn secure" onclick="classifyPassword(${index}, 'SECURE')">
                    🛡️ SECURE
                </button>
                <button class="classify-btn vulnerable" onclick="classifyPassword(${index}, 'VULNERABLE')">
                    ⚠️ VULNERABLE
                </button>
            </div>
            <div class="classification-result" id="result-${index}" style="display: none;">
                <!-- Result will be shown here after submission -->
            </div>
        `;
        
        grid.appendChild(card);
    });
}

// Global variables for password assessment
let passwordClassifications = {};
let assessmentSubmitted = false;

function classifyPassword(index, classification) {
    if (assessmentSubmitted) return;
    
    passwordClassifications[index] = classification;
    
    // Update button states
    const card = document.querySelector(`[data-index="${index}"]`);
    const buttons = card.querySelectorAll('.classify-btn');
    
    buttons.forEach(btn => {
        btn.classList.remove('selected');
        if (btn.textContent.includes(classification)) {
            btn.classList.add('selected');
        }
    });
    
    updateAssessmentProgress();
}

function updateAssessmentProgress() {
    const level = securityLevels[securityTrainingState.currentLevel];
    const totalPasswords = level.data.passwords.length;
    const classifiedCount = Object.keys(passwordClassifications).length;
    
    document.getElementById('assessmentProgress').textContent = `${classifiedCount} / ${totalPasswords}`;
    
    // Update both the assessment submit button and the main check button
    const assessmentSubmitBtn = document.getElementById('assessmentSubmitBtn');
    const mainCheckBtn = document.getElementById('passwordCheckBtn');
    
    if (classifiedCount === totalPasswords && !assessmentSubmitted) {
        // Enable both buttons
        if (assessmentSubmitBtn) {
            assessmentSubmitBtn.disabled = false;
            assessmentSubmitBtn.textContent = 'SUBMIT SECURITY ASSESSMENT';
        }
        if (mainCheckBtn) {
            mainCheckBtn.disabled = false;
            mainCheckBtn.textContent = 'Submit Assessment';
            mainCheckBtn.style.display = 'inline-block';
        }
    } else {
        // Disable both buttons
        if (assessmentSubmitBtn) {
            assessmentSubmitBtn.disabled = true;
            assessmentSubmitBtn.textContent = `CLASSIFY ALL PASSWORDS (${classifiedCount}/${totalPasswords})`;
        }
        if (mainCheckBtn) {
            mainCheckBtn.disabled = true;
            mainCheckBtn.textContent = `Classify All Passwords (${classifiedCount}/${totalPasswords})`;
        }
    }
    
    updateSecurityProgress((classifiedCount / totalPasswords) * 50); // 50% for classification, 50% for accuracy
}

function submitPasswordAssessment() {
    console.log('📝 Starting password assessment submission...');
    console.log('Assessment already submitted:', assessmentSubmitted);
    console.log('Classifications made:', Object.keys(passwordClassifications).length);
    
    if (assessmentSubmitted) {
        console.log('⚠️ Assessment already submitted, ignoring...');
        return;
    }
    
    const level = securityLevels[securityTrainingState.currentLevel];
    if (!level || !level.data || !level.data.passwords) {
        console.error('❌ Level data not found');
        showSecurityNotification('Error: Level data not found', 'error');
        return;
    }
    
    // Check if user has made any classifications
    const totalPasswords = level.data.passwords.length;
    const classifiedCount = Object.keys(passwordClassifications).length;
    
    if (classifiedCount === 0) {
        console.log('⚠️ No classifications made');
        showSecurityNotification('Please classify at least one password before submitting', 'warning');
        return;
    }
    
    if (classifiedCount < totalPasswords) {
        console.log(`⚠️ Only ${classifiedCount}/${totalPasswords} passwords classified`);
        showSecurityNotification(`Please classify all ${totalPasswords} passwords before submitting`, 'warning');
        return;
    }
    
    assessmentSubmitted = true;
    console.log('✅ Assessment submission validated, processing...');
    
    let correctCount = 0;
    
    // Evaluate all classifications and show detailed feedback
    level.data.passwords.forEach((pwd, index) => {
        const userClassification = passwordClassifications[index];
        const correct = pwd.classification === userClassification;
        
        if (correct) correctCount++;
        
        const card = document.querySelector(`[data-index="${index}"]`);
        const resultDiv = document.getElementById(`result-${index}`);
        const buttons = card.querySelectorAll('.classify-btn');
        
        // Disable buttons
        buttons.forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = '0.6';
        });
        
        // Show detailed feedback
        resultDiv.style.display = 'block';
        if (correct) {
            card.style.borderColor = '#00ff41';
            card.style.background = 'rgba(0, 255, 65, 0.1)';
            resultDiv.innerHTML = `
                <div class="assessment-feedback correct">
                    <div class="feedback-header">✅ CORRECT ASSESSMENT</div>
                    <div class="feedback-details">
                        <div class="risk-level ${pwd.riskLevel.toLowerCase().replace(' ', '-')}">${pwd.riskLevel} RISK</div>
                        ${pwd.classification === 'SECURE' ? 
                            `<div class="strengths">
                                <strong>Security Strengths:</strong>
                                <ul>${pwd.strengths.map(s => `<li>${s}</li>`).join('')}</ul>
                            </div>` :
                            `<div class="vulnerabilities">
                                <strong>Security Vulnerabilities:</strong>
                                <ul>${pwd.vulnerabilities.map(v => `<li>${v}</li>`).join('')}</ul>
                            </div>`
                        }
                    </div>
                </div>
            `;
        } else {
            card.style.borderColor = '#ff006e';
            card.style.background = 'rgba(255, 0, 110, 0.1)';
            resultDiv.innerHTML = `
                <div class="assessment-feedback incorrect">
                    <div class="feedback-header">❌ INCORRECT ASSESSMENT</div>
                    <div class="feedback-details">
                        <div class="correct-classification">Correct: <strong>${pwd.classification}</strong></div>
                        <div class="risk-level ${pwd.riskLevel.toLowerCase().replace(' ', '-')}">${pwd.riskLevel} RISK</div>
                        ${pwd.classification === 'SECURE' ? 
                            `<div class="strengths">
                                <strong>Why it's Secure:</strong>
                                <ul>${pwd.strengths.map(s => `<li>${s}</li>`).join('')}</ul>
                            </div>` :
                            `<div class="vulnerabilities">
                                <strong>Security Issues:</strong>
                                <ul>${pwd.vulnerabilities.map(v => `<li>${v}</li>`).join('')}</ul>
                            </div>`
                        }
                    </div>
                </div>
            `;
        }
    });
    
    const accuracy = Math.round((correctCount / level.data.passwords.length) * 100);
    const passed = accuracy >= level.passingScore;
    
    document.getElementById('assessmentScore').textContent = `${accuracy}%`;
    
    // Store results
    securityTrainingState.levelStates.password_awareness = {
        completed: passed,
        score: accuracy,
        attempts: (securityTrainingState.levelStates.password_awareness.attempts || 0) + 1,
        correctCount: correctCount,
        totalCount: level.data.passwords.length
    };
    
    // Disable both submit buttons
    const assessmentSubmitBtn = document.getElementById('assessmentSubmitBtn');
    const mainCheckBtn = document.getElementById('passwordCheckBtn');
    
    if (assessmentSubmitBtn) {
        assessmentSubmitBtn.disabled = true;
        assessmentSubmitBtn.style.opacity = '0.5';
    }
    if (mainCheckBtn) {
        mainCheckBtn.disabled = true;
        mainCheckBtn.style.opacity = '0.5';
        mainCheckBtn.textContent = 'Assessment Complete';
    }
    
    // Update progress to 100%
    updateSecurityProgress(100);
    
    // Show completion modal
    setTimeout(() => {
        showSecurityCompletionModal(passed, accuracy, level.passingScore, 'password_awareness');
    }, 1000);
}

// Level 2: Dictionary Attack Simulation
function renderDictionaryAttack(container, level) {
    container.innerHTML = `
        <div class="security-training-panel">
            <div class="training-header">
                <h3>🔍 DICTIONARY ATTACK SIMULATION</h3>
                <div class="training-briefing">
                    <p>Simulate automated dictionary attacks against password databases. Understand how attackers use common password lists to compromise accounts.</p>
                    <div class="attack-info">
                        <h4>ATTACK METHODOLOGY:</h4>
                        <div class="methodology-grid">
                            <div class="method-item">
                                <strong>Common Passwords:</strong> Most frequently used passwords from data breaches
                            </div>
                            <div class="method-item">
                                <strong>Dictionary Words:</strong> Standard dictionary terms with common variations
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="attack-simulation-area">
                <div class="target-system">
                    <h4>🎯 TARGET SYSTEM</h4>
                    <div class="system-info">
                        <div class="system-detail">
                            <span class="label">System:</span>
                            <span class="value">Corporate Login Portal</span>
                        </div>
                        <div class="system-detail">
                            <span class="label">Accounts:</span>
                            <span class="value">5 User Accounts</span>
                        </div>
                        <div class="system-detail">
                            <span class="label">Protection:</span>
                            <span class="value">Basic Authentication</span>
                        </div>
                    </div>
                </div>
                
                <div class="attack-controls">
                    <h4>⚡ ATTACK CONFIGURATION</h4>
                    <div class="attack-options">
                        <div class="option-group">
                            <label>Dictionary Type:</label>
                            <select id="dictionaryType" class="security-select">
                                <option value="common">Common Passwords (Top 1000)</option>
                                <option value="extended">Extended Dictionary (10,000 words)</option>
                                <option value="custom">Custom Wordlist</option>
                            </select>
                        </div>
                        <div class="option-group">
                            <label>Attack Speed:</label>
                            <select id="attackSpeed" class="security-select">
                                <option value="slow">Slow (1 attempt/sec)</option>
                                <option value="medium">Medium (10 attempts/sec)</option>
                                <option value="fast">Fast (100 attempts/sec)</option>
                            </select>
                        </div>
                    </div>
                    <button class="security-action-btn" onclick="startDictionaryAttack()" id="startAttackBtn">
                        🚀 START DICTIONARY ATTACK
                    </button>
                </div>
                
                <div class="attack-results" id="attackResults" style="display: none;">
                    <h4>📊 ATTACK RESULTS</h4>
                    <div class="results-grid" id="resultsGrid">
                        <!-- Results will be populated here -->
                    </div>
                    <div class="attack-summary" id="attackSummary">
                        <!-- Summary will be shown here -->
                    </div>
                </div>
            </div>
            
            <div class="assessment-submit">
                <button class="security-submit-btn" onclick="submitDictionaryAssessment()" id="dictionarySubmitBtn" style="display: none;">
                    SUBMIT ATTACK ANALYSIS
                </button>
            </div>
        </div>
    `;
}

// Level 3: Brute Force Attack Analysis
function renderBruteForceAnalysis(container, level) {
    container.innerHTML = `
        <div class="security-training-panel">
            <div class="training-header">
                <h3>⚡ BRUTE FORCE ATTACK ANALYSIS</h3>
                <div class="training-briefing">
                    <p>Analyze brute force attack timelines and understand the mathematical relationship between password length and security.</p>
                </div>
            </div>
            
            <div class="brute-force-calculator">
                <h4>🧮 BRUTE FORCE TIME CALCULATOR</h4>
                <div class="calculator-controls">
                    <div class="control-group">
                        <label>Password Length:</label>
                        <input type="range" id="passwordLength" min="4" max="16" value="8" oninput="calculateBruteForceTime()">
                        <span id="lengthDisplay">8 characters</span>
                    </div>
                    <div class="control-group">
                        <label>Character Set:</label>
                        <select id="characterSet" onchange="calculateBruteForceTime()">
                            <option value="10">Numbers only (0-9)</option>
                            <option value="26">Lowercase letters (a-z)</option>
                            <option value="52">Mixed case (a-z, A-Z)</option>
                            <option value="62" selected>Alphanumeric (a-z, A-Z, 0-9)</option>
                            <option value="95">Full ASCII (all printable characters)</option>
                        </select>
                    </div>
                    <div class="control-group">
                        <label>Attack Speed:</label>
                        <select id="bruteForceSpeed" onchange="calculateBruteForceTime()">
                            <option value="1000">1,000 attempts/sec</option>
                            <option value="1000000" selected>1 million attempts/sec</option>
                            <option value="1000000000">1 billion attempts/sec</option>
                        </select>
                    </div>
                </div>
                
                <div class="calculation-results" id="bruteForceResults">
                    <!-- Results will be calculated here -->
                </div>
            </div>
            
            <div class="password-comparison">
                <h4>🔍 PASSWORD STRENGTH COMPARISON</h4>
                <div class="comparison-grid" id="comparisonGrid">
                    <!-- Comparison will be populated here -->
                </div>
            </div>
            
            <div class="assessment-submit">
                <button class="security-submit-btn" onclick="submitBruteForceAssessment()" id="bruteForceSubmitBtn">
                    SUBMIT ANALYSIS
                </button>
            </div>
        </div>
    `;
    
    // Initialize calculator
    setTimeout(() => calculateBruteForceTime(), 100);
}

// Levels 4-10: Simplified Interactive Content
function renderComplexityAnalysis(container, level) {
    container.innerHTML = `
        <div class="security-training-panel">
            <div class="training-header">
                <h3>🔬 PASSWORD COMPLEXITY ANALYSIS</h3>
                <div class="training-briefing">
                    <p>Analyze password entropy and complexity metrics to understand cryptographic strength.</p>
                </div>
            </div>
            
            <div class="interactive-lesson">
                <h4>📚 COMPLEXITY FUNDAMENTALS</h4>
                <div class="lesson-content">
                    <div class="concept-card">
                        <h5>🧮 Entropy Calculation</h5>
                        <p>Password entropy = log₂(character_set^length)</p>
                        <div class="example">
                            <strong>Example:</strong> 8-char alphanumeric = log₂(62^8) = 47.6 bits
                        </div>
                    </div>
                    
                    <div class="concept-card">
                        <h5>🎯 Complexity Requirements</h5>
                        <ul>
                            <li>Minimum 12 characters</li>
                            <li>Mixed case letters</li>
                            <li>Numbers and symbols</li>
                            <li>No dictionary words</li>
                        </ul>
                    </div>
                    
                    <div class="concept-card">
                        <h5>⚖️ Security vs Usability</h5>
                        <p>Balance strong security requirements with user experience to ensure compliance.</p>
                    </div>
                </div>
                
                <div class="knowledge-check">
                    <h5>✅ KNOWLEDGE CHECK</h5>
                    <div class="question">
                        <p><strong>Which password has higher entropy?</strong></p>
                        <div class="options">
                            <label><input type="radio" name="entropy" value="a"> "Password123!" (12 chars, mixed)</label>
                            <label><input type="radio" name="entropy" value="b"> "MyDog2023" (9 chars, mixed)</label>
                            <label><input type="radio" name="entropy" value="c"> "X9$mK2#vL8@pQ" (13 chars, random)</label>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="assessment-submit">
                <button class="security-submit-btn" onclick="submitComplexityAssessment()" id="complexitySubmitBtn">
                    SUBMIT COMPLEXITY ANALYSIS
                </button>
            </div>
        </div>
    `;
}

function renderHashingBasics(container, level) {
    container.innerHTML = `
        <div class="security-training-panel">
            <div class="training-header">
                <h3>🔐 CRYPTOGRAPHIC HASHING FUNDAMENTALS</h3>
                <div class="training-briefing">
                    <p>Learn password hashing principles and understand why plaintext storage is a critical vulnerability.</p>
                </div>
            </div>
            
            <div class="interactive-lesson">
                <h4>🔑 HASHING PRINCIPLES</h4>
                <div class="lesson-content">
                    <div class="concept-card">
                        <h5>🧮 Hash Functions</h5>
                        <p>One-way mathematical functions that convert input to fixed-length output</p>
                        <div class="hash-example">
                            <strong>Input:</strong> "password123"<br>
                            <strong>SHA-256:</strong> ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f
                        </div>
                    </div>
                    
                    <div class="concept-card">
                        <h5>🛡️ Security Properties</h5>
                        <ul>
                            <li><strong>Deterministic:</strong> Same input = same hash</li>
                            <li><strong>Irreversible:</strong> Cannot derive input from hash</li>
                            <li><strong>Avalanche Effect:</strong> Small input change = completely different hash</li>
                            <li><strong>Collision Resistant:</strong> Hard to find two inputs with same hash</li>
                        </ul>
                    </div>
                    
                    <div class="concept-card">
                        <h5>⚠️ Storage Comparison</h5>
                        <div class="storage-comparison">
                            <div class="bad-practice">
                                <strong>❌ Plaintext Storage:</strong><br>
                                Database: "admin", "password123", "qwerty"<br>
                                <em>Risk: Complete exposure if breached</em>
                            </div>
                            <div class="good-practice">
                                <strong>✅ Hashed Storage:</strong><br>
                                Database: "5e884898da...", "ef92b778ba...", "65e84be33b..."<br>
                                <em>Benefit: Passwords protected even if database compromised</em>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="assessment-submit">
                <button class="security-submit-btn" onclick="submitHashingAssessment()" id="hashingSubmitBtn">
                    SUBMIT HASHING ASSESSMENT
                </button>
            </div>
        </div>
    `;
}

function renderHashCracking(container, level) {
    container.innerHTML = `
        <div class="security-training-panel">
            <div class="training-header">
                <h3>💥 HASH CRACKING SIMULATION</h3>
                <div class="training-briefing">
                    <p>Simulate hash cracking attacks using rainbow tables and understand hash vulnerability assessment.</p>
                </div>
            </div>
            
            <div class="interactive-lesson">
                <h4>🔨 CRACKING TECHNIQUES</h4>
                <div class="lesson-content">
                    <div class="technique-card">
                        <h5>📚 Dictionary Attack</h5>
                        <p>Hash common passwords and compare with target hashes</p>
                        <div class="technique-stats">
                            <span class="stat">Speed: Fast</span>
                            <span class="stat">Success Rate: 60-80% for weak passwords</span>
                        </div>
                    </div>
                    
                    <div class="technique-card">
                        <h5>🌈 Rainbow Tables</h5>
                        <p>Pre-computed hash tables for instant password lookup</p>
                        <div class="technique-stats">
                            <span class="stat">Speed: Instant</span>
                            <span class="stat">Storage: Massive (TB of data)</span>
                        </div>
                    </div>
                    
                    <div class="technique-card">
                        <h5>⚡ Brute Force</h5>
                        <p>Try all possible combinations systematically</p>
                        <div class="technique-stats">
                            <span class="stat">Speed: Slow</span>
                            <span class="stat">Success Rate: 100% given enough time</span>
                        </div>
                    </div>
                </div>
                
                <div class="defense-strategies">
                    <h5>🛡️ DEFENSE STRATEGIES</h5>
                    <ul>
                        <li>Use strong, unique passwords</li>
                        <li>Implement password salting</li>
                        <li>Use slow hash functions (bcrypt, scrypt)</li>
                        <li>Enforce password complexity requirements</li>
                    </ul>
                </div>
            </div>
            
            <div class="assessment-submit">
                <button class="security-submit-btn" onclick="submitHashCrackingAssessment()" id="hashCrackingSubmitBtn">
                    SUBMIT CRACKING ANALYSIS
                </button>
            </div>
        </div>
    `;
}

function renderSaltingDefense(container, level) {
    container.innerHTML = `
        <div class="security-training-panel">
            <div class="training-header">
                <h3>🧂 SALT-BASED HASH PROTECTION</h3>
                <div class="training-briefing">
                    <p>Implement salt-based hashing to prevent rainbow table attacks and enhance password security.</p>
                </div>
            </div>
            
            <div class="interactive-lesson">
                <h4>🧂 SALTING MECHANISM</h4>
                <div class="lesson-content">
                    <div class="salt-explanation">
                        <h5>What is Salt?</h5>
                        <p>Random data added to passwords before hashing to ensure unique hashes even for identical passwords.</p>
                        
                        <div class="salt-example">
                            <div class="without-salt">
                                <h6>❌ Without Salt:</h6>
                                <code>
                                    User1: hash("password123") = ef92b778ba...<br>
                                    User2: hash("password123") = ef92b778ba... (same hash!)
                                </code>
                            </div>
                            
                            <div class="with-salt">
                                <h6>✅ With Salt:</h6>
                                <code>
                                    User1: hash("password123" + "a1b2c3") = 7f3e9d2a1b...<br>
                                    User2: hash("password123" + "x9y8z7") = 2c8f1e4d9a... (different hashes!)
                                </code>
                            </div>
                        </div>
                    </div>
                    
                    <div class="salt-benefits">
                        <h5>🛡️ Security Benefits</h5>
                        <ul>
                            <li><strong>Rainbow Table Defense:</strong> Pre-computed tables become useless</li>
                            <li><strong>Unique Hashes:</strong> Same passwords produce different hashes</li>
                            <li><strong>Parallel Attack Prevention:</strong> Each password must be cracked individually</li>
                            <li><strong>Pattern Hiding:</strong> Common passwords don't reveal usage patterns</li>
                        </ul>
                    </div>
                    
                    <div class="implementation-guide">
                        <h5>⚙️ Implementation Best Practices</h5>
                        <ul>
                            <li>Generate cryptographically secure random salt for each password</li>
                            <li>Use salt length of at least 16 bytes</li>
                            <li>Store salt alongside the hash in database</li>
                            <li>Never reuse salts across different passwords</li>
                        </ul>
                    </div>
                </div>
            </div>
            
            <div class="assessment-submit">
                <button class="security-submit-btn" onclick="submitSaltingAssessment()" id="saltingSubmitBtn">
                    SUBMIT SALTING ASSESSMENT
                </button>
            </div>
        </div>
    `;
}

function renderRateLimiting(container, level) {
    container.innerHTML = `
        <div class="security-training-panel">
            <div class="training-header">
                <h3>🚦 RATE LIMITING & ACCOUNT LOCKOUT</h3>
                <div class="training-briefing">
                    <p>Implement and configure rate limiting systems to prevent automated password attacks.</p>
                </div>
            </div>
            
            <div class="interactive-lesson">
                <h4>🛡️ DEFENSE MECHANISMS</h4>
                <div class="lesson-content">
                    <div class="defense-card">
                        <h5>⏱️ Rate Limiting</h5>
                        <p>Restrict the number of login attempts within a time window</p>
                        <div class="example">
                            <strong>Example:</strong> Maximum 5 attempts per minute per IP address
                        </div>
                    </div>
                    
                    <div class="defense-card">
                        <h5>🔒 Account Lockout</h5>
                        <p>Temporarily disable accounts after failed attempts</p>
                        <div class="example">
                            <strong>Example:</strong> Lock account for 15 minutes after 5 failed attempts
                        </div>
                    </div>
                    
                    <div class="defense-card">
                        <h5>🤖 CAPTCHA Protection</h5>
                        <p>Require human verification after suspicious activity</p>
                        <div class="example">
                            <strong>Example:</strong> Show CAPTCHA after 3 failed attempts
                        </div>
                    </div>
                    
                    <div class="defense-card">
                        <h5>📊 Progressive Delays</h5>
                        <p>Increase delay between attempts exponentially</p>
                        <div class="example">
                            <strong>Example:</strong> 1s, 2s, 4s, 8s, 16s delays
                        </div>
                    </div>
                </div>
                
                <div class="configuration-guide">
                    <h5>⚙️ CONFIGURATION GUIDELINES</h5>
                    <div class="config-table">
                        <div class="config-row">
                            <span class="config-label">Max Attempts:</span>
                            <span class="config-value">3-5 attempts</span>
                            <span class="config-note">Balance security vs usability</span>
                        </div>
                        <div class="config-row">
                            <span class="config-label">Time Window:</span>
                            <span class="config-value">1-5 minutes</span>
                            <span class="config-note">Short enough to be effective</span>
                        </div>
                        <div class="config-row">
                            <span class="config-label">Lockout Duration:</span>
                            <span class="config-value">15-30 minutes</span>
                            <span class="config-note">Long enough to deter attacks</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="assessment-submit">
                <button class="security-submit-btn" onclick="submitRateLimitingAssessment()" id="rateLimitingSubmitBtn">
                    SUBMIT DEFENSE ANALYSIS
                </button>
            </div>
        </div>
    `;
}

function renderAttackScenario(container, level) {
    container.innerHTML = `
        <div class="security-training-panel">
            <div class="training-header">
                <h3>🚨 REAL-WORLD ATTACK SCENARIO</h3>
                <div class="training-briefing">
                    <p>Analyze a simulated security breach and implement appropriate defensive measures.</p>
                </div>
            </div>
            
            <div class="scenario-briefing">
                <h4>📋 INCIDENT BRIEFING</h4>
                <div class="alert-panel">
                    <div class="alert-header">
                        <span class="alert-icon">🚨</span>
                        <span class="alert-title">SECURITY INCIDENT DETECTED</span>
                    </div>
                    <div class="alert-details">
                        <div class="detail-row">
                            <span class="label">Time:</span>
                            <span class="value">2024-03-15 14:32:17 UTC</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">System:</span>
                            <span class="value">Corporate Authentication Server</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Alert Type:</span>
                            <span class="value">Suspicious Login Activity</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Severity:</span>
                            <span class="value critical">CRITICAL</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="incident-analysis">
                <h4>🔍 INCIDENT ANALYSIS</h4>
                <div class="analysis-content">
                    <div class="log-sample">
                        <h5>📊 Sample Log Entries:</h5>
                        <div class="log-entries">
                            <div class="log-entry failed">14:30:15 - Failed login: admin@company.com from 192.168.1.100</div>
                            <div class="log-entry failed">14:30:16 - Failed login: admin@company.com from 192.168.1.100</div>
                            <div class="log-entry failed">14:30:17 - Failed login: admin@company.com from 192.168.1.100</div>
                            <div class="log-entry warning">14:30:18 - Rate limit triggered for 192.168.1.100</div>
                            <div class="log-entry failed">14:31:45 - Failed login: user1@company.com from 192.168.1.100</div>
                            <div class="log-entry success">14:32:17 - Successful login: user1@company.com from 192.168.1.100</div>
                        </div>
                    </div>
                    
                    <div class="threat-indicators">
                        <h5>⚠️ Threat Indicators:</h5>
                        <ul>
                            <li>Multiple failed login attempts from single IP</li>
                            <li>Sequential account targeting</li>
                            <li>Successful compromise of user1@company.com</li>
                            <li>Attack bypassed rate limiting</li>
                        </ul>
                    </div>
                    
                    <div class="response-actions">
                        <h5>🛡️ Recommended Actions:</h5>
                        <div class="action-checklist">
                            <label><input type="checkbox"> Block attacking IP address</label>
                            <label><input type="checkbox"> Force password reset for compromised account</label>
                            <label><input type="checkbox"> Enable MFA for all accounts</label>
                            <label><input type="checkbox"> Strengthen rate limiting rules</label>
                            <label><input type="checkbox"> Monitor for lateral movement</label>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="assessment-submit">
                <button class="security-submit-btn" onclick="submitScenarioAssessment()" id="scenarioSubmitBtn">
                    SUBMIT INCIDENT RESPONSE
                </button>
            </div>
        </div>
    `;
}

function renderSystemDesign(container, level) {
    container.innerHTML = `
        <div class="security-training-panel">
            <div class="training-header">
                <h3>🏗️ SECURE SYSTEM ARCHITECTURE DESIGN</h3>
                <div class="training-briefing">
                    <p>Design a comprehensive password security system incorporating all learned principles.</p>
                </div>
            </div>
            
            <div class="system-designer">
                <h4>🎯 SECURITY ARCHITECTURE DESIGNER</h4>
                <div class="design-components">
                    <div class="component-section">
                        <h5>🔐 Authentication Layer</h5>
                        <div class="component-options">
                            <label><input type="checkbox" id="multiFactorAuth" onchange="updateArchitecture()"> Multi-Factor Authentication</label>
                            <label><input type="checkbox" id="biometricAuth" onchange="updateArchitecture()"> Biometric Authentication</label>
                            <label><input type="checkbox" id="ssoIntegration" onchange="updateArchitecture()"> SSO Integration</label>
                        </div>
                    </div>
                    
                    <div class="component-section">
                        <h5>📋 Password Policy</h5>
                        <div class="component-options">
                            <label><input type="checkbox" id="complexityRules" onchange="updateArchitecture()"> Complexity Requirements</label>
                            <label><input type="checkbox" id="passwordHistory" onchange="updateArchitecture()"> Password History</label>
                            <label><input type="checkbox" id="regularExpiry" onchange="updateArchitecture()"> Regular Expiry</label>
                        </div>
                    </div>
                    
                    <div class="component-section">
                        <h5>🔒 Storage & Encryption</h5>
                        <div class="component-options">
                            <label><input type="checkbox" id="saltedHashing" onchange="updateArchitecture()"> Salted Hashing</label>
                            <label><input type="checkbox" id="strongAlgorithm" onchange="updateArchitecture()"> Strong Hash Algorithm</label>
                            <label><input type="checkbox" id="encryptedStorage" onchange="updateArchitecture()"> Encrypted Storage</label>
                        </div>
                    </div>
                    
                    <div class="component-section">
                        <h5>🛡️ Attack Prevention</h5>
                        <div class="component-options">
                            <label><input type="checkbox" id="rateLimiting" onchange="updateArchitecture()"> Rate Limiting</label>
                            <label><input type="checkbox" id="accountLockout" onchange="updateArchitecture()"> Account Lockout</label>
                            <label><input type="checkbox" id="captchaProtection" onchange="updateArchitecture()"> CAPTCHA Protection</label>
                        </div>
                    </div>
                </div>
                
                <div class="architecture-preview">
                    <h5>🏗️ System Architecture Preview</h5>
                    <div class="architecture-diagram" id="architectureDiagram">
                        <div class="arch-layer">
                            <div class="layer-title">User Interface Layer</div>
                            <div class="layer-components" id="uiComponents">
                                <span class="component">Login Form</span>
                            </div>
                        </div>
                        <div class="arch-layer">
                            <div class="layer-title">Authentication Layer</div>
                            <div class="layer-components" id="authComponents">
                                <span class="component">Basic Auth</span>
                            </div>
                        </div>
                        <div class="arch-layer">
                            <div class="layer-title">Security Layer</div>
                            <div class="layer-components" id="securityComponents">
                                <span class="component">Password Validation</span>
                            </div>
                        </div>
                        <div class="arch-layer">
                            <div class="layer-title">Storage Layer</div>
                            <div class="layer-components" id="storageComponents">
                                <span class="component">Database</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="security-score">
                    <h5>📊 Security Score</h5>
                    <div class="score-display">
                        <div class="score-value" id="securityScore">45</div>
                        <div class="score-label">/ 100</div>
                    </div>
                    <div class="score-breakdown" id="scoreBreakdown">
                        <div class="score-item">
                            <span class="score-category">Authentication:</span>
                            <span class="score-points">15/30</span>
                        </div>
                        <div class="score-item">
                            <span class="score-category">Storage:</span>
                            <span class="score-points">10/25</span>
                        </div>
                        <div class="score-item">
                            <span class="score-category">Protection:</span>
                            <span class="score-points">20/45</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="assessment-submit">
                <button class="security-submit-btn" onclick="submitSystemDesignAssessment()" id="systemDesignSubmitBtn">
                    SUBMIT SYSTEM DESIGN
                </button>
            </div>
        </div>
    `;
    
    // Initialize architecture preview
    setTimeout(() => updateArchitecture(), 100);
}

// Supporting Functions for Interactive Elements

// Dictionary Attack Functions
function startDictionaryAttack() {
    const attackBtn = document.getElementById('startAttackBtn');
    const resultsDiv = document.getElementById('attackResults');
    const submitBtn = document.getElementById('dictionarySubmitBtn');
    
    attackBtn.disabled = true;
    attackBtn.textContent = '⏳ ATTACK IN PROGRESS...';
    
    // Simulate attack progress
    setTimeout(() => {
        resultsDiv.style.display = 'block';
        document.getElementById('resultsGrid').innerHTML = `
            <div class="result-item success">
                <span class="account">admin@company.com</span>
                <span class="password">password123</span>
                <span class="time">0.3 seconds</span>
            </div>
            <div class="result-item success">
                <span class="account">user1@company.com</span>
                <span class="password">qwerty</span>
                <span class="time">1.2 seconds</span>
            </div>
            <div class="result-item failed">
                <span class="account">admin2@company.com</span>
                <span class="password">Not found</span>
                <span class="time">-</span>
            </div>
        `;
        
        document.getElementById('attackSummary').innerHTML = `
            <div class="summary-stats">
                <div class="stat">
                    <span class="stat-value">2/5</span>
                    <span class="stat-label">Accounts Compromised</span>
                </div>
                <div class="stat">
                    <span class="stat-value">40%</span>
                    <span class="stat-label">Success Rate</span>
                </div>
                <div class="stat">
                    <span class="stat-value">1.5s</span>
                    <span class="stat-label">Average Time</span>
                </div>
            </div>
        `;
        
        submitBtn.style.display = 'inline-block';
        attackBtn.textContent = '✅ ATTACK COMPLETED';
    }, 2000);
}

function submitDictionaryAssessment() {
    completeSecurityLevel();
    showSecurityCompletionModal(true, 85, 75, 'dictionary_attack');
}

// Brute Force Functions
function calculateBruteForceTime() {
    const length = document.getElementById('passwordLength').value;
    const charset = document.getElementById('characterSet').value;
    const speed = document.getElementById('bruteForceSpeed').value;
    
    document.getElementById('lengthDisplay').textContent = `${length} characters`;
    
    const combinations = Math.pow(charset, length);
    const averageTime = combinations / (2 * speed); // Average case
    const worstTime = combinations / speed; // Worst case
    
    let timeUnit = 'seconds';
    let avgDisplay = averageTime;
    let worstDisplay = worstTime;
    
    if (averageTime > 31536000) { // More than a year
        avgDisplay = (averageTime / 31536000).toFixed(1);
        worstDisplay = (worstTime / 31536000).toFixed(1);
        timeUnit = 'years';
    } else if (averageTime > 86400) { // More than a day
        avgDisplay = (averageTime / 86400).toFixed(1);
        worstDisplay = (worstTime / 86400).toFixed(1);
        timeUnit = 'days';
    } else if (averageTime > 3600) { // More than an hour
        avgDisplay = (averageTime / 3600).toFixed(1);
        worstDisplay = (worstTime / 3600).toFixed(1);
        timeUnit = 'hours';
    } else if (averageTime > 60) { // More than a minute
        avgDisplay = (averageTime / 60).toFixed(1);
        worstDisplay = (worstTime / 60).toFixed(1);
        timeUnit = 'minutes';
    }
    
    document.getElementById('bruteForceResults').innerHTML = `
        <div class="time-results">
            <div class="time-stat">
                <span class="time-value">${avgDisplay}</span>
                <span class="time-label">Average Time (${timeUnit})</span>
            </div>
            <div class="time-stat">
                <span class="time-value">${worstDisplay}</span>
                <span class="time-label">Worst Case (${timeUnit})</span>
            </div>
            <div class="time-stat">
                <span class="time-value">${combinations.toExponential(2)}</span>
                <span class="time-label">Total Combinations</span>
            </div>
        </div>
    `;
    
    // Update comparison grid
    const comparisonData = [
        { length: 6, charset: 62, time: Math.pow(62, 6) / (2 * speed) },
        { length: 8, charset: 62, time: Math.pow(62, 8) / (2 * speed) },
        { length: 10, charset: 62, time: Math.pow(62, 10) / (2 * speed) },
        { length: 12, charset: 62, time: Math.pow(62, 12) / (2 * speed) }
    ];
    
    document.getElementById('comparisonGrid').innerHTML = comparisonData.map(item => {
        let displayTime = item.time;
        let unit = 'seconds';
        
        if (item.time > 31536000) {
            displayTime = (item.time / 31536000).toFixed(1);
            unit = 'years';
        } else if (item.time > 86400) {
            displayTime = (item.time / 86400).toFixed(1);
            unit = 'days';
        } else if (item.time > 3600) {
            displayTime = (item.time / 3600).toFixed(1);
            unit = 'hours';
        }
        
        return `
            <div class="comparison-item">
                <span class="comparison-length">${item.length} chars</span>
                <span class="comparison-time">${displayTime} ${unit}</span>
            </div>
        `;
    }).join('');
}

function submitBruteForceAssessment() {
    completeSecurityLevel();
    showSecurityCompletionModal(true, 90, 70, 'brute_force');
}

// System Design Functions
function updateArchitecture() {
    const components = {
        ui: ['Login Form'],
        auth: ['Basic Auth'],
        security: ['Password Validation'],
        storage: ['Database']
    };
    
    let score = 45; // Base score
    
    // Check authentication components
    if (document.getElementById('multiFactorAuth')?.checked) {
        components.auth.push('MFA');
        score += 10;
    }
    if (document.getElementById('biometricAuth')?.checked) {
        components.auth.push('Biometrics');
        score += 5;
    }
    if (document.getElementById('ssoIntegration')?.checked) {
        components.auth.push('SSO');
        score += 5;
    }
    
    // Check security components
    if (document.getElementById('rateLimiting')?.checked) {
        components.security.push('Rate Limiting');
        score += 8;
    }
    if (document.getElementById('accountLockout')?.checked) {
        components.security.push('Account Lockout');
        score += 7;
    }
    if (document.getElementById('captchaProtection')?.checked) {
        components.security.push('CAPTCHA');
        score += 5;
    }
    
    // Check storage components
    if (document.getElementById('saltedHashing')?.checked) {
        components.storage.push('Salted Hashing');
        score += 10;
    }
    if (document.getElementById('strongAlgorithm')?.checked) {
        components.storage.push('Strong Hashing');
        score += 5;
    }
    if (document.getElementById('encryptedStorage')?.checked) {
        components.storage.push('Encryption');
        score += 5;
    }
    
    // Update UI components
    if (document.getElementById('captchaProtection')?.checked) {
        components.ui.push('CAPTCHA');
    }
    
    // Update architecture diagram
    document.getElementById('uiComponents').innerHTML = components.ui.map(c => `<span class="component">${c}</span>`).join('');
    document.getElementById('authComponents').innerHTML = components.auth.map(c => `<span class="component">${c}</span>`).join('');
    document.getElementById('securityComponents').innerHTML = components.security.map(c => `<span class="component">${c}</span>`).join('');
    document.getElementById('storageComponents').innerHTML = components.storage.map(c => `<span class="component">${c}</span>`).join('');
    
    // Update security score
    document.getElementById('securityScore').textContent = Math.min(score, 100);
    
    const authScore = Math.min((components.auth.length - 1) * 10, 30);
    const storageScore = Math.min((components.storage.length - 1) * 8, 25);
    const protectionScore = Math.min((components.security.length - 1) * 15, 45);
    
    document.getElementById('scoreBreakdown').innerHTML = `
        <div class="score-item">
            <span class="score-category">Authentication:</span>
            <span class="score-points">${authScore}/30</span>
        </div>
        <div class="score-item">
            <span class="score-category">Storage:</span>
            <span class="score-points">${storageScore}/25</span>
        </div>
        <div class="score-item">
            <span class="score-category">Protection:</span>
            <span class="score-points">${protectionScore}/45</span>
        </div>
    `;
}

// Generic submission functions for levels 4-10
function submitComplexityAssessment() {
    const selectedAnswer = document.querySelector('input[name="entropy"]:checked');
    const passed = selectedAnswer && selectedAnswer.value === 'c';
    const score = passed ? 95 : 60;
    
    completeSecurityLevel();
    showSecurityCompletionModal(passed, score, 75, 'complexity_analysis');
}

function submitHashingAssessment() {
    completeSecurityLevel();
    showSecurityCompletionModal(true, 88, 80, 'hashing_basics');
}

function submitHashCrackingAssessment() {
    completeSecurityLevel();
    showSecurityCompletionModal(true, 82, 70, 'hash_cracking');
}

function submitSaltingAssessment() {
    completeSecurityLevel();
    showSecurityCompletionModal(true, 91, 75, 'salting_defense');
}

function submitRateLimitingAssessment() {
    completeSecurityLevel();
    showSecurityCompletionModal(true, 87, 80, 'rate_limiting');
}

function submitScenarioAssessment() {
    const checkedActions = document.querySelectorAll('.action-checklist input:checked').length;
    const passed = checkedActions >= 3;
    const score = Math.min(60 + (checkedActions * 8), 100);
    
    completeSecurityLevel();
    showSecurityCompletionModal(passed, score, 85, 'attack_scenario');
}

function submitSystemDesignAssessment() {
    const score = parseInt(document.getElementById('securityScore').textContent);
    const passed = score >= 75;
    
    completeSecurityLevel();
    showSecurityCompletionModal(passed, score, 90, 'system_design');
}

// Utility Functions
function updateSecurityProgress(percentage) {
    const progressFill = document.getElementById('passwordProgressFill');
    const progressText = document.getElementById('passwordProgressText');
    
    if (progressFill) {
        progressFill.style.width = `${percentage}%`;
    }
    if (progressText) {
        progressText.textContent = `${Math.round(percentage)}%`;
    }
}

function showSecurityNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `security-notification ${type}`;
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
        max-width: 350px;
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.5);
        font-weight: bold;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 4000);
}

function showSecurityCompletionModal(passed, score, passingScore, levelType) {
    console.log('🎉 Showing security completion modal...');
    console.log('Passed:', passed, 'Score:', score, 'Level Type:', levelType);
    console.log('Current level:', securityTrainingState.currentLevel);
    console.log('Before update - Completed:', securityTrainingState.completedLevels);
    console.log('Before update - Unlocked:', securityTrainingState.unlockedLevels);
    
    const level = securityLevels[securityTrainingState.currentLevel];
    const isLastLevel = securityTrainingState.currentLevel === 10;
    
    let title, message, summary, statusClass;
    
    if (passed) {
        title = '🎉 MISSION ACCOMPLISHED';
        statusClass = 'success';
        message = `Excellent work! You achieved ${score}% accuracy (Required: ${passingScore}%)`;
        
        switch(levelType) {
            case 'password_awareness':
                summary = `
                    <h4>TRAINING COMPLETE:</h4>
                    <p>You have successfully demonstrated the ability to identify password security vulnerabilities and assess risk levels according to cybersecurity standards. This foundational skill is critical for security professionals.</p>
                `;
                break;
            default:
                summary = `
                    <h4>SECURITY KNOWLEDGE ACQUIRED:</h4>
                    <p>You have successfully completed this cybersecurity training module and demonstrated professional-level understanding of the concepts.</p>
                `;
        }
        
        // Mark level as completed and unlock next level
        const currentLevel = securityTrainingState.currentLevel;
        if (!securityTrainingState.completedLevels.includes(currentLevel)) {
            securityTrainingState.completedLevels.push(currentLevel);
            console.log(`✅ Level ${currentLevel} marked as completed`);
        }
        
        // Unlock next level
        const nextLevel = currentLevel + 1;
        if (nextLevel <= 10 && !securityTrainingState.unlockedLevels.includes(nextLevel)) {
            securityTrainingState.unlockedLevels.push(nextLevel);
            console.log(`🔓 Level ${nextLevel} unlocked`);
        }
        
        console.log('After update - Completed:', securityTrainingState.completedLevels);
        console.log('After update - Unlocked:', securityTrainingState.unlockedLevels);
        
    } else {
        title = '📚 ADDITIONAL TRAINING REQUIRED';
        statusClass = 'failure';
        message = `Score: ${score}% (Required: ${passingScore}%). Review the feedback and try again.`;
        summary = `
            <h4>PERFORMANCE ANALYSIS:</h4>
            <p>Your assessment accuracy did not meet the minimum standard for cybersecurity professionals. Review the detailed feedback for each password to understand the security principles and try again.</p>
        `;
    }
    
    const modal = document.createElement('div');
    modal.className = 'security-completion-modal';
    modal.innerHTML = `
        <div class="security-completion-content ${statusClass}">
            <div class="completion-header">
                <div class="completion-title">${title}</div>
                <div class="completion-level">Level ${securityTrainingState.currentLevel}: ${level.title}</div>
            </div>
            <div class="completion-message">${message}</div>
            <div class="completion-summary">${summary}</div>
            <div class="completion-stats">
                <div class="stat-item">
                    <div class="stat-value">${score}%</div>
                    <div class="stat-label">Accuracy</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${level.difficulty}</div>
                    <div class="stat-label">Difficulty</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${level.category}</div>
                    <div class="stat-label">Category</div>
                </div>
            </div>
            <div class="completion-buttons">
                ${passed && !isLastLevel ? `
                    <button class="security-btn primary" onclick="continueToNextSecurityLevel()">
                        CONTINUE TO NEXT LEVEL
                    </button>
                ` : ''}
                ${passed && isLastLevel ? `
                    <button class="security-btn primary" onclick="closeSecurityCompletionModal()">
                        🎉 TRAINING PROGRAM COMPLETE
                    </button>
                ` : ''}
                ${!passed ? `
                    <button class="security-btn primary" onclick="retrySecurityLevel()">
                        RETRY ASSESSMENT
                    </button>
                ` : ''}
                <button class="security-btn secondary" onclick="closeSecurityCompletionModal()">
                    RETURN TO TRAINING MENU
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    window.currentSecurityModal = modal;
    
    console.log('✅ Security completion modal displayed');
}

function continueToNextSecurityLevel() {
    console.log('➡️ Continuing to next security level...');
    console.log('Current level:', securityTrainingState.currentLevel);
    console.log('Completed levels:', securityTrainingState.completedLevels);
    console.log('Unlocked levels:', securityTrainingState.unlockedLevels);
    
    closeSecurityCompletionModal();
    const nextLevelNum = securityTrainingState.currentLevel + 1;
    if (nextLevelNum <= 10 && securityLevels[nextLevelNum]) {
        console.log(`🎯 Starting level ${nextLevelNum}...`);
        resetSecurityLevelState();
        startSecurityLevel(nextLevelNum);
    } else {
        console.log('🏁 No more levels available or invalid next level');
        backToSecurityLevels();
    }
}

function retrySecurityLevel() {
    closeSecurityCompletionModal();
    resetSecurityLevelState();
    startSecurityLevel(securityTrainingState.currentLevel);
}

function closeSecurityCompletionModal() {
    if (window.currentSecurityModal) {
        document.body.removeChild(window.currentSecurityModal);
        window.currentSecurityModal = null;
    }
    
    // Force refresh the level grid to show newly unlocked levels
    console.log('🔄 Refreshing level grid after modal close...');
    console.log('Completed levels:', securityTrainingState.completedLevels);
    console.log('Unlocked levels:', securityTrainingState.unlockedLevels);
    
    backToSecurityLevels();
}

function backToSecurityLevels() {
    console.log('🔙 Returning to security levels...');
    console.log('Current state - Completed:', securityTrainingState.completedLevels);
    console.log('Current state - Unlocked:', securityTrainingState.unlockedLevels);
    
    document.getElementById('passwordGameScreen').style.display = 'none';
    document.getElementById('passwordLevelSelection').style.display = 'block';
    
    // Force re-render of levels to show updated unlock status
    renderSecurityLevels();
    updateTraineeDashboard();
    resetSecurityLevelState();
    
    console.log('✅ Security levels refreshed');
}

function resetSecurityLevelState() {
    console.log('🔄 Resetting security level state...');
    
    // Reset assessment state
    passwordClassifications = {};
    assessmentSubmitted = false;
    
    // Reset UI elements
    const checkBtn = document.getElementById('passwordCheckBtn');
    const continueBtn = document.getElementById('passwordContinueBtn');
    
    if (checkBtn) {
        checkBtn.style.display = 'inline-block';
        checkBtn.disabled = true; // Start disabled until user makes selections
        checkBtn.style.opacity = '1';
        checkBtn.textContent = 'Submit Assessment';
        console.log('✅ Check button reset');
    } else {
        console.warn('⚠️ Check button not found');
    }
    
    if (continueBtn) {
        continueBtn.style.display = 'none';
        console.log('✅ Continue button hidden');
    } else {
        console.warn('⚠️ Continue button not found');
    }
}

function completeSecurityLevel() {
    const currentLevel = securityTrainingState.currentLevel;
    const level = securityLevels[currentLevel];
    
    if (!level) {
        console.error('❌ Cannot complete level: level not found');
        return;
    }
    
    console.log(`✅ Completing security level ${currentLevel} (${level.type})`);
    
    updateSecurityProgress(100);
    showSecurityNotification('Training module completed!', 'success');
    
    // Update level state
    const levelType = level.type;
    if (securityTrainingState.levelStates[levelType]) {
        securityTrainingState.levelStates[levelType].completed = true;
        securityTrainingState.levelStates[levelType].score = 100;
        securityTrainingState.levelStates[levelType].attempts = (securityTrainingState.levelStates[levelType].attempts || 0) + 1;
    }
    
    console.log(`✅ Level ${currentLevel} state updated:`, securityTrainingState.levelStates[levelType]);
}

// Additional functions to match HTML button calls
function checkSecurityLevel() {
    console.log('🔍 Checking security level...');
    console.log('Current level:', securityTrainingState.currentLevel);
    
    const level = securityLevels[securityTrainingState.currentLevel];
    if (!level) {
        console.error('❌ Current level not found');
        showSecurityNotification('Error: Current level not found', 'error');
        return;
    }
    
    console.log('Level type:', level.type);
    
    // Route to appropriate submission function based on level type
    switch (level.type) {
        case 'password_awareness':
            console.log('📝 Submitting password awareness assessment...');
            submitPasswordAssessment();
            break;
        case 'dictionary_attack':
            console.log('📝 Submitting dictionary attack assessment...');
            submitDictionaryAssessment();
            break;
        case 'brute_force':
            console.log('📝 Submitting brute force assessment...');
            submitBruteForceAssessment();
            break;
        case 'complexity_analysis':
            console.log('📝 Submitting complexity analysis assessment...');
            submitComplexityAssessment();
            break;
        case 'hashing_basics':
            console.log('📝 Submitting hashing basics assessment...');
            submitHashingAssessment();
            break;
        case 'hash_cracking':
            console.log('📝 Submitting hash cracking assessment...');
            submitHashCrackingAssessment();
            break;
        case 'salting_defense':
            console.log('📝 Submitting salting defense assessment...');
            submitSaltingAssessment();
            break;
        case 'rate_limiting':
            console.log('📝 Submitting rate limiting assessment...');
            submitRateLimitingAssessment();
            break;
        case 'attack_scenario':
            console.log('📝 Submitting attack scenario assessment...');
            submitScenarioAssessment();
            break;
        case 'system_design':
            console.log('📝 Submitting system design assessment...');
            submitSystemDesignAssessment();
            break;
        default:
            console.log('🎯 Unknown level type, using generic completion...');
            completeSecurityLevel();
            showSecurityCompletionModal(true, 100, level.passingScore, level.type);
            break;
    }
}

function nextSecurityLevel() {
    console.log('➡️ Moving to next security level...');
    continueToNextSecurityLevel();
}

// Make functions globally available
window.showSecurityTraining = showSecurityTraining;
window.renderSecurityLevels = renderSecurityLevels;
window.startSecurityLevel = startSecurityLevel;
window.classifyPassword = classifyPassword;
window.submitPasswordAssessment = submitPasswordAssessment;
window.checkSecurityLevel = checkSecurityLevel;
window.nextSecurityLevel = nextSecurityLevel;
window.continueToNextSecurityLevel = continueToNextSecurityLevel;
window.retrySecurityLevel = retrySecurityLevel;
window.closeSecurityCompletionModal = closeSecurityCompletionModal;
window.backToSecurityLevels = backToSecurityLevels;
window.completeSecurityLevel = completeSecurityLevel;

// Debug functions for testing
window.debugCompleteLevel = function(levelNum) {
    console.log(`🧪 DEBUG: Completing level ${levelNum}...`);
    
    if (!securityTrainingState.completedLevels.includes(levelNum)) {
        securityTrainingState.completedLevels.push(levelNum);
    }
    
    const nextLevel = levelNum + 1;
    if (nextLevel <= 10 && !securityTrainingState.unlockedLevels.includes(nextLevel)) {
        securityTrainingState.unlockedLevels.push(nextLevel);
    }
    
    console.log('Updated state:', {
        completed: securityTrainingState.completedLevels,
        unlocked: securityTrainingState.unlockedLevels
    });
    
    renderSecurityLevels();
    updateTraineeDashboard();
};

window.debugResetState = function() {
    console.log('🧪 DEBUG: Resetting training state...');
    securityTrainingState.completedLevels = [];
    securityTrainingState.unlockedLevels = [1];
    securityTrainingState.currentLevel = 1;
    
    Object.keys(securityTrainingState.levelStates).forEach(key => {
        securityTrainingState.levelStates[key] = {
            completed: false,
            score: 0,
            attempts: 0
        };
    });
    
    renderSecurityLevels();
    updateTraineeDashboard();
};

window.debugShowState = function() {
    console.log('🧪 DEBUG: Current training state:', {
        currentLevel: securityTrainingState.currentLevel,
        completedLevels: securityTrainingState.completedLevels,
        unlockedLevels: securityTrainingState.unlockedLevels,
        levelStates: securityTrainingState.levelStates
    });
};

// Initialize security training system when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔐 Professional Cybersecurity Training System initialized');
    
    // Ensure security training is available globally
    if (typeof window.showSecurityTraining === 'function') {
        console.log('✅ Security training functions available globally');
    } else {
        console.error('❌ Security training functions not available');
    }
    
    // Add event listener for category selection if not already handled
    if (!window.securityTrainingEventListenerAdded) {
        document.addEventListener('click', (e) => {
            const categoryCard = e.target.closest('[data-category="password"]');
            if (categoryCard) {
                console.log('🎯 Password category clicked via security training listener');
                e.preventDefault();
                e.stopPropagation();
                showSecurityTraining();
            }
        });
        window.securityTrainingEventListenerAdded = true;
        console.log('✅ Security training event listener added');
    }
    
    // Add backup event listeners for submit buttons
    setTimeout(() => {
        const checkBtn = document.getElementById('passwordCheckBtn');
        if (checkBtn && !checkBtn.hasAttribute('data-listener-added')) {
            checkBtn.addEventListener('click', function(e) {
                console.log('🔍 Submit button clicked via event listener');
                e.preventDefault();
                checkSecurityLevel();
            });
            checkBtn.setAttribute('data-listener-added', 'true');
            console.log('✅ Backup event listener added to submit button');
        }
        
        const continueBtn = document.getElementById('passwordContinueBtn');
        if (continueBtn && !continueBtn.hasAttribute('data-listener-added')) {
            continueBtn.addEventListener('click', function(e) {
                console.log('➡️ Continue button clicked via event listener');
                e.preventDefault();
                nextSecurityLevel();
            });
            continueBtn.setAttribute('data-listener-added', 'true');
            console.log('✅ Backup event listener added to continue button');
        }
    }, 1000);
});

// Also initialize when window loads (fallback)
window.addEventListener('load', function() {
    console.log('🔐 Professional Cybersecurity Training System ready');
    
    // Additional backup for button event listeners
    setTimeout(() => {
        const checkBtn = document.getElementById('passwordCheckBtn');
        if (checkBtn) {
            console.log('🔍 Submit button found on window load');
            console.log('Button onclick:', checkBtn.getAttribute('onclick'));
            console.log('Button disabled:', checkBtn.disabled);
            console.log('Button display:', checkBtn.style.display);
        } else {
            console.log('⚠️ Submit button not found on window load');
        }
    }, 2000);
});