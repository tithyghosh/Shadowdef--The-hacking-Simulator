import { AuthManager } from '../core/AuthManager.js';

export class GuidebookScreen {
    constructor(game) {
        this.game = game;
        this.auth = AuthManager.getInstance();
    }

    render() {
        const container = document.getElementById('guidebook-screen');
        if (!container) return;

        const sections = this.getGuideSections();
        const user = this.auth.getCurrentUser();
        const operatorName = user?.name || 'Guest Operator';
        const totalMissions = sections.reduce((sum, section) => sum + section.missions.length, 0);
        const completed = sections.reduce((sum, section) => sum + section.missions.filter((mission) => mission.completed).length, 0);
        const unlocked = sections.reduce((sum, section) => sum + section.missions.filter((mission) => !mission.locked).length, 0);

        container.innerHTML = `
            <div class="guidebook-shell">
                <div class="guidebook-grid" aria-hidden="true"></div>
                <div class="guidebook-scanlines" aria-hidden="true"></div>

                <div class="guidebook-frame">
                    <div class="guidebook-header">
                        <button class="back-btn guidebook-back-btn" type="button" data-action="back">BACK</button>

                        <div class="guidebook-title-block">
                            <div class="guidebook-kicker">// OPERATOR GUIDEBOOK</div>
                            <h2 class="guidebook-title">MISSION INSTRUCTIONS</h2>
                            <p class="guidebook-subtitle">Step-by-step play guidance for every current mission track, plus the core rules for progression, timing, hints, and mission success.</p>
                        </div>

                        <div class="guidebook-status">
                            <span class="guidebook-chip is-live">${completed}/${totalMissions} CLEARED</span>
                            <span class="guidebook-chip">${unlocked}/${totalMissions} UNLOCKED</span>
                        </div>
                    </div>

                    <div class="guidebook-layout">
                        <aside class="guidebook-sidebar">
                            <div class="guidebook-panel">
                                <div class="guidebook-panel-kicker">FIELD RULES</div>
                                <h3 class="guidebook-panel-title">How Progress Works</h3>
                                <div class="guidebook-overview-list">
                                    ${this.renderOverviewItems()}
                                </div>
                            </div>

                            <div class="guidebook-panel">
                                <div class="guidebook-panel-kicker">LEVEL INDEX</div>
                                <h3 class="guidebook-panel-title">Mission Routes</h3>
                                <div class="guidebook-index-stack">
                                    ${sections.map((section) => this.renderSectionIndexGroup(section)).join('')}
                                </div>
                            </div>

                            <div class="guidebook-panel">
                                <div class="guidebook-panel-kicker">OPERATOR</div>
                                <h3 class="guidebook-panel-title">${this.escapeHtml(operatorName)}</h3>
                                <div class="guidebook-panel-copy">Guidebook content is generated from your live mission data, so the instructions stay aligned with the current objectives and win conditions.</div>
                            </div>
                        </aside>

                        <section class="guidebook-content">
                            <div class="guidebook-panel guidebook-intro">
                                <div class="guidebook-panel-kicker">CORE LOOP</div>
                                <h3 class="guidebook-panel-title">Before You Start Any Mission</h3>
                                <div class="guidebook-steps">
                                    <div class="guidebook-step"><span>1</span><p>Open a mission and read the briefing first. That tells you what the level wants from you before pressure starts.</p></div>
                                    <div class="guidebook-step"><span>2</span><p>Watch the HUD during play: timer, AI progress, attempts, score, and hints all shape the mission pressure.</p></div>
                                    <div class="guidebook-step"><span>3</span><p>Clear the mission goal, review the learning summary, and unlock the next level in sequence.</p></div>
                                </div>
                            </div>

                            <div class="guidebook-section-stack">
                                ${sections.map((section) => this.renderSectionBlock(section)).join('')}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        `;

        this.bindEvents(container);
    }

    getGuideSections() {
        const sections = [
            {
                key: 'password',
                kicker: 'PASSWORD TRACK',
                title: 'Password Cracking',
                summary: 'Analyze human behavior, audit weak credentials, and clear password missions in sequence.',
                missions: this.game.passwordMissions || []
            },
            {
                key: 'malware',
                kicker: 'ZERO-DAY TRACK',
                title: 'Zero-Day Countdown',
                summary: 'Decode hostile payloads, classify attack patterns, and stop the exploit chain mission by mission.',
                missions: this.game.malwareMissions || []
            }
        ];

        return sections.filter((section) => section.missions.length > 0);
    }

