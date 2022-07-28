import JssdkWrapper from '../../src/js-bridge/client/jssdk-wrapper';

const position = {
  latitude: '103',
  longitude: 102,
};

const demoJssdk = {
  match() {
    return true;
  },
  url: '',
  name: '案例Jssdk',
  protocol: 'demo',
  onInitialize: jest.fn(),
  getInstance: jest.fn(),
  methods: {
    getGpsLocation: () => position,
    close: 'closeWebview',
  },
};

const loadJssdkMock = jest.spyOn(JssdkWrapper.prototype, 'loadJssdk');

function mockLoadJssdk() {
  const runtime = {
    mockResolveValue: null as any,
    mockRejectValue: null as any,
  };
  loadJssdkMock.mockReturnValue(new Promise((resolve, reject) => {
    runtime.mockResolveValue = resolve;
    runtime.mockRejectValue = reject;
  }));
  return runtime;
}

describe('DynamicBridge', () => {
  beforeEach(() => {
    demoJssdk.onInitialize.mockReset();
    loadJssdkMock.mockReturnValue(Promise.resolve({}));
  });

  it('new', async() => {
    const mock = mockLoadJssdk();
    const dynamic = new JssdkWrapper(demoJssdk);
    const jssdk = {
      closeWebview: jest.fn(),
    };


    // 断言：此时demoJssdk.onInitialize 不会被触发
    expect(demoJssdk.onInitialize).not.toHaveBeenCalled();
    // 断言: 此时dynamic.jssdk为null
    expect(dynamic.native).toBeNull();
    // 断言: protocol 为当前options.protocol
    expect(dynamic.protocol).toBe(demoJssdk.protocol);

    const resolve = jest.fn();
    const reject = jest.fn();
    const resolve2 = jest.fn();
    const reject2 = jest.fn();

    const promise = dynamic.callNative('getGpsLocation').then(resolve, reject);
    const promise2 = dynamic.callNative('close').then(resolve2, reject2);

    // 断言: 此时resolve还没有被调用
    expect(resolve).not.toHaveBeenCalled();
    expect(reject).not.toHaveBeenCalled();
    expect(resolve2).not.toHaveBeenCalled();
    expect(reject2).not.toHaveBeenCalled();
    expect(jssdk.closeWebview).not.toHaveBeenCalled();

    // 断言:由于jssdk还没有加载，此时会将callNative添加到队列，直到jssdk加载完毕才会执行
    // 模拟jssdk加载完毕
    mock.mockResolveValue(jssdk);

    // 等待执行结束
    await promise;

    // 断言：此时demoJssdk.onInitialize 被调用
    expect(demoJssdk.onInitialize).toHaveBeenCalled();

    // 断言：此时resolve将被调用
    expect(resolve).toHaveBeenCalledWith(position);
    // reject 不会被触发
    expect(reject).not.toHaveBeenCalled();

    // 等待close执行结束
    await promise2;

    // 断言: 调用close会实际调用到jssdk.closeWebview
    expect(jssdk.closeWebview).toHaveBeenCalled();
    // 断言: 此时 resolve2被调用
    expect(resolve2).toHaveBeenCalled();
    // 断言: 此时 reject2 也会被调用
    expect(reject2).not.toHaveBeenCalled();
  });

  it('loadJssdk', async() => {
    const loadScript = jest.spyOn(JssdkWrapper, 'loadScript');
    const mock = {
      mockResolve: null as any,
      mockReject: null as any,
    };
    loadScript.mockReturnValue(new Promise((resolve, reject) => {
      mock.mockResolve = resolve;
      mock.mockReject = reject;
    }));
    loadJssdkMock.mockRestore();

    demoJssdk.url = 'https://www.demo.com';
    const dynamic = new JssdkWrapper(demoJssdk);
    const p = dynamic.loadJssdk('https://www.demo.com');
    mock.mockResolve({});
    await p;
    // 断言: getInstance被调用
    expect(demoJssdk.getInstance).toHaveBeenCalled();

    loadScript.mockReturnValue(new Promise((resolve, reject) => {
      mock.mockResolve = resolve;
      mock.mockReject = reject;
    }));
    const p2 = dynamic.loadJssdk('https://www.demo.com').catch((ex:any) => ex);
    // 模拟加载失败
    mock.mockReject();
    await p2;
  });
});
