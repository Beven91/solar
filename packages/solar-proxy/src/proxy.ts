/**
 * 名称：代理中间件
 * 日期：2017-11-28
 * 描述：用于解决
 */

// 引入依赖>>
import { IncomingMessage, ServerResponse } from 'http';
import path from 'path';
import fs from 'fs';
import httpProxy from 'http-proxy';
import cookie from 'cookie';
import url from 'url';
import querystring from 'querystring';
import ApplicationContext from './context';
import RequestMemoryStream from './stream';

type BaseURL = string | ((request: IncomingMessage) => string)

interface AgentProxyOptions {
  /**
   * 代理模式
   */
  mode?: 'mock' | 'proxy' | 'none'
  /**
   * 是否开启mock制作功能,开启mock制作功能后，当指定请求为服务器口返回数据，则会将改返回数据
   * 生成为对应的mock文件(生成后改文件的mock开关设置成false)
   */
  makeMock?: boolean
  /**
   * 制作mock时是否生成备份数据
   */
  mockBackup?: boolean
  /**
   * 是否覆盖已存在文件 默认为 true
   */
  overrite?: boolean
  /**
   * 自定义转换服务端返回的数据，并且制作成json字符串
   */
  mockTransform?: (proxyRes: IncomingMessage, body: Buffer) => string
  /**
   * 判断本地请求是否为异常状态,用于决定是否将代理访问的内容生成为mock文件
   */
  isRequestError?: (data: Buffer, res: ServerResponse) => boolean
  /**
   * 当前代理的远程服务地址
   */
  api: string
  /**
   * 当没有传递api时，会识别来源于cookie中env作为远程服务地址
   */
  env?: string
  /**
   * 是否仅为代理模式，不进行本地数据mock
   */
  onlyProxy?: boolean
}

/**
 * 本地mock服务器
 */
class AgentProxy {
  private readonly request: IncomingMessage

  private readonly response: ServerResponse

  private readonly next: Function

  private onceBaseUrl: string | boolean

  private templateUrl: BaseURL

  private path: string

  private protocol: string

  private makeMock: boolean

  private options: AgentProxyOptions

  constructor(req: IncomingMessage, resp: ServerResponse, next: Function, baseUri: BaseURL, options: AgentProxyOptions) {
    this.request = req;
    this.response = resp;
    this.next = next;
    this.onceBaseUrl = null;
    this.templateUrl = baseUri;
    this.options = options;
    const protocol = (req.connection as any).encrypted ? 'https' : 'http';
    const info = new URL(req.url, `${protocol}://${req.headers.host}`);
    this.path = info.pathname;
    this.protocol = info.protocol;
    try {
      this.handleRequest();
    } catch (ex) {
      console.error(ex.stack);
      this.handleLocal({ stat: { code: -1, message: ex.message } });
    }
  }

  /**
   * 获取当前mock服务的远端服务器url
   */
  getTemplateUrl() {
    const templateUrl = this.templateUrl || '';
    if (typeof templateUrl === 'function') {
      return templateUrl(this.request);
    }
    return templateUrl;
  }

