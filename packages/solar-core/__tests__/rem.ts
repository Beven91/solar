/**
 * @module RemTest
 * @name 测试 Rem模块
 * @description
 */
import Rem from '../src/rem';

describe('Rem', () => {
  it('Rem.initRem', () => {
    const size = 37.5;
    // 初始化Rem工具
    Rem.initRem(size);

    // 断言:设置了font-size
    expect(document.documentElement.style.fontSize).toBe(`${size}px`);
    // 断言：font-size 为37.5
    expect(Rem.fontSize).toBe(size);
  });

  it('Rem.getRems', () => {
    // 测试对象值转rem
    const style = {
      width: '1rem',
      height: 375,
      left: '375',
      top: undefined as any,
      borderWidth: '375px',
    };
    const clone = { ...style };
    // 测试对象属性值转换Rem
    const result = Rem.getRems(clone);
    // 断言：width 不会发生变化，因为本身为rem单位值
    expect(result.width).toBe(style.width);
    // 断言：height 值应为 10rem: 375 / 37.5 = 10
    expect(result.height).toBe('10rem');
    // 断言：left值为 10rem
    expect(result.left).toBe('10rem');
    // 断言：borderWidth转换后为 375px getRems 方法目前不支持将带单属性值转换成rem 可以使用 getRemsWithsUnit
    expect(result.borderWidth).toBe(style.borderWidth);
  });

  it('Rem.getRemsWithsUnit', () => {
    // 测试对象值转rem
    const style = {
      width: '1rem',
      height: 375,
      left: '375',
      top: 'ssss',
      n: null as any,
      borderWidth: '375px',
    };
    const clone = { ...style };
    // 测试对象属性值转换Rem
    const result = Rem.getRemsWithsUnit(clone);
    // 断言：width 不会发生变化，因为本身为rem单位值
    expect(result.width).toBe(style.width);
    // 断言：height 值应为 10rem: 375 / 37.5 = 10
    expect(result.height).toBe('10rem');
    // 断言：left值为 10rem
    expect(result.left).toBe('10rem');
    // 断言：borderWidth转换后为 10rem
    expect(result.borderWidth).toBe('10rem');
  });

  it('Rem.getPixelsWithsUnit', () => {
    // 测试对象rem值转成px值
    const style = {
      width: '1rem',
      height: 10,
      left: '10',
      top: 'ssss',
      n: null as any,
      borderWidth: '10px',
    };
    const clone = { ...style };
    // 测试对象属性值转换Rem
    const result = Rem.getPixelsWithsUnit(clone);
    // 断言：width值为:37.5  1rem=37.5px  参见 initRems设置的值
    expect(result.width).toBe(37.5);
    // 断言：height 不会转换，因为height不是一个rem单位的值
    expect(result.height).toBe(style.height);
    // 断言：left 不会转换
    expect(result.left).toBe(10);
    // 断言：borderWidth 将会被转换成 10 因为返回统一值为 数值类型
    expect(result.borderWidth).toBe(10);
  });
})
;
