/**
 * 名称：微信小程序应用启动入口
 * 日期：2018-11-22
 * 描述：用于初始化应用全局配置，以及全局事件监听等
 */
App({
  globalData: {
  },
  onLaunch() {
    // 全局行为初始化
    require('./initialize/behaviors.initialize');
    // 网络层初始化
    require('./initialize/network.initialize');
  },
  onError(e) {
    console.error(e);
  },
});
