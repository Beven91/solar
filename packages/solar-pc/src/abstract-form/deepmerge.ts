import { FormInstance } from 'antd';

export default function merge(target: Record<string, any>, from: Record<string, any>) {
  Object.keys(from || {}).forEach((key) => {
    const value = target[key];
    if (value?.forEach) {
      target[key] = from[key];
    } else if (typeof value == 'object' && value) {
      merge(value, from[key]);
    } else {
      target[key] = from[key];
    }
  });
  return { ...target };
}

const isObject = (v: any) => v && typeof v == 'object';

const isArray = (v: any) => v instanceof Array;

export function mergeFormValues(target: Record<string, any>, form: FormInstance) {
  const record = { ...(target || {}) };
  if (!form) {
    return record;
  }
  const allValues = form.getFieldsValue();
  const fields = form.getFieldsError().map((m) => m.name.join(''));

  const mergeValue = (store: Record<string, any>, value: any, key: any, namePath: string[]) => {
    const id = [...namePath, key].join('');
    const isField = fields.indexOf(id) > -1;
    if (isField) {
      store[key] = value;
    } else if (isArray(value)) {
      const ov = [...(store[key] || [])];
      value.forEach((vv:any, index:number)=>{
        mergeValue(ov, vv, index, [...namePath, key]);
      });
      store[key] = ov;
    } else if (isObject(value)) {
      const ov = { ...(store[key] || {}) };
      Object.keys(value).forEach((k) => mergeValue(ov, value[k], k, [...namePath, key]));
      store[key] = ov;
    }
  };

  Object.keys(allValues || {}).forEach((key) => {
    mergeValue(record, allValues[key], key, []);
  });
  return record;
}
