"use strict";
/**
 * 名称：代理中间件
 * 日期：2017-11-28
 * 描述：用于解决
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
var http_proxy_1 = __importDefault(require("http-proxy"));
var url_1 = __importDefault(require("url"));
var context_1 = __importDefault(require("./context"));
var stream_1 = __importDefault(require("./stream"));
var querystring_1 = __importDefault(require("querystring"));
/**
 * 本地mock服务器
 */
var AgentProxy = /** @class */ (function () {
    function AgentProxy(req, resp, next, baseUri) {
        this.request = req;
        this.response = resp;
        this.next = next;
        this.onceBaseUrl = null;
        this.templateUrl = baseUri;
        var protocol = req.connection.encrypted ? 'https' : 'http';
        var info = new URL(req.url, protocol + "://" + req.headers.host);
        this.path = info.pathname;
        this.protocol = info.protocol;
        try {
            this.handleRequest();
        }
        catch (ex) {
            console.error(ex.stack);
            this.handleLocal({ stat: { code: -1, message: ex.message } });
        }
    }
    /**
     * 获取当前mock服务的远端服务器url
     */
    AgentProxy.prototype.getTemplateUrl = function () {
        var templateUrl = this.templateUrl || '';
        if (typeof templateUrl === 'function') {
            return templateUrl(this.request);
        }
        else {
            return templateUrl;
        }
    };
    Object.defineProperty(AgentProxy.prototype, "api", {
        /**
         * 当前请求的网关接口方法名
         */
        get: function () {
            return this.path.replace(/\//g, '-').replace(/^-/, '');
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AgentProxy.prototype, "idModule", {
        /**
         * 或去当前请求网关接口的本地mock模块标识
         */
        get: function () {
            return path_1.default.resolve('mock/' + this.api.replace(/\./g, '/'));
        },
        enumerable: false,
        configurable: true
    });
    /**
     * 接收到/m.api请求
     */
    AgentProxy.prototype.handleRequest = function () {
        var data = this.handleMock();
        if (data === 'self') {
            return;
        }
        else if (data && data['__Off']) {
            this.onceBaseUrl = (data || {}).__Off;
            this.handleRemote();
        }
        else if (data) {
            this.handleLocal(data);
        }
        else {
            this.handleRemote();
        }
    };
    /**
     * 尝试获取本地mock数据
     */
    AgentProxy.prototype.handleMock = function () {
        var jsFile = this.idModule + '.js';
        var jsonFile = this.idModule + '.json';
        if (fs_1.default.existsSync(jsFile)) {
            // js mock模块
            var data = this.getNoCacheModule(jsFile);
            return typeof data === 'function' ? this.handleFunctionMock(data) : data;
        }
        else if (fs_1.default.existsSync(jsonFile)) {
            // json mock模块
            return JSON.parse(fs_1.default.readFileSync(jsonFile).toString('utf-8'));
        }
        else {
            return null;
        }
    };
    /**
     * 处理函数mock模块
     */
    AgentProxy.prototype.handleFunctionMock = function (handler) {
        var _this = this;
        if (handler['__Off']) {
            this.onceBaseUrl = handler['__Off'];
            return null;
        }
        new stream_1.default(this.request, function (chunks) {
            try {
                var body = chunks.toString('utf8');
                _this.request.body = querystring_1.default.parse(body);
                var contextApplication = new context_1.default(
                // this.request,
                // this.response
                );
                contextApplication.throwRequired(_this.request, handler.parameters);
                var data = handler.apply(contextApplication, [_this.request]);
                _this.handleLocal(data);
            }
            catch (ex) {
                console.error(ex.stack);
                _this.handleLocal({ stat: { code: -1, message: ex.message } });
            }
        });
        return 'self';
    };
    /**
     * 返回本地的mock数据到客户端
     */
    AgentProxy.prototype.handleLocal = function (data) {
        var response = this.response;
        response.setHeader('Data-Provider', 'Mock');
        response.setHeader('content-type', 'application/json');
        response.setHeader('access-control-allow-origin', '*');
        response.setHeader('access-control-allow-method', 'POST, GET, OPTIONS, PUT, DELETE, HEAD');
        response.setHeader('access-control-allow-credentials', 'true');
        response.write(JSON.stringify(data, null, 4));
        response.end();
    };
    /**
     * 代理到原始服务器请求网关接口进行接口返回
     */
    AgentProxy.prototype.handleRemote = function () {
        var _a = this, request = _a.request, response = _a.response, next = _a.next;
        var mRequest = request;
        var parts = url_1.default.parse(request.url);
        var pathname = this.path.replace(/^\//, '');
        var tempBaseUrl = this.onceBaseUrl === true ? null : this.onceBaseUrl;
        var baseApi = tempBaseUrl || this.getTemplateUrl();
        var baseUrl = /^\/\//.test(baseApi) ? this.protocol + ':' + baseApi : baseApi;
        var querys = '?' + parts.query; // : '';
        if (!baseUrl) {
            return next();
        }
        var proxy = http_proxy_1.default.createProxyServer({
            target: baseUrl,
            changeOrigin: true,
        });
        this.onceBaseUrl = null;
        var finalUrl = /^\//.test(baseUrl) ? baseUrl : '/' + baseUrl;
        mRequest.url = mRequest.originalUrl = finalUrl + pathname + querys;
        console.log("proxy remote:" + request.url);
        proxy.web(request, response, {}, function (ex) { return next(ex); });
    };
    /**
     * 获取一个无缓存的模块
     */
    AgentProxy.prototype.getNoCacheModule = function (id) {
        delete require.cache[require.resolve(id)];
        return require(id);
    };
    return AgentProxy;
}());
/**
 * 配置一个Mock中间件
 * @param {String/Function} baseUri  mock数据远程服务地址，可以为字符串或者函数
 */
function default_1(baseUri) {
    return function (req, resp, next) { return new AgentProxy(req, resp, next, baseUri); };
}
exports.default = default_1;
;
//# sourceMappingURL=proxy.js.map