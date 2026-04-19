// app.js
App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  
  onShow: function (options) {
    // 小程序启动，或从后台进入前台显示时触发
  },
  
  onHide: function () {
    // 小程序从前台进入后台时触发
  },
  
  onError: function (msg) {
    // 小程序发生脚本错误，或者 api 调用失败时触发
    console.log(msg)
  },
  
  globalData: {
    userInfo: null,
    userPoints: 0, // 用户积分余额
    ownedCoupons: [] // 用户拥有的优惠券
  },

  // 加载存储的数据
  loadStorageData: function() {
    const points = wx.getStorageSync('userPoints');
    const coupons = wx.getStorageSync('ownedCoupons');
    this.globalData.userPoints = points || 0;
    this.globalData.ownedCoupons = coupons || [];
  },

  // 获取积分
  getPoints: function() {
    if (this.globalData.userPoints === 0) {
      this.loadStorageData();
    }
    return this.globalData.userPoints;
  },

  // 增加积分
  addPoints: function(amount, source) {
    this.globalData.userPoints += amount;
    wx.setStorageSync('userPoints', this.globalData.userPoints);
    wx.showToast({
      title: `获得 ${amount} 积分\n(${source})`,
      icon: 'none',
      duration: 2000
    });
    return this.globalData.userPoints;
  },

  // 扣减积分（例如购买抵用券）
  deductPoints: function(amount) {
    if (this.globalData.userPoints >= amount) {
      this.globalData.userPoints -= amount;
      wx.setStorageSync('userPoints', this.globalData.userPoints);
      return true; // 扣减成功
    }
    return false; // 余额不足
  },

  // 添加优惠券
  addCoupon: function(coupon) {
    const newCoupon = {
      ...coupon,
      id: Date.now(), // 给个唯一ID
      used: false
    };
    this.globalData.ownedCoupons.push(newCoupon);
    wx.setStorageSync('ownedCoupons', this.globalData.ownedCoupons);
  },

  // 获取可用优惠券
  getAvailableCoupons: function() {
    return this.globalData.ownedCoupons.filter(c => !c.used);
  },

  // 使用优惠券
  useCoupon: function(couponId) {
    const idx = this.globalData.ownedCoupons.findIndex(c => c.id === couponId);
    if (idx > -1) {
      this.globalData.ownedCoupons[idx].used = true;
      wx.setStorageSync('ownedCoupons', this.globalData.ownedCoupons);
      return true;
    }
    return false;
  }
})
