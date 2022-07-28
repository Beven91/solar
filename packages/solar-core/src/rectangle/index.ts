/**
 * @name Rectangle
 * @description 图片尺寸解析工具
 */

export interface ImageRectangle {

  // 宽度
  width: number

  // 高度
  height: number

}

export default class Rectangle {
  /**
   * 获取指定图片的宽度与高度信息
   * @param {String} file
   */
  static async getRectangle(file: File): Promise<ImageRectangle> {
    const uri = await this.readAsDataUri(file);
    return new Promise((resolve) => {
      const image = new window.Image();
      image.onload = () => resolve({ height: image.height, width: image.width });
      image.onerror = () => resolve({ height: 0, width: 0 });
      image.src = uri;
    });
  }

  /**
   * 获取一批files的图片宽度与高度
   */
  static getRectangles(files: Array<File>): Promise<Array<ImageRectangle>> {
    return Promise.all(files.map((file) => this.getRectangle(file)));
  }

  /**
   * 读取file转换成data-uri
   */
  static readAsDataUri(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result as any);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}
