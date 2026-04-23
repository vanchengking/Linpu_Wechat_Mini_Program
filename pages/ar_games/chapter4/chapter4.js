import StorageMgr from '../../../utils/ar_games/StorageMgr.js';
import AchievementMgr from '../../../utils/ar_games/AchievementMgr.js';

Page({
  data: {
    score: 0,
    timeLeft: 60, // 调整为 60s
    phase: 1,
    showResult: false,
    showTutorial: true,
    countdown: 0,
    resultTitle: '家谱荣光',
    stars: 0,
    npcComment: '',
    fragmentName: '「林氏友人」徽章碎片',
    randomEventHint: '',

    // 阶段一：连线
    names: [],
    descs: [],
    lines: [],
    currentLine: null,

    // 阶段二：翻牌
    cards: [],
    flipCount: 0
  },

  onLoad() {
    this.sysInfo = wx.getSystemInfoSync();
    this.width = this.sysInfo.windowWidth;
    this.height = this.sysInfo.windowHeight;
    
    this.gameState = {
      isPlaying: false,
      timeElapsed: 0,
      linesCorrect: 0,
      pairsCorrect: 0,
      nextEventTime: 8000
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
    // 重新获取节点坐标，确保布局稳定后坐标准确
    this.getNodeRects();
    this.startTimer();
    if (this.ctx) this.drawLines();
  },

  startTimer() {
    this.timerId = setInterval(() => {
      if (!this.gameState.isPlaying) return;
      this.gameState.timeElapsed++;
      const timeLeft = Math.max(0, 60 - this.gameState.timeElapsed);
      this.setData({ timeLeft });

      // 随机事件 (仅在翻牌阶段增加趣味)
      if (this.data.phase === 2 && this.gameState.timeElapsed * 1000 > this.gameState.nextEventTime) {
        this.triggerRandomEvent();
      }

      if (timeLeft <= 0) {
        this.endGame();
      }
    }, 1000);
  },

  triggerRandomEvent() {
    const events = [
      { name: '祖先庇佑：自动翻开一对', action: () => {
        const unMatched = this.data.cards.filter(c => !c.matched);
        if (unMatched.length >= 2) {
          const targetId = unMatched[0].id;
          const indices = this.data.cards.map((c, i) => c.id === targetId ? i : -1).filter(i => i !== -1);
          this.setData({
            [`cards[${indices[0]}].matched`]: true,
            [`cards[${indices[0]}].flipped`]: true,
            [`cards[${indices[1]}].matched`]: true,
            [`cards[${indices[1]}].flipped`]: true,
            score: this.data.score + 10
          });
          this.gameState.pairsCorrect++;
          if (this.gameState.pairsCorrect === 4) setTimeout(() => this.endGame(), 500);
        }
      }},
      { name: '灵光一闪：查看所有卡片1秒', action: () => {
        const oldCards = [...this.data.cards];
        const flippedCards = oldCards.map(c => ({...c, flipped: true}));
        this.setData({ cards: flippedCards });
        setTimeout(() => {
          const restoredCards = this.data.cards.map(c => c.matched ? c : {...c, flipped: false});
          this.setData({ cards: restoredCards });
        }, 1000);
      }}
    ];

    const event = events[Math.floor(Math.random() * events.length)];
    event.action();
    this.setData({ randomEventHint: event.name });
    setTimeout(() => this.setData({ randomEventHint: '' }), 2000);
    this.gameState.nextEventTime = this.gameState.timeElapsed * 1000 + 15000;
  },

  initPhase1() {
    const rawData = [
      { id: 1, n: '林元美', d: '林氏兴盛之基，追赠尚书' },
      { id: 2, n: '林瀚', d: '南京兵部尚书，创办"四知堂"' },
      { id: 3, n: '林庭㭿', d: '礼部尚书，翰林院侍读学士' },
      { id: 4, n: '林庭机', d: '工部尚书，林瀚次子' },
      { id: 5, n: '林燫', d: '礼部侍郎，林庭机之子' }
    ];

    const names = rawData.map(r => ({ id: r.id, text: r.n, matched: false }));
    const descs = rawData.map(r => ({ id: r.id, text: r.d, matched: false }));
    
    // shuffle descs
    for (let i = descs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [descs[i], descs[j]] = [descs[j], descs[i]];
    }

    this.setData({ names, descs }, () => {
      // 获取节点坐标用于连线判定
      this.getNodeRects();
    });

    const query = wx.createSelectorQuery();
    query.select('#lineCanvas')
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
        this.drawLines();
      });
  },

  getNodeRects() {
    const query = wx.createSelectorQuery();
    query.selectAll('.name-item').boundingClientRect();
    query.selectAll('.desc-item').boundingClientRect();
    query.exec(res => {
      this.nameNodes = res[0];
      this.descNodes = res[1];
    });
  },

  onLineTouchStart(e) {
    if (this.data.phase !== 1) return;
    const touch = e.touches[0];
    
    // 重新刷新节点坐标（防止布局变化后坐标过期）
    if (!this.nameNodes || !this.nameNodes.length) {
      this.getNodeRects();
      return;
    }

    // 查找点击了哪个 name-item（整个文字框区域，含 8px buffer）
    let startIndex = -1;
    const HIT_BUFFER = 8; // px，扩大点击容忍区域

    for (let i = 0; i < this.nameNodes.length; i++) {
      const node = this.nameNodes[i];
      if (touch.clientY >= node.top - HIT_BUFFER && touch.clientY <= node.bottom + HIT_BUFFER &&
          touch.clientX >= node.left - HIT_BUFFER && touch.clientX <= node.right + HIT_BUFFER) {
        if (!this.data.names[i].matched) {
          startIndex = i;
          break;
        }
      }
    }

    if (startIndex !== -1) {
      this.setData({
        currentLine: {
          startX: this.nameNodes[startIndex].right,
          startY: this.nameNodes[startIndex].top + this.nameNodes[startIndex].height / 2,
          endX: touch.clientX,
          endY: touch.clientY,
          startId: this.data.names[startIndex].id,
          startIndex
        }
      });
    }
  },

  onLineTouchMove(e) {
    if (!this.data.currentLine) return;
    const touch = e.touches[0];
    this.setData({
      ['currentLine.endX']: touch.clientX,
      ['currentLine.endY']: touch.clientY
    });
  },

  onLineTouchEnd(e) {
    if (!this.data.currentLine) return;
    
    const touch = e.changedTouches[0];
    let endIndex = -1;
    const HIT_BUFFER = 8; // px，扩大落点容忍区域
    
    for (let i = 0; i < this.descNodes.length; i++) {
      const node = this.descNodes[i];
      if (touch.clientY >= node.top - HIT_BUFFER && touch.clientY <= node.bottom + HIT_BUFFER &&
          touch.clientX >= node.left - HIT_BUFFER && touch.clientX <= node.right + HIT_BUFFER) {
        if (!this.data.descs[i].matched) {
          endIndex = i;
          break;
        }
      }
    }

    if (endIndex !== -1) {
      const descId = this.data.descs[endIndex].id;
      if (descId === this.data.currentLine.startId) {
        // 匹配成功
        const newLine = {
          startX: this.data.currentLine.startX,
          startY: this.data.currentLine.startY,
          endX: this.descNodes[endIndex].left,
          endY: this.descNodes[endIndex].top + this.descNodes[endIndex].height/2,
        };
        
        this.setData({
          lines: [...this.data.lines, newLine],
          [`names[${this.data.currentLine.startIndex}].matched`]: true,
          [`descs[${endIndex}].matched`]: true,
          currentLine: null,
          score: this.data.score + 15
        });
        
        this.gameState.linesCorrect++;
        wx.vibrateShort();

        if (this.gameState.linesCorrect === 5) {
          setTimeout(() => {
            this.initPhase2();
          }, 1000);
        }
      } else {
        // 匹配失败
        this.setData({ currentLine: null, score: Math.max(0, this.data.score - 3) });
      }
    } else {
      this.setData({ currentLine: null });
    }
  },

  drawLines() {
    if (!this.gameState.isPlaying || this.data.phase !== 1) return;
    
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);
    
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    
    // 绘制已完成的线
    ctx.strokeStyle = '#4caf50';
    for (let line of this.data.lines) {
      ctx.beginPath();
      ctx.moveTo(line.startX, line.startY);
      ctx.lineTo(line.endX, line.endY);
      ctx.stroke();
    }

    // 绘制当前正在拖拽的线
    if (this.data.currentLine) {
      ctx.strokeStyle = '#8b4513';
      ctx.beginPath();
      ctx.moveTo(this.data.currentLine.startX, this.data.currentLine.startY);
      ctx.lineTo(this.data.currentLine.endX, this.data.currentLine.endY);
      ctx.stroke();
    }

    this.aniId = this.canvas.requestAnimationFrame(this.drawLines.bind(this));
  },

  initPhase2() {
    this.setData({ phase: 2 });
    
    const texts = ['养正心', '崇正道', '务正学', '亲正人'];
    let rawCards = [];
    for (let t of texts) {
      rawCards.push({ id: t, text: t, flipped: false, matched: false });
      rawCards.push({ id: t, text: t, flipped: false, matched: false });
    }
    
    // shuffle
    for (let i = rawCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rawCards[i], rawCards[j]] = [rawCards[j], rawCards[i]];
    }

    this.setData({ cards: rawCards });
    this.flippedIndices = [];
  },

  onFlipCard(e) {
    if (this.data.phase !== 2) return;
    const idx = e.currentTarget.dataset.index;
    const card = this.data.cards[idx];
    
    if (card.flipped || card.matched || this.flippedIndices.length >= 2) return;

    this.setData({
      [`cards[${idx}].flipped`]: true,
      flipCount: this.data.flipCount + 1
    });

    this.flippedIndices.push(idx);

    if (this.flippedIndices.length === 2) {
      const idx1 = this.flippedIndices[0];
      const idx2 = this.flippedIndices[1];
      const card1 = this.data.cards[idx1];
      const card2 = this.data.cards[idx2];

      if (card1.id === card2.id) {
        // match
        setTimeout(() => {
          this.setData({
            [`cards[${idx1}].matched`]: true,
            [`cards[${idx2}].matched`]: true
          });
          this.flippedIndices = [];
          this.gameState.pairsCorrect++;
          
          let points = Math.max(2, 10 - this.data.flipCount * 0.5);
          this.setData({ score: this.data.score + points });
          wx.vibrateShort();

          if (this.gameState.pairsCorrect === 4) {
            setTimeout(() => this.endGame(), 500);
          }
        }, 500);
      } else {
        // not match
        setTimeout(() => {
          this.setData({
            [`cards[${idx1}].flipped`]: false,
            [`cards[${idx2}].flipped`]: false
          });
          this.flippedIndices = [];
        }, 1000);
      }
    }
  },

  endGame() {
    this.gameState.isPlaying = false;
    clearInterval(this.timerId);
    
    StorageMgr.updateChapterData('ch4', {
      score: this.data.score,
      played: true,
      linesCorrect: this.gameState.linesCorrect,
      pairsCorrect: this.gameState.pairsCorrect
    });

    AchievementMgr.checkAndUnlock('ch4', { linesCorrect: this.gameState.linesCorrect });
    
    let stars = 1;
    let comment = "尚书伯：'尚需多了解我林氏家史。'";
    if (this.data.score >= 100) {
      stars = 3;
      comment = "尚书伯抚须大笑：'看来你对我林氏家史已了如指掌！'";
    } else if (this.data.score >= 60) {
      stars = 2;
      comment = "尚书伯点头：'看来你对我林氏家史已略知一二。'";
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
