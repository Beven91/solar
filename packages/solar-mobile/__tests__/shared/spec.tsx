import React from 'react';
import Error from '../../src/shared/Error';
import Notfound from '../../src/shared/Notfound';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';


describe('Crash', () => {
  afterAll(() => {
    location.hash = '';
  });

  it('renders not-found', () => {
    const tree = mount(
      <Notfound />
    );
    expect(toJson(tree)).toMatchSnapshot();
  });

  it('renders not-found title', () => {
    const tree = mount(
      <Notfound title="404页面" />
    );
    expect(toJson(tree)).toMatchSnapshot();
  });

  it('renders not-found back', () => {
    const tree = mount(
      <Notfound />
    );

    const custBack = jest.fn();
    const spyBack = jest.spyOn(history, 'back');
    // 模拟点击
    tree.find('.crash-button').first().simulate('click');
    // 断言：点击后退时，默认调用history.back
    expect(spyBack).toHaveBeenCalledTimes(1);

    // 自定义返回
    tree.setProps({ onClick: custBack });
    // 清除调用记录
    spyBack.mockReset();
    // 模拟点击
    tree.find('.crash-button').first().simulate('click');
    // 断言：当传入自定义后退事件时，仅会触发自定义的onBack
    expect(custBack).toHaveBeenCalledTimes(1);
    // history.back 不会被调用，所以调用次数为0
    expect(spyBack).toHaveBeenCalledTimes(0);
  });


  it('renders error', () => {
    const tree = mount(
      <Error />
    );
    expect(toJson(tree)).toMatchSnapshot();
  });


  it('renders error title', () => {
    location.hash = '';
    const tree = mount(
      <Error title="出错啦..." />
    );
    expect(toJson(tree)).toMatchSnapshot();
  });


  it('renders error back', () => {
    const tree = mount(
      <Error />
    );

    const custBack = jest.fn();
    const spyBack = jest.spyOn(history, 'back');
    // 模拟点击
    tree.find('.crash-button').first().simulate('click');
    // 断言：点击后退时，默认调用history.back
    expect(spyBack).toHaveBeenCalledTimes(1);

    // 自定义返回
    tree.setProps({ onClick: custBack });
    // 清除调用记录
    spyBack.mockReset();
    // 模拟点击
    tree.find('.crash-button').first().simulate('click');
    // 断言：当传入自定义后退事件时，仅会触发自定义的onBack
    expect(custBack).toHaveBeenCalledTimes(1);
    // history.back 不会被调用，所以调用次数为0
    expect(spyBack).toHaveBeenCalledTimes(0);
  });
});
