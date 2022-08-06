import type Network from './index';
import type { AttachResponse } from './index';
import { NetworkReactHooks } from './types';

export interface HooksResponse<T> {
  /**
   * 当前hooks状态
   * loading: 当前接口正在请求中
   * error: 当前接口请求结果异常
   * ok: 当前接口请求结果正常
   */
  status: 'loading' | 'error' | 'ok'
  // 强制重新发起接口请求
  refresh: () => void
  // 当前接口返回结果
  response: T
}

export type GenerateHooks<T> = {
  [P in keyof T]: T[P] extends (...args: any[]) => AttachResponse<infer M, any> ? (...args: Parameters<T[P]>) => HooksResponse<M> : T[P]
}

let hooks: NetworkReactHooks = {} as NetworkReactHooks;

// 代理请求函数
const proxyToHook = (handler: Function, deps:any[]) => {
  return (...args: any[]) => {
    const { useEffect, useState } = hooks;
    const [state, setState] = useState({
      response: null,
      status: 'loading',
    });

    const initQuery = () => {
      Promise
        .resolve(handler(...args))
        .then((res) => {
          setState({ status: 'ok', response: res });
        })
        .catch(() => {
          setState({ status: 'error' });
        });
    };
    useEffect(initQuery, deps || args || []);
    return {
      ...state,
      refresh: () => initQuery(),
    };
  };
};

export default class UseQuery<T extends Network> {
  [x: string | symbol]: (...args: any[]) => HooksResponse<any>

  static setHooks(options: NetworkReactHooks) {
    hooks = options;
  }

  constructor(instance: T, deps:any[]) {
    const allKeys = Reflect.ownKeys(instance.constructor.prototype);
    allKeys.forEach((key) => {
      let handler = (instance as any)[key];
      if (typeof handler == 'function' && key !== 'constructor') {
        handler = handler.bind(instance);
        this[key] = proxyToHook(handler, deps);
      }
    });
  }
}