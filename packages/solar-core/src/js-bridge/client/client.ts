/**
 * @name Client
 * @description 一个复合工具，提供调用native相关方式的辅助类
 */

interface NamedCallbacks {
  [propName: string]: Array<Function>
}

type Callbackable = boolean | ((...params: Array<any>) => boolean);

const windowRoot = window as any;

export default class Client {
  public name: string

  private __callbackCnt: number

  // 命名型回调函数
  private namedCallbacks: NamedCallbacks

  constructor(name: string) {
    this.name = name;
    this.__callbackCnt = 0;
    this.namedCallbacks = {};
    this.print('use jsbridge ' + this.name);
  }

  /**
   * 获取置顶分类下的所有回调函数
   * @param {*} name 分类名
   */
  getCallbacks(name: string) {
    return this.namedCallbacks[name];
  }

  // 移除指定分类回调下的回调函数
  removeIdCallback(name: string, handler: Function) {
    const callbacks = this.getCallbacks(name);
    const callback = callbacks.find((c) => c == handler);
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
    if (callbacks.length < 1) {
      delete this.namedCallbacks[name];
      this.resetCallback(name);
    }
  }

  // 重置全局回调
  resetCallback(name: string) {
    const callback = windowRoot[name];
    callback ? windowRoot[name] = callback.originalCallback : undefined;
  }

  /**
   * 注册统一模式回调机制,
   * @param {String} name App在回调时，固定调用的函数名 例如: pajkCallBackMessage
   */
  registerCallback(name: string) {
    // 原始 回调函数 用于兼容上下文
    const originalCallback = windowRoot[name];
    if (originalCallback) {
      console.warn('solar', `registerCallback 在window上已存在名称为${name}的回调函数，请检查是否会有冲突`);
    }
    // 开辟回调空间
    this.namedCallbacks[name] = this.namedCallbacks[name] || [];
    // 注册回调机制
    windowRoot[name] = (...params: Array<any>) => {
      const callbacks = this.getCallbacks(name) || [];
      // 执行回调
      callbacks.forEach((callback) => callback(...params));
      // 兼容上下文 如果在当前插件被应用前，已存在 回调设置
      originalCallback && originalCallback(...params);
    };
    // 附加原始函数
    windowRoot[name].originalCallback = originalCallback;
  }

  /**
   * 添加一个回调调监听
   * @param name 回调函数名
   * @param callbackable 回调断言，当符合条件是，进行注册的回调函数处理，否则不满足则不进行调用
   * @param timeout 超时时间，单位 毫秒 当超过设定的时间，则返回一个失败结果
   * @param isGlobal 是否为全局监听
   * @param callback2 恒定回调函数 (返回的promise.then仅触发一次，需要恒定调用，可以使用此参数)
   */
  addCallback(name: string, callbackable: Callbackable, timeout: number, isGlobal: boolean, callback2: Function) {
    return new Promise((resolve, reject) => {
      if (isGlobal) {
        // 全局模式，这里需要删除之前的监听
        this.resetCallback(name);
        delete this.namedCallbacks[name];
      }
      // 如果没有注册过回调队列
      if (!this.getCallbacks(name)) {
        this.registerCallback(name);
      }
      const callback = (...params: Array<any>) => {
        try {
          // 当指定回调断言，时需要断言通过才会执行后续
          const handler = callbackable as Function;
          if (!callbackable || handler(...params)) {
            // 移除当前回调函数
            removeCallback();
            callback2 && callback2();
            resolve([...params]);
          }
        } catch (ex) {
          console.error(ex);
          reject(ex);
        }
      };
      const removeCallback = () => {
        // 在全局模式下，不进行移除
        if (!isGlobal) {
          // 移除当前回调函数
          this.removeIdCallback(name, callback);
        }
      };
      this.getCallbacks(name).push(callback);
      if (timeout > 0) {
        // 超时处理
        setTimeout(() => {
          // 删除回调
          reject({ message: 'timeout', code: -9802 });
          removeCallback();
        }, (timeout));
      }
    });
  }

  /**
   * 获取一个唯一的回调id
   */
  createCallbackId() {
    return '__js_bridge_callback_' + Math.floor(Math.random() * 2e9) + '' + this.__callbackCnt++;
  }

  /**
   * 通过调用scheme url 来调用native函数
   * @param url scheme地址
   * @param useLocation 是否使用location来调用
   */
  dispatchProtocol(url: string, useLocation?: boolean) {
    this.print(`dispatch schema ${url}`);
    if (useLocation) {
      return location.href = url;
    }
    const joinChar = url.indexOf('?') > -1 ? '&' : '?';
    let iframe = document.createElement('iframe');
    iframe.setAttribute('src', `${url}${joinChar}_=${new Date()}`);
    iframe.setAttribute('style', 'display:none');
    iframe.setAttribute('height', '0px');
    iframe.setAttribute('width', '0px');
    iframe.setAttribute('frameborder', '0');
    document.body.appendChild(iframe);
    setTimeout(() => {
      iframe.parentNode.removeChild(iframe);
      iframe = null;
    }, 30);
  }

  /**
   * android下调用native适配函数
   */
  dispatchAndriod(url: string, ...params: Array<any>) {
    return this.dispatchProtocol(url, ...params);
  }

  /**
   * 在iOS下调用native适配函数
   */
  dispatchiOS(url: string, ...params: Array<any>) {
    return this.dispatchProtocol(url, ...params);
  }

  /**
   * 执行native函数
   * 注意：当前函数会根据环境来执行 dispatchAndriod 或者 dispatchiOS
   */
  dispatch(url: string, ...params: Array<any>) {
    if (/Android/i.test(navigator.userAgent)) {
      return this.dispatchAndriod(url, ...params);
    } else if (/iPhone|iPad/i.test(navigator.userAgent)) {
      return this.dispatchiOS(url, ...params);
    }
    return this.dispatchProtocol(url, ...params);
  }

  // 输出日志
  print(message: string) {
    console.log('[solar]: ', this.name, message);
  }
}
