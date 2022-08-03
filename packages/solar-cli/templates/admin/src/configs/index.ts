/**
 * @module Configuration
 * @description 应用全局配置
 */
export default {
  // 服务接口域名
  API: '${API}',
  // 当前应用APPID
  APPID: '${APPID}',
  // 当前应用AppType
  APP_TYPE: '${APP_TYPE}',
  // 文件上传服务器
  FILEGW: '${FILEGW}',
  // 公有云服务器文件服务器地址
  CDN_PUBLIC: '${CDN_PUBLIC}',
  // 私有云文件服务器地址
  CDN_PRIVATE: '${CDN_PRIVATE}',
  // 主域名地址
  DOMAIN: '${DOMAIN}',
  // 打点日志服务器地址
  LOG_API: '${LOG_API}',
  // 子应用加载域名
  SYSTEM_BASE: '',
  // 调试用的加载域名
  DEBUGGER_SYSTEM_BASE: location.origin,
  // 是否开启API mock服务
  MOCK: false,
};
