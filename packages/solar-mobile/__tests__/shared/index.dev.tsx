/**
 * @name Shared 组件测试
 * @date 2018-07-02
 */
import React from 'react';
import Error from '../../src/shared/Error';

export default class CrashApp extends React.Component {
  render() {
    return (
      <Error title="出错啦..." />
    );
  }
}
