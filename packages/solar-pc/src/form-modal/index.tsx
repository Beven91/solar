/**
 * @name FormModal
 * @description
 *       一个带表单验证的模态窗
 */
import React from 'react';
import { Modal, Form } from 'antd';
import AbstractForm from '../abstract-form';
import { ModalProps } from 'antd/lib/modal';
import { FormInstance } from 'antd/lib/form';

export interface FormModalProps extends ModalProps {
  // 窗口标题
  title: string
  // 关闭窗口
  onCancel?: (e: React.MouseEvent<HTMLElement>) => void
  // 提交操作
  onSubmit: (values: any) => void
  // 模态窗是否可见
  visible: boolean
  // 当前数据
  record: any
}

export interface FormModalState {

}

export default class FormModal extends React.Component<FormModalProps, FormModalState> {
  // 默认属性值
  static defaultProps = {
    visible: false,
  }

  // 构造函数
  constructor(props: FormModalProps) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = {
    };
  }

  formRef = React.createRef<FormInstance>()

  // 设置共享context数据
  get formContext() {
    return {
      form: this.formRef,
      record: this.props.record || {},
    };
  }

  /**
   * 当收到新的属性时，重新设置是否需要显示弹窗
   * @param {} nextProps 新的组件属性
   */
  getSnapshotBeforeUpdate(prevProps: FormModalProps, prevState: FormModalState) {
    if (this.props.visible !== prevProps.visible) {
      this.formRef.current.resetFields();
    }
    return null as any;
  }

  // 处理提交操作
  handleSubmit() {
    const { onSubmit } = this.props;
    this.formRef.current.validateFields().then((values) => {
      if (typeof onSubmit === 'function') {
        onSubmit(values);
      }
    });
  }

  // 渲染表单内容
  renderContext() {
    return (
      <AbstractForm.Context.Provider value={this.formContext}>
        {this.props.children}
      </AbstractForm.Context.Provider>
    );
  }

  renderModal() {
    const { title, visible, ...props } = this.props;
    return (
      <Modal
        width={620}
        {...props}
        title={title}
        visible={visible}
        okText="提交"
        cancelText="取消"
        onOk={this.handleSubmit}
        onCancel={this.props.onCancel}
      >
        {
          this.renderContext()
        }
      </Modal>
    );
  }

  // 渲染视图
  render() {
    return (
      <Form ref={this.formRef}>
        {this.renderModal()}
      </Form>
    );
  }
}
