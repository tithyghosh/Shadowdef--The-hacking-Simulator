/**
 * ProfileScreen - User profile and statistics display
 */

import { AuthManager } from '../core/AuthManager.js';
import { UIManager } from '../ui/UIManager.js';

export class ProfileScreen {
    constructor(game) {
        this.game = game;
        this.auth = AuthManager.getInstance();
        this.ui = new UIManager();
        this.profileAnimationFrame = null;
        this.profileResizeHandler = null;

        this.setupEventListeners();
    }

    getMissionSections() {
        const sections = [
            {
                name: 'Password Cracking',
                subtitle: 'MISSION 1 - 10 LEVELS',
                roadmapTitle: 'MISSION 1 - PASSWORD CRACKING',
                emoji: '&#128273;',
                colorKey: 'c',
                lvl5Icon: '&#9889;',
                lvl10Icon: '&#127942;',
                lvl5Name: 'CIPHER BREAKER',
                lvl10Name: 'FIRST BREACH',
                badges: ['&#128274; CIPHER BREAKER', '&#128274; FIRST BREACH'],
                missions: Array.isArray(this.game?.passwordMissions) ? this.game.passwordMissions : []
            },
            {
                name: 'Zero-Day Countdown',
                subtitle: 'MISSION 2 - 10 LEVELS',
                roadmapTitle: 'MISSION 2 - ZERO-DAY COUNTDOWN',
                emoji: '&#9888;',
                colorKey: 'r',
                lvl5Icon: '&#128293;',
                lvl10Icon: '&#9760;',
                lvl5Name: 'PHANTOM STRIKE',
                lvl10Name: 'DARK NET LEGEND',
                badges: ['&#128274; PHANTOM STRIKE', '&#128274; DARK NET LEGEND'],
                missions: Array.isArray(this.game?.malwareMissions) ? this.game.malwareMissions : []
            }
        ];

        return sections.filter((section) => section.missions.length > 0);
    }

    getCompletedMissionCount() {
        return this.getMissionSections().reduce(
            (sum, section) => sum + section.missions.filter((mission) => mission.completed).length,
            0
        );
    }

    getTotalMissionCount() {
        return this.getMissionSections().reduce((sum, section) => sum + section.missions.length, 0);
    }

    getBestScoreForSection(missions) {
        return missions.reduce((best, mission) => Math.max(best, mission.bestScore || 0), 0);
    }

