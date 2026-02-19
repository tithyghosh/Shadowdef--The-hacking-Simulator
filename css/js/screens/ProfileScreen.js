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
        
        this.setupEventListeners();
    }

    /**
     * Render profile screen
     */
    render() {
        const profileContainer = document.getElementById('profile-screen');
        if (!profileContainer) return;

        const user = this.auth.getCurrentUser();
        if (!user) {
            this.renderGuestProfile(profileContainer);
            return;
        }

        profileContainer.innerHTML = `
            <div class="profile-container">
                <div class="profile-header">
                    <div class="profile-avatar">
                        <img src="${user.avatar}" alt="${user.name}" class="avatar-image">
                        <div class="avatar-level">
                            <span class="level-badge">LV ${user.gameStats.level || 1}</span>
                        </div>
                    </div>
                    
                    <div class="profile-info">
                        <h2 class="profile-name">${user.name}</h2>
                        <p class="profile-email">${user.email}</p>
                        <div class="profile-provider">
                            <span class="provider-badge ${user.provider}">
                                ${this.getProviderIcon(user.provider)} ${user.provider.toUpperCase()}
                            </span>
                        </div>
                    </div>
                    
                    <div class="profile-actions">
                        <button class="btn btn-small" id="edit-profile">EDIT</button>
                        <button class="btn btn-small" id="sync-data">SYNC</button>
                        <button class="btn btn-danger btn-small" id="logout-btn">LOGOUT</button>
                    </div>
                </div>

                <div class="profile-content">
                    <div class="stats-section">
                        <h3 class="section-title">Game Statistics</h3>
                        <div class="stats-grid">
                            ${this.renderStatsGrid(user.gameStats)}
                        </div>
                    </div>

                    <div class="progress-section">
                        <h3 class="section-title">Progress & Experience</h3>
                        <div class="progress-bars">
                            ${this.renderProgressBars(user.gameStats)}
                        </div>
                    </div>

                    <div class="achievements-section">
                        <h3 class="section-title">Achievements</h3>
                        <div class="achievements-grid">
                            ${this.renderAchievements(user.gameStats.achievements || [])}
                        </div>
                    </div>

                    <div class="credits-section">
                        <h3 class="section-title">Gaming Credits</h3>
                        <div class="credits-display">
                            <div class="credits-amount">
                                <span class="credits-icon">💰</span>
                                <span class="credits-value">${user.gameStats.credits || 0}</span>
                                <span class="credits-label">Credits</span>
                            </div>
                            <button class="btn btn-primary" id="earn-credits">EARN MORE</button>
                        </div>
                    </div>

                    <div class="recent-activity">
                        <h3 class="section-title">Recent Activity</h3>
                        <div class="activity-list">
                            ${this.renderRecentActivity(user.gameStats)}
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.setupProfileListeners();
    }

    /**
     * Render guest profile
     */
    renderGuestProfile(container) {
        container.innerHTML = `
            <div class="guest-profile">
                <div class="guest-avatar">
                    <div class="guest-icon">👤</div>
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
                        <li>💾 Save your progress</li>
                        <li>🏆 Track achievements</li>
                        <li>💰 Earn gaming credits</li>
                        <li>📊 View statistics</li>
                        <li>🎯 Unlock exclusive content</li>
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
     * Render statistics grid
     */
    renderStatsGrid(stats) {
        const statItems = [
            { label: 'Total Score', value: stats.totalScore || 0, icon: '🎯' },
            { label: 'High Score', value: stats.highScore || 0, icon: '🏆' },
            { label: 'Missions Completed', value: stats.missionsCompleted || 0, icon: '✅' },
            { label: 'Play Time', value: this.formatPlayTime(stats.totalPlayTime || 0), icon: '⏱️' },
            { label: 'Success Rate', value: this.calculateSuccessRate(stats), icon: '📈' },
            { label: 'Rank', value: this.calculateRank(stats), icon: '🥇' }
        ];

        return statItems.map(item => `
            <div class="stat-item">
                <div class="stat-icon">${item.icon}</div>
                <div class="stat-content">
                    <div class="stat-value">${item.value}</div>
                    <div class="stat-label">${item.label}</div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Render progress bars
     */
    renderProgressBars(stats) {
        const level = stats.level || 1;
        const experience = stats.experience || 0;
        const nextLevelXP = level * 1000;
        const currentLevelXP = experience % 1000;
        const progressPercent = (currentLevelXP / nextLevelXP) * 100;

        return `
            <div class="progress-item">
                <div class="progress-header">
                    <span class="progress-label">Level Progress</span>
                    <span class="progress-value">${currentLevelXP} / ${nextLevelXP} XP</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progressPercent}%"></div>
                </div>
            </div>
            
            <div class="progress-item">
                <div class="progress-header">
                    <span class="progress-label">Mission Progress</span>
                    <span class="progress-value">${stats.missionsCompleted || 0} / 20 Missions</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${((stats.missionsCompleted || 0) / 20) * 100}%"></div>
                </div>
            </div>
        `;
    }

    /**
     * Render achievements
     */
    renderAchievements(achievements) {
        const allAchievements = [
            { id: 'first_mission', name: 'First Steps', description: 'Complete your first mission', icon: '🎯' },
            { id: 'speed_demon', name: 'Speed Demon', description: 'Complete a mission in under 2 minutes', icon: '⚡' },
            { id: 'perfectionist', name: 'Perfectionist', description: 'Complete a mission without hints', icon: '💎' },
            { id: 'high_scorer', name: 'High Scorer', description: 'Achieve a score over 10,000', icon: '🏆' },
            { id: 'dedicated', name: 'Dedicated Player', description: 'Play for 5 hours total', icon: '⏰' },
            { id: 'collector', name: 'Credit Collector', description: 'Earn 5,000 credits', icon: '💰' }
        ];

        return allAchievements.map(achievement => {
            const isUnlocked = achievements.includes(achievement.id);
            return `
                <div class="achievement-item ${isUnlocked ? 'unlocked' : 'locked'}">
                    <div class="achievement-icon">${achievement.icon}</div>
                    <div class="achievement-content">
                        <div class="achievement-name">${achievement.name}</div>
                        <div class="achievement-desc">${achievement.description}</div>
                    </div>
                    ${isUnlocked ? '<div class="achievement-check">✓</div>' : ''}
                </div>
            `;
        }).join('');
    }

    /**
     * Render recent activity
     */
    renderRecentActivity(stats) {
        // Mock recent activity data
        const activities = [
            { type: 'mission', text: 'Completed "Network Infiltration"', time: '2 hours ago', icon: '🎯' },
            { type: 'achievement', text: 'Unlocked "Speed Demon" achievement', time: '1 day ago', icon: '🏆' },
            { type: 'credits', text: 'Earned 500 credits', time: '2 days ago', icon: '💰' },
            { type: 'level', text: 'Reached Level 3', time: '3 days ago', icon: '⬆️' }
        ];

        return activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">${activity.icon}</div>
                <div class="activity-content">
                    <div class="activity-text">${activity.text}</div>
                    <div class="activity-time">${activity.time}</div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Setup profile event listeners
     */
    setupEventListeners() {
        document.addEventListener('shadowdef:auth:login', () => {
            this.render();
        });

        document.addEventListener('shadowdef:auth:logout', () => {
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
                    <input type="text" id="edit-name" value="${user.name}" maxlength="50">
                </div>
                
                <div class="form-group">
                    <label for="edit-avatar">Avatar URL</label>
                    <input type="url" id="edit-avatar" value="${user.avatar}" placeholder="Enter image URL">
                </div>
                
                <div class="avatar-preview">
                    <img src="${user.avatar}" alt="Avatar Preview" id="avatar-preview">
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
        this.ui.showConfirm(
            'Logout Confirmation',
            'Are you sure you want to logout? Your progress will be saved.',
            async () => {
                await this.auth.logout();
                this.ui.showNotification('Logged out successfully', 'success');
            }
        );
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
                        <div class="method-icon">🎯</div>
                        <div class="method-info">
                            <div class="method-name">Complete Missions</div>
                            <div class="method-reward">+100-500 credits</div>
                        </div>
                    </div>
                    
                    <div class="credit-method">
                        <div class="method-icon">🏆</div>
                        <div class="method-info">
                            <div class="method-name">Unlock Achievements</div>
                            <div class="method-reward">+200-1000 credits</div>
                        </div>
                    </div>
                    
                    <div class="credit-method">
                        <div class="method-icon">⚡</div>
                        <div class="method-info">
                            <div class="method-name">Speed Bonuses</div>
                            <div class="method-reward">+50-200 credits</div>
                        </div>
                    </div>
                    
                    <div class="credit-method">
                        <div class="method-icon">📅</div>
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

    /**
     * Utility functions
     */
    getProviderIcon(provider) {
        const icons = {
            google: 'G',
            email: 'E'
        };
        return icons[provider] || 'U';
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
        if (score < 15000) return 'Expert';
        if (score < 50000) return 'Elite';
        return 'Legend';
    }
}
