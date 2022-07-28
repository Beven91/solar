/**
 * @modle ObjectPicker
 * @description 对象选择
 */
import './index.scss';
import React from 'react';
import Picker, { ObjectPickerProps } from './picker';
import InputPicker from './input-picker';
import { AbstractRow } from '../interface';

export default class AbstractTablePicker<TRow extends AbstractRow> extends React.Component<ObjectPickerProps<TRow>> {
  static InputPicker = InputPicker;

  render() {
    return (
      <Picker {...this.props} />
    );
  }
}
