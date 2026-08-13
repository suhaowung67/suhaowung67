/**
 * sounds.js
 * Manages sound effects (click, hover, win, lose) globally.
 */

// Simple synthesizer for sound effects to avoid requiring external files initially
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let soundsMuted = StorageHelper.get('soundsMuted', false);

const SoundEngine = {
  toggleMute() {
    soundsMuted = !soundsMuted;
    StorageHelper.set('soundsMuted', soundsMuted);
    return soundsMuted;
  },
  
  isMuted() {
    return soundsMuted;
  },

  playTone(frequency, type = 'sine', duration = 0.1, vol = 0.1) {
    if (soundsMuted) return;
    
    // Resume audio context if suspended (browser autoplay policy)
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = type;
    oscillator.frequency.value = frequency;

    gainNode.gain.setValueAtTime(vol, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);
  },

  playClick() {
    this.playTone(600, 'sine', 0.05, 0.05);
  },

  playHover() {
    this.playTone(300, 'sine', 0.05, 0.02);
  },

  playSuccess() {
    setTimeout(() => this.playTone(400, 'sine', 0.1, 0.1), 0);
    setTimeout(() => this.playTone(600, 'sine', 0.15, 0.1), 100);
  },

  playWin() {
    setTimeout(() => this.playTone(300, 'square', 0.1, 0.1), 0);
    setTimeout(() => this.playTone(400, 'square', 0.1, 0.1), 100);
    setTimeout(() => this.playTone(500, 'square', 0.1, 0.1), 200);
    setTimeout(() => this.playTone(800, 'square', 0.3, 0.1), 300);
  },

  playLose() {
    setTimeout(() => this.playTone(300, 'sawtooth', 0.2, 0.1), 0);
    setTimeout(() => this.playTone(250, 'sawtooth', 0.2, 0.1), 200);
    setTimeout(() => this.playTone(200, 'sawtooth', 0.4, 0.1), 400);
  }
};

window.SoundEngine = SoundEngine;

// Attach click/hover sounds to interactive elements globally
document.addEventListener("DOMContentLoaded", attachSoundListeners);
document.addEventListener("pageLoad", attachSoundListeners); // Listen to SPA navigations

function attachSoundListeners() {
  const buttons = document.querySelectorAll('button, a, .cursor-pointer');
  
  buttons.forEach(btn => {
    // Prevent attaching multiple times
    if (btn.dataset.soundAttached) return;
    
    btn.addEventListener('mouseenter', () => SoundEngine.playHover());
    btn.addEventListener('mousedown', () => SoundEngine.playClick());
    
    btn.dataset.soundAttached = 'true';
  });
}
