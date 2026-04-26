/**
 * 个人中心页面（纯展示）
 *
 * 只负责展示用户资料，不在此页进行任何编辑操作。
 * 编辑入口: 设置页 → 用户卡片 → profile-edit 页面
 */

const api = require('../../utils/api');
const auth = require('../../utils/auth');

const DEFAULT_AVATAR = 'https://bl.meishipay.com/images/content/%E4%BA%BA%E7%89%A9/%E9%BB%98%E8%AE%A4%E5%A4%B4%E5%83%8F.png';

Page({
  data: {
    loading: true,
    defaultAvatar: DEFAULT_AVATAR,

    // 用户资料（只读）
    avatarUrl: DEFAULT_AVATAR,
    nickname: '',
    level: 1,
    levelTitle: '初来乍到',
    phoneMasked: '未绑定手机号',
    points: 0,
    totalExp: 0,
    stats: { landmarkVisited: 0, experienceDone: 0, arScanned: 0 },

    // 手机号绑定
    bindingPhone: false
  },

  async onShow() {
    await this._loadProfile();
  },

  async _loadProfile() {
    this.setData({ loading: true });

    try {
      await auth.ensureLogin();
      const res = await api.request({ url: '/api/profile' });
      const p = res.profile || res;
      this._applyData(p);
      wx.setStorageSync('linpu_cloud_profile', p);
    } catch (err) {
      console.error('[_loadProfile]', err);
      const cached = wx.getStorageSync('linpu_cloud_profile');
      if (cached) this._applyData(cached);
    } finally {
      this.setData({ loading: false });
    }
  },

  /** 安全提取 avatarUrl：只接受有效的 http(s) 开头地址 */
  _safeAvatar(url) {
    if (url && typeof url === 'string' && /^https?:\/\//i.test(url.trim())) {
      return url.trim();
    }
    return DEFAULT_AVATAR;
  },

  _applyData(p) {
    if (!p) return;
    this.setData({
      avatarUrl: this._safeAvatar(p.avatarUrl),
      nickname: p.nickname || '',
      level: p.level || 1,
      levelTitle: p.levelTitle || '初来乍到',
      phoneMasked: (p.phone && p.phone.length > 7)
        ? p.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
        : (p.phone || '未绑定手机号'),
      points: p.points || 0,
      totalExp: p.totalExp || 0,
      stats: p.stats || { landmarkVisited: 0, experienceDone: 0, arScanned: 0 }
    });
  },

  // ====== 手机号绑定（保留，因为这是唯一合理的操作）======
  onGetPhoneNumber(e) {
    if (!e.detail?.code) { wx.showToast({ title: '未授权', icon: 'none' }); return; }
    this.setData({ bindingPhone: true });
    api.request({
      url: '/api/profile/phone/bind',
      method: 'POST', data: { code: e.detail.code }
    }).then((res) => {
      this._applyData(res.profile);
      wx.showToast({ title: '已绑定', icon: 'success' });
    }).catch(() => {
      wx.showToast({ title: '绑定失败', icon: 'none' });
    }).finally(() => {
      this.setData({ bindingPhone: false });
    });
  },

  // ====== 导航 ======
  goToAchievement() { wx.navigateTo({ url: '/pages/achievement/achievement' }); },
  goToLinpu()       { wx.navigateTo({ url: '/pages/linpu/linpu' }); },
  goToMapLandmark() { wx.switchTab({ url: '/pages/map/map' }); },
  goToRecord()      { wx.navigateTo({ url: '/pages/record/record' }); },
  goToRanking()     { wx.navigateTo({ url: '/pages/ranking/ranking' }); },
  goToSettings()    { wx.navigateTo({ url: '/pages/settings/settings' }); },
  goToFeedback()    { wx.navigateTo({ url: '/pages/feedback/feedback' }); },
  goToTeam()        { wx.navigateTo({ url: '/pages/team/team' }); }
});
