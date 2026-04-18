Page({
  data: {
    scale: 1.2, // 默认放大一点点
    activeLocation: null, // 当前选中的地点
    showModal: false, // 是否显示中央悬浮窗
    // 地图锚点数据 (这里的 left 和 top 比例目前先随意放置)
    locations: [
      {
        id: 3,
        name: '濂江书院',
        type: '文化教育',
        protectionLevel: "福州市级文物保护单位",
        left: '15%', 
        top: '25%',
        images: [
          "https://101.34.247.48:8888/down/eTzNzBC9Pu65.jpg",
          "https://101.34.247.48:8888/down/Fu2P7KDHnWKZ.png",
          "https://101.34.247.48:8888/down/TTa6oRqkYWix.png"
        ],
        brief: '福州唯一保存完好的宋代古书院，朱熹及其弟子黄榦曾在此讲学。',
        intro: "濂江书院始建于唐末，迄今已有一千多年历史，是福州唯一一所保存最为完好的古书院。书院是林浦教育的发祥地，见证了林氏家族文风之盛。"
      },
      {
        id: 2,
        name: '世公保尚书家庙',
        type: '宗祠建筑',
        protectionLevel: "福州市级文物保护单位",
        left: '75%',
        top: '40%',
        images: [
          "https://101.34.247.48:8888/down/OgYQBzHxPO5O.jpg",
          "https://101.34.247.48:8888/down/0yd6tSidDl3S.png"
        ],
        brief: '始建于明正德十三年，系明代南京兵部尚书林瀚建造。为“三代五尚书”之纪念。',
        intro: "世宫保尚书林公家庙位于林浦村，始建于明正德十三年（1518年），系明代南京兵部尚书林瀚建造。它是林浦林氏家族辉煌历史的见证。"
      },
      {
        id: 1,
        name: '林浦泰山宫',
        type: '宫庙建筑',
        protectionLevel: "福建省级文物保护单位",
        left: '40%',
        top: '80%',
        images: [
          "https://101.34.247.48:8888/down/nx4A3JQ1lSnb.png",
          "https://101.34.247.48:8888/down/1Mel6AxuhALu.png",
          "https://101.34.247.48:8888/down/5dvT9jLjkRAg.jpg"
        ],
        brief: '原为平山阁，因南宋益王赵昰曾驻跸于此，后改称泰山宫。',
        intro: "林浦泰山宫位于福州市仓山区城门镇濂江村，原名平山阁。南宋末年，益王赵昰（后来的端宗）曾在此驻跸，故后世改称为泰山宫。"
      },
      {
        id: 4,
        name: '尚书里石牌坊',
        type: '牌坊建筑',
        protectionLevel: "历史构筑物",
        left: '20%',
        top: '65%',
        images: [
          "https://101.34.247.48:8888/down/oJPQSStUpA7r.png",
          "https://101.34.247.48:8888/down/4BkKW05UwDUi.jpg",
          "https://101.34.247.48:8888/down/ACctOTzMAkaf.jpg"
        ],
        brief: '表彰林瀚家族“三代五尚书”的显赫功绩，额刻“尚书里”。',
        intro: "尚书里石牌坊位于林浦狮山村，始建于明隆庆年间，是皇帝赐修以表彰林氏家族的功绩。"
      },
      {
        id: 5,
        name: '林浦断桥',
        type: '桥梁建筑',
        protectionLevel: "省级历史文化名村景点",
        left: '80%',
        top: '20%',
        images: [
          "https://101.34.247.48:8888/down/7uSZjtEegwT4.jpg",
          "https://101.34.247.48:8888/down/hAvpvdK1jnlz.jpg",
          "https://101.34.247.48:8888/down/papoTh2nRHQ3.jpg"
        ],
        brief: '始建于南宋绍兴三年，由疍民建造，桥体断裂原因成谜。',
        intro: "林浦断桥，俗称“三门桥”，始建于南宋绍兴三年（1133年）。它比福州著名的万寿桥还要早190年。"
      },
      {
        id: 6,
        name: '进士木牌坊',
        type: '牌坊建筑',
        protectionLevel: "林尚书家庙附属文物",
        left: '55%',
        top: '15%',
        images: [
          "https://101.34.247.48:8888/down/F62Wg7A49Zis.png",
          "https://101.34.247.48:8888/down/q3Mr7h1lFYDk.jpg",
          "https://101.34.247.48:8888/down/qcvNH6m7zG1o.jpg"
        ],
        brief: '俗称“柴坊”，建于明正德十一年，木构单檐歇山顶。',
        intro: "位于林浦街中，是林尚书家庙的附属文物。始建于明正德十一年（1516年），为纪念林瀚家族的科举成就而立。"
      }
    ]
  },

  // 用户点击地图上的锚点
  onAnchorTap(e) {
    const id = e.currentTarget.dataset.id;
    const location = this.data.locations.find(loc => loc.id == id);
    
    // 震动反馈增加交互感
    wx.vibrateShort({ type: 'light' });

    this.setData({
      activeLocation: location,
      showModal: true
    });
    
    wx.hideTabBar();
  },

  // 关闭悬浮窗
  closeModal() {
    this.setData({ showModal: false });
    wx.showTabBar();
  },

  // 进入场景探索
  enterScene() {
    const name = this.data.activeLocation.name;
    let sceneId = 'guide';
    
    // 根据名称匹配场景 ID
    if (name.includes('泰山宫')) sceneId = 'taishan';
    else if (name.includes('世公保')) sceneId = 'shigong';
    else if (name.includes('濂江书院')) sceneId = 'lianshu';
    
    wx.navigateTo({
      url: `/pages/scene/scene?id=${sceneId}`
    });
    
    // 延迟关闭弹窗
    setTimeout(() => {
      this.setData({ showModal: false });
      wx.showTabBar();
    }, 500);
  },

  // 跳转到聊天页面
  goToChat() {
    wx.navigateTo({
      url: '/pages/chat/chat'
    });
  }
});
