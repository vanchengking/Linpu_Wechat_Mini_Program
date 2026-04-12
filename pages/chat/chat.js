// 定义后端地址
const BASE_URL = "http://112.126.80.115:8024";

Page({
  data: {
    inputText: "",
    messages: [],
    scrollTop: 0,
    autoScroll: true,
    showCharacter: false,
    showInitialBubble: true,
    showExitConfirm: false
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

  goBack() {
    // 如果有对话内容，显示退出确认弹窗
    if (this.data.messages.length > 0) {
      this.setData({
        showExitConfirm: true
      });
    } else {
      // 没有对话内容，直接退出
      wx.navigateBack({
        delta: 1
      });
    }
  },

  // 隐藏退出确认弹窗
  hideExitConfirm() {
    this.setData({
      showExitConfirm: false
    });
  },

  // 确认退出
  confirmExit() {
    this.setData({
      showExitConfirm: false
    });
    wx.navigateBack({
      delta: 1
    });
  },

  onInput(e) {
    this.setData({
      inputText: e.detail.value
    });
  },

  // 发送文字到后端
  sendText() {
    const text = this.data.inputText.trim();
    if (!text) return;

    // 1. 先把用户说的话显示在界面上
    const userMessage = {
      content: text,
      role: 'user',
      animation: {}
    };

    const currentMessages = [...this.data.messages, userMessage];
    this.setData({
      messages: currentMessages,
      inputText: "", // 清空输入框
      showInitialBubble: false // 隐藏初始气泡
    });

    // 自动滚动到底部
    this.scrollToBottom();

    // 2. 发送请求给 Python 后端
    const that = this; // 暂存 this 对象
    wx.request({
      url: `${BASE_URL}/api/chat`,
      timeout: 100000,
      method: "POST",
      data: {
        message: text,
        user_id: "wechat_guest"
      },
      success: (res) => {
        console.log("尚书伯回复：", res.data);

        if (res.statusCode === 200 && res.data) {
          // 3. 把"尚书伯"的回复显示在界面上
          const aiMessage = {
            content: res.data.text,
            role: 'ai',
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

  // 播放语音功能
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
  }
})