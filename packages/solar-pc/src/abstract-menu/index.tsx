/**
 * @module AbstractMenu
 * @description 抽象菜单数据
 */

import React from 'react';
import { Menu } from 'antd';
import { AbstractMenuType } from '../interface';
import { MenuProps } from 'antd/lib/menu';
import { Adapter } from 'solar-core';
import { SelectInfo } from 'rc-menu/lib/interface';

const globalLink = document.createElement('a');

export interface SelectMenuInfo extends SelectInfo {
  menu: AbstractMenuType
  paths: AbstractMenuType[]
}

export interface AbstractMenuProps extends MenuProps {
  // 加载菜单
  loadMenus: () => Promise<AbstractMenuType[]> | AbstractMenuType[]
  // 自定义匹配菜单
  matchSelectedKey?: (menu: AbstractMenuType, route: string) => boolean
  // 选中指定菜单
  onSelect?: (data: SelectInfo) => void
  // 自定义菜单跳转
  onNavigate?: (menu: AbstractMenuType, info: SelectMenuInfo) => void
  // 路由模式
  type: 'hash' | 'browser'
}

export interface AbstractMenuState {
  menus: AbstractMenuType[],
  openKeys: string[]
  selectedKeys: string[]
}

export default class AbstractMenu extends React.Component<AbstractMenuProps, AbstractMenuState> {
  static defaultProps = {
    theme: 'dark',
    type: 'hash',
  };

  sychronizeHandler: any;

  constructor(props: AbstractMenuProps) {
    super(props);
    this.state = {
      menus: [],
      openKeys: [],
      selectedKeys: [],
    };
    this.loadAsync();
    this.sychronizeHandler = () => this.synchronizeRoute();
    switch (this.props.type) {
      case 'hash':
        window.addEventListener('hashchange', this.sychronizeHandler);
        break;
      case 'browser':
        window.addEventListener('popstate', this.sychronizeHandler);
        break;
    }
  }

  flatMenus: AbstractMenuType[];

  get menusMap() {
    return this.flatMenus.reduce((data: any, current: AbstractMenuType) => {
      data[current.key] = current;
      return data;
    }, {});
  }

  get route() {
    switch (this.props.type) {
      case 'hash':
        return location.hash;
      default:
        return location.pathname;
    }
  }

  levelMatch(href: string, route: string) {
    // 如果是子系统，则进行前缀匹配
    const segments = route.split('/');
    segments.pop();
    while (segments.length > 0) {
      const url = segments.join('/');
      if (href.indexOf(url) > -1) {
        return segments.length;
      }
      segments.pop();
    }
  }

  systemRouteMatch(route: string) {
    const best = { length: 0, menu: null as AbstractMenuType };
    this.flatMenus.forEach((menu) => {
      const length = this.levelMatch(menu.href || '', route);
      if (length > 0 && best.length < length) {
        best.length = length;
        best.menu = menu;
      }
    });
    return best.menu;
  }

  defaultUrlMatch = (menu: AbstractMenuType, route: string) => {
    if (menu.href == '') {
      return false;
    }
    if (menu.href === route) {
      return true;
    }
    const path = route.replace('#', '');
    const url = menu.href?.split('/').map((v) => {
      return v[0] == ':' ? '(\\w|\\d|-)+' : v;
    }).join('/');
    return new RegExp('^' + url).test(path);
  };

  synchronizeRoute = (menus?: AbstractMenuType[]) => {
    const route = this.route;
    const { matchSelectedKey } = this.props;
    const match = matchSelectedKey || this.defaultUrlMatch;
    const menu = this.flatMenus.find((m) => match(m, route)) || this.systemRouteMatch(route);
    let selectedKeys = [] as AbstractMenuType[];
    let element = menu;
    while (element) {
      selectedKeys.push(element);
      element = element.parent;
    }
    selectedKeys = selectedKeys.reverse();
    this.setState({
      menus: menus || this.state.menus,
      openKeys: selectedKeys.slice(0, -1).map((m) => m.key),
      selectedKeys: selectedKeys.map((m) => m.key),
    }, () => {
      if (selectedKeys.length > 0) {
        this.onSelect({
          key: selectedKeys[selectedKeys.length - 1].key as any,
          selectedKeys: this.state.selectedKeys,
        } as any);
      }
    });
  };

  loadAsync() {
    const { loadMenus: load } = this.props;
    if (load) {
      Promise
        .resolve(load())
        .then((menus: Array<AbstractMenuType>) => {
          this.flatMenus = this.flat(menus);
          this.synchronizeRoute(menus);
        });
    }
  }

  flat(menus: AbstractMenuType[], parent?: AbstractMenuType, root?: AbstractMenuType) {
    const elements = [] as AbstractMenuType[];
    menus.forEach((menu) => {
      menu.parent = parent;
      menu.root = root;
      menu.label = menu.title;
      elements.push(menu);
      if (menu.children && menu.children.length > 0) {
        root = root ? root : menu;
        elements.push(...this.flat(menu.children, menu, root));
        menu.children = menu.children.filter((m) => m.virtual != true);
        menu.children = menu.children.length < 1 ? undefined : menu.children;
      }
    });
    return elements;
  }

  onSelect = (data: SelectInfo) => {
    const { onSelect } = this.props;
    const info = data as SelectMenuInfo;
    const map = this.menusMap;
    const menu = this.flatMenus.find((m) => m.key == data.key);
    info.menu = menu;
    info.paths = data.selectedKeys.map((k) => map[k]);
    onSelect && onSelect(info);
    this.setState({
      selectedKeys: data.selectedKeys as any,
    });
  };

  onOpenChanged = (keys: string[]) => {
    this.setState({
      openKeys: keys,
    });
  };

  onClickItem = (info: SelectMenuInfo) => {
    const { onNavigate } = this.props;
    const menu = this.flatMenus.find((m) => m.key == info.key);
    if (!menu) {
      return;
    }
    if (onNavigate) {
      onNavigate(menu, info);
    } else if (menu?.href) {
      globalLink.href = menu.href;
      globalLink.target = menu.target || '_self';
      globalLink.click();
    }
  };

  componentWillUnmount() {
    window.removeEventListener('hashchange', this.sychronizeHandler);
    window.removeEventListener('popstate', this.sychronizeHandler);
  }

  render() {
    const { openKeys, selectedKeys, menus } = this.state;
    return (
      <Menu
        {...Adapter.filter(this.props, 'route', 'matchSelectedKey', 'loadMenus')}
        onSelect={this.onSelect}
        onOpenChange={this.onOpenChanged}
        openKeys={openKeys}
        onClick={this.onClickItem}
        selectedKeys={selectedKeys}
        items={menus}
      />
    );
  }
}

