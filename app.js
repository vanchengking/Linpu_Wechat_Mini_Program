const preloadUtil = require('./utils/preload');
const auth = require('./utils/auth');
const api = require('./utils/api');

App({
  onLaunch() {
    const logs = wx.getStorageSync('logs') || [];
    logs.unshift(Date.now());
    wx.setStorageSync('logs', logs);

    preloadUtil.prelaunch();
    this.loadStorageData();
    this.bootstrapSession();
  },

  globalData: {
    userInfo: null,
    userPoints: 0,
    ownedCoupons: [],
    cloudProfile: null
  },

  async bootstrapSession(force = false) {
    try {
      await auth.ensureLogin(force);
      await this.syncProfileSummary({ silent: true });
      return await this.refreshUserProfile();
    } catch (error) {
      console.error('bootstrapSession failed:', error);
      return null;
    }
  },

  loadStorageData() {
    const points = wx.getStorageSync('userPoints');
    if (points !== undefined && points !== null && points !== '') {
      this.globalData.userPoints = parseInt(points, 10) || 0;
    } else {
      this.globalData.userPoints = 0;
      wx.setStorageSync('userPoints', 0);
    }

    const coupons = wx.getStorageSync('ownedCoupons');
    if (coupons) {
      this.globalData.ownedCoupons = coupons;
    } else {
      this.globalData.ownedCoupons = [];
      wx.setStorageSync('ownedCoupons', []);
    }
  },

  setCloudProfile(profile) {
    if (!profile) return;

    this.globalData.cloudProfile = profile;
    wx.setStorageSync('linpu_cloud_profile', profile);

    if (typeof profile.points === 'number') {
      this.globalData.userPoints = profile.points;
      wx.setStorageSync('userPoints', profile.points);
    }
  },

  async refreshUserProfile() {
    await auth.ensureLogin();
    const response = await api.request({
      url: '/api/profile/me',
      method: 'GET'
    });

    if (response.profile) {
      this.setCloudProfile(response.profile);
    }

    return response.profile || null;
  },

  async syncProfileSummary({ silent = true } = {}) {
    const localUserData = wx.getStorageSync('linpu_user_data') || {};
    const payload = {
      points: this.getPoints(),
      totalExp: localUserData.totalExp || 0,
      landmarkVisited: localUserData.landmarkVisited || 0,
      experienceDone: localUserData.experienceDone || 0,
      arScanned: localUserData.arScanned || 0
    };

    try {
      await auth.ensureLogin();
      const response = await api.request({
        url: '/api/profile/sync',
        method: 'POST',
        data: payload
      });

      if (response.profile) {
        this.setCloudProfile(response.profile);
      }

      return response.profile || null;
    } catch (error) {
      if (!silent) {
        wx.showToast({
          title: '同步云端资料失败',
          icon: 'none'
        });
      }
      console.error('syncProfileSummary failed:', error);
      return null;
    }
  },

  getPoints() {
    this.loadStorageData();
    return this.globalData.userPoints;
  },

  addPoints(amount, source) {
    this.loadStorageData();
    const oldPoints = this.globalData.userPoints;
    this.globalData.userPoints += amount;
    wx.setStorageSync('userPoints', this.globalData.userPoints);

    console.log(`积分增加: ${oldPoints} -> ${this.globalData.userPoints} (${source})`);
    wx.showToast({
      title: `获得 ${amount} 积分`,
      icon: 'none',
      duration: 1800
    });

    this.syncProfileSummary({ silent: true });
    return this.globalData.userPoints;
  },

  deductPoints(amount) {
    this.loadStorageData();
    if (this.globalData.userPoints >= amount) {
      this.globalData.userPoints -= amount;
      wx.setStorageSync('userPoints', this.globalData.userPoints);
      this.syncProfileSummary({ silent: true });
      return true;
    }
    return false;
  },

  addCoupon(coupon) {
    const newCoupon = {
      ...coupon,
      id: Date.now(),
      used: false
    };
    this.globalData.ownedCoupons.push(newCoupon);
    wx.setStorageSync('ownedCoupons', this.globalData.ownedCoupons);
  },

  getAvailableCoupons() {
    return this.globalData.ownedCoupons.filter((coupon) => !coupon.used);
  },

  useCoupon(couponId) {
    const targetIndex = this.globalData.ownedCoupons.findIndex((coupon) => coupon.id === couponId);
    if (targetIndex > -1) {
      this.globalData.ownedCoupons[targetIndex].used = true;
      wx.setStorageSync('ownedCoupons', this.globalData.ownedCoupons);
      return true;
    }
    return false;
  }
})
