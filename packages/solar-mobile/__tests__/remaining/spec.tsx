import React from 'react';
import Remaining, { CurrentState } from '../../src/remaining';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';

describe('Remaining', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  it('default', () => {
    const tree = mount(
      <Remaining remaining={55} />
    );
    // 断言：开始倒计时前的UI渲染
    expect(toJson(tree)).toMatchSnapshot();
    // 时间前进3秒
    jest.advanceTimersByTime(3000);
    tree.update();
    // 断言：3秒后的UI显示
    expect(toJson(tree)).toMatchSnapshot();

    const instance = tree.instance() as any;
    const id = instance.timerId;
    // 测试销毁
    tree.unmount();
    // 断言：在销毁时，应该清除setInterval
    expect(clearInterval).toBeCalledWith(id);
  });

  it('onend', () => {
    const fn = jest.fn();
    const tree = mount(
      <Remaining remaining={0} onEnd={fn} />
    );
    // 断言：由于设置的remaining值为0 所以会立即调用onEnd
    expect(fn).toHaveBeenCalledTimes(1);
    // 断言：开始倒计时前的UI渲染
    expect(toJson(tree)).toMatchSnapshot();

    // 更新属性remaining
    tree.setProps({ remaining: 3 });

    // 时间前进4秒
    jest.advanceTimersByTime(4000);
    tree.update();
    // 断言：4秒后的UI显示
    expect(toJson(tree)).toMatchSnapshot();
    // 断言：4秒后倒计时已结束，会再次调用onEnd
    expect(fn).toHaveBeenCalledTimes(2);

    // 再次更新属性:设置onEnd 以及remaining 为1 测试在onEnd不设置情况下不出异常
    tree.setProps({ onEnd: null, remaining: 1 });
    // 时间前进2秒
    jest.advanceTimersByTime(2000);
  });


  it('custom', () => {
    function handleProcess(date: CurrentState) {
      return (
        <div className="custom">
          {date.hour}:{date.minutes}:{date.seconds}
        </div>
      );
    }
    const tree = mount(
      <div>
        <Remaining remaining={86400} onProcessing={handleProcess} />
      </div>
    );
    // 时间前进3秒
    jest.advanceTimersByTime(3000);
    tree.update();
    // 断言：3秒后的UI显示
    expect(toJson(tree)).toMatchSnapshot();
  });


  it('format {day}天 {hour}：{minutes}：{seconds}', () => {
    const tree = mount(
      <Remaining remaining={160000} format="{day}天 {hour}：{minutes}：{seconds}" unit="day" />
    );
    // 时间前进3秒
    jest.advanceTimersByTime(3000);
    tree.update();
    // 断言：3秒后的UI显示
    expect(toJson(tree)).toMatchSnapshot();
  });


  it('format hour', () => {
    const tree = mount(
      <Remaining remaining={3605} unit="hour" />
    );
    // 时间前进3秒
    jest.advanceTimersByTime(3000);
    tree.update();
    // 断言：3秒后的UI显示
    expect(toJson(tree)).toMatchSnapshot();
  });


  it('format minutes', () => {
    const tree = mount(
      <Remaining remaining={3500} unit="minutes" format="{minutes}：{seconds}" />
    );
    // 时间前进3秒
    jest.advanceTimersByTime(3000);
    tree.update();
    // 断言：3秒后的UI显示
    expect(toJson(tree)).toMatchSnapshot();
  });


  it('format seconds', () => {
    const tree = mount(
      <Remaining remaining={60} unit="seconds" format="{seconds}" />
    );
    // 时间前进3秒
    jest.advanceTimersByTime(3000);
    tree.update();
    // 断言：3秒后的UI显示
    expect(toJson(tree)).toMatchSnapshot();
  });


  it('componentWillReceiveProps', () => {
    const tree = mount(
      <Remaining remaining={60} unit="seconds" format="{seconds}" />
    );
    const remaining = tree.instance() as Remaining;
    remaining.onRun = jest.fn();

    tree.setProps({ remaining: 10 });
    // 断言：当设置的倒计时总量发生变更时，会重置
    expect(remaining.onRun).toHaveBeenCalledTimes(1);

    tree.setProps({ remaining: 10 });
    // 断言：当设置倒计时总量与之前一致时，不执行重置
    expect(remaining.onRun).toHaveBeenCalledTimes(1);
  });


  it('format function', () => {
    const remaining = new Remaining({ remaining: undefined });

    // 测试在没有传递 data以及没有设置format情况下，是否会出异常
    expect(remaining.format(null)).toBeUndefined();

    const remaining2 = new Remaining({ remaining: undefined, format: '{name}:{seconds}' });
    expect(remaining2.format({ name: '剩余时间', seconds: '10' })).toBe('剩余时间:10');
  });

  it('renderDisplay', () => {
    const tree = mount(
      <Remaining remaining={60} unit="seconds" format="{seconds}" />
    );

    const instance = tree.instance() as Remaining;
    tree.setState({ date: undefined });

    instance.renderDisplay();
  });
});

