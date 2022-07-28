import { JssdkOptions } from '../../src/js-bridge/client/jssdk';
import JssdkWrapper from '../../src/js-bridge/client/jssdk-wrapper';
import JsBridge from '../../src/js-bridge/index';

const position = {
  latitude: '103',
  longitude: 102,
};

const defaultPosition = {
  latitude: 100,
  longitude: 100,
};

const demoJssdk: JssdkOptions = {
  match() {
    return true;
  },
  name: '案例Jssdk',
  protocol: 'demo',
  getInstance: () => ({}),
  methods: {
    getGpsLocation: () => position,
  },
};

const defaultJssdk = {
  name: '默认Jssdk',
  match: () => true,
  getInstance: () => ({}),
  methods: {
    getGpsLocation: () => defaultPosition,
  },
};

const mockRuntime = {
  mock: null as any,
  mockRestore: () => {
    if (mockRuntime.mock) {
      mockRuntime.mock.mockRestore();
    }
  },
};

const mockEnableJsBridge = (handler: Function) => {
  const runtime = {
    function: null as any,
    mockResolve: null as any,
  };
  if (!mockRuntime.mock) {
    mockRuntime.mock = jest.spyOn(JsBridge, 'loadScript');
  }
  runtime.function = mockRuntime.mock;
  mockRuntime.mock.mockImplementation(() => {
    return new Promise((resolve) => {
      runtime.mockResolve = () => {
        handler();
        resolve({});
      };
    });
  });
  // 重置状态
  JsBridge.status = 'init';
  // 模拟加载jssdk
  JsBridge.enable('https://www.solar.com/jssdk.js');
  return runtime;
};


