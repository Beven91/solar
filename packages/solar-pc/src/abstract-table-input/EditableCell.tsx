import React from 'react';
// import { Form } from 'antd';
import FormItem from '../abstract-form/Item';
import { FormInstance, Rule } from 'antd/lib/form';
import { AbstractFormItemType, AbstractRow } from '../interface';

export interface EditableCellProps {
  record: AbstractRow
  rules: Rule[]
  cellRef: React.RefObject<any>
  editing: boolean
  item: AbstractFormItemType<any>
  form: React.RefObject<FormInstance>
}

export default class EditableCell extends React.Component<React.PropsWithChildren<EditableCellProps>> {
  render() {
    const { item, record, rules, cellRef, editing, form, children, ...restProps } = this.props;
    if (cellRef) {
      const ref = cellRef as any;
      ref.current = this;
    }
    return (
      <td {...restProps}>
        {
          editing ? (
            <FormItem
              model={record}
              form={form}
              item={item}
              style={{ margin: 0 }}
              rules={rules}
            />
          ) :
            children
        }
      </td>
    );
  }
}
