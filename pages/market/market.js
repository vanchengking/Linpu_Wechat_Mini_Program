// pages/market/market.js
Page({
  data: {
    userPoints: 0,
    cartCount: 0,
    showCouponModal: false,
    coupons: [
      { id: 1, discountText: '9折 抵用券', cost: 100, discount: 0.9 },
      { id: 2, discountText: '8折 抵用券', cost: 200, discount: 0.8 },
      { id: 3, discountText: '7折 抵用券', cost: 400, discount: 0.7 },
      { id: 4, discountText: '5折 抵用券', cost: 800, discount: 0.5 }
    ],
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
        image: 'https://bl.meishipay.com/images/content/product/帆布袋.png', // 暂用占位图
        desc: '融合朱子理学元素的环保帆布袋，日常出行皆可展现文化底蕴。'
      },
      {
        id: 2,
        name: '《林浦志》复刻版',
        category: 'book',
        price: '88.00',
        sales: 56,
        image: 'https://bl.meishipay.com/images/content/product/《林浦志》.png',
        desc: '精装线装书，收录林浦千年历史变迁与名人事迹。'
      },
      {
        id: 3,
        name: '泰山宫祈福御守',
        category: 'souvenir',
        price: '19.90',
        sales: 452,
        image: 'https://bl.meishipay.com/images/content/product/御守.png',
        desc: '源自泰山宫的平安御守，寓意福泽绵长，出入平安。'
      },
      {
        id: 4,
        name: '“三代五尚书”主题书签',
        category: 'culture',
        price: '15.00',
        sales: 320,
        image: 'https://bl.meishipay.com/images/content/product/书签.png',
        desc: '黄铜镂空工艺，以林浦世公保建筑特色为设计灵感。'
      },
      {
        id: 5,
        name: '宋代茶盏（复刻）',
        category: 'souvenir',
        price: '128.00',
        sales: 45,
        image: 'https://bl.meishipay.com/images/content/product/宋代茶盏.png',
        desc: '体验宋代点茶文化的必备器具，重温南宋风雅。'
      },
      {
        id: 6,
        name: '林浦古村手绘明信片',
        category: 'culture',
        price: '25.00',
        sales: 210,
        image: 'https://bl.meishipay.com/images/content/product/明信片.png',
        desc: '一套8张，水彩手绘还原林浦古村的静谧角落与历史建筑。'
      },
      {
        id: 7,
        name: '《林浦建筑文化》图鉴',
        category: 'book',
        price: '68.00',
        sales: 89,
        image: 'https://bl.meishipay.com/images/content/product/建筑图鉴1.png',
        desc: '深入解析林浦古建筑群的榫卯结构与雕花艺术，附赠建筑线稿。'
      },
      {
        id: 8,
        name: '林浦非遗剪纸摆件',
        category: 'souvenir',
        price: '45.00',
        sales: 156,
        image: 'https://bl.meishipay.com/images/content/product/剪纸摆件1.png',
        desc: '非遗传承人手工剪制，亚克力封装，展现林浦民俗风情。'
      },
      {
        id: 9,
        name: '尚书家风定制折扇',
        category: 'culture',
        price: '58.00',
        sales: 198,
        image: 'https://bl.meishipay.com/images/content/product/折扇1.png',
        desc: '竹骨折扇，扇面题写“三代五尚书”家训，夏日纳凉尽显文人气息。'
      }
    ],
    filteredProducts: []
  },

  onLoad() {
    this.filterProducts('all');
  },

  onShow() {
    // 每次显示页面时更新积分和购物车数量
    this.setData({
      userPoints: getApp().getPoints()
    });
    this.updateCartCount();
  },

  updateCartCount() {
    const cart = wx.getStorageSync('cart') || [];
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    this.setData({ cartCount: count });
  },

  goToCart() {
    wx.navigateTo({
      url: '/pages/cart/cart'
    });
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
    wx.navigateTo({
      url: `/pages/product-detail/product-detail?id=${id}`
    });
  },

  addToCart(e) {
    const id = e.currentTarget.dataset.id;
    const product = this.data.products.find(p => p.id === id);
    if (!product) return;

    let cart = wx.getStorageSync('cart') || [];
    const idx = cart.findIndex(item => item.id === id);
    if (idx > -1) {
      cart[idx].quantity += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1
      });
    }
    wx.setStorageSync('cart', cart);
    this.updateCartCount();

    wx.showToast({
      title: '已加入购物车',
      icon: 'success'
    });
  },

  // 打开积分兑换弹窗
  openCouponModal() {
    this.setData({
      showCouponModal: true,
      userPoints: getApp().getPoints()
    });
  },

  // 关闭积分兑换弹窗
  closeCouponModal() {
    this.setData({
      showCouponModal: false
    });
  },

  // 兑换优惠券
  exchangeCoupon(e) {
    const couponId = e.currentTarget.dataset.id;
    const coupon = this.data.coupons.find(c => c.id === couponId);
    
    if (!coupon) return;

    wx.showModal({
      title: '确认兑换',
      content: `是否花费 ${coupon.cost} 积分兑换 ${coupon.discountText}？`,
      success: (res) => {
        if (res.confirm) {
          const success = getApp().deductPoints(coupon.cost);
          if (success) {
            this.setData({
              userPoints: getApp().getPoints()
            });
            // 将获取到的抵用券存入缓存
            getApp().addCoupon(coupon);
            wx.showToast({
              title: '兑换成功',
              icon: 'success'
            });
          } else {
            wx.showToast({
              title: '积分不足',
              icon: 'none'
            });
          }
        }
      }
    });
  }
});