
/**
 * @name Dynamic
 * @description 一个表单生成视图
 */
import React, { useEffect, useMemo, useState } from 'react';
import { Row, Col, Tabs, Input, Form } from 'antd';
import { FormInstance } from 'antd/lib/form';
import FormGroup from '../form-group';
import FormItem from './Item';
import {
  AbstractFormGroupItemType, AbstractGroups,
  AbstractFormItemType, AbstractFormLayout, AbstractRules,
  FunctionItemType, FormGroupStyle, onValuesChangeHandler, AbstractRow, FormItemLayout, AbstractGroupItem,
} from '../interface';

export interface DynamicProps<TRow> {
  // 是否使用外包裹
  wrapper?: boolean
  // 数据
  model?: TRow
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
  // 初始化的tab焦点
  defaultActiveIndex?: number
  // 表单项样式名
  formItemCls?: string
  // 表单容器外在宽度
  containerWidth?: number
  // 表单项底部间距模式
  itemStyle?: React.CSSProperties
  // 当某一规则校验不通过时，是否停止剩下的规则的校验。设置 parallel 时会并行校验
  validateFirst?: boolean | 'parallel'
}

export interface DynamicState {
  activeIndex: number
}

const defaultFormItemLayout: FormItemLayout = {
  labelCol: {
    span: 5,
  },
  wrapperCol: {
    span: 16,
  },
};

const defaultFormItemLayout2: FormItemLayout = {
  labelCol: {
    span: 5,
  },
  wrapperCol: {
    span: 17,
  },
};

