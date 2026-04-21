Page({
  data: {
    showModal: false,
    currentItem: {},
    experiences: [
      {
        id: 1,
        title: "初识林浦",
        tag: "尚书里",
        icon: "/www/wwwroot/bl.meishipay.com/images/content/scene/场景1-尚书里.png",
        image: "/www/wwwroot/bl.meishipay.com/images/content/scene/场景1-尚书里.png",
        images: [
          "/www/wwwroot/bl.meishipay.com/images/content/scene/场景1-尚书里.png"
        ],
        origin: "明隆庆年间皇帝赐修。上面刻着林氏'三代五尚书'的名字——林瀚、林庭㭿、林庭机、林燫、林烃。一门三代，五尚书，七科八进士！《明史》都夸赞说'明代三世五尚书，并得谥文，林氏一家而已'。",
        desc: "欢迎来到林浦村！古村长带你从这'尚书里'牌坊开始旅程。这是林浦的骄傲，一门三代五尚书的荣耀从这里开始。林氏有'四正文化'——养正心、崇正道、务正学、亲正人，做官先做人，清廉是本。",
      },
      {
        id: 2,
        title: "书院论道",
        tag: "濂江书院",
        icon: "/www/wwwroot/bl.meishipay.com/images/content/scene/场景2-廉江书院.png",
        image: "/www/wwwroot/bl.meishipay.com/images/content/scene/场景2-廉江书院.png",
        images: [
          "/www/wwwroot/bl.meishipay.com/images/content/scene/场景2-廉江书院.png"
        ],
        origin: "朱熹当年游历至此，见此地山水清秀，学子勤勉，便在此讲学数载。濂江书院是福州唯一保存至今的古书院。",
        desc: "朱熹在此教他们'格物致知'——探究万物，获得真知。照壁上'文光射斗'四字，便是朱夫子对学子们的期许。那石臼是师生洗笔之处，旁刻'知鱼乐'——读书要用心体会。后来的三代五尚书，皆受此学风熏陶。",
      },
      {
        id: 3,
        title: "家庙荣光",
        tag: "世公保尚书家庙",
        icon: "/www/wwwroot/bl.meishipay.com/images/content/scene/场景3-世公保尚书家庙.png",
        image: "/www/wwwroot/bl.meishipay.com/images/content/scene/场景3-世公保尚书家庙.png",
        images: [
          "/www/wwwroot/bl.meishipay.com/images/content/scene/场景3-世公保尚书家庙.png"
        ],
        origin: "按明制，三品以上官员方可建家庙。林瀚官至南京兵部尚书，正二品，故有此规制。门前'乌纱池'形如官帽，寓意官运亨通。",
        desc: "尚书伯林瀚告诉你：我父林元美（赠尚书），我林瀚，长子庭㭿，次子庭机，孙林燫。一门三代，五尚书，七科八进士。'四正文化'——养正心、崇正道、务正学、亲正人，是我林氏家训之本。'四知堂'取自杨震'天知地知你知我知'，一生自勉。",
      },
      {
        id: 4,
        title: "非遗传承",
        tag: "林浦街巷",
        icon: "/www/wwwroot/bl.meishipay.com/images/content/scene/场景4-街巷.png",
        image: "/www/wwwroot/bl.meishipay.com/images/content/scene/场景4-街巷.png",
        images: [
          "/www/wwwroot/bl.meishipay.com/images/content/scene/场景4-街巷.png"
        ],
        origin: "安南伬是从安南国传来的鼓乐，南宋皇帝逃到林浦时随行乐师所教。踩街游神抬着泰山神像巡游，分米活动纪念陈宜中丞相分粮惠民之恩。",
        desc: "老艺人告诉你：再过几天就是元宵，咱们林浦的'迎泰山'游神可热闹了！咚咚咚的鼓点一响整条街都震起来！战鼓、唢呐、椰胡、大锣小锣……《一枝花》从宋朝传下来。塔骨神将三米多高，小孩子看了又怕又爱看！每年元宵分米纪念陈宜中——'义重山丘陈宜中'！",
      },
      {
        id: 5,
        title: "帝昺还魂",
        tag: "进士木牌坊",
        icon: "/www/wwwroot/bl.meishipay.com/images/content/scene/场景5-进士木牌坊2.png",
        image: "/www/wwwroot/bl.meishipay.com/images/content/scene/场景5-进士木牌坊2.png",
        images: [
          "/www/wwwroot/bl.meishipay.com/images/content/scene/场景5-进士木牌坊2.png"
        ],
        origin: "崖山海战，宋军全军覆没。陆秀夫背着年仅七岁的宋少帝赵昺跳海殉国，十万军民随之赴死。这是中国历史上最悲壮的一页。",
        desc: "'朕……好冷。朕是赵昺……那年才七岁。'宋少帝的灵魂在进士牌坊徘徊。元兵围船，陆先生背着他跳入海中。他想念林浦百姓送的大米，想念哥哥端宗皇帝。'告诉哥哥……朕想他。'去泰山宫帮他转告吧。",
      },
      {
        id: 6,
        title: "泰山守护",
        tag: "泰山宫",
        icon: "/www/wwwroot/bl.meishipay.com/images/content/scene/场景6-泰山宫.png",
        image: "/www/wwwroot/bl.meishipay.com/images/content/scene/场景6-泰山宫.png",
        images: [
          "/www/wwwroot/bl.meishipay.com/images/content/scene/场景6-泰山宫.png"
        ],
        origin: "1276年元兵攻陷临安，陆秀夫、张世杰护着两个小皇帝从海上逃到林浦，在泰山宫住下并拥立端宗皇帝改元景炎。百姓称此为'崖山行宫'。",
        desc: "'这里就是朕住过的地方——平山堂。'宋端宗赵昰在此等了你七百多年。这里的百姓给朕送米，小朋友陪朕玩。朕好想抱抱弟弟……谢谢你帮我们传话。'这片土地就交给你们了。记住林浦，记住这里的百姓，记住这段历史。'"
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

    // 记录打开弹窗的时间
    this.data.modalOpenTime = Date.now();
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
        
        console.log(`体验 ${experienceId} 已记录完成，总计: ${done.length}/6`);

        // 检查是否6个全部看完
        if (done.length >= 6) {
          const hasGotAllPoints = wx.getStorageSync('experience_all_points_got');
          if (!hasGotAllPoints) {
            getApp().addPoints(50, '阅读全部文化解码');
            wx.setStorageSync('experience_all_points_got', true);
          }
        }
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

    // 计算停留时间
    if (this.data.modalOpenTime) {
      const stayTime = Date.now() - this.data.modalOpenTime;
      if (stayTime >= 5000) { // 停留大于等于5秒
        this.recordExperienceDone(this.data.currentItem.id);
      } else {
        wx.showToast({
          title: '阅读满5秒才可获得记录与积分哦',
          icon: 'none'
        });
      }
      this.data.modalOpenTime = 0;
    }
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