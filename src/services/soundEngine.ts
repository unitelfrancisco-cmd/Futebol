/**
 * Audio synthesis engine for realistic coin clinks, wood hits, whistles and crowd cheers.
 * Uses Web Audio API without external audio assets.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.7;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public playCoinClink(intensity: number = 0.5) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(0, t);
    const masterGain = (0.2 + 0.4 * Math.min(1, intensity)) * this.volume;

    // Metallic ring frequencies (inharmonic overtone series like real coin strikes)
    const baseFreq = 2600 + Math.random() * 400;
    const overtones = [1, 1.48, 2.12, 3.1];

    overtones.forEach((ratio, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();

      osc.type = i === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(baseFreq * ratio, t);

      // Rapid decay
      const decay = 0.04 + 0.08 / (i + 1);
      oscGain.gain.setValueAtTime(masterGain / (i + 1), t);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, t + decay);

      osc.connect(oscGain);
      oscGain.connect(gainNode);

      osc.start(t);
      osc.stop(t + decay);
    });

    gainNode.connect(this.ctx.destination);
  }

  public playWoodRailBounce(intensity: number = 0.5) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const gain = this.ctx.createGain();
    const currentGain = (0.15 + 0.3 * Math.min(1, intensity)) * this.volume;

    // Deep wooden thud with quick dampening
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.08);

    gain.gain.setValueAtTime(currentGain, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.09);
  }

  public playPegPing() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const gain = this.ctx.createGain();
    const osc = this.ctx.createOscillator();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(3200 + Math.random() * 300, t);
    osc.frequency.exponentialRampToValueAtTime(1600, t + 0.12);

    gain.gain.setValueAtTime(0.25 * this.volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  public playFlickWhoosh(power: number = 0.5) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.08;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800 + power * 1200, t);
    filter.Q.setValueAtTime(3, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.12 * power * this.volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(t);
    noise.stop(t + 0.08);
  }

  public playWhistle(short: boolean = false) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const duration = short ? 0.2 : 0.45;

    // Dual frequency whistle with trill
    [2400, 2650].forEach((freq) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      // Tremolo
      const tremolo = this.ctx.createOscillator();
      const tremoloGain = this.ctx.createGain();
      tremolo.frequency.setValueAtTime(32, t);
      tremoloGain.gain.setValueAtTime(25, t);
      tremolo.connect(tremoloGain);
      tremoloGain.connect(osc.frequency);
      tremolo.start(t);
      tremolo.stop(t + duration);

      gain.gain.setValueAtTime(0.15 * this.volume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + duration);
    });
  }

  public playGoalCelebration() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    // Long referee whistle + crowd roar + air horn
    this.playWhistle(false);

    const t = this.ctx.currentTime;

    // Air horn fanfare
    const hornNotes = [311.13, 370.0, 466.16]; // Eb, F#, Bb
    hornNotes.forEach((freq) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t + 0.1);

      gain.gain.setValueAtTime(0.08 * this.volume, t + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + 0.1);
      osc.stop(t + 1.2);
    });

    // Crowd cheer noise
    const cheerDuration = 1.8;
    const bufferSize = Math.floor(this.ctx.sampleRate * cheerDuration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, t);
    filter.frequency.linearRampToValueAtTime(1400, t + 0.6);
    filter.frequency.exponentialRampToValueAtTime(300, t + cheerDuration);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.01, t);
    noiseGain.gain.linearRampToValueAtTime(0.2 * this.volume, t + 0.3);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + cheerDuration);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);

    noise.start(t);
    noise.stop(t + cheerDuration);
  }

  public playFoulBuzzer() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.setValueAtTime(90, t + 0.15);

    gain.gain.setValueAtTime(0.18 * this.volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.3);
  }
}

export const sounds = new SoundEngine();
