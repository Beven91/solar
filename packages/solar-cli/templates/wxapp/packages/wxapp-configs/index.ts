/**
 * 名称：小程序应用程序配置项
 * 日期：2018-05-31
 * 描述：以下定义的参数为开发环境使用配置，
 *      如果需要修改【测试环境】【生产环境配置】的配置项，请按如下步骤
 *
 *      1.修改META-INF下的auto-config.xml即可
 *      2.当前文件仅做模板配置，实际值由webpack的AutoConfigPlugin根据
 *        auto-config.xml配置打包到bundle.js
 *      http://snow.solar-ent.com/antx/myantx/myreqest
 */

const MOCK = process.env.NODE_ENV !== 'production';
const PROXY = 'http://localhost:3601';

export default {
  // 应用ID
  APPID: '${appId}',
  // 服务接口域名
  API: MOCK ? PROXY : '${api}',
  // 云服务器图片服务Url
  CDN: '${cdn}',
  HOST: '${troy}',
};
