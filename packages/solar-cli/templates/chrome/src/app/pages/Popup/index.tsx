
import './index.scss';
import React from 'react';
import { Empty } from 'antd';

export default class App extends React.Component {
  render() {
    return (
      <div className="chrome-extension-popup">
        <Empty
          style={{ marginTop: 50 }}
          description={(
            <span className="description">
              欢迎使用Chrome扩展程序开发,这里是Chrome Popup区域
            </span>
          )}
        />
      </div>
    );
  }
}
