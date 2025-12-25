/**
 * AuthManager - Handles user authentication and profile management
 */

import { CONFIG } from '../data/config.js';

export class AuthManager {
    static instance = null;

    constructor() {
        if (AuthManager.instance) {
            return AuthManager.instance;
        }

        this.currentUser = null;
        this.isAuthenticated = false;
        this.authProviders = {
            google: null,
            facebook: null,
            email: null
        };
        
        // Initialize authentication
        this.initializeAuth();
        
        AuthManager.instance = this;
    }

    /**
     * Get singleton instance
     */
    static getInstance() {
        if (!AuthManager.instance) {
            AuthManager.instance = new AuthManager();
        }
        return AuthManager.instance;
    }

    /**
     * Initialize authentication system
     */
    async initializeAuth() {
        try {
            // Load saved user session
            await this.loadUserSession();
            
            // Initialize social login providers
            await this.initializeSocialProviders();
            
            console.log('🔐 Auth system initialized');
        } catch (error) {
            console.error('Auth initialization failed:', error);
        }
    }

    /**
     * Initialize social login providers
     */
    async initializeSocialProviders() {
        // Google OAuth initialization
        if (window.google) {
            try {
                await this.initializeGoogleAuth();
            } catch (error) {
                console.warn('Google Auth initialization failed:', error);
            }
        }

        // Facebook SDK initialization
        if (window.FB) {
            try {
                await this.initializeFacebookAuth();
            } catch (error) {
                console.warn('Facebook Auth initialization failed:', error);
            }
        }
    }

    /**
     * Initialize Google OAuth
     */
    async initializeGoogleAuth() {
        return new Promise((resolve, reject) => {
            window.gapi.load('auth2', () => {
                window.gapi.auth2.init({
                    client_id: CONFIG.AUTH.GOOGLE_CLIENT_ID || 'your-google-client-id'
                }).then(() => {
                    this.authProviders.google = window.gapi.auth2.getAuthInstance();
                    console.log('✅ Google Auth initialized');
                    resolve();
                }).catch(reject);
            });
        });
    }

    /**
     * Initialize Facebook SDK
     */
    async initializeFacebookAuth() {
        return new Promise((resolve) => {
            window.FB.init({
                appId: CONFIG.AUTH.FACEBOOK_APP_ID || 'your-facebook-app-id',
                cookie: true,
                xfbml: true,
                version: 'v18.0'
            });

            window.FB.getLoginStatus((response) => {
                this.authProviders.facebook = window.FB;
                console.log('✅ Facebook Auth initialized');
                resolve();
            });
        });
    }

    /**
     * Login with Google
     */
    async loginWithGoogle() {
        try {
            if (!this.authProviders.google) {
                throw new Error('Google Auth not initialized');
            }

            const authResult = await this.authProviders.google.signIn();
            const profile = authResult.getBasicProfile();
            
            const userData = {
                id: profile.getId(),
                name: profile.getName(),
                email: profile.getEmail(),
                avatar: profile.getImageUrl(),
                provider: 'google',
                token: authResult.getAuthResponse().id_token
            };

            await this.handleSuccessfulLogin(userData);
            return userData;

        } catch (error) {
            console.error('Google login failed:', error);
            throw error;
        }
    }

    /**
     * Login with Facebook
     */
    async loginWithFacebook() {
        return new Promise((resolve, reject) => {
            if (!this.authProviders.facebook) {
                reject(new Error('Facebook Auth not initialized'));
                return;
            }

            window.FB.login((response) => {
                if (response.authResponse) {
                    window.FB.api('/me', { fields: 'name,email,picture' }, async (profile) => {
                        try {
                            const userData = {
                                id: profile.id,
                                name: profile.name,
                                email: profile.email,
                                avatar: profile.picture.data.url,
                                provider: 'facebook',
                                token: response.authResponse.accessToken
                            };

                            await this.handleSuccessfulLogin(userData);
                            resolve(userData);
                        } catch (error) {
                            reject(error);
                        }
                    });
                } else {
                    reject(new Error('Facebook login cancelled'));
                }
            }, { scope: 'email' });
        });
    }

