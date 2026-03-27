/**
 * AchievementsScreen - Dedicated badge progression screen
 */

import { AuthManager } from '../core/AuthManager.js';

export class AchievementsScreen {
    constructor(game) {
        this.game = game;
        this.auth = AuthManager.getInstance();

        this.setupEventListeners();
    }

    render() {
        const container = document.getElementById('achievements-screen');
        if (!container) return;

        const user = this.auth.getCurrentUser();
        const stats = user?.gameStats || this.auth.getDefaultStats();
        const badges = this.getBadgeDefinitions(stats);
        const unlockedCount = badges.filter((badge) => badge.unlocked).length;
        const currentBadge = this.getCurrentBadge(badges);
        const nextBadge = badges.find((badge) => !badge.unlocked);

        container.innerHTML = `
            <div class="achievements-screen-shell">
                <div class="achievements-screen-grid" aria-hidden="true"></div>
                <div class="achievements-screen-scanlines" aria-hidden="true"></div>

                <div class="achievements-screen-frame">
                    <div class="achievements-screen-header">
                        <button class="back-btn achievements-back-btn" data-action="back" type="button">BACK</button>
                        <div class="achievements-screen-title-wrap">
                            <div class="achievements-screen-kicker">PROFILE BADGE SYSTEM</div>
                            <h2 class="achievements-screen-title">ACHIEVEMENTS</h2>
                            <p class="achievements-screen-subtitle">This screen now follows the same six badge progression used in the profile section, with unlocks based on your crossed mission and level milestones.</p>
                        </div>
                        <div class="achievements-screen-status">
                            <span class="achievements-status-chip ${user ? 'is-online' : 'is-guest'}">${user ? 'AUTH LINKED' : 'GUEST MODE'}</span>
                        </div>
                    </div>

                    <div class="achievements-hero">
                        <div class="achievements-hero-panel">
                            <div class="achievements-hero-ring" aria-hidden="true"></div>
                            <div class="achievements-hero-core">
                                <div class="achievements-hero-value">${unlockedCount}<span>/${badges.length}</span></div>
                                <div class="achievements-hero-label">BADGES SECURED</div>
                            </div>
                            <div class="achievements-hero-progress">
                                <div class="achievements-hero-progress-bar" style="width:${((unlockedCount / badges.length) * 100).toFixed(1)}%"></div>
                            </div>
                        </div>

                        <div class="achievements-summary-grid">
                            <div class="achievements-summary-card">
                                <div class="achievements-summary-label">LEVEL</div>
                                <div class="achievements-summary-value">${stats.level || 1}</div>
                            </div>
                            <div class="achievements-summary-card">
                                <div class="achievements-summary-label">MISSIONS</div>
                                <div class="achievements-summary-value">${stats.missionsCompleted || 0}</div>
                            </div>
                            <div class="achievements-summary-card">
                                <div class="achievements-summary-label">ACTIVE BADGE</div>
                                <div class="achievements-summary-value achievements-summary-value--tight">${currentBadge ? currentBadge.shortName : 'NONE'}</div>
                            </div>
                            <div class="achievements-summary-card">
                                <div class="achievements-summary-label">NEXT BADGE</div>
                                <div class="achievements-summary-value achievements-summary-value--tight">${nextBadge ? nextBadge.shortName : 'COMPLETE'}</div>
                            </div>
                        </div>
                    </div>

                    <div class="achievements-content">
                        <section class="achievements-panel">
                            <div class="achievements-panel-head">
                                <div>
                                    <div class="achievements-panel-kicker">BADGE VAULT</div>
                                    <h3 class="achievements-panel-title">Six Core Badges</h3>
                                </div>
                                <div class="achievements-panel-copy">${unlockedCount} unlocked | ${badges.length - unlockedCount} remaining</div>
                            </div>
                            <div class="achievements-grid">
                                ${badges.map((badge) => this.renderBadgeCard(badge)).join('')}
                            </div>
                        </section>

                        <section class="achievements-side">
                            <div class="achievements-panel achievements-next-panel">
                                <div class="achievements-panel-head">
                                    <div>
                                        <div class="achievements-panel-kicker">CURRENT TRACK</div>
                                        <h3 class="achievements-panel-title">Next Unlock</h3>
                                    </div>
                                </div>
                                ${nextBadge ? `
                                    <div class="achievements-next-item achievements-next-item--stack">
                                        <div class="achievements-next-icon ${nextBadge.tone}">${nextBadge.icon}</div>
                                        <div class="achievements-next-copy">
                                            <div class="achievements-next-name">${nextBadge.name}</div>
                                            <div class="achievements-next-desc">${nextBadge.description}</div>
                                        </div>
                                        <div class="achievement-card-progress-label">${nextBadge.requirement}</div>
                                        <div class="achievement-card-progress-track">
                                            <div class="achievement-card-progress-bar" style="width:${nextBadge.progress.toFixed(1)}%"></div>
                                        </div>
                                    </div>
                                ` : '<div class="achievements-empty-note">All six profile badges are unlocked.</div>'}
                            </div>

                            <div class="achievements-panel achievements-rewards-panel">
                                <div class="achievements-panel-head">
                                    <div>
                                        <div class="achievements-panel-kicker">ROADMAP</div>
                                        <h3 class="achievements-panel-title">Progression Order</h3>
                                    </div>
                                </div>
                                <div class="achievements-roadmap">
                                    ${badges.map((badge, index) => `
                                        <div class="achievements-roadmap-step ${badge.unlocked ? 'is-unlocked' : ''}">
                                            <div class="achievements-roadmap-node ${badge.tone}">${index + 1}</div>
                                            <div class="achievements-roadmap-copy">
                                                <div class="achievements-roadmap-name">${badge.name}</div>
                                                <div class="achievements-roadmap-desc">${badge.requirement}</div>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>

                            ${user ? '' : `
                                <div class="achievements-panel achievements-guest-panel">
                                    <div class="achievements-panel-head">
                                        <div>
                                            <div class="achievements-panel-kicker">SYNC REQUIRED</div>
                                            <h3 class="achievements-panel-title">Save Your Badges</h3>
                                        </div>
                                    </div>
                                    <p class="achievements-guest-copy">Sign in to persist badge unlocks and keep the achievements page synchronized with your profile progression.</p>
                                    <button class="btn btn-primary achievements-auth-btn" data-action="login" type="button">OPEN LOGIN</button>
                                </div>
                            `}
                        </section>
                    </div>
                </div>
            </div>
        `;
    }

    getBadgeDefinitions(stats) {
        const completed = stats.missionsCompleted || 0;
        const level = stats.level || 1;
        const earned = new Set(stats.achievements || []);

        return [
            {
                id: 'first_mission',
                shortName: 'FIRST BREACH',
                name: 'FIRST BREACH',
                icon: '&#9889;',
                tone: 'tone-gold',
                unlocked: completed > 0 || earned.has('first_mission'),
                requirement: 'Unlock requirement: Complete your first mission',
                description: 'Initial field badge awarded after your first successful mission clear.',
                progress: this.toPercent(completed, 1)
            },
            {
                id: 'cipher_breaker',
                shortName: 'CIPHER BREAKER',
                name: 'CIPHER BREAKER',
                icon: '&#128275;',
                tone: 'tone-cyan',
                unlocked: level >= 5 || earned.has('cipher_breaker'),
                requirement: 'Unlock requirement: Cross Level 5',
                description: 'Password specialization badge tied to the early level threshold shown in profile.',
                progress: this.toPercent(level, 5)
            },
            {
                id: 'phantom_strike',
                shortName: 'PHANTOM STRIKE',
                name: 'PHANTOM STRIKE',
                icon: '&#128293;',
                tone: 'tone-red',
                unlocked: earned.has('phantom_strike'),
                requirement: 'Unlock requirement: Malware strike badge milestone',
                description: 'Mid-tier offensive badge from the same six-badge profile progression line.',
                progress: earned.has('phantom_strike') ? 100 : 0
            },
            {
                id: 'ghost_protocol',
                shortName: 'GHOST PROTOCOL',
                name: 'GHOST PROTOCOL',
                icon: '&#128737;',
                tone: 'tone-green',
                unlocked: earned.has('ghost_protocol'),
                requirement: 'Unlock requirement: Network defense badge milestone',
                description: 'Defensive operations badge aligned with the profile achievements panel.',
                progress: earned.has('ghost_protocol') ? 100 : 0
            },
            {
                id: 'dark_net_legend',
                shortName: 'DARK NET LEGEND',
                name: 'DARK NET LEGEND',
                icon: '&#9760;',
                tone: 'tone-purple',
                unlocked: earned.has('dark_net_legend'),
                requirement: 'Unlock requirement: Advanced malware mastery badge',
                description: 'Late-stage badge awarded deeper into the malware progression branch.',
                progress: earned.has('dark_net_legend') ? 100 : 0
            },
            {
                id: 'shadow_master',
                shortName: 'SHADOW MASTER',
                name: 'SHADOW MASTER',
                icon: '&#128081;',
                tone: 'tone-silver',
                unlocked: earned.has('shadow_master'),
                requirement: 'Unlock requirement: Final mastery badge',
                description: 'Top-tier badge in the profile system, marking full SHADOWDEF mastery.',
                progress: earned.has('shadow_master') ? 100 : 0
            }
        ];
    }

    getCurrentBadge(badges) {
        return [...badges].reverse().find((badge) => badge.unlocked) || null;
    }

    renderBadgeCard(badge) {
        return `
            <article class="achievement-card ${badge.unlocked ? 'is-unlocked' : 'is-locked'}">
                <div class="achievement-card-head">
                    <div class="achievement-card-icon ${badge.tone}">${badge.icon}</div>
                    <div class="achievement-card-copy">
                        <div class="achievement-card-name">${badge.name}</div>
                        <div class="achievement-card-state">${badge.unlocked ? 'UNLOCKED' : 'LOCKED'}</div>
                    </div>
                </div>
                <p class="achievement-card-desc">${badge.description}</p>
                <div class="achievement-card-foot">
                    <div class="achievement-card-progress-label">${badge.requirement}</div>
                    <div class="achievement-card-progress-track">
                        <div class="achievement-card-progress-bar" style="width:${badge.progress.toFixed(1)}%"></div>
                    </div>
                </div>
            </article>
        `;
    }

    setupEventListeners() {
        const rerenderIfVisible = () => {
            const screen = document.getElementById('achievements-screen');
            if (screen?.classList.contains('active')) {
                this.render();
            }
        };

        document.addEventListener('shadowdef:auth:login', rerenderIfVisible);
        document.addEventListener('shadowdef:auth:logout', rerenderIfVisible);
        document.addEventListener('shadowdef:auth:statsUpdate', rerenderIfVisible);
    }

    toPercent(value, target) {
        if (!target) return 0;
        return Math.max(0, Math.min(100, (value / target) * 100));
    }
}
