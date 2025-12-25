/**
 * Game Configuration
 * Central config for all game settings
 */

export const CONFIG = {
    // Game Meta
    GAME_NAME: 'SHADOWDEF',
    VERSION: '0.1.0',
    
    // Scoring
    SCORING: {
        BASE_SCORE: 1000,
        TIME_BONUS_MULTIPLIER: 5,
        ACCURACY_BONUS: 500,
        HINT_PENALTY: 100,
        ATTEMPT_PENALTY: 50,
        MIN_SCORE: 0,
        MAX_SCORE: 9999
    },
    
    // Timing
    TIMING: {
        DEFAULT_MISSION_TIME: 120, // 2 minutes in seconds
        WARNING_TIME: 30, // Show warning at 30 seconds
        AI_UPDATE_INTERVAL: 100, // AI progress updates every 100ms
        AUTO_SAVE_INTERVAL: 180000 // Auto-save every 3 minutes
    },
    
    // Hints
    HINTS: {
        MAX_HINTS_PER_MISSION: 3,
        HINT_COOLDOWN: 5000, // 5 seconds between hints
        HINT_COST_SCORE: 100
    },
    
    // Progression
    PROGRESSION: {
        XP_PER_LEVEL: 1000,
        MAX_LEVEL: 50,
        CAREER_UNLOCK_MISSION: 5,
        EXPERT_UNLOCK_MISSION: 20
    },
    
    // Currency
    CURRENCY: {
        NAME: 'Crypto-Credits',
        SYMBOL: '₡',
        STARTER_AMOUNT: 100
    },
    
    // Difficulty Modifiers
    DIFFICULTY: {
        EASY: {
            aiSpeed: 0.7,
            timeMultiplier: 1.5,
            hintPenalty: 0.5
        },
        MEDIUM: {
            aiSpeed: 1.0,
            timeMultiplier: 1.0,
            hintPenalty: 1.0
        },
        HARD: {
            aiSpeed: 1.3,
            timeMultiplier: 0.75,
            hintPenalty: 1.5
        }
    },
    
    // Audio
    AUDIO: {
        MUSIC_VOLUME: 0.5,
        SFX_VOLUME: 0.7,
        FADE_DURATION: 1000
    },
    
    // UI
    UI: {
        ANIMATION_SPEED: 300,
        NOTIFICATION_DURATION: 3000,
        MODAL_CLOSE_DELAY: 500,
        TOOLTIP_DELAY: 500
    },
    
    // Background
    BACKGROUND: {
        PARTICLE_COUNT: 80,
        PARTICLE_SPEED: 0.3,
        CONNECTION_DISTANCE: 200,
        PARTICLE_SIZE_MIN: 1,
        PARTICLE_SIZE_MAX: 4,
        FPS_TARGET: 60,
        NETWORK_DENSITY: 1.2,
        GLOW_INTENSITY: 0.6
    },
    
    // Puzzle Settings
    PUZZLES: {
        PASSWORD: {
            MIN_LENGTH: 4,
            MAX_LENGTH: 8,
            MAX_ATTEMPTS: 5
        },
        FIREWALL: {
            GRID_SIZE: 6,
            MAX_MOVES: 50
        },
        NETWORK: {
            MIN_NODES: 8,
            MAX_NODES: 15,
            CONNECTION_RATIO: 1.5
        },
        MALWARE: {
            MIN_FILES: 15,
            MAX_FILES: 30,
            INFECTED_RATIO: 0.25
        },
        PHISHING: {
            INDICATORS_COUNT: 8,
            MIN_CORRECT: 4
        }
    },
    
    // Storage Keys
    STORAGE_KEYS: {
        PROGRESS: 'shadowdef_progress',
        SETTINGS: 'shadowdef_settings',
        STATS: 'shadowdef_stats',
        CUSTOMIZATION: 'shadowdef_custom'
    },
    
    // Performance
    PERFORMANCE: {
        ENABLE_PARTICLES: true,
        ENABLE_ANIMATIONS: true,
        ENABLE_SHADOWS: true,
        LOW_FPS_THRESHOLD: 30,
        REDUCE_QUALITY_ON_LOW_FPS: true
    },
    
    // Accessibility
    ACCESSIBILITY: {
        HIGH_CONTRAST: false,
        REDUCE_MOTION: false,
        SCREEN_READER: false,
        COLORBLIND_MODE: 'none', // 'none', 'protanopia', 'deuteranopia', 'tritanopia'
        TEXT_SIZE: 100 // percentage
    },
    
    // Debug
    DEBUG: {
        ENABLED: false,
        LOG_LEVEL: 'info', // 'info', 'warn', 'error', 'debug'
        SHOW_FPS: false,
        UNLOCK_ALL_MISSIONS: false,
        INFINITE_HINTS: false
    }
};

/**
 * Get config value by path
 * Example: getConfig('SCORING.BASE_SCORE')
 */
export function getConfig(path) {
    const keys = path.split('.');
    let value = CONFIG;
    
    for (const key of keys) {
        if (value[key] === undefined) {
            console.warn(`Config key not found: ${path}`);
            return null;
        }
        value = value[key];
    }
    
    return value;
}

/**
 * Update config value (use sparingly, mainly for settings)
 */
export function updateConfig(path, newValue) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    let target = CONFIG;
    
    for (const key of keys) {
        if (target[key] === undefined) {
            console.error(`Invalid config path: ${path}`);
            return false;
        }
        target = target[key];
    }
    
    target[lastKey] = newValue;
    return true;
}

/**
 * Reset config to defaults (useful for testing)
 */
export function resetConfig() {
    console.warn('Config reset is not implemented - requires page reload');
}