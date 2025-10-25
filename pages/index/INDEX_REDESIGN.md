# Index 首页重新设计说明文档

## 设计概览

首页已经过全新设计，重点突出答题功能，提供更丰富的学习数据展示。

## 🎯 设计目标

1. **更侧重答题** - 将答题作为首页的核心功能
2. **信息丰富** - 显示学习进度、排名信息、今日数据等
3. **简化交互** - 合并登录和个人中心入口
4. **数据可视化** - 通过进度条、卡片等方式直观展示数据

## ✨ 主要改进

### 1. 顶部栏优化
**之前**：大卡片显示用户信息，占用大量空间  
**现在**：
- 🎨 紧凑的顶部栏，带渐变色背景
- 👤 小头像按钮（点击进入个人中心或登录）
- 📱 应用标题和口号
- 💚 统一使用主色调 `#1bd0ad`

### 2. 答题进度卡片（主要功能）
全新的进度展示卡片，包含：
- 📊 **进度条**：直观显示总体完成度
- 🔢 **三大统计**：
  - 已完成题数
  - 待完成题数（高亮显示）
  - 总题数
- 🚀 **开始答题按钮**：醒目的渐变色按钮，带点击效果

### 3. 排名信息卡片（新增）
详细的排名信息展示：
- 🏆 **当前排名**：大字号显示排名
- 📈 **关键数据**：正确率、总得分
- 💡 **超越提示**：显示"再答对X题即可超越第Y位"
- ⭐ **特殊提示**：前三名显示鼓励信息

### 4. 功能按钮区域（简化）
**之前**：4个按钮（练习、答题、错题、排名）  
**现在**：2个功能卡片
- 📝 **错题集**：显示错题数量
- 📚 **章节练习**：分类学习入口
- ❌ **移除**：独立的练习按钮（功能合并）

### 5. 今日数据卡片（新增）
展示学习动态：
- 📅 今日日期
- ✅ 今日答题数
- ✔️ 今日答对数
- 🔥 连续学习天数

## 📱 页面布局

```
┌─────────────────────────────────┐
│  智能答题系统        👤         │  <- 顶部栏（渐变色）
│  每天进步一点点                  │
└─────────────────────────────────┘
   ┌───────────────────────────┐
   │ 📊 学习进度      68%      │
   │ ▓▓▓▓▓▓▓▓░░░░░░░░░         │
   │ 136    64    200          │  <- 答题进度卡片
   │ 已完成  待完成  总题数     │
   │ [   开始答题 →   ]        │
   └───────────────────────────┘
   
   ┌───────────────────────────┐
   │ 🏆 我的排名   查看榜单 ›  │
   │                            │
   │    当前排名    92%  1240  │  <- 排名信息卡片
   │      8       正确率 总得分 │
   │                            │
   │ 💡 再答对5题可超越第7位   │
   └───────────────────────────┘
   
   ┌─────────┐  ┌─────────┐
   │ 📝 错题集│  │📚 章节练习│  <- 功能按钮
   │   12题  │  │ 分类学习  │
   └─────────┘  └─────────┘
   
   ┌───────────────────────────┐
   │ 今日数据      10月13日    │
   │  25      22       7       │  <- 今日数据
   │ 今日答题 今日正确 连续天数 │
   └───────────────────────────┘
```

## 🎨 视觉设计

### 颜色方案
- **主色调**：`#1bd0ad` (青绿色)
- **背景色**：`#f1f1f1` (浅灰色)
- **卡片背景**：`#ffffff` (白色)
- **强调色**：`#ff6b6b` (红色，用于待完成题数)
- **成功色**：`#00b894` (绿色，用于正确率)
- **警告色**：`#feca57` (黄色，用于超越提示)

### 卡片设计
- **圆角**：24rpx (大圆角)
- **阴影**：0 4rpx 20rpx rgba(0, 0, 0, 0.08)
- **间距**：24rpx
- **内边距**：32rpx

### 字体规范
- **大标题**：44rpx, bold
- **卡片标题**：32rpx, 600
- **数值**：40rpx - 64rpx, bold
- **标签**：24-26rpx, normal
- **按钮文字**：32rpx, 600

## 📊 模拟数据结构

```javascript
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
```

## 🔄 API 对接指南

### 需要的后端接口

#### 1. 获取学习进度
```
GET /api/user/progress
```

响应示例：
```json
{
  "progress": 68,
  "completedQuestions": 136,
  "pendingQuestions": 64,
  "totalQuestions": 200
}
```

#### 2. 获取排名信息
```
GET /api/user/rank
```

响应示例：
```json
{
  "currentRank": 8,
  "nextRank": 7,
  "questionsToSurpass": 5,
  "accuracy": 92,
  "totalScore": 1240
}
```

#### 3. 获取今日统计
```
GET /api/user/today-stats
```

响应示例：
```json
{
  "todayAnswered": 25,
  "todayCorrect": 22,
  "continuousDays": 7
}
```

#### 4. 获取错题数量
```
GET /api/user/wrong-questions/count
```

响应示例：
```json
{
  "wrongQuestions": 12
}
```

### 代码对接示例

在 `index.js` 中添加以下方法：

