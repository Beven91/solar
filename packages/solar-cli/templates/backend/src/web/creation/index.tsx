import config from '$projectName$-configs';
import React from 'react';
import ReactDOM from 'react-dom';
import { notification, message } from 'antd';
import { Network, Config, BizError } from 'solar-core';
import App from './App';

// 配置nebuals
Config.setup({
  cdn: config.HOST,
});

// 全局接口数据配置
Network.config({
  base: config.API,
  loading: message.loading.bind(message),
});

// 全局接口异常提示
Network.on('error', (e) => {
  const error = e || {};
  const description = typeof error === 'string' ? error : error.message || error.error;
  notification.error({ message: '接口异常', description: description || '哎呀，网络请求异常啦，请稍候再试试...' });
});

// 全局网络权限配置
Network.on('response', (response, context) => {
  if (context.responseType !== 'application/json') return response;
  response.json().then((data: any) => {
    const code = 'status' in data ? data.status : 0;
    const success = code == 0;
    switch (`${code}`) {
      // 如果当前用户没有登录
      case '403': {
        location.replace('#/login');
        break;
      }
      default:
        break;
    }
    // 如果接口返回标记为成功 直接返回数据data 否则返回一个reject，让netowrk库触发error事件
    return success ? data : Promise.reject(new BizError(code, data.message, data));
  });
});

// 启动React应用
ReactDOM.render(<App />, document.getElementById('app'));
