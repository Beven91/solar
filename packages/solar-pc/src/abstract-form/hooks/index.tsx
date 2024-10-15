import React, { useState } from 'react';
import { useCallback, useMemo, useRef } from 'react';
import { AbstractFormGroupItemType, AbstractFormItemType, AbstractGroups } from '../../interface';
import { mergeFormValues } from '../deepmerge';
import { Form, FormInstance } from 'antd';
import { ISolationContextValue } from '../isolation';
import { RuleObject } from 'antd/lib/form';
import { IsolationError } from '../context';

export interface ContextOriginalValue {
  isolationValidators: Parameters<ISolationContextValue['addValidator']>[0][]
  mergeValidators: Parameters<ISolationContextValue['addMergeValidator']>[0][]
}

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

export function useIsolation(name: string) {
  const [memo] = useState({ changeReason: '' });
  const contextOriginal = useRef<ContextOriginalValue>({ isolationValidators: [], mergeValidators: [] } as ContextOriginalValue);
  const context = useMemo(() => {
    const removeValidator = (handler) => {
      const handlers = contextOriginal.current.isolationValidators;
      const idx = handlers.indexOf(handler);
      if (idx > -1) {
        handlers.splice(idx, 1);
      }
    };
    const removeMergeValidator = (handler) => {
      const validators = contextOriginal.current.mergeValidators;
      const idx = validators.indexOf(handler);
      if (idx > -1) {
        validators.splice(idx, 1);
      }
    };
    return {
      owner: name,
      memo: memo,
      addValidator: (handler) => {
        contextOriginal.current.isolationValidators.push(handler);
        return () => removeValidator(handler);
      },
      removeValidator: removeValidator,
      addMergeValidator: (handler) => {
        contextOriginal.current.mergeValidators.push(handler);
        return () => removeMergeValidator(handler);
      },
    } as ISolationContextValue;
  }, []);

  const isolationRuler = useMemo(() => {
    return {
      validator: () => {
        return new Promise<void>((resolve, reject) => {
          if (memo.changeReason) {
            // 如果是isolation触发的onChange事件触发的校验（则需要忽略，用于减少不必要的计算与渲染)
            return resolve();
          }
          const len = contextOriginal.current.isolationValidators?.length || 0;
          if (len < 1) {
            return resolve();
          }
          Promise.all(
            contextOriginal.current.isolationValidators.map((validate) => {
              return validate?.();
            })
          ).then(() => {
            resolve();
          }).catch((ex) => {
            reject(<IsolationError />);
          });
        });
      },
    };
  }, []);

  const mergeValidatorRuler = useMemo(() => {
    return {
      validator: (rule: RuleObject) => {
        return new Promise<void>((resolve, reject) => {
          if (memo.changeReason) {
            return resolve();
          }
          const len = contextOriginal.current.mergeValidators?.length || 0;
          if (len < 1) {
            return resolve();
          }
          Promise.all(
            contextOriginal.current.mergeValidators.map((validate) => {
              return validate?.();
            })
          ).then(() => {
            resolve();
          }).catch((message: string) => {
            rule.message = message;
            reject();
          });
        });
      },
    };
  }, []);

  return {
    isolationContext: context,
    isolationRuler,
    mergeValidatorRuler,
  };
}

export function useTabGroupsAutoSwitchValidator<TRow = any>(groups: AbstractGroups<TRow>, switchTab: (index: number) => void) {
  return useMemo(() => {
    return [
      (form: FormInstance) => {
        return {
          validator: () => {
            return new Promise<void>((resolve) => {
              resolve();
              requestAnimationFrame(() => {
                const errorField = form.getFieldsError().filter((m) => m.errors?.length > 0)[0];
                if (errorField) {
                  const group = groups.find((g: AbstractFormGroupItemType) => g.items?.find((m) => m.name == errorField.name));
                  if (group) {
                    switchTab(groups.indexOf(group));
                  }
                };
              });
            });
          },
        };
      },
    ];
  }, [groups, switchTab]);
}