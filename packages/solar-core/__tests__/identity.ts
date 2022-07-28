/**
 * @module Identity
 * @name 测试 Identity模块
 * @description
 */
import Identity from '../src/identity';

describe('Identity', () => {
  test('Identity.uuid', () => {
    expect(Identity.uuid()).not.toBe(null);
  });
})
;

