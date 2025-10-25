/**
 * 自定义 Bmob SDK - 适配本地 API 服务器
 * 基于原始 Bmob-1.6.7.min.js 修改
 */

// 导入全局配置
const config = require('../config.js');

// 配置对象
const BmobConfig = {
    host: config.API_BASE_URL,
    applicationId: "",
    applicationKey: "",
    applicationMasterKey: "",
    parameters: {
        QUERY: "/1/classes",
        LOGIN: "/1/login",
        USERS: "/1/users",
        REGISTER: "/1/users",
        REQUEST_EMAIL_VERIFY: "/1/requestEmailVerify",
        REQUESTPASSWORDRESET: "/1/requestPasswordReset",
        RESETPASSWORDBYSMSCODE: "/1/resetPasswordBySmsCode",
        UPDATEUSERPASSWORD: "/1/updateUserPassword",
        REQUESTSMSCODE: "/1/requestSmsCode",
        VERIFYSMSCODE: "/1/verifySmsCode",
        FUNCTIONS: "/1/functions",
        PUSH: "/1/push",
        FILES: "/2/files",
        DELFILES: "/2/cdnBatchDelete",
        TIMESTAMP: "/1/timestamp",
        PAY: "/1/pay",
        REFUND: "/1/pay/refund",
        WECHAT_APP: "/1/wechatApp/",
        BATCH: "/1/batch",
        CHECK_MSG: "/1/wechatApp/checkMsg",
        DECRYPTION: "/1/wechatApp/decryption",
        GENERATECODE: "/1/wechatApp/qr/generatecode",
        GETACCESSTOKEN: "/1/wechatApp/getAccessToken",
        SENDWEAPPMESSAGE: "/1/wechatApp/SendWeAppMessage",
        NOTIFYMSG: "/1/wechatApp/notifyMsg"
    },
    version: "1.6.7",
    type: 3
};

// 工具函数
const utils = {
    isString: (e) => typeof e === "string",
    isNumber: (e) => typeof e === "number",
    isObject: (e) => e !== null && typeof e === "object",
    isArray: (e) => Array.isArray(e),
    isFunction: (e) => typeof e === "function",
    isUndefined: (e) => typeof e === "undefined",
    isDate: (e) => e instanceof Date,
    forEach: (e, t) => {
        if (e && !utils.isUndefined(e)) {
            if (!utils.isObject(e) && (e = [e]), utils.isArray(e))
                for (let n = 0, r = e.length; n < r; n++) t.call(null, e[n], n, e);
            else
                for (let o in e) Object.prototype.hasOwnProperty.call(e, o) && t.call(null, e[o], o, e);
        }
    },
    merge: function() {
        let e = {};
        const t = (n, r) => {
            if (utils.isObject(e[r]) && utils.isObject(n)) e[r] = t(e[r], n);
            else e[r] = n;
        };
        for (let n = 0, r = arguments.length; n < r; n++) utils.forEach(arguments[n], t);
        return e;
    }
};

// 错误类
class BmobError extends Error {
    constructor(code, message) {
        super();
        this.code = code;
        this.message = message ? `Bmob.Error:{code:${code}, message:${message}}` : `Bmob.Error:{code:${code}, message:${this.errorMsg(code)}}`;
    }
    
    errorMsg(code) {
        switch (code) {
            case 415: return "incorrect parameter type.";
            case 416: return "Parameter is null.";
            case 417: return "There is no upload content.";
            case 418: return "Log in failure.";
            case 419: return "Bmob.GeoPoint location error.";
            default: return "unknown error";
        }
    }
}

