import { CONFIG } from '../data/config.js';
import { AudioManager } from '../core/AudioManager.js';

const CAMPAIGN_STEPS = [
    'INTERCEPT',
    'DECRYPT',
    'NEUTRALIZE',
    'ANALYSE',
    'CONTAIN',
    'TRACE',
    'ISOLATE',
    'MIRROR',
    'CLASSIFY',
    'ENDGAME'
];

export class ZeroDayCountdown {
    constructor(puzzleData, gameScreen, missionData = null) {
        this.gameScreen = gameScreen;
        this.audio = AudioManager.getInstance();
        this.mission = missionData || {};
        this.puzzleData = puzzleData || {};

        this.answer = String(this.puzzleData.answer || '').trim().toUpperCase();
        this.maxAttempts = Number(this.puzzleData.maxAttempts || 3);
        this.timeLimit = Number(this.puzzleData.timeLimit || CONFIG.TIMING.DEFAULT_MISSION_TIME || 60);

        this.attempts = 0;
        this.hintsShown = 0;
        this.revealedHints = [];
        this.isComplete = false;
        this.finishState = null;
        this.syncInterval = null;
        this.finishTimeout = null;
        this.binaryRainFrame = null;
        this.binaryRainResizeHandler = null;
        this.binaryRainStreams = [];

        this.container = null;
        this.canvasEl = null;
        this.inputEl = null;
        this.feedbackEl = null;
        this.hintBoxEl = null;
        this.hintButtonEl = null;
        this.submitButtonEl = null;
        this.proceedButtonEl = null;
        this.telemetryEl = null;
        this.attemptsEl = null;
        this.scoreEl = null;
        this.timerEl = null;
        this.timerChipEl = null;
        this.hintsEl = null;
        this.aiEl = null;
        this.ringEl = null;
        this.ringNumEl = null;
        this.objectiveEls = [];
        this.pipEls = [];
    }

    render(container) {
        this.container = container;
        this.container.innerHTML = this.renderMarkup();
        this.cacheDom();
        this.bindEvents();
        this.markObjective(0, 'done');
        this.markObjective(1, 'active');
        this.markObjective(2, 'idle');
        this.startBinaryRain();
        this.syncUi();
        this.syncInterval = window.setInterval(() => this.syncUi(), 200);
        window.setTimeout(() => this.inputEl?.focus(), 120);
    }

