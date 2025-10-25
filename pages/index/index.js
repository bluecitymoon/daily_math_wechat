//index.js
const config = require('../../config.js');

Page({
  data: {
    userInfo: {},
    useLearn:true,
    is_login:true,
    checkUser: false,
    canIUseGetUserProfile: false,
    todayDate: '',
    // 模拟用户信息数据
    mockUserData: {
      grade: '三年级',                 // 年级
      title: '学霸',                   // 称号
      totalScore: 1240,                // 总积分
      totalRank: 8                     // 总排名
    },
    // 模拟数据 - 稍后将从API获取
    mockData: {
      // 学习进度
      progress: 68,                    // 总体进度百分比
      completedQuestions: 136,         // 已完成题数
      pendingQuestions: 64,            // 待完成题数
      totalQuestions: 200,             // 总题数
      
      // 排名信息
      currentRank: 8,                  // 当前排名
      nextRank: 7,                     // 下一个排名
      questionsToSurpass: 5,           // 需要答对几题才能超越
      accuracy: 92,                    // 正确率
      totalScore: 1240,                // 总得分
      
      // 错题数量
      wrongQuestions: 12,              // 错题数量
      
      // 今日数据
      todayAnswered: 25,               // 今日答题数
      todayCorrect: 22,                // 今日答对数
      continuousDays: 7                // 连续学习天数
    }
  },

  onLoad: function() {
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }
    
    // 设置今日日期
    const date = new Date();
    const today = `${date.getMonth() + 1}月${date.getDate()}日`;
    this.setData({
      todayDate: today
    })
    
    wx.u.getSetting('useLearn').then(res => {
      let useLearn = true
      if (res.result.value == "false")
        useLearn = false
      this.setData({
        useLearn: useLearn
      })
    })

    wx.u.getSetting('checkUser').then(res => {
      let checkUser = false
      if (res.result.value == "true")
        checkUser = true
      this.setData({
        checkUser: checkUser
      })
    })
    
    // TODO: 从API加载真实数据
    // this.loadUserProgress();
    // this.loadRankInfo();
    // this.loadTodayStats();
  },
  
  onShow: function(){
    this.setData({
      userInfo: wx.getStorageSync('userInfo')
    })
  },
  
  /**
   * 点击用户头像 - 已登录跳转个人中心，未登录弹出登录
   */
  handleUserClick() {
    if (this.data.userInfo.avatarUrl) {
      // 已登录，跳转个人中心
      this.gocenter();
    } else {
      // 未登录，弹出登录
      this.login();
    }
  },
  gocenter() {
    wx.navigateTo({
      url: '../my/index',
    })
  },
  goLearn() {
    if(this.data.useLearn){
      wx.navigateTo({
        url: '/pages/category/index?action=learn',
      })
    }else{
      wx.showToast({
        title: '练习模式未开启',
        icon:'loading'
      })
    }
  },
  login() {
    this.setData({
      is_login:!this.data.is_login
    })
  },
  /**
   * 旧版本获取用户信息方法（兼容旧版本微信）
   */
  bindgetuserinfo: function () {
    this.login()
    var that = this
    wx.getUserInfo({
      success(res) {
        console.log('用户信息获取成功:', res)
        wx.showLoading({
          title: '授权登录中',
        })
        
        // 调用微信登录获取code
        that.wechatLogin().then(code => {
          console.log('获取到登录凭证:', code);
          
          // 调用后端微信登录接口
          that.callBackendLogin(code, res).then(loginResult => {
            console.log('后端登录成功:', loginResult);
            
            // 保存用户信息和token
            const userInfo = {
              ...loginResult.student,
              avatarUrl: res.userInfo.avatarUrl,
              nickName: res.userInfo.nickName,
              token: loginResult.token
            };
            
            wx.setStorageSync('userInfo', userInfo);
            wx.setStorageSync('token', loginResult.token);
            
            that.setData({
              userInfo: userInfo,
            })
            
            wx.hideLoading();
            wx.showToast({
              title: '登录成功',
              icon: 'success',
              duration: 2000
            });
          }).catch(err => {
            console.error('后端登录失败:', err);
            wx.hideLoading();
            wx.showToast({
              title: err.message || '登录失败，请重试',
              icon: 'none',
              duration: 2000
            });
          });
        }).catch(err => {
          console.error('微信登录失败:', err);
          wx.hideLoading();
          wx.showToast({
            title: '获取登录凭证失败',
            icon: 'none'
          })
        })
      },
      fail(err) {
        console.log('用户拒绝授权', err);
        that.login(); // 关闭弹窗
      }
    })
  },
  /**
   * 微信登录 - 获取code
   */
  wechatLogin() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          if (res.code) {
            console.log('微信登录成功，code:', res.code);
            resolve(res.code);
          } else {
            console.log('微信登录失败：' + res.errMsg);
            reject(res.errMsg);
          }
        },
        fail: (err) => {
          console.log('微信登录失败：', err);
          reject(err);
        }
      });
    });
  },

  /**
   * 获取用户信息并登录
   */
  getUserProfile(e) {
    console.log(this.data.canIUseGetUserProfile)
    this.login()
    var that = this
    
    wx.getUserProfile({
      desc: '完善用户信息',
      success: (res) => {
        console.log('用户信息获取成功:', res)
        wx.showLoading({
          title: '授权登录中',
        })
        
        // 先调用微信登录获取code
        that.wechatLogin().then(code => {
          console.log('获取到登录凭证:', code);
          
          // 调用后端微信登录接口
          that.callBackendLogin(code, res).then(loginResult => {
            console.log('后端登录成功:', loginResult);
            
            // 保存用户信息和token
            const userInfo = {
              ...loginResult.student,
              avatarUrl: res.userInfo.avatarUrl,
              nickName: res.userInfo.nickName,
              token: loginResult.token
            };
            
            wx.setStorageSync('userInfo', userInfo);
            wx.setStorageSync('token', loginResult.token);
            
            that.setData({
              userInfo: userInfo,
            })
            
            wx.hideLoading();
            wx.showToast({
              title: '登录成功',
              icon: 'success',
              duration: 2000
            });
          }).catch(err => {
            console.error('后端登录失败:', err);
            wx.hideLoading();
            wx.showToast({
              title: err.message || '登录失败，请重试',
              icon: 'none',
              duration: 2000
            });
          });
        }).catch(err => {
          console.error('微信登录失败:', err);
          wx.hideLoading();
          wx.showToast({
            title: '获取登录凭证失败',
            icon: 'none'
          })
        })
      },
      fail: (err) => {
        console.log('用户拒绝授权', err);
        that.login(); // 关闭弹窗
      }
    })
  },

  /**
   * 调用后端微信登录接口
   */
  callBackendLogin(code, userProfileData) {
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
          console.error('调用后端登录接口失败:', err);
          reject({
            message: '网络请求失败',
            error: err
          });
        }
      });
    });
  },

  /**
   * 保存用户信息到本地
   */
  saveUserInfoLocally(userInfo, code) {
    const userData = {
      avatarUrl: userInfo.avatarUrl,
      nickName: userInfo.nickName,
      wechatCode: code,
      loginTime: new Date().getTime()
    };
    wx.setStorageSync('userInfo', userData);
    this.setData({
      userInfo: userData,
    })
    wx.hideLoading();
    wx.showToast({
      title: '登录成功',
      icon: 'success'
    })
  },
  goExam(){
    wx.navigateTo({
      url: "/pages/category/index?action=exam",
    })
    // if (this.data.userInfo.avatarUrl == undefined || this.data.userInfo.avatarUrl == '') {
    //   this.login();
    //   return
    // }
    
    if (this.data.checkUser) {
      let userInfo = this.data.userInfo
      if (userInfo.status == '1') {
        wx.navigateTo({
          url: "/pages/category/index?action=exam",
        })
      } else if (userInfo.status == '0') {
        wx.navigateTo({
          url: '../status/index',
        })
      } else {
        wx.navigateTo({
          url: '../register/index',
        })
      }
    }else{
      wx.navigateTo({
        url: "/pages/category/index?action=exam",
      })
    }
  }
})