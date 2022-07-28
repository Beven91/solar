/**
 * @name 调试组件库入口
 * @date 2018-04-03
 * @description
 *        组件库 测试分为以下两部分:
 *          1. 采用jest +  react-test-renderer 做模拟快照测试
 *          2. 采用www网站进行真实调试
 */
import '../src/polyfill/requestAnimation';
import './index.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Toast } from 'antd-mobile';
// 如果你需要调试其他组件可以 ，在__tests__ 目录下新建对应的测试用例 然后修改下import 的from 路径
import Runtime from './pagination/index.dev';
import { Config, Network } from 'solar-core';

Config.setup({
  cdn: 'https://static.test.solardc.com/image/',
});


// 全局接口数据配置
Network.config({
  base: 'https://api.dev.solardc.com/',
});

// wxc0f95a2866bb7747
// wx02710dae0d7fec8b

// alert(navigator.userAgent);
// if (/(iPhone|iPad).+Safari/.test(navigator.userAgent)) {
//   alert('safari');
// }


// 全局接口异常提示
Network.on('error', () => {
  Toast.fail('哎呀，网络请求异常啦，请稍候再试试...', 2);
});

class RunApp extends React.Component {
  render() {
    return <Runtime />;
  }
}

// 启动测试用例
createRoot(document.getElementById('app')).render(<RunApp />);

if (module.hot) {
  module.hot.accept();
}
