import React from 'react';
import { createRoot } from 'react-dom/client';
import initializeNetwork from './containers/network';
import App from './containers/App';

// 初始化全局接口配置
initializeNetwork();

// 启动React应用
createRoot(document.getElementById('app')).render(<App />);

if (module.hot) {
  module.hot.accept();
}
