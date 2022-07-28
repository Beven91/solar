/**
 * @module Layout
 * @description 后台系统母版组件
 */
import './index.scss';
import React from 'react';
import { Layout, Avatar, Dropdown, Menu, Spin, Breadcrumb } from 'antd';
import { AbstractMenu, Exception } from 'solar-pc';
import { Profile } from '$projectName$-provider';
import { UserOutlined, SettingOutlined, LoginOutlined, ApiOutlined, HomeOutlined } from '@ant-design/icons';
import { SelectMenuInfo } from 'solar-pc/src/abstract-menu';
import config from '$projectName$-configs';
import { SystemRegistration } from 'solar-core';
import menus from './menu';
import logoIcon from './images/logo.svg';
import defaultAvatar from './images/avatar.jpg';

const { Content, Header, Sider } = Layout;

export interface LayoutState {
  collapsed: boolean
  mode: 'loading' | 'error' | 'ok',
  activeMenu: SelectMenuInfo
  retryMenu: SelectMenuInfo
}

export default class DawnLayout extends React.Component<any, LayoutState> {
  // 调试配置
  get mainAppDebugger() {
    return ((window as any).MainAppDebugger || {}) as MainAppDebuggerModel;
  }

  state: LayoutState = {
    collapsed: false,
    activeMenu: null,
    retryMenu: null,
    mode: 'ok',
  };

  subRootRef = React.createRef<HTMLDivElement>()

  handleLoginOut = () => {
    Profile.exit();
    location.href = '/#login';
  };

  onCollapse = (collapsed: boolean) => {
    this.setState({ collapsed });
  };

  getAppLoader(name: string) {
    const debugApp = this.mainAppDebugger.name;
    if (debugApp == name) {
      // 这里为了方便，子应用调试，所以进行调式附加
      return config.DEBUGGER_SYSTEM_BASE;
    }
    return config.SYSTEM_BASE;
  }

  readyChildApp = (data: SelectMenuInfo) => {
    const menu = data.menu;
    const system = menu ? menu.system || (menu.root || {}).system : null;
    if (system) {
      // 进入当前菜单需要的子系统
      this.setState({ mode: 'loading' });
      // 执行子系统
      SystemRegistration
        .invoke(system, {
          base: this.getAppLoader(system),
          context: {
            root: this.subRootRef.current,
          },
        })
        .then(
          () => this.setState({ mode: 'ok', retryMenu: null }),
          () => this.setState({ mode: 'error', retryMenu: data })
        );
    } else {
      // 切换到其他菜单，需要销毁正在运行的子系统
      SystemRegistration.exitRunnings();
    }
    this.setState({ activeMenu: data });
  }

  readyMenus = () => {
    const mainAppDebugger = this.mainAppDebugger;
    if (!mainAppDebugger.menu) {
      return menus;
    }
    // 本地调试入口
    const debugMenu = mainAppDebugger.menu;
    const findMenu = menus.find((m) => m.href == debugMenu.href);
    if (findMenu) {
      return menus;
    }
    return [
      {
        name: debugMenu.name || '子应用调试入口',
        href: debugMenu.href,
        system: mainAppDebugger.name,
        key: 'debugger-entry',
        icon: <ApiOutlined />,
      },
      ...menus,
    ];
  }

  overlayMenus = (
    <Menu style={{ width: 140 }}>
      <Menu.Item>
        <a>
          <UserOutlined />
          个人中心
        </a>
      </Menu.Item>
      <Menu.Item>
        <a>
          <SettingOutlined />
          个人设置
        </a>
      </Menu.Item>
      <Menu.Item onClick={this.handleLoginOut} className="menu-top-border">
        <LoginOutlined />退出登录
      </Menu.Item>
    </Menu>
  )

  renderBreadcrumb() {
    const { activeMenu } = this.state;
    if (!activeMenu) return null;
    return (
      <Breadcrumb className="layout-bread-crumb">
        <Breadcrumb.Item href="">
          <HomeOutlined />
        </Breadcrumb.Item>
        {
          activeMenu.paths.map((item: any, i: number) => (
            <Breadcrumb.Item key={i} href={item.href}>
              {item.name}
            </Breadcrumb.Item>
          ))
        }
      </Breadcrumb>
    );
  }

  // 渲染母版组件
  render() {
    const { collapsed, mode } = this.state;
    return (
      <Layout className="solar-layout">
        <Header className="solar-header">
          <div className="solar-left">
            <img src={logoIcon} className="solar-logo" />
          </div>
          <div className="solar-right">
            <Dropdown overlay={this.overlayMenus} placement="bottomLeft">
              <div>
                <Avatar size={24} src={Profile.avatar || defaultAvatar} />
                <span className="avatar-name">{Profile.userName}</span>
              </div>
            </Dropdown>
            <sub className="app-version">{process.env.VERSION || ''}</sub>
          </div>
        </Header>
        <Layout className="solar-content-wrapper">
          <Sider
            theme="light"
            width={308}
            className="solar-sider"
            collapsible
            collapsed={collapsed}
            onCollapse={this.onCollapse}
          >
            <AbstractMenu
              theme="light"
              mode="inline"
              onSelect={this.readyChildApp}
              loadMenus={this.readyMenus}
            />
          </Sider>
          <Content className="solar-content">
            {this.renderBreadcrumb()}
            <Exception
              hidden={mode !== 'error'}
              type="500"
              onClick={() => this.readyChildApp(this.state.retryMenu)}
              btnText="重试"
              title="加载子应用失败"
              desc="您可以点击重新试试"
            />
            <Spin className="system-spinning" spinning={mode === 'loading'} />
            <div ref={this.subRootRef} className="solar-inner-content">{this.props.children}</div>
          </Content>
        </Layout>
      </Layout >
    );
  }
}
