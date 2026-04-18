Page({
  data: {
    showModal: false,
    currentItem: {},
    experiences: [
      {
        id: 1,
        title: "巡境",
        tag: "泰山信仰",
        icon: "https://101.34.247.48:8888/down/NgiYf8lbQ4Ga.png",
        image: "/images/hero_youshen.jpg",
        images: [
          "https://101.34.247.48:8888/down/NgiYf8lbQ4Ga.png",
          "https://101.34.247.48:8888/down/3Zf6yMzX8G4O.png"
        ],
        origin: "南宋德祐二年(1276)，宋端宗赵驻跸林浦，随行军士十数万。宋亡后，百姓为纪念君臣，将行宫改为泰山宫，神像均影射南宋君臣，如以宋高宗影射泰山，并祀文天祥、陆秀夫等。",
        desc: "林浦的巡境活动不仅是祈福，更是对忠义精神的缅怀。巡游队伍中，你能看到装饰华丽的轿辇与神像，这些神像实为南宋君臣的化身。以此形式避开元廷猜忌，世代沿袭，形成了独特的爱国主义信仰仪式。",
      },
      {
        id: 2,
        title: "冲宫",
        tag: "激情巡游",
        icon: "https://101.34.247.48:8888/down/HGyPumaMJQfB.png",
        image: "/images/hero_chonggong.jpg",
        images: [
          "https://101.34.247.48:8888/down/HGyPumaMJQfB.png",
          "https://101.34.247.48:8888/down/Mx1yanfUkTRl.png"
        ],
        origin: "源于当年宋军\"平山点兵\"的军事传统。据史载，随同宋帝前来的军士有十数万，淮兵有余万，铲平山峰驻扎。",
        desc: "作为巡境活动中最具爆发力的环节，\"冲宫\"象征着当年宋军操练与急行军的威武气势。抬神轿的青壮年会在特定路段或入庙时急速奔跑，模拟冲锋陷阵，场面震撼，展现了林浦人对于那段波澜壮阔历史的肢体记忆。",
      },
      {
        id: 3,
        title: "演戏",
        tag: "安南伬",
        icon: "https://101.34.247.48:8888/down/2FOIeSwiTaHR.png",
        image: "/images/hero_annan.jpg",
        images: [
          "https://101.34.247.48:8888/down/2FOIeSwiTaHR.png",
          "https://101.34.247.48:8888/down/FQbPwRz38krl.png"
        ],
        origin: "省级非物质文化遗产。源于唐代古越南国（安南国）的贡乐，南宋末年随赵昰南逃队伍传入林浦，融合了闽曲琴唱。",
        desc: "在林浦的庆典中，你将听到这种独特的\"安南鼓\"。乐队由掌鼓（指挥）带领，配以大钹、高低呐、椰胡、逗管等乐器。乐曲时而激昂如《一枝花》，时而悠扬。这种曾被视为\"战鼓\"的高音鼓点，是林浦巡境队伍中不可或缺的听觉灵魂。",
      },
      {
        id: 4,
        title: "问杯",
        tag: "分米祈福",
        icon: "https://101.34.247.48:8888/down/W6LFWM2ZvBfz.png",
        image: "/images/hero_baibai.jpg",
        images: [
          "https://101.34.247.48:8888/down/W6LFWM2ZvBfz.png",
          "https://101.34.247.48:8888/down/hsWFpf413RMA.png"
        ],
        origin: "相传南宋末年，陈宜中丞相在宋军撤离前，将多余军粮挨家挨户分发给百姓，助民度过难关。",
        desc: "在林浦泰山宫的元宵祭祀等活动中，保留着独特的\"分米\"仪式。这不仅是向神明祈求丰衣足食，更是为了纪念陈宜中丞相留粮惠民的恩德。明代尚书林瀚曾赋诗\"至今遗恨江心水\"以感怀此事。参与分米，便是参与这份跨越千年的感恩与传承。",
      }
    ]
  },

  onLoad: function(options) {
    // 页面加载时的初始化逻辑可以放在这里
  },

  // 显示详情，增加震动反馈
  showDetail(e) {
    const index = e.currentTarget.dataset.index;
    // 触感反馈，增强点击体验
    wx.vibrateShort({ type: 'light' });
    
    this.setData({
      currentItem: this.data.experiences[index],
      showModal: true
    });

    // 记录已完成的体验，与成就系统联动
    this.recordExperienceDone(this.data.experiences[index].id);
  },

  /**
   * 记录体验完成到本地缓存（成就系统联动）
   */
  recordExperienceDone(experienceId) {
    try {
      let userData = wx.getStorageSync('linpu_user_data') || { totalExp: 0 };
      let done = userData.doneExperiences || [];
      
      if (!done.includes(experienceId)) {
        done.push(experienceId);
        userData.doneExperiences = done;
        userData.experienceDone = done.length;
        userData.totalExp = (userData.totalExp || 0) + 80; // 每个新体验+80EXP
        
        let progressCache = wx.getStorageSync('linpu_progress_cache') || {};
        progressCache.experienceDone = done.length;
        wx.setStorageSync('linpu_progress_cache', progressCache);
        
        wx.setStorageSync('linpu_user_data', userData);
        
        console.log(`体验 ${experienceId} 已记录完成，总计: ${done.length}/4`);
      }
    } catch (e) {
      console.log('记录体验完成失败:', e);
    }
  },

  // 关闭详情
  closeDetail() {
    this.setData({
      showModal: false
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
})