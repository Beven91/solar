/**
 * @module AbstractActions
 * @description 后台操作动作
 */
import './index.scss';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Context, { ActionsContext } from './context';
import { AbstractRow, InitialAction, SubmitAction } from '../interface';
import { OnActionRoute } from '../abstract-table/types';
import cellRenders from '../abstract-table/util/cellRenders';
import TableContext, { AbstractTableContextValue } from '../abstract-table/context';
import { ActionIfHook, ObjectIfHook, PopupIfHook, ListHook, DrawerIfHook } from './action';

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
  // 当前子动作对应的数据
  subModel?: any
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
  // 定义:列表操作按钮与表单操作按钮渲染容器位置
  getActionsContainer?: () => HTMLElement
  children?: React.ReactNode
  [x: string]: any
}

type Reason = 'none' | 'submited' | 'yes'

const normalizeUrl = (url: string) => {
  const query = location.search.slice(1);
  const hashQuery = location.hash.split('?').slice(1);
  const isHash = !!location.hash;
  const useQuery = isHash ? hashQuery : query;
  const joinChar = useQuery ? '?' : '';
  return url + joinChar + useQuery;
};

export default function AbstractActions<TRow extends AbstractRow>(props: AbstractActionsProps<TRow>) {
  const { onCancel, onSubCancel, subModel, subAction, action, className, style, onSubmit, model: record } = props;
  const listRef = useRef<HTMLDivElement>();
  const containerRef = useRef<HTMLDivElement>();
  const [memo] = useState({
    preRouteAction: null as InitialAction,
    reason: 'none' as Reason,
    reasonAction: '',
    shouldHideList: false,
    shouldHideObject: false,
    mounted: false,
  });

  useEffect(() => {
    const { route, onRoute } = props;
    if (route && onRoute && route.params?.action) {
      memo.reasonAction = route.params?.action;
      onRoute(route.params as InitialAction);
    }
  }, []);

  useEffect(() => {
    if (memo.mounted) {
      fallbackActions();
      if (containerRef.current) {
        const name = memo.shouldHideObject ? 'add' : 'remove';
        containerRef.current.classList[name]('sub-covered');
      }
      if (!listRef.current) return;
      listRef.current.style.display = memo.shouldHideList ? 'none' : 'block';
    }
    memo.mounted = true;
  });

  const getActionsContainer = useMemo(() => {
    return () => {
      const container = props.getActionsContainer?.();
      const wrapperClas = 'abstract-actions-hide-top-operators';
      if (container) {
        const isList = action == '' || action == 'list';
        const name = isList ? 'remove' : 'add';
        container.classList[name](wrapperClas);
      }
      return container;
    };
  }, [props.getActionsContainer, action]);

  const actionContext = {
    record,
    subRecord: subModel,
    ...props,
    onMatch: (action) => {
    },
    onCancel: () => {
      onCancel && onCancel();
      memo.reason = 'none';
      memo.reasonAction = action;
      navigateBack();
    },
    onSubmit: (values: TRow) => {
      memo.reason = 'submited';
      memo.reasonAction = action;
      onSubmit && onSubmit({ action, model: values });
    },
    onSubSubmit: (values: TRow) => {
      onSubmit && onSubmit({ action: subAction, model: values });
    },
    onSubCancel: () => {
      onSubCancel && onSubCancel();
    },
    onValuesChange: (changedValues: TRow, previous: TRow) => {
      const { onValuesChange } = props;
      if (onValuesChange) {
        onValuesChange(action, changedValues, previous);
      }
    },
    getActionsContainer: getActionsContainer,
    listRef: listRef,
    subConfirmLoading: props.subConfirmLoading,
    confirmLoading: props.confirmLoading,
    action: props.action,
    subAction,
    shouldHiddenList: (hidden: boolean, isSubAction) => {
      memo.shouldHideList = hidden;
      memo.shouldHideObject = isSubAction;
    },
  } as ActionsContext<TRow>;

  const tableContext = {
    onAction: (action) => {
      const { onRoute, route } = props;
      const data = cellRenders.createAction(action);
      const url = data.create(route.path || '', { ...(route.params || {}), ...action });
      runtime.isInitialize = false;
      props?.history?.push(normalizeUrl(url));
      memo.reasonAction = action?.action;
      onRoute && onRoute(action);
    },
    getActionsContainer: getActionsContainer,
  } as AbstractTableContextValue;

  const navigateBack = () => {
    const { onRouteBack, route } = props;
    const action = memo.reasonAction;
    const needBack = action == route?.params?.action;
    if (!needBack) return;
    if (onRouteBack) {
      onRouteBack(runtime.isInitialize);
      runtime.isInitialize = false;
    } else if (runtime.isInitialize) {
      runtime.isInitialize = false;
      const empty = { ...route?.params, action: '', id: '' };
      const data = cellRenders.createAction({ action: '', id: '' });
      const initUrl = data.create(route?.path || '', empty);
      props.history?.replace(normalizeUrl(initUrl));
    } else {
      props.history?.goBack();
    }
  };

  const fallbackActions = () => {
    const { subAction, onSubCancel, onRoute, route } = props;
    const routeAction = route?.params?.action || '';
    switch (memo.reason) {
      case 'submited':
        if (memo.reasonAction != props.action) {
          subAction && onSubCancel && onSubCancel();
          navigateBack();
          memo.reason = 'none';
        }
        break;
      default:
        if (memo.reasonAction != routeAction) {
          memo.reasonAction = routeAction;
          onRoute && onRoute({ ...route.params, action: memo.reasonAction || '' } as any);
          memo.reason = 'none';
        }
    }
  };

  // 渲染视图
  return (
    <div ref={containerRef} className={`abstract-actions ${className || ''}`} style={style}>
      <Context.Provider value={actionContext}>
        <TableContext.Provider
          value={tableContext}
        >
          {props.children}
        </TableContext.Provider>
      </Context.Provider>
    </div>
  );
}

// 动作
AbstractActions.If = ActionIfHook;

// 带表单的动作
AbstractActions.Object = ObjectIfHook;

// 弹窗类型
AbstractActions.Popup = PopupIfHook;

// 列表动作
AbstractActions.List = ListHook;

// Drawer表单
AbstractActions.Drawer = DrawerIfHook;