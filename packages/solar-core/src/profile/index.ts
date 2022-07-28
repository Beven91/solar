/**
 * @name Profile
 * @description 用于提供用户登陆状等信息
 */
export default class Profile {
  /**
   * 获取用户名称
   */
  static get userName() {
    return '匿名';
  }

  /**
   * 用户头像
   */
  static get avatar() {
    return '';
  }

  /**
   * 获取用户id
   */
  static get userId() {
    return 1;
  }

  /**
   * 退出登录
   */
  static exit() { }
}
