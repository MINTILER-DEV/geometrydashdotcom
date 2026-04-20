// Reverse-engineered source mirror extracted from the runtime bundle.
// This file keeps the runtime color tween system and the audio manager together because both are
// global services owned by the gameplay scene.
const bs = 1e3,
  Ss = 1001;
class ColorTween {
  constructor(t, e, i) {
    (this.from = { ...t }),
      (this.to = { ...e }),
      (this.duration = i),
      (this.elapsed = 0),
      (this.done = i <= 0),
      (this.current = i <= 0 ? { ...e } : { ...t });
  }
  step(t) {
    if (this.done) return;
    this.elapsed += t;
    let e = this.duration > 0 ? Math.min(this.elapsed / this.duration, 1) : 1;
    e >= 1
      ? ((this.current = { ...this.to }), (this.done = !0))
      : (this.current = {
          r: Math.round(this.from.r + (this.to.r - this.from.r) * e),
          g: Math.round(this.from.g + (this.to.g - this.from.g) * e),
          b: Math.round(this.from.b + (this.to.b - this.from.b) * e),
        });
  }
}
class ColorManager {
  constructor() {
    this.reset();
  }
  reset() {
    (this._colors = {
      [bs]: {
        r: Number(window.bgr),
        g: Number(window.bgg),
        b: Number(window.bgb),
      },
      [Ss]: {
        r: Number(window.gr),
        g: Number(window.gg),
        b: Number(window.gb),
      },
    }),
      (this._actions = {});
  }
  triggerColor(t, e, i) {
    let s = { ...this.getColor(t) };
    (this._actions[t] = new ColorTween(s, e, i)),
      i <= 0 && (this._colors[t] = { ...e });
  }
  step(t) {
    for (let e in this._actions) {
      let i = this._actions[e];
      i.step(t),
        (this._colors[e] = { ...i.current }),
        i.done && delete this._actions[e];
    }
  }
  getColor(t) {
    return this._colors[t] || { r: 255, g: 255, b: 255 };
  }
  getHex(t) {
    let e = this.getColor(t);
    return (e.r << 16) | (e.g << 8) | e.b;
  }
}
class AudioManager {
  constructor(t) {
    (this._scene = t),
      (this._music = null),
      (this._userMusicVol = t.game.registry.get("userMusicVol") ?? 1),
      (this._meteringEnabled = !1),
      (this._analyser = null),
      (this._meterBuffer = null),
      (this._meterValue = 0.1),
      (this._lastAudio = 0.1),
      (this._lastPeak = 0),
      (this._silenceCounter = 0);
  }
  _effectiveVolume() {
    return 0.8 * this._userMusicVol;
  }
  startMusic(t = 0) {
    this._music && (this._music.stop(), this._music.destroy()),
      (this._music = this._scene.sound.add("stereo_madness", {
        loop: !0,
        volume: this._effectiveVolume(),
      })),
      this._music.play({ seek: t }),
      this._setupAnalyser();
  }
  stopMusic() {
    this._music && this._music.stop();
  }
  pauseMusic() {
    this._music && this._music.isPlaying && this._music.pause();
  }
  resumeMusic() {
    this._music && this._music.isPaused && this._music.resume();
  }
  getUserMusicVolume() {
    return this._userMusicVol;
  }
  setUserMusicVolume(t) {
    (this._userMusicVol = t),
      this._scene.game.registry.set("userMusicVol", t),
      this._music && (this._music.volume = this._effectiveVolume());
  }
  getMusicVolume() {
    return this._effectiveVolume();
  }
  setMusicVolume(t) {
    this.setUserMusicVolume(t / 0.8);
  }
  fadeInMusic(t = 1e3) {
    this._music && (this._music.stop(), this._music.destroy()),
      (this._music = this._scene.sound.add("stereo_madness", {
        loop: !0,
        volume: 0,
      })),
      this._music.play(),
      this._setupAnalyser(),
      this._scene.tweens.add({
        targets: this._music,
        volume: this._effectiveVolume(),
        duration: t,
      });
  }
  fadeOutMusic(t = 1500) {
    this._music &&
      this._music.isPlaying &&
      (this._music.setLoop(!1),
      this._scene.tweens.add({
        targets: this._music,
        volume: 0,
        duration: t,
        onComplete: () => {
          this._music && this._music.stop();
        },
      }));
  }
  playEffect(t, e = {}) {
    const i = void 0 !== this._scene._sfxVolume ? this._scene._sfxVolume : 1;
    (e.volume = (e.volume || 1) * i), this._scene.sound.play(t, e);
  }
  _setupAnalyser() {
    const t = this._scene.sound.context;
    t &&
      ((this._analyser = t.createAnalyser()),
      (this._analyser.fftSize = 2048),
      (this._meterBuffer = new Float32Array(this._analyser.fftSize)),
      this._scene.sound.masterVolumeNode.connect(this._analyser),
      (this._meteringEnabled = !0));
  }
  update(t) {
    if (!this._meteringEnabled || !this._analyser) return;
    this._analyser.getFloatTimeDomainData(this._meterBuffer);
    let e = 0;
    for (let r = 0; r < this._meterBuffer.length; r++) {
      let t = Math.abs(this._meterBuffer[r]);
      t > e && (e = t);
    }
    const i = this._effectiveVolume();
    i > 0 && (e /= i), (this._meterValue = 0.1 + e);
    const s = 60 * t;
    this._silenceCounter < 3 ||
    this._meterValue < 1.1 * this._lastAudio ||
    (this._meterValue < 0.95 * this._lastPeak &&
      this._lastAudio > 0.2 * this._lastPeak)
      ? (this._meterValue = this._lastAudio * Math.pow(0.92, s))
      : ((this._silenceCounter = 0),
        (this._lastPeak = this._meterValue),
        (this._meterValue *= Math.pow(1.46, s))),
      this._meterValue <= 0.1 && (this._lastPeak = 0),
      (this._lastAudio = this._meterValue),
      this._silenceCounter++;
  }
  getMeteringValue() {
    return this._meterValue;
  }
  reset() {
    (this._meterValue = 0.1),
      (this._lastAudio = 0.1),
      (this._lastPeak = 0),
      (this._silenceCounter = 0),
      this.stopMusic();
  }
}
