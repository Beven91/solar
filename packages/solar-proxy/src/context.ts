/**
 * 名称:mock数据全局共享上下文
 * 描述：用于提供mock流程数据构建功能相
 */
const Session = {};

export default class ApplicationContext {
  constructor() {
    // this.sessionId = cookies['msessionid'];
    // if (!this.sessionId) {
    //   this.sessionId = uuid.v1();
    //   Session[this.sessionId] = {};
    //   response.setHeader('set-cookie', `msessionid=${this.sessionId}`);
    // }
    Object.defineProperty(this, 'throwRequired', { writable: false, value: this.throwRequired });
    Object.defineProperty(this, 'toRule', { writable: false, value: this.toRule });
  }

  /**
   * 获取全局数据
   */
  get session() {
    // return Session[this.sessionId];
    return Session;
  }

  /**
   * 校验数据Mock接口传入参数
   * @param {IncommingMessage} req express的request对象
   * @param {Object} parameters 当前mock接口需要的参数
   */
  throwRequired(req: any, parameters: Array<any>) {
    const query = req.query;
    const body = req.body;
    const rule = this.toRule(parameters);
    const data = Object.assign({}, query, body);
    const message = this.validateParameters(data, rule);
    if (message) {
      throw new Error(message);
    }
  }

  validateParameters(data: any, rule: any) {
    const keys = Object.keys(rule);
    const isBlank = (v: any) => (v || '').toString().replace(/\s/g, '') === '';
    const errorKeys = keys.filter((k) => isBlank(data[k]));
    if (errorKeys.length > 0) {
      return '以下参数必须提供:' + errorKeys.join(',');
    }
  }

  /**
   * 转换参数类型为验证模型
   * @param {Object} parameters 当前mock接口需要的参数
   */
  toRule(parameters: Array<any>) {
    parameters = parameters || [];
    const rule = {} as any;
    for (const i in parameters) {
      if (i) {
        rule[i] = { required: `${i}参数必须提供` };
      }
    }
    return rule;
  }
}
