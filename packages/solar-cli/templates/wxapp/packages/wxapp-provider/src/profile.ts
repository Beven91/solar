/**
 * @module Profile
 * @description 小程序用户信息
 */
class Profile {
  private cache:any

  constructor() {
    this.cache = this.read();
  }

  /**
   * 设置当前登录用户信息
   */
  set user(user) {
    this.cache = user;
    this.commit();
  }

  /**
   * 获取当前登录用户信息
   */
  get user() {
    return this.cache || {};
  }

  /**
   * 后去用户登录态token
   */
  get tk() {
    return this.user.token;
  }

  /**
   * 获取用户登录态wtk
   */
  get wtk() {
    return this.user.webToken;
  }

  /**
   * 提交缓存信息到本地存储
   */
  commit() {
    try {
      wx.setStorageSync('user.profile', JSON.stringify(this.cache));
    } catch (ex) {
      console.warn('save user profile error', ex);
    }
  }

  /**
   * 读取本地存储到内存
   */
  read() {
    try {
      return JSON.parse(wx.getStorageSync('user.profile') || '{}');
    } catch (ex) {
      console.warn('read user profile error', ex);
      return {};
    }
  }
}

export default new Profile();
