import React from 'react';
import { AbstractAction } from '../interface';

export interface AbstractTableContextValue {
  onAction: (action: AbstractAction<any>) => void
  getActionsContainer?: () => HTMLElement
}

const AbstractTableContext = React.createContext<AbstractTableContextValue>({ onAction: null });

export default AbstractTableContext;
