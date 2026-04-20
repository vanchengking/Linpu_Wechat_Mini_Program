// pages/linpu/linpu.js
Page({
  data: {
    highlights: [
      {
        id: 1,
        icon: '🏯',
        title: '三代五尚书',
        desc: '林氏家族出过三位尚书、五位进士，"三代五尚书"名扬闽都，彰显千年文风鼎盛。'
      },
      {
        id: 2,
        icon: '📚',
        title: '濂江书院',
        desc: '福州保存最完好的古书院，南宋大儒朱熹曾在此讲学，"宋朱熹讲学处"巨碑至今犹存。'
      },
      {
        id: 3,
        icon: '👑',
        title: '南宋行宫',
        desc: '南宋德祐二年，益王赵昰在此登基称帝，行宫改为泰山宫，承载着宋末抗元的悲壮历史。'
      },
      {
        id: 4,
        icon: '🎊',
        title: '民俗巡境',
        desc: '千年沿袭的巡境活动融合冲宫、安南伬、分米祈福等仪式，被列入省级非遗保护。'
      }
    ],
    timeline: [
      { era: '唐末', event: '林氏始祖定居濂江，林浦村雏形初现' },
      { era: '南宋', event: '朱熹来此讲学，濂江书院成为闽学重镇' },
      { era: '1276年', event: '益王赵昰驻跸林浦登基，后改行宫为泰山宫' },
      { era: '明代', event: '林瀚官至尚书，林氏"三代五尚书"鼎盛一时' },
      { era: '现代', event: '泰山宫、濂江书院等列入省市级文保单位' }
    ],
    villageStats: [
      { value: '1000+', label: '年历史' },
      { value: '6', label: '处文保建筑' },
      { value: '4', label: '项民俗体验' },
      { value: '3', label: '代五尚书' }
    ]
  },

  onLoad() {},

  goToMap() {
    wx.switchTab({ url: '/pages/map/map' });
  },

  goToExperience() {
    wx.switchTab({ url: '/pages/experience/experience' });
  },

  goToAR() {
    wx.switchTab({ url: '/pages/ar/ar' });
  },

  onShareAppMessage() {
    return {
      title: '走进千年古村——林浦印象',
      path: '/pages/linpu/linpu',
      imageUrl: '/resources/icons/云塔.png'
    };
  }
});
