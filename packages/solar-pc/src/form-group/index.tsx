/**
 * @name FormGroup
 * @description 表单分组行
 */
import './index.scss';
import React, { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { Card, Form } from 'antd';
import { FormInstance } from 'antd/lib/form';
import { AbstractFormGroupItemType, AbstractRow, FormGroupStyle } from '../interface';
import VirtualInput from './VirtualInput';
import { getAllValues } from '../abstract-form/InputWrap';

const isVisible = (props: WithFormProps<any>) => {
  const item = props.group;
  if (typeof item?.visible === 'function') {
    const data = getAllValues(props);
    return item.visible(data);
  } else if (item?.visible !== undefined) {
    return item.visible;
  }
  return true;
};

const isReadonly = (props: WithFormProps<any>) => {
  const item = props.group;
  if (typeof item?.readonly === 'function') {
    const data = getAllValues(props);
    return item.readonly(data);
  } else if (item?.readonly !== undefined) {
    return item.readonly;
  }
  return undefined;
};

interface WithFormProps<TRow = any> {
  // 配置
  group: AbstractFormGroupItemType<TRow>
  // 数据
  model: TRow
  // form对象
  form: React.RefObject<FormInstance>
}

export interface FormGroupProps<TRow> extends WithFormProps<TRow> {
  // 组名称
  title: ReactNode
  // 图标
  icon?: ReactNode,
  // 展示模式
  mode: FormGroupStyle
  // 样式名
  className?: string
  noLeftPadding?: boolean
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
  const [visible, setVisible] = useState(true);
  const [readonly, setReadonly] = useState<boolean>(undefined);
  const memo = useRef({ timerId: 0 as any });

  const groupContext = useMemo(() => {
    return {
      isReadonly: readonly,
    };
  }, [readonly]);

  useEffect(() => {
    setVisible(isVisible(props));
  }, [props.group?.visible, props.model]);

  useEffect(() => {
    setReadonly(isReadonly(props));
  }, [props.group?.readonly, props.model]);

  const shouldUpdate = () => {
    clearTimeout(memo.current.timerId);
    memo.current.timerId = setTimeout(() => {
      const innerVisible = isVisible(props);
      setVisible(innerVisible);
    }, 16);
    return false;
  };

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
        headStyle={style}
        bodyStyle={style}
        className={`form-group ${ readonly ? 'readonly' : '' } ${className} ${mode || ''}`}
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