// HTTP 请求函数
const request = (url, method = "GET", data = {}) => {
    return new Promise((resolve, reject) => {
        const headers = {
            "content-type": "application/json",
            "X-Bmob-SDK-Type": "wechatApp",
            "X-Bmob-Application-Id": BmobConfig.applicationId,
            "X-Bmob-REST-API-Key": BmobConfig.applicationKey
        };
        
        if (BmobConfig.applicationMasterKey) {
            headers["X-Bmob-Master-Key"] = BmobConfig.applicationMasterKey;
        }
        
        // 添加用户会话令牌
        const currentUser = User.current();
        if (currentUser) {
            headers["X-Bmob-Session-Token"] = currentUser.sessionToken;
        }
        
        wx.request({
            url: BmobConfig.host + url,
            method: method,
            data: data,
            header: headers,
            success: (res) => {
                if (res.data.code && res.data.error || res.data.error) {
                    reject(res.data);
                } else {
                    resolve(res.data);
                }
            },
            fail: (err) => {
                console.log(err);
                reject(err);
            }
        });
    });
};

// 存储管理
const storage = {
    save: (key, value) => {
        if (!utils.isString(key) || !value) throw new BmobError(415);
        const data = utils.isObject(value) ? JSON.stringify(value) : value;
        wx.setStorageSync(key, data);
    },
    fetch: (key) => {
        if (!utils.isString(key)) throw new BmobError(415);
        return wx.getStorageSync(key) || null;
    },
    remove: (key) => {
        if (!utils.isString(key)) throw new BmobError(415);
        return wx.removeStorageSync(key);
    },
    clear: () => wx.clearStorageSync()
};

// Pointer 类
class Pointer {
    constructor(tableName) {
        if (!utils.isString(tableName)) throw new BmobError(415);
        this.tableName = tableName;
    }
    
    set(objectId) {
        if (!utils.isString(objectId)) throw new BmobError(415);
        return {
            __type: "Pointer",
            className: this.tableName,
            objectId: objectId
        };
    }
}

// Relation 类
class Relation {
    constructor(tableName) {
        if (!utils.isString(tableName)) throw new BmobError(415);
        this.tableName = tableName;
    }
    
    add(objectId) {
        return this._createRelation(objectId, "AddRelation");
    }
    
    remove(objectId) {
        return this._createRelation(objectId, "RemoveRelation");
    }
    
    _createRelation(objectId, operation) {
        if (utils.isString(objectId)) {
            return {
                __op: operation,
                objects: [{
                    __type: "Pointer",
                    className: this.tableName,
                    objectId: objectId
                }]
            };
        }
        if (utils.isArray(objectId)) {
            const objects = [];
            objectId.forEach(id => {
                if (!utils.isString(id)) throw new BmobError(415);
                objects.push({
                    __type: "Pointer",
                    className: this.tableName,
                    objectId: id
                });
            });
            return {
                __op: operation,
                objects: objects
            };
        }
        throw new BmobError(415);
    }
}

// Query 类
class Query {
    constructor(className) {
        this.tableName = `${BmobConfig.parameters.QUERY}/${className}`;
        this.className = className;
        this.init();
        this.addArray = {};
        this.setData = {};
    }
    
    init() {
        this.queryData = {};
        this.location = {};
        this.andData = {};
        this.orData = {};
        this.stat = {};
        this.limitNum = 100;
        this.skipNum = 0;
        this.includes = "";
        this.queryReilation = {};
        this.orders = null;
        this.keys = null;
    }
    
    get(objectId) {
        if (!utils.isString(objectId)) throw new BmobError(415);
        
        const params = {};
        if (this.includes !== "") {
            params.include = this.includes;
        }
        
        return new Promise((resolve, reject) => {
            request(`${this.tableName}/${objectId}`, "GET", params).then(res => {
                // 添加操作方法
                Object.defineProperty(res, "set", { value: this._setField.bind(this) });
                Object.defineProperty(res, "unset", { value: this._unsetField.bind(this) });
                Object.defineProperty(res, "save", { value: this._saveObject.bind(this) });
                Object.defineProperty(res, "increment", { value: this._incrementField.bind(this) });
                Object.defineProperty(res, "add", { value: this._addToArray.bind(this) });
                Object.defineProperty(res, "remove", { value: this._removeFromArray.bind(this) });
                Object.defineProperty(res, "addUnique", { value: this._addUniqueToArray.bind(this) });
                Object.defineProperty(res, "destroy", { value: () => this.destroy(objectId) });
                resolve(res);
            }).catch(err => reject(err));
        });
    }
    
