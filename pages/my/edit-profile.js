/**
 * 用户资料编辑页面
 */

const userService = require('../../utils/user-service.js');

Page({
  data: {
    userData: null,
    editMode: 'personal', // personal, school, community
    formData: {},
    loading: false
  },

  onLoad: function(options) {
    const editMode = options.mode || 'personal';
    this.setData({
      editMode: editMode
    });
    
    this.loadUserData();
  },

  /**
   * 加载用户数据
   */
  loadUserData: function() {
    const backendUserData = wx.getStorageSync('backendUserData');
    if (backendUserData) {
      this.setData({
        userData: backendUserData,
        formData: { ...backendUserData }
      });
    } else {
      wx.showToast({
        title: '用户数据加载失败',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  /**
   * 输入框变化处理
   */
  onInputChange: function(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    
    this.setData({
      [`formData.${field}`]: value
    });
  },

  /**
   * 性别选择
   */
  onGenderChange: function(e) {
    this.setData({
      'formData.gender': e.detail.value
    });
  },

  /**
   * 生日选择
   */
  onBirthdayChange: function(e) {
    this.setData({
      'formData.birthday': e.detail.value + 'T00:00:00.000Z'
    });
  },

  /**
   * 保存修改
   */
  saveChanges: function() {
    const that = this;
    const token = wx.getStorageSync('token');
    
    if (!token) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    if (!that.data.userData || !that.data.userData.id) {
      wx.showToast({
        title: '用户数据异常',
        icon: 'none'
      });
      return;
    }

    that.setData({ loading: true });

    // 构建更新数据
    const updateData = {
      ...that.data.formData,
      updateDate: new Date().toISOString()
    };

    // 调用用户服务更新数据
    userService.updateUser(that.data.userData.id, updateData)
      .then(response => {
        console.log('用户信息更新成功:', response);
        
        // 更新本地存储
        wx.setStorageSync('backendUserData', updateData);
        
        wx.hideLoading();
        wx.showToast({
          title: '保存成功',
          icon: 'success'
        });
        
        // 返回上一页
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      })
      .catch(error => {
        console.error('更新用户信息失败:', error);
        that.setData({ loading: false });
        wx.hideLoading();
        wx.showToast({
          title: '保存失败',
          icon: 'none'
        });
      });
  },

  /**
   * 取消编辑
   */
  cancelEdit: function() {
    wx.showModal({
      title: '确认取消',
      content: '确定要取消编辑吗？未保存的修改将丢失。',
      success: (res) => {
        if (res.confirm) {
          wx.navigateBack();
        }
      }
    });
  }
});
