/**
 * @module Network
 * @name：前端网络接口基础类
 * @description：基于fetch 用于提供全局监听，以及派生业务接口用
 */

// 引入fetch polyfill
import fetch from 'whatwg-fetch';
import stringify from 'qs/lib/stringify';
import Tunnel from '../tunnel/index';
import RequestContext from './context';
import BizError from '../biz-error';
import UseQuery, { GenerateHooks } from './useQuery';
import { HttpMethods, RHttpHeaders, NetworkBaseOptions, ChainResponses, SharedResponse, NetworkExtra } from './types';
import { NetworkEventHandler, NetworkEvents, NetworkOptions, Promiseable } from './types';

let Options = {} as NetworkOptions;
// 创建一个事件容器
const tunnel = Tunnel.create();

// 瞬时共享返回内容
const sharedResponses = [] as SharedResponse[];

const FormData = (<any>self).FormData || function() { };

export default class Network {
  private readonly selfOptions: NetworkBaseOptions;

  // 仅用作测试
  private static sharedResponses = sharedResponses;

  constructor(options?: NetworkBaseOptions) {
    this.selfOptions = options || {};
  }

  /**
   * 接口全局配置
   * @param {Object}  options 全局配置  { base:'',data:{} }
   */
  static config(options: NetworkOptions) {
    Options = options || {};
    if (process.env.NODE_ENV !== 'production') {
      if (Options.mock) {
        // 开启mock服务
        Network.on('options', (context) => {
          context.base = typeof Options.mock == 'string' ? Options.mock : '';
        });
        Network.on('start', (data, context: any) => {
          const segments = Options.base?.replace('//', '@').split('/');
          const origin = segments?.shift()?.replace('@', '//');
          const pathname = segments?.join('/');
          context.url = context.url.indexOf(Options.base) > -1 ? context.url.replace(Options.base, pathname) : pathname + context.url;
          // 通知代理服务器，本次请求目标服务器
          context.headers['x-proxy-api'] = origin;
        });
        if (Options.mock2) {
          document.cookie = `cookie-env-api=${Options.mock2};path=/`;
        }
      }
    }
    UseQuery.setHooks(options.hooks);
    return this;
  }

  /**
   * 添加请求事件监听
   */
  static on(name: 'auth', handler: (data: any, context: RequestContext) => any): typeof Network
  static on(name: 'options', handler: (options: NetworkBaseOptions) => NetworkBaseOptions | void): typeof Network
  static on(name: 'start', handler: (data: any, context: RequestContext) => any): typeof Network
  static on(name: 'response', handler: (response: any, context: RequestContext) => any): typeof Network
  static on(name: 'end', handler: (response: Response | Error, context: RequestContext) => any): typeof Network
  static on(name: 'error', handler: (response: Error) => any): typeof Network
  static on(name: 'try', handler: (context: RequestContext) => any): typeof Network

  /**
   * 添加一个全局监听事件
   * @param {String} name 事件名称 目前支持 response / error
   * @param {Function} handler 响应函数
   * response ：  function(response){    }
   * error: function(error){}
   */
  static on(name: NetworkEvents, handler: NetworkEventHandler) {
    tunnel.pull(name, handler);
    return this;
  }

  /**
   * 移除一个全局监听事件
   */
  static off(name: string, handler?: Function) {
    if (handler) {
      tunnel.off(name, handler);
    } else {
      tunnel.off(name);
    }
    return this;
  }

  /**
   * 触发一个全局事件
   * @param {*} name
   * @param {*} params
   */
  static emit(name: string, ...params: Array<any>) {
    tunnel.push(name, ...params);
  }

  /**
   * 返回可选的query字符串参数
   * @param { Object } 数据对象
   */
  stringifyOptional(data: any) {
    data = data || {};
    const query = Object.keys(data).reduce((query, key) => {
      const v = data[key];
      if (v !== undefined) {
        query[key] = v;
      }
      return query;
    }, {} as any);
    return stringify(query);
  }

  /**
   * 构造一个Hooks查询对象
   */
  useQuery(deps: any[]) {
    return new UseQuery(this, deps) as Omit<GenerateHooks<typeof this>, keyof Network>;
  }

