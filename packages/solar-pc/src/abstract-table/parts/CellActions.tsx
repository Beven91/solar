/**
 * @name CellActions
 * @date 2018-05-07
 * @description
 *       表格操作列视图,用于渲染操作列中的按钮
 */
import React, { useContext } from 'react';
import { Tooltip } from 'antd';
import { AbstractButton, OnActionRoute } from '../types';
import { AbstractRow } from '../../interface';
import AbstractPermission from '../../abstract-permission';
import { CellButton } from './CellButton';

export interface CellActionsProps<TRow> {
  // 操作按钮 具体内容查看 Types.button类型定义
  buttons: AbstractButton<TRow>[]
  // 当前行数据
  row: TRow
  rowIndex?: number
  // 当前数据主键字段
  rowId: string
  // 触发onAction
  onAction: OnActionRoute<TRow>
  style?: React.CSSProperties
}

// 判断是否可点击
function isEnable<TRow>(button: AbstractButton<TRow>, row: TRow, index: number) {
  const { visible: enable = true } = button;
  return typeof enable === 'function' ? enable(row, index) : enable;
}

function isDisabled<TRow>(button: AbstractButton<TRow>, row: TRow, index: number) {
  const { disabled = false } = button;
  return typeof disabled === 'function' ? disabled(row, index) : disabled;
}

export default function CellActions<TRow = AbstractRow>({
  buttons = [],
  style,
  row,
  rowId,
  ...props
}: CellActionsProps<TRow>) {
  const permissionCtx = useContext(AbstractPermission.Context);

  // 根据类型渲染按钮
  const renderButton = (button: AbstractButton<TRow>, index: number) => {
    const enable = isEnable(button, row, props.rowIndex);
    const disabled = isDisabled(button, row, props.rowIndex);
    // 可以传自定义的不可点击的button
    if (!disabled && (enable || button.render)) {
      return (
        <CellButton
          onAction={props.onAction}
          key={`cell-button-operator-${index}`}
          row={row}
          rowId={rowId}
          options={button}
        />
      );
    } else if (disabled) {
      return (
        <a className="cell-operator" key={`cell-button-operator-${index}`}>
          {button.title}
        </a>
      );
    }
    return '';
  };

  // 渲染tooltip
  const renderTooltip = (button: AbstractButton<TRow>, index: number) => {
    if (button.roles && !permissionCtx.hasPermission(button.roles)) {
      // 如果没有权限
      return;
    }
    const children = renderButton(button, index);
    if (children && button.tip) {
      return (
        <Tooltip
          title={button.tip}
          placement="bottom"
          key={`cell-button-operator-tip-${index}`}
        >
          {children}
        </Tooltip>
      );
    }
    return children;
  };

  return (
    <div className="table-operators" style={style}>
      {buttons.map((button, i) => renderTooltip(button, i))}
    </div>
  );
}
