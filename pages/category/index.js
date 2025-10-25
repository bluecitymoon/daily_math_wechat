// pages/category/index.js
const config = require('../../config.js');

Page({

  data: {
    cateList:{},
    action:''
  },

  onLoad: function (options) {
    wx.showLoading({
      title: '正在加载',
    })
    this.setData({
        action: options.action
    })
    wx.u.getQuestionMenu().then(res => {
      console.log(res)
      
      // 为每个分类添加模拟的学习数据
      const categoriesWithProgress = res.result.map((item, index) => {
        return {
          ...item,
          // 模拟数据：学习进度
          progress: this.getMockProgress(index),
          // 模拟数据：星级评价 (1-5星)
          stars: this.getMockStars(index),
          // 模拟数据：状态 (not_started, in_progress, completed)
          status: this.getMockStatus(index),
          // 模拟数据：答题统计
          stats: this.getMockStats(index)
        }
      })
      
      this.setData({
        cateList: categoriesWithProgress
      })
      wx.hideLoading()
    })
  },
  
  /**
   * 获取模拟的学习进度 (0-100)
   */
  getMockProgress: function(index) {
    const progressOptions = [0, 35, 60, 85, 100, 20, 95, 50]
    return progressOptions[index % progressOptions.length]
  },
  
  /**
   * 获取模拟的星级评价 (1-5)
   */
  getMockStars: function(index) {
    const starOptions = [0, 3, 4, 5, 5, 2, 4, 3]
    return starOptions[index % starOptions.length]
  },
  
  /**
   * 获取模拟的学习状态
   */
  getMockStatus: function(index) {
    const statusOptions = ['not_started', 'in_progress', 'in_progress', 'completed', 'completed', 'in_progress', 'completed', 'in_progress']
    return statusOptions[index % statusOptions.length]
  },
  
  /**
   * 获取模拟的答题统计
   */
  getMockStats: function(index) {
    const statsOptions = [
      { total: 50, completed: 0, correct: 0, accuracy: 0 },
      { total: 50, completed: 18, correct: 15, accuracy: 83 },
      { total: 45, completed: 27, correct: 23, accuracy: 85 },
      { total: 60, completed: 60, correct: 55, accuracy: 92 },
      { total: 55, completed: 55, correct: 52, accuracy: 95 },
      { total: 40, completed: 8, correct: 5, accuracy: 63 },
      { total: 48, completed: 48, correct: 45, accuracy: 94 },
      { total: 52, completed: 26, correct: 21, accuracy: 81 }
    ]
    return statsOptions[index % statsOptions.length]
  },

  onReady: function () {

  },

  onShow: function () {
    
  },

  goquestion (e){
    var cateid = e.currentTarget.dataset.cateid
    var menu = e.currentTarget.dataset.menu
    
    // 显示加载状态
    wx.showLoading({
      title: '正在加载题目...',
    })
    
    // 调用新的 API 接口获取题目列表
    wx.request({
      url: `${config.API_BASE_URL}/api/question-section-groups/questions-list/${cateid}`,
      method: 'GET',
      header: {
        'content-type': 'application/json'
      },
      success: (res) => {
        console.log('API 响应:', res)
        
        if (res.data && res.data.questions && res.data.questions.length > 0) {
          // 处理题目数据，转换为小程序需要的格式
          const questions = res.data.questions.map((question, index) => {
            // 生成选项字母列表 (A, B, C, D...)
            const s = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
            
            // 处理description中的图片，添加样式使其完整显示
            let processedDescription = question.description || ''
            if (processedDescription) {
              // 给所有img标签添加样式
              processedDescription = processedDescription.replace(
                /<img/g, 
                '<img style="max-width:100%;height:auto;display:block;margin:10px 0;"'
              )
            }
            
            // 处理solution中的图片，添加样式使其完整显示
            let processedSolution = question.solution || ''
            if (processedSolution) {
              // 给所有img标签添加样式
              processedSolution = processedSolution.replace(
                /<img/g, 
                '<img style="max-width:100%;height:auto;display:block;margin:10px 0;"'
              )
            }
            
            // 处理选项数据，转换为小程序模板需要的格式
            const options = question.options ? question.options.map((option, optIndex) => ({
              id: option.id,
              name: s[optIndex], // 使用字母作为选项名称
              imageUrl: option.imageUrl,
              isAnswer: option.isAnswer,
              item: option.name || s[optIndex] // 添加 item 字段用于显示
            })) : []
            
            // 找到所有正确答案
            const correctAnswers = options.filter(option => option.isAnswer)
            const answerArr = correctAnswers.map(option => option.name).sort() // ['A', 'B'] 等，排序保证一致性
            const answer = answerArr.join('') // 'AB' 等
            
            // 根据正确答案数量判断题目类型
            // 如果有多个正确答案，则是多选题(type='2')，否则是单选题(type='1')
            const questionType = correctAnswers.length > 1 ? '2' : '1'
            
            console.log(`题目 ${question.id}: 正确答案数=${correctAnswers.length}, 类型=${questionType}, 答案=${answer}`)
            
            return {
              id: question.id,
              objectId: question.id, // 保持兼容性
              title: processedDescription, // 题目内容，使用处理后的description
              description: processedDescription, // 使用处理后的description
              answer: answer,
              answerArr: answerArr, // 将答案转换为数组 ['A', 'B']
              type: questionType, // 根据答案数量判断类型：1-单选，2-多选
              points: question.points,
              level: question.level,
              options: options,
              choseList: options, // 选项列表，用于模板显示
              questionCategory: question.questionCategory,
              baseGroupId: question.baseGroupId,
              baseGroupTitle: question.baseGroupTitle,
              question_id: question.id, // 题目ID
              // 添加模板需要的字段
              chosenum: undefined, // 用户选择的答案
              subup: undefined, // 提交状态
              selectedOption: undefined, // 单选题选中的选项（提交前）
              moreArr: {
                A: !1, B: !1, C: !1, D: !1, E: !1,
                F: !1, G: !1, H: !1, I: !1, J: !1
              }, // 多选题选择状态
              help: processedSolution, // 帮助信息，使用处理后的solution字段
              helpPicUrl: question.helpPicUrl || '', // 帮助图片
              picUrl: question.imageUrl || question.picUrl || '', // 题目图片
              s: s // 选项字母数组
            }
          })
          
          // 保存题目数据到内存
          wx.setStorageSync(`questions_${cateid}`, {
            questions: questions,
            sectionGroupId: res.data.sectionGroupId,
            sectionGroupTitle: res.data.sectionGroupTitle,
            totalQuestionCount: res.data.totalQuestionCount
          })
          
          console.log('题目数据已保存:', questions)
          
          // 跳转到新的答题页面
          wx.navigateTo({
            url: '../answer/index?cateid='+ cateid +'&menu='+menu,
          })
        } else {
          wx.showToast({
            title: '暂无题目数据',
            icon: 'none'
          })
        }
        
        wx.hideLoading()
      },
      fail: (err) => {
        console.error('获取题目失败:', err)
        wx.hideLoading()
        wx.showToast({
          title: '获取题目失败',
          icon: 'none'
        })
      }
    })
  }
})