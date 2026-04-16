Page({
  data: {
    scale: 1.2, // 默认放大一点点
    activeLocation: null, // 当前选中的地点
    showDrawer: false, // 是否显示底部抽屉
    // 地图锚点数据 (这里的 left 和 top 比例需要美工配合底图稍微微调一下)
    locations: [
      {
        id: 'lianshu',
        name: '濂江书院',
        type: '文化地标',
        left: '60%', 
        top: '30%',
        brief: '千年学风传承，朱熹曾在此讲学，感受理学之光。'
      },
      {
        id: 'shigong',
        name: '世公保',
        type: '建筑遗存',
        left: '30%',
        top: '50%',
        brief: '“三代五尚书”家族纪念地，尽显闽派古建底蕴。'
      },
      {
        id: 'taishan',
        name: '泰山宫',
        type: '信仰中心',
        left: '50%',
        top: '70%',
        brief: '南宋端宗驻跸处，承载抗元历史与安南伬非遗之音。'
      }
    ]
  },

  // 用户点击地图上的锚点
  onAnchorTap(e) {
    const id = e.currentTarget.dataset.id;
    const location = this.data.locations.find(loc => loc.id === id);
    
    // 震动反馈增加交互感
    wx.vibrateShort({ type: 'light' });

    this.setData({
      activeLocation: location,
      showDrawer: true
    });
  },

  // 关闭底部抽屉
  closeDrawer() {
    this.setData({ showDrawer: false });
  },

  // 核心跳转：进入具体探索场景
  enterScene() {
    const id = this.data.activeLocation.id;
    wx.navigateTo({
      // 直接复用我们刚刚合并好的通用 scene 页面！
      url: `/pages/scene/scene?id=${id}`
    });
    
    // 延迟关闭抽屉，保证用户从场景返回地图时抽屉是收起状态
    setTimeout(() => {
      this.setData({ showDrawer: false });
    }, 500);
  }
});