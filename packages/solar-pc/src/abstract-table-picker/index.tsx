/**
 * @modle ObjectPicker
 * @description 对象选择
 */
import './index.scss';
import React from 'react';
import Picker, { ObjectPickerProps } from './picker';
import InputPicker from './input-picker';
import { AbstractRow } from '../interface';

export default function AbstractTablePicker<TRow extends AbstractRow>(props: React.PropsWithChildren<ObjectPickerProps<TRow>>) {
  return (
    <Picker {...props} />
  );
}

AbstractTablePicker.InputPicker = InputPicker;