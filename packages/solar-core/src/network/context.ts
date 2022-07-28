/**
 * @module RequestContext
 * @description 请求上下文
 */
import { RHttpHeaders } from './types';

export default class RequestContext {
  /**
   * 当前已重试测次数
   */
  public tryNum?= 0;

  /**
   * 在需要重试请求时，用于
   * 断言：本地请求是否返回结果正常
   */
  public tryAssertFunc?= (data: any) => false

  /**
   * 当前请求是否开启：重试机制
   */
  public tryable?: boolean = false

  /**
   * 可重试的最大次数
   */
  public maxTry?: number = 0

  /**
   * 当前请求的url
   */
  public readonly url: string

  /**
   * 设置证书类型 omit:不传递cookie same-origin:同源发送cookie include:都发送cookie
   */
  public credentials?: string

  /**
   * 当前请求的数据
   */
  public data?: any

  public responseConvert: 'json' | 'text' | 'arrayBuffer' | 'blob'

  /**
   * 请求内容类型
   */
  public requestContentType: string

  /**
   * 当前请求的http谓词
   */
  public method: string

  /**
   * 当前请求的额外请求头
   */
  public headers?: RHttpHeaders

  // 返回对象
  public response?: Response

  public fetchTimeoutId?:ReturnType<typeof setTimeout>

  /**
   * 当前请求是否呗取消掉
   */
  public isCancened:boolean

  // 获取当前请求返回类型
  get responseType() {
    if (!this.response) return '';
    if (!this.response.headers) return '';
    const headers = this.response.headers;
    const type = headers.get ? headers.get('content-type') : (headers as any)['content-type'];
    return (type || '').split(';').shift().trim();
  }

  constructor(url: string, method: string, data: any, headers: RHttpHeaders) {
    this.url = url;
    this.data = data;
    this.method = method;
    this.headers = headers || {} as RHttpHeaders;
  }

  /**
   * 根据返回结果，判断当前请求是否需要重试
   */
  shouldRetry?(data: any): boolean {
    if (this.tryable && this.tryAssertFunc) {
      return this.tryAssertFunc(data);
    }
    return false;
  }

  /**
   * 强制设置retry
   */
  retry() {
    this.tryable = true;
    this.maxTry = this.maxTry || 1;
  }
}
