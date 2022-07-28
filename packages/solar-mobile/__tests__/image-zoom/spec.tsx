import React from 'react';
import PinchZoom from 'pinch-zoom-js';
import ImageZoom from '../../src/image-zoom';
import AnimatePolyfill from '../../src/polyfill/requestAnimation';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';

jest.mock('pinch-zoom-js');

describe('ImageZoom', () => {
  it('zoom full parameter', () => {
    const tree = mount(
      <ImageZoom>
        <img
          className="with-zoom"
          src="https://static.solar.cn/T16lVbB4J41RCvBVdK.jpg?img=/rs,w_100"
          data-zoom="https://static.solar.cn/T16lVbB4J41RCvBVdK.jpg"
        />
      </ImageZoom>
    );

    // 断言：对比默认的渲染是否一致
    expect(toJson(tree)).toMatchSnapshot();

    let zoomContainer = null as HTMLDivElement;

    const mock = PinchZoom as any as jest.MockInstance<any, any>;

    mock.mockImplementation((div) => zoomContainer = div);

    // 模拟点击放大
    tree.find('.with-zoom').simulate('click');
    // 断言：是否调用了PinchZoom插件
    expect(PinchZoom).toHaveBeenCalledTimes(1);
    expect(PinchZoom).toBeCalledWith(zoomContainer);
    // 断言：通过PinchZoom渲染后的body的渲染是否一致
    expect(document.body).toMatchSnapshot();

    // 测试点击浮层 关闭放大弹窗
    zoomContainer.click();
    // 断言：渲染
    expect(document.body).toMatchSnapshot();
  });


  it('zoom img without data-zoom', () => {
    document.body.innerHTML = '';
    const tree = mount(
      <ImageZoom>
        <img className="default" src="https://static.solar.cn/T16lVbB4J41RCvBVdK.jpg?img=/rs,w_100" />
      </ImageZoom>
    );

    // 断言：对比默认的渲染是否一致
    expect(toJson(tree)).toMatchSnapshot();

    // 模拟点击放大
    tree.find('.default').simulate('click');
    // 断言：通过PinchZoom渲染后的body的渲染是否一致
    expect(document.body).toMatchSnapshot();
  });


  it('zoom img no src', () => {
    document.body.innerHTML = '';
    const tree = mount(
      <ImageZoom>
        <img className="default" />
      </ImageZoom>
    );

    // 断言：对比默认的渲染是否一致
    expect(toJson(tree)).toMatchSnapshot();

    // 模拟点击放大
    tree.find('.default').simulate('click');
    // 断言：通过PinchZoom渲染后的body的渲染是否一致
    expect(document.body).toMatchSnapshot();
  });


  it('polyfill', () => {
    const fn = jest.fn();
    const fn2 = jest.fn();
    jest.useFakeTimers();

    AnimatePolyfill.requestAnimationFrame(fn);
    // 时间推进1秒
    jest.advanceTimersByTime(1000);
    // 断言：requestAnimationFrame 的fn被执行一次
    expect(fn).toHaveBeenCalledTimes(1);

    const id = AnimatePolyfill.requestAnimationFrame(fn2);
    // 取消 requestAnimationFrame
    AnimatePolyfill.cancelAnimationFrame(id);
    // 时间推进1秒
    jest.advanceTimersByTime(1000);
    // 断言：requestAnimationFrame 的fn不会被执行，因为：被取消
    expect(fn2).toHaveBeenCalledTimes(0);

    // 清除require模块缓存
    const fn3 = jest.fn();
    jest.resetModules();
    window.requestAnimationFrame = null;
    window.cancelAnimationFrame = null;
    require('../../src/image-zoom').default;
    window.requestAnimationFrame(fn3);
    // 时间推进1秒
    jest.advanceTimersByTime(1000);
    // 断言：requestAnimationFrame 的fn被执行一次
    expect(fn3).toHaveBeenCalledTimes(1);
  });
});

