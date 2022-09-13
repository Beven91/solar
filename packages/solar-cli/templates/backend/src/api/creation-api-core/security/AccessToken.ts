/**
 * @module AccessToken
 * @description 用户登陆token
 */

export default class AccessToken {
  /**
   * 将accessToken转换成简单字符串，
   * 方便控制生成token的长度
   */
  static stringify(accessToken: AccessToken) {
    const exp = Number(accessToken.exp / 1000).toFixed(0);
    const data = [accessToken.v, accessToken.uid, accessToken.roles, exp].join('.');
    return Buffer.alloc(data.length, data).toString('base64');
  }

  /**
   * 将指定序列化格式化转换成AccessToken实例
   */
  static from(serialize: string): AccessToken {
    if (!serialize) {
      return null;
    }
    const [v, uid, roles, exp] = serialize.split('.');
    const accessToken = new AccessToken(uid, roles, Number(exp) * 1000);
    accessToken.v = v;
    return accessToken;
  }

  /**
   * 当前token的版本,用于以后迁移判定
   */
  v: string

  /**
   * 当前登陆的用户id
   */
  uid: string | number

  /**
   * 当前登陆用户角色信息 例如: 0101
   */
  roles: string

  /**
   * 当前token的过期时间:格式为时间戳
   */
  exp: number

  constructor(uid: string | number, roles: string, exp: number) {
    this.v = '1';
    this.uid = uid;
    this.roles = roles;
    this.exp = exp;
  }
}