describe('JavascriptBridge', () => {
  beforeEach(() => {
    mockRuntime.mockRestore();
    JsBridge.jssdk = null;
    JsBridge.defaultJssdk = null;
  });

  it('new', () => {
    // 断言：初始化状态以下几个属性
    expect(JsBridge.status).toBe('init');
    expect(JsBridge.jssdk).toBeNull();
    expect(JsBridge.defaultJssdk).toBeNull();
  });

  it('enable', async() => {
    // mock loadScript
    const mock = mockEnableJsBridge(() => {
      JsBridge.register(demoJssdk);
    });

    // 断言:loadScript将被调用
    expect(mock.function).toHaveBeenCalledTimes(1);
    // 这里模拟在加载过程中，重复调用enable函数
    JsBridge.enable('https://www.solar.com/jssdk.js');
    // 断言: loadScript调用次数仍然为1,因为 enable不会被重复调用
    expect(mock.function).toHaveBeenCalledTimes(1);

    // 模拟在jssdk.js在加载中，调用了jsbridge函数
    const getGpsCallback = jest.fn();
    const getGpsCallback2 = jest.fn();
    const p1 = JsBridge.callNative('getGpsLocation').then((data) => getGpsCallback(data));
    const p2 = JsBridge.callUrl('jssdk://getGpsLocation').then(getGpsCallback2);

    // 断言：此时getGpsCallback 还不会被执行
    expect(getGpsCallback).not.toHaveBeenCalled();
    expect(getGpsCallback2).not.toHaveBeenCalled();

    // 模拟jssdk.js已加载完毕
    mock.mockResolve();
    // 断言: bridge 已存在
    expect(JsBridge.jssdk).toBeInstanceOf(JssdkWrapper);

    // 等待执行结束
    await p1;
    await p2;

    // 断言：此时getGpsCallback 被调用，且返回参数
    expect(getGpsCallback).toHaveBeenCalledWith(position);
    expect(getGpsCallback2).toHaveBeenCalledWith(position);

    // 这里模拟在jsBridge已经加载完毕后，重复调用enable函数
    JsBridge.enable('https://www.solar.com/jssdk.js');
    // 断言: loadScript调用次数仍然为1,因为 enable不会被重复调用
    expect(mock.function).toHaveBeenCalledTimes(1);
  });

  it('register', () => {
    JsBridge.register(undefined);
    // 断言: 当传递了null时，不会进行注册
    expect(JsBridge.jssdk).toBeNull();

    // 注册
    JsBridge.register(demoJssdk);
    // 断言此时的bridge已创建
    expect(JsBridge.jssdk).toBeInstanceOf(JssdkWrapper);
    // 此时的platform值为demoJssdk.name
    expect(JsBridge.platform).toBe(demoJssdk.name);

    // 此时再进行注册
    JsBridge.register({
      match: () => true,
      name: 'demo2',
    } as any);

    // 断言：由于JsBridge.bridge已存在，此时不会进行注册
    expect(JsBridge.jssdk.options).toBe(demoJssdk);
  });

  it('register.match', () => {
    let error = null;
    try {
      JsBridge.register({
        name: 'hello',
      } as any);
    } catch (ex) {
      error = ex;
    }
    // 断言: 此时会触发error 在没有传递match函数情况下
    expect(error.message).toContain('match函数');

    // 断言:此时bridge为null
    expect(JsBridge.jssdk).toBeNull();

    // 注册一个bridge,但是没有匹配上当前环境
    JsBridge.register({
      match: () => false,
    } as any);

    // 断言:此时bridge仍然为null，因为match函数返回了false
    expect(JsBridge.jssdk).toBeNull();
  });

  it('registerDefault', () => {
    // 断言:此时 JsBridge.bridge为null
    expect(JsBridge.jssdk).toBeNull();
    expect(JsBridge.defaultJssdk).toBeNull();

    // 注册垫底jssdk
    JsBridge.registerDefault(defaultJssdk);

    // 断言：由于没有注册bridge,此时bridge仍然为null
    expect(JsBridge.jssdk).toBeNull();
    // 断言：此时存在defaulter
    expect(JsBridge.defaultJssdk).toBeInstanceOf(JssdkWrapper);
    expect(JsBridge.platform).toBe(defaultJssdk.name);

    // 在已存在defaulter情况下，继续调用registerDefault ，在已存在的情况，将不会重复注册
    JsBridge.registerDefault(demoJssdk);

    // 断言:此时的JsBridge.defaultJssdk 仍然为 defaultJssdk
    expect(JsBridge.defaultJssdk.options).toBe(defaultJssdk);
  });

  it('isSdkUrl', () => {
    const commonUrl = 'jssdk://getGpsLocation';
    const demoUrl = 'demo://getGpsLocation';
    // 断言:再没有注册bridge情况下，任何url都返回false
    expect(JsBridge.isSdkUrl(commonUrl)).toBe(false);
    expect(JsBridge.isSdkUrl(demoUrl)).toBe(false);

    // 注册默认jssdk
    JsBridge.registerDefault(defaultJssdk);

    // 断言:再存在默认jssdk情况下，jssdk:// 协议的url 返回true
    expect(JsBridge.isSdkUrl(commonUrl)).toBe(true);
    // 断言： demo:// 协议 返回 false
    expect(JsBridge.isSdkUrl(demoUrl)).toBe(false);


    // 注册demoJssdk
    JsBridge.register(demoJssdk);

    // 断言:再存在jssdk情况下，jssdk:// 协议的url 返回true
    expect(JsBridge.isSdkUrl(commonUrl)).toBe(true);
    // 断言： demo:// 协议 返回 true 因为当前jssdk为demoJssdk demoJssdk的protocl=== demo
    expect(JsBridge.isSdkUrl(demoUrl)).toBe(true);
    // 断言:  demo2:// 协议的url 返回false
    expect(JsBridge.isSdkUrl('demo2://getGpsLocation')).toBe(false);
  });

  it('defaultErrorHandle', async() => {
    // 默认环境变量断言
    expect(JsBridge.platform).toBe('');
    expect(JsBridge.jssdk).toBeNull();
    expect(JsBridge.defaultJssdk).toBeNull();
    // 在没有defaulter情况下，触发error时，不会进行垫底处理
    const resolve = jest.fn();
    const reject = jest.fn();

    // 调用getGpsLocation
    await JsBridge.callNative('getGpsLocation').then(resolve, reject);

    // 断言：由于没有垫底jssdk同时此时本身也没有注册jssdk,当前调用会触发异常
    expect(resolve).not.toHaveBeenCalled();
    expect(reject).toHaveBeenCalled();


    resolve.mockReset();
    reject.mockReset();
    // 注册 defaulter
    JsBridge.registerDefault(defaultJssdk);

    // 调用getGpsLocation
    await JsBridge.callNative('getGpsLocation').then(resolve, reject);

    // 由于当前defaultjssdk能处理getGpsLocation 所以此时 会调用成功
    expect(resolve).toHaveBeenCalledWith(defaultPosition);
    expect(reject).not.toHaveBeenCalled();

    // 调用一个不存在的函数,此时defaulter页没有改函数垫底
    resolve.mockReset();
    reject.mockReset();

    // 调用getGpsLocation2
    await JsBridge.callNative('close').then(resolve, reject);

    // 由于当前defaultjssdk不能处理close 所以此时调用失败
    expect(resolve).not.toHaveBeenCalled();
    expect(reject).toHaveBeenCalled();
  });

  it('callUrl', async() => {
    const commonUrl = 'jssdk://getGpsLocation';
    const demoUrl = 'demo://getGpsLocation';

    // 在没有注册jssdk情况下，调用返回-102
    const resolve = jest.fn();
    const reject = jest.fn();

    // 断言： 此时会调用失败，且返回 -102
    await JsBridge.callUrl(demoUrl).then(resolve, reject);
    expect(resolve).not.toHaveBeenCalled();
    expect(reject.mock.calls[0][0].code).toBe(-102);

    resolve.mockReset();
    reject.mockReset();

    // 断言： 使用jssdk://协议调用，在没有注册情况，返回 -102
    await JsBridge.callUrl(commonUrl).then(resolve, reject);
    expect(resolve).not.toHaveBeenCalled();
    expect(reject.mock.calls[0][0].code).toBe(-102);

    // 注册jssdk
    JsBridge.register(demoJssdk);

    // 断言：在注册了jssdk,调用返回正确的值
    resolve.mockReset();
    reject.mockReset();
    await JsBridge.callUrl(commonUrl).then(resolve, reject);
    expect(resolve).toHaveBeenCalledWith(position);
    expect(reject).not.toHaveBeenCalled();

    // 模拟，调用了一个不存在的函数url,会调用返回 -103
    resolve.mockReset();
    reject.mockReset();
    await JsBridge.callUrl('jssdk://close').then(resolve, reject);
    expect(resolve).not.toHaveBeenCalled();
    expect(reject.mock.calls[0][0].code).toBe(-103);

    // 模拟，调用了一个不能识别的url,会调用返回 -101
    resolve.mockReset();
    reject.mockReset();
    await JsBridge.callUrl('unkonw://close').then(resolve, reject);
    expect(resolve).not.toHaveBeenCalled();
    expect(reject.mock.calls[0][0].code).toBe(-101);
  });

  it('loadScript', () => {
    // JsBridge.loadScript.mockRestore();
    JsBridge.loadScript('');
    JsBridge.registerDefault(undefined);
  });
});
