import path from 'path';
import fs from 'fs';

Object.defineProperties(HTMLScriptElement.prototype, {
  src: {
    get() {
      return this._src;
    },
    set(url: string) {
      this._src = url;
      setTimeout(() => {
        const name = path.basename(url);
        const id = path.join(__dirname, 'modules', name);
        if (!fs.existsSync(id)) {
          throw new Error('script onload error 请求确定您有定义对应的mock文件 url:' + url + ' ---> mockjs:' + id);
        }
        delete require.cache[require.resolve(id)];
        // mock当前模块
        jest.mock(id);
        require(id);
        this.onload && this.onload();
      }, 50);
    },
  },
});
