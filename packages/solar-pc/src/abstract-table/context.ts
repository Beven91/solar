import React from 'react';
import { AbstractAction } from '../interface';

export interface AbstractTableContext {
  onAction: (action: AbstractAction<any>) => void
}

const Context = React.createContext<AbstractTableContext>({ onAction: null });

export default Context;
