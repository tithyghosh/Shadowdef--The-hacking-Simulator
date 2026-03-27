import { AuthManager } from '../core/AuthManager.js';

export class RadarScreen {
    constructor(game) {
        this.game = game;
        this.auth = AuthManager.getInstance();
        this.sectionMeta = {
            password: { title: 'Password Cracking', icon: '01', tone: 'tone-cyan' },
            malware: { title: 'Malware Detection', icon: '02', tone: 'tone-red' },
            network: { title: 'Network & Phishing', icon: '03', tone: 'tone-gold' }
        };
    }

    render() {
        const container = document.getElementById('radar-screen');
        if (!container) return;

        const settings = this.game?.state?.loadSettings?.() || {};
        const user = this.auth.getCurrentUser();
        const stats = user?.gameStats || this.auth.getDefaultStats();
        const operatorName = user?.displayName || user?.name || user?.email?.split('@')[0] || 'GUEST';

        const sectors = this.buildSectorSummaries();
        const targetState = this.getTargetState(sectors);
        const hotTargets = this.getHotTargets(sectors);
        const globalProgress = this.getGlobalProgress(sectors);

        container.innerHTML = `
            <div class="radar-screen-shell">
                <div class="radar-screen-grid" aria-hidden="true"></div>
                <div class="radar-screen-scanlines" aria-hidden="true"></div>
                <div class="radar-screen-frame">
                    <div class="radar-screen-header">
                        <button class="back-btn radar-back-btn" data-action="back" type="button">BACK</button>
                        <div class="radar-screen-title-wrap">
                            <div class="radar-screen-kicker">TACTICAL OVERVIEW</div>
                            <h2 class="radar-screen-title">RADAR</h2>
                            <p class="radar-screen-subtitle">Live scan of mission sectors, threat pressure, unlock state, and your next best target.</p>
                        </div>
                        <div class="radar-screen-status">
                            <span class="radar-status-chip ${user ? 'is-online' : 'is-guest'}">${user ? 'AUTH LINKED' : 'GUEST MODE'}</span>
                            <span class="radar-status-chip is-live">SCAN ONLINE</span>
                        </div>
                    </div>

                    <div class="radar-hero">
                        <div class="radar-hero-panel">
                            <div class="radar-hero-scope">
                                <div class="radar-scope-ring radar-scope-ring--outer"></div>
                                <div class="radar-scope-ring radar-scope-ring--mid"></div>
                                <div class="radar-scope-ring radar-scope-ring--inner"></div>
                                <div class="radar-scope-sweep"></div>
                                ${sectors.map((sector, index) => `
                                    <button class="radar-scope-node ${sector.meta.tone} ${sector.statusClass}" type="button" data-radar-category="${sector.id}" style="--node-x:${sector.scopeX}%;--node-y:${sector.scopeY}%;--node-delay:${index * 0.18}s" aria-label="Open ${sector.meta.title}">
                                        <span>${sector.meta.icon}</span>
                                    </button>
                                `).join('')}
                                <div class="radar-scope-core">
                                    <div class="radar-scope-core-label">${targetState.kicker}</div>
                                    <div class="radar-scope-core-title${targetState.isMultiLine ? ' radar-scope-core-title--multiline' : ''}">${targetState.displayTitle}</div>
                                    <div class="radar-scope-core-copy">${targetState.copy}</div>
                                    <div class="radar-scope-core-tags">
                                        <span>${globalProgress.completed}/${globalProgress.total} COMPLETE</span>
                                        <span>${globalProgress.unlocked} LIVE</span>
                                        <span>${globalProgress.locked} LOCKED</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="radar-hero-summary">
                            <div class="radar-summary-card">
                                <div class="radar-summary-label">OPERATOR</div>
                                <div class="radar-summary-value radar-summary-value--tight">${operatorName}</div>
                            </div>
                            <div class="radar-summary-card">
                                <div class="radar-summary-label">LEVEL</div>
                                <div class="radar-summary-value">${stats.level || 1}</div>
                            </div>
                            <div class="radar-summary-card">
                                <div class="radar-summary-label">MISSIONS</div>
                                <div class="radar-summary-value">${globalProgress.completed}<span>/${globalProgress.total}</span></div>
                            </div>
                            <div class="radar-summary-card">
                                <div class="radar-summary-label">CREDITS</div>
                                <div class="radar-summary-value">${stats.credits || 0}</div>
                            </div>
                        </div>
                    </div>

                    <div class="radar-content">
                        <section class="radar-panel">
                            <div class="radar-panel-head">
                                <div>
                                    <div class="radar-panel-kicker">SECTOR MAP</div>
                                    <h3 class="radar-panel-title">Threat Categories</h3>
                                </div>
                                <div class="radar-panel-copy">${globalProgress.unlocked} live | ${globalProgress.locked} locked | ${globalProgress.total - globalProgress.completed} unresolved</div>
                            </div>
                            <div class="radar-sector-grid">
                                ${sectors.map((sector) => this.renderSectorCard(sector)).join('')}
                            </div>
                        </section>

                        <section class="radar-side">
                            <div class="radar-panel radar-next-panel">
                                <div class="radar-panel-head">
                                    <div>
                                        <div class="radar-panel-kicker">PRIORITY VECTOR</div>
                                        <h3 class="radar-panel-title">Recommended Mission</h3>
                                    </div>
                                </div>
                                ${targetState.kind === 'available' ? `
                                    <div class="radar-next-target ${targetState.mission.meta.tone}">
                                        <div class="radar-next-sector">${targetState.mission.meta.title}</div>
                                        <div class="radar-next-title">${targetState.panelTitle}</div>
                                        <div class="radar-next-copy">${targetState.mission.desc}</div>
                                        <div class="radar-next-meta">
                                            <span>LEVEL ${targetState.mission.level}</span>
                                            <span>${String(targetState.mission.difficulty || '').toUpperCase()}</span>
                                            <span>${targetState.mission.estimatedTime || 'N/A'}</span>
                                        </div>
                                        <div class="radar-next-actions">
                                            <button class="btn btn-primary" type="button" data-radar-open-mission="${targetState.mission.id}" data-radar-section="${targetState.mission.section}">OPEN MISSION</button>
                                            <button class="btn" type="button" data-radar-category="${targetState.mission.section}">OPEN SECTOR</button>
                                        </div>
                                    </div>
                                ` : targetState.kind === 'locked' ? `
                                    <div class="radar-next-target ${targetState.mission.meta.tone}">
                                        <div class="radar-next-sector">LOCKED VECTOR</div>
                                        <div class="radar-next-title">${targetState.panelTitle}</div>
                                        <div class="radar-next-copy">${targetState.copy}</div>
                                        <div class="radar-next-meta">
                                            <span>LEVEL ${targetState.mission.level}</span>
                                            <span>${String(targetState.mission.difficulty || '').toUpperCase()}</span>
                                            <span>${targetState.mission.meta.title}</span>
                                        </div>
                                        <div class="radar-next-actions">
                                            <button class="btn" type="button" data-radar-category="${targetState.mission.section}">OPEN SECTOR</button>
                                        </div>
                                    </div>
                                ` : '<div class="radar-empty-state">All tracked sectors are complete. No unresolved targets remain.</div>'}
                            </div>

                            <div class="radar-panel">
                                <div class="radar-panel-head">
                                    <div>
                                        <div class="radar-panel-kicker">SYSTEM MODIFIERS</div>
                                        <h3 class="radar-panel-title">Gameplay State</h3>
                                    </div>
                                </div>
                                <div class="radar-chip-grid">
                                    <div class="radar-chip ${settings.timerEnabled !== false ? 'is-on' : 'is-off'}"><span class="radar-chip-label">TIMER</span><span class="radar-chip-value">${settings.timerEnabled !== false ? 'ON' : 'OFF'}</span></div>
                                    <div class="radar-chip ${settings.showHints !== false ? 'is-on' : 'is-off'}"><span class="radar-chip-label">HINTS</span><span class="radar-chip-value">${settings.showHints !== false ? 'ON' : 'OFF'}</span></div>
                                    <div class="radar-chip ${settings.musicEnabled !== false ? 'is-on' : 'is-off'}"><span class="radar-chip-label">MUSIC</span><span class="radar-chip-value">${settings.musicEnabled !== false ? 'ON' : 'OFF'}</span></div>
                                    <div class="radar-chip is-neutral"><span class="radar-chip-label">DIFFICULTY</span><span class="radar-chip-value">${String(settings.difficulty || 'medium').toUpperCase()}</span></div>
                                </div>
                                <div class="radar-inline-actions">
                                    <button class="btn" type="button" data-action="settings">OPEN SETTINGS</button>
                                </div>
                            </div>

                            <div class="radar-panel">
                                <div class="radar-panel-head">
                                    <div>
                                        <div class="radar-panel-kicker">HOT TARGETS</div>
                                        <h3 class="radar-panel-title">Mission Queue</h3>
                                    </div>
                                </div>
                                <div class="radar-target-list">
                                    ${hotTargets.map((target, index) => `
                                        <button class="radar-target-row" type="button" data-radar-open-mission="${target.id}" data-radar-section="${target.section}">
                                            <span class="radar-target-index">0${index + 1}</span>
                                            <span class="radar-target-copy">
                                                <strong>${target.title}</strong>
                                                <span>${target.meta.title} - ${String(target.difficulty || '').toUpperCase()}</span>
                                            </span>
                                            <span class="radar-target-time">${target.estimatedTime || 'N/A'}</span>
                                        </button>
                                    `).join('') || '<div class="radar-empty-state">No pending targets remain.</div>'}
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        `;

        this.bindEvents(container);
    }

