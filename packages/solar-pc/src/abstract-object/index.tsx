/**
 * @name AbstractObject 后台系统对象编辑视图
 * @description
 *       提供一致的后台系统对象编辑与修改以及查看行为视图
 */
import './index.scss';
import React from 'react';
import { Modal, Form, ButtonProps } from 'antd';
import AbstractForm from '../abstract-form';
import { AbstractActionItem, AbstractRow } from '../interface';
import { FormInstance } from 'antd/lib/form';
import { Travel } from 'solar-core';
import FormActions from './FormActions';
import CrashProvider from '../crash-provider';

function NOOP(record: AbstractRow) { }

let formIdIndex = 0;

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
  // 一个函数用于判定【确定】按钮是否可用
  okEnable?: (values: TRow) => boolean
  // 按钮显示情况
  showActions?: 'ok' | 'ok-cancel' | 'cancel' | 'none'
  // 当有值发生改变时
  onValuesChange?: (values: TRow, prevValues: TRow) => void
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

export interface AbstractObjectState<TRow> {
  modalDestory?: boolean;
  visible?: boolean;
  prevMode?: string;
  values: TRow;
  needFillValues: boolean;
}

export default class AbstractObject<TRow = AbstractRow> extends React.Component<
  React.PropsWithChildren<AbstractObjectProps<TRow>>,
  AbstractObjectState<TRow>
