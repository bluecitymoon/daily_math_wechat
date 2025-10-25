# API 集成修改总结

## 修改概述
将原有的 Bmob 云服务 API 调用替换为本地 API 服务器调用，并适配新的数据格式。

## 主要修改

### 1. 替换 Bmob 库文件
- **文件**: `app.js`
- **修改**: 将 `require('utils/Bmob-1.6.7.min.js')` 改为 `require('utils/Bmob-custom.js')`
- **说明**: 使用自定义的 Bmob 库，保持 API 兼容性

### 2. 创建自定义 Bmob 库
- **文件**: `utils/Bmob-custom.js`
- **功能**: 
  - 保持与原始 Bmob SDK 的 API 兼容性
  - 支持本地服务器调用
  - 包含 Query、User、Pointer 等核心类

### 3. 修改分类列表 API
- **文件**: `utils/util.js`
- **修改**: `getQuestionMenu()` 函数
- **新 API**: `GET http://localhost:8080/api/question-section-groups/by-grade/3`
- **数据格式**: 返回 `res.data.sectionGroups`

### 4. 修改题目获取逻辑
- **文件**: `pages/category/index.js`
- **修改**: `goquestion()` 函数
- **新 API**: `GET http://localhost:8080/api/question-section-groups/questions-list/{sectionGroupId}`
- **功能**:
  - 调用新 API 获取题目列表
  - 转换数据格式以适配小程序模板
  - 保存题目数据到内存
  - 支持跳转到学习/考试/排名页面

### 5. 更新学习页面数据读取
- **文件**: `pages/learn/index.js`
- **修改**: `onShow()` 函数
- **功能**:
  - 优先读取新格式的题目数据
  - 保持对旧格式的兼容性
  - 正确处理题目显示逻辑

## 新 API 数据格式

### 分类列表响应
```json
{
  "sectionGroups": [
    {
      "id": 1500,
      "title": "找找不同",
      "grade": {
        "id": 3,
        "name": "二年级"
      }
    }
  ]
}
```

### 题目列表响应
```json
{
  "sectionGroupId": 1500,
  "sectionGroupTitle": "找找不同",
  "questions": [
    {
      "id": 1503,
      "description": "<h2>下列选项中，与其他三组不同的是（）</h2>",
      "answer": "[]",
      "type": {
        "id": 2,
        "name": "选择题"
      },
      "options": [
        {
          "id": 1510,
          "name": "A",
          "imageUrl": "http://localhost:8080/api/files/view?filePath=...",
          "isAnswer": false
        }
      ]
    }
  ],
  "totalQuestionCount": 2
}
```

## 数据转换逻辑

### 题目数据转换
新 API 返回的题目数据会被转换为小程序模板需要的格式：

```javascript
{
  id: question.id,
  objectId: question.id,
  title: question.description,
  answer: correctAnswer.name,
  answerArr: answer.split(''),
  type: question.type.id.toString(),
  choseList: options, // 选项列表
  s: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], // 选项字母
  chosenum: undefined, // 用户选择
  subup: undefined, // 提交状态
  moreArr: {}, // 多选题状态
  // ... 其他字段
}
```

## 存储格式

### 新格式
- **键**: `questions_{sectionGroupId}`
- **值**: 
```javascript
{
  questions: [...], // 题目数组
  sectionGroupId: 1500,
  sectionGroupTitle: "找找不同",
  totalQuestionCount: 2
}
```

### 兼容性
- 保持对旧存储格式的兼容性
- 优先使用新格式数据
- 如果新格式不存在，回退到旧格式

## 测试建议

1. **API 连通性测试**
   - 确保本地服务器在 `http://localhost:8080` 运行
   - 测试分类列表 API 是否正常返回数据
   - 测试题目列表 API 是否正常返回数据

2. **数据格式测试**
   - 验证题目数据转换是否正确
   - 检查选项显示是否正常
   - 确认答案判断逻辑是否正确

3. **页面功能测试**
   - 测试分类页面跳转是否正常
   - 验证学习页面题目显示
   - 检查答题功能是否正常

## 注意事项

1. **图片 URL 处理**
   - 新 API 返回的图片 URL 是完整路径
   - 确保图片服务器可访问

2. **HTML 内容处理**
   - 题目描述可能包含 HTML 标签
   - 需要在小程序中正确渲染

3. **错误处理**
   - 添加了 API 调用失败的错误处理
   - 显示用户友好的错误提示

4. **性能优化**
   - 题目数据缓存在本地存储中
   - 避免重复 API 调用

## 回滚方案

如果需要回滚到原始 Bmob 服务：
1. 将 `app.js` 中的引用改回 `Bmob-1.6.7.min.js`
2. 恢复 `util.js` 中的原始 `getQuestionMenu` 函数
3. 恢复 `pages/category/index.js` 中的原始 `goquestion` 函数
4. 恢复 `pages/learn/index.js` 中的原始数据读取逻辑
