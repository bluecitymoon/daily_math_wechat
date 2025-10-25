# Bmob-1.6.7.min.js 代码结构分析

## 文件概述
- **原始文件**: `Bmob-1.6.7.min.js` (压缩版本)
- **美化文件**: `Bmob-1.6.7.beautified.js` (已格式化的可读版本)
- **配置提取**: `Bmob-config-extracted.js` (提取的关键配置)

## 主要模块结构

### 1. 模块加载器 (第1-31行)
```javascript
!function(e, t) {
    "object" == typeof exports && "object" == typeof module ? module.exports = t() : 
    "function" == typeof define && define.amd ? define([], t) : 
    "object" == typeof exports ? exports.Bmob = t() : e.Bmob = t()
}("undefined" != typeof self ? self : this, function() {
    // 模块内容
});
```

### 2. 工具函数模块 (第32-120行)
包含各种类型检查函数：
- `isArray()`, `isString()`, `isNumber()`, `isObject()`
- `isFunction()`, `isDate()`, `isFile()`, `isBlob()`
- `isFormData()`, `isArrayBuffer()`, `isURLSearchParams()`

### 3. 错误处理模块 (第121-130行)
```javascript
e.exports = class {
    constructor(e, t) {
        let n = new Error;
        return n.code = e, n.message = t ? `Bmob.Error:{code:${e}, message:${t}}` : `Bmob.Error:{code:${e}, message:${this.errorMsg(e)}}`, n
    }
    errorMsg(e) {
        // 错误消息映射
    }
}
```

### 4. HTTP 请求适配器 (第131-200行)
- 支持多种环境：H5、微信小程序、快应用、Node.js
- 包含请求拦截器和响应拦截器
- 处理请求头和响应数据转换

### 5. 查询构建器 (第201-400行)
```javascript
e.exports = class {
    constructor(e) {
        this.tableName = `${r._config.parameters.QUERY}/${e}`;
        this.className = e;
        // 初始化查询参数
    }
    
    // 查询方法
    equalTo(e, t, n) { /* 等于查询 */ }
    containedIn(e, t) { /* 包含查询 */ }
    limit(e) { /* 限制数量 */ }
    order(...e) { /* 排序 */ }
    find() { /* 执行查询 */ }
    // ... 更多查询方法
}
```

### 6. 用户管理模块 (第401-600行)
```javascript
e.exports = class extends s {
    constructor() {
        super("_User");
    }
    
    // 用户相关方法
    login(e, t) { /* 用户登录 */ }
    register(e) { /* 用户注册 */ }
    auth() { /* 微信授权登录 */ }
    // ... 更多用户方法
}
```

### 7. 文件上传模块 (第601-700行)
支持多种平台的文件上传功能

### 8. 支付模块 (第701-750行)
微信小程序支付相关功能

### 9. WebSocket 模块 (第751-900行)
实时通信功能

### 10. 配置模块 (第901-1050行)
**关键配置部分**：
```javascript
e.exports = {
    host: "http://localhost:8080",  // 已修改为本地服务器
    applicationId: "",
    applicationKey: "",
    applicationMasterKey: "",
    parameters: {
        QUERY: "/1/classes",  // 数据查询端点
        LOGIN: "/1/login",    // 登录端点
        USERS: "/1/users",    // 用户端点
        // ... 更多端点
    },
    version: "1.6.7",
    type: 3  // 3 = 微信小程序环境
}
```

## 关键 API 端点

### questionMenu 相关
- **获取分类列表**: `GET /1/classes/questionMenu`
- **获取分类详情**: `GET /1/classes/questionMenu/{id}`
- **创建分类**: `POST /1/classes/questionMenu`
- **更新分类**: `PUT /1/classes/questionMenu/{id}`
- **删除分类**: `DELETE /1/classes/questionMenu/{id}`

### questions 相关
- **获取题目列表**: `GET /1/classes/questions`
- **根据菜单查询**: `GET /1/classes/questions?where={"menu":"{menuId}"}`
- **创建题目**: `POST /1/classes/questions`
- **更新题目**: `PUT /1/classes/questions/{id}`
- **删除题目**: `DELETE /1/classes/questions/{id}`

## 请求头要求
所有 API 请求都需要包含以下请求头：
```javascript
{
    "Content-Type": "application/json",
    "X-Bmob-SDK-Type": "wechatApp",
    "X-Bmob-Application-Id": "{your_app_id}",
    "X-Bmob-REST-API-Key": "{your_api_key}"
}
```

## 修改说明
- ✅ 已将 `host` 从 `"https://api.bmobcloud.com"` 修改为 `"http://localhost:8080"`
- ✅ 所有相关的 API 端点现在都指向本地服务器
- ✅ 保持了原有的 API 结构和参数格式

## 使用建议
1. 确保本地服务器实现了与 Bmob 兼容的 API 接口
2. 本地服务器需要支持 CORS 跨域请求
3. 建议使用 `Bmob-config-extracted.js` 中的配置来管理 API 端点
4. 可以根据需要进一步自定义配置参数
