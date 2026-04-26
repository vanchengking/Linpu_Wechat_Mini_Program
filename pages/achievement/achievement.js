// pages/achievement/achievement.js

const DEFAULT_AVATAR = 'https://bl.meishipay.com/images/content/%E4%BA%BA%E7%89%A9/%E9%BB%98%E8%AE%A4%E5%A4%B4%E5%83%8F.png';

Page({
  data: {
    defaultAvatar: DEFAULT_AVATAR,

    // 预计算的统计数（避免 WXML 中使用 .filter() 表达式）
    unlockedBadgeCount: 0,
    completedAchievementCount: 0,
    totalBadgeCount: 0,
    totalAchievementCount: 0,

    // 用户信息
    userInfo: {
      avatarUrl: DEFAULT_AVATAR,
      level: 5,
      levelTitle: '文化行者',
      currentExp: 1280,
      nextLevelExp: 2000,
      expPercent: 64
    },

    // 核心数据统计（可从其他页面联动更新）
    stats: {
      landmarkVisited: 3,     // 已打卡地标数（联动 landmark 页面）
      experienceDone: 2,       // 已完成体验数（联动 experience 页面）
      arScanned: 4,            // AR扫描次数（联动 AR 页面）
      totalDays: 7             // 探索天数
    },

    // 徽章列表
    badges: [
      {
        id: 'b1',
        name: '初入林浦',
        icon: '/resources/icons/云塔.png',
        desc: '完成首次登录，开启林浦文化之旅',
        condition: '首次进入小程序',
        unlocked: true,
        unlockTime: '2026-04-10',
        badgeStyle: ''
      },
      {
        id: 'b2',
        name: '地标猎人',
        icon: '/resources/icons/地标.png',
        desc: '打卡全部6处文化地标，成为林浦通',
        condition: '打卡所有地标',
        unlocked: false,
        badgeStyle: 'filter: grayscale(100%) opacity(0.4)'
      },
      {
        id: 'b3',
        name: '文化传承者',
        icon: '/resources/icons/佛像.png',
        desc: '完成全部4项文化体验活动',
        condition: '完成所有体验',
        unlocked: false,
        badgeStyle: 'filter: grayscale(100%) opacity(0.4)'
      },
      {
        id: 'b4',
        name: 'AR先锋',
        icon: '/resources/icons/ar.png',
        desc: '使用AR功能扫描超过10次',
        condition: '累计扫描10次以上',
        unlocked: true,
        unlockTime: '2026-04-12',
        badgeStyle: ''
      },
      {
        id: 'b5',
        name: '泰山信徒',
        icon: '/resources/icons/人物头像.png',
        desc: '深入了解泰山宫的全部历史与文化内涵',
        condition: '查看泰山宫详情并完成探索',
        unlocked: false,
        badgeStyle: 'filter: grayscale(100%) opacity(0.4)'
      },
      {
        id: 'b6',
        name: '书香门第',
        icon: '/resources/icons/成就.png',
        desc: '在濂江书院沉浸式学习朱熹讲学内容',
        condition: '浏览濂江书院完整介绍',
        unlocked: false,
        badgeStyle: 'filter: grayscale(100%) opacity(0.4)'
      }
    ],

    // 成就任务列表（与各页面深度联动）
    achievements: [
      {
        id: 1,
        name: '地标探险家',
        desc: '打卡林浦村的文化地标建筑',
        progress: 3,
        target: 6,
        rewardExp: 200,
        completed: false,
        linkType: 'landmark',
        linkId: '',
        iconText: '1',
        progressWidth: 50
      },
      {
        id: 2,
        name: '文化解码者',
        desc: '参与林浦传统民俗文化体验活动',
        progress: 2,
        target: 4,
        rewardExp: 300,
        completed: false,
        linkType: 'experience',
        linkId: '',
        iconText: '2',
        progressWidth: 50
      },
      {
        id: 3,
        name: 'AR探索者',
        desc: '通过AR技术还原历史场景',
        progress: 4,
        target: 10,
        rewardExp: 150,
        completed: false,
        linkType: 'ar',
        linkId: '',
        iconText: '3',
        progressWidth: 40
      },
      {
        id: 4,
        name: '泰山宫朝圣',
        desc: '深入了解林浦泰山宫的历史渊源',
        progress: 1,
        target: 1,
        rewardExp: 100,
        completed: true,
        linkType: 'landmark',
        linkId: 1,
        iconText: '✓',
        progressWidth: 100
      },
      {
        id: 5,
        name: '尚书里寻踪',
        desc: '探访世宫保尚书家庙与石牌坊',
        progress: 1,
        target: 2,
        rewardExp: 150,
        completed: false,
        linkType: 'landmark',
        linkId: 2,
        iconText: '5',
        progressWidth: 50
      },
      {
        id: 6,
        name: '书院问道',
        desc: '走进千年古书院——濂江书院',
        progress: 0,
        target: 1,
        rewardExp: 100,
        completed: false,
        linkType: 'landmark',
        linkId: 3,
        iconText: '6',
        progressWidth: 0
      },
      {
        id: 7,
        name: '巡境参与者',
        desc: '了解林浦巡境活动的文化内涵',
        progress: 1,
        target: 1,
        rewardExp: 80,
        completed: true,
        linkType: 'experience',
        linkId: 1,
        iconText: '✓',
        progressWidth: 100
      },
      {
        id: 8,
        name: '安南伬聆听者',
        desc: '欣赏省级非遗安南伬音乐',
        progress: 0,
        target: 1,
        rewardExp: 80,
        completed: false,
        linkType: 'experience',
        linkId: 3,
        iconText: '8',
        progressWidth: 0
      },
      {
        id: 9,
        name: '连续探索',
        desc: '连续3天打开小程序进行探索',
        progress: 2,
        target: 3,
        rewardExp: 120,
        completed: false,
        linkType: '',
        linkId: '',
        iconText: '9',
        progressWidth: 67
      },
      {
        id: 10,
        name: '林浦百晓生',
        desc: '解锁全部徽章，成为真正的林浦专家',
        progress: 2,
        target: 6,
        rewardExp: 500,
        completed: false,
        linkType: '',
        linkId: '',
        iconText: '10',
        progressWidth: 33
      }
    ],

    // 排行榜数据
    ranking: [
      { rank: 1, name: '林浦通·阿明', level: 8, exp: 3650, avatar: '', rankClass: 'gold' },
      { rank: 2, name: '文化行者', level: 7, exp: 2980, avatar: '', rankClass: 'silver' },
      { rank: 3, name: '古迹爱好者', level: 6, exp: 2340, avatar: '', rankClass: 'bronze' },
      { rank: 4, name: '我', level: 5, exp: 1280, avatar: '', isMe: true, rankClass: '' },
      { rank: 5, name: '新手探险者', level: 3, exp: 650, avatar: '', rankClass: '' }
    ],

    // 弹窗状态
    showBadgeModal: false,
    currentBadge: {}
  },

  onLoad() {
    this.loadUserData();
    this.checkAchievements();
    this.updateCounts();
  },

  onShow() {
    // 每次显示页面时刷新数据（从全局或缓存读取最新进度）
    this.refreshProgressFromCache();
  },

  /**
   * 从本地缓存加载用户数据
   */
  loadUserData() {
    try {
      const userData = wx.getStorageSync('linpu_user_data');
      const cachedProfile = wx.getStorageSync('linpu_cloud_profile') || {};
      if (userData) {
        const level = this.calcLevel(userData.totalExp || 0);
        this.setData({
          userInfo: {
            avatarUrl: cachedProfile.avatarUrl || DEFAULT_AVATAR,
            level: level.level,
            levelTitle: this.getLevelTitle(level.level),
            currentExp: userData.totalExp || 0,
            nextLevelExp: level.nextExp,
            expPercent: level.percent
          },
          stats: {
            landmarkVisited: userData.landmarkVisited || 0,
            experienceDone: userData.experienceDone || 0,
            arScanned: userData.arScanned || 0,
            totalDays: userData.totalDays || 1
          }
        });
      }
    } catch (e) {
      console.log('加载用户数据失败:', e);
    }
  },

  /**
   * 根据总经验值计算等级信息
   * 等级公式：每级所需EXP = 等级 × 200
   */
  calcLevel(totalExp) {
    let level = 1;
    let accumulated = 0;
    while (accumulated + level * 200 <= totalExp) {
      accumulated += level * 200;
      level++;
    }
    const currentLevelExp = totalExp - accumulated;
    const nextLevelExp = level * 200;
    return {
      level: level,
      percent: Math.floor(currentLevelExp / nextLevelExp * 100),
      currentExp: totalExp,
      nextExp: accumulated + nextLevelExp
    };
  },

  /**
   * 获取等级称号
   */
  getLevelTitle(lv) {
    const titles = {
      1: '初来乍到',
      2: '好奇游客',
      3: '文化学徒',
      4: '林浦过客',
      5: '文化行者',
      6: '古迹守护者',
      7: '历史探寻者',
      8: '林浦通',
      9: '文化大使',
      10: '传奇探险者'
    };
    return titles[lv] || '传奇探险者';
  },

  /**
   * 检查并更新成就完成状态
   */
  checkAchievements() {
    const { stats } = this.data;
    const achievements = this.data.achievements.map(item => {
      if (item.completed) return item;

      let newProgress = item.progress;

      // 根据成就类型匹配统计数据
      switch (item.id) {
        case 1: newProgress = stats.landmarkVisited; break;  // 地标打卡
        case 2: newProgress = stats.experienceDone; break;   // 文化体验
        case 3: newProgress = stats.arScanned; break;        // AR扫描
        default: break;
      }

      const completed = newProgress >= item.target;
      return {
        ...item,
        progress: newProgress,
        completed: completed,
        iconText: completed ? '✓' : (newProgress >= item.target ? '★' : String(item.id)),
        progressWidth: Math.floor(newProgress / item.target * 100) || 0
      };
    });

    // 为排行榜数据添加 rankClass
    const ranking = this.data.ranking.map((r, idx) => ({
      ...r,
      rankClass: idx === 0 ? 'gold' : (idx === 1 ? 'silver' : (idx === 2 ? 'bronze' : ''))
    }));

    // 为徽章添加 badgeStyle
    const badges = this.data.badges.map(b => ({
      ...b,
      badgeStyle: b.unlocked ? '' : 'filter: grayscale(100%) opacity(0.4)'
    }));

    this.setData({ achievements, ranking, badges });
    this.updateCounts();
  },

  /**
   * 预计算徽章和成就的计数（避免 WXML 中使用 .filter()）
   */
  updateCounts() {
    const unlockedBadges = this.data.badges.filter(b => b.unlocked).length;
    const completedAch = this.data.achievements.filter(a => a.completed).length;
    this.setData({
      unlockedBadgeCount: unlockedBadges,
      totalBadgeCount: this.data.badges.length,
      completedAchievementCount: completedAch,
      totalAchievementCount: this.data.achievements.length
    });
  },

  /**
   * 刷新进度（从其他页面写入的缓存中读取）
   */
  refreshProgressFromCache() {
    try {
      const cacheData = wx.getStorageSync('linpu_progress_cache') || {};
      let needUpdate = false;

      const newStats = { ...this.data.stats };
      if (cacheData.landmarkVisited !== undefined && cacheData.landmarkVisited !== newStats.landmarkVisited) {
        newStats.landmarkVisited = cacheData.landmarkVisited;
        needUpdate = true;
      }
      if (cacheData.experienceDone !== undefined && cacheData.experienceDone !== newStats.experienceDone) {
        newStats.experienceDone = cacheData.experienceDone;
        needUpdate = true;
      }
      if (cacheData.arScanned !== undefined && cacheData.arScanned !== newStats.arScanned) {
        newStats.arScanned = cacheData.arScanned;
        needUpdate = true;
      }

      if (needUpdate) {
        this.setData({ stats: newStats });
        this.checkAchievements();

        // 更新总经验值并保存
        this.addExp(10); // 每次活跃给少量EXP
      }
    } catch (e) {}
  },

  /**
   * 增加经验值
   */
  addExp(amount) {
    try {
      let userData = wx.getStorageSync('linpu_user_data') || { totalExp: 0 };
      userData.totalExp = (userData.totalExp || 0) + amount;
      wx.setStorageSync('linpu_user_data', userData);

      const level = this.calcLevel(userData.totalExp);
      this.setData({
        userInfo: {
          level: level.level,
          levelTitle: this.getLevelTitle(level.level),
          currentExp: userData.totalExp,
          nextLevelExp: level.nextExp,
          expPercent: level.percent
        }
      });
    } catch (e) {}
  },

  /**
   * 显示徽章详情弹窗
   */
  showBadgeDetail(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      currentBadge: this.data.badges[index],
      showBadgeModal: true
    });
    wx.vibrateShort({ type: 'light' });
  },

  /**
   * 关闭徽章弹窗
   */
  closeBadgeModal() {
    this.setData({
      showBadgeModal: false,
      currentBadge: {}
    });
  },

  /**
   * 跳转到关联页面（实现跨页面联动）
   */
  goToRelatedPage(e) {
    const type = e.currentTarget.dataset.type;
    const id = e.currentTarget.dataset.id;

    if (!type) return;

    wx.vibrateShort({ type: 'light' });

    switch (type) {
      case 'landmark':
        if (id) {
          wx.switchTab({ url: '/pages/map/map' });
          setTimeout(() => {
            wx.navigateTo({
              url: `/pages/landmark/landmark?id=${id}`,
              fail: () => {
                // 如果navigateTo失败，直接用switchTab到地标页
                wx.navigateTo({ url: '/pages/landmark/landmark' });
              }
            });
          }, 300);
        } else {
          wx.switchTab({ url: '/pages/map/map' });
        }
        break;

      case 'experience':
        wx.switchTab({ url: '/pages/jiema/jiema' });
        break;

      case 'ar':
        wx.switchTab({ url: '/pages/ar/ar' });
        break;

      default:
        break;
    }
  },

  /**
   * 跳转排行榜（暂用toast提示，后续可扩展为独立页面）
   */
  goToRanking() {
    wx.showToast({
      title: '排行榜开发中...',
      icon: 'none',
      duration: 1500
    });
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: `我在林浦印象已达到Lv.${this.data.userInfo.level}，快来挑战吧！`,
      path: '/pages/achievement/achievement',
      imageUrl: DEFAULT_AVATAR
    };
  },

  onShareTimeline() {
    return {
      title: `林浦文化探险者 Lv.${this.data.userInfo.level} - ${this.data.userInfo.levelTitle}`
    };
  }
});