  /**
   * 发送一个get请求
   * @param {String} uri 服务端接口url 可以为完整路径或者相对路径
   * 完整路径例如: https://api.solar-pc/rest/order/submit
   * 相对路径： 相对路径是相对于 Network.config() 配置的 base
   * @param {Object/FormData} 发送的正文数据 ，可以为json对象或者字符串或者FormData
   * @param {Object} headers  发送报文首部配置
   */
  get<T = any>(uri: string, data?: any, headers?: any) {
    return this.any<T>(uri, data, 'GET', headers);
  }

  /**
   * 发送一个post请求
   * @param {String} uri 服务端接口url 可以为完整路径或者相对路径
   * 完整路径例如: https://api.solar-pc/rest/order/submit
   * 相对路径： 相对路径是相对于 Network.config() 配置的 base
   * @param {Object/FormData} 发送的正文数据 ，可以为json对象或者字符串或者FormData
   * @param {Object} headers  发送报文首部配置
   */
  post<T = any>(uri: string, data?: any, headers?: any) {
    return this.any<T>(uri, data, 'POST', headers);
  }

  /**
   * 发送一个网络请求
   * @param uri 服务端接口url 可以为完整路径或者相对路径
   * 完整路径例如: https://api.solar-pc/rest/order/submit
   * 相对路径： 相对路径是相对于 Network.config() 配置的 base
   * @param data 发送的正文数据 ，可以为json对象或者字符串或者FormData
   * @param method 请求类型 例如 Get Post Put Delete 等
   * @param headers  发送报文首部配置
   */
  any<T = any>(uri: string, data?: any, method?: HttpMethods, headers?: any) {
    const context = new RequestContext(uri, method, data, headers);
    const sharedRes = this.findSharedResponse(context);
    if (sharedRes) {
      // 如果是瞬时共享返回，则不进行请求，直接使用返回
      return new AttachResponse<Response, T>(sharedRes.response as Promise<Response>, context, true);
    }
    const promise = Promise
      // 执行前置auth事件
      .resolve(tunnel.push('auth', data, context))
      // 执行start事件
      .then(() => tunnel.push('start', data, context))
      .then(() => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            try {
              this.request(context, resolve, reject);
            } catch (ex) {
              reject(ex);
            }
          }, 20);
        });
      });
    return new AttachResponse<Response, T>(promise as Promise<Response>, context);
  }

  /**
   * 调用response事件
   */
  private callResponseEvent(response: any, context: RequestContext) {
    const handlers = tunnel.getMessageContainer('response');
    let promise = Promise.resolve(response);
    handlers.forEach((handler) => {
      promise = promise.then((res) => {
        res = res === undefined ? response : res;
        return handler(res, context);
      });
    });
    return promise;
  }

  /**
   * 开始进行超时计算
   */
  private fetchTimeout(options: NetworkBaseOptions, context: RequestContext, reject: Function) {
    if (options.timeout > 0) {
      context.fetchTimeoutId = setTimeout(() => {
        context.isCancened = true;
        reject(new BizError(-2000, '网络不给力！请稍后重试'));
      }, options.timeout);
    }
  }

  /**
   * 根据请求上下文查找对应得共享返回
   */
  private findSharedResponse(context: RequestContext): SharedResponse {
    return sharedResponses.find((item) => item.isShared(context));
  }

  /**
   * 发送请求
   * @param {Object} context 请求上下文参数
   */
  private request(context: RequestContext, resolve: Function, reject: Function) {
    const { url, data, method = 'GET', requestContentType } = context;
    const tryRequest2 = this.tryRequest.bind(this, context, reject, resolve);
    const selfOptions = this.selfOptions;
    const mergeOptions = { ...Options, ...selfOptions };
    const results = tunnel.push('options', mergeOptions).filter((n) => !!n);
    const requestOptions = results.length > 0 ? results[0] : mergeOptions;
    // 请求内容类型
    const contentType = requestContentType || requestOptions.contentType || 'application/x-www-form-urlencoded';
    // 如果是FormData 则不设置content-type
    const ct = data instanceof FormData ? null : contentType;
    const headers = this.cleanHeaders({
      'Content-Type': ct,
      // 合并传入的headers 传入的headers会覆盖前面行配置的默认headers
      ...context.headers || {},
    });
    const myFetch = typeof fetch === 'function' ? fetch : window.fetch;
    this.fetchTimeout(requestOptions, context, reject);
    myFetch(combine(url || '', method, data, requestOptions), {
      // 请求谓词
      method,
      // 设置证书类型 omit:不传递cookie same-origin:同源发送cookie include:都发送cookie
      credentials: (context.credentials || 'include') as any,
      // 请求首部
      headers,
      // 请求正文
      body: adapter(data, headers, method),
    })
      .then((response: Response) => {
        clearTimeout(context.fetchTimeoutId);
        // 如果请求被取消掉,则直接返回,不做任何处理
        if (context.isCancened) {
          return new Promise(() => { });
        }
        const { status } = response || {};
        const isOK = status >= 200 && status < 300 || status === 304;
        const cloneData = response.clone();
        context.response = response;
        tunnel.push('end', cloneData, context);
        return isOK ? response.clone() : Promise.reject(new BizError(500, 'http:' + response.status, response));
      })
      .then((response: Response) => {
        if (response[context.responseConvert]) {
          return response[context.responseConvert]();
        }
        return response;
      })
      .then((response: any) => {
        return Promise
          .resolve(this.callResponseEvent(response, context))
          .then((selfResponse) => {
            if (!context.shouldRetry(selfResponse)) {
              resolve(selfResponse === undefined ? response : selfResponse);
            } else if (!tryRequest2()) {
              reject(new BizError(500, 'http:' + response.status, response));
            }
          });
      })
      .catch((error: any) => {
        clearTimeout(context.fetchTimeoutId);
        // 如果请求被取消掉,则直接返回,不做任何处理
        if (context.isCancened) return;
        if (!tryRequest2()) {
          tunnel.push('end', error);
          reject(error);
        }
      });
  }

  /**
   * 清理无效的header
   */
  private cleanHeaders(headers: RHttpHeaders) {
    const emptyKeys = Object.keys(headers).filter((k) => headers[k] == null);
    emptyKeys.forEach((k) => {
      delete headers[k];
    });
    return headers;
  }

  /**
   * 请求重试
   * @param {Function} resolve 成功的回调通知函数
   * @param {Function} reject 失败时的回调通知函数
   * @param {Object} context 请求上下文参数
   * @param {Number} tryProcess 当前尝试的次数
   */
  private tryRequest(context: RequestContext, reject: Function, resolve: Function) {
    if (context.tryNum < context.maxTry) {
      context.tryNum++;
      tunnel.push('try', context);
      this.request(context, resolve, reject);
      return true;
    }
  }
}

