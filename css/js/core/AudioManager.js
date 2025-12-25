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
        this.currentAudioElement = null;
        this.softToneNodes = [];
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
     * Load sound files and music tracks
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

        // Music tracks map - using the available Halloween bell music
        this.musicDefinitions = {
            menu: { file: 'assets/music/creepy-halloween-bells-loop-408748.mp3', loop: true, volume: 0.3 },
            loading: { file: 'assets/music/creepy-halloween-bells-loop-408748.mp3', loop: true, volume: 0.2 },
            gameplay: { file: 'assets/music/creepy-halloween-bells-loop-408748.mp3', loop: true, volume: 0.25 },
            gameplay1: { file: 'assets/music/creepy-halloween-bells-loop-408748.mp3', loop: true, volume: 0.25 },
            gameplay2: { file: 'assets/music/creepy-halloween-bells-loop-408748.mp3', loop: true, volume: 0.25 }
        };

        // Preload music files
        this.preloadMusic();

        console.log('🎵 Audio definitions loaded with creepy Halloween bells music');
    }

    /**
     * Preload music files
     */
    preloadMusic() {
        Object.keys(this.musicDefinitions).forEach(trackName => {
            const definition = this.musicDefinitions[trackName];
            const audio = new Audio();
            audio.src = definition.file;
            audio.loop = definition.loop;
            audio.volume = definition.volume * this.musicVolume;
            audio.preload = 'auto';
            
            // Store the audio element
            this.musicTracks.set(trackName, audio);
            
            // Handle loading events
            audio.addEventListener('canplaythrough', () => {
                console.log(`🎵 Loaded: ${trackName}`);
            });
            
            audio.addEventListener('error', (e) => {
                console.warn(`🎵 Failed to load: ${trackName}`, e);
                // Fallback to soft tones if file doesn't exist
                this.musicTracks.delete(trackName);
            });
        });
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

        // Stop current music if playing
        if (this.currentMusic) {
            this.stopMusic(fade);
        }

        // Try to play actual audio file first
        const audioElement = this.musicTracks.get(trackName);
        if (audioElement) {
            this.playAudioFile(audioElement, trackName, fade);
        } else {
            // Fallback to soft tones if audio file not available
            console.log(`🎵 Audio file not found for ${trackName}, using soft tones`);
            this.fallbackToSoftTones(trackName, fade);
        }

        this.currentMusic = trackName;
        console.log(`🎵 Playing music: ${trackName}`);
    }

    /**
     * Play actual audio file
     * @param {HTMLAudioElement} audioElement - Audio element
     * @param {string} trackName - Track name
     * @param {boolean} fade - Fade in
     */
    playAudioFile(audioElement, trackName, fade) {
        try {
            audioElement.currentTime = 0;
            audioElement.volume = fade ? 0 : (this.musicDefinitions[trackName].volume * this.musicVolume);
            
            const playPromise = audioElement.play();
            
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    if (fade) {
                        this.fadeInAudio(audioElement, this.musicDefinitions[trackName].volume * this.musicVolume);
                    }
                    console.log(`🎵 Playing audio file: ${trackName}`);
                }).catch(error => {
                    console.warn(`🎵 Audio play failed for ${trackName}:`, error);
                    this.fallbackToSoftTones(trackName, fade);
                });
            }
            
            this.currentAudioElement = audioElement;
        } catch (error) {
            console.warn(`🎵 Error playing ${trackName}:`, error);
            this.fallbackToSoftTones(trackName, fade);
        }
    }

    /**
     * Fade in audio element
     * @param {HTMLAudioElement} audioElement - Audio element
     * @param {number} targetVolume - Target volume
     */
    fadeInAudio(audioElement, targetVolume) {
        const fadeSteps = 20;
        const fadeInterval = 100;
        const volumeStep = targetVolume / fadeSteps;
        let currentStep = 0;

        const fadeTimer = setInterval(() => {
            currentStep++;
            audioElement.volume = Math.min(volumeStep * currentStep, targetVolume);
            
            if (currentStep >= fadeSteps) {
                clearInterval(fadeTimer);
            }
        }, fadeInterval);
    }

    /**
     * Fade out audio element
     * @param {HTMLAudioElement} audioElement - Audio element
     * @param {Function} callback - Callback when fade complete
     */
    fadeOutAudio(audioElement, callback) {
        const fadeSteps = 20;
        const fadeInterval = 50;
        const startVolume = audioElement.volume;
        const volumeStep = startVolume / fadeSteps;
        let currentStep = 0;

        const fadeTimer = setInterval(() => {
            currentStep++;
            audioElement.volume = Math.max(startVolume - (volumeStep * currentStep), 0);
            
            if (currentStep >= fadeSteps || audioElement.volume <= 0) {
                clearInterval(fadeTimer);
                audioElement.pause();
                if (callback) callback();
            }
        }, fadeInterval);
    }

    /**
     * Fallback to soft tones when audio file not available
     * @param {string} trackName - Track name
     * @param {boolean} fade - Fade in
     */
    fallbackToSoftTones(trackName, fade) {
        // Map track names to soft tone types
        const toneMap = {
            'menu': 'soft',
            'loading': 'gentle', 
            'gameplay': 'calm',
            'gameplay1': 'calm',
            'gameplay2': 'soft'
        };

        const toneType = toneMap[trackName] || 'soft';

        setTimeout(() => {
            this.generateSoftTones(toneType);
        }, fade ? 500 : 0);
    }

    /**
     * Stop music
     * @param {boolean} fade - Fade out the music
     */
    stopMusic(fade = true) {
        if (!this.currentMusic) return;

        console.log(`🎵 Stopping music: ${this.currentMusic}`);
        
        // Stop audio file if playing
        if (this.currentAudioElement) {
            if (fade) {
                this.fadeOutAudio(this.currentAudioElement, () => {
                    this.currentAudioElement = null;
                });
            } else {
                this.currentAudioElement.pause();
                this.currentAudioElement = null;
            }
        }
        
        // Stop soft tones
        this.stopSoftTones();
        
        this.currentMusic = null;
    }

    /**
     * Pause music
     */
    pauseMusic() {
        if (!this.currentMusic) return;
        
        if (this.currentAudioElement) {
            this.currentAudioElement.pause();
            console.log('⏸️ Audio file paused');
        } else if (this.softToneNodes) {
            this.softToneNodes.forEach(node => {
                if (node.gainNode) {
                    node.gainNode.gain.linearRampToValueAtTime(
                        0,
                        this.audioContext.currentTime + 0.5
                    );
                }
            });
            console.log('⏸️ Soft tones paused');
        }
    }

    /**
     * Resume music
     */
    resumeMusic() {
        if (!this.currentMusic) return;
        
        if (this.currentAudioElement) {
            const playPromise = this.currentAudioElement.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.warn('Resume failed:', error);
                });
            }
            console.log('▶️ Audio file resumed');
        } else if (this.softToneNodes) {
            this.softToneNodes.forEach(node => {
                if (node.gainNode) {
                    node.gainNode.gain.linearRampToValueAtTime(
                        node.volume * this.musicVolume,
                        this.audioContext.currentTime + 0.5
                    );
                }
            });
            console.log('▶️ Soft tones resumed');
        }
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
     * Generate soft ambient tones
     * @param {string} type - Type of ambient tone ('soft', 'gentle', 'calm')
     */
    generateSoftTones(type = 'soft') {
        if (!this.audioContext || !this.musicEnabled) return;

        // Stop current tones
        this.stopSoftTones();

        // Create very simple, soft tones
        this.softToneNodes = [];
        
        const toneConfig = this.getSoftToneConfig(type);
        
        toneConfig.frequencies.forEach((freq, index) => {
            setTimeout(() => {
                this.createSoftTone(freq, toneConfig.volume);
            }, index * 1000); // Stagger the tones
        });

        this.currentMusic = type;
        console.log(`🎵 Playing soft tones: ${type}`);
    }

    /**
     * Get soft tone configuration
     * @param {string} type - Tone type
     * @returns {Object} Configuration
     */
    getSoftToneConfig(type) {
        const configs = {
            soft: {
                frequencies: [220, 330, 440], // A3, E4, A4 - gentle harmony
                volume: 0.08
            },
            gentle: {
                frequencies: [196, 294, 392], // G3, D4, G4 - soothing
                volume: 0.06
            },
            calm: {
                frequencies: [174, 261, 349], // F3, C4, F4 - peaceful
                volume: 0.07
            }
        };

        return configs[type] || configs.soft;
    }

    /**
     * Create a single soft tone
     * @param {number} frequency - Tone frequency
     * @param {number} volume - Tone volume
     */
    createSoftTone(frequency, volume) {
        if (!this.audioContext) return;

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            const filterNode = this.audioContext.createBiquadFilter();

            // Very soft sine wave
            oscillator.type = 'sine';
            oscillator.frequency.value = frequency;

            // Soft low-pass filter
            filterNode.type = 'lowpass';
            filterNode.frequency.value = 800;
            filterNode.Q.value = 0.5;

            // Connect nodes
            oscillator.connect(filterNode);
            filterNode.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            // Very gentle fade in
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(
                volume * this.musicVolume,
                this.audioContext.currentTime + 3
            );

            // Store for cleanup
            this.softToneNodes.push({
                oscillator,
                gainNode,
                filterNode,
                frequency,
                volume
            });

            // Start the tone
            oscillator.start(this.audioContext.currentTime);

        } catch (error) {
            console.error('Soft tone creation failed:', error);
        }
    }

    /**
     * Stop soft tones
     */
    stopSoftTones() {
        if (this.softToneNodes) {
            this.softToneNodes.forEach(node => {
                try {
                    // Very gentle fade out
                    node.gainNode.gain.linearRampToValueAtTime(
                        0,
                        this.audioContext.currentTime + 2
                    );

                    // Stop after fade
                    setTimeout(() => {
                        if (node.oscillator) {
                            node.oscillator.stop();
                        }
                    }, 2000);
                } catch (error) {
                    console.error('Error stopping soft tone:', error);
                }
            });
            this.softToneNodes = [];
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
        
        // Update current audio file volume
        if (this.currentAudioElement && this.currentMusic) {
            const definition = this.musicDefinitions[this.currentMusic];
            if (definition) {
                this.currentAudioElement.volume = definition.volume * this.musicVolume;
            }
        }
        
        // Update current soft tones volume
        if (this.softToneNodes) {
            this.softToneNodes.forEach(node => {
                if (node.gainNode) {
                    node.gainNode.gain.linearRampToValueAtTime(
                        node.volume * this.musicVolume,
                        this.audioContext.currentTime + 0.1
                    );
                }
            });
        }
        
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
        this.stopSoftTones();
        
        // Clean up audio elements
        if (this.currentAudioElement) {
            this.currentAudioElement.pause();
            this.currentAudioElement = null;
        }
        
        // Clean up all preloaded music
        this.musicTracks.forEach(audio => {
            audio.pause();
            audio.src = '';
        });
        this.musicTracks.clear();
        
        if (this.audioContext) {
            this.audioContext.close();
        }
        AudioManager.instance = null;
    }
}