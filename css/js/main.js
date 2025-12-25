/**
 * SHADOWDEF - Main Application Entry Point
 * Initializes game systems and handles global setup
 */

import { Game } from './core/Game.js';
import { LoadingManager } from './core/LoadingManager.js';
import { Background } from './ui/Background.js';
import { UIManager } from './ui/UIManager.js';
import { AudioManager } from './core/AudioManager.js';

// Global game instance
let game = null;
let background = null;
let loadingManager = null;

/**
 * Initialize the loading screen first
 */
function initLoading() {
    console.log('🎮 SHADOWDEF Starting...');
    
    // Initialize loading manager
    loadingManager = new LoadingManager();
    
    // Start loading process
    loadingManager.startLoading(() => {
        // Loading complete - game is ready
        console.log('🎯 Game ready for interaction');
    });
    
    // Initialize game systems during loading
    setTimeout(() => {
        initGameSystems();
    }, 500);
}

/**
 * Initialize the game systems
 */
function initGameSystems() {
    try {
        // Initialize animated background
        background = new Background('bg-canvas');
        background.start();

        // Initialize audio manager
        const audio = AudioManager.getInstance();

        // Initialize UI manager
        const ui = new UIManager();

        // Initialize game controller
        game = new Game(ui, audio);

        // Attach game to window for debugging (remove in production)
        window.game = game;
        window.loadingManager = loadingManager;

        // Setup event listeners
        setupEventListeners();

        // Load saved data if exists
        game.loadProgress();

        console.log('✅ SHADOWDEF Systems Initialized!');

    } catch (error) {
        console.error('❌ Initialization failed:', error);
        showErrorScreen('Failed to initialize game. Please refresh the page.');
    }
}

/**
 * Setup global event listeners
 */
function setupEventListeners() {
    // Button click delegation
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;

        const action = btn.dataset.action;
        handleAction(action, e);
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // ESC to pause/back
        if (e.key === 'Escape') {
            if (game) game.handleEscape();
        }
        
        // F11 for fullscreen
        if (e.key === 'F11') {
            e.preventDefault();
            toggleFullscreen();
        }
        
        // Skip loading screen (development shortcut)
        if (e.key === 'Enter' && loadingManager && loadingManager.isLoadingInProgress()) {
            console.log('⏭️ Skipping loading screen...');
            loadingManager.skipLoading();
        }
    });

    // Window resize
    window.addEventListener('resize', () => {
        if (background) {
            background.resize();
        }
    });

    // Before unload - save progress
    window.addEventListener('beforeunload', () => {
        if (game) {
            game.saveProgress();
        }
    });

    // Visibility change - pause when tab hidden
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && game) {
            game.handleTabHidden();
        }
    });
}

/**
 * Handle button actions
 */
function handleAction(action, event) {
    if (!game) {
        console.warn('Game not initialized yet');
        return;
    }

    switch (action) {
        case 'new-game':
            game.startNewGame();
            break;
        case 'mission-select':
            game.showMissionSelect();
            break;
        case 'settings':
            game.showSettings();
            break;
        case 'credits':
            game.showCredits();
            break;
        case 'back':
            game.goBack();
            break;
        case 'pause':
            game.pauseGame();
            break;
        case 'hint':
            game.requestHint();
            break;
        default:
            console.warn('Unknown action:', action);
    }
}

/**
 * Toggle fullscreen mode
 */
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.error('Fullscreen error:', err);
        });
    } else {
        document.exitFullscreen();
    }
}

/**
 * Show error screen
 */
function showErrorScreen(message) {
    const container = document.getElementById('game-container');
    container.innerHTML = `
        <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; text-align: center; padding: 20px;">
            <h1 style="color: var(--cyber-pink); font-size: 3rem; margin-bottom: 20px;">ERROR</h1>
            <p style="color: var(--text-secondary); font-size: 1.2rem; max-width: 600px;">${message}</p>
            <button class="btn btn-primary" style="margin-top: 30px;" onclick="location.reload()">
                RELOAD GAME
            </button>
        </div>
    `;
}

/**
 * Loading screen (optional - show while assets load)
 */
function showLoadingScreen() {
    const container = document.getElementById('game-container');
    container.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p style="margin-top: 20px;">INITIALIZING...</p>
        </div>
    `;
}

// Start the game when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLoading);
} else {
    initLoading();
}

// Export for debugging
export { game, loadingManager };