"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 名称:mock数据全局共享上下文
 * 描述：用于提供mock流程数据构建功能相
 */
var Session = {};
var ApplicationContext = /** @class */ (function () {
    function ApplicationContext() {
        // this.sessionId = cookies['msessionid'];
        // if (!this.sessionId) {
        //   this.sessionId = uuid.v1();
        //   Session[this.sessionId] = {};
        //   response.setHeader('set-cookie', `msessionid=${this.sessionId}`);
        // }
        Object.defineProperty(this, 'throwRequired', { writable: false, value: this.throwRequired });
        Object.defineProperty(this, 'toRule', { writable: false, value: this.toRule });
    }
    Object.defineProperty(ApplicationContext.prototype, "session", {
        /**
         * 获取全局数据
         */
        get: function () {
            // return Session[this.sessionId];
            return Session;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * 校验数据Mock接口传入参数
     * @param {IncommingMessage} req express的request对象
     * @param {Object} parameters 当前mock接口需要的参数
     */
    ApplicationContext.prototype.throwRequired = function (req, parameters) {
        var query = req.query;
        var body = req.body;
        var rule = this.toRule(parameters);
        var data = Object.assign({}, query, body);
        var message = this.validateParameters(data, rule);
        if (message) {
            throw new Error(message);
        }
    };
    ApplicationContext.prototype.validateParameters = function (data, rule) {
        var keys = Object.keys(rule);
        var isBlank = function (v) { return (v || '').toString().replace(/\s/g, '') === ''; };
        var errorKeys = keys.filter(function (k) { return isBlank(data[k]); });
        if (errorKeys.length > 0) {
            return '以下参数必须提供:' + errorKeys.join(',');
        }
    };
    /**
     * 转换参数类型为验证模型
     * @param {Object} parameters 当前mock接口需要的参数
     */
    ApplicationContext.prototype.toRule = function (parameters) {
        parameters = parameters || [];
        var rule = {};
        for (var i in parameters) {
            if (i) {
                rule[i] = { required: "".concat(i, "\u53C2\u6570\u5FC5\u987B\u63D0\u4F9B") };
            }
        }
        return rule;
    };
    return ApplicationContext;
}());
exports.default = ApplicationContext;
//# sourceMappingURL=context.js.map