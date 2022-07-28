import Tunnel from '../tunnel';

interface RuleResult {
  valid: boolean
  message?: string
}

interface ValidationRegistry {
  [propName: string]: (...params: Array<any>) => RuleResult
}

interface ValidationRule {
  required?: string | boolean
  twoRequired?: Array<any>
  [propName: string]: any
}

export interface ValidationRules {
  [propName: string]: ValidationRule
}

const validationRules = {} as ValidationRegistry;

const blankOf = (v: any, dv: any) => {
  return (v === undefined || v === null || v === '') ? dv : v;
};

const isBlank = (v: any) => blankOf(v, '').toString().replace(/\s/g, '') === '';

const format = (message: string, params: any) => {
  return (message || '').toString().replace(/\{\d+\}/g, function(a) {
    const s = params[a.slice(1, -1)];
    return s == null ? a : s;
  });
};

export default class Validation {
  private tunnel: typeof Tunnel

  constructor() {
    this.tunnel = Tunnel.create();
  }

  static validator = new Validation()

  /**
 * 注册一个规则
 * @param name 校验器名称
 * @param defaultMessage 验证失败消息
 * @param handler 校验器函数 返回 true/false
 */
  static register(name: string, defaultMessage: string, handler: Function) {
    if (validationRules[name]) {
      throw new Error(`已存在名称为${name}的校验器`);
    }
    if (typeof handler !== 'function') {
      throw new Error('检验器必须为一个function');
    }
    validationRules[name] = (value, ...params) => {
      const valid = handler(value, ...params);
      // 消息为默认第倒数二个参数，最后一个参数为框架注入de
      const message = params[params.length - 2];
      const formatParams = [
        ...params,
        value,
      ];
      return {
        valid,
        message: format(message || defaultMessage, formatParams),
      };
    };
  }

  /**
   * 绑定一个事件
   * @param {String} name 事件名 可以为: valid invalid
   * @param {Function} handler 事件函数
   */
  on(name: string, handler: Function) {
    return this.tunnel.pull(name, handler);
  }

  /**
   * 移除事件绑定
   */
  off(name: string, handler: Function) {
    this.tunnel.off(name, handler);
  }

  /**
   * 清空绑定的invalid事件
   */
  clear() {
    this.tunnel.off('valid');
    this.tunnel.off('invalid');
  }

  /**
   * 校验指定model
   * @param model object对象
   * @param rules 校验配置
   * @param slient 是否 为静默模式 如果为true 则不触发onInvalid与inValid事件 错误消息可以从currentMessage中取出
   */
  model(model: any, rules: ValidationRules, slient?: boolean) {
    model = model || {};
    rules = rules || {};
    const keys = Object.keys(rules);
    const errors = [];
    for (let i = 0, k = keys.length; i < k; i++) {
      const keyName = keys[i];
      const res = this.attr(keyName, model[keyName], rules, model);
      if (!res.valid) {
        errors.push({ name: keyName, message: res.message });
      }
    }
    const valid = errors.length < 1;
    this.tunnel.push(valid ? 'valid' : 'invalid', errors, slient);
    return valid;
  }

  /**
   * 使用指定验证配置对象验证指定model指定属性
   * @param name 验证属性名称
   * @param value 属性值
   * @param rules 验证配置对象
   * @parma model 上下文对象 可以不填写
   */
  attr(name: string, value: any, rules: ValidationRules, model: any): RuleResult {
    const rule = (rules[name] || {}) as ValidationRule;
    const required = rule.required || rule.twoRequired;
    const noValue = value === '' || value === undefined || value === null;
    if (!required && noValue) {
      // 如果当前字段不是必填字段，且当前字段没有输入值，此时不需要验证其他规则
      return { valid: true };
    }
    const ruleKeys = [
      rule.required ? 'required' : '',
      rule.twoRequired ? 'twoRequired' : '',
      ...Object.keys(rule).filter((v) => {
        return v !== 'required' && v !== 'twoRequired';
      }),
    ].filter((r) => !!r);
    for (let i = 0, k = ruleKeys.length; i < k; i++) {
      const ruleKey = ruleKeys[i];
      const handler = validationRules[ruleKey];
      const data = rule[ruleKey] || [];
      if (!handler) {
        continue;
      }
      const ruleParams = [
        // 当前值
        value,
        // 当前规则配置的参数
        ...(data instanceof Array ? data : [data]),
        // 当前整个表单数据
        model,
      ];
      const res = handler(...ruleParams);
      if (!res.valid) {
        // 校验失败，直接返回
        return res;
      }
    }
    return { valid: true };
  }
}

/**
 * 非空校验器
 * @param value 值
 * @parma message 验证失败消息
 * @returns {boolean} 失败(false)/成功(true)
 */
Validation.register('required', '不能为空', (value: any) => !isBlank(value));

/**
* 二选一必填
* @param v 值
* @param attr 属性名
* @parma message 验证失败消息 可不填
* @param model 上下文对象 v2值来源于model[attr]
* @returns {boolean} 失败(false)/成功(true)
*/
Validation.register('twoRequired', '不能为空', (value: any, attr: string | Function, message: string, model: any) => {
  const value2 = typeof attr === 'function' ? attr() : model[attr];
  return !(isBlank(value) && isBlank(value2));
});

