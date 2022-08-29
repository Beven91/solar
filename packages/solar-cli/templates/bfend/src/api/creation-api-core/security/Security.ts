
/**
 * @module Security
 * @description 用于标注接口访问权限
 */

import { Target, RuntimeAnnotation } from 'node-web-mvc';
import SecurityEnum from '../enums/SecurityEnum';

@Target
export class SecurityAnnotation {
  /**
  * 安全等级
  */
  security: SecurityEnum

  /**
   * 当前接口需要的角色权限
   */
  roles?: string

  constructor(meta: RuntimeAnnotation, options: SecurityAnnotation) {
    options = options || {} as SecurityAnnotation;
    this.security = options.security;
    this.roles = options.roles;
  }
}

/**
 * 标注指定类为一个rest 风格的controller
 */
export default Target.install<typeof SecurityAnnotation>(SecurityAnnotation);