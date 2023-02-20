/**
 * @module InputPicker
 * @description 提供一个输入框，带选择按钮来选择指定数据
 */
import React, { ChangeEvent, useCallback, useMemo } from 'react';
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
   valueMode?: 'normal' | 'object'
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

export default function InputPicker<TRow extends AbstractRow = AbstractRow>(
  {
    valueField = 'id',
    valueMode = 'normal',
    ...props
  }: InputPickerProps<TRow>
) {
  const nativeValue = useMemo(() => {
    switch (valueMode) {
      case 'object':
        return (props.value || {})[valueField];
      case 'normal':
        return props.value;
    }
  }, [valueMode, props.value, valueField]);


  const nativeObject = useMemo(() => {
    switch (valueMode) {
      case 'object':
        return props.value || {};
      default:
        return {
          [valueField]: props.value,
        };
    }
  }, [valueMode, valueField, props.value]);


  // 选择改变
  const handleSelectOnchange = useCallback((rows: TRow[]) => {
    const item = (rows[0] || {}) as TRow;
    const { onChange } = props;
    const v = item[valueField];
    if (v == nativeValue) {
      // 如果选择值没有发生变化
      return;
    }
    switch (valueMode) {
      case 'object':
        onChange && onChange(item, item);
        break;
      default:
        onChange && onChange(v, item);
    }
  }, [valueMode, nativeValue, valueField, props.onChange]);


  const onInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { onChange } = props;
    if (e.target.value === '') {
      // 清空
      onChange && onChange(null, null);
    }
  }, [props.onChange]);

  // 选择选择按钮
  const renderAfter = () => {
    const selected = [
      nativeObject,
    ];
    return (
      <Picker
        {...props}
        select="single"
        onChange={handleSelectOnchange}
        value={selected}
        rowKey={valueField || props.rowKey}
      >
        <SearchOutlined className="object-picker-icon" />
      </Picker>
    );
  };

  // 渲染组件
  const { placeholder, defaultValue, className, style } = props;
  return (
    <Input
      style={style}
      value={nativeValue}
      defaultValue={defaultValue}
      placeholder={placeholder}
      allowClear={props.allowClear}
      className={`${className || ''} abstract-picker-input`}
      addonAfter={renderAfter()}
      onChange={onInputChange}
    />
  );
}
