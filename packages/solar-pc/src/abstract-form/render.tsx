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

interface PuredFormItemProps<TRow> {
  item: AbstractGroupItem<TRow>
  options: DynamicProps<TRow>
  span?: number
  group?: AbstractFormGroupItemType<TRow>
  index?: number
}

const PuredFormItem = React.memo(function PuredFormItem<TRow>(props: PuredFormItemProps<TRow>) {
  const { item, options, span, group } = props;
  if (typeof item === 'function') {
    return renderFreeFunction(item, group, options);
  }
  return renderNormalLayoutInput(item as AbstractFormItemType<TRow>, options, span, group);
}, (prev, next) => {
  return (
    prev.span === next.span &&
    shallowEqual(prev.item, next.item) &&
    shallowEqual(prev.group, next.group) &&
    shallowEqual(prev.options, next.options)
  );
});

// 渲染表单
export function renderFormItem<TRow = any>(item: AbstractFormItemType<TRow> | FunctionItemType<TRow>, options: DynamicProps<TRow>, span?: number, group?: AbstractFormGroupItemType<TRow>, index?: number) {
  return <PuredFormItem key={`form-group-item-${index || 0}-${item.name}`} options={options} item={item} span={span} group={group} />;
};

// 渲染一个自定义布局表单
export function renderFreeFunction<TRow = any>(item: FunctionItemType<TRow>, group: AbstractFormGroupItemType<TRow>, props: DynamicProps<TRow>) {
  return (
    <Col
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
export function renderNormalLayoutInput<TRow = any>(item: AbstractFormItemType<TRow>, props: DynamicProps<TRow>, span?: number, group?: AbstractFormGroupItemType<TRow>) {
  const { formItemLayout, rules, formItemCls } = props;
  const title = item.render2 ? '' : item.title;
  const layout = group?.layout;
  const itemStyle = group?.itemStyle;
  const layout2 = title ? item.layout || layout || formItemLayout || defaultFormItemLayout : {};
  const num = 24 / span;
  const name = item.name instanceof Array ? item.name.join('.') : item.name;
  const itemRules = (rules || {})[name];
  const colOption = {
    span: item.span || span || 24,
    offset: item.offset,
    className: `${num <= 3 ? 'three' : 'than-three'} ${formItemCls}`,
  };
  return (
    <React.Fragment>
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

export function shallowEqual(source: object, target: object, exclude?: Record<string, boolean>) {
  if (!source || !target) {
    return false;
  }
  const keys = Object.keys(target);
  const keys2 = Object.keys(source);
  exclude = exclude || {};
  if (keys.length !== keys2.length) {
    return false;
  }
  return keys.every((key) => (source[key] === target[key] || exclude[key]));
}