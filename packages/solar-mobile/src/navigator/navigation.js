import "./navigation.css";
import React, { Component } from 'react';
import { PropTypes } from 'prop-types';
import { NavigationActions, addNavigationHelpers } from 'react-navigation';
import RouterView from './router';
import NavigateHelper from './helper';

export default class NavigationViewer extends Component {
  /**
   * 定义子组件共享数据类型
   */
  static childContextTypes = {
    //根据路径和参数获取对应的action
    getActionForPathAndParams: PropTypes.func.isRequired,
    //根据action获取对应的显示的uri字符串
    getURIForAction: PropTypes.func.isRequired,
    //执行action
    dispatch: PropTypes.func.isRequired,
    //导航组件
    navigation: PropTypes.object
  };

  static contextTypes = {
    store: PropTypes.object,
  }

  /**
   * 构造函数
   * @param {*} props 
   */
  constructor(props) {
    super(props);
    this.dispatch = this.dispatch.bind(this);
    this.getActionForPathAndParams = this.getActionForPathAndParams.bind(this);
    this.getURIForAction = this.getURIForAction.bind(this);
    this.status = "init";
    //初始化
    NavigateHelper.initRoute();
  }

  /**
   * 附加404路由action获取
   * @param {*} router 
   */
  static initGetActionForPathAndParams(router) {
    const originalGetActionForPathAndParams = router.getActionForPathAndParams.bind(router);
    router.getActionForPathAndParams = (path, params) => {
      return originalGetActionForPathAndParams(path, params) || NavigationActions.navigate({
        params: { path },
        routeName: 'NotFound',
      });
    };
  }

  /**
   * 根据当前上下文数据原始router
   * 创建一个新的naviagation实例
   */
  getNavigation(props) {
    const { router } = props;
    const state = props.navigation.state;
    const navigation = addNavigationHelpers({ state: state, dispatch: this.dispatch })
    const screenNavigation = addNavigationHelpers({ ...navigation, state: state.routes[state.index] });
    const { title } = router.getScreenOptions(screenNavigation, {});
    const route = state.routes[state.index];
    //同步强刷浏览器丢失的params参数
    route.params = state.params = route.params || state.params || NavigateHelper.getRouteParams();
    title && (document.title = title);
    this.navigation = navigation;
    return navigation;
  }

  /**
   * 执行传入的action
   * @param {*} action 
   */
  dispatch(action) {
    const { router, navigation } = this.props;
    this.action = action;
    switch (action.type) {
      case NavigationActions.BACK:
        action.isHistory = true;
        window.history.back();
        break;
      case NavigationActions.RESET:
        {
          action.isHistory = true;
          const current = action.actions[action.index];
          const screenNavigation = addNavigationHelpers({ ...navigation, state: { routeName: current.routeName } });
          action.payload = router.getScreenOptions(screenNavigation, {});
        }
        break;
      case NavigationActions.NAVIGATE:
        {
          const screenNavigation = addNavigationHelpers({ ...navigation, state: { routeName: action.routeName } });
          action.payload = router.getScreenOptions(screenNavigation, {});
        }
        break;
      default:
        break;
    }
    this.context.store.dispatch(action);
  }

  /**
   * 获取传入action对应的URL
   * @param {Object} action 
   */
  getURIForAction(action) {
    const { router } = this.props;
    const state = router.getStateForAction(action, this.state) || this.state;
    return this.getURI(state);
  }

  /**
   * 根据当前state获取对应的URL
   * @param {*} state 
   */
  getURI(state) {
    const { router } = this.props;
    const { path } = router.getPathAndParamsForState(state);
    const pathRoot = NavigateHelper.getPathRoot();
    const url = NavigateHelper.getLocationPath();
    const webRoot = pathRoot ? pathRoot + '/' : '';
    const qs = url.indexOf('?') > -1 ? '?' + url.split('?').slice(1) : '';
    const pathName = path === "/" ? "" : path;
    switch (NavigateHelper.getMode()) {
      case 'hash':
        return `#${webRoot}${pathName}` + qs;
      default:
        return `/${webRoot}${pathName}` + qs;
    }
  }

  /**
   * 根据路径和参数获取对应的action
   * @param {*} path 当前请求的路径
   * @param {*} params 配置参数
   */
  getActionForPathAndParams(path, params) {
    return this.props.router.getActionForPathAndParams(path, params);
  }

  /**
   * 定义子组件共享数据
   */
  getChildContext() {
    return {
      //根据路径和参数获取对应的action
      getActionForPathAndParams: this.getActionForPathAndParams,
      //根据action获取对应的显示的uri字符串
      getURIForAction: this.getURIForAction,
      //执行action
      dispatch: this.dispatch,
      navigation: this.navigation
    };
  }

  /**
   * 组件开始渲染前
   */
  componentWillMount() {
    const { state } = this.props.navigation;
    //在强刷浏览器情况下恢复历史记录
    const initialState = NavigateHelper.getRouteState() || state;
    if (initialState) {
      this.dispatch(NavigationActions.reset({
        index: initialState.index,
        actions: (initialState.routes || []).map((r) => NavigationActions.navigate({ params: r.params, routeName: r.routeName || r }))
      }))
    }
  }

  /**
   * 组件第一次渲染完毕，
   * 绑定onpopstate事件，用于执行对应的action
   */
  componentDidMount() {
    const context = { event: '' };
    switch (NavigateHelper.getMode()) {
      case 'hash':
        context.event = 'hashchange'
        break;
      default:
        context.event = 'popstate'
    }
    window.addEventListener(context.event, (ev) => {
      ev.preventDefault();
      this.dispatch({
        ...this.getActionForPathAndParams(NavigateHelper.getInitialRouteName()),
        isHistory: true
      });
    });
  }

  /**
   * 当路由发生改变时
   * @param {*} props 新的props
   */
  componentWillUpdate(props) {
    const navigation = this.getNavigation(props);
    const { state } = navigation;
    const { router } = props;
    const route = state.routes[state.index];
    const uri = this.getURI(state);
    const { isHistory, isReplacement, isReload } = this.action;
    const isPush = !isHistory && !isReplacement;
    const state2 = router.getPathAndParamsForState(state);
    route.routeName = this.action.aliasName || route.aliasName || route.routeName;
    route.params = route.params || this.action.params || {};
    if (isReplacement) {
      const { index, routes } = state;
      state.index = index > 1 ? index - 1 : 0;
      routes[routes.length - 2] = routes[routes.length - 1];
      routes.pop();
    }
    if (isReload) {
      return;
    } else if (isPush) {
      NavigateHelper.push(uri, state2, state)
    } else if (!history.state || isReplacement) {
      NavigateHelper.replace(uri, state2, state);
    }
    this.status = "ok";
  }

  /**
   * 路由更新完毕，设置当前的历史记录id
   */
  componentDidUpdate() {
    setTimeout(() => {
      NavigateHelper.setCurrentStateID((window.history.state || {}).id);
    })
  }

  /**
   * 自定义路由组件渲染
   */
  render() {
    const { router } = this.props;
    const navigation = this.getNavigation(this.props);
    const { state } = navigation;
    const { path } = router.getPathAndParamsForState(state);
    const pathName = path;
    const routeName = state.routes[state.index].routeName;
    const isForward = NavigateHelper.isForward()
    if (this.status === "init") {
      return '';
    } else {
      return (
        <RouterView navigation={navigation} route={routeName} url={pathName} router={router} isForward={isForward} />
      )
    }
  }
}