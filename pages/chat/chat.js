// 定义后端地址
const BASE_URL = "http://127.0.0.1:8024";

Page({
  data: {
    inputText: "",
    messages: [],
    scrollTop: 0,
    autoScroll: true,
    showCharacter: false,
    showInitialBubble: true,
    showExitConfirm: false,
    characterAnimData: {}
  },

  onLoad() {
    // 初始化动画实例
    this.characterAnim = wx.createAnimation({
      duration: 600,
      timingFunction: 'ease-out',
    });

    // 初始化时设置初始滚动位置
    this.setData({
      scrollTop: 1000
    });

    // 延迟1秒后平滑显示人物（从下方滑入）
    setTimeout(() => {
      this.showCharacter();
    }, 800);
  },

  // 显示人物 — 使用 wx.createAnimation 平滑入场，避免卡顿
  // 注意：createAnimation 只支持 px 单位，不支持 rpx
  showCharacter() {
    const startY = 40; // px（约等于 80rpx）

    // 先设置初始位置（下移）
    this.characterAnim.translateY(startY).opacity(0).step({ duration: 0 });
    this.setData({
      characterAnimData: this.characterAnim.export(),
      showCharacter: true
    });

    // 紧接着执行入场动画：上移到原位 + 淡入
    setTimeout(() => {
      this.characterAnim.translateY(0).opacity(1).step({
        duration: 500,
        timingFunction: 'ease-out'
      });
      this.setData({
        characterAnimData: this.characterAnim.export()
      });
    }, 50);
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

  // 语音输入 — 使用微信原生录音管理器
  startVoice() {
    const that = this;

    // 检查麦克风权限
    wx.getSetting({
      success(res) {
        // 已授权或未拒绝过 → 直接请求或使用
        if (res.authSetting['scope.record'] === false) {
          // 用户之前拒绝过，引导去设置页
          wx.showModal({
            title: '需要麦克风权限',
            content: '请在设置中允许使用麦克风，以便进行语音识别',
            confirmText: '去设置',
            cancelText: '取消',
            success(modalRes) {
              if (modalRes.confirm) {
                wx.openSetting();
              }
            }
          });
          return;
        }

        // 开始录音
        that._startRecording();
      },
      fail() {
        wx.showToast({ title: '权限检查失败', icon: 'none' });
      }
    });
  },

  // 执行录音
  _startRecording() {
    const recorderManager = wx.getRecorderManager();
    this._recorderManager = recorderManager;

    // 录音开始提示
    wx.showToast({ title: '正在录音...', icon: 'none', duration: 2000 });

    recorderManager.start({
      format: 'mp3',
      sampleRate: 16000,
      numberOfChannels: 1,
      duration: 60000, // 最长60秒
    });

    recorderManager.onStart(() => {
      console.log('录音已开始');
    });

    // 录音结束回调（超时或手动停止）
    recorderManager.onStop((res) => {
      console.log('录音结束', res);
      wx.hideToast();

      if (res.tempFilePath) {
        // TODO: 将音频发送到后端进行语音识别
        // 目前先提示用户功能状态
        wx.showToast({
          title: `录音完成 (${Math.round(res.fileSize / 1024)}KB)\n语音识别对接中...`,
          icon: 'none',
          duration: 2000
        });
      }
    });

    // 录音错误
    recorderManager.onError((err) => {
      console.error('录音错误:', err);
      wx.hideToast();
      wx.showToast({
        title: '录音失败，请检查麦克风',
        icon: 'none'
      });
    });

    // 长按录音模式：3秒后自动停止并识别
    setTimeout(() => {
      try {
        recorderManager.stop();
      } catch (e) { /* ignore */ }
    }, 5000);
  }
})