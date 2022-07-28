/**
 * @module Cookie
 * @description cookie解析类
 */

export interface CookieValues {
  [paramName: string]: string
}

class Cookie {
  public cookies: CookieValues;

  /**
   * 创建一个cookie实例
   * @param {String} cookieStr cookie实例
   */
  constructor(cookieStr?: string) {
    const cookies = this.cookies = {} as CookieValues;
    const documentCookie = typeof document === 'object' ? document.cookie : '';
    cookieStr = (arguments.length < 1 ? documentCookie : cookieStr) || '';
    // 解析传入的cookie字符串
    cookieStr.split(';').forEach((cookieKvs) => {
      const kv = cookieKvs.split('=');
      const name = (kv[0]).trim();
      cookies[name] = kv[1];
    });
  }

  /**
   * 根据传入字符串创建解析cookie实例
   */
  parse(cookieStr: string) {
    return new Cookie(cookieStr);
  }

  /**
 * 名称：设置一个cookie
 * @param {String} name cookie 名称
 * @param {String} v cookie 对应的值
 * @param {String} expires 过期时间 可以是一个date类型，或者date类型的字符串
 * @param {String} path cookie路径
 */
  setCookie(name: string, v: string, expires: string | Date, path?: string, domain?: string) {
    if (!name || name.trim() === '') {
      return;
    }
    name = name.trim();
    domain = domain ? ';domain=' + domain : '';
    if (Object.prototype.toString.call(expires) === '[object Date]') {
      expires = (expires as Date).toUTCString();
    }
    if (expires) {
      window.document.cookie = `${name}=${v};expires=${expires};path=${path}${domain}`;
    } else {
      window.document.cookie = `${name}=${v};path=${path}${domain}`;
    }
    this.cookies[name] = v;
  }

  /**
   * 清除指定cookie
   */
  removeCookie(name: string, path?: string) {
    this.setCookie(name, '', (new Date(1)).toUTCString(), path);
  }

  /**
   * 获取指定name的cookie值
   * @param {*} name
   */
  getCookie(name: string) {
    return this.cookies[name];
  }
}

export default new Cookie();