    /**
     * Render profile screen
     */
    render() {
        const profileContainer = document.getElementById('profile-screen');
        if (!profileContainer) return;

        this.stopProfileCanvasAnimation();

        const user = this.auth.getCurrentUser();
        if (!user) {
            this.renderGuestProfile(profileContainer);
            return;
        }

        const stats = user.gameStats || {};
        const level = stats.level || 1;
        const experience = stats.experience || 0;
        const levelProgress = Math.max(0, Math.min(100, ((experience % 1000) / 1000) * 100));
        const totalMissionCount = Math.max(1, this.getTotalMissionCount());
        const completedMissionCount = this.getCompletedMissionCount();
        const missionProgress = Math.max(0, Math.min(100, (completedMissionCount / totalMissionCount) * 100));
        const credits = stats.credits || 0;
        const rank = this.calculateRank(stats);
        const rankIndex = this.getRankIndex(rank);
        const avatarBadge = this.renderAvatarBadge(stats);
        const initials = this.getInitials(user.name || 'User');
        const [firstName, lastName] = this.splitName(user.name || 'User');
        const isMobile = window.matchMedia('(max-width: 768px)').matches;

        if (isMobile) {
            this.renderMobileLayout(profileContainer, {
                user,
                stats,
                level,
                experience,
                levelProgress,
                missionProgress,
                totalMissionCount,
                completedMissionCount,
                credits,
                rank,
                rankIndex,
                avatarBadge,
                initials,
                firstName,
                lastName
            });
            this.setupProfileListeners();
            this.startProfileCanvasAnimation();
            return;
        }

        profileContainer.innerHTML = `
            <canvas id="profile-fx-canvas" class="profile-fx-canvas" aria-hidden="true"></canvas>
            <div class="profile-scanlines" aria-hidden="true"></div>
            <div class="profile-vignette" aria-hidden="true"></div>
            <div class="profile-hud-top" aria-hidden="true"></div>
            <div class="profile-hud-bot" aria-hidden="true"></div>

            <div class="profile-layout">
                <aside class="profile-sidebar">
                    <div class="ps-logo">SHADOWDEF</div>

                    <div class="ps-panel">
                        <div class="ps-user-card">
                            <div class="ps-user-avatar-wrap">
                                <div class="ps-avatar-container">
                                    <div class="ps-user-avatar">${this.escapeHtml(initials)}</div>
                                    ${avatarBadge}
                                    <div class="ps-avatar-online"></div>
                                </div>
                                <div class="ps-user-info">
                                    <div class="ps-user-name">${this.escapeHtml(firstName.toUpperCase())}</div>
                                    <div class="ps-user-name ps-user-name-sub">${this.escapeHtml(lastName.toUpperCase())}</div>
                                    <div class="ps-user-email">${this.escapeHtml(user.email || 'operator@shadowdef.local')}</div>
                                    <div class="ps-user-rank-badge">&#9656; ${this.escapeHtml(rank.toUpperCase())}</div>
                                </div>
                            </div>
                            ${this.renderRankProgression(rankIndex)}
                            <div class="ps-rank-row">
                                <div class="ps-rank-label"><span>XP PROGRESS</span><span>LVL ${level}</span></div>
                                <div class="ps-rank-bar-wrap"><div class="ps-rank-bar" style="width:${levelProgress.toFixed(1)}%"></div></div>
                            </div>
                        </div>
                    </div>

                    <div class="ps-panel">
                        <div class="ps-panel-title">Game Statistics</div>
                        <div class="ps-panel-body">
                            <div class="ps-stats-grid">
                                ${this.renderCyberStats(stats)}
                            </div>
                        </div>
                    </div>

                    <div class="ps-panel">
                        <div class="ps-panel-title">Progress & Experience</div>
                        <div class="ps-panel-body">
                            <div class="ps-prog-item">
                                <div class="ps-prog-header"><span class="ps-prog-label">LEVEL PROGRESS</span><span class="ps-prog-val">${experience % 1000} / 1000 XP</span></div>
                                <div class="ps-prog-bar-wrap"><div class="ps-prog-bar c" style="width:${levelProgress.toFixed(1)}%"></div></div>
                            </div>
                            <div class="ps-prog-item">
                                <div class="ps-prog-header"><span class="ps-prog-label">MISSION PROGRESS</span><span class="ps-prog-val">${completedMissionCount} / ${totalMissionCount}</span></div>
                                <div class="ps-prog-bar-wrap"><div class="ps-prog-bar r" style="width:${missionProgress.toFixed(1)}%"></div></div>
                            </div>
                        </div>
                    </div>

                </aside>

                <main class="profile-main">
                    <button class="profile-back-btn" data-action="back" type="button">BACK</button>

                    <div class="profile-title-row">
                        <div class="profile-title">OPERATIVE FILE</div>
                        <div class="profile-title-line"></div>
                    </div>

                    <div class="profile-main-grid">
                        <div class="profile-mpanel wide">
                            <div class="profile-mpanel-title">Badge Unlock Roadmap — Complete Levels to Earn Badges</div>
                            <div class="profile-mpanel-body">
                                ${this.renderMissionRoadmap()}
                            </div>
                        </div>

                        <div class="profile-mpanel wide">
                            <div class="profile-mpanel-title">Mission Log</div>
                            <div class="profile-mpanel-body">
                                ${this.renderMissionLog(stats)}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        `;

        this.setupProfileListeners();
        this.startProfileCanvasAnimation();
    }

