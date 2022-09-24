
const adapterKeys = ['assert', 'clear', 'context', 'count', 'countReset', 'dir', 'dirxml', 'error', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log', 'memory', 'profile', 'profileEnd', 'table', 'time', 'timeEnd', 'timeLog', 'timeStamp', 'trace'];

const console = window.console;

class AppCodeboxConsole {
  constructor(hook) {
    this.proxyLogger();
    this.overrideLogger();
    this.hook = hook;
  }

  proxyLogger() {
    adapterKeys.forEach((name) => {
      this[name] = function() {
        const handler = console[name];
        if (typeof handler == 'function') {
          // eslint-disable-next-line prefer-rest-params
          return handler.apply(console, arguments);
        }
      };
    });
  }

  overrideLogger() {
    this.log = this.createLogger('log');
    this.warn = this.createLogger('warn');
    this.info = this.createLogger('info');
    this.error = this.createLogger('error');
    this.warn = this.createLogger('log');
    this.debug = this.createLogger('debug');
  }

  createLogger(type) {
    const scope = this;
    return function() {
      // eslint-disable-next-line prefer-rest-params
      const args = arguments;
      const handler = console[type];
      if (scope.hook.write) {
        scope.hook.write(type, args);
      }
      if (typeof handler == 'function') {
        return handler.apply(console, args);
      }
    };
  }
}

module.exports = AppCodeboxConsole;