/**
 * @name Device
 * @description 设备信息工具
 */

class Device {
  /**
   * 当前计算出来的平台名称，例如:android ios windows
   */
  public platform: string

  /**
   * 当前所在应用环境，例如: mircoMessager
   */
  public app: string

  constructor() {
    // 是否在iOS中
    this.applyEnv('ios', /iPhone|iPad/i, true);
    // 是否在Android中
    this.applyEnv('android', /Android/i, true);
    // 微信环境
    this.applyEnv('microMessenger', /MicroMessenger/i);
  }

  /**
   * 执行指定环境的判断表达之，
   * 当为true时，附加对应的环境名称
   * @param {String} env 环境名称
   * @param {RegExp} exp 表达式
   */
  applyEnv(platform: string, exp: RegExp, isPlatform?: boolean) {
    const result = exp.test(navigator.userAgent);
    if (result) {
      this[isPlatform ? 'platform' : 'app'] = platform;
    }
    return result;
  }

  /**
   * 应用环境样式
   */
  applyClass() {
    // 获取需要配置的样式
    const classList = document.documentElement.classList;
    classList.add(`is-platform-${this.platform || 'unkown'}`, `is-${this.app || 'unkown'}`);
  }
}

export default new Device();
