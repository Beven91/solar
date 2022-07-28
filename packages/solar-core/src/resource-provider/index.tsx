import React from 'react';
import Network from '../network';

type ResourceStatus = 'loading' | 'done' | 'error'

const reactContext = React.createContext<ResourcesValue<any>>({ value: {} });

export interface ResourcesValue<T> {
  // 当前资源加载状态
  status?:ResourceStatus
  // 当前资源远程拉取下来的值
  value:T
}

export interface ResourceProviderProps<T> {
  // 要加载的资源url地址
  resourceUrl:string | Promise<any>
  // 默认的配置资源
  initialValues:T
  // 资源加载完毕
  onLoad?:(data:T) => void
}

export interface ResourceProviderState<T> {
  status:ResourceStatus
  value:T
}

export default class ResourceProvider<T> extends React.Component<ResourceProviderProps<T>, ResourceProviderState<T>> {
  constructor(props:ResourceProviderProps<T>) {
    super(props);
    this.state = {
      status: 'loading',
      value: props.initialValues || {} as T,
    };
    // 加载远程资源
    this.fetchAppResources();
  }

  // 资源上下文定义
  private get contextValue():ResourcesValue<T> {
    return {
      status: this.state.status,
      value: this.state.value || {} as T,
    };
  }

  /**
   * 当前消费资源组件
   */
  public static get Consumer() {
    return reactContext.Consumer;
  }

  /**
   * 加载远程配置资源
   */
  async fetchAppResources() {
    try {
      const { onLoad, resourceUrl } = this.props;
      const promise = typeof resourceUrl === 'string' ? (new Network()).get(resourceUrl).json() : resourceUrl;
      const res = await promise;
      const value = res || { } as T;
      onLoad && onLoad(value);
      this.setState({
        status: 'done',
        value: value,
      });
    } catch (ex) {
      console.error(ex);
      this.setState({
        status: 'error',
      });
    }
  }

  render() {
    const Provider = reactContext.Provider;
    return (
      <Provider value={this.contextValue}>
        {this.props.children}
      </Provider>
    );
  }
}
