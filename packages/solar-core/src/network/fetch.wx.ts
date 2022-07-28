/**
 * @module WxFetch
 * @description 微信小程序和请求转换成fetch api模式
 */
import Response from './response';

// 添加一个fetch 函数到全局对象上
export default function fetch(url: string, input?: any): Promise<Response> {
  input = input || {};
  return new Promise(function(resolve: (data: Response) => void, reject: (error: any) => void) {
    wx.request({
      // 请求地址
      url,
      // 请求类型
      method: input.method,
      // 请求头信息
      header: input.headers,
      // 请求正文数据
      data: input.body,
      // 请求成功
      success: (response: any) => {
        resolve(new Response(response.data, {
          status: response.statusCode,
          statusText: response.errMsg,
          headers: response.header,
          url: url,
        }));
      },
      // 请求失败
      fail: (e: any) => reject({ message: e.errMsg }),
    });
  });
}
