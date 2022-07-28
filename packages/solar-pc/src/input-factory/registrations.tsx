/* eslint-disable react/display-name */
import React from 'react';
import { InputRegistration } from './index';
import IconPicker from '../icon-picker';
import { InputNumber, Switch, Checkbox, Input, Radio, Slider, DatePicker, TimePicker } from 'antd';
import AbstractTableInput from '../abstract-table-input';
import AbstractForm from '../abstract-form';
import AdvancePicker from '../advance-picker';
import OptionsPicker from '../options-picker';
import AdvanceUpload from '../advance-upload';

const checkboxColumns = [
  { title: '名称', name: 'label', editor: ()=><Input /> },
  { title: '值', name: 'value', editor: ()=><Input /> },
];

const OptionTypes = [
  { label: '默认', value: 'default' },
  { label: '按钮', value: 'button' },
];

const DateModes = [
  { label: '日期选择', value: 'date' },
  { label: '月份选择', value: 'month' },
  { label: '年份选择', value: 'year' },
  { label: '周选择器', value: 'week' },
  { label: '季节选择器', value: 'quarter' },
];

AbstractForm.registerConverter('advance-upload-dragger', {
  getValue: (v)=> v === true ? 'drag': 'select',
  setInput: (v) => v == 'drag',
});

export default [
  {
    name: 'iconfont',
    component: IconPicker.Input,
    options: [

    ],
  },
  {
    name: 'input',
    component: Input,
    options: [
      { title: '最大长度', name: 'maxLength', render: <InputNumber /> },
    ],
  },
  {
    name: 'textarea',
    component: Input.TextArea,
    options: [
      { title: '最大长度', name: 'maxLength', render: <InputNumber /> },
      { title: '展示字数', name: 'showCount', render: <Switch /> },
    ],
  },
  {
    name: 'number',
    component: InputNumber,
    options: [
      { title: '最大值', name: 'max', render: <InputNumber /> },
      { title: '最小值', name: 'min', render: <InputNumber /> },
      { title: '步长', name: 'step', render: <InputNumber /> },
    ],
  },
  {
    name: 'switch',
    component: Switch,
    options: [
    ],
  },
  {
    name: 'checkbox',
    component: Checkbox.Group,
    options: [
      { title: '数据源', name: 'options', span: 24, render: <AbstractTableInput columns={checkboxColumns} pagination={false} /> },
    ],
  },
  {
    name: 'radio',
    component: Radio.Group,
    options: [
      { title: '选项类型', name: 'optionType', render: <Radio.Group options={OptionTypes} /> },
      { title: '数据源', name: 'options', span: 24, render: <AbstractTableInput columns={checkboxColumns} pagination={false} /> },
    ],
  },
  {
    name: 'slider',
    component: Slider,
    options: [
      { title: '最大值', name: 'max', render: <InputNumber /> },
      { title: '最小值', name: 'min', render: <InputNumber /> },
      { title: '步长', name: 'step', render: <InputNumber /> },
    ],
  },
  {
    name: 'date',
    component: DatePicker,
    options: [
      { title: '选择器类型', name: 'picker', render: <AdvancePicker data={DateModes} /> },
    ],
  },
  {
    name: 'time',
    component: TimePicker,
    options: [
      // { title: '时间选择器类型', name: 'picker', render: <AdvancePicker data={DateModes} /> },
    ],
  },
  {
    name: 'options',
    component: OptionsPicker,
    options: [
      { title: '数据源', name: 'optionsKey', render: <OptionsPicker labelName="title" valueName="name" optionsKey="index" /> },
    ],
  },
  {
    name: 'upload',
    component: AdvanceUpload,
    options: [
      { title: '上限', initialValue: 1, name: 'max', render: <InputNumber min={1} />, extra: '最多可以上传多少个' },
      { title: '文件类型', name: 'accept', render: <OptionsPicker optionsKey="mimeTypes" /> },
      { title: '大小限制', name: 'maxFileSize', render: <InputNumber />, extra: '单位为: 字节' },
      { title: '开启拖拽', name: 'type', convert: 'advance-upload-dragger', render: <Switch /> },
      { title: '按钮文案', name: 'uploadText' },
    ],
  },
] as InputRegistration[];