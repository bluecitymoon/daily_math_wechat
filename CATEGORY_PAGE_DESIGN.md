# Category 页面重新设计说明文档

## 设计概览

Category 页面已经过全新设计，采用现代化的卡片式布局，提供更丰富的学习信息展示。

## 新增功能特性

### 1. 视觉改进
- ✨ **渐变背景**: 采用紫色渐变背景，提升视觉效果
- 📱 **卡片式设计**: 每个分类使用独立卡片展示，带阴影和圆角
- 🎨 **彩色编号**: 每个分类都有渐变色编号标识
- 🌈 **状态颜色**: 不同状态使用不同的渐变色标识

### 2. 学习状态展示

#### 状态类型
- **未开始** (not_started): 灰色徽章，表示尚未开始学习
- **进行中** (in_progress): 橙黄色渐变徽章，表示正在学习
- **已通关** (completed): 绿色渐变徽章，表示已完成所有题目

### 3. 进度展示
- 📊 **进度条**: 直观显示学习完成度 (0-100%)
- 🎯 **百分比**: 在进度条右侧显示具体百分比

### 4. 答题统计
- **已完成**: 显示 "X/总题数" 格式
- **正确率**: 显示答题正确率百分比
  - 正确率 ≥ 80% 显示为绿色，鼓励学习
  - 正确率 < 80% 显示为普通颜色
- **空状态**: 未开始时显示 "开始学习吧！"

### 5. 星级评价系统
- ⭐ **1-5星**: 根据学习表现显示星级
- 评价标准（待接口提供具体算法）:
  - 5星: 优秀 (正确率 ≥ 95%)
  - 4星: 良好 (正确率 ≥ 85%)
  - 3星: 中等 (正确率 ≥ 70%)
  - 2星: 需提高 (正确率 ≥ 60%)
  - 1星: 需加强 (正确率 < 60%)
  - 0星: 未开始或未完成

### 6. 字体和间距优化
- **标题字体**: 32rpx，加粗
- **副标题**: 24rpx
- **统计数字**: 32rpx，加粗
- **卡片间距**: 24rpx
- **内边距**: 32rpx

## 当前模拟数据

### 数据结构

```javascript
{
  id: "分类ID",
  title: "分类标题",
  
  // 新增字段（模拟数据）
  progress: 85,           // 学习进度 0-100
  stars: 4,               // 星级评价 0-5
  status: "in_progress",  // 状态: not_started | in_progress | completed
  
  // 答题统计
  stats: {
    total: 50,            // 总题数
    completed: 42,        // 已完成题数
    correct: 38,          // 答对题数
    accuracy: 90          // 正确率百分比
  }
}
```

### 模拟数据生成逻辑

文件: `pages/category/index.js`

#### 方法说明

1. **getMockProgress(index)**: 生成进度数据
   - 返回: 0, 35, 60, 85, 100, 20, 95, 50 (循环)

2. **getMockStars(index)**: 生成星级数据
   - 返回: 0, 3, 4, 5, 5, 2, 4, 3 (循环)

3. **getMockStatus(index)**: 生成状态数据
   - 返回: not_started, in_progress, completed (循环)

4. **getMockStats(index)**: 生成统计数据
   - 返回各种答题情况的统计对象

## API 对接指南

### 需要后端提供的数据结构

当后端 API 准备好后，需要在分类列表接口中添加以下字段：

```json
{
  "sectionGroups": [
    {
      "id": "分类ID",
      "title": "分类标题",
      "questionCount": 50,
      
      // 需要新增的字段
      "studentProgress": {
        "progress": 85,           // 学习进度百分比
        "stars": 4,               // 星级评价
        "status": "in_progress",  // 学习状态
        "statistics": {
          "totalQuestions": 50,   // 总题数
          "completedQuestions": 42, // 已完成题数
          "correctAnswers": 38,   // 答对题数
          "accuracy": 90          // 正确率
        }
      }
    }
  ]
}
```

