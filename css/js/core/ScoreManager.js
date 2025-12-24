/**
 * ScoreManager - Handles scoring calculations and bonuses
 */

import { CONFIG } from '../data/config.js';

export class ScoreManager {
    constructor() {
        this.currentScore = 0;
        this.attempts = 0;
        this.hintsUsed = 0;
        this.startTime = null;
        this.multiplier = 1.0;
    }

    /**
     * Reset score for new mission
     */
    reset() {
        this.currentScore = CONFIG.SCORING.BASE_SCORE;
        this.attempts = 0;
        this.hintsUsed = 0;
        this.startTime = Date.now();
        this.multiplier = 1.0;
    }

    /**
     * Get current score
     * @returns {number} Current score
     */
    getScore() {
        return Math.max(CONFIG.SCORING.MIN_SCORE, Math.floor(this.currentScore));
    }

    /**
     * Add points to score
     * @param {number} points - Points to add
     */
    addPoints(points) {
        this.currentScore += points * this.multiplier;
        this.currentScore = Math.min(this.currentScore, CONFIG.SCORING.MAX_SCORE);
    }

    /**
     * Subtract points from score
     * @param {number} points - Points to subtract
     */
    subtractPoints(points) {
        this.currentScore -= points;
        this.currentScore = Math.max(CONFIG.SCORING.MIN_SCORE, this.currentScore);
    }

    /**
     * Record an attempt
     */
    recordAttempt() {
        this.attempts++;
        this.subtractPoints(CONFIG.SCORING.ATTEMPT_PENALTY);
    }

    /**
     * Record a hint used
     */
    recordHint() {
        this.hintsUsed++;
        this.subtractPoints(CONFIG.SCORING.HINT_PENALTY);
    }

    /**
     * Get time elapsed in seconds
     * @returns {number} Seconds elapsed
     */
    getTimeElapsed() {
        if (!this.startTime) return 0;
        return Math.floor((Date.now() - this.startTime) / 1000);
    }

    /**
     * Calculate time bonus
     * @param {number} targetTime - Target completion time in seconds
     * @returns {number} Time bonus points
     */
    calculateTimeBonus(targetTime = CONFIG.TIMING.DEFAULT_MISSION_TIME) {
        const elapsed = this.getTimeElapsed();
        
        if (elapsed >= targetTime) {
            return 0;
        }
        
        const timeRemaining = targetTime - elapsed;
        const bonus = timeRemaining * CONFIG.SCORING.TIME_BONUS_MULTIPLIER;
        
        return Math.floor(bonus);
    }

    /**
     * Calculate accuracy bonus based on attempts
     * @returns {number} Accuracy bonus points
     */
    calculateAccuracyBonus() {
        if (this.attempts === 0) {
            return 0;
        }
        
        // Perfect on first try gets full bonus
        if (this.attempts === 1) {
            return CONFIG.SCORING.ACCURACY_BONUS;
        }
        
        // Diminishing returns for more attempts
        const accuracyPercent = 1 / this.attempts;
        const bonus = CONFIG.SCORING.ACCURACY_BONUS * accuracyPercent;
        
        return Math.floor(bonus);
    }

    /**
     * Calculate hint penalty
     * @returns {number} Total hint penalty
     */
    calculateHintPenalty() {
        return this.hintsUsed * CONFIG.SCORING.HINT_PENALTY;
    }

    /**
     * Calculate final score with all bonuses and penalties
     * @param {Object} stats - Mission completion stats
     * @returns {number} Final score
     */
    calculateFinalScore(stats = {}) {
        const baseScore = this.getScore();
        const timeBonus = this.calculateTimeBonus(stats.targetTime);
        const accuracyBonus = this.calculateAccuracyBonus();
        const hintPenalty = this.calculateHintPenalty();
        
        const finalScore = baseScore + timeBonus + accuracyBonus - hintPenalty;
        
        if (CONFIG.DEBUG.ENABLED) {
            console.log('📊 Score Breakdown:', {
                base: baseScore,
                timeBonus,
                accuracyBonus,
                hintPenalty,
                final: finalScore
            });
        }
        
        return Math.max(
            CONFIG.SCORING.MIN_SCORE,
            Math.min(finalScore, CONFIG.SCORING.MAX_SCORE)
        );
    }

