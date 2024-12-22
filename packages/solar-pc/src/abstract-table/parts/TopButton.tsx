import React, { useRef, useState } from 'react';
import { Button, Popconfirm } from 'antd';
import { AbstractButton } from '../types';
import { CellActionsProps } from './CellActions';
import renders from '../util/cellRenders';

export interface CellButtonProps<TRow> {
  onAction: CellActionsProps<TRow>['onAction']
  options: AbstractButton<TRow>
  selectedRows: TRow[]
  onDone: (btn: AbstractButton<TRow>) => void
}

const Noop = () => { };

function evaluateDisabledFunction<TRow>(btn: AbstractButton<TRow>, rows: TRow[]) {
  if (btn.visible) {
    return () => !!rows.find((r) => !btn.visible(r, 0));
  } else if (btn.disabled) {
    return () => !!rows.find((r) => btn.disabled(r, 0));
  }
  return () => false;
}

function isDisabled<TRow>(btn: AbstractButton<TRow>, rows: TRow[]) {
  if (btn.select) {
    switch (btn.select) {
      case 'single':
        return rows.length !== 1 || evaluateDisabledFunction(btn, rows)();
      default:
        return rows.length <= 0 || evaluateDisabledFunction(btn, rows)();
    }
  }
  return false;
}

export function TopButton<TRow>(props: CellButtonProps<TRow>) {
  const button = props.options;
  const selectedRows = props.selectedRows || [];
  const onAction = props.onAction;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  const { select, tip, action, render, icon, visible, title, click, confirm, type, ...btnProps } = button;
  const single = (select === 'single' || !select);
  const disabled = isDisabled(button, selectedRows);
  const showConfirm = !!confirm;
  const href = 'href' in button ? button.href : undefined;
  const [loading, setLoading] = useState(false);
  const memo = useRef({ timerId: 0 as any });
  const realClick = button.click || Noop;

  const handleAction = (row: TRow | TRow[], rowId: any, e: any) => {
    if (action && onAction) {
      onAction(renders.createAction<TRow>({ action, model: row as TRow, id: rowId }), button);
      return;
    }
    const r = realClick(row as any, rowId, e) as any;
    if (r instanceof Promise) {
      memo.current.timerId = setTimeout(() => {setLoading(true);}, 80);
      setLoading(true);
      Promise.resolve(r).finally(() => {
        clearTimeout(memo.current.timerId);
        setLoading(false);
        props.onDone?.(button);
      });
    } else {
      props.onDone?.(button);
    }
  };

  const onClick = (e: any) => {
    handleAction(single ? selectedRows[0] : selectedRows, '', e);
  };

  const createButton = (href: string, onClick: any) => {
    return (
      <Button
        {...btnProps}
        icon={icon}
        loading={loading}
        className="operator"
        href={href}
        target={button.target || undefined}
        onClick={onClick}
        type={type || 'primary'}
        disabled={disabled}
      >
        {title}
      </Button>
    );
  };

  const createAction = (onClick: (e: any) => any) => {
    if (typeof render === 'function') {
      return (
        <span className="cell-operator" onClick={onClick}>
          {render(null, createButton)}
        </span>
      );
    }
    return createButton(href, onClick);
  };

  return (
    <Popconfirm
      className="operator-confirm"
      title={confirm}
      disabled={!showConfirm || disabled}
      onConfirm={onClick}
    >
      {createAction(showConfirm ? null : onClick)}
    </Popconfirm>
  );
}