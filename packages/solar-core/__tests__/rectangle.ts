/**
 * @module RemTest
 * @name 测试 Rem模块
 * @description
 */
import Rectangle from '../src/rectangle';
import FileReader from 'solar-jest-mock/mocks/FileReader';
import Image from 'solar-jest-mock/mocks/Image';

describe('Rectangle', () => {
  it('Rectangle.getRectangle', () => {
    const file = {} as any;
    FileReader.mockReadAsDataURL('aaa');
    // 模拟Image加载成功
    const mockRect = Image.mockOnload(200, 300);
    // 测试获取图片的原始宽度与高度
    return Rectangle
      .getRectangle(file)
      .then((rect) => {
        // 断言:获取当前图片文件的宽度为mockRect设置的高度
        expect(rect.width).toBe(mockRect.width);
        // 断言:获取当前图片文件的宽度为mockRect设置的高度
        expect(rect.height).toBe(mockRect.height);
      });
  });

  it('Rectangle.getRectangle.error', () => {
    const file = {} as any;
    FileReader.mockReadAsDataURL('aaa');
    // 模拟Image加载失败
    Image.mockOnError(200, 300);
    // 测试获取图片的原始宽度与高度
    return Rectangle
      .getRectangle(file)
      .then((rect) => {
        // 断言: 在图片异常时，不会触发reject 返回图片宽度与高度都为0
        expect(rect.width).toBe(0);
        expect(rect.height).toBe(0);
      });
  });

  it('Rectangle.readAsDataUri', () => {
    const buffer = 'aaa';
    // 模拟读取文件读取成功
    FileReader.mockReadAsDataURL(buffer);
    const file = {} as any;
    return Rectangle
      .readAsDataUri(file)
      .then((uri) => {
        // 断言：有读取到内容
        expect(uri).toBe(buffer);
      });
  });

  it('Rectangle.readAsDataUri.read.error', () => {
    // 模拟读取文件读取失败
    FileReader.mockRejectReadAsDataURL();
    const file = {} as any;
    return Rectangle
      .readAsDataUri(file)
      .then((uri) => {
        // 断言：读取文件失败，不会存在 DataURI 属性
        expect(uri).toBeUndefined();
      })
      .catch(() => {
      });
  });

  it('Rectangle.getRectangles', () => {
    // 模拟读取文件读取失败
    FileReader.mockRejectReadAsDataURL();
    const files = [
      {},
      {},
    ] as any;
    // 模拟读取文件读取成功
    FileReader.mockReadAsDataURL('sss');
    // 模拟Image加载成功
    Image.mockOnload(200, 300);
    return Rectangle
      .getRectangles(files)
      .then((rects) => {
        rects.map((rect) => {
          expect(rect.width).toBe(200);
          expect(rect.height).toBe(300);
        });
      });
  });
})
;
