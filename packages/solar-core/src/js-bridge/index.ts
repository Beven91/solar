import Client from './client/client';
import JssdkWrapper from './client/jssdk-wrapper';
import paramsParser from './helper/params-parser';
import awaitQueue from './helper/await-queue';
import { JssdkOptions } from './client/jssdk';

const TOP_LEVEL = 'top-level';

class JavascriptBridge {
  Client: typeof Client

  /**
   * 当前jssdk状态
   */
  status: 'init' | 'loading' | 'ok'

  /**
   * 当前已经匹配到的jssdk
   */
  jssdk: JssdkWrapper

  /**
   * 当前注册的默认jssdk
   * 默认jssdk，在匹配的jssdk执行失败时，会执行默认jssdk对应函数
   * 可通过  registerDefault 来注册默认jssdk
   */
  defaultJssdk: JssdkWrapper

  constructor() {
    this.Client = Client;
    this.jssdk = null;
    this.defaultJssdk = null;
    this.status = 'init';
  }

  // 是否正在等待中
  get isAwaiting() {
    return this.status === 'init' || this.status === 'loading';
  }

  // 获取当前平台名
  get platform() {
    const bridge = this.jssdk || this.defaultJssdk;
    return bridge ? bridge.name : '';
  }

  /**
   * 启用jssdk平台，
   * @param {*} url jssdk平台资源下载地址
   */
  enable(url: string) {
    if (this.status === 'init') {
      this.status = 'loading';
      this.loadScript(url).then(() => {
        this.status = 'ok';
        // 执行队列
        awaitQueue.doneAwait(TOP_LEVEL);
      });
    }
  }

  /**
   * 注册一个动态jsbridge
   * @param {Options} options
   *  {
        // 判断当前宿主环境是否能使用当前jssdk
        match() {
          return /PAHealth/.test(navigator.userAgent);
        },
        // 目标jssdk的js资源地址,或者设定 local:// 表示当前jssdk不需要加载外部js
        url: 'https://xxx',
        // 自定义协议， 可以将目标jssdk的函数调用转换成 sheme链接方式
        protocol: 'demo:',
        // 获取引入jssdk实例的函数
        getInstance() {
          return window.mysdk;
        },
        // 映射函数
        methods: {
          // key: closeWebview jsbridge代理函数名，用于对应fe-js-bridge中已定义的行为函数
          closeWebview: {
            // 当调用fe-js-bridge调用closeWebview时，实际会调用的 url中引入的jssdk的对应函数
            sdk: 'myClose',
          },
        },
      };
   */
  register(options: JssdkOptions) {
    // 如果当前已存在注册bridge,或者options=null 则直接跳过
    if (!options || this.jssdk) {
      return;
    }
    if (typeof options.match !== 'function') {
      throw new Error('请提供match函数，返回一个boolean值，表示当前宿主环境该bridge是否可用');
    }
    if (options.match(navigator.userAgent)) {
      // 如果当前bridge可用，则开始初始化
      this.jssdk = new JssdkWrapper(options);
    }
  }

  /**
   * 注册一个默认的bridge 用于垫底使用，当当前环境的bridge执行失败时，会执行垫底bridge函数
   * @param {*} options
   */
  registerDefault(options: JssdkOptions) {
    if (!options) {
      return;
    }
    if (this.defaultJssdk) {
      return console.warn(`solar,注册defaulter(${options.name})失败,当前已经存在defaulter:${this.defaultJssdk.name}`);
    }
    this.defaultJssdk = new JssdkWrapper(options);
  }

  /**
   * 通过bridge调用原生的某个函数
   */
  callNative(name: string, params?: any) {
    if (this.isAwaiting) {
      // 如果是bridge在加载中，则将执行放入队列
      return awaitQueue.doAwait(TOP_LEVEL, () => this.callNative(name, params));
    }
    let promise = null;
    if (!this.jssdk) {
      // 当前不存在可用的bridge
      const message = `solar: 当前环境(${this.platform})下无bridge定义`;
      console.warn(message);
      promise = Promise.reject({ message, code: -9800 });
    } else {
      console.log('执行', name);
      console.log('参数', params);
      // 正常调用
      promise = Promise.resolve(this.jssdk.callNative(name, params));
    }
    // 如果执行出错，这里走默认的异常处理函数，可以进行统一垫底
    return promise.catch((ex) => this.defaultErrorHandle(name, params, ex));
  }

  /**
   * 根据自定义协议，调用bridge
   * @param {*} url 自定义协议url 例如: solar://closeWebview?param=ss
   */
  callUrl(url: string) {
    if (this.isAwaiting) {
      // 如果是bridge在加载中，则将执行放入队列
      return awaitQueue.doAwait(TOP_LEVEL, () => this.callUrl(url));
    }
    let promise = null;
    // 解析url中的参数
    const { protocol, params, method } = paramsParser.parseUrl((url || '').toString());
    // 如果存在bridge 则匹配协议是否正确
    if (this.jssdk && protocol !== this.jssdk.protocol && protocol !== 'jssdk') {
      // jssdk: 为通用协议，默认会先匹配协议，如果协议不是通用协议，则会返回执行失败
      promise = Promise.reject({ code: -101, message: '协议:' + protocol + '无法通过当前bridge协议:' + protocol + '执行' });
    } else if (this.jssdk) {
      // 协议匹配，则开始调用
      console.log('执行url', url);
      console.log('参数', params);
      promise = this.jssdk.callNative(method, params);
    } else {
      // 当前没有bridge
      promise = Promise.reject({ message: '当前环境无jssdk', code: -102 });
    }
    return promise.catch((ex) => this.defaultErrorHandle(method, params, ex));
  }

  /**
 * 判断当前url是否为一个可执行的jssdk URL
 * @param {*} url
 */
  isSdkUrl(url: string) {
    if (this.jssdk) {
      return this.jssdk.isSdkUrl(url);
    } else if (this.defaultJssdk) {
      return this.defaultJssdk.isSdkUrl(url);
    }
    return false;
  }

  /**
   * 加载script
   */
  loadScript(url: string) {
    return JssdkWrapper.loadScript(url);
  }

  /**
   * 在执行bridge函数出错时，经过当前默认异常处理，（不包含：当前要调用的函数不存在异常)
   * 添加默认垫底处理
   * @param {*} name 当前调用bridge函数
   */
  defaultErrorHandle(name: string, params: any, ex: any) {
    const defaultMethod = this.defaultJssdk ? this.defaultJssdk.getMethod(name) : null;
    if (defaultMethod) {
      return this.defaultJssdk.callNative(name, params);
    }
    return Promise.reject(ex);
  }
}

export default new JavascriptBridge();
