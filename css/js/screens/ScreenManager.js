/**
 * ScreenManager - Handles screen transitions and navigation
 */

import { CONFIG } from '../data/config.js';
import { AudioManager } from '../core/AudioManager.js';

export class ScreenManager {
    constructor() {
        this.currentScreen = 'main-menu';
        this.previousScreen = null;
        this.screenHistory = ['main-menu'];
        this.transitionInProgress = false;
        
        this.audio = AudioManager.getInstance();
    }

    /**
     * Show a specific screen
     * @param {string} screenId - Screen ID to show
     * @param {boolean} addToHistory - Add to navigation history
     */
    showScreen(screenId, addToHistory = true) {
        if (this.transitionInProgress) {
            console.warn('Transition already in progress');
            return;
        }

        const newScreen = document.getElementById(screenId);
        const currentScreenElement = document.getElementById(this.currentScreen);

        if (!newScreen) {
            console.error(`Screen not found: ${screenId}`);
            return;
        }

        if (screenId === this.currentScreen) {
            console.log('Already on this screen');
            return;
        }

        this.transitionInProgress = true;

        // Play transition sound
        this.audio.playButtonClick();

        // Fade out current screen
        if (currentScreenElement) {
            currentScreenElement.style.animation = 'fadeOut 0.2s ease';
            
            setTimeout(() => {
                currentScreenElement.classList.remove('active');
                currentScreenElement.style.animation = '';
                
                // Fade in new screen
                this.showNewScreen(newScreen, screenId, addToHistory);
            }, 200);
        } else {
            this.showNewScreen(newScreen, screenId, addToHistory);
        }
    }

    /**
     * Internal method to show new screen
     * @param {HTMLElement} newScreen - New screen element
     * @param {string} screenId - Screen ID
     * @param {boolean} addToHistory - Add to history
     */
    showNewScreen(newScreen, screenId, addToHistory) {
        // Clean up previous screen
        this.onScreenHide(this.currentScreen);
        
        // Hide ALL screens first
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
            screen.style.display = 'none';
        });
        
        // Show only the target screen
        newScreen.classList.add('active');
        newScreen.style.display = 'flex';
        
        // Update state
        this.previousScreen = this.currentScreen;
        this.currentScreen = screenId;
        
        if (addToHistory) {
            this.screenHistory.push(screenId);
        }
        
        // Handle screen-specific logic
        this.onScreenShow(screenId);
        
        this.transitionInProgress = false;
        
        if (CONFIG.DEBUG.ENABLED) {
            console.log(`📺 Screen: ${screenId}`);
        }
    }

    /**
     * Screen cleanup when hiding
     * @param {string} screenId - Screen that was hidden
     */
    onScreenHide(screenId) {
        switch (screenId) {
            case 'game-screen':
                // Clean up music control panel
                if (window.game && window.game.ui) {
                    window.game.ui.cleanupMusicControlPanel();
                }
                break;
        }
    }

    /**
     * Screen-specific initialization
     * @param {string} screenId - Screen that was shown
     */
    onScreenShow(screenId) {
        switch (screenId) {
            case 'main-menu':
                this.audio.playMusic('menu');
                break;
            case 'game-screen':
                this.audio.crossfade('gameplay');
                // Initialize music control panel for game screen
                this.initializeMusicControlPanel();
                break;
            case 'mission-select':
                // Keep current music or play menu music
                if (!this.audio.currentMusic || this.audio.currentMusic === 'loading') {
                    this.audio.playMusic('menu');
                }
                break;
        }
    }

    /**
     * Initialize music control panel for game screen
     */
    initializeMusicControlPanel() {
        // Get UI manager from global game instance
        if (window.game && window.game.ui) {
            window.game.ui.setupMusicControlPanel(this.audio);
            window.game.ui.updateMusicPanel(this.audio);
        }
    }

    /**
     * Go back to previous screen
     * @returns {boolean} Success status
     */
    goBack() {
        if (this.screenHistory.length <= 1) {
            console.log('No previous screen');
            return false;
        }

        // Remove current screen from history
        this.screenHistory.pop();
        
        // Get previous screen
        const previousId = this.screenHistory[this.screenHistory.length - 1];
        
        // Show previous screen without adding to history
        this.showScreen(previousId, false);
        
        return true;
    }

    /**
     * Get current screen ID
     * @returns {string} Current screen ID
     */
    getCurrentScreen() {
        return this.currentScreen;
    }

    /**
     * Get previous screen ID
     * @returns {string} Previous screen ID
     */
    getPreviousScreen() {
        return this.previousScreen;
    }

    /**
     * Check if on specific screen
     * @param {string} screenId - Screen ID to check
     * @returns {boolean} Is on screen
     */
    isOnScreen(screenId) {
        return this.currentScreen === screenId;
    }

    /**
     * Clear screen history
     */
    clearHistory() {
        this.screenHistory = [this.currentScreen];
    }

    /**
     * Get screen history
     * @returns {Array} Screen history
     */
    getHistory() {
        return [...this.screenHistory];
    }

    /**
     * Force show screen immediately (no animation)
     * @param {string} screenId - Screen ID to show
     */
    forceShowScreen(screenId) {
        // Hide all screens completely
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
            screen.style.display = 'none';
        });

        // Show target screen
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
            targetScreen.style.display = 'flex';
            this.currentScreen = screenId;
            this.onScreenShow(screenId);
            
            console.log(`🎯 Force showing screen: ${screenId}`);
        }
    }

    /**
     * Reload current screen
     */
    reloadScreen() {
        const currentId = this.currentScreen;
        this.forceShowScreen(currentId);
    }
}

/**
 * Screen transition utility functions
 */
export const ScreenTransitions = {
    /**
     * Fade transition
     * @param {HTMLElement} element - Element to animate
     * @param {string} direction - 'in' or 'out'
     */
    fade(element, direction = 'in') {
        const animation = direction === 'in' ? 'fadeIn' : 'fadeOut';
        element.style.animation = `${animation} ${CONFIG.UI.ANIMATION_SPEED}ms ease`;
    },

    /**
     * Slide transition
     * @param {HTMLElement} element - Element to animate
     * @param {string} direction - 'left', 'right', 'up', 'down'
     */
    slide(element, direction = 'up') {
        const animationMap = {
            up: 'slideInUp',
            down: 'slideInDown',
            left: 'slideInLeft',
            right: 'slideInRight'
        };
        const animation = animationMap[direction] || 'slideInUp';
        element.style.animation = `${animation} ${CONFIG.UI.ANIMATION_SPEED}ms ease`;
    },

    /**
     * Zoom transition
     * @param {HTMLElement} element - Element to animate
     * @param {string} direction - 'in' or 'out'
     */
    zoom(element, direction = 'in') {
        const animation = direction === 'in' ? 'zoomIn' : 'zoomOut';
        element.style.animation = `${animation} ${CONFIG.UI.ANIMATION_SPEED}ms ease`;
    }
};