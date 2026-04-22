import StorageMgr from '../../../utils/ar_games/StorageMgr.js';
import AchievementMgr from '../../../utils/ar_games/AchievementMgr.js';
import ParticleSys from '../../../utils/ar_games/ParticleSys.js';

Page({
  data: {
    score: 0,
    timeLeft: 60, // 调整为 60s
    showResult: false,
    showTutorial: true,
    countdown: 0,
    enemyProgress: 0,
    resultTitle: '海路护航',
    stars: 0,
    npcComment: '',
    fragmentName: '「帝踪寻觅者」碎片②',
    randomEventHint: '' // 新增随机事件提示
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
      shipShake: 0,
      rotateTime: 0,
      windForce: 0, // 随机事件：海风力
      nextEventTime: 5000 // 下一次随机事件时间
    };

    // 小船
    this.ship = {
      x: this.width / 2,
      y: this.height - 150,
      width: 60,
      height: 100,
      targetX: this.width / 2
    };

    this.lastTime = 0;
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
        
        this.drawInitialFrame();
      });
  },

  drawInitialFrame() {
    const ctx = this.ctx;
    if (!ctx) return;
    ctx.clearRect(0, 0, this.width, this.height);
    this.drawShip(ctx);
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
    let obstacleChance = 0;

    if (this.gameState.phase === 1) {
      spawnInterval = 1200;
      obstacleChance = 0;
    } else if (this.gameState.phase === 2) {
      spawnInterval = 1000;
      obstacleChance = 0.3;
    } else if (this.gameState.phase === 3) {
      spawnInterval = 800;
      obstacleChance = 0.5;
    } else if (this.gameState.phase === 4) {
      spawnInterval = 400;
      obstacleChance = 0; // 靠岸全是庆祝物资
    }

    if (this.gameState.lastSpawn < spawnInterval) return;
    this.gameState.lastSpawn = 0;

    const typeRoll = Math.random();
    let type = 'grain'; // 粮草
    if (this.gameState.phase < 4 && typeRoll < obstacleChance) {
      type = Math.random() < 0.7 ? 'reef' : 'whirlpool'; // 暗礁或漩涡
    } else {
      type = Math.random() < 0.7 ? 'grain' : 'water'; // 粮草或淡水
    }

    this.gameState.items.push({
      type,
      x: Math.random() * (this.width - 40) + 20,
      y: -50,
      vy: 3 + (this.gameState.phase * 0.5),
      width: 40,
      height: 40
    });
  },

  updateLogic(dt) {
    if (!this.gameState.isPlaying) return;

    this.gameState.timeElapsed += dt;
    const elapsedSec = this.gameState.timeElapsed / 1000;
    
    const totalDuration = 60; // 总时长 60s
    const timeLeft = Math.max(0, totalDuration - Math.floor(elapsedSec));
    
    // 随机事件逻辑
    if (this.gameState.timeElapsed > this.gameState.nextEventTime) {
      this.triggerRandomEvent();
    }

    // 随机风力衰减
    if (this.gameState.windForce !== 0) {
      this.gameState.windForce *= 0.98;
      if (Math.abs(this.gameState.windForce) < 0.1) this.gameState.windForce = 0;
    }

    // 更新追兵进度条 (0-100%)
    const enemyProgress = Math.min(100, (elapsedSec / totalDuration) * 100);
    
    if (this.data.timeLeft !== timeLeft) {
      this.setData({ timeLeft, enemyProgress });
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

    // 状态衰减
    if (this.gameState.shipShake > 0) this.gameState.shipShake -= dt;
    if (this.gameState.rotateTime > 0) this.gameState.rotateTime -= dt;

    // 小船平滑移动 + 随机风力
    if (this.gameState.rotateTime <= 0) {
      this.ship.x += (this.ship.targetX - this.ship.x) * 0.15 + this.gameState.windForce;
    } else {
      // 漩涡中无法操控，随机晃动
      this.ship.x += Math.sin(Date.now() / 100) * 5;
    }
    this.ship.x = Math.max(this.ship.width/2, Math.min(this.width - this.ship.width/2, this.ship.x));

    this.spawnItem(dt);

    for (let i = this.gameState.items.length - 1; i >= 0; i--) {
      let item = this.gameState.items[i];
      item.y += item.vy;

      // 碰撞检测
      const dx = Math.abs(item.x - this.ship.x);
      const dy = Math.abs(item.y - this.ship.y);
      if (dx < (item.width + this.ship.width)/2.5 && dy < (item.height + this.ship.height)/2.5) {
        this.handleCollision(item);
        this.gameState.items.splice(i, 1);
        continue;
      }

      if (item.y > this.height + 50) {
        this.gameState.items.splice(i, 1);
      }
    }

    this.particleSys.update();
  },

  handleCollision(item) {
    let points = 0;
    if (item.type === 'grain') {
      points = 10;
      this.particleSys.emit(item.x, item.y, 8, {color: '#FFD700'});
    } else if (item.type === 'water') {
      points = 5;
      this.particleSys.emit(item.x, item.y, 8, {color: '#00BFFF'});
    } else if (item.type === 'reef') {
      points = -5;
      this.gameState.shipShake = 1000;
      wx.vibrateShort();
    } else if (item.type === 'whirlpool') {
      points = -10;
      this.gameState.rotateTime = 3000;
      wx.vibrateLong();
    }

    this.setData({ score: Math.max(0, this.data.score + points) });
  },

  drawCanvas() {
    const ctx = this.ctx;
    if (!ctx) return;

    ctx.clearRect(0, 0, this.width, this.height);

    // 绘制物品
    for (let item of this.gameState.items) {
      ctx.save();
      ctx.translate(item.x, item.y);
      
      if (item.type === 'grain') {
        ctx.fillStyle = '#D2691E';
        ctx.fillRect(-15, -15, 30, 30);
        ctx.strokeStyle = '#333';
        ctx.strokeRect(-15, -15, 30, 30);
      } else if (item.type === 'water') {
        ctx.fillStyle = '#00BFFF';
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (item.type === 'reef') {
        ctx.fillStyle = '#666';
        ctx.beginPath();
        ctx.moveTo(-20, 15);
        ctx.lineTo(0, -20);
        ctx.lineTo(20, 15);
        ctx.closePath();
        ctx.fill();
      } else if (item.type === 'whirlpool') {
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for(let a=0; a<Math.PI*4; a+=0.2) {
          let r = a * 3;
          ctx.lineTo(Math.cos(a + Date.now()/100) * r, Math.sin(a + Date.now()/100) * r);
        }
        ctx.stroke();
      }
      ctx.restore();
    }

    // 绘制小船
    this.drawShip(ctx);

    this.particleSys.draw(ctx);
  },

  drawShip(ctx) {
    ctx.save();
    ctx.translate(this.ship.x, this.ship.y);
    
    // 旋转效果
    if (this.gameState.rotateTime > 0) {
      ctx.rotate((Date.now() / 100) % (Math.PI * 2));
    }

    // 晃动效果
    if (this.gameState.shipShake > 0) {
      ctx.translate(Math.random()*4-2, Math.random()*4-2);
    }

    // 船体
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.moveTo(0, -50);
    ctx.quadraticCurveTo(30, -20, 30, 30);
    ctx.lineTo(-30, 30);
    ctx.quadraticCurveTo(-30, -20, 0, -50);
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 船帆
    ctx.fillStyle = '#FFFaf0';
    ctx.beginPath();
    ctx.moveTo(0, -40);
    ctx.lineTo(20, 10);
    ctx.lineTo(0, 0);
    ctx.fill();
    
    // 小人剪影
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(-5, -5, 6, 0, Math.PI*2); // 赵昰头
    ctx.arc(5, 5, 4, 0, Math.PI*2);  // 赵昺头
    ctx.fill();

    ctx.restore();
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

  onTouchStart(e) {
    if (!this.gameState.isPlaying) return;
    const touch = e.touches[0];
    this.ship.targetX = touch.clientX;
  },

  onTouchMove(e) {
    if (!this.gameState.isPlaying) return;
    const touch = e.touches[0];
    this.ship.targetX = touch.clientX;
  },

  onTouchEnd() {},

  endGame() {
    this.gameState.isPlaying = false;
    
    StorageMgr.updateChapterData('ch1', {
      score: this.data.score,
      played: true
    });

    AchievementMgr.checkAndUnlock('ch1', { score: this.data.score });
    
    let stars = 1;
    let comment = '';
    if (this.data.score > 200) {
      stars = 3;
      comment = '赵昺兴奋地跳了起来：“皇兄！好多粮食！”赵昰微笑点头：“林浦会接纳我们的。”';
    } else if (this.data.score > 100) {
      stars = 2;
      comment = '赵昰拍了拍胸口：“虽然有些惊险，但我们总算带着物资靠岸了。”';
    } else {
      stars = 1;
      comment = '赵昺缩在哥哥怀里发抖……赵昰抱紧弟弟：“别怕，虽然丢了些物资，但上岸就好了。”';
    }

    this.setData({
      showResult: true,
      stars,
      npcComment: comment
    });
  },

  onNext() {
    wx.navigateBack();
  },

  triggerRandomEvent() {
    const events = [
      { name: '突发海风', action: () => { this.gameState.windForce = (Math.random() > 0.5 ? 5 : -5); } },
      { name: '发现鱼群', action: () => { 
        // 快速生成一波物资
        for(let i=0; i<5; i++) {
          this.gameState.items.push({
            type: 'grain',
            x: Math.random() * this.width,
            y: -50 - (i * 30),
            vy: 6,
            width: 30,
            height: 30
          });
        }
      }},
      { name: '迷雾散去', action: () => { /* 仅视觉效果或暂时加速 */ } }
    ];

    const event = events[Math.floor(Math.random() * events.length)];
    event.action();
    
    this.setData({ randomEventHint: event.name });
    setTimeout(() => this.setData({ randomEventHint: '' }), 2000);

    this.gameState.nextEventTime = this.gameState.timeElapsed + 8000 + Math.random() * 7000;
  }
});