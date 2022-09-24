
export default {
  install(Vue, options) {
    Vue.mixin({
      created() {
        const originalCreateElement = this.$createElement;
        const originalCreateElement2 = this._self._c;

        const isolateVueAppCss = function (props, name) {
          props = props || {}
          if (typeof name != 'string' || name != name.toLocaleLowerCase()) {
            return props
          };
          if (props.attrs && props.attrs.class) {
            const css = props.attrs.class || '';
            props.attrs.class = css ? css + ' vue' : 'vue';
            return props;
          }
          if (props instanceof Array) {
            props = {
              children: props,
            }
          }
          const css = props.staticClass || '';
          props.staticClass = css ? css + ' vue' : 'vue';
          return props;
        }

        this._self._c = function (name, props, ...params) {
          if (props instanceof Array) {
            const children = props;
            props = isolateVueAppCss({}, name);
            return originalCreateElement2.call(this, name, props, children, ...params)
          } else {
            props = isolateVueAppCss(props, name);
            return originalCreateElement2.call(this, name, props, ...params)
          }
        }
        this.$createElement = function (name, props, ...params) {
          if (props instanceof Array) {
            const children = props;
            props = isolateVueAppCss({}, name);
            return originalCreateElement.call(this, name, props, children, ...params)
          } else {
            props = isolateVueAppCss(props, name);
            return originalCreateElement.call(this, name, props, ...params)
          }
        }
      },
    })
  }
}