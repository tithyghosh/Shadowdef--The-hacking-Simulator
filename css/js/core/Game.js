/**
 * Game Controller - Manages game state and flow
 */

import { StateManager } from './StateManager.js';
import { ScoreManager } from './ScoreManager.js';
import { ScreenManager } from '../screens/ScreenManager.js';
import { MissionSelect } from '../screens/MissionSelect.js';
import { GameScreen } from '../screens/GameScreen.js';
import { 
    missions, 
    passwordMissions, 
    malwareMissions, 
    networkMissions,
    getMissionsBySection,
    getMissionById,
    unlockNextLevelInSection,
    getUnlockedMissionsForSection,
    getCompletedMissionsForSection
} from '../data/missions.js';

export class Game {
    constructor(uiManager, audioManager) {
        this.ui = uiManager;
        this.audio = audioManager;
        this.state = new StateManager();
        this.score = new ScoreManager();
        this.screens = new ScreenManager();
        
        this.currentMission = null;
        this.activePuzzle = null;
        this.currentSection = null; // Track current section
        
        // Initialize mission data - separate sections
        this.passwordMissions = passwordMissions;
        this.malwareMissions = malwareMissions;
        this.networkMissions = networkMissions;
        this.missions = missions; // Combined for backward compatibility
        
        // Screen instances
        this.missionSelectScreen = new MissionSelect(this);
        this.gameScreen = new GameScreen(this);
        
        // Load progress and initialize
        this.init();
    }

    /**
     * Initialize the game
     */
    init() {
        this.loadProgress();
        console.log('🎮 Game initialized');
    }

    /**
     * Start a new game
     */
    startNewGame() {
        console.log('🎮 Starting new game...');
        
        // Reset progress for all sections
        this.state.resetProgress();
        
        // Ensure first levels are unlocked in each section
        this.passwordMissions[0].locked = false;
        this.malwareMissions[0].locked = false;
        this.networkMissions[0].locked = false;
        
        // Lock all other levels
        this.passwordMissions.slice(1).forEach(m => m.locked = true);
        this.malwareMissions.slice(1).forEach(m => m.locked = true);
        this.networkMissions.slice(1).forEach(m => m.locked = true);
        
        // Show mission categories
        this.showMissionCategories();
    }

    /**
     * Show mission categories screen
     */
    showMissionCategories() {
        this.screens.showScreen('mission-select');
        this.updateCategoryProgress();
    }

    /**
     * Show missions for a specific category
     */
    showCategoryMissions(category) {
        let screenId, gridId, missions;
        
        switch (category) {
            case 'password':
                screenId = 'password-missions';
                gridId = 'password-mission-grid';
                missions = this.passwordMissions;
                this.currentSection = 'password';
                break;
            case 'malware':
                screenId = 'malware-missions';
                gridId = 'malware-mission-grid';
                missions = this.malwareMissions;
                this.currentSection = 'malware';
                break;
            case 'network':
                screenId = 'network-missions';
                gridId = 'network-mission-grid';
                missions = this.networkMissions;
                this.currentSection = 'network';
                break;
            default:
                console.warn('Unknown category:', category);
                return;
        }

        this.screens.showScreen(screenId);
        this.missionSelectScreen.renderCategory(missions, gridId);
    }

    /**
     * Update category progress indicators
     */
    updateCategoryProgress() {
        const passwordCompleted = this.passwordMissions.filter(m => m.completed).length;
        const malwareCompleted = this.malwareMissions.filter(m => m.completed).length;
        const networkCompleted = this.networkMissions.filter(m => m.completed).length;

        // Update progress displays
        const passwordProgress = document.getElementById('password-progress');
        const malwareProgress = document.getElementById('malware-progress');
        const networkProgress = document.getElementById('network-progress');

        if (passwordProgress) {
            passwordProgress.textContent = `${passwordCompleted}/${this.passwordMissions.length} Completed`;
        }
        if (malwareProgress) {
            malwareProgress.textContent = `${malwareCompleted}/${this.malwareMissions.length} Completed`;
        }
        if (networkProgress) {
            networkProgress.textContent = `${networkCompleted}/${this.networkMissions.length} Completed`;
        }
    }

