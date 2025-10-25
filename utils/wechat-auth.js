/**
 * 微信登录认证工具
 */

const config = require('../config.js');

/**
 * 调用后端API，完成微信登录
 * @param {string} code - 微信登录返回的临时登录凭证
 * @param {Object} userProfileData - 用户资料数据（包含encryptedData, iv等）
 * @returns {Promise} 返回后端登录结果
 */
function loginWithBackend(code, userProfileData) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${config.API_BASE_URL}/api/wechat/login`,
      method: 'POST',
      header: {
        'Content-Type': 'application/json'
      },
      data: {
        code: code,
        encryptedData: userProfileData.encryptedData,
        iv: userProfileData.iv,
        signature: userProfileData.signature,
        rawData: userProfileData.rawData,
        userInfo: userProfileData.userInfo
      },
      success: (res) => {
        console.log('后端登录接口响应:', res);
        if (res.statusCode === 200 && res.data) {
          resolve(res.data);
        } else {
          reject({
            message: res.data.message || '登录失败',
            data: res.data
          });
        }
      },
      fail: (err) => {
        console.error('请求后端登录API失败:', err);
        reject({
          message: '网络请求失败',
          error: err
        });
      }
    });
  });
}

/**
 * 直接调用微信API换取session（仅用于开发测试，生产环境必须通过后端）
 * 注意：不推荐在生产环境使用，appSecret不应该暴露在前端
 * @param {string} code - 微信登录返回的临时登录凭证
 * @returns {Promise} 返回微信API结果
 */
function code2SessionDirect(code) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: 'https://api.weixin.qq.com/sns/jscode2session',
      method: 'GET',
      data: {
        appid: config.WECHAT_CONFIG.appId,
        secret: config.WECHAT_CONFIG.appSecret,
        js_code: code,
        grant_type: 'authorization_code'
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data.openid) {
          console.log('微信登录成功:', res.data);
          resolve(res.data);
        } else {
          console.error('微信登录失败:', res.data);
          reject(res.data);
        }
      },
      fail: (err) => {
        console.error('调用微信API失败:', err);
        reject(err);
      }
    });
  });
}

/**
 * 完整的微信登录流程
 * @param {Object} userProfileData - 用户资料数据（可选）
 * @returns {Promise} 返回登录结果
 */
function wechatLogin(userProfileData) {
  return new Promise((resolve, reject) => {
    // 1. 调用wx.login获取code
    wx.login({
      success: (res) => {
        if (res.code) {
          console.log('获取code成功:', res.code);
          
          // 2. 如果有用户资料，调用后端登录接口
          if (userProfileData) {
            loginWithBackend(res.code, userProfileData)
              .then(resolve)
              .catch(reject);
          } else {
            // 只返回code，由调用方处理
            resolve({ code: res.code });
          }
        } else {
          console.error('获取code失败:', res.errMsg);
          reject(res);
        }
      },
      fail: (err) => {
        console.error('wx.login调用失败:', err);
        reject(err);
      }
    });
  });
}

/**
 * 获取用户信息并登录
 * @returns {Promise} 返回登录结果
 */
function getUserProfileAndLogin() {
  return new Promise((resolve, reject) => {
    wx.getUserProfile({
      desc: '完善用户信息',
      success: (profileRes) => {
        console.log('用户信息获取成功:', profileRes);
        
        // 获取code并调用后端登录
        wx.login({
          success: (loginRes) => {
            if (loginRes.code) {
              loginWithBackend(loginRes.code, profileRes)
                .then(resolve)
                .catch(reject);
            } else {
              reject({ message: '获取登录凭证失败' });
            }
          },
          fail: (err) => {
            reject({ message: '微信登录失败', error: err });
          }
        });
      },
      fail: (err) => {
        reject({ message: '用户拒绝授权', error: err });
      }
    });
  });
}

/**
 * 检查登录状态
 * @returns {Promise} 返回检查结果
 */
function checkSession() {
  return new Promise((resolve, reject) => {
    wx.checkSession({
      success: () => {
        console.log('session有效');
        resolve(true);
      },
      fail: () => {
        console.log('session已过期');
        resolve(false);
      }
    });
  });
}

module.exports = {
  loginWithBackend,
  code2SessionDirect,
  wechatLogin,
  getUserProfileAndLogin,
  checkSession
};

