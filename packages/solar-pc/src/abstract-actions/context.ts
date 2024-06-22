import React from 'react';
import { OnActionRoute } from '../abstract-table/types';
import { AbstractFormContext, AbstractRow } from '../interface';

export interface ActionsContext<TRow = AbstractRow> {
  action: string
  subAction?: string
  record: TRow
  subRecord?: any
  subConfirmLoading?: boolean
  confirmLoading?: boolean
  inject?: boolean
  onMatch?: (action:string) => void
  shouldHiddenList?: (hidden: boolean, isSubAction:boolean) => void
  onAction?: OnActionRoute<TRow>
  onCancel?: () => boolean | void
  onSubmit?: (record: TRow) => void
  onSubCancel?: () => void
  onSubSubmit?: (data: TRow) => void
  onValuesChange?: (values: TRow, prevValues: TRow) => void
  getActionsContainer?: ()=> HTMLElement
  listRef?: React.RefObject<HTMLDivElement>
  intoViewOptions?: AbstractFormContext['intoViewOptions']
}

export default React.createContext<ActionsContext>({ action: '', record: {} });
