import StorageMgr from '../../../utils/ar_games/StorageMgr.js';
import AchievementMgr from '../../../utils/ar_games/AchievementMgr.js';
import ParticleSys from '../../../utils/ar_games/ParticleSys.js';

Page({
  data: {
    score: 0,
    combo: 0,
    timeLeft: 60, // 缩短为 60s
    showResult: false,
    showTutorial: true,
    countdown: 0,
    resultTitle: '分米传情',
    stars: 0,
    npcComment: '',
    fragmentName: '「民俗体验家」徽章碎片①',
    randomEventHint: '' // 随机事件提示
  },

  onLoad() {
    this.sysInfo = wx.getSystemInfoSync();
    this.width = this.sysInfo.windowWidth;
    this.height = this.sysInfo.windowHeight;
    
    this.gameState = {
      isPlaying: false,
      timeElapsed: 0,
      phase: 1, 
      items: [],
      lastSpawn: 0,
      combo: 0,
      riceKg: 0,
      multiplier: 1,
      multiplierTimer: 0,
      windX: 0, // 随机事件：乱风影响
      nextEventTime: 5000
    };

    // 簸箕
    this.basket = {
      x: this.width / 2,
      y: this.height - 100,
      width: 100,
      height: 40,
      targetX: this.width / 2
    };

    this.lastTime = 0;
    this.lastTapTime = 0;
    this.initCanvas();
  },

  onUnload() {
    this.gameState.isPlaying = false;
    if (this.aniId) {
      this.canvas.cancelAnimationFrame(this.aniId);
    }
  },

  initCanvas() {
    const query = wx.createSelectorQuery();
    query.select('#gameCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        
        const dpr = this.sysInfo.pixelRatio;
        canvas.width = res[0].width * dpr;
        canvas.height = res[0].height * dpr;
        ctx.scale(dpr, dpr);
        
        this.canvas = canvas;
        this.ctx = ctx;
        this.particleSys = new ParticleSys(this.width, this.height);
        
        // 不再立即开始，等待引导点击
        this.drawInitialFrame();
      });
  },

  drawInitialFrame() {
    const ctx = this.ctx;
    if (!ctx) return;
    ctx.clearRect(0, 0, this.width, this.height);
    this.drawBasket(ctx);
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
    this.gameLoop();
  },

  spawnItem(dt) {
    this.gameState.lastSpawn += dt;
    
    let spawnInterval = 1000;
    let dirs = 1;
    let goldChance = 0;

    if (this.gameState.phase === 1) {
      spawnInterval = 1500;
    } else if (this.gameState.phase === 2) {
      spawnInterval = 800;
      dirs = 3;
      goldChance = 0.1;
    } else if (this.gameState.phase === 3) {
      spawnInterval = 500;
      dirs = 5;
      goldChance = 0.2;
    } else if (this.gameState.phase === 4) {
      spawnInterval = 200;
      dirs = 5;
      goldChance = 0;
    }

    if (this.gameState.lastSpawn < spawnInterval) return;
    this.gameState.lastSpawn = 0;

    if (this.gameState.phase === 4) {
      // 满屏福米
      for(let i=0; i<3; i++){
        this.gameState.items.push({
          type: 'bless',
          x: Math.random() * this.width,
          y: -20,
          vx: (Math.random() - 0.5) * 2,
          vy: 2 + Math.random() * 2,
          width: 15,
          height: 15
        });
      }
      return;
    }

    // 决定出生点和方向
    const segment = this.width / dirs;
    const dirIdx = Math.floor(Math.random() * dirs);
    const startX = segment * dirIdx + segment / 2;
    
    // 目标落点尽量在屏幕范围内
    const targetX = Math.random() * (this.width - 40) + 20;
    const targetY = this.basket.y;
    
    const vy = this.gameState.phase === 3 ? 5 : 4;
    const timeToReach = (targetY - (-20)) / vy;
    const vx = (targetX - startX) / timeToReach;

    this.gameState.items.push({
      type: Math.random() < goldChance ? 'gold' : 'normal',
      x: startX,
      y: -20,
      vx,
      vy,
      width: 20,
      height: 30,
      doubleTapTime: 0, // 双击判定计时
      isGold: Math.random() < goldChance
    });
  },

  updateLogic(dt) {
    if (!this.gameState.isPlaying) return;

    this.gameState.timeElapsed += dt;
    const elapsedSec = this.gameState.timeElapsed / 1000;
    
    const totalDuration = 60; // 调整为 60s
    const timeLeft = Math.max(0, totalDuration - Math.floor(elapsedSec));
    
    // 随机事件
    if (this.gameState.timeElapsed > this.gameState.nextEventTime) {
      this.triggerRandomEvent();
    }
    
    // 风力衰减
    if (this.gameState.windX !== 0) {
      this.gameState.windX *= 0.95;
    }

    if (this.data.timeLeft !== timeLeft) {
      this.setData({ timeLeft });
    }

    // 阶段切换 (60s 版)
    if (elapsedSec < 15) this.gameState.phase = 1;
    else if (elapsedSec < 35) this.gameState.phase = 2;
    else if (elapsedSec < 50) this.gameState.phase = 3;
    else if (elapsedSec < 60) this.gameState.phase = 4;
    else {
      this.endGame();
      return;
    }

    // 连击翻倍计时
    if (this.gameState.multiplierTimer > 0) {
      this.gameState.multiplierTimer -= dt;
      if (this.gameState.multiplierTimer <= 0) {
        this.gameState.multiplier = 1;
      }
    }

    // 簸箕移动
    this.basket.x += (this.basket.targetX - this.basket.x) * 0.3;
    this.basket.x = Math.max(this.basket.width/2, Math.min(this.width - this.basket.width/2, this.basket.x));

    this.spawnItem(dt);

    for (let i = this.gameState.items.length - 1; i >= 0; i--) {
      let item = this.gameState.items[i];
      item.x += item.vx + this.gameState.windX; // 受风力影响
      item.y += item.vy;

      if (item.type === 'bless') {
        if (item.y > this.height) {
          this.gameState.items.splice(i, 1);
        }
        continue;
      }

      // 碰撞检测
      if (item.y + item.height > this.basket.y && item.y < this.basket.y + this.basket.height) {
        if (item.x + item.width > this.basket.x - this.basket.width/2 && 
            item.x < this.basket.x + this.basket.width/2) {
          
          if (item.isGold) {
            // 金色米需要双击，否则视为漏接
            if (item.doubleTapTime > 0) {
              this.catchItem(item);
              this.gameState.items.splice(i, 1);
            }
          } else {
            this.catchItem(item);
            this.gameState.items.splice(i, 1);
          }
          continue;
        }
      }

      if (item.y > this.height) {
        this.missItem(item);
        this.gameState.items.splice(i, 1);
      }
    }

    this.particleSys.update();
  },

  catchItem(item) {
    this.gameState.combo++;
    if (this.gameState.combo >= 10 && this.gameState.multiplier === 1) {
      this.gameState.multiplier = 2;
      this.gameState.multiplierTimer = 5000;
    }
    
    let points = item.isGold ? 15 : 5;
    points *= this.gameState.multiplier;
    
    this.setData({ 
      score: this.data.score + points,
      combo: this.gameState.combo
    });
    this.gameState.riceKg += points * 0.1; // 积分换算斤数

    this.particleSys.emit(item.x, item.y, 5, {color: item.isGold ? '#FFD700' : '#FFF8DC'});
  },

  missItem(item) {
    if (item.isGold) {
      this.setData({ score: Math.max(0, this.data.score - 5) });
    }
    this.gameState.combo = 0;
    this.gameState.multiplier = 1;
    this.setData({ combo: 0 });
  },

  drawCanvas() {
    const ctx = this.ctx;
    if (!ctx) return;

    // 背景清空（现在有图片背景了，Canvas可以设为透明或只画物品）
    ctx.clearRect(0, 0, this.width, this.height);

    // 簸箕
    this.drawBasket(ctx);

    // 物品
    for (let item of this.gameState.items) {
      if (item.type === 'bless') {
        ctx.fillStyle = '#FF6347'; // 福字颜色
        ctx.font = '12px Arial';
        ctx.fillText('福', item.x, item.y);
      } else {
        ctx.fillStyle = item.isGold ? '#FFD700' : '#FFF8DC';
        ctx.beginPath();
        ctx.ellipse(item.x, item.y, item.width/2, item.height/2, 0, 0, Math.PI*2);
        ctx.fill();
        ctx.stroke();
        
        // 预测线
        if (item.y < this.basket.y - 100 && !item.isGold) {
          ctx.strokeStyle = 'rgba(139, 69, 19, 0.2)';
          ctx.setLineDash([5, 5]);
          ctx.beginPath();
          ctx.moveTo(item.x, item.y);
          // 预测落点
          const time = (this.basket.y - item.y) / item.vy;
          ctx.lineTo(item.x + item.vx * time, this.basket.y);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }
    }

    this.particleSys.draw(ctx);
  },

  gameLoop() {
    if (!this.gameState.isPlaying) return;
    
    const now = Date.now();
    const dt = now - this.lastTime;
    this.lastTime = now;

    this.updateLogic(dt);
    this.drawCanvas();

    this.aniId = this.canvas.requestAnimationFrame(this.gameLoop.bind(this));
  },

  drawBasket(ctx) {
    ctx.save();
    // 阴影
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 5;

    ctx.fillStyle = '#D2B48C';
    ctx.beginPath();
    ctx.ellipse(this.basket.x, this.basket.y + 20, this.basket.width/2, this.basket.height/2, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // 编织纹理感
    ctx.strokeStyle = 'rgba(139, 69, 19, 0.1)';
    ctx.setLineDash([2, 4]);
    ctx.beginPath();
    ctx.ellipse(this.basket.x, this.basket.y + 20, this.basket.width/2.5, this.basket.height/2.5, 0, 0, Math.PI*2);
    ctx.stroke();
    ctx.restore();
  },

  onTouchStart(e) {
    if (!this.gameState.isPlaying) return;
    const now = Date.now();
    
    // 双击检测
    if (now - this.lastTapTime < 300) {
      this.handleDoubleTap();
    }
    this.lastTapTime = now;

    const touch = e.touches[0];
    this.basket.targetX = touch.clientX;
  },

  onTouchMove(e) {
    if (!this.gameState.isPlaying) return;
    const touch = e.touches[0];
    this.basket.targetX = touch.clientX;
  },

  onTouchEnd() {
    // nothing special
  },

  handleDoubleTap() {
    // 检查是否有金米在簸箕范围内
    for (let item of this.gameState.items) {
      if (item.isGold && item.y + item.height > this.basket.y - 50 && item.y < this.basket.y + this.basket.height + 50) {
        if (item.x + item.width > this.basket.x - this.basket.width && item.x < this.basket.x + this.basket.width) {
          item.doubleTapTime = 1; // 标记被双击
        }
      }
    }
  },

  endGame() {
    this.gameState.isPlaying = false;
    
    StorageMgr.updateChapterData('ch2', {
      score: this.data.score,
      played: true,
      riceKg: this.gameState.riceKg
    });

    AchievementMgr.checkAndUnlock('ch2', { riceKg: this.gameState.riceKg });
    
    let stars = 1;
    if (this.gameState.riceKg > 80) stars = 3;
    else if (this.gameState.riceKg > 40) stars = 2;

    this.setData({
      showResult: true,
      stars,
      npcComment: `不错嘛！共分发大米 ${Math.floor(this.gameState.riceKg)} 斤，当年陈丞相分米的时候，乡亲们也是这么开心的。`
    });
  },

  onNext() {
    wx.navigateBack();
  },

  triggerRandomEvent() {
    const events = [
      { name: '一阵乱风', action: () => { this.gameState.windX = (Math.random() > 0.5 ? 2 : -2); } },
      { name: '福米降临', action: () => { 
        // 快速生成一波福米
        for(let i=0; i<8; i++) {
          this.gameState.items.push({
            type: 'bless',
            x: Math.random() * this.width,
            y: -20 - (i * 15),
            vx: (Math.random() - 0.5) * 1,
            vy: 4,
            width: 15,
            height: 15
          });
        }
      }}
    ];

    const event = events[Math.floor(Math.random() * events.length)];
    event.action();
    
    this.setData({ randomEventHint: event.name });
    setTimeout(() => this.setData({ randomEventHint: '' }), 2000);

    this.gameState.nextEventTime = this.gameState.timeElapsed + 10000 + Math.random() * 8000;
  }
});
