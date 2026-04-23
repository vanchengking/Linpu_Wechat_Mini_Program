/**
 * 图片预加载工具
 * 
 * 功能：
 * 1. 小程序启动时预加载核心高频图片（背景图、人物图标等）
 * 2. 提供按需预加载接口，供页面调用
 * 3. 缓存已加载状态，避免重复请求
 */

// ============ 核心图片资源池（启动时立即预加载）============
const CORE_IMAGES = {
  // ===== 背景图（最高优先级）=====
  backgrounds: [
    'https://bl.meishipay.com/images/background/background.webp',
    'https://bl.meishipay.com/images/background/background5.webp',
  ],
  
  // ===== 人物图标（全局复用）=====
  characters: [
    'https://bl.meishipay.com/images/characters/尚书伯悬浮按钮.webp',
    'https://bl.meishipay.com/images/characters/shangshubo.webp',
    'https://bl.meishipay.com/images/characters/laobo.webp',
  ],
};

// ============ 页面级图片资源池（按需预加载）============
const PAGE_IMAGES = {
  // 场景探索页
  scene: [
    'https://bl.meishipay.com/images/content/濂江书院1.webp',
    'https://bl.meishipay.com/images/content/世公保1.webp',
    'https://bl.meishipay.com/images/content/location/泰山宫1.png',
    'https://bl.meishipay.com/images/characters/尚书伯悬浮按钮.webp',
  ],
  
  // 地图页
  map: [
    'https://bl.meishipay.com/images/content/map.webp',
    // 地标图片（用户进入地图时预加载）
    'https://bl.meishipay.com/images/content/濂江书院1.webp',
    'https://bl.meishipay.com/images/content/濂江书院2.webp',
    'https://bl.meishipay.com/images/content/濂江书院3.webp',
    'https://bl.meishipay.com/images/content/世公保1.webp',
    'https://bl.meishipay.com/images/content/世公保2.webp',
    'https://bl.meishipay.com/images/content/location/泰山宫1.png',
    'https://bl.meishipay.com/images/content/location/泰山宫2.png',
    'https://bl.meishipay.com/images/content/location/泰山宫3.jpg',
    'https://bl.meishipay.com/images/content/尚书里.webp',
    'https://bl.meishipay.com/images/content/尚书里石牌坊.webp',
    'https://bl.meishipay.com/images/content/断桥1.webp',
    'https://bl.meishipay.com/images/content/断桥2.webp',
    'https://bl.meishipay.com/images/content/断桥3.webp',
    'https://bl.meishipay.com/images/content/进士木牌坊1.webp',
    'https://bl.meishipay.com/images/content/进士木牌坊2.webp',
    'https://bl.meishipay.com/images/content/进士木牌坊3.webp',
  ],

  // 文创商城页
  market: [
    'https://bl.meishipay.com/images/content/product/帆布袋.webp',
    'https://bl.meishipay.com/images/content/product/《林浦志》.webp',
    'https://bl.meishipay.com/images/content/product/御守.webp',
    'https://bl.meishipay.com/images/content/product/书签1.webp',
    'https://bl.meishipay.com/images/content/product/宋代茶盏.webp',
    'https://bl.meishipay.com/images/content/product/明信片.webp',
    'https://bl.meishipay.com/images/content/product/建筑图鉴1.webp',
    'https://bl.meishipay.com/images/content/product/帆纸摆件.webp',
    'https://bl.meishipay.com/images/content/product/折扇1.webp',
  ],

  // 文化解码/体验活动页（卡片封面图）
  experience: [
    'https://bl.meishipay.com/images/content/scene/场景1-尚书里.webp',
    'https://bl.meishipay.com/images/content/scene/场景2-廉江书院.webp',
    'https://bl.meishipay.com/images/content/scene/场景3-世公保尚书家庙.webp',
    'https://bl.meishipay.com/images/content/scene/场景4-街巷.webp',
    'https://bl.meishipay.com/images/content/scene/场景5-进士木牌坊2.webp',
    'https://bl.meishipay.com/images/content/scene/场景6-泰山宫.webp',
    // 背景图
    'https://asave.rutno.com/fileview?id=S8JAJK5wKDye',
    'https://asave.rutno.com/fileview?id=BMumLU82n7ZG',
  ],

  // 地标详情页
  landmark: [
    // 地标图片在 map 页已覆盖，这里主要确保 landmark.js 的图片可用
  ],

  // AR游戏页（场景背景图 + 所有 NPC 立绘）
  ar: [
    // 背景图
    'https://bl.meishipay.com/images/background/background.webp',
    'https://bl.meishipay.com/images/content/scene/场景1-尚书里.webp',
    'https://bl.meishipay.com/images/content/scene/场景2-廉江书院.webp',
    'https://bl.meishipay.com/images/content/scene/场景3-世公保尚书家庙.webp',
    'https://bl.meishipay.com/images/content/scene/场景4-街巷.webp',
    'https://bl.meishipay.com/images/content/scene/场景5-进士木牌坊2.webp',
    'https://bl.meishipay.com/images/content/scene/场景6-泰山宫.webp',
    // NPC 人物立绘（对话中反复出现，必须预加载）
    'https://bl.meishipay.com/images/content/人物/宋端宗.png',
    'https://bl.meishipay.com/images/content/人物/宋少帝.png',
    'https://bl.meishipay.com/images/content/人物/古村长.png',
    'https://bl.meishipay.com/images/content/人物/朱熹.png',
    'https://bl.meishipay.com/images/content/人物/尚书伯.png',
    'https://bl.meishipay.com/images/content/人物/老艺人.png',
  ],
};