### 修改代码对接真实数据

在 `pages/category/index.js` 中，修改 `onLoad` 方法：

```javascript
onLoad: function (options) {
  wx.showLoading({
    title: '正在加载',
  })
  this.setData({
      action: options.action
  })
  wx.u.getQuestionMenu().then(res => {
    console.log(res)
    
    // 使用真实 API 数据（替换模拟数据）
    const categoriesWithProgress = res.result.map((item, index) => {
      // 如果 API 返回了学生进度数据
      if (item.studentProgress) {
        return {
          ...item,
          progress: item.studentProgress.progress,
          stars: item.studentProgress.stars,
          status: item.studentProgress.status,
          stats: {
            total: item.studentProgress.statistics.totalQuestions,
            completed: item.studentProgress.statistics.completedQuestions,
            correct: item.studentProgress.statistics.correctAnswers,
            accuracy: item.studentProgress.statistics.accuracy
          }
        }
      } else {
        // 如果没有进度数据，使用默认值
        return {
          ...item,
          progress: 0,
          stars: 0,
          status: 'not_started',
          stats: {
            total: item.questionCount || 0,
            completed: 0,
            correct: 0,
            accuracy: 0
          }
        }
      }
    })
    
    this.setData({
      cateList: categoriesWithProgress
    })
    wx.hideLoading()
  })
}
```

### 后端计算逻辑建议

#### 1. 进度计算
```
progress = (completedQuestions / totalQuestions) * 100
```

#### 2. 状态判断
```
if (completedQuestions === 0) {
  status = "not_started"
} else if (completedQuestions < totalQuestions) {
  status = "in_progress"
} else {
  status = "completed"
}
```

#### 3. 星级评价
```
if (status !== "completed") {
  stars = 0
} else {
  if (accuracy >= 95) stars = 5
  else if (accuracy >= 85) stars = 4
  else if (accuracy >= 70) stars = 3
  else if (accuracy >= 60) stars = 2
  else stars = 1
}
```

#### 4. 正确率计算
```
accuracy = (correctAnswers / completedQuestions) * 100
```

## 待删除的模拟数据方法

当接入真实 API 后，可以删除以下方法：
- `getMockProgress()`
- `getMockStars()`
- `getMockStatus()`
- `getMockStats()`

## 视觉效果说明

### 颜色方案

#### 主色调
- 背景渐变: `#667eea` → `#764ba2`
- 进行中卡片: 紫色渐变
- 已完成卡片: 绿色渐变 `#43e97b` → `#38f9d7`

#### 状态颜色
- 未开始: `#dfe6e9` (灰色)
- 进行中: `#fa9d1c` → `#feca57` (橙黄渐变)
- 已完成: `#43e97b` → `#38f9d7` (绿色渐变)

#### 文字颜色
- 主标题: `#2d3436`
- 副标题: `#636e72`
- 高正确率: `#00b894` (绿色)

### 交互效果
- **点击反馈**: 卡片按下时缩小到 98%
- **过渡动画**: 所有状态变化都有平滑过渡
- **视觉层次**: 使用阴影和圆角营造层次感

## 响应式设计

- 使用 rpx 单位确保不同设备适配
- 卡片自适应宽度
- 文字自动换行，防止溢出

## 性能优化

- 使用条件渲染 (`wx:if`) 减少不必要的DOM
- 合理使用 `wx:key` 提升列表渲染性能
- CSS 动画使用 transform 而非 width/height

## 维护建议

1. 定期更新星级评价算法，确保公平性
2. 根据用户反馈调整进度显示方式
3. 可以添加动画效果增强用户体验
4. 考虑添加骨架屏优化加载体验

## 更新日志

- **2025-10-13**: 完成页面重新设计
  - 新增卡片式布局
  - 添加学习状态、进度、统计信息
  - 实现星级评价系统
  - 优化字体大小和视觉层次
  - 使用模拟数据展示功能

