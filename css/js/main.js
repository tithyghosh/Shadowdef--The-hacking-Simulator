/**
 * SHADOWDEF - Main Application Entry Point
 * Initializes game systems and handles global setup
 */

import { Game } from './core/Game.js';
import { LoadingManager } from './core/LoadingManager.js';
import { AuthManager } from './core/AuthManager.js';
import { Background } from './ui/Background.js';
import { UIManager } from './ui/UIManager.js';
import { AudioManager } from './core/AudioManager.js';
import { LoginScreen } from './screens/LoginScreen.js';
import { ProfileScreen } from './screens/ProfileScreen.js';

// Global game instance
let game = null;
let background = null;
let loadingManager = null;
let authManager = null;
let loginScreen = null;
let profileScreen = null;

/**
 * Initialize the loading screen first
 */
function initLoading() {
    console.log('🎮 SHADOWDEF Starting...');

    try {
        // Initialize loading manager
        loadingManager = new LoadingManager();

        // Start loading process
        loadingManager.startLoading(() => {
            // Loading complete - check authentication
            console.log('🎯 Game ready - checking authentication...');
            checkAuthenticationState();
        });

        // Initialize game systems during loading
        setTimeout(() => {
            initGameSystems();
        }, 500);

    } catch (error) {
        console.error('❌ Loading initialization failed:', error);

        // Fallback: skip loading and go directly to game initialization
        console.log('🔄 Falling back to direct initialization...');
        initGameSystems();

        // Wait a bit then check authentication
        setTimeout(() => {
            checkAuthenticationState();
        }, 1000);
    }
}

/**
 * Initialize the game systems
 */
function initGameSystems() {
    try {
        // Initialize animated background
        background = new Background('bg-canvas');
        background.start();

        // Initialize authentication manager
        authManager = AuthManager.getInstance();

        // Initialize audio manager
        const audio = AudioManager.getInstance();

        // Initialize UI manager
        const ui = new UIManager();

        // Initialize game controller
        game = new Game(ui, audio);

        // Initialize screen controllers
        loginScreen = new LoginScreen(game);
        profileScreen = new ProfileScreen(game);

        // Attach to window for debugging and screen manager access
        window.game = game;
        window.authManager = authManager;
        window.loadingManager = loadingManager;
        window.updateMainMenuStatus = updateMainMenuStatus;

        // Setup event listeners
        setupEventListeners();

        console.log('✅ SHADOWDEF Systems Initialized!');

    } catch (error) {
        console.error('❌ Initialization failed:', error);
        showErrorScreen('Failed to initialize game. Please refresh the page.');
    }
}

/**
 * Check authentication state after loading
 */