    /**
     * Go back to the current category's level selection screen
     */
    backToCurrentCategoryLevels() {
        if (!this.currentSection) {
            console.warn('No current section to determine category');
            this.showMissionCategories();
            return;
        }

        this.showCategoryMissions(this.currentSection);
    }

    /**
     * Check if there's a next level available in the current section
     */
    hasNextLevelInCurrentSection() {
        if (!this.currentMission || !this.currentSection) {
            return false;
        }

        // Get missions for the current section
        let sectionMissions;
        switch (this.currentSection) {
            case 'password':
                sectionMissions = this.passwordMissions;
                break;
            case 'malware':
                sectionMissions = this.malwareMissions;
                break;
            case 'network':
                sectionMissions = this.networkMissions;
                break;
            default:
                return false;
        }

        // Check if there's a next level
        const currentLevel = this.currentMission.level;
        const nextMission = sectionMissions.find(m => m.level === currentLevel + 1);
        
        return nextMission && !nextMission.locked;
    }

    /**
     * Go to the next level in the current category
     */
    goToNextLevel() {
        if (!this.currentMission || !this.currentSection) {
            console.warn('No current mission or section to find next level');
            return;
        }

        // Get missions for the current section
        let sectionMissions;
        switch (this.currentSection) {
            case 'password':
                sectionMissions = this.passwordMissions;
                break;
            case 'malware':
                sectionMissions = this.malwareMissions;
                break;
            case 'network':
                sectionMissions = this.networkMissions;
                break;
            default:
                console.warn('Unknown section for next level:', this.currentSection);
                return;
        }

        // Find next level in the same section
        const currentLevel = this.currentMission.level;
        const nextMission = sectionMissions.find(m => m.level === currentLevel + 1);
        
        if (!nextMission) {
            // No more missions in this section - should not happen if button is properly disabled
            console.warn('No next mission available - Continue button should be disabled');
            this.ui.showNotification('🎉 Section completed! All levels finished!', 'success');
            return;
        }

        if (nextMission.locked) {
            // Should not happen if button is properly disabled
            console.warn('Next mission is locked - Continue button should be disabled');
            this.ui.showNotification('Complete current level to unlock the next one!', 'warning');
            return;
        }

        // Start the next mission directly
        console.log(`🎯 Going to next level: ${nextMission.title}`);
        this.startMission(nextMission);
    }

    /**
     * Update the Continue button state based on available next level
     */
    updateContinueButton() {
        const continueBtn = document.getElementById('next-level-btn');
        if (!continueBtn || !this.currentMission || !this.currentSection) return;

        // Get missions for the current section
        let sectionMissions;
        switch (this.currentSection) {
            case 'password':
                sectionMissions = this.passwordMissions;
                break;
            case 'malware':
                sectionMissions = this.malwareMissions;
                break;
            case 'network':
                sectionMissions = this.networkMissions;
                break;
            default:
                continueBtn.style.display = 'none';
                return;
        }

        // Find next level in the same section
        const currentLevel = this.currentMission.level;
        const nextMission = sectionMissions.find(m => m.level === currentLevel + 1);
        
        if (!nextMission) {
            // Last mission in section - hide the button completely
            continueBtn.style.display = 'none';
            console.log(`🏁 Last level in ${this.currentSection} section - Continue button hidden`);
        } else if (nextMission.locked) {
            // Next level is locked - show disabled button
            continueBtn.style.display = 'inline-block';
            continueBtn.disabled = true;
            continueBtn.textContent = 'COMPLETE TO UNLOCK';
        } else {
            // Next level is available - show active button
            continueBtn.style.display = 'inline-block';
            continueBtn.disabled = false;
            continueBtn.textContent = 'CONTINUE';
        }
    }

