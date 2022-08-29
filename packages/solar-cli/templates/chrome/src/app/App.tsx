import './index.less';
import React from 'react';
import { ConfigProvider, message, notification } from 'antd';
import { CrashProvider } from 'solar-pc';
import Router from './router';

export default class App extends React.Component {
  popupRoot: HTMLDivElement

  constructor(props: any) {
    super(props);
    this.popupRoot = document.createElement('div');
    this.popupRoot.className = 'chrome';
    document.body.appendChild(this.popupRoot);
    // 配置message container
    message.config({
      getContainer: () => this.popupRoot,
    });
    notification.config({
      getContainer: () => this.popupRoot,
    });
  }

  /**
   * 配置antd用于添加css作用域
   */
  get configProvider() {
    return {
      getPopupContainer: () => this.popupRoot,
    };
  }

  render() {
    return (
      <div className="chrome">
        <ConfigProvider getPopupContainer {...this.configProvider}>
          <CrashProvider>
            <Router />
          </CrashProvider>
        </ConfigProvider>
      </div>
    );
  }
}