/**
 * @module Item
 * @description 动态antd FormItem
 */
import React, { useCallback, useContext, useMemo, useState } from 'react';
import { Col, Form, Input } from 'antd';
import { Rule } from 'antd/lib/form';
import InputWrap, { } from './InputWrap';
import { AbstractFormItemType, AbstractFormLayout, RecordModel, AbstractRow, onValuesChangeHandler, FunctionItemType } from '../interface';
import ConfigConsumer from '../abstract-provider';
import ISolation, { } from './isolation';
import { FormGroupContext } from '../form-group';
import { ColProps } from 'antd/lib/grid';
import { NamePath } from 'antd/lib/form/interface';
import { useContextFormValuer, useIsolation } from './hooks';

const FormItem = Form.Item;

const defaultColOption: ColProps = {
  xs: {
    span: 24,
  },
  sm: {
    span: 24,
  },
  md: {
    span: 12,
  },
};

const isVisible = (item: AbstractFormItemType<AbstractRow>, data: AbstractRow) => {
  if (typeof item.visible === 'function') {
    return item.visible(data);
  } else if (item.visible !== undefined) {
    return item.visible;
  }
  return true;
};

const isDisabled = (item: AbstractFormItemType<AbstractRow>, data: AbstractRow) => {
  if (item.textonly) {
    return true;
  }
  if (typeof item.disabled === 'function') {
    return item.disabled(data);
  } else if (item.disabled !== undefined) {
    return item.disabled;
  }
  return false;
};

export interface AbstractItemProps<TRow> {
  // 布局
  layout?: AbstractFormLayout
  // 配置项信息
  item: AbstractFormItemType<TRow>
  // 校验规则
  rules?: Rule[]
  // 对象数据
  model: TRow
  // 当前是否为只读模式
  isReadOnly?: boolean
  // 设置外包col配置
  colOption?: {
    span: number
    offset: number
    className: string
  },
  style?: React.CSSProperties
  // 表单值发生改变时间
  onValuesChange?: onValuesChangeHandler
  autoFocusAt?: string
  // 当某一规则校验不通过时，是否停止剩下的规则的校验。设置 parallel 时会并行校验
  validateFirst?: boolean | 'parallel'
  // 表单容器名
  formName?: string
}

export interface AbstractItemState {
  // visible函数
  visibleFunction: (data: any) => boolean
  // 当前表单是否可见
  visible: boolean
  // disabled函数
  disabledFunction: (data: any) => boolean
  // 当前是否禁用
  disabled: boolean
  // 是否强制更新visible 和disabled
  forceUpdate: boolean
}

function getValue<TRow extends AbstractRow = AbstractRow>(name: string[], curValues: TRow) {
  let value = curValues;
  if (name.length <= 1) {
    return curValues[name[0]];
  }
  for (let i = 0, k = name.length; i < k; i++) {
    value = value[name[i]];
    if (value === undefined || value === null) {
      break;
    }
  }
  return value;
}

function useExtraNode<TRow>(extra: AbstractFormItemType<TRow>['extra'], model: TRow) {
  if (typeof extra == 'function') {
    return extra(model || {} as TRow);
  }
  return extra;
}

export interface FunctionItemProps<TRow = any> {
  isReadonly: boolean
  item: FunctionItemType<TRow>
  model: TRow
}

export function FunctionItem<TRow = any>(props: FunctionItemProps<TRow>) {
  const groupContext = useContext(FormGroupContext);
  const valuer = useContextFormValuer(props.model);
  const model = valuer.getValues();
  return (
    <>
      {props.item(model, groupContext.isReadonly || props.isReadonly)}
    </>
  );
}

