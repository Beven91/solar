/**
 * @module NetworkInitialize
 * @description 网路层接口初始化
 */
import config from '$projectName$-configs';
import { Network, Config, BizError } from 'solar-core';
import MESSAGE from './network.locale';

// 配置nebuals
Config.setup({
  cdn: config.CDN,
});
// 全局接口数据配置
Network.config({
  base: config.API,
  loading: (message) => wx.showLoading({ title: message || '请稍后...' }) as any,
});
// 统一断言网络接接口返回结果
Network.on('response', (response, context) => {
  if (context.responseConvert !== 'json') return response;
  const code = response.code;
  const success = code == 0;
  const message = MESSAGE[code] || response.message;
  // 如果接口返回标记为成功 直接返回数据data 否则返回一个reject，让netowrk库触发error事件
  return success ? response : Promise.reject(new BizError(code, message, response));
});
// 接口设置网络请求接口异常提示
Network.on('error', (ex) => {
  const data = typeof ex === 'string' ? { message: ex } : ex;
  const message = data.message || '哎呀，网络请求异常啦，请稍候再试试...';
  wx.showToast({ title: message, icon: 'none' });
});