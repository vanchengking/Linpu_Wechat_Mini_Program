// 定义后端地址（注意端口是 8024）
const BASE_URL = "http://112.126.80.115:8024";

Page({
  data: {
    inputText: "",
    isFullscreen: false,
    messages: [],
    scrollTop: 0,
    autoScroll: true,
    showCharacter: false // 人物显示状态
  },

  onLoad() {
    // 初始化时设置初始滚动位置
    this.setData({
      scrollTop: 1000
    });
    
    // 直接等待1秒后显示人物
    setTimeout(() => {
      this.showCharacter();
    }, 1000);
  },

  // 显示人物
  showCharacter() {
    this.setData({
      showCharacter: true
    });
  },

  goHome() {
    wx.navigateTo({
      url: '/pages/scene/scene?id=guide',
      fail: (err) => {
        console.error('跳转到guide页面失败:', err);
        wx.showToast({
          title: '跳转失败',
          icon: 'none'
        });
      }
    });
  },

  toggleFullscreen() {
    this.setData({
      isFullscreen: !this.data.isFullscreen
    });
  },

  selectScene(e) {
    const scene = e.currentTarget.dataset.scene;
    let url;
    
    // 根据场景名称确定要跳转的页面
    switch(scene) {
      case '濂江书院':
        url = '/pages/lianshu/lianshu';
        break;
      case '世公保':
        url = '/pages/shigong/shigong';
        break;
      case '泰山宫':
        // 如果点击的是当前页面，则不执行跳转
        wx.showToast({
          title: '当前已在泰山宫页面',
          icon: 'none'
        });
        return;
      default:
        wx.showToast({
          title: '页面不存在',
          icon: 'none'
        });
        return;
    }
    
    // 跳转到对应页面
    wx.navigateTo({
      url: url,
      fail: (err) => {
        console.error('页面跳转失败:', err);
        wx.showToast({
          title: '页面跳转失败',
          icon: 'none'
        });
      }
    });
  },

  onInput(e) {
    this.setData({
      inputText: e.detail.value
    });
  },

  // --- 核心修改部分：发送文字到后端 ---
  sendText() {
    const text = this.data.inputText.trim();
    if (!text) return;

    // 1. 先把用户说的话显示在界面上
    const userMessage = {
      content: text,
      role: 'user', // 标记这是用户说的
      animation: {}
    };

    const currentMessages = [...this.data.messages, userMessage];
    this.setData({
      messages: currentMessages,
      inputText: "" // 清空输入框
    });

    // 自动滚动到底部
    this.scrollToBottom();

    // 2. 发送请求给 Python 后端
    const that = this; // 暂存 this 对象
    wx.request({
      url: `${BASE_URL}/api/chat`, // 拼接入接口地址
      timeout: 100000,
      method: "POST",
      data: {
        message: text, // 这里必须叫 message，对应 Python 里的 ChatRequest
        user_id: "wechat_guest"
      },
      success: (res) => {
        console.log("尚书伯回复：", res.data);

        if (res.statusCode === 200 && res.data) {
          // 3. 把"尚书伯"的回复显示在界面上
          const aiMessage = {
            content: res.data.text,
            role: 'ai', // 标记这是 AI 说的
            animation: {}
          };
          
          // 更新消息列表
          const newMessages = [...that.data.messages, aiMessage];
          that.setData({
            messages: newMessages
          });
          
          // 再次滚动到底部
          that.scrollToBottom();

          // 4. 如果有声音，播放语音
          if (res.data.audio_url) {
            that.playVoice(res.data.audio_url);
          }
        }
      },
      fail: (err) => {
        console.error("连接失败，请检查 Python 是否运行", err);
        wx.showToast({
          title: '连接尚书伯失败',
          icon: 'none'
        });
      }
    });
  },

  // --- 新增：播放语音功能 ---
  playVoice(audioPath) {
    // 创建音频上下文
    const innerAudioContext = wx.createInnerAudioContext();
    // 拼接完整地址：http://127.0.0.1:8024/audio/voice_xxx.mp3
    innerAudioContext.src = BASE_URL + audioPath;
    innerAudioContext.autoplay = true;

    innerAudioContext.onPlay(() => {
      console.log('开始播放神明语音');
    });
    innerAudioContext.onError((res) => {
      console.log('播放失败', res.errMsg);
    });
  },

  // 封装一下滚动逻辑
  scrollToBottom() {
    this.setData({ autoScroll: true });
    setTimeout(() => {
      if (this.data.autoScroll) {
        this.setData({
          scrollTop: 99999 // 设置足够大的值确保滚动到底部
        });
      }
    }, 200);
  },

  // 滚动事件处理
  onScroll(e) {
    const scrollTop = e.detail.scrollTop;
    const scrollHeight = e.detail.scrollHeight;
    const clientHeight = e.detail.clientHeight;

    // 如果用户手动滚动，关闭自动滚动
    if (scrollTop + clientHeight < scrollHeight - 50) {
      this.setData({
        autoScroll: false
      });
    } else {
      this.setData({
        autoScroll: true
      });
    }
  },

  // 语音输入（暂时保留占位）
  startVoice() {
    wx.showToast({
      title: "语音识别开发中...",
      icon: "none"
    });
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
});
