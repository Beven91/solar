/**
 * @module Action
 * @description 操作动作
 */

import React, { useRef } from 'react';
import Context, { ActionsContext } from './context';
import AbstractObject, { BaseObjectProps } from '../abstract-object';
import AbstractForm from '../abstract-form';
import { Drawer } from 'antd';
import { DrawerProps } from 'antd/lib/drawer';
import { AbstractRow, SubmitAction } from '../interface';
import FooterActions from '../abstract-object/footer';

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
  placement?: 'top' | 'right' | 'bottom' | 'left'
}

const getMatchContext = (context: ActionsContext, props: ActionProps) => {
  const { onSubCancel, onSubSubmit, onSubmit, onCancel, action, subAction, ...others } = context;
  if (props.action && action === props.action) {
    return {
      ...others,
      action: action,
      loading: context.confirmLoading,
      onSubmit: onSubmit,
      onCancel: onCancel,
    };
  } else if (props.subAction && subAction == props.subAction) {
    return {
      ...others,
      action: subAction,
      loading: context.subConfirmLoading,
      onSubmit: onSubSubmit,
      onCancel: onSubCancel,
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
              {ActionInternal ? <ActionInternal {...(useContext || {})} /> : children}
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
          if (props.type !='modal') {
            context.shouldHiddenList(true);
          }
          return (
            <div className={`${oClassName || 'abstract-actions-object'} ${className} ${useContext.action}`} style={style}>
              <AbstractObject
                type={props.type}
                {...useContext}
                {...props}
                action={useContext.action}
              >
                <AbstractForm.Context.Consumer>
                  {
                    (formContext) => ActionInternal ? <ActionInternal {...useContext} {...formContext} /> : children
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
  const actionsRef = useRef<FooterActions<TRow>>();
  const handleSubmit = () => objectRef.current.handleSubmit();
  const handleCancel = () => objectRef.current.handleCancel();

  return (
    <Context.Consumer>
      {
        (c) => {
          const useContext = getMatchContext(c, props);
          const onSubmit = async(values: any) => {
            const { onSubmit } = useContext;
            onSubmit && onSubmit(values);
          };
          const onValuesChange = (changedValues:TRow, allValues:TRow)=>{
            const onValuesChange = props.onValuesChange;
            onValuesChange && onValuesChange(changedValues, allValues);
            if (actionsRef.current) {
              actionsRef.current.refresh({ ...allValues, ...changedValues });
            }
          };
          const visible = !!useContext;
          const showOk = props.showActions == 'ok-cancel' || props.showActions == 'ok' || !props.showActions;
          const showCancel = props.showActions === 'cancel' || props.showActions === 'ok-cancel' || !props.showActions;
          return (
            <Drawer
              maskClosable={false}
              footer={
                <div className="abstract-actions-drawer-footer">
                  {
                    (false !== props.footer && visible) && (
                      <FooterActions
                        ref={actionsRef}
                        cancelText={props.cancelText}
                        okText={props.okText}
                        formValues={c.record}
                        showCancel={showCancel}
                        showOk={showOk}
                        okEnable={props.okEnable}
                        isReadOnly={ props.action === 'view' || props.isReadOnly}
                        handleCancel={handleCancel}
                        handleSubmit={handleSubmit}
                        okLoading={useContext.loading}
                        actions={props.footActions}
                      />
                    )
                  }
                </div>
              }
              {...(drawer || {})}
              width={width || 800}
              style={style}
              className={`${className} abstract-actions-drawer`}
              title={props.title || ''}
              placement={placement || 'right'}
              visible={visible}
              onClose={useContext?.onCancel}
            >
              {
                visible && (
                  <AbstractObject
                    type={props.type}
                    {...useContext}
                    {...others}
                    onValuesChange={onValuesChange}
                    onSubmit={onSubmit}
                    ref={objectRef}
                    footer={false}
                    action={useContext.action}
                  >
                    <AbstractForm.Context.Consumer>
                      {
                        (formContext) => ActionInternal ? <ActionInternal {...useContext} {...formContext} /> : children
                      }
                    </AbstractForm.Context.Consumer>
                  </AbstractObject>
                )
              }
            </Drawer>
          );
        }
      }
    </Context.Consumer>
  );
}

export function ListHook(props: ListActionProps) {
  const { className, style } = props;
  return (
    <Context.Consumer>
      {
        (context) =>{
          context.action = context.action == '' ? 'list' : context.action;
          const useContext = getMatchContext(context, { action: 'list', ...props });
          if (useContext) {
            context.shouldHiddenList(false);
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
