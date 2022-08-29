/**
 * @module UserContext
 * @description 获取当前登陆用户上下文信息
 */

import { HttpServletRequest } from 'node-web-mvc';
import AccessToken from './AccessToken';
import AccessTokenTool from './AccessTokenTool';

export default class UserContext {
  /**
   * 当前登陆用户token信息
   */
  accessToken: AccessToken

  private get data() {
    return (this.accessToken || {}) as AccessToken;
  }

  /**
   * 当前登录用户Id
   */
  get userId() {
    return this.data.uid;
  }

  /**
   * 当前用户拥有的角色
   */
  get admin() {
    return this.data.roles === '1';
  }

  constructor(request: HttpServletRequest) {
    // 从header或者cookie中获取token
    const token = (request.headers['token'] || request.cookies['tk'] || '').toString();
    // 获取当前登陆用户token信息
    this.accessToken = AccessTokenTool.parseToken(token);
  }
}