
const readAsDataURL = window.FileReader.prototype.readAsDataURL = jest.fn();

export default class FileReader {
  /**
   * mock 文件读取成功
   * @param {Any} buffer 读取结果
   */
  static mockReadAsDataURL(buffer: any) {
    readAsDataURL.mockImplementation(function() {
      this.onload && this.onload({
        target: {
          result: buffer,
        },
      });
    });
  }

  /**
   * mock 文件读取失败
   */
  static mockRejectReadAsDataURL() {
    readAsDataURL.mockImplementation(function() {
      this.onerror && this.onerror({
        target: {
          error: '读取失败',
        },
      });
    });
  }
}
