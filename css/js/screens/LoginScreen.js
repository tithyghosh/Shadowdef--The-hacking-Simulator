/**
 * LoginScreen - Handles user authentication interface
 */

import { AuthManager } from '../core/AuthManager.js';
import { AudioManager } from '../core/AudioManager.js';
import { UIManager } from '../ui/UIManager.js';
import { CONFIG } from '../data/config.js';

export class LoginScreen {
    constructor(game) {
        this.game = game;
        this.auth = AuthManager.getInstance();
        this.audio = AudioManager.getInstance();
        this.ui = new UIManager();
        this.currentMode = 'login'; // 'login' or 'register'
        this.systemHudTimers = [];
        this.backgroundAnimationFrame = null;
        this.canvasResizeHandler = null;

        this.setupEventListeners();
    }

    /**
     * Render login screen
     */
    render() {
        const loginContainer = document.getElementById('login-screen');
        if (!loginContainer) return;

        this.stopSystemHudAnimation();
        this.stopCanvasAnimation();

        loginContainer.innerHTML = `
            <canvas id="login-fx-canvas" class="login-fx-canvas" aria-hidden="true"></canvas>
            <div class="scanlines" aria-hidden="true"></div>
            <div class="vignette" aria-hidden="true"></div>
            <div class="hud-bar-top" aria-hidden="true"></div>
            <div class="hud-bar-bot" aria-hidden="true"></div>

            <div class="hud-tl" aria-hidden="true">
                SHADOWDEF OS v4.7<br>
                NET: <span class="hud-green">ENCRYPTED</span><br>
                <span class="blink">▋</span> ACTIVE
            </div>
            <div class="hud-tr" aria-hidden="true">
                NODES: 2,847<br>
                FIREWALL: <span class="hud-green">ON</span><br>
                UTC+00:00
            </div>
            <div class="hud-bl" aria-hidden="true">
                ENC: AES-256<br>
                AUTH: SHADOW-AUTH
            </div>
            <div class="hud-br" aria-hidden="true">
                INTRUSION: <span class="hud-green">NONE</span><br>
                PROXY: <span class="blink" style="color: rgba(0,212,255,0.6)">ACTIVE</span>
            </div>

            <div class="sys-monitor" aria-hidden="true">
                <div class="sm-title">SYSTEM MONITOR</div>
                <div class="sm-val">SYSTEM ONLINE</div>
                <div class="sm-val">IP TRACE: ACTIVE</div>
                <div class="sm-val">ENCRYPTION: AES-256</div>
            </div>

            <div class="page">
                <div class="logo-section">
                    <div class="logo-pre">▸ SECURE ACCESS PORTAL ◂</div>
                    <div class="logo-text" data-text="SHADOWDEF">
                        <span class="logo-text-inner">SHADOWDEF</span>
                    </div>
                    <div class="logo-divider">
                        <div class="logo-divider-line"></div>
                        <div class="logo-divider-diamond"></div>
                        <div class="logo-divider-line rev"></div>
                    </div>
                </div>

                ${this.renderAuthCard()}
            </div>
        `;

        this.setupFormListeners();
        this.startSystemHudAnimation();
        this.startCanvasAnimation();
    }

