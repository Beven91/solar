import React, { useCallback, useRef } from 'react';
import { FormInstance } from 'antd';
import AbstractForm from 'solar-pc/src/abstract-form';

const NOOP = [] as any[];

export const formRefSymbol = Symbol('formRef');

export interface EditableRowProps<TRow = any> {
  record: TRow
  disabled?: boolean
  index: number
  editIndex: number
  className?: string
  onChange?: (value: TRow, record: TRow) => void
}

export default function EditableRow({ onChange, children, disabled, record, index, ...props }: React.PropsWithChildren<EditableRowProps>) {
  const formRef = useRef<FormInstance>();
  const memoRef = useRef<any>(0);
  const onValueChange = useCallback((values) => {
    clearTimeout(memoRef.current);
    memoRef.current = setTimeout(() => {
      onChange?.(values, record);
    }, 100);
  }, [onChange, index]);


  if (!record || disabled) {
    return <tr {...props} >{children}</tr>;
  }

  record[formRefSymbol] = formRef;

  return (
    <tr {...props} className={`${props.className || ''} abstract-form`}>
      <AbstractForm.ISolation
        pure
        value={record}
        groups={NOOP}
        formRef={formRef}
        onChange={onValueChange}
      >
        {children}
      </AbstractForm.ISolation>
    </tr>
  );
}