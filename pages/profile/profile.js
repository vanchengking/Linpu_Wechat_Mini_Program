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

  // 跳转到完整成就/排行榜页面（排行榜入口）
  goToAchievement() {
    wx.navigateTo({
      url: '/pages/achievement/achievement',
      fail: () => { wx.showToast({ title: '跳转失败', icon: 'none' }); }
    });
  },

  // 跳转到聊天页面
  goToChat() {
    wx.navigateTo({
      url: '/pages/chat/chat',
      success: () => {
        console.log("成功跳转到聊天页面");
      },
      fail: (error) => {
        console.error("跳转到聊天页面失败:", error);
        wx.showToast({
          title: '跳转失败',
          icon: 'none'
        });
      }
    });
  }
})
