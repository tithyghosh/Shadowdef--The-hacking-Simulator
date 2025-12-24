/**
 * GameScreen - Manages active gameplay screen
 * Coordinates puzzle, timer, AI opponent, and objectives
 */

import { CONFIG } from '../data/config.js';
import { Timer } from '../systems/Timer.js';
import { AIOpponent } from '../systems/AIOpponent.js';
import { PasswordCrack } from '../puzzles/PasswordCrack.js';
import { FirewallBypass } from '../puzzles/FirewallBypass.js';

export class GameScreen {
    constructor(game) {
        this.game = game;
        this.ui = game.ui;
        this.audio = game.audio;
        
        this.currentMission = null;
        this.activePuzzle = null;
        this.timer = null;
        this.aiOpponent = null;
        
        this.isPaused = false;
        this.isComplete = false;
    }

    /**
     * Load and start a mission
     * @param {Object} mission - Mission data
     */
    loadMission(mission) {
        this.currentMission = mission;
        this.isComplete = false;
        this.isPaused = false;
        
        console.log(`🎯 Loading mission: ${mission.title}`);
        
        // Reset UI
        this.resetUI();
        
        // Load objectives
        this.loadObjectives();
        
        // Initialize timer
        this.startTimer();
        
        // Initialize AI opponent
        this.startAIOpponent();
        
        // Load puzzle
        this.loadPuzzle();
        
        // Update hints display
        this.updateHintsDisplay();
    }

    /**
     * Reset UI elements
     */
    resetUI() {
        document.getElementById('timer').textContent = '00:00';
        document.getElementById('score').textContent = '0';
        document.getElementById('attempts').textContent = '0';
        document.getElementById('ai-progress').style.width = '0%';
        document.getElementById('ai-progress-text').textContent = '0%';
    }

    /**
     * Load mission objectives
     */
    loadObjectives() {
        const objectivesList = document.getElementById('objectives');
        if (!objectivesList) return;
        
        objectivesList.innerHTML = '';
        
        this.currentMission.objectives.forEach((objective, index) => {
            const li = document.createElement('li');
            li.className = 'objective';
            li.id = `objective-${index}`;
            li.textContent = objective;
            objectivesList.appendChild(li);
        });
    }

    /**
     * Complete an objective
     * @param {number} index - Objective index
     */
    completeObjective(index) {
        const objective = document.getElementById(`objective-${index}`);
        if (objective) {
            objective.classList.add('completed');
        }
    }

    /**
     * Start mission timer
     */
    startTimer() {
        const targetTime = this.currentMission.puzzle?.timeLimit || CONFIG.TIMING.DEFAULT_MISSION_TIME;
        
        this.timer = new Timer(targetTime, {
            onTick: (time) => this.updateTimerDisplay(time),
            onWarning: () => {
                this.ui.showNotification('Time running low!', 'warning');
                this.audio.playTimerWarning();
            },
            onExpire: () => this.onTimeExpired()
        });
        
        this.timer.start();
    }

    /**
     * Update timer display
     * @param {number} seconds - Remaining seconds
     */
    updateTimerDisplay(seconds) {
        const timerElement = document.getElementById('timer');
        if (timerElement) {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            timerElement.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            
            // Color warning
            if (seconds <= CONFIG.TIMING.WARNING_TIME) {
                timerElement.style.color = 'var(--cyber-pink)';
            } else {
                timerElement.style.color = 'var(--cyber-blue)';
            }
        }
    }

    /**
     * Handle time expired
     */
    onTimeExpired() {
        if (this.isComplete) return;
        
        this.ui.showNotification('Time expired!', 'error');
        this.completePuzzle(false);
    }

