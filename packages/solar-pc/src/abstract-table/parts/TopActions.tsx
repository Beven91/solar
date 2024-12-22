/**
 * @name TopActions
 * @date 2018-05-07
 * @description 表格顶部的操作按钮条
 */
import ReactDOM from 'react-dom';
import React, { ReactNode, useContext, useMemo } from 'react';
import { Row, Col, Space } from 'antd';
import { AbstractButton, OnActionRoute } from '../types';
import { AbstractRow } from '../../interface';
import AbstractPermission from '../../abstract-permission';
import { TopButton } from './TopButton';

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
  onDone?: (btn: AbstractButton<TRow>)=> void
}

export function usePermissionButtons<TRow>(buttons: AbstractButton<TRow>[]) {
  const permissionCtx = useContext(AbstractPermission.Context);
  return useMemo(() => {
    buttons = buttons || [];
    return buttons.filter((button) => {
      const roles = String(button.roles || '').split(',').filter(Boolean);
      if (roles.length < 1) return true;
      return permissionCtx.hasPermission(...roles);
    });
  }, [buttons]);
}

export default function TopActions<TRow = AbstractRow>({
  onAction,
  selectedRows = [],
  renderTopBar = () => null,
  ...props
}: TopActionsProps<TRow>) {
  const buttons = usePermissionButtons(props.buttons);

  // 根据类型渲染按钮
  const renderButton = (button: AbstractButton<TRow>, index: number) => {
    return (
      <TopButton
        onAction={onAction}
        options={button}
        onDone={props.onDone}
        key={`top-actions-${index}`}
        selectedRows={selectedRows}
      />
    );
  };

  // 渲染组件
  if (buttons?.length < 1) {
    return renderTopBar() as React.ReactElement;
  }
  const container = props.getContainer?.();
  const children = (
    <Row className={'search-tool-bar abstract-table-top-actions'}>
      <Col span={24} style={{ textAlign: 'right' }} className="table-operators-wrapper">
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
