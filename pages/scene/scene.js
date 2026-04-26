// 定义后端地址
const BASE_URL = "https://bl.meishipay.com";
const preloadUtil = require('../../utils/preload');

// 场景配置字典：把所有景点的差异化数据集中管理
const sceneConfig = {
  guide: {
    bgImg: "https://bl.meishipay.com/images/background/background.webp",
    initialText: "诶！那是谁家的小书生？快跟上！我是林浦的尚书伯，也是这里的'巡境百事通'，有什么想问的尽管说！\n听见锣鼓声了吗？咱们村的巡境队伍马上就要出发了！\n第一站，你想随我去哪里打卡？",
    characterImg: "https://bl.meishipay.com/images/characters/shangshubo.png"
  },
  lianshu: {
    bgImg: "https://bl.meishipay.com/images/content/濂江书院1.webp",
    initialText: "濂江书院是福州现存最完好的古书院，始建于唐末，南宋朱熹曾在此讲学，'宋朱熹讲学处' 巨碑、'文光射斗' 石栏等遗迹，见证千年学风传承。",
    characterImg: "https://bl.meishipay.com/images/characters/shangshubo.png"
  },
  shigong: {
    bgImg: "https://bl.meishipay.com/images/content/世公保1.webp",
    initialText: "世公保全称世宫保尚书林公家庙，由明代林瀚始建，是 '三代五尚书' 家族的纪念地，木结构建筑群与 '形如乌纱' 的庙前水池，尽显闽派建筑特色与望族底蕴。",
    characterImg: "https://bl.meishipay.com/images/characters/shangshubo.png"
  },
  taishan: {
    bgImg: "https://bl.meishipay.com/images/content/location/泰山宫1.png",
    initialText: "原为南宋端宗驻跸的平山阁，建筑雕饰精美，宫前古榕与辕门相映，承载着宋末抗元历史与民间信仰。",
    characterImg: "https://bl.meishipay.com/images/characters/shangshubo.png"
  }
};

Page({
  data: {
    currentSceneId: 'guide', // 当前场景ID
    sceneData: {}, // 当前场景的具体数据（背景图、文字等）
    inputText: "",
    isFullscreen: false,
    messages: [],
    scrollTop: 0,
    autoScroll: true,
    showCharacter: false 
  },

  onLoad(options) {
    // 预加载场景相关图片（背景图 + 人物图）
    preloadUtil.preloadPageImages('scene');

    // 获取通过路由传过来的 id，如果没有传则默认为 'guide'
    const sceneId = options.id || 'guide';
    
    // 初始化页面数据
    this.setData({
      currentSceneId: sceneId,
      sceneData: sceneConfig[sceneId] || sceneConfig['guide'],
      scrollTop: 1000
    });
    
    // 延迟显示人物动画
    setTimeout(() => {
      this.setData({ showCharacter: true });
    }, 1000);
  },

  // 场景切换逻辑（优化：不再跳转新页面，而是重定向刷新当前页面参数）
  selectScene(e) {
    const targetId = e.currentTarget.dataset.id;
    
    if (this.data.currentSceneId === targetId) {
      wx.showToast({ title: '当前已在该场景', icon: 'none' });
      return;
    }
    
    wx.redirectTo({
      url: `/pages/scene/scene?id=${targetId}`,
      fail: (err) => {
        console.error('跳转失败:', err);
      }
    });
  },

  goHome() {
    wx.navigateBack({
      delta: 1,
      fail: () => {
        wx.switchTab({
          url: '/pages/jiema/jiema'
        });
      }
    });
  },

  toggleFullscreen() {
    this.setData({ isFullscreen: !this.data.isFullscreen });
  },

  onInput(e) {
    this.setData({ inputText: e.detail.value });
  },

  // --- 发送文字到大模型后端 ---
  sendText() {
    const text = this.data.inputText.trim();
    if (!text) return;

    const userMessage = { content: text, role: 'user', animation: {} };
    const currentMessages = [...this.data.messages, userMessage];
    
    this.setData({
      messages: currentMessages,
      inputText: "" 
    });

    this.scrollToBottom();

    const that = this;
    wx.request({
      url: `${BASE_URL}/api/chat`, 
      timeout: 100000,
      method: "POST",
      data: {
        message: text, 
        user_id: "wechat_guest_" + this.data.currentSceneId // 附加场景ID，方便后端区分上下文
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data) {
          const aiMessage = {
            content: res.data.text,
            role: 'ai', 
            animation: {}
          };
          
          that.setData({
            messages: [...that.data.messages, aiMessage]
          });
          that.scrollToBottom();

          if (res.data.audio_url) {
            that.playVoice(res.data.audio_url);
          }
        }
      },
      fail: (err) => {
        wx.showToast({ title: '连接尚书伯失败', icon: 'none' });
      }
    });
  },

  playVoice(audioPath) {
    const innerAudioContext = wx.createInnerAudioContext();
    innerAudioContext.src = BASE_URL + audioPath;
    innerAudioContext.autoplay = true;
  },

  scrollToBottom() {
    this.setData({ autoScroll: true });
    setTimeout(() => {
      if (this.data.autoScroll) {
        this.setData({ scrollTop: 99999 });
      }
    }, 200);
  },

  onScroll(e) {
    const { scrollTop, scrollHeight, clientHeight } = e.detail;
    this.setData({
      autoScroll: !(scrollTop + clientHeight < scrollHeight - 50)
    });
  },

  startVoice() {
    wx.showToast({ title: "语音识别开发中...", icon: "none" });
  }
});