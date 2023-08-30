import React from 'react';
import { AbstractFormContext } from '../interface';

export default React.createContext<AbstractFormContext>({
  isReadOnly: false,
  form: null as any,
  record: {},
});

interface TopFormContextValue {
  name: string
}

export const TopFormContext = React.createContext<TopFormContextValue>({
  name: '',
});

export const IsolationError = ()=>{
  return null as React.ReactElement;
};