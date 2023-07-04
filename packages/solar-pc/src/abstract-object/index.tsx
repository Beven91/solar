/* eslint-disable react/prop-types */
/**
 * @name AbstractObject 后台系统对象编辑视图
 * @description
 *       提供一致的后台系统对象编辑与修改以及查看行为视图
 */
import './index.scss';
import React, { useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Modal, Form, ButtonProps, ModalFuncProps } from 'antd';
import AbstractForm from '../abstract-form';
import { AbstractActionItem, AbstractRow } from '../interface';
import { FormInstance } from 'antd/lib/form';
import { Travel } from 'solar-core';
import FormActions, { FormActionsInstance } from './FormActions';
import CrashProvider from '../crash-provider';
import { mergeFormValues } from '../abstract-form/deepmerge';
import { AbstractObjectContext } from './context';

let formIdIndex = 0;

const objectFilter = (values: any) => {
  return Travel.travel(values, (v: any) => {
    if (typeof v === 'string') {
      return v.trim();
    }
    return v;
  });
};

export const Context = AbstractObjectContext;

export interface BaseObjectProps<TRow> {
  // 编辑页类型
  type?: 'modal' | 'normal';
  // 弹窗标题
  title?: string;
  // 取消操作
  onCancel?: () => boolean | void;
  // 弹窗宽度
  width?: number;
  // 内容高度
  height?: string | number
  // 是否显示底部操作按钮
  footer?: boolean;
  // 确定按钮属性配置
  btnSubmit?: ButtonProps
  // 取消按钮配置
  btnCancel?: ButtonProps
  // 是否滚动到第一个错误的位置
  scrollToFirstError?: boolean;
  // 主键字段
  primaryKey?: string;
  // 样式名
  className?: string;
  // 自定义底部actions
  footActions?: AbstractActionItem<TRow>[];
  // 自定义顶部actions
  headActions?: AbstractActionItem<TRow>[];
  // 自定义headActions渲染父元素
  headContainer?: React.RefObject<HTMLElement>
  // 是否为只读模式
  isReadOnly?: boolean;
  // 是否提交按钮显示loading
  loading?: boolean
  // 点击确认按钮确认文案
  okConfirm?: ModalFuncProps
  // 点击取消按钮确认文案
  cancelConfirm?: ModalFuncProps
  // 一个函数用于判定【确定】按钮是否可用
  okEnable?: (values: TRow) => boolean
  // 按钮显示情况
  showActions?: 'ok' | 'ok-cancel' | 'cancel' | 'none'
  // 当有值发生改变时
  onValuesChange?: (values: TRow, prevValues: TRow, mergedAllValues:TRow) => void
}

export interface AbstractObjectProps<TRow> extends BaseObjectProps<TRow> {
  /**
   * 当前对象所属动作
   * 例如: add,update,view等任意字符串
   * 注意: 当action为view时等同于设置了isReadOnly
   */
  action: string;
  // 当前编辑的数据
  record: TRow;
  // 提交操作
  onSubmit?: (record: TRow) => void;
}

export interface AbstractObjectInstance {
  handleSubmit: () => void,
  handleCancel: () => void,
  validateForms: () => Promise<void>,
}