    renderMarkup() {
        const level = Number(this.mission.level || 1);
        const hero = this.puzzleData.hero || {};
        const byteMarkup = this.renderByteMarkup();
        const stepsMarkup = CAMPAIGN_STEPS.map((label, index) => {
            const state = index + 1 < level ? 'done' : index + 1 === level ? 'active' : '';
            return `
                <div class="zd-step ${state}">
                    <span class="zd-step__dot"></span>
                    <strong>${String(index + 1).padStart(2, '0')}</strong>
                    <span>${label}</span>
                </div>
            `;
        }).join('');

        return `
            <div class="zero-day-lab">
                <canvas class="zero-day-lab__matrix" id="zd-matrix" aria-hidden="true"></canvas>
                <div class="zero-day-lab__scan"></div>

                <header class="zero-day-lab__topbar">
                    <div class="zero-day-lab__brand">
                        <div class="zero-day-lab__brand-mark">0D</div>
                        <div class="zero-day-lab__brand-copy">
                            <div class="zero-day-lab__brand-name">SHADOWDEF</div>
                            <div class="zero-day-lab__brand-sub">// ZERO-DAY COUNTDOWN</div>
                        </div>
                    </div>

                    <div class="zero-day-lab__mission">
                        <div class="zero-day-lab__mission-kicker">// LEVEL ${String(level).padStart(2, '0')} - ${this.puzzleData.stepLabel || CAMPAIGN_STEPS[level - 1] || 'MISSION'}</div>
                        <div class="zero-day-lab__mission-name">${this.puzzleData.storyTitle || this.mission.title || 'THREAT INTERCEPT'}</div>
                    </div>

                    <div class="zero-day-lab__hud">
                        <div class="zero-day-lab__hud-block">
                            <span class="zero-day-lab__hud-label">TIME</span>
                            <span class="zero-day-lab__hud-value zero-day-lab__hud-value--cyan" id="zd-timer-chip">00:00</span>
                        </div>
                        <div class="zero-day-lab__hud-block">
                            <span class="zero-day-lab__hud-label">SCORE</span>
                            <span class="zero-day-lab__hud-value zero-day-lab__hud-value--gold" id="zd-score">0000</span>
                        </div>
                        <div class="zero-day-lab__hud-block">
                            <span class="zero-day-lab__hud-label">THREAT</span>
                            <span class="zero-day-lab__hud-value zero-day-lab__hud-value--pink" id="zd-ai-progress">0%</span>
                        </div>
                        <div class="zero-day-lab__hud-block zero-day-lab__hud-block--wide">
                            <span class="zero-day-lab__hud-label">HINTS</span>
                            <span class="zero-day-lab__hud-value" id="zd-hints">3/3</span>
                        </div>
                    </div>

                    <div class="zero-day-lab__actions">
                        <button class="zero-day-lab__action" data-action="back-to-levels" type="button">[ MAP ]</button>
                        <button class="zero-day-lab__action" data-action="pause" type="button">[ PAUSE ]</button>
                    </div>
                </header>

                <div class="zero-day-lab__steps">
                    ${stepsMarkup}
                </div>

                <div class="zero-day-lab__body">
                    <main class="zero-day-lab__main">
                        <section class="zero-day-lab__hero">
                            <div class="zero-day-lab__eyebrow">// ${this.puzzleData.typeLabel || 'DECODE'} OPERATION</div>
                            <h2 class="zero-day-lab__title">
                                <span>${hero.line1 || 'DECODE'}</span>
                                <span>${hero.line2 || 'THE'}</span>
                                <span><em>${hero.line3Accent || 'CIPHER'}</em>${hero.line3Tail || ''}</span>
                            </h2>
                            <p class="zero-day-lab__subtitle">
                                LEVEL ${String(level).padStart(2, '0')} · ${this.puzzleData.typeLabel || 'CIPHER ANALYSIS'} · ${this.puzzleData.storyObjective || this.mission.objective || 'Recover the hostile keyword.'}
                            </p>
                            <p class="zero-day-lab__description">${this.puzzleData.description || this.mission.userTask || this.mission.desc || ''}</p>
                        </section>

                        <section class="zero-day-lab__cipher-card">
                            <div class="zero-day-lab__card-label">INTERCEPTED TRANSMISSION</div>
                            <div class="zero-day-lab__cipher">${this.puzzleData.cipher || ''}</div>
                            <div class="zero-day-lab__tags">
                                <span class="zero-day-lab__tag zero-day-lab__tag--cyan">${(this.puzzleData.typeLabel || 'DECODER').toUpperCase()}</span>
                                <span class="zero-day-lab__tag">CLASSIFIED</span>
                                <span class="zero-day-lab__tag zero-day-lab__tag--pink">${(this.puzzleData.stepLabel || 'MISSION').toUpperCase()}</span>
                            </div>
                            ${byteMarkup}
                        </section>

                        <section class="zero-day-lab__terminal">
                            <div class="zero-day-lab__terminal-head">// DECODE TERMINAL</div>
                            <div class="zero-day-lab__terminal-row">
                                <input class="zero-day-lab__input" id="zd-answer" type="text" placeholder="ENTER DECRYPTED KEYWORD" autocomplete="off" spellcheck="false" />
                                <button class="zero-day-lab__submit" id="zd-submit" type="button">SUBMIT</button>
                            </div>
                            <div class="zero-day-lab__terminal-tools">
                                <button class="zero-day-lab__hint-btn" id="zd-hint-btn" type="button">REQUEST INTEL (-100)</button>
                                <div class="zero-day-lab__attempts" id="zd-attempts">ATTEMPTS: 0 / ${this.maxAttempts}</div>
                            </div>
                            <div class="zero-day-lab__hint-box" id="zd-hint-box"></div>
                        </section>

                        <div class="zero-day-lab__feedback" id="zd-feedback">// Awaiting analyst input.</div>
                        <button class="zero-day-lab__proceed" id="zd-proceed" type="button" hidden>[ SEND TO DEBRIEF ]</button>
                    </main>

                    <aside class="zero-day-lab__sidebar">
                        <section class="zero-day-lab__panel zero-day-lab__panel--timer">
                            <div class="zero-day-lab__panel-title">THREAT CLOCK</div>
                            <div class="zero-day-lab__ring-wrap">
                                <svg class="zero-day-lab__ring" viewBox="0 0 120 120" aria-hidden="true">
                                    <circle class="zero-day-lab__ring-bg" cx="60" cy="60" r="50"></circle>
                                    <circle class="zero-day-lab__ring-fill" id="zd-ring" cx="60" cy="60" r="50"></circle>
                                </svg>
                                <div class="zero-day-lab__ring-copy">
                                    <div class="zero-day-lab__ring-num" id="zd-ring-num">00:00</div>
                                    <div class="zero-day-lab__ring-label">WINDOW</div>
                                </div>
                            </div>
                            <div class="zero-day-lab__telemetry" id="zd-telemetry"></div>
                        </section>

                        <section class="zero-day-lab__panel">
                            <div class="zero-day-lab__panel-title">MISSION OBJECTIVES</div>
                            <div class="zero-day-lab__objectives">
                                <div class="zero-day-lab__objective" data-objective="0">
                                    <div class="zero-day-lab__objective-icon">01</div>
                                    <div class="zero-day-lab__objective-text">Intercept the hostile transmission.</div>
                                </div>
                                <div class="zero-day-lab__objective" data-objective="1">
                                    <div class="zero-day-lab__objective-icon">02</div>
                                    <div class="zero-day-lab__objective-text">Apply the matching decode technique.</div>
                                </div>
                                <div class="zero-day-lab__objective" data-objective="2">
                                    <div class="zero-day-lab__objective-icon">03</div>
                                    <div class="zero-day-lab__objective-text">Submit the correct keyword before deployment.</div>
                                </div>
                            </div>
                        </section>

                        <section class="zero-day-lab__panel">
                            <div class="zero-day-lab__panel-title">ANALYST STATUS</div>
                            <div class="zero-day-lab__integrity-label">INTEGRITY</div>
                            <div class="zero-day-lab__pips" id="zd-pips">
                                <span class="zero-day-lab__pip"></span>
                                <span class="zero-day-lab__pip"></span>
                                <span class="zero-day-lab__pip"></span>
                            </div>
                            <div class="zero-day-lab__integrity-copy">Each failed decode burns one integrity segment.</div>
                        </section>

                        <section class="zero-day-lab__panel">
                            <div class="zero-day-lab__panel-title">CAMPAIGN MAP</div>
                            <div class="zero-day-lab__dots">
                                ${this.renderCampaignDots()}
                            </div>
                            <div class="zero-day-lab__counter">LEVEL ${String(level).padStart(2, '0')} / ${CAMPAIGN_STEPS.length}</div>
                        </section>
                    </aside>
                </div>
            </div>
        `;
    }

