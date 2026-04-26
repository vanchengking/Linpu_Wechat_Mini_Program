/**
 * 编辑资料页面（头像 + 昵称）
 *
 * 入口: 设置页 → 点击用户卡片 → 跳转至此
 * 数据流:
 *   onLoad → 读取全局缓存 → 加载当前头像/昵称
 *   用户操作 → POST 到后端 → 更新全局缓存 → 返回时 profile/settings 自动刷新
 *
 * 后端接口:
 *   POST /api/profile/nickname  { nickname }
 *   POST /api/profile/avatar   (file upload)
 */

const api = require('../../utils/api');
const auth = require('../../utils/auth');

const DEFAULT_AVATAR = 'https://bl.meishipay.com/images/content/%E4%BA%BA%E7%89%A9/%E9%BB%98%E8%AE%A4%E5%A4%B4%E5%83%8F.png';
const CROP_SIZE = 500;
const OUTPUT_SIZE = 400;

Page({
  data: {
    avatarUrl: DEFAULT_AVATAR,
    nickname: '',
    saving: false,
    uploading: false,

    // 裁剪弹窗状态
    cropVisible: false,
    cropSrc: '',
    cropImgW: 0,
    cropImgH: 0,
    cropScale: 1,
    cropPercent: 100,
    cropX: 0,
    cropY: 0
  },

  // 拖拽私有变量
  _dragging: false,
  _tsX: 0, _tsY: 0,
  _dsX: 0, _dsY: 0,

  onLoad() {
    this._loadFromCache();
  },

  /** 从 localStorage 读取当前资料 */
  _loadFromCache() {
    try {
      const cached = wx.getStorageSync('linpu_cloud_profile') || {};
      this.setData({
        avatarUrl: cached.avatarUrl || DEFAULT_AVATAR,
        nickname: cached.nickname || ''
      });
    } catch (e) {
      console.warn('[_loadFromCache]', e);
    }
  },

  // ====== 昵称编辑 ======

  onNicknameInput(e) {
    this.setData({ nickname: e.detail.value });
  },

  async saveNickname() {
    const name = (this.data.nickname || '').trim();
    if (!name) { wx.showToast({ title: '昵称不能为空', icon: 'none' }); return; }

    this.setData({ saving: true });
    try {
      await auth.ensureLogin();
      const res = await api.request({
        url: '/api/profile/nickname',
        method: 'POST',
        data: { nickname: name }
      });
      // 更新全局缓存
      const cached = wx.getStorageSync('linpu_cloud_profile') || {};
      cached.nickname = res.profile?.nickname || name;
      wx.setStorageSync('linpu_cloud_profile', cached);
      wx.showToast({ title: '昵称已更新', icon: 'success' });
    } catch (err) {
      console.error('[saveNickname]', err);
      wx.showToast({ title: '保存失败', icon: 'none' });
    } finally {
      this.setData({ saving: false });
    }
  },

  // ====== 头像更换 ======

  onAvatarTap() {
    wx.showActionSheet({
      itemList: ['使用微信头像', '从相册选择', '拍照'],
      success: (res) => {
        switch (res.tapIndex) {
          case 0: this._triggerWechatAvatar(); break;  // 通过隐藏button触发
          case 1: this._pickImage('album'); break;
          case 2: this._pickImage('camera'); break;
        }
      }
    });
  },

  /** 触发隐藏的微信头像选择按钮 */
  _triggerWechatAvatar() {
    // WXML中已放置 <button open-type="chooseAvatar">
    // 这里通过设置标记来提示用户点击头像区域即可
    wx.showToast({ title: '请再次点击头像选择微信头像', icon: 'none' });
  },

  /** 微信头像按钮回调 — 直接上传微信头像URL */
  onChooseWechatAvatar(e) {
    const url = e.detail?.avatarUrl;
    if (!url) { wx.showToast({ title: '未获取到头像', icon: 'none' }); return; }
    this._uploadAvatar(url);
  },

  /** 从相册/拍照选图 */
  _pickImage(sourceType) {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: [sourceType],
      sizeType: ['original'],
      success: (res) => {
        this._openCropModal(res.tempFiles[0].tempFilePath);
      }
    });
  },

  // ====== 裁剪弹窗 ======

  preventMove() { return false; },

  _openCropModal(src) {
    wx.getImageInfo({
      src,
      success: (info) => {
        let scale = CROP_SIZE / Math.max(info.width, info.height);
        if (scale > 2) scale = 2;

        const imgW = info.width * scale;
        const imgH = info.height * scale;
        this.setData({
          cropVisible: true,
          cropSrc: src,
          cropImgW: imgW,
          cropImgH: imgH,
          cropScale: scale,
          cropPercent: Math.round(scale * 100),
          cropX: (CROP_SIZE - imgW) / 2,
          cropY: (CROP_SIZE - imgH) / 2
        });
      },
      fail: () => wx.showToast({ title: '图片加载失败', icon: 'none' })
    });
  },

  closeCrop() {
    this.setData({ cropVisible: false, cropSrc: '' });
  },

  // ---- 拖拽 ----
  onCropTouchStart(e) {
    const t = e.touches[0];
    this._dragging = true;
    this._tsX = t.clientX; this._tsY = t.clientY;
    this._dsX = this.data.cropX; this._dsY = this.data.cropY;
  },

  onCropTouchMove(e) {
    if (!this._dragging) return;
    const t = e.touches[0];
    let nx = this._dsX + (t.clientX - this._tsX);
    let ny = this._dsY + (t.clientY - this._tsY);
    const { cropImgW, cropImgH } = this.data;
    if (cropImgW > CROP_SIZE) {
      if (nx > 0) nx = 0;
      if (nx < CROP_SIZE - cropImgW) nx = CROP_SIZE - cropImgW;
    }
    if (cropImgH > CROP_SIZE) {
      if (ny > 0) ny = 0;
      if (ny < CROP_SIZE - cropImgH) ny = CROP_SIZE - cropImgH;
    }
    this.setData({ cropX: nx, cropY: ny });
  },

  onCropTouchEnd() { this._dragging = false; },

  // ---- 缩放 ----
  onZoomIn() {
    this._applyScale(Math.min(this.data.cropScale * 1.25, 4));
  },
  onZoomOut() {
    this._applyScale(Math.max(this.data.cropScale / 1.25, 0.5));
  },

  _applyScale(newScale) {
    const old = this.data.cropScale;
    const r = newScale / old;
    const cx = CROP_SIZE / 2, cy = CROP_SIZE / 2;
    const relX = this.data.cropX + this.data.cropImgW / 2 - cx;
    const relY = this.data.cropY + this.data.cropImgH / 2 - cy;
    const nW = this.data.cropImgW * r;
    const nH = this.data.cropImgH * r;
    this.setData({
      cropScale: newScale,
      cropPercent: Math.round(newScale),
      cropImgW: nW, cropImgH: nH,
      cropX: relX * r + cx - nW / 2,
      cropY: relY * r + cy - nH / 2
    });
  },

  // ---- 确认裁剪并上传 ----
  confirmCrop() {
    const that = this;
    wx.showLoading({ title: '处理中...' });

    const query = wx.createSelectorQuery().in(that);
    query.select('#cropCanvas').fields({ node: true, size: true }).exec((res) => {
      if (!res?.[0]?.node) {
        that._uploadAvatar(that.data.cropSrc);
        return;
      }
      const canvas = res[0].node;
      const ctx = canvas.getContext('2d');
      canvas.width = CROP_SIZE;
      canvas.height = CROP_SIZE;

      const img = canvas.createImage();
      img.onload = () => {
        ctx.drawImage(
          img,
          that.data.cropX, that.data.cropY, that.data.cropImgW, that.data.cropImgH,
          0, 0, CROP_SIZE, CROP_SIZE
        );
        wx.canvasToTempFilePath({
          canvas, x: 0, y: 0, width: CROP_SIZE, height: CROP_SIZE,
          destWidth: OUTPUT_SIZE, destHeight: OUTPUT_SIZE,
          fileType: 'png',
          success: (e) => that._uploadAvatar(e.tempFilePath),
          fail: () => that._uploadAvatar(that.data.cropSrc)
        });
      };
      img.onerror = () => that._uploadAvatar(that.data.cropSrc);
      img.src = that.data.cropSrc;
    });
  },

  // ====== 统一上传入口 ======

  /**
   * 上传头像到后端，更新页面显示和全局缓存
   * @param {string} filePath - 临时路径或URL
   */
  async _uploadAvatar(filePath) {
    this.setData({ uploading: true, cropVisible: false });
    wx.hideLoading();

    try {
      await auth.ensureLogin();
      const res = await api.uploadFile({ url: '/api/profile/avatar', filePath });

      const newUrl = res.profile?.avatarUrl || res.url || filePath;
      // 立即更新页面
      this.setData({ avatarUrl: newUrl });

      // 同步到全局缓存（profile页和settings页读取同一缓存）
      const cached = wx.getStorageSync('linpu_cloud_profile') || {};
      cached.avatarUrl = newUrl;
      wx.setStorageSync('linpu_cloud_profile', cached);

      wx.showToast({ title: '头像已更新', icon: 'success' });
    } catch (err) {
      console.error('[_uploadAvatar]', err);
      wx.showToast({ title: '上传失败', icon: 'none' });
    } finally {
      this.setData({ uploading: false });
    }
  }
});
