/**
 * @module CrashProvider
 * @description React组件异常捕获组件
 */
import React from 'react';
import Exception from '../exception';

interface ErrorProps {
  desc: string
  error: Error
  [propName: string]: any
}

export interface CrashProviderProps {
  // 自定义异常处理视图
  component: React.ClassType<ErrorProps, any, any>,
  // 异常转换函数
  transform: (e: Error) => string,
  // 自定义异常属性
  errorProps: any,
}

export interface CrashProviderState {
  error: Error
}

export default class CrashProvider extends React.Component<React.PropsWithChildren<CrashProviderProps>, CrashProviderState> {
  static defaultProps = {
    transform: (a: Error) => a.message,
    errorProps: {},
    component: (props: any) => (
      <Exception type="500" title="抱歉，异常了..." {...props} />
    ),
  };

  // 默认状态
  state = {
    error: null as Error,
  };

  /**
   * 捕获异常，使用派生方式记录错误信息
   * @param {*} error
   */
  static getDerivedStateFromError(error: Error) {
    // 更新 state 使下一次渲染可以显降级 UI
    return {
      error: error,
    };
  }

  // 渲染异常视图
  renderError() {
    const { error } = this.state;
    const { component, transform, errorProps = {} } = this.props;
    const message = transform(error);
    const Component = component;
    return (
      <Component desc={message} error={error} {...errorProps} />
    );
  }

  // 渲染正常视图
  renderNormal() {
    return (
      <>
        {this.props.children}
      </>
    );
  }

  // 渲染
  render() {
    if (this.state.error) {
      return this.renderError();
    }
    return this.renderNormal();
  }
}
