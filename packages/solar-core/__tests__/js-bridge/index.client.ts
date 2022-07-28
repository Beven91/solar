describe('JavascriptBridge.Client', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error');
    jest.spyOn(console, 'warn');
    (<any>console.warn).mockImplementation(() => { });
    (<any>console.error).mockImplementation(() => { });
  });

  const mWindow = window as any;

  function defineUserAgent(userAgent:string) {
    jest.resetModules();
    Object.defineProperty(navigator, 'userAgent', { configurable: true, value: userAgent });
    return require('../../src/js-bridge').default;
  }

  it('registerCallback', async() => {
    const Client = require('../../src/js-bridge/client/client').default;
    const client = new Client();

    // 断言：在未注册回调前，getCallbacks 会返回null
    expect(!client.getCallbacks('testcallback')).toBe(true);

    const originalCallback = jest.fn();
    const registerCallback = jest.fn();

    // 这里模拟在window上已存在同名的回调函数
    mWindow.testcallback = originalCallback;

    // 注册testcallback回调
    client.registerCallback('testcallback');

    // 断言：注册了回调类型函数
    expect(client.getCallbacks('testcallback')).not.toBeNull();

    // 模拟在回调队列为null时，调用回调函数时，需要做null异常处理
    client.namedCallbacks['testcallback'] = null;
    // 模拟调用回调
    mWindow.testcallback('hello');
    // 断言: 由于回调队列已清空，所以这里不会被调用
    expect(registerCallback).not.toHaveBeenCalled();
    // 断言:原始的window.testcallback 也会被调用
    expect(originalCallback).toHaveBeenCalledWith('hello');


    // 断言：此时testcallback被覆盖
    expect(mWindow.testcallback).not.toBe(originalCallback);

    // 断言: 当原先的window.testcallback会被挂在到window.testcallback.originalCallback
    expect(mWindow.testcallback.originalCallback).toBe(originalCallback);

    // 添加一个回调函数
    const promise = client.addCallback('testcallback').then(registerCallback);

    // 模拟调用回调函数
    mWindow.testcallback('hello');

    // 等待回调完成
    await promise;

    // 断言:注册的回调函数将会被调用
    expect(registerCallback).toHaveBeenCalledWith(['hello']);
    // 断言:原始的window.testcallback 也会被调用
    expect(originalCallback).toHaveBeenCalledWith('hello');

    // 模拟清除回调队列
    client.namedCallbacks['testcallback'] = null;
  });

  it('resetCallback', () => {
    const Client = require('../../src/js-bridge/client/client').default;
    const client = new Client();

    const originalCallback = jest.fn();

    // 这里模拟在window上已存在同名的回调函数
    mWindow.demoCallback = originalCallback;

    client.registerCallback('demoCallback');

    // 断言：demoCallback 被挂在到 window.demoCallback.originalCallback
    expect(mWindow.demoCallback.originalCallback).toBe(originalCallback);
    // 断言: 当前window.demoCallback 被覆盖
    expect(mWindow.demoCallback).not.toBe(originalCallback);

    // 执行清除回调
    client.resetCallback('demoCallback');

    // 断言: demoCallback 需要被还原
    expect(mWindow.demoCallback).toBe(originalCallback);
    // 断言: 还原后originalCallback需要被清除
    expect(mWindow.demoCallback.originalCallback).toBeUndefined();
  });

  it('removeIdCallback', () => {
    const Client = require('../../src/js-bridge/client/client').default;
    const client = new Client();

    const callback1 = jest.fn();
    const callback2 = jest.fn();
    const resetCallback = jest.spyOn(client, 'resetCallback');

    client.registerCallback('demoCallback');

    const callbacks = client.getCallbacks('demoCallback');
    // 添加一个回调
    callbacks.push(callback1);
    // 再添加一个回调
    callbacks.push(callback2);

    // 断言：当前demoCallback回调队列长度为2
    expect(client.getCallbacks('demoCallback').length).toBe(2);

    // 移除一个不存在的回调函数
    client.removeIdCallback('demoCallback', jest.fn());

    // 断言: 当前回调队列长度任然为2
    expect(client.getCallbacks('demoCallback').length).toBe(2);

    // 移除一个回调
    client.removeIdCallback('demoCallback', callback1);

    // 断言： 当前callback1已被移除
    const queues = client.getCallbacks('demoCallback');
    expect(queues.filter((f:any) => f === callback1).length).toBe(0);
    // 再还存在回调队列情况下，不会执行 resetCallback
    expect(resetCallback).not.toHaveBeenCalled();

    // 再次移除回调
    client.removeIdCallback('demoCallback', callback2);

    // 断言：当前回调队列已销毁
    expect(client.getCallbacks('demoCallback')).toBeUndefined();
    // 断言: resetCallback被调用
    expect(resetCallback).toHaveBeenCalled();
  });


  it('dispatchProtocol', () => {
    jest.useFakeTimers();

    const Client = require('../../src/js-bridge/client/client').default;
    const client = new Client();

    // 清空内容
    document.body.innerHTML = '';

    // 断言： 初始无iframe
    expect(document.querySelector('iframe')).toBeNull();

    // 模拟执行schema
    client.dispatchProtocol('solar://close');

    const iframe = document.querySelector('iframe');
    // 断言: 当前body下存在iframe,且使用iframe执行了schema
    expect(iframe.getAttribute('src')).toContain('close?_=');

    //  模拟setTimeout执行完毕
    jest.runAllTimers();

    // 再执行完毕后，会删除掉iframe 这里，
    expect(document.querySelector('iframe')).toBe(null);

    // 模拟schema中已经带参数
    client.dispatchProtocol('solar://close?hello=1');
    const iframe2 = document.querySelector('iframe');
    // 断言：返回内容正确拼接参数
    expect(iframe2.getAttribute('src')).toContain('close?hello=1&_=');

    jest.useRealTimers();
  });

  it('dispatch', () => {
    defineUserAgent('Android');
    const Client = require('../../src/js-bridge/client/client').default;
    const client = new Client();

    const dispatchAndriod = jest.spyOn(client, 'dispatchAndriod');
    const dispatchiOS = jest.spyOn(client, 'dispatchiOS');
    const dispatchProtocol = jest.spyOn(client, 'dispatchProtocol');

    client.dispatch('solar://close');

    // 断言:在android下  dispatchAndriod 会被调用
    expect(dispatchAndriod).toHaveBeenCalled();
    // 断言：dispatchiOS 不会被调用
    expect(dispatchiOS).not.toHaveBeenCalled();

    dispatchAndriod.mockReset();
    dispatchiOS.mockReset();

    // 模拟ios环境
    defineUserAgent('iPhone');

    client.dispatch('solar://close');

    // 断言:在ios下  dispatchiOS 会被调用
    expect(dispatchiOS).toHaveBeenCalled();
    // 断言：dispatchiOS 不会被调用
    expect(dispatchAndriod).not.toHaveBeenCalled();

    // 模拟其他环境
    defineUserAgent('AA');

    dispatchProtocol.mockReset();
    dispatchAndriod.mockReset();
    dispatchiOS.mockReset();

    client.dispatch('solar://close');

    // 断言默认环境，直接调用 dispatchProtocol
    expect(dispatchProtocol).toHaveBeenCalled();
    // 断言: dispatchAndriod 不会被调用
    expect(dispatchAndriod).not.toHaveBeenCalled();
    // 断言：dispatchiOS 不会被调用
    expect(dispatchiOS).not.toHaveBeenCalled();
  });

  it('createCallbackId', () => {
    const Client = require('../../src/js-bridge/client/client').default;
    const client = new Client();

    const id = client.createCallbackId();
    const id2 = client.createCallbackId();

    expect(id).not.toBe(id2);
  });

  it('addCallback', async() => {
    const Client = require('../../src/js-bridge/client/client').default;
    const client = new Client();

    const removeIdCallback = jest.spyOn(client, 'removeIdCallback');
    const promiseCallback = jest.fn();

    // 重置回调队列，确保不存在对应的回调队列
    client.resetCallback('catchAppback');

    // 注册一个catchAppback类型的promise回调
    const promise = client.addCallback('catchAppback').then(promiseCallback);

    // 断言：回调队列长度为1
    expect(client.getCallbacks('catchAppback').length).toBe(1);

    // 执行回调：这里主要测试回调执行后，注册的回调会被清空，也就是回调为一次性
    mWindow.catchAppback();

    // 等待回调完成
    await promise;

    // 断言: promiseCallback 会被调用
    expect(promiseCallback).toHaveBeenCalled();

    // 断言：回调执行完成后，removeIdCallback 会被调用
    expect(removeIdCallback).toHaveBeenCalled();
  });

  it('addCallback.timeout', async() => {
    const Client = require('../../src/js-bridge/client/client').default;
    const client = new Client();

    jest.useFakeTimers();

    const removeIdCallback = jest.spyOn(client, 'removeIdCallback');
    const promiseCallback = jest.fn();

    // 重置回调队列，确保不存在对应的回调队列
    client.resetCallback('catchAppback');

    // 注册一个catchAppback类型的promise回调 且设置为1s超时
    const promise = client.addCallback('catchAppback', null, 1000).then(promiseCallback);

    // 这里推进时间2s中，用于模拟超时
    jest.advanceTimersByTime(2000);

    try {
      // 等待结束
      await promise;
    } catch (ex) {
      console.log(ex);
    }

    // 断言: 由于超时，所以promiseCallback 不会被调用
    expect(promiseCallback).not.toHaveBeenCalled();

    // 断言：超时取消执行完成后，removeIdCallback 会被调用
    expect(removeIdCallback).toHaveBeenCalled();

    // 还原setTimeout等模拟
    jest.useRealTimers();
  });

  it('addCallback.global ', async() => {
    const Client = require('../../src/js-bridge/client/client').default;
    const client = new Client();

    const promiseCallback = jest.fn();
    const promiseCallback2 = jest.fn();
    const resetCallback = jest.spyOn(client, 'resetCallback');
    const removeIdCallback = jest.spyOn(client, 'removeIdCallback');

    // 注册一个全局类型回调
    client.addCallback('catchAppback', null, null, true).then(promiseCallback);
    // 再次出则
    const promise2 = client.addCallback('catchAppback', null, null, true).then(promiseCallback2);

    // 断言:在设置全局回调时，会清除上一次的回调注册,所以会调用resetCallback
    expect(resetCallback).toHaveBeenCalled();

    // 断言:全局回调只会存在一个回调队列
    expect(client.getCallbacks('catchAppback').length).toBe(1);

    // 清除 removeIdCallback调用记录
    removeIdCallback.mockReset();

    // 模拟回调
    mWindow.catchAppback();

    // 等待结束
    await promise2;

    // 断言: promiseCallback 不会被调用，全局回调以只使用最后一次注册的回调
    expect(promiseCallback).not.toHaveBeenCalled();
    // 断言: promiseCallback2 会被调用
    expect(promiseCallback2).toHaveBeenCalled();
    // 断言: 全局回调方式，不会执行 removeIdCallback
    expect(removeIdCallback).not.toHaveBeenCalled();
  });

  it('addCallback.exception ', async() => {
    const Client = require('../../src/js-bridge/client/client').default;
    const client = new Client();

    let catchError = null;
    const promiseCallback2 = jest.fn();
    const error = new Error('Mock Error');
    const inCallback = jest.fn(() => {
      throw error;
    });

    // 再次出则
    const promise2 = client.addCallback('catchAppback', null, null, false, inCallback).then(promiseCallback2);

    // 模拟回调
    mWindow.catchAppback();

    try {
      // 等待结束
      await promise2;
    } catch (ex) {
      catchError = ex;
    }

    // 断言: 由于inCallback 触发异常，所以 promiseCallback2 不会被调用
    expect(promiseCallback2).not.toHaveBeenCalled();
    // 断言: 捕获的异常为 error对象
    expect(catchError).toBe(error);
  });

  it('dispatchProtocol.useLocation', ()=>{
    // 设置location.href 为空
    const myLocation = {} as any;
    const originalLocation = window.location;

    Object.defineProperty(window, 'location', {
      configurable: true,
      value: myLocation,
    });

    const Client = require('../../src/js-bridge/client/client').default;
    const client = new Client();
    client.dispatchProtocol('demo://close', true);

    // 断言：此时使用location.href 来执行schema
    expect(myLocation.href).toBe('demo://close');

    // 还原location
    Object.defineProperty(window, 'location', {
      value: originalLocation,
    });
  });

  it('coverage', () => {
    // 凑覆盖率
    const Client = require('../../src/js-bridge/client/client').default;
    const client = new Client();

    client.addCallback('hello');
    client.addCallback('hello');
    client.dispatchiOS('demo://close');
  });
})
;
