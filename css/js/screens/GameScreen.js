/**
 * GameScreen - Manages active gameplay screen
 * IMPROVED v2 — knowledgeSummary overlay shown before results modal
 */

import { CONFIG } from '../data/config.js';
import { Timer } from '../systems/Timer.js';
import { AIOpponent } from '../systems/AIOpponent.js';
import { PasswordCrack } from '../puzzles/PasswordCrack.js';
import { FirewallBypass } from '../puzzles/FirewallBypass.js';
import { NetworkNav } from '../puzzles/NetworkNav.js';
import { MalwareDetect } from '../puzzles/MalwareDetect.js';
import { PhishingID } from '../puzzles/PhishingID.js';

export class GameScreen {
    constructor(game) {
        this.game = game;
        this.ui = game.ui;
        this.audio = game.audio;
        this.currentMission = null;
        this.activePuzzle = null;
        this.timer = null;
        this.aiOpponent = null;
        this.isPaused = false;
        this.isComplete = false;
    }

    // ─── mission load ─────────────────────────────────────────────────────────

    loadMission(mission) {
        this.currentMission = mission;
        this.isComplete = false;
        this.isPaused = false;
        this.applyMissionTheme();
        this.resetUI();
        this.loadObjectives();
        this.startTimer();
        this.startAIOpponent();
        this.loadPuzzle();
        this.updateHintsDisplay();
    }

    resetUI() {
        document.getElementById('timer').textContent = '00:00';
        document.getElementById('score').textContent = '0';
        document.getElementById('attempts').textContent = '0';
        document.getElementById('ai-progress').style.width = '0%';
        document.getElementById('ai-progress-text').textContent = '0%';
    }

    loadObjectives() {
        const objectivesList = document.getElementById('objectives');
        if (!objectivesList) return;
        objectivesList.innerHTML = '';
        (this.currentMission.objectives || []).forEach((objective, index) => {
            const li = document.createElement('li');
            li.className = 'objective';
            li.id = `objective-${index}`;
            li.textContent = objective;
            objectivesList.appendChild(li);
        });
    }

    completeObjective(index) {
        const objective = document.getElementById(`objective-${index}`);
        if (objective) objective.classList.add('completed');
    }

    startTimer() {
        const targetTime = this.currentMission.puzzle?.timeLimit || CONFIG.TIMING.DEFAULT_MISSION_TIME;
        this.timer = new Timer(targetTime, {
            onTick: (time) => this.updateTimerDisplay(time),
            onWarning: () => { this.ui.showNotification('Time running low!', 'warning'); this.audio.playTimerWarning(); },
            onExpire: () => this.onTimeExpired()
        });
        this.timer.start();
    }

    updateTimerDisplay(seconds) {
        const timerElement = document.getElementById('timer');
        if (timerElement) {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            timerElement.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            timerElement.style.color = seconds <= CONFIG.TIMING.WARNING_TIME ? 'var(--cyber-pink)' : 'var(--cyber-blue)';
        }
    }

    onTimeExpired() {
        if (this.isComplete) return;
        this.ui.showNotification('Time expired!', 'error');
        this.completePuzzle(false);
    }

    startAIOpponent() {
        const targetTime = this.currentMission.puzzle?.timeLimit || CONFIG.TIMING.DEFAULT_MISSION_TIME;
        const aiSpeed = this.currentMission.aiSpeed || 1.0;
        this.aiOpponent = new AIOpponent(targetTime, aiSpeed, {
            onProgress: (progress) => this.updateAIProgress(progress),
            onWin: () => this.onAIWin()
        });
        this.aiOpponent.start();
        const aiName = document.getElementById('ai-name');
        if (aiName) {
            const names = ['CYBER-THREAT', 'BLACK-HAT', 'DARK-ZERO', 'PHANTOM-X'];
            aiName.textContent = names[Math.floor(Math.random() * names.length)];
        }
    }

