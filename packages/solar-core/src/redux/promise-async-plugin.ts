/**
 * @module PromiseAsync
 */
import { Network, BizError } from 'solar-core';

export default function createPromiseAsync(suffix = 'Success', failSuffix = 'Error') {
  return {
    onModel(model: any, store: any) {
      const effects = store.dispatch[model.name];
      const dispatch = store.dispatch.bind(this);
      const reducers = model.reducers || {};
      Object.keys(model.effects || {}).forEach((key) => {
        const name = model.name + '/' + key;
        const handler = effects[key];
        const topFailure = 'onCatchError';
        effects[key] = function(...params: any[]) {
          const promise = handler.call(this, ...params);
          // dispatch(`${name}Loading`, params);
          Promise.resolve(promise).then(
            // 成功
            (payload) => dispatch({ type: `${name}${suffix}`, payload }),
            // 失败
            (ex) => {
              const silent = 'onError';
              const shouldEmit = ex && ex['@@reason'] !== 'network';
              if (shouldEmit) {
                console.error(ex);
              }
              if (reducers[silent]) {
                // 无论如何都执行的
                dispatch({ type: `${model.name}/${silent}`, payload: { name: key, error: ex } });
              }
              if (!reducers[`${key}${failSuffix}`] && !reducers[topFailure]) {
                // 全局异常提示
                shouldEmit && Network.emit('error', new BizError(-9001, ex.message || '', ex));
              } else if (reducers[topFailure]) {
                // 单个model 异常捕获
                dispatch({ type: `${model.name}/${topFailure}`, payload: { name: key, error: ex } });
              } else {
                // 单个action fail
                dispatch({ type: `${name}${failSuffix}`, payload: ex });
              }
            }
          );
        };
      });
    },
  };
}
