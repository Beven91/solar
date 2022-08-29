/**
 * @module GeneralResult
 * @description 接口统一返回结果
 */
import BusinessEnum from '../enums/BusinessEnum';
import { ApiModel, ApiModelProperty } from 'node-web-mvc';

interface ErrorCode {
  code: string
  message: string
}

@ApiModel({ description: '返回数据' })
export default class GeneralResult<T = any> {
  /**
   * 返回的：业务编码
   */
  @ApiModelProperty({ value: '业务编码 0：表示成功，其他表示相关异常' })
  public errorCode: BusinessEnum

  /**
   * 返回的消息
   */
  @ApiModelProperty({ value: '业务处理返回的消息' })
  public errorMsg: string

  /**
   * 返回的数据
   */
  @ApiModelProperty({ value: '业务处理返回的数据', generic: true })
  public result: T

  @ApiModelProperty({ value: '当前业务是否成功' })
  public success: boolean

  /**
   * 返回一个表示处理成功的结果
   * @param data 返回结果
   */
  static success(data: any) {
    return new GeneralResult(BusinessEnum.SUCCESS, data);
  }

  /**
   * 返回一个表示处理异常的接口
   * @param code 可未异常对象或者异常编码
   * @param message 自定义异常消息
   */
  static fail(code: number | BusinessEnum | ErrorCode | Error, message?: string) {
    const errorCode = code as any;
    if (code instanceof Error || (errorCode && errorCode.code)) {
      // 如果传入的code是一个异常对象，则解析error进行构建
      const data = code as any;
      const errorCode = 'code' in data ? data.code : BusinessEnum.ERROR;
      return new GeneralResult(errorCode, null, data.message);
    }
    return new GeneralResult(code as any, null, message);
  }

  /**
   * 构造一个统一返回结果实例
   * @param code 返回结果编码
   * @param data 返回数据
   * @param message 返回的消息
   */
  constructor(code: BusinessEnum, data?: any, message?: string) {
    this.errorCode = code;
    this.errorMsg = message;
    this.result = data;
    this.success = code == 0;
  }
}