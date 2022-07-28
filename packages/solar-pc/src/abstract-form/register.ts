import { Switch, Checkbox, Radio } from 'antd';
import moment from 'moment';

export interface ValueConverter {
  /**
   * 将控件的value转换成fieldValue
   */
  getValue: (v: any, ...args: Array<any>) => any

  /**
   * 将fieldValue 转换成控件的value
   */
  setInput: (v: any, ...args: Array<any>) => any

}

interface ValueConverterRegistry {
  [propName: string]: ValueConverter
}

const converters = {} as ValueConverterRegistry;

function register(component: any, name: string): any {
  if (component instanceof Array) {
    return component.forEach((c) => register(c, name));
  }
  component.valuePropName = name;
}

function registerConverter(name: string, converter: ValueConverter) {
  // if (converters[name]) {
  //   throw new Error(`【ValueConverter】：已存在相同名称的转换器:${name}`)
  // }
  converters[name] = converter;
}

function getConverter(name: string) {
  return converters[name];
}

register(Switch, 'checked');
register(Checkbox, 'checked');
register(Radio, 'checked');

// 注册转换器
registerConverter('moment', {
  getValue: (v: any, fmt = 'YYYY-MM-DD HH:mm:ss') => {
    return v ? v.format(fmt) : null;
  },
  setInput: (v, fmt = 'YYYY-MM-DD HH:mm:ss') => {
    return v ? moment(v, fmt) : null;
  },
});

export default {
  register,
  getConverter,
  registerConverter,
};
