/**
 * @module ChildForm
 * @description 子表单,当AbstractObject 提交校验时,当前子表单也需要触发校验
 */

import React from 'react';
import { Form } from 'antd';
import AbstractForm from '../abstract-form';
import { AbstractFormContext } from '../interface';
import { FormInstance, FormProps } from 'antd/lib/form';

export interface ChildFormProps extends FormProps {
  formRef?: React.RefObject<FormInstance>
}

export default class ChildForm extends React.Component<React.PropsWithChildren<ChildFormProps>> {
  formRef = React.createRef<FormInstance>()

  formContext: AbstractFormContext

  adapterRef: {
    current: FormInstance
  }

  constructor(props: React.PropsWithChildren<ChildFormProps>) {
    super(props);
    const scope = this;
    this.adapterRef = {
      get current() {
        return scope.formInstance;
      },
    };
  }

  get formInstance() {
    const myRef = this.props.formRef || this.formRef;
    return myRef.current;
  }

  componentDidMount() {
    const context = this.formContext;
    if (context && context.addChildForm) {
      context.addChildForm(this.adapterRef);
    }
  }

  componentWillUnmount() {
    const context = this.formContext;
    if (context.removeChildForm) {
      context.removeChildForm(this.adapterRef);
    }
  }

  render() {
    return (
      <AbstractForm.Context.Consumer>
        {
          (context) => {
            const formRef = this.props.formRef || this.formRef;
            this.formContext = context;
            const childContext = {
              isReadOnly: context.isReadOnly,
              form: formRef,
              record: this.props.initialValues,
            };
            const { children, ...props } = this.props;
            return (
              <Form ref={formRef} {...props}>
                <AbstractForm.Context.Provider
                  value={childContext}
                >
                  {children}
                </AbstractForm.Context.Provider>
              </Form>
            );
          }
        }
      </AbstractForm.Context.Consumer>
    );
  }
}

