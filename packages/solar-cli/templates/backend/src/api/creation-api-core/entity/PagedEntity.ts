/**
 * @module PagedEntity
 * @description 分页数据
 */

import { ApiModel, ApiModelProperty } from 'node-web-mvc';

@ApiModel({ description: '数据' })
export default class PagedEntity<T> {
  @ApiModelProperty({ value: '当前总记录数' })
  public count: number

  @ApiModelProperty({ value: '当前页码' })
  public pageNum: number

  @ApiModelProperty({ value: '每页记录数' })
  public pageSize: number

  @ApiModelProperty({ value: '是否还有下一页' })
  public hasMore: boolean

  @ApiModelProperty({ value: '当前页码返回的所有行', generic: true })
  public models: Array<T>
}