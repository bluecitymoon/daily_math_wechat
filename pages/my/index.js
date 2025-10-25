// pages/my/index.js
const userService = require('../../utils/user-service.js');

var e =[{
  icon:"/images/icon_equipment_msg.png",
  title:"答题记录"
}, {
    icon: "/images/icon_center_phone.png",
    title: "分享好友"
  }, {
    icon: "/images/icon_center_msg.png",
    title: "意见反馈",
    page:"../feedback/index"
  },
  {
    icon: "/images/icon_center_tj.png",
    title: "关于我们"
  }]
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cellList: e,
    is_login: true,
    canIUseGetUserProfile: false,
    backendUserData: null,
    userGenderText: '未设置',
    userAge: '未设置',
    userBirthdayText: '未设置',
    userRegisterDateText: '未设置',
    userUpdateDateText: '未设置',
    userContractEndDateText: '未设置'
  },

  onLoad: function (options) {
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }
  },

  onReady: function () {

  },

  onShow: function () {
    var that = this
    that.setData({
      userInfo: wx.getStorageSync('userInfo')
    })
    
    // 加载后端用户数据
    that.loadBackendUserData()
  },

  onShareAppMessage: function (t) {
    return t.from, {
      title: "智汇答题，考试助手！",
      imageUrl: "https://upload-images.jianshu.io/upload_images/6673460-7384ac443f4fba30.png",
      path: "pages/start/index"
    };
  },
  go_view: function(e){
    switch (1 * e.currentTarget.dataset.viewind) {
      case 0:
       if (this.data.userInfo.avatarUrl == undefined || this.data.userInfo.avatarUrl == ''){
         this.login()
         return
       }
       wx.navigateTo({
         url: '../record/index',
       })
       break;
      case 1:
       break;
      case 2:
        if (this.data.userInfo.avatarUrl == undefined || this.data.userInfo.avatarUrl == '') {
          this.login()
          return
        }
       wx.navigateTo({
         url: '../feedback/index',
       })
      break;
      case 3:
       this.about()
      break;
    }
  },
  about() {
    wx.showModal({
      title: '关于我们',
      content: '本程序仅供考试学习使用，请勿使用于商业用途，如有问题，请联系QQ：903363777、微信：kossfirst。',
      showCancel: false
    })
  },
  login() {
    this.setData({
      is_login: !this.data.is_login
    })
  },
  bindgetuserinfo: function () {
    this.login()
    var that = this
    wx.getUserInfo({
      success(res) {
        wx.showLoading({
          title: '授权登录中',
        })
        
        // 先尝试从本地存储获取用户信息
        wx.u.getUserInfo().then(res1 => {
          var bmobUser = res1.result;
          if (bmobUser.avatarUrl == '' || bmobUser.avatarUrl == undefined) {
            wx.u.changeUserInfo(res.userInfo.avatarUrl, res.userInfo.nickName).then(res2 => { });
          }
          res1.result.avatarUrl = res.userInfo.avatarUrl;
          res1.result.nickName = res.userInfo.nickName;
          
          // 同步到后端API
          that.syncUserToBackend(res1.result).then(() => {
            wx.setStorageSync('userInfo', res1.result)
            that.setData({
              userInfo: res1.result,
            })
            wx.hideLoading()
          }).catch(error => {
            console.error('同步用户信息到后端失败:', error);
            // 即使后端同步失败，也保存到本地
            wx.setStorageSync('userInfo', res1.result)
            that.setData({
              userInfo: res1.result,
            })
            wx.hideLoading()
            wx.showToast({
              title: '登录成功，但同步信息失败',
              icon: 'none',
              duration: 2000
            });
          });
        }).catch(error => {
          console.error('获取用户信息失败:', error);
          wx.hideLoading()
          wx.showToast({
            title: '登录失败',
            icon: 'none',
            duration: 2000
          });
        })
      }
    })
  },
  getUserProfile(e){
    this.login()
    var that = this
    wx.getUserProfile({
      desc: '完善用户信息',
      success: (res) => {
        console.log(res)
        wx.showLoading({
          title: '授权登录中',
        })
        
        // 先尝试从本地存储获取用户信息
        wx.u.getUserInfo().then(res1 => {
          var bmobUser = res1.result;
          if (bmobUser.avatarUrl == '' || bmobUser.avatarUrl == undefined) {
            wx.u.changeUserInfo(res.userInfo.avatarUrl, res.userInfo.nickName).then(res2 => { });
          }
          res1.result.avatarUrl = res.userInfo.avatarUrl;
          res1.result.nickName = res.userInfo.nickName;
          
          // 同步到后端API
          that.syncUserToBackend(res1.result).then(() => {
            wx.setStorageSync('userInfo', res1.result)
            that.setData({
              userInfo: res1.result,
            })
            wx.hideLoading()
          }).catch(error => {
            console.error('同步用户信息到后端失败:', error);
            // 即使后端同步失败，也保存到本地
            wx.setStorageSync('userInfo', res1.result)
            that.setData({
              userInfo: res1.result,
            })
            wx.hideLoading()
            wx.showToast({
              title: '登录成功，但同步信息失败',
              icon: 'none',
              duration: 2000
            });
          });
        }).catch(error => {
          console.error('获取用户信息失败:', error);
          wx.hideLoading()
          wx.showToast({
            title: '登录失败',
            icon: 'none',
            duration: 2000
          });
        })
      }
    })
  },

  /**
   * 同步用户信息到后端API
   * @param {Object} userInfo - 用户信息
   * @returns {Promise}
   */
  syncUserToBackend: function(userInfo) {
    const that = this;
    return new Promise((resolve, reject) => {
      // 检查是否有token
      const token = wx.getStorageSync('token');
      if (!token) {
        console.log('没有token，跳过后端同步');
        resolve();
        return;
      }

      // 构建同步数据
      const syncData = {
        wechatUserId: userInfo.openid || userInfo.objectId || userInfo.id,
        wechatNickname: userInfo.nickName,
        wechatAvatar: userInfo.avatarUrl,
        nickName: userInfo.nickName,
        avatarUrl: userInfo.avatarUrl,
        updateDate: new Date().toISOString()
      };

      // 调用用户服务同步数据
      userService.syncWechatUserInfo(syncData, token).then(response => {
        console.log('用户信息同步成功:', response);
        
        // 如果返回了新的用户ID，更新本地存储
        if (response && response.id) {
          const updatedUserInfo = {
            ...userInfo,
            backendUserId: response.id,
            backendUserData: response
          };
          wx.setStorageSync('userInfo', updatedUserInfo);
          that.setData({
            userInfo: updatedUserInfo
          });
        }
        
        resolve(response);
      }).catch(error => {
        console.error('同步用户信息到后端失败:', error);
        reject(error);
      });
    });
  },

  /**
   * 加载后端用户数据
   */
  loadBackendUserData: function() {
    const that = this;
    const token = wx.getStorageSync('token');
    
    if (!token) {
      console.log('没有token，无法加载后端用户数据');
      return;
    }

    // 从本地存储获取后端用户数据
    const backendUserData = wx.getStorageSync('backendUserData');
    if (backendUserData) {
      that.setData({
        backendUserData: backendUserData
      });
      that.formatUserData(backendUserData);
    } else {
      // 如果没有本地数据，尝试从后端获取
      that.fetchBackendUserData();
    }
  },

  /**
   * 从后端获取用户数据
   */
  fetchBackendUserData: function() {
    const that = this;
    const token = wx.getStorageSync('token');
    
    if (!token) {
      return;
    }

    // 这里可以根据实际的用户ID获取数据
    // 暂时使用模拟数据
    const mockBackendData = {
      "id": 1500,
      "name": "江映初",
      "gender": "女",
      "birthday": "2010-10-15T11:57:00.000Z",
      "registerDate": "2025-10-14T08:33:00.000Z",
      "updateDate": "2025-10-14T08:35:00.000Z",
      "latestContractEndDate": "2025-10-15T11:58:00.000Z",
      "contactNumber": "17721308697",
      "parentsName": "江李明",
      "wechatUserId": "okD2XwDyDeIfWq1_BnFae4RKmSLI",
      "wechatNickname": "微信用户",
      "wechatAvatar": "https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132",
      "wechatSignature": null,
      "school": {
        "id": 1,
        "name": "上海外国语大学松江附属学校",
        "registeredStudentsCount": 5829,
        "pinyin": "shanghaiwaiguoyudaxuesongjiangfushuxuexiao",
        "distinct": null
      },
      "community": {
        "id": 1500,
        "name": "龙湖好望山",
        "lat": null,
        "lon": null,
        "studentsCount": 11,
        "createDate": "2025-09-09T16:00:00Z",
        "distinct": {
          "id": 1,
          "name": "松江",
          "pinyin": null
        }
      }
    };

    that.setData({
      backendUserData: mockBackendData
    });
    
    // 保存到本地存储
    wx.setStorageSync('backendUserData', mockBackendData);
    
    // 格式化显示数据
    that.formatUserData(mockBackendData);
  },

  /**
   * 格式化用户数据用于显示
   */
  formatUserData: function(userData) {
    const that = this;
    
    // 格式化性别
    const genderText = userData.gender === '女' ? '女' : userData.gender === '男' ? '男' : '未设置';
    
    // 计算年龄
    let ageText = '未设置';
    if (userData.birthday) {
      const birthDate = new Date(userData.birthday);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      ageText = age + '岁';
    }
    
    // 格式化生日
    const birthdayText = userData.birthday ? 
      new Date(userData.birthday).toLocaleDateString('zh-CN') : '未设置';
    
    // 格式化注册时间
    const registerDateText = userData.registerDate ? 
      new Date(userData.registerDate).toLocaleDateString('zh-CN') : '未设置';
    
    // 格式化更新时间
    const updateDateText = userData.updateDate ? 
      new Date(userData.updateDate).toLocaleDateString('zh-CN') : '未设置';
    
    // 格式化合同到期时间
    const contractEndDateText = userData.latestContractEndDate ? 
      new Date(userData.latestContractEndDate).toLocaleDateString('zh-CN') : '未设置';

    that.setData({
      userGenderText: genderText,
      userAge: ageText,
      userBirthdayText: birthdayText,
      userRegisterDateText: registerDateText,
      userUpdateDateText: updateDateText,
      userContractEndDateText: contractEndDateText
    });
  },

  /**
   * 编辑用户头像
   */
  editAvatar: function() {
    wx.showToast({
      title: '头像编辑功能开发中',
      icon: 'none'
    });
  },

  /**
   * 编辑用户名
   */
  editUserName: function() {
    const that = this;
    const currentName = that.data.backendUserData ? 
      that.data.backendUserData.name || that.data.backendUserData.nickName : '';

    wx.showModal({
      title: '编辑姓名',
      editable: true,
      placeholderText: '请输入姓名',
      content: currentName,
      success: function(res) {
        if (res.confirm && res.content) {
          that.updateUserField('name', res.content);
        }
      }
    });
  },

  /**
   * 编辑个人信息
   */
  editPersonalInfo: function() {
    const that = this;
    const userData = that.data.backendUserData;
    
    if (!userData) {
      wx.showToast({
        title: '用户数据加载中',
        icon: 'none'
      });
      return;
    }

    // 显示编辑选项
    wx.showActionSheet({
      itemList: ['编辑姓名', '编辑性别', '编辑生日', '编辑联系方式', '编辑家长姓名'],
      success: function(res) {
        switch(res.tapIndex) {
          case 0: // 编辑姓名
            that.editField('name', '请输入姓名', userData.name || '');
            break;
          case 1: // 编辑性别
            that.editGender();
            break;
          case 2: // 编辑生日
            that.editBirthday();
            break;
          case 3: // 编辑联系方式
            that.editField('contactNumber', '请输入联系方式', userData.contactNumber || '');
            break;
          case 4: // 编辑家长姓名
            that.editField('parentsName', '请输入家长姓名', userData.parentsName || '');
            break;
        }
      }
    });
  },

  /**
   * 编辑学校信息
   */
  editSchoolInfo: function() {
    wx.navigateTo({
      url: '/pages/my/edit-profile?mode=school'
    });
  },

  /**
   * 编辑社区信息
   */
  editCommunityInfo: function() {
    wx.navigateTo({
      url: '/pages/my/edit-profile?mode=community'
    });
  },

  /**
   * 编辑性别
   */
  editGender: function() {
    const that = this;
    wx.showActionSheet({
      itemList: ['男', '女'],
      success: function(res) {
        const gender = res.tapIndex === 0 ? '男' : '女';
        that.updateUserField('gender', gender);
      }
    });
  },

  /**
   * 编辑生日
   */
  editBirthday: function() {
    const that = this;
    const currentDate = that.data.backendUserData && that.data.backendUserData.birthday ? 
      that.data.backendUserData.birthday.split('T')[0] : '2010-01-01';

    wx.showModal({
      title: '选择生日',
      content: '请选择您的生日',
      editable: false,
      success: function(res) {
        if (res.confirm) {
          // 这里可以使用日期选择器
          wx.showToast({
            title: '生日编辑功能开发中',
            icon: 'none'
          });
        }
      }
    });
  },

  /**
   * 编辑字段
   */
  editField: function(fieldName, placeholder, currentValue) {
    const that = this;
    wx.showModal({
      title: '编辑' + fieldName,
      editable: true,
      placeholderText: placeholder,
      content: currentValue,
      success: function(res) {
        if (res.confirm && res.content) {
          that.updateUserField(fieldName, res.content);
        }
      }
    });
  },

  /**
   * 更新用户字段
   */
  updateUserField: function(fieldName, value) {
    const that = this;
    const token = wx.getStorageSync('token');
    
    if (!token) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    if (!that.data.backendUserData || !that.data.backendUserData.id) {
      wx.showToast({
        title: '用户数据异常',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: '更新中...'
    });

    // 构建更新数据
    const updateData = {
      ...that.data.backendUserData,
      [fieldName]: value,
      updateDate: new Date().toISOString()
    };

    // 调用用户服务更新数据
    userService.updateUser(that.data.backendUserData.id, updateData)
      .then(response => {
        console.log('用户信息更新成功:', response);
        
        // 更新本地数据
        const newBackendData = { ...that.data.backendUserData, [fieldName]: value };
        that.setData({
          backendUserData: newBackendData
        });
        
        // 保存到本地存储
        wx.setStorageSync('backendUserData', newBackendData);
        
        // 重新格式化显示数据
        that.formatUserData(newBackendData);
        
        wx.hideLoading();
        wx.showToast({
          title: '更新成功',
          icon: 'success'
        });
      })
      .catch(error => {
        console.error('更新用户信息失败:', error);
        wx.hideLoading();
        wx.showToast({
          title: '更新失败',
          icon: 'none'
        });
      });
  }
})