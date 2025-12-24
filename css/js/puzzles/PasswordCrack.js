/**
 * PasswordCrack - Password cracking puzzle
 * Players must guess a password using hints
 */

import { CONFIG } from '../data/config.js';
import { AudioManager } from '../core/AudioManager.js';

export class PasswordCrack {
    constructor(puzzleData, gameScreen) {
        this.gameScreen = gameScreen;
        this.audio = AudioManager.getInstance();
        
        // Puzzle data
        this.password = puzzleData.password.toUpperCase();
        this.hints = puzzleData.hints || [];
        this.maxAttempts = CONFIG.PUZZLES.PASSWORD.MAX_ATTEMPTS;
        
        // State
        this.attempts = 0;
        this.hintsShown = 0;
        this.isComplete = false;
        this.inputs = [];
        
        console.log('🔐 Password puzzle initialized:', this.password.length, 'characters');
    }

    /**
     * Initialize and render the puzzle
     * @param {HTMLElement} container - Container element
     */
    render(container) {
        container.innerHTML = `
            <div class="password-puzzle">
                <h2 class="puzzle-title">PASSWORD CRACKING PROTOCOL</h2>
                
                <div class="password-hints" id="password-hints">
                    <strong style="color: var(--cyber-blue);">INTELLIGENCE BRIEFING:</strong>
                    <div class="hint">→ ${this.hints[0]}</div>
                </div>
                
                <div class="password-display" id="password-display">
                    ${'_'.repeat(this.password.length)}
                </div>
                
                <div class="password-input" id="password-input">
                    ${this.createInputs()}
                </div>
                
                <div class="puzzle-actions">
                    <button class="btn btn-primary" id="submit-password">
                        SUBMIT
                    </button>
                    <button class="btn" id="clear-password">
                        CLEAR
                    </button>
                </div>
                
                <div id="attempt-counter" style="text-align: center; margin-top: 20px; color: var(--text-secondary);">
                    Attempts: <span style="color: var(--cyber-blue);">${this.attempts}</span> / ${this.maxAttempts}
                </div>
            </div>
        `;

        // Setup event listeners
        this.setupEventListeners();
    }

