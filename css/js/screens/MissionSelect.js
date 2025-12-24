/**
 * MissionSelect - Mission selection screen
 * Displays available, locked, and completed missions
 */

export class MissionSelect {
    constructor(game) {
        this.game = game;
        this.ui = game.ui;
        this.audio = game.audio;
    }

    /**
     * Render mission selection screen
     * @param {Array} missions - Array of mission objects
     */
    render(missions) {
        const grid = document.getElementById('mission-grid');
        if (!grid) {
            console.error('Mission grid not found');
            return;
        }

        grid.innerHTML = '';

        missions.forEach(mission => {
            const card = this.createMissionCard(mission);
            grid.appendChild(card);
        });

        console.log('📋 Mission select rendered');
    }

    /**
     * Create a mission card element
     * @param {Object} mission - Mission data
     * @returns {HTMLElement} Mission card
     */
    createMissionCard(mission) {
        const card = document.createElement('div');
        card.className = `mission-card ${mission.locked ? 'locked' : ''} ${mission.completed ? 'completed' : ''}`;
        
        // Difficulty styling
        const difficultyClass = mission.difficulty.toLowerCase();
        
        card.innerHTML = `
            <div class="mission-title">${mission.title}</div>
            <div class="mission-desc">${mission.desc}</div>
            <div style="margin-top: 10px;">
                <span class="mission-difficulty ${difficultyClass}">${mission.difficulty.toUpperCase()}</span>
                <span style="color: var(--text-muted); font-size: 0.8rem; margin-left: 10px;">
                    ⏱️ ${mission.estimatedTime}
                </span>
            </div>
            ${mission.bestScore > 0 ? `
                <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--panel-border);">
                    <span style="color: var(--text-secondary); font-size: 0.85rem;">
                        Best Score: <span style="color: var(--cyber-green);">${mission.bestScore}</span>
                    </span>
                </div>
            ` : ''}
        `;

        // Click handler
        if (!mission.locked) {
            card.addEventListener('click', () => {
                this.selectMission(mission);
            });
            
            // Hover effects
            card.addEventListener('mouseenter', () => {
                this.showMissionPreview(mission);
            });
        } else {
            // Locked mission feedback
            card.addEventListener('click', () => {
                this.ui.showNotification('Complete previous missions to unlock!', 'warning');
                this.ui.shake(card.id);
            });
        }

