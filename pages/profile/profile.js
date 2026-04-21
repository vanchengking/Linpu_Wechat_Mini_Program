Page({
  data: {
    showAchievementModal: false,
    // 简单的成就数据（弹窗用）
    userLevel: 5,
    userTitle: '文化行者',
    unlockedBadges: 2,
    totalBadges: 6,
    completedAch: 2,
    totalAch: 10,
    stats: {
      landmarkVisited: 3,
      experienceDone: 2,
      arScanned: 4
    }
  },

  onLoad() {
    this.loadAchievementData();
  },

  onShow() {
    this.setData({
      userPoints: getApp().getPoints()
    });
  },

  // 从缓存加载成就数据
  loadAchievementData() {
    try {
      const userData = wx.getStorageSync('linpu_user_data');
      if (userData) {
        this.setData({
          userLevel: Math.min(10, Math.floor((userData.totalExp || 0) / 200) + 1),
          stats: {
            landmarkVisited: userData.landmarkVisited || 0,
            experienceDone: userData.experienceDone || 0,
            arScanned: userData.arScanned || 0
          }
        });
      }
    } catch (e) {}
  },

  // 打开成就弹窗（轻量）
  showAchievementPopup() {
    wx.vibrateShort({ type: 'light' });
    this.setData({ showAchievementModal: true });
  },

  // 关闭成就弹窗
  closeAchievement() {
    this.setData({ showAchievementModal: false });
  },

  // 跳转到完整成就页面
  goToAchievement() {
    wx.navigateTo({
      url: '/pages/achievement/achievement',
      fail: () => { wx.showToast({ title: '跳转失败', icon: 'none' }); }
    });
  },

  // 跳转到林浦印象
  goToLinpu() {
    wx.navigateTo({
      url: '/pages/linpu/linpu',
      fail: () => { wx.showToast({ title: '跳转失败', icon: 'none' }); }
    });
  },

  // 跳转到地标打卡（先切换到地图Tab）
  goToMapLandmark() {
    wx.switchTab({ url: '/pages/map/map' });
  },

  // 跳转到个人记录
  goToRecord() {
    wx.navigateTo({
      url: '/pages/record/record',
      fail: () => { wx.showToast({ title: '跳转失败', icon: 'none' }); }
    });
  },

  // 跳转到排行榜
  goToRanking() {
    wx.navigateTo({
      url: '/pages/ranking/ranking',
      fail: () => { wx.showToast({ title: '跳转失败', icon: 'none' }); }
    });
  },

  // 跳转到更多设置
  goToSettings() {
    wx.navigateTo({
      url: '/pages/settings/settings',
      fail: () => { wx.showToast({ title: '跳转失败', icon: 'none' }); }
    });
  },

  // 跳转到给予建议
  goToFeedback() {
    wx.navigateTo({
      url: '/pages/feedback/feedback',
      fail: () => { wx.showToast({ title: '跳转失败', icon: 'none' }); }
    });
  },

  // 跳转到研发团队
  goToTeam() {
    wx.navigateTo({
      url: '/pages/team/team',
      fail: () => { wx.showToast({ title: '跳转失败', icon: 'none' }); }
    });
  }
})