    renderAuthCard() {
        const isLogin = this.currentMode === 'login';
        const formId = isLogin ? 'login-form' : 'register-form';
        const buttonText = isLogin ? 'LOGIN' : 'CREATE ACCOUNT';

        return `
            <div class="card">
                <div class="card-frame"></div>
                <div class="card-inner">
                    <div class="card-body">
                        <div class="card-header">
                            <div class="header-icon" aria-hidden="true">
                                <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="1"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                            </div>
                            <div class="header-text">
                                <div class="header-title">${isLogin ? 'Authentication' : 'Registration'}</div>
                                <div class="header-sub">IDENTITY VERIFICATION</div>
                            </div>
                            <div class="header-status">
                                <div class="status-dot"></div>
                                ONLINE
                            </div>
                        </div>

                        <form class="auth-form" id="${formId}">
                            ${this.renderAuthFields()}

                            ${isLogin ? `
                            <div class="options-row">
                                <label class="check-wrap">
                                    <input type="checkbox" id="remember-me" />
                                    <div class="check-box"></div>
                                    <span class="check-label">Remember me</span>
                                </label>
                                <button type="button" class="forgot" id="forgot-password">Forgot Password?</button>
                            </div>
                            ` : ''}

                            <div class="btn-login-wrap">
                                <button type="submit" class="btn-login auth-submit" id="${isLogin ? 'login-submit' : 'register-submit'}">
                                    <span class="btn-text">${buttonText}</span>
                                    <span class="btn-loader" style="display: none;"><span class="spinner"></span></span>
                                </button>
                            </div>
                        </form>

                        ${isLogin ? `
                        <div class="divider">
                            <span class="divider-text">OR CONTINUE WITH</span>
                        </div>

                        <button class="btn-google social-btn" data-provider="google" type="button">
                            <div class="g-dot" aria-hidden="true"></div>
                            GOOGLE
                        </button>
                        ` : ''}

                        <div class="card-foot">
                            ${this.renderSwitchText()}
                            ${this.renderGuestSection()}
                        </div>

                        <div class="threat-stripe" aria-hidden="true">
                            <span class="threat-label">THREAT LVL</span>
                            <div class="threat-pips">
                                <div class="pip g"></div>
                                <div class="pip g"></div>
                                <div class="pip y"></div>
                                <div class="pip"></div>
                                <div class="pip"></div>
                            </div>
                            <span class="threat-status">LOW - SECURE</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderAuthFields() {
        if (this.currentMode === 'login') {
            return `
                <div class="field">
                    <div class="field-label">Email Address</div>
                    <div class="field-wrap">
                        <input class="field-input" type="email" id="login-email" name="email" required placeholder="Enter your email" autocomplete="off"/>
                        <div class="field-scan"></div>
                    </div>
                </div>

                <div class="field">
                    <div class="field-label">Password</div>
                    <div class="field-wrap">
                        <input class="field-input" type="password" id="login-password" name="password" required placeholder="Enter your password" autocomplete="off"/>
                        <div class="field-scan"></div>
                    </div>
                </div>
            `;
        }

        return `
            <div class="field">
                <div class="field-label">Display Name</div>
                <div class="field-wrap">
                    <input class="field-input" type="text" id="register-name" name="name" required placeholder="Choose a display name" autocomplete="off"/>
                    <div class="field-scan"></div>
                </div>
            </div>

            <div class="field">
                <div class="field-label">Email Address</div>
                <div class="field-wrap">
                    <input class="field-input" type="email" id="register-email" name="email" required placeholder="Enter your email" autocomplete="off"/>
                    <div class="field-scan"></div>
                </div>
            </div>

            <div class="field">
                <div class="field-label">Password</div>
                <div class="field-wrap">
                    <input class="field-input" type="password" id="register-password" name="password" required placeholder="Create a password (min 6 characters)" autocomplete="off"/>
                    <div class="field-scan"></div>
                </div>
            </div>

            <div class="field">
                <div class="field-label">Confirm Password</div>
                <div class="field-wrap">
                    <input class="field-input" type="password" id="register-confirm" name="confirmPassword" required placeholder="Confirm your password" autocomplete="off"/>
                    <div class="field-scan"></div>
                </div>
            </div>
        `;
    }

    /**
     * Render switch text between login/register
     */
    renderSwitchText() {
        if (this.currentMode === 'login') {
            return `
                <div class="foot-register">
                    Don't you have an account?
                    <button type="button" class="auth-switch" data-mode="register">Please register here.</button>
                </div>
            `;
        }

        return `
            <div class="foot-register">
                Already have an account?
                <button type="button" class="auth-switch" data-mode="login">Please login now.</button>
            </div>
        `;
    }

    renderGuestSection() {
        if (!CONFIG.AUTH.ENABLE_GUEST_MODE || this.currentMode !== 'login') {
            return '';
        }

        return `
            <button type="button" class="guest-link" id="continue-as-guest">Continue as Guest</button>
            <div class="guest-warn">Your progress won't be saved without<br/>an account.</div>
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
                    this.audio.playGlitch();
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
            let userData;
            if (provider === 'google') {
                userData = await this.auth.loginWithGoogle();
            }

            if (userData && userData.name) {
                this.ui.showAccessToast(userData.name);
            } else {
                this.ui.showNotification('Welcome! Login successful.', 'success');
            }

        } catch (error) {
            console.error(`${provider} login failed:`, error);
            const errorMessage = error.message || `${provider} login failed. Please try again.`;
            this.ui.showNotification(errorMessage, 'error');
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
            this.ui.showAccessToast(userData.name);

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
            this.ui.showAccessToast(userData.name, {
                tag: 'ACCOUNT CREATED',
                prefix: 'Welcome to SHADOWDEF,'
            });

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
                this.stopSystemHudAnimation();
                this.stopCanvasAnimation();
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
        this.stopSystemHudAnimation();
        this.stopCanvasAnimation();
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

    startCanvasAnimation() {
        const canvas = document.getElementById('login-fx-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        resize();
        this.canvasResizeHandler = resize;
        window.addEventListener('resize', this.canvasResizeHandler);

        const binaries = Array.from({ length: 45 }, () => ({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            val: Math.floor(Math.random() * 1048576).toString(2).slice(0, 6),
            op: Math.random() * 0.1 + 0.03,
            spd: Math.random() * 0.12 + 0.04,
            size: Math.floor(Math.random() * 3) + 9
        }));

        const pts = Array.from({ length: 75 }, () => ({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            vx: (Math.random() - 0.5) * 0.28,
            vy: (Math.random() - 0.5) * 0.28,
            r: Math.random() * 1.5 + 0.4,
            op: Math.random() * 0.3 + 0.08
        }));

        const draw = () => {
            this.backgroundAnimationFrame = requestAnimationFrame(draw);
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const gradient = ctx.createRadialGradient(
                canvas.width * 0.5,
                canvas.height * 0.45,
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
                ctx.font = `${b.size}px Share Tech Mono`;
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
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < 100) {
                        ctx.beginPath();
                        ctx.moveTo(pts[i].x, pts[i].y);
                        ctx.lineTo(pts[j].x, pts[j].y);
                        ctx.strokeStyle = `rgba(0,180,220,${0.07 * (1 - distance / 100)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
        };

        draw();
    }

    stopCanvasAnimation() {
        if (this.backgroundAnimationFrame) {
            cancelAnimationFrame(this.backgroundAnimationFrame);
            this.backgroundAnimationFrame = null;
        }

        if (this.canvasResizeHandler) {
            window.removeEventListener('resize', this.canvasResizeHandler);
            this.canvasResizeHandler = null;
        }
    }

    startSystemHudAnimation() {
        const lines = Array.from(document.querySelectorAll('.system-hud-line'));
        if (!lines.length) return;

        lines.forEach((line) => {
            line.textContent = '';
        });

        const textLines = lines.map((line) => line.dataset.text || '');
        const addHudTimer = (callback, delay) => {
            let timerId = null;
            timerId = setTimeout(() => {
                this.systemHudTimers = this.systemHudTimers.filter((timer) => timer !== timerId);
                callback();
            }, delay);
            this.systemHudTimers.push(timerId);
        };

        const typeLine = (lineIndex = 0, charIndex = 0) => {
            if (lineIndex >= lines.length) {
                addHudTimer(() => this.startSystemHudAnimation(), 1400);
                return;
            }

            const line = lines[lineIndex];
            const text = textLines[lineIndex];
            line.textContent = text.slice(0, charIndex + 1);

            if (charIndex + 1 >= text.length) {
                addHudTimer(() => typeLine(lineIndex + 1, 0), 180);
                return;
            }

            addHudTimer(() => typeLine(lineIndex, charIndex + 1), 38);
        };

        typeLine();
    }

    stopSystemHudAnimation() {
        this.systemHudTimers.forEach((timer) => {
            clearInterval(timer);
            clearTimeout(timer);
        });
        this.systemHudTimers = [];
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
            if (btnLoader) btnLoader.style.display = 'inline-flex';

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