// 已缓存集合（避免重复下载）
let _cachedSet = new Set();
let _isPreloading = false;

/**
 * 预加载单张图片
 * @param {string} url - 图片URL
 * @returns {Promise<boolean>}
 */
function preloadImage(url) {
  return new Promise((resolve) => {
    if (!url || _cachedSet.has(url)) {
      resolve(true);
      return;
    }

    // 使用 wx.getImageInfo 触发网络下载并缓存到本地
    wx.getImageInfo({
      src: url,
      success: (res) => {
        _cachedSet.add(url);
        console.log(`[Preload] ✓ ${url.split('/').pop()}`);
        resolve(true);
      },
      fail: (err) => {
        // 即使失败也标记，避免反复尝试
        _cachedSet.add(url);
        console.warn(`[Preload] ✗ ${url.split('/').pop()}`, err.errMsg);
        resolve(false);
      }
    });
  });
}

/**
 * 批量预加载图片（带并发控制）
 * @param {string[]} urls - 图片URL数组
 * @param {number} concurrency - 并发数，默认3
 */
function preloadBatch(urls, concurrency = 3) {
  if (!urls || urls.length === 0) return Promise.resolve();

  return new Promise((resolve) => {
    let index = 0;
    let completed = 0;
    const total = urls.length;

    function next() {
      while (index < total && concurrency > 0) {
        const i = index++;
        if (i >= total) break;
        
        concurrency--;
        preloadImage(urls[i]).then(() => {
          concurrency++;
          completed++;
          if (completed >= total) {
            resolve();
          } else {
            next();
          }
        });
      }
    }

    next();
  });
}

/**
 * 🔥 启动预加载：小程序启动时调用
 * 预加载所有核心图片（背景图 + 人物图标）
 */
function prelaunch() {
  if (_isPreloading) return;
  _isPreloading = true;
  
  const allCore = [
    ...CORE_IMAGES.backgrounds,
    ...CORE_IMAGES.characters,
  ];

  console.log(`[Preload] 开始预加载 ${allCore.length} 张核心图片...`);

  // 异步执行，不阻塞启动
  preloadBatch(allCore, 4).then(() => {
    console.log('[Preload] ✅ 核心图片预加载完成');
  });

  // 延迟预加载其他页面图片（给启动留出时间）
  // 第一批（3秒后）：地图、商城 —— 用户最常用的两个页面
  setTimeout(() => {
    preloadPageImages('map');
    preloadPageImages('market');
  }, 3000);

  // 第二批（8秒后）：场景、文化解码、AR —— 体验类页面
  setTimeout(() => {
    preloadPageImages('scene');
    preloadPageImages('experience');
  }, 8000);

  // 第三批（15秒后）：AR 人物图（体积较大，最后预加载）
  setTimeout(() => {
    preloadPageImages('ar');
  }, 15000);
}

/**
 * 📦 按需预加载：页面 onShow 时调用
 * @param {string} pageName - 页面名称（对应 PAGE_IMAGES 的 key）
 */
function preloadPageImages(pageName) {
  const images = PAGE_IMAGES[pageName];
  if (!images || images.length === 0) return;

  console.log(`[Preload] 预加载 ${pageName} 页面 ${images.length} 张图片...`);
  preloadBatch(images, 3).then(() => {
    console.log(`[Preload] ✅ ${pageName} 页面图片就绪`);
  });
}

/**
 * 手动预加载指定URL列表
 * @param {string[]} urls 
 */
function preloadCustom(urls) {
  return preloadBatch(urls, 3);
}

/**
 * 清除缓存（用于调试或强制刷新）
 */
function clearCache() {
  _cachedSet = new Set();
  console.log('[Preload] 缓存已清除');
}

module.exports = {
  prelaunch,
  preloadPageImages,
  preloadCustom,
  preloadBatch,
  preloadImage,
  clearCache,
};
