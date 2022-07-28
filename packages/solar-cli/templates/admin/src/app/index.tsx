import config from '$configs$';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { notification, message } from 'antd';
import { Network, Config, BizError } from 'solar-core';
import App from './App';

// 全局配置
Config.setup({
  cdn: config.CDN,
});

// 网络请求库初始化
Network
  .config({
    base: config.API,
    // timeout: 5000,
    // mock: config.MOCK,
    contentType: 'application/json',
    loading: message.loading.bind(message),
  })
  .on('error', (e: BizError) => {
    const description = e.message || '';
    notification.error({ message: '接口异常', description: description || '哎呀，网络请求异常啦，请稍候再试试...' });
  })
  .on('response', (resposne: ApiResponse, context) => {
    // 如果返回内容不是json 则跳过
    if (context.responseConvert !== 'json') return resposne;
    const success = 'success' in resposne ? resposne.success : true;
    switch (String(resposne.code)) {
      case '403':
        // 跳转登录
        break;
    }
    return success ? resposne.data : Promise.reject(new BizError(resposne.code, resposne.message));
  });

// 启动React应用
const root = document.getElementById('app') as HTMLDialogElement;
createRoot(root).render(<App />);