/**
 * 链式钩子，用于丰富Network.get/post 返回对象
 */
export class AttachResponse<T, R> extends Promise<T> {
  /**
   * 是否当前返回，为瞬时共享返回数据
   */
  private isSharedResponse: boolean;

  /**
   * 原始promise
   */
  private nativePromise: Promise<any>;

  /**
   * 当前链式调用下，过程中产生的所有错误
   */
  private errors: Array<Error>;

  /**
   * 是否静默模式，在静默模式下，当请求出现异常时，
   * 不会触发error事件
   */
  private silently: boolean;

  /**
   * 所有并发请求的请求结果
   */
  private mergeResponses: ChainResponses;

  /**
   * 当前请求上下文
   */
  public readonly reqContext: RequestContext;

  /**
   * 当前promise链
   */
  private promise: Promise<T>;

  constructor(promise: Promise<T>, context: RequestContext, isSharedResponse?: boolean) {
    super(() => { });
    this.mergeResponses = {} as ChainResponses;
    this.isSharedResponse = isSharedResponse;
    this.reqContext = context;
    this.promise = promise;
    this.nativePromise = promise;
    this.errors = [];
    const finnalyPush = (data: any) => {
      this.cancelShare();
      const e = this.errors.pop();
      if (e && !this.silently) {
        tunnel.push('error', e);
      }
      return data;
    };
    const errorWrapper = (e: any) => {
      this.errors.push(this.createError(e));
      finnalyPush(e);
      return Promise.reject(e);
    };
    setTimeout(() => this.then(finnalyPush, errorWrapper), 10);
  }

  /**
   * 设定请求内容类型
   * @param contentType
   */
  with(contentType: string) {
    this.reqContext.requestContentType = contentType;
    return this;
  }

