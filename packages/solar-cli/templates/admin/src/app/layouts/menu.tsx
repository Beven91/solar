import React from 'react';
import { UserOutlined, SettingOutlined } from '@ant-design/icons';
import { AbstractMenuType } from 'solar-pc/src/interface';

export default [
  {
    icon: <UserOutlined />,
    name: '引导页',
    key: 'home',
    href: '#/',
  },
  {
    icon: <SettingOutlined />,
    name: '列表页',
    key: 'example',
    href: '#/example/list',
  },
] as AbstractMenuType[];
