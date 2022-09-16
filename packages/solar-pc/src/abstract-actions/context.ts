import React from 'react';
import { OnActionRoute } from '../abstract-table/types';
import { AbstractRow } from '../interface';

export interface ActionsContext<TRow = AbstractRow, Sub = any> {
  action: string
  subAction?: string
  record: TRow
  subRecord?:Sub
  subConfirmLoading?: boolean
  confirmLoading?: boolean
  onMatch?: (action:string) => void
  shouldHiddenList?: (hidden: boolean, isSubAction:boolean) => void
  onAction?: OnActionRoute<TRow>
  onCancel?: () => boolean | void
  onSubmit?: (record: TRow) => void
  onSubCancel?: () => void
  onSubSubmit?: (data: TRow) => void
  onValuesChange?: (values: TRow, prevValues: TRow) => void
  listRef?: React.RefObject<HTMLDivElement>
}

export default React.createContext<ActionsContext>({ action: '', record: {} });
