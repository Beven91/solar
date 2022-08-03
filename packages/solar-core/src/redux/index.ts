import createPromiseAsync from './promise-async-plugin';

function createStateToProps(model: any, mapStateToProps: any) {
  return (state: any, props: any) => {
    return mapStateToProps ? mapStateToProps(state, props) : state[model.name];
  };
}

function createDispatchToProps(model: any, mapDispatchToProps: any) {
  return (dispatches: any, props: any) => {
    return mapDispatchToProps ? mapDispatchToProps(dispatches, props) : dispatches[model.name];
  };
}

function createConnect(store: any, connect: Function) {
  return (model: any, mapStateToProps?: any, mapDispatchToProps?: any) => {
    store.addModel(model);
    mapStateToProps = createStateToProps(model, mapStateToProps);
    mapDispatchToProps = createDispatchToProps(model, mapDispatchToProps);
    return (component: any) => {
      return connect(mapStateToProps, mapDispatchToProps)(component);
    };
  };
}

type ReducerParameters<T extends (state: any, ...args: any) => any> = T extends (state: any, ...args: infer P) => any ? P : never;

type EffectParameters<T extends (data: any, tree?: any) => any> = T extends (data: infer P, d?: any) => any ? P : never;

type GenerateReducer<T extends { [propName: string]: (...args: any[]) => void }> = {
  [P in keyof T]: (...args: ReducerParameters<T[P]>) => void
}

type GenerateEffects<T extends { [propName: string]: (...args: any[]) => void }> = {
  [P in keyof T]: Parameters<T[P]> extends [data: any, ...data2: any] ? (data: EffectParameters<T[P]>) => void : () => void
}

export type RematchModelTo<T extends Record<string, any>> = GenerateEffects<T['effects']> & T['state'] & GenerateReducer<T['reducers']>

export type RematchThis<T extends Record<string, any>> = GenerateEffects<T['effects']> & GenerateReducer<T['reducers']>

export default {
  createPromiseAsync,
  createConnect,
};


