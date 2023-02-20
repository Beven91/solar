import { Switch, Checkbox, Radio } from 'antd';
import moment from 'moment';
import Registrations from '../input-factory/Registration';

export interface ValueConverter {
  name: string
  title?: string
  /**
   * 将控件的value转换成fieldValue
   */
  getValue: (v: any, ...args: Array<any>) => any

  /**
   * 将fieldValue 转换成控件的value
   */
  setInput: (v: any, ...args: Array<any>) => any

}

export const ConverterRegistry = new Registrations<ValueConverter>();

function register(component: any, name: string): any {
  if (component instanceof Array) {
    return component.forEach((c) => register(c, name));
  }
  component.valuePropName = name;
}


register(Switch, 'checked');
register(Checkbox, 'checked');
register(Radio, 'checked');

// 注册转换器
ConverterRegistry.register({
  name: 'moment',
  getValue: (v: any, fmt = 'YYYY-MM-DD HH:mm:ss') => {
    return v ? v.format(fmt) : null;
  },
  setInput: (v, fmt = 'YYYY-MM-DD HH:mm:ss') => {
    if (!v) return null;
    const value = moment(v, fmt);
    return value.isValid() ? value : null;
  },
});

export default {
  register,
  getConverter(name: string) {
    return ConverterRegistry.getRegistration(name);
  },
};
