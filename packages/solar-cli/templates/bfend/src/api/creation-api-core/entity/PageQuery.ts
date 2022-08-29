import { ApiModel, ApiModelProperty } from 'node-web-mvc';
import { Op } from 'sequelize';

@ApiModel({ description: '分页查询实体' })
export default class PageQuery<T = any> {
  constructor() {
    this.query = this.query || {} as T;
  }

  @ApiModelProperty({ value: '当前页码值', example: 1 })
  public pageNum: number

  @ApiModelProperty({ value: '页码值', example: 10 })
  public pageSize: number

  @ApiModelProperty({ value: '查询参数', example: {} })
  public query?: T

  public sort?: string

  public order?: string

  static createQueryRule(op: any, value: any, where: any, key: string) {
    if (op == Op.like) {
      const query = {} as Record<typeof Op.or, any>;
      const values = value instanceof Array ? value : value?.split(',');
      where[Op.and] = [query];
      query[Op.or] = values.map((item: string) => {
        return {
          [key]: {
            [Op.like]: `%${String(item)}%`,
          },
        };
      });
    } else {
      where[key] = {
        [op]: value,
      };
    }
  }

  static createQuery(pageQuery: PageQuery, opOption?: { [propName: string]: any }, order?: any[]) {
    const { pageNum, pageSize, query } = pageQuery;
    const page = isNaN(pageNum) ? 1 : pageNum;
    const limit = Math.max(isNaN(pageSize) ? 10 : pageSize, 10);
    opOption = opOption || {};
    if (pageQuery.query) {
      delete pageQuery.query.current;
      delete pageQuery.query.pageSize;
    }
    return {
      limit: limit,
      order: order,
      offset: (page - 1) * limit,
      where: Object.keys(query || {}).reduce((where:Record<string, any>, key) => {
        const v = query[key];
        if (v !== '' && v !== null && v !== undefined) {
          const op = opOption[key];
          if (op) {
            this.createQueryRule(op, v, where, key);
          } else {
            where[key] = v;
          }
        }
        return where;
      }, {}) as any,
    };
  }
}