// Updated Password Level Logic Functions
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

function resetPasswordLevelState() {
    // Reset all level-specific state
    passwordSelections = {};
    passwordSubmitted = false;
    passwordGameState.levelStates = {
        classification: { answers: {}, completed: false },
        lengthDemo: { targetMet: false, completed: false }
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

// Make functions globally available
window.selectPasswordClassification = selectPasswordClassification;
window.updatePasswordSelectionProgress = updatePasswordSelectionProgress;
window.submitPasswordClassification = submitPasswordClassification;
window.submitPasswordLengthDemo = submitPasswordLengthDemo;
window.updatePasswordLengthDemo = updatePasswordLengthDemo;
window.completePasswordDemo = completePasswordDemo;
window.checkPasswordLevel = checkPasswordLevel;
window.resetPasswordLevelState = resetPasswordLevelState;