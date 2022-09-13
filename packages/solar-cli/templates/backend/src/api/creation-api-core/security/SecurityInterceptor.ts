/**
 * @module SecurityInterceptor
 * @description 接口安全控制拦截器
 */

import { HttpServletRequest, HttpServletResponse, HandlerMethod, HandlerInterceptorAdapter } from 'node-web-mvc';
import Security, { SecurityAnnotation } from './Security';
import UserContext from './UserContext';
import AccessTokenTool from './AccessTokenTool';
import BusinessEnum from '../enums/BusinessEnum';
import GeneralResult from '../entity/GeneralResult';
import SecurityEnum from '../enums/SecurityEnum';

export default class SecurityInteceptor extends HandlerInterceptorAdapter {
  /**
   * 在接口执行前,这里进行请求拦截,
   * 根据当前要执行的接口配置的Security注解,来进行相应的权限判定
   */
  preHandle(request: HttpServletRequest, response: HttpServletResponse, handler: HandlerMethod): boolean {
    if (/^\/(swagger|media)\//.test(request.path)) {
      // swagger-ui/ 不进行权限控制
      return true;
    }
    // 获取类的Security注解
    const classSecurity = handler.getClassAnnotation<SecurityAnnotation>(Security);
    // 获取函数的Security注解
    const methodSecurity = handler.getAnnotation<SecurityAnnotation>(Security);
    const annotation = methodSecurity || classSecurity;
    // 如果没有配置该注解 则表示接口未确认,或者框架获取注解异常
    if (!annotation) {
      // 在未确认状态下,不允许访问该接口
      response.setStatus(401).end();
      return false;
    }
    // 开始进入用户认证以及接口权限等级判定
    switch (annotation.security) {
      case SecurityEnum.None:
        // 如果当前接口无需登录态,则直接放行
        return true;
      case SecurityEnum.Guest:
      case SecurityEnum.Login:
      case SecurityEnum.Admin:
      default:
      {
        // 认证用户登录态信息
        const user = new UserContext(request);
        const validate = AccessTokenTool.verifyToken(user.accessToken);
        // 如果登录态认证通过,则开始校验用户接口角色权限
        return validate ? this.verifyUserPermission(response, annotation, user) : this.handleUnauthorized(response);
      }
    }
  }

  /**
   * 用户接口角色权限验证
   *
   * @param annotation 注解信息
   */
  verifyUserPermission(response: HttpServletResponse, annotation: SecurityAnnotation, user: UserContext) {
    if (annotation.security !== SecurityEnum.Admin) {
      return true;
    }
    if (user.admin) {
      // 如果权限校验通过
      return true;
    }
    const failResult = GeneralResult.fail(BusinessEnum.UN_PERMISSION, '您没有权限访问。');
    this.handleResponse(response, failResult);
    return false;
  }

  /**
   * 当用户登录认证失败
   * @param response
   */
  handleUnauthorized(response: HttpServletResponse) {
    const failResult = GeneralResult.fail(BusinessEnum.UN_LOGIN, '用户认证失败');
    this.handleResponse(response, failResult);
    return false;
  }

  /**
   * 处理权限验证失败返回
   *
   * @param response response对象
   * @param result 返回结果
   */
  handleResponse(response: HttpServletResponse, result: GeneralResult<any>) {
    // 设置返回类型
    response.setHeader('Content-Type', 'application/json');
    response.setStatus(200, 'OK');
    response.end(JSON.stringify(result));
  }
}