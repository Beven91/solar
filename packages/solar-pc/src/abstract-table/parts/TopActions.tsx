/**
 * @name TopActions
 * @date 2018-05-07
 * @description 表格顶部的操作按钮条
 */
import ReactDOM from 'react-dom';
import React, { ReactNode, useContext } from 'react';
import { Button, Popconfirm, Row, Col, Space } from 'antd';
import { AbstractButton, OnActionRoute } from '../types';
import { AbstractRow } from '../../interface';
import renders from '../util/cellRenders';
import AbstractPermission from '../../abstract-permission';

const Noop = (a: any) => a;

export interface TopActionsProps<TRow> {
  // 容器样式名
  className?: string
  // 操作按钮 具体内容查看 Types.button类型定义
  buttons: AbstractButton<TRow>[]
  // 选中的行数据
  selectedRows: TRow[]
  renderTopBar?: () => ReactNode
  onAction: OnActionRoute<TRow>
  getContainer?: () => HTMLElement
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

function evaluateDisabledFunction<TRow>(btn: AbstractButton<TRow>, rows: TRow[]) {
  if (btn.visible) {
    return () => !!rows.find((r) => !btn.visible(r, 0));
  } else if (btn.disabled) {
    return () => !!rows.find((r) => btn.disabled(r, 0));
  }
  return () => false;
}

export default function TopActions<TRow = AbstractRow>({
  onAction,
  selectedRows = [],
  buttons = [],
  renderTopBar = () => null,
  ...props
}: TopActionsProps<TRow>) {
  const permissionCtx = useContext(AbstractPermission.Context);

  const onClick = (row: TRow | TRow[], rowId: any, e: any, button: AbstractButton<TRow>) => {
    const click = button.click || Noop;
    const action = button.action;
    if (button.click) {
      click(row as any, rowId, e);
    } else if (action && onAction) {
      onAction(renders.createAction<TRow>({ action, model: row as TRow, id: rowId }), button);
    }
  };


  // 渲染单个按钮
  const renderNormal = (button: AbstractButton<TRow>, i: number) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    const { select, tip, action, render, icon, visible, title, click, confirm, type, ...props } = button;
    const single = (select === 'single' || !select);
    const buttonClick = confirm ? null : (e: any) => {
      onClick(single ? selectedRows[0] : selectedRows, '', e, button);
    };
    const href = 'href' in button ? button.href : undefined;
    const disabled = isDisabled(button, selectedRows);
    const createButton = (href: string, onClick: any) => {
      return (
        <Button
          {...props}
          className="operator"
          icon={icon}
          href={href}
          target={button.target || undefined}
          key={`table-button-operat-${i}`}
          type={type || 'primary'}
          onClick={onClick}
          disabled={disabled}
        >
          {title}
        </Button>
      );
    };
    if (render) {
      return (
        <span key={`table-button-operat-in-${i}`}>
          {render(null, createButton)}
        </span>
      );
    }
    return createButton(href, buttonClick);
  };

  // 渲染跳转按钮
  const renderLinkButton = (button: AbstractButton<TRow>, i: number) => {
    return (
      <a
        key={`table-button-link-operat-${i}`}
        href={button.href}
        target={button.target}
      >
        {renderNormal(button, i)}
      </a>
    );
  };

  // 渲染需要确认提示的操作按钮
  const renderConfirm = (button: AbstractButton<TRow>, index: number) => {
    const { confirm } = button;
    const single = (button.select === 'single' || !button.select);
    const buttonClick = (e: any) => onClick(single ? selectedRows[0] : selectedRows, -1, e, button);
    return (
      <Popconfirm
        okText="确定"
        cancelText="取消"
        className="operator-confirm"
        disabled={isDisabled(button, selectedRows)}
        key={`table-operat-${index}`}
        title={confirm}
        onConfirm={buttonClick}
      >
        {renderNormal(button, index)}
      </Popconfirm>
    );
  };

  // 根据类型渲染按钮
  const renderButton = (button: AbstractButton<TRow>, index: number) => {
    if (button.roles && !permissionCtx.hasPermission(button.roles)) {
      // 如果没有权限
      return null;
    }
    if (button.confirm) {
      return renderConfirm(button, index);
    } else if (button.href) {
      return renderLinkButton(button, index);
    }
    return renderNormal(button, index);
  };

  // 渲染组件
  if (buttons?.length < 1) {
    return renderTopBar() as React.ReactElement;
  }
  const container = props.getContainer?.();
  const children = (
    <Row className={'search-tool-bar abstract-table-top-actions'}>
      <Col span={24} style={{ textAlign: 'right' }}>
        <Space className={`table-operators ${props.className || ''}`}>
          {renderTopBar()}
          {!buttons ? null : buttons.map((btn, index) => renderButton(btn, index))}
        </Space>
      </Col>
    </Row>
  );
  if (container) {
    return (
      <React.Fragment>
        {ReactDOM.createPortal(children, container)}
      </React.Fragment>
    );
  }
  return children;
}