    renderMobileLayout(profileContainer, view) {
        const {
            user,
            stats,
            level,
            experience,
            levelProgress,
            missionProgress,
            totalMissionCount,
            completedMissionCount,
            credits,
            rank,
            rankIndex,
            avatarBadge,
            initials,
            firstName,
            lastName
        } = view;
        const badgeHtml = avatarBadge.replace(/ps-avatar-badge/g, 'pm-avatar-badge');
        const levelValue = experience % 1000;

        profileContainer.innerHTML = `
            <canvas id="profile-fx-canvas" class="profile-fx-canvas" aria-hidden="true"></canvas>
            <div class="profile-scanlines" aria-hidden="true"></div>
            <div class="profile-vignette" aria-hidden="true"></div>
            <div class="profile-hud-top" aria-hidden="true"></div>

            <div class="pm-topbar">
                <button class="pm-back-btn" data-action="back" type="button">&#8592;</button>
                <div class="pm-logo">SHADOWDEF</div>
                <div class="pm-status"><span class="pm-status-dot"></span>ONLINE</div>
            </div>

            <div class="pm-scroll-area" id="pm-scroll-area">
                <section class="pm-tab-page active" data-tab-page="profile">
                    <div class="pm-user-hero">
                        <div class="pm-user-top-row">
                            <div class="pm-avatar-container">
                                <div class="pm-user-avatar">${this.escapeHtml(initials)}</div>
                                ${badgeHtml}
                                <div class="pm-avatar-online"></div>
                            </div>
                            <div class="pm-user-details">
                                <div class="pm-user-name">${this.escapeHtml(firstName.toUpperCase())}</div>
                                <div class="pm-user-last">${this.escapeHtml(lastName.toUpperCase())}</div>
                                <div class="pm-user-email">${this.escapeHtml(user.email || 'operator@shadowdef.local')}</div>
                                <div class="pm-user-rank-tag">&#9656; ${this.escapeHtml(rank.toUpperCase())}</div>
                            </div>
                        </div>

                        ${this.renderMobileRankProgression(rankIndex)}
                        <div class="pm-xp-row"><span class="pm-xp-label">XP PROGRESS - LVL ${level}</span><span class="pm-xp-val">${levelValue} / 1000</span></div>
                        <div class="pm-xp-bar-wrap"><div class="pm-xp-bar" style="width:${levelProgress.toFixed(1)}%"></div></div>
                    </div>

                    <div class="pm-panel">
                        <div class="pm-panel-title">Game Statistics</div>
                        <div class="pm-panel-body">
                            ${this.renderMobileStats(stats)}
                        </div>
                    </div>

                    <div class="pm-panel">
                        <div class="pm-panel-title">Progress & XP</div>
                        <div class="pm-panel-body">
                            <div class="pm-prog-item">
                                <div class="pm-prog-hdr"><span class="pm-prog-lbl">LEVEL PROGRESS</span><span class="pm-prog-v">${levelValue} / 1000 XP</span></div>
                                <div class="pm-prog-wrap"><div class="pm-prog-fill c" style="width:${levelProgress.toFixed(1)}%"></div></div>
                            </div>
                            <div class="pm-prog-item">
                                <div class="pm-prog-hdr"><span class="pm-prog-lbl">MISSION PROGRESS</span><span class="pm-prog-v">${completedMissionCount} / ${totalMissionCount}</span></div>
                                <div class="pm-prog-wrap"><div class="pm-prog-fill r" style="width:${missionProgress.toFixed(1)}%"></div></div>
                            </div>
                        </div>
                    </div>

                </section>

                <section class="pm-tab-page" data-tab-page="badges">
                    <div class="pm-panel">
                        <div class="pm-panel-title">Achievement Badges</div>
                        <div class="pm-panel-body">
                            <div class="ps-ach-grid">
                                ${this.renderCyberAchievements(stats.achievements || [], stats)}
                            </div>
                        </div>
                    </div>
                </section>

                <section class="pm-tab-page" data-tab-page="roadmap">
                    <div class="pm-panel">
                        <div class="pm-panel-title">Badge Unlock Roadmap</div>
                        <div class="pm-panel-body">
                            ${this.renderMissionRoadmap()}
                        </div>
                    </div>
                </section>

                <section class="pm-tab-page" data-tab-page="missions">
                    ${this.renderMobileMissionCards(stats)}
                </section>
            </div>

            <div class="pm-bottom-nav">
                <button class="pm-nav-item active" data-tab="profile" type="button"><span class="pm-nav-icon">&#128100;</span><span class="pm-nav-label">PROFILE</span></button>
                <button class="pm-nav-item" data-tab="badges" type="button"><span class="pm-nav-icon">&#127941;</span><span class="pm-nav-label">BADGES</span></button>
                <button class="pm-nav-item" data-tab="roadmap" type="button"><span class="pm-nav-icon">&#128506;</span><span class="pm-nav-label">ROADMAP</span></button>
                <button class="pm-nav-item" data-tab="missions" type="button"><span class="pm-nav-icon">&#127919;</span><span class="pm-nav-label">MISSIONS</span></button>
            </div>
        `;
    }

    renderCyberStats(stats) {
        const completedMissionCount = this.getCompletedMissionCount();
        const rows = [
            { cls: 'ra', icon: '&#127919;', value: this.formatNumber(stats.totalScore || 0), label: 'TOTAL SCORE' },
            { cls: 'ya', icon: '&#127942;', value: this.formatNumber(stats.highScore || 0), label: 'HIGH SCORE' },
            { cls: 'ga', icon: '&#10003;', value: completedMissionCount, label: 'MISSIONS DONE' },
            { cls: 'ca', icon: '&#9201;', value: this.formatPlayTime(stats.totalPlayTime || 0), label: 'PLAY TIME' },
            { cls: 'ca', icon: '&#128202;', value: this.calculateSuccessRate(stats), label: 'SUCCESS RATE' },
            { cls: 'ra', icon: '&#128640;', value: this.calculateRank(stats), label: 'RANK' }
        ];

        return rows.map((item) => `
            <div class="ps-stat-box ${item.cls}">
                <div class="ps-stat-box-icon">${item.icon}</div>
                <div class="ps-stat-box-val">${this.escapeHtml(String(item.value))}</div>
                <div class="ps-stat-box-label">${this.escapeHtml(item.label)}</div>
            </div>
        `).join('');
    }

