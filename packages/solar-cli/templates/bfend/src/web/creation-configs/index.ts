/**
 * @module Configuration
 * @description 应用全局配置
 */
export default {
  // 服务接口域名
  API: '',
  // 云服务器图片服务Url
  STATIC: '',
  // 子应用加载域名
  SYSTEM_BASE: '',
  // 调试用的加载域名
  DEBUGGER_SYSTEM_BASE: location.origin,
  // MOCK服务地址,值为空时，默认指向API,如果值为 false 则关闭MOCK服务
  // 当前参数在 生产模式下自动无效
  MOCK: false,
  HOST: '',
  SSO: '',
};
