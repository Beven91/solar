import { useCallback } from 'react';
import { AbstractFormGroupItemType, AbstractFormItemType } from '../../interface';
import { mergeFormValues } from '../deepmerge';
import { Form } from 'antd';

export function useContextFormValuer<TRow = any>(model: TRow) {
  const form = Form.useFormInstance();
  const getValues = useCallback(() => {
    return mergeFormValues(model, form) as TRow;
  }, [form, model]);

  return {
    getValues,
    form,
  };
}

export function isFormItemVisible<TRow = any>(behavior: AbstractFormGroupItemType | AbstractFormItemType, data: TRow) {
  if (typeof behavior?.visible === 'function') {
    return behavior.visible(data);
  } else if (behavior?.visible !== undefined) {
    return behavior.visible;
  }
  return true;
};

export function isFormGroupReadonly<TRow = any>(behavior: AbstractFormGroupItemType, data: TRow) {
  if (typeof behavior?.readonly === 'function') {
    return behavior.readonly(data);
  } else if (behavior?.readonly !== undefined) {
    return behavior.readonly;
  }
  return undefined;
};