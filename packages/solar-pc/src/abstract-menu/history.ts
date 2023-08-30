import { AbstractMenuType } from '../interface';

type Handler = () => void

const pushState = history.pushState;
const replaceState = history.replaceState;
const handlers = [] as Handler[];

history.pushState = function(...args: any[]) {
  const result = pushState.call(history, ...args);
  handlers.forEach((handler) => handler());
  return result;
};

history.replaceState = function(...args: any[]) {
  return replaceState.call(history, ...args);
};

function addListen(handler: Handler) {
  window.addEventListener('popstate', handler);
  handlers.push(handler);
}

function removeListen(handler: Handler) {
  const index = handlers.indexOf(handler);
  if (index > -1) {
    handlers.splice(index, 1);
  }
  window.removeEventListener('popstate', handler);
}

export function levelMatch(href: string, route: string) {
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

export function systemRouteMatch(route: string, flatMenus: AbstractMenuType[]) {
  const best = { length: 0, menu: null as AbstractMenuType };
  flatMenus.forEach((menu) => {
    const length = levelMatch(menu.href || '', route);
    if (length > 0 && best.length < length) {
      best.length = length;
      best.menu = menu;
    }
  });
  return best.menu;
}

export function fullUrlMatch(menu: AbstractMenuType, route: string) {
  if (menu.href == '') {
    return false;
  }
  return (menu.href === route);
}

export function matchUrlLikeMatch(menus: AbstractMenuType[], route:string, match: (menu:AbstractMenuType, route:string)=>boolean) {
  const findMenus = menus.filter((m) => match(m, route));
  if (findMenus.length < 1) {
    return systemRouteMatch(route, menus);
  }
  let menu = findMenus[0];
  for (let i=1; i<findMenus.length; i++) {
    const nextMenu = findMenus[i];
    if (nextMenu.href.length > menu.href.length) {
      menu = nextMenu;
    }
  }
  return menu;
}

export function defaultUrlMatch(menu: AbstractMenuType, route: string) {
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

export function flat(menus: AbstractMenuType[], parent?: AbstractMenuType, root?: AbstractMenuType) {
  const elements = [] as AbstractMenuType[];
  menus.forEach((menu) => {
    menu.parent = parent;
    menu.root = root;
    menu.label = menu.title;
    elements.push(menu);
    if (menu.children && menu.children.length > 0) {
      root = root ? root : menu;
      elements.push(...flat(menu.children, menu, root));
      menu.children = menu.children.filter((m) => m.virtual != true);
      menu.children = menu.children.length < 1 ? undefined : menu.children;
    }
  });
  return elements;
}

export default {
  addListen,
  removeListen,
};