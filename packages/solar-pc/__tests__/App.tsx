
/**
 * @name 调试组件库入口
 * @date 2019-02-25
 * @description 组件库调试
 */
import 'core-js/stable';
import './index.scss';
import React from 'react';
import { createRoot } from 'react-dom/client';
// 如果你需要调试其他组件可以 ，在__tests__ 目录下新建对应的测试用例 然后修改下import 的from 路径
import { Config, Network } from 'solar-core';
import CrashProvider from '../src/crash-provider';
import AbstractProvider from '../src/abstract-provider';
import { AbstractConfig } from '../src/interface';

Config.setup({

});

Network.on('start', (data: any, context: any) => {
  // 设置登陆态token
  context.headers['token'] = 'NTQ3OGMTAwMDAwMDAyMDAwMzM2Ml8xMDYuMTQuMTM5LjEzMF8yXzIzN18xNTYwNTIxNDg3MDAwXzQ_';
});

// 全局接口数据配置
Network.config({
  base: 'http://api.dev.shantaijk.cn',
  // defaultContentType: 'application/json',
});

export default function runApplication(container: HTMLElement, App: React.ElementType) {
  const config: AbstractConfig = {
    fetchOption: (key) => {
      return Promise.resolve({
        count: 3,
        models: [
          { value: '1', label: '上海' },
          { value: '2', label: '杭州' },
        ],
      });
    },
  };

  createRoot(container).render(
    <CrashProvider>
      <AbstractProvider
        value={config}
      >
        <App />
      </AbstractProvider>
    </CrashProvider>
  );
}