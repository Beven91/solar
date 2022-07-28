/**
 * @name AsyncView 测试
 * @date 2018-04-03
 */
import React from 'react';
import AsyncView from '../../src/async-view';
import { Button } from 'antd-mobile';

class AnimateView extends React.Component {
  render() {
    return <div className="animate-view" > Animate: {this.props.children} </div>;
  }
}

class AnimateView2 extends React.Component {
  render() {
    return <div className="animate-view" > Animate2: {this.props.children} </div>;
  }
}

export default class AsyncViewApp extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.getAsyncComponent = this.getAsyncComponent.bind(this);
    this.state = {
      asyncComponent: this.getAsyncComponent,
    };
  }

  getAsyncComponent() {
    return new Promise((resolve) => {
      // 返回需要的组件
      resolve(AnimateView);
    });
  }

  handleToggle = () => {
    this.setState({
      asyncComponent: AnimateView2,
    });
  }

  render() {
    const { asyncComponent } = this.state;
    return (
      <div>
        <Button onClick={this.handleToggle} > 切换组件 </Button>
        < AsyncView component={AnimateView} visible={true} >
          同步组件内容
        </AsyncView>
        <AsyncView component={asyncComponent} visible={true} >
          <span>异步组件已被加载 </span>
        </AsyncView>
        <AsyncView component={asyncComponent} >
          <span>被隐藏的组件 </span>
        </AsyncView>
      </div>
    );
  }
}
