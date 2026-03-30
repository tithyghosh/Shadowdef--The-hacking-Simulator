import { AuthManager } from '../core/AuthManager.js';

export class RankingsScreen {
    constructor(game) {
        this.game = game;
        this.auth = AuthManager.getInstance();
        this.clockInterval = null;

        this.setupEventListeners();
    }

    render() {
        const container = document.getElementById('rankings-screen');
        if (!container) return;

        this.stopClock();

        const user = this.auth.getCurrentUser();
        const stats = user?.gameStats || this.auth.getDefaultStats();
        const rankState = this.getOperatorRankState(stats);
        const scoreRank = this.game.score.getScoreRank(stats.highScore || 0);
        const progressPercent = this.getLevelProgress(stats);
        const displayName = this.getDisplayName(user);
        const operatorId = this.getOperatorId(user);
        const initials = this.getInitials(displayName);
        const leaderboardEntries = this.getLeaderboardEntries(user, stats);
        const currentUserEntry = leaderboardEntries.find((entry) => entry.isCurrentUser);
        const nextRank = rankState.nextRank;

        container.innerHTML = `
            <div class="sd-rankings-shell">
                <div class="sd-rankings-scanlines" aria-hidden="true"></div>

                <nav class="sd-rankings-nav">
                    <div class="sd-rankings-nav-logo">S H A D O W D E F</div>
                    <div class="sd-rankings-nav-right">
                        <button class="sd-rankings-back" data-action="back" type="button">BACK</button>
                        <div class="sd-rankings-clock" id="rankings-clock">--:--:--</div>
                    </div>
                </nav>

                <div class="sd-rankings-page">
                    <section class="sd-rankings-col sd-rankings-col--left">
                        <div class="sd-rankings-hero">
                            <div class="sd-rank-display">
                                <div class="sd-rank-ring sd-rank-ring--outer"></div>
                                <div class="sd-rank-ring sd-rank-ring--mid"></div>
                                <div class="sd-rank-center">
                                    <div class="sd-rank-badge">${rankState.current.short}</div>
                                    <div class="sd-rank-sub">${rankState.current.name}</div>
                                </div>
                                <div class="sd-rank-glow"></div>
                            </div>

                            <div class="sd-rankings-name">${this.escapeHtml(displayName.toUpperCase())}</div>
                            <div class="sd-rankings-handle">// OPERATOR ID - ${this.escapeHtml(operatorId)}</div>

                            <div class="sd-rankings-quick-stats">
                                <div class="sd-qs-cell">
                                    <div class="sd-qs-val ${stats.highScore ? '' : 'is-dim'}">${stats.highScore ? this.formatNumber(stats.highScore) : '--'}</div>
                                    <div class="sd-qs-label">HIGH SCORE</div>
                                </div>
                                <div class="sd-qs-cell">
                                    <div class="sd-qs-val ${stats.totalScore ? '' : 'is-dim'}">${stats.totalScore ? this.formatNumber(stats.totalScore) : '--'}</div>
                                    <div class="sd-qs-label">TOTAL SCORE</div>
                                </div>
                                <div class="sd-qs-cell">
                                    <div class="sd-qs-val ${stats.missionsCompleted ? '' : 'is-dim'}">${stats.missionsCompleted || 0}</div>
                                    <div class="sd-qs-label">MISSIONS</div>
                                </div>
                                <div class="sd-qs-cell">
                                    <div class="sd-qs-val ${(stats.achievements || []).length ? '' : 'is-dim'}">${(stats.achievements || []).length}/6</div>
                                    <div class="sd-qs-label">BADGES</div>
                                </div>
                            </div>

                            <div class="sd-xp-section">
                                <div class="sd-xp-row">
                                    <span class="sd-xp-label">XP PROGRESS</span>
                                    <span class="sd-xp-value">${stats.experience || 0} / ${this.getNextLevelXP(stats)}</span>
                                </div>
                                <div class="sd-xp-track">
                                    <div class="sd-xp-fill" style="--w:${progressPercent.toFixed(1)}%"></div>
                                </div>
                                <div class="sd-xp-milestones">
                                    ${rankState.ranks.slice(0, 5).map((rank, index) => `
                                        <span class="sd-xp-ms ${index === rankState.currentIndex ? 'is-current' : ''}">${rank.short.replace(/[0-9]/g, '') || rank.short}</span>
                                    `).join('')}
                                </div>
                            </div>

                            <div class="sd-perf-row">
                                <div class="sd-perf-item">
                                    <div class="sd-perf-val ${this.getScoreRankTone(scoreRank)}">${this.escapeHtml(scoreRank.rank)}</div>
                                    <div class="sd-perf-label">CLASS</div>
                                </div>
                                <div class="sd-perf-divider"></div>
                                <div class="sd-perf-item">
                                    <div class="sd-perf-val ${(stats.missionsAttempted || stats.missionsCompleted) ? 'is-cyan' : 'is-dim'}">${this.getWinRate(stats)}</div>
                                    <div class="sd-perf-label">WIN RATE</div>
                                </div>
                                <div class="sd-perf-divider"></div>
                                <div class="sd-perf-item">
                                    <div class="sd-perf-val ${(stats.totalPlayTime || 0) ? 'is-cyan' : 'is-dim'}">${this.formatPlaytime(stats.totalPlayTime || 0)}</div>
                                    <div class="sd-perf-label">PLAY TIME</div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section class="sd-rankings-col sd-rankings-col--mid">
                        <div class="sd-col-header">
                            <div class="sd-col-kicker">PROMOTION TRACK</div>
                            <div class="sd-col-title">RANK LADDER</div>
                        </div>

                        <div class="sd-ladder-scroll">
                            <div class="sd-ladder-wrap">
                                <div class="sd-ladder-spine"></div>
                                ${rankState.ranks.map((rank, index) => {
                                    const stateClass = index === rankState.currentIndex
                                        ? 'is-current'
                                        : index < rankState.currentIndex
                                            ? 'is-done'
                                            : 'is-locked';
                                    const pill = index === rankState.currentIndex
                                        ? '<span class="sd-rnode-pill is-active">ACTIVE</span>'
                                        : index === rankState.currentIndex + 1
                                            ? '<span class="sd-rnode-pill is-next">NEXT</span>'
                                            : '<span class="sd-rnode-pill is-locked">LOCKED</span>';

                                    return `
                                        <div class="sd-rstep ${stateClass}">
                                            <div class="sd-rstep-inner">
                                                <div class="sd-rnode ${rank.codeClass}">${this.escapeHtml(rank.short)}</div>
                                                <div class="sd-rnode-body">
                                                    <div class="sd-rnode-name">${this.escapeHtml(rank.name)}</div>
                                                    <div class="sd-rnode-req">${this.escapeHtml(rank.requirement)}</div>
                                                </div>
                                                ${pill}
                                            </div>
                                        </div>
                                        ${index < rankState.ranks.length - 1 ? '<div class="sd-rstep-divider"></div>' : ''}
                                    `;
                                }).join('')}
                            </div>

                            <div class="sd-promo-card">
                                ${nextRank ? `
                                    <div class="sd-promo-top">
                                        <div class="sd-promo-hex">${this.escapeHtml(nextRank.short)}</div>
                                        <div class="sd-promo-info">
                                            <div class="sd-promo-tag">// NEXT UP</div>
                                            <div class="sd-promo-name">${this.escapeHtml(nextRank.name)}</div>
                                        </div>
                                    </div>
                                    <div class="sd-promo-req">${this.escapeHtml(nextRank.requirement)}</div>
                                ` : `
                                    <div class="sd-promo-top">
                                        <div class="sd-promo-hex">${this.escapeHtml(rankState.current.short)}</div>
                                        <div class="sd-promo-info">
                                            <div class="sd-promo-tag">// STATUS</div>
                                            <div class="sd-promo-name">MAXIMUM RANK</div>
                                        </div>
                                    </div>
                                    <div class="sd-promo-req">Top promotion secured. Keep building score, badges, and clear consistency.</div>
                                `}
                            </div>
                        </div>
                    </section>

                    <section class="sd-rankings-col sd-rankings-col--right">
                        <div class="sd-col-header">
                            <div class="sd-col-kicker">GLOBAL BOARD</div>
                            <div class="sd-col-title">TOP OPERATIVES</div>
                        </div>

                        <div class="sd-board-scroll">
                            ${leaderboardEntries
                                .filter((entry) => !entry.isCurrentUser)
                                .map((entry, index) => this.renderLeaderboardEntry(entry, index + 1))
                                .join('')}

                            <div class="sd-board-sep"></div>

                            ${currentUserEntry ? this.renderLeaderboardEntry(currentUserEntry, null) : `
                                <div class="sd-bentry is-me">
                                    <div class="sd-bp-pos is-me">--</div>
                                    <div class="sd-bp-av">${this.escapeHtml(initials)}</div>
                                    <div class="sd-bp-info">
                                        <div class="sd-bp-name">${this.escapeHtml(displayName)} <span class="sd-bp-you">(YOU)</span></div>
                                        <div class="sd-bp-rank">${this.escapeHtml(rankState.current.name)} - L${stats.level || 1}</div>
                                    </div>
                                    <div class="sd-bp-right">
                                        <div class="sd-bp-score is-dim">--</div>
                                        <div class="sd-bp-bar"><div class="sd-bp-bar-fill" style="--w:1%;--delay:.65s"></div></div>
                                    </div>
                                </div>
                            `}
                        </div>
                    </section>
                </div>

                <div class="sd-rankings-statusbar">
                    <div class="sd-status-item"><span class="is-ok">&#9632;</span>NETWORK SECURE</div>
                    <div class="sd-status-item"><span class="is-warn">&#9632;</span>${Math.max(1, rankState.ranks.length - (rankState.currentIndex + 1))} THREATS</div>
                    <div class="sd-status-item">OPERATOR: ${this.escapeHtml(displayName.toUpperCase())}</div>
                    <div class="sd-status-utc" id="rankings-utc">--:--:-- UTC</div>
                </div>
            </div>
        `;

        this.startClock();
    }