function checkAuthenticationState() {
    console.log('🔐 Checking authentication state...');

    if (authManager.isUserAuthenticated()) {
        // User is logged in, load their progress and go to main menu
        game.loadProgress();
        game.screens.showScreen('main-menu');
        console.log('👤 User authenticated, proceeding to main menu');
    } else {
        // No user logged in, show login screen
        game.screens.showScreen('login-screen');
        loginScreen.render();
        console.log('🔐 No authentication, showing login screen');
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

    // Authentication event listeners
    document.addEventListener('shadowdef:auth:login', (e) => {
        console.log('🎉 User logged in:', e.detail.name);
        // Load user progress and sync game data
        game.loadProgress();
        // Update audio preferences
        const userPrefs = authManager.getUserPreferences();
        if (userPrefs.musicVolume !== undefined) {
            game.audio.setMusicVolume(userPrefs.musicVolume);
        }
        if (userPrefs.sfxVolume !== undefined) {
            game.audio.setSfxVolume(userPrefs.sfxVolume);
        }
        // Update main menu status
        updateMainMenuStatus();
    });

    document.addEventListener('shadowdef:auth:logout', () => {
        console.log('👋 User logged out');
        // Clear any game state and return to login
        game.state.resetProgress();
        // Update main menu status
        updateMainMenuStatus();
    });

    document.addEventListener('shadowdef:auth:statsUpdate', (e) => {
        console.log('📊 User stats updated:', e.detail);
        // Update main menu status when stats change
        updateMainMenuStatus();
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

        // Force start loading if stuck (F5 key)
        if (e.key === 'F5' && loadingManager) {
            e.preventDefault();
            console.log('🚨 Force starting loading...');
            loadingManager.forceStart();
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
        if (authManager && authManager.isUserAuthenticated()) {
            authManager.syncGameData();
        }
    });

    // Visibility change - pause when tab hidden
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && game) {
            game.handleTabHidden();
        }
    });

    // Auto-sync user data periodically
    if (authManager) {
        setInterval(() => {
            if (authManager.isUserAuthenticated()) {
                authManager.syncGameData();
            }
        }, 5 * 60 * 1000); // Every 5 minutes
    }
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
        case 'mission-select':
            game.showMissionSelect();
            break;
        case 'profile':
            game.screens.showScreen('profile-screen');
            profileScreen.render();
            break;
        case 'credits-store':
            showCreditsStore();
            break;
        case 'settings':
            game.showSettings();
            break;
        case 'credits':
            game.showCredits();
            break;
        case 'login':
            if (authManager.isUserAuthenticated()) {
                // User is logged in, show logout confirmation
                game.ui.showConfirm(
                    'Logout Confirmation',
                    'Are you sure you want to logout? Your progress will be saved.',
                    async () => {
                        await authManager.logout();
                    }
                );
            } else {
                // User not logged in, show login screen
                game.screens.showScreen('login-screen');
                loginScreen.render();
            }
            break;
        case 'back':
            game.goBack();
            break;
        case 'back-to-categories':
            game.showMissionCategories();
            break;
        case 'back-to-levels':
            game.backToCurrentCategoryLevels();
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
 * Show credits store modal
 */
function showCreditsStore() {
    const user = authManager.getCurrentUser();
    const credits = user?.gameStats?.credits || 0;

    game.ui.showModal('Gaming Credits', `
        <div class="credits-store">
            <div class="current-credits">
                <div class="credits-display-large">
                    <span class="credits-icon">💰</span>
                    <span class="credits-amount">${credits}</span>
                    <span class="credits-label">Credits</span>
                </div>
            </div>
            
            <div class="credits-info">
                <h3>How to Earn Credits:</h3>
                <div class="earning-methods">
                    <div class="earning-method">
                        <span class="method-icon">🎯</span>
                        <span class="method-text">Complete missions</span>
                        <span class="method-reward">+100-500</span>
                    </div>
                    <div class="earning-method">
                        <span class="method-icon">🏆</span>
                        <span class="method-text">Unlock achievements</span>
                        <span class="method-reward">+200-1000</span>
                    </div>
                    <div class="earning-method">
                        <span class="method-icon">⚡</span>
                        <span class="method-text">Speed bonuses</span>
                        <span class="method-reward">+50-200</span>
                    </div>
                    <div class="earning-method">
                        <span class="method-icon">📅</span>
                        <span class="method-text">Daily login</span>
                        <span class="method-reward">+50</span>
                    </div>
                </div>
                
                <p style="text-align: center; margin-top: 20px; color: var(--text-secondary);">
                    Credits will be used for future features like unlocking premium missions and cosmetic upgrades!
                </p>
            </div>
        </div>
    `, {
        buttons: [
            {
                text: 'START EARNING',
                class: 'btn-primary',
                onClick: () => {
                    game.showMissionSelect();
                }
            }
        ]
    });
}

/**
 * Update main menu user status and stats
 */
