/**
 * @module SecurityInterceptor
 * @description 接口安全控制拦截器
 */

import { HttpServletRequest, HttpServletResponse, HandlerMethod, HandlerInterceptorAdapter, HttpMethod } from 'node-web-mvc';

export default class SecurityInteceptor extends HandlerInterceptorAdapter {
  preHandle(request: HttpServletRequest, response: HttpServletResponse, handler: HandlerMethod): boolean {
    const origin = request.headers.origin || request.headers.referer;
    if (/^\/(swagger|media)\//.test(request.path)) {
      // swagger-ui/ 不进行权限控制
      return true;
    }
    if (!origin) {
      return true;
    }
    response.setHeader('access-control-allow-origin', origin);
    response.setHeader(
      'access-control-allow-method',
      'POST, GET, OPTIONS, PUT, DELETE, HEAD'
    );
    response.setHeader('Access-Control-Allow-Headers', 'content-type,token');
    response.setHeader('access-control-allow-credentials', 'true');
    if (request.method === HttpMethod.OPTIONS ) {
      response.setStatus(200, 'OK');
      response.end();
      return false;
    }
    return true;
  }
}