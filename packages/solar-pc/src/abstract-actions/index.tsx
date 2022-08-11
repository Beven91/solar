/**
 * @module AbstractActions
 * @description 后台操作动作
 */
import './index.scss';
import React from 'react';
import Context, { ActionsContext } from './context';
import TableContext, { AbstractTableContext } from '../abstract-table/context';
import { ActionIfHook, ObjectIfHook, PopupIfHook, ListHook, DrawerIfHook } from './action';
import { AbstractRow, InitialAction, SubmitAction } from '../interface';
import { OnActionRoute } from '../abstract-table/types';
import cellRenders from '../abstract-table/util/cellRenders';

const runtime = {
  isInitialize: true,
};

const updateRoute = () => runtime.isInitialize = false;

window.addEventListener('hashchange', updateRoute);
window.addEventListener('popstate', updateRoute);

export interface ActionRoute {
   // 当前页面动作路由模板 例如: order/:action/:id
   path: string
   // 当前路由对应的参数
   params: Partial<InitialAction>
 }

export interface ActionHistory {
   replace(url: string): void
   push(url: string): void
   goBack: () => void
 }

export interface AbstractActionsProps<TRow> {
   // 当前动作
   action: string
   // 当前自动做
   subAction?: string
   // 样式类名
   className?: string
   // 样式
   style?: React.CSSProperties
   // 当前动作对应的数据
   model?: TRow
   // 当前动作对应的数据的主键
   primaryKey?: string
   // 提交按钮是否展示loading
   confirmLoading?: boolean
   // 子动作是否提交中
   subConfirmLoading?: boolean
   // 路由历史对象可用来进行动作切换后进行地址替换
   history?: ActionHistory
   // 使用路由模式时的路由参数，需配合history一起使用
   route?: ActionRoute
   // 当动作切换时触发
   onRoute?: OnActionRoute<TRow>
   // 当取消动作切需要进行路由后退时触发,
   onRouteBack?: (init?: boolean) => void
   // 当取消动作时出发
   onCancel?: () => boolean | void
   // 当取消子动作时出发
   onSubCancel?: () => void
   // 当提交动作以及子动作时出发
   onSubmit?: (data: SubmitAction<TRow>) => void
   // 当有值发生改变时触发,优先级低于具体Action的同名属性
   onValuesChange?: (action: string, values: TRow, prevValues: TRow) => void
   children?: React.ReactNode
   [x: string]: any
 }

export interface AbstractActionsState {

 }

export default class AbstractActions<TRow extends AbstractRow> extends React.Component<AbstractActionsProps<TRow>, AbstractActionsState> {
  // 动作
  static If = ActionIfHook;

  // 带表单的动作
  static Object = ObjectIfHook;

  // 弹窗类型
  static Popup = PopupIfHook;

  // 列表动作
  static List = ListHook;

  // Drawer表单
  static Drawer = DrawerIfHook;

  preRouteAction: InitialAction;

  isNeedBack: boolean;

  containerRef = React.createRef<HTMLDivElement>();

  shouldHideList = false;

  get actionContext() {
    const { onCancel, onSubCancel, subAction, action, onSubmit, model: record, ...props } = this.props;
    return {
      record,
      onCancel: () => {
        onCancel && onCancel();
        if (this.isNeedBack) {
          this.navigateBack();
        }
      },
      onSubmit: (values: TRow) => {
        onSubmit && onSubmit({ action, model: values });
      },
      onSubSubmit: (values: TRow) => {
        onSubmit && onSubmit({ action: subAction, model: values });
      },
      onSubCancel: () => {
        onSubCancel && onSubCancel();
      },
      ...props,
      onValuesChange: (changedValues: TRow, previous: TRow) => {
        const { onValuesChange } = this.props;
        if (onValuesChange) {
          onValuesChange(action, changedValues, previous);
        }
      },
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

  get tableContext() {
    return {
      onAction: (action) => {
        const { onRoute, route } = this.props;
        const data = cellRenders.createAction(action);
        const url = data.create(route.path || '', { ...(route.params || {}), ...action });
        this.isNeedBack = true;
        runtime.isInitialize = false;
        this.props?.history?.push(url);
        onRoute && onRoute(action);
      },
    } as AbstractTableContext;
  }

  navigateBack() {
    const { onRouteBack, route } = this.props;
    this.isNeedBack = false;
    if (onRouteBack) {
      onRouteBack(runtime.isInitialize);
      runtime.isInitialize = false;
    } else if (runtime.isInitialize) {
      runtime.isInitialize = false;
      const empty = { action: '', id: '' };
      const data = cellRenders.createAction({ action: '', id: '' });
      const initUrl = data.create(route?.path || '', empty);
      this.props.history?.replace(initUrl);
    } else {
      this.props.history?.goBack();
    }
  }

  componentDidMount() {
    const { route, onRoute } = this.props;
    if (route && onRoute) {
      this.isNeedBack = true;
      onRoute(route.params as InitialAction);
    }
  }

  fallbackSubmit() {
    const { subAction, onSubCancel, route, action } = this.props;
    if (this.isNeedBack && route?.params?.action != action) {
      subAction && onSubCancel && onSubCancel();
      this.navigateBack();
    }
  };

  componentDidUpdate() {
    this.fallbackSubmit();
    if (!this.containerRef.current) return;
    this.containerRef.current.style.display = this.shouldHideList ? 'none' : 'block';
  }

  // 渲染视图
  render() {
    const { className, style } = this.props;
    return (
      <div className={`abstract-actions ${className || ''}`} style={style}>
        <Context.Provider value={this.actionContext}>
          <TableContext.Provider
            value={this.tableContext}
          >
            {this.props.children}
          </TableContext.Provider>
        </Context.Provider>
      </div>
    );
  }
}
