/**
 * @module ISolation
 * @description
 *  一个隔离的form容器,其中配置的表单项和dyanmic相互独立，
 *  不过在abstract-object提交时，会进行提交
 */
import React, { useCallback, useContext, useEffect, useMemo } from 'react';
import Dynamic from './dynamic';
import FormContext, { TopFormContext } from './context';
import { AbstractFormProps } from './index';
import { AbstractRow } from '../interface';
import { Form, FormInstance } from 'antd';
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
  formRef?: React.MutableRefObject<FormInstance>
  onChange?: (values: TRow) => void
  value?: TRow
  // 是否不渲染html节点
  pure?: boolean
}

export interface ISolationHookState<TRow> {
  needUpdate: boolean
  value: TRow
}

export default function ISolation<TRow>({ onChange, pure, formRef, ...props }: React.PropsWithChildren<ISolationHookProps<TRow>>) {
  const [formInstance] = Form.useForm();
  const context = useContext(FormContext);
  const isolationContext = useContext(ISolationContext);
  const topContext = useContext(TopFormContext);
  const name = useMemo(() => `iso_${runtime.id++}`, []);
  const onValuesChange = useCallback((changedValues: TRow, values: TRow) => {
    const model = mergeFormValues(props.value || values, formInstance) as TRow;
    onChange && onChange(model);
    props.onValuesChange && props.onValuesChange(changedValues, values);
  }, [onChange, props.onValuesChange, formInstance, props.value]);

  if (formRef) {
    formRef.current = formInstance;
  }

  useEffect(() => {
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
    return () => {
      isolationContext?.setValidator?.(null);
    };
  }, []);

  const childContext = useMemo(() => {
    return {
      isReadOnly: context.isReadOnly,
      record: props.value,
      intoViewOptions: context.intoViewOptions,
    };
  }, [context.isReadOnly, props.value]);

  return (
    <Form
      name={name}
      form={formInstance}
      component={false}
      initialValues={props.value}
      onValuesChange={onValuesChange}
    >
      <FormContext.Provider
        value={childContext}
      >
        <Dynamic {...childContext} {...props} pure={pure} />
      </FormContext.Provider>
    </Form>
  );
}

ISolation.Context = ISolationContext;