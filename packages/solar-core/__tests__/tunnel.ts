/**
 * @module TunnelTest
 * @name 测试 Tunnel模块
 * @description
 */

import Tunnel from '../src/tunnel';

describe('Tunnel', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  test('work correctly', () => {
    const fn = jest.fn();
    const param = 'hello world';
    // 绑定hello消息监听
    Tunnel.pull('hello', fn);
    // 推送一个消息
    Tunnel.push('hello', param);

    jest.runOnlyPendingTimers();

    // 断言：fn被调用，且fn会传入参数值 hello world
    expect(fn).toHaveBeenCalledWith(param);

    fn.mockReset();
    // 解绑
    Tunnel.off('hello', fn);
    // 再次推送一条消息
    Tunnel.push('hello', 'every');
    // 断言：fn不会被调用，因为已经解除消息监听了
    expect(fn).not.toHaveBeenCalled();
  });

  test('reset', () => {
    const fn = jest.fn();
    const fn2 = jest.fn();
    const param = 'hello world';
    // 绑定hello消息监听
    Tunnel.pull('hello', fn);
    // 再绑定一个监听
    Tunnel.pull('hello', fn2);
    // 推送一个消息
    Tunnel.push('hello', param);

    jest.runOnlyPendingTimers();

    // 断言：fn被调用，且fn会传入参数值 hello world
    expect(fn).toHaveBeenCalledWith(param);
    expect(fn).toHaveBeenCalledWith(param);

    const fn3 = jest.fn();
    fn.mockReset();
    fn2.mockReset();
    // 在此绑定一个消息监听，且传入重置操作
    Tunnel.pull('hello', fn3, true);

    // 推送一个消息
    Tunnel.push('hello', param);

    jest.runOnlyPendingTimers();

    // 断言：由于重置了，所以fn 与fn2 都不会被调用
    expect(fn).not.toHaveBeenCalled();
    expect(fn2).not.toHaveBeenCalled();
    // 断言：新的消息监听会被调用
    expect(fn3).toHaveBeenCalledWith(param);
  });

  test('off', ()=>{
    const fn = jest.fn();
    // 绑定hello消息监听
    const off = Tunnel.pull('hello', fn);

    // 推送消息
    Tunnel.push('hello');
    jest.runOnlyPendingTimers();

    // 断言：fn被调用
    expect(fn).toHaveBeenCalled();

    // 重置调用记录
    fn.mockReset();
    // 解除监听
    off();
    // 再次推送消息
    Tunnel.push('hello');
    jest.runOnlyPendingTimers();

    // 断言: fn没有被调用，因为已经解除监听
    expect(fn).not.toHaveBeenCalled();
  });

  test('create', ()=>{
    const fn = jest.fn();
    const tunnel = Tunnel.create();

    // 断言: fn此时还没有被调用
    expect(fn).not.toHaveBeenCalled();

    tunnel.pull('my', fn);

    // 推送消息
    tunnel.push('my', 'hello');
    jest.runOnlyPendingTimers();

    // 断言: fn被调用, 且参数值为hello
    expect(fn).toHaveBeenCalledWith('hello');
  });
});