    renderOverviewItems() {
        const items = [
            'Levels unlock in order inside each track. Clear the current mission to open the next one.',
            'Hints are limited per mission, so save them for moments where the pattern is unclear.',
            'Some levels are timed or pressure-based. Speed and recognition matter, not just correctness.',
            'The AI progress bar represents hostile pressure. If it finishes first, the mission fails.',
            'Winning missions grants XP and credits and usually shows a short learning summary afterward.'
        ];

        return items.map((item) => `<div class="guidebook-overview-item">${this.escapeHtml(item)}</div>`).join('');
    }

    getMissionAnchor(sectionKey, mission) {
        return `${sectionKey}-mission-${mission.level}`;
    }

    renderSectionIndexGroup(section) {
        return `
            <div class="guidebook-index-group">
                <div class="guidebook-index-group-label">${this.escapeHtml(section.title)}</div>
                <div class="guidebook-level-index">
                    ${section.missions.map((mission) => `
                        <button class="guidebook-index-btn ${mission.locked ? 'is-locked' : ''}" type="button" data-guidebook-target="${this.getMissionAnchor(section.key, mission)}">
                            <span class="guidebook-index-level">L${mission.level}</span>
                            <span class="guidebook-index-copy">
                                <strong>${this.escapeHtml(this.cleanLevelTitle(mission.title))}</strong>
                                <span>${mission.locked ? 'LOCKED' : mission.completed ? 'COMPLETE' : 'READY'}</span>
                            </span>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderSectionBlock(section) {
        return `
            <section class="guidebook-section-block">
                <div class="guidebook-panel guidebook-section-overview">
                    <div class="guidebook-panel-kicker">${this.escapeHtml(section.kicker)}</div>
                    <h3 class="guidebook-panel-title">${this.escapeHtml(section.title)}</h3>
                    <div class="guidebook-panel-copy guidebook-section-summary">${this.escapeHtml(section.summary)}</div>
                </div>

                <div class="guidebook-mission-list">
                    ${section.missions.map((mission) => this.renderMissionCard(section.key, mission)).join('')}
                </div>
            </section>
        `;
    }

    renderMissionCard(sectionKey, mission) {
        const hints = mission.hintSystem ? Object.values(mission.hintSystem).filter(Boolean) : [];
        const howToPlay = this.getHowToPlaySteps(mission);
        const statusLabel = mission.locked ? 'LOCKED' : mission.completed ? 'COMPLETE' : 'ACTIVE';

        return `
            <article class="guidebook-mission-card ${mission.locked ? 'is-locked' : ''}" id="${this.getMissionAnchor(sectionKey, mission)}">
                <div class="guidebook-mission-topline">
                    <span class="guidebook-mission-level">LEVEL ${mission.level}</span>
                    <span class="guidebook-mission-badge">${statusLabel}</span>
                </div>

                <h3 class="guidebook-mission-title">${this.escapeHtml(this.cleanLevelTitle(mission.title))}</h3>
                <p class="guidebook-mission-desc">${this.escapeHtml(mission.desc || '')}</p>

                <div class="guidebook-meta">
                    <span>${this.escapeHtml(String(mission.difficulty || '').toUpperCase())}</span>
                    <span>${this.escapeHtml(mission.estimatedTime || 'N/A')}</span>
                    <span>${this.escapeHtml(mission.puzzle?.interactionMode || 'standard')}</span>
                </div>

                <div class="guidebook-section">
                    <div class="guidebook-section-title">Goal</div>
                    <p>${this.escapeHtml(mission.objective || '')}</p>
                </div>

                <div class="guidebook-section">
                    <div class="guidebook-section-title">What You Do</div>
                    <p>${this.escapeHtml(mission.userTask || '')}</p>
                </div>

                <div class="guidebook-section">
                    <div class="guidebook-section-title">How To Play</div>
                    <div class="guidebook-bullet-list">
                        ${howToPlay.map((step) => `<div class="guidebook-bullet">${this.escapeHtml(step)}</div>`).join('')}
                    </div>
                </div>

                <div class="guidebook-section">
                    <div class="guidebook-section-title">Win Condition</div>
                    <p>${this.escapeHtml(mission.successCondition || '')}</p>
                </div>

                ${hints.length ? `
                    <div class="guidebook-section">
                        <div class="guidebook-section-title">Useful Tips</div>
                        <div class="guidebook-bullet-list">
                            ${hints.map((hint) => `<div class="guidebook-bullet">${this.escapeHtml(hint)}</div>`).join('')}
                        </div>
                    </div>
                ` : ''}
            </article>
        `;
    }

    getHowToPlaySteps(mission) {
        switch (mission.puzzle?.interactionMode) {
            case 'humanPsychologyLab':
                return [
                    'Read the analyst board and inspect each password candidate.',
                    'Mark every weak password based on human patterns like names, years, and common words.',
                    'Do not tag strong passwords by mistake.',
                    'Submit only when every weak credential is selected.'
                ];
            case 'singleChoice':
                return [
                    'Watch the live login stream and identify the attack pattern.',
                    'Flag the strongest evidence markers that prove what is happening.',
                    'Choose the correct attack type before Vault Integrity reaches zero.',
                    'Answer the containment follow-up to apply the best defense.'
                ];
            case 'predictionChoice':
                return [
                    'Compare the candidate passwords before the race starts.',
                    'Predict which password will break first.',
                    'Lock in your prediction and watch the simulated crack race.',
                    'Use the outcome to understand why stronger structures survive longer.'
                ];
            case 'investigation':
                return [
                    'Read the evidence panels carefully instead of reacting to one clue.',
                    'Correlate logs, user behavior, and policy gaps into a single breach story.',
                    'Choose the real breach cause.',
                    'Select the prevention step that would break the same attack chain next time.'
                ];
            case 'inspection':
                return [
                    'Inspect all storage or audit evidence panels first.',
                    'Compare the breach fallout for each design.',
                    'Identify the safer storage cluster rather than one isolated detail.',
                    'Choose the strongest remediation for password protection.'
                ];
            case 'saltReuseLab':
                return [
                    'Complete the salt demonstration before moving to the selection phase.',
                    'Observe how identical passwords stop sharing the same hash after salting.',
                    'Select all passwords that represent the highest reuse risk.',
                    'Submit only after separating risky repeated weak choices from safer ones.'
                ];
            case 'liveDefenseSimulation':
                return [
                    'Monitor attack waves in real time.',
                    'Trigger the best defense for each threat instead of guessing.',
                    'Manage energy so you can still react to later pressure spikes.',
                    'Survive the full duration with Vault Health above zero.'
                ];
            case 'threatHuntSimulation':
                return [
                    'Review multiple log streams and look for connected malicious behavior.',
                    'Mark attacker actions while avoiding unnecessary false positives.',
                    'Apply containment only when the evidence is strong enough.',
                    'Contain the major events and keep escalation and vault damage under control.'
                ];
            case 'livePatchSimulation':
                return [
                    'Inspect the architecture modules and the vulnerabilities tied to each one.',
                    'Apply patches to the right systems in the right order.',
                    'Deploy the staged fixes after patching.',
                    'Run exploit replay until exploit success rate is pushed into the safe zone.'
                ];
            case 'enterpriseArchitectureSimulation':
                return [
                    'Configure every enterprise control group, including policy, storage, MFA, login protection, and monitoring.',
                    'Balance security strength with usability and operational stability.',
                    'Run the full evaluation after your design is complete.',
                    'Review the final rating and recommendations to understand your tradeoffs.'
                ];
            default:
                return [
                    'Read the mission objective and understand the task.',
                    'Use the on-screen controls to complete the mission goal.',
                    'Watch the timer, score, and pressure indicators while you play.',
                    'Clear the success condition to progress.'
                ];
        }
    }

    bindEvents(container) {
        container.querySelectorAll('[data-guidebook-target]').forEach((button) => {
            button.addEventListener('click', () => {
                const targetId = button.dataset.guidebookTarget;
                const target = container.querySelector(`#${targetId}`);
                if (!target) return;

                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                target.classList.add('is-focused');
                window.setTimeout(() => target.classList.remove('is-focused'), 1400);
            });
        });
    }

    cleanLevelTitle(title) {
        return String(title || '').replace(/^LEVEL\s+\d+\s*:\s*/i, '').trim();
    }

    escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
}
