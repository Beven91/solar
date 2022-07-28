/**
 * @name Rem
 * @description CMS响应式布局单位Rem工具
 */

export default class Rem {
  public static fontSize: number

  /**
   * 初始化rem布局
   * @param {*} size 当前设计基于的font-size
   */
  static initRem(size: number) {
    this.fontSize = size;
    document.documentElement.style.fontSize = size + 'px';
  }

  /**
   * 批量转换对象中的所有属性px值 到rem值
   */
  static getRems(object: any) {
    const newObj = { ...object };
    Object.keys(newObj).forEach((name) => {
      const origin = newObj[name];
      if (!isNaN(origin)) {
        newObj[name] = this.getRem(origin);
      }
    });
    return newObj;
  }

  /**
   * 批量转换对象中的所有属性从px 到rem
   * 属性值带单位
   */
  static getRemsWithsUnit(object: any) {
    const newObj = { ...object };
    Object.keys(newObj).forEach((name) => {
      if (!/rem/.test(newObj[name])) {
        const origin = parseFloat(newObj[name]);
        newObj[name] = this.getRem(origin);
      }
    });
    return newObj;
  }

  /**
   * 批量转换对象中的所有属性从rem 到px
   */
  static getPixelsWithsUnit(object: any) {
    const newObj = { ...object };
    Object.keys(newObj).forEach((name) => {
      const origin = (newObj[name]);
      newObj[name] = this.getPixel(origin);
    });
    return newObj;
  }

  /**
   * 转换px到rem
   */
  static getRem(pxValue: string | number) {
    return (Number((Number(pxValue) || 0) / this.fontSize).toFixed(2) + 'rem').replace('.00rem', 'rem');
  }

  /**
   * 转换rem到px
   */
  static getPixel(remValue: string, dv?: number | string) {
    let pixel = null;
    if (/rem/.test(remValue)) {
      const v = Number(remValue.replace(/rem/, ''));
      pixel = (v * this.fontSize);
    } else if (/px/.test(remValue)) {
      pixel = Number(remValue.replace(/px/, ''));
    } else {
      pixel = remValue;
    }
    return Number(pixel || dv || 0);
  }
}
