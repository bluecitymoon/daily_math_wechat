# 后端API集成指南

## 概述

本文档描述了微信小程序与后端API的集成实现，用于存储和管理用户信息。

## 集成架构

```
微信小程序
    ↓
用户服务层 (user-service.js)
    ↓
HTTP请求层 (request.js)
    ↓
后端API (localhost:9000)
```

## 核心文件

### 1. 配置文件更新
- **文件**: `config.js`
- **更新内容**: 添加了 `BACKEND_API_URL = 'http://localhost:9000'`

### 2. 用户服务模块
- **文件**: `utils/user-service.js`
- **功能**: 
  - 用户信息的增删改查
  - 微信用户信息同步
  - 后端API调用封装

### 3. 用户页面集成
- **文件**: `pages/my/index.js`
- **更新内容**:
  - 导入用户服务模块
  - 更新登录流程以同步数据到后端
  - 添加 `syncUserToBackend` 方法

### 4. 测试工具
- **文件**: `utils/test-backend-integration.js`
- **功能**: 提供测试用例和curl命令生成

## API端点

### 用户管理
- `GET /api/students/{id}` - 获取用户信息
- `PUT /api/students/{id}` - 更新用户信息
- `POST /api/students` - 创建新用户
- `GET /api/students/search?wechatUserId={id}` - 根据微信ID查找用户

## 数据流程

### 用户登录流程
1. 用户点击登录按钮
2. 调用微信授权获取用户信息
3. 获取本地Bmob用户数据
4. 同步用户信息到后端API
5. 更新本地存储和页面显示

### 数据同步逻辑
```javascript
// 检查是否有token
const token = wx.getStorageSync('token');
if (!token) {
  console.log('没有token，跳过后端同步');
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

// 同步到后端
userService.syncWechatUserInfo(syncData, token);
```

## 示例数据

基于你提供的用户数据示例：

```json
{
  "id": 1500,
  "name": "江映初",
  "gender": "女",
  "birthday": "2025-10-15T11:57:00.000Z",
  "registerDate": "2025-10-14T08:33:00.000Z",
  "updateDate": "2025-10-14T08:35:00.000Z",
  "latestContractEndDate": "2025-10-15T11:58:00.000Z",
  "contactNumber": "17721308697",
  "parentsName": "江李明",
  "wechatUserId": "okD2XwDyDeIfWq1_BnFae4RKmSLI",
  "wechatNickname": "微信用户",
  "wechatAvatar": "https://thirdwx.qlogo.cn/mmopen/vi_32/...",
  "school": {
    "id": 1,
    "name": "上海外国语大学松江附属学校"
  },
  "community": {
    "id": 1500,
    "name": "龙湖好望山"
  },
  "avatarUrl": "https://thirdwx.qlogo.cn/mmopen/vi_32/...",
  "nickName": "微信用户",
  "token": "142b3a24-8db2-4c97-aa2b-fb5ce656a8bd-1500"
}
```

## 手动测试命令

### 获取用户信息
```bash
curl 'http://localhost:9000/api/students/1500' \
  -X 'GET' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzUxMiJ9...' \
  -H 'Content-Type: application/json'
```

### 更新用户信息
```bash
curl 'http://localhost:9000/api/students/1500' \
  -X 'PUT' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzUxMiJ9...' \
  -H 'Content-Type: application/json' \
  --data-raw '{"id":1500,"name":"江映初","gender":"女",...}'
```

## 错误处理

### 网络错误
- 显示"网络请求失败"提示
- 自动重试机制（可扩展）

### 认证错误
- 401错误自动清除token
- 提示用户重新登录

### 同步失败
- 本地数据仍然保存
- 显示"登录成功，但同步信息失败"提示

## 使用说明

### 在微信开发者工具中测试
1. 打开微信开发者工具
2. 在控制台中运行：
```javascript
const testUtils = require('./utils/test-backend-integration.js');
testUtils.testInWechatMiniProgram();
```

### 在Node.js环境中测试
```bash
node utils/test-backend-integration.js
```

## 注意事项

1. **Token管理**: 确保后端返回的token正确存储在本地
2. **网络环境**: 确保后端API服务正在运行在localhost:9000
3. **数据格式**: 确保发送的数据格式与后端API期望的格式一致
4. **错误处理**: 网络请求失败时不应影响用户的正常使用

## 扩展功能

### 可扩展的功能
1. 用户详细资料编辑页面
2. 用户头像上传功能
3. 用户数据缓存机制
4. 离线数据同步
5. 用户数据导出功能

### 性能优化
1. 请求去重
2. 数据缓存
3. 批量操作
4. 分页加载

## 故障排除

### 常见问题
1. **API调用失败**: 检查后端服务是否运行
2. **认证失败**: 检查token是否有效
3. **数据格式错误**: 检查请求数据格式
4. **网络超时**: 增加请求超时时间

### 调试方法
1. 查看控制台日志
2. 使用网络面板查看请求详情
3. 检查后端API日志
4. 使用测试工具验证API
