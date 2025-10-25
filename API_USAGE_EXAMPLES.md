# API 使用示例文档

本文档提供了项目中各种 API 调用的完整示例。

## 1. 微信登录相关

### 1.1 完整登录流程（推荐使用）

在页面中使用工具函数：

```javascript
const wechatAuth = require('../../utils/wechat-auth.js');

Page({
  // 用户点击登录按钮
  handleLogin() {
    wx.showLoading({ title: '登录中...' });
    
    wechatAuth.getUserProfileAndLogin()
      .then(res => {
        console.log('登录成功:', res);
        
        // 保存用户信息和token
        const userInfo = {
          ...res.student,
          token: res.token
        };
        
        wx.setStorageSync('userInfo', userInfo);
        wx.setStorageSync('token', res.token);
        
        // 更新页面数据
        this.setData({ userInfo });
        
        wx.hideLoading();
        wx.showToast({
          title: '登录成功',
          icon: 'success'
        });
        
        // 如果是新用户，跳转到注册页面
        if (res.isNewUser) {
          wx.navigateTo({
            url: '/pages/register/index'
          });
        }
      })
      .catch(err => {
        console.error('登录失败:', err);
        wx.hideLoading();
        wx.showToast({
          title: err.message || '登录失败',
          icon: 'none'
        });
      });
  }
})
```

### 1.2 检查登录状态

```javascript
const wechatAuth = require('../../utils/wechat-auth.js');

Page({
  onLoad() {
    // 检查本地是否有token
    const token = wx.getStorageSync('token');
    
    if (token) {
      // 检查session是否有效
      wechatAuth.checkSession()
        .then(isValid => {
          if (!isValid) {
            // session过期，需要重新登录
            this.showLoginDialog();
          }
        });
    } else {
      // 没有token，显示登录
      this.showLoginDialog();
    }
  }
})
```

## 2. 通用 API 请求

### 2.1 使用请求工具

```javascript
const request = require('../../utils/request.js');

Page({
  // GET请求 - 获取数据
  getUserProfile() {
    request.get('/api/student/profile')
      .then(res => {
        console.log('用户资料:', res);
        this.setData({ profile: res });
      })
      .catch(err => {
        console.error('获取失败:', err);
      });
  },
  
  // POST请求 - 提交数据
  updateProfile() {
    request.post('/api/student/update', {
      name: '张三',
      grade: '三年级',
      age: 8
    }, {
      showLoading: true,
      loadingText: '更新中...'
    })
      .then(res => {
        wx.showToast({
          title: '更新成功',
          icon: 'success'
        });
      })
      .catch(err => {
        wx.showToast({
          title: '更新失败',
          icon: 'none'
        });
      });
  },
  
  // PUT请求 - 更新资源
  updateSingleField() {
    request.put('/api/student/123/nickname', {
      nickname: '小明'
    })
      .then(res => {
        console.log('更新成功');
      });
  },
  
  // DELETE请求 - 删除资源
  deleteRecord() {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      success: (res) => {
        if (res.confirm) {
          request.del('/api/records/123')
            .then(() => {
              wx.showToast({ title: '删除成功' });
            });
        }
      }
    });
  }
})
```

### 2.2 不需要 token 的请求

```javascript
const request = require('../../utils/request.js');

// 公开接口，不需要token
request.get('/api/public/grades', {}, {
  needToken: false
})
  .then(res => {
    console.log('年级列表:', res);
  });
```

### 2.3 自定义请求头

```javascript
const request = require('../../utils/request.js');

request.post('/api/special-endpoint', {
  data: 'test'
}, {
  header: {
    'Custom-Header': 'custom-value',
    'X-Request-ID': '12345'
  }
})
  .then(res => {
    console.log('响应:', res);
  });
```

## 3. 文件上传

### 3.1 上传头像

```javascript
const request = require('../../utils/request.js');

Page({
  // 选择并上传头像
  uploadAvatar() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const filePath = res.tempFilePaths[0];
        
        // 上传文件
        request.uploadFile(filePath, {
          url: '/api/upload/avatar',
          name: 'avatar',
          formData: {
            userId: this.data.userId
          }
        })
          .then(res => {
            console.log('上传成功:', res);
            this.setData({
              avatarUrl: res.url
            });
            wx.showToast({
              title: '头像更新成功',
              icon: 'success'
            });
          })
          .catch(err => {
            wx.showToast({
              title: '上传失败',
              icon: 'none'
            });
          });
      }
    });
  }
})
```

