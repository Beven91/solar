/**
 * @module TunnelTest
 * @name 测试 Tunnel模块
 * @description
 */

import Adapter from '../src/adapter';

describe('Adapter', () => {
  test('adapterObject', () => {
    const sayHello = jest.fn(() => 'original say hello');
    const sayHello2 = jest.fn(() => 'wrapper say hello');
    const obj = {
      sayHello: sayHello,
      num: 1,
    };
    Adapter.adapterObject(obj, {
      sayHello: sayHello2,
      add: jest.fn((a, b) => a + b),
      num: 2,
    });
    // 调用obj.sayHello
    const result = obj.sayHello();
    // 断言: sayHello 必须被调用 因为适配器模式，不会覆盖原始的函数
    expect(sayHello).toHaveBeenCalled();
    // 断言：sayHello2 必须被调用
    expect(sayHello2).toHaveBeenCalled();

    // 断言: result 必须为 original say hello 在存在原始函数的情况下，仅会返回原始函数的返回的值
    expect(result).toBe('original say hello');

    // 断言：result 有返回值，因为add函数，不存在原始函数，所以返回值会被应用
    expect((<any>obj).add(1, 2)).toBe(3);
  });

  test('delayFunctions', () => {
    const originalFunction = jest.fn();
    const obj = {
      sayHello: originalFunction,
    };
    // 配置延迟
    const callOriginal = Adapter.delayFunctions(obj, ['sayHello', 'unkonw']);

    // 在不调用sayHello时，直接调用callOriginal 此时不会触发原始函数调用，
    callOriginal();
    expect(originalFunction).not.toHaveBeenCalled();

    // 调用sayHello
    obj.sayHello();
    // 断言：此时，原始函数不会被调用
    expect(originalFunction).not.toHaveBeenCalled();

    // 调用原始函数
    callOriginal();
    // 断言：此时原始函数会被调用
    expect(originalFunction).toHaveBeenCalled();

    // 取消延迟模式
    const ss = jest.fn();
    const obj2 = {
      sayHello: ss,
    };
    const callOriginal2 = Adapter.delayFunction(obj2, 'sayHello');

    // 取消延迟模式
    callOriginal2(true);

    obj2.sayHello();
    // 断言： 原始函数必须被调用
    expect(ss).toHaveBeenCalled();
  });

  test('delayFunctions.null', () => {
    Adapter.delayFunctions(null, null);
  });

  test('filter', () => {
    const data = {
      name: 'beven',
      hello: 'hello',
      age: 10,
    };
    const props = Adapter.filter(data, 'name', 'hello');
    expect(Object.keys(props).join(',')).toBe(['age'].join(','));
  });
});
