/**
 * @module Action
 * @description 操作动作
 */

import React, { useContext, useEffect, useMemo, useRef } from 'react';
import Context, { ActionsContext } from './context';
import AbstractObject, { AbstractObjectInstance, BaseObjectProps } from '../abstract-object';
import AbstractForm from '../abstract-form';
import { Drawer } from 'antd';
import { DrawerProps } from 'antd/lib/drawer';
import { AbstractRow, SubmitAction } from '../interface';
import FormActions, { FormActionsInstance } from '../abstract-object/FormActions';

interface ActionProps {
  action?: string
  subAction?: string
  use?: React.ComponentType<any>
  children?: React.ReactElement | React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export interface ListActionProps {
  className?: string
  children?: React.ReactElement | React.ReactNode
  style?: React.CSSProperties
}

export interface ObjectActionProps<TRow> extends ActionProps, BaseObjectProps<TRow> {
  oClassName?: string
  onSubmit?: (data: SubmitAction<TRow>) => void
}

export interface DrawerActionProps<TRow> extends ObjectActionProps<TRow> {
  drawer?: DrawerProps
  // 实时存储模式，即不管是确定还是取消都是进行提交操作
  realtime?: boolean
  placement?: 'top' | 'right' | 'bottom' | 'left'
}

const getMatchContext = (context: ActionsContext, props: ActionProps) => {
  const { onSubCancel, onSubSubmit, onSubmit, onCancel, action, subAction, ...others } = context;
  if (props.action && action === props.action) {
    context.onMatch(action);
    return {
      ...others,
      action: action,
      loading: context.confirmLoading,
      onSubmit: onSubmit,
      onCancel: onCancel,
      isSubAction: false,
      intoViewOptions: context.intoViewOptions,
      headContainer: { current: context.getActionsContainer?.() },
    };
  } else if (props.subAction && subAction == props.subAction) {
    return {
      ...others,
      action: subAction,
      loading: context.subConfirmLoading,
      onSubmit: onSubSubmit,
      onCancel: onSubCancel,
      isSubAction: true,
      intoViewOptions: context.intoViewOptions,
      headContainer: { current: context.getActionsContainer?.() },
    };
  }
};

export function ActionIfHook(props: ActionProps) {
  const { use, children, className, style } = props;
  const ActionInternal = use;
  const context = useContext(Context);
  const finalContext = getMatchContext(context, props);
  if (!finalContext) return null;
  return (
    <div className={`abstract-actions-if ${finalContext.action} ${className || ''}`} style={style}>
      {ActionInternal ? <ActionInternal {...props} {...(finalContext || {})} /> : children}
    </div>
  );
}

export function ObjectIfHook<TRow = AbstractRow>(props: ObjectActionProps<TRow>) {
  const { use, children, oClassName, className, style } = props;
  const ActionInternal = use;
  const context = useContext(Context);
  const finalContext = getMatchContext(context, props);
  if (!finalContext) return null;
  if (props.type != 'modal') {
    context.shouldHiddenList(true, finalContext.isSubAction);
  }
  const markCls = finalContext.isSubAction ? 'sub-action' : 'action-current';
  return (
    <div className={`${oClassName || 'abstract-actions-object'} ${className || ''} ${finalContext.action} ${markCls}`} style={style}>
      <AbstractObject
        type={props.type}
        {...finalContext}
        {...props}
        record={finalContext.isSubAction ? finalContext.subRecord : finalContext.record}
        action={finalContext.action}
      >
        <AbstractForm.Context.Consumer>
          {
            (formContext) => ActionInternal ? <ActionInternal {...props} {...finalContext} {...formContext} record={finalContext.record} /> : children
          }
        </AbstractForm.Context.Consumer>
      </AbstractObject>
    </div>
  );
}

export function PopupIfHook<TRow = AbstractRow>(props: ObjectActionProps<TRow>) {
  return (
    <ObjectIfHook
      {...props}
      type="modal"
      oClassName="abstract-actions-popup"
    />
  );
}

export function DrawerIfHook<TRow = AbstractRow>(props: DrawerActionProps<TRow>) {
  const { use, children, drawer, placement, width, className, style, ...others } = props;
  const ActionInternal = use;
  const objectRef = useRef<AbstractObjectInstance>();
  const actionsRef = useRef<FormActionsInstance<TRow>>();
  const memo = useMemo(() => {
    return { data: { isFullOpened: false } };
  }, []);
  const c = useContext(Context);
  const realtime = props.realtime == true;
  const context = getMatchContext(c, props);
  const visible = !!context;
  const finalWidth = width || 800;
  const showOk = props.showActions == 'ok-cancel' || props.showActions == 'ok' || !props.showActions;
  const showCancel = props.showActions === 'cancel' || props.showActions === 'ok-cancel' || !props.showActions;
  const handleSubmit = () => objectRef.current.handleSubmit();
  const validateForms = () => objectRef.current?.validateForms();
  const footerVisible = false !== props.footer && visible && !realtime;

  const myStyle = useMemo(() => {
    return {
      maxWidth: '100%',
    };
  }, []);

  const onSubmit = async(values: any) => {
    if (props.realtime) {
      memo.data.isFullOpened = false;
    }
    const { onSubmit } = context;
    onSubmit && onSubmit(values);
  };

  const onCancel = () => {
    if (!memo.data.isFullOpened) {
      return;
    }
    if (props.realtime) {
      return objectRef.current?.handleSubmit();
    }
    memo.data.isFullOpened = false;
    objectRef.current?.handleCancel();
  };

  const onValuesChange = (changedValues: TRow, allValues: TRow) => {
    const onValuesChange = props.onValuesChange || context.onValuesChange;
    onValuesChange && onValuesChange(changedValues, allValues, allValues);
    if (actionsRef.current) {
      actionsRef.current.refresh({ ...allValues, ...changedValues });
    }
  };

  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        memo.data.isFullOpened = true;
      }, 800);
    }
  }, [visible]);

  return (
    <Drawer
      maskClosable={false}
      footer={
        <div className="abstract-actions-drawer-footer">
          {
            footerVisible && (
              <FormActions
                ref={actionsRef}
                validateForms={validateForms}
                btnCancel={props.btnCancel}
                btnSubmit={props.btnSubmit}
                record={c.record}
                renderActions={props.renderActions}
                showCancel={showCancel}
                showOk={showOk}
                className={props.className ? `${props.className}-footer` : ''}
                okEnable={props.okEnable}
                isReadOnly={context.action === 'view' || props.isReadOnly}
                handleCancel={onCancel}
                handleSubmit={handleSubmit}
                okLoading={context.loading}
                actions={props.footActions}
              >
              </FormActions>
            )
          }
        </div>
      }
      placement={placement || 'right'}
      {...(drawer || {})}
      {...(realtime ? { mask: true, maskClosable: true } : {})}
      rootStyle={style}
      styles={{
        wrapper: myStyle,
      }}
      width={finalWidth}
      rootClassName={`${className} abstract-object-view abstract-actions-drawer ${realtime ? 'realtime' : ''}`}
      title={props.title || ''}
      open={visible}
      onClose={onCancel}
    >
      {
        visible && (
          <AbstractObject
            type={props.type}
            {...context}
            {...others}
            record={context.isSubAction ? context.subRecord : context.record}
            width={finalWidth}
            onValuesChange={onValuesChange}
            onSubmit={onSubmit}
            ref={objectRef}
            footer={false}
            action={context.action}
          >
            <AbstractForm.Context.Consumer>
              {
                (formContext) => ActionInternal ? <ActionInternal {...props} {...context} {...formContext} record={context.record} /> : children
              }
            </AbstractForm.Context.Consumer>
          </AbstractObject>
        )
      }
    </Drawer>
  );
}

export function ListHook(props: ListActionProps) {
  const { className, style } = props;
  const c = useContext(Context);
  c.action = c.action == '' ? 'list' : c.action;
  const context = getMatchContext(c, { action: 'list', ...props });
  if (context) {
    context.shouldHiddenList(false, false);
  }
  return (
    <div ref={c.listRef} className={`abstract-actions-list ${className || ''}`} style={style}>
      {props.children}
    </div>
  );
}