    renderLeaderboardEntry(entry, position) {
        const posClass = entry.isCurrentUser
            ? 'is-me'
            : position === 1
                ? 'is-gold'
                : position === 2
                    ? 'is-silver'
                    : position === 3
                        ? 'is-bronze'
                        : 'is-default';

        return `
            <div class="sd-bentry ${entry.isCurrentUser ? 'is-me' : ''}">
                <div class="sd-bp-pos ${posClass}">${entry.isCurrentUser ? '--' : position}</div>
                <div class="sd-bp-av">${this.escapeHtml(entry.initials)}</div>
                <div class="sd-bp-info">
                    <div class="sd-bp-name">${this.escapeHtml(entry.name)}${entry.isCurrentUser ? ' <span class="sd-bp-you">(YOU)</span>' : ''}</div>
                    <div class="sd-bp-rank">${this.escapeHtml(entry.rankLabel)}</div>
                </div>
                <div class="sd-bp-right">
                    <div class="sd-bp-score ${entry.isDimScore ? 'is-dim' : ''}">${this.escapeHtml(entry.scoreLabel)}</div>
                    <div class="sd-bp-bar"><div class="sd-bp-bar-fill" style="--w:${entry.barWidth}%;--delay:${entry.delay}s"></div></div>
                </div>
            </div>
        `;
    }

