/**
 * AuthManager - Handles user authentication and profile management
 * Uses Firebase Authentication and Firestore for cloud storage
 */

import { CONFIG } from '../data/config.js';
import { initializeFirebase, getAuth, getFirestore, isFirebaseInitialized } from './firebase-config.js';

export class AuthManager {
    static instance = null;

    constructor() {
        if (AuthManager.instance) {
            return AuthManager.instance;
        }

        this.currentUser = null;
        this.isAuthenticated = false;
        this.firebaseAuth = null;
        this.firestore = null;
        this.useFirebase = CONFIG.AUTH.USE_FIREBASE !== false;
        
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
            if (this.useFirebase) {
                // Wait for Firebase SDK to load
                await this.waitForFirebase();
                
                // Initialize Firebase
                if (initializeFirebase()) {
                    this.firebaseAuth = getAuth();
                    this.firestore = getFirestore();
                    
                    // Set up auth state observer
                    this.firebaseAuth.onAuthStateChanged(async (user) => {
                        if (user) {
                            await this.handleFirebaseAuthState(user);
                        } else {
                            this.currentUser = null;
                            this.isAuthenticated = false;
                        }
                    });
                    
                    console.log('✅ Firebase Auth initialized');
                } else {
                    console.warn('⚠️ Firebase initialization failed, falling back to localStorage');
                    this.useFirebase = false;
                }
            }
            
            // Load saved user session (fallback to localStorage if Firebase not available)
            if (!this.useFirebase) {
                await this.loadUserSession();
            }
            
            console.log('🔐 Auth system initialized');
        } catch (error) {
            console.error('Auth initialization failed:', error);
            this.useFirebase = false;
        }
    }

    /**
     * Wait for Firebase SDK to be loaded
     */
    async waitForFirebase() {
        return new Promise((resolve) => {
            if (window.firebase) {
                resolve();
                return;
            }
            
            let attempts = 0;
            const checkInterval = setInterval(() => {
                attempts++;
                if (window.firebase || attempts > 50) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);
        });
    }

    /**
     * Handle Firebase authentication state change
     */
    async handleFirebaseAuthState(firebaseUser) {
        try {
            const userData = {
                id: firebaseUser.uid,
                name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
                email: firebaseUser.email,
                avatar: firebaseUser.photoURL || this.generateAvatarUrl(firebaseUser.email || ''),
                provider: firebaseUser.providerData[0]?.providerId?.replace('.com', '') || 'email',
                token: await firebaseUser.getIdToken(),
                loginTime: Date.now()
            };

            // Load user data from Firestore
            userData.gameStats = await this.loadUserGameStats(userData.id);
            userData.preferences = await this.loadUserPreferences(userData.id);

            this.currentUser = userData;
            this.isAuthenticated = true;

            console.log('✅ User authenticated:', userData.name);
            this.dispatchAuthEvent('login', this.currentUser);
        } catch (error) {
            console.error('Failed to handle auth state:', error);
        }
    }

    /**
     * Login with Google (using Firebase)
     */
    async loginWithGoogle() {
        try {
            if (!this.useFirebase || !this.firebaseAuth) {
                throw new Error('Firebase Auth not initialized');
            }

            const provider = new window.firebase.auth.GoogleAuthProvider();
            provider.addScope('profile');
            provider.addScope('email');
            
            const result = await this.firebaseAuth.signInWithPopup(provider);
            const firebaseUser = result.user;
            
            // Process login immediately
            await this.handleFirebaseAuthState(firebaseUser);
            
            // Wait a bit to ensure currentUser is set
            let attempts = 0;
            while (!this.currentUser && attempts < 10) {
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }
            
            if (!this.currentUser) {
                throw new Error('Failed to process user data');
            }
            
            return this.currentUser;

        } catch (error) {
            console.error('Google login failed:', error);
            throw this.handleFirebaseError(error);
        }
    }

    /**
     * Login with Facebook (using Firebase)
     */
    async loginWithFacebook() {
        try {
            if (!this.useFirebase || !this.firebaseAuth) {
                throw new Error('Firebase Auth not initialized');
            }

            const provider = new window.firebase.auth.FacebookAuthProvider();
            provider.addScope('email');
            
            const result = await this.firebaseAuth.signInWithPopup(provider);
            const firebaseUser = result.user;
            
            // Process login immediately
            await this.handleFirebaseAuthState(firebaseUser);
            
            // Wait a bit to ensure currentUser is set
            let attempts = 0;
            while (!this.currentUser && attempts < 10) {
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }
            
            if (!this.currentUser) {
                throw new Error('Failed to process user data');
            }
            
            return this.currentUser;

        } catch (error) {
            console.error('Facebook login failed:', error);
            throw this.handleFirebaseError(error);
        }
    }

    /**
     * Login with email and password (using Firebase)
     */
    async loginWithEmail(email, password) {
        try {
            if (this.useFirebase && this.firebaseAuth) {
                const result = await this.firebaseAuth.signInWithEmailAndPassword(email, password);
                const firebaseUser = result.user;
                
                // Process login immediately
                await this.handleFirebaseAuthState(firebaseUser);
                
                // Wait a bit to ensure currentUser is set
                let attempts = 0;
                while (!this.currentUser && attempts < 10) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    attempts++;
                }
                
                if (!this.currentUser) {
                    throw new Error('Failed to process user data');
                }
                
                return this.currentUser;
            } else {
                // Fallback to mock authentication
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
            }
        } catch (error) {
            console.error('Email login failed:', error);
            throw this.handleFirebaseError(error);
        }
    }

    /**
     * Register with email and password (using Firebase)
     */
    async registerWithEmail(name, email, password) {
        try {
            if (this.useFirebase && this.firebaseAuth) {
                // Create user account
                const result = await this.firebaseAuth.createUserWithEmailAndPassword(email, password);
                
                // Update profile with display name
                await result.user.updateProfile({
                    displayName: name,
                    photoURL: this.generateAvatarUrl(email)
                });
                
                // Create user document in Firestore with initial stats
                await this.createUserDocument(result.user.uid, {
                    name: name,
                    email: email,
                    avatar: this.generateAvatarUrl(email)
                });
                
                // Process login immediately
                await this.handleFirebaseAuthState(result.user);
                
                // Wait a bit to ensure currentUser is set
                let attempts = 0;
                while (!this.currentUser && attempts < 10) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    attempts++;
                }
                
                if (!this.currentUser) {
                    throw new Error('Failed to process user data');
                }
                
                return this.currentUser;
            } else {
                // Fallback to mock registration
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
            }
        } catch (error) {
            console.error('Email registration failed:', error);
            throw this.handleFirebaseError(error);
        }
    }

    /**
     * Create user document in Firestore
     */
    async createUserDocument(userId, userData) {
        if (!this.useFirebase || !this.firestore) return;

        try {
            const userRef = this.firestore.collection('users').doc(userId);
            await userRef.set({
                ...userData,
                createdAt: window.firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: window.firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Initialize stats and preferences
            await userRef.collection('data').doc('stats').set(this.getDefaultStats());
            await userRef.collection('data').doc('preferences').set(this.getDefaultPreferences());
        } catch (error) {
            console.error('Failed to create user document:', error);
        }
    }

    /**
     * Handle Firebase errors and convert to user-friendly messages
     */
    handleFirebaseError(error) {
        const errorMessages = {
            'auth/user-not-found': 'No account found with this email address.',
            'auth/wrong-password': 'Incorrect password.',
            'auth/email-already-in-use': 'An account with this email already exists.',
            'auth/weak-password': 'Password should be at least 6 characters.',
            'auth/invalid-email': 'Invalid email address.',
            'auth/user-disabled': 'This account has been disabled.',
            'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
            'auth/popup-closed-by-user': 'Sign-in popup was closed.',
            'auth/cancelled-popup-request': 'Only one popup request is allowed at a time.',
            'auth/unauthorized-domain': 'This domain is not authorized. Please add this domain to Firebase Console → Authentication → Settings → Authorized domains. For local development, make sure "localhost" is authorized.'
        };
        
        const message = errorMessages[error.code] || error.message || 'An error occurred during authentication.';
        
        // Log more details for unauthorized-domain error
        if (error.code === 'auth/unauthorized-domain') {
            console.error('❌ Domain authorization error. Current domain:', window.location.hostname);
            console.error('💡 Solution: Add your domain in Firebase Console → Authentication → Settings → Authorized domains');
        }
        
        return new Error(message);
    }

    /**
     * Handle successful login (for localStorage fallback only)
     */
    async handleSuccessfulLogin(userData) {
        this.currentUser = {
            ...userData,
            loginTime: Date.now(),
            gameStats: await this.loadUserGameStats(userData.id),
            preferences: await this.loadUserPreferences(userData.id)
        };

        this.isAuthenticated = true;
        
        // Save session to localStorage (fallback only)
        if (!this.useFirebase) {
            const sessionData = {
                ...this.currentUser,
                sessionSaved: Date.now()
            };
            localStorage.setItem('shadowdef_user_session', JSON.stringify(sessionData));
        }
        
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
            // Sync final game data before logout (don't let errors block logout)
            if (this.isAuthenticated) {
                try {
                    await this.syncGameData();
                } catch (syncError) {
                    // Log but don't block logout if sync fails
                    console.warn('Game data sync failed during logout, continuing with logout:', syncError.code || syncError.message);
                }
            }

            // Sign out from Firebase
            if (this.useFirebase && this.firebaseAuth) {
                try {
                    await this.firebaseAuth.signOut();
                } catch (signOutError) {
                    console.warn('Firebase sign out error (continuing with logout):', signOutError);
                }
            }

            // Clear user data
            this.currentUser = null;
            this.isAuthenticated = false;
            
            // Clear session (localStorage fallback)
            localStorage.removeItem('shadowdef_user_session');
            
            console.log('👋 User logged out');
            
            // Dispatch logout event
            this.dispatchAuthEvent('logout');

        } catch (error) {
            // Even if logout fails, clear local state
            console.error('Logout error (clearing local state anyway):', error);
            this.currentUser = null;
            this.isAuthenticated = false;
            localStorage.removeItem('shadowdef_user_session');
            this.dispatchAuthEvent('logout');
        }
    }

    /**
     * Load user session from storage (localStorage fallback only)
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
     * Load user game statistics (from Firestore or localStorage)
     */
    async loadUserGameStats(userId) {
        try {
            if (this.useFirebase && this.firestore) {
                try {
                    const statsDoc = await this.firestore
                        .collection('users')
                        .doc(userId)
                        .collection('data')
                        .doc('stats')
                        .get();
                    
                    if (statsDoc.exists) {
                        return statsDoc.data();
                    }
                } catch (firestoreError) {
                    // If permission denied, create default stats and try to initialize user document
                    console.warn('Firestore access denied for stats, using defaults:', firestoreError.code);
                    if (firestoreError.code === 'permission-denied') {
                        // Try to create user document with default stats
                        try {
                            await this.createUserDocument(userId, {
                                name: this.currentUser?.name || 'User',
                                email: this.currentUser?.email || '',
                                avatar: this.currentUser?.avatar || ''
                            });
                        } catch (createError) {
                            console.warn('Could not create user document:', createError);
                        }
                    }
                }
            } else {
                // Fallback to localStorage
                const savedStats = localStorage.getItem(`shadowdef_stats_${userId}`);
                if (savedStats) {
                    return JSON.parse(savedStats);
                }
            }
            
            // Return default stats for new user
            return this.getDefaultStats();
            
        } catch (error) {
            console.error('Failed to load user stats:', error);
            return this.getDefaultStats();
        }
    }

    /**
     * Load user preferences (from Firestore or localStorage)
     */
    async loadUserPreferences(userId) {
        try {
            if (this.useFirebase && this.firestore) {
                try {
                    const prefsDoc = await this.firestore
                        .collection('users')
                        .doc(userId)
                        .collection('data')
                        .doc('preferences')
                        .get();
                    
                    if (prefsDoc.exists) {
                        return prefsDoc.data();
                    }
                } catch (firestoreError) {
                    // If permission denied, use defaults
                    console.warn('Firestore access denied for preferences, using defaults:', firestoreError.code);
                }
            } else {
                // Fallback to localStorage
                const savedPrefs = localStorage.getItem(`shadowdef_prefs_${userId}`);
                if (savedPrefs) {
                    return JSON.parse(savedPrefs);
                }
            }
            
            // Return default preferences
            return this.getDefaultPreferences();
            
        } catch (error) {
            console.error('Failed to load user preferences:', error);
            return this.getDefaultPreferences();
        }
    }

    /**
     * Get default game statistics
     */
    getDefaultStats() {
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
    }

    /**
     * Get default user preferences
     */
    getDefaultPreferences() {
        return {
            musicEnabled: true,
            sfxEnabled: true,
            musicVolume: 0.3,
            sfxVolume: 0.5,
            difficulty: 'normal',
            theme: 'cyber'
        };
    }

    /**
     * Sync game data to Firestore (or localStorage fallback)
     */
    async syncGameData() {
        if (!this.isAuthenticated || !this.currentUser) return;

        try {
            if (this.useFirebase && this.firestore && this.currentUser.id) {
                const userId = this.currentUser.id;
                const userRef = this.firestore.collection('users').doc(userId);
                
                try {
                    // Update stats in Firestore
                    await userRef.collection('data').doc('stats').set({
                        ...this.currentUser.gameStats,
                        updatedAt: window.firebase.firestore.FieldValue.serverTimestamp()
                    }, { merge: true });
                    
                    // Update preferences in Firestore
                    await userRef.collection('data').doc('preferences').set({
                        ...this.currentUser.preferences,
                        updatedAt: window.firebase.firestore.FieldValue.serverTimestamp()
                    }, { merge: true });
                    
                    // Update user document lastPlayed timestamp (only if user document exists)
                    try {
                        await userRef.update({
                            updatedAt: window.firebase.firestore.FieldValue.serverTimestamp()
                        });
                    } catch (updateError) {
                        // User document might not exist, that's okay
                        if (updateError.code !== 'not-found') {
                            console.warn('Could not update user document timestamp:', updateError.code);
                        }
                    }
                    
                    console.log('💾 Game data synced to Firestore for user:', this.currentUser.name);
                } catch (firestoreError) {
                    // If permission denied, fallback to localStorage
                    if (firestoreError.code === 'permission-denied') {
                        console.warn('⚠️ Firestore permission denied, falling back to localStorage');
                        this.syncToLocalStorage();
                    } else {
                        // For other errors, log but don't fail completely
                        console.warn('⚠️ Firestore sync failed, falling back to localStorage:', firestoreError.code);
                        this.syncToLocalStorage();
                    }
                }
            } else {
                // Fallback to localStorage
                this.syncToLocalStorage();
            }
            
        } catch (error) {
            // Even if everything fails, try localStorage as last resort
            console.error('Failed to sync game data, attempting localStorage fallback:', error);
            try {
                this.syncToLocalStorage();
            } catch (localError) {
                console.error('Even localStorage sync failed:', localError);
            }
        }
    }

    /**
     * Sync data to localStorage (fallback method)
     */
    syncToLocalStorage() {
        if (!this.currentUser || !this.currentUser.id) return;
        
        try {
            localStorage.setItem(
                `shadowdef_stats_${this.currentUser.id}`, 
                JSON.stringify(this.currentUser.gameStats || this.getDefaultStats())
            );
            
            localStorage.setItem(
                `shadowdef_prefs_${this.currentUser.id}`, 
                JSON.stringify(this.currentUser.preferences || this.getDefaultPreferences())
            );

            console.log('💾 Game data saved to localStorage for user:', this.currentUser.name || this.currentUser.id);
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
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