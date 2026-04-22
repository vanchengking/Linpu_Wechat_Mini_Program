// 统一游戏数据管理器
const STORAGE_KEY = 'linpu_game_data';

const defaultData = {
  chapters: {
    ch1: { score: 0, stars: 0, played: false, bestCombo: 0 },
    ch2: { score: 0, riceKg: 0, played: false },
    ch3: { score: 0, quizCorrect: 0, played: false },
    ch4: { score: 0, linesCorrect: 0, pairsCorrect: 0, played: false },
    ch5: { score: 0, maxCombo: 0, guideTime: 0, played: false },
    ch6: { fragmentsCollected: 0, totalScore: 0, played: false }
  },
  global: {
    totalPoints: 0,
    badges: [],
    title: '',
    totalPlayMinutes: 0,
    lastPlayDate: ''
  }
};

class StorageMgr {
  static getData() {
    return wx.getStorageSync(STORAGE_KEY) || defaultData;
  }

  static saveData(data) {
    wx.setStorageSync(STORAGE_KEY, data);
  }

  static updateChapterData(chapterKey, chapterData) {
    const data = this.getData();
    if (!data.chapters[chapterKey]) {
      data.chapters[chapterKey] = {};
    }
    data.chapters[chapterKey] = { ...data.chapters[chapterKey], ...chapterData };
    
    // 更新总分
    let totalPoints = 0;
    for (let key in data.chapters) {
      if (data.chapters[key].score) {
        totalPoints += data.chapters[key].score;
      }
    }
    data.global.totalPoints = totalPoints;
    data.global.lastPlayDate = new Date().toISOString().split('T')[0];
    
    this.saveData(data);
  }

  static addBadge(badgeId) {
    const data = this.getData();
    if (!data.global.badges.includes(badgeId)) {
      data.global.badges.push(badgeId);
      this.saveData(data);
      return true; // 返回true表示新获得
    }
    return false;
  }
}

export default StorageMgr;
