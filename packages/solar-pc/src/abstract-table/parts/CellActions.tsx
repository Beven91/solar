/**
 * @name CellActions
 * @date 2018-05-07
 * @description
 *       表格操作列视图,用于渲染操作列中的按钮
 */
import React, { useContext } from 'react';
import { Popconfirm, Button, Tooltip } from 'antd';
import { AbstractButton, OnActionRoute } from '../types';
import { AbstractRow } from '../../interface';
import renders from '../util/cellRenders';
import AbstractPermission from '../../abstract-permission';

const Noop = (a: any) => a;

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

  const onClick = (row: TRow, rowId: any, e: any, button: AbstractButton<TRow>) => {
    const click = button.click || Noop;
    const { onAction } = props;
    if (button.click) {
      click(row as any, rowId, e);
    } else if (button.action && onAction) {
      const action = renders.createAction<TRow>({ action: button.action, model: row, id: rowId });
      onAction(action, button);
    }
  };

  // 渲染单个按钮
  const renderNormal = (button: AbstractButton<TRow>, i: number, confirm?: boolean) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    const { icon, render, tip, action, type, select, visible, click, disabled, title, ...props } = button;
    const buttonClick = confirm ? null : (e: any) => onClick(row, rowId, e, button);
    const href = 'href' in button ? button.href : undefined;

    const createButton = (href: string, onClick: any) => {
      return (
        <Button
          {...props}
          icon={icon}
          className="cell-operator"
          href={href}
          target={button.target || undefined}
          key={`cell-button-operator-${i}`}
          onClick={onClick}
          type={type || 'link'}
        >
          {title}
        </Button>
      );
    };

    if (typeof render === 'function') {
      return (
        <span
          className="cell-operator"
          onClick={buttonClick}
          key={`cell-button-operator-in-${i}`}
        >
          {render(row, createButton)}
        </span>
      );
    }
    return createButton(href, buttonClick);
  };

  // 渲染需要确认提示的操作按钮
  const renderConfirm = (button: AbstractButton<TRow>, index: number) => {
    const { confirm } = button;
    const buttonClick = (e: any) => onClick(row, rowId, e, button);
    return (
      <Popconfirm okText="确定" cancelText="取消" key={`cell-operator-${index}`} title={confirm} onConfirm={buttonClick}>
        {renderNormal(button, index, true)}
      </Popconfirm>
    );
  };

  // 根据类型渲染按钮
  const renderButton = (button: AbstractButton<TRow>, index: number) => {
    const enable = isEnable(button, row, props.rowIndex);
    const disabled = isDisabled(button, row, props.rowIndex);
    // 可以传自定义的不可点击的button
    if (!disabled && (enable || button.render)) {
      return button.confirm ? renderConfirm(button, index) : renderNormal(button, index);
    } else if (disabled) {
      return (<a className="cell-operator" key={`cell-button-operator-${index}`}>{button.title}</a>);
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
