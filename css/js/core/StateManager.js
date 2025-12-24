/**
 * StateManager - Handles game state persistence
 * Uses localStorage for save/load functionality
 */

import { CONFIG } from '../data/config.js';

export class StateManager {
    constructor() {
        this.storagePrefix = 'shadowdef_';
        this.autoSaveInterval = null;
        this.lastSaveTime = Date.now();
        
        // Initialize auto-save if enabled
        if (CONFIG.TIMING.AUTO_SAVE_INTERVAL > 0) {
            this.startAutoSave();
        }
    }

    /**
     * Save data to localStorage
     * @param {string} key - Storage key
     * @param {any} data - Data to save
     * @returns {boolean} Success status
     */
    saveData(key, data) {
        try {
            const fullKey = this.storagePrefix + key;
            const serialized = JSON.stringify({
                data: data,
                timestamp: Date.now(),
                version: CONFIG.VERSION
            });
            
            localStorage.setItem(fullKey, serialized);
            this.lastSaveTime = Date.now();
            
            if (CONFIG.DEBUG.ENABLED) {
                console.log(`💾 Saved: ${key}`, data);
            }
            
            return true;
        } catch (error) {
            console.error('Failed to save data:', error);
            return false;
        }
    }

    /**
     * Load data from localStorage
     * @param {string} key - Storage key
     * @returns {any} Loaded data or null
     */
    loadData(key) {
        try {
            const fullKey = this.storagePrefix + key;
            const serialized = localStorage.getItem(fullKey);
            
            if (!serialized) {
                return null;
            }
            
            const parsed = JSON.parse(serialized);
            
            // Version check
            if (parsed.version !== CONFIG.VERSION) {
                console.warn(`Version mismatch for ${key}: ${parsed.version} vs ${CONFIG.VERSION}`);
                // Could implement migration here
            }
            
            if (CONFIG.DEBUG.ENABLED) {
                console.log(`📂 Loaded: ${key}`, parsed.data);
            }
            
            return parsed.data;
        } catch (error) {
            console.error('Failed to load data:', error);
            return null;
        }
    }

    /**
     * Delete saved data
     * @param {string} key - Storage key
     * @returns {boolean} Success status
     */
    deleteData(key) {
        try {
            const fullKey = this.storagePrefix + key;
            localStorage.removeItem(fullKey);
            
            if (CONFIG.DEBUG.ENABLED) {
                console.log(`🗑️ Deleted: ${key}`);
            }
            
            return true;
        } catch (error) {
            console.error('Failed to delete data:', error);
            return false;
        }
    }

    /**
     * Check if save data exists
     * @param {string} key - Storage key
     * @returns {boolean} Exists status
     */
    hasData(key) {
        const fullKey = this.storagePrefix + key;
        return localStorage.getItem(fullKey) !== null;
    }

    /**
     * Get all saved keys
     * @returns {Array} Array of keys
     */
    getAllKeys() {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.storagePrefix)) {
                keys.push(key.replace(this.storagePrefix, ''));
            }
        }
        return keys;
    }

    /**
     * Clear all game data
     * @returns {boolean} Success status
     */
    clearAllData() {
        try {
            const keys = this.getAllKeys();
            keys.forEach(key => this.deleteData(key));
            
            console.log('🗑️ All game data cleared');
            return true;
        } catch (error) {
            console.error('Failed to clear data:', error);
            return false;
        }
    }

    /**
     * Export save data as JSON
     * @returns {string} JSON string of all data
     */
    exportData() {
        const allData = {};
        const keys = this.getAllKeys();
        
        keys.forEach(key => {
            allData[key] = this.loadData(key);
        });
        
        return JSON.stringify(allData, null, 2);
    }

    /**
     * Import save data from JSON
     * @param {string} jsonString - JSON data to import
     * @returns {boolean} Success status
     */
    importData(jsonString) {
        try {
            const allData = JSON.parse(jsonString);
            
            Object.keys(allData).forEach(key => {
                this.saveData(key, allData[key]);
            });
            
            console.log('📥 Data imported successfully');
            return true;
        } catch (error) {
            console.error('Failed to import data:', error);
            return false;
        }
    }

    /**
     * Get storage usage info
     * @returns {Object} Storage info
     */
    getStorageInfo() {
        let totalSize = 0;
        const keys = this.getAllKeys();
        
        keys.forEach(key => {
            const fullKey = this.storagePrefix + key;
            const item = localStorage.getItem(fullKey);
            if (item) {
                totalSize += item.length;
            }
        });
        
        return {
            keys: keys.length,
            sizeBytes: totalSize,
            sizeKB: (totalSize / 1024).toFixed(2),
            sizeMB: (totalSize / 1024 / 1024).toFixed(2)
        };
    }

    /**
     * Reset game progress (but keep settings)
     */
    resetProgress() {
        this.deleteData(CONFIG.STORAGE_KEYS.PROGRESS);
        this.deleteData(CONFIG.STORAGE_KEYS.STATS);
        console.log('🔄 Progress reset');
    }

    /**
     * Start auto-save
     */
    startAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
        
        this.autoSaveInterval = setInterval(() => {
            if (window.game) {
                window.game.saveProgress();
            }
        }, CONFIG.TIMING.AUTO_SAVE_INTERVAL);
        
        console.log('💾 Auto-save enabled');
    }

    /**
     * Stop auto-save
     */
    stopAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
            console.log('💾 Auto-save disabled');
        }
    }

    /**
     * Save game settings
     * @param {Object} settings - Settings object
     */
    saveSettings(settings) {
        return this.saveData(CONFIG.STORAGE_KEYS.SETTINGS, settings);
    }

    /**
     * Load game settings
     * @returns {Object} Settings object or defaults
     */
    loadSettings() {
        const settings = this.loadData(CONFIG.STORAGE_KEYS.SETTINGS);
        
        if (!settings) {
            // Return default settings
            return {
                musicEnabled: true,
                sfxEnabled: true,
                volume: {
                    music: CONFIG.AUDIO.MUSIC_VOLUME,
                    sfx: CONFIG.AUDIO.SFX_VOLUME
                },
                difficulty: 'medium',
                timerEnabled: true,
                accessibility: { ...CONFIG.ACCESSIBILITY }
            };
        }
        
        return settings;
    }

    /**
     * Save player stats
     * @param {Object} stats - Stats object
     */
    saveStats(stats) {
        return this.saveData(CONFIG.STORAGE_KEYS.STATS, stats);
    }

    /**
     * Load player stats
     * @returns {Object} Stats object or defaults
     */
    loadStats() {
        const stats = this.loadData(CONFIG.STORAGE_KEYS.STATS);
        
        if (!stats) {
            return {
                totalPlayTime: 0,
                missionsCompleted: 0,
                totalScore: 0,
                hintsUsed: 0,
                perfectClears: 0,
                level: 1,
                xp: 0,
                credits: CONFIG.CURRENCY.STARTER_AMOUNT
            };
        }
        
        return stats;
    }

    /**
     * Check if localStorage is available
     * @returns {boolean} Availability status
     */
    static isAvailable() {
        try {
            const test = '__localStorage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Get last save time
     * @returns {number} Timestamp
     */
    getLastSaveTime() {
        return this.lastSaveTime;
    }

    /**
     * Get time since last save
     * @returns {number} Milliseconds
     */
    getTimeSinceLastSave() {
        return Date.now() - this.lastSaveTime;
    }
}

// Check if localStorage is available on module load
if (!StateManager.isAvailable()) {
    console.error('❌ localStorage is not available! Save functionality will not work.');
}