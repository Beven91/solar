import { AbstractAction, PlainObject } from '../../interface';
import { AbstractColumnType } from '../types';
import Formatters, { enums } from './formatters';

// 获取列render
export function getRender<TRow = any>(column: AbstractColumnType<TRow>) {
  const format = column.format;
  const formatData = typeof format === 'string' ? [format] : format || [];
  const formatName = formatData[0];
  if (column.render) {
    return column.render;
  } else if (column.enums) {
    return enums(column.enums);
  } else if (formatName) {
    return (v: any, row: TRow) => Formatters.call(formatName, v, { row, column, options: formatData[1] || {} });
  }
  return (a: any) => {
    // 空类型值渲染
    const v = a === null || a === undefined ? '' : a;
    return `${v}`;
  };
}

/**
 * 获取列默认的宽度值
 * @param {*} columns 表格所有列
 * @param {*} clientWidth 表格实际可见宽度
 */
function remainColumnWidth<TRow = any>(columns: AbstractColumnType<TRow>[], clientWidth: number) {
  if (clientWidth > 0) {
    const columns2 = columns.filter((column) => Number(column.width) > 0);
    const sum = columns2.reduce((total, column) => total + parseInt(column.width as any) + 32, 0);
    const count = columns.length - columns2.length;
    const remains = clientWidth - sum;
    return remains > 0 ? Math.max(remains / count, 92) : undefined;
  }
}

function createAction<TRow>(action: AbstractAction<TRow>) {
  action.create = (path: string, params: PlainObject) => {
    const res = { ...(params || {}), ...action } as any;
    path = path === '/' ? '/:action?/:id?' : path;
    Object.keys(res).forEach((k) => {
      const v = res[k];
      path = path.replace(`:${k}?`, v).replace(`:${k}`, v).replace(/\/\//g, '/');
    });
    return path;
  };
  return action;
}

export default {
  getRender,
  createAction,
  remainColumnWidth,
};
