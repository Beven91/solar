
/**
 * @module AbstractTableService
 * @description 测试辅助service
 */
import users from '../data/user.json';
import departments from '../data/department.json';
import { PlainObject, AbstractResponseModel } from '../../../src/interface';

class QueryHelper {
  searchers: PlainObject

  query: PlainObject

  constructor(searchers: PlainObject, query: PlainObject) {
    query = query || {};
    this.searchers = Object.keys(searchers).filter((s) => query[s]).map((k) => {
      const handler = searchers[k];
      return (row: any) => handler(row, query[k]);
    });
    this.query = query;
  }

  filter(rows: Array<any>) {
    const searchers = this.searchers;
    let returnRows = rows;
    const { pageSize, pageNum, sort, order } = this.query;
    const start = (pageNum - 1) * pageSize;
    if (sort) {
      // 排序
      returnRows = returnRows.sort((a, b) => {
        const v = a[sort];
        const v2 = b[sort];
        const isDesc = order === 'descend';
        if (v == v2) {
          return 0;
        } else if (v < v2) {
          return isDesc ? 1 : -1;
        }
        return isDesc ? -1 : 1;
      });
    }
    // 按照条件查询
    if (searchers.length > 0) {
      returnRows = returnRows.filter((row) => {
        return searchers.filter((handler: any) => !handler(row)).length <= 0;
      });
    }
    // 返回分页数据
    return { count: returnRows.length, models: returnRows.slice(start, start + pageSize) };
  }
}

class AbstractTableService {
  queryAll(query: PlainObject) {
    const rules = {
      name: (row: any, v: any) => (row.name || '').indexOf(v) === 0,
      status: (row: any, v: any) => row.status == v,
      sex: (row: any, v: any) => row.status == v,
      department: (row: any, v: any) => row.department == v,
    };
    const queryer = new QueryHelper(rules, query);
    return delayReturn(queryer.filter(users.models));
  }

  queryDepartment(query?: PlainObject) {
    const rules = {
      name: (row: any, v: any) => (row.name || '') == v,
    };
    console.log(query);
    const queryer = new QueryHelper(rules, query);
    return delayReturn(queryer.filter(departments.models));
  }
}

function delayReturn(data: AbstractResponseModel) {
  return new Promise<AbstractResponseModel>((resolve) => {
    setTimeout(() => resolve(data), (Math.random() * 500 + 200));
  });
}


export default new AbstractTableService();