    destroy(objectId) {
        if (!utils.isString(objectId)) throw new BmobError(415);
        return request(`${this.tableName}/${objectId}`, "DELETE");
    }
    
    set(field, value) {
        if (!utils.isString(field) || utils.isUndefined(value)) throw new BmobError(415, `${field}字段参数,类型不正确`);
        this.setData[field] = value;
    }
    
    add(field, values) {
        if (!utils.isString(field) || !utils.isArray(values)) throw new BmobError(415);
        this.addArray[field] = { __op: "Add", objects: values };
    }
    
    addUnique(field, values) {
        if (!utils.isString(field) || !utils.isArray(values)) throw new BmobError(415);
        this.addArray[field] = { __op: "AddUnique", objects: values };
    }
    
    equalTo(field, operator, value) {
        if (!utils.isString(field)) throw new BmobError(415);
        
        let queryValue = value;
        if (field === "createdAt" || field === "updateAt") {
            queryValue = { __type: "Date", iso: value };
        }
        
        let condition = {};
        switch (operator) {
            case "==":
            case "===":
                condition[field] = queryValue;
                break;
            case "!=":
                condition[field] = { $ne: queryValue };
                break;
            case "<":
                condition[field] = { $lt: queryValue };
                break;
            case "<=":
                condition[field] = { $lte: queryValue };
                break;
            case ">":
                condition[field] = { $gt: queryValue };
                break;
            case ">=":
                condition[field] = { $gte: queryValue };
                break;
            default:
                throw new BmobError(415);
        }
        
        if (Object.keys(this.queryData).length) {
            if (utils.isUndefined(this.queryData.$and)) {
                this.queryData = { $and: [this.queryData, condition] };
            } else {
                this.queryData.$and.push(condition);
            }
        } else {
            this.queryData = condition;
        }
        
        return condition;
    }
    
    containedIn(field, values) {
        if (!utils.isString(field) || !utils.isArray(values)) throw new BmobError(415);
        return this._addCondition(field, "$in", values);
    }
    
    notContainedIn(field, values) {
        if (!utils.isString(field) || !utils.isArray(values)) throw new BmobError(415);
        return this._addCondition(field, "$nin", values);
    }
    
    exists(field) {
        if (!utils.isString(field)) throw new BmobError(415);
        return this._addCondition(field, "$exists", true);
    }
    
    doesNotExist(field) {
        if (!utils.isString(field)) throw new BmobError(415);
        return this._addCondition(field, "$exists", false);
    }
    
    limit(num) {
        if (!utils.isNumber(num)) throw new BmobError(415);
        if (num > 1000) num = 1000;
        this.limitNum = num;
    }
    
    skip(num) {
        if (!utils.isNumber(num)) throw new BmobError(415);
        this.skipNum = num;
    }
    
    order(...fields) {
        fields.forEach(field => {
            if (!utils.isString(field)) throw new BmobError(415);
        });
        this.orders = fields.join(",");
    }
    
    include(...fields) {
        fields.forEach(field => {
            if (!utils.isString(field)) throw new BmobError(415);
        });
        this.includes = fields.join(",");
    }
    
    select(...fields) {
        fields.forEach(field => {
            if (!utils.isString(field)) throw new BmobError(415);
        });
        this.keys = fields.join(",");
    }
    
