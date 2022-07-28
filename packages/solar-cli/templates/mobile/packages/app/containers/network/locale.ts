/**
 * @name：NetworkLocale
 * @description
 *   服务接口业务异常提示定制化
 *   用于提供指定服务接口，失败时的异常消息
 */

export interface ErrorCode {
  [propName: string]: string
}

/**
 * 获取指定接口，对应的接口异常消息
 * @param {Object} code 对应的stateItem.code
 */
export function getMessage(code: string) {
  return errorCode[code];
}

const errorCode: ErrorCode = {
  '403': '登录已过期，请重新登录',
};

export default {
  getMessage,
};
