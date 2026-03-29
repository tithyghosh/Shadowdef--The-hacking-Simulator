export class MissionSelect {
    constructor(game) {
        this.game = game;
        this.ui = game.ui;
        this.audio = game.audio;
        this.selectedMissionId = null;
        this.openMissionId = null;
        this.animationFrame = null;
        this.resizeHandler = null;
        this.canvasState = null;
        this.clockInterval = null;
        this.passwordResizeHandler = null;
    }

    render(missions) {
        const grid = document.getElementById('mission-grid');
        if (!grid) return console.error('Mission grid not found');
        this.renderMissionCollection(missions, grid);
    }

    renderCategory(missions, gridId) {
        const grid = document.getElementById(gridId);
        if (!grid) return console.error(`Mission grid not found: ${gridId}`);
        this.renderMissionCollection(missions, grid);
    }

    renderMissionCollection(missions, grid) {
        this.teardownCanvas();
        this.teardownPasswordSector();
        grid.innerHTML = '';

        const screen = grid.closest('.screen');
        const header = screen?.querySelector('.mission-header');
        const backBtn = screen?.querySelector('.back-btn');

        if (!Array.isArray(missions) || missions.length === 0) {
            grid.innerHTML = '<div class="sd-password-empty">NO MISSIONS DEPLOYED</div>';
            return;
        }

        if (header) header.style.display = 'none';
        if (backBtn) backBtn.style.display = 'none';

        if (screen?.id === 'password-missions') {
            this.renderPasswordSector(missions, grid, screen, header, backBtn);
            return;
        }

        const meta = this.getHeaderMeta(
            screen?.id,
            header?.querySelector('h2')?.textContent?.trim() || 'PASSWORD CRACKING',
            header?.querySelector('.subtitle')?.textContent?.trim() || 'SECTOR 01 · 10 NODES · OPERATION STACK'
        );

        const selected = missions.find((mission) => mission.level === 3)
            || missions.find((mission) => !mission.locked && mission.completed)
            || missions.find((mission) => !mission.locked)
            || missions[0];

        const shell = document.createElement('div');
        shell.className = 'sd-password-select';
        shell.innerHTML = `
            <div class="sd-password-hudbar"></div>
            <canvas id="canvas" class="sd-password-canvas"></canvas>
            <div class="sd-password-scanlines"></div>
            <div class="sd-password-vignette"></div>

            <div class="sd-password-shell">
                <header class="sd-password-header sd-panel">
                    <div class="sd-password-header-left">
                        <button class="sd-password-back" type="button">◂ BACK TO CATEGORIES</button>
                        <div class="sd-password-title-row">
                            <div class="sd-password-icon-badge" aria-hidden="true">
                                <svg viewBox="0 0 32 32" role="presentation">
                                    <circle cx="16" cy="16" r="9"></circle>
                                    <circle cx="16" cy="16" r="4"></circle>
                                    <line x1="16" y1="2.5" x2="16" y2="8"></line>
                                    <line x1="16" y1="24" x2="16" y2="29.5"></line>
                                    <line x1="2.5" y1="16" x2="8" y2="16"></line>
                                    <line x1="24" y1="16" x2="29.5" y2="16"></line>
                                </svg>
                            </div>
                            <div class="sd-password-title-copy">
                                <h2 class="sd-password-title">${meta.title}</h2>
                                <div class="sd-password-subtitle">${meta.subtitle}</div>
                            </div>
                        </div>
                    </div>
                    <div class="sd-password-header-right">
                        ${this.renderHeaderPill(`${missions.filter((mission) => !mission.locked && !mission.completed).length} ACTIVE`, 'is-active')}
                        ${this.renderHeaderPill(`${missions.filter((mission) => mission.locked).length} SEALED`, 'is-sealed')}
                        ${this.renderHeaderPill(`${missions.reduce((sum, mission) => sum + (mission.bestScore || 0), 0)} PTS`, 'is-points')}
                    </div>
                </header>

                <div class="sd-password-body">
                    <section class="sd-password-map-panel">
                        <div class="sd-password-grid">
                            ${missions.map((mission, index) => this.renderCard(mission, mission.id === selected.id, index)).join('')}
                        </div>
                    </section>

                    <aside class="sd-password-detail-panel sd-panel">
                        <div class="sd-password-detail-content"></div>
                    </aside>
                </div>
            </div>
        `;

        const customBack = shell.querySelector('.sd-password-back');
        if (backBtn) customBack.addEventListener('click', () => backBtn.click());

        shell.querySelectorAll('[data-mission-id]').forEach((card) => {
            card.addEventListener('click', () => {
                const missionId = Number(card.dataset.missionId);
                const mission = missions.find((item) => item.id === missionId);
                if (!mission) return;
                this.updateSelection(shell, mission, missions);
            });
        });

        grid.appendChild(shell);
        this.updateSelection(shell, selected, missions);
        this.setupCanvas(shell.querySelector('#canvas'));
    }

    renderPasswordSector(missions, grid, screen, header, backBtn) {
        const meta = this.getHeaderMeta(
            screen?.id,
            header?.querySelector('h2')?.textContent?.trim() || 'PASSWORD CRACKING',
            header?.querySelector('.subtitle')?.textContent?.trim() || 'SECTOR 01 · 10 NODES · OPERATION STACK'
        );

        const clearedCount = missions.filter((mission) => mission.completed).length;
        const sealedCount = missions.filter((mission) => {
            const state = this.getMissionDisplayState(mission, missions);
            return state === 'locked' || state === 'sealed';
        }).length;
        const totalScore = missions.reduce((sum, mission) => sum + (mission.bestScore || 0), 0);
        const selected = missions.find((mission) => this.getMissionDisplayState(mission, missions) === 'active')
            || missions.find((mission) => mission.completed)
            || missions[0];

        this.selectedMissionId = selected?.id ?? null;
        this.openMissionId = null;

        const shell = document.createElement('div');
        shell.className = 'sd-password-sector';
        shell.innerHTML = `
            <div class="sd-password-sector-bg"></div>
            <nav class="sd-password-sector-nav">
                <div class="sd-password-sector-logo">S H A D O W D E F</div>
                <div class="sd-password-sector-mid">
                    <span><span class="sd-password-dot is-green"></span>ONLINE</span>
                    <span><span class="sd-password-dot is-red"></span>3 THREATS</span>
                    <span>MISSION 01 · PASSWORD SECTOR</span>
                </div>
                <div class="sd-password-sector-nav-right">
                    <button class="sd-password-sector-back" type="button">BACK TO CATEGORIES</button>
                    <div class="sd-password-sector-clock" data-clock>--:--:--</div>
                </div>
            </nav>

            <div class="sd-password-sector-page">
                <section class="sd-password-sector-left">
                    <div class="sd-password-sector-mission">
                        <div class="sd-password-sector-mid-top">
                            <div class="sd-password-sector-hex" aria-hidden="true">🔑</div>
                            <div>
                                <div class="sd-password-sector-tag">// SECTOR 01 · OPERATION STACK</div>
                                <div class="sd-password-sector-title">${meta.title}</div>
                            </div>
                        </div>
                        <div class="sd-password-sector-stats">
                            <div class="sd-password-sector-stat">
                                <div class="sd-password-sector-stat-value is-green">${clearedCount}</div>
                                <div class="sd-password-sector-stat-label">CLEARED</div>
                            </div>
                            <div class="sd-password-sector-stat">
                                <div class="sd-password-sector-stat-value is-red">${sealedCount}</div>
                                <div class="sd-password-sector-stat-label">SEALED</div>
                            </div>
                            <div class="sd-password-sector-stat">
                                <div class="sd-password-sector-stat-value is-gold">${totalScore}</div>
                                <div class="sd-password-sector-stat-label">SCORE</div>
                            </div>
                        </div>
                        <div class="sd-password-sector-progress">
                            <div class="sd-password-sector-progress-row">
                                <span>MISSION PROGRESS</span>
                                <span class="is-value">${clearedCount} / ${missions.length}</span>
                            </div>
                            <div class="sd-password-sector-progress-track">
                                <div class="sd-password-sector-progress-fill" style="width:${(clearedCount / Math.max(missions.length, 1)) * 100}%"></div>
                            </div>
                            <div class="sd-password-sector-progress-ticks">
                                ${missions.map(() => '<div class="sd-password-sector-progress-tick"></div>').join('')}
                            </div>
                        </div>
                    </div>
                    <div class="sd-password-sector-files" data-file-list>
                        ${missions.map((mission, index) => this.renderPasswordMissionRow(mission, missions, index)).join('')}
                    </div>
                </section>

                <section class="sd-password-sector-right" data-right-panel>
                    <div class="sd-password-sector-right-bg"></div>
                    <div class="sd-password-sector-hexgrid"></div>
                    <div class="sd-password-sector-scanline"></div>
                    <div class="sd-password-sector-watermark">PASSWORD</div>
                    <div class="sd-password-sector-timeline-wrap">
                        <svg class="sd-password-sector-timeline" data-timeline xmlns="http://www.w3.org/2000/svg"></svg>
                    </div>
                    <div class="sd-password-sector-card" data-card>
                        <div class="sd-password-sector-card-top">
                            <div class="sd-password-sector-card-label" data-card-label>// SELECTED NODE</div>
                            <div class="sd-password-sector-card-name" data-card-name>—</div>
                        </div>
                        <div class="sd-password-sector-card-body" data-card-body></div>
                    </div>
                </section>
            </div>

            <div class="sd-password-sector-status">
                <div class="sd-password-sector-status-item"><span class="is-green">■</span>NETWORK: SECURE</div>
                <div class="sd-password-sector-status-item"><span class="is-green">■</span>AES-256 ACTIVE</div>
                <div class="sd-password-sector-status-item"><span class="is-red">■</span>3 THREATS</div>
                <div class="sd-password-sector-status-item">OPERATOR: MAIMUNAH TABASSUM</div>
                <div class="sd-password-sector-status-utc" data-utc>--:--:-- UTC</div>
            </div>
        `;

        const customBack = shell.querySelector('.sd-password-sector-back');
        if (backBtn) customBack?.addEventListener('click', () => backBtn.click());

        shell.querySelectorAll('[data-mission-row]').forEach((row) => {
            row.addEventListener('click', (event) => {
                if (event.target.closest('[data-enter-mission]')) return;
                const missionId = Number(row.dataset.missionRow);
                const mission = missions.find((item) => item.id === missionId);
                if (!mission) return;
                this.togglePasswordMission(shell, mission, missions);
            });
        });

        shell.querySelectorAll('[data-enter-mission]').forEach((button) => {
            button.addEventListener('click', (event) => {
                event.stopPropagation();
                const missionId = Number(button.dataset.enterMission);
                const mission = missions.find((item) => item.id === missionId);
                if (!mission || mission.locked) return;
                this.selectMission(mission);
            });
        });

        grid.appendChild(shell);
        this.startPasswordClock(shell);
        this.passwordResizeHandler = () => this.renderPasswordTimeline(shell, missions);
        window.addEventListener('resize', this.passwordResizeHandler);
        requestAnimationFrame(() => {
            this.renderPasswordTimeline(shell, missions);
            this.updatePasswordSelection(shell, selected, missions, true);
        });
    }

    renderPasswordMissionRow(mission, missions, index) {
        const state = this.getMissionDisplayState(mission, missions);
        const canExpand = state !== 'sealed';
        const rewards = [];
        if (mission.bestScore) rewards.push(`<span class="sd-password-sector-reward is-score">✓ ${mission.bestScore.toLocaleString()} PTS</span>`);
        rewards.push(`<span class="sd-password-sector-reward is-xp">⚡ +${mission.rewards?.xp || 0} XP</span>`);
        rewards.push(`<span class="sd-password-sector-reward is-credit">🪙 +${mission.rewards?.credits || 0}</span>`);

        const badge = this.getMissionBadge(mission.level);
        if (badge) rewards.push(`<span class="sd-password-sector-reward is-badge">${badge.icon} ${badge.name}</span>`);

        return `
            <div
                class="sd-password-sector-row is-${state} ${this.selectedMissionId === mission.id ? 'is-selected' : ''}"
                data-mission-row="${mission.id}"
                style="animation-delay:${(index * 0.045).toFixed(2)}s"
            >
                <div class="sd-password-sector-indicator"></div>
                <div class="sd-password-sector-tab">
                    <div class="sd-password-sector-num">L${mission.level}</div>
                    <div class="sd-password-sector-info">
                        <div class="sd-password-sector-name">${this.cleanMissionTitle(mission.title, mission.level)}</div>
                        <div class="sd-password-sector-meta is-${String(mission.difficulty || '').toLowerCase()}">${String(mission.difficulty || '').toUpperCase()} · ${mission.estimatedTime}</div>
                    </div>
                    ${badge ? `<div class="sd-password-sector-star">${badge.icon}</div>` : ''}
                    <div class="sd-password-sector-file-status is-${state}">${this.getMissionSectorLabel(state)}</div>
                    ${canExpand ? '<div class="sd-password-sector-chevron">›</div>' : ''}
                </div>
                ${canExpand ? `
                    <div class="sd-password-sector-expand">
                        <div class="sd-password-sector-expand-inner">
                            <div class="sd-password-sector-desc">${mission.desc || ''}</div>
                            <div class="sd-password-sector-objects">
                                ${(mission.objectives || []).map((objective) => `<div class="sd-password-sector-object">${objective}</div>`).join('')}
                            </div>
                            <div class="sd-password-sector-rewards">${rewards.join('')}</div>
                            <button
                                class="sd-password-sector-action ${mission.completed ? 'is-replay' : state === 'locked' ? 'is-disabled' : 'is-enter'}"
                                type="button"
                                data-enter-mission="${mission.id}"
                                ${mission.locked ? 'disabled' : ''}
                            >
                                ${mission.completed ? '↺  REPLAY LEVEL' : state === 'locked' ? 'LOCKED MISSION' : '▶  ENTER MISSION'}
                            </button>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    togglePasswordMission(shell, mission, missions) {
        this.selectedMissionId = mission.id;
        if (this.openMissionId === mission.id) {
            this.openMissionId = null;
            this.updatePasswordSelection(shell, mission, missions, false);
            return;
        }

        this.openMissionId = mission.id;
        this.updatePasswordSelection(shell, mission, missions, true);
        shell.querySelector(`[data-mission-row="${mission.id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    updatePasswordSelection(shell, mission, missions, showCard = false) {
        if (!shell || !mission) return;

        shell.querySelectorAll('[data-mission-row]').forEach((row) => {
            const rowId = Number(row.dataset.missionRow);
            row.classList.toggle('is-open', rowId === this.openMissionId);
            row.classList.toggle('is-selected', rowId === mission.id);
        });

        this.updatePasswordTimelineSelection(shell, mission.id);
        this.updatePasswordCard(shell, mission, missions, showCard);
    }

    updatePasswordCard(shell, mission, missions, showCard) {
        const card = shell.querySelector('[data-card]');
        const label = shell.querySelector('[data-card-label]');
        const name = shell.querySelector('[data-card-name]');
        const body = shell.querySelector('[data-card-body]');
        if (!card || !label || !name || !body) return;

        if (!showCard) {
            card.classList.remove('is-visible');
            return;
        }

        const state = this.getMissionDisplayState(mission, missions);
        const difficulty = String(mission.difficulty || '').toLowerCase();
        label.textContent = `// L${mission.level} · ${String(mission.difficulty || '').toUpperCase()}`;
        name.textContent = this.cleanMissionTitle(mission.title, mission.level);
        body.innerHTML = [
            { label: 'STATUS', value: this.getMissionSectorLabel(state), className: state === 'cleared' ? 'is-green' : state === 'active' ? 'is-cyan' : state === 'locked' ? 'is-gold' : '' },
            { label: 'DIFFICULTY', value: String(mission.difficulty || '').toUpperCase(), className: difficulty === 'easy' ? 'is-green' : difficulty === 'medium' ? 'is-gold' : '' },
            { label: 'TIME', value: mission.estimatedTime || '—', className: '' },
            { label: 'XP REWARD', value: `+${mission.rewards?.xp || 0} XP`, className: 'is-gold' },
            { label: 'CREDITS', value: `+${mission.rewards?.credits || 0}`, className: 'is-gold' },
            { label: 'BEST SCORE', value: mission.bestScore ? mission.bestScore.toLocaleString() : '—', className: mission.bestScore ? 'is-green' : '' }
        ].map((item) => `
            <div class="sd-password-sector-card-row">
                <span class="sd-password-sector-card-row-label">${item.label}</span>
                <span class="sd-password-sector-card-row-value ${item.className}">${item.value}</span>
            </div>
        `).join('');
        card.classList.add('is-visible');
    }

    renderPasswordTimeline(shell, missions) {
        const panel = shell.querySelector('[data-right-panel]');
        const svg = shell.querySelector('[data-timeline]');
        if (!panel || !svg) return;

        const width = panel.clientWidth || 1;
        const height = panel.clientHeight || 1;
        if (width < 80 || height < 80) {
            requestAnimationFrame(() => this.renderPasswordTimeline(shell, missions));
            return;
        }
        const ns = 'http://www.w3.org/2000/svg';
        svg.innerHTML = '';
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

        const defs = document.createElementNS(ns, 'defs');
        defs.appendChild(this.createPasswordGlow(ns, 'sdPasswordGlowGreen', '#00ff88', 5));
        defs.appendChild(this.createPasswordGlow(ns, 'sdPasswordGlowCyan', '#00e5ff', 6));
        defs.appendChild(this.createPasswordGlow(ns, 'sdPasswordGlowGold', '#ffd700', 5));
        svg.appendChild(defs);

        const leftX = width * 0.22;
        const rightX = width * 0.58;
        const topY = height * 0.1;
        const bottomY = height * 0.9;
        const step = (bottomY - topY) / 4;
        const positions = [];

        for (let index = 0; index < 5; index += 1) positions.push({ x: leftX, y: topY + (step * index), side: 'left' });
        for (let index = 0; index < 5; index += 1) positions.push({ x: rightX, y: topY + (step * (4 - index)), side: 'right' });

        missions.forEach((mission, index) => {
            mission._timelinePosition = positions[index];
        });

        for (let index = 0; index < missions.length - 1; index += 1) {
            const current = missions[index];
            const next = missions[index + 1];
            const currentState = this.getMissionDisplayState(current, missions);
            const nextState = this.getMissionDisplayState(next, missions);
            const connector = document.createElementNS(ns, 'path');
            const connectorPath = this.getPasswordConnectorPath(current._timelinePosition, next._timelinePosition);
            connector.setAttribute('d', connectorPath);
            connector.setAttribute('fill', 'none');
            connector.setAttribute('stroke', currentState === 'cleared' ? 'rgba(0,255,136,.22)' : currentState === 'active' || nextState === 'active' ? 'rgba(0,229,255,.18)' : 'rgba(0,229,255,.08)');
            connector.setAttribute('stroke-width', '1.5');
            if (currentState !== 'cleared') connector.setAttribute('stroke-dasharray', '5 5');
            svg.appendChild(connector);

            if (currentState === 'cleared' || currentState === 'active' || nextState === 'active') {
                const motionPath = document.createElementNS(ns, 'path');
                const pathId = `sd-password-path-${index}-${current.id}-${next.id}`;
                motionPath.setAttribute('id', pathId);
                motionPath.setAttribute('d', connectorPath);
                motionPath.setAttribute('fill', 'none');
                motionPath.setAttribute('stroke', 'none');
                svg.appendChild(motionPath);

                const dot = document.createElementNS(ns, 'circle');
                dot.setAttribute('r', '3');
                dot.setAttribute('fill', currentState === 'cleared' ? '#00ff88' : '#00e5ff');
                dot.setAttribute('opacity', '0.75');
                dot.setAttribute('filter', currentState === 'cleared' ? 'url(#sdPasswordGlowGreen)' : 'url(#sdPasswordGlowCyan)');

                const animateMotion = document.createElementNS(ns, 'animateMotion');
                animateMotion.setAttribute('dur', `${2.2 + (index * 0.12)}s`);
                animateMotion.setAttribute('repeatCount', 'indefinite');
                animateMotion.setAttribute('rotate', 'auto');

                const mpath = document.createElementNS(ns, 'mpath');
                mpath.setAttributeNS('http://www.w3.org/1999/xlink', 'href', `#${pathId}`);
                animateMotion.appendChild(mpath);
                dot.appendChild(animateMotion);
                svg.appendChild(dot);
            }
        }

        missions.forEach((mission) => {
            const state = this.getMissionDisplayState(mission, missions);
            const position = mission._timelinePosition;
            const badge = this.getMissionBadge(mission.level);
            const isBadge = Boolean(badge);
            const radius = isBadge ? 26 : state === 'active' ? 22 : 18;
            const stroke = state === 'cleared'
                ? '#00ff88'
                : state === 'active'
                    ? '#00e5ff'
                    : state === 'locked'
                        ? '#ffd700'
                        : 'rgba(200,232,240,.18)';
            const fill = state === 'cleared'
                ? 'rgba(0,255,136,.08)'
                : state === 'active'
                    ? 'rgba(0,229,255,.1)'
                    : state === 'locked'
                        ? 'rgba(255,215,0,.06)'
                        : 'rgba(3,14,32,.8)';

            const terrainRing = document.createElementNS(ns, 'circle');
            terrainRing.setAttribute('cx', position.x);
            terrainRing.setAttribute('cy', position.y);
            terrainRing.setAttribute('r', radius + 22);
            terrainRing.setAttribute('fill', 'none');
            terrainRing.setAttribute('stroke', stroke);
            terrainRing.setAttribute('stroke-width', '0.5');
            terrainRing.setAttribute('opacity', '0.06');
            svg.appendChild(terrainRing);

            if (state === 'active') {
                const pulse = document.createElementNS(ns, 'circle');
                pulse.setAttribute('cx', position.x);
                pulse.setAttribute('cy', position.y);
                pulse.setAttribute('r', radius);
                pulse.setAttribute('fill', 'none');
                pulse.setAttribute('stroke', '#00e5ff');
                pulse.setAttribute('stroke-width', '2');
                const animateRadius = document.createElementNS(ns, 'animate');
                animateRadius.setAttribute('attributeName', 'r');
                animateRadius.setAttribute('values', `${radius};${radius + 16};${radius}`);
                animateRadius.setAttribute('dur', '2.5s');
                animateRadius.setAttribute('repeatCount', 'indefinite');
                const animateOpacity = document.createElementNS(ns, 'animate');
                animateOpacity.setAttribute('attributeName', 'opacity');
                animateOpacity.setAttribute('values', '0.6;0;0.6');
                animateOpacity.setAttribute('dur', '2.5s');
                animateOpacity.setAttribute('repeatCount', 'indefinite');
                pulse.appendChild(animateRadius);
                pulse.appendChild(animateOpacity);
                svg.appendChild(pulse);
            }

            if (state === 'locked') {
                const lockRing = document.createElementNS(ns, 'circle');
                lockRing.setAttribute('cx', position.x);
                lockRing.setAttribute('cy', position.y);
                lockRing.setAttribute('r', radius + 12);
                lockRing.setAttribute('fill', 'none');
                lockRing.setAttribute('stroke', 'rgba(255,215,0,.45)');
                lockRing.setAttribute('stroke-width', '1');
                lockRing.setAttribute('stroke-dasharray', '4 6');
                svg.appendChild(lockRing);
            }

            if (isBadge && state !== 'sealed') {
                const badgeRing = document.createElementNS(ns, 'circle');
                badgeRing.setAttribute('cx', position.x);
                badgeRing.setAttribute('cy', position.y);
                badgeRing.setAttribute('r', radius + 8);
                badgeRing.setAttribute('fill', 'none');
                badgeRing.setAttribute('stroke', 'rgba(255,215,0,.35)');
                badgeRing.setAttribute('stroke-width', '1');
                badgeRing.setAttribute('stroke-dasharray', '3 4');
                const animateRotate = document.createElementNS(ns, 'animateTransform');
                animateRotate.setAttribute('attributeName', 'transform');
                animateRotate.setAttribute('type', 'rotate');
                animateRotate.setAttribute('values', `0 ${position.x} ${position.y};360 ${position.x} ${position.y}`);
                animateRotate.setAttribute('dur', '8s');
                animateRotate.setAttribute('repeatCount', 'indefinite');
                badgeRing.appendChild(animateRotate);
                svg.appendChild(badgeRing);
            }

            const node = document.createElementNS(ns, 'circle');
            node.setAttribute('cx', position.x);
            node.setAttribute('cy', position.y);
            node.setAttribute('r', radius);
            node.setAttribute('fill', fill);
            node.setAttribute('stroke', stroke);
            node.setAttribute('stroke-width', isBadge || state === 'locked' ? '2' : '1.2');
            if (state === 'cleared') node.setAttribute('filter', 'url(#sdPasswordGlowGreen)');
            if (state === 'active') node.setAttribute('filter', 'url(#sdPasswordGlowCyan)');
            if (state === 'locked') node.setAttribute('filter', 'url(#sdPasswordGlowGold)');
            node.setAttribute('data-node-circle', String(mission.id));
            node.setAttribute('data-default-stroke-width', isBadge || state === 'locked' ? '2' : '1.2');
            svg.appendChild(node);

            const inner = document.createElementNS(ns, 'circle');
            inner.setAttribute('cx', position.x);
            inner.setAttribute('cy', position.y);
            inner.setAttribute('r', Math.max(6, radius - 5));
            inner.setAttribute('fill', 'none');
            inner.setAttribute('stroke', stroke);
            inner.setAttribute('stroke-width', '0.5');
            inner.setAttribute('opacity', '0.3');
            svg.appendChild(inner);

            const centerText = document.createElementNS(ns, 'text');
            centerText.setAttribute('x', position.x);
            centerText.setAttribute('y', position.y + (state === 'cleared' ? 1 : 2));
            centerText.setAttribute('text-anchor', 'middle');
            centerText.setAttribute('dominant-baseline', 'middle');
            if (state === 'cleared') {
                centerText.setAttribute('font-size', '12');
                centerText.setAttribute('fill', '#00ff88');
                centerText.textContent = '✓';
            } else if (state === 'locked') {
                centerText.setAttribute('font-size', '18');
                centerText.textContent = badge ? badge.icon : '⚡';
            } else if (state === 'sealed' && badge) {
                centerText.setAttribute('font-size', '16');
                centerText.textContent = '🔒';
            } else {
                centerText.setAttribute('font-family', "'Share Tech Mono', monospace");
                centerText.setAttribute('font-size', '9');
                centerText.setAttribute('fill', stroke);
                centerText.setAttribute('letter-spacing', '1');
                centerText.textContent = `L${mission.level}`;
            }
            svg.appendChild(centerText);

            const boxWidth = 182;
            const boxHeight = 48;
            const leftSide = position.side === 'left';
            const boxX = leftSide ? position.x + radius + 16 : position.x - radius - 16 - boxWidth;
            const boxY = position.y - (boxHeight / 2);

            const line = document.createElementNS(ns, 'line');
            line.setAttribute('x1', leftSide ? position.x + radius : position.x - radius);
            line.setAttribute('y1', position.y);
            line.setAttribute('x2', leftSide ? position.x + radius + 16 : position.x - radius - 16);
            line.setAttribute('y2', position.y);
            line.setAttribute('stroke', stroke);
            line.setAttribute('stroke-width', '1');
            line.setAttribute('opacity', '0.4');
            svg.appendChild(line);

            const box = document.createElementNS(ns, 'rect');
            box.setAttribute('x', boxX);
            box.setAttribute('y', boxY);
            box.setAttribute('width', boxWidth);
            box.setAttribute('height', boxHeight);
            box.setAttribute('rx', '2');
            box.setAttribute('fill', 'rgba(3,14,32,.9)');
            box.setAttribute('stroke', stroke);
            box.setAttribute('stroke-width', '0.5');
            box.setAttribute('stroke-opacity', '0.35');
            svg.appendChild(box);

            const levelText = document.createElementNS(ns, 'text');
            levelText.setAttribute('x', boxX + 10);
            levelText.setAttribute('y', boxY + 14);
            levelText.setAttribute('font-family', "'Share Tech Mono', monospace");
            levelText.setAttribute('font-size', '7');
            levelText.setAttribute('fill', stroke);
            levelText.setAttribute('opacity', '0.7');
            levelText.textContent = badge ? `★ L${mission.level}` : `L${mission.level}`;
            svg.appendChild(levelText);

            const titleText = document.createElementNS(ns, 'text');
            titleText.setAttribute('x', boxX + (boxWidth / 2));
            titleText.setAttribute('y', boxY + 31);
            titleText.setAttribute('text-anchor', 'middle');
            titleText.setAttribute('dominant-baseline', 'middle');
            titleText.setAttribute('font-family', "'Rajdhani', sans-serif");
            titleText.setAttribute('font-size', '10');
            titleText.setAttribute('fill', stroke);
            titleText.setAttribute('font-weight', '600');
            titleText.textContent = this.truncateTimelineTitle(this.cleanMissionTitle(mission.title, mission.level));
            svg.appendChild(titleText);

            const hit = document.createElementNS(ns, 'circle');
            hit.setAttribute('cx', position.x);
            hit.setAttribute('cy', position.y);
            hit.setAttribute('r', radius + 16);
            hit.setAttribute('fill', 'transparent');
            hit.style.cursor = state === 'sealed' ? 'not-allowed' : 'pointer';
            hit.addEventListener('click', () => {
                if (state === 'sealed') return;
                this.togglePasswordMission(shell, mission, missions);
            });
            svg.appendChild(hit);
        });

        this.updatePasswordTimelineSelection(shell, this.selectedMissionId);
    }

    updatePasswordTimelineSelection(shell, missionId) {
        shell.querySelectorAll('[data-node-circle]').forEach((node) => {
            const isSelected = Number(node.getAttribute('data-node-circle')) === missionId;
            node.setAttribute('stroke-width', isSelected ? '3' : (node.getAttribute('data-default-stroke-width') || '1.2'));
        });
    }

    createPasswordGlow(ns, id, color, deviation) {
        const filter = document.createElementNS(ns, 'filter');
        filter.setAttribute('id', id);
        filter.setAttribute('x', '-60%');
        filter.setAttribute('y', '-60%');
        filter.setAttribute('width', '220%');
        filter.setAttribute('height', '220%');

        const blur = document.createElementNS(ns, 'feGaussianBlur');
        blur.setAttribute('stdDeviation', String(deviation));
        blur.setAttribute('result', 'blur');

        const flood = document.createElementNS(ns, 'feFlood');
        flood.setAttribute('flood-color', color);
        flood.setAttribute('result', 'color');

        const composite = document.createElementNS(ns, 'feComposite');
        composite.setAttribute('in', 'color');
        composite.setAttribute('in2', 'blur');
        composite.setAttribute('operator', 'in');
        composite.setAttribute('result', 'glow');

        const merge = document.createElementNS(ns, 'feMerge');
        const mergeNode1 = document.createElementNS(ns, 'feMergeNode');
        mergeNode1.setAttribute('in', 'glow');
        const mergeNode2 = document.createElementNS(ns, 'feMergeNode');
        mergeNode2.setAttribute('in', 'SourceGraphic');

        merge.appendChild(mergeNode1);
        merge.appendChild(mergeNode2);
        filter.appendChild(blur);
        filter.appendChild(flood);
        filter.appendChild(composite);
        filter.appendChild(merge);
        return filter;
    }

    getPasswordConnectorPath(positionA, positionB) {
        if (positionA.side === positionB.side) {
            return `M${positionA.x},${positionA.y} L${positionB.x},${positionB.y}`;
        }
        const midX = (positionA.x + positionB.x) / 2;
        return `M${positionA.x},${positionA.y} C${midX},${positionA.y} ${midX},${positionB.y} ${positionB.x},${positionB.y}`;
    }

    startPasswordClock(shell) {
        const clock = shell.querySelector('[data-clock]');
        const utc = shell.querySelector('[data-utc]');
        const update = () => {
            const now = new Date();
            if (clock) clock.textContent = now.toTimeString().slice(0, 8);
            if (utc) utc.textContent = `${now.toUTCString().slice(17, 25)} UTC`;
        };

        update();
        this.clockInterval = window.setInterval(update, 1000);
    }

    teardownPasswordSector() {
        if (this.clockInterval) {
            clearInterval(this.clockInterval);
            this.clockInterval = null;
        }
        if (this.passwordResizeHandler) {
            window.removeEventListener('resize', this.passwordResizeHandler);
            this.passwordResizeHandler = null;
        }
    }

    getMissionDisplayState(mission, missions) {
        if (mission.completed) return 'cleared';
        if (!mission.locked) return 'active';
        const firstLocked = missions.find((item) => item.locked && !item.completed);
        if (firstLocked?.id === mission.id) return 'locked';
        return 'sealed';
    }

    getMissionSectorLabel(state) {
        if (state === 'cleared') return 'CLEARED';
        if (state === 'active') return 'ACTIVE';
        if (state === 'locked') return 'LOCKED';
        return 'SEALED';
    }

    getMissionBadge(level) {
        if (level === 5) return { icon: '⚡', name: 'CIPHER BREAKER' };
        if (level === 10) return { icon: '🏆', name: 'FIRST BREACH' };
        return null;
    }

    truncateTimelineTitle(title) {
        return title.length > 20 ? `${title.slice(0, 18)}...` : title;
    }

    renderHeaderPill(text, stateClass) {
        return `<div class="sd-password-pill ${stateClass}">${text}</div>`;
    }

    renderCard(mission, selected, index) {
        const state = this.getMissionState(mission);
        const statusDot = state === 'cleared'
            ? '<span class="sd-password-card-dot is-cleared"></span>'
            : state === 'active'
                ? '<span class="sd-password-card-dot is-active"></span>'
                : '<span class="sd-password-card-dot is-sealed"></span>';

        const statusText = state === 'cleared'
            ? '✓ CLEARED'
            : state === 'active'
                ? '▸ ACTIVE'
                : '🔒 SEALED';

        return `
            <button
                class="sd-password-card is-${state} ${selected ? 'is-selected' : ''}"
                type="button"
                data-mission-id="${mission.id}"
                style="animation-delay:${(index * 0.05).toFixed(2)}s"
            >
                <span class="sd-password-card-accent"></span>
                <div class="sd-password-card-top">
                    <span class="sd-password-card-level">L${mission.level}</span>
                    ${statusDot}
                </div>
                <div class="sd-password-card-name">${this.cleanMissionTitle(mission.title, mission.level)}</div>
                <div class="sd-password-card-duration">${mission.estimatedTime}</div>
                <div class="sd-password-card-status">${statusText}</div>
            </button>
        `;
    }

    updateSelection(shell, mission, missions) {
        this.selectedMissionId = mission.id;
        shell.querySelectorAll('.sd-password-card.is-selected').forEach((card) => card.classList.remove('is-selected'));
        shell.querySelector(`.sd-password-card[data-mission-id="${mission.id}"]`)?.classList.add('is-selected');

        const detail = shell.querySelector('.sd-password-detail-content');
        if (mission.locked) {
            detail.innerHTML = this.renderLockedDetail();
            return;
        }

        const nextMission = this.getNextMission(mission, missions);
        const status = this.getMissionState(mission);
        const isFocus = mission.level === 3;
        const metaBits = [
            String(mission.difficulty || '').toUpperCase(),
            mission.estimatedTime,
            isFocus ? 'FOCUS LEVEL' : 'MISSION NODE'
        ];

        detail.innerHTML = `
            <section class="sd-password-detail-section">
                <div class="sd-password-node-tag">NODE DATA</div>
                <div class="sd-password-identity-row">
                    <span class="sd-password-level-pill">L${mission.level}</span>
                    <span class="sd-password-status-pill is-${status}">${this.getStateLabel(mission)}</span>
                </div>
                <h3 class="sd-password-detail-title">${this.cleanMissionTitle(mission.title, mission.level)}</h3>
                <div class="sd-password-meta-row">${metaBits.join(' <span>·</span> ')}</div>
            </section>

            <section class="sd-password-detail-section">
                <div class="sd-password-section-head is-red"><span>// OBJECTIVES</span></div>
                <div class="sd-password-objectives">
                    ${(mission.objectives || []).map((objective) => `
                        <div class="sd-password-objective-card">
                            <span class="sd-password-objective-prefix">▸</span>
                            <span class="sd-password-objective-text">${objective}</span>
                        </div>
                    `).join('')}
                </div>
            </section>

            <section class="sd-password-detail-section">
                <div class="sd-password-section-head is-gold"><span>// REWARDS & STATS</span></div>
                <div class="sd-password-best-score">${mission.bestScore ? mission.bestScore.toLocaleString() : '0'}</div>
                <div class="sd-password-best-label">BEST SCORE</div>
                <div class="sd-password-rewards-row">
                    <div class="sd-password-reward-pill is-cyan">+${mission.rewards?.xp || 0} XP</div>
                    <div class="sd-password-reward-pill is-gold">+${mission.rewards?.credits || 0} CREDITS</div>
                </div>
            </section>

            <section class="sd-password-detail-section sd-password-actions">
                <button class="sd-password-action sd-password-action--primary" type="button" data-action="play-current">
                    ${mission.completed ? 'REPLAY LEVEL' : 'ENTER LEVEL'}
                </button>
                <button
                    class="sd-password-action sd-password-action--next ${nextMission && !nextMission.locked ? 'is-open' : 'is-locked'}"
                    type="button"
                    data-action="play-next"
                    ${nextMission && !nextMission.locked ? '' : 'disabled'}
                >
                    ${nextMission ? (nextMission.locked ? '🔒 NEXT LEVEL LOCKED' : 'NEXT LEVEL →') : 'SECTOR COMPLETE'}
                </button>
            </section>
        `;

        detail.querySelector('[data-action="play-current"]')?.addEventListener('click', () => this.selectMission(mission));
        detail.querySelector('[data-action="play-next"]')?.addEventListener('click', () => {
            if (nextMission && !nextMission.locked) this.selectMission(nextMission);
        });
    }

    renderLockedDetail() {
        return `
            <section class="sd-password-locked-state">
                <div class="sd-password-locked-icon">⚠</div>
                <div class="sd-password-locked-title">COMPLETE PREVIOUS LEVEL TO UNLOCK THIS NODE</div>
                <div class="sd-password-locked-copy">LOCKED SECTOR DATA. CLEAR THE CURRENT OPERATION STACK TO OPEN THIS MISSION.</div>
            </section>
        `;
    }

    getHeaderMeta(screenId, title, subtitle) {
        const map = {
            'password-missions': {
                title: 'PASSWORD CRACKING',
                subtitle: 'SECTOR 01 · 10 NODES · OPERATION STACK'
            },
            'malware-missions': {
                title: title || 'MALWARE DETECTION',
                subtitle: `SECTOR 02 · 10 NODES · OPERATION STACK`
            },
            'network-missions': {
                title: title || 'NETWORK & PHISHING',
                subtitle: `SECTOR 03 · 10 NODES · OPERATION STACK`
            }
        };
        return map[screenId] || {
            title: title || 'MISSION CONTROL',
            subtitle: subtitle || 'SECTOR STACK'
        };
    }

    getMissionState(mission) {
        return mission.locked ? 'sealed' : mission.completed ? 'cleared' : 'active';
    }

    getStateLabel(mission) {
        const state = this.getMissionState(mission);
        if (state === 'cleared') return 'CLEARED';
        if (state === 'active') return 'ACTIVE';
        return 'SEALED';
    }

    getNextMission(mission, missions) {
        return missions.find((item) => item.level === mission.level + 1) || null;
    }

    selectMission(mission) {
        if (mission.locked) {
            this.ui.showNotification('Complete previous levels to unlock!', 'warning');
            return;
        }

        this.audio.playButtonClick();
        this.showBriefing(mission);
    }

    showBriefing(mission) {
        const difficulty = String(mission.difficulty || '').toLowerCase();
        const objectives = (mission.objectives || []).map((obj) => `<li style="margin-bottom: 8px;">-> ${obj}</li>`).join('');
        this.ui.showModal(mission.title, `
            <div style="text-align: left;">
                <div style="margin-bottom: 20px;">
                    <p style="color: var(--text-secondary); margin-bottom: 10px;">${mission.desc}</p>
                    <div style="display: flex; gap: 15px; flex-wrap: wrap;">
                        <span class="badge badge-${difficulty === 'easy' ? 'success' : difficulty === 'medium' ? 'warning' : 'danger'}">${String(mission.difficulty || '').toUpperCase()}</span>
                        <span class="badge badge-info">TIME ${mission.estimatedTime}</span>
                        <span class="badge badge-info">${this.getPuzzleTypeLabel(mission.type)}</span>
                    </div>
                </div>
                <div class="divider"></div>
                <div style="margin: 20px 0;">
                    <h3 style="color: var(--cyber-blue); margin-bottom: 10px;">OBJECTIVES:</h3>
                    <ul style="list-style: none; padding-left: 0; color: var(--text-secondary);">${objectives}</ul>
                </div>
                <div class="divider"></div>
                <div style="margin-top: 20px;">
                    <h3 style="color: var(--cyber-blue); margin-bottom: 10px;">REWARDS:</h3>
                    <div style="display: flex; gap: 20px; color: var(--text-secondary);">
                        <span><strong style="color: var(--cyber-green);">+${mission.rewards?.xp || 0}</strong> XP</span>
                        <span><strong style="color: var(--cyber-green);">+${mission.rewards?.credits || 0}</strong> Credits</span>
                    </div>
                </div>
                ${mission.bestScore > 0 ? `<div class="divider"></div><div style="margin-top: 20px; text-align: center;"><p style="color: var(--text-secondary);">Your Best: <strong style="color: var(--cyber-green);">${mission.bestScore}</strong></p></div>` : ''}
            </div>`, {
            closable: true,
            buttons: [
                {
                    text: 'START MISSION',
                    class: 'btn-primary',
                    onClick: () => {
                        this.ui.closeModal();
                        setTimeout(() => this.game.startMission(mission), 20);
                    },
                    closeOnClick: false
                },
                { text: 'BACK', class: 'btn', onClick: () => this.ui.closeModal() }
            ]
        });
    }

    getPuzzleTypeLabel(type) {
        const labels = {
            password: 'Password Cracking',
            firewall: 'Firewall Bypass',
            network: 'Network Navigation',
            malware: 'Malware Detection',
            phishing: 'Phishing Analysis',
            mixed: 'Multi-Stage'
        };
        return labels[type] || String(type || '').toUpperCase();
    }

    cleanMissionTitle(title, level) {
        return String(title || '').replace(new RegExp(`^LEVEL\\s+${level}\\s*:\\s*`, 'i'), '').trim();
    }

    setupCanvas(canvas) {
        if (!canvas) return;

        const context = canvas.getContext('2d');
        const binaryStrings = Array.from({ length: 35 }, () => this.createBinaryString(canvas));
        const particles = Array.from({ length: 55 }, () => this.createParticle(canvas));

        const resize = () => {
            const ratio = window.devicePixelRatio || 1;
            const bounds = canvas.getBoundingClientRect();
            canvas.width = Math.max(1, Math.floor(bounds.width * ratio));
            canvas.height = Math.max(1, Math.floor(bounds.height * ratio));
            context.setTransform(ratio, 0, 0, ratio, 0, 0);
        };

        const render = () => {
            const width = canvas.clientWidth;
            const height = canvas.clientHeight;
            context.clearRect(0, 0, width, height);

            const background = context.createRadialGradient(width * 0.5, height * 0.35, 20, width * 0.5, height * 0.5, Math.max(width, height));
            background.addColorStop(0, '#040b18');
            background.addColorStop(0.35, '#030816');
            background.addColorStop(0.7, '#020610');
            background.addColorStop(1, '#01030a');
            context.fillStyle = background;
            context.fillRect(0, 0, width, height);

            context.font = "11px 'Share Tech Mono'";
            context.fillStyle = 'rgba(0,200,230,0.035)';
            binaryStrings.forEach((item) => {
                item.y -= item.speed;
                if (item.y < -16) {
                    item.y = height + Math.random() * 120;
                    item.x = Math.random() * width;
                    item.value = this.randomBinary();
                }
                context.fillText(item.value, item.x, item.y);
            });

            particles.forEach((particle) => {
                particle.x += particle.vx;
                particle.y += particle.vy;
                if (particle.x < 0 || particle.x > width) particle.vx *= -1;
                if (particle.y < 0 || particle.y > height) particle.vy *= -1;
            });

            context.lineWidth = 1;
            for (let i = 0; i < particles.length; i += 1) {
                for (let j = i + 1; j < particles.length; j += 1) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt((dx * dx) + (dy * dy));
                    if (distance < 95) {
                        context.strokeStyle = `rgba(0,200,230,${0.045 * (1 - distance / 95)})`;
                        context.beginPath();
                        context.moveTo(particles[i].x, particles[i].y);
                        context.lineTo(particles[j].x, particles[j].y);
                        context.stroke();
                    }
                }
            }

            particles.forEach((particle) => {
                context.fillStyle = 'rgba(0,212,255,0.22)';
                context.beginPath();
                context.arc(particle.x, particle.y, 1.5, 0, Math.PI * 2);
                context.fill();
            });

            this.animationFrame = requestAnimationFrame(render);
        };

        resize();
        render();
        window.addEventListener('resize', resize);
        this.resizeHandler = resize;
        this.canvasState = { canvas, context, binaryStrings, particles };
    }

    teardownCanvas() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
            this.resizeHandler = null;
        }
        this.canvasState = null;
    }

    createBinaryString(canvas) {
        return {
            x: Math.random() * Math.max(canvas.clientWidth || 1, 1),
            y: Math.random() * Math.max(canvas.clientHeight || 1, 1),
            speed: 0.15 + (Math.random() * 0.45),
            value: this.randomBinary()
        };
    }

    createParticle(canvas) {
        return {
            x: Math.random() * Math.max(canvas.clientWidth || 1, 1),
            y: Math.random() * Math.max(canvas.clientHeight || 1, 1),
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3
        };
    }

    randomBinary() {
        return Array.from({ length: 6 }, () => (Math.random() > 0.5 ? '1' : '0')).join('');
    }
}

