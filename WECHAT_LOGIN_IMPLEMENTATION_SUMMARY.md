# 微信登录实现总结

## ✅ 已完成的功能

### 1. 前端集成后端微信登录接口

**实现日期**: 2025-10-14

已成功将前端微信登录流程与后端 `/api/wechat/login` 接口集成。

### 2. 核心功能

✅ **微信登录流程**
- 调用 `wx.login()` 获取临时登录凭证 code
- 调用 `wx.getUserProfile()` 获取用户信息和加密数据
- 将所有数据发送到后端接口验证
- 保存后端返回的用户信息和 JWT token

✅ **请求工具**
- 创建通用请求工具 `utils/request.js`
- 自动携带 JWT token
- 自动处理 token 过期（401）
- 统一错误处理

✅ **数据存储**
- 用户信息存储到本地 Storage
- JWT token 单独存储
- 支持登录状态检查

## 📁 修改的文件

### 新增文件

1. **utils/request.js**
   - 通用网络请求工具
   - 自动添加 Authorization 请求头
   - 支持 GET、POST、PUT、DELETE 方法
   - 支持文件上传
   - 统一错误处理

2. **BACKEND_LOGIN_INTEGRATION.md**
   - 后端微信登录集成完整文档
   - 包含 API 接口说明
   - 数据库设计建议
   - 后端实现要点
   - 安全注意事项

3. **API_USAGE_EXAMPLES.md**
   - API 使用示例大全
   - 包含各种场景的代码示例
   - 错误处理示例
   - 高级用法示例

### 修改的文件

1. **pages/index/index.js**
   - 修改 `getUserProfile()` 方法
   - 修改 `bindgetuserinfo()` 方法
   - 新增 `callBackendLogin()` 方法
   - 优化登录流程

2. **utils/wechat-auth.js**
   - 修改 `loginWithBackend()` 方法
   - 修改 `wechatLogin()` 方法
   - 新增 `getUserProfileAndLogin()` 方法
   - 更新导出函数

3. **WECHAT_LOGIN_GUIDE.md**
   - 更新功能概述
   - 添加最新更新说明
   - 更新登录流程说明

## 🔄 登录流程

```
用户点击头像
    ↓
显示登录弹窗
    ↓
用户点击"立即登录"
    ↓
调用 wx.getUserProfile()
    ↓
获取用户信息成功
    ↓
调用 wx.login()
    ↓
获取 code 成功
    ↓
调用 callBackendLogin(code, userProfileData)
    ↓
发送请求到 /api/wechat/login
    ↓
后端验证并返回数据
    ↓
保存用户信息和 token
    ↓
显示登录成功
```

## 📡 前后端数据交互

### 前端发送数据

```json
POST /api/wechat/login

{
  "code": "0d11yw0w3GJoO53eFi4w3VVb7a21yw0Q",
  "encryptedData": "AaggnWrYEtOMCC82kjaEfduyi9dLgCW5R8kGF0L0W+BL4wgABz...",
  "iv": "ClsRQt05TYFzy+XogSDDiw==",
  "signature": "76b8837881b5579bd0d3eb233f6a7b2285ca24d2",
  "rawData": "{\"nickName\":\"用户昵称\",\"gender\":1,...}",
  "userInfo": {
    "nickName": "用户昵称",
    "avatarUrl": "https://thirdwx.qlogo.cn/...",
    "gender": 1,
    "city": "Guangzhou",
    "province": "Guangdong",
    "country": "China",
    "language": "zh_CN"
  }
}
```

### 后端返回数据

```json
{
  "student": {
    "id": 123,
    "wechatUserId": "oX1234567890abcdef",
    "wechatNickname": "用户昵称",
    "wechatAvatar": "https://thirdwx.qlogo.cn/...",
    "wechatGender": 1,
    "wechatCountry": "China",
    "wechatProvince": "Guangdong",
    "wechatCity": "Guangzhou",
    "wechatLanguage": "zh_CN"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "isNewUser": false
}
```

## 💾 本地存储数据

### userInfo

```javascript
{
  id: 123,
  wechatUserId: "oX1234567890abcdef",
  wechatNickname: "用户昵称",
  wechatAvatar: "https://thirdwx.qlogo.cn/...",
  avatarUrl: "https://thirdwx.qlogo.cn/...",  // 兼容旧代码
  nickName: "用户昵称",  // 兼容旧代码
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### token

```javascript
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## 🛠️ 使用方法

### 方法一：在页面中直接使用

```javascript
// pages/index/index.js
const config = require('../../config.js');

Page({
  getUserProfile(e) {
    wx.getUserProfile({
      desc: '完善用户信息',
      success: (res) => {
        this.wechatLogin().then(code => {
          this.callBackendLogin(code, res).then(loginResult => {
            // 保存用户信息
            wx.setStorageSync('userInfo', loginResult.student);
            wx.setStorageSync('token', loginResult.token);
          });
        });
      }
    });
  }
})
```

### 方法二：使用工具函数（推荐）

```javascript
const wechatAuth = require('../../utils/wechat-auth.js');

Page({
  handleLogin() {
    wechatAuth.getUserProfileAndLogin()
      .then(res => {
        console.log('登录成功:', res);
        wx.setStorageSync('userInfo', res.student);
        wx.setStorageSync('token', res.token);
      })
      .catch(err => {
        console.error('登录失败:', err);
      });
  }
})
```

