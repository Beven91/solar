import ResizeObserver from '../../src/polyfill/ResizeObserver';

const requestAnimationFrame = jest.spyOn(window, 'requestAnimationFrame');

describe('ResizeObserver', () => {
  beforeAll(() => {
    // mock requestAnimationFrame 立即执行
    requestAnimationFrame.mockImplementation((handler) => {
      handler(0);
      return 0 as any;
    });
    // 模拟 oject标签
    const originalCreateElement = document.createElement.bind(document);
    const createElement = jest.spyOn(document, 'createElement');

    createElement.mockImplementation((type) => {
      const element = originalCreateElement(type);
      if (type === 'object') {
        Object.defineProperty(element, 'contentDocument', { value: document });
        const originalAddEventListener = element.addEventListener;
        element.addEventListener = (type: string, handler: Function) => {
          if (type === 'load') {
            handler();
          } else {
            return originalAddEventListener.call(this, type, handler);
          }
        };
      }
      return element;
    });
  });

  afterAll(() => {
    requestAnimationFrame.mockRestore();
  });

  it('constructor', () => {
    let error = null;
    try {
      new ResizeObserver();
    } catch (ex) {
      error = ex;
    }
    // 断言:
    expect(error.message).toContain('参数必须为函数');
  });

  it('observe', () => {
    document.body.innerHTML = `
      <div id="scrollView"></div>
    `;
    const div = document.getElementById('scrollView');
    const callback = jest.fn();
    // 创建一个Resize监听实例
    const observer = new ResizeObserver(callback);

    const __addObserve = jest.spyOn(observer, '__addObserve');

    // 断言：默认情况__addObserve 不会被调用
    expect(__addObserve).not.toHaveBeenCalled();

    // 传入空参数
    observer.observe();
    // 断言：传入空__addObserve 不会被调用
    expect(__addObserve).not.toHaveBeenCalled();

    // 正常监听
    observer.observe(div);
    // 断言: _addObserve  被调用
    expect(__addObserve).toHaveBeenCalled();

    // 清除调用记录
    __addObserve.mockRestore();
    // 重复监听
    observer.observe(div);
    // 断言：重复监听,不会进行重复注册
    expect(__addObserve).not.toHaveBeenCalled();

    // 断言监听个数为1
    expect(observer.observes.length).toBe(1);

    //  无参接触监听
    observer.unobserve();
    // 断言：无参调用不会接触任何监听器
    expect(observer.observes.length).toBe(1);

    // 解除监听
    observer.unobserve(div);

    // 断言：接触监听后，监听器长度为0
    expect(observer.observes.length).toBe(0);

    // 重新监听
    observer.observe(div);

    // 断言：监听后，监听器长度为1
    expect(observer.observes.length).toBe(1);

    //  断开监听
    observer.disconnect();

    // 断言: 断开后，监听器全数销毁
    expect(observer.observes.length).toBe(0);
  });

  it('normal', () => {
    document.body.innerHTML = `
      <div id="scrollView"></div>
    `;

    const div = document.getElementById('scrollView');

    const callback = jest.fn();
    // 创建一个Resize监听实例
    const observer = new ResizeObserver(callback);
    // 监听滚动容器resize
    observer.observe(div);

    // 断言:callback不会被调用
    expect(callback).not.toHaveBeenCalled();

    div.style.cssText = 'height:300px;';
    // 模拟触发resize
    mockEvent('resize');

    // 断言: 会触发callback被调用
    expect(callback).toHaveBeenCalled();
  });

  it('__addObserve', () => {
    document.body.innerHTML = `
      <div id="scrollView" style="position:static"></div>
    `;

    const div = document.getElementById('scrollView');

    const callback = jest.fn();
    // 创建一个Resize监听实例
    const observer = new ResizeObserver(callback);

    observer.observe(div);
  });

  it('global.ResizeObserver', () => {
    jest.resetModules();

    const mGlobal = global as any;
    // 预设已存在 ResizeObserver
    const globalResizeObserver = mGlobal.ResizeObserver = jest.fn();

    const requiredResizeObserver = require('../../src/polyfill/ResizeObserver').default;

    // 断言:zai 在已存在ResizeObserver情况下，直接返回已存在的ResizeObserver
    expect(requiredResizeObserver).toBe(globalResizeObserver);
  });

  function mockEvent(type: any) {
    const ev = document.createEvent('Event');
    ev.initEvent(type);
    document.defaultView.dispatchEvent(ev);
  }
});