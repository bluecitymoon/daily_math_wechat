/**
 * 后端API集成测试工具
 * 用于测试用户数据的存储和更新
 */

const userService = require('./user-service.js');

/**
 * 测试用户数据 - 基于你提供的示例数据
 */
const testUserData = {
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
  "wechatAvatar": "https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132",
  "wechatSignature": null,
  "school": {
    "id": 1,
    "name": "上海外国语大学松江附属学校",
    "registeredStudentsCount": 5829,
    "pinyin": "shanghaiwaiguoyudaxuesongjiangfushuxuexiao",
    "distinct": null
  },
  "community": {
    "id": 1500,
    "name": "龙湖好望山",
    "lat": null,
    "lon": null,
    "studentsCount": 11,
    "createDate": "2025-09-09T16:00:00Z",
    "distinct": {
      "id": 1,
      "name": "松江",
      "pinyin": null
    }
  },
  "avatarUrl": "https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132",
  "nickName": "微信用户",
  "token": "142b3a24-8db2-4c97-aa2b-fb5ce656a8bd-1500"
};

/**
 * 测试后端API集成
 */
async function testBackendIntegration() {
  console.log('开始测试后端API集成...');
  
  try {
    // 测试1: 更新用户信息
    console.log('\n=== 测试1: 更新用户信息 ===');
    const userId = testUserData.id;
    const updateResult = await userService.updateUser(userId, testUserData);
    console.log('更新用户信息成功:', updateResult);
    
    // 测试2: 获取用户信息
    console.log('\n=== 测试2: 获取用户信息 ===');
    const userInfo = await userService.getUser(userId);
    console.log('获取用户信息成功:', userInfo);
    
    // 测试3: 根据微信用户ID查找用户
    console.log('\n=== 测试3: 根据微信用户ID查找用户 ===');
    const wechatUser = await userService.findUserByWechatId(testUserData.wechatUserId);
    console.log('查找微信用户成功:', wechatUser);
    
    // 测试4: 同步微信用户信息
    console.log('\n=== 测试4: 同步微信用户信息 ===');
    const syncResult = await userService.syncWechatUserInfo(testUserData, testUserData.token);
    console.log('同步微信用户信息成功:', syncResult);
    
    console.log('\n✅ 所有测试通过！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

/**
 * 在微信小程序中测试后端API
 * 需要在微信开发者工具的控制台中调用
 */
function testInWechatMiniProgram() {
  console.log('在微信小程序中测试后端API...');
  
  // 模拟微信用户登录后的数据
  const wechatUserInfo = {
    openid: testUserData.wechatUserId,
    nickName: testUserData.nickName,
    avatarUrl: testUserData.avatarUrl
  };
  
  // 模拟token
  const token = testUserData.token;
  
  // 测试同步用户信息
  userService.syncWechatUserInfo(wechatUserInfo, token)
    .then(result => {
      console.log('同步用户信息成功:', result);
      wx.showToast({
        title: '同步成功',
        icon: 'success'
      });
    })
    .catch(error => {
      console.error('同步用户信息失败:', error);
      wx.showToast({
        title: '同步失败',
        icon: 'none'
      });
    });
}

/**
 * 生成curl命令用于手动测试
 */
function generateCurlCommands() {
  const userId = testUserData.id;
  const token = testUserData.token;
  
  console.log('=== 手动测试用的curl命令 ===');
  
  // GET 用户信息
  console.log('\n1. 获取用户信息:');
  console.log(`curl 'http://localhost:9000/api/students/${userId}' \\
  -X 'GET' \\
  -H 'Authorization: Bearer ${token}' \\
  -H 'Content-Type: application/json'`);
  
  // PUT 更新用户信息
  console.log('\n2. 更新用户信息:');
  console.log(`curl 'http://localhost:9000/api/students/${userId}' \\
  -X 'PUT' \\
  -H 'Authorization: Bearer ${token}' \\
  -H 'Content-Type: application/json' \\
  --data-raw '${JSON.stringify(testUserData, null, 2)}'`);
  
  // POST 创建用户
  console.log('\n3. 创建新用户:');
  const createData = { ...testUserData };
  delete createData.id; // 创建时不需要ID
  console.log(`curl 'http://localhost:9000/api/students' \\
  -X 'POST' \\
  -H 'Authorization: Bearer ${token}' \\
  -H 'Content-Type: application/json' \\
  --data-raw '${JSON.stringify(createData, null, 2)}'`);
}

// 导出测试函数
module.exports = {
  testBackendIntegration,
  testInWechatMiniProgram,
  generateCurlCommands,
  testUserData
};

// 如果在Node.js环境中直接运行此文件，执行测试
if (typeof require !== 'undefined' && require.main === module) {
  console.log('在Node.js环境中运行测试...');
  generateCurlCommands();
}