MissionSelect.prototype.getMissionBadge = function getMissionBadgeOverride(level) {
    if (level === 5) return { icon: 'LOCK', name: 'CIPHER BREAKER' };
    if (level === 10) return { icon: 'T', name: 'FIRST BREACH' };
    return null;
};

MissionSelect.prototype.updatePasswordCard = function updatePasswordCardOverride(shell, mission, missions, showCard) {
    const card = shell.querySelector('[data-card]');
    const label = shell.querySelector('[data-card-label]');
    const name = shell.querySelector('[data-card-name]');
    const body = shell.querySelector('[data-card-body]');
    if (!card || !label || !name || !body) return;

    if (!showCard) {
        card.classList.remove('is-visible');
        return;
    }

    const state = this.getMissionDisplayState(mission, missions);
    const difficulty = String(mission.difficulty || '').toLowerCase();
    label.textContent = `// L${mission.level} | ${String(mission.difficulty || '').toUpperCase()}`;
    name.textContent = this.cleanMissionTitle(mission.title, mission.level);

    const rows = [
        { label: 'STATUS', value: this.getMissionSectorLabel(state), className: state === 'cleared' ? 'is-green' : state === 'active' ? 'is-cyan' : state === 'locked' ? 'is-gold' : '' },
        { label: 'DIFFICULTY', value: String(mission.difficulty || '').toUpperCase(), className: difficulty === 'easy' ? 'is-green' : difficulty === 'medium' ? 'is-gold' : '' },
        { label: 'TIME', value: mission.estimatedTime || '-', className: '' },
        { label: 'XP REWARD', value: `+${mission.rewards?.xp || 0} XP`, className: 'is-gold' },
        { label: 'CREDITS', value: `+${mission.rewards?.credits || 0}`, className: 'is-gold' },
        { label: 'BEST SCORE', value: mission.bestScore ? mission.bestScore.toLocaleString() : '-', className: mission.bestScore ? 'is-green' : '' }
    ];

    body.innerHTML = rows.map((item) => `
        <div class="sd-password-sector-card-row">
            <span class="sd-password-sector-card-row-label">${item.label}</span>
            <span class="sd-password-sector-card-row-value ${item.className}">${item.value}</span>
        </div>
    `).join('');

    card.classList.add('is-visible');
};

