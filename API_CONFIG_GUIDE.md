# API 配置说明文档

## 概述

本文档说明如何修改项目中的 API 根路径配置。为了方便部署和环境切换，项目已将所有接口调用的根路径提取到统一的配置文件中。

## 配置文件位置

**主配置文件**: `config.js`

这是项目的全局配置文件，位于项目根目录。

## 如何修改 API 根路径

### 方法一：直接修改配置文件（推荐）

打开 `config.js` 文件，修改 `API_BASE_URL` 的值：

```javascript
const API_BASE_URL = 'http://your-server-address:port';
```

### 示例配置

```javascript
// 本地开发环境
const API_BASE_URL = 'http://localhost:8080';

// 测试环境
const API_BASE_URL = 'http://test-server.example.com';

// 生产环境
const API_BASE_URL = 'https://api.example.com';
```

## 已修改的文件清单

以下文件已经更新为使用配置文件中的 API 根路径：

### 1. 页面文件
- `pages/category/index.js` - 分类页面，获取题目列表

### 2. 工具文件
- `utils/util.js` - 工具函数，获取分类列表
- `utils/Bmob-custom.js` - 自定义 Bmob SDK
- `utils/Bmob-config-extracted.js` - Bmob 配置提取
- `utils/Bmob-1.6.7.beautified.js` - Bmob SDK 美化版
- `utils/Bmob-1.6.7.min.js` - Bmob SDK 压缩版

## 使用方法

在需要使用 API 根路径的文件中，导入配置文件：

### 在页面文件中使用

```javascript
const config = require('../../config.js');

// 使用 API_BASE_URL
wx.request({
  url: `${config.API_BASE_URL}/api/your-endpoint`,
  // ...
});
```

### 在 utils 工具文件中使用

```javascript
const config = require('../config.js');

// 使用 API_BASE_URL
wx.request({
  url: `${config.API_BASE_URL}/api/your-endpoint`,
  // ...
});
```

## 相关 API 端点

项目当前使用的主要 API 端点：

1. **获取分类列表**
   - 路径: `/api/question-section-groups/by-grade/3`
   - 方法: GET
   - 文件: `utils/util.js`

2. **获取题目列表**
   - 路径: `/api/question-section-groups/questions-list/{sectionGroupId}`
   - 方法: GET
   - 文件: `pages/category/index.js`

3. **Bmob SDK 相关接口**
   - 基础路径: 通过 `BmobConfig.host` 配置
   - 各类端点: 参见 `utils/Bmob-config-extracted.js`

## 注意事项

1. **修改配置后需要重新编译**: 修改 `config.js` 后，需要重新编译小程序才能生效。

2. **环境切换**: 建议根据不同环境创建不同的配置文件（如 `config.dev.js`, `config.prod.js`），然后在主配置文件中引用。

3. **安全性**: 不要在配置文件中硬编码敏感信息（如密钥、密码等）。

4. **版本控制**: 如果使用 Git，建议将配置文件加入 `.gitignore`，每个开发者维护自己的本地配置。

## 扩展配置示例

如果需要配置更多环境变量，可以扩展 `config.js`：

```javascript
/**
 * 全局配置文件
 */

// 环境配置
const ENV = 'development'; // 'development' | 'test' | 'production'

// API 根路径配置
const API_BASE_URL_MAP = {
  development: 'http://localhost:8080',
  test: 'http://test-server.example.com',
  production: 'https://api.example.com'
};

const API_BASE_URL = API_BASE_URL_MAP[ENV];

// 其他配置
const APP_CONFIG = {
  timeout: 30000, // 请求超时时间
  retryTimes: 3, // 重试次数
  // 更多配置...
};

module.exports = {
  ENV,
  API_BASE_URL,
  APP_CONFIG
};
```

## 问题排查

### 问题1: 接口请求失败，返回 404
- 检查 `config.js` 中的 `API_BASE_URL` 是否正确
- 确认服务器已启动并可访问
- 检查 API 端点路径是否正确

### 问题2: 修改配置后不生效
- 确认已重新编译小程序
- 清除小程序缓存后重试
- 检查是否有其他地方硬编码了 API 地址

### 问题3: 开发工具报错找不到配置文件
- 检查文件路径是否正确（相对路径）
- 确认 `config.js` 文件已保存

## 更新历史

- **2025-10-13**: 初始版本，提取 API 根路径到配置文件
  - 创建 `config.js` 配置文件
  - 更新所有使用到的页面和工具文件
  - 支持统一修改 API 根路径