    renderByteMarkup() {
        if (!this.puzzleData.isBinary || !this.puzzleData.cipher) {
            return '';
        }

        const chips = String(this.puzzleData.cipher)
            .trim()
            .split(/\s+/)
            .map((byte) => {
                const decimal = Number.parseInt(byte, 2);
                return `
                    <div class="zero-day-lab__byte">
                        <span>${byte}</span>
                        <strong>${Number.isNaN(decimal) ? '--' : decimal}</strong>
                    </div>
                `;
            })
            .join('');

        return `<div class="zero-day-lab__bytes">${chips}</div>`;
    }

    renderCampaignDots() {
        const sectionMissions = Array.isArray(this.gameScreen?.game?.malwareMissions)
            ? this.gameScreen.game.malwareMissions
            : [];
        const currentLevel = Number(this.mission.level || 1);

        return CAMPAIGN_STEPS.map((_, index) => {
            const mission = sectionMissions[index];
            const isDone = !!mission?.completed;
            const isCurrent = currentLevel === index + 1;
            const classes = [
                'zero-day-lab__dot',
                isDone ? 'is-done' : '',
                isCurrent ? 'is-active' : ''
            ].filter(Boolean).join(' ');
            return `<span class="${classes}"></span>`;
        }).join('');
    }

    cacheDom() {
        this.canvasEl = document.getElementById('zd-matrix');
        this.inputEl = document.getElementById('zd-answer');
        this.feedbackEl = document.getElementById('zd-feedback');
        this.hintBoxEl = document.getElementById('zd-hint-box');
        this.hintButtonEl = document.getElementById('zd-hint-btn');
        this.submitButtonEl = document.getElementById('zd-submit');
        this.proceedButtonEl = document.getElementById('zd-proceed');
        this.telemetryEl = document.getElementById('zd-telemetry');
        this.attemptsEl = document.getElementById('zd-attempts');
        this.scoreEl = document.getElementById('zd-score');
        this.timerEl = document.getElementById('zd-ring-num');
        this.timerChipEl = document.getElementById('zd-timer-chip');
        this.hintsEl = document.getElementById('zd-hints');
        this.aiEl = document.getElementById('zd-ai-progress');
        this.ringEl = document.getElementById('zd-ring');
        this.ringNumEl = document.getElementById('zd-ring-num');
        this.objectiveEls = Array.from(document.querySelectorAll('[data-objective]'));
        this.pipEls = Array.from(document.querySelectorAll('#zd-pips .zero-day-lab__pip'));
    }

