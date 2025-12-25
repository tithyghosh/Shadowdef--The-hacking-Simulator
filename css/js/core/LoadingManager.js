/**
 * LoadingManager - Handles game loading screen and asset loading
 */

import { NetworkBackground } from '../ui/NetworkBackground.js';
import { AudioManager } from './AudioManager.js';

export class LoadingManager {
    constructor() {
        this.loadingScreen = document.getElementById('loading-screen');
        this.progressFill = document.getElementById('loading-progress-fill');
        this.progressPercentage = document.getElementById('loading-percentage');
        
        this.currentProgress = 0;
        this.targetProgress = 0;
        this.isLoading = true;
        this.loadingSteps = [];
        this.currentStepIndex = 0;
        
        this.onLoadingComplete = null;
        this.networkBackground = null;
        
        this.setupLoadingSteps();
        this.initNetworkBackground();
    }

    /**
     * Initialize network background for loading screen
     */
    initNetworkBackground() {
        // Create a canvas for the loading screen network background
        const canvas = document.createElement('canvas');
        canvas.id = 'loading-network-canvas';
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.zIndex = '1';
        canvas.style.pointerEvents = 'none';
        canvas.style.opacity = '0.6'; // Make network more visible
        
        if (this.loadingScreen) {
            // Insert as first child so it's behind content
            this.loadingScreen.insertBefore(canvas, this.loadingScreen.firstChild);
            this.networkBackground = new NetworkBackground('loading-network-canvas');
            console.log('🌐 Loading screen network background initialized');
        }
    }

    /**
     * Define loading steps with descriptions and durations
     */
    setupLoadingSteps() {
        this.loadingSteps = [
            { name: 'Initializing Core Systems...', duration: 1000, progress: 15 },
            { name: 'Loading Game Assets...', duration: 1500, progress: 35 },
            { name: 'Preparing Audio Systems...', duration: 800, progress: 50 },
            { name: 'Loading Mission Data...', duration: 1200, progress: 70 },
            { name: 'Initializing Security Protocols...', duration: 1000, progress: 85 },
            { name: 'Finalizing Setup...', duration: 800, progress: 100 }
        ];
    }

    /**
     * Start the loading process
     * @param {Function} onComplete - Callback when loading is complete
     */
    startLoading(onComplete) {
        this.onLoadingComplete = onComplete;
        this.currentStepIndex = 0;
        this.currentProgress = 0;
        this.targetProgress = 0;
        
        // Start network background animation
        if (this.networkBackground) {
            this.networkBackground.start();
        }
        
        // Start loading music
        const audio = AudioManager.getInstance();
        if (audio) {
            audio.playMusic('loading');
        }
        
        // Start progress animation
        this.animateProgress();
        
        // Start loading steps
        this.executeNextStep();
        
        console.log('🔄 Loading started...');
    }

    /**
     * Execute the next loading step
     */
    executeNextStep() {
        if (this.currentStepIndex >= this.loadingSteps.length) {
            this.completeLoading();
            return;
        }

        const step = this.loadingSteps[this.currentStepIndex];
        
        // Update loading label
        const progressLabel = document.querySelector('.progress-label');
        if (progressLabel) {
            progressLabel.textContent = step.name;
        }
        
        // Set target progress
        this.targetProgress = step.progress;
        
        // Move to next step after duration
        setTimeout(() => {
            this.currentStepIndex++;
            this.executeNextStep();
        }, step.duration);
    }

    /**
     * Animate progress bar smoothly
     */
    animateProgress() {
        if (!this.isLoading) return;

        // Smooth progress animation
        if (this.currentProgress < this.targetProgress) {
            this.currentProgress += (this.targetProgress - this.currentProgress) * 0.05;
            
            // Ensure we don't overshoot
            if (this.currentProgress > this.targetProgress - 0.1) {
                this.currentProgress = this.targetProgress;
            }
        }

        // Update UI
        this.updateProgressUI();

        // Continue animation
        requestAnimationFrame(() => this.animateProgress());
    }

    /**
     * Update progress bar and percentage display
     */
    updateProgressUI() {
        const roundedProgress = Math.floor(this.currentProgress);
        
        if (this.progressFill) {
            this.progressFill.style.width = `${this.currentProgress}%`;
        }
        
        if (this.progressPercentage) {
            this.progressPercentage.textContent = `${roundedProgress}%`;
        }
    }

