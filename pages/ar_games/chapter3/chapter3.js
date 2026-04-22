import StorageMgr from '../../../utils/ar_games/StorageMgr.js';
import AchievementMgr from '../../../utils/ar_games/AchievementMgr.js';

Page({
  data: {
    score: 0,
    timeLeft: 60, // 调整为 60s
    showResult: false,
    phase: 1, 
    currentWord: null,
    targetWords: ['濂', '浦', '書', '院', '榭'], // 减少词量
    quizQuestions: [ // 减少题量
      { q: "濂江书院之名，'濂'字取自哪位先贤？", a: ['周敦颐', '张载', '程颢', '陆九渊'], correct: 0, explanation: '周敦颐，号濂溪，朱熹以此纪念先贤。' },
      { q: "'格物致知'出自哪部经典？", a: ['论语', '孟子', '大学', '中庸'], correct: 2, explanation: '出自《大学》，意为探究事物原理而获得知识。' }
    ],
    currentQuizIndex: 0,
    showTutorial: true,
    countdown: 0,
    resultTitle: '格物致知',
    stars: 0,
    npcComment: '',
    fragmentName: '「书院学子」徽章',
    randomEventHint: ''
  },

  onLoad() {
    this.sysInfo = wx.getSystemInfoSync();
    
    this.gameState = {
      isPlaying: false,
      timeElapsed: 0,
      quizCorrect: 0,
      wordIndex: 0,
      quizIndex: 0,
      words: [
        { char: '濂', slots: [{filled: false, char: '氵'}, {filled: false, char: '廉'}], parts: ['氵', '廉', '木', '口'] },
        { char: '浦', slots: [{filled: false, char: '氵'}, {filled: false, char: '甫'}], parts: ['氵', '甫', '辶', '寸'] },
        { char: '書', slots: [{filled: false, char: '聿'}, {filled: false, char: '曰'}], parts: ['聿', '曰', '日', '土'] }
      ],
      quizzes: [
        { q: "濂江书院之名，'濂'字取自哪位先贤？", options: ["周敦颐", "张载", "程颢", "陆九渊"], a: 0 },
        { q: "'格物致知'出自哪部经典？", options: ["《论语》", "《孟子》", "《大学》", "《中庸》"], a: 2 },
        { q: "林浦'三代五尚书'中第一位尚书是谁？", options: ["林瀚", "林元美", "林庭㭿", "林燫"], a: 0 },
        { q: "照壁上'文光射斗'的寓意是？", options: ["文章光芒照亮星斗", "文武双全", "科举及第", "书香门第"], a: 0 }
      ]
    };

    this.dragTarget = -1;
  },

  onUnload() {
    this.gameState.isPlaying = false;
    clearInterval(this.timerId);
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
    this.initWord();
    this.startTimer();
  },

  startTimer() {
    this.timerId = setInterval(() => {
      if (!this.gameState.isPlaying) return;
      const newTime = this.data.timeLeft - 1;
      this.setData({ timeLeft: newTime });
      
      // 随机先贤指引 (仅在拼字阶段)
      if (this.data.phase === 1 && newTime % 15 === 0) {
        this.triggerRandomHint();
      }

      if (newTime <= 0) {
        this.endGame();
      }
    }, 1000);
  },

  triggerRandomHint() {
    const hints = ['朱熹：格物致知，方能得真意。', '朱熹：观察偏旁，自有逻辑。', '朱熹：静心思考，不可急躁。'];
    const hint = hints[Math.floor(Math.random() * hints.length)];
    this.setData({ randomEventHint: hint });
    setTimeout(() => this.setData({ randomEventHint: '' }), 3000);
  },

  initWord() {
    if (this.gameState.wordIndex >= this.gameState.words.length) {
      // 拼字结束，进入答题
      this.setData({ phase: 2 });
      this.initQuiz();
      return;
    }

    const word = this.gameState.words[this.gameState.wordIndex];
    
    // 随机散落偏旁
    const parts = word.parts.map(char => ({
      char,
      used: false,
      x: 40 + Math.random() * (this.sysInfo.windowWidth - 80),
      y: 400 + Math.random() * 150
    }));

    this.setData({
      currentWord: {
        char: word.char,
        slots: word.slots.map(s => ({ filled: false, filledChar: '' }))
      },
      parts
    });
  },

  onPartTouchStart(e) {
    if (this.data.phase !== 1) return;
    const idx = e.currentTarget.dataset.index;
    this.dragTarget = idx;
  },

  onPartTouchMove(e) {
    if (this.dragTarget === -1) return;
    const touch = e.touches[0];
    const parts = this.data.parts;
    parts[this.dragTarget].x = touch.clientX;
    parts[this.dragTarget].y = touch.clientY;
    this.setData({ parts });
  },

  onPartTouchEnd(e) {
    if (this.dragTarget === -1) return;
    
    const part = this.data.parts[this.dragTarget];
    const word = this.gameState.words[this.gameState.wordIndex];
    const slots = this.data.currentWord.slots;
    
    // 简单检查是否拖到了组合区 (屏幕中央)
    const centerX = this.sysInfo.windowWidth / 2;
    const centerY = 220; // 组合区大概位置
    
    if (Math.abs(part.x - centerX) < 100 && Math.abs(part.y - centerY) < 100) {
      // 检查是否匹配空槽
      let matched = false;
      for (let i = 0; i < word.slots.length; i++) {
        if (!slots[i].filled && word.slots[i].char === part.char) {
          slots[i].filled = true;
          slots[i].filledChar = part.char;
          part.used = true;
          matched = true;
          wx.vibrateShort();
          break;
        }
      }
      
      if (matched) {
        this.setData({
          ['currentWord.slots']: slots,
          [`parts[${this.dragTarget}].used`]: true
        });
        
        // 检查是否拼完
        if (slots.every(s => s.filled)) {
          this.setData({ score: this.data.score + 20 });
          this.gameState.wordIndex++;
          setTimeout(() => {
            this.initWord();
          }, 800);
        }
      }
    }
    
    this.dragTarget = -1;
  },

  initQuiz() {
    if (this.gameState.quizIndex >= this.gameState.quizzes.length) {
      this.endGame();
      return;
    }
    
    this.setData({
      currentQuiz: this.gameState.quizzes[this.gameState.quizIndex],
      selectedOption: -1,
      showAnswer: false
    });
  },

  onSelectOption(e) {
    if (this.data.selectedOption !== -1) return; // 已经答过

    const idx = e.currentTarget.dataset.index;
    const isCorrect = idx === this.data.currentQuiz.a;
    
    this.setData({
      selectedOption: idx,
      showAnswer: true
    });

    if (isCorrect) {
      this.setData({ score: this.data.score + 25 });
      this.gameState.quizCorrect++;
      wx.vibrateShort();
    }

    setTimeout(() => {
      this.gameState.quizIndex++;
      this.initQuiz();
    }, 1500);
  },

  endGame() {
    this.gameState.isPlaying = false;
    if (this.timerId) clearInterval(this.timerId);
    
    StorageMgr.updateChapterData('ch3', {
      score: this.data.score,
      played: true,
      quizCorrect: this.gameState.quizCorrect
    });

    AchievementMgr.checkAndUnlock('ch3', { score: this.data.score });
    
    let stars = 1;
    if (this.data.score >= 100) stars = 3;
    else if (this.data.score >= 60) stars = 2;

    this.setData({
      showResult: true,
      stars,
      npcComment: this.data.score >= 100 ? "朱熹：孺子可教也，格物之深，令老夫欣慰。" : "朱熹：勤能补拙，多读几遍便是，学问之道在于积累。"
    });
  },

  onNext() {
    wx.navigateBack();
  }
});
