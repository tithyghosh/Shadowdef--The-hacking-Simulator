import { AuthManager } from '../core/AuthManager.js';

export class MapsScreen {
    constructor(game) {
        this.game = game;
        this.auth = AuthManager.getInstance();
        this.selectedSection = 'password';
        this.selectedMissionId = null;
        this.clockInterval = null;
        this.resizeBound = false;
        this.lastRenderContext = null;
        this.sectionMeta = {
            password: {
                title: 'PASSWORD',
                fullTitle: 'PASSWORD SECTOR',
                code: 'SECTOR 01',
                badge: 'ACTIVE',
                icon: 'PK',
                description: 'Primary live campaign route for credential defense training.',
                toneClass: 'active'
            },
            malware: {
                title: 'MALWARE',
                fullTitle: 'MALWARE SECTOR',
                code: 'SECTOR 02',
                badge: 'LOCKED',
                icon: 'MW',
                description: 'Dormant infection route. Mission packets not yet loaded.',
                toneClass: 'locked'
            },
            network: {
                title: 'NETWORK',
                fullTitle: 'NETWORK SECTOR',
                code: 'SECTOR 03',
                badge: 'LOCKED',
                icon: 'NW',
                description: 'Dormant traffic route. Mission packets not yet loaded.',
                toneClass: 'locked'
            }
        };
        this.mapPositions = [
            { x: 10, y: 31 },
            { x: 29, y: 26 },
            { x: 51, y: 34 },
            { x: 71, y: 28 },
            { x: 92, y: 36 },
            { x: 92, y: 67 },
            { x: 73, y: 72 },
            { x: 52, y: 65 },
            { x: 29, y: 71 },
            { x: 10, y: 62 }
        ];
    }

