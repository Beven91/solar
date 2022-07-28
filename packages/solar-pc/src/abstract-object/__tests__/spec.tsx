import React from 'react';
import App from '../demo/index';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';

describe('abstract-table', () => {
  it('renders correctly', () => {
    const tree = mount(
      <App />
    );
    expect(toJson(tree, { mode: 'deep', noKey: true })).toMatchSnapshot();
  });

  it('renders add mode', () => {
    const tree = mount(
      <App />
    );

    // 模拟点击 新增按钮
    tree.find('.btn-add').last().simulate('click');

    // 匹配镜像
    expect(toJson(tree, { mode: 'deep', noKey: true })).toMatchSnapshot();
  });

  it('renders view mode', () => {
    const tree = mount(
      <App />
    );

    // 模拟点击 查看按钮
    tree.find('.btn-view').last().simulate('click');

    // 匹配镜像
    expect(toJson(tree, { mode: 'deep', noKey: true })).toMatchSnapshot();
  });

  it('renders popup', () => {
    const tree = mount(
      <App />
    );
    // 模拟点击 切换成弹窗模式
    tree.find('.btn-popup').last().simulate('click');

    // 匹配镜像
    expect(toJson(tree, { mode: 'deep', noKey: true })).toMatchSnapshot();
  });

  it('renders submit and cancel', () => {
    const tree = mount(
      <App />
    );
    // 模拟点击 打开视图
    tree.find('.btn-add').last().simulate('click');

    // 这里的单纯测试点击 提交按钮后不出错即可
    tree.find('.btn-submit').last().simulate('click');

    // 这里的单纯测试点击 提交按钮后不出错即可
    tree.find('.btn-back').last().simulate('click');
  });
});
