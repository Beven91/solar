/**
 * @name AbstractForm
 * @description 一个表单生成视图
 */
import './index.scss';
import React from 'react';
import Dynamic from './dynamic';
import register, { ValueConverter } from './register';
import { AbstractGroups, AbstractFormLayout, AbstractRules as AbstractRules, FormGroupStyle, onValuesChangeHandler, AbstractRow } from '../interface';
import { FormInstance } from 'antd/lib/form';
import FormContext from './context';
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
  // 拼接在表单控件后的字元素
  formChildren?: React.ReactNode
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
    register.registerConverter(name, converter);
  }

  // 渲染
  render() {
    return (
      <FormContext.Consumer>
        {(context) => <Dynamic {...context} {...this.props} />}
      </FormContext.Consumer>
    );
  }
}

