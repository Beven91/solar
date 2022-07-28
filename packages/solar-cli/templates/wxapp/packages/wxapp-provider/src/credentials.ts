/**
 * @module Credentials
 * @description 微信小程序登录凭证辅助工具
 */
// import config from '$projectName$-configs';
import { } from '$projectName$-services';
import Profile from './profile';

export default class Credentials {
  /**
   * 获取小程序用户信息
   */
  static getUserInfo() {
    return new Promise((resolve, reject) => {
      wx.getUserInfo({ success: res => resolve(res), fail: reject });
    });
  }

  /**
   * 获取当前用户配置信息
   */
  static getSetting() {
    return new Promise((resolve, reject) => {
      wx.getSetting({ success: res => resolve(res), fail: reject });
    });
  }

  /**
   * 调用接口获取登录凭证（code）。
   * 通过凭证进而换取用户登录态信息，包括用户的唯一标识（openid）及本次登录的会话密钥（session_key）等。
   * 用户数据的加解密通讯需要依赖会话密钥完成。更多使用方法详见
   */
  static login() {
    return new Promise((resolve, reject) => {
      wx.login({ success: resolve, fail: reject });
    });
  }

  /**
   * 获取服务接口微信小程序登录需要的凭证与用户信息
   */
  static querySimsUserCredentials() {
    const credentials = { settings: {}, code: '', user: {} };
    return this
      // 获取用户授权配置
      .getSetting()
      // 存储用户授权的配置到凭证里边
      .then((settings) => credentials.settings = settings)
      // 开始执行小程序登录
      .then(() => this.login())
      // 设置登录信息
      .then((res: any) => credentials.code = res.code)
      // 获取当前用户信息 这里优先使用传入的user数据，这样就不用再请求一次获取用户信息
      .then(() => this.getUserInfo())
      // 设置当前用户信息到凭证中
      .then((user) => credentials.user = user)
      .then(() => credentials);
  }

  /**
   * 授权，并且登录会员中心
   */
  static authorize() {
    // 开始登录
    return this.querySimsUserCredentials()
      .then((credentials) => {
        // const { user, code } = credentials;
        // const { encryptedData, iv, rawData, signature } = user;
        // const data = { rawData, signature, code, encryptedData, iv };
        Profile.user.token = '';
        // 开始登录
        // return PapaverService.loginByWechatAppCode(data);
      })
      .then((data: any) => {
        const user = data.single;
        // 登录成功后，设置Profile.user
        Profile.user = user;
        return user;
      });
  }
}
