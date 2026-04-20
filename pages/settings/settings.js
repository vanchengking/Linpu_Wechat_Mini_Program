// pages/settings/settings.js
Page({
  data: {
    userLevel: 5,
    userTitle: '文化行者',
    notificationOn: true,
    soundOn: true,
    vibrateOn: true,
    cacheSize: '2.3 MB',
    showResetModal: false
  },

  onLoad() {
    this.loadSettings();
    this.calcCacheSize();
  },

  loadSettings() {
    try {
      const userData = wx.getStorageSync('linpu_user_data');
      if (userData) {
        const level = Math.min(10, Math.floor((userData.totalExp || 0) / 200) + 1);
        const titles = {
          1: '初来乍到', 2: '好奇游客', 3: '文化学徒', 4: '林浦过客',
          5: '文化行者', 6: '古迹守护者', 7: '历史探寻者', 8: '林浦通',
          9: '文化大使', 10: '传奇探险者'
        };
        this.setData({
          userLevel: level,
          userTitle: titles[level] || '传奇探险者'
        });
      }
      const settings = wx.getStorageSync('linpu_settings') || {};
      if (settings.notification !== undefined) this.setData({ notificationOn: settings.notification });
      if (settings.sound !== undefined) this.setData({ soundOn: settings.sound });
      if (settings.vibrate !== undefined) this.setData({ vibrateOn: settings.vibrate });
    } catch (e) {}
  },

  saveSettings() {
    try {
      wx.setStorageSync('linpu_settings', {
        notification: this.data.notificationOn,
        sound: this.data.soundOn,
        vibrate: this.data.vibrateOn
      });
    } catch (e) {}
  },

  toggleNotification() {
    this.setData({ notificationOn: !this.data.notificationOn });
    this.saveSettings();
    wx.vibrateShort({ type: 'light' });
  },

  toggleSound() {
    this.setData({ soundOn: !this.data.soundOn });
    this.saveSettings();
    wx.vibrateShort({ type: 'light' });
  },

  toggleVibrate() {
    this.setData({ vibrateOn: !this.data.vibrateOn });
    this.saveSettings();
    if (this.data.vibrateOn) wx.vibrateShort({ type: 'light' });
  },

  calcCacheSize() {
    try {
      const res = wx.getStorageInfoSync();
      const sizeKB = res.currentSize || 0;
      if (sizeKB >= 1024) {
        this.setData({ cacheSize: (sizeKB / 1024).toFixed(1) + ' MB' });
      } else {
        this.setData({ cacheSize: sizeKB + ' KB' });
      }
    } catch (e) {}
  },

  clearCache() {
    wx.showModal({
      title: '清除缓存',
      content: '将清除浏览缓存和临时文件，不会影响你的探索进度。',
      confirmColor: '#d4a574',
      success: (res) => {
        if (res.confirm) {
          try {
            wx.clearStorageSync();
            this.setData({ cacheSize: '0 KB' });
            wx.showToast({ title: '缓存已清除', icon: 'success' });
          } catch (e) {
            wx.showToast({ title: '清除失败', icon: 'none' });
          }
        }
      }
    });
  },

  exportData() {
    try {
      const userData = wx.getStorageSync('linpu_user_data') || {};
      wx.showModal({
        title: '导出数据',
        content: `当前经验值：${userData.totalExp || 0} EXP\n地标打卡：${userData.landmarkVisited || 0} 次\n文化体验：${userData.experienceDone || 0} 次\nAR扫描：${userData.arScanned || 0} 次`,
        showCancel: false,
        confirmText: '知道了'
      });
    } catch (e) {
      wx.showToast({ title: '读取失败', icon: 'none' });
    }
  },

  resetProgress() {
    this.setData({ showResetModal: true });
  },

  closeResetModal() {
    this.setData({ showResetModal: false });
  },

  confirmReset() {
    try {
      wx.removeStorageSync('linpu_user_data');
      wx.removeStorageSync('linpu_progress_cache');
      this.setData({
        showResetModal: false,
        userLevel: 1,
        userTitle: '初来乍到'
      });
      wx.showToast({ title: '已重置', icon: 'success' });
    } catch (e) {
      wx.showToast({ title: '重置失败', icon: 'none' });
    }
  },

  showPrivacy() {
    wx.showModal({
      title: '隐私政策',
      content: '林浦印象尊重用户隐私，所有数据仅存储在您的本地设备中，不会上传至任何服务器。',
      showCancel: false,
      confirmText: '知道了',
      confirmColor: '#d4a574'
    });
  },

  showTerms() {
    wx.showModal({
      title: '用户协议',
      content: '欢迎使用林浦印象小程序。本程序为北京林业大学国创赛项目，仅供学习研究使用。',
      showCancel: false,
      confirmText: '知道了',
      confirmColor: '#d4a574'
    });
  },

  goToTeam() {
    wx.navigateTo({ url: '/pages/team/team' });
  }
});
