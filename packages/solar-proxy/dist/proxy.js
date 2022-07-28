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
exports.createResolverProxy = void 0;
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
var http_proxy_1 = __importDefault(require("http-proxy"));
var cookie_1 = __importDefault(require("cookie"));
var url_1 = __importDefault(require("url"));
var querystring_1 = __importDefault(require("querystring"));
var context_1 = __importDefault(require("./context"));
var stream_1 = __importDefault(require("./stream"));
/**
 * 本地mock服务器
 */
var AgentProxy = /** @class */ (function () {
    function AgentProxy(req, resp, next, baseUri, options) {
        this.request = req;
        this.response = resp;
        this.next = next;
        this.onceBaseUrl = null;
        this.templateUrl = baseUri;
        this.options = options;
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
        return templateUrl;
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
        var _a;
        var jsFile = this.idModule + '.js';
        var jsonFile = this.idModule + '.json';
        if (((_a = this.options) === null || _a === void 0 ? void 0 : _a.mode) == 'proxy') {
            return null;
        }
        else if (fs_1.default.existsSync(jsFile)) {
            // js mock模块
            var data = this.getNoCacheModule(jsFile);
            return typeof data === 'function' ? this.handleFunctionMock(data) : data;
        }
        else if (fs_1.default.existsSync(jsonFile)) {
            // json mock模块
            return JSON.parse(fs_1.default.readFileSync(jsonFile).toString('utf-8'));
        }
        return null;
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
                var request = _this.request;
                var body = chunks.toString('utf8');
                if (/application\/json/.test(request.headers['content-type']) && body) {
                    _this.request.body = JSON.parse(body);
                }
                else {
                    _this.request.body = querystring_1.default.parse(body);
                }
                var contextApplication = new context_1.default(
                // this.request,
                // this.response
                );
                var parts = url_1.default.parse(request.url);
                request.query = request.query || querystring_1.default.parse(parts.query || '');
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
        if (data && typeof data === 'object' || data instanceof Array) {
            response.write(JSON.stringify(data, null, 4));
        }
        else {
            response.write(data);
        }
        response.end();
    };
    /**
     * 代理到原始服务器请求网关接口进行接口返回
     */
    AgentProxy.prototype.handleRemote = function () {
        var _this = this;
        var _a;
        var _b = this, request = _b.request, response = _b.response, next = _b.next;
        var mRequest = request;
        var parts = url_1.default.parse(request.url);
        var pathname = this.path.replace(/^\//, '');
        var tempBaseUrl = this.onceBaseUrl === true ? null : this.onceBaseUrl;
        var baseApi = tempBaseUrl || this.getTemplateUrl();
        var baseUrl = /^\/\//.test(baseApi) ? this.protocol + baseApi : baseApi;
        var querys = '?' + parts.query; // : '';
        if (!baseUrl) {
            return next();
        }
        var proxy = http_proxy_1.default.createProxyServer({
            target: baseUrl,
            changeOrigin: true,
        });
        this.onceBaseUrl = null;
        // const finalUrl = /^\//.test(baseUrl) ? baseUrl : '/' + baseUrl;
        baseUrl = /\/$/.test(baseUrl) ? baseUrl : baseUrl + '/';
        mRequest.url = mRequest.originalUrl = baseUrl + pathname + querys;
        console.log("Agent: Proxy Remote -> " + request.url);
        proxy.web(request, response, {}, function (ex) { return next(ex); });
        var file = this.idModule + '.js';
        var exists = fs_1.default.existsSync(file);
        if (((_a = this.options) === null || _a === void 0 ? void 0 : _a.makeMock) && (!exists || this.options.overrite != false)) {
            proxy.on('proxyRes', function (proxyRes, req, res) {
                var chunks = [];
                proxyRes.on('data', function (chunk) { return chunks.push(chunk); });
                proxyRes.on('end', function () {
                    var body = Buffer.concat(chunks);
                    res.end();
                    var shouldMock = _this.options.isRequestError ? !_this.options.isRequestError(body, res) : true;
                    if (shouldMock) {
                        _this.generateRemoteMock(proxyRes, body);
                    }
                });
            });
        }
    };
    /**
     * 生成本次代理的返回数据，作为mock数据
     * @param proxy
     */
    AgentProxy.prototype.generateRemoteMock = function (resp, body) {
        var _a, _b;
        var contentType = resp.headers['content-type'] || '';
        var data = null;
        if ((_a = this.options) === null || _a === void 0 ? void 0 : _a.mockTransform) {
            data = this.options.mockTransform(resp, body);
        }
        else if (contentType.indexOf('application/json') > -1) {
            data = JSON.stringify(JSON.parse(body.toString('utf-8')), null, 2);
        }
        if (data) {
            var file = this.idModule + '.js';
            var bak = file + '.bak';
            var dir = path_1.default.dirname(file);
            var chunks = [];
            chunks.push('module.exports = function() { ');
            chunks.push(" return " + data + ";  ");
            chunks.push('};');
            chunks.push('module.exports.__Off = true;');
            if (fs_1.default.existsSync(file) && ((_b = this.options) === null || _b === void 0 ? void 0 : _b.mockBackup) == true) {
                console.log('Agent: Backup Mock -> ' + bak);
                fs_1.default.renameSync(file, bak);
            }
            if (!fs_1.default.existsSync(dir)) {
                fs_1.default.mkdirSync(dir);
            }
            fs_1.default.writeFileSync(file, chunks.join('\n'));
            console.log('Agent: Make Mock -> ' + file);
        }
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
function handleCrosHttpHeaders(req, response, options) {
    if (req.method == 'OPTIONS') {
        response.setHeader('access-control-allow-origin', req.headers.origin);
        response.setHeader('access-control-allow-method', 'POST, GET, OPTIONS, PUT, DELETE, HEAD');
        response.setHeader('Access-Control-Allow-Headers', 'content-type,' + options.api);
        response.setHeader('access-control-allow-credentials', 'true');
        response.status(200).end();
        return true;
    }
}
/**
 * 配置一个Mock中间件
 * @param {String/Function} baseUri  mock数据远程服务地址，可以为字符串或者函数
 */
function default_1(baseUri) {
    return function (req, resp, next) { return new AgentProxy(req, resp, next, baseUri, {}); };
}
exports.default = default_1;
;
function createResolverProxy(options) {
    options = options || { api: 'proxy-api', env: 'cookie-env-api', mode: 'mock' };
    options.mode = options.onlyProxy ? 'proxy' : options.mode || 'mock';
    return function (request, response, next) {
        var api = request.headers[options.api];
        var env = cookie_1.default.parse(request.headers['cookie'] || '')[options.env];
        if (options.mode == 'none') {
            return next();
        }
        else if (handleCrosHttpHeaders(request, response)) {
            return;
        }
        else if (api) {
            return new AgentProxy(request, response, next, api, options);
        }
        else if (env) {
            return new AgentProxy(request, response, next, env, options);
        }
        next();
    };
}
exports.createResolverProxy = createResolverProxy;
//# sourceMappingURL=proxy.js.map