export default React.forwardRef(function AbstractObject<TRow = AbstractRow>({
  type = 'normal',
  primaryKey = 'id',
  scrollToFirstError = true,
  showActions,
  record,
  action,
  footer = true,
  ...props
}: React.PropsWithChildren<AbstractObjectProps<TRow>>,
ref: React.MutableRefObject<AbstractObjectInstance>
) {
  const [memo] = useState({ pendingReadOnly: null, isFirst: true, cancelId: null, cancelSubmiting: false, isDestoryed: false });
  const [formId] = useState(`abstract-form-${formIdIndex++}`);
  const visible = useMemo(() => action !== 'none' && !!action, [action]);
  const formRef = useRef<FormInstance>();
  const footerRef = useRef<FormActionsInstance<TRow>>();
  const headerRef = useRef<FormActionsInstance<TRow>>();
  const scopedValues = { ...(record || {}) };

  useEffect(() => {
    if (!memo.isFirst) {
      formRef.current?.resetFields();
      memo.isFirst = false;
    }
    formRef.current?.setFieldsValue(record);
    return () => {
      memo.isDestoryed = true;
      resetFields();
      clearTimeout(memo.cancelId);
    };
  }, [action, record]);

  // 是否在只读模式下
  const isReadOnly = useMemo(() => {
    if (memo.pendingReadOnly !== null) {
      // 如果正在关闭中，这里需要临时使用关闭前的状态
      return memo.pendingReadOnly;
    }
    return action === 'view' || !!props.isReadOnly;
  }, [action, props.isReadOnly]);

  // 是否显示确定按钮
  const showOk = useMemo(() => {
    return showActions == 'ok-cancel' || showActions == 'ok' || !showActions;
  }, [showActions]);

  // 是否显示取消按钮
  const showCancel = useMemo(() => {
    return showActions === 'cancel' || showActions === 'ok-cancel' || !showActions;
  }, [showActions]);

  const resetFields = () => {
    formRef.current?.resetFields?.();
    const values = formRef.current?.getFieldsValue?.() || {} as TRow;
    if (footerRef.current) {
      footerRef.current.refresh(values);
    }
    if (headerRef.current) {
      headerRef.current.refresh(values);
    }
  };

  // 处理冒泡命令
  const handleCommands = (ev: any) => {
    const target = ev.target as HTMLDivElement;
    const { dataset = {} } = target;
    switch (dataset.command) {
      case 'submit':
        handleSubmit();
        break;
      case 'cancel':
        handleCancel();
        break;
      default:
        break;
    }
  };

  const validateForms = async() => {
    const form = formRef.current;
    await form.validateFields();
  };

  // 处理提交操作
  const handleSubmit = async() => {
    if (isReadOnly) {
      return handleCancel();
    }
    const form = formRef.current;
    return form.submit();
  };

  // 表单校验成功
  const onFinish = async(values: AbstractRow) => {
    if (props.okConfirm) {
      await new Promise<void>((resolve) => {
        const instance = Modal.confirm({
          ...props.okConfirm, onOk: () => {
            resolve();
            instance.destroy();
          },
        });
      });
    }
    const { onSubmit } = props;
    if (typeof onSubmit === 'function') {
      if (record) {
        const primaryValue = (record as any)[primaryKey];
        if (primaryValue) {
          values[primaryKey] = primaryValue;
        }
      }
      values = objectFilter(values);
      try {
        await Promise.resolve(onSubmit(values as TRow));
      } catch (ex) {
        console.error(ex);
      }
    }
  };

  const onFinishFailed = (res: any) => {
    const form = formRef.current;
    doFinishFailed(form, res.errorFields);
  };

  const doFinishFailed = (form: FormInstance, errorFields: any) => {
    if (errorFields.length > 0 && scrollToFirstError) {
      setTimeout(() => form.scrollToField(errorFields[0].name), 200);
    }
  };

  // 处理取消操作
  const handleCancel = async() => {
    if (props.cancelConfirm) {
      await new Promise<void>((resolve) => {
        const instance = Modal.confirm({
          ...props.cancelConfirm, onOk: () => {
            resolve();
            instance.destroy();
          },
        });
      });
    }
    const { onCancel } = props;
    let cancelable = true;
    if (typeof onCancel === 'function') {
      cancelable = onCancel() !== false;
    }
    memo.pendingReadOnly = isReadOnly;
    Promise.resolve(cancelable).then((cancel) => {
      if (cancel && !memo.isDestoryed) {
        // 切换模式下，清除表单输入数据
        resetFields();
        memo.cancelId = setTimeout(() => {
          memo.pendingReadOnly = null;
        }, 400);
      }
    });
  };

  const onValuesChange = (changedValues: TRow, allValues: TRow) => {
    const { onValuesChange } = props;
    // const useValues = deepmerge(scopedValues, allValues);
    const model = mergeFormValues(scopedValues, formRef.current) as TRow;
    if (footerRef.current) {
      footerRef.current.refresh(model);
    }
    if (headerRef.current) {
      headerRef.current.refresh(model);
    }
    onValuesChange && onValuesChange(changedValues, allValues, model);
  };

  // 设置共享context数据
  const formContext = {
    isReadOnly: isReadOnly,
    form: formRef,
    width: props.width,
    // 提交
    submitAction: handleSubmit,
    // 取消
    handleCancel: handleCancel,
    // 校验表单
    validateForms: validateForms,
    record: record || {},
    model: record || {},
  };

  useImperativeHandle(ref, () => {
    return {
      handleSubmit: handleSubmit,
      handleCancel: handleCancel,
      validateForms: validateForms,
    };
  });

  // 非弹窗模式
  const renderObject = () => {
    const { height, className } = props;
    if (!visible) {
      return null;
    }
    const fixedCls = height ? 'fixed-footer' : '';
    return (
      <AbstractObjectContext.Provider value={formContext}>
        <div className={`abstract-object-wrap  abstract-object-view ${fixedCls} ${action}`}>
          <div
            onClick={handleCommands}
            style={{ height: height }}
            className={`abstract-object ${className}`}
          >
            {renderHeader()}
            <div className="object-view-body">
              {renderContext()}
            </div>
            {footer ? renderFooter() : null}
          </div>
        </div>
      </AbstractObjectContext.Provider>
    );
  };

  // 渲染底部
  const renderFooter = () => {
    const { btnSubmit, btnCancel, footActions } = props;
    if (!visible || !footer) return null;
    return (
      <FormActions
        ref={footerRef}
        btnCancel={btnCancel}
        btnSubmit={btnSubmit}
        showCancel={showCancel}
        showOk={showOk}
        record={record}
        className={props.className ? `${props.className}-footer` : ''}
        handleCancel={handleCancel}
        handleSubmit={handleSubmit}
        validateForms={validateForms}
        okEnable={props.okEnable}
        isReadOnly={isReadOnly}
        okLoading={props.loading}
        actions={footActions}
      />
    );
  };

  const renderHeader = () => {
    const { btnSubmit, btnCancel, headActions, headContainer } = props;
    if (!visible || !headActions || headActions.length < 1) return null;
    return (
      <FormActions
        ref={headerRef}
        btnCancel={btnCancel}
        btnSubmit={btnSubmit}
        container={headContainer}
        showCancel={false}
        showOk={false}
        record={record}
        className={props.className ? `${props.className}-header` : ''}
        handleCancel={handleCancel}
        handleSubmit={handleSubmit}
        validateForms={validateForms}
        okEnable={props.okEnable}
        isReadOnly={isReadOnly}
        okLoading={props.loading}
        actions={headActions}
      />
    );
  };

  // 弹窗模式
  const renderPopupObject = () => {
    const { title, width, height, loading, className } = props;
    const fixedCls = height ? 'fixed-footer' : '';
    const sizeCls = width > 0 ? '' : 'large';
    return (
      <AbstractObjectContext.Provider value={formContext}>
        <Modal
          wrapClassName={`abstract-object-modal-wrap abstract-object-view ${fixedCls} ${className} ${sizeCls}`}
          className={`abstract-object ${action}`}
          title={title}
          open={visible}
          visible={visible}
          width={width}
          maskClosable={isReadOnly}
          confirmLoading={loading}
          onOk={handleSubmit}
          onCancel={handleCancel}
          destroyOnClose
          footer={renderFooter()}
        >
          {renderHeader()}
          <div style={{ height: height }} className="object-view-body" onClick={handleCommands}>
            {renderContext()}
          </div>
        </Modal>
      </AbstractObjectContext.Provider>
    );
  };

  // 渲染表单内容
  const renderContext = () => {
    return (
      <CrashProvider errorProps={{ hideActions: true }} >
        <Form
          key={action}
          name={formId}
          ref={formRef}
          onValuesChange={onValuesChange}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          initialValues={record || {}}
        >
          <AbstractForm.Context.Provider value={formContext}>
            {props.children}
          </AbstractForm.Context.Provider>
        </Form>
      </CrashProvider>
    );
  };

  switch (type) {
    case 'modal':
      return renderPopupObject();
    default:
      return renderObject();
  }
});