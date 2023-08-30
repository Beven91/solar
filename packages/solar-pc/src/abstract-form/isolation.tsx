/**
 * @module ISolation
 * @description
 *  一个隔离的form容器,其中配置的表单项和dyanmic相互独立，
 *  不过在abstract-object提交时，会进行提交
 */
import React, { useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import Dynamic from './dynamic';
import FormContext, { TopFormContext } from './context';
import { AbstractFormProps } from './index';
import { AbstractRow } from '../interface';
import { Form } from 'antd';
import { FormInstance } from 'antd/lib/form';
import { mergeFormValues } from './deepmerge';

const runtime = {
  id: 0,
  triggerMappings: {} as Record<string, boolean>,
};

export interface ISolationContextValue {
  setValidator: (handler: () => Promise<void>) => void
  setMergeValidator: (handler: () => Promise<void>) => void
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
  const topContext = useContext(TopFormContext);

  const name = useMemo(() => {
    return `iso_${runtime.id++}`;
  }, []);
  const onValuesChange = useCallback((changedValues: TRow, values: TRow) => {
    const model = mergeFormValues(values, useFormRef.current) as TRow;
    onChange && onChange(model);
    props.onValuesChange && props.onValuesChange(changedValues, values);
  }, [onChange, props.onValuesChange]);

  useEffect(() => {
    const formInstance = useFormRef.current;
    if (formInstance) {
      formInstance.setFieldsValue(props.value || {});
      isolationContext?.setValidator?.(() => {
        return formInstance.validateFields().catch((ex) => {
          const isTrigging = runtime.triggerMappings[topContext.name];
          if (!isTrigging) {
            return new Promise((resolve, reject) => {
              runtime.triggerMappings[topContext.name] = true;
              setTimeout(() => {
                runtime.triggerMappings[topContext.name] = false;
              }, 300);
              formInstance.scrollToField(ex.errorFields[0].name, context.intoViewOptions);
              reject(ex);
            });
          }
          return Promise.reject(ex);
        });
      });
    }
    return () => {
      isolationContext?.setValidator?.(null);
    };
  }, [useFormRef]);

  const childContext = useMemo(() => {
    return {
      isReadOnly: context.isReadOnly,
      form: useFormRef,
      record: props.value,
      intoViewOptions: context.intoViewOptions,
    };
  }, [context.isReadOnly, useFormRef, props.value]);

  return (
    <Form
      name={name}
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