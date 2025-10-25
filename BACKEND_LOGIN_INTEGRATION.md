# 后端微信登录集成文档

## 概述

前端已成功集成后端微信登录接口 `/api/wechat/login`。用户点击头像登录后，前端会：
1. 调用 `wx.login()` 获取临时登录凭证 code
2. 调用 `wx.getUserProfile()` 获取用户信息（包括加密数据）
3. 将所有数据发送到后端 `/api/wechat/login` 接口
4. 保存后端返回的用户信息和 token

## API 接口说明

### 请求接口

**接口地址**: `POST /api/wechat/login`

**请求头**:
```json
{
  "Content-Type": "application/json"
}
```

**请求体**:
```json
{
  "code": "0d11yw0w3GJoO53eFi4w3VVb7a21yw0Q",
  "encryptedData": "AaggnWrYEtOMCC82kjaEfduyi9dLgCW5R8kGF0L0W+BL4wgABz…",
  "iv": "ClsRQt05TYFzy+XogSDDiw==",
  "signature": "76b8837881b5579bd0d3eb233f6a7b2285ca24d2",
  "rawData": "{\"nickName\":\"用户昵称\",\"gender\":1,...}",
  "userInfo": {
    "nickName": "用户昵称",
    "gender": 1,
    "language": "zh_CN",
    "city": "Guangzhou",
    "province": "Guangdong",
    "country": "China",
    "avatarUrl": "https://thirdwx.qlogo.cn/..."
  }
}
```

**字段说明**:
- `code`: 微信登录返回的临时登录凭证，有效期5分钟
- `encryptedData`: 包括敏感数据在内的完整用户信息的加密数据
- `iv`: 加密算法的初始向量
- `signature`: 签名，用于验证数据完整性
- `rawData`: 不包括敏感信息的原始数据字符串
- `userInfo`: 用户公开信息对象

### 响应格式

**成功响应** (200 OK):
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
    "wechatLanguage": "zh_CN",
    "createdAt": "2025-10-14T12:00:00.000Z",
    "updatedAt": "2025-10-14T12:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "isNewUser": false
}
```

**字段说明**:
- `student`: 学生用户信息对象
  - `id`: 学生ID
  - `wechatUserId`: 微信openid（唯一标识）
  - `wechatNickname`: 微信昵称
  - `wechatAvatar`: 微信头像URL
  - `wechatGender`: 性别（0未知，1男，2女）
  - `wechatCountry`: 国家
  - `wechatProvince`: 省份
  - `wechatCity`: 城市
  - `wechatLanguage`: 语言
- `token`: JWT身份认证令牌
- `isNewUser`: 是否是新用户（首次登录）

**失败响应**:
```json
{
  "message": "错误信息",
  "error": "详细错误描述"
}
```

## 数据库设计建议

### student 表新增字段

```sql
-- 微信用户唯一标识（openid）
wechatUserId VARCHAR(255) UNIQUE,

-- 微信用户基本信息
wechatNickname VARCHAR(255),
wechatAvatar VARCHAR(500),
wechatGender INT DEFAULT 0,

-- 微信用户地理信息
wechatCountry VARCHAR(100),
wechatProvince VARCHAR(100),
wechatCity VARCHAR(100),
wechatLanguage VARCHAR(50),

-- 微信unionid（可选，用于多应用统一身份）
wechatUnionId VARCHAR(255),

-- 微信session_key（用于数据解密，敏感字段）
wechatSessionKey VARCHAR(255),

-- 时间戳
createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```

**索引建议**:
```sql
CREATE UNIQUE INDEX idx_wechat_user_id ON student(wechatUserId);
CREATE INDEX idx_wechat_union_id ON student(wechatUnionId);
```

## 前端实现

### 登录流程

1. **用户点击头像**
   ```javascript
   handleUserClick() {
     if (this.data.userInfo.avatarUrl) {
       // 已登录，跳转个人中心
       this.gocenter();
     } else {
       // 未登录，弹出登录
       this.login();
     }
   }
   ```

2. **用户点击"立即登录"**
   ```javascript
   getUserProfile(e) {
     wx.getUserProfile({
       desc: '完善用户信息',
       success: (res) => {
         // 获取用户信息成功
         this.wechatLogin().then(code => {
           // 调用后端登录接口
           this.callBackendLogin(code, res);
         });
       }
     });
   }
   ```

3. **调用后端接口**
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

4. **保存登录信息**
   ```javascript
   // 保存用户信息
   const userInfo = {
     ...loginResult.student,
     avatarUrl: res.userInfo.avatarUrl,
     nickName: res.userInfo.nickName,
     token: loginResult.token
   };
   
   wx.setStorageSync('userInfo', userInfo);
   wx.setStorageSync('token', loginResult.token);
   ```

### 使用工具函数

项目提供了两个工具文件：

#### 1. wechat-auth.js - 微信登录专用工具

```javascript
const wechatAuth = require('../../utils/wechat-auth.js');

// 完整的登录流程（包括获取用户信息）
wechatAuth.getUserProfileAndLogin().then(res => {
  console.log('登录成功:', res);
  // 保存用户信息和token
  wx.setStorageSync('userInfo', res.student);
  wx.setStorageSync('token', res.token);
}).catch(err => {
  console.error('登录失败:', err);
});
```

#### 2. request.js - 通用网络请求工具

```javascript
const request = require('../../utils/request.js');

// GET请求（自动携带token）
request.get('/api/student/profile').then(res => {
  console.log('获取用户资料:', res);
});

// POST请求
request.post('/api/student/update', {
  name: '张三',
  grade: '三年级'
}).then(res => {
  console.log('更新成功:', res);
});

