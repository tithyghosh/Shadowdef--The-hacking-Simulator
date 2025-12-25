/**
 * Game Controller - Manages game state and flow
 */

import { StateManager } from './StateManager.js';
import { ScoreManager } from './ScoreManager.js';
import { ScreenManager } from '../screens/ScreenManager.js';
import { MissionSelect } from '../screens/MissionSelect.js';
import { GameScreen } from '../screens/GameScreen.js';
import { missions } from '../data/missions.js';

export class Game {
    constructor(uiManager, audioManager) {
        this.ui = uiManager;
        this.audio = audioManager;
        this.state = new StateManager();
        this.score = new ScoreManager();
        this.screens = new ScreenManager();
        
        this.currentMission = null;
        this.activePuzzle = null;
        
        // Initialize mission data
        this.missions = missions;
        
        // Screen instances
        this.missionSelectScreen = new MissionSelect(this);
        this.gameScreen = new GameScreen(this);
    }

    /**
     * Start a new game
     */
    startNewGame() {
        console.log('🎮 Starting new game...');
        
        // Reset progress
        this.state.resetProgress();
        
        // Unlock first mission
        this.missions[0].locked = false;
        
        // Start first mission
        this.startMission(this.missions[0]);
    }

    /**
     * Show mission select screen
     */
    showMissionSelect() {
        this.screens.showScreen('mission-select');
        this.missionSelectScreen.render(this.missions);
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
        
        // Show game screen
        this.screens.showScreen('game-screen');
        this.gameScreen.loadMission(mission);
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

            // Unlock next mission
            const nextMission = this.missions[this.currentMission.id];
            if (nextMission) {
                nextMission.locked = false;
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
        } else if (currentScreen === 'game-screen') {
            this.showMissionSelect();
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
            missions: this.missions.map(m => ({
                id: m.id,
                completed: m.completed,
                locked: m.locked,
                bestScore: m.bestScore || 0
            })),
            timestamp: Date.now()
        };

        this.state.saveData('progress', data);
        console.log('💾 Progress saved');
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
            return;
        }
        
        // Fallback to local storage for guest users
        const data = this.state.loadData('progress');
        
        if (data && data.missions) {
            // Restore mission states
            data.missions.forEach(saved => {
                const mission = this.missions.find(m => m.id === saved.id);
                if (mission) {
                    mission.completed = saved.completed;
                    mission.locked = saved.locked;
                    mission.bestScore = saved.bestScore || 0;
                }
            });

            console.log('📂 Local progress loaded');
        } else {
            console.log('📭 No saved progress found');
        }
    }
}