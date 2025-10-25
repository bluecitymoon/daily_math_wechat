// pages/answer/index.js
const request = require('../../utils/request.js');

Page({

  data: {
    iconInd: !1,
    scrolltop: '',
    questionList: [],
    showQuestionList: [],
    index: 0,
    s: ['A', 'B', 'C', 'D', 'E', 'F','G','H','I','J'],
    current: 0,
    rightNum: 0,
    errNum: 0,
    indexInd: 0,
    xiejie: !0,
    interval: 800,
    moreArr: {
      A: !1,
      B: !1,
      C: !1,
      D: !1,
      E: !1,
      F: !1,
      G: !1,
      H: !1,
      I: !1,
      J: !1
    },
    objQuestionId:[],
    arrQuestionId: [],
    arrcheckQuestion:{},
    sectionGroupTitle: '',
    totalQuestionCount: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log('answer page onLoad, options:', options)
    this.setData({
      cateid: options.cateid,
      menu: options.menu,
      s: this.data.s,
      objQuestionId:this.data.objQuestionId,
      arrcheckQuestion: this.data.arrcheckQuestion
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  onUnload: function() {
    // 可选：保存答题进度
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    var that = this
    wx.showLoading({
      title: '正在加载',
    })
    
    // 从 storage 中读取题目数据
    var storageData = wx.getStorageSync(`questions_${this.data.cateid}`)
    var showQuestionList = []
    
    console.log('从 storage 读取的数据:', storageData)
    
    if (storageData && storageData.questions && storageData.questions.length > 0) {
      console.log('使用新的题目数据格式:', storageData)
      
      const questions = storageData.questions
      var objQuestionId = []
      var arrcheckQuestion = {}
      
      // 处理题目数据
      questions.forEach((question, index) => {
        question.id = index // 重新设置索引
        
        // 初始化字段
        question.selectedOption = undefined // 单选题选择的选项
        
        // 初始化 moreArr 如果是多选题
        if (question.type == '2') {
          question.moreArr = {
            A: !1,
            B: !1,
            C: !1,
            D: !1,
            E: !1,
            F: !1,
            G: !1,
            H: !1,
            I: !1,
            J: !1
          }
        }
        
        var questionId = question.objectId || question.id
        var checkQuestion = {'check': null}
        objQuestionId.push(questionId)
        arrcheckQuestion[questionId] = checkQuestion
      })
      
      // 设置显示的前3个题目
      if (questions.length >= 3) {
        showQuestionList = [questions[0], questions[1], questions[2]]
      } else if (questions.length == 2) {
        showQuestionList = [questions[0], questions[1]]
      } else if (questions.length == 1) {
        showQuestionList = [questions[0]]
      }
      
      that.setData({
        questionList: questions,
        showQuestionList: showQuestionList,
        objQuestionId: objQuestionId,
        arrcheckQuestion: arrcheckQuestion,
        sectionGroupTitle: storageData.sectionGroupTitle || '',
        totalQuestionCount: storageData.totalQuestionCount || questions.length
      })
      
      console.log('题目数据加载完成，共', questions.length, '道题')
      
      // 批量检查答题记录并自动填充答案
      that.loadAnswerRecords(questions).then(() => {
        setTimeout(function () {
          wx.hideLoading()
        }, 500)
      }).catch(err => {
        console.log('加载答题记录失败:', err)
        setTimeout(function () {
          wx.hideLoading()
        }, 500)
      })
      
    } else {
      wx.hideLoading()
      wx.showModal({
        title: '提示',
        content: '未找到题目数据，请返回重新选择',
        showCancel: false,
        success: function(res) {
          if (res.confirm) {
            wx.navigateBack()
          }
        }
      })
    }
  },

  _updown: function() {
    var i = 0
    var t = this
    this.setData({
      iconInd: !this.data.iconInd,
      iconIndtwo: !this.data.iconIndtwo,
      videoctrl: !this.data.videoctrl
    }), setTimeout(function() {
      i < 2 || t.setData({
        scrolltop: i[i - 2]
      });
    }, 0);
  },

  scrolltop: function(t) {},
  touchstart: function(t) {},
  bindtouchmove: function(t) {},
  bindtouchend: function(t) {},

  autoPlay: function() {
    this.setData({
      autoplay: !0
    });
  },

  /**
   * 下一题按钮点击事件
   */
  nextQuestion: function() {
    var that = this
    var currentIndex = that.data.indexInd
    var totalQuestions = that.data.questionList.length
    
    console.log('点击下一题，当前题目:', currentIndex + 1, '总题数:', totalQuestions)
    
    // 检查是否还有下一题
    if (currentIndex >= totalQuestions - 1) {
      wx.showToast({
        title: '已经是最后一题了',
        icon: 'none',
        duration: 2000
      })
      return
    }
    
    // 切换到下一题
    this.autoPlay()
  },

  pageChange: function(t) {
    console.log('pageChange:', t.detail)
    "autoplay" == t.detail.source && this.setData({
      autoplay: !1
    });
    
    var a = this;
    
    // 获取当前题目的状态，如果已答题则保持原有状态
    var currentQuestion = this.data.questionList[this.data.indexInd]
    var shouldResetMoreArr = true
    
    if (currentQuestion && currentQuestion.subup === '1' && currentQuestion.type == '2') {
      // 如果当前题目是多选题且已答题，保持原有状态
      shouldResetMoreArr = false
    }
    
    if (shouldResetMoreArr) {
      a.setData({
        moreArr: {
          A: !1,
          B: !1,
          C: !1,
          D: !1,
          E: !1,
          F: !1,
          G: !1,
          H: !1,
          I: !1,
          J: !1
        },
      })
    }
    
    a.setData({
      xiejie: !0
    });
    
    var e = this.data.current,
      r = t.detail.current,
      n = a.data.indexInd,
      i = 1 * r - 1 * e,
      d = this.data.questionList;
    
    if (-2 == i ? i = 1 : 2 == i && (i = -1), (n += i) >= d.length) {
      n = 0
      a.finish()
      a.setData({
        xiejie: !1,
        current: 2
      });
      return;
    }
    
    if (n < 0) {
      wx.showToast({
        title: "已经是第一题了"
      })
      a.setData({
        xiejie: !1,
        current: 0
      })
      n = d.length - 1;
      return;
    }
    
    console.log("last:", e, "current:", r, "index:", n)
    var o = [];
    
    if (0 == r) {
      o.push(d[n])
      o.push(d[n + 1])
      o.push(d[n - 1])
      o[1] || (o[1] = d[0])
      o[2] || (o[2] = d[d.length - 1])
    } else if (1 == r) {
      o.push(d[n - 1])
      o.push(d[n])
      o.push(d[n + 1])
      o[2] || (o[2] = d[0])
      o[0] || (o[0] = d[d.length - 1])
    } else if (2 == r) {
      o.push(d[n + 1])
      o.push(d[n - 1])
      o.push(d[n])
      o[0] || (o[0] = d[0])
      o[1] || (o[1] = d[d.length - 1])
    }
    
    console.log('showQuestionList:', o)
    
    // 如果切换到已答题的题目，恢复其状态
    var targetQuestion = d[n]
    if (targetQuestion && targetQuestion.subup === '1') {
      if (targetQuestion.type == '1') {
        // 单选题：恢复selectedOption
        console.log('恢复单选题答案:', targetQuestion.selectedOption)
      } else if (targetQuestion.type == '2') {
        // 多选题：恢复moreArr状态
        console.log('恢复多选题答案:', targetQuestion.moreArr)
        a.setData({
          moreArr: targetQuestion.moreArr
        })
      }
    }
    
    this.setData({
      showQuestionList: o,
      indexInd: n,
      current: r
    })
  },

  /**
   * 单选题选择选项（不立即验证）
   */
  selectSingleAnswer: function(t) {
    var that = this
    var index = t.currentTarget.dataset.index //第几道题目
    var chosenum = t.currentTarget.dataset.chosenum //选中的答案
    var questionList = this.data.questionList //题目集
    var showQuestionList = this.data.showQuestionList
    
    // 记录用户选择的选项
    questionList[index].selectedOption = chosenum
    
    this.setData({
      questionList: questionList,
      showQuestionList: showQuestionList
    })
    
    console.log('单选题选择:', chosenum)
  },

  /**
   * 批量加载答题记录并自动填充答案
   */
  loadAnswerRecords: function(questions) {
    var that = this
    var promises = []
    
    console.log('开始批量加载答题记录，题目数量:', questions.length)
    
    // 为每道题创建检查答题记录的Promise
    questions.forEach((question, index) => {
      var questionId = question.objectId || question.id
      var promise = that.checkAnswerRecord(questionId).then(answerRecord => {
        if (answerRecord.isAnswered) {
          console.log(`题目 ${index + 1} 已有答题记录:`, answerRecord)
          
          // 自动填充答案
          that.autoFillAnswer(question, answerRecord, index)
          
          // 更新答题状态
          question.subup = '1'
          question.judge = answerRecord.correct === 1
          
          // 更新统计
          if (answerRecord.correct === 1) {
            that.setData({
              rightNum: that.data.rightNum + 1
            })
          } else {
            that.setData({
              errNum: that.data.errNum + 1
            })
            // 保存错题
            that.saveError(questionId)
          }
        }
        return answerRecord
      }).catch(err => {
        console.log(`题目 ${index + 1} 答题记录查询失败:`, err)
        return null
      })
      
      promises.push(promise)
    })
    
    // 等待所有Promise完成
    return Promise.all(promises).then(results => {
      console.log('所有答题记录加载完成')
      
      // 更新题目列表和显示列表
      that.setData({
        questionList: questions,
        showQuestionList: that.data.showQuestionList
      })
      
      return results
    })
  },

  /**
   * 自动填充学生答案
   */
  autoFillAnswer: function(question, answerRecord, questionIndex) {
    var that = this
    var answer = answerRecord.answer
    var isCorrect = answerRecord.correct === 1
    
    console.log(`题目 ${questionIndex + 1} 自动填充答案:`, answer, '是否正确:', isCorrect)
    
    if (question.type == '1') {
      // 单选题：设置selectedOption
      question.selectedOption = answer
      question.chosenum = answer
    } else if (question.type == '2') {
      // 多选题：解析答案并设置moreArr
      var answerArray = answer.split(',')
      var moreArr = {
        A: false, B: false, C: false, D: false, E: false,
        F: false, G: false, H: false, I: false, J: false
      }
      
      // 根据答案设置对应的选项为true
      answerArray.forEach(option => {
        if (option.trim() && moreArr.hasOwnProperty(option.trim())) {
          moreArr[option.trim()] = true
        }
      })
      
      question.moreArr = moreArr
      question.chosenum = moreArr
    }
    
    // 更新arrcheckQuestion
    var questionId = question.objectId || question.id
    that.data.arrcheckQuestion[questionId] = isCorrect
    
    console.log(`题目 ${questionIndex + 1} 答案填充完成`)
  },

  /**
   * 检查学生答题记录
   */
  checkAnswerRecord: function(questionId) {
    var that = this
    return request.checkStudentAnswerLog(questionId).then(res => {
      console.log('答题记录查询结果:', res)
      return res
    }).catch(err => {
      console.log('未找到答题记录或查询失败:', err)
      // 如果查询失败，返回未答题状态
      return {
        isAnswered: false,
        answer: null,
        correct: 0
      }
    })
  },

  /**
   * 提交答案到后端API
   */
  submitAnswerToAPI: function(questionId, answer) {
    var that = this
    return request.post('/api/answer', {
      answer: answer,
      questionId: questionId
    }, {
      showLoading: true,
      loadingText: '提交中...'
    }).then(res => {
      console.log('答案提交成功:', res)
      return res
    }).catch(err => {
      console.error('答案提交失败:', err)
      wx.showToast({
        title: '提交失败，请重试',
        icon: 'none',
        duration: 2000
      })
      throw err
    })
  },

  /**
   * 单选题提交
   */
  singleSelectSub: function(t) {
    var that = this
    var questionList = that.data.questionList
    var showQuestionList = that.data.showQuestionList
    var selectedOption = questionList[that.data.indexInd].selectedOption
    var questionId = questionList[that.data.indexInd].objectId || questionList[that.data.indexInd].id
    var arrcheckQuestion = this.data.arrcheckQuestion
    
    // 检查是否已选择选项
    if (!selectedOption) {
      wx.showToast({
        title: '请选择一个选项',
        icon: 'none',
        duration: 2000
      })
      return
    }
    
    console.log('单选题提交 - 用户选择:', selectedOption, '题目ID:', questionId)
    
    // 先检查是否已经答过这道题
    that.checkAnswerRecord(questionId).then(answerRecord => {
      console.log('答题记录检查结果:', answerRecord)
      
      if (answerRecord.isAnswered) {
        // 已经答过，显示之前的答题结果
        var isCorrect = answerRecord.correct === 1
        var previousAnswer = answerRecord.answer
        
        questionList[that.data.indexInd].subup = '1'
        questionList[that.data.indexInd].chosenum = previousAnswer
        questionList[that.data.indexInd].judge = isCorrect
        arrcheckQuestion[questionId] = isCorrect
        
        that.setData({
          questionList: questionList,
          showQuestionList: showQuestionList,
          arrcheckQuestion: arrcheckQuestion
        })
        
        wx.showModal({
          title: '提示',
          content: `您已经回答过这道题了，之前的答案是：${previousAnswer}，结果：${isCorrect ? '正确' : '错误'}`,
          showCancel: false,
          confirmText: '知道了'
        })
        return
      }
      
      // 没有答过，继续提交答案
      // 标记为已提交
      questionList[that.data.indexInd].subup = '1'
      questionList[that.data.indexInd].chosenum = selectedOption
      
      // 提交到后端API
      that.submitAnswerToAPI(questionId, selectedOption).then(res => {
        // API返回结果处理
        var isCorrect = res.correct || false
        
        questionList[that.data.indexInd].judge = isCorrect
        arrcheckQuestion[questionId] = isCorrect
        
        if (isCorrect) {
          this.setData({
            questionList: questionList,
            showQuestionList: showQuestionList,
            rightNum: this.data.rightNum + 1,
            arrcheckQuestion: arrcheckQuestion
          })
          
          wx.showToast({
            title: '回答正确！',
            icon: 'success',
            duration: 1500
          })
        } else {
          this.saveError(questionId)
          
          this.setData({
            questionList: questionList,
            showQuestionList: showQuestionList,
            errNum: this.data.errNum + 1,
            arrcheckQuestion: arrcheckQuestion
          })
          
          wx.showToast({
            title: '回答错误',
            icon: 'none',
            duration: 1500
          })
        }
      }).catch(err => {
        // API调用失败，回退到本地验证
        console.log('API调用失败，使用本地验证')
        var answer = questionList[that.data.indexInd].answer
        
        if (answer == selectedOption) {
          questionList[that.data.indexInd].judge = true
          arrcheckQuestion[questionId] = true
          
          this.setData({
            questionList: questionList,
            showQuestionList: showQuestionList,
            rightNum: this.data.rightNum + 1,
            arrcheckQuestion: arrcheckQuestion
          })
          
          wx.showToast({
            title: '回答正确！',
            icon: 'success',
            duration: 1500
          })
        } else {
          questionList[that.data.indexInd].judge = false
          arrcheckQuestion[questionId] = false
          this.saveError(questionId)
          
          this.setData({
            questionList: questionList,
            showQuestionList: showQuestionList,
            errNum: this.data.errNum + 1,
            arrcheckQuestion: arrcheckQuestion
          })
          
          wx.showToast({
            title: '回答错误',
            icon: 'none',
            duration: 1500
          })
        }
      })
    })
  },

  /**
   * 多选题选择答案
   */
  selectAnswerMore: function(t) {
    var that = this
    var questionList = that.data.questionList
    var showQuestionList = that.data.showQuestionList

    if (that.data.questionList[that.data.indexInd].subup != "1") {
      var r = that.data.moreArr
      r[t.currentTarget.dataset.chosenum] ? r[t.currentTarget.dataset.chosenum] = !1 : r[t.currentTarget.dataset.chosenum] = !0
      questionList[that.data.indexInd].moreArr = that.data.moreArr
      that.setData({
        questionList: questionList,
        showQuestionList: showQuestionList
      })
    }
  },

  /**
   * 多选题提交
   */
  moreSelectSub: function(t) {
    var that = this
    var questionList = that.data.questionList
    var showQuestionList = that.data.showQuestionList
    var moreArr = questionList[that.data.indexInd].moreArr
    var answerArr = questionList[that.data.indexInd].answerArr
    var questionId = questionList[that.data.indexInd].objectId || questionList[that.data.indexInd].id
    var arrcheckQuestion = this.data.arrcheckQuestion
    
    // 收集用户选择的答案
    var downArr = []
    for (var i = 0; i < 10; i++) {
      if (moreArr[that.data.s[i]] != undefined && moreArr[that.data.s[i]]==true)
        downArr.push(that.data.s[i])
    }
    
    // 检查是否至少选择了一个选项
    if (downArr.length === 0) {
      wx.showToast({
        title: '请至少选择一个选项',
        icon: 'none',
        duration: 2000
      })
      return
    }
    
    console.log('多选题提交 - 用户选择:', downArr.toString(), '题目ID:', questionId)
    
    // 先检查是否已经答过这道题
    that.checkAnswerRecord(questionId).then(answerRecord => {
      console.log('答题记录检查结果:', answerRecord)
      
      if (answerRecord.isAnswered) {
        // 已经答过，显示之前的答题结果
        var isCorrect = answerRecord.correct === 1
        var previousAnswer = answerRecord.answer
        
        questionList[that.data.indexInd].subup = '1'
        questionList[that.data.indexInd].chosenum = moreArr
        questionList[that.data.indexInd].judge = isCorrect
        arrcheckQuestion[questionId] = isCorrect
        
        that.setData({
          questionList: questionList,
          showQuestionList: showQuestionList,
          arrcheckQuestion: arrcheckQuestion
        })
        
        wx.showModal({
          title: '提示',
          content: `您已经回答过这道题了，之前的答案是：${previousAnswer}，结果：${isCorrect ? '正确' : '错误'}`,
          showCancel: false,
          confirmText: '知道了'
        })
        return
      }
      
      // 没有答过，继续提交答案
      // 标记为已提交
      questionList[that.data.indexInd].subup = '1'
      questionList[that.data.indexInd].chosenum = moreArr
      
      // 提交到后端API（多选题答案用逗号分隔的字符串）
      var answerString = downArr.join(',')
      that.submitAnswerToAPI(questionId, answerString).then(res => {
        // API返回结果处理
        var isCorrect = res.correct || false
        
        questionList[that.data.indexInd].judge = isCorrect
        arrcheckQuestion[questionId] = isCorrect
        
        if (isCorrect) {
          this.setData({
            showQuestionList: showQuestionList,
            rightNum: this.data.rightNum + 1,
            arrcheckQuestion: arrcheckQuestion
          })
          
          wx.showToast({
            title: '回答正确！',
            icon: 'success',
            duration: 1500
          })
        } else {
          this.saveError(questionId)
          
          this.setData({
            showQuestionList: showQuestionList,
            errNum: this.data.errNum + 1,
            arrcheckQuestion: arrcheckQuestion
          })
          
          wx.showToast({
            title: '回答错误',
            icon: 'none',
            duration: 1500
          })
        }
      }).catch(err => {
        // API调用失败，回退到本地验证
        console.log('API调用失败，使用本地验证')
        
        // 对两个数组排序后再比较，避免顺序不同导致判断错误
        var sortedDownArr = downArr.sort()
        var sortedAnswerArr = answerArr.slice().sort()
        
        console.log('用户选择:', sortedDownArr.toString(), '正确答案:', sortedAnswerArr.toString())
        
        // 比较排序后的数组
        var isCorrect = sortedDownArr.length === sortedAnswerArr.length && 
                        sortedDownArr.toString() === sortedAnswerArr.toString()
        
        if (isCorrect) {
          questionList[that.data.indexInd].judge = true
          arrcheckQuestion[questionId] = true
          
          this.setData({
            showQuestionList: showQuestionList,
            rightNum: this.data.rightNum + 1,
            arrcheckQuestion: arrcheckQuestion
          })
          
          wx.showToast({
            title: '回答正确！',
            icon: 'success',
            duration: 1500
          })
        } else {
          questionList[that.data.indexInd].judge = false //答题错误
          arrcheckQuestion[questionId] = false
          this.saveError(questionId)
          
          this.setData({
            showQuestionList: showQuestionList,
            errNum: this.data.errNum + 1,
            arrcheckQuestion: arrcheckQuestion
          })
          
          wx.showToast({
            title: '回答错误',
            icon: 'none',
            duration: 1500
          })
        }
      })
    })
    
    that.setData({
      questionList: questionList
    })
  },

  /**
   * 跳转到指定题目
   */
  jumpToQuestion: function(t) {
    var a = this
    var o = t.currentTarget.dataset.index;
    var d = a.data.questionList
    var u = []
    this.setData({
      indexInd: o
    })
    
    console.log('跳转到题目:', o)
    
    if (1 == this.data.current) {
      a.data.indexInd <= 0 ? u.push(d[d.length - 1]) : u.push(d[a.data.indexInd - 1])
      u.push(d[a.data.indexInd])
      a.data.indexInd >= d.length - 1 ? u.push(d[0]) : u.push(d[a.data.indexInd + 1])
    } else if (0 == this.data.current) {
      u.push(d[a.data.indexInd])
      a.data.indexInd == d.length - 1 ? (u.push(d[0]), u.push(d[1])) : a.data.indexInd == d.length - 2 ? (u.push(d[a.data.indexInd + 1]), u.push(d[0])) : (u.push(d[a.data.indexInd + 1]), u.push(d[a.data.indexInd + 2]))
    } else {
      0 == a.data.indexInd ? (u.push(d[d.length - 2]), u.push(d[d.length - 1])) : 1 == a.data.indexInd ? (u.push(d[d.length - 1]), u.push(d[0])) : (u.push(d[a.data.indexInd - 2]), u.push(d[a.data.indexInd - 1]))
      u.push(d[a.data.indexInd])
    }
    
    // 如果跳转到已答题的题目，恢复其状态
    var targetQuestion = d[o]
    if (targetQuestion && targetQuestion.subup === '1') {
      if (targetQuestion.type == '1') {
        // 单选题：恢复selectedOption
        console.log('恢复单选题答案:', targetQuestion.selectedOption)
      } else if (targetQuestion.type == '2') {
        // 多选题：恢复moreArr状态
        console.log('恢复多选题答案:', targetQuestion.moreArr)
        a.setData({
          moreArr: targetQuestion.moreArr
        })
      }
    } else {
      // 如果跳转到未答题的题目，重置状态
      a.setData({
        moreArr: {
          A: !1,
          B: !1,
          C: !1,
          D: !1,
          E: !1,
          F: !1,
          G: !1,
          H: !1,
          I: !1,
          J: !1
        }
      })
    }
    
    this.setData({
      showQuestionList: u,
      indexInd: o
    })
    
    setTimeout(function() {
      a.setData({
        iconInd: !1
      })
    }, 500)
  },

  /**
   * 清空记录
   */
  del_data: function(t) {
    var that = this
    wx.showModal({
      title: '提示',
      content: '确定要清空答题记录吗？',
      success: function(a) {
        if (a.confirm) {
          that.setData({
            indexInd: 0,
            current: 0,
            rightNum: 0,
            errNum: 0,
            moreArr: {
              A: !1,
              B: !1,
              C: !1,
              D: !1,
              E: !1,
              F: !1,
              G: !1,
              H: !1,
              I: !1,
              J: !1
            },
          })
          
          // 重置所有题目状态
          var questionList = that.data.questionList
          var arrcheckQuestion = {}
          questionList.forEach((question, index) => {
            question.chosenum = undefined
            question.judge = undefined
            question.subup = undefined
            question.selectedOption = undefined // 清空单选题的选择
            if (question.type == '2') {
              question.moreArr = {
                A: !1,
                B: !1,
                C: !1,
                D: !1,
                E: !1,
                F: !1,
                G: !1,
                H: !1,
                I: !1,
                J: !1
              }
            }
            var questionId = question.objectId || question.id
            arrcheckQuestion[questionId] = {'check': null}
          })
          
          that.setData({
            questionList: questionList,
            arrcheckQuestion: arrcheckQuestion
          })
          
          that.onShow()
          
          setTimeout(function() {
            that.setData({
              iconInd: !1
            })
          }, 500)
        }
      }
    })
  },

  /**
   * 保存错题集
   */
  saveError: function(id) {
    console.log('保存错题:', id)
    var that = this
    var cateid = that.data.cateid
    var errQuestionList = []
    var menuQuestionList = []
    var errStorageList = wx.getStorageSync('err_' + cateid)
    var menuStorageList = wx.getStorageSync('menuStorageList')

    var params = {
      'menu': this.data.menu,
      'cateid': cateid
    }
    
    if (menuStorageList == '')
      menuQuestionList.push(params)
    else {
      var menuList = []
      menuQuestionList = menuStorageList
      for (let object of menuStorageList) {
        menuList.push(object.cateid)
      }
      if (menuList.indexOf(cateid) == -1)
        menuQuestionList.push(params)
    }

    if (errStorageList == '')
      errQuestionList.push(id)
    else {
      errQuestionList = errStorageList
      if (errQuestionList.indexOf(id) == -1)
        errQuestionList.push(id)
    }
    
    wx.setStorageSync('menuStorageList', menuQuestionList);
    wx.setStorageSync('err_' + cateid, errQuestionList);
    console.log('错题已保存:', errQuestionList)
  },

  finish: function() {
    wx.showToast({
      title: "已经是最后一题"
    })
  }
})

