// pages/ar/ar.js
Page({
  data: {
    currentView: 'levels', // 'levels' or 'game'
    isARMode: true,
    showSuccessModal: false,
    currentLevelIndex: 0,
    currentDialogueIndex: 0,
    currentDialogue: null,
    levels: [
      {
        id: 1,
        title: '初识林浦',
        desc: '与古村长对话，了解林浦的千年历史',
        bgImage: 'https://101.34.247.48:8888/down/6g63c6V4ZamB.png',
        unlocked: true,
        completed: false,
        dialogues: [
          {
            speaker: '古村长',
            text: '欢迎来到林浦村，这里的每一块石板都诉说着千年的故事。',
            characterImage: 'https://asave.rutno.com/fileview?id=BMumLU82n7ZG', // 借用现有人物头像作为演示
            characterSide: 'center'
          },
          {
            speaker: '我',
            text: '村长好，我想了解一下这里的宋代文化。',
            characterImage: null
          },
          {
            speaker: '古村长',
            text: '那可是我们林浦的骄傲。你可知道，南宋端宗皇帝曾在此驻跸？',
            characterImage: 'https://asave.rutno.com/fileview?id=BMumLU82n7ZG',
            options: [
              { text: '略有耳闻，想听详细说说', nextId: 3 },
              { text: '第一次听说，太神奇了！', nextId: 3 }
            ]
          },
          {
            speaker: '古村长',
            text: '那是一个风云变幻的年代，林浦人民守护着大宋最后的血脉...',
            characterImage: 'https://asave.rutno.com/fileview?id=BMumLU82n7ZG'
          },
          {
            speaker: '古村长',
            text: '去走走看吧，这第一章的旅程，就从村口的石牌坊开始。',
            characterImage: 'https://asave.rutno.com/fileview?id=BMumLU82n7ZG'
          }
        ]
      },
      {
        id: 2,
        title: '书院论道',
        desc: '在濂江书院，与理学大师探讨学术',
        bgImage: 'https://asave.rutno.com/fileview?id=BMumLU82n7ZG', // 暂用
        unlocked: false,
        completed: false,
        dialogues: [
          {
            speaker: '老夫子',
            text: '濂江书院，朱子曾讲学于此，尔等后辈当勤学之。',
            characterImage: 'https://asave.rutno.com/fileview?id=BMumLU82n7ZG'
          },
          {
            speaker: '老夫子',
            text: '你可知“理”为何物？',
            characterImage: 'https://asave.rutno.com/fileview?id=BMumLU82n7ZG',
            options: [
              { text: '是万物运行的规律', nextId: 2 },
              { text: '是人心中的良知', nextId: 2 }
            ]
          },
          {
            speaker: '老夫子',
            text: '善哉，不论如何理解，求知之心不可废。',
            characterImage: 'https://asave.rutno.com/fileview?id=BMumLU82n7ZG'
          }
        ]
      },
      {
        id: 3,
        title: '泰山守护',
        desc: '在泰山宫，感受忠义之魂',
        bgImage: 'https://101.34.247.48:8888/down/6g63c6V4ZamB.png', // 暂用
        unlocked: false,
        completed: false,
        dialogues: [
          {
            speaker: '守护者',
            text: '泰山宫供奉着忠烈，见证了林浦人的骨气。',
            characterImage: 'https://asave.rutno.com/fileview?id=BMumLU82n7ZG'
          },
          {
            speaker: '守护者',
            text: '你愿意为了守护家园而付出吗？',
            characterImage: 'https://asave.rutno.com/fileview?id=BMumLU82n7ZG',
            options: [
              { text: '义不容辞！', nextId: 2 },
              { text: '尽我所能', nextId: 2 }
            ]
          },
          {
            speaker: '守护者',
            text: '林浦的精神，就交由你们传承了。',
            characterImage: 'https://asave.rutno.com/fileview?id=BMumLU82n7ZG'
          }
        ]
      }
    ]
  },

  onShow() {
    // 加载进度
    const progress = wx.getStorageSync('ar_game_progress_v2');
    if (progress) {
      this.setData({ levels: progress });
    }

    // 每次进入页面时，如果是在关卡选择界面，则自动进入第一关
    if (this.data.currentView === 'levels') {
      this.autoStartFirstLevel();
    }
  },

  autoStartFirstLevel() {
    const firstLevel = this.data.levels[0];
    const firstDialogue = firstLevel.dialogues[0];
    
    this.setData({
      currentView: 'game',
      currentLevelIndex: 0,
      currentDialogueIndex: 0,
      currentDialogue: firstDialogue
    }, () => {
      if (this.data.isARMode) {
        this.initAR();
      }
    });
  },

  onUnload() {
    this.stopAR();
  },

  // 模式切换
  toggleMode() {
    this.setData({
      isARMode: !this.data.isARMode
    }, () => {
      if (this.data.isARMode) {
        this.initAR();
      } else {
        this.stopAR();
      }
    });
  },

  // 开始关卡
  startLevel(e) {
    const levelId = e.currentTarget.dataset.id;
    const index = this.data.levels.findIndex(l => l.id === levelId);
    const firstDialogue = this.data.levels[index].dialogues[0];
    
    this.setData({
      currentView: 'game',
      currentLevelIndex: index,
      currentDialogueIndex: 0,
      currentDialogue: firstDialogue
    }, () => {
      if (this.data.isARMode) {
        this.initAR();
      }
    });
  },

  // 下一段对话
  nextDialogue() {
    const { currentLevelIndex, currentDialogueIndex, levels, currentDialogue } = this.data;
    
    // 如果当前有选项，必须选择后才能继续
    if (currentDialogue.options && currentDialogue.options.length > 0) {
      return;
    }

    const dialogues = levels[currentLevelIndex].dialogues;
    if (currentDialogueIndex + 1 < dialogues.length) {
      this.setData({
        currentDialogueIndex: currentDialogueIndex + 1,
        currentDialogue: dialogues[currentDialogueIndex + 1]
      });
    } else {
      // 章节结束
      this.completeLevel();
    }
  },

  // 选择选项
  selectOption(e) {
    const option = e.currentTarget.dataset.option;
    const { currentLevelIndex, levels } = this.data;
    const dialogues = levels[currentLevelIndex].dialogues;
    
    if (option.nextId !== undefined) {
      this.setData({
        currentDialogueIndex: option.nextId,
        currentDialogue: dialogues[option.nextId]
      });
    }
  },

  // 完成章节
  completeLevel() {
    this.setData({
      showSuccessModal: true
    });
  },

  // 返回关卡选择并解锁下一关
  backToLevels() {
    const { currentLevelIndex, levels } = this.data;
    const newLevels = [...levels];
    
    newLevels[currentLevelIndex].completed = true;
    if (currentLevelIndex + 1 < newLevels.length) {
      newLevels[currentLevelIndex + 1].unlocked = true;
    }

    this.setData({
      levels: newLevels,
      currentView: 'levels',
      showSuccessModal: false
    });

    wx.setStorageSync('ar_game_progress_v2', newLevels);
    this.stopAR();
  },

  exitGame() {
    this.setData({
      currentView: 'levels'
    });
    this.stopAR();
  },

  // AR 相关逻辑
  initAR() {
    const query = wx.createSelectorQuery();
    query.select('#arCanvas')
      .node()
      .exec((res) => {
        if (!res[0] || !res[0].node) return;
        const canvas = res[0].node;
        this.canvas = canvas;
        const gl = canvas.getContext('webgl');
        if (gl) {
          this.renderLoop(gl, canvas);
        }
      });
  },

  renderLoop(gl, canvas) {
    gl.clearColor(0, 0, 0, 0);
    const render = () => {
      gl.clear(gl.COLOR_BUFFER_BIT);
      this.aniId = canvas.requestAnimationFrame(render);
    };
    render();
  },

  stopAR() {
    if (this.canvas && this.aniId) {
      this.canvas.cancelAnimationFrame(this.aniId);
      this.aniId = null;
    }
  },

  error(e) {
    console.error('相机启动失败:', e.detail);
    this.setData({ isARMode: false });
    wx.showToast({
      title: '相机启动失败，已切回背景模式',
      icon: 'none'
    });
  }
});