    updateAIProgress(progress) {
        const progressBar = document.getElementById('ai-progress');
        const progressText = document.getElementById('ai-progress-text');
        if (progressBar) progressBar.style.width = `${progress}%`;
        if (progressText) progressText.textContent = `${Math.floor(progress)}%`;
    }

    onAIWin() {
        if (this.isComplete) return;
        this.ui.showNotification('AI opponent completed first!', 'error');
        this.completePuzzle(false);
    }

    loadPuzzle() {
        const puzzleArea = document.getElementById('puzzle-area');
        if (!puzzleArea) { console.error('Puzzle area not found'); return; }
        if (this.activePuzzle && this.activePuzzle.destroy) this.activePuzzle.destroy();

        switch (this.currentMission.type) {
            case 'password': this.activePuzzle = new PasswordCrack(this.currentMission.puzzle, this, this.currentMission); break;
            case 'firewall': this.activePuzzle = new FirewallBypass(this.currentMission.puzzle, this); break;
            case 'network':  this.activePuzzle = new NetworkNav(this.currentMission.puzzle, this); break;
            case 'malware':  this.activePuzzle = new MalwareDetect(this.currentMission.puzzle, this); break;
            case 'phishing': this.activePuzzle = new PhishingID(this.currentMission.puzzle, this); break;
            default: console.error(`Unknown puzzle type: ${this.currentMission.type}`); return;
        }
        this.activePuzzle.render(puzzleArea);
    }

    applyMissionTheme() {
        const gameScreen = document.getElementById('game-screen');
        if (!gameScreen) return;
        gameScreen.classList.remove('game-screen--human-lab');
        gameScreen.classList.remove('game-screen--single-choice-lab');
        gameScreen.classList.remove('game-screen--prediction-lab');
        gameScreen.classList.remove('game-screen--investigation-lab');
        gameScreen.classList.remove('game-screen--inspection-lab');
        gameScreen.classList.remove('game-screen--salt-lab');
        gameScreen.classList.remove('game-screen--live-defense-lab');
        gameScreen.classList.remove('game-screen--threat-hunt-lab');
        gameScreen.classList.remove('game-screen--patch-lab');
        gameScreen.classList.remove('game-screen--enterprise-finale');
        if (this.currentMission?.puzzle?.interactionMode === 'humanPsychologyLab') {
            gameScreen.classList.add('game-screen--human-lab');
        }
        if (this.currentMission?.puzzle?.interactionMode === 'singleChoice') {
            gameScreen.classList.add('game-screen--single-choice-lab');
        }
        if (this.currentMission?.puzzle?.interactionMode === 'predictionChoice') {
            gameScreen.classList.add('game-screen--prediction-lab');
        }
        if (this.currentMission?.puzzle?.interactionMode === 'investigation') {
            gameScreen.classList.add('game-screen--investigation-lab');
        }
        if (this.currentMission?.puzzle?.interactionMode === 'inspection') {
            gameScreen.classList.add('game-screen--inspection-lab');
        }
        if (this.currentMission?.puzzle?.interactionMode === 'saltReuseLab') {
            gameScreen.classList.add('game-screen--salt-lab');
        }
        if (this.currentMission?.puzzle?.interactionMode === 'liveDefenseSimulation') {
            gameScreen.classList.add('game-screen--live-defense-lab');
        }
        if (this.currentMission?.puzzle?.interactionMode === 'threatHuntSimulation') {
            gameScreen.classList.add('game-screen--threat-hunt-lab');
        }
        if (this.currentMission?.puzzle?.interactionMode === 'livePatchSimulation') {
            gameScreen.classList.add('game-screen--patch-lab');
        }
        if (this.currentMission?.puzzle?.interactionMode === 'enterpriseArchitectureSimulation') {
            gameScreen.classList.add('game-screen--enterprise-finale');
        }
    }

    // ─── stats update ─────────────────────────────────────────────────────────

    updateAttempts(attempts) {
        const attemptsElement = document.getElementById('attempts');
        if (attemptsElement) attemptsElement.textContent = attempts;
        this.game.score.recordAttempt();
        this.updateScore();
    }

