/**
 * @module JssdkWrapper
 * @description 动态bridge，主要提供一个bridge的加载与执行器，同时支持bridge函数转链接化支持。
 */
import awaitQueue from '../helper/await-queue';
import { JssdkOptions } from './jssdk';

const DYNAMIC_BRIDGE = 'DYNAMIC_BRIDGE';

export default class JssdkWrapper {
  public readonly options: JssdkOptions

  public native: any

  public get name() {
    return this.options.name;
  }

  /**
   * 当前jssdk支持的解析名
   */
  public readonly protocol: string

  /**
   * 构造一个动态bridge
   * @param {Options} options
   * ```js
   *  {
        // 判断当前宿主环境是否能使用当前jssdk
        match() {
          return /PAHealth/.test(navigator.userAgent);
        },
        // 目标jssdk的js资源地址,或者设定 local:// 表示当前jssdk不需要加载外部js
        url: 'https://xxx',
        // 自定义协议， 可以将目标jssdk的函数调用转换成 sheme链接方式
        protocol: 'zeb:',
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
    ```
   */
  constructor(options: JssdkOptions) {
    this.options = options;
    // 当前目标bridge的实例
    this.native = null;
    // 协议支持
    this.protocol = options.protocol;
    // 加载目标bridge
    this
      .loadJssdk(options.url)
      .then((native: any) => {
        this.native = native;
        return (options.onInitialize && options.onInitialize(native));
      })
      .then(() => {
        // 执行等待期的队列
        awaitQueue.doneAwait(DYNAMIC_BRIDGE);
      });
  }

  // 加载脚本
  static loadScript(url: string) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.onload = resolve;
      script.onerror = reject;
      script.src = url;
      document.head.appendChild(script);
    });
  }

  /**
   * 根据名称获取指定
   * @param {*} name
   */
  getMethod(name: string) {
    const methods = this.options.methods || {};
    const handler = methods[name];
    if (typeof handler === 'function') {
      return handler;
    }
    return this.native[methods[name] as string];
  }

  /**
   * 执行一个动态bridge函数
   */
  callNative(name: string, params?: any) {
    if (!this.native) {
      // 如果jssdk还没有加载完毕，则将操作添加到队列中
      return awaitQueue.doAwait(DYNAMIC_BRIDGE, () => this.callNative(name, params));
    }
    // 获取当前要调用的方法信息
    const method = this.getMethod(name);
    if (!method || typeof method !== 'function') {
      const message = `solar:当前环境jssdk无此函数:${name}`;
      console.warn(message);
      return Promise.reject({ message, code: -103 });
    }
    // 如果当前method定义为函数,则使用该函数，否则从jssdk实例中获取，一些bridge函数的特殊回调处理，推荐返回promise
    const handler = typeof method === 'function' ? method : this.native[method];
    return new Promise((resolve) => {
      resolve(handler.call(this.native, params));
    });
  }

  /**
   * 判断当前url是否为一个可执行的jssdk URL
   * @param {*} url
   */
  isSdkUrl(url: string) {
    url = url || '';
    const index = url.indexOf('://');
    const protocol = index > -1 ? url.slice(0, index) : '';
    return protocol === this.protocol || protocol === 'jssdk';
  }

  // 加载bridge
  loadJssdk(url: string) {
    if (url === 'local://' || !url) {
      return Promise.resolve({
        local: true,
      });
    }
    const options = this.options;
    return JssdkWrapper.loadScript(url).then(
      () => options.getInstance(),
      (ex) => {
        console.error('加载bridge失败:' + url);
        return Promise.reject(ex);
      }
    );
  }
}
