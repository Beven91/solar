/**
 * @module Layout
 * @description 后台系统母版组件
 */
import './index.scss';
import React from 'react';
import { Layout, Avatar, Dropdown, Menu, Spin } from 'antd';
import { AbstractMenu, Exception, CrashProvider, OverridePageHeader } from 'solar-pc';
import { Profile } from '$projectName$-provider';
import { UserOutlined, SettingOutlined, LoginOutlined, ApiOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
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

  subRootRef = React.createRef<HTMLDivElement>();

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
  };

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
  };

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
  );

  render2() {
    const { collapsed, activeMenu, mode } = this.state;
    const routes = activeMenu?.paths.map((item) => {
      return {
        path: item.href,
        breadcrumbName: item.name,
      };
    });
    return (
      <Layout className="solar-layout">
        <Sider
          theme="dark"
          width={280}
          collapsedWidth={104}
          className={`solar-sider ${collapsed ? 'solar-collapsed' : ''}`}
          collapsed={collapsed}
          onCollapse={this.onCollapse}
        >
          <div className="solar-logo">
            <img src={logoIcon} />
          </div>
          <AbstractMenu
            theme="dark"
            mode="inline"
            onSelect={this.readyChildApp}
            loadMenus={this.readyMenus}
          />
        </Sider>
        <Layout className="solar-content-wrapper">
          <Header className="solar-header">
            <div className="solar-left">
              {
                collapsed ?
                  <MenuUnfoldOutlined onClick={() => this.onCollapse(false)} /> :
                  <MenuFoldOutlined onClick={() => this.onCollapse(true)} />
              }
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
          <Content className="solar-content">
            <OverridePageHeader.Container>
              <OverridePageHeader.PageHeader
                className="page-header"
                title={activeMenu?.menu?.name || ''}
                subTitle={activeMenu?.menu?.desc || ''}
                breadcrumb={{ routes }}
              />
              <Exception
                hidden={mode !== 'error'}
                type="500"
                onClick={() => this.readyChildApp(this.state.retryMenu)}
                btnText="重试"
                title="加载子应用失败"
                desc="您可以点击重新试试"
              />
              <Spin className="system-spinning" spinning={mode === 'loading'} />
              <CrashProvider>
                <div ref={this.subRootRef} className="solar-inner-content">{this.props.children}</div>
              </CrashProvider>
            </OverridePageHeader.Container>
          </Content>
        </Layout>
      </Layout >
    );
  }
}
