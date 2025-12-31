// Password Cracking & Defense Simulation Game
// Interactive gameplay-focused cybersecurity training

let gameState = {
    currentLevel: 1,
    unlockedLevels: [1],
    completedLevels: [],
    playerStats: {
        name: "Security Trainee",
        rank: "Junior Analyst",
        totalScore: 0,
        systemsSecured: 0,
        attacksBlocked: 0
    },
    levelScores: {},
    gameTimer: null,
    levelStartTime: 0
};

const gameLevels = {
    1: {
        title: "System Breach Prevention",
        type: "password_selection",
        description: "Live system under attack - identify vulnerable passwords before breach",
        timeLimit: 120,
        passingScore: 80
    },
    2: {
        title: "Dictionary Attack Defense",
        type: "attack_defense",
        description: "Stop the automated dictionary attack in progress",
        timeLimit: 90,
        passingScore: 75
    },
    3: {
        title: "Brute Force Battle",
        type: "brute_force_sim",
        description: "Configure password strength against live brute force attack",
        timeLimit: 150,
        passingScore: 70
    },
    4: {
        title: "Password Policy Under Fire",
        type: "policy_defense",
        description: "Adapt password rules as attack patterns change",
        timeLimit: 180,
        passingScore: 75
    },
    5: {
        title: "Storage Security Crisis",
        type: "storage_game",
        description: "Choose password storage method before system breach",
        timeLimit: 100,
        passingScore: 80
    }
};

// Game Initialization
function initializePasswordCrackingGame() {
    console.log('🎮 Initializing Password Cracking & Defense Game...');
    
    // Override the existing training system functions
    window.showSecurityTraining = showPasswordCrackingGame;
    window.renderSecurityLevels = renderGameLevels;
    window.startSecurityLevel = startGameLevel;
    
    // Also override the old function names for compatibility
    window.showPasswordTraining = showPasswordCrackingGame;
    window.renderPasswordLevels = renderGameLevels;
    
    console.log('✅ Password Cracking Game initialized');
    
    // Auto-initialize if we're on the password missions screen
    setTimeout(() => {
        const passwordScreen = document.getElementById('password-missions');
        if (passwordScreen && passwordScreen.style.display !== 'none') {
            showPasswordCrackingGame();
        }
    }, 500);
}

function showPasswordCrackingGame() {
    console.log('🎮 Starting Password Cracking & Defense Game...');
    
    // Show game screen
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        screen.classList.remove('active');
        screen.style.display = 'none';
    });
    
    const gameScreen = document.getElementById('password-missions');
    if (gameScreen) {
        gameScreen.classList.add('active');
        gameScreen.style.display = 'block';
        console.log('✅ Game screen shown');
    } else {
        console.error('❌ password-missions screen not found');
    }
    
    // Show level selection
    const levelSelection = document.getElementById('passwordLevelSelection');
    const gameScreenInner = document.getElementById('passwordGameScreen');
    
    if (levelSelection) {
        levelSelection.style.display = 'block';
        console.log('✅ Level selection shown');
    } else {
        console.error('❌ passwordLevelSelection not found');
    }
    
    if (gameScreenInner) {
        gameScreenInner.style.display = 'none';
        console.log('✅ Game screen hidden');
    }
    
    // Force render levels
    console.log('🎯 Force rendering levels...');
    renderGameLevels();
    updatePlayerStats();
    
    // Double-check that levels were rendered
    setTimeout(() => {
        const grid = document.getElementById('passwordLevelsGrid');
        if (grid) {
            console.log(`📊 Grid check: ${grid.children.length} children found`);
            if (grid.children.length === 0) {
                console.error('❌ No levels rendered, trying manual creation...');
                createManualTestLevel();
            }
        }
    }, 100);
}

