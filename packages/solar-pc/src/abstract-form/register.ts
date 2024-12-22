import { Switch, Checkbox, Radio } from 'antd';
import dayjs from 'dayjs';
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

function formatDate(v: any, fmt = 'YYYY-MM-DD HH:mm:ss') {
  return v ? v.format(fmt) : null;
}

function toDate(v, fmt = 'YYYY-MM-DD HH:mm:ss') {
  if (!v) return null;
  fmt = typeof fmt == 'string' ? fmt : 'YYYY-MM-DD HH:mm:ss';
  const value = dayjs(v, fmt);
  return value.isValid() ? value : null;
}

// 注册转换器
ConverterRegistry.register({
  name: 'date',
  getValue: formatDate,
  setInput: toDate,
});

ConverterRegistry.register({
  name: 'moment',
  getValue: formatDate,
  setInput: toDate,
});

export default {
  register,
  getConverter(name: string) {
    return ConverterRegistry.getRegistration(name);
  },
};