```javascript
/**
 * 加载用户学习进度
 */
loadUserProgress() {
  const config = require('../../config.js');
  wx.request({
    url: `${config.API_BASE_URL}/api/user/progress`,
    method: 'GET',
    success: (res) => {
      if (res.data) {
        this.setData({
          'mockData.progress': res.data.progress,
          'mockData.completedQuestions': res.data.completedQuestions,
          'mockData.pendingQuestions': res.data.pendingQuestions,
          'mockData.totalQuestions': res.data.totalQuestions
        })
      }
    }
  })
},

/**
 * 加载排名信息
 */
loadRankInfo() {
  const config = require('../../config.js');
  wx.request({
    url: `${config.API_BASE_URL}/api/user/rank`,
    method: 'GET',
    success: (res) => {
      if (res.data) {
        this.setData({
          'mockData.currentRank': res.data.currentRank,
          'mockData.nextRank': res.data.nextRank,
          'mockData.questionsToSurpass': res.data.questionsToSurpass,
          'mockData.accuracy': res.data.accuracy,
          'mockData.totalScore': res.data.totalScore
        })
      }
    }
  })
},

/**
 * 加载今日统计
 */
loadTodayStats() {
  const config = require('../../config.js');
  wx.request({
    url: `${config.API_BASE_URL}/api/user/today-stats`,
    method: 'GET',
    success: (res) => {
      if (res.data) {
        this.setData({
          'mockData.todayAnswered': res.data.todayAnswered,
          'mockData.todayCorrect': res.data.todayCorrect,
          'mockData.continuousDays': res.data.continuousDays
        })
      }
    }
  })
}
```

然后在 `onLoad` 中调用：
```javascript
onLoad: function() {
  // ... 现有代码 ...
  
  // 加载真实数据
  this.loadUserProgress();
  this.loadRankInfo();
  this.loadTodayStats();
}
```

## 💡 交互说明

### 1. 用户头像点击
- **已登录**：跳转到个人中心页面
- **未登录**：弹出登录弹窗

### 2. 开始答题按钮
- 点击跳转到分类选择页面（答题模式）
- 带缩放动画反馈

### 3. 查看榜单链接
- 跳转到排名页面查看完整榜单

### 4. 功能卡片
- 错题集：跳转到错题页面
- 章节练习：跳转到分类选择页面

### 5. 特殊状态显示
- 前三名显示"您已进入前三名！继续加油！"
- 有可超越目标时显示超越提示
- 无待完成题目时可调整显示

## 🎯 功能对比

| 功能 | 之前 | 现在 |
|------|------|------|
| 用户信息展示 | 大卡片，占用空间 | 小头像，节省空间 |
| 练习按钮 | 独立按钮 | ❌ 已移除 |
| 答题按钮 | 普通按钮 | ✅ 主要功能卡片 |
| 学习进度 | ❌ 无 | ✅ 详细进度卡片 |
| 排名信息 | 只有入口 | ✅ 详细排名卡片 |
| 今日数据 | ❌ 无 | ✅ 今日数据卡片 |
| 待完成提示 | ❌ 无 | ✅ 显示待完成题数 |
| 超越提示 | ❌ 无 | ✅ 智能超越建议 |

## 📱 响应式设计

- 使用 rpx 单位确保不同设备适配
- 卡片自适应宽度
- 文字大小适中，易于阅读
- 按钮区域足够大，便于点击

## 🚀 性能优化

- 卡片使用条件渲染减少DOM
- 动画使用 CSS transition
- 合理使用 flex 布局
- 避免过度嵌套

## ⚠️ 注意事项

1. **图片资源**：确保以下图片存在
   - `/images/header.png` - 默认头像
   - `/images/icon_monikaoshi@3x.png` - 答题图标
   - `/images/icon_monichnegji@3x.png` - 排名图标
   - `/images/icon_cuotishoucang@3x.png` - 错题图标
   - `/images/icon_zhangjielianxi@3x.png` - 练习图标
   - `/images/jkt/rank-01.png` - 排名小图标
   - `/images/jkt/success.png` - 成功图标

2. **模拟数据**：当前使用模拟数据，实际使用需要对接API

3. **用户登录状态**：确保正确处理登录和未登录状态

## 🔮 未来优化建议

1. **下拉刷新**：支持下拉刷新数据
2. **骨架屏**：加载时显示骨架屏
3. **动画效果**：添加数字动画（如进度条增长动画）
4. **个性化推荐**：根据学习情况推荐题目
5. **成就系统**：添加勋章、成就展示
6. **学习曲线**：添加学习趋势图表
7. **社交功能**：添加好友排名对比

## 📝 更新日志

- **2025-10-13**: 完成首页重新设计
  - 优化顶部栏，合并登录入口
  - 新增答题进度卡片
  - 新增排名信息卡片
  - 新增今日数据卡片
  - 简化功能按钮
  - 移除练习按钮
  - 使用模拟数据展示

## 📚 相关文档

- [API配置指南](../../API_CONFIG_GUIDE.md)
- [分类页面设计](../category/README.md)

---

**说明**：本次重新设计将首页从功能导航页转变为数据中心页，更好地展示学习状态和激励学习。

