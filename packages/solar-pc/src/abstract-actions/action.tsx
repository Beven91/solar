/**
 * @module Action
 * @description 操作动作
 */

import React, { useContext, useRef } from 'react';
import Context, { ActionsContext } from './context';
import AbstractObject, { BaseObjectProps } from '../abstract-object';
import AbstractForm from '../abstract-form';
import { Drawer } from 'antd';
import { DrawerProps } from 'antd/lib/drawer';
import { AbstractRow, SubmitAction } from '../interface';
import FormActions from '../abstract-object/FormActions';

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
    };
  } else if (props.subAction && subAction == props.subAction) {
    return {
      ...others,
      action: subAction,
      loading: context.subConfirmLoading,
      onSubmit: onSubSubmit,
      onCancel: onSubCancel,
      isSubAction: true,
    };
  }
};

export function ActionIfHook(props: ActionProps) {
  const { use, children, className, style } = props;
  const ActionInternal = use;
  return (
    <Context.Consumer>
      {
        (c) => {
          const useContext = getMatchContext(c, props);
          if (!useContext) return null;
          return (
            <div className={`abstract-actions-if ${useContext.action} ${className || ''}`} style={style}>
              {ActionInternal ? <ActionInternal {...props} {...(useContext || {})} /> : children}
            </div>
          );
        }
      }
    </Context.Consumer>
  );
}

export function ObjectIfHook<TRow = AbstractRow>(props: ObjectActionProps<TRow>) {
  const { use, children, oClassName, className, style } = props;
  const ActionInternal = use;
  return (
    <Context.Consumer>
      {
        (context) => {
          const useContext = getMatchContext(context, props);
          if (!useContext) return null;
          if (props.type != 'modal') {
            context.shouldHiddenList(true, useContext.isSubAction);
          }
          const markCls = useContext.isSubAction ? 'sub-action' : 'action-current';
          return (
            <div className={`${oClassName || 'abstract-actions-object'} ${className || ''} ${useContext.action} ${markCls}`} style={style}>
              <AbstractObject
                type={props.type}
                {...useContext}
                {...props}
                record={useContext.isSubAction ? useContext.subRecord : useContext.record}
                action={useContext.action}
              >
                <AbstractForm.Context.Consumer>
                  {
                    (formContext) => ActionInternal ? <ActionInternal {...props} {...useContext} {...formContext} record={useContext.record} /> : children
                  }
                </AbstractForm.Context.Consumer>
              </AbstractObject>
            </div>
          );
        }
      }
    </Context.Consumer>
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
  const objectRef = useRef<AbstractObject>();
  const actionsRef = useRef<FormActions<TRow>>();
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

  const onSubmit = async(values: any) => {
    const { onSubmit } = context;
    onSubmit && onSubmit(values);
  };

  const onCancel = () => {
    if (props.realtime) {
      return objectRef.current?.handleSubmit();
    }
    objectRef.current?.handleCancel();
  };

  const onValuesChange = (changedValues: TRow, allValues: TRow) => {
    const onValuesChange = props.onValuesChange || context.onValuesChange;
    onValuesChange && onValuesChange(changedValues, allValues);
    if (actionsRef.current) {
      actionsRef.current.refresh({ ...allValues, ...changedValues });
    }
  };

  return (
    <Drawer
      maskClosable={false}
      footer={
        <div className="abstract-actions-drawer-footer">
          {
            footerVisible && (
              <FormActions<any>
                ref={actionsRef}
                validateForms={validateForms}
                btnCancel={props.btnCancel}
                btnSubmit={props.btnSubmit}
                formValues={c.record}
                record={c.record}
                showCancel={showCancel}
                showOk={showOk}
                okEnable={props.okEnable}
                isReadOnly={props.action === 'view' || props.isReadOnly}
                handleCancel={onCancel}
                handleSubmit={handleSubmit}
                okLoading={context.loading}
                actions={props.footActions}
              />
            )
          }
        </div>
      }
      placement={placement || 'right'}
      {...(drawer || {})}
      {...(realtime ? { mask: true, maskClosable: true } : {})}
      style={style}
      width={finalWidth}
      className={`${className} abstract-object-view abstract-actions-drawer ${realtime ? 'realtime' : ''}`}
      title={props.title || ''}
      visible={visible}
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
  return (
    <Context.Consumer>
      {
        (context) => {
          context.action = context.action == '' ? 'list' : context.action;
          const useContext = getMatchContext(context, { action: 'list', ...props });
          if (useContext) {
            context.shouldHiddenList(false, false);
          }
          return (
            <div ref={context.listRef} className={`abstract-actions-list ${className || ''}`} style={style}>
              {props.children}
            </div>
          );
        }
      }
    </Context.Consumer>
  );
}
