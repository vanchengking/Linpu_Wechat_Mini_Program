// pages/market/market.js
const preloadUtil = require('../../utils/preload');

Page({
  data: {
    userPoints: 0,
    cartCount: 0,
    showCouponModal: false,
    coupons: [
      { id: 1, discountText: '9折\n抵用券', cost: 100, discount: 0.9 },
      { id: 2, discountText: '8折\n抵用券', cost: 200, discount: 0.8 },
      { id: 3, discountText: '7折\n抵用券', cost: 400, discount: 0.7 },
      { id: 4, discountText: '5折\n抵用券', cost: 800, discount: 0.5 }
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
        image: 'https://bl.meishipay.com/images/content/product/帆布袋.png',
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
        name: '"三代五尚书"主题书签',
        category: 'culture',
        price: '15.00',
        sales: 320,
        image: 'https://bl.meishipay.com/images/content/product/书签1.png',
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
        desc: '竹骨折扇，扇面题写"三代五尚书"家训，夏日纳凉尽显文人气息。'
      }
    ],
    filteredProducts: []
  },

  onLoad() {
    this.filterProducts('all');
    // 初始化每个商品的选中数量
    this.initProductQty();
    // 立即开始预加载商品图片（不等3秒延迟）
    preloadUtil.preloadPageImages('market');
  },

  /**
   * 初始化商品数量状态（用于页面上的加减选择器显示）
   * _qty 字段控制是否显示数量选择器：0=隐藏(显示加号)，>0=显示选择器
   */
  initProductQty() {
    const productsWithQty = this.data.products.map(p => ({ ...p, _qty: 0 }));
    this.setData({ products: productsWithQty });
    this.filterProducts(this.data.currentTab);
  },

  onShow() {
    // 每次显示页面时更新积分和购物车数量
    this.setData({
      userPoints: getApp().getPoints()
    });
    this.updateCartCount();

    // 按需预加载商城商品图片（仅首次）
    if (!this._preloaded) {
      preloadUtil.preloadPageImages('market');
      this._preloaded = true;
    }
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

  // 阻止事件冒泡（防止点击数量选择器时触发商品卡片跳转）
  stopPropagation() {
    // 空方法，仅用于阻止 catchtap 冒泡
  },

  /**
   * 增加商品数量
   * 点击加号或初始+按钮时调用
   */
  increaseQty(e) {
    const id = e.currentTarget.dataset.id;
    this.updateProductQty(id, 1);
  },

  /**
   * 减少商品数量
   * 点击减号时调用
   */
  decreaseQty(e) {
    const id = e.currentTarget.dataset.id;
    const product = this.data.products.find(p => p.id === id);
    if (!product || product._qty <= 0) return;

    if (product._qty <= 1) {
      // 数量为1时再减 → 归零，隐藏选择器，从购物车移除此商品
      this.updateProductQty(id, -1, true);
    } else {
      // 正常减1
      this.updateProductQty(id, -1, false);
    }
  },

  /**
   * 核心数量更新方法
   * @param {number} id 商品ID
   * @param {number} delta 变化量 (+1 或 -1)
   * @param {boolean} removeCart 是否同时从购物车删除（当 qty 归零时）
   */
  updateProductQty(id, delta, removeCart = false) {
    const products = this.data.products.map(p => {
      if (p.id === id) {
        const newQty = Math.max(0, p._qty + delta);
        return { ...p, _qty: newQty };
      }
      return p;
    });

    this.setData({ products });
    this.filterProducts(this.data.currentTab);

    // 同步购物车
    this.syncCartById(id, removeCart);
  },

  /**
   * 根据 _qty 同步本地购物车缓存
   */
  syncCartById(id, removeItem) {
    const product = this.data.products.find(p => p.id === id);
    if (!product) return;

    let cart = wx.getStorageSync('cart') || [];
    const idx = cart.findIndex(item => item.id === id);

    if (removeItem || product._qty <= 0) {
      // 从购物车移除
      if (idx > -1) {
        cart.splice(idx, 1);
      }
    } else if (idx > -1) {
      // 更新已有项数量
      cart[idx].quantity = product._qty;
    } else {
      // 新增到购物车
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: product._qty
      });
    }

    wx.setStorageSync('cart', cart);
    this.updateCartCount();
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

  // 阻止弹窗背景滚动穿透
  preventScroll() {
    return false;
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
