/**
 * @module Layout
 * @description 后台系统母版组件
 */
import './index.scss';
import React, { useCallback, useState } from 'react';
import { Layout, Avatar, Dropdown, Menu, Breadcrumb } from 'antd';
import { AbstractMenu } from 'solar-pc';
import { Profile } from '$projectName$-provider';
import { UserOutlined, SettingOutlined, LoginOutlined, HomeOutlined } from '@ant-design/icons';
import { SelectMenuInfo } from 'solar-pc/src/abstract-menu';
import menus from './menu';
import logoIcon from './images/logo.svg';
import defaultAvatar from './images/avatar.jpg';

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

export default function FluxyLayout(props: React.PropsWithChildren) {
  const [activeMenu, setActiveMenu] = useState<SelectMenuInfo>(null);
  const [collapsed, setCollapsed] = useState<boolean>(false);

  return (
    <Layout className="solar-layout">
      <Header className="solar-header">
        <div className="solar-left">
          <img src={logoIcon} className="solar-logo" />
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
      <Layout className="solar-content-wrapper">
        <Sider
          theme="light"
          width={308}
          className="solar-sider"
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
        >
          <AbstractMenu
            theme="light"
            mode="inline"
            onSelect={setActiveMenu as any}
            loadMenus={() => menus}
          />
        </Sider>
        <Content className="solar-content">
          <Breadcrumb className="layout-bread-crumb">
            <Breadcrumb.Item href="">
              <HomeOutlined />
            </Breadcrumb.Item>
            {
              activeMenu?.paths.map((item: any, i: number) => (
                <Breadcrumb.Item key={i} href={item.href}>
                  {item.name}
                </Breadcrumb.Item>
              ))
            }
          </Breadcrumb>
          <div className="solar-inner-content">{props.children}</div>
        </Content>
      </Layout>
    </Layout >
  );
}
