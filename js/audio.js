/* ==========================================================================
   QUADRA — 64-Bit Retro Sound & Music Synthesizer Engine (Web Audio API)
   Generates rich chiptune SFX and background melodies offline with zero external files.
   ========================================================================== */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.soundEnabled = true;
    this.musicEnabled = true;
    this.masterGain = null;
    this.sfxGain = null;
    this.musicGain = null;
    this.currentTrack = null;
    this.musicInterval = null;
    this.currentStep = 0;
    this.bpm = 120;
    this.isMuted = false;

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (this.ctx && this.ctx.state === 'running') {
          this.ctx.suspend();
        }
      } else {
        if (this.ctx && this.ctx.state === 'suspended' && this.soundEnabled) {
          this.ctx.resume();
        }
      }
    });
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);
    } catch (e) {
      console.warn("Web Audio API not supported on this device.", e);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    if (this.sfxGain) {
      this.sfxGain.gain.setValueAtTime(this.soundEnabled ? 0.8 : 0, this.ctx?.currentTime || 0);
    }
    return this.soundEnabled;
  }

  toggleMusic() {
    this.musicEnabled = !this.musicEnabled;
    if (this.musicGain) {
      this.musicGain.gain.setValueAtTime(this.musicEnabled ? 0.35 : 0, this.ctx?.currentTime || 0);
    }
    return this.musicEnabled;
  }

  // Helper note frequency converter
  noteToFreq(note) {
    const notes = {
      'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
      'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
      'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77,
      'C6': 1046.50
    };
    return notes[note] || 440;
  }

  // --- Sound Effects ---

  playBeep(freq = 440, type = 'square', duration = 0.08) {
    if (!this.soundEnabled) return;
    this.init();
    this.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playScan() {
    if (!this.soundEnabled) return;
    this.init();
    this.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1600, this.ctx.currentTime + 0.25);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.25);
  }

  playCorrect() {
    if (!this.soundEnabled) return;
    this.init();
    this.resume();

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.2);
      }, idx * 60);
    });
  }

  playWrong() {
    if (!this.soundEnabled) return;
    this.init();
    this.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(90, this.ctx.currentTime + 0.35);

    gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.35);
  }

  playLaunch() {
    if (!this.soundEnabled) return;
    this.init();
    this.resume();

    // Noise buffer for rocket engine rumble
    const bufferSize = this.ctx.sampleRate * 1.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, this.ctx.currentTime);
    filter.frequency.linearRampToValueAtTime(900, this.ctx.currentTime + 1.2);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 1.5);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start();
    noise.stop(this.ctx.currentTime + 1.5);
  }

  playExplosion() {
    if (!this.soundEnabled) return;
    this.init();
    this.resume();

    const bufferSize = this.ctx.sampleRate * 0.8;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.2));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.6, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);

    noise.connect(gain);
    gain.connect(this.sfxGain);

    noise.start();
  }

  playBounce() {
    if (!this.soundEnabled) return;
    this.init();
    this.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  playBuild() {
    if (!this.soundEnabled) return;
    this.init();
    this.resume();

    const notes = [220, 330, 440, 660];
    notes.forEach((f, i) => {
      setTimeout(() => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(f, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.08);
      }, i * 40);
    });
  }

  playCash() {
    if (!this.soundEnabled) return;
    this.init();
    this.resume();

    const notes = [987.77, 1318.51]; // B5, E6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.25);
      }, idx * 75);
    });
  }

  playEngine() {
    if (!this.soundEnabled) return;
    this.init();
    this.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(450, this.ctx.currentTime + 0.6);

    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.6);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.6);
  }

  // --- Background Retro Chiptune Music Generator ---

  playTrack(trackName) {
    if (!this.musicEnabled) return;
    this.init();
    this.resume();
    this.stopMusic();

    this.currentTrack = trackName;
    this.currentStep = 0;

    const tracks = {
      title: {
        bpm: 110,
        melody: ['C4', 'E4', 'G4', 'B4', 'C5', 'B4', 'G4', 'E4', 'A4', 'C5', 'E5', 'G5', 'F5', 'D5', 'B4', 'G4'],
        bass: ['C3', 'C3', 'A3', 'A3', 'F3', 'F3', 'G3', 'G3']
      },
      village: {
        bpm: 96,
        melody: ['C4', 'G4', 'A4', 'E4', 'F4', 'C4', 'D4', 'G4', 'E4', 'G4', 'C5', 'B4', 'A4', 'G4', 'F4', 'E4'],
        bass: ['C3', 'G3', 'A3', 'E3', 'F3', 'C3', 'D3', 'G3']
      },
      sports: {
        bpm: 128,
        melody: ['E4', 'G4', 'A4', 'C5', 'A4', 'G4', 'E4', 'D4', 'E4', 'G4', 'A4', 'D5', 'C5', 'A4', 'G4', 'E4'],
        bass: ['A3', 'A3', 'C3', 'C3', 'D3', 'D3', 'E3', 'E3']
      },
      building: {
        bpm: 115,
        melody: ['D4', 'F4', 'A4', 'D5', 'C5', 'A4', 'F4', 'E4', 'D4', 'F4', 'G4', 'Bb4', 'A4', 'F4', 'E4', 'C4'],
        bass: ['D3', 'D3', 'G3', 'G3', 'Bb3', 'Bb3', 'A3', 'A3']
      },
      space: {
        bpm: 105,
        melody: ['C5', 'E5', 'G5', 'C6', 'B5', 'G5', 'E5', 'D5', 'A4', 'C5', 'E5', 'A5', 'G5', 'E5', 'D5', 'B4'],
        bass: ['C3', 'E3', 'A3', 'G3', 'F3', 'A3', 'D3', 'G3']
      },
      business: {
        bpm: 120,
        melody: ['G4', 'B4', 'D5', 'F5', 'E5', 'C5', 'A4', 'F4', 'D4', 'F4', 'A4', 'C5', 'B4', 'G4', 'E4', 'D4'],
        bass: ['G3', 'G3', 'C3', 'C3', 'F3', 'F3', 'D3', 'D3']
      },
      racing: {
        bpm: 140,
        melody: ['E4', 'E4', 'G4', 'A4', 'B4', 'D5', 'B4', 'A4', 'E5', 'E5', 'D5', 'B4', 'A4', 'G4', 'A4', 'B4'],
        bass: ['E3', 'E3', 'E3', 'E3', 'C3', 'C3', 'D3', 'D3']
      },
      stadium: {
        bpm: 125,
        melody: ['C5', 'G4', 'A4', 'E4', 'F4', 'C5', 'G4', 'C5', 'E5', 'D5', 'C5', 'G4', 'A4', 'B4', 'C5', 'D5'],
        bass: ['C3', 'G3', 'A3', 'E3', 'F3', 'C3', 'G3', 'C3']
      }
    };

    const track = tracks[trackName] || tracks.title;
    const stepDuration = (60 / track.bpm) / 2; // 8th notes

    this.musicInterval = setInterval(() => {
      if (!this.musicEnabled || !this.ctx) return;

      const melNote = track.melody[this.currentStep % track.melody.length];
      const bassNote = track.bass[Math.floor(this.currentStep / 2) % track.bass.length];

      // Play melody
      if (melNote) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'pulse' || 'square';
        osc.frequency.setValueAtTime(this.noteToFreq(melNote), this.ctx.currentTime);
        gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + stepDuration * 0.9);
        osc.connect(gain);
        gain.connect(this.musicGain);
        osc.start();
        osc.stop(this.ctx.currentTime + stepDuration * 0.9);
      }

      // Play bass every 2 steps
      if (this.currentStep % 2 === 0 && bassNote) {
        const oscB = this.ctx.createOscillator();
        const gainB = this.ctx.createGain();
        oscB.type = 'triangle';
        oscB.frequency.setValueAtTime(this.noteToFreq(bassNote), this.ctx.currentTime);
        gainB.gain.setValueAtTime(0.12, this.ctx.currentTime);
        gainB.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + stepDuration * 1.8);
        oscB.connect(gainB);
        gainB.connect(this.musicGain);
        oscB.start();
        oscB.stop(this.ctx.currentTime + stepDuration * 1.8);
      }

      this.currentStep++;
    }, stepDuration * 1000);
  }

  stopMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

// Singleton global sound instance
window.soundEngine = new SoundEngine();
