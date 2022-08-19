/**
 * @module Item
 * @description 动态antd FormItem
 */
import React from 'react';
import { Col, Form } from 'antd';
import { FormInstance, Rule } from 'antd/lib/form';
import InputWrap from './InputWrap';
import { AbstractFormItemType, AbstractFormLayout, AbstractRow, onValuesChangeHandler } from '../interface';
import ConfigConsumer from '../abstract-provider';

const FormItem = Form.Item;
const isVisible = (item: AbstractFormItemType<AbstractRow>, data: AbstractRow) => {
  if (typeof item.visible === 'function') {
    return item.visible(data);
  } else if ('visible' in item) {
    return item.visible;
  }
  return true;
};

const isDisabled = (item: AbstractFormItemType<AbstractRow>, data: AbstractRow) => {
  if (item.textonly) {
    return true;
  }
  if (typeof item.disabled === 'function') {
    return item.disabled(data);
  } else if ('disabled' in item) {
    return item.disabled;
  }
  return false;
};

export interface AbstractItemProps<TRow> {
  // 布局
  layout?: AbstractFormLayout
  // 配置项信息
  item: AbstractFormItemType<TRow>
  // form 对象
  form: React.RefObject<FormInstance>
  // 校验规则
  rules?: Rule[]
  // 对象数据
  model: TRow
  // 当前是否为只读模式
  isReadOnly?: boolean
  // 设置外包col配置
  colOption?: {
    span: number
    className: string
  },
  style?: React.CSSProperties
  // 表单值发生改变时间
  onValuesChange?: onValuesChangeHandler
  autoFocusAt?: string
}

export interface AbstractItemState {
  // visible函数
  visibleFunction: (data: any) => boolean
  // 当前表单是否可见
  visible: boolean
  // disabled函数
  disabledFunction: (data: any) => boolean
  // 当前是否禁用
  disabled: boolean
  // 是否强制更新visible 和disabled
  forceUpdate: boolean
}

export default class Item<TRow extends AbstractRow = AbstractRow> extends React.Component<AbstractItemProps<TRow>> {
  // 默认属性值
  static defaultProps = {
    layout: {},
    item: {},
    model: {},
    rules: [] as Rule[],
  };

  static getDerivedStateFromProps(nextProps: AbstractItemProps<AbstractRow>, state: AbstractItemState) {
    const { item } = nextProps;
    const getRecord = () => {
      const { model, form } = nextProps;
      const formRef = form || { current: null };
      const values = formRef.current ? formRef.current.getFieldsValue() : {};
      return {
        ...(model || {}),
        ...values,
      };
    };

    if (state.forceUpdate || item.visible != state.visibleFunction || item.disabled !== state.disabledFunction) {
      const record = getRecord();
      return {
        disabledFunction: item.disabled,
        disabled: isDisabled(item, record),
        visibleFunction: item.visible,
        visible: isVisible(item, record),
      };
    }
    return null;
  }

  // 当前组件状态
  state: AbstractItemState = {
    // visible函数
    visibleFunction: null as any,
    // 当前表单是否可见
    visible: true,
    disabledFunction: null as any,
    disabled: false,
    forceUpdate: false,
  };

  private timerId: any;

  inputWrapRef = React.createRef<InputWrap<TRow>>();

  formatUpdate = false;

  getValue(name: string[], curValues: TRow) {
    let value = curValues;
    if (name.length <= 1) {
      return curValues[name[0]];
    }
    for (let i = 0, k = name.length; i < k; i++) {
      value = value[name[i]];
      if (!value) {
        break;
      }
    }
    return value;
  }