    render() {
        const container = document.getElementById('maps-screen');
        if (!container) return;

        const user = this.auth.getCurrentUser();
        const stats = user?.gameStats || this.auth.getDefaultStats();
        const sectors = this.buildSectors();
        const currentSector = sectors.find((sector) => sector.id === this.selectedSection) || sectors[0];
        const currentMeta = this.sectionMeta[currentSector.id];
        const operatorName = this.getOperatorName(user);
        const activeMission = currentSector.missions.find((mission) => !mission.locked && !mission.completed) || null;
        const selectedMission = this.getSelectedMission(currentSector);
        this.lastRenderContext = {
            sectorId: currentSector.id,
            focusMissionId: (selectedMission || activeMission)?.id || null
        };

        container.innerHTML = `
            <div class="sector-map-shell">
                <div class="sector-map-nav">
                    <div class="sector-map-nav-logo">SHADOWDEF</div>
                    <div class="sector-map-nav-center">
                        <span><span class="sm-nav-dot is-green"></span>SYSTEM ONLINE</span>
                        <span>NODE: ALPHA-7</span>
                        <span>SECTOR: ${this.escapeHtml(currentMeta.title)}</span>
                    </div>
                    <div class="sector-map-nav-right">
                        <span class="sm-chip ok">AUTH LINKED</span>
                        <span class="sm-chip warn">GRID STABLE</span>
                        <button class="sector-map-nav-back" type="button" data-action="back">BACK TO BASE</button>
                        <div class="sector-map-clock" data-map-clock>--:--:--</div>
                    </div>
                </div>

                <div class="sector-map-page">
                    <aside class="sector-map-sidebar">
                        <div class="sector-map-sidebar-header">
                            <div class="sector-map-sidebar-label">// CAMPAIGN ROUTE</div>
                            <div class="sector-map-sidebar-title">
                                <span class="sector-map-sidebar-bar"></span>
                                <span>SECTOR MAP</span>
                            </div>
                            <div class="sector-map-sidebar-copy">Live nodes, completed levels and sealed future sectors.</div>
                        </div>

                        <div class="sector-map-tabs">
                            ${sectors.map((sector) => this.renderSectorTab(sector, currentSector.id)).join('')}
                        </div>

                        <div class="sector-map-sidebar-stats">
                            <div class="sm-stat-box">
                                <div class="sm-stat-val">${currentSector.completed}</div>
                                <div class="sm-stat-lbl">CLEARED</div>
                            </div>
                            <div class="sm-stat-box">
                                <div class="sm-stat-val">${currentSector.lockedCount}</div>
                                <div class="sm-stat-lbl">SEALED</div>
                            </div>
                            <div class="sm-stat-box">
                                <div class="sm-stat-val is-gold">${(stats.achievements || []).length}</div>
                                <div class="sm-stat-lbl">BADGES</div>
                            </div>
                            <div class="sm-stat-box">
                                <div class="sm-stat-val">${Math.round(currentSector.progress)}%</div>
                                <div class="sm-stat-lbl">PROGRESS</div>
                            </div>
                        </div>
                    </aside>

                    <section class="sector-map-canvas">
                        <div class="sector-map-canvas-header">
                            <div class="sm-canvas-title-block">
                                <div class="sm-canvas-kicker">CAMPAIGN ROUTE · ${this.escapeHtml(currentMeta.code)}</div>
                                <div class="sm-canvas-title">${this.escapeHtml(currentMeta.fullTitle)}</div>
                            </div>

                            <div class="sm-canvas-meta">
                                <div class="sm-legend">
                                    <span><i class="sm-legend-dot complete"></i>COMPLETE</span>
                                    <span><i class="sm-legend-dot active"></i>ACTIVE</span>
                                    <span><i class="sm-legend-dot locked"></i>LOCKED</span>
                                </div>
                                <div class="sm-header-stats">
                                    <div class="sm-header-stat">
                                        <div class="sm-header-stat-val">${currentSector.completed}/${currentSector.total}</div>
                                        <div class="sm-header-stat-lbl">CLEARED</div>
                                    </div>
                                    <div class="sm-header-stat">
                                        <div class="sm-header-stat-val is-alert">${currentSector.lockedCount}</div>
                                        <div class="sm-header-stat-lbl">SEALED NODES</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="sector-map-canvas-body" data-map-area>
                            <svg class="sector-map-svg" data-map-svg xmlns="http://www.w3.org/2000/svg"></svg>
                            <div class="sector-map-tooltip" data-map-tooltip>
                                <div class="sm-tip-level" data-tip-level></div>
                                <div class="sm-tip-name" data-tip-name></div>
                                <div class="sm-tip-status" data-tip-status></div>
                            </div>
                        </div>
                    </section>
                </div>

                <div class="sector-map-statusbar">
                    <div class="sm-status-item"><span class="sm-status-square is-green"></span>NETWORK: SECURE</div>
                    <div class="sm-status-item"><span class="sm-status-square is-green"></span>AES-256 ACTIVE</div>
                    <div class="sm-status-item"><span class="sm-status-square is-red"></span>THREATS: 3 DETECTED</div>
                    <div class="sm-status-item">OPERATOR: ${this.escapeHtml(operatorName.toUpperCase())}</div>
                    <div class="sm-status-utc" data-map-utc>--:--:-- UTC</div>
                </div>
            </div>
        `;

        this.bindEvents(container);
        this.startClock(container);
        this.scheduleDraw(container, currentSector, selectedMission || activeMission);
        this.bindResizeRedraw();
    }

