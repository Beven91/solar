/**
 * @module Url
 * @name 测试 Url模块
 * @description
 */

import UrlParser from '../src/url';
import Config from '../src/config';

const purl = encodeURIComponent('https://www.solar.com/detail?name=22#/hello?id=20');

beforeEach(() => {
  jest.spyOn(console, 'error');
  (<any>console.error).mockImplementation(() => { });
});

afterEach(() => {
  (<any>console.error).mockRestore();
});

describe('test Url', () => {
  // const host = 'http://www.solar.cn/';
  Config.setup({
    // HOST: host,
    // CDN: '',
  });


  test('formatObject', () => {
    const url = UrlParser.formatObject('Hi,i am  an ${title} ,age:${age}', { title: 'doctor', age: 18 });
    expect(url).toBe('Hi,i am  an doctor ,age:18');

    const url0 = UrlParser.formatObject('https://www.dawndc.com?id=${id}', undefined);
    expect(url0).toBe('https://www.dawndc.com?id=${id}');

    const url2 = UrlParser.formatObject(undefined, undefined);
    expect(url2).toBeUndefined();

    const url3 = UrlParser.formatObject('https://www.dawndc.com?id=${id}', undefined);
    expect(url3).toBe('https://www.dawndc.com?id=${id}');
  });


  test('https://www.solar.com/detail', () => {
    expect(UrlParser.parse('https://www.solar.com/detail')).toMatchSnapshot();
  });

  test('https://www.solar.com:180/detail', () => {
    expect(UrlParser.parse('https://www.solar.com:180/detail')).toMatchSnapshot();
  });

  test('https://www.solar.com/detail?id=2', () => {
    expect(UrlParser.parse('https://www.solar.com/detail?id=2')).toMatchSnapshot();
  });

  test('https://www.solar.com/detail?id=2&url=', () => {
    expect(UrlParser.parse('https://www.solar.com/detail?id=2&url=' + purl)).toMatchSnapshot();
  });

  test('https://www.solar.com/detail?id=2#order/list', () => {
    expect(UrlParser.parse('https://www.solar.com/detail?id=2#order/list')).toMatchSnapshot();
  });

  test('https://www.solar.com/detail?id=2#order/list?age=18&name=hello&purl=', () => {
    expect(UrlParser.parse('https://www.solar.com/detail?id=2#order/list?age=18&name=hello&purl=' + purl)).toMatchSnapshot();
  });

  test('https://www.solar.com/detail#orderass', () => {
    const url = 'https://www.solar.com/detail#orderass';
    const parser = UrlParser.parse(url);
    expect(parser).toMatchSnapshot();

    expect(parser.url).toBe(url);
  });

  test('update', () => {
    const url = 'https://www.solar.com/detail?id=2#order/list?age=18&name=hello&purl=' + purl;
    const parser = UrlParser.parse(url);

    // 通过url属性能反向拼接回地址
    expect(parser.url).toBe(url);

    // 修改参数
    parser.params.age = 19;
    parser.params.person = 'lisi';

    // 断言: 返回url
    const url2 = 'https://www.solar.com/detail?id=2&age=19&person=lisi#order/list?age=18&name=hello&purl=' + purl;
    expect(parser.url).toBe(url2);

    // 修改域名
    parser.hostname = 'www.a.com';
    parser.pathname = 'detail2';

    // 断言：返回的Url
    const url3 = 'https://www.a.com/detail2?id=2&age=19&person=lisi#order/list?age=18&name=hello&purl=' + purl;
    expect(parser.url).toBe(url3);
  });

  test('https://www.solar.com', () => {
    expect(UrlParser.parse('https://www.solar.com')).toMatchSnapshot();
  });

  test('https://www.solar.com/', () => {
    expect(UrlParser.parse('https://www.solar.com/')).toMatchSnapshot();
  });

  test('detail?id=2#order/list', () => {
    const url = 'detail?id=2#order/list?id=233&a=';
    const parser = UrlParser.parse(url);
    expect(parser).toMatchSnapshot();

    expect(parser.url).toBe('/' + url);
  });

  test('hash', () => {
    const url = 'https://www.solar.com/detail#order/list?age=18&name=hello';
    const parser = UrlParser.parse(url);

    // 通过url属性能反向拼接回地址
    expect(parser.url).toBe(url);

    // 修改参数
    parser.hashParams.age = 19;
    parser.params.person = 'lisi';

    // 断言: 返回url
    const url2 = 'https://www.solar.com/detail?person=lisi#order/list?age=19&name=hello';
    expect(parser.url).toBe(url2);

    // 修改域名
    parser.hashPath = 'orders';

    // 断言：返回的Url
    const url3 = 'https://www.solar.com/detail?person=lisi#orders?age=19&name=hello';
    expect(parser.url).toBe(url3);
  });

  test('port', () => {
    const url = 'https://www.solar.com:180/detail?id=2';

    const parser = UrlParser.parse(url);

    expect(parser.url).toBe(url);
  });
});
