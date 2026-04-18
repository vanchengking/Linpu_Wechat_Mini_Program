// pages/market/market.js
Page({
  data: {
    currentTab: 'all',
    categories: [
      { id: 'all', name: '全部' },
      { id: 'culture', name: '文创周边' },
      { id: 'book', name: '古籍字画' },
      { id: 'souvenir', name: '特色纪念' }
    ],
    products: [
      {
        id: 1,
        name: '濂江书院定制帆布袋',
        category: 'culture',
        price: '39.00',
        sales: 128,
        image: 'https://asave.rutno.com/fileview?id=BMumLU82n7ZG', // 暂用占位图
        desc: '融合朱子理学元素的环保帆布袋，日常出行皆可展现文化底蕴。'
      },
      {
        id: 2,
        name: '《林浦志》复刻版',
        category: 'book',
        price: '88.00',
        sales: 56,
        image: 'https://asave.rutno.com/fileview?id=BMumLU82n7ZG',
        desc: '精装线装书，收录林浦千年历史变迁与名人事迹。'
      },
      {
        id: 3,
        name: '泰山宫祈福御守',
        category: 'souvenir',
        price: '19.90',
        sales: 452,
        image: 'https://asave.rutno.com/fileview?id=BMumLU82n7ZG',
        desc: '源自泰山宫的平安御守，寓意福泽绵长，出入平安。'
      },
      {
        id: 4,
        name: '“三代五尚书”主题书签',
        category: 'culture',
        price: '15.00',
        sales: 320,
        image: 'https://asave.rutno.com/fileview?id=BMumLU82n7ZG',
        desc: '黄铜镂空工艺，以林浦世公保建筑特色为设计灵感。'
      },
      {
        id: 5,
        name: '宋代茶盏（复刻）',
        category: 'souvenir',
        price: '128.00',
        sales: 45,
        image: 'https://asave.rutno.com/fileview?id=BMumLU82n7ZG',
        desc: '体验宋代点茶文化的必备器具，重温南宋风雅。'
      }
    ],
    filteredProducts: []
  },

  onLoad() {
    this.filterProducts('all');
  },

  switchTab(e) {
    const tabId = e.currentTarget.dataset.id;
    this.setData({ currentTab: tabId });
    this.filterProducts(tabId);
  },

  filterProducts(categoryId) {
    if (categoryId === 'all') {
      this.setData({ filteredProducts: this.data.products });
    } else {
      const filtered = this.data.products.filter(p => p.category === categoryId);
      this.setData({ filteredProducts: filtered });
    }
  },

  viewDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.showToast({
      title: '商品详情开发中...',
      icon: 'none'
    });
  },

  addToCart(e) {
    wx.showToast({
      title: '已加入购物车',
      icon: 'success'
    });
  }
});