    renderCyberAchievements(achievements, stats) {
        const completed = this.getCompletedMissionCount();
        const level = stats.level || 1;
        const earned = new Set(achievements || []);
        const badgeDefs = [
            { id: 'first_mission', icon: '&#9889;', name: 'FIRST<br>BREACH', cls: 'gold', unlocked: completed > 0 || earned.has('first_mission') },
            { id: 'cipher_breaker', icon: '&#128275;', name: 'CIPHER<br>BREAKER', cls: 'cyan', unlocked: level >= 5 || earned.has('cipher_breaker') },
            { id: 'phantom_strike', icon: '&#128293;', name: 'PHANTOM<br>STRIKE', cls: 'red', unlocked: earned.has('phantom_strike') },
            { id: 'ghost_protocol', icon: '&#128737;', name: 'GHOST<br>PROTOCOL', cls: 'green', unlocked: earned.has('ghost_protocol') },
            { id: 'dark_net_legend', icon: '&#9760;', name: 'DARK NET<br>LEGEND', cls: 'purple', unlocked: earned.has('dark_net_legend') },
            { id: 'shadow_master', icon: '&#128081;', name: 'SHADOW<br>MASTER', cls: 'silver', unlocked: earned.has('shadow_master') }
        ];

        return badgeDefs.map((badge) => `
            <div class="ps-ach-badge ${badge.unlocked ? '' : 'locked'}">
                <div class="ps-ach-badge-icon ${badge.cls}">
                    ${badge.icon}
                    ${badge.unlocked ? '' : '<div class="lock-overlay">&#128274;</div>'}
                </div>
                <div class="ps-ach-badge-name">${badge.name}</div>
            </div>
        `).join('');
    }

    renderMissionRoadmap() {
        const blocks = this.getMissionSections()
            .map((section) => this.renderMissionRoadmapBlock(
                section.roadmapTitle,
                section.emoji,
                section.colorKey,
                section.lvl5Icon,
                section.lvl10Icon,
                section.lvl5Name,
                section.lvl10Name
            ))
            .join('');

        return `<div class="ps-mission-roadmap">${blocks}</div>`;
    }

    renderAvatarBadge(stats) {
        const completed = this.getCompletedMissionCount();
        const level = stats.level || 1;
        const earned = new Set(stats.achievements || []);
        const badgePriority = [
            { id: 'shadow_master', icon: '&#128081;', cls: 'silver', title: 'Shadow Master Badge', unlocked: earned.has('shadow_master') },
            { id: 'dark_net_legend', icon: '&#9760;', cls: 'purple', title: 'Dark Net Legend Badge', unlocked: earned.has('dark_net_legend') },
            { id: 'ghost_protocol', icon: '&#128737;', cls: 'green', title: 'Ghost Protocol Badge', unlocked: earned.has('ghost_protocol') },
            { id: 'phantom_strike', icon: '&#128293;', cls: 'red', title: 'Phantom Strike Badge', unlocked: earned.has('phantom_strike') },
            { id: 'cipher_breaker', icon: '&#128275;', cls: 'cyan', title: 'Cipher Breaker Badge', unlocked: level >= 5 || earned.has('cipher_breaker') },
            { id: 'first_mission', icon: '&#9889;', cls: 'gold', title: 'First Breach Badge', unlocked: completed > 0 || earned.has('first_mission') }
        ];

        const activeBadge = badgePriority.find((badge) => badge.unlocked);
        if (!activeBadge) return '';

        return `<div class="ps-avatar-badge ${activeBadge.cls}" title="${activeBadge.title}">${activeBadge.icon}</div>`;
    }

    renderRankProgression(currentRankIndex) {
        const ranks = ['ROOKIE', 'AGENT', 'OPERATIVE', 'SPECIALIST', 'ELITE', 'SHADOW MASTER'];
        const nodes = ranks.map((rank, idx) => {
            const completed = idx <= currentRankIndex;
            const isFinal = idx === ranks.length - 1;
            const stepText = completed ? '&#10003;' : (isFinal ? '&#128081;' : String(idx + 1));
            const toneClass = rank.toLowerCase().replace(/\s+/g, '-');
            return `
                <div class="ps-rank-step">
                    <div class="ps-rank-node ${toneClass} ${completed ? 'done' : ''} ${isFinal ? 'final' : ''}">${stepText}</div>
                    <span class="ps-rank-step-label ${toneClass} ${completed ? 'done' : ''} ${isFinal ? 'final' : ''}">${rank}</span>
                </div>
            `;
        }).join('');

        return `
            <div class="ps-rank-track">
                <div class="ps-rank-track-title">RANK PROGRESSION</div>
                <div class="ps-rank-track-steps">${nodes}</div>
            </div>
        `;
    }

