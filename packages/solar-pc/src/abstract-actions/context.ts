import React from 'react';
import { OnActionRoute } from '../abstract-table/types';
import { AbstractRow } from '../interface';

export interface ActionsContext<TRow = AbstractRow> {
  action: string
  subAction?: string
  record: TRow
  subConfirmLoading?: boolean
  confirmLoading?: boolean
  shouldHiddenList?: (hidden: boolean) => void
  onAction?: OnActionRoute<TRow>
  onCancel?: () => boolean | void
  onSubmit?: (record: TRow) => void
  onSubCancel?: () => void
  onSubSubmit?: (data: TRow) => void
  onValuesChange?: (values: TRow, prevValues: TRow) => void
  listRef?: React.RefObject<HTMLDivElement>
}

export default React.createContext<ActionsContext>({ action: '', record: {} });