function createManualTestLevel() {
    console.log('🧪 Creating manual test level...');
    const grid = document.getElementById('passwordLevelsGrid');
    if (!grid) return;
    
    const testCard = document.createElement('div');
    testCard.className = 'security-level-card unlocked';
    testCard.style.cursor = 'pointer';
    testCard.onclick = () => {
        console.log('🎯 Test level clicked');
        startGameLevel(1);
    };
    
    testCard.innerHTML = `
        <div class="security-level-header">
            <div class="security-level-number">LEVEL 1</div>
            <div class="security-level-category">ACTIVE THREAT</div>
        </div>
        <div class="security-level-title">System Breach Prevention</div>
        <div class="security-level-description">Live system under attack - identify vulnerable passwords before breach</div>
        <div class="security-level-meta">
            <div class="security-level-time">⏱️ 2:00</div>
            <div class="security-level-passing">🎯 80%</div>
        </div>
        <div class="security-level-status">
            <span class="security-status-text">UNDER ATTACK</span>
            <span class="security-status-icon available">⚡</span>
        </div>
    `;
    
    grid.appendChild(testCard);
    console.log('✅ Manual test level created');
}
function renderGameLevels() {
    console.log('🎯 Rendering game levels...');
    console.log('Game state:', gameState);
    console.log('Game levels:', gameLevels);
    
    const grid = document.getElementById('passwordLevelsGrid');
    if (!grid) {
        console.error('❌ passwordLevelsGrid element not found!');
        return;
    }
    
    console.log('✅ Found grid element, clearing and populating...');
    grid.innerHTML = '';
    
    for (let i = 1; i <= 5; i++) {
        const level = gameLevels[i];
        if (!level) {
            console.error(`❌ Level ${i} not found in gameLevels`);
            continue;
        }
        
        console.log(`Creating card for Level ${i}: ${level.title}`);
        
        const isUnlocked = gameState.unlockedLevels.includes(i);
        const isCompleted = gameState.completedLevels.includes(i);
        const score = gameState.levelScores[i] || 0;

        const card = document.createElement('div');
        card.className = `security-level-card ${isCompleted ? 'completed' : (isUnlocked ? 'unlocked' : 'locked')}`;
        
        if (isUnlocked) {
            card.onclick = () => {
                console.log(`🎯 Starting level ${i}`);
                startGameLevel(i);
            };
            card.style.cursor = 'pointer';
        } else {
            card.style.cursor = 'not-allowed';
        }

        let statusText, statusIcon;
        if (isCompleted) {
            statusText = `SECURED (${score}%)`;
            statusIcon = '<span class="security-status-icon completed">✓</span>';
        } else if (isUnlocked) {
            statusText = 'UNDER ATTACK';
            statusIcon = '<span class="security-status-icon available">⚡</span>';
        } else {
            statusText = 'LOCKED';
            statusIcon = '<span class="security-status-icon locked">🔒</span>';
        }

        card.innerHTML = `
            <div class="security-level-header">
                <div class="security-level-number">LEVEL ${i}</div>
                <div class="security-level-category">ACTIVE THREAT</div>
            </div>
            <div class="security-level-title">${level.title}</div>
            <div class="security-level-description">${level.description}</div>
            <div class="security-level-meta">
                <div class="security-level-time">⏱️ ${Math.floor(level.timeLimit / 60)}:${(level.timeLimit % 60).toString().padStart(2, '0')}</div>
                <div class="security-level-passing">🎯 ${level.passingScore}%</div>
            </div>
            <div class="security-level-status">
                <span class="security-status-text">${statusText}</span>
                ${statusIcon}
            </div>
        `;

        grid.appendChild(card);
        console.log(`✅ Added Level ${i} card to grid`);
    }
    
    console.log(`✅ Rendered ${grid.children.length} game levels`);
}

function updatePlayerStats() {
    const completedCount = gameState.completedLevels.length;
    const totalScore = Object.values(gameState.levelScores).reduce((sum, score) => sum + score, 0);
    const averageScore = completedCount > 0 ? Math.round(totalScore / completedCount) : 0;
    
    // Update rank based on progress
    let rank = "Junior Analyst";
    if (completedCount >= 4) rank = "Senior Security Specialist";
    else if (completedCount >= 3) rank = "Security Analyst";
    else if (completedCount >= 2) rank = "Associate Analyst";
    
    document.getElementById('traineeRank').textContent = rank;
    document.getElementById('completedLevels').textContent = `${completedCount}/5`;
    document.getElementById('overallScore').textContent = `${averageScore}%`;
    
    gameState.playerStats.rank = rank;
    gameState.playerStats.totalScore = averageScore;
}

// Game Level Starter
function startGameLevel(levelNum) {
    if (!gameState.unlockedLevels.includes(levelNum)) {
        showGameNotification('ACCESS DENIED: Complete previous levels first', 'error');
        return;
    }

    gameState.currentLevel = levelNum;
    gameState.levelStartTime = Date.now();
    
    const level = gameLevels[levelNum];
    
    // Switch to game interface
    document.getElementById('passwordLevelSelection').style.display = 'none';
    document.getElementById('passwordGameScreen').style.display = 'flex';
    
    // Update game header
    document.getElementById('passwordCurrentLevel').innerHTML = `
        <div class="game-level-info">
            <div class="game-level-number">LEVEL ${levelNum}</div>
            <div class="game-level-title">${level.title}</div>
            <div class="game-status">SYSTEM UNDER ATTACK</div>
        </div>
    `;
    
    document.getElementById('passwordLevelObjective').innerHTML = `
        <div class="game-objective">
            <div class="objective-text">${level.description}</div>
            <div class="objective-timer">
                <span class="timer-label">TIME REMAINING:</span>
                <span class="timer-display" id="gameTimer">${formatTime(level.timeLimit)}</span>
            </div>
        </div>
    `;
    
    // Start game timer
    startGameTimer(level.timeLimit);
    
    // Load level-specific game
    loadGameLevel(level);
    
    // Show game controls
    document.getElementById('passwordCheckBtn').style.display = 'none';
    document.getElementById('passwordContinueBtn').style.display = 'none';
}

