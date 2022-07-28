/**
 * @module RemTest
 * @name 测试 Rem模块
 * @description
 */
import BizError from '../src/biz-error';

describe('BizError', () => {
  it('new', () => {
    const error = new BizError(10, 'error');
    expect(error.code).toBe('10');
    expect(error.message).toBe('error');
  });
});
