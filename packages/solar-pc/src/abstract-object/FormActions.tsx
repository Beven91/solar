/* eslint-disable react/prop-types */
/**
 * @module FormActions
 * @description 底部操作按钮
 */
import React, { useEffect, useImperativeHandle, useState } from 'react';
import ReactDOM from 'react-dom';
import { Button, ButtonProps } from 'antd';
import { MenuFoldOutlined, SaveFilled } from '@ant-design/icons';
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
}

export interface FormActionsInstance<TRow> {
  refresh: (model: TRow) => void
}

const useValue = (value: string, dv: string) => {
  return value === null || value == undefined ? dv : value;
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
    return (
      <div className={`object-view-footer ${props.className || ''}`}>
        <div style={{ display: 'inline-block' }}>
          {
            showCancel && (
              <Button
                className="btn-back"
                size="large"
                disabled={okLoading}
                onClick={handleCancel}
                icon={btnCancel?.icon || <MenuFoldOutlined />}
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
              size="large"
              icon={btnSubmit?.icon || <SaveFilled />}
              {...(btnSubmit || {})}
            >
              {useValue(btnSubmit?.title, '确定')}
            </Button>
          )}
          {
            actions?.map((render, i) => {
              const node = render(formValues || {} as TRow, ctx);
              return (
                <span style={{ display: node ? 'inline' : 'none' }} className="footer-action-wrap" key={i}>{node}</span>
              );
            })
          }
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