    bindEvents() {
        this.submitButtonEl?.addEventListener('click', () => this.submitAnswer());
        this.hintButtonEl?.addEventListener('click', () => this.showHint());
        this.proceedButtonEl?.addEventListener('click', () => this.finishMission());
        this.inputEl?.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                this.submitAnswer();
            }
        });
        this.inputEl?.addEventListener('input', () => {
            if (this.isComplete) return;
            this.markObjective(1, this.inputEl.value.trim() ? 'done' : 'active');
        });
    }

    syncUi() {
        const remaining = this.getRemainingTime();
        const remainingRatio = Math.max(0, Math.min(1, remaining / this.timeLimit));
        const timerColor = remaining <= Math.max(10, Math.floor(this.timeLimit * 0.25))
            ? 'var(--zero-day-pink)'
            : remaining <= Math.max(18, Math.floor(this.timeLimit * 0.5))
                ? 'var(--zero-day-amber)'
                : 'var(--zero-day-cyan)';
        const score = this.gameScreen?.game?.score?.getScore?.() ?? 0;
        const hintsRemaining = Math.max(0, CONFIG.HINTS.MAX_HINTS_PER_MISSION - (this.gameScreen?.game?.score?.hintsUsed || 0));
        const aiProgress = Math.max(0, Math.min(100, Math.floor(this.gameScreen?.aiOpponent?.getProgress?.() || 0)));
        const dashOffset = 314 * (1 - remainingRatio);

        if (this.scoreEl) {
            this.scoreEl.textContent = String(score).padStart(4, '0');
        }

        if (this.hintsEl) {
            this.hintsEl.textContent = `${hintsRemaining}/${CONFIG.HINTS.MAX_HINTS_PER_MISSION}`;
        }

        if (this.aiEl) {
            this.aiEl.textContent = `${aiProgress}%`;
        }

        const timerText = this.formatTime(remaining);
        if (this.timerEl) {
            this.timerEl.textContent = timerText;
            this.timerEl.style.color = timerColor;
        }
        if (this.timerChipEl) {
            this.timerChipEl.textContent = timerText;
            this.timerChipEl.style.color = timerColor;
        }
        if (this.ringEl) {
            this.ringEl.style.strokeDashoffset = String(dashOffset);
            this.ringEl.style.stroke = timerColor;
        }

        if (this.attemptsEl) {
            this.attemptsEl.textContent = `ATTEMPTS: ${this.attempts} / ${this.maxAttempts}`;
        }

        this.renderTelemetry(remainingRatio, aiProgress, hintsRemaining);
        this.renderAttemptPips();
    }

    renderTelemetry(remainingRatio, aiProgress, hintsRemaining) {
        if (!this.telemetryEl) return;

        const confidence = Math.max(10, 100 - (this.attempts * 28) - (this.hintsShown * 14));
        const intelExposure = Math.min(100, this.hintsShown * 34);
        const rows = [
            { label: 'Signal Integrity', value: Math.round(remainingRatio * 100), tone: remainingRatio > 0.55 ? 'cyan' : remainingRatio > 0.3 ? 'amber' : 'pink' },
            { label: 'Decode Confidence', value: confidence, tone: confidence > 65 ? 'green' : confidence > 35 ? 'amber' : 'pink' },
            { label: 'Threat Trace', value: aiProgress, tone: aiProgress > 70 ? 'pink' : aiProgress > 40 ? 'amber' : 'cyan' },
            { label: 'Intel Exposure', value: Math.max(0, (CONFIG.HINTS.MAX_HINTS_PER_MISSION - hintsRemaining) * 34), tone: intelExposure > 60 ? 'pink' : intelExposure > 20 ? 'amber' : 'green' }
        ];

        this.telemetryEl.innerHTML = rows.map((row) => `
            <div class="zero-day-lab__telemetry-row">
                <div class="zero-day-lab__telemetry-top">
                    <span>${row.label}</span>
                    <span>${row.value}%</span>
                </div>
                <div class="zero-day-lab__telemetry-track">
                    <div class="zero-day-lab__telemetry-fill tone-${row.tone}" style="width:${row.value}%;"></div>
                </div>
            </div>
        `).join('');
    }

    renderAttemptPips() {
        const remainingSegments = Math.max(0, this.maxAttempts - this.attempts);
        this.pipEls.forEach((pip, index) => {
            pip.classList.toggle('is-dead', index >= remainingSegments);
        });
    }

    submitAnswer() {
        if (this.isComplete) return;

        const submittedValue = this.sanitizeAnswer(this.inputEl?.value || '');
        if (!submittedValue) {
            this.setFeedback('warn', '// Enter a decoded keyword before submitting.');
            return;
        }

        this.attempts += 1;
        this.gameScreen.game.score.recordAttempt();
        this.gameScreen.updateScore();
        this.markObjective(1, 'done');

        if (submittedValue === this.answer) {
            this.handleSuccess();
            return;
        }

        this.audio.playFailure();

        if (this.attempts >= this.maxAttempts) {
            this.failMission(`// Decode failed. Correct keyword: ${this.answer}. ${this.puzzleData.explain || ''}`, false);
            return;
        }

        const remaining = this.maxAttempts - this.attempts;
        this.markObjective(2, 'active');
        this.setFeedback('fail', `// Incorrect keyword. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`);
    }

    handleSuccess() {
        if (this.isComplete) return;

        const remaining = this.getRemainingTime();
        const timeAward = Math.round((remaining / Math.max(1, this.timeLimit)) * 120);
        const firstStrikeAward = this.attempts === 1 ? 150 : this.attempts === 2 ? 60 : 0;
        const cleanRunAward = this.hintsShown === 0 ? 75 : 0;
        const missionAward = 250 + timeAward + firstStrikeAward + cleanRunAward;

        this.gameScreen.game.score.addPoints(missionAward);
        this.gameScreen.updateScore();
        this.audio.playSuccess();

        this.isComplete = true;
        this.finishState = 'success';
        this.disableInputs();
        this.markObjective(0, 'done');
        this.markObjective(1, 'done');
        this.markObjective(2, 'done');
        this.setFeedback('ok', `// Threat neutralized. +${missionAward} score. ${this.puzzleData.explain || ''}`);

        if (this.proceedButtonEl) {
            this.proceedButtonEl.hidden = false;
            this.proceedButtonEl.textContent = '[ SEND TO DEBRIEF ]';
        }
    }

    failMission(message, autoProceed = true) {
        if (this.isComplete) return;

        this.isComplete = true;
        this.finishState = 'failure';
        this.disableInputs();
        this.markObjective(2, 'active');
        this.audio.playFailure();
        this.setFeedback('fail', message);

        if (this.proceedButtonEl) {
            this.proceedButtonEl.hidden = false;
            this.proceedButtonEl.textContent = autoProceed ? '[ FAILURE REPORTING ]' : '[ FILE FAILURE REPORT ]';
        }

        if (autoProceed) {
            this.finishTimeout = window.setTimeout(() => this.finishMission(), 1100);
        }
    }

    finishMission() {
        if (!this.finishState) return;
        this.clearTimers();
        this.gameScreen.completePuzzle(this.finishState === 'success');
    }

    showHint() {
        if (this.isComplete) {
            this.gameScreen.ui.showNotification('Mission already resolved.', 'info');
            return;
        }

        const hints = [
            this.mission?.hintSystem?.hint1,
            this.mission?.hintSystem?.hint2,
            this.mission?.hintSystem?.hint3
        ].filter(Boolean);

        if (this.hintsShown >= hints.length || this.hintsShown >= CONFIG.HINTS.MAX_HINTS_PER_MISSION) {
            this.gameScreen.ui.showNotification('No more intel available.', 'warning');
            return;
        }

        const hintText = hints[this.hintsShown];
        this.hintsShown += 1;
        this.revealedHints.push(hintText);

        this.gameScreen.game.score.recordHint();
        this.gameScreen.updateScore();
        this.gameScreen.updateHintsDisplay();
        this.audio.playHint();

        if (this.hintBoxEl) {
            this.hintBoxEl.innerHTML = this.revealedHints
                .map((hint, index) => `<div>// Intel ${index + 1}: ${hint}</div>`)
                .join('');
            this.hintBoxEl.classList.add('is-visible');
        }

        if (this.hintButtonEl && this.hintsShown >= CONFIG.HINTS.MAX_HINTS_PER_MISSION) {
            this.hintButtonEl.disabled = true;
        }

        this.setFeedback('warn', `// Intel package received: ${hintText}`);
        this.gameScreen.ui.showNotification('Hint revealed.', 'info');
    }

    handleTimeExpired() {
        if (this.isComplete) return true;
        this.failMission(`// Time expired. Correct keyword: ${this.answer}. ${this.puzzleData.explain || ''}`, true);
        return true;
    }

    handleAIWin() {
        if (this.isComplete) return true;
        this.failMission(`// Hostile analyst reached the payload first. Correct keyword: ${this.answer}. ${this.puzzleData.explain || ''}`, true);
        return true;
    }

    disableInputs() {
        if (this.inputEl) this.inputEl.disabled = true;
        if (this.submitButtonEl) this.submitButtonEl.disabled = true;
        if (this.hintButtonEl) this.hintButtonEl.disabled = true;
    }

    setFeedback(state, message) {
        if (!this.feedbackEl) return;
        this.feedbackEl.className = `zero-day-lab__feedback is-${state}`;
        this.feedbackEl.textContent = message;
    }

    markObjective(index, state) {
        const el = this.objectiveEls[index];
        if (!el) return;

        el.classList.remove('is-active', 'is-done');

        const icon = el.querySelector('.zero-day-lab__objective-icon');
        if (state === 'done') {
            el.classList.add('is-done');
            if (icon) icon.textContent = 'OK';
        } else if (state === 'active') {
            el.classList.add('is-active');
            if (icon) icon.textContent = String(index + 1).padStart(2, '0');
        } else if (icon) {
            icon.textContent = String(index + 1).padStart(2, '0');
        }
    }

    getRemainingTime() {
        return Math.max(0, Number(this.gameScreen?.timer?.getRemaining?.() ?? this.timeLimit));
    }

    formatTime(totalSeconds) {
        const safeSeconds = Math.max(0, Number(totalSeconds) || 0);
        const minutes = Math.floor(safeSeconds / 60);
        const seconds = safeSeconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    sanitizeAnswer(value) {
        return String(value || '')
            .trim()
            .toUpperCase()
            .replace(/\s+/g, '');
    }

    clearTimers() {
        if (this.syncInterval) {
            window.clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
        if (this.finishTimeout) {
            window.clearTimeout(this.finishTimeout);
            this.finishTimeout = null;
        }
    }

    startBinaryRain() {
        const canvas = this.canvasEl;
        if (!canvas) return;

        this.stopBinaryRain();

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const levelSpeedMultiplier = Number(this.mission?.level === 1 ? 1.25 : 1);
        const makeBinaryText = () => {
            const length = 2 + Math.floor(Math.random() * 5);
            let text = '';
            for (let i = 0; i < length; i += 1) {
                text += Math.random() > 0.5 ? '1' : '0';
            }
            return text;
        };
        const makeSprite = (width, height, spawnAbove = false) => ({
            x: Math.random() * Math.max(width, 1),
            y: spawnAbove
                ? (-20 - Math.random() * Math.max(height * 0.35, 120))
                : (-20 + Math.random() * Math.max(height + 20, 40)),
            drift: (Math.random() - 0.5) * 0.18,
            fall: (0.3 + Math.random() * 0.34) * levelSpeedMultiplier,
            wobble: Math.random() * Math.PI * 2,
            size: 16 + Math.random() * 12,
            opacity: 0.26 + Math.random() * 0.2,
            text: makeBinaryText()
        });

        const resize = () => {
            const parent = canvas.parentElement;
            const width = parent?.clientWidth || canvas.clientWidth || 0;
            const height = parent?.clientHeight || canvas.clientHeight || 0;
            canvas.width = width;
            canvas.height = height;

            const spriteCount = Math.max(28, Math.min(80, Math.floor(width / 22)));
            this.binaryRainStreams = Array.from({ length: spriteCount }, () => makeSprite(width, height, false));
        };

        resize();
        this.binaryRainResizeHandler = resize;
        window.addEventListener('resize', this.binaryRainResizeHandler);

        let previous = performance.now();
        const draw = (timestamp = performance.now()) => {
            if (!canvas.width || !canvas.height) {
                previous = timestamp;
                this.binaryRainFrame = window.requestAnimationFrame(draw);
                return;
            }

            const delta = Math.min(40, timestamp - previous);
            previous = timestamp;

            ctx.fillStyle = 'rgba(2, 8, 18, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.textBaseline = 'top';
            ctx.textAlign = 'left';

            this.binaryRainStreams.forEach((sprite, index) => {
                const step = delta * 0.06;
                sprite.y += sprite.fall * step * 60;
                sprite.x += Math.sin(timestamp * 0.00055 + sprite.wobble) * sprite.drift;

                ctx.font = `bold ${sprite.size}px Consolas, "Courier New", monospace`;
                ctx.fillStyle = `rgba(150, 236, 255, ${sprite.opacity})`;
                ctx.shadowColor = 'rgba(31, 215, 255, 0.34)';
                ctx.shadowBlur = 10;
                ctx.fillText(sprite.text, sprite.x, sprite.y);

                if (sprite.y > canvas.height + sprite.size + 16) {
                    this.binaryRainStreams[index] = makeSprite(canvas.width, canvas.height, true);
                }
            });

            this.binaryRainFrame = window.requestAnimationFrame(draw);
        };

        this.binaryRainFrame = window.requestAnimationFrame(draw);
    }

    stopBinaryRain() {
        if (this.binaryRainFrame) {
            window.cancelAnimationFrame(this.binaryRainFrame);
            this.binaryRainFrame = null;
        }

        if (this.binaryRainResizeHandler) {
            window.removeEventListener('resize', this.binaryRainResizeHandler);
            this.binaryRainResizeHandler = null;
        }
    }

    destroy() {
        this.clearTimers();
        this.stopBinaryRain();
    }
}
