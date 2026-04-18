// pages/decode/decode.js
Page({
  data: {
    touchStartY: 0,
    arrowAnimation: {}
  },

  onReady() {
    this.animateArrow();
  },

  /* 箭头上下跳动 */
  animateArrow() {
    const animation = wx.createAnimation({
      duration: 800,
      timingFunction: "ease-in-out"
    });

    const animate = () => {
      animation.translateY(-15).step();
      this.setData({arrowAnimation: animation.export()});
      
      setTimeout(() => {
        animation.translateY(0).step();
        this.setData({arrowAnimation: animation.export()});
        
        setTimeout(() => {
          animate();
        }, 400);
      }, 400);
    };

    animate();
  },

  /* 触摸开始 */
  handleTouchStart(e) {
    this.data.touchStartY = e.changedTouches[0].clientY;
  },

  /* 触摸结束 */
  handleTouchEnd(e) {
    const endY = e.changedTouches[0].clientY;
    if (this.data.touchStartY - endY > 80) {
      wx.switchTab({
        url: "/pages/ar/ar"
      });
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('文化解码页面加载完成');
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

  }
})
