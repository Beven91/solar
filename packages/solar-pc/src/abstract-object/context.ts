import { FormInstance } from 'antd';
import React from 'react';

export interface AbstractContextValue<TRow = any> {
  isReadOnly: boolean
  form: React.MutableRefObject<FormInstance>
  width: number | string
  // 提交
  submitAction: () => void,
  // 取消
  handleCancel: () => void,
  // 校验表单
  validateForms: () => Promise<void>,
  record: TRow,
  model: TRow,
}

export const AbstractObjectContext = React.createContext<AbstractContextValue>({} as AbstractContextValue);