// 上传文件
request.uploadFile(filePath, {
  url: '/api/upload/avatar',
  name: 'avatar'
}).then(res => {
  console.log('上传成功:', res);
});
```

## 后端实现要点

### 1. 验证 code 获取 session_key

```javascript
// 调用微信API
const response = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
  params: {
    appid: 'wx30bc2e148f3356a8',
    secret: '2a0ece224d8831b5145f43d56e48a95f',
    js_code: code,
    grant_type: 'authorization_code'
  }
});

const { openid, session_key, unionid } = response.data;
```

### 2. 解密用户信息（可选）

如果需要获取用户的敏感信息（如手机号），需要解密 `encryptedData`：

```javascript
const crypto = require('crypto');

function decryptData(encryptedData, sessionKey, iv) {
  const decipher = crypto.createDecipheriv(
    'aes-128-cbc',
    Buffer.from(sessionKey, 'base64'),
    Buffer.from(iv, 'base64')
  );
  
  decipher.setAutoPadding(true);
  
  let decoded = decipher.update(encryptedData, 'base64', 'utf8');
  decoded += decipher.final('utf8');
  
  return JSON.parse(decoded);
}
```

### 3. 查找或创建用户

```javascript
// 查找用户
let student = await Student.findOne({ where: { wechatUserId: openid } });

if (!student) {
  // 首次登录，创建新用户
  student = await Student.create({
    wechatUserId: openid,
    wechatNickname: userInfo.nickName,
    wechatAvatar: userInfo.avatarUrl,
    wechatGender: userInfo.gender,
    wechatCountry: userInfo.country,
    wechatProvince: userInfo.province,
    wechatCity: userInfo.city,
    wechatLanguage: userInfo.language,
    wechatSessionKey: session_key,
    wechatUnionId: unionid
  });
  isNewUser = true;
} else {
  // 更新用户信息
  await student.update({
    wechatNickname: userInfo.nickName,
    wechatAvatar: userInfo.avatarUrl,
    wechatGender: userInfo.gender,
    wechatCountry: userInfo.country,
    wechatProvince: userInfo.province,
    wechatCity: userInfo.city,
    wechatLanguage: userInfo.language,
    wechatSessionKey: session_key
  });
}
```

### 4. 生成 JWT Token

```javascript
const jwt = require('jsonwebtoken');

const token = jwt.sign(
  {
    id: student.id,
    wechatUserId: student.wechatUserId
  },
  'your-secret-key',
  {
    expiresIn: '7d' // 7天过期
  }
);
```

### 5. 返回响应

```javascript
res.json({
  student: {
    id: student.id,
    wechatUserId: student.wechatUserId,
    wechatNickname: student.wechatNickname,
    wechatAvatar: student.wechatAvatar,
    // ... 其他字段
  },
  token: token,
  isNewUser: isNewUser
});
```

## 安全注意事项

1. **AppSecret 保护**
   - ⚠️ AppSecret 必须只在后端使用，永远不要暴露在前端代码中
   - 使用环境变量或配置文件管理敏感信息

2. **Session Key 保护**
   - session_key 用于解密用户敏感数据，必须安全存储
   - 建议加密存储在数据库中

3. **Token 管理**
   - JWT token 应设置合理的过期时间
   - 前端需处理 token 过期的情况（401响应）

4. **数据验证**
   - 验证 signature 确保数据完整性
   - 验证 rawData 和 userInfo 一致性

5. **HTTPS**
   - 生产环境必须使用 HTTPS
   - 微信小程序要求所有网络请求使用 HTTPS

## 测试清单

### 前端测试

- [ ] 点击头像显示登录弹窗
- [ ] 获取用户信息成功
- [ ] 获取登录凭证成功
- [ ] 调用后端接口成功
- [ ] 保存用户信息和token
- [ ] 控制台日志正确输出
- [ ] 登录成功后头像和昵称正确显示

### 后端测试

- [ ] 接收前端请求参数完整
- [ ] 成功调用微信API获取openid
- [ ] 首次登录创建新用户
- [ ] 再次登录更新用户信息
- [ ] 正确生成JWT token
- [ ] 返回数据格式正确

### 集成测试

- [ ] 首次登录完整流程
- [ ] 重复登录流程
- [ ] token过期处理
- [ ] 网络异常处理
- [ ] 用户拒绝授权处理

## 问题排查

### 问题1：后端收不到请求

检查项：
- 确认后端服务已启动
- 检查 `config.js` 中的 `API_BASE_URL` 配置
- 查看网络面板确认请求是否发出
- 检查CORS配置

### 问题2：微信API返回错误

常见错误码：
- `40029`: code无效或已使用
- `40163`: code已被使用
- `-1`: 系统繁忙

解决方法：
- 确保每个code只使用一次
- code有效期只有5分钟，及时使用
- 检查appid和secret是否正确

### 问题3：解密数据失败

检查项：
- session_key是否正确
- iv和encryptedData是否正确传递
- 解密算法是否正确（aes-128-cbc）

### 问题4：token验证失败

检查项：
- token是否正确保存
- 请求头是否正确设置
- token是否过期
- 密钥是否一致

## 下一步扩展

1. **完善用户注册流程**
   - 引导新用户填写更多信息（姓名、年级等）
   - 实现注册页面逻辑

2. **自动登录**
   - 检查本地token有效性
   - 自动刷新token

3. **多端登录同步**
   - 使用unionid实现多应用统一身份
   - 实现账号绑定功能

4. **用户资料管理**
   - 实现用户资料查看和编辑
   - 头像上传功能
   - 个人信息管理

5. **登录统计**
   - 记录登录日志
   - 统计活跃用户
   - 分析用户行为