function startGameTimer(timeLimit) {
    let timeRemaining = timeLimit;
    
    if (gameState.gameTimer) {
        clearInterval(gameState.gameTimer);
    }
    
    gameState.gameTimer = setInterval(() => {
        timeRemaining--;
        document.getElementById('gameTimer').textContent = formatTime(timeRemaining);
        
        if (timeRemaining <= 0) {
            clearInterval(gameState.gameTimer);
            gameTimeUp();
        }
    }, 1000);
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function gameTimeUp() {
    showGameNotification('TIME UP! System compromised!', 'error');
    endGameLevel(false, 0);
}
// Game Level Loader
function loadGameLevel(level) {
    const content = document.getElementById('passwordGameContent');
    
    switch (level.type) {
        case 'password_selection':
            renderPasswordSelectionGame(content, level);
            break;
        case 'attack_defense':
            renderAttackDefenseGame(content, level);
            break;
        case 'brute_force_sim':
            renderBruteForceGame(content, level);
            break;
        default:
            content.innerHTML = '<div class="game-error">Game level not implemented</div>';
    }
}

// Level 1: Password Selection Game
function renderPasswordSelectionGame(container, level) {
    const passwords = [
        { text: "admin", vulnerable: true, reason: "Default password" },
        { text: "P@ssw0rd2024!", vulnerable: false, reason: "Strong complexity" },
        { text: "123456789", vulnerable: true, reason: "Sequential numbers" },
        { text: "MyDog2023", vulnerable: true, reason: "Dictionary word + year" },
        { text: "Tr0ub4dor&3", vulnerable: false, reason: "High entropy" },
        { text: "password", vulnerable: true, reason: "Most common password" },
        { text: "qwerty123", vulnerable: true, reason: "Keyboard pattern" },
        { text: "X9$mK2#vL8@pQ", vulnerable: false, reason: "Random pattern" }
    ];
    
    let selectedPasswords = [];
    let gameActive = true;
    
    container.innerHTML = `
        <div class="game-interface">
            <div class="system-status">
                <div class="status-header">
                    <span class="status-icon">🚨</span>
                    <span class="status-text">CORPORATE LOGIN SYSTEM</span>
                    <span class="threat-level">THREAT LEVEL: HIGH</span>
                </div>
                <div class="system-info">
                    <div class="info-item">
                        <span class="label">Active Users:</span>
                        <span class="value">247</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Failed Attempts:</span>
                        <span class="value" id="failedAttempts">0</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Systems Secured:</span>
                        <span class="value" id="systemsSecured">0</span>
                    </div>
                </div>
            </div>
            
            <div class="game-mission">
                <div class="mission-text">
                    🎯 <strong>MISSION:</strong> Identify and secure vulnerable passwords before system breach
                </div>
                <div class="mission-warning">
                    ⚠️ Wrong selection = Immediate system compromise
                </div>
            </div>
            
            <div class="password-grid" id="passwordGrid">
                ${passwords.map((pwd, index) => `
                    <div class="password-item" data-index="${index}" onclick="selectPassword(${index})">
                        <div class="password-text">${pwd.text}</div>
                        <div class="password-length">${pwd.text.length} chars</div>
                        <div class="selection-status" id="status-${index}"></div>
                    </div>
                `).join('')}
            </div>
            
            <div class="game-actions">
                <button class="game-btn primary" onclick="scanSelectedPasswords()" id="scanBtn">
                    🔍 SCAN SELECTED PASSWORDS
                </button>
                <button class="game-btn secondary" onclick="clearSelections()">
                    🔄 CLEAR SELECTIONS
                </button>
            </div>
            
            <div class="attack-log" id="attackLog">
                <div class="log-header">🔍 SECURITY SCAN LOG</div>
                <div class="log-content" id="logContent">
                    <div class="log-entry">System ready for password security scan...</div>
                </div>
            </div>
        </div>
    `;
    
    // Store game data
    window.currentGameData = { passwords, selectedPasswords, gameActive };
}

function selectPassword(index) {
    if (!window.currentGameData.gameActive) return;
    
    const { selectedPasswords } = window.currentGameData;
    const passwordItem = document.querySelector(`[data-index="${index}"]`);
    const statusElement = document.getElementById(`status-${index}`);
    
    if (selectedPasswords.includes(index)) {
        // Deselect
        selectedPasswords.splice(selectedPasswords.indexOf(index), 1);
        passwordItem.classList.remove('selected');
        statusElement.innerHTML = '';
    } else {
        // Select
        selectedPasswords.push(index);
        passwordItem.classList.add('selected');
        statusElement.innerHTML = '<span class="selected-indicator">SELECTED</span>';
    }
    
    // Update scan button
    const scanBtn = document.getElementById('scanBtn');
    scanBtn.disabled = selectedPasswords.length === 0;
    scanBtn.textContent = selectedPasswords.length > 0 ? 
        `🔍 SCAN ${selectedPasswords.length} PASSWORDS` : 
        '🔍 SCAN SELECTED PASSWORDS';
}

function clearSelections() {
    if (!window.currentGameData.gameActive) return;
    
    window.currentGameData.selectedPasswords = [];
    document.querySelectorAll('.password-item').forEach(item => {
        item.classList.remove('selected');
    });
    document.querySelectorAll('.selection-status').forEach(status => {
        status.innerHTML = '';
    });
    
    const scanBtn = document.getElementById('scanBtn');
    scanBtn.disabled = true;
    scanBtn.textContent = '🔍 SCAN SELECTED PASSWORDS';
}
function scanSelectedPasswords() {
    const { passwords, selectedPasswords } = window.currentGameData;
    
    if (selectedPasswords.length === 0) return;
    
    window.currentGameData.gameActive = false;
    
    const logContent = document.getElementById('logContent');
    const scanBtn = document.getElementById('scanBtn');
    
    scanBtn.disabled = true;
    scanBtn.textContent = '🔍 SCANNING...';
    
    let vulnerableFound = 0;
    let secureFound = 0;
    let totalVulnerable = passwords.filter(p => p.vulnerable).length;
    
    // Simulate scanning process
    selectedPasswords.forEach((index, i) => {
        setTimeout(() => {
            const password = passwords[index];
            const passwordItem = document.querySelector(`[data-index="${index}"]`);
            
            if (password.vulnerable) {
                vulnerableFound++;
                passwordItem.classList.add('vulnerable');
                logContent.innerHTML += `<div class="log-entry vulnerable">⚠️ VULNERABLE: ${password.text} - ${password.reason}</div>`;
            } else {
                secureFound++;
                passwordItem.classList.add('secure');
                logContent.innerHTML += `<div class="log-entry secure">✅ SECURE: ${password.text} - ${password.reason}</div>`;
            }
            
            // Update counters
            document.getElementById('systemsSecured').textContent = secureFound;
            
            // Check if scan complete
            if (i === selectedPasswords.length - 1) {
                setTimeout(() => {
                    completePasswordSelectionGame(vulnerableFound, secureFound, totalVulnerable);
                }, 1000);
            }
        }, i * 800);
    });
}

function completePasswordSelectionGame(vulnerableFound, secureFound, totalVulnerable) {
    const logContent = document.getElementById('logContent');
    
    // Calculate score
    const vulnerableIdentified = vulnerableFound;
    const falsePositives = secureFound; // Secure passwords incorrectly flagged
    const missedVulnerable = totalVulnerable - vulnerableFound;
    
    let score = 0;
    score += vulnerableIdentified * 20; // 20 points per vulnerable found
    score -= falsePositives * 10; // -10 points per false positive
    score -= missedVulnerable * 15; // -15 points per missed vulnerable
    score = Math.max(0, Math.min(100, score));
    
    const passed = score >= gameLevels[gameState.currentLevel].passingScore;
    
    logContent.innerHTML += `<div class="log-entry summary">
        📊 SCAN COMPLETE<br>
        Vulnerable Identified: ${vulnerableIdentified}/${totalVulnerable}<br>
        False Positives: ${falsePositives}<br>
        Security Score: ${score}%
    </div>`;
    
    if (passed) {
        logContent.innerHTML += `<div class="log-entry success">✅ SYSTEM SECURED - Mission Success!</div>`;
        showGameNotification('System secured successfully!', 'success');
    } else {
        logContent.innerHTML += `<div class="log-entry failure">❌ SYSTEM COMPROMISED - Mission Failed!</div>`;
        showGameNotification('System compromised! Try again.', 'error');
    }
    
    setTimeout(() => {
        endGameLevel(passed, score);
    }, 2000);
}

// Level 2: Attack Defense Game
function renderAttackDefenseGame(container, level) {
    const targetAccounts = [
        { username: "admin@company.com", password: "password123", cracked: false },
        { username: "user1@company.com", password: "qwerty", cracked: false },
        { username: "manager@company.com", password: "Secure2024!", cracked: false },
        { username: "dev@company.com", password: "123456", cracked: false },
        { username: "support@company.com", password: "P@ssw0rd!", cracked: false }
    ];
    
    let attackProgress = 0;
    let attackActive = true;
    let defenseActive = false;
    
    container.innerHTML = `
        <div class="game-interface">
            <div class="attack-status">
                <div class="status-header">
                    <span class="status-icon">⚡</span>
                    <span class="status-text">DICTIONARY ATTACK IN PROGRESS</span>
                    <span class="attack-speed">1,247 attempts/sec</span>
                </div>
                <div class="attack-progress">
                    <div class="progress-label">Attack Progress</div>
                    <div class="progress-bar">
                        <div class="progress-fill" id="attackProgressFill"></div>
                    </div>
                    <div class="progress-text" id="attackProgressText">0%</div>
                </div>
            </div>
            
            <div class="target-systems">
                <div class="systems-header">🎯 TARGET ACCOUNTS</div>
                <div class="accounts-grid" id="accountsGrid">
                    ${targetAccounts.map((account, index) => `
                        <div class="account-item" data-index="${index}">
                            <div class="account-username">${account.username}</div>
                            <div class="account-status" id="accountStatus-${index}">SECURE</div>
                            <div class="crack-progress">
                                <div class="crack-bar">
                                    <div class="crack-fill" id="crackFill-${index}"></div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="defense-controls">
                <div class="controls-header">🛡️ DEFENSE CONTROLS</div>
                <div class="defense-options">
                    <button class="defense-btn" onclick="activateRateLimit()" id="rateLimitBtn">
                        🚦 ACTIVATE RATE LIMITING
                    </button>
                    <button class="defense-btn" onclick="blockAttackerIP()" id="blockIPBtn">
                        🚫 BLOCK ATTACKER IP
                    </button>
                    <button class="defense-btn" onclick="enableAccountLockout()" id="lockoutBtn">
                        🔒 ENABLE ACCOUNT LOCKOUT
                    </button>
                    <button class="defense-btn" onclick="forcePasswordReset()" id="resetBtn">
                        🔄 FORCE PASSWORD RESET
                    </button>
                </div>
            </div>
            
            <div class="attack-log" id="attackLog">
                <div class="log-header">📊 ATTACK LOG</div>
                <div class="log-content" id="attackLogContent">
                    <div class="log-entry">Dictionary attack initiated from 192.168.1.100</div>
                    <div class="log-entry">Targeting 5 user accounts...</div>
                    <div class="log-entry">Using common password wordlist (10,000 entries)</div>
                </div>
            </div>
        </div>
    `;
    
    // Store game data and start attack simulation
    window.currentGameData = { targetAccounts, attackProgress, attackActive, defenseActive };
    startDictionaryAttackSimulation();
}
function startDictionaryAttackSimulation() {
    const { targetAccounts } = window.currentGameData;
    const logContent = document.getElementById('attackLogContent');
    
    const attackInterval = setInterval(() => {
        if (!window.currentGameData.attackActive) {
            clearInterval(attackInterval);
            return;
        }
        
        window.currentGameData.attackProgress += Math.random() * 3 + 1;
        const progress = Math.min(100, window.currentGameData.attackProgress);
        
        document.getElementById('attackProgressFill').style.width = `${progress}%`;
        document.getElementById('attackProgressText').textContent = `${Math.round(progress)}%`;
        
        // Simulate account cracking attempts
        targetAccounts.forEach((account, index) => {
            if (!account.cracked && Math.random() < 0.02) {
                const crackProgress = Math.min(100, (Math.random() * 20 + progress * 0.8));
                document.getElementById(`crackFill-${index}`).style.width = `${crackProgress}%`;
                
                // Check if account gets cracked (weak passwords crack faster)
                const isWeakPassword = ["password123", "qwerty", "123456"].includes(account.password);
                if (isWeakPassword && crackProgress > 60) {
                    account.cracked = true;
                    document.getElementById(`accountStatus-${index}`).textContent = "COMPROMISED";
                    document.getElementById(`accountStatus-${index}`).className = "account-status compromised";
                    logContent.innerHTML += `<div class="log-entry compromised">💥 ACCOUNT COMPROMISED: ${account.username} - Password: ${account.password}</div>`;
                    
                    // Check if game should end
                    const compromisedCount = targetAccounts.filter(a => a.cracked).length;
                    if (compromisedCount >= 3) {
                        window.currentGameData.attackActive = false;
                        setTimeout(() => {
                            endAttackDefenseGame(false, 0);
                        }, 1000);
                    }
                }
            }
        });
        
        if (progress >= 100) {
            window.currentGameData.attackActive = false;
            setTimeout(() => {
                endAttackDefenseGame(false, 20);
            }, 1000);
        }
    }, 500);
}

function activateRateLimit() {
    if (!window.currentGameData.attackActive) return;
    
    const logContent = document.getElementById('attackLogContent');
    const btn = document.getElementById('rateLimitBtn');
    
    btn.disabled = true;
    btn.textContent = '✅ RATE LIMITING ACTIVE';
    
    logContent.innerHTML += `<div class="log-entry defense">🚦 Rate limiting activated - Attack speed reduced by 60%</div>`;
    
    // Slow down attack
    window.currentGameData.attackProgress *= 0.7;
    
    setTimeout(() => {
        checkDefenseSuccess();
    }, 2000);
}

function blockAttackerIP() {
    if (!window.currentGameData.attackActive) return;
    
    const logContent = document.getElementById('attackLogContent');
    const btn = document.getElementById('blockIPBtn');
    
    btn.disabled = true;
    btn.textContent = '✅ IP BLOCKED';
    
    logContent.innerHTML += `<div class="log-entry defense">🚫 Attacker IP 192.168.1.100 blocked - Attack stopped</div>`;
    
    window.currentGameData.attackActive = false;
    
    setTimeout(() => {
        endAttackDefenseGame(true, 95);
    }, 1500);
}

function enableAccountLockout() {
    if (!window.currentGameData.attackActive) return;
    
    const logContent = document.getElementById('attackLogContent');
    const btn = document.getElementById('lockoutBtn');
    
    btn.disabled = true;
    btn.textContent = '✅ LOCKOUT ENABLED';
    
    logContent.innerHTML += `<div class="log-entry defense">🔒 Account lockout enabled - Accounts protected after 3 failed attempts</div>`;
    
    // Protect accounts from further cracking
    window.currentGameData.targetAccounts.forEach((account, index) => {
        if (!account.cracked) {
            document.getElementById(`accountStatus-${index}`).textContent = "LOCKED";
            document.getElementById(`accountStatus-${index}`).className = "account-status locked";
        }
    });
    
    setTimeout(() => {
        checkDefenseSuccess();
    }, 2000);
}

function forcePasswordReset() {
    if (!window.currentGameData.attackActive) return;
    
    const logContent = document.getElementById('attackLogContent');
    const btn = document.getElementById('resetBtn');
    
    btn.disabled = true;
    btn.textContent = '✅ PASSWORDS RESET';
    
    logContent.innerHTML += `<div class="log-entry defense">🔄 Emergency password reset initiated - All accounts secured</div>`;
    
    window.currentGameData.attackActive = false;
    
    setTimeout(() => {
        endAttackDefenseGame(true, 85);
    }, 1500);
}

function checkDefenseSuccess() {
    const compromisedCount = window.currentGameData.targetAccounts.filter(a => a.cracked).length;
    
    if (compromisedCount < 3 && window.currentGameData.attackProgress < 90) {
        window.currentGameData.attackActive = false;
        endAttackDefenseGame(true, 80);
    }
}

function endAttackDefenseGame(success, score) {
    const logContent = document.getElementById('attackLogContent');
    
    if (success) {
        logContent.innerHTML += `<div class="log-entry success">✅ ATTACK SUCCESSFULLY BLOCKED - System Secured!</div>`;
        showGameNotification('Attack blocked successfully!', 'success');
    } else {
        logContent.innerHTML += `<div class="log-entry failure">❌ SYSTEM COMPROMISED - Multiple accounts breached!</div>`;
        showGameNotification('System compromised!', 'error');
    }
    
    setTimeout(() => {
        endGameLevel(success, score);
    }, 2000);
}
// Game Completion Functions
function endGameLevel(success, score) {
    if (gameState.gameTimer) {
        clearInterval(gameState.gameTimer);
    }
    
    const level = gameLevels[gameState.currentLevel];
    const passed = success && score >= level.passingScore;
    
    // Store score
    gameState.levelScores[gameState.currentLevel] = score;
    
    if (passed) {
        // Mark as completed and unlock next level
        if (!gameState.completedLevels.includes(gameState.currentLevel)) {
            gameState.completedLevels.push(gameState.currentLevel);
        }
        
        const nextLevel = gameState.currentLevel + 1;
        if (nextLevel <= 5 && !gameState.unlockedLevels.includes(nextLevel)) {
            gameState.unlockedLevels.push(nextLevel);
        }
        
        // Update stats
        gameState.playerStats.systemsSecured++;
        if (gameState.currentLevel >= 2) {
            gameState.playerStats.attacksBlocked++;
        }
    }
    
    showGameCompletionModal(passed, score, level);
}

function showGameCompletionModal(passed, score, level) {
    const modal = document.createElement('div');
    modal.className = 'game-completion-modal';
    
    const title = passed ? '🎉 MISSION ACCOMPLISHED' : '💥 MISSION FAILED';
    const statusClass = passed ? 'success' : 'failure';
    const message = passed ? 
        `System secured with ${score}% efficiency!` : 
        `System compromised. Score: ${score}%`;
    
    modal.innerHTML = `
        <div class="game-completion-content ${statusClass}">
            <div class="completion-header">
                <div class="completion-title">${title}</div>
                <div class="completion-level">Level ${gameState.currentLevel}: ${level.title}</div>
            </div>
            <div class="completion-message">${message}</div>
            <div class="completion-stats">
                <div class="stat-item">
                    <div class="stat-value">${score}%</div>
                    <div class="stat-label">Efficiency</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${gameState.playerStats.systemsSecured}</div>
                    <div class="stat-label">Systems Secured</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${gameState.playerStats.attacksBlocked}</div>
                    <div class="stat-label">Attacks Blocked</div>
                </div>
            </div>
            <div class="completion-buttons">
                ${passed && gameState.currentLevel < 5 ? `
                    <button class="game-btn primary" onclick="continueToNextLevel()">
                        CONTINUE TO NEXT LEVEL
                    </button>
                ` : ''}
                ${passed && gameState.currentLevel === 5 ? `
                    <button class="game-btn primary" onclick="closeGameModal()">
                        🎉 TRAINING COMPLETE
                    </button>
                ` : ''}
                ${!passed ? `
                    <button class="game-btn primary" onclick="retryLevel()">
                        RETRY MISSION
                    </button>
                ` : ''}
                <button class="game-btn secondary" onclick="closeGameModal()">
                    RETURN TO MENU
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    window.currentGameModal = modal;
}

function continueToNextLevel() {
    closeGameModal();
    const nextLevel = gameState.currentLevel + 1;
    if (nextLevel <= 5) {
        startGameLevel(nextLevel);
    }
}

function retryLevel() {
    closeGameModal();
    startGameLevel(gameState.currentLevel);
}

function closeGameModal() {
    if (window.currentGameModal) {
        document.body.removeChild(window.currentGameModal);
        window.currentGameModal = null;
    }
    backToGameMenu();
}

function backToGameMenu() {
    if (gameState.gameTimer) {
        clearInterval(gameState.gameTimer);
    }
    
    document.getElementById('passwordGameScreen').style.display = 'none';
    document.getElementById('passwordLevelSelection').style.display = 'block';
    
    renderGameLevels();
    updatePlayerStats();
}

function showGameNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `game-notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.95);
        border: 2px solid ${type === 'success' ? '#00ff41' : type === 'error' ? '#ff006e' : '#00f3ff'};
        color: ${type === 'success' ? '#00ff41' : type === 'error' ? '#ff006e' : '#00f3ff'};
        border-radius: 8px;
        padding: 15px 20px;
        z-index: 1000;
        font-family: 'Courier New', monospace;
        max-width: 350px;
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

// Global function exports
window.showPasswordCrackingGame = showPasswordCrackingGame;
window.renderGameLevels = renderGameLevels;
window.startGameLevel = startGameLevel;
window.selectPassword = selectPassword;
window.clearSelections = clearSelections;
window.scanSelectedPasswords = scanSelectedPasswords;
window.activateRateLimit = activateRateLimit;
window.blockAttackerIP = blockAttackerIP;
window.enableAccountLockout = enableAccountLockout;
window.forcePasswordReset = forcePasswordReset;
window.updatePassword = updatePassword;
window.generateStrongPassword = generateStrongPassword;
window.continueToNextLevel = continueToNextLevel;
window.retryLevel = retryLevel;
window.closeGameModal = closeGameModal;
window.backToGameMenu = backToGameMenu;
window.createManualTestLevel = createManualTestLevel;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎮 Password Cracking Game ready');
    initializePasswordCrackingGame();
    
    // Add a manual test function to window for debugging
    window.testGameRender = function() {
        console.log('🧪 Manual test: rendering game levels...');
        renderGameLevels();
        updatePlayerStats();
    };
    
    window.testGameShow = function() {
        console.log('🧪 Manual test: showing game...');
        showPasswordCrackingGame();
    };
});
// Level 3: Brute Force Game
function renderBruteForceGame(container, level) {
    let currentPassword = "pass123";
    let attackSpeed = 1000000; // attempts per second
    let passwordStrength = calculatePasswordStrength(currentPassword);
    let attackActive = true;
    let timeToBreak = calculateBreakTime(currentPassword, attackSpeed);
    
    container.innerHTML = `
        <div class="game-interface">
            <div class="attack-status">
                <div class="status-header">
                    <span class="status-icon">⚡</span>
                    <span class="status-text">BRUTE FORCE ATTACK ACTIVE</span>
                    <span class="attack-speed">${attackSpeed.toLocaleString()} attempts/sec</span>
                </div>
                <div class="attack-timer">
                    <div class="timer-label">Estimated Break Time:</div>
                    <div class="timer-value" id="breakTimer">${formatBreakTime(timeToBreak)}</div>
                </div>
            </div>
            
            <div class="password-config">
                <div class="config-header">🔧 PASSWORD CONFIGURATION</div>
                <div class="password-display">
                    <div class="password-label">Current Password:</div>
                    <div class="password-value" id="currentPassword">${currentPassword}</div>
                    <div class="strength-meter">
                        <div class="strength-bar">
                            <div class="strength-fill" id="strengthFill" style="width: ${passwordStrength}%"></div>
                        </div>
                        <div class="strength-text" id="strengthText">${getStrengthLabel(passwordStrength)}</div>
                    </div>
                </div>
                
                <div class="config-controls">
                    <div class="control-group">
                        <label>Password Length:</label>
                        <input type="range" id="lengthSlider" min="4" max="20" value="7" oninput="updatePassword()">
                        <span id="lengthDisplay">7</span>
                    </div>
                    <div class="control-group">
                        <label>Character Types:</label>
                        <div class="checkbox-group">
                            <label><input type="checkbox" id="lowercase" checked onchange="updatePassword()"> Lowercase</label>
                            <label><input type="checkbox" id="uppercase" onchange="updatePassword()"> Uppercase</label>
                            <label><input type="checkbox" id="numbers" checked onchange="updatePassword()"> Numbers</label>
                            <label><input type="checkbox" id="symbols" onchange="updatePassword()"> Symbols</label>
                        </div>
                    </div>
                    <button class="game-btn primary" onclick="generateStrongPassword()">
                        🎲 GENERATE STRONG PASSWORD
                    </button>
                </div>
            </div>
            
            <div class="attack-progress">
                <div class="progress-header">🎯 ATTACK PROGRESS</div>
                <div class="progress-display">
                    <div class="attempts-counter">
                        <span class="counter-label">Attempts Made:</span>
                        <span class="counter-value" id="attemptsCounter">0</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" id="bruteProgressFill"></div>
                    </div>
                    <div class="progress-percentage" id="bruteProgressText">0%</div>
                </div>
            </div>
            
            <div class="defense-status" id="defenseStatus">
                <div class="status-message">Configure a strong password to defend against the attack!</div>
            </div>
        </div>
    `;
    
    window.currentGameData = { 
        currentPassword, 
        attackSpeed, 
        passwordStrength, 
        attackActive, 
        timeToBreak,
        attemptsMade: 0,
        startTime: Date.now()
    };
    
    startBruteForceAttack();
}

function calculatePasswordStrength(password) {
    let charset = 0;
    if (/[a-z]/.test(password)) charset += 26;
    if (/[A-Z]/.test(password)) charset += 26;
    if (/[0-9]/.test(password)) charset += 10;
    if (/[^a-zA-Z0-9]/.test(password)) charset += 32;
    
    const combinations = Math.pow(charset, password.length);
    const entropy = Math.log2(combinations);
    
    return Math.min(100, entropy * 2); // Scale to 0-100
}

function calculateBreakTime(password, attackSpeed) {
    let charset = 0;
    if (/[a-z]/.test(password)) charset += 26;
    if (/[A-Z]/.test(password)) charset += 26;
    if (/[0-9]/.test(password)) charset += 10;
    if (/[^a-zA-Z0-9]/.test(password)) charset += 32;
    
    const combinations = Math.pow(charset, password.length);
    return combinations / (2 * attackSpeed); // Average case
}

function formatBreakTime(seconds) {
    if (seconds < 60) return `${seconds.toFixed(1)} seconds`;
    if (seconds < 3600) return `${(seconds / 60).toFixed(1)} minutes`;
    if (seconds < 86400) return `${(seconds / 3600).toFixed(1)} hours`;
    if (seconds < 31536000) return `${(seconds / 86400).toFixed(1)} days`;
    return `${(seconds / 31536000).toFixed(1)} years`;
}

function getStrengthLabel(strength) {
    if (strength < 20) return "VERY WEAK";
    if (strength < 40) return "WEAK";
    if (strength < 60) return "MODERATE";
    if (strength < 80) return "STRONG";
    return "VERY STRONG";
}

function updatePassword() {
    const length = document.getElementById('lengthSlider').value;
    const lowercase = document.getElementById('lowercase').checked;
    const uppercase = document.getElementById('uppercase').checked;
    const numbers = document.getElementById('numbers').checked;
    const symbols = document.getElementById('symbols').checked;
    
    document.getElementById('lengthDisplay').textContent = length;
    
    // Generate password based on settings
    let charset = '';
    if (lowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (numbers) charset += '0123456789';
    if (symbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    if (charset === '') {
        charset = 'abcdefghijklmnopqrstuvwxyz'; // Default to lowercase
        document.getElementById('lowercase').checked = true;
    }
    
    let newPassword = '';
    for (let i = 0; i < length; i++) {
        newPassword += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    window.currentGameData.currentPassword = newPassword;
    window.currentGameData.passwordStrength = calculatePasswordStrength(newPassword);
    window.currentGameData.timeToBreak = calculateBreakTime(newPassword, window.currentGameData.attackSpeed);
    
    // Update display
    document.getElementById('currentPassword').textContent = newPassword;
    document.getElementById('strengthFill').style.width = `${window.currentGameData.passwordStrength}%`;
    document.getElementById('strengthText').textContent = getStrengthLabel(window.currentGameData.passwordStrength);
    document.getElementById('breakTimer').textContent = formatBreakTime(window.currentGameData.timeToBreak);
    
    // Update defense status
    updateDefenseStatus();
}

function generateStrongPassword() {
    // Set strong password settings
    document.getElementById('lengthSlider').value = 16;
    document.getElementById('lowercase').checked = true;
    document.getElementById('uppercase').checked = true;
    document.getElementById('numbers').checked = true;
    document.getElementById('symbols').checked = true;
    
    updatePassword();
}

function startBruteForceAttack() {
    const attackInterval = setInterval(() => {
        if (!window.currentGameData.attackActive) {
            clearInterval(attackInterval);
            return;
        }
        
        const { attackSpeed, timeToBreak, startTime } = window.currentGameData;
        const elapsedTime = (Date.now() - startTime) / 1000;
        const progress = Math.min(100, (elapsedTime / timeToBreak) * 100);
        
        window.currentGameData.attemptsMade += attackSpeed * 0.5; // Update every 500ms
        
        document.getElementById('attemptsCounter').textContent = window.currentGameData.attemptsMade.toLocaleString();
        document.getElementById('bruteProgressFill').style.width = `${progress}%`;
        document.getElementById('bruteProgressText').textContent = `${progress.toFixed(1)}%`;
        
        if (progress >= 100) {
            window.currentGameData.attackActive = false;
            endBruteForceGame(false, 0);
        }
    }, 500);
}

function updateDefenseStatus() {
    const { passwordStrength, timeToBreak } = window.currentGameData;
    const statusElement = document.getElementById('defenseStatus');
    
    if (passwordStrength >= 80 && timeToBreak > 31536000) { // > 1 year
        statusElement.innerHTML = '<div class="status-message success">✅ EXCELLENT DEFENSE - Password will resist attack for years!</div>';
        if (window.currentGameData.attackActive) {
            window.currentGameData.attackActive = false;
            setTimeout(() => endBruteForceGame(true, 95), 2000);
        }
    } else if (passwordStrength >= 60 && timeToBreak > 86400) { // > 1 day
        statusElement.innerHTML = '<div class="status-message good">🛡️ GOOD DEFENSE - Password should hold for days</div>';
    } else if (passwordStrength >= 40 && timeToBreak > 3600) { // > 1 hour
        statusElement.innerHTML = '<div class="status-message warning">⚠️ MODERATE DEFENSE - Password may hold for hours</div>';
    } else {
        statusElement.innerHTML = '<div class="status-message danger">🚨 WEAK DEFENSE - Password will be cracked quickly!</div>';
    }
}

function endBruteForceGame(success, score) {
    const statusElement = document.getElementById('defenseStatus');
    
    if (success) {
        statusElement.innerHTML = '<div class="status-message success">✅ MISSION SUCCESS - Strong password configured!</div>';
        showGameNotification('Password successfully secured!', 'success');
    } else {
        statusElement.innerHTML = '<div class="status-message failure">❌ MISSION FAILED - Password cracked!</div>';
        showGameNotification('Password was cracked!', 'error');
    }
    
    setTimeout(() => {
        endGameLevel(success, score);
    }, 2000);
}

// Add the new functions to global exports
window.updatePassword = updatePassword;
window.generateStrongPassword = generateStrongPassword;