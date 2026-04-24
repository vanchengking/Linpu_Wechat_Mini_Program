const BASE_URL = 'https://bl.meishipay.com';
const SESSION_TOKEN_KEY = 'linpu_session_token';

function getSessionToken() {
  return wx.getStorageSync(SESSION_TOKEN_KEY) || '';
}

function setSessionToken(token) {
  wx.setStorageSync(SESSION_TOKEN_KEY, token || '');
}

function clearSessionToken() {
  wx.removeStorageSync(SESSION_TOKEN_KEY);
}

function buildHeaders(extraHeaders = {}, auth = true) {
  const headers = {
    'Content-Type': 'application/json',
    ...extraHeaders
  };

  if (auth) {
    const token = getSessionToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
}

function request({ url, method = 'GET', data = {}, header = {}, auth = true, timeout = 15000 }) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${BASE_URL}${url}`,
      method,
      data,
      timeout,
      header: buildHeaders(header, auth),
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
          return;
        }

        const error = new Error((res.data && res.data.detail) || 'Request failed');
        error.response = res;
        reject(error);
      },
      fail: reject
    });
  });
}

function uploadFile({ url, filePath, name = 'file', formData = {}, auth = true, timeout = 30000 }) {
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: `${BASE_URL}${url}`,
      filePath,
      name,
      formData,
      timeout,
      header: auth ? { Authorization: `Bearer ${getSessionToken()}` } : {},
      success: (res) => {
        let parsed = {};
        try {
          parsed = JSON.parse(res.data || '{}');
        } catch (error) {
          reject(new Error('Upload response is not valid JSON'));
          return;
        }

        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(parsed);
          return;
        }

        reject(new Error(parsed.detail || 'Upload failed'));
      },
      fail: reject
    });
  });
}

module.exports = {
  BASE_URL,
  getSessionToken,
  setSessionToken,
  clearSessionToken,
  request,
  uploadFile
};
