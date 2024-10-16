
import './index.less';
import React from 'react';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import { store } from '$projectName$-provider';
import { CrashProvider } from 'solar-pc';
import Router from './router';

const Provider = store.Provider;

export default function SolarAdminApp() {
  return (
    <div className="app-root-view $projectName$-root">
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
