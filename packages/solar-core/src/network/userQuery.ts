import type Network from './index';
import type { AttachResponse } from './index';
import { NetworkReactHooks } from './types';

interface HookResponse<T> {
  status: 'loading' | 'error' | 'ok'
  response: T
}

export type GenerateHooks<T> = {
  [P in keyof T]: T[P] extends (...args: any[]) => AttachResponse<infer M, any> ? (...args: Parameters<T[P]>) => HookResponse<M> : T[P]
}

let hooks: NetworkReactHooks = {} as NetworkReactHooks;

const proxyToHook = (handler: Function, deps: any[]) => {
  return (...args: any[]) => {
    const { useEffect, useState } = hooks;
    const [state, setState] = useState({ status: 'loading', response: null });
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

    useEffect(initQuery, deps || []);
    return state;
  };
};

export default class UseQuery<T extends Network> {
  [x: string | symbol]: (...args: any[]) => HookResponse<any>

  static setHooks(options: NetworkReactHooks) {
    hooks = options;
  }

  constructor(instance: T, deps: any[]) {
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