/**
 * @module Base64
 * @name 测试 Base64模块
 * @description
 */
import Base64 from '../src/base64';

const allRows = [
  '`1234567890-=~!@#$%^&*()_+{}:"?><abcdefghidawnlmnopqrstuvwxyz。、，；‘【】=-·12MNBVCXZASDFGHdawnL:"|POIUYTREWQ,./\\\'[]\\,',
  '',
  '大家好，才是真的好,Everyone is good, it\'s really good',
];

describe('test base64', () => {
  test('base64.encode', () => {
    // 批量测试allRows中的编码是否正常
    allRows.forEach((key) => {
      // 对比Base64工具与nodejs Buffer的base64编码是否一致 ，来验证结果
      expect(Base64.encode(key)).toBe(Buffer.from(key || '').toString('base64'));
    });
    // 测试传入null时，编码后返回''
    expect(Base64.encode(null)).toBe('');
  });

  test('base64.decode', () => {
    // 批量测试allRows中的字符串使用Bse64.encode编码后再使用Base64.decode解码的结果是否正常
    allRows.forEach((key) => {
      const base64 = Base64.encode(key);
      expect(Base64.decode(base64)).toBe(key);
    });
    // 测试传入null 解码时，返回 ''
    expect(Base64.decode(null)).toBe('');
  });
})
;
