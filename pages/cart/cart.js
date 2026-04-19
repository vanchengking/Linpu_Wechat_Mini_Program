const app = getApp();

Page({
  data: {
    cartItems: [],
    isAllSelected: false,
    totalPrice: '0.00',
    rawTotalPrice: '0.00',
    discountAmount: '0.00',
    selectedCount: 0,
    availableCoupons: [],
    selectedCoupon: null
  },

  onShow() {
    this.loadCart();
    this.loadAvailableCoupons();
  },

  // 加载可用优惠券
  loadAvailableCoupons() {
    const coupons = getApp().getAvailableCoupons();
    this.setData({ availableCoupons: coupons });
  },

  // 打开优惠券选择器
  openCouponPicker() {
    if (this.data.availableCoupons.length === 0) {
      wx.showToast({ title: '暂无可用优惠券', icon: 'none' });
      return;
    }

    const itemList = this.data.availableCoupons.map(c => c.discountText);
    itemList.push('不使用优惠券');

    wx.showActionSheet({
      itemList: itemList,
      success: (res) => {
        if (res.tapIndex === itemList.length - 1) {
          this.setData({ selectedCoupon: null });
        } else {
          this.setData({ selectedCoupon: this.data.availableCoupons[res.tapIndex] });
        }
        this.calculateTotal();
      }
    });
  },

  // 加载购物车数据
  loadCart() {
    let cart = wx.getStorageSync('cart') || [];
    // 为每个商品添加选中状态，默认为选中
    cart = cart.map(item => ({
      ...item,
      selected: item.selected !== undefined ? item.selected : true
    }));
    this.setData({ cartItems: cart });
    this.calculateTotal();
  },

  // 计算合计价格和数量
  calculateTotal() {
    const { cartItems, selectedCoupon } = this.data;
    let total = 0;
    let count = 0;
    let allSelected = cartItems.length > 0;

    cartItems.forEach(item => {
      if (item.selected) {
        total += parseFloat(item.price) * item.quantity;
        count += item.quantity;
      } else {
        allSelected = false;
      }
    });

    let rawTotal = total;
    let discount = 0;

    if (selectedCoupon && total > 0) {
      // 计算折后价 (例如 0.9 折扣，则优惠 10%)
      const discountedTotal = total * selectedCoupon.discount;
      discount = total - discountedTotal;
      total = discountedTotal;
    }

    this.setData({
      rawTotalPrice: rawTotal.toFixed(2),
      discountAmount: discount.toFixed(2),
      totalPrice: total.toFixed(2),
      selectedCount: count,
      isAllSelected: allSelected
    });

    // 同步到本地缓存，保留选中状态
    wx.setStorageSync('cart', cartItems);
  },

  // 切换单个选中状态
  toggleSelect(e) {
    const index = e.currentTarget.dataset.index;
    const { cartItems } = this.data;
    cartItems[index].selected = !cartItems[index].selected;
    this.setData({ cartItems });
    this.calculateTotal();
  },

  // 切换全选状态
  toggleSelectAll() {
    const { isAllSelected, cartItems } = this.data;
    const nextSelected = !isAllSelected;
    cartItems.forEach(item => {
      item.selected = nextSelected;
    });
    this.setData({
      cartItems,
      isAllSelected: nextSelected
    });
    this.calculateTotal();
  },

  // 修改数量
  changeQuantity(e) {
    const index = e.currentTarget.dataset.index;
    const delta = parseInt(e.currentTarget.dataset.delta);
    const { cartItems } = this.data;
    
    const newQty = cartItems[index].quantity + delta;
    if (newQty < 1) return;
    
    cartItems[index].quantity = newQty;
    this.setData({ cartItems });
    this.calculateTotal();
  },

  // 输入框修改数量
  inputQuantity(e) {
    const index = e.currentTarget.dataset.index;
    let val = parseInt(e.detail.value);
    if (isNaN(val) || val < 1) val = 1;
    
    const { cartItems } = this.data;
    cartItems[index].quantity = val;
    this.setData({ cartItems });
    this.calculateTotal();
  },

  // 移除商品
  removeItem(e) {
    const index = e.currentTarget.dataset.index;
    const { cartItems } = this.data;
    
    wx.showModal({
      title: '提示',
      content: '确定从购物车移除该商品吗？',
      success: (res) => {
        if (res.confirm) {
          cartItems.splice(index, 1);
          this.setData({ cartItems });
          this.calculateTotal();
        }
      }
    });
  },

  // 去结算
  checkout() {
    if (this.data.selectedCount === 0) {
      wx.showToast({
        title: '请选择商品',
        icon: 'none'
      });
      return;
    }
    
    wx.showLoading({ title: '正在下单...' });
    setTimeout(() => {
      wx.hideLoading();
      
      const { selectedCoupon, totalPrice } = this.data;
      
      wx.showModal({
        title: '下单成功',
        content: `您已成功下单，共计 ¥${totalPrice}${selectedCoupon ? ' (已使用' + selectedCoupon.discountText + ')' : ''}。`,
        showCancel: false,
        success: () => {
          // 如果使用了优惠券，将其标记为已使用
          if (selectedCoupon) {
            getApp().useCoupon(selectedCoupon.id);
          }

          // 清空已选商品
          const remainingItems = this.data.cartItems.filter(item => !item.selected);
          this.setData({ 
            cartItems: remainingItems,
            selectedCoupon: null 
          });
          this.calculateTotal();
          wx.switchTab({
            url: '/pages/market/market'
          });
        }
      });
    }, 1500);
  },

  // 去市集
  goMarket() {
    wx.switchTab({
      url: '/pages/market/market'
    });
  },

  // 点击图片进入详情
  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/product-detail/product-detail?id=${id}`
    });
  }
});