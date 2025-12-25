/**
 * PhishingID - Phishing email identification puzzle
 * Players identify red flags in suspicious emails
 */

import { CONFIG } from '../data/config.js';
import { AudioManager } from '../core/AudioManager.js';

export class PhishingID {
    constructor(puzzleData, gameScreen) {
        this.gameScreen = gameScreen;
        this.audio = AudioManager.getInstance();
        
        // Puzzle configuration
        this.email = puzzleData.email || this.generateEmail();
        this.correctIndicators = new Set(puzzleData.correctIndicators || [0, 1, 2]);
        this.minCorrect = puzzleData.minCorrect || 3;
        
        // State
        this.selectedIndicators = new Set();
        this.isComplete = false;
        
        console.log('📧 Phishing identification puzzle initialized');
    }

    /**
     * Generate suspicious email
     * @returns {Object} Email data
     */
    generateEmail() {
        const emails = [
            {
                from: 'security@paypa1-verify.com',
                to: 'you@company.com',
                subject: 'URGENT: Verify Your Account Now!!!',
                body: `Dear Valued Customer,

We have detected suspicious activity on your account. Your account will be SUSPENDED in 24 hours unless you verify your information immediately.

Click here to verify: http://paypal-verify-account.ru/login

If you do not act fast, you will lose access to your funds permanently.

Best regards,
PayPal Security Team

Note: This is an automated message, please do not reply.`
            },
            {
                from: 'CEO@company-internal.net',
                to: 'finance@company.com',
                subject: 'Urgent Wire Transfer Needed',
                body: `Hi,

I'm currently in a meeting and need you to process an urgent wire transfer immediately. Send $50,000 to the following account:

Account: 123456789
Bank: International Trust Bank
Swift: INTLXX99

This is for a confidential business deal that must close today. Do not discuss this with anyone else on the team.

I'll be unreachable for the next few hours so please proceed ASAP.

Thanks,
John Smith
CEO`
            }
        ];

        return emails[Math.floor(Math.random() * emails.length)];
    }

    /**
     * Get all possible phishing indicators
     * @returns {Array} Indicator objects
     */
    getIndicators() {
        return [
            { id: 0, text: 'Suspicious sender address with misspelling', isRed: true },
            { id: 1, text: 'Creates sense of urgency and threats', isRed: true },
            { id: 2, text: 'Requests sensitive information or money', isRed: true },
            { id: 3, text: 'Contains grammatical errors or odd phrasing', isRed: true },
            { id: 4, text: 'Generic greeting instead of personalized', isRed: true },
            { id: 5, text: 'Suspicious or mismatched links/URLs', isRed: true },
            { id: 6, text: 'Unusual requests from supposed authority', isRed: true },
            { id: 7, text: 'Poor formatting or unprofessional appearance', isRed: false },
            { id: 8, text: 'Email sent during business hours', isRed: false },
            { id: 9, text: 'Contains company logo', isRed: false }
        ];
    }

    /**
     * Initialize and render the puzzle
     * @param {HTMLElement} container - Container element
     */
    render(container) {
        container.innerHTML = `
            <div class="phishing-puzzle">
                <h2 class="puzzle-title">PHISHING IDENTIFICATION PROTOCOL</h2>
                
                <div class="puzzle-instructions">
                    <strong style="color: var(--cyber-blue);">MISSION:</strong>
                    <p style="margin-top: 10px; color: var(--text-secondary);">
                        Analyze the email below and identify <span style="color: var(--cyber-pink);">red flags</span> 
                        that indicate a phishing attempt. Select all suspicious indicators.
                    </p>
                </div>

                <div class="email-viewer">
                    <div class="email-header">
                        <div class="email-field">
                            <span class="email-label">From:</span>
                            <span class="email-value">${this.email.from}</span>
                        </div>
                        <div class="email-field">
                            <span class="email-label">To:</span>
                            <span class="email-value">${this.email.to}</span>
                        </div>
                        <div class="email-field">
                            <span class="email-label">Subject:</span>
                            <span class="email-value" style="font-weight: bold;">${this.email.subject}</span>
                        </div>
                    </div>
                    <div class="email-body">
                        ${this.email.body.replace(/\n/g, '<br>')}
                    </div>
                </div>

                <div style="margin: 20px 0; padding: 15px; background: var(--darker-bg); border: 1px solid var(--cyber-blue);">
                    <strong style="color: var(--cyber-blue);">PHISHING INDICATORS CHECKLIST:</strong>
                    <p style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 8px;">
                        Select all red flags you identify (need at least ${this.minCorrect}):
                    </p>
                </div>
                
                <div class="phishing-indicators">
                    ${this.renderIndicators()}
                </div>
                
                <div style="text-align: center; margin: 20px 0;">
                    <span style="color: var(--text-secondary);">Selected: </span>
                    <span style="color: var(--cyber-blue); font-size: 1.3rem; margin-left: 10px;" id="phishing-count">0</span>
                    <span style="color: var(--text-secondary);"> / ${this.minCorrect} minimum</span>
                </div>
                
                <div class="puzzle-actions">
                    <button class="btn btn-primary" id="phishing-submit">
                        SUBMIT ANALYSIS
                    </button>
                    <button class="btn" id="phishing-clear">
                        CLEAR SELECTION
                    </button>
                </div>
            </div>
        `;

        this.setupEventListeners();
    }

