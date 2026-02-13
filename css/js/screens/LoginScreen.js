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
                <button class="back-btn" data-action="back">← BACK</button>
                <div class="login-header">
                    <div class="logo-container">
                        <div class="logo-text">SHADOWDEF</div>
                    </div>
                </div>

                <div class="login-content">
                    <div class="auth-form-container">
                        ${this.renderAuthForm()}
                    </div>

                    <div class="social-login">
                        <div class="divider-text">
                            <span>OR CONTINUE WITH</span>
                        </div>
                        
                        <div class="social-buttons">
                            <button class="social-btn google-btn" data-provider="google">
                                <div class="social-icon">
                                    <svg class="google-icon" width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
                                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.45 1.45 8.53 3.38l5.82-5.82C34.64 3.44 29.7 1.5 24 1.5 14.82 1.5 7.01 6.74 3.28 14.28l6.77 5.26C12.04 13.2 17.6 9.5 24 9.5z"/>
                                        <path fill="#4285F4" d="M46.5 24.5c0-1.57-.14-3.08-.4-4.54H24v9.05h12.75c-.55 2.96-2.26 5.46-4.81 7.14l7.39 5.74C43.93 38.27 46.5 31.87 46.5 24.5z"/>
                                        <path fill="#FBBC05" d="M10.05 28.54a14.8 14.8 0 0 1 0-9.08l-6.77-5.26a23.97 23.97 0 0 0 0 19.6l6.77-5.26z"/>
                                        <path fill="#34A853" d="M24 46.5c6.2 0 11.4-2.05 15.2-5.56l-7.39-5.74c-2.05 1.38-4.68 2.2-7.81 2.2-6.4 0-11.96-3.7-13.95-9.04l-6.77 5.26C7.01 41.26 14.82 46.5 24 46.5z"/>
                                        <path fill="none" d="M0 0h48v48H0z"/>
                                    </svg>
                                </div>
                                <span>Google</span>
                            </button>
                        </div>
                    </div>
                    ${this.renderSwitchText()}
                    ${CONFIG.AUTH.ENABLE_GUEST_MODE ? `
                    <div class="guest-option">
                        <button class="btn-link" id="continue-as-guest">
                            Continue as Guest
                        </button>
                        <p class="guest-warning">
                            Your progress won't be saved without an account.
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
                    <h2 class="auth-heading">Login in your account</h2>
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
                    <h2 class="auth-heading">Create Your Account</h2>
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
     * Render switch text between login/register
     */
    renderSwitchText() {
        if (this.currentMode === 'login') {
            return `
                <p class="auth-switch-text">
                    Don't you have an account?
                    <button type="button" class="btn-link auth-switch" data-mode="register">Please register here.</button>
                </p>
            `;
        }

        return `
            <p class="auth-switch-text">
                Already have an account?
                <button type="button" class="btn-link auth-switch" data-mode="login">Please login now.</button>
            </p>
        `;
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
        // Switch between login/register
        document.querySelectorAll('.auth-switch').forEach(button => {
            button.addEventListener('click', (e) => {
                const mode = e.currentTarget.dataset.mode;
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
            const rememberMe = !!document.getElementById('remember-me')?.checked;

            if (!email || !password) {
                this.ui.showNotification('Please fill in all fields', 'error');
                return;
            }

            this.showLoading('Signing in...');

            const userData = await this.auth.loginWithEmail(email, password, rememberMe);
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
                    onClick: async () => {
                        const email = document.getElementById('reset-email').value;
                        if (!email) {
                            this.ui.showNotification('Please enter your email address', 'error');
                            return;
                        }

                        try {
                            this.showLoading('Sending reset link...');
                            await this.auth.resetPassword(email);
                            this.ui.showNotification('Reset link sent to your email!', 'success');
                        } catch (error) {
                            this.ui.showNotification(error.message || 'Failed to send reset link.', 'error');
                        } finally {
                            this.hideLoading();
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
            if (typeof window.updateMainMenuStatus === 'function') {
                window.updateMainMenuStatus();
                setTimeout(() => window.updateMainMenuStatus(), 150);
                setTimeout(() => window.updateMainMenuStatus(), 500);
            }
        }, 1000);
    }

    /**
     * Handle logout
     */
    handleLogout() {
        // Return to login screen
        this.game.screens.showScreen('login-screen');
        this.render();
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
