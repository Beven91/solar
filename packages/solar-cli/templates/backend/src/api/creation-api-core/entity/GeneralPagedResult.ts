/**
 * @module GeneralPagedResult
 * @description 统一返回分页结果实体类
 */
import BusinessEnum from '../enums/BusinessEnum';
import { ApiModel, ApiModelProperty } from 'node-web-mvc';
import PagedEntity from './PagedEntity';

@ApiModel({ description: '分页数据' })
export default class GeneralPagedResult<T> {
  /**
   * 返回的：业务编码
   */
  @ApiModelProperty({ value: '业务编码 0：表示成功，其他表示相关异常' })
  public code: BusinessEnum

  /**
   * 返回的消息
   */
  @ApiModelProperty({ value: '业务处理返回的消息' })
  public message: string

  /**
   * 返回的数据
   */
  @ApiModelProperty({ value: '业务处理返回的数据', dataType: 'PagedEntity<1>' })
  public result: PagedEntity<T>

  /**
   * 返回一个分页结果对象
   * @param
   */
  static success<M>(data: { rows: Array<M>, count: number, options?: any }, pageId: number, size: number) {
    const hasMore = pageId * size < data.count;
    const count = isNaN(data.count) ? 0 : data.count;
    return new GeneralPagedResult(BusinessEnum.SUCCESS, {
      options: data.options,
      models: data.rows || [],
      count: count,
      hasMore: hasMore,
      pageNum: pageId,
      totalPage: Math.ceil(count / size),
      pageSize: size,
    });
  }

  /**
   * 返回一个表示处理异常的接口
   * @param code 可未异常对象或者异常编码
   * @param message 自定义异常消息
   */
  static fail(code: number | BusinessEnum | Error, message: string) {
    if (code instanceof Error) {
      // 如果传入的code是一个异常对象，则解析error进行构建
      const data = code as any;
      const errorCode = 'code' in data ? data.code : BusinessEnum.ERROR;
      return new GeneralPagedResult(errorCode, null, data.message);
    }
    return new GeneralPagedResult(code, message);
  }

  /**
   * 构造一个统一返回结果实例
   * @param code 返回结果编码
   * @param data 返回数据
   * @param message 返回的消息
   */
  constructor(code: BusinessEnum, data?: any, message?: string) {
    this.code = code;
    this.message = message as string;
    this.result = data;
  }
}