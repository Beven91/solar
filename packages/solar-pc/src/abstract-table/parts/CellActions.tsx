/**
 * @name CellActions
 * @date 2018-05-07
 * @description
 *       表格操作列视图,用于渲染操作列中的按钮
 */
import React from 'react';
import { Popconfirm, Tooltip } from 'antd';
import { AbstractButton, OnActionRoute } from '../types';
import { AbstractRow } from '../../interface';
import renders from '../util/cellRenders';

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

export default class CellActions<TRow = AbstractRow> extends React.Component<CellActionsProps<TRow>> {
  // 默认属性
  static defaultProps = {
    buttons: [] as AbstractButton<AbstractRow>[],
    row: null as any,
    rowId: null as any,
  }

  // 判断是否可点击
  isEnable(button: AbstractButton<TRow>, row: TRow) {
    const { visible: enable = true } = button;
    const index = this.props.rowIndex;
    return typeof enable === 'function' ? enable(row, index) : enable;
  }

  isDisabled(button: AbstractButton<TRow>, row: TRow) {
    const { disabled = false } = button;
    const index = this.props.rowIndex;
    return typeof disabled === 'function' ? disabled(row, index) : disabled;
  }

  onClick(row: TRow, rowId: any, e: any, button: AbstractButton<TRow>) {
    const click = button.click || Noop;
    const { onAction } = this.props;
    if (button.click) {
      click(row as any, rowId, e);
    } else if (button.action && onAction) {
      const action = renders.createAction<TRow>({ action: button.action, model: row, id: rowId });
      onAction(action, button);
    }
  }

  // 渲染单个按钮
  renderNormal(button: AbstractButton<TRow>, i: number, confirm?: boolean) {
    const { row, rowId } = this.props;
    const buttonClick = confirm ? null : (e: any) => this.onClick(row, rowId, e, button);
    const render = button.render;
    const icon = button.icon;
    if (icon && !button.title && !button.render) {
      return (
        <span
          className="cell-operator"
          key={`cell-button-operator-${i}`}
          onClick={buttonClick}
        >
          {icon}
        </span>
      );
    }
    if (typeof render === 'function') {
      return (
        <span
          className="cell-operator"
          onClick={buttonClick}
          key={`cell-button-operator-${i}`}
        >
          {render(row)}
        </span>
      );
    }
    return (
      <a
        className="cell-operator"
        href={'href' in button ? button.href : undefined}
        target={button.target || undefined}
        key={`cell-button-operator-${i}`}
        onClick={buttonClick}
      >
        {button.title}
      </a>
    );
  }

  // 渲染需要确认提示的操作按钮
  renderConfirm(button: AbstractButton<TRow>, index: number) {
    const { row, rowId } = this.props;
    const { confirm } = button;
    const buttonClick = (e: any) => this.onClick(row, rowId, e, button);
    return (
      <Popconfirm okText="确定" cancelText="取消" key={`cell-operator-${index}`} title={confirm} onConfirm={buttonClick}>
        {this.renderNormal(button, index, true)}
      </Popconfirm>
    );
  }

  // 根据类型渲染按钮
  renderButton(button: AbstractButton<TRow>, index: number) {
    const { row } = this.props;
    const isEnable = this.isEnable(button, row);
    const isDisabled = this.isDisabled(button, row);
    // 可以传自定义的不可点击的button
    if (!isDisabled && (isEnable || button.render)) {
      return button.confirm ? this.renderConfirm(button, index) : this.renderNormal(button, index);
    } else if (isDisabled) {
      return (<a className="cell-operator" key={`cell-button-operator-${index}`}>{button.title}</a>);
    }
    return '';
  }

  // 渲染tooltip
  renderTooltip(button: AbstractButton<TRow>, index: number) {
    const children = this.renderButton(button, index);
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
  }

  // 渲染组件
  render() {
    const { buttons = [], style } = this.props;
    return (
      <div className="table-operators" style={style}>
        {buttons.map((button, i) => this.renderTooltip(button, i))}
      </div>
    );
  }
}
