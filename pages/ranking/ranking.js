// pages/ranking/ranking.js
const DEFAULT_AVATAR = 'https://bl.meishipay.com/images/content/%E4%BA%BA%E7%89%A9/%E9%BB%98%E8%AE%A4%E5%A4%B4%E5%83%8F.png';

Page({
  data: {
    defaultAvatar: DEFAULT_AVATAR,
    currentTab: 'exp',
    topThree: [],
    rankList: [],
    myRank: 4,
    myScore: 1280,

    // 各分类数据
    expData: [
      { rank: 1, name: '林浦通·阿明', level: 8, title: '林浦通', lvColor: 'top-lv', score: 3650, isMe: false },
      { rank: 2, name: '文化行者·小林', level: 7, title: '历史探寻者', lvColor: 'high', score: 2980, isMe: false },
      { rank: 3, name: '古迹爱好者', level: 6, title: '古迹守护者', lvColor: 'high', score: 2340, isMe: false },
      { rank: 4, name: '我', level: 5, title: '文化行者', lvColor: 'mid', score: 1280, isMe: true },
      { rank: 5, name: '新手探险者', level: 3, title: '文化学徒', lvColor: 'low', score: 650, isMe: false },
      { rank: 6, name: '游客小明', level: 2, title: '好奇游客', lvColor: 'low', score: 320, isMe: false },
      { rank: 7, name: '旅行者阿华', level: 1, title: '初来乍到', lvColor: 'low', score: 120, isMe: false }
    ],
    landmarkData: [
      { rank: 1, name: '林浦通·阿明', level: 8, title: '林浦通', lvColor: 'top-lv', score: 6, isMe: false },
      { rank: 2, name: '古迹爱好者', level: 6, title: '古迹守护者', lvColor: 'high', score: 5, isMe: false },
      { rank: 3, name: '我', level: 5, title: '文化行者', lvColor: 'mid', score: 3, isMe: true },
      { rank: 4, name: '文化行者·小林', level: 7, title: '历史探寻者', lvColor: 'high', score: 3, isMe: false },
      { rank: 5, name: '新手探险者', level: 3, title: '文化学徒', lvColor: 'low', score: 1, isMe: false },
      { rank: 6, name: '旅行者阿华', level: 1, title: '初来乍到', lvColor: 'low', score: 0, isMe: false }
    ],
    badgeData: [
      { rank: 1, name: '林浦通·阿明', level: 8, title: '林浦通', lvColor: 'top-lv', score: 5, isMe: false },
      { rank: 2, name: '文化行者·小林', level: 7, title: '历史探寻者', lvColor: 'high', score: 4, isMe: false },
      { rank: 3, name: '古迹爱好者', level: 6, title: '古迹守护者', lvColor: 'high', score: 3, isMe: false },
      { rank: 4, name: '我', level: 5, title: '文化行者', lvColor: 'mid', score: 2, isMe: true },
      { rank: 5, name: '新手探险者', level: 3, title: '文化学徒', lvColor: 'low', score: 1, isMe: false },
      { rank: 6, name: '旅行者阿华', level: 1, title: '初来乍到', lvColor: 'low', score: 1, isMe: false }
    ]
  },

  onLoad() {
    this.updateView();
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    wx.vibrateShort({ type: 'light' });
    this.setData({ currentTab: tab });
    this.updateView();
  },

  updateView() {
    const { currentTab, expData, landmarkData, badgeData } = this.data;
    let dataSource;
    switch (currentTab) {
      case 'exp': dataSource = expData; break;
      case 'landmark': dataSource = landmarkData; break;
      case 'badge': dataSource = badgeData; break;
    }

    const topThree = dataSource.slice(0, 3);
    const myEntry = dataSource.find(d => d.isMe);

    this.setData({
      topThree,
      rankList: dataSource,
      myRank: myEntry ? myEntry.rank : 0,
      myScore: myEntry ? myEntry.score : 0
    });
  },

  onShareAppMessage() {
    return {
      title: '林浦印象探险排行榜',
      path: '/pages/ranking/ranking'
    };
  }
});
