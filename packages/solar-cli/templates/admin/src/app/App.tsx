
import './index.less';
import React from 'react';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import { store } from '$projectName$-provider';
import { CrashProvider } from 'solar-pc';
import Router from './router';

const Provider = store.Provider;

export default function FluxyAdminApp() {
  return (
    <div className="top-container $projectName$-root">
      <Provider store={store.store}>
        <ConfigProvider locale={zhCN}>
          <CrashProvider>
            <Router />
          </CrashProvider>
        </ConfigProvider>
      </Provider>
    </div>
  );
}
