import React, { useRef, useState } from 'react';
import { Button, Popconfirm } from 'antd';
import { AbstractButton } from '../types';
import { CellActionsProps } from './CellActions';
import renders from '../util/cellRenders';

export interface CellButtonProps<TRow> {
  onAction: CellActionsProps<TRow>['onAction']
  options: AbstractButton<TRow>
  row: TRow
  rowId: string
}

const Noop = () => { };

export function CellButton<TRow>(props: CellButtonProps<TRow>) {
  const button = props.options;
  const row = props.row;
  const rowId = props.rowId;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  const { icon, render, confirm, tip, action, type, select, visible, click, disabled, title, ...btnProps } = button;
  const showConfirm = !!confirm;
  const href = 'href' in button ? button.href : undefined;
  const [loading, setLoading] = useState(false);
  const memo = useRef({ timerId: 0 as any });
  const realClick = button.click || Noop;

  const handleAction = (e: any) => {
    const r = realClick(row as any, rowId, e) as any;
    if (r instanceof Promise) {
      memo.current.timerId = setTimeout(()=>{setLoading(true);}, 80);
      setLoading(true);
      Promise.resolve(r).finally(() => {
        clearTimeout(memo.current.timerId);
        setLoading(false);
      });
    }
  };

  const onClick = (e: any) => {
    const { onAction } = props;
    if (button.click) {
      handleAction(e);
    } else if (button.action && onAction) {
      const action = renders.createAction<TRow>({ action: button.action, model: row, id: rowId });
      onAction(action, button);
    }
  };

  const createButton = (href: string, onClick: any) => {
    return (
      <Button
        {...btnProps}
        icon={icon}
        loading={loading}
        className="cell-operator"
        href={href}
        target={button.target || undefined}
        onClick={onClick}
        type={type || 'link'}
      >
        {title}
      </Button>
    );
  };

  const createAction = (onClick: (e: any) => any) => {
    if (typeof render === 'function') {
      return (
        <span className="cell-operator" onClick={onClick}>
          {render(props.row, createButton)}
        </span>
      );
    }
    return createButton(href, onClick);
  };

  return (
    <Popconfirm
      okText="确定"
      cancelText="取消"
      title={confirm}
      disabled={!showConfirm}
      onConfirm={onClick}
    >
      {createAction(showConfirm ? null : onClick)}
    </Popconfirm>
  );
}