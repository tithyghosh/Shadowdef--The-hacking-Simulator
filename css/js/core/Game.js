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
        this.ui.showModal('Settings', `
            <div class="settings-panel">
                <h3>Audio</h3>
                <label>
                    <input type="checkbox" id="music-toggle" ${this.audio.musicEnabled ? 'checked' : ''}>
                    Enable Music
                </label>
                <label>
                    <input type="checkbox" id="sfx-toggle" ${this.audio.sfxEnabled ? 'checked' : ''}>
                    Enable Sound Effects
                </label>
                
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

        if (musicToggle) {
            musicToggle.addEventListener('change', (e) => {
                this.audio.setMusicEnabled(e.target.checked);
            });
        }

        if (sfxToggle) {
            sfxToggle.addEventListener('change', (e) => {
                this.audio.setSfxEnabled(e.target.checked);
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
     * Load game progress
     */
    loadProgress() {
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

            console.log('📂 Progress loaded');
        } else {
            console.log('📭 No saved progress found');
        }
    }
}