/**
 * AudioManager - Handles all audio (music & sound effects)
 * Singleton pattern for global audio control
 */

import { CONFIG } from '../data/config.js';

export class AudioManager {
    static instance = null;

    constructor() {
        if (AudioManager.instance) {
            return AudioManager.instance;
        }

        this.musicEnabled = true;
        this.sfxEnabled = true;
        this.musicVolume = CONFIG.AUDIO.MUSIC_VOLUME;
        this.sfxVolume = CONFIG.AUDIO.SFX_VOLUME;
        
        this.currentMusic = null;
        this.audioContext = null;
        this.sounds = new Map();
        this.musicTracks = new Map();
        
        // Initialize Web Audio API
        this.initAudioContext();
        
        // Preload sounds (when assets are available)
        this.loadSounds();
        
        AudioManager.instance = this;
    }

    /**
     * Get singleton instance
     * @returns {AudioManager} Instance
     */
    static getInstance() {
        if (!AudioManager.instance) {
            AudioManager.instance = new AudioManager();
        }
        return AudioManager.instance;
    }

    /**
     * Initialize Web Audio API context
     */
    initAudioContext() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            
            // Resume context on user interaction (browser policy)
            document.addEventListener('click', () => {
                if (this.audioContext.state === 'suspended') {
                    this.audioContext.resume();
                }
            }, { once: true });
            
