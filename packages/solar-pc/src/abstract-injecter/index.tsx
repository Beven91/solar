import React, { useContext } from 'react';
import { AbstractColumnType } from '../abstract-table/types';
import { AbstractFormGroupItemType, AbstractFormItemType } from '../interface';

export interface AbstractInjecterContextValue {
  listener?: {
    onColumnDbClick?: (column: AbstractColumnType<any>) => void
    onFieldDbClick?: (item: AbstractFormItemType<any>, type: string, e: React.MouseEvent) => void
    onFieldGroupDbClick?: (group: AbstractFormGroupItemType<any>, type: string, e: React.MouseEvent) => void
  },
  node?: {
    appendSearchAfter?: () => React.ReactNode
    appendAbstractTableInner?: () => React.ReactNode
    appendAbstractObjectBody?: (action: string) => React.ReactNode
    appendAbstractObjectFooter?: (action: string) => React.ReactNode
    appendFormGroup?: (group: AbstractFormGroupItemType<any>) => React.ReactNode
  }
}

const InjectContext = React.createContext<AbstractInjecterContextValue>({} as AbstractInjecterContextValue);

export function useInjecter(enable: boolean) {
  const context = useContext(InjectContext);
  if (enable) {
    return context;
  }
  return {} as AbstractInjecterContextValue;
}

export default InjectContext.Provider;