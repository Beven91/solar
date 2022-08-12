import React from 'react';
import Registrations, { RegistrationBase } from './Registration';
import defaultRegistration from './registrations';

/**
 * @module InputFactory
 * @description 表单输入项工厂
 */
export interface InputRegistration extends RegistrationBase {
  /**
   * 对应的表单控件类
   */
  component: React.ComponentType | React.ForwardRefExoticComponent<any>
}

export interface InputRegistrations {
  [propName: string]: InputRegistration
}

const registrations = new Registrations<InputRegistration>();

export default class InputFactory {
  static getAllRegistrations() {
    return registrations.getAllRegistrations();
  }

  /**
   * 获取指定表单元数据信息
   * @param registration
   */
  static getRegistration(name: string) {
    return registrations.getRegistration(name);
  }

  /**
   * 创建指定输入控件实例
   */
  static create(name: string, props: any) {
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
  static register(registration: InputRegistration | InputRegistration[]) {
    return registrations.register(registration);
  }
}

InputFactory.register(defaultRegistration);