  /**
   * 添加一个请求回调，在请求完成后触发
   * @param {Function} success 请求成功响应函数
   * @param {Function} error  请求失败响应函数
   * @returns this self
   */
  then<TResult = T, TResult2 = never>(success: ((data: T) => TResult | PromiseLike<TResult>) | undefined | null, error?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null, keep?: boolean): AttachResponse<TResult | TResult2, R> {
    const errorWrapper = (result: any) => {
      // 将产生的异常推入数组
      this.errors.push(this.createError(result));
      if (result) result['@@reason'] = 'network';
      if (typeof error === 'function') {
        // 如果自定义了异常，则按照catch处理
        const res = error(result);
        return keep ? Promise.reject(res) : res;
      }
      // 如果没有设置error处理，则继续抛出异常
      return Promise.reject(result);
    };
    this.promise = (this.promise.then(success, errorWrapper)) as any;
    return (this as unknown) as AttachResponse<TResult, R>;
  }

  /**
   * 添加一个请求异常捕获回调
   * @param {Function} errorHandle 异常处理函数
   * @returns this self
   */
  catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): AttachResponse<T | TResult, R> {
    this.then((a) => a, onrejected as any);
    return this;
  }

  /**
   * 本次接口显示悬浮的Loading效果
   * @param {String} message loading效果显示的文案 默认为：请稍后...
   * @param {Number} options 额外配置参数
   * @returns this self
   */
  showLoading(message?: string, options?: any) {
    if (typeof Options.loading === 'function') {
      this.complete(Options.loading(message, options), true);
    }
    return this;
  }

  finally(callback: () => void) {
    return this.complete(callback);
  }

  /**
   * 回调处理，不管是成功还是失败，都出发该回调
   * @param  {Function} callback 回调函数
   */
  complete(callback: () => void, keep?: boolean) {
    const onlyCallback = (data: any) => {
      typeof callback === 'function' && callback();
      return data;
    };
    this.then(onlyCallback, onlyCallback, keep);
    return this;
  }

  /**
   * 设定返回json数据
   */
  json() {
    this.reqContext.responseConvert = 'json';
    return (this as any) as AttachResponse<R, R>;
  }

  /**
   * 设定返回text数据
   */
  text() {
    this.reqContext.responseConvert = 'text';
    return (this as any) as AttachResponse<string, R>;
  }

  /**
   * 返回blob类型
   * @returns
   */
  blob() {
    this.reqContext.responseConvert = 'blob';
    return (this as any) as AttachResponse<Blob, R>;
  }

  /**
   * 返回arrayBuffer数据
   * @returns
   */
  arrayBuffer() {
    this.reqContext.responseConvert = 'arrayBuffer';
    return (this as any) as AttachResponse<ArrayBuffer, R>;
  }

  /**
   * 标识当前请求为静默模式
   * 在静默模式下，当请求出现异常时，
   * 不会触发error事件
   */
  silent() {
    this.silently = true;
    return this;
  }

  /**
   * 以安全的方式处理返回结果处理函数
   */
  isBodyReadable(response: any, name: string) {
    return response && typeof (response[name]) === 'function' && !response.bodyUsed;
  }

  /**
   * 合并其他请求
   * @param {Promise} promise 其他请求返回的promise
   * @param {String} name 当前合并请求的结果附加的属性名称
   */
  merge<MT = any>(promise: AttachResponse<MT, R> | Promise<MT> | Promiseable, name: string) {
    if (name === 'original') {
      throw new Error('name参数不能为original,改名称为默认返回值');
    }
    interface TReturn {
      // 保证T 始终指向本次请求的返回类型T
      original: T extends { original: any } ? T['original'] : T
      [propName: string]: any
    }
    const chainResponses = this.mergeResponses;
    return this.then((response) => {
      if (!chainResponses.original) {
        chainResponses.original = response;
      }
      return (promise as Promise<MT>).then((afterResponse: any) => {
        chainResponses[name] = afterResponse;
        return chainResponses as any;
      }) as any;
    }) as AttachResponse<TReturn, R>;
  }

  /**
   * 开启重试机制
   * 当网络访问失败时，进行重试
   * @param {Number} max 重试最大的次数 默认值=1
   * @param {Function} errorAssert 需要进行重试的条件函数,默认重试条件为:请求网络错误
   *         例如: function(response){ return response.status!=200  };
   *
   */
  try(max = 1, errorAssert?: () => boolean) {
    this.reqContext.tryable = true;
    this.reqContext.maxTry = max;
    if (typeof errorAssert === 'function') {
      this.reqContext.tryAssertFunc = errorAssert;
    }
    return this;
  }

  /**
   * 设置本次接口禁止发送cookie
   */
  noCookie() {
    this.reqContext.credentials = 'omit';
    return this;
  }

  /**
   * 设置证书类型
   * omit:不传递cookie
   * same-origin:同源发送cookie
   * include:都发送cookie
   */
  credentials(credentials: 'omit' | 'same-origin' | 'include') {
    this.reqContext.credentials = credentials;
    return this;
  }

  /**
   * 停止分享
   */
  private cancelShare() {
    const item = sharedResponses.find((m) => m.sharer === this);
    if (item && item.persistent == false) {
      // 非持久化的，在请求结束后允许移除
      // 移除瞬时共享返回
      sharedResponses.splice(sharedResponses.indexOf(item), 1);
    }
  }

  /**
   * 瞬时共享返回处理
   * 瞬时共享模式下： 只允许一个请求发出，在请求返回过程中，并发出的请求统一使用第一个请求的结果
   * @param sharedKeyFunction 一个函数，用于设置共享请求的key,默认使用请求的url作为key
   */
  shared(sharedKeyFunction = (req: RequestContext) => req.url, persistent = false) {
    if (!this.isSharedResponse) {
      const sharedKey = sharedKeyFunction(this.reqContext);
      // 设置共享返回
      sharedResponses.push({
        sharer: this,
        // 是否内存持久化
        persistent: persistent,
        // 是否共享
        isShared: (income: RequestContext) => sharedKeyFunction(income) === sharedKey,
        response: Promise.resolve(this.nativePromise).then(() => this.reqContext.response.clone()).then((response: Response) => {
          if (response[this.reqContext.responseConvert]) {
            return response[this.reqContext.responseConvert]();
          }
          return response;
        }),
      });
    }
    return this;
  }

  /**
   * 设置请求上下文参数，主要用于在全局事件中做相关操作
   */
  setExtra(options: NetworkExtra) {
    this.reqContext.extra = options || { type: 'default' };
    return this;
  }

  createError(error: any) {
    let ex = null as BizError;
    if (error instanceof Error || error.message) {
      ex = new BizError('code ' in error ? error.code : -1, error.message || 'error', error.data || error); error;
    } else if (typeof error === 'string') {
      ex = new BizError(-1, error);
    } else if (error) {
      ex = new BizError(-1, 'error', error);
    }
    if (ex) {
      ex.reason = 'network';
    }
    return ex;
  }
}

