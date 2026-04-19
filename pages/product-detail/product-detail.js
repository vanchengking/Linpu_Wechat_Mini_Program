const app = getApp();

Page({
  data: {
    productId: null,
    product: {},
    cartCount: 0
  },

  onLoad(options) {
    const id = options.id;
    if (id) {
      this.setData({ productId: parseInt(id) });
      this.loadProductDetail(parseInt(id));
    }
    this.updateCartCount();
  },

  onShow() {
    this.updateCartCount();
  },

  // 模拟从后台或全局数据获取商品详情
  loadProductDetail(id) {
    // 这里为了演示，将 market.js 中的数据源提取并补充详情图片
    const allProducts = [
      {
        id: 1,
        name: '濂江书院定制帆布袋',
        category: 'culture',
        price: '39.00',
        sales: 128,
        image: 'https://asave.rutno.com/fileview?id=BMumLU82n7ZG',
        images: [
          'https://asave.rutno.com/fileview?id=BMumLU82n7ZG',
          'https://101.34.247.48:8888/down/eTzNzBC9Pu65.jpg'
        ],
        desc: '融合朱子理学元素的环保帆布袋，日常出行皆可展现文化底蕴。',
        detailImages: [
          // 预留商品详情图
          // 'https://example.com/detail1.png',
          // 'https://example.com/detail2.png'
        ]
      },
      {
        id: 2,
        name: '《林浦志》复刻版',
        category: 'book',
        price: '88.00',
        sales: 56,
        image: 'https://asave.rutno.com/fileview?id=BMumLU82n7ZG',
        images: ['https://asave.rutno.com/fileview?id=BMumLU82n7ZG'],
        desc: '精装线装书，收录林浦千年历史变迁与名人事迹。',
        detailImages: []
      },
      {
        id: 3,
        name: '泰山宫祈福御守',
        category: 'souvenir',
        price: '19.90',
        sales: 452,
        image: 'https://asave.rutno.com/fileview?id=BMumLU82n7ZG',
        images: ['https://asave.rutno.com/fileview?id=BMumLU82n7ZG'],
        desc: '源自泰山宫的平安御守，寓意福泽绵长，出入平安。',
        detailImages: []
      },
      {
        id: 4,
        name: '“三代五尚书”主题书签',
        category: 'culture',
        price: '15.00',
        sales: 320,
        image: 'https://asave.rutno.com/fileview?id=BMumLU82n7ZG',
        images: ['https://asave.rutno.com/fileview?id=BMumLU82n7ZG'],
        desc: '黄铜镂空工艺，以林浦世公保建筑特色为设计灵感。',
        detailImages: []
      },
      {
        id: 5,
        name: '宋代茶盏（复刻）',
        category: 'souvenir',
        price: '128.00',
        sales: 45,
        image: 'https://asave.rutno.com/fileview?id=BMumLU82n7ZG',
        images: ['https://asave.rutno.com/fileview?id=BMumLU82n7ZG'],
        desc: '体验宋代点茶文化的必备器具，重温南宋风雅。',
        detailImages: []
      },
      {
        id: 6,
        name: '林浦古村手绘明信片',
        category: 'culture',
        price: '25.00',
        sales: 210,
        image: 'https://asave.rutno.com/fileview?id=BMumLU82n7ZG',
        images: ['https://asave.rutno.com/fileview?id=BMumLU82n7ZG'],
        desc: '一套8张，水彩手绘还原林浦古村的静谧角落与历史建筑。',
        detailImages: []
      },
      {
        id: 7,
        name: '《林浦建筑文化》图鉴',
        category: 'book',
        price: '68.00',
        sales: 89,
        image: 'https://asave.rutno.com/fileview?id=BMumLU82n7ZG',
        images: ['https://asave.rutno.com/fileview?id=BMumLU82n7ZG'],
        desc: '深入解析林浦古建筑群的榫卯结构与雕花艺术，附赠建筑线稿。',
        detailImages: []
      },
      {
        id: 8,
        name: '林浦非遗剪纸摆件',
        category: 'souvenir',
        price: '45.00',
        sales: 156,
        image: 'https://asave.rutno.com/fileview?id=BMumLU82n7ZG',
        images: ['https://asave.rutno.com/fileview?id=BMumLU82n7ZG'],
        desc: '非遗传承人手工剪制，亚克力封装，展现林浦民俗风情。',
        detailImages: []
      },
      {
        id: 9,
        name: '尚书家风定制折扇',
        category: 'culture',
        price: '58.00',
        sales: 198,
        image: 'https://asave.rutno.com/fileview?id=BMumLU82n7ZG',
        images: ['https://asave.rutno.com/fileview?id=BMumLU82n7ZG'],
        desc: '竹骨折扇，扇面题写“三代五尚书”家训，夏日纳凉尽显文人气息。',
        detailImages: []
      }
    ];

    const product = allProducts.find(p => p.id === id) || allProducts[0];
    this.setData({ product });
  },

  // 预览大图
  previewImage(e) {
    const current = e.currentTarget.dataset.url;
    wx.previewImage({
      current: current,
      urls: this.data.product.images
    });
  },

  // 更新购物车角标
  updateCartCount() {
    const cart = wx.getStorageSync('cart') || [];
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    this.setData({ cartCount: count });
  },

  // 加入购物车
  addToCart() {
    let cart = wx.getStorageSync('cart') || [];
    const idx = cart.findIndex(item => item.id === this.data.productId);
    if (idx > -1) {
      cart[idx].quantity += 1;
    } else {
      cart.push({
        id: this.data.product.id,
        name: this.data.product.name,
        price: this.data.product.price,
        image: this.data.product.image,
        quantity: 1
      });
    }
    wx.setStorageSync('cart', cart);
    this.updateCartCount();

    wx.showToast({
      title: '已加入购物车',
      icon: 'success',
      duration: 2000
    });
  },

  // 立即购买
  buyNow() {
    this.addToCart();
    this.goCart();
  },

  // 占位功能
  showSpecModal() {
    wx.showToast({
      title: '规格选择开发中',
      icon: 'none'
    });
  },

  goHome() {
    wx.switchTab({
      url: '/pages/market/market'
    });
  },

  goCart() {
    wx.navigateTo({
      url: '/pages/cart/cart'
    });
  }
});