    /**
     * Login with email and password
     */
    async loginWithEmail(email, password) {
        try {
            // In a real app, this would call your backend API
            const response = await this.mockEmailLogin(email, password);
            
            const userData = {
                id: response.userId,
                name: response.name,
                email: email,
                avatar: response.avatar || this.generateAvatarUrl(email),
                provider: 'email',
                token: response.token
            };

            await this.handleSuccessfulLogin(userData);
            return userData;

        } catch (error) {
            console.error('Email login failed:', error);
            throw error;
        }
    }

    /**
     * Register with email and password
     */
    async registerWithEmail(name, email, password) {
        try {
            // In a real app, this would call your backend API
            const response = await this.mockEmailRegister(name, email, password);
            
            const userData = {
                id: response.userId,
                name: name,
                email: email,
                avatar: this.generateAvatarUrl(email),
                provider: 'email',
                token: response.token,
                isNewUser: true
            };

            await this.handleSuccessfulLogin(userData);
            return userData;

        } catch (error) {
            console.error('Email registration failed:', error);
            throw error;
        }
    }

    /**
     * Handle successful login
     */
    async handleSuccessfulLogin(userData) {
        this.currentUser = {
            ...userData,
            loginTime: Date.now(),
            gameStats: await this.loadUserGameStats(userData.id),
            preferences: await this.loadUserPreferences(userData.id)
        };

        this.isAuthenticated = true;
        
        // Save session
        await this.saveUserSession();
        
        // Sync game data
        await this.syncGameData();
        
        console.log('✅ User logged in:', this.currentUser.name);
        
        // Dispatch login event
        this.dispatchAuthEvent('login', this.currentUser);
    }

    /**
     * Logout user
     */
    async logout() {
        try {
            // Sync final game data before logout
            if (this.isAuthenticated) {
                await this.syncGameData();
            }

            // Logout from social providers
            if (this.currentUser?.provider === 'google' && this.authProviders.google) {
                await this.authProviders.google.signOut();
            }
            
            if (this.currentUser?.provider === 'facebook' && this.authProviders.facebook) {
                window.FB.logout();
            }

            // Clear user data
            this.currentUser = null;
            this.isAuthenticated = false;
            
            // Clear session
            localStorage.removeItem('shadowdef_user_session');
            
            console.log('👋 User logged out');
            
            // Dispatch logout event
            this.dispatchAuthEvent('logout');

        } catch (error) {
            console.error('Logout failed:', error);
        }
    }

    /**
     * Load user session from storage
     */
    async loadUserSession() {
        try {
            const sessionData = localStorage.getItem('shadowdef_user_session');
            if (!sessionData) return;

            const session = JSON.parse(sessionData);
            
            // Check if session is still valid (24 hours)
            if (Date.now() - session.loginTime > 24 * 60 * 60 * 1000) {
                localStorage.removeItem('shadowdef_user_session');
                return;
            }

            // Restore user session
            this.currentUser = session;
            this.isAuthenticated = true;
            
            console.log('🔄 User session restored:', this.currentUser.name);
            
            // Dispatch login event
            this.dispatchAuthEvent('login', this.currentUser);

        } catch (error) {
            console.error('Failed to load user session:', error);
            localStorage.removeItem('shadowdef_user_session');
        }
    }

    /**
     * Save user session to storage
     */
    async saveUserSession() {
        try {
            if (!this.currentUser) return;
            
            const sessionData = {
                ...this.currentUser,
                sessionSaved: Date.now()
            };
            
            localStorage.setItem('shadowdef_user_session', JSON.stringify(sessionData));
            
        } catch (error) {
            console.error('Failed to save user session:', error);
        }
    }

    /**
     * Load user game statistics
     */
    async loadUserGameStats(userId) {
        try {
            // In a real app, this would call your backend API
            const savedStats = localStorage.getItem(`shadowdef_stats_${userId}`);
            
            if (savedStats) {
                return JSON.parse(savedStats);
            }
            
            // Default stats for new user
            return {
                totalScore: 0,
                highScore: 0,
                missionsCompleted: 0,
                totalPlayTime: 0,
                achievements: [],
                level: 1,
                experience: 0,
                credits: 1000, // Starting credits
                lastPlayed: Date.now()
            };
            
        } catch (error) {
            console.error('Failed to load user stats:', error);
            return {};
        }
    }

