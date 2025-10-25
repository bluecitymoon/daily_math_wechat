# 微信登录快速参考

## 🚀 快速开始

### 1. 前端调用登录（最简单）

```javascript
const wechatAuth = require('../../utils/wechat-auth.js');

// 一行代码完成登录
wechatAuth.getUserProfileAndLogin()
  .then(res => {
    wx.setStorageSync('userInfo', res.student);
    wx.setStorageSync('token', res.token);
  });
```

### 2. 发起 API 请求

```javascript
const request = require('../../utils/request.js');

// GET 请求
request.get('/api/student/profile').then(res => {
  console.log(res);
});

// POST 请求
request.post('/api/student/update', {
  name: '张三'
}).then(res => {
  console.log(res);
});
```

## 📡 后端接口

### POST /api/wechat/login

**请求**:
```json
{
  "code": "微信登录code",
  "encryptedData": "加密数据",
  "iv": "初始向量",
  "signature": "签名",
  "userInfo": {
    "nickName": "昵称",
    "avatarUrl": "头像"
  }
}
```

**响应**:
```json
{
  "student": {
    "id": 123,
    "wechatUserId": "openid",
    "wechatNickname": "昵称"
  },
  "token": "JWT token",
  "isNewUser": false
}
```

## 🗄️ 数据库字段

```sql
-- student 表新增字段
wechatUserId VARCHAR(255) UNIQUE,
wechatNickname VARCHAR(255),
wechatAvatar VARCHAR(500),
wechatGender INT DEFAULT 0,
wechatCountry VARCHAR(100),
wechatProvince VARCHAR(100),
wechatCity VARCHAR(100),
wechatLanguage VARCHAR(50)
```

## 🔧 配置

### config.js
```javascript
const API_BASE_URL = 'http://localhost:8080';
const WECHAT_CONFIG = {
  appId: 'wx30bc2e148f3356a8',
  appSecret: '2a0ece224d8831b5145f43d56e48a95f'
};
```

## 📝 核心代码片段

### 登录流程
```javascript
// 1. 获取用户信息
wx.getUserProfile({
  desc: '完善用户信息',
  success: (res) => {
    // 2. 获取登录code
    wx.login({
      success: (loginRes) => {
        // 3. 调用后端接口
        wx.request({
          url: `${config.API_BASE_URL}/api/wechat/login`,
          method: 'POST',
          data: {
            code: loginRes.code,
            ...res
          },
          success: (apiRes) => {
            // 4. 保存用户信息和token
            wx.setStorageSync('userInfo', apiRes.data.student);
            wx.setStorageSync('token', apiRes.data.token);
          }
        });
      }
    });
  }
});
```

### 后端验证 code
```javascript
// Node.js + Express
app.post('/api/wechat/login', async (req, res) => {
  const { code } = req.body;
  
  // 调用微信API
  const wxRes = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
    params: {
      appid: 'wx30bc2e148f3356a8',
      secret: '2a0ece224d8831b5145f43d56e48a95f',
      js_code: code,
      grant_type: 'authorization_code'
    }
  });
  
  const { openid, session_key } = wxRes.data;
  
  // 查找或创建用户
  let student = await Student.findOne({ wechatUserId: openid });
  if (!student) {
    student = await Student.create({
      wechatUserId: openid,
      wechatNickname: req.body.userInfo.nickName,
      wechatAvatar: req.body.userInfo.avatarUrl
    });
  }
  
  // 生成token
  const token = jwt.sign({ id: student.id }, 'secret', { expiresIn: '7d' });
  
  res.json({ student, token, isNewUser: !student });
});
```

## 🧪 测试

### 前端测试
```javascript
// 1. 点击头像
// 2. 点击"立即登录"
// 3. 查看控制台日志

// 预期输出：
// 用户信息获取成功
// 微信登录成功，code: xxx
// 后端登录成功: {...}
```

### 后端测试
```bash
curl -X POST http://localhost:8080/api/wechat/login \
  -H "Content-Type: application/json" \
  -d '{
    "code": "test_code",
    "userInfo": {
      "nickName": "测试",
      "avatarUrl": "http://test.com/avatar.png"
    }
  }'
```

## ⚠️ 注意事项

1. **AppSecret 必须在后端使用，不要暴露在前端**
2. code 有效期只有 5 分钟，且只能使用一次
3. 生产环境必须使用 HTTPS
4. Token 建议设置 7 天过期
5. Session key 需要加密存储

## 📚 完整文档

- `WECHAT_LOGIN_IMPLEMENTATION_SUMMARY.md` - 实现总结
- `BACKEND_LOGIN_INTEGRATION.md` - 后端集成指南
- `API_USAGE_EXAMPLES.md` - API 使用示例
- `WECHAT_LOGIN_GUIDE.md` - 详细功能说明
- `WECHAT_LOGIN_TEST.md` - 测试指南

## 🔗 微信官方文档

- [小程序登录](https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/login.html)
- [wx.login API](https://developers.weixin.qq.com/miniprogram/dev/api/open-api/login/wx.login.html)
- [wx.getUserProfile API](https://developers.weixin.qq.com/miniprogram/dev/api/open-api/user-info/wx.getUserProfile.html)
- [code2Session](https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/login/auth.code2Session.html)

