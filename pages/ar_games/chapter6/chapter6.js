import StorageMgr from '../../../utils/ar_games/StorageMgr.js';
import AchievementMgr from '../../../utils/ar_games/AchievementMgr.js';

Page({
  data: {
    score: 0,
    timeLeft: 60,
    collectedCount: 0,
    fragments: [
      { id: 1, name: '海上孤舟', chapter: 1, desc: '前面就是福州了……', x: 10, y: 80, collected: false },
      { id: 2, name: '初抵村口', chapter: 1, desc: '此处山水相依，倒是个安身之所。', x: 20, y: 70, collected: false },
      { id: 3, name: '尚书里牌', chapter: 2, desc: '一门三代，五尚书……', x: 30, y: 60, collected: false },
      { id: 4, name: '元宵分米', chapter: 2, desc: '每年都分米纪念……', x: 40, y: 55, collected: false },
      { id: 5, name: '濂江书院', chapter: 3, desc: '格物致知——探究万物，获得真知。', x: 60, y: 40, collected: false },
      { id: 6, name: '知鱼乐水', chapter: 3, desc: '读书要用心体会。', x: 65, y: 45, collected: false },
      { id: 7, name: '家庙正堂', chapter: 4, desc: '做官先做人，清廉是本。', x: 80, y: 30, collected: false },
      { id: 8, name: '四知堂', chapter: 4, desc: '天知地知你知我知……', x: 85, y: 35, collected: false },
      { id: 9, name: '安南鼓声', chapter: 5, desc: '咚咚咚——像不像战鼓？', x: 50, y: 20, collected: false },
      { id: 10, name: '游神巡行', chapter: 5, desc: '抬着泰山神像巡游！', x: 40, y: 25, collected: false },
      { id: 11, name: '平山堂', chapter: 6, desc: '皇兄一直在平山堂等你。', x: 70, y: 15, collected: false },
      { id: 12, name: '进士牌坊', chapter: 6, desc: '帝踪已远·故事由你续写', x: 90, y: 10, collected: false }
    ],
    showFragmentDetail: false,
    currentFragment: null,
    showFinalResult: false,
    globalData: null,
    showTutorial: true,
    countdown: 0,
    randomEventHint: '',
    highlightIndex: -1
  },

  onLoad() {
    this.setData({
      globalData: StorageMgr.getData().global
    });
    this.gameState = {
      isPlaying: false,
      timeElapsed: 0,
      nextEventTime: 8000
    };
  },

  onUnload() {
    this.gameState.isPlaying = false;
    if (this.timerId) clearInterval(this.timerId);
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
    this.startTimer();
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

      if (timeLeft <= 0) {
        this.triggerEndGame();
      }
    }, 1000);
  },

  triggerRandomEvent() {
    const uncollected = this.data.fragments.map((f, i) => f.collected ? -1 : i).filter(i => i !== -1);
    if (uncollected.length === 0) return;

    const events = [
      { name: '记忆闪回：提示一个碎片', action: () => {
        const targetIdx = uncollected[Math.floor(Math.random() * uncollected.length)];
        this.setData({ highlightIndex: targetIdx });
        setTimeout(() => this.setData({ highlightIndex: -1 }), 2000);
      }}
    ];

    const event = events[Math.floor(Math.random() * events.length)];
    event.action();
    this.setData({ randomEventHint: event.name });
    setTimeout(() => this.setData({ randomEventHint: '' }), 2000);
    this.gameState.nextEventTime = this.gameState.timeElapsed * 1000 + 12000;
  },

  onTapFragment(e) {
    if (!this.gameState.isPlaying) return;
    const index = e.currentTarget.dataset.index;
    const fragment = this.data.fragments[index];
    
    if (fragment.collected) return;

    wx.vibrateShort();

    this.setData({
      [`fragments[${index}].collected`]: true,
      collectedCount: this.data.collectedCount + 1,
      score: this.data.score + 5,
      showFragmentDetail: true,
      currentFragment: fragment
    });

    // 检查同章节收集奖励
    const chFragments = this.data.fragments.filter(f => f.chapter === fragment.chapter);
    const allChCollected = chFragments.every(f => f.collected);
    if (allChCollected) {
      this.setData({ score: this.data.score + 20 });
    }
  },

  onCloseDetail() {
    this.setData({ showFragmentDetail: false });

    if (this.data.collectedCount === 12) {
      this.triggerEndGame();
    }
  },

  triggerEndGame() {
    StorageMgr.updateChapterData('ch6', {
      score: this.data.score,
      played: true,
      fragmentsCollected: this.data.collectedCount
    });

    // 先检查称号（因为里面有全收集判定）
    AchievementMgr.checkAndUnlock('ch6', {});
    
    // 更新最新数据
    const data = StorageMgr.getData();
    
    this.setData({
      globalData: data.global,
      showFinalResult: true
    });
  },

  onShare() {
    wx.showToast({
      title: '生成海报中...',
      icon: 'loading',
      duration: 1000
    });
    setTimeout(() => {
      wx.showToast({
        title: '已保存到相册',
        icon: 'success'
      });
    }, 1000);
  },

  onNext() {
    wx.navigateBack({ delta: 99 });
  }
});
