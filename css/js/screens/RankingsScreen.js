import { AuthManager } from '../core/AuthManager.js';

export class RankingsScreen {
    constructor(game) {
        this.game = game;
        this.auth = AuthManager.getInstance();

        this.setupEventListeners();
    }

    render() {
        const container = document.getElementById('rankings-screen');
        if (!container) return;

        const user = this.auth.getCurrentUser();
        const stats = user?.gameStats || this.auth.getDefaultStats();
        const rankState = this.getOperatorRankState(stats);
        const scoreRank = this.game.score.getScoreRank(stats.highScore || 0);
        const nextRank = rankState.nextRank;

        container.innerHTML = `
            <div class="rankings-screen-shell">
                <div class="rankings-screen-grid" aria-hidden="true"></div>
                <div class="rankings-screen-scanlines" aria-hidden="true"></div>

                <div class="rankings-screen-frame">
                    <div class="rankings-screen-header">
                        <button class="back-btn rankings-back-btn" data-action="back" type="button">BACK</button>

                        <div class="rankings-screen-title-wrap">
                            <div class="rankings-screen-kicker">// COMMAND RANKING BOARD</div>
                            <h2 class="rankings-screen-title">RANKINGS</h2>
                            <p class="rankings-screen-subtitle">Operator status built from your actual campaign level, missions cleared, badge count, total score, and personal best mission performance.</p>
                        </div>

                        <div class="rankings-screen-status">
                            <span class="rankings-status-chip ${user ? 'is-online' : 'is-guest'}">${user ? 'AUTH LINKED' : 'GUEST MODE'}</span>
                            <span class="rankings-status-chip is-live">${rankState.current.name}</span>
                        </div>
                    </div>

                    <div class="rankings-hero">
                        <div class="rankings-hero-panel">
                            <div class="rankings-hero-ring" aria-hidden="true"></div>
                            <div class="rankings-hero-core">
                                <div class="rankings-hero-rank">${rankState.current.short}</div>
                                <div class="rankings-hero-label">${rankState.current.name}</div>
                                <div class="rankings-hero-meta">Level ${stats.level || 1} · ${stats.missionsCompleted || 0} missions cleared</div>
                            </div>
                            <div class="rankings-hero-progress">
                                <div class="rankings-hero-progress-bar" style="width:${rankState.progress.toFixed(1)}%"></div>
                            </div>
                        </div>

                        <div class="rankings-summary-grid">
                            <div class="rankings-summary-card">
                                <div class="rankings-summary-label">PERFORMANCE CLASS</div>
                                <div class="rankings-summary-value" style="color:${scoreRank.color}">${scoreRank.rank}</div>
                                <div class="rankings-summary-sub">${scoreRank.name}</div>
                            </div>
                            <div class="rankings-summary-card">
                                <div class="rankings-summary-label">HIGH SCORE</div>
                                <div class="rankings-summary-value rankings-summary-value--tight">${this.formatNumber(stats.highScore || 0)}</div>
                                <div class="rankings-summary-sub">Best mission result</div>
                            </div>
                            <div class="rankings-summary-card">
                                <div class="rankings-summary-label">TOTAL SCORE</div>
                                <div class="rankings-summary-value rankings-summary-value--tight">${this.formatNumber(stats.totalScore || 0)}</div>
                                <div class="rankings-summary-sub">Career accumulation</div>
                            </div>
                            <div class="rankings-summary-card">
                                <div class="rankings-summary-label">BADGES</div>
                                <div class="rankings-summary-value rankings-summary-value--tight">${(stats.achievements || []).length}</div>
                                <div class="rankings-summary-sub">Unlocked achievements</div>
                            </div>
                        </div>
                    </div>

                    <div class="rankings-content">
                        <section class="rankings-panel">
                            <div class="rankings-panel-head">
                                <div>
                                    <div class="rankings-panel-kicker">RANK LADDER</div>
                                    <h3 class="rankings-panel-title">Operator Promotion Track</h3>
                                </div>
                                <div class="rankings-panel-copy">${rankState.current.name} active${nextRank ? ` | next: ${nextRank.name}` : ' | max rank secured'}</div>
                            </div>

                            <div class="rankings-track">
                                ${rankState.ranks.map((rank, index) => `
                                    <div class="rankings-track-step ${index <= rankState.currentIndex ? 'is-complete' : ''} ${index === rankState.currentIndex ? 'is-current' : ''}">
                                        <div class="rankings-track-node ${rank.tone}">${index < rankState.currentIndex ? '&#10003;' : rank.short}</div>
                                        <div class="rankings-track-copy">
                                            <div class="rankings-track-name">${rank.name}</div>
                                            <div class="rankings-track-desc">${rank.requirement}</div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>

                            <div class="rankings-grade-board">
                                <div class="rankings-grade-title">Mission Score Grades</div>
                                <div class="rankings-grade-grid">
                                    ${this.getScoreBands().map((band) => `
                                        <div class="rankings-grade-card ${scoreRank.rank === band.rank ? 'is-active' : ''}">
                                            <div class="rankings-grade-rank" style="color:${band.color}">${band.rank}</div>
                                            <div class="rankings-grade-name">${band.name}</div>
                                            <div class="rankings-grade-range">${band.range}</div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </section>

                        <section class="rankings-side">
                            <div class="rankings-panel">
                                <div class="rankings-panel-head">
                                    <div>
                                        <div class="rankings-panel-kicker">NEXT PROMOTION</div>
                                        <h3 class="rankings-panel-title">Promotion Brief</h3>
                                    </div>
                                </div>

                                ${nextRank ? `
                                    <div class="rankings-next-item">
                                        <div class="rankings-next-icon ${nextRank.tone}">${nextRank.short}</div>
                                        <div class="rankings-next-copy">
                                            <div class="rankings-next-name">${nextRank.name}</div>
                                            <div class="rankings-next-desc">${nextRank.requirement}</div>
                                        </div>
                                        <div class="rankings-next-bar">
                                            <div class="rankings-next-bar-fill" style="width:${rankState.progress.toFixed(1)}%"></div>
                                        </div>
                                        <div class="rankings-next-meta">${rankState.progressText}</div>
                                    </div>
                                ` : `
                                    <div class="rankings-empty-note">You are already at the highest operator rank in the current campaign build.</div>
                                `}
                            </div>

                            <div class="rankings-panel">
                                <div class="rankings-panel-head">
                                    <div>
                                        <div class="rankings-panel-kicker">CAREER SNAPSHOT</div>
                                        <h3 class="rankings-panel-title">Field Metrics</h3>
                                    </div>
                                </div>

                                <div class="rankings-metric-list">
                                    <div class="rankings-metric-row"><span>Experience</span><strong>${this.formatNumber(stats.experience || 0)} XP</strong></div>
                                    <div class="rankings-metric-row"><span>Credits</span><strong>${this.formatNumber(stats.credits || 0)}</strong></div>
                                    <div class="rankings-metric-row"><span>Play Time</span><strong>${this.formatPlaytime(stats.totalPlayTime || 0)}</strong></div>
                                    <div class="rankings-metric-row"><span>Completed Missions</span><strong>${stats.missionsCompleted || 0}</strong></div>
                                    <div class="rankings-metric-row"><span>Unlocked Badges</span><strong>${(stats.achievements || []).length}</strong></div>
                                </div>
                            </div>

                            <div class="rankings-panel">
                                <div class="rankings-panel-head">
                                    <div>
                                        <div class="rankings-panel-kicker">OPERATOR NOTES</div>
                                        <h3 class="rankings-panel-title">How Ranking Works</h3>
                                    </div>
                                </div>

                                <div class="rankings-note-list">
                                    <div class="rankings-note">Operator rank tracks campaign progression through level and mission milestones.</div>
                                    <div class="rankings-note">Performance class tracks your best mission score using the same score-grade logic used in results screens.</div>
                                    <div class="rankings-note">Badges and credits do not directly set rank, but they reflect mastery and long-term progression.</div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        `;
    }

    getOperatorRankState(stats) {
        const level = stats.level || 1;
        const missionsCompleted = stats.missionsCompleted || 0;
        const progressValue = Math.max(level, missionsCompleted);
        const ranks = [
            { name: 'ROOKIE', short: 'R1', threshold: 1, tone: 'tone-silver', requirement: 'Default entry rank at Level 1' },
            { name: 'AGENT', short: 'A2', threshold: 2, tone: 'tone-cyan', requirement: 'Reach Level 2 or clear 2 missions' },
            { name: 'OPERATIVE', short: 'O4', threshold: 4, tone: 'tone-green', requirement: 'Reach Level 4 or clear 4 missions' },
            { name: 'SPECIALIST', short: 'S6', threshold: 6, tone: 'tone-purple', requirement: 'Reach Level 6 or clear 6 missions' },
            { name: 'ELITE', short: 'E8', threshold: 8, tone: 'tone-gold', requirement: 'Reach Level 8 or clear 8 missions' },
            { name: 'SHADOW MASTER', short: 'SM', threshold: 10, tone: 'tone-red', requirement: 'Reach Level 10 or clear all 10 missions' }
        ];

        let currentIndex = 0;
        ranks.forEach((rank, index) => {
            if (progressValue >= rank.threshold) {
                currentIndex = index;
            }
        });

        const current = ranks[currentIndex];
        const nextRank = ranks[currentIndex + 1] || null;
        let progress = 100;
        let progressText = 'Maximum rank achieved';

        if (nextRank) {
            const span = Math.max(1, nextRank.threshold - current.threshold);
            progress = ((progressValue - current.threshold) / span) * 100;
            progress = Math.max(0, Math.min(100, progress));
            progressText = `${Math.max(0, nextRank.threshold - progressValue)} more milestone step${nextRank.threshold - progressValue === 1 ? '' : 's'} to ${nextRank.name}`;
        }

        return { ranks, currentIndex, current, nextRank, progress, progressText };
    }

    getScoreBands() {
        return [
            { rank: 'S', name: 'ELITE', range: '9,000+', color: '#FFD700' },
            { rank: 'A+', name: 'MASTER', range: '7,500-8,999', color: '#00ff41' },
            { rank: 'A', name: 'EXPERT', range: '6,000-7,499', color: '#00f3ff' },
            { rank: 'B', name: 'PROFICIENT', range: '4,500-5,999', color: '#8b5cf6' },
            { rank: 'C', name: 'COMPETENT', range: '3,000-4,499', color: '#ff6b35' },
            { rank: 'D/F', name: 'NOVICE-BEGINNER', range: '0-2,999', color: '#94a3b8' }
        ];
    }

    setupEventListeners() {
        const rerenderIfVisible = () => {
            const screen = document.getElementById('rankings-screen');
            if (screen?.classList.contains('active')) {
                this.render();
            }
        };

        document.addEventListener('shadowdef:auth:login', rerenderIfVisible);
        document.addEventListener('shadowdef:auth:logout', rerenderIfVisible);
        document.addEventListener('shadowdef:auth:statsUpdate', rerenderIfVisible);
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
