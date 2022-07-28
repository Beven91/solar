/**
 * @name Image 测试
 * @date 2018-04-25
 */
import React from 'react';
import CrashProvider from '../../src/crash-provider';

class ThrowError extends React.Component<any, any> {
  render() {
    const { error } = this.props;
    if (error) {
      throw new Error('MOCKERROR ' + error);
    }
    return (
      <div>
        hello.....
      </div>
    );
  }
}

export default class CrashProviderApp extends React.Component<any, any> {
  render() {
    return (
      <CrashProvider>
        <ThrowError error="出错啦....." />
      </CrashProvider>
    );
  }
}
