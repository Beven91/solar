import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { SystemRegistration } from 'solar-core';

// 注册子应用
SystemRegistration.register('$projectName$', {
  run(options) {
    // 启动React应用
    createRoot(options.root).render(<App />);
  },
  destory(options) {
    // 启动React应用
    createRoot(options.root).render(null);
  },
});