    find() {
        const params = this.getParams();
        
        return new Promise((resolve, reject) => {
            request(this.tableName, "GET", params).then(res => {
                let results = res.results;
                if (params.hasOwnProperty("count")) {
                    results = res;
                }
                
                this.init();
                
                // 添加批量操作方法
                Object.defineProperty(results, "set", { value: this._setField.bind(this) });
                Object.defineProperty(results, "saveAll", { value: this._saveAll.bind(this) });
                Object.defineProperty(results, "destroyAll", { value: this._destroyAll.bind(this) });
                
                resolve(results);
            }).catch(err => reject(err));
        });
    }
    
    count(limit = 0) {
        const params = {};
        if (Object.keys(this.queryData).length) {
            params.where = this.queryData;
        }
        if (Object.keys(this.andData).length) {
            params.where = utils.merge(this.andData, this.queryData);
        }
        if (Object.keys(this.orData).length) {
            params.where = utils.merge(this.orData, this.queryData);
        }
        params.count = 1;
        params.limit = limit;
        
        return new Promise((resolve, reject) => {
            request(this.tableName, "GET", params).then(({ count }) => {
                resolve(count);
            }).catch(err => reject(err));
        });
    }
    
    getParams() {
        let params = {};
        
        if (Object.keys(this.queryData).length) {
            params.where = this.queryData;
        }
        if (Object.keys(this.location).length) {
            params.where = utils.merge(this.location, this.queryData);
        }
        if (Object.keys(this.andData).length) {
            params.where = utils.merge(this.andData, this.queryData);
        }
        if (Object.keys(this.orData).length) {
            params.where = utils.merge(this.orData, this.queryData);
        }
        
        params.limit = this.limitNum;
        params.skip = this.skipNum;
        params.include = this.includes;
        params.order = this.orders;
        params.keys = this.keys;
        
        if (Object.keys(this.stat).length) {
            params = utils.merge(params, this.stat);
        }
        
        // 清理空值
        for (const key in params) {
            if (params.hasOwnProperty(key) && (params[key] === null || params[key] === 0 || params[key] === "")) {
                delete params[key];
            }
        }
        
        return params;
    }
    
    _addCondition(field, operator, value) {
        let condition = {};
        condition[field] = { [operator]: value };
        
        if (Object.keys(this.queryData).length) {
            if (utils.isUndefined(this.queryData.$and)) {
                this.queryData = { $and: [this.queryData, condition] };
            } else {
                this.queryData.$and.push(condition);
            }
        } else {
            this.queryData = condition;
        }
        
        return condition;
    }
    
    _setField(field, value) {
        if (!field || utils.isUndefined(value)) throw new BmobError(415);
        this.setData[field] = value;
    }
    
    _unsetField(field) {
        if (!utils.isString(field)) throw new BmobError(415);
        this.setData[field] = { __op: "Delete" };
    }
    
    _saveObject() {
        const data = utils.merge({}, this.setData, this.addArray);
        const method = this.setData.id ? "PUT" : "POST";
        const id = this.setData.id || "";
        
        if (this.setData.id) {
            delete this.setData.id;
        }
        
        return new Promise((resolve, reject) => {
            request(`${this.tableName}/${id}`, method, data).then(res => {
                this.addArray = {};
                this.setData = {};
                resolve(res);
            }).catch(err => reject(err));
        });
    }
    
    _incrementField(field, amount = 1) {
        if (!utils.isString(field) || !utils.isNumber(amount)) throw new BmobError(415);
        this.setData[field] = { __op: "Increment", amount: amount };
    }
    
    _addToArray(field, values) {
        if (!utils.isString(field) || !utils.isArray(values)) throw new BmobError(415);
        this.addArray[field] = { __op: "Add", objects: values };
    }
    
    _removeFromArray(field, values) {
        if (!utils.isString(field) || !utils.isArray(values)) throw new BmobError(415);
        this.addArray[field] = { __op: "Remove", objects: values };
    }
    
