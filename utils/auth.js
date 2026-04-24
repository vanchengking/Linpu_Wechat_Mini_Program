const api = require('./api');

async function login() {
  const loginResult = await new Promise((resolve, reject) => {
    wx.login({
      success: resolve,
      fail: reject
    });
  });

  if (!loginResult.code) {
    throw new Error('wx.login did not return a valid code');
  }

  const response = await api.request({
    url: '/api/auth/wechat-login',
    method: 'POST',
    data: { code: loginResult.code },
    auth: false
  });

  if (!response.token) {
    throw new Error('Server did not return a session token');
  }

  api.setSessionToken(response.token);
  wx.setStorageSync('linpu_cloud_profile', response.profile || {});
  return response;
}

async function ensureLogin(force = false) {
  const token = api.getSessionToken();
  if (token && !force) {
    return token;
  }

  const response = await login();
  return response.token;
}

module.exports = {
  login,
  ensureLogin
};
