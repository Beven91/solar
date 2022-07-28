/**
 * @module AlipayFetch
 * @description 测试 AlipayFetch 模块
 */
const mockRequest = jest.fn();
import fetch from '../src/network/fetch.alipay';
// const fetch = require('../src/network/fetch.alipay').default;

(<any>global).my = {
  request: mockRequest,
};

function mockResponse(data: any) {
  mockRequest.mockImplementation((options) => {
    options.success(data);
  });
}

function mockReject(errMsg: string) {
  mockRequest.mockImplementation((options) => {
    options.fail({
      errMsg: errMsg,
    });
  });
}

describe('alipay-fetch', () => {
  it('fetch', async() => {
    // 模拟成功返回结果
    mockResponse({
      status: 200,
      data: JSON.stringify({ result: 'hello' }),
      statusText: '请求成功',
      headers: {
      },
    });
    // 测试请求
    const response = await fetch('https://api.local.com');

    // 断言:返回数据
    const data = await response.json();
    expect(data.result).toBe('hello');

    // 断言：存在clone函数，且能正常clone 对象
    const cloneResponse = response.clone();
    expect(cloneResponse).not.toBe(response);

    // 模拟在json下，wx.request返回的数据已经是 json对象，而不是json字符串
    mockResponse({
      status: 200,
      data: { result: 'hello' },
      statusText: '请求成功',
      headers: {
      },
    });

    // 测试请求
    const response2 = await fetch('https://api.local.com');
    // 断言:返回数据
    const data2 = await response2.json();
    expect(data2.result).toBe('hello');
  });

  it('fetch text', async() => {
    // 模拟成功返回结果
    mockResponse({
      status: 200,
      data: 'hello',
      statusText: '请求成功',
      headers: {
      },
    });
    // 测试请求
    const response = await fetch('https://api.local.com');
    // 断言:返回数据
    const data = await response.text();
    expect(data).toBe('hello');

    // 测试 response.body 为null情况下进行text读取
    const response2 = response.clone();
    // 强制设置body为null
    response2.body = null;
    // 读取text
    const text = await response2.text();

    // 断言：读取到的数据应该为 ''
    expect(text).toBe(null);
  });

  it('fetch.fail', async() => {
    let error = null;
    // 模拟请求失败
    mockReject('request fail');
    try {
      // 测试请求
      await fetch('https://api.local.com');
    } catch (e) {
      error = e;
    }
    // 断言：这里需要触发异常
    expect(error).not.toBeNull();
    expect(error.message).toBe('request fail');
  });
})
;
