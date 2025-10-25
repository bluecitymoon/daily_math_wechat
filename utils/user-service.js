/**
 * 用户服务模块
 * 处理与后端API的用户数据交互
 */

const config = require('../config.js');
const request = require('./request.js');

/**
 * 用户服务类
 */
class UserService {
  constructor() {
    this.baseUrl = config.BACKEND_API_URL;
  }

  /**
   * 获取用户信息
   * @param {number} userId - 用户ID
   * @returns {Promise} 用户信息
   */
  async getUser(userId) {
    try {
      const response = await request.get(`/api/students/${userId}`, {}, {
        url: `${this.baseUrl}/api/students/${userId}`,
        needToken: true,
        showLoading: false
      });
      return response;
    } catch (error) {
      console.error('获取用户信息失败:', error);
      throw error;
    }
  }

  /**
   * 更新用户信息
   * @param {number} userId - 用户ID
   * @param {Object} userData - 用户数据
   * @returns {Promise} 更新结果
   */
  async updateUser(userId, userData) {
    try {
      const response = await request.put(`/api/students/${userId}`, userData, {
        url: `${this.baseUrl}/api/students/${userId}`,
        needToken: true,
        showLoading: true,
        loadingText: '更新用户信息中...'
      });
      return response;
    } catch (error) {
      console.error('更新用户信息失败:', error);
      throw error;
    }
  }

  /**
   * 创建用户
   * @param {Object} userData - 用户数据
   * @returns {Promise} 创建结果
   */
  async createUser(userData) {
    try {
      const response = await request.post('/api/students', userData, {
        url: `${this.baseUrl}/api/students`,
        needToken: true,
        showLoading: true,
        loadingText: '创建用户中...'
      });
      return response;
    } catch (error) {
      console.error('创建用户失败:', error);
      throw error;
    }
  }

  /**
   * 根据微信用户ID查找用户
   * @param {string} wechatUserId - 微信用户ID
   * @returns {Promise} 用户信息
   */
  async findUserByWechatId(wechatUserId) {
    try {
      const response = await request.get('/api/students/search', {
        wechatUserId: wechatUserId
      }, {
        url: `${this.baseUrl}/api/students/search`,
        needToken: true,
        showLoading: false
      });
      return response;
    } catch (error) {
      console.error('查找用户失败:', error);
      throw error;
    }
  }

  /**
   * 同步微信用户信息到后端
   * @param {Object} wechatUserInfo - 微信用户信息
   * @param {string} token - 用户token
   * @returns {Promise} 同步结果
   */
  async syncWechatUserInfo(wechatUserInfo, token) {
    try {
      // 首先尝试根据微信用户ID查找现有用户
      let user = null;
      try {
        user = await this.findUserByWechatId(wechatUserInfo.wechatUserId);
      } catch (error) {
        // 用户不存在，继续创建新用户
        console.log('用户不存在，将创建新用户');
      }

      // 构建用户数据
      const userData = {
        wechatUserId: wechatUserInfo.wechatUserId,
        wechatNickname: wechatUserInfo.nickName || wechatUserInfo.wechatNickname,
        wechatAvatar: wechatUserInfo.avatarUrl || wechatUserInfo.wechatAvatar,
        nickName: wechatUserInfo.nickName || wechatUserInfo.wechatNickname,
        avatarUrl: wechatUserInfo.avatarUrl || wechatUserInfo.wechatAvatar,
        registerDate: new Date().toISOString(),
        updateDate: new Date().toISOString()
      };

      if (user && user.id) {
        // 用户存在，更新用户信息
        userData.id = user.id;
        userData.registerDate = user.registerDate; // 保持原有注册时间
        return await this.updateUser(user.id, userData);
      } else {
        // 用户不存在，创建新用户
        return await this.createUser(userData);
      }
    } catch (error) {
      console.error('同步微信用户信息失败:', error);
      throw error;
    }
  }

  /**
   * 更新用户详细资料
   * @param {number} userId - 用户ID
   * @param {Object} profileData - 详细资料数据
   * @returns {Promise} 更新结果
   */
  async updateUserProfile(userId, profileData) {
    try {
      const userData = {
        ...profileData,
        updateDate: new Date().toISOString()
      };

      return await this.updateUser(userId, userData);
    } catch (error) {
      console.error('更新用户详细资料失败:', error);
      throw error;
    }
  }
}

// 创建单例实例
const userService = new UserService();

module.exports = userService;
