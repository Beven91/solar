import React from 'react';
import Image from '../../src/image';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';

const mWindow = window as any;

describe('Image', () => {
  it('render default', () => {
    const view = mount(
      <Image src="http://www.ireeder.com/image/a.jpg" />
    );
    expect(toJson(view)).toMatchSnapshot();
  });


  it('render width default url', () => {
    const view = mount(
      <Image src="" defUrl="http://www.ireeder.com/image/a.jpg" />
    );
    // 断言：在未设置src时，应该使用defUrl 具体：参考生成的镜像
    expect(toJson(view)).toMatchSnapshot();
    // 设置src
    view.setProps({ src: 'aliOSSDemoImage' });
    // 断言：设置后应该更新为 设置的src
    expect(toJson(view)).toMatchSnapshot();
  });


  it('render width 云服务器 key', () => {
    const view = mount(
      <Image src="aliOSSDemoImage" />
    );
    expect(toJson(view)).toMatchSnapshot();
  });


  it('autoSize default', () => {
    const view = mount(
      <Image src="aliOSSDemoImage" />
    );
    const imageView = view.instance() as Image;
    // 在默认获取不到图片元素宽度，以及window.screen.width 时默认使用375
    // 然后再根据 size * window.devicePixelRatio
    expect(imageView.autoSize).toBe('375');
  });


  it('autoSize devicePixelRatio', () => {
    const rectangleMock = jest.fn();
    const view = mount(
      <Image src="aliOSSDemoImage" />
    );
    const imageView = view.instance() as Image;
    // 设置成2倍dpr
    mWindow.devicePixelRatio = 2;
    // 断言：默认返回的size应该750
    expect(imageView.autoSize).toBe('750');

    // 设置devicePixelRatio为undefined 模拟不支持devicePixelRatio
    mWindow.devicePixelRatio = undefined;
    // 断言：默认返回的size应该750
    expect(imageView.autoSize).toBe('375');

    view.getDOMNode().getBoundingClientRect = rectangleMock;

    // 设置成2倍dpr
    const mockWidth = 120;
    mWindow.devicePixelRatio = 2;
    // 模拟设置图片宽度度为:120
    rectangleMock.mockReturnValueOnce({ width: mockWidth });
    // 断言：返回的分比率宽度值为:240(  120 * window.devicePixelRatio )
    expect(imageView.autoSize).toBe('240');

    // 设置图片设定的宽度大于最大宽度800
    rectangleMock.mockReturnValueOnce({ width: 900 });
    // 断言：裁剪分辨率宽度为: 1600 而不是 1800 因为Image组件有限制最大宽度
    expect(imageView.autoSize).toBe('1600');
  });


  it('autoSize window.screen.width', () => {
    const imageView = new Image({ src: '' });
    // 设置成2倍dpr
    mWindow.devicePixelRatio = 2;
    Object.defineProperty(window.screen, 'width', { value: 400, configurable: true });
    expect(imageView.autoSize).toBe('800');
  });


  // it('getAutoKey', () => {
  //   const view = mount(
  //     <Image src="aliOSSDemoImage" />
  //   );
  //   // 在未显示指定裁剪宽度时
  //   // 使用默认值
  //   expect(view.instance().getAutoKey('A')).toBe('A?x-oss-process=image/resize,w_800');
  // });


  it('support webp', () => {
    // 清除缓存重新加载Image组件
    jest.resetModules();
    // 模拟支持webp
    const support = require('../../src/image/support');
    // 设置成true
    support.supportWebp = true;
    // 重新加载Image组件
    const Image = require('../../src/image').default;

    const view = mount(
      <Image src="aliOSSDemoImage" />
    );
    const instance = view.instance() as Image;
    // 在未显示指定裁剪宽度时
    // 使用默认值
    expect(instance.getAutoKey('A')).toContain('format,webp');

    // 断言：支持webp的镜像
    expect(toJson(view)).toMatchSnapshot();

    // 更新属性 :在属性不改变时，不触发刷新
    view.setProps({ src: 'aliOSSDemoImage' });
    // 断言：镜像
    expect(toJson(view)).toMatchSnapshot();
  });


  // 最长参数
  it('no src', () => {
    const view = mount(
      <Image src={undefined} />
    );
    // 断言：支持webp的镜像
    expect(toJson(view)).toMatchSnapshot();
  });


  it('support', () => {
    jest.resetModules();
    const mDocument = document as any;
    const createElement = document.createElement;
    mDocument.createElement = function(type: any) {
      const element = createElement(type);
      if (type === 'canvas') {
        element.toDataURL = function() {
          throw new Error('模拟异常');
        };
      }
    };
    expect(require('../../src/image/support').supportWebp).toBe(false);
  });
});

