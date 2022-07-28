/**
 * @module Permssion
 * @description 权限容器
 */
import React from 'react';
import PermissionContext, { PermissionContextModel } from './context';

export interface PermissionProps {
  // 当前权限需要的角色 多个角色可以使用 "," 号隔开
  roles: string
  // 无权限时的展示内容
  failRender?: (context: PermissionContextModel) => React.ReactElement
}

export default class AbstractPermission extends React.Component<React.PropsWithChildren<PermissionProps>> {
  get needRoles() {
    return (this.props.roles || '').split(',');
  }

  render() {
    return (
      <PermissionContext.Consumer>
        {
          (context) => {
            const failRender = this.props.failRender || context.failRender;
            const roles = (context.user || {}).roles || {};
            const hasPermission = this.needRoles.find((role) => !!roles[role]);
            if (!hasPermission) {
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
