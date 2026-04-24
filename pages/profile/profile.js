const api = require('../../utils/api');
const auth = require('../../utils/auth');

Page({
  data: {
    loading: true,
    savingNickname: false,
    uploadingAvatar: false,
    bindingPhone: false,
    defaultAvatar: '/resources/icons/个人.png',
    profile: {
      nickname: '未登录',
      avatarUrl: '/resources/icons/个人.png',
      phone: '',
      phoneMasked: '未绑定手机号',
      points: 0,
      totalExp: 0,
      level: 1,
      levelTitle: '初来乍到',
      stats: {
        landmarkVisited: 0,
        experienceDone: 0,
        arScanned: 0
      }
    },
    editableNickname: '',
    syncText: '云端资料同步中...'
  },

  async onShow() {
    await this.initializeProfile();
  },

  async initializeProfile() {
    this.setData({ loading: true, syncText: '云端资料同步中...' });

    try {
      await auth.ensureLogin();
      await getApp().syncProfileSummary({ silent: true });
      const profile = await getApp().refreshUserProfile();
      this.applyProfile(profile);
      this.setData({
        loading: false,
        syncText: '数据已从云端加载'
      });
    } catch (error) {
      console.error('initializeProfile failed:', error);
      wx.showToast({
        title: '个人资料加载失败',
        icon: 'none'
      });

      const cachedProfile = wx.getStorageSync('linpu_cloud_profile');
      if (cachedProfile) {
        this.applyProfile(cachedProfile);
      }

      this.setData({
        loading: false,
        syncText: '当前展示的是本地缓存'
      });
    }
  },

  applyProfile(profile) {
    if (!profile) return;
    this.setData({
      profile,
      editableNickname: profile.nickname || ''
    });
  },

  onNicknameInput(event) {
    this.setData({
      editableNickname: event.detail.value
    });
  },

  async saveNickname() {
    const nickname = (this.data.editableNickname || '').trim();
    if (!nickname) {
      wx.showToast({
        title: '昵称不能为空',
        icon: 'none'
      });
      return;
    }

    this.setData({ savingNickname: true });
    try {
      const response = await api.request({
        url: '/api/profile/nickname',
        method: 'POST',
        data: { nickname }
      });

      this.applyProfile(response.profile);
      getApp().setCloudProfile(response.profile);
      wx.showToast({
        title: '昵称已更新',
        icon: 'success'
      });
    } catch (error) {
      console.error('saveNickname failed:', error);
      wx.showToast({
        title: '昵称保存失败',
        icon: 'none'
      });
    } finally {
      this.setData({ savingNickname: false });
    }
  },

  async onChooseAvatar(event) {
    const avatarUrl = event.detail && event.detail.avatarUrl;
    if (!avatarUrl) return;

    this.setData({ uploadingAvatar: true });
    try {
      const response = await api.uploadFile({
        url: '/api/profile/avatar',
        filePath: avatarUrl
      });

      this.applyProfile(response.profile);
      getApp().setCloudProfile(response.profile);
      wx.showToast({
        title: '头像已更新',
        icon: 'success'
      });
    } catch (error) {
      console.error('upload avatar failed:', error);
      wx.showToast({
        title: '头像上传失败',
        icon: 'none'
      });
    } finally {
      this.setData({ uploadingAvatar: false });
    }
  },

  async onGetPhoneNumber(event) {
    if (!event.detail || !event.detail.code) {
      wx.showToast({
        title: '未获取到手机号授权',
        icon: 'none'
      });
      return;
    }

    this.setData({ bindingPhone: true });
    try {
      const response = await api.request({
        url: '/api/profile/phone/bind',
        method: 'POST',
        data: {
          code: event.detail.code
        }
      });

      this.applyProfile(response.profile);
      getApp().setCloudProfile(response.profile);
      wx.showToast({
        title: '手机号已绑定',
        icon: 'success'
      });
    } catch (error) {
      console.error('bind phone failed:', error);
      wx.showToast({
        title: '手机号绑定失败',
        icon: 'none'
      });
    } finally {
      this.setData({ bindingPhone: false });
    }
  },

  goToAchievement() {
    wx.navigateTo({
      url: '/pages/achievement/achievement'
    });
  },

  goToLinpu() {
    wx.navigateTo({
      url: '/pages/linpu/linpu'
    });
  },

  goToMapLandmark() {
    wx.switchTab({ url: '/pages/map/map' });
  },

  goToRecord() {
    wx.navigateTo({
      url: '/pages/record/record'
    });
  },

  goToRanking() {
    wx.navigateTo({
      url: '/pages/ranking/ranking'
    });
  },

  goToSettings() {
    wx.navigateTo({
      url: '/pages/settings/settings'
    });
  },

  goToFeedback() {
    wx.navigateTo({
      url: '/pages/feedback/feedback'
    });
  },

  goToTeam() {
    wx.navigateTo({
      url: '/pages/team/team'
    });
  }
})