    /**
     * Render indicator checkboxes
     * @returns {string} Indicators HTML
     */
    renderIndicators() {
        return this.getIndicators().map(indicator => {
            const isSelected = this.selectedIndicators.has(indicator.id);
            return `
                <div class="indicator-checkbox ${isSelected ? 'selected' : ''}" data-indicator="${indicator.id}">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 24px; height: 24px; border: 2px solid var(--cyber-blue); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            ${isSelected ? '<span style="color: var(--cyber-pink); font-size: 1.2rem;">✓</span>' : ''}
                        </div>
                        <span style="flex: 1;">${indicator.text}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        const indicators = document.querySelectorAll('.indicator-checkbox');
        
        indicators.forEach(indicator => {
            indicator.addEventListener('click', () => {
                const id = parseInt(indicator.dataset.indicator);
                this.toggleIndicator(id);
            });
        });

        // Submit button
        const submitBtn = document.getElementById('phishing-submit');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.submitAnalysis());
        }

        // Clear button
        const clearBtn = document.getElementById('phishing-clear');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearSelection());
        }
    }

    /**
     * Toggle indicator selection
     * @param {number} indicatorId - Indicator ID
     */
    toggleIndicator(indicatorId) {
        if (this.isComplete) return;

        if (this.selectedIndicators.has(indicatorId)) {
            this.selectedIndicators.delete(indicatorId);
        } else {
            this.selectedIndicators.add(indicatorId);
        }

        this.audio.playButtonClick();
        this.updateDisplay();
    }

    /**
     * Clear all selections
     */
    clearSelection() {
        this.selectedIndicators.clear();
        this.audio.playButtonClick();
        this.updateDisplay();
    }

    /**
     * Update display
     */
    updateDisplay() {
        const indicatorsHTML = this.renderIndicators();
        document.querySelector('.phishing-indicators').innerHTML = indicatorsHTML;
        document.getElementById('phishing-count').textContent = this.selectedIndicators.size;
        
        // Re-attach event listeners
        this.setupEventListeners();
    }

    /**
     * Submit phishing analysis
     */
    submitAnalysis() {
        if (this.isComplete) return;

        if (this.selectedIndicators.size === 0) {
            this.gameScreen.ui.showNotification('Select at least one indicator!', 'warning');
            return;
        }

        this.isComplete = true;

        // Calculate accuracy
        let correctSelections = 0;
        let incorrectSelections = 0;

        this.selectedIndicators.forEach(id => {
            if (this.correctIndicators.has(id)) {
                correctSelections++;
            } else {
                incorrectSelections++;
            }
        });

        const missedIndicators = this.correctIndicators.size - correctSelections;
        const accuracy = (correctSelections / this.correctIndicators.size) * 100;

        // Determine success
        if (correctSelections >= this.minCorrect && incorrectSelections === 0) {
            this.onSuccess(correctSelections, incorrectSelections, missedIndicators, accuracy);
        } else if (correctSelections >= this.minCorrect) {
            this.onPartialSuccess(correctSelections, incorrectSelections, missedIndicators, accuracy);
        } else {
            this.onFailure(correctSelections, incorrectSelections, missedIndicators, accuracy);
        }

        // Update game stats
        this.gameScreen.updateAttempts(this.selectedIndicators.size);
    }

    /**
     * Handle perfect identification
     */
    onSuccess(correct, incorrect, missed, accuracy) {
        this.audio.playSuccess();
        this.gameScreen.ui.flashScreen('rgba(0, 255, 65, 0.2)', 300);
        
        this.gameScreen.ui.showNotification(
            'Perfect analysis! All red flags identified!',
            'success'
        );

        // Bonus for perfect identification
        this.gameScreen.game.score.addPoints(800);

        setTimeout(() => {
            this.gameScreen.completePuzzle(true);
        }, 2000);
    }

    /**
     * Handle partial success
     */
    onPartialSuccess(correct, incorrect, missed, accuracy) {
        this.audio.playSuccess();
        this.gameScreen.ui.flashScreen('rgba(0, 243, 255, 0.2)', 300);
        
        let message = `${correct}/${this.correctIndicators.size} correct`;
        if (incorrect > 0) message += `, ${incorrect} incorrect`;
        if (missed > 0) message += `, ${missed} missed`;
        
        this.gameScreen.ui.showNotification(message, 'success');
        
        // Score penalty for mistakes
        const penalty = (incorrect * 100) + (missed * 50);
        this.gameScreen.game.score.subtractPoints(penalty);

        setTimeout(() => {
            this.gameScreen.completePuzzle(true);
        }, 2000);
    }

    /**
     * Handle failure
     */
    onFailure(correct, incorrect, missed, accuracy) {
        this.audio.playFailure();
        this.gameScreen.ui.flashScreen('rgba(255, 0, 110, 0.2)', 300);
        
        this.gameScreen.ui.showNotification(
            `Only ${correct}/${this.correctIndicators.size} red flags found. Analysis incomplete!`,
            'error'
        );

        setTimeout(() => {
            this.gameScreen.completePuzzle(false);
        }, 2000);
    }

    /**
     * Get puzzle statistics
     * @returns {Object} Puzzle stats
     */
    getStats() {
        return {
            indicatorsSelected: this.selectedIndicators.size,
            correctCount: this.correctIndicators.size,
            minRequired: this.minCorrect,
            completed: this.isComplete
        };
    }

    /**
     * Clean up puzzle
     */
    destroy() {
        // Remove event listeners
        const indicators = document.querySelectorAll('.indicator-checkbox');
        indicators.forEach(indicator => {
            indicator.replaceWith(indicator.cloneNode(true));
        });
    }
}