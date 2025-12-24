/**
 * AIOpponent - Simulates AI competitor
 * Creates tension by showing opponent progress
 */

import { CONFIG } from '../data/config.js';

export class AIOpponent {
    constructor(targetTime, speedMultiplier = 1.0, callbacks = {}) {
        this.targetTime = targetTime; // Time in seconds to complete
        this.speedMultiplier = speedMultiplier; // AI speed modifier
        this.progress = 0; // Progress percentage (0-100)
        this.startTime = null;
        this.pausedTime = 0;
        this.isRunning = false;
        this.isPaused = false;
        this.interval = null;
        this.hasWon = false;
        
        // Callbacks
        this.onProgress = callbacks.onProgress || (() => {});
        this.onWin = callbacks.onWin || (() => {});
        this.onTaunt = callbacks.onTaunt || (() => {});
        
        // Calculate completion time based on speed
        this.completionTime = this.targetTime / this.speedMultiplier;
        
        // Taunt messages
        this.taunts = [
            "You're too slow...",
            "I'm ahead of you!",
            "Can't keep up?",
            "Already halfway done!",
            "Almost there!",
            "This is too easy!"
        ];
        
        this.tauntIntervals = [0.25, 0.5, 0.75]; // Progress points for taunts
        this.tauntsSent = [];
    }

    /**
     * Start AI opponent
     */
    start() {
        if (this.isRunning) return;
        
        this.startTime = Date.now();
        this.isRunning = true;
        this.isPaused = false;
        this.progress = 0;
        this.hasWon = false;
        this.tauntsSent = [];
        
        // Update every 100ms for smooth animation
        this.interval = setInterval(() => this.update(), CONFIG.TIMING.AI_UPDATE_INTERVAL);
        
        if (CONFIG.DEBUG.ENABLED) {
            console.log(`🤖 AI Opponent started (${this.speedMultiplier}x speed)`);
        }
    }

    /**
     * Pause AI opponent
     */
    pause() {
        if (!this.isRunning || this.isPaused) return;
        
        this.isPaused = true;
        this.pausedTime = Date.now();
        
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    /**
     * Resume AI opponent
     */
    resume() {
        if (!this.isPaused) return;
        
        // Adjust start time to account for pause
        const pauseDuration = Date.now() - this.pausedTime;
        this.startTime += pauseDuration;
        
        this.isPaused = false;
        this.interval = setInterval(() => this.update(), CONFIG.TIMING.AI_UPDATE_INTERVAL);
    }

    /**
     * Stop AI opponent
     */
    stop() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        this.isPaused = false;
        
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    /**
     * Update AI progress
     */
    update() {
        if (this.isPaused || this.hasWon) return;
        
        const elapsed = (Date.now() - this.startTime) / 1000;
        
        // Calculate progress with some randomness for realism
        const baseProgress = (elapsed / this.completionTime) * 100;
        const randomness = (Math.random() - 0.5) * 2; // ±1% randomness
        this.progress = Math.min(100, baseProgress + randomness);
        
        // Trigger progress callback
        this.onProgress(this.progress);
        
        // Check for taunts
        this.checkTaunts();
        
        // Check if AI won
        if (this.progress >= 100) {
            this.win();
        }
    }

    /**
     * Check and send taunts at intervals
     */
    checkTaunts() {
        this.tauntIntervals.forEach(interval => {
            const progressPoint = interval * 100;
            
            if (this.progress >= progressPoint && !this.tauntsSent.includes(interval)) {
                this.tauntsSent.push(interval);
                const taunt = this.getRandomTaunt();
                this.onTaunt(taunt);
                
                if (CONFIG.DEBUG.ENABLED) {
                    console.log(`🤖 AI Taunt: ${taunt}`);
                }
            }
        });
    }

    /**
     * Get random taunt message
     * @returns {string} Taunt message
     */
    getRandomTaunt() {
        return this.taunts[Math.floor(Math.random() * this.taunts.length)];
    }

    /**
     * AI wins
     */
    win() {
        if (this.hasWon) return;
        
        this.hasWon = true;
        this.progress = 100;
        this.stop();
        
        this.onWin();
        
        if (CONFIG.DEBUG.ENABLED) {
            console.log('🤖 AI Opponent won!');
        }
    }

    /**
     * Slow down AI (penalty for player hint usage)
     * @param {number} amount - Amount to slow (percentage)
     */
    slowDown(amount = 5) {
        const slowdownTime = (amount / 100) * this.completionTime;
        this.startTime += slowdownTime * 1000; // Add time in milliseconds
        
        if (CONFIG.DEBUG.ENABLED) {
            console.log(`🤖 AI slowed down by ${amount}%`);
        }
    }

    /**
     * Speed up AI (difficulty increase)
     * @param {number} amount - Amount to speed up (percentage)
     */
    speedUp(amount = 5) {
        const speedupTime = (amount / 100) * this.completionTime;
        this.startTime -= speedupTime * 1000; // Subtract time in milliseconds
        
        if (CONFIG.DEBUG.ENABLED) {
            console.log(`🤖 AI sped up by ${amount}%`);
        }
    }

    /**
     * Get current progress
     * @returns {number} Progress percentage (0-100)
     */
    getProgress() {
        return Math.min(100, Math.max(0, this.progress));
    }

    /**
     * Get estimated time until AI completion
     * @returns {number} Seconds remaining
     */
    getTimeUntilCompletion() {
        if (!this.startTime) return this.completionTime;
        
        const elapsed = (Date.now() - this.startTime) / 1000;
        return Math.max(0, this.completionTime - elapsed);
    }

    /**
     * Check if AI is winning (ahead of player)
     * @param {number} playerProgress - Player's progress percentage
     * @returns {boolean} Is AI winning
     */
    isWinning(playerProgress) {
        return this.progress > playerProgress;
    }

    /**
     * Get AI status message
     * @returns {string} Status message
     */
    getStatus() {
        if (this.hasWon) {
            return 'COMPLETED';
        } else if (this.progress >= 90) {
            return 'Nearly finished!';
        } else if (this.progress >= 75) {
            return 'Making good progress...';
        } else if (this.progress >= 50) {
            return 'Halfway there...';
        } else if (this.progress >= 25) {
            return 'Getting started...';
        } else {
            return 'Analyzing system...';
        }
    }

    /**
     * Reset AI opponent
     * @param {number} newTargetTime - New target time (optional)
     * @param {number} newSpeed - New speed multiplier (optional)
     */
    reset(newTargetTime = null, newSpeed = null) {
        this.stop();
        
        if (newTargetTime !== null) {
            this.targetTime = newTargetTime;
        }
        
        if (newSpeed !== null) {
            this.speedMultiplier = newSpeed;
        }
        
        this.completionTime = this.targetTime / this.speedMultiplier;
        this.progress = 0;
        this.startTime = null;
        this.pausedTime = 0;
        this.hasWon = false;
        this.tauntsSent = [];
    }
}

/**
 * AI Difficulty Presets
 */
export const AIDifficulty = {
    EASY: {
        speedMultiplier: 0.7,
        tauntChance: 0.3,
        description: 'Slower AI, more forgiving'
    },
    NORMAL: {
        speedMultiplier: 1.0,
        tauntChance: 0.5,
        description: 'Balanced challenge'
    },
    HARD: {
        speedMultiplier: 1.3,
        tauntChance: 0.7,
        description: 'Fast AI, intense pressure'
    },
    EXPERT: {
        speedMultiplier: 1.5,
        tauntChance: 0.9,
        description: 'Extreme challenge'
    }
};