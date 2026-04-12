// pages/map/map.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    locations: [
      {
        id: 1,
        name: "林浦泰山宫",
        category: "宫庙建筑",
        icon: "🏛️"
      },
      {
        id: 2,
        name: "世公保尚书家庙",
        category: "宗祠建筑",
        icon: "🏘️"
      },
      {
        id: 3,
        name: "濂江书院",
        category: "文化教育",
        icon: "📚"
      },
      {
        id: 4,
        name: "尚书里石牌坊",
        category: "牌坊建筑",
        icon: "⛩️"
      },
      {
        id: 5,
        name: "林浦断桥",
        category: "桥梁建筑",
        icon: "🌉"
      },
      {
        id: 6,
        name: "进士木牌坊",
        category: "牌坊建筑",
        icon: "🚪"
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('林浦地图页面加载完成');
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

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