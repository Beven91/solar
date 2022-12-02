/**
 * @name PortalSystem
 * @description 子系统加载容器
 */
import './index.scss';
import React from 'react';
import { Spin } from 'antd';
import { SystemRegistration } from 'solar-core';
import Exception from '../exception';

type PortalStatus = 'loading' | 'error' | 'ok'

export interface PortalSystemProps {
  /**
   * 要加载的子系统名称,如果为空，当前组件将仅展示children ，会销毁子系统对应内容
   */
  system: string
  /**
   * 要加载子系统的基础资源的基础路径
   */
  base: string
  /**
   * 容器class名
   */
  className?: string
  /**
   * 容器style样式
   */
  style?: React.CSSProperties
}

export interface PortalSystemState {
  childApp: typeof React.Component,
  status: PortalStatus
  // 当前要渲染的子系统
  current: string
  // 是否需要加载子系统远程内容
  needReload: boolean
}

export default class PortalSystem extends React.Component<React.PropsWithChildren<PortalSystemProps>, PortalSystemState> {
  static getDerivedStateFromProps(props: PortalSystemProps, state: PortalSystemState) {
    if (props.system !== state.current) {
      if (!props.system) {
        // 退出系统
        SystemRegistration.exitRunnings();
      }
      return {
        current: props.system,
        needReload: !!props.system,
      } as Partial<PortalSystemState>;
    }
    return null;
  }

  state: PortalSystemState = {
    childApp: null,
    status: 'loading',
    current: '',
    needReload: false,
  };

  // 子系统根节点ref
  childRootRef = React.createRef<HTMLDivElement>();

  preparePortalSystem() {
    if (!this.state.needReload) return;
    const { system, base } = this.props;
    this.setState({ status: 'loading', needReload: false });
    // 开始加载子系统
    SystemRegistration
      .invoke(system, {
        base: base,
        context: {
          root: this.childRootRef.current,
        },
      })
      .then(
        (childApp: React.ComponentClass) => {
          this.setState({ status: 'ok', childApp: childApp });
        },
        () => this.setState({ status: 'error' })
      );
  }

  shouldComponentUpdate(nextProps: PortalSystemProps, nextState: PortalSystemState) {
    return nextProps.system !== this.props.system || nextState.status !== this.state.status;
  }

  componentDidMount() {
    this.preparePortalSystem();
  }

  componentDidUpdate() {
    this.preparePortalSystem();
  }

  /**
   * 渲染子系统
   */
  renderChildPortal() {
    const { childApp: ChildApp } = this.state;
    return ChildApp ? <ChildApp /> : null;
  }

  /**
   * 渲染子系统根节点 如果当前没有子系统名称，则直接渲染props.children
   * @returns
   */
  renderChildRoot() {
    if (!this.props.system) {
      // 如果没有系统名，则直接渲染子元素内容
      return this.props.children;
    } else if (this.state.status === 'ok') {
      // 如果子系统加载成功，则渲染子系统内容
      return this.renderChildPortal();
    } else if (this.state.status === 'error') {
      // 如果加载异常，
      return (
        <Exception
          type="500"
          onClick={() => this.preparePortalSystem()}
          btnText="重试"
          title="加载子应用失败"
          desc="您可以点击重新试试"
        />
      );
    } else if (this.state.status === 'loading') {
      // 加载中。。。。
      return <Spin className="system-spinning" spinning />;
    }
    return null;
  }

  render() {
    const { status, childApp: ChildApp } = this.state;
    const isolation = status === 'ok' && !ChildApp;
    return (
      <div
        className={`portal-system ${this.props.className || ''} ${isolation ? 'isolation' : ''}`}
        style={this.props.style}
      >
        <div className="isolation-app" ref={this.childRootRef}></div>
        {this.renderChildRoot()}
      </div>
    );
  }
}