        return card;
    }

    /**
     * Select a mission
     * @param {Object} mission - Mission to select
     */
    selectMission(mission) {
        this.audio.playButtonClick();
        
        // Show mission briefing
        this.showBriefing(mission);
    }

    /**
     * Show mission briefing before starting
     * @param {Object} mission - Mission data
     */
    showBriefing(mission) {
        const objectivesList = mission.objectives
            .map(obj => `<li style="margin-bottom: 8px;">→ ${obj}</li>`)
            .join('');

        this.ui.showModal(
            mission.title,
            `
                <div style="text-align: left;">
                    <div style="margin-bottom: 20px;">
                        <p style="color: var(--text-secondary); margin-bottom: 10px;">${mission.desc}</p>
                        <div style="display: flex; gap: 15px; flex-wrap: wrap;">
                            <span class="badge badge-${mission.difficulty === 'easy' ? 'success' : mission.difficulty === 'medium' ? 'warning' : 'danger'}">
                                ${mission.difficulty.toUpperCase()}
                            </span>
                            <span class="badge badge-info">
                                ⏱️ ${mission.estimatedTime}
                            </span>
                            <span class="badge badge-info">
                                ${this.getPuzzleTypeLabel(mission.type)}
                            </span>
                        </div>
                    </div>

                    <div class="divider"></div>

                    <div style="margin: 20px 0;">
                        <h3 style="color: var(--cyber-blue); margin-bottom: 10px;">OBJECTIVES:</h3>
                        <ul style="list-style: none; padding-left: 0; color: var(--text-secondary);">
                            ${objectivesList}
                        </ul>
                    </div>

                    <div class="divider"></div>

                    <div style="margin-top: 20px;">
                        <h3 style="color: var(--cyber-blue); margin-bottom: 10px;">REWARDS:</h3>
                        <div style="display: flex; gap: 20px; color: var(--text-secondary);">
                            <span>
                                <strong style="color: var(--cyber-green);">+${mission.rewards.xp}</strong> XP
                            </span>
                            <span>
                                <strong style="color: var(--cyber-green);">+${mission.rewards.credits}</strong> Credits
                            </span>
                        </div>
                    </div>

                    ${mission.bestScore > 0 ? `
                        <div class="divider"></div>
                        <div style="margin-top: 20px; text-align: center;">
                            <p style="color: var(--text-secondary);">
                                Your Best: <strong style="color: var(--cyber-green);">${mission.bestScore}</strong>
                            </p>
                        </div>
                    ` : ''}
                </div>
            `,
            {
                closable: true,
                buttons: [
                    {
                        text: 'START MISSION',
                        class: 'btn-primary',
                        onClick: () => {
                            this.game.startMission(mission);
                        }
                    },
                    {
                        text: 'BACK',
                        class: 'btn',
                        onClick: () => {
                            this.ui.closeModal();
                        }
                    }
                ]
            }
        );
    }

    /**
     * Show mission preview (tooltip)
     * @param {Object} mission - Mission data
     */
    showMissionPreview(mission) {
        // Could add floating tooltip here
        // For now, just handled by CSS hover
    }

    /**
     * Get puzzle type display label
     * @param {string} type - Puzzle type
     * @returns {string} Display label
     */
    getPuzzleTypeLabel(type) {
        const labels = {
            password: '🔐 Password Cracking',
            firewall: '🛡️ Firewall Bypass',
            network: '🌐 Network Navigation',
            malware: '🦠 Malware Detection',
            phishing: '📧 Phishing Analysis',
            mixed: '⚡ Multi-Stage'
        };
        return labels[type] || type.toUpperCase();
    }

    /**
     * Filter missions by status
     * @param {Array} missions - All missions
     * @param {string} filter - Filter type ('all', 'available', 'completed', 'locked')
     */
    filterMissions(missions, filter) {
        let filtered = missions;

        switch (filter) {
            case 'available':
                filtered = missions.filter(m => !m.locked && !m.completed);
                break;
            case 'completed':
                filtered = missions.filter(m => m.completed);
                break;
            case 'locked':
                filtered = missions.filter(m => m.locked);
                break;
            case 'all':
            default:
                // Show all
                break;
        }

        this.render(filtered);
    }

    /**
     * Sort missions
     * @param {Array} missions - All missions
     * @param {string} sortBy - Sort criteria ('id', 'difficulty', 'score')
     */
    sortMissions(missions, sortBy) {
        const sorted = [...missions];

        switch (sortBy) {
            case 'difficulty':
                const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
                sorted.sort((a, b) => 
                    (difficultyOrder[a.difficulty] || 0) - (difficultyOrder[b.difficulty] || 0)
                );
                break;
            case 'score':
                sorted.sort((a, b) => (b.bestScore || 0) - (a.bestScore || 0));
                break;
            case 'id':
            default:
                sorted.sort((a, b) => a.id - b.id);
                break;
        }

        this.render(sorted);
    }

    /**
     * Show mission statistics
     * @param {Array} missions - All missions
     */
    showStats(missions) {
        const completed = missions.filter(m => m.completed).length;
        const available = missions.filter(m => !m.locked && !m.completed).length;
        const locked = missions.filter(m => m.locked).length;
        const totalScore = missions.reduce((sum, m) => sum + (m.bestScore || 0), 0);

        this.ui.showModal(
            'MISSION STATISTICS',
            `
                <div style="text-align: center;">
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 20px 0;">
                        <div class="panel">
                            <div style="font-size: 2rem; color: var(--cyber-green); margin-bottom: 10px;">
                                ${completed}
                            </div>
                            <div style="color: var(--text-secondary);">Completed</div>
                        </div>
                        <div class="panel">
                            <div style="font-size: 2rem; color: var(--cyber-blue); margin-bottom: 10px;">
                                ${available}
                            </div>
                            <div style="color: var(--text-secondary);">Available</div>
                        </div>
                        <div class="panel">
                            <div style="font-size: 2rem; color: var(--text-muted); margin-bottom: 10px;">
                                ${locked}
                            </div>
                            <div style="color: var(--text-secondary);">Locked</div>
                        </div>
                        <div class="panel">
                            <div style="font-size: 2rem; color: var(--cyber-pink); margin-bottom: 10px;">
                                ${totalScore}
                            </div>
                            <div style="color: var(--text-secondary);">Total Score</div>
                        </div>
                    </div>

                    <div class="divider"></div>

                    <div style="margin-top: 20px;">
                        <div style="color: var(--text-secondary); margin-bottom: 10px;">
                            Overall Progress
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${(completed / missions.length) * 100}%"></div>
                        </div>
                        <div style="color: var(--cyber-blue); margin-top: 10px; font-size: 1.5rem;">
                            ${Math.floor((completed / missions.length) * 100)}%
                        </div>
                    </div>
                </div>
            `,
            {
                buttons: [
                    {
                        text: 'CLOSE',
                        class: 'btn',
                        onClick: () => this.ui.closeModal()
                    }
                ]
            }
        );
    }
}