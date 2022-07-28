import React from 'react';
import AsyncView from '../../src/async-view';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';

class AnimateView extends React.Component {
  render() {
    return (
      <div className="animate-view">{this.props.children}</div>
    );
  }
}

class AnimateView2 extends React.Component {
  render() {
    return (
      <div className="animate-view2">{this.props.children}</div>
    );
  }
}

function getAsynView() {
  return new Promise((resolve) => {
    // 返回需要的组件
    resolve(AnimateView);
  });
}

describe('AsyncView', () => {
  it('isAsyncComponent', () => {
    const asyncView = new AsyncView({ component: getAsynView });
    const asyncView2 = new AsyncView({ component: AnimateView });

    // 断言：getAsynView 为 异步组件
    expect(asyncView.isAsyncComponent).toBe(true);

    // 断言:AnimateView 为非异步组件
    expect(asyncView2.isAsyncComponent).toBe(false);
  });


  it('load async component not visible', () => {
    // 测试，加载异步组件 :默认不可见
    const view = mount(
      <AsyncView component={getAsynView}>异步组件内部内容</AsyncView>
    );
    // 默认不可见
    expect(toJson(view)).toMatchSnapshot();
  });


  it('load async component visible', (done) => {
    // 测试，加载异步组件:设置visible 加载异步组件，并且渲染
    const view = mount(
      <AsyncView visible={true} component={getAsynView}>异步组件内部内容</AsyncView>
    );
    // 在加载过程中，默认为空
    expect(toJson(view)).toMatchSnapshot();
    setTimeout(() => {
      // 加载完成后：渲染AnimateView内容
      expect(toJson(view)).toMatchSnapshot();

      done();
    }, 100);
  });


  it('update component to not visible', (done) => {
    // 测试，加载异步组件:设置visible 加载异步组件，并且渲染
    const view = mount(
      <AsyncView visible={true} component={getAsynView}>异步组件内部内容</AsyncView>
    );
    // 在加载过程中，默认为空
    expect(toJson(view)).toMatchSnapshot();

    setTimeout(() => {
      // 加载完成后：渲染AnimateView内容
      expect(toJson(view)).toMatchSnapshot();

      view.setProps({ visible: false });
      expect(toJson(view)).toMatchSnapshot();
      done();
    }, 100);
  });


  it('load common component not visible', () => {
    // 测试，非异步组件渲染
    const view = mount(
      <AsyncView component={AnimateView}>组件内部内容</AsyncView>
    );
    // 由于没有设置visible:true 所以这应该结果为空字符串
    expect(toJson(view)).toMatchSnapshot();
  });


  it('load common component visible', (done) => {
    const view = mount(
      <AsyncView component={AnimateView} visible={true}>组件内部内容</AsyncView>
    );
    // 直接渲染AnimateView
    expect(toJson(view)).toMatchSnapshot();

    setTimeout(() => {
      expect(toJson(view)).toMatchSnapshot();
      done();
    }, 100);
  });


  it('load async component props change to common', (done) => {
    // 测试，加载异步组件
    const view = mount(
      <AsyncView component={getAsynView} visible={true}>组件内部内容</AsyncView>
    );

    setTimeout(() => {
      expect(toJson(view)).toMatchSnapshot();

      // 这里开始更新组件，设置component为同步组件
      view.setProps({ component: AnimateView2 });
      expect(toJson(view)).toMatchSnapshot();

      done();
    }, 100);
  });
})
;
