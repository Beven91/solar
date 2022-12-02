import React from 'react';
import { AbstractFormContext } from '../interface';

export default React.createContext<AbstractFormContext>({
  isReadOnly: false,
  form: null as any,
  record: {},
});