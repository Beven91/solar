/**
 * @module NetworkTest
 * @name 测试 Network模块
 * @description
 */
import fetch from 'jest-fetch-mock';
import querystring from 'querystring';
import Network from '../src/network';
import NetworkContext from '../src/network/context';
import BizError from '../src/biz-error';
import Response2 from '../src/network/response';
import { SharedResponse } from '../src/network/types';

describe('test network', () => {
  const onLoading = jest.fn();

  // 配置Network全局参数
  Network.config({
    base: 'http://localhost:8080',
    data: { global: true },
    loading: onLoading,
  });

  // 创建一个netowrk
  const network = new Network();

  // 接口发送数据
  const apiParams = { id: '10086' };

  afterEach(() => {
    Network.off('response');
    Network.off('end');
    fetch.resetMocks();
    fetch.mockClear();
    jest.useRealTimers();
    onLoading.mockReset();
  });

  test('network.stringifyOptional', () => {
    // 测试get请求 返回结果参见 www/index.js
    const data = {
      name: 'hello',
      age: 999,
      id: undefined,
    } as any;
    const query = network.stringifyOptional(data);
    // 断言：可选query生成应该为  :
    expect(query).toBe('name=hello&age=999');

    // 传递null数据
    const query2 = network.stringifyOptional(null);
    // 断言: 返回内容
    expect(query2).toBe('');
  });

  test('network.headers.key.null', () => {
    // 测试get请求 返回结果参见 www/index.js
    fetch.mockResponseOnce(JSON.stringify(apiParams));
    return network
      .get('/all', apiParams, { 'Content-Type': null })
      .json()
      .json()
      .then(() => {
        const options = fetch.mock.calls[0][1];
        // 断言：此时，不应该存在Content-Type 请求头
        expect('Content-Type' in options.headers).toBe(false);
      });
  });

  // 测试network.get
  test('network.get', () => {
    // 测试get请求 返回结果参见 www/index.js
    fetch.mockResponseOnce(JSON.stringify(apiParams));
    return network
      .get('/all', apiParams)
      .json()
      .json()
      .then((data) => {
        const requestUrl = fetch.mock.calls[0][0] as string;
        // 这里校验 全局数据是否有合并到请求参数中,由于是get参数，所以获取url解析参数来判定
        const querys = querystring.parse(requestUrl.split('?')[1] || '');
        expect(querys.global).toBeDefined();
        expect(data.id).toBe(apiParams.id);
      });
  });

  // 测试network.get 发送array对象
  test('network.get.array', () => {
    // 测试get请求 返回结果参见 www/index.js
    fetch.mockResponseOnce(JSON.stringify(apiParams));
    const params = [1, 2, 3];
    return network
      .post('/all', params, { 'Content-Type': 'application/json' })
      .json()
      .then(() => {
        const s2 = fetch.mock.calls[0][1];
        expect(s2.body).toBe(JSON.stringify(params));
      });
  });

  // 测试network.post
  test('network.post', () => {
    // 设置返回参数
    fetch.mockResponseOnce(JSON.stringify(apiParams));
    return network
      .post('/all', apiParams)
      .json()
      .then((data) => {
        const options = fetch.mock.calls[0][1];
        const result = querystring.parse(options.body as string);
        // 校验全局参数
        expect(result.global).toBeDefined();
        // 校验返回值
        expect(data.id).toBe(apiParams.id);
      });
  });

  // 测试network.showLoading
  test('network.loading complete', () => {
    // 设置返回参数
    fetch.mockResponseOnce(JSON.stringify(apiParams));
    const message = '正在加载中,请稍后...';
    return network
      .post('/all', apiParams)
      .showLoading(message)
      .complete(() => {
        expect(onLoading).toHaveBeenCalledWith(message, undefined);
      });
  });

  // 测试network.onerror
  test('network.onerror', async() => {
    const onError = jest.fn();
    const delay = () => new Promise((resolve) => setTimeout(resolve, 20));
    Network.on('error', onError);
    let error = null;
    // 设置返回参数
    fetch.mockResponse(JSON.stringify(apiParams));
    const errorMessage = '自定义错误';
    try {
      await network.post('/all', apiParams).json().then(() => {
        // 模拟处理promose链 某一环出现异常
        return Promise.reject({ message: errorMessage, ['@status@']: 1 });
      });
    } catch (ex) {
      error = ex;
    }
    await delay();
    // 断言：返回的ex 必须为原始对象
    expect(error['@status@']).toBe(1);
    // 断言:在出现异常时，且在非静默模式(silent=false)下回触发error事件
    expect(onError.mock.calls[0][0].message).toBe(errorMessage);

    // 场景二： 正常场景：接口无错误
    onError.mockReset();
    // 发起请求
    await network.post('/all', apiParams);

    // 断言：正常请求下，不会触发onError
    await delay();
    expect(onError).not.toHaveBeenCalled();
  });

  // 测试network.end 事件测试
  test('network.end', () => {
    // 设置返回参数
    fetch.mockResponseOnce(JSON.stringify(apiParams));
    let isEnd = false;
    Network.on('end', () => isEnd = true);
    return network
      .post('/all', apiParams)
      .complete(() => {
        expect(isEnd).toBe(true);
      });
  });

  // 测试network.response 事件测试
  test('network.response', () => {
    // 设置返回参数
    fetch.mockResponseOnce(JSON.stringify(apiParams));
    let response: any = null;
    // 这里测试，自定义返回内容
    // 这里测试，自定义返回内容
    Network.on('response', (r, context) => {
      response = r;
      // 断言： context.response不能为null
      expect(context.response).not.toBe(null);

      context.response = null;
      expect(context.responseType).toBe('');

      context.response = { headers: { 'content-type': 'application/json; charset=utf8' } } as any;
      expect(context.responseType).toBe('application/json');

      context.response = { headers: { 'content-type': 'application/json' } } as any;
      expect(context.responseType).toBe('application/json');

      context.response = {
        headers: {
          get(name: string) {
            return 'application/json ';
          },
        },
      } as any;
      expect(context.responseType).toBe('application/json');
      return r;
    });
    return network
      .post('/all', apiParams)
      .then((r) => {
        // r的结果，应该为 response事件返回的数据
        expect(r).toBe(response);
      });
  });

  // 测试network.response事件 返回undefined情况
  test('network.response.return.undefined', () => {
    // 设置返回参数
    fetch.mockResponseOnce(JSON.stringify(apiParams));
    // 这里测试，自定义返回内容
    Network.on('response', () => undefined);
    return network
      .post('/all', apiParams)
      .then((r) => {
        // 断言：r不应该为null,虽然reponse事件返回undefined,但是框架内部处理为，当返回undefined时，使用原始response
        expect(r).not.toBeNull();
      });
  });

  // 测试network.response事件 返回promise
  test('network.response.promise', () => {
    fetch.resetMocks();
    // 设置返回参数
    fetch.mockResponseOnce(JSON.stringify({ status: 0, message: '成功' }));
    // 这里测试，自定义返回内容
    Network.on('response', (r: Response) => {
      return r.json().then((data) => {
        return data.status == 0 ? Promise.resolve(data) : Promise.reject(data);
      });
    });
    return network
      .post('/all', apiParams)
      .then((r) => {
        // 断言：r.status值为0 因为，在自定义reponse事件中，只有在status为0时表示请求成功
        expect(r.status).toBe(0);
      });
  });

  // 测试network.response事件 返回promise.reject
  test('network.response.promise.reject', async() => {
    const delay = () => new Promise((resolve) => setTimeout(resolve, 20));
    const onError = jest.fn();
    // 设置返回参数
    fetch.mockResponse(JSON.stringify({ status: 3, message: '成功' }));
    // 绑定error事件
    Network.on('error', onError);
    // // 这里为了方便，始终断言：请求失败
    Network.on('response', () => Promise.reject('request:fail'));
    // // 测试场景一：未捕获异常
    try {
      await network.post('/all', apiParams);
    } catch (ex) {
    }
    await delay();
    // 会触发全局异常函数
    expect(onError).toHaveBeenCalled();
    // 测试场景二: 捕获异常
    // 重置onError mock数据
    onError.mockReset();
    await network.post('/all', apiParams).catch(() => 'catched');
    await delay();
    // 断言：onError 还是会被执行，因为onError仅在 silent下才不会执行。
    expect(onError).toHaveBeenCalled();
  });

  test('network.merge', () => {
    // 测试合并请求
    const getAll = () => {
      // 设置返回参数
      fetch.mockResponse(JSON.stringify(apiParams));
      return network.post('/all', apiParams).json();
    };
    const getAll2 = () => {
      // 设置返回参数
      fetch.mockResponse(JSON.stringify(apiParams));
      return network.post('/all', apiParams).json();
    };
    return getAll()
      .merge(getAll2(), 'all2')
      .merge(getAll2(), 'all3')
      .then((data) => {
        // 断言结果
        expect(data.original.id).toBe(apiParams.id);
        expect(data.all2.id).toBe(apiParams.id);
        expect(data.all3.id).toBe(apiParams.id);
      });
  });

  test('network.merge.error', (done) => {
    // 设置返回参数
    fetch.mockResponse(JSON.stringify(apiParams));
    // 测试merge 结果属性名为 origianl :默认第一个请求结果会附加到original上，这里检测重复
    const getAll = () => network.post('/all', apiParams).json();
    const getAll2 = () => network.post('/all', apiParams).json();
    try {
      getAll()
        .merge(getAll2(), 'original');
      done('您是否调整了 merge的name的默认名original判定？,确定更改，请修改此用例');
    } catch (ex) {
      done();
    }
  });

  test('network.noCookie', (done) => {
    fetch.resetMocks();
    // 设置返回参数
    fetch.mockResponse(JSON.stringify(apiParams));
    // 测试无cookie
    const context = network.post('/all', apiParams).complete(done).noCookie();
    expect(context.reqContext.credentials).toBe('omit');
  });

  test('network.delete', async() => {
    // 设置返回参数
    fetch.mockResponse(JSON.stringify(apiParams));
    // 使用delete 发起请求
    await network.any('/all', { name: '222' }, 'DELETE');
    // 断言： 在delete 时，参数应该传递在url中
    expect(fetch.mock.calls[0][0]).toContain('name=222');
  });

  test('network.credentials', (done) => {
    // 设置返回参数
    fetch.mockResponse(JSON.stringify(apiParams));
    // 测试设置证书模式
    const context = network.post('/all', apiParams).complete(done).credentials('include');
    expect(context.reqContext.credentials).toBe('include');
  });

  test('network.fetch.error', () => {
    const error = new Error('fetch.error');
    // 设置返回参数
    fetch.mockReject(error);
    // 测试fetch error
    return network
      .post('https://fetch.error', apiParams)
      .then((a) => a)
      .catch((err: any) => {
        expect(err).toBe(error);
      });
  });

  test('network.fetch.http.error', () => {
    // 设置返回参数
    fetch.mockResponse(JSON.stringify({}), { status: 500 });
    // 测试fetch error
    return network
      .post('https://fetch.error', apiParams)
      .then((a) => a)
      .catch((err: any) => {
        expect(err).not.toBeNull();
      });
  });

  test('network.fetch.contentType', () => {
    // 设置返回参数
    fetch.mockResponseOnce(JSON.stringify(apiParams));
    const form = new FormData();
    const network = new Network({ contentType: 'text' });
    return network
      .post('/all', form, { 'Content-Type': 'application/x-www-form-urlencoded' })
      .then((a) => {
        expect(a).not.toBeNull();
      });
  });

  test('network.response.text', () => {
    // 设置返回参数
    fetch.mockResponseOnce(JSON.stringify(apiParams));
    return network
      .post('/all', {})
      .text()
      // 测试执行两次text读取
      .text()
      .then((a) => {
        expect(typeof a).toBe('string');
      })
      .catch((ex: any) => {
        // catch不应该触发，因为当前用例不会出错
        expect('异常').toBe(ex);
      });
  });

  test('network.fetch.formdata', () => {
    // 设置返回参数
    fetch.mockResponseOnce(JSON.stringify(apiParams));
    const form = new FormData();
    return network
      .post('/all', form)
      .then((a) => {
        expect(a).not.toBeNull();
      });
  });

  // 测试get请求拼接参数
  test('network.get.combine.params', () => {
    // 设置返回参数
    fetch.mockResponseOnce(JSON.stringify({}));
    return network
      .get('/all?id=1', { name: 'hello' })
      .json()
      .then(() => {
        // 校验get参数合并
        const url = fetch.mock.calls[0][0] as string;
        const query = querystring.parse(url.split('?')[1]);
        expect(query.id).toEqual('1');
        expect(query.name).toBe('hello');
      });
  });

  // 测试get请求拼接参数
  test('network.coverage', () => {
    // 设置返回参数
    fetch.mockResponseOnce(JSON.stringify(apiParams));
    return network
      .any('/all?id=1', null)
      .json()
      .then(() => {
        const url = fetch.mock.calls[0][0] as string;
        const query = querystring.parse(url.split('?')[1]);
        expect(query.id).toEqual('1');
      });
  });

  // 测试network.try 事件测试
  test('network.try', () => {
    // 设置返回参数
    fetch.mockReject(new Error('模拟出错'));
    const Max = 2;
    let current = 0;
    const handle = (c: any) => {
      c.data.id ? current++ : undefined;
    };
    Network.on('try', handle);
    return network
      .post('/try', { ...apiParams, isTry: true })
      .try(Max, () => false)
      .complete(() => {
        Network.off('try', handle);
        expect(current).toBe(Max);
      })
      // 测试 空参try
      .catch(() => network.post('/try2').try().catch((a: any) => a));
  });

  // 测试get请求拼接参数
  test('network.fetch.http.error.try', () => {
    // 设置返回参数
    fetch.mockResponse(JSON.stringify({}), { status: 500 });
    return network
      .any('https://fetch.throw')
      .try(1)
      .catch((e: BizError) => {
        expect(e.data.status).toBe(500);
      });
  });

  test('network.url.null', () => {
    Network.config(null);
  });

  test('network.showLoading', () => {
    Network.config(null);
    // 设置返回参数
    fetch.mockResponse(JSON.stringify({}));
    const network = new Network();
    return network
      .get('/all')
      .showLoading('您好');
  });

  test('network.formData', async() => {
    const network = new Network();
    const hasHeader = (headers: any, key: string) => {
      // 断言：不会设置content-Type
      const keys = Object.keys(headers || {});
      const findKey = keys.find((k) => (k || '').toLowerCase() === key);
      return !!findKey;
    };
    fetch.mockImplementation((data, options) => {
      // 这里讲请求时的headers参数作为返回结果
      return Promise.resolve(new Response(JSON.stringify(options.headers)));
    });

    const data = await network.get('/all', {}).json();
    // 断言：在入参为非formData 情况下，默认会设置content-type
    expect(hasHeader(data, 'content-type')).toBe(true);

    const data2 = await network.get('/all', new FormData()).json();
    // 断言：在传入参数为FormData 则不设置content-type 让FormData 自行指定content-type 以满足上传文件等需求
    expect(hasHeader(data2, 'content-type')).toBe(false);
  });

  // 测试network.showLoading complete
  test('network.loading silent', async() => {
    let error = null;
    const onError = jest.fn();
    const delay = () => new Promise((resolve) => setTimeout(resolve, 20));

    Network.on('error', onError);
    // 设置返回参数
    fetch.mockReject(new Error('出错啦'));

    try {
      await network.post('/all', apiParams);
    } catch (ex) {
      error = ex;
    }

    // 延迟20毫秒
    await delay();
    // 断言：由于设置mockReject所以会触发异常
    expect(error).not.toBeNull();
    // 断言：虽然被catch住，但是由于不是静默方式 所以这里还是会调用onError
    expect(onError).toHaveBeenCalled();

    // 设置silent模式
    onError.mockReset();
    error = null;
    try {
      await network.post('/all', apiParams).silent();
    } catch (ex) {
      error = ex;
    }
    // 延迟20毫秒
    await delay();
    // 断言：这里需要确保以上请求触发异常
    expect(error).not.toBeNull();
    // 断言： 在silent模式下，不会触发error事件，
    expect(onError).not.toHaveBeenCalled();
  });

  test('network.finnally', async() => {
    const fn = jest.fn();

    // 设置返回参数
    fetch.mockReject(new Error('出错啦'));

    try {
      await network.post('/all').finally(fn);
    } catch (ex) {
    }
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('Network.emit', () => {
    const fn = jest.fn();
    Network.on('end', fn);
    Network.emit('end', 1);
    expect(fn).toHaveBeenCalledWith(1);
  });

  it('Network.request.error', async() => {
    const network = new Network() as any;
    const context = { ex: null as any };
    const request = jest.spyOn(network, 'request');
    const ex = new Error('aa');
    request.mockImplementation(() => {
      throw ex;
    });
    try {
      await network.get('/a');
    } catch (ex) {
      context.ex = ex;
    }
    expect(context.ex).toBe(ex);
  });

  it('Context.shouldRetry', () => {
    const context = new NetworkContext('', 'post', null, {});
    // 设置tryable
    context.tryable = true;
    // 断言：默认
    expect(context.shouldRetry({})).toBe(false);

    // 设置不允许tryable
    context.tryable = false;
    expect(context.shouldRetry({})).toBe(false);

    // 设置tryFunction
    context.tryable = true;
    context.tryAssertFunc = () => true;
    expect(context.shouldRetry({})).toBe(true);
  });

  it('AttachResponse.with', () => {
    fetch.mockResponse(JSON.stringify({}), { status: 200 });
    const withCt = 'application/aa';
    // 设置返回参数
    return network
      .get('/all')
      .with(withCt)
      .then(() => {
        const headers = fetch.mock.calls[0][1].headers as Record<string, string>;
        expect(headers['Content-Type']).toBe(withCt);
      });
  });

  it('Response', async() => {
    const da = JSON.stringify({
      data: 22,
    });
    const res = new Response2(da, {});
    const data = await res.json();
    expect(data.data).toBe(22);

    const s = await res.text();
    expect(s).toBe(da);
  });

  // 测试network.strt 事件测试
  // test('network.start', async () => {
  //   // 设置返回参数
  //   const data = { id: 1 };
  //   fetch.mockResponse(JSON.stringify(data));
  //   console.log('start', data);
  //   Network.on('start', (data, context) => {
  //     data.id = 10;
  //   });
  //   await network.post('/all', data);
  //   // 断言： start事件需要被执行，并且data.id = 10
  //   expect(data.id).toBe(10);
  // });

  it('shared', async() => {
    const sharedResponses = (Network as any).sharedResponses as SharedResponse[];
    const network = new Network();
    const context = {
      length: 0,
    };

    fetch.mockResponse(JSON.stringify({ data: '1' }), { status: 200 });

    // 发起一个接口,切标记瞬时共享返回
    const request1 = network.get('/submit', { id: 1 }).shared().json().then((res) => {
      context.length = sharedResponses.length;
      return res;
    });
    // 再发起一个接口
    const request2 = network.get('/submit').json();
    const request3 = network.get('/aaa').json();

    const r1 = await request1;
    const r2 = await request2;
    await request3;

    // 断言：长度为1
    expect(context.length).toBe(1);

    // 断言：请求结束后，共享长度为0
    expect(sharedResponses.length).toBe(0);

    // 断言： r1 与r2的结果一致
    expect(r1.data).toBe('1');
    expect(r1.data).toBe(r2.data);

    let ex1;
    let ex2;


    fetch.mockRejectedValueOnce({ message: '异常' });
    const rb1 = network.get('/order').shared();
    const rb2 = network.get('/order').json();
    try {
      await rb1;
    } catch (ex) {
      ex1 = ex;
    }
    try {
      await rb2;
    } catch (ex) {
      ex2 = ex;
    }

    // 断言：长度为1
    expect(context.length).toBe(1);
    // 断言：请求结束后，进入rb1 会异常，但是页会移除共享返回
    expect(sharedResponses.length).toBe(0);

    // 断言： ex1 与ex2值一致
    expect(ex1.message).toBe('异常');
    expect(ex1.message).toBe(ex2.message);
  });

  it('coverage', () => {
    const anyNetwork = network as any;
    // 仅用于测试覆盖率，不出错即可
    fetch.mockResponse(JSON.stringify({ name: '1' }));
    anyNetwork.request({ url: '' }, () => 1, () => 2);

    jest.resetModules();

    // 重置掉window.FormData
    window.FormData = (<any>global).FormData = null;
    jest.mock('whatwg-fetch', () => null);
    require('../src/network');

    fetch.mockResponse(JSON.stringify({ name: '1' }));
    (<any>network).request({
      url: '',
      method: 'get',
      data: { name: 'ss' },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }, () => 1, () => 2);
  });
});