function updateMainMenuStatus() {
    const userInfo = document.getElementById('user-info');
    const userName = document.getElementById('user-name');
    const userStatus = document.getElementById('user-status');
    const userAvatar = document.getElementById('user-avatar');
    const loginLogoutBtn = document.getElementById('login-logout-btn');
    const profileStats = document.getElementById('profile-stats');
    const creditsDisplay = document.getElementById('credits-display');
    const missionProgress = document.getElementById('mission-progress');

    if (!authManager) return;

    const isAuthenticated = authManager.isUserAuthenticated();
    const user = authManager.getCurrentUser();

    if (isAuthenticated && user) {
        // Update user info - show logged in user's name
        if (userName) userName.textContent = user.name || 'User';

        // Hide status line when logged in
        if (userStatus) {
            userStatus.textContent = '';
            userStatus.style.display = 'none';
        }

        if (userAvatar) {
            if (user.avatar) {
                userAvatar.innerHTML = `<img src="${user.avatar}" alt="${user.name}">`;
            } else {
                userAvatar.textContent = (user.name || 'U').charAt(0).toUpperCase();
            }
        }
        if (loginLogoutBtn) {
            loginLogoutBtn.textContent = 'LOGOUT';
            loginLogoutBtn.dataset.action = 'login'; // Handler checks auth state
        }

        // Update stats
        const stats = user.gameStats || {};
        if (profileStats) {
            profileStats.textContent = `Level ${stats.level || 1} • ${stats.credits || 0} Credits`;
        }
        if (creditsDisplay) {
            creditsDisplay.textContent = `${stats.credits || 0} Credits`;
        }
        if (missionProgress) {
            missionProgress.textContent = `${stats.missionsCompleted || 0}/20 Completed`;
        }
    } else {
        // Guest user
        if (userName) userName.textContent = 'Guest Player';
        if (userStatus) {
            userStatus.textContent = 'Not logged in';
            userStatus.style.display = ''; // Show status for guest users
        }
        if (userAvatar) userAvatar.textContent = '👤';
        if (loginLogoutBtn) {
            loginLogoutBtn.textContent = 'LOGIN';
            loginLogoutBtn.dataset.action = 'login';
        }
        if (profileStats) profileStats.textContent = 'Level 1 • 0 Credits';
        if (creditsDisplay) creditsDisplay.textContent = '0 Credits';
        if (missionProgress) missionProgress.textContent = '0/20 Completed';
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
 * Update user game statistics (called by game systems)
 */
export function updateUserStats(newStats) {
    if (authManager && authManager.isUserAuthenticated()) {
        authManager.updateGameStats(newStats);
    }
}

/**
 * Award credits to user (called by game systems)
 */
export function awardCredits(amount, reason = 'Game completion') {
    if (authManager && authManager.isUserAuthenticated()) {
        const currentStats = authManager.getUserStats();
        const newCredits = (currentStats.credits || 0) + amount;

        authManager.updateGameStats({
            credits: newCredits
        });

        // Show notification
        if (game && game.ui) {
            game.ui.showNotification(`+${amount} credits earned! (${reason})`, 'success');
        }

        console.log(`💰 Awarded ${amount} credits: ${reason}`);
    }
}

/**
 * Update user experience and level
 */
export function awardExperience(xp, reason = 'Mission completion') {
    if (authManager && authManager.isUserAuthenticated()) {
        const currentStats = authManager.getUserStats();
        const currentXP = currentStats.experience || 0;
        const currentLevel = currentStats.level || 1;
        const newXP = currentXP + xp;

        // Calculate new level
        const newLevel = Math.floor(newXP / 1000) + 1;
        const leveledUp = newLevel > currentLevel;

        authManager.updateGameStats({
            experience: newXP,
            level: newLevel
        });

        // Show notifications
        if (game && game.ui) {
            game.ui.showNotification(`+${xp} XP earned! (${reason})`, 'success');

            if (leveledUp) {
                game.ui.showNotification(`🎉 Level Up! You are now level ${newLevel}!`, 'success', 5000);
                awardCredits(100, 'Level up bonus');
            }
        }

        console.log(`⭐ Awarded ${xp} XP: ${reason}`);
    }
}

// Start the game when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLoading);
} else {
    initLoading();
}

// Export for debugging and game integration
export { game, loadingManager, authManager, updateMainMenuStatus };