MissionSelect.prototype.getMissionBadge = function getMissionBadgeFinal(level) {
    if (level === 5) return { icon: '⚡', name: 'CIPHER BREAKER' };
    if (level === 10) return { icon: '🏆', name: 'FIRST BREACH' };
    return null;
};

MissionSelect.prototype.updatePasswordTimelineSelection = function updatePasswordTimelineSelectionFinal(shell, missionId) {
    shell.querySelectorAll('[data-node-circle]').forEach((node) => {
        const isSelected = Number(node.getAttribute('data-node-circle')) === missionId;
        node.setAttribute('stroke-width', isSelected ? '3.4' : (node.getAttribute('data-default-stroke-width') || '1.2'));
    });

    shell.querySelectorAll('[data-node-group]').forEach((element) => {
        const isSelected = Number(element.getAttribute('data-node-group')) === missionId;
        const baseOpacity = element.getAttribute('data-base-opacity');
        const baseStrokeOpacity = element.getAttribute('data-base-stroke-opacity');
        const baseStrokeWidth = element.getAttribute('data-base-stroke-width');

        if (baseOpacity) {
            element.setAttribute('opacity', isSelected ? '1' : baseOpacity);
        }
        if (baseStrokeOpacity) {
            element.setAttribute('stroke-opacity', isSelected ? '0.95' : baseStrokeOpacity);
        }
        if (baseStrokeWidth) {
            element.setAttribute('stroke-width', isSelected ? '1.1' : baseStrokeWidth);
        }
    });
};

