Page({
  data: {
    touchStartY: 0,
    arrowAnimation: {},
    pageAnimation: {}
  },

  onReady() {
    this.animateArrow();
  },

  /* 箭头上下跳动 */
  animateArrow() {
    const animation = wx.createAnimation({
      duration: 500,
      timingFunction: "ease-in-out"
    });

    const animate = () => {
      animation.translateY(-10).step();
      this.setData({arrowAnimation: animation.export()});
      
      setTimeout(() => {
        animation.translateY(0).step();
        this.setData({arrowAnimation: animation.export()});
        
        setTimeout(() => {
          animate();
        }, 300);
      }, 300);
    };

    animate();
  },

  /* 触摸开始 */
  handleTouchStart(e) {
    this.setData({
      touchStartY: e.changedTouches[0].clientY
    });
  },

  /* 触摸结束 */
  handleTouchEnd(e) {
    const endY = e.changedTouches[0].clientY;
    if (this.data.touchStartY - endY > 80) {
      this.animateUpAndNavigate();
    }
  },

  /* 向上模糊动画并跳转 */
  animateUpAndNavigate() {
    const animation = wx.createAnimation({
      duration: 400,
      timingFunction: "ease-in"
    });

    // 向上移动并缩小
    animation.translateY(-100).scale(0.9).opacity(0).step();
    this.setData({ pageAnimation: animation.export() });

    // 动画完成后跳转
    setTimeout(() => {
      wx.switchTab({
        url: "/pages/ar/ar"
      });
    }, 400);
  },

  /* 跳转到 AR 页面 */
  goToChat() {
    console.log("浮窗按钮被点击了");
    wx.switchTab({
      url: "/pages/ar/ar",
      success: () => {
        console.log("成功跳转到 AR 页面");
      },
      fail: (error) => {
        console.error("跳转 AR 页面失败:", error);
        wx.showToast({
          title: "跳转失败，请重试",
          icon: "none"
        });
      }
    });
  }

});