    updateScore() {
        const scoreElement = document.getElementById('score');
        if (scoreElement) scoreElement.textContent = this.game.score.getScore();
    }

    updateHintsDisplay() {
        const hintsElement = document.getElementById('hints-remaining');
        const maxHints = CONFIG.HINTS.MAX_HINTS_PER_MISSION;
        const used = this.game.score.hintsUsed;
        if (hintsElement) hintsElement.textContent = maxHints - used;
    }

    // ─── puzzle completion ────────────────────────────────────────────────────

    completePuzzle(success) {
        if (this.isComplete) return;
        this.isComplete = true;
        if (this.timer) this.timer.stop();
        if (this.aiOpponent) this.aiOpponent.stop();

        const stats = {
            success,
            time: this.timer ? this.timer.getElapsed() : 0,
            attempts: this.game.score.attempts,
            hintsUsed: this.game.score.hintsUsed,
            targetTime: this.currentMission.puzzle?.timeLimit || CONFIG.TIMING.DEFAULT_MISSION_TIME
        };
        const finalScore = this.game.score.calculateFinalScore(stats);
        this.game.completeMission(success, { ...stats, finalScore });
    }

    // ─── results display with knowledge summary overlay ───────────────────────

    showResults(success, stats, finalScore) {
        // FIX: show knowledge summary overlay BEFORE the results modal if it exists
        const knowledgeSummary = this.currentMission?.knowledgeSummary;
        if (knowledgeSummary && success) {
            this.showKnowledgeSummary(knowledgeSummary, () => {
                this.showResultsModal(success, stats, finalScore);
            });
        } else {
            this.showResultsModal(success, stats, finalScore);
        }
    }

    // NEW: knowledge summary overlay
    showKnowledgeSummary(summary, onContinue) {
        const bulletsHtml = (summary.bullets || []).map(b => `
            <div style="display:flex;gap:10px;align-items:flex-start;margin-bottom:12px;">
                <span style="color:var(--cyber-blue);flex-shrink:0;margin-top:2px;">→</span>
                <span style="color:var(--text-secondary);line-height:1.5;">${b}</span>
            </div>`).join('');

        this.ui.showModal(
            summary.title || 'What you learned',
            `
            <div style="text-align:left;">
                <div style="margin-bottom:20px;">
                    ${bulletsHtml}
                </div>
                ${summary.insight ? `
                <div style="background:rgba(0,243,255,0.07);border:1px solid rgba(0,243,255,0.3);border-radius:4px;padding:14px 16px;margin-top:16px;">
                    <div style="color:var(--cyber-blue);font-size:0.8rem;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Key Insight</div>
                    <div style="color:var(--text-primary);line-height:1.6;">${summary.insight}</div>
                </div>` : ''}
            </div>`,
            {
                closable: false,
                buttons: [
                    {
                        text: 'VIEW RESULTS →',
                        class: 'btn-primary',
                        onClick: () => {
                            this.ui.closeModal();
                            setTimeout(() => onContinue(), 300);
                        }
                    }
                ]
            }
        );
    }