            console.log('🔊 Audio context initialized');
        } catch (error) {
            console.error('Audio context initialization failed:', error);
        }
    }

    /**
     * Load sound files (placeholder - will load actual files when available)
     */
    loadSounds() {
        // Sound effects map
        this.soundDefinitions = {
            buttonClick: { file: 'assets/audio/sfx/button-click.mp3', volume: 0.5 },
            success: { file: 'assets/audio/sfx/success.mp3', volume: 0.7 },
            failure: { file: 'assets/audio/sfx/failure.mp3', volume: 0.6 },
            hint: { file: 'assets/audio/sfx/hint.mp3', volume: 0.5 },
            typing: { file: 'assets/audio/sfx/typing.mp3', volume: 0.4 },
            timer: { file: 'assets/audio/sfx/timer.mp3', volume: 0.6 },
            unlock: { file: 'assets/audio/sfx/unlock.mp3', volume: 0.7 }
        };

        // Music tracks map
        this.musicDefinitions = {
            menu: { file: 'assets/audio/music/menu-theme.mp3', loop: true },
            gameplay1: { file: 'assets/audio/music/gameplay-ambient-1.mp3', loop: true },
            gameplay2: { file: 'assets/audio/music/gameplay-ambient-2.mp3', loop: true },
            victory: { file: 'assets/audio/music/victory.mp3', loop: false }
        };

        // In production, load actual audio files here
        // For now, we'll create placeholder audio objects
        console.log('🎵 Audio definitions loaded (files not yet available)');
    }

    /**
     * Play sound effect
     * @param {string} soundName - Name of sound to play
     * @param {number} volume - Volume override (0-1)
     */
    playSound(soundName, volume = null) {
        if (!this.sfxEnabled) return;

        const definition = this.soundDefinitions[soundName];
        if (!definition) {
            console.warn(`Sound not found: ${soundName}`);
            return;
        }

        // Generate simple beep as placeholder
        this.generateBeep(
            volume !== null ? volume : definition.volume * this.sfxVolume
        );

        if (CONFIG.DEBUG.ENABLED) {
            console.log(`🔊 Playing sound: ${soundName}`);
        }
    }

    /**
     * Play music track
     * @param {string} trackName - Name of music track
     * @param {boolean} fade - Fade in the music
     */
    playMusic(trackName, fade = true) {
        if (!this.musicEnabled) return;

        const definition = this.musicDefinitions[trackName];
        if (!definition) {
            console.warn(`Music track not found: ${trackName}`);
            return;
        }

        // Stop current music if playing
        if (this.currentMusic) {
            this.stopMusic(fade);
        }

        // In production, load and play actual music file
        this.currentMusic = trackName;
        
        console.log(`🎵 Playing music: ${trackName}`);
    }

    /**
     * Stop music
     * @param {boolean} fade - Fade out the music
     */
    stopMusic(fade = true) {
        if (!this.currentMusic) return;

        // In production, stop actual audio
        console.log(`🎵 Stopping music: ${this.currentMusic}`);
        this.currentMusic = null;
    }

    /**
     * Pause music
     */
    pauseMusic() {
        if (!this.currentMusic) return;
        // In production, pause actual audio
        console.log('⏸️ Music paused');
    }

    /**
     * Resume music
     */
    resumeMusic() {
        if (!this.currentMusic) return;
        // In production, resume actual audio
        console.log('▶️ Music resumed');
    }

    /**
     * Generate simple beep sound as placeholder
     * @param {number} volume - Volume (0-1)
     */
    generateBeep(volume = 0.5) {
        if (!this.audioContext) return;

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(
                0.01,
                this.audioContext.currentTime + 0.1
            );

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.1);
        } catch (error) {
            console.error('Beep generation failed:', error);
        }
    }

    /**
     * Set music enabled/disabled
     * @param {boolean} enabled - Enable music
     */
    setMusicEnabled(enabled) {
        this.musicEnabled = enabled;
        
        if (!enabled && this.currentMusic) {
            this.stopMusic();
        }
        
        console.log(`🎵 Music ${enabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * Set SFX enabled/disabled
     * @param {boolean} enabled - Enable SFX
     */
    setSfxEnabled(enabled) {
        this.sfxEnabled = enabled;
        console.log(`🔊 SFX ${enabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * Set music volume
     * @param {number} volume - Volume (0-1)
     */
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        // In production, update actual audio volume
        console.log(`🎵 Music volume: ${this.musicVolume}`);
    }

    /**
     * Set SFX volume
     * @param {number} volume - Volume (0-1)
     */
    setSfxVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        console.log(`🔊 SFX volume: ${this.sfxVolume}`);
    }

    /**
     * Get current settings
     * @returns {Object} Audio settings
     */
    getSettings() {
        return {
            musicEnabled: this.musicEnabled,
            sfxEnabled: this.sfxEnabled,
            musicVolume: this.musicVolume,
            sfxVolume: this.sfxVolume
        };
    }

    /**
     * Apply settings
     * @param {Object} settings - Audio settings
     */
    applySettings(settings) {
        if (settings.musicEnabled !== undefined) {
            this.setMusicEnabled(settings.musicEnabled);
        }
        if (settings.sfxEnabled !== undefined) {
            this.setSfxEnabled(settings.sfxEnabled);
        }
        if (settings.musicVolume !== undefined) {
            this.setMusicVolume(settings.musicVolume);
        }
        if (settings.sfxVolume !== undefined) {
            this.setSfxVolume(settings.sfxVolume);
        }
    }

    /**
     * Play button click sound
     */
    playButtonClick() {
        this.playSound('buttonClick');
    }

    /**
     * Play success sound
     */
    playSuccess() {
        this.playSound('success');
    }

    /**
     * Play failure sound
     */
    playFailure() {
        this.playSound('failure');
    }

    /**
     * Play hint sound
     */
    playHint() {
        this.playSound('hint');
    }

    /**
     * Play typing sound
     */
    playTyping() {
        this.playSound('typing', 0.3);
    }

    /**
     * Play timer warning sound
     */
    playTimerWarning() {
        this.playSound('timer');
    }

    /**
     * Crossfade between music tracks
     * @param {string} newTrack - New track to play
     */
    crossfade(newTrack) {
        // In production, implement smooth crossfade
        this.stopMusic(true);
        setTimeout(() => {
            this.playMusic(newTrack, true);
        }, CONFIG.AUDIO.FADE_DURATION);
    }

    /**
     * Mute all audio
     */
    muteAll() {
        this.setMusicEnabled(false);
        this.setSfxEnabled(false);
    }

    /**
     * Unmute all audio
     */
    unmuteAll() {
        this.setMusicEnabled(true);
        this.setSfxEnabled(true);
    }

    /**
     * Clean up audio resources
     */
    destroy() {
        this.stopMusic(false);
        if (this.audioContext) {
            this.audioContext.close();
        }
        AudioManager.instance = null;
    }
}