/**
 * 根据请求报文的ContentType来适配发送正文的形态
 * @param {Object} data 发送的数据
 * @param {Object} headers 请求首部
 * @param {String} method 请求类型
 */
function adapter(data: any, headers: RHttpHeaders, method: string) {
  if (['get', 'head'].indexOf(method.toLowerCase()) < 0) {
    data = merge(data, Options.data);
    const ct = headers['Content-Type'];
    switch (ct) {
      case 'application/json':
        return JSON.stringify(data);
      case 'application/x-www-form-urlencoded':
        return formdata(data);
      default:
        // 其他类型，默认直接范围原始data
        return data;
    }
  }
}

/**
 * 合并全局参数
 * @param {Object} data 请求参数
 * @param {Object} merge 全局参数
 */
function merge(data: any, merge: any) {
  if (Array.isArray(data)) {
    return data;
  }
  data = data || {};
  merge = merge || {};
  if (!(data instanceof FormData)) {
    return { ...merge, ...data };
  }
  Object.keys(merge).forEach((k) => {
    if (!data.get(k)) {
      data.append(k, merge[k]);
    }
  });
  return data;
}

/**
 * 合并uri
 * @param {String} uri 请求的uri路径
 * @param {String} method 请求类型
 * @param {Object} data 请求数据
 */
function combine(uri: string, method: string, data: any, requestOptions: any) {
  if (!/(https:|http:|\/\/)/.test(uri) && requestOptions.base) {
    uri = requestOptions.base + uri;
  }
  data = merge(data, requestOptions.data);
  const m = method.toLowerCase();
  const isQuery = m === 'get' || m === 'delete';
  const search = isQuery ? stringify(data) : '';
  const char = uri.indexOf('?') > -1 ? '&' : '?';
  return search.length > 0 ? uri + char + search : uri;
}

/**
 * 适配FormData参数
 * @param {Object} data
 * FormData: h5全局对象可传递复杂对象数据例如 二进制流，键值对等信息
 */
function formdata(data: any) {
  if (!(data instanceof FormData)) {
    return stringify(data);
  }
  return data;
}