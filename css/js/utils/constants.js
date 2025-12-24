/**
 * Game Constants
 * Fixed values and enumerations used throughout the game
 */

// Screen IDs
export const SCREENS = {
    MAIN_MENU: 'main-menu',
    MISSION_SELECT: 'mission-select',
    GAME_SCREEN: 'game-screen',
    SETTINGS: 'settings',
    CREDITS: 'credits'
};

// Puzzle Types
export const PUZZLE_TYPES = {
    PASSWORD: 'password',
    FIREWALL: 'firewall',
    NETWORK: 'network',
    MALWARE: 'malware',
    PHISHING: 'phishing',
    MIXED: 'mixed'
};

// Difficulty Levels
export const DIFFICULTY = {
    EASY: 'easy',
    MEDIUM: 'medium',
    HARD: 'hard',
    EXPERT: 'expert'
};

// Mission Status
export const MISSION_STATUS = {
    LOCKED: 'locked',
    AVAILABLE: 'available',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    FAILED: 'failed'
};

// Game States
export const GAME_STATE = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    COMPLETE: 'complete',
    GAME_OVER: 'game_over'
};

// Score Ranks
export const SCORE_RANKS = {
    S: { min: 9000, name: 'ELITE', color: '#FFD700' },
    A_PLUS: { min: 7500, name: 'MASTER', color: '#00ff41' },
    A: { min: 6000, name: 'EXPERT', color: '#00f3ff' },
    B: { min: 4500, name: 'PROFICIENT', color: '#8b5cf6' },
    C: { min: 3000, name: 'COMPETENT', color: '#ff6b35' },
    D: { min: 1500, name: 'NOVICE', color: '#94a3b8' },
    F: { min: 0, name: 'BEGINNER', color: '#64748b' }
};

// Audio Events
export const AUDIO_EVENTS = {
    BUTTON_CLICK: 'button_click',
    SUCCESS: 'success',
    FAILURE: 'failure',
    HINT: 'hint',
    TYPING: 'typing',
    TIMER_WARNING: 'timer_warning',
    UNLOCK: 'unlock',
    LEVEL_UP: 'level_up'
};

// UI Events
export const UI_EVENTS = {
    SCREEN_CHANGE: 'screen_change',
    MODAL_OPEN: 'modal_open',
    MODAL_CLOSE: 'modal_close',
    NOTIFICATION: 'notification',
    PROGRESS_UPDATE: 'progress_update'
};

// Keyboard Keys
export const KEYS = {
    ESCAPE: 'Escape',
    ENTER: 'Enter',
    SPACE: ' ',
    ARROW_UP: 'ArrowUp',
    ARROW_DOWN: 'ArrowDown',
    ARROW_LEFT: 'ArrowLeft',
    ARROW_RIGHT: 'ArrowRight',
    TAB: 'Tab',
    BACKSPACE: 'Backspace'
};

// Colors (CSS variable names)
export const COLORS = {
    CYBER_BLUE: 'var(--cyber-blue)',
    CYBER_PINK: 'var(--cyber-pink)',
    CYBER_PURPLE: 'var(--cyber-purple)',
    CYBER_GREEN: 'var(--cyber-green)',
    CYBER_ORANGE: 'var(--cyber-orange)',
    TEXT_PRIMARY: 'var(--text-primary)',
    TEXT_SECONDARY: 'var(--text-secondary)',
    TEXT_MUTED: 'var(--text-muted)'
};

// Animation Classes
export const ANIMATIONS = {
    FADE_IN: 'animate-fadeIn',
    FADE_OUT: 'animate-fadeOut',
    SLIDE_IN_UP: 'animate-slideInUp',
    SLIDE_IN_DOWN: 'animate-slideInDown',
    SLIDE_IN_LEFT: 'animate-slideInLeft',
    SLIDE_IN_RIGHT: 'animate-slideInRight',
    SHAKE: 'animate-shake',
    PULSE: 'animate-pulse',
    BOUNCE: 'animate-bounce',
    SPIN: 'animate-spin',
    GLITCH: 'animate-glitch',
    GLOW: 'animate-glow'
};

// Notification Types
export const NOTIFICATION_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
};

// Modal Types
export const MODAL_TYPES = {
    INFO: 'info',
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    CONFIRM: 'confirm'
};

// Career Paths
export const CAREER_PATHS = {
    CYBERSECURITY: 'cybersecurity',
    WEB_DEFENDER: 'web_defender',
    NONE: 'none'
};

// Achievement Categories
export const ACHIEVEMENT_CATEGORIES = {
    COMPLETION: 'completion',
    SPEED: 'speed',
    ACCURACY: 'accuracy',
    EXPLORATION: 'exploration',
    MASTERY: 'mastery'
};

// XP Thresholds
export const XP_LEVELS = [
    0,      // Level 1
    100,    // Level 2
    250,    // Level 3
    450,    // Level 4
    700,    // Level 5
    1000,   // Level 6
    1350,   // Level 7
    1750,   // Level 8
    2200,   // Level 9
    2700,   // Level 10
    // Continue exponentially...
];

