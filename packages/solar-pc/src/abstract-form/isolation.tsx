/**
 * @module ISolation
 * @description
 *  一个隔离的form容器,其中配置的表单项和dyanmic相互独立，
 *  不过在abstract-object提交时，会进行提交
 */
import React from 'react';
import Dynamic from './dynamic';
import ChildForm from '../abstract-object/ChildForm';
import FormContext from './context';
import { AbstractFormProps } from './index';
import { AbstractRow } from '../interface';
import { FormInstance } from 'antd';
import deepmerge from './deepmerge';

export interface ISolationHookProps<TRow extends AbstractRow> extends AbstractFormProps<TRow> {
  onChange?: (values: TRow) => void
  value?: TRow
}

export interface ISolationHookState<TRow> {
  needUpdate: boolean
  value: TRow
}

export default class ISolation<TRow = AbstractRow> extends React.Component<ISolationHookProps<TRow>, ISolationHookState<TRow>> {
  static getDerivedStateProps(props: ISolationHookProps<AbstractRow>, state: ISolationHookState<AbstractRow>) {
    if (props.value !== state.value) {
      return {
        needUpdate: true,
        value: state.value,
      };
    }
    return null;
  }

  state:ISolationHookState<TRow> = {
    needUpdate: false,
    value: null,
  };

  formRef = React.createRef<FormInstance>();

  onChange = (changedValues: TRow, values: TRow) => {
    const { onChange } = this.props;
    const model = deepmerge({ ...values }, changedValues) as TRow;
    this.setState({ value: model, needUpdate: false });
    onChange && onChange(model);
  };

  componentDidUpdate() {
    if (this.state.needUpdate && this.formRef.current) {
      this.setState({ needUpdate: false });
      this.formRef.current.setFieldsValue(this.state.value || {});
    }
  }

  render() {
    return (
      <ChildForm
        component={false}
        formRef={this.formRef}
        initialValues={this.props.value}
        onValuesChange={this.onChange}
      >
        <FormContext.Consumer>
          {(context) => {
            return <Dynamic {...context} {...this.props} />;
          }}
        </FormContext.Consumer>
      </ChildForm>
    );
  }
}
