/**
 * PasswordCrack - Password cracking puzzle
 * Players must guess a password using hints
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
        this.singleChoiceTimerId = null;
        this.singleChoiceLogTimerId = null;
        this.singleChoiceRemaining = this.puzzleData.timeLimit || 60;
        this.vaultConfig = this.puzzleData.vaultIntegrity || null;
        this.vaultIntegrity = this.vaultConfig ? (this.vaultConfig.start || 100) : 100;
        this.logEntryIndex = 0;
        this.predictionSession = null;
        this.predictionSelected = null;
        this.predictionTimerId = null;
        this.predictionRemaining = this.puzzleData.timeLimit || 60;
        this.investigationSelectedCause = null;
        this.investigationSelectedDefense = null;
        this.investigationStage = 'cause';
        this.inspectionSelectedSystem = null;
        this.strategySelectedDefenses = new Set();
        this.strategySimulationResult = null;
        this.liveVaultHealth = 100;
        this.liveEnergy = 100;
        this.liveRemainingTime = 60;
        this.liveActiveAttack = null;
        this.liveDefenseCooldowns = {};
        this.liveAttackTimeoutId = null;
        this.liveSpawnTimeoutId = null;
        this.liveEnergyTimerId = null;
        this.liveDurationTimerId = null;
        this.liveCooldownTimerId = null;
        this.multiVaultHealth = 100;
        this.multiEnergy = 100;
        this.multiRemainingTime = 90;
        this.multiStageIndex = 0;
        this.multiStageRemaining = 0;
        this.multiActiveAttacks = [];
        this.multiFlags = {
            compromisedAccounts: 0,
            elevatedAccess: false,
            databaseStolen: false
        };
        this.multiDefenseCooldowns = {};
        this.multiSpawnTimeoutId = null;
        this.multiAttackResolveTimeoutId = null;
        this.multiEnergyTimerId = null;
        this.multiDurationTimerId = null;
        this.multiCooldownTimerId = null;
        this.multiStageTimerId = null;
        this.multiUncounteredByStage = {};
        this.threatVaultHealth = 100;
        this.threatSystemIntegrity = 100;
        this.threatFalsePositiveCount = 0;
        this.threatAttackerProgress = 0;
        this.threatDetectedMajor = new Set();
        this.threatContainedMajor = new Set();
        this.threatInvestigatedEvents = new Set();
        this.threatTurn = 0;
        this.patchMetrics = {
            vaultHealth: 100,
            exploitSuccessRate: 62,
            serverLoad: 46,
            userExperienceScore: 82,
            vulnerabilityCountRemaining: 0
        };
        this.patchClosedVulns = new Set();
        this.patchAppliedActions = new Set();
        this.patchPrimaryFixed = false;
        this.patchSecondaryRevealed = false;
        this.patchTurnsSincePatch = 0;
        this.enterpriseConfig = {};
        this.enterpriseAttackResults = [];
        this.enterpriseScores = null;
        this.enterpriseRating = '';
        this.enterpriseBadgeUnlocked = false;
        
        // Puzzle data
        const dynamicPuzzle = this.puzzleData.randomized
            ? this.generateDynamicPasswordProfile(this.puzzleData)
            : null;

        if (this.interactionMode === 'multiSelect') {
            this.session = this.createMultiSelectSession();
            this.password = '';
            this.hints = [];
            this.overallAnswerHint = 'Select all weak passwords and avoid selecting strong ones.';
            this.dynamicScenario = this.session.storyHint || null;
            this.dynamicUserTask = this.mission.userTask || null;
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
        } else if (this.interactionMode === 'strategyBuilder') {
            this.password = '';
            this.hints = [];
            this.overallAnswerHint = null;
            this.dynamicScenario = null;
            this.dynamicUserTask = null;
        } else if (this.interactionMode === 'liveDefenseSimulation') {
            const simConfig = this.puzzleData.simulationConfig || {};
            this.liveVaultHealth = Number(simConfig.vaultHealth || 100);
            this.liveEnergy = Number(simConfig.playerEnergy || 100);
            this.liveRemainingTime = Number(simConfig.simulationDuration || 60);
            this.password = '';
            this.hints = [];
            this.overallAnswerHint = null;
            this.dynamicScenario = null;
            this.dynamicUserTask = null;
        } else if (this.interactionMode === 'multiStageDefenseSimulation') {
            const base = this.puzzleData.baseStats || {};
            this.multiVaultHealth = Number(base.vaultHealth || 100);
            this.multiEnergy = Number(base.playerEnergy || 100);
            this.multiRemainingTime = Number(base.simulationDuration || 90);
            this.multiStageIndex = 0;
            this.multiFlags = { ...(this.puzzleData.escalationFlags || this.multiFlags) };
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
            this.password = (dynamicPuzzle?.password || this.puzzleData.password || '').toUpperCase();
            this.hints = dynamicPuzzle?.hints || this.puzzleData.hints || [];
            this.overallAnswerHint = dynamicPuzzle?.overallAnswerHint || null;
            this.dynamicScenario = dynamicPuzzle?.scenarioNarrative || null;
            this.dynamicUserTask = dynamicPuzzle?.taskNarrative || null;
        }
        this.visualProfile = this.puzzleData.visualProfile || null;
        this.visualMode = this.mission.visualMode || '2D';
        this.enterpriseControls = this.puzzleData.enterpriseControls || null;
        this.ratingBands = this.puzzleData.ratingBands || null;
        this.maxAttempts = this.puzzleData.maxAttempts || CONFIG.PUZZLES.PASSWORD.MAX_ATTEMPTS;
        
        // State
        this.attempts = 0;
        this.hintsShown = 0;
        this.isComplete = false;
        this.inputs = [];
        this.visualizerElement = null;
        
        console.log('🔐 Password puzzle initialized:', this.interactionMode);
    }

    /**
     * Generate a dynamic NAME## credential with long-form, story-driven reliable hints.
     * This runs every time the mission is entered.
     * @param {Object} puzzleData
     * @returns {{password: string, hints: string[], scenarioNarrative: string, taskNarrative: string}}
     */
    generateDynamicPasswordProfile(puzzleData) {
        if (puzzleData.randomizationType === 'keywordSuffix') {
            return this.generateKeywordPasswordProfile(puzzleData);
        }

        const rawNames = Array.isArray(puzzleData.candidateNames) ? puzzleData.candidateNames : [];
        const names = rawNames
            .map(name => String(name || '').toUpperCase().replace(/[^A-Z]/g, ''))
            .filter(name => name.length >= 4 && name.length <= 6);

        const fallbackNames = ['SARAH', 'EMILY', 'DAVID', 'NADIA', 'RUBEL', 'JULIA'];
        const namePool = names.length ? names : fallbackNames;

        const selectedName = namePool[Math.floor(Math.random() * namePool.length)];
        const selectedNameSorted = selectedName.split('').sort().join('');
        const selectedNameVowels = (selectedName.match(/[AEIOU]/g) || []).length;
        const key = `mission-${this.mission?.id || 'unknown'}-variant`;
        const variant = this.pickNonRepeatingVariant(key, ['name_pin', 'codename_year', 'id_pattern', 'pure_word']);
        const evidenceStyle = this.pickNonRepeatingVariant(`${key}-evidence`, ['helpdesk', 'siem', 'forensic', 'policy']);
        const evidenceLabelMap = {
            helpdesk: ['Helpdesk Ticket', 'Caller Verification', 'Reset Workflow Note'],
            siem: ['SIEM Correlation', 'Auth Stream Pattern', 'Threat Timeline'],
            forensic: ['Forensic Artifact', 'Endpoint Residue', 'Memory Note'],
            policy: ['Identity Policy', 'Compliance Trace', 'Audit Comment']
        };
        const labels = evidenceLabelMap[evidenceStyle] || evidenceLabelMap.helpdesk;

        let scenarioNarrative = '';
        let taskNarrative = '';
        let hints = [];
        let password = '';

        if (variant === 'name_pin') {
            const d1 = Math.floor(Math.random() * 8) + 1;
            const d2 = Math.min(9, d1 + (Math.floor(Math.random() * 2) + 1));
            const sum = d1 + d2;
            const diff = Math.abs(d2 - d1);
            password = `${selectedName}${d1}${d2}`;
            scenarioNarrative = 'HR profile leakage and badge OCR were correlated with old identity policy traces in SOC triage.';
            taskNarrative = 'Recover credential format NAME## from profile and arithmetic evidence.';
            hints = [
                `${labels[0]}: Overall blueprint is NAME##. Name part has ${selectedName.length} letters, starts with '${selectedName[0]}' and ends with '${selectedName[selectedName.length - 1]}'.`,
                `${labels[1]}: Name-letter checksum (sorted) is ${selectedNameSorted}, with ${selectedNameVowels} vowel(s). Numeric tail is exactly two digits.`,
                `${labels[2]}: For the two-digit tail, sum = ${sum}, absolute difference = ${diff}, and the second digit is greater than the first.`
            ];
            const overallAnswerHint = 'Pattern is NAME## (a person name followed by two digits).';
            return { password, hints, scenarioNarrative, taskNarrative, overallAnswerHint };
        } else if (variant === 'codename_year') {
            const codenamePool = ['FALCON', 'ORBIT', 'PHOTON', 'SPECTRA', 'VECTOR', 'NEXUS'];
            const code = codenamePool[Math.floor(Math.random() * codenamePool.length)];
            const yearTail = `${Math.floor(Math.random() * 4) + 2}${Math.floor(Math.random() * 10)}`; // 20-59 range tail
            password = `${code}${yearTail}`;
            const codeSorted = code.split('').sort().join('');
            scenarioNarrative = 'Red-team exercise artifacts indicate operators used project codenames followed by a short year token.';
            taskNarrative = 'Infer CODENAME## from operation notes and timeline data.';
            hints = [
                `${labels[0]}: Overall blueprint is CODENAME##. Prefix is a project codename with ${code.length} letters.`,
                `${labels[1]}: Codename letter signature (sorted) is ${codeSorted}.`,
                `${labels[2]}: Year token maps to incident timestamp tail: '20${yearTail}'. Use only the last two digits.`
            ];
            const overallAnswerHint = 'Pattern is CODENAME## (operation codename + two-digit year tail).';
            return { password, hints, scenarioNarrative, taskNarrative, overallAnswerHint };
        } else if (variant === 'id_pattern') {
            const initials = `${selectedName[0]}${selectedName[selectedName.length - 1]}`;
            const n1 = Math.floor(Math.random() * 9) + 1;
            const n2 = Math.floor(Math.random() * 9) + 1;
            const n3 = (n1 + n2) % 10;
            password = `${initials}${n1}${n2}${n3}${selectedName[1]}`;
            scenarioNarrative = 'Helpdesk reset tickets exposed a fallback employee-ID style password pattern during incident response.';
            taskNarrative = 'Reconstruct ID-style credential using initials and numeric checksum rule.';
            hints = [
                `${labels[0]}: Overall blueprint is AA###A. Leading initials are '${initials}' and final letter is '${selectedName[1]}'.`,
                `${labels[1]}: Middle numeric block contains 3 digits; first two are ${n1} and ${n2}.`,
                `${labels[2]}: Third numeric digit follows checksum rule (d1 + d2) mod 10 = ${n3}.`
            ];
            const overallAnswerHint = 'Pattern is AA###A (two initials, three-digit block, one trailing letter).';
            return { password, hints, scenarioNarrative, taskNarrative, overallAnswerHint };
        } else {
            const wordPool = ['TRUST', 'SHIELD', 'FORENSIC', 'ACCESS', 'CONTROL', 'AUDIT'];
            const word = wordPool[Math.floor(Math.random() * wordPool.length)];
            password = word;
            const sorted = word.split('').sort().join('');
            const vowels = (word.match(/[AEIOU]/g) || []).length;
            scenarioNarrative = 'SOC threat-model replay found a plaintext dictionary-only credential in one legacy service.';
            taskNarrative = 'Recover the exact word credential from lexical evidence only.';
            hints = [
                `${labels[0]}: Overall blueprint is WORD (letters only). Length is ${word.length}, no digits/symbols.`,
                `${labels[1]}: Sorted letter signature is ${sorted}.`,
                `${labels[2]}: Starts with '${word[0]}', ends with '${word[word.length - 1]}', contains ${vowels} vowel(s).`
            ];
            const overallAnswerHint = 'Pattern is WORD (letters only, no digits or symbols).';
            return { password, hints, scenarioNarrative, taskNarrative, overallAnswerHint };
        }
    }

    /**
     * Generate dynamic LEVEL 2-style weak keyword + numeric suffix credentials
     * with varied SOC hint narratives.
     * @param {Object} puzzleData
     * @returns {{password: string, hints: string[], scenarioNarrative: string, taskNarrative: string}}
     */
    generateKeywordPasswordProfile(puzzleData) {
        const rawKeywords = Array.isArray(puzzleData.candidateKeywords) ? puzzleData.candidateKeywords : [];
        const keywords = rawKeywords
            .map(word => String(word || '').toUpperCase().replace(/[^A-Z]/g, ''))
            .filter(word => word.length >= 5 && word.length <= 8);

        const fallback = ['WELCOME', 'ACCESS', 'PORTAL', 'SECURE', 'SYSTEM', 'LOGIN'];
        const pool = keywords.length ? keywords : fallback;
        const selectedWord = pool[Math.floor(Math.random() * pool.length)];

        const sorted = selectedWord.split('').sort().join('');
        const uniqueCount = new Set(selectedWord.split('')).size;
        const key = `mission-${this.mission?.id || 'unknown'}-variant`;
        const variant = this.pickNonRepeatingVariant(key, ['keyword_pair', 'keyword_single', 'acronym_triplet', 'mixed_tail']);
        const evidenceStyle = this.pickNonRepeatingVariant(`${key}-evidence`, ['telemetry', 'ticket', 'audit', 'threatintel']);
        const evidenceLabelMap = {
            telemetry: ['Telemetry Snapshot', 'Pattern Correlation', 'Speed Model'],
            ticket: ['Support Ticket', 'Operator Comment', 'Reset Log'],
            audit: ['Audit Finding', 'Control Review', 'Compliance Note'],
            threatintel: ['Threat Intel', 'IOC Context', 'Campaign Tag']
        };
        const labels = evidenceLabelMap[evidenceStyle] || evidenceLabelMap.telemetry;

        let scenarioNarrative = '';
        let taskNarrative = '';
        let hints = [];
        let password = '';

        if (variant === 'keyword_pair') {
            const a = Math.floor(Math.random() * 8) + 1;
            const b = Math.min(9, a + 1);
            password = `${selectedWord}${a}${b}`;
            scenarioNarrative = 'Crack-speed simulation flagged a weak default pattern: dictionary keyword plus predictable two-digit tail.';
            taskNarrative = 'Recover KEYWORD## from lexical signature and numeric relation.';
            hints = [
                `${labels[0]}: Overall blueprint is KEYWORD##. Prefix is a common keyword (${selectedWord.length} chars).`,
                `${labels[1]}: Keyword sorted-letter signature is ${sorted}; unique-letter count ${uniqueCount}.`,
                `${labels[2]}: Two-digit suffix rule: sum = ${a + b}, and second digit is exactly one greater than first.`
            ];
            const overallAnswerHint = 'Pattern is KEYWORD## (keyword + two digits).';
            return { password, hints, scenarioNarrative, taskNarrative, overallAnswerHint };
        } else if (variant === 'keyword_single') {
            const digit = Math.floor(Math.random() * 10);
            password = `${selectedWord}${digit}`;
            scenarioNarrative = 'Audit replay shows users often append a single digit to a default word during first-login setup.';
            taskNarrative = 'Reconstruct the exact weak credential as KEYWORD#.';
            hints = [
                `${labels[0]}: Overall blueprint is KEYWORD#. Total length is ${selectedWord.length + 1}.`,
                `${labels[1]}: Keyword signature (sorted) is ${sorted}; unique letters ${uniqueCount}.`,
                `${labels[2]}: Final numeric digit from risk tag is ${digit}.`
            ];
            const overallAnswerHint = 'Pattern is KEYWORD# (keyword + one digit).';
            return { password, hints, scenarioNarrative, taskNarrative, overallAnswerHint };
        } else if (variant === 'acronym_triplet') {
            const acronym = selectedWord.slice(0, 3);
            const n1 = Math.floor(Math.random() * 8) + 1;
            const n2 = Math.floor(Math.random() * 8) + 1;
            const n3 = (n1 + n2) % 10;
            password = `${acronym}${n1}${n2}${n3}`;
            scenarioNarrative = 'High-speed cracking simulation identified an acronym-plus-numeric-block credential in privileged login traces.';
            taskNarrative = 'Derive ACRONYM### by correlating acronym source and checksum rule.';
            hints = [
                `${labels[0]}: Overall blueprint is ACR###. Acronym is the first 3 letters of "${selectedWord}".`,
                `${labels[1]}: First two digits in numeric block are ${n1} and ${n2}.`,
                `${labels[2]}: Third digit checksum is (d1 + d2) mod 10 = ${n3}.`
            ];
            const overallAnswerHint = 'Pattern is ACR### (3-letter acronym + three-digit numeric block).';
            return { password, hints, scenarioNarrative, taskNarrative, overallAnswerHint };
        } else {
            const tailLetter = selectedWord[selectedWord.length - 1];
            const first = selectedWord.slice(0, Math.max(4, selectedWord.length - 2));
            const d = Math.floor(Math.random() * 9) + 1;
            password = `${first}${d}${tailLetter}`;
            scenarioNarrative = 'Attack-path emulation detected a mixed weak format where users insert one digit before the final letter of a known keyword.';
            taskNarrative = 'Reconstruct mixed pattern PREFIX + digit + last-letter.';
            hints = [
                `${labels[0]}: Overall blueprint is PREFIX + digit + final-letter.`,
                `${labels[1]}: Prefix begins "${first}" and ending letter is "${tailLetter}".`,
                `${labels[2]}: Inserted numeric value before last letter is ${d}.`
            ];
            const overallAnswerHint = 'Pattern is PREFIX+digit+last-letter.';
            return { password, hints, scenarioNarrative, taskNarrative, overallAnswerHint };
        }
    }

    /**
     * Pick a variant while avoiding immediate repetition for the same mission.
     * @param {string} stateKey
     * @param {string[]} variants
     * @returns {string}
     */
    pickNonRepeatingVariant(stateKey, variants) {
        if (!Array.isArray(variants) || variants.length === 0) return '';

        if (!window.__shadowdefVariantState) {
            window.__shadowdefVariantState = {};
        }

        const last = window.__shadowdefVariantState[stateKey];
        let pool = variants;
        if (variants.length > 1 && last && variants.includes(last)) {
            pool = variants.filter(v => v !== last);
        }

        const selected = pool[Math.floor(Math.random() * pool.length)];
        window.__shadowdefVariantState[stateKey] = selected;
        return selected;
    }

    /**
     * Build a randomized session for multi-select level mode.
     * @returns {Object}
     */
    createMultiSelectSession() {
        if (typeof this.puzzleData.generateSession === 'function') {
            return this.puzzleData.generateSession.call(this.puzzleData);
        }

        const options = Array.isArray(this.puzzleData.options) ? this.puzzleData.options : [];
        return {
            options,
            storyHint: this.mission.scenario || '',
            subtleClueOnFail: '',
            failHints: [],
            securityInsight: []
        };
    }

    /**
     * Build randomized session for prediction-choice mode.
     * @returns {Object}
     */
    createPredictionSession() {
        if (typeof this.puzzleData.generateSession === 'function') {
            return this.puzzleData.generateSession.call(this.puzzleData);
        }
        const options = Array.isArray(this.puzzleData.options) ? this.puzzleData.options : [];
        return {
            caseId: 'default',
            options,
            correctAnswer: this.puzzleData.correctAnswer || options[0] || '',
            breakTimeSeconds: {},
            simpleExplanation: this.puzzleData.simpleExplanation || ''
        };
    }

    /**
     * Apply risk increase after a wrong decision in multi-select mode.
     */
    increaseRisk() {
        if (!this.riskSystem) return;
        this.riskValue = Math.min(this.riskSystem.max || 100, this.riskValue + (this.riskSystem.wrongAdd || 0));
        this.updateRiskDisplay();
    }

    /**
     * Update risk meter UI.
     */
    updateRiskDisplay() {
        if (!this.riskSystem) return;
        const fill = document.getElementById('risk-fill');
        const text = document.getElementById('risk-text');
        const max = this.riskSystem.max || 100;
        const percent = Math.max(0, Math.min(100, (this.riskValue / max) * 100));
        if (fill) fill.style.width = `${percent}%`;
        if (text) text.textContent = `${Math.floor(percent)}%`;
    }

    /**
     * Check if risk reached breach threshold.
     * @returns {boolean}
     */
    hasRiskBreached() {
        if (!this.riskSystem) return false;
        return this.riskValue >= (this.riskSystem.max || 100);
    }

    /**
     * Initialize and render the puzzle
     * @param {HTMLElement} container - Container element
     */
    render(container) {
        if (this.interactionMode === 'multiSelect') {
            this.renderMultiSelectPuzzle(container);
            return;
        }
        if (this.interactionMode === 'singleChoice') {
            this.renderSingleChoicePuzzle(container);
            return;
        }
        if (this.interactionMode === 'predictionChoice') {
            this.renderPredictionChoicePuzzle(container);
            return;
        }
        if (this.interactionMode === 'investigation') {
            this.renderInvestigationPuzzle(container);
            return;
        }
        if (this.interactionMode === 'inspection') {
            this.renderInspectionPuzzle(container);
            return;
        }
        if (this.interactionMode === 'strategyBuilder') {
            this.renderStrategyBuilderPuzzle(container);
            return;
        }
        if (this.interactionMode === 'liveDefenseSimulation') {
            this.renderLiveDefenseSimulationPuzzle(container);
            return;
        }
        if (this.interactionMode === 'multiStageDefenseSimulation') {
            this.renderMultiStageDefenseSimulationPuzzle(container);
            return;
        }
        if (this.interactionMode === 'threatHuntSimulation') {
            this.renderThreatHuntSimulationPuzzle(container);
            return;
        }
        if (this.interactionMode === 'livePatchSimulation') {
            this.renderLivePatchSimulationPuzzle(container);
            return;
        }
        if (this.interactionMode === 'enterpriseArchitectureSimulation') {
            this.renderEnterpriseArchitectureSimulationPuzzle(container);
            return;
        }

        const showVisualizer = this.visualProfile && this.visualMode !== '2D';
        const effectDescription = this.mission.threeDEffectDescription
            ? `<p class="visualizer-description">${this.mission.threeDEffectDescription}</p>`
            : '';

        container.innerHTML = `
            <div class="password-puzzle">
                <h2 class="puzzle-title">PASSWORD CRACKING PROTOCOL</h2>
                ${this.renderMissionBrief()}
                ${showVisualizer ? `
                    <div class="security-visualizer security-visualizer-${this.visualMode.toLowerCase()}" id="security-visualizer">
                        ${this.renderVisualizerMarkup()}
                        ${effectDescription}
                    </div>
                ` : ''}
                
                <div class="password-hints" id="password-hints">
                    <strong style="color: var(--cyber-blue);">INTELLIGENCE BRIEFING:</strong>
                    ${this.overallAnswerHint ? `<div class="hint"><strong>Overall Answer Hint:</strong> ${this.overallAnswerHint}</div>` : ''}
                    <div class="hint">→ ${this.hints[0]}</div>
                </div>
                
                <div class="password-display" id="password-display">
                    ${'_'.repeat(this.password.length)}
                </div>

                <div class="guess-feedback" id="guess-feedback">
                    Submit a guess to receive letter-by-letter forensic feedback.
                </div>
                
                <div class="password-input" id="password-input">
                    ${this.createInputs()}
                </div>
                
                <div class="puzzle-actions">
                    <button class="btn btn-primary" id="submit-password">
                        SUBMIT
                    </button>
                    <button class="btn" id="clear-password">
                        CLEAR
                    </button>
                </div>
                
                <div id="attempt-counter" style="text-align: center; margin-top: 20px; color: var(--text-secondary);">
                    Attempts: <span style="color: var(--cyber-blue);">${this.attempts}</span> / ${this.maxAttempts}
                </div>
            </div>
        `;

        // Setup event listeners
        this.setupEventListeners();
        this.setupVisualizer();
    }

    /**
     * Render single-choice live attack detection mode
     * @param {HTMLElement} container
     */
    renderSingleChoicePuzzle(container) {
        const stream = this.puzzleData.loginAttemptStream || {};
        const choices = Array.isArray(this.puzzleData.choices) ? this.puzzleData.choices : [];
        const choiceMarkup = choices.map(choice => `
            <label class="password-option" style="display:block; cursor:pointer; margin-bottom:8px;">
                <input type="radio" name="attack-choice" value="${choice.id}" style="margin-right:8px;" />
                ${choice.label}
            </label>
        `).join('');

        container.innerHTML = `
            <div class="password-puzzle">
                <h2 class="puzzle-title">LIVE ATTACK DETECTION</h2>
                <div class="password-brief">
                    <div><strong>OBJECTIVE:</strong> ${this.mission.objective || 'Identify the attack type quickly.'}</div>
                    <div><strong>SCENARIO:</strong> ${this.mission.scenario || 'Watch login attempts and decide what attack is happening.'}</div>
                    <div><strong>TASK:</strong> ${this.mission.userTask || 'Pick one attack type.'}</div>
                </div>
                <div class="password-risk-panel">
                    <div class="password-risk-header">
                        <span>${this.puzzleData.timerLabel || 'Time Left'}</span>
                        <span id="single-timer-text">${this.singleChoiceRemaining}s</span>
                    </div>
                    <div class="password-risk-header" style="margin-top: 8px;">
                        <span>${this.vaultConfig?.label || 'Vault Integrity'}</span>
                        <span id="vault-text">${Math.max(0, Math.floor(this.vaultIntegrity))}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" id="vault-fill" style="width: ${Math.max(0, Math.min(100, this.vaultIntegrity))}%;"></div>
                    </div>
                </div>
                <div class="password-hints">
                    <strong style="color: var(--cyber-blue);">LIVE LOG STREAM:</strong>
                    <div id="attack-log-stream" class="guess-feedback" style="text-align:left; max-height:180px; overflow:auto;">
                        Waiting for incoming login attempts...
                    </div>
                </div>
                <div class="password-options-grid" id="single-choice-grid">
                    ${choiceMarkup}
                </div>
                <div class="guess-feedback" id="guess-feedback">
                    Read the pattern, choose one option, then submit.
                </div>
                <div class="puzzle-actions">
                    <button class="btn btn-primary" id="submit-single-choice">SUBMIT DECISION</button>
                </div>
                <div id="attempt-counter" style="text-align: center; margin-top: 20px; color: var(--text-secondary);">
                    Decisions: <span style="color: var(--cyber-blue);">${this.attempts}</span> / ${this.maxAttempts}
                </div>
            </div>
        `;

        this.setupSingleChoiceEventListeners();
        this.startSingleChoiceSimulation();
    }

    /**
     * Render prediction-choice password race mode
     * @param {HTMLElement} container
     */
    renderPredictionChoicePuzzle(container) {
        const session = this.predictionSession || this.createPredictionSession();
        const options = Array.isArray(session.options) ? session.options : [];
        const choiceMarkup = options.map((option, idx) => `
            <label class="password-option" style="display:block; cursor:pointer; margin-bottom:8px;">
                <input type="radio" name="prediction-choice" value="${option}" style="margin-right:8px;" />
                ${String.fromCharCode(65 + idx)}. ${option}
            </label>
        `).join('');

        const raceMarkup = options.map((option, idx) => `
            <div class="race-row" style="margin: 10px 0;">
                <div style="display:flex; justify-content:space-between; gap:12px; margin-bottom:4px;">
                    <span>${String.fromCharCode(65 + idx)}. ${option}</span>
                    <span id="race-time-${idx}">Estimating...</span>
                </div>
                <div style="height: 10px; background: rgba(100,116,139,0.2); border-radius: 999px; overflow: hidden;">
                    <div id="race-bar-${idx}" style="height: 10px; width: 0%; transition: width ${this.puzzleData?.simulationUI?.animateDurationMs || 3200}ms linear; background: var(--cyber-blue);"></div>
                </div>
            </div>
        `).join('');

        container.innerHTML = `
            <div class="password-puzzle">
                <h2 class="puzzle-title">PASSWORD STRENGTH RACE</h2>
                <div class="password-brief">
                    <div><strong>OBJECTIVE:</strong> ${this.mission.objective || 'Predict which password breaks first.'}</div>
                    <div><strong>SCENARIO:</strong> ${this.mission.scenario || 'Compare passwords and predict the first one to fail.'}</div>
                    <div><strong>TASK:</strong> Which password will break first?</div>
                </div>
                <div class="password-risk-panel">
                    <div class="password-risk-header">
                        <span>Decision Time</span>
                        <span id="prediction-timer-text">${this.predictionRemaining}s</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" id="prediction-timer-fill" style="width: 100%;"></div>
                    </div>
                </div>
                <div class="password-options-grid" id="prediction-choice-grid">
                    ${choiceMarkup}
                </div>
                <div class="puzzle-actions">
                    <button class="btn btn-primary" id="submit-prediction-choice">RUN SIMULATION</button>
                </div>
                <div id="prediction-race-board" class="password-hints" style="display:none;">
                    <strong style="color: var(--cyber-blue);">CRACK SPEED RACE:</strong>
                    <div id="prediction-race-rows">${raceMarkup}</div>
                </div>
                <div class="guess-feedback" id="guess-feedback">
                    Pick one password, then run the race to see what breaks first.
                </div>
                <div id="attempt-counter" style="text-align: center; margin-top: 20px; color: var(--text-secondary);">
                    Decisions: <span style="color: var(--cyber-blue);">${this.attempts}</span> / ${this.maxAttempts}
                </div>
            </div>
        `;

        this.setupPredictionChoiceEventListeners();
        this.startPredictionTimer();
    }

    /**
     * Render breach investigation mode
     * @param {HTMLElement} container
     */
    renderInvestigationPuzzle(container) {
        const logs = Array.isArray(this.puzzleData.evidenceLogs) ? this.puzzleData.evidenceLogs : [];
        const profile = this.puzzleData.profileData || {};
        const policy = this.puzzleData.systemPolicy || {};
        const causeChoices = Array.isArray(this.puzzleData.choices) ? this.puzzleData.choices : [];
        const followUp = this.puzzleData.followUpDefenseQuestion || null;
        const causeMarkup = causeChoices.map(choice => `
            <label class="password-option" style="display:block; cursor:pointer; margin-bottom:8px;">
                <input type="radio" name="investigation-cause" value="${choice.id}" style="margin-right:8px;" />
                ${choice.label}
            </label>
        `).join('');
        const defenseMarkup = followUp
            ? (Array.isArray(followUp.options) ? followUp.options.map(option => `
                <label class="password-option" style="display:block; cursor:pointer; margin-bottom:8px;">
                    <input type="radio" name="investigation-defense" value="${option.id}" style="margin-right:8px;" />
                    ${option.label}
                </label>
            `).join('') : '')
            : '';
        const logMarkup = logs.map(line => `<div>${line}</div>`).join('');

        container.innerHTML = `
            <div class="password-puzzle">
                <h2 class="puzzle-title">DATA BREACH INVESTIGATION</h2>
                <div class="password-brief">
                    <div><strong>OBJECTIVE:</strong> ${this.mission.objective || 'Find how the breach happened.'}</div>
                    <div><strong>SCENARIO:</strong> ${this.mission.scenario || ''}</div>
                    <div><strong>TASK:</strong> ${this.mission.userTask || ''}</div>
                </div>
                <div class="password-hints">
                    <strong style="color: var(--cyber-blue);">EVIDENCE: LOGIN LOGS</strong>
                    <div class="guess-feedback" style="text-align:left;">${logMarkup || 'No logs found.'}</div>
                </div>
                <div class="password-hints">
                    <strong style="color: var(--cyber-blue);">EVIDENCE: ACCOUNT PROFILE</strong>
                    <div class="guess-feedback" style="text-align:left;">
                        <div>Name: ${profile.name || 'Unknown'}</div>
                        <div>Public info: ${profile.publicInfo || 'None'}</div>
                        <div>Role: ${profile.role || 'Unknown'}</div>
                    </div>
                </div>
                <div class="password-hints">
                    <strong style="color: var(--cyber-blue);">EVIDENCE: SYSTEM POLICY</strong>
                    <div class="guess-feedback" style="text-align:left;">
                        <div>${policy.rateLimiting || ''}</div>
                        <div>${policy.accountLockout || ''}</div>
                        <div>${policy.passwordRule || ''}</div>
                    </div>
                </div>
                <div id="investigation-cause-block">
                    <div class="password-hints">
                        <strong style="color: var(--cyber-blue);">QUESTION 1: How did the breach happen?</strong>
                    </div>
                    <div class="password-options-grid">${causeMarkup}</div>
                    <div class="puzzle-actions">
                        <button class="btn btn-primary" id="submit-investigation-cause">SUBMIT CAUSE</button>
                    </div>
                </div>
                <div id="investigation-defense-block" style="display:none;">
                    ${followUp ? `
                        <div class="password-hints">
                            <strong style="color: var(--cyber-blue);">QUESTION 2: ${followUp.prompt}</strong>
                        </div>
                        <div class="password-options-grid">${defenseMarkup}</div>
                        <div class="puzzle-actions">
                            <button class="btn btn-primary" id="submit-investigation-defense">SUBMIT DEFENSE</button>
                        </div>
                    ` : ''}
                </div>
                <div class="guess-feedback" id="guess-feedback">
                    Review the evidence and choose the most likely cause.
                </div>
                <div id="attempt-counter" style="text-align: center; margin-top: 20px; color: var(--text-secondary);">
                    Decisions: <span style="color: var(--cyber-blue);">${this.attempts}</span> / ${this.maxAttempts}
                </div>
            </div>
        `;

        this.setupInvestigationEventListeners();
    }

    /**
     * Render storage inspection mode
     * @param {HTMLElement} container
     */
    renderInspectionPuzzle(container) {
        const systems = Array.isArray(this.puzzleData.systems) ? this.puzzleData.systems : [];
        const choices = Array.isArray(this.puzzleData.choices) ? this.puzzleData.choices : [];

        const systemsMarkup = systems.map(system => `
            <div class="password-hints" style="margin-top: 14px;">
                <strong style="color: var(--cyber-blue);">${system.name}</strong>
                <div class="puzzle-actions" style="margin-top:8px;">
                    <button class="btn btn-small" data-action="view-db" data-system-id="${system.id}">VIEW DATABASE</button>
                    <button class="btn btn-small" data-action="simulate-breach" data-system-id="${system.id}">SIMULATE BREACH</button>
                </div>
                <div id="db-${system.id}" class="guess-feedback" style="display:none; text-align:left; margin-top:8px;"></div>
                <div id="breach-${system.id}" class="guess-feedback" style="display:none; text-align:left; margin-top:8px;"></div>
            </div>
        `).join('');

        const choiceMarkup = choices.map(choice => `
            <label class="password-option" style="display:block; cursor:pointer; margin-bottom:8px;">
                <input type="radio" name="inspection-choice" value="${choice.id}" style="margin-right:8px;" />
                ${choice.label}
            </label>
        `).join('');

        container.innerHTML = `
            <div class="password-puzzle">
                <h2 class="puzzle-title">STORAGE AUDIT</h2>
                <div class="password-brief">
                    <div><strong>OBJECTIVE:</strong> ${this.mission.objective || ''}</div>
                    <div><strong>SCENARIO:</strong> ${this.mission.scenario || ''}</div>
                    <div><strong>TASK:</strong> ${this.mission.userTask || ''}</div>
                </div>
                ${systemsMarkup}
                <div class="password-hints">
                    <strong style="color: var(--cyber-blue);">QUESTION: Which system is safer?</strong>
                </div>
                <div class="password-options-grid">
                    ${choiceMarkup}
                </div>
                <div class="puzzle-actions">
                    <button class="btn btn-primary" id="submit-inspection-choice">CHOOSE SAFER SYSTEM</button>
                </div>
                <div class="guess-feedback" id="guess-feedback">
                    Use "View Database" and "Simulate Breach" first, then choose.
                </div>
                <div id="attempt-counter" style="text-align: center; margin-top: 20px; color: var(--text-secondary);">
                    Decisions: <span style="color: var(--cyber-blue);">${this.attempts}</span> / ${this.maxAttempts}
                </div>
            </div>
        `;

        this.setupInspectionEventListeners();
    }

    /**
     * Render strategy builder mode
     * @param {HTMLElement} container
     */
    renderStrategyBuilderPuzzle(container) {
        const intro = this.puzzleData.initialScenarioDisplay || {};
        const defenses = Array.isArray(this.puzzleData.defenses) ? this.puzzleData.defenses : [];
        const waves = Array.isArray(this.puzzleData.attackWaves) ? this.puzzleData.attackWaves : [];
        const totalBudget = this.getStrategyTotalBudget();

        const defenseMarkup = defenses.map(defense => `
            <button class="password-option" data-defense-id="${defense.id}" type="button">
                ${defense.name} (${defense.cost} pts)
            </button>
        `).join('');

        const waveMarkup = waves.map((wave, idx) => `
            <div id="strategy-wave-${wave.id}" style="display:flex; justify-content:space-between; gap: 10px; padding: 6px 0; border-bottom: ${idx === waves.length - 1 ? 'none' : '1px solid rgba(0,255,255,0.16)'};">
                <span>${wave.name}</span>
                <span id="strategy-wave-status-${wave.id}" style="color: var(--text-secondary);">Pending</span>
            </div>
        `).join('');

        container.innerHTML = `
            <div class="password-puzzle">
                <h2 class="puzzle-title">DEFENSE STRATEGY BUILDER</h2>
                <div class="password-brief">
                    <div><strong>OBJECTIVE:</strong> ${this.mission.objective || ''}</div>
                    <div><strong>SCENARIO:</strong> ${intro.message || this.mission.scenario || ''}</div>
                    <div><strong>TASK:</strong> ${this.mission.userTask || ''}</div>
                </div>
                <div class="password-risk-panel">
                    <div class="password-risk-header">
                        <span>${intro.budgetLabel || 'Total Security Budget'}</span>
                        <span id="strategy-budget-text">0 / ${totalBudget}</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" id="strategy-budget-fill" style="width: 0%;"></div>
                    </div>
                </div>
                <div class="password-hints">
                    <strong style="color: var(--cyber-blue);">DEFENSE OPTIONS:</strong>
                </div>
                <div class="password-options-grid" id="strategy-defense-grid">
                    ${defenseMarkup}
                </div>
                <div class="password-hints" style="margin-top: 14px;">
                    <strong style="color: var(--cyber-blue);">ATTACK WAVES:</strong>
                    <div class="guess-feedback" style="text-align:left;">${waveMarkup}</div>
                </div>
                <div class="guess-feedback" id="guess-feedback">
                    Choose defenses within budget, then run simulation.
                </div>
                <div class="puzzle-actions">
                    <button class="btn btn-primary" id="run-strategy-simulation">RUN SIMULATION</button>
                    <button class="btn" id="clear-strategy-selection">RESET DEFENSES</button>
                </div>
                <div id="attempt-counter" style="text-align: center; margin-top: 20px; color: var(--text-secondary);">
                    Simulations: <span style="color: var(--cyber-blue);">${this.attempts}</span> / ${this.maxAttempts}
                </div>
            </div>
        `;

        this.updateStrategyBudgetUI();
        this.setupStrategyBuilderEventListeners();
    }

    /**
     * Render live defense simulation mode
     * @param {HTMLElement} container
     */
    renderLiveDefenseSimulationPuzzle(container) {
        const defenses = Array.isArray(this.puzzleData.defenses) ? this.puzzleData.defenses : [];
        const defenseMarkup = defenses.map(defense => `
            <button class="password-option" data-live-defense="${defense.name}" type="button">
                ${defense.name}
                <div style="font-size: var(--font-size-xs); color: var(--text-secondary); margin-top: 4px;">
                    Energy: ${defense.energyCost} | CD: ${defense.cooldown}s
                </div>
                <div id="live-cd-${this.sanitizeId(defense.name)}" style="font-size: var(--font-size-xs); color: var(--cyber-blue); margin-top: 4px;">
                    READY
                </div>
            </button>
        `).join('');

        container.innerHTML = `
            <div class="password-puzzle">
                <h2 class="puzzle-title">LIVE DEFENSE SIMULATION</h2>
                <div class="password-brief">
                    <div><strong>OBJECTIVE:</strong> ${this.mission.objective || ''}</div>
                    <div><strong>SCENARIO:</strong> ${this.mission.scenario || ''}</div>
                    <div><strong>TASK:</strong> ${this.mission.userTask || ''}</div>
                </div>
                <div class="password-risk-panel">
                    <div class="password-risk-header">
                        <span>Vault Health</span>
                        <span id="live-vault-text">${Math.max(0, Math.floor(this.liveVaultHealth))}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" id="live-vault-fill" style="width: ${Math.max(0, Math.min(100, this.liveVaultHealth))}%;"></div>
                    </div>
                    <div class="password-risk-header" style="margin-top: 10px;">
                        <span>Player Energy</span>
                        <span id="live-energy-text">${Math.max(0, Math.floor(this.liveEnergy))}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" id="live-energy-fill" style="width: ${Math.max(0, Math.min(100, this.liveEnergy))}%;"></div>
                    </div>
                    <div class="password-risk-header" style="margin-top: 10px;">
                        <span>Time Left</span>
                        <span id="live-time-text">${Math.max(0, Math.floor(this.liveRemainingTime))}s</span>
                    </div>
                </div>
                <div class="password-hints">
                    <strong style="color: var(--cyber-blue);">INCOMING ATTACK:</strong>
                    <div class="guess-feedback" id="live-current-attack" style="text-align:left;">Waiting for first wave...</div>
                </div>
                <div class="password-options-grid" id="live-defense-grid">
                    ${defenseMarkup}
                </div>
                <div class="guess-feedback" id="guess-feedback" style="max-height: 170px; overflow:auto; text-align:left;">
                    Simulation started. Prepare your defenses.
                </div>
                <div id="attempt-counter" style="text-align: center; margin-top: 20px; color: var(--text-secondary);">
                    Live defense active
                </div>
            </div>
        `;

        this.setupLiveDefenseEventListeners();
        this.startLiveDefenseSimulation();
    }

    /**
     * Render multi-stage boss simulation mode
     * @param {HTMLElement} container
     */
    renderMultiStageDefenseSimulationPuzzle(container) {
        const modules = Array.isArray(this.puzzleData.defenseModules) ? this.puzzleData.defenseModules : [];
        const buttons = modules.map(defense => `
            <button class="password-option" data-multi-defense="${defense.name}" type="button">
                ${defense.name}
                <div style="font-size: var(--font-size-xs); color: var(--text-secondary); margin-top: 4px;">
                    Energy: ${defense.energyCost} | CD: ${defense.cooldown}s
                </div>
                <div id="multi-cd-${this.sanitizeId(defense.name)}" style="font-size: var(--font-size-xs); color: var(--cyber-blue); margin-top: 4px;">
                    READY
                </div>
            </button>
        `).join('');

        container.innerHTML = `
            <div class="password-puzzle">
                <h2 class="puzzle-title">APT ASSAULT - BOSS CAMPAIGN</h2>
                <div class="password-brief">
                    <div><strong>OBJECTIVE:</strong> ${this.mission.objective || ''}</div>
                    <div><strong>SCENARIO:</strong> ${this.mission.scenario || ''}</div>
                    <div><strong>TASK:</strong> ${this.mission.userTask || ''}</div>
                </div>
                <div class="password-risk-panel">
                    <div class="password-risk-header">
                        <span>Vault Health</span>
                        <span id="multi-vault-text">${Math.floor(this.multiVaultHealth)}%</span>
                    </div>
                    <div class="progress-bar"><div class="progress-fill" id="multi-vault-fill" style="width:${this.multiVaultHealth}%"></div></div>
                    <div class="password-risk-header" style="margin-top:10px;">
                        <span>Player Energy</span>
                        <span id="multi-energy-text">${Math.floor(this.multiEnergy)}%</span>
                    </div>
                    <div class="progress-bar"><div class="progress-fill" id="multi-energy-fill" style="width:${this.multiEnergy}%"></div></div>
                    <div class="password-risk-header" style="margin-top:10px;">
                        <span>Total Time Left</span>
                        <span id="multi-time-text">${Math.floor(this.multiRemainingTime)}s</span>
                    </div>
                    <div class="password-risk-header" style="margin-top:10px;">
                        <span id="multi-stage-label">Stage 1/4</span>
                        <span id="multi-stage-time">20s</span>
                    </div>
                </div>
                <div class="password-hints">
                    <strong style="color: var(--cyber-blue);">ACTIVE THREATS:</strong>
                    <div class="guess-feedback" id="multi-current-attacks" style="text-align:left;">Campaign initializing...</div>
                </div>
                <div class="password-options-grid">${buttons}</div>
                <div class="guess-feedback" id="guess-feedback" style="max-height:170px; overflow:auto; text-align:left;">
                    Stage chain loaded. Prevent early escalation.
                </div>
                <div id="attempt-counter" style="text-align:center; margin-top:20px; color: var(--text-secondary);">Boss simulation active</div>
            </div>
        `;

        this.setupMultiStageDefenseEventListeners();
        this.startMultiStageDefenseSimulation();
    }

    /**
     * Render threat hunt simulation mode
     * @param {HTMLElement} container
     */
    renderThreatHuntSimulationPuzzle(container) {
        const panels = Array.isArray(this.puzzleData.evidencePanels) ? this.puzzleData.evidencePanels : [];
        const panelMarkup = panels.map(panel => {
            const rows = (panel.entries || []).map(entry => `
                <div class="guess-feedback" style="margin-top:8px; text-align:left;">
                    <div><strong>${entry.id}</strong> | ${entry.timestamp} | ${entry.user}</div>
                    <div>${entry.action}</div>
                    <div>${entry.locationOrIP} | ${entry.status}</div>
                    <div style="margin-top:8px; display:flex; gap:6px; flex-wrap:wrap;">
                        <button class="btn btn-small" data-threat-action="mark_suspicious" data-event-id="${entry.id}">MARK</button>
                        <button class="btn btn-small" data-threat-action="investigate" data-event-id="${entry.id}">INVESTIGATE</button>
                        <button class="btn btn-small" data-threat-action="isolate_account" data-event-id="${entry.id}">ISOLATE ACCOUNT</button>
                        <button class="btn btn-small" data-threat-action="block_ip" data-event-id="${entry.id}">BLOCK IP</button>
                        <button class="btn btn-small" data-threat-action="ignore" data-event-id="${entry.id}">IGNORE</button>
                    </div>
                </div>
            `).join('');

            return `
                <div class="password-hints" style="margin-top:14px;">
                    <strong style="color: var(--cyber-blue);">${panel.title}</strong>
                    ${rows}
                </div>
            `;
        }).join('');

        container.innerHTML = `
            <div class="password-puzzle">
                <h2 class="puzzle-title">ENTERPRISE THREAT HUNT</h2>
                <div class="password-brief">
                    <div><strong>OBJECTIVE:</strong> ${this.mission.objective || ''}</div>
                    <div><strong>SCENARIO:</strong> ${this.mission.scenario || ''}</div>
                    <div><strong>TASK:</strong> ${this.mission.userTask || ''}</div>
                </div>
                <div class="password-risk-panel">
                    <div class="password-risk-header"><span>Vault Health</span><span id="threat-vault-text">${Math.floor(this.threatVaultHealth)}%</span></div>
                    <div class="progress-bar"><div class="progress-fill" id="threat-vault-fill" style="width:${this.threatVaultHealth}%"></div></div>
                    <div class="password-risk-header" style="margin-top:10px;"><span>System Integrity</span><span id="threat-integrity-text">${Math.floor(this.threatSystemIntegrity)}%</span></div>
                    <div class="progress-bar"><div class="progress-fill" id="threat-integrity-fill" style="width:${this.threatSystemIntegrity}%"></div></div>
                    <div class="password-risk-header" style="margin-top:10px;"><span>False Positives</span><span id="threat-fp-text">${this.threatFalsePositiveCount}</span></div>
                    <div class="password-risk-header" style="margin-top:6px;"><span>Attacker Progress</span><span id="threat-progress-text">${this.threatAttackerProgress}</span></div>
                </div>
                ${panelMarkup}
                <div class="guess-feedback" id="guess-feedback" style="max-height:180px; overflow:auto; text-align:left;">
                    Threat hunt initialized. Review evidence and act carefully.
                </div>
                <div class="puzzle-actions">
                    <button class="btn btn-primary" id="threat-finalize">FINALIZE HUNT</button>
                </div>
                <div id="attempt-counter" style="text-align:center; margin-top:20px; color: var(--text-secondary);">
                    Investigation actions: <span style="color: var(--cyber-blue);">0</span>
                </div>
            </div>
        `;

        this.setupThreatHuntEventListeners();
        this.updateThreatHuntUI();
    }

    /**
     * Render zero-day live patch simulation mode
     * @param {HTMLElement} container
     */
    renderLivePatchSimulationPuzzle(container) {
        const modules = Array.isArray(this.puzzleData.architectureModules) ? this.puzzleData.architectureModules : [];
        const moduleMarkup = modules
            .sort((a, b) => Number(a.flowOrder || 0) - Number(b.flowOrder || 0))
            .map(m => `
                <div class="guess-feedback" style="text-align:left; margin-top:8px;">
                    <div><strong>[ ${m.name} ]</strong>${m.editable ? ' (editable)' : ''}</div>
                    <div>${m.notes || ''}</div>
                </div>
            `).join('');

        const patchActions = (Array.isArray(this.puzzleData.patchOptions) ? this.puzzleData.patchOptions : [])
            .map(p => `
                <button class="btn btn-small" data-patch-action="${p.id}" style="margin:4px 6px 4px 0;">
                    ${p.uiLabel || p.action}
                </button>
            `).join('');

        container.innerHTML = `
            <div class="password-puzzle">
                <h2 class="puzzle-title">ZERO-DAY LIVE PATCH LAB</h2>
                <div class="password-brief">
                    <div><strong>OBJECTIVE:</strong> ${this.mission.objective || ''}</div>
                    <div><strong>SCENARIO:</strong> ${this.mission.scenario || ''}</div>
                    <div><strong>TASK:</strong> ${this.mission.userTask || ''}</div>
                </div>
                <div class="password-hints">
                    <strong style="color: var(--cyber-blue);">SYSTEM ARCHITECTURE FLOW:</strong>
                    ${moduleMarkup}
                </div>
                <div class="password-risk-panel">
                    <div class="password-risk-header"><span>Vault Health</span><span id="patch-vault">${Math.floor(this.patchMetrics.vaultHealth)}%</span></div>
                    <div class="progress-bar"><div class="progress-fill" id="patch-vault-fill" style="width:${Math.max(0, Math.min(100, this.patchMetrics.vaultHealth))}%"></div></div>
                    <div class="password-risk-header" style="margin-top:8px;"><span>Exploit Success Rate</span><span id="patch-exploit">${Math.floor(this.patchMetrics.exploitSuccessRate)}%</span></div>
                    <div class="password-risk-header"><span>Server Load</span><span id="patch-load">${Math.floor(this.patchMetrics.serverLoad)}%</span></div>
                    <div class="password-risk-header"><span>User Experience</span><span id="patch-ux">${Math.floor(this.patchMetrics.userExperienceScore)}%</span></div>
                    <div class="password-risk-header"><span>Vulnerabilities Remaining</span><span id="patch-vuln">${this.patchMetrics.vulnerabilityCountRemaining}</span></div>
                </div>
                <div class="puzzle-actions" id="patch-actions">
                    ${patchActions}
                </div>
                <div class="guess-feedback" id="guess-feedback" style="max-height:180px; overflow:auto; text-align:left;">
                    Live patch lab online. Run exploit simulation to validate fixes.
                </div>
                <div id="attempt-counter" style="text-align:center; margin-top:20px; color: var(--text-secondary);">
                    Patch operations: <span style="color: var(--cyber-blue);">0</span>
                </div>
            </div>
        `;

        this.setupLivePatchEventListeners();
        this.updatePatchUI();
    }

    /**
     * Build default selections for enterprise config
     * @returns {Object}
     */
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

    /**
     * Render enterprise architecture certification simulation
     * @param {HTMLElement} container
     */
    renderEnterpriseArchitectureSimulationPuzzle(container) {
        const opts = this.puzzleData.configurationOptions || {};
        const policy = opts.passwordPolicy?.options || [];
        const storage = opts.passwordStorage?.options || [];
        const auth = opts.authenticationControls?.options || [];
        const login = opts.loginProtection?.options || [];
        const monitor = opts.monitoringResponse?.options || [];

        const select = (id, values, current) => `
            <select id="${id}">
                ${values.map(v => {
                    const val = typeof v === 'string' ? v : v.id;
                    const label = typeof v === 'string' ? v : v.label;
                    return `<option value="${val}" ${String(val) === String(current) ? 'selected' : ''}>${label}</option>`;
                }).join('')}
            </select>
        `;

        const policyMarkup = policy.map(p => `
            <div class="guess-feedback" style="text-align:left; margin-top:6px;">
                <div><strong>${p.label}</strong></div>
                ${select(`ea-${p.id}`, p.values || [], this.enterpriseConfig[p.id])}
            </div>
        `).join('');

        container.innerHTML = `
            <div class="password-puzzle">
                <h2 class="puzzle-title">ENTERPRISE ARCHITECT CERTIFICATION</h2>
                <div class="password-brief">
                    <div><strong>OBJECTIVE:</strong> ${this.mission.objective || ''}</div>
                    <div><strong>SCENARIO:</strong> ${this.mission.scenario || ''}</div>
                    <div><strong>TASK:</strong> ${this.mission.userTask || ''}</div>
                </div>
                <div class="password-hints">
                    <strong style="color: var(--cyber-blue);">Phase 1: System Design</strong>
                    ${policyMarkup}
                    <div class="guess-feedback" style="text-align:left; margin-top:6px;">
                        <div><strong>Password Storage</strong></div>
                        ${select('ea-password_storage', storage, this.enterpriseConfig.password_storage)}
                    </div>
                    <div class="guess-feedback" style="text-align:left; margin-top:6px;">
                        <div><strong>Authentication Controls</strong></div>
                        ${select('ea-authentication_controls', auth, this.enterpriseConfig.authentication_controls)}
                    </div>
                    <div class="guess-feedback" style="text-align:left; margin-top:6px;">
                        <div><strong>Login Protection</strong></div>
                        ${select('ea-login_protection', login, this.enterpriseConfig.login_protection)}
                    </div>
                    <div class="guess-feedback" style="text-align:left; margin-top:6px;">
                        <div><strong>Monitoring & Response</strong></div>
                        ${select('ea-monitoring_response', monitor, this.enterpriseConfig.monitoring_response)}
                    </div>
                </div>
                <div class="puzzle-actions">
                    <button class="btn btn-primary" id="ea-run-assessment">RUN CERTIFICATION EVALUATION</button>
                </div>
                <div class="guess-feedback" id="guess-feedback" style="max-height:180px; overflow:auto; text-align:left;">
                    Configure architecture and run evaluation.
                </div>
                <div id="attempt-counter" style="text-align:center; margin-top:20px; color: var(--text-secondary);">
                    Certification run pending
                </div>
            </div>
        `;

        this.setupEnterpriseArchitectureEventListeners();
    }

    /**
     * Render level-1 multi-select mode (no typing required)
     * @param {HTMLElement} container
     */
    renderMultiSelectPuzzle(container) {
        const story = this.session?.storyHint || this.mission.scenario || '';
        const options = this.session?.options || [];
        const optionMarkup = options.map(opt => `
            <button class="password-option" data-option-id="${opt.id}" type="button">
                ${opt.value}
            </button>
        `).join('');

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
                        <div class="progress-bar">
                            <div class="progress-fill" id="risk-fill" style="width: 0%;"></div>
                        </div>
                    </div>
                ` : ''}
                <div class="password-hints" id="password-hints">
                    <strong style="color: var(--cyber-blue);">INVESTIGATIVE STORY HINT:</strong>
                    <div class="hint">→ ${story}</div>
                </div>
                <div class="password-options-grid" id="password-options-grid">
                    ${optionMarkup}
                </div>
                <div class="guess-feedback" id="guess-feedback">
                    Select suspected weak passwords, then submit your classification.
                </div>
                <div class="puzzle-actions">
                    <button class="btn btn-primary" id="submit-selection">SUBMIT ANALYSIS</button>
                    <button class="btn" id="clear-selection">CLEAR SELECTION</button>
                </div>
                <div id="attempt-counter" style="text-align: center; margin-top: 20px; color: var(--text-secondary);">
                    Submissions: <span style="color: var(--cyber-blue);">${this.attempts}</span> / ${this.maxAttempts}
                </div>
            </div>
        `;

        this.setupMultiSelectEventListeners();
        this.updateRiskDisplay();
    }

    /**
     * Create password input fields
     * @returns {string} HTML for input fields
     */
    createInputs() {
        let html = '';
        for (let i = 0; i < this.password.length; i++) {
            html += `<input 
                type="text" 
                class="char-input" 
                maxlength="1" 
                data-index="${i}"
                autocomplete="off"
                spellcheck="false"
            >`;
        }
        return html;
    }

    /**
     * Render SOC mission context block
     * @returns {string}
     */
    renderMissionBrief() {
        if (!this.mission || !this.mission.scenario) return '';
        const scenarioText = this.dynamicScenario || this.mission.scenario;
        const taskText = this.dynamicUserTask || this.mission.userTask || 'Identify and validate the credential.';

        return `
            <div class="password-brief">
                <div><strong>OBJECTIVE:</strong> ${this.mission.objective || 'Complete credential analysis.'}</div>
                <div><strong>SCENARIO:</strong> ${scenarioText}</div>
                <div><strong>TASK:</strong> ${taskText}</div>
            </div>
        `;
    }

    /**
     * Render visualizer markup based on profile
     * @returns {string}
     */
    renderVisualizerMarkup() {
        switch (this.visualProfile) {
            case 'vault-crack':
                return `
                    <div class="viz-stage">
                        <div class="viz-vault" id="viz-vault"></div>
                        <div class="viz-metric">Vault Integrity: <span id="viz-vault-integrity">100%</span></div>
                    </div>
                `;
            case 'entropy-shield':
                return `
                    <div class="viz-stage">
                        <div class="viz-shield" id="viz-shield"></div>
                        <div class="viz-metric">Entropy Index: <span id="viz-entropy-index">LOW</span></div>
                    </div>
                `;
            case 'plaintext-hash-morph':
                return `
                    <div class="viz-stage">
                        <div class="viz-morph">
                            <div class="viz-plain" id="viz-plain">PLAINTEXT</div>
                            <div class="viz-arrow">→</div>
                            <div class="viz-hash" id="viz-hash">HASHED</div>
                        </div>
                    </div>
                `;
            case 'hash-strength-blocks':
                return `
                    <div class="viz-stage">
                        <div class="viz-hash-grid">
                            <div class="viz-hash-block weak" id="viz-weak-hash">WEAK</div>
                            <div class="viz-hash-block strong" id="viz-strong-hash">STRONG</div>
                        </div>
                    </div>
                `;
            case 'salt-divergence':
                return `
                    <div class="viz-stage">
                        <div class="viz-salt-pair">
                            <div class="viz-hash-shape" id="viz-hash-a">HASH-A</div>
                            <div class="viz-hash-shape" id="viz-hash-b">HASH-B</div>
                        </div>
                    </div>
                `;
            case 'soc-control-room':
                return `
                    <div class="viz-stage soc-room" id="viz-soc-room">
                        <div class="viz-log-panel">AUTH: Burst from geo-variant sources</div>
                        <div class="viz-log-panel">IAM: Repeated account probe pattern</div>
                        <div class="viz-log-panel">SIEM: Correlated brute-force signal</div>
                    </div>
                `;
            case 'enterprise-architecture':
                return `
                    <div class="viz-stage">
                        <div class="viz-enterprise-controls" id="viz-enterprise-controls">
                            <label>Length
                                <select id="ctrl-length">
                                    <option value="strong">12+</option>
                                    <option value="medium">10-11</option>
                                    <option value="weak">8-9</option>
                                </select>
                            </label>
                            <label>Complexity
                                <select id="ctrl-complexity">
                                    <option value="strong">Upper/Lower/Number</option>
                                    <option value="medium">Upper+Number</option>
                                    <option value="weak">Basic pattern</option>
                                </select>
                            </label>
                            <label>Hashing
                                <select id="ctrl-hash">
                                    <option value="strong">Argon2id</option>
                                    <option value="medium">bcrypt</option>
                                    <option value="weak">Legacy hash</option>
                                </select>
                            </label>
                            <label>Salting
                                <select id="ctrl-salt">
                                    <option value="strong">Per-user unique</option>
                                    <option value="medium">Static salt</option>
                                    <option value="weak">No salt</option>
                                </select>
                            </label>
                            <label>Rate Limit
                                <select id="ctrl-rate">
                                    <option value="strong">5 attempts / lockout</option>
                                    <option value="medium">10 attempts</option>
                                    <option value="weak">No throttling</option>
                                </select>
                            </label>
                            <label>MFA
                                <select id="ctrl-mfa">
                                    <option value="strong">Required</option>
                                    <option value="medium">Optional</option>
                                    <option value="weak">Disabled</option>
                                </select>
                            </label>
                        </div>
                        <div class="viz-enterprise-stack" id="viz-enterprise-stack">
                            <div class="viz-layer">Length Policy</div>
                            <div class="viz-layer">Complexity Rules</div>
                            <div class="viz-layer">Hashing Method</div>
                            <div class="viz-layer">Salting</div>
                            <div class="viz-layer">Rate Limiting</div>
                            <div class="viz-layer">MFA</div>
                        </div>
                        <div class="viz-metric">Security Rating: <span id="viz-security-rating">C</span></div>
                    </div>
                `;
            default:
                return `
                    <div class="viz-stage">
                        <div class="viz-neutral">Security posture simulation active</div>
                    </div>
                `;
        }
    }

    /**
     * Initialize visualizer references
     */
    setupVisualizer() {
        this.visualizerElement = document.getElementById('security-visualizer');
        if (!this.visualizerElement) return;
        if (this.visualProfile === 'enterprise-architecture') {
            this.setupEnterpriseControls();
        }
        this.updateVisualizerState();
    }

    /**
     * Setup enterprise control listeners for level 10
     */
    setupEnterpriseControls() {
        const controlIds = ['ctrl-length', 'ctrl-complexity', 'ctrl-hash', 'ctrl-salt', 'ctrl-rate', 'ctrl-mfa'];
        controlIds.forEach((id) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => this.updateVisualizerState());
            }
        });
    }

    /**
     * Calculate enterprise security rating from selected controls
     * @returns {string}
     */
    calculateEnterpriseRating() {
        const controlIds = ['ctrl-length', 'ctrl-complexity', 'ctrl-hash', 'ctrl-salt', 'ctrl-rate', 'ctrl-mfa'];
        const valueScore = { strong: 3, medium: 2, weak: 1 };

        let score = 0;
        let count = 0;

        controlIds.forEach((id) => {
            const element = document.getElementById(id);
            if (!element) return;
            score += valueScore[element.value] || 1;
            count++;
        });

        const average = count ? (score / count) : 1;
        if (average >= 2.85) return 'A+';
        if (average >= 2.5) return 'A';
        if (average >= 2.0) return 'B';
        return 'C';
    }

    /**
     * Build enterprise audit summary for notifications
     * @returns {string}
     */
    buildEnterpriseSummary() {
        const rating = this.calculateEnterpriseRating();
        const detail = this.ratingBands && this.ratingBands[rating]
            ? this.ratingBands[rating]
            : 'Control baseline evaluated.';
        return `Security Rating ${rating}. ${detail}`;
    }

    /**
     * Update visualizer state using attempts/hints
     */
    updateVisualizerState() {
        if (!this.visualizerElement) return;

        const risk = Math.min(1, (this.attempts / this.maxAttempts) + (this.hintsShown / Math.max(this.hints.length, 1)) * 0.25);
        this.visualizerElement.style.setProperty('--viz-risk', String(risk.toFixed(2)));

        if (this.visualProfile === 'vault-crack') {
            const integrity = document.getElementById('viz-vault-integrity');
            if (integrity) integrity.textContent = `${Math.max(0, Math.floor((1 - risk) * 100))}%`;
        }

        if (this.visualProfile === 'entropy-shield') {
            const entropy = document.getElementById('viz-entropy-index');
            if (entropy) {
                entropy.textContent = risk < 0.35 ? 'HIGH' : risk < 0.7 ? 'MEDIUM' : 'LOW';
            }
        }

        if (this.visualProfile === 'enterprise-architecture') {
            const rating = document.getElementById('viz-security-rating');
            if (rating) {
                const grade = this.calculateEnterpriseRating();
                rating.textContent = grade;
                rating.style.color = grade === 'A+' || grade === 'A' ? 'var(--cyber-green)' : grade === 'B' ? 'var(--cyber-blue)' : 'var(--cyber-orange)';
            }
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        if (this.interactionMode === 'multiSelect' || this.interactionMode === 'singleChoice' || this.interactionMode === 'predictionChoice' || this.interactionMode === 'investigation' || this.interactionMode === 'inspection' || this.interactionMode === 'strategyBuilder' || this.interactionMode === 'liveDefenseSimulation' || this.interactionMode === 'multiStageDefenseSimulation' || this.interactionMode === 'threatHuntSimulation' || this.interactionMode === 'livePatchSimulation' || this.interactionMode === 'enterpriseArchitectureSimulation') return;

        // Get input elements
        this.inputs = Array.from(document.querySelectorAll('.char-input'));

        // Submit button
        const submitBtn = document.getElementById('submit-password');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.checkPassword());
        }

        // Clear button
        const clearBtn = document.getElementById('clear-password');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearInputs());
        }

        // Input handling
        this.inputs.forEach((input, index) => {
            // Auto-advance on input
            input.addEventListener('input', (e) => {
                const value = e.target.value.toUpperCase();
                e.target.value = value;

                if (value && index < this.inputs.length - 1) {
                    this.inputs[index + 1].focus();
                }

                this.audio.playTyping();
                this.updateDisplay();
            });

            // Backspace handling
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && !e.target.value && index > 0) {
                    this.inputs[index - 1].focus();
                    this.inputs[index - 1].select();
                }

                // Enter to submit
                if (e.key === 'Enter') {
                    this.checkPassword();
                }
            });

            // Prevent non-alphanumeric input
            input.addEventListener('keypress', (e) => {
                const char = e.key;
                if (!/[a-zA-Z0-9]/.test(char)) {
                    e.preventDefault();
                }
            });

            // Handle paste
            input.addEventListener('paste', (e) => {
                e.preventDefault();
                const pastedText = e.clipboardData.getData('text').toUpperCase();
                this.fillInputs(pastedText, index);
            });
        });

        // Focus first input
        if (this.inputs[0]) {
            this.inputs[0].focus();
        }
    }

    /**
     * Setup click/toggle flow for multi-select level mode
     */
    setupMultiSelectEventListeners() {
        const optionButtons = Array.from(document.querySelectorAll('.password-option'));
        optionButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.optionId, 10);
                if (Number.isNaN(id)) return;
                if (this.selectedOptions.has(id)) {
                    this.selectedOptions.delete(id);
                    btn.classList.remove('selected');
                } else {
                    this.selectedOptions.add(id);
                    btn.classList.add('selected');
                }
                this.audio.playButtonClick();
            });
        });

        const submitBtn = document.getElementById('submit-selection');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.submitMultiSelectSelection());
        }

        const clearBtn = document.getElementById('clear-selection');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearMultiSelectSelection());
        }
    }

    /**
     * Setup listeners for single-choice attack decision mode
     */
    setupSingleChoiceEventListeners() {
        const radios = Array.from(document.querySelectorAll('input[name="attack-choice"]'));
        radios.forEach(radio => {
            radio.addEventListener('change', () => {
                this.singleChoiceSelected = radio.value;
                this.audio.playButtonClick();
            });
        });

        const submitBtn = document.getElementById('submit-single-choice');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.submitSingleChoiceDecision());
        }
    }

    /**
     * Start timers/log stream for single-choice mode
     */
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
                if (this.isComplete) return;
                this.appendNextLogEntry();
            }, tickMs);
        }

        this.singleChoiceTimerId = setInterval(() => {
            if (this.isComplete) return;

            this.singleChoiceRemaining = Math.max(0, this.singleChoiceRemaining - 1);
            this.vaultIntegrity = Math.max(this.vaultConfig?.min || 0, this.vaultIntegrity - passiveDrop);
            this.updateSingleChoiceTimerUI();
            this.updateVaultIntegrityUI();

            if (this.vaultIntegrity <= (this.vaultConfig?.min || 0)) {
                this.onSingleChoiceFailure(this.vaultConfig?.breachMessage || 'Breach simulation: Vault Integrity reached 0.');
                return;
            }

            if (this.singleChoiceRemaining <= 0) {
                const timeoutMessage = this.puzzleData.breachOnTimeout
                    ? (this.vaultConfig?.breachMessage || 'Breach simulation: time ran out.')
                    : (this.mission.failureFeedback || 'Time is up.');
                this.onSingleChoiceFailure(timeoutMessage);
            }
        }, 1000);
    }

    /**
     * Append next log line to stream panel
     */
    appendNextLogEntry() {
        const stream = this.puzzleData.loginAttemptStream || {};
        const entries = Array.isArray(stream.entries) ? stream.entries : [];
        const panel = document.getElementById('attack-log-stream');
        if (!panel || entries.length === 0) return;

        if (panel.textContent.includes('Waiting for incoming login attempts...')) {
            panel.innerHTML = '';
        }

        const line = document.createElement('div');
        line.textContent = entries[this.logEntryIndex % entries.length];
        panel.appendChild(line);
        panel.scrollTop = panel.scrollHeight;
        this.logEntryIndex++;
    }

    /**
     * Handle single-choice submission
     */
    submitSingleChoiceDecision() {
        if (this.isComplete) return;
        if (!this.singleChoiceSelected) {
            this.gameScreen.ui.showNotification('Select one attack type first.', 'warning');
            return;
        }

        this.attempts++;
        this.updateAttemptCounter();
        this.gameScreen.updateAttempts(this.attempts);

        const correctChoice = this.puzzleData.correctChoice;
        if (this.singleChoiceSelected === correctChoice) {
            this.onSingleChoiceSuccess();
            return;
        }

        this.vaultIntegrity = Math.max(this.vaultConfig?.min || 0, this.vaultIntegrity - (this.vaultConfig?.wrongChoicePenalty || 0));
        this.updateVaultIntegrityUI();

        const feedback = document.getElementById('guess-feedback');
        if (feedback) {
            feedback.textContent = this.puzzleData.choiceFeedback?.wrong || 'Incorrect choice.';
        }

        if (this.vaultIntegrity <= (this.vaultConfig?.min || 0)) {
            this.onSingleChoiceFailure(this.vaultConfig?.breachMessage || 'Breach simulation: Vault Integrity reached 0.');
            return;
        }

        this.onSingleChoiceFailure(this.mission.failureFeedback || 'Wrong decision. The attack continued.');
    }

    /**
     * Handle single-choice success and shock event
     */
    onSingleChoiceSuccess() {
        this.isComplete = true;
        this.stopSingleChoiceTimers();
        this.audio.playSuccess();
        this.gameScreen.ui.flashScreen('rgba(0, 255, 65, 0.2)', 300);

        const feedback = document.getElementById('guess-feedback');
        if (feedback) {
            feedback.textContent = this.puzzleData.choiceFeedback?.correct || 'Correct choice.';
        }

        this.gameScreen.ui.showNotification('Attack blocked.', 'success');

        const shock = this.puzzleData.shockEvent || null;
        if (!shock || shock.trigger !== 'afterCorrect') {
            setTimeout(() => this.gameScreen.completePuzzle(true), 1000);
            return;
        }

        setTimeout(() => {
            if (feedback) {
                feedback.innerHTML = `<strong>${shock.title || 'Alert'}</strong><br>${shock.message || ''}`;
            }
            this.gameScreen.ui.showNotification(shock.title || 'Alert', 'warning');
            setTimeout(() => this.gameScreen.completePuzzle(true), 1600);
        }, shock.delayMs || 1000);
    }

    /**
     * Handle single-choice failure
     * @param {string} message
     */
    onSingleChoiceFailure(message) {
        if (this.isComplete) return;
        this.isComplete = true;
        this.stopSingleChoiceTimers();
        this.audio.playFailure();
        this.gameScreen.ui.flashScreen('rgba(255, 0, 110, 0.2)', 300);
        this.gameScreen.ui.showNotification(message || this.mission.failureFeedback || 'Mission failed.', 'error');
        setTimeout(() => this.gameScreen.completePuzzle(false), 1200);
    }

    /**
     * Stop active intervals for single-choice mode
     */
    stopSingleChoiceTimers() {
        if (this.singleChoiceTimerId) {
            clearInterval(this.singleChoiceTimerId);
            this.singleChoiceTimerId = null;
        }
        if (this.singleChoiceLogTimerId) {
            clearInterval(this.singleChoiceLogTimerId);
            this.singleChoiceLogTimerId = null;
        }
    }

    /**
     * Update timer label for single-choice mode
     */
    updateSingleChoiceTimerUI() {
        const timer = document.getElementById('single-timer-text');
        if (!timer) return;
        timer.textContent = `${Math.max(0, this.singleChoiceRemaining)}s`;
    }

    /**
     * Update vault integrity progress UI
     */
    updateVaultIntegrityUI() {
        const value = Math.max(this.vaultConfig?.min || 0, Math.min(100, this.vaultIntegrity));
        const fill = document.getElementById('vault-fill');
        const text = document.getElementById('vault-text');
        if (fill) fill.style.width = `${value}%`;
        if (text) text.textContent = `${Math.floor(value)}%`;
    }

    /**
     * Setup listeners for prediction-choice mode
     */
    setupPredictionChoiceEventListeners() {
        const radios = Array.from(document.querySelectorAll('input[name="prediction-choice"]'));
        radios.forEach(radio => {
            radio.addEventListener('change', () => {
                this.predictionSelected = radio.value;
                this.audio.playButtonClick();
            });
        });

        const submitBtn = document.getElementById('submit-prediction-choice');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.submitPredictionChoiceDecision());
        }
    }

    /**
     * Setup listeners for investigation mode
     */
    setupInvestigationEventListeners() {
        const causeRadios = Array.from(document.querySelectorAll('input[name="investigation-cause"]'));
        causeRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                this.investigationSelectedCause = radio.value;
                this.audio.playButtonClick();
            });
        });

        const defenseRadios = Array.from(document.querySelectorAll('input[name="investigation-defense"]'));
        defenseRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                this.investigationSelectedDefense = radio.value;
                this.audio.playButtonClick();
            });
        });

        const causeBtn = document.getElementById('submit-investigation-cause');
        if (causeBtn) {
            causeBtn.addEventListener('click', () => this.submitInvestigationCause());
        }

        const defenseBtn = document.getElementById('submit-investigation-defense');
        if (defenseBtn) {
            defenseBtn.addEventListener('click', () => this.submitInvestigationDefense());
        }
    }

    /**
     * Setup listeners for inspection mode
     */
    setupInspectionEventListeners() {
        const actionButtons = Array.from(document.querySelectorAll('button[data-action]'));
        actionButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                const systemId = btn.dataset.systemId;
                if (!action || !systemId) return;
                if (action === 'view-db') this.viewInspectionDatabase(systemId);
                if (action === 'simulate-breach') this.simulateInspectionBreach(systemId);
                this.audio.playButtonClick();
            });
        });

        const radios = Array.from(document.querySelectorAll('input[name="inspection-choice"]'));
        radios.forEach(radio => {
            radio.addEventListener('change', () => {
                this.inspectionSelectedSystem = radio.value;
                this.audio.playButtonClick();
            });
        });

        const submitBtn = document.getElementById('submit-inspection-choice');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.submitInspectionChoice());
        }
    }

    /**
     * Setup listeners for strategy builder mode
     */
    setupStrategyBuilderEventListeners() {
        const defenseButtons = Array.from(document.querySelectorAll('button[data-defense-id]'));
        defenseButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const defenseId = btn.dataset.defenseId;
                if (!defenseId) return;
                this.toggleStrategyDefense(defenseId, btn);
            });
        });

        const runBtn = document.getElementById('run-strategy-simulation');
        if (runBtn) {
            runBtn.addEventListener('click', () => this.submitStrategyBuilderDecision());
        }

        const clearBtn = document.getElementById('clear-strategy-selection');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearStrategySelection());
        }
    }

    /**
     * Setup listeners for live defense simulation
     */
    setupLiveDefenseEventListeners() {
        const defenseButtons = Array.from(document.querySelectorAll('button[data-live-defense]'));
        defenseButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const defenseName = btn.dataset.liveDefense;
                if (!defenseName) return;
                this.activateLiveDefense(defenseName);
            });
        });
    }

    /**
     * Start live simulation loops
     */
    startLiveDefenseSimulation() {
        const simConfig = this.puzzleData.simulationConfig || {};
        const regen = simConfig.energyRegenRate || {};
        const regenAmount = Number(regen.amount || 5);
        const regenEvery = Math.max(1, Number(regen.everySeconds || 3));

        this.updateLiveSimulationUI();
        this.appendLiveLog('Live simulation started. Incoming waves expected.');

        this.liveEnergyTimerId = setInterval(() => {
            if (this.isComplete) return;
            this.liveEnergy = Math.min(100, this.liveEnergy + regenAmount);
            this.updateLiveSimulationUI();
        }, regenEvery * 1000);

        this.liveCooldownTimerId = setInterval(() => {
            if (this.isComplete) return;
            const names = Object.keys(this.liveDefenseCooldowns);
            names.forEach(name => {
                const next = Math.max(0, Number(this.liveDefenseCooldowns[name] || 0) - 1);
                this.liveDefenseCooldowns[name] = next;
            });
            this.updateLiveDefenseButtons();
        }, 1000);

        this.liveDurationTimerId = setInterval(() => {
            if (this.isComplete) return;
            this.liveRemainingTime = Math.max(0, this.liveRemainingTime - 1);
            this.updateLiveSimulationUI();
            if (this.liveRemainingTime <= 0) {
                this.finishLiveDefenseSimulation(this.liveVaultHealth > 0);
            }
        }, 1000);

        this.scheduleNextLiveAttack();
    }

    /**
     * Stop all live simulation timers
     */
    stopLiveDefenseSimulation() {
        if (this.liveAttackTimeoutId) {
            clearTimeout(this.liveAttackTimeoutId);
            this.liveAttackTimeoutId = null;
        }
        if (this.liveSpawnTimeoutId) {
            clearTimeout(this.liveSpawnTimeoutId);
            this.liveSpawnTimeoutId = null;
        }
        if (this.liveEnergyTimerId) {
            clearInterval(this.liveEnergyTimerId);
            this.liveEnergyTimerId = null;
        }
        if (this.liveDurationTimerId) {
            clearInterval(this.liveDurationTimerId);
            this.liveDurationTimerId = null;
        }
        if (this.liveCooldownTimerId) {
            clearInterval(this.liveCooldownTimerId);
            this.liveCooldownTimerId = null;
        }
    }

    /**
     * Spawn attack on randomized interval
     */
    scheduleNextLiveAttack() {
        if (this.isComplete) return;
        const simConfig = this.puzzleData.simulationConfig || {};
        const spawn = simConfig.attackSpawnRate || {};
        const minSeconds = Math.max(1, Number(spawn.minSeconds || 2));
        const maxSeconds = Math.max(minSeconds, Number(spawn.maxSeconds || 4));
        const delayMs = Math.floor((minSeconds + (Math.random() * (maxSeconds - minSeconds))) * 1000);

        this.liveSpawnTimeoutId = setTimeout(() => {
            if (this.isComplete) return;
            this.spawnLiveAttack();
            this.scheduleNextLiveAttack();
        }, delayMs);
    }

    /**
     * Create one incoming attack instance
     */
    spawnLiveAttack() {
        if (this.liveActiveAttack) {
            this.resolveLiveAttackMissed(this.liveActiveAttack);
        }
        const attacks = Array.isArray(this.puzzleData.attackTypes) ? this.puzzleData.attackTypes : [];
        if (!attacks.length) return;
        const attack = attacks[Math.floor(Math.random() * attacks.length)];
        this.liveActiveAttack = attack;
        const panel = document.getElementById('live-current-attack');
        if (panel) {
            panel.innerHTML = `<strong>${attack.type}</strong> incoming. Potential damage: ${attack.damage}.`;
        }
        this.appendLiveLog(`Wave detected: ${attack.type}`);

        this.liveAttackTimeoutId = setTimeout(() => {
            if (this.isComplete) return;
            if (!this.liveActiveAttack) return;
            this.resolveLiveAttackMissed(this.liveActiveAttack);
            this.liveActiveAttack = null;
            this.updateLiveSimulationUI();
        }, 2200);
    }

    /**
     * Activate chosen defense
     * @param {string} defenseName
     */
    activateLiveDefense(defenseName) {
        if (this.isComplete) return;
        const defenses = Array.isArray(this.puzzleData.defenses) ? this.puzzleData.defenses : [];
        const defense = defenses.find(item => item.name === defenseName);
        if (!defense) return;

        const cooldownLeft = Number(this.liveDefenseCooldowns[defenseName] || 0);
        if (cooldownLeft > 0) {
            this.gameScreen.ui.showNotification(`${defenseName} cooling down (${cooldownLeft}s).`, 'warning');
            return;
        }

        const cost = Number(defense.energyCost || 0);
        if (this.liveEnergy < cost) {
            this.gameScreen.ui.showNotification('Not enough energy for that defense.', 'warning');
            return;
        }

        this.liveEnergy = Math.max(0, this.liveEnergy - cost);
        this.liveDefenseCooldowns[defenseName] = Number(defense.cooldown || 0);
        this.updateLiveSimulationUI();
        this.updateLiveDefenseButtons();
        this.audio.playButtonClick();
        this.appendLiveLog(`Defense activated: ${defenseName}`);

        if (!this.liveActiveAttack) return;

        const attack = this.liveActiveAttack;
        const matched = Array.isArray(defense.protectsAgainst) && defense.protectsAgainst.includes(attack.type);
        const canCounter = Array.isArray(attack.counteredBy) && attack.counteredBy.includes(defense.name);

        if (matched || canCounter) {
            if (this.liveAttackTimeoutId) {
                clearTimeout(this.liveAttackTimeoutId);
                this.liveAttackTimeoutId = null;
            }
            this.liveActiveAttack = null;
            const panel = document.getElementById('live-current-attack');
            if (panel) {
                panel.innerHTML = `${attack.type} blocked by ${defense.name}.`;
            }
            this.appendLiveLog(`Blocked: ${attack.type} using ${defense.name}`);
            this.audio.playSuccess();
        } else {
            this.appendLiveLog(`${defense.name} did not stop ${attack.type}.`);
        }
    }

    /**
     * Resolve missed attack damage
     * @param {{type:string, damage:number}} attack
     */
    resolveLiveAttackMissed(attack) {
        const damage = Number(attack?.damage || 0);
        this.liveVaultHealth = Math.max(0, this.liveVaultHealth - damage);
        this.appendLiveLog(`Impact: ${attack.type} hit the vault (-${damage} health).`);
        const panel = document.getElementById('live-current-attack');
        if (panel) {
            panel.innerHTML = `${attack.type} was successful. Vault damaged by ${damage}.`;
        }
        this.audio.playFailure();
        this.updateLiveSimulationUI();
        if (this.liveVaultHealth <= 0) {
            this.finishLiveDefenseSimulation(false);
        }
    }

    /**
     * Update HUD values for live simulation
     */
    updateLiveSimulationUI() {
        const vault = Math.max(0, Math.min(100, this.liveVaultHealth));
        const energy = Math.max(0, Math.min(100, this.liveEnergy));
        const vaultText = document.getElementById('live-vault-text');
        const vaultFill = document.getElementById('live-vault-fill');
        const energyText = document.getElementById('live-energy-text');
        const energyFill = document.getElementById('live-energy-fill');
        const timeText = document.getElementById('live-time-text');
        if (vaultText) vaultText.textContent = `${Math.floor(vault)}%`;
        if (vaultFill) vaultFill.style.width = `${vault}%`;
        if (energyText) energyText.textContent = `${Math.floor(energy)}%`;
        if (energyFill) energyFill.style.width = `${energy}%`;
        if (timeText) timeText.textContent = `${Math.max(0, Math.floor(this.liveRemainingTime))}s`;
        this.updateLiveDefenseButtons();
    }

    /**
     * Update defense button disabled/cooldown text
     */
    updateLiveDefenseButtons() {
        const buttons = Array.from(document.querySelectorAll('button[data-live-defense]'));
        const defenses = Array.isArray(this.puzzleData.defenses) ? this.puzzleData.defenses : [];
        buttons.forEach(btn => {
            const defenseName = btn.dataset.liveDefense;
            const defense = defenses.find(item => item.name === defenseName);
            if (!defense) return;
            const cooldown = Number(this.liveDefenseCooldowns[defenseName] || 0);
            const affordable = this.liveEnergy >= Number(defense.energyCost || 0);
            btn.disabled = this.isComplete || cooldown > 0 || !affordable;
            const cd = document.getElementById(`live-cd-${this.sanitizeId(defenseName)}`);
            if (cd) {
                if (cooldown > 0) cd.textContent = `COOLDOWN: ${cooldown}s`;
                else if (!affordable) cd.textContent = 'LOW ENERGY';
                else cd.textContent = 'READY';
            }
        });
    }

    /**
     * Append event to live feed
     * @param {string} message
     */
    appendLiveLog(message) {
        const feedback = document.getElementById('guess-feedback');
        if (!feedback) return;
        const line = document.createElement('div');
        line.textContent = `• ${message}`;
        feedback.appendChild(line);
        feedback.scrollTop = feedback.scrollHeight;
    }

    /**
     * End simulation and finalize mission
     * @param {boolean} success
     */
    finishLiveDefenseSimulation(success) {
        if (this.isComplete) return;
        this.isComplete = true;
        this.stopLiveDefenseSimulation();
        const summary = this.puzzleData.educationalSummary || 'Security works best when multiple defenses protect the system. No single tool can stop every attack.';
        const feedback = document.getElementById('guess-feedback');
        if (feedback) {
            feedback.innerHTML += `<div style="margin-top:8px;"><strong>Summary:</strong> ${summary}</div>`;
        }
        if (success) {
            this.audio.playSuccess();
            this.gameScreen.ui.flashScreen('rgba(0, 255, 65, 0.2)', 300);
            this.gameScreen.ui.showNotification(this.mission.successFeedback || 'Defense simulation completed.', 'success');
            setTimeout(() => this.gameScreen.completePuzzle(true), 1200);
        } else {
            this.audio.playFailure();
            this.gameScreen.ui.flashScreen('rgba(255, 0, 110, 0.2)', 300);
            this.gameScreen.ui.showNotification(this.mission.failureFeedback || 'Vault health reached zero.', 'error');
            setTimeout(() => this.gameScreen.completePuzzle(false), 1200);
        }
    }

    /**
     * Setup listeners for multi-stage boss simulation
     */
    setupMultiStageDefenseEventListeners() {
        const defenseButtons = Array.from(document.querySelectorAll('button[data-multi-defense]'));
        defenseButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const defenseName = btn.dataset.multiDefense;
                if (!defenseName) return;
                this.activateMultiDefense(defenseName);
            });
        });
    }

    /**
     * Setup listeners for live patch simulation
     */
    setupLivePatchEventListeners() {
        const buttons = Array.from(document.querySelectorAll('button[data-patch-action]'));
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const actionId = btn.dataset.patchAction;
                if (!actionId) return;
                this.handlePatchAction(actionId);
            });
        });
    }

    /**
     * Setup listeners for enterprise architecture simulation
     */
    setupEnterpriseArchitectureEventListeners() {
        const map = [
            "minimum_length",
            "allow_passphrases",
            "require_complexity",
            "block_common_passwords",
            "password_storage",
            "authentication_controls",
            "login_protection",
            "monitoring_response"
        ];
        map.forEach(key => {
            const el = document.getElementById(`ea-${key}`);
            if (!el) return;
            el.addEventListener('change', () => {
                this.enterpriseConfig[key] = el.value;
                this.audio.playButtonClick();
            });
        });

        const btn = document.getElementById('ea-run-assessment');
        if (btn) {
            btn.addEventListener('click', () => this.runEnterpriseArchitectureAssessment());
        }
    }

    /**
     * Run full final certification evaluation
     */
    runEnterpriseArchitectureAssessment() {
        if (this.isComplete) return;
        this.attempts++;
        this.updateAttemptCounter();
        this.gameScreen.updateAttempts(this.attempts);

        const attacks = Array.isArray(this.puzzleData.attackSimulationMatrix) ? this.puzzleData.attackSimulationMatrix : [];
        this.enterpriseAttackResults = attacks.map(a => this.evaluateEnterpriseAttack(a));
        this.enterpriseScores = this.calculateEnterpriseScores(this.enterpriseAttackResults);
        this.enterpriseRating = this.calculateEnterpriseRatingFromScore(this.enterpriseScores.finalWeightedScore);
        this.enterpriseBadgeUnlocked = this.isEnterpriseBadgeUnlocked(this.enterpriseRating, this.enterpriseScores.finalWeightedScore);

        this.renderEnterpriseAssessmentFeedback();
        this.isComplete = true;
        this.audio.playSuccess();
        this.gameScreen.ui.flashScreen('rgba(0, 255, 65, 0.2)', 300);
        setTimeout(() => this.gameScreen.completePuzzle(true), 1500);
    }

    /**
     * Evaluate one attack result from current config
     * @param {Object} attack
     * @returns {{attackId:string,attackName:string,outcome:string}}
     */
    evaluateEnterpriseAttack(attack) {
        const cfg = this.enterpriseConfig;
        const chosen = [
            cfg.password_storage,
            cfg.authentication_controls,
            cfg.login_protection,
            cfg.monitoring_response,
            cfg.minimum_length,
            cfg.allow_passphrases,
            cfg.require_complexity,
            cfg.block_common_passwords
        ];
        const strong = (attack.strongCounters || []).filter(c => chosen.includes(c)).length;
        const partial = (attack.partialCounters || []).filter(c => chosen.includes(c)).length;
        let outcome = "Successful";
        if (strong >= 2) outcome = "Blocked";
        else if (strong >= 1 || partial >= 1) outcome = "Partially Mitigated";
        return {
            attackId: attack.attackId,
            attackName: attack.attackName,
            outcome
        };
    }

    /**
     * Compute weighted score dashboard
     * @param {Array} results
     * @returns {Object}
     */
    calculateEnterpriseScores(results) {
        const algo = this.puzzleData.scoringAlgorithm || {};
        const points = algo.attackOutcomePoints || {};
        const scoreMap = {
            "Blocked": Number(points.blocked || 100),
            "Partially Mitigated": Number(points.partially_mitigated || 65),
            "Successful": Number(points.successful || 25)
        };
        const avgAttack = results.length
            ? Math.round(results.reduce((s, r) => s + (scoreMap[r.outcome] || 0), 0) / results.length)
            : 0;

        const cfg = this.enterpriseConfig;
        const vaultSecurityScore = Math.max(0, Math.min(100, avgAttack + (cfg.password_storage === 'hash_salt_iteration' ? 8 : cfg.password_storage === 'hash_salt' ? 5 : 0)));
        const breachResistanceScore = Math.max(0, Math.min(100, avgAttack + (cfg.authentication_controls === 'hardware_key_mfa' ? 10 : cfg.authentication_controls === 'app_mfa' ? 6 : 0)));
        const userExperienceScore = Math.max(0, Math.min(100, 75 - (cfg.login_protection === 'adaptive_risk_login' ? 4 : 0) - (cfg.authentication_controls === 'hardware_key_mfa' ? 8 : 0) + (cfg.allow_passphrases === 'yes' ? 6 : -3)));
        const operationalStabilityScore = Math.max(0, Math.min(100, 78 - (cfg.monitoring_response === 'realtime_anomaly' ? 8 : cfg.monitoring_response === 'breach_alerts' ? 4 : 0) - (cfg.login_protection === 'adaptive_risk_login' ? 5 : 0)));
        const incidentResponseMaturity = Math.max(0, Math.min(100, (cfg.monitoring_response === 'realtime_anomaly' ? 90 : cfg.monitoring_response === 'breach_alerts' ? 78 : cfg.monitoring_response === 'basic_logging' ? 60 : 35)));

        const w = algo.weightedCategories || {};
        const weighted =
            vaultSecurityScore * Number(w.vaultSecurityScore?.weight || 0.3) +
            breachResistanceScore * Number(w.breachResistanceScore?.weight || 0.25) +
            userExperienceScore * Number(w.userExperienceScore?.weight || 0.15) +
            operationalStabilityScore * Number(w.operationalStabilityScore?.weight || 0.15) +
            incidentResponseMaturity * Number(w.incidentResponseMaturity?.weight || 0.15);

        return {
            vaultSecurityScore: Math.round(vaultSecurityScore),
            breachResistanceScore: Math.round(breachResistanceScore),
            userExperienceScore: Math.round(userExperienceScore),
            operationalStabilityScore: Math.round(operationalStabilityScore),
            incidentResponseMaturity: Math.round(incidentResponseMaturity),
            finalWeightedScore: Math.round(weighted)
        };
    }

    /**
     * Resolve final rating from score
     * @param {number} score
     * @returns {string}
     */
    calculateEnterpriseRatingFromScore(score) {
        const rules = this.puzzleData.scoringAlgorithm?.ratingRules || [];
        for (const rule of rules) {
            if (score >= Number(rule.minScore || 0)) return rule.rating;
        }
        return 'C';
    }

    /**
     * Badge unlock check
     * @param {string} rating
     * @param {number} score
     * @returns {boolean}
     */
    isEnterpriseBadgeUnlocked(rating, score) {
        const logic = this.puzzleData.certificationBadgeLogic?.unlockCondition || {};
        const minRating = logic.minimumRating || 'A';
        const minScore = Number(logic.minimumScore || 80);
        const order = { "C": 1, "B": 2, "A": 3, "A+": 4 };
        return (order[rating] || 0) >= (order[minRating] || 0) && score >= minScore;
    }

    /**
     * Print structured certification report
     */
    renderEnterpriseAssessmentFeedback() {
        const feedback = document.getElementById('guess-feedback');
        if (!feedback) return;
        const fg = this.puzzleData.feedbackGenerator || {};
        const mitigatedCount = this.enterpriseAttackResults.filter(r => r.outcome !== 'Successful').length;
        const totalThreats = this.enterpriseAttackResults.length;

        const areaPairs = [
            ["Vault Security", this.enterpriseScores.vaultSecurityScore],
            ["Breach Resistance", this.enterpriseScores.breachResistanceScore],
            ["User Experience", this.enterpriseScores.userExperienceScore],
            ["Operational Stability", this.enterpriseScores.operationalStabilityScore],
            ["Incident Response Maturity", this.enterpriseScores.incidentResponseMaturity]
        ];
        areaPairs.sort((a, b) => b[1] - a[1]);
        const strongestArea = areaPairs[0][0];
        const weakestArea = areaPairs[areaPairs.length - 1][0];
        const recommendation = weakestArea === "Incident Response Maturity"
            ? "Improve continuous monitoring to detect early attack signals."
            : weakestArea === "User Experience"
                ? "Reduce unnecessary friction while keeping strong controls."
                : "Strengthen layered controls in weaker architecture areas.";

        const summary = (fg.summaryTemplate || "You successfully mitigated [mitigatedCount] of [totalThreats] simulated threats.")
            .replace("[mitigatedCount]", String(mitigatedCount))
            .replace("[totalThreats]", String(totalThreats));

        const resultLines = this.enterpriseAttackResults.map(r => `<div>• ${r.attackName}: <strong>${r.outcome}</strong></div>`).join('');
        const badgeLine = this.enterpriseBadgeUnlocked
            ? `<div><strong>Badge Unlocked:</strong> ${this.puzzleData.certificationBadgeLogic?.badgeName || 'Certified Security Architect'}</div>`
            : `<div>${this.puzzleData.certificationBadgeLogic?.lockedMessage || ''}</div>`;

        feedback.innerHTML = `
            <div><strong>Phase 2: Controlled Attack Evaluation</strong></div>
            ${resultLines}
            <div style="margin-top:10px;"><strong>Phase 3: Performance Metrics</strong></div>
            <div>Vault Security Score: ${this.enterpriseScores.vaultSecurityScore}</div>
            <div>Breach Resistance Score: ${this.enterpriseScores.breachResistanceScore}</div>
            <div>User Experience Score: ${this.enterpriseScores.userExperienceScore}</div>
            <div>Operational Stability Score: ${this.enterpriseScores.operationalStabilityScore}</div>
            <div>Incident Response Maturity: ${this.enterpriseScores.incidentResponseMaturity}</div>
            <div style="margin-top:8px;"><strong>Final Rating:</strong> ${this.enterpriseRating} (${this.puzzleData.ratingBands?.[this.enterpriseRating] || ''})</div>
            <div><strong>Final Score:</strong> ${this.enterpriseScores.finalWeightedScore}/100</div>
            <div style="margin-top:8px;">${summary}</div>
            <div>${(fg.strongestAreaTemplate || "Strongest area: [strongestArea].").replace("[strongestArea]", strongestArea)}</div>
            <div>${(fg.weakestAreaTemplate || "Weakest area: [weakestArea].").replace("[weakestArea]", weakestArea)}</div>
            <div>${(fg.recommendationTemplate || "Recommended improvement: [recommendation].").replace("[recommendation]", recommendation)}</div>
            <div style="margin-top:8px;">${fg.humilityMessage || ''}</div>
            <div style="margin-top:8px;">${badgeLine}</div>
        `;
    }

    /**
     * Handle one patch lab action
     * @param {string} actionId
     */
    handlePatchAction(actionId) {
        if (this.isComplete) return;
        this.attempts++;
        this.updateAttemptCounter();
        this.gameScreen.updateAttempts(this.attempts);
        const option = (this.puzzleData.patchOptions || []).find(p => p.id === actionId);
        if (!option) return;

        if (actionId === 'patch_simulate_exploit') {
            this.simulatePatchExploit();
            this.evaluatePatchFailState();
            return;
        }

        this.patchAppliedActions.add(actionId);
        const effects = option.effects || {};
        this.patchMetrics.exploitSuccessRate += Number(effects.exploitSuccessRateDelta || 0);
        this.patchMetrics.serverLoad += Number(effects.serverLoadDelta || 0);
        this.patchMetrics.userExperienceScore += Number(effects.userExperienceScoreDelta || 0);

        const closes = Array.isArray(effects.closesVulnerabilities) ? effects.closesVulnerabilities : [];
        closes.forEach(id => this.patchClosedVulns.add(id));
        this.refreshPatchVulnerabilityCount();
        this.clampPatchMetrics();
        this.patchTurnsSincePatch = 0;

        if (!this.patchPrimaryFixed && (this.patchClosedVulns.has('vuln_timing_compare') || this.patchClosedVulns.has('vuln_session_reuse'))) {
            this.patchPrimaryFixed = true;
            this.revealSecondaryPatchVulnerability();
        }

        this.appendPatchLog(`Patch applied: ${option.action}.`);
        this.updatePatchUI();
        this.evaluatePatchWinState();
        this.evaluatePatchFailState();
    }

    /**
     * Simulate exploit against current patch state
     */
    simulatePatchExploit() {
        const logic = this.puzzleData.exploitSimulationLogic || {};
        const sim = logic.onSimulate || {};
        this.applyPatchDelayEscalation();

        const remaining = this.getPatchRemainingVulnerabilities();
        const fullyFixed = remaining.length === 0;
        const partiallyFixed = remaining.length > 0 && remaining.length < (this.puzzleData.vulnerabilities || []).filter(v => v.status !== 'hidden').length;

        if (fullyFixed) {
            this.patchMetrics.exploitSuccessRate = Number(sim.ifFullyPatched?.exploitSuccessRateSet ?? 0);
            this.patchMetrics.vaultHealth = Math.max(0, this.patchMetrics.vaultHealth - Number(sim.ifFullyPatched?.vaultHealthDrop || 0));
            this.appendPatchLog(sim.ifFullyPatched?.message || 'Exploit blocked. No active path detected.');
        } else if (partiallyFixed) {
            this.patchMetrics.exploitSuccessRate += Number(sim.ifPartiallyPatched?.exploitSuccessRateAdjustment || -8);
            this.patchMetrics.vaultHealth = Math.max(0, this.patchMetrics.vaultHealth - Number(sim.ifPartiallyPatched?.vaultHealthDrop || 6));
            this.appendPatchLog(sim.ifPartiallyPatched?.message || 'Exploit partially successful. Residual weakness still exploitable.');
        } else {
            this.patchMetrics.vaultHealth = Math.max(0, this.patchMetrics.vaultHealth - Number(sim.ifUnpatched?.vaultHealthDrop || 12));
            this.appendPatchLog(sim.ifUnpatched?.message || 'Exploit succeeded. Active vulnerability chain confirmed.');
        }

        this.patchTurnsSincePatch += 1;
        this.clampPatchMetrics();
        this.updatePatchUI();
        this.evaluatePatchWinState();
    }

    /**
     * Reveal hidden secondary flaw after primary fix
     */
    revealSecondaryPatchVulnerability() {
        const secondary = this.puzzleData.exploitSimulationLogic?.secondaryReveal || {};
        const vulnId = secondary.revealVulnerabilityId || 'vuln_static_api_token';
        if (this.patchSecondaryRevealed) return;
        const vulns = this.puzzleData.vulnerabilities || [];
        const target = vulns.find(v => v.id === vulnId);
        if (target) target.status = 'open';
        this.patchSecondaryRevealed = true;
        this.refreshPatchVulnerabilityCount();
        this.appendPatchLog(secondary.revealMessage || 'Secondary access path detected.');
        this.gameScreen.ui.showNotification(secondary.revealMessage || 'Secondary access path detected.', 'warning');
    }

    /**
     * Apply escalation when patch actions are delayed
     */
    applyPatchDelayEscalation() {
        const delayed = this.puzzleData.exploitSimulationLogic?.delayedEscalation || {};
        if (!delayed.enabled) return;
        if (this.patchTurnsSincePatch < Number(delayed.turnsWithoutPatchThreshold || 2)) return;
        this.patchMetrics.exploitSuccessRate += Number(delayed.exploitSuccessRateIncreasePerTrigger || 5);
        this.patchMetrics.vaultHealth -= Number(delayed.vaultHealthDropPerTrigger || 3);
        this.appendPatchLog(delayed.message || 'Threat pressure rising due to delayed remediation.');
    }

    /**
     * Get list of still-open vulnerabilities
     * @returns {Array}
     */
    getPatchRemainingVulnerabilities() {
        const vulns = Array.isArray(this.puzzleData.vulnerabilities) ? this.puzzleData.vulnerabilities : [];
        return vulns.filter(v => (v.status !== 'hidden') && !this.patchClosedVulns.has(v.id));
    }

    /**
     * Recount vulnerability metric
     */
    refreshPatchVulnerabilityCount() {
        this.patchMetrics.vulnerabilityCountRemaining = this.getPatchRemainingVulnerabilities().length;
    }

    /**
     * Clamp patch dashboard metrics
     */
    clampPatchMetrics() {
        const guard = this.puzzleData.exploitSimulationLogic?.metricGuards || {};
        const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
        this.patchMetrics.exploitSuccessRate = clamp(this.patchMetrics.exploitSuccessRate, Number(guard.exploitSuccessRateMin ?? 0), Number(guard.exploitSuccessRateMax ?? 100));
        this.patchMetrics.serverLoad = clamp(this.patchMetrics.serverLoad, Number(guard.serverLoadMin ?? 0), Number(guard.serverLoadMax ?? 100));
        this.patchMetrics.userExperienceScore = clamp(this.patchMetrics.userExperienceScore, Number(guard.userExperienceScoreMin ?? 0), Number(guard.userExperienceScoreMax ?? 100));
        this.patchMetrics.vaultHealth = clamp(this.patchMetrics.vaultHealth, Number(guard.vaultHealthMin ?? 0), Number(guard.vaultHealthMax ?? 100));
    }

    /**
     * Update live patch dashboard UI
     */
    updatePatchUI() {
        const setText = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.textContent = String(value);
        };
        setText('patch-vault', `${Math.floor(this.patchMetrics.vaultHealth)}%`);
        setText('patch-exploit', `${Math.floor(this.patchMetrics.exploitSuccessRate)}%`);
        setText('patch-load', `${Math.floor(this.patchMetrics.serverLoad)}%`);
        setText('patch-ux', `${Math.floor(this.patchMetrics.userExperienceScore)}%`);
        setText('patch-vuln', `${this.patchMetrics.vulnerabilityCountRemaining}`);
        const fill = document.getElementById('patch-vault-fill');
        if (fill) fill.style.width = `${Math.max(0, Math.min(100, this.patchMetrics.vaultHealth))}%`;
    }

    /**
     * Log patch-lab feedback lines
     * @param {string} message
     */
    appendPatchLog(message) {
        const feedback = document.getElementById('guess-feedback');
        if (!feedback) return;
        const line = document.createElement('div');
        line.textContent = `• ${message}`;
        feedback.appendChild(line);
        feedback.scrollTop = feedback.scrollHeight;
    }

    /**
     * Evaluate patch lab win condition
     */
    evaluatePatchWinState() {
        if (this.isComplete) return;
        const all = this.puzzleData.winCondition?.all || [];
        if (!all.length) return;
        const pass = all.every(rule => this.evaluatePatchRule(rule));
        if (!pass) return;
        this.finishPatchLab(true);
    }

    /**
     * Evaluate patch lab fail condition
     */
    evaluatePatchFailState() {
        if (this.isComplete) return;
        const any = this.puzzleData.failCondition?.any || [];
        const failed = any.some(rule => this.evaluatePatchRule(rule));
        if (!failed) return;
        this.finishPatchLab(false);
    }

    /**
     * Evaluate one metric rule for patch lab
     * @param {{metric:string,operator:string,value:number}} rule
     * @returns {boolean}
     */
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

    /**
     * Complete live patch mission
     * @param {boolean} success
     */
    finishPatchLab(success) {
        if (this.isComplete) return;
        this.isComplete = true;
        const summary = this.puzzleData.educationalSummary || '';
        const feedback = document.getElementById('guess-feedback');
        if (feedback) feedback.innerHTML += `<div style="margin-top:8px;"><strong>Summary:</strong> ${summary}</div>`;
        if (success) {
            this.audio.playSuccess();
            this.gameScreen.ui.flashScreen('rgba(0, 255, 65, 0.2)', 300);
            this.gameScreen.ui.showNotification(this.mission.successFeedback || 'Remediation successful.', 'success');
            setTimeout(() => this.gameScreen.completePuzzle(true), 1200);
        } else {
            this.audio.playFailure();
            this.gameScreen.ui.flashScreen('rgba(255, 0, 110, 0.2)', 300);
            this.gameScreen.ui.showNotification(this.mission.failureFeedback || 'Remediation failed.', 'error');
            setTimeout(() => this.gameScreen.completePuzzle(false), 1200);
        }
    }

    /**
     * Setup listeners for threat hunt simulation
     */
    setupThreatHuntEventListeners() {
        const actionButtons = Array.from(document.querySelectorAll('button[data-threat-action]'));
        actionButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const actionId = btn.dataset.threatAction;
                const eventId = btn.dataset.eventId;
                if (!actionId || !eventId) return;
                this.handleThreatAction(actionId, eventId);
            });
        });

        const finalizeBtn = document.getElementById('threat-finalize');
        if (finalizeBtn) {
            finalizeBtn.addEventListener('click', () => this.finalizeThreatHunt());
        }
    }

    /**
     * Handle one threat hunt action on an event
     * @param {string} actionId
     * @param {string} eventId
     */
    handleThreatAction(actionId, eventId) {
        if (this.isComplete) return;
        this.attempts++;
        this.updateAttemptCounter();
        this.gameScreen.updateAttempts(this.attempts);

        const event = this.getThreatEventById(eventId);
        if (!event) return;

        const chainEntry = this.getThreatChainEntryByEventId(eventId);
        const isMalicious = !!chainEntry;
        const rules = this.puzzleData.progressionLogic || {};
        const progressRules = rules.attackerProgressRules || {};
        const falseRules = rules.falsePositiveRules || {};
        const containment = rules.containmentEffects || {};

        const addFalsePositive = (dropIntegrity = Number(falseRules.systemIntegrityDropPerFalsePositive || 8)) => {
            this.threatFalsePositiveCount += Number(falseRules.incorrectFlagIncrease || 1);
            this.threatSystemIntegrity = Math.max(0, this.threatSystemIntegrity - dropIntegrity);
            this.appendThreatLog(rules.operationalFeedback?.falseAlert || "False alert logged. Operational efficiency reduced.");
        };

        const addAttackerProgress = () => {
            this.threatAttackerProgress += Number(progressRules.missedMaliciousEventIncrease || 1);
        };

        const markDetected = () => {
            if (!chainEntry) return;
            this.threatDetectedMajor.add(chainEntry.key);
            this.threatAttackerProgress = Math.max(0, this.threatAttackerProgress - Number(progressRules.correctMajorDetectionDecrease || 1));
        };

        if (actionId === 'mark_suspicious') {
            if (isMalicious) {
                markDetected();
                this.appendThreatLog("Suspicious privilege escalation detected.");
            } else {
                addFalsePositive();
            }
        }

        if (actionId === 'investigate') {
            this.threatInvestigatedEvents.add(eventId);
            if (isMalicious) {
                markDetected();
                this.appendThreatLog(this.getThreatInvestigationMessage(chainEntry));
            } else {
                this.appendThreatLog(`Investigation complete for ${eventId}. No malicious chain evidence found.`);
            }
        }

        if (actionId === 'isolate_account') {
            const canStop = isMalicious && (containment.isolateAccountStops || []).includes(chainEntry.key);
            if (canStop) {
                markDetected();
                this.threatContainedMajor.add(chainEntry.key);
                if (chainEntry.key === 'lateral_movement') {
                    this.appendThreatLog(rules.operationalFeedback?.lateralMove || "Attacker lateral movement confirmed.");
                } else {
                    this.appendThreatLog(`Containment applied: account isolation stopped ${chainEntry.label}.`);
                }
            } else {
                addFalsePositive(Number(falseRules.systemIntegrityDropOnWrongContainment || 10));
            }
        }

        if (actionId === 'block_ip') {
            const canStop = isMalicious && (containment.blockIPStops || []).includes(chainEntry.key);
            if (canStop) {
                markDetected();
                this.threatContainedMajor.add(chainEntry.key);
                this.appendThreatLog(rules.operationalFeedback?.exportAlert || "Unauthorized data export attempt identified.");
            } else {
                addFalsePositive(Number(falseRules.systemIntegrityDropOnWrongContainment || 10));
            }
        }

        if (actionId === 'ignore') {
            if (isMalicious) {
                addAttackerProgress();
                this.appendThreatLog(`Ignored malicious signal (${eventId}). Attacker progression increased.`);
            } else {
                this.appendThreatLog(`Ignored ${eventId}. No immediate risk confirmed.`);
            }
        }

        this.applyThreatPassiveRisk();
        this.evaluateThreatCriticalEscalation();
        this.updateThreatHuntUI();
        this.evaluateThreatFailState();
    }

    /**
     * Lookup event by id in evidence panels
     * @param {string} eventId
     * @returns {Object|null}
     */
    getThreatEventById(eventId) {
        const panels = Array.isArray(this.puzzleData.evidencePanels) ? this.puzzleData.evidencePanels : [];
        for (const panel of panels) {
            const hit = (panel.entries || []).find(entry => entry.id === eventId);
            if (hit) return hit;
        }
        return null;
    }

    /**
     * Lookup hidden chain step by linked evidence id
     * @param {string} eventId
     * @returns {Object|null}
     */
    getThreatChainEntryByEventId(eventId) {
        const chain = Array.isArray(this.puzzleData.hiddenAttackChain) ? this.puzzleData.hiddenAttackChain : [];
        return chain.find(step => Array.isArray(step.linkedEvidence) && step.linkedEvidence.includes(eventId)) || null;
    }

    /**
     * Compose deep investigation message
     * @param {Object|null} chainEntry
     * @returns {string}
     */
    getThreatInvestigationMessage(chainEntry) {
        if (!chainEntry) return "Investigation did not confirm malicious behavior.";
        return `Investigate result: ${chainEntry.label}. ${chainEntry.explanation}`;
    }

    /**
     * Apply passive vault drain when attacker remains undetected
     */
    applyThreatPassiveRisk() {
        const passive = this.puzzleData.progressionLogic?.passiveRisk || {};
        if (!passive.enabledWhenUndetected) return;
        const cycle = Math.max(1, Number(passive.cycleTurns || 2));
        if (this.attempts % cycle !== 0) return;
        if (this.threatAttackerProgress <= 0) return;
        this.threatVaultHealth = Math.max(0, this.threatVaultHealth - Number(passive.vaultHealthDropPerCycle || 4));
    }

    /**
     * Increase vault damage when progress reaches critical threshold
     */
    evaluateThreatCriticalEscalation() {
        const progressRules = this.puzzleData.progressionLogic?.attackerProgressRules || {};
        const critical = Number(progressRules.criticalThreshold || 5);
        if (this.threatAttackerProgress < critical) return;
        this.threatVaultHealth = Math.max(0, this.threatVaultHealth - Number(progressRules.rapidVaultDrainOnCritical || 12));
        const msg = this.puzzleData.progressionLogic?.operationalFeedback?.criticalEscalation || "Warning: attacker progression has reached critical escalation level.";
        this.appendThreatLog(msg);
    }

    /**
     * Update threat hunt HUD
     */
    updateThreatHuntUI() {
        const vault = Math.max(0, Math.min(100, this.threatVaultHealth));
        const integrity = Math.max(0, Math.min(100, this.threatSystemIntegrity));
        const vaultText = document.getElementById('threat-vault-text');
        const vaultFill = document.getElementById('threat-vault-fill');
        const integrityText = document.getElementById('threat-integrity-text');
        const integrityFill = document.getElementById('threat-integrity-fill');
        const fpText = document.getElementById('threat-fp-text');
        const progressText = document.getElementById('threat-progress-text');
        if (vaultText) vaultText.textContent = `${Math.floor(vault)}%`;
        if (vaultFill) vaultFill.style.width = `${vault}%`;
        if (integrityText) integrityText.textContent = `${Math.floor(integrity)}%`;
        if (integrityFill) integrityFill.style.width = `${integrity}%`;
        if (fpText) fpText.textContent = `${this.threatFalsePositiveCount}`;
        if (progressText) progressText.textContent = `${this.threatAttackerProgress}`;
    }

    /**
     * Append line in threat hunt log feed
     * @param {string} message
     */
    appendThreatLog(message) {
        const feedback = document.getElementById('guess-feedback');
        if (!feedback) return;
        const line = document.createElement('div');
        line.textContent = `• ${message}`;
        feedback.appendChild(line);
        feedback.scrollTop = feedback.scrollHeight;
    }

    /**
     * Check fail conditions and end mission when reached
     */
    evaluateThreatFailState() {
        const fail = this.puzzleData.failCondition?.any || [];
        const maxEscalation = Number(this.puzzleData.progressionLogic?.attackerProgressRules?.maxEscalation || 7);
        const failed = fail.some(rule => {
            const metricValue = this.getThreatMetric(rule.metric, maxEscalation);
            if (rule.operator === '<=') return metricValue <= Number(rule.value);
            if (rule.operator === '<') return metricValue < Number(rule.value);
            if (rule.operator === '>=') return metricValue >= Number(rule.value);
            return false;
        });
        if (!failed) return;
        this.finishThreatHunt(false);
    }

    /**
     * Finalize hunt by checking win conditions
     */
    finalizeThreatHunt() {
        if (this.isComplete) return;
        this.evaluateThreatFailState();
        if (this.isComplete) return;
        const win = this.puzzleData.winCondition || {};
        const minContained = Number(win.majorMaliciousEventsContainedMin || 3);
        const vaultMin = Number(win.vaultHealthAbovePercent || 30);
        const maxEscalation = Number(this.puzzleData.progressionLogic?.attackerProgressRules?.maxEscalation || 7);
        const containOk = this.threatContainedMajor.size >= minContained;
        const vaultOk = this.threatVaultHealth > vaultMin;
        const progressOk = this.threatAttackerProgress < maxEscalation;
        this.finishThreatHunt(containOk && vaultOk && progressOk);
    }

    /**
     * Complete threat hunt mission with summary
     * @param {boolean} success
     */
    finishThreatHunt(success) {
        if (this.isComplete) return;
        this.isComplete = true;
        const summary = this.puzzleData.educationalSummary || {};
        const reveal = summary.reveal || '';
        const msg = summary.message || '';
        const feedback = document.getElementById('guess-feedback');
        if (feedback) {
            feedback.innerHTML += `
                <div style="margin-top:8px;"><strong>${reveal}</strong></div>
                <div>${msg}</div>
            `;
        }
        if (success) {
            this.audio.playSuccess();
            this.gameScreen.ui.flashScreen('rgba(0, 255, 65, 0.2)', 300);
            this.gameScreen.ui.showNotification(this.mission.successFeedback || 'Threat hunt complete.', 'success');
            setTimeout(() => this.gameScreen.completePuzzle(true), 1200);
        } else {
            this.audio.playFailure();
            this.gameScreen.ui.flashScreen('rgba(255, 0, 110, 0.2)', 300);
            this.gameScreen.ui.showNotification(this.mission.failureFeedback || 'Threat hunt failed.', 'error');
            setTimeout(() => this.gameScreen.completePuzzle(false), 1200);
        }
    }

    /**
     * Resolve metric values for fail checks
     * @param {string} metric
     * @param {number} maxEscalation
     * @returns {number}
     */
    getThreatMetric(metric, maxEscalation) {
        if (metric === 'vaultHealth') return this.threatVaultHealth;
        if (metric === 'systemIntegrity') return this.threatSystemIntegrity;
        if (metric === 'attackerProgress') return this.threatAttackerProgress;
        if (metric === 'maxEscalation') return maxEscalation;
        return 0;
    }

    /**
     * Start stage-based coordinated simulation
     */
    startMultiStageDefenseSimulation() {
        const base = this.puzzleData.baseStats || {};
        const regen = base.energyRegenRate || {};
        const regenAmount = Number(regen.amount || 3);
        const regenEvery = Math.max(1, Number(regen.everySeconds || 3));
        const stages = Array.isArray(this.puzzleData.stages) ? this.puzzleData.stages : [];
        this.multiStageIndex = 0;
        this.multiStageRemaining = Number(stages[0]?.duration || 20);
        this.updateMultiSimulationUI();
        this.appendMultiLog('APT campaign started.');
        this.enterCurrentMultiStage();

        this.multiEnergyTimerId = setInterval(() => {
            if (this.isComplete) return;
            this.multiEnergy = Math.min(100, this.multiEnergy + regenAmount);
            this.updateMultiSimulationUI();
        }, regenEvery * 1000);

        this.multiCooldownTimerId = setInterval(() => {
            if (this.isComplete) return;
            Object.keys(this.multiDefenseCooldowns).forEach(key => {
                this.multiDefenseCooldowns[key] = Math.max(0, Number(this.multiDefenseCooldowns[key] || 0) - 1);
            });
            this.updateMultiDefenseButtons();
        }, 1000);

        this.multiDurationTimerId = setInterval(() => {
            if (this.isComplete) return;
            this.multiRemainingTime = Math.max(0, this.multiRemainingTime - 1);
            this.updateMultiSimulationUI();
            if (this.multiRemainingTime <= 0) {
                this.finishMultiStageDefenseSimulation(this.multiVaultHealth > 0);
            }
        }, 1000);

        this.multiStageTimerId = setInterval(() => {
            if (this.isComplete) return;
            this.multiStageRemaining = Math.max(0, this.multiStageRemaining - 1);
            this.updateMultiSimulationUI();
            if (this.multiStageRemaining <= 0) {
                this.advanceMultiStage();
            }
        }, 1000);
    }

    /**
     * Enter current stage and schedule attacks
     */
    enterCurrentMultiStage() {
        const stage = this.getCurrentMultiStage();
        if (!stage) {
            this.finishMultiStageDefenseSimulation(this.multiVaultHealth > 0);
            return;
        }
        this.multiStageRemaining = Number(stage.duration || 20);
        const stageLabel = stage.stageLabel || `Stage ${this.multiStageIndex + 1}/4`;
        this.appendMultiLog(stageLabel);
        if (stage.bossWarning) {
            this.appendMultiLog(stage.bossWarning);
            this.gameScreen.ui.showNotification(stage.bossWarning, 'warning');
        }
        this.scheduleNextMultiAttack();
    }

    /**
     * Move to next stage and apply escalation outcomes
     */
    advanceMultiStage() {
        this.applyCurrentStageEscalationIfNeeded();
        this.multiStageIndex += 1;
        this.multiActiveAttacks = [];
        if (this.multiSpawnTimeoutId) {
            clearTimeout(this.multiSpawnTimeoutId);
            this.multiSpawnTimeoutId = null;
        }
        if (this.multiAttackResolveTimeoutId) {
            clearTimeout(this.multiAttackResolveTimeoutId);
            this.multiAttackResolveTimeoutId = null;
        }
        const stages = Array.isArray(this.puzzleData.stages) ? this.puzzleData.stages : [];
        if (this.multiStageIndex >= stages.length) {
            this.finishMultiStageDefenseSimulation(this.multiVaultHealth > 0);
            return;
        }
        this.enterCurrentMultiStage();
        this.updateMultiSimulationUI();
    }

    /**
     * Stop all multi-stage timers
     */
    stopMultiStageDefenseSimulation() {
        if (this.multiSpawnTimeoutId) clearTimeout(this.multiSpawnTimeoutId);
        if (this.multiAttackResolveTimeoutId) clearTimeout(this.multiAttackResolveTimeoutId);
        if (this.multiEnergyTimerId) clearInterval(this.multiEnergyTimerId);
        if (this.multiDurationTimerId) clearInterval(this.multiDurationTimerId);
        if (this.multiCooldownTimerId) clearInterval(this.multiCooldownTimerId);
        if (this.multiStageTimerId) clearInterval(this.multiStageTimerId);
        this.multiSpawnTimeoutId = null;
        this.multiAttackResolveTimeoutId = null;
        this.multiEnergyTimerId = null;
        this.multiDurationTimerId = null;
        this.multiCooldownTimerId = null;
        this.multiStageTimerId = null;
    }

    /**
     * Get active stage object
     * @returns {Object|null}
     */
    getCurrentMultiStage() {
        const stages = Array.isArray(this.puzzleData.stages) ? this.puzzleData.stages : [];
        return stages[this.multiStageIndex] || null;
    }

    /**
     * Schedule next attack for current stage
     */
    scheduleNextMultiAttack() {
        if (this.isComplete) return;
        const stage = this.getCurrentMultiStage();
        if (!stage) return;
        const spawn = stage.attackProfile?.spawnRate || { minSeconds: 2, maxSeconds: 4 };
        let minSeconds = Math.max(1, Number(spawn.minSeconds || 2));
        let maxSeconds = Math.max(minSeconds, Number(spawn.maxSeconds || 4));
        const modifier = stage.attackProfile?.conditionalSpawnModifier;
        if (modifier && modifier.ifFlag === 'compromisedAccounts' && Number(this.multiFlags.compromisedAccounts || 0) > 0) {
            const factor = Math.max(0.1, 1 - (Number(modifier.increaseFrequencyPercent || 0) / 100));
            minSeconds *= factor;
            maxSeconds *= factor;
        }
        const delayMs = Math.floor((minSeconds + Math.random() * (maxSeconds - minSeconds)) * 1000);
        this.multiSpawnTimeoutId = setTimeout(() => {
            if (this.isComplete) return;
            this.spawnMultiStageAttack();
            this.scheduleNextMultiAttack();
        }, delayMs);
    }

    /**
     * Spawn one or multiple attacks based on stage profile
     */
    spawnMultiStageAttack() {
        const stage = this.getCurrentMultiStage();
        if (!stage) return;
        const attackNames = Array.isArray(stage.attackProfile?.attackTypes) ? stage.attackProfile.attackTypes : [];
        if (!attackNames.length) return;
        this.resolveOutstandingMultiAttacks();

        const spawnAll = !!stage.attackProfile?.simultaneousWaves;
        const selected = spawnAll ? attackNames.slice() : [attackNames[Math.floor(Math.random() * attackNames.length)]];
        this.multiActiveAttacks = selected.map(name => this.buildMultiAttackState(name, stage));
        const label = this.multiActiveAttacks.map(a => `${a.type} (-${a.damage})`).join(', ');
        const panel = document.getElementById('multi-current-attacks');
        if (panel) panel.innerHTML = label;
        this.appendMultiLog(`Incoming: ${label}`);

        this.multiAttackResolveTimeoutId = setTimeout(() => {
            if (this.isComplete) return;
            this.resolveOutstandingMultiAttacks();
            this.multiActiveAttacks = [];
            this.updateMultiSimulationUI();
        }, 2200);
    }

    /**
     * Build attack object with stage modifiers
     * @param {string} attackType
     * @param {Object} stage
     * @returns {{type:string, damage:number, blocked:boolean}}
     */
    buildMultiAttackState(attackType, stage) {
        const baseDamage = Number(stage.attackProfile?.baseDamage?.[attackType] || 10);
        let damage = baseDamage;
        const modifier = stage.attackProfile?.conditionalDamageModifier;
        if (modifier && modifier.targetAttack === attackType) {
            if (modifier.ifFlag === 'elevatedAccess' && this.multiFlags.elevatedAccess) {
                if (modifier.increaseDamagePercent) damage = Math.round(damage * (1 + Number(modifier.increaseDamagePercent) / 100));
            }
            if (modifier.ifFlag === 'databaseStolen' && this.multiFlags.databaseStolen) {
                if (modifier.multiplyDamageBy) damage = Math.round(damage * Number(modifier.multiplyDamageBy));
            }
        }
        return { type: attackType, damage, blocked: false };
    }

    /**
     * Use defense module during multi-stage simulation
     * @param {string} defenseName
     */
    activateMultiDefense(defenseName) {
        if (this.isComplete) return;
        const modules = Array.isArray(this.puzzleData.defenseModules) ? this.puzzleData.defenseModules : [];
        const defense = modules.find(d => d.name === defenseName);
        if (!defense) return;
        const cooldown = Number(this.multiDefenseCooldowns[defenseName] || 0);
        if (cooldown > 0) {
            this.gameScreen.ui.showNotification(`${defenseName} cooling down (${cooldown}s).`, 'warning');
            return;
        }
        const cost = Number(defense.energyCost || 0);
        if (this.multiEnergy < cost) {
            this.gameScreen.ui.showNotification('Not enough energy for that defense.', 'warning');
            return;
        }
        this.multiEnergy = Math.max(0, this.multiEnergy - cost);
        this.multiDefenseCooldowns[defenseName] = Number(defense.cooldown || 0);
        this.audio.playButtonClick();
        this.appendMultiLog(`Defense: ${defenseName}`);
        this.multiActiveAttacks.forEach(attack => {
            if (attack.blocked) return;
            const match1 = Array.isArray(defense.protectsAgainst) && defense.protectsAgainst.includes(attack.type);
            const stage = this.getCurrentMultiStage();
            const counterList = Array.isArray(stage?.counteredBy?.[attack.type]) ? stage.counteredBy[attack.type] : [];
            const match2 = counterList.includes(defenseName);
            if (match1 || match2) {
                attack.blocked = true;
                this.appendMultiLog(`Blocked: ${attack.type}`);
                this.audio.playSuccess();
            }
        });
        this.updateMultiSimulationUI();
        this.updateMultiDefenseButtons();
    }

    /**
     * Apply damage for any unresolved attacks
     */
    resolveOutstandingMultiAttacks() {
        const stage = this.getCurrentMultiStage();
        if (!stage) return;
        let unresolved = 0;
        this.multiActiveAttacks.forEach(attack => {
            if (attack.blocked) return;
            unresolved += 1;
            this.multiVaultHealth = Math.max(0, this.multiVaultHealth - Number(attack.damage || 0));
            this.appendMultiLog(`Impact: ${attack.type} (-${attack.damage})`);
        });
        if (unresolved > 0) {
            const key = stage.id || `stage_${this.multiStageIndex + 1}`;
            this.multiUncounteredByStage[key] = Number(this.multiUncounteredByStage[key] || 0) + unresolved;
            this.audio.playFailure();
        }
        if (this.multiVaultHealth <= 0) {
            this.finishMultiStageDefenseSimulation(false);
        }
        this.updateMultiSimulationUI();
    }

    /**
     * Apply stage escalation flags based on misses
     */
    applyCurrentStageEscalationIfNeeded() {
        const stage = this.getCurrentMultiStage();
        if (!stage) return;
        const key = stage.id || `stage_${this.multiStageIndex + 1}`;
        const misses = Number(this.multiUncounteredByStage[key] || 0);
        const threshold = Number(stage.failureEffects?.onUncounteredThreshold || 9999);
        if (misses < threshold) return;
        const esc = stage.failureEffects?.escalation || {};
        if (esc.compromisedAccounts !== undefined) this.multiFlags.compromisedAccounts = Number(esc.compromisedAccounts);
        if (esc.elevatedAccess !== undefined) this.multiFlags.elevatedAccess = !!esc.elevatedAccess;
        if (esc.databaseStolen !== undefined) this.multiFlags.databaseStolen = !!esc.databaseStolen;
        if (esc.alertMessage) {
            this.appendMultiLog(esc.alertMessage);
            this.gameScreen.ui.showNotification(esc.alertMessage, 'warning');
        }
        this.updateMultiSimulationUI();
    }

    /**
     * Update HUD for multi-stage simulation
     */
    updateMultiSimulationUI() {
        const vault = Math.max(0, Math.min(100, this.multiVaultHealth));
        const energy = Math.max(0, Math.min(100, this.multiEnergy));
        const vaultText = document.getElementById('multi-vault-text');
        const vaultFill = document.getElementById('multi-vault-fill');
        const energyText = document.getElementById('multi-energy-text');
        const energyFill = document.getElementById('multi-energy-fill');
        const timeText = document.getElementById('multi-time-text');
        const stageLabel = document.getElementById('multi-stage-label');
        const stageTime = document.getElementById('multi-stage-time');
        if (vaultText) vaultText.textContent = `${Math.floor(vault)}%`;
        if (vaultFill) vaultFill.style.width = `${vault}%`;
        if (energyText) energyText.textContent = `${Math.floor(energy)}%`;
        if (energyFill) energyFill.style.width = `${energy}%`;
        if (timeText) timeText.textContent = `${Math.floor(Math.max(0, this.multiRemainingTime))}s`;
        const stage = this.getCurrentMultiStage();
        if (stageLabel) stageLabel.textContent = stage?.stageLabel || 'Stage Complete';
        if (stageTime) stageTime.textContent = `${Math.floor(Math.max(0, this.multiStageRemaining))}s`;
        this.updateMultiDefenseButtons();
    }

    /**
     * Update multi-stage defense button states
     */
    updateMultiDefenseButtons() {
        const buttons = Array.from(document.querySelectorAll('button[data-multi-defense]'));
        const modules = Array.isArray(this.puzzleData.defenseModules) ? this.puzzleData.defenseModules : [];
        buttons.forEach(btn => {
            const name = btn.dataset.multiDefense;
            const module = modules.find(m => m.name === name);
            if (!module) return;
            const cooldown = Number(this.multiDefenseCooldowns[name] || 0);
            const affordable = this.multiEnergy >= Number(module.energyCost || 0);
            btn.disabled = this.isComplete || cooldown > 0 || !affordable;
            const cd = document.getElementById(`multi-cd-${this.sanitizeId(name)}`);
            if (cd) {
                if (cooldown > 0) cd.textContent = `COOLDOWN: ${cooldown}s`;
                else if (!affordable) cd.textContent = 'LOW ENERGY';
                else cd.textContent = 'READY';
            }
        });
    }

    /**
     * Append log line for multi-stage simulation
     * @param {string} message
     */
    appendMultiLog(message) {
        const feedback = document.getElementById('guess-feedback');
        if (!feedback) return;
        const line = document.createElement('div');
        line.textContent = `• ${message}`;
        feedback.appendChild(line);
        feedback.scrollTop = feedback.scrollHeight;
    }

    /**
     * Finish multi-stage simulation
     * @param {boolean} success
     */
    finishMultiStageDefenseSimulation(success) {
        if (this.isComplete) return;
        this.isComplete = true;
        this.stopMultiStageDefenseSimulation();
        const summary = this.puzzleData.finalSummary || 'Modern cyber attacks happen in stages. Small security gaps can combine into major breaches. Layered defense and early detection are critical.';
        const feedback = document.getElementById('guess-feedback');
        if (feedback) feedback.innerHTML += `<div style="margin-top:8px;"><strong>Summary:</strong> ${summary}</div>`;
        if (success) {
            this.audio.playSuccess();
            this.gameScreen.ui.flashScreen('rgba(0, 255, 65, 0.2)', 300);
            this.gameScreen.ui.showNotification(this.mission.successFeedback || 'Boss campaign contained.', 'success');
            setTimeout(() => this.gameScreen.completePuzzle(true), 1300);
        } else {
            this.audio.playFailure();
            this.gameScreen.ui.flashScreen('rgba(255, 0, 110, 0.2)', 300);
            this.gameScreen.ui.showNotification(this.mission.failureFeedback || 'APT campaign breached defenses.', 'error');
            setTimeout(() => this.gameScreen.completePuzzle(false), 1300);
        }
    }

    /**
     * Build safe id suffix from display labels
     * @param {string} text
     * @returns {string}
     */
    sanitizeId(text) {
        return String(text || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    /**
     * Get configured total budget for strategy mode
     * @returns {number}
     */
    getStrategyTotalBudget() {
        return Number(this.puzzleData.totalBudget || this.puzzleData.initialScenarioDisplay?.budgetPoints || 100);
    }

    /**
     * Sum selected defense costs
     * @returns {number}
     */
    getStrategyUsedBudget() {
        const defenses = Array.isArray(this.puzzleData.defenses) ? this.puzzleData.defenses : [];
        return defenses.reduce((sum, defense) => {
            if (!this.strategySelectedDefenses.has(defense.id)) return sum;
            return sum + Number(defense.cost || 0);
        }, 0);
    }

    /**
     * Toggle one defense with budget check
     * @param {string} defenseId
     * @param {HTMLElement} button
     */
    toggleStrategyDefense(defenseId, button) {
        const defenses = Array.isArray(this.puzzleData.defenses) ? this.puzzleData.defenses : [];
        const defense = defenses.find(item => item.id === defenseId);
        if (!defense) return;

        if (this.strategySelectedDefenses.has(defenseId)) {
            this.strategySelectedDefenses.delete(defenseId);
            button.classList.remove('selected');
            this.audio.playButtonClick();
            this.updateStrategyBudgetUI();
            return;
        }

        const used = this.getStrategyUsedBudget();
        const total = this.getStrategyTotalBudget();
        const nextCost = used + Number(defense.cost || 0);
        if (nextCost > total) {
            this.gameScreen.ui.showNotification(`Budget exceeded. You have ${Math.max(0, total - used)} points left.`, 'warning');
            this.audio.playFailure();
            return;
        }

        this.strategySelectedDefenses.add(defenseId);
        button.classList.add('selected');
        this.audio.playButtonClick();
        this.updateStrategyBudgetUI();
    }

    /**
     * Update budget meter UI for strategy mode
     */
    updateStrategyBudgetUI() {
        const used = this.getStrategyUsedBudget();
        const total = this.getStrategyTotalBudget();
        const pct = Math.max(0, Math.min(100, (used / Math.max(1, total)) * 100));
        const text = document.getElementById('strategy-budget-text');
        const fill = document.getElementById('strategy-budget-fill');
        if (text) text.textContent = `${used} / ${total}`;
        if (fill) fill.style.width = `${pct}%`;
    }

    /**
     * Clear selected defenses in strategy mode
     */
    clearStrategySelection() {
        this.strategySelectedDefenses.clear();
        document.querySelectorAll('button[data-defense-id].selected').forEach(el => el.classList.remove('selected'));
        this.updateStrategyBudgetUI();
        this.audio.playButtonClick();
    }

    /**
     * Simulate attack waves based on selected defenses
     * @returns {{waveResults: Array, vaultIntegrity: number}}
     */
    runStrategySimulation() {
        const defenses = Array.isArray(this.puzzleData.defenses) ? this.puzzleData.defenses : [];
        const waves = Array.isArray(this.puzzleData.attackWaves) ? this.puzzleData.attackWaves : [];
        const selected = defenses.filter(defense => this.strategySelectedDefenses.has(defense.id));
        const sim = this.puzzleData.simulationLogic || {};
        const thresholds = sim.statusThresholds || {};
        const blockedMin = Number(thresholds.blockedMin ?? 0.67);
        const partialMin = Number(thresholds.partialMin ?? 0.34);
        const cap = Number(sim.protectionScoreCapPerWave ?? 1);

        const waveResults = waves.map(wave => {
            const base = Number(wave.baselineProtection || 0);
            const mapped = selected.reduce((sum, defense) => sum + Number(defense.protectionMapping?.[wave.id] || 0), 0);
            const score = Math.min(cap, Math.max(0, base + mapped));
            let status = 'Successful';
            if (score >= blockedMin) {
                status = 'Blocked';
            } else if (score >= partialMin) {
                status = 'Partially Blocked';
            }
            return {
                id: wave.id,
                name: wave.name,
                protectionScore: score,
                status
            };
        });

        const outcome = this.puzzleData.outcomeCalculation || {};
        const weights = outcome.waveWeights || {};
        const scoreByStatus = outcome.scoreByStatus || {};
        let weightedScoreSum = 0;
        let weightSum = 0;
        waveResults.forEach(result => {
            const w = Number(weights[result.id] || 0);
            let key = 'successful';
            if (result.status === 'Blocked') key = 'blocked';
            if (result.status === 'Partially Blocked') key = 'partial';
            const score = Number(scoreByStatus[key] ?? 0);
            weightedScoreSum += score * w;
            weightSum += w;
        });
        const vaultIntegrity = Math.max(0, Math.min(100, Math.round((weightedScoreSum / Math.max(1, weightSum)) * 100)));

        return { waveResults, vaultIntegrity };
    }

    /**
     * Submit selected strategy and evaluate simulation
     */
    submitStrategyBuilderDecision() {
        if (this.isComplete) return;
        if (this.strategySelectedDefenses.size === 0) {
            this.gameScreen.ui.showNotification('Choose at least one defense before simulation.', 'warning');
            return;
        }

        this.attempts++;
        this.updateAttemptCounter();
        this.gameScreen.updateAttempts(this.attempts);

        const result = this.runStrategySimulation();
        this.strategySimulationResult = result;
        this.renderStrategySimulationResult(result);

        const successThreshold = 55;
        if (result.vaultIntegrity >= successThreshold) {
            this.isComplete = true;
            this.audio.playSuccess();
            this.gameScreen.ui.flashScreen('rgba(0, 255, 65, 0.2)', 300);
            this.gameScreen.ui.showNotification(this.mission.successFeedback || 'Defense plan stabilized the vault.', 'success');
            setTimeout(() => this.gameScreen.completePuzzle(true), 1300);
            return;
        }

        this.audio.playFailure();
        if (this.attempts >= this.maxAttempts) {
            this.isComplete = true;
            this.gameScreen.ui.flashScreen('rgba(255, 0, 110, 0.2)', 300);
            this.gameScreen.ui.showNotification(this.mission.failureFeedback || 'Defense plan left critical gaps.', 'error');
            setTimeout(() => this.gameScreen.completePuzzle(false), 1300);
            return;
        }

        this.gameScreen.ui.showNotification('Coverage is low. Rebalance defenses and run again.', 'warning');
    }

    /**
     * Render strategy simulation outputs
     * @param {{waveResults: Array, vaultIntegrity: number}} result
     */
    renderStrategySimulationResult(result) {
        const waves = Array.isArray(result?.waveResults) ? result.waveResults : [];
        waves.forEach(wave => {
            const statusEl = document.getElementById(`strategy-wave-status-${wave.id}`);
            if (!statusEl) return;
            statusEl.textContent = wave.status;
            if (wave.status === 'Blocked') {
                statusEl.style.color = 'var(--cyber-green)';
            } else if (wave.status === 'Partially Blocked') {
                statusEl.style.color = 'var(--cyber-blue)';
            } else {
                statusEl.style.color = 'var(--cyber-pink)';
            }
        });

        const metric = this.puzzleData.outcomeCalculation?.finalMetric || {};
        const label = metric.label || 'Vault Integrity';
        const feedback = document.getElementById('guess-feedback');
        if (!feedback) return;

        const lines = waves.map(w => `<div>• ${w.name}: <strong>${w.status}</strong></div>`).join('');
        feedback.innerHTML = `
            <div><strong>Simulation Result:</strong></div>
            ${lines}
            <div style="margin-top:8px;"><strong>${label}:</strong> ${result.vaultIntegrity}%</div>
            <div style="margin-top:8px;">${this.puzzleData.educationalSummary || ''}</div>
        `;
    }

    /**
     * Show database preview for selected system
     * @param {string} systemId
     */
    viewInspectionDatabase(systemId) {
        const system = (this.puzzleData.systems || []).find(item => item.id === systemId);
        if (!system) return;
        const panel = document.getElementById(`db-${systemId}`);
        if (!panel) return;
        const rows = Array.isArray(system.databasePreview) ? system.databasePreview : [];
        panel.style.display = 'block';
        panel.innerHTML = `<strong>Database Preview:</strong><div>${rows.join('</div><div>')}</div>`;
    }

    /**
     * Show breach outcome for selected system
     * @param {string} systemId
     */
    simulateInspectionBreach(systemId) {
        const system = (this.puzzleData.systems || []).find(item => item.id === systemId);
        if (!system) return;
        const panel = document.getElementById(`breach-${systemId}`);
        if (!panel) return;
        panel.style.display = 'block';
        panel.innerHTML = `<strong>Breach Simulation:</strong><div>${system.breachOutcome || ''}</div>`;
    }

    /**
     * Submit safer-system choice
     */
    submitInspectionChoice() {
        if (this.isComplete) return;
        if (!this.inspectionSelectedSystem) {
            this.gameScreen.ui.showNotification('Choose a system first.', 'warning');
            return;
        }

        this.attempts++;
        this.updateAttemptCounter();
        this.gameScreen.updateAttempts(this.attempts);

        const feedback = document.getElementById('guess-feedback');
        const isCorrect = this.inspectionSelectedSystem === this.puzzleData.correctAnswer;

        if (!isCorrect) {
            if (feedback) {
                feedback.innerHTML = `
                    <div><strong>Not correct yet.</strong></div>
                    <div>${this.mission.failureFeedback || 'Review both systems and try again.'}</div>
                    <div style="margin-top:6px;">${this.puzzleData.simpleExplanation || ''}</div>
                `;
            }
            this.audio.playFailure();
            this.gameScreen.ui.showNotification('Incorrect choice. Review and try again.', 'error');
            return;
        }

        this.isComplete = true;
        const shock = this.puzzleData.shockReveal || null;
        if (feedback) {
            feedback.innerHTML = `
                <div><strong>Correct choice:</strong> System B</div>
                <div>${this.puzzleData.simpleExplanation || ''}</div>
                ${shock ? `<div style="margin-top:10px;"><strong>${shock.title}</strong> ${shock.message}</div>` : ''}
                <div style="margin-top:10px;">${this.puzzleData.educationalSummary || ''}</div>
            `;
        }
        this.audio.playSuccess();
        this.gameScreen.ui.flashScreen('rgba(0, 255, 65, 0.2)', 300);
        this.gameScreen.ui.showNotification(this.mission.successFeedback || 'Correct choice.', 'success');
        setTimeout(() => this.gameScreen.completePuzzle(true), 1400);
    }

    /**
     * Handle investigation cause answer
     */
    submitInvestigationCause() {
        if (this.isComplete) return;
        if (!this.investigationSelectedCause) {
            this.gameScreen.ui.showNotification('Select a cause first.', 'warning');
            return;
        }

        this.attempts++;
        this.updateAttemptCounter();
        this.gameScreen.updateAttempts(this.attempts);

        const feedback = document.getElementById('guess-feedback');
        const correctCause = this.puzzleData.correctAnswer;

        if (this.investigationSelectedCause !== correctCause) {
            if (feedback) {
                feedback.innerHTML = `
                    <div><strong>Not correct yet.</strong></div>
                    <div>${this.mission.failureFeedback || 'Review the evidence and try again.'}</div>
                    <div style="margin-top:6px;">${this.puzzleData.simpleExplanation || ''}</div>
                `;
            }
            this.audio.playFailure();
            this.gameScreen.ui.showNotification('Incorrect. Review evidence and try again.', 'error');
            return;
        }

        this.investigationStage = 'defense';
        const reveal = this.puzzleData.revealOnCorrect || {};
        if (feedback) {
            feedback.innerHTML = `
                <div><strong>Correct cause found:</strong> Dictionary Attack</div>
                <div>${this.puzzleData.simpleExplanation || ''}</div>
                <div style="margin-top:6px;"><strong>Actual password:</strong> ${reveal.actualPassword || 'unknown'}</div>
                <div>${reveal.message || ''} The system allowed unlimited attempts.</div>
            `;
        }
        this.audio.playSuccess();
        this.gameScreen.ui.showNotification('Cause identified. Continue to defense question.', 'success');

        const causeBlock = document.getElementById('investigation-cause-block');
        const defenseBlock = document.getElementById('investigation-defense-block');
        if (causeBlock) causeBlock.style.display = 'none';
        if (defenseBlock) defenseBlock.style.display = 'block';

        if (!this.puzzleData.followUpDefenseQuestion) {
            setTimeout(() => this.gameScreen.completePuzzle(true), 1200);
        }
    }

    /**
     * Handle investigation defense answer
     */
    submitInvestigationDefense() {
        if (this.isComplete) return;
        const followUp = this.puzzleData.followUpDefenseQuestion || null;
        if (!followUp) {
            this.gameScreen.completePuzzle(true);
            return;
        }
        if (!this.investigationSelectedDefense) {
            this.gameScreen.ui.showNotification('Select a defense option first.', 'warning');
            return;
        }

        this.attempts++;
        this.updateAttemptCounter();
        this.gameScreen.updateAttempts(this.attempts);

        const feedback = document.getElementById('guess-feedback');
        const isCorrect = this.investigationSelectedDefense === followUp.correctAnswer;
        if (!isCorrect) {
            if (feedback) {
                feedback.innerHTML = `
                    <div><strong>Not the best defense.</strong></div>
                    <div>${followUp.explanation || 'Try again and pick a control that blocks repeated guesses.'}</div>
                `;
            }
            this.audio.playFailure();
            this.gameScreen.ui.showNotification('Try again. Think about what blocks repeated guesses.', 'error');
            return;
        }

        this.isComplete = true;
        if (feedback) {
            feedback.innerHTML = `
                <div><strong>Correct defense:</strong> Add lockout rule</div>
                <div>${followUp.explanation || ''}</div>
                <div style="margin-top:8px;">${this.puzzleData.educationalSummary || ''}</div>
            `;
        }
        this.audio.playSuccess();
        this.gameScreen.ui.flashScreen('rgba(0, 255, 65, 0.2)', 300);
        this.gameScreen.ui.showNotification(this.mission.successFeedback || 'Investigation complete.', 'success');
        setTimeout(() => this.gameScreen.completePuzzle(true), 1400);
    }

    /**
     * Start countdown timer for prediction mode
     */
    startPredictionTimer() {
        this.updatePredictionTimerUI();
        this.predictionTimerId = setInterval(() => {
            if (this.isComplete) return;
            this.predictionRemaining = Math.max(0, this.predictionRemaining - 1);
            this.updatePredictionTimerUI();
            if (this.predictionRemaining <= 0) {
                this.onPredictionChoiceFailure('Time is up. The weaker password broke first.');
            }
        }, 1000);
    }

    /**
     * Stop prediction timer
     */
    stopPredictionTimer() {
        if (this.predictionTimerId) {
            clearInterval(this.predictionTimerId);
            this.predictionTimerId = null;
        }
    }

    /**
     * Update prediction timer UI
     */
    updatePredictionTimerUI() {
        const timerText = document.getElementById('prediction-timer-text');
        const timerFill = document.getElementById('prediction-timer-fill');
        if (timerText) timerText.textContent = `${this.predictionRemaining}s`;
        if (timerFill) {
            const pct = Math.max(0, Math.min(100, (this.predictionRemaining / Math.max(1, this.puzzleData.timeLimit || 1)) * 100));
            timerFill.style.width = `${pct}%`;
        }
    }

    /**
     * Resolve break time in seconds for a password in prediction mode
     * @param {string} password
     * @returns {number}
     */
    getPredictionBreakTime(password) {
        if (typeof this.puzzleData.simulateBreakTime === 'function') {
            return this.puzzleData.simulateBreakTime(password, this.predictionSession);
        }
        const table = this.predictionSession?.breakTimeSeconds || {};
        return table[password] || 60;
    }

    /**
     * Submit prediction and run race animation
     */
    submitPredictionChoiceDecision() {
        if (this.isComplete) return;
        if (!this.predictionSelected) {
            this.gameScreen.ui.showNotification('Select one password first.', 'warning');
            return;
        }

        this.attempts++;
        this.updateAttemptCounter();
        this.gameScreen.updateAttempts(this.attempts);
        this.stopPredictionTimer();

        const session = this.predictionSession || {};
        const options = Array.isArray(session.options) ? session.options : [];
        const times = options.map(option => this.getPredictionBreakTime(option));
        const minTime = Math.min(...times);
        const maxTime = Math.max(...times, 1);
        const raceBoard = document.getElementById('prediction-race-board');
        if (raceBoard) raceBoard.style.display = 'block';

        options.forEach((option, idx) => {
            const bar = document.getElementById(`race-bar-${idx}`);
            const label = document.getElementById(`race-time-${idx}`);
            const t = times[idx];
            const crackedPct = Math.max(8, Math.min(100, ((maxTime - t) / maxTime) * 100 + 8));
            if (bar) {
                bar.style.background = t === minTime ? 'var(--cyber-pink)' : 'var(--cyber-green)';
                requestAnimationFrame(() => {
                    bar.style.width = `${crackedPct}%`;
                });
            }
            if (label) {
                label.textContent = `${t}s`;
            }
        });

        const correct = this.predictionSelected === session.correctAnswer;
        const feedback = document.getElementById('guess-feedback');
        const explanation = session.simpleExplanation || this.puzzleData.simpleExplanation || '';
        if (feedback) {
            feedback.innerHTML = `
                <div><strong>${correct ? (this.mission.successFeedback || 'Good call.') : (this.mission.failureFeedback || 'Incorrect prediction.')}</strong></div>
                <div style="margin-top:6px;">${explanation}</div>
            `;
        }

        const shock = this.puzzleData.shockEvent || null;
        const showShock = shock && shock.triggerCaseId && shock.triggerCaseId === session.caseId;

        setTimeout(() => {
            if (showShock && feedback) {
                feedback.innerHTML += `<div style="margin-top:10px;"><strong>${shock.title}</strong> ${shock.message}</div>`;
            }
            if (correct) {
                this.onPredictionChoiceSuccess();
            } else {
                this.onPredictionChoiceFailure('Incorrect prediction. The weaker password broke first.');
            }
        }, this.puzzleData?.simulationUI?.animateDurationMs || 3200);
    }

    /**
     * Success handler for prediction-choice mode
     */
    onPredictionChoiceSuccess() {
        if (this.isComplete) return;
        this.isComplete = true;
        this.audio.playSuccess();
        this.gameScreen.ui.flashScreen('rgba(0, 255, 65, 0.2)', 300);
        this.gameScreen.ui.showNotification(this.mission.successFeedback || 'Good prediction.', 'success');
        setTimeout(() => this.gameScreen.completePuzzle(true), 1200);
    }

    /**
     * Failure handler for prediction-choice mode
     * @param {string} message
     */
    onPredictionChoiceFailure(message) {
        if (this.isComplete) return;
        this.isComplete = true;
        this.stopPredictionTimer();
        this.audio.playFailure();
        this.gameScreen.ui.flashScreen('rgba(255, 0, 110, 0.2)', 300);
        this.gameScreen.ui.showNotification(message || this.mission.failureFeedback || 'Incorrect prediction.', 'error');
        setTimeout(() => this.gameScreen.completePuzzle(false), 1200);
    }

    /**
     * Fill inputs with text (for paste)
     * @param {string} text - Text to fill
     * @param {number} startIndex - Starting index
     */
    fillInputs(text, startIndex = 0) {
        for (let i = 0; i < text.length && (startIndex + i) < this.inputs.length; i++) {
            this.inputs[startIndex + i].value = text[i];
        }
        this.updateDisplay();
    }

    /**
     * Submit multi-select classification
     */
    submitMultiSelectSelection() {
        if (this.isComplete) return;

        if (this.selectedOptions.size === 0) {
            this.gameScreen.ui.showNotification('Select at least one password before submission.', 'warning');
            return;
        }

        this.attempts++;
        this.updateAttemptCounter();
        this.gameScreen.updateAttempts(this.attempts);

        const selectedIds = Array.from(this.selectedOptions);
        const isValid = typeof this.puzzleData.validateSelection === 'function'
            ? this.puzzleData.validateSelection(selectedIds, this.session)
            : false;

        if (isValid) {
            this.onMultiSelectSuccess();
            return;
        }

        this.showMultiSelectFeedback();
        this.increaseRisk();

        this.revealSecondaryClue();

        if (this.hasRiskBreached()) {
            const breachMessage = this.riskSystem?.breachMessage || 'Simulated breach triggered by repeated wrong decisions.';
            this.gameScreen.ui.showNotification(breachMessage, 'error');
            this.onMultiSelectFailure();
            return;
        }

        if (this.attempts >= this.maxAttempts) {
            this.onMultiSelectFailure();
        } else {
            this.gameScreen.ui.showNotification('Classification mismatch detected. Reassess behavioral indicators.', 'error');
        }
    }

    /**
     * Clear current multi-select choices
     */
    clearMultiSelectSelection() {
        this.selectedOptions.clear();
        document.querySelectorAll('.password-option.selected').forEach(el => el.classList.remove('selected'));
        this.audio.playButtonClick();
    }

    /**
     * Show concise classification feedback without revealing answers
     */
    showMultiSelectFeedback() {
        const feedback = document.getElementById('guess-feedback');
        if (!feedback) return;

        const selectedIds = this.selectedOptions;
        const weakCount = (this.session?.options || []).filter(o => o.isWeak).length;
        const selectedCount = selectedIds.size;

        feedback.innerHTML = `
            <div><strong>SOC Feedback:</strong> Selection pattern does not fully align with observed human-risk behaviors.</div>
            <div>Weak credentials expected in set: ${weakCount}</div>
            <div>Your current selection count: ${selectedCount}</div>
        `;
    }

    /**
     * Reveal optional subtle clue after first failed attempt
     */
    revealSecondaryClue() {
        const failHints = Array.isArray(this.session?.failHints) ? this.session.failHints : [];
        let text = '';
        if (failHints.length) {
            const idx = Math.min(this.attempts - 1, failHints.length - 1);
            text = failHints[idx] || '';
        } else if (this.attempts === 1) {
            text = this.session?.subtleClueOnFail || '';
        }
        if (!text) return;
        const hintsContainer = document.getElementById('password-hints');
        if (!hintsContainer) return;

        const clue = document.createElement('div');
        clue.className = 'hint animate-fadeIn';
        clue.textContent = `→ ${text}`;
        hintsContainer.appendChild(clue);
    }

    /**
     * Render post-completion security insight panel
     */
    renderSecurityInsight() {
        const feedback = document.getElementById('guess-feedback');
        if (!feedback) return;
        const insights = Array.isArray(this.session?.securityInsight) ? this.session.securityInsight : [];
        const correctWeak = Array.isArray(this.session?.correctWeakPasswords) ? this.session.correctWeakPasswords : [];
        if (!insights.length && !correctWeak.length) return;

        const answersLine = correctWeak.length
            ? `<div><strong>Correct weak passwords in this round:</strong> ${correctWeak.join(', ')}</div>`
            : '';

        feedback.innerHTML = `
            ${answersLine}
            <div><strong>Security Insight:</strong></div>
            <div>• ${insights.join('</div><div>• ')}</div>
        `;

        if (this.puzzleData.finalReview) {
            const weakTotal = (this.session?.options || []).filter(o => o.isWeak).length;
            const selectedIds = Array.from(this.selectedOptions);
            const correctSelected = (this.session?.options || []).filter(o => o.isWeak && selectedIds.includes(o.id)).length;
            const max = this.riskSystem?.max || 100;
            const riskPercent = Math.floor((this.riskValue / max) * 100);
            const rating = riskPercent <= 15 ? 'A+' : riskPercent <= 30 ? 'A' : riskPercent <= 55 ? 'B' : 'C';
            const focus = rating === 'A+' || rating === 'A'
                ? 'keep blocking common patterns and reuse'
                : rating === 'B'
                    ? 'reduce predictable patterns and strengthen policy checks'
                    : 'avoid common passwords and apply all controls together';
            const summary = `You spotted ${correctSelected}/${weakTotal} weak risks. Your final security rating is ${rating}. Main improvement area: ${focus}.`;
            feedback.innerHTML += `
                <div style="margin-top:10px;"><strong>Final Review:</strong> ${summary}</div>
            `;
        }
    }

    /**
     * Update password display
     */
    updateDisplay() {
        const display = document.getElementById('password-display');
        if (!display) return;

        let displayText = '';
        this.inputs.forEach(input => {
            displayText += input.value || '_';
        });

        display.textContent = displayText;
    }

    /**
     * Get current guess
     * @returns {string} Current password guess
     */
    getCurrentGuess() {
        if (this.interactionMode === 'multiSelect' || this.interactionMode === 'singleChoice' || this.interactionMode === 'predictionChoice' || this.interactionMode === 'investigation' || this.interactionMode === 'inspection' || this.interactionMode === 'strategyBuilder' || this.interactionMode === 'liveDefenseSimulation' || this.interactionMode === 'multiStageDefenseSimulation' || this.interactionMode === 'threatHuntSimulation' || this.interactionMode === 'livePatchSimulation' || this.interactionMode === 'enterpriseArchitectureSimulation') return '';
        return this.inputs.map(input => input.value).join('').toUpperCase();
    }

    /**
     * Check if password is correct
     */
    checkPassword() {
        if (this.isComplete) return;
        if (this.interactionMode === 'multiSelect') {
            this.submitMultiSelectSelection();
            return;
        }
        if (this.interactionMode === 'singleChoice') {
            this.submitSingleChoiceDecision();
            return;
        }
        if (this.interactionMode === 'predictionChoice') {
            this.submitPredictionChoiceDecision();
            return;
        }
        if (this.interactionMode === 'investigation') {
            if (this.investigationStage === 'cause') {
                this.submitInvestigationCause();
            } else {
                this.submitInvestigationDefense();
            }
            return;
        }
        if (this.interactionMode === 'inspection') {
            this.submitInspectionChoice();
            return;
        }
        if (this.interactionMode === 'strategyBuilder') {
            this.submitStrategyBuilderDecision();
            return;
        }
        if (this.interactionMode === 'liveDefenseSimulation') {
            return;
        }
        if (this.interactionMode === 'multiStageDefenseSimulation') {
            return;
        }
        if (this.interactionMode === 'threatHuntSimulation') {
            return;
        }
        if (this.interactionMode === 'livePatchSimulation') {
            return;
        }
        if (this.interactionMode === 'enterpriseArchitectureSimulation') {
            return;
        }

        const guess = this.getCurrentGuess();
        
        // Check if all fields filled
        if (guess.length !== this.password.length) {
            this.gameScreen.ui.showNotification('Enter all characters!', 'warning');
            return;
        }

        this.attempts++;
        this.updateAttemptCounter();
        this.updateVisualizerState();

        if (guess === this.password) {
            // Correct!
            this.onSuccess();
        } else {
            // Incorrect
            this.showGuessFeedback(guess);
            this.onFailure();
        }

        // Update game screen stats
        this.gameScreen.updateAttempts(this.attempts);
    }

    /**
     * Handle correct password
     */
    onSuccess() {
        this.isComplete = true;
        this.audio.playSuccess();

        // Mark all inputs as correct
        this.inputs.forEach(input => {
            input.classList.add('correct');
            input.disabled = true;
        });

        // Flash screen
        this.gameScreen.ui.flashScreen('rgba(0, 255, 65, 0.2)', 300);

        // Show success message
        const successMessage = (this.visualProfile === 'enterprise-architecture')
            ? `${this.mission.successFeedback || 'Password cracked!'} ${this.buildEnterpriseSummary()}`
            : (this.mission.successFeedback || 'Password cracked!');

        this.gameScreen.ui.showNotification(successMessage, 'success');

        // Complete mission
        setTimeout(() => {
            this.gameScreen.completePuzzle(true);
        }, 1000);
    }

    /**
     * Handle multi-select success
     */
    onMultiSelectSuccess() {
        this.isComplete = true;
        this.audio.playSuccess();
        this.gameScreen.ui.flashScreen('rgba(0, 255, 65, 0.2)', 300);
        this.renderSecurityInsight();
        this.gameScreen.ui.showNotification(
            this.mission.successFeedback || 'Credential vulnerability successfully identified. Human predictability confirmed.',
            'success'
        );
        setTimeout(() => this.gameScreen.completePuzzle(true), 1400);
    }

    /**
     * Handle multi-select failure
     */
    onMultiSelectFailure() {
        this.isComplete = true;
        this.audio.playFailure();
        document.querySelectorAll('.password-option').forEach(el => el.disabled = true);
        this.renderSecurityInsight();
        this.gameScreen.ui.showNotification(
            this.mission.failureFeedback || 'Security oversight detected. Reassess behavioral patterns used in password creation.',
            'error'
        );
        setTimeout(() => this.gameScreen.completePuzzle(false), 1700);
    }

    /**
     * Handle incorrect password
     */
    onFailure() {
        this.audio.playFailure();

        // Reset previous transient error styles
        this.inputs.forEach(input => {
            if (input.classList.contains('incorrect')) {
                input.classList.remove('incorrect');
            }
        });

        // Shake only currently incorrect letters
        this.inputs.forEach(input => {
            if (!input.classList.contains('correct') && !input.classList.contains('partial')) {
                input.classList.add('incorrect');
            }
            setTimeout(() => {
                input.classList.remove('incorrect');
            }, 500);
        });

        // Flash screen
        this.gameScreen.ui.flashScreen('rgba(255, 0, 110, 0.2)', 300);

        // Check if out of attempts
        if (this.attempts >= this.maxAttempts) {
            this.onOutOfAttempts();
        } else {
            this.gameScreen.ui.showNotification(
                `Authentication rejected. ${this.maxAttempts - this.attempts} attempts remaining`,
                'error'
            );
        }
    }

    /**
     * Handle running out of attempts
     */
    onOutOfAttempts() {
        this.isComplete = true;

        // Disable inputs
        this.inputs.forEach(input => {
            input.disabled = true;
        });

        this.gameScreen.ui.showNotification(
            this.mission.failureFeedback || 'Out of attempts! Mission failed.',
            'error'
        );

        setTimeout(() => {
            this.gameScreen.completePuzzle(false);
        }, 2000);
    }

    /**
     * Clear all inputs
     */
    clearInputs() {
        if (this.interactionMode === 'multiSelect') {
            this.clearMultiSelectSelection();
            return;
        }
        if (this.interactionMode === 'singleChoice') {
            this.singleChoiceSelected = null;
            const selected = document.querySelector('input[name="attack-choice"]:checked');
            if (selected) selected.checked = false;
            this.audio.playButtonClick();
            return;
        }
        if (this.interactionMode === 'predictionChoice') {
            this.predictionSelected = null;
            const selected = document.querySelector('input[name="prediction-choice"]:checked');
            if (selected) selected.checked = false;
            this.audio.playButtonClick();
            return;
        }
        if (this.interactionMode === 'investigation') {
            this.investigationSelectedCause = null;
            this.investigationSelectedDefense = null;
            const selectedCause = document.querySelector('input[name="investigation-cause"]:checked');
            const selectedDefense = document.querySelector('input[name="investigation-defense"]:checked');
            if (selectedCause) selectedCause.checked = false;
            if (selectedDefense) selectedDefense.checked = false;
            this.audio.playButtonClick();
            return;
        }
        if (this.interactionMode === 'inspection') {
            this.inspectionSelectedSystem = null;
            const selected = document.querySelector('input[name="inspection-choice"]:checked');
            if (selected) selected.checked = false;
            this.audio.playButtonClick();
            return;
        }
        if (this.interactionMode === 'strategyBuilder') {
            this.clearStrategySelection();
            return;
        }
        if (this.interactionMode === 'liveDefenseSimulation') {
            return;
        }
        if (this.interactionMode === 'multiStageDefenseSimulation') {
            return;
        }
        if (this.interactionMode === 'threatHuntSimulation') {
            return;
        }
        if (this.interactionMode === 'livePatchSimulation') {
            return;
        }
        if (this.interactionMode === 'enterpriseArchitectureSimulation') {
            return;
        }
        this.inputs.forEach(input => {
            input.value = '';
            input.classList.remove('correct', 'partial', 'incorrect');
        });
        
        if (this.inputs[0]) {
            this.inputs[0].focus();
        }
        
        this.updateDisplay();
        this.audio.playButtonClick();
    }

    /**
     * Show position-accurate feedback after an incorrect guess
     * @param {string} guess
     */
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

            if (char === this.password[i]) {
                pattern.push(char);
                input.classList.add('correct');
            } else if (this.password.includes(char)) {
                pattern.push('_');
                presentLetters.add(char);
                input.classList.add('partial');
            } else {
                pattern.push('_');
                wrongLetters.add(char);
                input.classList.add('incorrect');
            }
        }

        const presentText = presentLetters.size
            ? `Present but misplaced: ${Array.from(presentLetters).join(', ')}`
            : 'Present but misplaced: none';
        const wrongText = wrongLetters.size
            ? `Incorrect letters: ${Array.from(wrongLetters).join(', ')}`
            : 'Incorrect letters: none';

        feedback.innerHTML = `
            <div><strong>Correct positions:</strong> ${pattern.join(' ')}</div>
            <div>${presentText}</div>
            <div>${wrongText}</div>
        `;
    }

    /**
     * Update attempt counter display
     */
    updateAttemptCounter() {
        const counter = document.getElementById('attempt-counter');
        if (counter) {
            if (this.interactionMode === 'multiSelect') {
                counter.innerHTML = `
                    Submissions: <span style="color: var(--cyber-${this.attempts >= this.maxAttempts - 1 ? 'pink' : 'blue'}');">${this.attempts}</span> / ${this.maxAttempts}
                `;
                return;
            }
            if (this.interactionMode === 'singleChoice') {
                counter.innerHTML = `
                    Decisions: <span style="color: var(--cyber-${this.attempts >= this.maxAttempts - 1 ? 'pink' : 'blue'}');">${this.attempts}</span> / ${this.maxAttempts}
                `;
                return;
            }
            if (this.interactionMode === 'predictionChoice') {
                counter.innerHTML = `
                    Decisions: <span style="color: var(--cyber-${this.attempts >= this.maxAttempts - 1 ? 'pink' : 'blue'}');">${this.attempts}</span> / ${this.maxAttempts}
                `;
                return;
            }
            if (this.interactionMode === 'investigation') {
                counter.innerHTML = `
                    Decisions: <span style="color: var(--cyber-blue);">${this.attempts}</span> / ${this.maxAttempts}
                `;
                return;
            }
            if (this.interactionMode === 'inspection') {
                counter.innerHTML = `
                    Decisions: <span style="color: var(--cyber-blue);">${this.attempts}</span> / ${this.maxAttempts}
                `;
                return;
            }
            if (this.interactionMode === 'strategyBuilder') {
                counter.innerHTML = `
                    Simulations: <span style="color: var(--cyber-${this.attempts >= this.maxAttempts - 1 ? 'pink' : 'blue'}');">${this.attempts}</span> / ${this.maxAttempts}
                `;
                return;
            }
            if (this.interactionMode === 'liveDefenseSimulation') {
                counter.innerHTML = 'Live defense active';
                return;
            }
            if (this.interactionMode === 'multiStageDefenseSimulation') {
                counter.innerHTML = 'Boss simulation active';
                return;
            }
            if (this.interactionMode === 'threatHuntSimulation') {
                counter.innerHTML = `
                    Investigation actions: <span style="color: var(--cyber-${this.attempts >= this.maxAttempts - 1 ? 'pink' : 'blue'}');">${this.attempts}</span>
                `;
                return;
            }
            if (this.interactionMode === 'livePatchSimulation') {
                counter.innerHTML = `
                    Patch operations: <span style="color: var(--cyber-${this.attempts >= this.maxAttempts - 1 ? 'pink' : 'blue'}');">${this.attempts}</span>
                `;
                return;
            }
            if (this.interactionMode === 'enterpriseArchitectureSimulation') {
                counter.innerHTML = `
                    Certification evaluations: <span style="color: var(--cyber-${this.attempts >= this.maxAttempts - 1 ? 'pink' : 'blue'}');">${this.attempts}</span>
                `;
                return;
            }
            counter.innerHTML = `
                Attempts: <span style="color: var(--cyber-${this.attempts >= this.maxAttempts - 1 ? 'pink' : 'blue'}');">${this.attempts}</span> / ${this.maxAttempts}
            `;
        }
    }

    /**
     * Show a hint
     */
    showHint() {
        if (this.interactionMode === 'multiSelect') {
            this.gameScreen.ui.showNotification('Story intelligence is already provided. Use behavioral inference.', 'info');
            return;
        }
        if (this.interactionMode === 'singleChoice') {
            const hintKeys = ['hint1', 'hint2', 'hint3'];
            if (this.hintsShown >= hintKeys.length) {
                this.gameScreen.ui.showNotification('No more hints available!', 'warning');
                return;
            }
            this.hintsShown++;
            const hintText = this.mission?.hintSystem?.[hintKeys[this.hintsShown - 1]];
            if (!hintText) {
                this.gameScreen.ui.showNotification('No more hints available!', 'warning');
                return;
            }
            const feedback = document.getElementById('guess-feedback');
            if (feedback) {
                feedback.innerHTML = `<strong>Hint:</strong> ${hintText}`;
            }
            this.audio.playHint();
            this.gameScreen.ui.showNotification('Hint revealed!', 'info');
            return;
        }
        if (this.interactionMode === 'predictionChoice') {
            const hintKeys = ['hint1', 'hint2', 'hint3'];
            if (this.hintsShown >= hintKeys.length) {
                this.gameScreen.ui.showNotification('No more hints available!', 'warning');
                return;
            }
            this.hintsShown++;
            const hintText = this.mission?.hintSystem?.[hintKeys[this.hintsShown - 1]];
            if (!hintText) {
                this.gameScreen.ui.showNotification('No more hints available!', 'warning');
                return;
            }
            const feedback = document.getElementById('guess-feedback');
            if (feedback) {
                feedback.innerHTML = `<strong>Hint:</strong> ${hintText}`;
            }
            this.audio.playHint();
            this.gameScreen.ui.showNotification('Hint revealed!', 'info');
            return;
        }
        if (this.interactionMode === 'investigation') {
            const hintKeys = ['hint1', 'hint2', 'hint3'];
            if (this.hintsShown >= hintKeys.length) {
                this.gameScreen.ui.showNotification('No more hints available!', 'warning');
                return;
            }
            this.hintsShown++;
            const hintText = this.mission?.hintSystem?.[hintKeys[this.hintsShown - 1]];
            if (!hintText) {
                this.gameScreen.ui.showNotification('No more hints available!', 'warning');
                return;
            }
            const feedback = document.getElementById('guess-feedback');
            if (feedback) {
                feedback.innerHTML = `<strong>Hint:</strong> ${hintText}`;
            }
            this.audio.playHint();
            this.gameScreen.ui.showNotification('Hint revealed!', 'info');
            return;
        }
        if (this.interactionMode === 'inspection') {
            const hintKeys = ['hint1', 'hint2', 'hint3'];
            if (this.hintsShown >= hintKeys.length) {
                this.gameScreen.ui.showNotification('No more hints available!', 'warning');
                return;
            }
            this.hintsShown++;
            const hintText = this.mission?.hintSystem?.[hintKeys[this.hintsShown - 1]];
            if (!hintText) {
                this.gameScreen.ui.showNotification('No more hints available!', 'warning');
                return;
            }
            const feedback = document.getElementById('guess-feedback');
            if (feedback) {
                feedback.innerHTML = `<strong>Hint:</strong> ${hintText}`;
            }
            this.audio.playHint();
            this.gameScreen.ui.showNotification('Hint revealed!', 'info');
            return;
        }
        if (this.interactionMode === 'strategyBuilder') {
            const hintKeys = ['hint1', 'hint2', 'hint3'];
            if (this.hintsShown >= hintKeys.length) {
                this.gameScreen.ui.showNotification('No more hints available!', 'warning');
                return;
            }
            this.hintsShown++;
            const hintText = this.mission?.hintSystem?.[hintKeys[this.hintsShown - 1]];
            if (!hintText) {
                this.gameScreen.ui.showNotification('No more hints available!', 'warning');
                return;
            }
            const feedback = document.getElementById('guess-feedback');
            if (feedback) {
                feedback.innerHTML = `<strong>Hint:</strong> ${hintText}`;
            }
            this.audio.playHint();
            this.gameScreen.ui.showNotification('Hint revealed!', 'info');
            return;
        }
        if (this.interactionMode === 'liveDefenseSimulation') {
            const hintKeys = ['hint1', 'hint2', 'hint3'];
            if (this.hintsShown >= hintKeys.length) {
                this.gameScreen.ui.showNotification('No more hints available!', 'warning');
                return;
            }
            this.hintsShown++;
            const hintText = this.mission?.hintSystem?.[hintKeys[this.hintsShown - 1]];
            if (!hintText) {
                this.gameScreen.ui.showNotification('No more hints available!', 'warning');
                return;
            }
            this.gameScreen.ui.showNotification(hintText, 'info');
            this.audio.playHint();
            return;
        }
        if (this.interactionMode === 'multiStageDefenseSimulation') {
            const hintKeys = ['hint1', 'hint2', 'hint3'];
            if (this.hintsShown >= hintKeys.length) {
                this.gameScreen.ui.showNotification('No more hints available!', 'warning');
                return;
            }
            this.hintsShown++;
            const hintText = this.mission?.hintSystem?.[hintKeys[this.hintsShown - 1]];
            if (!hintText) {
                this.gameScreen.ui.showNotification('No more hints available!', 'warning');
                return;
            }
            this.gameScreen.ui.showNotification(hintText, 'info');
            this.audio.playHint();
            return;
        }
        if (this.interactionMode === 'threatHuntSimulation') {
            const hintKeys = ['hint1', 'hint2', 'hint3'];
            if (this.hintsShown >= hintKeys.length) {
                this.gameScreen.ui.showNotification('No more hints available!', 'warning');
                return;
            }
            this.hintsShown++;
            const hintText = this.mission?.hintSystem?.[hintKeys[this.hintsShown - 1]];
            if (!hintText) {
                this.gameScreen.ui.showNotification('No more hints available!', 'warning');
                return;
            }
            this.gameScreen.ui.showNotification(hintText, 'info');
            this.audio.playHint();
            return;
        }
        if (this.interactionMode === 'livePatchSimulation') {
            const hintKeys = ['hint1', 'hint2', 'hint3'];
            if (this.hintsShown >= hintKeys.length) {
                this.gameScreen.ui.showNotification('No more hints available!', 'warning');
                return;
            }
            this.hintsShown++;
            const hintText = this.mission?.hintSystem?.[hintKeys[this.hintsShown - 1]];
            if (!hintText) {
                this.gameScreen.ui.showNotification('No more hints available!', 'warning');
                return;
            }
            this.gameScreen.ui.showNotification(hintText, 'info');
            this.audio.playHint();
            return;
        }
        if (this.interactionMode === 'enterpriseArchitectureSimulation') {
            const hintKeys = ['hint1', 'hint2', 'hint3'];
            if (this.hintsShown >= hintKeys.length) {
                this.gameScreen.ui.showNotification('No more hints available!', 'warning');
                return;
            }
            this.hintsShown++;
            const hintText = this.mission?.hintSystem?.[hintKeys[this.hintsShown - 1]];
            if (!hintText) {
                this.gameScreen.ui.showNotification('No more hints available!', 'warning');
                return;
            }
            this.gameScreen.ui.showNotification(hintText, 'info');
            this.audio.playHint();
            return;
        }

        if (this.isComplete) {
            this.gameScreen.ui.showNotification('Puzzle already complete!', 'info');
            return;
        }

        if (this.hintsShown >= this.hints.length) {
            this.gameScreen.ui.showNotification('No more hints available!', 'warning');
            return;
        }

        this.hintsShown++;
        this.updateVisualizerState();
        const hintsContainer = document.getElementById('password-hints');
        
        if (hintsContainer) {
            const newHint = document.createElement('div');
            newHint.className = 'hint animate-fadeIn';
            newHint.textContent = `→ ${this.hints[this.hintsShown - 1]}`;
            hintsContainer.appendChild(newHint);
        }

        this.audio.playHint();
        this.gameScreen.ui.showNotification('Hint revealed!', 'info');
    }

    /**
     * Get puzzle statistics
     * @returns {Object} Puzzle stats
     */
    getStats() {
        return {
            attempts: this.attempts,
            hintsUsed: this.hintsShown,
            completed: this.isComplete
        };
    }

    /**
     * Clean up puzzle
     */
    destroy() {
        if (this.interactionMode === 'multiSelect') {
            return;
        }
        if (this.interactionMode === 'singleChoice') {
            this.stopSingleChoiceTimers();
            return;
        }
        if (this.interactionMode === 'predictionChoice') {
            this.stopPredictionTimer();
            return;
        }
        if (this.interactionMode === 'investigation') {
            return;
        }
        if (this.interactionMode === 'inspection') {
            return;
        }
        if (this.interactionMode === 'strategyBuilder') {
            return;
        }
        if (this.interactionMode === 'liveDefenseSimulation') {
            this.stopLiveDefenseSimulation();
            return;
        }
        if (this.interactionMode === 'multiStageDefenseSimulation') {
            this.stopMultiStageDefenseSimulation();
            return;
        }
        if (this.interactionMode === 'threatHuntSimulation') {
            return;
        }
        if (this.interactionMode === 'livePatchSimulation') {
            return;
        }
        if (this.interactionMode === 'enterpriseArchitectureSimulation') {
            return;
        }
        // Remove event listeners
        this.inputs.forEach(input => {
            input.removeEventListener('input', null);
            input.removeEventListener('keydown', null);
            input.removeEventListener('keypress', null);
            input.removeEventListener('paste', null);
        });
    }
}
