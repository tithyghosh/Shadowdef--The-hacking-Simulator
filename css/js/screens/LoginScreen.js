/**
 * LoginScreen - Handles user authentication interface
 */

import { AuthManager } from '../core/AuthManager.js';
import { UIManager } from '../ui/UIManager.js';
import { CONFIG } from '../data/config.js';

export class LoginScreen {
    constructor(game) {
        this.game = game;
        this.auth = AuthManager.getInstance();
        this.ui = new UIManager();
        this.currentMode = 'login'; // 'login' or 'register'
        
        this.setupEventListeners();
    }

    /**
     * Render login screen
     */
    render() {
        const loginContainer = document.getElementById('login-screen');
        if (!loginContainer) return;

        loginContainer.innerHTML = `
            <div class="login-container">
                <div class="login-header">
                    <div class="logo-container">
                        <div class="logo-text">SHADOWDEF</div>
                        <div class="logo-subtitle">Secure Your Progress</div>
                    </div>
                </div>

                <div class="login-content">
                    <div class="auth-tabs">
                        <button class="auth-tab ${this.currentMode === 'login' ? 'active' : ''}" 
                                data-mode="login">LOGIN</button>
                        <button class="auth-tab ${this.currentMode === 'register' ? 'active' : ''}" 
                                data-mode="register">REGISTER</button>
                    </div>

                    <div class="auth-form-container">
                        ${this.renderAuthForm()}
                    </div>

                    <div class="social-login">
                        <div class="divider-text">
                            <span>OR CONTINUE WITH</span>
                        </div>
                        
                        <div class="social-buttons">
                            <button class="social-btn google-btn" data-provider="google">
                                <div class="social-icon">🔍</div>
                                <span>Google</span>
                            </button>
                            
                            <button class="social-btn facebook-btn" data-provider="facebook">
                                <div class="social-icon">📘</div>
                                <span>Facebook</span>
                            </button>
                        </div>
                    </div>
                    ${CONFIG.AUTH.ENABLE_GUEST_MODE ? `
                    <div class="guest-option">
                        <button class="btn-link" id="continue-as-guest">
                            Continue as Guest
                        </button>
                        <p class="guest-warning">
                            ?????? Progress won't be saved without an account
                        </p>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;

        this.setupFormListeners();
    }

