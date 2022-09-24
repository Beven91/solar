const cacheResources = {};

export default class Resurces {
  /**
   * 加载资源
   * @param url js资源文件
   */
  static loadJs(url) {
    const id = url.toLocaleLowerCase();
    if (cacheResources[id] != null) {
      return Promise.resolve(cacheResources[id])
    }
    return cacheResources[id] = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.onload = resolve;
      script.onerror = reject;
      script.src = url;
      document.head.appendChild(script);
    });
  }

  /**
   * 加载css
   */
  static loadCss(url) {
    const id = url.toLocaleLowerCase();
    if (cacheResources[id] != null) {
      return Promise.resolve(cacheResources[id])
    }
    return cacheResources[id] = new Promise((resolve) => {
      const link = document.createElement('link');
      link.href = url;
      link.type = 'text/css';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
      resolve({});
    });
  }

  static loadResources(resourceUrls) {
    let promise = Promise.resolve({});
    resourceUrls.forEach((url) => {
      if (/\.js/.test(url)) {
        promise = promise.then(() => this.loadJs(url))
      } else {
        promise = promise.then(() => this.loadCss(url))
      }
    })
    return promise;
  }
}