    _addUniqueToArray(field, values) {
        if (!utils.isString(field) || !utils.isArray(values)) throw new BmobError(415);
        this.addArray[field] = { __op: "AddUnique", objects: values };
    }
    
    _saveAll() {
        // 批量保存实现
        throw new BmobError(415, "批量保存功能暂未实现");
    }
    
    _destroyAll() {
        // 批量删除实现
        throw new BmobError(415, "批量删除功能暂未实现");
    }
}

// User 类
class User extends Query {
    constructor() {
        super("_User");
    }
    
    set(field, value = "") {
        if (utils.isString(field)) {
            this.setData[field] = value;
        }
    }
    
    register(data) {
        if (!utils.isObject(data)) throw new BmobError(415);
        this.setData = utils.merge({}, data);
        return request(BmobConfig.parameters.REGISTER, "POST", this.setData);
    }
    
    login(username, password) {
        if (!utils.isString(username) || !utils.isString(password)) throw new BmobError(415);
        this.setData = { username: username, password: password };
        return new Promise((resolve, reject) => {
            request(BmobConfig.parameters.LOGIN, "GET", this.setData).then(res => {
                storage.save("bmob", res);
                resolve(res);
            }).catch(err => reject(err));
        });
    }
    
    logout() {
        storage.clear();
    }
    
    current() {
        if (BmobConfig.type !== "hap") {
            const user = storage.fetch("bmob");
            return typeof user === "object" ? user : JSON.parse(user);
        }
        return new Promise((resolve, reject) => {
            storage.fetch("bmob").then(resolve).catch(reject);
        });
    }
    
    auth() {
        const that = this;
        return new Promise((resolve, reject) => {
            const loginProcess = () => {
                wx.login({
                    success: res => {
                        that.loginWithWeapp(res.code).then(res => {
                            if (res.error) throw new BmobError(415);
                            const openid = res.authData.weapp.openid;
                            storage.save("openid", openid);
                            storage.save("bmob", res);
                            resolve(res);
                        }).catch(err => reject(err));
                    }
                });
            };
            
            wx.checkSession({
                success: function() {
                    const user = that.current();
                    if (user === null) {
                        reject("登陆错误，请在Bmob后台填写小程序AppSecret。");
                    } else {
                        resolve(user);
                        loginProcess();
                    }
                },
                fail: () => {
                    loginProcess();
                }
            });
        });
    }
    
    loginWithWeapp(code) {
        return new Promise((resolve, reject) => {
            this.requestOpenId(code).then(res => {
                const authData = { weapp: res };
                this.linkWith(authData).then(resolve).catch(reject);
            }).catch(reject);
        });
    }
    
    requestOpenId(code) {
        return request(BmobConfig.parameters.WECHAT_APP + code, "POST", {});
    }
    
    linkWith(authData) {
        const data = { authData: authData };
        return request(BmobConfig.parameters.USERS, "POST", data);
    }
}

// 主 Bmob 对象
const Bmob = {
    // 配置
    _config: BmobConfig,
    
    // 初始化
    initialize: (applicationId, applicationKey, applicationMasterKey) => {
        BmobConfig.applicationId = applicationId;
        BmobConfig.applicationKey = applicationKey;
        BmobConfig.applicationMasterKey = applicationMasterKey;
    },
    
    // 工具函数
    utils: utils,
    
    // 核心类
    Query: (className) => new Query(className),
    User: new User(),
    Pointer: (tableName) => new Pointer(tableName),
    Relation: (tableName) => new Relation(tableName),
    
    // 请求函数
    request: request,
    
    // 类型
    type: 3,
    
    // 版本
    version: "1.6.7"
};

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Bmob;
} else if (typeof window !== 'undefined') {
    window.Bmob = Bmob;
} else if (typeof wx !== 'undefined') {
    wx.Bmob = Bmob;
}

// 兼容性处理
if (typeof wx !== 'undefined') {
    wx.Bmob = Bmob;
}
