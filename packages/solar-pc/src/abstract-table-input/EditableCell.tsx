import React, { memo, useMemo } from 'react';
import FormItem from '../abstract-form/Item';
import { Rule } from 'antd/lib/form';
import { AbstractFormItemType, AbstractRow } from '../interface';
import { shallowEqual } from '../abstract-form/render';

const exclude = {
  editor: true,
  children: true,
  onMouseEnter: true,
  onMouseLeave: true,
  style: true,
};

export interface EditableCellProps {
  editor: {
    record: AbstractRow
    rules: Rule[]
    item: AbstractFormItemType<any>
    index: number
    chaningIndex: number
    editing: boolean
  }
  title?: string
  className?: string
  style?: React.CSSProperties
}

export default memo(function EditableCell(props: React.PropsWithChildren<EditableCellProps>) {
  const { editor, children, ...restProps } = props;
  const { record, item, rules, editing } = editor || {};
  const style = useMemo(() => {
    return {
      verticalAlign: 'top',
      ...props.style,
    };
  }, [props.style]);

  const renderContent = () => {
    if (!item || !editing) {
      return children;
    }
    return (
      <FormItem
        model={record}
        item={item}
        style={{ margin: 0 }}
        rules={rules}
      />
    );
  };

  return (
    <td {...restProps} style={style}>
      {renderContent()}
    </td>
  );
}, (prev, next) => {
  const prevEditor = prev.editor || {} as EditableCellProps['editor'];
  const nextEditor = next.editor || {} as EditableCellProps['editor'];
  return (
    prevEditor.record === nextEditor.record &&
    prevEditor.index === nextEditor.index &&
    prevEditor.index !== nextEditor.chaningIndex &&
    shallowEqual(prev, next, exclude) &&
    shallowEqual(prev.style, next.style)
  );
});
