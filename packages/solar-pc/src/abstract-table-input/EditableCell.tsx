import React, { useMemo } from 'react';
// import { Form } from 'antd';
import FormItem from '../abstract-form/Item';
import { Rule } from 'antd/lib/form';
import { AbstractFormItemType, AbstractRow } from '../interface';

export interface EditableCellProps {
  record: AbstractRow
  rules: Rule[]
  editing: boolean
  item: AbstractFormItemType<any>
  style?: React.CSSProperties
}

export default function EditableCell(props: React.PropsWithChildren<EditableCellProps>) {
  const { item, record, rules, editing, children, ...restProps } = props;
  const style = useMemo(() => {
    return {
      verticalAlign: 'top',
      ...props.style,
    };
  }, [props.style]);
  return (
    <td {...restProps} style={style}>
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
