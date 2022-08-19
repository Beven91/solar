
/**
 * @name Dynamic
 * @description 一个表单生成视图
 */
import React from 'react';
import { Row, Col, Tabs, Input, Form } from 'antd';
import { FormInstance } from 'antd/lib/form';
import memoizeOne from 'memoize-one';
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
  // 默认跨列数
  span?: number
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
  // 如果分组风格为tabs其对应的tabs类型
  tabType?: 'line' | 'card'
  // 如果分组风格为tabs其对应的tabs位置
  tabPosition?: 'top' | 'left' | 'bottom' | 'right'
  // 如果分组风格为tabs其对应的tabs间隔
  tabBarGutter?: number
  // 让指定表单获取焦点，仅在初始化时有效
  autoFocus?: string
}

export interface DynamicState {
  activeIndex: number
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

export default class Dynamic<TRow extends AbstractRow> extends React.Component<React.PropsWithChildren<DynamicProps<TRow>>, DynamicState> {
  static defaultProps = {
    rules: {},
    model: {},
    wrapper: true,
    formItemLayout: null as any,
    isReadOnly: false,
  };

  plainFields = {} as Record<string, number>;

  accessedKeys = {} as Record<string, boolean>;

  timerId: ReturnType<typeof setTimeout>;

  state: DynamicState = {
    activeIndex: 0,
  };

  // 是否为只读模式
  get isReadOnly() {
    return this.props.isReadOnly;
  }

  get controlRules() {
    return [
      (form: FormInstance) => {
        return {
          validator: () => {
            return new Promise<void>((resolve, reject) => {
              clearTimeout(this.timerId);
              this.timerId = setTimeout(() => {
                const ok = this.checkTabsValidator(form);
                ok ? resolve() : reject('tab validator');
              }, 20);
            });
          },
        };
      },
    ];
  }

  checkTabsValidator(form: FormInstance) {
    const errorField = form.getFieldsError().filter((m) => m.errors?.length > 0)[0];
    const key = Object.keys(this.accessedKeys).find((k) => this.accessedKeys[k] == false);
    if (!key && !errorField) {
      return true;
    }
    if (errorField) {
      this.toggleActiveIndex(this.plainFields[errorField.name.join('.')]);
    } else if (key) {
      this.toggleActiveIndex(key, () => form.submit());
    }
    return false;
  }

  // 获取tabs风格的分组表单
  getTabGroups = memoizeOne((groups: AbstractGroups<TRow>, rules: AbstractRules) => {
    const normal = [] as Array<AbstractFormItemType<TRow>>;
    const tabs = [{ group: '', items: normal }] as AbstractFormGroupItemType<TRow>[];
    groups.forEach((group) => {
      if ('group' in group) {
        tabs.push(group);
      } else {
        normal.push(group as AbstractFormItemType<TRow>);
      }
    });
    const tabGroups = tabs.filter((tab) => tab.items?.length > 0);
    tabGroups.forEach((group, index) => {
      group.items.forEach((item) => {
        this.plainFields[item.name.toString()] = index;
      });
      if (!group.items.find((item) => rules[item.name.toString()])) {
        // 如果当前分组，么有配置校验规则，则标记成当前tab已访问。
        this.accessedKeys[index] = true;
      } else {
        this.accessedKeys[index] = index == this.state.activeIndex;
      }
    });
    return tabGroups;
  });

  toggleActiveIndex(index: string | number, callback?: () => void) {
    this.accessedKeys[index.toString()] = true;
    this.setState({ activeIndex: Number(index) }, callback);
  }

  // 渲染分组
  renderGroup(groupItem: AbstractFormGroupItemType<TRow>, index: number) {
    const { group, items, span } = groupItem;
    if (!('group' in groupItem)) {
      return this.renderFormItem(groupItem as any, this.props.span);
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
            {items.map((item) => this.renderFormItem(item, span || this.props.span, groupItem.layout))}
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
    const title = item.render2 ? '' : item.title;
    const layout2 = title ? item.layout || layout || formItemLayout || defaultFormItemLayout : {};
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
        autoFocusAt={this.props.autoFocus}
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

  renderStyle() {
    switch (this.props.groupStyle) {
      case 'tabs':
        return this.renderTabs();
      default:
        return this.renderNorml();
    }
  }

  renderTabs() {
    const { tabPosition, tabType, groups, rules, tabBarGutter } = this.props;
    const tabGroups = this.getTabGroups(groups, rules);
    return (
      <React.Fragment>
        <Tabs
          activeKey={this.state.activeIndex.toString()}
          type={tabType}
          tabPosition={tabPosition}
          tabBarGutter={tabBarGutter}
          onChange={(activeKey) => this.toggleActiveIndex(activeKey)}
        >
          {
            tabGroups.map((group, index) => {
              return (
                <Tabs.TabPane tab={<div>{group.icon}{group.group || index}</div>} key={index}>
                  <Row className="tabs-group-form-inner" gutter={8}>
                    {group.items?.map((item) => this.renderFormItem(item, group.span || this.props.span, group.layout))}
                  </Row>
                </Tabs.TabPane>
              );
            })
          }
        </Tabs>
        <Form.Item name="tabsValidator" rules={this.controlRules} style={{ display: 'none' }} >
          <Input type="hidden" />
        </Form.Item>
      </React.Fragment>
    );
  }

  renderNorml() {
    const { wrapper, groups = [], children } = this.props;
    const node = groups.map((groupItem, index) => this.renderGroup(groupItem as any, index));
    if (!wrapper) {
      return node;
    }
    return (
      <React.Fragment>
        <Row gutter={8}>
          {node}
          {this.props.formChildren}
        </Row>
        {children}
      </React.Fragment>
    );
  }

  // 渲染
  render() {
    return (
      <div className={`abstract-form ${this.isReadOnly ? 'readonly' : ''}`}>
        {this.renderStyle()}
      </div>
    );
  }
}

