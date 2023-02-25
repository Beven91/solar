/**
 * @module Layout
 * @description 后台系统母版组件
 */
import './index.scss';
import React, { useCallback, useState } from 'react';
import { Layout, Avatar, Dropdown, Menu } from 'antd';
import { AbstractMenu, CrashProvider, OverridePageHeader } from 'solar-pc';
import { Profile } from '$projectName$-provider';
import { UserOutlined, SettingOutlined, LoginOutlined, MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons';
import { SelectMenuInfo } from 'solar-pc/src/abstract-menu';
import menus from './menu';
import logoIcon from './images/logo.svg';
import { useMiniLayout } from './hooks';

const defaultAvatar = logoIcon;
const { Content, Header, Sider } = Layout;

function NavMenus() {
  const onLogout = useCallback(() => {
    Profile.exit();
    location.href = '/#login';
  }, []);

  return (
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
      <Menu.Item onClick={onLogout} className="menu-top-border">
        <LoginOutlined />
        退出登录
      </Menu.Item>
    </Menu>
  );
}

export default function SolarLayout(props: React.PropsWithChildren) {
  const [activeMenu, setActiveMenu] = useState<SelectMenuInfo>(null);
  const { requestMiniCollapsed, collapsed, setCollapsed } = useMiniLayout();
  const routes = activeMenu?.paths.map((item) => {
    return {
      path: item.href,
      breadcrumbName: item.name,
    };
  });

  const onMenuActived = (info: any) => {
    setActiveMenu(info);
    requestMiniCollapsed();
  };

  return (
    <Layout className="solar-layout">
      <Sider
        theme="dark"
        width={280}
        collapsedWidth={104}
        className={`solar-sider ${collapsed ? 'collapsed' : 'expanded'}`}
        collapsed={collapsed}
        onCollapse={setCollapsed}
      >
        <div className="solar-logo">
          <img src={logoIcon} />
        </div>
        <AbstractMenu
          theme="dark"
          mode="inline"
          onSelect={onMenuActived}
          loadMenus={() => menus}
        />
      </Sider>
      <Layout className="solar-content-wrapper">
        <Header className="solar-header">
          <div className="solar-left">
            {
              collapsed ? <MenuUnfoldOutlined onClick={() => setCollapsed(false)} /> : <MenuFoldOutlined onClick={() => setCollapsed(true)} />
            }
          </div>
          <div className="solar-right">
            <Dropdown overlay={<NavMenus />} placement="bottomLeft">
              <div>
                <Avatar size={24} src={Profile.avatar || defaultAvatar} />
                <span className="avatar-name">{Profile.userName}</span>
              </div>
            </Dropdown>
            <sub className="app-version">{process.env.VERSION || ''}</sub>
          </div>
        </Header>
        <Content className="solar-content" onClick={requestMiniCollapsed}>
          <OverridePageHeader.Container>
            <OverridePageHeader.PageHeader
              className="page-header"
              title={activeMenu?.menu?.title || ''}
              subTitle={activeMenu?.menu?.desc || ''}
              breadcrumb={{ routes }}
              extra={<div id="PAGE_HEAD_ACTIONS"></div>}
            />
            <CrashProvider>
              <div className="solar-inner-content">{props.children}</div>
            </CrashProvider>
          </OverridePageHeader.Container>
        </Content>
      </Layout>
    </Layout >
  );
}
