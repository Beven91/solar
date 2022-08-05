import type { AttachResponse } from './index';
import RequestContext from './context';

export type NetworkEvents = 'start' | 'end' | 'response' | 'error' | 'try' | 'auth' | 'options'

export type HttpMethods = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface NetworkReactHooks {
  useEffect: (handler: Function, deps: any[]) => any
  useState: any
}

export interface NetworkBaseOptions {
  // 请求基础地址，值为空，则为相对路径
  base?: string,
  // 设置所有请求超时时间 当值>0 会开启超时检测
  timeout?: number
  // 给每个请求额外添加的请求参数
  data?: object,
  // 统一指定请求内容类型，默认:application/x-www-form-urlencoded
  contentType?: string
  // 是否开启mock服务
  mock?: boolean
  // 第二条mock通道
  mock2?: string
  // 配置hooks
  hooks?: NetworkReactHooks
}

type cancelLoading = () => void;

export interface NetworkOptions extends NetworkBaseOptions {
  /**
   * 为请求指定loading效果的函数，该函数会在发起请求时，调用了showLoading函数时触发
   * 例如:
   * ```js
   *  (new Network()).get('/pull').showLoading('请稍后');
   *
   * ```
   */
  loading?: (message: string, options?: any) => cancelLoading,
}

export interface RHttpHeaders {
  [propName: string]: string
}

export interface ChainResponses {
  original: any,
  [propName: string]: any
}

export type NetworkEventHandler = (data: any, context: RequestContext) => void

export type Promiseable = {
  then: (handler: Function, handler2?: Function) => Promiseable,
  catch: (handler: Function) => Promiseable
}

export type IsSharedFnction = (req: RequestContext) => boolean

export interface SharedResponse {
  response: Promise<any>
  sharer: AttachResponse<any, any>
  // 是否持久化
  persistent: boolean
  isShared: IsSharedFnction
}