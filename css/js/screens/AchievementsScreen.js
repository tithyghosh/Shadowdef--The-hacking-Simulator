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
        const achievements = this.getAchievementDefinitions(stats);
        const unlockedCount = achievements.filter((achievement) => achievement.unlocked).length;
        const totalCount = achievements.length;
        const completion = totalCount ? (unlockedCount / totalCount) * 100 : 0;
        const activeAchievement = this.getLatestUnlocked(achievements);
        const nextAchievement = this.getNextAchievement(achievements);

        container.innerHTML = `
            <div class="achievements-screen-shell">
                <div class="achievements-screen-grid" aria-hidden="true"></div>
                <div class="achievements-screen-scanlines" aria-hidden="true"></div>

                <div class="achievements-screen-frame">
                    <div class="achievements-screen-header">
                        <button class="back-btn achievements-back-btn" data-action="back" type="button">BACK</button>

                        <div class="achievements-screen-title-wrap">
                            <div class="achievements-screen-kicker">// OPERATIONS VAULT</div>
                            <h2 class="achievements-screen-title">BADGES</h2>
                            <p class="achievements-screen-subtitle">Live achievement vault for the current game build. Every badge on this screen is tied to a real unlock rule already enforced by mission completion, score, speed, playtime, or credit milestones.</p>
                        </div>

                        <div class="achievements-screen-status">
                            <span class="achievements-status-chip ${user ? 'is-online' : 'is-guest'}">${user ? 'AUTH LINKED' : 'GUEST MODE'}</span>
                            <span class="achievements-status-chip is-live">${unlockedCount}/${totalCount} SECURED</span>
                        </div>
                    </div>

                    <div class="achievements-hero">
                        <div class="achievements-hero-panel">
                            <div class="achievements-hero-ring" aria-hidden="true"></div>
                            <div class="achievements-hero-core">
                                <div class="achievements-hero-value">${unlockedCount}<span>/${totalCount}</span></div>
                                <div class="achievements-hero-label">BADGES SECURED</div>
                            </div>
                            <div class="achievements-hero-progress">
                                <div class="achievements-hero-progress-bar" style="width:${completion.toFixed(1)}%"></div>
                            </div>
                        </div>

                        <div class="achievements-summary-grid">
                            <div class="achievements-summary-card">
                                <div class="achievements-summary-label">MISSIONS</div>
                                <div class="achievements-summary-value">${stats.missionsCompleted || 0}</div>
                            </div>
                            <div class="achievements-summary-card">
                                <div class="achievements-summary-label">HIGH SCORE</div>
                                <div class="achievements-summary-value achievements-summary-value--tight">${this.formatNumber(stats.highScore || 0)}</div>
                            </div>
                            <div class="achievements-summary-card">
                                <div class="achievements-summary-label">FIELD TIME</div>
                                <div class="achievements-summary-value achievements-summary-value--tight">${this.formatPlaytime(stats.totalPlayTime || 0)}</div>
                            </div>
                            <div class="achievements-summary-card">
                                <div class="achievements-summary-label">CREDITS</div>
                                <div class="achievements-summary-value achievements-summary-value--tight">${this.formatNumber(stats.credits || 0)}</div>
                            </div>
                        </div>
                    </div>

                    <div class="achievements-content">
                        <section class="achievements-panel">
                            <div class="achievements-panel-head">
                                <div>
                                    <div class="achievements-panel-kicker">BADGE VAULT</div>
                                    <h3 class="achievements-panel-title">Current Unlock Set</h3>
                                </div>
                                <div class="achievements-panel-copy">${unlockedCount} unlocked | ${totalCount - unlockedCount} remaining</div>
                            </div>

                            <div class="achievements-grid">
                                ${achievements.map((achievement) => this.renderAchievementCard(achievement)).join('')}
                            </div>
                        </section>

                        <section class="achievements-side">
                            <div class="achievements-panel">
                                <div class="achievements-panel-head">
                                    <div>
                                        <div class="achievements-panel-kicker">ACTIVE BADGE</div>
                                        <h3 class="achievements-panel-title">Current Status</h3>
                                    </div>
                                </div>

                                ${activeAchievement ? `
                                    <div class="achievements-next-item">
                                        <div class="achievements-next-icon ${activeAchievement.tone}">${activeAchievement.icon}</div>
                                        <div class="achievements-next-copy">
                                            <div class="achievements-next-name">${activeAchievement.name}</div>
                                            <div class="achievements-next-desc">${activeAchievement.description}</div>
                                        </div>
                                    </div>
                                ` : `
                                    <div class="achievements-empty-note">No badge unlocked yet. Clear your first mission to open the vault.</div>
                                `}
                            </div>

                            <div class="achievements-panel achievements-next-panel">
                                <div class="achievements-panel-head">
                                    <div>
                                        <div class="achievements-panel-kicker">NEXT TARGET</div>
                                        <h3 class="achievements-panel-title">Recommended Push</h3>
                                    </div>
                                </div>

                                ${nextAchievement ? `
                                    <div class="achievements-next-item achievements-next-item--stack">
                                        <div class="achievements-next-icon ${nextAchievement.tone}">${nextAchievement.icon}</div>
                                        <div class="achievements-next-copy">
                                            <div class="achievements-next-name">${nextAchievement.name}</div>
                                            <div class="achievements-next-desc">${nextAchievement.description}</div>
                                        </div>
                                        <div class="achievement-card-progress-label">${nextAchievement.requirement}</div>
                                        <div class="achievement-card-progress-track">
                                            <div class="achievement-card-progress-bar" style="width:${nextAchievement.progress.toFixed(1)}%"></div>
                                        </div>
                                        <div class="achievements-next-meta">${nextAchievement.progressText}</div>
                                    </div>
                                ` : `
                                    <div class="achievements-empty-note">All current game achievements are unlocked.</div>
                                `}
                            </div>

                            <div class="achievements-panel achievements-rewards-panel">
                                <div class="achievements-panel-head">
                                    <div>
                                        <div class="achievements-panel-kicker">UNLOCK ORDER</div>
                                        <h3 class="achievements-panel-title">Progression Chain</h3>
                                    </div>
                                </div>

                                <div class="achievements-roadmap">
                                    ${achievements.map((achievement, index) => `
                                        <div class="achievements-roadmap-step ${achievement.unlocked ? 'is-unlocked' : ''}">
                                            <div class="achievements-roadmap-node ${achievement.tone}">${index + 1}</div>
                                            <div class="achievements-roadmap-copy">
                                                <div class="achievements-roadmap-name">${achievement.name}</div>
                                                <div class="achievements-roadmap-desc">${achievement.requirement}</div>
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
                                            <h3 class="achievements-panel-title">Save Badge Progress</h3>
                                        </div>
                                    </div>
                                    <p class="achievements-guest-copy">Login is required to persist achievement unlocks, credits, and long-session progress across devices.</p>
                                    <button class="btn btn-primary achievements-auth-btn" data-action="login" type="button">OPEN LOGIN</button>
                                </div>
                            `}
                        </section>
                    </div>
                </div>
            </div>
        `;
    }

    getAchievementDefinitions(stats) {
        const earned = new Set(stats.achievements || []);
        const missionsCompleted = stats.missionsCompleted || 0;
        const highScore = stats.highScore || 0;
        const totalPlayTime = stats.totalPlayTime || 0;
        const credits = stats.credits || 0;

        return [
            {
                id: 'first_mission',
                name: 'FIRST STEPS',
                shortName: 'FIRST STEPS',
                icon: '&#9889;',
                tone: 'tone-gold',
                unlocked: earned.has('first_mission') || missionsCompleted >= 1,
                requirement: 'Complete your first mission',
                description: 'Awarded the moment an operator successfully clears their first live training mission.',
                progress: this.toPercent(missionsCompleted, 1),
                progressText: `${Math.min(missionsCompleted, 1)}/1 mission clear`
            },
            {
                id: 'speed_demon',
                name: 'SPEED DEMON',
                shortName: 'SPEED DEMON',
                icon: '&#9888;',
                tone: 'tone-cyan',
                unlocked: earned.has('speed_demon'),
                requirement: 'Finish any mission in under 2 minutes',
                description: 'Performance badge for a fast clean clear under high time pressure.',
                progress: earned.has('speed_demon') ? 100 : 0,
                progressText: earned.has('speed_demon') ? 'Unlocked' : 'Best tracked only when achieved'
            },
            {
                id: 'perfectionist',
                name: 'PERFECTIONIST',
                shortName: 'PERFECTIONIST',
                icon: '&#10022;',
                tone: 'tone-green',
                unlocked: earned.has('perfectionist'),
                requirement: 'Complete any mission without using hints',
                description: 'Precision badge for clearing a mission without spending any hint charges.',
                progress: earned.has('perfectionist') ? 100 : 0,
                progressText: earned.has('perfectionist') ? 'Unlocked' : 'Requires a no-hint clear'
            },
            {
                id: 'high_scorer',
                name: 'HIGH SCORER',
                shortName: 'HIGH SCORER',
                icon: '&#127942;',
                tone: 'tone-purple',
                unlocked: earned.has('high_scorer') || highScore >= 10000,
                requirement: 'Reach a score of 10,000',
                description: 'Score-based badge for crossing the high-score threshold in mission play.',
                progress: this.toPercent(highScore, 10000),
                progressText: `${this.formatNumber(highScore)}/10,000`
            },
            {
                id: 'dedicated',
                name: 'DEDICATED PLAYER',
                shortName: 'DEDICATED',
                icon: '&#9201;',
                tone: 'tone-red',
                unlocked: earned.has('dedicated') || totalPlayTime >= 300,
                requirement: 'Accumulate 5 hours of total play time',
                description: 'Long-session badge granted after sustained play across repeated training runs.',
                progress: this.toPercent(totalPlayTime, 300),
                progressText: `${Math.min(totalPlayTime, 300)}/300 minutes`
            },
            {
                id: 'collector',
                name: 'CREDIT COLLECTOR',
                shortName: 'COLLECTOR',
                icon: '&#128176;',
                tone: 'tone-silver',
                unlocked: earned.has('collector') || credits >= 5000,
                requirement: 'Reach 5,000 credits',
                description: 'Economy badge for building up a strong credit reserve through mission rewards.',
                progress: this.toPercent(credits, 5000),
                progressText: `${this.formatNumber(credits)}/5,000 credits`
            }
        ];
    }

    getLatestUnlocked(achievements) {
        return [...achievements].reverse().find((achievement) => achievement.unlocked) || null;
    }

    getNextAchievement(achievements) {
        const locked = achievements.filter((achievement) => !achievement.unlocked);
        if (!locked.length) return null;

        locked.sort((a, b) => b.progress - a.progress);
        return locked[0];
    }

    renderAchievementCard(achievement) {
        return `
            <article class="achievement-card ${achievement.unlocked ? 'is-unlocked' : 'is-locked'}">
                <div class="achievement-card-head">
                    <div class="achievement-card-icon ${achievement.tone}">${achievement.icon}</div>
                    <div class="achievement-card-copy">
                        <div class="achievement-card-name">${achievement.name}</div>
                        <div class="achievement-card-state">${achievement.unlocked ? 'UNLOCKED' : 'LOCKED'}</div>
                    </div>
                </div>

                <p class="achievement-card-desc">${achievement.description}</p>

                <div class="achievement-card-foot">
                    <div class="achievement-card-progress-label">${achievement.requirement}</div>
                    <div class="achievement-card-progress-track">
                        <div class="achievement-card-progress-bar" style="width:${achievement.progress.toFixed(1)}%"></div>
                    </div>
                    <div class="achievement-card-progress-meta">${achievement.progressText}</div>
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

    formatNumber(value) {
        return Number(value || 0).toLocaleString();
    }

    formatPlaytime(minutes) {
        const safeMinutes = Math.max(0, Number(minutes || 0));
        const hours = Math.floor(safeMinutes / 60);
        const remainingMinutes = safeMinutes % 60;

        if (!hours) return `${remainingMinutes}M`;
        if (!remainingMinutes) return `${hours}H`;
        return `${hours}H ${remainingMinutes}M`;
    }
}