    buildSectorSummaries() {
        return ['password', 'malware', 'network'].map((sectionId, index) => {
            const missions = this.getSectionMissions(sectionId);
            const completed = missions.filter((mission) => mission.completed).length;
            const unlocked = missions.filter((mission) => !mission.locked).length;
            const unresolved = missions.filter((mission) => !mission.completed).length;
            const available = missions.filter((mission) => !mission.locked && !mission.completed);
            const nextMission = available[0] || null;
            const threat = this.getThreatState(missions, completed, unresolved, nextMission);
            const orbitPositions = [{ x: 28, y: 30 }, { x: 69, y: 22 }, { x: 61, y: 73 }];

            return {
                id: sectionId,
                meta: this.sectionMeta[sectionId],
                missions,
                completed,
                unlocked,
                total: missions.length,
                unresolved,
                availableCount: available.length,
                nextMission,
                progress: missions.length ? (completed / missions.length) * 100 : 0,
                threatLabel: threat.label,
                statusClass: threat.className,
                threatScore: threat.score,
                scopeX: orbitPositions[index].x,
                scopeY: orbitPositions[index].y
            };
        });
    }

    getThreatState(missions, completed, unresolved, nextMission) {
        if (!missions.length || completed === missions.length) return { label: 'SECURED', className: 'is-secured', score: 0 };

        const remainingRatio = unresolved / missions.length;
        const difficultyWeight = this.getDifficultyWeight(nextMission?.difficulty);
        const score = (remainingRatio * 70) + (difficultyWeight * 10);

        if (score >= 70) return { label: 'HIGH', className: 'is-high', score };
        if (score >= 45) return { label: 'ELEVATED', className: 'is-elevated', score };
        return { label: 'STABLE', className: 'is-stable', score };
    }

