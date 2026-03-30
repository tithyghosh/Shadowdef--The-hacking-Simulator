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
import { ZeroDayCountdown } from '../puzzles/ZeroDayCountdown.js';

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
        this.syncEmbeddedMissionHUD();
    }

    isTimerEnabled() {
        const settings = this.game?.state?.loadSettings?.() || {};
        return settings.timerEnabled !== false;
    }

    resetUI() {
        const timerEnabled = this.isTimerEnabled();
        document.getElementById('timer').textContent = timerEnabled ? '00:00' : '--:--';
        document.getElementById('score').textContent = '0';
        document.getElementById('attempts').textContent = '0';
        document.getElementById('ai-name').textContent = 'CYBER-THREAT';
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

    hasNoTimerPressure() {
        return !!this.currentMission?.puzzle?.noTimerPressure;
    }

    hasDisabledAIOpponent() {
        return !!this.currentMission?.puzzle?.disableAIOpponent || this.hasNoTimerPressure();
    }

    getMissionTargetTime() {
        if (this.hasNoTimerPressure()) return 0;
        const configuredTime = Number(this.currentMission?.puzzle?.timeLimit);
        return configuredTime > 0 ? configuredTime : CONFIG.TIMING.DEFAULT_MISSION_TIME;
    }

    setTimerDisplay(label, { isWarning = false } = {}) {
        const isFreeMode = label === 'FREE';
        const color = isFreeMode
            ? 'var(--cyber-green)'
            : isWarning
                ? 'var(--cyber-pink)'
                : 'var(--cyber-blue)';
        const timerElement = document.getElementById('timer');
        if (timerElement) {
            timerElement.textContent = label;
            timerElement.style.color = color;
        }

        const embeddedTimer = document.getElementById('l1-timer');
        if (embeddedTimer) {
            embeddedTimer.textContent = label;  
            embeddedTimer.classList.toggle('danger', isWarning && !isFreeMode);
        }
    }

    setAIDisplay({ name = null, progressText = '0%', progressWidth = 0 } = {}) {
        const aiName = document.getElementById('ai-name');
        if (aiName && name !== null) aiName.textContent = name;

        const progressBar = document.getElementById('ai-progress');
        if (progressBar) progressBar.style.width = `${Math.max(0, Math.min(100, progressWidth))}%`;

        const progressTextEl = document.getElementById('ai-progress-text');
        if (progressTextEl) progressTextEl.textContent = progressText;

        const embeddedAi = document.getElementById('l1-ai-progress');
        if (embeddedAi) embeddedAi.textContent = progressText;
    }

    startTimer() {
        if (this.timer) {
            this.timer.stop();
            this.timer = null;
        }

        const targetTime = this.getMissionTargetTime();
        if (targetTime <= 0) {
            this.setTimerDisplay('FREE');
            return;
        }

        this.timer = new Timer(targetTime, {
            onTick: (time) => this.updateTimerDisplay(time),
            onWarning: () => { this.ui.showNotification('Time running low!', 'warning'); this.audio.playTimerWarning(); },
            onExpire: () => this.onTimeExpired()
        });
        this.timer.start();
    }

    updateTimerDisplay(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        const formatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        this.setTimerDisplay(formatted, { isWarning: seconds <= CONFIG.TIMING.WARNING_TIME });
    }

    onTimeExpired() {
        if (this.isComplete) return;
        if (this.activePuzzle?.handleTimeExpired?.()) return;
        this.ui.showNotification('Time expired!', 'error');
        this.completePuzzle(false);
    }

    startAIOpponent() {
        if (this.hasDisabledAIOpponent()) {
            this.aiOpponent = null;
            this.setAIDisplay({ name: 'TRAINING MODE', progressText: 'LAB', progressWidth: 0 });
            return;
        }

        const targetTime = this.getMissionTargetTime();
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
        const normalized = Math.max(0, Math.min(100, progress));
        this.setAIDisplay({
            progressText: `${Math.floor(normalized)}%`,
            progressWidth: normalized
        });
    }

    onAIWin() {
        if (this.isComplete) return;
        if (this.activePuzzle?.handleAIWin?.()) return;
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
            case 'zeroday':
            case 'malware':
            case 'phishing':
                this.activePuzzle = new ZeroDayCountdown(this.currentMission.puzzle, this, this.currentMission);
                break;
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
        gameScreen.classList.remove('game-screen--zero-day-lab');
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
        if (this.currentMission?.puzzle?.interactionMode === 'zeroDayCountdownLab') {
            gameScreen.classList.add('game-screen--zero-day-lab');
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
        const score = this.game.score.getScore();
        const scoreElement = document.getElementById('score');
        if (scoreElement) scoreElement.textContent = score;

        const embeddedScore = document.getElementById('l1-score');
        if (embeddedScore) embeddedScore.textContent = String(score).padStart(3, '0');
    }

    updateHintsDisplay() {
        const hintsElement = document.getElementById('hints-remaining');
        const maxHints = CONFIG.HINTS.MAX_HINTS_PER_MISSION;
        const used = this.game.score.hintsUsed;
        if (hintsElement) hintsElement.textContent = maxHints - used;

        const embeddedHints = document.getElementById('l1-hints-remaining');
        if (embeddedHints) embeddedHints.textContent = maxHints - used;
    }

    syncEmbeddedMissionHUD() {
        const handledByPuzzle = !!this.activePuzzle?.syncEmbeddedMissionHUD?.();

        if (!handledByPuzzle) {
            if (this.timer) {
                this.updateTimerDisplay(this.timer.getRemaining());
            } else if (this.hasNoTimerPressure()) {
                this.setTimerDisplay('FREE');
            }

            if (this.aiOpponent) {
                this.updateAIProgress(this.aiOpponent.getProgress());
            } else if (this.hasDisabledAIOpponent()) {
                this.setAIDisplay({ name: 'TRAINING MODE', progressText: 'LAB', progressWidth: 0 });
            }
        }

        this.updateScore();
        this.updateHintsDisplay();
    }

    // ─── puzzle completion ────────────────────────────────────────────────────

    completePuzzle(success) {
        if (this.isComplete) return;
        this.isComplete = true;
        if (this.timer) this.timer.stop();
        if (this.aiOpponent) this.aiOpponent.stop();

        const stats = {
            success,
            time: this.timer ? this.timer.getElapsed() : this.game.score.getTimeElapsed(),
            attempts: this.game.score.attempts,
            hintsUsed: this.game.score.hintsUsed,
            targetTime: this.getMissionTargetTime()
        };
        const finalScore = this.game.score.calculateFinalScore(stats);
        this.game.completeMission(success, { ...stats, finalScore });
    }

    showResults(success, stats, finalScore) {
        this.showResultsModal(success, stats, finalScore);
    }

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
        if (success) {
            this.showMissionCompleteModal(stats);
            return;
        }

        const rank = this.game.score.getScoreRank(finalScore);
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

    showMissionCompleteModal(stats) {
        const modal = this.ui.showModal(
            'MISSION COMPLETE',
            `
            <div class="mission-complete-shell">
                <div class="blob blob-green"></div>
                <div class="blob blob-cyan"></div>
                <div class="blob blob-pink"></div>

                <div class="particles" data-complete-particles></div>

                <div class="corner tl"></div>
                <div class="corner tr"></div>
                <div class="corner bl"></div>
                <div class="corner br"></div>

                <div class="card">
                    <div class="header">
                        <div class="mission-tag">STATUS REPORT</div>
                        <div class="title" data-text="MISSION COMPLETE">MISSION COMPLETE</div>
                    </div>

                    <div class="stats">
                        <div class="stat-row">
                            <div class="stat-label">
                                <div class="stat-icon">&#9201;</div>
                                Time
                            </div>
                            <div class="stat-value val-cyan">${this.formatTime(stats.time)}</div>
                        </div>
                        <div class="stat-row">
                            <div class="stat-label">
                                <div class="stat-icon">&#10227;</div>
                                Attempts
                            </div>
                            <div class="stat-value val-green">${stats.attempts}</div>
                        </div>
                        <div class="stat-row">
                            <div class="stat-label">
                                <div class="stat-icon">?</div>
                                Hints Used
                            </div>
                            <div class="stat-value val-yellow">${stats.hintsUsed}</div>
                        </div>
                    </div>

                    <div class="divider"></div>

                    <div class="buttons">
                        <button class="btn btn-back" type="button" data-complete-action="back">
                            <span class="btn-icon">&#9664;</span>
                            BACK TO LEVELS
                        </button>
                        <button class="btn btn-continue" type="button" data-complete-action="continue">
                            CONTINUE
                            <span class="btn-icon">&#9654;</span>
                        </button>
                    </div>
                </div>
            </div>`,
            {
                closable: false,
                width: 'min(720px, 96vw)',
                modalClass: 'mission-complete-modal',
                contentClass: 'mission-complete-modal__content'
            }
        );

        this.populateMissionCompleteParticles(modal?.querySelector('[data-complete-particles]'));

        modal?.querySelector('[data-complete-action="back"]')?.addEventListener('click', (event) => {
            this.handleMissionCompleteAction(event.currentTarget, () => this.game.backToCurrentCategoryLevels());
        });

        modal?.querySelector('[data-complete-action="continue"]')?.addEventListener('click', (event) => {
            this.handleMissionCompleteAction(event.currentTarget, () => {
                if (this.game.hasNextLevelInCurrentSection()) this.game.goToNextLevel();
                else this.game.backToCurrentCategoryLevels();
            });
        });
    }

    handleMissionCompleteAction(button, callback) {
        if (!(button instanceof HTMLElement)) {
            callback();
            return;
        }

        button.style.transform = 'scale(0.96)';
        window.setTimeout(() => {
            button.style.transform = '';
            callback();
        }, 150);
    }

    populateMissionCompleteParticles(container) {
        if (!container) return;

        const colors = ['#00ff88', '#00e5ff', '#ff2d6b', '#ffe600'];
        container.innerHTML = '';

        for (let i = 0; i < 28; i += 1) {
            const particle = document.createElement('div');
            const color = colors[i % colors.length];
            particle.className = 'particle';
            particle.style.cssText = `
                left:${Math.random() * 100}%;
                background:${color};
                box-shadow:0 0 6px ${color};
                --drift:${(Math.random() - 0.5) * 80}px;
                animation-duration:${9 + (Math.random() * 14)}s;
                animation-delay:${Math.random() * 12}s;
            `;
            container.appendChild(particle);
        }
    }

    // ─── pause / resume ───────────────────────────────────────────────────────

    pause() {
        if (this.isPaused || this.isComplete) return;
        this.isPaused = true;
        if (this.timer) this.timer.pause();
        if (this.aiOpponent) this.aiOpponent.pause();
        const levelLabel = `L${this.currentMission?.level ?? '-'}`;
        const timeLabel = this.timer ? this.formatTime(this.timer.getRemaining()) : '--:--';
        const scoreLabel = this.game.score.getScore();
        this.ui.showModal('GAME <span>PAUSED</span>', `
            <div class="pause-game-shell">
                <div class="pause-game-shell__eyebrow"><span class="pause-game-shell__dot"></span>MISSION SUSPENDED</div>
                <div class="pause-game-shell__divider">
                    <span class="pause-game-shell__line"></span>
                    <span class="pause-game-shell__node"></span>
                    <span class="pause-game-shell__line"></span>
                </div>
                <div class="pause-game-shell__stats">
                    <div class="pause-game-shell__stat">
                        <div class="pause-game-shell__value pause-game-shell__value--green">${levelLabel}</div>
                        <div class="pause-game-shell__label">LEVEL</div>
                    </div>
                    <div class="pause-game-shell__vdiv"></div>
                    <div class="pause-game-shell__stat">
                        <div class="pause-game-shell__value pause-game-shell__value--cyan">${timeLabel}</div>
                        <div class="pause-game-shell__label">TIME</div>
                    </div>
                    <div class="pause-game-shell__vdiv"></div>
                    <div class="pause-game-shell__stat">
                        <div class="pause-game-shell__value pause-game-shell__value--gold">${scoreLabel}</div>
                        <div class="pause-game-shell__label">SCORE</div>
                    </div>
                </div>
            </div>
        `, {
            width: 'min(640px, 92vw)',
            modalClass: 'pause-game-modal',
            contentClass: 'pause-game-modal__content',
            buttons: [
                { text: '▶ RESUME', class: 'btn pause-game-modal__btn pause-game-modal__btn--primary', onClick: () => this.resume() },
                { text: '↺ RESTART', class: 'btn pause-game-modal__btn pause-game-modal__btn--muted', onClick: () => this.game.startMission(this.currentMission) },
                { text: '⊘ QUIT MISSION', class: 'btn pause-game-modal__btn pause-game-modal__btn--secondary', onClick: () => this.game.backToCurrentCategoryLevels() }
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
