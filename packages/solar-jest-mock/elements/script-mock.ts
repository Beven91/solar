import path from 'path';

export default function(createElement: Function) {
  const script = createElement('script');
  Object.defineProperties(script, {
    src: {
      get() {
        return this._src;
      },
      set(url) {
        this._src = url;
        setTimeout(() => {
          const id = path.join(__dirname, '..', 'modules', url);
          delete require.cache[require.resolve(id)];
          require(id);
          this.onload && this.onload();
        }, 20);
      },
    },
  });
  return script;
}
