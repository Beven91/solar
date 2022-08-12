import { AbstractGroups, AbstractRow } from '../interface';

export interface RegistrationBase {
  /**
    * 控件名称
    */
  name: string
  /**
   * 控件配置属性组
   */
  options?: AbstractGroups<AbstractRow>
}

interface RegistrationMaps<T> {
  [x: string]: T
}

export default class Registrations<T extends RegistrationBase> {
  private registrations: RegistrationMaps<T>;

  constructor() {
    this.registrations = {};
  }

  register(registration: T | T[]) {
    const elements = (registration instanceof Array ? registration : [registration]);
    elements
      .filter(Boolean)
      .forEach((item) => {
        this.registrations[item.name] = item;
      });
  }

  getRegistration(name:string) {
    return this.registrations[name];
  }

  getAllRegistrations() {
    return Object.keys(this.registrations).map((x) => {
      return this.registrations[x];
    });
  }
}