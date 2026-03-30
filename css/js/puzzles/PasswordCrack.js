/**
 * PasswordCrack - Password cracking puzzle
 * IMPROVED v2 — fixes applied:
 *  - Level 2: second attempt on wrong choice (costs vault, not instant fail)
 *  - Level 6: level 1 shell can power mission-specific breach triage boards
 *  - Level 7: tutorialOverlay + rampUpAfterSeconds spawn rate
 *  - Level 9: tiered win condition (tiers array)
 *  - Level 10: live rating preview on every dropdown change
 *  - ALL: knowledgeSummary passed to gameScreen for post-completion overlay
 */

import { CONFIG } from '../data/config.js';
import { AudioManager } from '../core/AudioManager.js';

export class PasswordCrack {
    constructor(puzzleData, gameScreen, missionData = null) {
        this.gameScreen = gameScreen;
        this.audio = AudioManager.getInstance();
        this.mission = missionData || {};
        this.puzzleData = puzzleData || {};

        this.interactionMode = this.puzzleData.interactionMode || 'typing';
        this.session = null;
        this.selectedOptions = new Set();
        this.riskSystem = this.puzzleData.riskSystem || null;
        this.riskValue = this.riskSystem ? (this.riskSystem.start || 0) : 0;
        this.singleChoiceSelected = null;
        this.singleChoiceDefenseSelected = null;
        this.singleChoiceStage = 'triage';
        this.singleChoiceSelectedEntryIds = new Set();
        this.singleChoiceFlagLimit = Number(this.puzzleData.singleChoiceFlagLimit || 3);
        this.singleChoiceTimerId = null;
        this.singleChoiceLogTimerId = null;
        this.singleChoiceRemaining = this.puzzleData.timeLimit || 60;
        this.vaultConfig = this.puzzleData.vaultIntegrity || null;
        this.vaultIntegrity = this.vaultConfig ? (this.vaultConfig.start || 100) : 100;
        this.logEntryIndex = 0;
        this.predictionSession = null;
        this.predictionSelected = null;
        this.predictionRatings = {};
        this.predictionTimerId = null;
        this.predictionRemaining = this.puzzleData.timeLimit || 60;
        this.investigationSelectedCause = null;
        this.investigationSelectedDefense = null;
        this.investigationStage = 'cause';
        this.investigationSelectedEntryId = null;
        this.investigationFlaggedEvents = new Set();
        this.investigationFlagLimit = Number(this.puzzleData.investigationFlagLimit || 3);
        this.inspectionSelectedSystem = null;
        this.inspectionSelectedDefense = null;
        this.inspectionStage = 'audit';
        this.inspectionViewedActions = new Set();
        this.inspectionFeedbackHtml = '';
        this.strategySelectedDefenses = new Set();
        this.strategySimulationResult = null;
        this.liveVaultHealth = 100;
        this.liveEnergy = 100;
        this.liveRemainingTime = 60;
        this.liveActiveAttack = null;
        this.liveDefenseCooldowns = {};
        this.liveWaveIndex = 0;
        this.liveAttackIndex = 0;
        this.liveTotalAttacks = 0;
        this.liveIntelState = null;
        this.liveSuccessfulBlocks = 0;
        this.liveMissedWaves = 0;
        this.liveAttackTimeoutId = null;
        this.liveSpawnTimeoutId = null;
        this.liveEnergyTimerId = null;
        this.liveDurationTimerId = null;
        this.liveCooldownTimerId = null;
        this.signalIntegrity = 100;
        this.signalBlocked = 0;
        this.signalMissed = 0;
        this.signalFalsePositives = 0;
        this.signalCombo = 0;
        this.signalMaxCombo = 0;
        this.signalCurrentWaveIndex = 0;
        this.signalWaveSeconds = 0;
        this.signalWaveRunning = false;
        this.signalAnnouncementVisible = true;
        this.signalGameOver = false;
        this.signalPacketId = 0;
        this.signalPackets = [];
        this.signalClickEffects = [];
        this.signalSpawnAccumulatorMs = 0;
        this.signalLastFrameTime = 0;
        this.signalAnimationFrameId = null;
        this.signalWaveTimerId = null;
        this.signalTransitionTimeoutId = null;
        this.signalCompletionTimerId = null;
        this.signalAutoStartTimerId = null;
        this.signalToastTimerId = null;
        this.signalServerFlashTimerId = null;
        this.signalCanvas = null;
        this.signalCtx = null;
        this.signalResizeHandler = null;
        this.signalScoreBreakdown = {
            blocked: 0,
            wave: 0,
            integrity: 0,
            accuracy: 0,
            combo: 0
        };
        this.threatVaultHealth = 100;
        this.threatSystemIntegrity = 100;
        this.threatFalsePositiveCount = 0;
        this.threatAttackerProgress = 0;
        this.threatDetectedMajor = new Set();
        this.threatContainedMajor = new Set();
        this.threatInvestigatedEvents = new Set();
        this.threatMarkedEvents = new Set();
        this.threatSelectedEventId = null;
        this.threatActionHistory = new Set();
        this.threatActivityLog = [];
        this.threatTurn = 0;
        this.threatCasePhase = 1;
        this.threatChainSelection = [];
        this.threatChainValidated = false;
        this.threatChainValidationResult = null;
        this.threatContainmentSelection = { account: '', action: '', ip: '', escalate: '' };
        this.threatContainmentResult = null;
        this.threatContainmentResolved = false;
        this.threatCompletionTimerId = null;
        this.patchMetrics = {
            vaultHealth: 100,
            exploitSuccessRate: 62,
            serverLoad: 46,
            userExperienceScore: 82,
            vulnerabilityCountRemaining: 0
        };
        this.patchClosedVulns = new Set();
        this.patchAppliedActions = new Set();
        this.patchStagedActions = new Set();
        this.patchActivityLog = [];
        this.patchPrimaryFixed = false;
        this.patchSecondaryRevealed = false;
        this.patchTurnsSincePatch = 0;
        this.enterpriseConfig = {};
        this.enterpriseAttackResults = [];
        this.enterpriseScores = null;
        this.enterpriseRating = '';
        this.enterpriseBadgeUnlocked = false;
        this.breachTriageSelectedId = null;
        this.breachTriageAssignments = new Map();
        this.breachTriageInspectedIds = new Set();

        // FIX L6: salt demo state
        this.saltDemoCompleted = false;
        this.saltReuseState = null;
        this.saltReuseCompletionTimerId = null;

        // FIX L7: ramp-up tracking
        this.liveSimulationElapsed = 0;
        this.liveRampActive = false;

        if (this.interactionMode === 'multiSelect' || this.interactionMode === 'humanPsychologyLab') {
            this.session = this.createMultiSelectSession();
            this.password = '';
            this.hints = [];
            this.overallAnswerHint = 'Select all weak passwords and avoid selecting strong ones.';
            this.dynamicScenario = this.session.storyHint || null;
            this.dynamicUserTask = this.mission.userTask || null;
        } else if (this.interactionMode === 'breachTriageLab') {
            this.session = this.createMultiSelectSession();
            this.password = '';
            this.hints = [];
            this.overallAnswerHint = null;
            this.dynamicScenario = this.session.storyHint || null;
            this.dynamicUserTask = this.mission.userTask || null;
        } else if (this.interactionMode === 'saltReuseLab') {
            this.initializeSaltReuseLabState();
            this.password = '';
            this.hints = [];
            this.overallAnswerHint = null;
            this.dynamicScenario = null;
            this.dynamicUserTask = null;
        } else if (this.interactionMode === 'singleChoice') {
            this.password = '';
            this.hints = [];
            this.overallAnswerHint = null;
            this.dynamicScenario = null;
            this.dynamicUserTask = null;
        } else if (this.interactionMode === 'predictionChoice') {
            this.predictionSession = this.createPredictionSession();
            this.password = '';
            this.hints = [];
            this.overallAnswerHint = null;
            this.dynamicScenario = null;
            this.dynamicUserTask = null;
        } else if (this.interactionMode === 'investigation') {
            this.password = '';
            this.hints = [];
            this.overallAnswerHint = null;
            this.dynamicScenario = null;
            this.dynamicUserTask = null;
        } else if (this.interactionMode === 'inspection') {
            this.password = '';
            this.hints = [];
            this.overallAnswerHint = null;
            this.dynamicScenario = null;
            this.dynamicUserTask = null;
            this.inspectionStage = 'audit';
        } else if (this.interactionMode === 'liveDefenseSimulation') {
            const simConfig = this.puzzleData.simulationConfig || {};
            this.liveVaultHealth = Number(simConfig.vaultHealth || 100);
            this.liveEnergy = Number(simConfig.playerEnergy || 100);
            this.liveRemainingTime = Number(simConfig.simulationDuration || 60);
            this.liveWaveIndex = 0;
            this.liveAttackIndex = 0;
            this.liveTotalAttacks = 0;
            this.liveDefenseCooldowns = {};
            (Array.isArray(this.puzzleData.defenses) ? this.puzzleData.defenses : []).forEach(defense => {
                const key = defense?.id || defense?.name;
                if (key) this.liveDefenseCooldowns[key] = 0;
            });
            this.password = '';
            this.hints = [];
            this.overallAnswerHint = null;
            this.dynamicScenario = null;
            this.dynamicUserTask = null;
        } else if (this.interactionMode === 'signalInterceptSimulation') {
            const server = this.puzzleData.server || {};
            const waves = Array.isArray(this.puzzleData.waves) ? this.puzzleData.waves : [];
            this.signalIntegrity = Number(server.integrity || 100);
            this.signalBlocked = 0;
            this.signalMissed = 0;
            this.signalFalsePositives = 0;
            this.signalCombo = 0;
            this.signalMaxCombo = 0;
            this.signalCurrentWaveIndex = 0;
            this.signalWaveSeconds = Number(waves[0]?.duration || 0);
            this.signalWaveRunning = false;
            this.signalAnnouncementVisible = true;
            this.signalGameOver = false;
            this.signalPacketId = 0;
            this.signalPackets = [];
            this.signalClickEffects = [];
            this.signalSpawnAccumulatorMs = 0;
            this.signalLastFrameTime = 0;
            this.signalWaveTimerId = null;
            this.signalTransitionTimeoutId = null;
            this.signalCompletionTimerId = null;
            this.signalAutoStartTimerId = null;
            this.signalToastTimerId = null;
            this.signalServerFlashTimerId = null;
            this.signalScoreBreakdown = {
                blocked: 0,
                wave: 0,
                integrity: 0,
                accuracy: 0,
                combo: 0
            };
            this.password = '';
            this.hints = [];
            this.overallAnswerHint = null;
            this.dynamicScenario = null;
            this.dynamicUserTask = null;
        } else if (this.interactionMode === 'threatHuntSimulation') {
            const base = this.puzzleData.baseStats || {};
            this.threatVaultHealth = Number(base.vaultHealth || 100);
            this.threatSystemIntegrity = Number(base.systemIntegrity || 100);
            this.threatFalsePositiveCount = Number(base.falsePositiveCount || 0);
            this.threatAttackerProgress = Number(base.attackerProgress || 0);
            this.threatDetectedMajor = new Set();
            this.threatContainedMajor = new Set();
            this.threatInvestigatedEvents = new Set();
            this.threatMarkedEvents = new Set();
            this.threatSelectedEventId = null;
            this.threatActionHistory = new Set();
            this.threatActivityLog = [{
                message: 'Incoming: SOC case active. Review the evidence panels before you escalate the response.',
                tone: 'info'
            }];
            this.threatCasePhase = 1;
            this.threatChainSelection = [];
            this.threatChainValidated = false;
            this.threatChainValidationResult = null;
            this.threatContainmentSelection = { account: '', action: '', ip: '', escalate: '' };
            this.threatContainmentResult = null;
            this.threatContainmentResolved = false;
            this.password = '';
            this.hints = [];
            this.overallAnswerHint = null;
            this.dynamicScenario = null;
            this.dynamicUserTask = null;
        } else if (this.interactionMode === 'livePatchSimulation') {
            this.patchMetrics = {
                ...this.patchMetrics,
                ...(this.puzzleData.systemMetrics || {})
            };
            this.patchMetrics.vulnerabilityCountRemaining = Array.isArray(this.puzzleData.vulnerabilities)
                ? this.puzzleData.vulnerabilities.filter(v => v.status !== 'closed' && v.status !== 'hidden').length
                : 0;
            this.password = '';
            this.hints = [];
            this.overallAnswerHint = null;
            this.dynamicScenario = null;
            this.dynamicUserTask = null;
        } else if (this.interactionMode === 'enterpriseArchitectureSimulation') {
            this.enterpriseConfig = this.buildEnterpriseDefaultConfig();
            this.password = '';
            this.hints = [];
            this.overallAnswerHint = null;
            this.dynamicScenario = null;
            this.dynamicUserTask = null;
        } else {
            const dynamicPuzzle = this.puzzleData.randomized
                ? this.generateDynamicPasswordProfile(this.puzzleData)
                : null;
            this.password = (dynamicPuzzle?.password || this.puzzleData.password || '').toUpperCase();
            this.hints = dynamicPuzzle?.hints || this.puzzleData.hints || [];
            this.overallAnswerHint = dynamicPuzzle?.overallAnswerHint || null;
            this.dynamicScenario = dynamicPuzzle?.scenarioNarrative || null;
            this.dynamicUserTask = dynamicPuzzle?.taskNarrative || null;
        }

        this.visualProfile = this.puzzleData.visualProfile || null;
        this.visualMode = this.mission.visualMode || '2D';
        this.maxAttempts = this.puzzleData.maxAttempts || CONFIG.PUZZLES.PASSWORD.MAX_ATTEMPTS;
        this.attempts = 0;
        this.hintsShown = 0;
        this.isComplete = false;
        this.inputs = [];
        this.visualizerElement = null;
        this.humanLabLogEntries = [];
        this.humanLabMatrixFrame = null;
        this.humanLabMatrixResizeHandler = null;
        this.humanLabMatrixDrops = [];

        console.log('🔐 Password puzzle initialized:', this.interactionMode);
    }

    // ─── session builders ────────────────────────────────────────────────────

    createMultiSelectSession() {
        if (typeof this.puzzleData.generateSession === 'function') {
            return this.puzzleData.generateSession.call(this.puzzleData);
        }
        const options = Array.isArray(this.puzzleData.options) ? this.puzzleData.options : [];
        return { options, storyHint: this.mission.scenario || '', subtleClueOnFail: '', failHints: [], securityInsight: [] };
    }

    createPredictionSession() {
        if (typeof this.puzzleData.generateSession === 'function') {
            return this.puzzleData.generateSession.call(this.puzzleData);
        }
        const options = Array.isArray(this.puzzleData.options) ? this.puzzleData.options : [];
        return { caseId: 'default', options, correctAnswer: this.puzzleData.correctAnswer || options[0] || '', breakTimeSeconds: {}, simpleExplanation: this.puzzleData.simpleExplanation || '' };
    }

    isHumanLabShellMode() {
        return this.interactionMode === 'humanPsychologyLab' || this.interactionMode === 'breachTriageLab';
    }

    getSaltReuseLabConfig() {
        return this.puzzleData.saltReuseLab || {};
    }

    shuffleArray(arr) {
        const copy = Array.isArray(arr) ? arr.slice() : [];
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    }

    captureRenderScrollState({ primarySelector = '', anchorSelector = '', extraSelectors = [] } = {}) {
        if (!this.visualizerElement) return null;
        const root = this.visualizerElement;
        const primary = primarySelector === '__root__'
            ? root
            : primarySelector
                ? root.querySelector(primarySelector)
                : null;
        const state = {
            primarySelector,
            primaryScrollTop: primary ? primary.scrollTop : 0,
            anchorSelector,
            anchorOffset: null,
            extra: []
        };

        if (primary && anchorSelector) {
            const anchor = root.querySelector(anchorSelector);
            if (anchor) {
                state.anchorOffset = anchor.getBoundingClientRect().top - primary.getBoundingClientRect().top;
            }
        }

        extraSelectors.forEach(selector => {
            const elements = Array.from(root.querySelectorAll(selector));
            state.extra.push({
                selector,
                scrollTops: elements.map(element => element.scrollTop)
            });
        });

        return state;
    }

    restoreRenderScrollState(state) {
        if (!state || !this.visualizerElement) return;
        const applyScrollState = () => {
            const root = this.visualizerElement;
            const primary = state.primarySelector === '__root__'
                ? root
                : state.primarySelector
                    ? root.querySelector(state.primarySelector)
                    : null;
            if (primary) primary.scrollTop = state.primaryScrollTop || 0;

            (state.extra || []).forEach(group => {
                const elements = Array.from(root.querySelectorAll(group.selector));
                elements.forEach((element, index) => {
                    if (typeof group.scrollTops[index] === 'number') {
                        element.scrollTop = group.scrollTops[index];
                    }
                });
            });

            if (primary && state.anchorSelector && typeof state.anchorOffset === 'number') {
                const anchor = root.querySelector(state.anchorSelector);
                if (anchor) {
                    const nextOffset = anchor.getBoundingClientRect().top - primary.getBoundingClientRect().top;
                    primary.scrollTop += nextOffset - state.anchorOffset;
                }
            }
        };

        applyScrollState();
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                applyScrollState();
            });
        });
    }

    rerenderWithPreservedScroll(renderCallback, options = {}) {
        const state = this.captureRenderScrollState(options);
        renderCallback();
        this.restoreRenderScrollState(state);
    }

    clearSaltReuseCompletionTimer() {
        if (this.saltReuseCompletionTimerId) {
            clearTimeout(this.saltReuseCompletionTimerId);
            this.saltReuseCompletionTimerId = null;
        }
    }

    clearThreatCompletionTimer() {
        if (this.threatCompletionTimerId) {
            clearTimeout(this.threatCompletionTimerId);
            this.threatCompletionTimerId = null;
        }
    }

    rerenderSaltReuseLab(options = {}) {
        const extraSelectors = Array.from(new Set([
            '.srl-shell',
            '.srl-phase-screen',
            '.srl-panel',
            '.srl-password-grid',
            ...(options.extraSelectors || [])
        ]));

        this.rerenderWithPreservedScroll(
            () => this.renderSaltReuseLab(this.visualizerElement),
            {
                primarySelector: options.primarySelector || '__root__',
                anchorSelector: options.anchorSelector || '',
                extraSelectors
            }
        );
    }

    rerenderPredictionChoicePuzzle(options = {}) {
        const extraSelectors = Array.from(new Set([
            '.l3-arena-scroll',
            '.l3-console-panel--fill',
            ...(options.extraSelectors || [])
        ]));

        this.rerenderWithPreservedScroll(
            () => this.renderPredictionChoicePuzzle(this.visualizerElement),
            {
                primarySelector: options.primarySelector || '__root__',
                anchorSelector: options.anchorSelector || '',
                extraSelectors
            }
        );
    }

    rerenderThreatHuntSimulation(options = {}) {
        const extraSelectors = Array.from(new Set([
            '.thx-panel',
            '.thx-phase-view',
            '.thx-detail-card',
            '.thx-log-body',
            ...(options.extraSelectors || [])
        ]));

        this.rerenderWithPreservedScroll(
            () => this.renderThreatHuntSimulationPuzzle(this.visualizerElement),
            {
                primarySelector: options.primarySelector || '__root__',
                anchorSelector: options.anchorSelector || '',
                extraSelectors
            }
        );
    }

    queueSaltReuseCompletion(success, delay = 1800) {
        this.clearSaltReuseCompletionTimer();
        this.saltReuseCompletionTimerId = setTimeout(() => {
            this.saltReuseCompletionTimerId = null;
            this.startSaltReuseCompletion(success);
        }, delay);
    }

    initializeSaltReuseLabState() {
        this.clearSaltReuseCompletionTimer();
        const config = this.getSaltReuseLabConfig();
        const classifier = config.classifier || {};
        const weakPool = Array.isArray(classifier.weakPool) && classifier.weakPool.length
            ? classifier.weakPool
            : ['password123', 'welcome123', 'admin123', 'letmein', 'qwerty123', '123456', 'iloveyou', 'dragon', 'sunshine99'];
        const strongPool = Array.isArray(classifier.strongPool) && classifier.strongPool.length
            ? classifier.strongPool
            : ['T7!kP9@vQ2', 'BlueRiver!Train!Cloud!19', 'nR4$zL8#pW1'];
        const weakCount = Math.max(1, Math.min(classifier.weakSelectionCount || 9, weakPool.length));
        const strongCount = Math.max(1, Math.min(classifier.strongSelectionCount || 3, strongPool.length));
        const selectedWeak = this.shuffleArray(weakPool).slice(0, weakCount);
        const selectedStrong = this.shuffleArray(strongPool).slice(0, strongCount);

        this.saltReuseState = {
            phase: 1,
            forgeInput: '',
            forgeCount: 0,
            hashA: '',
            hashB: '',
            divergence: { matches: 0, diffs: 0 },
            insightVisible: false,
            attackBadDone: false,
            attackGoodDone: false,
            attackBadRows: [],
            attackGoodRows: [],
            attackBadMessage: '',
            attackGoodMessage: '',
            phaseOneSelectedAnswer: null,
            phaseOneValidated: false,
            phaseOneFeedback: '',
            phaseTwoSelectedAnswer: null,
            phaseTwoValidated: false,
            phaseTwoFeedback: '',
            selectedPasswords: new Set(),
            classifierSession: {
                weak: selectedWeak,
                strong: selectedStrong,
                all: this.shuffleArray([...selectedWeak, ...selectedStrong])
            },
            feedback: null,
            revealedWeak: new Set(),
            falsePositives: new Set(),
            completion: null
        };
    }

    simulateSaltHash(input) {
        let hash = 5381;
        for (let i = 0; i < input.length; i++) {
            hash = ((hash * 33) + input.charCodeAt(i)) & 0xFFFFFFFF;
        }
        return Math.abs(hash).toString(16).padStart(8, '0');
    }

    makeSaltedHash(password, salt) {
        const combined = `${password}${salt}`;
        const h1 = this.simulateSaltHash(combined);
        const h2 = this.simulateSaltHash(`${salt}${password}${h1}`);
        const h3 = this.simulateSaltHash(`${h1}${combined}${h2}`);
        const h4 = this.simulateSaltHash(`${h2}${h3}${password}`);
        return `${h1}${h2}${h3}${h4}`.slice(0, 32);
    }

    calculateHashDivergence(hashA, hashB) {
        let matches = 0;
        let diffs = 0;
        const maxLen = Math.max(hashA.length, hashB.length);
        for (let i = 0; i < maxLen; i++) {
            if (!hashA[i] || !hashB[i]) continue;
            if (hashA[i] === hashB[i]) matches++;
            else diffs++;
        }
        return { matches, diffs };
    }

    // ─── risk helpers ────────────────────────────────────────────────────────

    increaseRisk(amount = null) {
        if (!this.riskSystem) return;
        const delta = Number.isFinite(Number(amount)) ? Number(amount) : Number(this.riskSystem.wrongAdd || 0);
        this.riskValue = Math.min(this.riskSystem.max || 100, this.riskValue + delta);
        this.updateRiskDisplay();
    }

    updateRiskDisplay() {
        if (!this.riskSystem) return;
        const fill = document.getElementById('risk-fill');
        const text = document.getElementById('risk-text');
        const max = this.riskSystem.max || 100;
        const percent = Math.max(0, Math.min(100, (this.riskValue / max) * 100));
        if (fill) fill.style.width = `${percent}%`;
        if (text) text.textContent = `${Math.floor(percent)}%`;
    }

    hasRiskBreached() {
        if (!this.riskSystem) return false;
        return this.riskValue >= (this.riskSystem.max || 100);
    }

    // ─── main render dispatcher ──────────────────────────────────────────────

    render(container) {
        switch (this.interactionMode) {
            case 'multiSelect':               return this.renderMultiSelectPuzzle(container);
            case 'humanPsychologyLab':        return this.renderHumanPsychologyLab(container);
            case 'breachTriageLab':          return this.renderBreachTriageLab(container);
            case 'saltReuseLab':              return this.renderSaltReuseLab(container);
            case 'singleChoice':              return this.renderSingleChoicePuzzle(container);
            case 'predictionChoice':          return this.renderPredictionChoicePuzzle(container);
            case 'investigation':             return this.renderInvestigationPuzzle(container);
            case 'inspection':                return this.renderInspectionPuzzle(container);
            case 'liveDefenseSimulation':     return this.renderLiveDefenseSimulationPuzzle(container);
            case 'signalInterceptSimulation': return this.renderSignalInterceptSimulationPuzzle(container);
            case 'threatHuntSimulation':      return this.renderThreatHuntSimulationPuzzle(container);
            case 'livePatchSimulation':       return this.renderLivePatchSimulationPuzzle(container);
            case 'enterpriseArchitectureSimulation': return this.renderEnterpriseArchitectureSimulationPuzzle(container);
        }

        // typing / default
        container.innerHTML = `
            <div class="password-puzzle">
                <h2 class="puzzle-title">PASSWORD CRACKING PROTOCOL</h2>
                ${this.renderMissionBrief()}
                <div class="password-hints" id="password-hints">
                    <strong style="color:var(--cyber-blue);">INTELLIGENCE BRIEFING:</strong>
                    ${this.overallAnswerHint ? `<div class="hint"><strong>Overall Hint:</strong> ${this.overallAnswerHint}</div>` : ''}
                    <div class="hint">→ ${this.hints[0]}</div>
                </div>
                <div class="password-display" id="password-display">${'_'.repeat(this.password.length)}</div>
                <div class="guess-feedback" id="guess-feedback">Submit a guess to receive letter-by-letter forensic feedback.</div>
                <div class="password-input" id="password-input">${this.createInputs()}</div>
                <div class="puzzle-actions">
                    <button class="btn btn-primary" id="submit-password">SUBMIT</button>
                    <button class="btn" id="clear-password">CLEAR</button>
                </div>
                <div id="attempt-counter" style="text-align:center;margin-top:20px;color:var(--text-secondary);">
                    Attempts: <span style="color:var(--cyber-blue);">${this.attempts}</span> / ${this.maxAttempts}
                </div>
            </div>`;
        this.setupEventListeners();
    }

    // ─── multiSelect with optional pre-brief panel ───────────────────────────

    renderMultiSelectPuzzle(container) {
        const hasSaltDemo = this.puzzleData.saltDemoPanel && this.puzzleData.saltDemoPanel.enabled && !this.saltDemoCompleted;

        if (hasSaltDemo) {
            this.renderSaltDemoPanel(container);
        } else {
            this.renderMultiSelectGrid(container);
        }
    }

    renderHumanPsychologyLab(container) {
        this.visualizerElement = container;
        this.stopHumanLabMatrixAnimation();
        const story = this.session?.storyHint || this.mission.scenario || '';
        const options = this.session?.options || [];
        const weakCount = options.filter(opt => opt.isWeak).length;
        const threatBars = this.getHumanPsychologyThreatBars(options);
        const selectedCount = this.selectedOptions.size;
        const preview = this.getHumanLabPreviewMetrics(options);
        const shellConfig = this.getHumanLabShellConfig(options, weakCount);
        const hintsRemaining = Math.max(0, CONFIG.HINTS.MAX_HINTS_PER_MISSION - this.gameScreen.game.score.hintsUsed);
        const feedbackEl = document.getElementById('guess-feedback');
        const previousFeedback = feedbackEl ? feedbackEl.innerHTML : '';
        const objectives = Array.isArray(this.mission.objectives) && this.mission.objectives.length
            ? this.mission.objectives
            : [
                'Analyze the story-based investigative hint',
                'Identify weak passwords via human behavior patterns',
                'Classify credentials with SOC decision accuracy'
            ];
        const timeDisplay = this.gameScreen?.timer ? this.gameScreen.timer.getFormattedTime() : '00:00';
        const scoreDisplay = String(this.gameScreen?.game?.score?.getScore?.() || 0).padStart(3, '0');
        this.initializeHumanLabLog(options);
        const cardMarkup = options.map(opt => {
            const profile = this.getHumanPsychologyProfile(opt);
            const selected = this.selectedOptions.has(opt.id);
            return `
                <button class="l1-card c-card ${selected ? `selected ${opt.isWeak ? 'flagged' : 'clear'}` : ''}" data-option-id="${opt.id}" type="button">
                    <div class="l1-card__accent c-accent"></div>
                    <div class="l1-card__body c-body">
                        <div class="l1-card__top c-top">
                            <div class="l1-card__id c-user">${profile.sourceLabel}</div>
                            <div class="l1-card__state c-indicator">${selected ? (opt.isWeak ? 'FLAGGED' : 'SECURE') : 'READY'}</div>
                        </div>
                        <div class="l1-card__value c-password">${opt.value}</div>
                        <div class="l1-card__tags c-tags">${profile.tagsMarkup}</div>
                        <div class="l1-card__entropy c-entropy">
                            <div class="l1-card__entropy-track c-bar">
                                <div class="l1-card__entropy-fill c-fill ${profile.entropyClass}" style="width:${profile.strengthScore}%"></div>
                            </div>
                            <div class="l1-card__entropy-value c-pct">${profile.strengthScore}%</div>
                        </div>
                    </div>
                </button>`;
        }).join('');
        const threatMarkup = threatBars.map(bar => `
            <div class="l1-threat-row">
                <div class="l1-threat-top">
                    <span>${bar.label}</span>
                    <span class="tone-${bar.tone}">${bar.value}%</span>
                </div>
                <div class="l1-threat-track">
                    <div class="l1-threat-fill tone-${bar.tone}" style="width:${bar.value}%"></div>
                </div>
            </div>`).join('');
        const objectivesMarkup = objectives.map((objective, index) => `
            <div class="l1-objective ${index < 2 ? 'on' : ''}" data-human-objective="${index}">
                <div class="l1-objective__icon">${index < 2 ? '▸' : ''}</div>
                <div class="l1-objective__text">${objective}</div>
            </div>`).join('');
        const phaseMarkup = shellConfig.phases.map((phase, index) => `
                    ${index > 0 ? '<div class="l1-phase-sep">//</div>' : ''}
                    <div class="l1-phase ${index === 0 ? 'active' : ''}"><span class="l1-phase__dot"></span><strong>${String(index + 1).padStart(2, '0')}</strong>${phase}</div>
                `).join('');
        container.innerHTML = `
            ${this.renderHumanPsychologyLabStyles()}
            <div class="l1-shell">
                <canvas class="l1-matrix" id="l1-matrix" aria-hidden="true"></canvas>
                <div class="l1-crt" aria-hidden="true"></div>
                <div class="l1-scanline" aria-hidden="true"></div>

                <header class="l1-top-hud">
                    <div class="l1-hud-logo">
                        <div class="l1-logo-badge">⬡</div>
                        <div class="l1-logo-text">SHADOWDEF</div>
                    </div>
                    <div class="l1-hud-mission">
                        <div class="l1-hud-kicker">${shellConfig.kicker}</div>
                        <div class="l1-hud-title">${shellConfig.titleHtml}</div>
                    </div>
                    <div class="l1-hud-stats">
                        <div class="l1-hud-stat">
                            <div class="l1-hud-label">Time</div>
                            <div class="l1-hud-value" id="l1-timer">${timeDisplay}</div>
                        </div>
                        <div class="l1-hud-stat">
                            <div class="l1-hud-label">Score</div>
                            <div class="l1-hud-value l1-hud-value--cyan" id="l1-score">${scoreDisplay}</div>
                        </div>
                        <div class="l1-hud-stat">
                            <div class="l1-hud-label">Combo</div>
                            <div class="l1-hud-value l1-hud-value--red" id="l1-combo">x${preview.combo}</div>
                        </div>
                        <div class="l1-hud-meter">
                            <div class="l1-hud-label">XP</div>
                            <div class="l1-hud-track">
                                <div class="l1-hud-fill" id="l1-xp-fill" style="width:${preview.xpPercent}%"></div>
                            </div>
                        </div>
                    </div>
                    <div class="l1-hud-actions">
                        <button class="l1-hud-btn" data-action="pause" type="button">[ PAUSE ]</button>
                        <button class="l1-hud-btn" data-action="back-to-levels" type="button">[ BACK ]</button>
                    </div>
                </header>

                <div class="l1-mission-strip">
                    ${phaseMarkup}
                    <div class="l1-mission-status">
                        <span class="l1-mission-status__dot"></span>
                        ${shellConfig.missionStatus}
                    </div>
                </div>

                <div class="l1-body">
                    <section class="l1-arena">
                        <div class="l1-arena-header">
                            <div>
                                <div class="l1-arena-title">${shellConfig.arenaTitleHtml}</div>
                                <div class="l1-arena-sub">${shellConfig.arenaSub}</div>
                            </div>
                            <div class="l1-arena-hint">
                                ${shellConfig.arenaHintHtml}
                            </div>
                        </div>

                        <div class="l1-arena-scroll">
                            <div class="l1-grid" id="password-options-grid">${cardMarkup}</div>
                        </div>

                        <div class="l1-submit-dock">
                            <div class="l1-submit-cluster">
                                <span class="l1-submit-label">${shellConfig.flaggedLabel}</span>
                                <div class="l1-flag-slots" id="l1-flag-slots"></div>
                            </div>
                            <div class="l1-submit-cluster l1-submit-cluster--summary">
                                <div class="l1-submit-value ${preview.points < 0 ? 'neg' : ''}" id="ptsPreview">${preview.points >= 0 ? '+' : ''}${preview.points}</div>
                                <div class="l1-submit-points-label">Potential pts</div>
                            </div>
                            <div class="l1-submit-meta">
                                <div class="l1-attempts" id="attempt-counter">Submissions: <span>${this.attempts}</span> / ${this.maxAttempts}</div>
                            </div>
                            <button class="l1-btn l1-btn-primary l1-fire-btn" id="submit-selection" type="button" ${selectedCount === 0 ? 'disabled' : ''}>${shellConfig.submitLabel}</button>
                        </div>
                    </section>

                    <aside class="l1-console">
                        <section class="l1-console-panel">
                            <div class="l1-console-title">${shellConfig.threatTitle}</div>
                            <div class="l1-dial-wrap">
                                <svg class="l1-dial-svg" viewBox="0 0 140 140" aria-hidden="true">
                                    <circle class="l1-dial-bg" cx="70" cy="70" r="65"></circle>
                                    <circle class="l1-dial-ring" cx="70" cy="70" r="65" id="l1-dial-ring"></circle>
                                </svg>
                                <div class="l1-dial-inner">
                                    <div class="l1-dial-num" id="l1-dial-num">${selectedCount}</div>
                                    <div class="l1-dial-sub">${shellConfig.dialSub}</div>
                                </div>
                            </div>
                            <div class="l1-threat-bars">${threatMarkup}</div>
                        </section>

                        <section class="l1-console-panel">
                            <div class="l1-console-title">${shellConfig.objectivesTitle}</div>
                            <div class="l1-objective-list">${objectivesMarkup}</div>
                        </section>

                        <section class="l1-console-panel l1-console-panel--fill">
                            <div class="l1-console-head">
                                <div class="l1-console-title">${shellConfig.consoleTitle}</div>
                                <div class="l1-console-chip">HINTS <span id="l1-hints-remaining">${hintsRemaining}</span>/3</div>
                            </div>
                            <div class="l1-risk-row">
                                <span>${shellConfig.riskLabel}</span>
                                <div class="l1-risk-track">
                                    <div class="l1-risk-fill" id="risk-fill" style="width:${Math.max(0, Math.min(100, this.riskValue))}%;"></div>
                                </div>
                                <span class="l1-risk-text" id="risk-text">${Math.floor(this.riskValue)}%</span>
                            </div>
                            <div class="l1-feedback guess-feedback" id="guess-feedback">${previousFeedback || `Objective: ${this.mission.objective || 'Classify weak credentials.'}<br>Scenario: ${story}`}</div>
                            <div class="l1-hint-stack" id="password-hints"></div>
                            <div class="l1-log-body" id="l1-log-body">${this.renderHumanLabLogMarkup()}</div>
                        </section>
                    </aside>
                </div>
            </div>`;

        this.setupMultiSelectEventListeners();
        this.startHumanLabMatrixAnimation();
        this.updateHumanPsychologyLiveUI();
        this.updateRiskDisplay();
        this.updateAttemptCounter();
        this.gameScreen.syncEmbeddedMissionHUD();
    }

    renderBreachTriageLab(container) {
        this.visualizerElement = container;
        this.stopHumanLabMatrixAnimation();
        const options = this.session?.options || [];
        const cfg = this.getBreachTriageConfig();
        const shellConfig = this.getHumanLabShellConfig(options, cfg.resetBudget);
        const metrics = this.getBreachTriageMetrics(options);
        const threatBars = this.getBreachTriageThreatBars(metrics);
        const selected = this.getBreachTriageSelectedOption();
        const hintsRemaining = Math.max(0, CONFIG.HINTS.MAX_HINTS_PER_MISSION - this.gameScreen.game.score.hintsUsed);
        const feedbackEl = document.getElementById('guess-feedback');
        const previousFeedback = feedbackEl ? feedbackEl.innerHTML : '';
        const objectives = Array.isArray(this.mission.objectives) && this.mission.objectives.length
            ? this.mission.objectives
            : [
                'Inspect the breached credentials',
                'Queue the first reset wave',
                'Watchlist the second-wave suspects'
            ];
        const timeDisplay = this.gameScreen?.timer ? this.gameScreen.timer.getFormattedTime() : '00:00';
        const scoreDisplay = String(this.gameScreen?.game?.score?.getScore?.() || 0).padStart(3, '0');
        this.initializeHumanLabLog(options);

        const cardMarkup = options.map(option => {
            const profile = this.getHumanPsychologyProfile(option);
            const triage = option.triage || {};
            const decision = this.breachTriageAssignments.get(option.id) || 'pending';
            const isSelected = this.breachTriageSelectedId === option.id;
            const inspected = this.breachTriageInspectedIds.has(option.id);
            const stateLabel = decision === 'reset'
                ? 'P1 RESET'
                : decision === 'monitor'
                    ? 'WATCHLIST'
                    : inspected
                        ? 'REVIEWED'
                        : 'READY';

            return `
                <button class="l1-card bt-card ${isSelected ? 'selected' : ''} ${inspected ? 'reviewed' : ''} ${decision !== 'pending' ? `triage-${decision}` : ''}" data-triage-card="${option.id}" type="button">
                    <div class="l1-card__accent c-accent"></div>
                    <div class="l1-card__body c-body">
                        <div class="l1-card__top c-top">
                            <div class="l1-card__id c-user">${profile.sourceLabel}</div>
                            <div class="l1-card__state c-indicator">${stateLabel}</div>
                        </div>
                        <div class="l1-card__value c-password">${option.value}</div>
                        <div class="l1-card__tags c-tags">${profile.tagsMarkup}</div>
                        <div class="l1-card__entropy c-entropy">
                            <div class="l1-card__entropy-track c-bar">
                                <div class="l1-card__entropy-fill c-fill ${profile.entropyClass}" style="width:${profile.strengthScore}%"></div>
                            </div>
                            <div class="l1-card__entropy-value c-pct">${profile.strengthScore}%</div>
                        </div>
                        <div class="bt-card__meta">
                            <span>${triage.observedReuse || triage.reuseLabel || 'Reuse unknown'}</span>
                            <span>${triage.privilegeTier || 'Mixed access'}</span>
                        </div>
                        <div class="bt-card__footer">${triage.priorityCue || profile.note}</div>
                    </div>
                </button>`;
        }).join('');

        const threatMarkup = threatBars.map(bar => `
            <div class="l1-threat-row">
                <div class="l1-threat-top">
                    <span>${bar.label}</span>
                    <span class="tone-${bar.tone}">${bar.value}%</span>
                </div>
                <div class="l1-threat-track">
                    <div class="l1-threat-fill tone-${bar.tone}" style="width:${bar.value}%"></div>
                </div>
            </div>`).join('');

        const objectivesMarkup = objectives.map((objective, index) => `
            <div class="l1-objective ${index === 0 ? 'on' : ''}" data-triage-objective="${index}">
                <div class="l1-objective__icon">${index === 0 ? '▸' : ''}</div>
                <div class="l1-objective__text">${objective}</div>
            </div>`).join('');

        const phaseMarkup = shellConfig.phases.map((phase, index) => `
                    ${index > 0 ? '<div class="l1-phase-sep">//</div>' : ''}
                    <div class="l1-phase ${index === 0 ? 'active' : ''}"><span class="l1-phase__dot"></span><strong>${String(index + 1).padStart(2, '0')}</strong>${phase}</div>
                `).join('');

        container.innerHTML = `
            ${this.renderHumanPsychologyLabStyles()}
            ${this.renderBreachTriageStyles()}
            <div class="l1-shell">
                <canvas class="l1-matrix" id="l1-matrix" aria-hidden="true"></canvas>
                <div class="l1-crt" aria-hidden="true"></div>
                <div class="l1-scanline" aria-hidden="true"></div>

                <header class="l1-top-hud">
                    <div class="l1-hud-logo">
                        <div class="l1-logo-badge">⬡</div>
                        <div class="l1-logo-text">SHADOWDEF</div>
                    </div>
                    <div class="l1-hud-mission">
                        <div class="l1-hud-kicker">${shellConfig.kicker}</div>
                        <div class="l1-hud-title">${shellConfig.titleHtml}</div>
                    </div>
                    <div class="l1-hud-stats">
                        <div class="l1-hud-stat">
                            <div class="l1-hud-label">Time</div>
                            <div class="l1-hud-value" id="l1-timer">${timeDisplay}</div>
                        </div>
                        <div class="l1-hud-stat">
                            <div class="l1-hud-label">Score</div>
                            <div class="l1-hud-value l1-hud-value--cyan" id="l1-score">${scoreDisplay}</div>
                        </div>
                        <div class="l1-hud-stat">
                            <div class="l1-hud-label">Inspects</div>
                            <div class="l1-hud-value l1-hud-value--red" id="l1-combo">${metrics.inspectedCount}/${cfg.inspectGoal}</div>
                        </div>
                        <div class="l1-hud-meter">
                            <div class="l1-hud-label">Plan</div>
                            <div class="l1-hud-track">
                                <div class="l1-hud-fill" id="l1-xp-fill" style="width:${metrics.planReadiness}%"></div>
                            </div>
                        </div>
                    </div>
                    <div class="l1-hud-actions">
                        <button class="l1-hud-btn" data-action="pause" type="button">[ PAUSE ]</button>
                        <button class="l1-hud-btn" data-action="back-to-levels" type="button">[ BACK ]</button>
                    </div>
                </header>

                <div class="l1-mission-strip">
                    ${phaseMarkup}
                    <div class="l1-mission-status">
                        <span class="l1-mission-status__dot"></span>
                        ${shellConfig.missionStatus}
                    </div>
                </div>

                <div class="l1-body">
                    <section class="l1-arena">
                        <div class="l1-arena-header">
                            <div>
                                <div class="l1-arena-title">${shellConfig.arenaTitleHtml}</div>
                                <div class="l1-arena-sub">${shellConfig.arenaSub}</div>
                            </div>
                            <div class="l1-arena-hint">${shellConfig.arenaHintHtml}</div>
                        </div>

                        <div class="l1-arena-scroll">
                            <div class="l1-grid" id="password-options-grid">${cardMarkup}</div>
                        </div>

                        <div class="l1-submit-dock bt-submit-dock">
                            <div class="l1-submit-cluster">
                                <span class="l1-submit-label">P1 Reset</span>
                                <div class="l1-flag-slots" id="bt-reset-slots"></div>
                            </div>
                            <div class="l1-submit-cluster">
                                <span class="l1-submit-label">Watchlist</span>
                                <div class="l1-flag-slots" id="bt-monitor-slots"></div>
                            </div>
                            <div class="l1-submit-cluster l1-submit-cluster--summary">
                                <div class="l1-submit-value ${metrics.planReadiness < 60 ? 'neg' : ''}" id="bt-plan-score">${metrics.planReadiness}%</div>
                                <div class="l1-submit-points-label">Plan readiness</div>
                            </div>
                            <div class="l1-submit-meta">
                                <div class="l1-attempts" id="attempt-counter">Reset waves: <span>${this.attempts}</span> / ${this.maxAttempts}</div>
                            </div>
                            <button class="bt-clear-btn" id="bt-clear-plan" type="button">CLEAR PLAN</button>
                            <button class="l1-btn l1-btn-primary l1-fire-btn" id="submit-selection" type="button">EXECUTE RESET WAVE</button>
                        </div>
                    </section>

                    <aside class="l1-console">
                        <section class="l1-console-panel">
                            <div class="l1-console-title">${shellConfig.threatTitle}</div>
                            <div class="l1-dial-wrap">
                                <svg class="l1-dial-svg" viewBox="0 0 140 140" aria-hidden="true">
                                    <circle class="l1-dial-bg" cx="70" cy="70" r="65"></circle>
                                    <circle class="l1-dial-ring" cx="70" cy="70" r="65" id="l1-dial-ring"></circle>
                                </svg>
                                <div class="l1-dial-inner">
                                    <div class="l1-dial-num" id="l1-dial-num">${metrics.selectedReset.length}</div>
                                    <div class="l1-dial-sub">${shellConfig.dialSub}</div>
                                </div>
                            </div>
                            <div class="l1-threat-bars">${threatMarkup}</div>
                        </section>

                        <section class="l1-console-panel">
                            <div class="l1-console-title">${shellConfig.objectivesTitle}</div>
                            <div class="l1-objective-list">${objectivesMarkup}</div>
                        </section>

                        <section class="l1-console-panel l1-console-panel--fill">
                            <div class="l1-console-head">
                                <div class="l1-console-title">${shellConfig.consoleTitle}</div>
                                <div class="l1-console-chip">HINTS <span id="l1-hints-remaining">${hintsRemaining}</span>/3</div>
                            </div>
                            <div class="bt-selected-panel" id="bt-selected-panel">${this.renderBreachTriageSelectedPanel(selected, metrics)}</div>
                            <div class="l1-risk-row">
                                <span>${shellConfig.riskLabel}</span>
                                <div class="l1-risk-track">
                                    <div class="l1-risk-fill" id="risk-fill" style="width:${Math.max(0, Math.min(100, this.riskValue))}%;"></div>
                                </div>
                                <span class="l1-risk-text" id="risk-text">${Math.floor(this.riskValue)}%</span>
                            </div>
                            <div class="l1-feedback guess-feedback" id="guess-feedback">${previousFeedback || `<div><strong>Objective:</strong> ${this.mission.objective || 'Triages the breached credentials.'}</div><div><strong>Scenario:</strong> ${this.dynamicScenario || this.mission.scenario || ''}</div><div><strong>Execution rule:</strong> Inspect at least ${cfg.inspectGoal} credentials, queue ${cfg.resetBudget} immediate resets, and watchlist ${cfg.monitorGoal} second-wave suspects.</div>`}</div>
                            <div class="l1-hint-stack" id="password-hints"></div>
                            <div class="l1-log-body" id="l1-log-body">${this.renderHumanLabLogMarkup()}</div>
                        </section>
                    </aside>
                </div>
            </div>`;

        this.setupBreachTriageEventListeners();
        this.startHumanLabMatrixAnimation();
        this.updateBreachTriageLiveUI();
        this.updateRiskDisplay();
        this.updateAttemptCounter();
        this.gameScreen.syncEmbeddedMissionHUD();
    }

    renderBreachTriageSelectedPanel(selected, metrics) {
        const cfg = this.getBreachTriageConfig();
        const copy = this.getBreachTriageCopyConfig();
        if (!selected) {
            return `<div class="bt-selected-empty">Select a recovered credential to inspect its reuse spread, privilege reach, and reset priority.</div>`;
        }

        const triage = selected.triage || {};
        const currentDecision = this.breachTriageAssignments.get(selected.id) || 'pending';
        const decisionLabel = currentDecision === 'reset'
            ? 'P1 RESET'
            : currentDecision === 'monitor'
                ? 'WATCHLIST'
                : 'UNASSIGNED';
        const resetLocked = metrics.selectedReset.length >= cfg.resetBudget && currentDecision !== 'reset';
        const monitorLocked = cfg.monitorBudget > 0 && metrics.selectedMonitor.length >= cfg.monitorBudget && currentDecision !== 'monitor';

        return `
            <div class="bt-selected-card">
                <div class="bt-selected-head">
                    <div>
                        <div class="bt-selected-kicker">Selected Credential</div>
                        <div class="bt-selected-title">${selected.value}</div>
                    </div>
                    <div class="bt-selected-state bt-selected-state--${currentDecision}">${decisionLabel}</div>
                </div>
                <div class="bt-selected-grid">
                    <div class="bt-selected-metric"><span>Observed Reuse</span><strong>${triage.observedReuse || 'Unknown'}</strong></div>
                    <div class="bt-selected-metric"><span>Privilege Spread</span><strong>${triage.privilegeSpread || triage.privilegeTier || 'Unknown'}</strong></div>
                    <div class="bt-selected-metric"><span>Department Spread</span><strong>${triage.departmentSpread || 'Mixed'}</strong></div>
                    <div class="bt-selected-metric"><span>Attack Velocity</span><strong>${triage.attackVelocity || 'Under review'}</strong></div>
                </div>
                <div class="bt-selected-list">
                    <div><strong>Priority cue:</strong> ${triage.priorityCue || 'Investigate reuse evidence before assigning a reset action.'}</div>
                    <div><strong>Analyst note:</strong> ${triage.analystNote || triage.priorityCue || 'No analyst note attached.'}</div>
                    <div><strong>Operational guidance:</strong> ${triage.guidance || 'Use P1 only for the credentials with the widest compromise radius.'}</div>
                </div>
                <div class="bt-action-row">
                    <button class="bt-action bt-action--reset" data-triage-action="reset" type="button" ${this.isComplete || resetLocked ? 'disabled' : ''}>QUEUE P1 RESET</button>
                    <button class="bt-action bt-action--monitor" data-triage-action="monitor" type="button" ${this.isComplete || monitorLocked ? 'disabled' : ''}>WATCHLIST</button>
                    <button class="bt-action bt-action--clear" data-triage-action="clear" type="button" ${this.isComplete || currentDecision === 'pending' ? 'disabled' : ''}>CLEAR TAG</button>
                </div>
                <div class="bt-selected-note">${copy.correctResetLabel}: ${metrics.expectedReset.length} total · ${copy.correctMonitorLabel}: ${cfg.monitorGoal} required</div>
            </div>`;
    }

    renderBreachTriageStyles() {
        return `
            <style>
                .bt-card{transform:none}
                .bt-card.reviewed{border-color:rgba(23,216,255,.24)}
                .bt-card.selected{border-color:var(--l1-cyan)!important;box-shadow:-4px 0 0 rgba(23,216,255,.48),0 0 28px rgba(23,216,255,.12)!important}
                .bt-card.triage-reset{border-color:var(--l1-red);background:rgba(22,4,14,.96);box-shadow:0 0 0 1px rgba(255,63,120,.22) inset,0 0 28px rgba(255,63,120,.14)}
                .bt-card.triage-monitor{border-color:var(--l1-gold);background:rgba(22,16,3,.96);box-shadow:0 0 0 1px rgba(255,204,0,.18) inset,0 0 24px rgba(255,204,0,.08)}
                .bt-card.triage-reset .l1-card__accent{background:var(--l1-red);box-shadow:0 0 10px rgba(255,63,120,.42)}
                .bt-card.triage-monitor .l1-card__accent{background:var(--l1-gold)}
                .bt-card__meta{display:flex;justify-content:space-between;gap:8px;margin-top:8px;font-size:9px;letter-spacing:1px;color:var(--l1-text-mid);text-transform:uppercase}
                .bt-card__footer{margin-top:10px;font-size:10px;line-height:1.5;color:var(--l1-text-mid)}
                .bt-submit-dock{row-gap:12px}
                .bt-clear-btn{border:1px solid var(--l1-rim2);background:transparent;color:var(--l1-text);font-family:'Courier Prime','Share Tech Mono',monospace;font-size:10px;letter-spacing:2px;padding:12px 18px;cursor:pointer;transition:all .2s ease}
                .bt-clear-btn:hover{border-color:var(--l1-cyan);color:var(--l1-cyan);box-shadow:0 0 18px rgba(23,216,255,.12)}
                .bt-selected-panel{margin-bottom:14px}
                .bt-selected-empty{padding:14px;border:1px solid rgba(23,216,255,.1);background:rgba(2,10,24,.82);color:var(--l1-text-mid);line-height:1.6;font-size:11px}
                .bt-selected-card{padding:14px;border:1px solid rgba(23,216,255,.1);background:rgba(2,10,24,.82);display:grid;gap:12px}
                .bt-selected-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}
                .bt-selected-kicker{font-size:9px;letter-spacing:2px;color:var(--l1-text-low);text-transform:uppercase}
                .bt-selected-title{font-family:'Teko',sans-serif;font-size:32px;line-height:1;color:var(--l1-cyan);letter-spacing:2px;word-break:break-all;text-shadow:0 0 10px rgba(23,216,255,.18)}
                .bt-selected-state{padding:6px 10px;border:1px solid rgba(23,216,255,.2);font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--l1-text-mid)}
                .bt-selected-state--reset{border-color:rgba(255,63,120,.32);color:#ffd5e2;background:rgba(255,63,120,.08)}
                .bt-selected-state--monitor{border-color:rgba(255,204,0,.32);color:#ffedb2;background:rgba(255,204,0,.08)}
                .bt-selected-state--pending,.bt-selected-state--clear{border-color:rgba(23,216,255,.18);color:var(--l1-text-mid)}
                .bt-selected-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
                .bt-selected-metric{padding:10px;border:1px solid rgba(23,216,255,.08);background:rgba(23,216,255,.03)}
                .bt-selected-metric span{display:block;font-size:9px;letter-spacing:2px;color:var(--l1-text-low);text-transform:uppercase}
                .bt-selected-metric strong{display:block;margin-top:6px;color:var(--l1-white);font-size:13px;line-height:1.45}
                .bt-selected-list{display:grid;gap:8px;font-size:11px;line-height:1.6;color:var(--l1-text)}
                .bt-selected-list strong{color:var(--l1-cyan)}
                .bt-selected-note{font-size:9px;letter-spacing:1px;color:var(--l1-text-low);text-transform:uppercase}
                .bt-action-row{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
                .bt-action{padding:11px 10px;border:1px solid rgba(23,216,255,.16);background:rgba(23,216,255,.03);color:var(--l1-white);font-size:10px;letter-spacing:2px;text-transform:uppercase;cursor:pointer;transition:all .2s ease}
                .bt-action:hover{transform:translateY(-1px)}
                .bt-action:disabled{opacity:.38;cursor:not-allowed;transform:none}
                .bt-action--reset{border-color:rgba(255,63,120,.3);background:rgba(255,63,120,.08)}
                .bt-action--monitor{border-color:rgba(255,204,0,.3);background:rgba(255,204,0,.08)}
                .bt-action--clear{border-color:rgba(23,216,255,.18)}
                .l1-flag-slot.slot-reset{border-color:rgba(255,63,120,.36);background:rgba(255,63,120,.08);color:#ffd4e1}
                .l1-flag-slot.slot-monitor{border-color:rgba(255,204,0,.36);background:rgba(255,204,0,.08);color:#ffedb2}
                @media (max-width:760px){.bt-action-row,.bt-selected-grid{grid-template-columns:1fr}.bt-clear-btn{width:100%}}
            </style>`;
    }

    getHumanLabShellConfig(options = [], weakCount = 0) {
        const missionLevel = String(this.mission?.level || 1).padStart(2, '0');
        const shell = this.puzzleData.labShell || {};

        return {
            kicker: shell.kicker || `// LEVEL ${missionLevel} - CAMPAIGN ALPHA`,
            titleHtml: shell.titleHtml || 'HUMAN PASSWORD<br>PSYCHOLOGY',
            phases: Array.isArray(shell.phases) && shell.phases.length
                ? shell.phases.slice(0, 3)
                : ['RECOVERED SET', 'BEHAVIORAL FILTER', 'WEAKNESS CLASSIFIER'],
            missionStatus: shell.missionStatus || 'ANALYST LAB ACTIVE',
            arenaTitleHtml: shell.arenaTitleHtml || 'SELECT<br>EVERY<br><span>WEAK</span>PASSWORD',
            arenaSub: shell.arenaSub || `// ${options.length} credentials recovered · identify ${weakCount} vulnerabilities`,
            arenaHintHtml: shell.arenaHintHtml || 'Flag passwords predictable via <b>breach lists</b>, <b>common patterns</b>, or <b>public info</b>',
            flaggedLabel: shell.flaggedLabel || 'Flagged',
            submitLabel: shell.submitLabel || 'BREACH REPORT',
            threatTitle: shell.threatTitle || 'Threat Exposure Index',
            objectivesTitle: shell.objectivesTitle || 'Mission Objectives',
            consoleTitle: shell.consoleTitle || 'System Terminal',
            riskLabel: shell.riskLabel || 'Risk Meter',
            dialSub: shell.dialSub || 'FLAGGED'
        };
    }

    getHumanLabCopyConfig() {
        const copy = this.puzzleData.multiSelectCopy || {};

        return {
            reviewTitle: copy.reviewTitle || 'Analyst Review',
            reviewSummary: copy.reviewSummary || 'The board is not classified correctly yet.',
            targetCountLabel: copy.targetCountLabel || 'Weak passwords in this set',
            yourFlaggedCountLabel: copy.yourFlaggedCountLabel || 'Your flagged count',
            missedLabel: copy.missedLabel || 'Missed predictable passwords',
            falsePositiveLabel: copy.falsePositiveLabel || 'Strong passwords incorrectly flagged',
            genericMismatchFeedback: copy.genericMismatchFeedback || 'Selection pattern does not fully align with observed human-risk behaviors.',
            genericNotification: copy.genericNotification || 'Classification mismatch detected. Reassess behavioral indicators.',
            correctSelectionLabel: copy.correctSelectionLabel || 'Correct weak passwords',
            successTitle: copy.successTitle || 'Weak credential set identified',
            failureTitle: copy.failureTitle || 'Attacker shortcut missed',
            successLog: copy.successLog || 'Weak credential set isolated. Containment report ready for command review.',
            failureLog: copy.failureLog || 'Attacker shortcut preserved. Analyst board closed with unresolved exposure.'
        };
    }

    getBreachTriageConfig() {
        const cfg = this.puzzleData.breachTriageLab || {};
        const resetBudget = Math.max(1, Number(cfg.resetBudget || 4));
        const monitorBudget = Math.max(0, Number(cfg.monitorBudget ?? 3));
        const monitorGoal = Math.max(0, Math.min(monitorBudget, Number(cfg.monitorGoal ?? Math.min(2, monitorBudget))));
        const inspectGoal = Math.max(1, Number(cfg.inspectGoal || 6));

        return { resetBudget, monitorBudget, monitorGoal, inspectGoal };
    }

    getBreachTriageCopyConfig() {
        const copy = this.puzzleData.triageCopy || {};

        return {
            inspectGate: copy.inspectGate || 'Inspect more credentials before executing the reset wave.',
            resetGate: copy.resetGate || 'Use every P1 reset slot before executing the first wave.',
            reviewTitle: copy.reviewTitle || 'IR Review',
            reviewSummary: copy.reviewSummary || 'The current triage plan still leaves high-blast passwords exposed.',
            resetMissedLabel: copy.resetMissedLabel || 'Critical reset targets missed',
            resetFalsePositiveLabel: copy.resetFalsePositiveLabel || 'Low-priority credentials escalated',
            monitorCoveredLabel: copy.monitorCoveredLabel || 'Watchlist coverage',
            inspectCoverageLabel: copy.inspectCoverageLabel || 'Credentials inspected',
            successTitle: copy.successTitle || 'Reset wave approved',
            failureTitle: copy.failureTitle || 'Reset wave failed',
            genericNotification: copy.genericNotification || 'Reset wave mismatch detected. Reassess blast-radius indicators.',
            successLog: copy.successLog || 'Reset wave approved. Highest blast-radius credentials isolated for emergency rotation.',
            failureLog: copy.failureLog || 'Reset wave failed. Shared-risk credentials remained available to the attacker.',
            correctResetLabel: copy.correctResetLabel || 'Correct P1 reset targets',
            correctMonitorLabel: copy.correctMonitorLabel || 'Correct watchlist targets'
        };
    }

    getBreachTriageSelectedOption() {
        return (this.session?.options || []).find(option => option.id === this.breachTriageSelectedId) || null;
    }

    getBreachTriageMetrics(options = []) {
        const cfg = this.getBreachTriageConfig();
        const selectedReset = options.filter(option => this.breachTriageAssignments.get(option.id) === 'reset');
        const selectedMonitor = options.filter(option => this.breachTriageAssignments.get(option.id) === 'monitor');
        const expectedReset = options.filter(option => option.expectedAction === 'reset');
        const expectedMonitor = options.filter(option => option.expectedAction === 'monitor');
        const correctReset = selectedReset.filter(option => option.expectedAction === 'reset');
        const falseReset = selectedReset.filter(option => option.expectedAction !== 'reset');
        const correctMonitor = selectedMonitor.filter(option => option.expectedAction === 'monitor');
        const falseMonitor = selectedMonitor.filter(option => option.expectedAction !== 'monitor');
        const missedReset = expectedReset.filter(option => this.breachTriageAssignments.get(option.id) !== 'reset');
        const missedMonitor = expectedMonitor.filter(option => this.breachTriageAssignments.get(option.id) !== 'monitor');
        const inspectedCount = this.breachTriageInspectedIds.size;
        const inspectProgress = Math.round(Math.min(100, (inspectedCount / Math.max(1, cfg.inspectGoal)) * 100));
        const resetProgress = Math.round(Math.min(100, (selectedReset.length / Math.max(1, cfg.resetBudget)) * 100));
        const monitorProgress = cfg.monitorBudget > 0
            ? Math.round(Math.min(100, (selectedMonitor.length / Math.max(1, cfg.monitorBudget)) * 100))
            : 100;
        const planReadiness = Math.round((inspectProgress * 0.35) + (resetProgress * 0.45) + (monitorProgress * 0.20));
        const accuracyScore = Math.max(
            0,
            100
                - (falseReset.length * 28)
                - (missedReset.length * 24)
                - (falseMonitor.length * 12)
                - (Math.max(0, cfg.monitorGoal - correctMonitor.length) * 8)
        );

        return {
            selectedReset,
            selectedMonitor,
            expectedReset,
            expectedMonitor,
            correctReset,
            falseReset,
            correctMonitor,
            falseMonitor,
            missedReset,
            missedMonitor,
            inspectedCount,
            inspectProgress,
            resetProgress,
            monitorProgress,
            planReadiness,
            accuracyScore
        };
    }

    getBreachTriageThreatBars(metrics) {
        const cfg = this.getBreachTriageConfig();
        const monitorCoverage = cfg.monitorGoal > 0
            ? Math.round(Math.min(100, (metrics.correctMonitor.length / cfg.monitorGoal) * 100))
            : 100;

        return [
            {
                label: 'P1 Reset Queue',
                value: Math.min(100, metrics.resetProgress),
                tone: metrics.falseReset.length ? 'danger' : metrics.selectedReset.length >= cfg.resetBudget ? 'safe' : 'warn'
            },
            {
                label: 'Watch Coverage',
                value: monitorCoverage,
                tone: metrics.falseMonitor.length ? 'danger' : metrics.correctMonitor.length >= cfg.monitorGoal ? 'safe' : 'warn'
            },
            {
                label: 'Inspection Coverage',
                value: Math.min(100, metrics.inspectProgress),
                tone: metrics.inspectedCount >= cfg.inspectGoal ? 'safe' : 'warn'
            },
            {
                label: 'Queue Accuracy',
                value: Math.min(100, metrics.accuracyScore),
                tone: metrics.accuracyScore >= 85 ? 'safe' : metrics.accuracyScore >= 60 ? 'warn' : 'danger'
            }
        ];
    }

    getHumanPsychologyProfile(option) {
        const tags = Array.isArray(option?.tags) ? option.tags : [];
        const profile = option?.profile || {};
        const has = tag => tags.includes(tag);
        let riskLabel = 'RESILIENT';
        let riskClass = 'low';
        let note = 'Longer, less personal, or more random credentials are slower to predict.';
        let crackWindow = 'days to years';
        let attackerLens = 'No immediate shortcut';
        let strengthScore = 84;
        let sourceLabel = profile.sourceLabel || option?.sourceLabel || 'Recovered signal';

        if (option?.isWeak && (has('name_year') || has('osint'))) {
            riskLabel = 'OSINT RISK';
            riskClass = 'high';
            note = 'Looks tied to identity data an attacker could gather from public profiles.';
            crackWindow = 'seconds to minutes';
            attackerLens = 'Public profile + year';
            strengthScore = 16;
            sourceLabel = 'Public profile leak';
        } else if (option?.isWeak && (has('common') || has('leaked'))) {
            riskLabel = 'LEAKED LIST';
            riskClass = 'high';
            note = 'This resembles entries that appear in breach wordlists and crack quickly.';
            crackWindow = 'seconds';
            attackerLens = 'Known breach wordlist';
            strengthScore = 10;
            sourceLabel = 'Breach intel archive';
        } else if (option?.isWeak) {
            riskLabel = 'PATTERNED';
            riskClass = 'mid';
            note = 'Predictable structure makes this easier to guess than it first appears.';
            crackWindow = 'minutes to hours';
            attackerLens = 'Pattern guessing';
            strengthScore = 34;
            sourceLabel = 'Pattern cluster';
        } else if (has('random')) {
            riskLabel = 'RANDOMIZED';
            riskClass = 'low';
            note = 'Randomized composition breaks the normal human-guessing shortcuts.';
            crackWindow = 'months+';
            attackerLens = 'No cheap shortcut';
            strengthScore = 96;
            sourceLabel = 'Entropy-forward build';
        } else if (has('passphrase')) {
            riskLabel = 'PASSPHRASE';
            riskClass = 'low';
            note = 'Long passphrases resist fast guessing better than short personal passwords.';
            crackWindow = 'weeks to months';
            attackerLens = 'Length beats guessing';
            strengthScore = 82;
            sourceLabel = 'Passphrase lane';
        }

        if (option?.sourceLabel) sourceLabel = option.sourceLabel;
        if (profile.sourceLabel) sourceLabel = profile.sourceLabel;
        if (option?.riskLabel || profile.riskLabel) riskLabel = profile.riskLabel || option.riskLabel;
        if (option?.riskClass || profile.riskClass) riskClass = profile.riskClass || option.riskClass;
        if (option?.profileNote || profile.note) note = profile.note || option.profileNote;
        if (option?.crackWindow || profile.crackWindow) crackWindow = profile.crackWindow || option.crackWindow;
        if (option?.attackerLens || profile.attackerLens) attackerLens = profile.attackerLens || option.attackerLens;
        if (Number.isFinite(Number(profile.strengthScore ?? option?.strengthScore))) {
            strengthScore = Math.max(4, Math.min(99, Number(profile.strengthScore ?? option.strengthScore)));
        }

        const entropyClass = strengthScore < 40 ? 'low' : strengthScore < 70 ? 'mid' : 'high';
        const tagTone = {
            leaked: 'danger',
            common: 'danger',
            name_year: 'danger',
            osint: 'danger',
            shared_reset: 'danger',
            privileged: 'danger',
            pattern: 'warn',
            company_number: 'warn',
            keyboard: 'warn',
            sequence: 'warn',
            seasonal: 'warn',
            role: 'warn',
            passphrase: 'safe',
            random: 'safe',
            strong: 'safe'
        };
        const tagsMarkup = (tags.length ? tags : ['unclassified'])
            .map(tag => `<span class="l1-tag l1-tag--${tagTone[tag] || 'neutral'}">${tag.replace(/_/g, ' ')}</span>`)
            .join('');

        return { riskLabel, riskClass, note, tagsMarkup, crackWindow, attackerLens, strengthScore, entropyClass, sourceLabel };
    }

    getHumanPsychologyBoardSummary(options = []) {
        const summary = { osint: 0, leaked: 0, patterned: 0, resilient: 0 };
        options.forEach(option => {
            const tags = Array.isArray(option?.tags) ? option.tags : [];
            if (option?.isWeak && (tags.includes('name_year') || tags.includes('osint'))) summary.osint++;
            else if (option?.isWeak && (tags.includes('common') || tags.includes('leaked'))) summary.leaked++;
            else if (option?.isWeak) summary.patterned++;
            else summary.resilient++;
        });
        return summary;
    }

    getHumanPsychologyThreatBars(options = []) {
        const total = Math.max(1, options.length);
        const customBars = Array.isArray(this.puzzleData.humanLabThreatBars) ? this.puzzleData.humanLabThreatBars : [];

        if (customBars.length) {
            return customBars.map(bar => {
                const matches = options.filter(option => {
                    const tags = Array.isArray(option?.tags) ? option.tags : [];
                    const tagMatch = Array.isArray(bar.tagsAny) && bar.tagsAny.length
                        ? bar.tagsAny.some(tag => tags.includes(tag))
                        : false;
                    if (!tagMatch) return false;
                    if (bar.matchWeakOnly && !option?.isWeak) return false;
                    if (bar.matchStrongOnly && option?.isWeak) return false;
                    return true;
                }).length;

                return {
                    label: bar.label || 'Threat Surface',
                    value: Math.round((matches / total) * 100),
                    tone: bar.tone || 'warn'
                };
            });
        }

        const count = matcher => options.filter(option => matcher(Array.isArray(option?.tags) ? option.tags : [])).length;

        return [
            {
                label: 'Dictionary Attack',
                value: Math.round((count(tags => tags.includes('common') || tags.includes('leaked')) / total) * 100),
                tone: 'danger'
            },
            {
                label: 'Credential Stuffing',
                value: Math.round((count(tags => tags.includes('leaked') || tags.includes('common') || tags.includes('company_number')) / total) * 100),
                tone: 'warn'
            },
            {
                label: 'Pattern Brute Force',
                value: Math.round((count(tags => tags.includes('pattern') || tags.includes('keyboard') || tags.includes('sequence') || tags.includes('company_number')) / total) * 100),
                tone: 'warn'
            },
            {
                label: 'OSINT Targeting',
                value: Math.round((count(tags => tags.includes('name_year') || tags.includes('osint')) / total) * 100),
                tone: 'safe'
            }
        ];
    }

    getHumanLabPreviewMetrics(options = []) {
        const weakCount = Math.max(1, options.filter(option => option.isWeak).length);
        const selected = options.filter(option => this.selectedOptions.has(option.id));
        const correct = selected.filter(option => option.isWeak).length;
        const wrong = selected.length - correct;
        const combo = wrong === 0 ? Math.max(1, Math.min(correct || selected.length || 1, 5)) : 1;
        const points = (correct * 100 * combo) - (wrong * 50);
        const xpPercent = Math.min(100, Math.round((selected.length / weakCount) * 100));

        return {
            weakCount,
            correct,
            wrong,
            combo,
            points,
            xpPercent
        };
    }

    initializeHumanLabLog(options = []) {
        if (this.humanLabLogEntries.length) return;

        const customLogs = Array.isArray(this.puzzleData.humanLabInitialLogs) ? this.puzzleData.humanLabInitialLogs : [];
        if (customLogs.length) {
            const labels = { sys: 'SYS', warn: 'WARN', ok: 'OK', danger: 'ALERT' };
            this.humanLabLogEntries = customLogs.map(entry => ({
                time: entry.time || '[00:00]',
                tone: entry.tone || 'sys',
                label: labels[entry.tone] || 'SYS',
                message: entry.message || ''
            }));
            return;
        }

        const weakCount = options.filter(option => option.isWeak).length;
        this.humanLabLogEntries = [
            { time: '[00:00]', tone: 'sys', label: 'SYS', message: 'Session initialized. Analyst HUD synced with recovered credential board.' },
            { time: '[00:00]', tone: 'warn', label: 'WARN', message: `${weakCount} high-risk human patterns embedded in this recovered set.` },
            { time: '[00:00]', tone: 'sys', label: 'SYS', message: 'Awaiting analyst classification...' }
        ];
    }

    formatHumanLabClock() {
        const elapsed = this.gameScreen?.timer?.getElapsed?.() || 0;
        const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
        const secs = String(elapsed % 60).padStart(2, '0');
        return `[${mins}:${secs}]`;
    }

    pushHumanLabLog(tone, message) {
        if (!this.isHumanLabShellMode()) return;

        const labels = {
            sys: 'SYS',
            warn: 'WARN',
            ok: 'OK',
            danger: 'ALERT'
        };

        this.humanLabLogEntries.push({
            time: this.formatHumanLabClock(),
            tone,
            label: labels[tone] || 'SYS',
            message
        });
        this.humanLabLogEntries = this.humanLabLogEntries.slice(-10);
        this.renderHumanLabLog();
    }

    renderHumanLabLogMarkup() {
        return this.humanLabLogEntries.map((entry, index) => `
            <span class="l1-log-line">
                <span class="l1-log-time">${entry.time}</span>
                <span class="l1-log-${entry.tone}">${entry.label}</span>
                — ${entry.message}${index === this.humanLabLogEntries.length - 1 ? '<span class="l1-log-cursor"></span>' : ''}
            </span>`).join('');
    }

    renderHumanLabLog() {
        const logBody = document.getElementById('l1-log-body');
        if (!logBody) return;
        logBody.innerHTML = this.renderHumanLabLogMarkup();
        logBody.scrollTop = logBody.scrollHeight;
    }

    startHumanLabMatrixAnimation() {
        const canvas = document.getElementById('l1-matrix');
        if (!canvas) return;

        this.stopHumanLabMatrixAnimation();

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const levelSpeedMultiplier = Number(this.mission?.level === 1 ? 1.25 : 1);
        const makeBinaryText = () => {
            const len = 2 + Math.floor(Math.random() * 5);
            let text = '';
            for (let i = 0; i < len; i += 1) {
                text += Math.random() > 0.5 ? '1' : '0';
            }
            return text;
        };
        const createSprite = (width, height, spawnAbove = false) => ({
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
            this.humanLabMatrixDrops = Array.from({ length: spriteCount }, () => createSprite(width, height, false));
        };

        resize();
        this.humanLabMatrixResizeHandler = resize;
        window.addEventListener('resize', this.humanLabMatrixResizeHandler);

        let lastFrame = performance.now();
        const draw = (timestamp = performance.now()) => {
            if (!canvas.width || !canvas.height) {
                lastFrame = timestamp;
                this.humanLabMatrixFrame = window.requestAnimationFrame(draw);
                return;
            }

            const delta = Math.min(40, timestamp - lastFrame);
            lastFrame = timestamp;

            ctx.fillStyle = 'rgba(2, 6, 16, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.textBaseline = 'top';
            ctx.textAlign = 'left';

            this.humanLabMatrixDrops.forEach((sprite, index) => {
                const step = delta * 0.06;
                sprite.y += sprite.fall * step * 60;
                sprite.x += Math.sin(timestamp * 0.00055 + sprite.wobble) * sprite.drift;

                ctx.font = `bold ${sprite.size}px Consolas, "Courier New", monospace`;
                ctx.fillStyle = `rgba(150, 236, 255, ${sprite.opacity})`;
                ctx.shadowColor = 'rgba(31, 215, 255, 0.34)';
                ctx.shadowBlur = 10;
                ctx.fillText(sprite.text, sprite.x, sprite.y);

                if (sprite.y > canvas.height + sprite.size + 16) {
                    this.humanLabMatrixDrops[index] = createSprite(canvas.width, canvas.height, true);
                }
            });

            this.humanLabMatrixFrame = window.requestAnimationFrame(draw);
        };

        this.humanLabMatrixFrame = window.requestAnimationFrame(draw);
    }

    stopHumanLabMatrixAnimation() {
        if (this.humanLabMatrixFrame) {
            window.cancelAnimationFrame(this.humanLabMatrixFrame);
            this.humanLabMatrixFrame = null;
        }
        if (this.humanLabMatrixResizeHandler) {
            window.removeEventListener('resize', this.humanLabMatrixResizeHandler);
            this.humanLabMatrixResizeHandler = null;
        }
    }

    updateHumanPsychologyLiveUI() {
        if (this.interactionMode !== 'humanPsychologyLab') return;

        const options = this.session?.options || [];
        const preview = this.getHumanLabPreviewMetrics(options);
        const weakCount = preview.weakCount;
        const selectedIds = Array.from(this.selectedOptions);
        const progressPercent = preview.xpPercent;

        const dialNum = document.getElementById('l1-dial-num');
        if (dialNum) dialNum.textContent = selectedIds.length;

        const dialRing = document.getElementById('l1-dial-ring');
        if (dialRing) {
            const circumference = 408;
            dialRing.style.strokeDashoffset = circumference - (circumference * progressPercent) / 100;
        }

        const xpFill = document.getElementById('l1-xp-fill');
        if (xpFill) xpFill.style.width = `${progressPercent}%`;

        const combo = document.getElementById('l1-combo');
        if (combo) combo.textContent = `x${preview.combo}`;

        const ptsPreview = document.getElementById('ptsPreview');
        if (ptsPreview) {
            ptsPreview.textContent = `${preview.points >= 0 ? '+' : ''}${preview.points}`;
            ptsPreview.classList.toggle('neg', preview.points < 0);
        }

        const flagSlots = document.getElementById('l1-flag-slots');
        if (flagSlots) {
            flagSlots.innerHTML = Array.from({ length: weakCount }).map((_, index) => {
                const option = options.find(entry => entry.id === selectedIds[index]);
                if (!option) {
                    return '<div class="l1-flag-slot">—</div>';
                }

                const shortValue = option.value.length > 6 ? `${option.value.slice(0, 4)}…` : option.value;
                return `<div class="l1-flag-slot active">${shortValue}</div>`;
            }).join('');
        }

        const submitBtn = document.getElementById('submit-selection');
        if (submitBtn) submitBtn.disabled = selectedIds.length === 0;

        document.querySelectorAll('[data-option-id]').forEach(card => {
            const optionId = Number(card.dataset.optionId);
            const option = options.find(entry => entry.id === optionId);
            const state = card.querySelector('.l1-card__state');
            const isSelected = this.selectedOptions.has(optionId);

            card.classList.toggle('selected', isSelected);
            card.classList.toggle('flagged', isSelected && Boolean(option?.isWeak));
            card.classList.toggle('clear', isSelected && option && !option.isWeak);

            if (!state) return;
            if (!isSelected) {
                state.textContent = 'READY';
                return;
            }

            state.textContent = option?.isWeak ? 'FLAGGED' : 'SECURE';
        });

        document.querySelectorAll('[data-human-objective]').forEach((item, index) => {
            item.classList.remove('on', 'done');
            if (this.isComplete) {
                item.classList.add('done');
                item.querySelector('.l1-objective__icon').textContent = '✓';
                return;
            }

            if (index === 0) {
                item.classList.add(selectedIds.length > 0 || this.attempts > 0 || this.hintsShown > 0 ? 'done' : 'on');
                item.querySelector('.l1-objective__icon').textContent = selectedIds.length > 0 || this.attempts > 0 || this.hintsShown > 0 ? '✓' : '▸';
                return;
            }

            if (index === 1) {
                if (selectedIds.length > 0) {
                    item.classList.add('on');
                    item.querySelector('.l1-objective__icon').textContent = '▸';
                } else {
                    item.querySelector('.l1-objective__icon').textContent = '';
                }
                return;
            }

            if (index === 2) {
                if (this.attempts > 0) {
                    item.classList.add('on');
                    item.querySelector('.l1-objective__icon').textContent = '▸';
                } else {
                    item.querySelector('.l1-objective__icon').textContent = '';
                }
            }
        });
    }

    setupBreachTriageEventListeners() {
        document.querySelectorAll('[data-triage-card]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = Number(btn.dataset.triageCard || btn.dataset.optionId);
                if (!Number.isNaN(id)) this.selectBreachTriageCredential(id);
            });
        });
        document.getElementById('bt-clear-plan')?.addEventListener('click', () => this.clearBreachTriagePlan());
        document.getElementById('submit-selection')?.addEventListener('click', () => this.submitBreachTriagePlan());
        this.bindBreachTriageActionButtons();
    }

    bindBreachTriageActionButtons() {
        document.querySelectorAll('[data-triage-action]').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.triageAction;
                if (action) this.assignBreachTriageDecision(action);
            });
        });
    }

    selectBreachTriageCredential(id) {
        if (this.isComplete) return;
        const option = (this.session?.options || []).find(entry => entry.id === id);
        if (!option) return;
        const firstInspection = !this.breachTriageInspectedIds.has(id);
        this.breachTriageSelectedId = id;
        this.breachTriageInspectedIds.add(id);
        this.audio.playButtonClick();
        if (firstInspection) {
            this.pushHumanLabLog('sys', `Credential ${option.value} inspected. ${option.triage?.priorityCue || 'Blast-radius evidence loaded.'}`);
        }
        this.updateBreachTriageLiveUI();
    }

    assignBreachTriageDecision(action) {
        if (this.isComplete) return;
        const option = this.getBreachTriageSelectedOption();
        if (!option) {
            this.gameScreen.ui.showNotification('Select a credential before assigning an action.', 'warning');
            return;
        }

        const cfg = this.getBreachTriageConfig();
        const metrics = this.getBreachTriageMetrics(this.session?.options || []);
        const currentDecision = this.breachTriageAssignments.get(option.id) || 'pending';

        if (action === 'reset' && currentDecision !== 'reset' && metrics.selectedReset.length >= cfg.resetBudget) {
            this.gameScreen.ui.showNotification('No P1 reset slots left. Clear a slot or reassign an entry.', 'warning');
            return;
        }
        if (action === 'monitor' && currentDecision !== 'monitor' && cfg.monitorBudget > 0 && metrics.selectedMonitor.length >= cfg.monitorBudget) {
            this.gameScreen.ui.showNotification('Watchlist capacity reached. Clear a watch slot first.', 'warning');
            return;
        }

        if (action === 'clear') this.breachTriageAssignments.delete(option.id);
        else this.breachTriageAssignments.set(option.id, action);

        this.audio.playButtonClick();
        const actionLabel = action === 'reset' ? 'queued for P1 reset' : action === 'monitor' ? 'moved to watchlist' : 'cleared from the current plan';
        this.pushHumanLabLog(action === 'reset' ? 'warn' : 'sys', `${option.value} ${actionLabel}.`);
        this.updateBreachTriageLiveUI();
    }

    clearBreachTriagePlan() {
        if (this.isComplete) return;
        this.breachTriageAssignments.clear();
        this.audio.playButtonClick();
        this.pushHumanLabLog('sys', 'Reset plan cleared. Awaiting rebuilt wave assignment.');
        this.updateBreachTriageLiveUI();
    }

    submitBreachTriagePlan() {
        if (this.isComplete) return;
        const cfg = this.getBreachTriageConfig();
        const copy = this.getBreachTriageCopyConfig();
        const metrics = this.getBreachTriageMetrics(this.session?.options || []);

        if (metrics.inspectedCount < cfg.inspectGoal) {
            this.gameScreen.ui.showNotification(copy.inspectGate, 'warning');
            return;
        }
        if (metrics.selectedReset.length !== cfg.resetBudget) {
            this.gameScreen.ui.showNotification(copy.resetGate, 'warning');
            return;
        }

        this.attempts++;
        this.updateAttemptCounter();
        this.gameScreen.updateAttempts(this.attempts);

        const success =
            metrics.falseReset.length === 0 &&
            metrics.missedReset.length === 0 &&
            metrics.falseMonitor.length === 0 &&
            metrics.correctMonitor.length >= cfg.monitorGoal;

        if (success) {
            this.finishBreachTriage(true, metrics);
            return;
        }

        this.showBreachTriageFeedback(metrics);
        const penaltyWeight =
            (metrics.falseReset.length * 2) +
            (metrics.missedReset.length * 2) +
            metrics.falseMonitor.length +
            Math.max(0, cfg.monitorGoal - metrics.correctMonitor.length);
        this.increaseRisk((this.riskSystem?.wrongAdd || 18) + (Math.max(0, penaltyWeight - 1) * 4));
        this.revealSecondaryClue();

        if (this.hasRiskBreached()) {
            this.gameScreen.ui.showNotification(this.riskSystem?.breachMessage || 'Breach simulated.', 'error');
            this.finishBreachTriage(false, metrics);
            return;
        }

        if (this.attempts >= this.maxAttempts) {
            this.finishBreachTriage(false, metrics);
            return;
        }

        this.gameScreen.ui.showNotification(copy.genericNotification, 'error');
    }

    showBreachTriageFeedback(metrics) {
        const feedback = document.getElementById('guess-feedback');
        if (!feedback) return;
        const cfg = this.getBreachTriageConfig();
        const copy = this.getBreachTriageCopyConfig();

        feedback.innerHTML = `
            <div><strong>${copy.reviewTitle}:</strong> ${copy.reviewSummary}</div>
            <div>${copy.resetMissedLabel}: ${metrics.missedReset.length}</div>
            <div>${copy.resetFalsePositiveLabel}: ${metrics.falseReset.length}</div>
            <div>${copy.monitorCoveredLabel}: ${metrics.correctMonitor.length} / ${cfg.monitorGoal}</div>
            <div>${copy.inspectCoverageLabel}: ${metrics.inspectedCount} / ${cfg.inspectGoal}</div>`;

        this.pushHumanLabLog(
            'danger',
            `Reset wave mismatch. Missed ${metrics.missedReset.length} critical target(s), escalated ${metrics.falseReset.length} low-priority credential(s), and covered ${metrics.correctMonitor.length}/${cfg.monitorGoal} watchlist target(s).`
        );
    }

    renderBreachTriageInsight(success, metrics) {
        const feedback = document.getElementById('guess-feedback');
        if (!feedback) return;
        const copy = this.getBreachTriageCopyConfig();
        const insights = Array.isArray(this.session?.securityInsight) ? this.session.securityInsight : [];
        const resetTargets = metrics.expectedReset.map(option => option.value);
        const monitorTargets = metrics.expectedMonitor.map(option => option.value);

        feedback.innerHTML += `
            <div style="margin-top:14px;"><strong>${copy.correctResetLabel}:</strong> ${resetTargets.join(', ')}</div>
            <div><strong>${copy.correctMonitorLabel}:</strong> ${monitorTargets.join(', ')}</div>
            <div style="margin-top:10px;"><strong>Incident Debrief:</strong></div>
            <div>• ${insights.join('</div><div>• ')}</div>`;
    }

    finishBreachTriage(success, metrics) {
        const copy = this.getBreachTriageCopyConfig();
        const cfg = this.getBreachTriageConfig();
        this.isComplete = true;
        if (success) this.audio.playSuccess();
        else this.audio.playFailure();
        this.gameScreen.ui.flashScreen(success ? 'rgba(0,255,65,0.2)' : 'rgba(255,0,110,0.2)', 300);
        this.updateBreachTriageLiveUI();
        this.renderBreachTriageInsight(success, metrics);

        const feedback = document.getElementById('guess-feedback');
        if (feedback) {
            feedback.innerHTML += this.renderMissionDebrief({
                tone: success ? 'success' : 'error',
                title: success ? copy.successTitle : copy.failureTitle,
                summary: success ? (this.mission.successFeedback || 'Reset wave executed successfully.') : (this.mission.failureFeedback || 'Reset wave failed.'),
                details: [
                    `Reset targets covered: ${metrics.correctReset.length} / ${metrics.expectedReset.length}`,
                    `Watchlist targets covered: ${metrics.correctMonitor.length} / ${cfg.monitorGoal}`,
                    `Final cascade risk: ${Math.round(this.riskValue)}%`
                ],
                insight: this.mission.knowledgeSummary?.insight || ''
            });
        }

        this.pushHumanLabLog(success ? 'ok' : 'danger', success ? copy.successLog : copy.failureLog);
        this.gameScreen.ui.showNotification(success ? (this.mission.successFeedback || 'Reset wave approved.') : (this.mission.failureFeedback || 'Reset wave failed.'), success ? 'success' : 'error');
        setTimeout(() => this.gameScreen.completePuzzle(success), success ? 1500 : 1700);
    }

    updateBreachTriageLiveUI() {
        if (this.interactionMode !== 'breachTriageLab') return;

        const options = this.session?.options || [];
        const cfg = this.getBreachTriageConfig();
        const metrics = this.getBreachTriageMetrics(options);
        const selected = this.getBreachTriageSelectedOption();

        const dialNum = document.getElementById('l1-dial-num');
        if (dialNum) dialNum.textContent = `${metrics.selectedReset.length}`;

        const dialRing = document.getElementById('l1-dial-ring');
        if (dialRing) {
            const circumference = 408;
            dialRing.style.strokeDashoffset = circumference - (circumference * metrics.planReadiness) / 100;
        }

        const inspectValue = document.getElementById('l1-combo');
        if (inspectValue) inspectValue.textContent = `${metrics.inspectedCount}/${cfg.inspectGoal}`;

        const planFill = document.getElementById('l1-xp-fill');
        if (planFill) planFill.style.width = `${metrics.planReadiness}%`;

        const planScore = document.getElementById('bt-plan-score');
        if (planScore) {
            planScore.textContent = `${metrics.planReadiness}%`;
            planScore.classList.toggle('neg', metrics.planReadiness < 60);
        }

        const resetSlots = document.getElementById('bt-reset-slots');
        if (resetSlots) {
            resetSlots.innerHTML = Array.from({ length: cfg.resetBudget }).map((_, index) => {
                const option = metrics.selectedReset[index];
                return option
                    ? `<div class="l1-flag-slot active slot-reset">${option.value.length > 6 ? `${option.value.slice(0, 4)}…` : option.value}</div>`
                    : '<div class="l1-flag-slot">—</div>';
            }).join('');
        }

        const monitorSlots = document.getElementById('bt-monitor-slots');
        if (monitorSlots) {
            monitorSlots.innerHTML = Array.from({ length: cfg.monitorBudget }).map((_, index) => {
                const option = metrics.selectedMonitor[index];
                return option
                    ? `<div class="l1-flag-slot active slot-monitor">${option.value.length > 6 ? `${option.value.slice(0, 4)}…` : option.value}</div>`
                    : '<div class="l1-flag-slot">—</div>';
            }).join('');
        }

        document.querySelectorAll('[data-triage-card]').forEach(card => {
            const optionId = Number(card.dataset.triageCard || card.dataset.optionId);
            const option = options.find(entry => entry.id === optionId);
            const decision = this.breachTriageAssignments.get(optionId) || 'pending';
            const inspected = this.breachTriageInspectedIds.has(optionId);
            const state = card.querySelector('.l1-card__state');

            card.classList.toggle('selected', this.breachTriageSelectedId === optionId);
            card.classList.toggle('reviewed', inspected);
            card.classList.toggle('triage-reset', decision === 'reset');
            card.classList.toggle('triage-monitor', decision === 'monitor');

            if (!state) return;
            if (decision === 'reset') state.textContent = 'P1 RESET';
            else if (decision === 'monitor') state.textContent = 'WATCHLIST';
            else state.textContent = inspected ? 'REVIEWED' : 'READY';

            if (option && this.isComplete) {
                card.disabled = true;
                if (option.expectedAction === 'reset') card.classList.add('triage-reset');
                else if (option.expectedAction === 'monitor') card.classList.add('triage-monitor');
            }
        });

        const selectedPanel = document.getElementById('bt-selected-panel');
        if (selectedPanel) {
            selectedPanel.innerHTML = this.renderBreachTriageSelectedPanel(selected, metrics);
            this.bindBreachTriageActionButtons();
        }

        const submitBtn = document.getElementById('submit-selection');
        if (submitBtn) submitBtn.disabled = this.isComplete || metrics.selectedReset.length !== cfg.resetBudget || metrics.inspectedCount < cfg.inspectGoal;

        const clearBtn = document.getElementById('bt-clear-plan');
        if (clearBtn) clearBtn.disabled = this.isComplete || (metrics.selectedReset.length === 0 && metrics.selectedMonitor.length === 0);

        document.querySelectorAll('[data-triage-objective]').forEach((item, index) => {
            item.classList.remove('on', 'done');
            const icon = item.querySelector('.l1-objective__icon');
            if (!icon) return;

            if (this.isComplete) {
                item.classList.add('done');
                icon.textContent = '✓';
                return;
            }

            if (index === 0) {
                if (metrics.inspectedCount >= cfg.inspectGoal) {
                    item.classList.add('done');
                    icon.textContent = '✓';
                } else {
                    item.classList.add('on');
                    icon.textContent = '▸';
                }
                return;
            }

            if (index === 1) {
                if (metrics.selectedReset.length >= cfg.resetBudget) {
                    item.classList.add('done');
                    icon.textContent = '✓';
                } else if (metrics.selectedReset.length > 0) {
                    item.classList.add('on');
                    icon.textContent = '▸';
                } else {
                    icon.textContent = '';
                }
                return;
            }

            if (metrics.correctMonitor.length >= cfg.monitorGoal) {
                item.classList.add('done');
                icon.textContent = '✓';
            } else if (metrics.selectedMonitor.length > 0) {
                item.classList.add('on');
                icon.textContent = '▸';
            } else {
                icon.textContent = '';
            }
        });
    }

    getSingleChoiceConfidenceScore() {
        const requiredEvidence = Array.isArray(this.puzzleData.requiredEvidenceIds) ? this.puzzleData.requiredEvidenceIds : [];
        if (!requiredEvidence.length) return Math.min(100, this.singleChoiceSelectedEntryIds.size * 35);
        const matched = requiredEvidence.filter(id => this.singleChoiceSelectedEntryIds.has(id)).length;
        return Math.min(100, Math.round((matched / requiredEvidence.length) * 100));
    }

    getSingleChoiceEvidenceSummary() {
        const matched = (this.getSingleChoiceEvidenceEntries() || []).filter(entry => this.singleChoiceSelectedEntryIds.has(entry.id));
        if (!matched.length) return 'No high-signal evidence flagged yet.';
        const keywords = matched.map(entry => entry.title).slice(0, 2).join(' + ');
        return `${keywords}${matched.length > 2 ? ' +' : ''} supports a repeated wordlist-style guessing pattern.`;
    }

    getPredictionClassificationSummary(session) {
        const options = Array.isArray(session?.options) ? session.options : [];
        if (!options.length || !options.every(option => !!this.predictionRatings[option])) {
            return 'Classify every password first to unlock the benchmark preview.';
        }
        const sorted = options.slice().sort((a, b) => this.getPredictionBreakTime(a) - this.getPredictionBreakTime(b));
        const weakest = sorted[0];
        const strongest = sorted[sorted.length - 1];
        return `Most likely to break first: ${weakest}. Most likely to hold longest: ${strongest}.`;
    }

    getInvestigationFlagQuality(logs = []) {
        const flaggedLogs = logs.filter(log => this.investigationFlaggedEvents.has(log.id));
        const criticalFlags = flaggedLogs.filter(log => log.statusTone === 'critical').length;
        return {
            flaggedCount: flaggedLogs.length,
            criticalFlags,
            warningFlags: flaggedLogs.filter(log => log.statusTone === 'warning').length
        };
    }

    getInspectionExposureScore(system) {
        const preview = Array.isArray(system?.databasePreview) ? system.databasePreview.join(' ') : '';
        const breach = String(system?.breachOutcome || '');
        if (/plain text|admin@123|welcome123|rahim2001/i.test(`${preview} ${breach}`)) {
            return { score: 96, label: 'Instant credential replay risk' };
        }
        if (/md5|hash|offline/i.test(`${preview} ${breach} ${system?.summary || ''}`)) {
            return { score: 68, label: 'Offline cracking still viable' };
        }
        return { score: 40, label: 'Limited post-breach exposure' };
    }

    getThreatOperationsSummary() {
        return {
            detected: this.threatDetectedMajor.size,
            contained: this.threatContainedMajor.size,
            investigated: this.threatInvestigatedEvents.size
        };
    }

    getPatchStagingPreview() {
        const stagedIds = Array.from(this.patchStagedActions);
        const preview = {
            exploitSuccessRateDelta: 0,
            serverLoadDelta: 0,
            userExperienceScoreDelta: 0,
            closes: 0
        };
        stagedIds.forEach(id => {
            const option = (this.puzzleData.patchOptions || []).find(item => item.id === id);
            if (!option) return;
            const effects = option.effects || {};
            preview.exploitSuccessRateDelta += Number(effects.exploitSuccessRateDelta || 0);
            preview.serverLoadDelta += Number(effects.serverLoadDelta || 0);
            preview.userExperienceScoreDelta += Number(effects.userExperienceScoreDelta || 0);
            preview.closes += Array.isArray(effects.closesVulnerabilities) ? effects.closesVulnerabilities.length : 0;
        });
        return preview;
    }

    getEnterpriseAttackNarrative(result) {
        if (result.outcome === 'Blocked') return 'Layered controls removed the main attacker path.';
        if (result.outcome === 'Partially Mitigated') return 'At least one control slowed the attack, but gaps remain.';
        return 'This attack path still reaches a business-critical objective.';
    }

    renderMissionDebrief({ tone = 'success', title = '', summary = '', details = [], insight = '' }) {
        const accent = tone === 'success' ? '#00e87a' : tone === 'warning' ? '#ffcb6b' : '#ff4060';
        const background = tone === 'success'
            ? 'rgba(0,232,122,.08)'
            : tone === 'warning'
                ? 'rgba(255,176,0,.08)'
                : 'rgba(255,64,96,.08)';
        const border = tone === 'success'
            ? 'rgba(0,232,122,.22)'
            : tone === 'warning'
                ? 'rgba(255,176,0,.22)'
                : 'rgba(255,64,96,.22)';
        const detailMarkup = details.length
            ? `<div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:8px;">${details.slice(0, 4).map(item => `<span style="display:inline-flex;padding:4px 8px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03);color:rgba(220,228,245,.82);font-size:.78rem;">${item}</span>`).join('')}</div>`
            : '';
        const insightMarkup = insight ? `<div style="margin-top:10px;color:#ffcb6b;font-size:.82rem;line-height:1.5;">${insight}</div>` : '';
        return `
            <div style="margin-top:12px;padding:14px;border:1px solid ${border};background:${background};box-shadow:0 0 0 1px rgba(255,255,255,.02) inset;border-radius:12px;">
                <div style="color:${accent};font-family:Consolas,'Courier New',monospace;letter-spacing:.16em;text-transform:uppercase;font-size:.72rem;">Mission Debrief</div>
                <div style="margin-top:6px;color:#eef2ff;font-size:.98rem;font-weight:700;line-height:1.4;">${title}</div>
                <div style="margin-top:6px;color:rgba(220,228,245,.82);line-height:1.6;font-size:.9rem;">${summary}</div>
                ${detailMarkup}
                ${insightMarkup}
            </div>`;
    }

    syncEmbeddedMissionHUD() {
        if (this.interactionMode !== 'liveDefenseSimulation') return false;

        const waves = this.getLiveDefenseWaves();
        const totalWaves = Math.max(1, waves.length);
        const visibleWave = Math.min(totalWaves, Math.max(1, this.liveWaveIndex + 1));
        const timerEl = document.getElementById('l1-timer');
        const timerLabel = document.getElementById('lab-shared-time-label');
        const auxLabel = document.getElementById('lab-shared-aux-label');
        const auxValue = document.getElementById('l1-ai-progress');

        if (timerLabel) timerLabel.textContent = 'Timer';
        if (timerEl) {
            timerEl.textContent = `${Math.max(0, Math.floor(this.liveRemainingTime))}S`;
            timerEl.classList.toggle('danger', this.liveRemainingTime <= 10);
        }

        if (auxLabel) auxLabel.textContent = 'Wave';
        if (auxValue) {
            auxValue.textContent = `${visibleWave}/${totalWaves}`;
            auxValue.className = 'lab-shared-value lab-shared-value--safe';
        }

        return true;
    }

    renderSharedPasswordLabFrame({
        levelLabel = '',
        title = '',
        status = 'ANALYST LAB ACTIVE',
        phases = [],
        content = '',
        timeLabel = 'Time',
        timeDisplayOverride = null,
        auxiliaryLabel = null,
        auxiliaryValue = null,
        auxiliaryTone = null
    }) {
        const isNoTimerPressure = !!this.gameScreen?.currentMission?.puzzle?.noTimerPressure;
        const fallbackTimeDisplay = isNoTimerPressure
            ? 'FREE'
            : this.gameScreen?.timer
                ? this.gameScreen.timer.getFormattedTime()
                : '00:00';
        const timeDisplay = timeDisplayOverride ?? fallbackTimeDisplay;
        const scoreDisplay = String(this.gameScreen?.game?.score?.getScore?.() || 0).padStart(3, '0');
        const hintsRemaining = Math.max(0, CONFIG.HINTS.MAX_HINTS_PER_MISSION - this.gameScreen.game.score.hintsUsed);
        const aiProgress = Math.floor(this.gameScreen?.aiOpponent?.getProgress?.() || 0);
        const aiDisplay = auxiliaryValue ?? (isNoTimerPressure ? 'LAB' : `${aiProgress}%`);
        const aiLabel = auxiliaryLabel ?? (isNoTimerPressure ? 'Mode' : 'AI');
        const timeValueClass = (timeDisplayOverride !== null || isNoTimerPressure) ? 'lab-shared-value lab-shared-value--safe' : 'lab-shared-value';
        const aiValueClass = auxiliaryTone
            ? `lab-shared-value lab-shared-value--${auxiliaryTone}`
            : isNoTimerPressure
                ? 'lab-shared-value lab-shared-value--safe'
                : 'lab-shared-value lab-shared-value--alert';
        const phaseMarkup = phases.map((phase, index) => `
            ${index ? '<div class="lab-shared-phase-sep">//</div>' : ''}
            <div class="lab-shared-phase ${phase.active ? 'active' : ''} ${phase.done ? 'done' : ''}">
                <span class="lab-shared-phase__dot"></span>
                <strong>${String(index + 1).padStart(2, '0')}</strong>${phase.label}
            </div>`).join('');

        return `
            <div class="lab-shared-shell">
                <canvas class="lab-shared-matrix" id="l1-matrix" aria-hidden="true"></canvas>
                <div class="lab-shared-crt" aria-hidden="true"></div>
                <div class="lab-shared-scanline" aria-hidden="true"></div>

                <header class="lab-shared-hud">
                    <div class="lab-shared-logo">
                        <div class="lab-shared-logo-badge">⬡</div>
                        <div class="lab-shared-logo-text">SHADOWDEF</div>
                    </div>
                    <div class="lab-shared-mission">
                        <div class="lab-shared-kicker">${levelLabel}</div>
                        <div class="lab-shared-title">${title}</div>
                    </div>
                    <div class="lab-shared-stats">
                        <div class="lab-shared-stat">
                            <div class="lab-shared-label" id="lab-shared-time-label">${timeLabel}</div>
                            <div class="${timeValueClass}" id="l1-timer">${timeDisplay}</div>
                        </div>
                        <div class="lab-shared-stat">
                            <div class="lab-shared-label">Score</div>
                            <div class="lab-shared-value lab-shared-value--score" id="l1-score">${scoreDisplay}</div>
                        </div>
                        <div class="lab-shared-stat">
                            <div class="lab-shared-label" id="lab-shared-aux-label">${aiLabel}</div>
                            <div class="${aiValueClass}" id="l1-ai-progress">${aiDisplay}</div>
                        </div>
                        <div class="lab-shared-stat">
                            <div class="lab-shared-label">Hints</div>
                            <div class="lab-shared-value lab-shared-value--safe" id="l1-hints-remaining">${hintsRemaining}</div>
                        </div>
                    </div>
                    <div class="lab-shared-actions">
                        <button class="lab-shared-btn" data-action="hint" type="button">[ HINT ]</button>
                        <button class="lab-shared-btn" data-action="pause" type="button">[ PAUSE ]</button>
                        <button class="lab-shared-btn" data-action="back-to-levels" type="button">[ BACK ]</button>
                    </div>
                </header>

                <div class="lab-shared-strip">
                    ${phaseMarkup}
                    <div class="lab-shared-status">
                        <span class="lab-shared-status__dot"></span>
                        ${status}
                    </div>
                </div>

                <div class="lab-shared-body">
                    <div class="lab-shared-content">
                        ${content}
                    </div>
                </div>
            </div>`;
    }

    renderSharedPasswordLabThemeStyles() {
        return `<style>
            .lab-shared-shell,.l2-shell,.l3-shell,.srl-shell,.ld-shell,.th-shell,.patch-shell,.ea-shell,.password-puzzle.investigation-shell,.password-puzzle.inspection-shell{--lab-cyan:#00e5ff;--lab-red:#ff355e;--lab-green:#00ff88;--lab-gold:#ffd700;--lab-white:#f3fbff;--lab-text:#c8e8f0;--lab-text-mid:rgba(200,232,240,.62);--lab-text-low:rgba(200,232,240,.34);--lab-border:rgba(0,229,255,.13);display:flex;flex-direction:column;width:100%;height:100%;min-height:0;background:radial-gradient(circle at top left,rgba(0,229,255,.08),transparent 24%),radial-gradient(circle at bottom right,rgba(255,53,94,.08),transparent 28%),linear-gradient(180deg,#030a14 0%,#020814 100%) !important;color:var(--lab-text)!important;border:1px solid var(--lab-border)!important;box-shadow:0 24px 72px rgba(0,0,0,.34)!important;font-family:'Rajdhani',sans-serif;overflow:auto}
            .password-puzzle.investigation-shell,.password-puzzle.inspection-shell{overflow:auto}
            .lab-shared-shell,.lab-shared-shell *,.lab-shared-shell *::before,.lab-shared-shell *::after,.l2-shell *,.l3-shell *,.srl-shell *,.ld-shell *,.th-shell *,.patch-shell *,.ea-shell *,.password-puzzle.investigation-shell *,.password-puzzle.inspection-shell *,.l2-shell *::before,.l3-shell *::before,.srl-shell *::before,.ld-shell *::before,.th-shell *::before,.patch-shell *::before,.ea-shell *::before,.password-puzzle.investigation-shell *::before,.password-puzzle.inspection-shell *::before,.l2-shell *::after,.l3-shell *::after,.srl-shell *::after,.ld-shell *::after,.th-shell *::after,.patch-shell *::after,.ea-shell *::after,.password-puzzle.investigation-shell *::after,.password-puzzle.inspection-shell *::after{box-sizing:border-box}
            @keyframes labSharedScan{0%{top:-4px}100%{top:100%}}
            @keyframes labSharedBlink{0%,100%{opacity:1}50%{opacity:0}}
            @keyframes labSharedPulse{0%,100%{opacity:1}50%{opacity:.45}}
            .lab-shared-shell{position:relative;cursor:default}
            .lab-shared-matrix{position:absolute;inset:0;z-index:0;width:100%;height:100%;opacity:.2}
            .lab-shared-crt{position:absolute;inset:0;z-index:1;pointer-events:none;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.08) 2px,rgba(0,0,0,.08) 4px)}
            .lab-shared-crt::after{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at center,transparent 58%,rgba(1,3,12,.78) 100%)}
            .lab-shared-scanline{position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(transparent,rgba(23,216,255,.12),transparent);z-index:2;animation:labSharedScan 5s linear infinite;pointer-events:none}
            .lab-shared-hud,.lab-shared-strip,.lab-shared-body{position:relative;z-index:3}
            .lab-shared-hud{display:flex;align-items:stretch;flex-wrap:wrap;min-height:60px;border-bottom:1px solid var(--lab-border);background:rgba(0,8,20,.95);flex-shrink:0}
            .lab-shared-logo{display:flex;align-items:center;gap:12px;padding:0 24px;border-right:1px solid var(--lab-border);flex-shrink:0}
            .lab-shared-logo-badge{width:36px;height:36px;display:flex;align-items:center;justify-content:center;border:1px solid rgba(0,229,255,.32);color:var(--lab-cyan);font-size:13px;background:rgba(0,229,255,.08);box-shadow:0 0 18px rgba(0,229,255,.18);clip-path:polygon(50% 0%,100% 25%,100% 75%,50% 100%,0 75%,0 25%);animation:labSharedPulse 2s infinite}
            .lab-shared-logo-text{font-family:'Orbitron',sans-serif;font-size:22px;font-weight:800;letter-spacing:6px;color:var(--lab-cyan);text-shadow:0 0 16px rgba(0,229,255,.2)}
            .lab-shared-kicker,.lab-shared-label,.lab-shared-btn,.lab-shared-phase,.lab-shared-status{font-family:'Share Tech Mono',monospace;text-transform:uppercase}
            .lab-shared-mission{display:flex;flex:1 1 240px;flex-direction:column;justify-content:center;padding:0 24px;border-right:1px solid var(--lab-border);min-width:220px}
            .lab-shared-kicker{font-size:8px;letter-spacing:.26em;color:var(--lab-text-mid);margin-bottom:4px}
            .lab-shared-title{font-family:'Orbitron',sans-serif;font-size:15px;font-weight:700;letter-spacing:.18em;line-height:1.25;color:var(--lab-white);text-transform:uppercase}
            .lab-shared-stats{display:flex;align-items:stretch;flex-wrap:wrap;min-width:0;margin-left:auto}
            .lab-shared-stat{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0 18px;border-left:1px solid var(--lab-border);min-width:80px}
            .lab-shared-label{font-size:8px;letter-spacing:.24em;color:var(--lab-text-low);margin-bottom:2px}
            .lab-shared-value{font-family:'Orbitron',sans-serif;font-size:24px;font-weight:700;letter-spacing:.08em;line-height:1;color:var(--lab-cyan)}
            .lab-shared-value--score{color:var(--lab-gold)}
            .lab-shared-value--alert{color:var(--lab-red)}
            .lab-shared-value--safe{color:var(--lab-green)}
            #l1-timer.danger{color:var(--lab-red)!important;text-shadow:0 0 16px rgba(255,53,94,.3)}
            .lab-shared-actions{display:flex;align-items:center;gap:8px;padding:0 16px;border-left:1px solid var(--lab-border);flex-wrap:wrap}
            .lab-shared-btn{padding:8px 12px;border:1px solid rgba(0,229,255,.24);background:rgba(4,16,36,.6);color:var(--lab-text-mid);font-size:9px;letter-spacing:.18em;cursor:pointer;transition:all .2s ease}
            .lab-shared-btn:hover{border-color:var(--lab-cyan);color:var(--lab-cyan);box-shadow:0 0 18px rgba(0,229,255,.14)}
            .lab-shared-strip{display:flex;align-items:center;gap:14px;flex-wrap:wrap;min-height:38px;padding:0 24px;border-bottom:1px solid rgba(0,229,255,.08);background:rgba(3,10,20,.92);flex-shrink:0}
            .lab-shared-phase{display:flex;align-items:center;gap:8px;font-size:9px;letter-spacing:.18em;color:var(--lab-text-low)}
            .lab-shared-phase strong{font-family:'Orbitron',sans-serif;font-size:13px;letter-spacing:.08em;font-weight:700}
            .lab-shared-phase__dot{width:8px;height:8px;border-radius:50%;background:rgba(23,216,255,.14);flex-shrink:0}
            .lab-shared-phase.active{color:var(--lab-cyan)}
            .lab-shared-phase.done{color:var(--lab-green)}
            .lab-shared-phase.active .lab-shared-phase__dot{background:var(--lab-cyan);box-shadow:0 0 14px rgba(0,229,255,.42)}
            .lab-shared-phase.done .lab-shared-phase__dot{background:var(--lab-green);box-shadow:0 0 14px rgba(0,255,136,.3)}
            .lab-shared-phase-sep{color:rgba(0,229,255,.24);font-size:14px}
            .lab-shared-status{margin-left:auto;display:flex;align-items:center;gap:8px;font-size:9px;letter-spacing:.18em;color:var(--lab-green);text-shadow:0 0 12px rgba(0,255,136,.24)}
            .lab-shared-status__dot{width:8px;height:8px;background:var(--lab-green);box-shadow:0 0 12px rgba(0,255,136,.75);animation:labSharedBlink 1s step-end infinite}
            .lab-shared-body{display:flex;flex:1;min-height:0;overflow:hidden}
            .lab-shared-content{display:flex;flex:1;min-height:0;overflow:hidden;background:linear-gradient(180deg,rgba(2,9,18,.88),rgba(1,6,14,.98))}
            .lab-shared-content > *{flex:1;min-height:0}
            .lab-shared-content .l2-shell,.lab-shared-content .l3-shell,.lab-shared-content .srl-shell,.lab-shared-content .ld-shell,.lab-shared-content .th-shell,.lab-shared-content .patch-shell,.lab-shared-content .ea-shell,.lab-shared-content .password-puzzle.investigation-shell,.lab-shared-content .password-puzzle.inspection-shell{background:transparent !important;border:0 !important;box-shadow:none !important}
            .lab-shared-content .srl-shell{overflow:visible !important}
            .lab-shared-content .l2-header,.lab-shared-content .l2-phases,.lab-shared-content .l2-hint-strip,.lab-shared-content .l3-header,.lab-shared-content .l3-phases,.lab-shared-content .l3-hint-strip,.lab-shared-content .srl-header,.lab-shared-content .srl-phases,.lab-shared-content .ld-header,.lab-shared-content .ld-phases,.lab-shared-content .ld-hint-strip,.lab-shared-content .th-header,.lab-shared-content .th-hint-strip,.lab-shared-content .patch-header,.lab-shared-content .patch-phases,.lab-shared-content .patch-hint-strip,.lab-shared-content .ea-header,.lab-shared-content .ea-phases,.lab-shared-content .ea-hint-strip,.lab-shared-content .investigation-masthead,.lab-shared-content .investigation-progress-rail,.lab-shared-content .investigation-hint-strip,.lab-shared-content .inspection-masthead,.lab-shared-content .inspection-progress-rail,.lab-shared-content .inspection-hint-strip{display:none !important}
            .l2-header,.l3-header,.srl-header,.ld-header,.th-header,.patch-header,.ea-header,.investigation-masthead,.inspection-masthead{background:rgba(3,10,20,.96)!important;border-bottom:1px solid rgba(0,229,255,.08)!important}
            .l2-brand,.l3-brand,.srl-brand,.ld-brand,.th-brand,.patch-brand,.ea-brand,.investigation-masthead__brand,.inspection-masthead__brand{color:var(--lab-cyan)!important;font-family:'Orbitron',sans-serif!important;font-weight:800!important;letter-spacing:4px!important}
            .l2-level,.l3-level,.srl-level,.ld-level,.th-level,.patch-level,.ea-level,.investigation-masthead__case,.inspection-masthead__case{color:rgba(23,216,255,.66)!important;font-family:'Share Tech Mono',monospace!important;letter-spacing:.18em!important;text-transform:uppercase}
            .l2-status,.l3-status,.srl-status,.ld-status,.th-status,.patch-status,.ea-status,.investigation-masthead__status,.inspection-masthead__status{color:var(--lab-green)!important;font-family:'Share Tech Mono',monospace!important;letter-spacing:.16em!important;text-transform:uppercase}
            .l2-phases,.l3-phases,.srl-phases,.ld-phases,.ea-phases,.investigation-progress-rail,.inspection-progress-rail{background:rgba(3,10,20,.92)!important;border-bottom:1px solid rgba(0,229,255,.08)!important}
            .l2-phase,.l3-phase,.srl-phase,.ld-phase,.ea-phase,.investigation-progress-step,.inspection-progress-step{color:var(--lab-text-low)!important;font-family:'Share Tech Mono',monospace!important}
            .l2-phase.active,.l3-phase.active,.srl-phase.active,.ld-phase.active,.ea-phase.active,.investigation-progress-step.is-active,.inspection-progress-step.is-active{color:var(--lab-cyan)!important;background:rgba(23,216,255,.06)!important;border-bottom-color:var(--lab-cyan)!important}
            .srl-phase.done{color:var(--lab-green)!important;border-bottom-color:rgba(0,255,136,.35)!important}
            .l2-hint-strip,.l3-hint-strip,.srl-hint-strip,.ld-hint-strip,.th-hint-strip,.patch-hint-strip,.ea-hint-strip,.investigation-hint-strip,.inspection-hint-strip{background:rgba(0,229,255,.05)!important;border-bottom:1px solid rgba(0,229,255,.12)!important;color:rgba(0,229,255,.76)!important;font-family:'Share Tech Mono',monospace!important}
            .l2-frame,.l3-frame,.ld-grid,.th-grid,.patch-grid,.ea-grid,.investigation-grid,.inspection-grid{flex:1;min-height:0!important;height:100%}
            .l2-panel,.l3-panel,.ld-panel,.th-main,.th-side,.patch-main,.patch-side,.ea-main,.ea-side,.investigation-panel,.investigation-question-panel,.investigation-selected-entry,.inspection-card,.inspection-side-panel,.inspection-question-panel,.inspection-scorecard{background:rgba(3,14,32,.88)!important;border-color:rgba(0,229,255,.1)!important;box-shadow:0 18px 40px rgba(0,0,0,.22)!important;backdrop-filter:blur(12px)}
            .l2-brief-box,.l2-metric-box,.l2-guide,.l2-log-panel,.l2-feedback,.l2-choice-card,.l2-evidence-card,.l3-brief-box,.l3-metric-box,.l3-guide,.l3-card,.l3-feedback,.l3-race-board,.srl-brief-box,.srl-mission-box,.srl-risk-box,.srl-divergence,.srl-result,.srl-feedback,.srl-completion-card,.th-overview,.th-sidebox,.th-panel,.th-selected,.th-log,.patch-overview,.patch-sidebox,.patch-action-board,.patch-log,.patch-module,.patch-vuln{background:rgba(3,14,32,.88)!important;border-color:rgba(0,229,255,.1)!important}
            .l2-section-kicker,.l3-section-kicker,.srl-section-kicker,.ld-kicker,.th-kicker,.patch-kicker,.ea-kicker,.investigation-panel__header strong,.inspection-side-panel__label{color:rgba(23,216,255,.72)!important;font-family:'Share Tech Mono',monospace!important}
            .l2-main-title,.l3-main-title,.ld-title,.th-title,.patch-title,.ea-title,.investigation-title,.inspection-title{color:var(--lab-white)!important;font-family:'Orbitron',sans-serif!important}
            .l2-choice-card__title,.l3-rate-label,.l3-card__label,.srl-label,.ld-card__status,.ld-card__cost,.th-panel__head span,.patch-action-card__meta,.ea-config-card__title,.investigation-case-meta,.inspection-hero__meta{color:rgba(23,216,255,.68)!important;font-family:'Share Tech Mono',monospace!important}
            .l2-btn,.l3-btn,.srl-nav-btn,.srl-sim-btn,.srl-quick-btn,.srl-primary-btn,.l2-flag-btn,.l3-rate-btn,.investigation-action-btn,.inspection-action-btn,.th-card-action,.password-puzzle .btn{border-color:rgba(23,216,255,.24)!important;color:rgba(232,244,255,.82)!important;background:rgba(23,216,255,.06)!important;font-family:'Share Tech Mono',monospace!important}
            .l2-btn-primary,.l3-btn-primary,.srl-primary-btn,.password-puzzle .btn.btn-primary{background:linear-gradient(90deg,rgba(23,216,255,.16),rgba(255,63,120,.08))!important;border-color:rgba(23,216,255,.36)!important;color:var(--lab-white)!important}
            .l2-panel,.l3-panel,.ld-panel,.th-main,.th-side,.patch-main,.patch-side,.ea-main,.ea-side,.l2-panel-right,.l3-panel-right,.investigation-panel--logs,.investigation-side-stack,.inspection-main,.inspection-sidebar{min-height:0;overflow:auto}
            .l2-log-feed,.l2-evidence-grid,.l3-card-grid,.investigation-log-list,.inspection-main,.th-main,.patch-main,.ea-main{min-height:0;overflow:auto}
            @media (max-width:1200px){.lab-shared-mission{min-width:0;flex:1 1 100%}.lab-shared-stats{order:4;width:100%;margin-left:0;border-top:1px solid var(--lab-border)}.lab-shared-actions{margin-left:auto}}
            @media (max-width:1080px){.l2-shell,.l3-shell,.srl-shell,.ld-shell,.th-shell,.patch-shell,.ea-shell{overflow:auto}.l2-frame,.l3-frame,.ld-grid,.th-grid,.patch-grid,.ea-grid{height:auto}}
            @media (max-width:760px){.lab-shared-hud{display:grid;grid-template-columns:1fr}.lab-shared-logo,.lab-shared-mission,.lab-shared-stats,.lab-shared-actions{border-right:0;border-left:0;border-bottom:1px solid var(--lab-border)}.lab-shared-actions{padding:12px 16px}.lab-shared-strip{padding:10px 16px;align-items:flex-start}.lab-shared-status{width:100%;margin-left:0;padding-top:4px}}
        </style>`;
    }

    renderHumanPsychologyLabStyles() {
        return `<style>
            .l1-shell{--l1-black:#030a14;--l1-deep:#020814;--l1-panel:rgba(3,14,32,.92);--l1-panel-2:rgba(3,10,24,.96);--l1-rim:rgba(0,229,255,.13);--l1-rim2:rgba(0,229,255,.24);--l1-cyan:#00e5ff;--l1-red:#ff355e;--l1-green:#00ff88;--l1-gold:#ffd700;--l1-white:#f3fbff;--l1-text:#c8e8f0;--l1-text-mid:rgba(200,232,240,.56);--l1-text-low:rgba(200,232,240,.3);position:relative;display:flex;flex:1 1 auto;flex-direction:column;width:100%;height:100%;max-height:100%;min-width:0;min-height:0;overflow:hidden;background:linear-gradient(180deg,#030a14 0%,#020814 100%);color:var(--l1-text);font-family:'Rajdhani',sans-serif;cursor:default}
            .l1-shell,.l1-shell *,.l1-shell *::before,.l1-shell *::after{box-sizing:border-box}
            @keyframes l1ScanDown{0%{top:-4px}100%{top:100%}}
            @keyframes l1Blink{0%,100%{opacity:1}50%{opacity:0}}
            @keyframes l1Pulse{0%,100%{opacity:1}50%{opacity:.45}}
            @keyframes l1Spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
            .l1-matrix{position:absolute;inset:0;z-index:0;width:100%;height:100%;opacity:.2}
            .l1-crt{position:absolute;inset:0;z-index:1;pointer-events:none;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.08) 2px,rgba(0,0,0,.08) 4px)}
            .l1-crt::after{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at center,transparent 58%,rgba(1,3,12,.78) 100%)}
            .l1-scanline{position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(transparent,rgba(23,216,255,.12),transparent);z-index:2;animation:l1ScanDown 5s linear infinite;pointer-events:none}
            .l1-top-hud,.l1-mission-strip,.l1-body{position:relative;z-index:5}
            .l1-top-hud{display:flex;align-items:stretch;min-height:60px;border-bottom:1px solid var(--l1-rim);background:rgba(0,8,20,.95);flex-shrink:0}
            .l1-hud-logo{display:flex;align-items:center;gap:12px;padding:0 24px;border-right:1px solid var(--l1-rim);flex-shrink:0}
            .l1-logo-badge{width:36px;height:36px;display:flex;align-items:center;justify-content:center;border:1px solid rgba(0,229,255,.32);color:var(--l1-cyan);font-size:13px;background:rgba(0,229,255,.08);box-shadow:0 0 18px rgba(0,229,255,.18);clip-path:polygon(50% 0%,100% 25%,100% 75%,50% 100%,0 75%,0 25%);animation:l1Pulse 2s infinite}
            .l1-logo-text{font-family:'Orbitron',sans-serif;font-size:22px;font-weight:800;letter-spacing:6px;color:var(--l1-cyan);text-shadow:0 0 16px rgba(0,229,255,.2)}
            .l1-hud-kicker,.l1-hud-label,.l1-card__id,.l1-card__state,.l1-tag,.l1-hud-btn,.l1-attempts,.l1-submit-label,.l1-submit-points-label,.l1-console-title,.l1-console-chip,.l1-risk-row,.l1-phase,.l1-mission-status{font-family:'Share Tech Mono',monospace;text-transform:uppercase}
            .l1-hud-mission{display:flex;flex-direction:column;justify-content:center;padding:0 24px;border-right:1px solid var(--l1-rim);min-width:220px}
            .l1-hud-kicker{font-size:8px;letter-spacing:.26em;color:var(--l1-text-mid);margin-bottom:4px}
            .l1-hud-title{font-family:'Orbitron',sans-serif;font-size:15px;font-weight:700;letter-spacing:.18em;line-height:1.25;color:var(--l1-white);text-transform:uppercase}
            .l1-hud-stats{display:flex;align-items:stretch;margin-left:auto;min-width:0}
            .l1-hud-stat{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0 20px;border-left:1px solid var(--l1-rim);min-width:84px}
            .l1-hud-meter{display:flex;align-items:center;gap:12px;padding:0 24px;border-left:1px solid var(--l1-rim);min-width:164px}
            .l1-hud-label{font-size:8px;letter-spacing:.24em;color:var(--l1-text-low);margin-bottom:2px}
            .l1-hud-value{font-family:'Orbitron',sans-serif;font-size:24px;font-weight:700;letter-spacing:.08em;line-height:1;color:var(--l1-cyan)}
            .l1-hud-value--cyan{color:var(--l1-gold)}
            .l1-hud-value--red{color:var(--l1-red)}
            #l1-timer.danger{color:var(--l1-red);text-shadow:0 0 16px rgba(255,53,94,.32)}
            .l1-hud-track{flex:1;height:6px;background:rgba(0,229,255,.12);border-radius:999px;overflow:hidden}
            .l1-hud-fill{height:100%;background:linear-gradient(90deg,var(--l1-green),var(--l1-cyan));box-shadow:0 0 12px rgba(0,229,255,.24);transition:width .35s ease}
            .l1-hud-actions{display:flex;align-items:center;gap:8px;padding:0 16px;border-left:1px solid var(--l1-rim)}
            .l1-hud-btn{padding:8px 12px;border:1px solid rgba(0,229,255,.24);background:rgba(4,16,36,.6);color:var(--l1-text-mid);font-size:9px;letter-spacing:.18em;cursor:pointer;transition:all .2s ease}
            .l1-hud-btn:hover{border-color:var(--l1-cyan);color:var(--l1-cyan);box-shadow:0 0 18px rgba(0,229,255,.14)}
            .l1-mission-strip{display:flex;align-items:center;gap:14px;height:38px;padding:0 24px;border-bottom:1px solid rgba(0,229,255,.08);background:rgba(3,10,20,.92);flex-shrink:0}
            .l1-phase{display:flex;align-items:center;gap:8px;font-size:9px;letter-spacing:.18em;color:var(--l1-text-low)}
            .l1-phase strong{font-family:'Orbitron',sans-serif;font-size:13px;letter-spacing:.08em;font-weight:700}
            .l1-phase__dot{width:8px;height:8px;border-radius:50%;background:rgba(23,216,255,.14);flex-shrink:0}
            .l1-phase.active{color:var(--l1-cyan)}
            .l1-phase.active .l1-phase__dot{background:var(--l1-cyan);box-shadow:0 0 14px rgba(0,229,255,.42)}
            .l1-phase-sep{color:rgba(0,229,255,.24);font-size:14px}
            .l1-mission-status{margin-left:auto;display:flex;align-items:center;gap:8px;font-size:9px;letter-spacing:.18em;color:var(--l1-green);text-shadow:0 0 12px rgba(0,255,136,.24)}
            .l1-mission-status__dot{width:8px;height:8px;background:var(--l1-green);box-shadow:0 0 12px rgba(0,255,136,.75);animation:l1Blink 1s step-end infinite}
            .l1-body{flex:1;min-width:0;min-height:0;display:grid;grid-template-columns:minmax(0,1fr) 380px;overflow:hidden}
            .l1-arena{display:flex;flex-direction:column;min-width:0;min-height:0;border-right:1px solid var(--l1-rim)}
            .l1-arena-header{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;padding:18px 24px 14px;border-bottom:1px solid rgba(0,229,255,.08);background:rgba(3,10,20,.72);flex-shrink:0}
            .l1-arena-title{font-family:'Orbitron',sans-serif;font-size:clamp(34px,3.5vw,52px);font-weight:800;letter-spacing:.14em;line-height:1.08;color:var(--l1-white);text-transform:uppercase}
            .l1-arena-title span{color:var(--l1-red);text-shadow:0 0 18px rgba(255,53,94,.24)}
            .l1-arena-sub{margin-top:6px;font-size:10px;letter-spacing:.12em;color:var(--l1-text-mid);font-family:'Share Tech Mono',monospace;text-transform:uppercase}
            .l1-arena-hint{max-width:280px;text-align:right;font-size:10px;letter-spacing:.08em;line-height:1.6;color:var(--l1-text-mid);font-family:'Share Tech Mono',monospace}
            .l1-arena-hint b{color:var(--l1-cyan);font-weight:700}
            .l1-arena-scroll{flex:1;min-height:0;overflow-y:auto;overflow-x:hidden;padding:16px 24px;scrollbar-width:thin;scrollbar-color:rgba(23,216,255,.28) transparent}
            .l1-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
            .l1-card{position:relative;overflow:hidden;padding:0;border:1px solid rgba(0,229,255,.1);background:rgba(3,14,32,.9);color:var(--l1-text);text-align:left;cursor:pointer;transition:border-color .2s ease,transform .2s ease,box-shadow .2s ease}
            .l1-card:hover{border-color:var(--l1-cyan);transform:translateX(4px);box-shadow:-4px 0 0 rgba(23,216,255,.48),0 0 28px rgba(23,216,255,.12)}
            .l1-card.selected.flagged{border-color:var(--l1-red);background:rgba(22,4,14,.96);box-shadow:0 0 0 1px rgba(255,63,120,.22) inset,0 0 28px rgba(255,63,120,.14)}
            .l1-card.selected.clear{border-color:var(--l1-green);background:rgba(0,12,11,.96);box-shadow:0 0 0 1px rgba(0,255,136,.18) inset,0 0 28px rgba(0,255,136,.12)}
            .l1-card__accent{height:2px;background:var(--l1-rim2);transition:background .3s ease}
            .l1-card:hover .l1-card__accent{background:var(--l1-cyan)}
            .l1-card.selected.flagged .l1-card__accent{background:var(--l1-red);box-shadow:0 0 10px rgba(255,63,120,.42)}
            .l1-card.selected.clear .l1-card__accent{background:var(--l1-green);box-shadow:0 0 10px rgba(0,255,136,.38)}
            .l1-card__body{padding:16px}
            .l1-card__top{display:flex;justify-content:space-between;gap:10px;align-items:flex-start;margin-bottom:10px}
            .l1-card__id{font-size:10px;letter-spacing:1px;color:var(--l1-text-mid)}
            .l1-card__state{font-size:9px;letter-spacing:2px;font-weight:700;opacity:0;transition:opacity .25s ease}
            .l1-card.selected.flagged .l1-card__state{opacity:1;color:var(--l1-red)}
            .l1-card.selected.clear .l1-card__state{opacity:1;color:var(--l1-green)}
            .l1-card__value{font-family:'Orbitron',sans-serif;font-size:24px;font-weight:700;letter-spacing:.08em;line-height:1.2;color:var(--l1-cyan);margin-bottom:10px;word-break:break-all;text-shadow:0 0 10px rgba(0,229,255,.18)}
            .l1-card.selected.flagged .l1-card__value{color:var(--l1-red);text-shadow:0 0 14px rgba(255,63,120,.24)}
            .l1-card.selected.clear .l1-card__value{color:var(--l1-green);text-shadow:0 0 14px rgba(0,255,136,.22)}
            .l1-card__tags{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px}
            .l1-tag{display:inline-flex;align-items:center;padding:2px 8px;border:1px solid;font-size:8px;letter-spacing:2px}
            .l1-tag--danger{color:#ffd4e1;border-color:rgba(255,63,120,.32);background:rgba(255,63,120,.08)}
            .l1-tag--warn{color:#ffe59b;border-color:rgba(255,204,0,.28);background:rgba(255,204,0,.08)}
            .l1-tag--safe{color:#a8fff0;border-color:rgba(0,255,136,.28);background:rgba(0,255,136,.08)}
            .l1-tag--neutral{color:var(--l1-cyan);border-color:rgba(23,216,255,.24);background:rgba(23,216,255,.06)}
            .l1-card__entropy{display:flex;align-items:center;gap:8px;margin-bottom:10px}
            .l1-card__entropy-track{flex:1;height:3px;background:rgba(23,216,255,.12)}
            .l1-card__entropy-fill{height:100%}
            .l1-card__entropy-fill.low{background:var(--l1-red);box-shadow:0 0 6px rgba(255,63,120,.42)}
            .l1-card__entropy-fill.mid{background:var(--l1-gold)}
            .l1-card__entropy-fill.high{background:var(--l1-green);box-shadow:0 0 6px rgba(0,255,136,.34)}
            .l1-card__entropy-value{min-width:28px;text-align:right;font-size:9px;color:var(--l1-text-low)}
            .l1-feedback{margin-bottom:12px;padding:12px 14px;border:1px solid rgba(0,229,255,.1);background:rgba(3,14,32,.84);color:var(--l1-text-mid);line-height:1.65;font-size:11px}
            .l1-submit-dock{display:flex;align-items:center;gap:20px;padding:16px 24px;border-top:1px solid rgba(0,229,255,.08);background:rgba(3,10,20,.88);flex-shrink:0;min-width:0}
            .l1-submit-cluster{display:flex;align-items:center;gap:8px;min-width:0}
            .l1-submit-cluster--summary{margin-left:auto;display:flex;flex-direction:column;align-items:flex-end;gap:0}
            .l1-submit-label{margin-right:4px;font-size:9px;letter-spacing:2px;color:var(--l1-text-low)}
            .l1-flag-slots{display:flex;align-items:center;gap:8px}
            .l1-flag-slot{width:44px;height:28px;display:flex;align-items:center;justify-content:center;border:1px solid var(--l1-rim2);background:rgba(0,229,255,.03);color:var(--l1-text-low);font-family:'Orbitron',sans-serif;font-size:11px;letter-spacing:.06em;transition:all .3s ease}
            .l1-flag-slot.active{border-color:var(--l1-red);background:rgba(255,63,120,.08);color:var(--l1-red);box-shadow:0 0 10px rgba(255,63,120,.16)}
            .l1-submit-value{font-family:'Orbitron',sans-serif;font-size:24px;font-weight:700;letter-spacing:.08em;color:var(--l1-cyan);line-height:1}
            .l1-submit-value.neg{color:var(--l1-red)}
            .l1-submit-points-label{font-size:8px;letter-spacing:2px;color:var(--l1-text-low)}
            .l1-submit-meta{min-width:112px;text-align:right}
            .l1-attempts{color:var(--l1-text-low);font-size:8px;letter-spacing:2px}
            .l1-attempts span.is-hot{color:var(--l1-red)}
            .l1-fire-btn{margin-left:4px;border:1px solid rgba(0,229,255,.24);background:rgba(0,229,255,.08);color:var(--l1-cyan);font-family:'Share Tech Mono',monospace;font-size:11px;font-weight:700;letter-spacing:.2em;padding:12px 28px;cursor:pointer;transition:all .2s ease}
            .l1-fire-btn:hover{background:rgba(0,229,255,.18);transform:translateY(-1px);box-shadow:0 10px 32px rgba(0,229,255,.2)}
            .l1-fire-btn:disabled,.l1-fire-btn:disabled:hover{background:rgba(168,216,232,.18);color:rgba(3,7,13,.48);cursor:not-allowed;transform:none;box-shadow:none}
            .l1-console{display:flex;flex-direction:column;gap:0;min-width:0;min-height:0;overflow:hidden;background:rgba(3,10,24,.98)}
            .l1-console-panel{position:relative;padding:18px 20px;background:rgba(3,10,24,.94);border-bottom:1px solid rgba(0,229,255,.08);flex-shrink:0}
            .l1-console-panel--fill{display:flex;flex-direction:column;flex:1;min-height:0}
            .l1-console-title{display:flex;align-items:center;gap:8px;margin-bottom:12px;font-size:9px;letter-spacing:.24em;color:var(--l1-text-low)}
            .l1-console-title::before{content:'//';color:var(--l1-cyan);font-size:11px}
            .l1-dial-wrap{position:relative;width:160px;height:160px;margin:0 auto 16px}
            .l1-dial-wrap::after{content:'';position:absolute;inset:-10px;border:1px solid rgba(0,229,255,.08);border-radius:50%;animation:l1Spin 20s linear infinite}
            .l1-dial-svg{width:100%;height:100%;transform:rotate(-90deg)}
            .l1-dial-bg{fill:none;stroke:rgba(0,229,255,.12);stroke-width:8}
            .l1-dial-ring{fill:none;stroke:var(--l1-red);stroke-width:8;stroke-linecap:round;stroke-dasharray:408;stroke-dashoffset:408;filter:drop-shadow(0 0 6px rgba(255,53,94,.34));transition:stroke-dashoffset .5s ease}
            .l1-dial-inner{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}
            .l1-dial-num{font-family:'Orbitron',sans-serif;font-size:38px;font-weight:700;letter-spacing:.08em;line-height:1;color:var(--l1-red);text-shadow:0 0 16px rgba(255,53,94,.32)}
            .l1-dial-sub{margin-top:2px;font-size:9px;letter-spacing:.24em;color:var(--l1-text-low)}
            .l1-threat-bars{display:flex;flex-direction:column;gap:8px;width:100%;margin-top:16px}
            .l1-threat-row{display:flex;flex-direction:column;gap:3px}
            .l1-threat-top{display:flex;justify-content:space-between;gap:12px;font-size:9px;letter-spacing:.08em;color:var(--l1-text-mid)}
            .l1-threat-track,.l1-risk-track{height:3px;background:rgba(0,229,255,.12)}
            .l1-threat-fill,.l1-risk-fill{height:100%}
            .tone-danger{color:var(--l1-red)}
            .tone-warn{color:var(--l1-gold)}
            .tone-safe{color:var(--l1-green)}
            .l1-threat-fill.tone-danger{background:var(--l1-red);box-shadow:0 0 6px rgba(255,63,120,.28)}
            .l1-threat-fill.tone-warn{background:var(--l1-gold)}
            .l1-threat-fill.tone-safe,.l1-risk-fill{background:var(--l1-green);box-shadow:0 0 6px rgba(0,255,136,.22)}
            .l1-objective-list{display:flex;flex-direction:column;gap:0}
            .l1-objective{display:flex;gap:10px;align-items:flex-start;padding:8px 0;border-bottom:1px solid rgba(0,229,255,.06)}
            .l1-objective:last-child{border-bottom:0}
            .l1-objective__icon{width:18px;height:18px;display:flex;align-items:center;justify-content:center;border:1px solid var(--l1-rim2);font-size:9px;color:var(--l1-text-low);flex-shrink:0;margin-top:1px}
            .l1-objective__text{font-size:11px;line-height:1.5;color:var(--l1-text-mid)}
            .l1-objective.on .l1-objective__icon{border-color:var(--l1-cyan);color:var(--l1-cyan);background:rgba(0,229,255,.08);box-shadow:0 0 8px rgba(0,229,255,.16)}
            .l1-objective.on .l1-objective__text{color:var(--l1-text)}
            .l1-objective.done .l1-objective__icon{border-color:rgba(0,255,136,.36);color:var(--l1-green);background:rgba(0,255,136,.08)}
            .l1-objective.done .l1-objective__text{color:#baffdf}
            .l1-console-head{display:flex;justify-content:space-between;align-items:center;gap:12px}
            .l1-console-chip{padding:5px 9px;border:1px solid rgba(0,229,255,.24);background:rgba(0,229,255,.08);color:var(--l1-cyan);font-size:9px;letter-spacing:.18em}
            .l1-risk-row{display:flex;align-items:center;gap:12px;margin:12px 0 14px;font-size:9px;letter-spacing:.18em;color:var(--l1-text-low)}
            .l1-risk-row .l1-risk-track{flex:1}
            .l1-risk-text{min-width:38px;text-align:right;color:var(--l1-red)}
            .l1-hint-stack{display:flex;flex-direction:column;gap:8px;margin-bottom:12px}
            .l1-hint{padding:10px 12px;border-left:2px solid var(--l1-cyan);background:rgba(0,229,255,.05);color:var(--l1-text);font-size:11px;line-height:1.6}
            .l1-log-body{flex:1;min-height:0;overflow-y:auto;overflow-x:hidden;padding-right:4px;font-size:11px;line-height:1.8;color:var(--l1-text-mid)}
            .l1-log-line{display:block}
            .l1-log-time{color:var(--l1-text-low);margin-right:8px}
            .l1-log-sys{color:var(--l1-cyan)}
            .l1-log-warn{color:var(--l1-gold)}
            .l1-log-ok{color:var(--l1-green)}
            .l1-log-danger{color:var(--l1-red)}
            .l1-log-cursor{display:inline-block;width:8px;height:12px;margin-left:4px;background:var(--l1-cyan);vertical-align:middle;animation:l1Blink 1s step-end infinite}
            .l1-arena-scroll::-webkit-scrollbar,.l1-log-body::-webkit-scrollbar{width:4px}
            .l1-arena-scroll::-webkit-scrollbar-thumb,.l1-log-body::-webkit-scrollbar-thumb{background:rgba(0,229,255,.28);border-radius:999px}
            @media (max-width:1280px){.l1-body{grid-template-columns:minmax(0,1fr) 350px}.l1-arena-title{font-size:clamp(30px,3vw,44px)}}
            @media (max-width:1080px){.l1-shell{overflow:auto}.l1-top-hud{flex-wrap:wrap}.l1-hud-logo,.l1-hud-mission{border-right:0}.l1-hud-stats{order:3;width:100%;margin-left:0}.l1-hud-actions{margin-left:auto}.l1-body{grid-template-columns:1fr;height:auto;overflow:visible}}
            @media (max-width:760px){.l1-top-hud,.l1-mission-strip,.l1-arena-header,.l1-arena-scroll,.l1-submit-dock,.l1-console-panel{padding-left:16px;padding-right:16px}.l1-mission-strip{flex-wrap:wrap;height:auto;padding-top:10px;padding-bottom:10px}.l1-mission-status{width:100%;margin-left:0}.l1-arena-header{flex-direction:column;align-items:flex-start}.l1-arena-hint{text-align:left;max-width:none}.l1-grid{grid-template-columns:1fr}.l1-submit-dock{flex-wrap:wrap}.l1-submit-cluster--summary,.l1-submit-meta{margin-left:0;align-items:flex-start;text-align:left}.l1-fire-btn{width:100%;margin-left:0}.l1-hud-actions,.l1-hud-stats{width:100%;border-left:0}.l1-hud-stats{flex-wrap:wrap}.l1-hud-meter{min-width:0;flex:1 1 180px}}
        </style>`;
    }

    renderSaltDemoPanel(container) {
        const demo = this.puzzleData.saltDemoPanel;
        const examplesHtml = (demo.examples || []).map(ex => `
            <div style="background:var(--darker-bg);border:1px solid var(--panel-border);padding:12px;margin-bottom:10px;border-radius:4px;">
                <div style="color:var(--text-secondary);font-size:0.8rem;margin-bottom:6px;">${ex.label}</div>
                <div style="display:flex;gap:10px;flex-wrap:wrap;font-family:var(--font-mono);font-size:0.85rem;">
                    <span style="color:var(--cyber-orange);">Password: <strong>${demo.password}</strong></span>
                    <span style="color:var(--cyber-blue);">+ Salt: <strong>${ex.salt}</strong></span>
                </div>
                <div style="margin-top:8px;color:var(--cyber-green);font-family:var(--font-mono);font-size:0.8rem;word-break:break-all;">
                    → Stored hash: ${ex.hash}
                </div>
            </div>`).join('');

        container.innerHTML = `
            <div class="password-puzzle">
                <h2 class="puzzle-title">LEVEL 6: SALT DEMONSTRATION</h2>
                <div class="password-brief">
                    <div><strong>OBJECTIVE:</strong> ${this.mission.objective || ''}</div>
                    <div><strong>SCENARIO:</strong> ${this.mission.scenario || ''}</div>
                </div>
                <div class="password-hints">
                    <strong style="color:var(--cyber-blue);">${demo.heading}</strong>
                    <p style="color:var(--text-secondary);margin:10px 0 14px;">${demo.description}</p>
                    ${examplesHtml}
                    <div style="margin-top:14px;padding:12px;background:rgba(0,243,255,0.07);border:1px solid rgba(0,243,255,0.3);border-radius:4px;">
                        <strong style="color:var(--cyber-blue);">Key insight:</strong>
                        <span style="color:var(--text-secondary);margin-left:6px;">${demo.takeaway}</span>
                    </div>
                </div>
                <div class="guess-feedback" id="guess-feedback" style="margin-top:16px;">
                    Same password. Different salt. Completely different hash — every single time.
                </div>
                <div class="puzzle-actions">
                    <button class="btn btn-primary" id="salt-demo-continue">${demo.continueLabel || 'Continue to selection task'}</button>
                </div>
            </div>`;

        document.getElementById('salt-demo-continue').addEventListener('click', () => {
            this.saltDemoCompleted = true;
            this.audio.playButtonClick();
            this.renderMultiSelectGrid(container);
        });
    }

    renderMultiSelectGrid(container) {
        const story = this.session?.storyHint || this.mission.scenario || '';
        const options = this.session?.options || [];
        const optionMarkup = options.map(opt => `
            <button class="password-option" data-option-id="${opt.id}" type="button">${opt.value}</button>`).join('');

        container.innerHTML = `
            <div class="password-puzzle">
                <h2 class="puzzle-title">PASSWORD PSYCHOLOGY ANALYSIS</h2>
                <div class="password-brief">
                    <div><strong>OBJECTIVE:</strong> ${this.mission.objective || 'Classify weak credentials.'}</div>
                    <div><strong>SCENARIO:</strong> ${story}</div>
                    <div><strong>TASK:</strong> Select weak passwords only. Avoid selecting strong credentials.</div>
                </div>
                ${this.riskSystem ? `
                    <div class="password-risk-panel">
                        <div class="password-risk-header">
                            <span>${this.riskSystem.label || 'Risk Meter'}</span>
                            <span id="risk-text">0%</span>
                        </div>
                        <div class="progress-bar"><div class="progress-fill" id="risk-fill" style="width:0%;"></div></div>
                    </div>` : ''}
                <div class="password-hints" id="password-hints">
                    <strong style="color:var(--cyber-blue);">INVESTIGATIVE STORY HINT:</strong>
                    <div class="hint">→ ${story}</div>
                </div>
                <div class="password-options-grid" id="password-options-grid">${optionMarkup}</div>
                <div class="guess-feedback" id="guess-feedback">Select suspected weak passwords, then submit your classification.</div>
                <div class="puzzle-actions">
                    <button class="btn btn-primary" id="submit-selection">SUBMIT ANALYSIS</button>
                    <button class="btn" id="clear-selection">CLEAR SELECTION</button>
                </div>
                <div id="attempt-counter" style="text-align:center;margin-top:20px;color:var(--text-secondary);">
                    Submissions: <span style="color:var(--cyber-blue);">${this.attempts}</span> / ${this.maxAttempts}
                </div>
            </div>`;

        this.setupMultiSelectEventListeners();
        this.updateRiskDisplay();
    }

    setupMultiSelectEventListeners() {
        document.querySelectorAll('[data-option-id]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.optionId, 10);
                if (Number.isNaN(id)) return;
                if (this.selectedOptions.has(id)) {
                    this.selectedOptions.delete(id);
                    btn.classList.remove('selected');
                    if (this.interactionMode === 'humanPsychologyLab') {
                        this.pushHumanLabLog('sys', `Entry ${String(id).padStart(2, '0')} removed from analyst shortlist.`);
                    }
                } else {
                    this.selectedOptions.add(id);
                    btn.classList.add('selected');
                    if (this.interactionMode === 'humanPsychologyLab') {
                        const option = (this.session?.options || []).find(entry => entry.id === id);
                        this.pushHumanLabLog('warn', `Entry ${String(id).padStart(2, '0')} queued for review: ${option?.value || 'Unknown credential'}.`);
                    }
                }
                this.audio.playButtonClick();
                if (this.interactionMode === 'humanPsychologyLab') {
                    this.updateHumanPsychologyLiveUI();
                }
            });
        });
        document.getElementById('submit-selection')?.addEventListener('click', () => this.submitMultiSelectSelection());
        document.getElementById('clear-selection')?.addEventListener('click', () => this.clearMultiSelectSelection());
    }

    renderSaltReuseLab(container) {
        this.visualizerElement = container;
        const config = this.getSaltReuseLabConfig();
        const state = this.saltReuseState || {};
        const isFinished = !!state.completion;
        const sharedPhases = [
            { label: 'HASH FORGE', active: state.phase === 1 && !isFinished, done: state.phase > 1 || isFinished },
            { label: 'ATTACK SIM', active: state.phase === 2 && !isFinished, done: state.phase > 2 || isFinished },
            { label: 'CLASSIFIER', active: state.phase === 3 && !isFinished, done: isFinished }
        ];

        if (state.completion) {
            container.innerHTML = `
                ${this.renderSaltReuseLabStyles()}
                ${this.renderSharedPasswordLabThemeStyles()}
                ${this.renderSharedPasswordLabFrame({
                    levelLabel: '// LEVEL 06 - CRYPTOGRAPHY LAB',
                    title: 'SALT & REUSE<br>RISK',
                    status: state.completion.success ? 'CRYPTOGRAPHY LAB COMPLETE' : 'CRYPTOGRAPHY LAB REVIEW',
                    phases: sharedPhases,
                    content: `
                        <div class="srl-shell">
                            <div class="srl-completion">
                                <div class="srl-completion-badge">${state.completion.success ? 'OK' : '!!'}</div>
                                <div class="srl-completion-title">${state.completion.success ? 'LEVEL 6 COMPLETE' : 'LEVEL 6 REVIEW'}</div>
                                <div class="srl-completion-sub">${state.completion.success ? 'SALT & REUSE RISK - MASTERED' : 'REASSESS SHARED HASH RISK'}</div>
                                <div class="srl-completion-card">
                                    <div class="srl-section-kicker">Security Knowledge Unlocked</div>
                                    ${(this.mission.knowledgeSummary?.bullets || []).map(item => `
                                        <div class="srl-completion-item">
                                            <span class="srl-completion-arrow">></span>
                                            <span>${item}</span>
                                        </div>`).join('')}
                                    ${this.mission.knowledgeSummary?.insight ? `<div class="srl-completion-insight">${this.mission.knowledgeSummary.insight}</div>` : ''}
                                </div>
                            </div>
                        </div>`
                })}`;
            this.startHumanLabMatrixAnimation();
            this.gameScreen.syncEmbeddedMissionHUD();
            return;
        }

        const phaseContent = state.phase === 1
            ? this.renderSaltReusePhaseOne(config, state)
            : state.phase === 2
                ? this.renderSaltReusePhaseTwo(config, state)
                : this.renderSaltReusePhaseThree(config, state);

        container.innerHTML = `
            ${this.renderSaltReuseLabStyles()}
            ${this.renderSharedPasswordLabThemeStyles()}
            ${this.renderSharedPasswordLabFrame({
                levelLabel: '// LEVEL 06 - CRYPTOGRAPHY LAB',
                title: 'SALT & REUSE<br>RISK',
                status: 'CRYPTOGRAPHY LAB ACTIVE',
                phases: sharedPhases,
                content: `
                    <div class="srl-shell">
                        <div class="srl-header">
                            <div class="srl-brand">SHADOWDEF</div>
                            <div class="srl-level">LEVEL 6 - SALT & REUSE RISK</div>
                            <div class="srl-status">CRYPTOGRAPHY LAB ACTIVE</div>
                        </div>
                        <div class="srl-phases">
                            <div class="srl-phase ${state.phase === 1 ? 'active' : ''} ${state.phase > 1 ? 'done' : ''}"><span>01</span>Hash Forge Lab</div>
                            <div class="srl-phase ${state.phase === 2 ? 'active' : ''} ${state.phase > 2 ? 'done' : ''}"><span>02</span>Attack Simulator</div>
                            <div class="srl-phase ${state.phase === 3 ? 'active' : ''}"><span>03</span>Threat Classifier</div>
                        </div>
                        ${phaseContent}
                    </div>`
            })}`;

        this.setupSaltReuseLabEventListeners();
        this.startHumanLabMatrixAnimation();
        this.gameScreen.syncEmbeddedMissionHUD();
    }

    renderSaltReusePhaseBrief({ phaseLabel = '', title = '', copy = '', chips = [] }) {
        const chipMarkup = chips.map(chip => `
            <div class="srl-phase-chip ${chip.state ? `is-${chip.state}` : ''}">
                ${chip.label}
            </div>`).join('');

        return `
            <div class="srl-phase-brief">
                ${phaseLabel ? `<div class="srl-phase-brief__eyebrow">${phaseLabel}</div>` : ''}
                ${title ? `<div class="srl-phase-brief__title">${title}</div>` : ''}
                ${copy ? `<div class="srl-phase-brief__copy">${copy}</div>` : ''}
                ${chipMarkup ? `<div class="srl-phase-brief__chips">${chipMarkup}</div>` : ''}
            </div>`;
    }

    renderSaltReusePanelHead({ eyebrow = '', title = '', copy = '' }) {
        return `
            <div class="srl-panel-head">
                ${eyebrow ? `<div class="srl-panel-eyebrow">${eyebrow}</div>` : ''}
                ${title ? `<div class="srl-panel-title">${title}</div>` : ''}
                ${copy ? `<div class="srl-panel-copy">${copy}</div>` : ''}
            </div>`;
    }

    renderSaltReusePhaseOne(config, state) {
        const quickPicks = Array.isArray(config.quickPicks) ? config.quickPicks : [];
        const salts = Array.isArray(config.fixedSalts) && config.fixedSalts.length >= 2
            ? config.fixedSalts
            : ['yR!x2v&*', 'RUnO1oBW'];
        const password = state.forgeInput || 'password';
        const hashA = state.hashA || 'Waiting for input...';
        const hashB = state.hashB || 'Waiting for input...';
        const divergenceMarkup = state.hashA && state.hashB
            ? Array.from({ length: Math.max(state.hashA.length, state.hashB.length) }, (_, idx) => {
                const same = state.hashA[idx] && state.hashB[idx] && state.hashA[idx] === state.hashB[idx];
                return `<div class="srl-div-seg ${same ? 'match' : 'diff'}"></div>`;
            }).join('')
            : Array.from({ length: 16 }, () => '<div class="srl-div-seg"></div>').join('');
        const phaseOneAnswers = [
            {
                id: 'same_hash_everywhere',
                label: 'Cracking one user reveals every identical password instantly, even with salt.',
                description: 'This is false because per-user salt forces each hash to be solved separately.'
            },
            {
                id: 'salt_breaks_shared_path',
                label: 'Salt breaks shared crack paths because the same password stores as different hashes per user.',
                description: 'This is the key security property you need to recognize before moving on.'
            },
            {
                id: 'salt_makes_weak_strong',
                label: 'Salt makes weak passwords effectively strong, so attackers stop guessing them.',
                description: 'This is false because weak passwords are still easy to guess; salt only isolates records.'
            }
        ];
        const phaseOneChoiceMarkup = phaseOneAnswers.map(answer => `
            <label class="srl-check-card ${state.phaseOneSelectedAnswer === answer.id ? 'selected' : ''}">
                <input type="radio" name="srl-phase1-check" value="${answer.id}" ${state.phaseOneSelectedAnswer === answer.id ? 'checked' : ''}/>
                <div class="srl-check-card__copy">
                    <div class="srl-check-card__title">${answer.label}</div>
                    <div class="srl-check-card__desc">${answer.description}</div>
                </div>
            </label>`).join('');
        const phaseOneGateMessage = state.phaseOneValidated
            ? 'Phase 2 unlocked. Continue to the attack simulator.'
            : state.insightVisible
                ? 'To unlock phase 2, choose the correct knowledge-check answer: salt breaks shared crack paths because identical passwords store as different hashes per user.'
                : 'To unlock phase 2, first forge a salted hash so the knowledge check appears.';
        const phaseBrief = this.renderSaltReusePhaseBrief({
            phaseLabel: 'Phase 1 · Hash Forge Lab',
            title: 'Prove that identical passwords become different stored records.',
            copy: 'Generate two salted hashes side by side, compare how much the outputs diverge, then clear the knowledge check to unlock the attack simulator.',
            chips: [
                { label: state.hashA && state.hashB ? 'Hash forged' : 'Forge a salted hash', state: state.hashA && state.hashB ? 'success' : 'active' },
                { label: state.insightVisible ? 'Comparison insight unlocked' : 'Reveal the comparison insight', state: state.insightVisible ? 'success' : '' },
                { label: state.phaseOneValidated ? 'Knowledge check passed' : 'Pass the knowledge check', state: state.phaseOneValidated ? 'success' : '' }
            ]
        });

        return `
            <div class="srl-hint-strip">HINT: Type any password below and watch what salt does to the stored output.</div>
            <div class="srl-phase-screen srl-phase-screen--lab">
                ${phaseBrief}
                <div class="srl-lab">
                    <div class="srl-panel srl-panel-left">
                        ${this.renderSaltReusePanelHead({
                            eyebrow: 'Input Console',
                            title: 'Choose a password to salt',
                            copy: 'Use a quick pick or type your own credential. The goal is to prove that the password stays the same while the stored hash does not.'
                        })}
                        <div class="srl-brief-box">
                            Salt is <strong>random data added to a password before hashing</strong>.
                            Two users with identical passwords get completely different stored values.
                            This destroys rainbow table attacks and prevents chain-cracking.
                        </div>
                        <label class="srl-label" for="srl-pw-input">ENTER PASSWORD TO HASH</label>
                        <input id="srl-pw-input" class="srl-input" type="text" value="${state.forgeInput || ''}" placeholder="e.g. password123" maxlength="32" autocomplete="off" spellcheck="false">
                        <div class="srl-label">QUICK PICKS - COMMON PASSWORDS</div>
                        <div class="srl-quick-picks">
                            ${quickPicks.map(pw => `<button class="srl-quick-btn" type="button" data-srl-quick="${pw}">${pw}</button>`).join('')}
                        </div>
                        <button class="srl-primary-btn" id="srl-forge-btn" type="button">FORGE HASH WITH SALT</button>
                    </div>
                    <div class="srl-panel">
                        ${this.renderSaltReusePanelHead({
                            eyebrow: 'Comparison Output',
                            title: 'Alice and Bob store different hashes',
                            copy: 'The password stays identical, but each user-specific salt forces a different stored result and breaks the shared crack path.'
                        })}
                        <div class="srl-reactor">
                            <div class="srl-reactor-grid">
                                <div class="srl-reactor-cell ${state.hashA ? 'firing' : ''}">
                                    <div class="srl-reactor-top">
                                        <div class="srl-reactor-id">REACTOR A - USER ALICE</div>
                                        <div class="srl-salt-pill">SALT: ${salts[0]}</div>
                                    </div>
                                    <div class="srl-formula">
                                        <span class="srl-token pw">${password.length > 12 ? `${password.slice(0, 12)}...` : password}</span>
                                        <span>+</span>
                                        <span class="srl-token salt">${salts[0]}</span>
                                        <span>&rarr;</span>
                                    </div>
                                    <div class="srl-hash-output ${state.hashA ? 'has-value' : ''}">${hashA}</div>
                                </div>
                                <div class="srl-reactor-cell ${state.hashB ? 'firing' : ''}">
                                    <div class="srl-reactor-top">
                                        <div class="srl-reactor-id">REACTOR B - USER BOB</div>
                                        <div class="srl-salt-pill">SALT: ${salts[1]}</div>
                                    </div>
                                    <div class="srl-formula">
                                        <span class="srl-token pw">${password.length > 12 ? `${password.slice(0, 12)}...` : password}</span>
                                        <span>+</span>
                                        <span class="srl-token salt">${salts[1]}</span>
                                        <span>&rarr;</span>
                                    </div>
                                    <div class="srl-hash-output ${state.hashB ? 'has-value' : ''}">${hashB}</div>
                                </div>
                            </div>
                        </div>
                        <div class="srl-divergence">
                            <div class="srl-section-kicker">Hash Divergence Analysis</div>
                            <div class="srl-div-track">${divergenceMarkup}</div>
                            <div class="srl-div-stats">
                                <span>Chars matching: <strong>${state.hashA ? state.divergence.matches : '--'}</strong></span>
                                <span>Chars different: <strong>${state.hashA ? state.divergence.diffs : '--'}</strong></span>
                            </div>
                        </div>
                        <div class="srl-insight ${state.insightVisible ? 'visible' : ''}">
                            <strong>Same password. Two salts. No shared crack path.</strong>
                            Alice and Bob both used <span class="accent">${state.forgeInput ? `"${state.forgeInput}"` : '"password123"'}</span>,
                            but cracking Alice's hash still leaves Bob's record as a separate problem.
                        </div>
                        <div class="srl-knowledge-check ${state.insightVisible ? 'visible' : ''}">
                            <div class="srl-section-kicker">Knowledge Check</div>
                            <div class="srl-check-list">${phaseOneChoiceMarkup}</div>
                            <div class="srl-check-feedback ${state.phaseOneFeedback ? 'visible' : ''} ${state.phaseOneValidated ? 'success' : 'error'}">
                                ${state.phaseOneFeedback || 'Choose the statement that correctly explains why salt changes the attacker workflow.'}
                            </div>
                        </div>
                        <div class="srl-nav-row solo">
                            <div class="srl-gate-note ${state.phaseOneValidated ? 'ready' : ''}">${phaseOneGateMessage}</div>
                            <button class="srl-nav-btn" id="srl-phase1-next" type="button" ${state.phaseOneValidated ? '' : 'disabled'}>CONTINUE TO ATTACK SIMULATOR</button>
                        </div>
                    </div>
                </div>
            </div>`;
    }

    renderSaltReusePhaseTwo(config, state) {
        const attack = config.attackSimulator || {};
        const users = Array.isArray(attack.users) && attack.users.length ? attack.users : ['alice', 'bob', 'carol', 'dave', 'eve'];
        const unsaltedHash = attack.noSaltHash || '5f4dcc3b5aa765d6';
        const saltedHashes = Array.isArray(attack.saltedHashes) && attack.saltedHashes.length === users.length
            ? attack.saltedHashes
            : ['a3f8c2e1d74b56f0', '7c5d1f8b02e6a4c9', '2e9b4d7a15c8f3e0', 'f1a2b3c4d5e6f7a8', '9d8c7b6a5f4e3d2c'];
        const phaseTwoAnswers = [
            {
                id: 'salted_still_all_fall',
                label: 'Once Alice is cracked, the other salted users fall immediately too.',
                description: 'False. Salted records do not share a single crack result.'
            },
            {
                id: 'salted_isolate_work',
                label: 'Salted storage isolates work per user, so one crack does not unlock every matching account.',
                description: 'This is the correct operational difference shown by the simulator.'
            },
            {
                id: 'salt_prevents_breach',
                label: 'Salt prevents the database breach itself, so the attacker gets nothing useful.',
                description: 'False. Salt helps after theft, but it does not stop theft from happening.'
            }
        ];
        const phaseTwoChoiceMarkup = phaseTwoAnswers.map(answer => `
            <label class="srl-check-card ${state.phaseTwoSelectedAnswer === answer.id ? 'selected' : ''}">
                <input type="radio" name="srl-phase2-check" value="${answer.id}" ${state.phaseTwoSelectedAnswer === answer.id ? 'checked' : ''}/>
                <div class="srl-check-card__copy">
                    <div class="srl-check-card__title">${answer.label}</div>
                    <div class="srl-check-card__desc">${answer.description}</div>
                </div>
            </label>`).join('');
        const phaseBrief = this.renderSaltReusePhaseBrief({
            phaseLabel: 'Phase 2 · Attack Simulator',
            title: 'Compare the blast radius of one crack with and without salt.',
            copy: 'Run the unsalted scenario first, then the salted comparison. When you can explain the attacker workflow difference, the classifier unlocks.',
            chips: [
                { label: state.attackBadDone ? 'Unsalted chain reaction simulated' : 'Run scenario A first', state: state.attackBadDone ? 'success' : 'active' },
                { label: state.attackGoodDone ? 'Salted comparison simulated' : 'Run scenario B second', state: state.attackGoodDone ? 'success' : '' },
                { label: state.phaseTwoValidated ? 'Workflow check passed' : 'Answer the workflow check', state: state.phaseTwoValidated ? 'success' : '' }
            ]
        });

        return `
            <div class="srl-hint-strip">HINT: Watch what happens when an attacker cracks one hash, with and without salt.</div>
            <div class="srl-phase-screen srl-phase-screen--attack">
                ${phaseBrief}
                <div class="srl-attack-grid">
                    <div class="srl-panel srl-attack-panel danger">
                        ${this.renderSaltReusePanelHead({
                            eyebrow: 'Scenario A · No Salt',
                            title: 'One crack fans out across every matching user',
                            copy: 'Database stolen. All five users chose "password123". With no salt, every record shares the same stored hash.'
                        })}
                        <div class="srl-db-table">
                            <div class="srl-db-row header"><div>USER</div><div>STORED HASH</div></div>
                            ${users.map(user => `<div class="srl-db-row"><div class="user">${user}</div><div class="hash">${unsaltedHash}</div></div>`).join('')}
                        </div>
                        <div class="srl-observation bad">OBSERVATION: All 5 users have identical stored hashes</div>
                        <button class="srl-sim-btn bad" id="srl-crack-bad" type="button" ${state.attackBadDone ? 'disabled' : ''}>SIMULATE CRACK ATTEMPT</button>
                        <div class="srl-result ${state.attackBadDone ? 'visible bad' : ''}">
                            ${state.attackBadMessage || 'Run the simulation to see the chain reaction.'}
                        </div>
                        <div class="srl-chain">
                            ${state.attackBadRows.map(row => `<div class="srl-chain-row cracked"><span>x</span><strong>${row.user}</strong><em>${row.note}</em></div>`).join('')}
                        </div>
                    </div>
                    <div class="srl-panel srl-attack-panel safe">
                        ${this.renderSaltReusePanelHead({
                            eyebrow: 'Scenario B · With Salt',
                            title: 'Each record becomes its own cracking problem',
                            copy: 'Same passwords. New breach. Per-user salt produces unique hashes, so cracking Alice does not automatically unlock Bob.'
                        })}
                        <div class="srl-db-table">
                            <div class="srl-db-row header"><div>USER</div><div>STORED HASH (salted)</div></div>
                            ${users.map((user, idx) => `<div class="srl-db-row"><div class="user">${user}</div><div class="hash">${saltedHashes[idx]}</div></div>`).join('')}
                        </div>
                        <div class="srl-observation good">OBSERVATION: All 5 hashes are unique despite the same password</div>
                        <button class="srl-sim-btn good" id="srl-crack-good" type="button" ${state.attackBadDone && !state.attackGoodDone ? '' : 'disabled'}>SIMULATE CRACK ATTEMPT</button>
                        <div class="srl-result ${state.attackGoodDone ? 'visible good' : ''}">
                            ${state.attackGoodMessage || 'Crack the unsalted case first to compare outcomes.'}
                        </div>
                        <div class="srl-chain">
                            ${state.attackGoodRows.map(row => `<div class="srl-chain-row ${row.state}"><span>${row.icon}</span><strong>${row.user}</strong><em>${row.note}</em></div>`).join('')}
                        </div>
                    </div>
                </div>
                <div class="srl-check-panel">
                    <div class="srl-section-kicker">Attacker Workflow Check</div>
                    <div class="srl-check-list">${phaseTwoChoiceMarkup}</div>
                    <div class="srl-check-feedback ${state.phaseTwoFeedback ? 'visible' : ''} ${state.phaseTwoValidated ? 'success' : 'error'}">
                        ${state.phaseTwoFeedback || 'Choose the statement that best matches the difference between the two attack scenarios.'}
                    </div>
                </div>
                <div class="srl-nav-row">
                    <button class="srl-nav-btn" id="srl-phase2-back" type="button">BACK</button>
                    <button class="srl-nav-btn" id="srl-phase2-next" type="button" ${state.attackGoodDone && state.phaseTwoValidated ? '' : 'disabled'}>CONTINUE TO THREAT CLASSIFIER</button>
                </div>
            </div>`;
    }

    renderSaltReusePhaseThree(config, state) {
        const classifier = config.classifier || {};
        const session = state.classifierSession || { weak: [], strong: [], all: [] };
        const attemptsLeft = Math.max(0, this.maxAttempts - this.attempts);
        const selectedCount = state.selectedPasswords.size;
        const reviewedCount = state.revealedWeak.size + state.falsePositives.size;
        const candidateCount = session.all.length;
        const riskLevel = this.riskValue >= 60 ? 'high' : (this.riskValue >= 30 ? 'medium' : '');
        const feedbackClass = state.feedback?.type === 'success' ? 'success' : (state.feedback?.type === 'error' ? 'error' : '');
        const feedbackTone = feedbackClass || 'info';
        const feedbackMessage = state.feedback
            ? state.feedback.message
            : 'Select the shared, easy-to-guess passwords only. Leave the strong unique passwords unselected.';
        const phaseBrief = this.renderSaltReusePhaseBrief({
            phaseLabel: 'Phase 3 · Threat Classifier',
            title: 'Flag the passwords that create the biggest unsalted chain-failure risk.',
            copy: 'Choose only the common, predictable passwords that many users are likely to share. Leave long, unique credentials unflagged.',
            chips: [
                { label: `${candidateCount} candidates in review`, state: 'active' },
                { label: `${selectedCount} currently flagged`, state: selectedCount ? 'success' : '' },
                { label: attemptsLeft ? `${attemptsLeft} attempts remaining` : 'Final attempt used', state: attemptsLeft ? '' : 'warning' }
            ]
        });

        return `
            <div class="srl-hint-strip">TASK: Select ALL passwords that create the highest chain-failure risk if no salt is used. Avoid selecting strong or unique passwords.</div>
            <div class="srl-phase-screen srl-phase-screen--classifier">
                ${phaseBrief}
                <div class="srl-question-card srl-question-card--full">
                    <div class="srl-section-kicker">Question</div>
                    <div class="srl-question-title">Which passwords create the highest chain-failure risk?</div>
                    <div class="srl-question-copy">Choose the common, broadly reused, easy-to-guess passwords only. Strong unique passwords should stay unflagged.</div>
                    <div class="srl-question-stats">
                        <div class="srl-question-stat">
                            <span class="srl-question-stat__label">Candidates</span>
                            <strong>${candidateCount}</strong>
                        </div>
                        <div class="srl-question-stat">
                            <span class="srl-question-stat__label">Flagged</span>
                            <strong>${selectedCount}</strong>
                        </div>
                        <div class="srl-question-stat">
                            <span class="srl-question-stat__label">Reviewed</span>
                            <strong>${reviewedCount}</strong>
                        </div>
                    </div>
                </div>
                <div class="srl-classifier-grid">
                    <div class="srl-panel srl-classifier-left">
                        <div class="srl-mission-box">
                            <div class="srl-section-kicker">SOC Threat Assessment</div>
                            <p>A stolen database has <strong>no salt</strong>. Your job is to identify which passwords create the largest chain-failure risk, passwords so common that cracking one entry instantly exposes every account that shares it.</p>
                        </div>
                        <div class="srl-risk-box">
                            <div class="srl-section-kicker danger-text">Chain Failure Risk Index</div>
                            <div class="srl-risk-value ${riskLevel}">${Math.round(this.riskValue)}%</div>
                            <div class="srl-risk-track"><div class="srl-risk-fill" style="width:${Math.max(0, Math.min(100, this.riskValue))}%"></div></div>
                            <div class="srl-risk-sub">Wrong selections increase attacker advantage</div>
                        </div>
                        <div>
                            <div class="srl-section-kicker">Attempts Remaining</div>
                            <div class="srl-attempt-row">
                                ${Array.from({ length: this.maxAttempts }, (_, idx) => {
                                    const cls = idx < this.attempts ? 'used' : (idx === this.attempts ? 'active' : '');
                                    return `<span class="srl-attempt-pip ${cls}"></span>`;
                                }).join('')}
                                <span>${attemptsLeft} left</span>
                            </div>
                        </div>
                        <div>
                            <div class="srl-section-kicker">Selection Count</div>
                            <div class="srl-selection-total">${selectedCount}<span> FLAGGED</span></div>
                        </div>
                        <div class="srl-feedback srl-feedback--sidebar visible ${feedbackTone}">
                            ${feedbackMessage}
                        </div>
                    </div>
                    <div class="srl-panel srl-panel--classifier">
                        <div class="srl-password-grid-wrap">
                            <div class="srl-password-grid-head">
                                <div>
                                    <div class="srl-section-kicker">Answer Options</div>
                                    <div class="srl-panel-copy">Flag only the passwords that are both weak and likely to be reused widely.</div>
                                </div>
                                <div class="srl-card-legend">
                                    <div class="srl-card-legend__item"><span class="srl-card-swatch selected"></span>Flagged</div>
                                    <div class="srl-card-legend__item"><span class="srl-card-swatch correct"></span>Confirmed weak</div>
                                    <div class="srl-card-legend__item"><span class="srl-card-swatch false"></span>False positive</div>
                                </div>
                            </div>
                            <div class="srl-password-grid">
                                ${session.all.map(pw => {
                                    const selected = state.selectedPasswords.has(pw);
                                    const correct = state.revealedWeak.has(pw);
                                    const falsePositive = state.falsePositives.has(pw);
                                    const cls = selected ? 'selected' : correct ? 'correct' : falsePositive ? 'false' : '';
                                    const statusLabel = selected ? 'FLAGGED' : correct ? 'CONFIRMED WEAK' : falsePositive ? 'SAFE / STRONG' : 'READY';
                                    return `
                                        <button class="srl-password-card ${cls}" type="button" data-srl-password="${pw}" ${this.isComplete ? 'disabled' : ''}>
                                            <span class="srl-password-card__state">${statusLabel}</span>
                                            <span class="srl-password-card__value">${pw}</span>
                                        </button>`;
                                }).join('')}
                            </div>
                        </div>
                        <div class="srl-feedback srl-feedback-inline visible ${feedbackTone}">
                            ${feedbackMessage}
                        </div>
                        <div class="srl-submit-row">
                            <div class="srl-submit-copy">${selectedCount ? `${selectedCount} password${selectedCount === 1 ? '' : 's'} flagged as high risk` : `Choose the weak, reusable passwords to enable submit`}</div>
                            <button class="srl-primary-btn" id="srl-submit-classifier" type="button" ${selectedCount ? '' : 'disabled'}>SUBMIT CLASSIFICATION</button>
                        </div>
                    </div>
                </div>
                <div class="srl-nav-row">
                    <button class="srl-nav-btn" id="srl-phase3-back" type="button">BACK</button>
                </div>
            </div>`;
    }

    setupSaltReuseLabEventListeners() {
        const state = this.saltReuseState;
        if (!state || this.isComplete) return;

        document.getElementById('srl-pw-input')?.addEventListener('input', (e) => {
            state.forgeInput = e.target.value;
        });
        document.getElementById('srl-pw-input')?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.handleSaltReuseForge();
        });
        document.querySelectorAll('[data-srl-quick]').forEach(btn => {
            btn.addEventListener('click', () => {
                state.forgeInput = btn.dataset.srlQuick || '';
                this.audio.playButtonClick();
                this.rerenderSaltReuseLab({ anchorSelector: '.srl-panel-left' });
            });
        });
        document.getElementById('srl-forge-btn')?.addEventListener('click', () => this.handleSaltReuseForge());
        document.getElementById('srl-phase1-next')?.addEventListener('click', () => this.changeSaltReusePhase(2));
        document.getElementById('srl-phase2-back')?.addEventListener('click', () => this.changeSaltReusePhase(1));
        document.getElementById('srl-phase2-next')?.addEventListener('click', () => this.changeSaltReusePhase(3));
        document.getElementById('srl-phase3-back')?.addEventListener('click', () => this.changeSaltReusePhase(2));
        document.getElementById('srl-crack-bad')?.addEventListener('click', () => this.runSaltReuseAttackScenario('bad'));
        document.getElementById('srl-crack-good')?.addEventListener('click', () => this.runSaltReuseAttackScenario('good'));
        document.querySelectorAll('input[name="srl-phase1-check"]').forEach(radio => {
            radio.addEventListener('change', () => this.answerSaltReusePhaseOne(radio.value));
        });
        document.querySelectorAll('input[name="srl-phase2-check"]').forEach(radio => {
            radio.addEventListener('change', () => this.answerSaltReusePhaseTwo(radio.value));
        });
        document.querySelectorAll('[data-srl-password]').forEach(btn => {
            btn.addEventListener('click', () => this.toggleSaltReusePassword(btn.dataset.srlPassword || ''));
        });
        document.getElementById('srl-submit-classifier')?.addEventListener('click', () => this.submitSaltReuseClassification());
    }

    handleSaltReuseForge() {
        if (this.isComplete) return;
        const state = this.saltReuseState;
        const config = this.getSaltReuseLabConfig();
        const salts = Array.isArray(config.fixedSalts) && config.fixedSalts.length >= 2
            ? config.fixedSalts
            : ['yR!x2v&*', 'RUnO1oBW'];
        const password = (state.forgeInput || '').trim();
        if (!password) {
            this.gameScreen.ui.showNotification('Enter a password first.', 'warning');
            return;
        }

        state.forgeCount += 1;
        state.hashA = this.makeSaltedHash(password, salts[0]);
        state.hashB = this.makeSaltedHash(password, salts[1]);
        state.divergence = this.calculateHashDivergence(state.hashA, state.hashB);
        state.insightVisible = true;
        this.audio.playButtonClick();
        this.rerenderSaltReuseLab({ anchorSelector: '.srl-phase-screen--lab' });
    }

    changeSaltReusePhase(phase) {
        if (this.isComplete || !this.saltReuseState) return;
        this.clearSaltReuseCompletionTimer();
        this.saltReuseState.phase = phase;
        this.audio.playButtonClick();
        this.renderSaltReuseLab(this.visualizerElement);
    }

    answerSaltReusePhaseOne(answerId) {
        if (!this.saltReuseState || this.isComplete) return;
        this.saltReuseState.phaseOneSelectedAnswer = answerId;
        this.saltReuseState.phaseOneValidated = answerId === 'salt_breaks_shared_path';
        this.saltReuseState.phaseOneFeedback = this.saltReuseState.phaseOneValidated
            ? 'Correct. Salt does not stop guessing, but it forces attackers to solve each user record separately.'
            : 'Not quite. Salt isolates identical passwords into different stored hashes; it does not magically strengthen weak passwords.';
        this.audio.playButtonClick();
        this.rerenderSaltReuseLab({ anchorSelector: '.srl-knowledge-check' });
    }

    runSaltReuseAttackScenario(type) {
        if (this.isComplete || !this.saltReuseState) return;
        const config = this.getSaltReuseLabConfig();
        const users = config.attackSimulator?.users || ['alice', 'bob', 'carol', 'dave', 'eve'];
        this.audio.playButtonClick();

        if (type === 'bad') {
            this.saltReuseState.attackBadDone = true;
            this.saltReuseState.attackBadRows = users.map(user => ({ user, note: 'password123 exposed' }));
            this.saltReuseState.attackBadMessage = 'Hash 5f4dcc3b... matched "password123" in 0.3s via rainbow table. One crack instantly exposed every matching user.';
            this.rerenderSaltReuseLab({ anchorSelector: '.srl-phase-screen--attack' });
            return;
        }

        this.saltReuseState.attackGoodDone = true;
        this.saltReuseState.attackGoodRows = users.map((user, idx) => ({
            user,
            icon: idx === 0 ? '>' : '-',
            state: idx === 0 ? 'cracked' : 'isolated',
            note: idx === 0 ? 'cracked after 4.2h' : 'still computing independently'
        }));
        this.saltReuseState.attackGoodMessage = 'Alice cracked does not mean Bob cracked. Per-user salt forces the attacker to solve each record as a separate problem.';
        this.rerenderSaltReuseLab({ anchorSelector: '.srl-phase-screen--attack' });
    }

    answerSaltReusePhaseTwo(answerId) {
        if (!this.saltReuseState || this.isComplete) return;
        this.saltReuseState.phaseTwoSelectedAnswer = answerId;
        this.saltReuseState.phaseTwoValidated = answerId === 'salted_isolate_work';
        this.saltReuseState.phaseTwoFeedback = this.saltReuseState.phaseTwoValidated
            ? 'Correct. Salt changes one stolen database from a shared crack into many separate cracking problems.'
            : 'Look again at the simulator. Salt does not prevent theft, and cracking one salted record does not automatically unlock the rest.';
        this.audio.playButtonClick();
        this.rerenderSaltReuseLab({ anchorSelector: '.srl-check-panel' });
    }

    toggleSaltReusePassword(password) {
        if (!password || this.isComplete || !this.saltReuseState) return;
        const state = this.saltReuseState;
        if (state.revealedWeak.has(password) || state.falsePositives.has(password)) return;
        if (state.selectedPasswords.has(password)) state.selectedPasswords.delete(password);
        else state.selectedPasswords.add(password);
        this.audio.playButtonClick();
        this.rerenderSaltReuseLab({ anchorSelector: '.srl-password-grid-wrap' });
    }

    submitSaltReuseClassification() {
        if (this.isComplete || !this.saltReuseState) return;
        const state = this.saltReuseState;
        const classifier = this.getSaltReuseLabConfig().classifier || {};
        if (!state.selectedPasswords.size) {
            this.gameScreen.ui.showNotification('Select at least one password before submission.', 'warning');
            return;
        }

        this.attempts++;
        this.updateAttemptCounter();
        this.gameScreen.updateAttempts(this.attempts);

        const selected = Array.from(state.selectedPasswords);
        const falsePositives = selected.filter(pw => state.classifierSession.strong.includes(pw));
        const missed = state.classifierSession.weak.filter(pw => !state.selectedPasswords.has(pw));

        if (falsePositives.length) {
            falsePositives.forEach(pw => {
                state.selectedPasswords.delete(pw);
                state.falsePositives.add(pw);
            });
            this.riskValue = Math.min(100, this.riskValue + ((classifier.falsePositiveRisk || 15) * falsePositives.length));
            state.feedback = {
                type: 'error',
                message: `${falsePositives.length} strong password${falsePositives.length === 1 ? '' : 's'} incorrectly flagged. Strong, unique passwords do not create a chain failure across many users.`
            };
            this.audio.playFailure();
            this.rerenderSaltReuseLab({ anchorSelector: '.srl-panel--classifier' });
            this.gameScreen.ui.showNotification('Strong passwords were incorrectly flagged.', 'error');
            return;
        }

        if (missed.length) {
            this.riskValue = Math.min(100, this.riskValue + (classifier.missedWeakRisk || 20));
            if (this.attempts >= this.maxAttempts || this.hasRiskBreached()) {
                state.classifierSession.weak.forEach(pw => state.revealedWeak.add(pw));
                state.feedback = {
                    type: 'error',
                    message: 'Analysis exhausted. The correct high chain-risk passwords are now revealed. Review the confirmed answers before the case closes.'
                };
                this.audio.playFailure();
                this.rerenderSaltReuseLab({ anchorSelector: '.srl-panel--classifier' });
                this.queueSaltReuseCompletion(false, 2200);
                return;
            }
            state.feedback = {
                type: 'error',
                message: `${missed.length} high-risk password${missed.length === 1 ? '' : 's'} missed. Common and predictable values create the biggest blast radius when salt is absent.`
            };
            this.audio.playFailure();
            this.rerenderSaltReuseLab({ anchorSelector: '.srl-panel--classifier' });
            this.gameScreen.ui.showNotification('Incomplete analysis. Reassess the common passwords.', 'error');
            return;
        }

        state.classifierSession.weak.forEach(pw => state.revealedWeak.add(pw));
        state.feedback = {
            type: 'success',
            message: `All ${state.classifierSession.weak.length} high chain-risk passwords identified with zero false positives. Salt isolates each account, but weak passwords still remain easy attacker targets.`
        };
        this.audio.playSuccess();
        this.rerenderSaltReuseLab({ anchorSelector: '.srl-panel--classifier' });
        this.queueSaltReuseCompletion(true, 2000);
    }

    startSaltReuseCompletion(success) {
        if (this.isComplete || !this.saltReuseState) return;
        this.clearSaltReuseCompletionTimer();
        this.isComplete = true;
        if (success) {
            this.gameScreen.ui.flashScreen('rgba(0,255,65,0.2)', 300);
            this.gameScreen.ui.showNotification(this.mission.successFeedback || 'Credential vulnerability identified.', 'success');
        } else {
            this.gameScreen.ui.flashScreen('rgba(255,0,110,0.2)', 300);
            this.gameScreen.ui.showNotification(this.mission.failureFeedback || 'Security oversight detected.', 'error');
        }
        this.saltReuseState.completion = { success };
        this.renderSaltReuseLab(this.visualizerElement);
        setTimeout(() => this.gameScreen.completePuzzle(success), success ? 1500 : 1700);
    }

    renderSaltReuseLabStyles() {
        return `<style>
            .lab-shared-shell{height:auto!important;min-height:100%!important;overflow:visible!important}
            .lab-shared-body,
            .lab-shared-content{flex:0 0 auto!important;height:auto!important;min-height:0!important;overflow:visible!important}
            .lab-shared-content > .srl-shell{flex:0 0 auto;min-height:auto!important;width:100%}
            .srl-shell{display:flex;flex-direction:column;width:100%;height:auto!important;min-height:100%!important;overflow:visible!important;background:linear-gradient(180deg,#070b12 0%,#06080f 100%);color:#eef2ff;border:1px solid rgba(245,166,35,.14);box-shadow:0 20px 60px rgba(0,0,0,.35)}
            .srl-header{display:flex;justify-content:space-between;align-items:center;padding:16px 26px;background:#0a0d18;border-bottom:1px solid rgba(245,166,35,.25);gap:16px;flex-wrap:wrap}
            .srl-brand,.srl-level,.srl-status,.srl-phase,.srl-label,.srl-section-kicker,.srl-nav-btn,.srl-sim-btn,.srl-quick-btn,.srl-submit-copy{font-family:Consolas,"Courier New",monospace;letter-spacing:.2em;text-transform:uppercase}
            .srl-brand{color:#f5a623;font-weight:700}.srl-level{color:rgba(245,166,35,.72);font-size:.85rem}.srl-status{color:#00e87a;font-size:.82rem}
            .srl-phases{display:grid;grid-template-columns:repeat(3,1fr);background:#0b101b;border-bottom:1px solid rgba(245,166,35,.12)}
            .srl-phase{padding:14px 10px;text-align:center;color:rgba(180,190,230,.35);border-bottom:2px solid transparent;font-size:.78rem}.srl-phase span{display:block;font-size:1.6rem;font-weight:700;line-height:1.1}
            .srl-phase.active{color:#f5a623;background:rgba(245,166,35,.05);border-bottom-color:#f5a623}.srl-phase.done{color:rgba(0,232,122,.75);border-bottom-color:rgba(0,232,122,.35)}
            .srl-hint-strip{padding:12px 28px;background:rgba(0,212,255,.04);border-bottom:1px solid rgba(0,212,255,.12);color:rgba(0,212,255,.72);font-family:Consolas,"Courier New",monospace;letter-spacing:.12em;font-size:.82rem}
            .srl-phase-screen{display:block;min-height:0;overflow:visible;padding:22px 24px 24px}
            .srl-phase-screen--lab,.srl-phase-screen--attack,.srl-phase-screen--classifier{overflow:visible}
            .srl-phase-brief{display:grid;gap:12px;padding:20px 22px;margin-bottom:18px;background:linear-gradient(135deg,rgba(245,166,35,.12),rgba(0,212,255,.04));border:1px solid rgba(245,166,35,.16);box-shadow:0 20px 40px rgba(0,0,0,.18)}
            .srl-phase-brief__eyebrow,.srl-panel-eyebrow{font-family:Consolas,"Courier New",monospace;font-size:.72rem;letter-spacing:.2em;text-transform:uppercase;color:rgba(245,166,35,.64)}
            .srl-phase-brief__title{font-size:clamp(1.35rem,2.2vw,1.95rem);line-height:1.08;color:#eef2ff;font-weight:700;max-width:760px}
            .srl-phase-brief__copy{max-width:900px;color:rgba(196,208,236,.76);line-height:1.7;font-size:.94rem}
            .srl-phase-brief__chips{display:flex;flex-wrap:wrap;gap:10px}
            .srl-phase-chip{display:inline-flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid rgba(255,255,255,.08);background:rgba(7,14,24,.86);color:rgba(196,208,236,.7);font-family:Consolas,"Courier New",monospace;font-size:.72rem;letter-spacing:.14em;text-transform:uppercase}
            .srl-phase-chip::before{content:'';width:8px;height:8px;border-radius:50%;background:rgba(180,190,230,.24);box-shadow:0 0 0 1px rgba(255,255,255,.04) inset}
            .srl-phase-chip.is-active{border-color:rgba(245,166,35,.28);color:#ffcb6b}
            .srl-phase-chip.is-active::before{background:#f5a623;box-shadow:0 0 12px rgba(245,166,35,.34)}
            .srl-phase-chip.is-success{border-color:rgba(0,232,122,.24);color:rgba(180,255,210,.92)}
            .srl-phase-chip.is-success::before{background:#00e87a;box-shadow:0 0 12px rgba(0,232,122,.34)}
            .srl-phase-chip.is-warning{border-color:rgba(255,64,96,.22);color:rgba(255,170,180,.92)}
            .srl-phase-chip.is-warning::before{background:#ff4060;box-shadow:0 0 12px rgba(255,64,96,.3)}
            .srl-lab,.srl-attack-grid,.srl-classifier-grid{display:grid;gap:18px;align-items:start;min-height:0}
            .srl-lab,.srl-attack-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
            .srl-classifier-grid{grid-template-columns:minmax(260px,320px) minmax(0,1fr);overflow:visible}
            .srl-panel{display:flex;flex-direction:column;gap:14px;min-width:0;min-height:0;padding:22px;background:#07111b;border:1px solid rgba(245,166,35,.12)}
            .srl-panel-left,.srl-classifier-left,.srl-attack-panel:first-child{border-right:1px solid rgba(245,166,35,.12)}
            .srl-panel-head{display:grid;gap:6px;padding-bottom:14px;border-bottom:1px solid rgba(245,166,35,.08)}
            .srl-panel-title{font-size:1.12rem;line-height:1.25;color:#eef2ff;font-weight:700}
            .srl-panel-copy{color:rgba(196,208,236,.68);font-size:.86rem;line-height:1.65}
            .srl-section-kicker{font-size:.74rem;color:rgba(245,166,35,.64);margin-bottom:12px}.srl-brief-box,.srl-mission-box,.srl-risk-box,.srl-reactor-cell,.srl-divergence,.srl-db-table,.srl-result,.srl-feedback,.srl-completion-card{background:rgba(7,14,24,.96);border:1px solid rgba(245,166,35,.12)}
            .srl-brief-box,.srl-mission-box,.srl-risk-box,.srl-divergence,.srl-result,.srl-feedback,.srl-completion-card{padding:16px;line-height:1.7}.srl-brief-box strong,.srl-mission-box strong,.srl-insight strong{color:#f5a623}
            .srl-label{display:block;color:rgba(245,166,35,.55);font-size:.74rem;margin:18px 0 8px}.srl-input{width:100%;padding:12px 14px;background:rgba(0,0,0,.48);border:1px solid rgba(245,166,35,.28);border-left:3px solid #f5a623;color:#ffcb6b;outline:none}
            .srl-quick-picks{display:flex;gap:8px;flex-wrap:wrap}
            .srl-quick-btn,.srl-nav-btn,.srl-sim-btn{display:inline-flex;align-items:center;justify-content:center;text-align:center;padding:7px 12px;background:rgba(0,0,0,.38);border:1px solid rgba(245,166,35,.18);color:rgba(245,166,35,.72);cursor:pointer;position:relative;z-index:2;white-space:nowrap;pointer-events:auto;touch-action:manipulation}
            .srl-quick-btn:hover,.srl-nav-btn:hover,.srl-sim-btn:hover{border-color:rgba(245,166,35,.45);color:#ffcb6b}
            .srl-primary-btn{display:inline-flex;align-items:center;justify-content:center;align-self:flex-start;width:auto;min-width:260px;max-width:100%;min-height:48px;padding:13px 18px;margin-top:20px;margin-right:auto;background:linear-gradient(90deg,rgba(245,166,35,.16),rgba(245,166,35,.06));border:1px solid rgba(245,166,35,.42);color:#eef2ff;font-weight:700;letter-spacing:.24em;text-transform:uppercase;cursor:pointer;position:relative;z-index:3;white-space:normal;text-align:center;pointer-events:auto;touch-action:manipulation}
            .srl-primary-btn:disabled,.srl-nav-btn:disabled,.srl-sim-btn:disabled{opacity:.45;cursor:not-allowed}.srl-reactor{display:grid;gap:16px}.srl-reactor-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.srl-reactor-cell{padding:16px}.srl-reactor-cell.firing{border-color:rgba(245,166,35,.44);box-shadow:0 0 24px rgba(245,166,35,.08)}
            .srl-reactor-top,.srl-div-stats,.srl-submit-row,.srl-nav-row,.srl-attempt-row{display:flex;justify-content:space-between;align-items:center;gap:10px}.srl-reactor-id{font-family:Consolas,"Courier New",monospace;color:rgba(245,166,35,.48);font-size:.74rem;letter-spacing:.16em}
            .srl-salt-pill{padding:4px 8px;border:1px solid rgba(245,166,35,.22);background:rgba(245,166,35,.08);color:#ffcb6b}.srl-formula{display:flex;align-items:center;gap:8px;margin:10px 0;color:rgba(180,190,230,.58)}
            .srl-token{padding:4px 8px;border:1px solid}.srl-token.pw{border-color:rgba(0,212,255,.35);color:#00d4ff;background:rgba(0,212,255,.08)}.srl-token.salt{border-color:rgba(245,166,35,.35);color:#f5a623;background:rgba(245,166,35,.08)}
            .srl-hash-output{font-family:Consolas,"Courier New",monospace;color:rgba(180,190,230,.38);word-break:break-all;font-style:italic}.srl-hash-output.has-value{color:#00e87a;font-style:normal}
            .srl-div-track{display:flex;gap:2px;margin:10px 0}.srl-div-seg{height:8px;flex:1;background:rgba(0,212,255,.12)}.srl-div-seg.match{background:rgba(255,64,96,.48)}.srl-div-seg.diff{background:rgba(0,232,122,.54)}
            .srl-div-stats{font-family:Consolas,"Courier New",monospace;color:rgba(180,190,230,.62);font-size:.82rem}.srl-insight{display:none;margin-top:16px;padding:16px;background:rgba(0,232,122,.05);border:1px solid rgba(0,232,122,.22);line-height:1.7;color:rgba(220,245,230,.86)}
            .srl-insight.visible{display:block}.srl-insight .accent{color:#ffcb6b}.srl-knowledge-check,.srl-check-panel{display:none;margin-top:16px;padding:16px;background:rgba(255,255,255,.02);border:1px solid rgba(245,166,35,.12)}
            .srl-knowledge-check.visible,.srl-check-panel{display:block}
            .srl-check-panel{position:static;z-index:auto;isolation:isolate;margin-top:18px;padding:18px 22px;background:#07111b;border:1px solid rgba(245,166,35,.12);box-shadow:0 18px 36px rgba(0,0,0,.24)}
            .srl-check-list{display:grid;gap:10px}
            .srl-check-card{display:flex;gap:12px;align-items:flex-start;padding:14px;border:1px solid rgba(245,166,35,.12);background:rgba(10,18,30,.98);cursor:pointer;min-width:0}
            .srl-check-card.selected,.srl-check-card:has(input:checked){border-color:rgba(0,212,255,.34);background:rgba(0,212,255,.06)}.srl-check-card input{margin-top:4px}.srl-check-card__copy{display:grid;gap:6px}
            .srl-check-card__title{color:#eef2ff;line-height:1.5;word-break:break-word}.srl-check-card__desc{color:rgba(180,190,230,.58);font-size:.82rem;line-height:1.5;word-break:break-word}.srl-check-feedback{display:none;margin-top:12px;padding:14px;border:1px solid rgba(245,166,35,.12);font-size:.88rem;line-height:1.6}
            .srl-check-feedback.visible{display:block}.srl-check-feedback.success{border-color:rgba(0,232,122,.22);background:rgba(0,232,122,.05);color:rgba(180,255,210,.9)}.srl-check-feedback.error{border-color:rgba(255,64,96,.22);background:rgba(255,64,96,.05);color:rgba(255,170,180,.9)}
            .srl-nav-row{padding:18px 0 0;border-top:1px solid rgba(245,166,35,.12);background:transparent}.srl-nav-row.solo{padding:0;margin-top:18px;border-top:0;background:transparent;justify-content:space-between;align-items:flex-start}
            .srl-gate-note{max-width:620px;padding:12px 14px;border:1px solid rgba(245,166,35,.12);background:rgba(255,191,0,.06);color:rgba(255,218,128,.88);font-size:.84rem;line-height:1.65;letter-spacing:.04em}
            .srl-gate-note.ready{border-color:rgba(0,232,122,.24);background:rgba(0,232,122,.06);color:rgba(180,255,210,.92)}
            .srl-attack-title{font-size:1rem;font-weight:700;letter-spacing:.18em;margin-bottom:6px}.srl-attack-title.bad,.danger-text{color:#ff4060}.srl-attack-title.good{color:#00e87a}
            .srl-mini-copy,.srl-observation,.srl-submit-copy,.srl-risk-sub{color:rgba(180,190,230,.58);font-size:.82rem;line-height:1.6}.srl-db-table{margin-top:16px}.srl-db-row{display:grid;grid-template-columns:90px 1fr}
            .srl-db-row>div{padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.04)}.srl-db-row.header{background:rgba(255,255,255,.03);color:rgba(180,190,230,.46);font-size:.75rem;letter-spacing:.16em}.srl-db-row .user{color:#00d4ff}.srl-db-row .hash{color:rgba(180,190,230,.56);font-family:Consolas,"Courier New",monospace}
            .srl-observation{padding:10px 0;border-top:1px solid rgba(255,255,255,.06);border-bottom:1px solid rgba(255,255,255,.06);margin:14px 0}.srl-observation.bad{color:rgba(255,64,96,.76)}.srl-observation.good{color:rgba(0,232,122,.76)}
            .srl-sim-btn.bad{border-color:rgba(255,64,96,.32);color:#ff4060}.srl-sim-btn.good{border-color:rgba(0,232,122,.28);color:#00e87a}.srl-result{display:none;margin-top:14px}.srl-result.visible{display:block}
            .srl-result.bad{border-color:rgba(255,64,96,.22);background:rgba(255,64,96,.05);color:rgba(255,170,180,.9)}.srl-result.good{border-color:rgba(0,232,122,.22);background:rgba(0,232,122,.05);color:rgba(180,255,210,.9)}
            .srl-result,.srl-chain-row{word-break:break-word;overflow-wrap:anywhere}
            .srl-attack-grid{position:relative;z-index:1;grid-auto-rows:max-content}
            .srl-attack-panel{display:flex;flex-direction:column;min-width:0;min-height:0;height:auto!important;overflow:visible;align-self:start}
            .srl-chain{display:flex;flex-direction:column;gap:8px;margin-top:12px}
            .srl-chain-row{display:grid;grid-template-columns:16px minmax(68px,96px) minmax(0,1fr);align-items:flex-start;gap:10px;padding:10px 12px;background:#0b1624;border-left:2px solid transparent;font-size:.85rem}
            .srl-chain-row span{width:16px;text-align:center}
            .srl-chain-row strong{display:block;line-height:1.45}
            .srl-chain-row em{margin-left:0;font-style:normal;color:inherit;opacity:.84;max-width:100%;text-align:left;line-height:1.45}
            .srl-chain-row.cracked{border-left-color:#ff4060;background:rgba(255,64,96,.1);color:#ff7e92}
            .srl-chain-row.isolated{border-left-color:rgba(180,190,230,.28);background:#0b1624;color:rgba(180,190,230,.62)}
            .srl-classifier-left{display:flex;flex-direction:column;gap:18px;overflow:visible;border-right:1px solid rgba(245,166,35,.12);border-bottom:0}
            .srl-panel--classifier{display:flex;flex-direction:column;gap:16px;overflow:visible}
            .srl-question-card,.srl-password-grid-wrap{background:#07111b;border:1px solid rgba(245,166,35,.12)}
            .srl-question-card{display:grid;gap:12px;padding:18px}
            .srl-question-card--full{margin-bottom:18px}
            .srl-question-title{font-size:1.35rem;line-height:1.2;color:#eef2ff;font-weight:700}
            .srl-question-copy{color:rgba(180,190,230,.72);line-height:1.7}
            .srl-question-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
            .srl-question-stat{padding:12px 14px;background:rgba(255,255,255,.03);border:1px solid rgba(245,166,35,.12)}
            .srl-question-stat strong{display:block;font-size:1.4rem;color:#eef2ff}
            .srl-question-stat__label{display:block;margin-bottom:6px;color:rgba(245,166,35,.62);font-family:Consolas,"Courier New",monospace;font-size:.72rem;letter-spacing:.16em;text-transform:uppercase}
            .srl-password-grid-head{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap}
            .srl-card-legend{display:flex;flex-wrap:wrap;gap:8px 12px}
            .srl-card-legend__item{display:inline-flex;align-items:center;gap:8px;color:rgba(196,208,236,.68);font-family:Consolas,"Courier New",monospace;font-size:.7rem;letter-spacing:.14em;text-transform:uppercase}
            .srl-card-swatch{width:12px;height:12px;border:1px solid rgba(255,255,255,.12);background:#0b1624}
            .srl-card-swatch.selected{border-color:#ff4060;background:rgba(255,64,96,.18)}
            .srl-card-swatch.correct{border-color:#00e87a;background:rgba(0,232,122,.14)}
            .srl-card-swatch.false{border-color:#f5a623;background:rgba(245,166,35,.16)}
            .srl-password-grid-wrap{display:flex;flex-direction:column;gap:14px;min-height:0;padding:18px}
            .srl-risk-value{font-size:2rem;font-weight:700;color:#eef2ff}.srl-risk-value.medium{color:#f5a623}.srl-risk-value.high{color:#ff4060}
            .srl-risk-track{height:5px;background:rgba(255,64,96,.12);margin-top:10px}.srl-risk-fill{height:100%;background:linear-gradient(90deg,#f5a623,#ff4060)}.srl-attempt-row span:last-child{margin-left:8px;color:rgba(180,190,230,.62);font-family:Consolas,"Courier New",monospace}
            .srl-attempt-pip{width:10px;height:10px;transform:rotate(45deg);border:1px solid rgba(180,190,230,.28);display:inline-block}.srl-attempt-pip.used{background:#ff4060;border-color:#ff4060}.srl-attempt-pip.active{background:#f5a623;border-color:#f5a623}
            .srl-selection-total{font-size:2rem;font-weight:700}.srl-selection-total span{font-size:.85rem;color:rgba(180,190,230,.48);font-family:Consolas,"Courier New",monospace;letter-spacing:.18em}.srl-feedback{display:none}.srl-feedback.visible{display:block}
            .srl-feedback.info{border-color:rgba(0,212,255,.18);background:rgba(0,212,255,.05);color:rgba(190,240,255,.9)}
            .srl-feedback.error{border-color:rgba(255,64,96,.22);background:rgba(255,64,96,.05);color:rgba(255,170,180,.92)}.srl-feedback.success{border-color:rgba(0,232,122,.22);background:rgba(0,232,122,.05);color:rgba(180,255,210,.9)}
            .srl-feedback--sidebar{margin-top:auto}
            .srl-password-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;align-content:start}
            .srl-password-card{display:grid;gap:10px;align-content:flex-start;min-height:96px;padding:14px;background:linear-gradient(180deg,#0b1624 0%,#0a1220 100%);border:1px solid rgba(245,166,35,.12);color:rgba(200,210,240,.72);text-align:left;word-break:break-word;line-height:1.55;cursor:pointer;transition:border-color .2s ease,transform .2s ease,box-shadow .2s ease}
            .srl-password-card:hover{border-color:rgba(245,166,35,.38);color:#ffcb6b;transform:translateY(-2px);box-shadow:0 16px 30px rgba(0,0,0,.18)}
            .srl-password-card.selected{border-color:#ff4060;background:rgba(255,64,96,.1);color:#ff7e92}
            .srl-password-card.correct{border-color:#00e87a;background:rgba(0,232,122,.08);color:#00e87a}
            .srl-password-card.false{border-color:#f5a623;background:rgba(245,166,35,.08);color:#f5a623}
            .srl-password-card__state{font-family:Consolas,"Courier New",monospace;font-size:.68rem;letter-spacing:.16em;text-transform:uppercase;color:rgba(196,208,236,.54)}
            .srl-password-card.selected .srl-password-card__state{color:rgba(255,170,180,.86)}
            .srl-password-card.correct .srl-password-card__state{color:rgba(180,255,210,.88)}
            .srl-password-card.false .srl-password-card__state{color:rgba(255,218,128,.86)}
            .srl-password-card__value{font-size:.98rem;line-height:1.55;color:inherit;overflow-wrap:anywhere}
            .srl-submit-row{margin-top:0;padding-top:16px;border-top:1px solid rgba(245,166,35,.12);flex-wrap:wrap}
            .srl-submit-copy{flex:1 1 260px}
            .srl-submit-row .srl-primary-btn{margin-top:0;margin-left:auto;min-width:260px}
            .srl-submit-row--sticky{position:static;bottom:auto;z-index:auto;padding-bottom:0;background:none}
            .srl-completion{min-height:540px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 24px;text-align:center;gap:20px;background:radial-gradient(circle at center,rgba(0,232,122,.06),transparent 60%)}
            .srl-completion-badge{width:84px;height:84px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid rgba(0,232,122,.35);background:rgba(0,232,122,.08);font-weight:700;color:#00e87a}.srl-completion-title{font-size:1.5rem;font-weight:700;letter-spacing:.24em}.srl-completion-sub{font-family:Consolas,"Courier New",monospace;color:rgba(0,232,122,.72);letter-spacing:.18em}
            .srl-completion-card{max-width:620px;text-align:left}.srl-completion-item{display:flex;gap:12px;padding:10px 0;border-bottom:1px solid rgba(0,232,122,.08)}.srl-completion-arrow{color:#00e87a}.srl-completion-insight{margin-top:14px;color:#ffcb6b}
            @media (max-width:1180px){.srl-classifier-grid{grid-template-columns:1fr}.srl-classifier-left{border-right:0;border-bottom:1px solid rgba(245,166,35,.12)}}
            @media (max-width:980px){.srl-phase-screen{padding:18px}.srl-lab,.srl-attack-grid,.srl-classifier-grid,.srl-reactor-grid{grid-template-columns:1fr}.srl-panel-left,.srl-classifier-left,.srl-attack-panel:first-child{border-right:0;border-bottom:1px solid rgba(245,166,35,.12)}.srl-password-grid{grid-template-columns:repeat(2,1fr)}}
            @media (max-width:640px){.srl-header{padding:14px 18px}.srl-phase-brief,.srl-panel,.srl-question-card{padding:18px}.srl-password-grid,.srl-phases,.srl-question-stats{grid-template-columns:1fr}.srl-reactor-top,.srl-submit-row,.srl-nav-row,.srl-password-grid-head{flex-direction:column;align-items:flex-start}.srl-submit-row .srl-primary-btn{width:100%;min-width:0;margin-left:0}}
        </style>`;
    }

    // ─── LEVEL 2: singleChoice with second attempt support ──────────────────

    renderSingleChoicePuzzle(container) {
        this.visualizerElement = container;
        const choices = Array.isArray(this.puzzleData.choices) ? this.puzzleData.choices : [];
        const defenseOptions = Array.isArray(this.puzzleData.followUpDefenseQuestion?.options) ? this.puzzleData.followUpDefenseQuestion.options : [];
        const evidenceEntries = this.getSingleChoiceEvidenceEntries();
        const confidenceScore = this.getSingleChoiceConfidenceScore();
        const evidenceSummary = this.getSingleChoiceEvidenceSummary();
        const attemptsLeft = Math.max(0, this.maxAttempts - this.attempts);
        const choiceMarkup = choices.map(c => `
            <label class="l2-choice-card ${this.singleChoiceSelected === c.id ? 'selected' : ''}">
                <input type="radio" name="attack-choice" value="${c.id}" ${this.singleChoiceSelected === c.id ? 'checked' : ''}/>
                <div class="l2-choice-card__title">${c.label}</div>
                <div class="l2-choice-card__desc">${this.getSingleChoiceDescription(c.id)}</div>
            </label>`).join('');
        const defenseMarkup = defenseOptions.map(option => `
            <label class="l2-choice-card ${this.singleChoiceDefenseSelected === option.id ? 'selected' : ''}">
                <input type="radio" name="single-choice-defense" value="${option.id}" ${this.singleChoiceDefenseSelected === option.id ? 'checked' : ''}/>
                <div class="l2-choice-card__title">${option.label}</div>
                <div class="l2-choice-card__desc">${option.description || option.explanation || 'Choose the best defensive control for the attack you identified.'}</div>
            </label>`).join('');
        const evidenceMarkup = evidenceEntries.map(entry => `
            <article class="l2-evidence-card ${this.singleChoiceSelectedEntryIds.has(entry.id) ? 'selected' : ''}" data-single-evidence-card="${entry.id}">
                <div class="l2-evidence-card__meta">
                    <span>${entry.timestamp}</span>
                    <span>${entry.code}</span>
                </div>
                <div class="l2-evidence-card__title">${entry.title}</div>
                <div class="l2-evidence-card__desc">${entry.description}</div>
                <button class="l2-flag-btn ${this.singleChoiceSelectedEntryIds.has(entry.id) ? 'active' : ''}" type="button" data-single-flag="${entry.id}">
                    ${this.singleChoiceSelectedEntryIds.has(entry.id) ? 'FLAGGED' : 'FLAG AS EVIDENCE'}
                </button>
            </article>`).join('');
        const showDefenseStage = this.singleChoiceStage === 'defense';

        container.innerHTML = `
            ${this.renderSingleChoiceLabStyles()}
            ${this.renderSharedPasswordLabThemeStyles()}
            ${this.renderSharedPasswordLabFrame({
                levelLabel: '// LEVEL 02 - SOC INCIDENT LAB',
                title: 'LIVE ATTACK<br>DETECTION',
                status: 'SOC INCIDENT ACTIVE',
                phases: [
                    { label: 'LOG MONITOR', active: this.singleChoiceStage !== 'defense' },
                    { label: 'ATTACK LABEL', active: this.singleChoiceStage === 'defense' },
                    { label: 'CONTAINMENT', active: this.singleChoiceStage === 'defense' }
                ],
                content: `
                    <div class="l2-shell">
                        <div class="l2-header">
                            <div class="l2-brand">SHADOWDEF</div>
                            <div class="l2-level">LEVEL 2 - LIVE ATTACK DETECTION</div>
                            <div class="l2-status">SOC INCIDENT ACTIVE</div>
                        </div>
                        <div class="l2-phases">
                            <div class="l2-phase active"><span>01</span>LOG MONITOR</div>
                            <div class="l2-phase ${this.singleChoiceStage === 'defense' ? 'active' : ''}"><span>02</span>ATTACK LABEL</div>
                            <div class="l2-phase ${this.singleChoiceStage === 'defense' ? 'active' : ''}"><span>03</span>CONTAINMENT</div>
                        </div>
                        <div class="l2-hint-strip">HINT: Common words with small number changes point to a dictionary attack, not full brute-force coverage.</div>
                        <div class="l2-frame">
                            <aside class="l2-panel l2-panel-left">
                                <div class="l2-section-kicker">Mission Brief</div>
                                <div class="l2-brief-box">
                                    <div><strong>Objective:</strong> ${this.mission.objective || ''}</div>
                                    <div><strong>Scenario:</strong> ${this.mission.scenario || ''}</div>
                                    <div><strong>Task:</strong> ${this.mission.userTask || ''}</div>
                                </div>
                                <div class="l2-section-kicker">System Status</div>
                                <div class="l2-metric-box">
                                    <div class="l2-metric-box__row">
                                        <span>${this.puzzleData.timerLabel || 'Time Left'}</span>
                                        <strong id="single-timer-text">${this.singleChoiceRemaining}s</strong>
                                    </div>
                                    <div class="l2-metric-box__row" style="margin-top:8px;">
                                        <span>${this.vaultConfig?.label || 'Vault Integrity'}</span>
                                        <strong id="vault-text">${Math.floor(this.vaultIntegrity)}%</strong>
                                    </div>
                                    <div class="progress-bar"><div class="progress-fill" id="vault-fill" style="width:${this.vaultIntegrity}%;"></div></div>
                                    <div class="l2-metric-box__meta">
                                        <span>${attemptsLeft} attempts left</span>
                                        <span>${this.attempts} decisions used</span>
                                    </div>
                                </div>
                                <div class="l2-section-kicker">Analyst Notes</div>
                                <div class="l2-guide">
                                    <div class="l2-hint">Dictionary attacks use known words and common passwords.</div>
                                    <div class="l2-hint">Brute force tries wider random combinations.</div>
                                    <div class="l2-hint">Credential stuffing reuses real leaked username-password pairs.</div>
                                </div>
                                <div class="l2-section-kicker" style="margin-top:18px;">Evidence Confidence</div>
                                <div class="l2-metric-box">
                                    <div class="l2-metric-box__row">
                                        <span>Confidence</span>
                                        <strong id="single-choice-confidence-text">${confidenceScore}%</strong>
                                    </div>
                                    <div class="progress-bar"><div class="progress-fill" id="single-choice-confidence-fill" style="width:${confidenceScore}%;"></div></div>
                                    <div class="l2-metric-box__meta" id="single-choice-confidence-meta">
                                        <span>Read: ${evidenceSummary}</span>
                                    </div>
                                </div>
                            </aside>
                            <main class="l2-panel l2-panel-right">
                                <div class="l2-main-head">
                                    <div>
                                        <div class="l2-section-kicker">Live Authentication Stream</div>
                                        <div class="l2-main-title">Triage the evidence, label the attack, then activate the right containment before the vault collapses</div>
                                    </div>
                                    <div id="attempt-counter" class="l2-attempts">
                                        Decisions: <span>${this.attempts}</span> / ${this.maxAttempts}
                                    </div>
                                </div>
                                <div class="l2-log-panel">
                                    <div class="l2-log-header">
                                        <span>LOGIN STREAM</span>
                                        <span>REAL-TIME</span>
                                    </div>
                                    <div id="attack-log-stream" class="l2-log-feed">Waiting for incoming login attempts...</div>
                                </div>
                                ${showDefenseStage ? `
                                    <div class="l2-section-kicker">Containment Selection</div>
                                    <div class="l2-choice-grid" id="single-choice-defense-grid">${defenseMarkup}</div>
                                    <div class="l2-feedback guess-feedback" id="guess-feedback">Choose the control that best stops repeated wordlist-based guessing against the account.</div>
                                    <div class="l2-actions">
                                        <button class="l2-btn l2-btn-primary" id="submit-single-choice-defense">ACTIVATE CONTAINMENT</button>
                                    </div>` : `
                                    <div class="l2-section-kicker">Evidence Triage</div>
                                    <div class="l2-evidence-grid">${evidenceMarkup}</div>
                                    <div class="l2-triage-meta" id="single-choice-triage-meta">${this.singleChoiceSelectedEntryIds.size}/${this.singleChoiceFlagLimit} evidence markers flagged</div>
                                    <div class="l2-section-kicker">Attack Classification</div>
                                    <div class="l2-choice-grid" id="single-choice-grid">${choiceMarkup}</div>
                                    <div class="l2-feedback guess-feedback" id="guess-feedback">
                                        Flag the strongest indicators first, then choose one attack type.
                                        ${this.maxAttempts > 1 ? `<br><span style="color:var(--cyber-orange);">You have ${this.maxAttempts} attack-label attempts. A wrong guess costs vault integrity.</span>` : ''}
                                    </div>
                                    <div class="l2-actions">
                                        <button class="l2-btn l2-btn-primary" id="submit-single-choice">SUBMIT ATTACK LABEL</button>
                                    </div>`}
                            </main>
                        </div>
                    </div>`
            })}`;

        this.setupSingleChoiceEventListeners();
        if (!this.singleChoiceTimerId && !this.singleChoiceLogTimerId) this.startSingleChoiceSimulation();
        this.startHumanLabMatrixAnimation();
        this.gameScreen.syncEmbeddedMissionHUD();
    }

    getSingleChoiceDescription(choiceId) {
        const map = {
            brute_force: 'Wide random combination coverage across many possible passwords.',
            dictionary_attack: 'Known words and common password patterns tried in sequence.',
            credential_stuffing: 'Leaked real credentials reused across accounts or services.',
            insider_access: 'Legitimate internal access abused by an authorized user.'
        };
        return map[choiceId] || 'Review the stream and choose the attack category that best fits the evidence.';
    }

    getSingleChoiceEvidenceEntries() {
        const provided = Array.isArray(this.puzzleData.evidenceMarkers) ? this.puzzleData.evidenceMarkers : [];
        if (provided.length) return provided;
        return (this.puzzleData.loginAttemptStream?.entries || []).slice(0, 4).map((line, index) => ({
            id: `E${index + 1}`,
            code: `IOC-${index + 1}`,
            timestamp: this.extractInvestigationTimestamp(line) || `02:14:0${index + 1}`,
            title: line.split(' - ')[1] || line,
            description: 'Recovered from the live auth stream. Determine whether it supports a repeated wordlist pattern.'
        }));
    }

    toggleSingleChoiceEvidence(entryId) {
        if (!entryId || this.isComplete || this.singleChoiceStage !== 'triage') return;
        if (this.singleChoiceSelectedEntryIds.has(entryId)) this.singleChoiceSelectedEntryIds.delete(entryId);
        else if (this.singleChoiceSelectedEntryIds.size < this.singleChoiceFlagLimit) this.singleChoiceSelectedEntryIds.add(entryId);
        else {
            this.gameScreen.ui.showNotification(`Evidence flag limit reached (${this.singleChoiceFlagLimit}).`, 'warning');
            return;
        }
        this.audio.playButtonClick();
        this.updateSingleChoiceEvidenceUI(entryId);
    }

    updateSingleChoiceEvidenceUI(entryId) {
        if (!this.visualizerElement) return;
        const isSelected = this.singleChoiceSelectedEntryIds.has(entryId);
        const card = this.visualizerElement.querySelector(`[data-single-evidence-card="${entryId}"]`);
        const button = this.visualizerElement.querySelector(`[data-single-flag="${entryId}"]`);
        if (card) card.classList.toggle('selected', isSelected);
        if (button) {
            button.classList.toggle('active', isSelected);
            button.textContent = isSelected ? 'FLAGGED' : 'FLAG AS EVIDENCE';
        }

        const triageMeta = this.visualizerElement.querySelector('#single-choice-triage-meta');
        if (triageMeta) {
            triageMeta.textContent = `${this.singleChoiceSelectedEntryIds.size}/${this.singleChoiceFlagLimit} evidence markers flagged`;
        }

        const confidenceScore = this.getSingleChoiceConfidenceScore();
        const confidenceText = this.visualizerElement.querySelector('#single-choice-confidence-text');
        const confidenceFill = this.visualizerElement.querySelector('#single-choice-confidence-fill');
        const confidenceMeta = this.visualizerElement.querySelector('#single-choice-confidence-meta');
        if (confidenceText) confidenceText.textContent = `${confidenceScore}%`;
        if (confidenceFill) confidenceFill.style.width = `${confidenceScore}%`;
        if (confidenceMeta) confidenceMeta.innerHTML = `<span>Read: ${this.getSingleChoiceEvidenceSummary()}</span>`;
    }

    renderSingleChoiceLabStyles() {
        return `<style>
            .l2-shell{background:linear-gradient(180deg,#070b12 0%,#06080f 100%);color:#eef2ff;border:1px solid rgba(245,166,35,.14);box-shadow:0 20px 60px rgba(0,0,0,.35)}
            .l2-header{display:flex;justify-content:space-between;align-items:center;padding:16px 26px;background:#0a0d18;border-bottom:1px solid rgba(245,166,35,.25);gap:16px;flex-wrap:wrap}
            .l2-brand,.l2-level,.l2-status,.l2-phase,.l2-section-kicker,.l2-choice-card__title,.l2-btn,.l2-attempts,.l2-log-header{font-family:Consolas,"Courier New",monospace;letter-spacing:.2em;text-transform:uppercase}
            .l2-brand{color:#f5a623;font-weight:700}.l2-level{color:rgba(245,166,35,.72);font-size:.85rem}.l2-status{color:#00e87a;font-size:.82rem}
            .l2-phases{display:grid;grid-template-columns:repeat(3,1fr);background:#0b101b;border-bottom:1px solid rgba(245,166,35,.12)}
            .l2-phase{padding:14px 10px;text-align:center;color:rgba(180,190,230,.35);border-bottom:2px solid transparent;font-size:.78rem}.l2-phase span{display:block;font-size:1.6rem;font-weight:700;line-height:1.1}
            .l2-phase.active{color:#f5a623;background:rgba(245,166,35,.05);border-bottom-color:#f5a623}
            .l2-hint-strip{padding:12px 28px;background:rgba(0,212,255,.04);border-bottom:1px solid rgba(0,212,255,.12);color:rgba(0,212,255,.78);font-family:Consolas,"Courier New",monospace;letter-spacing:.12em;font-size:.82rem}
            .l2-frame{display:grid;grid-template-columns:340px 1fr;min-height:640px}
            .l2-panel{padding:28px;background:rgba(0,0,0,.18)}.l2-panel-left{border-right:1px solid rgba(245,166,35,.12)}
            .l2-section-kicker{font-size:.74rem;color:rgba(245,166,35,.64);margin-bottom:12px}
            .l2-brief-box,.l2-metric-box,.l2-guide,.l2-log-panel,.l2-feedback,.l2-choice-card,.l2-evidence-card{background:rgba(0,0,0,.34);border:1px solid rgba(245,166,35,.12)}
            .l2-brief-box,.l2-metric-box,.l2-feedback{padding:16px;line-height:1.7}.l2-brief-box strong{color:#f5a623}
            .l2-metric-box__row,.l2-metric-box__meta,.l2-main-head,.l2-actions,.l2-log-header{display:flex;justify-content:space-between;align-items:center;gap:12px}
            .l2-metric-box__row strong{font-size:1.8rem;color:#eef2ff}.l2-metric-box__meta{margin-top:10px;flex-wrap:wrap;color:rgba(180,190,230,.62);font-size:.82rem}
            .l2-guide{padding:0}.l2-hint{padding:12px 14px;border-bottom:1px solid rgba(245,166,35,.08);color:rgba(220,228,245,.84);line-height:1.65}.l2-hint:last-child{border-bottom:0}
            .l2-main-title{font-size:1.35rem;color:#eef2ff;line-height:1.45}
            .l2-attempts{padding:10px 12px;border:1px solid rgba(245,166,35,.18);background:rgba(245,166,35,.06);color:rgba(245,166,35,.82);font-size:.74rem}
            .l2-log-panel{margin-bottom:18px}.l2-log-header{padding:12px 14px;border-bottom:1px solid rgba(245,166,35,.12);color:rgba(245,166,35,.72);font-size:.72rem}
            .l2-log-feed{max-height:240px;overflow:auto;padding:14px;color:rgba(220,228,245,.8);font-family:Consolas,"Courier New",monospace;line-height:1.7}
            .l2-evidence-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-bottom:10px}
            .l2-evidence-card{padding:14px;transition:border-color .18s ease,box-shadow .18s ease}
            .l2-evidence-card.selected{border-color:#00d4ff;background:rgba(0,212,255,.06);box-shadow:0 0 0 1px rgba(0,212,255,.18) inset}
            .l2-evidence-card__meta{display:flex;justify-content:space-between;gap:12px;color:rgba(245,166,35,.62);font-family:Consolas,"Courier New",monospace;font-size:.74rem;letter-spacing:.14em;text-transform:uppercase}
            .l2-evidence-card__title{margin-top:10px;color:#eef2ff;font-weight:700}
            .l2-evidence-card__desc{margin-top:8px;color:rgba(180,190,230,.66);line-height:1.6}
            .l2-flag-btn{margin-top:12px;padding:9px 12px;background:rgba(0,0,0,.34);border:1px solid rgba(245,166,35,.18);color:rgba(245,166,35,.76);cursor:pointer;font-family:Consolas,"Courier New",monospace;letter-spacing:.18em;text-transform:uppercase}
            .l2-flag-btn.active{border-color:#00d4ff;color:#00d4ff;background:rgba(0,212,255,.08)}
            .l2-triage-meta{margin:2px 0 18px;color:rgba(180,190,230,.62);font-size:.82rem}
            .l2-choice-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
            .l2-choice-card{position:relative;display:flex;flex-direction:column;gap:10px;padding:54px 16px 16px;min-height:156px;overflow:hidden;cursor:pointer;transition:border-color .18s ease,box-shadow .18s ease,transform .18s ease;color:#eef2ff}
            .l2-choice-card:hover{transform:translateY(-2px);border-color:rgba(245,166,35,.36);box-shadow:0 14px 30px rgba(0,0,0,.18)}
            .l2-choice-card input{display:none}
            .l2-choice-card.selected{border-color:#00d4ff;background:rgba(0,212,255,.06);box-shadow:0 0 0 1px rgba(0,212,255,.18) inset}
            .l2-choice-card__title{margin:0;padding-right:88px;color:#f5a623;font-size:.84rem;line-height:1.45;word-break:break-word}
            .l2-choice-card__desc{color:rgba(180,190,230,.66);line-height:1.6;word-break:break-word}
            .l2-feedback{margin-top:18px;color:rgba(220,228,245,.86);min-height:74px}
            .l2-actions{margin-top:18px;justify-content:flex-end}
            .l2-btn{padding:13px 18px;background:rgba(0,0,0,.38);border:1px solid rgba(245,166,35,.18);color:rgba(245,166,35,.78);cursor:pointer}
            .l2-btn:hover{border-color:rgba(245,166,35,.45);color:#ffcb6b}
            .l2-btn-primary{background:linear-gradient(90deg,rgba(245,166,35,.16),rgba(245,166,35,.06));border-color:rgba(245,166,35,.42);color:#eef2ff;font-weight:700;letter-spacing:.24em}
            @media (max-width:1080px){.l2-frame{grid-template-columns:1fr}.l2-panel-left{border-right:0;border-bottom:1px solid rgba(245,166,35,.12)}}
            @media (max-width:720px){.l2-header{padding:14px 18px}.l2-panel{padding:20px}.l2-choice-grid,.l2-phases,.l2-evidence-grid{grid-template-columns:1fr}.l2-main-head,.l2-actions{flex-direction:column;align-items:flex-start}}
        </style>`;
    }

    setupSingleChoiceEventListeners() {
        document.querySelectorAll('[data-single-flag]').forEach(btn => {
            btn.addEventListener('click', () => this.toggleSingleChoiceEvidence(btn.dataset.singleFlag || ''));
        });
        document.querySelectorAll('input[name="attack-choice"]').forEach(radio => {
            radio.addEventListener('change', () => {
                this.singleChoiceSelected = radio.value;
                document.querySelectorAll('.l2-choice-card').forEach(card => {
                    const input = card.querySelector('input[name="attack-choice"]');
                    card.classList.toggle('selected', !!input && input.checked);
                });
                this.audio.playButtonClick();
            });
        });
        document.querySelectorAll('input[name="single-choice-defense"]').forEach(radio => {
            radio.addEventListener('change', () => {
                this.singleChoiceDefenseSelected = radio.value;
                document.querySelectorAll('.l2-choice-card').forEach(card => {
                    const attackInput = card.querySelector('input[name="attack-choice"]');
                    const defenseInput = card.querySelector('input[name="single-choice-defense"]');
                    card.classList.toggle('selected', !!attackInput && attackInput.checked || !!defenseInput && defenseInput.checked);
                });
                this.audio.playButtonClick();
            });
        });
        document.getElementById('submit-single-choice')?.addEventListener('click', () => this.submitSingleChoiceDecision());
        document.getElementById('submit-single-choice-defense')?.addEventListener('click', () => this.submitSingleChoiceDefense());
    }

    startSingleChoiceSimulation() {
        const stream = this.puzzleData.loginAttemptStream || {};
        const entries = Array.isArray(stream.entries) ? stream.entries : [];
        const tickMs = stream.tickMs || 1000;
        const passiveDrop = this.vaultConfig?.passiveDropPerSecond || 0;
        this.updateSingleChoiceTimerUI();
        this.updateVaultIntegrityUI();

        if (entries.length > 0) {
            this.appendNextLogEntry();
            this.singleChoiceLogTimerId = setInterval(() => {
                if (this.isComplete || this.gameScreen?.isPaused) return;
                this.appendNextLogEntry();
            }, tickMs);
        }

        this.singleChoiceTimerId = setInterval(() => {
            if (this.isComplete || this.gameScreen?.isPaused) return;
            this.singleChoiceRemaining = Math.max(0, this.singleChoiceRemaining - 1);
            this.vaultIntegrity = Math.max(this.vaultConfig?.min || 0, this.vaultIntegrity - passiveDrop);
            this.updateSingleChoiceTimerUI();
            this.updateVaultIntegrityUI();
            if (this.vaultIntegrity <= (this.vaultConfig?.min || 0)) {
                this.onSingleChoiceFailure(this.vaultConfig?.breachMessage || 'Breach simulation: Vault Integrity reached 0.');
                return;
            }
            if (this.singleChoiceRemaining <= 0) {
                this.onSingleChoiceFailure(this.mission.failureFeedback || 'Time is up.');
            }
        }, 1000);
    }

    appendNextLogEntry() {
        const entries = this.puzzleData.loginAttemptStream?.entries || [];
        const panel = document.getElementById('attack-log-stream');
        if (!panel || !entries.length) return;
        if (panel.textContent.includes('Waiting for incoming login attempts...')) panel.innerHTML = '';
        const line = document.createElement('div');
        line.textContent = entries[this.logEntryIndex % entries.length];
        panel.appendChild(line);
        panel.scrollTop = panel.scrollHeight;
        this.logEntryIndex++;
    }

    // FIX L2: second attempt on wrong guess
    submitSingleChoiceDecision() {
        if (this.isComplete) return;
        const requiredEvidence = Array.isArray(this.puzzleData.requiredEvidenceIds) ? this.puzzleData.requiredEvidenceIds : [];
        const matchedEvidence = requiredEvidence.filter(id => this.singleChoiceSelectedEntryIds.has(id));
        const minimumEvidence = Math.min(requiredEvidence.length || 2, 2);
        if (this.singleChoiceSelectedEntryIds.size === 0 || matchedEvidence.length < minimumEvidence) {
            this.gameScreen.ui.showNotification('Flag the strongest evidence before submitting your attack label.', 'warning');
            const feedback = document.getElementById('guess-feedback');
            if (feedback) feedback.innerHTML = `<strong style="color:var(--cyber-orange);">More evidence needed.</strong><br>Flag at least ${minimumEvidence} high-signal indicators that support your conclusion.`;
            return;
        }
        if (!this.singleChoiceSelected) {
            this.gameScreen.ui.showNotification('Select one attack type first.', 'warning');
            return;
        }

        this.attempts++;
        this.updateAttemptCounter();
        this.gameScreen.updateAttempts(this.attempts);

        const correctChoice = this.puzzleData.correctChoice;

        if (this.singleChoiceSelected === correctChoice) {
            this.onSingleChoiceLabelSuccess();
            return;
        }

        // Wrong answer
        this.vaultIntegrity = Math.max(
            this.vaultConfig?.min || 0,
            this.vaultIntegrity - (this.vaultConfig?.wrongChoicePenalty || 0)
        );
        this.updateVaultIntegrityUI();
        this.audio.playFailure();

        const feedback = document.getElementById('guess-feedback');
        const attemptsLeft = this.maxAttempts - this.attempts;

        if (this.vaultIntegrity <= (this.vaultConfig?.min || 0)) {
            this.onSingleChoiceFailure(this.vaultConfig?.breachMessage || 'Breach simulation: Vault Integrity reached 0.');
            return;
        }

        if (attemptsLeft <= 0) {
            // Out of attempts
            if (feedback) feedback.textContent = this.puzzleData.choiceFeedback?.wrong || 'Incorrect. No attempts remaining.';
            this.onSingleChoiceFailure(this.mission.failureFeedback || 'Wrong decision. Mission failed.');
            return;
        }

        // Still has attempts left — let player try again
        if (feedback) {
            feedback.innerHTML = `
                <strong style="color:var(--cyber-pink);">Incorrect.</strong>
                ${this.puzzleData.choiceFeedback?.wrong || 'Look again at the pattern.'}
                <br><span style="color:var(--cyber-orange);">${attemptsLeft} attempt${attemptsLeft === 1 ? '' : 's'} remaining. Vault integrity reduced.</span>`;
        }
        // Reset radio so player must re-select
        this.singleChoiceSelected = null;
        document.querySelectorAll('input[name="attack-choice"]').forEach(r => { r.checked = false; });
    }

    onSingleChoiceLabelSuccess() {
        const feedback = document.getElementById('guess-feedback');
        this.singleChoiceStage = 'defense';
        this.audio.playSuccess();
        if (feedback) feedback.innerHTML = `<strong style="color:var(--cyber-green);">Correct classification.</strong><br>${this.puzzleData.choiceFeedback?.correct || 'Correct choice.'}<br><span style="color:var(--cyber-orange);">Now activate the best control to stop continued guessing.</span>`;
        this.gameScreen.ui.showNotification('Attack identified. Select containment.', 'success');
        this.renderSingleChoicePuzzle(this.visualizerElement);
    }

    submitSingleChoiceDefense() {
        if (this.isComplete || this.singleChoiceStage !== 'defense') return;
        const followUp = this.puzzleData.followUpDefenseQuestion || null;
        if (!followUp) {
            this.onSingleChoiceSuccess();
            return;
        }
        if (!this.singleChoiceDefenseSelected) {
            this.gameScreen.ui.showNotification('Select a containment option first.', 'warning');
            return;
        }
        const correct = this.singleChoiceDefenseSelected === followUp.correctAnswer;
        const feedback = document.getElementById('guess-feedback');
        if (!correct) {
            this.vaultIntegrity = Math.max(this.vaultConfig?.min || 0, this.vaultIntegrity - Number(followUp.wrongChoicePenalty || 10));
            this.updateVaultIntegrityUI();
            if (feedback) feedback.innerHTML = `<strong style="color:var(--cyber-pink);">Containment mismatch.</strong><br>${followUp.explanation || 'Choose the control that directly slows or stops repeated guessing.'}`;
            this.audio.playFailure();
            if (this.vaultIntegrity <= (this.vaultConfig?.min || 0)) {
                this.onSingleChoiceFailure(this.vaultConfig?.breachMessage || 'Breach simulation: Vault Integrity reached 0.');
                return;
            }
            this.gameScreen.ui.showNotification('That control would not contain this attack fast enough.', 'error');
            return;
        }
        if (feedback) feedback.innerHTML = `<strong style="color:var(--cyber-green);">Containment selected correctly.</strong><br>${followUp.explanation || ''}`;
        this.onSingleChoiceSuccess();
    }

    onSingleChoiceSuccess() {
        this.isComplete = true;
        this.stopSingleChoiceTimers();
        this.audio.playSuccess();
        this.gameScreen.ui.flashScreen('rgba(0,255,65,0.2)', 300);
        this.gameScreen.ui.showNotification('Attack blocked.', 'success');
        const shock = this.puzzleData.shockEvent;
        if (!shock || shock.trigger !== 'afterCorrect') {
            setTimeout(() => this.gameScreen.completePuzzle(true), 1000);
            return;
        }
        const feedback = document.getElementById('guess-feedback');
        setTimeout(() => {
            if (feedback) feedback.innerHTML = `<strong>${shock.title || 'Alert'}</strong><br>${shock.message || ''}`;
            this.gameScreen.ui.showNotification(shock.title || 'Alert', 'warning');
            setTimeout(() => this.gameScreen.completePuzzle(true), 1600);
        }, shock.delayMs || 1000);
    }

    onSingleChoiceFailure(message) {
        if (this.isComplete) return;
        this.isComplete = true;
        this.stopSingleChoiceTimers();
        this.audio.playFailure();
        this.gameScreen.ui.flashScreen('rgba(255,0,110,0.2)', 300);
        this.gameScreen.ui.showNotification(message || 'Mission failed.', 'error');
        setTimeout(() => this.gameScreen.completePuzzle(false), 1200);
    }

    stopSingleChoiceTimers() {
        if (this.singleChoiceTimerId) { clearInterval(this.singleChoiceTimerId); this.singleChoiceTimerId = null; }
        if (this.singleChoiceLogTimerId) { clearInterval(this.singleChoiceLogTimerId); this.singleChoiceLogTimerId = null; }
    }

    updateSingleChoiceTimerUI() {
        const el = document.getElementById('single-timer-text');
        if (el) el.textContent = `${Math.max(0, this.singleChoiceRemaining)}s`;
    }

    updateVaultIntegrityUI() {
        const value = Math.max(this.vaultConfig?.min || 0, Math.min(100, this.vaultIntegrity));
        const fill = document.getElementById('vault-fill');
        const text = document.getElementById('vault-text');
        if (fill) fill.style.width = `${value}%`;
        if (text) text.textContent = `${Math.floor(value)}%`;
    }

    // ─── Prediction choice (Level 3) ─────────────────────────────────────────

    renderPredictionChoicePuzzle(container) {
        this.visualizerElement = container;
        const session = this.predictionSession || this.createPredictionSession();
        const options = Array.isArray(session.options) ? session.options : [];
        const allClassified = options.every(option => !!this.predictionRatings[option]);
        const boardSummary = this.getPredictionClassificationSummary(session);
        const ratedCount = Object.keys(this.predictionRatings).length;
        const selectedIndex = this.predictionSelected ? options.indexOf(this.predictionSelected) : -1;
        const selectedLabel = selectedIndex >= 0 ? `OPTION ${String.fromCharCode(65 + selectedIndex)}` : 'NONE';
        const submitReady = !!this.predictionSelected;
        const submitButtonLabel = submitReady ? 'SUBMIT PREDICTION' : 'SELECT A BREAKS FIRST CARD';
        const choiceMarkup = options.map((option, idx) => {
            const profile = this.getPredictionPasswordProfile(option, session);
            const selected = this.predictionSelected === option;
            const currentRating = this.predictionRatings[option] || '';
            const classifyButtons = ['weak', 'medium', 'strong'].map(label => `
                <button class="l3-rate-btn ${currentRating === label ? 'selected' : ''}" type="button" data-prediction-rate="${option}" data-rating-value="${label}">
                    ${label.toUpperCase()}
                </button>`).join('');
            return `
                <div class="l3-card ${selected ? 'selected' : ''} ${currentRating ? `is-rated is-rated--${currentRating}` : ''}" data-card-index="${idx}">
                    <div class="l3-card__accent"></div>
                    <div class="l3-card__body">
                        <div class="l3-card__top">
                            <div class="l3-card__identity">
                                <span class="l3-card__label">OPTION ${String.fromCharCode(65 + idx)}</span>
                                <span class="l3-card__status">${currentRating ? currentRating.toUpperCase() : 'UNRATED'}</span>
                            </div>
                        </div>
                        <div class="l3-card__value">${option}</div>
                        <div class="l3-signal-grid">
                            <div class="l3-signal">
                                <span>Length</span>
                                <strong>${profile.lengthSignal}</strong>
                            </div>
                            <div class="l3-signal">
                                <span>Predictability</span>
                                <strong>${profile.predictabilitySignal}</strong>
                            </div>
                            <div class="l3-signal">
                                <span>Pattern Risk</span>
                                <strong>${profile.commonRiskSignal}</strong>
                            </div>
                        </div>
                        <div class="l3-card__note">${profile.note}</div>
                        <div class="l3-card__footer">
                            <div class="l3-rate-label">Classify this password first</div>
                            <div class="l3-rate-row">${classifyButtons}</div>
                            <button class="l3-pick l3-pick--block ${selected ? 'selected' : ''}" type="button" data-prediction-pick="${option}">
                                <span>${selected ? 'FINAL ANSWER SELECTED' : 'MARK AS BREAKS FIRST'}</span>
                            </button>
                        </div>
                    </div>
                </div>`;
        }).join('');
        const raceMarkup = options.map((option, idx) => `
            <div class="l3-race-row">
                <div class="l3-race-row__meta">
                    <div class="l3-race-row__title">
                        <span class="l3-race-row__tag">${String.fromCharCode(65 + idx)}</span>
                        <span class="l3-race-row__password">${option}</span>
                    </div>
                    <span class="l3-race-row__time" id="race-time-${idx}">Estimating...</span>
                </div>
                <div class="l3-race-track">
                    <div id="race-bar-${idx}" class="l3-race-bar" style="transition-duration:${this.puzzleData?.simulationUI?.animateDurationMs || 3200}ms;"></div>
                </div>
            </div>`).join('');

        container.innerHTML = `
            ${this.renderPredictionChoiceStyles()}
            ${this.renderSharedPasswordLabThemeStyles()}
            ${this.renderSharedPasswordLabFrame({
                levelLabel: '// LEVEL 03 - BENCHMARK LAB',
                title: 'PASSWORD STRENGTH<br>RACE',
                status: 'BENCHMARK LAB ACTIVE',
                phases: [
                    { label: 'CLASSIFY', active: !allClassified && !this.predictionSelected },
                    { label: 'PREDICT', active: allClassified && !this.predictionSelected },
                    { label: 'RACE', active: !!this.predictionSelected }
                ],
                content: `
                    <div class="l3-shell">
                        <div class="l3-body">
                            <section class="l3-arena">
                                <div class="l3-arena-header">
                                    <div>
                                        <div class="l3-arena-title">PREDICT<br>THE<br><span>WINNER</span></div>
                                        <div class="l3-arena-sub">// ${options.length} benchmark candidates · choose the weakest one first</div>
                                    </div>
                                    <div class="l3-arena-hint">
                                        Rate each card, then use <b>MARK AS BREAKS FIRST</b> on the password you think collapses first.
                                    </div>
                                </div>
                                <div class="l3-arena-scroll">
                                    <div class="l3-grid" id="prediction-choice-grid">${choiceMarkup}</div>
                                </div>
                                <div class="l3-submit-dock">
                                    <div class="l3-submit-cluster">
                                        <span class="l3-submit-label">Target</span>
                                        <div class="l3-target-slot ${submitReady ? 'active' : ''}" id="prediction-target-slot">${submitReady ? selectedLabel : 'NONE'}</div>
                                    </div>
                                    <div class="l3-submit-cluster l3-submit-cluster--summary">
                                        <div class="l3-submit-value" id="prediction-rated-total">${ratedCount}/${options.length}</div>
                                        <div class="l3-submit-points-label">Rated</div>
                                    </div>
                                    <div class="l3-submit-meta">
                                        <div class="l3-attempts" id="attempt-counter">Decisions: <span>${this.attempts}</span> / ${this.maxAttempts}</div>
                                    </div>
                                    <button class="l3-fire-btn" id="submit-prediction-choice" ${submitReady ? '' : 'disabled'}>${submitButtonLabel}</button>
                                </div>
                            </section>

                            <aside class="l3-console">
                                <section class="l3-console-panel">
                                    <div class="l3-console-title">Mission Brief</div>
                                    <div class="l3-brief-box">
                                        <div><strong>Objective:</strong> ${this.mission.objective || ''}</div>
                                        <div><strong>Scenario:</strong> ${this.mission.scenario || ''}</div>
                                        <div><strong>Task:</strong> Rate the candidates, then predict which one breaks first.</div>
                                    </div>
                                </section>

                                <section class="l3-console-panel">
                                    <div class="l3-console-head">
                                        <div class="l3-console-title">Benchmark Signals</div>
                                        <div class="l3-console-chip" id="prediction-analysis-chip">${submitReady ? 'TARGET LOCKED' : 'ANALYZE'}</div>
                                    </div>
                                    <div class="l3-console-stats">
                                        <div class="l3-console-stat">
                                            <span>Time</span>
                                            <strong id="prediction-timer-text">${this.predictionRemaining}s</strong>
                                        </div>
                                        <div class="l3-console-stat">
                                            <span>Rated</span>
                                            <strong id="prediction-signal-rated">${ratedCount}/${options.length}</strong>
                                        </div>
                                        <div class="l3-console-stat">
                                            <span>Target</span>
                                            <strong id="prediction-signal-target">${submitReady ? selectedLabel : 'NONE'}</strong>
                                        </div>
                                    </div>
                                    <div class="l3-console-track">
                                        <div class="l3-console-fill" id="prediction-timer-fill" style="width:100%;"></div>
                                    </div>
                                    <div class="l3-console-summary" id="prediction-summary-text">${boardSummary}</div>
                                    <div class="l3-hint-stack">
                                        <div class="l3-hint">Short passwords usually break faster.</div>
                                        <div class="l3-hint">Common words and known substitutions are cheap attacker wins.</div>
                                        <div class="l3-hint">Longer and less predictable passwords usually hold longer.</div>
                                    </div>
                                </section>

                                <section class="l3-console-panel l3-console-panel--fill">
                                    <div class="l3-console-head">
                                        <div class="l3-console-title">Race Console</div>
                                        <div class="l3-console-chip" id="prediction-race-chip">${submitReady ? 'READY' : 'WAITING'}</div>
                                    </div>
                                    <div class="l3-feedback guess-feedback" id="guess-feedback">${submitReady ? 'Press SUBMIT PREDICTION to run the benchmark race.' : 'Choose one card as BREAKS FIRST to continue. Ratings help your analysis, but they do not block submit.'}</div>
                                    <div id="prediction-race-board" class="l3-race-board" style="display:none;">
                                        <div class="l3-race-board__head">
                                            <div>
                                                <div class="l3-section-kicker">Crack Speed Race</div>
                                                <div class="l3-race-board__title">Benchmark replay shows which password collapses first under automated guessing.</div>
                                            </div>
                                            <div class="l3-race-board__legend">
                                                <span><i class="l3-race-board__dot l3-race-board__dot--weak"></i>Fastest to crack</span>
                                                <span><i class="l3-race-board__dot l3-race-board__dot--strong"></i>Holds longer</span>
                                            </div>
                                        </div>
                                        <div id="prediction-race-rows">${raceMarkup}</div>
                                    </div>
                                </section>
                            </aside>
                        </div>
                    </div>`
            })}`;

        this.setupPredictionChoiceEventListeners();
        if (!this.predictionTimerId) this.startPredictionTimer();
        this.startHumanLabMatrixAnimation();
        this.gameScreen.syncEmbeddedMissionHUD();
    }

    refreshPredictionChoiceInlineState() {
        if (!this.visualizerElement) return;
        const session = this.predictionSession || this.createPredictionSession();
        const options = Array.isArray(session.options) ? session.options : [];
        const allClassified = options.every(option => !!this.predictionRatings[option]);
        const ratedCount = options.filter(option => !!this.predictionRatings[option]).length;
        const selectedIndex = this.predictionSelected ? options.indexOf(this.predictionSelected) : -1;
        const selectedLabel = selectedIndex >= 0 ? `OPTION ${String.fromCharCode(65 + selectedIndex)}` : 'NONE';
        const submitReady = !!this.predictionSelected;
        const boardSummary = this.getPredictionClassificationSummary(session);

        options.forEach((option, idx) => {
            const card = this.visualizerElement.querySelector(`.l3-card[data-card-index="${idx}"]`);
            if (!card) return;
            const currentRating = this.predictionRatings[option] || '';
            const selected = this.predictionSelected === option;

            card.classList.toggle('selected', selected);
            ['weak', 'medium', 'strong'].forEach(level => {
                card.classList.toggle(`is-rated--${level}`, currentRating === level);
            });

            const status = card.querySelector('.l3-card__status');
            if (status) status.textContent = currentRating ? currentRating.toUpperCase() : 'UNRATED';

            card.querySelectorAll('[data-rating-value]').forEach(rateBtn => {
                rateBtn.classList.toggle('selected', rateBtn.dataset.ratingValue === currentRating);
            });

            const pickButton = card.querySelector('[data-prediction-pick]');
            const pickLabel = pickButton?.querySelector('span');
            if (pickButton) pickButton.classList.toggle('selected', selected);
            if (pickLabel) pickLabel.textContent = selected ? 'FINAL ANSWER SELECTED' : 'MARK AS BREAKS FIRST';
        });

        const targetSlot = document.getElementById('prediction-target-slot');
        if (targetSlot) {
            targetSlot.textContent = selectedLabel;
            targetSlot.classList.toggle('active', submitReady);
        }

        const ratedTotal = document.getElementById('prediction-rated-total');
        if (ratedTotal) ratedTotal.textContent = `${ratedCount}/${options.length}`;

        const signalRated = document.getElementById('prediction-signal-rated');
        if (signalRated) signalRated.textContent = `${ratedCount}/${options.length}`;

        const signalTarget = document.getElementById('prediction-signal-target');
        if (signalTarget) signalTarget.textContent = selectedLabel;

        const analysisChip = document.getElementById('prediction-analysis-chip');
        if (analysisChip) analysisChip.textContent = submitReady ? 'TARGET LOCKED' : 'ANALYZE';

        const raceChip = document.getElementById('prediction-race-chip');
        if (raceChip) raceChip.textContent = submitReady ? 'READY' : 'WAITING';

        const summary = document.getElementById('prediction-summary-text');
        if (summary) summary.innerHTML = boardSummary;

        const feedback = document.getElementById('guess-feedback');
        const raceBoard = document.getElementById('prediction-race-board');
        if (feedback && (!raceBoard || raceBoard.style.display === 'none')) {
            feedback.innerHTML = submitReady
                ? 'Press SUBMIT PREDICTION to run the benchmark race.'
                : 'Choose one card as BREAKS FIRST to continue. Ratings help your analysis, but they do not block submit.';
        }

        const submitButton = document.getElementById('submit-prediction-choice');
        if (submitButton) {
            submitButton.disabled = !submitReady;
            submitButton.textContent = submitReady ? 'SUBMIT PREDICTION' : 'SELECT A BREAKS FIRST CARD';
        }

        const phases = Array.from(this.visualizerElement.querySelectorAll('.lab-shared-phase'));
        phases.forEach((phase, index) => {
            const isActive = index === 0
                ? !allClassified && !submitReady
                : index === 1
                    ? allClassified && !submitReady
                    : submitReady;
            phase.classList.toggle('active', isActive);
        });
    }

    capturePredictionChoiceInlineScrollState() {
        if (!this.visualizerElement) return [];
        const selectors = ['__root__', '.lab-shared-shell', '.l3-arena-scroll', '.l3-console-panel--fill'];
        return selectors.map(selector => {
            const element = selector === '__root__'
                ? this.visualizerElement
                : this.visualizerElement.querySelector(selector);
            return element ? { selector, scrollTop: element.scrollTop, scrollLeft: element.scrollLeft } : null;
        }).filter(Boolean);
    }

    restorePredictionChoiceInlineScrollState(state) {
        if (!Array.isArray(state) || !state.length || !this.visualizerElement) return;
        const apply = () => {
            state.forEach(entry => {
                const element = entry.selector === '__root__'
                    ? this.visualizerElement
                    : this.visualizerElement.querySelector(entry.selector);
                if (!element) return;
                element.scrollTop = entry.scrollTop || 0;
                element.scrollLeft = entry.scrollLeft || 0;
            });
        };

        apply();
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                apply();
            });
        });
    }

    bindPredictionChoiceStableAction(element, handler) {
        if (!element) return;
        const suppressFocusShift = event => {
            event.preventDefault();
        };

        element.addEventListener('mousedown', suppressFocusShift);
        element.addEventListener('pointerdown', suppressFocusShift);

        element.addEventListener('click', event => {
            event.preventDefault();
            event.stopPropagation();
            if (this.isComplete) return;
            const scrollState = this.capturePredictionChoiceInlineScrollState();
            handler(event, element);
            element.blur();
            this.restorePredictionChoiceInlineScrollState(scrollState);
        });
    }

    setupPredictionChoiceEventListeners() {
        document.querySelectorAll('[data-prediction-rate]').forEach(btn => {
            this.bindPredictionChoiceStableAction(btn, () => {
                const password = btn.dataset.predictionRate || '';
                const rating = btn.dataset.ratingValue || '';
                if (!password || !rating) return;
                this.predictionRatings[password] = rating;
                this.audio.playButtonClick();
                this.refreshPredictionChoiceInlineState();
            });
        });
        document.querySelectorAll('[data-prediction-pick]').forEach(btn => {
            this.bindPredictionChoiceStableAction(btn, () => {
                this.predictionSelected = btn.dataset.predictionPick || null;
                this.audio.playButtonClick();
                this.refreshPredictionChoiceInlineState();
            });
        });
        this.bindPredictionChoiceStableAction(
            document.getElementById('submit-prediction-choice'),
            () => this.submitPredictionChoiceDecision()
        );
    }

    startPredictionTimer() {
        this.updatePredictionTimerUI();
        this.predictionTimerId = setInterval(() => {
            if (this.isComplete || this.gameScreen?.isPaused) return;
            this.predictionRemaining = Math.max(0, this.predictionRemaining - 1);
            this.updatePredictionTimerUI();
            if (this.predictionRemaining <= 0) this.onPredictionChoiceFailure('Time is up. The weaker password broke first.');
        }, 1000);
    }

    stopPredictionTimer() {
        if (this.predictionTimerId) { clearInterval(this.predictionTimerId); this.predictionTimerId = null; }
    }

    updatePredictionTimerUI() {
        const timerText = document.getElementById('prediction-timer-text');
        const timerFill = document.getElementById('prediction-timer-fill');
        if (timerText) timerText.textContent = `${this.predictionRemaining}s`;
        if (timerFill) {
            const pct = Math.max(0, Math.min(100, (this.predictionRemaining / Math.max(1, this.puzzleData.timeLimit || 1)) * 100));
            timerFill.style.width = `${pct}%`;
        }
    }

    getPredictionBreakTime(password) {
        if (typeof this.puzzleData.simulateBreakTime === 'function') return this.puzzleData.simulateBreakTime(password, this.predictionSession);
        const table = this.predictionSession?.breakTimeSeconds || {};
        return table[password] || 60;
    }

    getPredictionPasswordProfile(password, session) {
        const value = String(password || '');
        const breakTime = this.getPredictionBreakTime(value);
        const hasYear = /\b(19|20)\d{2}\b|20\d{2}|\d{4}/.test(value);
        const hasNumberSuffix = /[A-Za-z]+\d+$/.test(value);
        const hasCommonWord = /(welcome|password|company|correct|horse|battery|staple|admin|system)/i.test(value);
        const symbolHeavy = /[^A-Za-z0-9]/.test(value);
        const lengthSignal = value.length >= 18 ? 'LONG' : value.length >= 10 ? 'MEDIUM' : 'SHORT';
        const predictabilitySignal = hasCommonWord || hasYear || hasNumberSuffix ? 'HIGH' : symbolHeavy && value.length >= 10 ? 'LOW' : 'MEDIUM';
        const commonRiskSignal = breakTime <= 30 ? 'HIGH' : breakTime <= 900 ? 'MEDIUM' : 'LOW';
        const expectedRating = breakTime <= 30 ? 'weak' : breakTime <= 1800 ? 'medium' : 'strong';
        const note = expectedRating === 'weak'
            ? 'This looks easy to guess because it uses a common or predictable pattern.'
            : expectedRating === 'medium'
                ? 'This has some protection, but it still has traits an attacker can model.'
                : 'This lasts longer because it is less predictable and/or much longer.';
        return { lengthSignal, predictabilitySignal, commonRiskSignal, expectedRating, note };
    }

    renderPredictionChoiceStyles() {
        return `<style>
            .l3-shell{display:flex;flex-direction:column;min-height:0;color:#eef2ff}
            .l3-brand,.l3-level,.l3-status,.l3-phase,.l3-section-kicker,.l3-attempts,.l3-card__label,.l3-rate-label,.l3-card__status,.l3-submit-label,.l3-submit-points-label,.l3-console-title,.l3-console-chip,.l3-race-row__tag{font-family:Consolas,"Courier New",monospace;letter-spacing:.2em;text-transform:uppercase}
            .lab-shared-content > .l3-shell{flex:0 0 auto;min-height:auto!important;width:100%}
            .l3-shell{width:100%;height:auto!important;min-height:100%!important;overflow:visible!important;background:transparent}
            .l3-body{flex:1;min-width:0;min-height:0;display:grid;grid-template-columns:minmax(0,1fr) 360px;overflow:hidden}
            .l3-arena{display:flex;flex-direction:column;min-width:0;min-height:0;border-right:1px solid rgba(23,216,255,.16)}
            .l3-arena-header{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;padding:16px 24px 12px;border-bottom:1px solid rgba(23,216,255,.16);background:rgba(0,4,14,.58);flex-shrink:0}
            .l3-arena-title{font-family:'Bebas Neue',sans-serif;font-size:clamp(48px,4.2vw,68px);letter-spacing:3px;line-height:.88;color:rgba(255,255,255,.92);text-transform:uppercase}
            .l3-arena-title span{color:#ff3f78;text-shadow:0 0 18px rgba(255,63,120,.28)}
            .l3-arena-sub{margin-top:4px;font-size:10px;letter-spacing:1px;color:rgba(168,216,232,.48)}
            .l3-arena-hint{max-width:300px;text-align:right;font-size:10px;letter-spacing:1px;line-height:1.5;color:rgba(168,216,232,.48)}
            .l3-arena-hint b{color:#17d8ff;font-weight:700}
            .l3-arena-scroll{flex:1;min-height:0;overflow-y:auto;overflow-x:hidden;padding:16px 24px;scrollbar-width:thin;scrollbar-color:rgba(23,216,255,.28) transparent}
            .l3-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
            .l3-card{position:relative;overflow:hidden;padding:0;border:1px solid rgba(23,216,255,.16);background:rgba(2,15,34,.9);color:rgba(232,244,255,.86);text-align:left;transition:border-color .2s ease,box-shadow .2s ease}
            .l3-card:hover{border-color:#17d8ff;box-shadow:-4px 0 0 rgba(23,216,255,.48),0 0 28px rgba(23,216,255,.12)}
            .l3-card.selected{border-color:#ff3f78;background:rgba(22,4,14,.96);box-shadow:0 0 0 1px rgba(255,63,120,.22) inset,0 0 28px rgba(255,63,120,.14)}
            .l3-card.is-rated--weak:not(.selected){border-color:rgba(255,63,120,.26)}
            .l3-card.is-rated--medium:not(.selected){border-color:rgba(255,204,0,.26)}
            .l3-card.is-rated--strong:not(.selected){border-color:rgba(0,255,136,.26)}
            .l3-card__accent{height:2px;background:rgba(23,216,255,.28);transition:background .3s ease}
            .l3-card:hover .l3-card__accent{background:#17d8ff}
            .l3-card.selected .l3-card__accent{background:#ff3f78;box-shadow:0 0 10px rgba(255,63,120,.42)}
            .l3-card.is-rated--medium .l3-card__accent{background:#ffcc00}
            .l3-card.is-rated--strong .l3-card__accent{background:#00ff88}
            .l3-card__body{display:flex;flex-direction:column;gap:12px;padding:16px;min-height:100%}
            .l3-card__top,.l3-race-row__meta{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}
            .l3-card__identity{display:flex;flex-direction:column;gap:8px}
            .l3-card__label{font-size:10px;letter-spacing:1px;color:rgba(168,216,232,.48)}
            .l3-card__status{display:inline-flex;align-items:center;padding:3px 8px;border:1px solid rgba(23,216,255,.18);font-size:9px;letter-spacing:2px;color:rgba(232,244,255,.72);background:rgba(23,216,255,.05)}
            .l3-card__value{font-family:'Teko',sans-serif;font-size:30px;font-weight:600;letter-spacing:2px;line-height:1.05;color:#17d8ff;word-break:break-all;text-shadow:0 0 10px rgba(23,216,255,.18)}
            .l3-card.selected .l3-card__value{color:#ff3f78;text-shadow:0 0 14px rgba(255,63,120,.24)}
            .l3-signal-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
            .l3-signal{padding:10px;border:1px solid rgba(23,216,255,.12);background:rgba(23,216,255,.04)}
            .l3-signal span{display:block;color:rgba(168,216,232,.48);font-size:9px;letter-spacing:1px;text-transform:uppercase}
            .l3-signal strong{display:block;margin-top:6px;color:rgba(232,244,255,.9);font-size:.86rem;letter-spacing:.06em;line-height:1.4}
            .l3-card__note{color:rgba(168,216,232,.62);line-height:1.65;font-size:.92rem;min-height:74px}
            .l3-card__footer{display:grid;gap:12px;margin-top:auto}
            .l3-rate-label{color:rgba(168,216,232,.48);font-size:9px;letter-spacing:2px}
            .l3-rate-row{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
            .l3-rate-btn{display:inline-flex;justify-content:center;align-items:center;min-height:38px;padding:8px 10px;background:rgba(0,0,0,.34);border:1px solid rgba(23,216,255,.18);color:rgba(232,244,255,.76);cursor:pointer;font-family:Consolas,"Courier New",monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase}
            .l3-rate-btn.selected{border-color:#17d8ff;color:#17d8ff;background:rgba(23,216,255,.08);box-shadow:0 0 0 1px rgba(0,212,255,.14) inset}
            .l3-pick{display:flex;align-items:center;justify-content:center;width:100%;min-height:46px;padding:12px 14px;border:1px solid rgba(23,216,255,.22);background:rgba(23,216,255,.05);color:rgba(232,244,255,.82);cursor:pointer;text-align:center;font-family:Consolas,"Courier New",monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase}
            .l3-pick span{line-height:1.45}
            .l3-pick.selected,.l3-card.selected .l3-pick{border-color:#ff3f78;background:rgba(255,63,120,.1);color:#ffdce8;box-shadow:0 0 0 1px rgba(255,63,120,.14) inset}
            .l3-submit-dock{display:flex;align-items:center;gap:20px;padding:16px 24px;border-top:1px solid rgba(23,216,255,.16);background:rgba(0,4,14,.84);flex-shrink:0;min-width:0}
            .l3-submit-cluster{display:flex;align-items:center;gap:8px;min-width:0}
            .l3-submit-cluster--summary{margin-left:auto;display:flex;flex-direction:column;align-items:flex-end;gap:0}
            .l3-submit-label{margin-right:4px;font-size:9px;letter-spacing:2px;color:rgba(168,216,232,.24)}
            .l3-target-slot{min-width:64px;height:28px;display:flex;align-items:center;justify-content:center;border:1px solid rgba(23,216,255,.28);background:rgba(23,216,255,.03);color:rgba(168,216,232,.24);font-family:'Teko',sans-serif;font-size:13px;letter-spacing:1px;transition:all .3s ease}
            .l3-target-slot.active{border-color:#ff3f78;background:rgba(255,63,120,.08);color:#ff3f78;box-shadow:0 0 10px rgba(255,63,120,.16)}
            .l3-submit-value{font-family:'Bebas Neue',sans-serif;font-size:32px;letter-spacing:2px;color:#17d8ff;line-height:1}
            .l3-submit-points-label{font-size:8px;letter-spacing:2px;color:rgba(168,216,232,.24)}
            .l3-submit-meta{min-width:112px;text-align:right}
            .l3-attempts{color:rgba(168,216,232,.24);font-size:8px;letter-spacing:2px}
            .l3-fire-btn{margin-left:4px;border:none;background:#ff3f78;color:#03070d;font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:4px;padding:12px 30px;cursor:pointer;clip-path:polygon(8px 0,100% 0,calc(100% - 8px) 100%,0 100%);transition:all .2s ease}
            .l3-fire-btn:hover{background:#ff5a8f;box-shadow:0 10px 32px rgba(255,63,120,.26)}
            .l3-fire-btn:disabled,.l3-fire-btn:disabled:hover{background:rgba(168,216,232,.18);color:rgba(3,7,13,.48);cursor:not-allowed;box-shadow:none}
            .l3-console{display:flex;flex-direction:column;gap:0;min-width:0;min-height:0;overflow:hidden;background:rgba(0,3,12,.97)}
            .l3-console-panel{position:relative;padding:18px 20px;background:rgba(0,3,12,.94);border-bottom:1px solid rgba(23,216,255,.16);flex-shrink:0}
            .l3-console-panel--fill{display:flex;flex-direction:column;flex:1;min-height:0;overflow-y:auto;overflow-x:hidden}
            .l3-console-title{display:flex;align-items:center;gap:8px;margin-bottom:12px;font-size:9px;letter-spacing:3px;color:rgba(168,216,232,.24)}
            .l3-console-title::before{content:'//';color:#17d8ff;font-size:11px}
            .l3-console-head{display:flex;justify-content:space-between;align-items:center;gap:12px}
            .l3-console-chip{padding:5px 9px;border:1px solid rgba(255,63,120,.24);background:rgba(255,63,120,.08);color:#ffd9e5;font-size:9px;letter-spacing:2px}
            .l3-brief-box{padding:0;border:0;background:none;box-shadow:none;backdrop-filter:none;line-height:1.85;color:rgba(232,244,255,.86)}
            .l3-brief-box strong{color:#ffcc00}
            .l3-console-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-bottom:12px}
            .l3-console-stat{padding:10px;border:1px solid rgba(23,216,255,.12);background:rgba(23,216,255,.04)}
            .l3-console-stat span{display:block;color:rgba(168,216,232,.24);font-size:8px;letter-spacing:2px;text-transform:uppercase}
            .l3-console-stat strong{display:block;margin-top:6px;color:rgba(255,255,255,.92);font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:2px;line-height:1}
            .l3-console-track{height:4px;background:rgba(23,216,255,.12);margin-bottom:12px}
            .l3-console-fill{height:100%;background:linear-gradient(90deg,#17d8ff,rgba(135,241,255,.92));box-shadow:0 0 12px rgba(23,216,255,.26)}
            .l3-console-summary{margin-bottom:12px;color:rgba(168,216,232,.48);font-size:11px;line-height:1.6}
            .l3-hint-stack{display:flex;flex-direction:column;gap:8px}
            .l3-hint{padding:10px 12px;border-left:2px solid #17d8ff;background:rgba(23,216,255,.05);color:rgba(232,244,255,.86);font-size:11px;line-height:1.6}
            .l3-feedback{margin-bottom:12px;padding:12px 14px;border:1px solid rgba(23,216,255,.1);background:rgba(2,10,24,.82);color:rgba(232,244,255,.86);line-height:1.65;font-size:11px;min-height:92px}
            .l3-race-board{display:flex;flex-direction:column;gap:14px;min-height:0}
            .l3-race-board__head{display:flex;justify-content:space-between;gap:18px;flex-wrap:wrap;align-items:flex-start}
            .l3-race-board__title{color:rgba(220,228,245,.82);line-height:1.6;max-width:680px}
            .l3-race-board__legend{display:flex;gap:14px;flex-wrap:wrap;color:rgba(180,190,230,.7);font-size:.82rem}
            .l3-race-board__legend span{display:inline-flex;align-items:center;gap:8px}
            .l3-race-board__dot{width:10px;height:10px;border-radius:50%;display:inline-block}
            .l3-race-board__dot--weak{background:var(--cyber-pink)}
            .l3-race-board__dot--strong{background:var(--cyber-green)}
            .l3-race-row{padding:14px 0;border-top:1px solid rgba(23,216,255,.1)}
            .l3-race-row:first-child{border-top:0;padding-top:4px}
            .l3-race-row__title{display:flex;align-items:center;gap:10px;min-width:0}
            .l3-race-row__tag{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border:1px solid rgba(23,216,255,.18);background:rgba(23,216,255,.06);color:#eef2ff;font-size:.7rem;flex-shrink:0}
            .l3-race-row__password{color:#eef2ff;word-break:break-word;line-height:1.5}
            .l3-race-row__time{color:#ffcb6b;font-family:Consolas,"Courier New",monospace;letter-spacing:.08em;white-space:nowrap}
            .l3-race-track{height:12px;margin-top:10px;background:rgba(100,116,139,0.2);overflow:hidden}
            .l3-race-bar{height:100%;width:0%;transition-property:width;transition-timing-function:linear;background:var(--cyber-blue);box-shadow:0 0 12px rgba(23,216,255,.18)}
            .l3-arena-scroll::-webkit-scrollbar,.l3-console-panel--fill::-webkit-scrollbar{width:4px}
            .l3-arena-scroll::-webkit-scrollbar-thumb,.l3-console-panel--fill::-webkit-scrollbar-thumb{background:rgba(23,216,255,.28);border-radius:999px}
            @media (max-width:1280px){.l3-body{grid-template-columns:minmax(0,1fr) 340px}.l3-arena-title{font-size:clamp(42px,3.8vw,60px)}}
            @media (max-width:1080px){.l3-shell{overflow:auto}.l3-body{grid-template-columns:1fr;height:auto;overflow:visible}.l3-arena{border-right:0;border-bottom:1px solid rgba(23,216,255,.16)}}
            @media (max-width:760px){.l3-arena-header,.l3-arena-scroll,.l3-submit-dock,.l3-console-panel{padding-left:16px;padding-right:16px}.l3-arena-header{flex-direction:column;align-items:flex-start}.l3-arena-hint{text-align:left;max-width:none}.l3-grid,.l3-signal-grid,.l3-console-stats{grid-template-columns:1fr}.l3-submit-dock{flex-wrap:wrap}.l3-submit-cluster--summary,.l3-submit-meta{margin-left:0;align-items:flex-start;text-align:left}.l3-fire-btn{width:100%;margin-left:0}.l3-pick{justify-content:flex-start;text-align:left}}
        </style>`;
    }

    submitPredictionChoiceDecision() {
        if (this.isComplete) return;
        const session = this.predictionSession || {};
        const options = Array.isArray(session.options) ? session.options : [];
        if (!this.predictionSelected) { this.gameScreen.ui.showNotification('Select one password first.', 'warning'); return; }
        this.attempts++;
        this.updateAttemptCounter();
        this.gameScreen.updateAttempts(this.attempts);
        this.stopPredictionTimer();

        const times = options.map(o => this.getPredictionBreakTime(o));
        const maxTime = Math.max(...times, 1);
        const raceBoard = document.getElementById('prediction-race-board');
        if (raceBoard) raceBoard.style.display = 'block';

        options.forEach((option, idx) => {
            const bar = document.getElementById(`race-bar-${idx}`);
            const label = document.getElementById(`race-time-${idx}`);
            const t = times[idx];
            const crackedPct = Math.max(8, Math.min(100, ((maxTime - t) / maxTime) * 100 + 8));
            if (bar) { bar.style.background = t === Math.min(...times) ? 'var(--cyber-pink)' : 'var(--cyber-green)'; requestAnimationFrame(() => { bar.style.width = `${crackedPct}%`; }); }
            if (label) label.textContent = `${t}s`;
        });

        const correct = this.predictionSelected === session.correctAnswer;
        const feedback = document.getElementById('guess-feedback');
        const explanation = session.simpleExplanation || '';
        const unrated = options.filter(option => !this.predictionRatings[option]);
        const mismatches = options.filter(option => this.predictionRatings[option] !== this.getPredictionPasswordProfile(option, session).expectedRating);
        const classificationLine = unrated.length
            ? `<div style="margin-top:6px;">You skipped ${unrated.length} rating${unrated.length === 1 ? '' : 's'}. The race still runs, but your analysis was incomplete.</div>`
            : mismatches.length
            ? `<div style="margin-top:6px;">Your strength labels missed ${mismatches.length} password${mismatches.length === 1 ? '' : 's'}. Focus on length and predictability first.</div>`
            : `<div style="margin-top:6px;color:var(--cyber-green);">Your strength labels matched the benchmark logic.</div>`;
        if (feedback) feedback.innerHTML = `<div><strong>${correct ? (this.mission.successFeedback || 'Good call.') : (this.mission.failureFeedback || 'Incorrect prediction.')}</strong></div><div style="margin-top:6px;">${explanation}</div>${classificationLine}`;

        const shock = this.puzzleData.shockEvent;
        const showShock = shock && shock.triggerCaseId && shock.triggerCaseId === session.caseId;
        setTimeout(() => {
            if (showShock && feedback) feedback.innerHTML += `<div style="margin-top:10px;"><strong>${shock.title}</strong> ${shock.message}</div>`;
            if (correct) this.onPredictionChoiceSuccess();
            else this.onPredictionChoiceFailure('Incorrect prediction. The weaker password broke first.');
        }, this.puzzleData?.simulationUI?.animateDurationMs || 3200);
    }

    onPredictionChoiceSuccess() {
        if (this.isComplete) return;
        this.isComplete = true;
        const feedback = document.getElementById('guess-feedback');
        if (feedback) {
            feedback.innerHTML += this.renderMissionDebrief({
                tone: 'success',
                title: 'Benchmark prediction confirmed',
                summary: this.mission.successFeedback || 'Your prediction matched the benchmark outcome.',
                details: [
                    'You compared length, predictability, and pattern risk before committing.',
                    'This is the same logic attackers use when prioritizing cheap guesses.'
                ],
                insight: this.mission.knowledgeSummary?.insight || ''
            });
        }
        this.audio.playSuccess();
        this.gameScreen.ui.flashScreen('rgba(0,255,65,0.2)', 300);
        this.gameScreen.ui.showNotification(this.mission.successFeedback || 'Good prediction.', 'success');
        setTimeout(() => this.gameScreen.completePuzzle(true), 1200);
    }

    onPredictionChoiceFailure(message) {
        if (this.isComplete) return;
        this.isComplete = true;
        this.stopPredictionTimer();
        const feedback = document.getElementById('guess-feedback');
        if (feedback) {
            feedback.innerHTML += this.renderMissionDebrief({
                tone: 'error',
                title: 'Benchmark prediction missed',
                summary: message || 'The weaker password broke first.',
                details: [
                    'Short predictable patterns are prioritized first by cracking tools.',
                    'Symbols help less than players expect when the base word is common.'
                ],
                insight: this.mission.knowledgeSummary?.insight || ''
            });
        }
        this.audio.playFailure();
        this.gameScreen.ui.flashScreen('rgba(255,0,110,0.2)', 300);
        this.gameScreen.ui.showNotification(message || 'Incorrect prediction.', 'error');
        setTimeout(() => this.gameScreen.completePuzzle(false), 1200);
    }

    renderInvestigationStyles() {
        return `<style>
            .lab-shared-content > .password-puzzle.investigation-shell{flex:1 1 auto;min-height:0!important;width:100%;overflow:hidden!important}
            .password-puzzle.investigation-shell{display:flex;flex:1 1 auto;min-height:100%!important;width:100%;background:transparent!important;color:rgba(232,244,255,.86);overflow:hidden!important}
            .password-puzzle.investigation-shell .investigation-body{display:grid;grid-template-columns:minmax(0,1fr) 360px;flex:1;min-width:0;min-height:0;overflow:hidden}
            .password-puzzle.investigation-shell .investigation-arena{display:flex;flex-direction:column;min-width:0;min-height:0;border-right:1px solid rgba(23,216,255,.16)}
            .password-puzzle.investigation-shell .investigation-arena-header{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;padding:16px 24px 12px;border-bottom:1px solid rgba(23,216,255,.16);background:rgba(0,4,14,.58);flex-shrink:0}
            .password-puzzle.investigation-shell .investigation-arena-title{font-family:'Bebas Neue',sans-serif;font-size:clamp(48px,4.2vw,68px);letter-spacing:3px;line-height:.88;color:rgba(255,255,255,.92);text-transform:uppercase}
            .password-puzzle.investigation-shell .investigation-arena-title span{color:#ff3f78;text-shadow:0 0 18px rgba(255,63,120,.28)}
            .password-puzzle.investigation-shell .investigation-arena-sub{margin-top:4px;font-size:10px;letter-spacing:1px;color:rgba(168,216,232,.48);text-transform:uppercase}
            .password-puzzle.investigation-shell .investigation-arena-hint{max-width:320px;text-align:right;font-size:10px;letter-spacing:1px;line-height:1.6;color:rgba(168,216,232,.48)}
            .password-puzzle.investigation-shell .investigation-arena-hint b{color:#17d8ff;font-weight:700}
            .password-puzzle.investigation-shell .investigation-arena-scroll{flex:1;min-height:0;overflow-y:auto;overflow-x:hidden;padding:16px 24px 20px;scrollbar-width:thin;scrollbar-color:rgba(23,216,255,.28) transparent}
            .password-puzzle.investigation-shell .investigation-arena-scroll::-webkit-scrollbar,.password-puzzle.investigation-shell .investigation-console-panel--fill::-webkit-scrollbar{width:4px}
            .password-puzzle.investigation-shell .investigation-arena-scroll::-webkit-scrollbar-thumb,.password-puzzle.investigation-shell .investigation-console-panel--fill::-webkit-scrollbar-thumb{background:rgba(23,216,255,.28);border-radius:999px}
            .password-puzzle.investigation-shell .investigation-stage-board{display:grid;gap:16px}
            .password-puzzle.investigation-shell .investigation-case-strip{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
            .password-puzzle.investigation-shell .investigation-strip-card{padding:12px 14px;border:1px solid rgba(23,216,255,.12);background:rgba(23,216,255,.04)}
            .password-puzzle.investigation-shell .investigation-strip-card span{display:block;color:rgba(168,216,232,.32);font-size:8px;letter-spacing:2px;text-transform:uppercase}
            .password-puzzle.investigation-shell .investigation-strip-card strong{display:block;margin-top:6px;color:#17d8ff;font-family:'Bebas Neue',sans-serif;font-size:28px;letter-spacing:2px;line-height:1}
            .password-puzzle.investigation-shell .investigation-strip-card strong.tone-alert{color:#ffcc00}
            .password-puzzle.investigation-shell .investigation-strip-card strong.tone-safe{color:#00ff88}
            .password-puzzle.investigation-shell .investigation-panel,
            .password-puzzle.investigation-shell .investigation-question-panel,
            .password-puzzle.investigation-shell .investigation-feedback-wrap,
            .password-puzzle.investigation-shell .investigation-selected-entry{border:1px solid rgba(23,216,255,.12);background:rgba(2,10,24,.76)!important;box-shadow:0 18px 40px rgba(0,0,0,.22)!important;backdrop-filter:blur(12px)}
            .password-puzzle.investigation-shell .investigation-panel__header,
            .password-puzzle.investigation-shell .investigation-question-panel__header{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}
            .password-puzzle.investigation-shell .investigation-panel__header strong,
            .password-puzzle.investigation-shell .investigation-question-panel__eyebrow{font-family:'Share Tech Mono',monospace;font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:rgba(23,216,255,.72)}
            .password-puzzle.investigation-shell .investigation-phase-chip,
            .password-puzzle.investigation-shell .investigation-side-chip{padding:4px 9px;border:1px solid rgba(255,63,120,.22);background:rgba(255,63,120,.08);color:#ffd9e5;font-family:'Share Tech Mono',monospace;font-size:9px;letter-spacing:.16em;text-transform:uppercase}
            .password-puzzle.investigation-shell .investigation-panel{padding:16px}
            .password-puzzle.investigation-shell .investigation-panel--logs{display:grid;gap:14px;overflow:visible!important}
            .password-puzzle.investigation-shell .investigation-board-summary{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
            .password-puzzle.investigation-shell .investigation-board-stat,
            .password-puzzle.investigation-shell .investigation-question-stat{padding:12px;border:1px solid rgba(23,216,255,.12);background:rgba(23,216,255,.04)}
            .password-puzzle.investigation-shell .investigation-board-stat span,
            .password-puzzle.investigation-shell .investigation-question-stat span{display:block;color:rgba(168,216,232,.32);font-size:8px;letter-spacing:2px;text-transform:uppercase}
            .password-puzzle.investigation-shell .investigation-board-stat strong,
            .password-puzzle.investigation-shell .investigation-question-stat strong{display:block;margin-top:6px;color:rgba(255,255,255,.94);font-family:'Bebas Neue',sans-serif;font-size:30px;letter-spacing:2px;line-height:1}
            .password-puzzle.investigation-shell .investigation-log-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
            .password-puzzle.investigation-shell .investigation-log-entry{display:flex;flex-direction:column;gap:0;padding:0;border:1px solid rgba(23,216,255,.12);background:rgba(23,216,255,.03);cursor:pointer;overflow:hidden;transition:border-color .2s ease,box-shadow .2s ease}
            .password-puzzle.investigation-shell .investigation-log-entry:hover,
            .password-puzzle.investigation-shell .investigation-log-entry.is-selected{border-color:#17d8ff;box-shadow:-4px 0 0 rgba(23,216,255,.42),0 0 28px rgba(23,216,255,.08)}
            .password-puzzle.investigation-shell .investigation-log-entry__accent{height:2px;background:rgba(23,216,255,.18)}
            .password-puzzle.investigation-shell .investigation-log-entry__accent.investigation-log-entry__status--critical{background:#ff3f78;box-shadow:0 0 14px rgba(255,63,120,.32)}
            .password-puzzle.investigation-shell .investigation-log-entry__accent.investigation-log-entry__status--warning{background:#ffcc00;box-shadow:0 0 14px rgba(255,204,0,.24)}
            .password-puzzle.investigation-shell .investigation-log-entry__accent.investigation-log-entry__status--safe{background:#17d8ff;box-shadow:0 0 14px rgba(23,216,255,.26)}
            .password-puzzle.investigation-shell .investigation-log-entry__body{display:flex;flex-direction:column;gap:0;padding:16px;min-height:100%}
            .password-puzzle.investigation-shell .investigation-log-entry__meta{display:flex;justify-content:space-between;gap:12px;color:rgba(168,216,232,.36);font-family:'Share Tech Mono',monospace;font-size:9px;letter-spacing:.16em;text-transform:uppercase}
            .password-puzzle.investigation-shell .investigation-log-entry__title{margin-top:8px;color:rgba(255,255,255,.94);font-family:'Teko',sans-serif;font-size:28px;letter-spacing:1px;line-height:1.05}
            .password-puzzle.investigation-shell .investigation-log-entry__subtitle{margin-top:4px;color:rgba(168,216,232,.64);line-height:1.55}
            .password-puzzle.investigation-shell .investigation-log-entry__actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:auto;padding-top:12px}
            .password-puzzle.investigation-shell .investigation-action-btn,
            .password-puzzle.investigation-shell .investigation-question-panel .btn{display:inline-flex;align-items:center;justify-content:center;min-height:40px;padding:10px 14px;border:1px solid rgba(23,216,255,.24)!important;background:rgba(23,216,255,.06)!important;color:rgba(232,244,255,.82)!important;font-family:'Share Tech Mono',monospace!important;font-size:10px;letter-spacing:.18em;text-transform:uppercase;cursor:pointer}
            .password-puzzle.investigation-shell .investigation-action-btn.is-flagged{border-color:#ff3f78!important;background:rgba(255,63,120,.1)!important;color:#ffdce8!important}
            .password-puzzle.investigation-shell .investigation-question-panel{display:grid;gap:14px;padding:16px}
            .password-puzzle.investigation-shell .investigation-panel--logs .investigation-question-panel{padding:0;background:transparent!important;border:0!important;box-shadow:none!important;backdrop-filter:none!important}
            .password-puzzle.investigation-shell .investigation-panel--logs .investigation-question-panel + .investigation-question-panel{padding-top:14px;border-top:1px solid rgba(23,216,255,.08)!important}
            .password-puzzle.investigation-shell .investigation-question-panel__title{color:rgba(255,255,255,.94);font-family:'Teko',sans-serif;font-size:34px;letter-spacing:1px;line-height:1.05}
            .password-puzzle.investigation-shell .investigation-question-panel__sub{color:rgba(168,216,232,.58);line-height:1.7}
            .password-puzzle.investigation-shell .investigation-question-panel__meta{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
            .password-puzzle.investigation-shell .investigation-choice-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
            .password-puzzle.investigation-shell .investigation-choice-card{position:relative;display:flex;flex-direction:column;gap:0;padding:0;border:1px solid rgba(23,216,255,.12);background:rgba(23,216,255,.03);cursor:pointer;overflow:hidden;transition:border-color .2s ease,box-shadow .2s ease}
            .password-puzzle.investigation-shell .investigation-choice-card:hover,
            .password-puzzle.investigation-shell .investigation-choice-card.is-selected{border-color:#17d8ff;box-shadow:0 0 0 1px rgba(23,216,255,.16) inset,0 0 24px rgba(23,216,255,.08)}
            .password-puzzle.investigation-shell .investigation-choice-card input{position:absolute;opacity:0;pointer-events:none}
            .password-puzzle.investigation-shell .investigation-choice-card__accent{height:2px;background:rgba(23,216,255,.22)}
            .password-puzzle.investigation-shell .investigation-choice-card.is-selected .investigation-choice-card__accent{background:#17d8ff;box-shadow:0 0 10px rgba(23,216,255,.32)}
            .password-puzzle.investigation-shell .investigation-choice-card__copy{display:flex;flex-direction:column;gap:0;padding:16px;min-height:100%}
            .password-puzzle.investigation-shell .investigation-choice-card__marker{display:inline-flex;align-items:center;justify-content:center;min-width:74px;padding:6px 10px;border:1px solid rgba(23,216,255,.18);border-radius:999px;background:rgba(23,216,255,.06);color:#17d8ff;font-family:'Share Tech Mono',monospace;font-size:8px;letter-spacing:.16em;line-height:1;text-transform:uppercase;white-space:nowrap}
            .password-puzzle.investigation-shell .investigation-choice-card__top{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap}
            .password-puzzle.investigation-shell .investigation-choice-card__heading{display:flex;flex-direction:column;gap:4px;min-width:0}
            .password-puzzle.investigation-shell .investigation-choice-card__label{color:rgba(168,216,232,.38);font-family:'Share Tech Mono',monospace;font-size:9px;letter-spacing:.16em;text-transform:uppercase}
            .password-puzzle.investigation-shell .investigation-choice-card__title{color:rgba(255,255,255,.94);font-family:'Teko',sans-serif;font-size:28px;letter-spacing:1px;line-height:1.05;word-break:break-word}
            .password-puzzle.investigation-shell .investigation-choice-card__tag{padding:5px 9px;border:1px solid rgba(23,216,255,.18);border-radius:999px;background:rgba(23,216,255,.06);color:rgba(232,244,255,.8);font-family:'Share Tech Mono',monospace;font-size:8px;letter-spacing:.16em;text-transform:uppercase;white-space:nowrap}
            .password-puzzle.investigation-shell .investigation-choice-card__desc{display:block;margin-top:10px;color:rgba(168,216,232,.64);line-height:1.65;word-break:break-word}
            .password-puzzle.investigation-shell .investigation-question-panel__footer{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;padding-top:2px;border-top:1px solid rgba(23,216,255,.08)}
            .password-puzzle.investigation-shell .investigation-question-panel__hint{color:rgba(168,216,232,.42);font-family:'Share Tech Mono',monospace;font-size:9px;letter-spacing:.16em;text-transform:uppercase}
            .password-puzzle.investigation-shell .investigation-feedback-wrap{display:grid;gap:12px;padding:16px}
            .password-puzzle.investigation-shell .investigation-feedback-wrap .guess-feedback{margin:0;min-height:124px;padding:14px;border:1px solid rgba(23,216,255,.1);background:rgba(2,10,24,.86);color:rgba(232,244,255,.86);line-height:1.7}
            .password-puzzle.investigation-shell .investigation-attempt-counter{margin:0;color:rgba(168,216,232,.44);font-family:'Share Tech Mono',monospace;font-size:10px;letter-spacing:.16em;text-transform:uppercase}
            .password-puzzle.investigation-shell .investigation-console{display:flex;flex-direction:column;gap:0;min-width:0;min-height:0;overflow:hidden;background:rgba(0,3,12,.97)}
            .password-puzzle.investigation-shell .investigation-console-panel{padding:18px 20px;border-bottom:1px solid rgba(23,216,255,.16);background:rgba(0,3,12,.94);flex-shrink:0}
            .password-puzzle.investigation-shell .investigation-console-panel--fill{display:flex;flex-direction:column;gap:14px;flex:1;min-height:0;overflow-y:auto}
            .password-puzzle.investigation-shell .investigation-console-title{display:flex;align-items:center;gap:8px;margin-bottom:12px;color:rgba(168,216,232,.24);font-family:'Share Tech Mono',monospace;font-size:9px;letter-spacing:.18em;text-transform:uppercase}
            .password-puzzle.investigation-shell .investigation-console-title::before{content:'//';color:#17d8ff;font-size:11px}
            .password-puzzle.investigation-shell .investigation-console-chip{padding:5px 9px;border:1px solid rgba(255,63,120,.22);background:rgba(255,63,120,.08);color:#ffdce8;font-family:'Share Tech Mono',monospace;font-size:9px;letter-spacing:.16em;text-transform:uppercase}
            .password-puzzle.investigation-shell .investigation-console-head{display:flex;justify-content:space-between;align-items:center;gap:12px}
            .password-puzzle.investigation-shell .investigation-brief-box{line-height:1.8;color:rgba(232,244,255,.86)}
            .password-puzzle.investigation-shell .investigation-brief-box strong{color:#ffcc00}
            .password-puzzle.investigation-shell .investigation-objective-list{display:grid;gap:8px;margin-top:14px}
            .password-puzzle.investigation-shell .investigation-objective{display:flex;gap:10px;align-items:flex-start;padding:10px 12px;border:1px solid rgba(23,216,255,.12);background:rgba(23,216,255,.04)}
            .password-puzzle.investigation-shell .investigation-objective__icon{width:18px;height:18px;display:flex;align-items:center;justify-content:center;border:1px solid rgba(23,216,255,.18);color:rgba(168,216,232,.38);flex-shrink:0}
            .password-puzzle.investigation-shell .investigation-objective.on .investigation-objective__icon{border-color:#17d8ff;color:#17d8ff;background:rgba(23,216,255,.08)}
            .password-puzzle.investigation-shell .investigation-objective__text{line-height:1.6;color:rgba(232,244,255,.86)}
            .password-puzzle.investigation-shell .investigation-console-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
            .password-puzzle.investigation-shell .investigation-console-stat{padding:12px;border:1px solid rgba(23,216,255,.12);background:rgba(23,216,255,.04)}
            .password-puzzle.investigation-shell .investigation-console-stat span{display:block;color:rgba(168,216,232,.32);font-size:8px;letter-spacing:2px;text-transform:uppercase}
            .password-puzzle.investigation-shell .investigation-console-stat strong{display:block;margin-top:6px;color:#17d8ff;font-family:'Bebas Neue',sans-serif;font-size:28px;letter-spacing:2px;line-height:1}
            .password-puzzle.investigation-shell .investigation-profile__name{color:rgba(255,255,255,.94);font-family:'Teko',sans-serif;font-size:34px;letter-spacing:1px;line-height:1}
            .password-puzzle.investigation-shell .investigation-profile__role{margin-top:4px;color:rgba(168,216,232,.56);line-height:1.6}
            .password-puzzle.investigation-shell .investigation-mini-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:14px}
            .password-puzzle.investigation-shell .investigation-mini-card{padding:12px;border:1px solid rgba(23,216,255,.12);background:rgba(23,216,255,.04)}
            .password-puzzle.investigation-shell .investigation-mini-card__label{display:block;color:rgba(168,216,232,.32);font-family:'Share Tech Mono',monospace;font-size:8px;letter-spacing:2px;text-transform:uppercase}
            .password-puzzle.investigation-shell .investigation-mini-card__value{display:block;margin-top:6px;color:rgba(255,255,255,.9);font-size:1rem;line-height:1.5;word-break:break-word}
            .password-puzzle.investigation-shell .investigation-policy{display:grid;gap:10px}
            .password-puzzle.investigation-shell .investigation-policy-row{display:flex;justify-content:space-between;gap:12px;padding:12px;border:1px solid rgba(23,216,255,.12);background:rgba(23,216,255,.04);align-items:center}
            .password-puzzle.investigation-shell .investigation-policy-row span{color:rgba(232,244,255,.82);line-height:1.5}
            .password-puzzle.investigation-shell .investigation-policy-row strong{font-family:'Share Tech Mono',monospace;font-size:10px;letter-spacing:.16em;text-transform:uppercase}
            .password-puzzle.investigation-shell .investigation-selected-panel{display:flex;flex-direction:column;min-height:0}
            .password-puzzle.investigation-shell .investigation-selected-entry{display:grid;gap:10px;min-height:0;padding:16px}
            .password-puzzle.investigation-shell .investigation-selected-entry__empty{color:rgba(168,216,232,.44);line-height:1.7}
            .password-puzzle.investigation-shell .investigation-selected-entry__meta{color:rgba(168,216,232,.36);font-family:'Share Tech Mono',monospace;font-size:9px;letter-spacing:.16em;text-transform:uppercase}
            .password-puzzle.investigation-shell .investigation-selected-entry__title{color:rgba(255,255,255,.94);font-family:'Teko',sans-serif;font-size:30px;letter-spacing:1px;line-height:1.05}
            .password-puzzle.investigation-shell .investigation-selected-entry__subtitle{color:rgba(168,216,232,.6);line-height:1.6}
            .password-puzzle.investigation-shell .investigation-selected-entry__body{color:rgba(232,244,255,.86);line-height:1.75}
            .password-puzzle.investigation-shell .investigation-selected-entry__flag{padding:10px 12px;border-left:2px solid rgba(23,216,255,.38);background:rgba(23,216,255,.05);color:rgba(232,244,255,.82);line-height:1.6}
            .password-puzzle.investigation-shell .investigation-selected-entry__flag.is-flagged{border-left-color:#ff3f78;background:rgba(255,63,120,.08);color:#ffdce8}
            @media (max-width:1280px){
                .password-puzzle.investigation-shell .investigation-body{grid-template-columns:minmax(0,1fr) 340px}
                .password-puzzle.investigation-shell .investigation-arena-title{font-size:clamp(42px,3.8vw,60px)}
            }
            @media (max-width:1080px){
                .password-puzzle.investigation-shell{overflow:auto!important}
                .password-puzzle.investigation-shell .investigation-body{grid-template-columns:1fr;height:auto;overflow:visible}
                .password-puzzle.investigation-shell .investigation-arena{border-right:0;border-bottom:1px solid rgba(23,216,255,.16)}
                .password-puzzle.investigation-shell .investigation-console{overflow:visible}
                .password-puzzle.investigation-shell .investigation-console-panel--fill{overflow:visible}
            }
            @media (max-width:760px){
                .password-puzzle.investigation-shell .investigation-arena-header,
                .password-puzzle.investigation-shell .investigation-arena-scroll,
                .password-puzzle.investigation-shell .investigation-console-panel{padding-left:16px;padding-right:16px}
                .password-puzzle.investigation-shell .investigation-arena-header{flex-direction:column;align-items:flex-start}
                .password-puzzle.investigation-shell .investigation-arena-hint{text-align:left;max-width:none}
                .password-puzzle.investigation-shell .investigation-case-strip,
                .password-puzzle.investigation-shell .investigation-board-summary,
                .password-puzzle.investigation-shell .investigation-log-list,
                .password-puzzle.investigation-shell .investigation-question-panel__meta,
                .password-puzzle.investigation-shell .investigation-console-stats,
                .password-puzzle.investigation-shell .investigation-mini-grid,
                .password-puzzle.investigation-shell .investigation-choice-list{grid-template-columns:1fr}
                .password-puzzle.investigation-shell .investigation-question-panel__footer{flex-direction:column;align-items:stretch}
                .password-puzzle.investigation-shell .investigation-question-panel .btn{width:100%}
                .password-puzzle.investigation-shell .investigation-log-entry__meta,
                .password-puzzle.investigation-shell .investigation-choice-card__top{flex-direction:column;align-items:flex-start}
            }
        </style>`;
    }

    // ─── Investigation (Level 4) ──────────────────────────────────────────────

    renderInvestigationPuzzle(container) {
        const logs = this.getInvestigationLogEntries();
        const profile = this.puzzleData.profileData || {};
        const policy = this.puzzleData.systemPolicy || {};
        const causeChoices = Array.isArray(this.puzzleData.choices) ? this.puzzleData.choices : [];
        const followUp = this.puzzleData.followUpDefenseQuestion || null;
        const defenseOptions = Array.isArray(followUp?.options) ? followUp.options : [];
        const flaggedCount = this.investigationFlaggedEvents.size;
        const attemptsLeft = Math.max(0, this.maxAttempts - this.attempts);
        const flagQuality = this.getInvestigationFlagQuality(logs);
        const phaseLabel = this.investigationStage === 'defense' ? 'PHASE 2: CONTAINMENT' : 'PHASE 1: REVIEW LOGS';
        const leadHint = this.investigationStage === 'defense'
            ? 'Contain the confirmed breach path before the attacker re-establishes access.'
            : 'Inspect the access trail, flag the strongest signals, and reconstruct the initial breach path.';
        const selectedCauseChoice = causeChoices.find(choice => choice.id === this.investigationSelectedCause) || null;
        const confirmedCauseChoice = causeChoices.find(choice => choice.id === this.puzzleData.correctAnswer) || null;
        const selectedDefenseChoice = defenseOptions.find(option => option.id === this.investigationSelectedDefense) || null;
        const renderInvestigationChoiceCard = (item, idx, groupName, selectedId, fallbackDesc) => `
            <label class="investigation-choice-card ${selectedId === item.id ? 'is-selected' : ''}">
                <input type="radio" name="${groupName}" value="${item.id}" ${selectedId === item.id ? 'checked' : ''}/>
                <div class="investigation-choice-card__accent"></div>
                <div class="investigation-choice-card__copy">
                    <div class="investigation-choice-card__top">
                        <div class="investigation-choice-card__heading">
                            <span class="investigation-choice-card__title">${item.label}</span>
                        </div>
                        <span class="investigation-choice-card__tag">${groupName === 'investigation-cause' ? 'ATTACK' : 'CONTROL'}</span>
                    </div>
                    <span class="investigation-choice-card__desc">${item.description || item.explanation || item.summary || fallbackDesc}</span>
                </div>
            </label>`;
        const causeMarkup = causeChoices.map((choice, idx) =>
            renderInvestigationChoiceCard(
                choice,
                idx,
                'investigation-cause',
                this.investigationSelectedCause,
                'Review the evidence trail and choose the attack path that best fits the observed sequence.'
            )
        ).join('');
        const defenseMarkup = followUp ? defenseOptions.map((option, idx) =>
            renderInvestigationChoiceCard(
                option,
                idx,
                'investigation-defense',
                this.investigationSelectedDefense,
                'Choose the control that most directly disrupts the attack pattern visible in the logs.'
            )
        ).join('') : '';
        const profileCards = this.getInvestigationProfileFields(profile).map(field => `
            <div class="investigation-mini-card">
                <span class="investigation-mini-card__label">${field.label}</span>
                <span class="investigation-mini-card__value">${field.value}</span>
            </div>`).join('');
        const policyRows = this.getInvestigationPolicyRows(policy).map(row => `
            <div class="investigation-policy-row">
                <span>${row.label}</span>
                <strong class="${row.className}">${row.value}</strong>
            </div>`).join('');
        const briefingObjectives = (Array.isArray(this.mission.objectives) && this.mission.objectives.length)
            ? this.mission.objectives
            : [
                'Flag the strongest breach indicators in the access trail.',
                'Identify the attack path that best fits the observed login pattern.',
                'Choose the control that shuts down repeat access.'
            ];
        const objectivesMarkup = briefingObjectives.map((objective, index) => {
            const isOn = this.investigationStage === 'defense' ? index < 2 : index === 0;
            return `
                <div class="investigation-objective ${isOn ? 'on' : ''}">
                    <div class="investigation-objective__icon">${isOn ? '▸' : ''}</div>
                    <div class="investigation-objective__text">${objective}</div>
                </div>`;
        }).join('');
        const logMarkup = logs.map(log => `
            <article class="investigation-log-entry ${this.investigationSelectedEntryId === log.id ? 'is-selected' : ''}"
                     data-investigation-entry="${log.id}">
                <div class="investigation-log-entry__accent investigation-log-entry__status--${log.statusTone}"></div>
                <div class="investigation-log-entry__body">
                    <div class="investigation-log-entry__meta">
                        <span>${log.timestamp}</span>
                        <span>${log.code}</span>
                    </div>
                    <div class="investigation-log-entry__title">${log.title}</div>
                    <div class="investigation-log-entry__subtitle">${log.subtitle}</div>
                    <div class="investigation-log-entry__actions">
                        <button class="investigation-action-btn ${this.investigationFlaggedEvents.has(log.id) ? 'is-flagged' : ''}"
                                type="button"
                                data-investigation-action="flag"
                                data-entry-id="${log.id}">
                            ${this.investigationFlaggedEvents.has(log.id) ? 'FLAGGED' : 'FLAG'}
                        </button>
                        <button class="investigation-action-btn"
                                type="button"
                                data-investigation-action="inspect"
                                data-entry-id="${log.id}">
                            INSPECT
                        </button>
                    </div>
                </div>
            </article>`).join('');

        container.innerHTML = `
            ${this.renderSharedPasswordLabThemeStyles()}
            ${this.renderInvestigationStyles()}
            ${this.renderSharedPasswordLabFrame({
                levelLabel: '// LEVEL 04 - FORENSIC REVIEW',
                title: 'BREACH<br>INVESTIGATION',
                status: this.investigationStage === 'defense' ? 'CONTAINMENT WINDOW ACTIVE' : 'FORENSIC REVIEW ACTIVE',
                phases: [
                    { label: 'TRACE EVENTS', active: this.investigationStage !== 'defense' },
                    { label: 'IDENTIFY ATTACK', active: this.investigationStage === 'defense' },
                    { label: 'SELECT DEFENSE', active: this.investigationStage === 'defense' }
                ],
                content: `
                    <div class="password-puzzle investigation-shell">
                        <div class="investigation-body">
                            <section class="investigation-arena">
                                <div class="investigation-arena-header">
                                    <div>
                                        <div class="investigation-arena-title">TRACE<br>THE<br><span>BREACH</span></div>
                                        <div class="investigation-arena-sub">// CASE VAULT-04 · reconstruct the vault access path before the attacker returns</div>
                                    </div>
                                    <div class="investigation-arena-hint">
                                        Inspect the <b>access log</b>, flag the strongest indicators, then lock the correct <b>attack path</b> and <b>containment control</b>.
                                    </div>
                                </div>

                                <div class="investigation-arena-scroll">
                                    <div class="investigation-stage-board">
                                        <div class="investigation-case-strip">
                                            <div class="investigation-strip-card">
                                                <span>Case ID</span>
                                                <strong>VAULT-04</strong>
                                            </div>
                                            <div class="investigation-strip-card">
                                                <span>Analyst Flags</span>
                                                <strong id="investigation-flag-count">${this.investigationFlaggedEvents.size}/${this.investigationFlagLimit}</strong>
                                            </div>
                                            <div class="investigation-strip-card">
                                                <span>Integrity</span>
                                                <strong class="tone-safe" id="investigation-integrity">${this.getInvestigationIntegrity()}%</strong>
                                            </div>
                                            <div class="investigation-strip-card">
                                                <span>Phase</span>
                                                <strong class="tone-alert" id="investigation-phase-short">${this.investigationStage === 'defense' ? 'P2' : 'P1'}</strong>
                                            </div>
                                        </div>

                                        <div class="investigation-panel investigation-panel--logs">
                                            <div class="investigation-panel__header">
                                                <strong>ACCESS LOG - VAULT SYSTEM</strong>
                                                <span class="investigation-phase-chip">${phaseLabel}</span>
                                            </div>
                                            <div class="investigation-board-summary">
                                                <div class="investigation-board-stat">
                                                    <span>Events</span>
                                                    <strong>${logs.length}</strong>
                                                </div>
                                                <div class="investigation-board-stat">
                                                    <span>Flagged</span>
                                                    <strong id="investigation-board-flagged">${flaggedCount}</strong>
                                                </div>
                                                <div class="investigation-board-stat">
                                                    <span>Selected</span>
                                                    <strong id="investigation-board-selected">${this.investigationSelectedEntryId || 'NONE'}</strong>
                                                </div>
                                                <div class="investigation-board-stat">
                                                    <span>Critical</span>
                                                    <strong>${flagQuality.criticalFlags}</strong>
                                                </div>
                                            </div>
                                            <div class="investigation-log-list">${logMarkup}</div>
                                            <section class="investigation-question-panel" id="investigation-cause-block" ${this.investigationStage === 'defense' ? 'style="display:none;"' : ''}>
                                                <div class="investigation-question-panel__header">
                                                    <div class="investigation-question-panel__eyebrow">Cause Analysis</div>
                                                    <span class="investigation-phase-chip">SELECT ATTACK</span>
                                                </div>
                                                <div class="investigation-question-panel__title">What attack unlocked unauthorized access?</div>
                                                <div class="investigation-question-panel__sub">Use the flagged evidence, login cadence, and policy gaps to identify the breach pattern that best fits the sequence.</div>
                                                <div class="investigation-question-panel__meta">
                                                    <div class="investigation-question-stat">
                                                        <span>Candidates</span>
                                                        <strong>${causeChoices.length}</strong>
                                                    </div>
                                                    <div class="investigation-question-stat">
                                                        <span>Critical Flags</span>
                                                        <strong>${flagQuality.criticalFlags}</strong>
                                                    </div>
                                                    <div class="investigation-question-stat">
                                                        <span>Selected</span>
                                                        <strong id="investigation-cause-selected">${selectedCauseChoice ? selectedCauseChoice.label : 'None yet'}</strong>
                                                    </div>
                                                </div>
                                                <div class="investigation-choice-list">${causeMarkup}</div>
                                                <div class="investigation-question-panel__footer">
                                                    <button class="btn btn-primary" type="button" id="submit-investigation-cause">SUBMIT ANALYSIS</button>
                                                    <div class="investigation-question-panel__hint" id="investigation-submit-hint">Flag suspicious entries first</div>
                                                </div>
                                            </section>

                                            <section class="investigation-question-panel" id="investigation-defense-block" ${this.investigationStage === 'defense' ? '' : 'style="display:none;"'}>
                                                ${followUp ? `
                                                    <div class="investigation-question-panel__header">
                                                        <div class="investigation-question-panel__eyebrow">Containment Response</div>
                                                        <span class="investigation-phase-chip">SELECT DEFENSE</span>
                                                    </div>
                                                    <div class="investigation-question-panel__title">${followUp.prompt}</div>
                                                    <div class="investigation-question-panel__sub">Choose the control that most directly breaks the repeated guessing or credential reuse path you just confirmed.</div>
                                                    <div class="investigation-question-panel__meta">
                                                        <div class="investigation-question-stat">
                                                            <span>Controls</span>
                                                            <strong>${defenseOptions.length}</strong>
                                                        </div>
                                                        <div class="investigation-question-stat">
                                                            <span>Confirmed Cause</span>
                                                            <strong>${confirmedCauseChoice ? confirmedCauseChoice.label : 'Complete phase one'}</strong>
                                                        </div>
                                                        <div class="investigation-question-stat">
                                                            <span>Selected</span>
                                                            <strong id="investigation-defense-selected">${selectedDefenseChoice ? selectedDefenseChoice.label : 'None yet'}</strong>
                                                        </div>
                                                    </div>
                                                    <div class="investigation-choice-list">${defenseMarkup}</div>
                                                    <div class="investigation-question-panel__footer">
                                                        <button class="btn btn-primary" type="button" id="submit-investigation-defense">SUBMIT DEFENSE</button>
                                                        <div class="investigation-question-panel__hint">Choose the control that blocks repeated guessing or credential reuse.</div>
                                                    </div>` : ''}
                                            </section>
                                        </div>

                                        <div class="investigation-feedback-wrap">
                                            <div class="guess-feedback investigation-feedback" id="guess-feedback">
                                                Review the evidence trail, inspect suspicious entries, and connect the login pattern to the most likely attack path.
                                            </div>
                                            <div id="attempt-counter" class="investigation-attempt-counter">
                                                Decisions: <span style="color:var(--cyber-blue);">${this.attempts}</span> / ${this.maxAttempts}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <aside class="investigation-console">
                                <section class="investigation-console-panel">
                                    <div class="investigation-console-title">Mission Brief</div>
                                    <div class="investigation-brief-box">
                                        <div><strong>Objective:</strong> ${this.mission.objective || 'Reconstruct how the vault breach happened and identify the right defensive response.'}</div>
                                        <div><strong>Scenario:</strong> ${this.mission.scenario || leadHint}</div>
                                        <div><strong>Task:</strong> Flag the strongest clues, select the correct cause, then choose the best containment control.</div>
                                    </div>
                                    <div class="investigation-objective-list">${objectivesMarkup}</div>
                                </section>

                                <section class="investigation-console-panel">
                                    <div class="investigation-console-head">
                                        <div class="investigation-console-title">Analyst Telemetry</div>
                                        <div class="investigation-console-chip" id="investigation-console-mode">${this.investigationStage === 'defense' ? 'CONTAINMENT LIVE' : 'FORENSIC REVIEW'}</div>
                                    </div>
                                    <div class="investigation-console-stats">
                                        <div class="investigation-console-stat">
                                            <span>Integrity</span>
                                            <strong id="investigation-integrity-console">${this.getInvestigationIntegrity()}%</strong>
                                        </div>
                                        <div class="investigation-console-stat">
                                            <span>Flags</span>
                                            <strong id="investigation-flag-count-console">${flaggedCount}/${this.investigationFlagLimit}</strong>
                                        </div>
                                        <div class="investigation-console-stat">
                                            <span>Time</span>
                                            <strong>${this.getInvestigationTimeDisplay()}</strong>
                                        </div>
                                    </div>
                                </section>

                                <section class="investigation-console-panel">
                                    <div class="investigation-console-title">Account Profile</div>
                                    <div class="investigation-profile">
                                        <div class="investigation-profile__name">${profile.name || 'Unknown User'}</div>
                                        <div class="investigation-profile__role">${profile.role || 'Role unavailable'}</div>
                                        <div class="investigation-mini-grid">${profileCards}</div>
                                    </div>
                                </section>

                                <section class="investigation-console-panel">
                                    <div class="investigation-console-title">System Policy</div>
                                    <div class="investigation-policy">${policyRows}</div>
                                </section>

                                <section class="investigation-console-panel investigation-console-panel--fill investigation-selected-panel">
                                    <div class="investigation-console-head">
                                        <div class="investigation-console-title">Selected Entry</div>
                                        <span class="investigation-side-chip">${this.investigationSelectedEntryId || 'AWAITING INSPECTION'}</span>
                                    </div>
                                    <div class="investigation-selected-entry" id="investigation-selected-entry"></div>
                                </section>
                            </aside>
                        </div>
                    </div>`
            })}`;
        this.setupInvestigationEventListeners();
        if (!this.investigationSelectedEntryId && logs[0]) this.investigationSelectedEntryId = logs[0].id;
        this.renderSelectedInvestigationEntry();
        this.updateInvestigationDashboard();
        this.startHumanLabMatrixAnimation();
        this.gameScreen.syncEmbeddedMissionHUD();
    }

    setupInvestigationEventListeners() {
        document.querySelectorAll('[data-investigation-entry]').forEach(card => {
            card.addEventListener('click', e => {
                if (e.target.closest('button')) return;
                this.selectInvestigationEntry(card.dataset.investigationEntry);
            });
        });
        document.querySelectorAll('button[data-investigation-action]').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.investigationAction;
                const entryId = btn.dataset.entryId;
                if (!action || !entryId) return;
                if (action === 'inspect') this.selectInvestigationEntry(entryId);
                if (action === 'flag') this.toggleInvestigationFlag(entryId);
                this.audio.playButtonClick();
            });
        });
        document.querySelectorAll('input[name="investigation-cause"]').forEach(r => {
            r.addEventListener('change', () => {
                this.investigationSelectedCause = r.value;
                document.querySelectorAll('.investigation-choice-card input[name="investigation-cause"]').forEach(input => {
                    input.closest('.investigation-choice-card')?.classList.toggle('is-selected', input.checked);
                });
                const selectedLabel = document.getElementById('investigation-cause-selected');
                const selectedOption = (this.puzzleData.choices || []).find(choice => choice.id === r.value);
                if (selectedLabel) selectedLabel.textContent = selectedOption?.label || 'None yet';
                this.audio.playButtonClick();
            });
        });
        document.querySelectorAll('input[name="investigation-defense"]').forEach(r => {
            r.addEventListener('change', () => {
                this.investigationSelectedDefense = r.value;
                document.querySelectorAll('.investigation-choice-card input[name="investigation-defense"]').forEach(input => {
                    input.closest('.investigation-choice-card')?.classList.toggle('is-selected', input.checked);
                });
                const selectedLabel = document.getElementById('investigation-defense-selected');
                const selectedOption = (this.puzzleData.followUpDefenseQuestion?.options || []).find(option => option.id === r.value);
                if (selectedLabel) selectedLabel.textContent = selectedOption?.label || 'None yet';
                this.audio.playButtonClick();
            });
        });
        document.getElementById('submit-investigation-cause')?.addEventListener('click', () => this.submitInvestigationCause());
        document.getElementById('submit-investigation-defense')?.addEventListener('click', () => this.submitInvestigationDefense());
    }

    submitInvestigationCause() {
        if (this.isComplete) return;
        if (this.investigationFlaggedEvents.size === 0) {
            this.gameScreen.ui.showNotification('Flag at least one suspicious log entry before submitting your analysis.', 'warning');
            return;
        }
        const quality = this.getInvestigationFlagQuality(this.getInvestigationLogEntries());
        if (quality.criticalFlags === 0) {
            this.gameScreen.ui.showNotification('You need to flag at least one critical breach indicator before concluding the cause.', 'warning');
            return;
        }
        if (!this.investigationSelectedCause) { this.gameScreen.ui.showNotification('Select a cause first.', 'warning'); return; }
        this.attempts++; this.updateAttemptCounter(); this.gameScreen.updateAttempts(this.attempts);
        const feedback = document.getElementById('guess-feedback');
        if (this.investigationSelectedCause !== this.puzzleData.correctAnswer) {
            if (feedback) feedback.innerHTML = `<div><strong>Not correct yet.</strong></div><div>${this.mission.failureFeedback || 'Review the evidence and try again.'}</div><div style="margin-top:6px;">${this.puzzleData.simpleExplanation || ''}</div>`;
            this.audio.playFailure();
            this.gameScreen.ui.showNotification('Incorrect. Review evidence and try again.', 'error');
            return;
        }
        this.investigationStage = 'defense';
        const reveal = this.puzzleData.revealOnCorrect || {};
        if (feedback) feedback.innerHTML = `<div><strong>Correct cause found:</strong> Dictionary Attack</div><div>${this.puzzleData.simpleExplanation || ''}</div><div style="margin-top:6px;"><strong>Actual password:</strong> ${reveal.actualPassword || 'unknown'}</div><div>${reveal.message || ''}</div>`;
        this.audio.playSuccess();
        this.gameScreen.ui.showNotification('Cause identified. Continue to defense question.', 'success');
        document.getElementById('investigation-cause-block').style.display = 'none';
        document.getElementById('investigation-defense-block').style.display = 'block';
        this.updateInvestigationDashboard();
        if (!this.puzzleData.followUpDefenseQuestion) setTimeout(() => this.gameScreen.completePuzzle(true), 1200);
    }

    submitInvestigationDefense() {
        if (this.isComplete) return;
        const followUp = this.puzzleData.followUpDefenseQuestion;
        if (!followUp) { this.gameScreen.completePuzzle(true); return; }
        if (!this.investigationSelectedDefense) { this.gameScreen.ui.showNotification('Select a defense option first.', 'warning'); return; }
        this.attempts++; this.updateAttemptCounter(); this.gameScreen.updateAttempts(this.attempts);
        const feedback = document.getElementById('guess-feedback');
        if (this.investigationSelectedDefense !== followUp.correctAnswer) {
            if (feedback) feedback.innerHTML = `<div><strong>Not the best defense.</strong></div><div>${followUp.explanation || ''}</div>`;
            this.audio.playFailure();
            this.gameScreen.ui.showNotification('Try again. Think about what blocks repeated guesses.', 'error');
            return;
        }
        this.isComplete = true;
        if (feedback) feedback.innerHTML = `<div><strong>Correct defense:</strong> Add lockout rule</div><div>${followUp.explanation || ''}</div><div style="margin-top:8px;">${this.puzzleData.educationalSummary || ''}</div>`;
        this.audio.playSuccess();
        this.gameScreen.ui.flashScreen('rgba(0,255,65,0.2)', 300);
        this.gameScreen.ui.showNotification(this.mission.successFeedback || 'Investigation complete.', 'success');
        setTimeout(() => this.gameScreen.completePuzzle(true), 1400);
    }

    getInvestigationLogEntries() {
        const rawLogs = Array.isArray(this.puzzleData.evidenceLogs) ? this.puzzleData.evidenceLogs : [];
        return rawLogs.map((entry, index) => {
            const id = String(entry?.id || `L${String(index + 1).padStart(3, '0')}`);
            const rawText = typeof entry === 'string' ? entry : (entry.text || entry.message || entry.summary || '');
            const timestamp = entry?.timestamp || this.extractInvestigationTimestamp(rawText) || `02:14:${String(3 + index * 2).padStart(2, '0')}`;
            const username = entry?.user || this.extractInvestigationUsername(rawText) || 'unknown';
            const source = entry?.source || this.extractInvestigationSource(rawText) || 'remote-endpoint';
            const title = entry?.title || this.extractInvestigationTitle(rawText) || rawText || 'Log event observed';
            const subtitle = entry?.subtitle || `${username} · ${source}`;
            const severity = String(entry?.severity || '').toLowerCase();
            const statusTone = entry?.statusTone || (severity === 'high' || /success|export|vault_access/i.test(rawText) ? 'critical' : /warning|failed|auth_fail/i.test(rawText) ? 'warning' : 'safe');
            return {
                id,
                code: id,
                timestamp,
                title,
                subtitle,
                rawText,
                statusTone,
                details: entry?.details || rawText || 'No additional forensic details available.'
            };
        });
    }

    extractInvestigationTimestamp(text) {
        const match = String(text || '').match(/\b\d{2}:\d{2}:\d{2}\b/);
        return match ? match[0] : '';
    }

    extractInvestigationUsername(text) {
        const match = String(text || '').match(/\bfor\s+([a-z0-9_.-]+)|\buser[:=\s]+([a-z0-9_.-]+)/i);
        return match ? (match[1] || match[2] || '').trim() : '';
    }

    extractInvestigationSource(text) {
        const match = String(text || '').match(/\b(?:ip|source)[:=\s]+([a-z0-9.:_-]+)/i);
        return match ? match[1] : '';
    }

    extractInvestigationTitle(text) {
        const source = String(text || '').trim();
        if (!source) return '';
        const parts = source.split(/[-|]/).map(part => part.trim()).filter(Boolean);
        return parts[0] || source;
    }

    getInvestigationProfileFields(profile) {
        return [
            { label: 'CLEARANCE', value: profile.clearance || profile.accessLevel || 'Level 3' },
            { label: 'DEPT', value: profile.department || profile.dept || 'Finance' },
            { label: 'KNOWN PUBLIC', value: profile.publicInfo || 'None listed' },
            { label: 'BIRTH YEAR', value: profile.birthYear || profile.yearOfBirth || 'Unknown' },
            { label: 'HOMETOWN', value: profile.hometown || profile.location || 'Unknown' },
            { label: 'LAST RESET', value: profile.lastReset || profile.lastPasswordReset || 'Unknown' }
        ];
    }

    getInvestigationPolicyRows(policy) {
        return [
            this.createInvestigationPolicyRow('Rate limiting', policy.rateLimiting),
            this.createInvestigationPolicyRow('Account lockout', policy.accountLockout),
            this.createInvestigationPolicyRow('MFA', policy.mfa || policy.multiFactorAuth),
            this.createInvestigationPolicyRow('Min password length', policy.passwordRule || policy.minimumLength),
            this.createInvestigationPolicyRow('Breach monitoring', policy.breachMonitoring || policy.monitoring)
        ];
    }

    createInvestigationPolicyRow(label, value) {
        const text = value || 'Unknown';
        const negative = /disabled|offline|not enforced|none|8 chars|weak/i.test(text);
        return { label, value: text, className: negative ? 'is-bad' : 'is-good' };
    }

    selectInvestigationEntry(entryId) {
        this.investigationSelectedEntryId = entryId;
        this.renderSelectedInvestigationEntry();
        this.updateInvestigationDashboard();
    }

    toggleInvestigationFlag(entryId) {
        if (this.investigationFlaggedEvents.has(entryId)) this.investigationFlaggedEvents.delete(entryId);
        else if (this.investigationFlaggedEvents.size < this.investigationFlagLimit) this.investigationFlaggedEvents.add(entryId);
        else this.gameScreen.ui.showNotification(`Flag limit reached (${this.investigationFlagLimit}). Review your existing suspicious entries first.`, 'warning');
        this.investigationSelectedEntryId = entryId;
        this.renderSelectedInvestigationEntry();
        this.updateInvestigationDashboard();
    }

    renderSelectedInvestigationEntry() {
        const panel = document.getElementById('investigation-selected-entry');
        if (!panel) return;
        const entry = this.getInvestigationLogEntries().find(item => item.id === this.investigationSelectedEntryId);
        if (!entry) {
            panel.innerHTML = `<div class="investigation-selected-entry__empty">Click a log entry to inspect</div>`;
            return;
        }
        const flagged = this.investigationFlaggedEvents.has(entry.id);
        panel.innerHTML = `
            <div class="investigation-selected-entry__meta">${entry.timestamp} · ${entry.code}</div>
            <div class="investigation-selected-entry__title">${entry.title}</div>
            <div class="investigation-selected-entry__subtitle">${entry.subtitle}</div>
            <div class="investigation-selected-entry__body">${entry.details}</div>
            <div class="investigation-selected-entry__flag ${flagged ? 'is-flagged' : ''}">
                ${flagged ? 'Suspicious entry flagged for analyst review.' : 'Entry inspected. Flag it if you believe it supports the breach path.'}
            </div>`;
    }

    updateInvestigationDashboard() {
        const integrity = document.getElementById('investigation-integrity');
        if (integrity) integrity.textContent = `${this.getInvestigationIntegrity()}%`;
        const integrityConsole = document.getElementById('investigation-integrity-console');
        if (integrityConsole) integrityConsole.textContent = `${this.getInvestigationIntegrity()}%`;
        const flagCount = document.getElementById('investigation-flag-count');
        if (flagCount) flagCount.textContent = `${this.investigationFlaggedEvents.size}/${this.investigationFlagLimit}`;
        const flagCountConsole = document.getElementById('investigation-flag-count-console');
        if (flagCountConsole) flagCountConsole.textContent = `${this.investigationFlaggedEvents.size}/${this.investigationFlagLimit}`;
        const boardFlagged = document.getElementById('investigation-board-flagged');
        if (boardFlagged) boardFlagged.textContent = `${this.investigationFlaggedEvents.size}`;
        const boardSelected = document.getElementById('investigation-board-selected');
        if (boardSelected) boardSelected.textContent = this.investigationSelectedEntryId || 'NONE';
        const phaseShort = document.getElementById('investigation-phase-short');
        if (phaseShort) phaseShort.textContent = this.investigationStage === 'defense' ? 'P2' : 'P1';
        const consoleMode = document.getElementById('investigation-console-mode');
        if (consoleMode) consoleMode.textContent = this.investigationStage === 'defense' ? 'CONTAINMENT LIVE' : 'FORENSIC REVIEW';
        const phases = Array.from(this.visualizerElement?.querySelectorAll('.lab-shared-phase') || []);
        phases.forEach((phase, index) => {
            const isActive = index === 0 ? this.investigationStage !== 'defense' : this.investigationStage === 'defense';
            phase.classList.toggle('active', isActive);
        });
        const submitHint = document.getElementById('investigation-submit-hint');
        if (submitHint) submitHint.textContent = this.investigationFlaggedEvents.size === 0
            ? 'Flag suspicious entries first'
            : `${this.investigationFlaggedEvents.size} suspicious entr${this.investigationFlaggedEvents.size === 1 ? 'y' : 'ies'} flagged`;
        document.querySelectorAll('.investigation-side-chip').forEach(chip => {
            chip.textContent = this.investigationSelectedEntryId || 'AWAITING INSPECTION';
        });
        document.querySelectorAll('[data-investigation-entry]').forEach(card => {
            card.classList.toggle('is-selected', card.dataset.investigationEntry === this.investigationSelectedEntryId);
        });
        document.querySelectorAll('button[data-investigation-action="flag"]').forEach(btn => {
            const flagged = this.investigationFlaggedEvents.has(btn.dataset.entryId);
            btn.classList.toggle('is-flagged', flagged);
            btn.textContent = flagged ? 'FLAGGED' : 'FLAG';
        });
    }

    getInvestigationIntegrity() {
        return Math.max(32, 100 - this.attempts * 18);
    }

    getInvestigationTimeDisplay() {
        const secs = Number(this.puzzleData.timeLimit || 161);
        const minutes = Math.floor(secs / 60);
        const remainder = secs % 60;
        return `${minutes}:${String(remainder).padStart(2, '0')}`;
    }

    // ─── Inspection (Level 5) ─────────────────────────────────────────────────

    renderInspectionStyles() {
        return `<style>
            .password-puzzle.inspection-shell .inspection-grid{grid-template-columns:minmax(0,1fr) minmax(340px,390px)}
            .password-puzzle.inspection-shell .inspection-main{min-width:0}
            .password-puzzle.inspection-shell .inspection-sidebar{display:grid;gap:16px;min-width:0;align-content:start}
            .password-puzzle.inspection-shell .inspection-sidebar .inspection-question-panel,
            .password-puzzle.inspection-shell .inspection-sidebar .inspection-feedback,
            .password-puzzle.inspection-shell .inspection-sidebar .inspection-attempt-counter{margin:0}
            .password-puzzle.inspection-shell .inspection-sidebar .inspection-question-panel__footer{flex-direction:column;align-items:stretch}
            .password-puzzle.inspection-shell .inspection-sidebar .inspection-question-panel .btn{width:100%}
            .password-puzzle.inspection-shell .inspection-sidebar .inspection-decision-list{padding:0 16px 16px;grid-template-columns:1fr}
            .password-puzzle.inspection-shell .inspection-sidebar .inspection-attempt-counter{text-align:left}
            @media (max-width:1180px){
                .password-puzzle.inspection-shell .inspection-grid{grid-template-columns:1fr!important}
            }
        </style>`;
    }

    renderInspectionPuzzle(container) {
        this.visualizerElement = container;
        const systems = Array.isArray(this.puzzleData.systems) ? this.puzzleData.systems : [];
        const choices = Array.isArray(this.puzzleData.choices) ? this.puzzleData.choices : [];
        const followUp = this.puzzleData.followUpDefenseQuestion || null;
        const requiredPerSystem = Math.max(1, Number(this.puzzleData.inspectionRequiredActionsPerSystem || 3));
        const totalRequired = systems.length * requiredPerSystem;
        const inspectedCount = this.inspectionViewedActions.size;
        const progressPct = totalRequired ? Math.min(100, (inspectedCount / totalRequired) * 100) : 0;
        const systemRiskSummary = systems.map(system => ({ system, exposure: this.getInspectionExposureScore(system) }));
        const phaseLabel = this.inspectionStage === 'defense' ? 'PHASE 2 · HARDENING DECISION' : 'PHASE 1 · STORAGE FORENSICS';
        const systemsMarkup = systemRiskSummary.map(({ system, exposure }) => {
            const viewedDb = this.inspectionViewedActions.has(`${system.id}:db`);
            const viewedBreach = this.inspectionViewedActions.has(`${system.id}:breach`);
            const viewedCrack = this.inspectionViewedActions.has(`${system.id}:crack`);
            const viewedCount = [viewedDb, viewedBreach, viewedCrack].filter(Boolean).length;
            const rows = Array.isArray(system.databasePreview) ? system.databasePreview.map(row => `<div class="inspection-evidence-row">${row}</div>`).join('') : '';
            const crackRows = Array.isArray(system.crackAnalysis) ? system.crackAnalysis.map(row => `<div class="inspection-evidence-row">${row}</div>`).join('') : '';
            const noteRows = Array.isArray(system.auditNotes) ? system.auditNotes.map(row => `<div class="inspection-note-row">${row}</div>`).join('') : '';
            return `
                <article class="inspection-card inspection-card--${system.riskTier || 'elevated'}">
                    <div class="inspection-card__top">
                        <div>
                            <div class="inspection-card__label">${system.storageLabel || 'Credential store'}</div>
                            <h3>${system.name}</h3>
                            <p>${system.summary || ''}</p>
                        </div>
                        <div class="inspection-card__meter">
                            <span>Evidence ${viewedCount}/3</span>
                            <div class="inspection-card__meter-bar"><div style="width:${(viewedCount / 3) * 100}%"></div></div>
                        </div>
                    </div>
                    <div class="inspection-card__risk">
                        <span>Exposure Score</span>
                        <strong>${exposure.score}/100</strong>
                        <em>${exposure.label}</em>
                    </div>
                    <div class="inspection-card__actions">
                        <button class="inspection-action-btn ${viewedDb ? 'is-viewed' : ''}" data-action="view-db" data-system-id="${system.id}" type="button">DATABASE SNAPSHOT</button>
                        <button class="inspection-action-btn ${viewedBreach ? 'is-viewed' : ''}" data-action="simulate-breach" data-system-id="${system.id}" type="button">BREACH REPLAY</button>
                        <button class="inspection-action-btn ${viewedCrack ? 'is-viewed' : ''}" data-action="run-crack" data-system-id="${system.id}" type="button">OFFLINE CRACK LAB</button>
                    </div>
                    <div class="inspection-evidence-stack">
                        <section class="inspection-evidence-panel ${viewedDb ? 'is-visible' : ''}" id="db-${system.id}">
                            <div class="inspection-evidence-panel__title">DATABASE SNAPSHOT</div>
                            ${rows || '<div class="inspection-evidence-row">No rows available.</div>'}
                        </section>
                        <section class="inspection-evidence-panel ${viewedBreach ? 'is-visible' : ''}" id="breach-${system.id}">
                            <div class="inspection-evidence-panel__title">BREACH REPLAY</div>
                            <div class="inspection-evidence-row">${system.breachOutcome || ''}</div>
                            ${noteRows ? `<div class="inspection-note-list">${noteRows}</div>` : ''}
                        </section>
                        <section class="inspection-evidence-panel ${viewedCrack ? 'is-visible' : ''}" id="crack-${system.id}">
                            <div class="inspection-evidence-panel__title">OFFLINE CRACK LAB</div>
                            ${crackRows || '<div class="inspection-evidence-row">No cracking analysis available.</div>'}
                        </section>
                    </div>
                </article>`;
        }).join('');
        const choiceMarkup = choices.map(choice => `
            <label class="inspection-decision-card">
                <input type="radio" name="inspection-choice" value="${choice.id}" ${this.inspectionSelectedSystem === choice.id ? 'checked' : ''}/>
                <div class="inspection-decision-card__copy">
                    <span class="inspection-decision-card__title">${choice.label}</span>
                    <span class="inspection-decision-card__desc">${choice.description || 'Choose the safer credential-storage design after reviewing the evidence.'}</span>
                </div>
            </label>`).join('');
        const defenseMarkup = followUp ? (Array.isArray(followUp.options) ? followUp.options.map(option => `
            <label class="inspection-decision-card">
                <input type="radio" name="inspection-defense" value="${option.id}" ${this.inspectionSelectedDefense === option.id ? 'checked' : ''}/>
                <div class="inspection-decision-card__copy">
                    <span class="inspection-decision-card__title">${option.label}</span>
                    <span class="inspection-decision-card__desc">${option.description || ''}</span>
                </div>
            </label>`).join('') : '') : '';

        container.innerHTML = `
            ${this.renderSharedPasswordLabThemeStyles()}
            ${this.renderInspectionStyles()}
            ${this.renderSharedPasswordLabFrame({
                levelLabel: '// LEVEL 05 - STORAGE FORENSICS',
                title: 'PASSWORD VAULT<br>AUDIT',
                status: this.inspectionStage === 'defense' ? 'HARDENING DECISION LIVE' : 'FORENSIC STORAGE REVIEW',
                phases: [
                    { label: 'INSPECT STORES', active: this.inspectionStage !== 'defense' },
                    { label: 'SAFER CLUSTER', active: this.inspectionStage === 'defense' },
                    { label: 'RIGHT FIX', active: this.inspectionStage === 'defense' }
                ],
                content: `
                    <div class="password-puzzle inspection-shell">
                        <section class="inspection-masthead">
                            <div class="inspection-masthead__brand">SHADOWDEF</div>
                            <div class="inspection-masthead__case">LEVEL 5 · PASSWORD VAULT AUDIT</div>
                            <div class="inspection-masthead__status">${this.inspectionStage === 'defense' ? 'HARDENING DECISION LIVE' : 'FORENSIC STORAGE REVIEW'}</div>
                        </section>

                        <section class="inspection-hero">
                            <div class="inspection-hero__copy">
                                <div class="inspection-hero__kicker">${phaseLabel}</div>
                                <h2 class="puzzle-title inspection-title">Which credential design survives a breach?</h2>
                                <p>${this.mission.scenario || ''}</p>
                                <div class="inspection-hero__meta">
                                    <span>OBJECTIVE: ${this.mission.objective || ''}</span>
                                    <span>TASK: ${this.mission.userTask || ''}</span>
                                </div>
                            </div>
                            <div class="inspection-scorecard">
                                <div class="inspection-scorecard__row"><span>Evidence Progress</span><strong id="inspection-evidence-count">${inspectedCount}/${totalRequired}</strong></div>
                                <div class="inspection-scorebar"><div class="inspection-scorebar__fill" id="inspection-scorebar-fill" style="width:${progressPct}%"></div></div>
                                <div class="inspection-scorecard__row"><span>Attempts Left</span><strong id="inspection-attempts-left">${Math.max(0, this.maxAttempts - this.attempts)}</strong></div>
                                <div class="inspection-scorecard__row"><span>Current Phase</span><strong>${this.inspectionStage === 'defense' ? '02' : '01'}</strong></div>
                            </div>
                        </section>

                        <div class="inspection-hint-strip">
                            Plain text means instant credential exposure. Fast unsalted hashes are better, but still collapse under offline cracking.
                        </div>

                        <div class="inspection-progress-rail">
                            <div class="inspection-progress-step is-active"><span>01</span><strong>INSPECT BOTH STORES</strong></div>
                            <div class="inspection-progress-step ${this.inspectionStage === 'defense' ? 'is-active' : ''}"><span>02</span><strong>CHOOSE THE SAFER CLUSTER</strong></div>
                            <div class="inspection-progress-step ${this.inspectionStage === 'defense' ? 'is-active' : ''}"><span>03</span><strong>SELECT THE RIGHT FIX</strong></div>
                        </div>

                        <section class="inspection-grid">
                            <div class="inspection-main">${systemsMarkup}</div>
                            <aside class="inspection-sidebar">
                                <section class="inspection-question-panel" id="inspection-choice-block" ${this.inspectionStage === 'defense' ? 'style="display:none;"' : ''}>
                                    <div class="inspection-question-panel__title">After reviewing all evidence, which cluster stores passwords more safely?</div>
                                    <div class="inspection-question-panel__sub">Inspect all evidence actions, then choose the safer storage design and submit from here.</div>
                                    <div class="inspection-decision-list">${choiceMarkup}</div>
                                    <div class="inspection-question-panel__footer">
                                        <button class="btn btn-primary" id="submit-inspection-choice">LOCK AUDIT DECISION</button>
                                        <div class="inspection-question-panel__hint" id="inspection-choice-hint">${inspectedCount < totalRequired ? `Inspect ${totalRequired - inspectedCount} more evidence item${totalRequired - inspectedCount === 1 ? '' : 's'} first` : 'Evidence complete. Choose the safer cluster.'}</div>
                                    </div>
                                </section>

                                <section class="inspection-question-panel" id="inspection-defense-block" ${this.inspectionStage === 'defense' ? '' : 'style="display:none;"'}>
                                    ${followUp ? `
                                        <div class="inspection-question-panel__title">${followUp.prompt}</div>
                                        <div class="inspection-question-panel__sub">Pick the control that best reduces offline cracking risk after the database is stolen.</div>
                                        <div class="inspection-decision-list">${defenseMarkup}</div>
                                        <div class="inspection-question-panel__footer">
                                            <button class="btn btn-primary" id="submit-inspection-defense">SUBMIT HARDENING PLAN</button>
                                            <div class="inspection-question-panel__hint">Think about attacker cost after breach, not just policy appearance.</div>
                                        </div>` : ''}
                                </section>

                                <div class="guess-feedback inspection-feedback" id="guess-feedback">${this.inspectionFeedbackHtml || 'Inspect every evidence action across both clusters, then decide which design is safer and what must change next.'}</div>
                                <div id="attempt-counter" class="inspection-attempt-counter">
                                    Decisions: <span style="color:var(--cyber-blue);">${this.attempts}</span> / ${this.maxAttempts}
                                </div>

                                <div class="inspection-side-panel">
                                    <div class="inspection-side-panel__label">Analyst Brief</div>
                                    <div class="inspection-side-panel__body">
                                        <div>Review database rows, breach fallout, and offline cracking results for both clusters.</div>
                                        <div>The winner is the safer design, not necessarily the final ideal implementation.</div>
                                    </div>
                                </div>
                                <div class="inspection-side-panel">
                                    <div class="inspection-side-panel__label">Threat Model</div>
                                    <div class="inspection-side-list">
                                        <div>Plain text: attacker reads passwords immediately.</div>
                                        <div>Fast hash: attacker must crack offline, but cheap guesses still work fast.</div>
                                        <div>Modern storage: slow salted hashing plus breached-password blocking.</div>
                                    </div>
                                </div>
                                <div class="inspection-side-panel">
                                    <div class="inspection-side-panel__label">Exposure Ranking</div>
                                    <div class="inspection-side-list">
                                        ${systemRiskSummary.map(item => `<div>${item.system.name}: ${item.exposure.score}/100 - ${item.exposure.label}</div>`).join('')}
                                    </div>
                                </div>
                            </aside>
                        </section>
                    </div>`
            })}`;
        this.setupInspectionEventListeners();
        this.startHumanLabMatrixAnimation();
        this.gameScreen.syncEmbeddedMissionHUD();
    }

    setupInspectionEventListeners() {
        document.querySelectorAll('button[data-action]').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                const systemId = btn.dataset.systemId;
                if (!action || !systemId) return;
                if (action === 'view-db') this.viewInspectionDatabase(systemId);
                if (action === 'simulate-breach') this.simulateInspectionBreach(systemId);
                if (action === 'run-crack') this.runInspectionCrackAnalysis(systemId);
                this.audio.playButtonClick();
            });
        });
        document.querySelectorAll('input[name="inspection-choice"]').forEach(r => { r.addEventListener('change', () => { this.inspectionSelectedSystem = r.value; this.audio.playButtonClick(); }); });
        document.querySelectorAll('input[name="inspection-defense"]').forEach(r => { r.addEventListener('change', () => { this.inspectionSelectedDefense = r.value; this.audio.playButtonClick(); }); });
        document.getElementById('submit-inspection-choice')?.addEventListener('click', () => this.submitInspectionChoice());
        document.getElementById('submit-inspection-defense')?.addEventListener('click', () => this.submitInspectionDefense());
    }

    updateInspectionInterface() {
        const systems = Array.isArray(this.puzzleData.systems) ? this.puzzleData.systems : [];
        const requiredPerSystem = Math.max(1, Number(this.puzzleData.inspectionRequiredActionsPerSystem || 3));
        const totalRequired = systems.length * requiredPerSystem;
        const inspectedCount = this.inspectionViewedActions.size;
        const progressPct = totalRequired ? Math.min(100, (inspectedCount / totalRequired) * 100) : 0;
        const attemptsLeft = Math.max(0, this.maxAttempts - this.attempts);

        const evidenceCount = document.getElementById('inspection-evidence-count');
        if (evidenceCount) evidenceCount.textContent = `${inspectedCount}/${totalRequired}`;
        const scoreFill = document.getElementById('inspection-scorebar-fill');
        if (scoreFill) scoreFill.style.width = `${progressPct}%`;
        const attemptsLeftEl = document.getElementById('inspection-attempts-left');
        if (attemptsLeftEl) attemptsLeftEl.textContent = `${attemptsLeft}`;
        const choiceHint = document.getElementById('inspection-choice-hint');
        if (choiceHint) {
            choiceHint.textContent = inspectedCount < totalRequired
                ? `Inspect ${totalRequired - inspectedCount} more evidence item${totalRequired - inspectedCount === 1 ? '' : 's'} first`
                : 'Evidence complete. Choose the safer cluster.';
        }

        systems.forEach(system => {
            const actions = [
                { id: 'db', key: `${system.id}:db`, action: 'view-db', panel: `db-${system.id}` },
                { id: 'breach', key: `${system.id}:breach`, action: 'simulate-breach', panel: `breach-${system.id}` },
                { id: 'crack', key: `${system.id}:crack`, action: 'run-crack', panel: `crack-${system.id}` }
            ];
            actions.forEach(item => {
                const isViewed = this.inspectionViewedActions.has(item.key);
                const button = this.visualizerElement?.querySelector(`button[data-action="${item.action}"][data-system-id="${system.id}"]`);
                if (button) button.classList.toggle('is-viewed', isViewed);
                const panel = document.getElementById(item.panel);
                if (panel) panel.classList.toggle('is-visible', isViewed);
            });
        });
    }

    viewInspectionDatabase(systemId) {
        const system = (this.puzzleData.systems || []).find(s => s.id === systemId);
        if (!system) return;
        const panel = document.getElementById(`db-${systemId}`);
        if (!panel) return;
        this.inspectionViewedActions.add(`${systemId}:db`);
        panel.classList.add('is-visible');
        this.updateInspectionInterface();
    }

    simulateInspectionBreach(systemId) {
        const system = (this.puzzleData.systems || []).find(s => s.id === systemId);
        if (!system) return;
        const panel = document.getElementById(`breach-${systemId}`);
        if (!panel) return;
        this.inspectionViewedActions.add(`${systemId}:breach`);
        panel.classList.add('is-visible');
        this.updateInspectionInterface();
    }

    runInspectionCrackAnalysis(systemId) {
        const system = (this.puzzleData.systems || []).find(s => s.id === systemId);
        if (!system) return;
        const panel = document.getElementById(`crack-${systemId}`);
        if (!panel) return;
        this.inspectionViewedActions.add(`${systemId}:crack`);
        panel.classList.add('is-visible');
        this.updateInspectionInterface();
    }

    submitInspectionChoice() {
        if (this.isComplete) return;
        const systems = Array.isArray(this.puzzleData.systems) ? this.puzzleData.systems : [];
        const requiredPerSystem = Math.max(1, Number(this.puzzleData.inspectionRequiredActionsPerSystem || 3));
        const totalRequired = systems.length * requiredPerSystem;
        if (this.inspectionViewedActions.size < totalRequired) {
            this.gameScreen.ui.showNotification('Inspect all evidence actions before locking the audit decision.', 'warning');
            return;
        }
        if (!this.inspectionSelectedSystem) { this.gameScreen.ui.showNotification('Choose a system first.', 'warning'); return; }
        this.attempts++; this.updateAttemptCounter(); this.gameScreen.updateAttempts(this.attempts);
        const feedback = document.getElementById('guess-feedback');
        if (this.inspectionSelectedSystem !== this.puzzleData.correctAnswer) {
            this.inspectionFeedbackHtml = `<div><strong>Not correct yet.</strong></div><div>${this.mission.failureFeedback || ''}</div><div style="margin-top:6px;">Plain text is always the worst breach outcome because the attacker receives working passwords immediately.</div>`;
            if (feedback) feedback.innerHTML = this.inspectionFeedbackHtml;
            this.audio.playFailure();
            if (this.attempts >= this.maxAttempts) {
                this.gameScreen.ui.showNotification(this.mission.failureFeedback || 'Audit failed.', 'error');
                this.isComplete = true;
                setTimeout(() => this.gameScreen.completePuzzle(false), 1200);
                return;
            }
            this.gameScreen.ui.showNotification('Incorrect choice. Review and try again.', 'error');
            return;
        }
        this.inspectionStage = 'defense';
        const selectedChoice = (this.puzzleData.choices || []).find(c => c.id === this.puzzleData.correctAnswer);
        this.inspectionFeedbackHtml = `<div><strong>Correct: ${selectedChoice?.label || 'Cluster B'} is safer.</strong></div><div>${this.puzzleData.simpleExplanation || ''}</div><div style="margin-top:8px;">Now finish the audit: choose the best hardening control for the winning cluster.</div>`;
        if (feedback) feedback.innerHTML = this.inspectionFeedbackHtml;
        this.audio.playSuccess();
        this.gameScreen.ui.showNotification('Safer cluster identified. Final hardening decision unlocked.', 'success');
        if (this.visualizerElement) {
            this.rerenderWithPreservedScroll(
                () => this.renderInspectionPuzzle(this.visualizerElement),
                {
                    primarySelector: '.password-puzzle.inspection-shell',
                    anchorSelector: '#inspection-choice-block'
                }
            );
        }
    }

    submitInspectionDefense() {
        if (this.isComplete) return;
        const followUp = this.puzzleData.followUpDefenseQuestion;
        if (!followUp) { this.gameScreen.completePuzzle(true); return; }
        if (!this.inspectionSelectedDefense) { this.gameScreen.ui.showNotification('Select a hardening option first.', 'warning'); return; }
        this.attempts++; this.updateAttemptCounter(); this.gameScreen.updateAttempts(this.attempts);
        const feedback = document.getElementById('guess-feedback');
        if (this.inspectionSelectedDefense !== followUp.correctAnswer) {
            this.inspectionFeedbackHtml = `<div><strong>Not the best remediation.</strong></div><div>${followUp.explanation || ''}</div><div style="margin-top:8px;">Focus on what makes offline cracking expensive after a breach.</div>`;
            if (feedback) feedback.innerHTML = this.inspectionFeedbackHtml;
            this.audio.playFailure();
            if (this.attempts >= this.maxAttempts) {
                this.gameScreen.ui.showNotification(this.mission.failureFeedback || 'Audit failed.', 'error');
                this.isComplete = true;
                setTimeout(() => this.gameScreen.completePuzzle(false), 1200);
                return;
            }
            this.gameScreen.ui.showNotification('That hardening plan is incomplete. Reassess attacker cost after breach.', 'error');
            return;
        }
        this.isComplete = true;
        this.inspectionFeedbackHtml = `<div><strong>Audit complete.</strong></div><div>${followUp.explanation || ''}</div><div style="margin-top:10px;">${this.puzzleData.educationalSummary || ''}</div>`;
        if (feedback) feedback.innerHTML = this.inspectionFeedbackHtml;
        this.audio.playSuccess();
        this.gameScreen.ui.flashScreen('rgba(0,255,65,0.2)', 300);
        this.gameScreen.ui.showNotification(this.mission.successFeedback || 'Correct choice.', 'success');
        setTimeout(() => this.gameScreen.completePuzzle(true), 1500);
    }

    // ─── LEVEL 6: wave defense grid ──────────────────────────────────────────

    getLiveDefenseControls() {
        return (Array.isArray(this.puzzleData.defenses) ? this.puzzleData.defenses : []).map(defense => ({
            id: defense?.id || this.sanitizeId(defense?.name || 'control'),
            name: defense?.name || 'Unknown Control',
            energyCost: Number(defense?.energyCost || 0),
            cooldown: Number(defense?.cooldown || 0),
            tags: Array.isArray(defense?.tags) && defense.tags.length
                ? defense.tags
                : Array.isArray(defense?.protectsAgainst)
                    ? defense.protectsAgainst
                    : [],
            description: defense?.description || defense?.desc || 'Deploy this control to reduce attack impact.'
        }));
    }

    getLiveDefenseWaves() {
        return (Array.isArray(this.puzzleData.waves) ? this.puzzleData.waves : []).map((wave, index) => ({
            id: wave?.id || `wave-${index + 1}`,
            name: wave?.name || `Wave ${index + 1}`,
            attacks: (Array.isArray(wave?.attacks) ? wave.attacks : []).map((attack, attackIndex) => ({
                id: attack?.id || `${wave?.id || `wave-${index + 1}`}-attack-${attackIndex + 1}`,
                type: attack?.type || 'Unknown Attack',
                damage: Number(attack?.damage ?? attack?.dmg ?? 0),
                vector: attack?.vector || attack?.desc || attack?.description || 'Credential attack wave detected.',
                counterIds: Array.isArray(attack?.counterIds)
                    ? attack.counterIds
                    : Array.isArray(attack?.counters)
                        ? attack.counters
                        : []
            }))
        }));
    }

    getLiveDefenseOverviewAttacks() {
        const summary = new Map();
        this.getLiveDefenseWaves().forEach(wave => {
            wave.attacks.forEach(attack => {
                const existing = summary.get(attack.type);
                if (!existing || attack.damage > existing.damage) {
                    summary.set(attack.type, {
                        type: attack.type,
                        damage: attack.damage,
                        vector: attack.vector
                    });
                }
            });
        });
        return Array.from(summary.values());
    }

    getLiveDefenseCurrentWave() {
        return this.getLiveDefenseWaves()[this.liveWaveIndex] || null;
    }

    getLiveDefenseCoveragePercent() {
        const controls = this.getLiveDefenseControls();
        if (!controls.length) return 0;
        const activeCount = controls.filter(control => Number(this.liveDefenseCooldowns[control.id] || 0) > 0).length;
        return Math.min(100, Math.round((activeCount / controls.length) * 100));
    }

    setLiveDefenseIntel({ title = 'Standby', detail = '', description = '', tone = 'standby' } = {}) {
        this.liveIntelState = { title, detail, description, tone };
        this.updateLiveDefenseIntelPanel();
    }

    updateLiveDefenseIntelPanel() {
        const panel = document.getElementById('live-current-attack');
        if (!panel) return;

        const intel = this.liveIntelState || {
            title: 'Standby',
            detail: '',
            description: 'Wave starting in 3 seconds...',
            tone: 'standby'
        };

        panel.className = `ld-intel-live ld-intel-live--${intel.tone || 'standby'}`;
        panel.innerHTML = `
            <div class="ld-intel-live__head">
                <div class="ld-intel-live__kicker">Active Threat Window</div>
                <div class="ld-intel-live__detail">${intel.detail || 'Monitoring'}</div>
            </div>
            <div class="ld-intel-live__title">${intel.title}</div>
            <div class="ld-intel-live__desc">${intel.description}</div>`;
    }

    renderLiveDefenseSimulationPuzzle(container) {
        this.visualizerElement = container;
        const controls = this.getLiveDefenseControls();
        const overviewAttacks = this.getLiveDefenseOverviewAttacks();
        const totalWaves = Math.max(1, this.getLiveDefenseWaves().length);
        const currentWave = this.getLiveDefenseCurrentWave();
        const waveLabel = currentWave
            ? `${this.liveWaveIndex + 1} / ${totalWaves} - ${currentWave.name}`
            : `1 / ${totalWaves} - Initializing Defense Grid`;
        const coveragePct = this.getLiveDefenseCoveragePercent();
        const controlMarkup = controls.map(control => `
            <button class="ld-control-card" data-live-defense="${control.id}" type="button">
                <div class="ld-control-card__head">
                    <div class="ld-control-card__name">${control.name}</div>
                    <div class="ld-control-card__cost">${control.energyCost} EN</div>
                </div>
                <div class="ld-control-card__meta">Cooldown ${control.cooldown}s</div>
                <div class="ld-control-card__desc">${control.description}</div>
                <div class="ld-control-card__tags">${control.tags.map(tag => `<span>${tag}</span>`).join('')}</div>
                <div class="ld-control-card__status" id="live-cd-${this.sanitizeId(control.id)}">READY</div>
            </button>`).join('');
        const attackLibraryMarkup = overviewAttacks.map(attack => `
            <div class="ld-intel-row">
                <div>
                    <strong>${attack.type}</strong>
                    <div>${attack.vector}</div>
                </div>
                <span class="ld-intel-row__damage">-${attack.damage}</span>
            </div>`).join('');

        container.innerHTML = `
            <style>
                .ld-shell{padding:24px;min-height:0}
                .ld-layout{display:grid;grid-template-columns:minmax(280px,320px) minmax(0,1fr);gap:18px;min-height:100%;align-items:start}
                .ld-side{display:flex;flex-direction:column;gap:16px;min-height:0}
                .ld-main{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:16px;align-content:start;min-height:0}
                .ld-panel-card,.ld-wave-bar,.ld-control-section,.ld-log-panel,.ld-control-card,.ld-intel-live,.ld-intel-list{background:rgba(2,10,24,.68);border:1px solid rgba(23,216,255,.14);box-shadow:0 20px 48px rgba(0,0,0,.24);backdrop-filter:blur(12px)}
                .ld-panel-card,.ld-control-section,.ld-log-panel{padding:16px}
                .ld-section-title,.ld-wave-label,.ld-wave-energy,.ld-intel-live__kicker,.ld-control-card__cost,.ld-control-card__meta,.ld-control-card__status,.ld-stat-label{font-family:'Share Tech Mono',monospace;letter-spacing:.18em;text-transform:uppercase}
                .ld-section-title{font-size:.72rem;color:rgba(23,216,255,.72);margin-bottom:12px}
                .ld-brief-copy{color:rgba(225,239,248,.82);line-height:1.65;font-size:.88rem}
                .ld-stat-block{display:grid;gap:10px}
                .ld-stat-row{display:flex;justify-content:space-between;align-items:center;gap:12px;font-size:.92rem;color:rgba(232,244,255,.82)}
                .ld-stat-label{font-size:.64rem;color:rgba(168,216,232,.5)}
                .ld-stat-value{font-family:'Bebas Neue',sans-serif;font-size:1.6rem;letter-spacing:.06em;color:#eef7ff}
                .ld-stat-value.energy{color:#ffdd57}
                .ld-stat-value.time{color:#18e4ff}
                .ld-stat-value.coverage{color:#00ff88}
                .ld-bar{height:8px;background:rgba(255,255,255,.05);border-radius:999px;overflow:hidden}
                .ld-bar > div{height:100%;border-radius:999px;transition:width .25s ease}
                .ld-bar-health > div{background:linear-gradient(90deg,#ff4060,#ffb347,#17d8ff)}
                .ld-bar-energy > div{background:linear-gradient(90deg,#f7b500,#ffe36d)}
                .ld-intel-live{padding:16px;display:grid;gap:10px}
                .ld-intel-live__head{display:flex;justify-content:space-between;align-items:center;gap:12px}
                .ld-intel-live__kicker{font-size:.64rem;color:rgba(168,216,232,.48)}
                .ld-intel-live__detail{font-size:.68rem;color:#ff9bc0}
                .ld-intel-live__title{font-family:'Orbitron',sans-serif;font-size:1.25rem;letter-spacing:.08em;color:#eef7ff}
                .ld-intel-live__desc{color:rgba(225,239,248,.78);line-height:1.6;font-size:.88rem}
                .ld-intel-live--standby .ld-intel-live__detail{color:#18e4ff}
                .ld-intel-live--warn .ld-intel-live__detail{color:#ffcc66}
                .ld-intel-live--danger .ld-intel-live__detail,.ld-intel-live--bad .ld-intel-live__detail{color:#ff6989}
                .ld-intel-live--good .ld-intel-live__detail{color:#00ff88}
                .ld-intel-list{padding:8px 16px;overflow:auto;min-height:0}
                .ld-intel-row{display:flex;justify-content:space-between;gap:12px;padding:12px 0;border-bottom:1px solid rgba(23,216,255,.08);color:rgba(225,239,248,.8)}
                .ld-intel-row:last-child{border-bottom:0}
                .ld-intel-row strong{display:block;color:#eef7ff;margin-bottom:4px}
                .ld-intel-row div{font-size:.82rem;line-height:1.5;color:rgba(168,216,232,.58)}
                .ld-intel-row__damage{color:#ff7e92;font-size:.74rem;flex-shrink:0}
                .ld-brief-panel,.ld-wave-bar{grid-column:1 / -1}
                .ld-wave-bar{display:flex;align-items:center;gap:12px;padding:12px 16px;flex-wrap:wrap}
                .ld-wave-label{font-size:.64rem;color:#18e4ff}
                .ld-wave-info{flex:1 1 280px;min-width:0;font-size:1rem;color:#eef7ff;font-weight:700;line-height:1.4}
                .ld-wave-energy{margin-left:auto;display:inline-flex;align-items:baseline;gap:8px;font-size:.7rem;color:#18e4ff}
                .ld-wave-energy strong{font-family:'Bebas Neue',sans-serif;font-size:1.2rem;letter-spacing:.08em;color:#ffdd57}
                .ld-control-section{grid-column:1 / span 8;display:flex;flex-direction:column;gap:12px;min-height:0;align-self:start}
                .ld-control-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;min-height:0}
                .ld-control-card{display:flex;flex-direction:column;min-height:100%;padding:14px;text-align:left;cursor:pointer;transition:border-color .2s ease,box-shadow .2s ease,transform .2s ease;color:#eef7ff;overflow:hidden}
                .ld-control-card:hover{transform:translateY(-2px);border-color:rgba(23,216,255,.34);box-shadow:0 18px 34px rgba(0,0,0,.22)}
                .ld-control-card.disabled,.ld-control-card:disabled{opacity:.42;cursor:not-allowed;transform:none}
                .ld-control-card__head{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-start;gap:10px}
                .ld-control-card__name{font-weight:700;font-size:.98rem;line-height:1.35}
                .ld-control-card__cost{flex-shrink:0;font-size:.66rem;color:#18e4ff}
                .ld-control-card__meta{margin-top:8px;font-size:.64rem;color:rgba(168,216,232,.54)}
                .ld-control-card__desc{flex:1;margin-top:8px;color:rgba(225,239,248,.72);font-size:.84rem;line-height:1.55;min-height:52px}
                .ld-control-card__tags{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px}
                .ld-control-card__tags span{display:inline-flex;padding:4px 8px;border:1px solid rgba(23,216,255,.14);background:rgba(23,216,255,.07);color:#8beeff;font-size:.68rem}
                .ld-control-card__status{margin-top:12px;font-size:.66rem;color:#00ff88}
                .ld-control-section .ld-section-title,.ld-log-panel .ld-section-title{margin-bottom:0}
                .ld-log-panel{grid-column:9 / -1;display:flex;flex-direction:column;gap:12px;min-height:0;align-self:stretch}
                .ld-log-body{flex:1;min-height:240px;max-height:420px;overflow:auto;margin:0;padding-right:4px;color:rgba(225,239,248,.8);font-size:.82rem;line-height:1.5}
                .ld-log-line{margin-bottom:6px}
                .ld-log-line.good{color:#00ff88}
                .ld-log-line.bad{color:#ff6d88}
                .ld-log-line.warn{color:#ffcc66}
                @media (max-width:1380px){.ld-main{grid-template-columns:1fr}.ld-brief-panel,.ld-wave-bar,.ld-control-section,.ld-log-panel{grid-column:1}.ld-log-body{min-height:180px;max-height:none}}
                @media (max-width:1180px){.ld-layout{grid-template-columns:1fr}}
                @media (max-width:760px){.ld-shell{padding:16px}.ld-main{gap:14px}.ld-control-grid{grid-template-columns:1fr}.ld-wave-energy{margin-left:0}}
            </style>
            ${this.renderSharedPasswordLabThemeStyles()}
            ${this.renderSharedPasswordLabFrame({
                levelLabel: `// LEVEL ${String(this.mission.level || 0).padStart(2, '0')} - ACTIVE DEFENSE GRID`,
                title: 'CYBER DEFENSE<br>SIMULATION',
                status: 'VAULT DEFENSE ONLINE',
                timeLabel: 'Timer',
                timeDisplayOverride: `${Math.max(0, Math.floor(this.liveRemainingTime))}S`,
                auxiliaryLabel: 'Wave',
                auxiliaryValue: `1/${totalWaves}`,
                auxiliaryTone: 'safe',
                phases: [
                    { label: 'STABILIZE', active: true },
                    { label: 'ADAPT', active: false },
                    { label: 'SURVIVE', active: false }
                ],
                content: `
                    <div class="ld-shell">
                        <div class="ld-layout">
                            <aside class="ld-side">
                                <section class="ld-panel-card">
                                    <div class="ld-section-title">Defense Telemetry</div>
                                    <div class="ld-stat-block">
                                        <div class="ld-stat-row">
                                            <span class="ld-stat-label">Vault Health</span>
                                            <strong class="ld-stat-value" id="live-vault-text">${Math.floor(this.liveVaultHealth)}%</strong>
                                        </div>
                                        <div class="ld-bar ld-bar-health"><div id="live-vault-fill" style="width:${this.liveVaultHealth}%;"></div></div>
                                        <div class="ld-stat-row">
                                            <span class="ld-stat-label">Player Energy</span>
                                            <strong class="ld-stat-value energy" id="live-energy-text">${Math.floor(this.liveEnergy)} EN</strong>
                                        </div>
                                        <div class="ld-bar ld-bar-energy"><div id="live-energy-fill" style="width:${this.liveEnergy}%;"></div></div>
                                        <div class="ld-stat-row">
                                            <span class="ld-stat-label">Time Left</span>
                                            <strong class="ld-stat-value time" id="live-time-text">${Math.floor(this.liveRemainingTime)}s</strong>
                                        </div>
                                        <div class="ld-stat-row">
                                            <span class="ld-stat-label">Coverage</span>
                                            <strong class="ld-stat-value coverage" id="cov-val">${coveragePct}%</strong>
                                        </div>
                                        <div class="ld-stat-row">
                                            <span class="ld-stat-label">Blocked / Missed</span>
                                            <strong class="ld-stat-value" id="bm-val">${this.liveSuccessfulBlocks} / ${this.liveMissedWaves}</strong>
                                        </div>
                                    </div>
                                </section>
                                <section class="ld-panel-card" style="display:flex;flex-direction:column;gap:12px;min-height:0;">
                                    <div class="ld-section-title">Attack Intel</div>
                                    <div id="live-current-attack"></div>
                                    <div class="ld-intel-list">${attackLibraryMarkup}</div>
                                </section>
                            </aside>
                            <main class="ld-main">
                                <section class="ld-wave-bar">
                                    <span class="ld-wave-label">Wave</span>
                                    <span class="ld-wave-info" id="wave-info">${waveLabel}</span>
                                    <span class="ld-wave-energy">Energy <strong id="en-num">${Math.floor(this.liveEnergy)}</strong></span>
                                </section>
                                <section class="ld-panel-card ld-brief-panel">
                                    <div class="ld-section-title">Command Brief</div>
                                    <div class="ld-brief-copy">${this.mission.userTask || this.mission.objective || 'Defend the vault through coordinated attack waves.'}</div>
                                </section>
                                <section class="ld-control-section">
                                    <div class="ld-section-title">Available Controls</div>
                                    <div class="ld-control-grid" id="live-defense-grid">${controlMarkup}</div>
                                </section>
                                <section class="ld-log-panel">
                                    <div class="ld-section-title">Command Log</div>
                                    <div class="ld-log-body guess-feedback" id="guess-feedback"></div>
                                </section>
                            </main>
                        </div>
                    </div>`
            })}`;

        this.setLiveDefenseIntel({
            title: 'Standby',
            detail: 'Initializing',
            description: 'Wave starting in 3 seconds. Preserve energy for the later surges.',
            tone: 'standby'
        });
        this.setupLiveDefenseEventListeners();
        this.startLiveDefenseSimulation();
        this.startHumanLabMatrixAnimation();
        this.gameScreen.syncEmbeddedMissionHUD();
    }

    setupLiveDefenseEventListeners() {
        document.querySelectorAll('button[data-live-defense]').forEach(btn => {
            btn.addEventListener('click', () => {
                const controlId = btn.dataset.liveDefense;
                if (controlId) this.activateLiveDefense(controlId);
            });
        });
    }

    startLiveDefenseSimulation() {
        const simConfig = this.puzzleData.simulationConfig || {};
        const regen = simConfig.energyRegenRate || {};
        const regenAmount = Number(regen.amount || 3);
        const regenEvery = Math.max(1, Number(regen.everySeconds || 1));
        const overlay = simConfig.tutorialOverlay;
        const controls = this.getLiveDefenseControls();
        const waves = this.getLiveDefenseWaves();

        this.liveWaveIndex = 0;
        this.liveAttackIndex = 0;
        this.liveSuccessfulBlocks = 0;
        this.liveMissedWaves = 0;
        this.liveTotalAttacks = waves.reduce((total, wave) => total + wave.attacks.length, 0);
        this.liveActiveAttack = null;
        this.liveSimulationElapsed = 0;
        this.liveDefenseCooldowns = {};
        controls.forEach(control => { this.liveDefenseCooldowns[control.id] = 0; });
        this.updateLiveSimulationUI();

        this.appendLiveLog(overlay?.message || 'New defense run started. Hold the vault through all threat windows.', 'good');
        if (overlay?.enabled) {
            this.setLiveDefenseIntel({
                title: 'Defense Grid Online',
                detail: 'Warmup Window',
                description: overlay.message || 'Wave starting in 3 seconds.',
                tone: 'warn'
            });
        }

        this.liveEnergyTimerId = setInterval(() => {
            if (this.isComplete || this.gameScreen?.isPaused) return;
            this.liveEnergy = Math.min(100, this.liveEnergy + regenAmount);
            this.updateLiveSimulationUI();
        }, regenEvery * 1000);

        this.liveCooldownTimerId = setInterval(() => {
            if (this.isComplete || this.gameScreen?.isPaused) return;
            Object.keys(this.liveDefenseCooldowns).forEach(id => {
                this.liveDefenseCooldowns[id] = Math.max(0, Number(this.liveDefenseCooldowns[id] || 0) - 1);
            });
            this.updateLiveSimulationUI();
        }, 1000);

        this.liveDurationTimerId = setInterval(() => {
            if (this.isComplete || this.gameScreen?.isPaused) return;
            this.liveRemainingTime = Math.max(0, this.liveRemainingTime - 1);
            this.liveSimulationElapsed++;
            this.updateLiveSimulationUI();
            if (this.liveRemainingTime <= 0) this.finishLiveDefenseSimulation(this.liveVaultHealth > 0);
        }, 1000);

        this.scheduleNextLiveAttack(simConfig.initialAttackDelayMs || 3000);
    }

    scheduleNextLiveAttack(delayMs = null) {
        if (this.isComplete) return;
        const simConfig = this.puzzleData.simulationConfig || {};
        const resolvedDelay = Math.max(250, Number(delayMs ?? simConfig.betweenAttackDelayMs ?? 3000));
        this.liveSpawnTimeoutId = setTimeout(() => {
            if (this.isComplete) return;
            this.spawnLiveAttack();
        }, resolvedDelay);
    }

    spawnLiveAttack() {
        if (this.isComplete) return;

        const simConfig = this.puzzleData.simulationConfig || {};
        const waves = this.getLiveDefenseWaves();
        const currentWave = waves[this.liveWaveIndex];

        if (!currentWave) {
            this.finishLiveDefenseSimulation(this.liveVaultHealth > 0);
            return;
        }

        if (this.liveAttackIndex >= currentWave.attacks.length) {
            this.liveWaveIndex += 1;
            this.liveAttackIndex = 0;

            const nextWave = waves[this.liveWaveIndex];
            if (!nextWave) {
                this.finishLiveDefenseSimulation(this.liveVaultHealth > 0);
                return;
            }

            this.setLiveDefenseIntel({
                title: nextWave.name,
                detail: `Wave ${this.liveWaveIndex + 1}`,
                description: 'Threat pattern shifting. Rebuild your energy and prepare the right controls.',
                tone: 'warn'
            });
            this.appendLiveLog(`Wave ${this.liveWaveIndex + 1} starting: ${nextWave.name}`, 'warn');
            this.updateLiveSimulationUI();
            this.scheduleNextLiveAttack(simConfig.betweenWaveDelayMs || 4000);
            return;
        }

        const attack = currentWave.attacks[this.liveAttackIndex];
        this.liveAttackIndex += 1;
        this.liveActiveAttack = attack;

        this.setLiveDefenseIntel({
            title: attack.type,
            detail: `-${attack.damage} Vault`,
            description: attack.vector,
            tone: 'danger'
        });
        this.appendLiveLog(`Incoming: ${attack.type}`, 'bad');
        this.updateLiveSimulationUI();

        this.liveAttackTimeoutId = setTimeout(() => {
            if (this.isComplete || this.liveActiveAttack !== attack) return;
            this.resolveLiveAttack(attack, null);
        }, Math.max(1000, Number(simConfig.attackResolveWindowMs || 5000)));
    }

    activateLiveDefense(controlId) {
        if (this.isComplete) return;

        const controls = this.getLiveDefenseControls();
        const control = controls.find(entry => entry.id === controlId);
        if (!control) return;

        const cooldownLeft = Number(this.liveDefenseCooldowns[control.id] || 0);
        if (cooldownLeft > 0) {
            this.gameScreen.ui.showNotification(`${control.name} cooling down (${cooldownLeft}s).`, 'warning');
            return;
        }

        if (this.liveEnergy < control.energyCost) {
            this.gameScreen.ui.showNotification('Not enough energy.', 'warning');
            return;
        }

        this.liveEnergy = Math.max(0, this.liveEnergy - control.energyCost);
        this.liveDefenseCooldowns[control.id] = control.cooldown;
        this.audio.playButtonClick();
        this.appendLiveLog(`Deployed: ${control.name}`, 'good');
        this.updateLiveSimulationUI();

        if (!this.liveActiveAttack) return;

        if (!Array.isArray(this.liveActiveAttack.counterIds) || !this.liveActiveAttack.counterIds.includes(control.id)) return;
        this.resolveLiveAttack(this.liveActiveAttack, control);
    }

    resolveLiveAttack(attack, control = null) {
        if (!attack || this.isComplete) return;

        if (this.liveAttackTimeoutId) {
            clearTimeout(this.liveAttackTimeoutId);
            this.liveAttackTimeoutId = null;
        }

        const simConfig = this.puzzleData.simulationConfig || {};
        const wasCountered = !!control && Array.isArray(attack.counterIds) && attack.counterIds.includes(control.id);
        this.liveActiveAttack = null;

        if (wasCountered) {
            this.liveSuccessfulBlocks += 1;
            this.setLiveDefenseIntel({
                title: 'Threat Neutralized',
                detail: control.name,
                description: `${attack.type} was blocked before it could damage the vault.`,
                tone: 'good'
            });
            this.appendLiveLog(`Blocked: ${attack.type} via ${control.name}`, 'good');
            this.audio.playSuccess();
        } else {
            this.liveVaultHealth = Math.max(0, this.liveVaultHealth - Number(attack.damage || 0));
            this.liveMissedWaves += 1;
            this.setLiveDefenseIntel({
                title: 'Impact Registered',
                detail: `-${Number(attack.damage || 0)} Vault`,
                description: `${attack.type} hit the vault perimeter. Re-stabilize before the next surge.`,
                tone: 'bad'
            });
            this.appendLiveLog(`HIT! ${attack.type} dealt ${Number(attack.damage || 0)} damage.`, 'bad');
            this.audio.playFailure();
        }

        this.updateLiveSimulationUI();

        if (this.liveVaultHealth <= 0) {
            this.finishLiveDefenseSimulation(false);
            return;
        }

        this.scheduleNextLiveAttack(simConfig.betweenAttackDelayMs || 3000);
    }

    stopLiveDefenseSimulation() {
        if (this.liveAttackTimeoutId) { clearTimeout(this.liveAttackTimeoutId); this.liveAttackTimeoutId = null; }
        if (this.liveSpawnTimeoutId) { clearTimeout(this.liveSpawnTimeoutId); this.liveSpawnTimeoutId = null; }
        if (this.liveEnergyTimerId) { clearInterval(this.liveEnergyTimerId); this.liveEnergyTimerId = null; }
        if (this.liveDurationTimerId) { clearInterval(this.liveDurationTimerId); this.liveDurationTimerId = null; }
        if (this.liveCooldownTimerId) { clearInterval(this.liveCooldownTimerId); this.liveCooldownTimerId = null; }
    }

    updateLiveSimulationUI() {
        const vault = Math.max(0, Math.min(100, this.liveVaultHealth));
        const energy = Math.max(0, Math.min(100, this.liveEnergy));
        const coverage = this.getLiveDefenseCoveragePercent();
        const waves = this.getLiveDefenseWaves();
        const totalWaves = Math.max(1, waves.length);
        const currentWave = waves[this.liveWaveIndex];
        const waveInfo = currentWave
            ? `${this.liveWaveIndex + 1} / ${totalWaves} - ${currentWave.name}`
            : `${totalWaves} / ${totalWaves} - Vault Secured`;
        const vaultText = document.getElementById('live-vault-text');
        const vaultFill = document.getElementById('live-vault-fill');
        const energyText = document.getElementById('live-energy-text');
        const energyFill = document.getElementById('live-energy-fill');
        const timeText = document.getElementById('live-time-text');
        const coverageText = document.getElementById('cov-val');
        const blockedMissedText = document.getElementById('bm-val');
        const waveInfoText = document.getElementById('wave-info');
        const energyNumber = document.getElementById('en-num');
        if (vaultText) vaultText.textContent = `${Math.floor(vault)}%`;
        if (vaultFill) vaultFill.style.width = `${vault}%`;
        if (energyText) energyText.textContent = `${Math.floor(energy)} EN`;
        if (energyFill) energyFill.style.width = `${energy}%`;
        if (timeText) timeText.textContent = `${Math.max(0, Math.floor(this.liveRemainingTime))}s`;
        if (coverageText) coverageText.textContent = `${coverage}%`;
        if (blockedMissedText) blockedMissedText.textContent = `${this.liveSuccessfulBlocks} / ${this.liveMissedWaves}`;
        if (waveInfoText) waveInfoText.textContent = waveInfo;
        if (energyNumber) energyNumber.textContent = `${Math.floor(energy)}`;
        this.updateLiveDefenseButtons();
        this.updateLiveDefenseIntelPanel();
        this.gameScreen.syncEmbeddedMissionHUD();
    }

    updateLiveDefenseButtons() {
        const controls = this.getLiveDefenseControls();
        document.querySelectorAll('button[data-live-defense]').forEach(btn => {
            const control = controls.find(entry => entry.id === btn.dataset.liveDefense);
            if (!control) return;

            const cooldown = Number(this.liveDefenseCooldowns[control.id] || 0);
            const affordable = this.liveEnergy >= control.energyCost;
            const disabled = this.isComplete || cooldown > 0 || !affordable;
            btn.disabled = disabled;
            btn.classList.toggle('disabled', disabled);

            const cd = document.getElementById(`live-cd-${this.sanitizeId(control.id)}`);
            if (!cd) return;

            cd.textContent = cooldown > 0 ? `COOLDOWN ${cooldown}s` : affordable ? 'READY' : 'LOW ENERGY';
            cd.style.color = cooldown > 0 ? '#ffcc66' : affordable ? '#00ff88' : '#ff7e92';
        });
    }

    appendLiveLog(message, tone = '') {
        const feedback = document.getElementById('guess-feedback');
        if (!feedback) return;

        const line = document.createElement('div');
        line.className = `ld-log-line${tone ? ` ${tone}` : ''}`;
        line.textContent = `> ${message}`;
        feedback.prepend(line);

        while (feedback.children.length > 36) {
            feedback.removeChild(feedback.lastChild);
        }
    }

    finishLiveDefenseSimulation(success) {
        if (this.isComplete) return;
        this.isComplete = true;
        this.stopLiveDefenseSimulation();
        const summary = this.puzzleData.educationalSummary || '';
        const feedback = document.getElementById('guess-feedback');
        const coveragePct = this.getLiveDefenseCoveragePercent();
        if (feedback) {
            feedback.innerHTML = `${feedback.innerHTML}${this.renderMissionDebrief({
                tone: success ? 'success' : 'error',
                title: success ? 'Vault held through the attack window' : 'Vault integrity collapsed under pressure',
                summary,
                details: [
                    `Blocked attacks: ${this.liveSuccessfulBlocks}`,
                    `Missed attacks: ${this.liveMissedWaves}`,
                    `Coverage footprint: ${coveragePct}%`,
                    `Time survived: ${Math.max(0, Number(this.puzzleData.simulationConfig?.simulationDuration || 60) - this.liveRemainingTime)}s`
                ],
                insight: this.mission.knowledgeSummary?.insight || ''
            })}`;
        }

        this.setLiveDefenseIntel({
            title: success ? 'Vault Secured' : 'Vault Breached',
            detail: success ? 'Defense Complete' : 'Defense Failure',
            description: success
                ? 'All active threat windows have been contained. The vault remained online.'
                : 'The attack campaign broke through the defense grid. Review your control rotation and energy use.',
            tone: success ? 'good' : 'bad'
        });
        this.updateLiveSimulationUI();

        if (success) {
            this.audio.playSuccess();
            this.gameScreen.ui.flashScreen('rgba(0,255,65,0.2)', 300);
            this.gameScreen.ui.showNotification(this.mission.successFeedback || 'Defense simulation completed.', 'success');
            setTimeout(() => this.gameScreen.completePuzzle(true), 1200);
        } else {
            this.audio.playFailure();
            this.gameScreen.ui.flashScreen('rgba(255,0,110,0.2)', 300);
            this.gameScreen.ui.showNotification(this.mission.failureFeedback || 'Vault health reached zero.', 'error');
            setTimeout(() => this.gameScreen.completePuzzle(false), 1200);
        }
    }

    // ─── Threat Hunt (Level 8) ────────────────────────────────────────────────

    renderThreatHuntSimulationPuzzle(container) {
        this.visualizerElement = container;
        const panels = Array.isArray(this.puzzleData.evidencePanels) ? this.puzzleData.evidencePanels : [];
        const flatEntries = panels.flatMap(panel => (panel.entries || []).map(entry => ({ ...entry, panelTitle: panel.title, panelId: panel.id })));
        if (!this.threatSelectedEventId && flatEntries[0]) this.threatSelectedEventId = flatEntries[0].id;
        const selectedEvent = flatEntries.find(entry => entry.id === this.threatSelectedEventId) || flatEntries[0] || null;
        const selectedChain = selectedEvent ? this.getThreatChainEntryByEventId(selectedEvent.id) : null;
        const threatSummary = this.getThreatOperationsSummary();
        const logsHtml = this.threatActivityLog.length
            ? this.threatActivityLog.map(item => `<div>• ${item}</div>`).join('')
            : 'Threat hunt initialized. Review evidence and act carefully.';
        const actionButtons = (this.puzzleData.playerActions || []).map(action => `
            <button class="th-card-action" data-threat-action="${action.id}" data-event-id="${selectedEvent?.id || ''}" type="button" ${selectedEvent ? '' : 'disabled'}>
                ${action.label}
            </button>`).join('');
        const panelMarkup = panels.map(panel => {
            const rows = (panel.entries || []).map(entry => {
                const selected = this.threatSelectedEventId === entry.id;
                const marked = this.threatMarkedEvents.has(entry.id);
                const investigated = this.threatInvestigatedEvents.has(entry.id);
                const chain = this.getThreatChainEntryByEventId(entry.id);
                return `
                    <button class="th-event ${selected ? 'selected' : ''}" data-threat-event="${entry.id}" type="button">
                        <div class="th-event__top">
                            <span>${entry.id}</span>
                            <span class="th-event__status ${entry.status === 'anomalous' ? 'anomalous' : 'normal'}">${entry.status}</span>
                        </div>
                        <div class="th-event__title">${entry.action}</div>
                        <div class="th-event__meta">${entry.timestamp} · ${entry.user} · ${entry.locationOrIP}</div>
                        <div class="th-event__flags">
                            ${marked ? '<span>MARKED</span>' : ''}
                            ${investigated ? '<span>INVESTIGATED</span>' : ''}
                            ${this.threatContainedMajor.has(chain?.key) ? '<span>CONTAINED</span>' : ''}
                        </div>
                    </button>`;
            }).join('');
            return `
                <div class="th-panel">
                    <div class="th-panel__head">
                        <strong>${panel.title}</strong>
                        <span>${(panel.entries || []).length} EVENTS</span>
                    </div>
                    <div class="th-panel__body">${rows}</div>
                </div>`;
        }).join('');

        container.innerHTML = `
            <style>
                .th-shell{background:linear-gradient(180deg,#070b12 0%,#05080f 100%);color:#eef2ff;border:1px solid rgba(95,116,170,.14);box-shadow:0 20px 60px rgba(0,0,0,.35)}
                .th-header{display:flex;justify-content:space-between;align-items:center;padding:16px 26px;background:#0a0d18;border-bottom:1px solid rgba(95,116,170,.25);gap:16px;flex-wrap:wrap}
                .th-brand,.th-level,.th-status,.th-kicker,.th-event__status,.th-panel__head span,.th-card-action{font-family:Consolas,"Courier New",monospace;letter-spacing:.18em;text-transform:uppercase}
                .th-brand{color:#7fd5ff;font-weight:700}.th-level{color:rgba(127,213,255,.72);font-size:.85rem}.th-status{color:#00e87a;font-size:.82rem}
                .th-hint-strip{padding:12px 28px;background:rgba(0,212,255,.04);border-bottom:1px solid rgba(0,212,255,.12);color:rgba(0,212,255,.78);font-family:Consolas,"Courier New",monospace;letter-spacing:.12em;font-size:.82rem}
                .th-grid{display:grid;grid-template-columns:1.2fr 360px;gap:0;min-height:700px}
                .th-main,.th-side{padding:24px;background:rgba(0,0,0,.18)}.th-main{border-right:1px solid rgba(95,116,170,.12)}
                .th-kicker{font-size:.74rem;color:rgba(127,213,255,.64);margin-bottom:12px}
                .th-overview,.th-sidebox,.th-panel,.th-selected,.th-log{background:rgba(0,0,0,.34);border:1px solid rgba(95,116,170,.12)}
                .th-overview,.th-sidebox,.th-selected,.th-log{padding:16px}
                .th-overview-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.th-metric{display:grid;gap:8px;padding:12px;border:1px solid rgba(95,116,170,.1);background:rgba(255,255,255,.02)}
                .th-metric span{color:rgba(180,190,230,.62);font-size:.78rem}.th-metric strong{color:#eef2ff;font-family:Consolas,"Courier New",monospace;font-size:1.3rem}
                .th-bar{height:6px;background:rgba(255,64,96,.12);overflow:hidden}.th-bar > div{height:100%;background:linear-gradient(90deg,#ff4060,#7fd5ff)}
                .th-panels{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;margin-top:18px}
                .th-panel__head{display:flex;justify-content:space-between;gap:12px;align-items:center;padding:14px 16px;border-bottom:1px solid rgba(95,116,170,.1)}
                .th-panel__head strong{color:#eef2ff}.th-panel__head span{color:rgba(127,213,255,.62);font-size:.68rem}
                .th-panel__body{padding:14px;display:grid;gap:10px}
                .th-event{padding:14px;border:1px solid rgba(95,116,170,.12);background:rgba(255,255,255,.02);text-align:left;color:#eef2ff;cursor:pointer;transition:.18s ease}
                .th-event:hover{border-color:rgba(127,213,255,.36);transform:translateY(-1px)}.th-event.selected{border-color:#7fd5ff;background:rgba(0,212,255,.08)}
                .th-event__top{display:flex;justify-content:space-between;align-items:center;gap:10px;font-family:Consolas,"Courier New",monospace;color:rgba(127,213,255,.68);font-size:.76rem}
                .th-event__status.normal{color:#00e87a}.th-event__status.anomalous{color:#ffcb6b}.th-event__title{margin-top:10px;font-weight:700;line-height:1.45}.th-event__meta{margin-top:6px;color:rgba(180,190,230,.62);font-size:.82rem;line-height:1.5}
                .th-event__flags{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}.th-event__flags span{display:inline-flex;padding:4px 8px;border:1px solid rgba(255,64,96,.22);background:rgba(255,64,96,.08);color:#ff7e92;font-size:.7rem}
                .th-selected__title{font-size:1.15rem;color:#eef2ff}.th-selected__meta{margin-top:8px;color:rgba(180,190,230,.62);line-height:1.6}.th-selected__chain{margin-top:14px;padding:12px;border:1px solid rgba(0,212,255,.16);background:rgba(0,212,255,.06);color:#bceeff}
                .th-action-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px}.th-card-action{padding:12px;border:1px solid rgba(95,116,170,.16);background:rgba(255,255,255,.02);color:#eef2ff;cursor:pointer}
                .th-card-action:hover{border-color:rgba(127,213,255,.36);background:rgba(127,213,255,.08)}.th-log{margin-top:16px;max-height:220px;overflow:auto;text-align:left;color:rgba(220,228,245,.86)}
                .th-finalize{margin-top:16px;width:100%}
                @media (max-width:1080px){.th-grid{grid-template-columns:1fr}.th-main{border-right:0;border-bottom:1px solid rgba(95,116,170,.12)}.th-panels,.th-overview-grid{grid-template-columns:1fr}}
                @media (max-width:720px){.th-header{padding:14px 18px}.th-main,.th-side{padding:18px}.th-action-grid{grid-template-columns:1fr}}
            </style>
            ${this.renderSharedPasswordLabThemeStyles()}
            ${this.renderSharedPasswordLabFrame({
                levelLabel: `// LEVEL ${String(this.mission.level || 0).padStart(2, '0')} - SOC CASEWORK`,
                title: 'ENTERPRISE THREAT<br>HUNT',
                status: 'SOC CASE ACTIVE',
                phases: [
                    { label: 'RECONSTRUCT', active: true },
                    { label: 'MARK CHAIN', active: this.threatMarkedEvents.size > 0 },
                    { label: 'CONTAIN', active: this.attempts > 0 }
                ],
                content: `
                    <div class="th-shell">
                        <div class="th-header">
                            <div class="th-brand">SHADOWDEF</div>
                            <div class="th-level">LEVEL ${this.mission.level} - ENTERPRISE THREAT HUNT</div>
                            <div class="th-status">SOC CASE ACTIVE</div>
                        </div>
                        <div class="th-hint-strip">HINT: Validate behavior across multiple logs before containing. Quiet intrusions look normal until the chain is reconstructed.</div>
                        <div class="th-grid">
                            <main class="th-main">
                                <div class="th-kicker">Case Overview</div>
                                <div class="th-overview">
                                    <div class="th-overview-grid">
                                        <div class="th-metric"><span>Vault Health</span><strong id="threat-vault-text">${Math.floor(this.threatVaultHealth)}%</strong><div class="th-bar"><div id="threat-vault-fill" style="width:${this.threatVaultHealth}%;"></div></div></div>
                                        <div class="th-metric"><span>System Integrity</span><strong id="threat-integrity-text">${Math.floor(this.threatSystemIntegrity)}%</strong><div class="th-bar"><div id="threat-integrity-fill" style="width:${this.threatSystemIntegrity}%;"></div></div></div>
                                        <div class="th-metric"><span>False Positives</span><strong id="threat-fp-text">${this.threatFalsePositiveCount}</strong></div>
                                        <div class="th-metric"><span>Attacker Progress</span><strong id="threat-progress-text">${this.threatAttackerProgress}</strong></div>
                                    </div>
                                    <div class="th-overview-grid" style="margin-top:12px;">
                                        <div class="th-metric"><span>Detected Links</span><strong>${threatSummary.detected}</strong></div>
                                        <div class="th-metric"><span>Contained Links</span><strong>${threatSummary.contained}</strong></div>
                                        <div class="th-metric"><span>Investigations</span><strong>${threatSummary.investigated}</strong></div>
                                        <div class="th-metric"><span>Marked Events</span><strong>${this.threatMarkedEvents.size}</strong></div>
                                    </div>
                                </div>
                                <div class="th-kicker" style="margin-top:18px;">Evidence Panels</div>
                                <div class="th-panels">${panelMarkup}</div>
                            </main>
                            <aside class="th-side">
                                <div class="th-kicker">Selected Evidence</div>
                                <div class="th-selected">
                                    ${selectedEvent ? `
                                        <div class="th-selected__title">${selectedEvent.action}</div>
                                        <div class="th-selected__meta">${selectedEvent.id} · ${selectedEvent.panelTitle}<br>${selectedEvent.timestamp} · ${selectedEvent.user} · ${selectedEvent.locationOrIP}</div>
                                        <div class="th-selected__chain">${selectedChain ? `<strong>${selectedChain.label}</strong><br>${selectedChain.explanation}` : 'No confirmed chain link yet. Investigate before you contain.'}</div>
                                        <div class="th-selected__meta" style="margin-top:12px;">Analyst read: ${selectedEvent.status === 'anomalous' ? 'Anomalous behavior with context to validate.' : 'Looks routine unless linked to a broader chain.'}</div>
                                        <div class="th-action-grid">${actionButtons}</div>
                                    ` : 'No evidence selected.'}
                                </div>
                                <div class="th-kicker" style="margin-top:16px;">Analyst Log</div>
                                <div class="th-log guess-feedback" id="guess-feedback">${logsHtml}</div>
                                <button class="btn btn-primary th-finalize" id="threat-finalize">FINALIZE HUNT</button>
                                <div id="attempt-counter" style="text-align:center;margin-top:16px;color:var(--text-secondary);">
                                    Investigation actions: <span style="color:var(--cyber-blue);">${this.attempts}</span>
                                </div>
                            </aside>
                        </div>
                    </div>`
            })}`;

        this.setupThreatHuntEventListeners();
        this.updateThreatHuntUI();
        this.startHumanLabMatrixAnimation();
        this.gameScreen.syncEmbeddedMissionHUD();
    }

    setupThreatHuntEventListeners() {
        document.querySelectorAll('[data-threat-event]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.threatSelectedEventId = btn.dataset.threatEvent;
                this.audio.playButtonClick();
                if (this.visualizerElement) this.renderThreatHuntSimulationPuzzle(this.visualizerElement);
            });
        });
        document.querySelectorAll('button[data-threat-action]').forEach(btn => {
            btn.addEventListener('click', () => {
                const actionId = btn.dataset.threatAction;
                const eventId = btn.dataset.eventId;
                if (actionId && eventId) this.handleThreatAction(actionId, eventId);
            });
        });
        document.getElementById('threat-finalize')?.addEventListener('click', () => this.finalizeThreatHunt());
    }

    handleThreatAction(actionId, eventId) {
        if (this.isComplete) return;
        const actionKey = `${eventId}:${actionId}`;
        if (this.threatActionHistory.has(actionKey)) {
            this.gameScreen.ui.showNotification('That action was already used on this event.', 'warning');
            return;
        }
        this.threatActionHistory.add(actionKey);
        this.attempts++; this.updateAttemptCounter(); this.gameScreen.updateAttempts(this.attempts);
        const chainEntry = this.getThreatChainEntryByEventId(eventId);
        const isMalicious = !!chainEntry;
        const rules = this.puzzleData.progressionLogic || {};
        const progressRules = rules.attackerProgressRules || {};
        const falseRules = rules.falsePositiveRules || {};
        const containment = rules.containmentEffects || {};

        const addFalsePositive = (drop = Number(falseRules.systemIntegrityDropPerFalsePositive || 8)) => {
            this.threatFalsePositiveCount += Number(falseRules.incorrectFlagIncrease || 1);
            this.threatSystemIntegrity = Math.max(0, this.threatSystemIntegrity - drop);
            this.appendThreatLog(rules.operationalFeedback?.falseAlert || 'False alert logged.');
        };
        const addAttackerProgress = () => { this.threatAttackerProgress += Number(progressRules.missedMaliciousEventIncrease || 1); };
        const markDetected = () => {
            if (!chainEntry) return;
            this.threatDetectedMajor.add(chainEntry.key);
            this.threatAttackerProgress = Math.max(0, this.threatAttackerProgress - Number(progressRules.correctMajorDetectionDecrease || 1));
        };

        if (actionId === 'mark_suspicious') { this.threatMarkedEvents.add(eventId); if (isMalicious) { markDetected(); this.appendThreatLog('Suspicious activity flagged.'); } else addFalsePositive(); }
        if (actionId === 'investigate') { this.threatInvestigatedEvents.add(eventId); if (isMalicious) { markDetected(); this.appendThreatLog(this.getThreatInvestigationMessage(chainEntry)); } else this.appendThreatLog(`Investigation complete for ${eventId}. No malicious chain evidence found.`); }
        if (actionId === 'isolate_account') { const canStop = isMalicious && (containment.isolateAccountStops || []).includes(chainEntry.key); if (canStop) { markDetected(); this.threatContainedMajor.add(chainEntry.key); this.appendThreatLog(`Containment applied: account isolation stopped ${chainEntry.label}.`); } else addFalsePositive(Number(falseRules.systemIntegrityDropOnWrongContainment || 10)); }
        if (actionId === 'block_ip') { const canStop = isMalicious && (containment.blockIPStops || []).includes(chainEntry.key); if (canStop) { markDetected(); this.threatContainedMajor.add(chainEntry.key); this.appendThreatLog(rules.operationalFeedback?.exportAlert || 'Data export attempt blocked.'); } else addFalsePositive(Number(falseRules.systemIntegrityDropOnWrongContainment || 10)); }
        if (actionId === 'ignore') { if (isMalicious) { addAttackerProgress(); this.appendThreatLog(`Ignored malicious signal (${eventId}). Attacker progression increased.`); } else this.appendThreatLog(`Ignored ${eventId}. No immediate risk confirmed.`); }

        this.applyThreatPassiveRisk();
        this.evaluateThreatCriticalEscalation();
        this.updateThreatHuntUI();
        if (!this.isComplete && this.visualizerElement) this.renderThreatHuntSimulationPuzzle(this.visualizerElement);
        this.evaluateThreatFailState();
    }

    getThreatChainEntryByEventId(eventId) {
        const chain = Array.isArray(this.puzzleData.hiddenAttackChain) ? this.puzzleData.hiddenAttackChain : [];
        return chain.find(s => Array.isArray(s.linkedEvidence) && s.linkedEvidence.includes(eventId)) || null;
    }

    getThreatInvestigationMessage(chainEntry) {
        if (!chainEntry) return 'Investigation did not confirm malicious behavior.';
        return `Investigate result: ${chainEntry.label}. ${chainEntry.explanation}`;
    }

    applyThreatPassiveRisk() {
        const passive = this.puzzleData.progressionLogic?.passiveRisk || {};
        if (!passive.enabledWhenUndetected) return;
        const cycle = Math.max(1, Number(passive.cycleTurns || 2));
        if (this.attempts % cycle !== 0 || this.threatAttackerProgress <= 0) return;
        this.threatVaultHealth = Math.max(0, this.threatVaultHealth - Number(passive.vaultHealthDropPerCycle || 4));
    }

    evaluateThreatCriticalEscalation() {
        const progressRules = this.puzzleData.progressionLogic?.attackerProgressRules || {};
        const critical = Number(progressRules.criticalThreshold || 5);
        if (this.threatAttackerProgress < critical) return;
        this.threatVaultHealth = Math.max(0, this.threatVaultHealth - Number(progressRules.rapidVaultDrainOnCritical || 12));
        this.appendThreatLog(this.puzzleData.progressionLogic?.operationalFeedback?.criticalEscalation || 'Warning: attacker progression critical.');
    }

    updateThreatHuntUI() {
        const vault = Math.max(0, Math.min(100, this.threatVaultHealth));
        const integrity = Math.max(0, Math.min(100, this.threatSystemIntegrity));
        const vaultText = document.getElementById('threat-vault-text'); if (vaultText) vaultText.textContent = `${Math.floor(vault)}%`;
        const vaultFill = document.getElementById('threat-vault-fill'); if (vaultFill) vaultFill.style.width = `${vault}%`;
        const intText = document.getElementById('threat-integrity-text'); if (intText) intText.textContent = `${Math.floor(integrity)}%`;
        const intFill = document.getElementById('threat-integrity-fill'); if (intFill) intFill.style.width = `${integrity}%`;
        const fpText = document.getElementById('threat-fp-text'); if (fpText) fpText.textContent = `${this.threatFalsePositiveCount}`;
        const progText = document.getElementById('threat-progress-text'); if (progText) progText.textContent = `${this.threatAttackerProgress}`;
    }

    appendThreatLog(message) {
        this.threatActivityLog.push(message);
        const feedback = document.getElementById('guess-feedback');
        if (!feedback) return;
        const line = document.createElement('div'); line.textContent = `• ${message}`;
        feedback.appendChild(line); feedback.scrollTop = feedback.scrollHeight;
    }

    evaluateThreatFailState() {
        const fail = this.puzzleData.failCondition?.any || [];
        const maxEscalation = Number(this.puzzleData.progressionLogic?.attackerProgressRules?.maxEscalation || 7);
        const failed = fail.some(rule => {
            const v = this.getThreatMetric(rule.metric, maxEscalation);
            if (rule.operator === '<=') return v <= Number(rule.value);
            if (rule.operator === '<') return v < Number(rule.value);
            if (rule.operator === '>=') return v >= Number(rule.value);
            return false;
        });
        if (failed) this.finishThreatHunt(false);
    }

    finalizeThreatHunt() {
        if (this.isComplete) return;
        this.evaluateThreatFailState();
        if (this.isComplete) return;
        const win = this.puzzleData.winCondition || {};
        const minContained = Number(win.majorMaliciousEventsContainedMin || 3);
        const vaultMin = Number(win.vaultHealthAbovePercent || 30);
        const maxEscalation = Number(this.puzzleData.progressionLogic?.attackerProgressRules?.maxEscalation || 7);
        this.finishThreatHunt(
            this.threatContainedMajor.size >= minContained &&
            this.threatVaultHealth > vaultMin &&
            this.threatAttackerProgress < maxEscalation
        );
    }

    finishThreatHunt(success) {
        if (this.isComplete) return;
        this.isComplete = true;
        const summary = this.puzzleData.educationalSummary || {};
        const feedback = document.getElementById('guess-feedback');
        const ops = this.getThreatOperationsSummary();
        if (feedback) {
            feedback.innerHTML += this.renderMissionDebrief({
                tone: success ? 'success' : 'error',
                title: summary.reveal || (success ? 'Intrusion path contained' : 'Intrusion path escaped containment'),
                summary: summary.message || '',
                details: [
                    `Detected malicious links: ${ops.detected}`,
                    `Contained malicious links: ${ops.contained}`,
                    `False positives: ${this.threatFalsePositiveCount}`,
                    `Attacker progress: ${this.threatAttackerProgress}`
                ],
                insight: this.mission.knowledgeSummary?.insight || ''
            });
        }
        if (success) {
            this.audio.playSuccess(); this.gameScreen.ui.flashScreen('rgba(0,255,65,0.2)', 300);
            this.gameScreen.ui.showNotification(this.mission.successFeedback || 'Threat hunt complete.', 'success');
            setTimeout(() => this.gameScreen.completePuzzle(true), 1200);
        } else {
            this.audio.playFailure(); this.gameScreen.ui.flashScreen('rgba(255,0,110,0.2)', 300);
            this.gameScreen.ui.showNotification(this.mission.failureFeedback || 'Threat hunt failed.', 'error');
            setTimeout(() => this.gameScreen.completePuzzle(false), 1200);
        }
    }

    getThreatMetric(metric, maxEscalation) {
        if (metric === 'vaultHealth') return this.threatVaultHealth;
        if (metric === 'systemIntegrity') return this.threatSystemIntegrity;
        if (metric === 'attackerProgress') return this.threatAttackerProgress;
        if (metric === 'maxEscalation') return maxEscalation;
        return 0;
    }

    getThreatEvidencePanels() {
        return Array.isArray(this.puzzleData.evidencePanels) ? this.puzzleData.evidencePanels : [];
    }

    getThreatEvidenceEntries() {
        return this.getThreatEvidencePanels().flatMap((panel, index) =>
            (panel.entries || []).map(entry => ({
                ...entry,
                panelId: panel.id,
                panelTitle: panel.title,
                panelColumn: Number(panel.column || ((index % 2) + 1))
            }))
        );
    }

    getThreatEvidenceDetail(eventId) {
        const entry = this.getThreatEvidenceEntries().find(item => item.id === eventId);
        if (!entry) return null;
        const detailMap = this.puzzleData.evidenceDetails || {};
        const detail = detailMap[eventId] || {};
        return {
            ...entry,
            title: detail.title || entry.action,
            highlight: detail.highlight || 'Evidence packet loaded.',
            body: detail.body || 'No analyst context attached.',
            analyst: detail.analyst || 'Analyst read unavailable.',
            suspicious: typeof detail.suspicious === 'boolean' ? detail.suspicious : entry.status !== 'normal'
        };
    }

    getThreatCorrectChain() {
        return Array.isArray(this.puzzleData.correctChain) ? this.puzzleData.correctChain : [];
    }

    getThreatContainmentConfig() {
        return this.puzzleData.containmentOptions || {};
    }

    getThreatCaseworkSummary() {
        const correctFlags = Array.from(this.threatMarkedEvents).filter(id => this.getThreatEvidenceDetail(id)?.suspicious).length;
        return {
            marked: this.threatMarkedEvents.size,
            correctFlags,
            investigated: this.threatInvestigatedEvents.size,
            chainLinks: this.getThreatCorrectChain().length,
            chainValidated: this.threatChainValidated,
            contained: this.threatContainmentResolved
        };
    }

    adjustThreatScore(points) {
        const value = Number(points || 0);
        if (!value) return;
        if (value > 0) this.gameScreen.game.score.addPoints(value);
        else this.gameScreen.game.score.subtractPoints(Math.abs(value));
        this.gameScreen.updateScore();
    }

    setThreatPhase(phase) {
        if (this.isComplete || this.threatContainmentResolved) return;
        this.threatCasePhase = Math.max(1, Math.min(3, Number(phase || 1)));
        this.rerenderThreatHuntSimulation();
    }

    renderThreatHuntSimulationPuzzle(container) {
        this.visualizerElement = container;
        const panels = this.getThreatEvidencePanels();
        const entries = this.getThreatEvidenceEntries();
        if (!this.threatSelectedEventId && entries[0]) this.threatSelectedEventId = entries[0].id;

        const selectedEvent = this.getThreatEvidenceDetail(this.threatSelectedEventId) || null;
        const summary = this.getThreatCaseworkSummary();
        const logsHtml = this.threatActivityLog.length
            ? this.threatActivityLog.map(item => {
                const entry = typeof item === 'string' ? { message: item, tone: 'info' } : item;
                return `<div class="thx-log-line ${entry.tone || 'info'}">> ${entry.message}</div>`;
            }).join('')
            : '<div class="thx-log-line info">> SOC case initialized. Review the evidence panels before you act.</div>';

        const panelColumns = [1, 2].map(column =>
            panels.filter((panel, index) => Number(panel.column || ((index % 2) + 1)) === column)
        );
        const badgeClass = (status = 'normal') => status === 'critical' ? 'critical' : status === 'anomalous' ? 'anomalous' : 'normal';
        const buildEvidenceCard = (entry) => {
            const detail = this.getThreatEvidenceDetail(entry.id);
            const tags = [];
            if (this.threatMarkedEvents.has(entry.id)) tags.push(detail?.suspicious ? 'THREAT FLAGGED' : 'FALSE POSITIVE');
            if (this.threatInvestigatedEvents.has(entry.id)) tags.push('INVESTIGATED');
            return `
                <button class="thx-card ${this.threatSelectedEventId === entry.id ? 'selected' : ''} ${this.threatMarkedEvents.has(entry.id) ? (detail?.suspicious ? 'flagged' : 'benign') : ''}" data-threat-event="${entry.id}" type="button">
                    <div class="thx-row"><span class="thx-mono">${entry.id}</span><span class="thx-badge ${badgeClass(entry.status)}">${String(entry.status || 'normal').toUpperCase()}</span></div>
                    <div class="thx-title">${entry.action}</div>
                    <div class="thx-meta">${entry.timestamp} · ${entry.user} · ${entry.locationOrIP}</div>
                    ${tags.length ? `<div class="thx-tags">${tags.map(tag => `<span>${tag}</span>`).join('')}</div>` : ''}
                </button>`;
        };
        const panelMarkup = panelColumns.map(columnPanels => `
            <div class="thx-stack">
                ${columnPanels.map(panel => `
                    <section class="thx-panel">
                        <div class="thx-row thx-panel-head"><strong>${panel.title}</strong><span class="thx-mono">${(panel.entries || []).length} EVENTS</span></div>
                        <div class="thx-list">${(panel.entries || []).map(buildEvidenceCard).join('')}</div>
                    </section>`).join('')}
            </div>`).join('');
        const detailMarkup = selectedEvent ? `
            <div class="thx-kicker">Selected Evidence</div>
            <div class="thx-detail-title">${selectedEvent.title}</div>
            <div class="thx-meta">${selectedEvent.id} · ${selectedEvent.panelTitle}<br>${selectedEvent.timestamp} · ${selectedEvent.user} · ${selectedEvent.locationOrIP}</div>
            <div class="thx-highlight">${selectedEvent.highlight}</div>
            <div class="thx-body-copy">${selectedEvent.body}</div>
            <div class="thx-note-box">${selectedEvent.analyst}</div>
            <div class="thx-actions">
                <button class="thx-btn danger" data-threat-action="mark_suspicious" data-event-id="${selectedEvent.id}" type="button" ${this.threatMarkedEvents.has(selectedEvent.id) || this.isComplete || this.threatContainmentResolved ? 'disabled' : ''}>${this.threatMarkedEvents.has(selectedEvent.id) ? 'Flagged' : 'Mark Suspicious'}</button>
                <button class="thx-btn success" data-threat-action="investigate" data-event-id="${selectedEvent.id}" type="button" ${this.threatInvestigatedEvents.has(selectedEvent.id) || this.isComplete || this.threatContainmentResolved ? 'disabled' : ''}>${this.threatInvestigatedEvents.has(selectedEvent.id) ? 'Investigated' : 'Investigate'}</button>
            </div>`
            : '<div class="thx-empty">Select an evidence card to inspect the case details.</div>';
        const chainMarkup = entries.map(entry => {
            const index = this.threatChainSelection.indexOf(entry.id);
            return `
                <button class="thx-card ${index >= 0 ? 'selected' : ''}" data-threat-chain="${entry.id}" type="button" ${this.isComplete ? 'disabled' : ''}>
                    ${index >= 0 ? `<span class="thx-order">${index + 1}</span>` : ''}
                    <div class="thx-row"><span class="thx-mono">${entry.id}</span><span class="thx-badge ${badgeClass(entry.status)}">${String(entry.status || 'normal').toUpperCase()}</span></div>
                    <div class="thx-title">${entry.action}</div>
                    <div class="thx-meta">${entry.panelTitle} · ${entry.timestamp} · ${entry.user}</div>
                </button>`;
        }).join('');
        const chainResult = this.threatChainValidationResult ? `<div class="thx-result ${this.threatChainValidationResult.tone}">${this.threatChainValidationResult.message}</div>` : '';
        const containment = this.getThreatContainmentConfig();
        const options = (items, selected) => (Array.isArray(items) ? items : []).map(option => {
            const value = typeof option === 'string' ? option : option.value;
            const label = typeof option === 'string' ? option : option.label;
            return `<option value="${value}" ${selected === value ? 'selected' : ''}>${label}</option>`;
        }).join('');
        const containmentResult = this.threatContainmentResult ? `<div class="thx-result ${this.threatContainmentResult.tone}">${this.threatContainmentResult.message}</div>` : '';

        container.innerHTML = `
            <style>
                .thx-shell{padding:24px;display:grid;gap:16px}.thx-brief,.thx-nav,.thx-phase,.thx-panel,.thx-detail,.thx-log{background:rgba(2,10,24,.68);border:1px solid rgba(23,216,255,.14);box-shadow:0 20px 48px rgba(0,0,0,.24);backdrop-filter:blur(12px)}
                .thx-kicker,.thx-mono,.thx-navbtn,.thx-log-line{font-family:'Share Tech Mono',monospace;letter-spacing:.18em;text-transform:uppercase}.thx-kicker{font-size:.68rem;color:rgba(23,216,255,.72)}.thx-row{display:flex;justify-content:space-between;gap:10px;align-items:center}.thx-meta{font-size:.82rem;line-height:1.6;color:rgba(168,216,232,.58)}.thx-title{margin-top:10px;font-weight:700;line-height:1.45;color:#eef7ff}
                .thx-brief,.thx-panel,.thx-detail,.thx-log,.thx-phase{padding:16px}.thx-brief-grid,.thx-summary,.thx-chain-grid,.thx-form-grid,.thx-actions{display:grid;gap:12px}.thx-brief-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.thx-brief-card{padding:12px;border:1px solid rgba(23,216,255,.1);background:rgba(255,255,255,.02);display:grid;gap:8px}.thx-brief-card strong{line-height:1.6;color:#eef7ff}
                .thx-nav{padding:14px 16px;display:flex;flex-wrap:wrap;align-items:center;gap:12px}.thx-tabs{display:flex;flex-wrap:wrap;gap:10px}.thx-navbtn,.thx-btn,.thx-primary{padding:10px 14px;border:1px solid rgba(23,216,255,.22);background:rgba(23,216,255,.06);color:#eef7ff;cursor:pointer;font-size:.72rem}.thx-navbtn.active{border-color:#17d8ff;background:rgba(23,216,255,.12)}.thx-navbtn.done{border-color:rgba(0,255,136,.28);color:#8ff5c8}.thx-summary{margin-left:auto;grid-template-columns:repeat(4,minmax(110px,1fr))}.thx-chip{padding:10px 12px;border:1px solid rgba(23,216,255,.12);background:rgba(255,255,255,.02);display:grid;gap:4px}.thx-chip strong{font-family:'Bebas Neue',sans-serif;font-size:1.35rem;line-height:1;color:#eef7ff}
                .thx-phase{display:none}.thx-phase.active{display:block}.thx-heading{font-size:.72rem;letter-spacing:.18em;text-transform:uppercase;color:rgba(23,216,255,.72);margin-bottom:16px}.thx-evidence{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr) minmax(290px,340px);gap:16px;align-items:start}.thx-stack,.thx-list{display:grid;gap:12px}.thx-card{position:relative;padding:12px;border:1px solid rgba(23,216,255,.1);background:rgba(255,255,255,.02);text-align:left;color:#eef7ff;cursor:pointer;transition:border-color .2s ease,background .2s ease,transform .2s ease}.thx-card:hover{border-color:rgba(23,216,255,.34);background:rgba(23,216,255,.06);transform:translateY(-1px)}.thx-card.selected{border-color:#17d8ff;background:rgba(23,216,255,.08)}.thx-card.flagged{border-color:rgba(255,79,139,.34)}.thx-card.benign{border-color:rgba(0,224,144,.3)}
                .thx-badge{display:inline-flex;padding:3px 8px;border:1px solid;font-size:.62rem}.thx-badge.normal{color:#00e090;border-color:rgba(0,224,144,.28);background:rgba(0,224,144,.06)}.thx-badge.anomalous{color:#ffd600;border-color:rgba(255,214,0,.28);background:rgba(255,214,0,.06)}.thx-badge.critical{color:#ff4f8b;border-color:rgba(255,79,139,.28);background:rgba(255,79,139,.06)}.thx-tags{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}.thx-tags span{display:inline-flex;padding:4px 8px;border:1px solid rgba(23,216,255,.14);background:rgba(23,216,255,.07);color:#8beeff;font-size:.68rem}.thx-panel-head strong,.thx-detail-title{color:#eef7ff}
                .thx-detail-title{font-family:'Orbitron',sans-serif;font-size:1.1rem;line-height:1.35}.thx-highlight{padding:12px;border-left:3px solid #17d8ff;background:rgba(23,216,255,.07);color:#17d8ff;font-weight:700}.thx-body-copy{line-height:1.7;color:rgba(225,239,248,.8)}.thx-note-box{padding:12px;border:1px solid rgba(23,216,255,.12);background:rgba(255,255,255,.02);font-size:.8rem;line-height:1.7;color:rgba(168,216,232,.68)}.thx-actions{grid-template-columns:1fr 1fr;margin-top:auto}.thx-btn.danger{border-color:rgba(255,79,139,.3);color:#ff9fbe;background:rgba(255,79,139,.08)}.thx-btn.success{border-color:rgba(0,224,144,.28);color:#8ff5c8;background:rgba(0,224,144,.08)}.thx-btn:disabled,.thx-primary:disabled,.thx-navbtn:disabled,.thx-card:disabled{opacity:.42;cursor:not-allowed;transform:none}
                .thx-empty{display:flex;align-items:center;justify-content:center;min-height:240px;text-align:center;color:rgba(168,216,232,.46);font-family:'Share Tech Mono',monospace;font-size:.8rem;letter-spacing:.12em;text-transform:uppercase}.thx-chain-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.thx-order{position:absolute;top:10px;right:10px;font-family:'Bebas Neue',sans-serif;font-size:1.3rem;color:#17d8ff}.thx-foot{display:flex;flex-wrap:wrap;align-items:center;gap:12px;margin-top:16px}.thx-result{margin-top:16px;padding:14px 16px;border:1px solid;font-family:'Share Tech Mono',monospace;font-size:.76rem;line-height:1.7}.thx-result.ok{border-color:rgba(0,224,144,.34);background:rgba(0,224,144,.08);color:#8ff5c8}.thx-result.fail{border-color:rgba(255,214,0,.34);background:rgba(255,214,0,.08);color:#ffe97c}.thx-result.err{border-color:rgba(255,79,139,.34);background:rgba(255,79,139,.08);color:#ff9fbe}
                .thx-form-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.thx-field{display:grid;gap:10px}.thx-select{width:100%;padding:12px 14px;border:1px solid rgba(23,216,255,.18);background:rgba(255,255,255,.03);color:#eef7ff;font-family:'Share Tech Mono',monospace}.thx-select option{background:#07111d;color:#eef7ff}.thx-log{display:flex;flex-direction:column;gap:12px;min-height:220px}.thx-log-body{flex:1;min-height:180px;max-height:260px;overflow:auto;margin:0;padding-right:4px}.thx-log-line{font-size:.74rem;line-height:1.7;color:rgba(225,239,248,.78);margin-bottom:8px}.thx-log-line.good{color:#8ff5c8}.thx-log-line.bad{color:#ff9fbe}.thx-log-line.warn{color:#ffe97c}.thx-log-line.info{color:#8beeff}
                @media (max-width:1320px){.thx-brief-grid,.thx-summary,.thx-chain-grid,.thx-form-grid,.thx-actions{grid-template-columns:1fr}.thx-evidence{grid-template-columns:1fr}}
                @media (max-width:760px){.thx-shell{padding:16px}.thx-nav{padding:12px}.thx-phase,.thx-panel,.thx-detail,.thx-log{padding:14px}}
            </style>
            ${this.renderSharedPasswordLabThemeStyles()}
            ${this.renderSharedPasswordLabFrame({
                levelLabel: `// LEVEL ${String(this.mission.level || 0).padStart(2, '0')} - SOC CASEWORK`,
                title: 'ENTERPRISE THREAT<br>HUNT',
                status: 'SOC CASE ACTIVE',
                phases: [
                    { label: 'RECONSTRUCT', active: this.threatCasePhase === 1, done: summary.marked > 0 || summary.investigated > 0 },
                    { label: 'MARK CHAIN', active: this.threatCasePhase === 2, done: this.threatChainValidated },
                    { label: 'CONTAIN', active: this.threatCasePhase === 3, done: this.threatContainmentResolved }
                ],
                content: `
                    <div class="thx-shell">
                        <section class="thx-brief">
                            <div class="thx-kicker">Command Brief</div>
                            <div class="thx-brief-grid">
                                <div class="thx-brief-card"><div class="thx-kicker">Objective</div><strong>${this.mission.objective || ''}</strong></div>
                                <div class="thx-brief-card"><div class="thx-kicker">Scenario</div><strong>${this.mission.scenario || ''}</strong></div>
                                <div class="thx-brief-card"><div class="thx-kicker">Task</div><strong>${this.mission.userTask || ''}</strong></div>
                            </div>
                        </section>
                        <section class="thx-nav">
                            <div class="thx-tabs">
                                <button class="thx-navbtn ${this.threatCasePhase === 1 ? 'active' : ''} ${summary.marked || summary.investigated ? 'done' : ''}" data-threat-phase="1" type="button">01 Reconstruct</button>
                                <button class="thx-navbtn ${this.threatCasePhase === 2 ? 'active' : ''} ${this.threatChainValidated ? 'done' : ''}" data-threat-phase="2" type="button">02 Mark Chain</button>
                                <button class="thx-navbtn ${this.threatCasePhase === 3 ? 'active' : ''} ${this.threatContainmentResolved ? 'done' : ''}" data-threat-phase="3" type="button">03 Contain</button>
                            </div>
                            <div class="thx-summary">
                                <div class="thx-chip"><span class="thx-kicker">Flagged</span><strong>${summary.marked}</strong></div>
                                <div class="thx-chip"><span class="thx-kicker">Investigated</span><strong>${summary.investigated}</strong></div>
                                <div class="thx-chip"><span class="thx-kicker">Chain</span><strong>${this.threatChainSelection.length}/${summary.chainLinks}</strong></div>
                                <div class="thx-chip"><span class="thx-kicker">Status</span><strong>${this.threatContainmentResolved ? 'LOCKED' : this.threatChainValidated ? 'READY' : 'OPEN'}</strong></div>
                            </div>
                        </section>
                        <section class="thx-phase ${this.threatCasePhase === 1 ? 'active' : ''}">
                            <div class="thx-heading">// 01 RECONSTRUCT - INSPECT THE CASE DATA, FLAG THREATS, AND INVESTIGATE BEFORE YOU ESCALATE.</div>
                            <div class="thx-evidence">${panelMarkup}<aside class="thx-detail">${detailMarkup}</aside></div>
                        </section>
                        <section class="thx-phase ${this.threatCasePhase === 2 ? 'active' : ''}">
                            <div class="thx-heading">// 02 MARK CHAIN - SELECT THE EVENTS THAT FORM THE REAL ATTACK SEQUENCE.</div>
                            <div class="thx-chain-grid">${chainMarkup}</div>
                            <div class="thx-foot">
                                <button class="thx-primary" id="threat-validate-chain" type="button" ${this.isComplete || this.threatChainValidated || this.threatContainmentResolved ? 'disabled' : ''}>Validate Chain</button>
                                <span class="thx-mono">${this.threatChainSelection.length} selected</span>
                                ${this.threatChainValidated ? '<button class="thx-primary" data-threat-phase="3" type="button">Proceed to Containment</button>' : ''}
                            </div>
                            ${chainResult}
                        </section>
                        <section class="thx-phase ${this.threatCasePhase === 3 ? 'active' : ''}">
                            <div class="thx-heading">// 03 CONTAIN - APPLY THE CORRECT RESPONSE PLAN TO THE COMPROMISED ACCOUNT AND HOSTILE IP.</div>
                            <div class="thx-form-grid">
                                <div class="thx-field"><label class="thx-kicker" for="threat-account">Compromised Account</label><select class="thx-select" id="threat-account" data-threat-select="account" ${this.isComplete ? 'disabled' : ''}><option value=\"\">-- SELECT ACCOUNT --</option>${options(containment.accountOptions, this.threatContainmentSelection.account)}</select></div>
                                <div class="thx-field"><label class="thx-kicker" for="threat-action">Response Action</label><select class="thx-select" id="threat-action" data-threat-select="action" ${this.isComplete ? 'disabled' : ''}><option value=\"\">-- SELECT ACTION --</option>${options(containment.actionOptions, this.threatContainmentSelection.action)}</select></div>
                                <div class="thx-field"><label class="thx-kicker" for="threat-ip">Block External IP</label><select class="thx-select" id="threat-ip" data-threat-select="ip" ${this.isComplete ? 'disabled' : ''}><option value=\"\">-- SELECT IP --</option>${options(containment.ipOptions, this.threatContainmentSelection.ip)}</select></div>
                                <div class="thx-field"><label class="thx-kicker" for="threat-escalate">Escalate To</label><select class="thx-select" id="threat-escalate" data-threat-select="escalate" ${this.isComplete ? 'disabled' : ''}><option value=\"\">-- SELECT TEAM --</option>${options(containment.escalateOptions, this.threatContainmentSelection.escalate)}</select></div>
                            </div>
                            <div class="thx-foot">
                                <button class="thx-primary" id="threat-submit-containment" type="button" ${this.isComplete || !this.threatChainValidated || this.threatContainmentResolved ? 'disabled' : ''}>Execute Containment</button>
                                <span class="thx-mono">${this.threatChainValidated ? 'Attack chain verified.' : 'Validate phase 2 before containment.'}</span>
                            </div>
                            ${containmentResult}
                        </section>
                        <section class="thx-log">
                            <div class="thx-kicker">Command Log</div>
                            <div class="thx-log-body guess-feedback" id="guess-feedback">${logsHtml}</div>
                            <div id="attempt-counter" style="text-align:center;color:var(--text-secondary);">Case submissions: <span style="color:var(--cyber-blue);">${this.attempts}</span> / ${this.maxAttempts}</div>
                        </section>
                    </div>`
            })}`;

        this.setupThreatHuntEventListeners();
        this.startHumanLabMatrixAnimation();
        this.gameScreen.syncEmbeddedMissionHUD();
    }

    setupThreatHuntEventListeners() {
        document.querySelectorAll('[data-threat-event]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.threatSelectedEventId = btn.dataset.threatEvent || null;
                this.audio.playButtonClick();
                this.rerenderThreatHuntSimulation({
                    primarySelector: '__root__',
                    anchorSelector: `[data-threat-event="${btn.dataset.threatEvent}"]`
                });
            });
        });

        document.querySelectorAll('[data-threat-phase]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.audio.playButtonClick();
                this.setThreatPhase(btn.dataset.threatPhase);
            });
        });

        document.querySelectorAll('[data-threat-action]').forEach(btn => {
            btn.addEventListener('click', () => {
                const actionId = btn.dataset.threatAction;
                const eventId = btn.dataset.eventId;
                if (actionId && eventId) this.handleThreatAction(actionId, eventId);
            });
        });

        document.querySelectorAll('[data-threat-chain]').forEach(btn => {
            btn.addEventListener('click', () => {
                const eventId = btn.dataset.threatChain;
                if (eventId) this.handleThreatChainToggle(eventId);
            });
        });

        document.getElementById('threat-validate-chain')?.addEventListener('click', () => this.validateThreatChain());

        document.querySelectorAll('select[data-threat-select]').forEach(select => {
            select.addEventListener('change', () => {
                this.updateThreatContainmentSelection(select.dataset.threatSelect, select.value);
            });
        });

        document.getElementById('threat-submit-containment')?.addEventListener('click', () => this.submitThreatContainment());
    }

    handleThreatAction(actionId, eventId) {
        if (this.isComplete || this.threatContainmentResolved) return;
        const detail = this.getThreatEvidenceDetail(eventId);
        if (!detail) return;

        if (actionId === 'mark_suspicious') {
            if (this.threatMarkedEvents.has(eventId)) {
                this.gameScreen.ui.showNotification('That evidence is already flagged.', 'warning');
                return;
            }
            this.threatMarkedEvents.add(eventId);
            const points = detail.suspicious
                ? Number(this.puzzleData.scoring?.markCorrect || 150)
                : Number(this.puzzleData.scoring?.markIncorrect || -100);
            this.adjustThreatScore(points);
            this.appendThreatLog(
                detail.suspicious
                    ? `${eventId} flagged as suspicious. Good catch on the malicious clue.`
                    : `${eventId} flagged, but the evidence appears benign.`,
                detail.suspicious ? 'good' : 'bad'
            );
            this.audio.playButtonClick();
            this.rerenderThreatHuntSimulation({
                primarySelector: '__root__',
                anchorSelector: `[data-threat-event="${eventId}"]`
            });
            return;
        }

        if (actionId === 'investigate') {
            if (this.threatInvestigatedEvents.has(eventId)) {
                this.gameScreen.ui.showNotification('That evidence has already been investigated.', 'warning');
                return;
            }
            this.threatInvestigatedEvents.add(eventId);
            this.adjustThreatScore(Number(this.puzzleData.scoring?.investigate || 30));
            this.appendThreatLog(`${eventId} investigated. ${detail.analyst}`, detail.suspicious ? 'warn' : 'info');
            this.audio.playButtonClick();
            this.rerenderThreatHuntSimulation({
                primarySelector: '__root__',
                anchorSelector: `[data-threat-event="${eventId}"]`
            });
        }
    }

    handleThreatChainToggle(eventId) {
        if (this.isComplete || this.threatContainmentResolved) return;
        if (this.threatChainValidated) {
            this.gameScreen.ui.showNotification('Attack chain already validated.', 'info');
            return;
        }

        const index = this.threatChainSelection.indexOf(eventId);
        if (index >= 0) this.threatChainSelection.splice(index, 1);
        else this.threatChainSelection.push(eventId);

        this.audio.playButtonClick();
        this.rerenderThreatHuntSimulation({
            primarySelector: '__root__',
            anchorSelector: `[data-threat-chain="${eventId}"]`
        });
    }

    validateThreatChain() {
        if (this.isComplete || this.threatContainmentResolved) return;
        if (this.threatChainValidated) {
            this.gameScreen.ui.showNotification('Attack chain already validated.', 'info');
            return;
        }
        if (!this.threatChainSelection.length) {
            this.gameScreen.ui.showNotification('Select the attack-chain evidence first.', 'warning');
            return;
        }

        this.attempts++;
        this.updateAttemptCounter();
        this.gameScreen.updateAttempts(this.attempts);

        const correctChain = this.getThreatCorrectChain();
        const matched = JSON.stringify(correctChain.slice().sort()) === JSON.stringify(this.threatChainSelection.slice().sort());

        if (matched) {
            const points = Number(this.puzzleData.scoring?.chainCorrect || 400);
            this.threatChainValidated = true;
            this.threatCasePhase = 3;
            this.threatChainValidationResult = {
                tone: 'ok',
                message: `// CHAIN VALIDATED - ATTACK SEQUENCE RECONSTRUCTED. +${points} PTS. PROCEED TO CONTAINMENT.`
            };
            this.adjustThreatScore(points);
            this.appendThreatLog('Attack chain validated. Proceed to containment.', 'good');
            this.audio.playSuccess();
        } else {
            const missed = correctChain.filter(id => !this.threatChainSelection.includes(id)).length;
            const extra = this.threatChainSelection.filter(id => !correctChain.includes(id)).length;
            const penalty = Math.abs(Number(this.puzzleData.scoring?.chainIncorrect || -150));
            this.threatChainValidationResult = {
                tone: 'fail',
                message: `// CHAIN MISMATCH - ${missed} MISSED, ${extra} FALSE POSITIVES. -${penalty} PTS. REVIEW THE EVIDENCE.`
            };
            this.adjustThreatScore(-penalty);
            this.appendThreatLog(`Attack chain mismatch. ${missed} malicious clue(s) missed and ${extra} false positive(s) added.`, 'bad');
            this.audio.playFailure();
        }

        this.rerenderThreatHuntSimulation({ primarySelector: '__root__' });
    }

    updateThreatContainmentSelection(field, value) {
        if (!field) return;
        this.threatContainmentSelection = {
            ...this.threatContainmentSelection,
            [field]: value
        };
    }

    submitThreatContainment() {
        if (this.isComplete || this.threatContainmentResolved) return;

        if (!this.threatChainValidated) {
            this.threatContainmentResult = {
                tone: 'err',
                message: '// ATTACK CHAIN NOT VERIFIED - VALIDATE PHASE 2 BEFORE CONTAINMENT.'
            };
            this.audio.playFailure();
            this.rerenderThreatHuntSimulation({ primarySelector: '__root__' });
            return;
        }

        const selection = this.threatContainmentSelection || {};
        if (!selection.account || !selection.action || !selection.ip || !selection.escalate) {
            this.threatContainmentResult = {
                tone: 'err',
                message: '// INCOMPLETE - SELECT EVERY CONTAINMENT OPTION BEFORE EXECUTING.'
            };
            this.audio.playFailure();
            this.rerenderThreatHuntSimulation({ primarySelector: '__root__' });
            return;
        }

        this.attempts++;
        this.updateAttemptCounter();
        this.gameScreen.updateAttempts(this.attempts);

        const config = this.getThreatContainmentConfig();
        const solution = config.solution || {};
        const accountOk = selection.account === solution.account;
        const actionOk = Array.isArray(solution.actions) ? solution.actions.includes(selection.action) : selection.action === solution.action;
        const ipOk = selection.ip === solution.ip;
        const escalateOk = Array.isArray(solution.escalate) ? solution.escalate.includes(selection.escalate) : selection.escalate === solution.escalate;
        const correctCount = [accountOk, actionOk, ipOk, escalateOk].filter(Boolean).length;

        if (correctCount === 4) {
            const points = Number(this.puzzleData.scoring?.containmentSuccess || 600);
            this.threatContainmentResolved = true;
            this.threatContainmentResult = {
                tone: 'ok',
                message: `// CONTAINMENT EXECUTED - ALL SYSTEMS SECURED. THREAT ACTOR LOCKED OUT. +${points} PTS.`
            };
            this.adjustThreatScore(points);
            this.appendThreatLog('Containment executed successfully. The hostile account path and exfiltration route are shut down.', 'good');
            this.audio.playSuccess();
            this.rerenderThreatHuntSimulation({ primarySelector: '__root__' });
            this.clearThreatCompletionTimer();
            this.threatCompletionTimerId = setTimeout(() => {
                this.threatCompletionTimerId = null;
                this.finishThreatHunt(true);
            }, 1200);
            return;
        }

        if (correctCount >= 2) {
            const penalty = Math.abs(Number(this.puzzleData.scoring?.containmentPartial || -100));
            this.threatContainmentResult = {
                tone: 'fail',
                message: `// PARTIAL CONTAINMENT (${correctCount}/4 CORRECT) - THREAT NOT FULLY NEUTRALIZED. -${penalty} PTS.`
            };
            this.adjustThreatScore(-penalty);
            this.appendThreatLog(`Containment only partially landed (${correctCount}/4 correct). Review the compromised account and hostile IP choices.`, 'warn');
            this.audio.playFailure();
        } else {
            const penalty = Math.abs(Number(this.puzzleData.scoring?.containmentFailure || -200));
            this.threatContainmentResult = {
                tone: 'err',
                message: `// CONTAINMENT FAILED - INCORRECT RESPONSE PLAN. ATTACKER MAY STILL HAVE ACCESS. -${penalty} PTS.`
            };
            this.adjustThreatScore(-penalty);
            this.appendThreatLog('Containment failed. The selected response would leave the attacker path open.', 'bad');
            this.audio.playFailure();
        }

        this.rerenderThreatHuntSimulation({ primarySelector: '__root__' });
    }

    appendThreatLog(message, tone = 'info') {
        const entry = { message, tone };
        this.threatActivityLog = [entry, ...this.threatActivityLog].slice(0, 36);
        const feedback = document.getElementById('guess-feedback');
        if (!feedback) return;

        const line = document.createElement('div');
        line.className = `thx-log-line ${tone}`.trim();
        line.textContent = `> ${message}`;
        feedback.prepend(line);

        while (feedback.children.length > 36) {
            feedback.removeChild(feedback.lastChild);
        }
    }

    finishThreatHunt(success) {
        if (this.isComplete) return;
        this.isComplete = true;
        this.clearThreatCompletionTimer();

        const summary = this.puzzleData.educationalSummary || {};
        const feedback = document.getElementById('guess-feedback');
        const caseSummary = this.getThreatCaseworkSummary();
        if (feedback) {
            feedback.innerHTML += this.renderMissionDebrief({
                tone: success ? 'success' : 'error',
                title: summary.reveal || (success ? 'SOC case closed' : 'SOC case unresolved'),
                summary: summary.message || '',
                details: [
                    `Suspicious events flagged: ${caseSummary.marked}`,
                    `Evidence investigated: ${caseSummary.investigated}`,
                    `Attack chain validated: ${this.threatChainValidated ? 'Yes' : 'No'}`,
                    `Containment response: ${this.threatContainmentResolved ? 'Precise' : 'Incomplete'}`
                ],
                insight: this.mission.knowledgeSummary?.insight || ''
            });
        }

        if (success) {
            this.audio.playSuccess();
            this.gameScreen.ui.flashScreen('rgba(0,255,65,0.2)', 300);
            this.gameScreen.ui.showNotification(this.mission.successFeedback || 'Threat hunt complete.', 'success');
            this.threatCompletionTimerId = setTimeout(() => {
                this.threatCompletionTimerId = null;
                this.gameScreen.completePuzzle(true);
            }, 1300);
        } else {
            this.audio.playFailure();
            this.gameScreen.ui.flashScreen('rgba(255,0,110,0.2)', 300);
            this.gameScreen.ui.showNotification(this.mission.failureFeedback || 'Threat hunt failed.', 'error');
            this.threatCompletionTimerId = setTimeout(() => {
                this.threatCompletionTimerId = null;
                this.gameScreen.completePuzzle(false);
            }, 1300);
        }
    }

    syncEmbeddedMissionHUD() {
        if (this.interactionMode === 'liveDefenseSimulation') {
            const waves = this.getLiveDefenseWaves();
            const totalWaves = Math.max(1, waves.length);
            const visibleWave = Math.min(totalWaves, Math.max(1, this.liveWaveIndex + 1));
            const timerEl = document.getElementById('l1-timer');
            const timerLabel = document.getElementById('lab-shared-time-label');
            const auxLabel = document.getElementById('lab-shared-aux-label');
            const auxValue = document.getElementById('l1-ai-progress');

            if (timerLabel) timerLabel.textContent = 'Timer';
            if (timerEl) {
                timerEl.textContent = `${Math.max(0, Math.floor(this.liveRemainingTime))}S`;
                timerEl.classList.toggle('danger', this.liveRemainingTime <= 10);
            }

            if (auxLabel) auxLabel.textContent = 'Wave';
            if (auxValue) {
                auxValue.textContent = `${visibleWave}/${totalWaves}`;
                auxValue.className = 'lab-shared-value lab-shared-value--safe';
                auxValue.style.color = '';
            }

            return true;
        }

        if (this.interactionMode === 'threatHuntSimulation') {
            const totalTime = Math.max(1, Number(this.puzzleData?.timeLimit || this.mission?.puzzle?.timeLimit || 180));
            const rawRemaining = this.gameScreen?.timer?.getRemaining?.();
            const remaining = Number.isFinite(rawRemaining) ? Math.max(0, Math.floor(rawRemaining)) : totalTime;
            const elapsedPercent = Math.min(100, Math.max(0, Math.round(((totalTime - remaining) / totalTime) * 100)));
            const timerEl = document.getElementById('l1-timer');
            const timerLabel = document.getElementById('lab-shared-time-label');
            const auxLabel = document.getElementById('lab-shared-aux-label');
            const auxValue = document.getElementById('l1-ai-progress');

            if (timerLabel) timerLabel.textContent = 'Time';
            if (timerEl) {
                const minutes = String(Math.floor(remaining / 60)).padStart(2, '0');
                const seconds = String(remaining % 60).padStart(2, '0');
                timerEl.textContent = `${minutes}:${seconds}`;
                timerEl.classList.toggle('danger', remaining <= 30);
            }

            if (auxLabel) auxLabel.textContent = 'AI';
            if (auxValue) {
                auxValue.textContent = `${elapsedPercent}%`;
                auxValue.className = 'lab-shared-value lab-shared-value--safe';
                auxValue.style.color = '#ff4f8b';
            }

            return true;
        }

        return false;
    }

    buildThreatEvidenceCard(entry, badgeClass) {
        const detail = this.getThreatEvidenceDetail(entry.id);
        const tags = [];
        if (this.threatMarkedEvents.has(entry.id)) tags.push(detail?.suspicious ? 'THREAT FLAGGED' : 'FALSE POSITIVE');
        if (this.threatInvestigatedEvents.has(entry.id)) tags.push('INVESTIGATED');

        return `
            <button class="soc7-evidence-card ${this.threatSelectedEventId === entry.id ? 'selected' : ''} ${this.threatMarkedEvents.has(entry.id) ? (detail?.suspicious ? 'flagged-bad' : 'flagged-good') : ''}" data-threat-event="${entry.id}" type="button">
                <div class="soc7-card-top"><span class="soc7-card-id">${entry.id}</span><span class="soc7-badge ${badgeClass(entry.status)}">${String(entry.status || 'normal').toUpperCase()}</span></div>
                <div class="soc7-card-title">${entry.action}</div>
                <div class="soc7-card-meta">${entry.timestamp} · ${entry.user} · ${entry.locationOrIP}</div>
                ${tags.length ? `<div class="soc7-card-tags">${tags.map(tag => `<span>${tag}</span>`).join('')}</div>` : ''}
            </button>`;
    }

    buildThreatPanelColumn(columnPanels, badgeClass) {
        return `
            <div class="soc7-panel-column">
                <div class="soc7-section-label">EVIDENCE PANELS</div>
                ${columnPanels.map((panel, index) => `
                    ${index ? '<div class="soc7-divider"></div>' : ''}
                    <section class="soc7-panel">
                        <div class="soc7-panel-header"><div class="soc7-panel-title">${panel.title}</div><div class="soc7-event-count">${(panel.entries || []).length} EVENTS</div></div>
                        <div class="soc7-card-stack">${(panel.entries || []).map(entry => this.buildThreatEvidenceCard(entry, badgeClass)).join('')}</div>
                    </section>`).join('')}
            </div>`;
    }

    buildThreatDetailMarkup(selectedEvent) {
        if (!selectedEvent) return '<div class="soc7-detail-empty">CLICK ANY CARD TO INSPECT</div>';

        return `
            <div class="soc7-detail-label">SELECTED EVIDENCE</div>
            <div class="soc7-detail-title">${selectedEvent.title}</div>
            <div class="soc7-detail-meta">${selectedEvent.id} · ${selectedEvent.panelTitle}<br>${selectedEvent.timestamp} · ${selectedEvent.user} · ${selectedEvent.locationOrIP}</div>
            <div class="soc7-detail-highlight">${selectedEvent.highlight}</div>
            <div class="soc7-detail-body">${selectedEvent.body}</div>
            <div class="soc7-detail-analyst">${selectedEvent.analyst}</div>
            <div class="soc7-detail-actions">
                <button class="soc7-action-btn soc7-action-btn--danger" data-threat-action="mark_suspicious" data-event-id="${selectedEvent.id}" type="button" ${this.threatMarkedEvents.has(selectedEvent.id) || this.isComplete || this.threatContainmentResolved ? 'disabled' : ''}>${this.threatMarkedEvents.has(selectedEvent.id) ? 'FLAGGED' : 'MARK SUSPICIOUS'}</button>
                <button class="soc7-action-btn soc7-action-btn--success" data-threat-action="investigate" data-event-id="${selectedEvent.id}" type="button" ${this.threatInvestigatedEvents.has(selectedEvent.id) || this.isComplete || this.threatContainmentResolved ? 'disabled' : ''}>${this.threatInvestigatedEvents.has(selectedEvent.id) ? 'INVESTIGATED' : 'INVESTIGATE'}</button>
            </div>`;
    }

    buildThreatChainCard(entry, badgeClass) {
        const index = this.threatChainSelection.indexOf(entry.id);
        return `
            <button class="soc7-chain-card ${index >= 0 ? 'selected' : ''}" data-threat-chain="${entry.id}" type="button" ${this.isComplete || this.threatContainmentResolved ? 'disabled' : ''}>
                ${index >= 0 ? `<span class="soc7-chain-num">${index + 1}</span>` : ''}
                <div class="soc7-card-top"><span class="soc7-card-id">${entry.id}</span><span class="soc7-badge ${badgeClass(entry.status)}">${String(entry.status || 'normal').toUpperCase()}</span></div>
                <div class="soc7-card-title">${entry.action}</div>
                <div class="soc7-card-meta">${entry.panelTitle} · ${entry.timestamp} · ${entry.user}</div>
            </button>`;
    }

    buildThreatSelectOptions(items, selected) {
        return (Array.isArray(items) ? items : []).map(option => {
            const value = typeof option === 'string' ? option : option.value;
            const label = typeof option === 'string' ? option : option.label;
            return `<option value="${value}" ${selected === value ? 'selected' : ''}>${label}</option>`;
        }).join('');
    }

    renderThreatHuntSimulationPuzzle(container) {
        this.visualizerElement = container;
        const panels = this.getThreatEvidencePanels();
        const entries = this.getThreatEvidenceEntries();
        if (!this.threatSelectedEventId && entries[0]) this.threatSelectedEventId = entries[0].id;

        const selectedEvent = this.getThreatEvidenceDetail(this.threatSelectedEventId) || null;
        const summary = this.getThreatCaseworkSummary();
        const totalTime = Math.max(1, Number(this.puzzleData.timeLimit || this.mission?.puzzle?.timeLimit || 180));
        const rawRemaining = this.gameScreen?.timer?.getRemaining?.();
        const remaining = Number.isFinite(rawRemaining) ? Math.max(0, Math.floor(rawRemaining)) : totalTime;
        const timeDisplay = `${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}`;
        const progressPercent = Math.max(0, Math.min(100, (remaining / totalTime) * 100));
        const aiPercent = Math.min(100, Math.max(0, Math.round(((totalTime - remaining) / totalTime) * 100)));
        const falsePositiveCount = Math.max(0, this.threatMarkedEvents.size - summary.correctFlags);
        const caseStatus = this.threatContainmentResolved ? 'CASE CLOSED' : this.threatChainValidated ? 'READY TO CONTAIN' : 'SOC CASE ACTIVE';
        const phaseTitles = { 1: 'RECONSTRUCT', 2: 'MARK CHAIN', 3: 'CONTAIN' };
        const phaseBriefs = {
            1: 'Review each evidence panel, separate attacker activity from normal operations, and inspect the case details before you escalate.',
            2: 'Select the exact evidence chain that reconstructs the intrusion from initial access through exfiltration.',
            3: 'Apply the correct containment actions to the compromised account, hostile IP, and escalation path.'
        };
        const hintKeys = ['hint1', 'hint2', 'hint3'];
        const lastHint = this.hintsShown > 0 ? this.mission?.hintSystem?.[hintKeys[this.hintsShown - 1]] : '';
        const logsHtml = this.threatActivityLog.length
            ? this.threatActivityLog.map(item => {
                const entry = typeof item === 'string' ? { message: item, tone: 'info' } : item;
                return `<div class="soc7-log-line ${entry.tone || 'info'}">&gt; ${entry.message}</div>`;
            }).join('')
            : '<div class="soc7-log-line info">&gt; Incoming: SOC case active. Review the evidence panels before you act.</div>';
        const panelColumns = [1, 2].map(column =>
            panels.filter((panel, index) => Number(panel.column || ((index % 2) + 1)) === column)
        );
        const badgeClass = (status = 'normal') => status === 'critical' ? 'critical' : status === 'anomalous' ? 'anomalous' : 'normal';
        const panelMarkup = panelColumns.map(columnPanels => this.buildThreatPanelColumn(columnPanels, badgeClass)).join('');
        const detailMarkup = this.buildThreatDetailMarkup(selectedEvent);
        const chainMarkup = entries.map(entry => this.buildThreatChainCard(entry, badgeClass)).join('');
        const chainResult = this.threatChainValidationResult ? `<div class="soc7-result ${this.threatChainValidationResult.tone}">${this.threatChainValidationResult.message}</div>` : '';
        const containment = this.getThreatContainmentConfig();
        const containmentResult = this.threatContainmentResult ? `<div class="soc7-result ${this.threatContainmentResult.tone}">${this.threatContainmentResult.message}</div>` : '';

        container.innerHTML = `
            <style>
                #l1-ai-progress{color:#ff4f8b !important;text-shadow:0 0 18px rgba(255,79,139,.25)}
                .soc7-shell{display:flex;flex-direction:column;gap:16px;padding:22px;height:100%;min-height:0;overflow:auto}
                .soc7-progress-rail,.soc7-banner,.soc7-brief,.soc7-summary-grid,.soc7-hint-box,.soc7-phase,.soc7-panel,.soc7-detail-panel,.soc7-log-panel{background:rgba(2,10,24,.68);border:1px solid rgba(23,216,255,.14);box-shadow:0 18px 42px rgba(0,0,0,.24);backdrop-filter:blur(12px)}
                .soc7-section-label,.soc7-card-id,.soc7-event-count,.soc7-detail-label,.soc7-summary-label,.soc7-banner-label,.soc7-log-line,.soc7-phase-heading,.soc7-field-label,.soc7-attempts,.soc7-hint-label,.soc7-note{font-family:'Share Tech Mono',monospace;letter-spacing:.18em;text-transform:uppercase}
                .soc7-progress-rail{padding:0;height:4px;overflow:hidden}.soc7-progress-bar{height:100%;background:linear-gradient(90deg,#00e5ff 0%,#ffd600 55%,#ff4f8b 100%);transition:width 1s linear}
                .soc7-banner,.soc7-brief,.soc7-phase,.soc7-detail-panel,.soc7-log-panel{padding:18px}
                .soc7-banner{display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap}
                .soc7-banner-label{font-size:.72rem;color:rgba(23,216,255,.74)}
                .soc7-banner-title{font-family:'Orbitron',sans-serif;font-size:1.08rem;font-weight:700;line-height:1.4;color:#eef7ff}
                .soc7-banner-status{font-family:'Bebas Neue',sans-serif;font-size:1.6rem;letter-spacing:2px;color:#00e090}
                .soc7-brief-copy{margin-top:12px;font-size:1rem;line-height:1.7;color:rgba(232,244,255,.82)}
                .soc7-summary-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1px;padding:1px;background:rgba(23,216,255,.08)}
                .soc7-summary-card{padding:14px 16px;background:rgba(0,8,20,.84);display:grid;gap:6px}
                .soc7-summary-label{font-size:.64rem;color:rgba(23,216,255,.62)}
                .soc7-summary-value{font-family:'Bebas Neue',sans-serif;font-size:1.65rem;line-height:1;color:#eef7ff;letter-spacing:2px}
                .soc7-summary-value--cyan{color:#00e5ff}.soc7-summary-value--gold{color:#ffd600}.soc7-summary-value--green{color:#00e090}.soc7-summary-value--pink{color:#ff4f8b}
                .soc7-hint-box{padding:14px 16px;border-color:rgba(0,229,255,.28);background:rgba(0,229,255,.06)}
                .soc7-hint-label{font-size:.66rem;color:#00e5ff;margin-bottom:10px}.soc7-hint-copy{color:#b8efff;line-height:1.7}
                .soc7-phase{display:none}.soc7-phase.active{display:block}
                .soc7-phase-heading{font-size:.72rem;color:rgba(23,216,255,.74);margin-bottom:16px}
                .soc7-evidence-layout{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr) minmax(300px,340px);gap:16px;align-items:start}
                .soc7-panel-column{display:grid;gap:14px}.soc7-section-label{font-size:.66rem;color:rgba(168,216,232,.42)}.soc7-divider{height:1px;background:rgba(23,216,255,.12)}
                .soc7-panel{padding:0;overflow:hidden}.soc7-panel-header{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:16px 16px 0}.soc7-panel-title{font-size:1rem;font-weight:700;color:#eef7ff}.soc7-event-count{font-size:.68rem;color:#00e5ff}
                .soc7-card-stack{display:grid;gap:10px;padding:16px}
                .soc7-evidence-card,.soc7-chain-card{position:relative;padding:12px 13px;border:1px solid rgba(23,216,255,.12);background:rgba(255,255,255,.02);text-align:left;color:#eef7ff;cursor:pointer;transition:border-color .18s ease,background .18s ease,transform .18s ease}
                .soc7-evidence-card::before,.soc7-chain-card::before{content:'';position:absolute;left:0;top:0;bottom:0;width:2px;background:transparent;transition:background .18s ease}
                .soc7-evidence-card:hover,.soc7-chain-card:hover{border-color:rgba(23,216,255,.3);background:rgba(23,216,255,.06);transform:translateY(-1px)}
                .soc7-evidence-card:hover::before,.soc7-chain-card:hover::before{background:#00e5ff}
                .soc7-evidence-card.selected,.soc7-chain-card.selected{border-color:#00e5ff;background:rgba(0,229,255,.08)}
                .soc7-evidence-card.selected::before,.soc7-chain-card.selected::before{background:#00e5ff}
                .soc7-evidence-card.flagged-bad{border-color:rgba(255,79,139,.42)}.soc7-evidence-card.flagged-bad::before{background:#ff4f8b}
                .soc7-evidence-card.flagged-good{border-color:rgba(0,224,144,.38)}.soc7-evidence-card.flagged-good::before{background:#00e090}
                .soc7-card-top{display:flex;justify-content:space-between;align-items:center;gap:12px}
                .soc7-card-id{font-size:.74rem;color:#00e5ff}.soc7-card-title{margin-top:8px;font-size:1rem;font-weight:700;color:#eef7ff;line-height:1.45}
                .soc7-card-meta{margin-top:6px;font-size:.82rem;line-height:1.6;color:rgba(168,216,232,.58)}
                .soc7-badge{display:inline-flex;padding:3px 8px;border:1px solid;font-family:'Share Tech Mono',monospace;font-size:.62rem;letter-spacing:.12em;text-transform:uppercase}
                .soc7-badge.anomalous{color:#ffb347;border-color:rgba(255,179,71,.34);background:rgba(255,179,71,.08)}
                .soc7-badge.normal{color:#00e090;border-color:rgba(0,224,144,.34);background:rgba(0,224,144,.08)}
                .soc7-badge.critical{color:#ff4f8b;border-color:rgba(255,79,139,.34);background:rgba(255,79,139,.08)}
                .soc7-card-tags{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}.soc7-card-tags span{display:inline-flex;padding:4px 8px;border:1px solid rgba(23,216,255,.14);background:rgba(23,216,255,.07);color:#8beeff;font-size:.68rem}
                .soc7-detail-panel{display:flex;flex-direction:column;min-height:100%}
                .soc7-detail-label{font-size:.66rem;color:#00e5ff;padding-bottom:10px;border-bottom:1px solid rgba(23,216,255,.12);margin-bottom:16px}
                .soc7-detail-title{font-family:'Orbitron',sans-serif;font-size:1.02rem;font-weight:700;color:#fff;line-height:1.4}
                .soc7-detail-meta{margin-top:10px;font-size:.82rem;line-height:1.8;color:#00e5ff}
                .soc7-detail-highlight{margin-top:14px;padding:12px;border-left:3px solid #00e5ff;background:rgba(0,229,255,.08);font-family:'Orbitron',sans-serif;font-size:.84rem;font-weight:700;color:#00e5ff}
                .soc7-detail-body{margin-top:14px;font-size:.92rem;line-height:1.75;color:rgba(232,244,255,.8)}
                .soc7-detail-analyst{margin-top:14px;padding:12px;border:1px solid rgba(23,216,255,.12);background:rgba(255,255,255,.02);font-size:.8rem;line-height:1.7;color:rgba(168,216,232,.72)}
                .soc7-detail-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:auto;padding-top:18px;border-top:1px solid rgba(23,216,255,.12)}
                .soc7-action-btn,.soc7-primary-btn{padding:11px 12px;border:1px solid rgba(23,216,255,.22);background:rgba(23,216,255,.06);color:#eef7ff;font-family:'Share Tech Mono',monospace;font-size:.72rem;letter-spacing:.12em;text-transform:uppercase;cursor:pointer;transition:all .18s ease}
                .soc7-action-btn--danger{border-color:rgba(255,79,139,.36);color:#ff9fbe;background:rgba(255,79,139,.08)}
                .soc7-action-btn--success{border-color:rgba(0,224,144,.34);color:#8ff5c8;background:rgba(0,224,144,.08)}
                .soc7-action-btn:hover,.soc7-primary-btn:hover,.soc7-select:hover,.soc7-select:focus{border-color:#00e5ff}
                .soc7-action-btn:disabled,.soc7-primary-btn:disabled,.soc7-evidence-card:disabled,.soc7-chain-card:disabled,.soc7-select:disabled{opacity:.42;cursor:not-allowed;transform:none}
                .soc7-detail-empty{display:flex;align-items:center;justify-content:center;min-height:260px;text-align:center;color:rgba(168,216,232,.46);font-family:'Share Tech Mono',monospace;font-size:.78rem;letter-spacing:.16em;text-transform:uppercase}
                .soc7-chain-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
                .soc7-chain-num{position:absolute;top:8px;right:10px;font-family:'Bebas Neue',sans-serif;font-size:1.4rem;color:#00e5ff}
                .soc7-phase-actions{display:flex;flex-wrap:wrap;align-items:center;gap:12px;margin-top:16px}
                .soc7-primary-btn{padding:12px 20px}.soc7-note{font-size:.72rem;color:rgba(168,216,232,.58)}
                .soc7-result{margin-top:16px;padding:14px 16px;border:1px solid;font-family:'Share Tech Mono',monospace;font-size:.76rem;line-height:1.7}
                .soc7-result.ok{border-color:rgba(0,224,144,.34);background:rgba(0,224,144,.08);color:#8ff5c8}
                .soc7-result.fail{border-color:rgba(255,214,0,.34);background:rgba(255,214,0,.08);color:#ffe97c}
                .soc7-result.err{border-color:rgba(255,79,139,.34);background:rgba(255,79,139,.08);color:#ff9fbe}
                .soc7-contain-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
                .soc7-contain-grid + .soc7-contain-grid{margin-top:16px}
                .soc7-field{display:grid;gap:8px}.soc7-field-label{font-size:.66rem;color:rgba(168,216,232,.58)}
                .soc7-select{width:100%;padding:12px 14px;border:1px solid rgba(23,216,255,.18);background:rgba(255,255,255,.03);color:#eef7ff;font-family:'Share Tech Mono',monospace;font-size:.8rem;outline:none}
                .soc7-select option{background:#07111d;color:#eef7ff}
                .soc7-log-panel{display:flex;flex-direction:column;gap:12px;min-height:220px}
                .soc7-log-body{flex:1;min-height:180px;max-height:260px;overflow:auto;padding-right:4px}
                .soc7-log-line{font-size:.76rem;line-height:1.75;color:rgba(232,244,255,.78);margin-bottom:8px}
                .soc7-log-line.good{color:#8ff5c8}.soc7-log-line.bad{color:#ff9fbe}.soc7-log-line.warn{color:#ffe97c}.soc7-log-line.info{color:#8beeff}
                .soc7-attempts{text-align:center;color:rgba(168,216,232,.58);font-size:.72rem}
                @media (max-width:1320px){.soc7-summary-grid,.soc7-chain-grid,.soc7-contain-grid,.soc7-detail-actions{grid-template-columns:1fr}.soc7-evidence-layout{grid-template-columns:1fr}}
                @media (max-width:900px){.soc7-shell{padding:16px}.soc7-banner,.soc7-brief,.soc7-phase,.soc7-detail-panel,.soc7-log-panel{padding:14px}.soc7-summary-card{padding:12px 14px}}
            </style>
            ${this.renderSharedPasswordLabThemeStyles()}
            ${this.renderSharedPasswordLabFrame({
                levelLabel: `// LEVEL ${String(this.mission.level || 0).padStart(2, '0')} - SOC CASEWORK`,
                title: 'ENTERPRISE THREAT<br>HUNT',
                status: caseStatus,
                phases: [
                    { label: 'RECONSTRUCT', active: this.threatCasePhase === 1, done: summary.marked > 0 || summary.investigated > 0 },
                    { label: 'MARK CHAIN', active: this.threatCasePhase === 2, done: this.threatChainValidated },
                    { label: 'CONTAIN', active: this.threatCasePhase === 3, done: this.threatContainmentResolved }
                ],
                timeDisplayOverride: timeDisplay,
                auxiliaryLabel: 'AI',
                auxiliaryValue: `${aiPercent}%`,
                auxiliaryTone: 'safe',
                content: `
                    <div class="soc7-shell">
                        <div class="soc7-progress-rail"><div class="soc7-progress-bar" style="width:${progressPercent}%"></div></div>
                        <section class="soc7-banner">
                            <div>
                                <div class="soc7-banner-label">PHASE ${this.threatCasePhase} / 3</div>
                                <div class="soc7-banner-title">${phaseTitles[this.threatCasePhase]} - ENTERPRISE THREAT HUNT</div>
                            </div>
                            <div class="soc7-banner-status">${caseStatus}</div>
                        </section>
                        <section class="soc7-brief">
                            <div class="soc7-section-label">COMMAND BRIEF</div>
                            <div class="soc7-brief-copy">${phaseBriefs[this.threatCasePhase]}</div>
                        </section>
                        <section class="soc7-summary-grid">
                            <div class="soc7-summary-card"><div class="soc7-summary-label">CONFIRMED THREATS</div><div class="soc7-summary-value soc7-summary-value--cyan">${summary.correctFlags}/${summary.chainLinks}</div></div>
                            <div class="soc7-summary-card"><div class="soc7-summary-label">INVESTIGATED</div><div class="soc7-summary-value soc7-summary-value--gold">${summary.investigated}</div></div>
                            <div class="soc7-summary-card"><div class="soc7-summary-label">FALSE POSITIVES</div><div class="soc7-summary-value soc7-summary-value--pink">${falsePositiveCount}</div></div>
                            <div class="soc7-summary-card"><div class="soc7-summary-label">CHAIN SELECTED</div><div class="soc7-summary-value soc7-summary-value--green">${this.threatChainSelection.length}</div></div>
                        </section>
                        ${lastHint ? `<section class="soc7-hint-box"><div class="soc7-hint-label">// ANALYST HINT</div><div class="soc7-hint-copy">${lastHint}</div></section>` : ''}
                        <section class="soc7-phase ${this.threatCasePhase === 1 ? 'active' : ''}">
                            <div class="soc7-phase-heading">// 01 RECONSTRUCT - REVIEW THE EVIDENCE PANELS, MARK MALICIOUS EVENTS, AND INVESTIGATE BEFORE ESCALATION.</div>
                            <div class="soc7-evidence-layout">${panelMarkup}<aside class="soc7-detail-panel">${detailMarkup}</aside></div>
                        </section>
                        <section class="soc7-phase ${this.threatCasePhase === 2 ? 'active' : ''}">
                            <div class="soc7-phase-heading">// 02 MARK ATTACK CHAIN - SELECT ALL ANOMALOUS EVENTS THAT FORM THE ATTACK SEQUENCE.</div>
                            <div class="soc7-chain-grid">${chainMarkup}</div>
                            <div class="soc7-phase-actions">
                                <button class="soc7-primary-btn" id="threat-validate-chain" type="button" ${this.isComplete || this.threatChainValidated || this.threatContainmentResolved ? 'disabled' : ''}>[ VALIDATE CHAIN ]</button>
                                <span class="soc7-note">${this.threatChainSelection.length} SELECTED</span>
                                ${this.threatChainValidated ? '<button class="soc7-primary-btn" data-threat-phase="3" type="button">[ PROCEED TO CONTAINMENT ]</button>' : ''}
                            </div>
                            ${chainResult}
                        </section>
                        <section class="soc7-phase ${this.threatCasePhase === 3 ? 'active' : ''}">
                            <div class="soc7-phase-heading">// 03 CONTAINMENT - APPLY RESPONSE ACTIONS TO NEUTRALIZE THE THREAT.</div>
                            <div class="soc7-contain-grid">
                                <div class="soc7-field"><label class="soc7-field-label" for="threat-account">COMPROMISED ACCOUNT</label><select class="soc7-select" id="threat-account" data-threat-select="account" ${this.isComplete || this.threatContainmentResolved ? 'disabled' : ''}><option value="">-- SELECT ACCOUNT --</option>${this.buildThreatSelectOptions(containment.accountOptions, this.threatContainmentSelection.account)}</select></div>
                                <div class="soc7-field"><label class="soc7-field-label" for="threat-action">RESPONSE ACTION</label><select class="soc7-select" id="threat-action" data-threat-select="action" ${this.isComplete || this.threatContainmentResolved ? 'disabled' : ''}><option value="">-- SELECT ACTION --</option>${this.buildThreatSelectOptions(containment.actionOptions, this.threatContainmentSelection.action)}</select></div>
                                <div class="soc7-field"><label class="soc7-field-label" for="threat-ip">BLOCK EXTERNAL IP</label><select class="soc7-select" id="threat-ip" data-threat-select="ip" ${this.isComplete || this.threatContainmentResolved ? 'disabled' : ''}><option value="">-- SELECT IP --</option>${this.buildThreatSelectOptions(containment.ipOptions, this.threatContainmentSelection.ip)}</select></div>
                            </div>
                            <div class="soc7-contain-grid">
                                <div class="soc7-field"><label class="soc7-field-label" for="threat-escalate">ESCALATE TO</label><select class="soc7-select" id="threat-escalate" data-threat-select="escalate" ${this.isComplete || this.threatContainmentResolved ? 'disabled' : ''}><option value="">-- SELECT TEAM --</option>${this.buildThreatSelectOptions(containment.escalateOptions, this.threatContainmentSelection.escalate)}</select></div>
                                <div class="soc7-field" style="align-content:end;">
                                    <button class="soc7-primary-btn" id="threat-submit-containment" type="button" ${this.isComplete || !this.threatChainValidated || this.threatContainmentResolved ? 'disabled' : ''}>[ EXECUTE CONTAINMENT ]</button>
                                </div>
                                <div class="soc7-field" style="align-content:end;">
                                    <div class="soc7-note">${this.threatChainValidated ? 'ATTACK CHAIN VERIFIED.' : 'VALIDATE PHASE 2 BEFORE CONTAINMENT.'}</div>
                                </div>
                            </div>
                            ${containmentResult}
                        </section>
                        <section class="soc7-log-panel">
                            <div class="soc7-section-label">COMMAND LOG</div>
                            <div class="soc7-log-body guess-feedback" id="guess-feedback">${logsHtml}</div>
                            <div class="soc7-attempts" id="attempt-counter">Case submissions: <span style="color:var(--cyber-blue);">${this.attempts}</span> / ${this.maxAttempts}</div>
                        </section>
                    </div>`
            })}`;

        this.setupThreatHuntEventListeners();
        this.startHumanLabMatrixAnimation();
        this.gameScreen.syncEmbeddedMissionHUD();
    }

    // ─── LEVEL 9: patch simulation with tiered win condition ─────────────────

    renderLivePatchSimulationPuzzle(container) {
        this.visualizerElement = container;
        const modules = Array.isArray(this.puzzleData.architectureModules) ? this.puzzleData.architectureModules : [];
        const vulnerabilities = Array.isArray(this.puzzleData.vulnerabilities) ? this.puzzleData.vulnerabilities : [];
        const moduleMarkup = modules.sort((a, b) => Number(a.flowOrder || 0) - Number(b.flowOrder || 0)).map(module => `
            <div class="patch-module ${module.editable ? 'editable' : ''}">
                <div class="patch-module__name">${module.name}</div>
                <div class="patch-module__note">${module.notes || ''}</div>
                <div class="patch-module__state">${module.state || 'active'}</div>
            </div>`).join('');
        const vulnMarkup = vulnerabilities.map(vulnerability => {
            const closed = this.patchClosedVulns.has(vulnerability.id);
            const hidden = vulnerability.status === 'hidden';
            const revealedOpen = !hidden && !closed;
            const stateLabel = hidden ? 'HIDDEN' : closed ? 'CLOSED' : 'OPEN';
            const stateClass = hidden ? 'hidden' : closed ? 'closed' : 'open';
            return `
                <div class="patch-vuln ${stateClass}">
                    <div class="patch-vuln__top">
                        <span>${vulnerability.name}</span>
                        <span>${stateLabel}</span>
                    </div>
                    <div class="patch-vuln__meta">${vulnerability.moduleId} · ${String(vulnerability.severity || '').toUpperCase()}</div>
                    <div class="patch-vuln__desc">${hidden ? 'Unknown secondary path not yet exposed.' : (revealedOpen ? 'Still exploitable and requires remediation.' : 'Closed in the current deployment state.')}</div>
                </div>`;
        }).join('');
        const stagedNames = Array.from(this.patchStagedActions).map(id => (this.puzzleData.patchOptions || []).find(option => option.id === id)?.action).filter(Boolean);
        const stagingPreview = this.getPatchStagingPreview();
        const patchActions = (Array.isArray(this.puzzleData.patchOptions) ? this.puzzleData.patchOptions : []).map(option => {
            const staged = this.patchStagedActions.has(option.id);
            const applied = this.patchAppliedActions.has(option.id);
            const special = option.id === 'patch_deploy' || option.id === 'patch_simulate_exploit';
            const cls = special ? 'special' : staged ? 'staged' : applied ? 'applied' : '';
            return `
                <button class="patch-action-card ${cls}" data-patch-action="${option.id}" type="button">
                    <div class="patch-action-card__title">${option.uiLabel || option.action}</div>
                    <div class="patch-action-card__meta">${special ? (option.id === 'patch_deploy' ? 'Deploy staged changes to production' : 'Re-test current exploit chain') : (applied ? 'Already deployed' : staged ? 'Queued for deploy' : 'Stage this remediation')}</div>
                </button>`;
        }).join('');
        const logHtml = this.patchActivityLog.length
            ? this.patchActivityLog.map(item => `<div>• ${item}</div>`).join('')
            : `Live patch lab online. Stage remediations, deploy them, then run exploit simulation to validate the zero-day chain.`;

        container.innerHTML = `
            <style>
                .patch-shell{background:linear-gradient(180deg,#070b12 0%,#05080f 100%);color:#eef2ff;border:1px solid rgba(255,64,96,.14);box-shadow:0 20px 60px rgba(0,0,0,.35)}
                .patch-header{display:flex;justify-content:space-between;align-items:center;padding:16px 26px;background:#0a0d18;border-bottom:1px solid rgba(255,64,96,.25);gap:16px;flex-wrap:wrap}
                .patch-brand,.patch-level,.patch-status,.patch-kicker,.patch-action-card__meta,.patch-attempts{font-family:Consolas,"Courier New",monospace;letter-spacing:.18em;text-transform:uppercase}
                .patch-brand{color:#ff4060;font-weight:700}.patch-level{color:rgba(255,64,96,.72);font-size:.85rem}.patch-status{color:#00e87a;font-size:.82rem}
                .patch-phases{display:grid;grid-template-columns:repeat(3,1fr);background:#0b101b;border-bottom:1px solid rgba(255,64,96,.12)}
                .patch-phase{padding:14px 10px;text-align:center;color:rgba(180,190,230,.35);border-bottom:2px solid transparent;font-size:.78rem}.patch-phase span{display:block;font-size:1.6rem;font-weight:700;line-height:1.1}
                .patch-phase.active{color:#ff4060;background:rgba(255,64,96,.05);border-bottom-color:#ff4060}
                .patch-hint-strip{padding:12px 28px;background:rgba(0,212,255,.04);border-bottom:1px solid rgba(0,212,255,.12);color:rgba(0,212,255,.78);font-family:Consolas,"Courier New",monospace;letter-spacing:.12em;font-size:.82rem}
                .patch-grid{display:grid;grid-template-columns:1.2fr 340px;gap:0;min-height:700px}.patch-main,.patch-side{padding:24px;background:rgba(0,0,0,.18)}.patch-main{border-right:1px solid rgba(255,64,96,.12)}
                .patch-kicker{font-size:.74rem;color:rgba(255,64,96,.64);margin-bottom:12px}
                .patch-overview,.patch-sidebox,.patch-action-board,.patch-log,.patch-module,.patch-vuln{background:rgba(0,0,0,.34);border:1px solid rgba(255,64,96,.12)}
                .patch-overview,.patch-sidebox,.patch-action-board,.patch-log{padding:16px}
                .patch-overview strong{color:#ff7e92}
                .patch-overview-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}.patch-metric{display:grid;gap:8px;padding:12px;border:1px solid rgba(255,64,96,.1);background:rgba(255,255,255,.02)}
                .patch-metric span{color:rgba(180,190,230,.62);font-size:.78rem}.patch-metric strong{color:#eef2ff;font-family:Consolas,"Courier New",monospace;font-size:1.3rem}
                .patch-bar{height:6px;background:rgba(255,64,96,.12);overflow:hidden}.patch-bar > div{height:100%;background:linear-gradient(90deg,#ff4060,#00d4ff)}
                .patch-section{margin-top:18px}.patch-module-grid,.patch-vuln-grid,.patch-action-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
                .patch-module,.patch-vuln{padding:14px}.patch-module.editable{border-color:rgba(0,212,255,.18)}.patch-module__name,.patch-vuln__top{display:flex;justify-content:space-between;gap:10px;align-items:center;color:#eef2ff;font-weight:700}
                .patch-module__note,.patch-vuln__desc{margin-top:8px;color:rgba(180,190,230,.64);line-height:1.55;font-size:.84rem}.patch-module__state,.patch-vuln__meta{margin-top:10px;color:#8beeff;font-family:Consolas,"Courier New",monospace;font-size:.72rem}
                .patch-vuln.open{border-color:rgba(255,64,96,.24)}.patch-vuln.closed{border-color:rgba(0,232,122,.24)}.patch-vuln.hidden{border-color:rgba(180,190,230,.18)}
                .patch-action-card{padding:14px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.02);text-align:left;color:#eef2ff;cursor:pointer;transition:.18s ease}
                .patch-action-card:hover{border-color:rgba(255,64,96,.34);transform:translateY(-1px)}.patch-action-card.special{border-color:rgba(0,212,255,.24)}.patch-action-card.staged{border-color:rgba(255,176,0,.34);background:rgba(255,176,0,.08)}.patch-action-card.applied{border-color:rgba(0,232,122,.28);background:rgba(0,232,122,.08)}
                .patch-action-card__title{font-weight:700;line-height:1.45}.patch-action-card__meta{margin-top:8px;color:rgba(180,190,230,.58);font-size:.68rem;line-height:1.55}
                .patch-sidebox{display:grid;gap:14px}.patch-stage-list{display:grid;gap:8px}.patch-stage-list div{padding:10px 12px;border:1px solid rgba(255,176,0,.16);background:rgba(255,176,0,.06);color:#ffcb6b}
                .patch-log{margin-top:16px;max-height:220px;overflow:auto;text-align:left;color:rgba(220,228,245,.86)}.patch-attempts{text-align:center;margin-top:16px;color:var(--text-secondary)}
                @media (max-width:1080px){.patch-grid{grid-template-columns:1fr}.patch-main{border-right:0;border-bottom:1px solid rgba(255,64,96,.12)}.patch-module-grid,.patch-vuln-grid,.patch-action-grid,.patch-overview-grid{grid-template-columns:1fr}}
                @media (max-width:720px){.patch-header{padding:14px 18px}.patch-main,.patch-side{padding:18px}.patch-phases{grid-template-columns:1fr}}
            </style>
            ${this.renderSharedPasswordLabThemeStyles()}
            ${this.renderSharedPasswordLabFrame({
                levelLabel: `// LEVEL ${String(this.mission.level || 0).padStart(2, '0')} - ENGINEERING CRISIS`,
                title: 'ZERO-DAY LIVE<br>PATCH LAB',
                status: 'ENGINEERING CRISIS ROOM',
                phases: [
                    { label: 'STAGE FIXES', active: this.patchStagedActions.size === 0 },
                    { label: 'DEPLOY PATCH', active: this.patchStagedActions.size > 0 },
                    { label: 'RE-TEST EXPLOIT', active: this.patchAppliedActions.size > 0 }
                ],
                content: `
                    <div class="patch-shell">
                        <div class="patch-header">
                            <div class="patch-brand">SHADOWDEF</div>
                            <div class="patch-level">LEVEL ${this.mission.level} - ZERO-DAY LIVE PATCH LAB</div>
                            <div class="patch-status">ENGINEERING CRISIS ROOM</div>
                        </div>
                        <div class="patch-phases">
                            <div class="patch-phase active"><span>01</span>STAGE FIXES</div>
                            <div class="patch-phase"><span>02</span>DEPLOY PATCH</div>
                            <div class="patch-phase"><span>03</span>RE-TEST EXPLOIT</div>
                        </div>
                        <div class="patch-hint-strip">HINT: Fixing the primary issue may reveal a secondary path. Stage carefully, deploy deliberately, and always re-test the live exploit chain.</div>
                        <div class="patch-grid">
                            <main class="patch-main">
                                <div class="patch-kicker">Architecture Overview</div>
                                <div class="patch-overview">
                                    <div><strong>Objective:</strong> ${this.mission.objective || ''}</div>
                                    <div><strong>Scenario:</strong> ${this.mission.scenario || ''}</div>
                                    <div><strong>Task:</strong> ${this.mission.userTask || ''}</div>
                                </div>
                                <div class="patch-section">
                                    <div class="patch-kicker">Auth Flow Modules</div>
                                    <div class="patch-module-grid">${moduleMarkup}</div>
                                </div>
                                <div class="patch-section">
                                    <div class="patch-kicker">Vulnerability Board</div>
                                    <div class="patch-vuln-grid">${vulnMarkup}</div>
                                </div>
                                <div class="patch-section">
                                    <div class="patch-kicker">Patch Operations</div>
                                    <div class="patch-action-grid" id="patch-actions">${patchActions}</div>
                                </div>
                            </main>
                            <aside class="patch-side">
                                <div class="patch-kicker">Live Metrics</div>
                                <div class="patch-sidebox">
                                    <div class="patch-overview-grid">
                                        <div class="patch-metric"><span>Vault Health</span><strong id="patch-vault">${Math.floor(this.patchMetrics.vaultHealth)}%</strong><div class="patch-bar"><div id="patch-vault-fill" style="width:${Math.max(0,Math.min(100,this.patchMetrics.vaultHealth))}%;"></div></div></div>
                                        <div class="patch-metric"><span>Exploit Success</span><strong id="patch-exploit">${Math.floor(this.patchMetrics.exploitSuccessRate)}%</strong></div>
                                        <div class="patch-metric"><span>Server Load</span><strong id="patch-load">${Math.floor(this.patchMetrics.serverLoad)}%</strong></div>
                                        <div class="patch-metric"><span>User Experience</span><strong id="patch-ux">${Math.floor(this.patchMetrics.userExperienceScore)}%</strong></div>
                                    </div>
                                    <div class="patch-metric"><span>Vulnerabilities Remaining</span><strong id="patch-vuln">${this.patchMetrics.vulnerabilityCountRemaining}</strong></div>
                                    <div>
                                        <div class="patch-kicker">Staged Changes</div>
                                        <div class="patch-stage-list">${stagedNames.length ? stagedNames.map(name => `<div>${name}</div>`).join('') : '<div>No changes staged yet.</div>'}</div>
                                    </div>
                                    <div>
                                        <div class="patch-kicker">Projected Impact After Deploy</div>
                                        <div class="patch-stage-list">
                                            <div>Exploit success: ${stagingPreview.exploitSuccessRateDelta >= 0 ? '+' : ''}${stagingPreview.exploitSuccessRateDelta}%</div>
                                            <div>Server load: ${stagingPreview.serverLoadDelta >= 0 ? '+' : ''}${stagingPreview.serverLoadDelta}%</div>
                                            <div>User experience: ${stagingPreview.userExperienceScoreDelta >= 0 ? '+' : ''}${stagingPreview.userExperienceScoreDelta}%</div>
                                            <div>Likely closures: ${stagingPreview.closes}</div>
                                        </div>
                                    </div>
                                </div>
                                <div class="patch-kicker" style="margin-top:16px;">Crisis Log</div>
                                <div class="patch-log guess-feedback" id="guess-feedback">${logHtml}</div>
                                <div id="attempt-counter" class="patch-attempts">Patch operations: <span style="color:var(--cyber-blue);">${this.attempts}</span></div>
                            </aside>
                        </div>
                    </div>`
            })}`;

        this.setupLivePatchEventListeners();
        this.updatePatchUI();
        this.startHumanLabMatrixAnimation();
        this.gameScreen.syncEmbeddedMissionHUD();
    }

    setupLivePatchEventListeners() {
        document.querySelectorAll('button[data-patch-action]').forEach(btn => {
            btn.addEventListener('click', () => { const id = btn.dataset.patchAction; if (id) this.handlePatchAction(id); });
        });
    }

    handlePatchAction(actionId) {
        if (this.isComplete) return;
        const option = (this.puzzleData.patchOptions || []).find(p => p.id === actionId);
        if (!option) return;

        if (actionId === 'patch_simulate_exploit') {
            this.attempts++; this.updateAttemptCounter(); this.gameScreen.updateAttempts(this.attempts);
            this.simulatePatchExploit();
            this.evaluatePatchResult();
            return;
        }

        if (actionId === 'patch_deploy') {
            if (!this.patchStagedActions.size) {
                this.gameScreen.ui.showNotification('Stage at least one remediation before deployment.', 'warning');
                return;
            }
            this.attempts++; this.updateAttemptCounter(); this.gameScreen.updateAttempts(this.attempts);
            this.deployPatchChanges();
            this.evaluatePatchResult();
            return;
        }

        if (this.patchAppliedActions.has(actionId) || this.patchStagedActions.has(actionId)) {
            this.gameScreen.ui.showNotification('That remediation is already staged or deployed.', 'warning');
            return;
        }

        this.attempts++; this.updateAttemptCounter(); this.gameScreen.updateAttempts(this.attempts);
        this.patchStagedActions.add(actionId);
        this.appendPatchLog(`Change staged: ${option.action}. Deploy to apply it.`);
        if (this.visualizerElement) this.renderLivePatchSimulationPuzzle(this.visualizerElement);
    }

    deployPatchChanges() {
        const stagedIds = Array.from(this.patchStagedActions);
        stagedIds.forEach(actionId => {
            const option = (this.puzzleData.patchOptions || []).find(p => p.id === actionId);
            if (!option) return;
            this.patchAppliedActions.add(actionId);
            const effects = option.effects || {};
            this.patchMetrics.exploitSuccessRate += Number(effects.exploitSuccessRateDelta || 0);
            this.patchMetrics.serverLoad += Number(effects.serverLoadDelta || 0);
            this.patchMetrics.userExperienceScore += Number(effects.userExperienceScoreDelta || 0);
            (Array.isArray(effects.closesVulnerabilities) ? effects.closesVulnerabilities : []).forEach(id => this.patchClosedVulns.add(id));
        });
        this.patchStagedActions.clear();
        this.refreshPatchVulnerabilityCount();
        this.clampPatchMetrics();
        this.patchTurnsSincePatch = 0;

        if (!this.patchPrimaryFixed && (this.patchClosedVulns.has('vuln_timing_compare') || this.patchClosedVulns.has('vuln_session_reuse'))) {
            this.patchPrimaryFixed = true;
            this.revealSecondaryPatchVulnerability();
        }

        this.appendPatchLog(`Deployment completed: ${stagedIds.length} remediation change${stagedIds.length === 1 ? '' : 's'} applied.`);
        if (this.visualizerElement) this.renderLivePatchSimulationPuzzle(this.visualizerElement);
    }

    simulatePatchExploit() {
        const logic = this.puzzleData.exploitSimulationLogic || {};
        const sim = logic.onSimulate || {};
        this.applyPatchDelayEscalation();
        const remaining = this.getPatchRemainingVulnerabilities();
        const totalVisible = (this.puzzleData.vulnerabilities || []).filter(v => v.status !== 'hidden').length;
        const fullyFixed = remaining.length === 0;
        const partiallyFixed = remaining.length > 0 && remaining.length < totalVisible;

        if (fullyFixed) {
            this.patchMetrics.exploitSuccessRate = Number(sim.ifFullyPatched?.exploitSuccessRateSet ?? 0);
            this.patchMetrics.vaultHealth = Math.max(0, this.patchMetrics.vaultHealth - Number(sim.ifFullyPatched?.vaultHealthDrop || 0));
            this.appendPatchLog(sim.ifFullyPatched?.message || 'Exploit blocked.');
        } else if (partiallyFixed) {
            this.patchMetrics.exploitSuccessRate += Number(sim.ifPartiallyPatched?.exploitSuccessRateAdjustment || -8);
            this.patchMetrics.vaultHealth = Math.max(0, this.patchMetrics.vaultHealth - Number(sim.ifPartiallyPatched?.vaultHealthDrop || 6));
            this.appendPatchLog(sim.ifPartiallyPatched?.message || 'Exploit partially successful.');
        } else {
            this.patchMetrics.vaultHealth = Math.max(0, this.patchMetrics.vaultHealth - Number(sim.ifUnpatched?.vaultHealthDrop || 12));
            this.appendPatchLog(sim.ifUnpatched?.message || 'Exploit succeeded.');
        }

        this.patchTurnsSincePatch++;
        this.clampPatchMetrics();
        if (this.visualizerElement) this.renderLivePatchSimulationPuzzle(this.visualizerElement);
    }

    // FIX L9: tiered win condition evaluation
    evaluatePatchResult() {
        if (this.isComplete) return;

        // Check fail first
        const failRules = this.puzzleData.failCondition?.any || [];
        const failed = failRules.some(rule => this.evaluatePatchRule(rule));
        if (failed) { this.finishPatchLab(false, null); return; }

        // Check tiered win
        const tiers = this.puzzleData.winCondition?.tiers;
        if (Array.isArray(tiers)) {
            for (const tier of tiers) {
                const allPass = (tier.conditions?.all || []).every(rule => this.evaluatePatchRule(rule));
                if (allPass) {
                    this.finishPatchLab(true, tier);
                    return;
                }
            }
            return; // no tier matched yet — keep playing
        }

        // Legacy flat winCondition (fallback)
        const allRules = this.puzzleData.winCondition?.all || [];
        if (allRules.length && allRules.every(rule => this.evaluatePatchRule(rule))) {
            this.finishPatchLab(true, null);
        }
    }

    finishPatchLab(success, tier) {
        if (this.isComplete) return;
        this.isComplete = true;
        const summary = this.puzzleData.educationalSummary || '';
        const feedback = document.getElementById('guess-feedback');
        const detailLines = [
            `Exploit success rate: ${Math.floor(this.patchMetrics.exploitSuccessRate)}%`,
            `Vault health: ${Math.floor(this.patchMetrics.vaultHealth)}%`,
            `Vulnerabilities remaining: ${this.patchMetrics.vulnerabilityCountRemaining}`
        ];

        if (success && tier) {
            const penaltyMsg = tier.scorePenaltyPercent > 0
                ? `<div style="color:var(--cyber-orange);">Partial remediation — ${tier.scorePenaltyPercent}% score penalty applied. Risk remains above zero.</div>`
                : '';
            if (feedback) feedback.innerHTML += this.renderMissionDebrief({
                tone: tier.scorePenaltyPercent > 0 ? 'warning' : 'success',
                title: `${tier.label} - ${tier.starRating} star${tier.starRating !== 1 ? 's' : ''}`,
                summary,
                details: detailLines,
                insight: penaltyMsg ? 'Residual risk remains. Re-testing after every deployment matters.' : (this.mission.knowledgeSummary?.insight || '')
            });
            // Apply score penalty
            if (tier.scorePenaltyPercent > 0) {
                const penalty = Math.floor(this.gameScreen.game.score.getScore() * (tier.scorePenaltyPercent / 100));
                this.gameScreen.game.score.subtractPoints(penalty);
            }
        } else if (success) {
            if (feedback) feedback.innerHTML += this.renderMissionDebrief({
                tone: 'success',
                title: 'Remediation successful',
                summary,
                details: detailLines,
                insight: this.mission.knowledgeSummary?.insight || ''
            });
        } else {
            if (feedback) feedback.innerHTML += this.renderMissionDebrief({
                tone: 'error',
                title: 'Remediation failed',
                summary,
                details: detailLines,
                insight: 'Zero-day response fails when teams stop after the first visible fix.'
            });
        }

        if (success) {
            this.audio.playSuccess(); this.gameScreen.ui.flashScreen('rgba(0,255,65,0.2)', 300);
            this.gameScreen.ui.showNotification(this.mission.successFeedback || 'Remediation successful.', 'success');
            setTimeout(() => this.gameScreen.completePuzzle(true), 1200);
        } else {
            this.audio.playFailure(); this.gameScreen.ui.flashScreen('rgba(255,0,110,0.2)', 300);
            this.gameScreen.ui.showNotification(this.mission.failureFeedback || 'Remediation failed.', 'error');
            setTimeout(() => this.gameScreen.completePuzzle(false), 1200);
        }
    }

    revealSecondaryPatchVulnerability() {
        const secondary = this.puzzleData.exploitSimulationLogic?.secondaryReveal || {};
        const vulnId = secondary.revealVulnerabilityId || 'vuln_static_api_token';
        if (this.patchSecondaryRevealed) return;
        const target = (this.puzzleData.vulnerabilities || []).find(v => v.id === vulnId);
        if (target) target.status = 'open';
        this.patchSecondaryRevealed = true;
        this.refreshPatchVulnerabilityCount();
        this.appendPatchLog(secondary.revealMessage || 'Secondary access path detected.');
        this.gameScreen.ui.showNotification(secondary.revealMessage || 'Secondary access path detected.', 'warning');
    }

    applyPatchDelayEscalation() {
        const delayed = this.puzzleData.exploitSimulationLogic?.delayedEscalation || {};
        if (!delayed.enabled) return;
        if (this.patchTurnsSincePatch < Number(delayed.turnsWithoutPatchThreshold || 2)) return;
        this.patchMetrics.exploitSuccessRate += Number(delayed.exploitSuccessRateIncreasePerTrigger || 5);
        this.patchMetrics.vaultHealth -= Number(delayed.vaultHealthDropPerTrigger || 3);
        this.appendPatchLog(delayed.message || 'Threat pressure rising due to delayed remediation.');
    }

    getPatchRemainingVulnerabilities() {
        return (this.puzzleData.vulnerabilities || []).filter(v => v.status !== 'hidden' && !this.patchClosedVulns.has(v.id));
    }

    refreshPatchVulnerabilityCount() {
        this.patchMetrics.vulnerabilityCountRemaining = this.getPatchRemainingVulnerabilities().length;
    }

    clampPatchMetrics() {
        const guard = this.puzzleData.exploitSimulationLogic?.metricGuards || {};
        const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
        this.patchMetrics.exploitSuccessRate = clamp(this.patchMetrics.exploitSuccessRate, Number(guard.exploitSuccessRateMin ?? 0), Number(guard.exploitSuccessRateMax ?? 100));
        this.patchMetrics.serverLoad = clamp(this.patchMetrics.serverLoad, Number(guard.serverLoadMin ?? 0), Number(guard.serverLoadMax ?? 100));
        this.patchMetrics.userExperienceScore = clamp(this.patchMetrics.userExperienceScore, Number(guard.userExperienceScoreMin ?? 0), Number(guard.userExperienceScoreMax ?? 100));
        this.patchMetrics.vaultHealth = clamp(this.patchMetrics.vaultHealth, Number(guard.vaultHealthMin ?? 0), Number(guard.vaultHealthMax ?? 100));
    }

    updatePatchUI() {
        const setText = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = String(v); };
        setText('patch-vault',   `${Math.floor(this.patchMetrics.vaultHealth)}%`);
        setText('patch-exploit', `${Math.floor(this.patchMetrics.exploitSuccessRate)}%`);
        setText('patch-load',    `${Math.floor(this.patchMetrics.serverLoad)}%`);
        setText('patch-ux',      `${Math.floor(this.patchMetrics.userExperienceScore)}%`);
        setText('patch-vuln',    `${this.patchMetrics.vulnerabilityCountRemaining}`);
        const fill = document.getElementById('patch-vault-fill');
        if (fill) fill.style.width = `${Math.max(0, Math.min(100, this.patchMetrics.vaultHealth))}%`;
    }

    appendPatchLog(message) {
        this.patchActivityLog.push(message);
        const feedback = document.getElementById('guess-feedback');
        if (!feedback) return;
        const line = document.createElement('div'); line.textContent = `• ${message}`;
        feedback.appendChild(line); feedback.scrollTop = feedback.scrollHeight;
    }

    evaluatePatchRule(rule) {
        const value = Number(this.patchMetrics?.[rule.metric] ?? 0);
        const expected = Number(rule.value);
        if (rule.operator === '==') return value === expected;
        if (rule.operator === '>') return value > expected;
        if (rule.operator === '>=') return value >= expected;
        if (rule.operator === '<') return value < expected;
        if (rule.operator === '<=') return value <= expected;
        return false;
    }

    // ─── LEVEL 10: enterprise architecture with live rating preview ───────────

    buildEnterpriseDefaultConfig() {
        return {
            minimum_length: "12",
            allow_passphrases: "yes",
            require_complexity: "yes",
            block_common_passwords: "yes",
            password_storage: "hash_salt",
            authentication_controls: "app_mfa",
            login_protection: "rate_limiting",
            monitoring_response: "breach_alerts"
        };
    }

    renderEnterpriseArchitectureSimulationPuzzle(container) {
        this.visualizerElement = container;
        const opts = this.puzzleData.configurationOptions || {};
        const policy = opts.passwordPolicy?.options || [];
        const storage = opts.passwordStorage?.options || [];
        const auth = opts.authenticationControls?.options || [];
        const login = opts.loginProtection?.options || [];
        const monitor = opts.monitoringResponse?.options || [];
        const attacks = Array.isArray(this.puzzleData.attackSimulationMatrix) ? this.puzzleData.attackSimulationMatrix : [];
        const previewRating = this.calculateEnterpriseRatingFromCurrentConfig();
        const previewSummary = this.getEnterprisePreviewSummary();

        const select = (id, values, current) => `
            <select id="${id}" class="ea-select">
                ${values.map(v => {
                    const val = typeof v === 'string' ? v : v.id;
                    const label = typeof v === 'string' ? v : v.label;
                    return `<option value="${val}" ${String(val) === String(current) ? 'selected' : ''}>${label}</option>`;
                }).join('')}
            </select>`;

        const policyMarkup = policy.map(p => `
            <div class="ea-config-card">
                <div class="ea-config-card__title">${p.label}</div>
                ${select(`ea-${p.id}`, p.values || [], this.enterpriseConfig[p.id])}
            </div>`).join('');

        const selectCards = [
            { title: 'Password Storage', id: 'ea-password_storage', markup: select('ea-password_storage', storage, this.enterpriseConfig.password_storage) },
            { title: 'Authentication Controls', id: 'ea-authentication_controls', markup: select('ea-authentication_controls', auth, this.enterpriseConfig.authentication_controls) },
            { title: 'Login Protection', id: 'ea-login_protection', markup: select('ea-login_protection', login, this.enterpriseConfig.login_protection) },
            { title: 'Monitoring & Response', id: 'ea-monitoring_response', markup: select('ea-monitoring_response', monitor, this.enterpriseConfig.monitoring_response) },
        ].map(card => `
            <div class="ea-config-card">
                <div class="ea-config-card__title">${card.title}</div>
                ${card.markup}
            </div>`).join('');

        const attackMarkup = attacks.map(attack => `
            <div class="ea-attack-card">
                <div class="ea-attack-card__title">${attack.attackName}</div>
                <div class="ea-attack-card__meta">Strong counters: ${(attack.strongCounters || []).join(', ')}</div>
                <div class="ea-attack-card__meta">Partial counters: ${(attack.partialCounters || []).join(', ')}</div>
            </div>`).join('');

        container.innerHTML = `
            <style>
                .ea-shell{background:linear-gradient(180deg,#070b12 0%,#05080f 100%);color:#eef2ff;border:1px solid rgba(127,213,255,.14);box-shadow:0 20px 60px rgba(0,0,0,.35)}
                .ea-header{display:flex;justify-content:space-between;align-items:center;padding:16px 26px;background:#0a0d18;border-bottom:1px solid rgba(127,213,255,.25);gap:16px;flex-wrap:wrap}
                .ea-brand,.ea-level,.ea-status,.ea-phase,.ea-kicker,.ea-config-card__title,.ea-preview-label,.ea-attempts{font-family:Consolas,"Courier New",monospace;letter-spacing:.18em;text-transform:uppercase}
                .ea-brand{color:#7fd5ff;font-weight:700}.ea-level{color:rgba(127,213,255,.72);font-size:.85rem}.ea-status{color:#00e87a;font-size:.82rem}
                .ea-phases{display:grid;grid-template-columns:repeat(3,1fr);background:#0b101b;border-bottom:1px solid rgba(127,213,255,.12)}
                .ea-phase{padding:14px 10px;text-align:center;color:rgba(180,190,230,.35);border-bottom:2px solid transparent;font-size:.78rem}.ea-phase span{display:block;font-size:1.6rem;font-weight:700;line-height:1.1}
                .ea-phase.active{color:#7fd5ff;background:rgba(127,213,255,.05);border-bottom-color:#7fd5ff}
                .ea-hint-strip{padding:12px 28px;background:rgba(0,212,255,.04);border-bottom:1px solid rgba(0,212,255,.12);color:rgba(0,212,255,.78);font-family:Consolas,"Courier New",monospace;letter-spacing:.12em;font-size:.82rem}
                .ea-grid{display:grid;grid-template-columns:1.15fr 360px;gap:0;min-height:700px}.ea-main,.ea-side{padding:24px;background:rgba(0,0,0,.18)}.ea-main{border-right:1px solid rgba(127,213,255,.12)}
                .ea-kicker{font-size:.74rem;color:rgba(127,213,255,.64);margin-bottom:12px}
                .ea-brief,.ea-preview,.ea-attack-card,.ea-config-card,.ea-report{background:rgba(0,0,0,.34);border:1px solid rgba(127,213,255,.12)}
                .ea-brief,.ea-preview,.ea-report{padding:16px}.ea-brief strong{color:#7fd5ff}
                .ea-design-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}.ea-config-card{padding:14px}
                .ea-config-card__title{color:#7fd5ff;font-size:.72rem;margin-bottom:10px}.ea-select{width:100%;padding:11px 12px;background:rgba(255,255,255,.03);border:1px solid rgba(127,213,255,.16);color:#eef2ff}
                .ea-preview{display:grid;gap:12px}.ea-preview-head{display:flex;justify-content:space-between;align-items:center;gap:12px}
                .ea-preview-label{color:rgba(127,213,255,.68);font-size:.72rem}.ea-preview-rating{font-size:2rem;font-weight:700}.ea-preview-copy{color:rgba(180,190,230,.66);line-height:1.6}
                .ea-attack-grid{display:grid;gap:12px}.ea-attack-card{padding:14px}.ea-attack-card__title{color:#eef2ff;font-weight:700}.ea-attack-card__meta{margin-top:8px;color:rgba(180,190,230,.62);font-size:.82rem;line-height:1.5}
                .ea-actions{margin-top:18px}.ea-report{margin-top:18px;max-height:260px;overflow:auto;text-align:left;color:rgba(220,228,245,.86)}.ea-attempts{text-align:center;margin-top:16px;color:var(--text-secondary)}
                @media (max-width:1080px){.ea-grid{grid-template-columns:1fr}.ea-main{border-right:0;border-bottom:1px solid rgba(127,213,255,.12)}.ea-design-grid{grid-template-columns:1fr}}
                @media (max-width:720px){.ea-header{padding:14px 18px}.ea-main,.ea-side{padding:18px}.ea-phases{grid-template-columns:1fr}}
            </style>
            ${this.renderSharedPasswordLabThemeStyles()}
            ${this.renderSharedPasswordLabFrame({
                levelLabel: `// LEVEL ${String(this.mission.level || 0).padStart(2, '0')} - CERTIFICATION BOARD`,
                title: 'ENTERPRISE SECURITY<br>ARCHITECT',
                status: 'FINAL CERTIFICATION BOARD',
                phases: [
                    { label: 'DESIGN STACK', active: true },
                    { label: 'ATTACK MATRIX', active: this.attempts > 0 },
                    { label: 'EARN RATING', active: this.isComplete || this.attempts > 0 }
                ],
                content: `
                    <div class="ea-shell">
                        <div class="ea-header">
                            <div class="ea-brand">SHADOWDEF</div>
                            <div class="ea-level">LEVEL ${this.mission.level} - ENTERPRISE SECURITY ARCHITECT</div>
                            <div class="ea-status">FINAL CERTIFICATION BOARD</div>
                        </div>
                        <div class="ea-phases">
                            <div class="ea-phase active"><span>01</span>DESIGN STACK</div>
                            <div class="ea-phase"><span>02</span>RUN ATTACK MATRIX</div>
                            <div class="ea-phase"><span>03</span>EARN RATING</div>
                        </div>
                        <div class="ea-hint-strip">HINT: Great architectures balance storage, MFA, login controls, and detection. Maxing one axis while ignoring another creates exploitable gaps.</div>
                        <div class="ea-grid">
                            <main class="ea-main">
                                <div class="ea-kicker">Certification Brief</div>
                                <div class="ea-brief">
                                    <div><strong>Objective:</strong> ${this.mission.objective || ''}</div>
                                    <div><strong>Scenario:</strong> ${this.mission.scenario || ''}</div>
                                    <div><strong>Task:</strong> ${this.mission.userTask || ''}</div>
                                </div>
                                <div class="ea-kicker" style="margin-top:18px;">Architecture Studio</div>
                                <div class="ea-design-grid">
                                    ${policyMarkup}
                                    ${selectCards}
                                </div>
                                <div class="ea-actions">
                                    <button class="btn btn-primary" id="ea-run-assessment">RUN CERTIFICATION EVALUATION</button>
                                </div>
                                <div class="ea-report guess-feedback" id="guess-feedback">Configure the architecture, review the live preview, then run the certification board.</div>
                            </main>
                            <aside class="ea-side">
                                <div class="ea-kicker">Live Certification Preview</div>
                                <div class="ea-preview">
                                    <div class="ea-preview-head">
                                        <div>
                                            <div class="ea-preview-label">${this.puzzleData.livePreview?.label || 'Estimated rating'}</div>
                                            <div id="ea-live-rating" class="ea-preview-rating">${previewRating}</div>
                                        </div>
                                        <div class="ea-preview-copy">${this.puzzleData.livePreview?.footnote || ''}</div>
                                    </div>
                                    <div class="ea-preview-copy" id="ea-preview-summary">${previewSummary}</div>
                                </div>
                                <div class="ea-kicker" style="margin-top:18px;">Controlled Attack Matrix</div>
                                <div class="ea-attack-grid">${attackMarkup}</div>
                                <div id="attempt-counter" class="ea-attempts">Certification run pending</div>
                            </aside>
                        </div>
                    </div>`
            })}`;

        this.setupEnterpriseArchitectureEventListeners();
        if (this.puzzleData.livePreview?.enabled) this.updateEnterpriseRatingPreview();
        this.startHumanLabMatrixAnimation();
        this.gameScreen.syncEmbeddedMissionHUD();
    }

    setupEnterpriseArchitectureEventListeners() {
        const keys = ["minimum_length","allow_passphrases","require_complexity","block_common_passwords","password_storage","authentication_controls","login_protection","monitoring_response"];
        keys.forEach(key => {
            const el = document.getElementById(`ea-${key}`);
            if (!el) return;
            el.addEventListener('change', () => {
                this.enterpriseConfig[key] = el.value;
                this.audio.playButtonClick();
                // FIX L10: update live preview on every change
                if (this.puzzleData.livePreview?.enabled) this.updateEnterpriseRatingPreview();
            });
        });
        document.getElementById('ea-run-assessment')?.addEventListener('click', () => this.runEnterpriseArchitectureAssessment());
    }

    // FIX L10: compute and display live rating during design phase
    updateEnterpriseRatingPreview() {
        const rating = this.calculateEnterpriseRatingFromCurrentConfig();
        const liveEl = document.getElementById('ea-live-rating');
        const summaryEl = document.getElementById('ea-preview-summary');
        if (!liveEl) return;
        const colors = { 'A+': 'var(--cyber-green)', 'A': 'var(--cyber-blue)', 'B': 'var(--cyber-orange)', 'C': 'var(--cyber-pink)' };
        liveEl.textContent = rating;
        liveEl.style.color = colors[rating] || 'var(--cyber-blue)';
        if (summaryEl) summaryEl.textContent = this.getEnterprisePreviewSummary();
    }

    getEnterprisePreviewSummary() {
        const cfg = this.enterpriseConfig;
        const strengths = [];
        const gaps = [];

        if (cfg.password_storage === 'hash_salt_iteration') strengths.push('slow salted password storage');
        else if (cfg.password_storage === 'hash_salt') strengths.push('salted password storage');
        else gaps.push('password storage is still too weak against database theft');

        if (cfg.authentication_controls === 'hardware_key_mfa' || cfg.authentication_controls === 'app_mfa') strengths.push('strong MFA coverage');
        else gaps.push('MFA is weak or missing against phishing and credential stuffing');

        if (cfg.login_protection === 'adaptive_risk_login' || cfg.login_protection === 'account_lockout' || cfg.login_protection === 'rate_limiting') strengths.push('login abuse resistance');
        else gaps.push('login abuse controls are too light');

        if (cfg.monitoring_response === 'realtime_anomaly' || cfg.monitoring_response === 'breach_alerts') strengths.push('incident detection maturity');
        else gaps.push('detection and response visibility');

        const strongText = strengths.length ? `Current strengths: ${strengths.slice(0, 2).join(', ')}.` : '';
        const gapText = gaps.length ? ` Biggest gap: ${gaps[0]}.` : '';
        return `${strongText}${gapText}`.trim() || 'Balanced controls improve both attack resistance and incident response maturity.';
    }

    calculateEnterpriseRatingFromCurrentConfig() {
        // Quick heuristic scoring for live preview (not the full weighted algo)
        const cfg = this.enterpriseConfig;
        let score = 0;
        // Storage
        if (cfg.password_storage === 'hash_salt_iteration') score += 25;
        else if (cfg.password_storage === 'hash_salt') score += 20;
        else if (cfg.password_storage === 'hash_only') score += 10;
        // MFA
        if (cfg.authentication_controls === 'hardware_key_mfa') score += 25;
        else if (cfg.authentication_controls === 'app_mfa') score += 20;
        else if (cfg.authentication_controls === 'sms_mfa') score += 12;
        // Login protection
        if (cfg.login_protection === 'adaptive_risk_login') score += 20;
        else if (cfg.login_protection === 'account_lockout' || cfg.login_protection === 'captcha') score += 15;
        else if (cfg.login_protection === 'rate_limiting') score += 12;
        // Monitoring
        if (cfg.monitoring_response === 'realtime_anomaly') score += 20;
        else if (cfg.monitoring_response === 'breach_alerts') score += 15;
        else if (cfg.monitoring_response === 'basic_logging') score += 8;
        // Policy bonuses
        if (cfg.block_common_passwords === 'yes') score += 5;
        if (cfg.allow_passphrases === 'yes') score += 3;
        if (cfg.minimum_length === '16') score += 2;

        if (score >= 80) return 'A+';
        if (score >= 65) return 'A';
        if (score >= 45) return 'B';
        return 'C';
    }

    runEnterpriseArchitectureAssessment() {
        if (this.isComplete) return;
        this.attempts++; this.updateAttemptCounter(); this.gameScreen.updateAttempts(this.attempts);
        const attacks = Array.isArray(this.puzzleData.attackSimulationMatrix) ? this.puzzleData.attackSimulationMatrix : [];
        this.enterpriseAttackResults = attacks.map(a => this.evaluateEnterpriseAttack(a));
        this.enterpriseScores = this.calculateEnterpriseScores(this.enterpriseAttackResults);
        this.enterpriseRating = this.calculateEnterpriseRatingFromScore(this.enterpriseScores.finalWeightedScore);
        this.enterpriseBadgeUnlocked = this.isEnterpriseBadgeUnlocked(this.enterpriseRating, this.enterpriseScores.finalWeightedScore);
        this.renderEnterpriseAssessmentFeedback();
        this.isComplete = true;
        this.audio.playSuccess();
        this.gameScreen.ui.flashScreen('rgba(0,255,65,0.2)', 300);
        setTimeout(() => this.gameScreen.completePuzzle(true), 1500);
    }

    evaluateEnterpriseAttack(attack) {
        const cfg = this.enterpriseConfig;
        const chosen = [cfg.password_storage, cfg.authentication_controls, cfg.login_protection, cfg.monitoring_response, cfg.minimum_length, cfg.allow_passphrases, cfg.require_complexity, cfg.block_common_passwords];
        const strong = (attack.strongCounters || []).filter(c => chosen.includes(c)).length;
        const partial = (attack.partialCounters || []).filter(c => chosen.includes(c)).length;
        let outcome = "Successful";
        if (strong >= 2) outcome = "Blocked";
        else if (strong >= 1 || partial >= 1) outcome = "Partially Mitigated";
        return { attackId: attack.attackId, attackName: attack.attackName, outcome };
    }

    calculateEnterpriseScores(results) {
        const algo = this.puzzleData.scoringAlgorithm || {};
        const points = algo.attackOutcomePoints || {};
        const scoreMap = { "Blocked": Number(points.blocked || 100), "Partially Mitigated": Number(points.partially_mitigated || 65), "Successful": Number(points.successful || 25) };
        const avgAttack = results.length ? Math.round(results.reduce((s, r) => s + (scoreMap[r.outcome] || 0), 0) / results.length) : 0;
        const cfg = this.enterpriseConfig;
        const vaultSecurityScore = Math.max(0, Math.min(100, avgAttack + (cfg.password_storage === 'hash_salt_iteration' ? 8 : cfg.password_storage === 'hash_salt' ? 5 : 0)));
        const breachResistanceScore = Math.max(0, Math.min(100, avgAttack + (cfg.authentication_controls === 'hardware_key_mfa' ? 10 : cfg.authentication_controls === 'app_mfa' ? 6 : 0)));
        const userExperienceScore = Math.max(0, Math.min(100, 75 - (cfg.login_protection === 'adaptive_risk_login' ? 4 : 0) - (cfg.authentication_controls === 'hardware_key_mfa' ? 8 : 0) + (cfg.allow_passphrases === 'yes' ? 6 : -3)));
        const operationalStabilityScore = Math.max(0, Math.min(100, 78 - (cfg.monitoring_response === 'realtime_anomaly' ? 8 : cfg.monitoring_response === 'breach_alerts' ? 4 : 0) - (cfg.login_protection === 'adaptive_risk_login' ? 5 : 0)));
        const incidentResponseMaturity = Math.max(0, Math.min(100, (cfg.monitoring_response === 'realtime_anomaly' ? 90 : cfg.monitoring_response === 'breach_alerts' ? 78 : cfg.monitoring_response === 'basic_logging' ? 60 : 35)));
        const w = algo.weightedCategories || {};
        const weighted = vaultSecurityScore * Number(w.vaultSecurityScore?.weight || 0.3) + breachResistanceScore * Number(w.breachResistanceScore?.weight || 0.25) + userExperienceScore * Number(w.userExperienceScore?.weight || 0.15) + operationalStabilityScore * Number(w.operationalStabilityScore?.weight || 0.15) + incidentResponseMaturity * Number(w.incidentResponseMaturity?.weight || 0.15);
        return { vaultSecurityScore: Math.round(vaultSecurityScore), breachResistanceScore: Math.round(breachResistanceScore), userExperienceScore: Math.round(userExperienceScore), operationalStabilityScore: Math.round(operationalStabilityScore), incidentResponseMaturity: Math.round(incidentResponseMaturity), finalWeightedScore: Math.round(weighted) };
    }

    calculateEnterpriseRatingFromScore(score) {
        const rules = this.puzzleData.scoringAlgorithm?.ratingRules || [];
        for (const rule of rules) { if (score >= Number(rule.minScore || 0)) return rule.rating; }
        return 'C';
    }

    isEnterpriseBadgeUnlocked(rating, score) {
        const logic = this.puzzleData.certificationBadgeLogic?.unlockCondition || {};
        const order = { "C": 1, "B": 2, "A": 3, "A+": 4 };
        return (order[rating] || 0) >= (order[logic.minimumRating || 'A'] || 0) && score >= Number(logic.minimumScore || 80);
    }

    renderEnterpriseAssessmentFeedback() {
        const feedback = document.getElementById('guess-feedback');
        if (!feedback) return;
        const fg = this.puzzleData.feedbackGenerator || {};
        const mitigatedCount = this.enterpriseAttackResults.filter(r => r.outcome !== 'Successful').length;
        const totalThreats = this.enterpriseAttackResults.length;
        const areaPairs = [["Vault Security", this.enterpriseScores.vaultSecurityScore], ["Breach Resistance", this.enterpriseScores.breachResistanceScore], ["User Experience", this.enterpriseScores.userExperienceScore], ["Operational Stability", this.enterpriseScores.operationalStabilityScore], ["Incident Response Maturity", this.enterpriseScores.incidentResponseMaturity]];
        areaPairs.sort((a, b) => b[1] - a[1]);
        const strongestArea = areaPairs[0][0];
        const weakestArea = areaPairs[areaPairs.length - 1][0];
        const recommendation = weakestArea === "Incident Response Maturity" ? "Improve continuous monitoring." : weakestArea === "User Experience" ? "Reduce unnecessary friction while keeping strong controls." : "Strengthen layered controls in weaker architecture areas.";
        const summary = (fg.summaryTemplate || "You successfully mitigated [mitigatedCount] of [totalThreats] simulated threats.").replace("[mitigatedCount]", String(mitigatedCount)).replace("[totalThreats]", String(totalThreats));
        const resultLines = this.enterpriseAttackResults.map(r => `<div>• ${r.attackName}: <strong>${r.outcome}</strong> - ${this.getEnterpriseAttackNarrative(r)}</div>`).join('');
        const badgeLine = this.enterpriseBadgeUnlocked ? `<div><strong>Badge Unlocked:</strong> ${this.puzzleData.certificationBadgeLogic?.badgeName || 'Certified Security Architect'}</div>` : `<div>${this.puzzleData.certificationBadgeLogic?.lockedMessage || ''}</div>`;
        feedback.innerHTML = `
            ${this.renderMissionDebrief({
                tone: this.enterpriseRating === 'A+' || this.enterpriseRating === 'A' ? 'success' : this.enterpriseRating === 'B' ? 'warning' : 'error',
                title: `Final Rating: ${this.enterpriseRating} - ${this.puzzleData.ratingBands?.[this.enterpriseRating] || ''}`,
                summary,
                details: [
                    `Final score: ${this.enterpriseScores.finalWeightedScore}/100`,
                    `Strongest area: ${strongestArea}`,
                    `Weakest area: ${weakestArea}`
                ],
                insight: this.mission.knowledgeSummary?.insight || ''
            })}
            <div style="margin-top:14px;"><strong>Phase 2: Attack Evaluation</strong></div>${resultLines}
            <div style="margin-top:10px;"><strong>Phase 3: Metrics</strong></div>
            <div>Vault Security: ${this.enterpriseScores.vaultSecurityScore} | Breach Resistance: ${this.enterpriseScores.breachResistanceScore}</div>
            <div>User Experience: ${this.enterpriseScores.userExperienceScore} | Stability: ${this.enterpriseScores.operationalStabilityScore} | IR Maturity: ${this.enterpriseScores.incidentResponseMaturity}</div>
            <div>${(fg.recommendationTemplate || "Recommended improvement: [recommendation].").replace("[recommendation]", recommendation)}</div>
            <div style="margin-top:6px;">${fg.humilityMessage || ''}</div>
            <div style="margin-top:8px;">${badgeLine}</div>`;
    }

    // ─── multi-select helpers ────────────────────────────────────────────────

    submitMultiSelectSelection() {
        if (this.isComplete) return;
        if (this.selectedOptions.size === 0) { this.gameScreen.ui.showNotification('Select at least one password before submission.', 'warning'); return; }
        this.attempts++; this.updateAttemptCounter(); this.gameScreen.updateAttempts(this.attempts);
        const selectedIds = Array.from(this.selectedOptions);
        const isValid = typeof this.puzzleData.validateSelection === 'function' ? this.puzzleData.validateSelection(selectedIds, this.session) : false;
        if (isValid) { this.onMultiSelectSuccess(); return; }
        this.showMultiSelectFeedback();
        this.increaseRisk();
        this.revealSecondaryClue();
        if (this.hasRiskBreached()) { this.gameScreen.ui.showNotification(this.riskSystem?.breachMessage || 'Breach simulated.', 'error'); this.onMultiSelectFailure(); return; }
        if (this.attempts >= this.maxAttempts) this.onMultiSelectFailure();
        else this.gameScreen.ui.showNotification(this.interactionMode === 'humanPsychologyLab' ? this.getHumanLabCopyConfig().genericNotification : 'Classification mismatch detected. Reassess behavioral indicators.', 'error');
    }

    clearMultiSelectSelection() {
        this.selectedOptions.clear();
        document.querySelectorAll('[data-option-id].selected').forEach(el => el.classList.remove('selected'));
        this.audio.playButtonClick();
        if (this.isHumanLabShellMode() && this.visualizerElement) {
            this.pushHumanLabLog('sys', 'Selection buffer cleared. Awaiting revised analyst classification.');
            if (this.interactionMode === 'humanPsychologyLab') this.updateHumanPsychologyLiveUI();
            if (this.interactionMode === 'breachTriageLab') this.updateBreachTriageLiveUI();
            return;
        }
    }

    showMultiSelectFeedback() {
        const feedback = document.getElementById('guess-feedback');
        if (!feedback) return;
        const weakCount = (this.session?.options || []).filter(o => o.isWeak).length;
        if (this.interactionMode === 'humanPsychologyLab') {
            const copy = this.getHumanLabCopyConfig();
            const options = this.session?.options || [];
            const selected = options.filter(opt => this.selectedOptions.has(opt.id));
            const falsePositives = selected.filter(opt => !opt.isWeak);
            const missed = options.filter(opt => opt.isWeak && !this.selectedOptions.has(opt.id));
            feedback.innerHTML = `
                <div><strong>${copy.reviewTitle}:</strong> ${copy.reviewSummary}</div>
                <div>${copy.targetCountLabel}: ${weakCount}</div>
                <div>${copy.yourFlaggedCountLabel}: ${this.selectedOptions.size}</div>
                <div>${copy.missedLabel}: ${missed.length}</div>
                <div>${copy.falsePositiveLabel}: ${falsePositives.length}</div>`;
            this.pushHumanLabLog('danger', `Classification mismatch. Missed ${missed.length} weak entry(s) and flagged ${falsePositives.length} resilient credential(s).`);
            return;
        }
        feedback.innerHTML = `<div><strong>SOC Feedback:</strong> Selection pattern does not fully align with observed human-risk behaviors.</div><div>Weak credentials expected in set: ${weakCount}</div><div>Your current selection count: ${this.selectedOptions.size}</div>`;
    }

    revealSecondaryClue() {
        const failHints = Array.isArray(this.session?.failHints) ? this.session.failHints : [];
        let text = '';
        if (failHints.length) { const idx = Math.min(this.attempts - 1, failHints.length - 1); text = failHints[idx] || ''; }
        else if (this.attempts === 1) text = this.session?.subtleClueOnFail || '';
        if (!text) return;
        const hintsContainer = document.getElementById('password-hints');
        if (!hintsContainer) return;
        const clue = document.createElement('div');
        clue.className = this.isHumanLabShellMode() ? 'l1-hint animate-fadeIn' : 'hint animate-fadeIn';
        clue.textContent = this.isHumanLabShellMode() ? text : `→ ${text}`;
        hintsContainer.appendChild(clue);
        if (this.isHumanLabShellMode()) {
            this.pushHumanLabLog('warn', `Additional analyst clue injected: ${text}`);
        }
    }

    renderSecurityInsight() {
        const feedback = document.getElementById('guess-feedback');
        if (!feedback) return;
        const insights = Array.isArray(this.session?.securityInsight) ? this.session.securityInsight : [];
        const correctWeak = Array.isArray(this.session?.correctWeakPasswords) ? this.session.correctWeakPasswords : [];
        const humanLabCopy = this.getHumanLabCopyConfig();
        const answersLine = correctWeak.length ? `<div><strong>${this.interactionMode === 'humanPsychologyLab' ? humanLabCopy.correctSelectionLabel : 'Correct weak passwords'}:</strong> ${correctWeak.join(', ')}</div>` : '';
        if (this.interactionMode === 'humanPsychologyLab') {
            feedback.innerHTML = `${answersLine}<div><strong>Analyst Debrief:</strong></div><div>• ${insights.join('</div><div>• ')}</div>`;
            this.pushHumanLabLog('ok', `Debrief ready. Verified weak credentials: ${correctWeak.join(', ') || 'none listed'}.`);
            return;
        }
        feedback.innerHTML = `${answersLine}<div><strong>Security Insight:</strong></div><div>• ${insights.join('</div><div>• ')}</div>`;
    }

    onMultiSelectSuccess() {
        const copy = this.getHumanLabCopyConfig();
        this.isComplete = true;
        this.audio.playSuccess();
        this.gameScreen.ui.flashScreen('rgba(0,255,65,0.2)', 300);
        this.updateHumanPsychologyLiveUI();
        this.renderSecurityInsight();
        const feedback = document.getElementById('guess-feedback');
        if (feedback) {
            feedback.innerHTML += this.renderMissionDebrief({
                tone: 'success',
                title: this.interactionMode === 'humanPsychologyLab' ? copy.successTitle : 'Weak credential set identified',
                summary: this.mission.successFeedback || 'You separated predictable passwords from resilient ones.',
                details: [
                    `Submissions used: ${this.attempts}`,
                    `Final risk meter: ${Math.round(this.riskValue)}%`
                ],
                insight: this.mission.knowledgeSummary?.insight || ''
            });
        }
        this.pushHumanLabLog('ok', copy.successLog);
        this.gameScreen.ui.showNotification(this.mission.successFeedback || 'Credential vulnerability identified.', 'success');
        setTimeout(() => this.gameScreen.completePuzzle(true), 1400);
    }

    onMultiSelectFailure() {
        const copy = this.getHumanLabCopyConfig();
        this.isComplete = true;
        this.audio.playFailure();
        document.querySelectorAll('[data-option-id]').forEach(el => el.disabled = true);
        this.updateHumanPsychologyLiveUI();
        this.renderSecurityInsight();
        const feedback = document.getElementById('guess-feedback');
        if (feedback) {
            feedback.innerHTML += this.renderMissionDebrief({
                tone: 'error',
                title: this.interactionMode === 'humanPsychologyLab' ? copy.failureTitle : 'Attacker shortcut missed',
                summary: this.mission.failureFeedback || 'Security oversight detected.',
                details: [
                    `Submissions used: ${this.attempts}`,
                    `Final risk meter: ${Math.round(this.riskValue)}%`
                ],
                insight: this.mission.knowledgeSummary?.insight || ''
            });
        }
        this.pushHumanLabLog('danger', copy.failureLog);
        this.gameScreen.ui.showNotification(this.mission.failureFeedback || 'Security oversight detected.', 'error');
        setTimeout(() => this.gameScreen.completePuzzle(false), 1700);
    }

    getSignalInterceptConfig() {
        return {
            laneLabels: Array.isArray(this.puzzleData.laneLabels) && this.puzzleData.laneLabels.length
                ? this.puzzleData.laneLabels
                : ['PORT 443', 'PORT 80', 'PORT 53', 'PORT 8080', 'PORT 22'],
            packetTypes: this.puzzleData.packetTypes || {},
            waves: Array.isArray(this.puzzleData.waves) ? this.puzzleData.waves : [],
            server: {
                label: this.puzzleData.server?.label || 'CORP-SRV',
                integrity: Number(this.puzzleData.server?.integrity || 100)
            },
            attacker: {
                label: this.puzzleData.attacker?.label || 'ATTACKER'
            },
            legendOrder: Array.isArray(this.puzzleData.legendOrder) && this.puzzleData.legendOrder.length
                ? this.puzzleData.legendOrder
                : ['c2', 'exfil', 'dnstun', 'http', 'auth'],
            scoring: {
                waveEndHigh: Number(this.puzzleData.scoring?.waveEndHigh || 500),
                waveEndMid: Number(this.puzzleData.scoring?.waveEndMid || 250),
                waveEndLow: Number(this.puzzleData.scoring?.waveEndLow || 100),
                integrityMultiplier: Number(this.puzzleData.scoring?.integrityMultiplier || 8),
                accuracy90: Number(this.puzzleData.scoring?.accuracy90 || 1000),
                accuracy75: Number(this.puzzleData.scoring?.accuracy75 || 500),
                accuracyFallback: Number(this.puzzleData.scoring?.accuracyFallback || 200),
                comboMultiplier: Number(this.puzzleData.scoring?.comboMultiplier || 50),
                falsePositivePenalty: Number(this.puzzleData.scoring?.falsePositivePenalty || 30),
                missedPenalty: Number(this.puzzleData.scoring?.missedPenalty || 50)
            },
            waveTransitionDelayMs: Number(this.puzzleData.waveTransitionDelayMs || 1500),
            completionDelayMs: Number(this.puzzleData.completionDelayMs || 1800)
        };
    }

    getSignalCurrentWave() {
        return this.getSignalInterceptConfig().waves[this.signalCurrentWaveIndex] || null;
    }

    renderSignalInterceptLevelOneStyles() {
        return `<style>
            .l1-body{grid-template-columns:minmax(0,1fr) 300px}
            .l1-arena-scroll{padding:12px 18px 10px;display:flex;flex-direction:column;gap:10px}
            .l1-feedback.sigl-card,.l1-feedback.sigl-arena-card{margin-bottom:0}
            .l1-console{min-width:280px}
            .l1-phase.done{color:var(--l1-green)}
            .l1-phase.done .l1-phase__dot{background:var(--l1-green);box-shadow:0 0 14px rgba(0,255,136,.3)}
            .sigl-brief-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(240px,280px);gap:10px}
            .sigl-card,.sigl-arena-card{padding:0}
            .sigl-kicker,.sig-node-label,.sig-feed-time,.sig-feed-type,.sig-overlay-sub,.sig-overlay-threats,.sigl-legend-item{font-family:'Courier Prime','Share Tech Mono',monospace;text-transform:uppercase;letter-spacing:.18em}
            .sigl-kicker{font-size:10px;color:var(--l1-text-low);margin-bottom:8px}
            .sigl-copy{font-size:11px;line-height:1.7;color:var(--l1-text-mid)}
            .sigl-legend-grid{display:grid;gap:8px}
            .sigl-legend-item{display:flex;align-items:center;gap:8px;padding:8px 10px;border:1px solid rgba(23,216,255,.12);background:rgba(255,255,255,.02);font-size:9px;color:var(--l1-text)}
            .sigl-legend-item strong{margin-left:auto;color:var(--l1-cyan);font-size:8px}
            .sigl-legend-dot{width:10px;height:10px;border-radius:3px;flex-shrink:0}
            .sigl-legend-name{flex:1}
            .sigl-panel-head{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:8px}
            .sigl-panel-title{font-family:'Teko',sans-serif;font-size:32px;letter-spacing:2px;line-height:1;color:var(--l1-cyan)}
            .sigl-panel-copy{max-width:340px;font-size:10px;line-height:1.7;color:var(--l1-text-mid);text-align:right}
            .sigl-arena-stage{position:relative;min-height:clamp(600px,72vh,820px);border:1px solid rgba(23,216,255,.14);background:linear-gradient(180deg,#020c14 0%,#040e18 100%);overflow:hidden}
            .sig-arena{position:relative;overflow:hidden;min-height:clamp(600px,72vh,820px);background:linear-gradient(180deg,#020c14 0%,#040e18 100%)}
            .sig-arena::before{content:'';position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 40px,rgba(0,255,231,.025) 40px,rgba(0,255,231,.025) 41px),repeating-linear-gradient(90deg,transparent,transparent 60px,rgba(0,255,231,.02) 60px,rgba(0,255,231,.02) 61px);pointer-events:none}
            .sig-canvas{position:absolute;inset:0;width:100%;height:100%}
            .sig-sweep{position:absolute;top:0;bottom:0;width:2px;background:linear-gradient(180deg,transparent,rgba(0,255,231,.15),transparent);animation:sigSweep 4s linear infinite;pointer-events:none;z-index:3}
            .sig-atk-node,.sig-server-node{position:absolute;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;align-items:center;gap:6px;z-index:5}
            .sig-atk-node{left:16px}.sig-server-node{right:30px}
            .sig-atk-box{width:44px;height:60px;border:2px solid rgba(255,23,68,.35);background:rgba(20,4,8,.8);display:flex;align-items:center;justify-content:center}
            .sig-server-box{width:52px;height:70px;border:2px solid rgba(0,255,231,.4);background:rgba(0,20,32,.8);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;transition:border-color .2s,box-shadow .2s}
            .sig-server-box.hit{border-color:#ff1744 !important;box-shadow:0 0 30px rgba(255,23,68,.55) !important}
            .sig-server-box.ok{border-color:#00e676;box-shadow:0 0 16px rgba(0,230,118,.32)}
            .sig-node-label{font-size:8px;color:rgba(160,200,216,.48)}
            .sig-led,.sig-led-ok{width:6px;height:6px;border-radius:50%}
            .sig-led{background:#00ffe7;box-shadow:0 0 6px #00ffe7;animation:sigBlink .8s infinite}
            .sig-led-ok{background:#00e676;box-shadow:0 0 6px #00e676}
            .sig-lane-labels{position:absolute;left:72px;top:0;bottom:0;z-index:4;pointer-events:none}
            .sig-lane-label{position:absolute;font-size:8px;color:rgba(160,200,216,.24)}
            .sig-wave-overlay,.sig-outcome-overlay{position:absolute;inset:18px;display:flex;align-items:center;justify-content:center;z-index:8;background:rgba(4,12,16,.86);opacity:0;pointer-events:none;transition:opacity .35s}
            .sig-wave-overlay.show,.sig-outcome-overlay.show{opacity:1;pointer-events:auto}
            .sig-wave-card,.sig-outcome-card{padding:28px 34px;max-width:520px;width:min(92%,520px);text-align:center;background:rgba(7,21,32,.96);border:1px solid var(--l1-rim2)}
            .sig-overlay-sub{font-size:10px;color:rgba(23,216,255,.5);margin-bottom:10px}
            .sig-overlay-title{font-family:'Bebas Neue',sans-serif;font-size:46px;font-weight:700;color:var(--l1-cyan);letter-spacing:.16em;text-shadow:0 0 24px rgba(23,216,255,.28);margin-bottom:6px}
            .sig-overlay-subtitle{font-family:'Teko',sans-serif;font-size:20px;color:var(--l1-red);letter-spacing:.14em;margin-bottom:8px}
            .sig-overlay-desc{font-size:11px;color:rgba(160,200,216,.55);line-height:1.9;letter-spacing:.12em;margin-bottom:16px}
            .sig-overlay-threats{font-size:10px;color:rgba(160,200,216,.38);margin-bottom:18px}
            .sig-overlay-note{margin-top:10px;font-size:9px;color:rgba(168,216,232,.54);letter-spacing:.18em;text-transform:uppercase}
            .sig-overlay-threats span{color:var(--l1-red)}
            .sig-overlay-threats strong{color:var(--l1-green);font-weight:400}
            .sig-wave-btn{font-family:'Courier Prime','Share Tech Mono',monospace;font-size:11px;letter-spacing:.22em;padding:12px 28px;border:1px solid var(--l1-cyan);background:rgba(23,216,255,.08);color:var(--l1-cyan);cursor:pointer}
            .sig-wave-btn:hover{background:rgba(23,216,255,.16);box-shadow:0 0 18px rgba(23,216,255,.2)}
            .sig-outcome-card.fail{border-color:rgba(255,23,68,.28)}
            .sig-outcome-card.fail .sig-overlay-title{color:#ff1744;text-shadow:0 0 28px rgba(255,23,68,.28)}
            .sig-outcome-score{font-family:'Orbitron',monospace;font-size:28px;color:#ffd600;margin-bottom:8px}
            .sig-outcome-body{font-size:10px;color:rgba(160,200,216,.52);letter-spacing:.1em;line-height:1.9;margin-bottom:16px}
            .sig-outcome-rows{display:grid;gap:6px;text-align:left}
            .sig-outcome-row{display:flex;justify-content:space-between;gap:12px;padding:5px 0;border-bottom:1px solid rgba(0,255,231,.08);font-size:9px}
            .sig-outcome-key{color:rgba(160,200,216,.42)}
            .sig-outcome-value{color:#ffd600}
            .sig-outcome-value.neg{color:#ff1744}
            .sig-combo{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-family:'Orbitron',monospace;font-size:28px;font-weight:900;letter-spacing:.2em;pointer-events:none;z-index:7;opacity:0}
            .sig-toast{position:absolute;right:18px;bottom:18px;max-width:280px;padding:9px 14px;font-size:9px;letter-spacing:.1em;border:1px solid;background:#040c10;transform:translateX(140%);transition:transform .25s;z-index:10}
            .sig-toast.show{transform:translateX(0)}
            .sig-toast.good{border-color:#00e676;color:#00e676}
            .sig-toast.bad{border-color:#ff1744;color:#ff1744}
            .sig-toast.info{border-color:#00ffe7;color:#00ffe7}
            .sig-toast.warn{border-color:#ff9100;color:#ff9100}
            .sig-feed{display:flex;flex-direction:column;gap:5px}
            .sig-feed-item{padding:5px 8px;border:1px solid rgba(0,255,231,.06);font-size:9px;line-height:1.7;letter-spacing:.04em;border-left:2px solid}
            .sig-feed-item.blocked{border-left-color:#00e676;background:rgba(0,230,118,.04)}
            .sig-feed-item.missed{border-left-color:#ff1744;background:rgba(255,23,68,.04)}
            .sig-feed-item.false{border-left-color:#c060ff;background:rgba(192,96,255,.04)}
            .sig-feed-type{color:#00ffe7}
            .sig-feed-item.blocked .sig-feed-type{color:#00e676}
            .sig-feed-item.missed .sig-feed-type{color:#ff1744}
            .sig-feed-item.false .sig-feed-type{color:#c060ff}
            .sig-feed-time{color:var(--l1-text-low)}
            .l1-flag-slot.done{border-color:var(--l1-green);background:rgba(0,255,136,.08);color:var(--l1-green)}
            .l1-flag-slot.current{border-color:var(--l1-cyan);background:rgba(23,216,255,.08);color:var(--l1-cyan);box-shadow:0 0 10px rgba(23,216,255,.16)}
            @keyframes sigBlink{0%,100%{opacity:1}50%{opacity:.15}}
            @keyframes sigSweep{0%{left:-2px}100%{left:100%}}
            @media (max-width:1080px){
                .l1-body{grid-template-columns:1fr}
                .l1-arena-scroll{padding:12px 16px 10px}
                .sigl-brief-grid{grid-template-columns:1fr}
                .sigl-panel-head{flex-direction:column;align-items:flex-start}
                .sigl-panel-copy{text-align:left;max-width:none}
                .sig-arena,.sigl-arena-stage{min-height:520px}
            }
        </style>`;
    }

    renderSignalInterceptLevelOneMarkup({
        config,
        currentWave,
        totalWaves,
        visibleWave,
        hintsRemaining,
        scoreDisplay,
        accuracy,
        timeDisplay,
        statusText,
        phaseMarkup,
        threatMarkup,
        legendMarkup,
        waveTimerPercent,
        startLabel,
        briefText,
        scenarioText,
        taskText
    }) {
        return `
            ${this.renderHumanPsychologyLabStyles()}
            ${this.renderSignalInterceptLevelOneStyles()}
            <div class="l1-shell">
                <canvas class="l1-matrix" id="l1-matrix" aria-hidden="true"></canvas>
                <div class="l1-crt" aria-hidden="true"></div>
                <div class="l1-scanline" aria-hidden="true"></div>

                <header class="l1-top-hud">
                    <div class="l1-hud-logo">
                        <div class="l1-logo-badge">⬡</div>
                        <div class="l1-logo-text">SHADOWDEF</div>
                    </div>
                    <div class="l1-hud-mission">
                        <div class="l1-hud-kicker">// LEVEL ${String(this.mission.level || 0).padStart(2, '0')} - NETWORK OPERATIONS</div>
                        <div class="l1-hud-title">OPERATION<br>SIGNAL INTERCEPT</div>
                    </div>
                    <div class="l1-hud-stats">
                        <div class="l1-hud-stat">
                            <div class="l1-hud-label">Time</div>
                            <div class="l1-hud-value" id="l1-timer">${timeDisplay}</div>
                        </div>
                        <div class="l1-hud-stat">
                            <div class="l1-hud-label">Score</div>
                            <div class="l1-hud-value l1-hud-value--cyan" id="l1-score">${scoreDisplay}</div>
                        </div>
                        <div class="l1-hud-stat">
                            <div class="l1-hud-label">Wave</div>
                            <div class="l1-hud-value l1-hud-value--red" id="l1-combo">${visibleWave}/${totalWaves}</div>
                        </div>
                        <div class="l1-hud-meter">
                            <div class="l1-hud-label">Integrity</div>
                            <div class="l1-hud-track">
                                <div class="l1-hud-fill" id="l1-xp-fill" style="width:${this.signalIntegrity}%"></div>
                            </div>
                        </div>
                    </div>
                    <div class="l1-hud-actions">
                        <button class="l1-hud-btn" data-action="pause" type="button">[ PAUSE ]</button>
                        <button class="l1-hud-btn" data-action="back-to-levels" type="button">[ BACK ]</button>
                    </div>
                </header>

                <div class="l1-mission-strip">
                    ${phaseMarkup}
                    <div class="l1-mission-status" id="signal-mission-status">
                        <span class="l1-mission-status__dot"></span>
                        ${statusText}
                    </div>
                </div>

                <div class="l1-body">
                    <section class="l1-arena">
                        <div class="l1-arena-header">
                            <div>
                                <div class="l1-arena-title">SIGNAL <span>INTERCEPT</span></div>
                                <div class="l1-arena-sub" id="signal-wave-info">${currentWave ? `${visibleWave} / ${totalWaves} - ${currentWave.name}` : `1 / ${totalWaves} - Briefing`}</div>
                            </div>
                            <div class="l1-arena-hint" id="signal-header-hint">
                                <b>Status:</b> ${statusText}<br>
                                ${currentWave?.subtitle || 'Prepare to intercept the incoming traffic wave.'}
                            </div>
                        </div>

                        <div class="l1-arena-scroll">
                            <div class="l1-feedback guess-feedback" id="guess-feedback">Scenario: ${scenarioText}<br>Task: ${taskText}</div>
                            <div class="sigl-brief-grid">
                                <div class="l1-feedback sigl-card">
                                    <div class="sigl-kicker">Command Brief</div>
                                    <div class="sigl-copy" id="signal-brief-copy">${briefText}</div>
                                </div>
                                <div class="l1-feedback sigl-card">
                                    <div class="sigl-kicker">Traffic Legend</div>
                                    <div class="sigl-legend-grid">${legendMarkup}</div>
                                </div>
                            </div>
                            <div class="l1-feedback sigl-arena-card">
                                <div class="sigl-panel-head">
                                    <div>
                                        <div class="sigl-kicker">Intercept Grid</div>
                                        <div class="sigl-panel-title" id="signal-intel-title">${currentWave?.subtitle || 'SIGNAL INTERCEPT'}</div>
                                    </div>
                                    <div class="sigl-panel-copy" id="signal-intel-copy">${briefText}</div>
                                </div>
                                <div class="sigl-arena-stage">
                                    <div class="sig-arena" id="signal-arena">
                                        <canvas class="sig-canvas" id="signal-canvas"></canvas>
                                        <div class="sig-sweep"></div>
                                        <div class="sig-atk-node">
                                            <div class="sig-atk-box"><div style="font-size:22px;">💀</div></div>
                                            <div class="sig-node-label">${config.attacker.label}</div>
                                        </div>
                                        <div class="sig-server-node">
                                            <div class="sig-server-box" id="signal-server-box">
                                                <div class="sig-led"></div>
                                                <div class="sig-led-ok"></div>
                                                <div style="font-size:18px;margin:2px 0;">🖥</div>
                                                <div class="sig-led"></div>
                                            </div>
                                            <div class="sig-node-label" id="signal-server-hp">HP: ${this.signalIntegrity}%</div>
                                        </div>
                                        <div class="sig-lane-labels" id="signal-lane-labels"></div>
                                        <div class="sig-wave-overlay ${this.signalAnnouncementVisible && !this.signalWaveRunning && !this.signalGameOver ? 'show' : ''}" id="signal-wave-announce">
                                            <div class="sig-wave-card">
                                                <div class="sig-overlay-sub">// INCOMING WAVE</div>
                                                <div class="sig-overlay-title" id="signal-wave-title">${currentWave?.name || 'WAVE 1'}</div>
                                                <div class="sig-overlay-subtitle" id="signal-wave-subtitle">${currentWave?.subtitle || 'SIGNAL INTERCEPT'}</div>
                                                <div class="sig-overlay-desc" id="signal-wave-desc">${briefText}</div>
                                                <div class="sig-overlay-threats" id="signal-wave-threats">Threats: <span>${currentWave?.threats || 'Unknown'}</span> | Friendly: <strong>${currentWave?.friendly || 'Unknown'}</strong></div>
                                                <button class="sig-wave-btn" id="signal-overlay-start-wave" type="button" ${this.signalWaveRunning || this.signalGameOver ? 'disabled' : ''}>▶ INTERCEPT</button>
                                                <div class="sig-overlay-note" id="signal-overlay-note">AUTO DEPLOY IN 2.4S</div>
                                            </div>
                                        </div>
                                        <div class="sig-outcome-overlay" id="signal-outcome-overlay">
                                            <div class="sig-outcome-card" id="signal-outcome-card">
                                                <div class="sig-overlay-sub" id="signal-outcome-sub">// RESULT</div>
                                                <div class="sig-overlay-title" id="signal-outcome-title">NETWORK SECURED</div>
                                                <div class="sig-outcome-score" id="signal-outcome-score">0 PTS</div>
                                                <div class="sig-outcome-body" id="signal-outcome-body"></div>
                                                <div class="sig-outcome-rows" id="signal-outcome-rows"></div>
                                            </div>
                                        </div>
                                        <div class="sig-combo" id="signal-combo-flash"></div>
                                        <div class="sig-toast" id="signal-toast"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="l1-submit-dock">
                            <div class="l1-submit-cluster">
                                <span class="l1-submit-label">Waves</span>
                                <div class="l1-flag-slots" id="signal-wave-dots"></div>
                            </div>
                            <div class="l1-submit-cluster l1-submit-cluster--summary">
                                <div class="l1-submit-value" id="ptsPreview">${accuracy}%</div>
                                <div class="l1-submit-points-label">Accuracy</div>
                            </div>
                            <div class="l1-submit-meta">
                                <div class="l1-attempts" id="attempt-counter">Signal intercept live</div>
                                <div class="l1-attempts"><span id="signal-dock-status">${statusText}</span></div>
                            </div>
                            <button class="l1-btn l1-btn-primary l1-fire-btn" id="signal-start-wave" type="button" ${this.signalWaveRunning || this.signalGameOver ? 'disabled' : ''}>${startLabel}</button>
                        </div>
                    </section>

                    <aside class="l1-console">
                        <section class="l1-console-panel">
                            <div class="l1-console-title">Defense Telemetry</div>
                            <div class="l1-dial-wrap">
                                <svg class="l1-dial-svg" viewBox="0 0 140 140" aria-hidden="true">
                                    <circle class="l1-dial-bg" cx="70" cy="70" r="65"></circle>
                                    <circle class="l1-dial-ring" cx="70" cy="70" r="65" id="l1-dial-ring"></circle>
                                </svg>
                                <div class="l1-dial-inner">
                                    <div class="l1-dial-num" id="l1-dial-num">${this.signalIntegrity}</div>
                                    <div class="l1-dial-sub">Integrity</div>
                                </div>
                            </div>
                            <div class="l1-threat-bars" id="signal-threat-bars">${threatMarkup}</div>
                        </section>

                        <section class="l1-console-panel">
                            <div class="l1-console-title">Wave Board</div>
                            <div class="l1-objective-list" id="signal-wave-board"></div>
                        </section>

                        <section class="l1-console-panel l1-console-panel--fill">
                            <div class="l1-console-head">
                                <div class="l1-console-title">Packet Log</div>
                                <div class="l1-console-chip">HINTS <span id="l1-hints-remaining">${hintsRemaining}</span>/3</div>
                            </div>
                            <div class="l1-risk-row">
                                <span>Wave Timer</span>
                                <div class="l1-risk-track">
                                    <div class="l1-risk-fill" id="signal-timer-fill" style="width:${waveTimerPercent}%;"></div>
                                </div>
                                <span class="l1-risk-text" id="signal-wave-timer">${timeDisplay}</span>
                            </div>
                            <div class="l1-hint-stack" id="password-hints">
                                <div class="l1-hint" id="signal-threat-summary">Threats: ${currentWave?.threats || 'Unknown'}</div>
                                <div class="l1-hint" id="signal-friendly-summary">Friendly: ${currentWave?.friendly || 'Unknown'}</div>
                            </div>
                            <div class="l1-log-body sig-feed" id="signal-packet-feed"></div>
                        </section>
                    </aside>
                </div>
            </div>`;
    }

    renderSignalInterceptSimulationPuzzle(container) {
        this.visualizerElement = container;
        const config = this.getSignalInterceptConfig();
        const waves = config.waves;
        const currentWave = this.getSignalCurrentWave();
        const totalWaves = Math.max(1, waves.length);
        const visibleWave = this.signalGameOver ? totalWaves : Math.min(totalWaves, this.signalCurrentWaveIndex + 1);
        const hintsRemaining = Math.max(0, CONFIG.HINTS.MAX_HINTS_PER_MISSION - this.gameScreen.game.score.hintsUsed);
        const scoreDisplay = String(this.gameScreen?.game?.score?.getScore?.() || 0).padStart(3, '0');
        const accuracy = this.signalBlocked + this.signalMissed > 0
            ? Math.round((this.signalBlocked / (this.signalBlocked + this.signalMissed)) * 100)
            : 100;
        const timeDisplay = this.signalWaveRunning
            ? `${String(Math.max(0, this.signalWaveSeconds)).padStart(2, '0')}S`
            : currentWave
                ? `${String(Math.max(0, Number(currentWave.duration || 0))).padStart(2, '0')}S`
                : '--';
        const statusText = this.signalGameOver
            ? (this.signalIntegrity > 0 ? 'NETWORK SECURED' : 'SERVER BREACHED')
            : this.signalWaveRunning
                ? 'INTRUSION ACTIVE'
                : 'WAVE BRIEFING';
        const phaseShortLabels = ['RECON', 'EXFIL', 'C2 STORM', 'RANSOM', 'APT FINAL'];
        const legendMarkup = config.legendOrder
            .map(key => ({ key, type: config.packetTypes[key] }))
            .filter(item => item.type)
            .map(item => `
                <div class="sigl-legend-item">
                    <span class="sigl-legend-dot" style="background:${item.type.color};"></span>
                    <span class="sigl-legend-name">${item.type.label}</span>
                    <strong>${item.type.malicious ? 'BLOCK' : 'ALLOW'}</strong>
                </div>`).join('');
        const threatBars = [
            { label: 'Blocked', value: Math.min(100, this.signalBlocked * 10), tone: 'safe' },
            { label: 'Missed', value: Math.min(100, this.signalMissed * 14), tone: 'danger' },
            { label: 'False +', value: Math.min(100, this.signalFalsePositives * 14), tone: 'warn' },
            { label: 'Accuracy', value: accuracy, tone: accuracy >= 80 ? 'safe' : accuracy >= 60 ? 'warn' : 'danger' }
        ];
        const threatMarkup = threatBars.map(bar => `
            <div class="l1-threat-row">
                <div class="l1-threat-top">
                    <span>${bar.label}</span>
                    <span class="tone-${bar.tone}">${bar.value}%</span>
                </div>
                <div class="l1-threat-track">
                    <div class="l1-threat-fill tone-${bar.tone}" style="width:${bar.value}%"></div>
                </div>
            </div>`).join('');
        const phaseMarkup = waves.map((wave, index) => `
            ${index > 0 ? '<div class="l1-phase-sep">//</div>' : ''}
            <div class="l1-phase ${!this.signalGameOver && index === this.signalCurrentWaveIndex ? 'active' : ''} ${(this.signalGameOver ? this.signalIntegrity > 0 || index < this.signalCurrentWaveIndex : index < this.signalCurrentWaveIndex) ? 'done' : ''}">
                <span class="l1-phase__dot"></span>
                <strong>${String(index + 1).padStart(2, '0')}</strong>${phaseShortLabels[index] || String(wave.phaseLabel || wave.subtitle || wave.name || `WAVE ${index + 1}`).toUpperCase()}
            </div>`).join('');
        const waveTimerPercent = currentWave && Number(currentWave.duration || 0) > 0
            ? Math.max(0, Math.min(100, ((this.signalWaveRunning ? this.signalWaveSeconds : Number(currentWave.duration || 0)) / Number(currentWave.duration || 1)) * 100))
            : 0;
        const startLabel = this.signalWaveRunning ? '[ INTERCEPT LIVE ]' : '[ ARM INTERCEPT ]';
        const briefText = currentWave?.desc || this.mission.userTask || 'Intercept hostile packets and protect the server core.';
        const scenarioText = this.mission.scenario || 'Hostile traffic is moving across open lanes toward the corporate server.';
        const taskText = this.mission.userTask || 'Block malicious packets and allow legitimate traffic to pass.';

        container.innerHTML = this.renderSignalInterceptLevelOneMarkup({
            config,
            currentWave,
            totalWaves,
            visibleWave,
            hintsRemaining,
            scoreDisplay,
            accuracy,
            timeDisplay,
            statusText,
            phaseMarkup,
            threatMarkup,
            legendMarkup,
            waveTimerPercent,
            startLabel,
            briefText,
            scenarioText,
            taskText
        });

        this.setupSignalInterceptEventListeners();
        this.renderSignalLaneLabels();
        this.renderSignalThreatIntel();
        this.updateSignalInterceptUI();
        this.startSignalInterceptAnimation();
        this.startHumanLabMatrixAnimation();
        this.appendSignalPacketLog('INFO', 'Signal intercept grid online. Review the incoming wave brief.', 'blocked');
        this.scheduleSignalWaveAutoStart();
    }

    setupSignalInterceptEventListeners() {
        this.signalCanvas = document.getElementById('signal-canvas');
        this.signalCtx = this.signalCanvas?.getContext('2d') || null;
        this.signalCanvas?.addEventListener('click', event => this.handleSignalInterceptCanvasClick(event));
        document.getElementById('signal-start-wave')?.addEventListener('click', () => this.startSignalWave());
        document.getElementById('signal-overlay-start-wave')?.addEventListener('click', () => this.startSignalWave());

        if (!this.signalResizeHandler) {
            this.signalResizeHandler = () => {
                this.resizeSignalInterceptCanvas();
                this.renderSignalLaneLabels();
            };
            window.addEventListener('resize', this.signalResizeHandler);
        }

        this.resizeSignalInterceptCanvas();
    }

    resizeSignalInterceptCanvas() {
        const arena = document.getElementById('signal-arena');
        if (!arena || !this.signalCanvas) return;
        this.signalCanvas.width = arena.clientWidth;
        this.signalCanvas.height = arena.clientHeight;
    }

    renderSignalLaneLabels() {
        const labels = document.getElementById('signal-lane-labels');
        if (!labels) return;
        const config = this.getSignalInterceptConfig();
        labels.innerHTML = '';
        config.laneLabels.forEach((label, index) => {
            const item = document.createElement('div');
            item.className = 'sig-lane-label';
            item.style.top = `${this.getSignalLaneY(index) - 6}px`;
            item.textContent = label;
            labels.appendChild(item);
        });
    }

    getSignalLaneY(laneIndex) {
        const laneCount = Math.max(1, this.getSignalInterceptConfig().laneLabels.length);
        const canvasHeight = this.signalCanvas?.height || 600;
        const pad = 80;
        if (laneCount === 1) return canvasHeight / 2;
        return pad + (laneIndex / (laneCount - 1)) * Math.max(0, canvasHeight - pad * 2);
    }

    renderSignalThreatIntel() {
        const currentWave = this.getSignalCurrentWave();
        const list = document.getElementById('signal-wave-board') || document.getElementById('signal-threat-list');
        if (!list) return;
        if (!currentWave) {
            list.innerHTML = `
                <div class="l1-objective done">
                    <div class="l1-objective__icon">OK</div>
                    <div class="l1-objective__text">${this.signalIntegrity > 0 ? 'All traffic waves were contained.' : 'Threat traffic reached the server core.'}</div>
                </div>`;
            return;
        }
        const packetTypes = this.getSignalInterceptConfig().packetTypes;
        const types = Array.from(new Set(Array.isArray(currentWave.pool) ? currentWave.pool : []))
            .map(key => ({ key, config: packetTypes[key] }))
            .filter(item => item.config);

        list.innerHTML = types.map(item => `
            <div class="l1-objective ${item.config.malicious ? 'on' : ''}">
                <div class="l1-objective__icon" style="border-color:${item.config.color};color:${item.config.color};">${item.config.malicious ? '!' : '>'}</div>
                <div class="l1-objective__text">${item.config.label} ${item.config.malicious ? 'must be blocked' : 'should be allowed'}.</div>
            </div>`).join('');
    }

    startSignalInterceptAnimation() {
        if (this.signalAnimationFrameId) cancelAnimationFrame(this.signalAnimationFrameId);
        this.signalLastFrameTime = 0;
        const frame = timestamp => {
            if (this.interactionMode !== 'signalInterceptSimulation' || this.isComplete) return;
            this.signalInterceptFrame(timestamp);
            this.signalAnimationFrameId = requestAnimationFrame(frame);
        };
        this.signalAnimationFrameId = requestAnimationFrame(frame);
    }

    signalInterceptFrame(timestamp) {
        if (!this.signalCtx || !this.signalCanvas) return;

        const dt = this.signalLastFrameTime ? Math.min((timestamp - this.signalLastFrameTime) / 1000, 0.08) : 0;
        this.signalLastFrameTime = timestamp;
        this.drawSignalArenaGrid();

        if (this.signalWaveRunning && !this.gameScreen?.isPaused) {
            const currentWave = this.getSignalCurrentWave();
            if (currentWave) {
                this.signalSpawnAccumulatorMs += dt * 1000;
                while (this.signalSpawnAccumulatorMs >= Number(currentWave.spawnRateMs || currentWave.spawnRate || 1800)) {
                    this.signalSpawnAccumulatorMs -= Number(currentWave.spawnRateMs || currentWave.spawnRate || 1800);
                    this.signalPackets.push(this.createSignalPacket(currentWave));
                }
            }

            const targetX = (this.signalCanvas.width || 0) - 95;
            this.signalPackets.forEach(packet => {
                if (!packet.alive) return;
                packet.x += packet.speed;
                packet.glowPulse += dt * 3;
                if (packet.x < targetX) return;

                packet.alive = false;
                if (packet.type.malicious) {
                    this.signalMissed++;
                    this.signalCombo = 0;
                    this.signalIntegrity = Math.max(0, this.signalIntegrity - Number(packet.type.damage || 0));
                    this.flashSignalServer(false);
                    this.appendSignalPacketLog('MISSED', `${packet.type.label} hit the server.`, 'missed');
                    this.showSignalToast(`Missed ${packet.type.label}! Integrity -${packet.type.damage}%`, 'bad');
                    this.updateSignalInterceptUI();
                    if (this.signalIntegrity <= 0) this.finishSignalIntercept(false);
                } else {
                    this.flashSignalServer(true);
                }
            });
            this.signalPackets = this.signalPackets.filter(packet => packet.alive);
        }

        this.signalPackets.forEach(packet => this.drawSignalPacket(packet));
        this.drawSignalClickEffects(dt);
    }

    drawSignalArenaGrid() {
        const ctx = this.signalCtx;
        const canvas = this.signalCanvas;
        if (!ctx || !canvas) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const laneCount = Math.max(1, this.getSignalInterceptConfig().laneLabels.length);
        for (let lane = 0; lane < laneCount; lane++) {
            const y = this.getSignalLaneY(lane);
            ctx.save();
            ctx.strokeStyle = 'rgba(0,255,231,0.04)';
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 8]);
            ctx.beginPath();
            ctx.moveTo(68, y);
            ctx.lineTo(canvas.width - 95, y);
            ctx.stroke();
            ctx.restore();
        }
    }

    createSignalPacket(currentWave) {
        const config = this.getSignalInterceptConfig();
        const pool = Array.isArray(currentWave?.pool) ? currentWave.pool : [];
        const typeKey = pool[Math.floor(Math.random() * pool.length)];
        const type = config.packetTypes[typeKey];
        const lane = Math.floor(Math.random() * Math.max(1, config.laneLabels.length));
        const sizeMap = { ransom: 18, apt: 20 };

        return {
            id: this.signalPacketId++,
            typeKey,
            type,
            x: 68,
            y: this.getSignalLaneY(lane),
            speed: Number(currentWave?.speed || 2) * (0.85 + Math.random() * 0.3),
            size: sizeMap[typeKey] || 14,
            lane,
            alive: true,
            clicked: false,
            opacity: 1,
            glowPulse: Math.random() * Math.PI * 2
        };
    }

    drawSignalPacket(packet) {
        const ctx = this.signalCtx;
        if (!ctx || !packet?.alive || !packet.type) return;
        const { x, y, size } = packet;

        ctx.save();
        ctx.globalAlpha = packet.opacity;
        const pulse = (Math.sin(packet.glowPulse) + 1) * 0.5;
        const glowSize = size * 1.8 + pulse * size * 0.5;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowSize);
        gradient.addColorStop(0, packet.type.glow);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, glowSize, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = packet.type.color;
        ctx.strokeStyle = packet.type.color;
        ctx.lineWidth = 1.5;
        ctx.shadowColor = packet.type.color;
        ctx.shadowBlur = 12;

        if (packet.type.shape === 'diamond') {
            ctx.beginPath();
            ctx.moveTo(x, y - size);
            ctx.lineTo(x + size * 0.7, y);
            ctx.lineTo(x, y + size);
            ctx.lineTo(x - size * 0.7, y);
            ctx.closePath();
            ctx.fill();
        } else if (packet.type.shape === 'hex') {
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle = (Math.PI / 3) * i - Math.PI / 6;
                const px = x + size * Math.cos(angle);
                const py = y + size * Math.sin(angle);
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
        } else if (packet.type.shape === 'tri') {
            ctx.beginPath();
            ctx.moveTo(x, y - size);
            ctx.lineTo(x + size * 0.87, y + size * 0.5);
            ctx.lineTo(x - size * 0.87, y + size * 0.5);
            ctx.closePath();
            ctx.fill();
        } else if (packet.type.shape === 'star') {
            ctx.beginPath();
            for (let i = 0; i < 10; i++) {
                const radius = i % 2 === 0 ? size : size * 0.45;
                const angle = (Math.PI / 5) * i - Math.PI / 2;
                const px = x + radius * Math.cos(angle);
                const py = y + radius * Math.sin(angle);
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
        } else if (packet.type.shape === 'skull') {
            ctx.beginPath();
            ctx.arc(x, y - 1, size * 0.75, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillRect(x - size * 0.5, y + size * 0.35, size, size * 0.4);
        } else {
            ctx.beginPath();
            ctx.arc(x, y, size * 0.75, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255,255,255,0.78)';
        ctx.font = "7px 'Share Tech Mono', monospace";
        ctx.textAlign = 'center';
        ctx.fillText(packet.typeKey.toUpperCase(), x, y + size + 10);
        ctx.restore();
    }

    drawSignalClickEffects(dt) {
        const ctx = this.signalCtx;
        if (!ctx) return;

        this.signalClickEffects = this.signalClickEffects.filter(effect => {
            effect.life -= dt * 1.8;
            effect.y += effect.vy;
            if (effect.life <= 0) return false;
            ctx.save();
            ctx.globalAlpha = effect.life;
            ctx.fillStyle = effect.color;
            ctx.font = "bold 11px 'Share Tech Mono', monospace";
            ctx.textAlign = 'center';
            ctx.shadowColor = effect.color;
            ctx.shadowBlur = 10;
            ctx.fillText(effect.text, effect.x, effect.y);
            ctx.restore();
            return true;
        });
    }

    handleSignalInterceptCanvasClick(event) {
        if (!this.signalWaveRunning || this.gameScreen?.isPaused || this.isComplete || !this.signalCanvas) return;

        const rect = this.signalCanvas.getBoundingClientRect();
        const mx = event.clientX - rect.left;
        const my = event.clientY - rect.top;
        const packet = this.signalPackets.find(item =>
            item.alive && !item.clicked && Math.hypot(mx - item.x, my - item.y) < item.size * 2.5
        );
        if (!packet) return;

        packet.clicked = true;
        packet.alive = false;
        if (packet.type.malicious) {
            this.signalBlocked++;
            this.signalCombo++;
            if (this.signalCombo > this.signalMaxCombo) this.signalMaxCombo = this.signalCombo;
            const bonus = this.signalCombo >= 5 ? Number(packet.type.points || 0) * 2 : Number(packet.type.points || 0);
            this.adjustSignalInterceptScore(bonus, 'blocked');
            this.pushSignalClickEffect(packet.x, packet.y, '#00e676', `+${bonus}${this.signalCombo >= 5 ? ' COMBO' : ''}`);
            if (this.signalCombo >= 5) this.showSignalCombo(`${this.signalCombo}x COMBO!`, '#00e676');
            else if (this.signalCombo === 3) this.showSignalCombo('3x STREAK!', '#ffd600');
            this.appendSignalPacketLog('BLOCKED', `${packet.type.label} intercepted.`, 'blocked');
            this.showSignalToast(`Intercepted ${packet.type.label} (+${bonus})`, 'good');
            this.audio.playButtonClick();
        } else {
            this.signalCombo = 0;
            this.signalFalsePositives++;
            this.signalIntegrity = Math.max(0, this.signalIntegrity - Number(packet.type.damage || 0));
            this.pushSignalClickEffect(packet.x, packet.y, '#c060ff', `FALSE + (-${packet.type.damage})`);
            this.appendSignalPacketLog('FALSE +', `${packet.type.label} was legitimate traffic.`, 'false');
            this.showSignalToast(`False positive on ${packet.type.label}. Integrity -${packet.type.damage}%`, 'bad');
            this.audio.playFailure();
            if (this.signalIntegrity <= 0) {
                this.updateSignalInterceptUI();
                this.finishSignalIntercept(false);
                return;
            }
        }

        this.updateSignalInterceptUI();
    }

    pushSignalClickEffect(x, y, color, text) {
        this.signalClickEffects.push({ x, y, color, text, life: 1, vy: -1.5 });
    }

    showSignalCombo(text, color) {
        const el = document.getElementById('signal-combo-flash');
        if (!el) return;
        el.textContent = text;
        el.style.color = color;
        el.style.textShadow = `0 0 20px ${color}`;
        el.style.opacity = '1';
        el.style.transition = 'opacity .1s';
        setTimeout(() => {
            el.style.transition = 'opacity .8s';
            el.style.opacity = '0';
        }, 600);
    }

    flashSignalServer(ok) {
        const box = document.getElementById('signal-server-box');
        if (!box) return;
        box.className = `sig-server-box ${ok ? 'ok' : 'hit'}`;
        if (this.signalServerFlashTimerId) clearTimeout(this.signalServerFlashTimerId);
        this.signalServerFlashTimerId = setTimeout(() => {
            this.signalServerFlashTimerId = null;
            box.className = 'sig-server-box';
        }, 320);
    }

    updateSignalInterceptUI() {
        const config = this.getSignalInterceptConfig();
        const waves = config.waves;
        const currentWave = this.getSignalCurrentWave();
        const total = this.signalBlocked + this.signalMissed;
        const accuracy = total > 0 ? Math.round((this.signalBlocked / total) * 100) : 100;
        const totalWaves = Math.max(1, waves.length);
        const visibleWave = this.signalGameOver ? totalWaves : Math.min(totalWaves, this.signalCurrentWaveIndex + 1);
        const statusText = this.signalGameOver
            ? (this.signalIntegrity > 0 ? 'NETWORK SECURED' : 'SERVER BREACHED')
            : this.signalWaveRunning
                ? 'INTRUSION ACTIVE'
                : 'WAVE BRIEFING';
        const timerText = this.signalWaveRunning
            ? `${String(Math.max(0, this.signalWaveSeconds)).padStart(2, '0')}S`
            : this.signalGameOver
                ? '00S'
                : `${String(Math.max(0, Number(currentWave?.duration || this.signalWaveSeconds || 0))).padStart(2, '0')}S`;
        const waveTimerPercent = currentWave && Number(currentWave.duration || 0) > 0
            ? Math.max(0, Math.min(100, ((this.signalWaveRunning ? this.signalWaveSeconds : Number(currentWave.duration || 0)) / Number(currentWave.duration || 1)) * 100))
            : 0;
        const threatBars = [
            { label: 'Blocked', value: Math.min(100, this.signalBlocked * 10), tone: 'safe' },
            { label: 'Missed', value: Math.min(100, this.signalMissed * 14), tone: 'danger' },
            { label: 'False +', value: Math.min(100, this.signalFalsePositives * 14), tone: 'warn' },
            { label: 'Accuracy', value: accuracy, tone: accuracy >= 80 ? 'safe' : accuracy >= 60 ? 'warn' : 'danger' }
        ];
        const threatMarkup = threatBars.map(bar => `
            <div class="l1-threat-row">
                <div class="l1-threat-top">
                    <span>${bar.label}</span>
                    <span class="tone-${bar.tone}">${bar.value}%</span>
                </div>
                <div class="l1-threat-track">
                    <div class="l1-threat-fill tone-${bar.tone}" style="width:${bar.value}%"></div>
                </div>
            </div>`).join('');
        const timerEl = document.getElementById('l1-timer');
        const waveHud = document.getElementById('l1-combo');
        const integrityFill = document.getElementById('l1-xp-fill');
        const dialNum = document.getElementById('l1-dial-num');
        const dialRing = document.getElementById('l1-dial-ring');
        const threatPanel = document.getElementById('signal-threat-bars');
        const ptsPreview = document.getElementById('ptsPreview');
        const serverHp = document.getElementById('signal-server-hp');
        const waveTimerEl = document.getElementById('signal-wave-timer');
        const timerFill = document.getElementById('signal-timer-fill');
        const intelTitle = document.getElementById('signal-intel-title');
        const intelCopy = document.getElementById('signal-intel-copy');
        const waveInfo = document.getElementById('signal-wave-info');
        const headerHint = document.getElementById('signal-header-hint');
        const briefCopy = document.getElementById('signal-brief-copy');
        const dockStatus = document.getElementById('signal-dock-status');
        const threatSummary = document.getElementById('signal-threat-summary');
        const friendlySummary = document.getElementById('signal-friendly-summary');
        const announce = document.getElementById('signal-wave-announce');
        const waveTitle = document.getElementById('signal-wave-title');
        const waveSubtitle = document.getElementById('signal-wave-subtitle');
        const waveDesc = document.getElementById('signal-wave-desc');
        const waveThreats = document.getElementById('signal-wave-threats');
        const overlayNote = document.getElementById('signal-overlay-note');
        const startButton = document.getElementById('signal-start-wave');
        const overlayStartButton = document.getElementById('signal-overlay-start-wave');
        const startLabel = this.signalWaveRunning ? '[ INTERCEPT LIVE ]' : '[ ARM INTERCEPT ]';

        if (timerEl) {
            timerEl.textContent = timerText;
            timerEl.classList.toggle('danger', this.signalWaveRunning && this.signalWaveSeconds <= 8);
        }
        if (waveHud) waveHud.textContent = `${visibleWave}/${totalWaves}`;
        if (integrityFill) integrityFill.style.width = `${this.signalIntegrity}%`;
        if (dialNum) {
            dialNum.textContent = `${this.signalIntegrity}`;
            dialNum.style.color = this.signalIntegrity > 60 ? '#00ff88' : this.signalIntegrity > 30 ? '#ffcc00' : '#ff3f78';
        }
        if (dialRing) {
            const circumference = 408;
            dialRing.style.strokeDashoffset = circumference - (circumference * Math.max(0, Math.min(100, this.signalIntegrity))) / 100;
        }
        if (threatPanel) threatPanel.innerHTML = threatMarkup;
        if (ptsPreview) ptsPreview.textContent = `${accuracy}%`;
        if (serverHp) {
            serverHp.textContent = `HP: ${this.signalIntegrity}%`;
            serverHp.style.color = this.signalIntegrity > 60 ? '#00e676' : this.signalIntegrity > 30 ? '#ff9100' : '#ff1744';
        }
        if (waveTimerEl) {
            waveTimerEl.textContent = timerText;
            waveTimerEl.style.color = this.signalWaveRunning && this.signalWaveSeconds <= 8 ? '#ff3f78' : '';
        }
        if (timerFill) timerFill.style.width = `${waveTimerPercent}%`;
        if (intelTitle) intelTitle.textContent = currentWave?.subtitle || 'SIGNAL INTERCEPT';
        if (intelCopy) intelCopy.textContent = currentWave?.desc || (this.mission.userTask || '');
        if (waveInfo) {
            waveInfo.textContent = this.signalGameOver
                ? `${totalWaves} / ${totalWaves} - ${this.signalIntegrity > 0 ? 'Operation Complete' : 'Operation Failed'}`
                : currentWave
                    ? `${visibleWave} / ${totalWaves} - ${currentWave.name}`
                    : `${visibleWave} / ${totalWaves} - Briefing`;
        }
        if (headerHint) {
            headerHint.innerHTML = `<b>Status:</b> ${statusText}<br>${currentWave?.subtitle || 'Prepare to intercept the incoming traffic wave.'}`;
        }
        if (briefCopy) {
            briefCopy.textContent = currentWave?.desc || this.mission.userTask || 'Intercept hostile packets and protect the server.';
        }
        if (dockStatus) dockStatus.textContent = statusText;
        if (threatSummary) threatSummary.textContent = `Threats: ${currentWave?.threats || 'Unknown'}`;
        if (friendlySummary) friendlySummary.textContent = `Friendly: ${currentWave?.friendly || 'Unknown'}`;
        if (announce) announce.classList.toggle('show', this.signalAnnouncementVisible && !this.signalWaveRunning && !this.signalGameOver);
        if (waveTitle) waveTitle.textContent = currentWave?.name || `WAVE ${this.signalCurrentWaveIndex + 1}`;
        if (waveSubtitle) waveSubtitle.textContent = currentWave?.subtitle || 'SIGNAL INTERCEPT';
        if (waveDesc) waveDesc.textContent = currentWave?.desc || (this.mission.userTask || '');
        if (waveThreats) {
            waveThreats.innerHTML = `Threats: <span>${currentWave?.threats || 'Unknown'}</span> | Friendly: <strong>${currentWave?.friendly || 'Unknown'}</strong>`;
        }
        if (overlayNote) {
            overlayNote.textContent = this.signalGameOver
                ? 'MISSION RESOLVED'
                : this.signalWaveRunning
                    ? 'INTERCEPT IN PROGRESS'
                    : 'AUTO DEPLOY IN 2.4S';
        }
        if (startButton) {
            startButton.disabled = this.signalGameOver || this.signalWaveRunning;
            startButton.textContent = startLabel;
        }
        if (overlayStartButton) {
            overlayStartButton.disabled = this.signalGameOver || this.signalWaveRunning;
            overlayStartButton.textContent = this.signalWaveRunning ? 'INTERCEPT LIVE' : '▶ INTERCEPT';
        }

        const waveDots = document.getElementById('signal-wave-dots');
        if (waveDots) {
            waveDots.innerHTML = waves.map((_, index) => {
                const active = !this.signalGameOver && index === this.signalCurrentWaveIndex;
                const done = this.signalGameOver ? this.signalIntegrity > 0 || index < this.signalCurrentWaveIndex : index < this.signalCurrentWaveIndex;
                return `<div class="l1-flag-slot ${done ? 'done' : active ? 'current active' : ''}">${index + 1}</div>`;
            }).join('');
        }

        document.querySelectorAll('.l1-phase').forEach((node, index) => {
            const active = !this.signalGameOver && index === this.signalCurrentWaveIndex;
            const done = this.signalGameOver ? this.signalIntegrity > 0 || index < this.signalCurrentWaveIndex : index < this.signalCurrentWaveIndex;
            node.classList.toggle('active', active);
            node.classList.toggle('done', done);
        });

        const statusNode = document.getElementById('signal-mission-status');
        if (statusNode) {
            statusNode.innerHTML = `<span class="l1-mission-status__dot"></span>${statusText}`;
        }

        this.renderSignalThreatIntel();
        this.gameScreen.syncEmbeddedMissionHUD();
    }

    scheduleSignalWaveAutoStart(delayMs = 2400) {
        if (this.signalAutoStartTimerId) {
            clearTimeout(this.signalAutoStartTimerId);
            this.signalAutoStartTimerId = null;
        }
        if (this.signalGameOver || this.signalWaveRunning || !this.signalAnnouncementVisible) return;

        this.signalAutoStartTimerId = setTimeout(() => {
            this.signalAutoStartTimerId = null;
            if (this.gameScreen?.isPaused) {
                this.scheduleSignalWaveAutoStart(1000);
                return;
            }
            if (!this.signalGameOver && !this.signalWaveRunning && this.signalAnnouncementVisible) {
                this.startSignalWave();
            }
        }, delayMs);
    }

    startSignalWave() {
        if (this.signalGameOver || this.signalWaveRunning) return;
        const config = this.getSignalInterceptConfig();
        const wave = this.getSignalCurrentWave();
        if (!wave) {
            this.finishSignalIntercept(true);
            return;
        }

        if (this.signalAutoStartTimerId) {
            clearTimeout(this.signalAutoStartTimerId);
            this.signalAutoStartTimerId = null;
        }
        if (this.signalWaveTimerId) clearInterval(this.signalWaveTimerId);
        if (this.signalTransitionTimeoutId) {
            clearTimeout(this.signalTransitionTimeoutId);
            this.signalTransitionTimeoutId = null;
        }

        this.signalAnnouncementVisible = false;
        this.signalWaveRunning = true;
        this.signalPackets = [];
        this.signalClickEffects = [];
        this.signalSpawnAccumulatorMs = 0;
        this.signalWaveSeconds = Number(wave.duration || 30);
        this.signalLastFrameTime = 0;
        this.updateSignalInterceptUI();
        this.showSignalToast(`${wave.name} engaged. Block hostile traffic and allow the rest.`, 'info');
        this.audio.playButtonClick();

        this.signalWaveTimerId = setInterval(() => {
            if (this.isComplete || this.signalGameOver) return;
            if (this.gameScreen?.isPaused) return;

            this.signalWaveSeconds = Math.max(0, this.signalWaveSeconds - 1);
            this.updateSignalInterceptUI();
            if (this.signalWaveSeconds > 0) return;

            clearInterval(this.signalWaveTimerId);
            this.signalWaveTimerId = null;
            this.signalWaveRunning = false;
            this.signalPackets = [];
            const waveBonus = this.signalIntegrity >= 80
                ? config.scoring.waveEndHigh
                : this.signalIntegrity >= 50
                    ? config.scoring.waveEndMid
                    : config.scoring.waveEndLow;
            this.adjustSignalInterceptScore(waveBonus, 'wave');
            this.appendSignalPacketLog('WAVE CLEAR', `${wave.name} stabilized. +${waveBonus} pts.`, 'blocked');

            this.signalTransitionTimeoutId = setTimeout(() => {
                this.signalTransitionTimeoutId = null;
                if (this.isComplete) return;
                this.signalCurrentWaveIndex++;
                if (this.signalCurrentWaveIndex >= config.waves.length) {
                    this.finishSignalIntercept(true);
                    return;
                }
                this.signalAnnouncementVisible = true;
                this.signalWaveSeconds = Number(config.waves[this.signalCurrentWaveIndex]?.duration || 0);
                this.updateSignalInterceptUI();
                this.scheduleSignalWaveAutoStart();
            }, config.waveTransitionDelayMs);
        }, 1000);
    }

    appendSignalPacketLog(action, message, tone = 'blocked') {
        const feed = document.getElementById('signal-packet-feed');
        if (!feed) return;
        const now = new Date();
        const timestamp = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        const row = document.createElement('div');
        row.className = `sig-feed-item ${tone}`;
        row.innerHTML = `<div class="sig-feed-time">${timestamp}</div><div><span class="sig-feed-type">[${action}]</span> ${message}</div>`;
        feed.prepend(row);
        while (feed.children.length > 24) {
            feed.removeChild(feed.lastChild);
        }
    }

    showSignalToast(message, tone = 'info') {
        const toast = document.getElementById('signal-toast');
        if (!toast) return;
        toast.textContent = message;
        toast.className = `sig-toast show ${tone}`;
        if (this.signalToastTimerId) clearTimeout(this.signalToastTimerId);
        this.signalToastTimerId = setTimeout(() => {
            this.signalToastTimerId = null;
            toast.classList.remove('show');
        }, 3000);
    }

    adjustSignalInterceptScore(points, bucket = null) {
        const value = Number(points || 0);
        if (!value) return;
        if (bucket && Object.prototype.hasOwnProperty.call(this.signalScoreBreakdown, bucket)) {
            this.signalScoreBreakdown[bucket] += value;
        }
        if (value > 0) this.gameScreen.game.score.addPoints(value);
        else this.gameScreen.game.score.subtractPoints(Math.abs(value));
        this.gameScreen.updateScore();
    }

    finishSignalIntercept(success) {
        if (this.isComplete) return;
        this.isComplete = true;
        this.signalGameOver = true;
        this.signalWaveRunning = false;
        this.signalAnnouncementVisible = false;
        this.stopSignalInterceptSimulation();

        const config = this.getSignalInterceptConfig();
        const totalThreats = this.signalBlocked + this.signalMissed;
        const accuracy = totalThreats > 0 ? Math.round((this.signalBlocked / totalThreats) * 100) : 100;
        const integrityBonus = success ? this.signalIntegrity * config.scoring.integrityMultiplier : 0;
        const accuracyBonus = success
            ? (accuracy >= 90 ? config.scoring.accuracy90 : accuracy >= 75 ? config.scoring.accuracy75 : config.scoring.accuracyFallback)
            : 0;
        const comboBonus = success ? this.signalMaxCombo * config.scoring.comboMultiplier : 0;
        const missedPenalty = this.signalMissed * config.scoring.missedPenalty;
        const falsePenalty = this.signalFalsePositives * config.scoring.falsePositivePenalty;

        if (success) {
            this.adjustSignalInterceptScore(integrityBonus, 'integrity');
            this.adjustSignalInterceptScore(accuracyBonus, 'accuracy');
            this.adjustSignalInterceptScore(comboBonus, 'combo');
        }

        const missionTotal = Object.values(this.signalScoreBreakdown).reduce((sum, value) => sum + Number(value || 0), 0);
        const overlay = document.getElementById('signal-outcome-overlay');
        const card = document.getElementById('signal-outcome-card');
        const title = document.getElementById('signal-outcome-title');
        const score = document.getElementById('signal-outcome-score');
        const body = document.getElementById('signal-outcome-body');
        const rows = document.getElementById('signal-outcome-rows');

        if (overlay && card && title && score && body && rows) {
            card.classList.toggle('fail', !success);
            title.textContent = success ? 'NETWORK SECURED' : 'SERVER BREACHED';
            score.textContent = `${missionTotal.toLocaleString()} PTS`;
            body.innerHTML = success
                ? `Signal intercept complete. Integrity held at <span style="color:#00e676;">${this.signalIntegrity}%</span> with <span style="color:#00ffe7;">${accuracy}%</span> interception accuracy.`
                : `Server integrity collapsed under sustained attack pressure. Blocked: ${this.signalBlocked} · Missed: ${this.signalMissed} · False positives: ${this.signalFalsePositives}.`;
            rows.innerHTML = success
                ? `
                    <div class="sig-outcome-row"><span class="sig-outcome-key">Packets Blocked</span><span class="sig-outcome-value">+${this.signalScoreBreakdown.blocked}</span></div>
                    <div class="sig-outcome-row"><span class="sig-outcome-key">Wave Control Bonus</span><span class="sig-outcome-value">+${this.signalScoreBreakdown.wave}</span></div>
                    <div class="sig-outcome-row"><span class="sig-outcome-key">Integrity Bonus</span><span class="sig-outcome-value">+${integrityBonus}</span></div>
                    <div class="sig-outcome-row"><span class="sig-outcome-key">Accuracy Bonus</span><span class="sig-outcome-value">+${accuracyBonus}</span></div>
                    <div class="sig-outcome-row"><span class="sig-outcome-key">Max Combo</span><span class="sig-outcome-value">+${comboBonus}</span></div>
                    <div class="sig-outcome-row"><span class="sig-outcome-key">Missed Packets</span><span class="sig-outcome-value neg">-${missedPenalty}</span></div>
                    <div class="sig-outcome-row"><span class="sig-outcome-key">False Positives</span><span class="sig-outcome-value neg">-${falsePenalty}</span></div>`
                : `
                    <div class="sig-outcome-row"><span class="sig-outcome-key">Packets Blocked</span><span class="sig-outcome-value">+${this.signalScoreBreakdown.blocked}</span></div>
                    <div class="sig-outcome-row"><span class="sig-outcome-key">Missed Packets</span><span class="sig-outcome-value neg">-${missedPenalty}</span></div>
                    <div class="sig-outcome-row"><span class="sig-outcome-key">False Positives</span><span class="sig-outcome-value neg">-${falsePenalty}</span></div>`;
            overlay.classList.add('show');
        }

        this.appendSignalPacketLog(success ? 'SECURED' : 'BREACHED', success ? 'All five waves were contained.' : 'Hostile traffic reached the core server.', success ? 'blocked' : 'missed');
        this.audio[success ? 'playSuccess' : 'playFailure']();
        this.gameScreen.ui.flashScreen(success ? 'rgba(0,255,65,0.18)' : 'rgba(255,0,110,0.18)', 300);
        this.gameScreen.ui.showNotification(success ? (this.mission.successFeedback || 'Signal intercept complete.') : (this.mission.failureFeedback || 'Server breached.'), success ? 'success' : 'error');
        this.signalCompletionTimerId = setTimeout(() => {
            this.signalCompletionTimerId = null;
            this.gameScreen.completePuzzle(success);
        }, config.completionDelayMs);
    }

    stopSignalInterceptSimulation() {
        if (this.signalAutoStartTimerId) {
            clearTimeout(this.signalAutoStartTimerId);
            this.signalAutoStartTimerId = null;
        }
        if (this.signalWaveTimerId) {
            clearInterval(this.signalWaveTimerId);
            this.signalWaveTimerId = null;
        }
        if (this.signalTransitionTimeoutId) {
            clearTimeout(this.signalTransitionTimeoutId);
            this.signalTransitionTimeoutId = null;
        }
        if (this.signalCompletionTimerId) {
            clearTimeout(this.signalCompletionTimerId);
            this.signalCompletionTimerId = null;
        }
        if (this.signalAnimationFrameId) {
            cancelAnimationFrame(this.signalAnimationFrameId);
            this.signalAnimationFrameId = null;
        }
        if (this.signalToastTimerId) {
            clearTimeout(this.signalToastTimerId);
            this.signalToastTimerId = null;
        }
        if (this.signalServerFlashTimerId) {
            clearTimeout(this.signalServerFlashTimerId);
            this.signalServerFlashTimerId = null;
        }
        if (this.signalResizeHandler) {
            window.removeEventListener('resize', this.signalResizeHandler);
            this.signalResizeHandler = null;
        }
    }

    syncEmbeddedMissionHUD() {
        if (this.interactionMode === 'liveDefenseSimulation') {
            const waves = this.getLiveDefenseWaves();
            const totalWaves = Math.max(1, waves.length);
            const visibleWave = Math.min(totalWaves, Math.max(1, this.liveWaveIndex + 1));
            const timerEl = document.getElementById('l1-timer');
            const timerLabel = document.getElementById('lab-shared-time-label');
            const auxLabel = document.getElementById('lab-shared-aux-label');
            const auxValue = document.getElementById('l1-ai-progress');

            if (timerLabel) timerLabel.textContent = 'Timer';
            if (timerEl) {
                timerEl.textContent = `${Math.max(0, Math.floor(this.liveRemainingTime))}S`;
                timerEl.classList.toggle('danger', this.liveRemainingTime <= 10);
            }
            if (auxLabel) auxLabel.textContent = 'Wave';
            if (auxValue) {
                auxValue.textContent = `${visibleWave}/${totalWaves}`;
                auxValue.className = 'lab-shared-value lab-shared-value--safe';
                auxValue.style.color = '';
            }
            return true;
        }

        if (this.interactionMode === 'threatHuntSimulation') {
            const totalTime = Math.max(1, Number(this.puzzleData?.timeLimit || this.mission?.puzzle?.timeLimit || 180));
            const rawRemaining = this.gameScreen?.timer?.getRemaining?.();
            const remaining = Number.isFinite(rawRemaining) ? Math.max(0, Math.floor(rawRemaining)) : totalTime;
            const elapsedPercent = Math.min(100, Math.max(0, Math.round(((totalTime - remaining) / totalTime) * 100)));
            const timerEl = document.getElementById('l1-timer');
            const timerLabel = document.getElementById('lab-shared-time-label');
            const auxLabel = document.getElementById('lab-shared-aux-label');
            const auxValue = document.getElementById('l1-ai-progress');

            if (timerLabel) timerLabel.textContent = 'Time';
            if (timerEl) {
                const minutes = String(Math.floor(remaining / 60)).padStart(2, '0');
                const seconds = String(remaining % 60).padStart(2, '0');
                timerEl.textContent = `${minutes}:${seconds}`;
                timerEl.classList.toggle('danger', remaining <= 30);
            }
            if (auxLabel) auxLabel.textContent = 'AI';
            if (auxValue) {
                auxValue.textContent = `${elapsedPercent}%`;
                auxValue.className = 'lab-shared-value lab-shared-value--safe';
                auxValue.style.color = '#ff4f8b';
            }
            return true;
        }

        if (this.interactionMode === 'signalInterceptSimulation') {
            const totalWaves = Math.max(1, this.getSignalInterceptConfig().waves.length);
            const visibleWave = this.signalGameOver ? totalWaves : Math.min(totalWaves, this.signalCurrentWaveIndex + 1);
            const currentWave = this.getSignalCurrentWave();
            const timerValue = this.signalWaveRunning
                ? `${String(Math.max(0, this.signalWaveSeconds)).padStart(2, '0')}S`
                : this.signalGameOver
                    ? '00S'
                    : `${String(Math.max(0, Number(currentWave?.duration || this.signalWaveSeconds || 0))).padStart(2, '0')}S`;
            const timerEl = document.getElementById('l1-timer');
            const waveHud = document.getElementById('l1-combo');
            const integrityFill = document.getElementById('l1-xp-fill');
            if (timerEl) {
                timerEl.textContent = timerValue;
                timerEl.classList.toggle('danger', this.signalWaveRunning && this.signalWaveSeconds <= 8);
            }
            if (waveHud) waveHud.textContent = `${visibleWave}/${totalWaves}`;
            if (integrityFill) integrityFill.style.width = `${this.signalIntegrity}%`;
            return true;
        }

        return false;
    }

    // ─── typing puzzle helpers ────────────────────────────────────────────────

    createInputs() {
        let html = '';
        for (let i = 0; i < this.password.length; i++) {
            html += `<input type="text" class="char-input" maxlength="1" data-index="${i}" autocomplete="off" spellcheck="false">`;
        }
        return html;
    }

    renderMissionBrief() {
        if (!this.mission || !this.mission.scenario) return '';
        const scenarioText = this.dynamicScenario || this.mission.scenario;
        const taskText = this.dynamicUserTask || this.mission.userTask || 'Identify and validate the credential.';
        return `<div class="password-brief"><div><strong>OBJECTIVE:</strong> ${this.mission.objective || ''}</div><div><strong>SCENARIO:</strong> ${scenarioText}</div><div><strong>TASK:</strong> ${taskText}</div></div>`;
    }

    setupEventListeners() {
        this.inputs = Array.from(document.querySelectorAll('.char-input'));
        document.getElementById('submit-password')?.addEventListener('click', () => this.checkPassword());
        document.getElementById('clear-password')?.addEventListener('click', () => this.clearInputs());
        this.inputs.forEach((input, index) => {
            input.addEventListener('input', e => {
                e.target.value = e.target.value.toUpperCase();
                if (e.target.value && index < this.inputs.length - 1) this.inputs[index + 1].focus();
                this.audio.playTyping();
                this.updateDisplay();
            });
            input.addEventListener('keydown', e => {
                if (e.key === 'Backspace' && !e.target.value && index > 0) { this.inputs[index - 1].focus(); this.inputs[index - 1].select(); }
                if (e.key === 'Enter') this.checkPassword();
            });
            input.addEventListener('keypress', e => { if (!/[a-zA-Z0-9]/.test(e.key)) e.preventDefault(); });
            input.addEventListener('paste', e => { e.preventDefault(); this.fillInputs(e.clipboardData.getData('text').toUpperCase(), index); });
        });
        if (this.inputs[0]) this.inputs[0].focus();
    }

    updateDisplay() {
        const display = document.getElementById('password-display');
        if (display) display.textContent = this.inputs.map(i => i.value || '_').join('');
    }

    getCurrentGuess() { return this.inputs.map(i => i.value).join('').toUpperCase(); }

    fillInputs(text, startIndex = 0) {
        for (let i = 0; i < text.length && (startIndex + i) < this.inputs.length; i++) this.inputs[startIndex + i].value = text[i];
        this.updateDisplay();
    }

    checkPassword() {
        if (this.isComplete) return;
        const guess = this.getCurrentGuess();
        if (guess.length !== this.password.length) { this.gameScreen.ui.showNotification('Enter all characters!', 'warning'); return; }
        this.attempts++; this.updateAttemptCounter();
        if (guess === this.password) { this.onSuccess(); }
        else { this.showGuessFeedback(guess); this.onFailure(); }
        this.gameScreen.updateAttempts(this.attempts);
    }

    onSuccess() {
        this.isComplete = true;
        this.audio.playSuccess();
        this.inputs.forEach(i => { i.classList.add('correct'); i.disabled = true; });
        this.gameScreen.ui.flashScreen('rgba(0,255,65,0.2)', 300);
        this.gameScreen.ui.showNotification(this.mission.successFeedback || 'Password cracked!', 'success');
        setTimeout(() => this.gameScreen.completePuzzle(true), 1000);
    }

    onFailure() {
        this.audio.playFailure();
        this.inputs.forEach(i => { if (!i.classList.contains('correct') && !i.classList.contains('partial')) { i.classList.add('incorrect'); setTimeout(() => i.classList.remove('incorrect'), 500); } });
        this.gameScreen.ui.flashScreen('rgba(255,0,110,0.2)', 300);
        if (this.attempts >= this.maxAttempts) this.onOutOfAttempts();
        else this.gameScreen.ui.showNotification(`Authentication rejected. ${this.maxAttempts - this.attempts} attempts remaining`, 'error');
    }

    onOutOfAttempts() {
        this.isComplete = true;
        this.inputs.forEach(i => { i.disabled = true; });
        this.gameScreen.ui.showNotification(this.mission.failureFeedback || 'Out of attempts! Mission failed.', 'error');
        setTimeout(() => this.gameScreen.completePuzzle(false), 2000);
    }

    showGuessFeedback(guess) {
        const feedback = document.getElementById('guess-feedback');
        if (!feedback) return;
        const pattern = [];
        const wrongLetters = new Set();
        const presentLetters = new Set();
        for (let i = 0; i < this.password.length; i++) {
            const char = guess[i] || '';
            const input = this.inputs[i];
            if (!input) continue;
            input.classList.remove('correct', 'partial', 'incorrect');
            if (char === this.password[i]) { pattern.push(char); input.classList.add('correct'); }
            else if (this.password.includes(char)) { pattern.push('_'); presentLetters.add(char); input.classList.add('partial'); }
            else { pattern.push('_'); wrongLetters.add(char); input.classList.add('incorrect'); }
        }
        feedback.innerHTML = `<div><strong>Correct positions:</strong> ${pattern.join(' ')}</div><div>Present but misplaced: ${presentLetters.size ? Array.from(presentLetters).join(', ') : 'none'}</div><div>Incorrect letters: ${wrongLetters.size ? Array.from(wrongLetters).join(', ') : 'none'}</div>`;
    }

    clearInputs() {
        this.inputs.forEach(i => { i.value = ''; i.classList.remove('correct', 'partial', 'incorrect'); });
        if (this.inputs[0]) this.inputs[0].focus();
        this.updateDisplay();
        this.audio.playButtonClick();
    }

    // ─── hint system ──────────────────────────────────────────────────────────

    showHint() {
        if (this.isComplete) { this.gameScreen.ui.showNotification('Puzzle already complete!', 'info'); return; }
        if (this.interactionMode === 'multiSelect') { this.gameScreen.ui.showNotification('Story intelligence is already provided.', 'info'); return; }

        const hintKeys = ['hint1', 'hint2', 'hint3'];
        if (this.hintsShown >= hintKeys.length) { this.gameScreen.ui.showNotification('No more hints available!', 'warning'); return; }
        const hintText = this.mission?.hintSystem?.[hintKeys[this.hintsShown]];
        if (!hintText) { this.gameScreen.ui.showNotification('No more hints available!', 'warning'); return; }
        this.hintsShown++;

        if (this.interactionMode === 'threatHuntSimulation') {
            this.appendThreatLog(`Hint deployed: ${hintText}`, 'warn');
            this.gameScreen.ui.showNotification(hintText, 'info');
        } else if (['singleChoice','predictionChoice','investigation','inspection','liveDefenseSimulation','signalInterceptSimulation','livePatchSimulation','enterpriseArchitectureSimulation'].includes(this.interactionMode)) {
            this.gameScreen.ui.showNotification(hintText, 'info');
        } else {
            const hintsContainer = document.getElementById('password-hints');
            if (hintsContainer) {
                const newHint = document.createElement('div');
                newHint.className = this.isHumanLabShellMode() ? 'l1-hint animate-fadeIn' : 'hint animate-fadeIn';
                newHint.textContent = this.isHumanLabShellMode() ? hintText : `→ ${hintText}`;
                hintsContainer.appendChild(newHint);
            }
            if (this.isHumanLabShellMode()) {
                this.pushHumanLabLog('warn', `Operator requested hint: ${hintText}`);
            }
        }

        this.audio.playHint();
        this.gameScreen.ui.showNotification('Hint revealed!', 'info');
        this.gameScreen.game.score.recordHint();
        this.gameScreen.updateHintsDisplay();
        if (this.interactionMode === 'threatHuntSimulation') {
            this.rerenderThreatHuntSimulation({ primarySelector: '__root__' });
        }
    }

    // ─── utility ──────────────────────────────────────────────────────────────

    sanitizeId(text) { return String(text || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); }

    updateAttemptCounter() {
        const counter = document.getElementById('attempt-counter');
        if (!counter) return;
        const modeLabels = { multiSelect:'Submissions', humanPsychologyLab:'Submissions', breachTriageLab:'Reset waves', singleChoice:'Decisions', predictionChoice:'Decisions', investigation:'Decisions', inspection:'Decisions', liveDefenseSimulation:'Live defense active', signalInterceptSimulation:'Signal intercept live', threatHuntSimulation:'Case submissions', livePatchSimulation:'Patch operations', enterpriseArchitectureSimulation:'Certification evaluations' };
        const label = modeLabels[this.interactionMode] || 'Attempts';
        if (label === 'Live defense active' || label === 'Signal intercept live') { counter.innerHTML = label; return; }
        if (this.isHumanLabShellMode()) {
            counter.innerHTML = `${label}: <span class="${this.attempts >= this.maxAttempts - 1 ? 'is-hot' : ''}">${this.attempts}</span> / ${this.maxAttempts}`;
            return;
        }
        counter.innerHTML = `${label}: <span style="color:var(--cyber-${this.attempts >= this.maxAttempts - 1 ? 'pink' : 'blue'});">${this.attempts}</span> / ${this.maxAttempts}`;
    }

    getStats() { return { attempts: this.attempts, hintsUsed: this.hintsShown, completed: this.isComplete }; }

    destroy() {
        this.clearSaltReuseCompletionTimer();
        this.clearThreatCompletionTimer();
        this.stopSingleChoiceTimers();
        this.stopPredictionTimer();
        this.stopLiveDefenseSimulation();
        this.stopSignalInterceptSimulation();
        this.stopHumanLabMatrixAnimation();
        this.inputs.forEach(i => { i.removeEventListener('input', null); i.removeEventListener('keydown', null); i.removeEventListener('keypress', null); i.removeEventListener('paste', null); });
    }

    // ─── dynamic password generation (retained from original) ─────────────────

    generateDynamicPasswordProfile(puzzleData) {
        if (puzzleData.randomizationType === 'keywordSuffix') return this.generateKeywordPasswordProfile(puzzleData);
        const rawNames = Array.isArray(puzzleData.candidateNames) ? puzzleData.candidateNames : [];
        const names = rawNames.map(n => String(n || '').toUpperCase().replace(/[^A-Z]/g, '')).filter(n => n.length >= 4 && n.length <= 6);
        const fallback = ['SARAH','EMILY','DAVID','NADIA','RUBEL','JULIA'];
        const namePool = names.length ? names : fallback;
        const selectedName = namePool[Math.floor(Math.random() * namePool.length)];
        const key = `mission-${this.mission?.id || 'unknown'}-variant`;
        const variant = this.pickNonRepeatingVariant(key, ['name_pin','codename_year','id_pattern','pure_word']);
        const labels = ['SOC Report', 'SIEM Correlation', 'Forensic Artifact'];
        if (variant === 'name_pin') {
            const d1 = Math.floor(Math.random() * 8) + 1, d2 = Math.min(9, d1 + (Math.floor(Math.random() * 2) + 1));
            return { password: `${selectedName}${d1}${d2}`, hints: [`${labels[0]}: Blueprint is NAME##. Name is ${selectedName.length} letters starting with '${selectedName[0]}'.`, `${labels[1]}: Sorted letters: ${selectedName.split('').sort().join('')}. Numeric tail is two digits.`, `${labels[2]}: Sum = ${d1+d2}, diff = ${Math.abs(d2-d1)}, second digit greater.`], scenarioNarrative: 'HR profile leakage correlated with old identity policy traces.', taskNarrative: 'Recover credential format NAME## from profile and arithmetic evidence.', overallAnswerHint: 'Pattern is NAME## (a person name followed by two digits).' };
        }
        const word = ['TRUST','SHIELD','FORENSIC','ACCESS','CONTROL','AUDIT'][Math.floor(Math.random() * 6)];
        return { password: word, hints: [`${labels[0]}: Blueprint is WORD (letters only). Length is ${word.length}.`, `${labels[1]}: Sorted signature is ${word.split('').sort().join('')}.`, `${labels[2]}: Starts with '${word[0]}', ends with '${word[word.length-1]}'.`], scenarioNarrative: 'SOC threat-model replay found a plaintext dictionary-only credential.', taskNarrative: 'Recover the exact word credential from lexical evidence.', overallAnswerHint: 'Pattern is WORD (letters only).' };
    }

    generateKeywordPasswordProfile(puzzleData) {
        const keywords = (Array.isArray(puzzleData.candidateKeywords) ? puzzleData.candidateKeywords : []).map(w => String(w || '').toUpperCase().replace(/[^A-Z]/g, '')).filter(w => w.length >= 5 && w.length <= 8);
        const pool = keywords.length ? keywords : ['WELCOME','ACCESS','PORTAL','SECURE','SYSTEM','LOGIN'];
        const selectedWord = pool[Math.floor(Math.random() * pool.length)];
        const a = Math.floor(Math.random() * 8) + 1, b = Math.min(9, a + 1);
        return { password: `${selectedWord}${a}${b}`, hints: [`SOC: Blueprint is KEYWORD##. Prefix is a common keyword (${selectedWord.length} chars).`, `Pattern: sorted signature ${selectedWord.split('').sort().join('')}.`, `Numeric suffix rule: sum = ${a+b}, second digit is one greater than first.`], scenarioNarrative: 'Crack-speed simulation flagged a weak default pattern.', taskNarrative: 'Recover KEYWORD## from lexical signature and numeric relation.', overallAnswerHint: 'Pattern is KEYWORD## (keyword + two digits).' };
    }

    pickNonRepeatingVariant(stateKey, variants) {
        if (!Array.isArray(variants) || !variants.length) return '';
        if (!window.__shadowdefVariantState) window.__shadowdefVariantState = {};
        const last = window.__shadowdefVariantState[stateKey];
        const pool = (variants.length > 1 && last && variants.includes(last)) ? variants.filter(v => v !== last) : variants;
        const selected = pool[Math.floor(Math.random() * pool.length)];
        window.__shadowdefVariantState[stateKey] = selected;
        return selected;
    }
}

