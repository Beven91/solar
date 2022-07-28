export interface ErrorCode {
  [propName: string]: string
}

const errorCode = {
  '403': '登录已过期，请重新登录',
} as ErrorCode;

export default errorCode;
