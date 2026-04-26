// pages/record/record.js
const DEFAULT_AVATAR = 'https://bl.meishipay.com/images/content/%E4%BA%BA%E7%89%A9/%E9%BB%98%E8%AE%A4%E5%A4%B4%E5%83%8F.png';

Page({
  data: {
    defaultAvatar: DEFAULT_AVATAR,
    avatarUrl: '',
    currentTab: 'checkin',
    totalDays: 7,
    stats: {
      landmarkVisited: 3,
      experienceDone: 2,
      arScanned: 4
    },
    checkinRecords: [
      {
        date: '2026年4月20日',
        records: [
          { id: 1, title: '林浦泰山宫', time: '14:30', tag: '已打卡' },
          { id: 2, title: '世公保尚书家庙', time: '15:15', tag: '已打卡' },
          { id: 3, title: '濂江书院', time: '16:00', tag: '已打卡' }
        ]
      },
      {
        date: '2026年4月18日',
        records: [
          { id: 4, title: '林浦泰山宫（再次到访）', time: '10:20', tag: '已打卡' }
        ]
      }
    ],
    experienceRecords: [
      {
        date: '2026年4月19日',
        records: [
          { id: 1, title: '参与巡境活动', time: '09:30', tag: '已完成' },
          { id: 2, title: '观赏安南伬演奏', time: '14:00', tag: '已完成' }
        ]
      }
    ],
    scanRecords: [
      {
        date: '2026年4月20日',
        records: [
          { id: 1, title: '泰山宫场景扫描', time: '14:45', tag: 'AR' },
          { id: 2, title: '世公保场景扫描', time: '15:30', tag: 'AR' },
          { id: 3, title: '濂江书院场景扫描', time: '16:20', tag: 'AR' },
          { id: 4, title: '古街全景扫描', time: '17:00', tag: 'AR' }
        ]
      }
    ]
  },

  onLoad() {
    this.loadFromCache();
  },

  loadFromCache() {
    try {
      const userData = wx.getStorageSync('linpu_user_data');
      const cachedProfile = wx.getStorageSync('linpu_cloud_profile') || {};
      if (userData) {
        this.setData({
          avatarUrl: cachedProfile.avatarUrl || '',
          stats: {
            landmarkVisited: userData.landmarkVisited || 0,
            experienceDone: userData.experienceDone || 0,
            arScanned: userData.arScanned || 0
          }
        });
      }
    } catch (e) {}
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    wx.vibrateShort({ type: 'light' });
    this.setData({ currentTab: tab });
  },

  onShareAppMessage() {
    return {
      title: '我的林浦探索足迹',
      path: '/pages/record/record'
    };
  }
});
