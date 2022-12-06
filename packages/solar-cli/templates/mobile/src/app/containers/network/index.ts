import config from '$configs$';
import { Preload } from 'solar-mobile';
import { Toast } from 'antd-mobile';
import { Network, Config, BizError } from 'solar-core';
import { getMessage } from './locale';

const SHORT = 2;

// 配置nebuals
Config.setup({
  cdn: config.CDN,
});

export default () => {
  // 全局接口数据配置
  Network.config({
    base: config.MOCK ? '' : config.API,
    loading: Preload.showLoading.bind(Preload),
  });

  // 全局接口异常提示
  Network.on('error', () => {
    Toast.fail('哎呀，网络请求异常啦，请稍候再试试...', SHORT);
  });

  // 全局网络权限配置
  Network.on('response', (response, context) => {
    if (context.responseConvert !== 'json') return response;
    const { code } = response;
    const success = code == 0;
    const message = getMessage(code) || response.message;
    // 是否有登录态cookie
    switch (code) {
      case 403:
        Toast.show(message);
        window.location.replace(`${window.location.pathname}#error?type=unlogin`);
        break;
      default:
    }
    // 如果接口返回标记为成功 直接返回数据data 否则返回一个reject，让netowrk库触发error事件
    return success ? response : Promise.reject(new BizError(code, message));
  });
};