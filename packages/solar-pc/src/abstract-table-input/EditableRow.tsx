import React, { useCallback, useRef } from 'react';
import { FormInstance } from 'antd';
import AbstractForm from 'solar-pc/src/abstract-form';

const NOOP = [] as any[];

export const formRefSymbol = Symbol('formRef');

export interface EditableRowProps<TRow = any> {
  record: TRow
  disabled?: boolean
  index: number
  className?: string
  onChange?: (value: TRow, record: TRow) => void
}

export default function EditableRow({ onChange, disabled, record, index, ...props }: React.PropsWithChildren<EditableRowProps>) {
  const formRef = useRef<FormInstance>();
  const onValueChange = useCallback((values) => {
    onChange?.(values, record);
  }, [onChange, index]);


  if (!record || disabled) {
    return <tr {...props} />;
  }

  record[formRefSymbol] = formRef;

  return (
    <AbstractForm.ISolation
      pure
      value={record}
      groups={NOOP}
      formRef={formRef}
      onChange={onValueChange}
    >
      <tr {...props} className={`${props.className || ''} abstract-form`}></tr>
    </AbstractForm.ISolation>
  );
}