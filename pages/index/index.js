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
    this.data.touchStartY = e.changedTouches[0].clientY;
  },

  /* 触摸结束 */
  handleTouchEnd(e) {
    const endY = e.changedTouches[0].clientY;
    if (this.data.touchStartY - endY > 80) {
      wx.navigateTo({
        url: "/pages/guide/guide"
      });
    }
  },

  /* 跳转到聊天页面 */
  goToChat() {
    console.log("浮窗按钮被点击了");
    wx.navigateTo({
      url: "/pages/chat/chat",
      success: () => {
        console.log("成功跳转到聊天页面");
      },
      fail: (error) => {
        console.error("跳转聊天页面失败:", error);
        wx.showToast({
          title: "跳转失败，请重试",
          icon: "none"
        });
      }
    });
  }

});