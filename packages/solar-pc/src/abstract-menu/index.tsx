/**
 * @module AbstractMenu
 * @description 抽象菜单数据
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Menu } from 'antd';
import { AbstractMenuType } from '../interface';
import { MenuProps } from 'antd/lib/menu';
import { Adapter } from 'solar-core';
import { SelectInfo } from 'rc-menu/lib/interface';
import history, { defaultUrlMatch, flat, systemRouteMatch } from './history';

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
  type?: 'hash' | 'browser'
}

const getRoute = (type: AbstractMenuProps['type']) => {
  switch (type) {
    case 'hash':
      return location.hash;
    default:
      return location.pathname;
  }
};

export interface AbstractMenuState {
  menus: AbstractMenuType[],
  openKeys: string[]
  selectedKeys: string[]
}

export default function AbstractMenu({
  theme = 'dark',
  type = 'hash',
  ...props
}: AbstractMenuProps) {
  const [menus, setMenus] = useState<AbstractMenuType[]>([]);
  const [openKeys, setOpenKeys] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [memo] = useState({ flatMenus: [] as AbstractMenuType[] });

  useEffect(() => {
    loadAsync();
  }, []);

  useEffect(() => {
    const sychronizeHandler = () => synchronizeRoute();
    switch (type) {
      case 'hash':
        window.addEventListener('hashchange', sychronizeHandler);
        break;
      case 'browser':
        history.addListen(sychronizeHandler);
        break;
    }
    return () => {
      window.removeEventListener('hashchange', sychronizeHandler);
      history.removeListen(sychronizeHandler);
    };
  }, [type]);

  const synchronizeRoute = () => {
    const flatMenus = memo.flatMenus;
    const { matchSelectedKey } = props;
    const route = getRoute(type);
    const match = matchSelectedKey || defaultUrlMatch;
    const menu = flatMenus.find((m) => match(m, route)) || systemRouteMatch(route, flatMenus);
    let selectedKeys = [] as AbstractMenuType[];
    let element = menu;
    while (element) {
      selectedKeys.push(element);
      element = element.parent;
    }
    selectedKeys = selectedKeys.reverse();
    const activeKeys = selectedKeys.map((m) => m.key);
    setOpenKeys(selectedKeys.slice(0, -1).map((m) => m.key));
    setSelectedKeys(activeKeys);

    if (selectedKeys.length > 0) {
      onSelect({
        key: selectedKeys[selectedKeys.length - 1].key as any,
        selectedKeys: activeKeys,
      } as any);
    }
  };

  const loadAsync = () => {
    const { loadMenus } = props;
    if (loadMenus) {
      Promise
        .resolve(loadMenus())
        .then((menus: Array<AbstractMenuType>) => {
          memo.flatMenus = flat(menus);
          synchronizeRoute();
          setMenus(menus);
        });
    }
  };

  const onSelect = (data: SelectInfo) => {
    const { onSelect } = props;
    const info = data as SelectMenuInfo;
    const flatMenus = memo.flatMenus;
    const map = flatMenus.reduce((data: any, current: AbstractMenuType) => {
      data[current.key] = current;
      return data;
    }, {});
    const menu = flatMenus.find((m) => m.key == data.key);
    info.menu = menu;
    info.paths = data.selectedKeys.map((k) => map[k]);
    onSelect && onSelect(info);
    setSelectedKeys(data.selectedKeys);
  };

  const onClickItem = useCallback((info: SelectMenuInfo) => {
    const { onNavigate } = props;
    const flatMenus = memo.flatMenus;
    const menu = flatMenus.find((m) => m.key == info.key);
    if (!menu) return;
    if (onNavigate) {
      onNavigate(menu, info);
    } else if (menu?.href) {
      globalLink.href = menu.href;
      globalLink.target = menu.target || '_self';
      globalLink.click();
    }
  }, [props.onNavigate, memo.flatMenus]);

  return (
    <Menu
      {...Adapter.filter(props, 'route', 'matchSelectedKey', 'loadMenus', 'onNavigate')}
      theme={theme}
      onSelect={onSelect}
      onOpenChange={setOpenKeys}
      openKeys={openKeys}
      onClick={onClickItem}
      selectedKeys={selectedKeys}
      items={menus}
    />
  );
}

