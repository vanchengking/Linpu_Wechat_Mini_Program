// pages/feedback/feedback.js
Page({
  data: {
    selectedType: '',
    rating: 0,
    content: '',
    contact: '',
    showSuccessModal: false,
    feedbackTypes: [
      { value: 'feature', label: '功能建议', icon: '💡' },
      { value: 'bug', label: '问题反馈', icon: '🐛' },
      { value: 'content', label: '内容纠错', icon: '📝' },
      { value: 'ui', label: '界面优化', icon: '🎨' },
      { value: 'other', label: '其他', icon: '📢' }
    ],
    ratingLabels: ['非常不满意', '不满意', '一般', '满意', '非常满意'],
    quickTags: [
      '希望增加更多地标信息',
      'AR体验可以更流畅',
      '建议增加离线功能',
      '地图定位不够精准',
      '希望能保存探索笔记',
      '界面配色很好看'
    ]
  },

  selectType(e) {
    const value = e.currentTarget.dataset.value;
    wx.vibrateShort({ type: 'light' });
    this.setData({ selectedType: value });
  },

  setRating(e) {
    const rating = e.currentTarget.dataset.rating;
    wx.vibrateShort({ type: 'light' });
    this.setData({ rating });
  },

  onContentInput(e) {
    this.setData({ content: e.detail.value });
  },

  onContactInput(e) {
    this.setData({ contact: e.detail.value });
  },

  appendTag(e) {
    const tag = e.currentTarget.dataset.tag;
    wx.vibrateShort({ type: 'light' });
    const newContent = this.data.content ? this.data.content + ' ' + tag : tag;
    if (newContent.length <= 500) {
      this.setData({ content: newContent });
    }
  },

  submitFeedback() {
    const { selectedType, rating, content } = this.data;

    if (!content.trim()) {
      wx.showToast({ title: '请输入您的建议', icon: 'none' });
      return;
    }

    if (!selectedType) {
      wx.showToast({ title: '请选择建议类型', icon: 'none' });
      return;
    }

    if (rating === 0) {
      wx.showToast({ title: '请给出满意度评分', icon: 'none' });
      return;
    }

    // 模拟提交
    wx.showLoading({ title: '提交中...' });

    setTimeout(() => {
      wx.hideLoading();
      this.setData({ showSuccessModal: true });

      // 保存到本地
      try {
        const feedbackList = wx.getStorageSync('linpu_feedback') || [];
        feedbackList.push({
          type: selectedType,
          rating,
          content,
          contact: this.data.contact,
          time: new Date().toISOString()
        });
        wx.setStorageSync('linpu_feedback', feedbackList);
      } catch (e) {}
    }, 1000);
  },

  closeSuccessModal() {
    this.setData({
      showSuccessModal: false,
      selectedType: '',
      rating: 0,
      content: '',
      contact: ''
    });
  }
});
