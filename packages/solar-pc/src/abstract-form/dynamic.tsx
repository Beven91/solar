
/**
 * @name Dynamic
 * @description 一个表单生成视图
 */
import React from 'react';
import { Row, Col } from 'antd';
import { FormInstance } from 'antd/lib/form';
import FormGroup from '../form-group';
import FormItem from './Item';
import {
  AbstractFormGroupItemType, AbstractGroups,
  AbstractFormItemType, AbstractFormLayout, AbstractRules,
  FunctionItemType, FormGroupStyle, onValuesChangeHandler, AbstractRow,
} from '../interface';

export interface DynamicProps<TRow> {
  // 是否使用外包裹
  wrapper?: boolean
  // 数据
  model: TRow
  // 表单配置
  groups: AbstractGroups<TRow>
  // 统一表单布局配置
  formItemLayout?: AbstractFormLayout
  // 校验规则
  rules?: AbstractRules
  // 是否为查看模式
  isReadOnly?: boolean
  // antd的form对象
  form: React.RefObject<FormInstance>
  // 表单组展示模式
  groupStyle?: FormGroupStyle
  // 表单值发生改变时间
  onValuesChange?: onValuesChangeHandler
  // 拼接在表单控件后的字元素
  formChildren?: React.ReactNode
}

const defaultFormItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};

export default class Dynamic<TRow extends AbstractRow> extends React.Component<React.PropsWithChildren<DynamicProps<TRow>>> {
  static defaultProps = {
    rules: {},
    model: {},
    wrapper: true,
    span: 4,
    formItemLayout: null as any,
    isReadOnly: false,
  };

  // 是否为只读模式
  get isReadOnly() {
    return this.props.isReadOnly;
  }

  // 渲染分组
  renderGroup(groupItem: AbstractFormGroupItemType<TRow>, index: number) {
    const { group, items, span } = groupItem;
    if (!group) {
      return this.renderFormItem(groupItem as any);
    }
    const className = index === 0 ? 'first-group' : '';
    return (
      <Col span={24} key={`from-group-${index}`}>
        <FormGroup
          mode={groupItem.mode || this.props.groupStyle}
          icon={groupItem.icon}
          group={groupItem}
          title={group}
          form={this.props.form}
          model={this.props.model}
          className={className}
        >
          <Row gutter={24}>
            {items.map((item) => this.renderFormItem(item, span, groupItem.layout))}
          </Row>
        </FormGroup>
      </Col>
    );
  }

  // 渲染表单
  renderFormItem(item: AbstractFormItemType<TRow>, span?: number, layout?: AbstractFormLayout) {
    if (typeof item === 'function') {
      return this.renderFreeFunction(item);
    }
    return this.renderNormalLayoutInput(item, span, layout);
  }

  // 渲染一个自定义布局表单
  renderFreeFunction(item: FunctionItemType<TRow>) {
    return (
      <Col
        key={`form-group-item-${item.name}`}
        span={24}
      >
        {item(this.props.model as TRow, this.isReadOnly)}
      </Col>
    );
  }

  // 渲染常规布局表单
  renderNormalLayoutInput(item: AbstractFormItemType<TRow>, span?: number, layout?: AbstractFormLayout) {
    const { formItemLayout, rules } = this.props;
    const layout2 = item.title ? item.layout || layout || formItemLayout || defaultFormItemLayout : {};
    const num = 24 / span;
    const name = item.name instanceof Array ? item.name.join('.') : item.name;
    const itemRules = rules[name];
    const colOption = {
      span: item.span || span || 24,
      className: num <= 3 ? 'three' : 'than-three',
    };
    return (
      <FormItem
        layout={layout2}
        item={item}
        key={`form-group-item-${item.name}`}
        colOption={colOption}
        onValuesChange={this.props.onValuesChange}
        isReadOnly={this.props.isReadOnly}
        form={this.props.form}
        rules={itemRules}
        model={this.props.model}
      />
    );
  }


  // 渲染
  render() {
    const { wrapper, groups = [], children } = this.props;
    const node = groups.map((groupItem, index) => this.renderGroup(groupItem as any, index));
    if (!wrapper) {
      return node;
    }
    return (
      <div className={`abstract-form ${this.isReadOnly ? 'readonly' : ''}`}>
        <Row gutter={24}>
          {node}
          {this.props.formChildren}
        </Row>
        {children}
      </div>
    );
  }
}