    getLeaderboardEntries(user, stats) {
        const sample = [
            { name: 'ShadowExec_7', rankLabel: 'ELITE - L9', score: 48200, initials: 'SX' },
            { name: 'NullVector', rankLabel: 'SPECIALIST - L7', score: 41550, initials: 'NV' },
            { name: 'GhostHex_03', rankLabel: 'SPECIALIST - L6', score: 36900, initials: 'GH' },
            { name: 'CypherYuki', rankLabel: 'OPERATIVE - L5', score: 28400, initials: 'CY' },
            { name: 'R3dZer0', rankLabel: 'OPERATIVE - L4', score: 21700, initials: 'RZ' }
        ];

        const currentRankState = this.getOperatorRankState(stats);
        const currentUser = {
            name: this.getDisplayName(user),
            rankLabel: `${currentRankState.current.name} - L${stats.level || 1}`,
            score: Number(stats.totalScore || 0),
            initials: this.getInitials(this.getDisplayName(user)),
            isCurrentUser: true
        };

        const allEntries = [...sample, currentUser];
        const topScore = Math.max(...allEntries.map((entry) => Number(entry.score || 0)), 1);

        return allEntries.map((entry, index) => {
            const numericScore = Number(entry.score || 0);
            return {
                ...entry,
                scoreLabel: numericScore > 0 ? this.formatNumber(numericScore) : '--',
                isDimScore: numericScore <= 0,
                barWidth: Math.max(entry.isCurrentUser ? 1 : 8, Math.round((numericScore / topScore) * 100)),
                delay: (0.3 + (index * 0.08)).toFixed(2)
            };
        });
    }

