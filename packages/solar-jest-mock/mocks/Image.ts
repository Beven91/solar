
const mockImage = jest.fn();
const mockImageSrc = jest.fn();

Object.defineProperty(window, 'Image', { configurable: false, value: mockImage });

mockImage.mockImplementation(() => new Image());

export default class Image {
  private internalSrc: string;

  constructor() {

  }

  get src() {
    return this.internalSrc;
  }

  set src(v) {
    this.internalSrc = v;
    setTimeout(() => {
      mockImageSrc.call(this, v);
    }, 10);
  }

  /**
   * mock 图片加载成功
   * @param {Number} width 图片加载后的宽度
   * @param {Number} height 图片加载后的高度
   */
  static mockOnload(width: number, height: number) {
    mockImageSrc.mockImplementation(function() {
      this.width = width;
      this.height = height;
      const event = { type: 'load', target: this };
      this.onload && this.onload(event);
    });
    return {
      width,
      height,
    };
  }

  /**
   * mock 图片加载失败
   */
  static mockOnError(...args:any[]) {
    mockImageSrc.mockImplementation(function() {
      this.width = 0;
      this.height = 0;
      const event = { type: 'error', target: this };
      this.onerror && this.onerror(event);
    });
  }
}
