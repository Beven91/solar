import './index.scss';
import React from 'react';
import Crash from '../crash';

export interface PageErrorProps {
  // 异常标题
  title?: string,
  // 异常消息
  message?: string,
  // 自定义按钮点击
  onClick?: () => void,
}

export default class PageError extends React.Component<PageErrorProps, {}> {
  static defaultProps = {
    onClick: () => history.back(),
  }

  render() {
    return (
      <Crash { ...this.props } />
    );
  }
}
