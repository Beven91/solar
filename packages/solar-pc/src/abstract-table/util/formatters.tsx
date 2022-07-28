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

// 日期格式化
function date(value: any) {
  return value ? moment(value).format('YYYY-MM-DD HH:mm:ss') : '';
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
function enums(data: any) {
  let values = {} as any;
  if (data instanceof Array) {
    data.forEach((item) => {
      values[item.value] = item.label || item.name;
    });
  } else {
    values = Object.keys(data).reduce((all, k) => {
      all[data[k]] = k;
      return all;
    }, {} as any);
  }
  return (value: any) => {
    const v = values[value];
    return v === undefined ? '未知' : v;
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
function fk(value: any, row: AbstractRow, column: AbstractColumnType<AbstractRow>) {
  return (
    <span onClick={(e) => handleViewFk(e, row, column)}>
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

export default {
  date,
  enums,
  boolean,
  money,
  image,
  fk,
  privateImage,
};
