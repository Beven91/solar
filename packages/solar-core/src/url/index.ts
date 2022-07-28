
export interface QueryParams {
  [propName: string]: any
}

export default class Url {
  /**
   * 从URL解析出的: 协议
   * 例如: `https` 或 `http`
   */
  public protocol: string

  /**
   * 从URL解析出的: 端口
   * 例如: `8080`
   */
  public port: string

  /**
   * 从URL解析出的: 域名
   * 例如： `www.solar.com`
   */
  public hostname: string

  /**
   * 从URL解析出的: 路径
   * 例如:`/order/list`
   */
  public pathname: string

  /**
   * 从URL解析出的: 查询参数
   * 例如：`name=solar&age=18`
   */
  public search: string

  /**
   * 从URL解析出的: 哈希码路径
   * 例如：`/say/hello`
   */
  public hashPath: string

  /**
   * 从search解析出的: 参数
   */
  public params: QueryParams

  /**
   * 从hash解析出的: 参数
   */
  public hashParams: QueryParams

  constructor(url: string) {
    const hashIndex = url.indexOf('#');
    // 解析出hash
    const hash = hashIndex > -1 ? url.slice(hashIndex + 1, url.length) : '';
    // 不带hash的url
    const url2 = hashIndex > -1 ? url.slice(0, hashIndex) : url;
    const main = this.pathQuery(url2);
    const hashMain = this.pathQuery(hash);
    // 解析出host + path
    const pure = main.path.split('://').pop();
    const pathIndex = pure.indexOf('/');
    const isDomain = /\.(\d|\w)+/.test(pure);
    // 解析出 host
    const hostname = pathIndex > -1 ? pure.slice(0, pathIndex) : (isDomain ? pure : '');
    // 解析出path
    const path = pathIndex > -1 ? pure.slice(pathIndex, pure.length) : (isDomain ? '' : pure);
    const kv = hostname.split(':');
    // 结构复制
    this.hostname = kv[0];
    this.protocol = (/:\/\//.test(main.path) ? main.path.split('://').shift() + '://' : '').replace('//', '');
    this.port = kv[1] || '';
    this.pathname = path;
    this.search = main.query;
    this.hashPath = hashMain.path;
    this.params = this.parseQuery(main.query);
    this.hashParams = this.parseQuery(hashMain.query);
  }

  /**
   * 使用指定对象格式化字符串
   * @param template 模板字符串 `/order/${id}`
   * @param data 模板数据
   * ```js
   * Url.formatObject('/order/${id}',{ id:199 })
   *
   * ```
   */
  static formatObject(template: string, data: QueryParams) {
    if (data && template) {
      template = template.replace(/(\$\{(\d|\w)+\})/g, function(a) {
        return data[a.replace(/\$\{|\}/g, '')];
      });
    }
    return template;
  }

  /**
   * 名称：解析指定url
   */
  static parse(url: string) {
    return new Url(url);
  }

  /**
   * 解析出url中的path与search
   * @param {*} url
   */
  pathQuery(url: string) {
    const index = url.indexOf('?');
    return {
      path: index > -1 ? url.slice(0, index) : url,
      query: index > -1 ? url.slice(index + 1, url.length) : '',
    };
  }

  /**
  * 名称：解析search参数
  */
  parseQuery(search: string) {
    const items = search.split('&');
    const query = {} as QueryParams;
    items.forEach((item) => {
      if (item) {
        const index = item.indexOf('=');
        const key = item.slice(0, index);
        query[key] = item.slice(index + 1);
      }
    });
    return query;
  }

  /**
   * 将参数转换成search
   * @param {*} paras
   */
  stringify(paras: QueryParams) {
    paras = paras || {};
    const items = Object
      .keys(paras)
      .map((key) => `${key}=${paras[key]}`)
      .filter((item) => item);
    return items.length > 0 ? `?${items.join('&')}` : '';
  }

  /**
   * hash url
   */
  get hash() {
    const hash = this.hashPath ? '#' + this.hashPath : '';
    const hashQuery = this.stringify(this.hashParams);
    return hash + hashQuery;
  }


  /**
   * 当前url的完整地址
   */
  get url() {
    const port = this.port ? ':' + this.port : '';
    const protocol = this.protocol ? `${this.protocol}//` : '';
    const query = this.stringify(this.params);
    const pathname = /^\//.test(this.pathname) ? this.pathname : '/' + this.pathname;
    return `${protocol}${this.hostname}${port}${pathname}${query}${this.hash}`;
  }
}