    /**
     * Start a specific mission
     */
    startMission(mission) {
        if (mission.locked) {
            this.ui.showNotification('Mission locked!', 'error');
            return;
        }

        console.log(`🎯 Starting mission: ${mission.title}`);
        
        this.currentMission = mission;
        this.score.reset();
        
        // Set current section based on mission type
        if (mission.type === 'password') {
            this.currentSection = 'password';
        } else if (mission.type === 'malware') {
            this.currentSection = 'malware';
        } else if (mission.type === 'network' || mission.type === 'phishing' || mission.type === 'firewall') {
            this.currentSection = 'network';
        }
        
        // Show game screen
        this.screens.showScreen('game-screen');
        this.gameScreen.loadMission(mission);
        
        // Update continue button state
        this.updateContinueButton();
    }

    /**
     * Complete current mission
     */
    completeMission(success, stats) {
        if (!this.currentMission) return;

        console.log(`Mission ${success ? 'completed' : 'failed'}!`);

        // Calculate final score
        const finalScore = this.score.calculateFinalScore(stats);

        // Update mission status
        if (success) {
            this.currentMission.completed = true;
            this.currentMission.bestScore = Math.max(
                this.currentMission.bestScore || 0,
                finalScore
            );

            // Unlock next level in the same section only
            const currentLevel = this.currentMission.level;
            const sectionUnlocked = unlockNextLevelInSection(this.currentSection, currentLevel);
            
            if (sectionUnlocked) {
                this.ui.showNotification(
                    `🔓 Next level unlocked in ${this.currentSection.toUpperCase()} section!`, 
                    'success', 
                    3000
                );
            }

            // Award user experience and credits if authenticated
            if (window.authManager && window.authManager.isUserAuthenticated()) {
                // Award XP based on mission difficulty and performance
                const baseXP = 100;
                const difficultyMultiplier = this.currentMission.difficulty === 'hard' ? 1.5 : 
                                           this.currentMission.difficulty === 'easy' ? 0.8 : 1.0;
                const performanceBonus = stats.hintsUsed === 0 ? 1.2 : 1.0;
                const xpAwarded = Math.floor(baseXP * difficultyMultiplier * performanceBonus);
                
                // Award credits based on score
                const creditsAwarded = Math.floor(finalScore * 0.1);
                
                // Update user stats
                window.updateUserStats({
                    totalScore: (window.authManager.getUserStats().totalScore || 0) + finalScore,
                    highScore: Math.max(window.authManager.getUserStats().highScore || 0, finalScore),
                    missionsCompleted: (window.authManager.getUserStats().missionsCompleted || 0) + 1,
                    totalPlayTime: (window.authManager.getUserStats().totalPlayTime || 0) + stats.timeElapsed,
                    lastPlayed: Date.now()
                });
                
                // Award XP and credits
                window.awardExperience(xpAwarded, `Mission: ${this.currentMission.title}`);
                window.awardCredits(creditsAwarded, 'Mission completion');
                
                // Check for achievements
                this.checkAchievements(stats, finalScore);
            }
        }

        // Save progress
        this.saveProgress();
        
        // Update category progress
        this.updateCategoryProgress();
        
        // Update continue button state
        this.updateContinueButton();

        // Show results
        this.gameScreen.showResults(success, stats, finalScore);
    }

    /**
     * Request a hint
     */
    requestHint() {
        if (this.gameScreen.activePuzzle) {
            this.gameScreen.activePuzzle.showHint();
        }
    }

    /**
     * Pause game
     */
    pauseGame() {
        if (this.gameScreen) {
            this.gameScreen.pause();
        }
    }

    /**
     * Handle ESC key
     */
    handleEscape() {
        const currentScreen = this.screens.getCurrentScreen();
        
        if (currentScreen === 'game-screen') {
            this.pauseGame();
        } else if (currentScreen !== 'main-menu') {
            this.goBack();
        }
    }

    /**
     * Go back to previous screen
     */
    goBack() {
        const currentScreen = this.screens.getCurrentScreen();
        
        if (currentScreen === 'mission-select') {
            this.screens.showScreen('main-menu');
        } else if (currentScreen === 'password-missions' || 
                   currentScreen === 'malware-missions' || 
                   currentScreen === 'network-missions') {
            this.showMissionCategories();
        } else if (currentScreen === 'game-screen') {
            // Use the new back to levels functionality
            this.backToCurrentCategoryLevels();
        }
    }