    renderMissionRoadmapBlock(title, icon, colorKey, lvl5Icon, lvl10Icon, lvl5Name, lvl10Name) {
        const rewardClass5 = colorKey === 'c' ? 'c-reward' : colorKey === 'r' ? 'r-reward' : 'g-reward';
        const rewardClass10 = colorKey === 'c' ? 'gold-reward' : colorKey === 'r' ? 'purple-reward' : 'silver-reward';
        const hl5 = colorKey;
        const hl10 = colorKey === 'c' ? 'gold' : colorKey === 'r' ? 'purple' : 'silver';

        const nodes = Array.from({ length: 10 }, (_, i) => {
            const level = i + 1;
            if (level === 5) {
                return `
                    <div class="ps-level-step">
                        <div class="ps-level-node reward ${rewardClass5}">${lvl5Icon}</div>
                        <div class="ps-level-label highlight ${hl5}">LVL 5<br>BADGE</div>
                    </div>
                `;
            }
            if (level === 10) {
                return `
                    <div class="ps-level-step">
                        <div class="ps-level-node reward ${rewardClass10}">${lvl10Icon}</div>
                        <div class="ps-level-label highlight ${hl10}">LVL 10<br>MASTER</div>
                    </div>
                `;
            }
            return `
                <div class="ps-level-step">
                    <div class="ps-level-node">${level}</div>
                    <div class="ps-level-label">LVL ${level}</div>
                </div>
            `;
        }).join('');

        return `
            <div class="ps-mission-block">
                <div class="ps-mission-block-title">
                    <span class="ps-mission-icon">${icon}</span>
                    <span class="ps-mission-block-title-text">${title}</span>
                    <div class="ps-mission-block-title-line ${colorKey}"></div>
                </div>
                <div class="ps-level-steps">${nodes}</div>
                <div class="ps-roadmap-footnote ${colorKey}">
                    <div>Levels 1-4: No reward</div>
                    <div>${lvl5Icon} LV5 &#8594; <span>${lvl5Name}</span> Badge</div>
                    <div>${lvl10Icon} LV10 &#8594; <span>${lvl10Name}</span> Badge</div>
                </div>
            </div>
        `;
    }

    renderMissionLog(stats) {
        const rows = this.getMissionSections().map((section) => {
            const completed = section.missions.filter((mission) => mission.completed).length;
            const bestScore = this.getBestScoreForSection(section.missions);
            const hasUnlockedMission = section.missions.some((mission) => !mission.locked);
            const statusClass = completed >= section.missions.length ? 'done' : hasUnlockedMission ? 'prog' : 'lock';
            const statusText = completed >= section.missions.length ? 'DONE' : hasUnlockedMission ? 'ACTIVE' : 'LOCKED';

            return this.renderMissionLogRow(
                section.name,
                completed,
                bestScore,
                statusClass,
                statusText
            );
        }).join('');

        return `
            <table class="ps-mission-table">
                <thead>
                    <tr>
                        <th>MISSION NAME</th>
                        <th>LEVELS</th>
                        <th>COMPLETED</th>
                        <th>BEST SCORE</th>
                        <th>BADGES EARNED</th>
                        <th>STATUS</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        `;
    }

    renderMissionLogRow(name, completed, bestScore, statusClass, statusText) {
        const statusPrefix = statusClass === 'lock' ? '&#128274;' : '&#9656;';
        return `
            <tr>
                <td>${this.escapeHtml(name)}</td>
                <td>10 Levels</td>
                <td>${this.renderLevelMini(completed, 10)}</td>
                <td>${bestScore > 0 ? this.formatNumber(bestScore) : '&#8212;'}</td>
                <td style="color: rgba(168,216,232,0.3)">${completed >= 5 ? 1 : 0} / 2</td>
                <td><span class="ps-m-status ${statusClass}">${statusPrefix} ${statusText}</span></td>
            </tr>
        `;
    }

    renderLevelMini(done, total) {
        const items = Array.from({ length: total }, (_, i) => `<div class="ps-lm ${i < done ? 'done' : ''}"></div>`).join('');
        return `<div class="ps-level-mini">${items}</div>`;
    }

