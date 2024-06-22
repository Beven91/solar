import React from 'react';
// import { Form } from 'antd';
import FormItem from '../abstract-form/Item';
import { Rule } from 'antd/lib/form';
import { AbstractFormItemType, AbstractRow } from '../interface';

export interface EditableCellProps {
  record: AbstractRow
  rules: Rule[]
  editing: boolean
  item: AbstractFormItemType<any>
}

export default function EditableCell(props: React.PropsWithChildren<EditableCellProps>) {
  const { item, record, rules, editing, children, ...restProps } = props;
  return (
    <td {...restProps}>
      {
        editing ? (
          <FormItem
            model={record}
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