### 方法三：使用请求工具

```javascript
const request = require('../../utils/request.js');

Page({
  // 获取数据（自动携带token）
  loadUserProfile() {
    request.get('/api/student/profile')
      .then(res => {
        this.setData({ profile: res });
      });
  },
  
  // 提交数据
  updateProfile(data) {
    request.post('/api/student/update', data)
      .then(res => {
        wx.showToast({ title: '更新成功' });
      });
  }
})
```

## 🔐 安全说明

### ⚠️ 重要安全提示

1. **AppSecret 保护**
   - AppSecret 已配置在 `config.js` 中
   - **生产环境必须移除前端的 AppSecret**
   - AppSecret 只能在后端使用

2. **Token 管理**
   - JWT token 有效期建议设置为 7 天
   - 前端自动处理 token 过期（401响应）
   - Token 过期后自动清除登录信息

3. **数据传输**
   - 生产环境必须使用 HTTPS
   - 微信小程序强制要求 HTTPS

## 📋 后端实现检查清单

- [ ] 实现 `/api/wechat/login` 接口
- [ ] 调用微信 API 验证 code
- [ ] 解密 encryptedData 获取完整用户信息
- [ ] 在 student 表中查找或创建用户
- [ ] 生成 JWT token
- [ ] 返回用户信息和 token
- [ ] 实现 JWT 验证中间件
- [ ] 实现其他需要认证的 API 接口

## 🗄️ 数据库字段

### student 表新增字段

```sql
wechatUserId VARCHAR(255) UNIQUE,     -- 微信openid（唯一）
wechatNickname VARCHAR(255),           -- 微信昵称
wechatAvatar VARCHAR(500),             -- 微信头像URL
wechatGender INT DEFAULT 0,            -- 性别（0未知，1男，2女）
wechatCountry VARCHAR(100),            -- 国家
wechatProvince VARCHAR(100),           -- 省份
wechatCity VARCHAR(100),               -- 城市
wechatLanguage VARCHAR(50),            -- 语言
wechatUnionId VARCHAR(255),            -- unionid（可选）
wechatSessionKey VARCHAR(255),         -- session_key
createdAt TIMESTAMP,                   -- 创建时间
updatedAt TIMESTAMP                    -- 更新时间
```

## 🧪 测试步骤

### 1. 前端测试

```bash
# 1. 打开微信开发者工具
# 2. 确保 config.js 中 API_BASE_URL 指向后端服务器
# 3. 点击首页顶部用户头像
# 4. 点击"立即登录"按钮
# 5. 授权获取用户信息
# 6. 查看控制台日志
```

**预期日志输出**：
```
用户信息获取成功: {cloudID: undefined, encryptedData: "...", ...}
微信登录成功，code: 0d11yw0w3GJoO53eFi4w3VVb7a21yw0Q
获取到登录凭证: 0d11yw0w3GJoO53eFi4w3VVb7a21yw0Q
后端登录接口响应: {data: {...}, statusCode: 200}
后端登录成功: {student: {...}, token: "...", isNewUser: false}
```

### 2. 后端测试

使用 Postman 或其他工具测试：

```bash
POST http://localhost:8080/api/wechat/login
Content-Type: application/json

{
  "code": "测试code",
  "userInfo": {
    "nickName": "测试用户",
    "avatarUrl": "https://test.com/avatar.png"
  }
}
```

### 3. 集成测试

- [ ] 首次登录创建新用户
- [ ] 重复登录更新用户信息
- [ ] Token 正确保存
- [ ] 带 token 的请求成功
- [ ] Token 过期自动退出登录

## 📚 相关文档

1. **BACKEND_LOGIN_INTEGRATION.md** - 后端集成完整文档
2. **API_USAGE_EXAMPLES.md** - API 使用示例大全
3. **WECHAT_LOGIN_GUIDE.md** - 微信登录功能说明
4. **WECHAT_LOGIN_TEST.md** - 微信登录测试指南

## 🎯 下一步工作

### 优先级高

1. 完善注册流程
   - 新用户首次登录后引导填写信息
   - 实现注册页面逻辑

2. 实现其他需要认证的 API
   - 用户资料查询/更新
   - 答题记录提交
   - 成绩查询等

### 优先级中

3. 自动登录
   - 启动时检查 token 有效性
   - 自动刷新过期 token

4. 用户资料管理
   - 查看个人资料
   - 编辑个人信息
   - 头像上传

### 优先级低

5. 统计和分析
   - 登录日志
   - 用户活跃度统计
   - 数据分析

## 💡 常见问题

### Q1: 如何测试登录流程？
A: 参考 `WECHAT_LOGIN_TEST.md` 文档中的测试步骤。

### Q2: 后端需要实现哪些接口？
A: 参考 `BACKEND_LOGIN_INTEGRATION.md` 文档中的后端实现要点。

### Q3: 如何在其他页面使用 token？
A: 使用 `utils/request.js` 工具，会自动携带 token。

### Q4: Token 过期怎么办？
A: request.js 会自动处理 401 错误，清除登录信息并提示重新登录。

### Q5: 如何获取当前登录用户信息？
```javascript
const userInfo = wx.getStorageSync('userInfo');
const token = wx.getStorageSync('token');
```

## 📞 技术支持

如有问题，请查看相关文档或联系开发团队。

---

**实现完成时间**: 2025-10-14  
**最后更新时间**: 2025-10-14

