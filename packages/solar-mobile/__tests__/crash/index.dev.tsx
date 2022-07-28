/**
 * @name Crash 组件测试
 * @date 2018-07-02
 */
import React from 'react';
import Crash from '../../src/crash';
import { PageErrorProps } from '../../src/shared/Error';

export interface CrashProps extends PageErrorProps {

}

export default class CrashApp extends React.Component<CrashProps> {
  render() {
    return (
      <Crash />
    );
  }
}
