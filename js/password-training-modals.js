// Password Training Modals and Utilities

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
            lengthDemo: { targetMet: false, completed: false }
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
        lengthDemo: { targetMet: false, completed: false }
    };
}

function updatePasswordProgress(percentage) {
    const progressFill = document.getElementById('passwordProgressFill');
    const progressText = document.getElementById('passwordProgressText');
    
    if (progressFill) progressFill.style.width = `${percentage}%`;
    if (progressText) progressText.textContent = `${Math.round(percentage)}%`;
}

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
window.showPasswordCompletionModal = showPasswordCompletionModal;
window.continueToNextPasswordLevel = continueToNextPasswordLevel;
window.retryPasswordLevel = retryPasswordLevel;
window.closePasswordCompletionModal = closePasswordCompletionModal;
window.completePasswordLevel = completePasswordLevel;
window.nextPasswordLevel = nextPasswordLevel;
window.backToPasswordLevels = backToPasswordLevels;
window.updatePasswordProgress = updatePasswordProgress;
window.formatPasswordNumber = formatPasswordNumber;
window.formatPasswordTime = formatPasswordTime;
window.showPasswordNotification = showPasswordNotification;