### 3.2 上传多个文件

```javascript
Page({
  uploadMultipleFiles() {
    wx.chooseImage({
      count: 9,
      success: (res) => {
        const filePaths = res.tempFilePaths;
        
        // 显示上传进度
        wx.showLoading({
          title: `上传中 0/${filePaths.length}`,
          mask: true
        });
        
        // 依次上传每个文件
        const uploadPromises = filePaths.map((filePath, index) => {
          return request.uploadFile(filePath, {
            url: '/api/upload/images',
            name: 'image'
          }).then(res => {
            // 更新进度
            wx.showLoading({
              title: `上传中 ${index + 1}/${filePaths.length}`
            });
            return res;
          });
        });
        
        // 等待所有文件上传完成
        Promise.all(uploadPromises)
          .then(results => {
            wx.hideLoading();
            wx.showToast({
              title: '全部上传成功',
              icon: 'success'
            });
            console.log('上传结果:', results);
          })
          .catch(err => {
            wx.hideLoading();
            wx.showToast({
              title: '部分文件上传失败',
              icon: 'none'
            });
          });
      }
    });
  }
})
```

## 4. 题目相关 API

### 4.1 获取题目分类

```javascript
const request = require('../../utils/request.js');
const config = require('../../config.js');

Page({
  // 方式一：使用request工具
  getCategories() {
    request.get('/api/question-section-groups/by-grade/3')
      .then(res => {
        console.log('分类列表:', res.sectionGroups);
        this.setData({
          categories: res.sectionGroups
        });
      });
  },
  
  // 方式二：直接使用wx.request（已有的代码）
  getCategoriesDirectly() {
    wx.request({
      url: `${config.API_BASE_URL}/api/question-section-groups/by-grade/3`,
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200) {
          this.setData({
            categories: res.data.sectionGroups
          });
        }
      }
    });
  }
})
```

### 4.2 获取题目列表

```javascript
Page({
  getQuestions(sectionGroupId) {
    request.get(`/api/question-section-groups/questions-list/${sectionGroupId}`)
      .then(res => {
        console.log('题目列表:', res.questions);
        this.setData({
          questions: res.questions,
          sectionGroupTitle: res.sectionGroupTitle
        });
      });
  }
})
```

### 4.3 提交答题结果

```javascript
Page({
  submitAnswer(questionId, answer) {
    request.post('/api/student/answer', {
      questionId: questionId,
      answer: answer,
      timeUsed: 10, // 答题用时（秒）
      isCorrect: true // 是否正确
    })
      .then(res => {
        console.log('提交成功:', res);
      });
  },
  
  // 批量提交答题结果
  submitExamResult(answers) {
    request.post('/api/student/exam-result', {
      sectionGroupId: this.data.sectionGroupId,
      answers: answers,
      totalTime: 300,
      score: 85
    }, {
      showLoading: true,
      loadingText: '提交中...'
    })
      .then(res => {
        wx.showToast({
          title: '提交成功',
          icon: 'success'
        });
        
        // 跳转到结果页面
        wx.navigateTo({
          url: `/pages/examResult/index?score=${res.score}`
        });
      });
  }
})
```

## 5. 用户信息相关

### 5.1 获取用户资料

```javascript
Page({
  onShow() {
    // 获取完整的用户资料
    request.get('/api/student/profile')
      .then(res => {
        this.setData({
          studentInfo: res
        });
      });
  }
})
```

### 5.2 更新用户资料

```javascript
Page({
  updateStudentInfo() {
    const formData = {
      name: this.data.name,
      grade: this.data.grade,
      school: this.data.school,
      className: this.data.className
    };
    
    request.put('/api/student/profile', formData, {
      showLoading: true
    })
      .then(res => {
        wx.showToast({
          title: '保存成功',
          icon: 'success'
        });
        
        // 返回上一页
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      });
  }
})
```

## 6. 错误处理

### 6.1 统一错误处理

