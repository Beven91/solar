/**
 * @name TopActions
 * @date 2018-05-07
 * @description 表格顶部的操作按钮条
 */
import React, { ReactNode } from 'react';
import { Button, Popconfirm, Row, Col } from 'antd';
import { AbstractButton, OnActionRoute } from '../types';
import { AbstractRow } from '../../interface';
import renders from '../util/cellRenders';

const Noop = (a: any) => a;

export interface TopActionsProps<TRow> {
  // 操作按钮 具体内容查看 Types.button类型定义
  buttons: AbstractButton<TRow>[]
  // 选中的行数据
  selectedRows: TRow[]
  renderTopBar?: () => ReactNode
  onAction: OnActionRoute<TRow>
}

export default class TopActions<TRow = AbstractRow> extends React.Component<TopActionsProps<TRow>> {
  // 默认属性
  static defaultProps = {
    buttons: [] as AbstractButton<AbstractRow>[],
    selectedRows: [] as AbstractRow[],
    renderTopBar: () => '',
  }

  onClick(row: TRow | TRow[], rowId: any, e: any, button: AbstractButton<TRow>) {
    const click = button.click || Noop;
    const action = button.action;
    const { onAction } = this.props;
    if (button.click) {
      click(row as any, rowId, e);
    } else if (action && onAction) {
      onAction(renders.createAction<TRow>({ action, model: row as TRow, id: rowId }), button);
    }
  }

  // 获取制定按钮，是否需要禁用
  isDisabled(btn: AbstractButton<TRow>, rows: TRow[]) {
    if (btn.select) {
      switch (btn.select) {
        case 'single':
          return rows.length !== 1 || this.evaluateDisabledFunction(btn, rows)();
        default:
          return rows.length <= 0 || this.evaluateDisabledFunction(btn, rows)();
      }
    }
    return false;
  }

  evaluateDisabledFunction(btn: AbstractButton<TRow>, rows: TRow[]) {
    if (btn.visible) {
      return () => !!rows.find((r) => !btn.visible(r, 0));
    } else if (btn.disabled) {
      return () => !!rows.find((r) => btn.disabled(r, 0));
    }
    return () => false;
  }

  // 渲染单个按钮
  renderNormal(button: AbstractButton<TRow>, i: number, confirm?: boolean) {
    const { selectedRows } = this.props;
    const single = (button.select === 'single' || !button.select);
    const buttonClick = confirm ? null : (e: any) => this.onClick(single ? selectedRows[0] : selectedRows, '', e, button);
    const disabled = this.isDisabled(button, selectedRows);
    if (button.render) {
      return (
        <span key={`table-button-operat-${i}`}>
          {button.render()}
        </span>
      );
    }
    return (
      <Button
        className="operator"
        icon={button.icon}
        key={`table-button-operat-${i}`}
        type={button.type || 'primary'}
        onClick={buttonClick}
        disabled={disabled}
      >
        {button.title}
      </Button>
    );
  }

  // 渲染跳转按钮
  renderLinkButton(button: AbstractButton<TRow>, i: number) {
    return (
      <a
        key={`table-button-link-operat-${i}`}
        href={button.href}
        target={button.target}
      >
        {this.renderNormal(button, i)}
      </a>
    );
  }

  // 渲染需要确认提示的操作按钮
  renderConfirm(button: AbstractButton<TRow>, index: number) {
    const { confirm } = button;
    const { selectedRows } = this.props;
    const single = (button.select === 'single' || !button.select);
    const buttonClick = (e: any) => this.onClick(single ? selectedRows[0] : selectedRows, -1, e, button);
    return (
      <Popconfirm
        okText="确定"
        cancelText="取消"
        className="operator-confirm"
        disabled={this.isDisabled(button, selectedRows)}
        key={`table-operat-${index}`}
        title={confirm}
        onConfirm={buttonClick}
      >
        {this.renderNormal(button, index, true)}
      </Popconfirm>
    );
  }

  // 根据类型渲染按钮
  renderButton = (button: AbstractButton<TRow>, index: number) => {
    if (button.confirm) {
      return this.renderConfirm(button, index);
    } else if (button.href) {
      return this.renderLinkButton(button, index);
    }
    return this.renderNormal(button, index);
  }

  // 渲染组件
  render() {
    const { buttons, renderTopBar } = this.props;
    if (buttons.length < 1) {
      return renderTopBar();
    }
    return (
      <Row className="search-tool-bar">
        <Col span={24} style={{ textAlign: 'right' }}>
          <div className="table-operators">
            {renderTopBar()}
            {!buttons ? null : buttons.map(this.renderButton)}
          </div>
        </Col>
      </Row>
    );
  }
}