MissionSelect.prototype.renderPasswordTimeline = function renderPasswordTimelineFinal(shell, missions) {
    const panel = shell.querySelector('[data-right-panel]');
    const svg = shell.querySelector('[data-timeline]');
    if (!panel || !svg) return;

    const width = panel.clientWidth || 1;
    const height = panel.clientHeight || 1;
    if (width < 80 || height < 80) {
        requestAnimationFrame(() => this.renderPasswordTimeline(shell, missions));
        return;
    }

    const ns = 'http://www.w3.org/2000/svg';
    svg.innerHTML = '';
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

    const defs = document.createElementNS(ns, 'defs');
    defs.appendChild(this.createPasswordGlow(ns, 'sdPasswordGlowGreen', '#00ff88', 5));
    defs.appendChild(this.createPasswordGlow(ns, 'sdPasswordGlowCyan', '#00e5ff', 6));
    defs.appendChild(this.createPasswordGlow(ns, 'sdPasswordGlowGold', '#ffd700', 5));
    svg.appendChild(defs);

    const leftX = width * 0.22;
    const rightX = width * 0.58;
    const topY = height * 0.095;
    const bottomY = height * 0.9;
    const step = (bottomY - topY) / 4;
    const positions = [];

    for (let index = 0; index < 5; index += 1) positions.push({ x: leftX, y: topY + (step * index), side: 'left' });
    for (let index = 0; index < 5; index += 1) positions.push({ x: rightX, y: topY + (step * (4 - index)), side: 'right' });

    missions.forEach((mission, index) => {
        mission._timelinePosition = positions[index];
    });

    for (let index = 0; index < missions.length - 1; index += 1) {
        const current = missions[index];
        const next = missions[index + 1];
        const currentState = this.getMissionDisplayState(current, missions);
        const nextState = this.getMissionDisplayState(next, missions);
        const connectorPath = this.getPasswordConnectorPath(current._timelinePosition, next._timelinePosition);

        const connector = document.createElementNS(ns, 'path');
        connector.setAttribute('d', connectorPath);
        connector.setAttribute('fill', 'none');
        connector.setAttribute('stroke', currentState === 'cleared' ? 'rgba(0,255,136,.24)' : currentState === 'active' || nextState === 'active' ? 'rgba(0,229,255,.2)' : 'rgba(0,229,255,.08)');
        connector.setAttribute('stroke-width', '1.5');
        connector.setAttribute('opacity', currentState === 'sealed' && nextState === 'sealed' ? '0.55' : '1');
        if (currentState !== 'cleared') connector.setAttribute('stroke-dasharray', '5 5');
        svg.appendChild(connector);

        if (currentState === 'cleared' || currentState === 'active' || nextState === 'active') {
            const motionPath = document.createElementNS(ns, 'path');
            const pathId = `sd-password-path-${index}-${current.id}-${next.id}`;
            motionPath.setAttribute('id', pathId);
            motionPath.setAttribute('d', connectorPath);
            motionPath.setAttribute('fill', 'none');
            motionPath.setAttribute('stroke', 'none');
            svg.appendChild(motionPath);

            const dot = document.createElementNS(ns, 'circle');
            dot.setAttribute('r', '3');
            dot.setAttribute('fill', currentState === 'cleared' ? '#00ff88' : '#00e5ff');
            dot.setAttribute('opacity', '0.78');
            dot.setAttribute('filter', currentState === 'cleared' ? 'url(#sdPasswordGlowGreen)' : 'url(#sdPasswordGlowCyan)');

            const animateMotion = document.createElementNS(ns, 'animateMotion');
            animateMotion.setAttribute('dur', `${2.2 + (index * 0.12)}s`);
            animateMotion.setAttribute('repeatCount', 'indefinite');
            animateMotion.setAttribute('rotate', 'auto');

            const mpath = document.createElementNS(ns, 'mpath');
            mpath.setAttributeNS('http://www.w3.org/1999/xlink', 'href', `#${pathId}`);
            animateMotion.appendChild(mpath);
            dot.appendChild(animateMotion);
            svg.appendChild(dot);
        }
    }

    missions.forEach((mission) => {
        const state = this.getMissionDisplayState(mission, missions);
        const position = mission._timelinePosition;
        const badge = this.getMissionBadge(mission.level);
        const isBadge = Boolean(badge);
        const radius = isBadge ? 26 : state === 'active' ? 22 : 18;
        const stroke = state === 'cleared'
            ? '#00ff88'
            : state === 'active'
                ? '#00e5ff'
                : state === 'locked'
                    ? '#ffd700'
                    : 'rgba(200,232,240,.18)';
        const fill = state === 'cleared'
            ? 'rgba(0,255,136,.08)'
            : state === 'active'
                ? 'rgba(0,229,255,.1)'
                : state === 'locked'
                    ? 'rgba(255,215,0,.06)'
                    : 'rgba(3,14,32,.8)';

        const terrainRing = document.createElementNS(ns, 'circle');
        terrainRing.setAttribute('cx', position.x);
        terrainRing.setAttribute('cy', position.y);
        terrainRing.setAttribute('r', radius + 22);
        terrainRing.setAttribute('fill', 'none');
        terrainRing.setAttribute('stroke', stroke);
        terrainRing.setAttribute('stroke-width', '0.5');
        terrainRing.setAttribute('opacity', state === 'sealed' ? '0.03' : '0.08');
        svg.appendChild(terrainRing);

        if (state === 'active') {
            const pulse = document.createElementNS(ns, 'circle');
            pulse.setAttribute('cx', position.x);
            pulse.setAttribute('cy', position.y);
            pulse.setAttribute('r', radius);
            pulse.setAttribute('fill', 'none');
            pulse.setAttribute('stroke', '#00e5ff');
            pulse.setAttribute('stroke-width', '2');
            const animateRadius = document.createElementNS(ns, 'animate');
            animateRadius.setAttribute('attributeName', 'r');
            animateRadius.setAttribute('values', `${radius};${radius + 16};${radius}`);
            animateRadius.setAttribute('dur', '2.5s');
            animateRadius.setAttribute('repeatCount', 'indefinite');
            const animateOpacity = document.createElementNS(ns, 'animate');
            animateOpacity.setAttribute('attributeName', 'opacity');
            animateOpacity.setAttribute('values', '0.6;0;0.6');
            animateOpacity.setAttribute('dur', '2.5s');
            animateOpacity.setAttribute('repeatCount', 'indefinite');
            pulse.appendChild(animateRadius);
            pulse.appendChild(animateOpacity);
            svg.appendChild(pulse);
        }

        if (state === 'locked') {
            const lockRing = document.createElementNS(ns, 'circle');
            lockRing.setAttribute('cx', position.x);
            lockRing.setAttribute('cy', position.y);
            lockRing.setAttribute('r', radius + 12);
            lockRing.setAttribute('fill', 'none');
            lockRing.setAttribute('stroke', 'rgba(255,215,0,.48)');
            lockRing.setAttribute('stroke-width', '1.2');
            lockRing.setAttribute('stroke-dasharray', '4 6');
            svg.appendChild(lockRing);
        }

        if (isBadge && state !== 'sealed') {
            const badgeRing = document.createElementNS(ns, 'circle');
            badgeRing.setAttribute('cx', position.x);
            badgeRing.setAttribute('cy', position.y);
            badgeRing.setAttribute('r', radius + 8);
            badgeRing.setAttribute('fill', 'none');
            badgeRing.setAttribute('stroke', 'rgba(255,215,0,.35)');
            badgeRing.setAttribute('stroke-width', '1');
            badgeRing.setAttribute('stroke-dasharray', '3 4');
            const animateRotate = document.createElementNS(ns, 'animateTransform');
            animateRotate.setAttribute('attributeName', 'transform');
            animateRotate.setAttribute('type', 'rotate');
            animateRotate.setAttribute('values', `0 ${position.x} ${position.y};360 ${position.x} ${position.y}`);
            animateRotate.setAttribute('dur', '8s');
            animateRotate.setAttribute('repeatCount', 'indefinite');
            badgeRing.appendChild(animateRotate);
            svg.appendChild(badgeRing);
        }

        const node = document.createElementNS(ns, 'circle');
        node.setAttribute('cx', position.x);
        node.setAttribute('cy', position.y);
        node.setAttribute('r', radius);
        node.setAttribute('fill', fill);
        node.setAttribute('stroke', stroke);
        node.setAttribute('stroke-width', isBadge || state === 'locked' ? '2' : '1.2');
        if (state === 'cleared') node.setAttribute('filter', 'url(#sdPasswordGlowGreen)');
        if (state === 'active') node.setAttribute('filter', 'url(#sdPasswordGlowCyan)');
        if (state === 'locked') node.setAttribute('filter', 'url(#sdPasswordGlowGold)');
        node.setAttribute('data-node-circle', String(mission.id));
        node.setAttribute('data-default-stroke-width', isBadge || state === 'locked' ? '2' : '1.2');
        svg.appendChild(node);

        const inner = document.createElementNS(ns, 'circle');
        inner.setAttribute('cx', position.x);
        inner.setAttribute('cy', position.y);
        inner.setAttribute('r', Math.max(6, radius - 5));
        inner.setAttribute('fill', 'none');
        inner.setAttribute('stroke', stroke);
        inner.setAttribute('stroke-width', '0.6');
        inner.setAttribute('opacity', state === 'sealed' ? '0.18' : '0.34');
        svg.appendChild(inner);

        const centerText = document.createElementNS(ns, 'text');
        centerText.setAttribute('x', position.x);
        centerText.setAttribute('y', position.y + 2);
        centerText.setAttribute('text-anchor', 'middle');
        centerText.setAttribute('dominant-baseline', 'middle');
        centerText.setAttribute('font-family', "'Share Tech Mono', monospace");
        centerText.setAttribute('font-weight', '700');
        if (state === 'cleared') {
            centerText.setAttribute('font-size', '12');
            centerText.setAttribute('fill', '#00ff88');
            centerText.textContent = '✓';
        } else if (state === 'locked') {
            centerText.setAttribute('font-size', badge ? '16' : '13');
            centerText.setAttribute('fill', '#ffd700');
            centerText.textContent = badge ? badge.icon : '⚡';
        } else if (state === 'sealed' && badge) {
            centerText.setAttribute('font-size', '16');
            centerText.setAttribute('fill', '#ffd700');
            centerText.textContent = '🔒';
        } else {
            centerText.setAttribute('font-size', '9');
            centerText.setAttribute('fill', stroke);
            centerText.setAttribute('letter-spacing', '1');
            centerText.textContent = `L${mission.level}`;
        }
        svg.appendChild(centerText);

        const boxWidth = 194;
        const boxHeight = 52;
        const leftSide = position.side === 'left';
        const boxX = leftSide ? position.x + radius + 16 : position.x - radius - 16 - boxWidth;
        const boxY = position.y - (boxHeight / 2);

        const line = document.createElementNS(ns, 'line');
        line.setAttribute('x1', leftSide ? position.x + radius : position.x - radius);
        line.setAttribute('y1', position.y);
        line.setAttribute('x2', leftSide ? position.x + radius + 16 : position.x - radius - 16);
        line.setAttribute('y2', position.y);
        line.setAttribute('stroke', stroke);
        line.setAttribute('stroke-width', '1');
        line.setAttribute('opacity', state === 'sealed' ? '0.18' : '0.48');
        line.setAttribute('data-node-group', String(mission.id));
        line.setAttribute('data-base-opacity', state === 'sealed' ? '0.18' : '0.48');
        svg.appendChild(line);

        const box = document.createElementNS(ns, 'rect');
        box.setAttribute('x', boxX);
        box.setAttribute('y', boxY);
        box.setAttribute('width', boxWidth);
        box.setAttribute('height', boxHeight);
        box.setAttribute('rx', '2');
        box.setAttribute('fill', 'rgba(3,14,32,.92)');
        box.setAttribute('stroke', stroke);
        box.setAttribute('stroke-width', state === 'sealed' ? '0.45' : '0.65');
        box.setAttribute('stroke-opacity', state === 'sealed' ? '0.18' : '0.48');
        box.setAttribute('data-node-group', String(mission.id));
        box.setAttribute('data-base-stroke-width', state === 'sealed' ? '0.45' : '0.65');
        box.setAttribute('data-base-stroke-opacity', state === 'sealed' ? '0.18' : '0.48');
        svg.appendChild(box);

        const levelText = document.createElementNS(ns, 'text');
        levelText.setAttribute('x', boxX + 10);
        levelText.setAttribute('y', boxY + 15);
        levelText.setAttribute('font-family', "'Share Tech Mono', monospace");
        levelText.setAttribute('font-size', '7.5');
        levelText.setAttribute('fill', stroke);
        levelText.setAttribute('opacity', state === 'sealed' ? '0.24' : '0.78');
        levelText.setAttribute('data-node-group', String(mission.id));
        levelText.setAttribute('data-base-opacity', state === 'sealed' ? '0.24' : '0.78');
        levelText.textContent = badge ? `★ L${mission.level}` : `L${mission.level}`;
        svg.appendChild(levelText);

        const titleText = document.createElementNS(ns, 'text');
        titleText.setAttribute('x', boxX + (boxWidth / 2));
        titleText.setAttribute('y', boxY + 32);
        titleText.setAttribute('text-anchor', 'middle');
        titleText.setAttribute('dominant-baseline', 'middle');
        titleText.setAttribute('font-family', "'Rajdhani', sans-serif");
        titleText.setAttribute('font-size', '11');
        titleText.setAttribute('fill', stroke);
        titleText.setAttribute('font-weight', '600');
        titleText.setAttribute('opacity', state === 'sealed' ? '0.26' : state === 'locked' ? '0.82' : '0.94');
        titleText.setAttribute('data-node-group', String(mission.id));
        titleText.setAttribute('data-base-opacity', state === 'sealed' ? '0.26' : state === 'locked' ? '0.82' : '0.94');
        titleText.textContent = this.truncateTimelineTitle(this.cleanMissionTitle(mission.title, mission.level));
        svg.appendChild(titleText);

        const hit = document.createElementNS(ns, 'circle');
        hit.setAttribute('cx', position.x);
        hit.setAttribute('cy', position.y);
        hit.setAttribute('r', radius + 16);
        hit.setAttribute('fill', 'transparent');
        hit.style.cursor = state === 'sealed' ? 'not-allowed' : 'pointer';
        hit.addEventListener('click', () => {
            if (state === 'sealed') return;
            this.togglePasswordMission(shell, mission, missions);
        });
        svg.appendChild(hit);
    });

    this.updatePasswordTimelineSelection(shell, this.selectedMissionId);
};
