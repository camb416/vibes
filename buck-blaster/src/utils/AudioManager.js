class AudioManager {
    constructor(scene) {
        this.scene = scene;
        this.audioContext = null;
        this.masterGain = null;
        this.activeOscillators = [];
        this.backgroundMusicEvent = null;
    }

    setupSound() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log("Audio context created successfully");
            
            // Create oscillators for different sound effects
            this.setupOscillators();
            
            // Start background music
            this.startBackgroundMusic();
            
        } catch (e) {
            console.error("Failed to create audio context:", e);
            // Create dummy sound objects as fallback
            this.scene.shootSound = { play: () => {} };
            this.scene.hitSound = { play: () => {} };
            this.scene.explosionSound = { play: () => {} };
        }
    }
    
    setupOscillators() {
        // Create gain node for master volume
        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.value = 0.3; // Set master volume to 30%
        this.masterGain.connect(this.audioContext.destination);
        
        // Create shoot sound (square wave for player actions)
        this.scene.shootSound = {
            play: () => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.type = 'square'; // Square wave for player actions
                oscillator.frequency.value = 440; // A4 note
                
                gainNode.gain.value = 0.1;
                
                oscillator.connect(gainNode);
                gainNode.connect(this.masterGain);
                
                oscillator.start();
                
                // Frequency sweep down
                oscillator.frequency.exponentialRampToValueAtTime(
                    880, // End at A5
                    this.audioContext.currentTime + 0.1
                );
                
                // Quick fade out
                gainNode.gain.exponentialRampToValueAtTime(
                    0.01,
                    this.audioContext.currentTime + 0.1
                );
                
                // Stop after 100ms
                setTimeout(() => {
                    oscillator.stop();
                    oscillator.disconnect();
                    gainNode.disconnect();
                }, 100);
            }
        };
        
        // Create hit sound (sine wave for enemies)
        this.scene.hitSound = {
            play: () => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.type = 'sine'; // Sine wave for smoother hit sound
                oscillator.frequency.value = 220; // A3 note
                
                gainNode.gain.value = 0.1;
                
                oscillator.connect(gainNode);
                gainNode.connect(this.masterGain);
                
                oscillator.start();
                
                // Frequency sweep up
                oscillator.frequency.exponentialRampToValueAtTime(
                    55, // End at A1 (lower pitch for hit)
                    this.audioContext.currentTime + 0.1
                );
                
                // Quick fade out
                gainNode.gain.exponentialRampToValueAtTime(
                    0.01,
                    this.audioContext.currentTime + 0.1
                );
                
                // Stop after 100ms
                setTimeout(() => {
                    oscillator.stop();
                    oscillator.disconnect();
                    gainNode.disconnect();
                }, 100);
            }
        };
        
        // Create explosion sound (noise for explosions)
        this.scene.explosionSound = {
            play: () => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                const filter = this.audioContext.createBiquadFilter();
                
                oscillator.type = 'sawtooth'; // Sawtooth for more harmonics
                oscillator.frequency.value = 100; // Lower frequency for explosion
                
                filter.type = 'lowpass';
                filter.frequency.value = 1000;
                filter.Q.value = 1;
                
                gainNode.gain.value = 0.2;
                
                oscillator.connect(filter);
                filter.connect(gainNode);
                gainNode.connect(this.masterGain);
                
                oscillator.start();
                
                // Frequency sweep down for explosion effect
                oscillator.frequency.exponentialRampToValueAtTime(
                    30,
                    this.audioContext.currentTime + 0.3
                );
                
                // Quick fade out
                gainNode.gain.exponentialRampToValueAtTime(
                    0.01,
                    this.audioContext.currentTime + 0.3
                );
                
                // Filter sweep for explosion effect
                filter.frequency.exponentialRampToValueAtTime(
                    100,
                    this.audioContext.currentTime + 0.3
                );
                
                // Stop after 300ms
                setTimeout(() => {
                    oscillator.stop();
                    oscillator.disconnect();
                    filter.disconnect();
                    gainNode.disconnect();
                }, 300);
            }
        };
    }
    
    startBackgroundMusic() {
        // Create array to store active oscillators
        this.activeOscillators = [];
        
        // MIDI-style background music parameters
        const baseNotes = [110, 146.83, 164.81, 196]; // A2, D3, E3, G3
        const rhythmPattern = [1, 0, 2, 0, 3, 2, 0, 1]; // Pattern of notes to play
        let currentStep = 0;
        
        // Create background music interval
        this.backgroundMusicEvent = this.scene.time.addEvent({
            delay: 250, // 240 BPM (quarter note)
            callback: () => {
                if (this.scene.gameOver) return;
                
                // Get current note from pattern
                const noteIndex = rhythmPattern[currentStep % rhythmPattern.length];
                
                // Check if we should play a note or rest
                if (noteIndex !== -1 && Math.random() > 0.2) {
                    // Create oscillator for this note
                    const oscillator = this.audioContext.createOscillator();
                    const gainNode = this.audioContext.createGain();
                    
                    // Vary the sound slightly for more interest
                    oscillator.type = Math.random() > 0.5 ? 'sine' : 'triangle';
                    
                    // Calculate note frequency with slight randomness
                    const baseFreq = baseNotes[noteIndex];
                    const freq = baseFreq * (1 + (Math.random() * 0.01 - 0.005)); // ±0.5% detuning
                    
                    oscillator.frequency.value = freq;
                    
                    // Set very low volume for ambient background feel
                    gainNode.gain.value = 0.04; 
                    
                    // Connect nodes
                    oscillator.connect(gainNode);
                    gainNode.connect(this.masterGain);
                    
                    // Start oscillator
                    oscillator.start();
                    
                    // Schedule note to fade out
                    gainNode.gain.setValueAtTime(0.04, this.audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(
                        0.001,
                        this.audioContext.currentTime + 0.2
                    );
                    
                    // Store reference to clean up later
                    this.activeOscillators.push({
                        oscillator,
                        gainNode,
                        endTime: this.audioContext.currentTime + 0.25
                    });
                    
                    // Clean up oscillators after they're done
                    setTimeout(() => {
                        oscillator.stop();
                        oscillator.disconnect();
                        gainNode.disconnect();
                        
                        // Remove from active oscillators array
                        const index = this.activeOscillators.findIndex(o => o.oscillator === oscillator);
                        if (index !== -1) {
                            this.activeOscillators.splice(index, 1);
                        }
                    }, 250);
                }
                
                // Move to next step in the pattern
                currentStep++;
            },
            callbackScope: this,
            loop: true
        });
    }
    
    playExcitingExplosion() {
        try {
            // Create a more complex explosion sound
            const oscillator1 = this.audioContext.createOscillator();
            const oscillator2 = this.audioContext.createOscillator();
            const noiseBuffer = this.createNoiseBuffer();
            const noiseSource = this.audioContext.createBufferSource();
            const filter = this.audioContext.createBiquadFilter();
            const gainNode = this.audioContext.createGain();
            
            // Configure oscillators
            oscillator1.type = 'sawtooth';
            oscillator1.frequency.value = 110; // A2
            
            oscillator2.type = 'square';
            oscillator2.frequency.value = 55; // A1
            
            // Configure noise
            noiseSource.buffer = noiseBuffer;
            
            // Configure filter
            filter.type = 'lowpass';
            filter.frequency.value = 1000;
            filter.Q.value = 2;
            
            // Configure gain
            gainNode.gain.value = 0.2;
            
            // Connect everything
            oscillator1.connect(filter);
            oscillator2.connect(filter);
            noiseSource.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            // Start audio
            oscillator1.start();
            oscillator2.start();
            noiseSource.start();
            
            // Automate parameters for explosion effect
            oscillator1.frequency.exponentialRampToValueAtTime(
                40,
                this.audioContext.currentTime + 0.4
            );
            
            oscillator2.frequency.exponentialRampToValueAtTime(
                20,
                this.audioContext.currentTime + 0.4
            );
            
            filter.frequency.exponentialRampToValueAtTime(
                100,
                this.audioContext.currentTime + 0.4
            );
            
            gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(
                0.001,
                this.audioContext.currentTime + 0.4
            );
            
            // Clean up after explosion is done
            setTimeout(() => {
                oscillator1.stop();
                oscillator2.stop();
                noiseSource.stop();
                
                oscillator1.disconnect();
                oscillator2.disconnect();
                noiseSource.disconnect();
                filter.disconnect();
                gainNode.disconnect();
            }, 400);
            
        } catch (e) {
            console.error('Error in playExcitingExplosion:', e);
        }
    }
    
    // Create a noise buffer for explosion sounds
    createNoiseBuffer() {
        const bufferSize = this.audioContext.sampleRate * 0.5; // 500ms buffer
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        
        // Fill the buffer with noise
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        return buffer;
    }
    
    // Clean up all audio
    shutdown() {
        // Stop background music event
        if (this.backgroundMusicEvent) {
            this.backgroundMusicEvent.remove();
            this.backgroundMusicEvent = null;
        }
        
        // Stop all active oscillators
        this.activeOscillators.forEach(({ oscillator, gainNode }) => {
            try {
                oscillator.stop();
                oscillator.disconnect();
                gainNode.disconnect();
            } catch (e) {
                // Ignore errors from already disconnected nodes
            }
        });
        
        this.activeOscillators = [];
    }
}

export default AudioManager; 