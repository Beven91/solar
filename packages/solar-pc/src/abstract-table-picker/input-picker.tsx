/**
 * @module InputPicker
 * @description 提供一个输入框，带选择按钮来选择指定数据
 */
import React from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { Input } from 'antd';
import Picker from './picker';
import { AbstractTableProps } from '../abstract-table/types';
import { AbstractRow } from '../interface';

export interface InputPickerProps<TRow> extends AbstractTableProps<TRow> {
  // 弹窗标题
  title: string
  // 选择数据发生改变事件
  onChange?: (value: string, row: TRow) => void
  // 自定义placeholder
  placeholder?: string
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
}

export default class InputPicker<TRow extends AbstractRow = AbstractRow> extends React.PureComponent<InputPickerProps<TRow>> {
  // 默认属性值
  static defaultProps = {
    placeholder: '',
    valueField: 'id',
  };

  picker = React.createRef<Picker>();

  // 选择改变
  handleSelectOnchange = (rows: TRow[]) => {
    const item = (rows[0] || {}) as TRow;
    const { onChange, valueField } = this.props;
    const v = item[valueField];
    onChange && onChange(v, item);
  };

  // 选择选择按钮
  renderAfter() {
    const { valueField, ...props } = this.props;
    const selected = [
      {
        [valueField]: props.value,
      },
    ];
    return (
      <Picker
        {...props}
        select="single"
        ref={this.picker}
        onChange={this.handleSelectOnchange}
        value={selected}
        rowKey={valueField || props.rowKey}
      >
        <SearchOutlined />
      </Picker>
    );
  }

  // 渲染组件
  render() {
    const { placeholder, defaultValue, className, value, style } = this.props;
    return (
      <Input
        style={style}
        value={value}
        defaultValue={defaultValue}
        placeholder={placeholder}
        onKeyUp={() => this.picker.current.open()}
        className={`${className || ''} abstract-picker-input`}
        addonAfter={this.renderAfter()}
      />
    );
  }
}
