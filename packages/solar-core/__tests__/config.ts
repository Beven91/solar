/**
 * @module Config
 * @name 测试 Base64模块
 * @description
 */
import Config from '../src/config';

describe('Config', () => {
  test('config.init', () => {
    Config.setup({
      cdn: 'a',
    });

    expect(Config.options.cdn).toBe('a');

    Config.setup({
      cdn: null,
    });
  });

  test('config.init null', () => {
    Config.setup(null);
    expect(Config.options.cdn).toBe('');
  });

  test('config.init null', () => {
    Config.setup({
      cdn: null,
    });
    expect(Config.options.cdn).toBe('');
  });
});