    /**
     * Handle tab hidden (auto-pause)
     */
    handleTabHidden() {
        if (this.screens.getCurrentScreen() === 'game-screen') {
            this.pauseGame();
        }
    }

    /**
     * Show settings
     */
    showSettings() {
        const settings = this.audio.getSettings();
        
        this.ui.showModal('Settings', `
            <div class="settings-panel">
                <h3>Audio Controls</h3>
                
                <div class="audio-control">
                    <label>
                        <input type="checkbox" id="music-toggle" ${settings.musicEnabled ? 'checked' : ''}>
                        Enable Music
                    </label>
                </div>
                
                <div class="audio-control">
                    <label for="music-volume">Music Volume:</label>
                    <div class="volume-control">
                        <input type="range" id="music-volume" min="0" max="100" 
                               value="${Math.round(settings.musicVolume * 100)}" 
                               ${!settings.musicEnabled ? 'disabled' : ''}>
                        <span id="music-volume-display">${Math.round(settings.musicVolume * 100)}%</span>
                    </div>
                </div>
                
                <div class="audio-control">
                    <label>
                        <input type="checkbox" id="sfx-toggle" ${settings.sfxEnabled ? 'checked' : ''}>
                        Enable Sound Effects
                    </label>
                </div>
                
                <div class="audio-control">
                    <label for="sfx-volume">SFX Volume:</label>
                    <div class="volume-control">
                        <input type="range" id="sfx-volume" min="0" max="100" 
                               value="${Math.round(settings.sfxVolume * 100)}"
                               ${!settings.sfxEnabled ? 'disabled' : ''}>
                        <span id="sfx-volume-display">${Math.round(settings.sfxVolume * 100)}%</span>
                    </div>
                </div>
                
                <div class="music-controls">
                    <button class="btn btn-small" id="music-pause-btn" 
                            ${!settings.musicEnabled || !this.audio.currentMusic ? 'disabled' : ''}>
                        ${this.audio.currentAudioElement && !this.audio.currentAudioElement.paused ? 'PAUSE' : 'RESUME'}
                    </button>
                    <button class="btn btn-small" id="music-stop-btn"
                            ${!settings.musicEnabled || !this.audio.currentMusic ? 'disabled' : ''}>
                        STOP
                    </button>
                </div>
                
                <div class="divider"></div>
                
                <h3>Gameplay</h3>
                <label>
                    Timer:
                    <select id="timer-setting">
                        <option value="on">Enabled</option>
                        <option value="off">Disabled</option>
                    </select>
                </label>
                
                <div class="divider"></div>
                
                <button class="btn btn-primary" onclick="game.ui.closeModal()">SAVE & CLOSE</button>
            </div>
        `);

        // Setup settings event listeners
        this.setupSettingsListeners();
    }

