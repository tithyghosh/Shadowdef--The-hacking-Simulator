/**
 * Firebase Configuration
 * Initialize Firebase services (Auth and Firestore)
 */

import { CONFIG } from '../data/config.js';

// Firebase configuration object
// Replace these values with your Firebase project credentials
export const firebaseConfig = {
    apiKey: CONFIG.AUTH.FIREBASE_API_KEY || "AIzaSyBRE1PmnP-f58u66E8W0fpJXRYcdejJ_h8",
    authDomain: CONFIG.AUTH.FIREBASE_AUTH_DOMAIN || "shadowdef-6a79f.firebaseapp.com",
    projectId: CONFIG.AUTH.FIREBASE_PROJECT_ID || "shadowdef-6a79f",
    storageBucket: CONFIG.AUTH.FIREBASE_STORAGE_BUCKET || "shadowdef-6a79f.firebasestorage.app",
    messagingSenderId: CONFIG.AUTH.FIREBASE_MESSAGING_SENDER_ID || "908068416658",
    appId: CONFIG.AUTH.FIREBASE_APP_ID || "1:908068416658:web:5e744dd793d70937820a4b"
};

// Initialize Firebase App
let app = null;
let auth = null;
let db = null;

/**
 * Initialize Firebase (called after Firebase SDK is loaded)
 */
export function initializeFirebase() {
    if (!window.firebase) {
        console.error('Firebase SDK not loaded. Make sure Firebase scripts are included in HTML.');
        return false;
    }

    try {
        // Initialize Firebase App
        app = window.firebase.initializeApp(firebaseConfig);
        
        // Initialize Firebase Auth
        auth = window.firebase.auth();
        
        // Initialize Firestore
        db = window.firebase.firestore();
        
        console.log('✅ Firebase initialized successfully');
        return true;
    } catch (error) {
        console.error('❌ Firebase initialization failed:', error);
        return false;
    }
}

/**
 * Get Firebase Auth instance
 */
export function getAuth() {
    if (!auth) {
        console.error('Firebase not initialized. Call initializeFirebase() first.');
    }
    return auth;
}

/**
 * Get Firestore instance
 */
export function getFirestore() {
    if (!db) {
        console.error('Firestore not initialized. Call initializeFirebase() first.');
    }
    return db;
}

/**
 * Get Firebase App instance
 */
export function getApp() {
    return app;
}

/**
 * Check if Firebase is initialized
 */
export function isFirebaseInitialized() {
    return app !== null && auth !== null && db !== null;
}

