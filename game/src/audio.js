export class BistroSoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  ensureContext() {
    if (this.muted) return null;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  setMuted(muted) {
    this.muted = muted;
  }

  playPickup() {
    this.tone(440, 0.08, 'sine', 0.06, 580);
  }

  playDrop() {
    this.tone(320, 0.07, 'triangle', 0.06, 220);
  }

  playChop() {
    this.noiseBurst(0.05, 0.055, 1800);
    this.tone(240, 0.045, 'square', 0.03, 140);
  }

  playChopDone() {
    this.tone(520, 0.08, 'triangle', 0.07, 680);
    this.tone(780, 0.1, 'sine', 0.06, 920, 0.04);
  }

  playSearReady() {
    this.tone(587, 0.12, 'triangle', 0.08);
    this.tone(880, 0.16, 'sine', 0.08, null, 0.07);
  }

  playSimmerReady() {
    this.tone(494, 0.12, 'sine', 0.07);
    this.tone(740, 0.16, 'triangle', 0.07, null, 0.06);
  }

  playBakeReady() {
    this.tone(659, 0.12, 'sine', 0.075);
    this.tone(988, 0.18, 'triangle', 0.07, null, 0.06);
  }

  playPlateReady() {
    this.tone(523, 0.11, 'sine', 0.07);
    this.tone(659, 0.11, 'sine', 0.07, null, 0.06);
    this.tone(784, 0.16, 'triangle', 0.08, null, 0.12);
  }

  playServe(combo = 1) {
    const base = 660 + Math.min(combo, 5) * 45;
    this.tone(base, 0.18, 'sine', 0.09);
    this.tone(base * 1.5, 0.25, 'triangle', 0.08, null, 0.06);
  }

  playWarn() {
    this.tone(220, 0.12, 'sawtooth', 0.05, 165);
  }

  playBurn() {
    this.noiseBurst(0.18, 0.07, 650);
    this.tone(175, 0.22, 'sawtooth', 0.06, 95);
  }

  tone(freq, duration, type = 'triangle', gainVal = 0.08, slideTo = null, delay = 0) {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideTo !== null) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(40, slideTo), now + duration);
    }
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(gainVal, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  noiseBurst(duration = 0.07, gainVal = 0.04, highpass = 1200) {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const sampleCount = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, sampleCount, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < sampleCount; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / sampleCount);
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = highpass;
    const gain = ctx.createGain();
    gain.gain.value = gainVal;
    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    src.start();
  }
}
