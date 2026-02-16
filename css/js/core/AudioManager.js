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
        this.cyberHumNodes = null;
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
            unlock: { file: 'assets/audio/sfx/unlock.mp3', volume: 0.7 },
            glitch: { file: 'assets/audio/sfx/glitch.mp3', volume: 0.35 },
            hologram: { file: 'assets/audio/sfx/hologram-activate.mp3', volume: 0.28 }
        };

        // Music tracks map - using the available Halloween bell music
        this.musicDefinitions = {
            menu: { file: 'assets/music/creepy-halloween-bells-loop-408748.mp3', loop: true, volume: 0.3 },
            loading: { file: 'assets/music/creepy-halloween-bells-loop-408748.mp3', loop: true, volume: 0.2 },
            gameplay: { file: 'assets/music/creepy-halloween-bells-loop-408748.mp3', loop: true, volume: 0.25 },
            gameplay1: { file: 'assets/music/creepy-halloween-bells-loop-408748.mp3', loop: true, volume: 0.25 },
            gameplay2: { file: 'assets/music/creepy-halloween-bells-loop-408748.mp3', loop: true, volume: 0.25 },
            cyberHum: { synth: 'cyberHum', loop: true, volume: 0.22 }
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

        if (this.playSynthSound(soundName, volume !== null ? volume : definition.volume * this.sfxVolume)) {
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

        if (trackName === 'cyberHum') {
            this.playAmbientCyberHum(fade);
            this.currentMusic = trackName;
            return;
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
        
        if (this.currentMusic === 'cyberHum') {
            this.stopAmbientCyberHum(fade);
            this.currentMusic = null;
            return;
        }

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
        
        if (this.currentMusic === 'cyberHum' && this.cyberHumNodes?.gainNode) {
            this.cyberHumNodes.gainNode.gain.linearRampToValueAtTime(
                0,
                this.audioContext.currentTime + 0.3
            );
            console.log('â¸ï¸ Cyber hum paused');
            return;
        }

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
        
        if (this.currentMusic === 'cyberHum' && this.cyberHumNodes?.gainNode) {
            const target = this.musicDefinitions.cyberHum.volume * this.musicVolume;
            this.cyberHumNodes.gainNode.gain.linearRampToValueAtTime(
                target,
                this.audioContext.currentTime + 0.45
            );
            console.log('â–¶ï¸ Cyber hum resumed');
            return;
        }

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
        
        // Update ambient cyber hum volume
        if (this.cyberHumNodes?.gainNode && this.currentMusic === 'cyberHum') {
            const target = this.musicDefinitions.cyberHum.volume * this.musicVolume;
            this.cyberHumNodes.gainNode.gain.linearRampToValueAtTime(
                target,
                this.audioContext.currentTime + 0.2
            );
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
        if (!this.sfxEnabled) return;
        this.playSynthButtonClick(0.34 * this.sfxVolume);
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
     * Play glitch UI sound
     */
    playGlitch() {
        this.playSound('glitch');
    }

    /**
     * Play hologram activation sound
     */
    playHologramActivate() {
        this.playSound('hologram');
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
        this.stopAmbientCyberHum(false);
        
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

    playSynthSound(soundName, volume) {
        if (!this.audioContext) return false;

        switch (soundName) {
            case 'buttonClick':
                this.playSynthButtonClick(volume);
                return true;
            case 'glitch':
                this.playSynthGlitch(volume);
                return true;
            case 'hologram':
                this.playSynthHologram(volume);
                return true;
            default:
                return false;
        }
    }

    playAmbientCyberHum(fade = true) {
        if (!this.audioContext || !this.musicEnabled) return;
        if (this.currentMusic === 'cyberHum' && this.cyberHumNodes) return;

        if (this.currentMusic && this.currentMusic !== 'cyberHum') {
            this.stopMusic(fade);
        }

        this.stopAmbientCyberHum(false);

        const masterGain = this.audioContext.createGain();
        const droneOsc = this.audioContext.createOscillator();
        const shimmerOsc = this.audioContext.createOscillator();
        const lowpass = this.audioContext.createBiquadFilter();
        const humLfo = this.audioContext.createOscillator();
        const lfoDepth = this.audioContext.createGain();

        droneOsc.type = 'sawtooth';
        droneOsc.frequency.value = 54;
        shimmerOsc.type = 'triangle';
        shimmerOsc.frequency.value = 81;

        lowpass.type = 'lowpass';
        lowpass.frequency.value = 420;
        lowpass.Q.value = 0.8;

        humLfo.type = 'sine';
        humLfo.frequency.value = 0.12;
        lfoDepth.gain.value = 120;

        humLfo.connect(lfoDepth);
        lfoDepth.connect(lowpass.frequency);

        droneOsc.connect(lowpass);
        shimmerOsc.connect(lowpass);
        lowpass.connect(masterGain);
        masterGain.connect(this.audioContext.destination);

        const targetVolume = this.musicDefinitions.cyberHum.volume * this.musicVolume;
        masterGain.gain.setValueAtTime(0.0001, this.audioContext.currentTime);
        masterGain.gain.linearRampToValueAtTime(
            targetVolume,
            this.audioContext.currentTime + (fade ? 1.2 : 0.15)
        );

        droneOsc.start(this.audioContext.currentTime);
        shimmerOsc.start(this.audioContext.currentTime);
        humLfo.start(this.audioContext.currentTime);

        this.cyberHumNodes = { masterGain, droneOsc, shimmerOsc, humLfo };
        this.currentAudioElement = null;
        this.currentMusic = 'cyberHum';
    }

    stopAmbientCyberHum(fade = true) {
        if (!this.cyberHumNodes || !this.audioContext) return;

        const { masterGain, droneOsc, shimmerOsc, humLfo } = this.cyberHumNodes;
        const stopDelay = fade ? 0.65 : 0.05;
        const endTime = this.audioContext.currentTime + stopDelay;

        try {
            masterGain.gain.cancelScheduledValues(this.audioContext.currentTime);
            masterGain.gain.setValueAtTime(masterGain.gain.value, this.audioContext.currentTime);
            masterGain.gain.linearRampToValueAtTime(0.0001, endTime);
            droneOsc.stop(endTime + 0.03);
            shimmerOsc.stop(endTime + 0.03);
            humLfo.stop(endTime + 0.03);
        } catch (error) {
            console.warn('Cyber hum stop warning:', error);
        }

        this.cyberHumNodes = null;
    }

    playSynthButtonClick(volume = 0.25) {
        if (!this.audioContext) return;

        const t = this.audioContext.currentTime;
        const sampleRate = this.audioContext.sampleRate;
        const clickBuffer = this.audioContext.createBuffer(1, Math.floor(sampleRate * 0.018), sampleRate);
        const data = clickBuffer.getChannelData(0);
        for (let i = 0; i < data.length; i += 1) {
            const decay = 1 - (i / data.length);
            data[i] = (Math.random() * 2 - 1) * decay;
        }

        const clickSource = this.audioContext.createBufferSource();
        const clickFilter = this.audioContext.createBiquadFilter();
        const clickGain = this.audioContext.createGain();
        const clickPop = this.audioContext.createOscillator();
        const popGain = this.audioContext.createGain();

        clickSource.buffer = clickBuffer;
        clickFilter.type = 'highpass';
        clickFilter.frequency.value = 1400;

        clickGain.gain.setValueAtTime(volume * 0.7, t);
        clickGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.02);

        clickPop.type = 'sine';
        clickPop.frequency.setValueAtTime(260, t);
        clickPop.frequency.exponentialRampToValueAtTime(120, t + 0.02);
        popGain.gain.setValueAtTime(volume * 0.2, t);
        popGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.025);

        clickSource.connect(clickFilter);
        clickFilter.connect(clickGain);
        clickGain.connect(this.audioContext.destination);

        clickPop.connect(popGain);
        popGain.connect(this.audioContext.destination);

        clickSource.start(t);
        clickSource.stop(t + 0.02);
        clickPop.start(t);
        clickPop.stop(t + 0.025);
    }

    playSynthGlitch(volume = 0.3) {
        if (!this.audioContext) return;

        const t = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        const bandpass = this.audioContext.createBiquadFilter();
        const noiseBuffer = this.audioContext.createBuffer(
            1,
            Math.floor(this.audioContext.sampleRate * 0.08),
            this.audioContext.sampleRate
        );
        const noiseData = noiseBuffer.getChannelData(0);
        for (let i = 0; i < noiseData.length; i += 1) {
            noiseData[i] = (Math.random() * 2 - 1) * (1 - i / noiseData.length);
        }
        const noise = this.audioContext.createBufferSource();
        noise.buffer = noiseBuffer;
        const noiseGain = this.audioContext.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(240, t);
        osc.frequency.exponentialRampToValueAtTime(90, t + 0.08);

        bandpass.type = 'bandpass';
        bandpass.frequency.value = 1100;
        bandpass.Q.value = 2.8;

        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.linearRampToValueAtTime(volume, t + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);

        noiseGain.gain.setValueAtTime(volume * 0.6, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);

        osc.connect(bandpass);
        bandpass.connect(gain);
        gain.connect(this.audioContext.destination);

        noise.connect(noiseGain);
        noiseGain.connect(this.audioContext.destination);

        osc.start(t);
        osc.stop(t + 0.13);
        noise.start(t);
        noise.stop(t + 0.09);
    }

    playSynthHologram(volume = 0.22) {
        if (!this.audioContext) return;

        const t = this.audioContext.currentTime;
        const oscA = this.audioContext.createOscillator();
        const oscB = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        const bandpass = this.audioContext.createBiquadFilter();

        oscA.type = 'sine';
        oscB.type = 'triangle';
        oscA.frequency.setValueAtTime(460, t);
        oscA.frequency.exponentialRampToValueAtTime(980, t + 0.16);
        oscB.frequency.setValueAtTime(920, t);
        oscB.frequency.exponentialRampToValueAtTime(1280, t + 0.16);

        bandpass.type = 'bandpass';
        bandpass.frequency.value = 1500;
        bandpass.Q.value = 1.2;

        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.linearRampToValueAtTime(volume, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);

        oscA.connect(bandpass);
        oscB.connect(bandpass);
        bandpass.connect(gain);
        gain.connect(this.audioContext.destination);

        oscA.start(t);
        oscB.start(t);
        oscA.stop(t + 0.22);
        oscB.stop(t + 0.22);
    }
}
