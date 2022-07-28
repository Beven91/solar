import React from 'react';
import { AbstractGroups, AbstractRow } from '../interface';
import defaultRegistration from './registrations';

/**
 * @module InputFactory
 * @description 表单输入项工厂
 */
export interface InputRegistration {
  /**
   * 控件名称
   */
  name:string
  /**
   * 控件配置属性组
   */
  options:AbstractGroups<AbstractRow>
  /**
   * 对应的表单控件类
   */
  component:React.ComponentType | React.ForwardRefExoticComponent<any>
}

export interface InputRegistrations {
  [propName:string]:InputRegistration
}

const registrations:InputRegistrations = {

};

export default class InputFactory {
  /**
   * 获取指定表单元数据信息
   * @param registration
   */
  static getRegistration(name:string) {
    return registrations[name];
  }

  /**
   * 创建指定输入控件实例
   */
  static create(name:string, props:any) {
    const registration = this.getRegistration(name);
    if (!registration || !registration.component) {
      return null;
    }
    const Input = registration.component;
    return <Input {...(props || {})} />;
  }

  /**
   * 注册一个动态表单项
   * @param registration
   */
  static register(registration:InputRegistration | InputRegistration[]) {
    if (registration instanceof Array) {
      registration.forEach((item)=>this.register(item) );
      return;
    }
    if (registration) {
      registrations[registration.name] = registration;
    }
  }
}

InputFactory.register(defaultRegistration);