    /**
     * Create password input fields
     * @returns {string} HTML for input fields
     */
    createInputs() {
        let html = '';
        for (let i = 0; i < this.password.length; i++) {
            html += `<input 
                type="text" 
                class="char-input" 
                maxlength="1" 
                data-index="${i}"
                autocomplete="off"
                spellcheck="false"
            >`;
        }
        return html;
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Get input elements
        this.inputs = Array.from(document.querySelectorAll('.char-input'));

        // Submit button
        const submitBtn = document.getElementById('submit-password');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.checkPassword());
        }

        // Clear button
        const clearBtn = document.getElementById('clear-password');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearInputs());
        }

        // Input handling
        this.inputs.forEach((input, index) => {
            // Auto-advance on input
            input.addEventListener('input', (e) => {
                const value = e.target.value.toUpperCase();
                e.target.value = value;

                if (value && index < this.inputs.length - 1) {
                    this.inputs[index + 1].focus();
                }

                this.audio.playTyping();
                this.updateDisplay();
            });

            // Backspace handling
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && !e.target.value && index > 0) {
                    this.inputs[index - 1].focus();
                    this.inputs[index - 1].select();
                }

                // Enter to submit
                if (e.key === 'Enter') {
                    this.checkPassword();
                }
            });

            // Prevent non-alphanumeric input
            input.addEventListener('keypress', (e) => {
                const char = e.key;
                if (!/[a-zA-Z0-9]/.test(char)) {
                    e.preventDefault();
                }
            });

            // Handle paste
            input.addEventListener('paste', (e) => {
                e.preventDefault();
                const pastedText = e.clipboardData.getData('text').toUpperCase();
                this.fillInputs(pastedText, index);
            });
        });

        // Focus first input
        if (this.inputs[0]) {
            this.inputs[0].focus();
        }
    }

    /**
     * Fill inputs with text (for paste)
     * @param {string} text - Text to fill
     * @param {number} startIndex - Starting index
     */
    fillInputs(text, startIndex = 0) {
        for (let i = 0; i < text.length && (startIndex + i) < this.inputs.length; i++) {
            this.inputs[startIndex + i].value = text[i];
        }
        this.updateDisplay();
    }

    /**
     * Update password display
     */
    updateDisplay() {
        const display = document.getElementById('password-display');
        if (!display) return;

        let displayText = '';
        this.inputs.forEach(input => {
            displayText += input.value || '_';
        });

        display.textContent = displayText;
    }

    /**
     * Get current guess
     * @returns {string} Current password guess
     */
    getCurrentGuess() {
        return this.inputs.map(input => input.value).join('').toUpperCase();
    }

    /**
     * Check if password is correct
     */
    checkPassword() {
        if (this.isComplete) return;

        const guess = this.getCurrentGuess();
        
        // Check if all fields filled
        if (guess.length !== this.password.length) {
            this.gameScreen.ui.showNotification('Enter all characters!', 'warning');
            return;
        }

        this.attempts++;
        this.updateAttemptCounter();

        if (guess === this.password) {
            // Correct!
            this.onSuccess();
        } else {
            // Incorrect
            this.onFailure();
        }

        // Update game screen stats
        this.gameScreen.updateAttempts(this.attempts);
    }

    /**
     * Handle correct password
     */
    onSuccess() {
        this.isComplete = true;
        this.audio.playSuccess();

        // Mark all inputs as correct
        this.inputs.forEach(input => {
            input.classList.add('correct');
            input.disabled = true;
        });

        // Flash screen
        this.gameScreen.ui.flashScreen('rgba(0, 255, 65, 0.2)', 300);

        // Show success message
        this.gameScreen.ui.showNotification('Password cracked!', 'success');

        // Complete mission
        setTimeout(() => {
            this.gameScreen.completePuzzle(true);
        }, 1000);
    }

    /**
     * Handle incorrect password
     */
    onFailure() {
        this.audio.playFailure();

        // Shake inputs
        this.inputs.forEach(input => {
            input.classList.add('incorrect');
            setTimeout(() => {
                input.classList.remove('incorrect');
            }, 500);
        });

        // Flash screen
        this.gameScreen.ui.flashScreen('rgba(255, 0, 110, 0.2)', 300);

        // Check if out of attempts
        if (this.attempts >= this.maxAttempts) {
            this.onOutOfAttempts();
        } else {
            this.gameScreen.ui.showNotification(
                `Incorrect! ${this.maxAttempts - this.attempts} attempts remaining`,
                'error'
            );
        }
    }

    /**
     * Handle running out of attempts
     */
    onOutOfAttempts() {
        this.isComplete = true;

        // Disable inputs
        this.inputs.forEach(input => {
            input.disabled = true;
        });

        this.gameScreen.ui.showNotification('Out of attempts! Mission failed.', 'error');

        setTimeout(() => {
            this.gameScreen.completePuzzle(false);
        }, 2000);
    }

    /**
     * Clear all inputs
     */
    clearInputs() {
        this.inputs.forEach(input => {
            input.value = '';
            input.classList.remove('correct', 'incorrect');
        });
        
        if (this.inputs[0]) {
            this.inputs[0].focus();
        }
        
        this.updateDisplay();
        this.audio.playButtonClick();
    }

    /**
     * Update attempt counter display
     */
    updateAttemptCounter() {
        const counter = document.getElementById('attempt-counter');
        if (counter) {
            counter.innerHTML = `
                Attempts: <span style="color: var(--cyber-${this.attempts >= this.maxAttempts - 1 ? 'pink' : 'blue'}');">${this.attempts}</span> / ${this.maxAttempts}
            `;
        }
    }

    /**
     * Show a hint
     */
    showHint() {
        if (this.isComplete) {
            this.gameScreen.ui.showNotification('Puzzle already complete!', 'info');
            return;
        }

        if (this.hintsShown >= this.hints.length) {
            this.gameScreen.ui.showNotification('No more hints available!', 'warning');
            return;
        }

        this.hintsShown++;
        const hintsContainer = document.getElementById('password-hints');
        
        if (hintsContainer) {
            const newHint = document.createElement('div');
            newHint.className = 'hint animate-fadeIn';
            newHint.textContent = `→ ${this.hints[this.hintsShown - 1]}`;
            hintsContainer.appendChild(newHint);
        }

        this.audio.playHint();
        this.gameScreen.ui.showNotification('Hint revealed!', 'info');
    }

    /**
     * Get puzzle statistics
     * @returns {Object} Puzzle stats
     */
    getStats() {
        return {
            attempts: this.attempts,
            hintsUsed: this.hintsShown,
            completed: this.isComplete
        };
    }

    /**
     * Clean up puzzle
     */
    destroy() {
        // Remove event listeners
        this.inputs.forEach(input => {
            input.removeEventListener('input', null);
            input.removeEventListener('keydown', null);
            input.removeEventListener('keypress', null);
            input.removeEventListener('paste', null);
        });
    }
}