export default function Item<TRow extends AbstractRow = AbstractRow>(props: AbstractItemProps<TRow>) {
  const item = props.item;
  const valuer = useContextFormValuer(props.model);
  const context = useContext(ConfigConsumer.Context);
  const groupContext = useContext(FormGroupContext);
  const formValues = valuer.getValues();
  const [updateId, setUpdateId] = useState<number>(0);
  const [updater] = useState({ formatUpdate: false });
  const extraNode = useExtraNode(item.extra, formValues);
  const visible = isVisible(item, formValues);
  const disabled = isDisabled(item, formValues);
  const colOptions = useMemo(() => {
    const span = props.colOption?.span;
    return {
      span: span,
      offset: props.colOption?.offset,
      md: {
        span: Math.max(span, (defaultColOption.md as any)?.span),
      },
      lg: {
        span: span,
      },
    };
  }, [props.colOption?.span, props.colOption?.offset]);

  const name = useMemo(() => {
    if (item.name instanceof Array) return item.name;
    const items = item.name?.split('.') || [];
    const keys = [] as any[];
    items.forEach((key) => {
      if (key.indexOf('[') > -1) {
        key.split('[').forEach((k) => {
          k = k.replace(']', '');
          keys.push(isNaN(k as any) ? k : Number(k));
        });
      } else {
        keys.push(key);
      }
    });
    return keys as NamePath;
  }, [item.name]);


  const { isolationContext, isolationRuler, mergeValidatorRuler } = useIsolation(item.name.toString());

  const rules = useMemo(() => {
    return visible ? [...(props.rules || []), isolationRuler, mergeValidatorRuler] : null;
  }, [visible, props.rules, isolationRuler, mergeValidatorRuler]);

  const shouldUpdate = (prevValues: TRow, curValues: TRow, info: { source: string }) => {
    if (!info.source) return false;
    const form = valuer.form;
    const anyForm = form as any;
    const item = props.item;
    const innerVisible = isVisible(item, curValues);
    const innerDisabled = isDisabled(item, curValues);
    const updateKeys = anyForm?.updateKeys || {};
    const keyName = name.join('.');
    const prevValue = getValue(name, prevValues);
    const curValue = getValue(name, curValues);
    const changed = visible !== innerVisible || innerDisabled !== disabled || prevValue !== curValue;
    if ((typeof item.render === 'function' && !changed)) {
      // // 这里保证函，动态组件，必须渲染
      setUpdateId(updateId + 1);
      return false;
    }
    if (keyName in updateKeys) {
      return true;
    }
    if (item.format && updater.formatUpdate == false) {
      const v = item.format(curValues);
      updater.formatUpdate = true;
      form?.setFieldsValue({ [item.name as string]: v });
    }
    updater.formatUpdate = false;
    if (typeof item.extra == 'function' || changed) {
      setUpdateId(updateId + 1);
    }
  };

  const normalize = (value: TRow, prevValue: TRow, prevValues: TRow) => {
    const item = props.item;
    const form = valuer.form;
    if (item.cascade && form) {
      const paylod = (item.cascade(value, prevValues, prevValue));
      if (paylod instanceof Promise) {
        // 如果是异步，则获取数据后单独setFields
        paylod.then((model) => {
          form.setFieldsValue(model);
        });
      } else {
        const model = {
          ...paylod,
        };
        (form as any).updateKeys = model;
        form.setFieldsValue(model);
        (form as any).updateKeys = {};
        const selfValue = getValue(name, model as TRow);
        if (selfValue !== undefined) {
          value = selfValue;
        }
      }
    }
    if (item.normalize) {
      return item.normalize(value, prevValue, prevValue);
    }
    return value;
  };


  const useInitialValue = (record: TRow, name: Array<string>) => {
    let iterator = record;
    if (!record) {
      return true;
    }
    for (let i = 0, k = name.length; i < k; i++) {
      iterator = iterator[name[i]];
      if (iterator === undefined || iterator === null) {
        return true;
      }
    }
    return iterator === undefined;
  };

  const onValuesChange = useCallback((prevValues: RecordModel, curValues: RecordModel) => {
    if (typeof props.item?.extra == 'function') {
      setUpdateId((id) => id + 1);
    }
    isolationContext.memo.changeReason = props.item;
    props.onValuesChange?.(prevValues, curValues);
    requestAnimationFrame(() => {
      isolationContext.memo.changeReason = null;
    });
  }, [props.onValuesChange, isolationContext]);

  // 渲染
  const renderItem = () => {
    const { layout = {}, item, autoFocusAt, model: record, validateFirst } = props;
    const initialValue = item.initialValue;
    const visibleCls = visible ? 'visible' : 'hidden';
    const items = useInitialValue(record, name) ? { initialValue } : {};
    const title = item.render2 ? '' : item.title || '';
    const type = item.render2 ? 'input-full' : '';
    const isReadOnly = disabled || groupContext.isReadonly || props.isReadOnly;
    const readonlyCls = isReadOnly ? 'readonly-item' : '';
    const id = item.name instanceof Array ? item.name.join(',') : item.name;
    const genericKeys = Object.keys(item.genericKeys || {}).filter((m) => m !== id);
    const wrapperCol = {
      ...(layout?.wrapperCol || {}),
      className: `${layout.wrapperCol?.className || ''} ${isReadOnly ? 'readonly-wrapper' : ''}`,
    };
    const options = useMemo(()=>{
      const attrs = {} as any;
      if (!item.for) {
        attrs.htmlFor = null;
      }
      return attrs;
    }, [item.for]);

    return (
      <ISolation.Context.Provider
        value={isolationContext}
      >
        <FormItem
          shouldUpdate={item.dependencies ? undefined : shouldUpdate}
          {...layout}
          wrapperCol={wrapperCol}
          {...items}
          {...options}
          name = {name}
          style={props.style}
          label={title}
          colon={item.colon !== false}
          rules={rules}
          validateFirst={validateFirst}
          extra={extraNode}
          dependencies={item.dependencies}
          normalize={normalize}
          className={`${visibleCls} abstract-form-item ${readonlyCls} abstract-input-${item.name} ${type} ${item.className || ''}`}
          hasFeedback={item.hasFeedback}
        >
          <InputWrap
            item={item}
            autoFocus={autoFocusAt && autoFocusAt == item.name}
            onValuesChange={onValuesChange}
            valueFormatter={context.valueFormatter}
            model={record}
            isReadOnly={isReadOnly}
          />
        </FormItem>
        {
          genericKeys?.map((name) => <FormItem key={`__generic-${name}`} name={name} style={{ display: 'none' }}><Input type="hidden" /></FormItem>)
        }
      </ISolation.Context.Provider>

    );
  };

  const { colOption } = props;
  const children = renderItem();
  const node = item.wrapper ? item.wrapper(children) : children;

  if (colOption) {
    return (
      <Col
        {...defaultColOption}
        {...colOptions}
        offset={colOption.offset}
        data-id={props.item.id}
        data-name={props.item.name?.toString()}
        className={`abstract-form-item-col ${visible ? '' : 'hidden'} ${colOption.className}`}
      >
        {node}
      </Col>
    );
  }
  return node;
}