export default function Dynamic<TRow extends AbstractRow>({
  rules = {},
  model = {} as TRow,
  wrapper = true,
  ...props
}: React.PropsWithChildren<DynamicProps<TRow>>) {
  const groups = props.groups || [];
  const [plainFields] = useState<Record<string, number>>({});
  const [accessedKeys] = useState<Record<string, boolean>>({});
  const [memo] = useState({ callback: () => { } });
  const [activeIndex, setActiveIndex] = useState(props.defaultActiveIndex || 0);

  useEffect(() => {
    if (memo.callback) {
      memo.callback();
      memo.callback = null;
    }
  }, [activeIndex]);

  // 是否为只读模式
  const getIsReadOnly = (group: AbstractFormGroupItemType<TRow>) => {
    return props.isReadOnly || group?.readonly;
  };

  const getDefaultFormLayout = () => {
    const width = props.containerWidth;
    const isMini = width > 0 && width <= 500;
    return isMini ? defaultFormItemLayout2 : defaultFormItemLayout;
  };

  const controlRules = [
    (form: FormInstance) => {
      return {
        validator: () => {
          return new Promise<void>((resolve, reject) => {
            setTimeout(() => {
              const ok = checkTabsValidator(form);
              ok ? resolve() : reject('tab validator');
            }, 20);
          });
        },
      };
    },
  ];

  const toggleActiveIndex = (index: string | number) => {
    accessedKeys[index.toString()] = true;
    setActiveIndex(Number(index));
  };

  const checkTabsValidator = (form: FormInstance) => {
    const errorField = form.getFieldsError().filter((m) => m.errors?.length > 0)[0];
    const key = Object.keys(accessedKeys).find((k) => accessedKeys[k] == false);
    if (!key && !errorField) {
      return true;
    }
    if (errorField) {
      toggleActiveIndex(plainFields[errorField.name.join('.')]);
    } else if (key) {
      memo.callback = () => {
        setTimeout(() => form.submit?.(), 20);
      };
      toggleActiveIndex(key);
    }
    return false;
  };

  // 获取tabs风格的分组表单
  const tabGroups = useMemo(() => {
    if (props.groupStyle != 'tabs') return [];
    const normal = [] as Array<AbstractFormItemType<TRow>>;
    const tabs = [{ group: '', items: normal }] as AbstractFormGroupItemType<TRow>[];
    groups.forEach((group) => {
      if ('group' in group) {
        tabs.push(group);
      } else {
        normal.push(group as AbstractFormItemType<TRow>);
      }
    });
    Object.keys(accessedKeys).forEach((k) => {
      delete accessedKeys[k];
    });
    const tabGroups = tabs.filter((tab) => tab.items?.length > 0);
    tabGroups.forEach((group, index) => {
      group.items.forEach((item) => {
        plainFields[item.name?.toString()] = index;
      });
      accessedKeys[index] = index == activeIndex;
    });
    return tabGroups;
  }, [props.groupStyle, groups.map((g: any) => g.group || g.name).join('-')]);


  // 渲染分组
  const renderGroup = (groupItem: AbstractFormGroupItemType<TRow>, index: number) => {
    const { group, items, span } = groupItem;
    if (!('group' in groupItem)) {
      return renderFormItem(groupItem as any, props.span, null, index);
    }
    const classNames = [] as string[];
    if (index == 0) {
      classNames.push('first-group');
    }
    if (groupItem.readonly) {
      classNames.push('readonly');
    }
    return (
      <Col
        className="abstract-form-group-wrapper"
        data-name={groupItem.group}
        data-group-id={groupItem.group}
        span={24}
        key={`from-group-${groupItem.group}-${index}`}
      >
        <FormGroup
          noLeftPadding={props.groupStyle == 'normal'}
          mode={groupItem.mode || props.groupStyle}
          icon={groupItem.icon}
          group={groupItem}
          title={group}
          form={props.form}
          model={model}
          className={`abstract-form-group ${classNames.join(' ')}`}
        >
          <Row gutter={24}>
            {items?.map((item, i) => renderFormItem(
              item,
              span || props.span,
              groupItem,
              i
            ))}
          </Row>
        </FormGroup>
      </Col>
    );
  };

  // 渲染表单
  const renderFormItem = (item: AbstractGroupItem<TRow>, span?: number, group?: AbstractFormGroupItemType<TRow>, index?: number) => {
    if (typeof item === 'function') {
      return renderFreeFunction(item, group, index);
    }
    return renderNormalLayoutInput(item as AbstractFormItemType<TRow>, span, group, index);
  };

  // 渲染一个自定义布局表单
  const renderFreeFunction = (item: FunctionItemType<TRow>, group: AbstractFormGroupItemType<TRow>, index: number) => {
    return (
      <Col
        key={`form-group-item-${index || 0}-${item.name}`}
        span={24}
      >
        {item(model, getIsReadOnly(group))}
      </Col>
    );
  };

  // 渲染常规布局表单
  const renderNormalLayoutInput = (item: AbstractFormItemType<TRow>, span?: number, group?: AbstractFormGroupItemType<TRow>, i?: number) => {
    const { formItemLayout } = props;
    const title = item.render2 ? '' : item.title;
    const layout = group?.layout;
    const itemStyle = group?.itemStyle;
    const layout2 = title ? item.layout || layout || formItemLayout || getDefaultFormLayout() : {};
    const num = 24 / span;
    const name = item.name instanceof Array ? item.name.join('.') : item.name;
    const itemRules = (rules || {})[name];
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
          isReadOnly={getIsReadOnly(group)}
          form={props.form}
          rules={itemRules}
          validateFirst={props.validateFirst}
          model={model}
          style={{
            ...(props.itemStyle || {}),
            ...(itemStyle || {}),
            ...((item as any).itemStyle || {}),
          }}
        />
      </React.Fragment>
    );
  };

  const renderStyle = () => {
    switch (props.groupStyle) {
      case 'tabs':
        return renderTabs();
      default:
        return renderNorml();
    }
  };

  const renderTabs = () => {
    const { tabPosition, tabType, tabBarGutter } = props;
    const items = tabGroups.map((group, index) => {
      return {
        key: `${index}`,
        label: <div>{group.icon}{group.group || index}</div>,
        children: (
          <Row className="tabs-group-form-inner" gutter={8}>
            {group.items?.map((item) => renderFormItem(item, group.span || props.span, group, index))}
          </Row>
        ),
      };
    });
    return (
      <React.Fragment>
        <Tabs
          className="abstract-form-tabs"
          tabBarStyle={{ paddingLeft: 20 }}
          activeKey={activeIndex.toString()}
          type={tabType}
          tabPosition={tabPosition}
          tabBarGutter={tabBarGutter}
          onChange={(activeKey) => toggleActiveIndex(activeKey)}
          items={items}
        >
        </Tabs>
        <Form.Item name="tabsValidator" rules={controlRules} style={{ display: 'none' }} >
          <Input type="hidden" />
        </Form.Item>
      </React.Fragment>
    );
  };

  const renderNorml = () => {
    const { groups = [], children } = props;
    const node = groups.map((groupItem, index) => renderGroup(groupItem as any, index));
    if (!wrapper) {
      return node;
    }
    return (
      <React.Fragment>
        <Row className="abstract-form-normal-inner" gutter={8}>
          {node}
          {props.formChildren}
        </Row>
        {children}
      </React.Fragment>
    );
  };

  // 渲染
  return (
    <div className={`abstract-form ${props.isReadOnly ? 'readonly' : ''}`}>
      {renderStyle()}
    </div>
  );
}