    getRecommendedMission(sectors) {
        const ranked = sectors.filter((sector) => sector.nextMission).sort((a, b) => {
            if (b.threatScore !== a.threatScore) return b.threatScore - a.threatScore;
            return a.nextMission.level - b.nextMission.level;
        });
        if (!ranked.length) return null;
        return { ...ranked[0].nextMission, section: ranked[0].id, meta: ranked[0].meta };
    }

    getTargetState(sectors) {
        const availableMission = this.getRecommendedMission(sectors);
        if (availableMission) {
            return {
                kind: 'available',
                kicker: 'NEXT TARGET',
                title: availableMission.title,
                panelTitle: this.getCompactPanelTitle(availableMission.title),
                displayTitle: this.formatScopeTitle(availableMission.title),
                isMultiLine: this.isLongScopeTitle(availableMission.title),
                copy: availableMission.desc,
                mission: availableMission
            };
        }

        const lockedMission = sectors
            .map((sector) => {
                const locked = sector.missions.find((mission) => mission.locked && !mission.completed);
                return locked ? { ...locked, section: sector.id, meta: sector.meta } : null;
            })
            .filter(Boolean)
            .sort((a, b) => a.level - b.level)[0];

        if (lockedMission) {
            const cleanTitle = lockedMission.title.replace(/^LEVEL\s+\d+:\s*/i, '');
            return {
                kind: 'locked',
                kicker: 'LOCKED VECTOR',
                title: cleanTitle,
                panelTitle: cleanTitle,
                displayTitle: this.formatScopeTitle(cleanTitle),
                isMultiLine: this.isLongScopeTitle(cleanTitle),
                copy: 'No live mission is available in this sector yet. Complete open missions to unlock this target.',
                mission: lockedMission
            };
        }

        return {
            kind: 'secured',
            kicker: 'SECTOR STATUS',
            title: 'GRID SECURED',
            panelTitle: 'GRID SECURED',
            displayTitle: 'GRID SECURED',
            isMultiLine: false,
            copy: 'All currently tracked sectors are complete.'
        };
    }

