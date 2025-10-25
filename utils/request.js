/**
 * 网络请求工具
 * 统一处理API请求，自动添加token等请求头
 */

const config = require('../config.js');

/**
 * 发起HTTP请求
 * @param {Object} options - 请求选项
 * @param {string} options.url - 请求路径（可以是相对路径或完整URL）
 * @param {string} options.method - 请求方法（GET/POST/PUT/DELETE等）
 * @param {Object} options.data - 请求数据
 * @param {Object} options.header - 自定义请求头
 * @param {boolean} options.needToken - 是否需要token（默认true）
 * @param {boolean} options.showLoading - 是否显示加载提示（默认false）
 * @param {string} options.loadingText - 加载提示文字
 * @returns {Promise}
 */
function request(options) {
  return new Promise((resolve, reject) => {
    const {
      url,
      method = 'GET',
      data = {},
      header = {},
      needToken = true,
      showLoading = false,
      loadingText = '加载中...'
    } = options;

    // 处理URL
    const requestUrl = url.startsWith('http') ? url : `${config.API_BASE_URL}${url}`;

    // 构建请求头
    const requestHeader = {
      'Content-Type': 'application/json',
      ...header
    };

    // 添加token
    if (needToken) {
      const token = wx.getStorageSync('token');
      if (token) {
        requestHeader['Authorization'] = `Bearer ${token}`;
      }
    }

    // 显示加载提示
    if (showLoading) {
      wx.showLoading({
        title: loadingText,
        mask: true
      });
    }

    // 发起请求
    wx.request({
      url: requestUrl,
      method: method,
      data: data,
      header: requestHeader,
      success: (res) => {
        if (showLoading) {
          wx.hideLoading();
        }

        console.log(`[API] ${method} ${requestUrl}`, {
          request: data,
          response: res.data
        });

        // 处理响应
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else if (res.statusCode === 401) {
          // token失效，清除登录信息
          wx.removeStorageSync('token');
          wx.removeStorageSync('userInfo');
          
          wx.showToast({
            title: '登录已过期，请重新登录',
            icon: 'none',
            duration: 2000
          });
          
          reject({
            statusCode: 401,
            message: '登录已过期',
            data: res.data
          });
        } else {
          reject({
            statusCode: res.statusCode,
            message: res.data.message || '请求失败',
            data: res.data
          });
        }
      },
      fail: (err) => {
        if (showLoading) {
          wx.hideLoading();
        }

        console.error(`[API Error] ${method} ${requestUrl}`, err);

        wx.showToast({
          title: '网络请求失败',
          icon: 'none',
          duration: 2000
        });

        reject({
          statusCode: 0,
          message: '网络请求失败',
          error: err
        });
      }
    });
  });
}

/**
 * GET请求
 */
function get(url, data = {}, options = {}) {
  return request({
    url,
    method: 'GET',
    data,
    ...options
  });
}

/**
 * POST请求
 */
function post(url, data = {}, options = {}) {
  return request({
    url,
    method: 'POST',
    data,
    ...options
  });
}

/**
 * PUT请求
 */
function put(url, data = {}, options = {}) {
  return request({
    url,
    method: 'PUT',
    data,
    ...options
  });
}

/**
 * DELETE请求
 */
function del(url, data = {}, options = {}) {
  return request({
    url,
    method: 'DELETE',
    data,
    ...options
  });
}

/**
 * 检查学生答题记录
 * @param {number} questionId - 题目ID
 * @returns {Promise} 返回答题记录信息
 */
function checkStudentAnswerLog(questionId) {
  return request({
    url: `/api/student-answer-logs/by-question/${questionId}`,
    method: 'GET',
    showLoading: false
  });
}

/**
 * 上传文件
 */
function uploadFile(filePath, options = {}) {
  return new Promise((resolve, reject) => {
    const {
      url = '/api/upload',
      name = 'file',
      formData = {},
      needToken = true
    } = options;

    const requestUrl = url.startsWith('http') ? url : `${config.API_BASE_URL}${url}`;
    
    // 构建请求头
    const header = {};
    if (needToken) {
      const token = wx.getStorageSync('token');
      if (token) {
        header['Authorization'] = `Bearer ${token}`;
      }
    }

    wx.showLoading({
      title: '上传中...',
      mask: true
    });

    wx.uploadFile({
      url: requestUrl,
      filePath: filePath,
      name: name,
      formData: formData,
      header: header,
      success: (res) => {
        wx.hideLoading();
        
        try {
          const data = JSON.parse(res.data);
          resolve(data);
        } catch (e) {
          resolve(res.data);
        }
      },
      fail: (err) => {
        wx.hideLoading();
        
        wx.showToast({
          title: '上传失败',
          icon: 'none'
        });
        
        reject(err);
      }
    });
  });
}

module.exports = {
  request,
  get,
  post,
  put,
  del,
  uploadFile,
  checkStudentAnswerLog
};