  shouldUpdate = (prevValues: any, curValues: any) => {
    const form = this.props.form.current;
    const anyForm = form as any;
    const item = this.props.item;
    const visible = isVisible(item, curValues);
    const disabled = isDisabled(item, curValues);
    const name = this.normalizeKey(item);
    const updateKeys = anyForm?.updateKeys || {};
    const keyName = name.join('.');
    const prevValue = this.getValue(name, prevValues);
    const curValue = this.getValue(name, curValues);
    const changed = this.state.visible !== visible || disabled !== this.state.disabled || prevValue !== curValue;
    if (typeof item.render === 'function' && !changed) {
      // 这里保证函，动态组件，必须渲染
      clearTimeout(this.timerId);
      this.timerId = setTimeout(() => {
        const current = this.inputWrapRef.current;
        if (current) current.forceUpdate();
      }, 10);
      return false;
    }
    if (keyName in updateKeys) {
      return true;
    }

    // if (form && !visible) {
    //   form.resetFields([name]);
    // }
    const formatUpdate = this.formatUpdate;
    if (item.format && !this.formatUpdate) {
      const v = item.format(curValues);
      this.formatUpdate = true;
      form?.setFieldsValue({ [item.name as string]: v });
    }
    if (changed) {
      this.setState({ visible, disabled });
    }
    this.formatUpdate = false;
    if (formatUpdate) {
      return true;
    }
  };

  normalize = (value: TRow, prevValue: TRow, prevValues: TRow) => {
    const item = this.props.item;
    const form = this.props.form.current;
    if (item.cascade && form) {
      const model = {
        ...(item.cascade(value, prevValues, prevValue)),
      };
      (form as any).updateKeys = model;
      form.setFieldsValue(model);
      (form as any).updateKeys = {};
      // console.log(this.updateKeys);
      // this.updateKeys = {}
    }
    if (item.normalize) {
      return item.normalize(value, prevValue, prevValue);
    }
    return value;
  };

  normalizeKey(item: AbstractFormItemType<TRow>) {
    return item.name instanceof Array ? item.name : (item.name || '').split('.');
  }

  useInitialValue(record: TRow, name: Array<string>) {
    let iterator = record;
    if (!record) {
      return true;
    }
    for (let i = 0, k = name.length; i < k; i++) {
      iterator = iterator[name[i]];
      if (iterator === undefined || iterator === null) {
        return true;
      }
    }
    return iterator === undefined;
  }

  componentDidMount() {
    if (!this.props.form?.current) {
      this.setState({ forceUpdate: true });
    }
  }

  // 渲染
  renderItem() {
    const { layout, item, rules, autoFocusAt, model: record } = this.props;
    const initialValue = item.initialValue;
    const visible = this.state.visible;
    const visibleCls = this.state.visible ? 'visible' : 'hidden';
    const name = this.normalizeKey(item);
    const items = this.useInitialValue(record, name) ? { initialValue } : {};
    const shouldUpdate = item.dependencies ? undefined : this.shouldUpdate;
    const title = item.render2 ? '' : item.title || '';
    const type = item.render2 ? 'input-full' : '';
    return (
      <ConfigConsumer.Consumer>
        {
          (context) => (
            <FormItem
              shouldUpdate={shouldUpdate}
              {...layout}
              {...items}
              label={title}
              name={name}
              rules={visible ? rules : null}
              extra={item.extra || null}
              dependencies={item.dependencies}
              normalize={this.normalize}
              className={`${visibleCls} abstract-form-item abstract-input-${item.name} ${type} ${item.className || ''}`}
              hasFeedback={item.hasFeedback}
            >
              {
                <InputWrap
                  item={item}
                  autoFocus={autoFocusAt && autoFocusAt == item.name}
                  ref={this.inputWrapRef}
                  onValuesChange={this.props.onValuesChange}
                  valueFormatter={context.valueFormatter}
                  record={record}
                  form={this.props.form}
                  isReadOnly={this.state.disabled || this.props.isReadOnly}
                />
              }
            </FormItem>
          )
        }
      </ConfigConsumer.Consumer>
    );
  }

  renderSlot() {
    const { item, style, model: record } = this.props;
    const hasAfter = item.after;
    if (hasAfter) {
      return (
        <FormItem
          style={style}
          className={hasAfter ? 'has-after' : ''}
        >
          {this.renderItem()}
          {
            (item.after) && (
              <div className="form-item-after">
                {item.after(record)}
              </div>
            )
          }
        </FormItem>
      );
    }
    return this.renderItem();
  }

  render() {
    const { colOption } = this.props;
    if (colOption) {
      const visible = this.state.visible;
      return (
        <Col
          span={colOption.span}
          className={`abstract-form-item-col ${visible ? '' : 'hidden'} ${colOption.className}`}
        >
          {this.renderSlot()}
        </Col>
      );
    }
    return this.renderSlot();
  }
}
