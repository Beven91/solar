

export default class BizError extends Error {
  public data: any

  public code: string | number

  public reason: string

  constructor(code: string | number, message?: string, data?: any) {
    super(message);
    this.code = code.toString();
    this.data = data;
  }
}
