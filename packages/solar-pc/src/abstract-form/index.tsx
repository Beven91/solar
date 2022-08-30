/**
 * @name AbstractForm
 * @description 一个表单生成视图
 */
import './index.scss';
import React from 'react';
import Dynamic from './dynamic';
import register, { ConverterRegistry, ValueConverter } from './register';
import { AbstractGroups, AbstractFormLayout, AbstractRules as AbstractRules, FormGroupStyle, onValuesChangeHandler, AbstractRow } from '../interface';
import { FormInstance } from 'antd/lib/form';
import FormContext from './context';
import AbstractProvider from '../abstract-provider';
import ISolation from './isolation';

// 属性类型定义
export interface AbstractFormProps<TRow> {
  // 表单值发生改变时间
  onValuesChange?: onValuesChangeHandler
  // 当前表单的默认填充值
  model?: TRow
  // antd的formRef对象 不传递formRef情况下，默认会通过context获取form
  form?: React.RefObject<FormInstance>
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
  // 默认跨列数
  span?: number
  // 让指定表单获取焦点，仅在初始化时有效
  autoFocus?: string
  // 拼接在表单控件后的字元素
  formChildren?: React.ReactNode
  // 如果分组风格为tabs其对应的tabs类型
  tabType?: 'line' | 'card'
  // 如果分组风格为tabs其对应的tabs位置
  tabPosition?: 'top' | 'left' | 'bottom' | 'right'
  // 如果分组风格为tabs其对应的tabs间隔
  tabBarGutter?: number
  // 初始化的tab焦点
  defaultActiveIndex?: number
  // 表单项样式名
  formItemCls?: string
}

export default class AbstractForm<TRow extends AbstractRow> extends React.Component<React.PropsWithChildren<AbstractFormProps<TRow>>> {
  // 表单上下文
  static Context = FormContext;

  // 使用一个隔离的抽象表单组
  static ISolation = ISolation;

  /**
   * 注册指定组件的propValueName
   * @param {*} component
   * @param {*} name
   */
  static register(component: React.ComponentType, name: string) {
    register.register(component, name);
  }

  static registerConverter(name: string, converter: ValueConverter) {
    ConverterRegistry.register({
      ...converter,
      name,
    });
  }

  // 渲染
  render() {
    return (
      <AbstractProvider.Consumer>
        {
          (config) => {
            return (
              <FormContext.Consumer>
                {(context) => <Dynamic formItemLayout={config.formItemLayout} {...context} {...this.props} />}
              </FormContext.Consumer>
            );
          }
        }
      </AbstractProvider.Consumer>
    );
  }
}

