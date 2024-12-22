/**
 * @name FormGroup
 * @description 表单分组行
 */
import './index.scss';
import React, { ReactNode, useCallback, useMemo, useRef, useState } from 'react';
import { Card, Form } from 'antd';
import { AbstractFormGroupItemType, AbstractRow, FormGroupStyle } from '../interface';
import VirtualInput from './VirtualInput';
import { isFormGroupReadonly, isFormItemVisible, useContextFormValuer } from '../abstract-form/hooks';

export interface FormGroupProps<TRow> {
  // 组名称
  title: ReactNode
  // 图标
  icon?: ReactNode,
  // 展示模式
  mode: FormGroupStyle
  // 样式名
  className?: string
  noLeftPadding?: boolean
  // 配置
  group: AbstractFormGroupItemType<TRow>
  // 数据
  model: TRow
}

export interface FormGroupContextValue {
  isReadonly?: boolean
}

export const FormGroupContext = React.createContext<FormGroupContextValue>({
});

export default function FormGroup<TRow extends AbstractRow>({
  mode = 'normal',
  ...props
}: React.PropsWithChildren<FormGroupProps<TRow>>) {
  const [, setUpdateId] = useState('a');
  const group = props.group;
  const valuer = useContextFormValuer(props.model);
  const allValues = valuer.getValues();
  const visible = isFormItemVisible(group, allValues);
  const readonly = isFormGroupReadonly(group, allValues);
  const memo = useRef({ timerId: 0 as any });

  const groupContext = useMemo(() => {
    return {
      isReadonly: readonly,
    };
  }, [readonly]);

  const shouldUpdate = useCallback(() => {
    clearTimeout(memo.current.timerId);
    memo.current.timerId = setTimeout(() => {
      const visible2 = isFormItemVisible(group, valuer.getValues());
      if (visible !== visible2) {
        setUpdateId((m) => m == 'a' ? 'b' : 'a');
      }
    }, 16);
    return false;
  }, [valuer.getValues, visible, group]);

  // 渲染
  const renderGroup = () => {
    const { className, icon } = props;
    if (!visible) {
      // 如果不可见
      return null;
    }

    const title = (
      <div className="from-group-title">
        {icon}
        {props.title}
      </div>
    );

    const style = props.noLeftPadding ? { paddingLeft: 0 } : undefined;

    return (
      <Card
        styles={{
          header: style,
          body: style,
        }}
        className={`form-group ${readonly ? 'readonly' : ''} ${className} ${mode || ''}`}
        title={props.title ? title : ''}
      >
        <FormGroupContext.Provider value={groupContext}>
          {props.children}
        </FormGroupContext.Provider>
      </Card>
    );
  };

  return (
    <Form.Item
      name="member"
      className="form-group-level form-group-box"
      style={{ marginBottom: 0, display: visible ? undefined : 'none' }}
      shouldUpdate={shouldUpdate}
    >
      <VirtualInput>
        {renderGroup()}
      </VirtualInput>
    </Form.Item>
  );
}