```javascript
Page({
  loadData() {
    request.get('/api/some-endpoint')
      .then(res => {
        // 成功处理
        console.log('数据:', res);
      })
      .catch(err => {
        // 错误处理
        console.error('错误:', err);
        
        if (err.statusCode === 401) {
          // 未登录或token过期
          this.showLoginDialog();
        } else if (err.statusCode === 403) {
          // 无权限
          wx.showToast({
            title: '无权访问',
            icon: 'none'
          });
        } else if (err.statusCode === 404) {
          // 资源不存在
          wx.showToast({
            title: '数据不存在',
            icon: 'none'
          });
        } else if (err.statusCode === 500) {
          // 服务器错误
          wx.showToast({
            title: '服务器错误，请稍后重试',
            icon: 'none'
          });
        } else {
          // 其他错误
          wx.showToast({
            title: err.message || '请求失败',
            icon: 'none'
          });
        }
      });
  }
})
```

### 6.2 请求重试

```javascript
Page({
  // 带重试的请求
  async requestWithRetry(url, maxRetries = 3) {
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        const res = await request.get(url);
        return res;
      } catch (err) {
        lastError = err;
        console.log(`请求失败，第 ${i + 1} 次重试`);
        
        // 等待一段时间后重试
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
    
    // 所有重试都失败
    throw lastError;
  }
})
```

## 7. 高级用法

### 7.1 并发请求

```javascript
Page({
  async loadAllData() {
    wx.showLoading({ title: '加载中...' });
    
    try {
      // 并发请求多个接口
      const [profile, questions, rankings] = await Promise.all([
        request.get('/api/student/profile'),
        request.get('/api/questions/recent'),
        request.get('/api/rankings/top10')
      ]);
      
      this.setData({
        profile,
        questions,
        rankings
      });
      
      wx.hideLoading();
    } catch (err) {
      wx.hideLoading();
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  }
})
```

### 7.2 请求队列

```javascript
// 创建请求队列管理器
class RequestQueue {
  constructor(maxConcurrent = 3) {
    this.queue = [];
    this.running = 0;
    this.maxConcurrent = maxConcurrent;
  }
  
  add(requestFn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ requestFn, resolve, reject });
      this.run();
    });
  }
  
  async run() {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }
    
    this.running++;
    const { requestFn, resolve, reject } = this.queue.shift();
    
    try {
      const result = await requestFn();
      resolve(result);
    } catch (err) {
      reject(err);
    } finally {
      this.running--;
      this.run();
    }
  }
}

// 使用示例
const queue = new RequestQueue(2); // 最多同时2个请求

Page({
  loadImages() {
    const imageIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    
    const promises = imageIds.map(id => {
      return queue.add(() => {
        return request.get(`/api/images/${id}`);
      });
    });
    
    Promise.all(promises).then(images => {
      console.log('所有图片加载完成:', images);
    });
  }
})
```

### 7.3 请求缓存

```javascript
// 简单的请求缓存
const requestCache = {};

function cachedRequest(url, cacheTime = 60000) {
  const now = Date.now();
  const cached = requestCache[url];
  
  // 如果缓存存在且未过期
  if (cached && (now - cached.timestamp < cacheTime)) {
    console.log('使用缓存数据:', url);
    return Promise.resolve(cached.data);
  }
  
  // 发起新请求
  return request.get(url).then(data => {
    // 保存到缓存
    requestCache[url] = {
      data: data,
      timestamp: now
    };
    return data;
  });
}

// 使用示例
Page({
  loadCategories() {
    // 1分钟内重复请求会使用缓存
    cachedRequest('/api/question-section-groups/by-grade/3', 60000)
      .then(res => {
        console.log('分类数据:', res);
      });
  }
})
```

## 8. 调试技巧

### 8.1 打印请求日志

request.js 工具已经内置了日志输出，在控制台可以看到：

```
[API] GET http://localhost:8080/api/student/profile
  request: {}
  response: { id: 123, name: "张三", ... }
```

### 8.2 模拟网络延迟

```javascript
function delayRequest(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

Page({
  async loadData() {
    await delayRequest(2000); // 模拟2秒延迟
    
    const data = await request.get('/api/data');
    console.log(data);
  }
})
```

## 总结

- 使用 `utils/wechat-auth.js` 处理微信登录
- 使用 `utils/request.js` 处理所有API请求
- request工具会自动携带token
- request工具会自动处理401错误（token过期）
- 所有请求都会记录日志方便调试
- 支持显示加载提示、自定义请求头等功能