    showResultsModal(success, stats, finalScore) {
        const rank = this.game.score.getScoreRank(finalScore);
        const xp = this.game.score.calculateXP(finalScore, this.currentMission);
        const credits = this.game.score.calculateCredits(finalScore, this.currentMission);

        const failedPasswordReveal = !success &&
            this.currentMission?.type === 'password' &&
            this.currentMission?.puzzle?.revealAnswerOnFail !== false &&
            this.activePuzzle?.password
            ? `<div class="divider"></div>
               <div class="modal-stat">
                   <span>Correct Answer:</span>
                   <span style="color:var(--cyber-orange);font-family:var(--font-mono);letter-spacing:1px;">${this.activePuzzle.password}</span>
               </div>`
            : '';

        const modal = this.ui.showModal(
            success ? 'MISSION COMPLETE' : 'MISSION FAILED',
            `<div class="modal-stats">
                <div class="modal-stat"><span>Time:</span><span>${this.formatTime(stats.time)}</span></div>
                <div class="modal-stat"><span>Attempts:</span><span>${stats.attempts}</span></div>
                <div class="modal-stat"><span>Hints Used:</span><span>${stats.hintsUsed}</span></div>
                <div class="modal-stat"><span>Accuracy:</span><span>${this.game.score.getAccuracyPercent()}%</span></div>
                <div class="divider"></div>
                <div class="modal-stat"><span>Final Score:</span><span style="color:${rank.color}">${finalScore}</span></div>
                <div class="modal-stat"><span>Rank:</span><span style="color:${rank.color}">${rank.rank} — ${rank.name}</span></div>
                ${failedPasswordReveal}
                ${success ? `
                <div class="divider"></div>
                <div class="modal-stat"><span>XP Earned:</span><span style="color:var(--cyber-green)">+${xp}</span></div>
                <div class="modal-stat"><span>Credits Earned:</span><span style="color:var(--cyber-green)">+${credits} ${CONFIG.CURRENCY.SYMBOL}</span></div>` : ''}
            </div>`,
            {
                type: success ? 'success' : 'error',
                closable: false,
                buttons: [
                    {
                        text: success ? 'CONTINUE' : 'RETRY',
                        class: 'btn-primary',
                        onClick: () => {
                            if (success) {
                                if (this.game.hasNextLevelInCurrentSection()) this.game.goToNextLevel();
                                else this.game.backToCurrentCategoryLevels();
                            } else {
                                this.game.startMission(this.currentMission);
                            }
                        }
                    },
                    {
                        text: 'BACK TO LEVELS',
                        class: 'btn',
                        onClick: () => { this.game.backToCurrentCategoryLevels(); }
                    }
                ]
            }
        );

        if (modal) {
            const modalContent = modal.querySelector('.modal-content');
            if (modalContent) modalContent.style.borderColor = success ? 'var(--cyber-green)' : 'var(--cyber-pink)';
        }
    }

    // ─── pause / resume ───────────────────────────────────────────────────────

    pause() {
        if (this.isPaused || this.isComplete) return;
        this.isPaused = true;
        if (this.timer) this.timer.pause();
        if (this.aiOpponent) this.aiOpponent.pause();
        this.ui.showModal('GAME PAUSED', '<p style="text-align:center;color:var(--text-secondary);">Game is paused</p>', {
            buttons: [
                { text: 'RESUME', class: 'btn-primary', onClick: () => this.resume() },
                { text: 'QUIT MISSION', class: 'btn', onClick: () => this.game.backToCurrentCategoryLevels() }
            ]
        });
    }

    resume() {
        if (!this.isPaused) return;
        this.isPaused = false;
        if (this.timer) this.timer.resume();
        if (this.aiOpponent) this.aiOpponent.resume();
        this.ui.closeModal();
    }

    // ─── utility ──────────────────────────────────────────────────────────────

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    destroy() {
        if (this.timer) this.timer.stop();
        if (this.aiOpponent) this.aiOpponent.stop();
        if (this.activePuzzle && this.activePuzzle.destroy) this.activePuzzle.destroy();
        const gameScreen = document.getElementById('game-screen');
        if (gameScreen) {
            gameScreen.classList.remove('game-screen--human-lab');
            gameScreen.classList.remove('game-screen--single-choice-lab');
            gameScreen.classList.remove('game-screen--prediction-lab');
            gameScreen.classList.remove('game-screen--investigation-lab');
            gameScreen.classList.remove('game-screen--inspection-lab');
            gameScreen.classList.remove('game-screen--salt-lab');
            gameScreen.classList.remove('game-screen--live-defense-lab');
            gameScreen.classList.remove('game-screen--threat-hunt-lab');
            gameScreen.classList.remove('game-screen--patch-lab');
            gameScreen.classList.remove('game-screen--enterprise-finale');
        }
    }
}
