Component({
  data: {
    // 初始位置，放在屏幕右下角附近
    x: 300, 
    y: 500 
  },

  lifetimes: {
    attached() {
      // 获取屏幕宽高，动态计算右下角的初始位置，适配不同手机
      const sysInfo = wx.getSystemInfoSync();
      this.setData({
        x: sysInfo.windowWidth - 70, // 靠右
        y: sysInfo.windowHeight - 120 // 靠下
      });
    }
  },

  methods: {
    // 点击触发：跳转到你用 Server.py 做后端的那个 AI 对话界面
    goToChat() {
      wx.vibrateShort({ type: 'light' }); // 点击震动反馈
      
      // 注意：这里跳转到你们的聊天页面。
      // 如果是用我们刚合并的页面，就是 /pages/scene/scene?id=guide
      // 如果是用原版的，就是 /pages/chat/chat
      wx.navigateTo({
        url: '/pages/scene/scene?id=guide',
        fail: (err) => {
          console.error("跳转失败:", err);
        }
      });
    }
  }
})