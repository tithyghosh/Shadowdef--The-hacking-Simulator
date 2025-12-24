/**
 * Timer - Countdown timer system
 * Manages mission time limits with callbacks
 */

import { CONFIG } from '../data/config.js';

export class Timer {
    constructor(duration, callbacks = {}) {
        this.duration = duration; // in seconds
        this.remaining = duration;
        this.startTime = null;
        this.pausedTime = 0;
        this.isRunning = false;
        this.isPaused = false;
        this.interval = null;
        this.warningTriggered = false;
        
        // Callbacks
        this.onTick = callbacks.onTick || (() => {});
        this.onWarning = callbacks.onWarning || (() => {});
        this.onExpire = callbacks.onExpire || (() => {});
        
        this.warningThreshold = callbacks.warningThreshold || CONFIG.TIMING.WARNING_TIME;
    }

    /**
     * Start the timer
     */
    start() {
        if (this.isRunning) return;
        
        this.startTime = Date.now();
        this.isRunning = true;
        this.isPaused = false;
        
        this.interval = setInterval(() => this.tick(), 1000);
        
        if (CONFIG.DEBUG.ENABLED) {
            console.log(`⏱️ Timer started: ${this.duration}s`);
        }
    }

    /**
     * Pause the timer
     */
    pause() {
        if (!this.isRunning || this.isPaused) return;
        
        this.isPaused = true;
        this.pausedTime = Date.now();
        
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        
        if (CONFIG.DEBUG.ENABLED) {
            console.log('⏸️ Timer paused');
        }
    }

    /**
     * Resume the timer
     */
    resume() {
        if (!this.isPaused) return;
        
        // Adjust start time to account for pause duration
        const pauseDuration = Date.now() - this.pausedTime;
        this.startTime += pauseDuration;
        
        this.isPaused = false;
        this.interval = setInterval(() => this.tick(), 1000);
        
        if (CONFIG.DEBUG.ENABLED) {
            console.log('▶️ Timer resumed');
        }
    }

    /**
     * Stop the timer
     */
    stop() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        this.isPaused = false;
        
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        
        if (CONFIG.DEBUG.ENABLED) {
            console.log('⏹️ Timer stopped');
        }
    }

    /**
     * Reset the timer
     * @param {number} newDuration - New duration (optional)
     */
    reset(newDuration = null) {
        this.stop();
        
        if (newDuration !== null) {
            this.duration = newDuration;
        }
        
        this.remaining = this.duration;
        this.startTime = null;
        this.pausedTime = 0;
        this.warningTriggered = false;
    }

    /**
     * Timer tick (called every second)
     */
    tick() {
        if (this.isPaused) return;
        
        const elapsed = this.getElapsed();
        this.remaining = Math.max(0, this.duration - elapsed);
        
        // Trigger tick callback
        this.onTick(this.remaining);
        
        // Check for warning threshold
        if (!this.warningTriggered && this.remaining <= this.warningThreshold && this.remaining > 0) {
            this.warningTriggered = true;
            this.onWarning(this.remaining);
        }
        
        // Check for expiration
        if (this.remaining <= 0) {
            this.stop();
            this.onExpire();
        }
    }

    /**
     * Get elapsed time in seconds
     * @returns {number} Elapsed seconds
     */
    getElapsed() {
        if (!this.startTime) return 0;
        return Math.floor((Date.now() - this.startTime) / 1000);
    }

    /**
     * Get remaining time in seconds
     * @returns {number} Remaining seconds
     */
    getRemaining() {
        return this.remaining;
    }

    /**
     * Get progress as percentage (0-100)
     * @returns {number} Progress percentage
     */
    getProgress() {
        return ((this.duration - this.remaining) / this.duration) * 100;
    }

    /**
     * Check if timer is running
     * @returns {boolean} Is running
     */
    isActive() {
        return this.isRunning && !this.isPaused;
    }

    /**
     * Add time to timer
     * @param {number} seconds - Seconds to add
     */
    addTime(seconds) {
        this.remaining += seconds;
        this.duration += seconds;
    }

    /**
     * Subtract time from timer
     * @param {number} seconds - Seconds to subtract
     */
    subtractTime(seconds) {
        this.remaining = Math.max(0, this.remaining - seconds);
    }

    /**
     * Format time as MM:SS
     * @param {number} seconds - Time in seconds
     * @returns {string} Formatted time
     */
    static format(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    /**
     * Get formatted remaining time
     * @returns {string} Formatted time
     */
    getFormattedTime() {
        return Timer.format(this.remaining);
    }
}