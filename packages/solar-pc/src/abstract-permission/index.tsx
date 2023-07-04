/**
 * @module AbstractPermission
 * @description 权限上下文组件
 */
import React, { useContext, useEffect, useState } from 'react';
import Permission, { PermissionProps } from './permission';
import { Spin } from 'antd';
import PermissionContext, { PermissionContextModel, PermissionUser } from './context';

export interface AbstractPermissionProps {
  // 初始化用户权限信息，注意：该函数仅在初始化时调用一次。
  initPermission?: () => Promise<PermissionUser> | PermissionUser
  // 没有权限时的自定义内容渲染
  failRender?: () => React.ReactElement
  // 如果private-route 没有权限是的自定义渲染内容
  failRotueRender?: () => React.ReactElement
  // 用户权限信息
  user?: PermissionUser
}

export interface AbstractPermissionState {
  loading: boolean
  user: PermissionUser
}

export default function AbstractPermission(props: React.PropsWithChildren<AbstractPermissionProps>) {
  const [loading, setLoading] = useState(!!props.initPermission);
  const [user, setUser] = useState(props.user);

  const permissionContext: PermissionContextModel = {
    loading: loading,
    user: user,
    failRotueRender: props.failRotueRender,
    failRender: props.failRender,
    refresh: () => {
      loadPermissions();
    },
    hasPermission(...roles: string[]) {
      const userRoles = user?.roles || {};
      return !!roles.find((role) => !!userRoles[role]);
    },
    updateUser: (user: PermissionUser) => {
      setUser(user);
    },
  };

  const loadPermissions = () => {
    const { initPermission } = props;
    if (!initPermission) return;
    setLoading(true);
    Promise
      .resolve(initPermission())
      .then((user: PermissionUser) => {
        setUser(user);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {setUser(props.user);}, [props.user]);
  useEffect(() => {loadPermissions();}, []);


  const renderLoading = () => {
    return (
      <Spin style={{ paddingTop: 120, height: '100%', width: '100%' }} spinning></Spin>
    );
  };

  return (
    <PermissionContext.Provider
      value={permissionContext}
    >
      {loading ? renderLoading() : props.children}
    </PermissionContext.Provider>
  );
}

/**
 * 权限容器子组件，改组件可配置，当前组件内容在什么角色可见
 */
AbstractPermission.Permission = Permission;

/**
 * 权限数据上下文
 */
AbstractPermission.Context = PermissionContext;

AbstractPermission.Consumer = PermissionContext.Consumer;

/**
 * 创建一个带授权验证的组件
 * @param Component
 * @returns
 */
AbstractPermission.createPermissionView = function createPermissionView<T>(Component: React.FC | React.ComponentClass, isRoute = false) {
  return function PermissionWrapView({ roles, ...props }: T & { roles: PermissionProps['roles'] }) {
    const context = useContext(PermissionContext);
    const failRender = isRoute ? context.failRotueRender : context.failRender;
    return (
      <AbstractPermission.Permission failRender={failRender} roles={roles} >
        {<Component {...props} />}
      </AbstractPermission.Permission>
    );
  };
};