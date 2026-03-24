/**
 * UIManager - Handles UI components (modals, notifications, tooltips)
 */

import { CONFIG } from '../data/config.js';
import { AudioManager } from '../core/AudioManager.js';

export class UIManager {
    constructor() {
        this.audio = AudioManager.getInstance();
        this.activeModal = null;
        this.notifications = [];
        this.modalContainer = document.getElementById('modal-container') || this.createModalContainer();
        this.musicPanelInterval = null;
        this.previousVolume = 0.3;
    }

    /**
     * Create modal container if it doesn't exist
     * @returns {HTMLElement} Modal container
     */
    createModalContainer() {
        const container = document.createElement('div');
        container.id = 'modal-container';
        document.body.appendChild(container);
        return container;
    }

    /**
     * Show a modal dialog
     * @param {string} title - Modal title
     * @param {string} content - Modal HTML content
     * @param {Object} options - Modal options
     * @returns {HTMLElement} Modal element
     */
    showModal(title, content, options = {}) {
        // Close existing modal
        if (this.activeModal) {
            this.closeModal();
        }

        const {
            type = 'info', // info, success, error, warning
            buttons = [],
            closable = true,
            width = 'auto',
            panel = false,
            panelPosition = 'right',
            modalClass = '',
            contentClass = ''
        } = options;

        // Create modal HTML
        const modal = document.createElement('div');
        modal.className = 'modal active';
        if (modalClass) {
            modal.classList.add(...modalClass.split(' ').filter(Boolean));
        }
        if (panel) {
            modal.classList.add('modal-panel', `modal-panel-${panelPosition}`);
        }
        modal.innerHTML = `
            <div class="modal-content ${contentClass}" style="max-width: ${width}">
                ${closable ? '<button class="modal-close" onclick="game.ui.closeModal()">✕</button>' : ''}
                <div class="modal-title ${type}">${title}</div>
                <div class="modal-body">
                    ${content}
                </div>
                ${buttons.length > 0 ? `
                    <div class="modal-buttons">
                        ${buttons.map((btn, i) => `
                            <button class="btn ${btn.class || ''}" data-modal-action="${i}">
                                ${btn.text}
                            </button>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;

        // Add to container
        this.modalContainer.appendChild(modal);
        this.activeModal = modal;

        // Setup button actions
        buttons.forEach((btn, i) => {
            const btnElement = modal.querySelector(`[data-modal-action="${i}"]`);
            if (btnElement && btn.onClick) {
                btnElement.addEventListener('click', () => {
                    btn.onClick();
                    if (btn.closeOnClick !== false) {
                        this.closeModal();
                    }
                });
            }
        });

        // Close on backdrop click
        if (closable) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }

        // Play sound
        this.audio.playButtonClick();

        return modal;
    }

    /**
     * Close active modal
     */
    closeModal() {
        if (!this.activeModal) return;

        this.activeModal.classList.remove('active');
        
        setTimeout(() => {
            if (this.activeModal && this.activeModal.parentNode) {
                this.activeModal.parentNode.removeChild(this.activeModal);
            }
            this.activeModal = null;
        }, CONFIG.UI.MODAL_CLOSE_DELAY);

        this.audio.playButtonClick();
    }

    /**
     * Show a notification toast
     * @param {string} message - Notification message
     * @param {string} type - Notification type (success, error, info, warning)
     * @param {number} duration - Duration in ms
     * @returns {HTMLElement} Notification element
     */
    showNotification(message, type = 'info', duration = CONFIG.UI.NOTIFICATION_DURATION) {
        const notification = document.createElement('div');
        notification.className = `toast ${type} animate-slideInRight`;
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 1.5rem;">
                    ${this.getNotificationIcon(type)}
                </span>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(notification);
        this.notifications.push(notification);

        // Position notification
        this.repositionNotifications();

        // Play sound
        switch (type) {
            case 'success':
                this.audio.playSuccess();
                break;
            case 'error':
                this.audio.playFailure();
                break;
            default:
                this.audio.playButtonClick();
        }

        // Auto remove
        if (duration > 0) {
            setTimeout(() => {
                this.removeNotification(notification);
            }, duration);
        }

        return notification;
    }

    /**
     * Show the login/register success toast
     * @param {string} name - Authenticated player name
     * @param {number} duration - Duration in ms
     * @returns {HTMLElement} Notification element
     */
    showAccessToast(name, options = {}) {
        const {
            duration = 4500,
            tag = 'ACCESS GRANTED',
            prefix = 'Welcome back,'
        } = options;
        const safeName = this.escapeHTML(name || 'Agent');
        const safeTag = this.escapeHTML(tag);
        const safePrefix = this.escapeHTML(prefix);
        const notification = document.createElement('div');
        notification.className = 'toast toast-auth success';
        notification.dataset.toastPlacement = 'top-center';
        notification.innerHTML = `
            <div class="toast-card">
                <div class="toast-accent" aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                </div>
                <div class="toast-body">
                    <div class="toast-tag">${safeTag}</div>
                    <div class="toast-msg">${safePrefix} <span class="toast-name">${safeName}!</span></div>
                </div>
                <button class="toast-close" type="button" aria-label="Dismiss notification">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                    </svg>
                </button>
            </div>
        `;

        notification.querySelector('.toast-close')?.addEventListener('click', () => {
            this.removeNotification(notification);
        });

        document.body.appendChild(notification);
        this.notifications.push(notification);
        this.repositionNotifications();
        this.audio.playSuccess();

        if (duration > 0) {
            setTimeout(() => {
                this.removeNotification(notification);
            }, duration);
        }

        return notification;
    }

    /**
     * Escape HTML entities for safe inline rendering
     * @param {string} value - Raw text
     * @returns {string} Escaped text
     */
    escapeHTML(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    /**
     * Get icon for notification type
     * @param {string} type - Notification type
     * @returns {string} Icon character
     */
    getNotificationIcon(type) {
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[type] || icons.info;
    }

    /**
     * Remove a notification
     * @param {HTMLElement} notification - Notification to remove
     */
    removeNotification(notification) {
        if (!notification || notification.dataset.removing === 'true') {
            return;
        }

        notification.dataset.removing = 'true';
        notification.style.animation = notification.dataset.toastPlacement === 'top-center'
            ? 'toastFadeOut 0.25s ease forwards'
            : 'slideOutRight 0.3s ease';
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            this.notifications = this.notifications.filter(n => n !== notification);
            this.repositionNotifications();
        }, 300);
    }

    /**
     * Reposition all notifications
     */
    repositionNotifications() {
        let bottomRightIndex = 0;
        let topCenterIndex = 0;

        this.notifications.forEach((notification) => {
            if (notification.dataset.toastPlacement === 'top-center') {
                notification.style.top = `${28 + (topCenterIndex * 108)}px`;
                notification.style.bottom = 'auto';
                topCenterIndex += 1;
                return;
            }

            notification.style.bottom = `${30 + (bottomRightIndex * 80)}px`;
            notification.style.top = 'auto';
            bottomRightIndex += 1;
        });
    }

    /**
     * Clear all notifications
     */
    clearNotifications() {
        this.notifications.forEach(n => this.removeNotification(n));
    }

    /**
     * Show confirmation dialog
     * @param {string} title - Dialog title
     * @param {string} message - Dialog message
     * @param {Function} onConfirm - Confirm callback
     * @param {Function} onCancel - Cancel callback
     */
    showConfirm(title, message, onConfirm, onCancel) {
        this.showModal(title, `<p>${message}</p>`, {
            buttons: [
                {
                    text: 'CONFIRM',
                    class: 'btn-primary',
                    onClick: onConfirm
                },
                {
                    text: 'CANCEL',
                    class: 'btn',
                    onClick: onCancel || (() => {})
                }
            ]
        });
    }

    /**
     * Show styled logout confirmation modal
     * @param {Function} onConfirm - Confirm callback
     * @param {Function} onCancel - Cancel callback
     */
    showLogoutConfirm(onConfirm, onCancel) {
        if (this.activeModal) {
            this.closeModal();
        }

        const overlay = document.createElement('div');
        overlay.className = 'logout-overlay active';
        overlay.innerHTML = `
            <div class="logout-modal">
                <button class="logout-close-btn" type="button" aria-label="Close">&#10005;</button>

                <div class="logout-icon-wrap">
                    <div class="logout-icon-circle">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff3366" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                            <polyline points="16 17 21 12 16 7"/>
                            <line x1="21" y1="12" x2="9" y2="12"/>
                        </svg>
                    </div>
                </div>

                <div class="logout-title">LOGOUT</div>
                <div class="logout-sub">SESSION TERMINATION</div>
                <div class="logout-divider"></div>
                <div class="logout-msg">Are you sure you want to logout?</div>

                <div class="logout-btn-row">
                    <button class="logout-btn logout-btn-confirm" type="button">CONFIRM</button>
                    <button class="logout-btn logout-btn-cancel" type="button">CANCEL</button>
                </div>
            </div>
        `;

        this.modalContainer.appendChild(overlay);
        this.activeModal = overlay;
        this.audio.playButtonClick();

        const closeModal = (invokeCancel = true) => {
            const modal = overlay.querySelector('.logout-modal');
            if (!modal) return;

            modal.style.transition = 'all 0.2s ease';
            modal.style.opacity = '0';
            modal.style.transform = 'translateY(10px)';
            setTimeout(() => {
                overlay.style.transition = 'opacity 0.2s ease';
                overlay.style.opacity = '0';
            }, 60);
            setTimeout(() => {
                if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
                if (this.activeModal === overlay) this.activeModal = null;
                if (invokeCancel && onCancel) onCancel();
            }, 280);
        };

        overlay.querySelector('.logout-close-btn')?.addEventListener('click', () => closeModal(true));
        overlay.querySelector('.logout-btn-cancel')?.addEventListener('click', () => closeModal(true));

        overlay.querySelector('.logout-btn-confirm')?.addEventListener('click', async (e) => {
            const confirmBtn = e.currentTarget;
            confirmBtn.textContent = 'LOGGING OUT...';
            confirmBtn.disabled = true;
            confirmBtn.style.opacity = '0.6';

            try {
                if (onConfirm) await onConfirm();
            } finally {
                setTimeout(() => closeModal(false), 900);
            }
        });

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeModal(true);
            }
        });
    }

    /**
     * Show loading spinner
     * @param {string} message - Loading message
     * @returns {HTMLElement} Loading element
     */
    showLoading(message = 'LOADING...') {
        const loading = document.createElement('div');
        loading.className = 'loading';
        loading.innerHTML = `
            <div class="spinner"></div>
            <p style="margin-top: 20px; color: var(--cyber-blue);">${message}</p>
        `;
        document.body.appendChild(loading);
        return loading;
    }

    /**
     * Hide loading spinner
     * @param {HTMLElement} loading - Loading element to hide
     */
    hideLoading(loading) {
        if (loading && loading.parentNode) {
            loading.parentNode.removeChild(loading);
        }
    }

    /**
     * Update element text with typing animation
     * @param {string} elementId - Element ID
     * @param {string} text - Text to type
     * @param {number} speed - Typing speed (ms per character)
     */
    typeText(elementId, text, speed = 50) {
        const element = document.getElementById(elementId);
        if (!element) return;

        element.textContent = '';
        let index = 0;

        const interval = setInterval(() => {
            if (index < text.length) {
                element.textContent += text[index];
                this.audio.playTyping();
                index++;
            } else {
                clearInterval(interval);
            }
        }, speed);
    }

    /**
     * Show tooltip
     * @param {HTMLElement} element - Element to attach tooltip to
     * @param {string} text - Tooltip text
     * @param {string} position - Tooltip position (top, bottom, left, right)
     */
    showTooltip(element, text, position = 'top') {
        element.setAttribute('data-tooltip', text);
        element.classList.add('tooltip');
        element.dataset.tooltipPosition = position;
    }

    /**
     * Hide tooltip
     * @param {HTMLElement} element - Element to remove tooltip from
     */
    hideTooltip(element) {
        element.removeAttribute('data-tooltip');
        element.classList.remove('tooltip');
    }

    /**
     * Animate element
     * @param {string} elementId - Element ID
     * @param {string} animationClass - Animation class to apply
     * @param {Function} callback - Callback after animation
     */
    animateElement(elementId, animationClass, callback) {
        const element = document.getElementById(elementId);
        if (!element) return;

        element.classList.add(animationClass);

        element.addEventListener('animationend', () => {
            element.classList.remove(animationClass);
            if (callback) callback();
        }, { once: true });
    }

    /**
     * Show progress bar
     * @param {string} containerId - Container element ID
     * @param {number} progress - Progress percentage (0-100)
     * @param {string} label - Progress label
     */
    updateProgress(containerId, progress, label = '') {
        const container = document.getElementById(containerId);
        if (!container) return;

        const progressBar = container.querySelector('.progress-fill');
        const progressText = container.querySelector('.progress-label span:last-child');

        if (progressBar) {
            progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
        }

        if (progressText) {
            progressText.textContent = label || `${Math.floor(progress)}%`;
        }
    }

    /**
     * Flash screen with color (for effects)
     * @param {string} color - Flash color
     * @param {number} duration - Flash duration (ms)
     */
    flashScreen(color, duration = 200) {
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: ${color};
            z-index: 9999;
            pointer-events: none;
            animation: fadeOut ${duration}ms ease;
        `;
        document.body.appendChild(flash);

        setTimeout(() => {
            if (flash.parentNode) {
                flash.parentNode.removeChild(flash);
            }
        }, duration);
    }

    /**
     * Update music control panel
     * @param {Object} audioManager - Audio manager instance
     */
    updateMusicPanel(audioManager) {
        const musicStatus = document.getElementById('music-status');
        const musicVolumeIndicator = document.getElementById('music-volume-indicator');
        const musicPlayPause = document.getElementById('music-play-pause');
        const musicVolumeBtn = document.getElementById('music-volume-btn');

        if (!musicStatus || !musicVolumeIndicator || !musicPlayPause || !musicVolumeBtn) {
            return;
        }

        const settings = audioManager.getSettings();
        const isPlaying = audioManager.currentMusic && 
                         audioManager.currentAudioElement && 
                         !audioManager.currentAudioElement.paused;

        // Update status text
        if (settings.musicEnabled && audioManager.currentMusic) {
            musicStatus.textContent = isPlaying ? '♪ Playing' : '♪ Paused';
            musicStatus.style.color = isPlaying ? 'var(--cyber-green)' : 'var(--cyber-orange)';
        } else {
            musicStatus.textContent = '♪ Music';
            musicStatus.style.color = 'var(--text-secondary)';
        }

        // Update volume display
        musicVolumeIndicator.textContent = `${Math.round(settings.musicVolume * 100)}%`;

        // Update play/pause button
        musicPlayPause.textContent = isPlaying ? '⏸️' : '▶️';
        musicPlayPause.disabled = !settings.musicEnabled || !audioManager.currentMusic;

        // Update volume button
        if (settings.musicVolume === 0) {
            musicVolumeBtn.textContent = '🔇';
        } else if (settings.musicVolume < 0.5) {
            musicVolumeBtn.textContent = '🔉';
        } else {
            musicVolumeBtn.textContent = '🔊';
        }
        musicVolumeBtn.disabled = !settings.musicEnabled;
    }

    /**
     * Setup music control panel listeners
     * @param {Object} audioManager - Audio manager instance
     */
    setupMusicControlPanel(audioManager) {
        const musicPlayPause = document.getElementById('music-play-pause');
        const musicVolumeBtn = document.getElementById('music-volume-btn');

        if (musicPlayPause) {
            musicPlayPause.addEventListener('click', () => {
                if (audioManager.currentAudioElement && !audioManager.currentAudioElement.paused) {
                    audioManager.pauseMusic();
                } else {
                    audioManager.resumeMusic();
                }
                this.updateMusicPanel(audioManager);
            });
        }

        if (musicVolumeBtn) {
            musicVolumeBtn.addEventListener('click', () => {
                // Quick volume toggle
                const currentVolume = audioManager.getSettings().musicVolume;
                if (currentVolume > 0) {
                    // Store current volume and mute
                    this.previousVolume = currentVolume;
                    audioManager.setMusicVolume(0);
                } else {
                    // Restore previous volume or default to 30%
                    audioManager.setMusicVolume(this.previousVolume || 0.3);
                }
                this.updateMusicPanel(audioManager);
            });
        }

        // Update panel every second to keep it in sync
        this.musicPanelInterval = setInterval(() => {
            this.updateMusicPanel(audioManager);
        }, 1000);
    }

    /**
     * Cleanup music control panel
     */
    cleanupMusicControlPanel() {
        if (this.musicPanelInterval) {
            clearInterval(this.musicPanelInterval);
            this.musicPanelInterval = null;
        }
    }

    /**
     * Shake element
     * @param {string} elementId - Element ID to shake
     */
    shake(elementId) {
        this.animateElement(elementId, 'animate-shake');
    }

    /**
     * Pulse element
     * @param {string} elementId - Element ID to pulse
     */
    pulse(elementId) {
        const element = document.getElementById(elementId);
        if (!element) return;

        element.classList.add('animate-pulse');
        
        setTimeout(() => {
            element.classList.remove('animate-pulse');
        }, 2000);
    }
}