    getOperatorRankState(stats) {
        const level = stats.level || 1;
        const missionsCompleted = stats.missionsCompleted || 0;
        const progressValue = Math.max(level, missionsCompleted);
        const ranks = [
            { name: 'ROOKIE', short: 'R1', threshold: 1, codeClass: 'is-rookie', requirement: 'Default entry - Level 1' },
            { name: 'AGENT', short: 'A2', threshold: 2, codeClass: 'is-agent', requirement: 'Reach Level 2 or clear 2 missions' },
            { name: 'OPERATIVE', short: 'O4', threshold: 4, codeClass: 'is-operative', requirement: 'Reach Level 4 or clear 4 missions' },
            { name: 'SPECIALIST', short: 'S6', threshold: 6, codeClass: 'is-specialist', requirement: 'Reach Level 6 or clear 6 missions' },
            { name: 'ELITE', short: 'E8', threshold: 8, codeClass: 'is-elite', requirement: 'Reach Level 8 or clear 8 missions' },
            { name: 'SHADOW', short: 'SH', threshold: 10, codeClass: 'is-shadow', requirement: 'Reach Level 10 or clear all missions' }
        ];

        let currentIndex = 0;
        ranks.forEach((rank, index) => {
            if (progressValue >= rank.threshold) {
                currentIndex = index;
            }
        });

        const current = ranks[currentIndex];
        const nextRank = ranks[currentIndex + 1] || null;

        return { ranks, currentIndex, current, nextRank };
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

    startClock() {
        const tick = () => {
            const now = new Date();
            const clock = document.getElementById('rankings-clock');
            const utc = document.getElementById('rankings-utc');
            if (clock) clock.textContent = now.toTimeString().slice(0, 8);
            if (utc) utc.textContent = `${now.toUTCString().slice(17, 25)} UTC`;
        };

        tick();
        this.clockInterval = window.setInterval(tick, 1000);
    }

    stopClock() {
        if (this.clockInterval) {
            window.clearInterval(this.clockInterval);
            this.clockInterval = null;
        }
    }

    getDisplayName(user) {
        return String(user?.name || user?.displayName || user?.email?.split('@')[0] || 'Operator').trim();
    }

    getInitials(name) {
        const parts = String(name || 'Operator').trim().split(/\s+/).filter(Boolean);
        if (!parts.length) return 'OP';
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }

    getOperatorId(user) {
        const seed = String(user?.id || user?.uid || user?.email || '0042')
            .replace(/[^a-zA-Z0-9]/g, '')
            .slice(-4)
            .toUpperCase()
            .padStart(4, '0');
        return `SD-${seed}`;
    }

    getLevelProgress(stats) {
        const experience = Number(stats.experience || 0);
        return Math.max(0, Math.min(100, ((experience % 1000) / 1000) * 100));
    }

    getNextLevelXP(stats) {
        const experience = Number(stats.experience || 0);
        return Math.floor(experience / 1000) * 1000 + 1000;
    }

    getWinRate(stats) {
        const completed = Number(stats.missionsCompleted || 0);
        const attempted = Number(stats.missionsAttempted || completed || 0);
        if (!attempted) return '--';
        return `${Math.round((completed / attempted) * 100)}%`;
    }

    getScoreRankTone(scoreRank) {
        if (scoreRank.rank === 'S') return 'is-gold';
        if (scoreRank.rank === 'A+' || scoreRank.rank === 'A') return 'is-green';
        if (scoreRank.rank === 'B') return 'is-cyan';
        if (scoreRank.rank === 'C') return 'is-red';
        return 'is-dim';
    }

    formatNumber(value) {
        return Number(value || 0).toLocaleString();
    }

    formatPlaytime(minutes) {
        const safeMinutes = Math.max(0, Number(minutes || 0));
        const hours = Math.floor(safeMinutes / 60);
        const remainingMinutes = safeMinutes % 60;

        if (!hours) return `${remainingMinutes}m`;
        if (!remainingMinutes) return `${hours}h`;
        return `${hours}h ${remainingMinutes}m`;
    }

    escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
}
