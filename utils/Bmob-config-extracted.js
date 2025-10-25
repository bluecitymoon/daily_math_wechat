/**
 * Bmob SDK 配置信息提取
 * 从 Bmob-1.6.7.min.js 中提取的关键配置
 */

// 导入全局配置
const config = require('../config.js');

// 主要配置对象
const BmobConfig = {
    // API 主机地址 (已修改为本地服务器)
    host: config.API_BASE_URL,
    
    // 应用配置
    applicationId: "",
    applicationKey: "",
    applicationMasterKey: "",
    
    // API 端点配置
    parameters: {
        // 微信小程序相关
        GENERATECODE: "/1/wechatApp/qr/generatecode",
        GETACCESSTOKEN: "/1/wechatApp/getAccessToken",
        SENDWEAPPMESSAGE: "/1/wechatApp/SendWeAppMessage",
        NOTIFYMSG: "/1/wechatApp/notifyMsg",
        WECHAT_APP: "/1/wechatApp/",
        CHECK_MSG: "/1/wechatApp/checkMsg",
        DECRYPTION: "/1/wechatApp/decryption",
        
        // 用户相关
        LOGIN: "/1/login",
        REGISTER: "/1/users",
        USERS: "/1/users",
        REQUEST_EMAIL_VERIFY: "/1/requestEmailVerify",
        REQUESTPASSWORDRESET: "/1/requestPasswordReset",
        RESETPASSWORDBYSMSCODE: "/1/resetPasswordBySmsCode",
        UPDATEUSERPASSWORD: "/1/updateUserPassword",
        
        // 短信验证
        REQUESTSMSCODE: "/1/requestSmsCode",
        VERIFYSMSCODE: "/1/verifySmsCode",
        
        // 数据查询 (重要：questionMenu 相关)
        QUERY: "/1/classes",
        
        // 文件相关
        FILES: "/2/files",
        DELFILES: "/2/cdnBatchDelete",
        
        // 支付相关
        PAY: "/1/pay",
        REFUND: "/1/pay/refund",
        
        // 其他功能
        FUNCTIONS: "/1/functions",
        PUSH: "/1/push",
        TIMESTAMP: "/1/timestamp",
        BATCH: "/1/batch"
    },
    
    // 版本信息
    version: "1.6.7",
    type: 3 // 3 表示微信小程序环境
};

// 关键 API 路径说明
const ApiEndpoints = {
    // questionMenu 相关的 API 路径
    questionMenu: {
        // 获取分类列表
        list: `${BmobConfig.host}/api/question-section-groups/by-grade/3`,
        // 获取分类详情
        detail: (id) => `${BmobConfig.host}${BmobConfig.parameters.QUERY}/questionMenu/${id}`,
        // 创建分类
        create: `${BmobConfig.host}${BmobConfig.parameters.QUERY}/questionMenu`,
        // 更新分类
        update: (id) => `${BmobConfig.host}${BmobConfig.parameters.QUERY}/questionMenu/${id}`,
        // 删除分类
        delete: (id) => `${BmobConfig.host}${BmobConfig.parameters.QUERY}/questionMenu/${id}`
    },
    
    // questions 相关的 API 路径
    questions: {
        // 获取题目列表
        list: `${BmobConfig.host}${BmobConfig.parameters.QUERY}/questions`,
        // 获取题目详情
        detail: (id) => `${BmobConfig.host}${BmobConfig.parameters.QUERY}/questions/${id}`,
        // 根据 menuId 查询题目
        byMenu: (menuId) => `${BmobConfig.host}${BmobConfig.parameters.QUERY}/questions?where={"menu":"${menuId}"}`,
        // 创建题目
        create: `${BmobConfig.host}${BmobConfig.parameters.QUERY}/questions`,
        // 更新题目
        update: (id) => `${BmobConfig.host}${BmobConfig.parameters.QUERY}/questions/${id}`,
        // 删除题目
        delete: (id) => `${BmobConfig.host}${BmobConfig.parameters.QUERY}/questions/${id}`
    },
    
    // 用户相关 API 路径
    users: {
        // 用户登录
        login: `${BmobConfig.host}${BmobConfig.parameters.LOGIN}`,
        // 用户注册
        register: `${BmobConfig.host}${BmobConfig.parameters.REGISTER}`,
        // 获取用户信息
        info: (id) => `${BmobConfig.host}${BmobConfig.parameters.USERS}/${id}`,
        // 更新用户信息
        update: (id) => `${BmobConfig.host}${BmobConfig.parameters.USERS}/${id}`
    },
    
    // 历史记录相关 API 路径
    history: {
        // 获取历史记录
        list: `${BmobConfig.host}${BmobConfig.parameters.QUERY}/history`,
        // 创建历史记录
        create: `${BmobConfig.host}${BmobConfig.parameters.QUERY}/history`,
        // 根据用户查询历史记录
        byUser: (userId) => `${BmobConfig.host}${BmobConfig.parameters.QUERY}/history?where={"user":"${userId}"}`,
        // 根据菜单查询历史记录
        byMenu: (menuId) => `${BmobConfig.host}${BmobConfig.parameters.QUERY}/history?where={"menuId":"${menuId}"}`
    }
};

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        BmobConfig,
        ApiEndpoints
    };
} else if (typeof window !== 'undefined') {
    window.BmobConfig = BmobConfig;
    window.ApiEndpoints = ApiEndpoints;
}

/**
 * 使用说明：
 * 
 * 1. questionMenu 相关接口：
 *    - 获取分类列表：GET /1/classes/questionMenu
 *    - 获取分类详情：GET /1/classes/questionMenu/{id}
 *    - 创建分类：POST /1/classes/questionMenu
 *    - 更新分类：PUT /1/classes/questionMenu/{id}
 *    - 删除分类：DELETE /1/classes/questionMenu/{id}
 * 
 * 2. questions 相关接口：
 *    - 获取题目列表：GET /1/classes/questions
 *    - 根据菜单查询：GET /1/classes/questions?where={"menu":"{menuId}"}
 *    - 创建题目：POST /1/classes/questions
 *    - 更新题目：PUT /1/classes/questions/{id}
 *    - 删除题目：DELETE /1/classes/questions/{id}
 * 
 * 3. 所有接口都需要在请求头中包含：
 *    - Content-Type: application/json
 *    - X-Bmob-SDK-Type: wechatApp
 *    - X-Bmob-Application-Id: {your_app_id}
 *    - X-Bmob-REST-API-Key: {your_api_key}
 */
