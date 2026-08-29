// Efectos de sonido procedurales generados con la Web Audio API
// (sin archivos externos, coherente con el arte generado por código).
class SoundFX {
  constructor() {
    this.ctx = null;
    this.noiseBuffer = null;
    this.init();
  }

  init() {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) this.ctx = new AC();
    } catch (e) {
      this.ctx = null;
    }
    if (this.ctx) this.buildNoiseBuffer();
  }

  // 1 segundo de ruido blanco reutilizable
  buildNoiseBuffer() {
    const ctx = this.ctx;
    const len = ctx.sampleRate;
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    this.noiseBuffer = buffer;
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }

  // explosión: ráfaga de ruido con filtro paso bajo y decaimiento
  explosion(volume = 0.7) {
    if (!this.ctx || !this.noiseBuffer) return;
    this.resume();
    const ctx = this.ctx;

    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.5);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    src.start();
    src.stop(ctx.currentTime + 0.65);
  }

  // disparo: blip corto de frecuencia descendente
  shot(volume = 0.25) {
    if (!this.ctx) return;
    this.resume();
    const ctx = this.ctx;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(900, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  }

  // daño: tono grave descendente + golpe de ruido
  damage(volume = 0.5) {
    if (!this.ctx) return;
    this.resume();
    const ctx = this.ctx;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(55, ctx.currentTime + 0.18);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.22);

    if (this.noiseBuffer) {
      const nsrc = ctx.createBufferSource();
      nsrc.buffer = this.noiseBuffer;
      const ngain = ctx.createGain();
      ngain.gain.setValueAtTime(volume * 0.4, ctx.currentTime);
      ngain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      nsrc.connect(ngain);
      ngain.connect(ctx.destination);
      nsrc.start();
      nsrc.stop(ctx.currentTime + 0.12);
    }
  }
}