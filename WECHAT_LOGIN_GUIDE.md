# 微信登录功能说明

## 功能概述

已实现完整的微信登录功能，包括：
- ✅ 调用 `wx.login()` 获取临时登录凭证（code）
- ✅ 调用 `wx.getUserProfile()` 获取用户基本信息（头像、昵称）
- ✅ 将用户数据发送到后端 `/api/wechat/login` 接口
- ✅ 后端验证并返回用户信息和 JWT token
- ✅ 前端保存用户信息和 token 到本地存储
- ✅ 支持新旧版本微信的登录方式
- ✅ 提供通用的网络请求工具（自动携带token）

## 最新更新

**✨ 2025-10-14 更新**：
- 已集成后端微信登录接口 `/api/wechat/login`
- 前端在获取 code 后自动调用后端接口完成登录
- 新增通用请求工具 `utils/request.js`
- 优化登录流程和错误处理

## 配置信息

已在 `config.js` 中配置微信小程序信息：
- **AppID**: wx30bc2e148f3356a8
- **AppSecret**: 2a0ece224d8831b5145f43d56e48a95f

## 前端实现

### 1. 登录流程
1. 用户点击头像区域 → 触发 `handleUserClick()`
2. 判断是否已登录：
   - 已登录：跳转个人中心
   - 未登录：显示登录弹窗
3. 用户点击"立即登录" → 调用 `getUserProfile()` 或 `bindgetuserinfo()`
4. 获取用户信息并调用 `wechatLogin()` 获取登录凭证（code）
5. 调用 `callBackendLogin()` 将 code 和用户数据发送到后端
6. 后端验证并返回用户信息和 JWT token
7. 前端保存用户信息和 token 到本地存储
8. 显示登录成功提示

### 2. 核心函数

#### wechatLogin()
调用微信登录API获取code：
```javascript
wx.login({
  success: (res) => {
    // res.code 是临时登录凭证
  }
})
```

#### getUserProfile()
新版本获取用户信息方法：
```javascript
wx.getUserProfile({
  desc: '完善用户信息',
  success: (res) => {
    // res.userInfo 包含用户头像、昵称等信息
    // res.encryptedData 包含加密的完整用户信息
    // res.iv 加密算法的初始向量
  }
})
```

#### callBackendLogin(code, userProfileData)
调用后端登录接口：
```javascript
callBackendLogin(code, userProfileData) {
  return wx.request({
    url: `${config.API_BASE_URL}/api/wechat/login`,
    method: 'POST',
    data: {
      code: code,
      encryptedData: userProfileData.encryptedData,
      iv: userProfileData.iv,
      signature: userProfileData.signature,
      rawData: userProfileData.rawData,
      userInfo: userProfileData.userInfo
    }
  });
}
```

## 后端实现建议

### 安全说明
⚠️ **重要**：AppSecret 不应该在前端代码中使用，必须在后端服务器中保密。

### 推荐的后端流程

1. **前端发送 code 到后端**
```javascript
wx.request({
  url: 'https://your-backend.com/api/wechat/login',
  method: 'POST',
  data: {
    code: code
  }
})
```

2. **后端调用微信API换取 openid**
```javascript
// Node.js 示例
const axios = require('axios');

app.post('/api/wechat/login', async (req, res) => {
  const { code } = req.body;
  const appId = 'wx30bc2e148f3356a8';
  const appSecret = '2a0ece224d8831b5145f43d56e48a95f';
  
  try {
    // 调用微信API
    const response = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
      params: {
        appid: appId,
        secret: appSecret,
        js_code: code,
        grant_type: 'authorization_code'
      }
    });
    
    const { openid, session_key } = response.data;
    
    // 生成自定义登录态（如JWT token）
    const token = generateToken({ openid });
    
    res.json({
      success: true,
      token: token,
      openid: openid
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '登录失败'
    });
  }
});
```

### 微信API接口

**接口地址**：
```
GET https://api.weixin.qq.com/sns/jscode2session
```

**请求参数**：
| 参数 | 必填 | 说明 |
|------|------|------|
| appid | 是 | 小程序 appId |
| secret | 是 | 小程序 appSecret |
| js_code | 是 | 登录时获取的 code |
| grant_type | 是 | 固定值：authorization_code |

**返回数据**：
```json
{
  "openid": "用户唯一标识",
  "session_key": "会话密钥",
  "unionid": "用户在开放平台的唯一标识符（可选）",
  "errcode": 0,
  "errmsg": "ok"
}
```

## 工具文件

### utils/wechat-auth.js
提供了微信登录的工具函数：
- `wechatLogin()`: 完整的微信登录流程
- `code2Session()`: 通过后端API换取session
- `code2SessionDirect()`: 直接调用微信API（仅测试用）
- `checkSession()`: 检查登录状态

## 使用示例

### 在其他页面使用微信登录

```javascript
const wechatAuth = require('../../utils/wechat-auth.js');

Page({
  // 登录
  handleLogin() {
    wx.showLoading({ title: '登录中...' });
    
    wechatAuth.wechatLogin().then(res => {
      console.log('登录成功:', res);
      // 保存登录信息
      wx.setStorageSync('openid', res.openid);
      wx.hideLoading();
    }).catch(err => {
      console.error('登录失败:', err);
      wx.hideLoading();
      wx.showToast({
        title: '登录失败',
        icon: 'none'
      });
    });
  },
  
  // 检查登录状态
  checkLoginStatus() {
    wechatAuth.checkSession().then(isValid => {
      if (!isValid) {
        // session已过期，需要重新登录
        this.handleLogin();
      }
    });
  }
})
```

## 数据存储

用户登录后，以下信息会保存到本地存储：

```javascript
{
  avatarUrl: "用户头像URL",
  nickName: "用户昵称",
  wechatCode: "微信登录code",
  loginTime: "登录时间戳",
  // 如果使用Bmob后端，还会包含Bmob用户信息
}
```

## 测试说明

1. **开发环境测试**
   - 在微信开发者工具中测试
   - 确保已配置正确的 AppID
   - 检查控制台日志确认登录流程

2. **真机测试**
   - 需要在微信公众平台配置服务器域名
   - 配置合法域名：`https://api.weixin.qq.com`

## 注意事项

1. ⚠️ **安全性**：AppSecret 必须保存在后端服务器，不要暴露在前端代码中
2. 📱 **用户体验**：登录过程中显示加载提示，失败时给出明确提示
3. 🔄 **Session管理**：定期检查 session 有效性，过期时提示用户重新登录
4. 📊 **数据同步**：如果使用了 Bmob 等后端服务，需要同步用户信息
5. 🔐 **权限申请**：获取用户信息时需要明确说明用途（desc参数）

## 下一步优化建议

1. 实现后端API接收code并换取openid
2. 实现用户信息与后端数据库同步
3. 添加登录态管理（如JWT token）
4. 实现自动登录功能
5. 添加登录失败重试机制