    buildSectors() {
        return Object.keys(this.sectionMeta).map((id) => {
            const missions = this.getSectionMissions(id);
            const completed = missions.filter((mission) => mission.completed).length;
            const liveCount = missions.filter((mission) => !mission.locked && !mission.completed).length;
            const lockedCount = missions.filter((mission) => mission.locked).length;

            return {
                id,
                meta: this.sectionMeta[id],
                missions,
                total: missions.length || 10,
                completed,
                liveCount,
                lockedCount: missions.length ? lockedCount : 10,
                progress: missions.length ? (completed / missions.length) * 100 : 0,
                isAccessible: id === 'password'
            };
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

    getSelectedMission(sector) {
        const missions = sector?.missions || [];
        if (!missions.length) return null;
        const selected = missions.find((mission) => mission.id === this.selectedMissionId);
        if (selected) return selected;
        return missions.find((mission) => !mission.locked && !mission.completed)
            || missions.find((mission) => mission.completed)
            || missions[0];
    }

    getOperatorName(user) {
        return user?.name || 'Guest Operator';
    }

    renderSectorTab(sector, activeId) {
        const isActive = sector.id === activeId;
        const state = sector.isAccessible ? (isActive ? 'ACTIVE' : 'READY') : 'LOCKED';

        return `
            <button
                class="sector-map-tab ${isActive ? 'is-active' : ''} ${sector.isAccessible ? '' : 'is-locked'}"
                type="button"
                data-map-section="${sector.id}"
                ${sector.isAccessible ? '' : 'disabled'}>
                <span class="sm-tab-icon">${this.escapeHtml(sector.meta.icon)}</span>
                <span class="sm-tab-info">
                    <span class="sm-tab-name">${this.escapeHtml(sector.meta.title)}</span>
                    <span class="sm-tab-meta">${sector.completed} / ${sector.total} CLEARED</span>
                </span>
                <span class="sm-tab-badge ${state.toLowerCase()}">${state}</span>
            </button>
        `;
    }

    startClock(container) {
        clearInterval(this.clockInterval);

        const updateClock = () => {
            const now = new Date();
            const time = now.toTimeString().slice(0, 8);
            const utc = now.toUTCString().slice(17, 25);
            const clock = container.querySelector('[data-map-clock]');
            const utcEl = container.querySelector('[data-map-utc]');
            if (clock) clock.textContent = time;
            if (utcEl) utcEl.textContent = `${utc} UTC`;
        };

        updateClock();
        this.clockInterval = setInterval(updateClock, 1000);
    }

    scheduleDraw(container, sector, focusMission) {
        const draw = () => this.drawMap(container, sector, focusMission);
        requestAnimationFrame(() => {
            draw();
            requestAnimationFrame(draw);
        });
        setTimeout(draw, 120);
        setTimeout(draw, 260);
    }

    bindResizeRedraw() {
        if (this.resizeBound) return;
        this.resizeBound = true;
        window.addEventListener('resize', () => {
            const container = document.getElementById('maps-screen');
            if (!container || !container.classList.contains('active') || !this.lastRenderContext) return;
            const sectors = this.buildSectors();
            const sector = sectors.find((item) => item.id === this.lastRenderContext.sectorId) || sectors[0];
            const focusMission = sector.missions.find((mission) => mission.id === this.lastRenderContext.focusMissionId)
                || this.getSelectedMission(sector);
            this.drawMap(container, sector, focusMission);
        });
    }

    drawMap(container, sector, focusMission) {
        const area = container.querySelector('[data-map-area]');
        const svg = container.querySelector('[data-map-svg]');
        const tooltip = container.querySelector('[data-map-tooltip]');
        if (!area || !svg) return;

        const rect = area.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        if (width < 40 || height < 40) return;
        const ns = 'http://www.w3.org/2000/svg';
        svg.innerHTML = '';
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

        const defs = document.createElementNS(ns, 'defs');
        defs.appendChild(this.makeGlowFilter(ns, 'smGlowGreen', '#00ff88', 4));
        defs.appendChild(this.makeGlowFilter(ns, 'smGlowCyan', '#00e5ff', 5));
        defs.appendChild(this.makeGlowFilter(ns, 'smGlowGold', '#ffd700', 4));
        svg.appendChild(defs);

        const missions = sector.missions;
        const positions = missions.map((mission, index) => ({
            mission,
            point: this.getCanvasPoint(index, width, height)
        }));

        positions.forEach((entry, index) => {
            const next = positions[index + 1];
            if (!next) return;
            this.drawConnection(svg, ns, entry, next);
        });

        positions.forEach((entry) => {
            this.drawNode(svg, ns, entry, tooltip, area, sector.id, focusMission);
        });
    }

    makeGlowFilter(ns, id, color, blurValue) {
        const filter = document.createElementNS(ns, 'filter');
        filter.setAttribute('id', id);
        filter.setAttribute('x', '-30%');
        filter.setAttribute('y', '-30%');
        filter.setAttribute('width', '160%');
        filter.setAttribute('height', '160%');

        const blur = document.createElementNS(ns, 'feGaussianBlur');
        blur.setAttribute('stdDeviation', blurValue);
        blur.setAttribute('result', 'blur');

        const flood = document.createElementNS(ns, 'feFlood');
        flood.setAttribute('flood-color', color);
        flood.setAttribute('flood-opacity', '1');
        flood.setAttribute('result', 'color');

        const composite = document.createElementNS(ns, 'feComposite');
        composite.setAttribute('in', 'color');
        composite.setAttribute('in2', 'blur');
        composite.setAttribute('operator', 'in');
        composite.setAttribute('result', 'glow');

        const merge = document.createElementNS(ns, 'feMerge');
        const nodeOne = document.createElementNS(ns, 'feMergeNode');
        nodeOne.setAttribute('in', 'glow');
        const nodeTwo = document.createElementNS(ns, 'feMergeNode');
        nodeTwo.setAttribute('in', 'SourceGraphic');
        merge.appendChild(nodeOne);
        merge.appendChild(nodeTwo);

        filter.appendChild(blur);
        filter.appendChild(flood);
        filter.appendChild(composite);
        filter.appendChild(merge);
        return filter;
    }

    getCanvasPoint(index, width, height) {
        const preset = this.mapPositions[index] || { x: 50, y: 50 };
        return {
            x: (width * preset.x) / 100,
            y: (height * preset.y) / 100
        };
    }

    getMissionState(mission) {
        if (mission.completed) return 'complete';
        if (mission.locked) return 'locked';
        return 'active';
    }

    getMissionColor(state) {
        if (state === 'complete') {
            return {
                stroke: '#00ff88',
                dimStroke: 'rgba(0,255,136,.24)',
                fill: 'rgba(0,255,136,.08)',
                text: '#00ff88',
                filter: 'url(#smGlowGreen)'
            };
        }

        if (state === 'active') {
            return {
                stroke: '#00e5ff',
                dimStroke: 'rgba(0,229,255,.22)',
                fill: 'rgba(0,229,255,.1)',
                text: '#00e5ff',
                filter: 'url(#smGlowCyan)'
            };
        }

        return {
            stroke: 'rgba(200,232,240,.18)',
            dimStroke: 'rgba(200,232,240,.1)',
            fill: 'rgba(3,14,32,.72)',
            text: 'rgba(200,232,240,.35)',
            filter: ''
        };
    }

    drawConnection(svg, ns, currentEntry, nextEntry) {
        const currentState = this.getMissionState(currentEntry.mission);
        const nextState = this.getMissionState(nextEntry.mission);
        const isTopRoute = currentEntry.mission.level <= 5 && nextEntry.mission.level <= 5;
        const isTransition = currentEntry.mission.level === 5 && nextEntry.mission.level === 6;
        const currentX = currentEntry.point.x;
        const currentY = currentEntry.point.y;
        const nextX = nextEntry.point.x;
        const nextY = nextEntry.point.y;

        let pathData = '';
        if (isTransition) {
            const midY = currentY + ((nextY - currentY) * 0.42);
            pathData = `M${currentX},${currentY} C${currentX},${midY} ${nextX},${midY} ${nextX},${nextY}`;
        } else if (isTopRoute) {
            const controlX = (currentX + nextX) / 2;
            const controlY = Math.min(currentY, nextY) - 48;
            pathData = `M${currentX},${currentY} C${controlX},${controlY} ${controlX},${controlY} ${nextX},${nextY}`;
        } else {
            const controlX = (currentX + nextX) / 2;
            const controlY = Math.max(currentY, nextY) + 42;
            pathData = `M${currentX},${currentY} C${controlX},${controlY} ${controlX},${controlY} ${nextX},${nextY}`;
        }

        const path = document.createElementNS(ns, 'path');
        path.setAttribute('d', pathData);
        path.setAttribute('fill', 'none');

        if (currentState === 'complete' && nextState !== 'locked') {
            path.setAttribute('stroke', 'rgba(0,255,136,.5)');
            path.setAttribute('stroke-width', '2');
        } else if (currentState === 'active' || nextState === 'active') {
            path.setAttribute('stroke', 'rgba(0,229,255,.34)');
            path.setAttribute('stroke-width', '2');
            path.setAttribute('stroke-dasharray', '8 10');
        } else {
            path.setAttribute('stroke', 'rgba(0,229,255,.16)');
            path.setAttribute('stroke-width', '2');
            path.setAttribute('stroke-dasharray', '8 10');
        }
        svg.appendChild(path);

        if (currentState === 'complete' || currentState === 'active') {
            const hiddenPath = document.createElementNS(ns, 'path');
            const motionId = `sm_path_${currentEntry.mission.id}_${nextEntry.mission.id}`;
            hiddenPath.setAttribute('d', pathData);
            hiddenPath.setAttribute('id', motionId);
            hiddenPath.setAttribute('fill', 'none');
            hiddenPath.setAttribute('stroke', 'none');
            svg.appendChild(hiddenPath);

            const dot = document.createElementNS(ns, 'circle');
            dot.setAttribute('r', '4');
            dot.setAttribute('fill', '#00e5ff');
            dot.setAttribute('opacity', '0.9');
            dot.setAttribute('filter', 'url(#smGlowCyan)');

            const motion = document.createElementNS(ns, 'animateMotion');
            motion.setAttribute('dur', `${2 + (currentEntry.mission.level * 0.18)}s`);
            motion.setAttribute('repeatCount', 'indefinite');
            motion.setAttribute('begin', `${(currentEntry.mission.level * 0.21).toFixed(2)}s`);

            const mpath = document.createElementNS(ns, 'mpath');
            mpath.setAttribute('href', `#${motionId}`);
            motion.appendChild(mpath);
            dot.appendChild(motion);
            svg.appendChild(dot);
        }
    }

    drawNode(svg, ns, entry, tooltip, area, sectionId, focusMission) {
        const { mission, point } = entry;
        const state = this.getMissionState(mission);
        const color = this.getMissionColor(state);
        const isFocus = focusMission && focusMission.id === mission.id;
        const radius = state === 'active' ? 34 : 30;
        const labelBox = {
            width: 178,
            height: 54,
            x: point.x - 88,
            y: point.y + 48
        };

        if (state !== 'locked') {
            const ring = document.createElementNS(ns, 'circle');
            ring.setAttribute('cx', point.x);
            ring.setAttribute('cy', point.y);
            ring.setAttribute('r', radius + 12);
            ring.setAttribute('fill', 'none');
            ring.setAttribute('stroke', color.stroke);
            ring.setAttribute('stroke-width', '1');
            ring.setAttribute('opacity', isFocus ? '0.35' : '0.2');
            svg.appendChild(ring);
        }

        const nodeCircle = document.createElementNS(ns, 'circle');
        nodeCircle.setAttribute('cx', point.x);
        nodeCircle.setAttribute('cy', point.y);
        nodeCircle.setAttribute('r', radius);
        nodeCircle.setAttribute('fill', color.fill);
        nodeCircle.setAttribute('stroke', color.stroke);
        nodeCircle.setAttribute('stroke-width', state === 'active' ? '2' : '1.5');
        if (color.filter) {
            nodeCircle.setAttribute('filter', color.filter);
        }
        svg.appendChild(nodeCircle);

        if (state !== 'locked') {
            const innerRing = document.createElementNS(ns, 'circle');
            innerRing.setAttribute('cx', point.x);
            innerRing.setAttribute('cy', point.y);
            innerRing.setAttribute('r', radius - 14);
            innerRing.setAttribute('fill', 'none');
            innerRing.setAttribute('stroke', color.stroke);
            innerRing.setAttribute('stroke-width', '1.5');
            innerRing.setAttribute('opacity', '0.85');
            svg.appendChild(innerRing);
        }

        if (state === 'active') {
            const pulse = document.createElementNS(ns, 'circle');
            pulse.setAttribute('cx', point.x);
            pulse.setAttribute('cy', point.y);
            pulse.setAttribute('r', radius);
            pulse.setAttribute('fill', 'none');
            pulse.setAttribute('stroke', '#00e5ff');
            pulse.setAttribute('stroke-width', '2');

            const animateRadius = document.createElementNS(ns, 'animate');
            animateRadius.setAttribute('attributeName', 'r');
            animateRadius.setAttribute('values', `${radius};${radius + 16};${radius}`);
            animateRadius.setAttribute('dur', '2.2s');
            animateRadius.setAttribute('repeatCount', 'indefinite');
            pulse.appendChild(animateRadius);

            const animateOpacity = document.createElementNS(ns, 'animate');
            animateOpacity.setAttribute('attributeName', 'opacity');
            animateOpacity.setAttribute('values', '0.6;0;0.6');
            animateOpacity.setAttribute('dur', '2.2s');
            animateOpacity.setAttribute('repeatCount', 'indefinite');
            pulse.appendChild(animateOpacity);
            svg.appendChild(pulse);
        }

        const coreText = document.createElementNS(ns, 'text');
        coreText.setAttribute('x', point.x);
        coreText.setAttribute('y', point.y + 4);
        coreText.setAttribute('text-anchor', 'middle');
        coreText.setAttribute('font-family', "'Share Tech Mono', monospace");
        coreText.setAttribute('font-size', state === 'active' ? '18' : '15');
        coreText.setAttribute('fill', state === 'locked' ? 'rgba(200,232,240,.35)' : color.text);
        if (state === 'complete') {
            coreText.textContent = '✓';
        } else {
            coreText.textContent = this.getMissionLabel(mission);
        }
        svg.appendChild(coreText);

        const labelGroup = document.createElementNS(ns, 'g');
        const labelRect = document.createElementNS(ns, 'rect');
        labelRect.setAttribute('x', labelBox.x);
        labelRect.setAttribute('y', labelBox.y);
        labelRect.setAttribute('width', labelBox.width);
        labelRect.setAttribute('height', labelBox.height);
        labelRect.setAttribute('fill', state === 'locked' ? 'rgba(7,13,28,.82)' : 'rgba(3,14,32,.95)');
        labelRect.setAttribute('stroke', color.dimStroke);
        labelRect.setAttribute('stroke-width', '1');
        labelGroup.appendChild(labelRect);

        const levelText = document.createElementNS(ns, 'text');
        levelText.setAttribute('x', labelBox.x + 10);
        levelText.setAttribute('y', labelBox.y + 16);
        levelText.setAttribute('font-family', "'Share Tech Mono', monospace");
        levelText.setAttribute('font-size', '11');
        levelText.setAttribute('fill', state === 'locked' ? 'rgba(200,232,240,.25)' : color.text);
        levelText.textContent = this.getMissionLabel(mission);
        labelGroup.appendChild(levelText);

        const nameText = document.createElementNS(ns, 'text');
        nameText.setAttribute('x', labelBox.x + labelBox.width / 2);
        nameText.setAttribute('y', labelBox.y + 34);
        nameText.setAttribute('text-anchor', 'middle');
        nameText.setAttribute('font-family', "'Rajdhani', sans-serif");
        nameText.setAttribute('font-size', '12');
        nameText.setAttribute('font-weight', '600');
        nameText.setAttribute('fill', state === 'locked' ? 'rgba(200,232,240,.35)' : '#ffffff');
        nameText.textContent = this.truncateTitle(this.getCompactMissionTitle(mission.title), 19);
        labelGroup.appendChild(nameText);

        const statusText = document.createElementNS(ns, 'text');
        statusText.setAttribute('x', labelBox.x + 10);
        statusText.setAttribute('y', labelBox.y + 50);
        statusText.setAttribute('font-family', "'Share Tech Mono', monospace");
        statusText.setAttribute('font-size', '10');
        statusText.setAttribute('fill', state === 'complete' ? '#00ff88' : state === 'active' ? '#00e5ff' : 'rgba(200,232,240,.35)');
        statusText.textContent = state.toUpperCase();
        labelGroup.appendChild(statusText);
        svg.appendChild(labelGroup);

        const hit = document.createElementNS(ns, 'circle');
        hit.setAttribute('cx', point.x);
        hit.setAttribute('cy', point.y);
        hit.setAttribute('r', radius + 18);
        hit.setAttribute('fill', 'transparent');
        hit.style.cursor = state === 'locked' ? 'not-allowed' : 'pointer';
        hit.addEventListener('mouseenter', () => {
            this.showTooltip(tooltip, point, mission, state);
        });
        hit.addEventListener('mouseleave', () => {
            this.hideTooltip(tooltip);
        });
        hit.addEventListener('click', () => {
            this.selectedMissionId = mission.id;
            if (state !== 'locked') {
                this.openMission(sectionId, mission.id);
            }
        });
        svg.appendChild(hit);
    }

    showTooltip(tooltip, point, mission, state) {
        if (!tooltip) return;
        tooltip.style.left = `${point.x}px`;
        tooltip.style.top = `${point.y - 16}px`;
        tooltip.querySelector('[data-tip-level]').textContent = mission.label;
        tooltip.querySelector('[data-tip-name]').textContent = this.getCompactMissionTitle(mission.title);
        const status = tooltip.querySelector('[data-tip-status]');
        status.textContent = state.toUpperCase();
        status.className = `sm-tip-status ${state}`;
        tooltip.classList.add('show');
    }

    hideTooltip(tooltip) {
        if (!tooltip) return;
        tooltip.classList.remove('show');
    }

    openMission(section, missionId) {
        const mission = this.getSectionMissions(section).find((item) => item.id === missionId);
        if (!mission) return;
        this.game.currentSection = section;
        this.game.missionSelectScreen.showBriefing(mission);
    }

    getMissionLabel(mission) {
        return mission.label || `L${mission.level}`;
    }

    truncateTitle(title, max) {
        return title.length > max ? `${title.slice(0, max - 1)}…` : title;
    }

    getCompactMissionTitle(title) {
        return String(title || '').replace(/^LEVEL\s+\d+:\s*/i, '').trim();
    }

    bindEvents(container) {
        container.querySelectorAll('[data-map-section]').forEach((button) => {
            button.addEventListener('click', () => {
                if (button.disabled) return;
                this.selectedSection = button.dataset.mapSection;
                this.selectedMissionId = null;
                this.render();
            });
        });
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
