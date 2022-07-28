/**
 * @module Adapter
 * @description 对象函数适配工具
 */

interface NKeys {
  [propName: string]: boolean
}

interface AdaptorProps {
  [propName: string]: any
}

export default class Adapter {
  /**
   * 对象函数适配器
   */
  static adapterObject(source: any, from: any) {
    const keys = Object.keys(from);
    for (const k of keys) {
      const handler = from[k] as any;
      if (typeof handler === 'function') {
        this.adapterFunction(source, k, handler);
      }
    }
    return source;
  }

  /**
   * 适配函数
   */
  static adapterFunction(source: any, name: string, handler: Function) {
    const originalFunction = source[name];
    source[name] = function(...params: Array<any>) {
      if (typeof originalFunction === 'function') {
        handler.call(this, ...params);
        return originalFunction.call(this, ...params);
      }
      return handler.call(this, ...params);
    };
  }

  /**
   * 将函数转换成一个延迟调用的函数
   */
  static delayFunction(source: any, name: string) {
    const handler = source[name];
    const calls = { called: false, cancel: false, params: [] as Array<any> };
    if (typeof handler !== 'function') {
      return (a: any) => a;
    }
    source[name] = function(...params: Array<any>) {
      if (calls.cancel === true) {
        // 如果取消延迟调用，则直接调用原始函数
        return handler(...params);
      }
      calls.called = true;
      // 记录最后一次调用信息，以供后面代码返回的函数，调用原始函数时使用
      calls.params = params;
    };
    return function(cancel: boolean) {
      calls.cancel = cancel;
      if (calls.called) {
        handler(...calls.params);
      }
    };
  }

  /**
   * 转换一批函数为延迟调用函数
   */
  static delayFunctions(source: any, nameList: Array<string>) {
    const delayHandlers = (nameList || []).map((n) => this.delayFunction(source, n));
    return (cancel?: boolean) => {
      delayHandlers.forEach((handler) => handler(cancel));
    };
  }

  /**
   * 排除掉props中，指定属性值
   * @param props
   * @param ignores
   */
  static filter(props: AdaptorProps, ...ignores: Array<string>) {
    const filtedProps = {} as AdaptorProps;
    const ignoreKeys = {} as NKeys;
    ignores.forEach((k) => ignoreKeys[k] = true);
    Object
      .keys(props || {})
      .filter((k) => !ignoreKeys[k])
      .forEach((k) => filtedProps[k] = props[k]);
    return filtedProps;
  }
}
