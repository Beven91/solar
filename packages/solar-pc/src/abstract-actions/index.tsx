/**
 * @module AbstractActions
 * @description 后台操作动作
 */
import './index.scss';
import React from 'react';
import Context, { ActionsContext } from './context';
import { ActionIfHook, ObjectIfHook, PopupIfHook, ListHook, DrawerIfHook } from './action';
import { AbstractRow, InitialAction, SubmitAction } from '../interface';
import { OnActionRoute } from '../abstract-table/types';

export interface AbstractActionsProps<TRow> {
  action: string
  subAction?: string
  className?: string
  style?: React.CSSProperties
  model?: TRow
  primaryKey?: string
  // 提交按钮是否展示loading
  confirmLoading?: boolean
  // 子动作是否提交中
  subConfirmLoading?: boolean
  routeAction?: InitialAction
  onRoute?: OnActionRoute<TRow>
  onRouteBack?: () => void
  onCancel?: () => boolean | void
  onSubCancel?: () => void
  onSubmit?: (data: SubmitAction<TRow>) => void
  [propName: string]: any
}

export interface AbstractActionsState {

}

export default class AbstractActions<TRow extends AbstractRow> extends React.Component<AbstractActionsProps<TRow>, AbstractActionsState> {
  // 动作
  static If = ActionIfHook

  // 带表单的动作
  static Object = ObjectIfHook

  // 弹窗类型
  static Popup = PopupIfHook

  // 列表动作
  static List = ListHook

  // Drawer表单
  static Drawer = DrawerIfHook

  preRouteAction: InitialAction

  isNeedBack: boolean

  containerRef = React.createRef<HTMLDivElement>()

  shouldHideList = false

  get actionContext() {
    const { onCancel, onSubCancel, subAction, onRouteBack, action, onSubmit, model: record, ...props } = this.props;
    return {
      record,
      onCancel: () => {
        const isRoute = this.preRouteAction && this.preRouteAction.action == action;
        onCancel && onCancel();
        this.isNeedBack = false;
        if (isRoute && onRouteBack) {
          onRouteBack();
        }
      },
      onSubmit: (values: TRow) => {
        const isRoute = this.preRouteAction && this.preRouteAction.action == action;
        onSubmit && onSubmit({ action, model: values });
        subAction && onSubCancel && onSubCancel();
        this.isNeedBack = !!(isRoute && onRouteBack);
      },
      onSubSubmit: (values: TRow) => {
        onSubmit && onSubmit({ action: subAction, model: values });
      },
      onSubCancel: () => {
        onSubCancel && onSubCancel();
      },
      ...props,
      listRef: this.containerRef,
      subConfirmLoading: this.props.subConfirmLoading,
      confirmLoading: this.props.confirmLoading,
      action: this.props.action,
      subAction,
      shouldHiddenList: (hidden: boolean) => {
        this.shouldHideList = hidden;
      },
    } as ActionsContext<TRow>;
  }

  checkRouteAction() {
    const { routeAction, onRoute, onRouteBack } = this.props;
    const preRoute = (this.preRouteAction || {}) as InitialAction;
    const currentRoute = routeAction || {} as InitialAction;

    if (this.props.action !== preRoute.action && this.isNeedBack) {
      this.isNeedBack = false;
      return onRouteBack();
    }

    if (currentRoute.action !== preRoute.action || currentRoute.id !== preRoute.id) {
      if (this.isNeedBack) {
        this.isNeedBack = false;
        onRouteBack();
      } else {
        this.preRouteAction = routeAction;
        onRoute(routeAction);
      }
    }
  }

  componentDidMount() {
    this.checkRouteAction();
  }

  componentDidUpdate() {
    this.checkRouteAction();
    if (!this.containerRef.current) return;
    this.containerRef.current.style.display = this.shouldHideList ? 'none' : 'block';
  }

  // 渲染视图
  render() {
    const { className, style } = this.props;
    return (
      <div className={`abstract-actions ${className || ''}`} style={style}>
        <Context.Provider value={this.actionContext}>
          {this.props.children}
        </Context.Provider>
      </div>
    );
  }
}