    /**
     * Load user preferences
     */
    async loadUserPreferences(userId) {
        try {
            const savedPrefs = localStorage.getItem(`shadowdef_prefs_${userId}`);
            
            if (savedPrefs) {
                return JSON.parse(savedPrefs);
            }
            
            // Default preferences
            return {
                musicEnabled: true,
                sfxEnabled: true,
                musicVolume: 0.3,
                sfxVolume: 0.5,
                difficulty: 'normal',
                theme: 'cyber'
            };
            
        } catch (error) {
            console.error('Failed to load user preferences:', error);
            return {};
        }
    }

    /**
     * Sync game data to cloud
     */
    async syncGameData() {
        if (!this.isAuthenticated || !this.currentUser) return;

        try {
            // Save stats locally first
            localStorage.setItem(
                `shadowdef_stats_${this.currentUser.id}`, 
                JSON.stringify(this.currentUser.gameStats)
            );
            
            localStorage.setItem(
                `shadowdef_prefs_${this.currentUser.id}`, 
                JSON.stringify(this.currentUser.preferences)
            );

            // In a real app, sync to backend API
            console.log('💾 Game data synced for user:', this.currentUser.name);
            
        } catch (error) {
            console.error('Failed to sync game data:', error);
        }
    }

    /**
     * Update user game statistics
     */
    async updateGameStats(newStats) {
        if (!this.isAuthenticated || !this.currentUser) return;

        // Merge new stats with existing
        this.currentUser.gameStats = {
            ...this.currentUser.gameStats,
            ...newStats,
            lastPlayed: Date.now()
        };

        // Auto-sync
        await this.syncGameData();
        
        // Dispatch stats update event
        this.dispatchAuthEvent('statsUpdate', this.currentUser.gameStats);
    }

    /**
     * Update user preferences
     */
    async updatePreferences(newPrefs) {
        if (!this.isAuthenticated || !this.currentUser) return;

        this.currentUser.preferences = {
            ...this.currentUser.preferences,
            ...newPrefs
        };

        await this.syncGameData();
        
        // Dispatch preferences update event
        this.dispatchAuthEvent('preferencesUpdate', this.currentUser.preferences);
    }

    /**
     * Generate avatar URL from email
     */
    generateAvatarUrl(email) {
        // Using Gravatar as fallback
        const hash = this.hashCode(email.toLowerCase());
        return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=200`;
    }

    /**
     * Simple hash function for email
     */
    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(16);
    }

    /**
     * Mock email login (replace with real API)
     */
    async mockEmailLogin(email, password) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simple validation
                if (email && password.length >= 6) {
                    resolve({
                        userId: this.hashCode(email),
                        name: email.split('@')[0],
                        token: 'mock_token_' + Date.now(),
                        avatar: null
                    });
                } else {
                    reject(new Error('Invalid email or password'));
                }
            }, 1000);
        });
    }

    /**
     * Mock email registration (replace with real API)
     */
    async mockEmailRegister(name, email, password) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (name && email && password.length >= 6) {
                    resolve({
                        userId: this.hashCode(email),
                        token: 'mock_token_' + Date.now()
                    });
                } else {
                    reject(new Error('Invalid registration data'));
                }
            }, 1000);
        });
    }

    /**
     * Dispatch authentication events
     */
    dispatchAuthEvent(type, data = null) {
        const event = new CustomEvent(`shadowdef:auth:${type}`, {
            detail: data
        });
        document.dispatchEvent(event);
    }

    /**
     * Get current user
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Check if user is authenticated
     */
    isUserAuthenticated() {
        return this.isAuthenticated;
    }

    /**
     * Get user game stats
     */
    getUserStats() {
        return this.currentUser?.gameStats || {};
    }

    /**
     * Get user preferences
     */
    getUserPreferences() {
        return this.currentUser?.preferences || {};
    }
}