/**
 * @module CrashProvider
 * @description 渲染异常容器，当子元素渲染异常，则会显示一个异常页面
 */
import React, { ReactElement } from 'react';
import Crash from '../crash';

export interface CrashError {
  error: string
}

export interface CrashProviderProps {
  // 返回异常显示内容
  view?: (error: CrashError) => ReactElement
  // 当前error是否可见
  visible?: boolean
  // 强制指定异常信息
  error?: string
  // 自定义Error组件属性
  errorProps?: object
}

interface CrashProviderState {
  error: string
}

export default class CrashProvider extends React.Component<CrashProviderProps, CrashProviderState> {
  // 默认属性
  static defaultProps = {
    view: () => <Crash />,
    visible: false,
  }

  /**
   *当子元素出现异常
   * @param {Error} e 错误对象
   */
  static getDerivedStateFromError() {
    return {
      error: '渲染异常',
    };
  }

  state = {
    error: '',
  }

  componentDidCatch() {
    return true;
  }

  // 渲染一个异常状态视图
  renderError() {
    const { error } = this.state;
    const { view } = this.props;
    return view({ error: (error || this.props.error) as string });
  }

  // 渲染组件
  render() {
    if (this.state.error || this.props.visible) {
      return this.renderError();
    }
    return React.Children.only(this.props.children);
  }
}
