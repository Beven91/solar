/**
 * @module ISolation
 * @description
 *  一个隔离的form容器,其中配置的表单项和dyanmic相互独立，
 *  不过在abstract-object提交时，会进行提交
 */
import React, { useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import Dynamic from './dynamic';
import FormContext from './context';
import { AbstractFormProps } from './index';
import { AbstractRow } from '../interface';
import { Form } from 'antd';
import { FormInstance } from 'antd/lib/form';
import deepmerge from './deepmerge';

export interface ISolationContextValue {
  setValidator: (handler: () => Promise<boolean>) => void
}

export const ISolationContext = React.createContext<ISolationContextValue>({} as ISolationContextValue);

export interface ISolationHookProps<TRow extends AbstractRow> extends AbstractFormProps<TRow> {
  onChange?: (values: TRow) => void
  value?: TRow
}

export interface ISolationHookState<TRow> {
  needUpdate: boolean
  value: TRow
}

export default function ISolation<TRow>({ onChange, ...props }: React.PropsWithChildren<ISolationHookProps<TRow>>) {
  const formRef = useRef<FormInstance>();
  const context = useContext(FormContext);
  const isolationContext = useContext(ISolationContext);
  const useFormRef = props.form || formRef;

  const onValuesChange = useCallback((changedValues: TRow, values: TRow) => {
    const model = deepmerge({ ...values }, changedValues) as TRow;
    onChange && onChange(model);
    props.onValuesChange && props.onValuesChange(changedValues, values);
  }, [onChange]);

  useEffect(() => {
    const formInstance = useFormRef.current;
    if (formInstance) {
      formInstance.setFieldsValue(props.value || {});
      isolationContext?.setValidator?.(() => {
        return formInstance.validateFields();
      });
    }
    return () => {
      isolationContext?.setValidator?.(null);
    };
  }, [useFormRef.current]);

  const childContext = useMemo(() => {
    return {
      isReadOnly: context.isReadOnly,
      form: useFormRef,
      record: props.value,
    };
  }, []);


  return (
    <Form
      ref={useFormRef}
      component={false}
      initialValues={props.value}
      onValuesChange={onValuesChange}
    >
      <FormContext.Provider
        value={childContext}
      >
        <Dynamic {...childContext} {...props} />
      </FormContext.Provider>
    </Form>

  );
}

ISolation.Context = ISolationContext;