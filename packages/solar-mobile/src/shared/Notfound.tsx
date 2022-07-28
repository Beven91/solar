import './index.scss';
import React from 'react';
import Crash from '../crash';

export interface NotfoundProps {
  // 异常标题
  title?: string,
  // 异常消息
  message?: string,
  // 自定义按钮点击
  onClick?: () => void,
}

export default class Notfound extends React.Component<NotfoundProps, {}> {
  static defaultProps = {
    title: '这是一个未知的领域...',
  }

  render() {
    return (
      <Crash {...this.props} />
    );
  }
}
