import parser from '../../src/js-bridge/helper/params-parser';

describe('DynamicBridge', () => {
  it('parse', () => {
    const data = parser.parseUrl('demo://closeWebview?id=1&data.name=2&per[0]=3&a=');

    // 断言: 协议为 demo
    expect(data.protocol).toBe('demo');
    // 断言: 方法为
    expect(data.method).toBe('closeWebview');

    const output = {
      id: 1,
      data: {
        name: 2,
      },
      per: [
        3,
      ],
      a: '',
    };
    // 断言：
    expect(JSON.stringify(data.params)).toBe(JSON.stringify(output));
  });

  it('parse width param json', () => {
    const item = encodeURIComponent(JSON.stringify({ name: 2 }));
    const data = parser.parseUrl('demo://closeWebview?id=1&data=' + item + '&per[0]=3&a=');

    // 断言: 协议为 demo
    expect(data.protocol).toBe('demo');
    // 断言: 方法为
    expect(data.method).toBe('closeWebview');

    const output = {
      id: 1,
      data: {
        name: 2,
      },
      per: [
        3,
      ],
      a: '',
    };
    // 断言：
    expect(JSON.stringify(data.params)).toBe(JSON.stringify(output));
  });

  it('parse width param error json', () => {
    const item = encodeURIComponent('{name:2}');
    const data = parser.parseUrl('demo://closeWebview?id=1&data=' + item + '&per[0]=3&a=');

    // 断言: 协议为 demo
    expect(data.protocol).toBe('demo');
    // 断言: 方法为
    expect(data.method).toBe('closeWebview');

    const output = {
      id: 1,
      data: item,
      per: [
        3,
      ],
      a: '',
    };
    // 断言：
    expect(JSON.stringify(data.params)).toBe(JSON.stringify(output));
  });
});
