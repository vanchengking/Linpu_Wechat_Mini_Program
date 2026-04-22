import StorageMgr from '../../../utils/ar_games/StorageMgr.js';
import AchievementMgr from '../../../utils/ar_games/AchievementMgr.js';
import ParticleSys from '../../../utils/ar_games/ParticleSys.js';

Page({
  data: {
    score: 0,
    combo: 0,
    timeLeft: 60, // 调整为 60s
    phase: 1,
    showResult: false,
    showTutorial: true,
    countdown: 0,
    resultTitle: '鼓韵游神',
    stars: 0,
    npcComment: '',
    fragmentName: '「非遗传承人」徽章',
    randomEventHint: ''
  },

  onLoad() {
    this.sysInfo = wx.getSystemInfoSync();
    this.width = this.sysInfo.windowWidth;
    this.height = this.sysInfo.windowHeight;
    
    this.gameState = {
      isPlaying: false,
      timeElapsed: 0,
      maxCombo: 0,
      
      // phase 1
      notes: [],
      noteSpeed: 4,
      lastNoteTime: 0,
      
      // phase 2
      guideTime: 0,
      obstacles: [],
      lastObstacleTime: 0,
      nextEventTime: 8000
    };

    this.player = {
      x: this.width / 2,
      y: this.height - 150,
      width: 40,
      height: 40,
      targetX: this.width / 2,
      targetY: this.height - 150,
      speedMulti: 1
    };

    this.initPhase1();
  },

  onUnload() {
    this.gameState.isPlaying = false;
    if (this.timerId) clearInterval(this.timerId);
    if (this.aniId && this.canvas) this.canvas.cancelAnimationFrame(this.aniId);
  },

  onStartGame() {
    this.setData({ showTutorial: false, countdown: 4 });
    this.startCountdown();
  },

  startCountdown() {
    if (this.data.countdown > 1) {
      setTimeout(() => {
        this.setData({ countdown: this.data.countdown - 1 });
        this.startCountdown();
      }, 1000);
    } else {
      setTimeout(() => {
        this.setData({ countdown: 0 });
        this.startGame();
      }, 1000);
    }
  },

  startGame() {
    this.gameState.isPlaying = true;
    this.lastTime = Date.now();
    this.startTimer();
    if (this.data.phase === 1) this.gameLoopPhase1();
    else this.gameLoopPhase2();
  },

  startTimer() {
    this.timerId = setInterval(() => {
      if (!this.gameState.isPlaying) return;
      this.gameState.timeElapsed++;
      const timeLeft = Math.max(0, 60 - this.gameState.timeElapsed);
      this.setData({ timeLeft });

      // 随机事件
      if (this.gameState.timeElapsed * 1000 > this.gameState.nextEventTime) {
        this.triggerRandomEvent();
      }

      if (this.data.phase === 1 && this.gameState.timeElapsed >= 35) {
        this.initPhase2();
      }

      if (timeLeft <= 0) {
        this.endGame();
      }
    }, 1000);
  },

  triggerRandomEvent() {
    const events = [
      { name: '观众欢呼：分数翻倍', action: () => {
        const oldScore = this.data.score;
        this.setData({ score: oldScore + 50 }); // 简单直接加分
      }},
      { name: '灵光乍现：Combo增加', action: () => {
        this.setData({ combo: this.data.combo + 5 });
      }}
    ];

    const event = events[Math.floor(Math.random() * events.length)];
    event.action();
    this.setData({ randomEventHint: event.name });
    setTimeout(() => this.setData({ randomEventHint: '' }), 2000);
    this.gameState.nextEventTime = this.gameState.timeElapsed * 1000 + 15000;
  },

  initPhase1() {
    const query = wx.createSelectorQuery();
    query.select('#rhythmCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0]) return;
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        const dpr = this.sysInfo.pixelRatio;
        canvas.width = res[0].width * dpr;
        canvas.height = res[0].height * dpr;
        ctx.scale(dpr, dpr);
        
        this.canvas = canvas;
        this.ctx = ctx;
        this.particleSys = new ParticleSys(this.width, canvas.height);
        
        this.gameLoopPhase1();
      });
  },

  gameLoopPhase1() {
    if (!this.gameState.isPlaying || this.data.phase !== 1) return;
    
    const now = Date.now();
    const dt = now - this.lastTime;
    this.lastTime = now;

    this.updatePhase1(dt);
    this.drawPhase1();

    this.aniId = this.canvas.requestAnimationFrame(this.gameLoopPhase1.bind(this));
  },

  updatePhase1(dt) {
    this.gameState.lastNoteTime += dt;
    
    // 生成音符 (简化版，随机生成)
    let spawnInterval = 1000;
    let trackCount = 1;
    const t = this.gameState.timeElapsed;
    
    if (t < 20) { spawnInterval = 800; trackCount = 1; }
    else if (t < 55) { spawnInterval = 600; trackCount = 2; }
    else if (t < 95) { spawnInterval = 400; trackCount = 4; }
    else { spawnInterval = 800; trackCount = 2; }

    if (this.gameState.lastNoteTime > spawnInterval) {
      this.gameState.lastNoteTime = 0;
      const track = Math.floor(Math.random() * trackCount);
      this.gameState.notes.push({
        track,
        y: -20,
        type: 'tap',
        active: true
      });
    }

    const hitY = this.canvas.height - 40;

    for (let i = this.gameState.notes.length - 1; i >= 0; i--) {
      let note = this.gameState.notes[i];
      note.y += this.gameState.noteSpeed;
      
      // Miss判定 - 增加容错范围，不要太快移除
      if (note.y > hitY + 100 && note.active) {
        this.handleNoteHit(note, 'miss');
        this.gameState.notes.splice(i, 1);
      }
    }

    this.particleSys.update();
  },

  drawPhase1() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.canvas.height);

    const hitY = this.canvas.height - 40;
    const trackWidth = this.width / 4;

    // 绘制判定线
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, hitY);
    ctx.lineTo(this.width, hitY);
    ctx.stroke();

    // 绘制音符
    for (let note of this.gameState.notes) {
      if (!note.active) continue;
      const x = note.track * trackWidth + trackWidth / 2;
      ctx.fillStyle = '#ff4500';
      ctx.beginPath();
      ctx.arc(x, note.y, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.stroke();
    }

    this.particleSys.draw(ctx);
  },

  onTrackTouchStart(e) {
    if (this.data.phase !== 1) return;
    const track = e.currentTarget.dataset.track;
    const hitY = this.canvas.height - 40;

    let hit = false;
    for (let note of this.gameState.notes) {
      if (note.active && note.track === track) {
        const diff = Math.abs(note.y - hitY);
        if (diff < 80) { // 扩大判定范围，从 50 增加到 80
          let result = diff < 30 ? 'perfect' : 'good'; // perfect 范围也稍微扩大
          this.handleNoteHit(note, result);
          note.active = false;
          hit = true;
          break;
        }
      }
    }

    if (!hit) {
      this.setData({ combo: 0 });
    }
  },

  onTrackTouchEnd(e) {
    // 处理长按结束 (这里简化只处理单击)
  },

  handleNoteHit(note, result) {
    const trackWidth = this.width / 4;
    const x = note.track * trackWidth + trackWidth / 2;

    if (result === 'miss') {
      this.setData({ combo: 0 });
    } else {
      let pts = result === 'perfect' ? 10 : 5;
      let newCombo = this.data.combo + 1;
      
      if (newCombo >= 10) pts = Math.floor(pts * 1.5);
      
      this.setData({ 
        score: this.data.score + pts,
        combo: newCombo
      });
      
      if (newCombo > this.gameState.maxCombo) {
        this.gameState.maxCombo = newCombo;
      }

      this.particleSys.emit(x, note.y, 10, { color: result === 'perfect' ? '#FFD700' : '#00FF00' });
      wx.vibrateShort();
    }
  },

  initPhase2() {
    this.setData({ phase: 2, combo: 0 });
    if (this.aniId) this.canvas.cancelAnimationFrame(this.aniId);

    const query = wx.createSelectorQuery();
    query.select('#guideCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0]) return;
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        const dpr = this.sysInfo.pixelRatio;
        canvas.width = res[0].width * dpr;
        canvas.height = res[0].height * dpr;
        ctx.scale(dpr, dpr);
        
        this.canvas = canvas;
        this.ctx = ctx;
        this.particleSys = new ParticleSys(this.width, this.height);
        this.lastTime = Date.now();
        this.gameLoopPhase2();
      });
  },

  gameLoopPhase2() {
    if (!this.gameState.isPlaying || this.data.phase !== 2) return;
    
    const now = Date.now();
    const dt = now - this.lastTime;
    this.lastTime = now;

    this.updatePhase2(dt);
    this.drawPhase2();

    this.aniId = this.canvas.requestAnimationFrame(this.gameLoopPhase2.bind(this));
  },

  updatePhase2(dt) {
    this.gameState.lastObstacleTime += dt;
    if (this.gameState.lastObstacleTime > 1500) {
      this.gameState.lastObstacleTime = 0;
      this.gameState.obstacles.push({
        x: Math.random() * (this.width - 40),
        y: -40,
        width: 40,
        height: 40,
        type: Math.random() > 0.5 ? 'crowd' : 'firecracker'
      });
    }

    // 玩家移动
    const dx = this.player.targetX - this.player.x;
    const dy = this.player.targetY - this.player.y;
    this.player.x += dx * 0.1 * this.player.speedMulti;
    this.player.y += dy * 0.1 * this.player.speedMulti;

    this.player.speedMulti = 1; // 默认恢复

    for (let i = this.gameState.obstacles.length - 1; i >= 0; i--) {
      let obs = this.gameState.obstacles[i];
      obs.y += 3;

      // 碰撞
      if (this.checkCollision(this.player, obs)) {
        if (obs.type === 'crowd') {
          this.player.speedMulti = 0.5; // 减速
        } else if (obs.type === 'firecracker') {
          this.setData({ score: Math.max(0, this.data.score - 8) });
          wx.vibrateShort();
          this.particleSys.emit(obs.x + 20, obs.y + 20, 10, { color: '#FF0000' });
          this.gameState.obstacles.splice(i, 1);
          continue;
        }
      }

      if (obs.y > this.height) {
        this.gameState.obstacles.splice(i, 1);
      }
    }

    this.particleSys.update();
  },

  drawPhase2() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    for (let obs of this.gameState.obstacles) {
      ctx.fillStyle = obs.type === 'crowd' ? 'rgba(0,0,255,0.5)' : '#ff0000';
      ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
      if (obs.type === 'firecracker') {
        ctx.fillStyle = '#fff';
        ctx.fillText('爆', obs.x + 10, obs.y + 25);
      }
    }

    // 玩家神像
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(this.player.x, this.player.y, this.player.width/2, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = '#DAA520';
    ctx.lineWidth = 3;
    ctx.stroke();

    this.particleSys.draw(ctx);
  },

  onGuideTouchStart(e) {
    if (this.data.phase !== 2) return;
    const touch = e.touches[0];
    this.player.targetX = touch.clientX;
    this.player.targetY = touch.clientY;
  },

  onGuideTouchMove(e) {
    if (this.data.phase !== 2) return;
    const touch = e.touches[0];
    this.player.targetX = touch.clientX;
    this.player.targetY = touch.clientY;
  },

  onGuideTouchEnd(e) {},

  checkCollision(rect1, rect2) {
    const r1x = rect1.x - rect1.width/2;
    const r1y = rect1.y - rect1.height/2;
    return (
      r1x < rect2.x + rect2.width &&
      r1x + rect1.width > rect2.x &&
      r1y < rect2.y + rect2.height &&
      r1y + rect1.height > rect2.y
    );
  },

  endGame() {
    this.gameState.isPlaying = false;
    clearInterval(this.timerId);
    if (this.aniId) this.canvas.cancelAnimationFrame(this.aniId);
    
    StorageMgr.updateChapterData('ch5', {
      score: this.data.score,
      played: true,
      maxCombo: this.gameState.maxCombo
    });

    AchievementMgr.checkAndUnlock('ch5', { maxCombo: this.gameState.maxCombo });
    
    let stars = 1;
    let comment = "老艺人摇摇头：'没事没事，这鼓可不是一天两天能学会的！'";
    if (this.data.score >= 300) {
      stars = 3;
      comment = "老艺人竖起大拇指：'可以啊小伙子！有天赋！来跟我学鼓吧！'";
    } else if (this.data.score >= 150) {
      stars = 2;
      comment = "老艺人点头：'马马虎虎，多练练就好了！'";
    }

    this.setData({
      showResult: true,
      stars,
      npcComment: comment
    });
  },

  onNext() {
    wx.navigateBack();
  }
});
