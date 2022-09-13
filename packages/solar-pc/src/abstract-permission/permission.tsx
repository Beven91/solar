/**
 * @module Permssion
 * @description 权限容器
 */
import { Spin } from 'antd';
import React from 'react';
import PermissionContext, { PermissionContextModel } from './context';

export interface PermissionProps {
  // 当前权限需要的角色 多个角色可以使用 "," 号隔开
  roles: string | (() => string)
  // 无权限时的展示内容
  failRender?: (context: PermissionContextModel) => React.ReactElement
}

export default class Permission extends React.Component<React.PropsWithChildren<PermissionProps>> {
  get needRoles() {
    let roles = this.props.roles;
    if (typeof roles == 'function') {
      roles = roles();
    }
    return (roles || '').split(',');
  }

  render() {
    return (
      <PermissionContext.Consumer>
        {
          (context) => {
            if (context.loading) {
              return <Spin style={{ paddingTop: 120, height: '100%', width: '100%' }} spinning></Spin>;
            }
            const failRender = this.props.failRender || context.failRender;
            if (!context.hasPermission(...this.needRoles)) {
              // 如果没有权限
              return (
                <React.Fragment>
                  {failRender ? failRender(context) : null}
                </React.Fragment>
              );
            }
            // 展示子元素
            return (
              <React.Fragment>
                {this.props.children}
              </React.Fragment>
            );
          }
        }
      </PermissionContext.Consumer>
    );
  }
}
