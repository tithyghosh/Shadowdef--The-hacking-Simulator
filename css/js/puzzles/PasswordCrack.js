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
        if (this.interactionMode === 'multiSelect' || this.interactionMode === 'singleChoice' || this.interactionMode === 'predictionChoice' || this.interactionMode === 'investigation') return;

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
        if (this.interactionMode === 'multiSelect' || this.interactionMode === 'singleChoice' || this.interactionMode === 'predictionChoice' || this.interactionMode === 'investigation') return '';
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
        // Remove event listeners
        this.inputs.forEach(input => {
            input.removeEventListener('input', null);
            input.removeEventListener('keydown', null);
            input.removeEventListener('keypress', null);
            input.removeEventListener('paste', null);
        });
    }
}
