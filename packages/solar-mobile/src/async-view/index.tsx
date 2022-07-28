/**
 * 名称：动态载入组件
 * 日期：2018-01-19
 * 描述：用于支持异步加载组件 （主要用于代码拆分，异步模块组件)
 *
 * AsyncView:
 *
 * 用例：
 *      <AsyncView component={getComponent} visible={this.state.visible}  >
 *      ..children... //需要作为getComponent组件子组件的内容
 *      </AsyncView>
 */
import React from 'react';
import Preload from '../preload';

const isFunction = (handler: any) => typeof handler === 'function';

type AsyncLoadable = (() => Promise<any>);
type AsyncComponent = React.ClassType<any, any, any> | AsyncLoadable;

export interface AsyncViewProps {
  // 异步组件获取函数 需要返回一个promise
  component: AsyncComponent,
  // 异步组件是否可见 当visible为false是，不会执行异步记载，当为true时进行加载
  visible?: boolean,
}

export interface AsyncViewState {
  // 组件是否在加载后立即渲染
  visible: boolean,
  // 需要渲染的组件
  requiredComponent: React.ReactElement<any>
}

export default class AsyncView extends React.Component<AsyncViewProps, AsyncViewState> {
  /**
   * 默认属性
   */
  static defaultProps = {
    visible: false,
  }

  private asyncComponent: AsyncComponent

  /**
   * 组件构造函数
   * @param props {Object} 组件props
   */
  constructor(props: AsyncViewProps) {
    super(props);
    this.asyncComponent = props.component;
    // 设置默认state
    this.state = {
      // 组件是否在加载后立即渲染
      visible: props.visible != false,
      // 需要渲染的组件
      requiredComponent: this.isAsyncComponent ? null : props.component as React.ReactElement<any>,
    };
  }

  /**
   * 判断当前props.component 是否为一个异步加载组件
   * 而不是纯粹的React组件
   */
  get isAsyncComponent() {
    const asyncComponent = this.asyncComponent as any;
    if (asyncComponent.prototype instanceof React.Component) {
      return false;
    } else if (isFunction(asyncComponent) && asyncComponent.length > 0) {
      // 如果有参数，则认为时一个函数组件
      return false;
    }
    return isFunction(asyncComponent);
  }

  /**
   * 组件第一次渲染完成时，执行一次异步获取
   */
  componentDidMount() {
    if (this.state.visible) {
      this.asyncRequireComponent();
    }
  }

  /**
   * 当路由切换时
   * @param nextProps {Object} 新的props
   */
  componentWillReceiveProps(nextProps: AsyncViewProps) {
    this.asyncComponent = nextProps.component;
    this.setState({ requiredComponent: null, visible: nextProps.visible });
    if (nextProps.visible) {
      this.asyncRequireComponent();
    }
  }

  /**
   * 仅在requiredComponent变更时，才刷新组件内容
   * @param nextProps {Object} 新的props
   * @param nextState {Object} 新的state
   * @returns {Boolean}
   */
  shouldComponentUpdate(nextProps: AsyncViewProps, nextState: AsyncViewState) {
    const requiredComponent = nextState.requiredComponent as any;
    return requiredComponent && requiredComponent.prototype instanceof React.Component;
  }

  /**
   * 尝试异步方式获取要显示的组件
   */
  asyncRequireComponent() {
    if (this.isAsyncComponent) {
      this.onProcessing();
      const asyncComponent = this.asyncComponent as AsyncLoadable;
      // 异步加载组件，然后进行渲染
      asyncComponent().then((m: any) => {
        const requiredComponent = (m.default || m);
        this.setState({ requiredComponent });
        this.onProcessed();
      });
    } else if (this.asyncComponent !== this.state.requiredComponent) {
      // 如果传入的是同步组件
      const requiredComponent = this.asyncComponent as React.ReactElement<any>;
      this.setState({ requiredComponent });
    }
  }

  /**
   * 异步组件请求中，可以在次函数中添加loaing效果
   */
  onProcessing() {
    // Preload.showLoading();
  }

  /**
   * 异步组件请求完毕
   */
  onProcessed() {
    Preload.closeLoading();
  }

  /**
   * 组件渲染
   */
  render() {
    const { state } = this;
    const Component = state.requiredComponent as any;
    if (Component && state.visible) {
      return (
        <div className="async-view">
          <Component {...this.props} />
        </div>
      );
    }
    return '';
  }
}
