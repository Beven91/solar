
/**
 * @name Dynamic
 * @description 一个表单生成视图
 */
import React from 'react';
import { Row, Col } from 'antd';
import FormGroup from '../form-group';
import {
  AbstractFormGroupItemType, AbstractGroups,
  AbstractFormLayout, AbstractRules,
  FormGroupStyle, onValuesChangeHandler, AbstractRow,
} from '../interface';
import { useInjecter } from '../abstract-injecter';
import TabsGroup from './tabs';
import { renderFormItem } from './render';

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
  // 表单组展示模式
  groupStyle?: FormGroupStyle
  // 表单值发生改变时间
  onValuesChange?: onValuesChangeHandler
  // 拼接在表单控件后的字元素
  formChildren?: React.ReactNode
  // 让指定表单获取焦点，仅在初始化时有效
  autoFocus?: string
  // 表单项样式名
  formItemCls?: string
  // 表单容器外在宽度
  containerWidth?: number | string
  // 表单项底部间距模式
  itemStyle?: React.CSSProperties
  // 当某一规则校验不通过时，是否停止剩下的规则的校验。设置 parallel 时会并行校验
  validateFirst?: boolean | 'parallel'
  // 容器名称
  name?: string
  // 是否使用injecter
  inject?: boolean
  // 是否不渲染html节点
  pure?: boolean
  // 默认选中tab下标
  defaultActiveIndex?: number
  // 如果分组风格为tabs其对应的tabs类型
  tabType?: 'line' | 'card'
  // 如果分组风格为tabs其对应的tabs位置
  tabPosition?: 'top' | 'left' | 'bottom' | 'right'
  // 如果分组风格为tabs其对应的tabs间隔
  tabBarGutter?: number
}

export interface DynamicState {
  activeIndex: number
}

export default function Dynamic<TRow extends AbstractRow>({
  wrapper = true,
  pure,
  ...props
}: React.PropsWithChildren<DynamicProps<TRow>>) {
  const groups = props.groups || [];
  const injecter = useInjecter(props.inject);

  // 渲染分组
  const renderGroup = (groupItem: AbstractFormGroupItemType<TRow>, index: number) => {
    const { group, items, span } = groupItem;
    if (!('group' in groupItem)) {
      return renderFormItem(groupItem as any, props, props.span, null, index);
    }
    const classNames = [] as string[];
    if (index == 0) {
      classNames.push('first-group');
    }
    return (
      <Col
        className="abstract-form-group-wrapper"
        data-name={groupItem.group}
        data-group-id={groupItem.group}
        span={24}
        onDoubleClick={(e) => injecter?.listener?.onFieldGroupDbClick?.(groupItem, props.name, e)}
        key={`from-group-${groupItem.group}-${index}`}
      >
        <FormGroup
          noLeftPadding={props.groupStyle == 'normal'}
          mode={groupItem.mode || props.groupStyle}
          icon={groupItem.icon}
          group={groupItem}
          title={group}
          model={props.model}
          className={`abstract-form-group ${classNames.join(' ')}`}
        >
          <Row gutter={24}>
            {items?.map((item, i) => renderFormItem(
              item,
              props,
              span || props.span,
              groupItem,
              i,
            ))}
          </Row>
          {injecter?.node?.appendFormGroup?.(groupItem)}
        </FormGroup>
      </Col>
    );
  };

  const renderWithType = () => {
    switch (props.groupStyle) {
      case 'tabs':
        return <TabsGroup {...props} />;
      default:
        return renderNorml();
    }
  };

  const renderNorml = () => {
    const { groups = [], children } = props;
    const last = groups[groups.length - 1] || {};
    const first = groups[0] || {};
    const lastIsGroup = ('group' in last) || props.name == 'AbstractSearch';
    const firstGroup = ('group' in first);
    const node = (
      <>
        {groups.map((groupItem, index) => renderGroup(groupItem as any, index))}
        {lastIsGroup ? null : injecter?.node?.appendFormGroup?.({ group: undefined })}
      </>
    );
    if (!wrapper) {
      return node;
    }
    return (
      <React.Fragment>
        <Row className={`abstract-form-normal-inner ${firstGroup ? 'with-first-group' : 'not-first-group'} `} gutter={8}>
          {node}
          {props.formChildren}
        </Row>
        {children}
      </React.Fragment>
    );
  };

  if (pure) {
    return (
      <>
        {groups.length < 1 ? props.children : renderWithType()}
      </>
    );
  }

  // 渲染
  return (
    <div className={`abstract-form ${props.isReadOnly ? 'readonly' : ''}`}>
      {renderWithType()}
    </div>
  );
}

