/**
 * @name Formatters
 * @description
 *       表格列格式化工具
 */
import { Image } from 'antd';
import moment from 'moment';
import React from 'react';
import { Oss } from 'solar-core';
import { AbstractRow } from '../../interface';
import { AbstractColumnType } from '../types';
import Registrations, { RegistrationBase } from '../../input-factory/Registration';
import OptionsPicker from '../../options-picker';

export interface FormatContext<T = any, O = any> {
  row: T
  column: AbstractColumnType<T>
  options: O
}

export interface FormatRegistration extends RegistrationBase {
  format: (v: any, options: FormatContext<AbstractRow>) => string | React.ReactNode | React.ReactElement
}

class FormatterRegistrations extends Registrations<FormatRegistration> {
  call(name: string, value: string, ctx: FormatContext<AbstractRow>) {
    const registration = this.getRegistration(name);
    if (!registration) {
      return value;
    }
    return registration.format(value, ctx);
  }
}

const formatters = new FormatterRegistrations();

// 日期格式化
function date(value: any, ctx: FormatContext) {
  return value ? moment(value).format(ctx?.options?.fmt || 'YYYY-MM-DD HH:mm:ss') : '';
}

// 是否格式化
function boolean(value: any) {
  return value ? '是' : '否';
}

// 金钱格式化
function money(v: any) {
  return Number(v || 0).toFixed(2);
}

// 枚举
export function enums(data: any) {
  let values = {} as any;
  if (data instanceof Array) {
    data.forEach((item) => {
      values[item.value] = item.label || item.name;
    });
  } else {
    values = data || {};
    // values = Object.keys(data).reduce((all, k) => {
    //   all[data[k]] = k;
    //   return all;
    // }, {} as any);
  }
  return (value: any) => {
    const v = values[value];
    return v === undefined ? '-' : v;
  };
}

// 图片列格式化
function image(src: string) {
  src = Oss.getPublicUrl(src);
  return <Image className="cell-image" src={src} />;
}

function privateImage(src: string) {
  src = Oss.getPrivateUrl(src);
  return <Image className="cell-image" src={src} />;
}

// 外键数据查看
function fk(value: any, ctx: FormatContext) {
  return (
    <span onClick={(e) => handleViewFk(e, ctx.row, ctx.column)}>
      查看
    </span>
  );
}

// 查看fk数据
function handleViewFk(e: any, row: AbstractRow, column: AbstractColumnType<AbstractRow>) {
  const name = row[column.name + '__fk'];
  if (row[name]) {
    return;
  }
  const fkName = column.fk[0];
  const handler = column.fk[1];
  const target = e.currentTarget;
  target.innerHTML = '查询中...';
  handler(row).then((result) => {
    row[name] = true;
    const data = result || {};
    const item = data instanceof Array ? (data[0] || {}) : data;
    const v = item[fkName];
    target.innerHTML = v === '' ? row[column.name] : v;
  });
}

function dictionary(value: string, ctx: FormatContext) {
  return <OptionsPicker.OptionsView value={value} optionsKey={ctx.options.source} />;
}

formatters.register(
  [
    {
      name: 'date',
      format: date,
      options: [
        { title: '格式化', name: 'fmt', placeholder: '例如: YYYY-MM-DD' },
      ],
    },
    {
      name: 'enums',
      format: dictionary,
      options: [
        {
          title: '数据源',
          name: 'source',
          render: <OptionsPicker optionsKey="@index" />,
        },
      ],
    },
    { name: 'boolean', format: boolean },
    { name: 'money', format: money },
    { name: 'image', format: image },
    { name: 'fk', format: fk },
    { name: 'privateImage', format: privateImage },
  ]
);

export default formatters;
