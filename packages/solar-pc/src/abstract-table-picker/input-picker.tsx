/**
 * @module InputPicker
 * @description 提供一个输入框，带选择按钮来选择指定数据
 */
import React, { ChangeEvent } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { Input } from 'antd';
import Picker from './picker';
import { AbstractTableProps } from '../abstract-table/types';
import { AbstractRow } from '../interface';

export interface InputPickerProps<TRow> extends AbstractTableProps<TRow> {
  // 弹窗标题
  title: string
  // 选择数据发生改变事件
  onChange?: (value: string | TRow, row: TRow) => void
  // 自定义placeholder
  placeholder?: string
  /**
   * normal: 使用对应的字段值
   * object: 使用选择的对象
   */
  valueMode: 'normal' | 'object'
  // 值字段
  valueField?: string
  // 当前选中的数据
  value?: any
  // 默认值
  defaultValue?: string
  // 弹窗宽度
  width?: number
  // 弹窗高度
  height?: number
  // 是否允许清空
  allowClear?: boolean
}

export default class InputPicker<TRow extends AbstractRow = AbstractRow> extends React.PureComponent<InputPickerProps<TRow>> {
  // 默认属性值
  static defaultProps = {
    placeholder: '',
    valueField: 'id',
    valueMode: 'normal',
  };

  get nativeValue() {
    switch (this.props.valueMode) {
      case 'object':
        return (this.props.value || {})[this.props.valueField];
      case 'normal':
        return this.props.value;
    }
  }

  get nativeObject() {
    const { valueField, value } = this.props;
    switch (this.props.valueMode) {
      case 'object':
        return value || {};
      default:
        return {
          [valueField]: value,
        };
    }
  }

  // 选择改变
  handleSelectOnchange = (rows: TRow[]) => {
    const item = (rows[0] || {}) as TRow;
    const { onChange, valueField } = this.props;
    const v = item[valueField];
    if (v == this.nativeValue) {
      // 如果选择值没有发生变化
      return;
    }
    switch (this.props.valueMode) {
      case 'object':
        onChange && onChange(item, item);
        break;
      default:
        onChange && onChange(v, item);
    }
  };

  // 选择选择按钮
  renderAfter() {
    const { valueField, ...props } = this.props;
    const selected = [
      this.nativeObject,
    ];
    return (
      <Picker
        {...props}
        select="single"
        onChange={this.handleSelectOnchange}
        value={selected}
        rowKey={valueField || props.rowKey}
      >
        <SearchOutlined className="object-picker-icon" />
      </Picker>
    );
  }

  onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { onChange } = this.props;
    if (e.target.value === '') {
      // 清空
      onChange && onChange(null, null);
    }
  };

  // 渲染组件
  render() {
    const { placeholder, defaultValue, className, style } = this.props;
    return (
      <Input
        style={style}
        value={this.nativeValue}
        defaultValue={defaultValue}
        placeholder={placeholder}
        allowClear={this.props.allowClear}
        className={`${className || ''} abstract-picker-input`}
        addonAfter={this.renderAfter()}
        onChange={this.onInputChange}
      />
    );
  }
}