    renderMobileRankProgression(currentRankIndex) {
        const ranks = ['ROOKIE', 'AGENT', 'OPERATV', 'SPECLS', 'ELITE', 'SHADOW'];
        return `
            <div class="pm-rank-track">
                <div class="pm-rank-track-label">RANK PROGRESSION</div>
                <div class="pm-rank-nodes">
                    ${ranks.map((rank, idx) => {
                        const active = idx <= currentRankIndex;
                        const isFinal = idx === ranks.length - 1;
                        const marker = active ? '&#10003;' : (isFinal ? '&#128081;' : String(idx + 1));
                        return `
                            <div class="pm-rn">
                                <div class="pm-rn-dot ${active ? 'active' : ''} ${isFinal ? 'final' : ''}">${marker}</div>
                                <div class="pm-rn-name ${active ? 'active' : ''} ${isFinal ? 'final' : ''}">${rank}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    renderMobileStats(stats) {
        const completedMissionCount = this.getCompletedMissionCount();
        const rows = [
            { cls: 'ra', icon: '&#127919;', value: this.formatNumber(stats.totalScore || 0), label: 'TOTAL SCORE' },
            { cls: 'ya', icon: '&#127942;', value: this.formatNumber(stats.highScore || 0), label: 'HIGH SCORE' },
            { cls: 'ga', icon: '&#10003;', value: completedMissionCount, label: 'MISSIONS' },
            { cls: 'ca', icon: '&#9201;', value: this.formatPlayTime(stats.totalPlayTime || 0), label: 'PLAY TIME' },
            { cls: 'ca', icon: '&#128202;', value: this.calculateSuccessRate(stats), label: 'SUCCESS' },
            { cls: 'ra', icon: '&#128640;', value: this.calculateRank(stats), label: 'RANK' }
        ];

        return `
            <div class="pm-stats-grid">
                ${rows.map((item) => `
                    <div class="pm-stat-box ${item.cls}">
                        <div class="pm-stat-icon">${item.icon}</div>
                        <div class="pm-stat-val">${this.escapeHtml(String(item.value))}</div>
                        <div class="pm-stat-lbl">${this.escapeHtml(item.label)}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderMobileMissionCards(stats) {
        const cards = this.getMissionSections().map((section) => {
            const completed = section.missions.filter((mission) => mission.completed).length;
            const hasUnlockedMission = section.missions.some((mission) => !mission.locked);
            return {
                name: section.name.toUpperCase(),
                sub: section.subtitle,
                emoji: section.emoji,
                statusClass: completed >= section.missions.length ? 'done' : hasUnlockedMission ? 'prog' : 'lock',
                statusText: completed >= section.missions.length ? 'DONE' : hasUnlockedMission ? 'ACTIVE' : 'LOCKED',
                done: completed,
                bestScore: this.getBestScoreForSection(section.missions),
                badges: section.badges
            };
        });

        return cards.map((card) => `
            <div class="pm-mission-card">
                <div class="pm-mc-header">
                    <div class="pm-mc-emoji">${card.emoji}</div>
                    <div class="pm-mc-info">
                        <div class="pm-mc-name">${card.name}</div>
                        <div class="pm-mc-sub">${card.sub}</div>
                    </div>
                    <div class="pm-mc-status ${card.statusClass}">${card.statusClass === 'lock' ? '&#128274;' : '&#9656;'} ${card.statusText}</div>
                </div>
                <div class="pm-mc-body">
                    <div class="pm-mc-key">LEVEL PROGRESS</div>
                    <div class="pm-mc-levels">${this.renderLevelMini(card.done, 10).replace('ps-level-mini', 'pm-level-mini').replace(/ps-lm/g, 'pm-lm')}</div>
                    <div class="pm-mc-row"><span class="pm-mc-key">BEST SCORE</span><span class="pm-mc-val">${card.bestScore > 0 ? this.formatNumber(card.bestScore) : '&#8212;'}</span></div>
                    <div class="pm-mc-row"><span class="pm-mc-key">BADGES EARNED</span><span class="pm-mc-val">${card.done >= 5 ? 1 : 0} / 2</span></div>
                    <div class="pm-mc-badges-row">${card.badges.map((badge) => `<div class="pm-mc-badge">${badge}</div>`).join('')}</div>
                </div>
            </div>
        `).join('');
    }

    startProfileCanvasAnimation() {
        const canvas = document.getElementById('profile-fx-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        resize();
        this.profileResizeHandler = resize;
        window.addEventListener('resize', this.profileResizeHandler);

        const binaries = Array.from({ length: 40 }, () => ({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            val: Math.floor(Math.random() * 1048576).toString(2).slice(0, 6),
            op: Math.random() * 0.08 + 0.02,
            spd: Math.random() * 0.1 + 0.03
        }));

        const pts = Array.from({ length: 65 }, () => ({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            vx: (Math.random() - 0.5) * 0.25,
            vy: (Math.random() - 0.5) * 0.25,
            r: Math.random() * 1.4 + 0.3,
            op: Math.random() * 0.25 + 0.06
        }));

        const draw = () => {
            this.profileAnimationFrame = requestAnimationFrame(draw);
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const gradient = ctx.createRadialGradient(
                canvas.width * 0.5,
                canvas.height * 0.5,
                0,
                canvas.width * 0.5,
                canvas.height * 0.5,
                canvas.width * 0.8
            );
            gradient.addColorStop(0, 'rgba(6,18,48,1)');
            gradient.addColorStop(0.5, 'rgba(4,9,24,1)');
            gradient.addColorStop(1, 'rgba(2,4,14,1)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            binaries.forEach((b) => {
                b.y -= b.spd;
                if (b.y < -20) {
                    b.y = canvas.height + 10;
                    b.x = Math.random() * canvas.width;
                }
                ctx.font = '10px Share Tech Mono';
                ctx.fillStyle = `rgba(0,200,230,${b.op})`;
                ctx.fillText(b.val, b.x, b.y);
            });

            pts.forEach((p) => {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0,200,230,${p.op})`;
                ctx.fill();
            });

            for (let i = 0; i < pts.length; i += 1) {
                for (let j = i + 1; j < pts.length; j += 1) {
                    const dx = pts[i].x - pts[j].x;
                    const dy = pts[i].y - pts[j].y;
                    const d = Math.sqrt(dx * dx + dy * dy);
                    if (d < 95) {
                        ctx.beginPath();
                        ctx.moveTo(pts[i].x, pts[i].y);
                        ctx.lineTo(pts[j].x, pts[j].y);
                        ctx.strokeStyle = `rgba(0,180,220,${0.06 * (1 - d / 95)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
        };

        draw();
    }

    stopProfileCanvasAnimation() {
        if (this.profileAnimationFrame) {
            cancelAnimationFrame(this.profileAnimationFrame);
            this.profileAnimationFrame = null;
        }

        if (this.profileResizeHandler) {
            window.removeEventListener('resize', this.profileResizeHandler);
            this.profileResizeHandler = null;
        }
    }

    /**
     * Render guest profile
     */
    renderGuestProfile(container) {
        container.innerHTML = `
            <div class="guest-profile">
                <div class="guest-avatar">
                    <div class="guest-icon">&#128100;</div>
                </div>

                <h2>Playing as Guest</h2>
                <p class="guest-warning">Your progress is not being saved</p>

                <div class="guest-actions">
                    <button class="btn btn-primary" id="create-account">CREATE ACCOUNT</button>
                    <button class="btn" id="sign-in">SIGN IN</button>
                </div>

                <div class="guest-benefits">
                    <h3>Create an account to:</h3>
                    <ul>
                        <li>Save your progress</li>
                        <li>Track achievements</li>
                        <li>Earn gaming credits</li>
                        <li>View statistics</li>
                        <li>Unlock exclusive content</li>
                    </ul>
                </div>
            </div>
        `;

        // Setup guest profile listeners
        document.getElementById('create-account')?.addEventListener('click', () => {
            this.game.screens.showScreen('login-screen');
        });

        document.getElementById('sign-in')?.addEventListener('click', () => {
            this.game.screens.showScreen('login-screen');
        });
    }

    /**
     * Setup profile event listeners
     */
    setupEventListeners() {
        document.addEventListener('shadowdef:auth:login', () => {
            this.render();
        });

        document.addEventListener('shadowdef:auth:logout', () => {
            this.stopProfileCanvasAnimation();
            this.render();
        });

        document.addEventListener('shadowdef:auth:statsUpdate', () => {
            this.render();
        });
    }

    /**
     * Setup profile-specific listeners
     */
    setupProfileListeners() {
        document.querySelector('[data-action="back"]')?.addEventListener('click', () => {
            this.game.screens.showScreen('main-menu');
        });

        document.querySelectorAll('.pm-nav-item').forEach((tabBtn) => {
            tabBtn.addEventListener('click', () => {
                const tabId = tabBtn.dataset.tab;
                if (!tabId) return;

                document.querySelectorAll('.pm-tab-page').forEach((page) => {
                    page.classList.toggle('active', page.dataset.tabPage === tabId);
                });
                document.querySelectorAll('.pm-nav-item').forEach((item) => {
                    item.classList.toggle('active', item === tabBtn);
                });

                const mobileScrollArea = document.getElementById('pm-scroll-area');
                if (mobileScrollArea) mobileScrollArea.scrollTop = 0;
            });
        });

        // Edit profile
        document.getElementById('edit-profile')?.addEventListener('click', () => {
            this.showEditProfileModal();
        });

        // Sync data
        document.getElementById('sync-data')?.addEventListener('click', () => {
            this.syncUserData();
        });

        // Logout
        document.getElementById('logout-btn')?.addEventListener('click', () => {
            this.handleLogout();
        });

        // Earn credits
        document.getElementById('earn-credits')?.addEventListener('click', () => {
            this.showEarnCreditsModal();
        });
    }

    /**
     * Show edit profile modal
     */
    showEditProfileModal() {
        const user = this.auth.getCurrentUser();
        if (!user) return;

        this.ui.showModal('Edit Profile', `
            <div class="edit-profile-form">
                <div class="form-group">
                    <label for="edit-name">Display Name</label>
                    <input type="text" id="edit-name" value="${this.escapeHtml(user.name || '')}" maxlength="50">
                </div>

                <div class="form-group">
                    <label for="edit-avatar">Avatar URL</label>
                    <input type="url" id="edit-avatar" value="${this.escapeHtml(user.avatar || '')}" placeholder="Enter image URL">
                </div>

                <div class="avatar-preview">
                    <img src="${this.escapeHtml(user.avatar || '')}" alt="Avatar Preview" id="avatar-preview">
                </div>
            </div>
        `, {
            buttons: [
                {
                    text: 'SAVE CHANGES',
                    class: 'btn-primary',
                    onClick: () => {
                        this.saveProfileChanges();
                    }
                },
                {
                    text: 'CANCEL',
                    class: 'btn'
                }
            ]
        });

        // Setup avatar preview
        document.getElementById('edit-avatar')?.addEventListener('input', (e) => {
            const preview = document.getElementById('avatar-preview');
            if (preview) {
                preview.src = e.target.value || user.avatar;
            }
        });
    }

    /**
     * Save profile changes
     */
    saveProfileChanges() {
        const newName = document.getElementById('edit-name')?.value;
        const newAvatar = document.getElementById('edit-avatar')?.value;

        if (newName && newName.trim()) {
            // Update user profile
            this.auth.currentUser.name = newName.trim();
            if (newAvatar) {
                this.auth.currentUser.avatar = newAvatar;
            }

            // Save changes
            this.auth.saveUserSession();
            this.render();

            this.ui.showNotification('Profile updated successfully!', 'success');
        }
    }

    /**
     * Sync user data
     */
    async syncUserData() {
        try {
            this.ui.showNotification('Syncing data...', 'info');
            await this.auth.syncGameData();
            this.ui.showNotification('Data synced successfully!', 'success');
        } catch (error) {
            this.ui.showNotification('Sync failed. Please try again.', 'error');
        }
    }

    /**
     * Handle logout
     */
    handleLogout() {
        this.ui.showLogoutConfirm(async () => {
            await this.auth.logout();
            this.ui.showNotification('Logged out successfully', 'success');
        });
    }

    /**
     * Show earn credits modal
     */
    showEarnCreditsModal() {
        this.ui.showModal('Earn Credits', `
            <div class="earn-credits-content">
                <h3>Ways to Earn Credits:</h3>
                <div class="credit-methods">
                    <div class="credit-method">
                        <div class="method-icon">&#127919;</div>
                        <div class="method-info">
                            <div class="method-name">Complete Missions</div>
                            <div class="method-reward">+100-500 credits</div>
                        </div>
                    </div>

                    <div class="credit-method">
                        <div class="method-icon">&#127942;</div>
                        <div class="method-info">
                            <div class="method-name">Unlock Achievements</div>
                            <div class="method-reward">+200-1000 credits</div>
                        </div>
                    </div>

                    <div class="credit-method">
                        <div class="method-icon">&#9889;</div>
                        <div class="method-info">
                            <div class="method-name">Speed Bonuses</div>
                            <div class="method-reward">+50-200 credits</div>
                        </div>
                    </div>

                    <div class="credit-method">
                        <div class="method-icon">&#128197;</div>
                        <div class="method-info">
                            <div class="method-name">Daily Login</div>
                            <div class="method-reward">+50 credits</div>
                        </div>
                    </div>
                </div>

                <p style="text-align: center; margin-top: 20px; color: var(--text-secondary);">
                    Start playing to earn credits automatically!
                </p>
            </div>
        `, {
            buttons: [
                {
                    text: 'START PLAYING',
                    class: 'btn-primary',
                    onClick: () => {
                        this.game.screens.showScreen('mission-select');
                    }
                }
            ]
        });
    }

    splitName(name) {
        const cleaned = String(name || '').trim();
        if (!cleaned) return ['USER', ''];
        const parts = cleaned.split(/\s+/);
        const first = parts.shift() || 'USER';
        const last = parts.join(' ');
        return [first, last];
    }

    getInitials(name) {
        const cleaned = String(name || '').trim();
        if (!cleaned) return 'U';
        const parts = cleaned.split(/\s+/).filter(Boolean);
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }

    formatNumber(value) {
        return Number(value || 0).toLocaleString();
    }

    escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    formatPlayTime(minutes) {
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    }

    calculateSuccessRate(stats) {
        const completed = stats.missionsCompleted || 0;
        const attempted = stats.missionsAttempted || completed;
        if (attempted === 0) return '0%';
        return `${Math.round((completed / attempted) * 100)}%`;
    }

    calculateRank(stats) {
        const score = stats.totalScore || 0;
        if (score < 1000) return 'Rookie';
        if (score < 5000) return 'Agent';
        if (score < 15000) return 'Operative';
        if (score < 30000) return 'Specialist';
        if (score < 50000) return 'Elite';
        return 'Shadow Master';
    }

    getRankIndex(rank) {
        const order = ['Rookie', 'Agent', 'Operative', 'Specialist', 'Elite', 'Shadow Master'];
        const idx = order.findIndex((item) => item.toLowerCase() === String(rank).toLowerCase());
        return idx >= 0 ? idx : 0;
    }
}