/**
* 邮件校验器
* @param v 值
* @parma message 验证失败消息
* @returns {boolean} 失败(false)/成功(true)
*/
Validation.register('email', '请输入有效的邮箱地址', (value: any) => {
  return /^[a-zA-Z0-9.!#$%&'*+\\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(value);
});


/**
* 数值与小数校验
* @param v 值
* @parma message 验证失败消息 可不填
* @returns {boolean} 失败(false)/成功(true)
*/
Validation.register('number', '请输入有效的数字', (value: any) => {
  return /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(value);
});

/**
* 纯数字校验
* @param v 值
* @parma message 验证失败消息 可不填
* @returns {boolean} 失败(false)/成功(true)
*/
Validation.register('digits', '只能输入数字', (value: any) => {
  return /^\d+$/.test(value);
});

/**
* 最小长度校验器
* @param v 值
* @param min 最小长度
* @parma message 验证失败消息 可不填
* @returns {boolean} 失败(false)/成功(true)
*/
Validation.register('minlength', '最少要输入 {0} 个字符', (value: any, min: number) => {
  return (value).length >= min;
});

/**
* 最大长度校验器
* @param v 值
* @param max 最大长度
* @parma message 验证失败消息 可不填
* @returns {boolean} 失败(false)/成功(true)
*/
Validation.register('maxlength', '最多可以输入 {0} 个字符', (value: any, max: number) => {
  return (value).length <= max;
});

/**
* 长度范围校验
* @param v 值
* param min 最小长度
* param max 最大长度
* @parma message 验证失败消息 可不填
* @returns {boolean} 失败(false)/成功(true)
*/
Validation.register('rangelength', '请输入长度在 {0} 到 {1} 之间的字符串', (value: any, min: number, max: number) => {
  const len = (value).length;
  return len >= min && len <= max;
});

/**
* 最小值校验器
* @param v 值
* @param min 最小值
* @parma message 验证失败消息 可不填
* @returns {boolean} 失败(false)/成功(true)
*/
Validation.register('min', '请输入不小于 {0} 的数值', (value: number, min: number) => {
  return value >= min;
});

/**
* 最大值校验
* @param v 值
* @param max 最大值
* @parma message 验证失败消息 可不填
* @returns {boolean} 失败(false)/成功(true)
*/
Validation.register('max', '请输入不大于 {0} 的数值', (value: any, max: number) => {
  return value <= max;
});

/**
* 值范围校验
* @param v 值
* @param min 最小值
* @param max 最大值
* @parma message 验证失败消息 可不填
* @returns {boolean} 失败(false)/成功(true)
*/
Validation.register('range', '请输入范围在 {0} 到 {1} 之间的数值', (value: any, min: number, max: number) => {
  return value >= min && value <= max;
});

/**
* 手机号校验
* @param v 值
* @parma message 验证失败消息 可不填
* @returns {boolean} 失败(false)/成功(true)
*/
Validation.register('mobile', '请输入有效的手机号码', (value: any) => {
  return /^1[1-9][0-9]\d{8}$/.test(value);
});

/**
* 校验两个值是否相等
* @param v 值
* @param attr 属性名
* @parma message 验证失败消息 可不填
* @param model 上下文对象 v2值来源于model[attr]
* @returns {boolean} 失败(false)/成功(true)
*/
Validation.register('equalTo', '值不匹配', (value: any, attr: string, message: string, model: any) => {
  return value != null && value === (model[attr]);
});

/**
* 校验当前值 是否 小于指定属性值
* @param v 值
* @param attr 属性名
* @parma message 验证失败消息 可不填
* @param model 上下文对象 v2值来源于model[attr]
* @returns {boolean} 失败(false)/成功(true)
*/
Validation.register('minTo', '{1}不能大于{2}', (value: any, attr: string, message: string, model: any) => {
  const v2 = (model[attr]);
  return value != null && Number(value) < Number(v2);
});

/**
* 校验当前值 是否 大于指定属性值
* @param v 值
* @param attr 属性名
* @parma message 验证失败消息 可不填
* @param model 上下文对象 v2值来源于model[attr]
* @returns {boolean} 失败(false)/成功(true)
*/
Validation.register('maxTo', '{1}不能小于{2}', (value: any, attr: string, message: string, model: any) => {
  const v2 = (model[attr]);
  return value != null && Number(value) >= Number(v2);
});

/**
* 中华人民共和国身份证校验
* @param v 值
* @parma message 验证失败消息 可不填
* @param model 上下文对象 v2值来源于model[attr]
* @returns {boolean} 失败(false)/成功(true)
*/
Validation.register('idCard', '无效的身份证号码', (value: string) => {
  const sumNumbers = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
  const verfifyChars = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
  if (value.length == 18) {
    let sum = 0;
    for (let i = 0, k = sumNumbers.length; i < k; i++) {
      sum = sum + Number(value[i]) * sumNumbers[i];
    }
    return verfifyChars[(sum % 11)] === value[17];
  }
  return false;
});