    /**
     * Start AI opponent
     */
    startAIOpponent() {
        const targetTime = this.currentMission.puzzle?.timeLimit || CONFIG.TIMING.DEFAULT_MISSION_TIME;
        const aiSpeed = this.currentMission.aiSpeed || 1.0;
        
        this.aiOpponent = new AIOpponent(targetTime, aiSpeed, {
            onProgress: (progress) => this.updateAIProgress(progress),
            onWin: () => this.onAIWin()
        });
        
        this.aiOpponent.start();
        
        // Update AI name
        const aiName = document.getElementById('ai-name');
        if (aiName) {
            const names = ['CYBER-THREAT', 'BLACK-HAT', 'DARK-ZERO', 'PHANTOM-X'];
            aiName.textContent = names[Math.floor(Math.random() * names.length)];
        }
    }

    /**
     * Update AI opponent progress
     * @param {number} progress - Progress percentage (0-100)
     */
    updateAIProgress(progress) {
        const progressBar = document.getElementById('ai-progress');
        const progressText = document.getElementById('ai-progress-text');
        
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
        
        if (progressText) {
            progressText.textContent = `${Math.floor(progress)}%`;
        }
    }

    /**
     * Handle AI opponent winning
     */
    onAIWin() {
        if (this.isComplete) return;
        
        this.ui.showNotification('AI opponent completed first!', 'error');
        this.completePuzzle(false);
    }



//  loadPuzzle() method:
loadPuzzle() {
    const puzzleArea = document.getElementById('puzzle-area');
    if (!puzzleArea) {
        console.error('Puzzle area not found');
        return;
    }
    
    // Clean up existing puzzle
    if (this.activePuzzle && this.activePuzzle.destroy) {
        this.activePuzzle.destroy();
    }
    
    // Create new puzzle based on type
    switch (this.currentMission.type) {
        case 'password':
            this.activePuzzle = new PasswordCrack(this.currentMission.puzzle, this);
            break;
        case 'firewall':  // ADD THIS CASE
            this.activePuzzle = new FirewallBypass(this.currentMission.puzzle, this);
            break;
        default:
            console.error(`Unknown puzzle type: ${this.currentMission.type}`);
            return;
    }
    
    // Render puzzle
    this.activePuzzle.render(puzzleArea);
}

    /**
     * Update attempts display
     * @param {number} attempts - Number of attempts
     */
    updateAttempts(attempts) {
        const attemptsElement = document.getElementById('attempts');
        if (attemptsElement) {
            attemptsElement.textContent = attempts;
        }
        
        // Record in score manager
        this.game.score.recordAttempt();
        this.updateScore();
    }

