/**
 * @module ErrorCode
 * @description 接口异常编码
 */

const ErrorCode = (code: string | number, message: string) => ({ success: false, code, message });

export default {

  PASSWORD_INVALID: ErrorCode('10500', '用户名或者密码错误'),

};