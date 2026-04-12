Page({
  data: {},
  onLoad() {},

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