  /**
   * 当前请求的网关接口方法名
   */
  get api() {
    return this.path.replace(/\//g, '-').replace(/^-/, '');
  }

  /**
   * 或去当前请求网关接口的本地mock模块标识
   */
  get idModule() {
    return path.resolve('mock/' + this.api.replace(/\./g, '/'));
  }

  /**
   * 接收到/m.api请求
   */
  handleRequest() {
    const data = this.handleMock();
    if (data === 'self') {

    } else if (data && data['__Off']) {
      this.onceBaseUrl = (data || {}).__Off;
      this.handleRemote();
    } else if (data) {
      this.handleLocal(data);
    } else {
      this.handleRemote();
    }
  }

  /**
   * 尝试获取本地mock数据
   */
  handleMock() {
    const jsFile = this.idModule + '.js';
    const jsonFile = this.idModule + '.json';
    if (this.options?.mode == 'proxy') {
      return null;
    } else if (fs.existsSync(jsFile)) {
      // js mock模块
      const data = this.getNoCacheModule(jsFile);
      return typeof data === 'function' ? this.handleFunctionMock(data) : data;
    } else if (fs.existsSync(jsonFile)) {
      // json mock模块
      return JSON.parse(fs.readFileSync(jsonFile).toString('utf-8'));
    }
    return null;
  }

  /**
   * 处理函数mock模块
   */
  handleFunctionMock(handler: any) {
    if (handler['__Off']) {
      this.onceBaseUrl = handler['__Off'];
      return null;
    }
    new RequestMemoryStream(this.request, (chunks: Buffer) => {
      try {
        const request = this.request as any;
        const body = chunks.toString('utf8');
        if (/application\/json/.test(request.headers['content-type']) && body) {
          (<any> this.request).body = JSON.parse(body);
        } else {
          (<any> this.request).body = querystring.parse(body);
        }
        const contextApplication = new ApplicationContext(
          // this.request,
          // this.response
        );
        const parts = url.parse(request.url);
        request.query = request.query || querystring.parse(parts.query || '');
        contextApplication.throwRequired(this.request, handler.parameters);
        const data = handler.apply(contextApplication, [this.request]);
        this.handleLocal(data);
      } catch (ex) {
        console.error(ex.stack);
        this.handleLocal({ stat: { code: -1, message: ex.message } });
      }
    });
    return 'self';
  }

  /**
   * 返回本地的mock数据到客户端
   */
  handleLocal(data: any) {
    const { response } = this;
    response.setHeader('Data-Provider', 'Mock');
    response.setHeader('content-type', 'application/json');
    response.setHeader('access-control-allow-origin', '*');
    response.setHeader(
      'access-control-allow-method',
      'POST, GET, OPTIONS, PUT, DELETE, HEAD'
    );
    response.setHeader('access-control-allow-credentials', 'true');
    if (data && typeof data === 'object' || data instanceof Array) {
      response.write(JSON.stringify(data, null, 4));
    } else {
      response.write(data);
    }
    response.end();
  }

  /**
   * 代理到原始服务器请求网关接口进行接口返回
   */
  handleRemote() {
    const { request, response, next } = this;
    const mRequest = request as any;
    const parts = url.parse(request.url);
    const pathname = this.path.replace(/^\//, '');
    const tempBaseUrl = this.onceBaseUrl === true ? null : this.onceBaseUrl;
    const baseApi = tempBaseUrl || this.getTemplateUrl();
    let baseUrl = /^\/\//.test(baseApi) ? this.protocol + baseApi : baseApi;
    const querys = '?' + parts.query;// : '';
    if (!baseUrl) {
      return next();
    }
    const proxy = httpProxy.createProxyServer({
      target: baseUrl,
      changeOrigin: true,
    });
    this.onceBaseUrl = null;
    // const finalUrl = /^\//.test(baseUrl) ? baseUrl : '/' + baseUrl;
    baseUrl = /\/$/.test(baseUrl) ? baseUrl : baseUrl + '/';
    mRequest.url = mRequest.originalUrl = baseUrl + pathname + querys;
    console.log(`Agent: Proxy Remote -> ${request.url}`);
    proxy.web(request, response, {}, (ex: any) => next(ex));
    const file = this.idModule + '.js';
    const exists = fs.existsSync(file);
    if (this.options?.makeMock && (!exists || this.options.overrite != false)) {
      proxy.on('proxyRes', (proxyRes, req, res) => {
        const chunks = [] as any[];
        proxyRes.on('data', (chunk) => chunks.push(chunk));
        proxyRes.on('end', () => {
          const body = Buffer.concat(chunks);
          res.end();
          const shouldMock = this.options.isRequestError ? !this.options.isRequestError(body, res) : true;
          if (shouldMock) {
            this.generateRemoteMock(proxyRes, body);
          }
        });
      });
    }
  }

  /**
   * 生成本次代理的返回数据，作为mock数据
   * @param proxy
   */
  generateRemoteMock(resp: IncomingMessage, body: Buffer) {
    const contentType = resp.headers['content-type'] || '';
    let data = null;
    if (this.options?.mockTransform) {
      data = this.options.mockTransform(resp, body);
    } else if (contentType.indexOf('application/json') > -1) {
      data = JSON.stringify(JSON.parse(body.toString('utf-8')), null, 2);
    }
    if (data) {
      const file = this.idModule + '.js';
      const bak = file + '.bak';
      const dir = path.dirname(file);
      const chunks = [];
      chunks.push('module.exports = function() { ');
      chunks.push(` return ${data};  `);
      chunks.push('};');
      chunks.push('module.exports.__Off = true;');
      if (fs.existsSync(file) && this.options?.mockBackup == true) {
        console.log('Agent: Backup Mock -> ' + bak);
        fs.renameSync(file, bak);
      }
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
      fs.writeFileSync(file, chunks.join('\n'));
      console.log('Agent: Make Mock -> ' + file);
    }
  }

  /**
   * 获取一个无缓存的模块
   */
  getNoCacheModule(id: string) {
    delete require.cache[require.resolve(id)];
    return require(id);
  }
}

function handleCrosHttpHeaders(req: IncomingMessage, response: any, options?: AgentProxyOptions) {
  if (req.method == 'OPTIONS') {
    response.setHeader('access-control-allow-origin', req.headers.origin);
    response.setHeader(
      'access-control-allow-method',
      'POST, GET, OPTIONS, PUT, DELETE, HEAD'
    );
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
export default function(baseUri: BaseURL) {
  return (req: IncomingMessage, resp: ServerResponse, next: Function) => new AgentProxy(req, resp, next, baseUri, {} as any);
};

export function createResolverProxy(options?: AgentProxyOptions) {
  options = options || { api: 'proxy-api', env: 'cookie-env-api', mode: 'mock' };
  options.mode = options.onlyProxy ? 'proxy' : options.mode || 'mock';
  return (request: any, response: any, next: Function) => {
    const api = request.headers[options.api];
    const env = cookie.parse(request.headers['cookie'] || '')[options.env];
    if (options.mode == 'none') {
      return next();
    } else if (handleCrosHttpHeaders(request, response)) {
      return;
    } else if (api) {
      return new AgentProxy(request, response, next, api, options);
    } else if (env) {
      return new AgentProxy(request, response, next, env, options);
    }
    next();
  };
}