    /**
     * Complete the loading process
     */
    completeLoading() {
        this.isLoading = false;
        this.currentProgress = 100;
        this.targetProgress = 100;
        this.updateProgressUI();
        
        // Update final message
        const progressLabel = document.querySelector('.progress-label');
        if (progressLabel) {
            progressLabel.textContent = 'Loading Complete!';
        }
        
        console.log('✅ Loading complete!');
        
        // Wait a moment then transition to main menu
        setTimeout(() => {
            this.transitionToMainMenu();
        }, 1000);
    }

    /**
     * Transition from loading screen to main menu
     */
    transitionToMainMenu() {
        if (!this.loadingScreen) return;

        // Stop network background
        if (this.networkBackground) {
            this.networkBackground.stop();
            this.networkBackground.clear();
        }

        // Add exit animation class
        this.loadingScreen.classList.add('loading-screen-exit');
        
        // After animation completes, hide loading screen and show main menu
        setTimeout(() => {
            // Completely hide loading screen
            this.loadingScreen.classList.remove('active');
            this.loadingScreen.classList.remove('loading-screen-exit');
            this.loadingScreen.style.display = 'none';
            
            // Remove network canvas if it exists
            const networkCanvas = document.getElementById('loading-network-canvas');
            if (networkCanvas && networkCanvas.parentNode) {
                networkCanvas.parentNode.removeChild(networkCanvas);
            }
            
            // Show main menu
            const mainMenu = document.getElementById('main-menu');
            if (mainMenu) {
                mainMenu.classList.add('active');
                mainMenu.style.display = 'flex';
            }
            
            // Call completion callback
            if (this.onLoadingComplete) {
                this.onLoadingComplete();
            }
            
            console.log('🎮 Transitioned to main menu');
        }, 1000);
    }

    /**
     * Set custom loading progress (for manual control)
     * @param {number} progress - Progress percentage (0-100)
     * @param {string} message - Loading message
     */
    setProgress(progress, message = null) {
        this.targetProgress = Math.max(0, Math.min(100, progress));
        
        if (message) {
            const progressLabel = document.querySelector('.progress-label');
            if (progressLabel) {
                progressLabel.textContent = message;
            }
        }
    }

    /**
     * Add a custom loading step
     * @param {string} name - Step name/description
     * @param {number} duration - Duration in milliseconds
     * @param {number} progress - Target progress percentage
     */
    addLoadingStep(name, duration, progress) {
        this.loadingSteps.push({ name, duration, progress });
    }

    /**
     * Skip loading (for development/testing)
     */
    skipLoading() {
        this.isLoading = false;
        this.currentProgress = 100;
        this.targetProgress = 100;
        
        // Stop network background
        if (this.networkBackground) {
            this.networkBackground.stop();
            this.networkBackground.clear();
        }
        
        this.transitionToMainMenu();
    }

    /**
     * Reset loading manager
     */
    reset() {
        this.currentProgress = 0;
        this.targetProgress = 0;
        this.currentStepIndex = 0;
        this.isLoading = true;
        
        // Reset UI
        if (this.progressFill) {
            this.progressFill.style.width = '0%';
        }
        if (this.progressPercentage) {
            this.progressPercentage.textContent = '0%';
        }
        
        // Show loading screen
        if (this.loadingScreen) {
            this.loadingScreen.classList.add('active');
            this.loadingScreen.style.display = 'flex';
        }
        
        // Hide main menu
        const mainMenu = document.getElementById('main-menu');
        if (mainMenu) {
            mainMenu.classList.remove('active');
            mainMenu.style.display = 'none';
        }
    }

    /**
     * Completely clean up loading screen
     */
    cleanup() {
        if (this.networkBackground) {
            this.networkBackground.destroy();
            this.networkBackground = null;
        }
        
        // Remove network canvas
        const networkCanvas = document.getElementById('loading-network-canvas');
        if (networkCanvas && networkCanvas.parentNode) {
            networkCanvas.parentNode.removeChild(networkCanvas);
        }
        
        // Hide loading screen
        if (this.loadingScreen) {
            this.loadingScreen.style.display = 'none';
            this.loadingScreen.classList.remove('active');
        }
    }

    /**
     * Get current loading progress
     * @returns {number} Current progress percentage
     */
    getProgress() {
        return this.currentProgress;
    }

    /**
     * Check if loading is in progress
     * @returns {boolean} Is loading
     */
    isLoadingInProgress() {
        return this.isLoading;
    }
}