/**
 * @module AlipayFetch
 * @description 支付宝小程序请求转换成fetch api模式
 */
import Response from './response';

// 添加一个fetch 函数到全局对象上
export default function fetch2(url: string, input?: any): Promise<Response> {
  input = input || {};
  return new Promise(function(resolve, reject) {
    (<any>global).my.request({
      // 请求地址
      url,
      // 请求类型
      method: input.method,
      // 请求头信息
      headers: input.headers,
      // 请求正文数据
      data: input.body,
      // 请求成功
      success: (response: any) => {
        resolve(new Response(response.data, {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers || {},
          url: url,
        }));
      },
      // 请求失败
      fail: (error: any) => reject({ message: error.errMsg }),
    });
  });
}
