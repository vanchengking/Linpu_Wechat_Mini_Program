// pages/settings/settings.js
const DEFAULT_AVATAR = 'https://bl.meishipay.com/images/content/%E4%BA%BA%E7%89%A9/%E9%BB%98%E8%AE%A4%E5%A4%B4%E5%83%8F.png';

Page({
  data: {
    // 用户资料（从全局缓存读取）
    avatarUrl: '',
    defaultAvatar: DEFAULT_AVATAR,
    nickname: '',
    userLevel: 1,
    userTitle: '初来乍到',

    notificationOn: true,
    soundOn: true,
    vibrateOn: true,
    cacheSize: '2.3 MB',
    showResetModal: false,
    devTaps: 0,
    showEasterEgg: false
  },

  onLoad() {
    this.loadSettings();
    this.calcCacheSize();
  },

  /** 加载用户资料 + 设置 */
  loadSettings() {
    try {
      // 从全局缓存读取（profile页和编辑页共用同一缓存key）
      const cached = wx.getStorageSync('linpu_cloud_profile') || {};
      if (cached.avatarUrl || cached.nickname) {
        this.setData({
          avatarUrl: cached.avatarUrl || DEFAULT_AVATAR,
          nickname: cached.nickname || ''
        });
      }

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

  onShow() {
    // 每次显示时刷新用户数据（可能从编辑页返回后更新了缓存）
    try {
      const cached = wx.getStorageSync('linpu_cloud_profile') || {};
      if (cached.avatarUrl) this.setData({ avatarUrl: cached.avatarUrl });
      if (cached.nickname) this.setData({ nickname: cached.nickname });
    } catch (e) {}
  },

  /** 点击用户卡片 → 进入编辑资料页面 */
  goToEditProfile() {
    wx.navigateTo({ url: '/pages/settings/profile-edit' });
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
  },

  // 开发者模式：连续点击5次触发彩蛋
  tapDevMode() {
    let count = this.data.devTaps + 1;
    
    if (count < 5) {
      this.setData({ devTaps: count });
      wx.vibrateShort({ type: 'light' });
      // 3秒内未点满，重置计数
      if (this._devTimer) clearTimeout(this._devTimer);
      this._devTimer = setTimeout(() => {
        this.setData({ devTaps: 0 });
      }, 3000);
    } else {
      // 点满5次，显示彩蛋
      if (this._devTimer) clearTimeout(this._devTimer);
      this.setData({
        devTaps: 5,
        showEasterEgg: true
      });
      wx.vibrateShort({ type: 'medium' });
    }
  },

  closeEasterEgg() {
    this.setData({
      showEasterEgg: false,
      devTaps: 0
    });
  }
});
