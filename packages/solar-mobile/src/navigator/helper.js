/**
 * 名称：pushState辅助工具
 * 描述：记录路由跳转数据，用于判断当前路由(pushstate)是前进还是后台
 */
import './polyfill';
import Storage from './storage';

const name = '@_StateId__@';

let PATHEXTENSION = '';
let PATHROOT = '';
let NavigateMode = 'pushState';

export default class NavigateHelper {
  /**
   * 获取当前的pushStatea对应的state.id
   */
  static getCurrentStateID() {
    return parseInt(Storage.get(name) || 0);
  }

  /**
   * 设置当前pushState的state.id
   * @param {*} id
   */
  static setCurrentStateID(id) {
    Storage.set(name, id);
  }

  /**
   * 設置當前路由模式
   * @param {String} mode 路由模式 pushState hash
   */
  static setMode(mode) {
    NavigateMode = mode;
  }

  /**
   * 設置當前路由模式
   * @param {String} mode 路由模式 pushState hash
   */
  static getMode() {
    return NavigateMode;
  }

  /**
   * 获取页面异常时显示的组件
   */
  static get errorComponent() {
    return this._errorComponent;
  }

  /**
   * 设置页面异常时显示的组件
   */
  static set errorComponent(value) {
    this._errorComponent = value;
  }

  /**
   * 在单页跳转到第N页时，刷新了界面时的路由参数同步
   */
  static getRouteParams() {
    const state = history.state || {};
    const params = state.params || null;
    return JSON.parse(params);
  }

  /**
   * 生成一个新的state.id
   */
  static genStateID() {
    let stateid = this.getCurrentStateID() || '0';
    stateid = isNaN(stateid) ? 0 : stateid;
    return parseInt(stateid) + 1;
  }

  /**
   * 初始化state.id
   */
  static initRoute() {
    const history = window.history;
    const state = history.state;
    const id = (state && !isNaN(state.id) && state.id > 0) ? state.id : this.genStateID();
    this.setCurrentStateID(id);
    if (!state || isNaN(state.id)) {
      const data = (state || {});
      history.replaceState({ ...data, id: id }, '', window.location.href);
    }
  }

  /**
   * 获取当前历史记录对应的路由记录
   */
  static getRouteState() {
    const json = (history.state || {}).state;
    return json ? JSON.parse(json) : null;
  }

  /**
   * 判断当前popstate是前进还是后退
   * 根据当前history.state.id > 上次的state.id 如果为true则会前进 否则后退
   */
  static isForward() {
    const history = window.history;
    const state = history.state || {};
    const isThan = (state && state.id > this.getCurrentStateID());
    return isThan;
  }

  /**
   * 设置路由后缀 例如设置成.html  那么所有路由path默认会拼接.html 例如: path:'login' 那么可以 login.html
   * @param {String} extension 后缀名
   * @param {String} rootPath 默认路由根部分 例如  web/order
   */
  setPathExtension(extension, rootPath = '') {
    PATHEXTENSION = extension;
    PATHROOT = rootPath;
  }

  /**
   * 获取当前路由pathname
   */
  static getWebPath() {
    const pathname = this.getLocationPath();
    const pathRoot = PATHROOT;
    const pathRootIndex = pathname.indexOf(pathRoot);
    if (pathRoot && pathRootIndex > -1) {
      return pathname.substr(pathRootIndex + pathRoot.length);
    }
    return pathname;
  }

  /**
   * 处理路由path后缀
   * @param {*} routeConfigs
   */
  static handlePathExtensions(routeConfigs) {
    const extension = PATHEXTENSION;
    if (extension) {
      Object.keys(routeConfigs).map((k) => {
        const route = routeConfigs[k];
        if (route.path && !route.rest) {
          route.path = route.path + extension;
        }
      });
    }
    return routeConfigs;
  }

  /**
   * 獲取初始化的路由
   */
  static getInitialRouteName() {
    return this.getWebPath().replace(/^\//, '');
  }

  /**
   * 获取PathRoot
   */
  static getPathRoot() {
    return PATHROOT;
  }

  /**
   * 获取当前location.pathname
   */
  static getLocationPath() {
    switch (NavigateMode) {
      case 'hash':
        return window.location.hash.substr(1);
      default:
        return window.location.pathname+location.search;
    }
  }

  /**
   * 跳转到指定url
   * @param {String} url 跳转的目标url
   */
  static push(url, state, stateAll) {
    const id = this.genStateID();
    const params = JSON.stringify(state.params || {});
    const data = this.saveHistory(stateAll);
    window.history.pushState({ id, params, state: data }, state.title, url);
  }

  /**
   * 使用新的id替换当前history.state
   */
  static replace(url, state, stateAll) {
    const id = this.genStateID();
    const params = JSON.stringify(state.params || {});
    const data = this.saveHistory(stateAll);
    window.history.replaceState({ id, params, state: data }, state.path, url);
  }

  /**
   * 存储路由历史记录
   */
  static saveHistory(stateAll) {
    const routes = stateAll.routes || [];
    const routeNames = routes.map((r) => r.routeName);
    return JSON.stringify({ index: stateAll.index, routes: routeNames });
  }
}