    getHotTargets(sectors) {
        return sectors.filter((sector) => sector.nextMission).sort((a, b) => {
            if (b.threatScore !== a.threatScore) return b.threatScore - a.threatScore;
            return a.nextMission.level - b.nextMission.level;
        }).slice(0, 3).map((sector) => ({ ...sector.nextMission, section: sector.id, meta: sector.meta }));
    }

    getGlobalProgress(sectors) {
        return sectors.reduce((acc, sector) => {
            acc.total += sector.total;
            acc.completed += sector.completed;
            acc.unlocked += sector.unlocked;
            acc.locked += Math.max(0, sector.total - sector.unlocked);
            return acc;
        }, { total: 0, completed: 0, unlocked: 0, locked: 0 });
    }

    renderSectorCard(sector) {
        return `
            <button class="radar-sector-card ${sector.meta.tone} ${sector.statusClass}" type="button" data-radar-category="${sector.id}">
                <div class="radar-sector-topline">
                    <span class="radar-sector-index">${sector.meta.icon}</span>
                    <span class="radar-sector-threat">${sector.threatLabel}</span>
                </div>
                <div class="radar-sector-title">${sector.meta.title}</div>
                <div class="radar-sector-copy">${sector.nextMission ? sector.nextMission.title : 'All missions in this sector are secured.'}</div>
                <div class="radar-sector-progress">
                    <div class="radar-sector-progress-track"><div class="radar-sector-progress-bar" style="width:${sector.progress.toFixed(1)}%"></div></div>
                    <div class="radar-sector-progress-meta">${sector.completed}/${sector.total} complete - ${sector.availableCount} live</div>
                </div>
                <div class="radar-sector-stats">
                    <span>Unlocked ${sector.unlocked}</span>
                    <span>Open ${sector.unresolved}</span>
                    <span>${sector.nextMission ? `L${sector.nextMission.level}` : 'DONE'}</span>
                </div>
            </button>
        `;
    }

    bindEvents(container) {
        container.querySelectorAll('[data-radar-category]').forEach((button) => {
            button.addEventListener('click', () => {
                const category = button.dataset.radarCategory;
                if (category) this.game.showCategoryMissions(category);
            });
        });

        container.querySelectorAll('[data-radar-open-mission]').forEach((button) => {
            button.addEventListener('click', () => {
                const missionId = Number(button.dataset.radarOpenMission);
                const section = button.dataset.radarSection;
                const mission = this.getSectionMissions(section).find((item) => item.id === missionId);
                if (!mission) return;
                this.game.currentSection = section;
                this.game.missionSelectScreen.showBriefing(mission);
            });
        });
    }

    getSectionMissions(section) {
        switch (section) {
            case 'password':
                return this.game.passwordMissions || [];
            case 'malware':
                return this.game.malwareMissions || [];
            case 'network':
                return this.game.networkMissions || [];
            default:
                return [];
        }
    }

    getDifficultyWeight(difficulty) {
        switch (String(difficulty || '').toLowerCase()) {
            case 'hard':
                return 3;
            case 'medium':
                return 2;
            case 'easy':
                return 1;
            default:
                return 1;
        }
    }

    isLongScopeTitle(title) {
        return String(title || '').trim().split(/\s+/).length > 2 || String(title || '').length > 20;
    }

    formatScopeTitle(title) {
        const words = String(title || '').trim().split(/\s+/).filter(Boolean);
        if (!words.length) return 'GRID SECURED';
        if (words.length <= 2 && title.length <= 20) return title;

        const lines = [];
        let currentLine = [];

        words.forEach((word) => {
            const nextLine = [...currentLine, word].join(' ');
            if (currentLine.length && nextLine.length > 14) {
                lines.push(currentLine.join(' '));
                currentLine = [word];
            } else {
                currentLine.push(word);
            }
        });

        if (currentLine.length) {
            lines.push(currentLine.join(' '));
        }

        return lines.slice(0, 3).map((line) => `<span>${line}</span>`).join('');
    }

    getCompactPanelTitle(title) {
        return String(title || '').replace(/^LEVEL\s+\d+:\s*/i, '').trim();
    }
}
