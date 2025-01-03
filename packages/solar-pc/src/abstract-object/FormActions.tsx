/* eslint-disable react/prop-types */
/**
 * @module FormActions
 * @description 底部操作按钮
 */
import React, { useEffect, useImperativeHandle, useState } from 'react';
import ReactDOM from 'react-dom';
import { Button, ButtonProps } from 'antd';
import { AbstractActionItem, AbstractActionItemContext } from '../interface';

export interface FormActionsProps<TRow> {
  okLoading: boolean
  isReadOnly: boolean
  showCancel: boolean
  showOk: boolean
  btnSubmit?: ButtonProps
  btnCancel?: ButtonProps
  handleCancel: () => void
  handleSubmit: () => void
  validateForms: () => Promise<void>
  record: TRow
  okEnable?: (values: TRow) => boolean
  actions: AbstractActionItem<TRow>[]
  className?: string
  // 按钮渲染目标容器
  container?: React.RefObject<HTMLElement>
  children?: React.ReactNode
  renderActions?: (children: React.ReactNode) => React.ReactNode
}

export interface FormActionsInstance<TRow> {
  refresh: (model: TRow) => void
}

const useValue = (value: string, dv: string) => {
  return value === null || value == undefined ? dv : value;
};

const ActionWrap = (props: React.PropsWithChildren) => {
  return (
    <>
      {props.children}
    </>
  );
};

export default React.forwardRef(function FormActions<TRow>(props: FormActionsProps<TRow>, ref: React.RefObject<FormActionsInstance<TRow>>) {
  const [updateId, setUpdateId] = useState(0);
  const { container, record } = props;
  const [formValues, setFormValues] = useState(record);

  useEffect(() => {
    setFormValues(record || {} as TRow);
  }, [props.record]);

  useEffect(() => {
    const id = setTimeout(() => {
      setUpdateId(updateId + 1);
    }, 100);
    return () => clearTimeout(id);
  }, []);

  useImperativeHandle(ref, () => {
    return {
      refresh: (values: TRow) => {
        setFormValues(values);
      },
    };
  });

  const renderNode = () => {
    const { okLoading, isReadOnly, handleSubmit, validateForms, handleCancel, showCancel, okEnable, showOk } = props;
    const { btnSubmit, btnCancel, actions } = props;
    const showOkBtn = !(isReadOnly || !showOk);
    const ctx: AbstractActionItemContext = {
      submit: handleSubmit,
      cancel: handleCancel,
      bindValidate: (handler: Function) => {
        return async() => {
          await validateForms();
          handler && handler();
        };
      },
    };
    const isOkEnable = () => okEnable ? okEnable(formValues) : true;
    const actionsNode = (
      <>
        {
          showCancel && (
            <Button
              className="btn-back"
              disabled={okLoading}
              onClick={handleCancel}
              icon={btnCancel?.icon}
              size="large"
              {...(btnCancel || {})}
            >
              {useValue(btnCancel?.title, '返回')}
            </Button>
          )
        }
        {showOkBtn && (
          <Button
            loading={okLoading}
            className="btn-submit"
            type="primary"
            disabled={!isOkEnable()}
            onClick={handleSubmit}
            icon={btnSubmit?.icon}
            size="large"
            {...(btnSubmit || {})}
          >
            {useValue(btnSubmit?.title, '确定')}
          </Button>
        )}
        {
          actions?.map((render, i) => {
            const node = render(formValues || {} as TRow, ctx);
            return (<ActionWrap key={i}>{node}</ActionWrap>);
          })
        }
      </>
    );
    return (
      <div className={`action-view-container ${props.className || ''}`}>
        <div className="form-actions-wrapper">
          <div className="form-actions">
            {props.renderActions ? props.renderActions(actionsNode) : actionsNode}
            {props.children}
          </div>
        </div>
      </div>
    );
  };

  if (!container) {
    return renderNode();
  } else if (container.current) {
    return ReactDOM.createPortal(renderNode(), container.current);
  }
});
