class AudioMgr {
  constructor() {
    this.bgm = null;
    this.sfxCtx = null; // Web Audio API (如需)或简单的InnerAudioContext
    this.isMuted = false;
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new AudioMgr();
    }
    return this.instance;
  }

  playBgm(src) {
    if (this.isMuted) return;
    if (!this.bgm) {
      this.bgm = wx.createInnerAudioContext();
      this.bgm.loop = true;
    }
    this.bgm.src = src;
    this.bgm.play();
  }

  stopBgm() {
    if (this.bgm) {
      this.bgm.stop();
    }
  }

  playSfx(src) {
    if (this.isMuted) return;
    const sfx = wx.createInnerAudioContext();
    sfx.src = src;
    sfx.play();
    sfx.onEnded(() => {
      sfx.destroy();
    });
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopBgm();
    } else if (this.bgm && this.bgm.src) {
      this.bgm.play();
    }
    return this.isMuted;
  }
}

export default AudioMgr;