    /**
     * Get score rank based on final score
     * @param {number} score - Final score
     * @returns {Object} Rank info
     */
    getScoreRank(score) {
        if (score >= 9000) {
            return { rank: 'S', name: 'ELITE', color: '#FFD700' };
        } else if (score >= 7500) {
            return { rank: 'A+', name: 'MASTER', color: '#00ff41' };
        } else if (score >= 6000) {
            return { rank: 'A', name: 'EXPERT', color: '#00f3ff' };
        } else if (score >= 4500) {
            return { rank: 'B', name: 'PROFICIENT', color: '#8b5cf6' };
        } else if (score >= 3000) {
            return { rank: 'C', name: 'COMPETENT', color: '#ff6b35' };
        } else if (score >= 1500) {
            return { rank: 'D', name: 'NOVICE', color: '#94a3b8' };
        } else {
            return { rank: 'F', name: 'BEGINNER', color: '#64748b' };
        }
    }

    /**
     * Calculate accuracy percentage
     * @returns {number} Accuracy percentage (0-100)
     */
    getAccuracyPercent() {
        if (this.attempts === 0) return 0;
        return Math.floor((1 / this.attempts) * 100);
    }

    /**
     * Check if score qualifies as perfect
     * @returns {boolean} Is perfect
     */
    isPerfectScore() {
        return this.attempts === 1 && this.hintsUsed === 0;
    }

    /**
     * Set score multiplier
     * @param {number} multiplier - Score multiplier
     */
    setMultiplier(multiplier) {
        this.multiplier = Math.max(0.1, Math.min(multiplier, 10));
    }

    /**
     * Get current multiplier
     * @returns {number} Current multiplier
     */
    getMultiplier() {
        return this.multiplier;
    }

    /**
     * Calculate XP earned
     * @param {number} finalScore - Final mission score
     * @param {Object} mission - Mission data
     * @returns {number} XP earned
     */
    calculateXP(finalScore, mission) {
        let xp = mission.rewards?.xp || 100;
        
        // Bonus XP for high scores
        const rank = this.getScoreRank(finalScore);
        if (rank.rank === 'S') {
            xp *= 2;
        } else if (rank.rank === 'A+') {
            xp *= 1.5;
        } else if (rank.rank === 'A') {
            xp *= 1.25;
        }
        
        // Perfect clear bonus
        if (this.isPerfectScore()) {
            xp *= 1.5;
        }
        
        return Math.floor(xp);
    }

    /**
     * Calculate credits earned
     * @param {number} finalScore - Final mission score
     * @param {Object} mission - Mission data
     * @returns {number} Credits earned
     */
    calculateCredits(finalScore, mission) {
        let credits = mission.rewards?.credits || 50;
        
        // Scale credits with score
        const scoreRatio = finalScore / CONFIG.SCORING.MAX_SCORE;
        credits *= (0.5 + scoreRatio);
        
        return Math.floor(credits);
    }

    /**
     * Format score with commas
     * @param {number} score - Score to format
     * @returns {string} Formatted score
     */
    static formatScore(score) {
        return score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    /**
     * Get score statistics
     * @returns {Object} Score stats
     */
    getStats() {
        return {
            score: this.getScore(),
            attempts: this.attempts,
            hintsUsed: this.hintsUsed,
            timeElapsed: this.getTimeElapsed(),
            accuracy: this.getAccuracyPercent(),
            isPerfect: this.isPerfectScore(),
            multiplier: this.multiplier
        };
    }

    /**
     * Format time as MM:SS
     * @param {number} seconds - Time in seconds
     * @returns {string} Formatted time
     */
    static formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
}