    /**
     * Setup settings event listeners
     */
    setupSettingsListeners() {
        const musicToggle = document.getElementById('music-toggle');
        const sfxToggle = document.getElementById('sfx-toggle');
        const musicVolume = document.getElementById('music-volume');
        const sfxVolume = document.getElementById('sfx-volume');
        const musicVolumeDisplay = document.getElementById('music-volume-display');
        const sfxVolumeDisplay = document.getElementById('sfx-volume-display');
        const musicPauseBtn = document.getElementById('music-pause-btn');
        const musicStopBtn = document.getElementById('music-stop-btn');

        // Music toggle
        if (musicToggle) {
            musicToggle.addEventListener('change', (e) => {
                this.audio.setMusicEnabled(e.target.checked);
                
                // Enable/disable volume slider
                if (musicVolume) {
                    musicVolume.disabled = !e.target.checked;
                }
                
                // Enable/disable music control buttons
                const hasMusic = this.audio.currentMusic;
                if (musicPauseBtn) musicPauseBtn.disabled = !e.target.checked || !hasMusic;
                if (musicStopBtn) musicStopBtn.disabled = !e.target.checked || !hasMusic;
            });
        }

        // SFX toggle
        if (sfxToggle) {
            sfxToggle.addEventListener('change', (e) => {
                this.audio.setSfxEnabled(e.target.checked);
                
                // Enable/disable volume slider
                if (sfxVolume) {
                    sfxVolume.disabled = !e.target.checked;
                }
            });
        }

        // Music volume slider
        if (musicVolume && musicVolumeDisplay) {
            musicVolume.addEventListener('input', (e) => {
                const volume = parseInt(e.target.value) / 100;
                this.audio.setMusicVolume(volume);
                musicVolumeDisplay.textContent = `${e.target.value}%`;
            });
        }

        // SFX volume slider
        if (sfxVolume && sfxVolumeDisplay) {
            sfxVolume.addEventListener('input', (e) => {
                const volume = parseInt(e.target.value) / 100;
                this.audio.setSfxVolume(volume);
                sfxVolumeDisplay.textContent = `${e.target.value}%`;
                
                // Play test sound
                this.audio.playButtonClick();
            });
        }

        // Music pause/resume button
        if (musicPauseBtn) {
            musicPauseBtn.addEventListener('click', () => {
                if (this.audio.currentAudioElement && !this.audio.currentAudioElement.paused) {
                    this.audio.pauseMusic();
                    musicPauseBtn.textContent = 'RESUME';
                } else {
                    this.audio.resumeMusic();
                    musicPauseBtn.textContent = 'PAUSE';
                }
            });
        }

        // Music stop button
        if (musicStopBtn) {
            musicStopBtn.addEventListener('click', () => {
                this.audio.stopMusic();
                if (musicPauseBtn) {
                    musicPauseBtn.textContent = 'PAUSE';
                    musicPauseBtn.disabled = true;
                }
                musicStopBtn.disabled = true;
            });
        }
    }

    /**
     * Show credits
     */
    showCredits() {
        this.ui.showModal('Credits', `
            <div style="text-align: center; padding: 20px;">
                <h2 style="color: var(--cyber-blue); margin-bottom: 20px;">SHADOWDEF</h2>
                <p style="color: var(--text-secondary); margin-bottom: 30px;">
                    A cybersecurity learning experience
                </p>
                <p style="margin-bottom: 10px;">Game Design & Development</p>
                <p style="color: var(--cyber-pink); margin-bottom: 30px;">Your Team</p>
                <p style="font-size: 0.9rem; color: var(--text-muted);">
                    Built with determination and lots of caffeine
                </p>
                <button class="btn" onclick="game.ui.closeModal()" style="margin-top: 30px;">CLOSE</button>
            </div>
        `);
    }

    /**
     * Save game progress
     */
    saveProgress() {
        const data = {
            passwordMissions: this.passwordMissions.map(m => ({
                id: m.id,
                level: m.level,
                completed: m.completed,
                locked: m.locked,
                bestScore: m.bestScore || 0
            })),
            malwareMissions: this.malwareMissions.map(m => ({
                id: m.id,
                level: m.level,
                completed: m.completed,
                locked: m.locked,
                bestScore: m.bestScore || 0
            })),
            networkMissions: this.networkMissions.map(m => ({
                id: m.id,
                level: m.level,
                completed: m.completed,
                locked: m.locked,
                bestScore: m.bestScore || 0
            })),
            timestamp: Date.now()
        };

        this.state.saveData('progress', data);
        console.log('💾 Progress saved for all sections');
    }