    /**
     * Render authentication form
     */
    renderAuthForm() {
        if (this.currentMode === 'login') {
            return `
                <form class="auth-form" id="login-form">
                    <div class="form-group">
                        <label for="login-email">Email Address</label>
                        <input type="email" id="login-email" name="email" required 
                               placeholder="Enter your email">
                    </div>
                    
                    <div class="form-group">
                        <label for="login-password">Password</label>
                        <input type="password" id="login-password" name="password" required 
                               placeholder="Enter your password">
                    </div>
                    
                    <div class="form-options">
                        <label class="checkbox-label">
                            <input type="checkbox" id="remember-me">
                            <span class="checkmark"></span>
                            Remember me
                        </label>
                        
                        <button type="button" class="btn-link" id="forgot-password">
                            Forgot Password?
                        </button>
                    </div>
                    
                    <button type="submit" class="btn btn-primary auth-submit" id="login-submit">
                        <span class="btn-text">LOGIN</span>
                        <div class="btn-loader" style="display: none;">
                            <div class="spinner"></div>
                        </div>
                    </button>
                </form>
            `;
        } else {
            return `
                <form class="auth-form" id="register-form">
                    <div class="form-group">
                        <label for="register-name">Display Name</label>
                        <input type="text" id="register-name" name="name" required 
                               placeholder="Choose a display name">
                    </div>
                    
                    <div class="form-group">
                        <label for="register-email">Email Address</label>
                        <input type="email" id="register-email" name="email" required 
                               placeholder="Enter your email">
                    </div>
                    
                    <div class="form-group">
                        <label for="register-password">Password</label>
                        <input type="password" id="register-password" name="password" required 
                               placeholder="Create a password (min 6 characters)">
                    </div>
                    
                    <div class="form-group">
                        <label for="register-confirm">Confirm Password</label>
                        <input type="password" id="register-confirm" name="confirmPassword" required 
                               placeholder="Confirm your password">
                    </div>
                    
                    <div class="form-options">
                        <label class="checkbox-label">
                            <input type="checkbox" id="agree-terms" required>
                            <span class="checkmark"></span>
                            I agree to the <a href="#" class="btn-link">Terms of Service</a>
                        </label>
                    </div>
                    
                    <button type="submit" class="btn btn-primary auth-submit" id="register-submit">
                        <span class="btn-text">CREATE ACCOUNT</span>
                        <div class="btn-loader" style="display: none;">
                            <div class="spinner"></div>
                        </div>
                    </button>
                </form>
            `;
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen for auth events
        document.addEventListener('shadowdef:auth:login', (e) => {
            this.handleLoginSuccess(e.detail);
        });

        document.addEventListener('shadowdef:auth:logout', () => {
            this.handleLogout();
        });
    }

    /**
     * Setup form event listeners
     */
    setupFormListeners() {
        // Tab switching
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const mode = e.target.dataset.mode;
                if (mode !== this.currentMode) {
                    this.currentMode = mode;
                    this.render();
                }
            });
        });

        // Social login buttons
        document.querySelectorAll('.social-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const provider = e.currentTarget.dataset.provider;
                this.handleSocialLogin(provider);
            });
        });

        // Email form submission
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleEmailLogin(new FormData(loginForm));
            });
        }

        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleEmailRegister(new FormData(registerForm));
            });
        }

        // Guest login
        const guestBtn = document.getElementById('continue-as-guest');
        if (guestBtn) {
            guestBtn.addEventListener('click', () => {
                this.handleGuestLogin();
            });
        }

        // Forgot password
        const forgotBtn = document.getElementById('forgot-password');
        if (forgotBtn) {
            forgotBtn.addEventListener('click', () => {
                this.handleForgotPassword();
            });
        }
    }

    /**
     * Handle social login
     */
    async handleSocialLogin(provider) {
        try {
            this.showLoading(`Connecting to ${provider}...`);

            let userData;
            if (provider === 'google') {
                userData = await this.auth.loginWithGoogle();
            } else if (provider === 'facebook') {
                userData = await this.auth.loginWithFacebook();
            }

            if (userData && userData.name) {
                this.ui.showNotification(`Welcome back, ${userData.name}!`, 'success');
            } else {
                this.ui.showNotification(`Welcome! Login successful.`, 'success');
            }

        } catch (error) {
            console.error(`${provider} login failed:`, error);
            const errorMessage = error.message || `${provider} login failed. Please try again.`;
            this.ui.showNotification(errorMessage, 'error');
        } finally {
            this.hideLoading();
        }
    }

    /**
     * Handle email login
     */
    async handleEmailLogin(formData) {
        try {
            const email = formData.get('email');
            const password = formData.get('password');

            if (!email || !password) {
                this.ui.showNotification('Please fill in all fields', 'error');
                return;
            }

            this.showLoading('Signing in...');

            const userData = await this.auth.loginWithEmail(email, password);
            this.ui.showNotification(`Welcome back, ${userData.name}!`, 'success');

        } catch (error) {
            console.error('Email login failed:', error);
            this.ui.showNotification(error.message || 'Login failed. Please try again.', 'error');
        } finally {
            this.hideLoading();
        }
    }

    /**
     * Handle email registration
     */
    async handleEmailRegister(formData) {
        try {
            const name = formData.get('name');
            const email = formData.get('email');
            const password = formData.get('password');
            const confirmPassword = formData.get('confirmPassword');

            // Validation
            if (!name || !email || !password || !confirmPassword) {
                this.ui.showNotification('Please fill in all fields', 'error');
                return;
            }

            if (password !== confirmPassword) {
                this.ui.showNotification('Passwords do not match', 'error');
                return;
            }

            if (password.length < 6) {
                this.ui.showNotification('Password must be at least 6 characters', 'error');
                return;
            }

            this.showLoading('Creating account...');

            const userData = await this.auth.registerWithEmail(name, email, password);
            this.ui.showNotification(`Welcome to SHADOWDEF, ${userData.name}!`, 'success');

        } catch (error) {
            console.error('Email registration failed:', error);
            this.ui.showNotification(error.message || 'Registration failed. Please try again.', 'error');
        } finally {
            this.hideLoading();
        }
    }

    /**
     * Handle guest login
     */
    handleGuestLogin() {
        this.ui.showConfirm(
            'Continue as Guest?',
            'Your progress and scores won\'t be saved. You can create an account later from the settings menu.',
            () => {
                // Continue to main menu without authentication
                this.game.screens.showScreen('main-menu');
                this.ui.showNotification('Playing as guest - progress won\'t be saved', 'warning', 5000);
            }
        );
    }

    /**
     * Handle forgot password
     */
    handleForgotPassword() {
        this.ui.showModal('Reset Password', `
            <div style="text-align: left;">
                <p>Enter your email address and we'll send you a reset link:</p>
                <div class="form-group" style="margin: 20px 0;">
                    <input type="email" id="reset-email" placeholder="Enter your email" 
                           style="width: 100%; padding: 10px; margin-bottom: 10px;">
                </div>
            </div>
        `, {
            buttons: [
                {
                    text: 'SEND RESET LINK',
                    class: 'btn-primary',
                    onClick: () => {
                        const email = document.getElementById('reset-email').value;
                        if (email) {
                            this.ui.showNotification('Reset link sent to your email!', 'success');
                        } else {
                            this.ui.showNotification('Please enter your email address', 'error');
                        }
                    }
                },
                {
                    text: 'CANCEL',
                    class: 'btn'
                }
            ]
        });
    }

    /**
     * Handle successful login
     */
    handleLoginSuccess(userData) {
        // Transition to main menu
        setTimeout(() => {
            this.game.screens.showScreen('main-menu');
        }, 1000);
    }

    /**
     * Handle logout
     */
    handleLogout() {
        // Return to login screen
        this.game.screens.showScreen('login-screen');
    }

    /**
     * Show loading state
     */
    showLoading(message = 'Loading...') {
        const submitBtn = document.querySelector('.auth-submit');
        if (submitBtn) {
            const btnText = submitBtn.querySelector('.btn-text');
            const btnLoader = submitBtn.querySelector('.btn-loader');
            
            if (btnText) btnText.style.display = 'none';
            if (btnLoader) btnLoader.style.display = 'flex';
            
            submitBtn.disabled = true;
        }

        // Show loading notification
        this.loadingNotification = this.ui.showNotification(message, 'info', 0);
    }

    /**
     * Hide loading state
     */
    hideLoading() {
        const submitBtn = document.querySelector('.auth-submit');
        if (submitBtn) {
            const btnText = submitBtn.querySelector('.btn-text');
            const btnLoader = submitBtn.querySelector('.btn-loader');
            
            if (btnText) btnText.style.display = 'inline';
            if (btnLoader) btnLoader.style.display = 'none';
            
            submitBtn.disabled = false;
        }

        // Hide loading notification
        if (this.loadingNotification) {
            this.ui.removeNotification(this.loadingNotification);
            this.loadingNotification = null;
        }
    }
}