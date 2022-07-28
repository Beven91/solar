/**
 * @name ScrollView 测试
 * @description
 */
import React from 'react';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
// import BScroll from '@better-scroll/core';
import ScrollViewApp from './index.dev';
import ScrollView from '../../src/scroll-view';

const BScroll = require('@better-scroll/core');
const createScroll = BScroll.default;

const ScrollMock = {
  height: 0,
  scrollHeight: 0,
  restore() {
    ScrollMock.height = 0;
    ScrollMock.scrollHeight = 0;
  },
  mockScrollView(height: number, scrollHeight: number) {
    ScrollMock.height = height;
    ScrollMock.scrollHeight = scrollHeight + height;
  },
};
BScroll.default = function(wrapper: HTMLDivElement, options: any) {
  Object.defineProperty(wrapper, 'clientHeight', { value: ScrollMock.height });
  Object.defineProperty(wrapper, 'offsetHeight', { value: ScrollMock.height });
  Object.defineProperty(wrapper.children[0], 'scrollHeight', { value: ScrollMock.scrollHeight });
  Object.defineProperty(wrapper.children[0], 'offsetHeight', { value: ScrollMock.scrollHeight });
  return new createScroll(wrapper, options);
};

describe('ScrollView', () => {
  beforeEach(function() {
    ScrollMock.restore();
    const userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1';
    Object.defineProperty(navigator, 'userAgent', { configurable: true, value: userAgent });
  });

  it('renders correctly', () => {
    const tree = mount(<ScrollViewApp />);
    expect(toJson(tree, { mode: 'deep', noKey: true })).toMatchSnapshot();
  });

  it('scroll', () => {
    const onEnd = jest.fn();
    const onScroll = jest.fn();
    // 模拟滚动条高度
    ScrollMock.mockScrollView(20, 100);
    // 创建渲染树
    const tree = mount(
      <ScrollView
        style={{ height: 20 }}
        onScroll={onScroll}
        onEndReached={onEnd}
      >
        <div style={{ height: 100 }}></div>
      </ScrollView>
    );
    const instance = tree.instance() as ScrollView;
    // 滚动10px
    instance.scrollTo(null, 10);
    // 断言： 在滚动时，需要触发onScroll事件
    expect(onScroll).toBeCalled();
    // 断言：此时还没有后滚动到底，不会触发onEnd
    expect(onEnd).toHaveBeenCalledTimes(0);

    // 滚动到底部
    instance.scrollTo(null, 100);
    // 断言： 在滚动时，需要触发onScroll事件
    expect(onScroll).toBeCalled();
    // 断言：在滚动到底部时，需要触发onEndReached事件
    expect(onEnd).toHaveBeenCalledTimes(1);
  });

  it('destroy', () => {
    // 创建渲染树
    const tree = mount(
      <ScrollView
        style={{ height: 20 }}
      >
        <div style={{ height: 200 }}></div>
      </ScrollView>
    );
    // 销毁
    const instance = tree.instance() as ScrollView;
    tree.unmount();
    expect(instance.scroller).toBeNull();
  });


  it('iscroll.scroller.native.dom', () => {
    // 模拟滚动条高度
    ScrollMock.mockScrollView(20, 100);
    // 创建渲染树
    const tree = mount(
      <ScrollView
        style={{ height: 50 }}
      >
        <div style={{ height: 200 }}></div>
      </ScrollView>
    );

    const instance = tree.instance() as ScrollView;
    const scroller = instance.scroller;
    // 断言：保证存在scroller属性
    expect(scroller).not.toBeNull();

    // 断言：存在scrollHeight 且为一个数值
    expect(scroller.scrollHeight).not.toBeNaN();
    expect(scroller.scrollWidth).not.toBeNaN();
    // 断言：存在scrollTop
    expect(scroller.scrollTop).not.toBeNaN();

    // 添加滚动事件s
    const onScroll = jest.fn();
    scroller.addEventListener('scroll', onScroll);
    // 模拟滚动
    instance.scrollTo(10, 20);
    // 断言：存在addEventListener事件
    expect(onScroll).toHaveBeenCalled();
    // 断言scrollTop值为20
    expect(scroller.scrollTop).toBe(20);
    // 无水平滚动条，所以为0
    expect(scroller.scrollLeft).toBe(0);

    onScroll.mockReset();
    // 移除事件
    scroller.removeEventListener('scroll', onScroll);
    scroller.removeEventListener('scroll', null);
    // 模拟滚动
    instance.scrollTo(null, 30);
    // 断言:onScroll不再被调用，已被移除
    expect(onScroll).not.toHaveBeenCalled();
  });

  it('scrollTo', () => {
    // 模拟滚动条高度
    ScrollMock.mockScrollView(20, 100);
    // 创建渲染树
    const tree = mount(
      <ScrollView
        style={{ height: 50 }}
      >
        <div style={{ height: 200 }}></div>
      </ScrollView>
    );
    const instance = tree.instance() as ScrollView;
    const scroller = instance.scroller;
    // 滚动到指定位置
    instance.scrollTo(10, 20);

    // 断言: 当前设置的值应该生效
    expect(scroller.scrollTop).toBe(20);
    // 无水平滚动条，所以为0
    expect(scroller.scrollLeft).toBe(0);
  });

  it('iScroll.pc', () => {
    const userAgent = 'Mozilla/5.0 (11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Safari/604.1';
    Object.defineProperty(navigator, 'userAgent', { configurable: true, value: userAgent });
    // 创建渲染树
    const tree = mount(
      <ScrollView >
        <div ></div>
      </ScrollView>
    );
    tree.setProps({ onScroll: (a: any) => a });
    const scrollView = tree.instance() as ScrollView;
    const context = {
      scrollTop: 0,
      scrollLeft: 0,
    };
    Object.defineProperty(scrollView.containerRef.current, 'scrollTop', {
      set(v) {
        context.scrollTop = v;
      },
    });
    Object.defineProperty(scrollView.containerRef.current, 'scrollLeft', {
      set(v) {
        context.scrollLeft = v;
      },
    });
    scrollView.scrollTo(1, 20);
    // 断言
    expect(context.scrollLeft).toBe(1);
    expect(context.scrollTop).toBe(20);

    // 定义scrollTo 函数
    Object.defineProperty(scrollView.containerRef.current, 'scrollTo', {
      value: jest.fn(),
    });
    const scrollTo = scrollView.containerRef.current.scrollTo;
    scrollView.scrollTo(1, 20);
    // 断言:
    expect(scrollTo).toHaveBeenCalled();

    tree.unmount();
  });
});