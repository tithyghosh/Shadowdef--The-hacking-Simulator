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
        const unlockedCount = achievements.filter((a) => a.unlocked).length;
        const totalCount = achievements.length;
        const completion = totalCount ? (unlockedCount / totalCount) * 100 : 0;
        const activeAchievement = this.getLatestUnlocked(achievements);

        const badgeIconMap = {
            'first_mission':  { icon: '⚡', color: 'gold',   label: 'FIRST\nBREACH' },
            'speed_demon':    { icon: '🔓', color: 'cyan',   label: 'CIPHER\nBREAKER' },
            'perfectionist':  { icon: '🔥', color: 'red',    label: 'PHANTOM\nSTRIKE' },
            'high_scorer':    { icon: '🛡',  color: 'green',  label: 'GHOST\nPROTOCOL' },
            'dedicated':      { icon: '💀', color: 'purple', label: 'DARK NET\nLEGEND' },
            'collector':      { icon: '👑', color: 'silver', label: 'SHADOW\nMASTER' },
        };

        container.innerHTML = `
            <div class="ach-shell">
                <canvas class="ach-canvas" id="ach-canvas"></canvas>
                <div class="ach-scanlines" aria-hidden="true"></div>
                <div class="ach-vignette" aria-hidden="true"></div>
                <div class="ach-hud-top" aria-hidden="true"></div>

                <div class="ach-page">
                    <!-- HEADER -->
                    <div class="ach-hdr">
                        <div>
                            <button class="ach-back-btn" data-action="back" type="button">BACK</button>
                            <div class="ach-eyebrow">OPERATIONS VAULT</div>
                            <div class="ach-title">BADGES</div>
                            <div class="ach-sub">Live achievement vault. Every badge is tied to a real unlock rule enforced by mission completion, score, speed, playtime, or credit milestones.</div>
                        </div>
                        <div class="ach-hdr-right">
                            <div class="ach-pill c">${user ? 'AUTH LINKED' : 'GUEST MODE'}</div>
                            <div class="ach-pill g">${unlockedCount}/${totalCount} SECURED</div>
                        </div>
                    </div>

                    <!-- BODY -->
                    <div class="ach-body">
                        <!-- TOP ROW -->
                        <div class="ach-top-row">
                            <!-- Badge Counter -->
                            <div class="ach-counter">
                                <div class="ach-ring">
                                    <div class="ach-ring-num">${unlockedCount}<span>/${totalCount}</span></div>
                                </div>
                                <div class="ach-ring-label">BADGES SECURED</div>
                            </div>
                            <!-- Stat Grid -->
                            <div class="ach-stat-grid">
                                <div class="ach-stat-box">
                                    <div class="ach-stat-lbl">MISSIONS</div>
                                    <div class="ach-stat-val ${stats.missionsCompleted ? '' : 'muted'}">${stats.missionsCompleted || '—'}</div>
                                </div>
                                <div class="ach-stat-box">
                                    <div class="ach-stat-lbl">HIGH SCORE</div>
                                    <div class="ach-stat-val ${stats.highScore ? '' : 'muted'}">${stats.highScore ? this.formatNumber(stats.highScore) : '—'}</div>
                                </div>
                                <div class="ach-stat-box">
                                    <div class="ach-stat-lbl">FIELD TIME</div>
                                    <div class="ach-stat-val">${this.formatPlaytime(stats.totalPlayTime || 0)}</div>
                                </div>
                                <div class="ach-stat-box">
                                    <div class="ach-stat-lbl">CREDITS</div>
                                    <div class="ach-stat-val gold">${this.formatNumber(stats.credits || 1000)}</div>
                                </div>
                            </div>
                        </div>

                        <!-- VAULT ROW -->
                        <div class="ach-vault-row">
                            <!-- Badge Vault -->
                            <div class="ach-vault-panel">
                                <div class="ach-vault-head">
                                    <div>
                                        <div class="ach-vault-tag">BADGE VAULT</div>
                                        <div class="ach-vault-title">Current Unlock Set</div>
                                    </div>
                                    <div class="ach-vault-count"><span>${unlockedCount}</span> unlocked | ${totalCount - unlockedCount} remaining</div>
                                </div>
                                <div class="ach-vault-progress">
                                    <div class="ach-vp-top"><span>VAULT PROGRESS</span><span>${Math.round(completion)}%</span></div>
                                    <div class="ach-vp-bar"><div class="ach-vp-fill" style="width:${completion.toFixed(1)}%"></div></div>
                                </div>
                                <div class="ach-badge-grid">
                                    ${achievements.map((a) => {
                                        const map = badgeIconMap[a.id] || { icon: '🏅', color: 'cyan', label: a.shortName || a.name };
                                        return `
                                        <div class="ach-badge-item ${a.unlocked ? '' : 'locked'}" title="${a.requirement}">
                                            <div class="ach-badge-icon ${map.color}">
                                                ${map.icon}
                                                ${a.unlocked ? '' : '<div class="ach-lock-ov">🔒</div>'}
                                            </div>
                                            <div class="ach-badge-name">${map.label.replace('\n', '<br>')}</div>
                                            ${a.unlocked ? '' : `<div class="ach-badge-prog-track"><div class="ach-badge-prog-fill" style="width:${a.progress.toFixed(0)}%"></div></div>`}
                                        </div>`;
                                    }).join('')}
                                </div>
                            </div>

                            <!-- Active Badge -->
                            <div class="ach-active-panel">
                                <div class="ach-active-head">
                                    <div class="ach-active-tag">ACTIVE BADGE</div>
                                    <div class="ach-active-title">Current Status</div>
                                </div>
                                <div class="ach-active-body">
                                    ${activeAchievement ? (() => {
                                        const map = badgeIconMap[activeAchievement.id] || { icon: '🏅', color: 'cyan' };
                                        return `
                                        <div class="ach-active-icon ${map.color}">${map.icon}</div>
                                        <div class="ach-active-name">${activeAchievement.name}</div>
                                        <div class="ach-active-desc">${activeAchievement.description}</div>`;
                                    })() : `
                                        <div class="ach-empty">
                                            <div class="ach-empty-icon">🏅</div>
                                            <div class="ach-empty-text">NO BADGE SECURED YET<br>COMPLETE MISSIONS<br>TO UNLOCK BADGES</div>
                                        </div>`}
                                </div>

                                ${!user ? `
                                <div class="ach-guest-note">
                                    <div class="ach-guest-text">Login to save badge progress across sessions.</div>
                                    <button class="ach-login-btn" data-action="login" type="button">OPEN LOGIN</button>
                                </div>` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.initCanvas(container);
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

    initCanvas(container) {
        const cv = container.querySelector('#ach-canvas');
        if (!cv) return;
        const cx = cv.getContext('2d');

        const resize = () => { cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; };
        resize();

        const bins = Array.from({ length: 22 }, () => ({
            x: Math.random() * cv.width, y: Math.random() * cv.height,
            v: Math.floor(Math.random() * 1048576).toString(2).slice(0, 6),
            o: Math.random() * 0.06 + 0.02, s: Math.random() * 0.1 + 0.03
        }));
        const pts = Array.from({ length: 40 }, () => ({
            x: Math.random() * cv.width, y: Math.random() * cv.height,
            vx: (Math.random() - 0.5) * 0.22, vy: (Math.random() - 0.5) * 0.22,
            r: Math.random() * 1.3 + 0.3, o: Math.random() * 0.16 + 0.04
        }));

        let running = true;
        const draw = () => {
            if (!running || !cv.isConnected) return;
            requestAnimationFrame(draw);
            cx.clearRect(0, 0, cv.width, cv.height);
            const g = cx.createRadialGradient(cv.width * 0.5, cv.height * 0.5, 0, cv.width * 0.5, cv.height * 0.5, cv.width * 0.8);
            g.addColorStop(0, 'rgba(6,18,48,1)'); g.addColorStop(0.5, 'rgba(4,9,24,1)'); g.addColorStop(1, 'rgba(2,4,14,1)');
            cx.fillStyle = g; cx.fillRect(0, 0, cv.width, cv.height);
            bins.forEach((b) => {
                b.y -= b.s; if (b.y < -20) { b.y = cv.height + 10; b.x = Math.random() * cv.width; }
                cx.font = '10px Share Tech Mono'; cx.fillStyle = `rgba(0,200,230,${b.o})`; cx.fillText(b.v, b.x, b.y);
            });
            pts.forEach((p) => {
                p.x += p.vx; p.y += p.vy;
                if (p.x < 0) p.x = cv.width; if (p.x > cv.width) p.x = 0;
                if (p.y < 0) p.y = cv.height; if (p.y > cv.height) p.y = 0;
                cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                cx.fillStyle = `rgba(0,200,230,${p.o})`; cx.fill();
            });
            for (let i = 0; i < pts.length; i++) {
                for (let j = i + 1; j < pts.length; j++) {
                    const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y, d = Math.sqrt(dx * dx + dy * dy);
                    if (d < 88) {
                        cx.beginPath(); cx.moveTo(pts[i].x, pts[i].y); cx.lineTo(pts[j].x, pts[j].y);
                        cx.strokeStyle = `rgba(0,180,220,${0.06 * (1 - d / 88)})`; cx.lineWidth = 0.5; cx.stroke();
                    }
                }
            }
        };
        draw();
        window.addEventListener('resize', resize);
        // Stop when screen is hidden
        const obs = new MutationObserver(() => { if (!container.classList.contains('active')) running = false; });
        obs.observe(container, { attributes: true, attributeFilter: ['class'] });
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
