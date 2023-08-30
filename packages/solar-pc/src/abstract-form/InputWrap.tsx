import React, { useEffect, useMemo, useRef } from 'react';
import { Input } from 'antd';
import { AbstractFormItemType, AbstractRow, onValuesChangeHandler } from '../interface';
import Registry, { ValueConverter } from './register';
import ReadOnly from './readOnly';
import { FormInstance } from 'antd/lib/form';
import { mergeFormValues } from './deepmerge';

interface RecordProps<TRow> {
  record: TRow
  form: React.MutableRefObject<FormInstance>
}

interface ModelProps<TRow> {
  model: TRow
  form: React.MutableRefObject<FormInstance>
}

const useGenericKeys = (item: AbstractFormItemType<any>) => {
  return item.genericKeys && typeof item.name == 'string';
};

export interface ConverterInfo {
  args: Array<any>
  convert: ValueConverter
}

export interface InputWrapProps<TRow extends AbstractRow> {
  isReadOnly: boolean
  value?: any,
  id?: string
  record: TRow
  form: React.RefObject<FormInstance>
  item: AbstractFormItemType<TRow>
  valueFormatter?: (v: any) => any
  onChange?: (...params: Array<any>) => any
  // 表单值发生改变时间
  onValuesChange?: onValuesChangeHandler
  autoFocus?: boolean
}

export function getAllValues<TRow>(props: RecordProps<TRow> | ModelProps<TRow>) {
  const model = (props as ModelProps<TRow>).model || (props as RecordProps<TRow>).record;
  return mergeFormValues(model, props.form?.current) as TRow;
}

const getValue = (v: any, converter: ConverterInfo, valueFormatter: InputWrapProps<any>['valueFormatter']) => {
  const info = converter;
  if (v && v.target && v.nativeEvent) {
    v = v.target.value;
  }
  if (valueFormatter) {
    v = valueFormatter(v);
  }
  if (info.convert) {
    return info.convert.getValue(v, ...info.args);
  }
  return v;
};

const mappingToValue = (item: AbstractFormItemType<any>, value: any, record: Record<string, any>, reverse = false) => {
  if (useGenericKeys(item)) {
    const newValue = Object.keys(item.genericKeys).reduce((model, key) => {
      const name = item.genericKeys[key];
      const k1 = reverse ? key : name;
      const k2 = reverse ? name : key;
      model[k1] = record[k2];
      return model;
    }, {} as Record<string, any>);
    if (value !== undefined) {
      const name = item.genericKeys[item.name as string];
      newValue[name as string] = value;
    }
    return newValue;
  }
  return value;
};

export default function InputWrap<TRow>(props: InputWrapProps<TRow>) {
  const containerRef = useRef<HTMLDivElement>();
  const converter = useMemo<ConverterInfo>(() => {
    const { item } = props;
    const record = getAllValues(props);
    const convert = typeof item.convert === 'function' ? item.convert(record) : item.convert;
    const values = convert instanceof Array ? convert : [convert];
    return {
      args: values.slice(1),
      convert: Registry.getConverter(values[0] as string),
    };
  }, [props.item?.convert, props.form, props.record]);

  useEffect(() => {
    // 自动聚焦
    const container = containerRef.current;
    if (props.autoFocus && container) {
      const input = container.querySelector('input') || container.querySelector('textarea');
      setTimeout(() => input?.focus(), 300);
    }
  }, []);

  // 渲染默认表单
  const renderDefaultInput = (item: AbstractFormItemType<TRow>, initialValue: any) => {
    const { isReadOnly } = props;
    initialValue = initialValue + '';
    if (isReadOnly) {
      return <ReadOnly value={initialValue} item={item} />;
    }
    return <Input placeholder={item.placeholder || ''} />;
  };

  // 根据类型创建对应的表单
  const renderFormInput = (item: AbstractFormItemType<TRow>, initialValue: any) => {
    const render = item.render || item.render2;
    if (item.textonly) {
      return <ReadOnly value={initialValue} item={item} />;
    }
    if (typeof render === 'function') {
      return render(getAllValues(props));
    } else if (render) {
      return render;
    }
    return renderDefaultInput(item, initialValue);
  };

  const { isReadOnly, item, id } = props;
  const initialValue = item.initialValue;
  const component = renderFormInput(item, initialValue);
  if (!component) return null;
  const valuePropName = component?.type?.valuePropName || 'value';
  const inputValue = converter?.convert ? converter.convert.setInput(props.value, ...converter.args) : props.value;
  const allValues = getAllValues(props);
  const options = {
    [valuePropName]: mappingToValue(item, inputValue, allValues),
    disabled: component.props.disabled || isReadOnly,
    placeholder: isReadOnly ? '' : component.props.placeholder || item.placeholder,
    onChange: (v: any, ...params: any[]) => {
      if (useGenericKeys(item)) {
        v = v || {};
        const model = mappingToValue(item, undefined, v, true);
        props.form.current?.setFieldsValue(model);
        v = model[item.name as string];
      }
      const prevValues = getAllValues(props);
      const onChange = component.props.onChange;
      const value = getValue(v, converter, props.valueFormatter);
      if (onChange != item.onChange) {
        // 包裹组件本身的onChange
        onChange && onChange(v, ...params);
      }
      // 触发item配置的onChange
      item.onChange?.(value, ...params);
      // 触发form传递的onChange ---> 执行当前代码后，getModel()将获取到最新的值
      props.onChange?.(value, ...params);
      // 触发onValuesChnage
      props.onValuesChange?.(prevValues, getAllValues(props));
    },
  };
  if (item.customKey) {
    (options as any).key = item.customKey(allValues);
  }
  if (item.render2) {
    (options as any).title = item.title;
  }

  return (
    <div ref={containerRef} id={id}>
      {React.cloneElement(component, options)}
    </div>
  );
}