// Timer States
export const TIMER_STATES = {
    IDLE: 'idle',
    RUNNING: 'running',
    PAUSED: 'paused',
    EXPIRED: 'expired'
};

// AI Opponent States
export const AI_STATES = {
    IDLE: 'idle',
    ANALYZING: 'analyzing',
    WORKING: 'working',
    PAUSED: 'paused',
    COMPLETED: 'completed',
    FAILED: 'failed'
};

// Puzzle States
export const PUZZLE_STATES = {
    NOT_STARTED: 'not_started',
    IN_PROGRESS: 'in_progress',
    CHECKING: 'checking',
    COMPLETED: 'completed',
    FAILED: 'failed'
};

// File Extensions (for malware puzzle)
export const FILE_EXTENSIONS = {
    EXECUTABLE: ['.exe', '.bat', '.cmd', '.com', '.scr'],
    DOCUMENT: ['.doc', '.docx', '.pdf', '.txt', '.rtf'],
    IMAGE: ['.jpg', '.png', '.gif', '.bmp', '.svg'],
    ARCHIVE: ['.zip', '.rar', '.7z', '.tar', '.gz'],
    CODE: ['.js', '.py', '.java', '.cpp', '.html', '.css'],
    SYSTEM: ['.dll', '.sys', '.ini', '.cfg']
};

// Network Ports (for network puzzle)
export const COMMON_PORTS = {
    HTTP: 80,
    HTTPS: 443,
    FTP: 21,
    SSH: 22,
    TELNET: 23,
    SMTP: 25,
    DNS: 53,
    MYSQL: 3306,
    POSTGRES: 5432,
    MONGODB: 27017
};

// Phishing Indicators
export const PHISHING_INDICATORS = [
    'Suspicious sender address',
    'Urgent language',
    'Grammatical errors',
    'Generic greeting',
    'Request for personal information',
    'Mismatched links',
    'Unexpected attachments',
    'Too good to be true offers'
];

// Browser Storage Limits
export const STORAGE_LIMITS = {
    LOCAL_STORAGE_MAX: 5 * 1024 * 1024, // 5MB
    SESSION_STORAGE_MAX: 5 * 1024 * 1024 // 5MB
};

// Performance Thresholds
export const PERFORMANCE = {
    LOW_FPS_THRESHOLD: 30,
    TARGET_FPS: 60,
    PARTICLE_REDUCTION_THRESHOLD: 40
};

// Regex Patterns
export const PATTERNS = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    URL: /^https?:\/\/.+/,
    IP_ADDRESS: /^(\d{1,3}\.){3}\d{1,3}$/,
    PASSWORD_STRONG: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    HEX_COLOR: /^#[0-9A-F]{6}$/i
};

// Error Messages
export const ERROR_MESSAGES = {
    STORAGE_FULL: 'Storage is full. Please clear some data.',
    SAVE_FAILED: 'Failed to save progress.',
    LOAD_FAILED: 'Failed to load saved data.',
    NETWORK_ERROR: 'Network error. Please check your connection.',
    INVALID_INPUT: 'Invalid input. Please try again.',
    MISSION_LOCKED: 'This mission is locked. Complete previous missions to unlock.',
    NO_HINTS_LEFT: 'No hints remaining!',
    GAME_OVER: 'Mission failed. Try again?'
};

// Success Messages
export const SUCCESS_MESSAGES = {
    MISSION_COMPLETE: 'Mission Complete!',
    PUZZLE_SOLVED: 'Puzzle Solved!',
    HINT_REVEALED: 'Hint Revealed!',
    PROGRESS_SAVED: 'Progress Saved!',
    LEVEL_UP: 'Level Up!',
    ACHIEVEMENT_UNLOCKED: 'Achievement Unlocked!'
};

// Tutorial Messages
export const TUTORIAL_MESSAGES = {
    WELCOME: 'Welcome to SHADOWDEF!',
    FIRST_MISSION: 'This is your first mission. Follow the objectives to succeed.',
    PASSWORD_HINT: 'Use the hints to crack the password.',
    TIMER_WARNING: 'Watch the timer! Complete before time runs out.',
    AI_OPPONENT: 'Beat the AI opponent to earn bonus points.',
    HINTS_AVAILABLE: 'Press the hint button if you get stuck.'
};

// Export all as default object
export default {
    SCREENS,
    PUZZLE_TYPES,
    DIFFICULTY,
    MISSION_STATUS,
    GAME_STATE,
    SCORE_RANKS,
    AUDIO_EVENTS,
    UI_EVENTS,
    KEYS,
    COLORS,
    ANIMATIONS,
    NOTIFICATION_TYPES,
    MODAL_TYPES,
    CAREER_PATHS,
    ACHIEVEMENT_CATEGORIES,
    XP_LEVELS,
    TIMER_STATES,
    AI_STATES,
    PUZZLE_STATES,
    FILE_EXTENSIONS,
    COMMON_PORTS,
    PHISHING_INDICATORS,
    STORAGE_LIMITS,
    PERFORMANCE,
    PATTERNS,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    TUTORIAL_MESSAGES
};