    /**
     * Update score display
     */
    updateScore() {
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.textContent = this.game.score.getScore();
        }
    }

    /**
     * Update hints display
     */
    updateHintsDisplay() {
        const hintsElement = document.getElementById('hints-remaining');
        const maxHints = CONFIG.HINTS.MAX_HINTS_PER_MISSION;
        const used = this.game.score.hintsUsed;
        
        if (hintsElement) {
            hintsElement.textContent = maxHints - used;
        }
    }

    /**
     * Complete puzzle (success or failure)
     * @param {boolean} success - Whether puzzle was completed successfully
     */
    completePuzzle(success) {
        if (this.isComplete) return;
        
        this.isComplete = true;
        
        // Stop timer and AI
        if (this.timer) {
            this.timer.stop();
        }
        
        if (this.aiOpponent) {
            this.aiOpponent.stop();
        }
        
        // Get final stats
        const stats = {
            success: success,
            time: this.timer ? this.timer.getElapsed() : 0,
            attempts: this.game.score.attempts,
            hintsUsed: this.game.score.hintsUsed,
            targetTime: this.currentMission.puzzle?.timeLimit || CONFIG.TIMING.DEFAULT_MISSION_TIME
        };
        
        // Calculate final score
        const finalScore = this.game.score.calculateFinalScore(stats);
        
        // Complete mission in game controller
        this.game.completeMission(success, {
            ...stats,
            finalScore
        });
    }

    /**
     * Show results screen
     * @param {boolean} success - Mission success
     * @param {Object} stats - Mission stats
     * @param {number} finalScore - Final score
     */
    showResults(success, stats, finalScore) {
        const rank = this.game.score.getScoreRank(finalScore);
        const xp = this.game.score.calculateXP(finalScore, this.currentMission);
        const credits = this.game.score.calculateCredits(finalScore, this.currentMission);
        
        const modal = this.ui.showModal(
            success ? 'MISSION COMPLETE' : 'MISSION FAILED',
            `
                <div class="modal-stats">
                    <div class="modal-stat">
                        <span>Time:</span>
                        <span>${this.formatTime(stats.time)}</span>
                    </div>
                    <div class="modal-stat">
                        <span>Attempts:</span>
                        <span>${stats.attempts}</span>
                    </div>
                    <div class="modal-stat">
                        <span>Hints Used:</span>
                        <span>${stats.hintsUsed}</span>
                    </div>
                    <div class="modal-stat">
                        <span>Accuracy:</span>
                        <span>${this.game.score.getAccuracyPercent()}%</span>
                    </div>
                    <div class="divider"></div>
                    <div class="modal-stat">
                        <span>Final Score:</span>
                        <span style="color: ${rank.color}">${finalScore}</span>
                    </div>
                    <div class="modal-stat">
                        <span>Rank:</span>
                        <span style="color: ${rank.color}">${rank.rank} - ${rank.name}</span>
                    </div>
                    ${success ? `
                        <div class="divider"></div>
                        <div class="modal-stat">
                            <span>XP Earned:</span>
                            <span style="color: var(--cyber-green)">+${xp}</span>
                        </div>
                        <div class="modal-stat">
                            <span>Credits Earned:</span>
                            <span style="color: var(--cyber-green)">+${credits} ${CONFIG.CURRENCY.SYMBOL}</span>
                        </div>
                    ` : ''}
                </div>
            `,
            {
                type: success ? 'success' : 'error',
                closable: false,
                buttons: [
                    {
                        text: success ? 'CONTINUE' : 'RETRY',
                        class: 'btn-primary',
                        onClick: () => {
                            if (success) {
                                this.game.showMissionSelect();
                            } else {
                                this.game.startMission(this.currentMission);
                            }
                        }
                    },
                    {
                        text: 'MISSION SELECT',
                        class: 'btn',
                        onClick: () => {
                            this.game.showMissionSelect();
                        }
                    }
                ]
            }
        );
        
        // Add result-specific class to modal
        if (modal) {
            const modalContent = modal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.style.borderColor = success ? 'var(--cyber-green)' : 'var(--cyber-pink)';
            }
        }
    }

    /**
     * Pause game
     */
    pause() {
        if (this.isPaused || this.isComplete) return;
        
        this.isPaused = true;
        
        if (this.timer) {
            this.timer.pause();
        }
        
        if (this.aiOpponent) {
            this.aiOpponent.pause();
        }
        
        this.ui.showModal(
            'GAME PAUSED',
            '<p style="text-align: center; color: var(--text-secondary);">Game is paused</p>',
            {
                buttons: [
                    {
                        text: 'RESUME',
                        class: 'btn-primary',
                        onClick: () => this.resume()
                    },
                    {
                        text: 'QUIT MISSION',
                        class: 'btn',
                        onClick: () => this.game.showMissionSelect()
                    }
                ]
            }
        );
    }

    /**
     * Resume game
     */
    resume() {
        if (!this.isPaused) return;
        
        this.isPaused = false;
        
        if (this.timer) {
            this.timer.resume();
        }
        
        if (this.aiOpponent) {
            this.aiOpponent.resume();
        }
        
        this.ui.closeModal();
    }

    /**
     * Format time as MM:SS
     * @param {number} seconds - Time in seconds
     * @returns {string} Formatted time
     */
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    /**
     * Clean up game screen
     */
    destroy() {
        if (this.timer) {
            this.timer.stop();
        }
        
        if (this.aiOpponent) {
            this.aiOpponent.stop();
        }
        
        if (this.activePuzzle && this.activePuzzle.destroy) {
            this.activePuzzle.destroy();
        }
    }
}