import React from 'react';
import { AbstractFormGroupItemType, AbstractFormItemType, AbstractGroupItem, FormItemLayout, FunctionItemType } from '../interface';
import { Col } from 'antd';
import FormItem, { FunctionItem } from './Item';
import type { DynamicProps } from './dynamic';

const defaultFormItemLayout: FormItemLayout = {
  labelCol: {
    span: 5,
  },
  wrapperCol: {
    span: 19,
    xs: {
      span: 17,
    },
  },
};

// 渲染表单
export function renderFormItem<TRow = any>(item: AbstractGroupItem<TRow>, options: DynamicProps<TRow>, span?: number, group?: AbstractFormGroupItemType<TRow>, index?: number) {
  if (typeof item === 'function') {
    return renderFreeFunction(item, group, index, options);
  }
  return renderNormalLayoutInput(item as AbstractFormItemType<TRow>, options, span, group, index);
};

// 渲染一个自定义布局表单
export function renderFreeFunction<TRow = any>(item: FunctionItemType<TRow>, group: AbstractFormGroupItemType<TRow>, index: number, props: DynamicProps<TRow>) {
  return (
    <Col
      key={`form-group-item-${index || 0}-${item.name}`}
      span={24}
    >
      <FunctionItem
        item={item}
        model={props.model}
        isReadonly={props.isReadOnly}
      />
    </Col>
  );
};

// 渲染常规布局表单
export function renderNormalLayoutInput<TRow = any>(item: AbstractFormItemType<TRow>, props: DynamicProps<TRow>, span?: number, group?: AbstractFormGroupItemType<TRow>, i?: number) {
  const { formItemLayout } = props;
  const title = item.render2 ? '' : item.title;
  const layout = group?.layout;
  const itemStyle = group?.itemStyle;
  const layout2 = title ? item.layout || layout || formItemLayout || defaultFormItemLayout : {};
  const num = 24 / span;
  const name = item.name instanceof Array ? item.name.join('.') : item.name;
  const itemRules = (props.rules || {})[name];
  const colOption = {
    span: item.span || span || 24,
    offset: item.offset,
    className: `${num <= 3 ? 'three' : 'than-three'} ${props.formItemCls}`,
  };
  return (
    <React.Fragment
      key={`form-group-item-${i}-${item.name}`}
    >
      {
        item.break ? (<Col span={24} className="break-form-item"></Col>) : null
      }
      <FormItem
        layout={layout2}
        item={item}
        autoFocusAt={props.autoFocus}
        colOption={colOption}
        onValuesChange={props.onValuesChange}
        isReadOnly={props.isReadOnly}
        rules={itemRules}
        validateFirst={props.validateFirst}
        model={props.model}
        inject={props.inject}
        formName={props.name}
        style={{
          ...(props.itemStyle || {}),
          ...(itemStyle || {}),
          ...((item as any).itemStyle || {}),
        }}
      />
    </React.Fragment>
  );
};