> {
  static getDerivedStateFromProps(
    props: AbstractObjectProps<AbstractRow>,
    state: AbstractObjectState<AbstractRow>
  ) {
    if (props.action !== state.prevMode) {
      return {
        modalDestory: false,
        values: props.record,
        visible: props.action !== 'none' && !!props.action,
        prevMode: props.action,
      };
    } else if (props.record !== state.values) {
      return {
        needFillValues: true,
        values: props.record,
      } as AbstractObjectState<AbstractRow>;
    }
    return null;
  }

  // 默认属性值
  static defaultProps = {
    width: null as any,
    footer: true,
    record: null as any,
    title: '',
    type: 'normal',
    primaryKey: 'id',
    buttons: 'ok-cancel',
    fixedFooter: false,
    scrollToFirstError: true,
    onSubmit: NOOP,
    onCancel: NOOP,
  };

  formId = '';

  constructor(props: any) {
    super(props);
    this.formId = `abstract-form-${formIdIndex++}`;
  }

  footerRef = React.createRef<FormActions<TRow>>();

  headerRef = React.createRef<FormActions<TRow>>();

  childFormRefs = [] as React.RefObject<FormInstance>[];

  cancelId: any;

  cancelSubmiting: any;

  isDestoryed = false;

  state: AbstractObjectState<TRow> = {
    values: null as TRow,
    visible: false,
    modalDestory: false,
    needFillValues: false,
  };

  formRef = React.createRef<FormInstance>();

  pendingReadOnly = null as boolean;

  // 设置共享context数据
  get formContext() {
    return {
      isReadOnly: this.isReadOnly,
      form: this.formRef,
      width: this.props.width,
      // 提交
      submitAction: this.handleSubmit,
      // 取消
      handleCancel: this.handleCancel,
      record: this.props.record || {},
      model: this.props.record || {},
    };
  }

  // 是否在只读模式下
  get isReadOnly(): boolean {
    if (this.pendingReadOnly !== null) {
      // 如果正在关闭中，这里需要临时使用关闭前的状态
      return this.pendingReadOnly;
    }
    return this.props.action === 'view' || !!this.props.isReadOnly;
  }

  // 是否显示确定按钮
  get showOk() {
    return this.props.showActions == 'ok-cancel' || this.props.showActions == 'ok' || !this.props.showActions;
  }

  get showCancel() {
    return this.props.showActions === 'cancel' || this.props.showActions === 'ok-cancel' || !this.props.showActions;
  }

  // 处理冒泡命令
  handleCommands = (ev: any) => {
    const target = ev.target as HTMLDivElement;
    const { dataset = {} } = target;
    switch (dataset.command) {
      case 'submit':
        this.handleSubmit();
        break;
      case 'cancel':
        this.handleCancel();
        break;
      default:
        break;
    }
  };

  validateForms = async() => {
    const form = this.formRef.current;
    const childFormRefs = this.childFormRefs;
    await form.validateFields();
    if (childFormRefs.length > 1) {
      await Promise.all(
        childFormRefs.map((form) => {
          return form.current.validateFields().catch((result) => {
            this.doFinishFailed(form.current, result.errorFields);
            return Promise.reject(result);
          });
        })
      );
    }
  };

  // 处理提交操作
  handleSubmit = () => {
    if (this.isReadOnly) {
      return this.handleCancel();
    }
    const form = this.formRef.current;
    return form.submit();
  };

  // 表单校验成功
  onFinish = async(values: AbstractRow) => {
    const { onSubmit, record, primaryKey } = this.props;
    if (typeof onSubmit === 'function') {
      // record是null，默认值就不会生效
      if (record) {
        // 移除副作用 ____member
        delete (record as any).____member;
        const primaryValue = (record as any)[primaryKey];
        if (primaryValue) {
          values[primaryKey] = primaryValue;
        }
      }
      values = this.objectFilter(values);
      try {
        await Promise.resolve(onSubmit(values as TRow));
      } catch (ex) {
        console.error(ex);
      }
    }
  };

  objectFilter(values: any) {
    return Travel.travel(values, (v: any) => {
      if (typeof v === 'string') {
        return v.trim();
      }
      return v;
    });
  }

  onFinishFailed = (res: any) => {
    const form = this.formRef.current;
    this.doFinishFailed(form, res.errorFields);
  };

  doFinishFailed(form: FormInstance, errorFields: any) {
    const { scrollToFirstError } = this.props;
    if (errorFields.length > 0 && scrollToFirstError) {
      setTimeout(() => form.scrollToField(errorFields[0].name), 200);
    }
  }

  // 处理取消操作
  handleCancel = () => {
    const { onCancel } = this.props;
    let cancelable = true;
    if (typeof onCancel === 'function') {
      cancelable = onCancel() !== false;
    }
    this.pendingReadOnly = this.isReadOnly;
    Promise.resolve(cancelable).then((cancel) => {
      if (cancel && !this.isDestoryed) {
        // 切换模式下，清除表单输入数据
        this.resetFields();
        this.cancelId = setTimeout(() => {
          this.pendingReadOnly = null;
          this.setState({ modalDestory: true });
        }, 400);
      }
    });
  };

  resetFields() {
    if (this.formRef.current) {
      this.formRef.current.resetFields();
    }
  }

  onValuesChange = (changedValues: TRow, allValues: TRow) => {
    const { onValuesChange } = this.props;
    if (this.footerRef.current) {
      this.footerRef.current.refresh({ ...allValues, ...changedValues });
    }
    if (this.headerRef.current) {
      this.headerRef.current.refresh({ ...allValues, ...changedValues });
    }
    onValuesChange && onValuesChange(changedValues, allValues);
  };

  componentDidUpdate() {
    if (this.state.needFillValues && this.formRef.current) {
      this.setState({ needFillValues: false });
      this.formRef.current.resetFields();
      this.formRef.current.setFieldsValue(this.props.record);
    }
  }

  componentWillUnmount() {
    this.isDestoryed = true;
    this.resetFields();
    clearTimeout(this.cancelId);
    clearTimeout(this.cancelSubmiting);
  }

  // 非弹窗模式
  renderObject() {
    const { visible } = this.state;
    const { action: mode, height, footer, className } = this.props;
    if (!visible) {
      return null;
    }
    const fixedCls = height ? 'fixed-footer' : '';
    return (
      <div className={`abstract-object-wrap  abstract-object-view ${fixedCls} ${mode}`}>
        <div
          onClick={this.handleCommands}
          style={{ height: height }}
          className={`abstract-object ${className}`}
        >
          {this.renderHeader()}
          <div className="object-view-body">
            {this.renderContext()}
          </div>
          {footer ? this.renderFooter() : null}
        </div>
      </div>
    );
  }

  // 渲染底部
  renderFooter() {
    const { btnSubmit, btnCancel, footActions, footer } = this.props;
    if (!this.state.visible || !footer) return null;
    return (
      <FormActions
        ref={this.footerRef}
        btnCancel={btnCancel}
        btnSubmit={btnSubmit}
        formValues={this.props.record}
        showCancel={this.showCancel}
        showOk={this.showOk}
        record={this.props.record}
        okEnable={this.props.okEnable}
        isReadOnly={this.isReadOnly}
        handleCancel={this.handleCancel}
        handleSubmit={this.handleSubmit}
        validateForms={this.validateForms}
        okLoading={this.props.loading}
        actions={footActions}
      />
    );
  }

  renderHeader() {
    const { btnSubmit, btnCancel, headActions, headContainer } = this.props;
    if (!this.state.visible || !headActions || headActions.length < 1) return null;
    return (
      <FormActions
        ref={this.headerRef}
        btnCancel={btnCancel}
        btnSubmit={btnSubmit}
        container={headContainer}
        formValues={this.props.record}
        showCancel={false}
        showOk={false}
        record={this.props.record}
        okEnable={this.props.okEnable}
        isReadOnly={this.isReadOnly}
        handleCancel={this.handleCancel}
        handleSubmit={this.handleSubmit}
        validateForms={this.validateForms}
        okLoading={this.props.loading}
        actions={headActions}
      />
    );
  }

  // 弹窗模式
  renderPopupObject() {
    const { visible, modalDestory } = this.state;
    const { title, width, height, action: mode, loading, className } = this.props;
    if (modalDestory) {
      return null;
    }
    const fixedCls = height ? 'fixed-footer' : '';
    return (
      <Modal
        wrapClassName={`abstract-object-modal-wrap abstract-object-view ${fixedCls} ${className} ${width > 0 ? '' : 'large'
        }`}
        className={`abstract-object ${mode}`}
        title={title}
        visible={visible}
        width={width}
        maskClosable={this.isReadOnly}
        confirmLoading={loading}
        onOk={this.handleSubmit}
        onCancel={this.handleCancel}
        footer={this.renderFooter()}
      >
        {this.renderHeader()}
        <div style={{ height: height }} className="object-view-body" onClick={this.handleCommands}>{this.renderContext()}</div>
      </Modal>
    );
  }

  // 渲染表单内容
  renderContext() {
    const record = this.props.record || {};
    return (
      <CrashProvider errorProps={{ hideActions: true }} >
        <Form
          key={this.props.action}
          name={this.formId}
          ref={this.formRef}
          onValuesChange={this.onValuesChange}
          onFinish={this.onFinish}
          onFinishFailed={this.onFinishFailed}
          initialValues={record}
        >
          <AbstractForm.Context.Provider value={this.formContext}>
            {this.props.children}
          </AbstractForm.Context.Provider>
        </Form>
      </CrashProvider>
    );
  }

  // 渲染视图
  render() {
    const { type } = this.props;
    switch (type) {
      case 'modal':
        return this.renderPopupObject();
      default:
        return this.renderObject();
    }
  }
}

