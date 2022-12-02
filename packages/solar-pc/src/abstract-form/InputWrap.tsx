import React, { ReactElement } from 'react';
import { Input } from 'antd';
import { AbstractFormItemType, AbstractInputComponent, AbstractRow, onValuesChangeHandler } from '../interface';
import Registry, { ValueConverter } from './register';
import ReadOnly from './readOnly';
import { FormInstance } from 'antd/lib/form';

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

interface ConverterInfo {
  args: Array<any>
  convert: ValueConverter
}

export default class InputWrap<TRow> extends React.Component<InputWrapProps<TRow>> {
  valuePropName = 'value';

  containerRef = React.createRef<HTMLDivElement>();

  isCreated = false;

  get converter(): ConverterInfo {
    const { item } = this.props;
    const record = this.model;
    const convert = typeof item.convert === 'function' ? item.convert(record) : item.convert;
    const values = convert instanceof Array ? convert : [convert];
    return {
      args: values.slice(1),
      convert: Registry.getConverter(values[0] as string),
    };
  }

  get model() {
    if (this.props.form.current) {
      return this.props.form.current.getFieldsValue();
    }
    return this.props.record || {};
  }

  get formValues() {
    const { record } = this.props;
    if (this.isCreated && this.props.form.current) {
      return this.props.form.current.getFieldsValue();
    }
    return record;
  }

  valueFormatter(value: any) {
    // 全局格式化
    const { valueFormatter } = this.props;
    if (valueFormatter) {
      return valueFormatter(value);
    }
    return value;
  }

  getValue(v: any) {
    const info = this.converter;
    if (v && v.target) {
      v = v.target.value;
    }
    v = this.valueFormatter(v);
    if (info.convert) {
      return info.convert.getValue(v, ...info.args);
    }
    return v;
  }

  setInput() {
    const value = (this.props as any)['value'];
    const info = this.converter;
    if (info.convert) {
      return info.convert.setInput(value, ...info.args);
    }
    return value;
  }

  wrappedOnChange(component: JSX.Element, ...params: any[]) {
    const onChange = component.props.onChange;
    onChange && onChange(...params);
    this.onChange.call(this, ...params);
  }

  onChange = (v: any, ...params: Array<any>) => {
    const { item, onValuesChange } = this.props;
    const onChange = item.onChange;
    const value = this.getValue(v);
    const prevValues = this.model;
    if (onChange) {
      onChange(value, ...params);
    }
    if (this.props.onChange) {
      this.props.onChange(value, ...params);
    }
    if (onValuesChange) {
      onValuesChange(prevValues, this.model);
    }
  };

  componentDidMount() {
    this.isCreated = true;
    const container = this.containerRef.current;
    if (this.props.autoFocus && container) {
      const input = container.querySelector('input') || container.querySelector('textarea');
      setTimeout(()=>{
        input?.focus();
      }, 300);
    }
  }

  // 获取表单的值属性名
  renderPropValueName(input: ReactElement) {
    if (!input) return 'value';
    const type = input.type as AbstractInputComponent;
    return type.valuePropName || 'value';
  }

  // 根据类型创建对应的表单
  renderFormInput(item: AbstractFormItemType<TRow>, initialValue: any) {
    const render = item.render || item.render2;
    if (typeof render === 'function') {
      return render(this.formValues);
    } else if (render) {
      return render;
    }
    return this.renderDefaultInput(item, initialValue);
  }

  // 渲染默认表单
  renderDefaultInput(item: AbstractFormItemType<TRow>, initialValue: any) {
    const { isReadOnly } = this.props;
    initialValue = initialValue + '';
    if (isReadOnly) {
      return <ReadOnly value={initialValue} item={item} />;
    }
    return <Input placeholder={item.placeholder || ''} />;
  }

  render() {
    const { isReadOnly, item, id } = this.props;
    const initialValue = item.initialValue;
    const component = this.renderFormInput(item, initialValue);
    const valuePropName = this.valuePropName = this.renderPropValueName(component);
    if (!component) return null;
    const options = {
      [valuePropName]: this.setInput(),
      disabled: component.props.disabled || isReadOnly,
      placeholder: component.props.placeholder || item.placeholder,
      onChange: (...params: any[]) => this.wrappedOnChange(component, ...params),
    };
    if (item.render2) {
      options.title = item.title;
    }
    const input = React.cloneElement(component, options);
    return (
      <div ref={this.containerRef} id={id}>
        {input}
      </div>
    );
  }
}