    /**
     * Check for achievements after mission completion
     */
    checkAchievements(stats, finalScore) {
        if (!window.authManager || !window.authManager.isUserAuthenticated()) return;
        
        const userStats = window.authManager.getUserStats();
        const achievements = userStats.achievements || [];
        const newAchievements = [];

        // First mission achievement
        if (!achievements.includes('first_mission') && userStats.missionsCompleted >= 1) {
            newAchievements.push('first_mission');
            window.awardCredits(100, 'First Steps achievement');
        }

        // Speed demon achievement (complete mission in under 2 minutes)
        if (!achievements.includes('speed_demon') && stats.timeElapsed < 120) {
            newAchievements.push('speed_demon');
            window.awardCredits(250, 'Speed Demon achievement');
        }

        // Perfectionist achievement (no hints used)
        if (!achievements.includes('perfectionist') && stats.hintsUsed === 0) {
            newAchievements.push('perfectionist');
            window.awardCredits(200, 'Perfectionist achievement');
        }

        // High scorer achievement
        if (!achievements.includes('high_scorer') && finalScore >= 10000) {
            newAchievements.push('high_scorer');
            window.awardCredits(500, 'High Scorer achievement');
        }

        // Dedicated player achievement (5 hours total play time)
        if (!achievements.includes('dedicated') && userStats.totalPlayTime >= 300) {
            newAchievements.push('dedicated');
            window.awardCredits(300, 'Dedicated Player achievement');
        }

        // Credit collector achievement
        if (!achievements.includes('collector') && userStats.credits >= 5000) {
            newAchievements.push('collector');
            window.awardCredits(1000, 'Credit Collector achievement');
        }

        // Update achievements if any new ones were earned
        if (newAchievements.length > 0) {
            window.authManager.updateGameStats({
                achievements: [...achievements, ...newAchievements]
            });

            // Show achievement notifications
            newAchievements.forEach(achievement => {
                const achievementNames = {
                    'first_mission': 'First Steps',
                    'speed_demon': 'Speed Demon',
                    'perfectionist': 'Perfectionist',
                    'high_scorer': 'High Scorer',
                    'dedicated': 'Dedicated Player',
                    'collector': 'Credit Collector'
                };
                
                this.ui.showNotification(
                    `🏆 Achievement Unlocked: ${achievementNames[achievement]}!`, 
                    'success', 
                    5000
                );
            });
        }
    }

    /**
     * Load game progress
     */
    loadProgress() {
        // Load from authenticated user first, then fallback to local storage
        if (window.authManager && window.authManager.isUserAuthenticated()) {
            const userStats = window.authManager.getUserStats();
            
            // Apply user preferences to game
            const userPrefs = window.authManager.getUserPreferences();
            if (userPrefs.musicEnabled !== undefined) {
                this.audio.setMusicEnabled(userPrefs.musicEnabled);
            }
            if (userPrefs.sfxEnabled !== undefined) {
                this.audio.setSfxEnabled(userPrefs.sfxEnabled);
            }
            
            console.log('📂 User progress loaded from cloud');
            this.updateCategoryProgress();
            return;
        }
        
        // Fallback to local storage for guest users
        const data = this.state.loadData('progress');
        
        if (data) {
            // Load section-based progress if available
            if (data.passwordMissions) {
                data.passwordMissions.forEach(saved => {
                    const mission = this.passwordMissions.find(m => m.id === saved.id);
                    if (mission) {
                        mission.completed = saved.completed;
                        mission.locked = saved.locked;
                        mission.bestScore = saved.bestScore || 0;
                    }
                });
            }
            
            if (data.malwareMissions) {
                data.malwareMissions.forEach(saved => {
                    const mission = this.malwareMissions.find(m => m.id === saved.id);
                    if (mission) {
                        mission.completed = saved.completed;
                        mission.locked = saved.locked;
                        mission.bestScore = saved.bestScore || 0;
                    }
                });
            }
            
            if (data.networkMissions) {
                data.networkMissions.forEach(saved => {
                    const mission = this.networkMissions.find(m => m.id === saved.id);
                    if (mission) {
                        mission.completed = saved.completed;
                        mission.locked = saved.locked;
                        mission.bestScore = saved.bestScore || 0;
                    }
                });
            }
            
            // Legacy support for old progress format
            if (data.missions && !data.passwordMissions) {
                data.missions.forEach(saved => {
                    const mission = this.missions.find(m => m.id === saved.id);
                    if (mission) {
                        mission.completed = saved.completed;
                        mission.locked = saved.locked;
                        mission.bestScore = saved.bestScore || 0;
                    }
                });
            }

            console.log('📂 Local progress loaded');
        } else {
            console.log('📭 No saved progress found - starting fresh');
        }
        
        this.updateCategoryProgress();
    }

    /**
     * Show mission select screen (legacy method for compatibility)
     */
    showMissionSelect() {
        this.showMissionCategories();
    }
}